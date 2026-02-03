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
  ; Kill any running Puppet Master processes to unlock files for overwrite
  DetailPrint "Stopping running Puppet Master processes..."
  nsExec::ExecToLog 'taskkill /f /im puppet-master-gui.exe'
  nsExec::ExecToLog 'taskkill /f /im puppet-master.exe'
  ; Kill node.exe running from the install directory (Express server holds file locks)
  nsExec::ExecToLog 'wmic process where "ExecutablePath like ''%Puppet Master%''" call terminate'
  ; Additional process cleanup: kill by window title
  nsExec::ExecToLog 'taskkill /f /fi "WINDOWTITLE eq Puppet Master*"'
  ; Wait for processes to fully exit and release file handles
  Sleep 3000

  SetOutPath "$INSTDIR"

  ; Copy payload (exclude better-sqlite3 .node binaries to prevent write errors)
  ; Note: Use * (not *.*) to match all files including those without extensions
  File /r /x "better_sqlite3.node" "${STAGE_DIR}\\puppet-master\\*"
  ; Ensure bin/ is included (Start Menu launcher expects bin\puppet-master.cmd)
  File /r "${STAGE_DIR}\\puppet-master\\bin\\*"
  
  ; Copy better-sqlite3 .node binaries separately with enhanced retry logic
  ; Try up to 5 times with increasing delays to handle file-in-use scenarios
  DetailPrint "Copying better-sqlite3 native module..."
  ClearErrors
  CopyFiles /SILENT "${STAGE_DIR}\\puppet-master\\app\\node_modules\\better-sqlite3\\build\\Release\\better_sqlite3.node" "$INSTDIR\\app\\node_modules\\better-sqlite3\\build\\Release\\better_sqlite3.node"
  ${If} ${Errors}
    DetailPrint "Retry 1/4 (waiting 2s)..."
    Sleep 2000
    ClearErrors
    CopyFiles /SILENT "${STAGE_DIR}\\puppet-master\\app\\node_modules\\better-sqlite3\\build\\Release\\better_sqlite3.node" "$INSTDIR\\app\\node_modules\\better-sqlite3\\build\\Release\\better_sqlite3.node"
    ${If} ${Errors}
      DetailPrint "Retry 2/4 (waiting 4s)..."
      Sleep 4000
      ClearErrors
      CopyFiles /SILENT "${STAGE_DIR}\\puppet-master\\app\\node_modules\\better-sqlite3\\build\\Release\\better_sqlite3.node" "$INSTDIR\\app\\node_modules\\better-sqlite3\\build\\Release\\better_sqlite3.node"
      ${If} ${Errors}
        DetailPrint "Retry 3/4 (waiting 6s)..."
        Sleep 6000
        ClearErrors
        CopyFiles /SILENT "${STAGE_DIR}\\puppet-master\\app\\node_modules\\better-sqlite3\\build\\Release\\better_sqlite3.node" "$INSTDIR\\app\\node_modules\\better-sqlite3\\build\\Release\\better_sqlite3.node"
        ${If} ${Errors}
          DetailPrint "Retry 4/4 - using MoveFileEx delayed rename..."
          Sleep 8000
          ClearErrors
          ; Last resort: use Windows delayed file replacement (applied on next reboot if still locked)
          Rename /REBOOTOK "${STAGE_DIR}\\puppet-master\\app\\node_modules\\better-sqlite3\\build\\Release\\better_sqlite3.node" "$INSTDIR\\app\\node_modules\\better-sqlite3\\build\\Release\\better_sqlite3.node"
        ${EndIf}
      ${EndIf}
    ${EndIf}
  ${EndIf}
  
  ; Rebuild native modules with bundled Node to ensure ABI compatibility
  DetailPrint "Rebuilding native modules for bundled Node..."
  nsExec::ExecToLog '"$INSTDIR\\node\\node.exe" "$INSTDIR\\node\\node_modules\\npm\\bin\\npm-cli.js" rebuild --prefix "$INSTDIR\\app"'
  
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
  CreateDirectory "$SMPROGRAMS\Puppet Master"
  CreateShortcut "$SMPROGRAMS\Puppet Master\Puppet Master.lnk" "$INSTDIR\Launch-Puppet-Master-GUI.vbs" "" "$INSTDIR\puppet-master.ico" 0
  ; Debug shortcut: runs with visible console so you can see errors if "nothing happens"
  CreateShortcut "$SMPROGRAMS\Puppet Master\Puppet Master (Debug).lnk" "$INSTDIR\Launch-Puppet-Master-GUI-Debug.bat" "" "$INSTDIR\puppet-master.ico" 0

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
  ; Kill any running Puppet Master processes before uninstalling
  DetailPrint "Stopping running Puppet Master processes..."
  nsExec::ExecToLog 'taskkill /f /im puppet-master-gui.exe'
  nsExec::ExecToLog 'taskkill /f /im puppet-master.exe'
  nsExec::ExecToLog 'wmic process where "ExecutablePath like ''%Puppet Master%''" call terminate'
  nsExec::ExecToLog 'taskkill /f /fi "WINDOWTITLE eq Puppet Master*"'
  Sleep 3000

  ; Remove shortcuts
  Delete "$SMPROGRAMS\Puppet Master\Puppet Master.lnk"
  Delete "$SMPROGRAMS\Puppet Master\Puppet Master (Debug).lnk"
  RMDir "$SMPROGRAMS\Puppet Master"
  Delete "$DESKTOP\Puppet Master.lnk"
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
