# Local reproducible notebook and data workspace

**Stage:** independent critic and final proposal  
**As of:** 2026-10-06  
**Status:** proposal only; no product or third-party runtime was built in this stage.  
**Evidence labels:** source facts, engineering inference, product choices, candidate-executed checks, and proposed/UNEXECUTED validation are separated below. Source keys `[S01]`–`[S18]` resolve to exact URLs, pins, locators, capture identities, and limits in `sources.json`.

## Recommendation

Build a local project manager that combines three independent precedents behind a small, explicit contract:

1. **Notebook document and Python execution:** use `.ipynb` with `nbformat==5.10.4`, and start with `nbclient==0.10.2` as the clean-run coordinator. A fresh Jupyter kernel runs an explicitly configured clean replay. Store a separate workspace event ledger and output manifest: the notebook document contains ordered cells, execution counts and output objects, while the runtime protocol associates requests and replies; neither is a complete durable history of kernel state. [S01–S03]
2. **Tabular engine and optional SQL:** qualify DuckDB `v1.5.6` as the initial engine candidate for Parquet, NDJSON and a narrow read-only SQL surface. The release is a source/version candidate, not an approved binary: the known CSV fix is on the `v2.0-cyanoptera` branch, the captured `v1.5.6` scanner source does not contain that hunk, and its test path is absent at that tag. Keep CSV behind a precise `\r\r\n` rejection gate until the exact shipped artifact passes the regression matrix. If another artifact cannot be qualified, defer that CSV input or evaluate a separately qualified reader. [S06–S14]
3. **Untrusted execution:** first support execution on Linux only, with Bubblewrap `v0.10.0` constructing a filesystem and network namespace, plus an independently enforced resource controller and reviewed policy. Bubblewrap does not impose the product’s complete policy or resource quotas. If the reviewed sandbox or quotas cannot be established, keep project editing and export available and disable execution. [S17, S18]

Jupyter and DuckDB are independent precedents: they are separate projects and solve different problems. Jupyter contributes a notebook document, kernel orchestration and message protocol; DuckDB contributes local analytical scanning and SQL. Neither supplies the other’s mechanisms or a security boundary. Bubblewrap is a third, independent Linux sandbox-construction mechanism. The proposal composes these components rather than treating any one as a finished workspace.

### Critic corrections applied

The frozen research remains useful, but the current proposal tightens several implementation claims after checking the exact pinned source:

- `nbclient==0.10.2` skips cells tagged `skip-execution` by default, and its default policy permits a `raises-exception` tag to continue. A clean replay must override those defaults or report a partial run. The chosen contract is strict: execute every non-empty code cell in displayed order and fail on any cell error. [S02]
- The execution-order suffix invalidation rule is sound for a clean run in displayed order, but cannot describe arbitrary interactive execution order. Any source/dependency/environment change invalidates all outputs from that mutable kernel session as unverified; clean-run suffix invalidation is kept only for clean outputs. [S02, S03]
- `display_id` messages can update an output that was first produced in another cell. Each update therefore needs an event linked to both the triggering request and the affected saved output; otherwise the original event’s output hash becomes false provenance. [S02, S03]
- A digest observed before reading a mutable external path does not prove those same bytes were read during execution. A clean output is current only when execution uses an immutable content-addressed snapshot or another verified stable byte source. Direct references remain the no-copy import default, but their run is unverified if source stability cannot be established.
- A completed event appended before a manifest rename can describe a run that was never published. The manifest pointer becomes the commit point; event-log records are reconciled against it during recovery. The parent directory also needs a durability step after rename. These are design requirements, not observed filesystem guarantees.
- Bubblewrap supplies namespaces and mounts, not CPU, memory or disk quotas. Resource limits need an external cgroup/resource controller and quota-limited scratch storage. The Jupyter client’s default local TCP kernel transport also requires containment: the manager/client and kernel must live inside the same private network namespace, with no host-visible kernel connection ports. [S17, S18]
- The upstream CSV regression is useful but narrow: it is source at one commit, has a `notwindows` requirement, and exercises an engineered boundary plus a mid-buffer case. The PR’s report that the test passed on a relassert build is not a run by this candidate, nor proof about the released Python wheel. The exact `v1.5.6` artifact remains unverified. [S07–S12]

