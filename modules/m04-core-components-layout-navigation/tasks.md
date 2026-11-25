# M04 Tasks — Core Components, Layout and Navigation

Build production screens from core components, set up stack and tab navigation, and handle safe
areas, the keyboard, dark mode and basic accessibility.

> There is no solutions file for this stage. This checklist guides the work; it doesn't contain it.

## Setup

- [ ] Read this stage's `brief.md` fully.
- [ ] Confirm with your trainer: which React Navigation major this cohort pins (don't assume the
      brief's version is still current — it moves fast).
- [ ] Confirm with your trainer: whether this cohort allows NativeWind in place of `StyleSheet` for
      this module (the default is `StyleSheet`; the checkpoint doesn't care which one you pick).
- [ ] Research the core components you'll build with: `View`, `Text`, `Image`, `ScrollView`,
      `Pressable`, `TextInput`, `FlatList`.
- [ ] Research Flexbox layout, `StyleSheet`, and how to keep a small set of consistent design
      tokens.
- [ ] Research safe areas and window changes (resizable iPhone windows on iOS 27, foldables).
- [ ] Research keyboard handling approaches on both platforms.
- [ ] Research dark mode and dynamic text size support.
- [ ] Research React Navigation's stack and tab navigators, typed params, and its native
      dependencies (`react-native-screens`, `react-native-gesture-handler`).
- [ ] Research the API changes worth knowing: the Strict TypeScript API default, the removal of
      `InteractionManager`, and `ImageBackground`'s deprecation.

## Build

- [ ] Set up stack and/or tab navigation across Profile, Edit Profile and Settings.
- [ ] Build the Profile screen.
- [ ] Build the Edit Profile screen with form validation for name length, email format and phone
      format.
- [ ] Build the Settings screen: dark/light theme toggle, app version line, "clear all data"
      button.
- [ ] Persist the profile data in AsyncStorage so it survives an app restart.
- [ ] Handle safe areas and the keyboard correctly on both platforms.
- [ ] Write a short accessibility checklist (labels, roles, dynamic type, a screen reader pass at
      minimum).
- [ ] Run your three screens against the accessibility checklist and fix whatever it flags.

## Verify

- [ ] Verify data survives an app restart.
- [ ] Verify navigation works correctly on both platforms.
- [ ] Verify the accessibility checklist passes and is written down in a form you can reuse in M09
      and the capstone.
- [ ] Do a final self-review against every checkbox in `brief.md`'s Definition of done.

## Write-up

- [x] Write "What I built" in `write-up-template.md`. — Evidence: `modules/m04-core-components-layout-navigation/write-up-template.md` §"What I built", including repo/code links.
- [x] Write "Why it's built this way (key decisions)": how you structured navigation and why, how
      you validated the edit form and why you trust the rules, and what's on your accessibility
      checklist and why those items specifically. — Evidence: `write-up-template.md` §"Why it's built this way (key decisions)".
- [x] Write "How to build it (teach it to the next trainee)": a guide to building an accessible,
      navigable screen flow from core components, using one of your three screens as the worked
      example. — Evidence: eight-step worked guide in `write-up-template.md` using the Edit Profile screen.
- [x] Write "Concepts worth explaining": pick 1-2 ideas (Flexbox layout, safe areas across device
      shapes, or what the Strict TypeScript API changes in how you write components) and explain
      each in your own words. — Evidence: `write-up-template.md` §"Concepts worth explaining" (safe areas across device shapes; typed params / Strict TypeScript API).
- [x] Write "What tripped me up": keyboard handling, safe-area edge cases, dark mode surprises,
      accessibility pass surprises. — Evidence: worked-example notes in `write-up-template.md` §"What tripped me up".
- [x] Write "Checkpoint evidence": data surviving a restart, navigation working on both platforms,
      and the accessibility checklist passing. — Evidence: `write-up-template.md` §"Checkpoint evidence", cross-referencing `docs/evidence/m04-accessibility-checklist.md`.
- [x] Write "What I'd do differently." — Evidence: closing section of `write-up-template.md` filled as a worked example.
- [x] Author `module_04.md` (teaching material for the content library), once write-up-template.md
      is filled in and your build passes VALIDATE: draw the lesson from write-up-template.md's
      "How to build it," "Concepts worth explaining," and "Why it's built this way" sections (not
      its "What tripped me up" / "What I'd do differently" narrative). Close the file with exactly
      5 open-ended comprehension questions — one per distinct concept (reuse concepts if fewer than
      5 distinct ones exist — never pad with an unrelated question to hit the count), never yes/no,
      never containing the answer — and an Understanding Checklist with one self-assessable item
      per question. — Evidence: `modules/m04-core-components-layout-navigation/module-4-core-components-layout-navigation.md` (authored at the mandated path for `module_04.md`; 5 open-ended questions + 5-item Understanding Checklist; passed this VALIDATE run).
