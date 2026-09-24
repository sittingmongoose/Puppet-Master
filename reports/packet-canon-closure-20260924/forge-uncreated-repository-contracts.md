# Forge uncreated repository identity contracts

Base: `7ca42a9e9eb6278a58e381f97cc78e0a8afaf42e`, the separately committed FGI-011 owner clarification.

The existing create command can now represent a repository that does not yet exist. Exactly five non-list schema branches change: request, result, receipt, error, and availability. A create request's absent repository/binding pair is jointly null with zero expected/observed binding generations and absent provider repository identity. Its verified account/container, locator, permission, capability, currentness and mutation gates remain required. No other command gains nullability; precommit listing cannot authorize creation.

Create results/receipts may be unbound only for accepted, blocked, failed, cancelled, recovery_required or effect_unknown. Accepted unbound receipts require ObservableWork; success/degraded still require a real binding. Existing terminal-result/error/reconciliation constraints remain. Unknown remote effect is not proof of absence and never permits blind retry.

All previous 84 positive and 117 negative Forge fixtures and metadata are unchanged; 15 positive and 47 causal negative cases are added. Seven focused tests cover the new families, invalid mutations, causal bound controls for success/degraded, 46 adjacent request cases, precommit scope separation, all previous fixture outcomes and runtime identity uniqueness. The first aggregate exposed two reused IDs in the new fixtures; only the new IDs were corrected, with a regression that reproduced both failures. No validator was weakened.

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/`.

- `forge-uncreated-companion-red.json`, SHA-256 `975d45a373a2285a569e8e5f52cd3a16d721545f751148996a7aa9cb7b5eae50`: original schema reproduces the missing identity/lifecycle behavior.
- `forge-uncreated-companion-green.json`, SHA-256 `4452c1a88c2a6916b4d341a7d5a4e5919e05346b00ac55b12380b6cba5dce9ca`: preserved first aggregate, exactly two duplicate fixture identities.
- `forge-uncreated-companion-green-v2.json`, SHA-256 `c0bb6a4e233a73b4b596481762cbbec086cd18b58a6b05594d1b1c0711e224d5`: final seven focused, six wiring and nine provider-gate tests pass. Full static aggregate passes all 32 contract pairs, 1,195 positive cases, 4,098 negative cases and 12 internal self-tests, with zero findings. Exact semantic delta restores to base after replacing only the five branches; old fixture prefixes and metadata are preserved.
- `browser_scm_performance/sep03_raw_census/forge-A-independent-review016.json`, SHA-256 `5075481b191d9f0423f7944ce384f069d43a482c210b09601564bc9abad8571e`: independent schema/lifecycle review, 57 boundary probes and 180 cross-command probes with valid bound controls. This receipt predates the fixture-ID correction and does not claim the aggregate result.
- `server_forge_backup/forge-A-fixture-identities-independent-review.json`, SHA-256 `ab881603980aee145aafbfaa5b8d00e97be2fa8a9555c55a140421d5892d211e`: independent final incremental review reconstructs the earlier fixture/test hashes by undoing only the three identity values and new regression; unchanged schema/validator, exactly two duplicate findings before and zero after, seven tests pass.

This closes the absent-identity shape contradiction only. Complete runtime-consumed creation intent, trusted preview joins, advanced provider selections, Azure team-project creation, native handlers and authenticated remote results remain separate work. No GUI, runtime, readiness, whole-packet closure, governance binding/baseline refresh or main landing is claimed.
