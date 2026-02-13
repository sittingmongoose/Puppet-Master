# Git & AGENTS.md - Actionable Items Checklist
**Quick Reference for Implementation**

## 🔴 Critical (Must Fix Before Production)

### 1. Fix Promotion Engine Logic
**File:** `puppet-master-rs/src/state/agents_promotion.rs`  
**Problem:** `min_usage_count: 3` is unreachable - patterns only recorded once per tier  
**Solution Options:**

**Option A - Quick Fix (1 hour):**
```rust
// Line 24 in agents_promotion.rs
pub fn default() -> Self {
    Self {
        min_usage_count: 1,  // Changed from 3
        min_success_rate: 1.0,  // Only promote successful patterns
        promotion_threshold: 0.5,
    }
}
```

**Option B - Proper Fix (4 hours):**
```rust
// Track pattern fingerprints across tiers
struct UsageStats {
    tiers_used: HashSet<String>,  // Add this
    count: u32,  // Now counts tier reuse, not appends
    // ...
}

// In orchestrator.rs, when PromptBuilder loads patterns:
promotion_engine.record_pattern_seen(pattern_hash, tier_id);
```

**Verification:**
```bash
# Add this test to agents_promotion.rs
#[test]
fn test_promotion_triggers_after_threshold() {
    let mut engine = PromotionEngine::with_defaults();
    
    // Record pattern usage 3 times
    engine.record_usage("Use error handling", "task1", true);
    engine.record_usage("Use error handling", "task2", true);
    engine.record_usage("Use error handling", "task3", true);
    
    let candidates = engine.evaluate(&[/* pattern definition */]);
    assert!(candidates.len() > 0, "Promotion should trigger after 3 uses");
}
```

---

### 2. PR Creation End-to-End Test
**File:** `tests/integration/pr-creation.integration.test.ts` (create new)  
**Problem:** PR code never tested with real `gh` CLI  
**Solution:**

```typescript
// tests/integration/pr-creation.integration.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { PrManager } from '../../puppet-master-rs/src/git/pr_manager.js';

describe('PR Creation Integration', () => {
  beforeAll(async () => {
    // Check if gh is available
    const ghAvailable = await checkGhCli();
    if (!ghAvailable) {
      console.warn('Skipping PR tests: gh CLI not installed');
    }
  });

  it('should create PR with gh CLI', async () => {
    const prManager = new PrManager('/path/to/test/repo');
    
    const result = await prManager.create_pr(
      'Test PR',
      'Test body',
      'main',
      'test-branch'
    );
    
    expect(result.success).toBe(true);
    expect(result.pr_url).toBeTruthy();
  });

  it('should handle gh not authenticated', async () => {
    // Test preflight_check failure scenario
  });
});
```

**Manual Verification:**
```bash
# 1. Install gh CLI
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install gh

# 2. Authenticate
gh auth login

# 3. Run test
cd /path/to/test/repo
git checkout -b test-pr-branch
cargo test --package puppet-master-rs --test pr_creation
```

---

### 3. Worktree Recovery on Startup
**File:** `puppet-master-rs/src/core/orchestrator.rs`  
**Problem:** Orphaned worktrees if orchestrator crashes  
**Solution:**

```rust
// Add to Orchestrator::new() around line 390
impl Orchestrator {
    pub fn new(config: PuppetMasterConfig) -> Result<Self> {
        // ... existing initialization ...
        
        // Add worktree recovery before returning
        let worktree_manager_ref = worktree_manager.clone();
        tokio::spawn(async move {
            if let Err(e) = recover_orphaned_worktrees(&worktree_manager_ref).await {
                log::warn!("Failed to recover orphaned worktrees: {}", e);
            }
        });
        
        Ok(Self { /* ... */ })
    }
}

// Add new function
async fn recover_orphaned_worktrees(manager: &WorktreeManager) -> Result<()> {
    log::info!("Checking for orphaned worktrees from previous sessions...");
    
    // List all worktrees
    let worktrees = manager.list_worktrees().await?;
    
    // Find worktrees older than 24 hours (likely orphaned)
    let now = Utc::now();
    for worktree in worktrees {
        let age = now.signed_duration_since(worktree.created_at);
        if age.num_hours() > 24 {
            log::warn!("Found orphaned worktree: {:?} (age: {} hours)", 
                       worktree.path, age.num_hours());
            
            // Auto-remove after 48 hours
            if age.num_hours() > 48 {
                log::info!("Auto-removing old worktree: {:?}", worktree.path);
                let _ = manager.remove_worktree(&worktree.tier_id).await;
            }
        }
    }
    
    // Prune deleted worktrees
    manager.prune_deleted().await?;
    
    Ok(())
}
```

