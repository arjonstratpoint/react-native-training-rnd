# Module 3 — iOS and Android Project Basics

**Week 1 · Day 3 · 5 hours**

> Goal: set app identity for three environments through EAS build profiles, and learn enough about
> the generated native folders to know where those settings land — without hand-editing Xcode
> schemes or Gradle product flavors.

**Stack for this cohort:** React Native 0.88 · Expo SDK 58 · React 19.3.0 · Node.js 24 LTS ·
New Architecture always on · Xcode 26.4 or newer · Android `compileSdk` 37 / `targetSdk` 36 ·
free tools only, plus a free-tier EAS account.

By the end of this module your `PersonalProfileApp` will have three EAS build profiles — Dev,
Staging and Prod — each producing an installable build with its own name, icon and bundle ID /
application ID. You will also have run `npx expo prebuild` on a throwaway copy and be able to point
to the exact lines in the native folders where the identity and version end up.

---

## Learning Goals

By the end of this module you can:

1. Name the pieces of app identity and say which are set in `app.config.js`.
2. Map Dev, Staging and Prod to the `development`, `preview` and `production` EAS build profiles.
3. Produce three installable builds with distinct identities and install them side by side.
4. Locate the bundle ID and version in generated `ios/` and `android/` files, and explain custom URL
   schemes plus `minSdk`/`compileSdk`/`targetSdk` at a glance.

---

## Concept

### The pieces of app identity

"App identity" is the set of values that distinguishes one installation from another. Most of it is
configured in one place — `app.config.js` — and read by both platforms at build time.

| Piece | What it is | Where you set it here |
| --- | --- | --- |
| App name | The label under the icon on the home screen and in app switchers | `expo.name` |
| Bundle ID / application ID | A reverse-DNS key that uniquely identifies the app to the OS: `CFBundleIdentifier` on iOS, `applicationId` on Android | `expo.ios.bundleIdentifier`, `expo.android.package` |
| Version number | The user-facing release string (`1.0.0`) | `expo.version` |
| Build number | The store-internal counter that must increase for each upload: `CFBundleVersion` on iOS, `versionCode` on Android | `expo.ios.buildNumber`, `expo.android.versionCode` |
| Icon and splash | The home-screen image and the launch screen | `expo.icon`, `expo.splash`, `expo.android.adaptiveIcon` |
| URL scheme | A prefix such as `profileapp://` that lets links, browsers and other apps open yours | `expo.scheme`, `expo.android.intentFilters` |

The **bundle ID / application ID is the part that decides whether two builds can coexist**. Three
builds with different names and icons but the same ID will overwrite one another on install. Three
builds with different IDs install side by side even when the binary is otherwise identical.

Version and build number are separate on purpose. A user sees `1.0.0`; the store sees build `1`,
then `2`, then `3`. You can ship build 4 of version `1.0.0` without changing what the user reads.

### Why `app.config.js` and not Xcode or Android Studio

This is a bare project: you own `ios/` and `android/`, and they are committed to Git. That ownership
does not mean you edit them by hand for routine identity changes.

- `app.config.js` is JavaScript, so it can branch. One file can describe Dev, Staging and Prod.
- EAS Build reads the resolved config when it builds your committed native projects and writes the
  values into the generated native files. You never open an Xcode scheme editor or add a Gradle
  product flavor to get three variants.
- Hand-edits to `Info.plist` or `build.gradle` are fragile: a later config change or regeneration
  can replace them. Config as code is reviewable in a pull request.

Keep the hand-edited by-hand path in mind as a future option, not this module's work. The
capstone's Workshop D is where a deeper Xcode/Gradle release path lives.

### EAS build profiles are the environments

`eas.json` declares named build profiles. Each profile controls how a build is produced and can
inject environment variables. `app.config.js` reads one of those variables and picks the identity.

| Environment | EAS profile | `APP_ENV` injected | Name | Bundle ID / package |
| --- | --- | --- | --- | --- |
| Dev | `development` | `development` | Profile Dev | `com.example.profile.dev` |
| Staging | `preview` | `staging` | Profile Staging | `com.example.profile.staging` |
| Prod | `production` | `production` | Profile | `com.example.profile` |

