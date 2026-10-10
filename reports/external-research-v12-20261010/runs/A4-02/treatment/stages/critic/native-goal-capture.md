# Native Goal capture note

The single create_goal call used the exact immutable assignment objective and did activate a native Goal. The post-call code then failed while encoding its returned value (ReferenceError: TextEncoder is not defined) before the original create response could be emitted or written. A later state-recording attempt also failed after querying the Goal (ReferenceError: btoa is not defined). No second or replacement Goal was created.

The native get_goal object was then directly observed and saved in native-goal-state.json. It confirms the exact objective and active status. This recovered state is not represented as the lost raw create_goal response. The initial activation response is therefore NOT recoverable from the available tool output; the observed capture diagnostics are retained here. Native epoch fields are preserved as returned; any timestamp/provenance semantics not explicitly returned are UNKNOWN.
