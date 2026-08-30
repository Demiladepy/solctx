# solctx — Demo Video Direction

A director's treatment for the submission video. Target: **3–4 minutes**, screen
recording with voiceover. Companion to [`DEMO.md`](DEMO.md) (the run-of-show);
this document is *how it should look and feel*.

## Format & tone
- **Screen recording, 1080p+**, 30fps. Record at a comfortable zoom — UI text
  must be legible when the judge watches on a laptop.
- **Voice**: calm, confident, first-person. You built this. No hype adjectives;
  let the live results carry it.
- **Pace**: no dead air. Pre-stage every tab and prompt so nothing loads on
  camera for more than ~2s. Cut, don't wait.
- **Cursor**: enlarge it; move deliberately. Highlight/point rather than wiggling.
- **Music**: optional, low ambient; duck under voice. Silence is fine.

## Setup before you hit record (stage these tabs)
1. Claude Desktop with **solctx registered** and a fresh chat.
2. Browser tab A — the **pitch deck** (slide 01).
3. Browser tab B — **https://solctx-docs.vercel.app**.
4. Browser tab C — the **`feat/chain-state-supply` PR** on GitHub.
5. Browser tab D — **Thally Track** view (product repo = `solctx`).
6. Editor/terminal tab E — the repo, `UPSTREAM_FINDINGS.md` open.

---

## Shot list

### Shot 1 — Cold open (0:00–0:20)
- **On screen**: Deck slide 01 (the `solctx` title), hold 2s → cut to Claude
  Desktop.
- **Caption (lower third)**: `solctx — live Solana context over MCP`
- **VO**: "AI agents write Solana code from months-old training data. solctx is an
  MCP server that gives any agent live devnet context — and keeps its own docs
  honest as the code changes."

### Shot 2 — Tools, live (0:20–1:45)
Type each prompt; let the result render; keep moving. Zoom the response briefly.
- **Prompt 1**: *"Using solctx, what's the current slot and total SOL supply?"*
  → **Caption**: `live RPC read · cached 5s`
- **Prompt 2**: *"Using solctx, search the docs for deriving a PDA."*
  → **Caption**: `hybrid search — BM25 local, embeddings optional`
- **Prompt 3**: *"Using solctx, show me how to send an SPL token."*
  → **Caption**: `runnable example + full file`
- **Prompt 4**: *"Using solctx, list the SPL program addresses."*
  → **Caption**: `canonical program IDs`
- **VO** (over the four): "Live chain state. Documentation search. Runnable
  examples. Canonical program addresses. Four of five tools, all answering from
  the live network — no keys required to run."

### Shot 3 — The sync loop (1:45–3:15) — *the centerpiece*
This is Track 1; give it room.
- Cut to **tab C (the PR)**. **VO**: "Here's a code change — I'm adding a `supply`
  query to `get_chain_state`. Notice the docs don't mention it yet."
- **Merge the PR** on camera. **Caption**: `merge → the trigger`
- Cut to **tab D (Thally Track)**. **VO**: "solctx is the product repository Track
  watches. On merge, Track drafts the documentation update as a pull request."
- Show the **drafted doc PR**. Open the diff. **Caption**: `Track drafted this`
- **VO**: "I review it — accept, edit, or reject, with reasoning. Docs never
  publish unreviewed." Show the accept/merge.
- Cut to **tab B (live docs)**, refresh the `get_chain_state` page showing the new
  query. **Caption**: `solctx-docs.vercel.app`
- **VO**: "And the live site reflects reality again. Code and docs, one source."

> **If Track can't fire** (managed-publish issue): narrate the intended loop over
> the staged PR + live site, and say plainly: "the workflow is wired; the
> managed publish hit a platform bug — which brings me to the last thing."

### Shot 4 — Rigor (3:15–3:50)
- Cut to **tab E**, `UPSTREAM_FINDINGS.md` (or the Findings artifact page).
- Scroll the severity summary. **Caption**: `9 reproducible bugs · repro + fixes`
- **VO**: "Building on a new platform, I didn't just consume it. I found nine
  reproducible bugs and wrote them up with root causes and fixes — including two
  I patched in Thally's own runtime to get the site to build."

### Shot 5 — Close (3:50–4:00)
- Cut to deck slide 10 (links).
- **VO**: "A live MCP server, a live docs site, a working code-to-docs sync, and a
  platform report. That's solctx."
- **End card** holds the four links for 3s.

---

## On-screen text checklist
- Lower-third captions in a mono font, bottom-left, low opacity — never cover the
  content.
- Show real values (the actual slot number, the real supply) — don't blur them.
- One idea per caption; ≤5 words.

## Common mistakes to avoid
- Don't read the JSON aloud — summarize what it *means*.
- Don't explain the code line-by-line — show it working.
- Don't apologize for the platform bugs — frame them as findings, an asset.
- Don't exceed 4 minutes. Every second past that costs attention.
