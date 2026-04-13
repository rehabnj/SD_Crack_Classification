# Test Specification — Crack Detector Application

**Document Version:** 1.0  
**Last Updated:** March 2025  
**Project:** SD Crack Classification (Crack Detector)

---

## 1.0 Introduction

This document provides an overview of the test process for the Crack Detector application. It describes both the test plan and the test procedure.

### 1.1 Goals and Objectives

**Overall goals of the test process:**

- **Verify correctness:** Ensure that image loading, preprocessing, model inference, and result display behave as specified (crack vs. no-crack classification with confidence).
- **Verify integration:** Ensure that the ML pipeline (notebook) and the mobile app (CrackDetectorApp) work together when the TFLite model is deployed.
- **Verify user flows:** Ensure that all user-facing functions (camera, gallery, capture, analyze, result, new scan) work correctly and that the UI reflects the correct states.
- **Establish quality gates:** Define pass/fail criteria for unit, integration, validation, and high-order tests so that releases are repeatable and auditable.
- **Document test artifacts:** Identify test cases, expected results, stubs/drivers, and record-keeping so that testing can be repeated and maintained.

**Objectives:**

- Achieve stated coverage for unit tests on data and model components (notebook) and for UI/hook components (app).
- Complete integration tests for the full pipeline: image → preprocessing → model → result.
- Complete validation tests against user requirements (e.g., docs/App-Functions-User-Perspective.md).
- Execute selected high-order tests (e.g., performance, stress) where applicable.
- Maintain a test log and store test results for traceability.

### 1.2 Statement of Scope

**In scope — functionality/features/behavior to be tested:**

| Area | Description |
|------|-------------|
| **Notebook (CrackClassification.ipynb)** | Dataset loading (0_Non_Crack, 1_Crack); image file type checks; load_and_preprocess (resize 128×128, grayscale/RGB, normalize [0,1]); augmentation (flip, rotation, translation, brightness); train/test split; model training (LogisticRegression, SVM, DecisionTree, RandomForest, KNN, MLP); evaluation metrics (accuracy, precision, recall, F1, inference time, model size); cross-validation; CNN training and TFLite export; TFLite inference parity with Keras. |
| **CrackDetectorApp** | Model loading (simulated or real TFLite); image preprocessing (resize, format) for inference; detection (crack / no_crack) and confidence; reset. |
| **App UI (App.tsx)** | Modes: loading, permission, camera, preview, result; camera capture; gallery picker; analyze; retake; new scan; camera flip; header/subtitle per mode. |
| **ResultCard component** | Processing state (“Analyzing surface...”); result state (Crack Detected / No Crack Found); confidence bar and percentage; recommendation text; animations. |
| **End-to-end flow** | Start app → (optional) grant permission or use gallery → capture or pick image → analyze → view result → new scan. |

**Out of scope — not to be tested (or only lightly):**

- Third-party libraries (expo-camera, expo-image-picker, react-native, TensorFlow/Keras) except for integration points (e.g., “does the app call the right APIs and handle responses?”).
- Exact visual design (pixel-perfect layout); focus is on behavior and correctness of displayed data.
- Training hyperparameter tuning or model selection research; testing assumes a fixed training procedure and validates that it runs and produces expected outputs.
- Backend or cloud services (none in current scope).
- Localization and accessibility (can be added in a later test plan).

### 1.3 Major Constraints

- **Environment:** Testing of the notebook is on a Python environment (Windows) with dependencies in `requirements.txt`. App testing is on React Native/Expo (iOS/Android/Expo Go); TFLite may require a development build if native modules are used.
- **Data:** The Concrete_Crack dataset (0_Non_Crack, 1_Crack) is required for notebook tests; a subset or fixtures may be used for automated tests to keep runs fast and deterministic.
- **Model:** The app may use simulated inference (as in current `useCrackDetector.ts`) or a real TFLite model; test procedures should cover both where applicable.
- **Resources:** No dedicated test lab or hardware is assumed; tests should be runnable on developer machines and CI where possible.
- **Schedule:** Testing is to be completed within the project timeline; high-order tests (e.g., stress/performance) may be limited to critical paths.

