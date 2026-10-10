# ER12 A5-01 control — independent full-pipeline assessment

**Source judgment: FAIL.** The complete final proposal retains the requested scope and corrects several real earlier defects, but leaves one material field-domain/acceptance-oracle omission (F1) in the optional BWF path. This source judgment is independent of the reviser’s disclosed scope deviation and of missing native/billing telemetry.

**Review coverage:** all six axes, all eight exact obligations, every original plan section/treatment, all C1–C6 dispositions, every carried source map/index, all required stage assignment/input-map/freeze files and original authored discovery/draft/critique/final. No axis was capped or guessed. Only A5-01 control was examined.

[Independent evidence index](evidence/index.md) · [Source map](source-map.json) · [Assessment JSON](assessment.json) · [Original inspected hashes](original-inspected.json)

## Remaining material finding F1

The optional embedding conditions omit the ASCII domain of the named BEXT fields and do not separate that domain from successful code-page round trips.

**Candidate locators:** [final §3](ER12_RUNTIME/runs/A5-01/control/stages/reviser/final.md:35), [field-limit gate](ER12_RUNTIME/runs/A5-01/control/stages/reviser/final.md:45), [CSET/non-ASCII condition](ER12_RUNTIME/runs/A5-01/control/stages/reviser/final.md:49), [character test](ER12_RUNTIME/runs/A5-01/control/stages/reviser/final.md:55), [validation row](ER12_RUNTIME/runs/A5-01/control/stages/reviser/final.md:136).

EBU Tech 3285 v2 §2.3 defines Description/Originator/OriginatorReference as ASCII strings (256/32/32 characters). FADGI v3 prints those definitions as well as separate CSET/code-page guidance. PR #34 explicitly warns that non-ASCII is forbidden by the EBU definition for these three fields while GUI writing can remain enabled.

