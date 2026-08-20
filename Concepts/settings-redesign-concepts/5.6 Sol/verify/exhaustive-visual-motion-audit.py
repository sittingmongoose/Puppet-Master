#!/usr/bin/env python3
"""Exhaustive visual/motion certification harness for Settings concepts 05–11.

The harness is intentionally external to product runtime. It starts an isolated
ConceptHub server on an OS-assigned port, launches an isolated Chromium profile,
and writes temporary screenshots/recordings only to the caller-supplied output
folder. Final reports can be generated from the JSON evidence and temporary image
material removed after review.
"""
from __future__ import annotations

import argparse
import base64
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

from playwright.sync_api import Page, sync_playwright

HERE = Path(__file__).resolve().parent
MODEL = HERE.parent
REPO = MODEL.parents[2]
HUB_SERVER = REPO / "Concepts" / "ConceptHub" / "server.py"
BASE_URL_PATH = "/concepts/settings-redesign-concepts/5.6%20Sol"
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
    "friendly-dark", "friendly-light", "glass-dark", "glass-light",
    "retro-dark", "retro-light", "basic-dark", "basic-light",
]
WIDTHS = [760, 900, 1280, 1700, 2200, 2500]
ROUTE_WIDTHS = [760, 1700]
HEIGHT = 900
STATE_NAMES = [
    "loading-cached", "empty", "no-search-results", "typo-fuzzy",
    "validation-error", "offline", "managed", "unavailable",
    "restart-required", "reconnect-required", "changed-elsewhere",
    "import-conflict", "rollback-complete", "usage-unavailable",
    "multi-install", "unknown-owner", "provider-update",
    "verification-failure",
]

RESET_AND_ROUTE_JS = r"""
(route) => {
  const app = window.__pmv2App;
  if (!app) throw new Error('PMv2 app missing');
  document.documentElement.setAttribute('data-motion', 'reduced');
  document.documentElement.removeAttribute('data-pm-motion-direction');
  document.documentElement.removeAttribute('data-pm-motion-cause');
  app.stack = [];
  app.query = '';
  app.selectedResultId = null;
  app.searchOpen = false;
  app.results = [];
  app.detailsId = null;
  app.statesOpen = false;
  app.work = null;
  app.receipts = [];
  app.copy = {step: null, sourceId: null, categories: [], restorePoint: null, receipt: null};
  Object.keys(app.flags || {}).forEach((key) => { app.flags[key] = false; });
  app.hydrated = {};
  app.route = route || {name: 'home'};
  if (app.route.manager) app.hydrated[app.route.manager] = {at: Date.now()};
  app._motion = {cause: 'audit-settle', direction: 'lateral', stage: false, targetId: null};
  app.paint();
  return {route: app.route, project: app.project};
}
"""

METRICS_JS = r"""
() => {
  const root = document.querySelector('[data-pmv2-root]');
  if (!root) return {fatal: 'root missing'};
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const all = [...root.querySelectorAll('*')];
  const style = (el) => getComputedStyle(el);
  const rect = (el) => el.getBoundingClientRect();
  const baseVisible = (el) => {
    const s = style(el), r = rect(el);
    return s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity || 1) > 0.001 && r.width > .5 && r.height > .5;
  };
  const clipRect = (el) => {
    let r = rect(el);
    let out = {left: Math.max(0, r.left), top: Math.max(0, r.top), right: Math.min(vw, r.right), bottom: Math.min(vh, r.bottom)};
    let p = el.parentElement;
    while (p && p !== document.documentElement) {
      const s = style(p);
      if (/(hidden|clip|auto|scroll)/.test(s.overflowX + ' ' + s.overflowY)) {
        const pr = rect(p);
        out.left = Math.max(out.left, pr.left);
        out.top = Math.max(out.top, pr.top);
        out.right = Math.min(out.right, pr.right);
        out.bottom = Math.min(out.bottom, pr.bottom);
      }
      p = p.parentElement;
    }
    out.width = Math.max(0, out.right - out.left);
    out.height = Math.max(0, out.bottom - out.top);
    return out;
  };
  const actuallyVisible = (el) => baseVisible(el) && clipRect(el).width > 1 && clipRect(el).height > 1;
  const leafText = (el) => el.childElementCount === 0 ? (el.textContent || '').trim() : '';
  const clips = [];
  const edge = [];
  const tiny = [];
  const longLines = [];
  for (const el of all) {
    if (!actuallyVisible(el)) continue;
    const s = style(el), r = rect(el), cr = clipRect(el);
    const text = leafText(el);
    const control = /^(BUTTON|INPUT|SELECT|TEXTAREA)$/.test(el.tagName);
    const relevant = control || !!text;
    if (relevant && (s.overflowX === 'hidden' || s.overflowX === 'clip') && el.scrollWidth > el.clientWidth + 3) {
      clips.push({axis:'x', tag:el.tagName, class:String(el.className || '').slice(0,100), id:el.dataset.rowId || el.dataset.id || '', scroll:el.scrollWidth, client:el.clientWidth, text:(text || el.value || '').slice(0,100)});
    }
    if (relevant && (s.overflowY === 'hidden' || s.overflowY === 'clip') && el.scrollHeight > el.clientHeight + 3) {
      clips.push({axis:'y', tag:el.tagName, class:String(el.className || '').slice(0,100), id:el.dataset.rowId || el.dataset.id || '', scroll:el.scrollHeight, client:el.clientHeight, text:(text || el.value || '').slice(0,100)});
    }
    if (relevant && Number.parseInt(s.webkitLineClamp || '0', 10) > 0 && el.scrollHeight > el.clientHeight + 3) {
      clips.push({axis:'line-clamp', tag:el.tagName, class:String(el.className || '').slice(0,100), id:el.dataset.rowId || el.dataset.id || '', text:text.slice(0,100)});
    }
    if (control && cr.width > 1 && cr.height > 1 && (r.left < -1 || r.right > vw + 1)) {
      edge.push({tag:el.tagName, class:String(el.className || '').slice(0,100), left:Math.round(r.left), right:Math.round(r.right), text:(el.innerText || el.value || '').slice(0,80)});
    }
    if (control && cr.width > 1 && cr.height > 1 && (r.width < 18 || r.height < 16)) {
      tiny.push({tag:el.tagName, class:String(el.className || '').slice(0,100), width:Math.round(r.width), height:Math.round(r.height), text:(el.innerText || el.value || '').slice(0,80)});
    }
    if (text && Number.parseFloat(s.fontSize) <= 18) {
      try {
        const range = document.createRange();
        range.selectNodeContents(el);
        const lineRects = [...range.getClientRects()].filter((x) => x.width > 1 && x.height > 1);
        const maxLine = lineRects.reduce((m, x) => Math.max(m, x.width), 0);
        if (maxLine > 920) longLines.push({tag:el.tagName, class:String(el.className || '').slice(0,100), width:Math.round(maxLine), text:text.slice(0,100)});
      } catch (_) {}
    }
  }
  const controls = all.filter((el) => actuallyVisible(el) && /^(BUTTON|INPUT|SELECT|TEXTAREA)$/.test(el.tagName));
  const overlaps = [];
  for (let i = 0; i < controls.length; i++) {
    for (let j = i + 1; j < controls.length; j++) {
      const a = controls[i], b = controls[j];
      if (a.contains(b) || b.contains(a)) continue;
      const A = clipRect(a), B = clipRect(b);
      const w = Math.min(A.right, B.right) - Math.max(A.left, B.left);
      const h = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
      if (w <= 3 || h <= 3) continue;
      const area = w * h;
      const aArea = Math.max(1, A.width * A.height), bArea = Math.max(1, B.width * B.height);
      if (area / Math.min(aArea, bArea) > .18) {
        overlaps.push({a:(a.innerText || a.value || '').slice(0,60), b:(b.innerText || b.value || '').slice(0,60), area:Math.round(area)});
      }
    }
  }
  const scrollables = all.filter((el) => {
    if (!baseVisible(el)) return false;
    const s = style(el);
    return /(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 40;
  }).map((el) => ({
    class:String(el.className || '').slice(0,140),
    scrollHeight:el.scrollHeight,
    clientHeight:el.clientHeight,
    scrollTop:el.scrollTop,
    delta:el.scrollHeight - el.clientHeight,
  })).sort((a,b) => b.delta - a.delta).slice(0,8);
  const rr = rect(root);
  const rail = document.querySelector('.pmx-rail');
  const side = document.querySelector('.pmx-side');
  const search = root.querySelector('[data-search]');
  const close = root.querySelector('[data-act="close"]');
  const back = root.querySelector('[data-act="back"]');
  const foreign = [...root.querySelectorAll('iframe, a[href*="concept-0"]')].map((e) => e.outerHTML.slice(0,160));
  const renderedRows = root.querySelectorAll('[data-row-id]').length;
  const interactiveCount = root.querySelectorAll('button,input,select,textarea,a[href]').length;
  return {
    route: root.getAttribute('data-route'),
    rootRect:{left:rr.left, right:rr.right, top:rr.top, bottom:rr.bottom, width:rr.width, height:rr.height},
    viewport:{width:vw,height:vh},
    documentOverflowX: Math.max(document.documentElement.scrollWidth - vw, document.body.scrollWidth - vw),
    rootOverflowX: Math.max(0, root.scrollWidth - root.clientWidth),
    clips:clips.slice(0,50), edgeControls:edge.slice(0,50), tinyControls:tiny.slice(0,50),
    overlaps:overlaps.slice(0,50), longLines:longLines.slice(0,50), scrollables,
    shell:{railRight:rail ? rect(rail).right : null, sideRight:side ? rect(side).right : null},
    contracts:{hasSearch:!!search, hasClose:!!close, hasBack:!!back, searchInViewport:search ? rect(search).right <= vw + 1 && rect(search).left >= -1 : false},
    foreign,
    renderedRows, interactiveCount,
    textLength:(document.body.innerText || '').length,
    activeElement:document.activeElement && (document.activeElement.getAttribute('data-id') || document.activeElement.getAttribute('data-search') !== null ? document.activeElement.outerHTML.slice(0,180) : document.activeElement.tagName),
  };
}
"""

