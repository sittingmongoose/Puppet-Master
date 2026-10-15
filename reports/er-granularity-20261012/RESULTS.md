# ER granularity pilot — results (2026-10-12)

One frozen case (ER12 A5-02), three flash models, two task shapes, identical
host-supplied source bundle (S1–S13), blind Sol Max grading against a re-verified
gold checklist (20 propositions, F1/L1 traps). Sandbox runtime:
`~/PM-Experiments/er-granularity-20261012/` (case, smoke, arms, grades with KEY).
No canonical Plans were edited; nothing was landed.

## Headline

**0 of 6 finals passed the strict gold rubric — in both shapes.** Every final
failed the same high bar: the F1 care-QR condition conjunction (New Label Engine
enabled + valid 2D-capable template + explicit QRCODE + `plain_asset_tag` +
approved external prefix + compatible tag grammar + the `e()` escaping limit)
was incomplete, and 4 of 6 also had one paraphrase presented inside quotation
marks, which the grading prompt counted as material. Removing the quote rule
changes nothing: all six still fail on F1 incompleteness alone.

The binary verdict hides a consistent relative signal (below). It also inherits
two calibration choices Jared may want to revisit: GOLD made the `e()` escaping
detail a material condition, and my grading prompt made any non-verbatim quoted
wording material even where the underlying claim was true.

## Per-arm blind grades (key unsealed after grading)

| Arm | Words | Gold met / partial / missing (of 20) | Conditions retained / dropped / absent (of 8) | Material findings beyond F1-incomplete |
|---|---:|---|---|---|
| deepseek-M | 2,801 | 9 / 11 / 0 | 4 / 3 / 1 | False "v8.8.0 still pre-fix" release claim; 1 lexical quote substitution |
| luna-M | 2,321 | 13 / 6 / 1 | 5 / 1 / 2 | F1 proposition 6 **missing** (only arm); no invented quotes |
| glm-M | 2,915 | 11 / 9 / 0 | 4 / 3 / 1 | Guard narrowed to "first-ever enable"; released-fix/unaffected overclaim; 1 invented literal quote |
| deepseek-P | 2,813 | 9 / 11 / 0 | 6 / 1 / 1 | 1 invented quoted phrase |
| luna-P | 2,627 | 13 / 7 / 0 | 6 / 1 / 1 | None beyond F1 (cleanest failure) |
| glm-P | 2,816 | 12 / 8 / 0 | 5 / 2 / 1 | 1 invented quoted paraphrase |

## What the shapes actually did

- **Extraction is solved at flash grade.** Phase 0: all three models scored 4/4
  on entailment atoms and kept the pgvector type-vs-index conditions separate.
  Phase 1 packets: all three Snipe extractions captured `plain_asset_tag`, the
  prefix, the template gate, and the `e()` escaping line (verified by host grep).
- **Integration is the bottleneck — in both shapes.** Every packet final then
  dropped the escaping limit (absent 6/6 across both shapes) and failed to state
  the full QRCODE+plain-tag+template conjunction in its care-QR conditions, even
  though its own records contained every piece. Atomization moved the loss to
  the integration packet rather than removing it.
- **Packets still helped, narrowly.** Conditions retained averaged 5.7/8 (packets)
  vs 4.3/8 (monoliths). Luna improved within-model from F1-missing (monolith) to
  F1-partial (packet). The two extra applicability inventions (DeepSeek's false
  release boundary, GLM's first-ever-enable latch + released-fix claim) occurred
  in monoliths; no packet final invented a release fact. Gold-met counts were
  essentially tied (packets 11.3 avg vs monoliths 11.0).
- **Packets cost more here.** Monoliths: 1 context, files in ~3 min (DeepSeek),
  ~5 min (Luna), ~9–12 min (GLM). Packet chains: 5 contexts, ~19 min (DeepSeek),
  ~17 min (Luna), ~48 min (GLM, including cap serialization). No dollar/quota
  figure is claimed; only wall time and context counts were observed.
- **Models:** DeepSeek V4.1 Flash was by far the fastest and most exhaustive in
  extraction (123 claims across packets); GLM-5.3-Flash was slowest with the
  most precise conditions and the best packet gold count (12 met); Luna was
  fastest to a monolith final but the only model to miss F1 entirely in that shape.
- **Goal tooling:** only the Luna/Codex harness reported a native Goal tool.
  zcode (GLM) and OMP (DeepSeek) workers reported none and worked from the task
  prompt itself. Any production "every prompt is a Goal" rule must either accept
  the delegated prompt as the goal on those harnesses or supply a broker — this
  pilot did the former and recorded it.

## Recommendation (next test, not adoption)

Keep packet extraction; replace free-prose integration. The cheapest decisive
follow-up reuses the frozen records: rerun only a new integration packet per
packet arm, with a host-generated conditions checklist extracted mechanically
from the records' CONDITION fields, requiring the final to carry each item or
mark it N/A with a reason — plus a host quote-verbatim check that bounces any
non-verbatim quoted string back for repair before grading. If that closes F1
without new errors, the shape to scale is *packets + host-enforced condition
carriage*, not packets alone and not monoliths. Discovery granularity remains
untested (bundle was host-supplied by design).

## Limits

One case, one run per arm, no repeatability claim. Grader = Sol Max against a
gold built partly from the prior ER12 assessment (re-verified against the
bundle; 10 bundle gaps were excused, not failed). Packet finals are partially
identifiable by shape from record references despite anonymization. Times are
file/terminal observations under shared concurrency caps, not billing.
