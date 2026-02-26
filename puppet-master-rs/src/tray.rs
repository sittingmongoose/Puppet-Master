//! System tray icon management for Puppet Master.
//!
//! This module provides a persistent system tray icon with a context menu
//! that allows users to interact with the application even when the main
//! window is hidden or minimized.
//!
//! # Platform Behavior
//!
//! - **Windows/Linux**: Left-click opens/focuses GUI, right-click shows menu
//! - **macOS**: Click shows menu (standard macOS behavior)
//!
//! # Features
//!
//! - Persistent tray icon with embedded PNG
//! - Dynamic status updates
//! - Context menu with common actions
//! - Cross-platform icon support
//!
//! # Example
//!
//! ```no_run
//! use puppet_master::tray::{TrayManager, TrayAction};
//!
//! let (tray_manager, rx) = TrayManager::new().expect("Failed to create tray");
//!
//! // Update status
//! tray_manager.update_status("Running");
//!
//! // Poll for actions
//! if let Some(action) = rx.try_recv().ok() {
//!     match action {
//!         TrayAction::OpenGui => { /* show window */ },
//!         TrayAction::RestartApp => { /* restart */ },
//!         TrayAction::Quit => { /* shutdown */ },
//!     }
//! }
//! ```

use anyhow::{Context, Result};
use crossbeam_channel::{Receiver, Sender, bounded};
use log::{debug, warn};
use muda::{Menu, MenuEvent, MenuItem, PredefinedMenuItem};
use std::sync::{Arc, Mutex};
use tray_icon::{Icon, TrayIcon, TrayIconBuilder, TrayIconEvent, menu::MenuId};
#[cfg(not(target_os = "macos"))]
use tray_icon::{MouseButton, MouseButtonState};

/// Embedded tray icon PNG bytes.
pub const ICON_BYTES: &[u8] = include_bytes!("../icons/icon.png");

// DRY:DATA:TrayAction
/// Actions that can be triggered from the system tray
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TrayAction {
    /// Open or focus the GUI window
    OpenGui,
    /// Restart the application
    RestartApp,
    /// Quit the application
    Quit,
}

// DRY:DATA:TrayManager
/// System tray icon manager
///
/// Manages the system tray icon, context menu, and user interactions.
/// The tray icon persists even when the main window is hidden.
pub struct TrayManager {
    /// The tray icon instance
    #[allow(dead_code)]
    tray: TrayIcon,
    /// Context menu
    _menu: Arc<Mutex<Menu>>,
    /// Status menu item for dynamic updates
    status_item: Arc<Mutex<MenuItem>>,
    /// Channel sender for tray actions
    _action_tx: Sender<TrayAction>,
    /// Menu event receiver (stored to keep events flowing)
    #[allow(dead_code)]
    menu_rx: Receiver<MenuEvent>,
    /// Tray event receiver (stored to keep events flowing)
    #[allow(dead_code)]
    tray_rx: Receiver<TrayIconEvent>,
}

