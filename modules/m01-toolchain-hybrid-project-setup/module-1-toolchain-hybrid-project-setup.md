# Module 1 — Toolchain and Hybrid Project Setup

**Week 1 · Day 1 · 4 hours**

> Goal: stand up the toolchain once, correctly, and prove it by debugging the setup problems a new
> teammate would actually hit.

**Stack for this cohort:** React Native 0.88 · Expo SDK 58 · React 19.3.0 · Node.js 24 LTS ·
TypeScript · NativeWind · New Architecture always on · **Xcode 26.6** · Android `compileSdk` 37 /
`targetSdk` 36 · **managed workflow + Development Client** · **EAS Build with `development`,
`staging` and `production` profiles** · free tools only, plus a free-tier EAS account.

By the end of this module you will have a `PersonalProfileApp` skeleton that a fresh clone can
build and run on both iOS and Android using only your README — with three planted setup faults found
and fixed along the way. The app is a managed Expo SDK 58 project with a Development Client, typed
with TypeScript, styled with NativeWind, and built through EAS profiles.

---

## Learning Goals

By the end of this module you can:

1. Install and verify a clean iOS/Android toolchain, including Xcode 26.6 and Node 24 LTS.
2. Scaffold a managed Expo SDK 58 app with a Development Client, TypeScript and NativeWind.
3. Run that app on a simulator, an emulator, a real device, and through an EAS development build.
4. Configure EAS Build profiles for development, staging and production, and explain what each
   profile changes.
5. Explain what happens between starting Metro and seeing pixels on the screen.

---

## Concept

### Managed workflow + Development Client on Expo tooling

This cohort uses a **managed Expo SDK 58 project**, not a hand-committed native project:

- You own the JavaScript/TypeScript app, `app.json`, Babel/Metro config, `tsconfig.json`,
  NativeWind config and `eas.json`.
- `ios/` and `android/` are **generated on demand** by `expo prebuild`, `expo run:*` or EAS Build.
  They are not committed; `git status` stays clean after a local build.
- A **Development Client** (`expo-dev-client`) is the app shell that loads your bundle. It lets you
  add native modules later without leaving Expo's tooling.
- **EAS Build** produces installable development, staging and production builds in the cloud from
  the same source. You do not maintain Xcode schemes or Gradle flavors by hand.

The cohort decision is concrete: **use Expo SDK 58 with the managed workflow + Development Client,
TypeScript, and NativeWind. Use EAS Build with eas.json for development, staging, and production.**

### Two starter paths, and the one this module uses

| Path | Command | Fits when |
| --- | --- | --- |
| **Option A — bare template** | `npx create-expo-app@latest PersonalProfileApp --template bare-minimum` | You want `ios/` and `android/` in Git from day one and the smallest possible Expo surface. |
| **Option B — managed + dev client (this cohort)** | `npx create-expo-app@latest PersonalProfileApp --template expo-template-blank-typescript` then `npx expo install expo-dev-client` | You want Expo to generate native folders on demand, with TypeScript and a development build from the start. |

This module uses **Option B**. Add NativeWind through its Expo-compatible install and config, and
define the three EAS profiles in `eas.json`. Option A remains useful for teams that deliberately
commit native folders, but it is not the path this cohort builds.

### How a build actually works

Starting the dev server does not compile a native app. `npx expo start --dev-client` starts **Metro**,
the JavaScript bundler. Metro walks your imports, transforms TypeScript/JSX, and serves a bundle to
the Development Client. On the device, **Hermes** executes that bundle. The **native app shell**
generated from the managed project hosts a React Native view; React renders native components and
the OS draws pixels.

```
npx expo start --dev-client  ->  Metro bundles TS/JS  ->  bundle served to the dev client
device                       ->  Hermes executes JS   ->  React renders native views -> pixels
```

A **native rebuild** is needed when native code or native dependencies change, or when you want an
installable build: `npx expo run:ios`, `npx expo run:android`, or `eas build --profile <name>`. Pure
TypeScript changes hot-reload through Metro. Expo Go still gives a quick JS-only preview before
native modules are linked; the Development Client is what you use once native code is involved.

### Project layout you will create and inspect

| Path | Responsibility |
| --- | --- |
| `app.json` | App identity: name, slug, bundle ID / package, version, New Architecture flag, icon and splash. |
| `tsconfig.json` | Strict TypeScript settings for the app. |
| `babel.config.js` | Babel preset used by Expo (and any transform plugins you add). |
| `metro.config.js` | Metro configuration, wrapped with NativeWind's CSS input. |
| `global.css` / `tailwind.config.js` | NativeWind's utility classes and content paths. |
| `eas.json` | EAS Build profiles: `development`, `staging` and `production`. |
| `ios/` / `android/` | Generated by prebuild/EAS when a native build is requested; ignored by Git in this workflow. |

