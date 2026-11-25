# Pattern — M04 module guide link and command constraints

Found during M04 VALIDATE. Reuse for later module guides and write-ups.

## Learner-created files are code paths, not Markdown links

A write-up may want to point at evidence the learner creates in a separate app directory (for
example `~/Projects/PersonalProfileApp/docs/evidence/…`). A relative Markdown link from the repo
resolves outside the repository and is dead in the rendered artifact. Write such locations as
inline code paths with a short note naming the walkthrough that creates them, and reserve Markdown
links for files that exist in this repo. The URL/link resolution check will catch any that slip
through.

## Long-running commands need their own fence

Do not put a blocking command such as `npx expo start --dev-client` in the same fenced bash block
as follow-up checks like `adb devices` — copy-pasting the block stops at the server. Split it: one
block for the server, then a "In a second terminal" block for the checks. `bash -n` passes either
way, so this is a consistency read, not a syntax check.

## Verify canonical URLs instead of remembering them

React Navigation's TypeScript page moved: `/docs/typing-with-typescript/` returns 404, while
`/docs/typescript/` is live. Run the full `curl` loop over the artifact during VALIDATE, not only
when a link looks suspicious (M02 found a 404 AsyncStorage docs URL the same way).

## Upstream API drift belongs in the guide, not in a silent rewrite

When an upstream README shows a newer API than the course pins (AsyncStorage's `createAsyncStorage`
factory versus M02's default-export API), keep the pinned API used by earlier modules and add one
sentence telling the learner what the upstream form looks like. Silent rewriting makes earlier
guides look wrong; silence leaves the next cohort confused.
