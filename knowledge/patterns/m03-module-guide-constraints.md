# Pattern — M03 module guide constraints

Discovered while applying the M03 artifact rule. Reuse for later modules.

## Checklist item naming can drift from the artifact rule

An older `tasks.md` may name the teaching artifact `module_XX.md` while the artifact rule mandates
`modules/<folder>/module-<no.>-<title>.md`. Do **not** reword the checklist item. Create the file at
the mandated path and record the alias in that item's evidence note:
`authored at the mandated path for module_XX.md`. This keeps the checklist structurally untouched.

## "Close with questions" vs. "Appendix last"

Some checklist authoring items say to close the guide with N open-ended questions plus an
Understanding Checklist, while the section order mandates `Appendix — Self-Check Answers` last.
Keep the mandated section order: put exactly N open-ended questions and an N-item Understanding
Checklist inside `Self-Check`, then finish with the Appendix answers. The M01/M02 guides follow this
same shape.

## A module can require the tool another module forbids

M02 says do not run `expo prebuild` on the hand-managed project; M03 requires running it once to
make the native folders legible. Resolve by running it on a throwaway copy (`mkdir -p`, `cp -R`,
`npx expo prebuild --clean`, inspect, `rm -rf`) and proving with `git status --short` that the real
project's committed `ios/` and `android/` folders are unchanged. Teach the copy as part of the
walkthrough, not as a footnote.

## Indented fences in write-ups

Write-up sections nested under numbered lists use indented code fences. A fence check anchored at
`^```` returns zero for those files, so extract with a leading-whitespace-tolerant pattern before
declaring the file fence-free.
