# ===========================================================================
# CSYNC SOVEREIGN ENFORCER v100.3 (STABLE)
# Developed by: M. Thrinadh
# ===========================================================================

$SystemID    = "CS-01" 
$BACKEND_URL = "https://script.google.com/macros/s/AKfycbx9KZfFxGH8V0XdZjNMeJHO08O3GNUxCXJe96Bi1RsPhUjZ9sl5HfX37fk8CcrNuVdg/exec"
$KIOSK_URL   = "https://thrinadh360.github.io/drvsklab/lab-enforcer/lab_kiosk.html"
$Sync        = @{ Active = $false; LastID = "" }

function Lock-PC {
    Stop-Process explorer -Force -ErrorAction SilentlyContinue
    Stop-Process msedge -Force -ErrorAction SilentlyContinue
    Start-Process "msedge.exe" -ArgumentList "--kiosk `"$KIOSK_URL?sysId=$SystemID`" --edge-kiosk-type=fullscreen"
    $Sync.Active = $false
}

function Unlock-PC {
    Stop-Process msedge -Force -ErrorAction SilentlyContinue
    Start-Process "explorer.exe"
    if (!(Get-Process explorer -ErrorAction SilentlyContinue)) { Start-Process explorer.exe }
    $Sync.Active = $true
}

Lock-PC
while ($true) {
    try {
        $data = Invoke-RestMethod -Uri "$BACKEND_URL?action=lab" -Method Get
        $my = $data | Where-Object { $_.SystemID -eq $SystemID } | Select-Object -Last 1
        if ($my) {
            if ($my.Command -eq "UNLOCK" -and !$Sync.Active) { Unlock-PC; $Sync.LastID = $my.CommandID }
            if ($my.Command -eq "SHUTDOWN") { Stop-Computer -Force }
            if ($my.Command -eq "LOCK" -and $Sync.Active -and $my.CommandID -ne $Sync.LastID) { Lock-PC; $Sync.LastID = $my.CommandID }
        }
    } catch { }
    Start-Sleep -Seconds 1
}
