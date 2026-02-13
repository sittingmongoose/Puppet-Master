//! Central tooltip text store
//!
//! Provides tooltip text for all fields in the application with both
//! Expert and ELI5 (Explain Like I'm 5) variants.

use std::collections::HashMap;

/// Tooltip variant - Expert (concise, technical) or ELI5 (friendly, detailed)
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TooltipVariant {
    Expert,
    Eli5,
}

/// Tooltip text entry with both Expert and ELI5 variants
#[derive(Debug, Clone)]
pub struct TooltipEntry {
    pub expert: &'static str,
    pub eli5: &'static str,
}

impl TooltipEntry {
    pub const fn new(expert: &'static str, eli5: &'static str) -> Self {
        Self { expert, eli5 }
    }

    pub fn get(&self, variant: TooltipVariant) -> &'static str {
        match variant {
            TooltipVariant::Expert => self.expert,
            TooltipVariant::Eli5 => self.eli5,
        }
    }
}

/// Get tooltip text for a given key and variant
pub fn get_tooltip(key: &str, variant: TooltipVariant) -> Option<&'static str> {
    TOOLTIPS.get(key).map(|entry| entry.get(variant))
}

// Lazy static map of all tooltips
use once_cell::sync::Lazy;

static TOOLTIPS: Lazy<HashMap<&'static str, TooltipEntry>> = Lazy::new(|| {
    let mut map = HashMap::new();

    // ═══════════════════════════════════════════════════════════════
    // Interview Tab Tooltips
    // ═══════════════════════════════════════════════════════════════

    map.insert(
            "interview.primary_platform",
            TooltipEntry::new(
                "AI service provider for interview conductor",
                "The AI service that will conduct your interview. Different platforms have different strengths. Claude is great for detailed analysis, Cursor is fast for code-related questions."
            )
        );

    map.insert(
            "interview.primary_model",
            TooltipEntry::new(
                "Model identifier (e.g., claude-sonnet-4-5-20250929)",
                "The specific AI model to use. For Claude, try 'claude-sonnet-4-5-20250929' for a good balance of speed and quality, or 'claude-opus-4-6' for maximum thoroughness."
            )
        );

    map.insert(
            "interview.reasoning_level",
            TooltipEntry::new(
                "Inference depth: low (fast) to max (thorough)",
                "How hard the AI thinks about each question. 'Low' is fast but may miss nuance. 'High' takes longer but catches more edge cases. 'Max' is the most thorough but slowest and uses the most quota."
            )
        );

    map.insert(
            "interview.backup_platforms",
            TooltipEntry::new(
                "Fallback providers for quota exhaustion",
                "If your primary AI runs out of quota (usage limit), the system automatically switches to these backup platforms in order. Add at least one backup to avoid interruptions."
            )
        );

    map.insert(
            "interview.max_questions_per_phase",
            TooltipEntry::new(
                "Question count per domain (3-15, default 8)",
                "How many questions the AI asks in each interview domain (like 'Security' or 'Architecture'). More questions = more thorough but longer interview. 8 is a good balance."
            )
        );

    map.insert(
            "interview.first_principles",
            TooltipEntry::new(
                "Challenge assumptions before acceptance",
                "When enabled, the AI challenges your assumptions before accepting them. Instead of just asking 'which database?', it first asks 'do you actually need a database? what problem are you solving?' Recommended for new projects where requirements aren't fully baked."
            )
        );

    map.insert(
            "interview.architecture_confirmation",
            TooltipEntry::new(
                "Verify version compatibility and dependencies",
                "When enabled, the AI double-checks every technology version and dependency for compatibility. Catches gotchas like 'React 19 doesn't work with that CSS library version.' Strongly recommended - these small mismatches cause BIG problems later."
            )
        );

    map.insert(
            "interview.playwright_requirements",
            TooltipEntry::new(
                "Generate E2E test specifications",
                "When enabled, the interview generates ready-to-implement Playwright end-to-end test specifications. Playwright is a tool that simulates a real user clicking through your app to verify everything works. Essential for the autonomous build process."
            )
        );

    map.insert(
            "interview.generate_agents_md",
            TooltipEntry::new(
                "Create starter guide for AI agents",
                "Creates a starter guide document for the AI agents based on your interview answers. This helps agents know your preferences, tech stack, and conventions from the very first task."
            )
        );

    map.insert(
            "interview.interaction_mode",
            TooltipEntry::new(
                "Expert (concise) vs ELI5 (explained) mode",
                "Expert mode: concise questions, assumes you know technical terms. ELI5 (Explain Like I'm 5) mode: every question comes with a plain-English explanation of what it means and why it matters."
            )
        );

    map.insert(
            "interview.output_dir",
            TooltipEntry::new(
                "Interview results output directory",
                "Directory where interview results and generated artifacts will be saved. Defaults to .puppet-master/interview in your project."
            )
        );

    // ═══════════════════════════════════════════════════════════════
    // Future: Add tooltips for other tabs as needed
    // ═══════════════════════════════════════════════════════════════
    // map.insert("tiers.tier1_provider", TooltipEntry::new(...));
    // map.insert("branching.base_branch", TooltipEntry::new(...));
    // etc.

    map
});
