"""Focused integration checks; fixtures stay under this helper directory and are removed."""
import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path
from unittest.mock import patch
from common import digest, encoded, now, write_new
from artifacts import freeze, verify, collect, verify_bundle
from compare_numeric import compare
from sandbox import execute, PROBE

HERE = Path(__file__).resolve().parent


def denied(call):
    try:
        call()
    except (ValueError, OSError):
        return
    raise AssertionError("unsafe/changed input accepted")


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--network", action="store_true", help="one public HTTPS retrieval and pinned reuse")
    p.add_argument("--report", type=Path)
    a = p.parse_args()
    checks = []
    with tempfile.TemporaryDirectory(prefix=".selfcheck-", dir=HERE) as temp:
        root = Path(temp)
        (root / "brief.txt").write_bytes(b"synthetic authored fixture\r\n")
        (root / "output").mkdir()
        stage = root / "stage"
        stage.mkdir()
        spec = {"inputs": [{"role": "brief", "path": "brief.txt"}],
                "outputs": {"proposal": "output/proposal.txt"}}
        frozen = freeze(root, spec, stage)
        verify(stage, frozen["pin_sha256"])
        blob = next((stage / "objects").iterdir())
        blob.chmod(0o600)
        blob.write_bytes(b"modified")
        denied(lambda: verify(stage, frozen["pin_sha256"]))
        checks.append("stage readability/output availability and frozen-byte tamper rejection")
        (root / "alias").symlink_to(root / "brief.txt")
        denied(lambda: freeze(root, {"inputs": [{"role": "brief", "path": "alias"}]}, stage))
        denied(lambda: freeze(root, {"inputs": [{"role": "brief", "path": "../escape"}]}, stage))
        checks.append("stage symlink and traversal rejection")
        (root / "redacted.txt").write_bytes(b"synthetic owner-supplied copy\n")
        selection = {"tasks": ["synthetic-task"], "items": [
            {"task": "synthetic-task", "kind": "task", "id": "brief", "path": "brief.txt",
             "publishable": True, "complete": True},
            {"task": "synthetic-task", "kind": "output", "id": "copy", "path": "redacted.txt",
             "original_path": "brief.txt", "copy_note": "synthetic changed-copy identity fixture",
             "publishable": True, "complete": True}] + [
            {"task": "synthetic-task", "kind": k, "id": k, "absent": "not generated in synthetic fixture"}
            for k in ("config", "evidence", "review", "timing")]}
        bundle = root / "bundle"
        bundle.mkdir()
        collected = collect(root, selection, bundle, 10000)
        verify_bundle(bundle, collected["sha256"])
        manifest = json.loads((bundle / "manifest.json").read_bytes())
        changed = manifest["items"][1]
        assert changed["copy_sha256"] != changed["original_sha256"]
        assert changed["identity"] == "owner_supplied_changed_copy"
        denied(lambda: collect(root, selection, bundle, 1))
        checks.append("publication absences, separate copy/original hashes, verification and byte budget")
        (root / "secret.txt").write_text("-----BEGIN PRIVATE KEY-----\nsynthetic\n")
        selection["items"][0]["path"] = "secret.txt"
        denied(lambda: collect(root, selection, bundle, 10000))
        selection["items"][0]["path"] = "transcript.txt"
        denied(lambda: collect(root, selection, bundle, 10000))
        checks.append("publication suspected-secret and raw-transcript rejection")
        rows = compare({"time": 12, "usage": None}, {"time": 6, "usage": "unknown", "zero": 0},
                       ["time", "usage", "missing", "zero"])["comparison"]
        assert rows[0]["right_minus_left"] == -6 and rows[0]["left_over_right"] == 2
        assert rows[1]["left"]["value"] is None and rows[1]["right"]["value"] == "unknown"
        assert rows[2]["left"]["state"] == "missing" and rows[3]["left_over_right"] is None
        overflow = compare({"time": 1e308}, {"time": 1e-320}, ["time"])["comparison"][0]
        assert overflow["left_over_right"] is None and overflow["arithmetic_issue"]
        checks.append("numeric deltas/ratios and distinct missing/null/unknown preservation")
        receipt = execute(PROBE)
        assert receipt["isolation"] == "namespace_and_seccomp_enforced", receipt
        assert receipt["process_exit"] == 0 and receipt["witness_validity"] == "not_assessed", receipt
        checks.append("actual namespace/seccomp probe: no host homes/run/mounts/etc, network, forks or writes")
        limited = execute(b'while True: print("x"*10000)', max_output=4096)
        assert limited["termination"] == "output_limit" and limited["output_truncated"]
        timed = execute(b'import time;time.sleep(10)', wall_seconds=0.5)
        assert timed["termination"] == "wall_timeout"
        closed = execute(b'import os,time;os.close(1);os.close(2);time.sleep(10)', wall_seconds=0.5)
        assert closed["termination"] == "wall_timeout" and closed["resource_released"]
        memory = execute(b'bytearray(1024*1024*1024)')
        assert memory["process_exit"] != 0 and "MemoryError" in memory["stderr"]
        cpu = execute(b'while True: pass')
        assert cpu["process_exit"] != 0 and cpu["termination"] is None and cpu["resource_released"]
        assert cpu["isolation"] == "namespace_and_seccomp_enforced"
        checks.append("sandbox output/time/CPU/address-space enforcement and release even with closed output pipes")
        with patch("sandbox.shutil.which", return_value=None):
            blocked = execute(b'raise AssertionError("must never execute")')
        assert blocked["isolation"] == "unavailable" and blocked["process_exit"] is None
        assert blocked["ended_at"] and blocked["elapsed_seconds"] >= 0 and blocked["resource_released"]
        checks.append("sandbox absence fails closed without executing code")
        if a.network:
            def cli(*args):
                result = subprocess.run([sys.executable, "-B", str(HERE / "source_cache.py"), *args],
                                        capture_output=True, timeout=40)
                assert result.returncode == 0, result.stderr.decode() + result.stdout.decode()
                return json.loads(result.stdout)
            cache = root / "cache"
            cold = cli("fetch", "https://raw.githubusercontent.com/python/cpython/v3.12.0/LICENSE",
                       "--cache", str(cache), "--lines", "1:3", "--receipt", str(root / "cold.json"))
            warm = cli("read", cold["record_id"], "--cache", str(cache),
                       "--receipt", str(root / "warm.json"))
            assert cold["network_requests"] == 1 and warm["network_requests"] == 0
            assert cold["record"] == warm["record"] and warm["cache_mode"] == "warm"
            raw = (cache / "objects" / cold["record"]["raw"]["sha256"]).read_bytes()
            extracted = (cache / "objects" / cold["record"]["extracted"]["sha256"]).read_bytes()
            assert extracted == b"".join(raw.splitlines(keepends=True)[:3])
            from source_cache import fetch_bytes, verify_record
            obj = cache / "objects" / cold["record"]["raw"]["sha256"]
            obj.chmod(0o600)
            obj.write_bytes(b"changed source")
            denied(lambda: verify_record(cache, cold["record_id"]))
            denied(lambda: fetch_bytes("https://127.0.0.1/source"))
            rejected = subprocess.run([sys.executable, "-B", str(HERE / "source_cache.py"),
                "fetch", "https://user:synthetic-secret@github.com/file", "--cache", str(cache),
                "--receipt", str(root / "rejected.json")], capture_output=True, timeout=5)
            assert rejected.returncode == 1
            assert b"synthetic-secret" not in rejected.stdout + rejected.stderr
            assert b"synthetic-secret" not in (root / "rejected.json").read_bytes()
            checks.append("real public cold fetch, zero-network warm reuse, exact extraction, hash tamper/private-IP rejection")
            checks.append("credential URL rejection without persisting credential in operation receipt")
    report = {"checked_at": now(), "checks": checks, "count": len(checks),
              "network_checked": a.network, "temporary_fixtures": "removed",
              "helper_sha256": {name: digest((HERE / name).read_bytes()) for name in
                                ("common.py", "artifacts.py", "source_cache.py", "sandbox.py",
                                 "compare_numeric.py", "selfcheck.py")},
              "scope": "mechanical helper engineering only; no scientific assessment"}
    if a.report:
        write_new(a.report, encoded(report))
    print(encoded(report).decode(), end="")


if __name__ == "__main__":
    main()
