## Executive Summary
Internal multi-agent orchestration in Puppet Master is PM-native. Parent and child supervision, timeout propagation, thread and run lineage, shell isolation, cancellation, and crew scheduling are owned by this document together with `Plans/Contracts_V0.md` and `Plans/storage-plan.md`.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

References to external bridge or A2A mapping material are adapter guidance only. They MUST NOT be read as approval for PM-internal child orchestration, child-run control messages, budget propagation, or crew coordination to move onto A2A semantics.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_Stream_Mapping_External_Reference_A2A.md

Every child spawn, retry, cancellation, timeout, pause, resume, and completion path MUST preserve PM lineage fields (`run_id`, `thread_id`, `parent_run_id`, `child_run_id`) plus requested/effective runtime descriptors where applicable. Parent oversight and audit visibility are mandatory even when a child is executing through a bridged provider surface.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md
