# Independent Warm5 Phase 1 source review

Final scientific quality and whole-pipeline quality remain **UNASSESSED**. Mandatory delivery is **INCOMPLETE**: the packet has no designated final or canonical final four, and the canonical same-Goal critic report contains only `Draft in progress.` (19 bytes). The eight scratch artifacts are evaluated as frozen partials, including both source-register versions. None is promoted, chosen as a best version, or treated as a delivered final. This report supplies no original-grade replacement, fresh/matched/causal credit, method comparison or blank PASS.

The partial proposal contains useful source-correct research. It distinguishes documented facts, engineering choices and proposed validation, and preserves meaningful qualifications about notebook provenance, out-of-core limits, sandboxing, dependency resolution and synthetic checks. Its longer scratch review correctly states that it is candidate-authored self-critique from the same combined native Goal, not an independent Sol judgment. That report does not make the canonical 19-byte critic report complete.

## Verified source content to preserve

The [nbformat specification](https://nbformat.readthedocs.io/en/latest/format_description.html) supports document/cell/output structure; it supplies neither a complete execution ledger nor a freshness guarantee. The draft's additional manifest is an explicit engineering choice. The [nbclient execution documentation](https://nbclient.readthedocs.io/en/latest/client.html) supports notebook execution and configurable error continuation. Independently retrieved [v0.11.0 client code](https://raw.githubusercontent.com/jupyter/nbclient/v0.11.0/nbclient/client.py), lines 689–714, enumerates document cells; a fresh supervisor-created worker is still the product's own precondition. Do not infer that every nbclient use automatically starts a clean kernel. The draft makes no disputed default-timeout claim.

[Jupyter Server security documentation](https://jupyter-server.readthedocs.io/en/latest/operators/security.html) supports the arbitrary-code risk of authorized access. The draft correctly separates server authentication from execution isolation and holds notebook execution behind validation. Its docs-versus-package mismatch is retained rather than treated as compatibility proof.

Pinned DuckDB web commit `d6a1aad080334112d988c56548c83bdc08eab92c` independently supports the [CSV defaults and explicit options](https://raw.githubusercontent.com/duckdb/duckdb-web/d6a1aad080334112d988c56548c83bdc08eab92c/docs/current/data/csv/overview.md), especially lines 99–120; [out-of-core/spill limits](https://raw.githubusercontent.com/duckdb/duckdb-web/d6a1aad080334112d988c56548c83bdc08eab92c/docs/current/guides/performance/how_to_tune_workloads.md), lines 10–24 and 46–83; [JSON inference and declared columns](https://raw.githubusercontent.com/duckdb/duckdb-web/d6a1aad080334112d988c56548c83bdc08eab92c/docs/current/data/json/overview.md), lines 38–55; and [Parquet schema/pushdown options](https://raw.githubusercontent.com/duckdb/duckdb-web/d6a1aad080334112d988c56548c83bdc08eab92c/docs/current/data/parquet/overview.md), lines 151–159 and 193–197. In particular, CSV `strict_mode=true` and `ignore_errors=false`, Parquet `union_by_name=false`, some OOM-prone aggregates and ordering/memory trade-offs are accurately qualified. These docs do not benchmark this proposed application or promise arbitrary 5GB processing.

The [nbclient PR234 record](https://github.com/jupyter/nbclient/pull/234) and [patch](https://api.github.com/repos/jupyter/nbclient/pulls/234/files) show a concrete reported startup leak and cleanup/re-raise fix. At [v0.7.0](https://raw.githubusercontent.com/jupyter/nbclient/v0.7.0/nbclient/client.py), lines 547–567, startup errors enter cleanup; the [tagged regression test](https://raw.githubusercontent.com/jupyter/nbclient/v0.7.0/nbclient/tests/test_client.py), lines 515–544, injects `start_channels` failure and checks cleared client/kernel and no live kernel. This establishes reported failure, associated fix and test present at that tag. It does not establish that the suite ran, a CI pass, or the proposed supervisor's behavior. The lifecycle mechanism and DuckDB's memory mechanism are independently useful precedents from independent projects.

Fresh primary PyPI records for `jupyterlab==4.6.4`, `jupyter-server==2.21.1`, `nbclient==0.11.0`, `nbformat==5.11.1` and `duckdb==1.5.0` support the named releases and the stated metadata intersections. `jupyterlab` requires Server `>=2.19,<3`; nbclient requires nbformat `>=5.2`; Python 3.12 fits declared Python bounds and DuckDB lists cp312 wheels. The 2.22.0 Server endpoint returns 404. This is metadata, not a lock, install, start, cancellation or integration result.

## Material limits and findings

**W5-F01 — malformed supporting witness inventory.** `scratch-witnesses.json` fails JSON decoding at line 9 column 329 (character 3746) in `observed_stdout`. The other four JSON partials parse. The independently extracted valid `code` string hashes to the embedded code digest `ebd4e2a1055ee1d2522a49afb3ba3f013585fec231118a29684f61482f341a2a`. No source file was repaired, stdout reconstructed, or witness re-executed. An embedded candidate receipt is not an authenticated execution receipt; execution is **UNKNOWN**, never “not executed.”

W1 has a sensible narrow static expectation: [Python 3.12 CSV semantics](https://docs.python.org/3.12/library/csv.html) retain ordinary fields as strings, while the code explicitly maps NULL and floats, rejects its two malformed examples, takes one preview row and changes a key when three selected dimensions change. The code materializes the tiny input before slicing and compares an in-memory source value; it does not establish bounded streaming, filesystem immutability, complete cache dependencies or application staleness. Its stated integration/5GB/sandbox limits should survive any later repair.

**W5-F02 — incomplete required delivery.** The canonical four are absent, and the substantive scratch report is not the required canonical report. Delivery failure is separate from source quality of absent artifacts; no empty delivery receives scientific PASS.

**W5-F03 — predecessor fidelity unknown.** The draft, scratch report and leads disclose that prior paths could not be resolved and predecessor bodies were not read. The packet supplies no authenticated predecessor bodies, so their preservation/correction remains UNASSESSED. Reported access limitations and timing have not been confirmed from withheld native evidence.

**W5-F04 — partial opportunity/usability coverage.** Python-only and SQL-only are plausible alternatives, and optional embedded SQL is explicit. The proposal does not develop a distinct useful opportunity with research, value and trade-offs beyond those component choices. Status/progress and errors are mentioned, but accessible presentation and dependency/provenance views are thin. These are coverage limits, not invented false source claims.

**W5-F05 — underdefined interactive invalidation.** “Later/subsequent” cells and “dependent” outputs need a defined meaning when actual execution order differs from display order. The draft admits hidden state but does not explicitly give a safe fallback for earlier-displayed outputs that depend on later-displayed code. This is a design-contract gap. No runtime counterexample was executed or actual application defect inferred.

**W5-F06 — capture/catalog association qualifications.** S1 lacks a complete retained digest; its abbreviated prefix differs from fresh retrieval. A mutable latest URL prevents authentication of historical bytes from this observation alone. The early/final source-register IDs also change. Each frozen version is retained and evaluated explicitly; no endorsed association or best-of bundle is inferred.

## Coverage within partials

Every designated-final obligation remains scientifically UNASSESSED because the final is absent. The following states describe only the available partial text, not final acceptance:

| Obligation | Partial state | Practical limit |
|---|---|---|
| B01 workflow/support | PARTIAL | Broad flow exists; creation/UI and implementation sequencing thin. |
| B02 data contract | PARTIAL | Good policy boundaries; concrete timezone/missing/heterogeneous conversion contracts open. |
| B03 order/state/replay | COMPLETE | Distinctions and replay limits explicit as written design. |
| B04 invalidation | PARTIAL | Out-of-order dependency/fallback contract unsettled. |
| B05 identity/portability | PARTIAL | Manifest fields proposed; schema/cross-machine behavior unverified. |
| B06 resources/recovery | PARTIAL | Relevant limits and gates; operation/OS bounds unresolved. |
| B07 isolation/usability | PARTIAL | Isolation gates honest; accessible views underdeveloped. |
| B08 independent precedents | COMPLETE | Useful lifecycle and data-memory mechanisms verified. |
| B09 issue/fix/test | COMPLETE | Concrete PR234 chain and v0.7.0 applicability verified. |
| B10 opportunity/alternative | PARTIAL | Component alternatives sketched; opportunity not developed. |
| B11 witnesses/validation | PARTIAL | Static narrow expectation sound; inventory malformed and execution UNKNOWN. |
| B12 preservation/final | UNASSESSED | No final or authenticated predecessor bodies. |

All eight common dimensions and five important checks are recorded individually in `judgment.json`. Q6 and B-P4 remain UNASSESSED; remaining dimensions/checks are PARTIAL under the restricted partial-artifact scope. Targeted checks are **NOT_APPLICABLE_INTEGRATED_FULL_BRIEF**, with no invented three-check rubric or weighted score.

## Evidence and boundary

Exact packet/task/partial paths and SHA-256 pins, fresh public source capture paths/hashes and this report's companion judgment are recorded in `pinlock.json`. `scratch-brief-map.json` reconstructs the exact brief hash `6e6749f350f747baec86f127a6c91ec60c3e9d010329484dadd37bf22877450a`. The integrity-proof hash was checked without reading its body. New public retrievals do not replace candidate capture history.

Root assignment and exact task/path labels disclose unavoidable case/role hints; no perfect-blinding claim is made. No key, native Goal conversation, status/history, physical-provider telemetry, costs, old grades, sibling summaries or broad lab material was read before this freeze. Work consisted of small owned copies, public read-only captures and static mechanical/source review. No candidate, native job, retest, worker Goal, browser, canonical/Git change or foreign cleanup occurred.
