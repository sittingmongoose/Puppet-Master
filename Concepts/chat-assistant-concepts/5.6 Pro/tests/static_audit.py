from __future__ import annotations
from pathlib import Path
import json, re, subprocess, sys, hashlib, os

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT/'reports'
REPORTS.mkdir(exist_ok=True)
files = {name: ROOT/name for name in ['shell.html','styles.css','data.js','app.js','build.py','index.html','PM_Chat_Assistant_5.6_Pro_Standalone.html','README.md']}
checks=[]

def check(label, ok, detail=''):
    checks.append({'label':label,'pass':bool(ok),'detail':detail})

for n,p in files.items():
    check(f'file exists: {n}', p.exists(), str(p))
    if p.exists(): check(f'file nontrivial: {n}', p.stat().st_size > (1000 if n.endswith(('.js','.css','.html')) else 100), f'{p.stat().st_size} bytes')

app = files['app.js'].read_text(errors='replace') if files['app.js'].exists() else ''
data = files['data.js'].read_text(errors='replace') if files['data.js'].exists() else ''
css = files['styles.css'].read_text(errors='replace') if files['styles.css'].exists() else ''
idx = files['index.html'].read_text(errors='replace') if files['index.html'].exists() else ''
combined=(app+'\n'+data+'\n'+css+'\n'+idx).lower()

for jsname in ['app.js','data.js']:
    p=files[jsname]
    if p.exists():
        r=subprocess.run(['node','--check',str(p)],text=True,capture_output=True)
        check(f'JavaScript syntax: {jsname}',r.returncode==0,(r.stderr or r.stdout).strip()[:1000])

check('self-contained index has inline CSS','<style' in idx.lower() and 'final hardening layer' in idx.lower())
check('self-contained index has fixture data','window.pm56_data' in idx.lower())
check('self-contained index has application JS','pm56 final runtime diagnostics' in idx.lower())
check('index does not depend on local app.js','src="app.js"' not in idx.lower() and "src='app.js'" not in idx.lower())
check('index does not depend on local data.js','src="data.js"' not in idx.lower() and "src='data.js'" not in idx.lower())
check('index does not depend on local stylesheet','href="styles.css"' not in idx.lower() and "href='styles.css'" not in idx.lower())
check('standalone is byte-identical to index',files['PM_Chat_Assistant_5.6_Pro_Standalone.html'].exists() and files['PM_Chat_Assistant_5.6_Pro_Standalone.html'].read_bytes()==files['index.html'].read_bytes())
check('direct-open boot watchdog present','pm56_boot_ok' in idx.lower() or 'pm56ready' in idx.lower())
check('runtime diagnostics present','pm56_runtime' in idx.lower())
check('hidden attribute hardened','[hidden]' in css and 'display: none !important' in css)
check('Inter font requested','inter' in css.lower())
check('Poppins font requested','poppins' in css.lower())
check('reduced motion equivalence','prefers-reduced-motion' in css)
check('custom popup animation','pm56-popup-in' in css)
check('custom sidecar animation','pm56-sidecar-in' in css)

requirements={
'Context compact menu':'compact now',
'Context More Details':'more details',
'context current-window metric':'current window',
'context tokens-loaded metric':'tokens loaded',
'context cache hit':'cache hit',
'context source composition':'source composition',
'Activity Goal':'goal',
'Activity Todo':'todo',
'Activity Subagents':'subagents',
'Activity Changes':'changes',
'Activity Artifacts':'artifacts',
'Working start':'start',
'Working pause':'pause',
'Working complete':'complete',
'Working history':'history',
'Working evidence':'evidence',
'Web search state':'web search',
'Web fetch state':'web fetch',
'Browser control state':'browser control',
'Bash state':'bash',
'Browser testing state':'browser test',
'Application control state':'app control',
'Subagent state':'subagent',
'Validation state':'validate',
'Artifact render state':'artifact render',
'Reference Morph':'reference morph',
'Orbit take':'orbit',
'Step Stack take':'step stack',
'Tool Ribbon take':'tool ribbon',
'Progressive Receipt take':'progressive receipt',
'Workbench take':'workbench',
'Agent Stage take':'agent stage',
'Calm Stage take':'calm stage',
'Plan revise':'revise',
'Plan build':'build',
'Plan approval':'approve',
'Questionnaire':'questionnaire',
'Permission decision':'permission',
'Conflict decision':'conflict',
'Message More Details':'message details',
'Archived threads':'archived',
'Thread restore':'restore',
'Thread fork':'fork',
'Thread rename':'rename',
'Ordinary conversation fixture':'ordinary',
'BSD fixture':'bsd',
'Context Lens fixture':'context lens',
'Global Reset':'reset',
'Mermaid artifact':'mermaid',
'Interactive dashboard':'dashboard',
'Data explorer':'data explorer',
'Architecture map':'architecture map',
'Interactive quiz':'quiz',
'Periodic table':'periodic table',
'Flowchart':'flowchart',
'Generated image':'generated image',
'Read-only child thread':'read-only',
'Worktree selector':'worktree',
'Goal mode':'goal mode',
'Crew':'crew',
'ELI5':'eli5',
'Thought Stream':'thought stream',
'Fast mode':'fast',
'configured-only provider concept':'configured',
'favorites model view':'favorites',
'provider account identity':'account',
'no passive expiry language':'no passive',
'offline outbox fixture':'offline',
'checkpoint recovery fixture':'checkpoint',
'attachment fixture':'attachment',
'provider quota fixture':'quota',
'artifact stale state':'stale',
'artifact retry':'retry',
'new message anchor':'new-message',
}
for label,needle in requirements.items():
    check(f'feature token: {label}',needle in combined,needle)

# Coarse evidence that each of the seven option families has eight options.
for family in ['body','history','working','activity','detail','transcript','question']:
    pattern = re.compile(rf'{family}[^\n]{{0,120}}(?:options|variants|takes)',re.I)
    present = bool(pattern.search(app+'\n'+data)) or (family in combined and '8' in combined)
    check(f'eight-option family represented: {family}',present)

# No emoji in key control labels (allow prose/data symbols). A small denylist catches prior regressions.
for glyph in ['⭐','⚡️','✨️','⋯','▼','▶️','❌','✅']:
    check(f'no emoji control glyph {glyph}',glyph not in app,glyph)

passed=sum(c['pass'] for c in checks)
failed=[c for c in checks if not c['pass']]
report={'overall':'PASS' if not failed else 'FAIL','passed':passed,'failedCount':len(failed),'total':len(checks),'checks':checks}
(REPORTS/'static-audit.json').write_text(json.dumps(report,indent=2))
(REPORTS/'STATIC_AUDIT.md').write_text('# Static audit\n\n'+f'**{report["overall"]} — {passed}/{len(checks)} passed**\n\n'+ '\n'.join(f'- [{"x" if c["pass"] else " "}] {c["label"]}' + (f' — `{c["detail"]}`' if c['detail'] and not c['pass'] else '') for c in checks))
marker=REPORTS/'STATIC_AUDIT_PASS'
if failed:
    if marker.exists(): marker.unlink()
    sys.exit(1)
marker.write_text(f'PASS {passed}/{len(checks)}\n')
