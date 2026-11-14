#!/usr/bin/env python3
"""Emit the real review-only rail modules for the expanded browser census.

The published page already carries core/menu/host/D. This adds the authoritative
review profile's data/A/B/C modules. Two access hooks expose existing instances;
DOM builders, classes, data, handlers and their nesting are unchanged.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys

root = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(root / 'Concepts/leftrail-redesign/tools'))
import rail_layer

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--out', type=Path, required=True)
args = parser.parse_args()
js, css = rail_layer.build_script('review'), rail_layer.build_css('review')
hooks = [
    ("view.setAttribute('data-pmr-a-panel', panel.id);", "view.setAttribute('data-pmr-a-panel', panel.id); view.__pmrAuditPanel=inst;"),
    ('view.appendChild(root);', 'view.appendChild(root); root.__pmrAuditPanel=P;'),
]
for old, new in hooks:
    assert js.count(old) == 1, (old, js.count(old))
    js = js.replace(old, new)
bundle = dict(head=subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip(),
              css=css, js=js, accessHooks=[old for old, _ in hooks], buildersUnchanged=True)
args.out.write_text(json.dumps(bundle) + '\n')
print(args.out, len(css), len(js), hashlib.sha256(args.out.read_bytes()).hexdigest())