**Add to WorktreeManager:**
```rust
// puppet-master-rs/src/git/worktree_manager.rs
impl WorktreeManager {
    /// Prune worktrees that were deleted outside of the manager
    pub async fn prune_deleted(&self) -> Result<()> {
        let output = Command::new("git")
            .current_dir(&self.repo_root)
            .args(&["worktree", "prune"])
            .output()
            .await?;
        
        if output.status.success() {
            log::debug!("Pruned deleted worktrees");
            Ok(())
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            Err(anyhow::anyhow!("Failed to prune worktrees: {}", stderr))
        }
    }
}
```

---

## 🟡 High Priority (Fix Within 2 Weeks)

### 4. Strengthen AGENTS.md Gate Enforcement
**File:** `puppet-master-rs/src/state/agents_gate_enforcer.rs`  
**Problem:** All default rules are Warning/Info - never blocks tiers  
**Solution:**

```rust
// Line 141 in agents_gate_enforcer.rs - update default_rules()
fn default_rules() -> Vec<Rule> {
    vec![
        Rule {
            name: "min-patterns".to_string(),
            description: "At least 2 successful patterns should be documented".to_string(),
            severity: ViolationSeverity::Warning,  // Keep as warning for now
            check: RuleCheck::MinPatterns(2),
        },
        // ADD NEW ERROR-LEVEL RULE:
        Rule {
            name: "agents-md-exists".to_string(),
            description: "AGENTS.md must be updated after 3 failed iterations".to_string(),
            severity: ViolationSeverity::Error,  // This WILL block
            check: RuleCheck::MinPatterns(1),  // At least one entry required
        },
        Rule {
            name: "min-failure-modes".to_string(),
            description: "At least 1 failure mode should be documented after phase completion".to_string(),
            severity: ViolationSeverity::Warning,  // Upgrade to Error for phase tier
            check: RuleCheck::MinFailureModes(1),
        },
    ]
}
```

**Add tier-aware enforcement:**
```rust
// Add method to GateEnforcer
pub fn enforce_for_tier(
    &self,
    agents_content: &str,
    agents_doc: &AgentsDoc,
    tier_type: TierType,
    iteration_count: u32,
) -> Result<EnforcementResult> {
    let mut rules = self.rules.clone();
    
    // Upgrade severity based on tier type and iterations
    if tier_type == TierType::Phase || iteration_count > 3 {
        for rule in &mut rules {
            if rule.name == "min-patterns" {
                rule.severity = ViolationSeverity::Error;  // Stricter for phases
            }
        }
    }
    
    // Run enforcement with adjusted rules
    // ... existing logic ...
}
```

---

### 5. Worktree Integration Tests
**File:** `tests/integration/worktree.integration.test.ts` (create new)  
**Solution:**

```typescript
import { describe, it, expect } from 'vitest';
import { WorktreeManager } from '../../puppet-master-rs/src/git/worktree_manager.js';

describe('Worktree Integration Tests', () => {
  let tempRepo: string;
  let manager: WorktreeManager;

  beforeEach(async () => {
    tempRepo = await createTempGitRepo();
    manager = new WorktreeManager(tempRepo);
  });

  it('should create worktree for subtask', async () => {
    const info = await manager.create_worktree('subtask1', 'feature/subtask1');
    
    expect(info.path).toBeTruthy();
    expect(info.branch).toBe('feature/subtask1');
    expect(info.is_active).toBe(true);
  });

  it('should merge worktree back to main', async () => {
    // Create worktree
    await manager.create_worktree('subtask1', 'feature/subtask1');
    
    // Make changes in worktree
    const worktreePath = manager.get_worktree_path('subtask1');
    await fs.writeFile(join(worktreePath, 'test.txt'), 'content');
    await runGit(['add', '.'], { cwd: worktreePath });
    await runGit(['commit', '-m', 'Test'], { cwd: worktreePath });
    
    // Merge back
    const result = await manager.merge_worktree('subtask1', 'main');
    
    expect(result.success).toBe(true);
    expect(result.conflicts).toHaveLength(0);
  });

  it('should cleanup worktree after completion', async () => {
    await manager.create_worktree('subtask1', 'feature/subtask1');
    await manager.remove_worktree('subtask1');
    
    const exists = await manager.worktree_exists('subtask1');
    expect(exists).toBe(false);
  });

  it('should handle merge conflicts gracefully', async () => {
    // Setup conflict scenario
    // ... create conflicting changes in main and worktree ...
    
    const result = await manager.merge_worktree('subtask1', 'main');
    
    expect(result.success).toBe(false);
    expect(result.conflicts.length).toBeGreaterThan(0);
  });
});
```

