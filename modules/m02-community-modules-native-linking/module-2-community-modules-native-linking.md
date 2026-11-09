# Module 2 — Community Modules and Native Linking

**Week 1 · Day 2 · 4 hours**

> Goal: add your first real native dependencies by hand, prove them on both platforms, and build the
> habit of asking what happens if a dependency disappears before you take it on.

**Stack for this cohort:** React Native 0.88 · Expo SDK 58 · React 19.3.0 · Node.js 24 LTS ·
New Architecture always on · Xcode 26.4 or newer · Android `compileSdk` 37 / `targetSdk` 36 ·
free tools only, plus a free-tier EAS account.

By the end of this module your `PersonalProfileApp` will store a display name with AsyncStorage,
render an icon from `react-native-vector-icons`, and respect the safe area on both iOS and Android —
with each module linked by hand where autolinking stops short. You will also have a one-page
**lock-in audit** covering every runtime dependency in the app.

---

## Learning Goals

By the end of this module you can:

1. Decide, for a given need, whether an Expo package, a community module or custom native code is
   the right fit.
2. Install and link a community native module by hand on iOS and Android.
3. Judge whether a community module is safe to depend on, using release history, New Architecture
   support, React Native 0.88 compatibility and React Native Directory.
4. Keep a clean exit from every dependency you add, and explain what `eas build`, `eas submit` and
   `expo prebuild` each do.

---

## Concept

### The hybrid rule

This course is **bare React Native on Expo tooling**. That means you can use both worlds, but not
carelessly:

| The need | Reach for | Why |
| --- | --- | --- |
| A core feature the app cannot ship without (storage, navigation, safe areas, icons) | A **community module** | You own the native code path, can pin it, patch it or replace it, and it works in a bare build. |
| A small, replaceable utility (device info, constants, status bar, haptics) | An **Expo package** | Fast to add, SDK-aligned, and easy to swap out later. |
| Platform behaviour no package covers (a bespoke native SDK, a hardware integration) | **Custom native code** | A native module in your committed `ios/` and `android/` folders is the only honest option. |

The test is not "does Expo have it?" It is: **if this package stopped being maintained tomorrow,
how expensive is my exit?** Core features want the exit you control; utilities can take the
convenience.

### How native linking actually works

A native module is JavaScript plus platform code. Three things have to line up:

1. **JavaScript** — the package is in `node_modules` and importable.
2. **Native registration** — iOS sees a CocoaPod, Android sees a Gradle module.
3. **Resources** — fonts, images, plists and other assets are copied into the app bundle.

**Autolinking** handles step 2 for you. On install, the React Native CLI scans `node_modules` for
packages that declare native code (a `.podspec` for iOS, a Gradle project for Android) and wires
them in:

- **iOS:** `bundle exec pod install` reads the autolinked pods and writes them into
  `ios/Podfile.lock` and `Pods/`.
- **Android:** Gradle includes the module through the React Native Gradle plugin; there is normally
  no `settings.gradle` edit to make.

Autolinking does **not** generally handle step 3. A font is the classic example: the native code
loads, but unless the `.ttf` is registered with the OS and copied into the bundle, you get a blank
glyph or a crossed-out box. That resource step is the part you do by hand in this module.

### How an icon font registers on each platform

- **iOS:** the font file must be in the app bundle and its filename listed under `UIAppFonts`
  ("Fonts provided by application") in `Info.plist`. With `react-native-vector-icons` 10.x, the
  CocoaPod already bundles `Fonts/*.ttf`; you still add the `UIAppFonts` entries yourself.
- **Android:** font files must land in the app's `assets/fonts` directory. The package ships
  `fonts.gradle`, which copies the fonts you name into the build's assets folder and registers that
  folder as an asset source. You apply that script from `android/app/build.gradle`.

The JavaScript side then asks for the font by its **font family name**, not its filename — for
Ionicons the family is `Ionicons`.

### Judging a community module

Before you add a module, check four signals:

1. **Recent releases** — a release in the last few months is a good sign; years of silence is a
   warning.
2. **New Architecture support** — the course runs New Architecture always on. The module must
   support it directly, or run through React Native's interop layer with a clear track record.
