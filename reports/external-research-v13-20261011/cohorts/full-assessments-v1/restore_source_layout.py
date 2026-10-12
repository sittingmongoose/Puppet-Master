#!/usr/bin/env python3
"""Restore this frozen public edition for inspection; makes no native calls."""
import argparse,hashlib,json
from pathlib import Path

def main():
    a=argparse.ArgumentParser(description=__doc__)
    a.add_argument('--destination',required=True,type=Path)
    x=a.parse_args(); root=Path(__file__).resolve().parent
    destination=x.destination.absolute()
    if destination.exists() or destination.is_symlink():
        raise ValueError('destination must be new')
    for parent in destination.parents:
        if parent.is_symlink(): raise ValueError('symlink destination parent refused')
    manifest=json.loads((root/'public-manifest.json').read_text())
    prepared=[];seen=set()
    for e in manifest['files']:
        rel=Path(e['path'])
        if rel.is_absolute() or '..' in rel.parts or '\\' in e['path'] or e['path'] in seen:
            raise ValueError('unsafe or duplicate path')
        seen.add(e['path']);p=root
        for part in rel.parts:
            p/=part
            if p.is_symlink():raise ValueError('symlink source refused')
        data=p.read_bytes()
        if hashlib.sha256(data).hexdigest()!=e['sha256'] or len(data)!=e['bytes']:
            raise ValueError('public hash/size mismatch: '+e['path'])
        prepared.append((rel,data))
    destination.mkdir(parents=True)
    for rel,data in prepared:
        p=destination/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
    (destination/'public-manifest.json').write_bytes((root/'public-manifest.json').read_bytes())
    print(json.dumps({'restored':len(prepared),'native_calls':0,'purpose':'review-only'}))
if __name__=='__main__':main()
