# M01 Tasks — Toolchain and Hybrid Project Setup

Set up a clean machine for iOS and Android builds, create a bare React Native project on Expo's
tooling, and explain what happens between `npx expo start` and pixels on a screen.

> There is no solutions file for this stage. This checklist guides the work; it doesn't contain it.

## Setup

- [ ] Read this stage's `brief.md` fully, including the Logistics section's still-open items.
- [ ] Confirm with your trainer: the exact Xcode version this cohort targets (stack baseline is
      26.4+ — confirm if this cohort tests on a newer major).
- [ ] Confirm with your trainer: whether `create-expo-app --template bare-minimum` installs Expo
      SDK 58 at this cohort's freeze date, or whether to use `init` + `install-expo-modules`
      instead.
- [ ] Install and verify Xcode at the confirmed version.
- [ ] Install and verify Android Studio.
- [ ] Install and verify the JDK.
- [ ] Install and verify Node.js at the pinned version, and Watchman.
- [ ] Install and verify Ruby/Bundler and CocoaPods.
- [ ] Research the bare-workflow idea: why `ios/` and `android/` are committed to Git even though
      Expo's own tooling (Expo Go, dev builds, EAS Build) still does the building for you.
- [ ] Research the two starter paths for a bare project on Expo's tooling
      (`create-expo-app --template bare-minimum` vs. a managed project plus `expo-dev-client`) and
      when each fits.
- [ ] Research the project layout: what `ios/`, `android/`, `app.json`, `metro.config.js` and
      `babel.config.js` are each responsible for.
- [ ] Research how a build actually works: what Metro, Hermes and the native app shell each do
      between `npx expo start` and pixels on a screen.
- [ ] Research `npx expo start`, `npx expo run:ios` and `npx expo run:android`, and what
      `npx expo-doctor` actually checks for.
- [ ] Research Expo Go (for quick JS-only previews before native modules are linked) and EAS Build
      (the build tool you'll use from here through the capstone's release candidates).

## Build

- [ ] Create `PersonalProfileApp` using the confirmed starter path, and record which Expo SDK
      version it actually installed.
- [ ] Run the app on an iOS simulator.
- [ ] Run the app on an Android emulator.
- [ ] Run the app on at least one real device, if you have one available.
- [ ] Write a README section that takes a stranger from a fresh clone to a running app with no
      extra context.
- [ ] Get the three planted setup faults from your trainer and fix each one, recording the symptom
      and the fix as you go.
- [ ] Run `npx expo-doctor` and resolve everything it flags.

## Verify

- [ ] Verify a fresh clone builds and runs on both platforms using only the README.
- [ ] Verify `npx expo-doctor` reports no errors.
- [ ] Verify all three planted setup faults are fixed, with the symptom and fix written down for
      each.
- [ ] Verify you can narrate, unaided, the path from `npx expo start` to the app running on a
      device.
- [ ] Do a final self-review against every checkbox in `brief.md`'s Definition of done.

## Write-up

- [x] Write "What I built" in `write-up-template.md`. — Evidence: filled as a worked example in
      `write-up-template.md` (this APPLY), linking the module guide and brief.
- [x] Write "Why it's built this way (key decisions)": which starter path you used and why, and the
      diagnostic path — not just the fix — for each of the three planted faults, while it's still
      fresh. — Evidence: `write-up-template.md` answers starter-path rationale and symptom →
      diagnosis → fix for all three faults.
- [x] Write "How to build it (teach it to the next trainee)": a setup guide a new teammate could
      follow cold. — Evidence: numbered cold-start setup guide in `write-up-template.md`, mirroring
      Walkthrough 1 of the module guide.
- [x] Write "Concepts worth explaining": pick 1-2 ideas (e.g. what Metro/Hermes/the native shell
      each do, or why the bare workflow commits `ios/`/`android/`) and explain each in your own
      words. — Evidence: two worked-example concepts in `write-up-template.md` (Metro/Hermes/native
      shell; why the native folders are committed despite EAS Build).
- [x] Write "What tripped me up": toolchain surprises, version mismatches. — Evidence: worked-example
      notes in `write-up-template.md` (pod PATH, stale `ANDROID_HOME`, node_modules reinstall).
- [x] Write "Checkpoint evidence": the fresh clone running on both platforms from the README, the
      clean `expo-doctor` output, and the three fixed faults. — Evidence: checkpoint-evidence section
      in `write-up-template.md`, referencing Walkthrough 5 of the module guide.
- [x] Write "What I'd do differently." — Evidence: closing section of `write-up-template.md` filled
      as a worked example.
- [ ] Author `module_01.md` (teaching material for the content library), once write-up-template.md
      is filled in and your build passes VALIDATE: draw the lesson from write-up-template.md's
      "How to build it," "Concepts worth explaining," and "Why it's built this way" sections (not
      its "What tripped me up" / "What I'd do differently" narrative). Close the file with exactly
      5 open-ended comprehension questions — one per distinct concept (reuse concepts if fewer than
      5 distinct ones exist — never pad with an unrelated question to hit the count), never yes/no,
      never containing the answer — and an Understanding Checklist with one self-assessable item
      per question.
