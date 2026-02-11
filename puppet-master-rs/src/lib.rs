//! RWM Puppet Master - Library crate
//! Exports modules for use in integration tests and as a library

pub mod core;
pub mod platforms;
pub mod verification;
pub mod git;
pub mod config;
pub mod state;
pub mod doctor;
pub mod start_chain;
pub mod logging;
pub mod utils;
pub mod types;

// GUI and application modules
pub mod app;
pub mod theme;
pub mod views;
pub mod widgets;
pub mod tray;
