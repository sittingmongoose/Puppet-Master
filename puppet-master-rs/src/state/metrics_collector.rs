//! Metrics Collector
//!
//! Aggregates per-subtask and per-platform outcomes, iteration counts, escalation
//! rates, latency distributions, and token/cost estimates.
//!
//! Design goals:
//! - No extra dependencies (manual CSV writing)
//! - Serializable snapshot for export
//! - Event-driven updates (consume `PuppetMasterEvent` and `UsageRecord`)

use crate::types::{Platform, PuppetMasterEvent, UsageRecord};
use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::File;
use std::io::Write;
use std::path::Path;
use std::sync::{Arc, Mutex};

/// Aggregate metrics for a platform.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlatformMetrics {
    pub platform: Platform,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_model: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_reasoning_effort: Option<String>,

    pub iterations: u64,
    pub successes: u64,
    pub failures: u64,
    pub retries: u64,
    pub timeouts: u64,
    pub escalations: u64,

    pub total_latency_ms: u64,
    pub p95_latency_ms: u64,

    pub estimated_tokens: u64,
    pub estimated_cost_usd: f64,
}

impl PlatformMetrics {
    pub fn new(platform: Platform) -> Self {
        Self {
            platform,
            last_model: None,
            last_reasoning_effort: None,
            iterations: 0,
            successes: 0,
            failures: 0,
            retries: 0,
            timeouts: 0,
            escalations: 0,
            total_latency_ms: 0,
            p95_latency_ms: 0,
            estimated_tokens: 0,
            estimated_cost_usd: 0.0,
        }
    }

    pub fn success_rate(&self) -> f64 {
        if self.iterations == 0 {
            0.0
        } else {
            self.successes as f64 / self.iterations as f64
        }
    }

    pub fn avg_latency_ms(&self) -> f64 {
        if self.iterations == 0 {
            0.0
        } else {
            self.total_latency_ms as f64 / self.iterations as f64
        }
    }

    pub fn escalation_rate(&self) -> f64 {
        if self.iterations == 0 {
            0.0
        } else {
            self.escalations as f64 / self.iterations as f64
        }
    }
}

/// Aggregate metrics for a (sub)task/tier.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubtaskMetrics {
    pub subtask_id: String,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_platform: Option<Platform>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_model: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_reasoning_effort: Option<String>,

    pub iterations: u64,
    pub successes: u64,
    pub failures: u64,
    pub gate_passes: u64,
    pub gate_failures: u64,
    pub retries: u64,
    pub timeouts: u64,
    pub escalations: u64,

    pub total_latency_ms: u64,
    pub p95_latency_ms: u64,

    pub estimated_tokens: u64,
    pub estimated_cost_usd: f64,
}

impl SubtaskMetrics {
    pub fn new(subtask_id: String) -> Self {
        Self {
            subtask_id,
            last_platform: None,
            last_model: None,
            last_reasoning_effort: None,
            iterations: 0,
            successes: 0,
            failures: 0,
            gate_passes: 0,
            gate_failures: 0,
            retries: 0,
            timeouts: 0,
            escalations: 0,
            total_latency_ms: 0,
            p95_latency_ms: 0,
            estimated_tokens: 0,
            estimated_cost_usd: 0.0,
        }
    }

    pub fn success_rate(&self) -> f64 {
        if self.iterations == 0 {
            0.0
        } else {
            self.successes as f64 / self.iterations as f64
        }
    }

    pub fn avg_latency_ms(&self) -> f64 {
        if self.iterations == 0 {
            0.0
        } else {
            self.total_latency_ms as f64 / self.iterations as f64
        }
    }

    pub fn escalation_rate(&self) -> f64 {
        if self.iterations == 0 {
            0.0
        } else {
            self.escalations as f64 / self.iterations as f64
        }
    }
}

/// Totals across all platforms and subtasks.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OverallMetrics {
    pub iterations: u64,
    pub successes: u64,
    pub failures: u64,
    pub retries: u64,
    pub timeouts: u64,
    pub escalations: u64,

    pub total_latency_ms: u64,
    pub p95_latency_ms: u64,

    pub estimated_tokens: u64,
    pub estimated_cost_usd: f64,
}

impl OverallMetrics {
    pub fn success_rate(&self) -> f64 {
        if self.iterations == 0 {
            0.0
        } else {
            self.successes as f64 / self.iterations as f64
        }
    }

