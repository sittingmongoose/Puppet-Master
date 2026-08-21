from pathlib import Path
from collections import Counter
import json
ROOT=Path('/mnt/data/work/pm56_pro_reaudit');E=ROOT/'evidence';R=ROOT/'reports'
files=[p for p in E.rglob('*') if p.is_file()]
counts=Counter(p.suffix.lower() for p in files)
lines=['# Evidence Index','',
'This index lists the rendered and motion evidence produced during the final assistant-chat sweep. The release archives include the complete set; the lighter drop-in archive omits bulk evidence while retaining reports and tests.','',
'## Totals','',
'| Evidence type | Count |','|---|---:|']
for ext,count in sorted(counts.items()):lines.append(f'| `{ext or "(none)"}` | {count} |')
lines += ['', '## Contact sheets','']
for p in sorted((E/'contact-sheets').glob('*.jpg')) if (E/'contact-sheets').exists() else []:lines.append(f'- `{p.relative_to(ROOT)}`')
lines += ['', '## Motion evidence','']
for p in sorted((E/'final-certification'/'video').glob('*.webm')) if (E/'final-certification'/'video').exists() else []:lines.append(f'- `{p.relative_to(ROOT)}`')
for d in sorted((E/'motion').iterdir()) if (E/'motion').exists() else []:
 if d.is_dir():
  lines.append(f'- `{d.relative_to(ROOT)}/` — frame CSV, metrics, uniform sheet, and high-motion sheet.')
lines += ['', '## Screenshot groups','']
for d in sorted([p for p in E.iterdir() if p.is_dir()]):
 n=sum(1 for p in d.rglob('*') if p.is_file() and p.suffix.lower() in {'.png','.jpg','.jpeg','.webp'})
 if n:lines.append(f'- `{d.relative_to(ROOT)}/` — {n} screenshots/contact sheets.')
lines += ['', '## Key evidence','',
'- `evidence/production-browser/baseline-1440.png` — default shell and pinned history.',
'- `evidence/production-browser/history-default-and-hover.png` — status-to-More behavior without hover-dependent copy.',
'- `evidence/production-browser/activity-detail.png` — activity panel state.',
'- `evidence/standalone-direct-file.png` — direct `file://` standalone smoke state.',
'- `evidence/contact-sheets/menus-sidecars.jpg` — menu and sidecar treatments.',
'- `evidence/contact-sheets/triggers.jpg` — deterministic system states.',
'- `evidence/contact-sheets/recipes.jpg` — curated recipe/theme sample.',
'- `evidence/final-certification/video/working-animation.webm` — evolving inline work sequence.',
'- `evidence/final-certification/video/questionnaire-morph.webm` — prepare/question/submit motion.',
'- `evidence/final-certification/video/menu-and-sidecar-springs.webm` — selector and sidecar springs.',
'- `evidence/final-certification/video/history-and-panel-continuity.webm` — row hover, thread switch, and panel pinning.','']
(R/'EVIDENCE_INDEX.md').write_text('\n'.join(lines))
