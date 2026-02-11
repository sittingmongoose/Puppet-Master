//! Loop guard for detecting infinite worker/reviewer ping-pong cycles
//!
//! Implements deterministic loop detection using:
//! - Message content hashing (MD5 for speed)
//! - Repetition counting
//! - Configurable thresholds
//! - Pattern-based cycle detection


use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};

/// Configuration for loop guard
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoopGuardConfig {
    /// Whether loop guard is enabled
    pub enabled: bool,
    /// Maximum allowed repetitions of same content
    pub max_repetitions: usize,
    /// Size of detection window for pattern analysis
    pub detection_window: usize,
    /// Whether to suppress reply relay messages
    pub suppress_reply_relay: bool,
}

impl Default for LoopGuardConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            max_repetitions: 3,
            detection_window: 10,
            suppress_reply_relay: true,
        }
    }
}

/// Message structure for loop guard evaluation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoopGuardMessage {
    /// Message kind (control, system, reply, reviewer_feedback, etc.)
    pub kind: String,
    /// Optional sender identifier
    pub from: Option<String>,
    /// Optional recipient identifier
    pub to: Option<String>,
    /// Message content to hash for repetition detection
    pub content: String,
}

impl LoopGuardMessage {
    /// Create new message
    pub fn new(
        kind: impl Into<String>,
        from: Option<impl Into<String>>,
        to: Option<impl Into<String>>,
        content: impl Into<String>,
    ) -> Self {
        Self {
            kind: kind.into(),
            from: from.map(|s| s.into()),
            to: to.map(|s| s.into()),
            content: content.into(),
        }
    }
}

/// Loop detection result
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum LoopDetection {
    /// Message is allowed
    Allowed,
    /// Message blocked - identical repetition
    BlockedRepetition { count: usize, max: usize },
    /// Message blocked - control/system type
    BlockedControlMessage,
    /// Message blocked - reply relay suppression
    BlockedReplyRelay,
    /// Message blocked - pattern detected
    BlockedPattern { pattern_length: usize },
}

impl LoopDetection {
    /// Check if message is blocked
    pub fn is_blocked(&self) -> bool {
        !matches!(self, Self::Allowed)
    }

    /// Check if message is allowed
    pub fn is_allowed(&self) -> bool {
        matches!(self, Self::Allowed)
    }

    /// Get reason for blocking
    pub fn reason(&self) -> Option<String> {
        match self {
            Self::Allowed => None,
            Self::BlockedRepetition { count, max } => {
                Some(format!("Message repeated {} times (max: {})", count, max))
            }
            Self::BlockedControlMessage => {
                Some("Control/system messages are not allowed".to_string())
            }
            Self::BlockedReplyRelay => {
                Some("Reply relay suppression is enabled".to_string())
            }
            Self::BlockedPattern { pattern_length } => {
                Some(format!("Pattern of length {} detected", pattern_length))
            }
        }
    }
}

/// Loop guard for preventing infinite cycles
pub struct LoopGuard {
    /// Configuration
    config: LoopGuardConfig,
    /// Message history (hash -> count)
    message_counts: HashMap<String, usize>,
    /// Recent message hashes for pattern detection
    recent_hashes: VecDeque<String>,
}

impl LoopGuard {
    /// Create new loop guard
    pub fn new(config: LoopGuardConfig) -> Self {
        Self {
            config,
            message_counts: HashMap::new(),
            recent_hashes: VecDeque::new(),
        }
    }

    /// Create with default configuration
    pub fn default_config() -> Self {
        Self::new(LoopGuardConfig::default())
    }

    /// Check if a message should be allowed
    ///
    /// # Arguments
    /// * `message` - Message to evaluate
    ///
    /// # Returns
    /// LoopDetection indicating whether message is allowed and why
    pub fn check(&mut self, message: &LoopGuardMessage) -> LoopDetection {
        // Guard disabled - allow everything
        if !self.config.enabled {
            return LoopDetection::Allowed;
        }

        // Rule 1: Never allow control/system messages
        if message.kind == "control" || message.kind == "system" {
            return LoopDetection::BlockedControlMessage;
        }

        // Rule 2: Suppress reply relay if configured
        if self.config.suppress_reply_relay && message.kind == "reply" {
            return LoopDetection::BlockedReplyRelay;
        }

        // Rule 3: Detect repeated patterns
        let hash = self.hash_message(message);
        let count = self.message_counts.entry(hash.clone()).or_insert(0);
        *count += 1;

        // Add to recent hashes for pattern detection
        self.recent_hashes.push_back(hash.clone());
        if self.recent_hashes.len() > self.config.detection_window {
            self.recent_hashes.pop_front();
        }

        // Check repetition threshold
        if *count > self.config.max_repetitions {
            return LoopDetection::BlockedRepetition {
                count: *count,
                max: self.config.max_repetitions,
            };
        }

        // Check for patterns in recent history
        if let Some(pattern_length) = self.detect_pattern() {
            return LoopDetection::BlockedPattern { pattern_length };
        }

        LoopDetection::Allowed
    }

