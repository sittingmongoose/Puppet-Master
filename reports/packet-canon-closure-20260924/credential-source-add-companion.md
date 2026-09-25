# Credential source-add selected boundary

ACT087 is now materialized for exactly cmd.credential_source.add, after the existing
cmd.credential.add normalization. The new terminal-immediate profile binds the
actual connection/generations, protected submission and requested/effective scope
to CredentialBroker's actual secure receipt and source readback. Source registration
does not attach, activate, authenticate a provider or issue a lease. No async work,
no-op, secret bytes, crypto format, TTL or credential store is invented.

The owner prose explicitly introduces the narrow connection/scope/submission/source
values and CredentialSourceSecureInteractionReceipt. Existing ConnectionDraftRecord,
IntegrationCredential permission/error/authority and protected-input lifecycle
grammars are reused within their existing boundaries, without borrowing the
auth-profile submit-code issuer or fabricating a Project for app/Server scope.
Actual owners authenticate null-dimension applicability and scope attenuation.
Failed/cancelled results preserve known issued sources; uncertain consumption or
registration remains reconciliation-only and never resubmits a secret.

Authentic SIR original, distinct request/invocation/command-instance identities,
canonical digest, caller and final disclosure compose through the actual central
response helper. Native human/Client/permission/issuer/audience/one-use/zeroization,
source provenance and current access adapters remain mandatory and unproved.
Static fixtures are not a native credential handler or security proof.

Exactly catalog.credential_source_add and TOUCH-SGAPCMD-038 consume the successor.
The dedicated Touch profile leaves all previous profiles, nine peer credential
rows and every alias intact; all 643 Touch rows retain their disposition/residuals.
The explicit profile census is 139, with 65 aliases, 58 exclusions and 1,142
production rows unchanged. Handler_unavailable and empty event types remain.
The command catalog's exact row is updated; historical expansion schemas are not.

Four logical storage rows produce 78 dispositions: 33 physical-family pending,
one external-store pending, 40 nonpersisted and four existing-family rows. The
new transport and owner-read projections are nonpersisted; redacted secure receipt
and authentic original are physical-registration-pending. All previous 74 rows
and other registry contents, including all 294 physical families, are unchanged.
The storage owner explicitly preserves the pending retention/deletion/migration
boundary. No governance binding is refreshed.

Independent cycle 1 PASS:
`/mnt/Cursor/PM-Experiments/credential-source-add-owner-20260925-x934CF/INDEPENDENT-REVIEW.md`,
SHA-256 `bdb12f2b9d415844413d6b80dfd0d0fac9dd6381304f5b643417a4b7237fc28e`.
Frozen handoff in that directory has SHA-256
`df0ccb29dc460b7539fa04e7c51ff49890e26daa8b50c2917fbde27b968beb42`.
All four installed semantic files match its exact hashes. Root corrected only
detached metadata patch context braces to retain the existing JSON separators;
the semantic package and central hook were not altered.

Installed checks PASS: 24 credential tests, three new consumer/custody tests,
nine manifest tests, 12 shared-response tests, 60 Touch-source tests and three
prior JJ/Forge binding tests. Full contract gate PASS: 55 pairs / 51 unique schemas,
1,350 positive cases, 4,457 negative cases rejected, 12 internal self-tests and zero
findings. Capture:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/credential-source-integrated-gate-001/stdout`,
SHA-256 `c7303e61021c35552bc4abf0e778533c4ad8ae829e7c965dd4b5e2553a439e61`.
Shard generation/check PASS: 99 documents / 2,749 shards, limited to the five
edited configured roots commands_system/shared_integration_runtime/storage-plan/
storage_value_registry/ui_command_catalog. Index generation PASS: 6,734 PlanUnits
and 26,457 acceptance units; PlanUnit IDs unchanged. Whitespace checks PASS.

Full Touch check still reports exactly the previous Settings disposition-registry
hash drift, with zero added or removed failure keys. Capture:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/credential-source-touch-001/stdout`,
SHA-256 `f589d0aa5395f6099ff8276dc8deaa94d5c541c8ccda6405fa8ef93192a5ef62`.
No fresh main-vs-branch aggregate comparison is claimed; the landing hold remains.

Native source handling, actual protected-input proof, physical custody and the
other credential operations remain separate obligations. This is not whole-packet
closure or a claim that only GUI implementation remains. Protected newer designs
and Azure scope are unchanged.
