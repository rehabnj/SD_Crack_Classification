# 4.0 User Interface Design

**Crack Detector — SD Crack Classification**

---

## 4.1 Description of the User Interface

A concise overview of the software’s user interface from the user’s perspective.

- **Purpose:** Mobile app for capturing or selecting images of surfaces and running crack detection via an on-device ML model.
- **Flow:** Loading → Permission (if needed) → Camera / Gallery → Preview → Analysis → Result.
- **Layout:** Full-screen, single main content area with a fixed header and a bottom action bar.

---

## 4.1.1 Screen Images

Visual representations of the interface (include screenshots from the app in your final deck).

| Screen | Description |
|--------|-------------|
| **Loading** | App title “Crack Detector”, “Loading AI Model...”, and a loading spinner. |
| **Permission** | “Camera Access Required” with short explanation, “Grant Permission” and “Or Select from Gallery” actions. |
| **Camera** | Live camera view with a scanning frame and text “Position surface within frame”; header “Point camera at surface”. |
| **Preview** | Captured/selected image with overlay “Ready to analyze”; header “Review your image”. |
| **Result** | Same image at top, then result card (Crack Detected / No Crack Found), confidence bar, and recommendation; header “Analysis complete”. |

*Replace this table with actual screenshots of each screen when preparing the presentation.*

---

## 4.1.2 Objects and Actions

All interactive screen elements and the actions users can perform.

| Object | Screen(s) | Action |
|--------|-----------|--------|
| **Grant Permission** (button) | Permission | Requests camera permission. |
| **Or Select from Gallery** (button) | Permission | Opens image picker; skips camera. |
| **Camera view** | Camera | Displays live camera feed. |
| **Scan frame** | Camera | Visual guide (non-interactive). |
| **Gallery** (icon button) | Camera | Opens image library to choose a photo. |
| **Capture** (large round button) | Camera | Takes a photo; switches to Preview. |
| **Flip camera** (icon button) | Camera | Toggles front/back camera. |
| **Retake** (button) | Preview | Discards image; returns to Camera. |
| **Analyze** (button) | Preview | Runs crack detection; switches to Result. |
| **Result image** | Result | Display only (scrollable with result card). |
| **Result card** | Result | Shows outcome, confidence bar, and recommendation (display only). |
| **New Scan** (button) | Result | Clears result and returns to Camera. |
| **Header / subtitle** | All (main flow) | Display only; subtitle reflects current step. |

---

## 4.2 Interface Design Rules

Conventions and standards used to design and implement the UI.

- **Consistency:** Same header pattern and action bar placement on every main screen; primary action (Analyze, New Scan) uses the same accent style.
- **Feedback:** Loading spinner and “Analyzing surface...” during detection; result card with clear “Crack Detected” or “No Crack Found” and confidence percentage.
- **Error prevention:** Permission screen explains why camera is needed; preview step allows Retake before analysis.
- **Visual hierarchy:** Title and subtitle in header; one primary action per screen; result card emphasizes outcome and recommendation.
- **Color semantics:** Dark background (`#0f172a`); cyan (`#22d3ee`) for primary actions and progress; red for crack, green for no crack in the result card.
- **Accessibility:** Large touch targets (e.g. 80×80 capture button); high-contrast text; status bar set to light for dark theme.

---

## 4.3 Components Available

GUI components used in the implementation, with source package and specific usage.

### Core layout and primitives (React Native)

| Component | Package | Key props / API | Use in app |
|-----------|---------|------------------|------------|
| **SafeAreaView** | `react-native` | (none) | Root container for all screens; insets for notch and system bars. |
| **View** | `react-native` | `style` | Header block, content area, camera container, overlay, scan frame (4 corner Views), permission/gallery icons, all ResultCard layout (container, processingCard, iconContainer, confidenceContainer, recommendationBox). |
| **Text** | `react-native` | `style` | Header title/subtitle, loading text, permission copy, scan hint, preview overlay, button labels, ResultCard title/description/confidence label/value/recommendation text. |
| **TouchableOpacity** | `react-native` | `style`, `onPress` | Grant Permission, Or Select from Gallery, Gallery icon, Capture button, Flip camera, Retake, Analyze, New Scan. |
| **Image** | `react-native` | `source={{ uri }}`, `style` | Preview screen and Result screen image; `resizeMode="cover"` on result image. |
| **ScrollView** | `react-native` | `contentContainerStyle`, `showsVerticalScrollIndicator` | Result screen only; wraps result image + ResultCard for scroll when content overflows. |
| **ActivityIndicator** | `react-native` | `size="large"`, `color="#22d3ee"` | Loading screen (below “Loading AI Model...”); ResultCard processing state (“Analyzing surface...”). |
| **Animated.View** | `react-native` | `style` (incl. `transform`, `opacity` from Animated.Value) | App: result container fade-in (Animated.timing, 400 ms). ResultCard: result card entrance (Animated.spring + Animated.timing in parallel, scale 0.8→1, opacity 0→1). |
| **Dimensions** | `react-native` | `Dimensions.get('window')` | Used to set scan frame width/height to `SCREEN_WIDTH - 80`. |
| **StyleSheet** | `react-native` | `StyleSheet.create({ ... })` | All layout and visual styles defined in App.tsx and ResultCard.tsx (no external UI kit). |
| **Platform** | `react-native` | `Platform.OS === 'android'` | Header padding adjusted for Android (e.g. 48 top padding). |

### Camera and media (Expo)

