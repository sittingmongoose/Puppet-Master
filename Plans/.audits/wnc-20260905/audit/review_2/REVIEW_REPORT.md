# Working Notebook and Context Continuity — independent repository review

## Verdict

**Substantial specification work is present, but a clean Plans-level completion sign-off is not justified. Targeted repair is required.** This is not a recommendation to redesign the notebook system or begin application implementation.

Repository: `sittingmongoose/Puppet-Master`  
Reviewed commit: `2826699f7e7f23ab12a8fdfaf5f1518748f12d5a`  
Packet: `PM-WNC-2026-09-05-v1`  
Work item: `wnc-20260905`  
Review date: September 6, 2026

### Basis and limits

The original packet was read from the attached ZIP and compared with current repository content retrieved through the GitHub connector at the pinned commit. The packet defines 85 requirements and 62 acceptance scenarios. Its owner/consumer list is a review inventory, not an instruction to rewrite every candidate file.

This review inspected substantive sections of the notebook owner, Prompt Pipeline, Shared Integration Runtime, Tools, Assistant memory, Usage, Automated Testing, and the new notebook schema, fixtures, and validator. Repository publication rules and the specifically named audit/test paths were also checked. Generated shard indexes were navigation aids, not substitutes for canonical proof.

The full oversized Assistant Chat owner could not be retrieved through the connector's file/blob interface. The audit report location named by the delivery was not available in the committed repository. There was no full local repository checkout on which to rerun standard gates. Therefore this is **a source-backed defect review, not a complete 85-row/62-scenario certification, a rerun of repository-wide gates, or an independent parallel-agent audit**. No repository edits were made.

Ten small local probes reproduce retrieved schema fragments, transition-invariant predicates, and the validator's argument parser. These are explicitly labeled source-fragment reproductions, not execution of the full repository validator or product runtime. The probes include a valid control case and deliberately malformed examples; their acceptance demonstrates the described validation gaps, not successful product behavior.

## What landed well

The notebook is specified as bounded working state rather than another authoritative memory/Goal/Plan/To-Do database. Sharing selects revisions and permitted recipients; derived restrictions survive paraphrase, export, capsules, and handoff. Destination owners retain promotion authority. The Attempt Journal and five-to-ten-line Parent Summary remain separate bounded contracts, with deeper notebook material available by reference. These are substantive requirements in `Plans/Working_Notebook.md`, especially WN-010 through WN-014, not merely source-ID lists.

Prompt Pipeline distinguishes fresh-context transitions from run rotation and retains bounded, shared context admission. Shared Integration Runtime carries operation identity, admission, recovery, and cancellation-fencing responsibilities instead of handing those responsibilities to notebook prose. These sections preserve the intended architectural direction.

`Plans/Tools.md` defines exact bounded `chatread` in addition to search, read-time authorization parity, Unicode/range conventions, aggregate output limits, and truthful index-lag behavior. The issue below is that the machine-readable request schema does not enforce much of that specification.

`Plans/usage-feature.md` UF-099–UF-101 correctly separates occupancy, cumulative consumption, estimated cost, and subscription quota. It preserves accounting across transitions/replay, counts genuinely billed retries, distinguishes local work from provider consumption, attributes helper overhead, and refuses unmeasured savings claims.

`Plans/Automated_Testing_System.md` ATS-046 correctly says static fixture validation does not establish native runtime, security, recovery, visual, or performance proof. Lack of application runtime execution is **not** a defect for this Plans-only task.

## Required repairs

### WNC-R01 — Conflicting live memory verification rules

**Priority:** High. **Classification:** canonical contradiction. **Repair required:** Yes.  
**Packet coverage:** WNC-M02, WNC-M03, WNC-V01, WNC-V02.

