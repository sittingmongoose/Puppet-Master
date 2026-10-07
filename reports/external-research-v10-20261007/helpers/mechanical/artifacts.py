"""Freeze explicit file roles or collect an explicit compact publication selection."""
import argparse
import json
import os
import re
from pathlib import Path
from common import digest, encoded, read, scoped, write_new, object_put, now, emit

KINDS = {"task", "config", "output", "evidence", "review", "timing", "helper",
         "reproduction", "method", "failure", "cleanup"}
REQUIRED = {"task", "config", "output", "evidence", "review", "timing"}
SECRET = re.compile(rb"-----BEGIN (?:[A-Z ]*PRIVATE KEY)-----|\b(?:gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,})\b|(?:Authorization\s*:\s*Bearer\s+\S+)", re.I)


def output_check(root, outputs):
    for role, rel in outputs.items():
        path = scoped(root, rel)
        if path.exists() or not path.parent.is_dir() or not os.access(path.parent, os.W_OK | os.X_OK):
            raise ValueError(f"output destination unavailable: {role}: {rel}")


def freeze(root, spec, dest):
    output_check(root, spec.get("outputs", {}))
    rows, roles = [], set()
    for item in spec["inputs"]:
        role = item["role"]
        if role in roles:
            raise ValueError("duplicate input role")
        roles.add(role)
        data = read(scoped(root, item["path"]))
        sha = digest(data)
        if item.get("sha256", sha) != sha:
            raise ValueError(f"input changed: {role}")
        rows.append({"role": role, "original_path": item["path"], "sha256": sha,
                     "bytes": len(data), "path": "objects/" + object_put(dest, data)})
    if not rows:
        raise ValueError("empty input map")
    manifest = {"created_at": now(), "inputs": rows, "output_root": str(root.resolve()),
                "outputs": spec.get("outputs", {})}
    data = encoded(manifest)
    write_new(dest / "stage.json", data, readonly=True)
    return {"manifest": str(dest / "stage.json"), "pin_sha256": digest(data),
            "roles": {r["role"]: str(dest / r["path"]) for r in rows}}


def verify(dest, pin):
    data = read(dest / "stage.json")
    if digest(data) != pin:
        raise ValueError("stage pin mismatch")
    spec = json.loads(data)
    for item in spec["inputs"]:
        data = read(scoped(dest, item["path"]))
        if digest(data) != item["sha256"] or len(data) != item["bytes"]:
            raise ValueError("frozen input changed")
    output_check(Path(spec["output_root"]), spec["outputs"])
    return {"pin_sha256": pin, "readable_inputs": len(spec["inputs"]), "outputs_available": True}


def collect(root, spec, dest, budget):
    """No crawling/redaction/semantic selection. Owner supplies each exact file/absence."""
    rows, blobs, tasks, ids = [], {}, {}, set()
    for item in spec["items"]:
        key = (item["task"], item["kind"], item["id"])
        if key in ids or item["kind"] not in KINDS:
            raise ValueError("duplicate identity or unsupported publication kind")
        ids.add(key)
        tasks.setdefault(item["task"], set()).add(item["kind"])
        row = dict(item)
        if "absent" in item:
            if not item["absent"] or "path" in item:
                raise ValueError("absence needs reason and no copy path")
        else:
            if item.get("publishable") is not True or item.get("complete") is not True:
                raise ValueError("owner must attest publishable and complete selected artifact")
            rel = item["path"]
            if re.search(r"(?i)(transcript|\.git(?:/|$)|\.env(?:\.|$)|credentials|id_rsa)", rel):
                raise ValueError("raw transcript/credential/clone path rejected")
            data = read(scoped(root, rel))
            if SECRET.search(data):
                raise ValueError("suspected secret in selected file; provide explicit sanitized copy")
            sha = digest(data)
            if item.get("sha256", sha) != sha:
                raise ValueError("selected file changed")
            original = item.get("original_path", rel)
            original_data = read(scoped(root, original)) if original != rel else data
            if original_data != data and not item.get("copy_note"):
                raise ValueError("changed copy needs owner-authored copy_note")
            row.update(original_path=original, original_sha256=digest(original_data),
                       copy_sha256=sha, bytes=len(data), bundle_path="objects/" + sha,
                       identity="exact_copy" if original_data == data else "owner_supplied_changed_copy")
            blobs[sha] = data
        rows.append(row)
    if not tasks or any(not REQUIRED <= kinds for kinds in tasks.values()):
        raise ValueError("each task needs task/config/output/evidence/review/timing or explicit absences")
    if set(spec["tasks"]) != set(tasks):
        raise ValueError("selection must represent every explicitly declared task")
    manifest = {"created_at": now(), "items": rows,
                "scope": "owner-selected complete artifacts/absences; no semantic certification"}
    data = encoded(manifest)
    total = sum(map(len, blobs.values())) + len(data)
    if total > budget:
        raise ValueError("publication byte budget exceeded; nothing copied")
    for blob in blobs.values():
        object_put(dest, blob)
    write_new(dest / "manifest.json", data, readonly=True)
    return {"manifest": str(dest / "manifest.json"), "sha256": digest(data),
            "unique_file_bytes": sum(map(len, blobs.values())), "bundle_bytes": total,
            "items": len(rows)}


def verify_bundle(dest, pin):
    data = read(dest / "manifest.json")
    if digest(data) != pin:
        raise ValueError("publication pin mismatch")
    spec = json.loads(data)
    count = 0
    for item in spec["items"]:
        if "absent" not in item:
            body = read(scoped(dest, item["bundle_path"]))
            if digest(body) != item["copy_sha256"] or len(body) != item["bytes"]:
                raise ValueError("publication copy changed")
            count += 1
    return {"manifest_sha256": pin, "verified_copies": count}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("operation", choices=["freeze", "verify", "collect", "verify-bundle"])
    p.add_argument("--root", type=Path)
    p.add_argument("--spec", type=Path)
    p.add_argument("--dest", type=Path, required=True)
    p.add_argument("--pin", help="independently retained SHA-256 for verify")
    p.add_argument("--max-bytes", type=int, default=64*1024*1024)
    a = p.parse_args()
    if a.operation in ("verify", "verify-bundle"):
        if not a.pin:
            p.error("verify requires --pin")
        result = verify(a.dest, a.pin) if a.operation == "verify" else verify_bundle(a.dest, a.pin)
    else:
        if not a.root or not a.spec:
            p.error("freeze/collect require --root and --spec")
        spec = json.loads(read(a.spec))
        a.dest.mkdir(parents=True, exist_ok=False)
        result = (freeze(a.root, spec, a.dest) if a.operation == "freeze" else
                  collect(a.root, spec, a.dest, a.max_bytes))
    emit(result)


if __name__ == "__main__":
    main()