## Evidence, inference and choices

### Source facts

- The pinned nbformat description defines a notebook as JSON with ordered cells; code cells can store `execution_count` and outputs, including stream, MIME-bundle, execute-result and error outputs. It does not describe a complete record of kernel mutations. [S01]
- The pinned nbclient implementation starts/manages a Jupyter kernel, iterates cells in notebook order, provides hooks and timeout/error behavior, and updates outputs by `display_id`. It defaults to skipping `skip-execution` cells; `force_raise_errors` defaults off and error tags can allow continuation. These settings must be explicit in the product wrapper. [S02]
- Jupyter Client documents request/message IDs, session identity and parent headers used to correlate replies and IOPub side effects. A restarted kernel has a new session. Correlation helps build an event log but does not itself make one. The captured `stable` page identifies Jupyter Client 8.10.0 and message spec 5.5; the `stable` alias is mutable. [S03]
- Jupyter Client 8.10.0 documents local TCP kernel sockets as unencrypted by default and reachable by other host processes that can reach the ports. A sandbox must contain the kernel transport, not expose these ports to the workstation. [S18]
- DuckDB documentation describes CSV inference with explicit overrides, CSV error/reject inspection, JSON reader configuration/type deduction, and Parquet schema inspection and multi-file reads. These reader mechanisms do not define this product’s type contract, missing-versus-null semantics or schema migration policy. The documentation URLs use mutable `current`/`stable` aliases. [S04, S05, S13, S14]
- Issue #25164 reports valid duplicate rows from parallel CSV scanning with `\r\r\n` endings, including reports against DuckDB 1.4.4, 1.5.2 and 1.5.5. The issue says ordinary `\r\n` and `\n` cases in its reproduction were unaffected, and separately mentions a possible leading-LF symptom that may be distinct. [S07]
- PR #25232 merged on 2026-09-07 at `59ae0c6fb3f29369cfd0df124c76e9232181ef86`, base `v2.0-cyanoptera`. It adds an early return in `ProcessOverBufferValue` after the carry-on newline loop when the preceding buffer already counted the row, preventing fallthrough that could count the next row twice. Its regression source constructs a 1024-byte split between the two `\r` bytes, compares 60 parallel and sequential rows and checks IDs 39/40 and duplicates; it also has a mid-buffer case. The source test requires `notwindows`. The PR reports a relassert build passed; this proposal did not run DuckDB or that test harness. [S08, S09]
- The proposed port PR #25325 targets `main` but remains closed with `merged=false` in the 2026-10-06 API capture. The release object for DuckDB 1.5.6 was published after the merge, but its release notes do not establish inclusion of this patch. At the exact v1.5.6 tag, the inspected scanner source lacks the added guard in the corresponding branch, and the exact regression-test path returns 404. This is evidence about the captured source path and test path, not proof of a built binary’s behavior or proof that no alternate fix exists. No exact DuckDB 1.5.6 Python wheel was run. [S06, S10–S12]
- DuckDB’s dated 2024 memory article describes chunked scans and some spilling for larger-than-memory intermediates, while describing high-cardinality aggregations, exact distincts, large joins, sorts and complex windows as potentially memory/disk intensive. It says spill support is operator-dependent and evolving. DuckDB’s 1.5 tuning page describes an insertion-order memory trade-off. Neither establishes a 5 GB result on this workstation or an exact release performance guarantee. [S15, S16]
- Bubblewrap v0.10.0 describes mount, user, PID, IPC and network namespace construction, read-only mounts and optional seccomp; its README assigns the security policy to the caller’s arguments and warns that mounted objects and policy omissions matter. [S17]

### Engineering inference

