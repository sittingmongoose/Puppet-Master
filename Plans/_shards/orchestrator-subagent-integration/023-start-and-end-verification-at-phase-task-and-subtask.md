# Shard 023: Start and End Verification at Phase, Task, and Subtask

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L1346-L3323

Source SHA256: `a29fb722e82fd1f89823b9be4c7a2aaa3b75418b6d3659c9b6657c0b15971241`

---

## Start and End Verification at Phase, Task, and Subtask

Beyond config-wiring validation (which runs at **start** of each tier), this section defines a **broader start verification** (wiring + readiness) and an **end verification** (wiring again + **quality review**) at Phase, Task, and Subtask boundaries. The goal is to catch things that need to be wired, confirm GUI/backend are in sync, validate that steps make sense, and at the end not only pass acceptance criteria but ensure the work was done well via actual code review. **Human-in-the-Loop (HITL):** Optional pause for human approval at these same boundaries is specified in **Plans/human-in-the-loop.md** (runs after end verification, before advancing to the next tier).

Canonical lifecycle alignment:
- Verification results are persisted as seglog/redb events and projections (`config.validation.*`, `run.qa_cycle_*`, HITL events), not as authoritative ad hoc JSON files.
- Executor node `status` remains governed by `Plans/Executor_Protocol.md`; labels such as `waiting_approval`, `needs_review`, and warning states are overlays/projections, not replacement node statuses.
- Start verification blocks before any provider spawn. End verification runs before promotion and before any HITL pause for the same tier.

### Start-of-phase / start-of-task / start-of-subtask verification

When the orchestrator **enters** a Phase, Task, or Subtask, run the following **before** building execution context or spawning the agent:

1. **Config-wiring check (existing):** Run `validate_config_wiring_for_tier` (or equivalent) for this tier -- tier config present, plan_mode/subagent/interview fields wired. See **Approach B** above.
2. **Wiring and readiness checklist (new):**
   - **Does the GUI need to be updated?** For any execution-affecting setting that this tier uses: is there a corresponding control or display in the Config (or Wizard) so the user can see and change it? If a new setting was added to the backend and is used at this tier, the GUI should expose it (or document why it is internal-only).
   - **Does the backend need to be updated?** For any control or config field that the user can set in the GUI: is it read and applied in the execution path for this tier? If the GUI has a setting that should affect this tier but the backend does not use it, treat as "built but not wired" and fail or warn per policy.
   - **Do these steps make sense?** For this tier, is the sequence of operations (load config → select subagents → build request → run) consistent with the plan and with the config schema? For example: if subagents are enabled for this tier, is the subagent list actually derived from config and not hardcoded?
   - **Gaps or potential issues:** Are there known gaps (e.g. missing persistence, missing validation, platform-specific limitations) that could affect this tier? Optionally run a lightweight "gap check" (e.g. list of known gaps per tier type) and log or warn so operators see them.
   - **UI wiring check (GUI projects):** If `.puppet-master/project/ui/` exists and the current tier node's scope involves UI work, verify that the node's `contract_refs` include at least one wiring matrix entry or command catalog ID. At end-of-tier, re-run the "no unbound UI actions" check against the current state of `ui/wiring_matrix.json` to ensure new interactive elements added during execution are wired.

**BeforeTierStart verification responsibilities:**

- **Load tier config:** Load tier configuration from `PuppetMasterConfig` (or equivalent) for this tier type
- **Validate config wiring:** Call `validate_config_wiring_for_tier(tier_type, config)` to check tier config present, plan_mode/subagent/interview fields wired
- **Check GUI-backend mapping:** Load GUI-backend mapping (from `config_wiring.rs` or static list) and verify all execution-affecting settings have GUI controls
- **Check backend-GUI mapping:** Verify all GUI controls are read and applied in execution path for this tier
- **Validate operation sequence:** Check that operation sequence (load config → select subagents → build request → run) is consistent with config schema
- **Run gap check:** Load known gaps per tier type and log/warn if any affect this tier
- **Build verification result:** Create `StartVerificationResult` with pass/fail status and detailed findings

**DuringTierStart verification responsibilities:**

- **Log verification results:** Log verification results to `.puppet-master/logs/verification.log`
- **Handle failures:** If verification fails, either fail fast (per policy) or warn and continue (per policy)
- **Update state:** Update orchestrator state with verification results

**AfterTierStart verification responsibilities:**

- **Persist verification results:** Emit canonical `config.validation.passed|warning|failed` events and update redb projections for this tier/runtime snapshot
- **Track verification history:** Add verification entry to verification history for this tier

**Implementation:** Create `src/verification/tier_start.rs` with `verify_tier_start()` function. Integrate with orchestrator tier entry point.

**Integration with orchestrator:**

In `src/core/orchestrator.rs`, extend tier entry logic:

```rust
use crate::verification::tier_start::{verify_tier_start, StartVerificationError, StartVerificationResult};

impl Orchestrator {
    pub async fn execute_tier(
        &self,
        tier_node: &TierNode,
        context: &OrchestratorContext,
    ) -> Result<()> {
        // Run start verification BEFORE building execution context
        let verification_result = verify_tier_start(
            tier_node.tier_type,
            &self.config,
            context,
        ).await?;

        // Handle verification failures
        match verification_result.status {
            VerificationStatus::Pass => {
                // Continue with tier execution
            }
            VerificationStatus::Fail => {
                match self.config.verification_policy {
                    VerificationPolicy::FailFast => {
                        return Err(anyhow!("Tier start verification failed: {:?}", verification_result.findings));
                    }
                    VerificationPolicy::WarnAndContinue => {
                        tracing::warn!("Tier start verification failed: {:?}", verification_result.findings);
                        // Continue with tier execution
                    }
                }
            }
            VerificationStatus::Warning => {
                tracing::warn!("Tier start verification warnings: {:?}", verification_result.findings);
                // Continue with tier execution
            }
        }

        // Log verification results
        self.log_verification_result(&tier_node.id, &verification_result).await?;

        // Persist verification results
        self.persist_verification_result(&tier_node.id, &verification_result).await?;

        // Build execution context (only if verification passed or warn-and-continue)
        let execution_context = self.build_execution_context(tier_node, context)?;

        // Continue with tier execution...
        Ok(())
    }
}
```

**Verification function implementation:**

```rust
// src/verification/tier_start.rs

use crate::types::{TierType, Platform};
use crate::config::PuppetMasterConfig;
use crate::core::OrchestratorContext;
use anyhow::{Result, Context};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StartVerificationResult {
    pub tier_type: TierType,
    pub node_id: String,
    pub status: VerificationStatus,
    pub findings: Vec<VerificationFinding>,
    pub timestamp: chrono::DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VerificationStatus {
    Pass,
    Fail,
    Warning,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerificationFinding {
    pub category: FindingCategory,
    pub severity: FindingSeverity,
    pub message: String,
    pub suggestion: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FindingCategory {
    ConfigWiring,
    GuiBackendMapping,
    BackendGuiMapping,
    OperationSequence,
    KnownGaps,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FindingSeverity {
    Critical,
    Major,
    Minor,
    Info,
}

// DRY:FN:verify_tier_start — Verify tier readiness before execution
pub async fn verify_tier_start(
    tier_type: TierType,
    config: &PuppetMasterConfig,
    context: &OrchestratorContext,
) -> Result<StartVerificationResult> {
    let mut findings = Vec::new();

    // 1. Config-wiring check
    let config_wiring_result = validate_config_wiring_for_tier(tier_type, config)?;
    if !config_wiring_result.passed {
        findings.extend(config_wiring_result.findings.into_iter().map(|f| VerificationFinding {
            category: FindingCategory::ConfigWiring,
            severity: FindingSeverity::Critical,
            message: f,
            suggestion: Some("Ensure tier config is present and all required fields are wired".to_string()),
        }));
    }

    // 2. GUI-backend mapping check
    let gui_backend_result = check_gui_backend_mapping(tier_type, config)?;
    if !gui_backend_result.passed {
        findings.extend(gui_backend_result.findings.into_iter().map(|f| VerificationFinding {
            category: FindingCategory::GuiBackendMapping,
            severity: FindingSeverity::Major,
            message: f,
            suggestion: Some("Add GUI control for this backend setting or document why it is internal-only".to_string()),
        }));
    }

    // 3. Backend-GUI mapping check
    let backend_gui_result = check_backend_gui_mapping(tier_type, config)?;
    if !backend_gui_result.passed {
        findings.extend(backend_gui_result.findings.into_iter().map(|f| VerificationFinding {
            category: FindingCategory::BackendGuiMapping,
            severity: FindingSeverity::Major,
            message: f,
            suggestion: Some("Read and apply this GUI setting in the execution path for this tier".to_string()),
        }));
    }

    // 4. Operation sequence validation
    let sequence_result = validate_operation_sequence(tier_type, config)?;
    if !sequence_result.passed {
        findings.extend(sequence_result.findings.into_iter().map(|f| VerificationFinding {
            category: FindingCategory::OperationSequence,
            severity: FindingSeverity::Major,
            message: f,
            suggestion: Some("Ensure operation sequence matches config schema and plan".to_string()),
        }));
    }

    // 5. Gap check
    let gap_result = check_known_gaps(tier_type)?;
    if !gap_result.gaps.is_empty() {
        for gap in gap_result.gaps {
            findings.push(VerificationFinding {
                category: FindingCategory::KnownGaps,
                severity: FindingSeverity::Info,
                message: gap.description,
                suggestion: gap.mitigation,
            });
        }
    }

    // Determine overall status
    let status = if findings.iter().any(|f| matches!(f.severity, FindingSeverity::Critical)) {
        VerificationStatus::Fail
    } else if findings.iter().any(|f| matches!(f.severity, FindingSeverity::Major)) {
        VerificationStatus::Warning
    } else {
        VerificationStatus::Pass
    };

    Ok(StartVerificationResult {
        tier_type,
        node_id: context.node_id.clone(),
        status,
        findings,
        timestamp: Utc::now(),
    })
}

fn validate_config_wiring_for_tier(
    tier_type: TierType,
    config: &PuppetMasterConfig,
) -> Result<ConfigWiringResult> {
    // Implementation: check tier config present, plan_mode/subagent/interview fields wired
    // ...
}

fn check_gui_backend_mapping(
    tier_type: TierType,
    config: &PuppetMasterConfig,
) -> Result<MappingCheckResult> {
    // Load GUI-backend mapping (from config_wiring.rs or static list)
    let mapping = load_gui_backend_mapping(tier_type)?;

    // Check all execution-affecting settings have GUI controls
    // ...
}

fn check_backend_gui_mapping(
    tier_type: TierType,
    config: &PuppetMasterConfig,
) -> Result<MappingCheckResult> {
    // Load backend-GUI mapping
    let mapping = load_backend_gui_mapping(tier_type)?;

    // Check all GUI controls are read and applied in execution path
    // ...
}

fn validate_operation_sequence(
    tier_type: TierType,
    config: &PuppetMasterConfig,
) -> Result<SequenceValidationResult> {
    // Check operation sequence consistency
    // ...
}

fn check_known_gaps(tier_type: TierType) -> Result<GapCheckResult> {
    // Load known gaps per tier type
    let gaps = load_known_gaps(tier_type)?;

    Ok(GapCheckResult { gaps })
}
```

