//! Best-effort existing-project scanner.
//!
//! Produces a small, high-signal summary of the repo (languages, build files,
//! dependencies) to seed the interactive interview context for existing projects.

use anyhow::Result;
use std::path::Path;

pub fn scan_project(root: &Path) -> Result<String> {
    let mut lines: Vec<String> = Vec::new();

    lines.push("## Existing Project Scan".to_string());
    lines.push(format!("Root: `{}`", root.display()));

    let cargo_toml = root.join("Cargo.toml");
    if cargo_toml.exists() {
        let content = std::fs::read_to_string(&cargo_toml)?;
        let name = content
            .lines()
            .find_map(|l| l.trim().strip_prefix("name = "))
            .map(|s| s.trim().trim_matches('"').to_string());
        let edition = content
            .lines()
            .find_map(|l| l.trim().strip_prefix("edition = "))
            .map(|s| s.trim().trim_matches('"').to_string());

        let mut cargo_line = "Detected Rust (Cargo.toml".to_string();
        if let Some(name) = name {
            cargo_line.push_str(&format!(", package={name}"));
        }
        if let Some(edition) = edition {
            cargo_line.push_str(&format!(", edition={edition}"));
        }
        cargo_line.push(')');
        lines.push(format!("- {cargo_line}"));
    }

    let package_json = root.join("package.json");
    if package_json.exists() {
        let raw = std::fs::read_to_string(&package_json)?;
        let parsed: serde_json::Value = serde_json::from_str(&raw).unwrap_or_default();
        let name = parsed
            .get("name")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string());

        let mut node_line = "Detected Node/JS (package.json".to_string();
        if let Some(name) = name {
            node_line.push_str(&format!(", name={name}"));
        }
        node_line.push(')');
        lines.push(format!("- {node_line}"));

        let dep_count = parsed
            .get("dependencies")
            .and_then(|v| v.as_object())
            .map(|o| o.len())
            .unwrap_or(0);
        let dev_dep_count = parsed
            .get("devDependencies")
            .and_then(|v| v.as_object())
            .map(|o| o.len())
            .unwrap_or(0);
        if dep_count > 0 || dev_dep_count > 0 {
            lines.push(format!(
                "- package.json deps: dependencies={dep_count}, devDependencies={dev_dep_count}"
            ));
        }
    }

    if root.join("playwright.config.ts").exists()
        || root.join("playwright.config.js").exists()
        || root.join("playwright.config.mjs").exists()
    {
        lines.push("- Detected Playwright configuration".to_string());
    }

    if root.join("vitest.config.ts").exists() || root.join("vitest.config.js").exists() {
        lines.push("- Detected Vitest configuration".to_string());
    }

    if root.join("tauri.conf.json").exists() || root.join("src-tauri").exists() {
        lines.push("- Detected Tauri artifacts".to_string());
    }

    Ok(lines.join("\n"))
}
