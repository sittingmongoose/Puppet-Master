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

; Modern UI pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

Section "Install"
  SetOutPath "$INSTDIR"

  ; Copy payload
  File /r "${STAGE_DIR}\\puppet-master\\*.*"

  ; Create an uninstaller
  WriteUninstaller "$INSTDIR\\Uninstall.exe"

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

