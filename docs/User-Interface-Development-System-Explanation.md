# User Interface Development System (UIDS) — Explanation

This document explains the **User Interface Development System** used to build the Crack Detector app: what it is, what it is made of, and how it works together.

---

## What is the UIDS?

The **User Interface Development System** is the set of tools, frameworks, and conventions used to design and implement the app’s user interface. It answers: *“With what do we build the UI, and how?”*

For this project, the UIDS is the **React Native + Expo** stack: we write UI in **TypeScript** using **React** components and **React Native** primitives, run and build the app with **Expo**, and style it with React Native’s built-in **StyleSheet** (no separate UI library).

---

## 1. Runtime and framework

### React Native

The UI is built with **React Native** (version 0.81.5). React Native lets you build mobile (and web) interfaces using **React** and **JavaScript/TypeScript**, while rendering to **native** UI on iOS and Android (and to the DOM on web). So:

- **Logic and structure** are written in React (components, state, effects).
- **What the user sees** is native views (buttons, images, camera, etc.), not a web view wrapping HTML.

The app uses **React 19.1.0** as the UI library. All screens and widgets are React components (function components with hooks).

### Expo

The app runs on top of **Expo** (SDK ~54.0.0). Expo is a **platform and toolchain** around React Native that provides:

- A standard **entry point** (`expo/AppEntry.js`) and **project layout**.
- **Native modules** for camera, image picker, status bar, file system, assets, image manipulation, etc., without writing native code yourself.
- **Build and run** commands (`expo start`, `expo start --android`, `expo start --ios`, `expo start --web`).
- **Expo Go** for quick testing on a device.

So the UIDS is not “plain” React Native alone; it is **React Native *with* Expo** for easier access to device features and a consistent development workflow.

### Entry point and root UI

When the app starts, the system runs the Expo entry point, which then mounts the React app. The **root UI component** is **`App.tsx`**: a single component that owns the whole screen and switches between “screens” (loading, permission, camera, preview, result) by changing internal state (`mode`). There is no separate router; navigation is **state-driven** inside `App.tsx`.

---

## 2. Language and typing

The UI is written in **TypeScript** (5.3.x) with **`@types/react`** (~19.1.10) for React type definitions. TypeScript gives:

- **Types** for props (e.g. `ResultCard` receives `isProcessing`, `result`, `confidence`) and for state (e.g. `AppMode`, `DetectionResult`).
- **Better editor support** and fewer runtime bugs from typos or wrong argument types.

All UI code lives in `.tsx` files (TypeScript + JSX). The build pipeline (Babel + Metro) compiles TypeScript and JSX down to JavaScript that runs on the device or in the browser.

---

## 3. Build and tooling

### Metro

**Metro** is the **JavaScript bundler** for React Native. It:

- Takes the entry file and follows `import`s.
- Compiles TypeScript/JSX (with Babel), bundles JavaScript, and serves the bundle to the app (or to the web).
- Resolves **assets** (images, etc.). In this project, `metro.config.js` extends the default Expo config and adds support for **`.tflite`** files so the app could later load a TensorFlow Lite model as an asset.

So in the UIDS, Metro is the tool that **produces the runnable JavaScript bundle** that contains all UI code.

### Babel

**Babel** handles **transpilation**: converting modern JavaScript and TypeScript/JSX into JavaScript that the React Native runtime can execute. The project uses **`babel-preset-expo`** only (in `babel.config.js`), which includes everything needed for React Native and Expo. There are no extra Babel plugins; the UIDS keeps the transform step simple.

### Expo CLI

**Expo CLI** is the command-line interface to start the dev server and run the app:

- `expo start` — start Metro and show QR code / options.
- `expo start --android` / `expo start --ios` — run on emulator/simulator or device.
- `expo start --web` — run the same UI in the browser.

So the **development experience** of the UIDS is: write TypeScript/React in the editor, run Expo CLI, and Metro bundles and serves the app.

---

## 4. UI building blocks (components and libraries)

### React Native core

The visible UI is built from **React Native** primitives:

- **Layout:** `View`, `SafeAreaView`, `ScrollView`
- **Content:** `Text`, `Image`
- **Interaction:** `TouchableOpacity`
- **Feedback:** `ActivityIndicator`
- **Animation:** `Animated.View`, `Animated.Value`, `Animated.timing`, `Animated.spring`, `Animated.parallel`

Helpers used by the UI include:

- **`Dimensions`** — e.g. `Dimensions.get('window')` for the scan frame width.
- **`StyleSheet`** — define all styles with `StyleSheet.create({ ... })`.
- **`Platform`** — e.g. to adjust header padding on Android.

No third-party UI kit (e.g. NativeBase, React Native Paper) is used; the UIDS relies on **React Native’s own components and APIs**.

### Expo modules used by the UI

Expo provides optional packages that this app uses for device and system integration:

| Module | Role in the UIDS |
|--------|-------------------|
| **expo-camera** | `CameraView` (live camera and capture), `useCameraPermissions`, `CameraType` (back/front). |
| **expo-image-picker** | `launchImageLibraryAsync` to open the gallery and let the user pick (and crop) an image. |
| **expo-status-bar** | `StatusBar` component to set light status bar on the dark theme. |
| **react-native-safe-area-context** | Supplies safe area insets; used by Expo’s `SafeAreaView` so content avoids notches and system UI. |

Other Expo packages (**expo-file-system**, **expo-asset**, **expo-image-manipulator**) are used inside the **detection hook** (`useCrackDetector`) for loading and preprocessing; they support the **behavior** behind the UI (e.g. model load, image resize) rather than drawing pixels. So they are part of the overall system but not of the “drawing” part of the UIDS.

