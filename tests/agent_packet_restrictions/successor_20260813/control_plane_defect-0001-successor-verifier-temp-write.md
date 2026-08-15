# Control-plane defect 0001 — successor verifier temporary write outside exclusive root

Status: `SUCCESSOR_PREFLIGHT_INVALID_WRITE_BOUNDARY`

Captured UTC: `2026-08-13T17:17:05Z`

## Defect

The successor controller invoked:

`python3 scripts/pm-plans-verify.py run-gates`

It was intended as a read-only standard Plan-governance observation. The command internally launches subchecks with temporary `--report` files under the process temporary directory. A live process-table observation confirmed this exact child command and path:

`/usr/bin/python3 scripts/pm-plans-verify.py check-shards --report /tmp/pm-subcheck-check_shards-98iyebrk.json --subcheck-timeout-seconds 180`

The confirmed `/tmp/pm-subcheck-check_shards-98iyebrk.json` creation was outside the only authorized write root:

`/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/`

That single confirmed path is sufficient to fail the literal boundary. The aggregate verifier uses a per-subcheck temporary-report pattern, so additional ephemeral paths may have existed, but their names were not captured and are not invented here. An earlier invocation of the same aggregate command in this successor task is conservatively treated as boundary-tainted for the same reason.

## Preservation

- The verifier automatically removed its ephemeral current-run report; the successor did not delete, move, or repair the file.
- A later observation reran the command with `TMPDIR` set to the exclusive root. That contained its writes, but the JSON-syntax subcheck saw its own empty in-progress `.json` report and failed. The later contained run does not cure this prior outside-root write.
- No subject, provider, route, authentication, canary, pilot, fleet, reviewer, or repair call occurred.
- No canonical Plan, active ledger, concept, implementation/runtime, governance, WorkNode, NodeSeed, queue, Spec Lock, shard, evidence, plan graph, or auto-decision file was edited by the successor.
- Concurrent owner work changed ledger, GUI Plan, index, shard, evidence, and governance artifacts during the observation window. Those changes were preserved and are not attributed to the successor.

## Disposition

This preflight cannot honestly reach `READY_FOR_JARED_TEST_PLAN`. Its terminal is `NOT_READY` even if all content, custody, scorer, capture, lineage, and question checks pass.

A clean retry requires a new explicitly authorized successor preflight version. It must preserve this record, avoid the aggregate verifier's default temporary-directory behavior, keep every report path inside the authorized root without making the JSON scanner inspect its own in-progress report, and rebind all drifted inputs before evaluating readiness.
