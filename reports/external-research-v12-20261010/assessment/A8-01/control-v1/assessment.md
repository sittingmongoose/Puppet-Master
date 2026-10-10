# Independent ER12 assessment — A8-01 control, v1

**Source judgment: FAIL.** One material released-implementation behavior claim remains in the ordinary final. All six rubric axes were assessed and all eight original obligations and exact plan clauses were examined. The proposal otherwise preserves the required scope and offers a coherent, appropriately bounded BagIt pilot. The failure is not an allegation of an executed gallery failure, and is not based on hashes, stage agreement, missing deployment, or native telemetry.

The final says bagit-python v1.6.0 detects normalized-name conflicts. Its source defines a collision-check helper, but the stock package opening/validation/CLI path never invokes it. That distinction matters to the evidence for path-safe copy acceptance and release qualification. The same overclaim appears in discovery, draft, critic evidence, final evidence and final prose. It was not explicitly corrected. Details and primary locators are below.

Assessment scope: the single completed A8-01 control pipeline; ordinary final is [reviser/final.md](ER12_RUNTIME/runs/A8-01/control/stages/reviser/final.md). Reviewer identity: `codex-er12-a801-control-review`. Start: 2026-10-10T04:42:46Z; hard review-envelope end: 2026-10-10T05:27:46Z, including saving. The review completed its declared semantic scope before that end; no axis was capped or guessed. Exactly one reviewer native Goal was activated directly, ID `01a1241e-9770-76f0-be2b-4feb79d90666`. Full judgment is saved before its completion; the separate terminal receipt records completion afterward.

Navigation: [structured assessment](assessment.json), [independent source map](source-map.json), [evidence index](evidence/index.md), [all inspected original hashes](inspected-artifacts.json), [freeze comparison](freeze-verification.json). Original input/stage bytes remain unchanged. The root-supplied `root-review-request.json` was retained.

## Material finding M1 — unused helper mistaken for effective released validation

**Classification:** material wrong / unsupported operational applicability; remaining in final. **Confidence:** high for the static call-path conclusion; no runtime outcome is claimed.

**Candidate locators:** discovery.md:23; investigator draft.md:20; investigator source-map.json:68; critic source-map.json:68 and critique.md:50–52; reviser final.md:40; reviser source-map.json:125; reviser sources/index.md:37. These passages attribute conflict detection to the released implementation, rather than merely noting a separately callable helper.

