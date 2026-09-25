# Bounded Vault, route-health and update/size requirements

Existing owners now retain five physical Vault/endpoint-health clauses and six
update/content/release-size clauses. Storage/SRV require lazy bounded Vault
admission, summary-first aggregate reads, byte-accounted safe idle eviction and
per-Vault ordered queues under shared permits. RAS retains cached verified health
and hysteresis subordinate to identity, trust, security and currentness fences.
No numeric limit, new governor/supervisor, physical family or implementation was
invented; canonical state, active readers and held recovery evidence stay protected.

Release/Content retain exact application/content phase vocabularies independently
of command outcomes, no unnecessary content restart and no default simultaneous
update of every host. Release size policy includes download plus installed-size
CI checks, existing-owner shared content-addressed tool-component deduplication,
and explicit-need exceptions for production test/development/source-map payloads.
No newer platform/renderer/package choices, provider acquisition authority or
cross-Vault sharing policy are restored from the older packet.

Root and independent medium-Astra reviews checked the exact source clauses,
current owners and shared-main changes. All additions are narrow owner prose;
native performance, update and size-budget execution remain unbuilt. Independent
reviews under `/mnt/Cursor/PuppetMaster-Evidence/scratch/jji-five-operands-20260925-FRxF5fdn/`:

- `pr10-pr11-independent-review.md`, SHA-256 `82166c76736bc5bf8e1f17be6c1bfb215efd5cf803e60a7a789df184b1971c65`.
- `six-update-size-independent-review.md`, SHA-256 `ec3f336eb1e389189240777190dccbdeec77893e27ad67b1793da125dcbad46e`.

Source25 `/mnt/Cursor/PuppetMaster-Evidence/misc/packet-gap-closure-20260910/sources/legacy-custody/raw/PKT-05-pm-full-thread-performance-plans-pmconcept-implementation-packet-2026-08-08/PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/source_inputs/01_prior_full_thread_decision_register.md`,
SHA-256 `3df7ad729c5ea1be0df192d19845e42326b5047de03e9f59fbe4918943e0150d`, only sections 9, 16.3, 16.4 and 16.7.
Source08 `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/r5-server-baseline243-review-20260912-FvhUQQ9A/source-snapshots/08_UPDATES_BACKUP_RESTORE.md`,
SHA-256 `8a4e0ff692e096373192a1f781bd2c644c0a0c97c72ca4fd12b76c5208ed3eaf`, lines 33/35.

The six-clause proposed patch listed Release hunks out of source order; root
reordered only the hunks for application. Final Release/PSB hashes match the
independently reviewed candidates exactly. No governance bindings or main state
changed. Shared main's newer SP-266 Browser changes remain for preserved rebase,
not overwritten by this additive Storage patch. Landing remains held.
