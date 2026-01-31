# Check command – status (GUI / Tauri / launcher)

**Date:** 2026-01-31

## Done

1. **Tauri from project**
   - `resolveTauriGuiBinary()` in `src/cli/commands/gui.ts` now looks for the Tauri binary in the project when there is no install root: `src-tauri/target/release/puppet-master` (Linux) or `puppet-master.exe` (Windows). Running `node dist/cli/index.js gui` from the repo will open the Tauri window when the binary exists.

2. **Project launcher**
   - Added `run-puppet-master-gui.sh` in the project root. Run `./run-puppet-master-gui.sh` to start the GUI (server + open browser or Tauri). Run `./run-puppet-master-gui.sh --install-desktop` to add “Puppet Master” to the application menu (uses `~/.local/share/applications/com.rwm.puppet-master-dev.desktop`).

3. **Desktop entry**
   - Desktop entry installed so “Puppet Master” appears in the app menu and runs the project launcher (no system install required).

4. **Check cleanup**
   - `.test-cache` and `.test-quota` removed when done (none were present).

## Not done (environment limits)

- **Tauri build:** Building the Tauri desktop binary on this host failed: `pkg-config` and GTK/WebKit dev packages are required (`apt install pkg-config libwebkit2gtk-4.1-dev ...`). Without those, the Tauri window is not built; the GUI still opens in the browser when you run the launcher.
- **System install (.deb):** No `.deb` was built or installed; the app runs from the project via the launcher and desktop entry above.

## How to run the app

- **From app menu:** Open “Puppet Master” in the application menu (if you ran `./run-puppet-master-gui.sh --install-desktop`).
- **From project:** `./run-puppet-master-gui.sh` or `node dist/cli/index.js gui`.  
The server starts and the UI opens in the browser (or in the Tauri window if you build Tauri).
