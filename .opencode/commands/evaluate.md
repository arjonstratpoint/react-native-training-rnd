# /evaluate

**EVALUATE** — Step 1 of the E→P→A→V cycle. Orient fully before writing any plan or code.

## Arguments

`/evaluate <task description, CSV path, or feature name>`

## Steps

### 1 — Orient with your knowledge graph (if one exists)

Check which backend this project has built, and use the matching query:

- `graphify-out/graph.json` exists → `graphify query "<task context from args>"`
- `.codegraph/codegraph.db` exists → `codegraph explore "<task context from args>"`
- If both exist, graphify is used by default — set `NEXUS_GRAPH_BACKEND=codegraph` to prefer codegraph instead (`nexus doctor` shows which is active).
- Neither exists → suggest `/graphify .` (or `codegraph init`) then continue without it.

Note which communities/symbols and high-degree nodes are in the blast radius.

### 2 — Load context in priority order

1. **CSV task** — if `docs/dev-tasks/` exists, load the matching row. Fields `user_story`, `description`, `acceptance_criteria`, `dependencies` are the context.
2. **AGENTS.md** — load coding standards from project root if present.
3. **Architecture doc** — scan `docs/arch-docs/` for the relevant section.
4. **knowledge/** — check `knowledge/rules/`, `knowledge/patterns/`, `knowledge/prompts/dev/` for prior patterns.

### 3 — Fix the output artifact (always this shape)

Every task in this repo produces **three Markdown files**: the module's instructional guide (which a
developer can follow and test end to end), that same module's **filled-in write-up**, and that
module's **checklist** (ticked against the work as it lands). None is code, a plan, or the brief.

- **Location and name:** inside the module's own folder, as
  `modules/<module-folder>/module-<module-no.>-<module-title>.md`
  — e.g. `modules/m01-dev-environment-git-github/module-1-dev-environment-git-github.md`.
  `<module-no.>` is the plain number (`1`, not `01`); `<module-title>` is the slug from the folder
  name.
- **Primary format reference:** `docs/reference/module-6-express-basics.docx`. Mirror it
  section-for-section: title block → Learning Goals → Concept → Read These →
  Walkthrough(s) → "What This Walkthrough Showed You" → numbered EXERCISEs → Self-Check →
  Module Deliverable → Appendix (Self-Check answers).
- **Secondary reference:** any existing `modules/**/module-<no.>-<title>.md` produced by this
  rule, so every guide stays consistent with the others.
- **Content:** instructional material only — real, runnable commands and code the learner
  executes and tests, plus exercises and self-checks. No solution files, no product code, no
  planning. Require that any step creating files/directories includes the exact terminal
  commands (`mkdir -p`, `touch`, `cat > ... << 'EOF' ... EOF`) with the full sample content.
- **Second artifact — the stage write-up.** Also fill in that module's
  `modules/<module-folder>/write-up-template.md` as a **worked example**: answer the template's own
  questions in place, and leave its existing title and description unchanged. Do **not** create a
  separate `write-up.md` or any differently named variant. Repo/code links belong in the "What I
  built" section.
- **Third artifact — the stage checklist.** `modules/<module-folder>/tasks.md` is the module's
  **baseline checklist** and the artifact of record for what is done. Update it in place: tick
  `[ ]` → `[x]` with a one-line evidence note for each item the work actually satisfies. Never
  restructure, reorder, or drop its items, and never tick work that is not done. This file is
  **updated, not generated** — if it is missing, stop and flag it rather than writing one;
  generation stays with `/dev-tasks-planner`.
- If the target file already exists, EVALUATE treats it as the artifact to review or extend — not
  a source to copy from.

### 4 — Output this summary, nothing else

```
EVALUATE SUMMARY
────────────────
Task:        <what we are building — instructional material for module M??>
Output:      modules/<folder>/module-<no.>-<title>.md  (mirrors the reference docx)
Write-up:    modules/<folder>/write-up-template.md  (filled in as a worked example)
Checklist:   modules/<folder>/tasks.md  (ticked item-by-item with evidence)
Touches:     <files / modules / graph communities or symbols>
Depends on:  <what must already exist>
Constraints: <from AGENTS.md, arch doc, acceptance criteria>
Risk:        <god nodes or high-degree nodes in blast radius>
```

### 5 — Stop

Do NOT plan. Do NOT write code. End with:

> "Ready to /plan. Type `/plan` when you want the implementation blueprint."
