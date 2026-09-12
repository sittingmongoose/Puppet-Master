# Shard 020: Platform package support carrier and current installation authority

Source: `Plans/Release_Supply_Chain.md`

Source lines: L1290-L1366

Source SHA256: `12a0786d3c9f3afa7b43b24796ffc62366c3a7e9548dffa599237635b281145c`

---

## Platform package support carrier and current installation authority

RSC-017 defines a new bounded adapter under DL-045 for the existing Platform evaluation and custody contract. `ApplicationUpdateService` and the actual install-source owner retain RSC-014 update, restart and rollback authority. Platform owns the five operation meanings in N2-157; Storage owns SP-290's complete retained obligations. This adapter supplies neither a new update engine nor a separate durable installation selector.

The exact logical resource is `pm.platform.package_support_map`, embedded in the actual admitted PM executable image serving these operations. Its closed schema is `Plans/platform_package_support_map.schema.json`, schema ID `pm.platform.package_support_map.schema.v1`, with format tag `pm.platform.package_support_map.v1`. The three required fields are `format_tag`, `bindings` and `roles`, with no extras. Every binding is an exact constant: decision schema `pm.storage_value.platform_capability_decision.v1`, decision version `1.0.0`, current event payload `https://puppetmaster.local/schemas/event_payloads/platform_capability_evaluated/2.0.0`, retained legacy payload `https://puppetmaster.local/schemas/event_payloads/platform_capability_evaluated/1.0.0`, and migration support `MIG-PLATFORM-CAPABILITY-EVALUATED-PAYLOAD-001@1.0.0`. All five roles are required and each is exactly `supported|unsupported`: `new_pending_capture`, `retained_pending_completion`, `retained_committed_retry`, `retained_decision_event_read`, and `backup_cleanup_custody`. Future identities or compatibility ranges require explicit owner revision. External proposal tags were never installed versions and receive no legacy writer or migration route.

Map bytes use ASCII UTF-8 JSON, sorted object keys, compact separators, no BOM, duplicate keys or insignificant whitespace, and exactly one final LF. SHA-256 covers those complete bytes including the LF. Decoding must validate the closed shape and exact re-encoding. A schema-valid alternate serialization refuses. The original verified whole executable/package hash and source/publisher/signature/provenance admission cover the embedded bytes. A downloaded map, sidecar, cache, path, version string, copied package object or self-declared digest cannot establish package provenance or current selection.

At attachment and cold open, the actual supported install-source mechanism resolves the currently selected admitted PM target. The independently authenticated running-image owner resolves the image actually serving requests. They must agree on installation scope, actual target and original admitted image/map bytes. Reacquire these actual facts after restart; an old receipt, latest discovered version or process flag is not current selection. Selected-target change while an older image runs fences dependent Platform operations until the original restart/update owner settles the mismatch. Unknown or ambiguous selection remains `recovery_required`; this adapter supplies no repair algorithm. A platform mechanism without authenticated current selection, running-image agreement, complete original participant enumeration and serialization is unavailable for this scope.

The private currentness lease retains actual install-source, selected-target, provenance and running-image owner handles, their original admission/currentness tokens, exact immutable executable/map bytes and digests, and actual Storage/reference/backup participant identities. Diagnostic JSON and equal-valued replacement handles cannot mint it. Tokens keep their original owner types; there is no global generation ordering or numeric coercion. Leases hold the original selection lock through each operation's actual publication or final disclosure. No decoder, copy, hash, resolver or callback follows the final pure comparison of held actual identities, bytes and required current facts.

Candidate installation and rollback require the actual RSC-014 verified artifact/provenance, safe quiescence, recovery boundary, migration preflight, exact install-source, restart journal, post-verification and compatible rollback prerequisites. Before accepting the candidate map, obtain complete SP-290 obligations from the actual owners. Independently retain all original compatibility inputs before invoking returning helpers: enrolled Store and append-owner identities and contents, registration/migration/permission/origin/quarantine/backup facts, active rows and origin seals, complete current source and original append controls still carrying event bodies, registered decision backup contents/seals, original reference owners and their authorization/snapshot/hold contents, and registered shared backup identities and complete artifact contents. Pin original selected/candidate admission, prerequisite and currentness records as well. A resolver's copied inventory or earlier count is not this original snapshot.

After preparation, validate candidate roles against those obligations and recheck current owner facts. Immediately before publishing the selected target, compare all actual compatibility contents with the independently held complete typed originals, as well as the exact candidate/selected package bytes, original admissions, prerequisite records, participant identities and selection token. This final predicate contains no returning resolver or candidate preparation. A lawful new pending admission, backup or reference publication after an earlier inventory observation invalidates the switch and remains preserved in its original owner. Real concurrent operations serialize through the same original selection lock; a reentrant attempt to switch during an operation refuses. The ordering must be enforced within independently callable original Vault capture/restore and reference mutation bodies, including direct and unbound original entry paths. A cooperative outer facade is insufficient. Their original authority and publication guards remain necessary; serialization alone grants no Platform or shared Storage authority. Independently authorized shared backup/restore may finish during a Platform/recovery fence without requiring a usable Platform map.

