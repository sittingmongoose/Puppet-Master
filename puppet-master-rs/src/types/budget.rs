//! Budget and quota tracking types.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fmt;

use super::platform::Platform;

/// Budget information for a platform.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BudgetInfo {
    /// Platform this budget applies to.
    pub platform: Platform,

    /// Amount used in the current period.
    pub used: u64,

    /// Maximum limit for the period.
    pub limit: u64,

    /// Time period for this budget (e.g., "hourly", "daily", "run").
    pub period: String,

    /// Warning threshold (percentage of limit).
    #[serde(default = "default_warning")]
    pub warning_threshold: u8,

    /// Whether the limit has been exceeded.
    #[serde(default)]
    pub exceeded: bool,

    /// When this budget period resets.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub resets_at: Option<DateTime<Utc>>,

    /// Current quota status.
    #[serde(default)]
    pub status: QuotaStatus,
}

fn default_warning() -> u8 {
    75
}

impl BudgetInfo {
    /// Creates a new budget info.
    pub fn new(platform: Platform, limit: u64, period: impl Into<String>) -> Self {
        Self {
            platform,
            used: 0,
            limit,
            period: period.into(),
            warning_threshold: default_warning(),
            exceeded: false,
            resets_at: None,
            status: QuotaStatus::Ok,
        }
    }

    /// Returns the percentage of budget used.
    pub fn percentage_used(&self) -> f64 {
        if self.limit == 0 {
            0.0
        } else {
            (self.used as f64 / self.limit as f64) * 100.0
        }
    }

    /// Returns remaining budget.
    pub fn remaining(&self) -> u64 {
        self.limit.saturating_sub(self.used)
    }

    /// Returns whether the warning threshold has been exceeded.
    pub fn is_warning(&self) -> bool {
        self.percentage_used() >= self.warning_threshold as f64
    }

    /// Returns whether the budget has been exceeded.
    pub fn is_exceeded(&self) -> bool {
        self.used >= self.limit
    }

    /// Updates the quota status based on current usage.
    pub fn update_status(&mut self) {
        self.exceeded = self.is_exceeded();
        self.status = if self.is_exceeded() {
            QuotaStatus::Exhausted
        } else if self.is_warning() {
            QuotaStatus::Warning
        } else {
            QuotaStatus::Ok
        };
    }

    /// Adds usage to this budget.
    pub fn add_usage(&mut self, amount: u64) {
        self.used = self.used.saturating_add(amount);
        self.update_status();
    }

    /// Resets the budget usage.
    pub fn reset(&mut self) {
        self.used = 0;
        self.exceeded = false;
        self.status = QuotaStatus::Ok;
    }
}

/// Quota status indicator.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum QuotaStatus {
    /// Budget usage is normal.
    Ok,
    /// Warning threshold exceeded.
    Warning,
    /// Budget exhausted.
    Exhausted,
}

impl Default for QuotaStatus {
    fn default() -> Self {
        Self::Ok
    }
}

impl fmt::Display for QuotaStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Ok => write!(f, "OK"),
            Self::Warning => write!(f, "Warning"),
            Self::Exhausted => write!(f, "Exhausted"),
        }
    }
}

/// Record of resource usage.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UsageRecord {
    /// Timestamp of the usage.
    pub timestamp: DateTime<Utc>,

    /// Platform used.
    pub platform: Platform,

    /// Action performed (e.g., "execution", "api_call").
    pub action: String,

    /// Duration in milliseconds.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub duration_ms: Option<u64>,

    /// Whether the action succeeded.
    pub success: bool,

    /// Number of tokens used (if applicable).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tokens: Option<u64>,

    /// Session ID associated with this usage.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub session_id: Option<String>,

    /// Tier ID associated with this usage.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tier_id: Option<String>,

    /// Model used.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model: Option<String>,

    /// Cost in credits/dollars (if tracked).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cost: Option<f64>,
}

impl UsageRecord {
    /// Creates a new usage record.
    pub fn new(platform: Platform, action: impl Into<String>, success: bool) -> Self {
        Self {
            timestamp: Utc::now(),
            platform,
            action: action.into(),
            duration_ms: None,
            success,
            tokens: None,
            session_id: None,
            tier_id: None,
            model: None,
            cost: None,
        }
    }

