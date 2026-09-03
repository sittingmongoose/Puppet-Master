# Shard 026: Retained Packet Candidate Inventory (Non-Canonical And Non-Emitting)

Source: `Plans/Plugins_System.md`

Source lines: L4564-L4570

Source SHA256: `0b754bd9e29239becb917810f8b63479913ea56b425d53e00386acc65174f6da`

---

## Retained Packet Candidate Inventory (Non-Canonical And Non-Emitting)

The following PKT-04 names are retained so packet extraction cannot silently disappear during typed closure. This is an inventory only: every row has `canonical=false`, `registered=false`, `emits_eventrecord=false`, and `disposition=deferred_non_emitting_event_candidate`. The common reason is `event_authority_and_native_producer_contract_absent`. These names are not added to the event registry or any schema enum:

`agent_plugin.discovered`, `agent_plugin.validated`, `agent_plugin.installed`, `agent_plugin.updated`, `agent_plugin.enabled`, `agent_plugin.disabled`, `agent_plugin.removed`, `agent_plugin.component_loaded`, `agent_plugin.component_skipped`, `agent_plugin.component_failed`, `agent_plugin.rollback_completed`.

The typed lifecycle contract is stricter than retention alone. Install, update, enable, reload, remove, and rollback require non-null admitted package proof, at least one applicable conformance ref, an exact permission diff, and rollback evidence; update, reload, review changes, and rollback additionally require the fully typed update-diff identity. Enable admits only a PM-native or dual manifest. Reload additionally requires human confirmation and a separately referenced authority-change/revalidation decision. Remove requires an explicit owned-data disposition. When centrally registered and natively available, Scan, Validate, Review Changes, Open Details, and Open Logs are machine-declared no-effect results; Review Changes and the two open projections require bounded projections. In the current unregistered phase every exact command result is rejected with no state change. Every result settles one non-secret caller return context. These predicates remain static admission shapes, not package, handler, activation, rollback, or native proof.
