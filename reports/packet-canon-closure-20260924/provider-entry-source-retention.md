# Provider entry source retention

Repair base: `2a381171408ae32a5dba76d1790187b65ef60e9c`.

`Plans/CLI_Bridged_Providers.md` / CBP-028 now preserve the September 3 external-runtime mappings (`claude`, `agy`, `grok`, `muse`, and conditionally selected external `opencode`) and the complete no-provider-CLI-Install classifications. Qwen/Alibaba Token Plan is retained without silently aliasing Coding Plan. `Plans/Multi-Account.md` / MA-012 preserve the four subscription/API account-product-auth-billing distinctions and separate OpenCode Go, Zen and external runtime. Shared credentials require provider-owned evidence.

These are source-required product classifications, not assertions of current vendor support. Exact acquisition/auth/probe evidence is still required before enabling any route. No provider identifiers, endpoints, credentials, manifests, command contracts, handlers, installation facts or readiness are invented.

Raw source (fully read by root and independent reviewer):
`/mnt/Cursor/PuppetMaster-Evidence/misc/packet-gap-closure-20260910/sources/onboarding-tour-20260903/custody/raw/PKT-01-pm-onboarding-tour-newbie-first-addendum-packet-2026-09-03/PM_Onboarding_Tour_Newbie_First_Addendum_2026-09-03/03_SIMPLE_PROVIDER_SETUP_AFTER_PROJECT.md`, SHA-256 `df7242baa034c064dff435bffcfa387bc35effbc142be968a1c87a496cf1a1ac`; adopted clauses at lines 40–78.

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/`.

- `provider-route-source-verification.json`, SHA-256 `6269040a58636cfa773bc845c1b079eb39c31382250bf7043dd73d8e3115e444`: only the two owners and their derived paths changed; all 6,719 PlanUnit identities retained, with semantic metadata changes limited to CBP-028 and MA-012. Five acceptance criteria added (26,238 total). Index validation, 99-document / 2,721-shard check and whitespace check pass. Readiness remains `blocked_runtime_certification_incomplete`.
- `server_forge_backup/provider-entry-prose-independent-review.json`, SHA-256 `cdb4983f48c847a92fb4c915dcaf203ed32b5386b8b1d3e8a55e08f8fbf06f11`: independent full source and two-owner delta review, no findings. This is a prose-first review, not a native provider test.

This closes only these source-to-owner omissions. Provider manifest/schema/fixture companion reconciliation, live integrations, GUI implementation, whole-packet closure, aggregate governance checks and main landing are not proved by these checks. No governance binding or baseline was refreshed.
