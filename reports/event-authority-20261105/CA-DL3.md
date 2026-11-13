# CA-DL3 — E-CARDS-3 Decision Log entries

**Branch:** `plans/ea-cards3-answers-20261105`.
**Base:** `origin/main` at `2989975e8f`.

## Result

Wrote exactly **12** `### DL-NNN:` entries, **DL-453 through DL-464**, in `Plans/Decision_Log.md`, plus one YAML PlanUnit fence per entry. Every item maps to exactly one A option; **unmapped or ambiguous items: none**.

Each entry preserves the item label and exact question; Jared's verbatim answer, "The rest I will defer to your recommendations."; the answer source and `2026-11-05T17:02:41Z` timestamp; pm7-build's relayed reading, explicitly labelled as theirs ("So A on all 12 items of E-CARDS-3.md."); the deck's fast-reply mapping; verbatim A text; the exact Sources line; and scoped supersession/conditions. Entries whose option A invokes shared deck rules also quote those rules verbatim (Terms for DL-453..455, the For-A-or-B counting boundary for DL-458, the common checkpoint boundary for DL-459, the Card 7 common boundary and deletion/protection rule for DL-460..464).

The pre-existing Decision Log body is byte-preserved after removing the inserted entry and fence blocks. No family was admitted, no registry or governance artifact was edited, no owner-text application was performed, and no main push was made. The changes are the entries, their generated shards/index and this report.

## Entry map

| Decision Log id | Deck item | Selection | Entry |
|---|---|---|---|
| DL-453 | 1.a | A | 47 lasting-change histories stay permanently |
| DL-454 | 2.a | A | 33 routine histories stay 90 days from the first durable save |
| DL-455 | 3.a | A | 24 operational, security and recovery histories stay seven years |
| DL-456 | 4.a | A | Four session-prompt request histories live with their target chat |
| DL-457 | 5.a | A | Question-budget refusal history stays seven years |
| DL-458 | 6.a | A | One cross-chat revoke entry lasts until the last affected chat is deleted |
| DL-459 | 6.b | A | Browser reader checkpoints keep a replaced copy seven days |
| DL-460 | 7.a | A | Blocked-command history outside Projects gets its own allowance and scoped rule |
| DL-461 | 7.b | A | Override-refusal proof outside Projects uses Server-wide capacity and deletion rules |
| DL-462 | 7.c | A | Override-request proof outside Projects uses Server-wide capacity and deletion rules |
| DL-463 | 7.d | A | Guard-startup-failure history outside Projects gets its own allowance and scoped rule |
| DL-464 | 7.e | A | Denied-path history outside Projects gets its own allowance and scoped rule |

DL-460..DL-464 complete the outside-Project rules that DL-422..DL-426 expressly reserved. DL-458/DL-459 keep the single-recipient Chat rule and the broader Browser split in force. Depends-on edges (DL-401, DL-415, DL-433, DL-422..DL-426) all resolve in the regenerated index.

## Sources

| Artifact | SHA-256 |
|---|---|
| Lane brief `lanes/CARDS3-APPLY.md` | `2539a87dc104edb4b150829a7451718fff08802057e21448c04e8cc6d6469237` |
| Answer record `decision-answers/ANSWERS_E-CARDS-3_20261105.md` | `8109f41c75169dd81a1ac0b0ce22a78cc67a6828db93f5f318b88390b04fac4f` |
| Frozen presented deck `decision-answers/E-CARDS-3.as-presented-a7d00c73.md` | `a7d00c733539daa94b8a85bd9725d3658a4bbfcd7c1927507db0a4ace626db1f` |

All paths under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/`.

## Checks

| Check | Exit | Result |
|---|---|---|
| Deck SHA-256 | 0 | Exact match: `a7d00c733539daa94b8a85bd9725d3658a4bbfcd7c1927507db0a4ace626db1f` |
| ID scan DL-453..DL-464 on base | 0 | No matches; all twelve IDs free |
| Entry verification | 0 | All 12 questions, answers, A options, Sources lines and boundaries present; prior body byte-preserved |
| YAML round-trip | 0 | All 12 `canonical_text` values parse back to their prose entries exactly; 21 fields in order |
| Frozen validator `decision_section_bytes` extraction | 0 | All 12 complete entries extracted (validator read-only, not edited) |
| Currentness edition copy | 0 | All 15 ignored files SHA-256 match the shared edition before index generation |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | Top-level `pass`; 99 documents, 3,100 shards |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | Top-level `pass`; 99 documents, 3,100 shards; no failures |
| `python3 scripts/pm-plan-index.py generate` | 0 | Top-level `pass`; 96 documents, 7,500 PlanUnits, 30,191 acceptance units |
| `python3 scripts/pm-plan-index.py validate` | 0 | Top-level `pass`; zero failures |
| `git diff --check` | 0 | No whitespace errors |

Only `Plans/_shards/decision_log/**` changed among per-document shards (13 paths). The six `Plans/.plan_index/**` outputs changed. Runtime readiness remains `blocked_runtime_certification_incomplete`; no governance or runtime pass is claimed.

## Scope and limits

No `.gitignore`, registry, Spec Lock, `auto_decisions.jsonl`, frozen validator or governance evidence edit is included. Per-family admission IDs stay at DL-500 and up. Owner application is assigned to CA-RET3. No pm-mail or subagents were used.

Resource preflight: 106 GB available disk (minimum 50 GB), 15 GB available RAM (minimum 6 GB).

Report copy: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL3/CA-DL3.md`.