- A notebook’s displayed order, live kernel state, actual execution sequence and saved outputs are different things. Execution counts and saved outputs cannot reconstruct arbitrary prior cell execution, hidden variables, file reads or side effects. Keep an event ledger and attach each saved output to its producing event.
- Notebook dependencies are often implicit. On a clean run, editing a code cell invalidates that cell and the following clean-run outputs because state can flow forward. For interactive runs, execution can happen in any order; any edit or dependency change makes the entire session’s outputs unverified unless a dependency graph and all side effects are known.
- A source hash is meaningful only if it identifies the bytes read by the engine. Hashing a path and then allowing that path to change is vulnerable to time-of-check/time-of-use drift. A content-addressed snapshot or a verified stable source is required for a clean output to be labelled current.
- Streaming scans and operator spill make some 5 GB workflows plausible, but input size alone cannot prove that a join, sort, exact distinct, high-cardinality aggregate or Python materialization fits. The engine memory cap also does not equal total process or machine memory. Spill needs available, quota-limited disk.
- A plain folder is a useful exchange unit, but external paths, case sensitivity, environment artifacts and local lock/rename behavior affect portability. A path that resolves on one machine may not resolve on another.

### Product choices

- First support boundary: Python notebooks using the Jupyter protocol and one tested Python minor with an exact package/artifact lock. Use `.ipynb` for interchange, but keep product provenance, run events, project identity and artifact links in a workspace manifest. SQL is a narrow DuckDB SQL workbench over registered data, not a second arbitrary notebook kernel. State the DuckDB dialect; do not imply PostgreSQL compatibility.
- Clean replay: start a new kernel inside the supported sandbox, use an empty working directory and declared input snapshot, and execute every non-empty code cell in displayed order. For nbclient, disable tag-based skipping (for example, configure its skip tag to a value that cannot match a notebook tag) and set `force_raise_errors=True`. If any cell is intentionally omitted, the attempt is partial and cannot make outputs current. [S02]
- Interactive selected-cell execution remains available in a live kernel. Record its true execution sequence and session. Displayed counts are hints, not a history. Interactive results are unverified because full mutable kernel state and undeclared dependencies are not captured.
- An output is **current** only if it comes from a successfully completed, strict clean replay; its code, notebook order, source snapshots/contracts, environment and engine fingerprints match; its artifact bytes verify; and the project commit points to that run. A known fingerprint mismatch is **stale**. Missing event links, interactive output, corrupt artifacts, unknown input stability or unrecorded dependencies are **unverified**. A failed/cancelled/interrupted attempt is shown as a separate status on that attempt; retain the prior last-good output and label it with its own current/stale/unverified state. Do not replace the visible set with a partial clean run.
- The clean runner records `display_id` updates as separate output-update events, including the triggering cell/request and every affected output ID. If an update cannot be attributed, those outputs become unverified. [S02, S03]
- First execution target is Linux with an enforceable reviewed sandbox. A workstation without the required namespace, cgroup/resource and scratch quota support remains edit/open/export-only. Portability of the project files does not imply that code will execute on every OS.

## Project and minimum workflow

### 1. Create and identify a project

A project is an ordinary directory with a versioned record and a hidden workspace area:

```text
analysis-project/
  project.json                  # UUID, format version, notebooks, transforms, data refs
  environment/lock.json         # resolved runtime and artifact hashes
  notebooks/*.ipynb
  scripts/*.py
  sql/*.sql
  data/                         # only when deliberately copied or bundled
  .research/manifest.json       # committed run/output pointer and project fingerprints
  .research/events.jsonl        # run and interaction events
  .research/objects/sha256/...  # immutable output and optional input snapshots
  .research/write.lock          # single-writer local lock
```

Creating a project writes a UUID and format version. A project-local data path is relative. Import registers external files by path and identity without copying or modifying the original by default. A data reference records canonical path, file size and modification time as cheap hints, full SHA-256 when computed, format, parser version/options, schema contract and validation coverage. Size/mtime alone is never identity.

