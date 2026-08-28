# Upstream Findings — Thally Platform

While building **solctx** for the Thally Sync Hackathon (Track 1), integrating the
project with Thally surfaced a number of reproducible platform issues. They're
documented here as structured, good-faith dogfooding feedback — each with a
symptom, a minimal reproduction, a root cause, and a suggested fix. Several
include concrete code-level fixes.

Context: `solctx` is an MCP server (the *product* repo Track watches);
`solctx-docs` is the Thally documentation site scaffolded with
`create-thally-docs`. Environment: Windows 11 + WSL (Ubuntu), Node 22, the
managed build runs on Linux.

## Summary

| # | Severity | Area | Finding |
|---|---|---|---|
| 1 | High | Managed build | Regenerated `src/app` runtime imports a module it doesn't ship (`@/lib/i18n/doc-route`) → build fails |
| 2 | High | Scaffold | Committed `package-lock.json` is platform-incomplete → Linux `npm ci` fails on `@emnapi`/`sharp` optional deps |
| 3 | High | Runtime | `getSiteUrl()` uses `??`, so a blank `THALLY_SITE_URL` yields `""` and crashes `new URL("")` during `generateMetadata` |
| 4 | Medium | CLI | Docs tell users to `npx thally check`, but the bare `thally` npm package 404s (real package is `@thallylabs/cli`) |
| 5 | Medium | Onboarding | Connecting a plain code repo as the docs *source* fails deep in the build with no early guidance that a Thally-scaffolded site is required |
| 6 | Medium | Error UX | `docs.json` schema errors are cryptic (`config.tabs is not iterable`) and the connect-time validator accepts configs the build later rejects |
| 7 | Low | Self-repair | `thally starter update --apply` refuses on a lightly-edited project ("manifest edited… refusing to update"), so it can't repair a drifted runtime |
| 8 | Low | Windows | `thally check` crashes with `'C:\Program' is not recognized` (unquoted path containing a space) |
| 9 | Low | Scaffold | `create-thally-docs .` (current dir as target) fails with `EBUSY: resource busy or locked, rmdir` |

---

## 1 — Managed build regenerates `src/app` to an inconsistent runtime (High)

**Symptom.** Managed production build fails:
```
Module not found: Can't resolve '@/lib/i18n/doc-route'
./src/app/(docs)/[[...slug]]/page.tsx:22
```

**Reproduction.** Scaffold a site, connect it, trigger the managed
(`build:cloudflare` → `opennextjs-cloudflare`) build.

**Root cause.** The committed `src/app/(docs)/[[...slug]]/page.tsx` imports
`@/lib/i18n/request`, `content`, and `metadata` — all of which exist in the repo.
The managed build compiles a **different** `page.tsx` (it regenerates/synchronizes
the framework runtime at build time) that imports `@/lib/i18n/doc-route` and
`localizedPath` from `@/lib/i18n/config` — modules the shipped `src/lib/i18n/`
does not contain. The regenerated runtime is internally inconsistent.

**Evidence it's build-side, not project-side.** The identical committed code
builds and deploys cleanly on Vercel (`next build`), which uses the repo's own
`src/app`. Only the managed runtime-sync path fails.

**Suggested fix.** Pin the framework-sync to the runtime commit recorded in
`starter-release.json`, and add a CI check that every `@/lib/i18n/*` import in
`src/app` resolves to a file the same runtime ships.

---

## 2 — Committed lockfile is platform-incomplete → Linux `npm ci` fails (High)

**Symptom.**
```
npm ci can only install packages when your package.json and package-lock.json are in sync.
Missing: @emnapi/runtime@1.11.3 from lock file
Invalid: lock file's @emnapi/wasi-threads@1.2.1 does not satisfy @emnapi/wasi-threads@1.2.3
```

**Root cause.** A `package-lock.json` generated on Windows omits the Linux-only
optional native/wasm deps (`@emnapi/*`, `@img/sharp-*`) pulled transitively by
`unrs-resolver`/`sharp`. The managed build runs strict `npm ci` on Linux and
rejects the incomplete lockfile.

**Workaround used.** Regenerate the lockfile on Linux (WSL): `npm install`, then
verify `npm ci` is clean. `@emnapi/runtime@1.11.3` then appears in the lockfile.

**Suggested fix.** Generate the scaffold's lockfile with all platform optionals,
or run the managed install with `npm ci --omit=optional` / `npm install` for the
first release.

