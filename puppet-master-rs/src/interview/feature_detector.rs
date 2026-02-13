//! Detects major features from interview state and requirements for dynamic phase generation.

use super::state::{Decision, InterviewQA, InterviewState};
use log::debug;
use std::collections::HashSet;

/// A detected feature that warrants its own dedicated interview phase.
#[derive(Debug, Clone)]
pub struct DetectedFeature {
    /// Unique identifier (e.g., "auth", "api", "payment").
    pub id: String,
    /// Human-readable name.
    pub name: String,
    /// Brief description of what this feature entails.
    pub description: String,
    /// Confidence score (0.0 to 1.0) based on how many signals detected it.
    pub confidence: f32,
}

/// Analyzes interview state to detect major features requiring dedicated phases.
///
/// This is called after the 8 standard phases complete, before final document generation.
/// It looks for:
/// - Keywords in decisions and answers (authentication, API, payment, etc.)
/// - Complex features mentioned multiple times across different phases
/// - Explicit user statements about major components
///
/// Returns a list of detected features, sorted by confidence (highest first).
pub fn detect_features_from_state(state: &InterviewState) -> Vec<DetectedFeature> {
    let mut feature_scores: std::collections::HashMap<String, FeatureScore> =
        std::collections::HashMap::new();

    // Analyze decisions for feature keywords
    for decision in &state.decisions {
        scan_text_for_features(&decision.summary, &mut feature_scores, 2.0);
        scan_text_for_features(&decision.reasoning, &mut feature_scores, 1.5);
    }

    // Analyze Q&A history
    for qa in &state.history {
        scan_text_for_features(&qa.question, &mut feature_scores, 1.0);
        scan_text_for_features(&qa.answer, &mut feature_scores, 1.5);
    }

    // Convert scores to DetectedFeature list
    let mut features: Vec<DetectedFeature> = feature_scores
        .into_iter()
        .filter(|(_, score)| score.count >= 2) // Must appear at least twice
        .map(|(id, score)| {
            let confidence = (score.total_weight / 10.0).min(1.0); // Normalize to 0-1
            DetectedFeature {
                id: id.clone(),
                name: feature_id_to_name(&id),
                description: feature_id_to_description(&id),
                confidence,
            }
        })
        .collect();

    // Sort by confidence descending
    features.sort_by(|a, b| b.confidence.partial_cmp(&a.confidence).unwrap());

    // Limit to top 5 most significant features
    features.truncate(5);

    debug!(
        "Detected {} major features for dynamic phases: {:?}",
        features.len(),
        features.iter().map(|f| &f.id).collect::<Vec<_>>()
    );

    features
}

/// Internal tracking of feature detection signals.
#[derive(Debug, Clone)]
struct FeatureScore {
    count: usize,
    total_weight: f32,
}

/// Scans text for feature keywords and updates scores.
fn scan_text_for_features(
    text: &str,
    scores: &mut std::collections::HashMap<String, FeatureScore>,
    weight: f32,
) {
    let text_lower = text.to_lowercase();

    // Define feature keywords (each maps to a stable feature ID)
    let keywords: Vec<(&str, &str)> = vec![
        ("authentication", "auth"),
        ("auth", "auth"),
        ("login", "auth"),
        ("signup", "auth"),
        ("sign-up", "auth"),
        ("register", "auth"),
        ("oauth", "auth"),
        ("sso", "auth"),
        ("api", "api"),
        ("rest api", "api"),
        ("graphql", "api"),
        ("endpoint", "api"),
        ("payment", "payment"),
        ("billing", "payment"),
        ("subscription", "payment"),
        ("stripe", "payment"),
        ("checkout", "payment"),
        ("notification", "notifications"),
        ("push notification", "notifications"),
        ("email notification", "notifications"),
        ("alerts", "notifications"),
        ("search", "search"),
        ("full-text search", "search"),
        ("elasticsearch", "search"),
        ("file upload", "file-upload"),
        ("upload", "file-upload"),
        ("media storage", "file-upload"),
        ("real-time", "realtime"),
        ("websocket", "realtime"),
        ("live update", "realtime"),
        ("chat", "chat"),
        ("messaging", "chat"),
        ("admin", "admin"),
        ("admin panel", "admin"),
        ("dashboard", "admin"),
        ("reporting", "reporting"),
        ("analytics", "analytics"),
        ("metrics", "analytics"),
    ];

    for (keyword, feature_id) in keywords {
        if text_lower.contains(keyword) {
            let entry = scores
                .entry(feature_id.to_string())
                .or_insert(FeatureScore {
                    count: 0,
                    total_weight: 0.0,
                });
            entry.count += 1;
            entry.total_weight += weight;
        }
    }
}

/// Converts a feature ID to a human-readable name.
fn feature_id_to_name(id: &str) -> String {
    match id {
        "auth" => "Authentication",
        "api" => "API Layer",
        "payment" => "Payment Processing",
        "notifications" => "Notifications",
        "search" => "Search Functionality",
        "file-upload" => "File Upload & Storage",
        "realtime" => "Real-Time Features",
        "chat" => "Chat & Messaging",
        "admin" => "Admin Panel",
        "reporting" => "Reporting System",
        "analytics" => "Analytics",
        _ => id,
    }
    .to_string()
}

