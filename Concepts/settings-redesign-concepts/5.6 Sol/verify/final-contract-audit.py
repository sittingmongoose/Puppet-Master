#!/usr/bin/env python3
"""Fast current-state contract audit for Settings concepts 05–11.

This complements the exhaustive visual/motion capture with exact functional
checks. It uses an OS-assigned ConceptHub port, an isolated Chromium profile,
and writes only the final JSON evidence into the model folder.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from typing import Any
from urllib.request import urlopen

from playwright.sync_api import sync_playwright

MODEL = Path(__file__).resolve().parents[1]
REPO = Path(__file__).resolve().parents[4]
HUB = REPO / "Concepts" / "ConceptHub" / "server.py"
BASE_PATH = "/concepts/settings-redesign-concepts/5.6%20Sol"
OUT = MODEL / "_seven" / "FINAL_CONTRACT_AUDIT.json"
STEMS = [
    "concept-05-directory-take-1",
    "concept-06-directory-take-2",
    "concept-07-compendium-workspace",
    "concept-08-directory-take-3",
    "concept-09-tome-tabs",
    "concept-10-command-suite",
    "concept-11-tabbed-organizer",
]
SEARCH_QUERIES = ["Theme", "Default", "Copy", "Ollama", "OpenAI", "Provider", "unavailable", "thme"]
PROHIBITED_SCOPE_CONTROLS = [
    "global vs project", "apply to every project", "project inheritance",
    "link projects' settings", "keep copied settings synchronized",
    "reusable settings profile", "goal editing scope", "host editing scope",
]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def start_hub() -> tuple[subprocess.Popen[str], int, Path]:
    log = Path(tempfile.mkstemp(prefix="pm-final-contract-hub-", suffix=".log")[1])
    fh = log.open("w", encoding="utf-8")
    proc = subprocess.Popen(
        [sys.executable, "-u", str(HUB), "--host", "127.0.0.1", "--port", "0", "--no-browser", "--no-runtime-state"],
        cwd=str(REPO), stdout=fh, stderr=subprocess.STDOUT, text=True,
    )
    port = None
    deadline = time.time() + 20
    while time.time() < deadline and port is None:
        text = log.read_text(encoding="utf-8", errors="replace") if log.exists() else ""
        hit = re.search(r"http://127\.0\.0\.1:(\d+)/", text)
        if hit:
            port = int(hit.group(1))
            break
        if proc.poll() is not None:
            break
        time.sleep(0.05)
    if not port:
        proc.terminate()
        raise RuntimeError(f"ConceptHub did not start. Log: {log.read_text(errors='replace')}")
    probe = f"http://127.0.0.1:{port}{BASE_PATH}/{STEMS[0]}.html"
    for _ in range(80):
        try:
            with urlopen(probe, timeout=1) as response:
                if response.status == 200:
                    return proc, port, log
        except Exception:
            time.sleep(0.08)
    proc.terminate()
    raise RuntimeError("ConceptHub started but the model page was not reachable")


def stop(proc: subprocess.Popen[str] | None) -> None:
    if not proc:
        return
    try:
        proc.terminate()
        proc.wait(timeout=3)
    except Exception:
        try:
            proc.kill()
        except Exception:
            pass


def frozen_check() -> dict[str, Any]:
    doc = json.loads((MODEL / "_seven" / "frozen-baseline.json").read_text(encoding="utf-8"))
    mismatches = []
    for rel, expected in doc["hashes"].items():
        path = MODEL / rel
        actual = sha256(path) if path.exists() else None
        if actual != expected:
            mismatches.append({"path": rel, "expected": expected, "actual": actual})
    return {"pass": not mismatches, "checked": len(doc["hashes"]), "mismatches": mismatches}


RESET_JS = """() => {
  const a=window.__pmv2App;
  a.stack=[]; a.route={name:'home'}; a.query=''; a.results=[]; a.searchOpen=false;
  a.selectedResultId=null; a.detailsId=null; a.paint();
  document.documentElement.setAttribute('data-motion','reduced');
}"""

INVENTORY_JS = """() => {
  const P=window.PMv2, a=window.__pmv2App, asserted=P.assertIndexComplete();
  const ids=P.productSettingIds||[];
  const defaultHits=P.search('Theme')||[];
  return {
    settings:a.productSettingCount, categories:(P.categories||[]).length,
    productIndex:a.indexCount, synthetic:a.syntheticCount,
    missing:(asserted.missingSettingIds||[]), assertedOk:asserted.missingSettingIds.length===0,
    syntheticInDefault:defaultHits.some(x=>x.synthetic||String(x.id||'').startsWith('synthetic:')),
    managerCount:(P.managers||[]).length,
    deferredCount:(P.deferred||[]).length,
    managerTabs:(P.managers||[]).reduce((n,m)=>n+(m.tabs||[]).length,0),
    managerObjects:(P.managers||[]).reduce((n,m)=>n+(a.objectsFor(m.id)||[]).length,0),
    demoStates:(P.demoStates||[]).slice(),
  };
}"""

SEARCH_MATRIX_JS = """(cases) => {
  const a=window.__pmv2App;
  const norm=v=>v==null?null:v;
  const reset=()=>{a.stack=[];a.route={name:'home'};a.query='';a.results=[];a.searchOpen=false;a.selectedResultId=null;a.detailsId=null;a.paint();};
  return cases.map(c=>{
    reset(); a.setQuery(c.query);
    const entry=(a.results||[]).find(x=>x.id===c.result_id);
    const rendered=!!document.querySelector('[data-act="pick"][data-id="'+CSS.escape(c.result_id)+'"]');
    a.pickResult(c.result_id);
    const route=JSON.parse(JSON.stringify(a.route||{}));
    const expected=c.expected||c.dest||{};
    const keys=['name','domain','page','manager','object','section','row'];
    const routeExact=keys.every(k=>{
      if(!(k in expected)) return true;
      const actual=(k==='section' && route[k]==null)?route.page:route[k];
      return norm(actual)===norm(expected[k]);
    });
    const row=expected.highlight_data_row_id||expected.row||c.expected_highlight_data_row_id;
    const selectedObject=row && !!document.querySelector('[data-act="object"][data-id="'+CSS.escape(String(row))+'"][aria-current="true"],[data-id="'+CSS.escape(String(row))+'"][aria-selected="true"]');
    const highlighted=!row || !!document.querySelector('[data-row-id="'+CSS.escape(String(row))+'"]') || selectedObject;
    a.back();
    return {query:c.query,result_id:c.result_id,found:!!entry,rendered,route,expected,routeExact,highlighted,restored:a.query,pass:!!entry&&rendered&&routeExact&&highlighted&&a.query===c.query,displayedPath:entry&&entry.path};
  });
}"""

RENDERED_SEARCH_JS = """(queries) => {
  const a=window.__pmv2App;
  const reset=()=>{a.stack=[];a.route={name:'home'};a.query='';a.results=[];a.searchOpen=false;a.selectedResultId=null;a.detailsId=null;a.paint();};
  return queries.map(q=>{
    reset();a.setQuery(q);
    const listbox=document.querySelector('[role="listbox"]');
    const ids=[...(listbox?listbox.querySelectorAll('[data-act="pick"][data-id]'):[])].map(x=>x.getAttribute('data-id'));
    const unique=(new Set(ids)).size===ids.length;
    const rows=[];
    ids.forEach(id=>{
      a.pickResult(id);const route=JSON.parse(JSON.stringify(a.route||{}));
      const leftHome=route.name!=='home';
      const highlight=!!document.querySelector('.pmv2-hl,[data-highlight="true"],[data-row-id]');
      a.back();rows.push({id,route,restored:a.query,pass:(leftHome||highlight)&&a.query===q});
    });
    return {query:q,count:ids.length,unique,rows,pass:ids.length>0&&unique&&rows.every(x=>x.pass)};
  });
}"""

MANAGER_JS = """() => {
  const P=window.PMv2,a=window.__pmv2App;
  const reset=()=>{a.stack=[];a.route={name:'home'};a.query='';a.results=[];a.searchOpen=false;a.selectedResultId=null;a.detailsId=null;a.paint();};
  const shell=()=>({search:!!document.querySelector('[data-search]'),back:!!document.querySelector('[data-act="back"]'),close:!!document.querySelector('[data-act="close"]'),iframe:document.querySelectorAll('iframe').length,foreign:[...document.querySelectorAll('a[href],*[src]')].map(x=>x.getAttribute('href')||x.getAttribute('src')||'').filter(x=>/concept-0[1-4](?!\\d)/.test(x))});
  const managers=[];
  (P.managers||[]).forEach(m=>{
    reset();a.openManager(m.id);const first=shell();const tabRows=[];
    (m.tabs||[]).forEach(tab=>{a.navigate({name:'manager',domain:m.domain,manager:m.id,page:tab,object:(a.objectsFor(m.id)[0]||{}).id},{replace:true,cause:'tab',direction:'lateral',stage:false});tabRows.push({tab,routePage:a.route.page,routeManager:a.route.manager,pass:a.route.page===tab&&a.route.manager===m.id});});
    const objectRows=[];
    (a.objectsFor(m.id)||[]).forEach(o=>{a.navigate({name:'manager',domain:m.domain,manager:m.id,page:(m.tabs||[])[0]||'overview',object:o.id},{replace:true,cause:'object',direction:'lateral',stage:false});objectRows.push({object:o.id,routeObject:a.route.object,routeManager:a.route.manager,pass:a.route.object===o.id&&a.route.manager===m.id});});
    a.back();
    const pass=first.search&&first.back&&first.close&&!first.iframe&&!first.foreign.length&&tabRows.every(x=>x.pass)&&objectRows.every(x=>x.pass)&&a.route.name==='home';
    managers.push({id:m.id,family:m.family,tabs:tabRows,objects:objectRows,shell:first,backRoute:a.route.name,pass});
  });
  const deferred=[];
  (P.deferred||[]).forEach(d=>{reset();a.openDeferred(d.id);const s=shell();const route=JSON.parse(JSON.stringify(a.route));a.back();deferred.push({id:d.id,route,shell:s,backRoute:a.route.name,pass:route.name==='deferred'&&route.deferred===d.id&&s.search&&s.back&&s.close&&!s.iframe&&!s.foreign.length&&a.route.name==='home'});});
  return {managers,deferred,pass:managers.every(x=>x.pass)&&deferred.every(x=>x.pass)};
}"""

STATES_JS = """() => {
  const P=window.PMv2,a=window.__pmv2App;
  const flagMap={'loading-cached':'cachedLoading',empty:'empty',offline:'offline',managed:'managed',unavailable:'unavailable','restart-required':'restart','reconnect-required':'reconnect','changed-elsewhere':'changedElsewhere','import-conflict':'importConflict','rollback-complete':'rollbackComplete','usage-unavailable':'usageUnavailable'};
  const reset=()=>{a.stack=[];a.route={name:'home'};a.query='';a.results=[];a.searchOpen=false;a.detailsId=null;Object.keys(a.flags||{}).forEach(k=>a.flags[k]=false);a.paint();};
  return (P.demoStates||[]).map(name=>{
    reset();let error=null;try{a.triggerState(name);}catch(e){error=String(e)}
    const flag=flagMap[name];const visible=(document.body.innerText||'').length>100;
    let semantic=true;
    if(flag) semantic=!!a.flags[flag];
    if(name==='no-search-results') semantic=a.query==='zzzzqx'&&(a.results||[]).length===0;
    if(name==='typo-fuzzy') semantic=a.query==='thme'&&(a.results||[]).length>0;
    if(name==='validation-error') semantic=/theme name|not one of/i.test(document.body.innerText||'');
    if(name==='multi-install') semantic=a.route.name==='manager'&&a.route.page==='installations';
    if(name==='unknown-owner') semantic=a.route.name==='manager'&&a.route.object==='local-ollama';
    if(name==='provider-update') semantic=a.work&&a.work.state==='waiting_user';
    if(name==='verification-failure') semantic=a.work&&a.work.state==='failed';
    return {name,error,route:JSON.parse(JSON.stringify(a.route||{})),query:a.query,work:a.work&&{state:a.work.state,phase:a.work.human_phase},semantic,visible,pass:!error&&semantic&&visible};
  });
}"""

COPY_PROVIDER_JS = """() => {
  const a=window.__pmv2App,P=window.PMv2;
  a.stack=[];a.route={name:'home'};a.query='';a.results=[];a.searchOpen=false;a.paint();
  a.openCopy();a.copy.sourceId='northwind-docs';a.copy.categories=(P.categories||[]).map(c=>c.id);a.copy.step='preview';a.paint();
  const preview=a.copyPreview();
  const previewText=(document.body.innerText||'').toLowerCase();
  const scopeControls=[...document.querySelectorAll('button,label,select,option')].map(x=>(x.innerText||x.textContent||'').trim().toLowerCase());
  const rawSecrets=/\\b(?:sk-|api[_ -]?key\\s*[:=]\\s*)[a-z0-9_-]{12,}/i.test(document.body.innerText||'');
  a.flags.importConflict=true;const conflict=a.copyPreview();a.flags.importConflict=false;
  a.installOfficialCli('local-ollama');
  const installWork=JSON.parse(JSON.stringify(a.work||{}));
  a.openManager('providers',{object:'local-ollama',page:'setup',row:'install-official'});
  const providerText=(document.body.innerText||'').toLowerCase();
  return {preview,conflictCount:(conflict.conflicts||[]).length,previewText,scopeControls,rawSecrets,installWork,providerText};
}"""

HYDRATION_JS = """() => {
  const a=window.__pmv2App;
  a.stack=[];a.route={name:'home'};a.query='';a.results=[];a.searchOpen=false;a.hydrated={};a.paint();
  const home=Object.keys(a.hydrated).length;
  a.setQuery('Theme');const afterSearch=Object.keys(a.hydrated).length;const bounded=(a.results||[]).length>0&&(a.results||[]).length<=24;
  a.searchOpen=false;a.query='';a.results=[];a.paint();a.openManager('providers');const manager=Object.keys(a.hydrated).slice();a.back();const afterBack=Object.keys(a.hydrated).slice();
  a.openAll();const mounted=document.querySelectorAll('[data-act="row"],[data-row-id]').length;const virt=!!document.querySelector('[data-all-list],[data-virt]');
  return {home,afterSearch,bounded,manager,afterBack,mounted,virt,pass:home===0&&afterSearch===0&&bounded&&manager.length===1&&afterBack.length===0&&virt&&mounted>0&&mounted<828};
}"""


def run() -> int:
    report: dict[str, Any] = {
        "schema_id": "pm.settings_final_contract_audit.v1",
        "executed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "model_folder": str(MODEL),
        "concepts": {},
        "failures": [],
        "frozen": frozen_check(),
    }
    if not report["frozen"]["pass"]:
        report["failures"].append({"kind": "frozen", "detail": report["frozen"]["mismatches"]})
    hub = None
    log = None
    profile = Path(tempfile.mkdtemp(prefix="pm-final-contract-profile-"))
    try:
        hub, port, log = start_hub()
        report["concept_hub"] = {"port_mode": "os_assigned", "runtime_state": False}
        with sync_playwright() as pw:
            context = pw.chromium.launch_persistent_context(
                user_data_dir=str(profile), executable_path=os.environ.get("PM_SETTINGS_CHROMIUM_BINARY", "/usr/bin/chromium"),
                headless=True, args=["--no-sandbox", "--disable-gpu", "--no-first-run", "--no-default-browser-check"],
                viewport={"width": 1280, "height": 900},
            )
            if context.pages:
                context.pages[0].close()
            for stem in STEMS:
                page = context.new_page()
                errors: list[str] = []
                page.on("pageerror", lambda exc, e=errors: e.append(str(exc)[:500]))
                page.on("console", lambda msg, e=errors: e.append(msg.text[:500]) if msg.type == "error" else None)
                page.goto(f"http://127.0.0.1:{port}{BASE_PATH}/{stem}.html", wait_until="domcontentloaded", timeout=30_000)
                page.wait_for_function("() => window.__pmv2App && window.PMv2", timeout=20_000)
                page.evaluate("() => {sessionStorage.clear();document.documentElement.setAttribute('data-motion','reduced');}")
                page.reload(wait_until="domcontentloaded")
                page.wait_for_function("() => window.__pmv2App && window.PMv2", timeout=20_000)
                page.evaluate("() => document.documentElement.setAttribute('data-motion','reduced')")

                inventory = page.evaluate(INVENTORY_JS)
                matrix_doc = json.loads((MODEL / stem / "search-route-matrix.json").read_text(encoding="utf-8"))
                search_matrix = page.evaluate(SEARCH_MATRIX_JS, matrix_doc.get("cases", []))
                rendered_search = page.evaluate(RENDERED_SEARCH_JS, SEARCH_QUERIES)
                manager = page.evaluate(MANAGER_JS)
                states = page.evaluate(STATES_JS)
                copy_provider = page.evaluate(COPY_PROVIDER_JS)

                # Complete the copy transaction with the real delayed receipt, then rollback.
                page.evaluate("""() => {const a=window.__pmv2App;a.stack=[];a.route={name:'home'};a.paint();a.openCopy();a.copy.sourceId='northwind-docs';a.copy.categories=(window.PMv2.categories||[]).map(c=>c.id);a.copy.step='preview';a.applyCopy();}""")
                page.wait_for_timeout(480)
                copy_receipt = page.evaluate("() => ({step:window.__pmv2App.copy.step,receipt:window.__pmv2App.copy.receipt,work:window.__pmv2App.work})")
                page.evaluate("() => window.__pmv2App.rollbackCopy()")
                copy_rollback = page.evaluate("() => ({step:window.__pmv2App.copy.step,work:window.__pmv2App.work})")

                # Persistence is intentionally session-local in the deterministic concept simulator.
                page.evaluate("() => window.__pmv2App.setValue('general.visual.theme','Glass Light')")
                page.reload(wait_until="domcontentloaded")
                page.wait_for_function("() => window.__pmv2App")
                persisted = page.evaluate("() => window.__pmv2App.values['general.visual.theme']")
                page.evaluate("() => {sessionStorage.clear();}")
                page.reload(wait_until="domcontentloaded")
                page.wait_for_function("() => window.__pmv2App")
                page.evaluate("() => document.documentElement.setAttribute('data-motion','reduced')")
                hydration = page.evaluate(HYDRATION_JS)

                # Details, Back, Escape, Close, and reduced-motion semantics.
                page.evaluate(RESET_JS)
                page.evaluate("() => window.__pmv2App.openManager('providers',{object:'anthropic',page:'overview'})")
                before_escape = page.evaluate("() => window.__pmv2App.route.name")
                page.keyboard.press("Escape")
                after_escape = page.evaluate("() => window.__pmv2App.route.name")
                page.evaluate("() => window.__pmv2App.openManager('providers',{object:'anthropic',page:'overview'})")
                page.locator('[data-act="close"]').first.click()
                close_text = page.evaluate("() => document.body.innerText")
                page.evaluate(RESET_JS)
                first_id = page.evaluate("() => (window.PMv2.productSettingIds||[])[0]")
                page.evaluate("id => {window.__pmv2App.openAll();window.__pmv2App.openDetails(id);}", first_id)
                details_ok = page.locator("[data-details-drawer]").count() == 1
                page.evaluate(RESET_JS)
                page.evaluate("() => window.__pmv2App.openPage('ai','accounts')")
                page.wait_for_timeout(5)
                reduced_animations = page.evaluate("() => document.getAnimations({subtree:true}).map(a=>({duration:Number(a.effect?.getTiming?.().duration||0),delay:Number(a.effect?.getTiming?.().delay||0)}))")
                reduced_ok = all((row["duration"] <= 1 and row["delay"] <= 1) for row in reduced_animations)

                expected_inventory = (
                    inventory["settings"] == 828 and inventory["categories"] == 12 and inventory["productIndex"] == 1007
                    and inventory["synthetic"] >= 2000 and inventory["assertedOk"] and not inventory["missing"]
                    and not inventory["syntheticInDefault"] and inventory["managerCount"] == 38
                    and inventory["deferredCount"] == 9 and inventory["managerTabs"] == 102 and inventory["managerObjects"] == 78
                    and len(inventory["demoStates"]) == 18
                )
                scope_hit = [x for x in copy_provider["scopeControls"] if any(term in x for term in PROHIBITED_SCOPE_CONTROLS)]
                preview = copy_provider["preview"] or {}
                copy_preview_ok = (
                    preview.get("projectOnly") is True and preview.get("independent") is True and preview.get("secretsNeverCopy") is True
                    and preview.get("simulated") is True and all((preview.get("counts") or {}).get(k, 0) >= 1 for k in ("additions", "replacements", "unchanged", "unavailable", "conflicts"))
                    and copy_provider["conflictCount"] >= 2 and not copy_provider["rawSecrets"] and not scope_hit
                    and "no ongoing" in copy_provider["previewText"] and "independent" in copy_provider["previewText"]
                )
                install = copy_provider["installWork"] or {}
                provider_ok = (
                    install.get("state") == "waiting_user" and "official" in str(install.get("wait_reason", "")).lower()
                    and "this pc / native windows" in str(install.get("wait_reason", "")).lower()
                    and "install from official source" in copy_provider["providerText"]
                    and "not bundled" in copy_provider["providerText"] and "separate" in copy_provider["providerText"]
                )
                receipt = copy_receipt.get("receipt") or {}
                copy_apply_ok = (
                    copy_receipt.get("step") == "receipt" and receipt.get("verified") is True and receipt.get("independent") is True
                    and receipt.get("projectOnly") is True and bool(receipt.get("restorePointAt"))
                    and copy_rollback.get("step") == "rolled_back" and (copy_rollback.get("work") or {}).get("state") == "completed"
                )
                concept_pass = all([
                    expected_inventory,
                    all(row["pass"] for row in search_matrix),
                    all(row["pass"] for row in rendered_search),
                    manager["pass"],
                    all(row["pass"] for row in states),
                    copy_preview_ok, copy_apply_ok, provider_ok,
                    persisted == "Glass Light", hydration["pass"],
                    before_escape == "manager", after_escape == "home",
                    "returns to the workspace" in close_text.lower(), details_ok, reduced_ok,
                    not errors,
                ])
                concept = {
                    "pass": concept_pass,
                    "inventory": inventory,
                    "search_matrix": {"total": len(search_matrix), "passed": sum(1 for x in search_matrix if x["pass"]), "failures": [x for x in search_matrix if not x["pass"]]},
                    "rendered_search": {"queries": rendered_search, "total_results": sum(x["count"] for x in rendered_search), "passed_queries": sum(1 for x in rendered_search if x["pass"])},
                    "manager_isolation": {"manager_total": len(manager["managers"]), "manager_passed": sum(1 for x in manager["managers"] if x["pass"]), "deferred_total": len(manager["deferred"]), "deferred_passed": sum(1 for x in manager["deferred"] if x["pass"]), "tab_total": sum(len(x["tabs"]) for x in manager["managers"]), "object_total": sum(len(x["objects"]) for x in manager["managers"]), "failures": [x for x in manager["managers"] + manager["deferred"] if not x["pass"]]},
                    "states": {"total": len(states), "passed": sum(1 for x in states if x["pass"]), "failures": [x for x in states if not x["pass"]]},
                    "copy": {"preview_pass": copy_preview_ok, "apply_receipt_rollback_pass": copy_apply_ok, "receipt": receipt, "rollback": copy_rollback, "scope_control_hits": scope_hit, "raw_secret_visible": copy_provider["rawSecrets"]},
                    "provider_cli": {"pass": provider_ok, "work": install},
                    "persistence": {"pass": persisted == "Glass Light", "restored_value": persisted},
                    "hydration_virtualization": hydration,
                    "navigation": {"escape_pass": before_escape == "manager" and after_escape == "home", "close_pass": "returns to the workspace" in close_text.lower(), "details_pass": details_ok},
                    "reduced_motion": {"pass": reduced_ok, "animations": reduced_animations},
                    "console_errors": errors,
                }
                report["concepts"][stem] = concept
                if not concept_pass:
                    report["failures"].append({"kind": "concept", "stem": stem, "detail": concept})
                page.close()
            context.close()
    finally:
        stop(hub)
        shutil.rmtree(profile, ignore_errors=True)
        if log:
            try:
                log.unlink()
            except OSError:
                pass

    concepts = report["concepts"]
    report["summary"] = {
        "concepts_total": len(concepts),
        "concepts_passed": sum(1 for c in concepts.values() if c["pass"]),
        "search_cases_total": sum(c["search_matrix"]["total"] for c in concepts.values()),
        "search_cases_passed": sum(c["search_matrix"]["passed"] for c in concepts.values()),
        "rendered_search_results_exercised": sum(c["rendered_search"]["total_results"] for c in concepts.values()),
        "manager_routes_total": sum(c["manager_isolation"]["manager_total"] + c["manager_isolation"]["deferred_total"] for c in concepts.values()),
        "manager_routes_passed": sum(c["manager_isolation"]["manager_passed"] + c["manager_isolation"]["deferred_passed"] for c in concepts.values()),
        "manager_tabs_exercised": sum(c["manager_isolation"]["tab_total"] for c in concepts.values()),
        "manager_objects_exercised": sum(c["manager_isolation"]["object_total"] for c in concepts.values()),
        "state_fixtures_total": sum(c["states"]["total"] for c in concepts.values()),
        "state_fixtures_passed": sum(c["states"]["passed"] for c in concepts.values()),
        "frozen_files_checked": report["frozen"]["checked"],
        "frozen_mismatches": len(report["frozen"]["mismatches"]),
    }
    report["status"] = "pass" if not report["failures"] and len(concepts) == 7 else "fail"
    OUT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({"output": str(OUT), "status": report["status"], "summary": report["summary"], "failures": len(report["failures"])}, indent=2))
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(run())
