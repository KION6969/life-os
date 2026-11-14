$ErrorActionPreference = 'Continue'
$id  = 'ACPI\ATK3001\4&3AC3BBAC&0'
$log = Join-Path $PSScriptRoot 'keyboard-toggle.log'
function Log($msg) { "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $msg" | Add-Content -Path $log }

Log 'pnputil /restart-device requested.'
$out = & pnputil.exe /restart-device $id 2>&1 | Out-String
Log ('pnputil -> ' + ($out -replace '\s+', ' ').Trim())
Start-Sleep -Seconds 2

$d  = Get-PnpDevice -InstanceId $id
$pc = (Get-PnpDeviceProperty -InstanceId $id -KeyName 'DEVPKEY_Device_ProblemCode').Data
Log "Verify -> Status=$($d.Status) ProblemCode=$pc (22 = disabled)"
