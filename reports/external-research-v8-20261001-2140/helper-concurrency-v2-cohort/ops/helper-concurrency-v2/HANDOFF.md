# Helper concurrency successor v2 — source only, no live install

This separately frozen successor repairs the independently identified v1 HOLD.
Its complete production source diff is SOURCE_DIFF.txt: one explanatory comment
and `request = {**request, 'started_epoch': birth}` after the helper-start birth
validation and before the frozen API delegation. The caller's request remains
unchanged. A supplied explicit birth remains exactly the supplied value. The
validated default birth now survives the frozen API's subsequent clock reads,
including `[NOW, NOW, NOW-1]` and `[NOW, NOW, NaN]`. No other action, helper-end,
clock, budget, authorization field, or delegated accounting code changed.

Frozen v1 source/manifest/HOLD are preserved. Its source SHA remains
f8b0f9f984bbfe1b1fd62d46b956247961d09fdea01fabb83d759f631d75078d;
its MANIFEST.json SHA remains
becd3cb6f10ca259b2a9e4e282f028c3564d580aad51fb245203020c9f479e49.
No v1 proof pointers or root metadata were edited by this author.

The actual source-freeze proof filename for this v2 bundle is **MANIFEST.json**.
There is no FREEZE.json. The manifest records the exact source digest, complete
new-file inventory, original helper birth/deadline and actual_end_epoch. Root
should use this exact proof filename and SHA for its positive source proof.
After that manifest is written, this author makes no further edits.

The unchanged frozen resume API is still pinned to
a98cf53c1826f1f4c9fa47a9e181eaae8beb971ea41e6564578a253059450b61;
the exact root helper authority remains pinned to
f1682a991232997556aed7fb88f167e706317259913d9365c5a1fb72fc572a79.
All source dependencies and ancestor paths reject symlink/hash drift. The
original sources are imported into isolated module objects through importlib,
with bytecode writes suppressed; the saved old-auth closure avoids recursion.
Only active_helpers 6→12 differs from old authorization. Old six authorization
and original sources remain frozen. The installed receipt schema/key remain
compatible v1 because the authorized count, effective epoch and root authority
are unchanged; the source selected for review/install is this separately pinned
v2 path and SHA, never the held v1 path.

The one-time amend-helper-concurrency action requires exactly the supplied root
request, literal root true, exact authority path/SHA, a finite prospective epoch
and an open campaign. It adds only helper_concurrency_authority_v1; duplicate
installation fails. Every prospective helper-start requires the exact receipt,
authority and finite birth at/after its effective epoch. Every other old action
delegates unchanged. Native admissions do not test helper count, so native
controllers require no change. Candidate caps remain two slots per M/Z/L,
144 starts, 172800 occupied seconds, original warning/stop thresholds, frozen
jobs, component/case caps, reservations, usage/cost/history, the original
43200-second envelope plus authorized pause 64621.83037877083 and deadline
1791013030.8303788. Removed cumulative helper/repair caps stay removed.
Helper-end retains the old root-first-end check and stores supplied proof and
actual_end_epoch separately from current bookkeeping end. Root retains its
existing convention of verifying positive frozen proof before ending helpers.

Twenty offline tests pass: the original fifteen checks plus five regression and
isolation checks. They cover the six/twelve/13th boundaries, >32 cumulative
helpers without restoring a removed cap, exact auth equality except helper
count, historical state/caps/time/pause/reservations preserved, malformed
receipt/authority/path/hash/root/schema/nonfinite cases, duplicate install,
unchanged old validation/helper-end/unknown action, accounting/status parity,
unchanged native admission with twelve helpers, blocked writes during import
and status, validated default birth carried across rollback/NaN clock reads,
explicit birth/caller request preservation, forwarded-copy identity and absence
of live ledger files in the test fixture.

Tests copy all frozen dependency sources and the historical snapshot into an
isolated temporary directory within this author's owned lab. Only the wrapper's
hardcoded campaign path literal is relocated in its compiled test copy; every
copied source byte is checked equal to production. No live state/lock or
stat-mtime metadata is read; temporary directories are removed on exit. The
read-only test blocks write modes and transactions, and compares immutable
fixture dependency hashes. Independent review should run tests in its own full
fixture copy if its permission scope forbids temporary files in this directory.
The passing TEST_RESULTS.txt is frozen evidence; no additional test run was
performed after this manifest freeze.

No live ledger transaction, apply, save or hand editing occurred. No candidate,
native unit, provider/profile, sibling authority, Git or canon action occurred.
Owned output scope was ops/helper-concurrency-v2 only. Independent review and
root installation remain outstanding.

Root installation example ONLY — not executed by this author. Root must first
verify MANIFEST.json, the exact new source SHA, immutable authority/dependency
pins and independent acceptance, then serialize installation with its campaign
root lock. This intentionally points to v2, while the root authority path stays
unchanged.

```bash
python3 -B LAB_ROOT/ops/helper-concurrency-v2/ledger_helper_concurrency_v2.py amend-helper-concurrency --request LAB_ROOT/ops/helper-concurrency-v2/INSTALL_REQUEST_EXAMPLE.json
```

INSTALL_REQUEST_SCHEMA.json and RECEIPT_SCHEMA.json specify the request and
receipt shape. Runtime also checks exact bool/int types and finite epochs;
schemas alone do not authorize a mutation. After root installs the receipt,
prospective helper-starts should use this successor; native admission and
helper-end delegation remain unchanged.