**Error handling:**

- **Config loading failure:** If tier config cannot be loaded, return `VerificationStatus::Fail` with Critical finding
- **Mapping load failure:** If GUI-backend or backend-GUI mapping cannot be loaded, return `VerificationStatus::Warning` with Info finding (mapping may not exist yet)
- **Gap check failure:** If gap check fails, log warning and continue (gaps are informational)

### End-of-phase / end-of-task / end-of-subtask verification

When the orchestrator **completes** a Phase, Task, or Subtask (e.g. all iterations or sub-items done, acceptance criteria about to be checked), run:

1. **Wiring check again (did we wire what we built?):** Re-run the same wiring/readiness questions as at start, but in "completion" context: for the work just done at this tier, are all new or touched config/settings properly wired (GUI ↔ backend ↔ execution)? This catches cases where work during the tier introduced a new setting or UI that was not yet connected.
2. **Acceptance criteria (existing):** Run the existing verification gate (e.g. criteria from PRD, command/file/regex checks). This remains the "did we meet the spec?" check.
3. **Quality verification (new):** Beyond acceptance criteria, **review the code (or artifacts) produced at this tier** to ensure the work was done well -- not just "does it pass the gate?" but "is it maintainable, correct, and aligned with project standards?" Both of the following are **required** (no human review; agent-driven only):
   - **Structured code review by reviewer subagent (required, not optional):** Run a dedicated reviewer subagent (e.g. `code-reviewer`) at end-of-phase/task/subtask. It inspects the diff or artifacts and outputs pass/fail + feedback. There is no path that skips this. Do **not** use human review.
   - **Quality criteria in the gate (required as well):** Extend the verification gate for this tier to include automated quality items (e.g. "no new clippy warnings," "new code has tests," "no TODOs without tickets").
4. **Document packaging verification (new):** End-of-run verification MUST enforce `Plans/Document_Packaging_Policy.md` for any Markdown/text artifact under `.puppet-master/**` produced during the run that reached packaging triggers.

ContractRef: ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014

**Quality Gate: Fail vs Warn Rules (Resolved):**

| Check | Severity | Action |
|-------|----------|--------|
| Linter errors (error-level) | Critical | **Fail** — block tier completion |
| Linter warnings (warn-level) | Advisory | **Warn** — log, do not block |
| Formatter violations | Advisory | **Warn** — log, do not block |
| Test failures | Critical | **Fail** — block tier completion |
| Test coverage delta < 0% | Advisory | **Warn** — log, do not block |
| Build errors | Critical | **Fail** — block tier completion |
| Type check errors | Critical | **Fail** — block tier completion |

Threshold source: per-project `.puppet-master/quality.json` (if exists). If file is missing, use built-in defaults (no coverage threshold, linter/test/build errors fail, everything else warns).
Config: `quality.gate.{check_name}.action` — override per check (`"fail"` or `"warn"`).

**BeforeTierEnd verification responsibilities:**

- **Collect tier artifacts:** Collect all artifacts produced during this tier (code changes, documents, test results, etc.)
- **Compute diff:** Compute git diff for changed files in this tier (if applicable)
- **Load tier context:** Load tier context and execution history for this tier
- **Prepare verification context:** Build verification context with artifacts, diff, tier context, and config

**DuringTierEnd verification responsibilities:**

- **Re-run wiring check:** Re-run wiring/readiness check for completed tier (check if new config/settings were introduced and are properly wired)
- **Run acceptance criteria:** Run existing verification gate (PRD criteria, command/file/regex checks)
- **Run quality verification:**
  - **Code review by reviewer subagent:** Invoke reviewer subagent (e.g., `code-reviewer`) to review diff/artifacts
  - **Quality gate criteria:** Run automated quality checks (linters, formatters, test coverage, security scanners)
- **Run Document Set verification:** For large Markdown/text artifacts produced in the run, execute full Document Set audit checks (A/B/C) and fail tier completion on any packaging verification breach.
- **Collect verification results:** Collect all verification results (wiring, acceptance, quality)
- **Determine tier status:** Determine if tier should be marked "complete", "incomplete" (rework), or "complete with warnings"

**AfterTierEnd verification responsibilities:**

- **Persist verification results:** Save verification results to `.puppet-master/state/verification-{node_id}-end.json`
- **Update tier status:** Update tier status in PRD/state based on verification results
- **Generate feedback:** If verification failed, generate feedback for agent/user (what failed, which file/criterion, suggested fix)
- **Handle failures:** If quality fails, either mark tier as "incomplete" (rework) or "complete with warnings" (log and proceed) per policy

**Implementation:** Create `src/verification/tier_end.rs` with `verify_tier_end()` function. Integrate with orchestrator tier completion point.

**Integration with orchestrator:**

In `src/core/orchestrator.rs`, extend tier completion logic:

```rust
use crate::verification::tier_end::{verify_tier_end, EndVerificationError, EndVerificationResult, TierStatus};

impl Orchestrator {
    pub async fn complete_tier(
        &self,
        tier_node: &TierNode,
        outcome: &TierOutcome,
        context: &OrchestratorContext,
    ) -> Result<TierStatus> {
        // Collect tier artifacts
        let artifacts = self.collect_tier_artifacts(tier_node, context).await?;

        // Compute diff
        let diff = self.compute_tier_diff(tier_node, context).await?;

        // Run end verification
        let verification_result = verify_tier_end(
            tier_node.tier_type,
            outcome,
            &artifacts,
            &diff,
            &self.config,
            context,
        ).await?;

        // Handle verification results
        let tier_status = match verification_result.status {
            VerificationStatus::Pass => {
                // Mark tier as complete
                TierStatus::Complete
            }
            VerificationStatus::Fail => {
                // Mark tier as incomplete (rework required)
                TierStatus::Incomplete {
                    reason: format!("Verification failed: {:?}", verification_result.findings),
                    feedback: verification_result.feedback.clone(),
                }
            }
            VerificationStatus::Warning => {
                // Mark tier as complete with warnings
                TierStatus::CompleteWithWarnings {
                    warnings: verification_result.findings,
                }
            }
        };

        // Persist verification results
        self.persist_verification_result(&tier_node.id, &verification_result).await?;

        // Update tier status in PRD/state
        self.update_tier_status(tier_node, &tier_status).await?;

        // Generate feedback if verification failed
        if matches!(tier_status, TierStatus::Incomplete { .. }) {
            self.generate_verification_feedback(tier_node, &verification_result).await?;
        }

        Ok(tier_status)
    }
}
```

**Verification function implementation:**