    /// Check if message would be allowed (without modifying state)
    pub fn would_allow(&self, message: &LoopGuardMessage) -> bool {
        if !self.config.enabled {
            return true;
        }

        if message.kind == "control" || message.kind == "system" {
            return false;
        }

        if self.config.suppress_reply_relay && message.kind == "reply" {
            return false;
        }

        let hash = self.hash_message(message);
        let count = self.message_counts.get(&hash).unwrap_or(&0);
        
        *count < self.config.max_repetitions
    }

    /// Get current count for a specific message
    pub fn get_count(&self, message: &LoopGuardMessage) -> usize {
        let hash = self.hash_message(message);
        *self.message_counts.get(&hash).unwrap_or(&0)
    }

    /// Get total number of unique messages tracked
    pub fn unique_message_count(&self) -> usize {
        self.message_counts.len()
    }

    /// Reset the message history (call when switching contexts)
    pub fn reset(&mut self) {
        self.message_counts.clear();
        self.recent_hashes.clear();
    }

    /// Hash a message for repetition detection
    fn hash_message(&self, message: &LoopGuardMessage) -> String {
        // Use MD5 for speed (not security-critical)
        let data = format!(
            "{}|{}|{}|{}",
            message.kind,
            message.from.as_deref().unwrap_or(""),
            message.to.as_deref().unwrap_or(""),
            message.content
        );
        
        // Simple hash using hex encoding of bytes
        format!("{:x}", md5::compute(data.as_bytes()))
    }

    /// Detect repeating patterns in recent message history
    ///
    /// Returns pattern length if a pattern is detected
    fn detect_pattern(&self) -> Option<usize> {
        if self.recent_hashes.len() < 4 {
            return None; // Need at least 4 messages to detect pattern
        }

        // Check for patterns of length 2, 3, 4, etc.
        for pattern_len in 2..=(self.recent_hashes.len() / 2) {
            if self.has_repeating_pattern(pattern_len) {
                return Some(pattern_len);
            }
        }

        None
    }

    /// Check if recent hashes contain a repeating pattern of given length
    fn has_repeating_pattern(&self, pattern_len: usize) -> bool {
        if self.recent_hashes.len() < pattern_len * 2 {
            return false;
        }

        // Get the most recent pattern
        let hashes: Vec<_> = self.recent_hashes.iter().collect();
        let len = hashes.len();
        
        // Compare last N hashes with previous N hashes
        for i in 0..pattern_len {
            if hashes[len - pattern_len + i] != hashes[len - 2 * pattern_len + i] {
                return false;
            }
        }

        true
    }
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_allows_first_message() {
        let mut guard = LoopGuard::default_config();
        let msg = LoopGuardMessage::new("feedback", Some("reviewer"), Some("worker"), "Fix this");

        let result = guard.check(&msg);
        assert!(result.is_allowed());
    }

    #[test]
    fn test_blocks_control_messages() {
        let mut guard = LoopGuard::default_config();
        let msg = LoopGuardMessage::new("control", None::<&str>, None::<&str>, "stop");

        let result = guard.check(&msg);
        assert!(result.is_blocked());
        assert!(matches!(result, LoopDetection::BlockedControlMessage));
    }

    #[test]
    fn test_blocks_system_messages() {
        let mut guard = LoopGuard::default_config();
        let msg = LoopGuardMessage::new("system", None::<&str>, None::<&str>, "initializing");

        let result = guard.check(&msg);
        assert!(result.is_blocked());
    }

