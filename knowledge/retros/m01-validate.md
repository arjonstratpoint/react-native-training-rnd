# Retro — M01 validate

## Backlog

- **Reference docx missing.** `docs/reference/module-6-express-basics.docx` is referenced as the
  primary format source for every module guide but is absent from the repo (no `docs/reference/`).
  The M01 guide follows the prescribed section order instead. Add the docx so future guides can be
  checked section-for-section.
- **Secondary reference absent.** No existing `modules/**/module-<no.>-<title>.md` exists yet, so
  M01 is the first guide produced by this rule. Later guides should be cross-checked against it.
- **D-002 downstream drift.** M02 still forbids `expo prebuild`, M03 still assumes committed native
  folders, M04 still defaults to `StyleSheet`, and M10/M11 still assume the earlier build path.
  The M01 artifacts now teach managed + Development Client, TypeScript, NativeWind and EAS
  profiles. Reconciling those modules is a separate task, not part of the M01 artifact scope.
- **Graphify hook timing.** `graphify-out/graph.json` did not exist at EVALUATE but appeared during
  APPLY via the `PostToolUse` hook; VALIDATE re-checked and ran the graph blast-radius query.
