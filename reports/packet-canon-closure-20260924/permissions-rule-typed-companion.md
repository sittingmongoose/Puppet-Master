# Permissions rule command companion

Status: independently accepted bounded static companion applied and verified.
No main landing or native implementation completion is claimed.

Exact commands: `cmd.permissions.create_project_rule`, `update_rule`,
`reorder_rule`, `delete_rule`, and `validate_rule`. Their existing identities,
handlers, selectors, receipts, permission/atomicity requirements and empty
EventRecord expectations remain in force. Touch stays partial.

The companion binds requests to independently supplied current owner-file
hashes, selected original rules, results and post-write readback. Missing
independent reads are explicitly unproven. The separate pinned static test
double is not a native producer. Fixed-original mutations reject stale hashes,
changed rule values/metadata/order and false readback claims. Validation neither
persists nor grants approval. Unsupported rule-count, order-index, hash syntax,
string-length and timestamp restrictions from the first candidate were removed;
existing owner restrictions remain.

Only the independently reviewed frozen snapshot was applied. Later changes in
the external author's active directory are not part of this integration.
Seven files match that snapshot exactly; the central gate is additively rebased
to preserve the Doctor companion and increase the closed pair count from 82
to 83. No owner Markdown or generated governance artifact is changed here.

Evidence directory:
`/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/case-reconciliation/permissions-rule-five-correction-02/`.

| Artifact | SHA-256 |
| --- | --- |
| `freeze-v2-20260926T0331Z/FREEZE-MANIFEST.md` | `493cd7dc133709718e32ee07e0454078c347b9a2a30ceacb2d360326b9f9c426` |
| `freeze-v2-20260926T0331Z/companion-v2.patch` | `48cf72686e721c94bd2b72b3ada7bd61997b2491b64bfc9c33453f790a498bdb` |
| `freeze-v2-20260926T0331Z/REPORT-V2.md` | `95e04ab0408e7da41a7a7a8aeaa5ec63a09a94f6c552d819f9c6ab1ca2276249` |
| `REVIEW-DIFFERENT-SOL-V2.md` | `d77c3ad137f64fbac71beaeba2ed2657fdec762f9f3e45a7ddbc0ce5d217d78c` |

The frozen report cites an earlier checkpoint hash. The freeze manifest pins
the actual checkpoint bytes; no frozen report was silently rewritten.

Root verification: all 83 contract pairs pass, with 1,621 positive cases,
4,833 rejected negative cases and 12 internal self-tests; findings are empty.
The 16 focused checks pass in the frozen candidate and again in the full
worktree; production wiring verification passes. Touch
Closure reports exactly one Settings disposition-registry hash drift, identical
when the same verifier loads the committed `c500eb75c` Touch and Wiring inputs:
expected `10e1ffd1062a9a3aebd5c418acc7289fb5bb3d0261ef08edc65a461a47685632`,
found `43e215863fc05d2d2bc1bd863cbaca64042e167af6331e99eac3122a6b68e866`.
No TCR refresh or waiver is performed. An initial process-substitution baseline
attempt could not resolve its pipe paths; the successful comparison instead
injected the two exact Git blobs into the unchanged verifier loader.

The eleven `DC-PERM-*` labels are internal held-axis annotations, not presented
Jared decision cards, approvals or eleven product blockers. Remaining axes
include exact external-directory glob validity, unwritable-config outcome,
stale-hash validation behavior, duplicate non-directory patterns, actor binding
and exact human-approval action IDs. Hash/timestamp/parse-position serialization
and actual post-write byte authenticity remain owner-interface or implementation
work. These must be adjudicated against current owners; this slice does not
claim full five-command behavior for every input. Native TOML writes, atomicity,
issued permission, GUI behavior and runtime evidence remain unproved.

## Follow-up owner adjudication, not a new product question

At branch `8a1995faaf8b34bc409427548080bd52b1b4f4dc`, root found that
the internal duplicate-pattern hold needs correction or narrowing: Permissions
Section 9 explicitly says `tool_pattern` is not unique and must not be the
durable identity; the stable `rule_id` is the update/revocation key. The helper's
`DC-PERM-RULE-005` quotes that rule but then calls non-directory duplicate
patterns unspecified. No additional user choice is established by that label.
The separate external-directory duplicate-path error remains applicable to its
own domain. Independent review of the exact helper behavior and missing fixture
coverage was independently completed; this observation is not a claim that the companion already
tests every duplicate-pattern case, nor permission to relax directory checks.

Owner SHA-256: `48815a17511c29d076f3213a11db4ecae2a6b6832bb1ba88afccc81c9b1ef42d`.
Helper SHA-256: `c0ee0d09a961f1f7253ddd720efe6641124b436bfaa7be417cd16ddfa8c91dfa`.

The independent held-slice review (`REVIEW-HELD-SLICE-ADJUDICATION.md` in the
evidence directory, SHA-256
`dbc7fead6552827f4b89ac183f642a56914b35aed2e132995f58801c48c5834a`)
confirmed that the create branch already permits distinct rules with the same
non-directory pattern. Root corrected only annotation 005's wording/status and
its status assertion; command behavior and directory validation are unchanged.
The frozen accepted author version remains unchanged in external evidence.
Hash/timestamp/position serialization and actual post-write byte authenticity
are implementation or native-proof obligations, not established product choices.
Unwritable-config, glob, stale-validation and HITL-action joins still need
current-owner adjudication before any new user question is justified.

Different-Sol review accepted the exact two-file annotation/test diff; all
16 focused checks pass after that change, including this pair's central-gate
protocol. No full-gate rerun is claimed for annotation-only hygiene.
