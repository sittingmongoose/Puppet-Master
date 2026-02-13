//! Output parsing system for platform CLI execution results
//!
//! This module provides comprehensive parsing of stdout/stderr from AI platform CLIs,
//! extracting:
//! - Completion signals: `<ralph>COMPLETE</ralph>` and `<ralph>GUTTER</ralph>`
//! - File changes: detecting file paths in output
//! - Token usage: platform-specific usage information
//! - Error categorization: rate limits, quotas, auth failures, etc.
//! - JSON output: structured responses when platform supports it

use crate::types::Platform;
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

/// Parsed output from a platform CLI execution
#[derive(Debug, Clone)]
pub struct ParsedOutput {
    /// Completion signal detected in output
    pub completion_signal: Option<CompletionSignal>,

    /// Learnings/insights extracted from the output (best-effort)
    pub learnings: Vec<String>,

    /// Files mentioned in the output (detected via path patterns)
    pub files_changed: Vec<String>,

    /// Test results extracted from output (best-effort)
    pub test_results: Option<TestResults>,

    /// Token usage statistics if available
    pub token_usage: Option<TokenUsage>,

    /// Errors detected in output (may include stack traces as multi-line blocks)
    pub errors: Vec<PlatformError>,

    /// Stack traces extracted as standalone blocks (best-effort)
    pub stack_traces: Vec<String>,

    /// Raw text response from platform
    pub raw_response: String,

    /// Parsed JSON response if platform outputs JSON
    pub json_response: Option<serde_json::Value>,
}

impl Default for ParsedOutput {
    fn default() -> Self {
        Self {
            completion_signal: None,
            learnings: Vec::new(),
            files_changed: Vec::new(),
            test_results: None,
            token_usage: None,
            errors: Vec::new(),
            stack_traces: Vec::new(),
            raw_response: String::new(),
            json_response: None,
        }
    }
}

impl ParsedOutput {
    /// Creates a new parsed output with raw response
    pub fn new(raw_response: String) -> Self {
        Self {
            raw_response,
            ..Default::default()
        }
    }

    /// Sets the completion signal
    pub fn with_completion_signal(mut self, signal: CompletionSignal) -> Self {
        self.completion_signal = Some(signal);
        self
    }

    /// Adds an error
    pub fn add_error(&mut self, error: PlatformError) {
        self.errors.push(error);
    }

    /// Sets token usage
    pub fn with_token_usage(mut self, usage: TokenUsage) -> Self {
        self.token_usage = Some(usage);
        self
    }
}

/// Completion signal types
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CompletionSignal {
    /// Task completed successfully: `<ralph>COMPLETE</ralph>`
    Complete,

    /// Reached gutter (no more work to do): `<ralph>GUTTER</ralph>`
    Gutter,
}

impl CompletionSignal {
    /// Detects completion signal in text
    pub fn detect(text: &str) -> Option<Self> {
        if text.contains("<ralph>COMPLETE</ralph>") {
            Some(Self::Complete)
        } else if text.contains("<ralph>GUTTER</ralph>") {
            Some(Self::Gutter)
        } else {
            None
        }
    }
}

/// Test results extracted from tool output (best-effort)
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct TestResults {
    pub passed: Option<u32>,
    pub failed: Option<u32>,
    pub skipped: Option<u32>,
}

/// Token usage statistics
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct TokenUsage {
    /// Input tokens consumed
    pub input_tokens: Option<u64>,

    /// Output tokens generated
    pub output_tokens: Option<u64>,

    /// Total tokens used
    pub total_tokens: Option<u64>,

    /// Cache read tokens (for Claude)
    pub cache_read_tokens: Option<u64>,

    /// Cache creation tokens (for Claude)
    pub cache_creation_tokens: Option<u64>,
}

impl TokenUsage {
    /// Creates token usage from individual counts
    pub fn new(input: u64, output: u64) -> Self {
        Self {
            input_tokens: Some(input),
            output_tokens: Some(output),
            total_tokens: Some(input + output),
            cache_read_tokens: None,
            cache_creation_tokens: None,
        }
    }

    /// Checks if usage is empty (no tokens recorded)
    pub fn is_empty(&self) -> bool {
        self.input_tokens.is_none() && self.output_tokens.is_none() && self.total_tokens.is_none()
    }
}

/// Platform execution error
#[derive(Debug, Clone)]
pub struct PlatformError {
    /// Error message text
    pub message: String,

    /// Categorized error type
    pub category: ErrorCategory,

