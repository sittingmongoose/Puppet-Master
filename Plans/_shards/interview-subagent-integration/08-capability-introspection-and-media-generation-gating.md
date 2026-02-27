## Capability Introspection and Media-Generation Gating

The Interview agent MUST call `capabilities.get` when offering media-related options to the user (e.g., suggesting visual mockups, audio samples, or video previews as part of an interview phase). The response determines which media capabilities are currently available and which are disabled (with reasons).

**Gating rules:**

1. The Interview agent MAY **propose** media generation during any phase (e.g., *"I can generate a mockup of that UI layout"*) regardless of capability state.
2. The Interview agent MUST NOT **execute** `media.generate` for a capability that is currently disabled. If the user requests a disabled capability, the agent MUST surface the disabled reason and setup hint (from `capabilities.get`) and guide the user to resolve it (e.g., add a Google API key in Settings → Gemini Provider).
3. When listing what the interview can do (e.g., in phase introductions or help responses), the agent MUST reflect the real-time enabled/disabled state from `capabilities.get`, not a static list.

**DRY:** Capability IDs, disabled-reason values, and UI copy strings are defined in `Plans/Media_Generation_and_Capabilities.md` §1–§5 (SSOT). The Interview agent reuses the same `capabilities.get` tool and response shape as the Assistant and Orchestrator.

ContractRef: ToolID:capabilities.get, ContractName:Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM, ContractName:Plans/Personas.md

