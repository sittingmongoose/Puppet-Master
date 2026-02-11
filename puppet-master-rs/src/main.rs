// RWM Puppet Master - Rust + Iced Rewrite
// Main entry point

use anyhow::Result;
use log::info;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

/// Global shutdown flag
static SHUTDOWN: AtomicBool = AtomicBool::new(false);

fn main() -> Result<()> {
    if std::env::args().any(|arg| arg == "--version" || arg == "-V") {
        println!("{}", env!("CARGO_PKG_VERSION"));
        return Ok(());
    }

    // Initialize logging
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info"))
        .init();

    // Load .env if present
    let _ = dotenv::dotenv();

    info!("RWM Puppet Master v{} starting...", env!("CARGO_PKG_VERSION"));

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
