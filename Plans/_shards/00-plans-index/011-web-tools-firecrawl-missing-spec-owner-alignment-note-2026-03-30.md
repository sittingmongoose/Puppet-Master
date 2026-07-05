# Shard 011: Web Tools + Firecrawl + Missing-Spec Owner Alignment Note (2026-03-30)

Source: `Plans/00-plans-index.md`

Source lines: L616-L680

Source SHA256: `e14ed6e16272016a06e3f08b627dd82e1c8c95c0fef71256677452e244224d62`

---

## Web Tools + Firecrawl + Missing-Spec Owner Alignment Note (2026-03-30)

The reconciled owner and consumer set for web tools, Firecrawl, questions, planning/TODO, permissions, runtime identity, and MCP now spans:
- `Plans/Tools.md`
- `Plans/assistant-chat-design.md`
- `Plans/FinalGUISpec.md`
- `Plans/Permissions_System.md`
- `Plans/storage-plan.md`
- `Plans/Commands_System.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/Skills_System.md`
- `Plans/Contracts_V0.md`
- `Plans/Run_Modes.md`
- `Plans/Section15_MVP_Promoted_Features_Spec.md`
- `Plans/MCP_Integration.md`
- `Plans/LSPSupport.md`
- `Plans/CLI_Bridged_Providers.md`
- `Plans/Provider_OpenCode.md`
- `Plans/newfeatures.md`

ContractRef: ContractName:Plans/MCP_Integration.md, ContractName:Plans/Tools.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md

Consumer summaries in orchestration, interview, provider, account, and index surfaces defer to those repaired owner sections instead of keeping competing canon. Verify-only docs were checked during reconciliation and are intentionally out of packet scope because no edits were required.

Anchor-level regeneration for this packet must keep the live owner references discoverable and exact enough for repacketization:
- `Plans/assistant-chat-design.md#4.1`, `#8.6`, `#13.1`, `#13.2`, `#13.3`, and `#28.2`
- `Plans/storage-plan.md#4.1`, `#4.3`, and `#4.4`, plus the inline-visualizer persistence section after `#4.4`
- `Plans/Tools.md#3.6`, `#10.3`, `#10.7`, `## 11`, `## 12`, `## 13`, and the new non-Firecrawl provider-detail landing between `## 11` and `## 12`
- `Plans/Permissions_System.md#6`, `#10.4`, and the acceptance-criteria residue term `reject`
- `Plans/Commands_System.md#7` and `#2.4`
- `Plans/Skills_System.md#4` and `#6`
- `Plans/Section15_MVP_Promoted_Features_Spec.md#1.3A`
- `Plans/MCP_Integration.md` new owner sections after `## 4`
- the `Plans/FinalGUISpec.md` audit surface after `### 7.19 Agent Activity` and deeper replacements in `## 15`

The drift-risk heading labels remain exact for validation and regeneration: `### 4.1`, `### 8.1`, `### 8.6`, `### 4.3`, `### 4.4`, `### 3.6`, `### 10.3`, `### 10.7`, `## 11`, `## 12`, `## 13`, `## 6`, and `### 10.4`.

Obligation routing remains explicit:
- `Plans/Tools.md` owns `obl-013`, `obl-014`, `obl-053`, `obl-054`, `obl-066`, and `obl-067`.
- `Plans/Contracts_V0.md` owns `obl-044`, `obl-055`, and `obl-056`.
- `Plans/storage-plan.md` owns `obl-040`, `obl-059`, and `obl-060`.
- `Plans/assistant-chat-design.md` owns or mirrors `obl-036`, `obl-037`, `obl-042`, and `obl-048`.
- `Plans/FinalGUISpec.md` owns or mirrors `obl-035` and `obl-045`.
- `Plans/Commands_System.md` owns `obl-046`.
- `Plans/UI_Command_Catalog.md` owns `obl-047` and `obl-051`.
- `Plans/Permissions_System.md` owns `obl-062`.
- `Plans/LSPSupport.md` owns `obl-064`.

Ownership/index descriptions are drift-sensitive: when a packet changes command/skills/LSP/chat/tool responsibilities, this index text must be updated in the same reconciliation tranche so the owner map does not silently lag the repaired command, skills, LSP, chat, or tool contracts.

`Plans/newfeatures.md` is a summary rollup consumer for repaired web/question/MCP/LSP surfaces; the `/newfeatures.md` map carries the `/question/MCP/LSP` traceability cue and the file-end reconciliation note, while normative behavior remains in the owner docs above.

