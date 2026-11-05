# Module 1 — Toolchain and Hybrid Project Setup

**Week 1 · Day 1 · 4 hours**

> Goal: stand up the toolchain once, correctly, and prove it by debugging the setup problems a new
> teammate would actually hit.

**Stack for this cohort:** React Native 0.88 · Expo SDK 58 · React 19.3.0 · Node.js 24 LTS ·
New Architecture always on · Xcode 26.4 or newer · Android `compileSdk` 37 / `targetSdk` 36 ·
free tools only, plus a free-tier EAS account.

By the end of this module you will have a `PersonalProfileApp` skeleton that a fresh clone can
build and run on both iOS and Android using only your README — and you will have found and fixed
three planted setup faults along the way.

---

## Learning Goals

By the end of this module you can:

1. Set up a clean machine for iOS and Android builds.
2. Create a bare React Native project that uses Expo's tooling.
3. Run that app on a simulator, an emulator and a real device.
4. Explain what happens between `npx expo start` and pixels on the screen.

---

## Concept

### What "bare workflow on Expo tooling" means

A React Native project can be run in two broad ways:

- **Managed** — you never see the `ios/` and `android/` folders. Expo generates them on demand.
- **Bare** — you own `ios/` and `android/`. They live in your repository and are committed to Git.

This course uses the **bare workflow, but keeps Expo's tooling**. That combination is the point:

- `ios/` and `android/` are **yours and committed**, so you can link native modules, change app
  identity, and understand what the native projects do.
- You still **build and run with Expo's tools** — `npx expo start`, `npx expo run:ios`,
  `npx expo run:android`, and **EAS Build** for cloud builds. You are never required to hand-edit
  Xcode schemes or Gradle files to get a build.

### Two starter paths

There are two ways to arrive at a bare project on Expo tooling:

| Path | Command | Fits when |
| --- | --- | --- |
| **Option A — bare template (course default)** | `npx create-expo-app@latest PersonalProfileApp --template bare-minimum` | You want `ios/` and `android/` from day one, with the smallest possible Expo surface. |
| **Option B — managed + dev client** | `npx create-expo-app@latest PersonalProfileApp` then `npx expo install expo-dev-client` | You start managed and add a development build, letting `expo prebuild` generate native folders when needed. |

This module uses **Option A** unless your trainer says the template does not install SDK 58 at your
cohort's freeze date. In that case use `init` plus `npx expo install expo-modules-core` /
`npx expo install expo-dev-client` as your trainer directs.

### How a build actually works

`npx expo start` does not compile your app. It starts **Metro**, the JavaScript bundler. Metro walks
your imports, transforms JSX/TypeScript, and serves a bundle. On the device, **Hermes** (the
JavaScript engine) executes that bundle. The **native app shell** — the Objective-C/Swift iOS app or
the Kotlin/Java Android app — hosts a React Native view that runs the bundle.

Roughly:

```
npx expo start  ->  Metro bundles JS  ->  bundle served to the device
device          ->  Hermes executes JS ->  React renders native views -> pixels
```

A *native rebuild* (`npx expo run:ios` / `run:android`, or an EAS build) is only needed when native
code or native dependencies change. Pure JavaScript changes hot-reload through Metro.

### Project layout you will inspect

| Path | Responsibility |
| --- | --- |
| `ios/` | The Xcode project and CocoaPods workspace. Yours, committed. |
| `android/` | The Gradle project. Yours, committed. |
| `app.json` / `app.config.js` | App identity: name, slug, bundle ID / application ID, version, icon, splash. |
| `metro.config.js` | Metro bundler configuration. |
| `babel.config.js` | Babel transform configuration (preset, plugins). |

---

## Read These

- `modules/m01-toolchain-hybrid-project-setup/brief.md` — this stage's brief, including Logistics.
- `docs/prd/react-native-bare-workflow-curriculum.md` — §7, Week 1, Module 1.
- `docs/arch-docs/React Native Bare Workflow Curriculum — Solution Design.md` — the release
  decision: native folders committed, EAS Build as the build tool.
- Expo docs: **Bare workflow**, **`expo-doctor`**, **EAS Build**, and **development builds**.

---

## Walkthrough

Do these in order. Each step includes the exact commands and the check that proves it worked. Do
not move to the next step until its check passes.

### Walkthrough 1 — Install and verify the toolchain