    /// Sets the duration.
    pub fn with_duration_ms(mut self, duration_ms: u64) -> Self {
        self.duration_ms = Some(duration_ms);
        self
    }

    /// Sets the tokens used.
    pub fn with_tokens(mut self, tokens: u64) -> Self {
        self.tokens = Some(tokens);
        self
    }

    /// Sets the session ID.
    pub fn with_session_id(mut self, session_id: impl Into<String>) -> Self {
        self.session_id = Some(session_id.into());
        self
    }

    /// Sets the tier ID.
    pub fn with_tier_id(mut self, tier_id: impl Into<String>) -> Self {
        self.tier_id = Some(tier_id.into());
        self
    }

    /// Sets the model.
    pub fn with_model(mut self, model: impl Into<String>) -> Self {
        self.model = Some(model.into());
        self
    }

    /// Sets the cost.
    pub fn with_cost(mut self, cost: f64) -> Self {
        self.cost = Some(cost);
        self
    }
}

/// Budget tracker for managing quotas across multiple platforms and periods.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BudgetTracker {
    /// Per-platform budgets.
    #[serde(default)]
    pub budgets: std::collections::HashMap<Platform, Vec<BudgetInfo>>,

    /// Usage history.
    #[serde(default)]
    pub usage_history: Vec<UsageRecord>,

    /// Maximum history records to keep.
    #[serde(default = "default_max_history")]
    pub max_history: usize,
}

fn default_max_history() -> usize {
    10000
}

impl Default for BudgetTracker {
    fn default() -> Self {
        Self {
            budgets: std::collections::HashMap::new(),
            usage_history: Vec::new(),
            max_history: default_max_history(),
        }
    }
}

impl BudgetTracker {
    /// Creates a new budget tracker.
    pub fn new() -> Self {
        Self::default()
    }

    /// Adds a budget for a platform.
    pub fn add_budget(&mut self, budget: BudgetInfo) {
        self.budgets
            .entry(budget.platform)
            .or_insert_with(Vec::new)
            .push(budget);
    }

    /// Records usage.
    pub fn record_usage(&mut self, record: UsageRecord) {
        // Update budgets
        if let Some(budgets) = self.budgets.get_mut(&record.platform) {
            for budget in budgets.iter_mut() {
                if let Some(tokens) = record.tokens {
                    budget.add_usage(tokens);
                }
            }
        }

        // Add to history
        self.usage_history.push(record);

        // Trim history if needed
        if self.usage_history.len() > self.max_history {
            let excess = self.usage_history.len() - self.max_history;
            self.usage_history.drain(0..excess);
        }
    }

    /// Gets budgets for a specific platform.
    pub fn get_budgets(&self, platform: Platform) -> Option<&[BudgetInfo]> {
        self.budgets.get(&platform).map(|v| v.as_slice())
    }

    /// Checks if any budget is exhausted for a platform.
    pub fn is_exhausted(&self, platform: Platform) -> bool {
        self.budgets
            .get(&platform)
            .map(|budgets| budgets.iter().any(|b| b.is_exceeded()))
            .unwrap_or(false)
    }

    /// Gets the total usage for a platform in a time period.
    pub fn get_usage_in_period(&self, platform: Platform, since: DateTime<Utc>) -> u64 {
        self.usage_history
            .iter()
            .filter(|r| r.platform == platform && r.timestamp >= since)
            .filter_map(|r| r.tokens)
            .sum()
    }

    /// Resets all budgets for a platform.
    pub fn reset_platform(&mut self, platform: Platform) {
        if let Some(budgets) = self.budgets.get_mut(&platform) {
            for budget in budgets.iter_mut() {
                budget.reset();
            }
        }
    }
}