**Evidence:** `Plans/assistant-memory-subsystem.md` §5.3, approximately lines 271–294, still says a gist MUST become Verified if any of three conditions hold, including merely having a Commit EvidenceRef. The new Claim-Level Verification And Notebook Boundary Addendum, approximately lines 2515 onward, says evidence existence is not semantic proof and unsupported claims must remain Unverified. Its introduction expressly says it strengthens §5.3 and **does not replace** it. AMS-044 provides the new per-claim support rule; AMS-045 addresses invalidation.

The original unconditional sufficient conditions and the new necessary claim-support conditions cannot both be applied literally. A builder reading §5.3 can still implement precisely the weak verification behavior this packet was supposed to correct.

**Repair:** Rewrite the operative §5.3 rule to make reference validity, claim support, scope, and currentness coherent conditions. Retire the old existence-only sufficient conditions explicitly and reconcile AutoRunBoundary, AutoMilestone, manual verification, and injection consumers. Preserve historical lineage without leaving competing active MUST rules. Clarify that legacy weakly Verified data is revalidated before it can next auto-inject, rather than relying on an unspecified later evaluation.

**Closure evidence:** Cases for unrelated commits, unrelated successful tests, valid-but-irrelevant artifacts, mixed supported/unsupported claims, stale evidence, and migrated weak labels. Demonstrate the same outcome from the primary section, PlanUnits, schema, and consumer logic. Do not invent deterministic proof of unrestricted natural-language entailment.

### WNC-R02 — Tool request schema is largely an unchecked argument bag

**Priority:** High. **Classification:** incomplete typed contract / prose-schema drift. **Repair required:** Yes.  
**Packet coverage:** WNC-N09, WNC-H01, WNC-H04, WNC-V02, WNC-V03.

**Evidence:** `Plans/working_notebook_contracts.schema.json`, `$defs/tool_request`, requires `tool` and `args`, but `args` is essentially an unrestricted object. The conditional for notebook/history reads checks only a supplied range's convention. It does not require the identifiers, required mutation body/request ID, valid range endpoints, or operation-specific shape described in `Plans/Tools.md` T-183/T-184, approximately lines 12770–12860.

Local source-fragment probes confirm that both of these are accepted:

```json
{"tool":"chatread","args":{}}
{"tool":"notebook_write","args":{}}
```

A read with negative start/end offsets is also accepted. Arbitrary argument names are accepted.

A concrete drift is already present in the positive fixtures: `fresh_context_request` uses `notebook_checkpoint_required`, while the registered Tools signature uses `checkpoint_required`. The positive notebook-read fixture also uses `include_neighbors` where the documented notebook-read signature names `include_provenance`. The open schema cannot distinguish an intentional alias from an accidental mismatch.

**Repair:** Define operation-specific request branches with required inputs, closed or deliberately versioned argument sets, exact range representation and constraints, CAS/idempotency semantics, and response/error shapes. Resolve the actual argument-name differences explicitly. Separate creation and update preconditions instead of making every relevant field optional. Server-side authorization remains essential; schema validity must never imply permission.

**Closure evidence:** Positive requests for each admitted operation and negative cases for missing IDs/body/request ID, wrong types, unknown argument names, negative/reversed/mixed ranges, oversized output/input requests, and stale revision semantics where statically representable.

**Not a finding:** A separate agent tool literally named `notebook_checkpoint` is not inherently required. The final catalog can legitimately keep checkpoint commit host-owned. This review does not demand another tool just to match an earlier illustrative name.

### WNC-R03 — Successful transition states admit inconsistent records

**Priority:** High. **Classification:** state-dependent schema and invariant gap. **Repair required:** Yes.  
**Packet coverage:** WNC-C05, WNC-C06, WNC-C09, WNC-P01, WNC-V02, WNC-V03.

**Evidence:** `Plans/working_notebook_contracts.schema.json`, `$defs/context_transition_record`, and the transition loop in `scripts/pm-working-notebook-contracts.py::check_explicit_invariants`.

