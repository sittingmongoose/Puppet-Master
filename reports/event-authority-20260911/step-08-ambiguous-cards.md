# Step 8C ambiguous-token decisions

This packet audits all 153 exact ambiguous tokens against current Plans. It records 115 source-proven non-event uses, 23 persisted candidates, two exact aliases, and 13 unresolved items. Ten unresolved items retain the already answered DL-039 J40 hold; the three new questions below remain unanswered. No row is registered, given a depth pass, or applied to the Step 9 cohort by this packet.

The report `step-08-ambiguous.jsonl` contains an individual rationale, current source lines and file SHA-256, owner route, and remaining work for every token. Historical queue and cohort files locate candidates and preserve membership only. They do not supply current semantic proof.

DL-035, DL-036 and DL-039 were checked. These cards do not revisit compaction completion persistence, Goal schema authority, the approved checkpoint, the send-only 26, J40 holding, or J248 interim quarantine. Present the cards one at a time with the full packet available, as DL-036 requires.

## EA-S08C-ACCOUNT — One name for account-switch history

**Question:** Should current feature summaries use the existing `account_switch_event` record and stop requiring a separate `account.switched` event name?

**Why it came up:** The feature list still names `account.switched` in runtime history. Contracts and Multi-Account already define durable switch history through `account_switch_event`, and Run Graph retires the old claim that durable switch history is missing. No current passage explicitly makes the two exact names interchangeable.

**What you get:** One owner-backed record vocabulary for account-switch history, with current summaries corrected to match it. This proposal retires the separate exact event-name requirement in the summary; it does not invent a migration alias or a second history stream.

**What it costs:** A small owner-routed documentation correction and a check that consumers reference the existing switch record. Any actual historical byte normalization would require its own evidence.

**Owner route:** Multi-Account and Contracts for the record semantics; feature-list and Run Graph for summaries; Storage for any later persistence work.

**Options:** Approve; Deny; Deny with changes; Ask a question.

**Recommendation:** Approve the summary correction. Durable switch history already has an owner-backed record shape.

**Answer:** __________

Current evidence: `Plans/feature-list.md:108`, `Plans/Run_Graph_View.md:51`, `Plans/Contracts_V0.md:738`, `Plans/Multi-Account.md:515`. Exact file hashes are in row `EA-S08C-002`.

## EA-S08C-CONTINUE — Keep retry-suppression diagnostics transient

**Question:** Should `diag.synthetic_continue_loop_prevented` remain a transient diagnostic rather than become a separately persisted EventRecord family?

**Why it came up:** Prompt Pipeline requires a reason-bearing emission when automatic continuation is suppressed. It does not say that this exact diagnostic is a durable EventRecord or explicitly limit it to transient output. The retained exclusion is historical adjudication, not a current owner contract resolving that boundary.

**What you get:** An explicit owner rule that preserves the visible suppression reason and the existing failure/rotation behavior without requiring a new durable event stream for this diagnostic.

**What it costs:** This exact diagnostic would not have a separately replayable EventRecord history. Adding one later would require a full event contract, including retention and payload handling.

**Owner route:** Prompt Pipeline owns suppression semantics; Contracts and Storage would record the explicit persistence boundary.

**Options:** Approve; Deny; Deny with changes; Ask a question.

**Recommendation:** Approve transient diagnostic handling unless separately replaying these suppression reasons is a product requirement.

**Answer:** __________

Current evidence: `Plans/Prompt_Pipeline.md:357`; exact file hash is in row `EA-S08C-059`.

## EA-S08C-DOCTOR — Keep media-check results in the check output

**Question:** Should `doctor.evidence_media.checked` remain check output associated with its evidence artifacts rather than become a separately persisted EventRecord family?

**Why it came up:** Newtools requires PASS/FAIL plus actionable remediation after Doctor checks the evidence layout, artifacts and rendering. The exact source says to emit an event but does not establish a durable EventRecord binding or an explicit transient-only rule.

**What you get:** An explicit owner boundary preserving the check result and remediation through the existing evidence-check flow, without adding a separate durable event stream.

**What it costs:** No separately replayable EventRecord history for this exact check result. Existing artifact retention remains unchanged; this decision would not supply a new retention duration.

**Owner route:** Newtools owns Doctor evidence-check behavior; Contracts and Storage would record the explicit persistence boundary.

**Options:** Approve; Deny; Deny with changes; Ask a question.

**Recommendation:** Approve check-output handling unless event-level replay of these Doctor checks is needed.

**Answer:** __________

Current evidence: `Plans/newtools.md:694`; exact file hash is in row `EA-S08C-069`.

## Existing holds and remaining work

The ten exact J40 members reviewed here remain under DL-039's unresolved/no-admit disposition: `diag.compaction_immune_overflow`, `docker.auth.browser_login.device_code_issued`, `docker.auth.browser_login.polling`, `docker.auth.browser_login.timed_out`, `docker.auth.capability_validated`, `node.prerequisite_resolved`, `provider.request_queued`, `skill.invocation_timed_out`, `usage.cost_adjusted`, and `usage.cost_clamped`. Their row rationales review current emission, payload, and wake semantics individually; those semantics do not establish missing exact persistence authority. No repeated card is issued.

Eleven exact J248 members overlap this queue. Their current source uses are classified individually; interim quarantine remains, and full contract/disposition work belongs to Step 9. The remaining persisted candidates also require owner evidence and full Event Authority depth before registration.

`phase_selector.fallback` is a currentness finding: `Plans/chain-wizard-flexibility.md:1153` explicitly requires a seglog event despite its retained historical exclusion. This packet records it as a persisted candidate and does not mutate that historical exclusion or register the event.

`goal_events.jsonl` appears only as a preserved token under GRS-005's durable state/log contract. Its non-event classification describes that current source use; it does not authorize a JSONL storage substrate or derive a schema from its filename.

Cost: this report-only audit and the proposed owner edits create no runtime work. Actual billed tokens and monetary usage are unavailable from the session tools; no cost figure is inferred.