3. **Fit with React Native 0.88 / Expo SDK 58** — install with `npx expo install` so the version is
   SDK-aligned, and read the package's peer dependency range.
4. **React Native Directory** — <https://reactnative.directory> records New Architecture support,
   platform coverage and whether the package is actively maintained.

Record what you find. "It installed" is not a safety argument.

### `eas build` and `eas submit`

- **`eas build`** compiles the project in Expo's cloud from your **committed** `ios/` and `android/`
  folders. It produces installable artifacts (a simulator build, an `.apk`/`.aab`, an `.ipa`) without
  requiring Xcode or Android Studio on your machine.
- **`eas submit`** uploads a finished build to **App Store Connect / TestFlight** for iOS and to the
  **Google Play Console** for Android. It does not build anything; it delivers.

The course uses EAS Build from here through the capstone. You still own and commit the native
folders; EAS compiles them.

### `expo prebuild` versus committed native folders

`npx expo prebuild` **generates** `ios/` and `android/` from your Expo config. It is useful when you
start managed and later need native folders. But it treats the native folders as build output: it
can overwrite hand-edits, re-create them on demand, and make native changes ephemeral.

This course keeps the native folders **committed and hand-managed** instead:

- native linking changes are reviewable in Git;
- a fresh clone builds without regenerating anything;
- `expo prebuild` is understood as a tool, not part of the normal loop.

Do not run `expo prebuild` in `PersonalProfileApp` unless your trainer explicitly asks you to
demonstrate it on a throwaway copy.

### What the lock-in audit is for

A lock-in audit is one page that answers, for every runtime dependency: **who maintains it, what
happens if maintenance stops, and how you get out.** It turns "I added a package" into a decision
with an owner and an exit. You will write one at the end of this module and update it in later
stages.

---

## Read These

- `modules/m02-community-modules-native-linking/brief.md` — this stage's brief, scope and Definition
  of done.
- `docs/prd/react-native-bare-workflow-curriculum.md` — §Module 2: Community Modules and Native
  Linking.
- `docs/arch-docs/React Native Bare Workflow Curriculum — Solution Design.md` — the Expo Hybrid,
  EAS-first and committed-native-folders decisions.
- React Native Directory: <https://reactnative.directory>.
- `react-native-vector-icons` **10.x** README — iOS `UIAppFonts`, Android `fonts.gradle`, and the
  troubleshooting section for missing glyphs.
- AsyncStorage docs: <https://github.com/react-native-async-storage/async-storage>.
- `react-native-safe-area-context` docs: <https://github.com/AppAndFlow/react-native-safe-area-context>.
- Expo docs: **EAS Build**, **EAS Submit**, **`expo prebuild`**, and **`expo-doctor`**.

---

## Walkthrough

Do these in order. Each step includes the exact commands and the check that proves it worked. Do not
move to the next step until its check passes.

### Walkthrough 1 — Lock the M01 baseline

Start from the app you built in Module 1. Confirm it is still healthy before adding anything.

```bash
cd ~/Projects/PersonalProfileApp
node -v
ls -d ios android
npx expo-doctor
npm ls --depth=0
```

**Check:** `node -v` prints `v24.x`, both `ios` and `android` exist, `npx expo-doctor` reports no
errors, and `npm ls --depth=0` lists the current dependencies without `UNMET` markers.

Save the current dependency list so you can audit every one of them later:

```bash
mkdir -p docs
npm ls --depth=0 --json > docs/dependencies-before-m02.json
```

**Check:** `docs/dependencies-before-m02.json` exists and contains a `dependencies` object.

---

### Walkthrough 2 — Choose and install the three modules

Decide each need with the hybrid rule, then install all three with `npx expo install` so the versions
match Expo SDK 58. Do not pin versions by hand.

| Need | Choice | Why |
| --- | --- | --- |
| Persist a display name across launches | `@react-native-async-storage/async-storage` | A core storage feature; the de facto community module; easy to wrap behind your own adapter. |
| Respect notches, punch-holes and gesture bars | `react-native-safe-area-context` | Core layout behaviour with a native insets API; widely used by navigation libraries. |
| Render icons without shipping images | `react-native-vector-icons` | Core UI capability; the icon font is a native resource, which is exactly what this stage teaches. |

