$ErrorActionPreference = 'Stop'
$id  = 'ACPI\ATK3001\4&3AC3BBAC&0'
$log = Join-Path $PSScriptRoot 'keyboard-toggle.log'

function Log($msg) { "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $msg" | Add-Content -Path $log }

try {
    $before = Get-PnpDevice -InstanceId $id
    Log "Disable requested. Before: Status=$($before.Status)"

    Disable-PnpDevice -InstanceId $id -Confirm:$false
    Start-Sleep -Seconds 2

    $after = Get-PnpDevice -InstanceId $id
    $problem = (Get-PnpDeviceProperty -InstanceId $id -KeyName 'DEVPKEY_Device_ProblemCode').Data
    Log "After: Status=$($after.Status) ProblemCode=$problem (22 = disabled)"

    if ($problem -eq 22) { Log 'RESULT: SUCCESS - internal keyboard is disabled.' }
    else { Log 'RESULT: WARNING - device did not report as disabled.' }
}
catch {
    Log "ERROR: $($_.Exception.Message)"
}