**Governing primary evidence:** [bagit.py at v1.6.0](https://github.com/LibraryOfCongress/bagit-python/blob/v1.6.0/bagit.py#L345), independently captured as [E06-v160-bagit.py](evidence/E06-v160-bagit.py). The official tag resolves to commit `43fd5007115fd0e24dd701518ac6f82271006acd` ([tag receipt](evidence/E06-v160-ref.json)). Read the following actual source lines together:

- Lines 345–370: `compare_manifests_with_fs` compares sets after NFC normalization.
- Lines 380–398 and 625–627: the filesystem and manifest lookup maps use assignment/update; there is no duplicate-normalized-key rejection here.
- Lines 519–537 and 669–685: `validate` reaches completeness and digest checking through `_validate_contents`.
- Lines 727–761: completeness calls the set comparison, then digest checking uses the lookup map.
- Lines 878–895, 905–918 and 921–959: the conflict exception and NFC helper exist, and `build_unicode_normalized_lookup_dict` would raise on a duplicate normalized key **if invoked**. The file contains no invocation of that function. The only call to the conflict exception is inside that unused function.

Independent static parsing of the complete tagged module and test file corroborates the direct reading: [E06-static-call-check.json](evidence/E06-static-call-check.json) records zero call sites for `build_unicode_normalized_lookup_dict`; the tagged test file has none either. The relevant released test at [test.py:751](https://github.com/LibraryOfCongress/bagit-python/blob/v1.6.0/test.py#L751) checks a single filename/manifest normalization change, not rejection of two equivalent names. This was source inspection and AST parsing, not executing downloaded code or running product validation.

The normalized sets/maps can coalesce distinct raw names without the advertised exception. For example, two distinct canonically equivalent raw paths with identical content are not automatically rejected by this collision helper on the normal path. This is a static inference from the call flow, **not an executed counterexample**. A custom caller could explicitly invoke the helper; the assessed artifacts establish no such caller. Other releases may differ; this finding is bounded to the cited tag and normal validation operation.

**Why material:** released path-history and copy-validation applicability are central obligations 3 and 4. The final uses the cited release as positive evidence of detecting unsafe normalized-name collisions, a different operation from accommodating one filename that changes normalization in transit. Its proposed fail-closed collision handling and future validator qualification remain sound local choices, but they do not make that already asserted external behavior true. This is not an owner decision left honestly open. The result does not say the gallery selected this old release, installed it, lost files, or attempted a restore. No candidate repair or feedback was provided.

## Axis 1 — original obligations and negative constraints

**Coverage: FULL. Result: PASS for scope.** Final clauses 1–8, comparison, copy/restore protocol, owner inputs and validation record cover every numbered brief requirement. The final stays at planning scale and distinguishes observations, inference and gallery choice. Registrar completeness/version authority, custodian copy/restore authority, and open algorithm/package-depth decisions remain explicit. The readable inventory remains an authorized, conditional option: recommending it for the proposed pilot does not establish staff usability or make it an unconditional requirement.

The final prohibits moving or modifying originals, accounts, checksum-based authorship/recoverability claims and replacing the existing offsite copy with an untested platform. It stages copies and proposes retrieval from the existing offsite copy. No installation or prototype is required by the brief, so absent product operation is not a scope failure. M1 is evaluated separately as a remaining source error, not a missing obligation.

## Axis 2 — consequential claims and exact applicability

**Coverage: FULL. Result: FAIL because of M1.** All carried source IDs S01–S11 were independently retrieved, including official specifications, source code, issue comments, commit changes, release/tag records, PREMIS PDF/HTML and the git-annex manual. The independent [claim map](source-map.json) records subject, operation, version, defaults, units/types, exceptions, applicability and original locators.

The governing BagIt provisions support directly accessible payloads, per-file manifests, complete/valid separation, SHA-256/SHA-512 support with SHA-512 as a SHOULD creation default, and the limited octet/file-count role of Payload-Oxum. They support an arbitrary inventory file in payload and conditional tag manifests. The reference must be approved independently of the copied package; final mismatch handling preserves that distinction. [RFC 8493](https://www.rfc-editor.org/rfc/rfc8493.txt)

OCFL supports the competing versioned-object design. Its manifest maps digests to physical content paths; each version state maps digests to logical paths. Prior-version inventories are SHOULD, root inventory and each inventory sidecar are mandatory, and logs are optional. Sequential version examples do not exclude permitted consistently zero-padded numbering. Content-addressing permits sha512 or sha256 and recommends sha512. The proposal selects neither an OCFL deployment nor a validator. [OCFL 1.1, §§3.3–3.8](https://ocfl.io/1.1.0/spec/)

Issue #51 supports a reported Mac-to-Archivematica pathname mismatch and fast-check limitation. The reporter does not identify the destination as Linux; a later comment reports an OS X/Linux test that worked. The final’s detailed C3 disposition preserves that distinction. Commit 16f34b6 uses NFD; released v1.6.0 comparison uses NFC. The separate v1.9.0/PR #184 path-safety change and PREMIS/git-annex limitations are correctly bounded. M1 is the remaining consequential error in that history. [Issue #51](https://github.com/LibraryOfCongress/bagit-python/issues/51), [fix commit](https://github.com/LibraryOfCongress/bagit-python/commit/16f34b6)

## Axis 3 — discovery, alternatives, implementation/history and opportunities

**Coverage: FULL. Result: substantial supported discovery; historical implementation defect M1 remains.** Discovery is substantive, not a list of cautions. It proposes BagIt full snapshots versus OCFL object versions, stable registrar IDs versus path/digest identity, a PREMIS-shaped event log and a bounded git-annex location-history alternative. It compares independent inspectability/restore simplicity with duplicated snapshot storage, richer version history and validator ownership. ZIP is retained only as a conditional transport wrapper, rather than improperly declaring every archive unusable.

Useful opportunities include inventory bytes covered by a payload manifest; optional tag-manifest/reference protection; per-exhibition versus per-asset depth; a plain field guide; representation-normalization tests; full offsite read-back; and a clean retrieval rehearsal. The recent unsafe-path change supplies another narrowly scoped implementation-history lead. There is no need to demand an exhaustive product catalogue or a third preservation platform. The historical normalization mitigation is real; M1 prevents treating the entire claimed collision-detection history as qualified.

## Axis 4 — criticism, corrections, rejections and exact plan dispositions

**Coverage: FULL.** Every C1–C4 finding has an explicit final disposition, and the exact original plan wording is preserved in assessment.json for comparison. No wrong demanded correction or evidence-based removal of supported optional scope was found. The critic nevertheless missed and affirmatively carried M1 in its source map and blanket source-correctness statement. Its agreement is not semantic proof.

| Criticism | Independent assessment | Final disposition and status |
|---|---|---|
| C1, material unspecified restore source | Valid specificity finding: checking a restored local copy alone need not exercise offsite retrieval. It does not prove the drafter intended a local source. | Accepted/amended, final.md:82 and :108 explicitly retrieve from existing offsite copy. Corrected lineage defect. |
| C2, immutability wording | Valid minor qualification: BagIt packaging does not enforce retention/write protection. | Accepted/amended, final.md:9 and :109 make retention the custodian’s documented practice. Corrected. |
| C3, destination OS | Valid minor attribution correction. The reporter names a transfer server; Linux belongs to a separate successful test/comment. | Accepted, final.md:40 and :110 separate the observations. Discovery/source-map lineage error remains recorded, not scored as an unchanged final Linux-server claim. |
| C4, external owner/pilot inputs | Honest unresolved decisions after useful public investigation, not vacuous caution. | Retained uncertainty, final.md:100–104 and :111. Appropriate. |

| Exact original plan clause | Assessed disposition in final |
|---|---|
| 1: ZIP declared immutable; overwrite corrected caption | Correctly retains exhibition grouping and rejects overwriting the retained state. Compares BagIt/OCFL and custody analogy. |
| 2: BagIt candidate; OCFL roles not compared | Correctly compares package versus versioned-object responsibilities and adds logical identity/version relationships. |
| 3: archive checksum proves all expected assets; no reconciliation/restore | Correctly rejects completeness proof; approved inventory, per-file reference, mismatch handling and offsite-origin restore are specified. |
| 4: no investigated history; copy proves provenance/recovery | Correctly rejects the copy inference and supplies bounded released history. **M1 leaves part of the implementation evidence wrong.** |
| 5: expressly authorized optional readable inventory; investigate conditions; do not remove or mandate it | Retained with arbitrary-file packaging support, proposed CSV/field guide, registrar reconciliation, staff usability check and equivalent-record exclusion condition. |
| 6: reserved registrar/custodian authority; algorithm/depth recommendations only | Preserved. SHA-512 and full exhibition snapshots are recommendations, not obtained owner decisions. |
| 7: binding exclusions and incomplete original trace | Preserved in recommendation, staging protocol, failure handling and validation record. |
| 8: complete evidence-backed revision; demos are ideas; no false operational success | Complete proposal delivered. Research and proposed product operations are explicitly separated. Source correctness still fails for M1. |

The draft’s row 5 quotes abbreviated wording from original clause 3 rather than the exact original clause 5. Its disposition nevertheless preserves optional status/conditions; the final correctly identifies clause 5. This is a minor lineage attribution issue, not a remaining missing optional feature.

## Axis 5 — preservation across discovery, draft, critique and final

**Coverage: FULL. Result: PASS for supported-scope preservation, with the carried false claim M1 separately retained as a defect.** The final preserves the supported core recommendation, correction/version relation, filename/logical identity distinction, inventory option, competing OCFL path, PREMIS custody analogy, git-annex limitation, original constraints, owner inputs and NOT_RUN status. It is self-contained rather than a patch list or predecessor-ID substitute.

C1–C3 qualification corrects the relevant original defects without erasing their existence. The discovery’s Linux-server attribution, draft’s unspecified restore origin, and ambiguous immutability wording are recorded above. The draft also describes OCFL version states as mapping digests to content paths; the governing distinction is logical paths in state versus physical paths in manifest. Final wording no longer explicitly assigns physical paths to state, so this is a minor lineage imprecision, not a surviving OCFL implementation instruction. M1, by contrast, is repeated throughout and survives finalization.

## Axis 6 — proposed/executed validation and oracle applicability

**Coverage: FULL. Result: PASS for execution honesty and prospective design; M1 limits the stated released-code oracle.** No authored stage reports gallery package creation, validator execution, copying, offsite access, restoration, fault injection or staff usability as successful product validation. Retrieval/review is labeled research. Inheritance of S07–S11 during revision is disclosed; the reviser does not claim to have reopened them. A planning assignment can pass this axis with all operational tests NOT_RUN.

The proposed design supplies meaningful separate oracles: registrar-approved expected rows for exhibition completeness; original approved paths/digests for the copied bytes; independent controlled reference for manifest changes; explicit retained version relationships for correction meaning; and actual retrieval/opening from existing offsite storage for the chosen recovery route. Its ordered protocol prioritizes inventory/qualification and local checks before offsite copy/read-back and clean restore. Missing/unexpected names, digest mismatch, metadata disagreement and failed retrieval stay failed or unresolved. A size/count check or last-known remote report is not substituted for these checks. Representative opening is a bounded usability check, not proof that every file format or future recovery works.

Only the reviewer’s evidence retrieval, PDF text extraction, static source/AST analysis and byte-identity comparisons were executed here. Their exact inputs and outputs are saved. They are not candidate product validation. No downloaded code was executed. A declared conflict exception in unused source is not an effective validation oracle; that is M1, not evidence of an actually performed failed copy.

## Delivery, native, protocol, time and billing — separate records

**Delivery:** all mapped required science files exist and were read in full. All 34 recorded frozen hash/size comparisons match. Original/revealed plan and original/mapped brief are byte-identical. Those checks establish inspected identity, not source correctness. There is no separate critique-check file or disposition file in the mapped arm; C1–C4 dispositions are in final.md and reviser/source-map.json.

**T3:** own-arm investigator/critic status records and terminal-science-freeze-root.json record terminal completed tasks; the final task has no pending child runs. This is T3 task evidence only.

**Candidate native:** stage prose and investigator native-goal-record.json report active native Goals and pre-terminal snapshots; terminal summaries self-report completion. No independently captured native terminal tool response is provided by the inspected packet. Actual native terminal proof, distinct activation receipts/timestamps and unexposed provenance therefore remain **UNKNOWN**. Candidate-reported counts are retained in assessment.json as reported data, not attested inference/billing usage. Reviewer native activation is directly observed separately.

**Protocol:** a single-use plan-reveal record freezes discovery before release; its hash matches. Source-map access times for S01/S09/S10 are later than discovery save/reveal, so the final rewritten source map cannot establish the original pre-reveal retrieval chronology for those references. This is an evidence limitation, not proof of premature plan access or fabricated sources. Full candidate access logs, effective reasoning/tier and complete assistance/isolation audit are unavailable and **UNKNOWN**. Requested routes and returned T3 provider/model fields are recorded as such; priority investigator/critic and default reviser are requested settings. The prospective reviser tier change is recorded, not independently inferred as billing behavior. Reviewer performed no delegation, candidate assistance, account changes, Git/publication or other-arm/history/roster reads; only its own inbox was checked.

**Time:** the arm initializes at 04:11:13.469Z; root observes terminal science at 04:42:25.405359Z, an observed interval of 1,871.936359 seconds, not exact model execution time. Science file mtimes fall before their stated stage deadlines and the whole deadline. Exact occupancy/completion latency beyond those observations, inference time and billing savings are **UNKNOWN**. No comparison, savings or survivorship claim is made from one assessed arm.

**Limits:** actual gallery filenames/filesystems, owner choices, selected executable, CSV usability and restoration remain external inputs/NOT_RUN. Several inherited line or fragment locators are imprecise; independent URLs, tagged source lines and saved captures supply usable locators here. None of these honest limits is the reason for FAIL. M1 is the sole remaining material finding; the supported central proposal and corrected lineage defects remain visible.

Original freeze preservation is checked again before native completion. No original assessment is superseded and no candidate artifact is repaired.
