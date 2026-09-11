# Jujutsu research — deliverable 3

The blind adjudication and its independent review are complete. This deliverable publishes the correction set and all optional capabilities and product choices. Plans corrections are applied in deliverable 4; the checkpoint has not yet been reached.

The reviewed union contains 105 findings from 206 blind documents. All 404 provisional extraction keys have explicit dispositions. The full reviewed union, intake and original evidence remain external, with paths and SHA-256 values in `evidence-receipts.json`.

The metric is **recall against the adjudicated union**. Common misses are unknown, so this union is the best available reference rather than ground truth. The unsupported/rejected class includes observations already covered by the frozen Plans; it is not a count of false upstream facts. Declining an optional capability does not make the research incorrect.

The evaluator-derived correction remains in the union denominator and receives zero direct discovery credit for both arms. Research premises supporting it are retained as lineage. Source lists, inputs and thematic references earn no discovery credit.

| Class | Union | Premium found / union | Hybrid found / union | Shared |
|---|---:|---:|---:|---:|
| correction | 1 | 0 / 1 (0.0%) | 0 / 1 (0.0%) | 0 |
| optional capability | 35 | 19 / 35 (54.3%) | 30 / 35 (85.7%) | 14 |
| product choice | 6 | 3 / 6 (50.0%) | 5 / 6 (83.3%) | 2 |
| unsupported or rejected | 63 | 51 / 63 (81.0%) | 51 / 63 (81.0%) | 39 |

| Arm | Shared findings | Unique contributions | Unsupported / rejected |
|---|---:|---:|---:|
| Premium | 55 | 18 | 51 |
| Hybrid | 55 | 31 | 51 |

Both campaigns stopped with partial coverage. The same frozen case, scheduler, three-worker cap and batching policy were used. Neither completed reconciliation or comparison. The run therefore cannot measure the proposed comparison-pipelining latency improvement or whole-chain semantic loss.

| Arm | Pending deep studies | Pending reconciliation | Pending comparison |
|---|---:|---:|---:|
| Premium | 84 | 88 | 88 |
| Hybrid | 75 | 91 | 91 |

These pending sets overlap. Their exact IDs and stage presence for every finding are in `comparison.json`; absence from an interrupted or pending stage is not reported as semantic loss.

| Arm / stage | Wall minutes | Summed job minutes | Average workers |
|---|---:|---:|---:|
| Premium / discovery | 38.45 | 38.45 | 1.00 |
| Premium / implementation | 8.60 | 17.19 | 2.00 |
| Premium / history | 8.60 | 8.60 | 1.00 |
| Premium / reconcile | 0.00 | 0.00 | unknown |
| Premium / compare | 0.00 | 0.00 | unknown |
| Hybrid / discovery | 7.54 | 7.54 | 1.00 |
| Hybrid / implementation | 24.79 | 36.95 | 1.49 |
| Hybrid / history | 27.37 | 39.69 | 1.45 |
| Hybrid / reconcile | unknown | unknown | unknown |
| Hybrid / compare | 0.00 | 0.00 | unknown |

Premium's complete observed campaign span was 47.06 minutes, with 64.24 summed job minutes and 1.37 average workers. Hybrid's last observed span was 36.68 minutes; its completed jobs total 84.17 minutes. Hybrid's final running duration, interrupted reconciliation duration and average concurrency are unknown. The unobserved interval until process-absence detection is not claimed as active runtime or human waiting.

Premium cost: **$39.718066 captured Astra standard API-equivalent**, plus **$107.55 unresolved reserved liability**. Actual cash billed is unknown.

Hybrid cost: **$3.596462 captured combined Astra standard API-equivalent and DeepSeek Go allowance valuation**, plus **$35.85 unresolved reserved liability**. Actual cash billed is unknown.

Valuations use the preserved September 8 basis. Reserved liability is separate from captured valuation. These partial runs do not establish an overall cost-effectiveness winner.

Read `corrections.md` for the existing promise being repaired, `decision-packet.md` for every question awaiting Jared, and `technical-companion.json` for the technical mapping. Nothing in the decision packet is approved or landed by this deliverable.
