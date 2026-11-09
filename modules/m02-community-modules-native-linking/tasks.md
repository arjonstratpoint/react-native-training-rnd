# M02 Tasks — Community Modules and Native Linking

For any given need, decide whether an Expo package, a community module, or custom native code fits
best — and install and link a community module by hand.

> There is no solutions file for this stage. This checklist guides the work; it doesn't contain it.

## Setup

- [ ] Read this stage's `brief.md` fully.
- [ ] Ask your trainer for the filled-in example lock-in-audit row, so you know the format to match
      before you start building yours.
- [ ] Research the hybrid rule: when to reach for a community module vs. a small Expo utility.
- [ ] Research how native linking works: autolinking, `pod install`, Gradle changes, and how an icon
      font gets registered on each platform (`UIAppFonts` in Info.plist, a Gradle script on
      Android).
- [ ] Research how to judge whether a community module is safe to depend on: recent releases, New
      Architecture support, fit with React Native 0.88, and its standing on React Native Directory.
- [ ] Research what `eas build` and `eas submit` each do, and set up an EAS account (free tier).
- [ ] Research `expo prebuild` vs. committed native folders, and why this course hand-manages the
      committed ones.

## Build

- [ ] Add `@react-native-async-storage/async-storage`, `react-native-safe-area-context` and
      `react-native-vector-icons` to the profile app using `npx expo install`.
- [ ] Link each module by hand wherever autolinking needs help, including registering the icon font
      on both platforms yourself.
- [ ] For each of the three dependencies, check and record: last release date, New Architecture
      support, and its React Native Directory standing.
- [ ] Write the one-page lock-in audit covering every dependency added so far, matched to your
      trainer's example row format.
- [ ] Run `npx expo-doctor` again and resolve anything new it flags.

## Verify

- [ ] Verify all three modules are linked and visibly working on both platforms.
- [ ] Verify the lock-in audit covers every dependency added so far and matches the example row's
      format.
- [ ] Get instructor review on the lock-in audit and resolve any feedback.
- [ ] Verify `npx expo-doctor` reports no errors.
- [ ] Do a final self-review against every checkbox in `brief.md`'s Definition of done.

## Write-up

- [x] Write "What I built" in `write-up-template.md`. — Evidence: filled as a worked example in
      `write-up-template.md` (this APPLY), linking the module guide, brief, lock-in audit and build
      evidence.
- [x] Write "Why it's built this way (key decisions)": for each of the three modules, what made you
      confident (or not) it was safe to take on, and where autolinking needed help. — Evidence:
      `write-up-template.md` answers all three module decisions and the iOS/Android resource-linking
      gap.
- [x] Write "How to build it (teach it to the next trainee)": a guide to linking a community native
      module by hand, using one of your three modules as the worked example. — Evidence: eight-step
      worked guide in `write-up-template.md` using `react-native-vector-icons` on both platforms.
- [x] Write "Concepts worth explaining": pick 1-2 ideas (autolinking vs. manual linking, or judging
      dependency safety) and explain each in your own words. — Evidence: two worked-example concepts
      in `write-up-template.md` (autolinking vs. resource linking; the four dependency-safety
      questions).
- [x] Write "What tripped me up": linking surprises, icon font gotchas, anything expo-doctor caught.
      — Evidence: worked-example notes in `write-up-template.md` (pod vs. `UIAppFonts`, stale
      Android assets, missing `SafeAreaProvider`, late `expo-doctor` run).
- [x] Write "Checkpoint evidence": all three modules working on both platforms, and the completed
      lock-in audit. — Evidence: checkpoint list in `write-up-template.md` naming both build logs,
      two platform screenshots and `docs/lock-in-audit.md` (filled by the learner in
      Walkthrough 6).
- [x] Write "What I'd do differently." — Evidence: closing section of `write-up-template.md` filled
      as a worked example (audit skeleton first, evidence captured live, exit seams in the same
      commit).
- [ ] Author `module_02.md` (teaching material for the content library), once write-up-template.md
      is filled in and your build passes VALIDATE: draw the lesson from write-up-template.md's
      "How to build it," "Concepts worth explaining," and "Why it's built this way" sections (not
      its "What tripped me up" / "What I'd do differently" narrative). Close the file with exactly
      5 open-ended comprehension questions — one per distinct concept (reuse concepts if fewer than
      5 distinct ones exist — never pad with an unrelated question to hit the count), never yes/no,
      never containing the answer — and an Understanding Checklist with one self-assessable item
      per question.
