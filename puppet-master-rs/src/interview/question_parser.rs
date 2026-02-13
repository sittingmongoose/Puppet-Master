//! Parse structured questions and phase-completion markers from AI responses.
//!
//! Adapted from LISA's orchestrator marker system, using
//! `<<<PM_QUESTION>>>` / `<<<PM_PHASE_COMPLETE>>>` delimiters.

use log::debug;
use serde::{Deserialize, Serialize};

/// Marker strings used to detect structured output from the AI.
pub struct StructuredMarkers;

/// Constant marker strings for structured AI output.
pub const STRUCTURED_MARKERS: StructuredMarkersData = StructuredMarkersData {
    question_start: "<<<PM_QUESTION>>>",
    question_end: "<<<END_PM_QUESTION>>>",
    phase_complete_start: "<<<PM_PHASE_COMPLETE>>>",
    phase_complete_end: "<<<END_PM_PHASE_COMPLETE>>>",
};

/// Data holder for structured marker strings.
pub struct StructuredMarkersData {
    pub question_start: &'static str,
    pub question_end: &'static str,
    pub phase_complete_start: &'static str,
    pub phase_complete_end: &'static str,
}

/// A structured multiple-choice question extracted from an AI response.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StructuredQuestion {
    /// Short header/label for the question.
    pub header: String,
    /// The full question text.
    pub question: String,
    /// Available options for the user to choose from.
    pub options: Vec<QuestionOption>,
    /// Whether multiple options can be selected.
    pub multi_select: bool,
}

/// A single option within a structured question.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuestionOption {
    /// Display label for the option.
    pub label: String,
    /// Description/explanation of the option.
    pub description: String,
}

/// Data extracted when the AI signals that a phase is complete.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PhaseCompletion {
    /// The phase identifier that was completed.
    pub phase: String,
    /// Summary of what was covered.
    pub summary: String,
    /// Key decisions made during this phase.
    pub decisions: Vec<String>,
    /// Items that remain open or need follow-up.
    pub open_items: Vec<String>,
}

/// The result of parsing an AI response for structured data.
#[derive(Debug, Clone)]
pub struct ParsedAIResponse {
    /// The response text with structured blocks removed.
    pub text: String,
    /// A structured question, if one was detected.
    pub question: Option<StructuredQuestion>,
    /// Whether the AI signaled phase completion.
    pub is_phase_complete: bool,
    /// Phase completion data, if the phase is complete.
    pub phase_completion: Option<PhaseCompletion>,
}

/// Parses an AI response string for structured question and phase-completion markers.
pub fn parse_ai_response(response_text: &str) -> ParsedAIResponse {
    let mut text = response_text.to_string();
    let mut question = None;
    let mut is_phase_complete = false;
    let mut phase_completion = None;

    // Extract structured question if present.
    if let Some(q) = extract_question(&text) {
        // Remove the question block from the display text.
        if let Some(block) = extract_block(
            &text,
            STRUCTURED_MARKERS.question_start,
            STRUCTURED_MARKERS.question_end,
        ) {
            text = text.replace(&block, "").trim().to_string();
        }
        question = Some(q);
    }

    // Extract phase completion if present.
    if let Some(pc) = extract_phase_completion(&text) {
        if let Some(block) = extract_block(
            &text,
            STRUCTURED_MARKERS.phase_complete_start,
            STRUCTURED_MARKERS.phase_complete_end,
        ) {
            text = text.replace(&block, "").trim().to_string();
        }
        is_phase_complete = true;
        phase_completion = Some(pc);
    }

    ParsedAIResponse {
        text,
        question,
        is_phase_complete,
        phase_completion,
    }
}

/// Extracts the full block (including markers) between `start` and `end`.
fn extract_block(text: &str, start: &str, end: &str) -> Option<String> {
    let start_idx = text.find(start)?;
    let end_idx = text.find(end)?;
    if end_idx <= start_idx {
        return None;
    }
    Some(text[start_idx..end_idx + end.len()].to_string())
}