Before a clean replay, snapshot every declared mutable source into an immutable content-addressed object, or use a verified stable byte source whose exact consumed bytes can be hashed. A successful hash of a path before execution is not enough. If a 5 GB source cannot be snapshotted or its stability cannot be established, allow exploratory preview if appropriate, but label runs that consume it unverified; do not call their outputs current. Reuse an existing object by digest. This costs at least a full read and may cost storage; report the cost and let the user explicitly bundle/copy data for portability. Never change the original source.

### 2. Import, schema and bounded preview

CSV, newline-delimited JSON and Parquet are the initial formats under qualification. Show the selected parser and engine versions. Type/dialect detection proposes settings; it never becomes an approved full-file contract merely because the preview looked consistent. Preview at most a configurable row/byte/time budget (initial product choice: 1,000 rows, 1 MiB rendered data, and a visible time limit). Show whether rows are first-N or sampled, the sample size, truncation and the statement “preview only; not full-file validation.” A full validation is a separately requested streaming pass and reports scanned bytes/records, schema drift and rejects.

Persist a versioned data contract containing:

- Ordered field names, logical and physical types, nullability, required/optional/additional fields and explicit missing-field policy.
- Encoding, CSV delimiter/quote/escape/header rule, null markers, decimal conventions, timestamp format and timezone policy, parser/engine versions and conversion behavior.
- Approved schema evolution rules and the validation coverage for the exact source digest.
- Record identity and output ordering rules, plus malformed-record policy.

**CSV:** start with UTF-8 text, explicit dialect and an approved column schema. Empty string remains a string unless the contract names it as a null token. Short/over-wide rows, invalid encoding, overflow and failed casts are errors. Never enable silent row skipping. A malformed record either fails the transform or, after explicit user choice, produces a reject sidecar containing the original bytes, quote-aware logical record ordinal/byte span, source digest, parse settings and error. `\r\r\n` is rejected by a streaming preflight on the DuckDB 1.5.6 candidate until the exact shipped engine artifact passes a boundary regression; this deliberately rejects occurrences inside quoted text too. Report this conservative restriction and retain the source. It is a false-rejection trade-off, not a proven release defect claim. If the exact artifact fails or cannot be checked on a target platform, defer that file/CSV path or select a separately qualified reader. [S07–S12]

**NDJSON:** accept UTF-8, one JSON object per logical line in the initial contract. Preserve field presence separately from explicit JSON `null`; keep heterogeneous values in an explicit tagged/JSON representation or require an approved cast. A malformed line is a rejection with exact raw text and line ordinal, not a skipped row. Top-level arrays/scalars and multiline non-NDJSON input are unsupported until separately specified. [S13]

**Parquet:** inspect every file in a multi-file set. Added, removed or changed fields create a schema-drift proposal; combining files requires an approved mapping. Preserve presence information for absent fields when the distinction matters. The first adapter should accept only the validated physical/logical types; encrypted files, unsupported codecs, ambiguous extensions, incompatible physical types and unvalidated nested/variant types fail with a clear error and retain the source. Do not let a union-by-name convenience silently approve a schema migration. [S14]

**Conversions and identity:** reject overflow and lossy casts unless a named conversion specifies them. Preserve decimal values exactly rather than passing through binary float. Timezone-aware timestamps may normalize to UTC only under an explicit rule; keep the original lexical value/offset when audit fidelity is required. Ambiguous local time, invalid timestamp or unspecified offset policy is an error. For a source snapshot, identify a CSV record by digest plus quote-aware logical record ordinal, an NDJSON row by digest plus line ordinal, and a Parquet row by file digest/path plus row-group and row ordinal. This is identity within that source version, not a business key across rewritten files. A one-to-one transform can preserve identity; joins, expansions and aggregates must define composite/group identity or mark row identity unavailable. Preserve an explicit source ordinal, but claim stable output order only after an explicit sort by keys with a unique tie-breaker. Otherwise order is unspecified/engine-dependent. [S01, S04, S13–S16]