    /// Whether error is recoverable
    pub recoverable: bool,
}

impl PlatformError {
    /// Creates a new platform error
    pub fn new(message: impl Into<String>, category: ErrorCategory, recoverable: bool) -> Self {
        Self {
            message: message.into(),
            category,
            recoverable,
        }
    }
}

/// Error category classification
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ErrorCategory {
    /// Rate limit exceeded
    RateLimit,

    /// Quota/usage limit exceeded
    QuotaExceeded,

    /// Authentication or authorization failure
    AuthFailure,

    /// Network connectivity issue
    NetworkError,

    /// Model or API error
    ModelError,

    /// Tool execution error
    ToolError,

    /// Parse error
    ParseError,

    /// Unknown or uncategorized error
    Unknown,
}

impl ErrorCategory {
    /// Detects error category from error message text
    pub fn detect(message: &str) -> Self {
        let msg_lower = message.to_lowercase();

        if msg_lower.contains("rate limit") || msg_lower.contains("too many requests") {
            Self::RateLimit
        } else if msg_lower.contains("quota")
            || msg_lower.contains("usage limit")
            || msg_lower.contains("insufficient quota")
        {
            Self::QuotaExceeded
        } else if msg_lower.contains("auth")
            || msg_lower.contains("unauthorized")
            || msg_lower.contains("forbidden")
            || msg_lower.contains("api key")
        {
            Self::AuthFailure
        } else if msg_lower.contains("network")
            || msg_lower.contains("connection")
            || msg_lower.contains("timeout")
            || msg_lower.contains("unreachable")
        {
            Self::NetworkError
        } else if msg_lower.contains("model") || msg_lower.contains("invalid model") {
            Self::ModelError
        } else if msg_lower.contains("tool") || msg_lower.contains("command failed") {
            Self::ToolError
        } else if msg_lower.contains("parse") || msg_lower.contains("invalid json") {
            Self::ParseError
        } else {
            Self::Unknown
        }
    }

    /// Checks if error category is recoverable
    pub fn is_recoverable(&self) -> bool {
        matches!(self, Self::RateLimit | Self::NetworkError | Self::ToolError)
    }
}

/// Output parser trait for platform-specific parsing
pub trait OutputParser: Send + Sync {
    /// Parses stdout and stderr from platform CLI execution
    fn parse(&self, stdout: &str, stderr: &str) -> ParsedOutput;

    /// Returns the platform this parser handles
    fn platform(&self) -> Platform;
}

/// Common parsing utilities
pub struct ParsingUtils;

impl ParsingUtils {
    /// Extracts file paths from text using common patterns
    pub fn extract_file_paths(text: &str) -> Vec<String> {
        let mut paths = HashSet::new();

        // Match common file path patterns
        let patterns = [
            // Unix-style absolute paths
            r"(?:/[a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)",
            // Relative paths with extensions
            r"(?:\.{0,2}/[a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)",
            // Common source file patterns
            r"(?:[a-zA-Z0-9_\-./]+\.(?:rs|js|ts|py|go|java|cpp|c|h|hpp|md|json|yaml|yml|toml))",
        ];

        for pattern in &patterns {
            if let Ok(re) = Regex::new(pattern) {
                for cap in re.captures_iter(text) {
                    if let Some(m) = cap.get(0) {
                        let path = m.as_str().trim();
                        // Filter out false positives
                        if !path.starts_with("http") && !path.contains('@') {
                            paths.insert(path.to_string());
                        }
                    }
                }
            }
        }

        paths.into_iter().collect()
    }

    /// Attempts to parse JSON from text
    pub fn try_parse_json(text: &str) -> Option<serde_json::Value> {
        // Try direct parse
        if let Ok(json) = serde_json::from_str(text) {
            return Some(json);
        }

        // Try to find JSON in text (look for {...} or [...])
        if let Some(start) = text.find('{') {
            if let Some(end) = text.rfind('}') {
                if let Ok(json) = serde_json::from_str(&text[start..=end]) {
                    return Some(json);
                }
            }
        }

        if let Some(start) = text.find('[') {
            if let Some(end) = text.rfind(']') {
                if let Ok(json) = serde_json::from_str(&text[start..=end]) {
                    return Some(json);
                }
            }
        }

        None
    }

    /// Extracts learnings/insights from output (best-effort)
    pub fn extract_learnings(text: &str) -> Vec<String> {
        Self::extract_section_items(
            text,
            &["learnings", "insights"],
            &[
                "files changed",
                "changed files",
                "tests",
                "test results",
                "token usage",
                "tokens",
                "errors",
                "stack trace",
            ],
        )
    }

