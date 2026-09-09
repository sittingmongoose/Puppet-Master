#!/usr/bin/env python3
"""Publish TestPMConcept.html from the pinned checkpoint plus the T50 Settings refresh.

Usage:
  python3 Concepts/pm7-tools/build_testpm_settings_refresh.py            # writes Concepts/TestPMConcept.html
  python3 Concepts/pm7-tools/build_testpm_settings_refresh.py --check    # verifies the published file
  python3 Concepts/pm7-tools/build_testpm_settings_refresh.py --out X --report R.json
  python3 Concepts/pm7-tools/build_testpm_settings_refresh.py --parity <build_pm7 output.html>

The base is the exact published file recorded in settings_refresh_checkpoint.json.
No silent repin: a base mismatch aborts.  The full build_pm7.py pipeline carries the
same transform as T50; --parity asserts both paths produce identical Settings blocks.
"""
from pathlib import Path
import argparse, hashlib, json, re, subprocess, sys, tempfile

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import settings_refresh_source as source  # noqa: E402

SETTINGS_BLOCK_IDS = ["pm4-settings-css", "pm49-assistant-settings-css", "pm50-manager-layout",
                      "pm51-settings-refresh", "pm7-settings-data", "pm4-settings-js"]


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def need(ok, why):
    if not ok:
        raise SystemExit("FAIL: " + why)


def blocks(doc: str) -> dict:
    out = {}
    for tag in ("style", "script"):
        for m in re.finditer(r'<%s\b([^>]*)>(.*?)</%s>' % (tag, tag), doc, re.S):
            idm = re.search(r'id="([^"]+)"', m.group(1))
            if idm:
                out[idm.group(1)] = m.group(2)
    return out


def node_check(doc: str) -> int:
    checked = 0
    with tempfile.TemporaryDirectory() as tmp:
        for i, (attrs, body) in enumerate(re.findall(r'<script\b([^>]*)>(.*?)</script>', doc, re.S)):
            if "application/json" in attrs:
                json.loads(body)
                continue
            if not body.strip():
                continue
            f = Path(tmp) / f"{i}.js"
            f.write_text(body, encoding="utf-8")
            r = subprocess.run(["node", "--check", str(f)], capture_output=True, text=True)
            need(r.returncode == 0, f"node --check failed for script #{i} {attrs[:60]}\n{r.stderr[-1500:]}")
            checked += 1
    return checked


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=Path, default=HERE.parent / "TestPMConcept.html")
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--report", type=Path)
    ap.add_argument("--parity", type=Path, help="another built HTML whose Settings blocks must match")
    a = ap.parse_args()

    pin = json.loads((HERE / "settings_refresh_checkpoint.json").read_text())
    base = (HERE / "base/TestPMConcept-settings-refresh-base.html").read_bytes()
    need(sha(base) == pin["sha256"], "published checkpoint mismatch; no silent repin")
    before = base.decode("utf-8")
    notes = {}
    after = source.apply(before, notes, need)
    scripts = source.check_scripts_unchanged(before, after, need)
    checked = node_check(after)
    engine = re.search(r'<script\b[^>]*\bid="pm4-settings-js"[^>]*>(.*?)</script>', after, re.S).group(1)
    need(not source.EMOJI_RE.search(engine), "emoji code point in the Settings engine")
    checker = HERE.parent / "pm6-build" / "checks" / "check_no_emoji.py"
    if checker.exists():
        with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as tmp:
            tmp.write(after); tmp_path = tmp.name
        r = subprocess.run([sys.executable, str(checker), tmp_path], capture_output=True, text=True)
        Path(tmp_path).unlink(missing_ok=True)
        need(r.returncode == 0, "pm6 no-emoji checker failed:\n" + r.stdout[-800:] + r.stderr[-400:])
    out = after.encode("utf-8")
    report = {"lane": "settings_refresh_checkpoint", "base_sha256": pin["sha256"], "base_commit": pin["source_commit"],
              "output_sha256": sha(out), "output_bytes": len(out), "scripts": scripts, "scripts_node_checked": checked,
              "all_non_settings_scripts_byte_identical": True, "transform": notes}
    if a.parity:
        other = blocks(a.parity.read_text(encoding="utf-8"))
        mine = blocks(after)
        diff = [k for k in SETTINGS_BLOCK_IDS if other.get(k) != mine.get(k)]
        report["parity"] = {"against": str(a.parity), "settings_blocks_identical": not diff, "differing": diff}
        need(not diff, "parity: Settings blocks differ: " + ", ".join(diff))
    if a.check:
        need(a.out.is_file() and a.out.read_bytes() == out, "output differs from a fresh checkpoint build")
    else:
        a.out.parent.mkdir(parents=True, exist_ok=True)
        a.out.write_bytes(out)
    if a.report:
        a.report.parent.mkdir(parents=True, exist_ok=True)
        a.report.write_text(json.dumps(report, indent=2) + "\n")
    print(("Checked " if a.check else "Built ") + str(a.out) + " " + report["output_sha256"][:16]
          + f" ({scripts} scripts, {checked} node-checked)")


if __name__ == "__main__":
    main()
