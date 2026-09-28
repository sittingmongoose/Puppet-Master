# Current investigator findings

Status: **UNVERIFIED**. This first-view report contains the current typed findings only.
Source citations are investigator leads. Validation proposals are UNEXECUTED; no test result is asserted.

## F0001 — Alpha widget blue-mode report V2 synthetic

### F0001_ASSERTION · assertion
> Widget Alpha reports 3 units only when mode is blue; the condition remains necessary. Marker ALPHA_V2. This is the revision-2 synthetic fact for delivery interface testing.

### F0001_SOURCE_FIT · source_fit
> Synthetic source revision 2 states Revision 2: widget Alpha reports 3 units only when mode is blue; the condition remains necessary. Marker ALPHA_V2.
> Exact quoted sentence: He said "blue", then typed C:\demo\alpha.
> Exact code:
> ```text
>   mode = "blue"
>   path = "C:\demo\alpha"
> ## condition
>   units = 3
> ```
> File header says D1 synthetic source. All statements below are invented for delivery testing.

### F0001_CONDITION · condition
> Conditions: mode is blue is necessary; the 3-unit report applies only when mode is blue. Limits: synthetic revision-2 scope only; invented for delivery testing; no claim about other modes or real widgets.

### F0001_IMPLICATION · implication
> If the synthetic condition holds and mode is blue, the synthetic record reports 3 units. If mode is not blue, the 3-unit report does not apply.

### F0001_VALIDATION_PROPOSAL · validation_proposal · UNEXECUTED PROPOSAL
> UNEXECUTED proposal: inspect the synthetic file for the revision-2 line, quoted sentence and code block, and compare mode value to blue without running code. This proposal has not been executed and no result is claimed.

### F0001_UNCERTAINTY · uncertainty
> Unknown whether any real widget behaves this way. Uncertainty covers real-world mapping, other modes, and any revision beyond synthetic revision 2.

### F0001_PLAN_FIT · plan_fit
> TEST_ONLY; no canonical plan change. Synthetic disposition is to retain the revision-2 fact for interface testing only, with no research conclusion.

## F0002 — Red mode silence scoped synthetic non-finding

### F0002_NON_FINDING · non_finding
> This synthetic source makes no claim about red mode. Its silence is bounded to this file and does not prove anything about real widgets. This is a scoped non-finding for delivery interface testing.

### F0002_SOURCE_FIT · source_fit
> Synthetic source states This synthetic source makes no claim about red mode. Its silence is bounded to this file; it does not prove anything about real widgets. The file header says D1 synthetic source. All statements below are invented for delivery testing.

### F0002_CONDITION · condition
> Conditions: silence applies only within the synthetic file; bounded source scope is this file only. Limits: no inference about real widgets, no claim about red-mode behavior, no extension beyond the synthetic source.

### F0002_IMPLICATION · implication
> If the bounded silence holds, no red-mode conclusion follows from this source; any red-mode claim would need a different source.

### F0002_VALIDATION_PROPOSAL · validation_proposal · UNEXECUTED PROPOSAL
> UNEXECUTED proposal: search the synthetic file for red-mode claims and confirm only the silence statement appears, without running code. This proposal has not been executed and no result is claimed.

### F0002_UNCERTAINTY · uncertainty
> Uncertainty covers all real red-mode behavior and any source outside this synthetic file. The silence does not bound real-world facts.

### F0002_PLAN_FIT · plan_fit
> TEST_ONLY; no canonical plan change. Synthetic disposition is to retain the bounded silence as a non-finding for interface testing only.

## Structural delivery status

STRUCTURALLY_COMPLETE_UNVERIFIED
