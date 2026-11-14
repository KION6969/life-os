$ErrorActionPreference = 'Continue'
$log = Join-Path $PSScriptRoot 'keyboard-toggle.log'
function Log($msg) { "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $msg" | Add-Content -Path $log }

Log 'Live stop requested (no reboot).'
$out = & sc.exe stop i8042prt 2>&1 | Out-String
Log ('sc stop -> ' + ($out -replace '\s+', ' ').Trim())
Start-Sleep -Seconds 2
$q = & sc.exe query i8042prt 2>&1 | Out-String
Log ('sc query -> ' + ($q -replace '\s+', ' ').Trim())