Install in this order. After each install, run the check.

#### 1a. Xcode (macOS only)

Install Xcode 26.4 or newer from the App Store, then point the command-line tools at it.

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch
xcodebuild -version
```

**Check:** `xcodebuild -version` prints `Xcode 26.4` or newer. `xcode-select -p` prints the
`/Applications/Xcode.app/...` path (not the Command Line Tools path).

#### 1b. Android Studio, SDK and JDK

Install Android Studio, then in **Settings → SDK Manager** install:

- Android SDK Platform 37 (`compileSdk` 37)
- Android SDK Build-Tools
- An emulator system image (e.g. Android 16 / API 36, `targetSdk` 36)

Android Studio bundles a JDK; confirm it is on your `PATH`.

```bash
sdkmanager --list_installed | grep -E "platforms;android-37|build-tools"
java -version
```

**Check:** the `sdkmanager` line lists `platforms;android-37`, and `java -version` prints a JDK 17+
version.

#### 1c. Pin Node.js 24 LTS with nvm

Use a Node version manager so the pinned version is reproducible.

```bash
brew install nvm
mkdir -p ~/.nvm
cat > ~/.zshrc.d/node.sh << 'EOF'
export NVM_DIR="$HOME/.nvm"
[ -s "$(brew --prefix nvm)/nvm.sh" ] && . "$(brew --prefix nvm)/nvm.sh"
EOF
echo 'source ~/.zshrc.d/node.sh' >> ~/.zshrc
source ~/.zshrc
nvm install 24
nvm alias default 24
node -v
```

**Check:** `node -v` prints a `v24.x` version. If you see a different major, stop — this is planted
fault #1 territory.

#### 1d. Watchman

```bash
brew install watchman
watchman -v
```

**Check:** `watchman -v` prints a version number.

#### 1e. Ruby, Bundler and CocoaPods

CocoaPods is Ruby-based. Use a Ruby version manager so you do not fight the system Ruby.

```bash
brew install ruby
gem install bundler
gem install cocoapods
export PATH="$(gem env gemdir)/bin:$PATH"
pod --version
```

To persist that `PATH` across terminals, add it to your shell file:

```bash
cat > ~/.zshrc.d/ruby.sh << 'EOF'
export PATH="$(gem env gemdir)/bin:$PATH"
EOF
echo 'source ~/.zshrc.d/ruby.sh' >> ~/.zshrc
```

**Check:** `pod --version` prints a version. If `pod` is not found, the gem bin directory is not on
`PATH` — the `export PATH` line above fixes that; re-run `pod --version`.

#### 1f. Android environment variables

Create the file that exports `ANDROID_HOME` and the SDK tools on `PATH`:

```bash
mkdir -p ~/.zshrc.d
cat > ~/.zshrc.d/android.sh << 'EOF'
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"
EOF
echo 'source ~/.zshrc.d/android.sh' >> ~/.zshrc
source ~/.zshrc
echo "$ANDROID_HOME"
adb --version
```

**Check:** `echo "$ANDROID_HOME"` prints `/Users/<you>/Library/Android/sdk`, and `adb --version`
works. A blank `ANDROID_HOME` here is planted fault #3 territory.

---

### Walkthrough 2 — Create the bare project

Create a workspace folder and scaffold the app with **Option A**:

```bash
mkdir -p ~/Projects
cd ~/Projects
npx create-expo-app@latest PersonalProfileApp --template bare-minimum
cd PersonalProfileApp
```

Record which SDK actually installed:

```bash
npx expo --version
node -e "console.log(require('./package.json').dependencies['expo'])"
```

Pin Node for the project so a fresh clone uses the same major:

```bash
cat > .nvmrc << 'EOF'
24
EOF
```

Confirm the native folders exist and that Git sees them:

```bash
ls -d ios android
git status --short
```

**Check:** `ios/` and `android/` are present, `package.json` shows `expo` at `~58.x`, and
`git status` lists the native folders as tracked-to-be, not ignored.

If your trainer confirms the `bare-minimum` template does **not** install SDK 58 at your freeze
date, use the fallback:

```bash
npx create-expo-app@latest PersonalProfileApp
cd PersonalProfileApp
npx expo install expo-dev-client
npx expo prebuild --clean
```

---

### Walkthrough 3 — Run it on both platforms

Start Metro and the dev server:

```bash
npx expo start
```

Press `i` for the iOS simulator, `a` for the Android emulator, or scan the QR code with a device
(Expo Go for pure-JS screens at this stage).

Build and launch a development build on each platform:

```bash
npx expo run:ios
npx expo run:android
```

**Check:** the app renders on the iOS simulator and the Android emulator. On one real device, the
development build installs and launches. If `run:ios` fails on pods, see planted fault #2 below.

---

### Walkthrough 4 — See the build path for yourself

Open the folders you now own and read them:

```bash
ls ios
ls android
sed -n '1,40p' app.json
sed -n '1,40p' metro.config.js
sed -n '1,40p' babel.config.js
```

Produce a minified production-style JS bundle to see what Metro actually outputs:

```bash
npx expo export --platform ios --output-dir dist-check
ls dist-check
```

Now trace the path out loud, in your own words:

1. `npx expo start` starts **Metro**.
2. Metro resolves your imports and produces a **JavaScript bundle**.
3. The **native app shell** (iOS or Android) hosts a React Native view.
4. **Hermes** executes the bundle inside that view.
5. React renders native components, and the OS draws **pixels**.

**Check:** you can name the role of Metro, Hermes and the native shell without looking at notes.
Delete the throwaway export when done:

```bash
rm -rf dist-check
```

---

### Walkthrough 5 — Diagnose the three planted faults

Ask your trainer for the three planted faults, then work each one as **symptom → diagnosis → fix**.
The canonical faults and their diagnostic paths:

#### Fault 1 — Wrong Node version

- **Symptom:** Metro or the CLI warns about a Node version mismatch, or installs behave oddly.
- **Diagnose:**

  ```bash
  node -v
  cat .nvmrc
  nvm ls
  ```

- **Fix:**

  ```bash
  nvm install 24
  nvm use 24
  node -v
  rm -rf node_modules
  npm install
  ```

#### Fault 2 — Missing Pod install

- **Symptom:** `npx expo run:ios` fails; the Xcode workspace is missing the Pods project or a
  native module cannot be found.
- **Diagnose:**

  ```bash
  ls ios/Pods 2>/dev/null || echo "no Pods directory"
  cat ios/Podfile
  ```

- **Fix:**

  ```bash
  cd ios
  bundle exec pod install
  cd ..
  npx expo run:ios
  ```

#### Fault 3 — Bad `ANDROID_HOME`

- **Symptom:** `npx expo run:android` cannot find the SDK or `adb`; Gradle reports the SDK path is
  invalid.
- **Diagnose:**

  ```bash
  echo "$ANDROID_HOME"
  which adb
  ls "$ANDROID_HOME" 2>/dev/null || echo "ANDROID_HOME does not point at a real SDK"
  ```

- **Fix:** correct `~/.zshrc.d/android.sh`, reload it, and rebuild:

  ```bash
  cat > ~/.zshrc.d/android.sh << 'EOF'
  export ANDROID_HOME="$HOME/Library/Android/sdk"
  export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"
  EOF
  source ~/.zshrc
  echo "$ANDROID_HOME"
  npx expo run:android
  ```

Finish with a clean bill of health:

```bash
npx expo-doctor
```

**Check:** `npx expo-doctor` reports no errors. For each fault you fixed, you can state the symptom
and the diagnostic command that led you to the fix — not just the fix itself.

---

### Walkthrough 6 — Write the README a stranger can follow

A fresh clone must go from zero to running using only this file. Create it with real content:

```bash
cat > README.md << 'EOF'
# PersonalProfileApp

