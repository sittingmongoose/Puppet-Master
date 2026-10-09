# Critique — community-audio oral-history research

**Candidate:** A-M08-B / treatment / S02  
**Scope:** Exact critic assignment and input map; the S02 brief; complete research draft, discovery, source map and frozen plan; declared source evidence; and public primary sources listed in source-map.json. No parent, counterpart, evaluator, campaign/history, or unrelated repository material was read. No product or runtime check was run.

## Overall assessment

The research draft is coherent, evidence-aware and substantially meets O1–O6. It separates preservation, editorial records and public access; treats ASR as a draft; compares alternatives with conditions; keeps uncertain product behavior open; and labels operational checks as proposed. Its precise v3.10.15 OHMS code reading is consequential, and the release chain is relevant. I found no basis to reject the recommendation or claim that proposed validations ran.

## Material findings

### M1 — Narrow the prohibition on ASR “naming” a person

The sentence “Never permit ASR to name/identify a person” conflates transcription of a spoken proper name with assigning a speaker’s identity. The pinned Whisper model card cautions against subjective classification, says diarization/classification is not robustly evaluated, and warns about recognition of individuals. That supports prohibiting model-based speaker identity attribution. It does not establish that transcripts must omit spoken names. Elsewhere the draft appropriately includes proper-name errors in evaluation.

**Recommendation:** prohibit ASR from inferring or assigning speaker identity/attributes. Spoken names may remain in a draft transcript, subject to human checking and consent/access review before publication. This preserves the privacy safeguard without suppressing ordinary transcript content. [S12]

### M2 — Make P4’s rejected target explicit

The P4 row correctly recognizes that one whole-record visibility flag cannot implement the brief’s interval and derivative restrictions. A Boolean status may still be useful and sufficient to hide an entire record when that is the consent decision. The rejected part is treating the single flag as the complete access model for this collection.

**Recommendation:** label the disposition “Rejected as the sole policy model” (or “Correction” if the rubric treats any retained use as correction). A whole-record flag may remain as one derived control, while authoritative decisions scope metadata, audio, transcript, translations, indexes/excerpts and restricted intervals. The body already makes most of this distinction, so this is chiefly classification clarity. Vendor manuals describe object/media/index permissions, not the interval-wide guarantee required here. [S07–S11, S15]

### M3 — Preserve language-level evaluation results

P6’s correction is sound: English-only clips cannot validate a multilingual collection. WER/CER and human review are useful, but the protocol should report results separately by language and salient condition, choose WER versus CER according to script/tokenization, and define the sample and reference-transcript procedure before comparing systems. Avoid a pooled score that hides a weak language or dialect. A pilot across languages may be expensive; the brief leaves language inventory and review capacity unknown, so agree a feasible coverage promise rather than implying one short clip establishes performance.

The draft already calls for explicit normalization and language/condition differences; these additions make that safeguard operational. Whisper’s model card reports uneven results and recommends robust intended-context evaluation. [S12–S13]

## Review of every exact plan clause

| Clause | Disposition review |
|---|---|
| **P1 — batch ASR then publish text/audio** | **Correction supported.** Consent screening, human review and audience-appropriate derivatives are necessary here. Model output is not a reviewed transcript. Retain human-index/descriptive-record fallback where ASR adds little value. [S12, S15] |
| **P2 — one replacement text file** | **Rejecting it as the only authoritative record is supported.** Versioned, attributed, timed records preserve review/provenance; TXT/WebVTT remain useful exports. Ensure withdrawn/restricted prior versions follow the same rights decisions and cannot leak through history. “Under the same rights rules” is present, but add this to validation. [S06, S15, S18] |
| **P3 — full text and general database index** | **Correction supported.** A conventional database index may be adequate for 2,000 interviews, but benchmark it. Test snippets, suggestions, facets, APIs and exports, not only result rows. No source establishes that a separate search service is required. |
| **P4 — one consent flag hides the public recording** | **Substance supported; qualify the rejected target as in M2.** Whole-record suppression can use a flag; it is insufficient for interval and multi-derivative restrictions. Resolve withdrawal/retention against agreements and policy. |
| **P5 — WAV originals and MP3 listening copies** | **“Already covered, with a format correction” is defensible.** Retain received digital source bits; do not imply every source must be WAV or converted to WAV. LC’s BWF/LPCM preference applies to archival-master/reformatting contexts; it does not mandate conversion of every already-digital file. MP3 is an access choice, not a preservation rule. [S16] |
| **P6 — a few English clips** | **Correction supported; strengthen per M3.** Use representative language/condition coverage and human references; set thresholds with stakeholders and omit ASR in strata where it fails them. [S12–S13] |

