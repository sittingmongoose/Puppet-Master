# Original evaluation clock scopes — assurance 001

The original bound is **1200 seconds for source/Phase1 checking, 600 for required Phase2 checks, and 1800 for the whole review including reporting, outgoing handoffs and metadata closure**. Root's dated authorial clarification selects the checking endpoint for600; original wording ambiguity and every inclusive measurement remain visible. This is a clock interpretation, not a source regrade, new rubric, clock reset or campaign gate.

The actual numbers are bound by the TD2/TD3 frozen START receipts. The generic dispatch template's4200-second whole/2400 coverage examples are expressly illustrative; they cannot prove a universal1800 rule. `EVALUATOR_PROMPT.md:13` says to finish required Phase2 checks within the separately bound reserve; `PROTOCOL.md:17` defines those post-freeze history/execution duties. `README.md:4` states template seconds are examples. Exact original quotations/hashes are in `ORIGINAL_PROTOCOL_EVIDENCE.json`; root's exact message and Max's structural corroboration are preserved separately.

| Clock endpoint, seconds | TD2 | TD3 |
| --- | ---: | ---: |
| Source freeze from first body | 681.905498 | 613.484033 |
| Required Phase2 checks | 401.588478 | 303.878679 |
| Phase2 start through report ready | ~401.593011 | 431.906686 |
| Phase2 start through required notices | ~547.027159 | 606.407076 |
| Phase2 start through metadata closure | ~670.523387 | 702.683637 |
| Phase2 start through later supplement-selector creation | Not supplied | 915.445829 |
| Whole clock at report ready | 1209.864675 | 1216.054470 |
| Whole clock at required notices | 1355.298821 | 1390.554861 |
| Whole clock at metadata closure | 1478.795047 | 1486.831422 |
| Whole clock at later supplement-selector creation | Not supplied | 1699.593614 |

Source and checking-only Phase2 records are below1200/600. All supplied whole checkpoints are below1800. **Do not report blanket “all caps0”:** inclusive TD2 closure exceeds600 by about70.523387 seconds; TD3 required notices exceed600 by6.407076389, metadata closure by102.683637118, and later selector creation by315.445829204. These inclusive comparisons retain their original arithmetic/labels and describe overhead under root's intended checking-only phase boundary. They are not erased or relabeled as shorter intervals.

The intervals are nested and not additive costs. TD2 has a UTC-derived source-freeze-to-Phase2 gap of126.366163 seconds; TD3 has an exact monotonic gap of170.663751044. TD3 report preparation after checking adds128.028006360 seconds and report-ready through required notices adds174.500390676. All of that belongs to the original whole clock. TD3's earlier neutral checking value303.877923843 and later completion303.878679353 differ by0.000755510; both are preserved. The metadata does not establish the exact cause of that small checkpoint difference.

TD2 inclusive Phase2 ranges are marked approximate because no allowed Phase2-start monotonic receipt was supplied; they use original UTC microsecond fields. No synthetic nanosecond anchor was invented. Both final-channel delivery timestamps remain UNKNOWN. The latest TD3 point measures **supplement selector creation**, not a subsequent outgoing send or acknowledgment. A measured whole checkpoint does not prove an unmeasured later event stayed inside1800.

Original TD2 final11 (`a988a2c171d0baa3499c549747fb6d9856f86ff59b96d800ae92030024c73300`) and TD3 final13 (`30d49dd327d2608080c12058347828490a3da8e7b3e413b18cef9960c75c4085`) remain unchanged. TD3's1323-byte `FINAL-CLOSURE.json` (`d9c8a6f003d8023437a3fa19a9b14e9ef8a945c6ef9bf95e6f623b6136abe978`) has a separate one-file selector (`903b9924338accc13007dd97627b3b42b1fb2e49a6e68d87feca4e51e02cb044`), not a silent replacement of13 frozen files. Its1699.593613692-second creation horizon is later than the earlier1486.831421606-second closure by212.762192086 seconds.

Only own original protocol and exact owner-selected START/freeze/neutral timing/closing/selector fields were inspected. Scientific summaries, judgments, candidate/source bodies and their references were not opened; no listing of agents, rerun, native Goal/canary, acknowledgment wait or live edit occurred. Actual scientific findings and fresh-pipeline causal credit are outside this check. Root and all finite candidate queues continue independently.