**Primary evidence:** [EBU Tech 3285 v2 §2.3](https://tech.ebu.ch/docs/tech/tech3285.pdf), [FADGI v3](https://www.digitizationguidelines.gov/audio-visual/documents/BWF_Embed_Guideline_v3_2021.pdf), [MediaArea BEXT definitions](https://mediaarea.net/BWFMetaEdit/bext), and [merged PR #34 implementation diff](https://github.com/MediaArea/BWFMetaEdit/pull/34/files). Captures/locators: [E20](evidence/index.md#e20), [E01](evidence/index.md#e01), [E21](evidence/index.md#e21), [E16](evidence/index.md#e16).

Final §3 names the three fields and lengths but omits their character domain. Its non-ASCII instruction and §4/validation test make exact-chain character preservation the stated decision boundary, with no distinction between standards-defined BEXT values and tool-supported non-ASCII extensions/other metadata fields. A successful non-ASCII BEXT read/write/read is therefore not a sufficient acceptance oracle for the named field profile.

This is publicly answerable governing information for obligation3, and it changes whether a proposed embedded value belongs in the named BWF field. For example, a hypothetical accented organization name in Originator can fit the length, have archivist approval and survive a selected writer/reader chain while remaining outside the standard ASCII field domain. This example is an analytical counterexample, not an executed test or an actual collection defect. The proposal retains external UTF-8 authority but still authorizes a portable embedded subset on incomplete conditions.

**Counterevidence and scope:** The final does say to keep values within field limits and does not promise universal compatibility. The FADGI CSET paragraph genuinely discusses code-page interpretation for internal metadata, including bext. Those statements support caution but do not state or investigate the standards-vs-tool domain distinction; lengths and successful reopening are not substitutes for it. I do not demand comprehensive conformance auditing, an installation, mandatory embedding, a specific codec or a new product requirement.

**Lineage:** The same domain distinction is absent in discovery/draft and not identified by C1–C6. Final adds PR #34 but only summarizes a generic warning. F1 is a remaining final qualification gap, not one of the explicitly corrected earlier defects.

No original audio was supplied, edited or shown corrupted. The sidecar baseline, optional transcript/access scope and most historical facts remain useful. This finding does not establish a current tool bug or require excluding those options.

The final cannot receive PASS_WITH_LIMITATIONS while this consequential condition is unresolved. No candidate repair or feedback was made.

## Six-axis assessment

### Axis 1: Original obligations and negative constraints — PASS_WITH_LIMITATIONS

All eight original obligations and four exclusions are explicitly retained. Two workflows plus preservation analogue, identity/revisions/access links, optional fields and history, supported optional transcript/listening scope and exact owners are present. This is a complete planning proposal with honest owner inputs. Technical adequacy of obligation3 is separately failed under axis2/F1; textual scope coverage does not cure it. No omitted mandatory deployment or ASR obligation is invented.

Evidence: [E01](evidence/index.md#e01), [E02](evidence/index.md#e02), [E06](evidence/index.md#e06), [E07](evidence/index.md#e07), [E08-indexed](evidence/index.md#e08-indexed), [E09](evidence/index.md#e09), [E10](evidence/index.md#e10), [E19](evidence/index.md#e19).

### Axis 2: Consequential source claims: exact subject/operation/version/default/unit/type/domain/exceptions — FAIL

Most claims are correctly bounded: BagIt payload vs tag fixity, data-chunk MD5 vs whole file, WAVE codec vs extension, FADGI local file date vs event date, CSET default vs selected readers, 25.04 core-file reading vs audio rewrite, and issue/release association vs universal resolution. Remaining F1 omits the ASCII domain of the named BEXT fields while proposing non-ASCII embedding conditional on a successful chain. The publicly retrievable standard and the tool implementation explicitly distinguish write capability from field admissibility.

Evidence: [E01](evidence/index.md#e01), [E03](evidence/index.md#e03), [E04](evidence/index.md#e04), [E05](evidence/index.md#e05), [E06](evidence/index.md#e06), [E13](evidence/index.md#e13), [E15](evidence/index.md#e15), [E16](evidence/index.md#e16), [E20](evidence/index.md#e20), [E21](evidence/index.md#e21).

### Axis 3: Useful unfamiliar discovery, competition/analogy, implementation/history and opportunity breadth — PASS

Substantive discovery precedes plan reveal in the recorded hash/reveal lineage. Package-first sidecars/BagIt and BWF-aware enrichment are realistic competing workflows with recorder, interoperability and staff effort tradeoffs; PREMIS is an analogous event/relationship model. OHMS supplies a useful distinct access opportunity with hosted viewer/timepoint-search conditions, retained independently of deposit. The #29/20.05 history plus PR #34 supplies a bounded implementation lead and later encoding changes. An exhaustive catalogue or another recording application is not required. Implementation detail is limited in candidate prose, but relevant history and alternatives are useful, not vacuous caution.

Evidence: [E03](evidence/index.md#e03), [E04](evidence/index.md#e04), [E05](evidence/index.md#e05), [E06](evidence/index.md#e06), [E07](evidence/index.md#e07), [E10](evidence/index.md#e10), [E15](evidence/index.md#e15), [E16](evidence/index.md#e16), [E19](evidence/index.md#e19).

### Axis 4: Wrong criticism/corrections/rejections and exact plan dispositions — PASS_WITH_LIMITATIONS

Every C1–C6 disposition is explicit and checked. C1 corrects a lineage omission while preserving legitimate end-to-end uncertainty; C2 resolves a real sidecar fixity ambiguity; C3 narrows a generalized rewrite claim; C4 rightly resists the critic inference about absent complementary language; C5 clarifies the preservation/access distinction without claiming a deployment; C6 preserves a version anchor with no operational claim. Original plan assumptions and retained owner/optional/negative clauses are reconciled individually. Minor S15 source-index provenance wording remains L1. Agreement is not the basis for this judgment.

Evidence: [E01](evidence/index.md#e01), [E04](evidence/index.md#e04), [E05](evidence/index.md#e05), [E06](evidence/index.md#e06), [E07](evidence/index.md#e07), [E08-indexed](evidence/index.md#e08-indexed), [E10](evidence/index.md#e10), [E15](evidence/index.md#e15), [E18](evidence/index.md#e18), [E24](evidence/index.md#e24).

### Axis 5: Supported discovery/draft/critique/final meaning preservation — PASS

Final remains self-contained. It preserves sidecar authority as a proposed archivist-approved choice; IDs/source names/conflicts; revisions/interviewer approval; separate received/access objects and derivation events; format/encoding uncertainty; whole-file vs audio data checks; optional human-reviewed transcript/listening route; OHMS and no-web alternative; and external consent ownership. Corrected historical/attribution/placement defects remain visible in lineage and do not erase supported meaning. F1 is a condition that was missing throughout, not final loss of an already supported proposal.

Evidence: [E01](evidence/index.md#e01), [E02](evidence/index.md#e02), [E03](evidence/index.md#e03), [E06](evidence/index.md#e06), [E07](evidence/index.md#e07), [E08-indexed](evidence/index.md#e08-indexed), [E09](evidence/index.md#e09), [E10](evidence/index.md#e10), [E19](evidence/index.md#e19).

### Axis 6: Meaningful proposed vs executed validation and oracle applicability — FAIL

The final honestly separates executed source/control review from all NOT_RUN product/media checks. Manifest/missing-file, identity/interruption, character reopening, codec/hash/data preservation, transcript approval, intended-player accessibility and OHMS linkage tests are discriminating prospective checks. None needs to have run for this planning brief. However the character round-trip oracle only establishes the selected chain retention, not whether a non-ASCII value belongs in the named ASCII-defined BEXT field. F1 therefore also leaves a consequential acceptance-oracle gap. Hashes, sizes, source-ID counts, stage agreement and reveal receipts are not semantic proof.

Evidence: [E01](evidence/index.md#e01), [E03](evidence/index.md#e03), [E06](evidence/index.md#e06), [E09](evidence/index.md#e09), [E16](evidence/index.md#e16), [E19](evidence/index.md#e19), [E20](evidence/index.md#e20).

## Exact original obligations

### Obligation 1 — MET

Compare two realistic metadata/deposit workflows and an analogous preservation mechanism with portability and recorder compatibility tradeoffs.

Compared sidecar/BagIt baseline and optional BWF-aware copy workflow; portability and schema/staff effort specified; PREMIS analogue retained. Original one-comment/file-name/universal-survival assumptions rejected with bounded evidence.

Final locator: [section response](ER12_RUNTIME/runs/A5-01/control/stages/reviser/final.md:16).

### Obligation 2 — MET

Explain recording identity, embedded/sidecar metadata authority, transcript revisions and links between originals and access copies.

Interview/file/revision IDs, source filenames and conflicting metadata, archivist authority, correction approvals, derived_from and separate post-intake storage/access tiers are explicit.

Final locator: [section response](ER12_RUNTIME/runs/A5-01/control/stages/reviser/final.md:25).

### Obligation 3 — MATERIAL_GAP

Research the conditions for optional embedded descriptive metadata without assuming every WAV tool supports the same fields or rewrite behavior.

Lengths, recommendation levels, actual codec, field approval, copy/fixity and versioned round trip are researched, but F1 leaves the named BEXT ASCII domain and conformance/tool distinction materially incomplete.

Final locator: [section response](ER12_RUNTIME/runs/A5-01/control/stages/reviser/final.md:35).

### Obligation 4 — MET_WITH_F1_QUALIFICATION

Investigate a relevant metadata round-trip/encoding issue or released change and explain how it affects this collection.

Real #29 GUI/CLI/quote case, merged PR #34 and explicit 20.05 link, 23.04 code pages/CSET and 25.04 core-file-read fallback are investigated. End-to-end success remains honestly untested; F1 limits the practical acceptance condition.

Final locator: [section response](ER12_RUNTIME/runs/A5-01/control/stages/reviser/final.md:51).

### Obligation 5 — MET

Preserve and investigate this supported optional scope: a human-reviewed plain-text transcript and accessible listening copy alongside the preserved original. It is an authorized option, not a mandatory feature or an established technical capability; recommend conditions, retain it when supported, and explain any evidence-based exclusion.

Authorized optional plain-text human-reviewed transcript and accessible listening derivative are retained. Staff, codec, audience/player and consent inputs remain conditional; no evidence-based exclusion is invented or mandatory scope added.

Final locator: [section response](ER12_RUNTIME/runs/A5-01/control/stages/reviser/final.md:57).

### Obligation 6 — MET

Make owner decisions explicit: The collections archivist decides descriptive-field authority; the interviewer approves transcript corrections. Consent review is an external owner input and cannot be replaced by a software default.

Collections archivist, interviewer and external consent review retain exactly the assigned authority. No owner approval or software consent default is reported.

Final locator: [section response](ER12_RUNTIME/runs/A5-01/control/stages/reviser/final.md:65).

### Obligation 7 — MET

Preserve negative constraints: Do not alter received originals during this research, promise lossless edits from a filename extension alone, require automatic speech recognition, or infer consent from possession of a recording.

All four negative constraints retained. No original modified, extension-based lossless claim, ASR requirement or possession-based consent appears.

Final locator: [section response](ER12_RUNTIME/runs/A5-01/control/stages/reviser/final.md:73).

### Obligation 8 — MATERIAL_GAP

Deliver one coherent evidence-backed research proposal covering obligations 1–8, with recommendations, source/version applicability, useful discoveries, unresolved owner inputs, and a validation table separating checks actually executed from checks merely proposed. Do not report research sources or future tests as executed product validation.

Coherent complete proposal, source index/version limits, useful opportunities and validation table supplied. Remaining F1 prevents source qualification despite delivery/coverage. No operational tests are claimed.

Final locator: [section response](ER12_RUNTIME/runs/A5-01/control/stages/reviser/final.md:82).

All four negative constraints were checked separately: preservation of received originals, no suffix-based lossless promise, no ASR requirement, and no consent inference from possession. They remain explicit in final §7. No media was supplied or modified in the inspected evidence. The brief’s broader boundaries—planning only, pilot scale, varied recording applications, read-only public research, no required install/account/purchase/live writes, distinction between observation/inference/local choice and proposed/executed checks—are retained.

## Exact original plan dispositions

The following preserves each plan section’s exact treatment. Numbered obligation headings are repeated above; the machine-readable registry preserves both each exact heading and body, plus setup and all five handoff validation rows. The original plan was a fallible source input, never an assessor key.

### Access and status

Original: [plan](ER12_RUNTIME/frozen-inputs/A5-01/plan.md:3).

Exact original treatment:

> ROOT-STAGED PLAN INPUT. Withhold this document, its product hints and this fixture's index entry from the brief-only investigator until discovery has been saved. This is a fallible, realistically incomplete sandbox draft to compare against research, not an assessor key. All external behavior claims below are unverified draft assumptions. No implementation, source inspection or product validation has been executed in preparing the draft.

**Independent disposition:** Fallible plan status respected. Recorded discovery hash was frozen before reveal; discovery not subsequently changed. Reviewer did not read other arms or source roster. Recorded sequencing is evidence-limited, not proof of every hidden read.

### Pilot intent

Original: [plan](ER12_RUNTIME/frozen-inputs/A5-01/plan.md:7).

Exact original treatment:

> A local history society receives WAV recordings, photographs and interviewer notes from volunteers. It needs a portable deposit package with understandable recording identity, descriptive metadata and a record of later transcript corrections. The society preserves received audio separately from access copies. Volunteers use varied recorders; collection staff do not want to require one recording application.
>
> The team has tentatively discussed BWF MetaEdit or a comparable audio-metadata workflow. These are investigation leads, not selected winners. The mechanism needing investigation is embedded versus sidecar metadata and preservation/access separation; a useful historical inquiry concerns released metadata round-trip or encoding failures. Do not let these leads prevent discovery of a better fit or an analogous mechanism.

**Independent disposition:** Mixed-media volunteer intake, recorder independence and preservation/access separation preserved. BWF MetaEdit remains a lead; sidecars/BagIt, PREMIS and OHMS researched without treating it as a preselected winner.

### 1. Compare two realistic metadata/deposit workflows and an analogous preservation mechanism with portability and recorder compatibility tradeoffs.

Original: [plan](ER12_RUNTIME/frozen-inputs/A5-01/plan.md:15).

Exact original treatment:

> Copy all metadata into one WAV comment field and use filenames to link photographs. Embedded metadata is assumed to survive every editor.

**Independent disposition:** Compared sidecar/BagIt baseline and optional BWF-aware copy workflow; portability and schema/staff effort specified; PREMIS analogue retained. Original one-comment/file-name/universal-survival assumptions rejected with bounded evidence.

### 2. Explain recording identity, embedded/sidecar metadata authority, transcript revisions and links between originals and access copies.

Original: [plan](ER12_RUNTIME/frozen-inputs/A5-01/plan.md:19).

Exact original treatment:

> BWF MetaEdit is a tentative tool; a sidecar-only route is listed without assessing interoperability or staff effort.

**Independent disposition:** Interview/file/revision IDs, source filenames and conflicting metadata, archivist authority, correction approvals, derived_from and separate post-intake storage/access tiers are explicit.

### 3. Research the conditions for optional embedded descriptive metadata without assuming every WAV tool supports the same fields or rewrite behavior.

Original: [plan](ER12_RUNTIME/frozen-inputs/A5-01/plan.md:23).

Exact original treatment:

> Keep transcripts as replaceable text beside the audio. The optional listening copy is authorized by the brief, but the draft has no revision lineage or access-copy relationship.

**Independent disposition:** Lengths, recommendation levels, actual codec, field approval, copy/fixity and versioned round trip are researched, but F1 leaves the named BEXT ASCII domain and conformance/tool distinction materially incomplete.

### 4. Investigate a relevant metadata round-trip/encoding issue or released change and explain how it affects this collection.

Original: [plan](ER12_RUNTIME/frozen-inputs/A5-01/plan.md:27).

Exact original treatment:

> A current tool listing is presumed to establish compatibility. No round-trip history or release-specific behavior has been examined.

**Independent disposition:** Real #29 GUI/CLI/quote case, merged PR #34 and explicit 20.05 link, 23.04 code pages/CSET and 25.04 core-file-read fallback are investigated. End-to-end success remains honestly untested; F1 limits the practical acceptance condition.

### 5. Preserve and investigate this supported optional scope: a human-reviewed plain-text transcript and accessible listening copy alongside the preserved original. It is an authorized option, not a mandatory feature or an established technical capability; recommend conditions, retain it when supported, and explain any evidence-based exclusion.

Original: [plan](ER12_RUNTIME/frozen-inputs/A5-01/plan.md:31).

Exact original treatment:

> Retain a human-reviewed plain-text transcript and accessible listening copy alongside the preserved original as supported owner-authorized optional scope. Support here means that the brief explicitly permits it; technical support, conditions and interoperability still need research. Do not remove it merely because the baseline route lacks it, or silently promote it to mandatory scope.

**Independent disposition:** Authorized optional plain-text human-reviewed transcript and accessible listening derivative are retained. Staff, codec, audience/player and consent inputs remain conditional; no evidence-based exclusion is invented or mandatory scope added.

### 6. Make owner decisions explicit: The collections archivist decides descriptive-field authority; the interviewer approves transcript corrections. Consent review is an external owner input and cannot be replaced by a software default.

Original: [plan](ER12_RUNTIME/frozen-inputs/A5-01/plan.md:35).

Exact original treatment:

> Owner authority is reserved as follows: The collections archivist decides descriptive-field authority; the interviewer approves transcript corrections. Consent review is an external owner input and cannot be replaced by a software default. The draft has not obtained these decisions. Its tentative implementation assumptions cannot substitute for them.

**Independent disposition:** Collections archivist, interviewer and external consent review retain exactly the assigned authority. No owner approval or software consent default is reported.

### 7. Preserve negative constraints: Do not alter received originals during this research, promise lossless edits from a filename extension alone, require automatic speech recognition, or infer consent from possession of a recording.

Original: [plan](ER12_RUNTIME/frozen-inputs/A5-01/plan.md:39).

Exact original treatment:

> Binding exclusions: Do not alter received originals during this research, promise lossless edits from a filename extension alone, require automatic speech recognition, or infer consent from possession of a recording. The draft has no complete trace showing that its assumptions comply; revise the proposal wherever necessary to preserve these exclusions.

**Independent disposition:** All four negative constraints retained. No original modified, extension-based lossless claim, ASR requirement or possession-based consent appears.

### 8. Deliver one coherent evidence-backed research proposal covering obligations 1–8, with recommendations, source/version applicability, useful discoveries, unresolved owner inputs, and a validation table separating checks actually executed from checks merely proposed. Do not report research sources or future tests as executed product validation.

Original: [plan](ER12_RUNTIME/frozen-inputs/A5-01/plan.md:43).

Exact original treatment:

> The draft currently contains no coherent evidence-backed final proposal. Its proposed demos are research/validation ideas only. A complete revision must preserve every obligation, disclose corrections and retained options, and not confuse documentation review with successful product operation.

**Independent disposition:** Coherent complete proposal, source index/version limits, useful opportunities and validation table supplied. Remaining F1 prevents source qualification despite delivery/coverage. No operational tests are claimed.

### Validation status at handoff

Original: [plan](ER12_RUNTIME/frozen-inputs/A5-01/plan.md:47).

Exact original treatment:

> | Check | Status | Evidence or intended observation |
> | --- | --- | --- |
> | External documentation/version review | NOT_RUN | Investigator must retrieve relevant public primary evidence. |
> | Product comparison and history investigation | NOT_RUN | No winner, applicability conclusion or failure-chain finding is supplied. |
> | Pilot scenario walkthrough | PROPOSED | Walk through ordinary use, interruption, correction and incompatible/missing input. |
> | Optional-path compatibility | PROPOSED | Check the option on its own terms, with conditions and owner choices. |
> | End-to-end product operation | NOT_RUN | No installation, deployment or live system access is authorized by this fixture. |
>
> The local existence of this document is input preparation only. It establishes neither the truth of its draft claims nor feasibility of the proposed system. Reconcile research with the draft in the complete final; do not deliver only a critique or patch list.

**Independent disposition:** All five handoff rows reconciled: documentation and comparison/history move to executed research only; scenario and optional-path tests remain proposed; end-to-end stays NOT_RUN. Complete final delivered rather than critique/patch list. Local plan existence is not feasibility proof.

## All critique dispositions and corrected lineage

| Criticism | Final disposition | Independent assessment |
|---|---|---|
| C1 | Accept, with bounded wording | Substantially correct. Investigator S05 omitted an explicit released-history relationship to #29. The draft statement about no end-to-end proof was itself defensible; critic should not equate an explicit link with proof of reproduction success. Final gives the 20.05/#29 link, 2017 PR, GUI/CLI background and bounded uncertainty. Evidence: [E04](evidence/index.md#e04), [E05](evidence/index.md#e05), [E15](evidence/index.md#e15), [E16](evidence/index.md#e16) |
| C2 | Accept | Correct. Authoritative sidecar placement/fixity ambiguous: with the package is not necessarily under data/. Explicit data/metadata/ payload coverage and optional tagmanifest distinction; package validation includes sidecars. Evidence: [E06](evidence/index.md#e06) |
| C3 | Accept and amend | Correct qualification. Broad rewrite-loss assertion was not tied to a specific write operation; FADGI old-reader exception does support bounded metadata loss/ignored fields. Generic rewrite retention unknown; actual old-version/new-chunk reader condition preserved. Evidence: [E01](evidence/index.md#e01), [E02](evidence/index.md#e02), [E20](evidence/index.md#e20) |
| C4 | Amend; reject claim that complementary wording absent | Correct; partial wrong criticism resisted. Draft complementary/not substitutes wording was too broad for access; critic inference that complementary wording is absent was wrong. Both complementary preservation documentation and access/reference substitution are recognized, preserving original plus optional text. Evidence: [E08-indexed](evidence/index.md#e08-indexed) |
| C5 | Accept and clarify | Reasonable planning clarification. Distinct object IDs existed; physical storage/access tier separation not explicit. This is a qualified ambiguity, not proof of an actual storage violation. Separate post-intake preservation/access tiers, distinct identity and derived_from, with transfer bag not deciding permission. Evidence: [E07](evidence/index.md#e07) |
| C6 | Accept | Correct qualification. Release listing is not a hosting or compatibility result; no actual overpromise shown. Retains v3.10.16/3343b78, unknown displayed year and future-hosting/player/consent conditions. Reviewer release API resolves 2025 but does not change candidate honesty. Evidence: [E10](evidence/index.md#e10), [E11](evidence/index.md#e11), [E18](evidence/index.md#e18), [E19](evidence/index.md#e19), [E24](evidence/index.md#e24) |

The release-history omission, sidecar fixity ambiguity, broad rewrite assertion and overbroad transcript attribution are lineage defects that are explicitly qualified in the final. They are not silently re-scored as remaining final failures. The critic’s partial transcript criticism was wrong; the final’s rejection is independently supported. F1 was not diagnosed by the original critic and remains in the final. S15’s index wording contradiction is L1, not a claim that its PR binding was changed.

## Consequential claims and applicability

| Claim | Independent judgment | Governing evidence |
|---|---|---|
| K1: Portable mixed-media BagIt payload and sidecar manifest protection | SUPPORTED_FINAL; lineage C2 corrected | [E06](evidence/index.md#e06) |
| K2: BWF required bext, individual FADGI recommendations and 32/32/256 lengths | FACTS_SUPPORTED_BUT_MATERIAL_FIELD_DOMAIN_INCOMPLETE_F1 | [E01](evidence/index.md#e01), [E02](evidence/index.md#e02), [E20](evidence/index.md#e20), [E21](evidence/index.md#e21) |
| K3: FADGI OriginationDate is local archival file creation date | SUPPORTED_PROFILE_SPECIFIC; not universal recording event date | [E01](evidence/index.md#e01) |
| K4: CSET absent/codepage zero ISO8859/1 and23.04 code-page support | SUPPORTED_AS_FADGI/TOOL_FACTS; does not override ASCII BEXT field domain | [E01](evidence/index.md#e01), [E04](evidence/index.md#e04), [E20](evidence/index.md#e20) |
| K5: 25.04 fallback reading core file | SUPPORTED_EXACT_OPERATION; not all audio/tool default or WAVE rewrite proof | [E04](evidence/index.md#e04) |
| K6: MD5 only WAVE data chunk; full file manifests separate | SUPPORTED; no product execution or codec/transcode equivalence proof | [E03](evidence/index.md#e03) |
| K7: WAVE extension not codec/lossless rewrite guarantee | SUPPORTED | [E13](evidence/index.md#e13) |
| K8: Old BWF version/new chunk reader caveat and generic rewrite uncertainty | SUPPORTED_BOUNDED_FINAL; draft generalized rewrite assertion corrected | [E01](evidence/index.md#e01), [E20](evidence/index.md#e20) |
| K9: #29 hex93/94 GUI/CLI issue, PR34 merge and20.05 release linkage | SUPPORTED_BOUNDED_FINAL; complete modern resolution remains unknown | [E04](evidence/index.md#e04), [E05](evidence/index.md#e05), [E15](evidence/index.md#e15), [E16](evidence/index.md#e16) |
| K10: VHP complementary preservation documents and access/reference substitute | SUPPORTED_INDEXED_PRIMARY; critic partial inference wrong, final correct | [E08-indexed](evidence/index.md#e08-indexed) |
| K11: WAI text for speech/non-speech plus accessible player | SUPPORTED_GENERAL_GUIDANCE; actual player/audience not validated | [E09](evidence/index.md#e09) |
| K12: PREMIS objects/events/agents/rights and derivation relationships | SUPPORTED_AS_ANALOGUE; no implemented conformance claim | [E07](evidence/index.md#e07) |
| K13: OHMS word search/timepoints, viewer version and hosting burden | SUPPORTED_CONDITIONAL_OPPORTUNITY; present service fit unknown | [E10](evidence/index.md#e10), [E18](evidence/index.md#e18), [E19](evidence/index.md#e19), [E24](evidence/index.md#e24) |
| K14: LoC tools/format preferences as investigation support | SUPPORTED_INSTITUTIONAL_CONTEXT; no intake mandate | [E12a](evidence/index.md#e12a), [E14](evidence/index.md#e14) |
| K15: Owner-approved ID/schema/field authority and consent/correction decisions | LOCAL_PROPOSAL_AND_BRIEF_AUTHORITY; not external tool capability or obtained decision | Original brief/local product choice |

Useful alternatives are substantive: mixed-media payload sidecars are independent of recorder metadata; staff-copy BWF repeats a bounded subset; PREMIS supplies event/derivation structure; OHMS adds searchable access/timepoint opportunities at a hosting/maintenance cost. Sidecar-only and ordinary text/audio access remain viable choices. Released changes are investigated as targeted behavior, not universal fix guarantees. No exhaustive catalogue, winner selection, account or deployment was required.

## Proposed and actually executed checks

| Check | Disclosed status | Independent oracle assessment |
|---|---|---|
| Public documentation/source/issue/history review | EXECUTED — research only | Saved source records contain claimed accesses; reviewer independently retrieved governing primary evidence. This does not prove every historical candidate request or any product operation. |
| Plan reveal/control | Investigator EXECUTED; reviser recorded, not rerun | plan-reveal.json and discovery/plan hashes match; sequencing is recorded. No reveal helper rerun by reviewer. This is control evidence, not product validation. |
| BagIt completeness/fixity | PROPOSED / NOT_RUN | All payload files including authoritative sidecars, missing/renamed paths and optional tag manifest are discriminating checks. A valid bag says nothing about meaning or permissions. |
| Identity/interruption/revision walkthrough | PROPOSED / NOT_RUN | Missing/conflicting metadata, duplicate/interrupted transfer, photos/notes, revision approval and restricted access are useful cases for original obligations. |
| Embedded field/encoding round trip | PROPOSED / NOT_RUN | Character reopening can discriminate the chosen writer/readers, including default/explicit encoding if relevant. It cannot alone accept non-ASCII into ASCII-defined BEXT fields; F1 applies. |
| Audio/derivative preservation | PROPOSED / NOT_RUN | Actual codec, whole-file fixity, supported data-chunk digest and listening are distinct oracles. Digest equality across a metadata-only edit tests retained encoded audio bytes; a transcoded derivative is not expected to be byte-equal to its source. Final distinguishes metadata-only vs transcode and does not claim executed equality. |
| Transcript approval and accessible playback | PROPOSED / NOT_RUN | Human correction trace/interviewer approval, visible separate transcript and target-player/user checks are meaningful. A text file or .wav label alone is not accessibility proof. |
| OHMS | PROPOSED / NOT_RUN | Hosting, media/cache linkage and transcript/index search/timepoints are exact service-layer checks if the owners select that option. No current service is invented. |
| End-to-end operation / owner review | NOT_RUN | Appropriate for this planning assignment; no installation, account, deployment or owner decision is required for completion. Unresolved owner inputs do not excuse the publicly answerable field-domain condition. |

Reviewer execution consisted of complete artifact reads, independent primary retrieval and static code/spec inspection, extracted-text navigation, and scoped hash/JSON/cross-reference checks. Those are assessment activities. No media editor, BagIt product validator, transcript-generation system, player, OHMS service or downloaded executable was run. A failed optional Python parser import was replaced by the standard-library HTML parser; no package was installed.

## Delivery, protocol, native, time and billing

**Delivery:** ordinary control final is `stages/reviser/final.md`; it and all required science/maps/indexes are present and complete. No A7/A2 route or other arm was examined. The terminal root has eleven original artifact hashes; all match. All 21 per-stage declared input byte/hash checks match. These demonstrate inspected identity, not source correctness. Original authored source roots contain indexes only; all were read, with no separate hidden disposition/check artifact inferred.

**Protocol:** Reviser final and source-map disclose opening critic/status.json outside input-map. Assignment forbids unlisted paths. Self-report says contents unused; influence cannot be independently established. This is a method violation separate from the semantic F1 finding. The original assignment/input map and [final disclosure](ER12_RUNTIME/runs/A5-01/control/stages/reviser/final.md:151) support this separate nonconformance. The reviewer did not open that status file. No unauthorized assistance is evidenced in the inspected bounded package; absence of full runtime history is not proof that hidden protocol was clean.

**Native:** investigator saved structured activation/complete tool results (thread `01a1240a-44ea-7f12-8674-c9169a9b13ad`, recorded `tokensUsed=163498`, `timeUsedSeconds=616`). Critic science contains active/preterminal records (`132090`, `321`), with terminal native receipt UNKNOWN. Reviser source map contains active/preterminal records (`140508`, `508`); its root terminal summary reports complete/153891/611, but structured terminal native proof is UNKNOWN in the inspected source map. Root T3 completed/no-pending is delivery telemetry and does not substitute for native Goal completion. Saved receipts are records, not live child-context authentication.

**Effective settings and billing:** requested routes/options are recorded (investigator/critic priority; reviser default; max reasoning), but actual/effective provider, model, service tier and billed usage are UNKNOWN. Do not convert recorded native token fields, source counts, wall checkpoints or earlier finish into inference/billing savings. No paired arm/latency or survivorship subset was evaluated.

**Time:** reviewer native Goal started 2026-10-10T04:50:45+00:00; finite review deadline 2026-10-10T05:35:45+00:00; full judgment saved 2026-10-10T05:01:56.323056+00:00, 671.3 seconds after activation, before the 45-minute cap. All axes assessed. Candidate preparation-to-terminal-freeze checkpoints span 1817.804 seconds, and inspected artifacts precede declared stage/whole deadlines. This is checkpoint arithmetic, not verified queue/inference/billing duration or a speed claim. Reviewer completes its native Goal only after the saved judgment; its terminal receipt is a separate evidence file. The original source freeze remains unchanged.

## Limitations and unknowns

- **L1 — minor source-index provenance contradiction:** S15 source-index tail says it was not independently reopened and investigator identity was retained, but S15 is new in the reviser and its source-map records a direct PR retrieval. Binding/URL remains stable and PR claims verify independently. This is a provenance wording defect, not a second material source finding.
- **L2 — bounded source access:** VHP direct retrieval remains 403; relevant indexed official-page text was obtained independently. Reviewer E12 original wwws endpoint timed out; alternate official www endpoint succeeded. These limitations do not justify guessing source contents.
- **L3 — version provenance:** Candidate README/history references used mutable master with explicit pin limitations. Reviewer independently pinned matching bytes at 5b7f3d20167092ff63dcbb5004e8dae2e88a86ea. This does not retroactively establish the candidate exact commit.
- **L4 — validation scope:** No candidate or reviewer product/media operation was executed; this is an authorized planning task. Intended player, codecs, owner approvals, consent and hosting remain unknown. An explicit priority numbering for validation is absent, but intake/fixity precede gated optional embedding/access in the proposal; no material new obligation is inferred.

- Actual candidate provider/model and effective reasoning effort/service tier beyond requested route or returned task metadata: UNKNOWN.
- Critic terminal native Goal tool result: UNKNOWN in inspected allowed science artifacts; critique saves an active receipt/preterminal snapshot only.
- Reviser terminal native Goal structured receipt: UNKNOWN in source-map; terminal root summary reports complete but is not a native receipt. Reviser active receipt/preterminal snapshot are preserved.
- Whether every candidate access obeyed the allowed input map or whether status.json influenced reasoning: UNKNOWN; one forbidden read is explicitly disclosed.
- Billing, cached/input/output accounting, effective inference occupancy, cost or latency savings: UNKNOWN; no paired outcome examined.
- Actual volunteer file codec/chunks, chosen writer/readers and current local interoperability: UNKNOWN; no files/toolchain supplied.
- Consent permissions, reviewer identity/policy, field-authority decisions, transcript correction approvals, target audience/player and access encoding: unresolved external owner inputs, UNKNOWN.
- Current OHMS hosting availability, deployment, compatibility and accessibility for the society: UNKNOWN; public project/release documentation is not service validation.
- Exact candidate commit for mutable master source requests and exact per-request timestamps where not exposed: UNKNOWN.

External owner choices may remain open after investigation. The publicly answerable BEXT field-domain distinction is different: its omission is why this completed, useful proposal fails source qualification. No original assessment was replaced, no source freeze was changed, and no repair, publication or candidate feedback was performed.

## Original inspected hashes

All 27 fully inspected original files are recorded below; original paths remain the authority for their bytes. Hashes identify the inspected editions only.

| Original path | Bytes | SHA-256 |
|---|---:|---|
| [ER12_RUNTIME/assessment/RUBRIC-v1.md](ER12_RUNTIME/assessment/RUBRIC-v1.md) | 2790 | `a93d0456d53b3519883ec517135688d2bbb4c12eb62f9a0b6fbe1bf2615fe19b` |
| [ER12_RUNTIME/frozen-inputs/A5-01/brief.md](ER12_RUNTIME/frozen-inputs/A5-01/brief.md) | 3440 | `e26ff5f138c34638ec94bc7d4ff3bf93a23f27ddca1a17cca3090868737430e8` |
| [ER12_RUNTIME/frozen-inputs/A5-01/plan.md](ER12_RUNTIME/frozen-inputs/A5-01/plan.md) | 6139 | `b80e30c3938344528a49c1b43144af18f14b0d8ed27a2603b845042467e4e067` |
| [ER12_RUNTIME/runs/A5-01/control/terminal-science-freeze-root.json](ER12_RUNTIME/runs/A5-01/control/terminal-science-freeze-root.json) | 7733 | `c021f337b1389fd3d3d9f346e2643c4c0d9bc0d6adc0ca7ec6443765165b0753` |
| [ER12_RUNTIME/runs/A5-01/control/inputs/brief.md](ER12_RUNTIME/runs/A5-01/control/inputs/brief.md) | 3440 | `e26ff5f138c34638ec94bc7d4ff3bf93a23f27ddca1a17cca3090868737430e8` |
| [ER12_RUNTIME/runs/A5-01/control/stages/investigator/assignment.md](ER12_RUNTIME/runs/A5-01/control/stages/investigator/assignment.md) | 3712 | `a70f58babd29a06d1d86b0c5f6ddc12ac6ee783ee27b8f5eb4536fb39c8674be` |
| [ER12_RUNTIME/runs/A5-01/control/stages/investigator/input-map.json](ER12_RUNTIME/runs/A5-01/control/stages/investigator/input-map.json) | 714 | `fab423b91e59d7e686a1cd7b8bc7aae71a5b994a7cb64640548564145c4c83fb` |
| [ER12_RUNTIME/runs/A5-01/control/stages/investigator/freeze.json](ER12_RUNTIME/runs/A5-01/control/stages/investigator/freeze.json) | 1654 | `41c6bfa49bbb6eea004b972aa8babf2187ee9e7c33812762c152d262f17b6da2` |
| [ER12_RUNTIME/runs/A5-01/control/stages/investigator/source-map.json](ER12_RUNTIME/runs/A5-01/control/stages/investigator/source-map.json) | 14278 | `989bfca95595aa52a37d498dde4ccd8c63aed4c763010faf9a3ff09541f8edd2` |
| [ER12_RUNTIME/runs/A5-01/control/stages/investigator/sources/index.md](ER12_RUNTIME/runs/A5-01/control/stages/investigator/sources/index.md) | 3009 | `2141fb8f54e78439aa8118c05ea55ba45472441531324a9dd23d973bf6c1b7fd` |
| [ER12_RUNTIME/runs/A5-01/control/stages/investigator/discovery.md](ER12_RUNTIME/runs/A5-01/control/stages/investigator/discovery.md) | 8637 | `da02e0037cc5846af2a4ae08375b5ea8f2684f297034daefed00d9e1a0c17051` |
| [ER12_RUNTIME/runs/A5-01/control/stages/investigator/draft.md](ER12_RUNTIME/runs/A5-01/control/stages/investigator/draft.md) | 22491 | `e41ae67002ae66424e0df685a71cf1d935ad55acd6c3d4eee3165d1ad60c29f8` |
| [ER12_RUNTIME/runs/A5-01/control/stages/investigator/revealed-plan.md](ER12_RUNTIME/runs/A5-01/control/stages/investigator/revealed-plan.md) | 6139 | `b80e30c3938344528a49c1b43144af18f14b0d8ed27a2603b845042467e4e067` |
| [ER12_RUNTIME/runs/A5-01/control/stages/investigator/plan-reveal.json](ER12_RUNTIME/runs/A5-01/control/stages/investigator/plan-reveal.json) | 426 | `520c07ec1924ad4535b2d78143ee48f184e60baea6dd049c2289c2eadc03ade4` |
| [ER12_RUNTIME/runs/A5-01/control/stages/investigator/native-goal-record.json](ER12_RUNTIME/runs/A5-01/control/stages/investigator/native-goal-record.json) | 3792 | `825d039d9fc9e285ebc8d78d8f934b9e9d9b5d817e5ea29235477e13b82abdf8` |
| [ER12_RUNTIME/runs/A5-01/control/stages/critic/assignment.md](ER12_RUNTIME/runs/A5-01/control/stages/critic/assignment.md) | 3306 | `18861ab244da5be515ce905986d75df8f4740b88fc4ab84a476c0742fbae53a4` |
| [ER12_RUNTIME/runs/A5-01/control/stages/critic/input-map.json](ER12_RUNTIME/runs/A5-01/control/stages/critic/input-map.json) | 1390 | `4451c974279525cf72629935c3210397c1b3c94957b3c2bdd5afc98ff550006a` |
| [ER12_RUNTIME/runs/A5-01/control/stages/critic/freeze.json](ER12_RUNTIME/runs/A5-01/control/stages/critic/freeze.json) | 3134 | `2901cb24fc7708cb1c0d5ddf7b88890931b0df419a57f9455a8aa7d0f72882ae` |
| [ER12_RUNTIME/runs/A5-01/control/stages/critic/source-map.json](ER12_RUNTIME/runs/A5-01/control/stages/critic/source-map.json) | 16086 | `121caa291545a4943864e069fbe18b21df1007ee8df0298d9f6188a44ffd073d` |
| [ER12_RUNTIME/runs/A5-01/control/stages/critic/sources/index.md](ER12_RUNTIME/runs/A5-01/control/stages/critic/sources/index.md) | 8050 | `0f01b1f353975e6a175627ca04fc84206a3555e039002646c66120137e9937bd` |
| [ER12_RUNTIME/runs/A5-01/control/stages/critic/critique.md](ER12_RUNTIME/runs/A5-01/control/stages/critic/critique.md) | 13212 | `a68cfe869644775d1a1894702a8877941e7e95b7353bcf4861cd32cd641bcf34` |
| [ER12_RUNTIME/runs/A5-01/control/stages/reviser/assignment.md](ER12_RUNTIME/runs/A5-01/control/stages/reviser/assignment.md) | 3286 | `dd8f4e22a3b4163e3c12e9cce26f170f8b6b6d745811db0f35537b361fe15a79` |
| [ER12_RUNTIME/runs/A5-01/control/stages/reviser/input-map.json](ER12_RUNTIME/runs/A5-01/control/stages/reviser/input-map.json) | 1768 | `723c4fe4cbefb17e7b3b5bdabc9281c18804f7ae4e2ab0c502ffb9ebe95c3421` |
| [ER12_RUNTIME/runs/A5-01/control/stages/reviser/freeze.json](ER12_RUNTIME/runs/A5-01/control/stages/reviser/freeze.json) | 3972 | `99c6a90f9fb95d726972e1f24b1c7dd6aa884294aa9f76f827effd8756f3abf8` |
| [ER12_RUNTIME/runs/A5-01/control/stages/reviser/source-map.json](ER12_RUNTIME/runs/A5-01/control/stages/reviser/source-map.json) | 30666 | `20008d9003339f32b9ed0eb1851a7f255a4a3c1a4944f619473233146d17ac8d` |
| [ER12_RUNTIME/runs/A5-01/control/stages/reviser/sources/index.md](ER12_RUNTIME/runs/A5-01/control/stages/reviser/sources/index.md) | 25582 | `e60f1ec1c346e5b3827672995093e53e32a82cbb4284266cd00f0afffcfdf611` |
| [ER12_RUNTIME/runs/A5-01/control/stages/reviser/final.md](ER12_RUNTIME/runs/A5-01/control/stages/reviser/final.md) | 30277 | `dbe19a591e0be226109bb3b20f2b9bb34687c101be5ad0753eef31b187a1dbdf` |