## Consequential claims and validation review

- **OHMS v3.10.15:** Direct reading of pinned Transcript.php supports the draft: split_and_convert_time parses millisecond fields but adds only integer seconds; displayed/seek values are whole seconds. mapIndexSegmentWithTranscript tests integer index seconds in a half-open interval and breaks at the first match. The claim is correctly version-scoped. The proposed millisecond-boundary and two-index-point tests discriminate this behavior and were not run. [S20]
- **Release/evolution chain:** v3.10.12 navigation fix, v3.10.14 legacy no-timecode PDF fix and v3.10.15 cache-access samples form a relevant chain. Release notes show reported fixes, not independent proof of deployment behavior. Whisper v20250625 is useful engineering evolution, not collection-specific accuracy evidence. [S03–S05, S14, S21]
- **Aviary pricing:** $4,800 is correct for one 120,000-minute pass at the displayed $0.04/min estimate. The page lists separate transcription, translation and time-alignment services and says estimates may change and usage is extra. Keep this scoped to one transcription pass; it excludes a combined multi-service workflow, subscription, review, reruns, storage and egress. The draft already states most exclusions. [S19]
- **Product fit/access:** OHMS, Aviary OHMS, Mukurtu v4 and Omeka S are materially different approaches. The draft does not assert that one provides interval deletion/access enforcement. Mukurtu All/Any semantics are correctly scoped to media assets; Aviary/Omeka object privacy does not prove interval ACLs. Treat community protocol adoption and deletion-versus-retention as stakeholder/agreement decisions. [S07–S11, S15]
- **Preservation/mechanisms:** Decimal storage estimates recalculate correctly for stated PCM and 64-kbit/s assumptions. BagIt fixity and PREMIS metadata are not represented as backup or authorization systems. No capacity, restore or integrity check was performed. [S16–S18]

## O1–O6 coverage

- **O1:** Met. Oral-history, hosted, community-governed and general catalog paths, plus topic indexing, selective ASR and preservation mechanisms are compared. Fit remains conditional on staffing, governance, rights, cost and languages.
- **O2:** Met for selected mechanisms. Exact OHMS behavior and relevant units/defaults are recorded; vendor documentation is distinguished from an independent audit. Runtime support, vendor terms/storage/exit and interval behavior remain open checks.
- **O3:** Met. The release sequence and Whisper changelog are relevant evolution evidence; they are not misreported as executed validation.
- **O4:** Met with M2 disposition wording refinement. Every P clause has an explicit category and rationale.
- **O5:** Met. Alternatives, constraints, uncertainty, withdrawal decisions and disagreement are retained. M1 prevents an ASR safeguard from exceeding its evidence.
- **O6:** Met. Six validation groups are meaningful and explicitly unexecuted. Add M3’s sampling/scoring protocol and P2’s prior-version access path.

## Minor findings

1. Label $4,800 “one transcription pass” wherever repeated; translation and forced alignment have separate displayed rates. [S19]
2. Carry into the workflow that English translations are derived outputs and source-language transcripts remain distinct. This is already said in analysis. [S12]
3. Stable segment IDs/rights metadata are good requirements, not capabilities demonstrated for every candidate; keep that distinction clear.
4. Language inventory, source formats, staffing, budget and consent terms are unknown and correctly remain decisions.

## Executed versus proposed

Executed: file review and public document/source-code inspection recorded in source-map.json. Not executed: demos/accounts, OHMS runtime, imports/exports, audio or transcription accuracy, access/security tests, capacity measurement, BagIt validation, backup restoration or legal review. No candidate draft was edited. No private provider/account data was accessed.