---

## 2.0 Test Plan

This section describes the overall testing strategy and project management for executing tests.

### 2.1 Software (SCIs) to be Tested

| SCI | Description | Exclusions |
|-----|-------------|------------|
| **CrackClassification.ipynb** | Jupyter notebook: data loading, preprocessing, augmentation, model training (sklearn + Keras CNN), evaluation, TFLite export and verification. | Raw dataset curation; exploratory cells that are not part of the defined pipeline. |
| **CrackDetectorApp** | React Native/Expo application: App.tsx, useCrackDetector.ts, ResultCard.tsx, and related UI/assets. | Expo/React Native framework internals; third-party binary builds. |
| **crack_detector.tflite** | Exported TFLite model consumed by the app (when native inference is enabled). | Training code that produced the model. |

**Exclusions (explicit):** Configuration files (e.g., package.json, tsconfig, babel, metro) are not tested as code; they are part of the environment. Documentation under `docs/` is not executed as software.

### 2.2 Testing Strategy

#### 2.2.1 Unit Testing

- **Notebook (Python):**  
  - **Components in scope:** `is_image_file`, `load_and_preprocess`, `augment_pil`, `pil_from_array_feature`, `load_dataset`, `model_size_kb`, `avg_inference_time_ms`, and the evaluation function (e.g., `evaluate_model`).  
  - **Approach:** Extract testable functions into a module (or run inline in the notebook) and run unit tests with fixed inputs (e.g., a small set of known images, synthetic arrays). Validate: file type filtering, shape and value ranges of preprocessed output, augmentation does not crash and changes output, metrics are in [0,1] where applicable, inference time and model size are positive.  
  - **Model training:** Unit test “one step” or “one epoch” if exposed; otherwise treat training as an integration point and validate via integration tests (e.g., training runs and produces a model that can be evaluated).

- **CrackDetectorApp (TypeScript/React):**  
  - **Components in scope:** `useCrackDetector` hook (loadModel, detectCrack, reset, state transitions); `ResultCard` (renders correctly for processing, crack, no_crack, null result).  
  - **Approach:** Use React Testing Library and Jest. For the hook: mock FileSystem/Asset/manipulateAsync and (if used) TFLite; assert initial state, state after loadModel, after detectCrack (crack vs no_crack, confidence), and after reset. For ResultCard: render with different props and assert presence of expected text and structure (no snapshot dependency if possible).

- **Selection criteria:** All functions that are directly callable and have deterministic behavior for given inputs are candidates for unit tests. Prioritize data preprocessing and detection logic.

#### 2.2.2 Integration Testing

- **Notebook:**  
  - **Order:** (1) Load dataset → (2) Split → (3) Optionally augment → (4) Train one model (e.g., RandomForest or CNN) → (5) Evaluate on test set → (6) Export to TFLite → (7) Run TFLite on the same test set and compare predictions to Keras/sklearn.  
  - **Scope:** Verify that the pipeline runs end-to-end without error and that TFLite output matches the source model (or documented tolerance).

- **App:**  
  - **Order:** (1) App starts and loads model (or simulated model) → (2) User flow: select image (file/gallery mock) → (3) Preprocess image → (4) Run detection → (5) UI shows result and confidence.  
  - **Scope:** Integration between useCrackDetector and App/ResultCard; no real camera required if gallery/file path can be injected.

- **Notebook–App:**  
  - **Scope:** Use the same TFLite model and a small set of images with known labels; run notebook preprocessing and inference and app-side inference (when implemented) and compare results for parity (or document known differences, e.g., preprocessing implementation).

#### 2.2.3 Validation Testing

