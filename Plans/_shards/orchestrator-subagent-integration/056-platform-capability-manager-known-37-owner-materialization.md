# Shard 056: Platform Capability Manager - Known-37 owner materialization

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L31633-L31641

Source SHA256: `35d1512263810cd671e3c64529e82dd4eaee8b11fcf78a5b0aace7fc6c7328f4`

---

## Platform Capability Manager - Known-37 owner materialization

Status: `STATICALLY_MATERIALIZED`; behavior remains `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION`.

The Platform Capability Manager owns `Plans/platform_capability_catalog.json` under closed schema `pm.platform_capability_catalog.v1@1.0.0`. Catalog identity is `pm.platform_capability_catalog`, first immutable revision is integer `1`, one revision is `active`, and entries are sorted by stable `capability_id`. Entry execution classes are `direct_provider | cli_bridged_provider | server_bridged_provider`; allowed evidence sources are ordered `live_runtime_discovery > provider_policy_snapshot > static_platform_baseline`. Only owner-cited entries may exist. Empty placeholder, fixture-derived, retired `platform_specs`, display-name, provider-label, or dynamic discovery identities are forbidden.

`platform.capability_evaluated` v2 uses `capability_ref` to the frozen catalog revision and closed `requested_state = required | preferred | not_requested`, `effective_state = available | degraded | unavailable | not_evaluated`. Missing evidence never means unavailable. Unknown IDs/tokens, aliases from new writers, same-source conflict, stale/unverified/secret-bearing evidence, illegal state/reason/source products, or scope conflict use `quarantine_without_checkpoint_advance`; no consumer snapshot is supplied.

The legal degradation reason/source pairs are `runtime_partial/live_runtime_discovery`, `provider_policy_limited/provider_policy_snapshot`, `static_baseline_only/static_platform_baseline`, `runtime_absent/live_runtime_discovery`, `provider_policy_denied/provider_policy_snapshot`, and `platform_unsupported/static_platform_baseline`. `available` and `not_evaluated` use `none`; `not_requested` requires `not_evaluated`, null selection fields, and empty evidence. Historical events resolve their immutable revision without recomputation. CAP-POS-001..010 and CAP-NEG-001..014 are normative owner acceptance cases and are not claimed executed here.
