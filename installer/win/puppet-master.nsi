; Puppet Master Windows installer (NSIS)
;
; This installer copies a staged payload directory into Program Files and
; adds the install directory to PATH so `puppet-master` is available.
;
; Build-time defines (passed by scripts/build-installer.ts):
;   /DVERSION=0.1.0
;   /DOUTFILE=...
;   /DSTAGE_DIR=... (directory containing `puppet-master\...`)

!include "MUI2.nsh"
!include "LogicLib.nsh"
!include "nsDialogs.nsh"

Name "Puppet Master"
OutFile "${OUTFILE}"
InstallDir "$PROGRAMFILES64\\Puppet Master"
RequestExecutionLevel admin

; Version info
VIProductVersion "${VERSION}.0"
VIAddVersionKey "ProductName" "Puppet Master"
VIAddVersionKey "FileDescription" "RWM Puppet Master Installer"
VIAddVersionKey "ProductVersion" "${VERSION}"
VIAddVersionKey "CompanyName" "RWM"

!define MUI_ICON "..\\assets\\puppet-master.ico"
!define MUI_UNICON "..\\assets\\puppet-master.ico"

; Customize finish page text (P0-G15, CU-P0-T01, P0-G23)
!define MUI_FINISHPAGE_TITLE "Puppet Master Installation Complete!"
!define MUI_FINISHPAGE_TEXT "Puppet Master has been installed successfully.$\r$\n$\r$\nNext steps:$\r$\n  1. Open a NEW terminal window (cmd or PowerShell)$\r$\n  2. Run 'puppet-master doctor' to verify installation$\r$\n     and check platform prerequisites$\r$\n$\r$\nThe doctor command will check:$\r$\n  - Required CLI tools (cursor, codex, claude, gemini, copilot)$\r$\n  - Platform authentication status$\r$\n  - Missing configuration$\r$\n$\r$\nClick 'Finish' to complete the installation."

; Option to run puppet-master doctor after install
!define MUI_FINISHPAGE_RUN "$INSTDIR\bin\puppet-master.cmd"
!define MUI_FINISHPAGE_RUN_TEXT "Run 'puppet-master doctor' now (opens new terminal)"
!define MUI_FINISHPAGE_RUN_PARAMETERS "doctor"

; Option to show README / help
!define MUI_FINISHPAGE_SHOWREADME
!define MUI_FINISHPAGE_SHOWREADME_TEXT "Show CLI installation instructions"
!define MUI_FINISHPAGE_SHOWREADME_FUNCTION ShowCLIInstructions

; Variables for CLI installation page
Var CLIInstallDialog
Var CLIInstallCheckbox

; Modern UI pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
Page Custom CLIInstallPageCreate CLIInstallPageLeave
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

Section "Install"
  SetOutPath "$INSTDIR"

  ; Copy payload
  File /r "${STAGE_DIR}\\puppet-master\\*.*"
  
  ; Copy PowerShell helper script for CLI installation
  SetOutPath "$INSTDIR\scripts"
  File "scripts\install-clis.ps1"

  ; Copy GUI launchers (VBS runs without console; BAT kept for CLI/script use)
  SetOutPath "$INSTDIR"
  File "scripts\Launch-Puppet-Master-GUI.bat"
  File "scripts\Launch-Puppet-Master-GUI.vbs"
  File "..\assets\puppet-master.ico"
  File "${STAGE_DIR}\\puppet-master\\puppet-master.png"

  ; Create an uninstaller
  WriteUninstaller "$INSTDIR\\Uninstall.exe"
  
  ; Start Menu and Desktop shortcuts use VBS so GUI launches without a console window
  CreateDirectory "$SMPROGRAMS\Puppet Master"
  CreateShortcut "$SMPROGRAMS\Puppet Master\Puppet Master.lnk" "$INSTDIR\Launch-Puppet-Master-GUI.vbs" "" "$INSTDIR\puppet-master.ico" 0
  
  ; Create Desktop shortcut (optional)
  CreateShortcut "$DESKTOP\Puppet Master.lnk" "$INSTDIR\Launch-Puppet-Master-GUI.vbs" "" "$INSTDIR\puppet-master.ico" 0

  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Puppet Master" "DisplayName" "Puppet Master"
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Puppet Master" "UninstallString" "$INSTDIR\\Uninstall.exe"
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Puppet Master" "DisplayIcon" "$INSTDIR\\puppet-master.ico"
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Puppet Master" "DisplayVersion" "${VERSION}"
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Puppet Master" "Publisher" "RWM"

  ; Add install dir to PATH (system-wide)
  ; NOTE: We use the registry directly to avoid requiring extra NSIS plugins.
  ReadRegStr $0 HKLM "SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment" "Path"
  StrCpy $1 "$INSTDIR\\bin"
  ${If} $0 != ""
    ; If PATH does not already contain $INSTDIR, append it
    Push $0
    Push $1
    Call StrStr
    Pop $2
    ${If} $2 == ""
      StrCpy $0 "$0;$1"
      WriteRegExpandStr HKLM "SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment" "Path" "$0"
      System::Call 'Kernel32::SendMessageTimeout(p 0xffff, i 0x1A, i 0, t "Environment", i 0, i 5000, *i .r0)'
    ${EndIf}
  ${Else}
    WriteRegExpandStr HKLM "SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment" "Path" "$1"
    System::Call 'Kernel32::SendMessageTimeout(p 0xffff, i 0x1A, i 0, t "Environment", i 0, i 5000, *i .r0)'
  ${EndIf}