LIGHT_METRICS_JS = r"""
() => {
  const root = document.querySelector('[data-pmv2-root]');
  const vw = window.innerWidth, vh = window.innerHeight;
  if (!root) return {fatal:'root missing'};
  const rr = root.getBoundingClientRect();
  const search = root.querySelector('[data-search]');
  const sr = search ? search.getBoundingClientRect() : null;
  return {
    route: root.getAttribute('data-route'),
    viewport:{width:vw,height:vh},
    documentOverflowX: Math.max(document.documentElement.scrollWidth-vw, document.body.scrollWidth-vw),
    rootOverflowX: Math.max(0,root.scrollWidth-root.clientWidth),
    rootRect:{left:rr.left,right:rr.right,top:rr.top,bottom:rr.bottom,width:rr.width,height:rr.height},
    contracts:{hasSearch:!!search,hasClose:!!root.querySelector('[data-act="close"]'),hasBack:!!root.querySelector('[data-act="back"]'),searchInViewport:!sr || (sr.left>=-1 && sr.right<=vw+1)},
    clips:[],edgeControls:[],overlaps:[],longLines:[],foreign:[],
  };
}
"""

PRIMARY_SCROLL_JS = r"""
(position) => {
  const root = document.querySelector('[data-pmv2-root]');
  const visible = (el) => {
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 10 && r.height > 10;
  };
  const candidates = [root, ...root.querySelectorAll('*')].filter((el) => {
    if (!visible(el)) return false;
    const s = getComputedStyle(el);
    return /(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 80;
  }).sort((a,b) => (b.scrollHeight-b.clientHeight) - (a.scrollHeight-a.clientHeight));
  const el = candidates[0];
  if (!el) return null;
  el.scrollTop = position === 'bottom' ? el.scrollHeight : 0;
  return {class:String(el.className || ''), scrollHeight:el.scrollHeight, clientHeight:el.clientHeight, scrollTop:el.scrollTop};
}
"""

SET_THEME_JS = r"""
(theme) => {
  const select = document.querySelector('[data-shell-theme]');
  if (select) {
    select.value = theme;
    select.dispatchEvent(new Event('change', {bubbles:true}));
  } else {
    document.documentElement.dataset.theme = theme;
  }
  return document.documentElement.dataset.theme || document.body.dataset.theme || (select && select.value);
}
"""

INVENTORY_JS = r"""
() => {
  const app = window.__pmv2App;
  return {
    categories:(app.categories || []).map((c) => ({id:c.id,title:c.title,subgroups:(c.subgroups||[]).map((s)=>({id:s.id,title:s.title}))})),
    managers:(app.managers || []).map((m) => ({id:m.id,title:m.title,domain:m.domain,tabs:m.tabs||[],objects:(app.objectsFor(m.id)||[]).map((o)=>({id:o.id,label:o.label||o.name||o.id}))})),
    deferred:(app.deferred || []).map((d)=>({id:d.id,title:d.title,domain:d.domain})),
    productSettingIds:(window.PMv2.productSettingIds || []).slice(),
  };
}
"""

