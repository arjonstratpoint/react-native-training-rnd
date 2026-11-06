# /apply

**APPLY** — Step 3 of the E→P→A→V cycle. Implement the approved plan.

## Prerequisite

A plan must be approved. If `/plan` has not run and been approved, stop and ask.

## Steps

### 1 — Implement exactly what the plan says

- Follow the numbered steps from PLAN in order.
- Reference AGENTS.md coding standards for every file written.
- Do not add features, refactor unrelated code, or expand scope beyond the plan.
- The deliverable is the instructional-material file
  `modules/<module-folder>/module-<module-no.>-<module-title>.md`. Write it as content a developer
  can follow and test — runnable commands and code, exercises, self-checks. No product code, no
  solution files, no planning notes.
- When instructing to create files or directories, show the exact terminal commands (e.g., `mkdir -p`,
  `touch`, `cat > ... << 'EOF' ... EOF`) together with the full sample content in the same
  fenced code block(s) so the learner can copy-paste and run them end to end.
- If that file already exists, edit it in place; do not create a second copy or a differently
  named variant.
- Also fill in the module's `modules/<module-folder>/write-up-template.md` as a **worked example**:
  answer its own questions in place, and leave its existing title and description unchanged. Do
  **not** create a separate `write-up.md` or any differently named variant. Repo/code links belong
  in the "What I built" section. Report it under **Modified** in the APPLY COMPLETE summary.
- Update the module's `modules/<module-folder>/tasks.md` in place: change `[ ]` to `[x]` only for
  items the work actually satisfies, each with a one-line evidence note (PR/commit link, file path,
  or command output). Leave every other item untouched, and preserve the existing headings, section
  order, and checkbox syntax. Do **not** generate the file if it is missing — stop and flag it.
  Report it under **Modified** in the APPLY COMPLETE summary.

### 2 — The knowledge graph stays current automatically

- graphify: the `PostToolUse` hook runs `graphify update .` after every file edit — no manual step needed.
- codegraph: its own background sync daemon watches the project and updates on every file change — also no manual step needed, and nexus does not scaffold a hook for it.

Either way, the graph stays current as you write.

### 3 — Stay in scope

If you discover something unexpected that requires scope change:
- Stop implementing.
- Flag it: "Discovered: <X>. This is outside the plan scope. Revise plan before continuing?"
- Wait for direction.

### 4 — When done

State:
```
APPLY COMPLETE
──────────────
Created:   <files>
Modified:  <files>
Skipped:   <anything intentionally deferred>
```

Then prompt:

> "Ready to /validate. Type `/validate` to check against acceptance criteria."
