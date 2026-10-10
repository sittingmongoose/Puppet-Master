# ER12 B-DISC-G-01/control-v1 — independent DISC assessment

**Source judgment: FAIL — one material omission (F1), bounded undo semantics.** The main OT, CRDT, storage and three-way-merge capability claims are supported. Delivery, factual-claim diagnostic, coverage, native provenance, protocol and time are assessed separately below. This is a role review, not full-pipeline qualification or an ER11 rescore.

The reviewer read the complete rubric, role assignment/input map/input freeze, mapped shared assignment and fixture, frozen input manifest, discovery.md, source-map.json and the sole sources member (sources/evidence.md). The map has no corpus. Seven candidate source pages and the failed undo-page lead were independently retrieved; a ninth primary page corroborates the Git repository-history precedent. Candidate science was neither edited nor sent feedback.

## Material finding F1: undo capability discovery is absent

Governing obligation: [shared assignment](ER12_RUNTIME/runs/B-DISC-G-01/inputs/assignment.md:11) says concurrent insertions, deletions and undo must be explainable; line 13 explicitly includes undo semantics in the bounded aspect.

Exact candidate locators: [discovery.md](ER12_RUNTIME/runs/B-DISC-G-01/control/stages/role/discovery.md:7), lines 17–19, 22, 29 and 32. The comparison says “undo unspecified”, “undo unspecified here”, and “undo is application-defined”; the implementation lead defers inspection of the undo API. Line 29 asks the correct product-policy question and gives a useful prospective trace, but supplies no implementation undo mechanism. [source-map.json](ER12_RUNTIME/runs/B-DISC-G-01/control/stages/role/source-map.json:96), lines 98–100, honestly records an empty-body UndoManager retrieval and uses no claim from it.

