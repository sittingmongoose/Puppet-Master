// Prevents additional console window on Windows in release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use tauri::Manager;
use tauri_plugin_log::{Target, TargetKind};

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
            // Get the main window
            let window = app
                .get_webview_window("main")
                .expect("Failed to get main window");

            // Load the GUI server URL
            log::info!("Loading GUI server from: {}", server_url);
            window.navigate(tauri::WebviewUrl::External(server_url.parse().unwrap()))?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