```rust
// src/verification/tier_end.rs

use crate::types::{TierType, Platform};
use crate::config::PuppetMasterConfig;
use crate::core::{OrchestratorContext, TierOutcome};
use crate::platforms::PlatformRunner;
use anyhow::{Result, Context};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EndVerificationResult {
    pub tier_type: TierType,
    pub node_id: String,
    pub status: VerificationStatus,
    pub wiring_check: WiringCheckResult,
    pub acceptance_check: AcceptanceCheckResult,
    pub quality_check: QualityCheckResult,
    pub findings: Vec<VerificationFinding>,
    pub feedback: Option<String>,
    pub timestamp: chrono::DateTime<Utc>,
}

// DRY:FN:verify_tier_end — Verify tier completion and quality
pub async fn verify_tier_end(
    tier_type: TierType,
    outcome: &TierOutcome,
    artifacts: &TierArtifacts,
    diff: &Option<String>,
    config: &PuppetMasterConfig,
    context: &OrchestratorContext,
) -> Result<EndVerificationResult> {
    let mut findings = Vec::new();

    // 1. Re-run wiring check
    let wiring_result = re_run_wiring_check(tier_type, config, context).await?;
    if !wiring_result.passed {
        findings.extend(wiring_result.findings.into_iter().map(|f| VerificationFinding {
            category: FindingCategory::ConfigWiring,
            severity: FindingSeverity::Major,
            message: f,
            suggestion: Some("Ensure new config/settings introduced during tier are properly wired".to_string()),
        }));
    }

    // 2. Run acceptance criteria
    let acceptance_result = run_acceptance_criteria(tier_type, outcome, artifacts, config).await?;
    if !acceptance_result.passed {
        findings.extend(acceptance_result.findings.into_iter().map(|f| VerificationFinding {
            category: FindingCategory::AcceptanceCriteria,
            severity: FindingSeverity::Critical,
            message: f,
            suggestion: Some("Ensure acceptance criteria from PRD are met".to_string()),
        }));
    }

    // 3. Run quality verification
    let quality_result = run_quality_verification(tier_type, artifacts, diff, config, context).await?;
    if !quality_result.passed {
        findings.extend(quality_result.findings.into_iter().map(|f| VerificationFinding {
            category: FindingCategory::Quality,
            severity: f.severity,
            message: f.message,
            suggestion: f.suggestion,
        }));
    }

    // Determine overall status
    let status = if findings.iter().any(|f| matches!(f.severity, FindingSeverity::Critical)) {
        VerificationStatus::Fail
    } else if findings.iter().any(|f| matches!(f.severity, FindingSeverity::Major)) {
        VerificationStatus::Warning
    } else {
        VerificationStatus::Pass
    };

    // Generate feedback if verification failed
    let feedback = if matches!(status, VerificationStatus::Fail) {
        Some(generate_verification_feedback(&findings, artifacts, diff)?)
    } else {
        None
    };

    Ok(EndVerificationResult {
        tier_type,
        node_id: context.node_id.clone(),
        status,
        wiring_check: wiring_result,
        acceptance_check: acceptance_result,
        quality_check: quality_result,
        findings,
        feedback,
        timestamp: Utc::now(),
    })
}

async fn run_quality_verification(
    tier_type: TierType,
    artifacts: &TierArtifacts,
    diff: &Option<String>,
    config: &PuppetMasterConfig,
    context: &OrchestratorContext,
) -> Result<QualityCheckResult> {
    let mut findings = Vec::new();

    // 3a. Code review by reviewer subagent (required, not optional)
    let reviewer_result = run_reviewer_subagent(tier_type, artifacts, diff, config, context).await?;
    if !reviewer_result.passed {
        findings.extend(reviewer_result.findings);
    }

    // 3b. Quality gate criteria (required as well)
    let quality_gate_result = run_quality_gate_criteria(tier_type, artifacts, diff, config).await?;
    if !quality_gate_result.passed {
        findings.extend(quality_gate_result.findings);
    }

    Ok(QualityCheckResult {
        passed: findings.is_empty(),
        reviewer_result,
        quality_gate_result,
        findings,
    })
}

async fn run_reviewer_subagent(
    tier_type: TierType,
    artifacts: &TierArtifacts,
    diff: &Option<String>,
    config: &PuppetMasterConfig,
    context: &OrchestratorContext,
) -> Result<ReviewerResult> {
    // DRY requirement: resolve reviewer subagents through the subagent registry using execution_unit_context
    // plus reviewer role metadata — never hardcode "code-reviewer" or select by tier-only lookup.
    let reviewer_subagent = select_reviewer_subagent(context.execution_unit_context(), tier_type)?;
    // Implementation note: select_reviewer_subagent() filters registry entries by reviewer capability,
    // node/package/lane context, and the configured execution policy for this unit.

    // Build review prompt
    let review_prompt = build_review_prompt(artifacts, diff, tier_type)?;

    // DRY requirement: must use platform_specs functions — never hardcode platform-specific behavior
    // Invoke reviewer subagent via platform runner
    let platform = get_platform_for_tier(tier_type, config)?;
    let model = get_model_for_tier(tier_type, config)?;

    // DRY: Use platform_specs to get runner — DO NOT use match statements for platform selection
    let runner = get_platform_runner(platform)?;
    // DRY requirement: execute_with_subagent must use platform_specs::get_subagent_invocation_format() internally
    let review_output = runner.execute_with_subagent(
        &reviewer_subagent,
        &review_prompt,
        &context.workspace,
    ).await?;

    // Parse reviewer output as structured SubagentOutput
    let parsed_output = parse_reviewer_output(&review_output.stdout)?;

    // Extract findings from reviewer output
    let findings = parsed_output.findings.into_iter()
        .map(|f| QualityFinding {
            severity: f.severity,
            message: f.description,
            file: f.file,
            line: f.line,
            suggestion: f.suggestion,
        })
        .collect();

    Ok(ReviewerResult {
        passed: findings.iter().all(|f| matches!(f.severity, Severity::Info | Severity::Minor)),
        findings,
        reviewer_feedback: parsed_output.task_report,
    })
}

async fn run_quality_gate_criteria(
    tier_type: TierType,
    artifacts: &TierArtifacts,
    diff: &Option<String>,
    config: &PuppetMasterConfig,
) -> Result<QualityGateResult> {
    let mut findings = Vec::new();

    // Get quality criteria for this tier type
    let quality_criteria = get_quality_criteria_for_tier(tier_type)?;

    // Run each quality check
    for criterion in quality_criteria {
        let check_result = run_quality_check(&criterion, artifacts, diff, config).await?;
        if !check_result.passed {
            findings.push(QualityFinding {
                severity: criterion.severity,
                message: check_result.message,
                file: check_result.file,
                line: check_result.line,
                suggestion: check_result.suggestion,
            });
        }
    }

    Ok(QualityGateResult {
        passed: findings.is_empty(),
        findings,
    })
}

fn get_quality_criteria_for_tier(tier_type: TierType) -> Result<Vec<QualityCriterion>> {
    match tier_type {
        TierType::Phase => Ok(vec![
            QualityCriterion {
                name: "document_quality".to_string(),
                check_type: QualityCheckType::DocumentReview,
                severity: FindingSeverity::Major,
            },
        ]),
        TierType::Task => Ok(vec![
            QualityCriterion {
                name: "design_doc_quality".to_string(),
                check_type: QualityCheckType::DocumentReview,
                severity: FindingSeverity::Major,
            },
        ]),
        TierType::Subtask => Ok(vec![
            QualityCriterion {
                name: "no_new_clippy_warnings".to_string(),
                check_type: QualityCheckType::Linter,
                severity: FindingSeverity::Major,
            },
            QualityCriterion {
                name: "new_code_has_tests".to_string(),
                check_type: QualityCheckType::TestCoverage,
                severity: FindingSeverity::Critical,
            },
            QualityCriterion {
                name: "no_todos_without_tickets".to_string(),
                check_type: QualityCheckType::CodeReview,
                severity: FindingSeverity::Minor,
            },
        ]),
        TierType::Iteration => Ok(vec![]), // Iteration quality checked at subtask level
    }
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, Gate:GATE-005

**Error handling:**

- **Artifact collection failure:** If artifacts cannot be collected, return `VerificationStatus::Warning` with Info finding
- **Diff computation failure:** If diff cannot be computed, log warning and continue (diff may not be applicable)
- **Reviewer subagent failure:** If reviewer subagent fails, return `VerificationStatus::Fail` with Critical finding (reviewer is required)
- **Quality gate failure:** If quality gate fails, return appropriate status based on severity (Critical → Fail, Major/Minor → Warning)

### Summary table -- start vs end, what runs when

| Boundary | When | Config-wiring | Wiring/readiness (GUI? backend? steps? gaps?) | Acceptance criteria | Quality verification |
|----------|------|----------------|-----------------------------------------------|--------------------|------------------------|
| **Start Phase** | Enter phase | Yes | Yes | -- | -- |
| **Start Task** | Enter task | Yes | Yes | -- | -- |
| **Start Subtask** | Enter subtask | Yes | Yes | -- | -- |
| **Start Iteration** | Enter iteration | Yes | (optional; can defer to tier) | -- | -- |
| **End Phase** | Phase complete | -- | Yes (re-check) | Yes (gate) | Yes (code/artifact review) |
| **End Task** | Task complete | -- | Yes (re-check) | Yes (gate) | Yes (code/artifact review) |
| **End Subtask** | Subtask complete | -- | Yes (re-check) | Yes (gate) | Yes (code/artifact review) |

### Gaps and potential issues in start/end verification
This section closes the remaining start/end verification gaps and is normative.

### Canonical validation-table source of truth
Start/end verification uses one static mapping table maintained with the orchestrator code and referenced by the planning docs.

Each row MUST contain:
- config field
- GUI control or UI source
- backend consumer
- applicable tier set (`phase`, `task`, `subtask`, `iteration`, `interview_phase` as applicable)
- required/optional execution impact
- default/fallback behavior

This table is the source of truth for `validate_config_wiring_for_tier(...)`. Readiness MUST NOT be heuristic prose.

ContractRef: ContractName:Plans/Contracts_V0.md, PolicyRule:Plans/orchestrator-subagent-integration.md#config-wiring-verification

### Start-of-tier verification
Start-of-phase, start-of-task, and start-of-subtask verification always run the same categories in this order:
1. config-wiring validation against the canonical table
2. readiness validation for required upstream artifacts and dependencies
3. operation-sequence validation
4. known-gap detection for execution-affecting unresolved prerequisites

A tier MUST NOT start when a required execution-affecting field is unwired, unavailable, or inconsistent.

ContractRef: ContractName:Plans/Executor_Protocol.md, PolicyRule:Plans/orchestrator-subagent-integration.md#tier-start-preconditions

### End-of-tier verification
End-of-phase, end-of-task, and end-of-subtask verification always run the same categories in this order:
1. config-wiring re-check for execution-affecting settings used during the tier
2. acceptance check for the tier’s declared outputs and completion criteria
3. quality review
4. feedback emission for any failed requirement, quality finding, or retry/remediation trigger

### Canonical quality matrix
| Tier | Required quality review |
|---|---|
| Phase | artifact completeness, acceptance coverage, cross-doc integrity, terminology alignment |
| Task | design/contract correctness, dependency consistency, fit with parent phase intent |
| Subtask | code review, tests for touched scope, lint/format for touched scope, implementation acceptance |
| Iteration | local acceptance of the concrete retry/fix objective when iteration-level execution is used |
| Interview phase | document completeness, decision clarity, unresolved-clarification handling, output readiness for downstream plan generation |

### Reviewer participation
The reviewer/quality path is not optional.
- it runs at the end of every tier completion path
- it runs again on retry paths when the tier is re-attempted after a failure
- it runs when a quality gate fails and the remediation loop feeds back into the same tier

### Failure vs warning policy
- required execution-affecting mismatches fail verification
- missing or inconsistent upstream dependencies required for the declared tier objective fail verification
- display-only, observability-only, or deferred non-execution-affecting mismatches may warn when they do not change runtime behavior
- performance concerns MUST NOT weaken the verification categories; implementation may scope work to changed artifacts, but may not silently skip categories

ContractRef: PolicyRule:Plans/orchestrator-subagent-integration.md#verification-category-invariant

### Interview-phase mirror
Interview phases use the same start/end pattern:
- start = wiring + readiness + sequence
- end = wiring re-check + acceptance + quality

`interview-subagent-integration.md` is responsible for the interview-phase-specific quality criteria and UI/runtime consequences, but it MUST mirror this contract rather than invent an alternate lifecycle.

ContractRef: ContractName:Plans/interview-subagent-integration.md

### Unrelated-failure escalation
When a tier fails because of issues outside its intended scope:
1. retry once automatically using the same config
2. if retry also fails, raise an Assistant chat CTA with review, skip, retry, and abort options
3. use a modal instead only for P0 risk such as possible data loss or workspace corruption
4. do not silently bypass unrelated failures

### Feedback loop
Verification failures MUST produce structured feedback identifying the failing criterion, affected artifact or file when known, and the expected next action. Rework loops reuse the existing incomplete-task / remediation flow rather than inventing a separate ad hoc channel.

ContractRef: ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md
### 1. Hook-Based Lifecycle Middleware (BeforeUnit/AfterUnit)


**Concept:** Puppet Master should support **BeforeUnit** and **AfterUnit** hooks that run automatically at execution unit boundaries (Phase, Task, Subtask, Iteration). Hooks handle lifecycle concerns (tracking, state management, validation) separately from execution logic.

**Platform-specific hook registration:**

- **Cursor:** Register hooks in `.cursor/hooks.json` or `~/.cursor/hooks.json` for native hooks (`SubagentStart`, `SubagentStop`, `beforeSubmitPrompt`, `afterAgentResponse`). Also implement orchestrator-level hooks in Rust that wrap platform calls. **Note:** CLI subagents have reported issues (Feb 2026); use orchestrator-level hooks as primary, native hooks as enhancement when CLI subagents are fixed.
- **Codex:** Use CLI lifecycle outputs and orchestrator-managed hooks/middleware. Implement orchestrator-level hooks as primary middleware.
- **Claude Code:** Register hooks in `.claude/settings.json` for native hooks (`SubagentStart`, `SubagentStop`, `PreToolUse`, `PostToolUse`, `SessionStart`, `SessionEnd`). Also implement orchestrator-level hooks. Native hooks can block operations (exit code 2) or inject context.
- **Gemini:** Gemini is a Direct API provider; hooks are implemented at the orchestrator level. No platform-native hook config file is needed for Gemini.
- **Copilot:** Use CLI lifecycle outputs and orchestrator-managed hooks/middleware. Implement orchestrator-level hooks as primary.

**Hook trait definition:**

```rust
// src/core/hooks.rs or src/verification/hooks.rs

