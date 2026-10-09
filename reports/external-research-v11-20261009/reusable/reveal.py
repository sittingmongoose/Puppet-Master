#!/usr/bin/env python3
"""One-shot exact-plan release after the investigator has frozen substantive discovery."""
import argparse, datetime as dt, hashlib, json
from pathlib import Path


def sha(b):
    return hashlib.sha256(b).hexdigest()


def iso():
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True, help="caller-owned config kept outside runtime_root")
    a = ap.parse_args()
    cp = Path(a.config).expanduser().resolve()
    c = json.loads(cp.read_text())
    root = Path(c["runtime_root"]).expanduser().resolve()
    stage = root / "stages" / "investigator"
    discovery = stage / "discovery.md"
    source_map = stage / "source-map.json"
    receipt = stage / "plan-reveal.json"
    released = stage / "revealed-plan.md"
    if not discovery.is_file() or discovery.stat().st_size < 500:
        raise SystemExit("save substantive discovery.md (>500 bytes) before plan reveal")
    if not source_map.is_file() or source_map.stat().st_size == 0:
        raise SystemExit("save source-map.json before plan reveal")
    if receipt.exists() or released.exists():
        raise SystemExit("exact plan may be revealed only once; preserve existing artifacts")
    # The plan is opened only after the discovery/source-map gates above.
    plan_src = Path(c["plan_path"]).expanduser().resolve()
    if not plan_src.is_file():
        raise SystemExit("configured plan_path is not a file")
    discovery_bytes = discovery.read_bytes()
    plan_bytes = plan_src.read_bytes()
    if discovery.read_bytes() != discovery_bytes:
        raise SystemExit("discovery changed during reveal; stop and preserve evidence")
    receipt_obj = {
        "revealed_at_utc": iso(), "run_id": c["run_id"],
        "discovery_sha256": sha(discovery_bytes), "discovery_bytes": len(discovery_bytes),
        "plan_sha256": sha(plan_bytes), "plan_bytes": len(plan_bytes),
        "plan_source": str(plan_src), "single_use": True
    }
    # Temp files make normal completion atomic. A partial crash is never silently repaired.
    plan_tmp = released.with_suffix(".md.tmp")
    receipt_tmp = receipt.with_suffix(".json.tmp")
    if plan_tmp.exists() or receipt_tmp.exists():
        raise SystemExit("partial reveal temp files exist; preserve them and stop")
    plan_tmp.write_bytes(plan_bytes)
    receipt_tmp.write_text(json.dumps(receipt_obj, ensure_ascii=False, indent=2) + "\n")
    plan_tmp.replace(released)
    receipt_tmp.replace(receipt)
    if sha(discovery.read_bytes()) != receipt_obj["discovery_sha256"] or sha(released.read_bytes()) != receipt_obj["plan_sha256"]:
        raise SystemExit("post-write hash mismatch; preserve files and stop")
    print(json.dumps(receipt_obj, ensure_ascii=False))


if __name__ == "__main__":
    main()
