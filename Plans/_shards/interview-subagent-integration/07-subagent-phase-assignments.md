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

**Document Generation:**
- `technical-writer` -- Generate phase documents, AGENTS.md, requirements
- `knowledge-synthesizer` -- Cross-phase analysis, technology matrix generation

**Answer Validation:**
- `debugger` -- Validate technical feasibility of answers
- `code-reviewer` -- Validate technical decisions and architecture choices

**Quality Review:**
- `requirements-quality-reviewer` -- Cross-phase quality gate; validates requirements artifacts against the Requirements Completion Contract (`Plans/chain-wizard-flexibility.md`). Produces a `requirements_quality_report` artifact (`SchemaID:pm.requirements_quality_report.schema.v1`, file: `Plans/requirements_quality_report.schema.json`). May propose `auto_fixes_applied[]`; cannot directly edit requirements files — edits are applied via Pass 2 of the Three-Pass Canonical Validation Workflow (`Plans/chain-wizard-flexibility.md`). If `needs_user_clarification[]` is non-empty after autofill, signals `attention_required` to the orchestrator, which surfaces the clarification through the thread + Dashboard CtA system.

ContractRef: ContractName:Plans/chain-wizard-flexibility.md#requirements-quality-escalation-semantics, SchemaID:pm.requirements_quality_report.schema.v1

**Research Operations:**
- `ux-researcher` -- Web research via Browser MCP (when configured). **Cited web search:** Interview (and Assistant, Orchestrator) use **cited web search** (inline citations + Sources list) from a single shared implementation; see **Plans/newtools.md** §8 (cited web search, [opencode-websearch-cited](https://github.com/ghoulr/opencode-websearch-cited)-style) and **Plans/assistant-chat-design.md** §7.
- `context-manager` -- Manage interview state and context across phases

