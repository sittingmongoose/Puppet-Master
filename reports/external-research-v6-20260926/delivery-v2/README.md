# Delivery v2 — per-finding native file exchange

TEST_ONLY_NEVER_PROMOTE. This follows the [I1 review](I1_RESULTS_REVIEW_AND_NEXT_STEP.md), preserving the closed I1 results and invalid originals. It changes the delivery unit and host bookkeeping, not research models, native Goals or semantic standards.

- `tools/delivery_store.py`: one coherent Markdown finding per unique attempted submission. The existing app writes a payload and ready marker; the host snapshots bytes before giving structural feedback through native Read. JSON serialization, finding/part identity, revision numbering, mechanical change lists and current/history projection are host-owned. Unknown fields are errors; invalid latest revisions never fall back to old accepted text. Other independent valid records remain visible. Structural acceptance is UNVERIFIED; validation proposals stay UNEXECUTED.
- `tools/evaluator_launch.py` and `prompts/evaluator-task.txt`: prospective immutable task plus approval-bound blinded live envelope, tested together. Missing/stale/false/out-of-scope authorization refuses the dispatcher callback. Failed dispatch consumes the instance-local slot. No source or approval-looking file grants permission. No real evaluator dispatch occurs in this development task. The trusted host must retain the gate for the schedule; it is not a restart-proof authorization service or provider payload proof.
- `tools/run_delivery_check.py`: D1-only wrapper around the existing native Goal launcher with a host receipt loop, finite counters and no retries. It creates no custom native tool, Goal engine or provider transport.

[Native route evidence](evidence/native-route.md) identifies local tool names and arguments. The watcher consumes unique ready-marker submissions, not arbitrary unsaved editor states. Polling cannot prove that a file was never overwritten before observation. Native traces corroborate protocol compliance; no missing history is reconstructed. Workspace access is prompt-scoped, not an isolation service. Synchronous snapshots before receipts are tested; power-loss durability is not claimed.

[Derived fixture provenance](evidence/fixture-provenance.json) distinguishes synthetic/minimized development cases from the immutable real Muse/Z carrier failures. No real corpus or keys enter D1. [D1_SPEC.md](D1_SPEC.md) declares one five-minute/48-response assignment per app, two total, with four required attempts, same-Goal structural correction and mechanical success checks. The user approved these small assignments; no full research campaign or premium grader is authorized.

Offline reproduction from the VM lab:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s delivery-v2/tools -p 'test*.py' -v
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s offline-repair-v1/tools -p 'test*.py' -v
```

For a GitHub-only checkout, run the following from `reports/external-research-v6-20260926/`. The published runner lives under `r1b-prep-rev3/tools/`, while the unchanged runtime expects `tools/r1b/`. This temporary layout uses only already-published files. Tests mock native process dispatch; they make no app/model calls. Direct discovery without this layout has 36 passing delivery/envelope tests and a runner import error; adding only PYTHONPATH leaves one driver-path error. Those failed packaging checks are retained in `evidence/published-tests*.log`; the complete 52-test reproduction passes in `evidence/published-layout-tests.log`.

```sh
PYTHONDONTWRITEBYTECODE=1 python3 - <<'PY'
import os, shutil, subprocess, tempfile
from pathlib import Path
published = Path.cwd()
with tempfile.TemporaryDirectory(prefix='delivery-v2-offline-') as tmp:
    root = Path(tmp)
    for name in ['delivery-v2', 'offline-repair-v1', 'tools']:
        shutil.copytree(published / name, root / name,
                       ignore=shutil.ignore_patterns('__pycache__'))
    shutil.copytree(published / 'r1b-prep-rev3/tools', root / 'tools/r1b')
    result = subprocess.run(
        ['python3', '-m', 'unittest', 'discover', '-s', 'delivery-v2/tools',
         '-p', 'test*.py', '-v'], cwd=root,
        env={**os.environ, 'PYTHONDONTWRITEBYTECODE': '1'})
    raise SystemExit(result.returncode)
PY
```

See the offline logs and independent bounded development reviews under `evidence/`. `FREEZE.json` pins code, prompts, fixtures and reused runtime dependencies before D1. No approval file was created. The dispatch guard accepts actual trusted operator authority, never a file-derived grant. No automatic retry, research campaign, verifier invocation, quota probe, canon/governance/WorkNode edit or I1 score repair is included. `V-FOLLOWON-1` stays OPEN outside this work.
