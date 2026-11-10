// Application build identity: a digest of the sources this binary was built from.
// The running app reports it (testkit::app_build_id); a runner compares it with the working tree.
use sha2::{Digest, Sha256};
use std::{fs, path::Path};
fn main() {
    let mut files: Vec<String> = vec!["Cargo.toml".into(), "Cargo.lock".into(), "build.rs".into()];
    for e in fs::read_dir("src").unwrap() { files.push(e.unwrap().path().to_string_lossy().into_owned()); }
    files.sort();
    let mut h = Sha256::new();
    for f in &files {
        println!("cargo:rerun-if-changed={f}");
        if Path::new(f).exists() { h.update(f.as_bytes()); h.update([0]); h.update(fs::read(f).unwrap()); h.update([0]); }
    }
    let hex: String = h.finalize().iter().map(|b| format!("{b:02x}")).collect();
    println!("cargo:rustc-env=PROBE_APP_BUILD_ID={hex}");
}
