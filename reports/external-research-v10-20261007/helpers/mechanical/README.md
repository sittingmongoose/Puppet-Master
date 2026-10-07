# ER10 mechanical helpers

Python standard-library helpers, with Linux bubblewrap/libseccomp needed only for
the execution primitive. These files make no source-truth judgments, reviews,
scores, already-covered classifications, or winner selections. Root owns method
configuration, task dispatch, native Goals, publication, commits and pushes.

## Scope and resolved paths

- Code and retained engineering check: this `helpers/mechanical/` directory under
  `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/`.
- Applicable rules read: live worktree `AGENTS.md`, `AGENTS.append.md`, global
  `/home/sittingmongoose/.codex/AGENTS.md`, and handoff sections 8, 10–13. No more
  specific AGENTS existed at the campaign/helper ancestors when checked.
- Source cache, frozen stage, operation receipts and publication selection paths
  are supplied explicitly by root; no sibling directory discovery or ownership
  assumptions. Source caches must be case-scoped and contain only public sources.
- Check fixtures are created beneath this helper directory and removed. The
  sandbox creates no execution directory and mounts memory-carried input bytes.
- Root selects durable raw evidence under `/mnt/Cursor/PuppetMaster-Evidence/`
  and compact published material under repository `reports/`, following AGENTS.
  This implementation does not create either or write to the repository.

Run from this directory with `python3 -B` to avoid bytecode scratch. All receipt
and destination examples below are paths chosen by root, not automatically
created campaign assignments. JSON specs below are small, explicit selections.

## Exact public source cache (M04/M05)

```bash
python3 -B source_cache.py fetch https://raw.githubusercontent.com/OWNER/REPO/FULL_COMMIT/path \
  --cache CASE/source-cache --commit FULL_COMMIT --lines 10:35 \
  --receipt CASE/cold-source-operation.json
python3 -B source_cache.py read RECORD_SHA256 --cache CASE/source-cache \
  --receipt CASE/warm-source-operation.json
```

`fetch` always requests current bytes at the exact URL; `read` reuses an explicit
content-addressed record and verifies both raw and extracted objects. Record IDs
are SHA-256 of exact record JSON bytes. `objects/<sha256>` contains original bytes
or an exact UTF-8 line slice, including original line endings; `records/<sha>.json`
contains original/final URL, retrieval time, supplied commit label, response
version headers, extraction version/range, sizes and hashes. Omit `--lines` for
identity extraction. `--expect-sha256` pins expected **raw** bytes on a fresh fetch.
Commit labels are explicitly unverified caller metadata, not proof of URL/commit
binding. Use an immutable full-commit URL for code and verify the binding outside
this helper. Never invent a commit for a versionless source.

Cold/warm receipts include elapsed time, retrieval metadata, attempted HTTP request
count (redirects included), success/error, and the record identity. Warm operations
have zero network requests; their elapsed time includes hash verification. Failure
receipts are retained and exit 1. There is no URL alias, answer cache, discovery
summary, dependency equivalence classifier, or cache-hit freshness claim. Critics
can fetch any additional public source, including refreshing the same URL. The
root must record cold seed costs separately from warm reuse and must decide M05
dependency coverage from authored evidence, not from a hash alone.

Only public HTTPS on port 443 without queries/fragments/credentials is supported.
Each redirect's DNS addresses must all be globally routable; TLS verifies the
hostname while TCP connects to a validated address. No proxies, cookies or auth
headers are used. Bodies are capped at 16 MiB; network reads use a 30-second
deadline. OS DNS resolution can exceed that deadline, so a root job limit remains
necessary. Compressed HTTP responses are rejected rather than silently transformed.

## Freeze and verify stage inputs

`map.json` example (paths relative to `--root`):

```json
{"inputs":[{"role":"brief","path":"task.md"},{"role":"supplied_critique","path":"critic.md"},{"role":"optional_adoption_list","path":"adoption.md"}],"outputs":{"proposal":"output/proposal.md"}}
```

```bash
python3 -B artifacts.py freeze --root CASE --spec map.json --dest CASE/frozen-stage
python3 -B artifacts.py verify --dest CASE/frozen-stage --pin STAGE_JSON_SHA256
```

The result supplies an exact role-to-absolute-copy-path map. Files are bounded,
regular, readable, without symlink components or escaping relative paths. Optional
input `sha256` detects changes since an earlier pin. Output parents must already
exist and be writable, with destinations absent. Stage JSON and byte copies are
read-only; retain the returned stage pin independently and verify just before
dispatch. Authoritative role naming and stage selection belong to root; a supplied
critique and optional adoption list must have distinct roles.

Read-only mode is advisory for the owner; independent hashes detect edits. This
map is not a filesystem access-control boundary for a T3 child. Native child scope
or actual isolation must still exclude evaluator keys, sibling answers and parent
history. No candidate capability test reads secrets.

## Bounded Python execution