use crate::types::{Platform, TierType};
use crate::core::state_persistence::ExecutionUnitContext;
use anyhow::Result;

/// Hook context passed to BeforeUnit hook
pub struct BeforeUnitContext {
    pub run_id: String,
    pub node_id: String,
    pub attempt_id: String,
    pub lane_id: String,
    pub worktree_id: String,
    pub execution_role: String,
    pub requested_account_policy: String,
    pub tool_use_id: String,
    pub tier_type: TierType,
    pub platform: Platform,
    pub model: String,
    pub selected_subagents: Vec<String>,
    pub config_snapshot: serde_json::Value,
    pub known_gaps: Vec<String>,
}

/// Hook context passed to AfterUnit hook
pub struct AfterUnitContext {
    pub run_id: String,
    pub node_id: String,
    pub attempt_id: String,
    pub lane_id: String,
    pub worktree_id: String,
    pub execution_role: String,
    pub requested_account_policy: String,
    pub tool_use_id: String,
    pub tier_type: TierType,
    pub platform: Platform,
    pub subagent_output: String,
    pub completion_status: CompletionStatus,
    pub iteration_count: u32,
}

pub enum CompletionStatus {
    Success,
    Failure(String),
    Warning(String),
}

/// BeforeUnit hook trait
pub trait BeforeUnitHook: Send + Sync {
    fn execute(&self, ctx: &BeforeUnitContext) -> Result<BeforeUnitResult>;
    fn name(&self) -> &str;
}

/// AfterUnit hook trait
pub trait AfterUnitHook: Send + Sync {
    fn execute(&self, ctx: &AfterUnitContext) -> Result<AfterUnitResult>;
    fn name(&self) -> &str;
}

pub struct BeforeUnitResult {
    pub active_subagent: Option<String>,
    pub injected_context: Option<String>,
    pub block: bool,
    pub block_reason: Option<String>,
}

pub struct AfterUnitResult {
    pub validation_passed: bool,
    pub validation_error: Option<String>,
    pub request_retry: bool,
    pub retry_reason: Option<String>,
}

pub struct HookRegistry {
    before_unit_hooks: Vec<Box<dyn BeforeUnitHook>>,
    after_unit_hooks: Vec<Box<dyn AfterUnitHook>>,
}

impl HookRegistry {
    pub fn new() -> Self {
        Self { before_unit_hooks: Vec::new(), after_unit_hooks: Vec::new() }
    }
    pub fn register_before_unit(&mut self, hook: Box<dyn BeforeUnitHook>) {
        self.before_unit_hooks.push(hook);
    }
    pub fn register_after_unit(&mut self, hook: Box<dyn AfterUnitHook>) {
        self.after_unit_hooks.push(hook);
    }
    pub fn execute_before_unit(&self, ctx: &BeforeUnitContext) -> Result<BeforeUnitResult> {
        let mut active_subagent = None;
        let mut injected_contexts = Vec::new();
        let mut block = false;
        let mut block_reason = None;
        for hook in &self.before_unit_hooks {
            match safe_hook_main(|| hook.execute(ctx)) {
                Ok(result) => {
                    if result.block { block = true; block_reason = Some(result.block_reason.unwrap_or_else(|| format!("Hook {} blocked", hook.name()))); break; }
                    if let Some(subagent) = result.active_subagent { active_subagent = Some(subagent); }
                    if let Some(ctx) = result.injected_context { injected_contexts.push(ctx); }
                }
                Err(e) => { log::warn!("BeforeUnit hook {} failed: {}", hook.name(), e); }
            }
        }
        Ok(BeforeUnitResult { active_subagent, injected_context: if injected_contexts.is_empty() { None } else { Some(injected_contexts.join("\n\n")) }, block, block_reason })
    }
    pub fn execute_after_unit(&self, ctx: &AfterUnitContext) -> Result<AfterUnitResult> {
        let mut validation_passed = true;
        let mut validation_error = None;
        let mut request_retry = false;
        let mut retry_reason = None;
        for hook in &self.after_unit_hooks {
            match safe_hook_main(|| hook.execute(ctx)) {
                Ok(result) => {
                    if !result.validation_passed { validation_passed = false; validation_error = result.validation_error; request_retry = result.request_retry; retry_reason = result.retry_reason; break; }
                }
                Err(e) => { log::warn!("AfterUnit hook {} failed: {}", hook.name(), e); }
            }
        }
        Ok(AfterUnitResult { validation_passed, validation_error, request_retry, retry_reason })
    }
}

fn safe_hook_main<F, T>(hook_fn: F) -> Result<T>
where F: FnOnce() -> Result<T>,
{ hook_fn() }
```

**Built-in hooks:** `ActiveSubagentTrackerHook` (BeforeUnit), `TierContextInjectorHook` (BeforeUnit), `StaleStatePrunerHook` (BeforeUnit), `HandoffValidatorHook` (AfterUnit).

**Integration:** In `src/core/orchestrator.rs`, call `hook_registry.execute_before_unit` before subagent execution and `hook_registry.execute_after_unit` after. Update `ExecutionUnitContext.active_subagent` from `BeforeUnitResult`. Always register built-in hooks even when platform-native hooks are also registered.
### 2. Structured Handoff Report Validation

**Concept:** Enforce a standardized output format for subagent invocations. Every subagent must produce a structured handoff report with required fields. If output is malformed, block and request one retry (fail-safe after retry).

**BeforeHandoffValidation responsibilities:**

- **Detect output format:** Detect if subagent output is structured (JSON) or unstructured (text)
- **Load validation schema:** Load validation schema for `SubagentOutput` format
- **Prepare validation context:** Build validation context with expected fields and format requirements

**DuringHandoffValidation responsibilities:**

- **Parse structured output:** Attempt to parse output as structured `SubagentOutput` JSON
- **Validate required fields:** Validate that all required fields are present (`task_report` is required)
- **Validate field types:** Validate that field types match schema (string, array, enum, etc.)
- **Validate findings format:** Validate that findings array contains valid `Finding` objects with required fields
- **Extract from text (fallback):** If JSON parsing fails, attempt to extract structured data from text output
- **Request retry if malformed:** If output is malformed and retry not yet attempted, request one retry with format instruction

**AfterHandoffValidation responsibilities:**

- **Persist validation results:** Save validation results to `.puppet-master/state/handoff-validation-{node_id}.json`
- **Update tier context:** Update tier context with validated `SubagentOutput` (task_report, downstream_context, findings)
- **Handle validation failures:** If validation fails after retry, proceed with partial output but mark tier as "complete with warnings"

**Required output format:**

```rust
// src/types/subagent_output.rs (new file)

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
// DRY:DATA:SubagentOutput — Structured subagent output format
pub struct SubagentOutput {
    /// Task report: what the subagent did
    pub task_report: String,
    /// Downstream context: information for next tier/subagent
    #[serde(skip_serializing_if = "Option::is_none")]
    pub downstream_context: Option<String>,
    /// Findings: quality issues, blockers, recommendations
    #[serde(default)]
    pub findings: Vec<Finding>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Finding {
    pub severity: Severity,
    pub category: String,   // e.g., "security", "performance", "maintainability"
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file: Option<PathBuf>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub line: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub suggestion: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Severity {
    Critical,
    Major,
    Minor,
    Info,
}

#[derive(Debug, thiserror::Error)]
pub enum ValidationError {
    #[error("JSON parse error: {0}")]
    JsonParse(#[from] serde_json::Error),
    #[error("Missing required field: {0}")]
    MissingField(String),
    #[error("Invalid severity: {0}")]
    InvalidSeverity(String),
    #[error("Text extraction failed: {0}")]
    TextExtraction(String),
    #[error("Validation failed after retry: {0}")]
    ValidationFailedAfterRetry(String),
}
```

**Platform-specific parser implementation:**

Extend `src/platforms/output_parser.rs` with new parser methods:

```rust
// Add to ParsedOutput struct:
pub struct ParsedOutput {
    // ... existing fields ...
    /// Parsed subagent output if structured format detected
    pub subagent_output: Option<SubagentOutput>,
}

// Add to OutputParser trait:
pub trait OutputParser: Send + Sync {
    // ... existing methods ...

    /// Parse structured subagent output (platform-specific)
    fn parse_subagent_output(&self, stdout: &str, stderr: &str) -> Result<SubagentOutput, ValidationError>;

    /// Extract structured output from text (fallback)
    fn extract_subagent_output_from_text(&self, stdout: &str, stderr: &str) -> Result<SubagentOutput, ValidationError>;
}

// Implementation for each platform parser:

impl OutputParser for CursorOutputParser {
    // DRY REQUIREMENT: Tag with // DRY:FN:parse_subagent_output_cursor
    fn parse_subagent_output(&self, stdout: &str, _stderr: &str) -> Result<SubagentOutput, ValidationError> {
        // DRY requirement: output format detection must use platform_specs — do not hardcode "--output-format json"
        // Cursor outputs JSON with --output-format json (from platform_specs)
        // Implementation note: Use platform_specs to determine expected output format for this platform
        let json: serde_json::Value = serde_json::from_str(stdout)
            .map_err(|e| ValidationError::JsonParse(e))?;

        // Extract structured fields
        let task_report = json.get("task_report")
            .and_then(|v| v.as_str())
            .ok_or_else(|| ValidationError::MissingField("task_report".to_string()))?
            .to_string();

        let downstream_context = json.get("downstream_context")
            .and_then(|v| v.as_str())
            .map(String::from);

        let findings = json.get("findings")
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|item| {
                        serde_json::from_value::<Finding>(item.clone()).ok()
                    })
                    .collect()
            })
            .unwrap_or_default();

        Ok(SubagentOutput {
            task_report,
            downstream_context,
            findings,
        })
    }

