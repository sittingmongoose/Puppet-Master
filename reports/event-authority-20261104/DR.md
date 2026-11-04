# DR — Event Authority, authorized mechanical fix round 4

Branch `plans/ea-w2-runtime-artifacts-20261104`; reviewed head `19c4973d6bd8fc71360fe012eede59cf31da5848`; implementation **`a2f381cf001a1c3d1e551228cb47bea1c2c04960`**. The report-only delivery head is pinned in external `drafts/DR/HEAD.txt`.

**Result:** 0/19 independently prepared before → **19/19 self-graded prepared without admission** after. All 228 cells were regraded: **188 PASS / 21 PARTIAL / 19 ABSENT → 209 PASS / 0 PARTIAL / 19 ABSENT**. Membership remains ABSENT; native execution remains NOT_RUN. Independent acceptance remains the lead's work. Jared explicitly authorized this extra mechanical round despite the review's prior cycle cap.

## Review round 4: findings and responses

- **B1 — fixed (`a2f381cf001a1c3d1e551228cb47bea1c2c04960`).** Where: `scripts/pm-runtime-artifact-event-drafts.py:47` (SchemaReferences), `:804` (pre-instance gate), `scripts/pm-runtime-artifact-standing-checks.py`, ATS-260 at `Plans/Automated_Testing_System.md:7243`. Cause: schema meta-validation and fixture traversal missed unresolved references in optional/unselected branches. Fix: walk every reference in every complete schema in the selected nineteen-family graph, recursively including whole external dependencies, before any instance check. Resolve declared IDs, repository-local URI/file aliases, JSON pointers and anchors with a closed local registry; unknown documents/fragments fail closed. Each family supplies optional-property, unused-definition, external-document, external-fragment and unused-external-definition negatives plus a resolvable external-ID positive. Removing preflight or injecting unresolved refs into every family's optional property/unused definition/external route makes the complete checker fail. Latest Astra reproducer now exits 1/status fail for all nineteen injected schemas; original graph remains 608 resolved refs across 24 schemas, zero unresolved. Verify with the full checker and mutation driver.
- **B2 — fixed (`a2f381cf001a1c3d1e551228cb47bea1c2c04960`).** Where: RAP-106 at `Plans/Runtime_Artifacts_Panel.md:3530`, RAP-117 at `:3976`, CV-526 at `Plans/Contracts_V0.md:24701`, CV-537 at `:25099`, checker `validator` at `scripts/pm-runtime-artifact-event-drafts.py:161` and provider-hash cases at `:652`. Cause: both provider hashes were unrestricted stringOrNull and their positive examples were placeholders. Fix: each exact family now separately defines required-present null for an unknown original source digest, otherwise literal `sha256:` plus 64 lowercase hexadecimal SHA-256 digits, exactly 71 ASCII characters, over the original redacted provider-payload bytes. Current Project-writer validation composes the original schema constraint with pattern/full-match/exact-length guards via allOf. Preserve historical schema files/IDs and supported historical decoding; no retained value is rewritten. The two synthetic positives use actual hashes of their explicit fixture source bytes; only their consequent event/receipt/source/checkpoint/dataset fixture bindings are regenerated. Valid/null positives and 14 malformed cases, including LF/CRLF, run through schema, inline/packed decode, fresh append and self-consistent stored copies. Removing the provider guard fails both families. Latest Astra's malformed and trailing-LF probes now fail schema and append validation for both.

**Disputed:** none. **Stopped for Jared:** none. **Open findings:** none. No product choice, admission, Decision Log, retention policy, feature or visible behavior was reopened.

## All ten standing checks, per family

**P = pass in this round; F = fixed in `a2f381cf001a1c3d1e551228cb47bea1c2c04960`; open = none.** Grade abbreviations: P=PASS, Q=PARTIAL, A=ABSENT. Check 2 means refusal by these Project-only editions even with the exact CV-366 key; it does not certify an application writer. Check 10 exercises retained authenticated history after current live state changes and body deletion, while withdrawn readers and forged sources/receipts still refuse.

