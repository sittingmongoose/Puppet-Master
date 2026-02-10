// Prevents additional console window on Windows in release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use std::net::{TcpListener, TcpStream};
use std::path::{Path, PathBuf};
use std::io::{Read, Write};
use std::process::Command;
use std::process::Stdio;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;
use serde::Deserialize;
use tauri::{
    image::Image,
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
    WindowEvent,
};
use tauri_plugin_log::{Target, TargetKind};
use url::Url;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

static IS_QUITTING: AtomicBool = AtomicBool::new(false);

fn enrich_path_env(extra_paths: &[PathBuf]) {
    let current = env::var_os("PATH").unwrap_or_default();
    let mut parts: Vec<PathBuf> = Vec::new();
    for p in extra_paths {
        if !p.as_os_str().is_empty() {
            parts.push(p.clone());
        }
    }

    // Append current PATH entries (preserve order).
    for p in env::split_paths(&current) {
        parts.push(p);
    }

    // De-duplicate while preserving first occurrence.
    let mut seen: std::collections::HashSet<std::ffi::OsString> = std::collections::HashSet::new();
    let mut uniq: Vec<PathBuf> = Vec::new();
    for p in parts {
        let key = p.as_os_str().to_os_string();
        if seen.insert(key) {
            uniq.push(p);
        }
    }

    if let Ok(joined) = env::join_paths(uniq) {
        env::set_var("PATH", joined);
    }
}

fn set_desktop_env_hints() {
    // Linux: fixes first-paint blank screens on some WMs/Wayland setups.
    #[cfg(target_os = "linux")]
    {
        env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
    }
}