---

### 6. PR Retry Logic
**File:** `puppet-master-rs/src/git/pr_manager.rs`  
**Solution:**

```rust
// Add new method to PrManager
impl PrManager {
    /// Create PR with retry logic
    pub async fn create_pr_with_retry(
        &self,
        title: &str,
        body: &str,
        base: &str,
        head: &str,
        max_attempts: u32,
    ) -> Result<PrResult> {
        let mut last_error = None;
        
        for attempt in 1..=max_attempts {
            match self.create_pr(title, body, base, head).await {
                Ok(result) if result.success => return Ok(result),
                Ok(result) => {
                    log::warn!("PR creation failed (attempt {}/{}): {}", 
                              attempt, max_attempts, result.message);
                    last_error = Some(result.message);
                }
                Err(e) => {
                    log::warn!("PR creation error (attempt {}/{}): {}", 
                              attempt, max_attempts, e);
                    last_error = Some(e.to_string());
                }
            }
            
            if attempt < max_attempts {
                let delay = std::time::Duration::from_secs(2_u64.pow(attempt));
                log::info!("Retrying PR creation in {} seconds...", delay.as_secs());
                tokio::time::sleep(delay).await;
            }
        }
        
        Ok(PrResult {
            success: false,
            pr_url: None,
            message: format!("Failed after {} attempts: {}", 
                           max_attempts, 
                           last_error.unwrap_or_else(|| "Unknown error".to_string())),
        })
    }
}
```

**Update orchestrator call:**
```rust
// Line 673-676 in orchestrator.rs
match self
    .pr_manager
    .create_pr_with_retry(&pr_title, &pr_body, base_branch, &head_branch, 3)  // Changed
    .await
{
    // ... rest of logic ...
}
```

---

## 🟢 Medium Priority (Next Sprint)

### 7. Persist PR Creation to Evidence Store
**File:** `puppet-master-rs/src/core/orchestrator.rs`  
**Lines:** 678-687  
**Solution:**

```rust
// After line 687
Ok(result) => {
    if result.success {
        if let Some(url) = result.pr_url {
            log::info!("Created PR for tier {}: {}", tier_id, url);
            
            // ADD THIS:
            // Record PR creation in evidence store
            let evidence = Evidence {
                id: format!("pr-{}-{}", tier_id, Utc::now().timestamp()),
                tier_id: tier_id.to_string(),
                evidence_type: EvidenceType::PullRequest,
                content: url.clone(),
                metadata: json!({
                    "pr_url": url,
                    "pr_title": pr_title,
                    "base_branch": base_branch,
                    "head_branch": head_branch,
                }),
                timestamp: Utc::now(),
            };
            
            if let Some(evidence_store) = &self.evidence_store {
                let _ = evidence_store.record(evidence);
            }
            
            // Existing logging...
        }
    }
}
```

---

### 8. Add Promotion Dashboard
**File:** `puppet-master-rs/src/views/agents.rs` (create new)  
**Solution:**

```rust
// Create new view showing promotion candidates
pub fn agents_view(promotion_engine: &PromotionEngine) -> Element {
    let candidates = promotion_engine.get_all_candidates();
    
    rsx! {
        div { class: "agents-dashboard",
            h2 { "AGENTS.md Learning Promotion" }
            
            div { class: "promotion-candidates",
                for candidate in candidates {
                    div { class: "candidate-card",
                        h3 { "{candidate.entry_text}" }
                        p { "Used {candidate.usage_count} times across {candidate.source_tier}" }
                        p { "Success rate: {candidate.success_rate * 100.0}%" }
                        p { "Score: {candidate.score}" }
                        button { 
                            onclick: move |_| promote_pattern(&candidate),
                            "Promote to {candidate.target_tier}"
                        }
                    }
                }
            }
        }
    }
}
```

---

### 9. Document `gh` CLI Setup
**File:** `README.md`  
**Solution:**

Add section after installation:

