# M02 Write-Up — Community Modules and Native Linking

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own.

## What I built

AsyncStorage, vector icons and safe-area-context linked into the profile app, plus the lock-in
audit.

**Worked example.** I added `@react-native-async-storage/async-storage`,
`react-native-safe-area-context` and `react-native-vector-icons` to `PersonalProfileApp` with
`npx expo install`, then linked the icon font by hand on both platforms: `UIAppFonts` in
`ios/PersonalProfileApp/Info.plist` and the package's `fonts.gradle` applied from
`android/app/build.gradle`. The profile screen stores a display name across relaunches, renders an
Ionicons glyph, and prints a non-zero safe-area inset on both platforms.

- Module guide: [`modules/m02-community-modules-native-linking/module-2-community-modules-native-linking.md`](./module-2-community-modules-native-linking.md)
- Stage brief: [`modules/m02-community-modules-native-linking/brief.md`](./brief.md)
- Lock-in audit: `PersonalProfileApp/docs/lock-in-audit.md`
- Build evidence: `PersonalProfileApp/docs/evidence/m02-ios-build.log`,
  `PersonalProfileApp/docs/evidence/m02-android-build.log`, plus one screenshot per platform showing
  the glyph, the safe-area inset and the restored AsyncStorage value.

## Why it's built this way (key decisions)

- For each of the three modules, what made you confident (or not) that it was safe to take on?

  **Worked example.** I judged all three as core features, so a community module beat a small Expo
  utility. `@react-native-async-storage/async-storage` (3.1.1) is the de facto storage module, has
  recent releases, supports the New Architecture and is listed and actively maintained on React
  Native Directory. `react-native-safe-area-context` (5.11.1) is the native insets API that
  navigation libraries already depend on; it also has recent releases, New Architecture support and
  a healthy Directory listing. `react-native-vector-icons` (10.3.0) was the one I trusted least at
  first: it is maintained by one person plus community contributors, and it needs a manual resource
  step. I took it because the icon font is a genuine native-resource lesson, the package is still
  released regularly, it runs under the New Architecture interop layer, and my exit is cheap — every
  icon sits behind one `<AppIcon />` component, so switching to `@expo/vector-icons` or
  `react-native-svg` is a one-file change. I put the storage calls behind
  `src/storage/profileStorage.js` for the same reason: the audit's exit plan should point at one
  seam, not a scavenger hunt.

- Where did autolinking need help, and what did you have to do by hand?

  **Worked example.** Autolinking registered all three native modules. It did **not** register the
  font resource. On iOS, the `RNVectorIcons` pod appeared in `ios/Podfile.lock` after
  `bundle exec pod install`, but the font was still invisible until I added `Ionicons.ttf` to
  `UIAppFonts` in `Info.plist` and rebuilt. On Android, the module compiled after
  `npx expo install`, but the `.ttf` never reached the APK until I appended
  `project.ext.vectoricons = [iconFontNames: ['Ionicons.ttf']]` and
  `apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")` to
  `android/app/build.gradle`. That is the line between "native code is linked" and "native resource
  is available", and this module is about learning to see it.

## How to build it (teach it to the next trainee)

**Worked example — linking a community native module by hand, using `react-native-vector-icons` as
the example. This assumes the M01 app builds on both platforms and `npx expo-doctor` is clean.**

1. **Install with the SDK in charge.** From the app root:

   ```bash
   npx expo install react-native-vector-icons
   npx expo-doctor
   ```

   Let `expo install` pick the version. Do not hand-pin a version you found on npm.

2. **Link the iOS native module.** Run CocoaPods so autolinking writes the pod into the workspace:

   ```bash
   cd ios && bundle exec pod install && cd ..
   grep -n "RNVectorIcons" ios/Podfile.lock
   ```

   The `grep` proves the pod is in the lockfile. If it is missing, autolinking did not see the
   package — reinstall and re-run `pod install`.

3. **Register the iOS resource.** Add the font filename to `UIAppFonts`. This script is safe to run
   twice:

   ```bash
   python3 - << 'PY'
   import plistlib
   from pathlib import Path

   plist_path = Path("ios/PersonalProfileApp/Info.plist")
   with plist_path.open("rb") as fh:
       plist = plistlib.load(fh)

   fonts = plist.setdefault("UIAppFonts", [])
   if "Ionicons.ttf" not in fonts:
       fonts.append("Ionicons.ttf")

   with plist_path.open("wb") as fh:
       plistlib.dump(plist, fh)

   print("UIAppFonts:", plist["UIAppFonts"])
   PY
   /usr/libexec/PlistBuddy -c "Print :UIAppFonts" ios/PersonalProfileApp/Info.plist
   ```

   Then rebuild: `npx expo run:ios`.

