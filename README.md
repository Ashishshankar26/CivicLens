# CivicLens (Android Mobile Application)

> **"See it. Snap it. Fix it."**  
> *A citizen-first civic intelligence and reporting layer that turns visual, location-based citizen observations into structured, verifiable, and prioritized civic issues.*

---

## 📱 Download & Test the Android App

Install the standalone Android build directly on any Android device or emulator:

- ⚡ **[📥 Download CivicLens Android APK (Direct Download)](https://expo.dev/artifacts/eas/t1GUVS_DG4VZwup4TQhfX5AKKxq0_mEi7twxWiYAEZ8.apk)**
- 🏷️ **[View GitHub Release v1.0.0 (APK Assets)](https://github.com/Ashishshankar26/CivicLens/releases/tag/v1.0.0)**

---

## 🌟 Core Features

1. **Shared Civic Map (Google Maps):**
   - Live rendering of community civic issues with category-coded pins (Potholes, Garbage, Streetlights, Road Damage, Other).
   - Distinct active vs. muted resolved marker styling.
   - User live GPS location pin and auto-recenter trigger.
   - Interactive bottom-sheet preview on pin tap with 1-click navigation to issue details.
   - Category and Status filter toggles (`All`, `Active`, `Resolved`).

2. **Core Issue Reporting Workflow:**
   - Real **Camera capture** and **Gallery picker** with high-resolution image preview, retake, and replace options.
   - **AI-Assisted Vision Classification:** Instant category suggestion + confidence percentage (e.g. *"Pothole — 94% confidence"*), with 1-click apply or manual override.
   - Real **GPS location capture** via Expo Location with reverse-geocoded street names and coordinates badge.
   - **Smart Proximity Duplicate Detection:** Checks active issues within **50 meters** of the same category using the Haversine formula. Displays a warning modal with the existing photo & distance, allowing the citizen to confirm the existing issue or report as a separate problem.
   - Photo compression and upload to Firebase Storage + structured persistence in Cloud Firestore.

3. **Community Verification & User-Based Resolution:**
   - **"Still Exists" Button:** Citizens can verify active issues. Real-time community confirmation counter with duplicate prevention per user.
   - **"Mark as Resolved" Button:** Community-driven resolution confirmation. Once verified on site, the issue state smoothly transitions `ACTIVE` $\rightarrow$ `RESOLVED`.

4. **"My Reports" Dashboard & Citizen Profile:**
   - Track submitted civic reports filtered by status.
   - Citizen impact statistics (Reports filed, Confirmations given, Issues resolved).
   - 1-Click Demo Citizen Account switcher for zero-friction hackathon presentations.

---

## 🚀 Getting Started & Running Locally

### 1. Start the Expo Development Server
```powershell
npx expo start
```

### 2. Run on Physical Android Phone (Expo Go)
1. Install **Expo Go** from Google Play Store on your Android phone.
2. Ensure your phone and PC are connected to the same Wi-Fi network (or use `--tunnel` mode: `npx expo start --tunnel`).
3. Scan the terminal QR code with your phone camera or inside Expo Go.

### 3. Run on Android Emulator / Physical Device via USB (Development Build)
```powershell
npx expo run:android
```

---

## 📱 Building the Standalone Android APK

To generate a standalone `.apk` file that can be installed on any Android phone without Expo Go:

```powershell
# Log in to EAS (configured with your Expo account)
eas login

# Build standalone installable APK (configured in eas.json)
eas build -p android --profile preview
```

---

## 🔑 Firebase & Google Maps Configuration

### Google Maps (Optional for Custom Production Keys)
1. Enable **Maps SDK for Android** in the [Google Cloud Console](https://console.cloud.google.com/).
2. Add your API key to `.env` or in `app.json` under `expo.android.config.googleMaps.apiKey`.

### Firebase Configuration
Create a project in [Firebase Console](https://console.firebase.google.com/):
1. Enable **Authentication** (Email/Password provider).
2. Create **Cloud Firestore** database (deploy `firestore.rules`).
3. Enable **Firebase Storage**.
4. Copy the Web configuration keys into your `.env` file based on `.env.example`.

> **Note on Hackathon Resilience:** If Firebase keys are not yet provided, CivicLens automatically activates its built-in local persistence and 12+ pre-seeded realistic civic issues so the map and all features are immediately testable.
