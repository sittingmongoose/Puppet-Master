#!/usr/bin/env python3
"""Independent correctness check of one session's deliverable.

usage: oracle.py <session dir> <task 1..4> <given variant> [--runs 2]

Runs the agent's checks/task.check.mjs, unchanged, on the page without the defect (v0) and on the page with the task's
defect (v<task>), `--runs` times each. A correct check passes on the first and fails on the second, every time.
Writes <session>/oracle.json, which also holds the final receipt: application build identity as read from the loaded
page, kept apart from test identity (hashes of the check, the config, the kit files, and the tool version).
"""
import hashlib, json, os, re, subprocess, sys, time
HERE = os.path.dirname(os.path.abspath(__file__))
sha = lambda p: hashlib.sha256(open(p, "rb").read()).hexdigest()

def run(session, page, tag):
    receipt = os.path.join(session, f"oracle-{tag}.receipt.json")
    t0 = time.time()
    try:
        p = subprocess.run(["browser-check", "run", "checks/task.check.mjs", "--set", f"page={page}", "--set", f"receipt={receipt}", "--out", os.path.join(session, f"oracle-run-{tag}")],
                           cwd=session, capture_output=True, text=True, timeout=900)
        code, out = p.returncode, p.stdout + p.stderr
    except subprocess.TimeoutExpired:
        code, out = "timeout", ""
    head = next((l for l in out.splitlines() if l.startswith("browser-check ")), "")
    fails = [l[:200] for l in out.splitlines() if l.startswith("FAIL")][:4]
    rec = json.load(open(receipt)) if os.path.exists(receipt) else None
    return {"page": os.path.basename(page), "exit": code, "seconds": round(time.time() - t0, 1), "summary": head, "fails": fails,
            "app": None if not rec else {"expected_build_id": rec["app"]["expected_build_id"], "loads": len(rec["app"]["loads"]), "all_loads_matched": rec["fresh"], "loaded_build_ids": sorted({str(l["loaded_build_id"]) for l in rec["app"]["loads"]})}}

def main():
    session, task, given = os.path.abspath(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3])
    runs = int(sys.argv[sys.argv.index("--runs") + 1]) if "--runs" in sys.argv else 2
    check = os.path.join(session, "checks", "task.check.mjs")
    out = {"session": os.path.basename(session), "task": task, "given_page_has_defect": given != 0, "check_exists": os.path.exists(check)}
    if not out["check_exists"]:
        out["class"] = "no_deliverable"
    else:
        src = open(check, encoding="utf-8", errors="replace").read()
        out["static"] = {"lines": src.count("\n") + 1, "uses_app_open": "t.app.open" in src, "uses_goto": bool(re.search(r"\bt\.goto\(|page\.goto\(", src)),
                         "synthetic_click": bool(re.search(r"\.click\(\)\s*[;)]?\s*\}?\s*\)", src) and "evaluate" in src and re.search(r"evaluate\([^)]*=>[^)]*\.click\(\)", src)), "dispatchEvent": "dispatchEvent" in src,
                         "fixed_sleeps": len(re.findall(r"waitForTimeout\(", src)), "uses_ids": "data-ui-element-id" in src or "t.app.byId" in src, "reads_page_source": bool(re.search(r"readFile(Sync)?\([^)]*page\.(html|json)", src))}
        good = [run(session, os.path.join(HERE, "fixtures", "v0.html"), f"good{i}") for i in range(runs)]
        bad = [run(session, os.path.join(HERE, "fixtures", f"v{task}.html"), f"bad{i}") for i in range(runs)]
        out["good_runs"], out["bad_runs"] = good, bad
        g, b = [r["exit"] for r in good], [r["exit"] for r in bad]
        if any(x in ("timeout", 2, 130) for x in g + b): cls = "timeout_or_harness_error"
        elif len(set(g)) > 1 or len(set(b)) > 1: cls = "flaky"
        elif g[0] == 0 and b[0] == 1: cls = "correct"
        elif b[0] == 0 and g[0] == 0: cls = "false_pass"
        elif g[0] == 1 and b[0] == 1: cls = "false_fail"
        else: cls = "inverted"
        out["class"] = cls
        out["all_loads_matched_expected_build"] = all(r["app"] and r["app"]["all_loads_matched"] for r in good + bad)
        tool = subprocess.run(["browser-check", "--version"], capture_output=True, text=True).stdout.strip()
        out["test_identity"] = {"check_sha256": sha(check), "config_sha256": sha(os.path.join(session, "browser-check.config.mjs")),
                                "kit_sha256": {f: sha(os.path.join(session, "kit", f)) for f in sorted(os.listdir(os.path.join(session, "kit")))}, "tool": tool}
    json.dump(out, open(os.path.join(session, "oracle.json"), "w"), indent=1)
    print(json.dumps({k: out.get(k) for k in ("session", "class", "check_exists", "all_loads_matched_expected_build")}), [(r["exit"], r["seconds"]) for r in out.get("good_runs", []) + out.get("bad_runs", [])])

if __name__ == "__main__":
    main()
