# Runtime-artifact history — EA-S09-EXEC-RUNTIME-ARTIFACT-RETENTION

**Owner batch:** Runtime Artifacts, with Storage and Contracts. Exact scope: the 19 event families listed below.

**Question:** Should these 19 artifact event histories use indefinite retention when their full contracts are ready for admission?

**Why it came up:** The Runtime Artifacts owner recommends `RP-AUTHORITY-INDEFINITE` but explicitly says that this is not an assignment. Storage’s temporary preservation of unknown-policy records does not settle the choice. No current exact assignment was found. These event payloads contain meaningful text and operational metadata, as well as references.

**What you get:** With the recommended option, old artifact identity, changes, provenance and event history remain available for authorized inspection and replay. Retaining an event does not grant access to a linked artifact body or permission to repeat an action.

**What it costs:** Indefinite storage includes text embedded in the event, such as summaries, document titles, plan steps, failure descriptions or suggested actions. This creates a lasting content-retention commitment and growing storage/backup needs. Deleting a linked body does not automatically erase text copied into its event. The eventual contract must reconcile any applicable deletion requirement before admission; this choice cannot silently override those requirements. Size limits and resource bounds still need to be closed; no measured cost estimate is available.

**Options:** A — Assign the owner’s recommended indefinite policy to all 19 event histories, subject to existing access, redaction, holds and deletion requirements. B — Use the existing 365-day runtime policy for explicitly classified non-authority records, while keeping approval, receipt, audit and source-lineage authority indefinitely; the Storage owner must classify each affected event or payload branch before admission. C — Specify a different retention policy or payload-content boundary. B eventually limits replay and inspection of expired event records; it is not permission to expire protected authority records or apply 365 days indiscriminately.

**Recommendation:** A, matching the Runtime Artifacts owner’s proposal, with the embedded-text and deletion implications above made explicit in each full contract. This is a retention decision only. It does not register the families, define missing binding identifiers, authorize runtime, or make the current schemas complete. Artifact bodies, original receipts, restore points, Usage records and source records retain their own policies.

**Responses:** Approve / Deny / Deny with changes / Ask a question. Approve selects A; Deny with changes can select B or specify C.

**Status:** PENDING; queued for one-at-a-time presentation. No response has been supplied.

**Answer:** __________

## Exact affected families

| Event family | Representative retained payload content |
|---|---|
| `runtime_artifact.api_web_call` | Operation inputs, warnings, error text and redacted request/response references |
| `runtime_artifact.artifact_version` | Version identity and change summary |
| `runtime_artifact.before_after_snapshot` | Comparison references and change summary |
| `runtime_artifact.browser_recording` | Invocation/actions and recording references |
| `runtime_artifact.code_diff` | Changed paths, file metadata and change summary |
| `runtime_artifact.context_snapshot` | Context references, revision and capture metadata |
| `runtime_artifact.cost_usage` | Usage attribution, costs and authority references |
| `runtime_artifact.document` | Document title, type and references |
| `runtime_artifact.evidence` | Claims, verification metadata and source references |
| `runtime_artifact.failed_attempts` | Failure summary and attempt references |
| `runtime_artifact.hitl_approval` | Decision, scope, attribution and original receipt references |
| `runtime_artifact.implementation_plan` | Objective, plan steps and validation references |
| `runtime_artifact.reasoning_summary` | Summary, decision summary and evidence references |
| `runtime_artifact.restore_point` | Restore-point metadata and owner record references |
| `runtime_artifact.screenshot` | Capture metadata, alt text and image references |
| `runtime_artifact.subagent_lineage` | Parent/child lineage and outcome references |
| `runtime_artifact.suggested_next_steps` | Next steps and suggestion summaries |
| `runtime_artifact.tool_llm_trace` | Trace, raw-payload and settlement references |
| `runtime_artifact.validation_test` | Test commands, results and environment references |

Every schema also has common artifact metadata. This table does not claim the payloads are content-free or prove a historical writer’s exact shape. Per-family schema limits, redaction, deletion, retention assignment and replay behavior remain full-contract work.

Current evidence: `Plans/Runtime_Artifacts_Panel.md:2454–2456` explicitly leaves the policy recommended but unassigned; `Plans/storage-plan.md:1535` distinguishes registered policies from materially incomplete unknown-policy preservation. Existing policy definitions are in `Plans/storage_value_registry.json`; the artifact projection’s retention does not assign the EventRecord byte lifetime. Source hashes, exact search scope and all 19 schema inventories: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-09/runtime-artifact-retention-search.json`, SHA-256 `a507b180dd76b4c1e636ef9d93e2b43a7abb122103d9b1508b1e3450c842a936`.
