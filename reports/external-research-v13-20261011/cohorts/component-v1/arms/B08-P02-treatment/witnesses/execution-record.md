# Witness execution record

## Code and command

- Code: `witnesses/size-and-offset-witness.py`
- SHA-256: `a6b8168b9960cff34d1f0c0e7f9ebf62b482663921056ccac4587aef1f8d4b21`
- Exact execution command: `python3 -B ER13_RUNTIME/mechanics/dispatch-v1/admitted/B08-P02-treatment/witnesses/size-and-offset-witness.py > ER13_RUNTIME/mechanics/dispatch-v1/admitted/B08-P02-treatment/witnesses/size-and-offset-witness.stdout.json 2> ER13_RUNTIME/mechanics/dispatch-v1/admitted/B08-P02-treatment/witnesses/size-and-offset-witness.stderr.txt`
- Exit status: 0
- Runtime in captured stdout: CPython 3.14.4 (GCC 15.2.0), Unicode database 16.0.0.
- Stdout: `witnesses/size-and-offset-witness.stdout.json`; SHA-256 `bca5f2ea04bb27200165a8b3cc8f8a32bd7862239efe9be9f86dfe215ee11753`.
- Stderr: `witnesses/size-and-offset-witness.stderr.txt`; empty (SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`).

## Target-runtime availability check

- Exact command: `python3.13 -B -c 'import sys,unicodedata; print(sys.version); print(unicodedata.unidata_version)' > ER13_RUNTIME/mechanics/dispatch-v1/admitted/B08-P02-treatment/witnesses/target-python-3.13-check.stdout.txt 2> ER13_RUNTIME/mechanics/dispatch-v1/admitted/B08-P02-treatment/witnesses/target-python-3.13-check.stderr.txt`
- Exit status: 127; stdout empty; stderr: `/bin/bash: line 1: python3.13: command not found`.
- Captured diagnostic files are `witnesses/target-python-3.13-check.stdout.txt` and `witnesses/target-python-3.13-check.stderr.txt`.

## Result and limits

The captured JSON records a discriminating counterexample: U+FDFA repeats produce an original of 4,095 UTF-8 bytes and a derived key of 45,045 bytes. It also records two offset failures: `AßB → assb` and `e + U+0301 → é`. The witness asserts these observed outputs and exits nonzero if they differ.

This is a bounded counterexample, not an exhaustive Unicode proof, conformance suite, storage/index test, or UI test. It ran on Python 3.14.4 / Unicode 16.0.0. The final proposal binds the target to CPython 3.13.9 / Unicode 15.1.0 and uses the public Unicode mapping plus pinned source documentation for relevance; exact-target execution remains a release gate.

## Native Goal route observation

Requested route: Luna Max Standard. The raw Goal create and completion receipts are preserved at the artifact root. They report Goal status and usage but do not expose provider, model, service tier, or route options. Actual returned identity/options: unknown.
