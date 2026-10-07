#!/usr/bin/env python3
"""Read-only verification of staged copies, exact frozen originals and stable Git references.
Usage: python3 _curation/verify_batch003.py --repo /path/to/repo [--check-originals]
Original checks stream raw bodies for SHA-256 only; they do not decode or execute them.
"""
import argparse,hashlib,json,subprocess
from pathlib import Path
ap=argparse.ArgumentParser();ap.add_argument('--repo',type=Path,required=True);ap.add_argument('--check-originals',action='store_true');a=ap.parse_args()
s=Path(__file__).resolve().parents[1];m=json.loads((s/'BATCH003_MANIFEST.json').read_text())
def identity(p):
 h=hashlib.sha256();n=0
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b);n+=len(b)
 return h.hexdigest(),n
for row in m['files']:
 assert identity(s/row['staging_relative_path'])==(row['sha256'],row['bytes']),row['staging_relative_path']
 if a.check_originals:assert identity(Path(row['source_original_path']))==(row['source_original_sha256'],row['source_original_bytes'])
for row in m['existing_publication_references']:
 r=row['published_reference'];expect=(r['sha256'],r['bytes'])
 assert identity(a.repo/r['repository_relative_path'])==expect,r['repository_relative_path']
 b=subprocess.check_output(['git','-C',str(a.repo),'show',r['commit']+':'+r['repository_relative_path']]);assert (hashlib.sha256(b).hexdigest(),len(b))==expect
 if a.check_originals:assert identity(Path(row['source_original_path']))==(row['source_original_sha256'],row['source_original_bytes'])
checks=json.loads((s/'FROZEN_IDENTITY_CHECKS.batch003.json').read_text())['checks']
if a.check_originals:
 for r in checks:assert identity(Path(r['original_path']))==(r['sha256'],r['bytes']),r['original_path']
 for r in json.loads((s/'RAW_PRIVATE_EVIDENCE.batch003.json').read_text())['entries']:assert identity(Path(r['original_path']))==(r['sha256'],r['bytes'])
expected={r['staging_relative_path'] for r in m['files']}|{'BATCH003_MANIFEST.json'}
actual={str(p.relative_to(s)) for p in s.rglob('*') if p.is_file()};assert actual==expected,('unexpected or missing staging files',actual^expected)
total=sum((s/p).stat().st_size for p in actual);assert total<=m['budget_bytes']
assert m['completed_science_counts']['matched_pairs']==3 and m['completed_science_counts']['full_positive_arm_outputs']==0
assert not m['campaign_complete']
print(json.dumps({'result':'PASS','copies_and_generated_files':len(m['files']),'existing_reference_identities':len(m['existing_publication_references']),'freeze_identity_checks':len(checks),'originals_checked':a.check_originals,'staging_files':len(actual),'staging_bytes':total,'manifest_sha256':identity(s/'BATCH003_MANIFEST.json')[0]},indent=2))
