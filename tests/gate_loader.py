"""Load the installed contract gate with its genuine repository helpers."""
from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HOOK_PATH = ROOT / "scripts/pm-new-contracts-verify.py"


def load_gate():
    sys.path.insert(0, str(ROOT / "scripts"))
    spec = importlib.util.spec_from_file_location("pm_new_contracts_verify_v9", HOOK_PATH)
    gate = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(gate)
    return gate
