# PM7 compaction checker reconciliation

The GUI fixture checker retained a blanket `context.compaction.*` prohibition
and two completion-silent fixture names after ACD-461 / SP-259 admitted exactly
`context.compaction.completed` for successful committed compaction.

The read-only consumer now requires exactly one existing completion family,
with the current family/revision, Project scope and payload binding. All other
compaction event types remain forbidden. Its fixture census requires the
existing committed-completion positive and six boundary negatives. The real
shared-contract validator still checks their values.

Verification: six focused tests produce 18 expected failed assertions and zero
errors against the old checker; all pass after repair. All 13 checker regression
tests pass. The unmocked GUI fixture check passes: 20 Usage files / 13 cases,
7 shared files, 2 workspace-event positives and 1 completion family. Independent
review also checked all 45 outcome/event-list combinations and the six actual
negative values. No event/schema/fixture, owner prose, Spec Lock or governance
binding changed. This is not native emission or compaction-durability proof.

Evidence root:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/`

| Evidence | SHA-256 |
| --- | --- |
| `compaction-checker-repair-verification.json` | `b66f0e7fe17b58e22eea593a591e91cf620eb9e5e30699a2f39221e0db36f20a` |
| `browser_scm_performance/compaction-gui-checker-independent-review.json` | `6d15e084fdb334c856141950d996038897c5c8370dd12f1eb9084399623e7a56` |

Separately, the lossless specification-assessment routing index preserves all
2,051 specification-tagged frozen assessments in 138 routing buckets. Buckets
are not unique defects and do not close any assessment by inference. Its path
is `specification-obligation-routing-index.json` under the evidence root,
SHA-256 `1048dfbd8962e08ed480a3dc7e9ff607a31ce56e79eec37c653a2ab65d3b030d`.
