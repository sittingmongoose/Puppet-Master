# ER12 A8-v1 — exact frozen SCW-6 stage additions

Root-only prospective R0 derivative. `prepare.py` imports SHA-pinned `../er11/prepare.py`, preserves all R0 30/12/18-minute stages, original prompt substance, terminal/quiet predecessor gates, input/request freezes, route, stable retries and complete science-before-native-completion requirements. It invokes the unchanged pinned one-shot `../er11/reveal.py`. `bootstrap.js` preserves the R0 bootstrap with only recipe/config path changes and a root-only comment. No running `er12-screen-v1`, mechanics `er12-v1`, cases, histories or answers are edited/read.

Investigator delta is exactly empty. Critic adds only the complete bytes of `methods/A8/critic_prompt_delta.txt` (SHA-256 `6ca210592ebaffd1228f390855af2dcbb7b338dcbb3e00c9fb57f0bdc8672c0d`). Reviser adds only the complete bytes of `methods/A8/reviser_prompt_delta.txt` (SHA-256 `31b0b79da9d1a99d81103a485448bbd2d518e5c48cd56b15a1a1a9cb9d11e087`). Their exact bytes are decoded as UTF-8 and appended after one separating newline, without rewriting or truncation. The added delta path/hash is bound into the corresponding stage freeze; all pins are checked before invocation. No time extension or extra context is introduced. The derivative request keys are `er12-A8-<run>-<stage>-v1` to prevent an R0/A8 collision.

Root creates one exact caller-owned config outside runtime_root, from `config.A8.example.json`, before preparation:

```bash
python3 - ER12_RUNTIME/helpers/er12-A8-v1/config.A8.example.json ER12_RUNTIME/config.A8.runtime.json <<'PY'
import datetime as dt, json, sys
c=json.load(open(sys.argv[1]))
c['whole_deadline_utc']=(dt.datetime.now(dt.timezone.utc)+dt.timedelta(seconds=3600)).isoformat()
with open(sys.argv[2], 'x') as f: json.dump(c,f,indent=2); f.write('\n')
PY
```

For another supplied A8 case, change run_id/runtime_root and both input paths in a new config before first preparation. Preserve the fixed whole deadline thereafter. Root reserves provider capacity in its existing queue, pastes this bootstrap into functions code mode, sets CONFIG to that exact path and explicitly invokes STAGE `investigator`, then `critic` after terminal/quiet investigator, then `reviser` after terminal/quiet critic. Only root dispatches. This worker dispatches nothing. Pure preparation is:

```bash
python3 -B ER12_RUNTIME/helpers/er12-A8-v1/prepare.py prepare --config ER12_RUNTIME/config.A8.runtime.json --stage investigator
```

Unavailability of the pinned files/deltas or authorized route, changed frozen inputs, nonterminal predecessors, expired stage/whole deadlines or insufficient machine memory stops the existing bootstrap; do not substitute accounts/models, recreate the runtime or extend clocks. Native identity/terminal provenance unavailable from a supported observation remains UNKNOWN as in R0. Root verifies advisory leaf restrictions and actual descendants at intake/closeout.

`python3 -B .../er12-A8-v1/test_mechanics.py` checks the entire investigator prompt equals R0, critic/reviser prompts equal R0 plus exactly their frozen blocks, budgets/deadlines remain R0, one-shot exact reveal is reused, added delta hashes are in the freezes, and retries preserve exact request keys. It uses synthetic temporary inputs, creates no native Goal/provider task, and cleans its temporary directory. evidence/mechanical-verification.json contains the result; version.diff and VERSION.json pin this overlay. No actual A8 inference or scientific effectiveness is claimed.
