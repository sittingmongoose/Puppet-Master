//! Utility modules
//!
//! Common utilities for file operations, process management, and more.

pub mod atomic_writer;
pub mod file_lock;
pub mod process;
pub mod project_paths;

pub use atomic_writer::AtomicWriter;
pub use file_lock::FileLock;
pub use process::{ProcessRegistry, kill_process, kill_process_tree};
pub use project_paths::{
    agents_dir, backups_dir, checkpoints_dir, derive_project_root, evidence_dir,
    get_relative_to_root, initialize_puppet_master_dirs, is_directory_writable,
    is_within_project_root, logs_dir, memory_dir, puppet_master_dir, resolve_paths_under_root,
    resolve_under_project_root, resolve_working_directory, resolve_writable_state_root, usage_dir,
};
