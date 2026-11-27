# Pattern — M01 module guide validation constraints

Found while validating the M01 toolchain guide. Reuse for later module guides.

## Re-check the graph backend at VALIDATE, not only EVALUATE

The graphify `PostToolUse` hook can create `graphify-out/graph.json` during APPLY even when it was
absent at EVALUATE. VALIDATE must re-check for `graphify-out/graph.json` and
`.codegraph/codegraph.db` before declaring the blast-radius check unavailable, then run
`graphify query` / `graphify god-nodes` if one now exists.

## Scaffold blocks must create `.nvmrc` before `nvm use`

In a walkthrough that pins Node with nvm, the `cat > .nvmrc << 'EOF' ... EOF` step must appear
**before** `nvm use` in the same fenced block. Creating the pin file after the `nvm use` command
makes the block internally inconsistent for a learner copying it end to end.

## Indented bash fences need tolerant extraction

Code fences nested under bullet lists carry leading spaces in raw Markdown. A `^```bash` extractor
misses them, so `bash -n` checks must match `^\s*```bash` and de-indent each line by the fence's
indentation before running the check. See also `knowledge/patterns/m03-module-guide-constraints.md`.
