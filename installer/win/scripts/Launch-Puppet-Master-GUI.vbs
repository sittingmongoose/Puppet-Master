' Launch Puppet Master GUI without showing a console window.
' This script is run by Start Menu and Desktop shortcuts.
' It executes bin\puppet-master.cmd gui with the window hidden (style 0).

Set fso = CreateObject("Scripting.FileSystemObject")
Set WshShell = CreateObject("WScript.Shell")

' Use the directory containing this script as the install root
scriptPath = WScript.ScriptFullName
installDir = fso.GetParentFolderName(scriptPath)

' Set CWD to user's home directory (writable), NOT Program Files (read-only)
WshShell.CurrentDirectory = WshShell.ExpandEnvironmentStrings("%USERPROFILE%")

' Prefer the native desktop app if bundled (Tauri).
guiExe = fso.BuildPath(fso.BuildPath(installDir, "app"), "puppet-master-gui.exe")
If fso.FileExists(guiExe) Then
  WshShell.Run """" & guiExe & """", 0, False
Else
  ' Fallback: start the web UI via CLI.
  cmd = "cmd /c """ & fso.BuildPath(installDir, "bin\puppet-master.cmd") & """ gui"
  WshShell.Run cmd, 0, False
End If
