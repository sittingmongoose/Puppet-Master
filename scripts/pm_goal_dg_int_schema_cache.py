#!/usr/bin/env python3
"""Pure schema-result memoization for immutable integration banks (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Only successful structural validation is cached. Source acquisition, original
custody, current owner state and every entry/final predicate still run. Keys
include the complete canonical MessagePack value, so integer, float and bool
instances remain distinct. Unencodable values use the original validator.
"""
import hashlib
import pm_goal_test_storage as S


class Roots:
    def __init__(self,original):
        self.original=original
        self.success={}
        self.hits=0
        self.misses=0

    def __getattr__(self,name):return getattr(self.original,name)

    def _checked(self,method,realm,ref,value,*args):
        try:key=(method,realm,ref,hashlib.sha256(S.canonical(value)).digest())
        except Exception:key=None
        if key is not None and key in self.success:
            self.hits+=1
            return None if self.success[key] else value
        out=getattr(self.original,method)(realm,ref,value,*args)
        self.misses+=1
        if key is not None:self.success[key]=out is None
        return out

    def check(self,realm,ref,value):
        return self._checked('check',realm,ref,value)

    def validate(self,realm,ref,value,code):
        return self._checked('validate',realm,ref,value,code)