    /// Extracts a files-changed list from output (best-effort)
    pub fn extract_files_changed(text: &str) -> Vec<String> {
        let mut files = HashSet::new();

        // Explicit sections
        for item in Self::extract_section_items(
            text,
            &["files changed", "changed files"],
            &[
                "learnings",
                "insights",
                "tests",
                "test results",
                "token usage",
                "tokens",
                "errors",
            ],
        ) {
            for f in Self::extract_file_paths(&item) {
                files.insert(f);
            }
        }

        // Unified diffs
        if let Ok(re) = Regex::new(r"(?m)^diff --git a/(\S+) b/(\S+)") {
            for cap in re.captures_iter(text) {
                if let Some(m) = cap.get(2) {
                    files.insert(m.as_str().to_string());
                }
            }
        }
        if let Ok(re) = Regex::new(r"(?m)^\+\+\+ b/(\S+)") {
            for cap in re.captures_iter(text) {
                if let Some(m) = cap.get(1) {
                    files.insert(m.as_str().to_string());
                }
            }
        }

        // Git status / porcelain
        if let Ok(re) =
            Regex::new(r"(?m)^(?:modified:|new file:|deleted:|renamed:|copied:)\s+(\S+)")
        {
            for cap in re.captures_iter(text) {
                if let Some(m) = cap.get(1) {
                    files.insert(m.as_str().to_string());
                }
            }
        }
        if let Ok(re) = Regex::new(r"(?m)^[ MADRCU\?]{1,2}\s+(\S+)$") {
            for cap in re.captures_iter(text) {
                if let Some(m) = cap.get(1) {
                    files.insert(m.as_str().to_string());
                }
            }
        }

        // Fallback: any file-like paths
        for p in Self::extract_file_paths(text) {
            files.insert(p);
        }

        files.into_iter().collect()
    }

    /// Extracts test results (passed/failed/skipped) from output (best-effort)
    pub fn extract_test_results(text: &str) -> Option<TestResults> {
        // Cargo format: "test result: ok. 10 passed; 0 failed; 1 ignored; ..."
        if let Ok(re) = Regex::new(
            r"(?im)^test result:\s*(?:ok|failed)\.?\s*(\d+)\s+passed;\s*(\d+)\s+failed;\s*(\d+)\s+(?:ignored|skipped);",
        ) {
            if let Some(cap) = re.captures(text) {
                let passed = cap.get(1).and_then(|m| m.as_str().parse::<u32>().ok());
                let failed = cap.get(2).and_then(|m| m.as_str().parse::<u32>().ok());
                let skipped = cap.get(3).and_then(|m| m.as_str().parse::<u32>().ok());
                return Some(TestResults {
                    passed,
                    failed,
                    skipped,
                });
            }
        }

        // Generic patterns (Vitest/Jest/etc)
        let passed = Regex::new(r"(?i)\b(\d+)\s+passed\b").ok();
        let failed = Regex::new(r"(?i)\b(\d+)\s+failed\b").ok();
        let skipped = Regex::new(r"(?i)\b(\d+)\s+(?:skipped|ignored)\b").ok();

        let mut result = TestResults::default();
        if let Some(re) = passed {
            if let Some(cap) = re.captures(text) {
                result.passed = cap.get(1).and_then(|m| m.as_str().parse::<u32>().ok());
            }
        }
        if let Some(re) = failed {
            if let Some(cap) = re.captures(text) {
                result.failed = cap.get(1).and_then(|m| m.as_str().parse::<u32>().ok());
            }
        }
        if let Some(re) = skipped {
            if let Some(cap) = re.captures(text) {
                result.skipped = cap.get(1).and_then(|m| m.as_str().parse::<u32>().ok());
            }
        }

        if result.passed.is_some() || result.failed.is_some() || result.skipped.is_some() {
            Some(result)
        } else {
            None
        }
    }