- **Requirements source:** docs/App-Functions-User-Perspective.md (and any supplementary requirements).  
- **Order:** Validate by feature: startup and loading; permission and gallery-only path; camera capture; preview and retake; analyze and result screen (outcome, confidence, recommendation); new scan.  
- **Approach:** Manual or automated UI tests that perform the above flows and check that the app behavior matches the described user functions and that results are consistent (e.g., confidence in 0–100%, result is either crack or no_crack).

#### 2.2.4 High-Order Testing

- **Types:**  
  - **Performance:** Inference time per image (notebook and, if available, app with TFLite); app startup and time-to-interactive after model load.  
  - **Stress (optional):** Many consecutive analyses; large image input; low memory.  
  - **Recovery (optional):** Behavior when model load fails or image preprocessing fails (e.g., show error or fallback, no crash).  
- **Responsibility:** Developer or designated tester; no separate ITG assumed unless the project assigns one.  
- **Scope:** Prioritize performance of the detection path; stress/recovery only if time permits.

### 2.3 Testing Resources and Staffing

- **Resources:** Python 3.x environment, Node.js/npm, Expo CLI; Concrete_Crack dataset (or a fixed subset); optional: Android/iOS device or emulator for app.  
- **Staffing:** Tests are executed by the development team. Roles: Test author (developer), Test executor (developer or QA if available), Test log keeper (same or project lead).  
- **ITG:** No independent test group is assumed; if one is introduced later, it may own validation and high-order test execution and reporting.

### 2.4 Test Work Products

- Test Specification (this document).  
- Test cases (Section 3: test procedure with cases, expected results, pass/fail criteria).  
- Test data: subset of Concrete_Crack or synthetic images; optional fixture JSON for app.  
- Test results and test log (e.g., spreadsheet or markdown log with date, test id, result, environment).  
- Defect reports (if any) with steps to reproduce and reference to test case.

### 2.5 Test Record Keeping

- **Storage:** Test results and log stored in the project repository (e.g., `docs/` or `tests/`) or in a shared location referenced from the project.  
- **Format:** Test log is chronological (date, test identifier, pass/fail, notes). Results for each run can be summarized in a table (test case id, result, build/commit, environment).  
- **Evaluation:** Failed tests are investigated; defects are logged and linked to test cases. Regression: re-run affected tests after fixes.

### 2.6 Test Metrics

- **Coverage:** Percentage of unit-testable functions (notebook and app) that have at least one test; target set by project (e.g., ≥ 80% for critical path).  
- **Pass rate:** Percentage of test cases passed per run (unit, integration, validation).  
- **Defect count:** Open defects linked to test cases; trend over time.  
- **Performance:** Inference time (ms/image) and, if applicable, app startup/time-to-result; record in test results for regression.

### 2.7 Testing Tools and Environment

- **Notebook:** Python, Jupyter, pytest (if tests are extracted to a module), numpy, PIL, sklearn, TensorFlow, joblib. Environment defined by `requirements.txt`.  
- **App:** Node.js, npm/yarn, Jest, React Testing Library, Expo (Expo Go or dev build). Optional: Detox or Appium for E2E.  
- **Test environment:** Windows 10/11 (from workspace info); same Python and Node versions as development.  
- **Test data:** Concrete_Crack folders; optional: small “golden” set of images and expected labels for regression.  
- **Simulators:** iOS Simulator, Android Emulator, or physical devices for app validation and high-order tests.

### 2.8 Test Schedule

| Phase | Activities | Dependency |
|-------|------------|------------|
| Unit tests (notebook) | Implement and run unit tests for preprocessing and evaluation helpers. | Dataset or fixtures available. |
| Unit tests (app) | Implement and run tests for useCrackDetector and ResultCard. | App build and test runner configured. |
| Integration (notebook) | Run full pipeline including TFLite export and verification. | Unit tests passing. |
| Integration (app) | Run flow: load model → image → detect → result. | Unit tests passing; mock or real TFLite. |
| Validation | Execute validation test cases against user requirements. | Integration passing. |
| High-order | Performance (and optionally stress/recovery) tests. | Validation passing. |