| Exact family | Grade before → after | 1 replay | 2 app | 3 partition | 4 size | 5 format | 6 semantics | 7 checkpoint | 8 failure | 9 refs | 10 history |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `runtime_artifact.api_web_call` | 10P/1Q/1A → 11P/0Q/1A | P | P | P | P | P | P | P | P | F | P |
| `runtime_artifact.artifact_version` | 10P/1Q/1A → 11P/0Q/1A | P | P | P | P | P | P | P | P | F | P |
| `runtime_artifact.before_after_snapshot` | 10P/1Q/1A → 11P/0Q/1A | P | P | P | P | P | P | P | P | F | P |
| `runtime_artifact.browser_recording` | 10P/1Q/1A → 11P/0Q/1A | P | P | P | P | P | P | P | P | F | P |
| `runtime_artifact.code_diff` | 10P/1Q/1A → 11P/0Q/1A | P | P | P | P | P | P | P | P | F | P |
| `runtime_artifact.context_snapshot` | 10P/1Q/1A → 11P/0Q/1A | P | P | P | P | P | P | P | P | F | P |
| `runtime_artifact.cost_usage` | 9P/2Q/1A → 11P/0Q/1A | P | P | P | P | F | P | P | P | F | P |
| `runtime_artifact.document` | 10P/1Q/1A → 11P/0Q/1A | P | P | P | P | P | P | P | P | F | P |
| `runtime_artifact.evidence` | 10P/1Q/1A → 11P/0Q/1A | P | P | P | P | P | P | P | P | F | P |
| `runtime_artifact.failed_attempts` | 10P/1Q/1A → 11P/0Q/1A | P | P | P | P | P | P | P | P | F | P |
| `runtime_artifact.hitl_approval` | 10P/1Q/1A → 11P/0Q/1A | P | P | P | P | P | P | P | P | F | P |
| `runtime_artifact.implementation_plan` | 10P/1Q/1A → 11P/0Q/1A | P | P | P | P | P | P | P | P | F | P |
| `runtime_artifact.reasoning_summary` | 10P/1Q/1A → 11P/0Q/1A | P | P | P | P | P | P | P | P | F | P |
| `runtime_artifact.restore_point` | 10P/1Q/1A → 11P/0Q/1A | P | P | P | P | P | P | P | P | F | P |
| `runtime_artifact.screenshot` | 10P/1Q/1A → 11P/0Q/1A | P | P | P | P | P | P | P | P | F | P |
| `runtime_artifact.subagent_lineage` | 10P/1Q/1A → 11P/0Q/1A | P | P | P | P | P | P | P | P | F | P |
| `runtime_artifact.suggested_next_steps` | 10P/1Q/1A → 11P/0Q/1A | P | P | P | P | P | P | P | P | F | P |
| `runtime_artifact.tool_llm_trace` | 9P/2Q/1A → 11P/0Q/1A | P | P | P | P | F | P | P | P | F | P |
| `runtime_artifact.validation_test` | 10P/1Q/1A → 11P/0Q/1A | P | P | P | P | P | P | P | P | F | P |

The exact negative-case descriptions and per-family assertion counts are in `DR.standing-checks.json`. All ten execute inside the full checker; the mutation driver requires a nonzero structured failure for every affected family. Earlier fixes are graded pass here, not counted as newly fixed.

## Verification and earlier-finding regressions

- **Full checker:** 5,998 assertions, exit 0/status pass, all nineteen families; every pre-existing assertion group remains.
- **Full-checker mutation driver:** 41/41 trials caught; each mutated run exits 1/status fail with failures in every affected family. Includes all previous thirty trials, B1 reference injections/preflight removal, B2 provider-guard removal, all three history/live-state/withdrawal/forgery controls, old wrong-index-retention input, and restore grouping-guard removal.
- **Earlier cycle-3 driver:** 1,890 assertions pass (931 family, 26 restore, 933 extensions), including old retention, precise 17,000-byte inline counterexample/boundaries, full envelopes/eleven-field receipts/all semantic and Storage fields, replay-only fresh/retry/alternate-ID paths and recomputed restore ordinal/grouping/predecessor/source mutations. The old wrong-retention input and both removed policy/grouping guards still fail the complete checker.
- **Earlier Astra driver:** 1,189 assertions pass with zero failed expectations; custody/payload LF, wrong-store/missing-checkpoint route and success-substituted-for-failure mutations still refuse. Copies change provenance labels only, retaining all probe bodies/assertions; source and copied hashes are recorded.
- **Latest Astra reproducer:** unchanged probe logic confirms B1 and B2 closure; the original schema graph resolves without errors.
- **Derived/targeted checks:** shard generate/check, index generate and parsed top-level index validate, runtime-artifact schema validation and whitespace check all exit 0. The 15 ignored currentness files match the shared edition byte-for-byte. All 228 grade cells have exact current-source excerpts checked within their owner unit/function/fixture. Commands, source pins and evidence SHA-256 values are in `DR.checks.json`.

