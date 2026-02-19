//! Autostart (start on boot) support per OS: Linux XDG autostart, macOS LaunchAgents, Windows Run key.

use std::env;
#[cfg(any(target_os = "linux", target_os = "macos"))]
use std::fs;

/// Applies or removes start-on-boot registration for the current executable.
/// Linux: XDG autostart desktop file; macOS: LaunchAgent plist; Windows: HKCU Run key.
// DRY:FN:apply_start_on_boot
pub fn apply_start_on_boot(enabled: bool) -> Result<(), anyhow::Error> {
    let exe = env::current_exe()?;
    #[cfg(target_os = "linux")]
    apply_linux(enabled, &exe)?;
    #[cfg(target_os = "macos")]
    apply_macos(enabled, &exe)?;
    #[cfg(target_os = "windows")]
    apply_windows(enabled, &exe)?;
    #[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
    let _ = (enabled, exe);
    Ok(())
}

#[cfg(target_os = "linux")]
fn apply_linux(enabled: bool, exe: &std::path::Path) -> Result<(), anyhow::Error> {
    let dirs = directories::BaseDirs::new()
        .ok_or_else(|| anyhow::anyhow!("could not determine base directories"))?;
    let autostart_dir = dirs.config_dir().join("autostart");
    let path = autostart_dir.join("com.rwm.puppet-master.desktop");
    if enabled {
        fs::create_dir_all(&autostart_dir)?;
        let content = format!(
            "[Desktop Entry]\n\
             Type=Application\n\
             Name=Puppet Master\n\
             Exec={}\n\
             Terminal=false\n\
             X-GNOME-Autostart-enabled=true\n",
            exe.display()
        );
        fs::write(&path, content)?;
    } else if path.exists() {
        fs::remove_file(&path)?;
    }
    Ok(())
}

#[cfg(target_os = "macos")]
fn apply_macos(enabled: bool, exe: &std::path::Path) -> Result<(), anyhow::Error> {
    let dirs = directories::BaseDirs::new()
        .ok_or_else(|| anyhow::anyhow!("could not determine base directories"))?;
    let path = dirs.home_dir().join("Library/LaunchAgents/com.rwm.puppet-master.plist");
    if enabled {
        let escaped = xml_escape(exe.to_string_lossy().as_ref());
        let content = format!(
            r#"<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>LimitLoadToSessionType</key>
  <string>Aqua</string>
  <key>ProgramArguments</key>
  <array>
    <string>{}</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>Label</key>
  <string>com.rwm.puppet-master</string>
</dict>
</plist>
"#,
            escaped
        );
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::write(&path, content)?;
    } else if path.exists() {
        fs::remove_file(&path)?;
    }
    Ok(())
}

#[cfg(target_os = "macos")]
fn xml_escape(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}

#[cfg(target_os = "windows")]
fn apply_windows(enabled: bool, exe: &std::path::Path) -> Result<(), anyhow::Error> {
    use std::os::windows::ffi::OsStrExt;
    use winapi::shared::minwindef::HKEY;
    use winapi::shared::winerror::ERROR_SUCCESS;
    use winapi::um::winnt::{KEY_QUERY_VALUE, KEY_SET_VALUE, REG_SZ};

    let exe_path = exe
        .as_os_str()
        .encode_wide()
        .chain(Some(0))
        .collect::<Vec<u16>>();
    let value_name: Vec<u16> = "Puppet Master\0".encode_utf16().collect();

    unsafe {
        let key_path: Vec<u16> = "Software\\Microsoft\\Windows\\CurrentVersion\\Run\0"
            .encode_utf16()
            .collect();
        let mut hkey: HKEY = std::ptr::null_mut();
        let ret = winapi::um::winreg::RegOpenKeyExW(
            winapi::um::winreg::HKEY_CURRENT_USER,
            key_path.as_ptr(),
            0,
            KEY_SET_VALUE | KEY_QUERY_VALUE,
            &mut hkey,
        );
        if ret != ERROR_SUCCESS as i32 {
            anyhow::bail!(
                "RegOpenKeyExW failed: {}",
                ret
            );
        }
        if enabled {
            let ret = winapi::um::winreg::RegSetValueExW(
                hkey,
                value_name.as_ptr(),
                0,
                REG_SZ,
                exe_path.as_ptr() as *const _,
                (exe_path.len() * 2) as u32,
            );
            winapi::um::winreg::RegCloseKey(hkey);
            if ret != ERROR_SUCCESS as i32 {
                anyhow::bail!("RegSetValueExW failed: {}", ret);
            }
        } else {
            let _ = winapi::um::winreg::RegDeleteValueW(hkey, value_name.as_ptr());
            winapi::um::winreg::RegCloseKey(hkey);
        }
    }
    Ok(())
}
