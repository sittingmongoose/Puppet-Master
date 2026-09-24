# SCM checkout alias contract-pointer repair

Base: `68af8b8d5bad5a9259448148198d92828f758eaa`.

SCS-008 explicitly normalizes five compatibility spellings before policy and dispatch to four existing targets. SCS-003 and the central command rows use the full `source_control_command_request` / `source_control_command_result` pair. `source_control_command_lineage` is only their nested identity/context record, not a request or terminal receipt/result.

Only `TCP-SCM-CHECKOUT-ALIAS.payload_schema_ref`, `result_schema_ref`, and `receipt_refs` change: request points to the full request; result and receipt point to the full result containing `operation_receipt_ref`. The exact guard and focused tests reject restoration of each stale lineage pointer. A structural comparison against the base proves all other registry content unchanged.

Preserved mappings:

| Compatibility alias | Canonical target |
|---|---|
| `cmd.project.checkout.add_worktree` | `cmd.source_control.workspace.create` |
| `cmd.project.checkout.connect_existing` | `cmd.source_control.repository.bind` |
| `cmd.project.checkout.create` | `cmd.source_control.workspace.create` |
| `cmd.project.checkout.remove` | `cmd.source_control.workspace.remove` |
| `cmd.project.checkout.verify` | `cmd.source_control.status.refresh` |

The five aliases have four distinct targets; `workspace.switch` is not one of them. The test validates full request/result records for each of these four targets, rejects bare lineage as either contract, and verifies the unchanged sole-handler, pre-permission normalization and no-independent-authority bindings.

Verification:

- Corrected pointer test on unchanged base: expected failure, all three stale fields rejected (1 test, 3 failed subtests).
- `python3 -m unittest discover -s tests -p test_pm_touch_closure_source.py -k ScmCheckoutAliasContractTests -v`: 5 passed.
- `python3 -m unittest discover -s tests -p test_pm_touch_closure_source.py -v`: 56 passed.
- `python3 scripts/pm-touch-closure-verify.py`: passed, 643 rows / 133 profiles / 643 open residuals.
- `python3 scripts/pm-new-contracts-verify.py`: passed, 31 pairs, 1,067 positive and 3,493 negative cases, no failures or findings.
- `git diff --check`: passed.

Frozen audit proof: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/browser_scm_performance/touch_closure/scm-aliases-batch-10.json`, SHA-256 `425608d2895855bd294ac05f9d32a036d444254611726dd553848d0b2c2d012e`.

No schema, owner prose, fixture, alias mapping, wiring, handler, event, binding, readiness, governance, or runtime state changes. Static validation is not native normalization/dispatch, GUI, provider, durability, security, or runtime proof. No governance binding is refreshed; any resulting hash staleness remains for the designated governance owner.