impl TrayManager {
    // DRY:FN:new
    /// Create a new tray manager with the default embedded icon
    ///
    /// # Returns
    ///
    /// A tuple of (TrayManager, Receiver<TrayAction>) where the receiver
    /// can be used to poll for tray actions.
    ///
    /// # Errors
    ///
    /// Returns an error if:
    /// - Icon cannot be loaded or created
    /// - Tray icon creation fails (platform-specific)
    /// - Menu creation fails
    ///
    /// # Platform Notes
    ///
    /// - On macOS, this must be called from the main thread
    /// - On Windows, requires a message loop to be running
    /// - On Linux, requires a system tray implementation (most DEs have this)
    pub fn new() -> Result<(Self, Receiver<TrayAction>)> {
        debug!("Initializing system tray manager");

        // Load icon from embedded bytes
        let icon = Self::load_icon(ICON_BYTES).context("Failed to load tray icon")?;

        // Create menu
        let menu = Menu::new();

        // Status item (will be updated dynamically)
        let status_item = MenuItem::new("Status: Starting...", false, None);
        menu.append(&status_item)
            .context("Failed to add status item to menu")?;

        // Separator
        menu.append(&PredefinedMenuItem::separator())
            .context("Failed to add separator to menu")?;

        // Open GUI item
        let open_item = MenuItem::new("Open GUI", true, None);
        menu.append(&open_item)
            .context("Failed to add Open GUI item")?;

        // Separator
        menu.append(&PredefinedMenuItem::separator())
            .context("Failed to add separator to menu")?;

        // Restart item
        let restart_item = MenuItem::new("Restart Puppet Master", true, None);
        menu.append(&restart_item)
            .context("Failed to add Restart item")?;

        // Quit item
        let quit_item = MenuItem::new("Exit", true, None);
        menu.append(&quit_item).context("Failed to add Quit item")?;

        // Create tray icon
        let tray = TrayIconBuilder::new()
            .with_menu(Box::new(menu.clone()))
            .with_icon(icon)
            .with_tooltip("Puppet Master")
            .build()
            .context("Failed to build tray icon")?;

        // Create action channel
        let (action_tx, action_rx) = bounded(32);

        // Get menu event receiver
        let menu_rx = MenuEvent::receiver().clone();

        // Get tray event receiver
        let tray_rx = TrayIconEvent::receiver().clone();

        // Store menu items for later access
        let menu_arc = Arc::new(Mutex::new(menu));
        let status_item_arc = Arc::new(Mutex::new(status_item));

        // Spawn event handlers
        let action_tx_menu = action_tx.clone();
        let open_id = open_item.id().clone();
        let restart_id = restart_item.id().clone();
        let quit_id = quit_item.id().clone();

        let menu_rx_clone = menu_rx.clone();
        std::thread::spawn(move || {
            Self::handle_menu_events(menu_rx_clone, action_tx_menu, open_id, restart_id, quit_id);
        });

        let action_tx_tray = action_tx.clone();
        let tray_rx_clone = tray_rx.clone();
        std::thread::spawn(move || {
            Self::handle_tray_events(tray_rx_clone, action_tx_tray);
        });

        let manager = Self {
            tray,
            _menu: menu_arc,
            status_item: status_item_arc,
            _action_tx: action_tx,
            menu_rx,
            tray_rx,
        };

        debug!("System tray manager initialized successfully");
        Ok((manager, action_rx))
    }

    // DRY:FN:update_status
    /// Update the status text in the tray menu
    ///
    /// # Arguments
    ///
    /// * `status` - The new status text to display
    ///
    /// # Example
    ///
    /// ```no_run
    /// # use puppet_master::tray::TrayManager;
    /// # let (tray, _) = TrayManager::new().unwrap();
    /// tray.update_status("Running - 3 agents active");
    /// ```
    pub fn update_status(&self, status: &str) {
        let status_text = format!("Status: {}", status);
        if let Ok(item) = self.status_item.lock() {
            item.set_text(status_text);
            debug!("Updated tray status to: {}", status);
        }
    }

    /// Load icon from bytes
    ///
    /// Attempts to load the icon from embedded PNG bytes.
    fn load_icon(icon_bytes: &[u8]) -> Result<Icon> {
        // Try to load from embedded bytes
        let img = image::load_from_memory(icon_bytes)
            .context("Failed to load embedded icon from memory")?;

        let rgba = img.to_rgba8();
        let (width, height) = rgba.dimensions();
        let icon = Icon::from_rgba(rgba.into_raw(), width, height)
            .context("Failed to create icon from RGBA data")?;

        debug!(
            "Loaded tray icon from embedded bytes ({}x{})",
            width, height
        );
        Ok(icon)
    }

    /// Handle menu events in a background thread
    fn handle_menu_events(
        rx: Receiver<MenuEvent>,
        action_tx: Sender<TrayAction>,
        open_id: MenuId,
        restart_id: MenuId,
        quit_id: MenuId,
    ) {
        debug!("Menu event handler started");
        loop {
            match rx.recv() {
                Ok(event) => {
                    debug!("Menu event received: {:?}", event.id);

                    let action = if event.id == open_id {
                        Some(TrayAction::OpenGui)
                    } else if event.id == restart_id {
                        Some(TrayAction::RestartApp)
                    } else if event.id == quit_id {
                        Some(TrayAction::Quit)
                    } else {
                        None
                    };

                    if let Some(action) = action {
                        debug!("Dispatching tray action: {:?}", action);
                        if let Err(e) = action_tx.send(action) {
                            warn!("Failed to send tray action: {}", e);
                        }
                    }
                }
                Err(e) => {
                    warn!("Menu event receiver error: {}", e);
                    break;
                }
            }
        }
        debug!("Menu event handler stopped");
    }

