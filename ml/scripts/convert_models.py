#!/usr/bin/env python3
"""
Model Export Script: PyTorch → ONNX → TFLite

Converts the UNIDO rice quality models for mobile deployment.

Usage:
    python convert_models.py --checkpoint model1.ckpt --mobile-size 384
    python convert_models.py --all --mobile-size 384

The exported models use a fixed 384x384 input size suitable for mobile
devices. Quality may differ from the full-resolution training models.
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

import torch
import torch.nn as nn
import timm

# Add project root to path for imports
ROOT = Path(__file__).resolve().parents[2]
UNIDO_ROOT = ROOT.parent / "UNIDO_FINAL"
sys.path.insert(0, str(UNIDO_ROOT))

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
LOG = logging.getLogger("convert")


class RiceRegressorMobile(nn.Module):
    """
    Standalone mobile-friendly version of RiceRegressor.
    
    This version is self-contained (no external imports needed) and
    optimized for ONNX/TFLite export with fixed batch size and
    simpler comment handling.
    """

    def __init__(
        self,
        model_name: str = "convnextv2_nano.fcmae_ft_in22k_in1k",
        num_targets: int = 15,
        pretrained: bool = False,
        drop_rate: float = 0.1,
        num_comments: int = 3,
        comment_emb_dim: int = 32,
    ):
        super().__init__()
        
        # Create backbone
        self.backbone = timm.create_model(
            model_name, pretrained=pretrained, num_classes=0, global_pool="avg"
        )
        
        # Comment embedding
        self.comment_emb = nn.Embedding(num_comments, comment_emb_dim)
        
        # Per-comment bias
        self.comment_bias = nn.Embedding(num_comments, num_targets)
        
        # Regression head  
        in_dim = self.backbone.num_features + comment_emb_dim
        self.head = nn.Sequential(
            nn.Dropout(p=drop_rate),
            nn.Linear(in_dim, num_targets),
        )
    
    def forward(self, x: torch.Tensor, comment_idx: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: Image tensor [B, 3, H, W]
            comment_idx: Rice type index [B] (0=Paddy, 1=Brown, 2=White)
        
        Returns:
            Predictions [B, num_targets]
        """
        feats = self.backbone(x)
        c = self.comment_emb(comment_idx)
        pred = self.head(torch.cat([feats, c], dim=1))
        return pred + self.comment_bias(comment_idx).to(dtype=pred.dtype)


