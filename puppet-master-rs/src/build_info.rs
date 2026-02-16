//! Build identity helpers.
//!
//! Provides a single access point for SemVer + build metadata emitted by `build.rs`.

// DRY:DATA:build_info
const APP_DISPLAY_NAME: &str = "RWM Puppet Master";
const DEFAULT_GIT_SHA: &str = "nogit";
const DEFAULT_PROFILE: &str = "unknown";
const DEFAULT_TARGET: &str = "unknown-target";
const DEFAULT_BUILD_ID: &str = "unknown";
const DEFAULT_BUILD_UTC: &str = "unknown";

// DRY:FN:semver_with_build_metadata
pub fn semver_with_build_metadata() -> &'static str {
    option_env!("RWM_BUILD_SEMVER").unwrap_or(env!("CARGO_PKG_VERSION"))
}

// DRY:FN:build_profile
pub fn build_profile() -> &'static str {
    option_env!("RWM_BUILD_PROFILE").unwrap_or(DEFAULT_PROFILE)
}

// DRY:FN:build_target
pub fn build_target() -> &'static str {
    option_env!("RWM_BUILD_TARGET").unwrap_or(DEFAULT_TARGET)
}

// DRY:FN:git_sha
pub fn git_sha() -> &'static str {
    option_env!("RWM_BUILD_GIT_SHA").unwrap_or(DEFAULT_GIT_SHA)
}

// DRY:FN:build_id
pub fn build_id() -> &'static str {
    option_env!("RWM_BUILD_ID").unwrap_or(DEFAULT_BUILD_ID)
}

// DRY:FN:build_utc
pub fn build_utc() -> &'static str {
    option_env!("RWM_BUILD_UTC").unwrap_or(DEFAULT_BUILD_UTC)
}

// DRY:FN:git_dirty
pub fn git_dirty() -> bool {
    matches!(option_env!("RWM_BUILD_GIT_DIRTY"), Some("true"))
}

// DRY:FN:git_sha_short
pub fn git_sha_short() -> &'static str {
    short_sha(git_sha())
}

// DRY:FN:build_details
pub fn build_details() -> String {
    format_build_details(
        git_sha_short(),
        git_dirty(),
        build_profile(),
        build_target(),
        build_id(),
        build_utc(),
    )
}

// DRY:FN:full_build_identity
pub fn full_build_identity() -> String {
    format_build_identity(
        APP_DISPLAY_NAME,
        semver_with_build_metadata(),
        &build_details(),
    )
}

// DRY:FN:cli_version_output
pub fn cli_version_output() -> String {
    full_build_identity()
}

fn short_sha(sha: &str) -> &str {
    if sha.len() > 12 { &sha[..12] } else { sha }
}

fn format_build_identity(app_name: &str, semver: &str, details: &str) -> String {
    format!("{app_name} {semver} ({details})")
}

fn format_build_details(
    git_sha: &str,
    git_dirty: bool,
    profile: &str,
    target: &str,
    build_id: &str,
    build_utc: &str,
) -> String {
    let dirty_suffix = if git_dirty { " dirty" } else { "" };
    format!(
        "build {build_id} @ {build_utc} | commit {git_sha}{dirty_suffix} | {profile} | {target}"
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn format_build_details_clean() {
        let details = format_build_details(
            "abc123def456",
            false,
            "release",
            "x86_64-unknown-linux-gnu",
            "1700000000",
            "1700000000",
        );
        assert_eq!(
            details,
            "build 1700000000 @ 1700000000 | commit abc123def456 | release | x86_64-unknown-linux-gnu"
        );
    }

    #[test]
    fn format_build_details_dirty() {
        let details = format_build_details(
            "abc123def456",
            true,
            "debug",
            "aarch64-apple-darwin",
            "1700000001",
            "1700000001",
        );
        assert_eq!(
            details,
            "build 1700000001 @ 1700000001 | commit abc123def456 dirty | debug | aarch64-apple-darwin"
        );
    }

    #[test]
    fn format_build_identity_includes_semver_and_details() {
        let identity = format_build_identity(
            "RWM Puppet Master",
            "0.1.1+gabc123.debug.x86_64-unknown-linux-gnu",
            "build 1700000000 @ 1700000000 | commit abc123def456 | debug | x86_64-unknown-linux-gnu",
        );
        assert_eq!(
            identity,
            "RWM Puppet Master 0.1.1+gabc123.debug.x86_64-unknown-linux-gnu (build 1700000000 @ 1700000000 | commit abc123def456 | debug | x86_64-unknown-linux-gnu)"
        );
    }

    #[test]
    fn short_sha_truncates_to_12_chars() {
        assert_eq!(short_sha("1234567890abcdef"), "1234567890ab");
        assert_eq!(short_sha("abc123"), "abc123");
    }

    #[test]
    fn embedded_semver_with_build_metadata_is_valid() {
        let parsed = semver::Version::parse(semver_with_build_metadata());
        assert!(parsed.is_ok());
    }
}