The split of responsibility is the important idea:

- **`app.config.js` owns identity** — name, icon, scheme, bundle ID, version, build number.
- **`eas.json` owns build settings** — development client or not, distribution mode, Android build
  type, and which `APP_ENV` value to inject.

One `eas build --profile <name>` command per environment is the whole release workflow for this
module. There is no separate scheme or flavor to maintain.

### Custom URL schemes

A URL scheme is a prefix your app claims. With `scheme: 'profileapp'` and the Android intent filter
in `app.config.js`, a link like `profileapp://open?env=dev` can be handed to your app by the OS.
On iOS the scheme is declared in `Info.plist` under `CFBundleURLTypes`; on Android it becomes an
`intent-filter` in `AndroidManifest.xml`. You are only checking that the declaration reaches both
platforms here — handling incoming links is a later concern.

### Android `minSdk`, `compileSdk` and `targetSdk`, at a glance

These three numbers live in `android/build.gradle` and `android/app/build.gradle`:

- **`minSdk`** — the oldest Android version you agree to support. Lower means more devices, more
  compatibility work.
- **`compileSdk`** — the API level you compile against. It determines which APIs you can use in
  source; it does not change runtime behaviour. The cohort baseline is 37.
- **`targetSdk`** — the API level you declare you have tested against. It opts your app into newer
  platform behaviours and restrictions. The baseline is 36, and Google Play raises the required
  `targetSdk` most years, which is why existing apps must be revisited annually even when their
  code has not changed.

You will read these values, not change them, in this module.

### A read-through of `ios/` and `android/`, not a rewrite

Module 2 established that the native folders are committed and that `expo prebuild` is not part of
the normal loop. This module keeps that rule: you will run `expo prebuild` **once on a throwaway
copy** so the folders are no longer a black box, then delete the copy. The real project's native
folders stay untouched.

Out of scope here, deliberately: hand-made Xcode schemes, Gradle product flavors, the iOS scene
migration, Swift Package Manager, an R8 fix and any by-hand signing. The architecture doc
lightened Module 3 to exactly this size.

---

## Read These

- `modules/m03-ios-android-project-internals/brief.md` — scope, Lab and Definition of done.
- `docs/arch-docs/React Native Bare Workflow Curriculum — Solution Design.md` — the Module 3 row in
  Curriculum and Module Mapping, risk #3 ("Module 3 was overloaded"), decision #11 (SPM and the
  native module lab cut), and the EAS-first / committed-native-folders design principles.
- `modules/m02-community-modules-native-linking/module-2-community-modules-native-linking.md` —
  the EAS orientation and `expo prebuild` sections you are building on.
- Expo docs: **app configuration (`app.config.js`)**, **`eas.json` build profiles**, **EAS Build**,
  **`expo prebuild`**, and **linking to your app with a URL scheme**.
- Android docs: **app module `build.gradle`** (`applicationId`, `versionCode`, `versionName`,
  `minSdk`, `targetSdk`, `compileSdk`) and **Play's `targetSdk` requirements**.
- `docs/reference/module-6-express-basics.docx` is the stated primary format reference but is not
  present in this repo. The M01 and M02 module guides supply the section pattern instead.

---

## Walkthrough

Do these in order. Each step includes the exact commands and the check that proves it worked. Do
not move to the next step until its check passes.

### Walkthrough 1 — Lock the M01/M02 baseline and confirm EAS access

Start from the `PersonalProfileApp` you built in Modules 1 and 2. The development profile needs the
development client installed.

```bash
cd ~/Projects/PersonalProfileApp
node -v
ls -d ios android
npx expo install expo-dev-client
npx expo-doctor
npx eas-cli@latest login
npx eas-cli@latest whoami
npx eas-cli@latest init
npx eas-cli@latest project:info id
```

**Check:** `node -v` prints `v24.x`; `ios` and `android` exist; `npx expo-doctor` reports no errors;
`whoami` prints the account you logged in with; `project:info id` prints an EAS project ID. Copy that
ID — you will paste it into `app.config.js` in Walkthrough 3. If `eas init` already wrote an `eas`
block into your config, that is expected; the next step replaces the config file deliberately.