Schedule should be aligned with sprint or release milestones; regression runs before each release.

---

## 3.0 Test Procedure

This section describes the detailed test procedure, including test tactics and test cases.

### 3.1 Software (SCIs) to be Tested

Same as Section 2.1: **CrackClassification.ipynb**, **CrackDetectorApp** (App.tsx, useCrackDetector.ts, ResultCard.tsx), and **crack_detector.tflite**. Exclusions as stated there.

### 3.2 Testing Procedure

#### 3.2.1 Unit Test Cases

**3.2.1.1 Components to be unit tested**

- **Notebook:** `is_image_file`, `load_and_preprocess`, `augment_pil`, `load_dataset` (with a small directory), `model_size_kb`, `avg_inference_time_ms`, `evaluate_model` (with a small model and data).
- **App:** `useCrackDetector` (loadModel, detectCrack, reset); `ResultCard` (all prop combinations: isProcessing true/false, result null/crack/no_crack, confidence value).

**3.2.1.2 Stubs and/or drivers for component i**

- **Notebook:** Use a **test directory** with a few known image files (e.g., 2 crack, 2 non-crack) and optionally synthetic arrays to avoid dependency on full dataset in CI. **Driver:** pytest or notebook cell that calls the functions and asserts on return values/shapes.
- **useCrackDetector:** **Stub** FileSystem, Asset, and image manipulation to return fixed URIs and base64; stub TFLite (if used) to return a fixed prediction. **Driver:** React Testing Library render with a wrapper that provides the hook.
- **ResultCard:** No stubs required; **driver:** React Testing Library render with explicit props.

**3.2.1.3 Test cases — component i (summary)**

| ID | Component | Test case | Input | Action |
|----|-----------|-----------|--------|--------|
| U-N-01 | is_image_file | Accept .png | Path("x.png") | Assert True |
| U-N-02 | is_image_file | Reject .txt | Path("x.txt") | Assert False |
| U-N-03 | load_and_preprocess | Shape and range | Path to 128×128 image, grayscale | Assert shape (128*128,), values in [0,1] |
| U-N-04 | load_and_preprocess | RGB | Path to image, grayscale=False | Assert shape (128*128*3,) |
| U-N-05 | augment_pil | No crash | PIL Image | Apply augment_pil; assert returns PIL Image |
| U-N-06 | load_dataset | Small dirs | Two dirs with 2 images each | Assert X.shape[0]==4, y in {0,1} |
| U-N-07 | evaluate_model | Smoke | X_train, y_train, X_test, y_test, one model | Assert dict has accuracy, precision, recall, f1, inference_ms, model_size_kb; all in valid range |
| U-A-01 | useCrackDetector | Initial state | — | Assert isModelLoaded false, result null, confidence 0 |
| U-A-02 | useCrackDetector | After loadModel | — | After loadModel(), assert isModelLoaded true |
| U-A-03 | useCrackDetector | After detectCrack (crack) | Mock image URI returning “crack” | Assert result 'crack', confidence in [0,100] |
| U-A-04 | useCrackDetector | After reset | After setting result | reset(); assert result null, confidence 0 |
| U-A-05 | ResultCard | Processing | isProcessing=true | Assert “Analyzing surface...” (or equivalent) visible |
| U-A-06 | ResultCard | Crack | result='crack', confidence=80 | Assert “Crack Detected”, “80%”, recommendation text |
| U-A-07 | ResultCard | No crack | result='no_crack', confidence=90 | Assert “No Crack Found”, “90%” |

**3.2.1.4 Purpose of tests for component i**

- **Notebook:** Ensure preprocessing and evaluation logic are correct and robust (file types, shapes, ranges, no silent failures).  
- **App:** Ensure hook state machine and ResultCard display match specification (loading, result, confidence, reset).