class CombinedRiceModel(nn.Module):
    """
    Combined model that merges all 4 specialist models into one.
    
    This simplifies mobile deployment by requiring only a single model file.
    Each specialist's predictions are concatenated in the correct order.
    """
    
    # Target order matching the training configuration
    TARGET_ORDER = [
        "Count", "Broken_Count", "Long_Count", "Medium_Count",
        "Black_Count", "Chalky_Count", "Red_Count", "Yellow_Count", "Green_Count",
        "WK_Length_Average", "WK_Width_Average", "WK_LW_Ratio_Average",
        "Average_L", "Average_a", "Average_b"
    ]
    
    # Which model predicts which targets (0-indexed)
    MODEL_TARGETS = {
        1: ["Red_Count", "Yellow_Count"],
        2: ["Chalky_Count", "Green_Count"],
        3: ["Broken_Count", "Long_Count", "Black_Count", "Count"],
        4: ["Medium_Count", "WK_Length_Average", "WK_Width_Average", 
            "WK_LW_Ratio_Average", "Average_L", "Average_a", "Average_b"],
    }
    
    def __init__(
        self,
        model_name: str = "convnextv2_nano.fcmae_ft_in22k_in1k",
        pretrained: bool = False,
    ):
        super().__init__()
        
        # Create 4 specialist models
        self.model1 = RiceRegressorMobile(model_name, num_targets=2, pretrained=pretrained)
        self.model2 = RiceRegressorMobile(model_name, num_targets=2, pretrained=pretrained)
        self.model3 = RiceRegressorMobile(model_name, num_targets=4, pretrained=pretrained)
        self.model4 = RiceRegressorMobile(model_name, num_targets=7, pretrained=pretrained)
        
        # Build index mapping from model outputs to final target order
        self._build_output_mapping()
    
    def _build_output_mapping(self):
        """Create mapping from individual model outputs to combined output order."""
        self.output_indices = {}
        for model_num, targets in self.MODEL_TARGETS.items():
            for local_idx, target in enumerate(targets):
                global_idx = self.TARGET_ORDER.index(target)
                self.output_indices[(model_num, local_idx)] = global_idx
    
    def forward(self, x: torch.Tensor, comment_idx: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: Image tensor [B, 3, H, W]
            comment_idx: Rice type index [B]
        
        Returns:
            All 15 predictions [B, 15]
        """
        # Run all models
        out1 = self.model1(x, comment_idx)  # [B, 2]
        out2 = self.model2(x, comment_idx)  # [B, 2]
        out3 = self.model3(x, comment_idx)  # [B, 4]
        out4 = self.model4(x, comment_idx)  # [B, 7]
        
        # Combine outputs in correct order
        batch_size = x.shape[0]
        combined = torch.zeros(batch_size, 15, device=x.device, dtype=x.dtype)
        
        # Map each model's outputs to correct positions
        for local_idx in range(2):
            combined[:, self.output_indices[(1, local_idx)]] = out1[:, local_idx]
            combined[:, self.output_indices[(2, local_idx)]] = out2[:, local_idx]
        for local_idx in range(4):
            combined[:, self.output_indices[(3, local_idx)]] = out3[:, local_idx]
        for local_idx in range(7):
            combined[:, self.output_indices[(4, local_idx)]] = out4[:, local_idx]
        
        return combined


def load_checkpoint_weights(model: nn.Module, ckpt_path: Path, model_num: int) -> None:
    """Load weights from a training checkpoint into mobile model."""
    LOG.info(f"Loading checkpoint: {ckpt_path}")
    
    ckpt = torch.load(ckpt_path, map_location="cpu", weights_only=False)
    
    # The checkpoint structure has nested heads
    if "heads" not in ckpt:
        raise ValueError(f"Checkpoint missing 'heads' key: {ckpt_path}")
    
    # Get the first head's state dict (all heads share backbone weights)
    heads = ckpt["heads"]
    first_head_key = list(heads.keys())[0]
    state_dict = heads[first_head_key].get("state_dict", {})
    
    if not state_dict:
        raise ValueError(f"No state_dict found in checkpoint: {ckpt_path}")
    
    # Load compatible weights
    model_state = model.state_dict()
    loaded = 0
    for key, value in state_dict.items():
        if key in model_state and model_state[key].shape == value.shape:
            model_state[key] = value
            loaded += 1
    
    model.load_state_dict(model_state)
    LOG.info(f"Loaded {loaded}/{len(model_state)} parameters from checkpoint")


def export_to_onnx(
    model: nn.Module,
    output_path: Path,
    input_size: int = 384,
) -> None:
    """Export PyTorch model to ONNX format."""
    model.eval()
    
    # Create dummy inputs
    batch_size = 1
    dummy_image = torch.randn(batch_size, 3, input_size, input_size)
    dummy_comment = torch.zeros(batch_size, dtype=torch.long)
    
    LOG.info(f"Exporting to ONNX: {output_path}")
    
    torch.onnx.export(
        model,
        (dummy_image, dummy_comment),
        output_path,
        input_names=["image", "comment_idx"],
        output_names=["predictions"],
        dynamic_axes={
            "image": {0: "batch"},
            "comment_idx": {0: "batch"},
            "predictions": {0: "batch"},
        },
        opset_version=17,
        do_constant_folding=True,
    )
    
    LOG.info(f"ONNX export complete: {output_path}")


def convert_onnx_to_tflite(
    onnx_path: Path,
    output_path: Path,
    quantize: bool = True,
) -> None:
    """Convert ONNX model to TFLite format."""
    try:
        import onnx
        from onnx_tf.backend import prepare
        import tensorflow as tf
    except ImportError:
        LOG.error("Missing dependencies. Install: pip install onnx onnx-tf tensorflow")
        raise
    
    LOG.info(f"Converting ONNX to TFLite: {onnx_path} → {output_path}")
    
    # Load ONNX model
    onnx_model = onnx.load(str(onnx_path))
    
    # Convert to TensorFlow
    tf_rep = prepare(onnx_model)
    
    # Export to SavedModel
    saved_model_dir = output_path.parent / "temp_savedmodel"
    tf_rep.export_graph(str(saved_model_dir))
    
    # Convert to TFLite
    converter = tf.lite.TFLiteConverter.from_saved_model(str(saved_model_dir))
    
    if quantize:
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.target_spec.supported_types = [tf.float16]
    
    tflite_model = converter.convert()
    
    with open(output_path, "wb") as f:
        f.write(tflite_model)
    
    # Cleanup temp directory
    import shutil
    shutil.rmtree(saved_model_dir, ignore_errors=True)
    
    LOG.info(f"TFLite conversion complete: {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Convert rice models for mobile")
    parser.add_argument("--checkpoint", type=Path, help="Single checkpoint to convert")
    parser.add_argument("--all", action="store_true", help="Convert all 4 models")
    parser.add_argument("--combined", action="store_true", help="Create combined model")
    parser.add_argument("--mobile-size", type=int, default=384, help="Input size for mobile")
    parser.add_argument("--output-dir", type=Path, default=ROOT / "ml" / "models")
    parser.add_argument("--onnx-only", action="store_true", help="Skip TFLite conversion")
    parser.add_argument("--no-quantize", action="store_true", help="Skip FP16 quantization")
    
    args = parser.parse_args()
    
    args.output_dir.mkdir(parents=True, exist_ok=True)
    
    if args.combined:
        LOG.info("Creating combined mobile model...")
        model = CombinedRiceModel(pretrained=False)
        
        # Try to load weights from all checkpoints
        ckpt_dir = UNIDO_ROOT / "outputs" / "checkpoints"
        for i in range(1, 5):
            ckpt_path = ckpt_dir / f"model{i}.ckpt"
            if ckpt_path.exists():
                specialist = getattr(model, f"model{i}")
                try:
                    load_checkpoint_weights(specialist, ckpt_path, i)
                except Exception as e:
                    LOG.warning(f"Could not load model{i} weights: {e}")
        
        # Export
        onnx_path = args.output_dir / "rice_combined.onnx"
        export_to_onnx(model, onnx_path, args.mobile_size)
        
        if not args.onnx_only:
            tflite_path = args.output_dir / "rice_combined.tflite"
            convert_onnx_to_tflite(onnx_path, tflite_path, not args.no_quantize)
    
    elif args.all or args.checkpoint:
        checkpoints = []
        if args.all:
            ckpt_dir = UNIDO_ROOT / "outputs" / "checkpoints"
            checkpoints = list(ckpt_dir.glob("model*.ckpt"))
        elif args.checkpoint:
            checkpoints = [args.checkpoint]
        
        for ckpt_path in checkpoints:
            model_num = int(ckpt_path.stem.replace("model", ""))
            num_targets = len(CombinedRiceModel.MODEL_TARGETS[model_num])
            
            LOG.info(f"Converting {ckpt_path.name} ({num_targets} targets)")
            
            model = RiceRegressorMobile(num_targets=num_targets, pretrained=False)
            
            try:
                load_checkpoint_weights(model, ckpt_path, model_num)
            except Exception as e:
                LOG.warning(f"Could not load weights: {e}")
            
            onnx_path = args.output_dir / f"{ckpt_path.stem}.onnx"
            export_to_onnx(model, onnx_path, args.mobile_size)
            
            if not args.onnx_only:
                tflite_path = args.output_dir / f"{ckpt_path.stem}.tflite"
                convert_onnx_to_tflite(onnx_path, tflite_path, not args.no_quantize)
    
    else:
        parser.print_help()
        LOG.info("\nExample: python convert_models.py --combined --mobile-size 384")


if __name__ == "__main__":
    main()