    fn extract_subagent_output_from_text(&self, stdout: &str, _stderr: &str) -> Result<SubagentOutput, ValidationError> {
        // Fallback: extract from text output
        // Look for structured markers (e.g., "Task Report:", "Findings:", etc.)
        // Or use LLM to extract structured data from text
        // Implementation depends on platform output format

        // Simple text extraction (can be enhanced with LLM)
        let task_report = if let Some(start) = stdout.find("Task Report:") {
            let end = stdout[start..].find("\n\n").unwrap_or(stdout.len() - start);
            stdout[start + 12..start + end].trim().to_string()
        } else {
            stdout.to_string() // Fallback: use entire output as task report
        };

        Ok(SubagentOutput {
            task_report,
            downstream_context: None,
            findings: Vec::new(), // Cannot extract findings from text reliably
        })
    }
}

// Similar implementations for other platform parsers...
```

**Validation workflow:**

```rust
// src/core/handoff_validation.rs

use crate::types::subagent_output::{SubagentOutput, ValidationError};
use crate::platforms::{PlatformRunner, OutputParser};

// DRY:DATA:HandoffValidator — Structured handoff validation system
pub struct HandoffValidator {
    parser: Box<dyn OutputParser>,
    max_retries: u32,
}

impl HandoffValidator {
    // DRY:FN:validate_subagent_output — Validate subagent output format
    // DRY requirement: must use platform_specs to determine parser type — never hardcode parser selection by platform
    pub async fn validate_subagent_output(
        &self,
        stdout: &str,
        stderr: &str,
        platform: Platform,
        retry_count: u32,
    ) -> Result<SubagentOutput, ValidationError> {
        // DRY: parser selection must use platform_specs to determine output format — do not use match platform statements
        // Try structured parsing first
        match self.parser.parse_subagent_output(stdout, stderr) {
            Ok(output) => {
                // Validate required fields
                self.validate_required_fields(&output)?;
                Ok(output)
            }
            Err(ValidationError::JsonParse(_)) => {
                // JSON parse failed, try text extraction
                if retry_count < self.max_retries {
                    // Request retry with format instruction
                    return Err(ValidationError::ValidationFailedAfterRetry(
                        "Output is not valid JSON. Please output structured JSON format.".to_string()
                    ));
                }

                // Max retries reached, try text extraction as fallback
                self.parser.extract_subagent_output_from_text(stdout, stderr)
                    .map_err(|e| ValidationError::TextExtraction(format!("Failed to extract from text: {}", e)))
            }
            Err(e) => {
                // Other validation error
                if retry_count < self.max_retries {
                    return Err(ValidationError::ValidationFailedAfterRetry(
                        format!("Validation failed: {}", e)
                    ));
                }
                Err(e)
            }
        }
    }

    fn validate_required_fields(&self, output: &SubagentOutput) -> Result<(), ValidationError> {
        // Validate task_report is not empty
        if output.task_report.trim().is_empty() {
            return Err(ValidationError::MissingField("task_report".to_string()));
        }

        // Validate findings have required fields
        for finding in &output.findings {
            if finding.description.trim().is_empty() {
                return Err(ValidationError::MissingField("finding.description".to_string()));
            }

            // Validate severity is valid
            match finding.severity {
                Severity::Critical | Severity::Major | Severity::Minor | Severity::Info => {}
            }
        }

        Ok(())
    }
}
```

**Integration with orchestrator:**

In `src/core/orchestrator.rs`, extend subagent execution:

```rust
use crate::core::handoff_validation::HandoffValidator;

impl Orchestrator {
    async fn execute_with_subagent(
        &self,
        platform: Platform,
        model: &str,
        subagent_name: &str,
        prompt: &str,
        context: &ExecutionUnitContext,
    ) -> Result<SubagentOutput> {
        let runner = self.get_platform_runner(platform)?;
        let mut retry_count = 0;

        loop {
            // Execute subagent
            let output = runner.execute_with_subagent(
                subagent_name,
                prompt,
                &context.workspace,
            ).await?;

            // Validate handoff output
            let validator = HandoffValidator::new(platform)?;
            match validator.validate_subagent_output(
                &output.stdout,
                &output.stderr,
                platform,
                retry_count,
            ).await {
                Ok(validated_output) => {
                    // Validation passed
                    return Ok(validated_output);
                }
                Err(ValidationError::ValidationFailedAfterRetry(msg)) => {
                    // Request retry with format instruction
                    retry_count += 1;
                    if retry_count >= validator.max_retries() {
                        // Max retries reached, proceed with partial output
                        tracing::warn!("Handoff validation failed after {} retries: {}", retry_count, msg);
                        return Ok(validator.extract_partial_output(&output.stdout, &output.stderr)?);
                    }

                    // Update prompt with format instruction
                    let updated_prompt = format!(
                        "{}\n\n**IMPORTANT:** Output must be valid JSON matching this format:\n{}\n\nCurrent output was not valid JSON. Please retry with structured JSON output.",
                        prompt,
                        serde_json::to_string_pretty(&SubagentOutput::example())?
                    );

                    // Continue loop with updated prompt
                    continue;
                }
                Err(e) => {
                    return Err(anyhow!("Handoff validation error: {}", e));
                }
            }
        }
    }
}
```

**Error handling:**

- **JSON parse failure:** If JSON parsing fails, attempt text extraction; if that fails and retry not attempted, request retry with format instruction
- **Missing field failure:** If required field is missing, request retry with field requirement instruction
- **Invalid severity failure:** If severity is invalid, request retry with valid severity values
- **Max retries reached:** If max retries reached, proceed with partial output but mark tier as "complete with warnings"

```rust
                    .filter_map(|v| serde_json::from_value(v.clone()).ok())
                    .collect()
            })
            .unwrap_or_default();

        Ok(SubagentOutput {
            task_report,
            downstream_context,
            findings,
        })
    }
}

impl OutputParser for CodexOutputParser {
    // DRY:FN:parse_subagent_output_codex -- Parse Codex subagent output
    // DRY REQUIREMENT: Output format detection MUST use platform_specs -- DO NOT hardcode "JSONL" or output format
    ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Executor_Protocol.md
    fn parse_subagent_output(&self, stdout: &str, _stderr: &str) -> Result<SubagentOutput, ValidationError> {
        // DRY: Use platform_specs to determine expected output format -- DO NOT hardcode "Codex outputs JSONL"
        // Codex outputs JSONL (one JSON object per line) -- format from platform_specs
        let mut task_report = String::new();
        let mut downstream_context = None;
        let mut findings = Vec::new();

        for line in stdout.lines() {
            if let Ok(json) = serde_json::from_str::<serde_json::Value>(line) {
                // Look for Turn event with structured output
                if let Some(event_type) = json.get("type").and_then(|v| v.as_str()) {
                    if event_type == "Turn" || event_type == "turn" {
                        if let Some(content) = json.get("content") {
                            // Try to parse content as SubagentOutput
                            if let Ok(output) = serde_json::from_value::<SubagentOutput>(content.clone()) {
                                return Ok(output);
                            }
                            // Fallback: extract text content
                            if let Some(text) = content.as_str() {
                                task_report.push_str(text);
                            }
                        }
                    }
                }

                // Aggregate findings from multiple events
                if let Some(f) = json.get("findings").and_then(|v| v.as_array()) {
                    for finding_val in f {
                        if let Ok(finding) = serde_json::from_value::<Finding>(finding_val.clone()) {
                            findings.push(finding);
                        }
                    }
                }
            }
        }

        // If no structured output found, try to extract from text
        if task_report.is_empty() {
            return Err(ValidationError::TextExtraction("No structured output found in JSONL".to_string()));
        }

        Ok(SubagentOutput {
            task_report,
            downstream_context,
            findings,
        })
    }
}

impl OutputParser for ClaudeOutputParser {
    // DRY:FN:parse_subagent_output_claude -- Parse Claude Code subagent output
    // DRY REQUIREMENT: Output format detection MUST use platform_specs -- DO NOT hardcode "--output-format json"
    ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Executor_Protocol.md
    fn parse_subagent_output(&self, stdout: &str, _stderr: &str) -> Result<SubagentOutput, ValidationError> {
        // DRY: Use platform_specs to determine expected output format -- DO NOT hardcode "Claude outputs JSON"
        // Claude outputs JSON with --output-format json -- format from platform_specs
        let json: serde_json::Value = serde_json::from_str(stdout)?;

        // Claude wraps output in "result" -> "content" or direct fields
        let content = json.get("result")
            .and_then(|r| r.get("content"))
            .or_else(|| Some(&json))
            .ok_or_else(|| ValidationError::MissingField("result.content".to_string()))?;

        // Try direct parse
        if let Ok(output) = serde_json::from_value::<SubagentOutput>(content.clone()) {
            return Ok(output);
        }

        // Fallback: extract fields manually
        let task_report = content.get("task_report")
            .and_then(|v| v.as_str())
            .or_else(|| content.as_str())
            .ok_or_else(|| ValidationError::MissingField("task_report".to_string()))?
            .to_string();

        let downstream_context = content.get("downstream_context")
            .and_then(|v| v.as_str())
            .map(String::from);

        let findings = content.get("findings")
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|v| serde_json::from_value(v.clone()).ok())
                    .collect()
            })
            .unwrap_or_default();

        Ok(SubagentOutput {
            task_report,
            downstream_context,
            findings,
        })
    }
}