    pub fn avg_latency_ms(&self) -> f64 {
        if self.iterations == 0 {
            0.0
        } else {
            self.total_latency_ms as f64 / self.iterations as f64
        }
    }

    pub fn escalation_rate(&self) -> f64 {
        if self.iterations == 0 {
            0.0
        } else {
            self.escalations as f64 / self.iterations as f64
        }
    }
}

/// A serializable snapshot of the current metrics.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MetricsSnapshot {
    pub generated_at: DateTime<Utc>,
    pub overall: OverallMetrics,
    pub platforms: Vec<PlatformMetrics>,
    pub subtasks: Vec<SubtaskMetrics>,
}

impl Default for MetricsSnapshot {
    fn default() -> Self {
        Self {
            generated_at: Utc::now(),
            overall: OverallMetrics::default(),
            platforms: Vec::new(),
            subtasks: Vec::new(),
        }
    }
}

#[derive(Debug, Clone, Default)]
struct LatencyTracker {
    total_ms: u64,
    samples: Vec<u64>,
}

impl LatencyTracker {
    fn push(&mut self, ms: u64) {
        self.total_ms = self.total_ms.saturating_add(ms);
        self.samples.push(ms);
    }

    fn total_ms(&self) -> u64 {
        self.total_ms
    }

    fn p95_ms(&self) -> u64 {
        if self.samples.is_empty() {
            return 0;
        }

        let mut v = self.samples.clone();
        v.sort_unstable();

        // Ceil(0.95 * n) - 1
        let n = v.len();
        let idx = ((n as f64) * 0.95).ceil().max(1.0) as usize - 1;
        v[idx.min(n - 1)]
    }
}

#[derive(Debug)]
struct PlatformAgg {
    metrics: PlatformMetrics,
    latency: LatencyTracker,
}

impl PlatformAgg {
    fn new(platform: Platform) -> Self {
        Self {
            metrics: PlatformMetrics::new(platform),
            latency: LatencyTracker::default(),
        }
    }
}

#[derive(Debug)]
struct SubtaskAgg {
    metrics: SubtaskMetrics,
    latency: LatencyTracker,
}

impl SubtaskAgg {
    fn new(subtask_id: String) -> Self {
        Self {
            metrics: SubtaskMetrics::new(subtask_id),
            latency: LatencyTracker::default(),
        }
    }
}

#[derive(Debug, Default)]
struct MetricsCollectorInner {
    platforms: HashMap<Platform, PlatformAgg>,
    subtasks: HashMap<String, SubtaskAgg>,
    last_platform_by_item: HashMap<String, Platform>,
}

/// Thread-safe metrics collector.
#[derive(Clone, Default)]
pub struct MetricsCollector {
    inner: Arc<Mutex<MetricsCollectorInner>>,
}

impl MetricsCollector {
    pub fn new() -> Self {
        Self::default()
    }

