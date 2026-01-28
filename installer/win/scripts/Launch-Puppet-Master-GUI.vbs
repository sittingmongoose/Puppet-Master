' Launch Puppet Master GUI without showing a console window.
' This script is run by Start Menu and Desktop shortcuts.
' It executes bin\puppet-master.cmd gui with the window hidden (style 0).

Set fso = CreateObject("Scripting.FileSystemObject")
Set WshShell = CreateObject("WScript.Shell")

' Use the directory containing this script as the install root
scriptPath = WScript.ScriptFullName
installDir = fso.GetParentFolderName(scriptPath)
WshShell.CurrentDirectory = installDir

' Run puppet-master gui with hidden window (0), don't wait for exit (False)
' cmd /c ensures PATH and env from cmd; "bin\puppet-master.cmd" gui is the command
cmd = "cmd /c """ & fso.BuildPath(installDir, "bin\puppet-master.cmd") & """ gui"
WshShell.Run cmd, 0, False
