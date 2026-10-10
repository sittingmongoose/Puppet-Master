# Independent critic review — A7-02-control

**Stage:** critic · **Review date:** 2026-10-10 UTC  
**Conclusion:** The investigator proposal is responsive to the complete brief and reconciles the exact released plan. I found no material wrong, material incomplete, or unsupported consequential claim. One minor source-record wording issue is noted below. The remaining group-lead choices are honestly unresolved owner inputs. This is a critique, not a final proposal or an instruction to reduce scope.

## Review scope and method

I read the complete brief, discovery, draft, source map, source index, revealed plan, and the listed plan-reveal record. I independently opened the cited official Zotero and JabRef documentation, Crossref documentation, the JabRef issue and PR/release history, and the linked source and unit-test files at commit d687c08. I also compared the local discovery and revealed-plan SHA-256 values with the plan-reveal record; both matched. No application, exporter, API request, downloaded code, or product test was run in this review. Browser retrieval of public evidence and the local plan-hash comparison are research/workflow checks, not product validation.

## Brief obligations and exact-plan dispositions

| Obligation | Released-plan assumption | Draft locator and critic assessment |
|---|---|---|
| **1. Compare two workflows and an analogous reconciliation mechanism.** | revealed-plan.md, §1 proposes normalized-title merge and automatic DOI metadata replacement. | draft.md, “Workflow comparison and reconciliation precedent,” compares Zotero, JabRef, and Crossref’s typed relation model. The draft limits the Crossref comparison to an analogy and rejects title normalization or DOI metadata as merge/overwrite authority. Zotero documents candidate detection plus field-level merge, but its algorithm page is dated 2017; JabRef documents edit-distance candidates and keep-both/merge choices. **Complete; plan assumption correctly rejected.** [S01, S06–S08, S16–S18] |
| **2. DOI-less records, versions, duplicate detection, and preservation.** | revealed-plan.md, §2 names Zotero, leaves JabRef unassessed, and leaves export loss undecided. | draft.md, “Recommendation,” “A practical monthly flow,” and “Identity, DOI-less entries and version relationships” separate immutable submissions, reviewed citation fields, citable manifestations, and version links; allow local IDs and manual handling without DOI; require editor review and keep uncertain candidates. It does not equate similar titles or DOI equality with identity. **Complete; adds the required alternative and preservation model.** |
| **3. Optional export and identifier enrichment.** | revealed-plan.md, §3 excludes records without identifiers and offers no manual route. | draft.md, “Optional identifier enrichment” and “Exact clause-by-clause disposition,” clause 3, uses existing-DOI retrieval and text-based Crossref search as candidate paths, retains no-match records, and requires an editor to decide field corrections. JabRef’s identifier dialog defaults to original fields, while DOI/ISBN completion requires an identifier; the proposal correctly distinguishes this from a separate full-text retrieval control. Crossref’s public API documents search, DOI retrieval, no signup, limits, and backoff. **Complete; plan exclusion corrected.** [S08, S13–S15] |
| **4. Released failure/fix history and affected records/versions.** | revealed-plan.md, §4 has no release history and proposes a generic three-DOI import. | draft.md, “Versioned import/export failure and applicability,” identifies JabRef 5.15, the BibTeX 13905--13911 case, RIS SP/EP failure, PR #15315 at d687c08, and the alpha.6 note for #15106. It narrows applicability to the reported range case, distinguishes formatter tests from end-to-end export, and leaves pinned-build export as **proposed, NOT_RUN**. Primary issue, PR, release note, and tests support that bounded account. **Complete; plan’s generic demo correctly displaced by a relevant, versioned regression fixture.** [S11, S12, S20, S21] |
| **5. Preserve authorized optional downloadable bibliography.** | revealed-plan.md, §5 correctly treats this as permitted optional scope rather than a mandate or proven capability. | draft.md, “Optional public bibliography export” and validation table retain an opt-in .ris path subject to a pinned producer/consumer fixture; Zotero documents RIS import/export routes and JabRef documents conversion, while Zotero warns that interchange loses data. The proposal gives conditions and does not assert round-trip success or exclude the option. **Complete; option retained with evidence-based conditions.** [S02–S05, S09, S20] |
| **6. Make owner decisions explicit.** | revealed-plan.md, §6 records the assigned authority but calls it unobtained. | draft.md, “Corrections, optional improvements, retained coverage and open inputs,” correctly treats editor approval and submitter credit/original text as binding brief requirements. It leaves presentation style and acceptable lookup providers to the group lead. **Complete; owner authority is preserved rather than reopened.** |
| **7. Preserve all negative constraints.** | revealed-plan.md, §7 lists no paywalled downloads, contributor accounts, universal DOI identity, or silent preprint/journal merge, while asking for a compliance trace. | draft.md, “Recommendation,” steps 1–6, “Negative constraints preserved,” and “Rejected,” gives a trace for all four. It avoids accounts/sync, paper retrieval/attachments, DOI-only identity, and silent version merging. **Complete; no constraint conflict found.** |
| **8. Deliver a coherent evidence-backed proposal and separate executed from proposed checks.** | revealed-plan.md, §8 says the plan is not yet a coherent proposal and its demo ideas are not executed tests. | The whole draft.md is a complete proposal with workflow comparison, alternatives, applicability, useful Crossref/JabRef discoveries, explicit owner inputs, and proposed validation. Its “Validation status” separates research and the plan-release workflow gate from product behavior; all product checks remain **NOT_RUN**. The plan-reveal record’s discovery and plan hashes match the files reviewed. **Complete; no research source or proposed test is misreported as product validation.** |