---

## 3 — Blank `THALLY_SITE_URL` crashes the build (`new URL("")`) (High)

**Symptom.**
```
TypeError: Invalid URL   at src/app/layout.tsx:103  → new URL(siteUrl)   input: ''
```

**Root cause.** `src/lib/site-url.ts`:
```ts
return (process.env.THALLY_SITE_URL ?? process.env.DOX_SITE_URL)
     ?? process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL
```
`??` only falls back on `null`/`undefined`. When the environment sets
`THALLY_SITE_URL=""` (empty), it returns `""`, and `new URL("")` throws during
`generateMetadata`, failing the whole production build.

**Suggested fix.** Treat blank as absent:
```ts
const explicit = [process.env.THALLY_SITE_URL, process.env.DOX_SITE_URL,
                  process.env.NEXT_PUBLIC_SITE_URL]
  .map(v => v?.trim()).find(v => v)
if (explicit) return /^https?:\/\//.test(explicit) ? explicit : `https://${explicit}`
// then a platform fallback (e.g. VERCEL_URL) and finally DEFAULT_SITE_URL
```

---

## 4 — `npx thally check` points at a 404 package (Medium)

**Symptom.** Build errors instruct: *"Run `npx thally check` in the repository."*
Running it:
```
npm error 404 Not Found - GET https://registry.npmjs.org/thally
```

**Root cause.** The published CLI is `@thallylabs/cli` (bin `thally`), not the
bare `thally` package.

**Suggested fix.** Update remediation text to `npx @thallylabs/cli check` (or
publish/redirect a `thally` shim).

---

## 5 — Connecting a code repo as docs source fails late, with no early guidance (Medium)

**Symptom.** Connecting a normal application repo as the documentation *source*
passes the initial connect, then fails progressively deep in the pipeline
(`docs.json` → `src/content/*.mdx` → `npm ci` → `build:cloudflare`), because a
docs source is expected to be a full Thally (Next.js) project.

**Suggested fix.** At connect time, detect the absence of `docs.json` /
`src/content` / the Thally runtime and surface: *"This repo isn't a Thally site —
create one with `create-thally-docs`, or connect it as a product repository
instead."*

---

## 6 — Cryptic `docs.json` schema errors; connect-vs-build validation mismatch (Medium)

**Symptom.** `Error: config.tabs is not iterable`. A `navigation.groups` layout
(valid in some Mintlify-style schemas) is rejected; the validator wants a
top-level `tabs` array. Separately, the connect-time validator accepted a
`docs.json` that the build later rejected (missing `src/content/*.mdx`).

**Suggested fix.** Emit actionable schema errors (name the expected key + a
minimal valid example), and run the same validation at connect-time and
build-time.

---

## 7 — `thally starter update --apply` can't repair a drifted runtime (Low)

**Symptom.** `Error: The project starter manifest is edited, unknown, or
ambiguously registered; refusing to update.` — even on a project whose only edits
are authored content and `site.ts` (both outside the framework-sync set).

**Suggested fix.** Allow `--force`/`--reset-runtime` to reapply the pinned runtime
while preserving authored paths.

---

## 8 — `thally check` breaks on Windows paths with spaces (Low)

**Symptom.** `'C:\Program' is not recognized as an internal or external command`.
A spawned subprocess uses an unquoted path containing a space (e.g.
`C:\Program Files\nodejs\...`).

**Suggested fix.** Quote spawned paths / use `execFile` with an argv array.

---

## 9 — `create-thally-docs .` fails on current-directory target (Low)

**Symptom.** `Error: EBUSY: resource busy or locked, rmdir '...'` when the target
is `.`. Passing a named subdirectory works.

**Suggested fix.** Special-case `.`/existing-empty-dir targets instead of trying
to remove the CWD.

---

## What worked well

- `create-thally-docs` produces a complete, coherent project in one command.
- The content model (`docs.json` + `src/content/*.mdx` + `src/data/site.ts`) is
  clean and easy to author.
- Local `next build` compiled all authored MDX and built the embeddings index
  with zero configuration and no API key.
- Track's product-repo model (watch merged PRs → draft doc PRs) is the right
  mental model for keeping docs in sync with code.

---

*Filed by the solctx team as part of a Thally Sync Hackathon (Track 1) submission.
Every item above is reproducible; happy to provide full logs or a screen recording.*