```markdown
## GitHub CLI Setup (for PR Creation)

RWM Puppet Master can automatically create pull requests after tier completion.
This requires the GitHub CLI (`gh`) to be installed and authenticated.

### Install GitHub CLI

**Linux:**
```bash
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install gh
```

**macOS:**
```bash
brew install gh
```

**Windows:**
```powershell
winget install GitHub.cli
```

### Authenticate

```bash
gh auth login
```

Follow the prompts to authenticate with your GitHub account.

### Verify Setup

```bash
gh auth status
```

You should see "✓ Logged in to github.com as YOUR_USERNAME".

### Disable PR Creation

If you don't want automatic PR creation, set in config:

```toml
[branching]
auto_pr = false
```
```

---

## 🔵 Low Priority (Nice to Have)

### 10. Draft PR Option
**File:** `puppet-master-rs/src/git/pr_manager.rs`  
**Add to config:**

```rust
// In types/config.rs
pub struct BranchingConfig {
    pub auto_pr: bool,
    pub draft_pr: bool,  // Add this
    // ...
}
```

**Update PR creation:**
```rust
// Line 54 in pr_manager.rs
let mut args = vec![
    "pr", "create", 
    "--title", title, 
    "--body", body, 
    "--base", base, 
    "--head", head
];

if draft {
    args.push("--draft");
}

let output = tokio::process::Command::new("gh")
    .current_dir(&self.repo_path)
    .args(&args)
    .output()
    .await?;
```

---

### 11. Worktree in Doctor Command
**File:** `puppet-master-rs/src/doctor/mod.rs`  
**Add check:**

```rust
pub async fn check_worktrees(worktree_manager: &WorktreeManager) -> CheckResult {
    let mut messages = Vec::new();
    
    match worktree_manager.list_worktrees().await {
        Ok(worktrees) => {
            messages.push(format!("Found {} active worktrees", worktrees.len()));
            
            for wt in worktrees {
                let age = Utc::now().signed_duration_since(wt.created_at);
                if age.num_hours() > 24 {
                    messages.push(format!(
                        "⚠️  Old worktree: {} (age: {} hours)",
                        wt.tier_id, age.num_hours()
                    ));
                }
            }
        }
        Err(e) => {
            messages.push(format!("❌ Failed to list worktrees: {}", e));
        }
    }
    
    CheckResult {
        name: "Git Worktrees".to_string(),
        passed: true,
        messages,
    }
}
```

---

## Verification Commands

After implementing fixes, run these to verify:

```bash
# 1. Test promotion engine
cargo test --package puppet-master-rs --lib state::agents_promotion -- --nocapture

# 2. Test PR creation
cargo test --package puppet-master-rs --lib git::pr_manager -- --nocapture

# 3. Test worktree recovery
cargo test --package puppet-master-rs --lib core::orchestrator::test_worktree -- --nocapture

# 4. Integration tests
npm run test:integration -- git.integration.test.ts
npm run test:integration -- worktree.integration.test.ts
npm run test:integration -- pr-creation.integration.test.ts

# 5. Full test suite
cargo test --all
npm test
```

---

## Summary Timeline

**Week 1:**
- [ ] Fix promotion engine (4 hours)
- [ ] Add PR integration test (4 hours)
- [ ] Add worktree recovery (4 hours)
- **Total: 12 hours**

**Week 2:**
- [ ] Strengthen gate enforcement (3 hours)
- [ ] Add worktree tests (4 hours)
- [ ] Add PR retry logic (2 hours)
- **Total: 9 hours**

**Week 3:**
- [ ] Persist PR to evidence store (2 hours)
- [ ] Add promotion dashboard (6 hours)
- [ ] Document gh CLI setup (1 hour)
- **Total: 9 hours**

**Grand Total: 30 hours (1 sprint)**

---

## Priority Decision Matrix

| Item | Impact | Effort | Priority | Why |
|------|--------|--------|----------|-----|
| Fix promotion | High | Low | 🔴 Critical | Feature is broken, ship or remove |
| PR test | Medium | Low | 🔴 Critical | Code never validated, may fail in prod |
| Worktree recovery | Medium | Low | 🔴 Critical | Disk leak, operational risk |
| Gate enforcement | Medium | Medium | 🟡 High | UX issue, teams may skip AGENTS.md |
| Worktree tests | Low | Medium | 🟡 High | Quality assurance gap |
| PR retry | Low | Low | 🟡 High | Quick win for reliability |
| PR persistence | Low | Low | 🟢 Medium | Nice to have for traceability |
| Promotion UI | Low | High | 🟢 Medium | Visibility improvement |
| gh docs | Low | Low | 🟢 Medium | User confusion prevention |
| Draft PR | Low | Low | 🔵 Low | Minor UX tweak |
| Doctor worktree | Low | Medium | 🔵 Low | Debugging aid |

