// Prevents additional console window on Windows in release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use std::net::TcpStream;
use std::path::{Path, PathBuf};
use std::io::{Read, Write};
use std::process::Command;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;
use tauri::{
    image::Image,
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
    WindowEvent,
};
use tauri_plugin_log::{Target, TargetKind};
use url::Url;

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

fn resolve_puppet_master_cli_fallback(resource_dir: Option<PathBuf>, current_exe: Option<PathBuf>) -> Option<PathBuf> {
    // macOS installer layout: <App>.app/Contents/Resources/puppet-master/bin/puppet-master
    if let Some(res) = resource_dir {
        let candidate = res.join("puppet-master").join("bin").join("puppet-master");
        if candidate.is_file() {
            return Some(candidate);
        }
    }

    // Linux/windows installer layout: sibling to GUI binary (e.g. /opt/puppet-master/bin/puppet-master-gui + /opt/puppet-master/bin/puppet-master)
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
        }
    }

    None
}

fn try_spawn_gui_server(url: &Url, resource_dir: Option<PathBuf>) -> bool {
    let port = url.port().unwrap_or(3847).to_string();
    let host = "127.0.0.1";
    let home_dir = env::var_os("HOME")
        .or_else(|| env::var_os("USERPROFILE"))
        .map(PathBuf::from);

    // Prefer PATH resolution (e.g. /usr/local/bin/puppet-master on macOS).
    let mut cmd = Command::new("puppet-master");
    cmd.args(["gui", "--no-open", "--port", &port, "--host", host])
        // Keep child behavior deterministic for desktop launches.
        .env("PUPPET_MASTER_NO_OPEN", "1")
        .env("NO_OPEN_BROWSER", "1");
    if let Some(h) = &home_dir {
        cmd.current_dir(h);
    }
    let spawn_attempt = cmd
        .spawn();
    if spawn_attempt.is_ok() {
        return true;
    }

    // Fallback to known install layouts.
    let exe = env::current_exe().ok();
    if let Some(cli) = resolve_puppet_master_cli_fallback(resource_dir, exe) {
        let mut fallback = Command::new(cli);
        fallback
            .args(["gui", "--no-open", "--port", &port, "--host", host])
            .env("PUPPET_MASTER_NO_OPEN", "1")
            .env("NO_OPEN_BROWSER", "1");
        if let Some(h) = &home_dir {
            fallback.current_dir(h);
        }
        let _ = fallback
            .spawn();
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

            // Always connect to a GUI server URL (default: http://127.0.0.1:3847).
            // We wait for server in a background thread so the UI event loop is not blocked. The
            // UI event loop is not blocked.  The window initially shows the bundled
            // frontend (or a blank page); once the server is ready we navigate to it.
            // This prevents the "not responding" freeze on Windows and the blank/slow
            // first paint on macOS/Linux.
            if let Some(url_str) = server_url {
                log::info!("Will connect to GUI server: {}", url_str);
                let url = Url::parse(&url_str).map_err(|e| {
                    tauri::Error::Io(std::io::Error::new(
                        std::io::ErrorKind::InvalidInput,
                        format!("Invalid server URL '{}': {}", url_str, e),
                    ))
                })?;

                let window_for_nav = window.clone();
                let res_dir = app.path().resource_dir().ok();
                std::thread::spawn(move || {
                    // If this is a local URL, try to start the GUI server if it isn't already running.
                    if is_loopback_url(&url) {
                        let started = try_spawn_gui_server(&url, res_dir);
                        if !started {
                            log::warn!("Failed to start GUI server (puppet-master not found)");
                        }
                    }
                    if wait_for_server(&url) {
                        // Wait for platform routes so wizard won't show "load failed"
                        wait_for_platform_routes(&url);
                        // Small extra settle time for backend async setup
                        std::thread::sleep(Duration::from_millis(500));
                        match window_for_nav.navigate(url) {
                            Ok(_) => log::info!("Navigated to server URL"),
                            Err(e) => log::error!("Failed to navigate to server URL: {}", e),
                        }
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
