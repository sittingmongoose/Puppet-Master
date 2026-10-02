# Offline accounting replay

From this directory run:

```sh
python3 -B -m unittest discover -s ops/recovery-v1 -p test_ledger_overlay.py -v
```

Requires Python 3 on a platform with `fcntl` (Linux/macOS). Uses only local copied source, prospective amendment, historical byte-exact authorization and positively selected compact historical metadata fixture. All seven tests manipulate in-memory state; they perform no native/provider calls and do not enroll real candidate jobs or modify campaign state. The original accounting source resolves authorization from this local directory; the overlay resolves its accounting dependency from the local `ops/accounting-v1` sibling. Original source pin literals match the byte-exact dependencies, so no hash literal rewrite was necessary. Fixture host locators remain sanitized tokens.

[Copy identities](REPLAY_FILES.json) distinguish this local replay layout from frozen native runtime. Passing tests establish this software check scope only, with no native-route acceptance, research quality, source delivery or model/effort realization claim. The original failed canary and consumed costs remain unchanged.