---

### Walkthrough 2 — Skim generated native folders on a throwaway copy

Everything in this walkthrough happens in the **copy**, never in `PersonalProfileApp`.

```bash
mkdir -p ~/Projects/m03-prebuild-skim
cp -R ~/Projects/PersonalProfileApp/. ~/Projects/m03-prebuild-skim/
cd ~/Projects/m03-prebuild-skim
npx expo prebuild --clean
ls ios android
```

**Check:** `ios/` and `android/` now exist in the copy and contain an Xcode project and a Gradle
project. Now find where identity actually lands:

```bash
cd ~/Projects/m03-prebuild-skim
grep -n "PRODUCT_BUNDLE_IDENTIFIER" ios/*.xcodeproj/project.pbxproj | head -n 5
grep -n "CFBundleIdentifier\|CFBundleShortVersionString\|CFBundleVersion" ios/PersonalProfileApp/Info.plist
grep -n "applicationId\|versionCode\|versionName\|minSdkVersion\|compileSdkVersion\|targetSdkVersion" android/app/build.gradle
grep -n "CFBundleURLTypes\|scheme" ios/PersonalProfileApp/Info.plist
grep -n "intent-filter\|profileapp" android/app/src/main/AndroidManifest.xml
```

If your iOS target folder is not named `PersonalProfileApp`, run `ls ios` and adjust the `Info.plist`
path in those commands.

**Check:** you can point to a line for the iOS bundle ID, a line for the iOS short version and build
number, a line for the Android `applicationId`, `versionCode` and `versionName`, a line for each SDK
number, and the iOS/Android scheme declarations. Write those five locations down — you will use them
in the write-up and in Exercise 3.

Delete the copy and return to the real project:

```bash
cd ~/Projects
rm -rf ~/Projects/m03-prebuild-skim
cd ~/Projects/PersonalProfileApp
git status --short
```

**Check:** `PersonalProfileApp/ios` and `PersonalProfileApp/android` are unchanged — `git status`
shows no modifications to native files from the skim.

---

### Walkthrough 3 — Create `app.config.js` with three identities

First create three clearly different icons. This script uses only Python's standard library, so
it works on macOS, Linux and Windows with Python 3 installed.

```bash
cd ~/Projects/PersonalProfileApp
python3 - << 'PY'
import struct, zlib
from pathlib import Path

def png(path, rgb, size=108):
    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    raw = b"".join(b"\x00" + bytes(rgb) * size for _ in range(size))
    data = (b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(raw))
            + chunk(b"IEND", b""))
    Path(path).write_bytes(data)

Path("assets").mkdir(exist_ok=True)
png("assets/icon-dev.png", (239, 68, 68))
png("assets/icon-staging.png", (245, 158, 11))
png("assets/icon-prod.png", (79, 70, 229))
print("wrote", sorted(p.name for p in Path("assets").glob("icon-*.png")))
PY
```

**Check:** the command prints three filenames and `file assets/*.png` reports three PNG images. The
colours are deliberately different so the icons are obvious in the side-by-side screenshot.

Now write the config. Replace `REPLACE-WITH-YOUR-EAS-PROJECT-ID` with the ID from Walkthrough 1.

```bash
cd ~/Projects/PersonalProfileApp
cat > app.config.js << 'EOF'
const environments = {
  development: {
    name: 'Profile Dev',
    bundleIdentifier: 'com.example.profile.dev',
    package: 'com.example.profile.dev',
    icon: './assets/icon-dev.png',
    splashColor: '#FEE2E2',
  },
  staging: {
    name: 'Profile Staging',
    bundleIdentifier: 'com.example.profile.staging',
    package: 'com.example.profile.staging',
    icon: './assets/icon-staging.png',
    splashColor: '#FEF3C7',
  },
  production: {
    name: 'Profile',
    bundleIdentifier: 'com.example.profile',
    package: 'com.example.profile',
    icon: './assets/icon-prod.png',
    splashColor: '#E0E7FF',
  },
};

const env = process.env.APP_ENV || 'development';
const chosen = environments[env];

if (!chosen) {
  throw new Error(`Unknown APP_ENV "${env}". Use development, staging or production.`);
}

module.exports = {
  expo: {
    name: chosen.name,
    slug: 'PersonalProfileApp',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    icon: chosen.icon,
    splash: {
      image: chosen.icon,
      resizeMode: 'contain',
      backgroundColor: chosen.splashColor,
    },
    scheme: 'profileapp',
    ios: {
      supportsTablet: true,
      bundleIdentifier: chosen.bundleIdentifier,
      buildNumber: '1',
    },
    android: {
      package: chosen.package,
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: chosen.icon,
        backgroundColor: chosen.splashColor,
      },
      intentFilters: [
        {
          action: 'VIEW',
          category: ['BROWSABLE', 'DEFAULT'],
          data: { scheme: 'profileapp' },
        },
      ],
    },
    extra: { env },
    eas: {
      projectId: 'REPLACE-WITH-YOUR-EAS-PROJECT-ID',
    },
  },
};
EOF
```