    /// Record a `PuppetMasterEvent` and update aggregates.
    pub fn record_event(&self, event: &PuppetMasterEvent) {
        let mut inner = self.inner.lock().unwrap();

        match event {
            PuppetMasterEvent::IterationStart {
                item_id,
                platform,
                model,
                reasoning_effort,
                ..
            } => {
                inner.last_platform_by_item.insert(item_id.clone(), *platform);

                let entry = inner
                    .subtasks
                    .entry(item_id.clone())
                    .or_insert_with(|| SubtaskAgg::new(item_id.clone()));
                entry.metrics.last_platform = Some(*platform);
                entry.metrics.last_model = Some(model.clone());
                entry.metrics.last_reasoning_effort = reasoning_effort.clone();

                let plat = inner
                    .platforms
                    .entry(*platform)
                    .or_insert_with(|| PlatformAgg::new(*platform));
                plat.metrics.last_model = Some(model.clone());
                plat.metrics.last_reasoning_effort = reasoning_effort.clone();
            }

            PuppetMasterEvent::IterationComplete {
                item_id,
                success,
                duration_ms,
                output_summary,
                ..
            } => {
                let platform = inner.last_platform_by_item.get(item_id).copied();

                let sub = inner
                    .subtasks
                    .entry(item_id.clone())
                    .or_insert_with(|| SubtaskAgg::new(item_id.clone()));
                if sub.metrics.last_platform.is_none() {
                    sub.metrics.last_platform = platform;
                }

                sub.metrics.iterations += 1;
                if *success {
                    sub.metrics.successes += 1;
                } else {
                    sub.metrics.failures += 1;
                }
                sub.latency.push(*duration_ms);
                sub.metrics.total_latency_ms = sub.latency.total_ms();
                sub.metrics.p95_latency_ms = sub.latency.p95_ms();

                // Opportunistic token estimate from the output summary length.
                if let Some(summary) = output_summary {
                    let est = estimate_tokens_from_text(summary);
                    sub.metrics.estimated_tokens = sub.metrics.estimated_tokens.saturating_add(est);
                }

                if let Some(p) = platform {
                    let plat = inner.platforms.entry(p).or_insert_with(|| PlatformAgg::new(p));

                    plat.metrics.iterations += 1;
                    if *success {
                        plat.metrics.successes += 1;
                    } else {
                        plat.metrics.failures += 1;
                    }
                    plat.latency.push(*duration_ms);
                    plat.metrics.total_latency_ms = plat.latency.total_ms();
                    plat.metrics.p95_latency_ms = plat.latency.p95_ms();

                    if let Some(summary) = output_summary {
                        let est = estimate_tokens_from_text(summary);
                        plat.metrics.estimated_tokens = plat.metrics.estimated_tokens.saturating_add(est);
                    }
                }
            }

            PuppetMasterEvent::GateComplete { tier_id, passed, .. } => {
                let sub = inner
                    .subtasks
                    .entry(tier_id.clone())
                    .or_insert_with(|| SubtaskAgg::new(tier_id.clone()));

                if *passed {
                    sub.metrics.gate_passes += 1;
                } else {
                    sub.metrics.gate_failures += 1;
                }
            }

            PuppetMasterEvent::RetryAttempt { tier_id, .. } => {
                let sub = inner
                    .subtasks
                    .entry(tier_id.clone())
                    .or_insert_with(|| SubtaskAgg::new(tier_id.clone()));
                sub.metrics.retries += 1;

                if let Some(p) = sub.metrics.last_platform {
                    let plat = inner.platforms.entry(p).or_insert_with(|| PlatformAgg::new(p));
                    plat.metrics.retries += 1;
                }
            }

            PuppetMasterEvent::Timeout { tier_id, .. } => {
                let sub = inner
                    .subtasks
                    .entry(tier_id.clone())
                    .or_insert_with(|| SubtaskAgg::new(tier_id.clone()));
                sub.metrics.timeouts += 1;

                if let Some(p) = sub.metrics.last_platform {
                    let plat = inner.platforms.entry(p).or_insert_with(|| PlatformAgg::new(p));
                    plat.metrics.timeouts += 1;
                }
            }

            PuppetMasterEvent::Escalation { from_tier_id, .. } => {
                let sub = inner
                    .subtasks
                    .entry(from_tier_id.clone())
                    .or_insert_with(|| SubtaskAgg::new(from_tier_id.clone()));
                sub.metrics.escalations += 1;

                if let Some(p) = sub.metrics.last_platform {
                    let plat = inner.platforms.entry(p).or_insert_with(|| PlatformAgg::new(p));
                    plat.metrics.escalations += 1;
                }
            }

            PuppetMasterEvent::ParallelSubtaskCompleted {
                subtask_id,
                success,
                duration_ms,
                ..
            } => {
                let sub = inner
                    .subtasks
                    .entry(subtask_id.clone())
                    .or_insert_with(|| SubtaskAgg::new(subtask_id.clone()));

                sub.metrics.iterations += 1;
                if *success {
                    sub.metrics.successes += 1;
                } else {
                    sub.metrics.failures += 1;
                }

                sub.latency.push(*duration_ms);
                sub.metrics.total_latency_ms = sub.latency.total_ms();
                sub.metrics.p95_latency_ms = sub.latency.p95_ms();
            }

            _ => {}
        }
    }

    /// Record a usage record (tokens/cost) and attribute it to a tier/subtask if possible.
    pub fn record_usage(&self, record: &UsageRecord) {
        let mut inner = self.inner.lock().unwrap();

        let tokens = record.tokens.unwrap_or(0);
        let cost = record.cost.unwrap_or(0.0);

        if tokens == 0 && cost == 0.0 {
            return;
        }

        let plat = inner
            .platforms
            .entry(record.platform)
            .or_insert_with(|| PlatformAgg::new(record.platform));

        plat.metrics.estimated_tokens = plat.metrics.estimated_tokens.saturating_add(tokens);
        plat.metrics.estimated_cost_usd += cost;

        if let Some(tier_id) = &record.tier_id {
            let sub = inner
                .subtasks
                .entry(tier_id.clone())
                .or_insert_with(|| SubtaskAgg::new(tier_id.clone()));
            sub.metrics.last_platform = Some(record.platform);

            sub.metrics.estimated_tokens = sub.metrics.estimated_tokens.saturating_add(tokens);
            sub.metrics.estimated_cost_usd += cost;
        }
    }