    /// Extracts token usage from plain text (best-effort)
    pub fn extract_token_usage_from_text(text: &str) -> Option<TokenUsage> {
        let mut usage = TokenUsage::default();

        let input_re = Regex::new(r"(?i)\binput\s*tokens?\b\s*[:=]\s*(\d+)").ok();
        let output_re = Regex::new(r"(?i)\boutput\s*tokens?\b\s*[:=]\s*(\d+)").ok();
        let total_re = Regex::new(r"(?i)\btotal\s*tokens?\b\s*[:=]\s*(\d+)").ok();

        if let Some(re) = input_re {
            if let Some(cap) = re.captures(text) {
                usage.input_tokens = cap.get(1).and_then(|m| m.as_str().parse::<u64>().ok());
            }
        }
        if let Some(re) = output_re {
            if let Some(cap) = re.captures(text) {
                usage.output_tokens = cap.get(1).and_then(|m| m.as_str().parse::<u64>().ok());
            }
        }
        if let Some(re) = total_re {
            if let Some(cap) = re.captures(text) {
                usage.total_tokens = cap.get(1).and_then(|m| m.as_str().parse::<u64>().ok());
            }
        }

        if !usage.is_empty() {
            // If total missing but input+output present, compute it.
            if usage.total_tokens.is_none() {
                if let (Some(i), Some(o)) = (usage.input_tokens, usage.output_tokens) {
                    usage.total_tokens = Some(i + o);
                }
            }
            Some(usage)
        } else {
            None
        }
    }

    /// Extracts stack traces as standalone blocks (best-effort)
    pub fn extract_stack_traces(stdout: &str, stderr: &str) -> Vec<String> {
        let mut traces = Vec::new();
        for err in Self::extract_error_blocks(stderr)
            .into_iter()
            .chain(Self::extract_error_blocks(stdout))
        {
            if Self::looks_like_stack_trace(&err.message) {
                traces.push(err.message);
            }
        }
        traces
    }

    /// Extracts errors from stdout and stderr (best-effort)
    pub fn extract_errors(stdout: &str, stderr: &str) -> Vec<PlatformError> {
        let mut errors = Vec::new();
        errors.extend(Self::extract_error_blocks(stderr));
        errors.extend(Self::extract_error_blocks(stdout));
        errors
    }

    fn looks_like_stack_trace(text: &str) -> bool {
        let lower = text.to_lowercase();
        text.contains('\n')
            && (lower.contains("traceback (most recent call last)")
                || lower.contains("stack backtrace")
                || lower.contains("panicked at")
                || lower.contains("caused by")
                || lower.contains("\n at ")
                || lower.contains("\n    at ")
                || lower.contains("\n\tat "))
    }

    fn extract_error_blocks(text: &str) -> Vec<PlatformError> {
        let mut errors = Vec::new();
        let lines: Vec<&str> = text.lines().collect();
        let mut i = 0usize;

        while i < lines.len() {
            let line = lines[i];
            let trimmed = line.trim_end();
            if trimmed.trim().is_empty() {
                i += 1;
                continue;
            }

            if !Self::is_error_start_line(trimmed) {
                i += 1;
                continue;
            }

            let mut block = vec![trimmed.to_string()];
            i += 1;

            while i < lines.len() {
                let next = lines[i].trim_end();
                if next.trim().is_empty() {
                    break;
                }
                if Self::is_error_continuation_line(lines[i]) {
                    block.push(next.to_string());
                    i += 1;
                    continue;
                }
                break;
            }

            let message = block.join("\n");
            let category = ErrorCategory::detect(block[0].as_str());
            errors.push(PlatformError::new(
                message,
                category,
                category.is_recoverable(),
            ));

            i += 1;
        }

        errors
    }

    fn is_error_start_line(line: &str) -> bool {
        let lower = line.trim().to_lowercase();
        lower.contains("error")
            || lower.contains("failed")
            || lower.contains("fatal")
            || lower.contains("panic")
            || lower.starts_with("traceback (most recent call last):")
            || lower.contains("exception")
    }

    fn is_error_continuation_line(line: &str) -> bool {
        let trimmed = line.trim_end();
        if trimmed.trim().is_empty() {
            return false;
        }
        let s = trimmed.trim_start();
        line.starts_with(' ')
            || line.starts_with('\t')
            || s.starts_with("at ")
            || s.starts_with("Caused by:")
            || s.starts_with("stack backtrace")
            || s.starts_with("File ")
            || s.starts_with('|')
            || s.starts_with('^')
            || s.starts_with("note:")
            || s.starts_with("help:")
    }

