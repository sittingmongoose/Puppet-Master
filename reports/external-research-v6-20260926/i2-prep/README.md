# C2 criterion amendment / I2 preparation

TEST_ONLY_NEVER_PROMOTE. [RESULTS.md](RESULTS.md) is the compact checkpoint. [CRITERION.md](CRITERION.md) defines the prospective rule; [NEXT_TRIAL.md](NEXT_TRIAL.md) and [proposal.json](proposal.json) declare the complete treatment, matched conditions, finite capacities, evaluation admission and future operator bindings. The supplied [independent review](D1_INDEPENDENT_REVIEW.md) is preserved exactly. Its reported ten probe groups and thirty reused tests are that review's stated scope, not a claim that it reran the earlier 52-test suite.

No D1 rescore or new run occurs here. Candidate/evaluator/native smoke calls and formal grades: zero. Development helpers are explicitly configured GPT-6 Sol high/medium under Astra orchestration, not substitute graders. Original D1 remains Muse 15/15 and zcode 14/15; I1 remains closed with no pass. V-FOLLOWON-1 stays OPEN.

New code is small glue around frozen components: read-only lineage/field comparison; explicit case-specific Store capacities; retained-output and pair-admission checks; composed-message dispatch through the existing reviewer with existing exclusive-slot/status accounting. No candidate scheduler, Goal engine, transport or generalized authorization/isolation service is introduced. `FREEZE.json` records identities; it grants no launch permission. Existing D1/I1 approvals never authorize I2.

Run targeted tests from the VM lab:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s i2-prep/tools -p 'test*.py' -v
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s delivery-v2/tools -p 'test_delivery_store.py' -v
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s delivery-v2/tools -p 'test_evaluator_launch.py' -v
```

GitHub-only reproduction: from `reports/external-research-v6-20260926/`, stage the already-published modules in a temporary runtime-shaped directory. No VM corpus, keys, logs, accounts or application binaries are needed. Native process boundaries in the tests are mocked; do not call the dispatch function manually or execute the candidate/reviewer drivers.

```sh
PYTHONDONTWRITEBYTECODE=1 python3 - <<'PY'
import os, shutil, subprocess, tempfile
from pathlib import Path
published = Path.cwd()
with tempfile.TemporaryDirectory(prefix='i2-offline-') as tmp:
    root = Path(tmp)
    for name in ['i2-prep', 'delivery-v2', 'offline-repair-v1', 'tools']:
        shutil.copytree(published / name, root / name,
                       ignore=shutil.ignore_patterns('__pycache__'))
    shutil.copytree(published / 'r1b-prep-rev3/tools', root / 'tools/r1b')
    result = subprocess.run(
        ['python3', '-m', 'unittest', 'discover', '-s', 'i2-prep/tools',
         '-p', 'test*.py', '-v'], cwd=root,
        env={**os.environ, 'PYTHONDONTWRITEBYTECODE': '1'})
    raise SystemExit(result.returncode)
PY
```

Raw old campaign evidence/corpus/keys stay on the VM. Only compact preparation code, synthetic fixtures, tests, review notes and path/hash identities are published. The criterion is never run on the frozen D1 outputs for a replacement result. A faithful new research report still needs semantic review; artificial fixture expectations never enter candidate workspaces.
