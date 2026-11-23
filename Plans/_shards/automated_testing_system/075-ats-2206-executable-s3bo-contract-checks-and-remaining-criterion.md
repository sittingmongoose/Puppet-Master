# Shard 075: ATS-2206 - Executable s3bo contract checks and remaining criterion-12 boundaries

Source: `Plans/Automated_Testing_System.md`

Source lines: L15937-L16011

Source SHA256: `ac229568e806b8e382f56f37bf6580c4a624c5032985508037054ea80259a940`

---

## ATS-2206 - Executable s3bo contract checks and remaining criterion-12 boundaries

The PNC-019 s3bo checker is `scripts/pm-s3bo-check.py`; its complete inputs and independently labelled source mutations are constructed by `scripts/pm_s3bo_cases.py`, and `scripts/pm_s3bo_oracles.py` projects the actual operands into the generated `scripts/pm_s3bo_table_*.py` predicates. Run `matrix`, `batteries`, and `guards` with `--out <evidence-directory>`. A table contains at most eight predicates. The gated `scripts/pm_guard_isolation.py` proves those exact predicates by baseline, single-row cut, peer preservation and restoration. Projection and shared-helper semantics remain separately reviewable; a table proof does not certify code outside its scanned modules.

Coverage includes the complete registered payload and EventRecord schemas without deleting owner keywords; the complete CV-339 AppendReceipt schema; the SP-2202/SP-2203 closed application and corruption companions; SP-2209's platform read output; the existing platform, Boot, Hold and Integrity closed-value fixtures; SP-2200/SP-2201 identity recipes; the applied/corrupt/recovery-unavailable identity recipes; independently held pending, receipt and history copies; read token/snapshot/coverage joins; original request-digest replay; writer cutoff/drain/fence order; read-time access and deletion checks; source preservation; and the new post-restore and aftermath comparisons. Full-value commitments use the shared CV-339 helper, not SHA-256 of an alternate preimage.

Every owned integer slot reached by these fixture constructors uses CV-1100 `current_integer` or SP-1100 `storage_uint64`; physical event values use `storage_value_bytes` and producer projections use `producer_semantic_bytes`/`producer_semantic_digest`. The battery includes a valid 4,400-digit JSON integer, full uint64 values and the separate producer-JCS refusal. Source timestamps use CV-1101 `date_time` with `event_record`; Storage observed/persisted times and the new application/corruption custody times use `storage_utc_z`. AppendReceipt `acknowledged_at_utc` uses `event_record`, including offset/lowercase positives (E5-2). Timestamp spelling is never normalized. Anchored identifier comparisons include final-LF negatives.

Retained reads select the installed recipe only from the unique independently sealed receipt for that exact original. Missing, ambiguous, other-original and caller-selected recipes refuse. The verifier checks original bytes, original result, original receipt and original binding; it creates no receipt during a read. Each complete fixture carries a before-read store snapshot. The current writer and retained reader are separate paths. The fixtures model sealed custody; they do not authenticate a native Store or certify runtime producers.

Only the expected guard together with its exact refusal code counts as a killed input mutation. Unexpected acceptance, another guard, another code, an exception or multiple independent refusals cannot earn a kill. The guard tool's cuts are a separate code-mutation proof; credit exactly its reported flips, stays, restoration and proved/unproved rows.

**These are bounded executable checks, not complete criterion-12 closure for the fourteen families.** In particular, they do not supply ACD-465's missing original capture constructor; refreeze the expiry or seglog packages pinned before DL-076; supply SP-279's full-u64 semantic success adapter or `exact_event` corroboration; execute the SP-295..297 native source/effect/settlement negatives; or establish every SP-293 passive-read health path. The new producer/order checks are deterministic fixture comparisons, not original native custody authentication. Full-family positive/negative coverage and the shared corpus through every complete family boundary remain to be finished. No criterion-12 PASS follows merely from the bounded guard proof. SP-2211 applies E8-5 B and closes the S3B-Q1 redaction/custody gap; its deletion-after-resolution and hold examples are executable here. That custody answer alone does not close criterion 12. Native producer conformance remains NOT_RUN for all fourteen families.

```yaml
plan_unit_id: ATS-2206
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  PNC-019 s3bo provides bounded executable contract checks with at most eight real
  predicates per guard table, exact-refusal mutation accounting, shared number and
  date-time helpers, and sealed-original retained-read fixtures. The explicit
  remaining boundaries prevent complete criterion-12 closure claims.
gui_related: false
gui_classification_reason: Static event-authority contract oracles without presentation changes.
depends_on:
- ATS-2200
- ATS-2201
- ATS-2202
- ATS-2203
- ATS-2204
- ATS-2205
- SP-2211
- CV-1100
- CV-1101
- SP-1100
- SP-1101
unblocks: []
acceptance_criteria:
- Each executable refusal is a real named table predicate with an independently labelled source witness.
- Tables have at most eight rows and earn only the gated tool's reported proof credit.
- Only an exact expected guard and refusal code earns an input-mutation kill.
- Sealed-original receipt selection preserves the complete read-store snapshot.
- Reports retain every unclosed oracle boundary and apply E8-5 B to the custody cell without promoting partial oracle coverage to PASS.
validation_surfaces:
- scripts/pm-s3bo-check.py
- scripts/pm_s3bo_oracles.py
- scripts/pm_s3bo_cases.py
- reports/event-authority-20261114/depth-s3bo-registered-families.json
risk_class: false_event_oracle_closure
reasoning_tier: high
context_scope: event_authority_pnc019_s3bo
implementation_surfaces:
- scripts/pm-s3bo-check.py
- scripts/pm-s3bo-table-generate.py
- scripts/pm_s3bo_oracles.py
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Automated_Testing_System.md#ATS-2200
- Plans/Automated_Testing_System.md#ATS-2205
- Plans/storage-plan.md#SP-2200
- Plans/storage-plan.md#SP-2210
preserved_exact_tokens:
- acknowledged_at_utc
- event_record
- storage_uint64
- S3B-Q1
negative_constraints:
- Do not admit events, reseal governance or claim native execution.
- Do not claim complete criterion-12 closure from bounded comparisons or stand-in custody.
- Apply only the signed E8-5 B answer to S3B-Q1; do not invent a new retention clock or hold bypass.
```