Install them at the project root:

```bash
cd ~/Projects/PersonalProfileApp
npx expo install @react-native-async-storage/async-storage react-native-safe-area-context react-native-vector-icons
```

Record what Expo actually chose:

```bash
node -e "const d=require('./package.json').dependencies; for (const k of ['@react-native-async-storage/async-storage','react-native-safe-area-context','react-native-vector-icons']) console.log(k, d[k]);"
npx expo-doctor
```

**Check:** all three packages appear in `package.json` `dependencies`, and `npx expo-doctor` still
reports no errors. Write the three versions down — you will put them in the lock-in audit.

> If `npx expo install` refuses a package because it has no SDK-aligned version, stop and ask your
> trainer before forcing a version. A version mismatch here is a native build failure later.

---

### Walkthrough 3 — Link on iOS by hand

AsyncStorage and safe-area-context autolink cleanly. The part that needs help is the icon font: the
pod ships the `.ttf` files, but iOS only exposes a font to the app when its filename is listed in
`Info.plist`.

First run CocoaPods so the autolinked pod is present:

```bash
cd ~/Projects/PersonalProfileApp/ios
bundle exec pod install
cd ..
```

Confirm the vector-icons pod was linked:

```bash
grep -n "RNVectorIcons" ios/Podfile.lock
```

**Check:** the command prints `RNVectorIcons` with a version from the 10.x line.

Now register `Ionicons.ttf` under `UIAppFonts`. This script edits the plist safely and is idempotent
— running it twice does not duplicate the entry:

```bash
cd ~/Projects/PersonalProfileApp
python3 - << 'PY'
import plistlib
from pathlib import Path

plist_path = Path("ios/PersonalProfileApp/Info.plist")
with plist_path.open("rb") as fh:
    plist = plistlib.load(fh)

fonts = plist.setdefault("UIAppFonts", [])
for font in ("Ionicons.ttf",):
    if font not in fonts:
        fonts.append(font)

with plist_path.open("wb") as fh:
    plistlib.dump(plist, fh)

print("UIAppFonts:", plist["UIAppFonts"])
PY
```

> If your iOS target folder is not named `PersonalProfileApp`, run `ls ios` and change the path in
> the script to match the folder that contains `Info.plist`.

Verify the entry with Apple's own plist tool:

```bash
/usr/libexec/PlistBuddy -c "Print :UIAppFonts" ios/PersonalProfileApp/Info.plist
```

**Check:** the output includes `Ionicons.ttf`. Rebuild iOS once so the new plist and pod resources are
picked up:

```bash
npx expo run:ios
```

**Check:** the app still launches. The visible icon proof comes in Walkthrough 5.

---

### Walkthrough 4 — Link on Android by hand

On Android, autolinking registers the native module, but the font files must be copied into the
app's assets at build time. The package ships a Gradle script that does exactly that; you apply it
from the **app** module's build file.

Append the configuration to `android/app/build.gradle`, guarded so a second run does not duplicate
the block:

```bash
cd ~/Projects/PersonalProfileApp
grep -q "react-native-vector-icons/fonts.gradle" android/app/build.gradle || cat >> android/app/build.gradle << 'EOF'

// React Native Vector Icons: copy Ionicons.ttf into the app's assets at build time.
project.ext.vectoricons = [
    iconFontNames: ['Ionicons.ttf']
]
apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")
EOF
```

Verify the block landed at the end of the app build file:

```bash
tail -n 12 android/app/build.gradle
```

**Check:** you see `iconFontNames: ['Ionicons.ttf']` and the `apply from:` line. The path
`../../node_modules/...` is correct because it is relative to `android/app/build.gradle`.

Build Android once so the font copy task runs:

```bash
npx expo run:android
```

If the build succeeds but you ever see a crossed-out box instead of a glyph, delete the stale build
output and rebuild:

```bash
rm -rf android/app/build
npx expo run:android
```

