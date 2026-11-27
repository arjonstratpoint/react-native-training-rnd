# M01 Write-Up — Toolchain and Hybrid Project Setup

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own.

## What I built

`PersonalProfileApp`'s skeleton — the toolchain setup, the chosen starter path, and the README that
gets a stranger to a running app.

**Worked example.** I scaffolded the project with `npx create-expo-app@latest PersonalProfileApp
--template expo-template-blank-typescript`, confirmed `package.json` pins Expo SDK 58 on React
Native 0.88, installed `expo-dev-client`, added NativeWind with its Metro/CSS config, wrote a strict
`tsconfig.json`, and defined `development`, `staging` and `production` EAS profiles in `eas.json`.
Xcode is pinned to **26.6** and Node to **24 LTS** through `.nvmrc`. The guide for this stage lives
at
[`modules/m01-toolchain-hybrid-project-setup/module-1-toolchain-hybrid-project-setup.md`](./module-1-toolchain-hybrid-project-setup.md),
and the brief at [`brief.md`](./brief.md). On a fresh clone the README takes you from `nvm use` and
`npm install` through `npx expo start --dev-client`, local `npx expo run:ios` / `npx expo run:android`,
and an installable EAS development build. `ios/` and `android/` are generated on demand and stay out
of Git.

## Why it's built this way (key decisions)

- Which starter path did you use, and why — `create-expo-app --template bare-minimum`, or `init`
  plus `install-expo-modules`? What did you check to decide?

  **Worked example.** I used the managed TypeScript template plus `expo-dev-client`, not
  `bare-minimum`. The cohort decision is recorded in
  [`knowledge/rules/trainer-decisions.md`](../../knowledge/rules/trainer-decisions.md): Expo SDK 58
  with the managed workflow + Development Client, TypeScript, and NativeWind, built by EAS with
  `eas.json` profiles for development, staging and production. I checked three things before moving
  on: `npx expo --version` and `package.json`'s `expo` pin (SDK 58), `cat .nvmrc` plus `node -v`
  (Node 24 and Xcode 26.6 in the toolchain check), and `git status --short` (no committed native
  folders). The Development Client gives me native-module headroom later while EAS Build generates
  and compiles the native projects, so there is no Xcode scheme or Gradle flavor to maintain by hand.

- What actually broke when you hit each of the three planted faults, and how did you diagnose it
  (not just the fix — the diagnostic path)?

  **Worked example.**
  - **Wrong Node version.** Symptom: CLI/Metro warned about a Node major mismatch. Diagnosis:
    `node -v` showed the wrong major, while `cat .nvmrc` and `nvm ls` showed 24 as intended. Fix:
    `nvm install 24 && nvm use 24`, then `rm -rf node_modules && npm install`. Root cause was the
    shell resolving a stale default; `.nvmrc` plus `nvm alias default` prevents a repeat.
  - **Missing Pod install.** Symptom: `npx expo run:ios` failed after the managed prebuild generated
    `ios/` and a native module was missing. Diagnosis: `ls ios/Pods` reported no Pods directory and
    `cat ios/Podfile` showed pods had never been installed. Fix: `cd ios && bundle exec pod install`,
    then rebuild. CocoaPods still matters even though the native folder is generated, not committed.
  - **Bad `ANDROID_HOME`.** Symptom: `npx expo run:android` could not find the SDK or `adb`.
    Diagnosis: `echo "$ANDROID_HOME"` was blank and `ls "$ANDROID_HOME"` failed. Fix: corrected the
    `ANDROID_HOME`/`PATH` exports in `~/.zshrc.d/android.sh`, reloaded the shell, and rebuilt. The
    fix targeted the environment file rather than passing a one-off path, so it survives new
    terminals.

## How to build it (teach it to the next trainee)

**Worked example setup guide, for a new teammate starting cold:**

1. **Xcode 26.6** — install, then `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`,
   `sudo xcodebuild -runFirstLaunch`, and `xcodebuild -version` must print `Xcode 26.6`.
2. **Android Studio** — install SDK Platform 37 and an API 36 emulator image; verify with
   `sdkmanager --list_installed | grep -E "platforms;android-37|build-tools"` and `java -version`.