### 3. Author, preview and run interactively

The notebook shows document order separately from a live-session panel with kernel session, current status and actual recorded execution sequence. A run event includes: run/event ID, interactive or clean mode, notebook path and order, stable cell ID, source hash, displayed position, actual sequence, kernel session ID, Jupyter request/message ID, parent-header links, start/end/status, source snapshot hashes, contract/parser versions, environment and engine digests, declared parameters/seeds, outputs/artifact IDs and errors. Cell execution counts remain document metadata, never the event key. Serialize commands through one kernel for each notebook session.

For an interactive cell, append a request event before dispatch and attach IOPub outputs by parent message ID. Store state-change and `display_id` update events separately. If a kernel dies, restarts, misses its session link or cannot be reconciled with the event stream, mark session outputs unverified. The UI should still show the last committed notebook outputs and identify which run produced them.

### 4. Request strict clean replay, cancel and inspect

The runner creates a fresh kernel and executes the entire non-empty code-cell sequence in displayed order. It disables nbclient’s `skip-execution` tag behavior and forces errors to fail the replay, so “clean” does not mean “most cells that the library happened to run.” Record an event before and after each cell and stream progress, output and traceback. Include the timeout policy in the environment/run record. Cancellation first requests a kernel interrupt; after a short grace period, terminate the whole sandbox cgroup, including children that leave a process group. Partial output remains attached to the failed run for inspection but is not published as the current notebook output set. [S02]

A clean replay can establish that the recorded runner attempted the same cell sequence using recorded code, a specified environment and verified input snapshots under the stated policy. It cannot promise that arbitrary Python is deterministic. Randomness without a controlled seed, wall-clock reads, thread/parallel reduction order, floating-point or hardware differences, external services, unpinned/unavailable packages and undeclared files remain outside the guarantee. Network is denied by default, so code depending on a service fails unless a future reviewed capability explicitly enables it. If undeclared inputs cannot be ruled out, hash the full read-only project snapshot or classify the result unverified; never infer dependency completeness from an import blacklist.

### 5. Status and invalidation

Keep output provenance state and latest attempt state visible as two related labels. Example: `stale · latest replay cancelled; last-good output from run R17`. A failed attempt must not overwrite the previous output object or imply its provenance changed.

| Change or event | Output effect |
|---|---|
| Edit code in a clean-run notebook | Mark the changed cell and its following clean-run cells stale; a reorder or execution-policy change invalidates the affected sequence, and the next clean run executes the full notebook. |
| Edit code, data or environment while a mutable interactive kernel has been used | Mark every output from that kernel session unverified. Actual execution order and hidden state can cross displayed-order boundaries. |
| Change a registered data digest, parser, schema contract or approved source mapping | Invalidate outputs whose event depends on it; if dependencies are unknown, invalidate all notebook outputs. |
| Change Python minor, package lock, runtime image, DuckDB engine or extension | Invalidate every output produced under that environment/engine. |
| Restart kernel | Invalidate/unverify outputs from the live session and record the restart. A separately committed clean-run artifact retains its historical provenance and is current only while all its fingerprints and artifact hashes still match. |
| Fail, cancel or interrupt a clean run | Attempt is failed/cancelled/interrupted; keep the prior committed output with its own state and show the failed attempt separately. Never publish a partial output set as current. |
| Reopen/share with missing data, missing runtime or output/event hash mismatch | Show missing dependency and stale/unverified state; block a clean replay that cannot reproduce its locked environment. Never silently infer current status from saved notebook outputs. |

### 6. Compare, save, reopen and export

Store result objects immutably by SHA-256 and associate each visible cell output with an event and artifact hash. Keep a bounded preview in `.ipynb`; large tables stay as Parquet or another explicitly selected artifact. Every truncated result announces shown rows/bytes and total rows/bytes when known, links to the full artifact, and remains exportable. Do not call `fetchall()` or materialize a large relation into pandas by default.