    /// Get a serializable snapshot of current metrics.
    pub fn snapshot(&self) -> MetricsSnapshot {
        let inner = self.inner.lock().unwrap();

        let mut platforms: Vec<PlatformMetrics> = inner
            .platforms
            .values()
            .map(|p| p.metrics.clone())
            .collect();
        platforms.sort_by_key(|p| format!("{:?}", p.platform));

        let mut subtasks: Vec<SubtaskMetrics> = inner
            .subtasks
            .values()
            .map(|s| s.metrics.clone())
            .collect();
        subtasks.sort_by(|a, b| a.subtask_id.cmp(&b.subtask_id));

        let mut overall = OverallMetrics::default();
        for p in &platforms {
            overall.iterations += p.iterations;
            overall.successes += p.successes;
            overall.failures += p.failures;
            overall.retries += p.retries;
            overall.timeouts += p.timeouts;
            overall.escalations += p.escalations;
            overall.total_latency_ms = overall.total_latency_ms.saturating_add(p.total_latency_ms);
            overall.estimated_tokens = overall.estimated_tokens.saturating_add(p.estimated_tokens);
            overall.estimated_cost_usd += p.estimated_cost_usd;
        }

        let all_latencies: Vec<u64> = inner
            .subtasks
            .values()
            .flat_map(|s| s.latency.samples.iter().copied())
            .collect();
        overall.p95_latency_ms = p95_of(all_latencies);

        MetricsSnapshot {
            generated_at: Utc::now(),
            overall,
            platforms,
            subtasks,
        }
    }

    /// Export a snapshot as pretty JSON.
    pub fn export_json(&self, path: impl AsRef<Path>) -> Result<()> {
        let path = path.as_ref();
        
        // Create parent directory if needed
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)
                .with_context(|| format!("Failed to create directory {}", parent.display()))?;
        }
        
        let snapshot = self.snapshot();
        let json = serde_json::to_string_pretty(&snapshot).context("Failed to serialize metrics snapshot")?;
        let mut file = File::create(path)
            .with_context(|| format!("Failed to create metrics JSON {}", path.display()))?;
        file.write_all(json.as_bytes())
            .with_context(|| format!("Failed to write metrics JSON {}", path.display()))?;
        Ok(())
    }

    /// Export a snapshot as a single CSV file.
    ///
    /// The CSV includes both platform and subtask rows, distinguished by `kind`.
    pub fn export_csv(&self, path: impl AsRef<Path>) -> Result<()> {
        let path = path.as_ref();
        
        // Create parent directory if needed
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)
                .with_context(|| format!("Failed to create directory {}", parent.display()))?;
        }
        
        let snapshot = self.snapshot();

        let mut file = File::create(path)
            .with_context(|| format!("Failed to create metrics CSV {}", path.display()))?;

        writeln!(
            file,
            "kind,id,platform,iterations,successes,failures,successRate,avgLatencyMs,p95LatencyMs,escalations,escalationRate,retries,timeouts,estimatedTokens,estimatedCostUsd,lastModel,lastReasoningEffort"
        )
        .context("Failed to write CSV header")?;

        for p in &snapshot.platforms {
            let row = vec![
                "platform".to_string(),
                format!("{:?}", p.platform),
                format!("{:?}", p.platform),
                p.iterations.to_string(),
                p.successes.to_string(),
                p.failures.to_string(),
                format!("{:.4}", p.success_rate()),
                format!("{:.2}", p.avg_latency_ms()),
                p.p95_latency_ms.to_string(),
                p.escalations.to_string(),
                format!("{:.4}", p.escalation_rate()),
                p.retries.to_string(),
                p.timeouts.to_string(),
                p.estimated_tokens.to_string(),
                format!("{:.6}", p.estimated_cost_usd),
                p.last_model.clone().unwrap_or_default(),
                p.last_reasoning_effort.clone().unwrap_or_default(),
            ];
            writeln!(file, "{}", to_csv_row(&row)).context("Failed to write CSV row")?;
        }

        for s in &snapshot.subtasks {
            let platform = s
                .last_platform
                .map(|p| format!("{:?}", p))
                .unwrap_or_default();

            let row = vec![
                "subtask".to_string(),
                s.subtask_id.clone(),
                platform,
                s.iterations.to_string(),
                s.successes.to_string(),
                s.failures.to_string(),
                format!("{:.4}", s.success_rate()),
                format!("{:.2}", s.avg_latency_ms()),
                s.p95_latency_ms.to_string(),
                s.escalations.to_string(),
                format!("{:.4}", s.escalation_rate()),
                s.retries.to_string(),
                s.timeouts.to_string(),
                s.estimated_tokens.to_string(),
                format!("{:.6}", s.estimated_cost_usd),
                s.last_model.clone().unwrap_or_default(),
                s.last_reasoning_effort.clone().unwrap_or_default(),
            ];
            writeln!(file, "{}", to_csv_row(&row)).context("Failed to write CSV row")?;
        }

        Ok(())
    }
}

