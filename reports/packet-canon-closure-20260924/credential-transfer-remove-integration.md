# Credential transfer/remove companion integration

Status: independently accepted static candidate applied and verified. All 84
contract pairs pass: 1,634 positive cases, 4,869 rejected negatives and 12
internal self-tests, with no findings. Production wiring validation also passes.
No main landing or native credential proof is claimed.

The three existing preview/apply/source-remove commands receive typed owner
request/result and receipt bindings. Apply reuses the existing preview laws for
destination owner/topology generation and selected adapter portability. Both
reference and encrypted-envelope transport cases reject all six reproduced
single-field false accepts, without introducing a new policy, transport or error.

Frozen evidence directory:
`/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/case-reconciliation/credential-transfer-remove-three-correction-02/`.

| Artifact | SHA-256 |
| --- | --- |
| `freeze-v2-20260926T0358Z/FREEZE-MANIFEST.md` | `7de0727fc5361358f9a3e0487058c4af822d1a45b152bbaa0bd2031438d8b032` |
| `freeze-v2-20260926T0358Z/companion-v2.patch` | `739c73fe16d1712b8cab8b5b70a711b28e6e9e5d77fb631aa0dd093921e0e46a` |
| `freeze-v2-20260926T0358Z/REPORT-V2.md` | `710f91338d1d1e2c7d7f933f75919cd0cb7f203ddf6acb0039d62ad78b288e06` |
| `REVIEW-DIFFERENT-SOL-V2.md` | `47552e8b4bf07186266a0e876226d04a4568d50a6a95d740639b410928f4b5e0` |

Root's keyed diff shows only three Touch rows (SGAPCMD-036/037/040), their new
successor profile and the three corresponding production entries change. The
central gate was enrolled additively, preserving Doctor and Permissions and
moving 83 to 84 pairs. The Touch verifier's exact profile count moves 151 to
152; all row/action/wiring counts remain unchanged. No owner Markdown or
generated governance artifact is changed.

Fourteen focused tests pass in the frozen candidate and integrated tree.
Integration required test-harness adaptation: the selected-row pre-migration
assertion now reads the pinned pre-integration Git blob rather than the already
updated current tree; the pair-count assertion matches the current declared
manifest and requires this new schema exactly once. A temporary global-schema
uniqueness assertion was removed because existing pairs legitimately reuse a
schema with different fixture packs. No product semantics changed in these
test adjustments. Different-Sol review accepted the exact gate, test-harness
and Touch-count integration delta after the final test file stabilized.

Touch verification now reports only the pre-existing Settings disposition hash
drift (expected `10e1ffd1062a9a3aebd5c418acc7289fb5bb3d0261ef08edc65a461a47685632`,
found `43e215863fc05d2d2bc1bd863cbaca64042e167af6331e99eac3122a6b68e866`).
That binding was not refreshed. Native dispatcher, attachment/source custody,
approval issuer, adapter portability, actual transfer/removal and receipt
evidence remain unproved. The external correction Goal completed authoring;
that is not runtime implementation evidence.