fn common_extra_paths(home: Option<&Path>) -> Vec<PathBuf> {
    let mut extra: Vec<PathBuf> = Vec::new();

    if let Some(h) = home {
        #[cfg(not(target_os = "windows"))]
        {
            extra.push(h.join(".local").join("bin"));
            extra.push(h.join(".npm-global").join("bin"));
            extra.push(h.join("bin"));
            extra.push(h.join(".volta").join("bin"));
            extra.push(h.join(".asdf").join("shims"));
        }

        #[cfg(target_os = "windows")]
        {
            extra.push(h.join(".npm-global"));
            extra.push(h.join("scoop").join("shims"));
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        extra.push(PathBuf::from("/usr/local/bin"));
        extra.push(PathBuf::from("/opt/homebrew/bin"));
        extra.push(PathBuf::from("/opt/homebrew/sbin"));
        extra.push(PathBuf::from("/snap/bin"));
    }
    extra
}

fn is_loopback_url(url: &Url) -> bool {
    match url.host_str() {
        Some("127.0.0.1") | Some("localhost") | Some("::1") | Some("0.0.0.0") => true,
        _ => false,
    }
}

const PORT_CANDIDATES: [u16; 11] = [3847, 3848, 3849, 3850, 3851, 3852, 3853, 3854, 3855, 3856, 3857];

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct HealthResponse {
    #[serde(default)]
    app_id: Option<String>,
    #[serde(default)]
    status: Option<String>,
    #[serde(default)]
    started_at: Option<String>,
    #[serde(default)]
    port: Option<u16>,
    #[serde(default)]
    instance_id: Option<String>,
    #[serde(default)]
    version: Option<String>,
}

fn parse_http_json_response(raw: &str) -> Option<(u16, String)> {
    // Returns (status_code, body)
    let mut lines = raw.split("\r\n");
    let status_line = lines.next()?;
    let code = status_line
        .split_whitespace()
        .nth(1)
        .and_then(|s| s.parse::<u16>().ok())?;

    // Find header/body separator
    let sep = raw.find("\r\n\r\n")?;
    let body = raw.get(sep + 4..)?.to_string();
    Some((code, body))
}

fn probe_health(port: u16) -> Option<HealthResponse> {
    let addr = format!("127.0.0.1:{}", port).parse::<std::net::SocketAddr>().ok()?;
    let mut stream = TcpStream::connect_timeout(&addr, Duration::from_millis(350)).ok()?;
    let _ = stream.set_read_timeout(Some(Duration::from_millis(600)));
    let _ = stream.set_write_timeout(Some(Duration::from_millis(600)));

    let req = format!(
        "GET /health HTTP/1.1\r\nHost: 127.0.0.1:{}\r\nConnection: close\r\n\r\n",
        port
    );
    stream.write_all(req.as_bytes()).ok()?;

    let mut buf: Vec<u8> = Vec::new();
    let mut chunk = [0u8; 1024];
    while let Ok(n) = stream.read(&mut chunk) {
        if n == 0 {
            break;
        }
        buf.extend_from_slice(&chunk[..n]);
        if buf.len() > 64 * 1024 {
            // Cap response size; /health should be tiny.
            break;
        }
    }

    let raw = String::from_utf8_lossy(&buf).to_string();
    let (code, body) = parse_http_json_response(&raw)?;
    if code != 200 {
        return None;
    }
    serde_json::from_str::<HealthResponse>(&body).ok()
}

fn select_existing_server_port() -> Option<u16> {
    let mut best: Option<(String, u16)> = None;
    for port in PORT_CANDIDATES {
        if let Some(health) = probe_health(port) {
            let is_ours =
                health.app_id.as_deref() == Some("rwm-puppet-master") &&
                health.status.as_deref() == Some("ok");
            if !is_ours {
                continue;
            }
            let started = health.started_at.clone().unwrap_or_default();
            let reported_port = health.port.unwrap_or(port);
            match &best {
                None => best = Some((started, reported_port)),
                Some((best_started, _best_port)) => {
                    if started > *best_started {
                        best = Some((started, reported_port));
                    }
                }
            }
        }
    }
    best.map(|(_started, port)| port)
}

fn select_free_port() -> Option<u16> {
    for port in PORT_CANDIDATES {
        if TcpListener::bind(("127.0.0.1", port)).is_ok() {
            return Some(port);
        }
    }
    None
}

fn derive_install_root_from_exe(current_exe: &Path) -> Option<PathBuf> {
    // Windows installer layout: <InstallRoot>\app\puppet-master-gui.exe
    // Linux installer layout:   <InstallRoot>/bin/puppet-master-gui
    // For both: derive InstallRoot from parent dir name "app" or "bin".
    let dir = current_exe.parent()?;
    let name = dir.file_name()?.to_string_lossy().to_lowercase();
    if name == "app" || name == "bin" {
        return dir.parent().map(|p| p.to_path_buf());
    }
    None
}

fn resolve_puppet_master_cli_fallback(resource_dir: Option<PathBuf>, current_exe: Option<PathBuf>) -> Option<PathBuf> {
    // macOS installer layout: <App>.app/Contents/Resources/puppet-master/bin/puppet-master
    if let Some(res) = resource_dir {
        let candidate = res.join("puppet-master").join("bin").join("puppet-master");
        if candidate.is_file() {
            return Some(candidate);
        }
    }

    // Linux installer layout: sibling to GUI binary (e.g. /opt/puppet-master/bin/puppet-master-gui + /opt/puppet-master/bin/puppet-master)
    if let Some(exe) = current_exe {
        if let Some(dir) = exe.parent() {
            let candidate = dir.join("puppet-master");
            if candidate.is_file() && candidate != exe {
                return Some(candidate);
            }
            let candidate_exe = dir.join("puppet-master.exe");
            if candidate_exe.is_file() && candidate_exe != exe {
                return Some(candidate_exe);
            }
            // Windows: the installed CLI entrypoint is typically a .cmd shim in <InstallRoot>\bin\puppet-master.cmd,
            // and std::process::Command does not resolve PATHEXT like cmd.exe does.
            let candidate_cmd = dir.join("puppet-master.cmd");
            if candidate_cmd.is_file() {
                return Some(candidate_cmd);
            }

            // Windows installer layout: GUI lives in <InstallRoot>\app, CLI shims live in <InstallRoot>\bin.
            if let Some(root) = derive_install_root_from_exe(&exe) {
                let bin = root.join("bin");
                let cmd = bin.join("puppet-master.cmd");
                if cmd.is_file() {
                    return Some(cmd);
                }
                let exe_bin = bin.join("puppet-master.exe");
                if exe_bin.is_file() {
                    return Some(exe_bin);
                }
                let unix = bin.join("puppet-master");
                if unix.is_file() {
                    return Some(unix);
                }
            }
        }
    }

    None
}

fn resolve_embedded_node_and_entry(resource_dir: Option<PathBuf>, current_exe: Option<PathBuf>) -> Option<(PathBuf, PathBuf, PathBuf, PathBuf)> {
    // Returns (install_root, node_exe, node_bin_dir, app_entry)
    // Windows/Linux installers: <InstallRoot>\app\puppet-master-gui.exe or <InstallRoot>/bin/puppet-master-gui
    // macOS bundle: <App>.app/Contents/Resources/puppet-master/...
    if let Some(exe) = current_exe.as_deref() {
        if let Some(root) = derive_install_root_from_exe(exe) {
            #[cfg(target_os = "windows")]
            {
                let node_exe = root.join("node").join("node.exe");
                let node_bin = root.join("node");
                let app_entry = root.join("app").join("dist").join("cli").join("index.js");
                if node_exe.is_file() && app_entry.is_file() {
                    return Some((root, node_exe, node_bin, app_entry));
                }
            }
            #[cfg(not(target_os = "windows"))]
            {
                let node_exe = root.join("node").join("bin").join("node");
                let node_bin = root.join("node").join("bin");
                let app_entry = root.join("app").join("dist").join("cli").join("index.js");
                if node_exe.is_file() && app_entry.is_file() {
                    return Some((root, node_exe, node_bin, app_entry));
                }
            }
        }
    }

    // macOS app bundle resources
    if let Some(res) = resource_dir {
        let root = res.join("puppet-master");
        let node_exe = root.join("node").join("bin").join("node");
        let node_bin = root.join("node").join("bin");
        let app_entry = root.join("app").join("dist").join("cli").join("index.js");
        if node_exe.is_file() && app_entry.is_file() {
            return Some((root, node_exe, node_bin, app_entry));
        }
    }

    None
}

fn try_spawn_gui_server(port: u16, resource_dir: Option<PathBuf>) -> bool {
    let port = port.to_string();
    let host = "127.0.0.1";
    let home_dir = env::var_os("HOME")
        .or_else(|| env::var_os("USERPROFILE"))
        .map(PathBuf::from);
    let current_exe = env::current_exe().ok();
    let install_root = current_exe
        .as_deref()
        .and_then(derive_install_root_from_exe);

    // Prefer spawning the embedded Node runtime directly, so we do not open terminal windows on Windows
    // and we are not dependent on PATH/PATHEXT resolution during first launch.
    if let Some((root, node_exe, node_bin_dir, app_entry)) =
        resolve_embedded_node_and_entry(resource_dir.clone(), current_exe.clone())
    {
        let mut cmd = Command::new(node_exe);
        cmd.arg(app_entry)
            .arg("gui")
            .arg("--no-open")
            .arg("--port")
            .arg(&port)
            .arg("--host")
            .arg(host)
            .arg("--strict-port")
            .env("PUPPET_MASTER_NO_OPEN", "1")
            .env("NO_OPEN_BROWSER", "1")
            .env("PUPPET_MASTER_INSTALL_ROOT", &root)
            .env("PUPPET_MASTER_APP_ROOT", &root)
            .env("PLAYWRIGHT_BROWSERS_PATH", root.join("playwright-browsers"))
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null());

        // Ensure /usr/bin/env node wrappers (e.g. GitHub Copilot installed via npm) can find Node.
        // When the app is launched from a desktop shortcut, PATH can be minimal.
        let mut path_parts: Vec<PathBuf> = vec![node_bin_dir.clone()];
        if let Some(cur) = env::var_os("PATH") {
            path_parts.extend(env::split_paths(&cur));
        }
        if let Ok(joined) = env::join_paths(path_parts) {
            cmd.env("PATH", joined);
        }

        if let Some(h) = &home_dir {
            cmd.current_dir(h);
            // Ensure backend sees user home for auth detection (~/.config/cursor/auth.json etc.)
            cmd.env("HOME", h);
            #[cfg(target_os = "windows")]
            {
                cmd.env("USERPROFILE", h);
                // Backend needs LOCALAPPDATA/APPDATA for Cursor/Codex logout path resolution
                if let Some(l) = env::var_os("LOCALAPPDATA") {
                    cmd.env("LOCALAPPDATA", l);
                }
                if let Some(a) = env::var_os("APPDATA") {
                    cmd.env("APPDATA", a);
                }
            }
        }

        #[cfg(target_os = "windows")]
        {
            // CREATE_NO_WINDOW
            cmd.creation_flags(0x08000000);
        }

        if cmd.spawn().is_ok() {
            return true;
        }
    }

    // Prefer PATH resolution (e.g. /usr/local/bin/puppet-master on macOS).
    #[cfg(target_os = "windows")]
    {
        // On Windows, the installed entrypoint is commonly `puppet-master.cmd` (PATHEXT),
        // which CreateProcess won't resolve. Use cmd.exe for PATH + PATHEXT resolution.
        let mut cmd = Command::new("cmd");
        // Use `call` so .cmd shims execute correctly.
        cmd.args([
            "/C",
            "call",
            "puppet-master",
            "gui",
            "--no-open",
            "--port",
            &port,
            "--host",
            host,
            "--strict-port",
        ])
            .env("PUPPET_MASTER_NO_OPEN", "1")
            .env("NO_OPEN_BROWSER", "1");
        if let Some(root) = &install_root {
            cmd.env("PUPPET_MASTER_INSTALL_ROOT", root);
            cmd.env("PUPPET_MASTER_APP_ROOT", root);
            cmd.env(
                "PLAYWRIGHT_BROWSERS_PATH",
                root.join("playwright-browsers"),
            );
        }
        if let Some(h) = &home_dir {
            cmd.current_dir(h);
            cmd.env("USERPROFILE", h);
            cmd.env("HOME", h);
        }
        if let Some(l) = env::var_os("LOCALAPPDATA") {
            cmd.env("LOCALAPPDATA", l);
        }
        if let Some(a) = env::var_os("APPDATA") {
            cmd.env("APPDATA", a);
        }
        cmd.stdin(Stdio::null()).stdout(Stdio::null()).stderr(Stdio::null());
        // Hide console window for cmd.exe.
        cmd.creation_flags(0x08000000);
        if cmd.spawn().is_ok() {
            return true;
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        let mut cmd = Command::new("puppet-master");
        cmd.args(["gui", "--no-open", "--port", &port, "--host", host, "--strict-port"])
            .env("PUPPET_MASTER_NO_OPEN", "1")
            .env("NO_OPEN_BROWSER", "1");
        if let Some(root) = &install_root {
            cmd.env("PUPPET_MASTER_INSTALL_ROOT", root);
            cmd.env("PUPPET_MASTER_APP_ROOT", root);
            cmd.env(
                "PLAYWRIGHT_BROWSERS_PATH",
                root.join("playwright-browsers"),
            );
        }
        if let Some(h) = &home_dir {
            cmd.current_dir(h);
            cmd.env("HOME", h);
        }
        cmd.stdin(Stdio::null()).stdout(Stdio::null()).stderr(Stdio::null());
        let spawn_attempt = cmd.spawn();
        if spawn_attempt.is_ok() {
            return true;
        }
    }

    // Fallback to known install layouts.
    if let Some(cli) = resolve_puppet_master_cli_fallback(resource_dir, current_exe.clone()) {
        #[cfg(target_os = "windows")]
        {
            // If the fallback is a .cmd, it must be invoked via cmd.exe.
            if cli.extension().map(|e| e.to_string_lossy().to_lowercase()) == Some("cmd".to_string()) {
                let mut fallback = Command::new("cmd");
                fallback
                    .arg("/C")
                    .arg("call")
                    .arg(&cli)
                    .arg("gui")
                    .arg("--no-open")
                    .arg("--port")
                    .arg(&port)
                    .arg("--host")
                    .arg(host)
                    .arg("--strict-port")
                    .env("PUPPET_MASTER_NO_OPEN", "1")
                    .env("NO_OPEN_BROWSER", "1");
                if let Some(root) = &install_root {
                    fallback.env("PUPPET_MASTER_INSTALL_ROOT", root);
                    fallback.env("PUPPET_MASTER_APP_ROOT", root);
                    fallback.env(
                        "PLAYWRIGHT_BROWSERS_PATH",
                        root.join("playwright-browsers"),
                    );
                }
                if let Some(h) = &home_dir {
                    fallback.current_dir(h);
                    fallback.env("HOME", h);
                    fallback.env("USERPROFILE", h);
                }
                fallback.stdin(Stdio::null()).stdout(Stdio::null()).stderr(Stdio::null());
                fallback.creation_flags(0x08000000);
                let _ = fallback.spawn();
                return true;
            }
        }

        let mut fallback = Command::new(cli);
        fallback
            .args(["gui", "--no-open", "--port", &port, "--host", host, "--strict-port"])
            .env("PUPPET_MASTER_NO_OPEN", "1")
            .env("NO_OPEN_BROWSER", "1");
        if let Some(root) = &install_root {
            fallback.env("PUPPET_MASTER_INSTALL_ROOT", root);
            fallback.env("PUPPET_MASTER_APP_ROOT", root);
            fallback.env(
                "PLAYWRIGHT_BROWSERS_PATH",
                root.join("playwright-browsers"),
            );
        }
        if let Some(h) = &home_dir {
            fallback.current_dir(h);
            fallback.env("HOME", h);
            #[cfg(target_os = "windows")]
            {
                fallback.env("USERPROFILE", h);
            }
        }
        fallback.stdin(Stdio::null()).stdout(Stdio::null()).stderr(Stdio::null());
        let _ = fallback.spawn();
        return true;
    }

    false
}

fn launch_cli() {
    #[cfg(target_os = "windows")]
    {
        // Use /K to keep window open after command completes
        // Try puppet-master.exe first (installed), then cargo run fallback
        let status = Command::new("cmd")
            .args(["/K", "where puppet-master.exe >nul 2>nul && puppet-master || echo puppet-master not found in PATH && pause"])
            .spawn();

        if status.is_err() {
            log::error!("Failed to launch CLI on Windows: {:?}", status.err());
        }
    }
    #[cfg(target_os = "macos")]
    {
        // Use AppleScript to open Terminal and keep it open
        // Check if puppet-master is in PATH, otherwise show error
        let script = r#"tell application "Terminal"
            activate
            do script "if command -v puppet-master >/dev/null 2>&1; then puppet-master; else echo 'puppet-master not found in PATH'; echo 'Install it or add it to your PATH'; fi; echo ''; echo 'Press Enter to close...'; read"
        end tell"#;
        let status = Command::new("osascript").args(["-e", script]).spawn();

        if status.is_err() {
            log::error!("Failed to launch CLI on macOS: {:?}", status.err());
        }
    }
    #[cfg(target_os = "linux")]
    {
        // Keep terminal open: run CLI then wait for user Enter (read). No --hold/--noclose
        // required if the last command is "read"; avoid flags that some terminals don't support.
        let script = "if command -v puppet-master >/dev/null 2>&1; then puppet-master; else echo 'puppet-master not found in PATH'; echo 'Install it or add it to your PATH'; fi; echo; echo 'Press Enter to close...'; read x";

        let mut launched = false;
        // Try terminals in order. Use -e / -c with bash -lc so the script runs and read keeps window open.
        let terminals: &[(&str, &[&str])] = &[
            ("gnome-terminal", &["--", "bash", "-lc", script][..]),
            ("konsole", &["--noclose", "-e", "bash", "-lc", script][..]),
            ("x-terminal-emulator", &["-e", "bash", "-lc", script][..]),
            ("xterm", &["-hold", "-e", "bash", "-lc", script][..]),
            ("mate-terminal", &["--", "bash", "-lc", script][..]),
            ("lxterminal", &["-e", "bash", "-lc", script][..]),
            ("xfce4-terminal", &["-e", "bash", "-lc", script][..]),
        ];

        for (terminal, args) in terminals {
            if Command::new("sh")
                .args(["-c", &format!("command -v {} >/dev/null 2>&1", terminal)])
                .output()
                .map(|o| o.status.success())
                .unwrap_or(false)
            {
                match Command::new(terminal).args(*args).spawn() {
                    Ok(_) => {
                        launched = true;
                        log::info!("Launched CLI using {}", terminal);
                        break;
                    }
                    Err(e) => {
                        log::warn!("Failed to launch {}: {}", terminal, e);
                    }
                }
            }
        }

        if !launched {
            log::error!("No suitable terminal emulator found on Linux");
        }
    }
}

fn relaunch_app() {
    if let Ok(exe) = env::current_exe() {
        if exe.to_string_lossy().contains("puppet-master-gui")
            && exe.to_string_lossy().contains("MacOS")
        {
            if let Some(app_bundle) = exe
                .parent()
                .and_then(Path::parent)
                .and_then(Path::parent)
                .and_then(Path::parent)
            {
                let _ = Command::new("open").arg(app_bundle).spawn();
                return;
            }
        }

        let _ = Command::new(exe).spawn();
    }
}

/// Wait for the GUI server to be ready before navigating.
/// Prefer HTTP /health readiness (more accurate than a TCP connect) with a bounded timeout.
/// Returns true if server became ready, false on timeout (caller may still navigate).
fn wait_for_server(url: &Url) -> bool {
    let host = match url.host_str() {
        Some(h) => h.to_string(),
        None => {
            log::warn!("Server URL has no host, skipping wait");
            return false;
        }
    };
    let port = url.port().unwrap_or(3847);
    const MAX_ATTEMPTS: u32 = 180;
    const INTERVAL_MS: u64 = 500;
    const CONNECT_TIMEOUT_MS: u64 = 500;
    let timeout = Duration::from_millis(CONNECT_TIMEOUT_MS);

    // Prefer IPv4 loopback for localhost to avoid ::1 vs 127.0.0.1 mismatches on first launch.
    let resolved_host = if host == "localhost" {
        "127.0.0.1".to_string()
    } else {
        host.clone()
    };

    let addr = match format!("{}:{}", resolved_host, port).parse::<std::net::SocketAddr>() {
        Ok(a) => a,
        Err(_) => match std::net::ToSocketAddrs::to_socket_addrs(&(resolved_host.as_str(), port)) {
            Ok(mut addrs) => match addrs.next() {
                Some(a) => a,
                None => {
                    log::warn!("No addresses resolved for {}:{}", resolved_host, port);
                    return false;
                }
            },
            Err(e) => {
                log::warn!("Failed to resolve {}:{}: {}", resolved_host, port, e);
                return false;
            }
        },
    };

    for attempt in 1..=MAX_ATTEMPTS {
        // First gate: TCP listening
        if TcpStream::connect_timeout(&addr, timeout).is_ok() {
            // Second gate: HTTP /health responds (server is actually serving)
            if url.scheme() == "http" {
                let mut stream = match TcpStream::connect_timeout(&addr, Duration::from_millis(1000)) {
                    Ok(s) => s,
                    Err(_) => {
                        // TCP ok above, but retry for HTTP probe
                        if attempt < MAX_ATTEMPTS {
                            std::thread::sleep(Duration::from_millis(INTERVAL_MS));
                        }
                        continue;
                    }
                };

                let _ = stream.set_read_timeout(Some(Duration::from_millis(1000)));
                let _ = stream.set_write_timeout(Some(Duration::from_millis(1000)));

                let req = format!(
                    "GET /health HTTP/1.1\r\nHost: {}:{}\r\nConnection: close\r\n\r\n",
                    host, port
                );
                if stream.write_all(req.as_bytes()).is_ok() {
                    let mut buf = [0u8; 256];
                    if let Ok(n) = stream.read(&mut buf) {
                        if n > 0 {
                            let head = String::from_utf8_lossy(&buf[..n]);
                            if head.starts_with("HTTP/1.1 200") || head.starts_with("HTTP/1.0 200") {
                                log::info!("GUI server ready (/health) after {} attempt(s)", attempt);
                                return true;
                            }
                        }
                    }
                }
            } else {
                log::info!("GUI server ready (TCP) after {} attempt(s)", attempt);
                return true;
            }
        }

        if attempt < MAX_ATTEMPTS {
            std::thread::sleep(Duration::from_millis(INTERVAL_MS));
        }
    }

    log::warn!(
        "GUI server not ready after {}s",
        (MAX_ATTEMPTS as u64) * INTERVAL_MS / 1000
    );
    false
}

/// Wait for platform routes (first-boot, etc.) to be ready. Call after wait_for_server.
/// Returns true if /api/platforms/first-boot responds 200, false on timeout.
fn wait_for_platform_routes(url: &Url) -> bool {
    let host = match url.host_str() {
        Some(h) => h.to_string(),
        None => return false,
    };
    let port = url.port().unwrap_or(3847);
    const MAX_ATTEMPTS: u32 = 40;
    const INTERVAL_MS: u64 = 500;

    // Prefer IPv4 loopback for localhost to avoid ::1 vs 127.0.0.1 mismatches on first launch.
    let resolved_host = if host == "localhost" {
        "127.0.0.1".to_string()
    } else {
        host.clone()
    };

    let addr = match format!("{}:{}", resolved_host, port).parse::<std::net::SocketAddr>() {
        Ok(a) => a,
        Err(_) => match std::net::ToSocketAddrs::to_socket_addrs(&(resolved_host.as_str(), port)) {
            Ok(mut addrs) => match addrs.next() {
                Some(a) => a,
                None => return false,
            },
            Err(_) => return false,
        },
    };

    for attempt in 1..=MAX_ATTEMPTS {
        if let Ok(mut stream) = TcpStream::connect_timeout(&addr, Duration::from_millis(1000)) {
            let _ = stream.set_read_timeout(Some(Duration::from_millis(2000)));
            let _ = stream.set_write_timeout(Some(Duration::from_millis(1000)));
            let req = format!(
                "GET /api/platforms/first-boot HTTP/1.1\r\nHost: {}:{}\r\nConnection: close\r\n\r\n",
                host, port
            );
            if stream.write_all(req.as_bytes()).is_ok() {
                let mut buf = [0u8; 512];
                if let Ok(n) = stream.read(&mut buf) {
                    if n > 0 {
                        let head = String::from_utf8_lossy(&buf[..n.min(64)]);
                        if head.starts_with("HTTP/1.1 200") || head.starts_with("HTTP/1.0 200") {
                            log::info!(
                                "Platform routes ready (/api/platforms/first-boot) after {} attempt(s)",
                                attempt
                            );
                            return true;
                        }
                    }
                }
            }
        }
        if attempt < MAX_ATTEMPTS {
            std::thread::sleep(Duration::from_millis(INTERVAL_MS));
        }
    }
    log::warn!(
        "Platform routes not ready after {}s",
        (MAX_ATTEMPTS as u64) * INTERVAL_MS / 1000
    );
    false
}

fn main() {
    IS_QUITTING.store(false, Ordering::Relaxed);
    set_desktop_env_hints();

    // Read server URL from args/env (args win; supports macOS `open ... --args`)
    let mut server_url_arg: Option<String> = None;
    let mut args = env::args().skip(1);
    while let Some(arg) = args.next() {
        if arg == "--server-url" || arg == "--url" {
            server_url_arg = args.next();
            break;
        }
    }

    let server_url = server_url_arg
        .or_else(|| env::var("PUPPET_MASTER_URL").ok())
        .or_else(|| Some("http://127.0.0.1:3847".to_string()));

    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            // A second instance was launched. Focus the existing window instead.
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                if IS_QUITTING.load(Ordering::Relaxed) {
                    return;
                }
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    Target::new(TargetKind::LogDir {
                        file_name: Some("puppet-master.log".to_string()),
                    }),
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::Webview),
                ])
                .level(log::LevelFilter::Info)
                .build(),
        )
        .setup(move |app| {
            // Desktop apps do not inherit the user's shell PATH. Ensure common CLI install
            // locations are present so `puppet-master` and platform CLIs can be found.
            let home = env::var("HOME").ok().map(PathBuf::from);
            let extra = common_extra_paths(home.as_deref());
            enrich_path_env(&extra);

            let status = MenuItemBuilder::with_id("status", "Server: Running")
                .enabled(false)
                .build(app)?;
            let show = MenuItemBuilder::with_id("show", "Open GUI").build(app)?;
            let open_cli = MenuItemBuilder::with_id("open_cli", "Open CLI").build(app)?;
            let restart = MenuItemBuilder::with_id("restart", "Restart App").build(app)?;
            let quit = MenuItemBuilder::with_id("quit", "Quit").build(app)?;

            let tray_menu = MenuBuilder::new(app)
                .items(&[&status, &show, &open_cli, &restart, &quit])
                .build()?;

            // Prefer the app's default window icon for tray (per Tauri v2 docs).
            // Fallback: platform-appropriate bundled icon so tray renders on all platforms.
            // IMPORTANT: don't fail the entire app if the icon can't be loaded; log and continue.
            let icon = app.default_window_icon().cloned().or_else(|| {
                #[cfg(target_os = "windows")]
                {
                    if let Ok(img) = Image::from_bytes(include_bytes!("../icons/icon.ico")) {
                        log::info!("Tray icon: using bundled icon.ico");
                        return Some(img);
                    }
                }
                #[cfg(target_os = "macos")]
                {
                    if let Ok(img) = Image::from_bytes(include_bytes!("../icons/32x32.png")) {
                        log::info!("Tray icon: using bundled 32x32.png");
                        return Some(img);
                    }
                }
                #[cfg(target_os = "linux")]
                {
                    if let Ok(img) = Image::from_bytes(include_bytes!("../icons/32x32.png")) {
                        log::info!("Tray icon: using bundled 32x32.png");
                        return Some(img);
                    }
                }
                None
            }).or_else(|| {
                let fallback = include_bytes!("../icons/32x32.png");
                match Image::from_bytes(fallback) {
                    Ok(img) => {
                        log::info!("Tray icon: using fallback 32x32.png");
                        Some(img)
                    }
                    Err(e) => {
                        log::error!("Tray icon: failed to load fallback 32x32.png: {}", e);
                        None
                    }
                }
            });

            if icon.is_none() {
                log::warn!("Tray icon: no icon source available; tray may not render");
            }

            // Build and store tray icon in app state to keep it alive
            // CRITICAL: Must not drop the TrayIcon handle or it disappears on macOS/Windows

            let mut tray_builder = TrayIconBuilder::with_id("puppet-master")
                .menu(&tray_menu)
                .tooltip("Puppet Master")
                // Tauri 2.9.x: menu_on_left_click is deprecated; use show_menu_on_left_click.
                // Linux: unsupported (right-click menu still works); non-mac left click opens the GUI (handled below).
                .show_menu_on_left_click(cfg!(target_os = "macos"))
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.unminimize();
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "open_cli" => {
                        launch_cli();
                    }
                    "restart" => {
                        IS_QUITTING.store(true, Ordering::Relaxed);
                        relaunch_app();
                        app.exit(0);
                    }
                    "quit" => {
                        IS_QUITTING.store(true, Ordering::Relaxed);
                        app.exit(0);
                    }
                    _ => (),
                })
                .on_tray_icon_event(|tray, event| {
                    // On macOS the left-click handler below is cfg-gated out, which would otherwise
                    // make `tray` unused and trigger a warning in release builds.
                    let _ = tray.app_handle();
                    // Handle tray icon click events cross-platform
                    match event {
                        TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } => {
                            // On macOS, left-click is used to open the tray menu.
                            #[cfg(not(target_os = "macos"))]
                            {
                                if let Some(app) = tray.app_handle().get_webview_window("main") {
                                    let _ = app.unminimize();
                                    let _ = app.show();
                                    let _ = app.set_focus();
                                }
                            }
                        }
                        TrayIconEvent::Click {
                            button: MouseButton::Right,
                            button_state: MouseButtonState::Up,
                            ..
                        } => {
                            // Right click handled by menu automatically
                            log::debug!("Tray icon right-clicked");
                        }
                        _ => {}
                    }
                });

            if let Some(icon) = icon {
                tray_builder = tray_builder.icon(icon);
            } else {
                log::warn!("Default window icon not available; tray icon may not render");
            }

            // Linux: tray icons need to be written to disk; use app cache dir to avoid sandbox perms.
            #[cfg(target_os = "linux")]
            {
                if let Ok(cache_dir) = app.path().app_cache_dir() {
                    tray_builder = tray_builder.temp_dir_path(cache_dir);
                }
            }

            match tray_builder.build(app) {
                Ok(tray) => {
                    log::info!("Tray icon created successfully");
                    // Keep tray icon alive by storing in app's managed state
                    app.manage(tray);
                }
                Err(e) => {
                    log::error!("Failed to create tray icon: {e}");
                }
            }

            // Get the main window (use Io variant; SetupError is not public in tauri)
            let window = app
                .get_webview_window("main")
                .ok_or_else(|| {
                    tauri::Error::Io(std::io::Error::new(
                        std::io::ErrorKind::NotFound,
                        "Failed to get main window",
                    ))
                })?;

            // Always start/ensure the GUI server is running.
            // We do this in a background thread so the UI event loop is not blocked.
            //
            // IMPORTANT: Do NOT navigate the webview to the backend URL at runtime. Keep the
            // bundled frontend loaded and let it call the backend via its API base URL + CORS.
            // This avoids first-boot navigation flakiness (notably on Windows).
            if let Some(url_str) = server_url {
                log::info!("Will connect to GUI server: {}", url_str);
                let url = Url::parse(&url_str).map_err(|e| {
                    tauri::Error::Io(std::io::Error::new(
                        std::io::ErrorKind::InvalidInput,
                        format!("Invalid server URL '{}': {}", url_str, e),
                    ))
                })?;

                let res_dir = app.path().resource_dir().ok();
                let app_handle = app.handle().clone();
                let window_label = window.label().to_string();
                std::thread::spawn(move || {
                    // Desktop app uses deterministic port selection within 3847..3857.
                    // 1) Reuse an existing Puppet Master server if one is already running.
                    // 2) Otherwise select the first free port and spawn the backend with --strict-port.
                    let selected_port = if is_loopback_url(&url) {
                        if let Some(existing) = select_existing_server_port() {
                            log::info!("Found existing Puppet Master server on port {}", existing);
                            existing
                        } else {
                            match select_free_port() {
                                Some(p) => {
                                    log::info!("Selected free port {}", p);
                                    let started = try_spawn_gui_server(p, res_dir);
                                    if !started {
                                        log::warn!("Failed to start GUI server (puppet-master not found)");
                                    }
                                    p
                                }
                                None => {
                                    log::warn!("No free port available in 3847..3857; falling back to 3847");
                                    let _ = try_spawn_gui_server(3847, res_dir);
                                    3847
                                }
                            }
                        }
                    } else {
                        // Non-loopback URL: do not auto-spawn (could be remote).
                        url.port().unwrap_or(3847)
                    };

                    let api_base = if is_loopback_url(&url) {
                        format!("http://127.0.0.1:{}", selected_port)
                    } else {
                        // Best-effort: preserve scheme/host from provided URL.
                        match url.host_str() {
                            Some(host) => format!("{}://{}:{}", url.scheme(), host, selected_port),
                            None => format!("http://127.0.0.1:{}", selected_port),
                        }
                    };
                    // Persist the API base into the bundled frontend and notify listeners.
                    // Retry briefly in case the webview is not ready to eval yet.
                    let api_base_js = serde_json::to_string(&api_base).unwrap_or_else(|_| "\"\"".to_string());
                    let script = format!(
                        "try {{ localStorage.setItem('rwm-api-base-url', {base}); }} catch (e) {{}}\n\
                         try {{ window.dispatchEvent(new CustomEvent('rwm-api-base-url-ready', {{ detail: {{ baseUrl: {base} }} }})); }} catch (e) {{}}",
                        base = api_base_js
                    );
                    for attempt in 1..=20 {
                        let maybe_window = app_handle.get_webview_window(window_label.as_str());
                        match maybe_window {
                            Some(w) => match w.eval(script.as_str()) {
                                Ok(_) => break,
                                Err(e) => {
                                    if attempt == 1 {
                                        log::info!("API base injection eval not ready yet; retrying...");
                                    }
                                    if attempt == 20 {
                                        log::warn!("Failed to inject API base URL into webview: {}", e);
                                    } else {
                                        std::thread::sleep(Duration::from_millis(100));
                                    }
                                }
                            },
                            None => {
                                if attempt == 20 {
                                    log::warn!("Failed to inject API base URL: webview window not found");
                                } else {
                                    std::thread::sleep(Duration::from_millis(100));
                                }
                            }
                        }
                    }

                    // Wait for the selected server to be ready before the UI starts firing API calls.
                    let ready_url = Url::parse(&api_base).unwrap_or(url.clone());
                    if wait_for_server(&ready_url) {
                        wait_for_platform_routes(&ready_url);
                        std::thread::sleep(Duration::from_millis(500));
                        log::info!("GUI server ready; staying on bundled frontend (no runtime navigation)");
                    } else {
                        log::warn!("Server not ready after timeout; staying on bundled frontend");
                    }
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
