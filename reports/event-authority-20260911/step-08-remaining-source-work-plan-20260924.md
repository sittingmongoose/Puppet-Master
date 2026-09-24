# Step 8: the remaining source work, scoped, 2026-09-24

This is a plan document only. It covers the two items of Step 8 that are still open after the 8(a) assessment, the 8(d) anchors and the first 8(c) branch:
- the second half of 8(c), which makes the Browser-created v2 checkpoint the current definition;
- 8(b), which compiles the reviewed external source packages into canon.

Nothing here edits canon or starts package work. Jared decides the 8(b) go on the coordinator's sizing. Part 1 needs the coordinator's go, and it can land only after the landing-check exports repair.

A third, small item turned up while scoping. It is ready on its own branch, `fix/ea-compaction-pm7-validator-20260924`. It clears the one stated reason for `context.compaction.completed`'s PARTIAL oracle cell: `scripts/pm-validate-pm7-gui-fixtures.py` still forbade the admitted family. The branch edits a script and its test only, so it can land without the exports repair. See its report, `step-08-compaction-pm7-validator-20260924.md`.

## Part 1. 8(c), second half: make the Browser-created v2 checkpoint the current definition

**Where it stands.** The first half is on `plans/ea-browser-pair-sp286-20260924` (`2df56dd8a9`, in blind review). It adopts SP-286/CV-339 by name for both Browser producers, which answers the producer gap of `browser.workspace.created` and `browser.workspace.reset`. Once it lands, reset has nothing left short of PASS. Created keeps two PARTIAL cells, consumers and oracles, for one reason: its v2 checkpoint successor, which adopts SP-278 with the nine-field DL-076 token, is still `conditional_not_admitted`, and canon keeps v1 as the current route (`Plans/Section15_MVP_Promoted_Features_Spec.md` 11519; `Plans/storage-plan.md` 19854-19855 and SP-266 acceptance criterion 6).

**What canon needs so that v2 is the specified current definition.** SP-266's conditional subsection states the conditions: a closed registered schema, explicit reader and admission revisions, and native migration, source, permission and crash proofs before activation (`storage-plan.md` 19990-19991). The native proofs stay NOT_RUN and do not lower a grade. One branch, the existing `plans/ea-browser-created-v2-current-20260924`, would change:

| Surface | Change |
|---|---|
| `Plans/storage_value_registry.json` | The `browser_workspace_created_index_checkpoint` row moves to the v2 writer, with the same family and key. Its value schema, `value_schema_id`, `schema_version` 2.0.0 and field lists come from `Plans/browser_workspace_created_checkpoint_v2.schema.json#/$defs/checkpoint`. The producer becomes `storage.browser_workspace_created_index.v2@2.0.0` and the consumer `browser.workspace_inventory.created.v2@2.0.0`. The migration text states the StorageMigrationCoordinator handoff SP-266 already defines, and an explicit retained v1 reader is used only to authenticate the handoff preimage, following the `restore_point_retention_summary` registered-read precedent. The family count stays 294, so the readiness census pin does not move. The file is Spec-Locked, so its hash goes stale until the reseal. |
| The v2 schema | `x-pm-definition-status`, and the binding's `definition_status`, move from `conditional_not_admitted` to the current `newly_authored_owner_contract`. Its read-only resolver views are unchanged. |
| `Plans/browser_event_admission.json` row 0 | `authority_contract_ref` points to the v2 schema's `x-pm-event-authority-binding`. The event family registry row does not change: `pm-browser-event-admission.py` requires only the admission row, semantic owner and payload schema refs in its `source_refs`. No PNC-019 checkpoint approval is needed. The row's extra reference to the v1 binding stays, as compatibility custody, until the next registry revision that needs approval anyway, as with the certified anchors in 8(d). |
| Section 15 and SMPFS-167 | The conditional subsection and acceptance criterion 5 say the v2 reader is the specified current route. Installation stays a native StorageMigrationCoordinator step. v1 is compatibility custody, authenticated only at handoff. |
| `storage-plan.md`: SP-266 and section 2.3.1 | The v2 subsection, SP-266's `canonical_text` and criterion 6 say the same. The SP-278 read-token rule in section 2.3.1 adds the created checkpoint to the stored checkpoint values it lists (four today). |
| Scripts and tests | `scripts/pm_browser_workspace_created.py`: `binding_failures` and `expected_storage_family` pin the v1 binding and registry row exactly, and move to v2 with a v1 handoff check. `scripts/pm_browser_workspace_created_v2.py`: its reported status. `scripts/pm-implementation-readiness.py`: the created checkpoint joins the self-test's `read_token_families`. `tests/test_pm_browser_workspace_created.py`: the conditional assertions invert, and the v1 tests become handoff and compatibility tests. |

**Checks.**
- The Browser created, reset and admission test modules.
- `pm-browser-event-admission.py`.
- `pm-implementation-readiness.py validate` and `self-test`.
- `pm-plan-index.py validate` and the shard check, with the currentness edition present.
- A regraded depth row for `browser.workspace.created`.

**Authority.** DL-046: Browser technical bindings and individual admission landings. The admission condition is SP-266's own. No product question is expected, and no event family registry row changes.

**Landing.** It edits `storage-plan.md`, whose plan-sharding evidence rows exceed the print cap, so it waits for the landing-check exports repair. Its reseal request covers:
- the Spec Lock entries of `storage_value_registry.json`, `storage-plan.md` and Section 15;
- their evidence bundle rows;
- the readiness report;
- the currentness edition.

**Estimate.** One branch: about 3 to 5 agent-hours, plus one blind review cycle of about an hour. Roughly 300,000 to 500,000 output tokens in all. The main risks:
- the retained-v1-reader representation in the registry, which may need a readiness rule and self-tests of its own;
- the size of the v1 validator and test rewrite.

**What it closes.** After both halves, both Browser families are complete in canon (12 of 12). Their DL-077 admission records then pass once they are re-pinned to a regraded depth assessment. That leaves `context.compaction.completed`'s oracle cell as the only post-August depth gap. That cell is blocked by the PM7 GUI validator, which sits under `Concepts/`, outside this agent's scope.