**Check:** resolve each environment before spending a build:

```bash
cd ~/Projects/PersonalProfileApp
for env in development staging production; do
  APP_ENV="$env" npx expo config --json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const c=JSON.parse(s);console.log(c.extra.env,'|',c.name,'|',c.ios.bundleIdentifier,'|',c.android.package,'|',c.scheme);});"
done
```

The three lines must show three different names and three different IDs, with the same
`profileapp` scheme. If two lines share an ID, fix the map before continuing — that is an identity
collision.

> If a managed-era `app.json` is still present alongside `app.config.js`, Expo prefers
> `app.config.js`. Move the old file aside with `mv app.json app.json.m03-backup` if you see
> contradictory values.

---

### Walkthrough 4 — Create `eas.json` with the three profiles

```bash
cd ~/Projects/PersonalProfileApp
cat > eas.json << 'EOF'
{
  "cli": { "version": ">= 16.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "APP_ENV": "development" },
      "android": { "buildType": "apk" }
    },
    "preview": {
      "distribution": "internal",
      "env": { "APP_ENV": "staging" },
      "android": { "buildType": "apk" }
    },
    "production": {
      "env": { "APP_ENV": "production" },
      "android": { "buildType": "apk" }
    }
  },
  "submit": { "production": {} }
}
EOF
node -e "const p=require('./eas.json').build; for (const [k,v] of Object.entries(p)) console.log(k, '->', v.env.APP_ENV);"
```

**Check:** the command prints `development -> development`, `preview -> staging` and
`production -> production`. The Android `apk` build type makes all three directly installable for
this checkpoint; a real store upload would use `aab` for production instead.

**Why the split matters:** `eas.json` never contains a name or a bundle ID. It only chooses how to
build and which `APP_ENV` to inject. `app.config.js` never says which profile it is in. Change an
identity in `app.config.js`; change a build setting in `eas.json`.

---

### Walkthrough 5 — Capture resolved identities as evidence

```bash
cd ~/Projects/PersonalProfileApp
mkdir -p docs/evidence
touch docs/evidence/.gitkeep
for env in development staging production; do
  APP_ENV="$env" npx expo config --json | tee "docs/evidence/m03-config-$env.json" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const c=JSON.parse(s);console.log(c.extra.env,'|',c.name,'|',c.ios.bundleIdentifier,'|',c.android.package,'|',c.scheme);});"
done
ls -1 docs/evidence
```

**Check:** three `m03-config-*.json` files exist and the printed lines show three distinct names and
IDs. This proves the config split works locally, before you spend any cloud build time.

---

### Walkthrough 6 — Build one artifact per profile

Android first — these are APKs and can be installed directly:

```bash
cd ~/Projects/PersonalProfileApp
npx eas-cli@latest build --platform android --profile development
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform android --profile production
npx eas-cli@latest build:list --limit 3 | tee docs/evidence/m03-builds.txt
```

**Check:** `docs/evidence/m03-builds.txt` lists three successful Android builds, one per profile.
Copy each artifact URL from the build output into your notes. On the free tier, builds may queue —
start them one at a time and budget time for the queue rather than assuming instant builds.

For iOS, run the same command with `--platform ios`. Internal distribution builds need devices
registered with an Apple team. If your cohort does not have that access in Week 1, treat iOS as a
config and build-submission check and use the three Android APKs for the side-by-side proof:

