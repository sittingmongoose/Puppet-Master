; RWM Puppet Master Windows Installer
; Installs to Program Files, creates shortcuts, adds to PATH, and registers in Add/Remove Programs
!include "MUI2.nsh"
!include "LogicLib.nsh"

; Allow caller to override Cargo target dir (for custom target-dir config).
!ifndef TARGET_DIR
!define TARGET_DIR "..\..\puppet-master-rs\target"
!endif

Name "RWM Puppet Master"
OutFile "RWM-Puppet-Master-${VERSION}-setup.exe"
InstallDir "$PROGRAMFILES64\RWM Puppet Master"
RequestExecutionLevel admin

; Version info
VIProductVersion "${VERSION}.0"
VIAddVersionKey "ProductName" "RWM Puppet Master"
VIAddVersionKey "FileDescription" "RWM Puppet Master Installer"
VIAddVersionKey "ProductVersion" "${VERSION}"
VIAddVersionKey "CompanyName" "RWM"

; MUI Settings (icon from shared installer assets)
!define MUI_ICON "..\assets\puppet-master.ico"
!define MUI_UNICON "..\assets\puppet-master.ico"

; Finish page options
!define MUI_FINISHPAGE_TITLE "RWM Puppet Master Installation Complete!"
!define MUI_FINISHPAGE_TEXT "RWM Puppet Master has been installed successfully.$\r$\n$\r$\nThe application is now available in your Start Menu and Desktop.$\r$\n$\r$\nNote: The installation directory has been added to your system PATH."
!define MUI_FINISHPAGE_RUN "$INSTDIR\puppet-master.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Launch RWM Puppet Master now"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

Section "Install"
    ; Create shortcuts for all users (not just elevated admin)
    SetShellVarContext all
    
    SetOutPath $INSTDIR
    
    ; Copy the binary
    File "${TARGET_DIR}\release\puppet-master.exe"
    
    ; Verify the binary was copied
    ${If} ${FileExists} "$INSTDIR\puppet-master.exe"
        DetailPrint "✓ Binary installed successfully"
    ${Else}
        MessageBox MB_OK|MB_ICONSTOP "Error: Binary not found at source path.$\r$\n$\r$\nExpected: ${TARGET_DIR}\release\puppet-master.exe"
        Abort "Installation failed - binary not found"
    ${EndIf}
    
    ; Create desktop shortcut
    CreateShortcut "$DESKTOP\RWM Puppet Master.lnk" "$INSTDIR\puppet-master.exe" "" "$INSTDIR\puppet-master.exe" 0
    
    ; Create start menu folder and shortcuts
    CreateDirectory "$SMPROGRAMS\RWM Puppet Master"
    CreateShortcut "$SMPROGRAMS\RWM Puppet Master\RWM Puppet Master.lnk" "$INSTDIR\puppet-master.exe" "" "$INSTDIR\puppet-master.exe" 0
    CreateShortcut "$SMPROGRAMS\RWM Puppet Master\Uninstall.lnk" "$INSTDIR\uninstall.exe"
    
    ; Write uninstaller
    WriteUninstaller "$INSTDIR\uninstall.exe"
    
    ; Registry for Add/Remove Programs
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RWMPuppetMaster" "DisplayName" "RWM Puppet Master"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RWMPuppetMaster" "UninstallString" '"$INSTDIR\uninstall.exe"'
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RWMPuppetMaster" "DisplayIcon" "$INSTDIR\puppet-master.exe"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RWMPuppetMaster" "DisplayVersion" "${VERSION}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RWMPuppetMaster" "Publisher" "RWM"
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RWMPuppetMaster" "NoModify" 1
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RWMPuppetMaster" "NoRepair" 1
    
    ; Add install directory to system PATH
    DetailPrint "Adding to system PATH..."
    ReadRegStr $0 HKLM "SYSTEM\CurrentControlSet\Control\Session Manager\Environment" "Path"
    
    ; Check if already in PATH
    ${If} $0 != ""
        ; Search for INSTDIR in PATH
        Push $0
        Push $INSTDIR
        Call StrStr
        Pop $1
        
        ${If} $1 == ""
            ; Not in PATH, add it
            StrCpy $0 "$0;$INSTDIR"
            WriteRegExpandStr HKLM "SYSTEM\CurrentControlSet\Control\Session Manager\Environment" "Path" "$0"
            DetailPrint "✓ Added to PATH: $INSTDIR"
            
            ; Broadcast WM_SETTINGCHANGE to notify system of PATH change
            System::Call 'Kernel32::SendMessageTimeout(p 0xffff, i 0x1A, i 0, t "Environment", i 0, i 5000, *i .r0)'
        ${Else}
            DetailPrint "Already in PATH: $INSTDIR"
        ${EndIf}
    ${Else}
        ; PATH is empty, create it
        WriteRegExpandStr HKLM "SYSTEM\CurrentControlSet\Control\Session Manager\Environment" "Path" "$INSTDIR"
        DetailPrint "✓ Added to PATH: $INSTDIR"
        System::Call 'Kernel32::SendMessageTimeout(p 0xffff, i 0x1A, i 0, t "Environment", i 0, i 5000, *i .r0)'
    ${EndIf}
    
    ; Notify Windows shell to refresh shortcuts
    System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0, i 0, i 0) v'
SectionEnd

Section "Uninstall"
    ; Uninstall for all users
    SetShellVarContext all
    
    ; Remove files
    Delete "$INSTDIR\puppet-master.exe"
    Delete "$INSTDIR\uninstall.exe"
    
    ; Remove shortcuts
    Delete "$DESKTOP\RWM Puppet Master.lnk"
    RMDir /r "$SMPROGRAMS\RWM Puppet Master"
    
    ; Remove installation directory
    RMDir "$INSTDIR"
    
    ; Remove registry entries
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RWMPuppetMaster"
    
    ; Note: Intentionally NOT removing from PATH to avoid breaking user scripts
    ; Users can manually remove from PATH if desired
    
    ; Notify Windows shell
    System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0, i 0, i 0) v'
SectionEnd

; Helper function: Search for substring in string
; Stack: haystack, needle -> result (empty if not found, rest of string if found)
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