```bash
python3 -B sandbox.py --probe --receipt CASE/sandbox-capability.json
python3 -B sandbox.py --code CASE/authored-witness.py --input CASE/authored-data.bin \
  --wall-seconds 5 --receipt CASE/execution.json
```

The generic primitive admits a single Python process, with optional data at
`/input.bin`. It supports no command shell, repo installer, configurable bind
mount, credential forwarding, host socket, writable host path or network. Fixed
system Python/lib directories are mounted read-only. All namespaces are requested;
bootstrap seccomp forbids forks/threads/exec, sockets and isolation escape syscalls.
The guest root, proc, dev and tmp are read-only. Limits are 256 MiB address space,
2 CPU seconds, at most 30 wall seconds, 32 descriptors, 1 MiB per-file writes and
128 KiB combined captured stdout/stderr. Time/output overruns terminate and reap
the owned bubblewrap process; PID namespace teardown releases the guest. This is
a narrow computation primitive, not a repo build environment or full VM boundary.

If bubblewrap, namespaces, the fixed x86_64 Python runtime or seccomp are unavailable,
the helper records a blocker and never substitutes host execution. The trusted
bootstrap must finish namespace/seccomp setup before candidate code runs. The
actual probe passed on this host; direct `unshare` failed and was not used as a
fallback. `--probe` checks no homes/run/mounts/etc, forks, socket creation or writes.

CLI exit 2 means isolation unavailable; exit 1 means the mechanical capability
probe failed. A normal admitted code invocation exits 0 even if the candidate
process failed: read `process_exit` (bubblewrap status, including 128+signal) and
`termination` independently. Witness
validity and applicability remain `not_assessed`. Captures are bounded UTF-8
projections with replacement for invalid bytes, not exact binary output carriers.

## Compact publication collector

Supply `selection.json` with `tasks` (the declared complete task census) and an
explicit `items` list. Example rows:

```json
{"tasks":["case-control"],"items":[
  {"task":"case-control","kind":"task","id":"brief","path":"task.md","publishable":true,"complete":true},
  {"task":"case-control","kind":"output","id":"proposal","path":"publish/proposal.md","original_path":"original/proposal.md","copy_note":"Owner-authored description of redaction and any reproduction limit","publishable":true,"complete":true},
  {"task":"case-control","kind":"review","id":"independent-review","absent":"Not run"}
]}
```

This abbreviated example needs `config`, `evidence` and `timing` rows or explicit
absence records before collection succeeds. Every declared task needs all six
categories: task, config, output, evidence, review, timing. Additional allowed kinds
are helper, reproduction, method, failure and cleanup. IDs identify authored
versions; include failed and superseded versions as explicit items where needed.

```bash
python3 -B artifacts.py collect --root CAMPAIGN --spec selection.json \
  --dest COMPACT_BUNDLE --max-bytes 67108864
python3 -B artifacts.py verify-bundle --dest COMPACT_BUNDLE --pin MANIFEST_SHA256
```

The collector makes no directory scans and changes no selected bytes. The compact
manifest maps each readable content-addressed object to task/kind/id and original
relative path, exact original/copy SHA-256, size and copy identity. Duplicate bytes
are stored once. Original bytes differing from a supplied copy are hashed but not
copied automatically; the owner must supply a copy note. The manifest pin and all
copies can be reverified after publication. Absence reasons are preserved literally.
Selected files are limited to 16 MiB each, bundle to 64 MiB by default. Budget
checking precedes copying. New destinations are never reused/overwritten; a failed
freeze may leave a narrow incomplete destination for root to inspect.

Raw transcript, credential and `.git` paths and recognizable key/token content
are rejected. This is only a small defensive check, **not a complete secret or
license scanner**. Root must select sanitized, lawfully publishable complete
artifacts and check that owner-supplied redactions preserve meaning. Coverage and
completeness attestations are recorded, not independently inferred. This helper
does not score, silently redact, select favorable results, generate absences for
missing files, copy full clones, or operate Git/T3.

## Numeric timing/usage comparison

```bash
python3 -B compare_numeric.py control.json treatment.json \
  candidate_latency_seconds usage.input_tokens usage.cached_input_tokens usage.output_tokens
```

Produces right-minus-left and left-over-right for explicitly named finite numeric
fields. Missing fields, null, strings such as `unknown`, and booleans remain
distinct supplied values without zero imputation. A zero denominator has no ratio.
Root must select same-unit fields. No interval summation, parent/child usage
aggregation, cache/generated-token relabeling, dollar estimate or scientific grade
is computed. All attempts can be compared without filtering on exit status.

## Focused verification

```bash
python3 -B selfcheck.py --network
```

`SELF_CHECK.json` records the actual check run. It covers exact public cold/warm
source reuse and extraction, tamper rejection, stage path safety, publication
absence/copy identities/budgets and defensive secret rejection, unknown metrics,
actual namespace/seccomp enforcement, output/time/memory limits, closed-output
cleanup, and fail-closed behavior when bubblewrap is absent. All synthetic fixtures
are deleted after the run. No campaign outputs were evaluated or edited.
