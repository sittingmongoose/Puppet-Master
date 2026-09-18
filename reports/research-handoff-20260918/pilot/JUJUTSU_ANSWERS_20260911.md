# Jujutsu research decisions — Jared's answers (2026-09-11)

Canonical record: `Plans/Decision_Log.md` DL-043 (allocated at landing; the entry title is the stable anchor). Packet SHA-256 `66e516daa5f3ee747be434bce53af8dcb89d40892df1de9b4aaa71aea1cde767`. Every answer is the verbatim option or recommendation Jared chose. Card numbers follow the reviewer's grouped sheet; D-ids are the technical companion's.

Summary: 29 accepted for planning, 4 accepted with a stated condition, 2 policies, 1 architecture choice, 8 declined or deferred.

## Operation history and recovery

- **Named history markers** (`J01`, `D002`) — Add named markers on existing checkpoints — *Accepted for planning*
- **Grouped history actions** (`J02`, `D003`) — Group display and provide verified group undo — *Accepted for planning*
- **Recent actions and redo** (`J03`, `D004`) — Add recent actions and supported redo — *Accepted for planning*
- **Filter operation history** (`J04`, `D005`) — Add simple action and time filters — *Accepted for planning*
- **Readable operation descriptions** (`J05`, `D006`) — Add structured descriptions from existing receipts — *Accepted for planning*
- **History storage maintenance** (`J06`, `D007`) — Diagnose growth and offer explicit maintenance — *Accepted for planning*
- **Reverse one selected operation** (`J07`, `D042`) — Add a separately labeled reverse-selected-operation action — *Accepted for planning*
- **Preview a rewrite before applying it** (`J08`, `D043`) — Add an explicitly managed rewrite preview and apply workflow — *Accepted for planning*
- **Browse an earlier repository state** (`J09`, `D044`) — Add a clearly labeled earlier-state browsing mode — *Accepted for planning*
- **Export operation diagnostics** (`J10`, `D037`) — Add explicit sanitized export — *Accepted for planning*
- **View source-control commands** (`J11`, `D038`) — Add an optional technical log view — *Accepted for planning*

## Editing changes

- **Combine divergent versions** (`J12`, `D010`) — Add guided convergence when supported — *Accepted for planning*
- **Duplicate a change** (`J13`, `D011`) — Add a duplicate action — *Accepted for planning*
- **Create a merge change** (`J14`, `D012`) — Add a merge action — *Accepted for planning*
- **Absorb edits into earlier changes** (`J15`, `D013`) — Add absorption with preview — *Accepted for planning*
- **Back out a change** (`J16`, `D014`) — Add a back-out action — *Accepted for planning*
- **Compare versions of a change** (`J17`, `D015`) — Add a version-to-version comparison — *Accepted for planning*
- **Change evolution** (`J18`, `D016`) — Add a focused evolution view — *Accepted for planning*
- **Edit history by dragging** (`J19`, `D031`) — Add previewed drag actions and keyboard equivalents — *Accepted for planning*
- **Scriptable partial changes** (`J20`, `D019`) — Add a structured hunk selection interface — *Accepted for planning*

## Workspaces and repositories

- **Read-only repositories** (`J21`, `D001`) — Add a supported read-only browsing mode — *Accepted for planning*
- **Adopt existing workspaces** (`J22`, `D008`) — Add an explicit adoption and repair flow — *Accepted for planning*
- **Hide inactive workspaces** (`J23`, `D009`) — Add hide and unhide — *Accepted for planning*
- **Very large repository backends** (`J24`, `D036`) — Defer specialized storage — *Declined or deferred*

## Graph, comparison and review views

- **Prioritize graph lanes** (`J25`, `D029`) — Add explicit lane priorities — *Accepted for planning*
- **Help with history queries** (`J26`, `D030`) — Add native query assistance — *Accepted for planning*
- **Keep comparison context visible** (`J27`, `D032`) — Add pinned comparison and selected-change details — *Accepted for planning*
- **Line attribution and file history** (`J28`, `D017`) — Add bounded attribution and file history — *Accepted for planning*
- **Review marks that survive edits** (`J29`, `D018`) — Add conservative matching with stale markers — *Accepted for planning*
- **Review a workspace with AI** (`J30`, `D033`) — Use existing chat review workflows — *Declined or deferred*
- **New line endings in mixed-ending text** (`J31`, `D020`) — Use the nearest existing line ending; preserve existing endings on ordinary Save. — *Policy set*
- **Use an external diff or merge editor** (`J32`, `D021`) — Keep resolution inside Puppet Master — *Declined or deferred*

## Publishing, forges and conflicts

- **Publish unresolved conflicts** (`J33`, `D027`) — Block by default; add an advanced path only for qualified compatible targets. — *Accepted with the stated condition*
- **Resolve a conflicted bookmark** (`J34`, `D028`) — Add a guided picker only if it clarifies rather than hides the target states. — *Accepted with the stated condition*
- **Publish a stack of reviews** (`J35`, `D039`) — Add one explicitly supported forge workflow at a time. — *Accepted with the stated condition*
- **Additional review services** (`J36`, `D040`) — Add only for a concrete user workflow and keep local history independent. — *Accepted with the stated condition*
- **Custom actions around publishing** (`J37`, `D041`) — Keep publication within existing adapter behavior — *Declined or deferred*

## Architecture and integrations

- **How the adapter runs** (`J38`, `D022`) — Own a separate internal service — *Architecture choice*
- **Reuse a diff library** (`J39`, `D023`) — Keep an independently owned diff implementation — *Declined or deferred*
- **Connect external IDEs** (`J40`, `D024`) — Keep source-control interaction in Puppet Master — *Declined or deferred*
- **Shared source-control service** (`J41`, `D025`) — Use existing owner services only — *Declined or deferred*
- **Connect other agent tools** (`J42`, `D026`) — Keep existing internal agent routes — *Declined or deferred*

## Backups

- **Store or rebuild history indexes** (`J43`, `D034`) — Prefer rebuilding correctness-critical indexes in the isolated drill; keep captured indexes only as an optional speed aid. — *Policy set*
- **Complete missing repository data** (`J44`, `D035`) — Add a separately authorized completion workflow — *Accepted for planning*

## What deliverable 5 does with this

The full instruction is `NEXT_GOAL_2_D5_20260911.md` beside this file. In short:

1. Preserve all 44 dispositions in their five classes (29 accepted, 4 conditional, 2 policies, 1 architecture choice, 8 declined or deferred) through the ledger and the independent review.
2. Plan the accepted, conditional, policy and architecture items as PlanUnits under their owners, with stated conditions as acceptance criteria. Declined items get no PlanUnit and are recorded as declined.
3. Publish an answered companion under `reports/jujutsu-research-2026-09-11/d5/`; leave the frozen `d3/technical-companion.json` untouched, because DL-043 cites its hash.
4. J38 and J39 follow DL-035: the adapter is a PM-owned internal service and the diff engine is PM-owned.
5. Regenerate derived files on the branch, push, land by AGENTS.md, remove the worktree.
