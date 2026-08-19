#!/usr/bin/env python3
"""Probe BinaryLocator layers on this host and write shared/v2/binary-locator-live.{json,js}.

Does not install, update, or crawl beyond Override → PATH → CommonLocations → Launchers.
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path

CANDIDATES = {
    "anthropic": ["claude.exe", "claude", "claude-code.exe", "claude-code"],
    "cursor-agent": ["cursor-agent.exe", "cursor-agent.cmd", "cursor-agent.CMD", "cursor-agent"],
    "local-ollama": ["ollama.exe", "ollama"],
}


def which_all(name: str) -> list[str]:
    hits: list[str] = []
    w = shutil.which(name)
    if w:
        hits.append(str(Path(w)))
    try:
        r = subprocess.run(["where", name], capture_output=True, text=True, timeout=5)
        for line in (r.stdout or "").splitlines():
            p = line.strip()
            if p and Path(p).exists():
                rp = str(Path(p))
                if rp not in hits:
                    hits.append(rp)
    except Exception:
        pass
    return hits


def probe() -> dict:
    local = os.environ.get("LOCALAPPDATA", "")
    pf = os.environ.get("ProgramFiles", "")
    home = str(Path.home())
    common_specs = [
        (local, r"Programs\claude\claude.exe"),
        (local, r"AnthropicClaude\claude.exe"),
        (home, r".local\bin\claude.exe"),
        (local, r"cursor-agent\cursor-agent.exe"),
        (local, r"Programs\cursor-agent\cursor-agent.exe"),
        (local, r"Ollama\ollama.exe"),
        (local, r"Programs\Ollama\ollama.exe"),
        (pf, r"AnthropicClaude\claude.exe"),
        (pf, r"Ollama\ollama.exe"),
    ]
    common = []
    seen: set[str] = set()
    for base, rel in common_specs:
        if not base:
            continue
        path = str(Path(base) / rel)
        key = path.lower()
        if key in seen:
            continue
        seen.add(key)
        common.append({"path": path, "exists": Path(path).exists()})

    versions = Path(local) / "cursor-agent" / "versions"
    launcher_hits = []
    if versions.is_dir():
        kids = [
            p
            for p in versions.iterdir()
            if p.is_dir() and not p.name.startswith(".") and not p.name.endswith(".tmp")
        ]
        kids.sort(key=lambda p: p.name.encode("utf-8"), reverse=True)
        if kids:
            exe = kids[0] / "cursor-agent.exe"
            cmd = kids[0] / "cursor-agent.cmd"
            pick = exe if exe.exists() else cmd
            launcher_hits.append(
                {"versionDir": str(kids[0]), "exe": str(pick), "exists": pick.exists()}
            )

    path_layer: dict[str, list[dict]] = {}
    for pid, names in CANDIDATES.items():
        path_layer[pid] = []
        seenp: set[str] = set()
        for n in names:
            for hit in which_all(n):
                if hit.lower() in seenp:
                    continue
                seenp.add(hit.lower())
                path_layer[pid].append({"candidate": n, "path": hit, "exists": True})

    resolved = {}
    for pid in CANDIDATES:
        hit = None
        layer = None
        evidence: list[str] = []
        if path_layer[pid]:
            hit = path_layer[pid][0]["path"]
            layer = "PATH"
            evidence.append("PATH:" + path_layer[pid][0]["candidate"])
        if not hit:
            token = "claude" if pid == "anthropic" else ("cursor-agent" if pid == "cursor-agent" else "ollama")
            for rec in common:
                if rec["exists"] and token in rec["path"].lower():
                    hit = rec["path"]
                    layer = "CommonLocations"
                    evidence.append("CommonLocations:" + rec["path"])
                    break
        if not hit and pid == "cursor-agent" and launcher_hits and launcher_hits[0].get("exists"):
            hit = launcher_hits[0]["exe"]
            layer = "Launchers"
            evidence.append("Launchers:" + launcher_hits[0]["versionDir"])
        resolved[pid] = {
            "result": "Valid" if hit else "NotFound",
            "source_layer": layer,
            "path": hit,
            "confidence": "strongly_identified" if hit else "none",
            "evidence": evidence,
            "host": os.environ.get("COMPUTERNAME"),
            "os": "Windows Native",
        }

    return {
        "probedAt": datetime.now(timezone.utc).isoformat(),
        "host": os.environ.get("COMPUTERNAME"),
        "os": "Windows Native",
        "probeOrder": ["Override", "PATH", "CommonLocations", "Launchers"],
        "layers": {
            "Override": {"skipped": True, "reason": "no override_path"},
            "PATH": path_layer,
            "CommonLocations": common,
            "Launchers": launcher_hits,
        },
        "resolved": resolved,
        "owner": "BinaryLocator",
        "client": "PMv2.binaryLocatorClient",
        "notSecondOwner": True,
    }


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    out_dir = root / "shared" / "v2"
    snap = probe()
    (out_dir / "binary-locator-live.json").write_text(json.dumps(snap, indent=2) + "\n", encoding="utf-8")
    (out_dir / "binary-locator-live.js").write_text(
        "window.__pmBinaryLocatorLive = " + json.dumps(snap) + ";\n", encoding="utf-8"
    )
    print(json.dumps({"ok": True, "resolved": snap["resolved"], "out": str(out_dir)}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