@dataclass
class Hub:
    process: subprocess.Popen[str]
    port: int
    log_path: Path

    def close(self) -> None:
        if self.process.poll() is None:
            self.process.terminate()
            try:
                self.process.wait(timeout=4)
            except subprocess.TimeoutExpired:
                self.process.kill()
                self.process.wait(timeout=2)
        try:
            self.log_path.unlink()
        except FileNotFoundError:
            pass


def start_hub() -> Hub:
    fd, name = tempfile.mkstemp(prefix="pm-settings-exhaustive-hub-", suffix=".log")
    os.close(fd)
    log_path = Path(name)
    log = open(log_path, "w", encoding="utf-8", errors="replace")
    process = subprocess.Popen(
        [sys.executable, "-u", str(HUB_SERVER), "--port", "0", "--no-browser", "--no-runtime-state"],
        cwd=str(HUB_SERVER.parent), stdout=log, stderr=subprocess.STDOUT, text=True,
    )
    port: int | None = None
    deadline = time.time() + 25
    while time.time() < deadline:
        log.flush()
        text = log_path.read_text(encoding="utf-8", errors="replace")
        match = re.search(r"http://127\.0\.0\.1:(\d+)/", text)
        if match:
            port = int(match.group(1))
            break
        if process.poll() is not None:
            break
        time.sleep(.04)
    log.close()
    if port is None:
        process.terminate()
        raise RuntimeError(f"ConceptHub failed to start.\n{log_path.read_text(errors='replace')}")
    return Hub(process=process, port=port, log_path=log_path)


def safe_name(value: str) -> str:
    value = re.sub(r"[^A-Za-z0-9._-]+", "-", value).strip("-")
    return value[:180] or "screen"


def open_concept(page: Page, hub_port: int, stem: str, width: int, theme: str = "friendly-dark", reduced: bool = True) -> dict[str, Any]:
    page.set_viewport_size({"width": width, "height": HEIGHT})
    url = f"http://127.0.0.1:{hub_port}{BASE_URL_PATH}/{stem}.html"
    page.goto(url, wait_until="domcontentloaded", timeout=45_000)
    page.wait_for_selector("[data-pmv2-root]", timeout=20_000)
    page.wait_for_function("() => window.__pmv2App && window.PMv2", timeout=20_000)
    page.evaluate("localStorage.clear(); sessionStorage.clear();")
    page.reload(wait_until="domcontentloaded", timeout=45_000)
    page.wait_for_selector("[data-pmv2-root]", timeout=20_000)
    page.evaluate(SET_THEME_JS, theme)
    page.evaluate("(on) => document.documentElement.setAttribute('data-motion', on ? 'reduced' : 'full')", reduced)
    page.wait_for_timeout(50 if reduced else 720)
    return page.evaluate(INVENTORY_JS)


def build_routes(inv: dict[str, Any]) -> list[dict[str, Any]]:
    routes: list[dict[str, Any]] = [
        {"key":"home", "family":"home", "label":"Settings Home", "route":{"name":"home"}},
        {"key":"all", "family":"all", "label":"All Settings", "route":{"name":"all"}},
    ]
    for cat in inv["categories"]:
        routes.append({
            "key":f"domain-{cat['id']}-overview", "family":"domains",
            "label":f"{cat['title']} / overview",
            "route":{"name":"domain","domain":cat["id"]},
        })
        for subgroup in cat["subgroups"]:
            routes.append({
                "key":f"domain-{cat['id']}-{subgroup['id']}", "family":"domains",
                "label":f"{cat['title']} / {subgroup['title']}",
                "route":{"name":"domain","domain":cat["id"],"page":subgroup["id"],"section":subgroup["id"]},
            })
    for mgr in inv["managers"]:
        objects = mgr.get("objects") or []
        first_obj = objects[0]["id"] if objects else None
        for tab in mgr.get("tabs") or ["overview"]:
            route = {"name":"manager","domain":mgr["domain"],"manager":mgr["id"],"page":tab}
            if first_obj:
                route["object"] = first_obj
            routes.append({
                "key":f"manager-tab-{mgr['id']}-{tab}", "family":"manager-tabs",
                "label":f"{mgr['title']} / {tab}", "route":route,
            })
        for obj in objects:
            route = {"name":"manager","domain":mgr["domain"],"manager":mgr["id"],"page":(mgr.get("tabs") or ["overview"])[0],"object":obj["id"]}
            routes.append({
                "key":f"manager-object-{mgr['id']}-{obj['id']}", "family":"manager-objects",
                "label":f"{mgr['title']} / {obj['label']}", "route":route,
            })
    for item in inv["deferred"]:
        routes.append({
            "key":f"deferred-{item['id']}", "family":"deferred",
            "label":item["title"], "route":{"name":"deferred","domain":item["domain"],"deferred":item["id"]},
        })
    return routes


def reset_route(page: Page, route: dict[str, Any]) -> None:
    page.evaluate(RESET_AND_ROUTE_JS, route)
    page.wait_for_timeout(45)


_CDP_SESSIONS: dict[int, Any] = {}

