# Provider setup manifest companion

CBP-028 now retains the sixteen source metadata dimensions in a closed declarative
manifest and original consumer binding. Trusted procedures, exact manifest bytes,
route/account/Host/Environment and return context remain owner-resolved. The
companion introduces no public command, physical store, credential custody or
native execution authority. Its storage disposition describes nonpersisted views.

Source: `/mnt/Cursor/PuppetMaster-Evidence/misc/packet-gap-closure-20260910/sources/legacy-custody/raw/PKT-03-pm-settings-bakeoff-final-cumulative-2026-08-08/PM_Settings_Bakeoff_Final_Cumulative_2026-08-08/reference/PROVIDER_IDENTIFICATION_INSTALLATION_AUTH_UPDATE_HANDOFF.md`,
SHA-256 `ab29a3fbe7846ae9996ba22d8dbfa97d000cdc78b64a9db927834d4d649758ac`, sections 6.1–6.3.

Independent review found mutable-original substitution through dependent resolvers;
cycle two verified the correction, including late mutation of an earlier resolved
procedure. Fourteen targeted tests pass. Existing Server issuance (16 tests) and
central fixture enrollment (9 tests) also pass after integration.

The complete central gate passes 41 schema/fixture pairs, 1,284 positive cases,
4,385 rejected negative cases, twelve internal self-tests and the Doctor catalog.
Full output: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/provider-manifest-integrated-gate-001/stdout`,
SHA-256 `708073a12d5413e43b07f0debbf0d125ea087064ab490ea54f24b3b0f2d7c9bf`.
Cycle-two review: sibling `packet-wide-rebaseline/provider-setup-manifest-root-cycle2.md`,
SHA-256 `34578e3672984c4b8b0ace2d6342c57e920714b3e72734a20464a10b4daac5c1`.

Deterministic regeneration passes: 99 documents, 2,738 shards, 6,733 PlanUnits and
26,389 acceptance units. Only CLI_Bridged_Providers and storage_value_registry
shard roots change. Runtime certification remains incomplete. No governance
binding was refreshed; the separate full-delta landing hold remains in effect.
