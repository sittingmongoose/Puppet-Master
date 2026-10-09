#!/usr/bin/env python3
"""Declared phase gate: freeze discovery before releasing own-case plan."""
from pathlib import Path
import sys,json,hashlib,datetime
R=Path(__file__).resolve().parents[1]
stage=Path(sys.argv[1]).resolve()
assert stage.is_relative_to(R/'jobs')
a=json.loads((stage/'input-map.json').read_text())
assert a['stage']=='research'
d=stage/'discovery.md'
assert d.is_file() and d.stat().st_size>500,'save complete substantive discovery first'
receipt=stage/'plan-reveal.json'
assert not receipt.exists(),'plan reveal may occur once'
plan=R/'cases'/a['case']/'plan-root-only.md'
body=d.read_bytes(); raw=plan.read_bytes()
receipt.write_text(json.dumps({'revealed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'case':a['case'],'discovery_sha256':hashlib.sha256(body).hexdigest(),'discovery_bytes':len(body),'plan_sha256':hashlib.sha256(raw).hexdigest()},indent=2)+'\n')
(stage/'revealed-plan.md').write_bytes(raw)
print(raw.decode())
