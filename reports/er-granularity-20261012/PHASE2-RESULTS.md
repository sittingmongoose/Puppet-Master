# Phase 2 — host conditions checklist + integration rerun (2026-10-12)

Intervention tested on the three packet arms only, reusing their frozen Phase 1
records: (1) a host-generated conditions checklist extracted mechanically from
each arm's own records (all 87–123 claim blocks; 45–65 flagged KEY by host
keyword rules), (2) one new integration Goal per arm required to carry every KEY
condition in prose or mark it NOT-APPLICABLE in a Conditions Carriage appendix,
with every double-quoted sentence copied verbatim or paraphrased without quote
marks, (3) a host verbatim-quote check with repair bounce before grading.
Same case, gold, rubric, and blind Sol Max grading as Phase 1.

## Headline

**Still 0 of 3 strict passes — but the targeted failure classes were fixed.**
Escaping, absent in all six Phase 1 finals, was **retained in all three v2
finals**. Conditions retained rose from 5.7/8 (packet v1 average) to **7.0/8**,
with zero conditions absent (v1 packets each had one absent). No grader found an
invented quotation in any v2 final (v1 packets: 2 of 3 had one). Gold-met counts
were flat (33 vs 34 of 60). The remaining failures are narrower and different in
kind: acceptance-gate formulation, not lost conditions.

| Arm | Gold met/20 (v1 → v2) | Conditions kept/8 (v1 → v2) | Remaining material finding in v2 |
|---|---|---|---|
| DeepSeek packets | 9 → 8 | 6 → 6 | Care gate admits PDF417/DATAMATRIX instead of requiring QRCODE; GS1 303 guidance imported as a mandatory gate |
| Luna packets | 13 → 13 | 6 → **8** | Sole error: prose says code excerpts are "not assigned a release version in the records" — true of the records given to the integrator, false of the bundle (v8.8.0 host-note). All 8 conditions retained, F1 fully carried |
| GLM packets | 12 → 12 | 5 → 7 | Care rule still does not require QRCODE; target/prefix/tag grammar left generic |

## Reading

- **The checklist mechanism works where it aims.** Every ESCAPING and F1-mechanism
  condition present in the records survived integration in v2, because carriage
  was enumerable and auditable (appendix rows matched KEY counts: 65/45/62) and
  graders judged prose, not the appendix.
- **It also created a new error class: checklist conditions imported as gates.**
  DeepSeek turned GS1's scoped 303 recommendation into a mandatory care-QR
  condition — carriage without scope judgment. Carrying a condition and
  *applying* it at the right scope are different jobs; the checklist only does
  the first.
- **The acceptance-gate sentence is now the weakest point.** Two of three v2
  finals describe the QRCODE choice correctly in prose yet write a care
  acceptance rule ("type not none/null", "QRCODE/PDF417/DATAMATRIX") that admits
  non-QR symbologies. The failure moved from *losing facts* to *composing them
  into a rule* — a smaller, more checkable target: a host template for gate
  sentences, or a dedicated one-question packet that only writes the gate.
- **Luna's sole failure is partly an input-design artifact.** The integrator was
  restricted to records/comparisons, and host grep confirms the string `v8.8.0`
  appears nowhere in Luna's records or checklist — extraction never carried
  source provenance. Fix at the host layer: stamp every record/checklist with
  its source file's version header. With that stamp, Luna's v2 is the closest
  arm to a strict pass observed in either phase (8/8 conditions, no invented
  quotes, no other material error).
- **Quote discipline is achievable two ways:** verbatim copying (DeepSeek 15
  quoted spans host-checked 14 verbatim + 1 regex artifact; GLM needed one
  single-sentence repair for a reassembled PDF quote) or abstention (Luna used
  zero sentence-length quotes). The host checker (validated on v1: it catches
  all four grader-flagged inventions) plus one repair packet cost one extra
  small context total.
- **Cost:** +1 integration context per arm (+1 tiny repair for GLM). DeepSeek
  remained fastest; GLM remains several-fold slower per context. No dollar or
  quota figure is claimed.

## Updated recommendation

The shape to test next is *packets + host provenance stamps + host-enforced
condition carriage + a dedicated gate-composition check*: after integration, one
small Goal (or host template) whose only job is to verify that each acceptance
rule in the final names the exact selected values (symbology, target, prefix)
rather than the generic gate that enables them, and that imported guidance
(e.g. 303) is scoped as guidance or as an explicit local choice. That targets
the exact remaining failure in 2 of 3 arms without another broad campaign.
Discovery granularity remains untested.

## Limits

Same single case and gold as Phase 1; v2 arms benefit from Phase 1 records built
for the same case (no fresh-case evidence). Grader strictness unchanged (see
RESULTS.md calibration caveats). One run per arm; grader variance between runs
is visible in gold-met wobble (DeepSeek 9→8 with a different partial pattern).
