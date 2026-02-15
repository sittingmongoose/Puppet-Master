//! Permission prompt detection in CLI output streams
//!
//! This module analyzes stdout/stderr streams from platform CLIs to detect
//! permission prompts, approval requests, and interactive decision points.
//!
//! Detected prompts can be auto-responded or escalated based on configuration.

use crate::types::Platform;
use log::debug;
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// DRY:DATA:PermissionPrompt
/// A detected permission prompt
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionPrompt {
    /// The platform that generated the prompt
    pub platform: Platform,
    /// The raw prompt text
    pub prompt_text: String,
    /// Type of permission being requested
    pub permission_type: PermissionType,
    /// Suggested response (based on pattern matching)
    pub suggested_response: Option<String>,
    /// Confidence level (0.0 to 1.0)
    pub confidence: f64,
    /// Whether this looks like a yes/no question
    pub is_yes_no: bool,
    /// Context lines around the prompt (if available)
    pub context: Option<Vec<String>>,
}

// DRY:DATA:PermissionType
/// Type of permission being requested
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PermissionType {
    /// Tool or command execution
    ToolExecution,
    /// File system access
    FileAccess,
    /// Network/API access
    NetworkAccess,
    /// Configuration change
    ConfigChange,
    /// Data deletion/modification
    DataModification,
    /// Generic approval request
    GenericApproval,
    /// Unknown permission type
    Unknown,
}

impl std::fmt::Display for PermissionType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            PermissionType::ToolExecution => write!(f, "tool_execution"),
            PermissionType::FileAccess => write!(f, "file_access"),
            PermissionType::NetworkAccess => write!(f, "network_access"),
            PermissionType::ConfigChange => write!(f, "config_change"),
            PermissionType::DataModification => write!(f, "data_modification"),
            PermissionType::GenericApproval => write!(f, "generic_approval"),
            PermissionType::Unknown => write!(f, "unknown"),
        }
    }
}

/// Permission pattern for detection
#[derive(Debug, Clone)]
struct PermissionPattern {
    /// Regex pattern to match
    regex: Regex,
    /// Type of permission
    permission_type: PermissionType,
    /// Confidence score
    confidence: f64,
    /// Suggested response
    suggested_response: Option<String>,
}

// DRY:DATA:PermissionDetector
/// Permission prompt detector
pub struct PermissionDetector {
    /// Platform-specific patterns
    patterns: HashMap<Platform, Vec<PermissionPattern>>,
}

impl PermissionDetector {
    /// Create a new permission detector
    pub fn new() -> Self {
        let mut detector = Self {
            patterns: HashMap::new(),
        };

        // Initialize patterns for each platform
        detector.init_cursor_patterns();
        detector.init_codex_patterns();
        detector.init_claude_patterns();
        detector.init_gemini_patterns();
        detector.init_copilot_patterns();

        detector
    }

    /// Initialize Cursor-specific patterns
    fn init_cursor_patterns(&mut self) {
        let patterns = vec![
            PermissionPattern {
                regex: Regex::new(r"(?i)allow.*tool.*execution\??").unwrap(),
                permission_type: PermissionType::ToolExecution,
                confidence: 0.9,
                suggested_response: Some("y".to_string()),
            },
            PermissionPattern {
                regex: Regex::new(r"(?i)approve.*file.*access\??").unwrap(),
                permission_type: PermissionType::FileAccess,
                confidence: 0.9,
                suggested_response: Some("y".to_string()),
            },
            PermissionPattern {
                regex: Regex::new(r"(?i)do you want to (proceed|continue)\??").unwrap(),
                permission_type: PermissionType::GenericApproval,
                confidence: 0.8,
                suggested_response: Some("y".to_string()),
            },
            PermissionPattern {
                regex: Regex::new(r"(?i)\[y/n\]").unwrap(),
                permission_type: PermissionType::GenericApproval,
                confidence: 0.7,
                suggested_response: None,
            },
        ];

        self.patterns.insert(Platform::Cursor, patterns);
    }

