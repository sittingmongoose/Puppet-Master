; RWM Puppet Master Windows Installer
!include "MUI2.nsh"

Name "RWM Puppet Master"
OutFile "RWM-Puppet-Master-${VERSION}-setup.exe"
InstallDir "$PROGRAMFILES64\RWM Puppet Master"
RequestExecutionLevel admin

; MUI Settings
!define MUI_ICON "..\..\puppet-master-rs\icons\icon.ico"
!define MUI_UNICON "..\..\puppet-master-rs\icons\icon.ico"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

Section "Install"
    SetOutPath $INSTDIR
    File "..\..\puppet-master-rs\target\release\puppet-master.exe"
    
    ; Create desktop shortcut
    CreateShortcut "$DESKTOP\RWM Puppet Master.lnk" "$INSTDIR\puppet-master.exe"
    
    ; Create start menu
    CreateDirectory "$SMPROGRAMS\RWM Puppet Master"
    CreateShortcut "$SMPROGRAMS\RWM Puppet Master\RWM Puppet Master.lnk" "$INSTDIR\puppet-master.exe"
    CreateShortcut "$SMPROGRAMS\RWM Puppet Master\Uninstall.lnk" "$INSTDIR\uninstall.exe"
    
    ; Add to PATH
    EnVar::AddValue "PATH" "$INSTDIR"
    
    ; Write uninstaller
    WriteUninstaller "$INSTDIR\uninstall.exe"
    
    ; Registry for Add/Remove Programs
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RWMPuppetMaster" "DisplayName" "RWM Puppet Master"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RWMPuppetMaster" "UninstallString" '"$INSTDIR\uninstall.exe"'
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RWMPuppetMaster" "DisplayVersion" "${VERSION}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RWMPuppetMaster" "Publisher" "RWM"
SectionEnd

Section "Uninstall"
    Delete "$INSTDIR\puppet-master.exe"
    Delete "$INSTDIR\uninstall.exe"
    Delete "$DESKTOP\RWM Puppet Master.lnk"
    RMDir /r "$SMPROGRAMS\RWM Puppet Master"
    EnVar::DeleteValue "PATH" "$INSTDIR"
    RMDir "$INSTDIR"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RWMPuppetMaster"
SectionEnd
