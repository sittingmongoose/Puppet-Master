# Stage A Plan Assurance Rolling Trial Packet v1.1

Status: design-only repair packet. A trial is not authorized by this directory.

This packet repairs the bounded launchability defects exposed by the immutable
v1 run. It does not change the Plan Assurance method, relabel the v1 stop, or
claim that any Puppet Master Plan is complete, buildable, or product-ready.

## Immutable lineage

- Base packet: `../stage-a-plan-assurance-rolling-trial-packet-v1`
- Base contract SHA-256: `e034bbd8531f793490a6098261e94845cadf4ec632df63f7d3377f762c728c9a`
- Base core population SHA-256: `7c9769b154e7166f0b23f7ce17dc0754b0a92493ae984f80930e1e662e9ee592`
- v1 terminal: `BUDGET_STOP:PREFLIGHT_ARTIFACT_FUSE`
- v1 terminal handoff SHA-256: `0245aad977d1f32c7a3ee11c72c1140bea12bf157fc28a38f86c2e4a227e2a4b`
- v1 fuse projection SHA-256: `5b7ef1ad17e12866afd77e5479ae58599764aed177b44ee532736cb937bb5e47`

The v1 packet remains authoritative for unchanged semantic contracts and its
validated pilot schemas. `ROLLING_TRIAL_CONTRACT.json` is a narrow overlay.

## What v1.1 repairs

1. `SOURCE_SNAPSHOT` becomes a 256-bucket, 16-shard dual-Merkle commitment.
   A complete live scan remains mandatory, but 114k filesystem rows are not
   copied into a receipt.
2. `PROTECTED_STATE` records exact length/hash commitments for Git outputs and
   compact filesystem population roots. Raw and base64 Git bytes are forbidden.
3. `STRUCTURAL_COVERAGE_MAP` carries rows only for canonical active regular
   files. Generated, governance, lineage, audit, retired, and unknown classes
   remain committed by the source snapshot and class roots/counts.
4. v1.1 hashes are artifact-kind domain-separated and reject NFC key/path
   collisions.
5. Exact worker payloads and the semantic execution envelope are built and
   frozen before external authority. One fresh authority is then bound to those
   exact bytes.
6. `TRUSTED_LAUNCH_CAPABILITY.json` and its one-use marker live beneath the
   sole run root, eliminating the former two-write-root contradiction.
7. Every physical file and decoded logical artifact is counted. Large artifacts
   use bounded shards; compression is optional and is never an accounting
   exemption.

## Required prelaunch order

1. Freeze packet identity; confirm the future run root is absent.
2. Capture a stable double source scan and `PROTECTED_BEFORE` while it remains
   absent.
3. Create the sole audit-local run root under local-staging authority only.
4. Build and validate all deterministic structural and worker-input artifacts.
5. Freeze the transmission manifest, execution envelope, and launch request.
6. Receive and live-validate one fresh Codex collaboration sender attestation.
7. Write the trusted capability and consume its one-use marker inside
   `AUTHORITY/` beneath the run root.
8. After the complete live scan returns, capture fresh platform time and pass
   `validate_immediate_predispatch_freshness` no more than two seconds before
   the immediate dispatch boundary. Its receipt claims only that boundary, not
   that an external action occurred.
9. Dispatch only the exact hash-bound, clean-context payloads.

An offline JSON file cannot prove collaboration sender identity. If fresh live
metadata is unavailable, the only honest outcome is
`TRIAL_BLOCKED:UNVERIFIABLE_AUTHORITY_LINEAGE`.

## Isolation boundary

Semantic workers must use `fork_turns=none`, have no descendants, receive only
the payloads enumerated in the frozen transmission manifest, and perform no
repository/audit reads or writes. Codex roles still share a host filesystem;
this is not an OS sandbox. Any observed out-of-packet read invalidates that
result and blocks scale inference.

## Artifact fuses

- ordinary file and raw model response: 1 MiB each
- shard: 8 MiB physical and 8 MiB decoded
- logical artifact: 96 MiB decoded, at most 32 shards
- campaign: 640 files, 192 MiB physical, 256 MiB decoded logical bytes
- campaign shard files: 128
- terminal reserve: 8 files and 4 MiB physical/decoded

The writer must stop before a write that would consume a reserve or exceed a
cap. A producer-reported count is never evidence; validators use lstat, hashes,
and streaming decompression.

## Validation

Run locally, without model or network calls:

```text
python3 -B Plans/.audits/stage-a-plan-assurance-rolling-trial-packet-v1_1/validate_packet.py
python3 -B Plans/.audits/stage-a-plan-assurance-rolling-trial-packet-v1_1/validate_trial_artifacts.py --self-test
```

`validate_packet.py` revalidates the immutable v1 base, verifies the v1 stop,
replays the exact historical v1 population, scans the current live corpus twice,
captures compact protected state, and runs v1.1-specific negative mutations.
It performs no trial launch, semantic worker dispatch, web/model/network call,
canonical/generated/governance edit, or Git write.

## Claim boundary

`READY_FOR_TRIAL_AUTHORIZATION`, if emitted, means only that this packet and
its local representation/launch harness are ready for a separately authorized
bounded trial. It does not mean the trial ran or succeeded, and it is not a
Plan, product, buildability, implementation, runtime, or governance claim.
