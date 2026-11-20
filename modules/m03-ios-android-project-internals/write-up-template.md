# M03 Write-Up — iOS and Android Project Basics

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own.

## What I built

Three EAS build profiles (Dev, Staging, Prod) for the profile app, each with its own identity.
This is a worked example: the evidence paths below are the layout this stage produces, so swap in
your own screenshots and build URLs when you run it.

- Teaching material: [module guide](./module-3-ios-android-project-internals.md)
- Stage sources: [brief](./brief.md) and [checklist](./tasks.md)
- Built on the app from [M02 — Community Modules and Native Linking](../m02-community-modules-native-linking/write-up-template.md)

In `PersonalProfileApp` I added `app.config.js`, `eas.json`, three icons in `assets/`, and an
evidence folder at `docs/evidence/`:

| Environment | Profile | Name | Bundle ID / package | Icon |
| --- | --- | --- | --- | --- |
| Dev | `development` | Profile Dev | `com.example.profile.dev` | `assets/icon-dev.png` (red) |
| Staging | `preview` | Profile Staging | `com.example.profile.staging` | `assets/icon-staging.png` (amber) |
| Prod | `production` | Profile | `com.example.profile` | `assets/icon-prod.png` (indigo) |

I also ran `npx expo prebuild --clean` once on a throwaway copy at `~/Projects/m03-prebuild-skim`,
noted where the ID and version land, and deleted the copy. The real project's committed `ios/` and
`android/` folders were untouched.

## Why it's built this way (key decisions)

I used one `app.config.js` with an `environments` map keyed by `APP_ENV`. Each entry carries the
name, bundle ID, Android package, icon and splash colour; the config reads
`process.env.APP_ENV || 'development'` and fails loudly on an unknown value. That keeps a single
reviewable source of identity instead of maintaining separate Xcode schemes or Gradle flavors.

The split with `eas.json` is deliberate: `eas.json` holds build mechanics — `developmentClient`,
`distribution`, Android `apk` build type — and injects `APP_ENV` per profile. It contains no names
or IDs. `app.config.js` holds identity and never knows which profile it is in. Changing a name is a
config edit; changing how a build is produced is a profile edit.

In the generated native folders I found the iOS bundle ID as `PRODUCT_BUNDLE_IDENTIFIER` in the
`.xcodeproj` and `CFBundleIdentifier` in `Info.plist`; the user-facing version as
`CFBundleShortVersionString`; the build counter as `CFBundleVersion`; and on Android
`applicationId`, `versionCode` and `versionName` in `android/app/build.gradle`. The scheme showed up
under `CFBundleURLTypes` in `Info.plist` and as an `intent-filter` in `AndroidManifest.xml`. The SDK
numbers in `android/build.gradle` were `compileSdk` 37 / `targetSdk` 36 with Expo's `minSdk` floor.

## How to build it (teach it to the next trainee)

1. Start from the M02 profile app and confirm the baseline:

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

2. Skim generated native folders on a **throwaway copy**, then delete it. The real folders must
   stay untouched.

   ```bash
   mkdir -p ~/Projects/m03-prebuild-skim
   cp -R ~/Projects/PersonalProfileApp/. ~/Projects/m03-prebuild-skim/
   cd ~/Projects/m03-prebuild-skim
   npx expo prebuild --clean
   grep -n "PRODUCT_BUNDLE_IDENTIFIER" ios/*.xcodeproj/project.pbxproj | head -n 5
   grep -n "CFBundleIdentifier\|CFBundleShortVersionString\|CFBundleVersion" ios/PersonalProfileApp/Info.plist
   grep -n "applicationId\|versionCode\|versionName\|minSdkVersion\|compileSdkVersion\|targetSdkVersion" android/app/build.gradle
   cd ~/Projects && rm -rf ~/Projects/m03-prebuild-skim
   ```

3. Generate three distinct icons (Python standard library only), then write `app.config.js` with
   the environment map. The full copy-pasteable version of both commands is in the
   [module guide](./module-3-ios-android-project-internals.md) under Walkthrough 3. The core of the
   config is:

   ```js
   const env = process.env.APP_ENV || 'development';
   const chosen = environments[env];
   module.exports = {
     expo: {
       name: chosen.name,
       icon: chosen.icon,
       ios: { bundleIdentifier: chosen.bundleIdentifier, buildNumber: '1' },
       android: { package: chosen.package, versionCode: 1 },
       scheme: 'profileapp',
     },
   };
   ```

