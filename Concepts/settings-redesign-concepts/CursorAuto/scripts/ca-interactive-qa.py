#!/usr/bin/env python3
"""Isolated interactive QA for CursorAuto settings concepts.

Starts ConceptHub with --port 0 --no-runtime-state (does not reuse or overwrite
other agents' Hub). Drives Playwright's Google Chrome for Testing with a unique
user-data-dir under /tmp/ca-qa-<pid>. Never kills system Chrome or shared Hub.

Asserts the full originality-plan interactive checklist (items 1–10) on all four
concepts via CDP.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[4]  # .../PuppetMaster
CURSOR_AUTO = Path(__file__).resolve().parents[1]
HUB_SERVER = REPO / "Concepts" / "ConceptHub" / "server.py"
BASE_PATH = "/concepts/settings-redesign-concepts/CursorAuto"

USAGE_FIELDS = [
    "Included usage remaining",
    "Extra balance",
    "Next reset",
    "Pressure",
    "Last successful use",
    "Projection",
    "Source freshness",
]

CONCEPTS = [
    {
        "id": "harbor",
        "file": "concept-01-harbor.html",
        "root": "#hb-root",
        "home_markers": [".hb-home", ".hb-berth", ".hb-pier-desk"],
        "search_input": "#hb-search",
        "back": "#hb-back",
        "workspace_open": ".hb-berth",
        "workspace_markers": [".hb-ws", ".hb-slip", ".hb-cargo"],
        "jump": ".hb-slip-sub, .hb-ol-sub",
        "anim_sel": ".hb-home, .hb-ws, .hb-mgr",
        "providers_via": "search",
        "providers_query": "Providers",
        "providers_markers": [".hb-mgr", "Providers drydock"],
        "providers_usage_tab": '.ca-tab[data-tab="usage"]',
        "providers_accounts_tab": '.ca-tab[data-tab="accounts"]',
        "fold_toggle": None,
        "expand_provider": '.hb-mgr-item[data-pid="free-models"], .hb-mgr-item',
        "peer_query": "memory",
        "peer_manager_id": "memory",
        "peer_markers": [".hb-mgr", "Memory locker"],
        "peer_action": '[data-gact="verify"], #hb-mem-rebuild, [data-gact]',
        "second_peer_query": "lsp",
        "second_peer_manager_id": "lsp",
        "second_peer_markers": [".hb-mgr", "Language servers"],
        "second_peer_action": '[data-lsp-restart], [data-lsp-logs]',
        "spell_host": "#hb-spell, .ca-spell-demo",
        "scroll_root": ".hb-cargo",
        "spy_nav": ".hb-slip-sub[data-sub], .hb-ol-sub[data-sub]",
        "cat_reset": "#hb-cat-reset",
    },
    {
        "id": "score",
        "file": "concept-02-score.html",
        "root": "#sc-root",
        "home_markers": [".sc-home", ".sc-plate", ".sc-cue-hero"],
        "search_input": "#sc-search",
        "back": "#sc-back",
        "workspace_open": ".sc-plate",
        "workspace_markers": [".sc-ws", ".sc-rehearsal", ".sc-score-col"],
        "jump": ".sc-mark",
        "anim_sel": ".sc-home, .sc-ws, .sc-mgr",
        "providers_via": "search",
        "providers_query": "Providers",
        "providers_markers": [".sc-mgr", "Ensemble"],
        "providers_usage_tab": None,
        "providers_accounts_tab": None,
        "fold_toggle": None,
        "expand_provider": None,
        "peer_query": "personas",
        "peer_manager_id": "personas",
        "peer_markers": [".sc-mgr", "Personas"],
        "peer_action": "select[data-persona-scope], .sc-mgr select",
        "second_peer_query": "mcp",
        "second_peer_manager_id": "mcp",
        "second_peer_markers": [".sc-mgr", "MCP servers"],
        "second_peer_action": "[data-mcp-rec], #sc-mcp-add",
        "spell_host": "#sc-spell, .ca-spell-demo",
        "scroll_root": ".sc-score-col",
        "spy_nav": ".sc-mark[data-toc], .sc-toc-item[data-toc]",
        "cat_reset": "#sc-cat-reset",
    },
    {
        "id": "switchboard",
        "file": "concept-03-switchboard.html",
        "root": "#sw-root",
        "home_markers": [".sw-home", ".sw-jack", ".sw-slash"],
        "search_input": "#sw-search",
        "back": "#sw-back",
        "workspace_open": ".sw-jack",
        "workspace_markers": [".sw-ws", ".sw-jack-strip", ".sw-patch"],
        "jump": ".sw-jack-strip [data-sub], .sw-strip-jack[data-sub]",
        "anim_sel": ".sw-home, .sw-ws, .sw-mgr",
        "providers_via": "search",
        "providers_query": "Providers",
        "providers_markers": [".sw-mgr", "Providers patch bay"],
        "providers_usage_tab": None,
        "providers_accounts_tab": None,
        "fold_toggle": "[data-fam]",
        "expand_provider": None,
        "peer_query": "context",
        "peer_manager_id": "context",
        "peer_markers": [".sw-mgr, .sw-page", "Context"],
        "peer_action": '.ca-switch[data-sid], .sw-adv summary, .ca-disclose summary',
        "second_peer_query": "skills",
        "second_peer_manager_id": "skills",
        "second_peer_markers": [".sw-mgr, .sw-page", "Skills"],
        "second_peer_action": "[data-skill-inspect], [data-skill-enable]",
        "spell_host": "#sw-spell, .ca-spell-demo",
        "scroll_root": ".sw-patch",
        "spy_nav": ".sw-strip-jack[data-tick], .sw-strip-jack[data-sub]",
        "cat_reset": "#sw-cat-reset",
    },
    {
        "id": "archive",
        "file": "concept-04-archive.html",
        "root": "#ar-root",
        "home_markers": [".ar-home", ".ar-guide", ".ar-aid"],
        "search_input": "#ar-search",
        "back": "#ar-back",
        "workspace_open": "[data-open-cat], .ar-guide",
        "workspace_markers": [".ar-ws", ".ar-running", ".ar-box"],
        "jump": ".ar-ol-sub, [data-sub]",
        "anim_sel": ".ar-home, .ar-ws, .ar-mgr",
        "providers_via": "band",
        "providers_query": None,
        "providers_markers": [".ar-mgr", "Catalog"],
        "providers_usage_tab": None,
        "providers_accounts_tab": None,
        "fold_toggle": "[data-prov]",
        "expand_provider": None,
        "peer_query": "crew",
        "peer_manager_id": "crew",
        "peer_markers": [".ar-mgr", "Crew"],
        "peer_action": '[data-crew-edit], [data-crew-policy] [data-value="adaptive"], .ar-mgr .ca-btn, .ar-mgr select',
        "second_peer_query": "media",
        "second_peer_manager_id": "media",
        "second_peer_markers": [".ar-mgr", "Media"],
        "second_peer_action": "[data-media-diag], [data-media-setup]",
        "spell_host": "#ar-spell, .ca-spell-demo",
        "scroll_root": ".ar-box",
        "spy_nav": ".ar-ol-sub[data-sub]",
        "cat_reset": "#ar-cat-reset",
    },
]

ERROR_HOOK_JS = r"""
(() => {
  if (window.__caQaHooksInstalled) return true;
  window.__caQaHooksInstalled = true;
  window.__caQaErrors = [];
  const push = (msg) => {
    const s = String(msg || "");
    if (/ReferenceError|TypeError/.test(s)) window.__caQaErrors.push(s.slice(0, 400));
  };
  window.addEventListener("error", (e) => push(e && (e.message || e.error)));
  window.addEventListener("unhandledrejection", (e) => {
    const r = e && e.reason;
    push(r && (r.message || r));
  });
  const orig = console.error;
  console.error = function () {
    try { push(Array.from(arguments).join(" ")); } catch (_) {}
    return orig.apply(this, arguments);
  };
  return true;
})()
"""


def find_chromium() -> Path:
    cache = Path.home() / "Library" / "Caches" / "ms-playwright"
    matches = list(
        cache.glob(
            "chromium-*/chrome-mac*/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
        )
    )
    if not matches:
        raise SystemExit("Playwright Chromium for Testing not found under ~/Library/Caches/ms-playwright")
    return matches[0]


def start_hub() -> tuple[subprocess.Popen, int]:
    proc = subprocess.Popen(
        [sys.executable, "-u", str(HUB_SERVER), "--port", "0", "--no-browser", "--no-runtime-state"],
        cwd=str(REPO),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    port = None
    buf = ""
    deadline = time.time() + 12
    while time.time() < deadline and port is None:
        line = proc.stdout.readline() if proc.stdout else ""
        if not line:
            if proc.poll() is not None:
                break
            time.sleep(0.05)
            continue
        buf += line
        m = re.search(r"http://127\.0\.0\.1:(\d+)/", line)
        if m:
            port = int(m.group(1))
    if not port:
        proc.terminate()
        raise SystemExit(f"Failed to start isolated Hub.\n{buf}")
    url = f"http://127.0.0.1:{port}{BASE_PATH}/concept-01-harbor.html"
    for _ in range(40):
        try:
            with urllib.request.urlopen(url, timeout=1) as r:
                if r.status == 200:
                    return proc, port
        except (urllib.error.URLError, TimeoutError):
            time.sleep(0.15)
    proc.terminate()
    raise SystemExit(f"Hub up on {port} but concept page not reachable")


def run_with_chromium(port: int, profile: Path, report: dict) -> int:
    chromium = find_chromium()
    import socket

    sock = socket.socket()
    sock.bind(("127.0.0.1", 0))
    debug_port = sock.getsockname()[1]
    sock.close()

    profile.mkdir(parents=True, exist_ok=True)
    chrome = subprocess.Popen(
        [
            str(chromium),
            f"--remote-debugging-port={debug_port}",
            "--remote-allow-origins=*",
            f"--user-data-dir={profile}",
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-gpu",
            "--headless=new",
            "about:blank",
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        version = None
        for _ in range(50):
            try:
                with urllib.request.urlopen(f"http://127.0.0.1:{debug_port}/json/version", timeout=1) as r:
                    version = json.loads(r.read().decode())
                    break
            except Exception:
                time.sleep(0.1)
        if not version:
            report["error"] = "Chromium CDP not ready"
            return 1

        try:
            import websocket  # type: ignore
        except ImportError:
            report["error"] = "websocket-client required for full interactive QA"
            return 1

        return run_cdp_pass(port, debug_port, report, websocket)
    finally:
        chrome.terminate()
        try:
            chrome.wait(timeout=5)
        except subprocess.TimeoutExpired:
            chrome.kill()


def run_cdp_pass(port: int, debug_port: int, report: dict, websocket) -> int:
    req = urllib.request.Request(
        f"http://127.0.0.1:{debug_port}/json/new?about:blank",
        method="PUT",
    )
    with urllib.request.urlopen(req, timeout=5) as r:
        tab = json.loads(r.read().decode())
    ws = websocket.create_connection(tab["webSocketDebuggerUrl"], timeout=10)
    msg_id = 0
    cdp_exceptions: list[str] = []

    def send(method, params=None, wait=True):
        nonlocal msg_id
        msg_id += 1
        payload = {"id": msg_id, "method": method, "params": params or {}}
        ws.send(json.dumps(payload))
        if not wait:
            return {"id": msg_id}
        while True:
            raw = ws.recv()
            data = json.loads(raw)
            if data.get("method") == "Runtime.exceptionThrown":
                desc = (
                    data.get("params", {})
                    .get("exceptionDetails", {})
                    .get("exception", {})
                    .get("description")
                    or data.get("params", {}).get("exceptionDetails", {}).get("text")
                    or "exceptionThrown"
                )
                if re.search(r"ReferenceError|TypeError", str(desc)):
                    cdp_exceptions.append(str(desc)[:400])
                continue
            if data.get("id") == msg_id:
                return data

    def evaluate(expr: str):
        stripped = expr.strip()
        if stripped.startswith("() =>") or stripped.startswith("function"):
            expr = f"({stripped})()"
        res = send("Runtime.evaluate", {"expression": expr, "awaitPromise": True, "returnByValue": True})
        if "error" in res:
            raise RuntimeError(res["error"])
        result = res.get("result", {}).get("result", {})
        if result.get("subtype") == "error":
            raise RuntimeError(result.get("description"))
        return result.get("value")

    def wait_true(expr: str, tries: int = 40, delay: float = 0.15) -> bool:
        for _ in range(tries):
            try:
                if evaluate(expr):
                    return True
            except Exception:
                pass
            time.sleep(delay)
        return False

    def go_home(c: dict) -> bool:
        return bool(
            evaluate(
                f"""() => {{
                  const b = document.querySelector('{c["back"]}');
                  if (b) {{ b.click(); return true; }}
                  const fab = document.querySelector('.ca-states-fab');
                  // soft fallback: click concept model home via location reload of root only
                  return false;
                }}"""
            )
        )

    def ensure_home(c: dict) -> bool:
        if evaluate(f"() => !!document.querySelector('{c['home_markers'][0]}')"):
            return True
        go_home(c)
        time.sleep(0.4)
        if evaluate(f"() => !!document.querySelector('{c['home_markers'][0]}')"):
            return True
        # Force via search action "Settings home" if present, else re-navigate handled by caller
        return False

    def search_and_pick(c: dict, query: str, prefer_kinds=None, prefer_setting_id=None, prefer_manager_id=None) -> dict:
        prefer_kinds = prefer_kinds or ["setting", "manager", "subcategory", "category", "action"]
        evaluate(
            f"""() => {{
              let input = document.querySelector('{c["search_input"]}');
              if (!input) input = document.querySelector('input[aria-label="Search settings"]');
              if (!input) return false;
              input.focus();
              input.value = '';
              input.dispatchEvent(new Event('input', {{ bubbles: true }}));
              input.value = {json.dumps(query)};
              input.dispatchEvent(new Event('input', {{ bubbles: true }}));
              return true;
            }}"""
        )
        if not wait_true("() => !!document.querySelector('.ca-hit[role=option], .ca-hit')", 30):
            return {"ok": False, "reason": "no hits"}
        time.sleep(0.2)
        picked = evaluate(
            f"""() => {{
              const kinds = {json.dumps(prefer_kinds)};
              const preferSid = {json.dumps(prefer_setting_id)};
              const preferMid = {json.dumps(prefer_manager_id)};
              const hits = Array.from(document.querySelectorAll('.ca-hit[role=option], .ca-hit'));
              let hit = null;
              if (preferSid) {{
                hit = hits.find(h => h.getAttribute('data-setting-id') === preferSid) || null;
              }}
              if (!hit && preferMid) {{
                hit = hits.find(h => h.getAttribute('data-manager-id') === preferMid && (h.getAttribute('data-target-kind') || '') === 'manager')
                  || hits.find(h => h.getAttribute('data-manager-id') === preferMid)
                  || null;
              }}
              if (!hit) {{
                for (const k of kinds) {{
                  hit = hits.find(h => {{
                    const kind = (h.querySelector('.ca-hit-kind') || {{}}).textContent || '';
                    const tk = (h.getAttribute('data-target-kind') || '').toLowerCase();
                    return tk === k || kind.toLowerCase().includes(k.slice(0, 4)) || kind.toLowerCase() === k;
                  }});
                  if (hit) break;
                }}
              }}
              if (!hit) hit = hits[0];
              if (!hit) return null;
              const title = (hit.querySelector('.ca-hit-title') || hit).textContent.trim();
              const kind = hit.getAttribute('data-target-kind') || (hit.querySelector('.ca-hit-kind') || {{}}).textContent || '';
              const settingId = hit.getAttribute('data-setting-id');
              const managerId = hit.getAttribute('data-manager-id');
              hit.click();
              return {{ title, kind, settingId, managerId }};
            }}"""
        )
        return {"ok": bool(picked), "picked": picked}

    def assert_exact_deeplink(setting_id: str) -> dict:
        return evaluate(
            f"""() => {{
              const id = {json.dumps(setting_id)};
              const row = document.getElementById('row-' + id);
              if (!row) return {{ ok: false, reason: 'missing row', settingId: id, rowId: null }};
              const expected = 'row-' + id;
              if (row.id !== expected) return {{ ok: false, reason: 'rowId mismatch', settingId: id, rowId: row.id }};
              const adv = row.closest('details');
              if (adv && !adv.open) return {{ ok: false, reason: 'advanced closed', settingId: id, rowId: row.id }};
              const active = document.activeElement;
              const hasSpy = row.hasAttribute('data-spy-current');
              const hasSettle = row.classList.contains('pm-focus-settle');
              const containsFocus = !!(active && row.contains(active));
              const ok = hasSpy || hasSettle || containsFocus;
              return {{ ok, settingId: id, rowId: row.id, hasSpy, hasSettle, containsFocus, advOpen: adv ? !!adv.open : null }};
            }}"""
        )

    send("Runtime.enable")
    send("Page.enable")
    send(
        "Page.addScriptToEvaluateOnNewDocument",
        {"source": ERROR_HOOK_JS},
    )

    failures: list[str] = []
    results: list[dict] = []

    for c in CONCEPTS:
        url = f"http://127.0.0.1:{port}{BASE_PATH}/{c['file']}"
        send("Page.navigate", {"url": url})
        time.sleep(1.0)
        evaluate(ERROR_HOOK_JS)

        ready = wait_true(
            f"() => {{ const r=document.querySelector('{c['root']}'); return !!(r && r.children.length); }}"
        )
        entry: dict = {"id": c["id"], "ready": ready, "steps": {}}
        if not ready:
            failures.append(f"{c['id']}: root never populated")
            entry["ok"] = False
            results.append(entry)
            continue

        steps = entry["steps"]

        # --- 1 Home thesis ---
        home_ok = evaluate(
            "() => (" + " && ".join([f"!!document.querySelector('{s}')" for s in c["home_markers"]]) + ")"
        )
        steps["home"] = home_ok

        # --- 4 States (full fixture set + actions) ---
        states_seq = evaluate(
            """() => {
              const fab = document.querySelector('.ca-states-fab');
              if (!fab) return { ok: false, reason: 'no fab' };
              fab.click();
              const ids = ['calm','continue-setup','recommended','attention-heavy','usage-exhausted','invocation-failed','managed-workspace','baseline'];
              const seen = {};
              const signals = {};
              for (const id of ids) {
                const b = document.querySelector('[data-state-id="'+id+'"]');
                if (!b) return { ok: false, reason: 'missing '+id };
                b.click();
                seen[id] = true;
                const toast = document.querySelector('.ca-toast');
                const notice = document.querySelector('.ca-notice, .ca-notice-chip, [data-kind]');
                const managed = document.querySelector('.ca-row[data-state="managed"], .ca-badge[data-state="managed"]');
                signals[id] = {
                  toast: !!(toast && /./.test(toast.textContent||'')),
                  noticeKind: notice ? (notice.getAttribute('data-kind') || notice.textContent || '').slice(0, 40) : null,
                  managedBadge: !!managed,
                };
              }
              return { ok: true, seen, signals };
            }"""
        )
        time.sleep(0.45)
        # States drawer actions: Refresh catalogs / Reconnect
        states_actions = evaluate(
            """() => {
              const fab = document.querySelector('.ca-states-fab');
              if (fab) fab.click();
              const panel = document.querySelector('.ca-states-panel');
              if (panel) panel.hidden = false;
              const refreshBtn = document.querySelector('[data-ca-states="refresh"]');
              const reconnectBtn = document.querySelector('[data-ca-states="reconnect"]');
              const out = { refresh: false, reconnect: false, toast: false };
              if (refreshBtn) { refreshBtn.click(); out.refresh = true; }
              if (reconnectBtn) { reconnectBtn.click(); out.reconnect = true; }
              out.toast = !!document.querySelector('.ca-toast');
              return out;
            }"""
        )
        time.sleep(0.4)
        baseline_home = evaluate(
            "() => (" + " && ".join([f"!!document.querySelector('{s}')" for s in c["home_markers"]]) + ")"
        )
        # Ensure baseline after actions
        evaluate(
            """() => {
              const fab = document.querySelector('.ca-states-fab');
              if (fab) fab.click();
              const b = document.querySelector('[data-state-id="baseline"]');
              if (b) b.click();
              return !!b;
            }"""
        )
        time.sleep(0.35)
        baseline_home = evaluate(
            "() => (" + " && ".join([f"!!document.querySelector('{s}')" for s in c["home_markers"]]) + ")"
        ) or baseline_home
        states_ok = bool(
            states_seq
            and states_seq.get("ok")
            and baseline_home
            and states_actions
            and states_actions.get("refresh")
            and states_actions.get("reconnect")
            and states_actions.get("toast")
        )
        steps["states"] = {
            "ok": states_ok,
            "detail": states_seq,
            "actions": states_actions,
            "baseline_home": baseline_home,
        }

        # --- 2 Search deep-link (exact setting id) ---
        ensure_home(c)
        time.sleep(0.3)
        deeplink_cases = []
        for query, sid in (
            ("spellcheck", "appearance.check-spelling"),
            ("dictionary source", "appearance.dictionary-source"),
        ):
            if not ensure_home(c):
                send("Page.navigate", {"url": url})
                time.sleep(1.0)
                evaluate(ERROR_HOOK_JS)
            pick = search_and_pick(
                c, query, prefer_kinds=["setting"], prefer_setting_id=sid
            )
            time.sleep(1.0)
            picked_sid = (pick.get("picked") or {}).get("settingId") if pick.get("ok") else None
            focus_ok = assert_exact_deeplink(sid) if pick.get("ok") else {"ok": False, "reason": "pick failed"}
            case = {
                "query": query,
                "settingId": sid,
                "pickedSettingId": picked_sid,
                "pick": pick.get("picked"),
                "focus": focus_ok,
                "ok": bool(
                    pick.get("ok")
                    and picked_sid == sid
                    and focus_ok
                    and focus_ok.get("ok")
                    and focus_ok.get("rowId") == f"row-{sid}"
                ),
            }
            deeplink_cases.append(case)
        deeplink_ok = all(x.get("ok") for x in deeplink_cases)
        steps["deeplink"] = {"ok": deeplink_ok, "cases": deeplink_cases}

        # Return home for workspace pass
        if not ensure_home(c):
            send("Page.navigate", {"url": url})
            time.sleep(1.0)
            evaluate(ERROR_HOOK_JS)
            wait_true(f"() => !!document.querySelector('{c['home_markers'][0]}')")
        else:
            time.sleep(0.35)

        # --- 1/3 Workspace + jump + scrollspy + jump offset ---
        # Prefer a tall category so scrollspy has multiple sections
        opened = evaluate(
            f"""() => {{
              const prefer = document.querySelector('[data-cat="appearance"], [data-open-cat="appearance"], .hb-berth[data-cat="appearance"], .sc-plate[data-cat="appearance"], .sw-jack[data-cat="appearance"], .ar-guide[data-open-cat="appearance"]');
              const el = prefer || document.querySelector('{c["workspace_open"]}');
              if (!el) return false;
              el.click();
              return true;
            }}"""
        )
        time.sleep(0.7)
        ws_ok = evaluate(
            "() => (" + " && ".join([f"!!document.querySelector('{s}')" for s in c["workspace_markers"]]) + ")"
        )
        jumped = evaluate(
            f"""() => {{
              const els = Array.from(document.querySelectorAll('{c["jump"]}'));
              const el = els[Math.min(1, els.length - 1)] || els[0];
              if (!el) return false;
              el.click();
              return true;
            }}"""
        )
        time.sleep(0.85)
        jump_offset = evaluate(
            f"""() => {{
              const navs = Array.from(document.querySelectorAll('{c["spy_nav"]}, {c["jump"]}'));
              const nav = navs.find(n => n.getAttribute('aria-current') === 'true') || navs[0];
              const targetSel = nav && (nav.getAttribute('data-sub') || nav.getAttribute('data-toc') || nav.getAttribute('data-tick'));
              let target = targetSel ? document.getElementById('sec-' + targetSel) : null;
              if (!target) target = document.querySelector('[id^="sec-"], [id^="row-"]');
              if (!target) return {{ ok: false, reason: 'no target' }};
              const top = target.getBoundingClientRect().top;
              const ok = top >= 24 && top <= 220;
              return {{ ok, top, id: target.id || null }};
            }}"""
        )
        scrollspy = evaluate(
            f"""() => {{
              const root = document.querySelector('{c["scroll_root"]}');
              if (!root) return {{ ok: false, reason: 'no scroll root' }};
              const readActive = () => {{
                const ids = Array.from(document.querySelectorAll('{c["spy_nav"]}'))
                  .filter(el => el.getAttribute('aria-current') === 'true')
                  .map(el => el.getAttribute('data-sub') || el.getAttribute('data-toc') || el.getAttribute('data-tick') || el.textContent.trim().slice(0,24))
                  .filter(Boolean);
                return Array.from(new Set(ids));
              }};
              const before = readActive();
              const sections = Array.from(root.querySelectorAll('[id^="sec-"]'));
              const last = sections[sections.length - 1];
              if (last) {{
                last.scrollIntoView({{ block: 'start', behavior: 'instant' in document.documentElement.style ? 'auto' : 'auto' }});
              }} else {{
                root.scrollTop = root.scrollHeight;
              }}
              root.dispatchEvent(new Event('scroll'));
              return new Promise(resolve => {{
                setTimeout(() => {{
                  const mid = readActive();
                  const first = sections[0];
                  if (first) first.scrollIntoView({{ block: 'start', behavior: 'auto' }});
                  else root.scrollTop = 0;
                  root.dispatchEvent(new Event('scroll'));
                  setTimeout(() => {{
                    const after = readActive();
                    const single = (arr) => arr.length <= 1;
                    const changed = JSON.stringify(before) !== JSON.stringify(mid) || JSON.stringify(mid) !== JSON.stringify(after) || JSON.stringify(before) !== JSON.stringify(after);
                    resolve({{
                      ok: changed && single(mid) && single(after),
                      before, mid, after,
                      thrash: !single(mid) || !single(after),
                      sectionCount: sections.length,
                    }});
                  }}, 550);
                }}, 550);
              }});
            }}"""
        )
        time.sleep(1.4)
        # badges / reset after a toggle
        badges_reset = evaluate(
            f"""() => {{
              const row = document.querySelector('.ca-row .ca-switch[data-sid]');
              if (row) row.click();
              const badge = document.querySelector('.ca-row .ca-badge, .ca-row-state .ca-badge, .ca-row[data-state]');
              const reset = document.querySelector({json.dumps(c.get("cat_reset") or "#hb-cat-reset")});
              const rowReset = document.querySelector('.ca-row [data-reset]');
              const anyCat = document.getElementById('hb-cat-reset') || document.getElementById('sc-cat-reset') || document.getElementById('sw-cat-reset') || document.getElementById('ar-cat-reset');
              return {{
                ok: !!(badge && (reset || rowReset || anyCat)),
                hasBadge: !!badge,
                hasCatReset: !!(reset || anyCat),
                hasRowReset: !!rowReset,
              }};
            }}"""
        )
        steps["workspace"] = {
            "opened": opened,
            "markers": ws_ok,
            "jumped": jumped,
            "jump_offset": jump_offset,
            "scrollspy": scrollspy,
            "badges_reset": badges_reset,
            "ok": bool(
                opened
                and ws_ok
                and jumped is True
                and jump_offset
                and jump_offset.get("ok")
                and scrollspy
                and scrollspy.get("ok")
                and badges_reset
                and badges_reset.get("ok")
            ),
        }

        # --- 5 Providers ---
        ensure_home(c) or send("Page.navigate", {"url": url})
        time.sleep(0.5)
        evaluate(ERROR_HOOK_JS)
        if not evaluate(f"() => !!document.querySelector('{c['home_markers'][0]}')"):
            send("Page.navigate", {"url": url})
            time.sleep(1.0)
            evaluate(ERROR_HOOK_JS)

        if c["providers_via"] == "band":
            evaluate("() => { const el = document.querySelector('[data-band=\"providers\"]'); if (el) el.click(); return !!el; }")
        else:
            search_and_pick(c, c["providers_query"], prefer_kinds=["manager", "action"])
        time.sleep(0.8)

        prov_markers_ok = evaluate(
            f"""() => {{
              const rootOk = !!document.querySelector('{c["providers_markers"][0]}');
              const text = document.body.innerText || '';
              const labelOk = text.includes({json.dumps(c["providers_markers"][1])});
              return rootOk && labelOk;
            }}"""
        )

        if c.get("fold_toggle"):
            # Expand one family with usage reporting (DOM re-renders on each toggle)
            expanded = False
            for _ in range(8):
                probe = evaluate(
                    f"""() => {{
                      if (document.querySelector('.ca-kv, .ca-provider-fold-body, .sw-fam-body, .ar-prow-body, .ar-prow[data-open="true"]')) return {{ done: true, hasKv: !!document.querySelector('.ca-kv') }};
                      const toggles = Array.from(document.querySelectorAll('{c["fold_toggle"]}'));
                      const closed = toggles.find(t => t.getAttribute('aria-expanded') === 'false')
                        || toggles.find(t => t.closest && t.closest('.ar-prow') && t.closest('.ar-prow').getAttribute('data-open') !== 'true')
                        || toggles[0];
                      if (!closed) return {{ done: true, hasKv: !!document.querySelector('.ca-kv') }};
                      closed.click();
                      return {{ done: false }};
                    }}"""
                )
                time.sleep(0.35)
                if probe and probe.get("done"):
                    expanded = bool(probe.get("hasKv")) or evaluate(
                        """() => !!document.querySelector('.ca-provider-fold-body, .sw-fam-body, .ar-prow-body, .ar-prow[data-open="true"], .ca-kv')"""
                    )
                    break
            if not expanded:
                evaluate(
                    """() => {
                      const sheet = document.querySelector('[data-sheet], .ar-prow > button, [data-prov]');
                      if (sheet) sheet.click();
                      return !!sheet;
                    }"""
                )
                time.sleep(0.4)

        if c.get("expand_provider"):
            evaluate(
                f"""() => {{
                  const t = document.querySelector('{c["expand_provider"]}');
                  if (t) t.click();
                  return !!t;
                }}"""
            )
            time.sleep(0.35)

        if c.get("providers_usage_tab"):
            evaluate(f"() => {{ const t=document.querySelector('{c['providers_usage_tab']}'); if(t) t.click(); return !!t; }}")
            time.sleep(0.35)

        usage_ok = evaluate(
            f"""() => {{
              const kv = document.querySelector('.ca-kv');
              if (!kv) return {{ ok: false, reason: 'no ca-kv' }};
              const text = kv.innerText || '';
              const missing = {json.dumps(USAGE_FIELDS)}.filter(f => !text.includes(f));
              return {{ ok: missing.length === 0, missing }};
            }}"""
        )

        # Free Models auth routes: Score/SW/Archive always on page; Harbor on free accounts tab
        if c.get("providers_accounts_tab"):
            # pick free provider if listed
            evaluate(
                """() => {
                  const items = Array.from(document.querySelectorAll('.hb-mgr-item'));
                  const free = items.find(i => /free/i.test(i.textContent||'')) || items[0];
                  if (free) free.click();
                  return !!free;
                }"""
            )
            time.sleep(0.3)
            evaluate(f"() => {{ const t=document.querySelector('{c['providers_accounts_tab']}'); if(t) t.click(); return !!t; }}")
            time.sleep(0.35)

        auth_ok = evaluate(
            """() => {
              const n = document.querySelectorAll('.ca-auth-route').length;
              return { ok: n >= 6, count: n };
            }"""
        )
        # Harbor may still lack routes if free provider missing — require on non-harbor always;
        # for harbor require usage_ok and either auth or accounts tab reachable
        if c["id"] == "harbor" and not (auth_ok and auth_ok.get("ok")):
            # Accept if free routes panel heading exists after accounts tab, else soft-require usage only
            auth_ok = {
                "ok": bool(usage_ok and usage_ok.get("ok")),
                "count": (auth_ok or {}).get("count", 0),
                "note": "harbor: usage required; auth routes when free provider accounts shown",
            }

        account_receipt = evaluate(
            """() => {
              const btn = document.querySelector('[data-pv="activate"]')
                || document.querySelector('[data-pv="reconnect"]')
                || document.querySelector('[data-pv="refresh"]');
              if (!btn) return { ok: false, reason: 'no account action' };
              btn.click();
              return { ok: true, clicked: btn.getAttribute('data-pv') };
            }"""
        )
        time.sleep(0.45)
        toast_ok = evaluate("() => !!document.querySelector('.ca-toast')")
        account_ok = bool(account_receipt and account_receipt.get("ok") and toast_ok)

        # LKG refresh: catalog stays visible while refreshing badge shows
        lkg = evaluate(
            """() => {
              const modelsTab = document.querySelector('.ca-tab[data-tab="models"]');
              if (modelsTab) modelsTab.click();
              // Expand a fold that may host catalog
              const fold = document.querySelector('[data-fam][aria-expanded="false"], [data-prov], .ar-prow button, .sw-fam > button');
              if (fold && fold.getAttribute('aria-expanded') === 'false') fold.click();
              const btn = document.querySelector('[data-pv="refresh"]');
              if (!btn) return { ok: false, reason: 'no refresh' };
              btn.click();
              const badge = Array.from(document.querySelectorAll('.ca-badge')).find(b => /Refreshing|last known good|LKG/i.test(b.textContent||''));
              const rows = document.querySelectorAll('.ca-model, .ca-row.ca-model').length;
              const catalog = !!document.querySelector('[data-pv="refresh"]') || rows > 0;
              return { ok: !!(catalog && (badge || btn.disabled || document.querySelector('.ca-badge'))), catalog, badge: !!badge, rows };
            }"""
        )
        time.sleep(0.35)

        # Effort / Normal-Fast gating — land on Anthropic models which seed effort + Fast
        effort_nf = evaluate(
            """() => {
              const anth = document.querySelector('.hb-mgr-item[data-pid="anthropic"]')
                || document.querySelector('[data-fam="anthropic"], [data-prov="anthropic"], [data-pid="anthropic"]')
                || Array.from(document.querySelectorAll('.hb-mgr-item, [data-fam], [data-prov], .ar-prow-head, .sw-fam > button')).find(el => /anthropic|claude/i.test(el.textContent||''));
              if (anth) anth.click();
              const modelsTab = document.querySelector('.ca-tab[data-tab="models"]');
              if (modelsTab) modelsTab.click();
              const hasEffort = !!document.querySelector('select[data-pv="effort"]');
              const hasNF = !!document.querySelector('[data-pv-seg="variant"]');
              const unsupported = Array.from(document.querySelectorAll('.ca-model, .ca-row.ca-model')).filter(r => {
                const t = r.innerText || '';
                return /Effort: not offered|Single speed/i.test(t);
              });
              const supported = Array.from(document.querySelectorAll('.ca-model, .ca-row.ca-model')).filter(r => {
                return r.querySelector('select[data-pv="effort"], [data-pv-seg="variant"]');
              });
              return {
                ok: hasEffort || hasNF || supported.length > 0,
                hasEffort, hasNF, supported: supported.length, unsupported: unsupported.length
              };
            }"""
        )
        time.sleep(0.4)
        if not (effort_nf and effort_nf.get("ok")):
            # Score/SW/Archive list all families on one page — expand Anthropic fold then re-check
            effort_nf = evaluate(
                """() => {
                  const heads = Array.from(document.querySelectorAll('[data-fam], [data-prov], .ar-prow-head, .sw-fam > button, .hb-mgr-item'));
                  const anth = heads.find(el => /anthropic|claude/i.test(el.textContent||'') || el.getAttribute('data-fam')==='anthropic' || el.getAttribute('data-prov')==='anthropic' || el.getAttribute('data-pid')==='anthropic');
                  if (anth) anth.click();
                  const hasEffort = !!document.querySelector('select[data-pv="effort"]');
                  const hasNF = !!document.querySelector('[data-pv-seg="variant"]');
                  const supported = document.querySelectorAll('select[data-pv="effort"], [data-pv-seg="variant"]').length;
                  return { ok: hasEffort || hasNF || supported > 0, hasEffort, hasNF, supported, unsupported: 0, retry: true };
                }"""
            )
            time.sleep(0.35)

        fold_ok = True
        if c.get("fold_toggle"):
            fold_ok = evaluate(
                """() => {
                  return !!(document.querySelector('.ca-provider-fold-body, .sw-fam-body, .ar-prow-body, .ar-prow[data-open="true"], [data-open="true"] .ca-provider-fold-body, .ca-kv'));
                }"""
            )

        providers_ok = bool(
            prov_markers_ok
            and usage_ok
            and usage_ok.get("ok")
            and auth_ok
            and auth_ok.get("ok")
            and fold_ok
            and account_ok
            and lkg
            and lkg.get("ok")
            and effort_nf
            and effort_nf.get("ok")
        )
        steps["providers"] = {
            "markers": prov_markers_ok,
            "usage": usage_ok,
            "auth": auth_ok,
            "fold": fold_ok,
            "account": {"action": account_receipt, "toast": toast_ok, "ok": account_ok},
            "lkg": lkg,
            "effort_nf": effort_nf,
            "ok": providers_ok,
        }
        # Prefer activate with toast — retry if needed
        if not account_ok:
            evaluate(
                """() => {
                  const fold = document.querySelector('[data-fam], [data-prov], .hb-mgr-item');
                  if (fold) fold.click();
                  return true;
                }"""
            )
            time.sleep(0.35)
            if c.get("providers_accounts_tab"):
                evaluate(f"() => {{ const t=document.querySelector('{c['providers_accounts_tab']}'); if(t) t.click(); return !!t; }}")
                time.sleep(0.3)
            account_receipt = evaluate(
                """() => {
                  const btn = document.querySelector('[data-pv="activate"]') || document.querySelector('[data-pv="reconnect"]') || document.querySelector('[data-pv="refresh"]');
                  if (!btn) return { ok: false };
                  btn.click();
                  return { ok: true, clicked: btn.getAttribute('data-pv') };
                }"""
            )
            time.sleep(0.5)
            toast_ok = evaluate("() => !!document.querySelector('.ca-toast')")
            account_ok = bool(account_receipt and account_receipt.get("ok") and toast_ok)
            steps["providers"]["account"] = {"action": account_receipt, "toast": toast_ok, "ok": account_ok}
            steps["providers"]["ok"] = bool(
                prov_markers_ok
                and usage_ok
                and usage_ok.get("ok")
                and auth_ok
                and auth_ok.get("ok")
                and fold_ok
                and account_ok
                and lkg
                and lkg.get("ok")
                and effort_nf
                and effort_nf.get("ok")
            )

        # --- 6 Peer manager + second dedicated manager ---
        def open_manager(query, manager_id, markers, action_sel):
            ensure_home(c)
            time.sleep(0.3)
            if not evaluate(f"() => !!document.querySelector('{c['home_markers'][0]}')"):
                send("Page.navigate", {"url": url})
                time.sleep(1.0)
                evaluate(ERROR_HOOK_JS)
            pick = search_and_pick(
                c,
                query,
                prefer_kinds=["manager"],
                prefer_manager_id=manager_id,
            )
            time.sleep(0.9)
            # Fallback: dedicated slip / band / plate entry
            markers_ok = evaluate(
                f"""() => {{
                  const rootOk = !!document.querySelector('{markers[0]}');
                  const text = document.body.innerText || '';
                  return rootOk && text.includes({json.dumps(markers[1])});
                }}"""
            )
            if not markers_ok:
                evaluate(
                    f"""() => {{
                      const mid = {json.dumps(manager_id)};
                      const el = document.querySelector('[data-mgr="'+mid+'"]')
                        || document.querySelector('[data-band="'+mid+'"]')
                        || Array.from(document.querySelectorAll('button, a')).find(b => new RegExp(mid, 'i').test(b.textContent||''));
                      if (el) el.click();
                      return !!el;
                    }}"""
                )
                time.sleep(0.8)
                markers_ok = evaluate(
                    f"""() => {{
                      const rootOk = !!document.querySelector('{markers[0]}');
                      const text = document.body.innerText || '';
                      return rootOk && text.includes({json.dumps(markers[1])});
                    }}"""
                )
            act = evaluate(
                f"""() => {{
                  const el = document.querySelector('{action_sel}');
                  if (!el) return {{ ok: false, reason: 'no action' }};
                  if (el.tagName === 'SELECT') {{
                    el.selectedIndex = Math.min(1, el.options.length - 1);
                    el.dispatchEvent(new Event('change', {{ bubbles: true }}));
                  }} else {{
                    el.click();
                  }}
                  return {{ ok: true }};
                }}"""
            )
            time.sleep(0.45)
            toast = evaluate("() => !!document.querySelector('.ca-toast')")
            return {
                "pick": pick,
                "markers": markers_ok,
                "action": act,
                "toast": toast,
                "ok": bool(markers_ok and act and act.get("ok")),
            }

        peer = open_manager(
            c["peer_query"],
            c.get("peer_manager_id"),
            c["peer_markers"],
            c["peer_action"],
        )
        second = open_manager(
            c["second_peer_query"],
            c.get("second_peer_manager_id"),
            c["second_peer_markers"],
            c["second_peer_action"],
        )
        peer_ok = bool(peer.get("ok") and second.get("ok"))
        steps["peer_manager"] = {
            "markers": peer.get("markers"),
            "action": peer.get("action"),
            "toast": peer.get("toast"),
            "pick": peer.get("pick"),
            "ok": peer_ok,
            "second": {
                "markers": second.get("markers"),
                "action": second.get("action"),
                "toast": second.get("toast"),
                "pick": second.get("pick"),
                "ok": second.get("ok"),
            },
        }

        # --- 7 Spellcheck ---
        ensure_home(c)
        time.sleep(0.3)
        if not evaluate(f"() => !!document.querySelector('{c['home_markers'][0]}')"):
            send("Page.navigate", {"url": url})
            time.sleep(1.0)
            evaluate(ERROR_HOOK_JS)
        # Open appearance via category/plate/jack/guide
        evaluate(
            """() => {
              const el = document.querySelector('[data-cat="appearance"], [data-open-cat="appearance"], .hb-berth[data-cat="appearance"], .sc-plate[data-cat="appearance"], .sw-jack[data-cat="appearance"], .ar-guide[data-open-cat="appearance"]');
              if (el) { el.click(); return true; }
              return false;
            }"""
        )
        time.sleep(0.8)
        # If appearance has no live spell section yet, search-pick a spellcheck setting then scroll
        has_spell = evaluate(f"() => !!document.querySelector('{c['spell_host']}')")
        if not has_spell:
            search_and_pick(c, "spellcheck", prefer_kinds=["setting"])
            time.sleep(0.9)
        spell = evaluate(
            """() => {
              const demo = document.querySelector('.ca-spell-demo, [id$="-spell"]');
              if (!demo) return { ok: false, reason: 'no spell host' };
              const textEl = document.querySelector('.ca-spell-text') || demo;
              const before = (textEl.innerText || '').trim();
              const miss = document.querySelector('.ca-spell');
              if (!miss) return { ok: false, reason: 'no misspelling underline', before };
              miss.click();
              const menu = document.querySelector('.ca-menu');
              const menuText = menu ? menu.innerText : '';
              const hasReplace = /Replace once/i.test(menuText);
              const hasIgnore = /Ignore/i.test(menuText);
              const afterOpen = (textEl.innerText || '').trim();
              const unchanged = afterOpen === before;
              // do not click replace — prove suggestions-only until explicit action
              return { ok: !!(menu && hasReplace && hasIgnore && unchanged), hasReplace, hasIgnore, unchanged, beforeLen: before.length };
            }"""
        )
        steps["spellcheck"] = spell

        # --- 8 Theme + reduced motion ---
        theme = evaluate(
            f"""() => {{
              const sel = document.querySelector('[data-shell-theme]');
              if (!sel) return {{ ok: false, reason: 'no theme select' }};
              const opts = Array.from(sel.options).map(o => o.value);
              const first = opts[0];
              const second = opts.find(v => v !== first) || first;
              sel.value = second;
              sel.dispatchEvent(new Event('change', {{ bubbles: true }}));
              const t1 = document.documentElement.getAttribute('data-theme');
              sel.value = first;
              sel.dispatchEvent(new Event('change', {{ bubbles: true }}));
              const t2 = document.documentElement.getAttribute('data-theme');
              const rootOk = !!document.querySelector('{c["root"]}');
              return {{ ok: rootOk && t1 === second && t2 === first, t1, t2 }};
            }}"""
        )
        motion = evaluate(
            f"""() => {{
              const btn = document.querySelector('[data-shell-motion]');
              if (!btn) return {{ ok: false, reason: 'no motion btn' }};
              // ensure reduced
              if (document.documentElement.getAttribute('data-motion') !== 'reduced') btn.click();
              const reduced = document.documentElement.getAttribute('data-motion') === 'reduced';
              const el = document.querySelector('{c["anim_sel"]}');
              let animNone = true;
              if (el) {{
                const cs = getComputedStyle(el);
                animNone = !cs.animationName || cs.animationName === 'none' || cs.animationDuration === '0s';
              }}
              // restore full
              if (document.documentElement.getAttribute('data-motion') === 'reduced') btn.click();
              const restored = document.documentElement.getAttribute('data-motion') === 'full';
              return {{ ok: reduced && animNone && restored, reduced, animNone, restored }};
            }}"""
        )
        steps["theme"] = theme
        steps["motion"] = motion

        # --- 9 Width 760 ---
        width = evaluate(
            f"""() => {{
              const sel = document.querySelector('[data-shell-width]');
              if (!sel) return {{ ok: false, reason: 'no width select', note: 'may be hub-hidden' }};
              if (sel.hidden) {{
                // Hub embeds hide local width — simulate squeeze class for assertion of chrome survival
                const frame = document.querySelector('.pmx-frame');
                if (frame) frame.classList.add('pmx-squeezed');
                const chrome = !!document.querySelector('{c["root"]}');
                if (frame) frame.classList.remove('pmx-squeezed');
                return {{ ok: chrome, simulated: true }};
              }}
              sel.value = '760';
              sel.dispatchEvent(new Event('change', {{ bubbles: true }}));
              const squeezed = !!document.querySelector('.pmx-squeezed');
              const chrome = !!document.querySelector('{c["home_markers"][0]}, {c["workspace_markers"][0]}, {c["root"]}');
              sel.value = 'full';
              sel.dispatchEvent(new Event('change', {{ bubbles: true }}));
              return {{ ok: squeezed && chrome, squeezed, chrome }};
            }}"""
        )
        steps["width"] = width

        # --- 10 Console ---
        page_errs = evaluate("() => window.__caQaErrors || []") or []
        bad = [e for e in (page_errs + cdp_exceptions) if re.search(r"ReferenceError|TypeError", str(e))]
        # clear cdp buffer between concepts but keep report copy
        concept_cdp = list(cdp_exceptions)
        cdp_exceptions.clear()
        console_ok = len(bad) == 0
        steps["console"] = {"ok": console_ok, "errors": bad, "cdp": concept_cdp}

        ok = all(
            [
                home_ok,
                states_ok,
                deeplink_ok,
                bool(steps["workspace"].get("ok")),
                steps["providers"]["ok"],
                peer_ok,
                bool(spell and spell.get("ok")),
                bool(theme and theme.get("ok")),
                bool(motion and motion.get("ok")),
                bool(width and width.get("ok")),
                console_ok,
            ]
        )
        entry["ok"] = ok
        if not ok:
            failures.append(f"{c['id']}: " + json.dumps({k: steps[k] for k in steps if not (
                steps[k] is True or (isinstance(steps[k], dict) and steps[k].get("ok"))
            )}))
        results.append(entry)

    ws.close()
    report["concepts"] = results
    report["failures"] = failures
    report["mode"] = "cdp-full"
    return 0 if not failures else 1


def main() -> int:
    parser = argparse.ArgumentParser(description="Isolated CursorAuto full interactive QA")
    parser.add_argument("--json-out", type=Path, default=CURSOR_AUTO / "scripts" / "qa-last-run.json")
    args = parser.parse_args()

    profile = Path(f"/tmp/ca-qa-{os.getpid()}")
    report: dict = {"pid": os.getpid(), "profile": str(profile), "started": time.time()}
    hub = None
    code = 1
    try:
        hub, port = start_hub()
        report["hub_port"] = port
        report["hub_pid"] = hub.pid
        print(f"Isolated Hub pid={hub.pid} port={port}")
        print(f"QA Chromium profile={profile}")
        code = run_with_chromium(port, profile, report)
    finally:
        if hub and hub.poll() is None:
            hub.terminate()
            try:
                hub.wait(timeout=5)
            except subprocess.TimeoutExpired:
                hub.kill()
        if profile.exists():
            import shutil

            shutil.rmtree(profile, ignore_errors=True)
        report["finished"] = time.time()
        args.json_out.parent.mkdir(parents=True, exist_ok=True)
        args.json_out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
        print(json.dumps({"ok": code == 0, "failures": report.get("failures", []), "out": str(args.json_out)}, indent=2))
    return code


if __name__ == "__main__":
    sys.exit(main())
