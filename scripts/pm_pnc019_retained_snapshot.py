#!/usr/bin/env python3
"""Observe real RetainedDispatcher calls without changing their results.

Snapshots cover the actual owner instance and named custody/receipt maps in
its authenticated_original module. Unsupported state receives no credit.
This does not claim a native Storage snapshot or exhaustive global-state proof.
"""
import argparse
import dataclasses
import hashlib
import json
from pathlib import Path
import runpy
import struct
import sys

import pm_event_numbers as numbers


def freeze(value, stack=()):
    if type(value) in (str, bool, type(None)):
        return [type(value).__name__,value]
    if type(value) is int:
        return ['int',hex(value)]
    if type(value) is float:
        return ['float64',struct.pack('>d',value).hex()]
    if type(value) is bytes:
        return ['bytes',value.hex()]
    if id(value) in stack:
        raise TypeError('cyclic store state')
    stack=stack+(id(value),)
    if type(value) is dict:
        return ['dict',[[freeze(k,stack),freeze(v,stack)] for k,v in value.items()]]
    if type(value) in (tuple,list):
        return [type(value).__name__,[freeze(v,stack) for v in value]]
    if type(value) in (set,frozenset):
        return [type(value).__name__,sorted((freeze(v,stack) for v in value),key=lambda v:json.dumps(v,sort_keys=True))]
    if dataclasses.is_dataclass(value) and not isinstance(value,type):
        return [type(value).__module__+'.'+type(value).__qualname__,
                [[f.name,freeze(getattr(value,f.name),stack)] for f in dataclasses.fields(value)]]
    raise TypeError('unsupported store state '+type(value).__name__)


def snapshot(owner):
    method=owner.authenticated_original
    namespace=method.__func__.__globals__
    maps={key:value for key,value in namespace.items()
          if ('CUSTODY' in key or 'RECEIPT' in key) and type(value) in (dict,list,tuple)}
    value={'owner':vars(owner),'maps':maps}
    encoded=json.dumps(freeze(value),ensure_ascii=True,separators=(',',':')).encode()
    return hashlib.sha256(encoded).hexdigest(),sorted(maps),method.__func__.__code__.co_filename,method.__func__.__code__.co_firstlineno


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',required=True,type=Path)
    parser.add_argument('script',type=Path)
    parser.add_argument('arguments',nargs=argparse.REMAINDER)
    args=parser.parse_args()
    original=numbers.RetainedDispatcher.resolve
    calls=[]

    def observed(dispatcher,original_ref,expected,**options):
        entry={'event_type':getattr(expected,'event_type','<unbound>'),'outcome':'exception'}
        before=None
        try:
            before,maps,source,line=snapshot(dispatcher._owner)
            entry.update(before_sha256=before,custody_maps=maps,owner_source=source,owner_line=line)
        except (TypeError,AttributeError) as exc:
            entry['snapshot_unavailable']=str(exc)
        try:
            result=original(dispatcher,original_ref,expected,**options)
            entry['outcome']='accepted'
            return result
        except numbers.Refusal as exc:
            entry['outcome']='refused:'+exc.reason
            raise
        finally:
            if before is not None:
                try:
                    after,*_=snapshot(dispatcher._owner)
                    entry.update(after_sha256=after,store_unchanged=before==after)
                except (TypeError,AttributeError) as exc:
                    entry['snapshot_unavailable']=str(exc)
            calls.append(entry)

    numbers.RetainedDispatcher.resolve=observed
    exit_code=0
    try:
        sys.argv=[str(args.script),*args.arguments]
        runpy.run_path(str(args.script.resolve()),run_name='__main__')
    except SystemExit as exc:
        exit_code=exc.code if isinstance(exc.code,int) else int(exc.code is not None)
    finally:
        numbers.RetainedDispatcher.resolve=original
        summary={'calls':calls,'count':len(calls),'mutations':sum(e.get('store_unchanged') is False for e in calls),
                 'unavailable':sum('snapshot_unavailable' in e for e in calls),
                 'boundary':'Owner instance plus named custody/receipt maps; no native Storage or exhaustive global-state claim.'}
        args.output.write_text(json.dumps(summary,indent=1)+'\n')
    return exit_code or int(any(e.get('store_unchanged') is False for e in calls))


if __name__=='__main__':
    raise SystemExit(main())