/// Generates a description for a feature based on its ID.
fn feature_id_to_description(id: &str) -> String {
    match id {
        "auth" => "User authentication, authorization, session management, and account security.",
        "api" => "API design, endpoints, request/response formats, versioning, and documentation.",
        "payment" => "Payment gateway integration, subscription management, billing, and refunds.",
        "notifications" => "Push notifications, email alerts, in-app notifications, and delivery channels.",
        "search" => "Search implementation, indexing strategy, query optimization, and relevance.",
        "file-upload" => "File upload handling, storage, validation, processing, and CDN integration.",
        "realtime" => "WebSocket/SSE implementation, real-time data synchronization, and live updates.",
        "chat" => "Chat system architecture, message storage, presence, and delivery guarantees.",
        "admin" => "Admin interface, user management, moderation tools, and system configuration.",
        "reporting" => "Report generation, data aggregation, export formats, and scheduling.",
        "analytics" => "Analytics tracking, event collection, metrics calculation, and visualization.",
        _ => "Deep dive into specific feature requirements, architecture, and implementation details.",
    }
    .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::interview::state::{Decision, create_state};
    use chrono::Utc;

    #[test]
    fn test_detect_features_empty_state() {
        let state = create_state("test", "claude", false, vec![]);
        let features = detect_features_from_state(&state);
        assert!(features.is_empty());
    }

    #[test]
    fn test_detect_auth_feature() {
        let mut state = create_state("test", "claude", false, vec![]);
        state.decisions.push(Decision {
            phase: "scope_goals".to_string(),
            summary: "Implement OAuth2 authentication".to_string(),
            reasoning: "Users need to login with Google".to_string(),
            timestamp: Utc::now().to_rfc3339(),
        });
        state.history.push(InterviewQA {
            question: "What authentication method?".to_string(),
            answer: "OAuth2 with social login".to_string(),
            timestamp: Utc::now().to_rfc3339(),
        });

        let features = detect_features_from_state(&state);
        assert!(!features.is_empty());
        assert_eq!(features[0].id, "auth");
        assert_eq!(features[0].name, "Authentication");
    }

    #[test]
    fn test_detect_multiple_features() {
        let mut state = create_state("test", "claude", false, vec![]);

        // Auth mentions
        state.decisions.push(Decision {
            phase: "security_secrets".to_string(),
            summary: "JWT authentication".to_string(),
            reasoning: "Need secure login".to_string(),
            timestamp: Utc::now().to_rfc3339(),
        });
        state.history.push(InterviewQA {
            question: "Auth method?".to_string(),
            answer: "JWT with refresh tokens".to_string(),
            timestamp: Utc::now().to_rfc3339(),
        });

        // API mentions
        state.decisions.push(Decision {
            phase: "architecture_technology".to_string(),
            summary: "REST API design".to_string(),
            reasoning: "Need RESTful endpoints".to_string(),
            timestamp: Utc::now().to_rfc3339(),
        });
        state.history.push(InterviewQA {
            question: "API style?".to_string(),
            answer: "REST API with OpenAPI spec".to_string(),
            timestamp: Utc::now().to_rfc3339(),
        });

        let features = detect_features_from_state(&state);
        assert!(features.len() >= 2);

        let ids: HashSet<String> = features.iter().map(|f| f.id.clone()).collect();
        assert!(ids.contains("auth"));
        assert!(ids.contains("api"));
    }

    #[test]
    fn test_single_mention_ignored() {
        let mut state = create_state("test", "claude", false, vec![]);
        state.decisions.push(Decision {
            phase: "scope_goals".to_string(),
            summary: "Brief payment mention".to_string(),
            reasoning: "One-time mention".to_string(),
            timestamp: Utc::now().to_rfc3339(),
        });

        let features = detect_features_from_state(&state);
        // Should be empty as payment only mentioned once (threshold is 2)
        assert!(features.is_empty());
    }

    #[test]
    fn test_confidence_scoring() {
        let mut state = create_state("test", "claude", false, vec![]);

        // Multiple strong signals for auth
        for _ in 0..5 {
            state.decisions.push(Decision {
                phase: "security_secrets".to_string(),
                summary: "OAuth2 authentication flow".to_string(),
                reasoning: "Secure login required".to_string(),
                timestamp: Utc::now().to_rfc3339(),
            });
        }

        let features = detect_features_from_state(&state);
        assert!(!features.is_empty());
        assert!(features[0].confidence > 0.5);
    }

    #[test]
    fn test_feature_truncation() {
        let mut state = create_state("test", "claude", false, vec![]);

        // Create signals for 10 different features
        let feature_keywords = vec![
            "authentication",
            "api",
            "payment",
            "notification",
            "search",
            "upload",
            "real-time",
            "chat",
            "admin",
            "analytics",
        ];

        for keyword in feature_keywords {
            for _ in 0..3 {
                state.decisions.push(Decision {
                    phase: "scope_goals".to_string(),
                    summary: format!("Need {}", keyword),
                    reasoning: format!("{} is critical", keyword),
                    timestamp: Utc::now().to_rfc3339(),
                });
            }
        }

        let features = detect_features_from_state(&state);
        // Should be truncated to top 5
        assert!(features.len() <= 5);
    }
}
