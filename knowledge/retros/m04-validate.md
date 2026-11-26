# Retro — M04 validate

## Backlog

- **Reference docx still missing.** `docs/reference/module-6-express-basics.docx` remains the stated
  primary format source but is absent from the repo (no `docs/reference/`). The M04 guide follows
  the prescribed section order and the M01–M03 precedent. Carried over from `m01-validate.md`,
  `m02-validate.md` and `m03-validate.md`.
- **Checklist filename drift.** `tasks.md` names the teaching artifact `module_04.md` while the
  artifact rule mandates `module-4-core-components-layout-navigation.md`. The item was left
  word-for-word intact, ticked at VALIDATE (as in M03), and its evidence note records the mandated
  path. Reconcile the baseline wording in the next planner pass.
- **Learner-executed acceptance stays open.** The Setup/Build/Verify items and the brief's three
  Definition-of-done checks (data survives restart, navigation on both platforms, accessibility
  checklist passes) describe work in the separate `PersonalProfileApp`. They remain unticked in this
  repo, which holds the instructional artifacts only (M02 precedent).
- **VoiceOver needs a device.** The guide teaches Xcode's Accessibility Inspector for the simulator
  and a real device for the actual screen-reader pass. A real-device pass is still the learner's to
  perform and record.
- **External docs drift.** All 10 URLs in the M04 guide returned 200 in this run. The old
  `https://reactnavigation.org/docs/typing-with-typescript/` URL is 404; the live page is
  `https://reactnavigation.org/docs/typescript/`. The upstream AsyncStorage README now shows a
  `createAsyncStorage` factory, while M02/M04 teach the default-export API pinned for SDK 58; the
  guide notes the difference. Re-run the URL check every cohort.
- **Dead link found and fixed.** A write-up "What I built" link pointed at the learner's local
  `docs/evidence/m04-accessibility-checklist.md` outside the repo and did not resolve. It is now an
  inline code path. See `knowledge/patterns/m04-module-guide-link-constraints.md`.

## NativeWind conversion backlog

- **`brief.md` still says NativeWind is optional.** The guide, write-up and checklist now teach it
  as this cohort's default, but the brief was out of scope for the conversion. Reconcile the brief's
  stack-constraints line in the next planner pass.
- **SDK 58 compatibility is not explicitly confirmed upstream.** NativeWind's installation page
  names SDK 57 as the newest confirmed release for v4.2.7. The guide therefore pins
  `nativewind@4.2.7` (v5 is an RC), installs through `npx expo install` (including
  `react-native-worklets`, required by the SDK 58 Reanimated 4 line), and requires
  `npx expo-doctor` + `npx expo install --check` before the learner proceeds. Confirm the resolved
  versions for SDK 58 and freeze them for the next cohort.
- **Keep the hybrid boundaries in mind for M09.** Static styling uses `className`, but dynamic
  numbers (pressed opacity, raw safe-area insets, `textAlignVertical`) still use `style`, and
  React Navigation's native bars still use JS style objects and a theme object from the same token
  palette. Third-party native views such as `GestureHandlerRootView` may not forward `className`.
- **Graph freshness.** The blast-radius query for the converted guide/write-up/checklist touched
  only the expected markdown communities (M04, M01/M03/M05/M09 briefs/tasks and the knowledge
  patterns); no code symbol depended on these files. `graphify-out/graph.json` was last built from
  an earlier commit, so re-run the graph after the next committed change.