    /// Initialize Codex-specific patterns
    fn init_codex_patterns(&mut self) {
        let patterns = vec![
            PermissionPattern {
                regex: Regex::new(r"(?i)execute.*command\??").unwrap(),
                permission_type: PermissionType::ToolExecution,
                confidence: 0.85,
                suggested_response: Some("yes".to_string()),
            },
            PermissionPattern {
                regex: Regex::new(r"(?i)allow.*to (read|write|modify)\??").unwrap(),
                permission_type: PermissionType::FileAccess,
                confidence: 0.85,
                suggested_response: Some("yes".to_string()),
            },
            PermissionPattern {
                regex: Regex::new(r"(?i)confirm.*action\??").unwrap(),
                permission_type: PermissionType::GenericApproval,
                confidence: 0.75,
                suggested_response: Some("yes".to_string()),
            },
            PermissionPattern {
                regex: Regex::new(r"(?i)(yes|no)\?").unwrap(),
                permission_type: PermissionType::GenericApproval,
                confidence: 0.7,
                suggested_response: None,
            },
        ];

        self.patterns.insert(Platform::Codex, patterns);
    }

    /// Initialize Claude-specific patterns
    fn init_claude_patterns(&mut self) {
        let patterns = vec![
            PermissionPattern {
                regex: Regex::new(r"(?i)allow.*tool\??").unwrap(),
                permission_type: PermissionType::ToolExecution,
                confidence: 0.9,
                suggested_response: Some("y".to_string()),
            },
            PermissionPattern {
                regex: Regex::new(r"(?i)permission.*required").unwrap(),
                permission_type: PermissionType::GenericApproval,
                confidence: 0.8,
                suggested_response: None,
            },
            PermissionPattern {
                regex: Regex::new(r"(?i)approve\??").unwrap(),
                permission_type: PermissionType::GenericApproval,
                confidence: 0.75,
                suggested_response: Some("y".to_string()),
            },
        ];

        self.patterns.insert(Platform::Claude, patterns);
    }

    /// Initialize Gemini-specific patterns
    fn init_gemini_patterns(&mut self) {
        let patterns = vec![
            PermissionPattern {
                regex: Regex::new(r"(?i)authorize.*operation\??").unwrap(),
                permission_type: PermissionType::GenericApproval,
                confidence: 0.85,
                suggested_response: Some("y".to_string()),
            },
            PermissionPattern {
                regex: Regex::new(r"(?i)grant.*permission\??").unwrap(),
                permission_type: PermissionType::GenericApproval,
                confidence: 0.85,
                suggested_response: Some("y".to_string()),
            },
            PermissionPattern {
                regex: Regex::new(r"(?i)\(y/n\)").unwrap(),
                permission_type: PermissionType::GenericApproval,
                confidence: 0.7,
                suggested_response: None,
            },
        ];

        self.patterns.insert(Platform::Gemini, patterns);
    }

    /// Initialize Copilot-specific patterns
    fn init_copilot_patterns(&mut self) {
        let patterns = vec![
            PermissionPattern {
                regex: Regex::new(r"(?i)allow copilot to\??").unwrap(),
                permission_type: PermissionType::GenericApproval,
                confidence: 0.85,
                suggested_response: Some("y".to_string()),
            },
            PermissionPattern {
                regex: Regex::new(r"(?i)consent.*required").unwrap(),
                permission_type: PermissionType::GenericApproval,
                confidence: 0.8,
                suggested_response: None,
            },
        ];

        self.patterns.insert(Platform::Copilot, patterns);
    }

    /// Detect permission prompts in output
    pub fn detect(&self, platform: Platform, output: &str) -> Option<PermissionPrompt> {
        let patterns = self.patterns.get(&platform)?;

        // Try to match each pattern
        for pattern in patterns {
            if pattern.regex.is_match(output) {
                debug!("Detected permission prompt for {}: {}", platform, output);

                return Some(PermissionPrompt {
                    platform,
                    prompt_text: output.to_string(),
                    permission_type: pattern.permission_type,
                    suggested_response: pattern.suggested_response.clone(),
                    confidence: pattern.confidence,
                    is_yes_no: self.is_yes_no_prompt(output),
                    context: None,
                });
            }
        }

        None
    }

