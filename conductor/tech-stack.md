# Technology Stack

## Core
- **Programming Language:** Rust
- **GUI Framework:** Iced

## Data & Configuration
- **Configuration:** YAML (`.puppet-master/config.yaml`)
- **State Management:** JSON (`.puppet-master/prd.json`, `setup_state.json`)

## Tooling & Automation
- **Shell Scripting:** Bash (for installers and verification scripts)
- **Node.js:** Used for MCP automation and CLI tool caching
- **GUI Automation:** Custom Rust-based automation tool with support for visual regression and dynamic resizing tests.
- **Package Management:** Cargo (Rust), NPM (Node.js)

## Platform Support
- **Operating Systems:** Windows, macOS, Linux (Native installers provided)
