# Model Conversion Guide

This guide explains how to convert the PyTorch models to TensorFlow.js format for on-device inference in React Native.

## Prerequisites

- Python 3.11+
- PyTorch 2.5+
- TensorFlow 2.x
- Node.js (for testing)

## Installation

```bash
# Install required packages
pip install torch torchvision pytorch-lightning tensorflowjs onnx onnx-tf
```

## Step 1: Export PyTorch Model to ONNX

Create a conversion script `convert_to_onnx.py` in the UNIDO_FINAL directory:

```python
import torch
import onnx
from train.common.model import RiceQualityModel  # Adjust import based on your model structure

def export_to_onnx(checkpoint_path, output_path):
    """Export PyTorch checkpoint to ONNX format"""
    
    # Load the trained model
    model = RiceQualityModel.load_from_checkpoint(checkpoint_path)
    model.eval()
    
    # Create dummy inputs
    dummy_image = torch.randn(1, 3, 384, 384)  # [batch, channels, height, width]
    dummy_comment = torch.tensor([0], dtype=torch.long)  # Rice type index
    
    # Export to ONNX
    torch.onnx.export(
        model,
        (dummy_image, dummy_comment),
        output_path,
        export_params=True,
        opset_version=12,
        do_constant_folding=True,
        input_names=['image_input', 'comment_input'],
        output_names=['output'],
        dynamic_axes={
            'image_input': {0: 'batch_size'},
            'comment_input': {0: 'batch_size'},
            'output': {0: 'batch_size'}
        }
    )
    
    print(f"Model exported to {output_path}")
    
    # Verify the ONNX model
    onnx_model = onnx.load(output_path)
    onnx.checker.check_model(onnx_model)
    print("ONNX model verified successfully")

if __name__ == "__main__":
    checkpoint_path = "outputs/checkpoints/model1.ckpt"
    output_path = "outputs/rice_quality_model.onnx"
    export_to_onnx(checkpoint_path, output_path)
```

Run the conversion:

```bash
cd UNIDO_FINAL
python convert_to_onnx.py
```

## Step 2: Convert ONNX to TensorFlow.js

```python
# convert_to_tfjs.py
import onnx
from onnx_tf.backend import prepare
import tensorflow as tf
import tensorflowjs as tfjs

def onnx_to_tfjs(onnx_path, tfjs_output_path):
    """Convert ONNX model to TensorFlow.js format"""
    
    # Load ONNX model
    onnx_model = onnx.load(onnx_path)
    
    # Convert to TensorFlow
    tf_rep = prepare(onnx_model)
    tf_rep.export_graph('outputs/tf_model')
    
    # Load as TF SavedModel
    model = tf.saved_model.load('outputs/tf_model')
    
    # Convert to TensorFlow.js format
    tfjs.converters.convert_tf_saved_model(
        'outputs/tf_model',
        tfjs_output_path,
        quantization_dtype_map={'uint8': '*'},  # Optional: quantize to reduce size
    )
    
    print(f"TensorFlow.js model saved to {tfjs_output_path}")

if __name__ == "__main__":
    onnx_path = "outputs/rice_quality_model.onnx"
    tfjs_output_path = "outputs/tfjs_model"
    onnx_to_tfjs(onnx_path, tfjs_output_path)
```

Run the conversion:

```bash
python convert_to_tfjs.py
```

## Step 3: Copy Model Files to React Native App

After conversion, you'll have these files in `UNIDO_FINAL/outputs/tfjs_model/`:
- `model.json` - Model architecture
- `group1-shard1of1.bin` (or similar) - Model weights

Copy these files to the React Native app:

```bash
# From the rice-hackathon root directory
mkdir -p rice-hack/assets/models
cp UNIDO_FINAL/outputs/tfjs_model/model.json rice-hack/assets/models/rice_quality_model.json
cp UNIDO_FINAL/outputs/tfjs_model/*.bin rice-hack/assets/models/
```

## Step 4: Update Asset Configuration

In `rice-hack/app.json`, ensure the model files are included:

```json
{
  "expo": {
    "assetBundlePatterns": [
      "assets/**/*"
    ]
  }
}
```

## Step 5: Install TensorFlow.js Dependencies

```bash
cd rice-hack
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native
npx expo install expo-gl expo-gl-cpp
```

## Testing the Model

Create a test script to verify the model works:

```typescript
// test-model.ts
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { initializeTFLite, runTFLiteInference } from './services/inference/tflite-inference';

async function testModel() {
  await tf.ready();
  const success = await initializeTFLite();
  
  if (success) {
    console.log('Model loaded successfully!');
    // Test with a sample image
    const testImageUri = 'path/to/test/image.jpg';
    const predictions = await runTFLiteInference(testImageUri, 'Paddy');
    console.log('Predictions:', predictions);
  } else {
    console.error('Failed to load model');
  }
}

testModel();
```

## Optimization Tips

### 1. Model Quantization
Reduce model size by quantizing to 8-bit integers:

```python
tfjs.converters.convert_tf_saved_model(
    'outputs/tf_model',
    'outputs/tfjs_model',
    quantization_dtype_map={'uint8': '*'},
)
```

### 2. Model Pruning
Remove unnecessary weights before conversion:

```python
import tensorflow_model_optimization as tfmot

# Apply pruning before conversion
pruned_model = tfmot.sparsity.keras.prune_low_magnitude(model)
```

### 3. Use TFLite Instead of TFJS
For better performance, convert to TFLite and use `react-native-tflite`:

```python
converter = tf.lite.TFLiteConverter.from_saved_model('outputs/tf_model')
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

with open('rice_quality_model.tflite', 'wb') as f:
    f.write(tflite_model)
```

Then use with:
```bash
npm install react-native-tflite
```

## Troubleshooting

### Issue: "Model not found"
- Ensure model files are in `assets/models/` directory
- Update the model path in `tflite-inference.ts`
- Rebuild the app: `npx expo prebuild --clean`

### Issue: "Input shape mismatch"
- Verify the model expects 384x384 images
- Check the normalization values match training

### Issue: "Out of memory"
- Use quantization to reduce model size
- Implement model caching properly
- Clear tensors after inference (already implemented)

## Model Validation

Before deploying, validate the model outputs match expectations:

1. Run inference on the same test images used in Python
2. Compare outputs (they should be within 1-2% due to precision differences)
3. Test on various rice types and image qualities

## Next Steps

Once the model is converted and integrated:

1. Test on physical device (not just simulator)
2. Measure inference time and optimize if needed
3. Implement periodic model updates via OTA
4. Add telemetry to track model performance in production