    fn extract_section_items(
        text: &str,
        section_keywords: &[&str],
        stop_keywords: &[&str],
    ) -> Vec<String> {
        let lines: Vec<&str> = text.lines().collect();
        let mut start = None;

        for (idx, line) in lines.iter().enumerate() {
            let t = line.trim();
            if t.is_empty() {
                continue;
            }
            let lower = t.to_lowercase();
            let is_header = t.starts_with('#') || t.ends_with(':');
            if is_header && section_keywords.iter().any(|k| lower.contains(k)) {
                start = Some(idx + 1);
                break;
            }
        }

        let Some(start_idx) = start else {
            return Vec::new();
        };

        let mut end_idx = lines.len();
        for idx in start_idx..lines.len() {
            let t = lines[idx].trim();
            if t.is_empty() {
                continue;
            }
            if t.starts_with('#') {
                end_idx = idx;
                break;
            }
            if t.ends_with(':') {
                let lower = t.to_lowercase();
                if stop_keywords.iter().any(|k| lower.contains(k)) {
                    end_idx = idx;
                    break;
                }
            }
        }

        let mut items = Vec::new();
        let mut current: Option<String> = None;
        let mut in_code = false;

        for raw in &lines[start_idx..end_idx] {
            let line = raw.trim_end();
            let t = line.trim();
            if t.starts_with("```") {
                in_code = !in_code;
                continue;
            }
            if in_code || t.is_empty() {
                continue;
            }

            if let Some(stripped) = Self::strip_list_prefix(t) {
                if let Some(prev) = current.take() {
                    items.push(prev);
                }
                current = Some(stripped.to_string());
                continue;
            }

            if (raw.starts_with(' ') || raw.starts_with('\t')) && current.is_some() {
                if let Some(cur) = current.as_mut() {
                    cur.push(' ');
                    cur.push_str(t);
                }
                continue;
            }

            if let Some(prev) = current.take() {
                items.push(prev);
            }
            items.push(t.to_string());
        }

        if let Some(prev) = current.take() {
            items.push(prev);
        }

        Self::dedupe_preserve_order(&mut items);
        items
    }

    fn strip_list_prefix(line: &str) -> Option<&str> {
        let t = line.trim_start();
        for prefix in ["- ", "* ", "• "] {
            if let Some(rest) = t.strip_prefix(prefix) {
                return Some(rest.trim());
            }
        }
        // "1. item"
        if let Ok(re) = Regex::new(r"^\d+\.\s+(.*)$") {
            if let Some(cap) = re.captures(t) {
                return cap.get(1).map(|m| m.as_str().trim());
            }
        }
        None
    }

    pub fn dedupe_preserve_order(items: &mut Vec<String>) {
        let mut seen = HashSet::new();
        items.retain(|s| seen.insert(s.clone()));
    }
}

// ============================================================================
// Platform-specific parsers
// ============================================================================

/// Cursor output parser
pub struct CursorOutputParser;

impl OutputParser for CursorOutputParser {
    fn platform(&self) -> Platform {
        Platform::Cursor
    }

    fn parse(&self, stdout: &str, stderr: &str) -> ParsedOutput {
        let mut output = ParsedOutput::new(stdout.to_string());

        // Detect completion signal
        output.completion_signal = CompletionSignal::detect(stdout);

        // Try to parse JSON output (Cursor supports --output-format json)
        if let Some(json) = ParsingUtils::try_parse_json(stdout) {
            output.json_response = Some(json.clone());

            // Extract token usage from JSON
            if let Some(usage) = json.get("usage") {
                let mut token_usage = TokenUsage::default();

                if let Some(input) = usage.get("input_tokens").and_then(|v| v.as_u64()) {
                    token_usage.input_tokens = Some(input);
                }
                if let Some(output_tok) = usage.get("output_tokens").and_then(|v| v.as_u64()) {
                    token_usage.output_tokens = Some(output_tok);
                }

                if !token_usage.is_empty() {
                    output.token_usage = Some(token_usage);
                }
            }

            // Extract files changed
            if let Some(files) = json.get("files_changed").and_then(|v| v.as_array()) {
                output.files_changed = files
                    .iter()
                    .filter_map(|v| v.as_str().map(String::from))
                    .collect();
            }
        }

        let combined = format!("{stdout}\n{stderr}");
        output.learnings = ParsingUtils::extract_learnings(&combined);
        output.test_results = ParsingUtils::extract_test_results(&combined);
        output.stack_traces = ParsingUtils::extract_stack_traces(stdout, stderr);

        if output.token_usage.is_none() {
            output.token_usage = ParsingUtils::extract_token_usage_from_text(&combined);
        }

        // Merge any JSON-provided file list with best-effort extraction
        let mut file_set: HashSet<String> = output.files_changed.drain(..).collect();
        for f in ParsingUtils::extract_files_changed(&combined) {
            file_set.insert(f);
        }
        output.files_changed = file_set.into_iter().collect();

        output.errors = ParsingUtils::extract_errors(stdout, stderr);

        output
    }
}

