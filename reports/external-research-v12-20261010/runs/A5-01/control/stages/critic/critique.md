# Independent critique — volunteer oral-history deposit package

**Stage:** critic, run A5-01-control. **Reviewed:** the frozen brief, complete investigator discovery/draft/source map, revealed plan and plan-reveal record; then the carried source index and the primary evidence listed in this reviewer's `sources/index.md`. **Scope:** critique only. This is not a replacement proposal, a repair to the investigator's files, or product validation. No media, executable, metadata editor, BagIt validator, player, account, or OHMS service was run.

## Assessment

The draft is coherent and covers all eight obligations. Its strongest decisions are the format-agnostic sidecar baseline, stable IDs and explicit `derived_from` relationships, archivist/interviewer ownership, the conditional BWF path, and keeping the optional transcript/listening copy in scope. It correctly distinguishes BagIt fixity from descriptive truth and long-term storage, and labels the hands-on checks proposed or NOT_RUN. The useful unfamiliar discovery is OHMS, correctly scoped as a possible later access layer rather than the deposit or preservation format.

The recommendation is broadly supportable as a planning choice. Two material qualifications need attention in a fresh complete revision: the release history directly associates an ASCII-support correction with issue #29, and the BagIt proposal does not say where its authoritative sidecar records live or how their own fixity is covered. A few other assertions need more careful attribution or qualification. None of these findings supports reducing the requested scope or removing the optional access path.

## Findings

### C1 — Material wrong: issue #29 is explicitly referenced by the 20.05 release history

The investigator's S05 record says “no release/commit relationship confirmed.” That is contradicted by the official BWF MetaEdit history: the 20.05 entry says “Improve ASCII support (Issue #29, #63)” (S04, entry dated 2020-05-28; S05, issue opened 2017-10-18 and marked closed). The draft's §4 acknowledges the 20.05 change but does not report that direct issue reference, and its statement that the history does not establish which release addressed #29 is too cautious as written.

The evidence supports a narrower conclusion: the 20.05 change is explicitly linked to #29, but a release-note link does not prove complete resolution of the reporter's particular curly-quote case, every code-page path, or interoperability with other tools. Preserve that remaining uncertainty while correcting the source-map claim. This is material to obligation 4's requested issue/release investigation. Evidence: [S04](sources/index.md#s04), [S05](sources/index.md#s05).

### C2 — Material incomplete: BagIt fixity coverage of the authoritative sidecar is ambiguous

The draft makes the sidecar authoritative and says the BagIt payload manifest verifies the package, but it never fixes the sidecar's location in the bag. RFC 8493's required payload manifest lists files under `data/`; separate tag files have optional `tagmanifest` coverage (S06, §§2.1.2–2.2.1, 2.4). If the CSV/JSON descriptions and revision log are payload files under `data/`, the payload manifest can cover them. If they are tag files outside `data/`, the proposal needs to say how they are covered, for example by a tag manifest. As written, the authoritative records that preserve identity and transcript history could fall outside the stated payload fixity check.

Make the package layout and fixity scope explicit in the reviser's proposal and corresponding proposed validation. This is a proposal gap, not a claim that BagIt cannot carry the records. Evidence: [S06](sources/index.md#s06).

### C3 — Unsupported as established behavior: metadata loss on rewrite

Draft §1's workflow comparison says not every recorder/editor/player “supports the same chunks or preserves them on rewrite.” The cited evidence supports field/profile variation and that some readers may not expose metadata; FADGI also documents version-specific ignored metadata, while the BWF MetaEdit README describes its own functions. I found no cited primary evidence in the carried index establishing general rewrite-loss behavior across the possible volunteer toolchain. The draft sensibly proposes testing the exact chain, so this need not change the recommendation: phrase rewrite loss as an unverified risk/hypothesis and keep the proposed representative round-trip check. Evidence for the bounded compatibility claims: [S01](sources/index.md#s01), [S02](sources/index.md#s02), [S03](sources/index.md#s03).

### C4 — Unsupported attribution: VHP does not say transcripts are “complementary, not substitutes”

