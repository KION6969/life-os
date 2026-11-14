$ErrorActionPreference = 'Stop'
$id   = 'ACPI\ATK3001\4&3AC3BBAC&0'
$enum = "HKLM:\SYSTEM\CurrentControlSet\Enum\$id"
$svc  = 'HKLM:\SYSTEM\CurrentControlSet\Services\i8042prt'
$log  = Join-Path $PSScriptRoot 'keyboard-toggle.log'

function Log($m) { "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $m" | Add-Content -Path $log }

try {
    $cf = (Get-ItemProperty -Path $enum -ErrorAction Stop).ConfigFlags
    Log ("Enable requested. ConfigFlags before = 0x{0:X}" -f $cf)

    # Clear the CONFIGFLAG_DISABLED bit (0x1)
    if ($cf -band 0x1) {
        Set-ItemProperty -Path $enum -Name ConfigFlags -Value ($cf -band 0xFFFFFFFE) -Type DWord
    }

    # Restore the driver start type from the INF default (3 = demand start)
    Set-ItemProperty -Path $svc -Name Start -Value 3 -Type DWord

    $cf2 = (Get-ItemProperty -Path $enum).ConfigFlags
    $st  = (Get-ItemProperty -Path $svc).Start
    Log ("Enable staged. ConfigFlags = 0x{0:X}, i8042prt Start = {1}" -f $cf2, $st)

    # Best effort: try to bring it back without a reboot
    Enable-PnpDevice -InstanceId $id -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
    Start-Sleep -Seconds 1
    $d  = Get-PnpDevice -InstanceId $id -ErrorAction SilentlyContinue
    $pc = (Get-PnpDeviceProperty -InstanceId $id -KeyName 'DEVPKEY_Device_ProblemCode' -ErrorAction SilentlyContinue).Data
    Log "Status=$($d.Status) ProblemCode=$pc"

    Write-Host ''
    if ($pc -eq 0) {
        Write-Host 'Laptop keyboard re-enabled. Test it now.' -ForegroundColor Green
    } else {
        Write-Host 'Laptop keyboard re-enabled - RESTART the laptop to activate it.' -ForegroundColor Green
    }
}
catch {
    Log "ERROR: $($_.Exception.Message)"
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Read-Host 'Press Enter to close'