4. Write `eas.json` with `development`, `preview` and `production` profiles, each injecting the
   matching `APP_ENV` (`development`, `staging`, `production`) and using `apk` for Android so the
   builds install directly:

   ```json
   {
     "build": {
       "development": { "developmentClient": true, "distribution": "internal", "env": { "APP_ENV": "development" }, "android": { "buildType": "apk" } },
       "preview": { "distribution": "internal", "env": { "APP_ENV": "staging" }, "android": { "buildType": "apk" } },
       "production": { "env": { "APP_ENV": "production" }, "android": { "buildType": "apk" } }
     }
   }
   ```

5. Resolve all three identities locally before building. This is the fastest way to catch a
   collision:

   ```bash
   mkdir -p docs/evidence
   touch docs/evidence/.gitkeep
   for env in development staging production; do
     APP_ENV="$env" npx expo config --json | tee "docs/evidence/m03-config-$env.json" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const c=JSON.parse(s);console.log(c.extra.env,'|',c.name,'|',c.ios.bundleIdentifier,'|',c.android.package);});"
   done
   ```

6. Build one artifact per profile, then install all three on one device and prove the packages are
   distinct:

   ```bash
   npx eas-cli@latest build --platform android --profile development
   npx eas-cli@latest build --platform android --profile preview
   npx eas-cli@latest build --platform android --profile production
   npx eas-cli@latest build:list --limit 3 | tee docs/evidence/m03-builds.txt
   adb shell pm list packages -3 | grep com.example.profile
   ```

   For iOS, use the same commands with `--platform ios`. Internal distribution needs registered
   devices; without that access in Week 1, use the Android APKs for the side-by-side check.

## Concepts worth explaining

**What an EAS build profile actually controls.** A profile is a named set of build inputs: whether
a development client is included, how the artifact is distributed, which platform build type to
produce and which environment variables are injected. It does not hold app identity. The injected
`APP_ENV` is the hand-off: the same codebase produces three variants because `app.config.js` reads
that one variable and selects a different identity map entry. That is why one `eas build` command
per profile is enough — there is no scheme or flavor to keep in sync.

**Why the native folders are still committed when EAS builds them.** EAS compiles the native
projects living in your repository; it does not own them. Native modules linked in M02, platform
configuration and identity all need to be reviewable in Git so a fresh clone builds the same app.
`expo prebuild` generates those folders from config and can overwrite hand-edits, which is why I
ran it only on a throwaway copy. Building is a service; ownership of the native code stays mine.

## What tripped me up

The first collision came from copying the Dev bundle ID into the staging entry — the names and icons
were different, so it looked fine until `adb install` reported a conflict. The fix was to treat the
bundle ID / package as the real identity and check all three resolved configs before building.

The second confusion was where a setting belongs. I initially looked in `eas.json` for the app name
and in `app.config.js` for the distribution mode. The working rule: if it is about how the build is
produced, it goes in a profile; if it is about what the app is called or identified as, it goes in
the config. Version versus build number was a smaller version of the same mix-up — `1.0.0` is what
the user reads, while `versionCode`/`CFBundleVersion` is the counter the store increments.

## Checkpoint evidence

Three builds installed side by side on one Android device, with labels **Profile Dev**,
**Profile Staging** and **Profile**, and red, amber and indigo icons:

- `docs/evidence/m03-side-by-side.png` — home screen with all three installs
- `docs/evidence/m03-builds.txt` — three successful builds, one per profile
- `docs/evidence/m03-config-{development,staging,production}.json` — resolved identities
- `adb shell pm list packages -3 | grep com.example.profile` → `com.example.profile.dev`,
  `com.example.profile.staging`, `com.example.profile`

Each package resolves with its own `versionName`, and `npx expo-doctor` reports no errors after the
final check.

## What I'd do differently

I would resolve the three configs and diff their names and IDs before writing `eas.json`, rather
than after the first build — it would have caught the bundle-ID copy in seconds instead of a cloud
build later. I would also keep a small checklist of the five native locations (iOS bundle ID, iOS
version and build number, Android `applicationId`, Android `versionCode`/`versionName`, scheme) next
to the throwaway skim, so the write-up is written from the files rather than from memory. Finally, I
would schedule the three builds together early, because the free-tier queue is the main source of
waiting in this stage.