3. **Node 24 via nvm** — `brew install nvm`, `mkdir -p ~/.nvm ~/.zshrc.d`, write `~/.zshrc.d/node.sh`,
   `nvm install 24`, `nvm alias default 24`; `node -v` must show `v24.x`.
4. **Watchman** — `brew install watchman`, verify with `watchman -v`.
5. **Ruby/Bundler/CocoaPods** — `brew install ruby`, `gem install bundler`, `gem install cocoapods`,
   export the gem bin directory on `PATH`, verify with `pod --version`.
6. **Android env** — write `~/.zshrc.d/android.sh` with `ANDROID_HOME` and `platform-tools`/`emulator`
   on `PATH`; verify with `echo "$ANDROID_HOME"` and `adb --version`.
7. **Project** — `npx create-expo-app@latest PersonalProfileApp --template expo-template-blank-typescript`,
   `cd PersonalProfileApp`, write `.nvmrc` with `24`, then `nvm use`, `npx expo install expo-dev-client`,
   `npx expo install nativewind`, `npm install --save-dev tailwindcss prettier-plugin-tailwindcss`.
8. **Config** — write `tsconfig.json`, `tailwind.config.js`, `global.css`, `metro.config.js`,
   `app.json` and `eas.json` with the full sample content from Walkthrough 2, and put a NativeWind
   `className` screen in `App.tsx`.
9. **Run** — `npx expo start --dev-client`; locally use `npx expo run:ios` and
   `npx expo run:android`, or install an EAS development build with
   `eas build --profile development --platform ios` and `eas build --profile development --platform
   android`. Finish with `npx expo-doctor`.

Install order matters: verify each layer before moving on, so a failure points at exactly one tool.
The exact commands and full file contents are in Walkthroughs 1–3 of the module guide.

## Concepts worth explaining

**Worked example — Metro, Hermes and the native shell.** `npx expo start --dev-client` does not
build your app; it starts **Metro**, which walks your imports, transforms TypeScript/JSX, and serves
a JavaScript bundle. On the device, **Hermes** executes that bundle. The **native app shell** here is
the generated Development Client — the Swift/Obj-C iOS app or Kotlin/Java Android app produced by
prebuild/EAS. It hosts a React Native view and provides the bridge to native components. React then
renders those components and the OS draws pixels.

**Worked example — why a managed app still needs EAS profiles.** In the managed workflow the native
projects are generated on demand rather than committed, so the source of truth stays in `app.json`,
the TypeScript app and the build config. `eas.json` turns that one source into three concrete
outputs: a `development` build with a development client for iteration, a `staging` internal build
for review, and a `production` release build. Owning the app source and outsourcing native
generation/compilation are separate decisions, and this cohort does both.

## What tripped me up

**Worked example.**
- `pod` was installed but not on `PATH` because Ruby's gem bin directory was not exported — the fix
  was adding it to the shell, not reinstalling CocoaPods.
- A stale `ANDROID_HOME` from an old SDK path survived in one terminal session; only a fresh shell
  (or `source ~/.zshrc`) picked up the corrected file. Lesson: verify in a new terminal.
- Deleting `node_modules` without re-running `npm install` produced confusing Metro errors — a
  reminder to treat "change Node version" and "reinstall dependencies" as one step.
- NativeWind only took effect after importing `global.css` in `App.tsx` and wrapping Metro config;
  installing the package alone did nothing.

## Checkpoint evidence

**Worked example — capture these as you go.**
- Fresh clone running from the README alone: screenshot/terminal output of `npx expo run:ios`,
  `npx expo run:android` and `eas build --profile development --platform ios` succeeding on a clean
  clone.
- Clean `npx expo-doctor` output (no errors), with Xcode 26.6 and Node 24 visible in the same log.
- One note per planted fault with the symptom, the diagnostic command and the fix — linked to the
  matching subsection of Walkthrough 5 in the module guide, with the fresh-clone README check from
  Walkthrough 6.

## What I'd do differently

**Worked example.** I would pre-download Xcode 26.6 and Android Studio before Day 1 (they dominate
the clock), write the README *before* the first build rather than after, pin Node with `.nvmrc` and
`nvm alias default` in the very first step, and create `eas.json` before the first dev build so every
EAS command has a named profile from the start.
