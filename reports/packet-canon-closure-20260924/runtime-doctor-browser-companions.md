# Capability, Doctor and Browser companions — 2026-09-25

Step base: `4babbe96310dd4946b212f7dd09d8d7f38ba17e7`. This is another bounded
non-GUI repair, not whole-packet closure or a main landing.

## Implemented contracts

Capability provisioning now binds original demand, per-origin waiter, actual
Installation-or-Connection readiness, immutable effect-time currentness and
continuation settlement. Existing-ready capability remains usable under Off;
Off cannot acquire a new capability. Detached or changed origins cannot resume
another waiter's work. Failure after rollback retains the original `rolled_back`
phase. Resumption is not a claim of downstream success. Existing public ensure
transport and physical operation v1 remain unchanged.

Doctor now has a finite selected batch, genuine human read-admission contract,
exact descriptor/target/currentness and per-member query/result/finding joins.
Stop scheduling, owner cancellation and viewer detachment are distinct. The
first concrete leaf is a BackupCoordinator-owned nonsecret repository metadata
read, not a scan, unlock, verification or health check. Its completed read may
correctly yield unknown health. Missing owner records are rejected without a
crash. No rejected `cmd.doctor.run_all` command is restored.

Browser has an additive finite typed control tree with sequencing, conditionals,
switches and bounded loops, conservative visit bounds, read-only iterators and
original compiler/program/dispatch lineage. Existing public command envelopes
still select the version-discriminated program; no new command is introduced.
Complete result-byte/schema pinning is reused. Checkpoint visits are not equated
with segments: authentic native planner admission remains separately required.

All preceding schemas/fixtures remain unchanged. Six new disposition rows name
the exact companion schemas without creating physical families or retention
policies. Browser successor compiler results remain durable-pending like their
predecessors; Doctor exchanges are nonpersisted. Capability custody is pending
same-family versioned writer integration, not permission to insert new records
into the existing closed v1 value.

## Verification

Focused tests pass: capability continuation 12, Doctor 16, Browser 12 and closed
gate-manifest bookkeeping nine. Applied independent reviews found and corrected
the rollback, malformed-record, lineage, iterator and segment-proof issues.
The full storage registry validates with zero schema errors; all 294 physical
families and 27 retention policies remain byte-for-byte equivalent as values.
Scope verification confirms only five existing PlanUnits change semantically:
BRS-004, N2-152, PS-133, SIR-003 and SMPFS-147. The index has 6,723 PlanUnits and
26,335 acceptance criteria, without WorkNodes or readiness admission.

The complete aggregate contract run passes: 39 pairs, 1,277 positive cases
accepted, 4,363 negative cases rejected, all 39 metaschemas valid, zero findings.
The first run exceeded its 180-second wrapper deadline. A second interim run
was explicitly terminated by root while review fixes were still being applied
(not an OOM or a semantic rejection); the final run used a 900-second limit.
No check or negative fixture was disabled. Final index validation retains the
same 30 exact failure rows as the prior batch, with no additions or removals;
it is not green and no landing waiver follows.

## Remaining work and evidence

Public ensure/Permissions composition, full coalescing/fingerprint and physical
writer/custody integration remain specification prerequisites. Doctor's 52
source-occurrence mappings remain unpopulated by this common controller; missing
adapters must not be disguised as unsupported checks. Native compiler/planner,
permission issuance, original source custody, query/effect execution, recovery
and performance proof are not supplied by static fixture adapters. Whole-packet
breadth reconciliation and locked current-main landing remain open. Protected
newer assistant-chat/BSD/Context Lens/Help/Teacher designs remain untouched.

External evidence root:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/packet-wide-rebaseline/`.

| Evidence | SHA-256 |
| --- | --- |
| `capability-continuation-applied-review-root-20260925.md` | `8955cb1f39c2a677814968cf15a78e823d8cdf8a79b71b7fa6e743feaeacf04b` |
| `doctor-controller-applied-review-astra-20260925.md` | `95fa041c8880ea9029a5f9373991ed52436c0cb1092849a759cf13e993067047` |
| `browser-control-applied-review-final.md` | `acf39c47a7529821f6ca01609d1921b61051ac1689eb78b84b50996c985e3c96` |
| `parallel-nongui-scope-005.json` | `a51f72eb11473805a55e280e450558f5a5f3a860d996454d13b261000d9c2d9f` |
| `parallel-nongui-scope-final-007.json` | `9d5d7448282ba7e2eea9683eb8a29646e2248895917cc17746095b336af4d583` |
| `parallel-nongui-contracts-003.json` | `a683f6f325898361f2fe78856a324a448bbf8ee8155cf278dd3ca92123aa0b4a` |
| `parallel-nongui-index-final-004.json` | `7cb40f5ecfa0308d08ba22c8310ac8dd16012553e78ee80e62b9f7eade9e015e` |
| `actionable-nongui-closeout-20260925.md` | `ffcc247f9e6660d2f0172881db02e07d613848a8517bc5dd636e31245636d93a` |
