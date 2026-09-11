# Step 8 likely and contested owner decisions

Research only, based on current source at `4869b4cbaaa9e5452a1b16b68ce92b9f269df738`. No response has been supplied. These two cards reconcile real owner identity/migration conflicts. They do not ask again whether already-required settings or To-Do histories persist. Technical binding work remains with the owning documents. All existing 252 Step 9 rows remain unchanged; the 45 overlapping CPU rows and nine DL039 holdings in this lane retain their prior dispositions.

## Settings event name — LC-SETTINGS-IDENTITY

**Owner batch:** `Plans/Settings_System.md`, `Plans/UI_Command_Catalog.md`, `Plans/UI_Wiring_Rules.md`, `Plans/Wiring_Matrix.md`, `Plans/Contracts_V0.md`, `Plans/storage-plan.md`.

**Question:** Should the default DRY guard setting change use the common `settings.updated` event identity or the dedicated `settings.agent_rules.dry_method_default_guard.updated` identity under the current Settings transaction commands?

**Why this needs a decision:** Current UCC-104 / WM-040 name the dedicated event while the production wiring artifact names the generic event for the old per-setting command. Settings § transaction command contract and UI Wiring require exactly `cmd.settings.open`, `cmd.settings.transaction.preview`, `cmd.settings.transaction.apply`, `cmd.settings.transaction.rollback`, and `cmd.settings.export`. The retired per-setting dispatch cannot settle current naming. Setting-value durability is already required by SP-223.

**What you get:** One reconciled event identity, with every applicable owner and consumer naming that same identity and an explicit treatment of historical spellings.

**Cost:** A bounded cross-owner reconciliation and later schema/binding work; runtime and billing estimates are unavailable.

**Options:** (A) Use common `settings.updated` with setting-key and transaction identity in the eventual payload. (B) Retain the dedicated guard event and explicitly bind it to current transaction application. (C) Specify another reconciliation, including explicit historical compatibility treatment.

**Recommendation:** A, subject to a reviewed payload/binding patch that preserves the exact guard key and current transaction boundary. Neither spelling is admitted by this card, and it does not revive the old command or authorize losing persisted setting state.

**Affected exact rows:** `settings.updated`; `settings.agent_rules.dry_method_default_guard.updated`.

**Current evidence:** `Plans/UI_Command_Catalog.md:7624`, `Plans/Wiring_Matrix.md:3720`, `Plans/Wiring_Matrix.production.json:55477`, `Plans/Settings_System.md:785`, `Plans/UI_Wiring_Rules.md:895`. Source hashes and additional exact occurrences are in each JSONL row; adjacent controlling text is in the external selected-passages capture.

**Response:** Approve / Deny / Deny with changes / Ask a question. **Status: APPROVED AND APPLIED; EVENT CONTRACT WORK REMAINS.**

**Answer: Approve — Jared, 2026-09-11T16:19:32.266939Z.**

Exact response: `decision-responses.jsonl`, `LC-SETTINGS-IDENTITY-RESPONSE-001`. Approval selects common `settings.updated` with the exact setting key and current transaction identity. Payload/binding work remains required before registration.

## Chat plan and To-Do history — LC-CHAT-TODO-MIGRATION

**Owner batch:** `Plans/assistant-chat-design.md`, `Plans/ToDo_Runtime.md`, `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/Tools.md`.

**Question:** Should existing `chat.plan_todo_updated` history remain readable under its historical identity while future To-Do mutations move to explicitly mapped `todo.*` events after central admission, or should the chat event remain a distinct current producer contract?

**Why this needs a decision:** Contracts and Storage explicitly require durable per-item chat-plan change records; the newer To-Do owner defines seven required semantic names and central registration prerequisites but supplies no mapping from the chat event. Similar names do not establish an alias.

**What you get:** An explicit migration boundary that preserves historical meaning and identifies the future producer/consumer contract for each actual mutation.

**Cost:** A reviewed operation-by-operation mapping and compatibility-reader specification; central registration and payload schemas remain separate required work. Billing estimates are unavailable.

**Options:** (A) Preserve historical chat records and map future mutations individually to To-Do semantic events once admitted. (B) Keep chat-plan updates as a distinct current semantic contract and specify how its readers relate to To-Do history. (C) Specify a different explicit transition policy.

**Recommendation:** A, with no automatic alias to `todo.updated`, no historical deletion, no bulk status event, no revival of retired fields, and no relaxation of proposal-only behavior. Status changes retain per-item causal receipts and expected/committed revisions. The seven semantic names remain non-emitting until registered with closed schemas.

**Affected exact rows in this lane:** `chat.plan_todo_updated`; `todo.created`; `todo.updated`; `todo.status_changed`; `todo.dependency_changed`. The other three To-Do semantic names are context only and not added to this lane.

**Current evidence:** `Plans/Contracts_V0.md:1470`, `Plans/storage-plan.md:1773`, `Plans/ToDo_Runtime.md:605`, `Plans/ToDo_Runtime.md:607`, `Plans/Tools.md:2419`. Source hashes and adjacent controlling text are recorded with the rows.

**Response:** Approve / Deny / Deny with changes / Ask a question. **Status: APPROVED AND APPLIED; EVENT CONTRACT WORK REMAINS.**

**Answer: Approve — Jared, 2026-09-11T16:23:08.849454Z.**

Exact response: `decision-responses.jsonl`, `LC-CHAT-TODO-MIGRATION-RESPONSE-001`. Approval preserves historical chat records and selects an individual mapping for future mutations after admission. Contract work remains required.
