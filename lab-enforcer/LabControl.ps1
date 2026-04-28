# ===========================================================================
# CSYNC SOVEREIGN ENFORCER v100.2 (STABLE)
# Developed by: M. Thrinadh (https://linkedin.com/in/m3nadh)
# ===========================================================================

$SystemID    = "CS-01"  # SET PER PC
$BACKEND_URL = "https://script.google.com/macros/s/AKfycbyjlfep_eavyIXgzJ4Ezru3f5odjw4M433R6cWqP419693_tFckIqTzUWsfxrp0tZtg/exec"
$KIOSK_URL   = "https://thrinadh360.github.io/drvsklab/lab_kiosk.html"
$Sync        = @{ Active = $false; LastID = "" }

function Lock-Workstation {
    Write-Host "Securing Station $SystemID..." -ForegroundColor Red
    Stop-Process explorer -Force -ErrorAction SilentlyContinue
    Stop-Process msedge -Force -ErrorAction SilentlyContinue
    Start-Process "msedge.exe" -ArgumentList "--kiosk `"$KIOSK_URL?sysId=$SystemID`" --edge-kiosk-type=fullscreen"
    $Sync.Active = $false
}

function Unlock-Workstation {
    Write-Host "Cloud Handshake Verified. Unlocking Desktop..." -ForegroundColor Green
    Stop-Process msedge -Force -ErrorAction SilentlyContinue
    Start-Process "explorer.exe"
    if (!(Get-Process explorer -ErrorAction SilentlyContinue)) { Start-Process explorer.exe }
    $Sync.Active = $true
}

Lock-Workstation
while ($true) {
    try {
        $data = Invoke-RestMethod -Uri "$BACKEND_URL?action=lab" -Method Get
        $my = $data | Where-Object { $_.SystemID -eq $SystemID } | Select-Object -Last 1
        if ($my) {
            $currID = $my.CommandID
            if ($my.Command -eq "UNLOCK" -and !$Sync.Active) { Unlock-Workstation; $Sync.LastID = $currID }
            if ($my.Command -eq "SHUTDOWN") { Stop-Computer -Force }
            if ($my.Command -eq "LOCK" -and $Sync.Active -and $currID -ne $Sync.LastID) { Lock-Workstation; $Sync.LastID = $currID }
        }
    } catch { }
    Start-Sleep -Seconds 1
}