**3.2.1.5 Expected results for component i**

- U-N-01: True. U-N-02: False.  
- U-N-03: Array shape (16384,) for 128×128 grayscale, dtype float32, all elements in [0, 1].  
- U-N-04: Array shape (49152,) for 128×128 RGB.  
- U-N-05: PIL Image, same mode as input, not None.  
- U-N-06: X shape (4, 16384) or similar, y length 4, values 0 or 1.  
- U-N-07: Dict with keys accuracy, precision, recall, f1, inference_ms_per_image, model_size_kb; numeric values in expected ranges (e.g., metrics in [0,1], times and size > 0).  
- U-A-01: isModelLoaded false, result null, confidence 0.  
- U-A-02: isModelLoaded true after promise resolves.  
- U-A-03: result 'crack', confidence integer in [0,100].  
- U-A-04: result null, confidence 0.  
- U-A-05: Text “Analyzing surface...” (or as implemented) present.  
- U-A-06: “Crack Detected”, confidence “80%”, recommendation contains “inspection” or equivalent.  
- U-A-07: “No Crack Found”, “90%”, “Surface condition” or equivalent.

---

#### 3.2.2 Integration Testing

**3.2.2.1 Testing procedure for integration**

1. **Notebook pipeline:** In order: load dataset from Concrete_Crack → train_test_split → (optional) augment → train one classifier and/or CNN → evaluate on test set → export to TFLite → load TFLite and run on same test set → compare predictions to original model.  
2. **App flow:** Start app → (mock or real) load model → provide one image (file or mock URI) → trigger detectCrack → assert result and confidence set and UI shows them.

**3.2.2.2 Stubs and drivers required**

- **Notebook:** Real dataset path or a small copy; no stubs. Driver: script or notebook cells.  
- **App:** Mock image picker / file provider to return a fixed image URI; optionally mock TFLite to return fixed output. Driver: integration test (e.g., Jest + RTL or E2E tool).

**3.2.2.3 Test cases and purpose**

| ID | Purpose | Steps | Expected |
|----|---------|--------|----------|
| I-N-01 | Full notebook pipeline runs | Run all cells through TFLite export | No exception; TFLite file created. |
| I-N-02 | TFLite matches Keras/source | Run TFLite on X_test, compare to model.predict(X_test) | Predictions match (or within allowed tolerance). |
| I-A-01 | App: load → image → result | Load app, mock image, call detectCrack | result is 'crack' or 'no_crack', confidence in [0,100]. |
| I-A-02 | App: ResultCard receives result | After detectCrack completes, check ResultCard props | ResultCard shows correct title and confidence. |

**3.2.2.4 Expected results**

- I-N-01: Pipeline completes; crack_detector.tflite exists and has size > 0.  
- I-N-02: Agreement rate between TFLite and source model ≥ 100% on test set (or documented tolerance).  
- I-A-01: result and confidence set; no unhandled exception.  
- I-A-02: UI displays “Crack Detected” or “No Crack Found” and the confidence value.

---

#### 3.2.3 Validation Testing

**3.2.3.1 Testing procedure for validation**

Execute user flows from docs/App-Functions-User-Perspective.md: startup, permission, gallery, camera, preview, analyze, result, new scan. Use manual test or automated E2E (e.g., Detox) where available.

**3.2.3.2 Test cases (validation)**

| ID | User function | Steps | Pass criterion |
|----|----------------|--------|-----------------|
| V-01 | Start app | Launch app | Loading screen appears, then permission or camera. |
| V-02 | Grant permission | Tap “Grant Permission” | System permission prompt; on grant, camera screen. |
| V-03 | Gallery without camera | Deny camera; tap “Or Select from Gallery”; pick image | Preview screen with chosen image. |
| V-04 | Capture photo | On camera screen, tap Capture | Preview screen with captured photo. |
| V-05 | Flip camera | Tap Flip | Camera switches front/back. |
| V-06 | Retake | On preview, tap Retake | Return to camera; previous image discarded. |
| V-07 | Analyze | On preview, tap Analyze | Result screen; “Analyzing...” then result (crack/no_crack) and confidence %. |
| V-08 | Result content | After analysis | Result card shows correct label, confidence in 0–100%, recommendation text. |
| V-09 | New scan | On result, tap New Scan | Return to camera; result cleared. |

