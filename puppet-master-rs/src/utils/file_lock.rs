//! File Locking
//!
//! Advisory file locking for coordinating access to shared files.
//! Uses platform-specific locking mechanisms (flock on Unix, LockFile on Windows).

use anyhow::{Context, Result};
use std::fs::{File, OpenOptions};
use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};

#[cfg(unix)]
use std::os::unix::io::AsRawFd;

/// Advisory file lock with timeout
pub struct FileLock {
    lock_file: File,
    lock_path: PathBuf,
}

impl FileLock {
    /// Acquire a file lock with timeout
    ///
    /// Creates a `.lock` file adjacent to the target file.
    /// Blocks until lock is acquired or timeout expires.
    pub fn acquire(path: impl AsRef<Path>, timeout: Duration) -> Result<Self> {
        let path = path.as_ref();
        let lock_path = Self::lock_path(path);

        // Create parent directory if needed
        if let Some(parent) = lock_path.parent() {
            std::fs::create_dir_all(parent)
                .with_context(|| format!("Failed to create lock directory {}", parent.display()))?;
        }

        let start = Instant::now();

        loop {
            match Self::try_acquire(&lock_path) {
                Ok(lock_file) => {
                    log::trace!("Acquired file lock: {}", lock_path.display());
                    return Ok(Self {
                        lock_file,
                        lock_path,
                    });
                }
                Err(_) => {
                    if start.elapsed() >= timeout {
                        anyhow::bail!(
                            "Failed to acquire file lock {} within {:?}",
                            lock_path.display(),
                            timeout
                        );
                    }
                    std::thread::sleep(Duration::from_millis(50));
                }
            }
        }
    }

    /// Try to acquire the lock immediately
    fn try_acquire(lock_path: &Path) -> Result<File> {
        let file = OpenOptions::new()
            .create(true)
            .read(true)
            .write(true)
            .open(lock_path)
            .with_context(|| format!("Failed to open lock file {}", lock_path.display()))?;

        #[cfg(unix)]
        {
            // Try to acquire exclusive lock (non-blocking)
            let fd = file.as_raw_fd();
            let result = unsafe { libc::flock(fd, libc::LOCK_EX | libc::LOCK_NB) };

            if result != 0 {
                anyhow::bail!("Failed to acquire flock");
            }
        }

        #[cfg(windows)]
        {
            use std::os::windows::io::AsRawHandle;
            use winapi::um::fileapi::LockFile;

            let handle = file.as_raw_handle() as *mut winapi::ctypes::c_void;
            let result = unsafe { LockFile(handle, 0, 0, 1, 0) };

            if result == 0 {
                anyhow::bail!("Failed to acquire Windows lock");
            }
        }

        Ok(file)
    }

    /// Generate lock file path
    fn lock_path(path: &Path) -> PathBuf {
        let mut lock_path = path.as_os_str().to_owned();
        lock_path.push(".lock");
        PathBuf::from(lock_path)
    }

    /// Get the lock file path
    pub fn path(&self) -> &Path {
        &self.lock_path
    }
}

impl Drop for FileLock {
    fn drop(&mut self) {
        #[cfg(unix)]
        {
            // Release flock
            let fd = self.lock_file.as_raw_fd();
            unsafe {
                libc::flock(fd, libc::LOCK_UN);
            }
        }

        #[cfg(windows)]
        {
            use std::os::windows::io::AsRawHandle;
            use winapi::um::fileapi::UnlockFile;

            let handle = self.lock_file.as_raw_handle() as *mut winapi::ctypes::c_void;
            unsafe {
                UnlockFile(handle, 0, 0, 1, 0);
            }
        }

        // Clean up lock file
        if let Err(e) = std::fs::remove_file(&self.lock_path) {
            log::warn!("Failed to remove lock file: {}", e);
        }

        log::trace!("Released file lock: {}", self.lock_path.display());
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;
    use std::thread;
    use tempfile::TempDir;

    #[test]
    fn test_acquire_and_release() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("test.txt");
        std::fs::write(&file_path, b"test").unwrap();

        let lock = FileLock::acquire(&file_path, Duration::from_secs(1)).unwrap();
        assert!(lock.path().exists());
        drop(lock);

        // Lock file should be removed
        std::thread::sleep(Duration::from_millis(100));
    }

    #[test]
    fn test_concurrent_locks() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = Arc::new(temp_dir.path().join("test.txt"));
        std::fs::write(file_path.as_ref(), b"test").unwrap();

        let file_path1 = file_path.clone();
        let file_path2 = file_path.clone();

        let handle1 = thread::spawn(move || {
            let _lock = FileLock::acquire(file_path1.as_ref(), Duration::from_secs(2)).unwrap();
            thread::sleep(Duration::from_millis(500));
        });

        // Give first thread time to acquire lock
        thread::sleep(Duration::from_millis(100));

        let handle2 = thread::spawn(move || {
            // This should wait until first lock is released
            let start = Instant::now();
            let _lock = FileLock::acquire(file_path2.as_ref(), Duration::from_secs(2)).unwrap();
            let elapsed = start.elapsed();
            assert!(
                elapsed >= Duration::from_millis(400),
                "Second lock acquired too quickly: {:?}",
                elapsed
            );
        });

        handle1.join().unwrap();
        handle2.join().unwrap();
    }

    #[test]
    fn test_timeout() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = Arc::new(temp_dir.path().join("test.txt"));
        std::fs::write(file_path.as_ref(), b"test").unwrap();

        let file_path1 = file_path.clone();
        let file_path2 = file_path.clone();

        let handle1 = thread::spawn(move || {
            let _lock = FileLock::acquire(file_path1.as_ref(), Duration::from_secs(5)).unwrap();
            thread::sleep(Duration::from_secs(2));
        });

        // Give first thread time to acquire lock
        thread::sleep(Duration::from_millis(100));

        let handle2 = thread::spawn(move || {
            // This should timeout
            let result = FileLock::acquire(file_path2.as_ref(), Duration::from_millis(500));
            assert!(result.is_err());
        });

        handle1.join().unwrap();
        handle2.join().unwrap();
    }
}
