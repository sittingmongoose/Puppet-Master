# Independent critique — C-P04 export-worker architecture

**Run/stage:** C-R2-P02-control / critic  
**Review basis:** original brief; frozen investigator discovery and draft; exact revealed plan; carried source index and source map; independently checked primary documentation listed in [sources/index.md](sources/index.md).  
**Research checks:** Documentation only. No converter, downloaded code, sandbox, or future host was run or configured. Validation witnesses below remain proposals.

## Disposition

The investigator package covers the full brief and all four released-plan clauses. Its core architecture is coherent: host-owned job transactions, a native process compatibility path, a conditional WASM alternative, constrained in-process use, explicit capability preflight, staged outputs, cancellation escalation, resource accounting, preset migration, fair scheduling, and validation proposals. It does not choose a converter or runtime, and it does not claim the future host was tested.

I found two material incomplete points that affect whether the proposed guarantees can hold, one unsupported wording claim about bounded queue progress, and one minor source locator/version caveat. I found no material wrong claim or false correction. Keep the complete brief and plan scope. These findings identify questions for the final author; this critique is not authority to narrow scope or to treat a recommendation as resolved.

## Findings

### 1. Snapshot read-only status needs an enforceable boundary

**Classification:** Material incomplete  
**Draft locator:** Recommendation; Clause 1, “Retain with a contract”; Clause 2, “Worker boundary”; Brief obligation crosswalk, “Input snapshot protection and sibling exports.”  
**Evidence:** The brief requires canceling an export without corrupting its input snapshot or another export. The draft calls the worker’s snapshot immutable/read-only, while also correctly warning that a same-user process can retain broad filesystem rights and that a process boundary is not a sandbox. Its proposed hanging-worker witness checks that the snapshot survives, but the document does not say how the read-only property is enforced on each supported host.

“Read-only” is currently a protocol/path promise. State which OS mechanism, identity, or capability boundary prevents a hostile converter from changing the snapshot or reaching another job’s files; identify the fallback when that enforcement is unavailable. The witness should attempt mutation, replacement, deletion, and access to another job’s staging area, in addition to checking bytes after cancellation. The same host policy must protect the original document and the snapshot during creation and export.

**Uncertainty:** A final implementation could enforce this through platform-specific rights or a runtime capability boundary. The draft does not select or describe one, so I cannot conclude the guarantee is impossible; I can conclude it is not yet specified.

### 2. The host must know the expected output set independently of the worker manifest

**Classification:** Material incomplete  
**Draft locator:** Clause 1, “Correct the completion contract” and “Two-phase promotion”; Clause 4, “Promotion”; proposed witness, “Exit 0 with incomplete manifest.”  
**Evidence:** The revealed plan explicitly questions whether a status and path list establish completeness. The brief makes success conditional on the declared outputs being complete and transferable. The draft says the manifest should list “exact expected outputs” and that the host verifies “each listed path.” It does not expressly define an independent expected-output set from the job request or converter contract and compare the worker’s manifest against it.

If the worker controls the list that is later checked, it can omit a required output and still provide a self-consistent manifest. Clarify how the host obtains required output cardinality, names, formats, and any required companion files before accepting the worker’s completion claim. The proposed witness already includes a missing path; make the expected set host-known so it detects an omitted manifest entry, not only an entry whose file is absent.

**Uncertainty:** “Exact expected outputs” may intend such an independent contract. The text does not say so, which leaves a consequential ambiguity rather than proving the design accepts incomplete output.

### 3. “Bounded queue progress” needs its eligibility assumptions

**Classification:** Unsupported  
**Draft locator:** Clause 4, “Fairness,” especially “An age boost or explicit admission slot gives bounded queue progress.”  
**Evidence:** The draft gives a sensible age-aware fair-share recommendation, recognizes that strict priority can starve work, and proposes a concurrent small/large witness. But it names no eligibility conditions or bound. An older job cannot progress if it cannot fit the available resource budget, its converter limit permanently blocks admission, or capacity is continuously unavailable. The phrase reads as a guarantee stronger than the described scheduler.

Qualify the guarantee (for example, while an eligible slot and required budgets become available under stated arrival assumptions) or reserve the wait bound for the proposed measurement and owner-set service target. This does not require choosing numerical quotas before the platform and UX targets are known.

### 4. Wasmtime-WASI evidence is on a mutable latest URL

