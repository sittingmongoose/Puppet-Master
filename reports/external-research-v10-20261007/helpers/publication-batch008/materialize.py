#!/usr/bin/env python3
"""Materialize only exact BATCH008 administrative replay inputs, never raw sources.

Run with --repo CHECKOUT --bundle BATCH008_BUNDLE --out EMPTY_DIRECTORY.
This does not invoke the original normalizer or retention classifier, access a
network or reconstruct held quotes. Output is restricted to the provided out.
"""
import argparse,hashlib,json
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--repo',type=Path,required=True)
p.add_argument('--bundle',type=Path,required=True,help='report root containing BATCH008_REPLAY_MAP.json')
p.add_argument('--out',type=Path,required=True)
a=p.parse_args();out=a.out.resolve();out.mkdir(parents=True,exist_ok=True)
assert not any(out.iterdir()),'output directory must be empty'
bundle=a.bundle.resolve();repo=a.repo.resolve();mapping=json.loads((bundle/'BATCH008_REPLAY_MAP.json').read_bytes())
def sha(b):return hashlib.sha256(b).hexdigest()
def read(ref):
 target=ref['target_path'];q=(repo/target).resolve()
 assert repo in q.parents,('escape',target)
 if not q.is_file():
  # Bundle may be the uncommitted report under staging: use its report-relative path.
  base='reports/external-research-v10-20261007/'
  assert target.startswith(base);q=(bundle/target[len(base):]).resolve();assert bundle in q.parents
 b=q.read_bytes();assert sha(b)==ref['sha256'] and len(b)==ref['bytes'],('identity mismatch',target)
 return b
def put(rel,b):
 q=(out/rel).resolve();assert out in q.parents;q.parent.mkdir(parents=True,exist_ok=True);assert not q.exists();q.write_bytes(b)
for ref in mapping['normalizer_inputs']:put('normalizer-v1/'+ref['snapshot_relative_path'],read(ref))
def projection(value,shape_id,shapes):
 desc=shapes[shape_id]
 if desc is None:return value
 if isinstance(desc,dict):return {k:projection(value[k],v,shapes) for k,v in desc.items()}
 assert len(value)==len(desc)
 return [projection(v,k,shapes) for v,k in zip(value,desc)]
def expand(o):
 if isinstance(o,dict):
  if set(o)=={'$er10_exact_public_reference'}:
   ref=o['$er10_exact_public_reference'];value=json.loads(read(ref));return projection(value,ref['projection_shape'],ref['projection_shapes']) if 'projection_shape' in ref else value
  return {k:expand(v) for k,v in o.items()}
 if isinstance(o,list):return [expand(v) for v in o]
 return o
compact=json.loads((bundle/'BATCH008_RETENTION_SNAPSHOT_COMPACT.json').read_bytes())
snapshot=expand(compact['snapshot'])
b=(json.dumps(snapshot,ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n').encode()
ref=compact['original_identity'];assert sha(b)==ref['sha256'] and len(b)==ref['bytes'],'retention snapshot reconstruction mismatch'
put('retention-plan-v1/snapshot.json',b)
print(json.dumps({'normalizer_input_count':len(mapping['normalizer_inputs']),'retention_snapshot_sha256':sha(b),'held_witness_fragments_materialized':False,'raw_source_bodies_materialized':False,'original_science_changed':False}))