4. **Register the Android resource.** Apply the package's Gradle script from the **app** module:

   ```bash
   grep -q "react-native-vector-icons/fonts.gradle" android/app/build.gradle || cat >> android/app/build.gradle << 'EOF'

   project.ext.vectoricons = [
       iconFontNames: ['Ionicons.ttf']
   ]
   apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")
   EOF
   tail -n 12 android/app/build.gradle
   ```

   Then rebuild: `npx expo run:android`.

5. **Prove it with code, not a screenshot of a build.** Render one icon, read one safe-area inset and
   write/read one AsyncStorage key. The full entry component is in Walkthrough 5 of the module guide;
   it wraps the screen in `SafeAreaProvider`, shows `useSafeAreaInsets().top`, and stores
   `profile:displayName`.

6. **Verify the real behaviour:** type a name, save, force-quit, relaunch — the value must come back.
   Check the glyph renders (not a crossed-out box) and the inset is non-zero. Repeat on both
   platforms.

7. **Handle the two classic failures.** iOS: re-check `UIAppFonts`, then
   `rm -rf ios/build && npx expo run:ios`. Android: re-check the Gradle block, then
   `rm -rf android/app/build && npx expo run:android`. Details are in the guide's troubleshooting
   table.

8. **Finish with the audit and the health check.** Run the four safety checks per dependency, write
   `docs/lock-in-audit.md`, then `npx expo-doctor`.

The order matters: install → link native code → register resources → prove behaviour. Skipping from
install to "it builds" is how resource bugs reach a device.

## Concepts worth explaining

**Worked example — autolinking versus manual linking.** Autolinking is the install-time step that
finds a package's `.podspec` and Gradle project and wires its native code into your app. It removes
the old manual `Podfile`/`settings.gradle` edits, but it only knows about **code**. A font, image,
plist entry or asset is a **resource**, and resources usually belong to the app, not the module, so
the app has to register them: `UIAppFonts` on iOS, an assets directory or `fonts.gradle` on Android.
The mental model is "autolinking links code; you link resources." That is why all three modules
autolinked but only the icon font needed hand work.

**Worked example — how to judge whether a dependency is safe to take on.** I ask four questions.
First, **is it alive?** Recent, regular releases beat a big download count. Second, **does it fit this
stack?** It must support the New Architecture (directly or through a credible interop path) and have a
version aligned with React Native 0.88 / Expo SDK 58. Third, **who maintains it and how wide is the
bus?** A single maintainer is not automatically a rejection, but it changes the exit plan. Fourth,
**can I leave?** Name the seam where the dependency is used — one storage module, one `<AppIcon />`,
one inset hook — and write down the replacement. If I cannot name the seam, I am not ready to add the
package.

## What tripped me up

**Worked example.**
- I assumed a successful `pod install` meant the icon would render. It did not: the pod bundles the
  `.ttf`, but iOS still needs the `UIAppFonts` entry before it exposes the font to the app.
- A stale Android build kept showing the old (broken) icon after I fixed `build.gradle`. Deleting
  `android/app/build` and rebuilding was the fix; Gradle had cached the missing asset.
- The safe-area inset printed `0` until I wrapped the screen in `SafeAreaProvider`. The hook works,
  but only inside a provider — a reminder that "the package is linked" and "the package is mounted
  correctly" are different claims.
- `npx expo-doctor` was clean after `npx expo install` but not after I hand-edited files; re-running
  it at the end caught the drift. Run it after the native edits, not just at install time.
- My first audit draft listed only the three new packages. The brief says every dependency added so
  far, so I added rows for `expo`, `expo-status-bar`, `react` and `react-native`, and separated
  development-only tooling into one line.

## Checkpoint evidence

**Worked example — capture these as you go.**
- iOS: screenshot of the profile screen showing the Ionicons glyph, a non-zero safe-area inset and
  the stored name after a force-quit/relaunch; plus `docs/evidence/m02-ios-build.log`.
- Android: the same three proofs on the emulator; plus `docs/evidence/m02-android-build.log`.
- `npx expo-doctor` output with no errors.
- The completed `docs/lock-in-audit.md`, reviewed against the trainer's example row, with one row per
  runtime dependency and an exit plan per row.
- The audit review notes and the resolved feedback.

## What I'd do differently

**Worked example.** I would write the audit skeleton **before** installing anything, so each
dependency gets a row, a seam and an exit while I am still deciding — not after the code works. I
would also capture the two build logs and screenshots at the moment each platform first passed,
instead of trying to reconstruct the evidence at the end. And I would add the `<AppIcon />` and
`profileStorage` seams in the same commit as the packages, so the exit plan is real code rather than a
promise.
