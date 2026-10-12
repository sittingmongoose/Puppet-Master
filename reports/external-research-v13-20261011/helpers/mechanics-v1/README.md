# ER13 small mechanics v1

Python 3 standard library only. No framework, scheduler, launches, native calls, root-state writes or Git mutations. CLI paths are caller arguments, not campaign/account constants. Scripts create new outputs exclusively. Root owns dispatch/publication and retains original evidence. Only explicit file lists are read; no recursive tree/archive discovery.

## Flat export

```sh
python3 -B results.py --queue PACKET/experiment_queue.json --records actual-attempts.json --destination NEW-RESULTS-DIRECTORY
python3 -B lifetimes.py --records observed-contexts.json --output NEW-lifetimes.json
```

`actual-attempts.json` is a flat JSON array following `publication/schema-v1/attempt.schema.json`. Empty `[]` yields exactly 80 allocation rows with UNKNOWN telemetry; this is not an executed results claim. Exactly one primary record per queue arm, including failed/missing/invalid/capped/interrupted attempts; any retry/additional attempt is an extra with explicit charge/category. `results.json` has null for unknown; CSV has UNKNOWN. `arithmetic.json` reports observed counts, labeled known subtotals, all-assigned totals only with complete observations, and sample total-consumption/passing-output quotients only for nonzero passes. No token subset, Goal-counter or currency/unit combination. Groups separate scope/case/provider/model/effort/tier/time contract/method version/counter semantics/currency/unit/category. Evaluation/preparation/support/publication/root observations do not silently enter product costs.

The script does not infer missing actual provider settings, assessment outcomes, counters, reserve charges, terminal boundaries, source quality or receipts. It never computes a speedup from fastest cases or merges factorial controls. Root's independent scientific analysis must pair identical case/provider/tier/contract strata, show original/new judgments, A1/A8 interaction once per block, passing complete quality, paired differences and dispersion. Planned allocation cannot establish matched realized execution. No cold end-to-end median sums or multiplied method speedups.

`lifetimes.py` takes the flat actual context records described in the schema README. It computes created/started occupancy sums, unions, wall-time overlap and excess context seconds separately from observed provider activity. Missing bounds produce UNKNOWN all-context values and explicit partial counts. It emits per-stage duration and predecessor wait with genuine topology. Open context is not billed work. Empty input is no observation, not evidence of zero activity.

## Freeze before evaluation

```sh
python3 -B freeze.py --root PRIVATE-ATTEMPT --list authored-files.json --destination NEW-FROZEN-EDITION
python3 -B freeze.py --root PRIVATE-ATTEMPT --list authored-files.json --destination NEW-FROZEN-EDITION --verify
```

`authored-files.json` is an explicit JSON array of relative POSIX filenames. Include complete investigator/critic/final outputs and required evidence, not just the final. Source files remain unchanged. Exclusive destination and read-only copied files/manifests resist accidental overwrite; hashes verify integrity. Root saves emitted manifest SHA, the actual freeze timestamp and later evaluator dispatch time in the attempt record. The helper cannot retrospectively prove when evaluation began. Never rewrite frozen science in response to evaluation; make a versioned successor. Freeze rejects known transcript/credential/database filenames. Semantic selection remains root's responsibility.

## Selective public copy and privacy

```sh
python3 -B public_files.py copy --root PRIVATE-RUNTIME --list selected-public-files.json --policy PRIVATE-redaction-policy.json --destination NEW-PUBLIC-EDITION
python3 -B public_files.py scan --root PUBLIC-EDITION --list public-files.json --policy PRIVATE-redaction-policy.json
python3 -B public_files.py metadata --root ROOT-WORKTREE --policy PRIVATE-redaction-policy.json
python3 -B public_files.py metadata --root ROOT-WORKTREE --revision EXACT-COMMIT --policy PRIVATE-redaction-policy.json
```

Copy selection is `{"files":[{"source":"relative/private.md","target":"public/handoff.md","kind":"handoff","sha256":"EXPECTED_SOURCE_SHA256"}]}`. Scan accepts a JSON array of relative public filenames or the same manifest shape. No globs, directories, symlinks, traversal, raw native transcripts or opaque binary copying. Transformed public paths and contents are scanned for private email, credentials, home/share paths and private IPs; transcript-shaped JSON is refused even under renamed files. Explicit private literal detection adds account IDs, human names, hostnames and private route labels. Diagnostics show file/kind/line, never secret matches. This is a bounded heuristic plus root review, not an exhaustive privacy guarantee. Public-source code should not contain private-literal scanner fixtures.

Policy is PRIVATE: `{"replacements":{"PRIVATE_RUNTIME_PREFIX":"ER13_RUNTIME","PRIVATE_ROUTE_ID":"AUTHORIZED_PROVIDER_INSTANCE"},"approved_literals":["APPROVED_NO_REPLY_EMAIL"],"private_literals":["PRIVATE_ACCOUNT_EMAIL","PRIVATE_HOST_NAME"]}`. Supply real private literals privately. Never publish that policy or unredacted selection containing private paths. Use exact normalization replacements, not arbitrary deletions of scientific evidence. The manifest records public path/bytes/hash and original SHA; source originals remain private. A transformed handoff is copied to a separate public filename. Keep full science, criticism, independent evaluations, primary evidence bodies/pinned locators, witness code/results, failure/limitation text and reproducible recipe closure.

Path-normalized source/config/task bundles must still be runnable: normalize to the existing materializer's documented runtime/authorized-provider placeholders, preserve all declared dependencies, run its bounded repinner when bytes change, and independently materialize/verify a fresh installation. Do not publish broken stale pins or claim tested original hashes validate changed public bytes. Use copy output as a staging edition; repin there, then freeze a final selected edition and scan its exact bytes. Root publishes final hashes for repinned bytes alongside original normalization lineage. The copier is not a recipe repinner or completeness assessor.

Metadata mode reads only effective prospective author/committer identities, or one exact existing commit. Run before first commit under the same per-command approved name/email overrides that root will use for the commit. Supply the approved no-reply email in private policy. If root uses `git -c user.name=... -c user.email=...`, supply the same values to the prospective check via per-command `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL`, `GIT_COMMITTER_NAME` and `GIT_COMMITTER_EMAIL`; these are prospective identity checks, not account changes. Repeat on each actual publication commit using its full immutable commit hash. Names/private identity strings are checked against private literals. No global/shared Git config is changed; root remains sole Git writer. The checker does not audit arbitrary Git history.

Run `python3 -B checks.py` for isolated synthetic missing-data/privacy/failed-denominator checks. It deletes temporary scratch. No scientific/native execution is qualified.