/// Usage statistics summary.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UsageStats {
    /// Platform these stats are for.
    pub platform: Platform,
    /// Total tokens used.
    pub total_tokens: u64,
    /// Total executions.
    pub total_executions: u32,
    /// Successful executions.
    pub successful_executions: u32,
    /// Failed executions.
    pub failed_executions: u32,
    /// Total duration in milliseconds.
    pub total_duration_ms: u64,
    /// Average duration per execution.
    pub avg_duration_ms: f64,
    /// Total cost.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total_cost: Option<f64>,
}

impl UsageStats {
    /// Creates new usage stats for a platform.
    pub fn new(platform: Platform) -> Self {
        Self {
            platform,
            total_tokens: 0,
            total_executions: 0,
            successful_executions: 0,
            failed_executions: 0,
            total_duration_ms: 0,
            avg_duration_ms: 0.0,
            total_cost: None,
        }
    }

    /// Updates statistics from a usage record.
    pub fn update_from_record(&mut self, record: &UsageRecord) {
        self.total_executions += 1;

        if record.success {
            self.successful_executions += 1;
        } else {
            self.failed_executions += 1;
        }

        if let Some(tokens) = record.tokens {
            self.total_tokens += tokens;
        }

        if let Some(duration) = record.duration_ms {
            self.total_duration_ms += duration;
            self.avg_duration_ms = self.total_duration_ms as f64 / self.total_executions as f64;
        }

        if let Some(cost) = record.cost {
            self.total_cost = Some(self.total_cost.unwrap_or(0.0) + cost);
        }
    }

    /// Returns success rate as a percentage.
    pub fn success_rate(&self) -> f64 {
        if self.total_executions == 0 {
            0.0
        } else {
            (self.successful_executions as f64 / self.total_executions as f64) * 100.0
        }
    }
}

/// Action type for usage tracking.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum UsageAction {
    /// Execution of a task.
    Execution,
    /// API call.
    ApiCall,
    /// Verification check.
    Verification,
    /// Review operation.
    Review,
    /// Planning operation.
    Planning,
    /// Git operation.
    GitOperation,
}

impl fmt::Display for UsageAction {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Execution => write!(f, "Execution"),
            Self::ApiCall => write!(f, "API Call"),
            Self::Verification => write!(f, "Verification"),
            Self::Review => write!(f, "Review"),
            Self::Planning => write!(f, "Planning"),
            Self::GitOperation => write!(f, "Git Operation"),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_budget_info_percentage() {
        let mut budget = BudgetInfo::new(Platform::Cursor, 1000, "hourly");
        budget.used = 750;

        assert_eq!(budget.percentage_used(), 75.0);
        assert_eq!(budget.remaining(), 250);
        assert!(budget.is_warning());
        assert!(!budget.is_exceeded());
    }

    #[test]
    fn test_budget_info_exceeded() {
        let mut budget = BudgetInfo::new(Platform::Cursor, 1000, "hourly");
        budget.add_usage(1100);

        assert!(budget.is_exceeded());
        assert_eq!(budget.remaining(), 0);
        assert_eq!(budget.status, QuotaStatus::Exhausted);
    }

    #[test]
    fn test_budget_tracker() {
        let mut tracker = BudgetTracker::new();

        let budget = BudgetInfo::new(Platform::Cursor, 1000, "hourly");
        tracker.add_budget(budget);

        let record = UsageRecord::new(Platform::Cursor, "execution", true).with_tokens(100);

        tracker.record_usage(record);

        assert_eq!(tracker.usage_history.len(), 1);
        assert!(tracker.get_budgets(Platform::Cursor).is_some());
    }

    #[test]
    fn test_usage_record_builder() {
        let record = UsageRecord::new(Platform::Claude, "execution", true)
            .with_tokens(500)
            .with_model("claude-3-5-sonnet")
            .with_session_id("sess123");

        assert_eq!(record.platform, Platform::Claude);
        assert_eq!(record.tokens, Some(500));
        assert_eq!(record.model, Some("claude-3-5-sonnet".to_string()));
    }

    #[test]
    fn test_quota_status_display() {
        assert_eq!(QuotaStatus::Ok.to_string(), "OK");
        assert_eq!(QuotaStatus::Warning.to_string(), "Warning");
        assert_eq!(QuotaStatus::Exhausted.to_string(), "Exhausted");
    }
}
