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
import pickle
from pathlib import Path
import runpy
import sys

import pm_event_numbers as numbers


def snapshot(owner):
    method=owner.authenticated_original
    namespace=method.__func__.__globals__
    maps={key:value for key,value in namespace.items()
          if ('CUSTODY' in key or 'RECEIPT' in key) and type(value) in (dict,list,tuple)}
    if method.__func__.__code__.co_filename.endswith('/pm-dt-event-contracts.py') and method.__func__.__qualname__=='SealedOriginalOwner.authenticated_original':
        # The owner reads _CUSTODY['worlds']; the same container also holds
        # an operational dispatcher with verifier callbacks. Snapshot the
        # actual sealed worlds and their complete pinned resource catalogues.
        custody=namespace['_CUSTODY']
        maps['_CUSTODY']={key:custody[key] for key in ('worlds','contracts','frozen','frozen_sha256')}
    if method.__func__.__code__.co_filename.endswith('/pm_dcw_number_custody.py') and method.__func__.__qualname__=='Owner.authenticated_original':
        maps['_ISSUED']=namespace['_ISSUED']
    if method.__func__.__code__.co_filename.endswith('/pm_dg6a_custody.py') and method.__func__.__qualname__=='DG6AOriginalOwner.authenticated_original':
        maps['SEALED']=namespace['SEALED']
    if method.__func__.__code__.co_filename.endswith('/pm-ds15-event-contracts.py') and method.__func__.__qualname__=='DS15OriginalOwner.authenticated_original':
        accessor=namespace['original_custody']
        if accessor.cache_info().currsize==0:
            raise TypeError('DS15 sealed catalogue was not composed before the read')
        maps['original_custody()']=accessor()
    if method.__func__.__code__.co_filename.endswith('/pm_ds_retained.py') and method.__func__.__qualname__=='DSOriginalOwner.authenticated_original':
        accessor=namespace['custody']
        if accessor.cache_info().currsize==0:
            raise TypeError('DS sealed catalogue was not composed before the read')
        maps['custody()']=accessor()
    owner_state=vars(owner)
    if not maps and not any(type(v) in (dict,list,tuple,set,frozenset) or dataclasses.is_dataclass(v) for v in owner_state.values()):
        raise TypeError('no authenticated store snapshot surface')
    value={'owner':owner_state,'maps':maps}
    supported_store(value)
    encoded=pickle.dumps(value,protocol=5)
    return hashlib.sha256(encoded).hexdigest(),sorted(maps),method.__func__.__code__.co_filename,method.__func__.__code__.co_firstlineno


def supported_store(value, seen=None):
    """Refuse opaque/custom serialization; the pickle is only an in-process hash."""
    if type(value) in (str,bool,int,float,bytes,type(None)):
        return
    seen=set() if seen is None else seen
    if id(value) in seen:
        return
    seen.add(id(value))
    if type(value) is dict:
        for key,item in value.items():
            supported_store(key,seen);supported_store(item,seen)
    elif type(value) in (tuple,list,set,frozenset):
        for item in value:
            supported_store(item,seen)
    elif dataclasses.is_dataclass(value) and not isinstance(value,type) and hasattr(value,'__dict__'):
        for cls in type(value).__mro__:
            if cls is not object and any(name in cls.__dict__ for name in ('__reduce__','__reduce_ex__','__getstate__')):
                raise TypeError('custom store serialization '+type(value).__name__)
        supported_store(vars(value),seen)
    else:
        raise TypeError('unsupported store state '+type(value).__name__)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',required=True,type=Path)
    parser.add_argument('script',type=Path)
    parser.add_argument('arguments',nargs=argparse.REMAINDER)
    args=parser.parse_args()
    manifest=Path(__file__).resolve().parents[1]/'tests/fixtures/pnc019_s4o1/families.json'
    families={row['event_type'] for row in json.loads(manifest.read_text())['rows']}
    original=numbers.RetainedDispatcher.resolve
    calls=[]

    def observed(dispatcher,original_ref,expected,**options):
        if getattr(expected,'event_type',None) not in families:
            return original(dispatcher,original_ref,expected,**options)
        entry={'event_type':getattr(expected,'event_type','<unbound>'),'outcome':'exception'}
        entry['owner_attributes']=sorted(vars(dispatcher._owner))
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
                 'snapshot_encoding':'pickle protocol 5 after closed builtin/dataclass validation; never deserialized',
                 'boundary':'Owner instance plus named custody/receipt maps; no native Storage or exhaustive global-state claim.'}
        args.output.write_text(json.dumps(summary,indent=1)+'\n')
    return exit_code or int(any(e.get('store_unchanged') is False for e in calls))


if __name__=='__main__':
    raise SystemExit(main())
