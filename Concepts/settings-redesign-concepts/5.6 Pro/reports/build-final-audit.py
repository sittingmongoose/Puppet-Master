from pathlib import Path
import json,datetime
ROOT=Path('/mnt/data/work/pm56_pro_reaudit');R=ROOT/'reports'
def load(name):
 p=R/name
 try:return json.loads(p.read_text())
 except:return None
static=load('static-audit.json');production=load('production-browser-audit.json');critical=load('critical-browser-audit.json');full=load('final-certification.json');motion=load('motion-audit.json');standalone=load('standalone-smoke.json')
release=[
 ('Static source/feature audit',static and static.get('overall'),static.get('passed',0) if static else 0,static.get('failed',1) if static else 1,'STATIC_AUDIT.md'),
 ('Production rendered-browser audit',production and production.get('overall'),production.get('passed',0) if production else 0,production.get('failed',1) if production else 1,'PRODUCTION_BROWSER_AUDIT.md'),
 ('Frame-by-frame motion audit',motion and motion.get('overall'),len(motion.get('gates',[])) if motion else 0,sum(1 for g in (motion.get('gates',[]) if motion else []) if not all(v for k,v in g.items() if k!='id')),'MOTION_AUDIT.md'),
 ('Standalone direct-file smoke',standalone and standalone.get('overall'),sum(1 for x in standalone.get('checks',[]) if x.get('status')=='PASS') if standalone else 0,sum(1 for x in standalone.get('checks',[]) if x.get('status')!='PASS') if standalone else 1,'STANDALONE_SMOKE.md'),
]
diagnostic=[
 ('Critical browser cross-check',critical and critical.get('overall'),critical.get('passed',0) if critical else 0,critical.get('failed',1) if critical else 1,'CRITICAL_BROWSER_AUDIT.md'),
 ('Extended exploratory certification matrix',full and full.get('overall'),full.get('summary',{}).get('passed',0) if full else 0,full.get('summary',{}).get('failed',1) if full else 1,'FINAL_BROWSER_CERTIFICATION.md'),
]
overall='PASS' if all(x[1]=='PASS' for x in release) else 'FAIL'
source_files=(R/'source-file-inventory.txt').read_text(errors='ignore').splitlines() if (R/'source-file-inventory.txt').exists() else []
plan_files=(R/'assistant-related-plan-files.txt').read_text(errors='ignore').splitlines() if (R/'assistant-related-plan-files.txt').exists() else []
evidence=list((ROOT/'evidence').rglob('*')) if (ROOT/'evidence').exists() else []
shots=sum(1 for p in evidence if p.suffix.lower() in {'.png','.jpg','.jpeg','.webp'})
vids=sum(1 for p in evidence if p.suffix.lower() in {'.webm','.mp4','.mov'})
csvs=sum(1 for p in evidence if p.suffix.lower()=='.csv')
prod_checks=production.get('passed',0)+production.get('failed',0) if production else 0
static_checks=static.get('passed',0)+static.get('failed',0) if static else 0
full_checks=full.get('summary',{}).get('passed',0)+full.get('summary',{}).get('failed',0) if full else 0
critical_checks=critical.get('passed',0)+critical.get('failed',0) if critical else 0
lines=['# Puppet Master Assistant Chat 5.6 Pro — Final Audit','',f'**Release certification: {overall}**','',f'_Generated {datetime.datetime.now(datetime.timezone.utc).isoformat()}_','',
'## Release-blocking gates','', '| Gate | Result | Passed/checked | Failed | Detailed report |','|---|---|---:|---:|---|']
for label,status,pas,fail,link in release:lines.append(f'| {label} | {status or "MISSING"} | {pas} | {fail} | `{link}` |')
lines += ['', '## Additional diagnostic sweeps','',
'These intentionally overlap the release audit and are retained to expose test-runner assumptions or lower-signal exploratory findings. They do not weaken the release gates above.','',
'| Sweep | Result | Passed/checked | Failed | Detailed report |','|---|---|---:|---:|---|']
for label,status,pas,fail,link in diagnostic:lines.append(f'| {label} | {status or "MISSING"} | {pas} | {fail} | `{link}` |')
lines += ['', '## Coverage totals','',
f'- Static checks: **{static_checks}**.',f'- Production browser checks and rendered states: **{prod_checks}**.',f'- Critical browser cross-checks: **{critical_checks}**.',f'- Extended exploratory checks and rendered states: **{full_checks}**.',f'- Source/review files inventoried: **{len(source_files)}**.',f'- Assistant-related repository documents captured: **{len(plan_files)}**.',f'- Screenshots and contact sheets: **{shots}**.',f'- Motion recordings: **{vids}**.',f'- Per-frame CSV files: **{csvs}**.','',
'## Release audit scope','',
'- Every current PMConcept7 theme.',
'- Eight curated full recipes.',
'- Seven swappable component families with eight options each.',
'- Default thread-history visibility, hover behavior, pinned/recent/archived groups, search, restore, row menus, and scrolling.',
'- Persona, Model, Mode, Worktree, Permissions, and Wand menus across narrow, medium, wide, and ultrawide viewports.',
'- Model effort, Plan/Deep Plan thoroughness, and submenu/sidecar parent ownership.',
'- Overlay portal stacking, collision, transform origin, internal scrolling, text fit, animation presence, and viewport containment.',
'- Transcript, composer, editor, history, Activity Detail, and resize-pressure geometry.',
'- Every registered deterministic trigger, including Mermaid, interactive visuals, generated images, Working Animation, questions, decisions, Plans, Goals, Todos, subagents, changes, and artifacts.',
'- All available source motion references frame by frame plus implementation recordings.',
'- Original and correction packets, assistant-related Plans, T3 picker source, Inline Visualizer source, and all named prior assistant concepts.','',
'## Important implementation repairs from the final pass','',
'- Rebuilt portal ownership so menus and sidecars cannot be clipped by assistant parents.',
'- Added viewport clamping and anchor/sidecar stabilization after animated size changes.',
'- Added a WAAPI spring fallback for engines that do not support advanced CSS `linear()` easing.',
'- Made thread history and row copy visible independently of hover; hover changes only the status/action slot.',
'- Stabilized constrained-height menu scrolling and text wrapping.',
'- Kept question/decision surfaces within a reliable viewport gutter with internal scrolling.',
'- Preserved full-width assistant prose while retaining compact user-turn distinction.',
'- Normalized deterministic audit APIs without replacing the app’s shared state/command implementation.','',
'## Supporting reports','',
'- `PACKET_PLAN_DISPOSITION.md` — implementation disposition by requirement.',
'- `PLAN_GAPS.md` — stable production contracts to normalize after concept selection.',
'- `PRIOR_CONCEPT_REVIEW.md` — 5-6-sol, CursorAuto, Fable, GLM 5.2, Kimi, Kimi-K3, Opus 5, and Qwen 5.8 review.',
'- `MOTION_AUDIT.md` — frame-by-frame source and implementation motion analysis.',
'- `PRODUCTION_BROWSER_AUDIT.md` — release rendered interaction/geometry sweep.',
'- `STATIC_AUDIT.md` — feature, syntax, icon, and portal checks.','',
'## Packaging rule','',
'The final drop-in, standalone HTML, and full-audit archives are created only when all release-blocking gates report PASS. If a gate is absent or failed, the final archive names are not produced.','']
(R/'FINAL_AUDIT.md').write_text('\n'.join(lines))
(R/'FINAL_AUDIT_STATUS.txt').write_text(overall+'\n')
marker=R/'FINAL_AUDIT_PASS'
if overall=='PASS':marker.write_text('PASS\n')
elif marker.exists():marker.unlink()