Draft §§2, 5 and 8 attribute that formulation to the Library of Congress Veterans History Project. The official page's searchable text says transcripts are welcome but not required, describes them as an access/reference substitute for recordings, asks for transcriber/editor/date identification, and asks that changes from the recording be indicated. My direct page-open attempt returned an internal retrieval error; the official search result exposed the page text, so this is a bounded source-access observation rather than a line-by-line page review. That text does not support the draft's quoted contrast. The brief itself requires the transcript/listening option to remain alongside the preserved original, so keep that local preservation decision and attribute it to the brief rather than VHP. Evidence and access limitation: [S08](sources/index.md#s08).

### C5 — Minor locator/wording: “separately” is only specified at the object/relationship level

The draft assigns distinct IDs and `derived_from` links and says never to edit a received source in place. That is a sound logical separation. Its recommended BagIt package can nevertheless contain both originals and access files, and the proposal does not say whether the society also expects different storage areas or access controls. The brief says received audio is preserved separately from access copies. Clarify whether the intended boundary is distinct files/identities only or also a separate preservation/access tier; do not let a mixed transfer package decide that owner policy by accident. If the brief means object-level separation only, the existing IDs and relationships substantially satisfy it. This uncertainty does not remove the supported option. Evidence for the useful object/derivation pattern: [S07](sources/index.md#s07).

### C6 — Minor locator/wording: OHMS is described accurately as a candidate, not a proven fit

The UK Libraries page supports word-level search linked to interview moments and a free-account path; the viewer release page identifies v3.10.16 at commit `3343b78` (S10–S11). The draft correctly notes that hosting, media linkage, access and consent remain to be evaluated. Preserve the exact release tag/commit and avoid implying that a recent observed release establishes compatibility with this society's files or a current hosting offer. No OHMS operation was executed.

## Obligation and revealed-plan disposition review

| Obligation / plan issue | Critic assessment |
|---|---|
| **1. Compare two workflows and an analogous preservation mechanism.** The plan's one-comment-field and filename-link proposal is replaced. | **Met.** The sidecar/BagIt baseline and optional BWF-aware copy workflow have meaningful portability, staff-schema, field and reader tradeoffs. PREMIS is framed as an analogy/pattern, not a requirement. Clarify sidecar fixity per C2. No need to select a tool now. |
| **2. Identity, metadata authority, transcript revisions, original/access links.** | **Met.** Interview/file/revision identities, submitted names, preserved conflicting statements, interviewer approvals, provenance and `derived_from` relationships are explicit. Storage/access separation still needs the bounded clarification in C5. |
| **3. Conditions for embedded metadata.** The draft's universal survival assumption is rejected. | **Met with C3 qualification.** Field-specific FADGI bounds, recommended/optional status, CSET default, actual WAVE/container check, archivist approval, restricted data and exact-version round-trip are addressed. Do not state untested rewrite loss as observed. |
| **4. Round-trip issue or released change.** The plan's current-listing assumption is rejected. | **Substantively met, but correct C1.** The 20.05 history line explicitly references #29; 23.04 and 25.04 provide relevant later encoding changes. None alone proves interoperability or complete correction for every chain. |
| **5. Human-reviewed transcript and accessible listening copy as supported optional scope.** | **Met.** The option is retained, stays optional, is tied to interviewer review, consent/access conditions, a tested player and transcript, and is not excluded for lack of evidence. The draft correctly marks product checks NOT_RUN. Correct VHP attribution per C4. |
| **6. Named owners and external consent review.** | **Met.** The collections archivist controls descriptive-field authority; interviewer approves corrections; consent review remains external and possession is not consent. “Unreviewed/restricted” is explicitly a recommendation pending approved policy, not a reported decision. |
| **7. Negative constraints.** | **Met.** No received original was touched; no extension-based lossless promise, ASR requirement or inferred consent is introduced. The draft separates whole-file fixity from the data-chunk digest and says the latter is not full validation. |
| **8. Coherent proposal, evidence, discoveries, owner inputs and validation status.** | **Met with findings above.** The draft is a coherent research proposal, not just a patch list. Source limitations and alternatives are visible. Its table separates research/control operations from proposed product checks and NOT_RUN operations; the report does not claim a product was installed or exercised. Ensure the next revision carries the release-link and BagIt scope corrections without silently weakening the optional access path. |

## Preservation and validation conclusions

The proposal preserves the crucial distinction between received bytes and derived objects, and its IDs and event/revision trail are useful. The sidecar remains the chosen authority; BWF embedding is a bounded, optional copy workflow. BagIt integrity is explicitly limited to the manifest relationship and PREMIS is not represented as long-term preservation by itself. The one open fixity detail is whether the authoritative sidecars are payload or tag files and, accordingly, which manifest covers them. The access-file storage boundary is also not fully decided.

The disclosed executed items are research/document review and the investigator's recorded reveal-helper control operation; neither is product validation. That distinction is correct. The reviewer did not rerun the reveal helper or independently validate the investigator's local control operation. The pilot walkthrough, BagIt sample, encoding round trip, audio/derivative check, accessibility review and end-to-end product/service operation remain proposed or NOT_RUN. No future check should be relabeled executed absent actual evidence.

## Native Goal record

The native Goal response was directly observed. The actual activation receipt and the pre-terminal `get_goal` snapshot are preserved here without conversion:

```json
{
  "activation_receipt": {
    "threadId": "01a12415-3f65-7fc1-9069-bcf56b4dc478",
    "objective": "ER12 critic stage, run A5-01-control: execute ER12_RUNTIME/runs/A5-01/control/stages/critic/assignment.md; preserve complete brief scope and save required outputs before completing this native Goal.",
    "status": "active",
    "tokensUsed": 0,
    "timeUsedSeconds": 0,
    "createdAt": 1791606756,
    "updatedAt": 1791606756,
    "remainingTokens": null,
    "completionBudgetReport": null
  },
  "pre_terminal_snapshot": {
    "threadId": "01a12415-3f65-7fc1-9069-bcf56b4dc478",
    "objective": "ER12 critic stage, run A5-01-control: execute ER12_RUNTIME/runs/A5-01/control/stages/critic/assignment.md; preserve complete brief scope and save required outputs before completing this native Goal.",
    "status": "active",
    "tokensUsed": 132090,
    "timeUsedSeconds": 321,
    "createdAt": 1791606756,
    "updatedAt": 1791607077,
    "remainingTokens": null,
    "completionBudgetReport": null
  },
  "goal_provider_model_provenance": "UNKNOWN"
}
```

Goal provider/model provenance was not exposed by the native response and is **UNKNOWN**. The saved timestamps are raw epoch values from the tool; no UTC conversion or receipt was fabricated.

## Reviewer conclusion

The investigator's direction is useful and the option-preservation behavior is correct. The next complete revision should correct the 20.05/#29 linkage, state exactly how authoritative sidecars are covered by BagIt fixity, and keep the VHP/rewrite claims within what the inspected evidence says. No final proposal was written or repaired in this critic stage.