SectionEnd

Section "Uninstall"
  ; Remove shortcuts
  Delete "$SMPROGRAMS\Puppet Master\Puppet Master.lnk"
  RMDir "$SMPROGRAMS\Puppet Master"
  Delete "$DESKTOP\Puppet Master.lnk"
  DeleteRegKey HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Puppet Master"
  
  ; Remove installed files
  RMDir /r "$INSTDIR"

  ; PATH cleanup is intentionally omitted in v1 (safe uninstall without editing PATH).
SectionEnd

; --- Helper functions ---

; Show CLI installation instructions in a message box
Function ShowCLIInstructions
  MessageBox MB_OK|MB_ICONINFORMATION "Platform CLI Installation:$\r$\n$\r$\n\
Cursor CLI:$\r$\n\
  curl https://cursor.com/install -fsSL | bash$\r$\n\
  Installs both 'agent' and 'cursor-agent' to ~/.local/bin$\r$\n$\r$\n\
Codex CLI:$\r$\n\
  npm install -g @openai/codex-cli$\r$\n\
  Or download from: https://github.com/openai/codex-cli$\r$\n$\r$\n\
Claude Code CLI:$\r$\n\
  npm install -g @anthropic-ai/claude-code-cli$\r$\n\
  Or download from: https://github.com/anthropics/claude-code-cli$\r$\n\
  Requires: ANTHROPIC_API_KEY environment variable$\r$\n$\r$\n\
Gemini CLI:$\r$\n\
  npm install -g @google/gemini-cli$\r$\n\
  Requires: GEMINI_API_KEY or GOOGLE_APPLICATION_CREDENTIALS$\r$\n$\r$\n\
GitHub Copilot CLI:$\r$\n\
  npm install -g @github/copilot-cli$\r$\n\
  Requires: GitHub Copilot subscription and GH_TOKEN/GITHUB_TOKEN$\r$\n$\r$\n\
After installing platform CLIs, run 'puppet-master doctor' to verify."
FunctionEnd

; Custom page for CLI installation (Phase 5.1)
Function CLIInstallPageCreate
  !insertmacro MUI_HEADER_TEXT "Install AI Platform CLIs" "Select platform CLIs to install automatically"
  
  nsDialogs::Create 1018
  Pop $CLIInstallDialog
  
  ${If} $CLIInstallDialog == error
    Abort
  ${EndIf}
  
  ; Check which CLIs are missing using PowerShell script
  ; Set environment variable so script knows install directory
  System::Call 'Kernel32::SetEnvironmentVariable(t "PuppetMasterInstallDir", t "$INSTDIR")'
  
  ; Run PowerShell script to check missing CLIs
  ; Note: We'll show a simple checkbox to offer installation
  ; The actual checking happens in the leave function
  
  ; Create info label
  ${NSD_CreateLabel} 0 10u 100% 40u "After installing Puppet Master, you may want to install platform CLIs:$\r$\n$\r$\n- Codex CLI (npm install -g @openai/codex)$\r$\n- Claude Code CLI (PowerShell installer)$\r$\n- Gemini CLI (npm install -g @google/gemini-cli)$\r$\n- GitHub Copilot CLI (npm install -g @github/copilot)$\r$\n$\r$\nCursor CLI requires WSL or Git Bash (no Windows native installer)."
  Pop $0
  
  ; Create checkbox to offer running installation helper
  ${NSD_CreateCheckbox} 0 120u 100% 12u "Run CLI installation helper after installation"
  Pop $CLIInstallCheckbox
  ${NSD_Check} $CLIInstallCheckbox ; Check by default
  
  nsDialogs::Show
FunctionEnd

Function CLIInstallPageLeave
  ${NSD_GetState} $CLIInstallCheckbox $0
  
  ${If} $0 == 1
    ; User wants to install CLIs - launch PowerShell helper script
    ; Note: This will open a new window for user interaction
    ExecWait 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$INSTDIR\scripts\install-clis.ps1"'
  ${EndIf}
FunctionEnd

; StrStr implementation (haystack on stack, needle on stack)
; Returns substring or empty string.
Function StrStr
  Exch $R1 ; needle
  Exch
  Exch $R0 ; haystack
  Push $R2
  Push $R3
  Push $R4
  StrLen $R2 $R1
  StrCpy $R3 0
  loop:
    StrCpy $R4 $R0 $R2 $R3
    StrCmp $R4 $R1 found
    StrCmp $R4 "" notfound
    IntOp $R3 $R3 + 1
    Goto loop
  found:
    StrCpy $R0 $R0 "" $R3
    Goto done
  notfound:
    StrCpy $R0 ""
  done:
    Pop $R4
    Pop $R3
    Pop $R2
    Pop $R1
    Exch $R0
FunctionEnd
