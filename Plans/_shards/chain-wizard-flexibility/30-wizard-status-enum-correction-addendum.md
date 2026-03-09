## Wizard Status Enum Correction Addendum

### Canonical `wizard_status` enum

The canonical `wizard_status` enum includes all of the following values:

| Value | Meaning |
|-------|---------|  
| `setup` | Wizard is initializing. |
| `requirements` | Wizard is gathering requirements. |
| `interview` | Wizard is conducting the interview phase. |
| `validating` | Wizard is validating gathered requirements. |
| `attention_required` | Wizard needs user input but can still make partial progress. |
| `ready_to_execute` | Wizard is ready to begin execution. |
| `blocked` | Wizard cannot continue -- all clarification rounds exhausted or unrecoverable input needed. |
| `complete` | Wizard finished successfully. |
| `cancelled` | Wizard was cancelled by the user. |

`attention_required` transitions to `blocked` when the clarification round cap (default 3) is exhausted without resolution.

Every surface where `wizard_status` is canonically enumerated MUST include `blocked`.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md