def screenshot(page: Page, path: Path, *, allow_animations: bool = False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    # Motion evidence must use Playwright's normal screenshot path. CDP's
    # Page.captureScreenshot can omit View Transition pseudo-elements at the
    # first compositor frame and can incorrectly expose native select popups,
    # producing black/expanded-control artifacts that are not visible to the
    # user. The bounded motion pass is small enough that the wrapper is stable.
    if (allow_animations and os.environ.get("PM_AUDIT_FAST_MOTION") != "1") or os.environ.get("PM_AUDIT_SCREENSHOT_MODE") == "playwright":
        page.screenshot(
            path=str(path), type="jpeg", quality=86 if allow_animations else 76,
            animations="allow" if allow_animations else "disabled",
            caret="hide", scale="css", timeout=20_000,
        )
        return
    # Use Chrome's direct viewport capture rather than Playwright's screenshot
    # wrapper. The wrapper can intermittently stall after nested-pane scrolling
    # in long capture runs; CDP returns the exact composited viewport and leaves
    # animation timing untouched, which is also required for motion strips.
    key = id(page)
    session = _CDP_SESSIONS.get(key)
    if session is None:
        session = page.context.new_cdp_session(page)
        _CDP_SESSIONS[key] = session
    try:
        result = session.send("Page.captureScreenshot", {
            "format": "jpeg", "quality": 78, "fromSurface": True,
            "captureBeyondViewport": False,
        })
    except Exception:
        try:
            session.detach()
        except Exception:
            pass
        session = page.context.new_cdp_session(page)
        _CDP_SESSIONS[key] = session
        result = session.send("Page.captureScreenshot", {
            "format": "jpeg", "quality": 78, "fromSurface": True,
            "captureBeyondViewport": False,
        })
    path.write_bytes(base64.b64decode(result["data"]))


def record_surface(page: Page, out_dir: Path, stem: str, width: int, item: dict[str, Any], *, capture_bottom: bool = True) -> list[dict[str, Any]]:
    reset_route(page, item["route"])
    page.evaluate(PRIMARY_SCROLL_JS, "top")
    page.wait_for_timeout(20)
    top_metrics = page.evaluate(METRICS_JS)
    top_path = out_dir / stem / f"w{width}" / item["family"] / f"{safe_name(item['key'])}--top.jpg"
    screenshot(page, top_path)
    records = [{
        "stem":stem,"width":width,"family":item["family"],"key":item["key"],"label":item["label"],
        "position":"top","path":str(top_path),"metrics":top_metrics,
    }]
    if capture_bottom:
        scroll_info = page.evaluate(PRIMARY_SCROLL_JS, "bottom")
        if scroll_info and scroll_info.get("scrollTop", 0) > 50:
            page.wait_for_timeout(20)
            bottom_metrics = page.evaluate(METRICS_JS)
            bottom_path = out_dir / stem / f"w{width}" / item["family"] / f"{safe_name(item['key'])}--bottom.jpg"
            screenshot(page, bottom_path)
            records.append({
                "stem":stem,"width":width,"family":item["family"],"key":item["key"],"label":item["label"],
                "position":"bottom","path":str(bottom_path),"metrics":bottom_metrics,"scroll":scroll_info,
            })
    return records


def misc_surfaces(page: Page, out_dir: Path, stem: str, width: int, inv: dict[str, Any]) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []

    def capture(key: str, label: str, family: str = "misc", bottom: bool = True) -> None:
        page.wait_for_timeout(45)
        page.evaluate(PRIMARY_SCROLL_JS, "top")
        metrics = page.evaluate(METRICS_JS)
        path = out_dir / stem / f"w{width}" / family / f"{safe_name(key)}--top.jpg"
        screenshot(page, path)
        records.append({"stem":stem,"width":width,"family":family,"key":key,"label":label,"position":"top","path":str(path),"metrics":metrics})
        if bottom:
            info = page.evaluate(PRIMARY_SCROLL_JS, "bottom")
            if info and info.get("scrollTop",0)>50:
                page.wait_for_timeout(20)
                path2 = out_dir / stem / f"w{width}" / family / f"{safe_name(key)}--bottom.jpg"
                screenshot(page,path2)
                records.append({"stem":stem,"width":width,"family":family,"key":key,"label":label,"position":"bottom","path":str(path2),"metrics":page.evaluate(METRICS_JS),"scroll":info})

    # All Settings with exact row detail drawer.
    reset_route(page, {"name":"all"})
    first_id = inv["productSettingIds"][0]
    page.evaluate("(id) => { const a=window.__pmv2App; a.detailsId=id; a._motion={cause:'drawer',direction:'forward',stage:false,targetId:id}; a.paint(); }", first_id)
    capture("all-detail-drawer", "All Settings / exact detail drawer")

    # Search dropdowns: grouped, duplicate label, typo, unavailable.
    for query, key in [("Theme","theme"),("Workspace note","duplicate"),("thme","typo"),("Server","unavailable")]:
        reset_route(page,{"name":"home"})
        page.evaluate("(q) => window.__pmv2App.setQuery(q)",query)
        capture(f"search-{key}",f"Search dropdown / {query}","search",False)

    # Demo-state menu itself.
    reset_route(page,{"name":"home"})
    page.evaluate("() => { const a=window.__pmv2App; a.statesOpen=true; a.paint(); }")
    capture("demo-state-menu","Demo state menu","states",False)

    # Deterministic fixtures.
    for state_name in STATE_NAMES:
        reset_route(page,{"name":"home"})
        page.evaluate("(name) => window.__pmv2App.triggerState(name)",state_name)
        page.wait_for_timeout(80)
        capture(f"state-{state_name}",f"State / {state_name}","states")

    # Provider setup sequence at exact host/environment.
    provider_route={"name":"manager","domain":"ai","manager":"providers","page":"setup","object":"local-ollama","row":"install-official"}
    reset_route(page,provider_route)
    capture("provider-setup-review","Provider setup / review official source","provider-setup")
    page.evaluate("() => window.__pmv2App.confirmOfficialCli('local-ollama')")
    page.wait_for_timeout(100)
    capture("provider-setup-installing","Provider setup / installing","provider-setup",False)
    page.wait_for_timeout(280)
    capture("provider-setup-installed","Provider setup / installed, authentication separate","provider-setup")

    # Copy transaction stages.
    reset_route(page,{"name":"home"})
    page.evaluate("() => window.__pmv2App.openCopy()")
    capture("copy-pick-source","Copy / select source","copy")
    page.evaluate("() => { const a=window.__pmv2App; a.copy.sourceId='northwind-docs'; a.copy.step='preview'; a.paint(); }")
    capture("copy-preview","Copy / additions, replacements, unchanged, unavailable, conflicts","copy")
    page.evaluate("() => { const a=window.__pmv2App; a.beginCopyApply(); a.paint(); }")
    capture("copy-applying","Copy / restore point and atomic apply","copy",False)
    page.evaluate("() => { const a=window.__pmv2App; a.applyCopy(); }")
    page.wait_for_timeout(500)
    capture("copy-receipt","Copy / verified receipt","copy")
    page.evaluate("() => window.__pmv2App.rollbackCopy()")
    capture("copy-rolled-back","Copy / rollback complete","copy")
    reset_route(page,{"name":"copy"})
    page.evaluate("() => { const a=window.__pmv2App; a.copy.sourceId='northwind-docs'; a.copy.categories=(a.categories||[]).map(c=>c.id); a.copy.step='preview'; a.flags.importConflict=true; a.paint(); }")
    capture("copy-conflict","Copy / import conflict","copy")
    return records


def run_routes(page: Page, hub_port: int, stem: str, out_dir: Path, *,
               route_start: int = 0, route_end: int | None = None,
               route_widths: list[int] | None = None,
               misc_mode: str = "auto") -> dict[str, Any]:
    report: dict[str, Any] = {"stem":stem,"widths":{},"records":[],"errors":[],
                              "route_start":route_start,"route_end":route_end}
    errors: list[str] = []
    context = page.context

    def attach_errors(target: Page) -> None:
        target.on("pageerror", lambda exc: errors.append(f"pageerror: {exc}"))
        target.on("console", lambda msg: errors.append(f"console: {msg.text}") if msg.type == "error" else None)

    for width in (route_widths or ROUTE_WIDTHS):
        # Inventory discovery is isolated from screenshot waves.
        inventory_page = context.new_page()
        attach_errors(inventory_page)
        try:
            inv = open_concept(inventory_page,hub_port,stem,width,reduced=True)
        finally:
            inventory_page.close()
        all_routes = build_routes(inv)
        stop = len(all_routes) if route_end is None else min(route_end, len(all_routes))
        routes = [] if misc_mode == "only" else all_routes[max(0, route_start):stop]
        width_records: list[dict[str, Any]] = []

        # Chrome's direct screenshot compositor can eventually stop producing a
        # frame after hundreds of captures in one document. Each route wave is a
        # new page and therefore a new renderer/CDP session, while route data and
        # viewport remain identical. A 48-route cap means <=96 viewport frames.
        wave_size = 48
        for wave_start in range(0, len(routes), wave_size):
            wave = routes[wave_start:wave_start + wave_size]
            wave_page = context.new_page()
            attach_errors(wave_page)
            try:
                open_concept(wave_page,hub_port,stem,width,reduced=True)
                for offset,item in enumerate(wave):
                    local_index = wave_start + offset
                    index = max(0, route_start) + local_index
                    width_records.extend(record_surface(wave_page,out_dir,stem,width,item))
                    if (local_index+1)%25==0:
                        print(f"[{stem} w{width}] routes {index+1}/{len(all_routes)}",flush=True)
            finally:
                wave_page.close()

        if misc_mode == "only" or (misc_mode == "auto" and stop >= len(all_routes)):
            misc_page = context.new_page()
            attach_errors(misc_page)
            try:
                inv = open_concept(misc_page,hub_port,stem,width,reduced=True)
                width_records.extend(misc_surfaces(misc_page,out_dir,stem,width,inv))
            finally:
                misc_page.close()
        report["widths"][str(width)]={"route_count":len(routes),"route_total":len(all_routes),"record_count":len(width_records)}
        report["records"].extend(width_records)
    report["errors"]=errors
    return report


def representative_routes() -> list[tuple[str,dict[str,Any]]]:
    return [
        ("home",{"name":"home"}),
        ("domain",{"name":"domain","domain":"ai","page":"accounts","section":"accounts"}),
        ("manager",{"name":"manager","domain":"ai","manager":"providers","page":"overview","object":"anthropic"}),
        ("all",{"name":"all"}),
    ]


def run_matrix(page: Page, hub_port: int, stem: str, out_dir: Path, *,
               matrix_widths: list[int] | None = None,
               matrix_themes: list[str] | None = None) -> dict[str, Any]:
    records=[]; errors=[]
    page.on("pageerror",lambda exc:errors.append(f"pageerror: {exc}"))
    page.on("console",lambda msg:errors.append(f"console: {msg.text}") if msg.type=="error" else None)
    first=True
    selected_widths = matrix_widths or WIDTHS
    for width in selected_widths:
        inv=open_concept(page,hub_port,stem,width,reduced=True) if first or width != selected_widths[0] else page.evaluate(INVENTORY_JS)
        first=False
        for theme in (matrix_themes or THEMES):
            page.evaluate(SET_THEME_JS,theme); page.wait_for_timeout(25)
            for key,route in representative_routes():
                reset_route(page,route)
                if key=="manager": page.evaluate("() => { const a=window.__pmv2App; a.route.object='anthropic'; a.paint(); }")
                metrics=page.evaluate(METRICS_JS)
                path=out_dir/stem/"matrix"/key/f"{theme}--w{width}.jpg"
                screenshot(page,path)
                records.append({"stem":stem,"theme":theme,"width":width,"surface":key,"path":str(path),"metrics":metrics})
            # Copy preview is stateful, capture separately.
            reset_route(page,{"name":"home"}); page.evaluate("() => window.__pmv2App.openCopy()"); page.evaluate("() => {const a=window.__pmv2App;a.copy.sourceId='northwind-docs';a.copy.step='preview';a.paint();}"); page.wait_for_timeout(25)
            metrics=page.evaluate(METRICS_JS); path=out_dir/stem/"matrix"/"copy"/f"{theme}--w{width}.jpg"; screenshot(page,path)
            records.append({"stem":stem,"theme":theme,"width":width,"surface":"copy","path":str(path),"metrics":metrics})
        print(f"[{stem}] theme matrix width {width} complete",flush=True)
    return {"stem":stem,"records":records,"errors":errors,"inventory":inv}


def animation_snapshot(page: Page) -> dict[str, Any]:
    return page.evaluate(r"""() => ({
      route:(document.querySelector('[data-pmv2-root]')||{}).dataset?.route || null,
      animations:document.getAnimations({subtree:true}).map((a)=>{
        const timing=a.effect && a.effect.getTiming ? a.effect.getTiming() : {};
        return {current:a.currentTime,duration:timing.duration,delay:timing.delay,iterations:timing.iterations,playState:a.playState,pseudo:a.effect && a.effect.pseudoElement || null,target:a.effect && a.effect.target ? String(a.effect.target.className || a.effect.target.tagName || '') : ''};
      }),
      rootMotion:(()=>{const r=document.querySelector('[data-pmv2-root]');return r?{cause:r.dataset.motionCause,direction:r.dataset.motionDirection}:null;})(),
    })""")


def capture_motion_sequence(page: Page, out_dir: Path, stem: str, seq: str, action_js: str, *, width: int=1280, setup_js: str|None=None, reduced: bool=False) -> dict[str, Any]:
    page.set_viewport_size({"width":width,"height":HEIGHT})
    page.evaluate("(reduced) => document.documentElement.setAttribute('data-motion', reduced ? 'reduced' : 'full')",reduced)
    if setup_js:
        page.evaluate(setup_js)
        page.wait_for_timeout(700 if not reduced else 30)
    # Capture a stable origin frame before dispatching the action. Screenshot
    # APIs can otherwise sample the compositor exactly between old/new View
    # Transition snapshots and manufacture a black boundary frame that a user
    # never sees. The remaining samples begin at the first useful painted
    # transition frame and continue through settled state.
    records=[]
    before_path=out_dir/stem/"motion"/f"{safe_name(seq)}--before.jpg"
    screenshot(page,before_path,allow_animations=True)
    records.append({"ms":-1,"phase":"before","path":str(before_path),"animation":animation_snapshot(page),"metrics":page.evaluate(LIGHT_METRICS_JS)})
    times=[40,100,180,280,460,720]
    page.evaluate(action_js)
    last=0
    for ms in times:
        if ms>last: page.wait_for_timeout(ms-last)
        last=ms
        path=out_dir/stem/"motion"/f"{safe_name(seq)}--{ms:03d}ms.jpg"
        screenshot(page,path,allow_animations=True)
        records.append({"ms":ms,"phase":"after","path":str(path),"animation":animation_snapshot(page),"metrics":page.evaluate(LIGHT_METRICS_JS)})
    return {"sequence":seq,"width":width,"reduced":reduced,"frames":records}


def run_motion(page: Page, hub_port: int, stem: str, out_dir: Path) -> dict[str, Any]:
    open_concept(page,hub_port,stem,1280,reduced=False)
    sequences=[]
    # Home -> domain (forward)
    reset_route(page,{"name":"home"}); page.evaluate("() => document.documentElement.setAttribute('data-motion','full')"); page.wait_for_timeout(650)
    sequences.append(capture_motion_sequence(page,out_dir,stem,"home-to-domain","() => window.__pmv2App.openPage('ai','accounts')"))
    # Domain -> manager (forward)
    reset_route(page,{"name":"domain","domain":"ai","page":"accounts","section":"accounts"}); page.evaluate("() => document.documentElement.setAttribute('data-motion','full')"); page.wait_for_timeout(650)
    sequences.append(capture_motion_sequence(page,out_dir,stem,"domain-to-manager","() => window.__pmv2App.openManager('providers',{object:'anthropic',page:'overview'})"))
    # Manager tab lateral.
    reset_route(page,{"name":"manager","domain":"ai","manager":"providers","page":"overview","object":"anthropic"}); page.evaluate("() => document.documentElement.setAttribute('data-motion','full')"); page.wait_for_timeout(650)
    sequences.append(capture_motion_sequence(page,out_dir,stem,"manager-tab","() => window.__pmv2App.navigate({name:'manager',domain:'ai',manager:'providers',page:'installations',object:'anthropic'},{cause:'tab',direction:'lateral'})"))
    # Object selection/detail transfer.
    reset_route(page,{"name":"manager","domain":"ai","manager":"providers","page":"overview","object":"anthropic"}); page.evaluate("() => document.documentElement.setAttribute('data-motion','full')"); page.wait_for_timeout(650)
    sequences.append(capture_motion_sequence(page,out_dir,stem,"manager-object","() => window.__pmv2App.navigate({name:'manager',domain:'ai',manager:'providers',page:'overview',object:'openai'},{cause:'object',direction:'lateral'})"))
    # Search dropdown.
    reset_route(page,{"name":"home"}); page.evaluate("() => document.documentElement.setAttribute('data-motion','full')"); page.wait_for_timeout(650)
    sequences.append(capture_motion_sequence(page,out_dir,stem,"search-dropdown","() => window.__pmv2App.setQuery('OpenAI')"))
    # Search result landing and locator.
    reset_route(page,{"name":"home"}); page.evaluate("() => {document.documentElement.setAttribute('data-motion','full');window.__pmv2App.setQuery('Theme');}"); page.wait_for_timeout(350)
    result_id=page.evaluate("() => (window.__pmv2App.results||[])[0] && window.__pmv2App.results[0].id")
    if result_id:
        sequences.append(capture_motion_sequence(page,out_dir,stem,"search-result-landing",f"() => window.__pmv2App.pickResult({json.dumps(result_id)})"))
        # Back must reverse and restore query.
        sequences.append(capture_motion_sequence(page,out_dir,stem,"back-to-query","() => window.__pmv2App.back()"))
    # Details drawer.
    reset_route(page,{"name":"all"}); page.evaluate("() => document.documentElement.setAttribute('data-motion','full')"); page.wait_for_timeout(650)
    first_id=page.evaluate("() => window.PMv2.productSettingIds[0]")
    sequences.append(capture_motion_sequence(page,out_dir,stem,"details-drawer",f"() => window.__pmv2App.openDetails({json.dumps(first_id)})"))
    sequences.append(capture_motion_sequence(page,out_dir,stem,"details-drawer-close","() => window.__pmv2App.closeDetails()"))
    # Copy apply -> receipt.
    reset_route(page,{"name":"home"}); page.evaluate("() => {document.documentElement.setAttribute('data-motion','full'); const a=window.__pmv2App;a.openCopy();a.copy.sourceId='northwind-docs';a.copy.step='preview';a.paint();}"); page.wait_for_timeout(650)
    sequences.append(capture_motion_sequence(page,out_dir,stem,"copy-apply-receipt","() => window.__pmv2App.applyCopy()"))
    page.wait_for_timeout(420)
    sequences.append(capture_motion_sequence(page,out_dir,stem,"copy-rollback","() => window.__pmv2App.rollbackCopy()"))
    # A fresh page is used for viewport changes after View Transition capture.
    # Reusing a page with an active compositor snapshot can make Chromium wait
    # indefinitely during navigation even though the transition is already
    # visually settled. Fresh pages keep the evidence deterministic.
    narrow_page = page.context.new_page()
    try:
        open_concept(narrow_page,hub_port,stem,760,reduced=False)
        reset_route(narrow_page,{"name":"home"}); narrow_page.evaluate("() => document.documentElement.setAttribute('data-motion','full')"); narrow_page.wait_for_timeout(650)
        sequences.append(capture_motion_sequence(narrow_page,out_dir,stem,"narrow-home-to-manager","() => window.__pmv2App.openManager('providers',{object:'anthropic',page:'overview'})",width=760))
    finally:
        narrow_page.close()
    # Reduced motion route and drawer; all animations must be effectively zero-duration.
    reduced_page = page.context.new_page()
    try:
        open_concept(reduced_page,hub_port,stem,1280,reduced=True)
        reset_route(reduced_page,{"name":"home"})
        sequences.append(capture_motion_sequence(reduced_page,out_dir,stem,"reduced-home-to-domain","() => window.__pmv2App.openPage('ai','accounts')",reduced=True))
        reset_route(reduced_page,{"name":"all"})
        sequences.append(capture_motion_sequence(reduced_page,out_dir,stem,"reduced-details-drawer",f"() => window.__pmv2App.openDetails({json.dumps(first_id)})",reduced=True))
    finally:
        reduced_page.close()
    return {"stem":stem,"sequences":sequences}


def run_interactions(page: Page, hub_port: int, stem: str) -> dict[str, Any]:
    inv=open_concept(page,hub_port,stem,1280,reduced=True)
    cases=[]
    def add(name:str, ok:bool, detail:Any=None): cases.append({"name":name,"pass":bool(ok),"detail":detail})
    # Back/Close/search contract.
    reset_route(page,{"name":"home"}); page.evaluate("() => window.__pmv2App.openPage('ai','accounts')"); page.wait_for_timeout(30)
    page.evaluate("() => window.__pmv2App.openManager('providers',{object:'anthropic',page:'overview'})"); page.wait_for_timeout(30)
    before=page.evaluate("() => window.__pmv2App.route")
    page.keyboard.press("Escape"); page.wait_for_timeout(30); after=page.evaluate("() => window.__pmv2App.route")
    add("escape-moves-one-level",before.get("name")=="manager" and after.get("name")=="domain",{"before":before,"after":after})
    route_before_close=page.evaluate("() => JSON.stringify(window.__pmv2App.route)")
    toast_before=page.locator('.pmv2-toast').count()
    page.locator('[data-act="close"]').first.click(); page.wait_for_timeout(40)
    toast_texts=page.locator('.pmv2-toast').all_inner_texts()
    route_after_close=page.evaluate("() => JSON.stringify(window.__pmv2App.route)")
    add("close-settings-origin-receipt",
        page.locator('.pmv2-toast').count()>toast_before
        and any("Close Settings returns to the" in t and "simulated" in t for t in toast_texts)
        and route_after_close==route_before_close,
        {"beforeCount":toast_before,"texts":toast_texts,"routeUnchanged":route_after_close==route_before_close})
    # Search exact result stable ID and query restoration.
    reset_route(page,{"name":"home"}); page.fill('[data-search]','Theme'); page.wait_for_timeout(80)
    result_locator=page.locator('[role="listbox"] [data-act="pick"][data-id]')
    ids=result_locator.evaluate_all("els => els.map(e=>e.dataset.id)")
    stable=bool(ids) and len(ids)==len(set(ids))
    if ids:
        page.locator(f'[role="listbox"] [data-act="pick"][data-id="{ids[0]}"]').first.click();page.wait_for_timeout(80)
        dest=page.evaluate("() => window.__pmv2App.route")
        focused=page.evaluate("() => {const a=document.activeElement;return !!(a && (a.dataset.rowId || a.dataset.id || a.matches('input,select,textarea,button')));}")
        highlighted=page.locator('.pmv2-hl,[data-highlight="true"]').count()>0
        page.locator('[data-act="back"]').first.click();page.wait_for_timeout(50)
        restored=page.input_value('[data-search]')
    else: dest={}; focused=highlighted=False; restored=None
    add("search-stable-id-exact-route",stable and bool(ids) and dest.get("name")!="home" and restored=="Theme",{"ids":ids[:8],"dest":dest,"focused":focused,"highlighted":highlighted,"restored":restored})
    # All product IDs indexed/routable.
    idx=page.evaluate("() => {const P=window.PMv2;const miss=P.productSettingIds.filter(id=>!P.getResult('setting:'+id));return {count:P.productSettingIds.length,missing:miss.slice(0,20)};}")
    add("all-inventory-ids-indexed",idx["count"]==828 and not idx["missing"],idx)
    # Lazy hydration.
    reset_route(page,{"name":"home"}); hydrated0=page.evaluate("() => Object.keys(window.__pmv2App.hydrated).length")
    page.evaluate("() => window.__pmv2App.openManager('providers')"); page.wait_for_timeout(30); hydrated1=page.evaluate("() => Object.keys(window.__pmv2App.hydrated)")
    page.evaluate("() => window.__pmv2App.back()"); page.wait_for_timeout(30); hydrated2=page.evaluate("() => Object.keys(window.__pmv2App.hydrated)")
    add("lazy-hydration-disposal",hydrated0==0 and hydrated1==['providers'] and not hydrated2,{"home":hydrated0,"manager":hydrated1,"after":hydrated2})
    # Copy transaction and independence copy.
    reset_route(page,{"name":"home"}); before_vals=page.evaluate("() => JSON.stringify(window.__pmv2App.values)")
    page.evaluate("() => {const a=window.__pmv2App;a.openCopy();a.copy.sourceId='northwind-docs';a.copy.step='preview';a.applyCopy();}");page.wait_for_timeout(450)
    copy=page.evaluate("() => ({step:window.__pmv2App.copy.step,receipt:window.__pmv2App.copy.receipt,project:window.__pmv2App.project,values:JSON.stringify(window.__pmv2App.values)})")
    page.evaluate("() => window.__pmv2App.rollbackCopy()"); page.wait_for_timeout(30)
    rolled=page.evaluate("() => ({step:window.__pmv2App.copy.step,values:JSON.stringify(window.__pmv2App.values)})")
    add("copy-atomic-verified-receipt-rollback",copy["step"]=="receipt" and bool(copy["receipt"]) and rolled["step"]=="rolled_back" and rolled["values"]==before_vals,{"receipt":copy["receipt"],"rolled":rolled["step"]})
    # Project-only text and forbidden scope controls.
    txt=page.locator('[data-pmv2-root]').inner_text().lower(); html=page.locator('[data-pmv2-root]').inner_html().lower()
    forbidden=["global vs project","apply to every project","keep copied settings synchronized","inherit from global","scope selector"]
    add("project-only-no-inheritance-controls",not any(x in txt for x in forbidden) and "project" in txt,{"forbiddenFound":[x for x in forbidden if x in txt]})
    # No foreign renderer.
    add("concept-local-no-iframe-or-cross-concept",page.locator('iframe').count()==0 and not re.search(r'concept-0[1-4]',html))
    # Reduced motion effective.
    page.evaluate("() => document.documentElement.setAttribute('data-motion','reduced')"); reset_route(page,{"name":"home"});page.evaluate("() => window.__pmv2App.openPage('ai','accounts')");page.wait_for_timeout(30)
    anim=page.evaluate("() => document.getAnimations({subtree:true}).map(a=>({d:a.effect.getTiming().duration,delay:a.effect.getTiming().delay,play:a.playState}))")
    add("reduced-motion-zero-material-movement",all((x.get('d') in (0,.001,'auto') or (isinstance(x.get('d'),(int,float)) and x['d']<=1)) and (x.get('delay') or 0)<=1 for x in anim),anim[:20])
    return {"stem":stem,"cases":cases,"pass":all(c["pass"] for c in cases),"inventory":inv}


def summarize_issues(records: Iterable[dict[str, Any]]) -> dict[str, Any]:
    summary={"records":0,"document_overflow":0,"root_overflow":0,"clipped":0,"edge_controls":0,"overlap":0,"long_lines":0,"missing_contract":0,"foreign":0,"fatal":0}
    examples={k:[] for k in summary if k!="records"}
    for rec in records:
        summary["records"]+=1; m=rec.get("metrics") or {}
        def hit(key:str, condition:bool, detail:Any=None):
            if condition:
                summary[key]+=1
                if len(examples[key])<20: examples[key].append({"stem":rec.get("stem"),"width":rec.get("width"),"theme":rec.get("theme"),"surface":rec.get("surface"),"key":rec.get("key"),"position":rec.get("position"),"path":rec.get("path"),"detail":detail})
        hit("fatal",bool(m.get("fatal")),m.get("fatal"))
        hit("document_overflow",(m.get("documentOverflowX") or 0)>1,m.get("documentOverflowX"))
        hit("root_overflow",(m.get("rootOverflowX") or 0)>1,m.get("rootOverflowX"))
        hit("clipped",bool(m.get("clips")),(m.get("clips") or [])[:3])
        hit("edge_controls",bool(m.get("edgeControls")),(m.get("edgeControls") or [])[:3])
        hit("overlap",bool(m.get("overlaps")),(m.get("overlaps") or [])[:3])
        hit("long_lines",bool(m.get("longLines")),(m.get("longLines") or [])[:3])
        c=m.get("contracts") or {}; hit("missing_contract",not(c.get("hasSearch") and c.get("hasClose") and c.get("hasBack") and c.get("searchInViewport")),c)
        hit("foreign",bool(m.get("foreign")),m.get("foreign"))
    return {"summary":summary,"examples":examples}


def main() -> int:
    parser=argparse.ArgumentParser()
    parser.add_argument("--phase",choices=["routes","matrix","motion","interactions","all"],default="all")
    parser.add_argument("--concept",action="append",choices=STEMS,help="repeat to limit concepts")
    parser.add_argument("--output",type=Path,required=True)
    parser.add_argument("--chromium",default=os.environ.get("PM_SETTINGS_CHROMIUM_BINARY","/usr/bin/chromium"))
    parser.add_argument("--route-start",type=int,default=0)
    parser.add_argument("--route-end",type=int,default=None)
    parser.add_argument("--route-width",type=int,action="append",choices=ROUTE_WIDTHS)
    parser.add_argument("--route-misc-mode",choices=["auto","skip","only"],default="auto")
    parser.add_argument("--matrix-width",type=int,action="append",choices=WIDTHS,
                        help="repeat to limit matrix widths; useful for bounded browser waves")
    parser.add_argument("--matrix-theme",action="append",choices=THEMES,
                        help="repeat to limit matrix themes; useful for bounded compositor waves")
    args=parser.parse_args()
    concepts=args.concept or STEMS
    out=args.output.resolve(); out.mkdir(parents=True,exist_ok=True)
    hub=start_hub()
    final={"schema_id":"pm.settings_exhaustive_visual_motion_audit.v2","started_at":time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),"phase":args.phase,"concepts":{},"hub":{"port":hub.port},"chromium":args.chromium}
    profile=Path(tempfile.mkdtemp(prefix="pm-settings-exhaustive-profile-"))
    try:
        with sync_playwright() as p:
            context=p.chromium.launch_persistent_context(user_data_dir=str(profile),headless=True,executable_path=args.chromium,args=["--no-sandbox","--disable-gpu","--no-first-run","--no-default-browser-check","--hide-scrollbars=false"],viewport={"width":1280,"height":HEIGHT})
            bootstrap_page=context.pages[0] if context.pages else None
            if bootstrap_page is not None:
                bootstrap_page.close()
            for stem in concepts:
                print(f"=== {stem} / {args.phase} ===",flush=True)
                (out / stem).mkdir(parents=True, exist_ok=True)
                concept={}
                # Every concept receives a fresh page. View Transition compositor
                # state and CDP screenshot sessions are intentionally not reused
                # across concept documents.
                page=context.new_page()
                try:
                    if args.phase in ("routes","all"):
                        concept["routes"]=run_routes(page,hub.port,stem,out,route_start=args.route_start,route_end=args.route_end,route_widths=args.route_width,misc_mode=args.route_misc_mode)
                        (out/stem/"routes-report.json").write_text(json.dumps(concept["routes"],indent=2),encoding="utf-8")
                    if args.phase in ("matrix","all"):
                        concept["matrix"]=run_matrix(page,hub.port,stem,out,
                                                      matrix_widths=args.matrix_width,
                                                      matrix_themes=args.matrix_theme)
                        (out/stem/"matrix-report.json").write_text(json.dumps(concept["matrix"],indent=2),encoding="utf-8")
                    if args.phase in ("motion","all"):
                        concept["motion"]=run_motion(page,hub.port,stem,out)
                        (out/stem/"motion-report.json").write_text(json.dumps(concept["motion"],indent=2),encoding="utf-8")
                    if args.phase in ("interactions","all"):
                        concept["interactions"]=run_interactions(page,hub.port,stem)
                        (out/stem/"interactions-report.json").write_text(json.dumps(concept["interactions"],indent=2),encoding="utf-8")
                finally:
                    page.close()
                recs=[]
                if "routes" in concept: recs.extend(concept["routes"]["records"])
                if "matrix" in concept: recs.extend(concept["matrix"]["records"])
                concept["issue_summary"]=summarize_issues(recs)
                final["concepts"][stem]=concept
                (out/"partial-report.json").write_text(json.dumps(final,indent=2),encoding="utf-8")
            context.close()
    finally:
        hub.close(); shutil.rmtree(profile,ignore_errors=True)
    final["completed_at"]=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())
    all_records=[]
    for c in final["concepts"].values():
        if "routes" in c: all_records.extend(c["routes"]["records"])
        if "matrix" in c: all_records.extend(c["matrix"]["records"])
    final["issue_summary"]=summarize_issues(all_records)
    final["interaction_pass"]=all(c.get("interactions",{}).get("pass",True) for c in final["concepts"].values())
    report_path=out/"EXHAUSTIVE_VISUAL_MOTION_AUDIT_RAW.json"
    report_path.write_text(json.dumps(final,indent=2),encoding="utf-8")
    print(json.dumps({"report":str(report_path),"issues":final["issue_summary"]["summary"],"interaction_pass":final["interaction_pass"]},indent=2))
    return 0

if __name__=="__main__":
    raise SystemExit(main())
