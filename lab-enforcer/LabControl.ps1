$SystemID = "CS-01"
$BACKEND  = "https://script.google.com/macros/s/AKfycby_wVsgkv7YrahCD_8y_bNl85LqQJO4zRKH7ilSmZPinvatTeFOuHwyYKtM4WaG4kUy/exec"
$KIOSK    = "https://thrinadh360.github.io/drvsklab/lab_kiosk.html"
$Sync     = @{ Active = $false; LastID = "" }

function Lock-PC {
    Stop-Process explorer -Force -ErrorAction SilentlyContinue
    Start-Process "msedge.exe" -ArgumentList "--kiosk `"$KIOSK?sysId=$SystemID`" --edge-kiosk-type=fullscreen"
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
        $data = Invoke-RestMethod -Uri "$BACKEND?action=lab" -Method Get
        $my = $data | Where-Object { $_.SystemID -eq $SystemID } | Select-Object -Last 1
        if ($my.Command -eq "UNLOCK" -and !$Sync.Active) { Unlock-PC; $Sync.LastID = $my.CommandID }
        if ($my.Command -eq "SHUTDOWN") { Stop-Computer -Force }
        if ($my.Command -eq "LOCK" -and $Sync.Active -and $my.CommandID -ne $Sync.LastID) { Lock-PC; $Sync.LastID = $my.CommandID }
    } catch { }
    Start-Sleep -Seconds 1
}