    /// Detect permission prompts in multiple lines
    pub fn detect_in_lines(&self, platform: Platform, lines: &[String]) -> Vec<PermissionPrompt> {
        let mut prompts = Vec::new();

        for (idx, line) in lines.iter().enumerate() {
            if let Some(mut prompt) = self.detect(platform, line) {
                // Add context lines
                let mut context = Vec::new();

                // Previous line
                if idx > 0 {
                    context.push(lines[idx - 1].clone());
                }

                // Current line
                context.push(line.clone());

                // Next line
                if idx + 1 < lines.len() {
                    context.push(lines[idx + 1].clone());
                }

                prompt.context = Some(context);
                prompts.push(prompt);
            }
        }

        prompts
    }

    /// Check if output contains a yes/no prompt
    fn is_yes_no_prompt(&self, output: &str) -> bool {
        let output_lower = output.to_lowercase();

        // Common yes/no patterns
        output_lower.contains("[y/n]")
            || output_lower.contains("(y/n)")
            || output_lower.contains("yes/no")
            || output_lower.contains("(yes/no)")
            || output_lower.contains("[yes/no]")
    }

    /// Extract response options from prompt
    pub fn extract_options(&self, prompt: &str) -> Vec<String> {
        let mut options = Vec::new();

        // Look for [option1/option2] or (option1/option2) patterns
        let pattern = Regex::new(r"[\[\(]([^/\]\)]+)(?:/([^/\]\)]+))+[\]\)]").unwrap();

        if let Some(caps) = pattern.captures(prompt) {
            for i in 1..caps.len() {
                if let Some(opt) = caps.get(i) {
                    let opt_str = opt.as_str().trim().to_string();
                    if !opt_str.is_empty() && !options.contains(&opt_str) {
                        options.push(opt_str);
                    }
                }
            }
        }

        // If no options found, try to detect common yes/no variations
        if options.is_empty() && self.is_yes_no_prompt(prompt) {
            options.push("y".to_string());
            options.push("n".to_string());
        }

        options
    }

    /// Get all supported platforms
    pub fn supported_platforms(&self) -> Vec<Platform> {
        self.patterns.keys().copied().collect()
    }
}

impl Default for PermissionDetector {
    fn default() -> Self {
        Self::new()
    }
}

// DRY:DATA:AutoResponsePolicy
/// Auto-response policy for permission prompts
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AutoResponsePolicy {
    /// Always auto-approve
    AlwaysApprove,
    /// Always reject
    AlwaysReject,
    /// Auto-approve based on confidence threshold
    ConfidenceBased { threshold: u8 }, // 0-100
    /// Escalate to user
    Escalate,
}

