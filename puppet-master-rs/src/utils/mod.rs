//! Utility modules
//!
//! Common utilities for file operations, process management, and more.

pub mod atomic_writer;
pub mod file_lock;
pub mod process;
pub mod project_paths;

pub use atomic_writer::AtomicWriter;
pub use file_lock::FileLock;
pub use process::{kill_process, kill_process_tree, ProcessRegistry};
pub use project_paths::{
    derive_project_root, resolve_under_project_root, resolve_working_directory,
    puppet_master_dir, evidence_dir, logs_dir, checkpoints_dir, usage_dir,
    agents_dir, memory_dir, backups_dir, initialize_puppet_master_dirs,
    is_within_project_root, get_relative_to_root, resolve_paths_under_root,
};
