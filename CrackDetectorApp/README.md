# Crack Detector - React Native Expo App

A mobile application that uses TensorFlow Lite to detect cracks in surfaces using your phone's camera. All AI processing happens **on-device** - no internet required for inference!

## Features

- 📷 **Camera Capture** - Take photos directly in the app
- 🖼️ **Gallery Selection** - Choose existing images
- 🧠 **On-Device AI** - TFLite model runs locally (no server needed)
- ⚡ **Fast Inference** - ~6ms per image analysis
- 🎨 **Beautiful UI** - Dark theme with intuitive interface

## Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Expo CLI** (will be installed with npx)
- **Expo Go** app on your phone (for testing) OR
- **Android Studio** / **Xcode** (for development builds)

## Quick Start

### 1. Install Dependencies

```bash
cd CrackDetectorApp
npm install
```

### 2. Start the Development Server

```bash
npx expo start
```

### 3. Run on Your Device

**Option A - Expo Go (Easiest for Demo)**
- Install "Expo Go" from App Store/Play Store
- Scan the QR code shown in terminal
- ⚠️ Note: Expo Go uses simulated inference. For real TFLite, use Option B.

**Option B - Development Build (Full TFLite Support)**
```bash
# For Android
npx expo run:android

# For iOS
npx expo run:ios
```

## Project Structure

```
CrackDetectorApp/
├── App.tsx                    # Main app component
├── app.json                   # Expo configuration
├── package.json               # Dependencies
├── assets/
│   └── crack_detector.tflite  # TensorFlow Lite model
└── src/
    ├── hooks/
    │   └── useCrackDetector.ts    # Model loading & inference
    └── components/
        └── ResultCard.tsx          # Result display UI
```

## Model Details

The `crack_detector.tflite` model:
- **Input**: 128×128 grayscale image
- **Output**: Single float (0-1), >0.5 = crack detected
- **Size**: ~8.5 MB
- **Inference**: ~6ms per image

## Enabling Real TFLite Inference

The app currently includes a simulation mode for demo purposes. To enable real on-device TFLite inference:

### Option 1: Using react-native-tflite (Recommended)

1. Install the native module:
```bash
npm install react-native-tflite
```

2. Update `src/hooks/useCrackDetector.ts`:

```typescript
import { loadTensorflowModel, TensorflowModel } from 'react-native-tflite';
import { Asset } from 'expo-asset';

let tfliteModel: TensorflowModel | null = null;

const loadModel = async () => {
  const modelAsset = Asset.fromModule(require('../../assets/crack_detector.tflite'));
  await modelAsset.downloadAsync();
  
  tfliteModel = await loadTensorflowModel({
    model: modelAsset.localUri!,
  });
};

const runInference = async (inputData: Float32Array) => {
  const output = await tfliteModel!.run([inputData]);
  return output[0][0]; // Prediction value 0-1
};
```

3. Create a development build (required for native modules):
```bash
npx expo prebuild
npx expo run:android  # or run:ios
```

### Option 2: Using TensorFlow.js

For Expo Go compatibility (no native build required):

```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native
```

## Customization

### Changing the Threshold

Edit `src/hooks/useCrackDetector.ts`:
```typescript
const CONFIDENCE_THRESHOLD = 0.5; // Adjust as needed
```

### Styling

The app uses a dark slate theme. Modify `App.tsx` styles to customize:
- Primary accent: `#22d3ee` (cyan)
- Crack detected: `#ef4444` (red)
- No crack: `#22c55e` (green)
- Background: `#0f172a` (dark slate)

## Troubleshooting

### "Camera not working"
- Ensure camera permissions are granted
- Try restarting the app

### "Model not loading"
- Check that `crack_detector.tflite` is in `assets/` folder
- For native TFLite, ensure you're using a development build

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start --clear
```

## Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform & tools
- **TensorFlow Lite** - On-device ML inference
- **TypeScript** - Type-safe JavaScript

## License

MIT License - Feel free to use and modify!

