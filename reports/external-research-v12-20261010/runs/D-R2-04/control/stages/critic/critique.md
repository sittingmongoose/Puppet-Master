# Independent critique — ER12 D-R2-04-control

**Stage:** critic  
**Case:** ER12-D-R2-04-FRESH, “Confusion over a bilingual community-course notice”  
**Reviewed package:** investigator discovery.md, draft.md, source-map.json, sources/index.md, and the exact released revealed-plan.md; original brief.md.  
**Plan release:** 2026-10-10T07:05:11.371Z; SHA-256 72b52c88f5e170e7300d8965e3a823ad369e36e42c3103cdcf20b4d8eeb78cf6.

## Overall assessment

The proposal is careful about the fictional setting and separates the four required outcomes. It keeps fee and enrollment policy fixed, treats staff questions as an ambiguous signal, compares wording, presentation/channel, and assistance, and makes participant validation clearly prospective. I found no material false claim about local policy or participant results. The main gaps are incomplete treatment of two alternatives explicitly raised by the released plan and an unsupported adult-only eligibility choice. The source review also understates relevant history in S07 and has two minor source-version/locator precision issues.

No final notice, translation, or revised candidate is warranted by this critique. Local policy, artifacts, history, language pair, audience, access needs, and budget remain external inputs rather than critic decisions.

## Findings

### F-01 — S07 history is described too narrowly, omitting relevant later discussion

**Classification:** Material incomplete.

**Draft locator:** Comparison alternatives, paragraph after the table (draft.md, line 92); Research and implementation history, GOV.UK confirmation-pages bullet (line 144).  
**Source-map locator:** Investigator source-map.json, S07 record (around lines 75–84), which points only to the issue description and metadata.

The cited GitHub URL currently redirects from former backlog issue 40 to GOV.UK Design System issue 6037. The issue was opened 2018-01-12 and transferred on 2026-10-08. The draft accurately says this is not a controlled efficacy trial, but describing it only as a 2018 publication-history anchor leaves out later, directly relevant design history. The thread records a 2024 discussion of a payment-pending state in an application journey, including a possible wait of up to 24 hours and a temporary visual treatment; in 2025, contributors question whether a payment request sent screen can be mistaken for a completed step, who sent the request, or whether the user is at the end of the journey. The exchange remains anecdotal and does not provide a controlled user study, representative sample, or generalizable outcome.

That context bears on the case’s distinction between form received, place held, and confirmation. Include the thread as qualitative implementation history, with its limited evidence class stated. Keep S07 bound to the original URL/ID and record the current redirect destination; do not silently replace the old source ID.

### F-02 — Two plan-named alternatives are implicit rather than operationalized

**Classification:** Material incomplete.

**Plan locator:** revealed-plan.md, Meaningful useful alternatives (line 59), which explicitly names policy explanations and bilingual presentation choices.  
**Draft locators:** Comparison alternatives, options 3–4 (draft.md, lines 84–86); Stimuli and conditions (line 108); the claim that all plan alternatives are retained (line 44).

The content option varies complete wording/information order, and the presentation option varies hierarchy/layout or an existing print/mobile context. Those are sound comparisons, but the study does not say how it would isolate (a) an explicit explanation of already verified fee/reservation policy from simple reordering of the same facts, or (b) a bilingual presentation choice while holding each language’s wording fixed. Discussion of professional translation and separate readers does not itself compare how the two languages are presented together or separately. As a result, the plan’s explicit policy-explanation and bilingual-presentation opportunities are not yet traceable to a proposed contrast.

If the recovered artifact and delivery permit it, add conditional contrasts to the study matrix: verified explanatory detail versus the same verified facts stated more compactly; and relevant bilingual organization/layout variants with language content held constant. Treat these as options to investigate, not selected solutions. If the current notice offers no such choice, record that and do not invent a channel or layout.

### F-03 — Adult-only recruitment is unsupported by the supplied audience information

**Classification:** Unsupported.

**Draft locator:** Later study design, Phase 1: formative comparative rounds, Participants (draft.md, line 104).