| Component | Package | Key props / API | Use in app |
|-----------|---------|------------------|------------|
| **CameraView** | `expo-camera` | `ref`, `style`, `facing` | Live camera; ref used for `takePictureAsync({ quality: 0.8, base64: false })`. |
| **useCameraPermissions** | `expo-camera` | Returns `[permission, requestPermission]` | Permission screen; “Grant Permission” calls request. |
| **CameraType** | `expo-camera` | `'back' \| 'front'` | State for `facing`; toggled by Flip button. |
| **launchImageLibraryAsync** | `expo-image-picker` | `mediaTypes: ['images']`, `allowsEditing: true`, `aspect: [1,1]`, `quality: 0.8` | Gallery picker from Permission screen and Camera screen. |

### App-level UI (Expo / app code)

| Component | Package | Key props / API | Use in app |
|-----------|---------|------------------|------------|
| **StatusBar** | `expo-status-bar` | `style="light"` | Light icons/text on dark background for all screens. |
| **ResultCard** | App (`src/components/ResultCard.tsx`) | `isProcessing`, `result`, `confidence` | Result screen only. Renders: processing state (ActivityIndicator + text), or result card with icon (warning “!” or checkmark), title, description, confidence bar (View-based progress), and recommendation box. Icons are built from View + border/position (e.g. warning triangle, checkmark, wrench, thumb). |

### ResultCard internal structure (components used)

- **View**: container, processingCard, iconContainer (crack/no_crack), warningIcon, checkIcon, confidenceContainer, confidenceBarBg, confidenceBar, recommendationBox, recommendationIconContainer.
- **Text**: processingText, processingSubtext, resultTitle, resultDescription, confidenceLabel, confidenceValue, recommendationText, warningExclamation.
- **ActivityIndicator**: one instance when `isProcessing` is true.
- **Animated.View**: single wrapper for the result card with scale and opacity animations.
- **Custom “icons”**: implemented as styled Views (e.g. warningTriangle via border widths, checkmarkShort/Long, wrenchHead/Handle, thumbUp) — no image assets or icon font.

---

## 4.4 UIDS Description

**User Interface Development System** — toolchain, versions, and structure used to build the Crack Detector UI.

### Runtime and framework

| Item | Specification |
|------|----------------|
| **UI framework** | React Native 0.81.5 |
| **React** | 19.1.0 |
| **Application host** | Expo SDK ~54.0.0 |
| **Entry point** | `expo/AppEntry.js` (Expo default); root UI is `App.tsx`. |
| **Language** | TypeScript 5.3.x; `@types/react` ~19.1.10. |

### Build and tooling

| Tool | Role |
|------|------|
| **Metro** | Bundler; config via `expo/metro-config` (`metro.config.js`). Asset extensions include `tflite` for potential model files. |
| **Babel** | Transpilation; `babel-preset-expo` only; no extra plugins in `babel.config.js`. |
| **Expo CLI** | Dev server and run scripts: `expo start`, `expo start --android`, `expo start --ios`, `expo start --web`. |

### Expo modules used for the UI and related flows

| Package | Version (approx.) | Purpose in UI / flow |
|---------|-------------------|------------------------|
| **expo-camera** | ~17.0.9 | CameraView, capture, useCameraPermissions. |
| **expo-image-picker** | ~17.0.8 | launchImageLibraryAsync for gallery. |
| **expo-status-bar** | ~3.0.8 | StatusBar component (light style). |
| **expo-file-system** | ~19.0.19 | Used in useCrackDetector for file access (e.g. model/image paths). |
| **expo-asset** | ~12.0.10 | Asset loading (e.g. for future TFLite model). |
| **expo-image-manipulator** | ~14.0.7 | Image preprocessing in useCrackDetector (resize, format). |
| **expo-media-library** | ~18.2.0 | Available for saving/reading media (not used in current UI flow). |
| **react-native-safe-area-context** | ~5.6.0 | Provides safe area; used implicitly by Expo/SafeAreaView. |

### Styling and layout

- **Method:** React Native `StyleSheet.create()` in `App.tsx` and `ResultCard.tsx`; no third-party UI library (no NativeBase, React Native Paper, etc.).
- **Layout model:** Flexbox only; no grid or absolute layout libraries.
- **Responsiveness:** `Dimensions.get('window')` for scan frame width; flexible flex and percentage-based widths (e.g. confidence bar `width: '100%'`, result image full width).

### State and behavior

- **Local UI state:** React `useState` for `mode`, `imageUri`, `facing`; `useRef` for `cameraRef` and `fadeAnim` (Animated.Value).
- **Side effects:** `useEffect` for initial model load and for result-screen fade-in tied to `mode`.
- **Detection logic:** Custom hook `useCrackDetector` (`src/hooks/useCrackDetector.ts`) exposes `isModelLoaded`, `isProcessing`, `result`, `confidence`, `loadModel`, `detectCrack`, `reset`; uses expo-file-system, expo-asset, expo-image-manipulator (no UI components inside the hook).

### Animation

- **API:** React Native `Animated` (Animated.Value, Animated.timing, Animated.spring, Animated.parallel).
- **Driver:** `useNativeDriver: true` for all animations.
- **Usage:** App — result container opacity 0→1 (400 ms). ResultCard — result card scale 0.8→1 (spring) and opacity 0→1 (300 ms) when result is set.

### Project structure relevant to the UI

```
CrackDetectorApp/
  App.tsx                    # Root component, all screens, navigation by mode
  package.json
  metro.config.js
  babel.config.js
  src/
    components/
      ResultCard.tsx          # Result + processing state UI
    hooks/
      useCrackDetector.ts     # Model load, detect, reset (no UI)
```

### Target platforms

- **Primary:** Mobile (iOS, Android) via Expo Go or dev builds.
- **Optional:** Web via `expo start --web` (same components; behavior may differ for camera/permissions).
- **UI design:** Single-column, full-screen screens; no multi-panel or tablet-specific layouts.

---

*End of Section 4 — User Interface Design*