**Check:** the app still launches on the Android emulator. The visible icon proof comes next.

---

### Walkthrough 5 — Prove all three modules work on both platforms

Replace the entry component with a screen that exercises all three modules: safe-area insets,
AsyncStorage read/write, and an Ionicons glyph.

The M01 template normally has `App.tsx`; some template versions leave `App.js` instead. This command
writes to whichever entry component already exists, so you end up with exactly one:

```bash
cd ~/Projects/PersonalProfileApp
APP_FILE="App.tsx"
[ -f App.js ] && APP_FILE="App.js"
cat > "$APP_FILE" << 'EOF'
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const STORAGE_KEY = 'profile:displayName';

function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [savedName, setSavedName] = useState('');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (cancelled) return;
        setSavedName(value ?? '');
        setName(value ?? '');
        setStatus(value ? 'loaded' : 'empty');
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus(`read failed: ${error.message}`);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, name.trim());
      setSavedName(name.trim());
      setStatus('saved');
    } catch (error) {
      setStatus(`write failed: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Ionicons name="person-circle-outline" size={64} color="#4F46E5" />
        <Text style={styles.title}>Personal Profile</Text>
        <Text style={styles.meta}>Safe-area top inset: {insets.top}px</Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your display name"
          autoCapitalize="words"
        />

        <Pressable style={styles.button} onPress={save}>
          <Text style={styles.buttonText}>Save to AsyncStorage</Text>
        </Pressable>

        <Text style={styles.status}>Status: {status}</Text>
        <Text style={styles.saved}>
          {savedName ? `Stored value: ${savedName}` : 'No value stored yet.'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ProfileScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, padding: 24, gap: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#0F172A' },
  meta: { fontSize: 13, color: '#475569' },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  status: { fontSize: 13, color: '#475569' },
  saved: { fontSize: 16, color: '#0F172A' },
});
EOF
echo "Wrote $APP_FILE"
```

**Check:** `echo "Wrote $APP_FILE"` names a real file, and `wc -l "$APP_FILE"` shows a non-trivial
component, not a one-line stub.

Run it on both platforms:

```bash
npx expo run:ios
npx expo run:android
```

Then prove each module on each platform:

| Module | What to do | What proves it |
| --- | --- | --- |
| `react-native-safe-area-context` | Look at the "Safe-area top inset" line at the top of the screen. | The inset is greater than `0` on a notched iPhone or a modern Android emulator, and the title is not under the status bar. |
| `react-native-vector-icons` | Look at the person glyph above the title. | A clear person-in-circle glyph renders, not a blank space, a question mark or a crossed-out box. |
| `@react-native-async-storage/async-storage` | Type a name, tap **Save to AsyncStorage**, force-quit the app, then relaunch it. | Status becomes `saved`, and after relaunch it becomes `loaded` with the stored value restored. |

**Check:** all three rows pass on **iOS and Android**. If the icon fails, use the troubleshooting
table below before moving on.

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| iOS shows a crossed-out box or "Unrecognized font family" | `UIAppFonts` missing `Ionicons.ttf`, or the app was not rebuilt | Re-run the plist script, then `rm -rf ios/build && npx expo run:ios`. |
| Android shows a crossed-out box | `fonts.gradle` not applied, or stale build output | Re-check the `android/app/build.gradle` block, then `rm -rf android/app/build && npx expo run:android`. |
| Safe-area inset is always `0` | `SafeAreaProvider` is missing, or the screen is not inside it | Wrap the screen in `SafeAreaProvider`; rebuild after adding the pod. |
| AsyncStorage rejects on read or write | Native module not linked because pods/Gradle were not rebuilt | `cd ios && bundle exec pod install && cd ..`, then rebuild the failing platform. |

Capture evidence now — you will need it for the write-up:

```bash
mkdir -p docs/evidence
npx expo run:ios 2>&1 | tee docs/evidence/m02-ios-build.log
npx expo run:android 2>&1 | tee docs/evidence/m02-android-build.log
```

`run:ios` and `run:android` leave Metro in the foreground. Once the app has launched, press
`Ctrl-C`, then confirm the log contains the build-success and launch lines before you rely on it as
evidence.

**Check:** both logs end with a successful launch. Add one screenshot per platform showing the glyph,
the non-zero inset and the stored value.

---

### Walkthrough 6 — Judge each dependency and write the lock-in audit

First collect the facts. Ask npm for each package's current version and last publish time:

```bash
cd ~/Projects/PersonalProfileApp
npm view @react-native-async-storage/async-storage version time.modified
npm view react-native-safe-area-context version time.modified
npm view react-native-vector-icons version time.modified
```

Then open React Native Directory and search each package:

```text
https://reactnative.directory/?search=async-storage
https://reactnative.directory/?search=safe-area-context
https://reactnative.directory/?search=vector-icons
```

For each one, record: New Architecture support, iOS/Android coverage, and whether the listing looks
actively maintained. Do not accept "it works on my machine" as the check.

Now write the audit. It is one page, it covers every **runtime** dependency in `package.json`
(development tooling is listed separately in one line), and it matches the format of the worked
example row below.

```bash
cd ~/Projects/PersonalProfileApp
mkdir -p docs
cat > docs/lock-in-audit.md << 'EOF'
# Lock-in Audit — PersonalProfileApp

