"""Only completion-tail projection changes; native transport remains frozen."""
from resource_dynamic_driver import DynamicProtocol
from projection import State


class CompletionProtocol(DynamicProtocol):
    def __init__(self,*,relay,**kwargs):
        super().__init__(relay=relay,**kwargs)
        self.state=State(admitted_mcp={},admitted_dynamic=relay.allowed)
