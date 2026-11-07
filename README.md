# sandip ko AI

A private, offline-first personal AI app for Android and iOS.

## Current status

The first native inference path is now wired into the chat screen.

- Claude-inspired, warm editorial chat interface.
- Local conversation history using AsyncStorage.
- Editable personal memory notes, saved locally and included in future prompts.
- llama.cpp inference through `llama.rn`.
- One-time in-app download for the Qwen2.5 1.5B Instruct Q4_K_M GGUF model.
- No account, Supabase, analytics, or cloud inference endpoint.
- GitHub Actions workflows for building an Android debug APK and an unsigned iOS Simulator app; artifacts are stored for 7 days.

**Important:** this is still an early development build. The Android workflow is configured, but the APK must pass a cloud build and then be installed and tested on a physical phone. iOS still needs a signed build and a physical-device test. A model download and a compatible native build are required before the AI can answer.

## Model

- Model: Qwen2.5 1.5B Instruct, Q4_K_M
- Approximate download: 986 MB
- Source: [Hugging Face model repository](https://huggingface.co/bartowski/Qwen2.5-1.5B-Instruct-GGUF)
- License shown by the model repository: Apache-2.0

The model is downloaded once into app-controlled storage. After the download completes, inference is local and does not require an internet connection.

## Development

Requires Node.js 20.19.4 or newer, Android Studio/Android SDK for Android, and Xcode on macOS for local iOS builds.

```bash
npm install
npx expo prebuild
npx expo run:android
```

This app uses a native module. Expo Go is not supported; use a development build.

## Privacy

Conversation history is stored locally using AsyncStorage. No remote AI endpoint is configured. Avoid storing highly sensitive information until local storage and device-backup behavior have been reviewed.

## Platforms

- Android: native build can be produced from Windows, Linux, or macOS with the Android toolchain.
- iOS Simulator: a macOS GitHub Actions workflow compiles an unsigned simulator app for build verification.
- iPhone: a physical-device install still requires a signed iOS build and Apple signing credentials. The simulator artifact is not installable on a physical iPhone.
