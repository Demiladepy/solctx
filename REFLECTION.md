# solctx — Reflection

> **Draft for Demilade to personalize.** Everything below is grounded in what we
> actually built and hit during the Thally Sync Hackathon (Track 1). Rewrite it
> in your own voice — a DevRel reading this will value candor and specifics over
> polish. Swap/merge questions to match the official reflection prompts.

---

### 1. What did you build, and why?

I built **solctx**, a Model Context Protocol (MCP) server that gives AI coding
agents live, structured context about Solana devnet — searchable docs, live
chain state, canonical runnable examples, and canonical program addresses.

The motivation is concrete: agents write Solana code from training data that's
months stale, so they hallucinate program IDs, use deprecated RPC calls, and
can't see the network as it is *now*. solctx closes that gap with five focused
tools an agent calls on demand instead of guessing. It runs with **no API keys**
by default (local BM25 doc search, public RPC), and optionally upgrades doc
search to semantic embeddings.

### 2. How was the doc-sync workflow — did Track keep your docs honest?

The **model is exactly right**, and that's the part I'm most convinced by: your
code repository is a *product repository* Track watches, and a merged PR becomes
a drafted documentation PR you review. Docs and code stay one source of truth,
with a human in the loop before anything publishes.

In practice I proved the core locally — `thally track test` read my merged PR,
matched the changed files, and produced the exact doc-drafting task. Where I hit
friction was the managed publish pipeline (see Q3). Once I understood the
architecture, the loop was legible: ship code → Track distills the diff → the
agent drafts the doc update → I accept/edit/reject.

*(Personalize: describe the specific change you shipped — the `supply` query or
`get_program_addresses` — and what Track drafted, whether you accepted or edited
it, and why.)*

### 3. What surprised you? / What was hardest?

The hardest part wasn't Solana or MCP — it was **reverse-engineering an
undocumented platform from error messages.** Integrating solctx surfaced **nine
reproducible platform issues**, which I wrote up with repro steps, root causes,
and fixes (`UPSTREAM_FINDINGS.md`). A few examples:

- A blank `THALLY_SITE_URL` crashed the production build via `new URL("")` —
  `getSiteUrl()` used `??`, which doesn't guard empty strings. I patched it.
- A Windows-generated `package-lock.json` broke the Linux `npm ci` (missing
  `@emnapi`/`sharp` optional deps). Regenerating on Linux fixed it.
- The managed build regenerated `src/app` into a runtime that imported a module
  it didn't ship (`@/lib/i18n/doc-route`) — the same code built fine on Vercel.

Turning that pain into a structured findings report was the most valuable thing
I did — it reframes a hard week as rigor.

### 4. What did you learn?

The biggest lesson was an **architecture insight I got wrong first**: a Thally
docs site is a full (hidden) Next.js + Cloudflare project, not something you can
bolt onto an existing code repo. I initially connected the *code* repo as the
docs source, which failed progressively deeper in the build. The right shape is
two repos: a Thally-scaffolded docs site (`create-thally-docs`) **and** the code
repo connected as a *product repository* for Track. Once I split them, it clicked.

I also leaned into MCP's ergonomics: strict zod input validation, every tool call
wrapped so errors return cleanly instead of crashing the transport, and a
hybrid doc-search design (keyless BM25 by default, semantic when a key exists)
behind one interface.

### 5. What would you do differently, and what's next?

Differently: **scaffold the Thally site first**, treat the code repo purely as a
product repo from day one, and not try to make one repo be both. That single
decision would have saved most of the friction.

Next: more tools (per-account inspection, transaction simulation), a larger
curated docs corpus, and — the real prize — multiple Track cycles so the
doc-sync loop is shown repeatedly, not once. I'd also wire the findings into a
proper issue thread with the Thally team.

### 6. Would you use Thally again? What would make it better?

Yes. The "keep customer-facing knowledge in sync with product changes" thesis is
one I actually want, and the content model (`docs.json` + `src/content/*.mdx` +
`site.ts`) is clean to author. What would make it better is DX polish on exactly
the nine issues I filed — clearer connect-time validation, cross-platform
lockfiles, actionable schema errors, and a managed build that matches the local
one. Fix those and the on-ramp goes from days to minutes.

---

*solctx — built by Demilade Ayeku (Fullstack / DevRel) for the Thally Sync
Hackathon, Track 1. Findings: `UPSTREAM_FINDINGS.md`. Live docs:
https://solctx-docs.vercel.app*
