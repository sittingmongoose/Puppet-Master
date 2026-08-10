# Stage A Plan Assurance rolling-trial packet v1.2

This packet is a narrow, representation-only launchability repair over the immutable v1.1 packet. It does not launch a trial and grants no launch authority.

## Exact repairs

1. `pm.plan_assurance.source_snapshot.merkle.v1.2` normalizes `st_nlink` to `null` for directory leaves only. Directory population remains committed by exact paths, modes, kinds, child leaves, Merkle roots, and counts. Regular-file link counts remain exact, and any multi-link regular file blocks. The authorized excluded run root is one exact NFC/ASCII-basename absolute path, absent at freeze, beneath real non-symlink ancestors, and created exclusively.
2. The semantic structural map is a descriptor plus deterministic ordered record-boundary shards. The exact 28.9 MB logical v1 map is reconstructed and passed through the unchanged v1 structural validator. Noncanonical/audit population rows remain committed only by the source roots and class counts. Four capability manifests bind exact canonical byte spans and contain no audit path.

The v1.1 stop remains `INPUT_DRIFT_STOP:EXCLUDED_RUN_ROOT_ANCESTOR_METADATA_UNMODELED`; it is evidence, not relabelled history.

## Validation boundary

The immutable v1.1 result is hash-bound as 55/55 gates and 263/263 negative mutations with zero survivors. Because the original validator hardcodes the now-existing v1.1 run root, v1.2 does not falsely claim an exact live rerun of that point-in-time gate. It replays portable parent gates/mutations against the fresh v1.2 absent root, adds blocker-specific mutations, performs a real live pre/post source replay, writes actual compact source/protected/structural backtest artifacts below the exact excluded root, and validates every JSON Schema.

READY means packet and local launch-harness readiness only. A separate controller must stage fresh v1.2 inputs and receive new sender-attested authority before any semantic worker, model, research, web, or network action.