Slash-command cleanup is locked: `XV2` and `XV-FIX` are AUTHORITATIVE for the reserved-command family, `/clear` is LOCKED and REMOVED from the reserved set, and `assistant-chat-design.md` plus `Commands_System.md` own that locked-removed decision. Native PM structured reading uses `/detail-level` with `minimal`, `summary`, and `full`; it is not MCP-based.

Web-provider drift checks must preserve `/effective-state`, cache-persistence, under-specification, `Rerun in Terminal`, `/TODO/Plan/Deep`, `Plans/Provider_OpenCode.md`, and `Plans/CLI_Bridged_Providers.md` in the cross-doc map so provider, terminal, question/TODO, and command surfaces do not silently diverge from the repaired owner sections.

Firecrawl and missing-spec index drift guard: `Plans/Tools.md` remains the owner for Firecrawl/web tool behavior, no-silent-fallback contracts, and repaired web tools; `Plans/CLI_Bridged_Providers.md` is a Firecrawl provider consumer summary, not competing owner canon; `Plans/assistant-chat-design.md` mirrors web activity/provenance and chat/widget behavior without stale fallback wording; `Plans/Permissions_System.md`, `Plans/storage-plan.md`, and `Plans/Commands_System.md` carry permission, cache, and command consumers. Runtime identity references route through `Plans/Multi-Account.md`; any legacy account-doc mention is a retired shorthand, not a live owner. `plan-mode` `auto-deny`, `question`/`TODO`, `/TODO`, `/widget`, question/TODO contracts, and MCP availability must stay pointed at the repaired owner docs rather than summary-only index prose.

Firecrawl/missing-spec packet-conflict reset (2026-04-06): the section titled `RECONCILIATION / COVERAGE PASS — PACKET-CONFLICT RESET (2026-04-06)` supersedes the older three-bucket, 12-doc, 13-doc, 23-blocker, and coverage-consuming registers for this work-item scope. The scope is the full Firecrawl gap analysis plus missing-spec owner-alignment surface, not only the earlier Firecrawl owner-doc repair: web/provider canon, `/feature` and Settings/chat carry-through, commands and slash families, terminal/inline operation cards, planning/TODO and question contracts, visualizer/Mermaid, skills/Agent Config, subagent/task, LSP, MCP auth/effective-state, runtime identity payloads, permissions, and logging/audit. The reset consumes `54 active` obligations from `canonical_obligations.json` and `7` active coverage blockers into `MUST CHANGE` owner docs (`Plans/Tools.md`, `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/assistant-chat-design.md`, `Plans/FinalGUISpec.md`, `Plans/Commands_System.md`, `Plans/UI_Command_Catalog.md`, `Plans/Skills_System.md`, `Plans/Permissions_System.md`, `Plans/LSPSupport.md`, and `Plans/MCP_Integration.md`) plus `MUST RECONCILE` consumers (`Plans/Models_System.md` and `Plans/newtools.md`); `already_resolved` / `verify_only` obligations `obl-023` through `obl-032`, `obl-058`, `obl-060`, and `obl-067` may stay verify-only only when covered by stronger buckets plus `MUST VERIFY`. Recovery-plan targeting stays exact enough that `Plans/Skills_System.md` remains the `/skill` owner and `Plans/Section15_MVP_Promoted_Features_Spec.md` remains the WebAction/browser consumer. Packet operations must be re-packetized as `replace_section` where stale canon or `packet-appended` section families would survive, especially in `Plans/Tools.md`, `Plans/FinalGUISpec.md`, `Plans/Commands_System.md`, `Plans/newtools.md`, and `Plans/storage-plan.md`; weaker `append`, `insert_after`, or `verify_only` hints and weak obligation hints must not weaken owner-correction operations or active blocker repair for `obl-060`, `obl-067`, `obl-044`, `obl-055`, or `obl-056`. `research_packet.json`, packet-shape reports, verifier outputs, shards, and evidence exports are process artifacts to regenerate or revalidate after canonical docs change; they are not live packet doc intents.