---

## Read These

- `modules/m01-toolchain-hybrid-project-setup/brief.md` — this stage's brief and its stack constraints.
- `docs/prd/react-native-bare-workflow-curriculum.md` — §7, Week 1, Module 1.
- `docs/arch-docs/React Native Bare Workflow Curriculum — Solution Design.md` — version baseline
  and the EAS-first build decision (the cohort decisions above override its bare-workflow premise).
- Expo docs: **managed workflow**, **development builds**, **`expo-doctor`**, **EAS Build**,
  **EAS build profiles**, and the **NativeWind + Expo** setup guide.
- `knowledge/rules/trainer-decisions.md` — the resolved cohort answers used throughout this guide.

---

## Walkthrough

Do these in order. Each step includes the exact commands and the check that proves it worked. Do
not move to the next step until its check passes.

### Walkthrough 1 — Install and verify the toolchain

Install in this order. After each install, run the check.

#### 1a. Xcode 26.6 (macOS only)

Install **Xcode 26.6**, then point the command-line tools at it.

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch
xcodebuild -version
xcode-select -p
```

**Check:** `xcodebuild -version` prints `Xcode 26.6`, and `xcode-select -p` prints the
`/Applications/Xcode.app/...` path (not the Command Line Tools path). Xcode 27 replaces
Simulator.app with Device Hub, so do not swap majors mid-cohort.

#### 1b. Android Studio, SDK and JDK

Install Android Studio, then in **Settings → SDK Manager** install:

- Android SDK Platform 37 (`compileSdk` 37)
- Android SDK Build-Tools
- An emulator system image (e.g. Android 16 / API 36, `targetSdk` 36)

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
mkdir -p ~/.nvm ~/.zshrc.d
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

**Check:** `node -v` prints a `v24.x` version. If you see a different major, you have planted fault
#1 — fix it with the diagnostic path in Walkthrough 5.

#### 1d. Watchman

```bash
brew install watchman
watchman -v
```

**Check:** `watchman -v` prints a version number.

#### 1e. Ruby, Bundler and CocoaPods

EAS and local `expo run:ios` generate an iOS project that uses CocoaPods. You do not hand-edit it,
but the tooling still needs `pod` on `PATH`.

```bash
brew install ruby
gem install bundler
gem install cocoapods
export PATH="$(gem env gemdir)/bin:$PATH"
pod --version
mkdir -p ~/.zshrc.d
cat > ~/.zshrc.d/ruby.sh << 'EOF'
export PATH="$(gem env gemdir)/bin:$PATH"
EOF
echo 'source ~/.zshrc.d/ruby.sh' >> ~/.zshrc
```

**Check:** `pod --version` prints a version. If `pod` is not found, the gem bin directory is not on
`PATH` — the `export` and shell file above fix it.

#### 1f. Android environment variables

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

### Walkthrough 2 — Scaffold the managed app

Create the workspace, scaffold with the SDK 58 TypeScript template, add the Development Client and
NativeWind, then write the cohort's config files with full content.

```bash
mkdir -p ~/Projects
cd ~/Projects
npx create-expo-app@latest PersonalProfileApp --template expo-template-blank-typescript
cd PersonalProfileApp
cat > .nvmrc << 'EOF'
24
EOF
nvm use
npx expo install expo-dev-client
npx expo install nativewind
npm install --save-dev tailwindcss prettier-plugin-tailwindcss
cat > tsconfig.json << 'EOF'
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
EOF
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: { extend: {} },
  plugins: [],
};
EOF
cat > global.css << 'EOF'
@import "tailwindcss";
@config "./tailwind.config.js";
EOF
cat > metro.config.js << 'EOF'
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
EOF
cat > app.json << 'EOF'
{
  "expo": {
    "name": "PersonalProfileApp",
    "slug": "personal-profile-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.training.personalprofile"
    },
    "android": {
      "package": "com.training.personalprofile"
    }
  }
}
EOF
cat > eas.json << 'EOF'
{
  "cli": {
    "version": ">= 16.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "staging": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_ENV": "staging"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
EOF
cat > App.tsx << 'EOF'
import "./global.css";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, Text, View } from "react-native";

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold text-slate-900">PersonalProfileApp</Text>
        <Text className="mt-2 text-base text-slate-600">
          Expo SDK 58 · Development Client · TypeScript · NativeWind
        </Text>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
EOF
npx expo --version
node -e "console.log(require('./package.json').dependencies['expo'])"
git status --short
```

**Check:** the `expo` dependency resolves to `~58.x`, `.nvmrc` contains `24`, `eas.json` has all
three profiles, and `git status --short` does **not** list `ios/` or `android/` — managed projects
generate those folders only when a native build is requested.

---

### Walkthrough 3 — Run it everywhere

Start the dev server (this command blocks; run it in its own terminal):

```bash
npx expo start --dev-client
```

In a second terminal, confirm the environment and attached devices:

```bash
adb devices
xcrun simctl list devices | grep Booted || true
npx expo-doctor
```

Press `i` for a booted iOS simulator, `a` for a running Android emulator, or scan the QR code with
a Development Client installed on a real device.

Build and launch local development builds:

```bash
npx expo run:ios
npx expo run:android
```

**Check:** the app renders on the iOS simulator and the Android emulator; `expo-doctor` is clean.

Produce installable builds through EAS, including one for a real device:

```bash
npm install -g eas-cli
eas login
eas init
eas build --profile development --platform ios
eas build --profile development --platform android
eas build --profile staging --platform all
```

The `development` profile uses `developmentClient: true` so the build can load your Metro bundle;
`staging` and `production` are internal/release builds driven by the same `eas.json`. If
`run:ios` fails on pods, see planted fault #2 below.

---

### Walkthrough 4 — See the build path for yourself

Open the files you now own and read them:

```bash
sed -n '1,80p' app.json
sed -n '1,80p' metro.config.js
sed -n '1,80p' tsconfig.json
sed -n '1,100p' eas.json
git check-ignore ios android || true
```

Produce a minified production-style JS bundle to see what Metro actually outputs:

```bash
npx expo export --platform ios --output-dir dist-check
ls dist-check
```

Now trace the path out loud, in your own words:

1. `npx expo start --dev-client` starts **Metro**.
2. Metro resolves your imports and produces a **JavaScript bundle** from TypeScript/JSX.
3. The **Development Client** — the generated native app shell for iOS or Android — hosts a React
   Native view.
4. **Hermes** executes the bundle inside that view.
5. React renders native components, and the OS draws **pixels**.

**Check:** you can name the role of Metro, Hermes and the native shell without looking at notes,
and `git check-ignore` confirms generated native folders are not tracked.

Clean up the throwaway export:

```bash
rm -rf dist-check
```

---

### Walkthrough 5 — Diagnose the three planted faults

Work each of the three canonical setup faults as **symptom → diagnosis → fix**. Record the symptom
and the diagnostic command for your write-up, not just the final command you ran.

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

#### Fault 2 — Missing Pod install after a generated iOS build

- **Symptom:** `npx expo run:ios` fails; the generated Xcode workspace is missing the Pods project
  or a native module cannot be found.
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

**Check:** `npx expo-doctor` reports no errors, and for each fault you can state the symptom and the
diagnostic command that led to the fix.

---

### Walkthrough 6 — Write the README a stranger can follow

A fresh clone must go from zero to running using only this file. Create it with real content:

```bash
cat > README.md << 'EOF'
# PersonalProfileApp

A managed Expo SDK 58 app (React Native 0.88) with a Development Client, TypeScript, NativeWind
and EAS Build profiles for development, staging and production.

## Prerequisites

- Node.js 24 LTS (see `.nvmrc`)
- Xcode 26.6 and CocoaPods for local iOS builds
- Android Studio, Android SDK 37 / `targetSdk` 36, and `ANDROID_HOME` set
- A free EAS account (`eas login`)

## 1. Install dependencies

    nvm use
    npm install

## 2. Start the dev server

    npx expo start --dev-client

Scan the QR code with a Development Client, or press `i` / `a` for a local simulator or emulator.

## 3. Local development build (optional)

    npx expo run:ios
    npx expo run:android

## 4. EAS development build (installable on a real device)

    npm install -g eas-cli
    eas login
    eas init
    eas build --profile development --platform ios
    eas build --profile development --platform android

## 5. Other profiles

    eas build --profile staging --platform all
    eas build --profile production --platform all

## Diagnose setup problems

    npx expo-doctor

## Troubleshooting

- Wrong Node version: `nvm install 24 && nvm use 24`, then `rm -rf node_modules && npm install`.
- iOS can't find Pods after a generated build: `cd ios && bundle exec pod install`.
- Android can't find the SDK: confirm `ANDROID_HOME` in your shell and reopen the terminal.
EOF
```

**Check:** hand the README to someone (or a fresh terminal) and confirm every command is
copy-pasteable in order with no missing context.

---

## What This Walkthrough Showed You

- How to install and **verify** each toolchain layer in order, with Xcode pinned to **26.6** and
  Node to 24 LTS.
- How to scaffold a **managed** Expo SDK 58 app with a Development Client, TypeScript, NativeWind
  and a three-profile `eas.json`.
- How to run the app on a **simulator, emulator, real device and EAS development build**, while
  generated `ios/` and `android/` stay out of Git.
- The path from `npx expo start --dev-client` to pixels: **Metro → bundle → Development Client /
  native shell → Hermes → React views**.
- A repeatable **diagnostic loop** for setup faults: reproduce, inspect the environment, fix the
  root cause, verify with `npx expo-doctor`.
- How to write a README that makes a fresh clone runnable with no extra context.

---

## EXERCISEs

1. **Reproduce fault #1 on purpose.** Switch to a different Node major with `nvm`, observe the
   failure, then recover to Node 24. Write down the exact symptom.
2. **Rebuild the generated iOS Pods from scratch.** After a local `expo run:ios`, delete `ios/Pods`
   and `ios/Podfile.lock`, reinstall with `bundle exec pod install`, and run the app again.
3. **Break `ANDROID_HOME` on purpose.** Point it at a non-existent directory, capture the Gradle
   error, then restore it and confirm `npx expo-doctor` is clean.
4. **Map the config.** For each of `app.json`, `tsconfig.json`, `metro.config.js`, `global.css` and
   `eas.json`, write one sentence on what it is responsible for, and state where the generated
   native folders go.
5. **Explain the build path.** In three or four sentences, describe what Metro, Hermes and the
   native shell each do between the dev server starting and pixels appearing.
6. **Make the README bulletproof.** Follow your own README in a fresh terminal on a clean clone,
   including one EAS development build, and fix any step that needed extra context.

---

## Self-Check

Answer these in your own words before checking the Appendix.

1. Why does this cohort scaffold a managed Expo SDK 58 app with a Development Client instead of
   committing native folders from day one, and where do EAS profiles fit in that choice?
2. How do you decide which verification command proves each layer of the toolchain is ready, and
   what does a failing result tell you about where to look next?
3. What does each file you created — `tsconfig.json`, the NativeWind config in `metro.config.js` and
   `global.css`, and `eas.json` — contribute to a typed, styled app with three build profiles?
4. Describe, without looking at notes, what happens between starting Metro and seeing pixels on the
   device, naming the runtime piece that executes the bundle and the one that hosts it.
5. When a build fails after a setup change, how do you move from symptom to root cause and then
   prove the fix using the same README a stranger would follow?

### Understanding Checklist

- [ ] I can explain why the managed + Development Client path is used here and what `development`,
      `staging` and `production` profiles change, without looking at the guide.
- [ ] I can match `xcodebuild -version`, `node -v`, `pod --version` and `echo "$ANDROID_HOME"` to the
      layer each one proves, and say what a wrong result means.
- [ ] I can describe the job of `tsconfig.json`, NativeWind's config files and `eas.json` in one
      sentence each.
- [ ] I can trace Metro → bundle → native shell → Hermes → React views → pixels unaided.
- [ ] I can walk through one planted fault from symptom to diagnostic command to root-cause fix and
      show the clean `expo-doctor` result.

---

## Module Deliverable

A `PersonalProfileApp` skeleton on the managed Expo SDK 58 workflow with a Development Client,
TypeScript, NativeWind and `eas.json` profiles for development, staging and production. A fresh
clone builds and runs on both platforms using only the README — with three planted setup faults
found and fixed along the way, and `npx expo-doctor` reporting no errors.

---

## Appendix — Self-Check Answers

1. **Managed + Development Client and EAS profiles.** The managed workflow keeps native projects
   generated on demand instead of committed, so a fresh clone needs no hand-maintained `ios/` or
   `android/`. The Development Client is the app shell that loads the Metro bundle and still allows
   native modules later. `eas.json` then defines three reproducible builds: `development` uses a
   development client for local iteration, `staging` is an internal pre-release build, and
   `production` is the release build — all compiled by EAS from the same source.
2. **Verification commands.** `xcodebuild -version` proves Xcode 26.6 is selected; `node -v` proves
   the shell is on Node 24; `pod --version` proves CocoaPods is reachable for generated iOS builds;
   `echo "$ANDROID_HOME"` proves the SDK path is exported for Gradle and `adb`. A wrong result
   points directly at the layer that needs fixing before any later command is trusted.
3. **Config files.** `tsconfig.json` turns on strict TypeScript for the app. `global.css` and the
   NativeWind wrapper in `metro.config.js` feed utility-class styles into Metro; `tailwind.config.js`
   lists the content paths those classes are scanned from. `eas.json` names the three build profiles
   and what each one produces.
4. **Build path.** Metro transforms TypeScript/JSX and serves a JavaScript bundle. The generated
   native app shell — the Development Client — hosts a React Native view on the device. Hermes
   executes the bundle inside that view, React renders native components, and the OS draws pixels.
5. **Diagnostic loop.** State the symptom, run the smallest command that localizes it (`node -v`,
   `ls ios/Pods`, or `echo "$ANDROID_HOME"`), fix the root cause in the configuration file rather
   than with a one-off override, then re-run the failing path and finish with a clean
   `npx expo-doctor`. The README should contain the same commands so a stranger can repeat them.
