BonJoy Rider App

BonJoy Rider is a React Native mobile application built for riders as part of the BonJoy platform.
This repository contains the complete source code along with setup and build instructions.

Tech Stack

React Native 0.82.1

React 19.1.1

TypeScript

Android (Kotlin)

Navigation: React Navigation

State & Storage: Async Storage

Networking: Axios

Prerequisites

Ensure the following are installed on your system:

1. Node.js

Version: >= 20

node -v

2. npm
npm -v

3. Java Development Kit (JDK)

Recommended: JDK 17

java -version

4. Android Studio

Install Android SDK

Install Android SDK Platform Tools

Install Android Emulator or connect a physical device

5. React Native CLI
npm install -g react-native-cli

Project Setup
1. Clone the Repository
git clone https://github.com/mcsindia/BonJoyDriverApp.git
cd bonjoyrider

2. Install Dependencies
npm install

3. iOS Setup (macOS only)
cd ios
pod install
cd ..

Running the Application
Start Metro Bundler
npm start


Keep this terminal running.

Run on Android

Make sure an emulator or device is connected.

npm run android

Run on iOS
npm run ios

Environment Configuration (Optional)

If you are using APIs or environment variables:

Create a file:

.env


Example:

BASE_URL=https://api.example.com

Android Build & APK Generation
1. Debug APK (For Testing)
cd android
./gradlew assembleDebug


APK location:

android/app/build/outputs/apk/debug/app-debug.apk

2. Release APK (For Distribution)
Step 1: Generate Keystore
keytool -genkeypair -v \
-keystore my-release-key.keystore \
-alias my-key-alias \
-keyalg RSA -keysize 2048 -validity 10000


Place the keystore inside:

android/app/

Step 2: Configure gradle.properties

Add:

MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=*****
MYAPP_RELEASE_KEY_PASSWORD=*****

Step 3: Generate Release APK
cd android
./gradlew assembleRelease


APK location:

android/app/build/outputs/apk/release/app-release.apk

Android App Bundle (AAB) – Play Store
cd android
./gradlew bundleRelease


AAB location:

android/app/build/outputs/bundle/release/app-release.aab

Linting & Testing
Run ESLint
npm run lint

Run Tests
npm test

Common Issues & Fixes
Metro Port Issue
npx react-native start --reset-cache

Android Build Failed
cd android
./gradlew clean

Project Structure (High Level)
bonjoyrider/
├── android/
├── ios/
├── src/
│   ├── screens/
│   ├── navigation/
│   ├── services/
│   └── utils/
├── App.tsx
├── package.json
└── README.md

Contribution Guidelines

Follow consistent code formatting

Use meaningful commit messages

Create feature branches for new changes

Contact

Sanjeev Kumar
Software Engineer
📧 sanjeevkumar.iitp@gmail.com