    #[test]
    fn test_blocks_reply_relay() {
        let mut guard = LoopGuard::default_config();
        let msg = LoopGuardMessage::new("reply", Some("worker"), Some("reviewer"), "done");

        let result = guard.check(&msg);
        assert!(result.is_blocked());
        assert!(matches!(result, LoopDetection::BlockedReplyRelay));
    }

    #[test]
    fn test_blocks_after_max_repetitions() {
        let mut guard = LoopGuard::default_config();
        let msg = LoopGuardMessage::new("feedback", Some("reviewer"), None::<&str>, "Fix this");

        // Allow first 3 times
        for _ in 0..3 {
            let result = guard.check(&msg);
            assert!(result.is_allowed());
        }

        // Block on 4th
        let result = guard.check(&msg);
        assert!(result.is_blocked());
        assert!(matches!(result, LoopDetection::BlockedRepetition { .. }));
    }

    #[test]
    fn test_different_messages_allowed() {
        let mut guard = LoopGuard::default_config();
        
        for i in 0..5 {
            let msg = LoopGuardMessage::new(
                "feedback",
                Some("reviewer"),
                None::<&str>,
                format!("Fix issue {}", i),
            );
            let result = guard.check(&msg);
            assert!(result.is_allowed());
        }
    }

    #[test]
    fn test_get_count() {
        let mut guard = LoopGuard::default_config();
        let msg = LoopGuardMessage::new("feedback", None::<&str>, None::<&str>, "Fix this");

        assert_eq!(guard.get_count(&msg), 0);
        
        guard.check(&msg);
        assert_eq!(guard.get_count(&msg), 1);
        
        guard.check(&msg);
        assert_eq!(guard.get_count(&msg), 2);
    }

    #[test]
    fn test_reset() {
        let mut guard = LoopGuard::default_config();
        let msg = LoopGuardMessage::new("feedback", None::<&str>, None::<&str>, "Fix this");

        guard.check(&msg);
        guard.check(&msg);
        assert_eq!(guard.get_count(&msg), 2);

        guard.reset();
        assert_eq!(guard.get_count(&msg), 0);
    }

    #[test]
    fn test_disabled_guard() {
        let config = LoopGuardConfig {
            enabled: false,
            ..Default::default()
        };
        let mut guard = LoopGuard::new(config);
        let msg = LoopGuardMessage::new("control", None::<&str>, None::<&str>, "stop");

        // Should allow even control messages when disabled
        let result = guard.check(&msg);
        assert!(result.is_allowed());
    }

    #[test]
    fn test_pattern_detection() {
        let mut guard = LoopGuard::default_config();
        
        // Create alternating pattern: A, B, A, B, A, B
        let msg_a = LoopGuardMessage::new("feedback", None::<&str>, None::<&str>, "Message A");
        let msg_b = LoopGuardMessage::new("feedback", None::<&str>, None::<&str>, "Message B");

        for _ in 0..3 {
            guard.check(&msg_a);
            guard.check(&msg_b);
        }

        // Pattern should be detected
        assert!(guard.detect_pattern().is_some());
    }

    #[test]
    fn test_would_allow() {
        let mut guard = LoopGuard::default_config();
        let msg = LoopGuardMessage::new("feedback", None::<&str>, None::<&str>, "Fix this");

        // Should allow before checking
        assert!(guard.would_allow(&msg));

        // Check multiple times
        for _ in 0..3 {
            guard.check(&msg);
        }

        // Should not allow after max repetitions
        assert!(!guard.would_allow(&msg));
    }

    #[test]
    fn test_unique_message_count() {
        let mut guard = LoopGuard::default_config();

        assert_eq!(guard.unique_message_count(), 0);

        guard.check(&LoopGuardMessage::new("feedback", None::<&str>, None::<&str>, "A"));
        assert_eq!(guard.unique_message_count(), 1);

        guard.check(&LoopGuardMessage::new("feedback", None::<&str>, None::<&str>, "B"));
        assert_eq!(guard.unique_message_count(), 2);

        guard.check(&LoopGuardMessage::new("feedback", None::<&str>, None::<&str>, "A"));
        assert_eq!(guard.unique_message_count(), 2); // Same as before
    }

    #[test]
    fn test_loop_detection_reason() {
        let detection = LoopDetection::BlockedRepetition { count: 5, max: 3 };
        assert!(detection.reason().is_some());
        assert!(detection.reason().unwrap().contains("repeated"));

        let detection = LoopDetection::Allowed;
        assert!(detection.reason().is_none());
    }
}