Comparison rules are explicit: scalar/text/MIME outputs show hashes and safe rendered/text differences; tables compare schema and row counts first, then keyed row/value diffs only when a declared key is unique and identity is stable. Without a key or defined ordering, show digests and summaries, not invented row matches. Floating-point tolerance is optional, explicit and recorded. Preview samples never prove full-dataset properties.

The small portable manifest records project UUID/format version, notebook and cell IDs/source hashes, data paths and snapshot digests, schema contracts/validation coverage, environment lock and runtime image digest, engine/extensions, parameters/seeds, event/run IDs, statuses, output hashes and object paths. Package lock must include the exact Python minor, complete package closure, wheel/artifact hashes and source/index identity. A runner image digest and platform/architecture are also recorded. `nbformat==5.10.4` and `nbclient==0.10.2` are starting pins, not a validated compatible environment. Resolve `jupyter_client`, `ipykernel`, `pyzmq`, `traitlets`, Python, DuckDB binding/extensions and all transitive artifacts together before shipping; that complete lock and wheel set has not been built or tested. [S01–S03, S06]

Use a crash-aware commit protocol on one supported local filesystem:

1. Write all run outputs and data objects to temporary names; verify content hashes, flush object bytes, then flush their containing directories.
2. Append and flush a `RUN_PREPARE` record with run ID and object hashes.
3. Write and flush a complete temporary manifest that points to the new output set; atomically rename it into place and flush the parent directory. This manifest pointer is the commit point.
4. Append and flush `RUN_COMMIT`. On reopen, the manifest pointer plus verified object hashes determine whether the run is published; repair a missing commit record if the manifest committed, and treat an unpointed prepare record as interrupted/orphaned. Preserve the previous committed manifest if the new pointer never landed.

Save notebook JSON through the same same-directory temporary-write, flush and rename approach. Enforce a single writer with a project lock; another process opens read-only or waits. Test stale-lock recovery. Do not promise lock or rename semantics on network shares. Folder exchange and explicit portable zip bundles are supported; outside data is rechecked at the destination and included only by explicit user action. No credentials, account profiles or private datasets are added implicitly.

## Memory, SQL and execution boundary

### 5 GB target

Treat 8 cores, 16 GB RAM and a 5 GB tabular input as a test target, not as an achieved result. DuckDB’s streaming and spill mechanisms make scans, projections, filters, small-cardinality aggregates and selected import/export paths plausible candidates; exact support depends on the engine version, query plan, data skew, memory and temp disk. A proposed initial DuckDB cap is 8 GiB with a visible configurable scratch quota; also cap the combined worker/kernel cgroup, CPU, process count, wall time and disk. Leave memory for the UI/OS. The database setting alone is not a process-wide memory guarantee. If a spill quota or memory cap is reached, fail the operation with the plan/resource reason, preserve any partial artifact only under the failed run, and leave the source unchanged. Global sorts, high-cardinality groups, exact distincts, large joins/windows and Python materialization may exceed limits. Validate each operator class on the target workstation before advertising support. [S15, S16]

Never rely on implicit scan/insertion order for portable results. Source ordinals are provenance fields; output row order is either explicitly sorted with a unique tie-breaker or unspecified. DuckDB’s documented insertion-order/memory trade-off is a workload-specific choice to test, not permission to drop an ordering contract. [S16]

### Optional SQL

Offer a SQL editor for `.sql` project assets and read-only DuckDB queries against registered, snapshotted CSV/NDJSON/Parquet inputs. Return bounded row/byte previews through a stream and materialize full results to artifacts. Record query text/hash, registered sources, schema contract, engine artifact, parameters, result hash and status like notebook events. Use bound parameters for UI values.