impl OutputParser for GeminiOutputParser {
    // DRY:FN:parse_subagent_output_gemini -- Parse Gemini subagent output
    // DRY REQUIREMENT: Output format detection MUST use platform_specs -- DO NOT hardcode "--output-format json"
    ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Executor_Protocol.md
    fn parse_subagent_output(&self, stdout: &str, _stderr: &str) -> Result<SubagentOutput, ValidationError> {
        // DRY: Use platform_specs to determine expected output format -- DO NOT hardcode "Gemini outputs JSON"
        // Gemini outputs JSON with --output-format json -- format from platform_specs
        let json: serde_json::Value = serde_json::from_str(stdout)?;

        // Gemini wraps in "candidates" -> [0] -> "content" -> "parts" -> [0] -> "text"
        let text = json.get("candidates")
            .and_then(|c| c.as_array())
            .and_then(|arr| arr.get(0))
            .and_then(|c| c.get("content"))
            .and_then(|c| c.get("parts"))
            .and_then(|p| p.as_array())
            .and_then(|arr| arr.get(0))
            .and_then(|p| p.get("text"))
            .and_then(|t| t.as_str())
            .ok_or_else(|| ValidationError::MissingField("candidates[0].content.parts[0].text".to_string()))?;

        // Try to parse text as JSON (Gemini may output JSON as text)
        if let Ok(output) = serde_json::from_str::<SubagentOutput>(text) {
            return Ok(output);
        }

        // Fallback: extract from text patterns
        Err(ValidationError::TextExtraction("Gemini text output requires pattern extraction".to_string()))
    }
}

