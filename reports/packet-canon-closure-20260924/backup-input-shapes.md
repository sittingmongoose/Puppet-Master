# Backup explicit input shapes — bounded companion step

Base: `925d2cbe20d6668ae2fb4f44fa5f04dfe7025b64`.
Follows the owner-first repair in `backup-four-operands-owner-repair.md`.
ACT-089/101/102/110 remain open; this step does not finish current dispatch or
request/result/owner bindings.

Seven additive schema definitions represent the four accepted inputs:

- Destination update: exact Server/destination/generation plus a nonempty
  nonsecret configuration patch. Five fields reuse their existing owner types;
  identity, backend family/adapter, repository assignment, health, capabilities
  and generation are not patch fields. Reference resolution remains mandatory.
- Verify: repository/destination, explicit nonempty unique snapshot selection,
  requested structural/sampled/full-data scope and nullable cost approval.
- Test restore: immutable snapshot, explicit isolated destination reference and
  typed family/path coverage. All-path selection is explicit; selected-path
  mode requires paths. This proves neither actual isolation nor mandatory native
  rebuild/original-custody closure.
- Compare: immutable snapshot/path and explicit target/revision, retaining the
  existing Server, Client, Host, Environment and FileSafe context. Revision is
  opaque to Backup; the actual File/SCM owner still resolves it.

The `backup_action_request_v2` discriminator is additive. All 66 old definitions
and all 94 positive / 66 negative existing fixtures are unchanged. The central
command bindings, old 41-command envelope, sole handlers, permission ownership,
event disposition and `handler_unavailable` status are not changed. Historical
decoding remains possible; no claim is made that the old envelope is now a safe
current admission path. The new shape is not yet enrolled as that path.

Independent review caught that an initial compare shape prohibited the existing
topology/FileSafe context. All five fields were restored via existing property
references, and five removal tests were added. Final independent verdict passes
this additive shape scope only.

Verification:

- 9 added positive fixtures and 59 negative fixtures pass the real contract-gate
  validator. Missing operands, cross-command inputs, protected patch fields,
  empty/duplicate selections, ambiguous coverage and missing comparison context
  are rejected structurally, without a semantic bypass.
- All 9 new positive records fail against the baseline root schema and pass
  against the new root schema. Full definition/fixture comparison confirms no
  previous record or definition changed; this is not a sampled comparison.
- 22 Backup/Forge acceptance and input/prose regression tests pass.
- Full final contract gate passes: 32 contract pairs, 1,216 valid positive cases,
  4,250 rejected negative cases and no findings. This is the schema/fixture gate,
  not the repository-wide landing aggregate or an exception-delta proof.

Remaining specification work: current admission must separate the four new
requests from historical reads while preserving the other 37 commands; results
must bind the original request and actual owner-produced outputs; repository,
manifest/snapshot membership, target revision, current permissions, isolation,
cost and authentic verification/drill receipts need their real owner joins.
Matching reference strings or caller-provided facts are not substitutes. These
are not all safely relabelled as GUI-only or implementation-only obligations.

No owner Markdown, generated index/shards, governance bindings or readiness
artifacts changed in this step. No main landing or scoped landing exception is
claimed. Frozen newer assistant-chat/BSD/Context Lens/Help/Teacher work and Azure
expansion remain untouched. The PM skill's owner-first separation and completion
boundary govern this limited companion step.

Evidence directory:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/packet-wide-rebaseline/server-backup/`.

| File | SHA-256 |
| --- | --- |
| `backup-input-shapes-scope-009.json` | `f44f9cbaa04b1d472b09abcf87906b19d330241208e8fff1dad3501fc6471202` |
| `backup-input-shapes-independent-010.md` | `cc4a7536568919ed24cc15651a66d9c5351c404e42af6e63e97fc903167e2a93` |
| `backup-input-shapes-tests-011.txt` | `8fcf5cccd86684d264d0a2949f33fa96a1a7ae9e5f2eae53e2262d40ea1f2ae5` |
| `backup-input-shapes-contract-gate-final-012.json` | `0b2b47abc24528b7e3fbeb29e949666ecd3d98486a2ba971d21c37232779f363` |