/// Extracts and deserialises a `StructuredQuestion` from the response text.
fn extract_question(text: &str) -> Option<StructuredQuestion> {
    let json_str = extract_json_between(
        text,
        STRUCTURED_MARKERS.question_start,
        STRUCTURED_MARKERS.question_end,
    )?;

    match serde_json::from_str::<StructuredQuestion>(&json_str) {
        Ok(q) => {
            debug!("Parsed structured question: header={}", q.header);
            Some(q)
        }
        Err(e) => {
            debug!("Failed to parse structured question JSON: {e}");
            None
        }
    }
}

/// Extracts and deserialises a `PhaseCompletion` from the response text.
fn extract_phase_completion(text: &str) -> Option<PhaseCompletion> {
    let json_str = extract_json_between(
        text,
        STRUCTURED_MARKERS.phase_complete_start,
        STRUCTURED_MARKERS.phase_complete_end,
    )?;

    match serde_json::from_str::<PhaseCompletion>(&json_str) {
        Ok(pc) => {
            debug!("Parsed phase completion: phase={}", pc.phase);
            Some(pc)
        }
        Err(e) => {
            debug!("Failed to parse phase completion JSON: {e}");
            None
        }
    }
}

/// Extracts the JSON content between two marker strings.
fn extract_json_between(text: &str, start_marker: &str, end_marker: &str) -> Option<String> {
    let start_idx = text.find(start_marker)?;
    let after_start = start_idx + start_marker.len();
    let end_idx = text[after_start..].find(end_marker)?;
    let json_str = text[after_start..after_start + end_idx].trim();
    if json_str.is_empty() {
        return None;
    }
    Some(json_str.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_plain_text() {
        let parsed = parse_ai_response("Hello, let me ask you about your project.");
        assert_eq!(parsed.text, "Hello, let me ask you about your project.");
        assert!(parsed.question.is_none());
        assert!(!parsed.is_phase_complete);
    }

    #[test]
    fn test_parse_structured_question() {
        let response = r#"Great, let me ask:
<<<PM_QUESTION>>>
{
  "header": "Tech Stack",
  "question": "Which framework should we use?",
  "options": [
    {"label": "React", "description": "Popular SPA framework"},
    {"label": "Vue", "description": "Progressive framework"}
  ],
  "multiSelect": false
}
<<<END_PM_QUESTION>>>
Let me know your choice."#;

        let parsed = parse_ai_response(response);
        assert!(parsed.question.is_some());
        let q = parsed.question.unwrap();
        assert_eq!(q.header, "Tech Stack");
        assert_eq!(q.options.len(), 2);
        assert!(!q.multi_select);
        assert!(!parsed.text.contains("PM_QUESTION"));
        assert!(parsed.text.contains("Great, let me ask:"));
    }

    #[test]
    fn test_parse_phase_completion() {
        let response = r#"We've covered everything.
<<<PM_PHASE_COMPLETE>>>
{
  "phase": "scope_goals",
  "summary": "Defined project scope",
  "decisions": ["Target MVP first", "Web only"],
  "openItems": ["Budget TBD"]
}
<<<END_PM_PHASE_COMPLETE>>>"#;

        let parsed = parse_ai_response(response);
        assert!(parsed.is_phase_complete);
        let pc = parsed.phase_completion.unwrap();
        assert_eq!(pc.phase, "scope_goals");
        assert_eq!(pc.decisions.len(), 2);
        assert_eq!(pc.open_items.len(), 1);
    }

    #[test]
    fn test_parse_invalid_json_in_markers() {
        let response = "<<<PM_QUESTION>>>\n{invalid json}\n<<<END_PM_QUESTION>>>";
        let parsed = parse_ai_response(response);
        assert!(parsed.question.is_none());
    }

    #[test]
    fn test_parse_multi_select() {
        let response = r#"<<<PM_QUESTION>>>
{
  "header": "Platforms",
  "question": "Which platforms?",
  "options": [
    {"label": "Linux", "description": "Linux desktop"},
    {"label": "macOS", "description": "Apple desktop"},
    {"label": "Windows", "description": "Microsoft desktop"}
  ],
  "multiSelect": true
}
<<<END_PM_QUESTION>>>"#;

        let parsed = parse_ai_response(response);
        let q = parsed.question.unwrap();
        assert!(q.multi_select);
        assert_eq!(q.options.len(), 3);
    }
}
