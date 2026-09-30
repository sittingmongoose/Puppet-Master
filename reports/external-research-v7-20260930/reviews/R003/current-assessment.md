# R003 current-only assessment

Verdict: **quality failure**. The assessment is complete across all material current assertions and all six eligible facets; the candidate report remains incomplete and contains material factual/qualifier failures.

Artifact identity, source availability, manifest pins and the report SHA-256 all pass. Admitted evidence is only the frozen 896-line S003 capture, plan, brief and task/catalog. All proposed tests remain unexecuted; process declarations cannot independently be verified at this stage.

The report correctly preserves Zarr v3/OME namespace/version, axis rank/order and dimension_names, declared levels, transform composition and missing-unit treatment. Useful additional findings include collection/plate discovery, nested plate-version example omissions and optional omero field limits.

Material failures: channel count cannot come from axes alone (report lines 128/151); illustrative should-level singleton label shape is promoted to a hard rule (137); min/max as data range is unverified by this source (124); actual older-tool Zarr v2 behavior is not established (208); the optional-capabilities list downgrades image-label SHOULD to MAY (180).

| Eligible facet | Coverage | Main limitation |
|---|---|---|
| C01 Version/metadata admission | Full | Unsupported historical tooling claim separately recorded |
| C02 Axis-to-array identity | Partial | Absent vs singleton controls and shape-derived channel count |
| C03 Declared pyramid | Full | Declared order, per-level geometry and missing arrays addressed |
| C04 Coordinate calibration | Partial | No concrete asymmetric numeric composition check |
| C05 Label association/registration | Partial | Source-relative association not an explicit pre-overlay gate |
| C06 Categorical identity | Partial | No exact 64-bit range/refusal or categorical-safe resampling |

No acquisition/history, private method map, method cards, other grades or economics were read. The header unavoidably exposes a control/Z/repetition token. Runtime is host-bound gpt-6.1-sol/xhigh; effective runtime identity is not independently exposed. Assessment rows preserve precise report and admitted-source locators.

Report: `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/grading/R003/current-report.md`; SHA-256 `0766ca8ab919425a20e1cfe1e7f1dc7f434516498e98879da3c657143e45a49c`.

Admitted source: `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/grading/R003/inputs/sources/S003.txt`; SHA-256 `5d8b240877ed2cf9596566187bcb3779ea011d5319807134c65e2e7dc2ae82de`.
