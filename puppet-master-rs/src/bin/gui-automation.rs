//! CLI entrypoint for GUI automation.

use anyhow::{Context, Result, bail};
use puppet_master::automation::{
    GuiRunMode, GuiRunResult, GuiRunSpec, GuiStep, list_actions, run_gui_automation,
};
use serde_json::json;
use std::collections::HashMap;
use std::env;
use std::path::PathBuf;

fn main() -> Result<()> {
    let args: Vec<String> = env::args().skip(1).collect();
    if args.is_empty() {
        print_usage();
        return Ok(());
    }

    match args[0].as_str() {
        "run" => cmd_run(&args[1..]),
        "run-step" => cmd_run_step(&args[1..]),
        "list-actions" => cmd_list_actions(),
        "doctor" => cmd_doctor(),
        "get-debug-feed" => cmd_get_debug_feed(&args[1..]),
        "get-artifact" => cmd_get_artifact(&args[1..]),
        "help" | "--help" | "-h" => {
            print_usage();
            Ok(())
        }
        other => {
            bail!("Unknown subcommand '{}'. Use 'help' for usage.", other);
        }
    }
}

fn cmd_run(args: &[String]) -> Result<()> {
    let flags = parse_flags(args)?;

    let mut spec = if let Some(path) = flags.get("--scenario") {
        load_spec_from_file(path)?
    } else {
        GuiRunSpec::default()
    };

    apply_common_overrides(&mut spec, &flags)?;

    let result = run_gui_automation(spec)?;
    emit_result(&result, flags.get("--result-path").map(PathBuf::from))
}

fn cmd_run_step(args: &[String]) -> Result<()> {
    let flags = parse_flags(args)?;

    let step_json = flags
        .get("--step-json")
        .context("Missing required --step-json for run-step")?;

    let step: GuiStep = serde_json::from_str(step_json)
        .with_context(|| "Failed to parse --step-json as GuiStep")?;

    let mut spec = GuiRunSpec::default();
    spec.scenario_name = "single-step".to_string();
    spec.steps = vec![step];

    apply_common_overrides(&mut spec, &flags)?;

    let result = run_gui_automation(spec)?;
    emit_result(&result, flags.get("--result-path").map(PathBuf::from))
}

fn cmd_list_actions() -> Result<()> {
    let actions = list_actions();
    println!("{}", serde_json::to_string_pretty(&actions)?);
    Ok(())
}

fn cmd_doctor() -> Result<()> {
    let tools = vec!["grim", "gnome-screenshot", "import", "cargo"];
    let mut availability = serde_json::Map::new();
    for tool in tools {
        availability.insert(
            tool.to_string(),
            serde_json::Value::Bool(which::which(tool).is_ok()),
        );
    }

    let report = json!({
        "ok": true,
        "tools": availability,
        "notes": [
            "Native screenshot fallback order: grim -> gnome-screenshot -> import",
            "Use run-step for single interactive action execution",
        ]
    });

    println!("{}", serde_json::to_string_pretty(&report)?);
    Ok(())
}

fn cmd_get_debug_feed(args: &[String]) -> Result<()> {
    let flags = parse_flags(args)?;
    let timeline = flags
        .get("--timeline")
        .context("Missing required --timeline")?;

    let content = std::fs::read_to_string(timeline)
        .with_context(|| format!("Failed to read timeline {}", timeline))?;
    println!("{}", content);
    Ok(())
}

fn cmd_get_artifact(args: &[String]) -> Result<()> {
    let flags = parse_flags(args)?;
    let manifest_path = flags
        .get("--manifest")
        .context("Missing required --manifest")?;
    let rel_path = flags.get("--path").context("Missing required --path")?;

    let manifest_content = std::fs::read_to_string(manifest_path)
        .with_context(|| format!("Failed to read manifest {}", manifest_path))?;
    let manifest: puppet_master::automation::ArtifactManifest =
        serde_json::from_str(&manifest_content)
            .with_context(|| format!("Failed to parse manifest {}", manifest_path))?;

    let full = manifest.root.join(rel_path);
    let bytes = std::fs::read(&full)
        .with_context(|| format!("Failed to read artifact {}", full.display()))?;

    if is_text_file(&full) {
        println!("{}", String::from_utf8_lossy(&bytes));
    } else {
        println!(
            "{}",
            serde_json::to_string_pretty(&json!({
                "path": full,
                "bytes": bytes.len(),
                "md5": format!("{:x}", md5::compute(&bytes)),
                "note": "binary artifact omitted from stdout",
            }))?
        );
    }

    Ok(())
}

