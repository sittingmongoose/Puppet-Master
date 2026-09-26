# App-update local settlement — integration checkpoint

Status: static companion integrated on repair branch; not native or GUI completion.

Scope is the three existing local actions `ui.update.app.open_details`,
`ui.update.app.open_logs`, and `ui.update.app.open_release_notes`. Existing
RSC-014 and Touch requirements already require currentness, truthful refusal,
and return to the initiating context. No additional owner prose, command,
event, storage family, policy, or governance refresh is included.

## Frozen author and independent review

Evidence directory:
`/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/case-reconciliation/app-update-local-refusal-01/review-freeze-v2/`.

- `companion.patch`: SHA-256 `2845d146ef677d023cf8fe1e5db58110d135ec322cef69b815cbe026b11fe03c`.
- `REPORT.md`: SHA-256 `5cab88f3137c7f3e92c6b31d0f59626e907d8604f64604d6da59b6fc19aca0d1`.
- `INDEPENDENT-REVIEW.md`: SHA-256 `d274612818dca2a9b111356efe41d050b1aca9967a4d92b12c89663d8e62c291`.
- `INPUT-MANIFEST.json`: SHA-256 `f5b1aaf46ac9ab59e5b50e44f345f3c01cb9a04442d1fc535eac46dca4ac99d5`.

The four additive author files match the frozen review hashes. Earlier held
editions are not integrated. The separately proposed owner sentence is not
adopted. Author Goal completion is not inferred from delivery or wrapper exit.

## Root integration delta and verification

Root additionally bound the actual Touch profile's dry contract and result
reference to the new settlement schema. Leaving the old success-only result
reference would have left the refusal companion unselected. Payload and
successful receipt authority remain with the existing release owner schema.
An additional regression reads the actual selected profile and checks all
positive outcomes and all three action identities, rejecting domain-command
substitution. Its file is `tests/test_pm_application_update_local_binding.py`,
SHA-256 `39a6e827930b6d6187f74efba8bff5a86304d6a27a43bd213ddd175c27e9c0e8`.

- Final focused suite: `python3 -m unittest tests.test_pm_application_update_local_binding tests.test_pm_application_update_local_result tests.test_pm_application_update_checks tests.test_pm_touch_closure_source` — 85 tests passed.
- Whole companion gate: `python3 scripts/pm-new-contracts-verify.py` — 81 pairs; 1,561 positives valid; 4,744 negatives rejected; 12 self-tests passed; no findings. This ran before the final two Touch reference changes and binding regression; schema, fixture, helper and gate inputs did not change afterward.
- Shard check passed: 99 documents, 2,766 shards. No Markdown owner or generated shard was edited.
- An initial test invocation named a nonexistent test module and failed to load it; the corrected final command above passed. This is not counted as a product failure or hidden as a successful invocation.

The three Touch rows remain partial. Mounted controllers, actual focus return,
native projection currentness, and runtime behavior are not proved. No main
landing, reseal, readiness admission, or overall packet closure is claimed.
