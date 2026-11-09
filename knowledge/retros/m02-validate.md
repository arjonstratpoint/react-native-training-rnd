# Retro — M02 validate

## Backlog

- **Reference docx still missing.** `docs/reference/module-6-express-basics.docx` is the stated
  primary format source for every module guide but is absent from the repo (no `docs/reference/`).
  The M02 guide follows the prescribed section order and the M01 precedent instead. Add the docx so
  future guides can be checked section-for-section. Carried over from `m01-validate.md`.
- **External docs drift.** The AsyncStorage docs URL used during authoring
  (`https://react-native-async-storage.github.io/async-storage/`) returned HTTP 404. Replaced with
  the maintained repository (`https://github.com/react-native-async-storage/async-storage`). Run the
  URL check for every module guide before VALIDATE, not only when a link looks suspicious.
- **Learner-executed acceptance stays open.** The M02 checklist's Setup/Build/Verify items and the
  `module_02.md` authoring item are intentionally unticked: this repo holds the instructional
  artifacts, not a built `PersonalProfileApp`, and the authoring item is gated on the learner's build
  passing VALIDATE. They remain evidence for the next cohort's run, not for this APPLY.