/// Claude output parser
pub struct ClaudeOutputParser;

impl OutputParser for ClaudeOutputParser {
    fn platform(&self) -> Platform {
        Platform::Claude
    }

    fn parse(&self, stdout: &str, stderr: &str) -> ParsedOutput {
        let mut output = ParsedOutput::new(stdout.to_string());

        // Detect completion signal
        output.completion_signal = CompletionSignal::detect(stdout);

        // Try to parse JSON output (Claude supports --output-format json)
        if let Some(json) = ParsingUtils::try_parse_json(stdout) {
            output.json_response = Some(json.clone());

            // Extract token usage from result.usage
            if let Some(result) = json.get("result") {
                if let Some(usage) = result.get("usage") {
                    let mut token_usage = TokenUsage::default();

                    if let Some(input) = usage.get("input_tokens").and_then(|v| v.as_u64()) {
                        token_usage.input_tokens = Some(input);
                    }
                    if let Some(output_tok) = usage.get("output_tokens").and_then(|v| v.as_u64()) {
                        token_usage.output_tokens = Some(output_tok);
                    }

                    // Claude-specific cache tokens
                    if let Some(cache_read) = usage
                        .get("cache_read_input_tokens")
                        .and_then(|v| v.as_u64())
                    {
                        token_usage.cache_read_tokens = Some(cache_read);
                    }
                    if let Some(cache_create) = usage
                        .get("cache_creation_input_tokens")
                        .and_then(|v| v.as_u64())
                    {
                        token_usage.cache_creation_tokens = Some(cache_create);
                    }

                    if !token_usage.is_empty() {
                        output.token_usage = Some(token_usage);
                    }
                }
            }
        }

        let combined = format!("{stdout}\n{stderr}");
        output.learnings = ParsingUtils::extract_learnings(&combined);
        output.test_results = ParsingUtils::extract_test_results(&combined);
        output.stack_traces = ParsingUtils::extract_stack_traces(stdout, stderr);

        if output.token_usage.is_none() {
            output.token_usage = ParsingUtils::extract_token_usage_from_text(&combined);
        }

        output.files_changed = ParsingUtils::extract_files_changed(&combined);
        output.errors = ParsingUtils::extract_errors(stdout, stderr);

        output
    }
}

/// Codex output parser
pub struct CodexOutputParser;

impl OutputParser for CodexOutputParser {
    fn platform(&self) -> Platform {
        Platform::Codex
    }

    fn parse(&self, stdout: &str, stderr: &str) -> ParsedOutput {
        let mut output = ParsedOutput::new(stdout.to_string());

        // Detect completion signal
        output.completion_signal = CompletionSignal::detect(stdout);

        // Codex outputs JSONL events (one JSON object per line with --json flag)
        let mut total_input_tokens = 0u64;
        let mut total_output_tokens = 0u64;
        let mut has_usage = false;

        for line in stdout.lines() {
            if let Some(json) = ParsingUtils::try_parse_json(line) {
                // Look for Turn events with usage information
                if let Some(event_type) = json.get("type").and_then(|v| v.as_str()) {
                    if event_type == "Turn" || event_type == "turn" {
                        if let Some(usage) = json.get("usage") {
                            if let Some(input) = usage.get("input_tokens").and_then(|v| v.as_u64())
                            {
                                total_input_tokens += input;
                                has_usage = true;
                            }
                            if let Some(output_tok) =
                                usage.get("output_tokens").and_then(|v| v.as_u64())
                            {
                                total_output_tokens += output_tok;
                                has_usage = true;
                            }
                        }
                    }
                }

                // Store last JSON response
                output.json_response = Some(json);
            }
        }

        if has_usage {
            output.token_usage = Some(TokenUsage::new(total_input_tokens, total_output_tokens));
        }

        let combined = format!("{stdout}\n{stderr}");
        output.learnings = ParsingUtils::extract_learnings(&combined);
        output.test_results = ParsingUtils::extract_test_results(&combined);
        output.stack_traces = ParsingUtils::extract_stack_traces(stdout, stderr);

        if output.token_usage.is_none() {
            output.token_usage = ParsingUtils::extract_token_usage_from_text(&combined);
        }

        output.files_changed = ParsingUtils::extract_files_changed(&combined);
        output.errors = ParsingUtils::extract_errors(stdout, stderr);

        output
    }
}