Legacy Firecrawl/missing-spec coverage labels remain live only as reset traceability for owner/consumer routing, not as separate GitHub Integration canon or packet-shape artifacts: `FIDELITY-LF-007` maps to `MUST CHANGE` in `Plans/Permissions_System.md` and `Plans/Tools.md`; `FIDELITY-LF-008` maps to `MUST CHANGE` in `Plans/Permissions_System.md` plus `Plans/Tools.md` and `Plans/Run_Modes.md` carry-through; `FIDELITY-LF-009` maps to `MUST CHANGE` in `Plans/Tools.md` and `MUST RECONCILE` in `Plans/CLI_Bridged_Providers.md`, `Plans/Models_System.md`, and `Plans/newtools.md`; `FIDELITY-LF-011` maps to `MUST CHANGE` in `Plans/Tools.md`; `FIDELITY-LF-012` maps to `MUST CHANGE` in `Plans/Contracts_V0.md` and `Plans/Tools.md`; `FIDELITY-LF-015` maps to `MUST CHANGE` in `Plans/Tools.md` and `MUST RECONCILE` in `Plans/orchestrator-subagent-integration.md`; `FIDELITY-LF-017` maps to `MUST CHANGE` in `Plans/storage-plan.md` and `Plans/Contracts_V0.md` and `MUST RECONCILE` in `Plans/Multi-Account.md` and `Plans/Personas.md`. Older packet-count summaries `13`, `10 MUST CHANGE`, `3 MUST RECONCILE`, `12`, `9 MUST CHANGE`, `2 MUST VERIFY`, `1 MUST VERIFY-only packet extra`, and `11 / 11` are retired by the reset; earlier `canonical_obligations` / `canonical_obligations.json` summaries such as `32`, `doc-local`, `verify_only`, and `already_resolved` are retained only as audit vocabulary when covered by the stronger current buckets. Packet validation is `path-level` and anchor-exact through `GATE-014`, but a `/operation` defect is packet content/operation verification work, not evidence that `Plans/GitHub_Integration.md` or another missing impacted-doc path must be added.

Additional Firecrawl/lost-spec fidelity routing is traceability-only under the same reset: `FIDELITY-01` and `FIDELITY-02` map to `MUST CHANGE` in `Plans/Tools.md`; `FIDELITY-03` maps to `MUST CHANGE` in `Plans/Tools.md`; `FIDELITY-04` maps to `MUST CHANGE` in `Plans/storage-plan.md`; `FIDELITY-05` maps to `MUST CHANGE` in `Plans/MCP_Integration.md`; `FIDELITY-06` maps to `MUST CHANGE` in `Plans/LSPSupport.md`; `FIDELITY-07` maps to `MUST CHANGE` in `Plans/UI_Command_Catalog.md`; `FIDELITY-LF-003` maps to `MUST CHANGE` in `Plans/assistant-chat-design.md`; `FIDELITY-LF-004` maps to `MUST CHANGE` in `Plans/assistant-chat-design.md` and `Plans/FinalGUISpec.md`; `FIDELITY-LF-006` maps to `MUST CHANGE` in `Plans/assistant-chat-design.md`, `Plans/storage-plan.md`, and `Plans/FinalGUISpec.md`; `FIDELITY-LF-010` maps to `MUST CHANGE` in `Plans/Section15_MVP_Promoted_Features_Spec.md`; `FIDELITY-LF-013` maps to `MUST CHANGE` in `Plans/Commands_System.md` and `Plans/assistant-chat-design.md` and `MUST RECONCILE` in `Plans/UI_Command_Catalog.md`; `FIDELITY-LF-014` maps to `MUST CHANGE` in `Plans/Skills_System.md` and `Plans/Tools.md` and `MUST RECONCILE` in `Plans/FinalGUISpec.md`; `FIDELITY-LF-018` maps to `MUST CHANGE` in `Plans/FinalGUISpec.md` and `MUST RECONCILE` in `Plans/assistant-chat-design.md` and `Plans/storage-plan.md`; `FIDELITY-LF-019` maps to `MUST CHANGE` in `Plans/Run_Modes.md`. These mappings do not promote `Plans/GitHub_Integration.md` from adjacent consumer to owner for web, chat, storage, command, skill, MCP, LSP, browser, or run-mode recovery canon.

Index-only fidelity guard: `webmap` remains a minimal `url: string` input that returns `site map + source refs`, with the operation contract owned by `Plans/Tools.md` / command docs. Chat-thread docs are authoritative only from the chat-perspective for UX presentation, while GUI/runtime/system docs are authoritative from the system-perspective for contracts; when they disagree, system-perspective canon wins for contracts and chat-perspective canon wins for UX. The uppercase source term `PERSPECTIVE` is retired as audit vocabulary rather than a live UI label.