The brief leaves the audience distribution and course details unknown. The draft recommends recruiting adults, but it does not establish that the courses or notice are intended only for adults. This could exclude actual or likely readers. Before fixing eligibility, establish who can enroll in the relevant courses. If the eligible audience is adult-only, state that as a confirmed service fact; if younger readers may enroll, specify appropriate assent/guardian consent, safeguarding, and age-appropriate task procedures before recruitment. Do not infer either audience from the fictional context.

### F-04 — Minor source-record precision corrections

**Classification:** Minor locator/wording.

**Source-map locators:** Investigator source-map.json S10 version field (around lines 110–116) and S11 version field (around lines 120–126); draft.md, Research and implementation history, WCAG and assessment bullets (lines 149–150).

The live WCAG 2.2 URL used for S10 identifies the displayed W3C Recommendation as 2024-12-12. The investigator record gives 2023-10-05, the date of the original Recommendation, without pinning the cited URL to that earlier dated document. The cited criteria and their qualifications were confirmed; this is a source-version mismatch rather than a discovered change to the case recommendation. Pin the intended dated document or identify the version displayed at the live URL.

For S11, the cited assessment page displays assessment date 2021-03-11 and publication date 2022-01-10. Adding those dates would make the report identity and age clear. Neither correction changes the investigator’s appropriately limited transfer claim.

## Obligation and plan disposition

| Obligation | Critic assessment |
|---|---|
| Treat the setting as fictional; do not infer current notice, policy, language pair, audience, or cause | Met. Discovery and draft repeatedly mark these as unknown and treat the staff report as a signal rather than a measured rate. |
| Keep fees and reservation policy fixed; do not write or deploy a notice | Met. Policy-owner verification precedes stimuli. No final copy, translation, recruitment, local contact, or deployment is proposed for this stage. |
| Explain plausible comprehension and presentation mechanisms | Met. Fee meaning/findability, submission-state inference, language revision, screen/layout/channel, and staff/process explanations are framed as hypotheses with discriminating observations. |
| Compare wording/information structure, presentation/channel, and assisted or unchanged alternatives | Substantially met. Separate content, presentation, unchanged/help, assisted, combined-later, and no-change options are present. F-02 identifies the two plan-specific comparisons that need a clearer operational contrast. |
| Address proficiency, literacy, mobile viewing, and staff explanation without treating language groups as homogeneous | Met with F-03 qualification. The proposal asks about self-described reading/speaking comfort, preferred language, literacy/access needs, device/context, and assistance; it avoids inferring these from identity. Adult-only eligibility is not yet justified. |
| Investigate local notice/service history and relevant implementations, including transfer limits | Local-history limitation is honestly unresolved because no records or contact are supplied or allowed. External analogues are bounded and their audience/context differences are made explicit. F-01 adds materially relevant context from a carried primary source. |
| Propose a realistic comparison study, accessible recruitment/consent, distinct measures, and revision rule | Largely met. Small formative samples are explicitly nonrepresentative and budget-dependent; task success, fee comprehension, reservation comprehension, and confidence remain separate. Resolve eligible ages before recruitment and retain policy/access gates. |
| Separate proposed participant validation from executed desk work | Met. The draft says participant validation, translation checks, local review, rendering, accessibility/legal audit, and deployment were not executed. My work independently reviewed primary-source pages; it did not conduct those validations. |
| Preserve exact plan scope without selecting a winner or reducing scope | Met in intent. The critique asks for traceable conditional comparisons and audience clarification; it does not choose a layout, wording, channel, or policy. |

## Source-check and validation status

I navigated the carried sources/index.md and independently opened all eleven primary-source URLs. The source map records exact URL, displayed version or unversioned status, reviewed locator, access capture, observed operation, governing condition/exception, and case applicability. S07’s redirect and later thread context, S10’s displayed version, and S11’s dates are recorded there.

Executed for this critique: reading the complete frozen investigator artifacts and released plan; independent desk review of the eleven indexed primary sources and the cited primary discussion history. No source ID was rebound.

Not executed: participant research, translation validation, local policy/process confirmation, current-notice or version-history review, mobile rendering, assistive-technology testing, readability calculation, accessibility/legal audit, or any communication with the fictional center. Those remain proposals or unresolved inputs, not critic findings about readers.
