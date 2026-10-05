"""Supported app-server item/tool/call binding, restricted to pinned relay."""
import json
import threading
from native_driver import Protocol
from dynamic_projector import State


class DynamicProtocol(Protocol):
    def __init__(self,*,relay,**kwargs):
        self.relay=relay
        super().__init__(native_mcp_servers={},admitted_mcp={},**kwargs)
        self.state=State(admitted_mcp={},admitted_dynamic=relay.allowed)

    def _client_call(self,obj):
        try:
            result=self.relay.dispatch(obj.get('params') or {},self.state.thread)
            self._write({'id':obj['id'],'result':result})
        except Exception as error:
            self.attention=True
            self._write({'id':obj['id'],'error':{'code':-32000,
                'message':'Confined client tool failed: '+type(error).__name__}})

    def _read(self):
        try:
            for raw in self.proc.stdout:
                if len(raw.encode())>16*1024*1024:self.state.failed=True;break
                try:obj=json.loads(raw)
                except Exception:self.state.failed=True;break
                if 'id' in obj:
                    if 'method' in obj:
                        if obj['method']=='item/tool/call':
                            threading.Thread(target=self._client_call,args=(obj,),daemon=True).start()
                        else:
                            self.attention=True
                            self._write({'id':obj['id'],'error':{'code':-32000,
                                'message':'No additional host capability admitted'}})
                    else:self.replies.put(obj)
                else:
                    method=obj.get('method')
                    if isinstance(method,str):self.event_counts[method]=self.event_counts.get(method,0)+1
                    try:self.state.event(obj)
                    except Exception:self.state.failed=True
                    self.event_signal.set()
        finally:self.replies.put(None)
