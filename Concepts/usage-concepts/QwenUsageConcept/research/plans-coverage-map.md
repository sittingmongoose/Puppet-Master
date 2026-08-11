# Plans coverage map

What was read for the Usage redesign research, and where. Full per-range detail is in plans-source-ledger.json (71 entries: 37 usage-semantics + 34 GUI). Synthesis: plans-usage-synthesis.md, plans-gui-synthesis.md, plans-command-registry.md. Gaps/conflicts: plans-gap-and-conflict-register.md.

## Documents read (with sharding)
| Document | Size | How read | Topics covered |
|---|---|---|---|
| Plans/usage-feature.md | 6237 ln | full, in chunks | UF-041 windows; UF-064/083/085/086/087 token buckets, counting_semantics, cost, provenance, dedupe; UF-074 unknown-not-zero; window_kind enum |
| Concepts/usage-concepts/BUILD_PLAN.md | full | full | usage-first framing; widget kebab/presets (prototype-only); 5h/7d framing; motion prose |
| Plans/Multi-Account.md | 5168 ln | targeted | MA-022 cooldown→hard_block; MA-063 5h vs 7d separate resets; Alibaba 5h/weekly/monthly; per-provider non-authoritative quota |
| Plans/FinalGUISpec.md | 33074 ln | grep+range via _shards/finalguispec | F3-132 compact-not-from-hover; F3-306 Context Lens; F3-418 provenance-on-every-value; F3-427 glass shell; F3-473 web→Slint map; §6 themes; §8 atomic widgets; §C.3/C.5 add-widget/persistence; scrollbar token; icon tooltip; reduced motion (2120/29698); Slint 1.17.1 pin (133/198) |
| Plans/assistant-chat-design.md | 24392 ln | grep+range via _shards | ACD-438/439/441/442 single-overlay + corner-origin sprout; §12.0 Context Detail IA; redaction (23732) |
| Plans/Widget_System.md | full | full | WS-009 layout persistence; composed page widgets; consumer of DRY |
| Plans/UI_Command_Catalog.md | 10930 ln | grep+shards | cmd.chat.compact_context (745); cmd.chat.open_thread_context_details (746); cmd.widget.resize (377); cmd.widget.add (375) vs cmd.dashboard.add_widget; cmd.usage.export |
| Plans/Contracts_V0.md | 20780 ln | grep+range via _shards | total_tokens must not double-count (2231-2233); UsagePressureState (1673); cooldown lifecycle (1687); Claude-subscriber non-authoritative (2138); cost authority |
| Plans/UI_Wiring_Rules.md, Wiring_Matrix*.json | targeted | grep | add_widget event wiring (dashboard.widget_added) |
| Plans/DRY_Rules.md | full | full | §2.1 ownership: UCC owns IDs, FinalGUISpec owns theme tokens, Widget_System consumer |
| Plans/Commands_System.md, CLI_Bridged_Providers.md, Orchestrator_Page.md | targeted | grep | command registry model; Antigravity non-authoritative (1441); top-tab pattern |

## Pre-made shards used
Plans/_shards/finalguispec/, _shards/assistant-chat-design/, _shards/contracts_v0/, _shards/ui_command_catalog/ — read in preference to whole huge docs.

## Adversarial / second-review notes
Token counting, quota windows, cost authority, provenance, and widget sizing each received an independent gap pass (recorded in plans-gap-and-conflict-register.md). The three highest-risk semantics (inclusive-vs-additive counting; no canonical run-out; three-way-cost-is-a-projection-not-a-second-model) are flagged there and in reconciliation-traceability.md.

## Known coverage gaps
- No literal "don't synthesize weekly reset from 5h" rule (only implied) → proposed P2.
- No canonical burn/run-out formula → proposed P1.
- Widget preset/focus/configure + reduced-motion toggle have no command IDs (prototype-only) → proposed P4/P5.
- Per-cell provenance is specified but not yet implemented in demo data → P7 (build task).