For activated/recovered success, the schema's conditional constrains the type of `admission_receipt_ref` if supplied, but does not require the property. A successful record with that property absent therefore passes the schema. The script's additional invariant **does catch this specific absence**; it would be incorrect to say the entire validator misses it.

However, a PM-managed record with `state=activated` and `new_context_window_id=null` passes both the reproduced schema and the retrieved transition-specific invariant predicates. So does `state=activated` with `effective_controller=unavailable`, provided the other required fields and receipts are supplied. These are not opaque provider-native observations: the probe deliberately uses a PM-managed requested path.

**Repair:** Add coherent state-dependent requirements. Distinguish requested/unknown/unobserved provider states from observed PM activation. Require the admission evidence and next-window identity appropriate to success, reject unavailable-controller activation, and synchronize schema and explicit invariant checking. Where references carry additional authority externally, specify that relationship instead of implying string presence proves execution.

**Closure evidence:** Success, requested/deferred/failed/cancelled, missing receipt, null next window, unavailable controller, native activation without PM observation, and crash cut points. Static success fixtures remain illustrative records, not fabricated runtime receipts.

### WNC-R04 — Fixture validation can lose coverage without failing

**Priority:** High. **Classification:** fail-open validation inventory. **Repair required:** Yes.  
**Packet coverage:** WNC-V03, WNC-V04, WNC-V06.

**Evidence:** The root arrays in `Plans/working_notebook_contracts.schema.json` are required but have no minimum contents. `scripts/pm-working-notebook-contracts.py` iterates `fixtures.get("negative", [])` and uses `all(...)` over the resulting rejection booleans. It has no expected negative-ID inventory or required scenario mapping.

Consequently, an empty negative list makes the rejection check true. Empty required positive arrays pass the root schema and skip the corresponding invariant loops. With the existing valid storage registry left in place, the feature validator has no coverage-count check that would turn that deletion into a failure. The local probe confirms the root-schema/empty-list behavior; the full repository gate was not rerun.

The validator also assigns the negative fixture's `rejects` pointer but never uses it to establish that the intended object or constraint caused the rejection. It accepts any schema error for the mutated document. This is weaker than a constraint-specific negative test.

**Repair:** Validate fixture inventory independently from record shape. Require stable IDs, nonempty required families, positive controls, intended rejection targets/classes, and a complete mapping of the 62 acceptance scenarios to concrete static cases or explicitly identified future-runtime obligations. Include regression tests that delete an entire fixture family or negative set and prove the validator fails. Do not merely hardcode a count while allowing replacement by duplicates or irrelevant cases.

**Important qualification:** Seventeen negative fixtures are not automatically inadequate merely because the packet has 62 scenarios; one fixture can support multiple scenarios and many scenarios need several cases. The defect is missing enforceable mapping and inventory integrity. The claimed complete scenario bundle was not available at the named committed audit path.

### WNC-R05 — The repeatedly documented validator command is invalid

**Priority:** Medium. **Classification:** executable documentation/interface mismatch. **Repair required:** Yes.  
**Packet coverage:** WNC-V04; affected PlanUnit validation surfaces.

**Evidence:** Numerous notebook and Tools PlanUnits prescribe:

```text
python3 scripts/pm-working-notebook-contracts.py validate
```

The actual parser accepts only `--json`; it defines no positional `validate` command. The local reproduction of the same argparse declaration returns exit code 2 for `validate`.

ATS-046 instead lists the valid bare script and wrapper subcommand `python3 scripts/pm-plans-verify.py validate-working-notebook-contracts`. Thus a wrapper can pass while the validation commands embedded in other live PlanUnits are broken. This is not evidence that every reported full-gate result was false.

**Repair:** Either add a compatible `validate` subcommand or correct all live references to the admitted interface. Add a regression that executes every documented supported form, and audit wrapper commands separately.

**Closure evidence:** Exact commands, exit codes, and logs from a clean checkout, with no argument-error suppression.

