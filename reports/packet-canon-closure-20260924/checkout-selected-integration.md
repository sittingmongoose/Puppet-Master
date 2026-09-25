# DL-097 Checkout selected-contract integration audit

Integration base: `6977e40fe7d1febcd19bbe989d2ce673d5ba8115`. Current root `a6b2510e22480bdda2c2175bc17d84befd4643c4` adds only unrelated reports after that base; no `Plans/`, `scripts/` or `tests/` path changed between them. The uncommitted Checkout source/test state is byte-for-byte equal on all **25 paths** to the independently reviewed combined carry `checkout-root-6977.patch` (SHA-256 `55679745cbd7832bc76b78ba73c7de6ddb4dba75cb4c044af05740817cd3f43c`) under `/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/jobs/review-checkout-owner-closure-04/integration/`. The carry combines frozen prior Checkout patch `6695397a451004b4d4bddda1085399d11fe73fd14869a4a8d26a605c8c1320f1`, Muse owner prose `07548234f21d217bfab7e8f73b4528ea61b31a2f6f831677d45784bce604cfc0`, and companion `6c3788de2b3120e94108c8ea6b080a55d69400222ddb8567f2c36753ac06760a`. Independent reviews: prior `bfc527ad8f3f26b010c4baa0c304e99cb3a039154676729a37baee33c528d313`; owner/companion `91dfa10938fe0acb9121fc8b91532255620fa1c0a3f094d2cb4f4c8b0a304997` (SHA-256 of respective `REVIEW.md` files in that job). The frozen Muse `REPORT.md` hash is `3d00a95d5cc12925aad9f7952f060364f87444e0d13688106f709638b27b46eb`.

The registry is additive: `contract_family_dispositions` grows **158→163**, with all 158 prior JSON rows unchanged and five exact Checkout IDs appended (transport, Source Control preview, Forge observation, SIR dispatch, SIR error). `families` remains exactly **294** and unchanged; no physical family is enrolled. `touch_closure` retains 646 rows and adds the one Checkout profile, yielding 151. Generated `plan_units.jsonl` retains all **6,744** PlanUnit IDs, with none added or removed. Its only substantive field changes are two appended acceptance criteria in each of `SCS-003` and `FGI-010`; 289 `source_doc_sha256` and 46 `source_location` changes are derived from edited owner documents. The Source Control preview remains sole owner; Forge consumes its typed reference without gaining native authority. The previous SCM, Stash, Usage, Tour, and SCS-024 material remains present because each of the 25 source/test files matches the approved additive carry.

Verification: the combined isolated gate passed **78/78** contract pairs, **1,512/1,512** positives, **4,602/4,602** negatives, and **12/12** internal self-tests. In the root worktree, I reran the 10-module Forge/Checkout/Usage/provider/Touch selection: **215/215 PASS**; `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json`: **PASS**, 99 docs and 2,764 shards, zero failures. The root coordinator reports Plan-index lint **PASS** at 2026-09-25 19:51:18 UTC. The standalone Touch validator's sole disposition-hash drift was identical on the 6977 base and combined overlay; it is not a new Checkout finding. All checks here are static and do **not** prove native Checkout execution, current permission/target-lease validation immediately before effects, provider effects, or physical custody.

Exact source/test paths for selective staging (derived `Plans/.plan_index/**` and `Plans/_shards/**` are separate generated companions):

```text
Plans/Commands_System.md
Plans/Forge_Integrations.md
Plans/Source_Control_System.md
Plans/UI_Command_Catalog.md
Plans/Wiring_Matrix.production.json
Plans/forge_review_checkout_selected_contract_fixtures.json
Plans/forge_review_checkout_selected_contracts.schema.json
Plans/source_control_contract_fixtures.json
Plans/source_control_contracts.schema.json
Plans/storage_value_registry.json
Plans/touch_closure.json
scripts/pm-new-contracts-verify.py
scripts/pm-touch-closure-verify.py
scripts/pm_forge_review_checkout_selected_semantics.py
scripts/pm_ui_command_response.py
tests/test_pm_forge_list_query_bindings.py
tests/test_pm_forge_provider_fixture_gate.py
tests/test_pm_forge_retry_bindings.py
tests/test_pm_forge_review_checkout_selected.py
tests/test_pm_forge_review_create_bindings.py
tests/test_pm_forge_run_bindings.py
tests/test_pm_git_remote_touch_bindings.py
tests/test_pm_jj_forge_selected_bindings.py
tests/test_pm_touch_closure_source.py
tests/test_pm_usage_ledger_query.py
```
