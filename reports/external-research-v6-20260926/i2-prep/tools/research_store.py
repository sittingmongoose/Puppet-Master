"""I2-specific finite capacities on an isolated copy of the frozen Store module.

No source rewrite, native call, semantic repair, or research-wide defaults.
"""
import hashlib
import importlib.util
import re
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[2] / "delivery-v2/tools/delivery_store.py"
SOURCE_SHA = "81364fd1a4040ba457dd04779d096709c3524bee8704a2c8f453fb18264c85c7"
MAX_ATTEMPTS = 64
MAX_BYTES = 32768


def frozen_module():
    if hashlib.sha256(SOURCE.read_bytes()).hexdigest() != SOURCE_SHA:
        raise ValueError("frozen delivery store pin changed")
    spec = importlib.util.spec_from_file_location("i2_private_store", SOURCE)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    module.MAX_ATTEMPTS = MAX_ATTEMPTS
    module.MAX_BYTES = MAX_BYTES
    return module


def create_store(workspace, archive):
    return frozen_module().Store(Path(workspace), Path(archive))


def attempt_counts(store):
    """Include available over-cap/unsubmitted paths without accepting them.

    Native traces must additionally count failed writes and illicit overwrites.
    Filesystem names alone cannot recover vanished attempted submissions.
    """
    attempts = store.state["attempts"]
    acknowledged = {a["request"] for a in attempts}
    request_names = {p.name for p in store.requests.iterdir()}
    payload_names = {p.name[:-3] if p.name.endswith(".md") else p.name
                     for p in store.payloads.iterdir()}
    offered = acknowledged | request_names | payload_names
    return {"acknowledged": len(attempts),
            "initial_attempts": sum(a["revision"] == 1 and a["request"].startswith("new--") for a in attempts),
            "revision_attempts": sum(bool(re.fullmatch(r"F[0-9]{4}--[a-z0-9][a-z0-9_-]{0,39}", a["request"])) for a in attempts),
            "unbound_invalid_attempts": sum(a["finding_id"] is None for a in attempts),
            "invalid_attempts": sum(a["status"] != "VALID_UNVERIFIED" for a in attempts),
            "observed_unique_attempt_paths": len(offered),
            "unacknowledged_paths": sorted(offered - acknowledged),
            "native_failed_writes": "requires existing native trace; not inferred zero"}