Crash before a settled target switch uses the actual old selection; crash after a settled switch reacquires the actual new selection and running image. Partial/ambiguous install, migration, restart or verification follows RSC-014's original durable update journal and recovery disposition and never becomes success. A compatible rollback traverses the same current prerequisites and complete retained-obligation check; it cannot select an old migration receipt or discard an obligation. There is no monotonic withdrawal latch or separate automatic reopening action.

The map's physical lifetime follows its executable package. Existing verified rollback generations keep their original owner policy. In-flight image/lease handles remain alive for their actual operations; this contract adds no historical package archive, storage family, independent map retention schedule or permission to remove a rollback target. If an actual adapter needs new durable custody beyond its existing installation/journal owner, that missing physical contract must be defined before admitting that adapter.

The validation record `reports/event-authority-20260911/step-08-platform-withdrawal-validation.md` distinguishes bounded fixture owner/lock checks from native execution. Actual executable production and extraction, publisher/signature admission, platform install-source discovery, complete roots/backups, real cold start, selection journaling/fsync, concurrency and physical restore remain NOT_RUN. No event, update command, production capability or governance/readiness clearance follows from the map schema.

### RSC-017 - Platform Embedded Support Map And Selection Lease

```yaml
plan_unit_id: RSC-017
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  The Platform package support carrier and current installation authority contract binds
  the exact embedded five-role map to original admitted selected and running PM executable
  owners. Actual selection mutation and original Platform, reference and backup operations
  serialize through the same owner lease. Complete original compatibility contents and
  package/prerequisite authority remain unchanged through the final pure target publication
  predicate; lawful intervening original effects survive a refused switch.
gui_related: false
gui_classification_reason: Defines internal package bytes, owner identity and publication ordering without visual presentation.
depends_on: [RSC-014, DL-045, DL-048]
unblocks: []
acceptance_criteria:
  - Exact closed map constants, five independent roles and canonical bytes including final LF are mandatory; proposal tags and version ranges refuse.
  - Original whole-image admission covers actual embedded bytes; selected and independently authenticated running image agree in the original installation scope.
  - Actual owner handles and currentness tokens survive through publication; copied values, old receipts, sidecars and version text do not establish current selection.
  - Complete actual Store, append, reference and registered backup contents are independently captured before resolvers and compared directly after all preparation before target assignment.
  - Last-return changes to actual obligations refuse the switch while preserving genuine pending admission, backup and reference effects.
  - Original independent Vault and reference mutation bodies enforce selection exclusion for instance and unbound entry paths without replacing their own authority checks.
  - Retained operations and required independent shared backup/restore remain governed by their original authorities during capture closure or Platform recovery fences.
  - Install/restart and rollback retain RSC-014 prerequisites, current complete compatibility, actual cold-open selection and ambiguous recovery disposition.
  - Map lifetime follows the actual package; no extra selector, package archive, storage family, migration edge or retention policy is created.
  - Static schema and fixture scheduling evidence do not claim native installation, complete root enumeration, durability, runtime or governance readiness.
validation_surfaces:
  - Plans/platform_package_support_map.schema.json
  - Plans/platform_package_support_map_contract_fixtures.json
  - reports/event-authority-20260911/step-08-platform-withdrawal-validation.md
  - reports/event-authority-20260911/step-08-platform-withdrawal-checks.json
risk_class: incompatible_installed_target_or_stale_original_custody_publication
reasoning_tier: high
context_scope: platform_package_support_and_original_selection_lease
implementation_surfaces: [Plans/Release_Supply_Chain.md, Plans/platform_package_support_map.schema.json, Plans/storage-plan.md, Plans/newtools.md]
node_compile_hint: {mode: platform_support_carrier_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Release_Supply_Chain.md#RSC-014
  - Plans/storage-plan.md#SP-290
  - Plans/newtools.md#N2-157
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-048
negative_constraints:
  - Do not substitute a map claim, copied package, sidecar, old receipt or process flag for actual installation/provenance authority.
  - Do not derive complete absence from open projects, caller inventories or an earlier count, or roll back lawful effects after a stale switch refusal.
  - Do not replace original shared issuer/restore authority, invent a durable selector or package archive, or claim native execution or governance closure.
owner_hints: [Plans/Release_Supply_Chain.md, Plans/storage-plan.md, Plans/newtools.md, Plans/Shared_Integration_Runtime.md]
```

ContractRef: ContractName:Plans/Release_Supply_Chain.md#RSC-017, ContractName:Plans/Release_Supply_Chain.md#RSC-014, ContractName:Plans/storage-plan.md#SP-290, ContractName:Plans/newtools.md#N2-157, ContractName:Plans/platform_package_support_map.schema.json

<a id="goal-created-reader-package-graph"></a>
