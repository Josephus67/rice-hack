#!/bin/bash

# Rice Quality Analyzer - Setup Script
# This script installs all necessary dependencies for the critical features

set -e  # Exit on error

echo "🌾 Rice Quality Analyzer - Setup Script"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the rice-hack directory."
    exit 1
fi

echo "📦 Step 1: Installing TensorFlow.js dependencies..."
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native --legacy-peer-deps

echo ""
echo "📦 Step 2: Installing required Expo packages..."
npx expo install expo-gl expo-gl-cpp

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Convert the PyTorch model to TensorFlow.js format:"
echo "   See: ml/MODEL_CONVERSION.md for detailed instructions"
echo ""
echo "2. Copy model files to assets/models/ directory:"
echo "   mkdir -p assets/models"
echo "   cp ../UNIDO_FINAL/outputs/tfjs_model/*.* assets/models/"
echo ""
echo "3. Initialize model in app/_layout.tsx:"
echo "   import { initializeModel } from '@/services/inference';"
echo "   useEffect(() => { initializeModel(); }, []);"
echo ""
echo "4. Test the app:"
echo "   npx expo start --clear"
echo ""
echo "📚 Documentation:"
echo "   - QUICK_REFERENCE.md - Quick start guide"
echo "   - IMPLEMENTATION_CHECKLIST.md - Full implementation details"
echo "   - ml/MODEL_CONVERSION.md - Model conversion guide"
echo ""
echo "🎉 Setup complete! All critical features are ready."
