// Prevents additional console window on Windows in release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use std::path::Path;
use std::process::Command;
use std::sync::atomic::{AtomicBool, Ordering};
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

fn main() {
    IS_QUITTING.store(false, Ordering::Relaxed);

    // Read server URL from args/env (args win; supports macOS `open ... --args`)
    let mut server_url_arg: Option<String> = None;
    let mut args = env::args().skip(1);
    while let Some(arg) = args.next() {
        if arg == "--server-url" || arg == "--url" {
            server_url_arg = args.next();
            break;
        }
    }

    let server_url = server_url_arg.or_else(|| env::var("PUPPET_MASTER_URL").ok());

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

            // Get the main window
            let window = app
                .get_webview_window("main")
                .ok_or_else(|| tauri::Error::Setup("Failed to get main window".to_string()))?;

            // If server URL is provided, navigate to it; otherwise use bundled frontend
            if let Some(url_str) = server_url {
                log::info!("Loading GUI from external server: {}", url_str);
                let url = Url::parse(&url_str).map_err(|e| {
                    tauri::Error::Setup(format!("Invalid server URL '{}': {}", url_str, e))
                })?;
                window.navigate(url)?;
            } else {
                log::info!("Using bundled frontend");
                // The window will automatically load from frontendDist configured in tauri.conf.json
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
