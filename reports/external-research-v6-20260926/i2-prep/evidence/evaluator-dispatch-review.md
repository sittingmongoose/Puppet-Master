# I2 prospective evaluator dispatch: offline development review

Status: **UNEXECUTED native evaluation**. This development result grants no run,
retry, live approval creation or new expenditure. D1 and I1 remain unchanged.
Scope: `tools/evaluator_dispatch.py`, its mocked regressions, and this note.
The parent owns the I2 freeze, pair policy, task selection and actual authorization.

`dispatch(...)` takes an explicit task path and expected task hash, the immutable
one/two-assignment schedule, actual host `LiveAuthorization`, the stable durable
runs root, existing candidate `phase-state.json`, host-approved freeze hash and
pair metadata. It calls the parent's `prep_plan.check_pair_eligibility(metadata,
assignment_id=...)` before consumption. Both original arms must meet that policy;
there is no singleton reviewer, replacement candidate or raw-output diagnosis here.
Metadata paths must bind the exact distinct unordered pair
`workspace/first_view/results/{X1,X2}/current.md`. Staged bytes must match each
eligible hash; the caller retains original-to-staged hash lineage. Eligibility,
paths and hashes are rechecked immediately before the native callback. A valid
report elsewhere is insufficient to authorize assessment of different staged bytes.

The unchanged delivery-v2 gate verifies exact live task/schedule authorization and
composes its authorized-now envelope plus the entire immutable task. Its callback
claims `runs/EVAL-NNN` with exclusive directory creation, reuses the existing R1b
`write_status`/`slot_state` helpers, saves `composed-prompt.txt` and
`composed-input.json`, and checks the saved bytes' SHA-256 before the paid boundary.
The default boundary delegates directly to unchanged `run_reviewer_v2.run` with
the **composed prompt file**, never the immutable task file alone.

The requested existing slot always refuses even when a new gate is constructed.
Before dispatch and again before the native callback, every other permitted
existing slot must be terminal with an existing R1b CONTINUE outcome and no
`stop_schedule` flag. A prior harness failure, dangling/dispatched/malformed slot
or explicit stop blocks later dispatch despite an unchanged running phase state.
Callback exceptions leave an `arm-receipt.json` and terminal
status with consumed authorization; the slot is not retried. Original native
receipts are retained unchanged in `native-receipt.json`. Unknown/driver-error/
nonzero native outcomes cannot become `goal_complete`; explicit cap and clean
native-success/incomplete-output receipts retain `cap_stop` and
`incomplete_semantic` respectively. After a clean driver success, the wrapper
requires all five unchanged gate `OUTPUTS`: nonempty UTF-8 files, with parseable
JSON for each JSON output. Missing assessments/acquisition or invalid/empty
outputs yield `incomplete_semantic`. Separate `wrapper_output_validation` records
these checks without modifying the native receipt. `goal_complete` means native
success and these structural output checks, not semantic accuracy, completeness
or demonstrated first-view chronology.

Execution stays pinned to `claude-opus-5-5`, **requested xhigh**, exactly
**2700 seconds / 160 responses**, and Read/Grep/Glob/Write/Edit. Observed effort
remains a separate existing-driver receipt field. A maximum of two exact blinded
assignments is admitted by the existing gate and parent pair policy. The persisted
candidate phase must bind `freeze_sha256`, `phase_started_epoch` and exactly
`phase_wall_seconds=14400`. Existing state is required; the glue never creates or
renews its start. It refuses a closed/stopped phase or insufficient remaining time
for 2700 seconds plus the existing 300-second host reserve, and rechecks immediately
before dispatch. Actual run state and approval are not present in this preparation.

Offline verification, 2026-09-28:

```
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s i2-prep/tools -p test_evaluator_dispatch.py -v
```

**22/22 mocked tests pass**, including after the parent policy tightened each
original slot's carrier kind and the control report's 1-MiB cap. Synthetic control
fixtures use `authored_current`; maintained fixtures use `host_current`.
They exercise actual `run_reviewer_v2.run` and
`build_cmd` with a synthetic `Popen`, verifying actual argv contains the entire
saved authorized-now composed prompt and the exact requested model/tools/effort.
Other checks cover missing/false/truthy/stale authorization, changed task/caps,
pair mismatch/failed arm/changed current report, expired/missing/wrong-freeze
phase state, hash-corrupted composed input, both finite assignments, dangling
and restart duplicates, callback exceptions, and failure receipts. Zero-call
regressions cover prior schedule stops, staged path/hash
mismatch and newly ineligible pairs; missing assessment/acquisition and malformed
or empty outputs cannot turn a successful native receipt into wrapper completion.
Every process or native boundary in these tests is mocked; no model/provider/account call was
made. The unchanged frozen gate suite also passed 12/12; one upstream test briefly
uses an approval-looking synthetic file inside its deleted temporary directory.
No live approval file was created or loaded. Frozen source files were not edited.

SHA-256 identities (paths relative to the lab root):

| Path | SHA-256 |
|---|---|
| `delivery-v2/tools/evaluator_launch.py` | `a89f3336a8471209096105beba78c44d65bf68d1dca2087bebcbe5de6d05fef0` |
| `delivery-v2/prompts/evaluator-task.txt` | `98179f83255e85be231fe1c262077eca2380d7580681934700342364a6232643` |
| `tools/r1b/run_reviewer_v2.py` | `7d2c410f16b96230e3b57448ee21e462009843f4dff6e461a04ce168d31a0189` |
| `tools/r1b/run_r1b.py` | `a0694ff3d865497e3c7c511d752a5ad4c7e1b3136783fcfffec4e4ab8daf9a9d` |
| `i2-prep/tools/evaluator_dispatch.py` | `f01a7501705361c4cfe5d79864e159fa8c19a95a06aecd4af7b9bb73fed75661` |
| `i2-prep/tools/test_evaluator_dispatch.py` | `4943bcd4584dab235802b887e2940e4fb22e76462b45300f9761690315837e4f` |

Limits: this is host glue, not a complete candidate-phase scheduler or new
authorization system. The trusted host must supply pins from the actual approved
freeze, retain one stable runs root and persisted phase state, and never delete
consumed slot directories or reset the phase timestamp to renew permission.
Workspace metadata is an eligibility attestation, not user approval. Persisted
prompt/hash and mock argv evidence do not prove provider-received payload bytes.
The existing prompt-only first-view/deferred chronology limitation remains. No
production call, account operation, push or frozen-source edit was performed.
