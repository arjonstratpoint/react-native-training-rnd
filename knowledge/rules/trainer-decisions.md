# Resolved trainer / cohort decisions

**Single source of truth.** Every tutorial artifact (module guide, `brief.md`, `write-up-template.md`,
`tasks.md`) and every E→P→A→V command must use the answers below. A question that reads "ask your
trainer", "confirm with the trainer", "verify with trainer", "check with the instructor", etc. is
**not** an acceptable final answer in learner-facing docs — resolve it here first, then write the
concrete answer into the docs.

## Decision log

| ID | Question (as it appeared in the material) | Authoritative answer | Applies to | Source / confirmed |
|----|--------------------------------------------|----------------------|------------|--------------------|
| D-001 | Confirm with your trainer, before Day 1: the exact Xcode version for this cohort (the stack targets Xcode 26.4+, but confirm whether this cohort tests on a newer major) | 26.6 | M01–M11 and all future modules | Trainer answered via `/evaluate` hard gate, 2026-11-27 (source: `modules/m01-toolchain-hybrid-project-setup/brief.md:81-84`, `tasks.md:11-12`; arch-doc decision #2 at `docs/arch-docs/React Native Bare Workflow Curriculum — Solution Design.md:210`) |
| D-002 | Confirm with your trainer, before Day 1: whether `create-expo-app --template bare-minimum` actually installs SDK 58 at freeze time — if it doesn't, your trainer will tell you to use `init` plus `install-expo-modules` instead | Use Expo SDK 58 with the managed workflow + Development Client, TypeScript, and NativeWind. Use EAS Build with eas.json for development, staging, and production. | M01–M11 and all future modules | Trainer answered via `/evaluate` hard gate, 2026-11-27 (source: `modules/m01-toolchain-hybrid-project-setup/brief.md:81-84`, `tasks.md:13-15`, module guide `:55-57` and `:249-257`, arch-doc decision #3 at `docs/arch-docs/React Native Bare Workflow Curriculum — Solution Design.md:211`) |
| D-003 | Get the three planted setup faults from your trainer and fix each one, recording the symptom and the fix as you go | Wrong Node version, missing Pod install, bad `ANDROID_HOME` — exactly as named in brief.md, the guide and the arch doc | M01 (and all future M01 cohorts) | Trainer confirmed via `/validate` hard gate, 2026-11-27 (source: `modules/m01-toolchain-hybrid-project-setup/brief.md:63-64`, `tasks.md:44-45`, module guide Walkthrough 5, arch doc line 83) |

## Rules for updating this file

1. **Never guess an answer.** Add a row only after the user has answered. If unanswered, the
   active `/evaluate`, `/plan`, `/apply`, or `/validate` step stops and asks the user, grouping all
   open questions into one prompt with their exact source locations.
2. Use a stable `D-###` ID so plans, retros and modules can cite it. Record the question verbatim,
   the answer verbatim, every module it applies to (normally **M01–M11 and all future modules**
   unless the user scopes it narrower), and who/when confirmed it.
3. When an answer changes, do **not** delete the old row: mark it `SUPERSEDED by D-###` and add a
   new row. Update every module that used the old answer in the same pass.
4. If the user says a question must stay open, record it with answer `DEFERRED — <fallback>`.
   Tutorial docs must then state the fallback concretely, never the question.
5. All modules, including ones not written yet, check this file before writing any content that
   was previously phrased as an open question.