**Classification:** Minor locator/version wording  
**Draft locator:** Clause 2, “WASM alternative”; cited source S06.  
**Evidence:** The carried S06 URL uses docs.rs/wasmtime-wasi/latest. Its source map associates the inspected result with the 49.0.2 family. My independent official docs.rs result confirms the described preopen, permission, and no-filesystem-by-default behavior, but did not expose an exact release for the latest alias. This does not undermine the conditional architecture recommendation, which already says to pin the runtime and support matrix. Preserve S06’s identity, mark the exact version as unconfirmed in this review, and use a versioned URL before relying on it for implementation.

## Full-scope assessment

| Brief / plan obligation | Independent assessment |
|---|---|
| Extension discovery and capability negotiation | Covered. Declarative descriptors, stable identity, explicit format choice, and preflight/worker confirmation are distinguished from proof of behavior. Required capabilities fail closed before work. No converter is selected. |
| Process, runtime, and cooperative isolation alternatives | Covered with platform limits. The subprocess path is not misrepresented as a filesystem sandbox; WASM imports/preopens and per-memory limits are conditional; in-process use is limited to trusted code. |
| Filesystem access, snapshots, temporary outputs, and errors | Mostly covered; finding 1 is material because the actual read-only and cross-job access boundary is unspecified. Private per-job staging, path checks, quotas, and destination separation are otherwise addressed. |
| Completion, output integrity, and destination transfer | Strong treatment of exit status, digests, format validation, transfer, atomicity limits, and provider uncertainty. Finding 2 leaves omission detection dependent on a host-known expected-output contract. |
| Cancellation, progress, crashes, and hangs | Covered. Progress is bounded and distinct from control; cancellation request is distinct from terminal cancellation; escalation, process-tree stop, cleanup, and commit races are discussed. LSP is protocol precedent, not proof converter work stops. |
| Fair resource use and editor responsiveness | Covered as a policy recommendation with a proposed small/large contention witness. Qualify the bounded guarantee per finding 3; the draft correctly avoids promising fixed editor latency from worker caps or OS CPU controls. |
| Preset stability across converter updates | Covered. Exact identity/schema information and explicit migration/review address the no-silent-reinterpretation requirement. The draft correctly says API compatibility metadata alone does not guarantee semantic compatibility. |
| Plan Clause 1: declaration, staging, manifest, promotion | Disposition is explicit and generally sound; finding 2 is the remaining completeness ambiguity. Destination-specific commit guarantees remain conditional and assigned to owners. |
| Plan Clause 2: process boundary, timeout/memory, progress, cancellation | Evidence-backed conditional disposition. Requested policy is separated from actual enforcement, including descendant and platform conditions. No sandbox label is treated as a memory cap. |
| Plan Clause 3: preset version/configuration and compatibility-range assumption | Correctly rejects silent semantic reuse based only on a compatible range and proposes recoverable, reviewed migration. |
| Plan Clause 4: fairness, promotion, and required witnesses | All requested witness classes are present: hanging worker, excess output, failed transfer, small versus large concurrency, and upgrade/preset behavior. The progress/cancel race is a useful addition. All are proposed and not run. |
| Executed versus proposed validation | Clear. The draft reports no executable checks and does not claim to have tested the future host. I ran no executable witness either. |

## Evidence and open decisions

Primary-source checks support the draft’s consequential external claims: Pandoc format selection and release changes; LSP cancellation responses and tokenized progress; WIT imports/exports and package-version syntax; Wasmtime’s per-linear-memory limit/default and WASI preopens; Linux cgroup CPU/memory behavior and rename semantics; Windows Job Object child, time, CPU, and memory conditions; Apple file authority; and VS Code manifest metadata. Source identity, access, conditions, and independent-check limitations are in the critic [source-map.json](source-map.json); the navigable index preserves every carried source ID. S04 remains mutable main; S06 remains version-unpinned at latest.

These items remain honestly unresolved external inputs, not reasons to reduce the research scope: supported OS versions and privileges; converter trust, package distribution, and discovery roots; what “complete” means and which formats have validators; destination acknowledgment/rollback semantics; resource budgets and service targets; preset pin/migration policy; and whether to support a WASM ABI or trusted in-process converters. The draft identifies these as owner decisions. Keep guarantees conditional until the relevant owners choose.

I found no material wrong claim in the primary-source comparisons. The chief correction needed is specification clarity: describe enforceable snapshot authority and compare worker output against an independently known expected set. The scheduler should state its progress assumptions.
