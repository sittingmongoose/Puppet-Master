# Witness run

- Code: `candidate_witness.py`
- Command: `set -o noclobber; python3 -B ER13_RUNTIME/mechanics/dispatch-v1/admitted/B08-P02-control/witnesses/candidate_witness.py > ER13_RUNTIME/mechanics/dispatch-v1/admitted/B08-P02-control/witnesses/candidate_witness.stdout.txt 2> ER13_RUNTIME/mechanics/dispatch-v1/admitted/B08-P02-control/witnesses/candidate_witness.stderr.txt`
- Actual observed runtime from stdout: CPython 3.14.4, Unicode database 16.0.0.
- Exit code: 0. Stderr is empty.
- Exact stdout, stderr, command, exit code, runtime, code hash, interpretation, and limits are stored in `execution.json`.

The targeted cases show U+00BC expanding from 2 to 5 UTF-8 bytes, `ΐ` expanding from 2 to 6 bytes, 820 quarter fractions producing a 4,100-byte key from 1,640 source bytes, and a sharp-s key whose positions do not equal original offsets. The run also confirms the listed ASCII, canonical, compatibility, and mixed-script examples on this runtime.

These are counterexamples against universal draft claims, not an exhaustive proof of transformation behavior. The witness is not a CPython 3.13.9 / Unicode 15.1.0 execution and does not test UI highlights, storage, migration, or the full Unicode conformance suite.
