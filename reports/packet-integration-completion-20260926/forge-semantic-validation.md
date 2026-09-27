# Forge static semantic validation

The FGI-021 joins are implemented in `scripts/pm_forge_packet_semantics.py`.
`forge_packet_semantic_failures(definition_name, value)` supplies additional
roundtrip, capability-admission, and unsupported-fallback checks; combine its
results with `pm_packet_integration_semantics.forge_semantic_failures`.
`validate_forge_counterexamples(schema, fixtures, registry=offline_registry)`
checks every counterexample against a deep copy of its real positive base,
requires existing patch paths and a real change, validates both records against
the selected definition, rejects semantically invalid bases, and requires every
named violation to appear in the computed result. Additional genuine failures
are retained; an expected rule list never suppresses another failed join.

All original 22 counterexamples now trigger their named rules. Seven added cases
exercise the new source witnesses, for 29 structurally valid semantic negatives.
The digest case no longer relies on counterexample-local `cross_owner_evidence`.
Actual `artifact_evidence` embeds the existing SCS-016 normalized remote record
schema by canonical `$id` reference, with typed observed membership and digest.
Both terminal artifact identities must equal the request and those records.
Capability admissions retain the existing matrix profile and administration
surface plus dimension observation and permission record; declared states cannot
override those values. Duplicate matching admin areas fail closed.

The joins cover command/instance, operation/receipt, provider/service/account/repo,
repository and automation binding generations, capability/permission/grant refs,
run/artifact/digest, setting scope, verified create evidence, terminal outcomes,
completion/event/work identity, obvious secret-bearing strings, and the official
fallback action restriction. The separate-service automation relationship remains
independent of the repository's provider/account/host, as existing ownership
requires. No digest serialization algorithm was invented.

Validation: `python3 -m unittest discover -s tests -p test_pm_forge_packet_semantics.py -v`
passes 17 tests, including schema-valid coordinated wrong digests, source-instance
and repository substitution, terminal run substitution, create-target substitution,
source-permission denial, stale dimension observations, ambiguous administration
areas, broken patch paths, and bad positive bases. Raw output:
`/mnt/Cursor/PuppetMaster-Evidence/scratch/packet-integration-completion-20260926/forge-semantic-tests.txt`
SHA-256 `52a0901abac1ca0e8987a807e82f6eaf46a77f2891681c1e01da3712aad7ceb0`.

These checks prove consistency of static evidence. They do not prove native
execution, remote record authenticity, protected secret broker behavior, or
profile-approved official-origin allowlisting. The latter remains a dispatcher
check; opaque origin refs are never equated to API hosts. The secret scan is an
obvious-prefix tripwire, not a general secret detector. Parent integration owns
broad gates, generated shards/indexes, and landing.

Bounded review repair: source run/artifact repository identities now join the observed
`service_repository_id`; only `same_forge` relates it to the storage forge ID. A
valid different-service case and storage-ID substitution regression cover that
boundary. Delete resolves the create result target through
`verified_create_target`, reusing the existing RepositoryBinding schema. Foreign
create targets and coordinated foreign target/witness identities are rejected.