```bash
npx eas-cli@latest build --platform ios --profile preview
npx eas-cli@latest build --platform ios --profile production
```

---

### Walkthrough 7 — Install all three and verify they do not collide

Set the three artifact URLs printed by EAS, then install each APK:

```bash
cd ~/Projects/PersonalProfileApp
DEV_APK_URL="paste-development-apk-url-here"
STAGING_APK_URL="paste-preview-apk-url-here"
PROD_APK_URL="paste-production-apk-url-here"
curl -L -o docs/evidence/profile-dev.apk "$DEV_APK_URL"
curl -L -o docs/evidence/profile-staging.apk "$STAGING_APK_URL"
curl -L -o docs/evidence/profile-prod.apk "$PROD_APK_URL"
adb devices
adb install -r docs/evidence/profile-dev.apk
adb install -r docs/evidence/profile-staging.apk
adb install -r docs/evidence/profile-prod.apk
```

**Check:** all three installs succeed on one device. If an install reports a signature or version
conflict, two profiles are sharing an ID — go back to Walkthrough 3.

Now prove the identities are distinct:

```bash
adb shell pm list packages -3 | grep com.example.profile
adb shell dumpsys package com.example.profile.dev | grep -A1 versionName
adb shell dumpsys package com.example.profile.staging | grep -A1 versionName
adb shell dumpsys package com.example.profile | grep -A1 versionName
```

**Check:** the package list shows three entries
(`com.example.profile.dev`, `com.example.profile.staging`, `com.example.profile`), and each
`dumpsys` call resolves its own package. Take one screenshot of the home screen showing three
icons and their labels, and save it as `docs/evidence/m03-side-by-side.png`.

Finish with a clean bill of health:

```bash
cd ~/Projects/PersonalProfileApp
npx expo-doctor
git status --short
```

**Check:** `npx expo-doctor` reports no errors, and `git status` shows only the intentional changes
(`app.config.js`, `eas.json`, `assets/`, `docs/evidence/`) — the committed native folders are
unchanged by this module.

---

## What This Walkthrough Showed You

- How to describe three environments in **one `app.config.js`** file using an environment variable.
- Why the **bundle ID / application ID** — not the name or icon — decides whether builds coexist.
- How **`eas.json` profiles** inject `APP_ENV` and control build settings, while `app.config.js`
  owns identity.
- How to verify all three identities with `npx expo config` **before** spending cloud build time.
- How to run `npx expo prebuild` once on a **throwaway copy** and find the bundle ID, version,
  scheme and SDK values in the generated native files.
- How to build, install and prove three side-by-side builds with distinct names, icons and IDs.
- Where `minSdk`, `compileSdk` and `targetSdk` live, and why Play pushes `targetSdk` upward.

---

## EXERCISEs

1. **Create a collision on purpose.** Set the staging bundle ID and package equal to the Dev ones,
   re-run the Walkthrough 5 loop, and write down what the three printed lines show. Restore the
   distinct IDs and confirm the collision disappears.
2. **Swap icons only.** Point the staging icon at the production icon, resolve the config, and
   confirm the identity is still distinct by name and ID. Explain in two sentences why an icon is
   not an identity.
3. **Annotate the native files.** On a fresh throwaway prebuild copy, write a short note naming the
   exact file and line for the iOS bundle ID, the iOS short version and build number, the Android
   `applicationId`, `versionCode` and `versionName`, and both scheme declarations.
4. **Version versus build number.** Change only `ios.buildNumber` to `'2'` and
   `android.versionCode` to `2`, resolve the config, and confirm the user-facing `version` stayed
   `1.0.0`. Explain when you would bump each one.
5. **Try the scheme.** With the builds installed, open `profileapp://open?env=dev` from a browser
   or the terminal (`adb shell am start -a android.intent.action.VIEW -d
   "profileapp://open?env=dev"` on Android) and record what happens. Then point to where in the
   generated native files that scheme was declared.
6. **Read the SDK trio.** From the throwaway copy, write one sentence each for `minSdk`,
   `compileSdk` and `targetSdk`, and one sentence on why a store rule pushes `targetSdk` up most
   years. Do not change any of the three values.