## Claim review, conditions, and preservation

- **Workflow evidence:** Zotero’s primary duplicate page states title/DOI/ISBN plus year and creator conditions, field-level merge selection, library-local detection, and no false-positive exclusion control; the proposal preserves the page’s 2017 date caveat. JabRef’s current living docs support edit-distance candidates, keep-both/merge choices, field review, and DOI/ISBN enrichment conditions; the draft correctly avoids treating these unpinned docs as proof of a selected build’s behavior. [S01, S06–S08]
- **Version relationships:** Crossref’s schema and preprint guidance support separate records with typed deposited relations, including isPreprintOf, and the preprint-to-journal matching material describes candidate matching with incomplete coverage. The draft labels this provider model as an analogy, keeps relations separate from merge identity, and treats absent links as inconclusive. [S16–S19]
- **Failure chain:** The issue describes the specific affected encoding and output fields. The PR’s merged change and source/tests cover page parsing with ASCII and Unicode separators; the release note ties #15106 to alpha.6. The draft appropriately does not infer full exporter correctness from helper tests or a release note. [S11, S12, S20, S21]
- **Preservation and user authority:** The recommendation preserves raw submitted text and submitter credit separately from reviewed fields and merge decisions. A lookup is evidence for the editor, not automatic truth; a related preprint and journal article remain separate records. This satisfies the brief’s editor and submitter roles while leaving the group lead’s assigned choices open.
- **Export and negative constraints:** RIS is evidenced as a practical interchange format, but the proposal does not call it lossless and conditions use on actual fixtures. It explicitly keeps public output to citations and links and avoids downloaded full text and contributor accounts.
- **Validation:** No application, API, importer/exporter, or source-code test was run by the investigator according to the draft, and none was run by this critic. This is consistent with the planning-only brief. The JabRef source tests and release record are external evidence, not local executed validation.

## Classified findings

### Material wrong

None identified.

### Material incomplete

None identified against obligations 1–8 or the plan’s clause-by-clause dispositions.

### Unsupported

None identified among consequential claims checked against the carried primary sources. Living documentation and prerelease limits are stated where applicable.

### Minor locator/wording

- **source-map.json, sources[S05].released_version_or_commit and sources/index.md, S05:** the currently served Zotero bibliography page visibly says “Last updated 2025-12-12.” The record correctly has no pinned application release, but “no release version/date pinned on the retrieved page” can be read as saying the page has no date. Preserve the page-update date separately from application release applicability. This does not change the optional-RIS conclusion. [S05; independently opened 2026-10-10]

### Honestly unresolved external input

- **draft.md, “Owner decisions still required”:** the group lead has not chosen citation presentation style or acceptable lookup provider(s), including whether a polite-pool contact email is acceptable. Those are decisions expressly assigned to that owner in brief obligation 6, not research facts or defects in the proposal. The draft leaves them open without using them to avoid answerable research.

## Native Goal fields observed before terminal

The actual create_goal response returned threadId=01a12424-e6a2-7603-b28b-a9af750da8b9, the exact objective from freeze.json, status=active, tokensUsed=0, timeUsedSeconds=0, createdAt=1791607794, updatedAt=1791607794, remainingTokens=null, and completionBudgetReport=null. No separate activation receipt ID, provider/model provenance, or terminal timestamp was exposed: **UNKNOWN** in this pre-terminal artifact.

