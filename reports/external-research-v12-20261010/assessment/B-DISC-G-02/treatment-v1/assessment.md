# ER12 B-DISC-G-02 treatment — independent bounded DISC assessment

Source judgment: **FAIL**. Two supported material findings remain (F01/F02). Delivery is complete and the required discovery elements are present. This is a brief-only role judgment, not a full-pipeline grade. Native completion, effective model and billing remain UNKNOWN.

Reviewed the full rubric; role input map, assignment and freeze; mapped common assignment and fixture; authored discovery, source map and every one of six source members. Corpus is null, so no corpus member is missing. Also inspected this arm's own request/dispatch, native receipt and terminal freeze, plus the input manifest. No other arms, histories, outcome labels, roster, canon, accounts or ER11 material were consulted. No delegation or candidate assistance occurred. Only the reserved assessment directory was written.

## Material findings

**F01 — Signed provenance overstates protection against a compromised job.** Candidate [discovery.md:7](ER12_RUNTIME/runs/B-DISC-G-02/treatment/stages/role/discovery.md:7) says: “Inference: covers the compromised-job claim via signed source, resolved deps, and builder ID.” Its [minimal verification recipe at line 17](ER12_RUNTIME/runs/B-DISC-G-02/treatment/stages/role/discovery.md:17) checks subject, signature, builder set, source digest and build type. The stated failure boundary covers missing/untrusted provenance, stolen keys and off-map builders, but leaves the integrity of job-supplied claims unbounded.

