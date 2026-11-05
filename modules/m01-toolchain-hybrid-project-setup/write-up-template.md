# M01 Write-Up — Toolchain and Hybrid Project Setup

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own.

## What I built

`PersonalProfileApp`'s skeleton — the toolchain setup, the chosen starter path, and the README that
gets a stranger to a running app.

**Worked example.** I scaffolded `PersonalProfileApp` with `create-expo-app@latest
--template bare-minimum`, confirmed it installed Expo SDK 58 on React Native 0.88, pinned Node 24
with an `.nvmrc`, and committed the generated `ios/` and `android/` folders. The guide for this
stage lives at
[`modules/m01-toolchain-hybrid-project-setup/module-1-toolchain-hybrid-project-setup.md`](./module-1-toolchain-hybrid-project-setup.md),
and the brief at [`brief.md`](./brief.md). On a fresh clone the README takes you from `nvm use` and
`npm install` through `pod install` to `npx expo run:ios` and `npx expo run:android`.

## Why it's built this way (key decisions)

- Which starter path did you use, and why — `create-expo-app --template bare-minimum`, or `init`
  plus `install-expo-modules`? What did you check to decide?

  **Worked example.** I used `--template bare-minimum` because the course wants `ios/` and
  `android/` committed from day one with the smallest Expo surface. I checked three things before
  committing to it: `npx expo --version` and `package.json`'s `expo` pin (to confirm SDK 58),
  `ls -d ios android` (to confirm the native folders exist), and `git status --short` (to confirm
  they are tracked, not ignored). If the template had installed the wrong SDK at freeze time, the
  fallback was `create-expo-app` → `expo install expo-dev-client` → `expo prebuild --clean`.

- What actually broke when you hit each of the three planted faults, and how did you diagnose it
  (not just the fix — the diagnostic path)?

  **Worked example.**
  - **Wrong Node version.** Symptom: CLI/Metro warned about a Node major mismatch. Diagnosis:
    `node -v` showed the wrong major, `cat .nvmrc` and `nvm ls` showed 24 as intended. Fix:
    `nvm install 24 && nvm use 24`, then `rm -rf node_modules && npm install`. Root cause was the
    shell resolving a stale default, which pinning with `.nvmrc` prevents next time.
  - **Missing Pod install.** Symptom: `npx expo run:ios` failed and a native module was missing.
    Diagnosis: `ls ios/Pods` reported no Pods directory and `cat ios/Podfile` showed pods were
    never installed. Fix: `cd ios && bundle exec pod install`, then rebuild.
  - **Bad `ANDROID_HOME`.** Symptom: `npx expo run:android` could not find the SDK/`adb`.
    Diagnosis: `echo "$ANDROID_HOME"` was blank and `ls "$ANDROID_HOME"` failed. Fix: corrected the
    `ANDROID_HOME`/`PATH` exports in `~/.zshrc.d/android.sh`, reloaded the shell, and rebuilt. The
    fix targeted the environment file rather than passing a one-off path, so it survives new
    terminals.

## How to build it (teach it to the next trainee)

**Worked example setup guide, for a new teammate starting cold:**

1. **Xcode 26.4+** — install, then `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`
   and `xcodebuild -version` to confirm.
2. **Android Studio** — install SDK Platform 37 and an API 36 emulator image; verify with
   `sdkmanager --list_installed | grep platforms;android-37` and `java -version`.
3. **Node 24 via nvm** — `brew install nvm`, `nvm install 24`, `nvm alias default 24`, then
   `node -v` must show `v24.x`.
4. **Watchman** — `brew install watchman`, verify with `watchman -v`.
5. **Ruby/Bundler/CocoaPods** — `brew install ruby`, `gem install bundler cocoapods`, verify with
   `pod --version`.
6. **Android env** — export `ANDROID_HOME` and add `platform-tools`/`emulator` to `PATH`, verify
   with `echo "$ANDROID_HOME"` and `adb --version`.
7. **Project** — `npx create-expo-app@latest PersonalProfileApp --template bare-minimum`,
   `cd PersonalProfileApp`, add `.nvmrc` with `24`, run `npm install`.
8. **Run** — `cd ios && bundle exec pod install && cd ..`, then `npx expo run:ios` and
   `npx expo run:android`. Finish with `npx expo-doctor`.

Install order matters: verify each layer before moving on, so a failure points at exactly one tool.

## Concepts worth explaining

**Worked example — Metro, Hermes and the native shell.** `npx expo start` does not build your app;
it starts **Metro**, which walks your imports, transforms JSX/TypeScript, and serves a JavaScript
bundle. On the device, **Hermes** executes that bundle. The **native app shell** — the Swift/Obj-C
iOS app or the Kotlin/Java Android app in your committed `ios/` and `android/` folders — hosts a
React Native view and provides the bridge to native components. React then renders those components
and the OS draws pixels.

**Worked example — why commit `ios/` and `android/` if EAS Build builds them.** The native folders
are the source of truth for native behavior: linked native modules, bundle IDs, icons, URL schemes
and platform config all live there. Committing them means changes are reviewable in Git and can be
hand-linked when needed. EAS Build is a build *service* that compiles those committed projects in
the cloud; owning the code and outsourcing the compilation are separate decisions, and this course
deliberately does both.

## What tripped me up

**Worked example.**
- `pod` was installed but not on `PATH` because Ruby's gem bin directory was not exported — the fix
  was adding it to the shell, not reinstalling CocoaPods.
- A stale `ANDROID_HOME` from an old SDK path survived in one terminal session; only a fresh shell
  (or `source ~/.zshrc`) picked up the corrected file. Lesson: verify in a new terminal.
- Deleting `node_modules` without re-running `npm install` produced confusing Metro errors — a
  reminder to treat "change Node version" and "reinstall dependencies" as one step.

## Checkpoint evidence

**Worked example — capture these as you go.**
- Fresh clone running from the README alone: screenshot/terminal output of `npx expo run:ios` and
  `npx expo run:android` succeeding on a clean clone.
- Clean `npx expo-doctor` output (no errors).
- One note per planted fault with the symptom, the diagnostic command, and the fix — linked to the
  matching Walkthrough 5 subsection in the module guide.

## What I'd do differently

**Worked example.** I would pre-download Xcode and Android Studio before Day 1 (they dominate the
clock), write the README *before* the first build rather than after, and pin Node with `.nvmrc` and
`nvm alias default` in the very first step so no later command ever runs on the wrong major.
