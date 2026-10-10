# Independent ER12 Track B assessment — B-DISC-G-01 treatment-v1

**Bounded DISC source judgment: FAIL.** Two consequential source findings remain: the shadow-sync loss/delivery boundary is omitted (F1), and a particular exchange constraint is generalized into a merge-mechanism limitation (F2). This is a role judgment, not full-pipeline qualification or a paired speed/billing result. There is no ER11 rescore.

## Scope, complete reads and integrity

The full rubric, stage input map/assignment/freeze, mapped common assignment/fixture, input manifest, complete `discovery.md`, candidate `source-map.json`, every one of the five candidate `sources/` members, and saved activation/completion receipts were inspected. The map lists `corpus: null`; no corpus or other role output was assumed. The complete inspected paths, SHA-256 values and byte lengths are in [inspected-hashes.json](inspected-hashes.json) and [assessment.json](assessment.json). All five initial frozen input members match; every inspected byte was unchanged on the pre-save recheck.

No existing terminal/output freeze was found in the exact treatment tree or the scoped case-named freeze search. The supplied `freeze.json` is a preparation/input freeze. Output hashes are observed inspection hashes, **not** a claim of terminal host freezing. Root's T3 completed/no-pending verification is supplied by the review assignment and kept distinct from native receipts.

## Source-backed material findings

**F1 — omitted diffsync loss/recovery and variant conditions.** Candidate `discovery.md:11` calls history “roughly two extra full-text copies (the shadow pair) per sync relationship plus in-flight diffs” and limits its failure boundary to patches that “can misplace text” and eventual reconnection; the same scope appears in row 31. [P4](primary-evidence/p4.md), Fraser's January 2009 paper §§2–4, documents edit loss and a retained-state-changing delivery refinement. The offered mechanism and comparison leave out that consequential distinction. This matters to the assigned offline failure/history inquiry regardless of whether users ultimately accept loss. A deployment or guaranteed-delivery implementation is not required for discovery; a correct boundary is.

**F2 — conditional exchange behavior presented as inherent.** Candidate `discovery.md:13` says “merge-based sync is half-duplex” and row 32 makes “half-duplex” its characteristic failure. [P4 §1](primary-evidence/p4.md) describes a particular received-result discard rule under local changes during flight. [P5 §§8/8.3](primary-evidence/p5.md) defines merge over supplied versions. The candidate's reconnect alternative is not established to have that exchange rule. The generalized comparison can incorrectly discount a valid mechanism. This is a supported applicability error, not a demand for continuous real-time collaboration.

No stronger allegation is needed to obtain FAIL; F1 and F2 each prevent PASS/PASS_WITH_LIMITATIONS under the rubric's material-error/omission rule. Candidate science was not repaired or sent feedback.

## Assigned axes and exact obligations

- **Original brief and negative constraints:** structurally met. The output is 959 whitespace words (926 with a word-token regex), inside 700–1000. It stays with a two-device <=20 KB plain-text note, concurrent insertion/deletion/undo and retained state. Four mechanisms, two implementation leads, one version/history lead, a compact comparison, three questions/tests, uncertainty and a next step are present. It leaves automatic reconciliation versus user conflict resolution open and claims no universal winner.
- **Unfamiliar mechanisms and alternatives:** useful, substantially diverse discovery: CRDT, coordinator-based OT, fuzzy shadow synchronization and common-ancestor merge. F1/F2 leave the failure/variant comparison materially incomplete or overbroad. No fifth alternative or invented shortlist requirement is imposed.
- **Consequential source applicability:** main Yjs/ShareDB capability statements and UndoManager's 500 ms default are confirmed ([P1](primary-evidence/p1.md), [P2](primary-evidence/p2.md), [P3](primary-evidence/p3.md)). Version/default/subject/operation/exception limits are recorded separately in the source map. Live Yjs/ShareDB package versions are UNKNOWN. Current-text KB does not measure retained-state bytes, undo stacks or edit history; exact overhead was not tested.
- **Implementation/history:** Yjs README/demos and ShareDB repository/type/history APIs are valid inspectable leads, not proof of an installed working system. GNU Diffutils 3.12 (12 January 2025) is verified. The present manual/copyright lineage does not establish decades of invariant behavior; that extrapolation is a limitation, while the requested version lead is delivered.
- **Comparison and decisions:** tables cover offline behavior, history, undo and conflict handling. Undo granularity/retention remain product choices; F1/F2 distort consequential entries. GC/history and loss-class caveats remain limitations described below.
- **Dispositions and supported-scope preservation:** no source plan, seeded shortlist, critique or FINAL section exists, so repair dispositions and finalization obligations are not applicable. No missing final was graded as failure. No deployment/account/service requirement was invented. The brief's unresolved product choice is preserved.
- **Prospective checks and actual validation:** T1/T2/T3 are meaningful proposed insert, concurrent undo and retained-byte probes. Their expected categories are hypotheses, not demonstrated outcomes. A one-sentence explanation can inform user preference, not prove correctness. Workload/configuration and byte accounting must be fixed when executing a soak. No candidate runtime convergence, undo or seven-day test is evidenced or required by this brief-only assignment.