Last reviewed: 2026-11-09
Scope: every runtime dependency in `package.json` `dependencies`. Development-only tooling is listed
at the bottom and is not shipped in the app.

## Worked example row (match this format)

| Dependency | Maintainer | Last release checked | New Architecture | React Native Directory | If maintenance stops | Exit plan |
| --- | --- | --- | --- | --- | --- | --- |
| `@react-native-async-storage/async-storage` | Callstack / community maintainers | 3.1.1, checked 2026-11-09 | Supported; verify the Directory badge each upgrade | Listed, actively maintained, iOS + Android | Installed builds keep working, but future React Native upgrades can break the native module | Keep all calls behind `src/storage/profileStorage.js`. Swap that one file to `expo-sqlite/kv-store` or a vendored fork. |

## Current runtime dependencies

| Dependency | Maintainer | Last release checked | New Architecture | React Native Directory | If maintenance stops | Exit plan |
| --- | --- | --- | --- | --- | --- | --- |
| `expo` | Expo team | Check with `npm view expo version time.modified` | Supported (SDK 58 is New Architecture first) | Not applicable — hosting/tooling | Expo tooling and EAS access degrade; the committed native folders still build with the React Native CLI | Migrate commands to `react-native` CLI and keep EAS only as an optional build service. |
| `expo-status-bar` | Expo team | Check with `npm view expo-status-bar version time.modified` | Supported | Listed under Expo packages | No new releases; the API is tiny and can be replaced | Import `StatusBar` from `react-native` instead. |
| `react` | Meta / React team | Check with `npm view react version time.modified` | Required by New Architecture | Core, not a community package | Not a realistic scenario for this course | No exit needed; pin the version the React Native release requires. |
| `react-native` | Meta | Check with `npm view react-native version time.modified` | Is the New Architecture | Core, not a community package | Not a realistic scenario for this course | No exit needed; this is the platform you build on. |
| `@react-native-async-storage/async-storage` | Callstack / community maintainers | 3.1.1, checked 2026-11-09 | Supported; verify the Directory badge each upgrade | Listed, actively maintained, iOS + Android | Installed builds keep working, but future React Native upgrades can break the native module | Keep calls behind `src/storage/profileStorage.js`; swap to `expo-sqlite/kv-store` or a vendored fork. |
| `react-native-safe-area-context` | App & Flow / community maintainers | 5.11.1, checked 2026-11-09 | Supported; verify the Directory badge each upgrade | Listed, actively maintained, iOS + Android | New devices or OS releases may report wrong insets; no fix without a fork | Wrap inset use in one `useAppInsets()` hook; fall back to a small native insets module or a pinned vendored copy. |
| `react-native-vector-icons` | Joel Arvidsson (oblador) and community | 10.3.0, checked 2026-11-09 | Supported through the New Architecture interop layer; confirm on the Directory listing | Listed, actively maintained, iOS + Android | Fonts keep working in shipped builds, but new icon sets and OS fixes stop | Keep `Ionicons` behind one `<AppIcon />` component; switch to `@expo/vector-icons` or `react-native-svg` icon components. |