### WNC-R06 — The test file claimed by ATS-046 is not committed at its cited path

**Priority:** Medium. **Classification:** missing published validation artifact. **Repair required:** Yes.  
**Packet coverage:** WNC-V03, WNC-V04.

**Evidence:** ATS-046 expressly cites `tests/test_pm_working_notebook_contracts.py` as test coverage. A direct GitHub file fetch at the reviewed commit returned 404. `.gitignore` excludes `/tests/*` except four specifically allowed unrelated files; the notebook test is not one of those exceptions.

The test might exist in an agent's local worktree. This review does not assert it was never written or executed. It is nevertheless unavailable at the path the committed Plans tell a new agent or checkout to use.

**Repair:** Publish the intended reusable regression test through a narrow tracked exception, or correct the Plans to a real committed replacement test. Do not broadly publish all ignored runtime/test captures.

**Closure evidence:** Fetchable tracked test source and successful fresh-checkout execution; test count and behavior must match the published claims.

### WNC-R07 — The claimed audit/coverage evidence is unavailable from the committed delivery

**Priority:** High for sign-off reproducibility. **Classification:** evidence unavailable, not proof of absent local work. **Repair required:** Publication/currentness closure required.  
**Packet coverage:** WNC-S05, WNC-V01, WNC-V05, WNC-V06.

**Evidence:** The delivery refers to WNC audit work under `Plans/.audits/wnc-20260905/`, including `audit/REAUDIT_1.md`. The directory and report were not available through GitHub at the pinned commit. `.gitignore` excludes `Plans/.audits/`.

Therefore this review could not independently check the promised exact implementation manifest, 85-requirement closure, 62-scenario coverage, actual gate logs, final subject fingerprints, or independent review/repair dispositions from that location. A commit message describing passes is not equivalent to those records.

**Repair:** Publish or attach a sanitized, compact evidence bundle with exact packet identity, baseline/final subject hashes, requirement/scenario mapping, findings/closures, actual validator commands and outputs, and review provenance. A tracked report location or separately delivered artifact is acceptable; blanket inclusion of all historical audit files is unnecessary. Preserve genuinely local/private evidence exclusions.

**Closure evidence:** A second agent can reconstruct what was checked, against which exact bytes, which defects were repaired, and what remains unexecuted. An unrelated newer audit must not replace this work item's evidence.

## Repair order and acceptance

First reconcile memory authority and request/state contracts (R01–R03). Then harden the validator so the regressions can no longer pass (R04), reconcile documented command forms (R05), publish the missing reusable test (R06), and publish current audit/coverage evidence (R07).

Run the scoped static validation and negative regressions against a clean/disposable checkout, preserve true exit codes and baseline failures, then re-audit direct consumers and superseded clauses. If governed Plans change, perform the already authorized phase-separated governance seal after semantic closure. Do not create WorkNodes, NodeSeeds/candidates, build queues, product/concept code, or a readiness unlock.

A satisfactory response is not another addendum announcing all findings closed. It is coherent operative prose, schemas that reject the demonstrated counterexamples, tests that detect loss of coverage, fetchable evidence, and a reproducible report tied to the final subject.

## Probe inventory

`schema_fragment_probes.py` and `schema_fragment_probe_results.json` record:

1. Empty chatread arguments accepted.
2. Empty notebook-write arguments accepted.
3. Negative read offsets accepted.
4. Unknown tool argument accepted.
5. Valid transition control accepted.
6. Missing admission receipt accepted by schema but caught by the script's transition predicate.
7. Activated PM-managed transition with null new window accepted by both checked layers.
8. Activated transition with unavailable controller accepted by both checked layers.
9. Empty positive families / empty-negative `all` behavior.
10. Documented `validate` argument rejected with code 2.

These are bounded source-fragment probes, not a substitute for the repository-wide or runtime tests explicitly marked not executed above.
