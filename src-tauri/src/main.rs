// Prevents additional console window on Windows in release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use std::path::Path;
use std::process::Command;
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::TrayIconBuilder,
    Manager,
};
use tauri_plugin_log::{Target, TargetKind};
use url::Url;

fn launch_cli() {
    #[cfg(target_os = "windows")]
    {
        let _ = Command::new("cmd").args(["/C", "start", "cmd", "/K", "puppet-master"]).spawn();
    }
    #[cfg(target_os = "macos")]
    {
        let _ = Command::new("open")
            .args(["-a", "Terminal", "--args", "-l", "bash", "-c", "puppet-master; exec $SHELL"])
            .spawn();
    }
    #[cfg(target_os = "linux")]
    {
        let terminals = [
            ("x-terminal-emulator", &["-e", "bash", "-lc", "puppet-master"] as &[&str]),
            ("gnome-terminal", &["--", "bash", "-lc", "puppet-master"]),
            ("konsole", &["-e", "bash", "-lc", "puppet-master"]),
            ("xterm", &["-e", "bash", "-lc", "puppet-master"]),
        ];
        for (terminal, args) in terminals {
            if Command::new("sh")
                .args(["-c", &format!("command -v {}", terminal)])
                .output()
                .map(|o| o.status.success())
                .unwrap_or(false)
            {
                let _ = Command::new(terminal).args(args).spawn();
                break;
            }
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
        .or_else(|| env::var("PUPPET_MASTER_URL").ok())
        .unwrap_or_else(|| "http://127.0.0.1:3847".to_string());

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

            let _tray = TrayIconBuilder::new()
                .menu(&tray_menu)
                .menu_on_left_click(true)
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
                .build(app)?;

            // Get the main window
            let window = app
                .get_webview_window("main")
                .expect("Failed to get main window");

            // Load the GUI server URL
            log::info!("Loading GUI server from: {}", server_url);
            let url = Url::parse(&server_url).expect("invalid server URL");
            window.navigate(url)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
