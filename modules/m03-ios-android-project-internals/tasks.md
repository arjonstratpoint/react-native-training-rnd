# M03 Tasks — iOS and Android Project Basics

Get comfortable enough with the native project files to set app identity for three environments —
using EAS Build profiles instead of hand-editing Xcode schemes or Gradle flavors.

> There is no solutions file for this stage. This checklist guides the work; it doesn't contain it.

## Setup

- [ ] Read this stage's `brief.md` fully.
- [ ] Research app identity basics: bundle ID/application ID, app name, version number vs. build
      number, app icon and splash screen, and how `app.config.js` sets each one.
- [ ] Research EAS build profiles (`eas.json`): what `development`, `preview` and `production`
      profiles are for, and how each can carry its own app identity.
- [ ] Research custom URL schemes.
- [ ] Research Android `minSdk`/`compileSdk`/`targetSdk` at a glance, and why store rules push
      `targetSdk` up every year.

## Build

- [ ] Configure `app.config.js` to vary app name, icon, and bundle ID/application ID by
      environment.
- [ ] Set up `development`, `preview` and `production` profiles in `eas.json`, mapped to Dev,
      Staging and Prod.
- [ ] Run `eas build` for each profile and install all three on one device or simulator.
- [ ] Confirm all three identities show up correctly and don't collide.
- [ ] Run `npx expo prebuild` once and skim the generated `ios/`/`android/` folders to find where
      the bundle ID and version number actually live.

## Verify

- [ ] Verify three EAS build profiles exist and each builds successfully.
- [ ] Verify all three installs sit on one device/simulator at once with distinct names and icons.
- [ ] Verify you can point to where the bundle ID and version number end up in the native folders.
- [ ] Do a final self-review against every checkbox in `brief.md`'s Definition of done.

## Write-up

- [x] Write "What I built" in `write-up-template.md`. — Evidence: `modules/m03-ios-android-project-internals/write-up-template.md` §"What I built".
- [x] Write "Why it's built this way (key decisions)": how you structured `app.config.js` to vary
      identity by environment, what you put in `eas.json` versus `app.config.js`, and what you
      found when you skimmed the native folders. — Evidence: `write-up-template.md` §"Why it's built this way (key decisions)".
- [x] Write "How to build it (teach it to the next trainee)": a guide to standing up
      Dev/Staging/Prod as EAS build profiles that install side by side, using your own
      `app.config.js`/`eas.json` as the worked example. — Evidence: `write-up-template.md` §"How to build it (teach it to the next trainee)".
- [x] Write "Concepts worth explaining": pick 1-2 ideas (what an EAS build profile actually
      controls, or why native folders still need to be committed even though EAS does the
      building) and explain each in your own words. — Evidence: `write-up-template.md` §"Concepts worth explaining".
- [x] Write "What tripped me up": identity collisions between profiles, confusion about where
      `app.config.js` vs. `eas.json` settings apply. — Evidence: `write-up-template.md` §"What tripped me up".
- [x] Write "Checkpoint evidence": all three builds installed side by side with distinct names and
      icons. — Evidence: `write-up-template.md` §"Checkpoint evidence".
- [x] Write "What I'd do differently." — Evidence: `write-up-template.md` §"What I'd do differently".
- [x] Author `module_03.md` (teaching material for the content library), once write-up-template.md
      is filled in and your build passes VALIDATE: draw the lesson from write-up-template.md's
      "How to build it," "Concepts worth explaining," and "Why it's built this way" sections (not
      its "What tripped me up" / "What I'd do differently" narrative). Close the file with exactly
      5 open-ended comprehension questions — one per distinct concept (reuse concepts if fewer than
      5 distinct ones exist — never pad with an unrelated question to hit the count), never yes/no,
      never containing the answer — and an Understanding Checklist with one self-assessable item
      per question. — Evidence: `modules/m03-ios-android-project-internals/module-3-ios-android-project-internals.md` (authored at the mandated path for `module_03.md`; 5 open-ended questions + 5-item Understanding Checklist; passed this VALIDATE run).
