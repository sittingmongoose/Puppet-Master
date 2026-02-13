//! RWM Puppet Master - Library crate
//! Exports modules for use in integration tests and as a library

pub mod config;
pub mod core;
pub mod doctor;
pub mod git;
pub mod interview;
pub mod logging;
pub mod platforms;
pub mod start_chain;
pub mod state;
pub mod types;
pub mod utils;
pub mod verification;

// GUI and application modules
pub mod app;
pub mod automation;
pub mod shaders;
pub mod theme;
pub mod tray;
pub mod views;
pub mod widgets;
