# Usage core-selection command companion

2026-09-25; integration after `c5a861794274018aa57aa5d3b2bca5d4222b9811`.

The two existing Usage commands now bind closed core-selection request/result
definitions and compose the actual CommandOutcome and UICommandResponse owners.
The finite checker resolves original query/projection/caller context, actual
export bytes and rows, refresh route results, terminal outcome and response
replay. Genuine original admission, source/permission/delivery/disclosure and
native digest adapters remain mandatory; test adapters are explicitly synthetic.
Handler availability, command IDs and empty persisted-event lists are unchanged.
Route/open-only acknowledgements cannot substitute for successful refresh/export.

This is intentionally not full Usage closure. Additional Ledger filters and
execution-free quota-only rows remain typed-profile gaps. Unsupported originals
must refuse, never drop filters/rows or fabricate Project/Run/Attempt/model/event
identities. The optional provider execution handle can be null under newer
bridge authority. Unknown/zero and token/native-quota distinctions remain; known
microdollar/minor-unit costs require exact integer units and applicable currency,
and hidden/unknown costs cannot leak through per-bucket amounts.

One transient transport disposition classifies the two runtime envelopes. All
previous dispositions, 294 physical families and 27 retention policies remain
unchanged; no new accounting store, physical writer or event is admitted. Actual
original outcome and exported artifact custody/retention remain independently
owned and cannot be erased by disposing of a transport copy.

Verification: 24 focused tests and nine manifest
tests PASS. Registry JSON-schema validation PASS; parsed full comparison proves
only the appended disposition changed. Parsed Wiring comparison names only
catalog.usage_export and catalog.usage_refresh. The closed manifest has 46 pairs
and 42 distinct schemas; the existing UI response schema is an additional offline
dependency, not an extra fixture pair or permission for remote retrieval.

The first integrated full run correctly reported two expected negatives accepted:
the external fixtures used `expected_error` but omitted the central gate's
`semantic_rule` annotations for their structurally valid caller/export mutations.
Integration adds the exact two invariant annotations and a regression requiring
them; no schema or semantic oracle behavior changes. The external freeze hashes
above remain receipts of that earlier stage, not hashes of these two final files.

Final full gate PASS: 46 pairs, 1,305 positive cases, all 4,416 negative cases
rejected, 12 self-tests, zero findings. Shard generation/check PASS: 99 documents /
2,746 shards, with only Commands System, UI Command Catalog, Usage and the edited
storage registry roots changed. Plan index generation/validation PASS: 6,733
units / 26,429 acceptance units. Full-run evidence:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/usage-core-integrated-gate-002/stdout`,
SHA-256 `d04f21c51f0fb222444f3875283e7b3ee85e67ca6f84e13b7b89c81cfec66936`.

Evidence:

- Frozen stage manifest: `/mnt/Cursor/PM-Experiments/usage-core-companion-20260925/HANDOFF.md`, SHA-256 `67c1aa57b05939554c7de4d14ff36505ae50a45af4faa149f36b38cbd9565cf6`.
- Independent final review: `/mnt/Cursor/PM-Experiments/server-residual-review-20260925-OW9xkKzA/usage-core-independent-review.md`, SHA-256 `7717778eafa35a245153f5883db4043473d5e586ec7caed886be83233195262d`.
- Public/central integration patch: `/mnt/Cursor/PM-Experiments/usage-core-companion-20260925/integration-v2.patch`, SHA-256 `6fa1845d8de784214e8fb0755339f104fa28ea04378f53eb4f1b70329ce2dc45`.
- Exact integration scope proof: `/mnt/Cursor/PM-Experiments/usage-core-companion-20260925/integration-proof.json`, SHA-256 `98f10608b2cff0bc3dafa0140b6f48bbb99323002036f51044022292be35b145`.
- Transient transport row: `/mnt/Cursor/PM-Experiments/usage-core-companion-20260925/storage-transport-row.json`, SHA-256 `79c1224348a4c51cd7b8bc4fa287104189382dbb38f796c8a7bc4386f9247a49`.

No native provider execution/export delivery, GUI implementation, governance
reseal, readiness unlock or main landing is claimed. Older Assistant/BSD/Lens/
Help/Teacher/platform designs and Azure expansion remain protected.
