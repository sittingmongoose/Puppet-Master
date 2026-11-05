# Shard 057: ATS-257 — Executor family oracles: run.node_retry_scheduled, scheduler.pass

Source: `Plans/Automated_Testing_System.md`

Source lines: L7542-L7582

Source SHA256: `1eabe946edff772674f63695a5dfcaa2aa9f3cb4362afab2d974ecd394550097`

---

## ATS-257 — Executor family oracles: run.node_retry_scheduled, scheduler.pass

`run.node_retry_scheduled` independently requires its positive closed-payload/publication case and negatives for foreign Project, stale generation where applicable, absent admission, withdrawn writer, unresolved refs, denied/deleted disclosure, missing original receipt and illegal transition in Plans/executor_event_contract_fixtures.json. Run `python3 scripts/pm_executor_event_contracts.py`. The checker covers synthetic predicates and identity/replay conflicts; native SP-286 crash/flush recovery, actual immutable dependency commit, SP-278 CAS/snapshot/source translation, backup skew and deletion/withdrawal concurrency remain NOT_RUN and are mandatory before runtime claims. Predicate witnesses in fixtures are synthetic, not native evidence.

`scheduler.pass` independently requires its positive closed-payload/publication case and negatives for foreign Project, stale generation where applicable, absent admission, withdrawn writer, unresolved refs, denied/deleted disclosure, missing original receipt and illegal transition in Plans/executor_event_contract_fixtures.json. Run `python3 scripts/pm_executor_event_contracts.py`. The checker covers synthetic predicates and identity/replay conflicts; native SP-286 crash/flush recovery, actual immutable dependency commit, SP-278 CAS/snapshot/source translation, backup skew and deletion/withdrawal concurrency remain NOT_RUN and are mandatory before runtime claims. Predicate witnesses in fixtures are synthetic, not native evidence.

`run.node_retry_scheduled` pass-two acceptance independently adds the exact `executor.run_node_retry_scheduled.source_adapter.v1@1.0.0` read-join/lifecycle contract, all conditional omissions and every actual parent/scope/revision/snapshot/evidence mismatch to `Plans/executor_event_semantic_fixtures.json`. Run `python3 scripts/pm_executor_event_semantics.py`. Its own positive variants and negative predecessor/successor/post-CAS/publication cases cover EP-224's table; its own six traces cover original receipt crash recovery, duplicate/conflict, lost custody, writer cutoff and original reconciliation, reader withdrawal, source generation/token invalidation and rebuild. Native complete owner-record validation, actual read adapters, SeglogFrameV2/receipt codecs, transaction CAS, flush, backup, restore, deletion and withdrawal concurrency remain mandatory NOT_RUN obligations; static normalized records and the finite trace model grant no runtime authority.

`scheduler.pass` pass-two acceptance independently adds the exact `executor.scheduler_pass.source_adapter.v1@1.0.0` read-join/lifecycle contract, all conditional omissions and every actual parent/scope/revision/snapshot/evidence mismatch to `Plans/executor_event_semantic_fixtures.json`. Run `python3 scripts/pm_executor_event_semantics.py`. Its own positive variants and negative predecessor/successor/post-CAS/publication cases cover EP-225's table; its own six traces cover original receipt crash recovery, duplicate/conflict, lost custody, writer cutoff and original reconciliation, reader withdrawal, source generation/token invalidation and rebuild. Native complete owner-record validation, actual read adapters, SeglogFrameV2/receipt codecs, transaction CAS, flush, backup, restore, deletion and withdrawal concurrency remain mandatory NOT_RUN obligations; static normalized records and the finite trace model grant no runtime authority.

```yaml
plan_unit_id: ATS-257
unit_type: acceptance
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Each of run.node_retry_scheduled, scheduler.pass has its own paired
  positive and negative static oracle cases; native durability remains NOT_RUN.
gui_related: false
depends_on:
- EP-224
- EP-225
unblocks: []
acceptance_criteria:
- Static owner-contract cases pass without granting admission or native proof.
validation_surfaces:
- scripts/pm_executor_event_contracts.py
risk_class: false_runtime_proof
reasoning_tier: high
context_scope: event_authority_wave2_DX
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Executor_Protocol.md
preserved_exact_tokens:
- run.node_retry_scheduled
- scheduler.pass
```