SQL executes in the same constrained worker policy, not in the UI process and not as another general language kernel. Make the label “DuckDB SQL dialect” visible. Disable extension auto-install/network loading and arbitrary `ATTACH`/`COPY` paths by default. Mount only the runtime, declared read-only source snapshots and quota-limited scratch, so a path-valued SQL table function cannot see the user’s home or unrelated files. SQL read-only mode alone is not the filesystem boundary. Any future external database access is a separate reviewed capability and outside this proposal.

### Python sandbox

Notebook code is untrusted. Run the Jupyter manager/client and kernel inside one private Bubblewrap worker/network namespace so the kernel’s local TCP ports remain unreachable from the host; relay progress through a narrow data-only control channel. Use an unprivileged identity, clean environment, private temporary directory, read-only runtime and declared source mounts, read-only project snapshot or declared files, and a dedicated writable result/scratch mount. Do not mount home, credential stores, D-Bus/system sockets, unrelated paths or host services. Deny network by default. Sanitize inherited environment variables. Review a seccomp policy with the actual runtime before relying on it.

Bubblewrap builds the namespace and mount layout; an external cgroup v2/systemd scope (or equivalent explicitly tested controller) enforces aggregate memory/CPU/process/wall limits, and a quota-limited filesystem enforces spill/output disk. Stop/interrupt the whole control group, not just the direct kernel PID. If any required permission, namespace, controller or quota is unavailable, fail closed and disable execution. These controls reduce access and resource exposure; they do not prove immunity from kernel vulnerabilities or every denial of service. [S17, S18]

## Accessibility and status presentation

Make provenance and dependency views inspectable without reading raw JSON: show code/source/environment fingerprints, changed dependency, run ID and output association. Use text labels and icons in addition to color. Announce run progress, completion, errors, cancellation and stale-state changes to assistive technology; keep error summaries focusable and preserve the full traceback behind a clear action. Make table truncation, missing inputs and rejected records explicit. Keyboard-test the diff and status flows and screen-reader-test dynamic announcements before release.

## Support boundary, opportunity and alternatives

**Initial support:** one tested CPython minor, Python `.ipynb` through Jupyter, `.py` scripts as project files, DuckDB SQL dialect for registered local tabular inputs, and the engine’s validated flat CSV/NDJSON/Parquet subset. The project itself remains an ordinary folder on other operating systems; execution is supported only on Linux images where the reviewed sandbox and resource controls pass. Unpinned/unavailable packages, network services, arbitrary untracked files, hardware/device state and uncontrolled time/randomness are outside the clean-replay guarantee.

**Opportunity:** add a schema-drift review pane at import/promotion time. Show old/new schema, added/removed fields, full-scan coverage, sample-only warnings, conversions that would lose information and quarantined records. This turns a common reproducibility diagnosis into a useful local data-quality review before downstream notebooks rerun.

**Plausible alternative:** use JupyterLab/Notebook as the complete editor/viewer and build a local provenance manager around it. That reduces UI work and keeps familiar notebook behavior, but status, output links, event persistence, project exchange and execution policy still need integration tests. Another alternative is an Arrow/Polars-first data layer or a separate CSV reader; research its exact schema/streaming behavior and test its own artifact before switching. Do not select an engine from a feature page alone. On macOS/Windows, a later reviewed VM adapter may be preferable to a partial namespace emulation, at the cost of startup, disk and file-sharing complexity. Real-time collaboration, hosting, scheduling, credentials and broad kernel support remain optional and deferred.

## Validation plan (proposed / UNEXECUTED)

Except for the tiny isolated standard-library witness listed in `witnesses.json`, none of the following was run by this candidate:

1. **Resolve the runtime:** build one exact lock and immutable image for Python, nbformat, nbclient, jupyter_client, ipykernel, pyzmq, traitlets, DuckDB and extensions. Preserve wheel/image hashes. Clean-run the same notebook twice on that exact image and compare events and artifacts.
2. **Replay edge behavior:** execute notebooks containing tagged `skip-execution` and `raises-exception` cells, errors, empty cells, output widgets and cross-cell `display_id` updates. Verify strict clean policy executes/fails as specified, output updates reference affected prior outputs, progress is visible, cancellation escalates and old committed outputs survive failure.
3. **CSV issue gate:** reproduce issue #25164 and the exact upstream test shape against every exact distributed CLI/Python artifact and supported architecture/OS. Test boundaries before/after buffers, `\r\r\n`, `\r\n`, `\n`, quoted embedded newlines, tails, parallel/sequential, repeated scans and row IDs/counts. The upstream test has `require notwindows`; add a Windows-specific independent test or keep affected CSV disabled there. Record artifact and fixture hashes. Until this passes, retain the `\r\r\n` rejection gate. The source test/PR report alone does not lift it. [S07–S12]
4. **Data contract:** stream fixtures for CSV, NDJSON and Parquet with missing versus null, empty strings, Unicode, invalid UTF-8, heterogeneous values, timestamps and offsets, decimal/overflow, duplicate field names, schema additions/removals, malformed quotes/JSON, nested/unsupported types and multi-file drift. Assert strict failure or exact reject bytes/ordinals, approved conversions, source digest unchanged, snapshot identity and preview-versus-full-scan labels.
5. **Memory target:** generate representative 5 GB inputs on 8 cores/16 GB. Measure peak cgroup and process RSS, spill/temp bytes, disk quota, elapsed time, cancellation and result correctness for streaming filter/projection, small and high-cardinality aggregation, sort, join, distinct, window and large Python fetch. Record supported operation classes per exact build; do not publish “5 GB supported” as a blanket claim.
6. **Provenance and status:** execute cells out of displayed order interactively, then edit/move cells, restart kernels, alter source bytes/schema/parser/environment, interrupt runs and reopen a project. Assert event order, session identity, current/stale/failed/unverified state, `display_id` mapping, immutable last-good outputs and full invalidation for interactive sessions.
7. **Save and exchange:** crash-inject around blob writes, `RUN_PREPARE`, manifest replacement, parent-directory sync and `RUN_COMMIT`; verify the manifest commit point, hashes and recovery. Test one-writer/read-only second opener, lock recovery, folder/zip relocation, case-sensitive paths, unavailable environment and missing external sources on each supported local filesystem. Network shares remain unsupported unless tested.
8. **Sandbox and accessibility:** review the exact Bubblewrap arguments, Jupyter control channel, mounts, no-network policy, seccomp policy, cgroup cleanup and scratch quota. Test inaccessible home/credentials, resource ceilings, child-process cleanup, cancellation and fail-closed behavior on supported Linux distributions. Perform keyboard and screen-reader checks for statuses, errors, diffs, progress and truncation. These tests measure the selected policy; a passing setup does not prove protection from kernel exploits.

## Candidate-executed isolated component check

`W02` in `witnesses.json` is a candidate-authored Python standard-library check executed through the admitted isolated execution capability. Four synthetic NDJSON lines contained Unicode, explicit null, a missing optional field, malformed JSON and invalid JSON text. The code retained valid record ordinals, distinguished missing from null, preserved both rejected raw lines, rechecked the input digest, and verified a canonical provenance key changes when cell, data, contract, runtime or engine identity changes. It exited 0. This checks only the authored component assertions; it did not execute a notebook, DuckDB, a CSV parser, a sandbox policy, filesystem recovery, or a large input. It establishes none of the unexecuted runtime or performance claims above.

## References

The exact source URLs, tags/commits, locators and capture hashes are in `sources.json`. In particular, the CSV chain is `[S07]` issue report → `[S08]` branch-specific fix → `[S09]` regression source → `[S10]` unmerged port snapshot → `[S11]` tag-path 404 and `[S12]` corresponding v1.5.6 scanner source. `[S06]` is release metadata, not binary evidence. Notebook format/runtime claims use the independently maintained Jupyter sources `[S01]`–`[S03]`, with security transport context `[S18]`; data-engine/performance claims use DuckDB sources `[S04]`–`[S16]`. Bubblewrap policy limits are sourced separately at `[S17]`.
