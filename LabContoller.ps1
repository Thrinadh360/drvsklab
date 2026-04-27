```powershell
# ===========================================================================
# CS CONNECT: ULTIMATE ENFORCER v10.1 (FIXED + GLOBAL CONTROL)
# ===========================================================================

# -------------------- CONFIG --------------------
$SystemID    = "CS-21"
$BACKEND_URL = "https://script.google.com/macros/s/AKfycbzuCEHK3h92DIpPwB89dxQdXnfkGyRTm2oOpT-5p2503vsLylptMdzCJfwpXk6Z7O2U/exec"
$PWA_URL     = "https://thrinadh360.github.io/drvsklab/index.html"

# -------------------- HARDWARE --------------------
$MAC  = (Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | Select-Object -First 1).MacAddress.Replace("-","")

$Sync = @{
    Active = $false
    LastActionID = ""
    LastGlobalID = ""
}

# -------------------- FUNCTIONS --------------------
function Send-Status($status) {
    try {
        Invoke-RestMethod -Uri $BACKEND_URL -Method POST -Body (ConvertTo-Json @{
            action="status"
            SystemID=$SystemID
            Status=$status
        }) -ContentType "application/json"
    } catch {}
}

function Lock-Workstation {
    Write-Host "Locking $SystemID..." -ForegroundColor Red

    Stop-Process explorer -Force -ErrorAction SilentlyContinue
    Stop-Process msedge -Force -ErrorAction SilentlyContinue

    Start-Process "msedge.exe" `
        -ArgumentList "--kiosk `"$PWA_URL?sysId=$SystemID&mac=$MAC`" --edge-kiosk-type=fullscreen --no-first-run"

    $Sync.Active = $false
    Send-Status "Locked"
}

function Unlock-Workstation {
    Write-Host "Unlocking $SystemID..." -ForegroundColor Green

    Stop-Process msedge -Force -ErrorAction SilentlyContinue
    Start-Process explorer.exe

    $Sync.Active = $true
    Send-Status "Active"
}

function Shutdown-System {
    Write-Host "Shutting down $SystemID..." -ForegroundColor DarkRed
    Send-Status "Shutdown"
    Stop-Computer -Force
}

# -------------------- START --------------------
Lock-Workstation

# -------------------- LOOP --------------------
while ($true) {

    try {
        $data = Invoke-RestMethod -Uri "$BACKEND_URL?action=lab"

        # -------- INDIVIDUAL --------
        $my = $data | Where-Object { $_.SystemID -eq $SystemID } | Select-Object -Last 1

        # -------- GLOBAL --------
        $global = $data | Where-Object { $_.SystemID -eq "ALL" } | Select-Object -Last 1

        # ===== GLOBAL COMMAND =====
        if ($global) {
            $gID = $global.CommandID + $global.Command

            if ($Sync.LastGlobalID -ne $gID) {

                switch ($global.Command) {
                    "LOCKALL"     { Lock-Workstation }
                    "LOGOUTALL"   { Lock-Workstation }
                    "SHUTDOWNALL" { Shutdown-System }
                }

                $Sync.LastGlobalID = $gID
            }
        }

        # ===== INDIVIDUAL COMMAND =====
        if ($my) {
            $aID = $my.CommandID + $my.Command

            if ($Sync.LastActionID -ne $aID) {

                switch ($my.Command) {
                    "LOCK"     { if ($Sync.Active) { Lock-Workstation } }
                    "UNLOCK"   { if (!$Sync.Active) { Unlock-Workstation } }
                    "LOGOUT"   { Lock-Workstation }
                    "SHUTDOWN" { Shutdown-System }
                }

                $Sync.LastActionID = $aID
            }
        }

    } catch {
        Write-Host "Cloud Sync..." -ForegroundColor Gray
    }

    # -------- KIOSK RECOVERY --------
    if (!$Sync.Active -and !(Get-Process msedge -ErrorAction SilentlyContinue)) {
        Lock-Workstation
    }

    $Wait = if ($Sync.Active) { 5 } else { 1 }
    Start-Sleep -Seconds $Wait
}
```