Independent governing evidence: [Yjs Y.UndoManager](https://docs.yjs.dev/api/undo-manager.md), constructor, Stop Capturing and Specify tracked origins; [saved evidence, line 16](primary/P8-evidence.html#L16), also lines 3–24 and 31–47. It documents a selective reverse-operation stack over scoped shared types, optional origin tracking, and capture grouping. The default grouping window is 500 ms; separate capture can be selected or forced between operations. These details directly affect the proposed “undo once after sync” trace.

The material omission is the absent semantic distinction between selectively reversing tracked operations and restoring an earlier shared-note snapshot. Every shortlisted option leaves undo unknown or application-defined, so the comparison discovers no usable undo capability or boundary for this explicit aspect. The documented API does not decide whose edits the product should undo, establish restart or stale-client behavior, or remove the need for the proposed test. No specific library, deployment, completed implementation or executed test is required by this finding. The failure to retrieve the page is acknowledged rather than called fabrication; the public primary Markdown rendition supplies the missing bounded capability. The desired product policy may remain honestly unresolved, but that external decision is different from the discoverable mechanism.

F1 changes the role source judgment because a material assigned-aspect omission remains. It does not negate the correctly supported discoveries below, and no repair is supplied to the candidate.

## Assigned axes and exact obligations

- **original_obligations: PARTIAL_MATERIAL_OMISSION.** Exact subject is one plain-text note, two offline users and an intermittently available relay. Negative scope constraints and all output forms are respected; undo semantic discovery has F1.
- **mechanism_diversity_and_useful_alternatives: PASS.** OT, sequence CRDT, base-relative file merge, and explicit revision adoption are meaningfully different automatic/manual convergence approaches. Automerge/Yjs are two implementations inside the CRDT family, not double-counted mechanisms. Revision adoption is correctly conditional on a later accepted revision; no automatic guarantee is invented.
- **consequential_source_conditions: PASS_WITH_LIMITATIONS.** P1-P7 support the main capability claims. Defaults, sequence versus scalar operations, retention versus compression, binary-update-only cleanup, common base, line domain, registration and unpinned versions are handled with bounded inference. L1-L3 are minor; F1 is tracked independently as a material omission.
- **retained_history_costs: PASS.** History/metadata retention, branch storage growth, base retention, deletion cleanup and a 20 KB edit-churn/stale-client measurement are addressed. No numeric storage guarantee is claimed. A 20 KB current note is not treated as a 20 KB history bound.
- **undo_semantics: FAIL.** Only unknowns, application-defined behavior and a prospective policy question are given; no bounded implementation undo mechanism is discovered.
- **implementation_leads: PASS.** Automerge and Yjs are inspectable leads with official API examples and actionable splice/update/state-vector entry points. The assignment asks for leads, not executed or audited source implementations. No exact library release or implementation validation is established.
- **historical_version_lead: PASS.** Git manual history and RCS ancestry are verified in P7; repeated-line/same-line evaluation is prospective, and no deployed binary version is fabricated.
- **discriminating_questions_and_checks: PASS_WITH_LIMITATIONS.** Three traces distinguish merge order/insert-delete intent, undo isolation, and retained bytes/stale recovery. Undo trace lacks origin/grouping semantics because of F1. Prospective outputs and user-dependent policy are identified rather than asserted as observed oracle results.
- **proposed_versus_executed_validation: PASS.** The candidate says no implementation/package/local probe was run. Its evidence is documentation retrieval; its three traces are proposed. No requirement for runtime execution exists in this discovery assignment.
- **product_choices_and_supported_scope: PASS.** Automatic preservation versus human conflict review remains a product decision. No universal winner, whole-product specification, rich-text requirement, networking architecture, permissions or UI design is introduced. Main supported discoveries are preserved despite F1.
- **wrong_corrections_exact_plan_dispositions: NOT_APPLICABLE.** Brief-only discovery has no supplied plan, enumerated applicability claims or critique/finalization dispositions.
- **pipeline_preservation_appl_final: NOT_ASSIGNED_UNGRADED.** No applicability/finalization or full pipeline is graded. Absence of verification.md/final-section.md is not a missing required final for DISC.

The required four items, two implementation leads, one historical/version lead, comparison and three prospective questions are present. Whitespace word count is 981, within 700–1000. The candidate cites seven primary pages across Automerge, Yjs, ShareDB and Git, meeting the source/project floor. The four mechanisms are not counted as four CRDT products: revision adoption is a separate human-resolution approach. The two implementation leads are valid API/example entry points; the word “leads” does not require implementation execution or a code audit.

## Consequential primary-claim review

- **S1 / Automerge Text: supported within scope.** String sequence edits use splice; whole-value updateText computes splices and depends on frequent calls. The example does not establish arbitrary adapter correctness. JavaScript-facing APIs; current unpinned docs, no product release selected. [Primary](https://automerge.org/docs/reference/documents/text/); [saved section](primary/P1-evidence.html#L58) (numbered text 58-77,98).
- **S2 / Automerge Conflicts: supported within scope.** Text/list concurrent insertions/deletions and same-position ordering differ from concurrent property/index writes. Scalar losers are inspectable; a subsequent assignment resolves that conflict. Ordering uses operation counter and actor ID, not wall-clock time. Sequence operations versus register assignments must remain distinct. [Primary](https://automerge.org/docs/reference/documents/conflicts/); [saved section](primary/P2-evidence.html#L63) (numbered text 63-69,82-98).
- **S3 / Automerge Concepts: supported within scope.** Core CRDT and repository plumbing are separate. Compression permits history retention but gives no byte ceiling or pruning/undo guarantee. The repository discussion is explicitly JavaScript-specific and may not transfer to another language. [Primary](https://automerge.org/docs/reference/concepts/); [saved section](primary/P3-evidence.html#L58) (numbered text 58-68,77-80).
- **S4 / Yjs Document Updates: supported within scope.** Convergence requires receiving all needed updates. The update-only merge removes duplicates but does not garbage-collect deleted content. Loading a Y.Doc is necessary for the described size-reduction route, not proof of a measured storage bound. Binary Uint8Array updates and state vectors; not a promise to keep every deleted character or provide undo history. [Primary](https://docs.yjs.dev/api/document-updates.md); [saved section](primary/P4-evidence.html#L4) (numbered text 4-24,58-76).
- **S5 / ShareDB Introduction: supported within scope.** Node.js server coordinates commits; JavaScript clients use OT type plugins. Offline sync and historic versions are advertised; queue ceilings and plain-text undo are not specified. Eventual reconnection and operation retention/type semantics remain dependencies. [Primary](https://share.github.io/sharedb/); [saved section](primary/P5-evidence.html#L34) (numbered text 34-48).
- **S6 / ShareDB OT Types: supported within scope.** json0 is the default. Additional types require both client and server registration; a type can be selected by name or URI, with URI preferred to avoid clashes. The rich-text example is not a required plain-text choice. The platform delegates transformation; no particular text type selected in the candidate. [Primary](https://share.github.io/sharedb/types/); [saved section](primary/P6-evidence.html#L38) (numbered text 38-57).
- **S7 / Git git-merge-file manual: supported within scope.** Three inputs are current/base/other. Default output changes current; -p uses stdout. Line-segment conflicts normally leave markers unless ours/theirs/union is selected. diff3 is also a presentation option. Current diff algorithm is myers; histogram can avoid some matching-line mismerges. Manual last updated in 2.54.0; selector includes 2.55.0-2.56.0 without changes. No local binary or selected deployment version verified. [Primary](https://git-scm.com/docs/git-merge-file); [saved section](primary/P7-evidence.html#L147) (numbered text 147-166,176-205,225-241).

The plain-text subject and unit are preserved. The 20 KB limit is current-note size; neither the candidate nor this review asserts it bounds edit/history metadata. Product input is still needed for automatic edit preservation versus explicit conflict review, desired undo semantics and a recovery/storage budget. The unversioned library docs establish current documented capabilities, not a selected deployment release. The Git version selector is manual history and is not converted into proof of the installed or shipped algorithm.

## Minor limitations

- **L1:** The CRDT paragraph makes Yjs update/garbage-collection claims but its trailing citations list S1-S3. S4 elsewhere in the saved map supports them. Candidate locator: ER12_RUNTIME/runs/B-DISC-G-01/control/stages/role/discovery.md:7; primary IDs: P4.
- **L2:** Git retaining base and both sides of an unresolved repository merge is true, but S7 is the standalone merge-file manual. Independent P9 TRUE MERGE gives the precise repository-index precedent. The candidate explicitly treats this as a precedent rather than a ready-made workflow. Candidate locator: ER12_RUNTIME/runs/B-DISC-G-01/control/stages/role/discovery.md:11; primary IDs: P7, P9.
- **L3:** Automatic only for non-overlapping is a coarse boundary: identical changes by both sides may be resolved cleanly. The prose and next step do not make a consequential rejection or promise based on that simplification. Candidate locator: ER12_RUNTIME/runs/B-DISC-G-01/control/stages/role/discovery.md:19; primary IDs: P9.

L3 is a coarse table summary rather than a consequential rejection; it is not the basis of FAIL. Git index history in L2 is independently supported by [TRUE MERGE](https://git-scm.com/docs/git-merge#_true_merge), [saved P9 line 567](primary/P9-evidence.html#L567). That operation is repository git merge, distinct from standalone merge-file.

## Useful discoveries and scope preserved

- **D1 (candidate):** Automerge operation granularity matters: infrequent whole-string diff conversion can merge poorly, making per-keystroke versus splice an actionable adapter check. Evidence: P1.
- **D2 (candidate):** Yjs compressed update merging and deletion garbage collection are different operations; measure loaded-document cleanup rather than assuming mergeUpdates shrinks away deleted content. Evidence: P4.
- **D3 (candidate):** ShareDB is operation machinery plus an OT type, so offline support alone does not establish the note-text transform or undo contract. Evidence: P5, P6.
- **D4 (candidate):** RCS-style line merging and explicit retained revision adoption preserve meaningful human-resolution alternatives to automatic operation merge. Evidence: P3, P7, P9.
- **D5 (reviewer_only_not_candidate_credit):** Yjs supplies origin-scoped selective undo and 500 ms capture grouping, so one undo need not mean one keystroke; source capability and desired product policy are separate. Evidence: P8.
- **D6 (reviewer_only_not_candidate_credit):** Git endpoint/base merging does not replay individual edits: an edit later reverted on one branch may reappear on merging another branch. This reinforces the need to distinguish history inspection from operation-aware undo. Evidence: P9.

The candidate preserves meaningful alternatives and limits: a chosen text OT transform must handle stale rebasing; CRDT convergence does not establish the desired visible result or undo policy; common-base line merging can require human resolution; retained branches preserve alternatives only while kept. No universal winner or whole-product specification follows. No supplied draft/critique/final exists for this role, so exact plan dispositions and downstream scope preservation are not graded.

## Validation and oracle applicability

Candidate-executed activity is assignment/fixture reading and reported documentation retrieval. The explicit statement that no implementation/package/local probe ran is preserved. The reviewer independently executed HTTPS retrieval and hash comparisons only. No local merge command or library behavior was executed. The three proposed traces are meaningful future discriminators: both merge orders for insert/delete intent; A undo after B contributes; churn/compaction and a stale client on a 20 KB note. Their results remain unknown. Visible convergence alone cannot determine whether the chosen result respects the desired edit-preservation/undo policy; those are owner decisions to define before using the traces as product oracles.

## Separate delivery, native, protocol and time judgments

- **Delivery: DELIVERED.** Required DISC research artifacts and its sole saved source member exist and were read in full. There is no missing required FINAL artifact: FINAL/APPL are not assigned. A terminal science freeze was not found under the permitted own-arm tree; input integrity is established separately.
- **Source: FAIL.** F1 is the supported material omission; main factual claims have a PASS_WITH_LIMITATIONS diagnostic.
- **Coverage: PARTIAL_MATERIAL_OMISSION.** Undo discovery is missing; the other bounded role axes are addressed.
- **Native: UNKNOWN overall.** A saved activation receipt reports active status, created 2026-10-10T04:46:11Z, and exposes the objective. No candidate terminal completion receipt or directly attributable tool trace is available in the inspected packet. The user supplied root completed/no pending as a premise; it is not upgraded to native completion evidence. Requested AUTHORIZED_PROVIDER_INSTANCE/gpt-6-luna/max/default in the freeze is requested routing, not observed effective provider/model/effort/tier. Effective execution, billing tokens and cost remain UNKNOWN.
- **Protocol: INVALID_METHOD on a supported exact deviation.** The required verbatim Goal objective in role assignment/freeze differs from the saved activation receipt. protocol-deviation.md acknowledges it. Exactly-one-Goal and activation-before-common-input execution are candidate declarations without a permitted independent trace. No assistance violation is inferred, and protocol invalidity is not substituted for F1.
- **Time: PARTIALLY_OBSERVED.** Candidate scientific artifact mtimes, latest 04:53:45.786946Z, precede the 05:00:54.708Z absolute deadline. The candidate reports source retrieval at 04:50:41–04:51:39Z. These establish neither actual terminal delivery nor whole occupancy/investigation time or final-writing-reserve execution. Those values remain UNKNOWN. No inference/billing savings, paired latency or other-arm comparisons are made.

## Unknowns

- Exact deployed Automerge/Yjs/ShareDB/Git versions and target language are unchosen.
- Runtime convergence, deletion retention, undo after restart, and stale-replica behavior are unexecuted.
- Meaning of preserve every edit, desired undo policy, recovery window and retained-byte ceiling require product input.
- Candidate native completion, actual effective route/tier and billing are not established by inspected evidence.
- No terminal science freeze was found under the assigned own-arm root; hashes define the reviewed snapshot, not host terminal provenance.
- Candidate complete execution timeline and assistance history were intentionally not read.

## Integrity and inspected hashes

All five input paths named by the pre-dispatch freeze match both recorded SHA-256 and byte count. Every inspected science/input/provenance file was hashed and remained unchanged at the second check. Hashes establish the exact reviewed bytes, not semantic correctness. No terminal science freeze file existed at the own-arm checks; the pre-dispatch input freeze is not misrepresented as a terminal output freeze. [Complete inspected-artifact manifest](inspected-artifacts.json) and [structured assessment](assessment.json) include paths, SHA-256, bytes, read scope, mtimes and stability checks.

| Inspected artifact | SHA-256 |
|---|---|
| assessment/RUBRIC-v1.md | `a93d0456d53b3519883ec517135688d2bbb4c12eb62f9a0b6fbe1bf2615fe19b` |
| runs/B-DISC-G-01/control/stages/role/input-map.json | `feb5bafd0af6ab1d980c65a79eb872341d59cc0658360d98ba2b78fd145a2449` |
| runs/B-DISC-G-01/control/stages/role/assignment.md | `0eecdb0431d80d9fb596bc8cdfba78ada961b86daef2b057268526a98b10c41a` |
| runs/B-DISC-G-01/control/stages/role/freeze.json | `6d387c53ecd5b5d9a5f789f3968c1748a742d7dc3b516ddc520f0329f37f2337` |
| runs/B-DISC-G-01/inputs/assignment.md | `848cd2e8b9ef3078e2333ae05a62a8e04662b2b1628f5c9b3b34b1c6c896a83b` |
| runs/B-DISC-G-01/inputs/fixture.json | `d9e63ea84e74f37b9e33e8087dcbff1359fed87ebb3401c22435573ec9598d4f` |
| runs/B-DISC-G-01/inputs/manifest.json | `7d9b298c18a2e876f1d41d4f4f94ce92c43f48db8ae8d95f622b91be30035d0c` |
| runs/B-DISC-G-01/control/stages/role/discovery.md | `953c7898fd84f292053f4ae63193d4209ede7b98d58329c334723ffc89679956` |
| runs/B-DISC-G-01/control/stages/role/source-map.json | `fa04c62ad27adee545851d3aa613db2690ff44bd8d1f18c6a4a94c2a8f8b0a97` |
| runs/B-DISC-G-01/control/stages/role/sources/evidence.md | `7174645e3fe876669c8ec478d5b58a07bea4044ce81274409c3c1d48c5b091e0` |
| runs/B-DISC-G-01/control/stages/role/goal-activation-receipt.json | `26a6b7db799d4313a31cbad9d4422bb3637605d9f32cad529d5d24a7a1f6fcbc` |
| runs/B-DISC-G-01/control/stages/role/protocol-deviation.md | `d0313d12ae3a02faec3d5f5d8ef3eeeed2806a38db9c7fa5ad81f6e80b45b29f` |
| runs/B-DISC-G-01/control/stages/role/service-tier-change.json | `9339d26821341415234084351a2b4e9348d06dadaeae24d4a05611b42f6914b4` |

[Assessment source map](source-map.json) records exact URLs, versions, local source locators, retrieval UTC/operation, applicability, exceptions and raw evidence hashes. [Navigable primary evidence index](primary/index.md) links the downloaded raw snapshots, numbered text and anchorable pages.

Review began 2026-10-10T04:56:12Z; judgment saved 2026-10-10T05:04:39.541613+00:00, within the 25-minute review boundary. One actual reviewer native Goal was activated before substantive shared-input reading; its observed tool response is saved in reviewer-native-goal-observation.json. This judgment is saved before native Goal completion. No delegation, candidate feedback/repair, other-arm/history/roster/outcome reads, account changes, Git/publication or ER11 rescore occurred.