## Development-only dependencies

`typescript`, `@babel/core`, `@types/*` and similar are build-time only. Record their versions in
`package-lock.json`; they do not ship, so they do not need an exit plan beyond re-installing the
project.

## Review log

| Date | Reviewer | Notes |
| --- | --- | --- |
| 2026-11-09 | Trainee | First pass, all three new modules linked on both platforms. |
EOF
wc -l docs/lock-in-audit.md
```

**Check:** the file exists, has one row per runtime dependency, and the three new modules each have a
named maintainer, a checked release, a New Architecture note and a concrete exit plan. Replace the
"Last reviewed" date and versions with what your own `npm view` commands printed — this is a snapshot,
not a permanent claim.

Ask your trainer for their filled-in example row and compare formats. If your trainer's format
differs, follow theirs and keep the same four facts: maintainer, last release, risk if maintenance
stops, exit plan.

---

### Walkthrough 7 — EAS orientation, `expo prebuild`, and the final health check

Set up your free-tier EAS account and confirm the CLI is authenticated:

```bash
cd ~/Projects/PersonalProfileApp
npx eas-cli@latest login
npx eas-cli@latest whoami
```

**Check:** `whoami` prints the account you just logged in with.

Read what EAS will do with the native folders — do **not** start a build in this module:

```bash
npx eas-cli@latest build --help
npx eas-cli@latest submit --help
```

Understand the two commands:

| Command | What it does | What it does not do |
| --- | --- | --- |
| `eas build` | Compiles the committed `ios/` and `android/` projects in Expo's cloud and produces installable artifacts. | It does not generate or manage your native folders. |
| `eas submit` | Uploads a finished build to App Store Connect/TestFlight or the Google Play Console. | It does not build, sign or test the app. |

Inspect `expo prebuild` without running it against your hand-managed project:

```bash
npx expo prebuild --help
```

**Check:** you can explain why running `npx expo prebuild --clean` here would replace the folders you
just hand-edited, and why this course does not include it in the normal loop.

Finish with the health check:

```bash
npx expo-doctor
```

**Check:** `npx expo-doctor` reports no errors. If it flags anything new, fix it before the module is
done — and note what it caught for the write-up.

---

## What This Walkthrough Showed You

- How to apply the **hybrid rule** to three real needs and defend each choice.
- What **autolinking** does on iOS and Android, and where it stops: native registration is automatic,
  resource registration is not.
- How to register an icon font **by hand**: `UIAppFonts` in `Info.plist` on iOS, `fonts.gradle` in
  `android/app/build.gradle` on Android.
- How to prove a native module actually works: persist a value across a relaunch, read a non-zero
  safe-area inset, and render a real glyph on both platforms.
- How to judge dependency safety with **release history, New Architecture support, SDK fit and React
  Native Directory**.
- How to write a **lock-in audit** with a maintainer, a risk and an exit per dependency.
- What **`eas build`** and **`eas submit`** do, and why this course keeps committed native folders
  instead of running `expo prebuild`.

---

## EXERCISEs

1. **Break the iOS font on purpose.** Remove `Ionicons.ttf` from `UIAppFonts`, clean the iOS build,
   and capture the exact failure. Restore the entry and confirm the glyph returns. Write down the
   symptom and the command that diagnosed it.
2. **Break the Android font link on purpose.** Comment out the `apply from:` line in
   `android/app/build.gradle`, rebuild, and capture what the icon looks like. Restore it, delete
   `android/app/build`, and rebuild.
3. **Audit a fourth package.** Pick a package you are considering (for example `expo-haptics`,
   `react-native-mmkv` or `react-native-svg`). Run the same four safety checks, add a row to the
   audit, and decide keep / defer / reject with one sentence of reasoning.
4. **Make storage failure visible.** Wrap the AsyncStorage read in a `try/catch` that falls back to
   `''`, then corrupt the stored value with `AsyncStorage.setItem(STORAGE_KEY, 'not-json')` in a
   temporary effect. Confirm the screen still renders and the status explains the fallback.
5. **Prove the safe area, don't assume it.** Log `useSafeAreaInsets()` on an iPhone with a notch and
   on an Android emulator with a punch-hole camera. Record both inset values and explain the
   difference in two sentences.
6. **Compare `expo prebuild` output.** Copy the project to a throwaway folder, run
   `npx expo prebuild --clean` there, and diff its `ios/` and `android/` against your committed
   folders. List three differences and explain which version you would trust in a code review.

---

## Self-Check

Answer these in your own words before checking the Appendix.

1. For each of the three modules you added, why is it a community module rather than an Expo package
   or custom native code?
2. What does autolinking do, and why did it still leave work for you to do by hand in this module?
3. Trace one icon from JavaScript to pixels on iOS and on Android. Which platform-specific file
   registration makes the glyph appear, and what happens if you skip it?
4. What are three signals that a community module is safe to take on, and what would make you reject
   one despite it being popular?
5. What do `eas build` and `eas submit` each do, and why does this course keep committed `ios/` and
   `android/` folders instead of relying on `expo prebuild`?

---

## Module Deliverable

The `PersonalProfileApp` with `@react-native-async-storage/async-storage`,
`react-native-safe-area-context` and `react-native-vector-icons` linked and visibly working on both
iOS and Android, plus a one-page lock-in audit at `docs/lock-in-audit.md` covering every runtime
dependency — with `npx expo-doctor` reporting no errors.

---

## Appendix — Self-Check Answers

1. **Community modules, not Expo packages or custom native code.** All three are core features the
   app cannot ship without: persistent storage, safe-area layout and icons. Community modules give
   you the native source of truth in your committed folders, a version you can pin, and a real exit
   path. An Expo package is the better fit for a small replaceable utility; custom native code is
   reserved for behaviour no package covers. Choosing a community module is a deliberate trade:
   more wiring now, more control later.

2. **Autolinking registers native code; it does not register resources.** On install, the React
   Native CLI finds each package's `.podspec` (iOS) and Gradle project (Android) and wires the native
   module in, which is why `pod install` shows `RNVectorIcons` and Android compiles it without a
   `settings.gradle` edit. But a font is a resource: iOS needs the filename in `UIAppFonts` so the OS
   exposes it, and Android needs `fonts.gradle` so the `.ttf` is copied into the app's assets. Those
   are app-level decisions, so you make them by hand.

3. **iOS:** the JavaScript `Ionicons` component asks for the `Ionicons` font family; the CocoaPod has
   bundled `Ionicons.ttf` into the app; `Info.plist`'s `UIAppFonts` entry tells iOS to expose that
   file; the glyph renders. Skip `UIAppFonts` and iOS refuses to load the font — a blank or
   crossed-out box, often with "Unrecognized font family". **Android:** the JavaScript component asks
   for the `Ionicons` family; the `fonts.gradle` task copies `Ionicons.ttf` into
   `assets/fonts`; Android's font manager finds it and the glyph renders. Skip the Gradle script and
   the asset never reaches the APK, so the glyph is missing. Both platforms fail differently but for
   the same reason: the native code was linked, the resource was not.

4. **Signals:** recent, regular releases; explicit New Architecture support (or a solid interop
   track record); an SDK-aligned version for React Native 0.88 / Expo SDK 58; and a healthy React
   Native Directory listing with iOS and Android coverage. You might reject a popular package if its
   last release is years old, if it has no New Architecture story, if it only supports one platform,
   or if its licence or maintainer bus factor makes the exit too expensive for a core feature.

5. **`eas build` compiles** the committed native projects in Expo's cloud and produces installable
   artifacts. **`eas submit` uploads** a finished build to App Store Connect/TestFlight or the Play
   Console; it does not build. The course keeps the native folders committed because native linking,
   app identity and platform configuration are code you review and own. `expo prebuild` generates
   those folders from config and can overwrite hand-edits, so it stays a deliberate tool rather than
   part of the normal loop. EAS is the build service; the native projects are still yours.