## Limitations and useful discoveries retained

Yjs residual metadata growth is a legitimate concern; [P6](primary-evidence/p6.md) and [P7](primary-evidence/p7.md) expose GC/merging and historical-restoration conditions missing from the simplified discussion. Its asserted absolute smallness is not established from current note size. This caveat does not remove the useful origin-scoped undo lead.

The generic event-passing warning should be bounded by the loss class: [P8](primary-evidence/p8.md) shows ShareDB acknowledgment, retry, requeue and version recovery. This static inspection proves neither process-restart durability nor a chosen text type's undo semantics. The candidate's “fork on lost op” is not independently decisive because permanently losing an operation differs from recovering a dropped message.

GNU options matter. Default `-m` assumes `-A`; `-e`/`-E` handle matching tips differently ([P5](primary-evidence/p5.md)). Therefore an alleged universal identical-edit auto-acceptance would be a wrong reviewer correction. Same-region edits, GNU's technical overlap classification and user-escalation policy should be distinguished. No exact invocation was executed.

Useful supported material remains: the four-way comparison, Yjs selective undo/default grouping, ShareDB offline/history leads, a version-located merge implementation, and all three prospective probes. Source records honestly leave exact candidate fetch times and live versions unknown. These strengths do not cure F1/F2.

## Independent dimensions and unknowns

**Delivery:** discovery and all required source artifacts are present; length/structure pass. Terminal freezing remains unverified. **Source:** FAIL for F1/F2. **Coverage:** structural obligations met, semantic boundaries partial. **Native:** saved receipts contain matching goal/session/objectives and active/complete states, but actual tool provenance is UNKNOWN. The saved `tokens_used: 860720` field is observed, not verified token usage or billing. Effective provider/model and billing are UNKNOWN; requested route and fixture labels are not execution evidence.

**Protocol:** initial hashes match, and no observed evidence supports an unauthorized-assistance finding. Full candidate tool sequence, source-page budget, activation-before-inference and save-before-completion ordering are UNKNOWN without prohibited history. The reviewer created exactly one actual exposed native Goal before reading common scientific inputs, used no delegation/candidate feedback or repair/account/Git/publication/other arm/history/roster, and wrote only in the reserved assessment directory. Only the reviewer's own mailbox was checked.

**Time:** saved receipt timestamps report activation 04:46:19.156 UTC and completion 04:50:39.376 UTC: 260.220 seconds between receipts, 284.668 seconds from preparation. They precede the 05:00:54.708 candidate deadline, but do not establish host delivery, writing reserve or whole occupancy. No savings/speed/20% claim follows. Reviewer start is 04:52:23 UTC; the review has its own 25-minute bound.

Review execution comprises complete assigned-file reads, independent primary retrieval, static document/code inspection and hashes. No installed convergence system, concurrent undo probe, benchmark/soak, account or deployment was run. Unknown product preferences remain genuine decisions, rather than grounds to reject all alternatives.

## Saved evidence and judgment

[Machine-readable complete assessment](assessment.json) · [Source map](source-map.json) · [Navigable primary evidence](primary-evidence/index.md) · [Inspected hashes](inspected-hashes.json) · [Actual reviewer Goal observation](reviewer-native-goal-observation.json).

This original assessment is preserved as v1; any later dispute disposition belongs in a separate record. Judgment and evidence are saved before reviewer native completion.
