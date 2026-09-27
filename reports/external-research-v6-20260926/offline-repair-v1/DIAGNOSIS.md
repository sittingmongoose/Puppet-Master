# Corrected failure-origin note

Development trace only; no regrading or changed historical output. All paths in
the table are relative to the published `reports/external-research-v6-20260926/`.
Full SHA-256 values are in `historical-evidence.json`. Source corpus stays on VM.

| Evidence | What it establishes | Failure origin |
|---|---|---|
| `runs/M-control/stage1/observations.md` O-010, lines 75–81; draft P4/F5, lines 12 and 67–71 | `source.image` is already linked to display/association upstream. The draft leaves it as metadata without the operational association requirement. REV-M records loss of C05.c in both deliveries. | Acquisition exists; drafting/preservation loss. |
| Same observations, O-020, lines 155–160; draft P9/P17/F8, lines 20, 31, 85–89 | Missing and failed fields are both recorded as zero-filled. The observation conflates them; later prose does not derive the required valid-absence versus read/decode-failure distinction. | Partial acquisition and incomplete derivation, followed by narrowing; not wholly unacquired. |
| `runs/Z-candidate/stage1/observations.md` O-048(c), lines 382–388; draft lines 22, 92 | General bytes-codec endianness is explicitly captured, then narrows to a producer's little-endian default. Z candidate retains only that default; Z control adds a partial general mention. | Acquired implication narrowed in drafting, incompletely recovered in verification. |
| Same observations, O-074, lines 590–596 | The transpose/sharding write-error title is a lead. It is not evidence for a general reader failure or normative decoding semantics. Neither draft nor final develops handling/refusal. | Acquired lead, uncompleted derivation and later omission. No complete-finding credit merely for the title. |
| `r1b-block1/runs/R1b-Z-P1-control/decisions.md` lines 175–177, 201–203, 227–229; corresponding draft lines 52, 59, 66 | B-031/B-036/B-041 validation proposals existed before verification, then became `not_a_claim`. Z candidate kept them, although B-041 is inadequate to distinguish the claimed transformation failure and has a unit inconsistency. | Verifier loss in control; preserving a proposal does not prove the proposal is adequate or executed. |
| `r1b-block1/runs/R1b-Z-P1-candidate/decisions.md` lines 490–497 and `delivered.md` lines 584–593, 812, 829 | B-081 uses a false corpus-absence assertion inside a replacement marked supported; REV-Z identifies direct counterevidence in S034 lines 77–83. | Verifier-introduced false dismissal; neither a source-read count nor a filled search field repairs it. |

The single-title `source.image` allegation is also overpromoted in the Z draft:
O-011 originally records relative linkage, while later text treats an issue title
as community consensus that can displace the specification. Lead, allegation,
source-supported finding and authority to change a requirement remain separate.

The frozen summary's blanket description of shared misses as upstream acquisition
gaps is too broad. Some findings were acquired, some were only leads, some lacked
a distinguishing derivation, and others were explicitly removed in verification.
The remaining reported acquisition gaps are not inferred away by this correction.

Keep whole-reference scores intact: both Muse arms retained C01 and narrowed
C02–C08; Z candidate retained C01/C03/C05 and narrowed the rest; Z control retained
C01 and narrowed the rest. No whole reference was graded lost or contradicted.
That does not erase facet loss, unsupported claims or lost validation proposals.

R1b's lower source-read counts did not establish savings: Muse was slower with
more uncached input; zcode's modest time decrease came with more uncached input
and tool-result bytes. The bundle-first treatment is retired from active
optimization, while its artifacts and all reported measurements are preserved.
