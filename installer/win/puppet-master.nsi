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
!define MUI_FINISHPAGE_TEXT "Puppet Master has been installed successfully.$\r$\n$\r$\nClick 'Launch Puppet Master' below to open the GUI. On first launch, a setup wizard will guide you through installing AI platform CLIs.$\r$\n$\r$\nYou can also launch from the Start Menu or Desktop shortcut.$\r$\n$\r$\nOptional: Open a terminal and run 'puppet-master doctor' to verify your setup."

; Option to launch Puppet Master GUI after install (checked by default when MUI_FINISHPAGE_RUN is defined)
!define MUI_FINISHPAGE_RUN "$INSTDIR\Launch-Puppet-Master-GUI.vbs"
!define MUI_FINISHPAGE_RUN_TEXT "Launch Puppet Master now (opens the GUI)"

; Modern UI pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

Section "Install"
  ; Ensure shortcuts are created for all users (not just the elevated installer user).
  ; Without this, installs performed as admin can create shortcuts only in that user's profile.
  SetShellVarContext all

  ; Kill any running Puppet Master processes to unlock files for overwrite
  DetailPrint "Stopping running Puppet Master processes..."
  nsExec::ExecToStack 'taskkill /f /im "puppet-master-gui.exe"'
  Pop $0 ; exit code (ignored)
  Pop $1 ; output
  ClearErrors
  nsExec::ExecToStack 'taskkill /f /im "puppet-master.exe"'
  Pop $0
  Pop $1
  ClearErrors
  ; Kill processes by explicit name only (avoid matching/killing the installer itself)
  nsExec::ExecToStack 'powershell -NoProfile -ExecutionPolicy Bypass -Command "Stop-Process -Name puppet-master-gui -Force -ErrorAction SilentlyContinue; Stop-Process -Name puppet-master -Force -ErrorAction SilentlyContinue"'
  Pop $0
  Pop $1
  ClearErrors
  ; Wait for processes to fully exit and release file handles
  Sleep 3000

  SetOutPath "$INSTDIR"

  ; Copy payload (include better_sqlite3.node; taskkill above reduces file-in-use on upgrade)
  ; Note: Use * (not *.*) to match all files including those without extensions
  File /r "${STAGE_DIR}\\puppet-master\\*"
  ; Ensure bin/ is included (Start Menu launcher expects bin\puppet-master.cmd)
  File /r "${STAGE_DIR}\\puppet-master\\bin\\*"
  
  ; NOTE: Native modules (better-sqlite3) were already rebuilt at build-time with the bundled Node.
  ; Installing them again would use system tools and compilers, breaking ABI compatibility.
  ; We only validate that the pre-built binary exists.
  DetailPrint "Verifying pre-built native modules..."
  
  ; Validate better_sqlite3.node exists (critical for database functionality)
  ${If} ${FileExists} "$INSTDIR\\app\\node_modules\\better-sqlite3\\build\\Release\\better_sqlite3.node"
    DetailPrint "  ✓ better-sqlite3.node found"
  ${Else}
    MessageBox MB_OK|MB_ICONSTOP "Critical: better-sqlite3.node missing.$\r$\n$\r$\nThis indicates a packaging/build error, not a user issue.$\r$\n$\r$\nPlease report this bug."
    Abort "Missing better_sqlite3.node - build-time packaging failed."
  ${EndIf}
  
  ClearErrors
  
  ; Copy GUI launchers (VBS runs without console; BAT for CLI/script; Debug BAT keeps console open)
  SetOutPath "$INSTDIR"
  File "scripts\Launch-Puppet-Master-GUI.bat"
  File "scripts\Launch-Puppet-Master-GUI-Debug.bat"
  File "scripts\Launch-Puppet-Master-GUI.vbs"
  File "..\assets\puppet-master.ico"
  File "${STAGE_DIR}\\puppet-master\\puppet-master.png"

  ; Create an uninstaller
  WriteUninstaller "$INSTDIR\\Uninstall.exe"
  
  ; Start Menu and Desktop shortcuts use VBS so GUI launches without a console window
  CreateDirectory "$COMMONPROGRAMS\Puppet Master"
  CreateShortcut "$COMMONPROGRAMS\Puppet Master\Puppet Master.lnk" "$INSTDIR\Launch-Puppet-Master-GUI.vbs" "" "$INSTDIR\puppet-master.ico" 0
  ; Debug shortcut: runs with visible console so you can see errors if "nothing happens"
  CreateShortcut "$COMMONPROGRAMS\Puppet Master\Puppet Master (Debug).lnk" "$INSTDIR\Launch-Puppet-Master-GUI-Debug.bat" "" "$INSTDIR\puppet-master.ico" 0

  ; Create Desktop shortcut (optional)
  CreateShortcut "$COMMONDESKTOPDIRECTORY\Puppet Master.lnk" "$INSTDIR\Launch-Puppet-Master-GUI.vbs" "" "$INSTDIR\puppet-master.ico" 0

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
  ; Ensure uninstall removes the all-users shortcuts created at install time.
  SetShellVarContext all

  ; Kill any running Puppet Master processes before uninstalling
  DetailPrint "Stopping running Puppet Master processes..."
  nsExec::ExecToStack 'taskkill /f /im "puppet-master-gui.exe"'
  Pop $0 ; exit code (ignored)
  Pop $1 ; output
  ClearErrors
  nsExec::ExecToStack 'taskkill /f /im "puppet-master.exe"'
  Pop $0
  Pop $1
  ClearErrors
  nsExec::ExecToStack 'powershell -NoProfile -ExecutionPolicy Bypass -Command "Stop-Process -Name puppet-master-gui -Force -ErrorAction SilentlyContinue; Stop-Process -Name puppet-master -Force -ErrorAction SilentlyContinue"'
  Pop $0
  Pop $1
  ClearErrors
  Sleep 3000

  ; Remove shortcuts
  Delete "$COMMONPROGRAMS\Puppet Master\Puppet Master.lnk"
  Delete "$COMMONPROGRAMS\Puppet Master\Puppet Master (Debug).lnk"
  RMDir "$COMMONPROGRAMS\Puppet Master"
  Delete "$COMMONDESKTOPDIRECTORY\Puppet Master.lnk"
  DeleteRegKey HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Puppet Master"
  
  ; Remove installed files
  RMDir /r "$INSTDIR"

  ; PATH cleanup is intentionally omitted in v1 (safe uninstall without editing PATH).
SectionEnd

; --- Helper functions ---

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
