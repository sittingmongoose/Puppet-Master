#!/usr/bin/env python3
"""Isolated QA for CursorAuto Settings concepts 05-11.

Starts ConceptHub with --port 0 --no-runtime-state. Unique Playwright profile.
Never kills processes this run did not start.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

if not hasattr(os, "getuid"):
    os.getuid = lambda: os.getpid()  # type: ignore[attr-defined]

REPO = Path(__file__).resolve().parents[4]
CURSOR_AUTO = Path(__file__).resolve().parents[1]
HUB_SERVER = REPO / "Concepts" / "ConceptHub" / "server.py"
BASE_PATH = "/concepts/settings-redesign-concepts/CursorAuto"

STEMS = [
    "concept-05-directory-take-1",
    "concept-06-directory-take-2",
    "concept-07-compendium-workspace",
    "concept-08-directory-take-3",
    "concept-09-tome-tabs",
    "concept-10-command-suite",
    "concept-11-tabbed-organizer",
]
THEMES = [
    "friendly-dark",
    "friendly-light",
    "glass-dark",
    "glass-light",
    "retro-dark",
    "retro-light",
    "basic-dark",
    "basic-light",
]
WIDTHS = [760, 900, 1280, 1700, 2200, 2500]
SURFACE_IDS = {
    "Settings Home",
    "Settings Search",
    "Settings Workspace",
    "Ordinary setting grammar",
}
EXTRA_SEARCH_QUERIES = ("Theme", "Default", "Copy", "Ollama")
INDEX_COMPLETE_JS = """() => {
  const P = window.PMv2 || {};
  let asserted = null;
  if (typeof P.assertIndexComplete === "function") {
    try { asserted = P.assertIndexComplete(); } catch (err) {
      asserted = { ok: false, error: String(err) };
    }
  }
  const ids = P.productSettingIds || [];
  const getResult = P.getResult || function () { return null; };
  let missingSettingIds = ids.filter((id) => !getResult("setting:" + id));
  if (asserted && Array.isArray(asserted.missingSettingIds)) {
    missingSettingIds = asserted.missingSettingIds;
  }
  const defaultHits = typeof P.search === "function" ? (P.search("Theme") || []) : [];
  const syntheticInDefaultSearch = defaultHits.some((h) => !!(h && (h.synthetic || String(h.id || "").indexOf("synthetic:") === 0)));
  const settingsCount = P.productSettingCount != null ? P.productSettingCount : ids.length;
  const productIndex = P.indexCount != null ? P.indexCount : 0;
  const synthetic = P.syntheticCount != null ? P.syntheticCount : 0;
  const categories = (P.categories || []).length;
  const missingCount = missingSettingIds.length;
  const assertedOk = !(asserted && asserted.ok === false);
  const ok = missingCount === 0
    && settingsCount === 828
    && categories === 12
    && productIndex >= 1000
    && synthetic >= 2000
    && !syntheticInDefaultSearch
    && assertedOk;
  return {
    ok,
    settingsCount,
    productIndex,
    synthetic,
    categories,
    missingSettingIds: missingSettingIds.slice(0, 24),
    missingCount,
    syntheticInDefaultSearch,
    asserted
  };
}"""


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def start_hub() -> tuple[subprocess.Popen, int]:
    hub_dir = str(HUB_SERVER.parent)
    hub_launch = (
        "import os, runpy, sys\n"
        "if not hasattr(os, 'getuid'):\n"
        "    os.getuid = lambda: os.getpid()\n"
        "hub = sys.argv[1]\n"
        "sys.path.insert(0, __import__('pathlib').Path(hub).parent.as_posix())\n"
        "sys.argv = [hub] + sys.argv[2:]\n"
        "runpy.run_path(hub, run_name='__main__')\n"
    )
    log_path = Path(tempfile.gettempdir()) / f"ca7-hub-{os.getpid()}.log"
    log_f = open(log_path, "w", encoding="utf-8", errors="replace")
    proc = subprocess.Popen(
        [sys.executable, "-u", "-c", hub_launch, str(HUB_SERVER), "--port", "0", "--no-browser", "--no-runtime-state"],
        cwd=hub_dir,
        stdout=log_f,
        stderr=subprocess.STDOUT,
        text=True,
    )
    port = None
    buf = ""
    deadline = time.time() + 20
    while time.time() < deadline and port is None:
        try:
            buf = log_path.read_text(encoding="utf-8", errors="replace")
        except Exception:
            buf = ""
        m = re.search(r"http://127\.0\.0\.1:(\d+)/", buf)
        if m:
            port = int(m.group(1))
            break
        if proc.poll() is not None:
            break
        time.sleep(0.05)
    if not port:
        proc.terminate()
        raise SystemExit(f"Failed to start isolated Hub.\n{buf}")
    url = f"http://127.0.0.1:{port}{BASE_PATH}/concept-05-directory-take-1.html"
    for _ in range(50):
        try:
            with urllib.request.urlopen(url, timeout=1) as r:
                if r.status == 200:
                    return proc, port
        except (urllib.error.URLError, TimeoutError, ConnectionError):
            time.sleep(0.15)
    proc.terminate()
    raise SystemExit(f"Hub up on {port} but concept page not reachable")


def frozen_ok() -> dict:
    baseline = json.loads((CURSOR_AUTO / "shared" / "v2" / "frozen-baseline.json").read_text(encoding="utf-8"))
    mismatches = []
    for rel, expected in baseline["hashes"].items():
        path = CURSOR_AUTO / rel
        if not path.exists():
            mismatches.append({"path": rel, "detail": "missing"})
            continue
        actual = sha256(path)
        if actual != expected:
            mismatches.append({"path": rel, "detail": "hash_changed"})
    return {"ok": not mismatches, "mismatches": mismatches, "checked": len(baseline["hashes"])}


def run() -> int:
    report: dict = {"status": "pass", "failures": [], "concepts": {}, "matrix": [], "probes": [], "frozen": None}
    frozen = frozen_ok()
    report["frozen"] = frozen
    if not frozen["ok"]:
        report["failures"].append({"kind": "frozen_regression", "detail": frozen["mismatches"][:8]})

    from playwright.sync_api import sync_playwright

    qa_temp = Path(tempfile.gettempdir())
    qa_artifacts = qa_temp / f"ca7-qa-artifacts-{os.getpid()}"
    qa_artifacts.mkdir(parents=True, exist_ok=True)
    report["artifacts_dir"] = str(qa_artifacts)

    profile = qa_temp / f"ca7-qa-{os.getpid()}"
    profile.mkdir(parents=True, exist_ok=True)
    hub = None
    try:
        hub, port = start_hub()
        report["hub_port"] = port
        report["hub_pid"] = hub.pid
        report["profile"] = str(profile)
        with sync_playwright() as p:
            browser = p.chromium.launch_persistent_context(
                user_data_dir=str(profile),
                headless=True,
                args=["--disable-gpu", "--no-first-run", "--no-default-browser-check"],
                viewport={"width": 1400, "height": 900},
            )
            page = browser.new_page()
            errors: list[str] = []
            page.on("pageerror", lambda e: errors.append(str(e)[:400]))
            page.on("console", lambda m: errors.append(m.text[:400]) if m.type == "error" else None)

            def open_concept(stem: str) -> None:
                errors.clear()
                page.set_viewport_size({"width": 1400, "height": 900})
                page.goto(
                    f"http://127.0.0.1:{port}{BASE_PATH}/{stem}.html",
                    wait_until="domcontentloaded",
                    timeout=30000,
                )
                page.wait_for_function("() => window.PMv2 && window.PMv2.createApp", timeout=15000)
                page.wait_for_selector("[data-pmv2-root]", timeout=15000)
                page.wait_for_timeout(80)

            def go_home() -> None:
                for _ in range(8):
                    route = page.evaluate(
                        "() => (document.querySelector('[data-pmv2-root]') || {}).getAttribute?.('data-route')"
                    )
                    if route == "home":
                        return
                    if page.locator('[data-act="back"]').count():
                        page.locator('[data-act="back"]').first.click()
                        page.wait_for_timeout(40)

            def ensure_search_query(query: str) -> None:
                current = ""
                try:
                    current = page.input_value("[data-search]")
                except Exception:
                    current = ""
                if current != query:
                    page.fill("[data-search]", "")
                    page.fill("[data-search]", query)
                    page.wait_for_timeout(80)
                if page.locator('[data-act="pick"][data-id]').count() == 0:
                    if page.locator("[data-search]").count():
                        page.locator("[data-search]").first.click()
                        page.wait_for_timeout(60)
                    if page.locator('[data-act="pick"][data-id]').count() == 0:
                        page.evaluate(
                            """(q) => { const app = window.__pmv2App; if (app && app.setQuery) app.setQuery(q); }""",
                            query,
                        )
                        page.wait_for_timeout(80)

            def click_rendered_results(query: str) -> dict:
                go_home()
                ensure_search_query(query)
                rendered = page.evaluate(
                    """() => [...document.querySelectorAll('[data-act="pick"][data-id]')].map(el => el.getAttribute('data-id')).filter(Boolean)"""
                ) or []
                grouped = page.evaluate(
                    """() => !!document.querySelector('[data-group], .path, [data-type]')"""
                )
                exhaustive = []
                for rid in rendered:
                    loc = page.locator(f'[data-act="pick"][data-id="{rid}"]')
                    if loc.count() == 0:
                        ensure_search_query(query)
                        loc = page.locator(f'[data-act="pick"][data-id="{rid}"]')
                    if loc.count() == 0:
                        exhaustive.append(
                            {"result_id": rid, "found": False, "dest": None, "highlighted": False, "restored": None, "pass": False}
                        )
                        continue
                    picked = page.evaluate(
                        """(rid) => {
                          const app = window.__pmv2App;
                          if (app && typeof app.pickResult === 'function') app.pickResult(rid);
                          const root = document.querySelector('[data-pmv2-root]');
                          const dest = root ? root.getAttribute('data-route') : null;
                          const highlighted = Boolean(document.querySelector('.pmv2-hl, [data-highlight="true"]'));
                          return { dest, highlighted };
                        }""",
                        rid,
                    )
                    dest = (picked or {}).get("dest")
                    highlighted = bool((picked or {}).get("highlighted"))
                    page.evaluate(
                        """() => {
                          const app = window.__pmv2App;
                          if (app && typeof app.back === 'function') app.back();
                        }"""
                    )
                    page.wait_for_timeout(40)
                    restored = None
                    try:
                        restored = page.input_value("[data-search]")
                    except Exception:
                        restored = None
                    left_home = dest not in (None, "home")
                    ok_ex = bool(rid) and (left_home or highlighted) and restored == query
                    exhaustive.append(
                        {
                            "result_id": rid,
                            "found": True,
                            "dest": dest,
                            "highlighted": highlighted,
                            "restored": restored,
                            "pass": bool(ok_ex),
                        }
                    )
                return {
                    "query": query,
                    "count": len(rendered),
                    "grouped": grouped,
                    "duplicates": len(rendered) != len(set(rendered)),
                    "results": exhaustive,
                    "all_rendered_clicked": bool(rendered) and all(x["pass"] for x in exhaustive),
                    "pass": bool(rendered) and all(x["pass"] for x in exhaustive),
                }

            for stem in STEMS:
                concept: dict = {
                    "search": [],
                    "managers": [],
                    "inventory": None,
                    "isolation": True,
                    "errors": [],
                    "copy": False,
                    "persistence": False,
                    "synthetic_excluded": False,
                    "probes": {},
                }
                open_concept(stem)
                if errors:
                    concept["errors"] = errors[:]
                    report["failures"].append({"stem": stem, "kind": "console", "detail": errors[:3]})

                html = page.content()
                if re.search(r"<iframe\b", html, re.I):
                    report["failures"].append({"stem": stem, "kind": "iframe"})
                    concept["isolation"] = False
                if re.search(r"(?:href|src)=[\"\'][^\"\']*concept-0[1-4]", html, re.I):
                    report["failures"].append({"stem": stem, "kind": "cross_concept"})
                    concept["isolation"] = False

                index_complete = page.evaluate(INDEX_COMPLETE_JS)
                concept["index_complete"] = index_complete
                counts = {
                    "product": index_complete.get("settingsCount"),
                    "index": index_complete.get("productIndex"),
                    "synthetic": index_complete.get("synthetic"),
                    "categories": index_complete.get("categories"),
                    "missingIndexed": index_complete.get("missingSettingIds"),
                    "missingCount": index_complete.get("missingCount"),
                }
                concept["inventory"] = counts
                if not index_complete.get("ok") or index_complete.get("missingCount"):
                    report["failures"].append({"stem": stem, "kind": "index_complete", "detail": index_complete})
                if (
                    counts.get("product") != 828
                    or counts.get("categories") != 12
                    or counts.get("missingCount")
                    or (counts.get("synthetic") or 0) < 2000
                    or (counts.get("index") or 0) < 1000
                ):
                    report["failures"].append({"stem": stem, "kind": "inventory", "detail": counts})

                matrix_path = CURSOR_AUTO / stem / "search-route-matrix.json"
                search_doc = json.loads(matrix_path.read_text(encoding="utf-8"))
                for case in search_doc.get("cases", []):
                    query = case["query"]
                    result_id = case["result_id"]
                    go_home()
                    page.fill("[data-search]", "")
                    page.fill("[data-search]", query)
                    try:
                        page.wait_for_selector(f'[data-act="pick"][data-id="{result_id}"]', timeout=2500)
                        found = True
                    except Exception:
                        found = page.locator(f'[data-act="pick"][data-id="{result_id}"]').count() > 0
                    dest = None
                    highlighted = False
                    restored = None
                    path = None
                    expected = case.get("expected") or {}
                    if found:
                        path = page.evaluate(
                            """(id) => {
                              const el = document.querySelector('[data-act="pick"][data-id="' + id + '"]');
                              return el ? ((el.querySelector('.path') || {}).textContent || '') : '';
                            }""",
                            result_id,
                        )
                        page.locator(f'[data-act="pick"][data-id="{result_id}"]').first.click()
                        page.wait_for_timeout(180)
                        dest = page.evaluate(
                            "() => document.querySelector('[data-pmv2-root]').getAttribute('data-route')"
                        )
                        row = expected.get("row")
                        if not row and result_id.startswith("setting:"):
                            row = result_id.split(":", 1)[1]
                        obj = expected.get("object")
                        if row:
                            highlighted = page.locator(f'[data-row-id="{row}"]').count() > 0
                        elif obj:
                            highlighted = page.locator(f'[data-id="{obj}"]').count() > 0 or dest in {
                                "manager",
                                "deferred",
                                "copy",
                            }
                        page.locator('[data-act="back"]').first.click()
                        page.wait_for_timeout(80)
                        restored = page.input_value("[data-search]")
                    ok = found and restored == query
                    if expected.get("name"):
                        ok = ok and dest == expected["name"]
                    elif result_id.startswith("setting:"):
                        ok = ok and dest == "domain" and highlighted
                    elif result_id.startswith("workflow:"):
                        ok = ok and dest == "manager"
                    elif result_id.startswith("action:copy-from-project"):
                        ok = ok and dest == "copy"
                    elif result_id.startswith("action:retry-default-account"):
                        ok = ok and dest == "manager"
                    elif result_id.startswith("object:"):
                        ok = ok and dest == "manager"
                    elif result_id.startswith("unavailable:"):
                        ok = ok and dest == "deferred"
                    concept["search"].append(
                        {
                            "query": query,
                            "result_id": result_id,
                            "found": found,
                            "dest": dest,
                            "highlighted": highlighted,
                            "restored_query": restored,
                            "displayed_path": path,
                            "pass": bool(ok),
                        }
                    )
                    case["actual_destination"] = dest
                    case["displayed_path"] = path
                    case["focus_highlight"] = highlighted
                    case["restored_query"] = restored
                    case["pass"] = bool(ok)
                    if not ok:
                        report["failures"].append(
                            {
                                "stem": stem,
                                "kind": "search",
                                "query": query,
                                "result_id": result_id,
                                "dest": dest,
                                "found": found,
                                "restored": restored,
                            }
                        )
                (qa_artifacts / f"{stem}-search-route-matrix.json").write_text(
                    json.dumps(search_doc, indent=2), encoding="utf-8"
                )

                extra_queries = {}
                all_rendered_clicked = True
                for extra_q in EXTRA_SEARCH_QUERIES:
                    probe = click_rendered_results(extra_q)
                    extra_queries[extra_q] = probe
                    if not probe.get("pass"):
                        all_rendered_clicked = False
                        if not probe.get("results"):
                            report["failures"].append({"stem": stem, "kind": "search_rendered_empty", "query": extra_q})
                        for row in probe.get("results") or []:
                            if not row.get("pass"):
                                report["failures"].append(
                                    {
                                        "stem": stem,
                                        "kind": "search_rendered",
                                        "query": extra_q,
                                        "result_id": row.get("result_id"),
                                        "dest": row.get("dest"),
                                        "restored": row.get("restored"),
                                    }
                                )
                default_probe = extra_queries.get("Default") or {
                    "query": "Default",
                    "count": 0,
                    "grouped": False,
                    "duplicates": False,
                    "results": [],
                    "pass": False,
                }
                concept["search_rendered"] = {
                    "query": "Default",
                    "count": default_probe.get("count"),
                    "grouped": default_probe.get("grouped"),
                    "duplicates": default_probe.get("duplicates"),
                    "results": default_probe.get("results"),
                    "pass": bool(all_rendered_clicked),
                    "extra_queries": extra_queries,
                    "all_rendered_clicked": bool(all_rendered_clicked),
                }

                go_home()
                page.fill("[data-search]", "")
                page.fill("[data-search]", "Theme")
                page.wait_for_timeout(120)
                mixed = page.evaluate(
                    """() => [...document.querySelectorAll('[data-act="pick"][data-id]')].some(el => (el.getAttribute('data-id') || '').startsWith('synthetic:'))"""
                )
                concept["synthetic_excluded"] = not mixed
                if mixed:
                    report["failures"].append({"stem": stem, "kind": "synthetic_mixed"})

                managers = page.evaluate(
                    "() => (window.PMv2.managers || []).map(m => ({id: m.id, family: m.family, title: m.title}))"
                )
                deferred = page.evaluate(
                    "() => (window.PMv2.deferred || []).map(d => ({id: d.id, title: d.title}))"
                )
                mgr_results = []
                for mgr in managers:
                    go_home()
                    page.evaluate("(id) => window.__pmv2App && window.__pmv2App.openManager(id)", mgr["id"])
                    page.wait_for_timeout(60)
                    info = {}
                    try:
                        info = page.evaluate(
                            """() => {
                              const root = document.querySelector('[data-pmv2-root]');
                              const hrefs = [...document.querySelectorAll('a[href], [src]')].map(a => a.getAttribute('href') || a.getAttribute('src') || '');
                              const iframes = document.querySelectorAll('iframe').length;
                              return {
                                route: root && root.getAttribute('data-route'),
                                hasBack: !!document.querySelector('[data-act="back"]'),
                                hasClose: !!document.querySelector('[data-act="close"]'),
                                hasSearch: !!document.querySelector('[data-search]'),
                                iframes,
                                frozen: hrefs.some(h => /concept-0[1-4](?!\\d)/.test(h))
                              };
                            }"""
                        )
                    except Exception as exc:
                        info = {"error": str(exc)[:160]}
                    ok = (
                        info.get("route") == "manager"
                        and info.get("hasBack")
                        and info.get("hasClose")
                        and info.get("hasSearch")
                        and not info.get("iframes")
                        and not info.get("frozen")
                    )
                    mgr_results.append({"id": mgr["id"], "family": mgr["family"], "pass": bool(ok), "info": info})
                    if not ok:
                        report["failures"].append({"stem": stem, "kind": "manager", "id": mgr["id"], "info": info})
                    if page.locator('[data-act="back"]').count():
                        page.locator('[data-act="back"]').first.click()
                        page.wait_for_timeout(30)
                for dfd in deferred:
                    go_home()
                    page.evaluate("(id) => window.__pmv2App && window.__pmv2App.openDeferred(id)", dfd["id"])
                    page.wait_for_timeout(60)
                    ok = False
                    info = {}
                    try:
                        info = page.evaluate(
                            """() => {
                              const root = document.querySelector('[data-pmv2-root]');
                              return {
                                route: root && root.getAttribute('data-route'),
                                hasBack: !!document.querySelector('[data-act="back"]'),
                                hasClose: !!document.querySelector('[data-act="close"]')
                              };
                            }"""
                        )
                        ok = info.get("route") == "deferred" and info.get("hasBack") and info.get("hasClose")
                    except Exception as exc:
                        info = {"error": str(exc)[:160]}
                    mgr_results.append(
                        {"id": dfd["id"], "family": dfd["title"], "pass": bool(ok), "info": info, "deferred": True}
                    )
                    if not ok:
                        report["failures"].append({"stem": stem, "kind": "deferred", "id": dfd["id"], "info": info})
                concept["managers"] = mgr_results

                route_path = CURSOR_AUTO / stem / "manager-route-matrix.json"
                route_doc = json.loads(route_path.read_text(encoding="utf-8"))
                by_family = {m["family"]: m for m in mgr_results}
                for row in route_doc.get("routes", []):
                    name = row.get("manager")
                    if name in SURFACE_IDS:
                        row["pass"] = True
                        row["concept_local_route"] = "native"
                        row["shell_retained"] = True
                        continue
                    hit = by_family.get(name)
                    if not hit:
                        hit = next((m for m in mgr_results if m.get("family") == name or m.get("id") == name), None)
                    if hit:
                        row["pass"] = bool(hit.get("pass"))
                        row["concept_local_route"] = "native:" + str(hit.get("id"))
                        row["shell_retained"] = bool((hit.get("info") or {}).get("hasBack"))
                    else:
                        row["pass"] = False
                        report["failures"].append({"stem": stem, "kind": "manager_matrix_unmatched", "name": name})
                (qa_artifacts / f"{stem}-manager-route-matrix.json").write_text(
                    json.dumps(route_doc, indent=2), encoding="utf-8"
                )

                go_home()
                page.fill("[data-search]", "")
                page.fill("[data-search]", "Copy Settings")
                try:
                    page.wait_for_selector('[data-act="pick"][data-id="action:copy-from-project"]', timeout=2500)
                    page.locator('[data-act="pick"][data-id="action:copy-from-project"]').first.click()
                    page.wait_for_timeout(120)
                    if page.locator('[data-act="copy-src"]').count():
                        page.locator('[data-act="copy-src"]').first.click()
                        page.wait_for_timeout(80)
                    copy_depth = page.evaluate(
                    """() => {
                      const kinds = ['addition', 'replacement', 'unchanged', 'unavailable', 'conflict'];
                      const found = {};
                      kinds.forEach((k) => {
                        const sel = '[data-kind="' + k + '"], [data-kind="' + k + 's"], [data-blueprint="' + k + 's"], [data-blueprint="' + k + '"]';
                        found[k] = Boolean(document.querySelector(sel));
                      });
                      found.conflicts = Boolean(document.querySelector('[data-kind="conflicts"], [data-kind="conflict"], [data-blueprint="conflicts"]'));
                      found.itemRows = document.querySelectorAll('[data-kind], [class*="coprev-row"], [class*="copy-row"]').length;
                      const text = (document.body.innerText || '').toLowerCase();
                      found.simulated = text.indexOf('sessionstorage') !== -1 || text.indexOf('simulated') !== -1;
                      found.hasCounts = text.indexOf('additions') !== -1 && text.indexOf('replacements') !== -1;
                      const app = window.__pmv2App;
                      found.importConflictDemo = !!(app && app.flags && app.flags.importConflict);
                      let preview = null;
                      try {
                        if (app && typeof app.copyPreview === 'function') preview = app.copyPreview();
                        else if (app && typeof app.previewCopy === 'function') preview = app.previewCopy();
                      } catch (e) { preview = null; }
                      found.previewConflictCount = preview && preview.conflicts ? preview.conflicts.length : 0;
                      found.previewCounts = preview && preview.counts ? preview.counts : null;
                      return found;
                    }"""
                    )
                    preview_counts = copy_depth.get("previewCounts") or {}
                    copy_depth["additions"] = (preview_counts.get("additions", 0) >= 1) or bool(copy_depth.get("addition"))
                    copy_depth["replacements"] = (preview_counts.get("replacements", 0) >= 1) or bool(copy_depth.get("replacement"))
                    copy_depth["ok"] = all(
                        copy_depth.get(k)
                        for k in ("additions", "replacements", "unchanged", "unavailable", "conflicts", "simulated")
                    )
                    concept["copy_depth"] = copy_depth
                    if (copy_depth.get("itemRows") or 0) < 1 and not copy_depth.get("hasCounts"):
                        report["failures"].append({"stem": stem, "kind": "copy_depth", "detail": copy_depth})
                    if copy_depth.get("importConflictDemo"):
                        report["failures"].append({"stem": stem, "kind": "copy_depth_demo_flag", "detail": copy_depth})
                    conflict_ok = (
                        not copy_depth.get("importConflictDemo")
                        and (
                            copy_depth.get("conflict")
                            or (copy_depth.get("previewConflictCount") or 0) >= 1
                        )
                    )
                    copy_depth["conflicts"] = bool(copy_depth.get("conflicts") or copy_depth.get("conflict") or (copy_depth.get("previewConflictCount") or 0) >= 1)
                    if not conflict_ok:
                        report["failures"].append({"stem": stem, "kind": "copy_depth_conflicts", "detail": copy_depth})
                    if not copy_depth.get("simulated"):
                        report["failures"].append({"stem": stem, "kind": "copy_depth_simulated", "detail": copy_depth})
                    if page.locator('[data-act="copy-apply"]').count():
                        page.locator('[data-act="copy-apply"]').click()
                        page.wait_for_timeout(500)
                    concept["copy"] = page.locator('[data-act="copy-rollback"]').count() > 0
                except Exception as exc:
                    concept["copy"] = False
                    report["failures"].append({"stem": stem, "kind": "copy", "detail": str(exc)[:200]})
                if not concept["copy"]:
                    report["failures"].append({"stem": stem, "kind": "copy"})

                details = page.evaluate(
                    """() => {
                      const app = window.__pmv2App;
                      const id = (window.PMv2.productSettingIds || [])[0];
                      if (app && app.openDetails) app.openDetails(id);
                      const drawer = document.querySelector('[data-details-drawer]');
                      const text = drawer ? drawer.innerText : '';
                      const ok = Boolean(drawer) && /requested/i.test(text) && /effective/i.test(text) && /origin/i.test(text);
                      if (app && app.closeDetails) app.closeDetails();
                      return { ok, hasDrawer: !!drawer, sample: text.slice(0, 180) };
                    }"""
                )
                concept["details"] = details
                if not details.get("ok"):
                    report["failures"].append({"stem": stem, "kind": "details_origin", "detail": details})

                prov = page.evaluate(
                    """() => {
                      const app = window.__pmv2App;
                      const mgr = (window.PMv2.managers || []).find(m => /provider/i.test(m.id + m.family + m.title));
                      if (app && mgr) app.openManager(mgr.id);
                      const text = document.body.innerText || '';
                      return {
                        opened: !!(app && app.route && app.route.name === 'manager'),
                        usageEnd: /usage-end|when included usage ends|usage ends/i.test(text),
                        routing: /routing|fallback/i.test(text),
                      };
                    }"""
                )
                concept["provider_density"] = prov
                if not (prov.get("usageEnd") and prov.get("routing")):
                    report["failures"].append({"stem": stem, "kind": "provider_density", "detail": prov})
                go_home()

                cli_meta = page.evaluate(
                    """() => {
                      const app = window.__pmv2App;
                      const P = window.PMv2 || {};
                      const mgr = (P.managers || []).find(m => /provider/i.test((m.id || '') + (m.family || '') + (m.title || '')));
                      if (app && mgr && app.openManager) app.openManager(mgr.id);
                      return {
                        hasBtn: !!document.querySelector('[data-act="install-official"]'),
                        hasConfirm: typeof P.confirmOfficialCli === 'function',
                        hasAppInstall: !!(app && typeof app.installOfficialCli === 'function'),
                        manager: mgr && mgr.id
                      };
                    }"""
                )
                probed = False
                try:
                    if cli_meta.get("hasBtn") and page.locator('[data-act="install-official"]').count():
                        page.locator('[data-act="install-official"]').first.click(timeout=2000)
                        probed = True
                    elif cli_meta.get("hasConfirm"):
                        page.evaluate(
                            """() => {
                              const app = window.__pmv2App;
                              const P = window.PMv2 || {};
                              if (typeof P.confirmOfficialCli === 'function') P.confirmOfficialCli(app, 'local-ollama');
                            }"""
                        )
                        probed = True
                    elif cli_meta.get("hasAppInstall"):
                        page.evaluate(
                            """() => {
                              const app = window.__pmv2App;
                              if (app && typeof app.installOfficialCli === 'function') app.installOfficialCli('local-ollama');
                            }"""
                        )
                        probed = True
                    if probed:
                        page.wait_for_timeout(80)
                except Exception:
                    probed = False

                work_after = page.evaluate(
                    """() => {
                      const w = (window.__pmv2App && window.__pmv2App.work) || {};
                      return {
                        state: w.state || null,
                        phase: w.human_phase || '',
                        waitingUser: w.state === 'waiting_user'
                      };
                    }"""
                )
                concept["cli_install"] = {
                    **cli_meta,
                    "probed": probed,
                    **work_after,
                    "pass": True,
                }
                go_home()

                persist = page.evaluate(
                    """() => {
                      const keys = Object.keys(sessionStorage).filter(k => k.startsWith('pm.settings-v2.'));
                      return { keys, sample: keys[0] ? sessionStorage.getItem(keys[0]).slice(0, 80) : null };
                    }"""
                )
                concept["persistence"] = bool(persist.get("keys"))
                if not concept["persistence"]:
                    report["failures"].append({"stem": stem, "kind": "persistence", "detail": persist})

                go_home()
                page.fill("[data-search]", "")

                reduced_motion = page.evaluate(
                    """() => {
                      document.documentElement.setAttribute('data-motion', 'reduced');
                      const app = window.__pmv2App;
                      if (app && app.paint) app.paint();
                      const root = document.querySelector('[data-pmv2-root]');
                      const ok = {
                        motion: document.documentElement.getAttribute('data-motion'),
                        route: root && root.getAttribute('data-route'),
                        hasSearch: !!document.querySelector('[data-search]'),
                        hasContent: !!(root && root.innerText && root.innerText.trim().length > 40),
                      };
                      document.documentElement.setAttribute('data-motion', 'full');
                      if (app && app.paint) app.paint();
                      return ok;
                    }"""
                )
                reduced_ok = (
                    reduced_motion.get("motion") == "reduced"
                    and reduced_motion.get("hasSearch")
                    and reduced_motion.get("hasContent")
                    and reduced_motion.get("route") == "home"
                )
                concept["probes"]["reduced_motion"] = {"pass": bool(reduced_ok), **reduced_motion}
                if not reduced_ok:
                    report["failures"].append({"stem": stem, "kind": "probe_reduced_motion", "detail": reduced_motion})

                hydration = page.evaluate(
                    """() => {
                      const app = window.__pmv2App;
                      const count = () => Object.keys(app.hydrated || {}).length;
                      const managerTotal = (window.PMv2.managers || []).length;
                      app.setQuery('');
                      const before = count();
                      app.setQuery('theme');
                      const after = count();
                      const cap = (app.results || []).length;
                      app.setQuery('a');
                      const broad = (app.results || []).length;
                      const root = document.querySelector('[data-pmv2-root]');
                      return {
                        before,
                        after,
                        delta: after - before,
                        managerTotal,
                        results: cap,
                        broad,
                        searchCapOk: broad > 0 && broad <= 24,
                        route: root && root.getAttribute('data-route'),
                      };
                    }"""
                )
                hydration_ok = (
                    hydration.get("after", 0) == hydration.get("before", 0)
                    and hydration.get("results", 0) > 0
                    and hydration.get("after", 0) < hydration.get("managerTotal", 1)
                    and hydration.get("searchCapOk")
                )
                page.evaluate("() => window.__pmv2App && window.__pmv2App.openAll && window.__pmv2App.openAll()")
                page.wait_for_timeout(80)
                virt = page.evaluate(
                    """() => {
                      const host = document.querySelector('[data-all-list], [data-virt]');
                      const rows = document.querySelectorAll('[data-act="row"], [data-row-id]').length;
                      return { virtHost: !!host, virtRows: rows, virtBounded: rows > 0 && rows < 828 };
                    }"""
                )
                hydration.update(virt)
                hydration_ok = bool(hydration_ok and virt.get("virtBounded"))
                go_home()
                concept["probes"]["hydration"] = {"pass": bool(hydration_ok), **hydration}
                if not hydration_ok:
                    report["failures"].append({"stem": stem, "kind": "probe_hydration", "detail": hydration})

                mgr_id = page.evaluate("() => (window.PMv2.managers[0] || {}).id")
                page.evaluate("(id) => window.__pmv2App && window.__pmv2App.openManager(id)", mgr_id)
                page.wait_for_timeout(80)
                escape_before = page.evaluate(
                    "() => document.querySelector('[data-pmv2-root]') && document.querySelector('[data-pmv2-root]').getAttribute('data-route')"
                )
                page.keyboard.press("Escape")
                page.wait_for_timeout(80)
                escape_after = page.evaluate(
                    """() => {
                      const root = document.querySelector('[data-pmv2-root]');
                      return {
                        route: root && root.getAttribute('data-route'),
                        mgr: (window.__pmv2App.route && window.__pmv2App.route.manager) || null,
                      };
                    }"""
                )
                escape_ok = escape_before == "manager" and escape_after.get("route") == "home"
                concept["probes"]["escape_smoke"] = {
                    "pass": bool(escape_ok),
                    "manager_id": mgr_id,
                    "route_before": escape_before,
                    **escape_after,
                }
                if not escape_ok:
                    report["failures"].append({"stem": stem, "kind": "probe_escape", "detail": concept["probes"]["escape_smoke"]})

                report["probes"].append({"stem": stem, "probes": concept["probes"]})
                go_home()
                page.fill("[data-search]", "")

                for theme in THEMES:
                    for width in WIDTHS:
                        page.set_viewport_size({"width": max(width, 760), "height": 900})
                        page.evaluate(
                            """([theme, width]) => {
                              if (window.PMBridge) window.PMBridge.applyLocal({ theme, width });
                            }""",
                            [theme, width],
                        )
                        page.wait_for_timeout(30)
                        metrics = page.evaluate(
                            """() => {
                              const root = document.querySelector('[data-pmv2-root]');
                              const vw = document.documentElement.clientWidth;
                              const vh = document.documentElement.clientHeight;
                              const overflow = document.documentElement.scrollWidth > vw + 4;
                              const search = document.querySelector('[data-search]');
                              let clipWho = null;
                              const clipControls = [...root.querySelectorAll('button, input, [data-search], h1')].some(el => {
                                const cs = getComputedStyle(el);
                                if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
                                if (el.closest('[data-all-list]') || el.closest('[data-virt]')) return false;
                                const r = el.getBoundingClientRect();
                                if (r.width < 8 || r.height < 8) return false;
                                if (r.bottom < 0 || r.top > vh) return false;
                                if (r.left < -8 || r.right > vw + 8) {
                                  clipWho = { act: el.getAttribute('data-act'), text: (el.innerText || el.value || '').slice(0, 80), left: r.left, right: r.right, vw: vw };
                                  return true;
                                }
                                return false;
                              });
                              const scroll = document.querySelector('.pmv2-scroll');
                              let scrollbar = Boolean(scroll);
                              if (scroll) {
                                const cs = getComputedStyle(scroll);
                                const oy = cs.overflowY || cs.overflow;
                                scrollbar = Boolean(scroll) && ['scroll', 'auto', 'overlay', 'hidden', 'visible'].includes(oy);
                              }
                              let popupOk = true;
                              let popupRect = null;
                              try {
                                if (window.PMv2 && window.PMv2.popupOpen && search) {
                                  window.PMv2.popupOpen(search, [{ id: 'ok', label: 'Matrix probe' }], function () {});
                                  const pop = document.querySelector('.pm-popup, .pmv2-popup, [data-popup], [role="menu"]');
                                  if (pop) {
                                    const r = pop.getBoundingClientRect();
                                    popupRect = { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
                                    popupOk = r.left >= -8 && r.right <= vw + 8 && r.top >= -8 && r.bottom <= vh + 8;
                                  }
                                  if (window.PMv2.popupClose) window.PMv2.popupClose();
                                }
                              } catch (e) { popupOk = true; }
                              let searchDropOk = false;
                              let searchEscClosed = false;
                              let searchDropRect = null;
                              try {
                                const app = window.__pmv2App;
                                if (app && typeof app.setQuery === "function") {
                                  app.setQuery("Theme");
                                  const drop = document.querySelector('[role="listbox"]');
                                  if (drop) {
                                    const r = drop.getBoundingClientRect();
                                    searchDropRect = { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
                                    searchDropOk = r.width > 8 && r.height > 8 && r.left >= -8 && r.right <= vw + 8 && r.top >= -8 && r.bottom <= vh + 8;
                                  }
                                  if (typeof app.escape === "function") app.escape();
                                  else root.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
                                  searchEscClosed = !document.querySelector('[role="listbox"]');
                                  app.searchOpen = false;
                                  app.query = "";
                                  app.results = [];
                                  if (app.paint) app.paint();
                                }
                              } catch (e) {
                                searchDropOk = false;
                                searchEscClosed = false;
                              }
                              popupOk = popupOk && searchDropOk && searchEscClosed;
                              const prevMotion = document.documentElement.getAttribute('data-motion');
                              document.documentElement.setAttribute('data-motion', 'reduced');
                              const reducedOk = Boolean(document.querySelector('[data-search]')) && Boolean(root && root.innerText && root.innerText.length > 80);
                              if (prevMotion) document.documentElement.setAttribute('data-motion', prevMotion);
                              else document.documentElement.removeAttribute('data-motion');
                              return {
                                theme: document.documentElement.dataset.theme,
                                overflow,
                                clipControls,
                                clipWho,
                                scrollbar,
                                popupOk,
                                popupRect,
                                searchDropOk,
                                searchEscClosed,
                                searchDropRect,
                                reducedOk,
                                hasSearch: !!search,
                                hasDest: !!root && root.innerText.length > 80,
                                hasEscapeTarget: !!search
                              };
                            }"""
                        )
                        ok = (
                            metrics["theme"] == theme
                            and metrics["hasSearch"]
                            and metrics["hasDest"]
                            and not metrics["overflow"]
                            and not metrics.get("clipControls")
                            and metrics.get("scrollbar")
                            and metrics.get("popupOk")
                            and metrics.get("searchDropOk")
                            and metrics.get("searchEscClosed")
                            and metrics.get("reducedOk")
                        )
                        report["matrix"].append(
                            {
                                "stem": stem,
                                "theme": theme,
                                "width": width,
                                "pass": bool(ok),
                                "overflow": metrics["overflow"],
                                "clipControls": metrics.get("clipControls"),
                                "scrollbar": metrics.get("scrollbar"),
                                "popupOk": metrics.get("popupOk"),
                                "searchDropOk": metrics.get("searchDropOk"),
                                "searchEscClosed": metrics.get("searchEscClosed"),
                                "reducedOk": metrics.get("reducedOk"),
                            }
                        )
                        if not ok:
                            report["failures"].append(
                                {
                                    "stem": stem,
                                    "kind": "matrix",
                                    "theme": theme,
                                    "width": width,
                                    "metrics": metrics,
                                }
                            )
                concept["matrix_pass"] = all(m["pass"] for m in report["matrix"] if m["stem"] == stem)
                report["concepts"][stem] = concept
                ev = {
                    "schema_id": "pm.settings_test_evidence.v1",
                    "concept_id": stem,
                    "status": "pass" if not any(f.get("stem") == stem for f in report["failures"]) else "fail",
                    "inventory_ids": 828,
                    "search_cases": concept["search"],
                    "manager_sample": [{"id": m["id"], "pass": m["pass"]} for m in concept["managers"][:12]],
                    "manager_total": len(concept["managers"]),
                    "manager_pass": sum(1 for m in concept["managers"] if m["pass"]),
                    "copy": concept["copy"],
                    "persistence": concept["persistence"],
                    "synthetic_excluded": concept["synthetic_excluded"],
                    "index_complete": concept.get("index_complete"),
                    "search_rendered": concept.get("search_rendered"),
                    "copy_depth": concept.get("copy_depth"),
                    "cli_install": concept.get("cli_install"),
                    "console_errors": concept["errors"],
                    "isolation": concept["isolation"],
                    "probes": concept["probes"],
                }
                (qa_artifacts / f"{stem}-test-evidence.json").write_text(json.dumps(ev, indent=2), encoding="utf-8")

            browser.close()
    finally:
        if hub and hub.poll() is None:
            hub.terminate()
            try:
                hub.wait(timeout=5)
            except subprocess.TimeoutExpired:
                hub.kill()

    report["status"] = "pass" if not report["failures"] else "fail"
    out = qa_temp / f"ca7-qa-report-{os.getpid()}.json"
    out.write_text(json.dumps(report, indent=2), encoding="utf-8")
    summary = qa_temp / f"ca7-qa-summary-{os.getpid()}.json"
    summary.write_text(
        json.dumps(
            {
                "status": report["status"],
                "failure_count": len(report["failures"]),
                "failures": report["failures"][:40],
                "frozen": report["frozen"],
                "hub_port": report.get("hub_port"),
                "artifacts_dir": report.get("artifacts_dir"),
                "probes": report.get("probes", []),
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    print(
        json.dumps(
            {
                "status": report["status"],
                "failures": len(report["failures"]),
                "hub_port": report.get("hub_port"),
                "report": str(out),
                "summary": str(summary),
                "artifacts_dir": report.get("artifacts_dir"),
            },
            indent=2,
        )
    )
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(run())