### Custom components

The only custom UI component is **`ResultCard`** (`src/components/ResultCard.tsx`). It is a React component that:

- Receives `isProcessing`, `result`, and `confidence` from the parent.
- Renders either a “processing” state (spinner + text) or the result card (icon, title, description, confidence bar, recommendation).
- Uses only React Native primitives and `Animated`; icons are drawn with **styled `View`s** (e.g. borders for a triangle, positioned rectangles for a checkmark), not image assets or an icon font.

So the UIDS’s **component model** is: **React Native + Expo components + one custom component (ResultCard)**.

---

## 5. Styling and layout

### StyleSheet

All styling is done with React Native’s **`StyleSheet.create()`** in:

- **`App.tsx`** — styles for loading, permission, header, camera, preview, result area, and all buttons.
- **`ResultCard.tsx`** — styles for the result card, icons, confidence bar, and recommendation box.

There is **no** separate design system or UI library. Colors, spacing, font sizes, and layout are defined in these two files. Shared choices (e.g. dark background `#0f172a`, accent `#22d3ee`, red/green for crack/no crack) are applied by using the same style names and values in the right places.

### Layout model

Layout is **flexbox-based** (React Native’s default). Components use `flex`, `flexDirection`, `alignItems`, `justifyContent`, padding, and margin. The scan frame size is derived from **`Dimensions.get('window')`** (e.g. `SCREEN_WIDTH - 80`) so it adapts to screen width. The result screen uses **`ScrollView`** so the image and result card can scroll together on small screens. So the UIDS uses **flexbox + Dimensions + ScrollView** for layout and responsiveness.

---

## 6. State and behavior

### Where state lives

- **`App.tsx`** holds:
  - **UI state:** `mode` (which “screen” is shown), `imageUri` (current photo), `facing` (camera type).
  - **Refs:** `cameraRef` (to call `takePictureAsync`), `fadeAnim` (Animated value for result fade-in).
- **`useCrackDetector`** (custom hook) holds:
  - **Detection state:** `isModelLoaded`, `isProcessing`, `result`, `confidence`.
  - **Actions:** `loadModel`, `detectCrack`, `reset`.

The hook does **not** render UI; it only manages model loading and detection and exposes state and functions. So the UIDS separates **UI** (App + ResultCard) from **detection logic** (hook).

### How behavior is wired

- **On app start:** A `useEffect` in `App.tsx` calls `loadModel()`. When the model is “loaded,” `isModelLoaded` becomes true and the app can show the permission or camera screen.
- **User actions** (e.g. tap Capture, Analyze, Retake, New Scan) are handled by functions in `App.tsx` that update `mode` and `imageUri` and call the hook’s `detectCrack` or `reset`.
- **Result screen fade-in:** A `useEffect` watches `mode`; when it is `'result'`, it runs an `Animated.timing` on `fadeAnim` so the result container fades in.

So the UIDS uses **React state + refs + one custom hook + useEffect** to drive all UI behavior.

---

## 7. Animation

Animations use React Native’s **`Animated`** API:

- **Animated.Value** — holds a number (e.g. opacity 0–1, scale 0.8–1).
- **Animated.timing** — change a value over time (e.g. 400 ms fade-in).
- **Animated.spring** — change a value with a spring (e.g. result card scale).
- **Animated.parallel** — run several animations at once (e.g. scale and opacity in ResultCard).

All animations use **`useNativeDriver: true`** so they run on the native thread and stay smooth. So the UIDS has **no separate animation library**; it uses only React Native’s built-in `Animated` API.

---

## 8. Project structure (UI-related)

```
CrackDetectorApp/
  App.tsx                 ← Root UI: all screens, mode, handlers
  package.json            ← Dependencies and scripts
  metro.config.js         ← Metro config (bundler, assets)
  babel.config.js         ← Babel config (transpilation)
  src/
    components/
      ResultCard.tsx      ← Result + processing UI only
    hooks/
      useCrackDetector.ts ← Detection state and logic (no UI)
```

The **UI** is effectively **App.tsx + ResultCard.tsx**. The hook supports the UI but is not part of the “view” layer. The UIDS is deliberately small: one root component, one reusable screen-level component, one hook, and the Expo/React Native building blocks.

---

## 9. Target platforms

The UIDS is set up for:

- **iOS and Android** — primary targets; run via Expo Go or a development build.
- **Web** — supported via `expo start --web`; same React/React Native code, but camera and permissions behave differently in the browser.

The UI is designed **mobile-first**, single-column and full-screen; there are no tablet-specific or multi-panel layouts. So the UIDS is one codebase, one layout strategy, multiple platforms.

---

## 10. Summary

The **User Interface Development System** for the Crack Detector app is:

| Aspect | What the UIDS uses |
|--------|---------------------|
| **Framework** | React Native + Expo |
| **Language** | TypeScript |
| **Build** | Metro (bundle), Babel (transpile), Expo CLI (run) |
| **Components** | React Native primitives + Expo modules (camera, image picker, status bar, safe area) + custom ResultCard |
| **Styling** | StyleSheet only; flexbox layout; Dimensions for responsiveness |
| **State & behavior** | React useState/useRef/useEffect + custom useCrackDetector hook |
| **Animation** | React Native Animated API with useNativeDriver |
| **Structure** | Single root App, one main UI component (ResultCard), one logic hook |

Together, these choices form the **User Interface Development System** used to design and implement the app’s interface.
