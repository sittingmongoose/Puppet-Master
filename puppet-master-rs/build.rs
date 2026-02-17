use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};

fn main() {
    let manifest_dir = PathBuf::from(
        env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR must be set by Cargo"),
    );
    configure_rerun_triggers(&manifest_dir);

    let base_version = env::var("CARGO_PKG_VERSION").unwrap_or_else(|_| "0.0.0".to_string());
    let profile = env::var("PROFILE").unwrap_or_else(|_| "unknown".to_string());
    let target = env::var("TARGET").unwrap_or_else(|_| "unknown-target".to_string());
    let git_sha = git_rev_parse_short(&manifest_dir).unwrap_or_else(|| "nogit".to_string());
    let git_dirty = git_is_dirty(&manifest_dir).unwrap_or(false);
    let build_id = env::var("PM_BUILD_ID")
        .ok()
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(default_build_id);
    let build_utc = env::var("PM_BUILD_UTC")
        .ok()
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(default_build_utc);

    let mut metadata = vec![
        sanitize_identifier(&format!("b{build_id}")),
        sanitize_identifier(&format!("t{build_utc}")),
        sanitize_identifier(&format!("g{git_sha}")),
        sanitize_identifier(&profile),
        sanitize_identifier(&target),
    ];
    if git_dirty {
        metadata.push("dirty".to_string());
    }
    metadata.retain(|part| !part.is_empty());

    let semver_with_build = compose_semver_with_metadata(&base_version, &metadata);

    println!("cargo:rustc-env=RWM_BUILD_SEMVER={semver_with_build}");
    println!("cargo:rustc-env=RWM_BUILD_GIT_SHA={git_sha}");
    println!(
        "cargo:rustc-env=RWM_BUILD_GIT_DIRTY={}",
        if git_dirty { "true" } else { "false" }
    );
    println!("cargo:rustc-env=RWM_BUILD_PROFILE={profile}");
    println!("cargo:rustc-env=RWM_BUILD_TARGET={target}");
    println!(
        "cargo:rustc-env=RWM_BUILD_ID={}",
        sanitize_identifier(&build_id)
    );
    println!(
        "cargo:rustc-env=RWM_BUILD_UTC={}",
        sanitize_identifier(&build_utc)
    );

    // Windows: embed application icon into .exe (required; fail if missing so .exe never ships without icon)
    #[cfg(windows)]
    {
        let icon_path = manifest_dir.join("icons").join("icon.ico");
        if !icon_path.exists() {
            eprintln!(
                "cargo:warning=icons/icon.ico not found. Run ./scripts/generate-app-icons.sh from repo root (ensure icon.png exists in puppet-master-rs/icons/)."
            );
            std::process::exit(1);
        }
        println!("cargo:rerun-if-changed={}", icon_path.display());
        if let Err(e) = winres::WindowsResource::new()
            .set_icon(icon_path.to_str().expect("icon path is valid UTF-8"))
            .compile()
        {
            eprintln!("cargo:warning=Failed to embed Windows icon: {}. Run scripts/generate-app-icons.sh to create icons/icon.ico", e);
            std::process::exit(1);
        }
    }
}

fn compose_semver_with_metadata(base_version: &str, metadata_parts: &[String]) -> String {
    let (base_semver, existing_metadata) = match base_version.split_once('+') {
        Some((version_core, metadata)) => (version_core, Some(metadata)),
        None => (base_version, None),
    };

    let mut all_metadata = Vec::new();
    if let Some(existing) = existing_metadata {
        all_metadata.extend(
            existing
                .split('.')
                .map(sanitize_identifier)
                .filter(|part| !part.is_empty()),
        );
    }
    all_metadata.extend(
        metadata_parts
            .iter()
            .filter(|part| !part.is_empty())
            .cloned(),
    );

    if all_metadata.is_empty() {
        base_semver.to_string()
    } else {
        format!("{base_semver}+{}", all_metadata.join("."))
    }
}

fn sanitize_identifier(input: &str) -> String {
    let mut out = String::with_capacity(input.len());
    for ch in input.chars() {
        if ch.is_ascii_alphanumeric() || ch == '-' {
            out.push(ch);
        } else {
            out.push('-');
        }
    }
    out.trim_matches('-').to_string()
}

fn git_rev_parse_short(cwd: &Path) -> Option<String> {
    run_git(cwd, &["rev-parse", "--short=12", "HEAD"])
}

fn git_is_dirty(cwd: &Path) -> Option<bool> {
    let status = Command::new("git")
        .args(["diff", "--quiet", "--ignore-submodules", "HEAD", "--"])
        .current_dir(cwd)
        .status()
        .ok()?;
    Some(!status.success())
}

fn run_git(cwd: &Path, args: &[&str]) -> Option<String> {
    let output = Command::new("git")
        .args(args)
        .current_dir(cwd)
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }

    let value = String::from_utf8(output.stdout).ok()?;
    let trimmed = value.trim();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed.to_string())
    }
}

fn configure_rerun_triggers(manifest_dir: &Path) {
    println!("cargo:rerun-if-env-changed=PROFILE");
    println!("cargo:rerun-if-env-changed=TARGET");
    println!("cargo:rerun-if-env-changed=PM_BUILD_ID");
    println!("cargo:rerun-if-env-changed=PM_BUILD_UTC");
    println!("cargo:rerun-if-env-changed=SOURCE_DATE_EPOCH");

    let dot_git = manifest_dir.join(".git");
    if dot_git.is_dir() {
        watch_git_state_files(&dot_git);
        return;
    }

    if dot_git.is_file() {
        println!("cargo:rerun-if-changed={}", dot_git.display());
        if let Some(git_dir) = resolve_git_dir_from_file(&dot_git, manifest_dir) {
            watch_git_state_files(&git_dir);
        }
    }
}

fn default_build_id() -> String {
    env::var("SOURCE_DATE_EPOCH")
        .ok()
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| {
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map(|duration| duration.as_secs().to_string())
                .unwrap_or_else(|_| "0".to_string())
        })
}

fn default_build_utc() -> String {
    // Keep UTC metadata deterministic when SOURCE_DATE_EPOCH is provided.
    default_build_id()
}

fn resolve_git_dir_from_file(git_file: &Path, manifest_dir: &Path) -> Option<PathBuf> {
    let contents = fs::read_to_string(git_file).ok()?;
    let gitdir = contents.trim().strip_prefix("gitdir:")?.trim();
    let path = PathBuf::from(gitdir);
    if path.is_absolute() {
        Some(path)
    } else {
        Some(manifest_dir.join(path))
    }
}

fn watch_git_state_files(git_dir: &Path) {
    let head_path = git_dir.join("HEAD");
    let index_path = git_dir.join("index");
    println!("cargo:rerun-if-changed={}", head_path.display());
    println!("cargo:rerun-if-changed={}", index_path.display());

    if let Ok(head) = fs::read_to_string(&head_path) {
        if let Some(reference) = head.strip_prefix("ref:").map(str::trim) {
            let reference_path = git_dir.join(reference);
            println!("cargo:rerun-if-changed={}", reference_path.display());
        }
    }
}
