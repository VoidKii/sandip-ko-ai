# sandip ko AI

A private, offline-first personal AI app for Android and iOS.

## Current status

**Early foundation — not yet a functioning AI assistant.**

The first commit establishes:
- A Claude-inspired, warm editorial chat interface.
- Local conversation persistence on the device.
- A local AI engine interface with an explicit not-installed state.
- No account, Supabase, analytics, or cloud inference dependency.

The app intentionally does not generate pretend AI responses. Native on-device inference is the next milestone.

## Development

Requires Node.js LTS and a compatible Android/iOS native build environment.

```bash
npm install
npx expo start
```

For native modules and a real local model, use a custom development build rather than Expo Go.

## Offline model roadmap

The planned inference layer is llama.cpp via a React Native native bridge (for example, llama.rn), loading a compatible GGUF model from app-controlled local storage. The exact bridge version and model quantization will be selected after testing native compatibility and memory use on target phones.

No model is bundled in this repository. Model files can be large and must be obtained separately with their license terms respected.

## Privacy

Conversation data is stored locally using AsyncStorage. No remote AI endpoint is configured. Do not store highly sensitive information in the app until its local storage and device-backup behavior have been reviewed.

## Platforms

- Android: native build can be produced from Windows, Linux, or macOS with the Android toolchain.
- iOS: native compilation requires macOS/Xcode or a compatible cloud build service.
