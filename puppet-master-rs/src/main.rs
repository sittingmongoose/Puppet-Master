// RWM Puppet Master - Rust + Iced Rewrite
// Main entry point

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use anyhow::Result;
use log::info;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};

/// Global shutdown flag
static SHUTDOWN: AtomicBool = AtomicBool::new(false);

fn main() -> Result<()> {
    if std::env::args().any(|arg| arg == "--version" || arg == "-V") {
        println!("{}", puppet_master::build_info::cli_version_output());
        return Ok(());
    }

    if std::env::args().any(|arg| arg == "--help" || arg == "-h") {
        println!(
            "{}\n\nUsage:\n  puppet-master [--version] [--help]\n\nRun without arguments to launch the GUI.",
            puppet_master::build_info::full_build_identity()
        );
        return Ok(());
    }

    // Initialize logging
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    // Load .env if present
    let _ = dotenv::dotenv();

    info!(
        "{} starting...",
        puppet_master::build_info::full_build_identity()
    );

    // Set up signal handlers for graceful shutdown
    let shutdown_flag = Arc::new(AtomicBool::new(false));
    let shutdown_clone = shutdown_flag.clone();
    ctrlc_handler(shutdown_clone);

    // Launch the Iced application with tray icon
    puppet_master::app::run(shutdown_flag)?;

    info!("RWM Puppet Master shutdown complete.");
    Ok(())
}

fn ctrlc_handler(shutdown: Arc<AtomicBool>) {
    let _ = std::panic::catch_unwind(|| {
        let _ = ctrlc::set_handler(move || {
            log::warn!("Received shutdown signal, cleaning up...");
            shutdown.store(true, Ordering::SeqCst);
            SHUTDOWN.store(true, Ordering::SeqCst);
        });
    });
}
