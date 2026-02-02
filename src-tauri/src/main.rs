// Prevents additional console window on Windows in release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use std::path::Path;
use std::process::Command;
use tauri::{
    image::Image,
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};
use tauri_plugin_log::{Target, TargetKind};
use url::Url;

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
        let status = Command::new("osascript")
            .args(["-e", script])
            .spawn();
        
        if status.is_err() {
            log::error!("Failed to launch CLI on macOS: {:?}", status.err());
        }
    }
    #[cfg(target_os = "linux")]
    {
        // Try various terminal emulators with commands that keep the terminal open
        let cmd = "if command -v puppet-master >/dev/null 2>&1; then puppet-master; else echo 'puppet-master not found in PATH'; echo 'Install it or add it to your PATH'; fi; echo ''; echo 'Press Enter to close...'; read";
        
        let terminals = [
            ("gnome-terminal", vec!["--", "bash", "-c", cmd]),
            ("konsole", vec!["-e", "bash", "-c", cmd]),
            ("xfce4-terminal", vec!["-e", &format!("bash -c '{}'", cmd)]),
            ("x-terminal-emulator", vec!["-e", "bash", "-c", cmd]),
            ("xterm", vec!["-hold", "-e", "bash", "-c", cmd]),
            ("mate-terminal", vec!["--", "bash", "-c", cmd]),
            ("lxterminal", vec!["-e", &format!("bash -c '{}'", cmd)]),
        ];
        
        let mut launched = false;
        for (terminal, args) in terminals {
            if Command::new("sh")
                .args(["-c", &format!("command -v {} >/dev/null 2>&1", terminal)])
                .output()
                .map(|o| o.status.success())
                .unwrap_or(false)
            {
                match Command::new(terminal).args(&args).spawn() {
                    Ok(_) => {
                        launched = true;
                        log::info!("Launched CLI using {}", terminal);
                        break;
                    }
                    Err(e) => {
                        log::warn!("Failed to launch {} : {}", terminal, e);
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
        .or_else(|| env::var("PUPPET_MASTER_URL").ok());

    tauri::Builder::default()
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

            // Load the tray icon using platform-appropriate format
            // For tray icons, smaller sizes work better (32x32 or similar)
            let icon = {
                #[cfg(target_os = "windows")]
                {
                    // Windows: Try ICO first (contains multiple sizes), fallback to PNG
                    let icon_bytes = include_bytes!("../icons/icon.ico");
                    match Image::from_bytes(icon_bytes) {
                        Ok(img) => {
                            log::info!("Loaded tray icon from icon.ico");
                            img
                        }
                        Err(e) => {
                            log::warn!("Failed to load icon.ico: {}, trying 32x32.png", e);
                            let fallback = include_bytes!("../icons/32x32.png");
                            Image::from_bytes(fallback)
                                .expect("Failed to load fallback 32x32.png tray icon")
                        }
                    }
                }
                #[cfg(target_os = "macos")]
                {
                    // macOS: Use PNG format, 32x32 size is optimal for menu bar
                    let icon_bytes = include_bytes!("../icons/32x32.png");
                    match Image::from_bytes(icon_bytes) {
                        Ok(img) => {
                            log::info!("Loaded tray icon from 32x32.png");
                            img
                        }
                        Err(e) => {
                            log::warn!("Failed to load 32x32.png: {}, trying icon.png", e);
                            let fallback = include_bytes!("../icons/icon.png");
                            Image::from_bytes(fallback)
                                .expect("Failed to load fallback icon.png tray icon")
                        }
                    }
                }
                #[cfg(target_os = "linux")]
                {
                    // Linux: Use PNG format, 32x32 or larger works well
                    let icon_bytes = include_bytes!("../icons/32x32.png");
                    match Image::from_bytes(icon_bytes) {
                        Ok(img) => {
                            log::info!("Loaded tray icon from 32x32.png");
                            img
                        }
                        Err(e) => {
                            log::warn!("Failed to load 32x32.png: {}, trying icon.png", e);
                            let fallback = include_bytes!("../icons/icon.png");
                            Image::from_bytes(fallback)
                                .expect("Failed to load fallback icon.png tray icon")
                        }
                    }
                }
            };

            // Build and store tray icon in app state to keep it alive
            // CRITICAL: Must not drop the TrayIcon handle or it disappears on macOS/Windows
            let tray = TrayIconBuilder::new()
                .icon(icon)
                .menu(&tray_menu)
                .tooltip("Puppet Master")
                .menu_on_left_click(false)
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
                        relaunch_app();
                        app.exit(0);
                    }
                    "quit" => {
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
                            // Left click: show window (cross-platform)
                            if let Some(app) = tray.app_handle().get_webview_window("main") {
                                let _ = app.unminimize();
                                let _ = app.show();
                                let _ = app.set_focus();
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
                })
                .build(app)?;
            
            log::info!("Tray icon created successfully");

            // Keep tray icon alive by storing in app's managed state
            app.manage(tray);

            // Get the main window
            let window = app
                .get_webview_window("main")
                .ok_or_else(|| tauri::Error::Setup("Failed to get main window".to_string()))?;

            // If server URL is provided, navigate to it; otherwise use bundled frontend
            if let Some(url_str) = server_url {
                log::info!("Loading GUI from external server: {}", url_str);
                let url = Url::parse(&url_str)
                    .map_err(|e| tauri::Error::Setup(format!("Invalid server URL '{}': {}", url_str, e)))?;
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