/// Gemini output parser
pub struct GeminiOutputParser;

impl OutputParser for GeminiOutputParser {
    fn platform(&self) -> Platform {
        Platform::Gemini
    }

    fn parse(&self, stdout: &str, stderr: &str) -> ParsedOutput {
        let mut output = ParsedOutput::new(stdout.to_string());

        // Detect completion signal
        output.completion_signal = CompletionSignal::detect(stdout);

        // Try to parse JSON output (Gemini supports --output-format json)
        if let Some(json) = ParsingUtils::try_parse_json(stdout) {
            output.json_response = Some(json.clone());

            // Extract token usage from usageMetadata
            if let Some(usage) = json.get("usageMetadata") {
                let mut token_usage = TokenUsage::default();

                if let Some(input) = usage.get("promptTokenCount").and_then(|v| v.as_u64()) {
                    token_usage.input_tokens = Some(input);
                }
                if let Some(output_tok) = usage.get("candidatesTokenCount").and_then(|v| v.as_u64())
                {
                    token_usage.output_tokens = Some(output_tok);
                }
                if let Some(total) = usage.get("totalTokenCount").and_then(|v| v.as_u64()) {
                    token_usage.total_tokens = Some(total);
                }

                if !token_usage.is_empty() {
                    output.token_usage = Some(token_usage);
                }
            }
        }

        let combined = format!("{stdout}\n{stderr}");
        output.learnings = ParsingUtils::extract_learnings(&combined);
        output.test_results = ParsingUtils::extract_test_results(&combined);
        output.stack_traces = ParsingUtils::extract_stack_traces(stdout, stderr);

        if output.token_usage.is_none() {
            output.token_usage = ParsingUtils::extract_token_usage_from_text(&combined);
        }

        output.files_changed = ParsingUtils::extract_files_changed(&combined);
        output.errors = ParsingUtils::extract_errors(stdout, stderr);

        output
    }
}

/// Copilot output parser
pub struct CopilotOutputParser;

impl OutputParser for CopilotOutputParser {
    fn platform(&self) -> Platform {
        Platform::Copilot
    }

    fn parse(&self, stdout: &str, stderr: &str) -> ParsedOutput {
        let mut output = ParsedOutput::new(stdout.to_string());

        // Detect completion signal
        output.completion_signal = CompletionSignal::detect(stdout);

        // Copilot (GitHub CLI) doesn't have structured JSON output
        // Use regex-based extraction

        // Try to extract token counts from text patterns
        if let Ok(re) = Regex::new(r"(?i)(\d+)\s*tokens?\s*(?:used|consumed)") {
            if let Some(cap) = re.captures(stdout) {
                if let Some(count) = cap.get(1).and_then(|m| m.as_str().parse::<u64>().ok()) {
                    output.token_usage = Some(TokenUsage {
                        total_tokens: Some(count),
                        ..Default::default()
                    });
                }
            }
        }

        let combined = format!("{stdout}\n{stderr}");
        output.learnings = ParsingUtils::extract_learnings(&combined);
        output.test_results = ParsingUtils::extract_test_results(&combined);
        output.stack_traces = ParsingUtils::extract_stack_traces(stdout, stderr);

        if output.token_usage.is_none() {
            output.token_usage = ParsingUtils::extract_token_usage_from_text(&combined);
        }

        output.files_changed = ParsingUtils::extract_files_changed(&combined);
        output.errors = ParsingUtils::extract_errors(stdout, stderr);

        // Detect Copilot-specific errors
        if stdout.contains("not authenticated") || stderr.contains("not authenticated") {
            output.errors.push(PlatformError::new(
                "GitHub Copilot authentication required",
                ErrorCategory::AuthFailure,
                true,
            ));
        }

        output
    }
}

