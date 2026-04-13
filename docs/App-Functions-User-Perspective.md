# Crack Detector App — All Functions from User Perspective

This document describes every function and behavior of the app as the user experiences it.

---

## 1. App purpose

The user can **take or choose a photo of a surface** (e.g. wall, pavement, concrete) and **get an automatic answer** whether the image shows a **crack** or **no crack**, plus a **confidence percentage** and a short **recommendation**.

---

## 2. What happens when the app starts

- The app opens and shows a **loading screen**: “Crack Detector” and “Loading AI Model...” with a spinner.
- After the model is ready (a short wait), the app moves on automatically.
- If the app **does not yet have camera permission**, the user sees the **permission screen** (see below).
- If the app **already has camera permission**, the user goes straight to the **camera screen** (see below).

---

## 3. Permission screen (first time or if access was denied)

**What the user sees**

- Title: “Camera Access Required”
- Short text explaining that the camera is needed to capture images of surfaces for crack detection.
- Button: **“Grant Permission”**
- Link/button: **“Or Select from Gallery”**

**What the user can do**

| Action | What happens |
|--------|------------------|
| **Grant Permission** | The device asks for camera access. If the user allows it, the app switches to the camera screen. If they deny it, they stay on this screen (they can still use “Or Select from Gallery”). |
| **Or Select from Gallery** | The device’s photo gallery (or file picker for images) opens. The user can pick an existing image. After they choose an image and optionally crop it (see below), the app shows the **preview screen** with that image. Camera permission is not required for this path. |

---

## 4. Camera screen

**What the user sees**

- Header: “Crack Detector” and subtitle “Point camera at surface”.
- **Live camera view** filling most of the screen.
- A **frame** (rectangle with corners) and the text “Position surface within frame” to guide where to aim.
- At the bottom, three controls:
  - **Gallery** (icon): open photo library.
  - **Capture** (large round button): take a photo.
  - **Flip** (icon): switch between back and front camera.

**What the user can do**

| Action | What happens |
|--------|------------------|
| **Point the camera** | They aim at a surface. The frame is only a guide; the app does not force them to hold the device in a special way. |
| **Tap Gallery** | Same as “Or Select from Gallery” on the permission screen: gallery opens, user selects an image, can crop to a square (1:1), then the app shows the **preview screen** with that image. |
| **Tap Capture** | The app takes a photo. The photo is shown on the **preview screen** so the user can confirm before analysis. |
| **Tap Flip** | The camera switches between back and front. Useful if they want to use the front camera for a surface (e.g. selfie-style shot). |

---

## 5. Preview screen (after capture or after picking from gallery)

**What the user sees**

- Header: “Crack Detector” and subtitle “Review your image”.
- The **photo they just took or selected**, filling the content area.
- A small overlay at the bottom: “Ready to analyze”.
- Two buttons:
  - **Retake** (or similar): discard this image and go back.
  - **Analyze**: run crack detection on this image.

**What the user can do**

| Action | What happens |
|--------|------------------|
| **Retake** | The current image is discarded. The app returns to the **camera screen** so they can take a new photo or pick another from the gallery. Any previous result is cleared. |
| **Analyze** | The app switches to the **result screen** and starts analyzing the image. The user first sees the same image and a short “Analyzing surface...” (or similar) state, then the **detection result** appears (see below). |

---

## 6. Result screen

**What the user sees (during analysis)**

- Header: “Crack Detector” and subtitle “Analysis complete” (or similar).
- The **same image** they analyzed at the top.
- A card or block with:
  - A spinner or loading message, e.g. “Analyzing surface...” and “ML is examining the image”.

**What the user sees (after analysis)**

- The image stays at the top (user can scroll if the content is long).
- A **result card** that shows:
  - **Outcome:** either **“Crack Detected”** (with a warning-style look) or **“No Crack Found”** (with a positive look).
  - **Short description:** e.g. that a crack was detected and inspection/repair may be needed, or that the surface looks intact.
  - **Confidence:** a label “Confidence” and a **percentage** (e.g. 73%) and usually a **bar** showing that value.
  - **Recommendation:** e.g. “Recommended: Schedule professional inspection” for crack, or “Surface condition: Good” for no crack.
- One main action: **“New Scan”** (or similar).

**What the user can do**

| Action | What happens |
|--------|------------------|
| **Scroll** | If the result card and image are taller than the screen, the user can scroll to see everything. |
| **New Scan** | The result is cleared and the app returns to the **camera screen**. They can take or choose another image and run detection again. |

So from the user’s point of view, the only **function** on the result screen is: **start a new scan** (and read the result).

---

## 7. Summary of all user-facing functions

| Function | Where it’s available | What the user does | What they get |
|----------|---------------------|--------------------|----------------|
| **Start the app** | — | Open the app | Loading screen, then permission or camera. |
| **Grant camera permission** | Permission screen | Tap “Grant Permission” | Camera access (if they allow) and then camera screen. |
| **Choose image from gallery** | Permission screen, Camera screen | Tap “Or Select from Gallery” or Gallery icon, then pick and optionally crop image | Preview screen with that image. |
| **Take a photo** | Camera screen | Tap Capture | Preview screen with that photo. |
| **Switch camera (front/back)** | Camera screen | Tap Flip | Camera view switches. |
| **Discard and try again** | Preview screen | Tap Retake | Back to camera screen; image discarded. |
| **Run crack detection** | Preview screen | Tap Analyze | Result screen: “Analyzing...”, then outcome (crack / no crack), confidence %, recommendation. |
| **Read result** | Result screen | Look at the card | Outcome, short description, confidence percentage, recommendation. |
| **Start another check** | Result screen | Tap New Scan | Back to camera screen; can capture or pick another image. |

---

## 8. What the user does *not* do

- The user **does not** type or log in; there is no account.
- The user **does not** choose model or settings; detection runs with the built-in logic.
- The user **does not** save or export results inside the app in the current description (unless you add that later).
- The user **does not** correct or label the result; they only read it and can start a new scan.

---

*This describes all functions of the Crack Detector app from the user’s perspective.*
