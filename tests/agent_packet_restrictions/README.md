# Agent packet restriction empirical test lane

All artifacts for the corrected 8-low/2-high empirical study are confined to this directory. This lane tests proposed contracts and current reachable behavior; it does not compile the ledger, edit canonical Plans, implement production enforcement, or treat simulation as production proof.

Current state: method V2 and its deterministic controller are qualified; the exact subject matrix is intentionally `USER_MODEL_SELECTION_PENDING`. The user will select the eight relative-low and two relative-high routes before any route canary, pilot, or fleet call. The interlock blocks those commands before credentials are read or a provider subprocess starts.

The V1 controller qualification is preserved as `CONTROL_PLANE_DEFECT`: its initial self-tests passed, but an independent audit found insufficient freeze binding and fail-closed coverage. V2 corrected those defects and passed its expanded frozen deterministic suite. V1 artifacts and receipts remain immutable evidence and are not launch prerequisites.

Subdirectories:

- `charter/`: frozen method and boundary records
- `inventory/`: source-referenced affected-surface inventory
- `cases/`: case definitions and scoring contracts
- `fixtures/`: immutable test inputs
- `controller/`: test-only orchestration and deterministic validation
- `runs/`: versioned run manifests
- `raw/`: immutable subject outputs and provider captures
- `receipts/`: hashes, deterministic checks, and identity evidence
- `reports/`: results, failures, residual risks, and recommendations
- `tmp/`: lane-local temporary material only