A bare React Native app on Expo tooling (Expo SDK 58, React Native 0.88).

## Prerequisites

- Node.js 24 LTS (see `.nvmrc`)
- Xcode 26.4+ and CocoaPods (iOS)
- Android Studio, Android SDK 37, and `ANDROID_HOME` set (Android)

## Run it

### 1. Install dependencies

    nvm use
    npm install

### 2. iOS

    cd ios && bundle exec pod install && cd ..
    npx expo run:ios

### 3. Android

    npx expo run:android

Make sure `ANDROID_HOME` points at your SDK before running Android:

    echo "$ANDROID_HOME"

### 4. Pure-JS preview (optional)

    npx expo start

## Diagnose setup problems

    npx expo-doctor

## Troubleshooting

- **Wrong Node version:** run `nvm install 24 && nvm use 24`, then reinstall dependencies.
- **iOS can't find Pods:** run `cd ios && bundle exec pod install`.
- **Android can't find the SDK:** confirm `ANDROID_HOME` in your shell and re-open the terminal.
EOF
```

**Check:** hand the README to someone (or a fresh terminal) and confirm every command is copy-
pasteable in order with no missing context.

---

## What This Walkthrough Showed You

- How to install and **verify** each piece of the iOS/Android toolchain, in order.
- How to scaffold a **bare** project on Expo tooling and confirm which SDK it installed.
- How to run the app on a **simulator, an emulator and a real device**.
- The actual path from `npx expo start` to pixels: **Metro → bundle → native shell → Hermes**.
- A repeatable **diagnostic loop** for setup faults: reproduce, inspect the environment, fix, verify
  with `npx expo-doctor`.
- How to write a README that makes a fresh clone runnable with no extra context.

---

## EXERCISEs

1. **Reproduce fault #1 on purpose.** Switch to a different Node major with `nvm`, observe the
   failure, then recover to Node 24. Write down the exact symptom.
2. **Rebuild the iOS Pods from scratch.** Delete `ios/Pods` and `ios/Podfile.lock`, reinstall with
   `bundle exec pod install`, and run the app again.
3. **Break `ANDROID_HOME` on purpose.** Point it at a non-existent directory, capture the Gradle
   error, then restore it and confirm `npx expo-doctor` is clean.
4. **Map the layout.** For each of `ios/`, `android/`, `app.json`, `metro.config.js` and
   `babel.config.js`, write one sentence on what it is responsible for.
5. **Explain the build path.** In three or four sentences, describe what Metro, Hermes and the
   native shell each do between `npx expo start` and pixels on screen.
6. **Make the README bulletproof.** Follow your own README in a fresh terminal on a clean clone and
   fix any step that needed extra context.

---

## Self-Check

Answer these in your own words before checking the Appendix.

1. Why does this course commit `ios/` and `android/` to Git even though EAS Build does the actual
   building for you?
2. What does each verification command prove — `node -v`, `pod --version`, `echo "$ANDROID_HOME"` —
   and what would a wrong result tell you?
3. When would you choose `create-expo-app --template bare-minimum` over a managed project plus
   `expo-dev-client`, and when would you choose the other?
4. What are the distinct jobs of Metro, Hermes and the native app shell in getting your code onto a
   screen?
5. For one of the planted faults you fixed, what was the symptom, which command led you to the
   diagnosis, and why did the fix address the root cause?

---

## Module Deliverable

A `PersonalProfileApp` skeleton that a fresh clone can build and run on both platforms using only
the README — with three planted setup faults found and fixed along the way, and `npx expo-doctor`
reporting no errors.

---

## Appendix — Self-Check Answers

1. **Committing `ios/` and `android/`** keeps the native projects under your control and version
   history: native modules, app identity and platform configuration live in the repo and can be
   reviewed and linked by hand. EAS Build still compiles those committed native projects in the
   cloud — building is a service, ownership of the native code is yours.
2. **`node -v`** proves the shell is on the pinned Node 24 major (build tooling depends on it).
   **`pod --version`** proves CocoaPods is installed and reachable on `PATH` (iOS builds fail
   without it). **`echo "$ANDROID_HOME"`** proves the SDK path is exported (Gradle and `adb` need
   it). A wrong result points directly at the layer that needs fixing.
3. Choose **`bare-minimum`** when you want native folders from the start and the smallest Expo
   surface. Choose **managed + `expo-dev-client`** when you want to start managed and add a
   development build, letting `expo prebuild` generate native folders later.
4. **Metro** bundles and serves your JavaScript. **Hermes** executes that bundle on the device.
   The **native shell** hosts the React Native view and provides the bridge between JavaScript and
   native components, which the OS then draws as pixels.
5. Answers vary by fault, but a complete answer names the symptom, the diagnostic command (e.g.
   `node -v`, `ls ios/Pods`, `echo "$ANDROID_HOME"`), and explains why the fix removed the root
   cause rather than only masking the error — for example, pinning Node 24 with `nvm` rather than
   retrying the command, or fixing `ANDROID_HOME` in the shell file rather than passing a path once.
