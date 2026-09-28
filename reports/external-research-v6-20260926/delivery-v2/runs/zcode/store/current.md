# Current investigator findings

Status: **UNVERIFIED**. This first-view report contains the current typed findings only.
Source citations are investigator leads. Validation proposals are UNEXECUTED; no test result is asserted.

## F0001 — Alpha blue-mode unit reporting (synthetic, revision 2)

### F0001_ASSERTION · assertion
> ALPHA_V2: in the D1 synthetic source, revision 2 states that widget Alpha reports 3 units only when mode is blue, with blue mode remaining a necessary condition — "Revision 2: widget Alpha reports 3 units only when mode is blue; the condition remains necessary. Marker ALPHA_V2." Within the fictional scenario, blue mode is necessary for the 3-unit report.
> 

### F0001_SOURCE_FIT · source_fit
> case/SYNTHETIC.txt line 3: "Revision 2: widget Alpha reports 3 units only when mode is blue; the condition remains necessary. Marker ALPHA_V2."
> case/SYNTHETIC.txt line 1 bounds the corpus: "D1 synthetic source. All statements below are invented for delivery testing; no product or research conclusion follows."
> Exact quoted sentence, verbatim from case/SYNTHETIC.txt line 4: He said "blue", then typed C:\demo\alpha.
> Exact code, verbatim from case/SYNTHETIC.txt lines 6–11, preserving quotes, backslashes, indentation, and the literal heading inside the closed fence:
> ```text
>   mode = "blue"
>   path = "C:\demo\alpha"
> ## condition
>   units = 3
> ```
> The fenced code's `units = 3` matches the revision-2 unit count; no external or real-world source is cited or implied.
> 

### F0001_CONDITION · condition
> - Holds only inside the D1 synthetic delivery-testing corpus, which the source itself declares invented for delivery testing.
> - Applies to the revision-2 statement; the source also carries a revision-1 sentence with a 2-unit count, so the number is revision-scoped and this record treats revision 2 as the operative statement.
> - "Only when" is read as blue mode being necessary for the 3-unit report; whether blue mode is sufficient is not stated.
> - The embedded code is illustrative synthetic text; it must not be executed (the source itself says "Any proposed test is UNEXECUTED. Do not run this code or claim a test passed.").
> - Says nothing about real widgets, red mode, or any product behavior.
> 

### F0001_IMPLICATION · implication
> If the synthetic condition holds, then within this fictional model any scenario in which mode is not blue should not show widget Alpha reporting 3 units; conversely, observing a 3-unit report in the synthetic fixtures would imply blue mode. Synthetic fixtures still carrying the revision-1 2-unit value would be stale relative to revision 2.
> 

### F0001_VALIDATION_PROPOSAL · validation_proposal · UNEXECUTED PROPOSAL
> UNEXECUTED proposal: a future synthetic-harness pass (not this session, not executed here) would build fictional fixture cases pairing mode ∈ {blue, non-blue} with a recorded unit value and check that the 3-unit value co-occurs with blue mode only, using revision-2 fixtures exclusively, plus a boundary case confirming no 3-unit report for non-blue modes. This is a proposal only; no test has been run and no result exists.
> 

### F0001_UNCERTAINTY · uncertainty
> The mechanism linking mode to units is unstated; whether "only when" also excludes other unit values while in blue mode is unspecified; whether revision 2 supersedes revision 1 or both coexist for different fixture generations is not defined by the file; and the quoted sentence's mention of "C:\demo\alpha" carries no stated relationship to the unit count. Scope is limited to the bytes of case/SYNTHETIC.txt.
> 

### F0001_PLAN_FIT · plan_fit
> TEST_ONLY synthetic disposition: record as delivery-interface exercise data for the D1 qualification. No canonical plan change, no product or research conclusion, and no execution of the proposed test.
> 

## F0002 — Non-finding: the synthetic source is silent on red mode

### F0002_NON_FINDING · non_finding
> The D1 synthetic source (case/SYNTHETIC.txt) makes no statement about red mode: it neither affirms nor denies any widget behavior under red. This is a scoped record of that silence, not a substantive claim about red mode. Bounded scope: exactly this 14-line file (revisions 1–2, markers ALPHA_V1/ALPHA_V2); it covers no other file, corpus, or real widget.
> 

### F0002_SOURCE_FIT · source_fit
> case/SYNTHETIC.txt line 12: "This synthetic source makes no claim about red mode. Its silence is bounded to this file; it does not prove anything about real widgets."
> The only mode named anywhere else in the file is blue (lines 2, 3, 7, and 11 of the embedded code); the word "red" appears solely in the line-12 statement of silence. No external source is cited or implied.
> 

### F0002_CONDITION · condition
> - The silence is bounded to this one synthetic file by the file's own text.
> - Silence is not evidence: nothing about red-mode behavior, synthetic or real, follows from the absence of a statement.
> - If a later revision of the source mentions red mode, this record no longer describes the current file and should be revised or retired.
> 

### F0002_IMPLICATION · implication
> If the synthetic condition holds, any scenario requiring a red-mode rule must source it elsewhere; this file can neither support nor contradict a red-mode claim.
> 

### F0002_VALIDATION_PROPOSAL · validation_proposal · UNEXECUTED PROPOSAL
> UNEXECUTED proposal: a future text scan (not run in this session) over the current bytes of case/SYNTHETIC.txt would check that no line other than the line-12 silence statement mentions red mode, confirming the boundary still holds. Proposed only; never executed, no result claimed.
> 

### F0002_UNCERTAINTY · uncertainty
> Unknown whether synthetic corpora outside this file address red mode, and whether future revisions of this file will break the silence. The record's accuracy is limited to the file bytes read on 2026-09-28.
> 

### F0002_PLAN_FIT · plan_fit
> TEST_ONLY synthetic disposition: retain as a scoped negative-coverage note for the D1 delivery qualification. No canonical plan change and no inference about real systems.

## Structural delivery status

STRUCTURALLY_COMPLETE_UNVERIFIED
