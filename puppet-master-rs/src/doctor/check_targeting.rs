//! Doctor check targeting helpers.
//!
//! Centralizes how platform selection maps to doctor check names so UI filtering
//! and bulk install behavior stay consistent.

use crate::types::Platform;

// DRY:FN:check_platform_from_name -- Map a doctor check name to its platform by prefix.
pub fn check_platform_from_name(check_name: &str) -> Option<Platform> {
    Platform::all().iter().copied().find(|platform| {
        let prefix = format!("{}-", platform);
        check_name.starts_with(&prefix)
    })
}

// DRY:FN:should_include_in_doctor_results -- Include selected platform checks + global checks.
pub fn should_include_in_doctor_results(check_name: &str, selected_platforms: &[Platform]) -> bool {
    if selected_platforms.is_empty() {
        return true;
    }

    match check_platform_from_name(check_name) {
        Some(platform) => selected_platforms.contains(&platform),
        None => true,
    }
}

// DRY:FN:should_include_in_bulk_install -- Include only selected platform checks when selected.
pub fn should_include_in_bulk_install(check_name: &str, selected_platforms: &[Platform]) -> bool {
    if selected_platforms.is_empty() {
        return true;
    }

    match check_platform_from_name(check_name) {
        Some(platform) => selected_platforms.contains(&platform),
        None => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn maps_check_prefix_to_platform() {
        assert_eq!(
            check_platform_from_name("cursor-cli"),
            Some(Platform::Cursor)
        );
        assert_eq!(check_platform_from_name("copilot-sdk"), Some(Platform::Copilot));
        assert_eq!(check_platform_from_name("github-cli"), None);
    }

    #[test]
    fn result_filter_includes_global_checks_with_selection() {
        let selected = vec![Platform::Codex];
        assert!(should_include_in_doctor_results("codex-cli", &selected));
        assert!(!should_include_in_doctor_results("cursor-cli", &selected));
        assert!(should_include_in_doctor_results("github-cli", &selected));
    }

    #[test]
    fn install_filter_only_includes_selected_platform_checks() {
        let selected = vec![Platform::Codex];
        assert!(should_include_in_bulk_install("codex-cli", &selected));
        assert!(!should_include_in_bulk_install("cursor-cli", &selected));
        assert!(!should_include_in_bulk_install("github-cli", &selected));
    }
}