## Authority, search, scope and IDs

The provider-hash search is separate for cost_usage and tool_llm_trace over all live top-level Plans owner documents and schemas. It reuses existing Usage/RAP source authority and redaction-before-persistence; no algorithm/encoding/length or null-meaning contract was found for either field. RAP-106/CV-526 and RAP-117/CV-537 explicitly label the narrow new representation as newly authored under DL-045. Its per-family search evidence and source hashes are in external `fix4-provider-hash-search.json`. Original handler/consumer/identity searches remain `drafts/DR/canon-search.json` (SHA-256 `94c22a7cf45511240628db8dbe4cfe94e8da51b545eba8d8dae04b333d999bac`) and `drafts/DR/fix-round-1/canon-search.json` (SHA-256 `ca087c26e09c210688290cda3ead21bc309c4a5899e5111e29ad8cb548433556`).

No additional old decision is applied. DL-045 still names these exact families; existing DL-075 event history, DL-076 durable-token and SP-337 pack premises remain unchanged. Source bodies, Usage, original receipts, source-coupled index rows and checkpoint generations retain their existing separate policies. Failed premise checks: none.

Shared-file hunks: one appended provider-hash paragraph each in CV-526/CV-537, one each in RAP-106/RAP-117, and ATS-260's existing oracle paragraph extended to checks 9 and 10 and the two provider guards. No Storage owner text changes. Authored companions: the existing DR fixture and two existing checkers. Derived changes remain within the three edited owners' shard directories and six standard global indexes. No historical schema, event registry, admission, stored-value registry, Decision Log, Spec Lock, auto-decision, governance evidence, frozen validator, .gitignore or test-file edit.

**IDs:** zero new IDs. Existing branch allocation remains **58**: RAP-100..118, SP-520..538, CV-520..538, ATS-260. This round edits only RAP-106, RAP-117, CV-526, CV-537 and ATS-260. Start resources: 17 GB available RAM / 110 GB free disk; subsequent checks remain above 6 GB / 50 GB. Sparse detached worktree: `/home/sittingmongoose/pm-worktrees/DR-fix4`. No pm-mail, subagent, landing lock or main push. Push this lane only; remove the worktree and its temporary venv after pushed delivery. Cleanup completion is recorded in external `cleanup.json`.

## Retained evidence

| Evidence path | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-4/fix4-draft-check.json` | `b88a9808707c25b4387350579aaca55f5198282c31bfb501ed83a3d2c519f208` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-4/fix4-mutations.json` | `ca3ddc8ff104af79c8280eb795ba23a439b1845213063a4c4422045b04618fd2` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-4/cycle3-mutation-results.json` | `60262999fa8ea16267250e91bd8edb34f7491a73822e204d0f20c618b4ffacf7` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-4/fix4-prior-astra.json` | `6d828881785b82c98dfee119855ddfd0492e1a71c0d62dba4a0c4e5f3cb48491` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-4/fix4-astra2.json` | `da2cb009d436dfad5fe4237896eab7d5df5c1dfc97ca49d1974e14de14e872ac` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-4/fix4-provider-hash-search.json` | `c0570f5ef1eeca03d04457f20ff567457b13576a29b0f8d775969f0923516864` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-4/fix4-grade-source-audit.json` | `5c4f9f5df94efba1c18c82017a63e1e53a909b16b56e946236f06e9cafba63f4` |

Native source authentication, real payload sync, receipt issuance, redb snapshot/CAS, crash/backup recovery and UI execution remain NOT_RUN.
