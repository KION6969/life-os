$ErrorActionPreference = 'Continue'
$id  = 'ACPI\ATK3001\4&3AC3BBAC&0'
$log = Join-Path $PSScriptRoot 'keyboard-toggle.log'
function Log($msg) { "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $msg" | Add-Content -Path $log }

Log 'pnputil /scan-devices requested.'
$out = & pnputil.exe /scan-devices 2>&1 | Out-String
Log ('pnputil scan -> ' + ($out -replace '\s+', ' ').Trim())
Start-Sleep -Seconds 3

$d  = Get-PnpDevice -InstanceId $id -ErrorAction SilentlyContinue
$pc = (Get-PnpDeviceProperty -InstanceId $id -KeyName 'DEVPKEY_Device_ProblemCode' -ErrorAction SilentlyContinue).Data
Log "Verify -> Status=$($d.Status) ProblemCode=$pc (22 = disabled)"
