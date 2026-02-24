# 🌾 Rice Quality Analyzer

> AI-powered mobile application for field-level rice quality assessment

**UNIDO AfricaRice Challenge 2025**

---

## Overview

Rice Quality Analyzer is a React Native mobile application that enables rice value-chain actors in Ghana to assess rice quality instantly using AI-powered image analysis. The app works **100% offline** for core functionality, making it ideal for field use in areas with limited connectivity.

### Key Features

- 📸 **Camera Capture** - Guided photo capture with real-time quality validation
- 🤖 **AI Analysis** - On-device inference for instant quality assessment
- 📊 **Detailed Metrics** - 15+ quality indicators including grain counts, color defects, and dimensions
- 📱 **Works Offline** - Complete functionality without internet
- 📤 **Export Data** - Export scan results to CSV for reporting
- 🔒 **Local Storage** - All data stored securely on device

### Target Users

- Commercial rice buyers
- Rice mill operators
- Quality assessors & traders
- SME operators in Ghana's rice value chain

---

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for emulator) or physical Android device

### Installation

```bash
# Clone the repository
cd rice-hack

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on Device

1. Install **Expo Go** on your Android device
2. Scan the QR code from the terminal
3. Or run `npx expo run:android` for a development build

---

## Project Structure

```
rice-hack/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication flow
│   ├── (tabs)/            # Main tab navigation
│   ├── capture/           # Camera capture flow
│   └── results/           # Results display
├── components/            # Reusable UI components
│   ├── common/            # Buttons, cards, inputs
│   └── results/           # Charts, grade indicators
├── services/              # Business logic
│   ├── database/          # SQLite operations
│   ├── inference/         # AI model inference
│   ├── validation/        # Image quality checks
│   └── export/            # CSV export
├── store/                 # Zustand state management
├── utils/                 # Utility functions
├── constants/             # App constants & theme
└── types/                 # TypeScript definitions
```

---

## Building APK

### Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Build APK for internal testing
eas build --platform android --profile preview

# Build production APK
eas build --platform android --profile production
```

### Local Build

```bash
# Generate native Android project
npx expo prebuild --platform android

# Build APK
cd android
./gradlew assembleRelease

# APK located at: android/app/build/outputs/apk/release/
```

---

## Technical Stack

| Category | Technology |
|----------|------------|
| Framework | React Native + Expo SDK 54 |
| Language | TypeScript |
| Navigation | Expo Router v6 |
| State | Zustand |
| Database | expo-sqlite |
| Camera | expo-camera |
| Animations | react-native-reanimated |

---

## Quality Metrics

The AI model outputs 15 quality indicators:

| Category | Metrics |
|----------|---------|
| **Grain Counts** | Total, Broken, Long, Medium |
| **Color Defects** | Black, Chalky, Red, Yellow, Green |
| **Dimensions** | Length, Width, L/W Ratio |
| **Color Profile** | CIELAB L*, a*, b* |

### Milling Grades

| Grade | Broken % | Description |
|-------|----------|-------------|
| Premium | < 5% | Highest quality |
| Grade 1 | 5-10% | Good quality |
| Grade 2 | 10-15% | Acceptable |
| Grade 3 | 15-20% | Below average |
| Below Grade | > 20% | Poor quality |

---

## Development

### Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS  
npm run web        # Run on web
npm run lint       # Run ESLint
```

### Testing

See `utils/testing.ts` for test utilities and mock data generation.

Integration test checklist: `DEMO_SCRIPT.md`

---

## Demo Video

See `DEMO_SCRIPT.md` for the complete demo video script and recording checklist.

---

## Credits

- **UNIDO** - United Nations Industrial Development Organization
- **AfricaRice** - Africa Rice Center

---

## License

This project was created for the UNIDO AfricaRice Challenge 2025.

---

*Version 1.0.0 | February 2025*