fn estimate_tokens_from_text(text: &str) -> u64 {
    // Very rough heuristic: ~4 chars/token.
    (text.len() as u64).saturating_add(3) / 4
}

fn p95_of(mut samples: Vec<u64>) -> u64 {
    if samples.is_empty() {
        return 0;
    }

    samples.sort_unstable();
    let n = samples.len();
    let idx = ((n as f64) * 0.95).ceil().max(1.0) as usize - 1;
    samples[idx.min(n - 1)]
}

fn to_csv_row(fields: &[String]) -> String {
    fields.iter().map(|f| csv_escape(f)).collect::<Vec<_>>().join(",")
}

fn csv_escape(field: &str) -> String {
    if field.contains([',', '"', '\n', '\r']) {
        format!("\"{}\"", field.replace('"', "\"\""))
    } else {
        field.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn collects_basic_iteration_metrics() {
        let c = MetricsCollector::new();

        let start = PuppetMasterEvent::IterationStart {
            item_id: "ST-001".to_string(),
            platform: Platform::Claude,
            model: "sonnet".to_string(),
            reasoning_effort: None,
            attempt: 1,
            session_id: "S-1".to_string(),
            timestamp: Utc::now(),
        };
        c.record_event(&start);

        let done = PuppetMasterEvent::IterationComplete {
            item_id: "ST-001".to_string(),
            success: true,
            duration_ms: 1234,
            output_summary: Some("ok".to_string()),
            timestamp: Utc::now(),
        };
        c.record_event(&done);

        let snap = c.snapshot();
        assert_eq!(snap.platforms.len(), 1);
        assert_eq!(snap.platforms[0].platform, Platform::Claude);
        assert_eq!(snap.platforms[0].iterations, 1);
        assert_eq!(snap.platforms[0].successes, 1);
        assert_eq!(snap.subtasks.len(), 1);
        assert_eq!(snap.subtasks[0].subtask_id, "ST-001");
        assert_eq!(snap.subtasks[0].iterations, 1);
        assert_eq!(snap.subtasks[0].successes, 1);
        assert!(snap.subtasks[0].estimated_tokens > 0);
    }

    #[test]
    fn exports_json_and_csv() {
        let dir = TempDir::new().unwrap();
        let json_path = dir.path().join("metrics.json");
        let csv_path = dir.path().join("metrics.csv");

        let c = MetricsCollector::new();
        let start = PuppetMasterEvent::IterationStart {
            item_id: "ST-001".to_string(),
            platform: Platform::Cursor,
            model: "model".to_string(),
            reasoning_effort: None,
            attempt: 1,
            session_id: "S-1".to_string(),
            timestamp: Utc::now(),
        };
        c.record_event(&start);

        let done = PuppetMasterEvent::IterationComplete {
            item_id: "ST-001".to_string(),
            success: false,
            duration_ms: 10,
            output_summary: None,
            timestamp: Utc::now(),
        };
        c.record_event(&done);

        c.export_json(&json_path).unwrap();
        c.export_csv(&csv_path).unwrap();

        let json_text = std::fs::read_to_string(&json_path).unwrap();
        assert!(json_text.contains("\"platforms\""));

        let csv_text = std::fs::read_to_string(&csv_path).unwrap();
        assert!(csv_text.lines().next().unwrap().starts_with("kind,id,platform"));
        assert!(csv_text.contains("platform"));
        assert!(csv_text.contains("subtask"));
    }
}
