# /validate

**VALIDATE** — Step 4 of the E→P→A→V cycle. Verify the implementation before calling it done.

## Prerequisite

APPLY must be complete.

## Steps

### 1 — Knowledge graph blast radius check

- `graphify-out/graph.json` exists → `graphify query "<what we just built>"`
- `.codegraph/codegraph.db` exists → `codegraph explore "<what we just built>"`
- Neither exists → skip, and note in VALIDATE COMPLETE that this check was unavailable.

Check: does anything that references the changed files now behave unexpectedly? Flag any community/symbol boundary crossings that weren't in the plan.

### 2 — Test the artifact (does it actually work?)

Do not eyeball this — extract and run the checks against the artifact file, and report the raw
output. For instructional material, "works" means every link resolves, every code block is
syntactically valid, every command is internally consistent, and the section structure is intact.

```bash
f=<artifact path>   # modules/<folder>/module-<no.>-<title>.md

# 1. every URL resolves (expect 2xx; redirects followed with -L are fine)
grep -oE 'https?://[^ )>"`]+' "$f" | sort -u | while read -r u; do
  printf '%s  %s\n' "$(curl -s -o /dev/null -w '%{http_code}' -L --max-time 25 "$u")" "$u"
done

# 2. code fences are balanced (count must be even)
echo "fences: $(grep -c '^```' "$f")"
```

Then syntax-check the runnable blocks, best effort. Placeholder tokens (e.g. `<you>`) and
intentional elisions are expected — a failure only counts if the block is meant to run as written:

- **bash blocks** — for each fenced block tagged `bash`, extract it and run `bash -n`.
- **js blocks** — for each fenced block tagged `js`, extract it to a temp `.js` file and run
  `node --check`.
- **other blocks** (`gitignore`, plain fences) — read for internal consistency only.

Then confirm by reading the artifact:

- **Commands are internally consistent** — a branch that is merged was created earlier; a file that
  is `git add`ed exists by that point; no block assumes state a previous block did not create.
- **Internal links resolve** — every `[text](#anchor)` points at a real heading, and every filename
  a command references exists in the module folder or repo.
- **Structure is intact** — headings follow the reference order, every EXERCISE number is present,
  and every Self-Check question has an Appendix answer.

Also test the module's `modules/<module-folder>/write-up-template.md`: every template question has a
concrete answer, its title and description are byte-for-byte unchanged, and no separate `write-up.md`
or variant was created. Apply the same URL/command consistency checks to it.

Then test the module's `modules/<module-folder>/tasks.md` as the **baseline checklist**: every
`[x]` item is backed by real evidence (a resolvable PR/commit link, an existing file, or a command
that has run), every unticked `[ ]` item is genuinely not done yet, the headings/section order are
unchanged from the generated version, and no item was silently added, removed, or reworded. Every
Verify item must trace to a concrete artifact — an untraceable `[x]` is a BLOCKER.

A dead URL or a command a learner cannot run is a BLOCKER — being followable *is* the artifact's
job. Classify any failure in step 4.

### 3 — Check against acceptance criteria

First check the output-artifact criteria (these always apply):

```
[ ] Target file exists at modules/<folder>/module-<no.>-<title>.md (correct name/location)
[ ] Mirrors docs/reference/module-6-express-basics.docx section-for-section
[ ] Instructional material only — no product code, no solution files, no planning
[ ] Every URL resolves (HTTP 2xx) and every command is internally consistent — proven in step 2
[ ] The module's write-up-template.md is filled in as a worked example — its title/description are
    unchanged, its questions are answered in place, and no separate write-up.md (or variant) exists
[ ] The module's tasks.md is updated in place — completed items ticked with evidence, structure
    preserved, and no item added, removed, or reworded
```

Then load any task-specific acceptance criteria from the CSV task (or EVALUATE summary). For each
criterion:

```
[ ] <criterion> — PASS / FAIL / PARTIAL
```

### 4 — Classify all issues found

```
[BLOCKER]   — prevents merge, must fix now
[FIX NOW]   — significant issue, fix before moving to next task
[BACKLOG]   — minor, log to knowledge/retros/ and defer
```

### 5 — Fix all BLOCKERs and FIX NOWs before continuing

Do not move to the next task until the implementation passes all acceptance criteria and the step 2
checks are clean. Re-run the failing check after each fix, not just the section you edited.

### 6 — If a pattern was discovered, contribute it back

If APPLY revealed a better approach or a non-obvious constraint:

```bash
# Append to knowledge/patterns/ or knowledge/rules/coding-standards.md
```

### 7 — When clean

```
VALIDATE COMPLETE
─────────────────
Criteria passed:  N/N
Checks run:       <URLs N/N 2xx · fences balanced · N blocks syntax-checked>
Issues fixed:     <list>
Backlog items:    <list added to knowledge/retros/>
```

> "Task complete. Ready for the next `/evaluate`."