impl AutoResponsePolicy {
    /// Determine response based on policy
    pub fn determine_response(&self, prompt: &PermissionPrompt) -> Option<String> {
        match self {
            AutoResponsePolicy::AlwaysApprove => {
                if prompt.is_yes_no {
                    Some("y".to_string())
                } else {
                    prompt.suggested_response.clone()
                }
            }
            AutoResponsePolicy::AlwaysReject => {
                if prompt.is_yes_no {
                    Some("n".to_string())
                } else {
                    None
                }
            }
            AutoResponsePolicy::ConfidenceBased { threshold } => {
                let confidence_pct = (prompt.confidence * 100.0) as u8;
                if confidence_pct >= *threshold {
                    prompt.suggested_response.clone()
                } else {
                    None
                }
            }
            AutoResponsePolicy::Escalate => None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cursor_permission_detection() {
        let detector = PermissionDetector::new();
        let output = "Allow tool execution? [y/n]";

        let prompt = detector.detect(Platform::Cursor, output);
        assert!(prompt.is_some());

        let prompt = prompt.unwrap();
        assert_eq!(prompt.platform, Platform::Cursor);
        assert_eq!(prompt.permission_type, PermissionType::ToolExecution);
        assert!(prompt.is_yes_no);
        assert!(prompt.confidence > 0.8);
    }

    #[test]
    fn test_codex_permission_detection() {
        let detector = PermissionDetector::new();
        let output = "Execute command? (yes/no)";

        let prompt = detector.detect(Platform::Codex, output);
        assert!(prompt.is_some());

        let prompt = prompt.unwrap();
        assert_eq!(prompt.permission_type, PermissionType::ToolExecution);
    }

    #[test]
    fn test_file_access_detection() {
        let detector = PermissionDetector::new();
        let output = "Approve file access?";

        let prompt = detector.detect(Platform::Cursor, output);
        assert!(prompt.is_some());

        let prompt = prompt.unwrap();
        assert_eq!(prompt.permission_type, PermissionType::FileAccess);
    }

    #[test]
    fn test_yes_no_detection() {
        let detector = PermissionDetector::new();

        assert!(detector.is_yes_no_prompt("Continue? [y/n]"));
        assert!(detector.is_yes_no_prompt("Approve? (yes/no)"));
        assert!(detector.is_yes_no_prompt("Do you want to proceed? [Y/N]"));
        assert!(!detector.is_yes_no_prompt("Enter your choice:"));
    }

    #[test]
    fn test_extract_options() {
        let detector = PermissionDetector::new();

        let options = detector.extract_options("Continue? [y/n]");
        assert!(options.contains(&"y".to_string()));
        assert!(options.contains(&"n".to_string()));

        let options = detector.extract_options("Choose: [yes/no/cancel]");
        assert_eq!(options.len(), 2); // Should extract yes and no
    }

    #[test]
    fn test_detect_in_lines() {
        let detector = PermissionDetector::new();
        let lines = vec![
            "Processing request...".to_string(),
            "Allow tool execution? [y/n]".to_string(),
            "Waiting for response...".to_string(),
        ];

        let prompts = detector.detect_in_lines(Platform::Cursor, &lines);
        assert_eq!(prompts.len(), 1);

        let prompt = &prompts[0];
        assert!(prompt.context.is_some());
        assert_eq!(prompt.context.as_ref().unwrap().len(), 3);
    }

    #[test]
    fn test_auto_response_policy_always_approve() {
        let policy = AutoResponsePolicy::AlwaysApprove;
        let prompt = PermissionPrompt {
            platform: Platform::Cursor,
            prompt_text: "Allow? [y/n]".to_string(),
            permission_type: PermissionType::GenericApproval,
            suggested_response: Some("y".to_string()),
            confidence: 0.9,
            is_yes_no: true,
            context: None,
        };

        let response = policy.determine_response(&prompt);
        assert_eq!(response, Some("y".to_string()));
    }

    #[test]
    fn test_auto_response_policy_confidence_based() {
        let policy = AutoResponsePolicy::ConfidenceBased { threshold: 80 };

        // High confidence - should approve
        let prompt_high = PermissionPrompt {
            platform: Platform::Cursor,
            prompt_text: "Allow? [y/n]".to_string(),
            permission_type: PermissionType::GenericApproval,
            suggested_response: Some("y".to_string()),
            confidence: 0.9,
            is_yes_no: true,
            context: None,
        };

        let response = policy.determine_response(&prompt_high);
        assert_eq!(response, Some("y".to_string()));

        // Low confidence - should escalate (return None)
        let prompt_low = PermissionPrompt {
            platform: Platform::Cursor,
            prompt_text: "Allow? [y/n]".to_string(),
            permission_type: PermissionType::GenericApproval,
            suggested_response: Some("y".to_string()),
            confidence: 0.5,
            is_yes_no: true,
            context: None,
        };

        let response = policy.determine_response(&prompt_low);
        assert!(response.is_none());
    }

    #[test]
    fn test_supported_platforms() {
        let detector = PermissionDetector::new();
        let platforms = detector.supported_platforms();

        assert_eq!(platforms.len(), 5);
        assert!(platforms.contains(&Platform::Cursor));
        assert!(platforms.contains(&Platform::Codex));
        assert!(platforms.contains(&Platform::Claude));
        assert!(platforms.contains(&Platform::Gemini));
        assert!(platforms.contains(&Platform::Copilot));
    }
}
