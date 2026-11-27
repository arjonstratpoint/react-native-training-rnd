# Resolved trainer / cohort decisions

**Single source of truth.** Every tutorial artifact (module guide, `brief.md`, `write-up-template.md`,
`tasks.md`) and every E→P→A→V command must use the answers below. A question that reads "ask your
trainer", "confirm with the trainer", "verify with trainer", "check with the instructor", etc. is
**not** an acceptable final answer in learner-facing docs — resolve it here first, then write the
concrete answer into the docs.

## Decision log

| ID | Question (as it appeared in the material) | Authoritative answer | Applies to | Source / confirmed |
|----|--------------------------------------------|----------------------|------------|--------------------|
| _No decisions recorded yet._ | | | | |

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
