#!/usr/bin/python3
import hashlib
import json
import os
import pathlib
import stat
import subprocess
import sys


def canon(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha(data):
    return hashlib.sha256(data).hexdigest()


def create(path, data):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o644)
    try:
        view = memoryview(data)
        while view:
            count = os.write(fd, view)
            view = view[count:]
        os.fsync(fd)
    finally:
        os.close(fd)
    dfd = os.open(path.parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(dfd)
    finally:
        os.close(dfd)


def create_json(path, value):
    create(path, canon(value) + b"\n")


def read_regular(path):
    info = os.lstat(path)
    if stat.S_ISLNK(info.st_mode) or not stat.S_ISREG(info.st_mode):
        raise RuntimeError(f"regular nonlink required:{path}")
    with open(path, "rb") as handle:
        return handle.read()


def inventory(root):
    paths = [root]
    for current, directories, files in os.walk(root, topdown=True, followlinks=False):
        directories.sort()
        files.sort()
        paths.extend(pathlib.Path(current) / name for name in directories)
        paths.extend(pathlib.Path(current) / name for name in files)
    entries = []
    for path in sorted(set(paths), key=lambda item: ("." if item == root else item.relative_to(root).as_posix()).encode("utf-8")):
        info = os.lstat(path)
        regular = stat.S_ISREG(info.st_mode)
        entries.append({
            "relative_path": "." if path == root else path.relative_to(root).as_posix(),
            "entry_type": "regular" if regular else "directory" if stat.S_ISDIR(info.st_mode) else "symlink" if stat.S_ISLNK(info.st_mode) else "other",
            "device": info.st_dev,
            "inode": info.st_ino,
            "mode": info.st_mode,
            "nlink": info.st_nlink,
            "size": info.st_size,
            "mtime_ns": info.st_mtime_ns,
            "ctime_ns": info.st_ctime_ns,
            "sha256_for_regular_files": sha(read_regular(path)) if regular else None,
        })
    return {"root_exists": True, "entries": entries}


def parse(raw):
    if not raw.endswith(b"\n") or raw.endswith(b"\n\n") or b"\r" in raw or b"\n" in raw[:-1]:
        raise RuntimeError("noncanonical reopen framing")
    value = json.loads(raw[:-1].decode("utf-8"))
    if not isinstance(value, dict) or canon(value) + b"\n" != raw:
        raise RuntimeError("noncanonical reopen JSON")
    return value


def main():
    case = pathlib.Path(__file__).resolve().parent
    captures = case / "captures"
    component = case / "custody-repo" / "r9_control_plane_stabilization_v1" / "iteration_012"
    evidence = case / "evidence"
    run_id = "pf-stop-after-attempt"
    target = evidence / run_id
    if not target.is_dir():
        raise RuntimeError("resulting run root missing")
    if any((captures / f"post-failure-reopen-{ordinal}.stdout.bin").exists() for ordinal in (1, 2)):
        raise RuntimeError("post-failure reopen already attempted; refusing repeat")
    baseline = inventory(target)
    create_json(captures / "post-failure-target-inventory-before-reopen-1.json", baseline)
    results = []
    environment = dict(os.environ)
    environment.update({"PW_R9_EVIDENCE_ROOT": str(evidence), "PYTHONDONTWRITEBYTECODE": "1", "LC_ALL": "C"})
    for ordinal in (1, 2):
        if ordinal == 2:
            create_json(captures / "post-failure-target-inventory-before-reopen-2.json", inventory(target))
        result = subprocess.run(["/usr/bin/python3", str(component / "runner.py"), "reopen", "--run-root", run_id], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=environment, timeout=90, check=False)
        create(captures / f"post-failure-reopen-{ordinal}.stdout.bin", result.stdout)
        create(captures / f"post-failure-reopen-{ordinal}.stderr.bin", result.stderr)
        create(captures / f"post-failure-reopen-{ordinal}-return-code.txt", f"{result.returncode}\n".encode("ascii"))
        after = inventory(target)
        create_json(captures / f"post-failure-target-inventory-after-reopen-{ordinal}.json", after)
        if after != baseline:
            raise RuntimeError(f"target changed during reopen {ordinal}")
        lines = result.stdout.splitlines(keepends=True)
        if result.returncode != 2 or result.stderr != b"" or len(lines) != 1:
            raise RuntimeError(f"unexpected reopen process outcome {ordinal}")
        value = parse(lines[0])
        expected = {"schema_id": "pw-r9-runner-error-v1", "status": "CONTROLLER_INVALID", "error_type": "_Invalid", "error": "matrix terminal: missing"}
        if value != expected:
            raise RuntimeError(f"unexpected reopen typed result {ordinal}:{value!r}")
        results.append((result.stdout, result.returncode, value))
    if results[0] != results[1]:
        raise RuntimeError("two reopen results differ")
    trace_lines = read_regular(captures / "signal-barrier-trace.jsonl").splitlines()
    trace = [json.loads(line) for line in trace_lines]
    pid = trace[0].get("pid") if trace else None
    proc_absent = not pathlib.Path(f"/proc/{pid}").exists() if isinstance(pid, int) else None
    receipt = {
        "schema_id": "pw-r9-process-fault-post-failure-reopen-receipt-v1",
        "fault_id": "STOP_AFTER_ATTEMPT",
        "primary": {"launch_count": 1, "rerun_count": 0, "replacement_count": 0, "failed_before_fault_injection": True, "first_mismatch": {"code": "REQUEST_ATTEMPT", "expected": 1, "actual": None}, "ptrace_exitkill_option_recorded": True, "owned_tracee_pid": pid, "proc_pid_absent_after_controller_exit": proc_absent},
        "resulting_root": {"sealed": False, "inventory_entries": len(baseline["entries"]), "unchanged_by_reopens": True},
        "reopen": {"invocation_count": 2, "returncodes": [2, 2], "stdout_streams_identical": True, "typed_result": results[0][2]},
        "calls": {"provider": 0, "subject": 0, "model": 0, "network": 0, "collaboration": 0},
        "qualification_credit": 0,
        "empirical_credit": 0,
        "authority": {"candidate_mint": False, "formal_audit": False, "freeze": False, "goal_completion": False, "launch": False, "qualification_claim": False, "release": False},
        "first_mismatch": {"code": "REQUEST_ATTEMPT", "expected": 1, "actual": None},
        "verdict": "FAILURE_PRESERVED_REOPENED_READ_ONLY",
    }
    create_json(case / "post-failure-reopen-receipt.json", receipt)
    sys.stdout.buffer.write(canon(receipt) + b"\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