**3.2.3.3 Expected results**

- V-01: Loading then permission or camera.  
- V-02: Permission requested; camera screen on allow.  
- V-03: Gallery opens; preview with selected image.  
- V-04: Photo captured and shown on preview.  
- V-05: Facing toggles.  
- V-06: Back to camera, no preview.  
- V-07: Result screen with outcome and confidence.  
- V-08: Label and percentage and recommendation consistent with result.  
- V-09: Camera screen, no result.

**3.2.3.4 Pass/fail criterion for all validation tests**

- **Pass:** All steps complete without crash; app state and UI match the expected result for each case.  
- **Fail:** Any step fails (e.g., button does nothing, wrong screen, missing text, crash). Failed cases are logged and retested after fix.

---

#### 3.2.4 High-Order Testing (System Testing)

**3.2.4.1 Recovery testing**

- **Procedure:** Simulate model load failure (e.g., missing or corrupt TFLite file); simulate preprocessing failure (e.g., invalid image).  
- **Cases:** (1) Model fails to load → app shows error or fallback (e.g., “Model unavailable”) and does not crash. (2) Preprocess fails → detection returns error state or message, no crash.  
- **Pass/fail:** App does not crash; user sees error or fallback message where specified.

**3.2.4.2 Security testing**

- **Scope:** Local app only; no backend. Camera and gallery access follow platform permissions.  
- **Procedure:** Verify that the app only requests camera/photo library as documented; no unnecessary permissions.  
- **Pass/fail:** No extra permissions; behavior consistent with permission grant/deny.

**3.2.4.3 Stress testing (optional)**

- **Procedure:** Run detection repeatedly (e.g., 20–50 times) or with large images.  
- **Pass/fail:** No crash; memory stable (or acceptable growth); results still returned.

**3.2.4.4 Performance testing**

- **Notebook:** Measure inference time (ms/image) for selected model(s) and TFLite on test set; record in test log.  
- **App:** Measure time from “Analyze” tap to result displayed (with real or mocked model).  
- **Pass/fail:** Inference within project budget (e.g., &lt; 500 ms/image on target device); app feels responsive (e.g., result within 2–3 s).

**3.2.4.5 Alpha/beta testing**

- Not required for initial release; can be added if external testers are used.

**3.2.4.6 Pass/fail criterion for all high-order tests**

- **Recovery:** No crash; defined error/fallback behavior.  
- **Security:** Permissions and behavior as specified.  
- **Stress:** No crash; acceptable resource usage.  
- **Performance:** Meets stated thresholds or documented deviation.

---

### 3.3 Testing Resources and Staffing

Same as Section 2.3: Python and Node/Expo environments; dataset; developer-led execution; no dedicated ITG unless assigned.

### 3.4 Test Work Products

- This Test Specification.  
- Test cases (Section 3.2).  
- Test data (fixtures/subset).  
- Test results and test log (Section 3.5).

### 3.5 Test Record Keeping and Test Log

- **Test log:** Chronological record of test runs: date, test id (e.g., U-N-01, I-A-01, V-07), result (pass/fail), environment (Python/Node version, device/emulator), notes.  
- **Storage:** In repo (e.g., `docs/Test-Log.md` or `tests/results/`) or linked location.  
- **Evaluation:** Failures are documented and linked to defects; regression runs after fixes. Optional: dashboard or summary table of last run (pass rate, list of failed cases).

---

*End of Test Specification.*
