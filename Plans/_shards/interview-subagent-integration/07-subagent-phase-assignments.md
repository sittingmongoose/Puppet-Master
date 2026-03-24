## Subagent Phase Assignments

### Phase 1: Scope & Goals
**Primary Subagent:** `product-manager`
- **Purpose:** Product strategy, roadmap planning, feature prioritization
- **Use Cases:**
  - Generate questions about target users, success criteria, MVP boundaries
  - Validate scope decisions against product best practices
  - Synthesize goals into structured requirements

### Phase 2: Architecture & Technology
**Primary Subagent:** `architect-reviewer`
- **Purpose:** System design validation, architectural patterns, technology evaluation
- **Use Cases:**
  - Generate questions about tech stack, scalability, integration patterns
  - Validate architecture decisions for scalability and maintainability
  - Review technology compatibility

### Phase 3: Product / UX
**Primary Subagent:** `ux-researcher`
- **Purpose:** User insights, usability testing, design decisions
- **Use Cases:**
  - Generate questions about user workflows, accessibility, edge cases
  - Research UX patterns and best practices
  - Validate UX decisions against user research methodologies
  - **When user project includes a GUI:** Inventory interactive UI elements, assign preliminary `UICommandID` values, and map elements to intended handlers — producing UI wiring fragments that feed the Contract Unification Pass (see `Plans/chain-wizard-flexibility.md` §6.6.2)

**Secondary Subagent (GUI projects):** `frontend-developer`
- **Purpose:** UI architecture, component design, wiring feasibility
- **Use Cases:**
  - Validate UI element → command → handler mappings for technical feasibility
  - Review wiring matrix fragments for completeness (no unbound interactive elements)
  - Advise on component structure that supports the wiring matrix pattern (one element, one command)

### Phase 4: Data & Persistence
**Primary Subagent:** `database-administrator`
- **Purpose:** Database design, data architecture, persistence strategies
- **Use Cases:**
  - Generate questions about schema design, migrations, backup strategies
  - Validate data architecture decisions
  - Ensure high availability and performance considerations

### Phase 5: Security & Secrets
**Primary Subagent:** `security-auditor`
- **Purpose:** Security assessments, compliance validation, vulnerability identification
- **Use Cases:**
  - Generate questions about authentication, authorization, encryption
  - Validate security decisions against compliance frameworks
  - Review threat models and security controls

**Secondary Subagent:** `compliance-auditor`
- **Purpose:** Regulatory frameworks, data privacy, security standards
- **Use Cases:**
  - Validate compliance requirements (GDPR, HIPAA, etc.)
  - Check data privacy implications

### Phase 6: Deployment & Environments
**Primary Subagent:** `devops-engineer`
- **Purpose:** CI/CD, infrastructure, deployment strategies
- **Use Cases:**
  - Generate questions about deployment targets, CI/CD pipelines
  - Validate deployment strategies
  - Review infrastructure automation

**Secondary Subagent:** `deployment-engineer`
- **Purpose:** CI/CD pipelines, release automation, deployment strategies
- **Use Cases:**
  - Validate blue-green/canary deployment strategies
  - Review rollback procedures

### Phase 7: Performance & Reliability
**Primary Subagent:** `performance-engineer`
- **Purpose:** Performance optimization, scalability, bottleneck identification
- **Use Cases:**
  - Generate questions about latency targets, retry logic, failover
  - Validate performance decisions
  - Review resource budgets and scalability plans

### Phase 8: Testing & Verification {#phase-8-testing}
**Primary Subagent:** `qa-expert`
- **Purpose:** Test strategy, quality assurance, test planning
- **Use Cases:**
  - Generate questions about test types, coverage goals, acceptance criteria
  - Validate test strategy completeness
  - Review test automation approaches

**Secondary Subagent:** `test-automator`
- **Purpose:** Test automation frameworks, CI/CD integration
- **Use Cases:**
  - Generate test automation strategies
  - Validate CI/CD integration for tests

### Cross-Phase Subagents
Cross-phase subagents continue to serve document generation, answer validation, quality review, and research operations, but they now inherit the reconciled PM-native tool and skill model.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Skills_System.md, ContractName:Plans/Tools.md

Cross-phase rules:
- cited web search, PM-native skills, and PM-native MCP availability are resolved by PM before provider execution rather than delegated to provider-native wiring.
- skill readiness for interview helpers is determined from `required_tool_refs` and `optional_tool_refs`, not by heuristics or provider-specific assumptions.
- interview subagents inherit the same requested/effective runtime disclosure fields and provider-entry vocabulary used elsewhere.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md
### Debug-capable validation and remediation

Interview may use shared debug-capable tools during testing, verification, and environment validation phases, but it does not become the owner of Assistant Debug Mode.

Required rules:
- Interview-triggered debugging work uses the same `investigation_id`, evidence, instrumentation, and cleanup contracts as Assistant or Orchestrator investigations
- any evidence gathered for interview validation must be summarized and linked, not pasted as raw unbounded logs into interview artifacts
- temporary instrumentation introduced during interview validation must either be cleaned up before phase completion or be carried forward explicitly as unresolved work with cleanup state

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/MiscPlan.md

Automatic runtime selection in Interview MUST use only IDs present in the canonical 42-entry subagent registry (`Plans/orchestrator-subagent-integration.md`). Older aliases such as `explore` are invalid; the canonical built-in ID is `explorer`.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Personas.md