/// Creates an output parser for a given platform
pub fn create_parser(platform: Platform) -> Box<dyn OutputParser> {
    match platform {
        Platform::Cursor => Box::new(CursorOutputParser),
        Platform::Claude => Box::new(ClaudeOutputParser),
        Platform::Codex => Box::new(CodexOutputParser),
        Platform::Gemini => Box::new(GeminiOutputParser),
        Platform::Copilot => Box::new(CopilotOutputParser),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_completion_signal_detection() {
        assert_eq!(
            CompletionSignal::detect("Some output <ralph>COMPLETE</ralph> more text"),
            Some(CompletionSignal::Complete)
        );
        assert_eq!(
            CompletionSignal::detect("Output <ralph>GUTTER</ralph>"),
            Some(CompletionSignal::Gutter)
        );
        assert_eq!(CompletionSignal::detect("No signal here"), None);
    }

    #[test]
    fn test_error_category_detection() {
        assert_eq!(
            ErrorCategory::detect("Rate limit exceeded"),
            ErrorCategory::RateLimit
        );
        assert_eq!(
            ErrorCategory::detect("Authentication failed"),
            ErrorCategory::AuthFailure
        );
        assert_eq!(
            ErrorCategory::detect("Network timeout"),
            ErrorCategory::NetworkError
        );
    }

    #[test]
    fn test_file_path_extraction() {
        let text = "Modified ./src/main.rs and /home/user/test.py";
        let paths = ParsingUtils::extract_file_paths(text);
        assert!(!paths.is_empty());
        assert!(paths.iter().any(|p| p.contains("main.rs")));
    }

    #[test]
    fn test_json_parsing() {
        let json_text = r#"{"result": {"usage": {"input_tokens": 100, "output_tokens": 50}}}"#;
        let json = ParsingUtils::try_parse_json(json_text);
        assert!(json.is_some());
    }

    #[test]
    fn test_learnings_extraction() {
        let text = r#"
## Learnings
- Added proper parsing
- Fixed edge cases

## Files changed
- src/platforms/output_parser.rs

## Tests
- cargo test
"#;
        let learnings = ParsingUtils::extract_learnings(text);
        assert!(learnings.iter().any(|l| l.contains("proper parsing")));
        assert!(learnings.iter().any(|l| l.contains("edge cases")));
    }

    #[test]
    fn test_files_changed_extraction_from_diff() {
        let text = r#"
diff --git a/src/main.rs b/src/main.rs
index 0000000..1111111 100644
--- a/src/main.rs
+++ b/src/main.rs
"#;
        let files = ParsingUtils::extract_files_changed(text);
        assert!(files.iter().any(|f| f == "src/main.rs"));
    }

    #[test]
    fn test_test_results_extraction_cargo() {
        let text = "test result: ok. 10 passed; 2 failed; 1 ignored; 0 measured; 0 filtered out";
        let results = ParsingUtils::extract_test_results(text).unwrap();
        assert_eq!(results.passed, Some(10));
        assert_eq!(results.failed, Some(2));
        assert_eq!(results.skipped, Some(1));
    }

    #[test]
    fn test_token_usage_extraction_from_text() {
        let text = "Input tokens: 123\nOutput tokens: 45\nTotal tokens: 168";
        let usage = ParsingUtils::extract_token_usage_from_text(text).unwrap();
        assert_eq!(usage.input_tokens, Some(123));
        assert_eq!(usage.output_tokens, Some(45));
        assert_eq!(usage.total_tokens, Some(168));
    }

    #[test]
    fn test_error_block_and_stack_trace_extraction() {
        let stderr = r#"Error: Something failed
    at doThing (file.js:10:5)
    at main (file.js:20:1)
"#;
        let errors = ParsingUtils::extract_errors("", stderr);
        assert!(!errors.is_empty());
        assert!(errors[0].message.contains("at doThing"));

        let traces = ParsingUtils::extract_stack_traces("", stderr);
        assert!(!traces.is_empty());
    }

    #[test]
    fn test_cursor_parser() {
        let parser = CursorOutputParser;
        let stdout = r#"{"usage": {"input_tokens": 150, "output_tokens": 75}, "files_changed": ["test.rs"]}"#;
        let output = parser.parse(stdout, "");

        assert!(output.json_response.is_some());
        assert!(output.token_usage.is_some());
        assert_eq!(output.files_changed, vec!["test.rs"]);
    }

    #[test]
    fn test_claude_parser() {
        let parser = ClaudeOutputParser;
        let stdout = r#"{"result": {"usage": {"input_tokens": 200, "output_tokens": 100, "cache_read_input_tokens": 50}}}"#;
        let output = parser.parse(stdout, "");

        assert!(output.token_usage.is_some());
        let usage = output.token_usage.unwrap();
        assert_eq!(usage.input_tokens, Some(200));
        assert_eq!(usage.cache_read_tokens, Some(50));
    }

    #[test]
    fn test_create_parser() {
        for platform in Platform::all() {
            let parser = create_parser(*platform);
            assert_eq!(parser.platform(), *platform);
        }
    }
}