fn load_spec_from_file(path: &str) -> Result<GuiRunSpec> {
    let content = std::fs::read_to_string(path)
        .with_context(|| format!("Failed to read scenario file {}", path))?;

    if path.ends_with(".yaml") || path.ends_with(".yml") {
        return serde_yaml::from_str(&content)
            .with_context(|| format!("Failed to parse YAML scenario {}", path));
    }

    match serde_json::from_str::<GuiRunSpec>(&content) {
        Ok(spec) => Ok(spec),
        Err(json_err) => serde_yaml::from_str::<GuiRunSpec>(&content).with_context(|| {
            format!(
                "Failed to parse scenario {} as JSON ({}) or YAML",
                path, json_err
            )
        }),
    }
}

fn parse_flags(args: &[String]) -> Result<HashMap<String, String>> {
    let mut map = HashMap::new();
    let mut i = 0;

    while i < args.len() {
        let key = &args[i];

        if !key.starts_with('-') {
            bail!("Unexpected argument '{}': flags must use --key value", key);
        }

        if i + 1 >= args.len() {
            bail!("Missing value for flag '{}'", key);
        }

        map.insert(key.clone(), args[i + 1].clone());
        i += 2;
    }

    Ok(map)
}

fn apply_common_overrides(spec: &mut GuiRunSpec, flags: &HashMap<String, String>) -> Result<()> {
    if let Some(mode) = flags.get("--mode") {
        spec.mode = parse_mode(mode)?;
    }

    if let Some(workspace) = flags.get("--workspace") {
        spec.workspace_root = PathBuf::from(workspace);
    }

    if let Some(artifacts) = flags.get("--artifacts") {
        spec.artifacts_root = PathBuf::from(artifacts);
    }

    if let Some(run_id) = flags.get("--run-id") {
        spec.run_id = run_id.clone();
    }

    Ok(())
}

fn parse_mode(raw: &str) -> Result<GuiRunMode> {
    match raw.to_lowercase().as_str() {
        "headless" => Ok(GuiRunMode::Headless),
        "native" => Ok(GuiRunMode::Native),
        "hybrid" => Ok(GuiRunMode::Hybrid),
        _ => bail!("Unknown mode '{}'. Expected headless|native|hybrid", raw),
    }
}

fn emit_result(result: &GuiRunResult, result_path: Option<PathBuf>) -> Result<()> {
    let json = serde_json::to_string_pretty(result)?;

    if let Some(path) = result_path {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).with_context(|| {
                format!("Failed to create result output parent {}", parent.display())
            })?;
        }

        std::fs::write(&path, &json)
            .with_context(|| format!("Failed to write result file {}", path.display()))?;
    }

    println!("{}", json);
    Ok(())
}

fn is_text_file(path: &std::path::Path) -> bool {
    match path
        .extension()
        .and_then(|v| v.to_str())
        .unwrap_or_default()
    {
        "txt" | "log" | "md" | "json" | "jsonl" | "yaml" | "yml" => true,
        _ => false,
    }
}

fn print_usage() {
    eprintln!(
        "gui-automation usage:\n\
         \n\
         gui-automation run [--scenario PATH] [--mode headless|native|hybrid] [--workspace PATH] [--artifacts PATH] [--run-id ID] [--result-path PATH]\n\
         gui-automation run-step --step-json JSON [--mode headless|native|hybrid] [--workspace PATH] [--artifacts PATH] [--run-id ID] [--result-path PATH]\n\
         gui-automation list-actions\n\
         gui-automation doctor\n\
         gui-automation get-debug-feed --timeline PATH\n\
         gui-automation get-artifact --manifest PATH --path RELATIVE_PATH\n"
    );
}