The governing [SLSA v1.0 generation requirements](https://slsa.dev/spec/v1.0/requirements#provenance-generation) distinguish authentication from tenant-resistant generation; Build L2 permits tenant-generated nonrequired fields, including resolved dependencies, and Build L3 imposes stronger control-plane/isolation requirements with stated exceptions. [P07 captured lines 251–315](primary/P07.view.html#L251) preserve those conditions. This is material to the supplied compromised-job threat: a valid signature and expected identity alone do not establish that the job reported its actual inputs. No supplier-wide certification policy or specific deployment is demanded; the mechanism needed this failure boundary.

**F02 — Dependency binding omits best-effort coverage.** The same sentence and the [SLSA comparison row at line 29](ER12_RUNTIME/runs/B-DISC-G-02/treatment/stages/role/discovery.md:29) credit binding source, dependencies and builder. [SLSA v1.0 BuildDefinition](https://slsa.dev/spec/v1.0/provenance#builddefinition) makes resolved-dependency coverage best effort even through Build L3; see [P01 lines 626–634](primary/P01.view.html#L626). A correctly authenticated statement can therefore omit a consequential dependency. Because using a different dependency is the brief's central threat, omission of this boundary materially broadens the credited capability. Listed dependencies remain useful evidence; universal recursive verification or a hermetic build is not an invented requirement.

Both findings are semantic judgments supported by exact candidate and primary locators. They are not inferred from hashes, source counts, evaluator agreement or lack of deployment. Calling a statement “Inference” does not establish the consequential capability it proposes.

## Assigned axes and exact obligations

| Assigned axis | Assessment |
|---|---|
| Brief obligations / negative constraints | Present: 779 whitespace-delimited words (required 700–1000), four diverse items, two inspectable leads, one historical/version lead, comparison, three questions/tests, uncertainty and bounded next step. Excluded installer implementation, certificate operations and whole-program policy; no universal winner. |
| Source conditions / applicability | Material gaps F01/F02. Predicate, artifact subject, signer identity, builder trust, parameters, dependency domain and source-version distinctions were inspected. |
| Discovery / alternatives / implementation / history | Substantive coverage: provenance claims, identity/transparency, multi-step policy and update-channel protection. Leads are inspectable documentation/repositories, not executed code inspection. Depth limitations below. |
| Discriminating prospective checks / actual status | Three useful adversarial themes; missing-provenance policy and dependency-mutation oracle need qualifications. Zero observed executed semantic tests. |
| Capabilities / choices / uncertainty / next step | Builder list, block-or-warn, parameters and offline roots remain product choices. TUF/in-toto/Cosign/version uncertainty is explicit; central conditions in F01/F02 are omitted. |
| Dispositions / preserved scope | No seeded plan or critique exists, so no imagined rejection/disposition is graded. Preserve supported shortlist contributions and narrow unsupported coverage. |
| Finalization / full pipeline | Not assigned. No final-section artifact required for DISC; no guessed missing-final FAIL or pipeline qualification. |

Six candidate URLs and six authored source members span four named projects. At least the SLSA provenance and verification documents plus TUF overview provide substantive primary evidence across two projects. The delivered map reports six retrievals against the candidate's eight-page ceiling. Exact fetch execution and HTTP chronology cannot be authenticated from authored excerpts alone; that limitation is separate from source correctness.

## Supported discoveries, conditions and limitations

SLSA's documented [verification procedure](https://slsa.dev/spec/v1.0/verifying-artifacts#step-1-check-slsa-build-level) checks artifact subject, predicate, trusted signature/builder mapping and expectations; [P02](primary/P02.view.html#L89) is navigable. Its optional dependency recursion has no universal completeness requirement. An approved ignored-parameter list is an exception to parameter checking. The candidate's generic “trust map” might encode authorized signer-builder pairs, so an actual authorization bypass is not asserted from its abbreviated recipe.

The [Sigstore overview](https://docs.sigstore.dev/about/overview/#how-sigstore-works) independently corroborates ephemeral identity credentials and a signing-event log. The useful distinction between identity authentication and build correctness survives. “Issuance record” is imprecise: Rekor chiefly records signing information. Identity, issuer, roots and log verification must be scoped to the chosen operation.

L01: the [Cosign implementation lead at line 19](ER12_RUNTIME/runs/B-DISC-G-02/treatment/stages/role/discovery.md:19) is real, but [image attestation documentation](https://docs.sigstore.dev/cosign/verifying/attestation/) and [verification instructions](https://docs.sigstore.dev/cosign/verifying/verify/#verify-attestation) do not establish this named operation for an ordinary installer file. [P11 lines 324–338 and 401–410](primary/P11.view.html#L324) distinguish image and blob workflows and identity/issuer policy. Count this as a lead; transport, bundle handling and release-specific flags remain unresolved. No container deployment is assumed.

The [in-toto stable v1.0 specification](https://github.com/in-toto/specification/blob/v1.0/in-toto-spec.md#22-in-toto-components) corroborates the layout/functionary alternative. Artifact rules and inspections connect material/product contents, not just signatures or step names; [P09 lines 462–524](primary/P09.view.html#L462). Its defaults, trusted policy and replay boundaries matter if selected. The [specification index](https://in-toto.io/docs/specs/) distinguishes layout and attestation formats. The candidate openly retrieved only an index, so no layout execution or field semantics are credited.

[TUF overview](https://theupdateframework.io/docs/overview/) and [roles/metadata](https://theupdateframework.io/docs/metadata/) corroborate freshness/rollback protection and authenticated target metadata. It is a useful complement, not evidence of the artifact's source or dependencies. The candidate explicitly leaves detailed roles unresolved; a complete updater is outside scope.

The historical lead is corroborated by the retired v1.0 page's v1.2 pointer, major-version predicate, migration and change history. A current minor-version pointer does not identify the producer's implementation version or widen trust. The candidate proposes a v1.2 comparison and does not claim to have performed it.

L02: [test 1 at line 36](ER12_RUNTIME/runs/B-DISC-G-02/treatment/stages/role/discovery.md:36) defines success as a blocked installation although line 42 leaves block-or-warn open. Its pass criterion is conditional on that product choice, not a decided obligation.

L03: [test 2 at line 37](ER12_RUNTIME/runs/B-DISC-G-02/treatment/stages/role/discovery.md:37) lacks an independent expected dependency and a clearly valid re-attested variant. Editing a lockfile/digest may instead change source, subject or signature. It is a useful prospective question with an under-specified oracle, not an observed dependency-policy success or failure. [Test 3](ER12_RUNTIME/runs/B-DISC-G-02/treatment/stages/role/discovery.md:38) has a sound untrusted-builder theme, subject to actual trusted signer/builder policy.

## Delivery, validation, native, protocol and time

Delivery: discovery, source map and all six evidence members exist. Candidate says its six web retrievals succeeded; those are not executed installer/service checks. Repositories are explicitly unfetched. This brief has no deployed installer and does not require one. Independently retrieved governing primary pages and saved eleven HTTPS captures (all HTTP 200), section/line views, exact retrieval times and hashes in [source-map.json](source-map.json) and [primary-evidence.md](primary-evidence.md). One local extraction import failed because bs4 was absent; standard-library extraction succeeded without installation.

Native: [native-goal-receipt.json](ER12_RUNTIME/runs/B-DISC-G-02/treatment/stages/role/native-goal-receipt.json) records one goal ID and active status with the exact wrapper objective. This is a saved purported activation response, not an independently observed provider transcript. No native terminal receipt is present in the permitted package. The T3 terminal summary reports completion after saves at 05:01:02Z, but a summary is not native completion proof. Actual native completion, exactly-one count and activation/read/save order remain UNKNOWN. Root's verified T3 status is completed with no pending child runs; keep it separate.

Model/billing: fixture nominal label is “GLM 5.3 Flash Max”; the actual request and T3 dispatch echo AUTHORIZED_PROVIDER_INSTANCE / muse-spark-1.3-contributor with requested max effort. These establish the routed request, not effective provider execution or billing. Effective model, effort, account and billing are UNKNOWN. No account operation was performed.

Protocol: all inspected frozen inputs and terminal artifacts match. No unauthorized assistance is evidenced in the permitted package, but absence and native ordering cannot be proved without a transcript. Those unknowns do not change the independent semantic FAIL. Reviewer used one actual native Goal; the live active response is saved, and completion follows the saved judgment. Only own pm-mail inbox was checked.

Time: request 04:56:04.161Z; root observed completed/no pending at 05:04:01.523549Z; candidate absolute deadline 05:11:04.161Z. Delivery before deadline is corroborated, with request-to-completed-observation upper bound 477.362549 seconds. This is not an exact completion time, occupancy measurement, billing saving or paired latency claim. Candidate's final science/source file mtimes precede the deadline; exact native finish time remains UNKNOWN. Reviewer began 05:04:16Z and saved this assessment well before the 05:29:16Z review limit.

## Inspected hashes and preservation

[inspected-artifacts.json](inspected-artifacts.json) contains path, SHA-256, byte count, reading basis and freeze matches for all inspected artifacts. All 16 terminal entries and all five frozen inputs match; the duplicate dispatch record is byte-identical to the fully read dispatch. Key science hashes:

- discovery.md: 683fb7869b0013df2e756c434f8f057893789297cc45e12ef004815566501543
- candidate source-map.json: b57047dc6e605145436f9f15d1fc6a9e8b149e3b55f2338af4ce05d62f532df0
- common assignment.md: 599616a793cbad684a884396d85246ca2ab2a72cd0030379da4abe004f75357c
- fixture.json: 8bd7bc2d640033063d6db3d4c31343f3e88d9ae0366a231c6f525a355c62d583

Hashes establish inspected bytes, not scientific correctness. Candidate science and freezes remain unchanged. No feedback, repairs, Git/publication, other-arm comparison, speed claim or ER11 rescore was made. Complete structured axes, findings, unknowns, source versions and evidence paths are in [assessment.json](assessment.json).
