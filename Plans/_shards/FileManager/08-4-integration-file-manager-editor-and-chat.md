## 4. Integration: File Manager, editor, and chat

- File Manager, editor, and chat share the **same project context**.
- @ mention resolution uses the same file list as the File Manager (single source of truth for "project files").
- **Clicking a file path or code block in chat opens the file in the editor**; see §5.

### 4.1 Open-file contract

Source-open behavior uses two canonical contracts.

### OpenFile
`OpenFile` remains the path-based editor open contract.

Required fields are:
- `path`
- `line?`
- `range?`
- `target_group?`

### OpenSubject
`OpenSubject` is the identity-native source-open contract.

Required fields are:
- `subject_id`
- `open_intent`

Rules:
- `subject_id` is closed to `doc:<document_id>` and `artifact:<artifact_id>`
- `OpenSubject` resolves to the best source realization, including `OpenFile` or a transient `generated://<artifact_id>` buffer
- `OpenSubject` is used for artifact-backed and generated subjects that do not have a stable workspace path
- `OpenFile` remains the canonical contract for real workspace documents

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md

Route/open rules:
- shell navigation uses `route_target`
- source realization uses `OpenSubject` or `OpenFile`
- `resume_url` is serialized transport only and does not replace the canonical route/open split

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md

#### Thread context detail documents

The thread-scoped Context Detail Pane may be realized as a generated editor-tab document.

Rules:
- shell destination and focus are owned by `route_target`
- generated document realization for the Context Detail Pane uses the canonical `OpenSubject` path rather than raw-path guessing
- repeated opens for the same thread reuse the existing tab identity instead of opening duplicate tabs
- the implementation may back the tab with a generated document id rather than a workspace file path, but the route/open split remains canonical

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md

ContractRef: Plans/Contracts_V0.md#7.4 `OpenSubject`

Labels:
- Open Subject

Behavioral rules:
- File/open surfaces must use `subject_id` only for canonical openable content families.