impl OutputParser for CopilotOutputParser {
    // DRY:FN:parse_subagent_output_copilot -- Parse Copilot subagent output
    // DRY REQUIREMENT: Output format detection MUST use platform_specs -- DO NOT hardcode "Copilot outputs text"
    ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Executor_Protocol.md
    fn parse_subagent_output(&self, stdout: &str, _stderr: &str) -> Result<SubagentOutput, ValidationError> {
        // DRY: Use platform_specs to determine expected output format -- DO NOT hardcode "Copilot outputs text"
        // Copilot outputs text (no JSON) -- format from platform_specs
        // Extract structured sections via regex/pattern matching

        let combined = format!("{stdout}\n{stderr}");

        // Pattern: ## Task Report\n\n...content...
        let task_report_re = Regex::new(r"(?s)##\s*Task\s*Report\s*\n\n(.*?)(?=\n##|\z)").unwrap();
        let task_report = task_report_re.captures(&combined)
            .and_then(|cap| cap.get(1))
            .map(|m| m.as_str().trim().to_string())
            .ok_or_else(|| ValidationError::MissingField("Task Report section".to_string()))?;

        // Pattern: ## Downstream Context\n\n...content... (optional)
        let downstream_re = Regex::new(r"(?s)##\s*Downstream\s*Context\s*\n\n(.*?)(?=\n##|\z)").unwrap();
        let downstream_context = downstream_re.captures(&combined)
            .and_then(|cap| cap.get(1))
            .map(|m| m.as_str().trim().to_string());

        // Pattern: ## Findings\n\n- [Severity] Category: Description (file:line) Suggestion
        let findings_re = Regex::new(r"(?m)^-\s*\[(Critical|Major|Minor|Info)\]\s*(\w+):\s*(.*?)(?:\s*\(([^:]+):(\d+)\))?(?:\s*Suggestion:\s*(.*))?$").unwrap();
        let mut findings = Vec::new();

        if let Some(findings_section) = Regex::new(r"(?s)##\s*Findings\s*\n\n(.*?)(?=\n##|\z)").unwrap().captures(&combined) {
            for cap in findings_re.captures_iter(findings_section.get(1).unwrap().as_str()) {
                let severity = match cap.get(1).unwrap().as_str() {
                    "Critical" => Severity::Critical,
                    "Major" => Severity::Major,
                    "Minor" => Severity::Minor,
                    "Info" => Severity::Info,
                    _ => continue,
                };

                findings.push(Finding {
                    severity,
                    category: cap.get(2).unwrap().as_str().to_string(),
                    description: cap.get(3).unwrap().as_str().to_string(),
                    file: cap.get(4).map(|m| PathBuf::from(m.as_str())),
                    line: cap.get(5).and_then(|m| m.as_str().parse().ok()),
                    suggestion: cap.get(6).map(|m| m.as_str().to_string()),
                });
            }
        }

        Ok(SubagentOutput {
            task_report,
            downstream_context,
            findings,
        })
    }
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

**Validation function:**

```rust
// src/core/hooks/handoff_validator.rs

use crate::platforms::output_parser::{OutputParser, create_parser};
use crate::types::{Platform, SubagentOutput};
use crate::core::hooks::ValidationError;

pub fn validate_subagent_output(
    output: &str,
    stderr: &str,
    platform: Platform,
) -> Result<SubagentOutput, ValidationError> {
    let parser = create_parser(platform);
    parser.parse_subagent_output(output, stderr)
}
```

**Validation logic in AfterTier hook:** AfterTier hook calls `validate_subagent_output(output: &str, stderr: &str, platform: Platform) -> Result<SubagentOutput, ValidationError>`. If validation fails:
1. Log error with details (platform, error type, partial output snippet).
2. Request one retry (re-run subagent with "format your output as structured JSON" instruction appended to prompt).
3. If retry also fails, proceed with partial output (fail-safe) but mark tier as "complete with warnings" in `ExecutionUnitContext`.

**Integration with existing ParsedOutput:**

Modify `src/platforms/output_parser.rs` to populate `subagent_output` field:

```rust
impl OutputParser for CursorOutputParser {
    fn parse(&self, stdout: &str, stderr: &str) -> ParsedOutput {
        let mut output = ParsedOutput::new(stdout.to_string());
        // ... existing parsing ...

        // Try to parse structured subagent output
        output.subagent_output = self.parse_subagent_output(stdout, stderr).ok();

        output
    }
}
```

**Benefits:** Ensures Phase/Task/Subtask reliably know what their subagents produced; enables automated remediation loops; supports cross-tier context passing; provides structured error reporting for debugging.

### 3. Remediation Loop for Critical/Major Findings


**Concept:** When quality verification finds Critical or Major issues, block tier completion and enter a remediation loop. Re-run reviewer subagent until Critical/Major findings are resolved or escalated. Minor/Info findings log and proceed.

**Severity levels:**

- **Critical:** Security vulnerabilities, data loss risks, breaking changes -- **block completion**.
- **Major:** Performance issues, maintainability problems, test failures -- **block completion**.
- **Minor:** Code style, minor optimizations, suggestions -- **log and proceed**.
- **Info:** Documentation, comments, non-blocking recommendations -- **log and proceed**.

**Remediation loop implementation:**

```rust
// src/core/remediation.rs (new file)

use crate::types::SubagentOutput;
use crate::core::hooks::Severity;
use crate::core::orchestrator::Orchestrator;

// DRY:DATA:RemediationLoop — Remediation loop for Critical/Major findings
pub struct RemediationLoop {
    max_retries: u32,
    orchestrator: Arc<Orchestrator>,
}

impl RemediationLoop {
    // DRY:FN:new — Create remediation loop
    pub fn new(max_retries: u32, orchestrator: Arc<Orchestrator>) -> Self {
        Self { max_retries, orchestrator }
    }

    // DRY:FN:run — Run remediation loop for a tier
    // DRY REQUIREMENT: Reviewer subagent name MUST come from subagent_registry — NEVER hardcode "code-reviewer"
    ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Contracts_V0.md
    /// Run remediation loop for a tier
    pub async fn run(
        &self,
        node_id: &str,
        reviewer_output: SubagentOutput,
    ) -> Result<RemediationResult> {
        // DRY: Severity filtering logic is reusable — consider extracting to DRY:FN:filter_critical_major_findings
        let critical_major: Vec<_> = reviewer_output.findings
            .iter()
            .filter(|f| matches!(f.severity, Severity::Critical | Severity::Major))
            .collect();

        if critical_major.is_empty() {
            // Only Minor/Info findings: log and proceed
            self.log_findings(&reviewer_output.findings);
            return Ok(RemediationResult::Complete);
        }

        // Critical/Major findings: enter remediation loop
        let mut retry_count = 0;
        let mut current_findings = critical_major.clone();

        while retry_count < self.max_retries {
            // Mark tier as incomplete
            self.orchestrator.mark_tier_incomplete(node_id, &current_findings).await?;

            // Build remediation prompt
            let remediation_prompt = self.build_remediation_prompt(&current_findings);

            // DRY REQUIREMENT: Overseer and reviewer subagent names MUST come from subagent_registry — NEVER hardcode names
            // Re-run overseer subagent with remediation prompt
            // Implementation note: re_run_overseer_with_prompt MUST use subagent_registry to get overseer subagent name
            ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Contracts_V0.md
            let overseer_result = self.orchestrator
                .re_run_overseer_with_prompt(node_id, &remediation_prompt)
                .await?;

            // DRY REQUIREMENT: Reviewer subagent name MUST come from subagent_registry::get_reviewer_subagent_for_tier()
            // Re-run reviewer subagent
            // Implementation note: re_run_reviewer MUST use subagent_registry to get reviewer subagent name
            ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Contracts_V0.md
            let reviewer_result = self.orchestrator
                .re_run_reviewer(node_id)
                .await?;

            // Parse new findings
            let new_critical_major: Vec<_> = reviewer_result.findings
                .iter()
                .filter(|f| matches!(f.severity, Severity::Critical | Severity::Major))
                .collect();

            if new_critical_major.is_empty() {
                // All Critical/Major resolved
                return Ok(RemediationResult::Resolved);
            }

            // Check if findings changed (progress made)
            if self.findings_unchanged(&current_findings, &new_critical_major) {
                retry_count += 1;
                if retry_count >= self.max_retries {
                    // Escalate to parent-tier orchestrator
                    return Ok(RemediationResult::Escalate(new_critical_major));
                }
            } else {
                // Progress made, reset retry count
                retry_count = 0;
            }

            current_findings = new_critical_major;
        }

        Ok(RemediationResult::Escalate(current_findings))
    }

    fn build_remediation_prompt(&self, findings: &[&Finding]) -> String {
        let mut prompt = "CRITICAL/Major findings must be fixed before tier completion:\n\n".to_string();
        for finding in findings {
            prompt.push_str(&format!(
                "- [{}] {}: {}\n",
                format!("{:?}", finding.severity),
                finding.category,
                finding.description
            ));
            if let Some(file) = &finding.file {
                prompt.push_str(&format!("  File: {}\n", file.display()));
            }
            if let Some(line) = finding.line {
                prompt.push_str(&format!("  Line: {}\n", line));
            }
            if let Some(suggestion) = &finding.suggestion {
                prompt.push_str(&format!("  Suggestion: {}\n", suggestion));
            }
            prompt.push('\n');
        }
        prompt.push_str("\nPlease fix these issues and re-run verification.");
        prompt
    }

    fn findings_unchanged(&self, old: &[&Finding], new: &[&Finding]) -> bool {
        // Compare finding descriptions and locations
        old.len() == new.len() && old.iter().all(|o| {
            new.iter().any(|n| {
                o.description == n.description
                    && o.file == n.file
                    && o.line == n.line
            })
        })
    }

    fn log_findings(&self, findings: &[Finding]) {
        for finding in findings {
            log::info!(
                "[{}] {}: {}",
                format!("{:?}", finding.severity),
                finding.category,
                finding.description
            );
        }
    }
}

pub enum RemediationResult {
    Complete, // No Critical/Major findings
    Resolved, // Critical/Major findings resolved
    Escalate(Vec<Finding>), // Escalate to parent-tier orchestrator
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

**Integration with orchestrator:**

In `src/core/orchestrator.rs`, after gate passes and reviewer subagent runs:

```rust
// After reviewer subagent completes
let reviewer_output = parse_reviewer_output(&iteration_result.output)?;

// Run remediation loop
let remediation_result = self.remediation_loop
    .run(node_id, reviewer_output)
    .await?;

match remediation_result {
    RemediationResult::Complete => {
        // Proceed with tier completion
    }
    RemediationResult::Resolved => {
        // Re-run gate to verify fixes
        // Then proceed with tier completion
    }
    RemediationResult::Escalate(findings) => {
        // Escalate to parent-tier orchestrator
        self.escalate_to_parent(node_id, findings).await?;
        return Err(anyhow!("Tier {} escalated due to unresolved Critical/Major findings", node_id));
    }
}
```

**Platform-specific implementation:** Works identically across all platforms -- remediation loop is orchestrator-level logic, not platform-specific. All platforms receive remediation prompts and re-run subagents the same way. The overseer and reviewer subagents are re-run using the same platform/model as the original tier execution.

**Integration with existing quality verification:** This extends the existing "required reviewer subagent" requirement. The reviewer must output structured findings with severity; the orchestrator enforces the remediation loop. The remediation loop runs **after** the gate passes but **before** tier completion, ensuring Critical/Major issues are addressed before advancing.

### 4. Cross-Run Knowledge Continuity

**Concept:** Persist architectural decisions, established patterns, tech choices, and lessons learned across runs through canonical runtime storage, planning artifacts, and handoff bundles. When a new run starts, load prior context from those canonical sources to maintain continuity.

**What to persist:**

- **Architectural decisions:** Tech stack choices, design patterns, framework selections.
- **Established patterns:** Code organization, naming conventions, testing strategies.
- **Tech choices:** Dependency versions, tool configurations, environment setup.
- **Pitfalls encountered:** Known issues, workarounds, anti-patterns to avoid.

**Canonical storage posture:**

- orchestration continuity is derived from seglog/redb-backed runtime state, stored plan outputs, and normalized handoff bundles.
- `.puppet-master/memory/*` is not the canonical continuity source for orchestrator child runs.
- continuity records should be queryable and attributable without requiring a memory-manager sidecar file hierarchy.

**When to persist:** At phase completion, especially after planning/architecture work, extract durable decisions and patterns from canonical outputs and store them through the same runtime/project persistence path used for other orchestrator artifacts.

**When to load:** At run start, before Phase 1 begins, assemble continuity context from canonical persisted decisions, stored outputs, and handoff projections. The same continuity inputs may inform child selection (for example, a prior Rust decision may bias toward a Rust-focused child Persona), but they do not create subagent-specific durable memory.

**Platform-specific implementation:** Platform-agnostic. All platforms benefit from canonical continuity inputs injected into prompts, but the continuity source remains runtime storage and structured artifacts rather than memory files.

### 5. Active Agent Tracking

Active child tracking must project from canonical storage and events rather than from mutable side files.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md

Rules:
- `active-agents.json` is not canonical runtime truth.
- child visibility, conflict prevention, and status rollups come from seglog/redb projections.
- launch order, batch membership, subgroup membership, and parent-child lineage are canonical projection fields.
- stale child entries are resolved through canonical status and expiry logic, not side-file cleanup heuristics.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md
### 6. Safe Error Handling (Guaranteed Structured Output)

**Concept:** Hooks and verification functions must never crash the session. Use wrappers that guarantee structured output (JSON or Result) even on failure.

**Wrapper pattern:**

```rust
pub fn safe_hook_main<F>(hook_fn: F) -> String
where
    F: FnOnce() -> Result<HookOutput, HookError>,
{
    match hook_fn() {
        Ok(output) => serde_json::to_string(&output).unwrap_or_else(|_| r#"{"status":"ok"}"#.to_string()),
        Err(e) => serde_json::to_string(&HookErrorOutput {
            status: "error",
            message: e.to_string(),
            details: None,
        }).unwrap_or_else(|_| r#"{"status":"error","message":"unknown"}"#.to_string()),
    }
}
```

**Application:**

- **BeforeTier/AfterTier hooks:** Wrap hook execution in `safe_hook_main` so hooks never crash.
- **Verification functions:** Return `Result<(), VerificationError>` with structured error types.
- **Subagent output parsing:** On parse failure, return `SubagentOutput { task_report: raw_output, downstream_context: None, findings: vec![] }` (partial output) rather than crashing.

**Platform-specific implementation:** Platform-agnostic -- safe error handling is Rust-level. All platforms benefit from the same wrappers.

### 7. Lazy Lifecycle (State Created on First Write)


**Concept:** Verification state directories are created lazily (on first write) and pruned after inactivity. No explicit setup/teardown commands required.

**Lazy creation:**

- **BeforeTier hook:** On first tier start, create `.puppet-master/verification/<session-id>/` if it doesn't exist.
- **State files:** Create on first write (e.g., `active-subagents.json`, `handoff-reports.json`).
- **No setup command:** Users don't need to run "puppet-master setup" -- state is created automatically.

**Stale pruning:**

- **BeforeTier hook:** Prune verification state older than threshold (e.g., 2 hours of inactivity).
- **Pruning logic:** Check modification time of state files; delete if older than threshold.
- **No teardown command:** Cleanup happens automatically during normal operation.

**Platform-specific implementation:** Platform-agnostic -- lazy lifecycle is orchestrator-level file system management. All platforms benefit from the same behavior.

### 8. Structured Handoff Contract Enforcement at Runtime

**Concept:** Enforce the structured handoff format (Task Report + Downstream Context + Findings) at runtime via AfterTier hook validation, not just in prompts. This ensures reliability even if prompts are modified.

**Enforcement:**

- **AfterTier hook:** Calls `validate_subagent_output()` (see #2 above).
- **On validation failure:** Block response, request one retry with format instruction.
- **After retry:** If still malformed, proceed with partial output (fail-safe) but mark tier as "complete with warnings."

**Documentation:** Document the contract in AGENTS.md and in subagent prompt templates. State that subagents **must** produce structured output; runtime validation enforces it.

**Platform-specific implementation:**

- **Cursor/Codex/Claude/Gemini:** Parse JSON output; validate required fields (`task_report`, `downstream_context`, `findings`).
- **Copilot:** Parse text output; extract structured sections via regex or pattern matching; validate presence.

Provider capability rule: provider-doc findings are capability evidence, not a blanket bypass for local validation. For schema-critical handoffs, provider-native schema enforcement is preferred where available: Anthropic provider-doc guidance directs schema-critical workflows to **Structured Outputs** for guaranteed JSON schema conformance, and Gemini provider-doc guidance supports schema-bound structured output and SDK schema helpers. Across providers and `/transports`, PM still runs local validation and records downgrade behavior because transport support and adherence vary; unsupported or weak transports fall back to locally validated structured output or partial-output warnings.

**Integration with existing plan:** This complements the existing "required reviewer subagent" requirement. The reviewer must produce structured output; runtime validation ensures it.

### Platform-Specific Implementation Summary

| Feature | Cursor | Codex | Claude | Gemini | Copilot | Implementation Level |
|---------|--------|-------|--------|--------|---------|---------------------|
| **BeforeTier/AfterTier hooks** | Native hooks + orchestrator | CLI/provider bridge hooks + orchestrator | Native hooks + orchestrator | Native hooks + orchestrator | Orchestrator only | Orchestrator + platform hooks |
| **Handoff validation** | JSON parse | JSONL parse | JSON parse | JSON parse | Text parse | Platform-specific parser |
| **Remediation loop** | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator (platform-agnostic) |
| **Cross-session memory** | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator (platform-agnostic) |
| **Active agent tracking** | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator (platform-agnostic) |
| **Safe error handling** | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator (platform-agnostic) |
| **Lazy lifecycle** | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator (platform-agnostic) |
| **Contract enforcement** | JSON validation | JSONL validation | JSON validation | JSON validation | Text validation | Platform-specific validator |

**Key insight:** Most features are **orchestrator-level** (platform-agnostic). Only handoff validation and contract enforcement need platform-specific parsers (JSON vs JSONL vs text). Hooks can leverage platform-native hooks where available (Cursor, Claude, Gemini) but also work via orchestrator-level middleware for all platforms.

### Integration with Start/End Verification

These lifecycle and quality features **complement** the existing start/end verification:

- **BeforeTier hook** runs **before** `verify_tier_start` (tracks active subagent, injects context, prunes state).
- **AfterTier hook** runs **after** `verify_tier_end` (validates handoff format, tracks completion, safe error handling).
- **Remediation loop** extends the existing "required reviewer subagent" -- reviewer outputs structured findings; orchestrator enforces remediation.
- **Cross-session memory** enhances Phase 1 context (loads prior decisions before planning).
- **Active agent tracking** enhances logging and debugging (shows which subagent ran at each tier).

### Additional Gaps and Potential Issues for Lifecycle and Quality Features

**Gap #14: Platform-native hook registration and discovery**

**Issue:** How do we discover and register platform-native hooks (Cursor `.cursor/hooks.json`, Claude `.claude/settings.json`)? Gemini is a Direct API provider and does not use a platform-native hook config file. Should Puppet Master auto-discover hooks or require explicit configuration?

**Mitigation:**
- **Auto-discovery:** Scan for hook config files in project root and home directory on startup. Register discovered hooks as adapters.
- **Explicit config:** Add `platform_hooks` section to `PuppetMasterConfig`:
  ```yaml
  platform_hooks:
    cursor:
      enabled: true
      config_path: ".cursor/hooks.json"
    claude:
      enabled: true
      config_path: ".claude/settings.json"
    gemini:
      enabled: false
      # Gemini is a Direct API provider; hooks are orchestrator-level only
  ```
- **Fallback:** If platform-native hooks fail or are unavailable, fall back to orchestrator-level hooks (always available).

**Gap #15: Hook execution order and dependencies**

**Issue:** When multiple hooks are registered (built-in + platform-native), what is the execution order? Can hooks depend on each other? What if one hook blocks execution?

**Mitigation:**
- **Execution order:** Built-in hooks run first (ActiveSubagentTrackerHook, TierContextInjectorHook, StaleStatePrunerHook), then platform-native hooks, then custom hooks.
- **Dependencies:** Hooks should be independent. If a hook needs data from another hook, use shared context (`BeforeUnitContext`/`AfterUnitContext`).
- **Blocking:** First hook that blocks stops execution. Log which hook blocked and why.

**Gap #16: Structured output parsing reliability**

**Issue:** Platform output formats may vary (JSON vs JSONL vs text). Parsers may fail on edge cases (malformed JSON, partial output, streaming output). How do we handle parsing failures gracefully?

**Mitigation:**
- **Multi-pass parsing:** Try JSON parse first, then JSONL, then text extraction. Use best-effort parsing with fallbacks.
- **Partial output handling:** If parsing fails, extract what we can (e.g., `task_report` from text even if `findings` missing). Mark tier as "complete with warnings."
- **Parser testing:** Comprehensive test suite for each platform parser with edge cases (malformed JSON, unicode, large outputs, streaming).
- **Parser versioning:** Track parser version and platform CLI version. Update parsers when platform CLI changes.

**Gap #17: Remediation loop infinite retry risk**

**Issue:** Remediation loop could retry indefinitely if findings never resolve (e.g., false positives, unrelated failures). How do we detect and break infinite loops?

**Mitigation:**
- **Max retries:** Hard limit (default: 3) on remediation retries per tier.
- **Progress detection:** Compare findings between retries. If findings unchanged after 2 retries, escalate (don't retry again).
- **Escalation threshold:** After max retries, escalate to parent-tier orchestrator. Parent-tier can decide to skip, fix manually, or re-plan.
- **Timeout:** Remediation loop has overall timeout (e.g., 30 minutes). If timeout exceeded, escalate.

**Gap #18: Memory persistence conflicts and staleness**

**Issue:** Memory files may become stale (outdated decisions), conflict between runs (different decisions), or grow unbounded. How do we manage memory lifecycle?

**Mitigation:**
- **Versioning:** Each memory entry has timestamp. Load only recent entries (e.g., last 30 days) unless explicitly requested.
- **Conflict resolution:** When loading memory, detect conflicts (e.g., "Rust + Actix" vs "Python + FastAPI"). Prompt user or use most recent decision.
- **Pruning:** Prune old memory entries (older than threshold, e.g., 90 days) unless marked as "persistent."
- **Size limits:** Limit memory file sizes (e.g., max 10MB per file). Rotate or archive old entries.

**Gap #19: Active subagent tracking accuracy**

**Issue:** Active subagent tracking may be inaccurate if subagent selection changes mid-tier, or if platform-native hooks override selection. How do we ensure tracking reflects reality?

**Mitigation:**
- **Single source of truth:** `ExecutionUnitContext.active_subagent` is set by BeforeUnit hook (built-in ActiveSubagentTrackerHook). Platform-native hooks can override but must update `ExecutionUnitContext`.
- **Validation:** AfterUnit hook validates that tracked subagent matches actual execution (check platform logs or output for subagent name).
- **Fallback:** If tracking fails, infer subagent from output patterns (e.g., "rust-engineer" if output mentions Rust-specific patterns).

**Gap #20: Safe error handling performance overhead**

**Issue:** Wrapping every hook/verification function in `safe_hook_main` adds overhead. Could impact performance for high-frequency operations.

**Mitigation:**
- **Selective wrapping:** Only wrap hooks and verification functions that could panic or fail unpredictably. Trusted functions (e.g., simple getters) don't need wrapping.
- **Lazy evaluation:** Use `Result` types instead of panics where possible. Only wrap functions that could panic.
- **Performance testing:** Benchmark wrapped vs unwrapped functions. If overhead > 5%, optimize or remove wrapping for hot paths.

**Gap #21: Lazy lifecycle state directory permissions**

**Issue:** Lazy creation of state directories may fail due to permissions (e.g., `.puppet-master/verification/` not writable). How do we handle permission errors gracefully?

**Mitigation:**
- **Permission check:** Before creating directories, check write permissions. If not writable, log error and continue (state won't be persisted but execution continues).
- **Fallback location:** If default location not writable, try fallback (e.g., `/tmp/puppet-master-<user>/`).
- **User notification:** Log clear error message with instructions (e.g., "Cannot create state directory. Run: chmod 755 .puppet-master").

**Gap #22: Structured handoff contract enforcement prompt injection**

**Issue:** Subagents may ignore structured output format instructions in prompts. Runtime validation catches this, but retry may also fail if subagent doesn't understand format requirement.

**Mitigation:**
- **Explicit format examples:** Include JSON schema example in prompt:
  ```
  Required output format:
  {
    "task_report": "What I did...",
    "downstream_context": "Info for next tier...",
    "findings": [{"severity": "critical", "category": "security", ...}]
  }
  ```
- **Platform-specific instructions:** For Copilot (text-only), provide markdown format example instead of JSON.
- **Validation feedback:** If retry fails, include validation error in retry prompt: "Your output was missing 'task_report' field. Please include it."
- **Fail-safe:** After retry fails, extract partial output (best-effort) and proceed with warnings.

**Gap #23: Cross-platform hook adapter complexity**

**Issue:** Platform-native hook adapters (CursorNativeHookAdapter, ClaudeNativeHookAdapter, GeminiNativeHookAdapter) must handle different hook formats, communication protocols (JSON stdin/stdout, exit codes), and error handling. This adds complexity.

**Mitigation:**
- **Unified adapter trait:** Define `PlatformHookAdapter` trait with common interface:
  ```rust
  trait PlatformHookAdapter: Send + Sync {
      fn execute_before_unit(&self, ctx: &BeforeUnitContext) -> Result<BeforeTierResult>;
      fn execute_after_unit(&self, ctx: &AfterUnitContext) -> Result<AfterTierResult>;
      fn platform(&self) -> Platform;
  }
  ```
- **Platform-specific implementations:** Each platform adapter handles its own format/protocol internally.
- **Testing:** Test each adapter with mock hook scripts. Verify JSON parsing, exit code handling, error cases.
- **Documentation:** Document hook format for each platform in `docs/platform-hooks.md`.

**Gap #24: Memory extraction from Phase 1 output**

**Issue:** How do we extract architectural decisions, patterns, tech choices, and pitfalls from Phase 1 (Planning/Architecture) output? Phase 1 output is unstructured text, not structured JSON.

**Mitigation:**
- **Pattern matching:** Use regex/pattern matching to extract decisions (e.g., "We chose Rust + Actix" → save as architectural decision).
- **LLM extraction:** Run a lightweight extraction subagent (e.g., `knowledge-synthesizer` if promoted, otherwise a workflow-resolved drafting/synthesis Persona such as `general-purpose` or a retained specialty) on Phase 1 output to extract structured memory entries. Do not require a protected core `document-writer` Persona.
- **Manual tagging:** Allow Phase 1 subagent to explicitly tag decisions (e.g., `<memory:architecture>Rust + Actix</memory:architecture>`).
- **Best-effort:** Extract what we can. Missing extractions don't block execution; memory is enhancement, not requirement.

**Gap #25: Remediation loop subagent re-execution context**

**Issue:** When remediation loop re-runs overseer/reviewer subagents, do they get the same context (prompt, files, state) as original execution, or modified context (remediation prompt, updated files)?

**Mitigation:**
- **Modified context:** Re-run with remediation prompt appended, but include original context (files, state) so subagent has full picture.
- **Incremental fixes:** Each retry builds on previous fixes. Include previous iteration's output in context.
- **State preservation:** Don't reset tier state between remediation retries. Preserve progress (e.g., files modified, tests run).

**Gap #26: Hook performance impact on tier execution time**

**Issue:** Hooks add overhead to tier execution (BeforeUnit hooks run before every tier start, AfterUnit hooks run after every tier completion). Could slow down fast tiers significantly.

**Mitigation:**
- **Async hooks:** Run hooks asynchronously where possible (e.g., StaleStatePrunerHook can run in background).
- **Selective execution:** Skip hooks for Iteration tier (too frequent) or only run critical hooks (ActiveSubagentTrackerHook, HandoffValidatorHook).
- **Caching:** Cache hook results when inputs unchanged (e.g., TierContextInjectorHook can cache injected context for same tier type).
- **Performance monitoring:** Track hook execution time. If hooks > 10% of tier time, optimize or skip non-critical hooks.

**Gap #27: Structured output validation false positives**

**Issue:** Validation may incorrectly reject valid output (false positive) if parser is too strict, or accept invalid output (false negative) if parser is too lenient.

**Mitigation:**
- **Lenient validation:** Accept partial output (e.g., missing `downstream_context` is OK, missing `task_report` is not). Only reject if critical fields missing.
- **Parser testing:** Test with real platform outputs to tune validation strictness. Aim for < 1% false positive rate.
- **User feedback:** If validation fails, log raw output for debugging. Allow users to report false positives.
- **Parser updates:** Update parsers based on user feedback and platform CLI changes.

### Implementation Notes

- **Where:** New module `src/core/hooks.rs` or `src/verification/hooks.rs` for hook system; `src/core/memory.rs` for cross-session persistence; extend `SubagentOutput` in `src/types/` for structured handoff.
- **What:** Implement `BeforeUnitHook` and `AfterUnitHook` traits; `save_memory()` and `load_memory()` functions; `validate_subagent_output()` with platform-specific parsers; remediation loop in orchestrator completion logic.
- **When:** Hooks run automatically at tier boundaries; memory persists at Phase completion and loads at run start; remediation loop runs when Critical/Major findings detected.

---

