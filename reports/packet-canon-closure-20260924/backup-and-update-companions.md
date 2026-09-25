# Backup and application-update companions — 2026-09-25

Step base: `3aba33427e44c52f519bedbd54ea9d943e2c8edc`.
This supersedes the companion-pending description in the four-action prose
report, not its historical evidence or the whole packet's open status.

## Materialized specification

- Destination updates bind the original selected patch to actual observed
  before/after generations, partial or unknown effects, recovery and applicable
  proofs. Unknown effects cannot masquerade as current destination state.
- Snapshot resolution joins actual repository/run-or-receipt/manifest records;
  verification retains outcomes for every selected snapshot, including failures.
- Isolated drills have typed target admission, native Jujutsu verification
  context, path coverage, cleanup and recovery. They do not fabricate a live
  RestoreRun or introduce another restore mode.
- Comparison joins the actual snapshot and File-owned or SCM-owned target,
  including unsaved-buffer identity and current read permission. Neither branch
  gains write authority.
- Four Backup commands use successor request/result contracts. The other 37
  retain their predecessor admission. Retry responses bind genuine retained
  outcomes to the original operation while retaining the fresh invoking request;
  accepted still-running retries are representable. Handlers remain unavailable.
- RSC-014 application-update checks now have typed cadence, selected jitter,
  scope/generation, successful-source settlement, conditional-cache validation,
  failure/backoff and compare-and-set contracts. Failed attempts cannot advance
  the last-successful-check clock. Existing release metadata ownership is reused.

Storage dispositions distinguish nonpersisted transport/internal reads from
redacted domain metadata awaiting physical registration. No physical family,
retention policy, EventRecord, handler admission or governance binding is added.
All predecessor Backup definitions/fixtures and BRS-021 through BRS-029 are
preserved; the existing Jujutsu schema and Source Control schema are unchanged.

## Checks and review

The complete static contract gate passes: 36 pairs, 1,253 positive cases accepted,
4,323 negative cases rejected, all 36 metaschemas valid, zero findings. Focused
regressions pass: 69 Backup tests (including two final consumer-binding tests),
10 application-update tests, 18 legacy Jujutsu
tests and nine gate-manifest tests. Independent applied reviews covered each
companion lane and the cross-owner command responses; their findings were fixed.

Final integration scope passes, including the entire storage-registry schema,
exact preservation of 294 physical families and 27 retention policies, only four
production command-reference changes and two shared Touch profile references.
Shard verification passes for 99 documents and 2,734 shards. The 12 existing
Backup/Forge acceptance tests also pass.

The regenerated PlanUnit index has 6,723 units and 26,329 acceptance criteria.
Validation is **not green**: the same 30 recorded failures remain (20 legacy
decision-record errors and ten units missing relative to advancing main: DL-076
through DL-083, SMPFS-170 and SP-319). This is not a landing waiver.

External evidence root:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/packet-wide-rebaseline/`.

| Evidence relative to that root | SHA-256 |
| --- | --- |
| `server-backup/parallel-companions-gate-final-033.json` | `a5172a831ae35c2b3c52ee0d79c7f50fef96c59e4d295e744cc1b4743c4058fa` |
| `server-backup/parallel-index-final-035.json` | `7780842aa7692f2cbfa9ff50981347023129e022bbc516e405b2f0f479c6cf2e` |
| `server-backup/parallel-companion-scope-034.json` | `0e7acf031a73319bd5ba61f32a2ec7c25ececebfe74c8e3f29122128ff2b5cb8` |
| `backup-destination-applied-review-astra-20260925.md` | `b09a520fcb2305f6aed15c666271f7c6834ee7b00b1a6c37988b1af891ec7edd` |
| `backup-compare-applied-review-astra-20260925.md` | `1d0708dcefe9cbbc72bc9172638615eb47a9f729a78da465fd02fda72a509f6e` |
| `server-backup/drill-applied-review-030.md` | `92d0ffa06a88b25d92723e1b6f5b651883977d1df1736c631e88bb2a9236312d` |
| `application-update-applied-review-029.md` | `25da3f5d8995035701023b5ca2ebf7b3916ebb8821c627b23c57256577b17d36` |

## Still open

These are executable static schema/relationship checks with mandatory native
resolver/admission interfaces, not native implementations. Authentic source
issuance, bytes, permissions, race handling, isolation, cleanup and crash/restart
proof remain unexecuted. Physical storage keys, writers/readers, migration and
retention admission remain **specification prerequisites**, not automatically
implementation-only work. ACT-089/101/102/110 therefore receive bounded typed
contract credit, not unconditional feature closure.

The parallel breadth review also confirmed a separate source-backed capability
provisioning gap: original generation/intent and capability-ready-to-continuation
settlement. Its policy and physical operation family already exist; neither is
missing. Evidence: `capability-provisioning-current-main-001.md`, SHA-256
`de7d6c9d4c2bbf9e804644551cc049a3e6b7dd610579e32193050a0fd00246a4`.

No newer assistant-chat, Back Seat Driver, Context Lens, Help or Teacher design
is restored from old packets. Azure expansion remains frozen. Personal-dictionary
scope remains a separate unanswered choice. Whole-packet semantic coverage and
locked current-main landing remain unfinished; no reseal or readiness is claimed.
