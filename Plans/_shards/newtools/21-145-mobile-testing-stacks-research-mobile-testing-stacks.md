## 14.5 Mobile Testing Stacks (research-mobile-testing-stacks)

This section adds concrete, command-level defaults for iOS, Android, and Expo/React Native testing and preview workflows.

### 14.5.1 Practical comparison matrix

| Stack | Primary test frameworks | E2E/device testing | Live preview/emulator tooling | Artifact capture | Puppet Master integration strengths | Limits / caveats |
|---|---|---|---|---|---|---|
| **Swift / iOS** | XCTest (`XCTestCase`, assertions, `measure`) | XCUITest (native) + optional Appium XCUITest driver | SwiftUI `#Preview`, `@Previewable`, Xcode Canvas, iOS Simulator | XCTest attachments (project-side), simulator screenshots, Appium iOS screen recording | Best native signal quality; stable for app-internal assertions; easy simulator orchestration hooks | Needs macOS runners/Xcode; simulator orchestration is Apple-tooling specific |
| **Kotlin / Android** | Jetpack Compose testing (`createComposeRule`, semantics matchers) + Espresso instrumentation | UIAutomator / AndroidX instrumentation, optional Appium UiAutomator2 | Android Emulator + ADB; Compose preview/testing sync behavior | ADB/device screenshots & recordings, framework logs, CI artifacts | Strong for both view-level and device-level Android validation; good headless CI path | Fragmented stack (Compose vs View system); emulator/device matrix still needed |
| **Expo / React Native** | Jest/unit + framework-level integration tests | **Default:** Detox (gray-box, RN aware). **Fallbacks:** Maestro (flow-first) and Appium (cross-platform WebDriver) | Expo CLI (`expo start`, `expo run:ios`, `expo run:android`), simulator/emulator shortcuts (`i`/`a`) | Detox artifacts plugin (screenshots/video/logs), Maestro `takeScreenshot`, Appium screenshot/screen-record APIs | Highest reuse for RN teams; good dev-loop + CI parity; multiple E2E fallback choices | Detox setup can be strict; Expo managed/bare differences must be explicit in plans |

### 14.5.2 Recommended path + fallback per stack

1. **Swift/iOS**  
   - **Default:** SwiftUI previews (`#Preview`, `@Previewable`) + XCTest/XCUITest on iOS Simulator.  
   - **Fallback:** Appium XCUITest driver where cross-platform automation parity is required.

2. **Kotlin/Android**  
   - **Default:** Compose UI tests + Espresso for instrumentation + targeted UIAutomator flows for system-level interactions.  
   - **Fallback:** Appium UiAutomator2 for teams standardizing on WebDriver tooling.

3. **Expo/React Native**  
   - **Default:** Expo CLI dev flow + Detox for E2E on simulator/emulator with artifacts enabled.  
   - **Fallback:** Maestro for fast, declarative smoke flows; Appium for multi-platform automation parity.

### 14.5.3 Concrete workflow snippets to include in generated plans

#### A) Swift / iOS

```bash
# Preview/runtime iteration in Xcode (manual)
# Use #Preview and @Previewable in SwiftUI view files, then iterate in Canvas.

# Run unit/UI tests on simulator (CI or local)
xcodebuild test \
  -scheme MyApp \
  -destination 'platform=iOS Simulator,name=iPhone 16'

# Capture simulator screenshot artifact
xcrun simctl io booted screenshot .puppet-master/evidence/ios/sim.png
```

#### B) Kotlin / Android

```bash
# Run local JVM tests
./gradlew testDebugUnitTest

# Run instrumentation tests (Compose/Espresso/UIAutomator)
./gradlew connectedDebugAndroidTest

# Capture emulator artifacts
adb exec-out screencap -p > .puppet-master/evidence/android/screen.png
adb shell screenrecord /sdcard/test.mp4
adb pull /sdcard/test.mp4 .puppet-master/evidence/android/test.mp4
```

#### C) Expo / React Native

```bash
# Dev server + simulator/emulator loop
npx expo start      # then press i (iOS sim) or a (Android emulator)

# Native run commands (dev builds)
npx expo run:ios
npx expo run:android

# Detox (default E2E)
detox test -c ios.sim.debug
detox test -c android.emu.debug
```

```json
// detox.config.js artifact baseline
{
  "artifacts": {
    "rootDir": ".puppet-master/evidence/detox",
    "plugins": {
      "screenshot": { "enabled": true, "shouldTakeAutomaticSnapshots": true },
      "video": { "enabled": true },
      "log": { "enabled": true }
    }
  }
}
```

#### D) Fallback E2E snippets

```bash
# Maestro
maestro test flows/smoke.yaml

# Appium (driver-managed screenshots/recordings)
# Use session APIs or executeScript mobile commands in test runtime.
```

