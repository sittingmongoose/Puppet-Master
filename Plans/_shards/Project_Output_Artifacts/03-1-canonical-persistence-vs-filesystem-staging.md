## 1. Canonical persistence vs filesystem staging

- **Canonical persistence:** seglog is the canonical store for Project Plan Package artifacts (see §8).
- **Filesystem under `.puppet-master/project/**`:** staging/export/cache only.
  - It MUST be **regenerable** by replaying seglog artifact events.
  - A validator MUST be able to verify byte-identical reconstruction via hashes (see §9).

ContractRef: SchemaID:pm.project-plan-graph-index.v1, Gate:GATE-001, ContractName:Plans/Project_Output_Artifacts.md