    /// Handle tray icon click events in a background thread
    ///
    /// On Windows/Linux, left-click opens the GUI.
    /// On macOS, all clicks show the menu (standard behavior).
    fn handle_tray_events(rx: Receiver<TrayIconEvent>, _action_tx: Sender<TrayAction>) {
        debug!("Tray event handler started");
        loop {
            match rx.recv() {
                Ok(event) => {
                    debug!("Tray event received: {:?}", event);

                    // Handle left-click to open GUI (except on macOS where it shows menu)
                    #[cfg(not(target_os = "macos"))]
                    {
                        if let TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } = event
                        {
                            debug!("Left-click detected, opening GUI");
                            if let Err(e) = _action_tx.send(TrayAction::OpenGui) {
                                warn!("Failed to send OpenGui action: {}", e);
                            }
                        }
                    }

                    // On macOS, we rely on menu events only since clicks show the menu
                }
                Err(e) => {
                    warn!("Tray event receiver error: {}", e);
                    break;
                }
            }
        }
        debug!("Tray event handler stopped");
    }
}

impl Drop for TrayManager {
    fn drop(&mut self) {
        debug!("Dropping TrayManager");
    }
}

// DRY:FN:create_tray_icon
/// Create a tray icon with default settings
///
/// This is a convenience function that creates a new TrayManager
/// with the embedded icon.
///
/// # Returns
///
/// A tuple of (TrayManager, Receiver<TrayAction>)
///
/// # Errors
///
/// Returns an error if tray initialization fails
///
/// # Example
///
/// ```no_run
/// use puppet_master::tray::{create_tray_icon, TrayAction};
///
/// let (tray, rx) = create_tray_icon().expect("Failed to create tray");
///
/// // Poll for events
/// while let Ok(action) = rx.try_recv() {
///     match action {
///         TrayAction::OpenGui => println!("Opening GUI"),
///         TrayAction::RestartApp => println!("Restarting"),
///         TrayAction::Quit => break,
///     }
/// }
/// ```
pub fn create_tray_icon() -> Result<(TrayManager, Receiver<TrayAction>)> {
    TrayManager::new()
}

// DRY:FN:poll_tray_events
/// Poll for tray events without blocking
///
/// This is a helper function that attempts to receive a tray action
/// from the provided receiver without blocking.
///
/// # Arguments
///
/// * `receiver` - The receiver end of the tray action channel
///
/// # Returns
///
/// - `Some(TrayAction)` if an action is available
/// - `None` if no action is available or the channel is disconnected
///
/// # Example
///
/// ```no_run
/// use puppet_master::tray::{create_tray_icon, poll_tray_events};
///
/// let (_tray, rx) = create_tray_icon().expect("Failed to create tray");
///
/// // In your event loop
/// if let Some(action) = poll_tray_events(&rx) {
///     println!("Tray action: {:?}", action);
/// }
/// ```
pub fn poll_tray_events(receiver: &Receiver<TrayAction>) -> Option<TrayAction> {
    receiver.try_recv().ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tray_action_equality() {
        assert_eq!(TrayAction::OpenGui, TrayAction::OpenGui);
        assert_eq!(TrayAction::RestartApp, TrayAction::RestartApp);
        assert_eq!(TrayAction::Quit, TrayAction::Quit);
        assert_ne!(TrayAction::OpenGui, TrayAction::Quit);
    }

    #[test]
    fn test_icon_loading_from_bytes() {
        // Test loading from embedded bytes
        let result = TrayManager::load_icon(ICON_BYTES);
        assert!(result.is_ok(), "Icon loading should succeed");
    }

    #[test]
    fn test_icon_loading_fails_on_invalid_data() {
        let invalid_data: &[u8] = &[0xFF, 0xD8, 0xFF]; // Truncated JPEG header
        let result = TrayManager::load_icon(invalid_data);
        assert!(result.is_err(), "load_icon should fail on invalid data");
    }

    // Note: Integration tests for tray creation are platform-specific and
    // require a windowing environment, so they're omitted from unit tests.
}