---

## Self-Check

Answer these in your own words before checking the Appendix.

1. Walk through how you would give three installations of the same app different names and bundle
   IDs without opening Xcode or Android Studio, and explain what keeps them from overwriting one
   another.
2. Describe what a build profile decides in `eas.json` and how that decision reaches the identity
   values in `app.config.js` for Dev, Staging and Prod.
3. Trace the bundle ID and version from `app.config.js` into the generated iOS and Android files,
   and explain why the native folders are still committed even when EAS does the compiling.
4. Explain what a custom URL scheme adds to an app and how you would confirm the scheme reached
   both platforms without writing a handler.
5. Explain what `minSdk`, `compileSdk` and `targetSdk` each govern, and why a store rule would push
   one of them upward every year.

### Understanding Checklist

- [ ] I can list the identity fields and state which file sets each one.
- [ ] I can map each environment to its profile and name the variable that carries the choice.
- [ ] I can open generated native files and point to the exact lines for the ID and version.
- [ ] I can say where the scheme is declared on each platform and how I verified it.
- [ ] I can say what each SDK value controls and which one store rules push upward.

---

## Module Deliverable

Three EAS build profiles — `development`, `preview` and `production` — for the `PersonalProfileApp`,
each producing an installable build with a distinct name, icon and bundle ID / application ID, with
all three installed side by side on one device or simulator. The repo contains `app.config.js`,
`eas.json`, three icon files and `docs/evidence/` with the config logs, build list and side-by-side
screenshot, plus a short note on where the bundle ID and version land in the generated native
folders. The real project's committed `ios/` and `android/` folders are unchanged by this module's
prebuild skim, and `npx expo-doctor` reports no errors.

---

## Appendix — Self-Check Answers

1. **Three identities without native editors.** Keep one `app.config.js` with a map keyed by
   `APP_ENV`, each entry carrying its own `name`, `ios.bundleIdentifier` and `android.package`, and
   let `eas.json` inject the right `APP_ENV` per profile. The **bundle ID / application ID** is the
   OS-level key: two builds with the same ID are treated as the same app and one install replaces
   the other. Distinct IDs let all three sit on the device at once; different names and icons make
   them tell apart visually.

2. **What a profile decides.** A profile in `eas.json` controls build mechanics — development
   client or not, distribution mode, Android build type — and injects `APP_ENV`. It never stores a
   name or bundle ID. `app.config.js` reads `process.env.APP_ENV`, selects the matching map entry
   and supplies identity to both platforms. Dev maps to `development`/`development`, Staging to
   `preview`/`staging`, and Prod to `production`/`production`. One command per profile produces the
   corresponding variant.

3. **Where identity lands, and why the folders stay committed.** EAS applies the resolved config to
   the committed native projects: the bundle ID appears as `PRODUCT_BUNDLE_IDENTIFIER` and
   `CFBundleIdentifier`, the user-facing version as `CFBundleShortVersionString` / `versionName`,
   and the internal counter as `CFBundleVersion` / `versionCode`. The folders remain in Git because
   native modules, linking decisions and platform configuration are code you review and own; EAS is
   a build service, not the owner of your native source. `expo prebuild` is a generator that can
   overwrite hand-edits, so it is used on a throwaway copy here.

4. **Custom URL scheme.** A scheme such as `profileapp` gives your app a prefix the OS can route to,
   so a link can open it. It is declared once in `app.config.js` via `scheme` and the Android intent
   filter, then lands in iOS `CFBundleURLTypes` and the Android `AndroidManifest.xml`
   `intent-filter`. You can confirm it by resolving the config for each environment and by grepping
   those generated files on the throwaway copy — no incoming-link handler is needed for that check.

5. **The three SDK values.** `minSdk` is the oldest Android release you support; `compileSdk` is the
   API level you compile against and governs which APIs are available to your source; `targetSdk`
   declares the platform level you have tested against and opts you into its behaviour changes.
   Google Play raises the required `targetSdk` on a roughly annual cycle, so an unchanged app must
   be re-tested and moved forward to stay eligible for new installs and updates.
