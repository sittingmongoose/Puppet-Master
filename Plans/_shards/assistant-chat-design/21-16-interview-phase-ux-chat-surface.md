## 16. Interview Phase UX (Chat Surface)

When the chat is in **Interview** mode, it uses the same shared question system that powers assistant clarification flows and builder clarification flows.

### Shared question system baseline
Each question flow shows:
- question text
- suggested options as buttons/chips when provided
- a mandatory `Something else` / freeform path when freeform is allowed
- current draft answer state

Rules:
- the Interview question UI is the baseline visual pattern for reusable question cards across Assistant, Interviewer, and requirements/document-builder flows
- questions are required by default unless explicitly marked optional
- a question flow may contain multiple questions in one questionnaire
- users may answer in any order and revise answers before final submission
- dismissing a questionnaire pauses that conversational branch and returns an explicit dismissed state; it does not fabricate a submitted answer set

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/chain-wizard-flexibility.md

### Clarification and resume behavior
Structured clarification flows MUST preserve question identity and resume deterministically.

Rules:
- `clarification_request` and related wizard/thread surfaces may point at a multi-question questionnaire, not only one prompt at a time
- `question_ids[]` remain the canonical cross-surface identifiers for clarification work
- thread resume and wizard resume must restore the same outstanding questionnaire state or its resolved outcome

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/storage-plan.md

### Runtime visibility
Active Interview work blocks must show the effective runtime state required by the shared runtime owner docs.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md

