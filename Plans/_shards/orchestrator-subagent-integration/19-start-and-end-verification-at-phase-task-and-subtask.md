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
    pub tier_id: String,
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
        tier_id: context.tier_id.clone(),
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

- **Persist verification results:** Save verification results to `.puppet-master/state/verification-{tier_id}-end.json`
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
    pub tier_id: String,
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
        tier_id: context.tier_id.clone(),
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
    // DRY requirement: must use subagent_registry::get_subagents_for_tier() to get reviewer subagent — never hardcode "code-reviewer"
    // Get reviewer subagent for this tier type
    let reviewer_subagent = get_reviewer_subagent_for_tier(tier_type)?;
    // Implementation note: get_reviewer_subagent_for_tier() must use subagent_registry::get_subagents_for_tier(TierType::Subtask)
    // and filter for "code-reviewer" or use subagent_registry::get_reviewer_subagent_for_tier() if such a function exists

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

**Gaps:**

- **Definition of "quality" per tier:** The plan does not yet define a single canonical "quality checklist" (e.g. clippy, tests, coverage, code-review checklist). Implementers should add a small spec or table: for Phase/Task/Subtask, what quality checks run at end? (e.g. Phase: doc quality; Task: design doc; Subtask: code + tests + linter.)
- **Who runs quality review in agent-driven runs:** The reviewer subagent runs in **all three** situations: (1) **always** at end-of-tier, (2) **on retry** when the tier is retried after failure, and (3) **when quality gate fails** (re-run reviewer as part of the feedback loop). There is no scenario that skips the reviewer; it is required for every completion or retry.
- **Readiness checklist source of truth:** The questions "Does GUI need to be updated? Does backend need to be updated?" require a mapping from "execution-affecting settings" to "GUI controls" and "backend usage." That mapping could live in code (e.g. a static list per tier), in the plan, or in a small config. Without it, the readiness step is heuristic or manual.
- **Interview flow:** The interview orchestrator has its own phases (Scope, Architecture, UX, ...). Start/end verification for **interview phases** should mirror this (start: wiring + readiness; end: wiring re-check + acceptance + quality for interview artifacts). The interview plan (`interview-subagent-integration.md`) should reference this section and define interview-phase-specific quality criteria (e.g. document completeness, requirement clarity).

**Potential issues:**

- **Quality over performance:** Quality of verification is paramount. Do not prioritize speed or "cheap" checks over completeness and correctness. Run full wiring, readiness, acceptance, and quality checks (including reviewer subagent and gate criteria) at start and end of each tier. Scope quality checks to changed files or this tier's artifacts to stay practical, but do not skip or weaken verification for performance reasons.
- **Unrelated failures and who addresses them:**

**Unrelated Failures Escalation (Resolved):**
When a phase/tier fails with issues outside its task scope:
1. **Automatic retry:** Parent-tier orchestrator retries the failed tier once (same config).
2. **If retry also fails:** Surface a **CtA in Assistant chat** (not a modal): "Phase [X] failed with issues outside task scope. [Review details] [Skip phase] [Retry] [Abort run]."
3. **P0 exceptions:** If the failure involves potential data loss (e.g., corrupted worktree), show a **modal dialog** instead: "Critical: [description]. This may affect your project files. [Review immediately] [Abort run]."
4. Never silently bypass unrelated failures.
5. "Who addresses": the **user** decides (via CtA options). The orchestrator does not attempt to fix unrelated issues autonomously.
- **Feedback loop:** When end verification fails (acceptance or quality), the agent or user needs clear feedback (what failed, which file/criterion, suggested fix). Integrate with the existing "incomplete task + feedback" flow (e.g. prepend feedback to task file, re-run iteration) so rework is guided.
- **Consistency with existing gates:** The codebase may already have verification gates between tiers. Start/end verification should **complement** them: start = before work; end = after work (gate + quality). Ensure we do not duplicate gate logic; the "acceptance criteria" at end can call the existing gate.

---

