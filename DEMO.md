# solctx — 5-Minute Demo Script

A tight run-of-show for the Thally Sync Hackathon (Track 1) submission. Total ~5
minutes. Have Claude Desktop (with solctx registered) and two browser tabs open:
the live docs site and the Thally Track view.

---

## 0:00 — Hook (30s)

> "AI agents writing Solana code work from stale training data. **solctx** is an
> MCP server that gives any agent live, structured Solana devnet context — and
> it keeps its own docs in sync with the code through Thally's Track."

Show the repo README, then switch to Claude Desktop.

## 0:30 — The tools, live (1:45)

Type these into Claude Desktop, one at a time, letting each return:

1. **Live chain state**
   > "Using solctx, what's the current slot and total SOL supply on devnet?"

   → returns a real slot + `supply` (total / circulating). Point out it's a
   *live* RPC read, cached 5s.

2. **Docs search**
   > "Using solctx, search the docs for how to derive a PDA."

   → returns ranked doc chunks with source URLs (BM25 locally; semantic if a key
   is set — call out the hybrid).

3. **Runnable example**
   > "Using solctx, show me how to send SPL tokens."

   → returns a titled explanation, snippet, and a link to a full runnable file.

4. **Program addresses**
   > "Using solctx, list the SPL program addresses."

   → returns the canonical Token / Associated Token / Memo program IDs.

*(Four tool calls in under two minutes shows breadth without dragging.)*

## 2:15 — The Track workflow (the Track 1 centerpiece) (2:00)

This is the judged surface — the code→docs sync loop.

1. Show the open PR: **`feat: add supply query to get_chain_state`**
   ([branch](https://github.com/Demiladepy/solctx/tree/feat/chain-state-supply)).
   Note the docs *don't* mention `supply` yet.
2. **Merge it.** In Thally's Track, `solctx` is the watched product repository.
3. Show Track detect the merged change and **draft a documentation PR** into
   `solctx-docs` — updating the `get_chain_state` page's query list.
4. **Review it** — accept / edit / reject, narrating the reasoning. That review
   step is the whole product thesis: humans stay in the loop; docs never drift.
5. Open the **live docs** to show the published result:
   https://solctx-docs.vercel.app

> *If Track can't publish (see findings below), narrate the intended loop and
> show the live site + the staged PR — the workflow is still legible.*

## 4:15 — Close: rigor (45s)

> "Building on a new platform, we didn't just consume it — we stress-tested it."

Open the **Upstream Findings** report: nine reproducible Thally bugs with repro
steps, root causes, and fixes — including two we patched in Thally's own runtime
to get the site to build.

> "A live MCP server, a live docs site, a working code→docs sync, and a
> platform-QA report. That's solctx."

---

### Links
- Live docs — https://solctx-docs.vercel.app
- Server repo — https://github.com/Demiladepy/solctx
- Docs repo — https://github.com/Demiladepy/solctx-docs
- Findings — [`UPSTREAM_FINDINGS.md`](UPSTREAM_FINDINGS.md)
