#!/usr/bin/env python3
"""Verify every canonical inventory setting route in concepts 05-11.

This is an exhaustive renderer check, not only an index-presence check. For each
of the 828 product setting IDs in each concept, the canonical immutable result
is resolved, its destination is rendered with reduced motion, and the exact
`data-row-id` must be present in the concept-local DOM.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path

MODEL = Path(__file__).resolve().parents[1]
REPO = MODEL.parents[2]
HUB = REPO / "Concepts" / "ConceptHub" / "server.py"
BASE = "/concepts/settings-redesign-concepts/5.6%20Sol"
STEMS = [
    "concept-05-directory-take-1",
    "concept-06-directory-take-2",
    "concept-07-compendium-workspace",
    "concept-08-directory-take-3",
    "concept-09-tome-tabs",
    "concept-10-command-suite",
    "concept-11-tabbed-organizer",
]


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def start_hub() -> tuple[subprocess.Popen[str], int, Path]:
    log = Path(tempfile.gettempdir()) / f"pm-all-routes-hub-{os.getpid()}.log"
    out = log.open("w", encoding="utf-8")
    proc = subprocess.Popen(
        [sys.executable, "-u", str(HUB), "--port", "0", "--no-browser", "--no-runtime-state"],
        cwd=str(HUB.parent),
        stdout=out,
        stderr=subprocess.STDOUT,
        text=True,
    )
    deadline = time.time() + 20
    while time.time() < deadline:
        text = log.read_text(encoding="utf-8", errors="replace") if log.exists() else ""
        match = re.search(r"http://127\.0\.0\.1:(\d+)/", text)
        if match:
            return proc, int(match.group(1)), log
        if proc.poll() is not None:
            raise RuntimeError(f"ConceptHub exited before listening:\n{text}")
        time.sleep(0.05)
    proc.terminate()
    raise RuntimeError("ConceptHub did not report a port within 20 seconds")


def main() -> int:
    from playwright.sync_api import sync_playwright

    report: dict = {
        "schema_id": "pm.settings_all_inventory_route_audit.v1",
        "started_at": utc_now(),
        "model_folder": "Concepts/settings-redesign-concepts/5.6 Sol",
        "inventory_expected": 828,
        "concepts": {},
    }
    hub = None
    profile = Path(tempfile.mkdtemp(prefix="pm-all-routes-profile-"))
    try:
        hub, port, hub_log = start_hub()
        report["hub"] = {"os_assigned_port": True, "port": port}
        with sync_playwright() as p:
            context = p.chromium.launch_persistent_context(
                user_data_dir=str(profile),
                headless=True,
                executable_path=os.environ.get("PM_SETTINGS_CHROMIUM_BINARY", "/usr/bin/chromium"),
                args=["--no-sandbox", "--disable-gpu", "--no-first-run", "--no-default-browser-check"],
                viewport={"width": 1280, "height": 900},
            )
            page = context.pages[0] if context.pages else context.new_page()
            page.set_default_timeout(120_000)
            for stem in STEMS:
                errors: list[str] = []
                page_errors: list[str] = []
                console_errors: list[str] = []
                page.on("pageerror", lambda exc, sink=page_errors: sink.append(str(exc)[:500]))
                page.on("console", lambda msg, sink=console_errors: sink.append(msg.text[:500]) if msg.type == "error" else None)
                page.goto(f"http://127.0.0.1:{port}{BASE}/{stem}.html", wait_until="domcontentloaded")
                page.wait_for_selector("[data-pmv2-root]")
                page.evaluate("document.documentElement.setAttribute('data-motion','reduced')")
                result = page.evaluate(
                    """() => {
                      const app = window.__pmv2App;
                      const P = window.PMv2 || {};
                      const ids = (P.productSettingIds || app.allProductIds || []).slice();
                      const missingResult = [];
                      const malformedDestination = [];
                      const notRendered = [];
                      const wrongRoute = [];
                      const originalTimeout = window.setTimeout;
                      const originalRaf = window.requestAnimationFrame;
                      // Suppress delayed locator callbacks while rendering 828 destinations.
                      window.setTimeout = function () { return 0; };
                      window.requestAnimationFrame = function (cb) { cb(performance.now()); return 0; };
                      try {
                        for (const id of ids) {
                          const resultId = 'setting:' + id;
                          const entry = app.getResult ? app.getResult(resultId) : (P.getResult ? P.getResult(resultId) : null);
                          if (!entry) { missingResult.push(id); continue; }
                          const dest = entry.dest || {};
                          if (dest.name !== 'domain' || dest.row !== id || !dest.domain || !dest.page) {
                            malformedDestination.push({id, dest});
                            continue;
                          }
                          app.route = Object.assign({}, dest, { row: id, highlight: id, fromSearch: resultId });
                          app.stack = [];
                          app.searchOpen = false;
                          app.query = '';
                          app.results = [];
                          app.paint();
                          const root = document.querySelector('[data-pmv2-root]');
                          if (!root || root.getAttribute('data-route') !== 'domain') {
                            wrongRoute.push({id, route: root && root.getAttribute('data-route')});
                          }
                          if (!document.querySelector('[data-row-id="' + CSS.escape(id) + '"]')) {
                            notRendered.push(id);
                          }
                        }
                      } finally {
                        window.setTimeout = originalTimeout;
                        window.requestAnimationFrame = originalRaf;
                      }
                      return {
                        inventoryCount: ids.length,
                        missingResult,
                        malformedDestination,
                        wrongRoute,
                        notRendered,
                        finalRoute: app.route,
                        crossConceptNodes: document.querySelectorAll('iframe, [href*="concept-0"], [src*="concept-0"]').length
                      };
                    }"""
                )
                passed = (
                    result["inventoryCount"] == 828
                    and not result["missingResult"]
                    and not result["malformedDestination"]
                    and not result["wrongRoute"]
                    and not result["notRendered"]
                    and not page_errors
                    and not console_errors
                )
                report["concepts"][stem] = {
                    "pass": passed,
                    "inventory_count": result["inventoryCount"],
                    "routes_rendered": result["inventoryCount"] - len(result["notRendered"]),
                    "missing_result_ids": result["missingResult"][:50],
                    "malformed_destinations": result["malformedDestination"][:20],
                    "wrong_routes": result["wrongRoute"][:20],
                    "not_rendered": result["notRendered"][:50],
                    "page_errors": page_errors,
                    "console_errors": console_errors,
                }
            context.close()
    finally:
        if hub and hub.poll() is None:
            hub.terminate()
            try:
                hub.wait(timeout=5)
            except subprocess.TimeoutExpired:
                hub.kill()
        import shutil
        shutil.rmtree(profile, ignore_errors=True)
        try:
            if 'hub_log' in locals(): hub_log.unlink(missing_ok=True)
        except Exception:
            pass

    report["completed_at"] = utc_now()
    passed = all(item["pass"] for item in report["concepts"].values())
    report["summary"] = {
        "concepts": len(STEMS),
        "concepts_pass": sum(1 for item in report["concepts"].values() if item["pass"]),
        "inventory_ids_per_concept": 828,
        "canonical_routes_rendered": sum(item["routes_rendered"] for item in report["concepts"].values()),
        "expected_canonical_routes": 828 * len(STEMS),
        "pass": passed,
    }
    out = MODEL / "_seven" / "ALL_INVENTORY_ROUTE_AUDIT.json"
    out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report["summary"], indent=2))
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
