# ML Model Pipeline

This directory contains scripts and models for rice quality inference on mobile devices.

## Directory Structure

```
ml/
├── scripts/
│   └── convert_models.py    # PyTorch → ONNX → TFLite converter
├── models/
│   ├── rice_combined.onnx   # Combined model (ONNX format)
│   └── rice_combined.tflite # Combined model (TFLite for mobile)
└── README.md
```

## Model Architecture

The rice quality model is based on **ConvNeXtV2-nano** backbone with a comment-conditioned
regression head. It predicts 15 quality metrics from a rice sample image.

### Target Outputs (15 total)

1. **Count** - Total grain count
2. **Broken_Count** - Number of broken grains
3. **Long_Count** - Number of long grains
4. **Medium_Count** - Number of medium grains
5. **Black_Count** - Black/damaged grain count
6. **Chalky_Count** - Chalky grain count
7. **Red_Count** - Red grain count
8. **Yellow_Count** - Yellow grain count
9. **Green_Count** - Immature (green) grain count
10. **WK_Length_Average** - Average kernel length (mm)
11. **WK_Width_Average** - Average kernel width (mm)
12. **WK_LW_Ratio_Average** - Length/width ratio
13. **Average_L** - CIELAB L* (lightness)
14. **Average_a** - CIELAB a* (green-red)
15. **Average_b** - CIELAB b* (blue-yellow)

### Rice Type Conditioning

The model accepts a "comment index" input indicating rice type:
- `0` = Paddy
- `1` = Brown
- `2` = White

## Model Conversion

### Prerequisites

```bash
# From the project root
pip install torch timm onnx onnx-tf tensorflow

# For training environment (optional)
cd ../UNIDO_FINAL
pip install -r requirements.txt
```

### Converting Models

```bash
cd ml/scripts

# Convert all 4 specialist models to ONNX
python convert_models.py --all --mobile-size 384 --onnx-only

# Convert to a single combined model (recommended for mobile)
python convert_models.py --combined --mobile-size 384

# Convert with FP16 quantization for smaller size
python convert_models.py --combined --mobile-size 384
```

### Input Specifications

| Parameter | Value |
|-----------|-------|
| Input shape | `[1, 3, 384, 384]` |
| Pixel range | `[0, 1]` normalized |
| Color space | RGB |
| Normalization | ImageNet mean/std |

**ImageNet Normalization:**
```
mean = [0.485, 0.456, 0.406]
std = [0.229, 0.224, 0.225]
```

## Mobile Integration

### React Native with TensorFlow Lite

The TFLite model can be loaded using `react-native-tflite` or `expo-tensorflow`:

```typescript
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

// Load model
const modelJSON = require('./rice_combined.json');
const modelWeights = require('./rice_combined.bin');
const model = await tf.loadGraphModel(bundleResourceIO(modelJSON, modelWeights));

// Prepare input
const imageTensor = tf.browser.fromPixels(imageData)
  .resizeBilinear([384, 384])
  .div(255.0)
  .sub([0.485, 0.456, 0.406])
  .div([0.229, 0.224, 0.225])
  .expandDims(0);

const commentTensor = tf.tensor1d([riceTypeIndex], 'int32');

// Run inference
const predictions = model.predict([imageTensor, commentTensor]);
```

## Output Processing

The model outputs raw predictions in a transformed space. Apply inverse transforms:

```typescript
// Count targets: inverse of log1p + z-score
function inverseCount(pred: number, mean: number, std: number): number {
  return Math.max(0, Math.round(Math.expm1(pred * std + mean)));
}

// Continuous targets: inverse of z-score
function inverseContinuous(pred: number, mean: number, std: number): number {
  return pred * std + mean;
}
```

See `constants/app.ts` for transformation parameters.

## Performance Notes

- **Original training resolution**: 2560×2560 to 3840×2752 (too large for mobile)
- **Mobile inference resolution**: 384×384 (trade-off: speed vs accuracy)
- **Expected inference time**: ~500-1500ms on modern smartphones
- **Model size (FP16 quantized)**: ~20-30MB per specialist, ~80MB combined
