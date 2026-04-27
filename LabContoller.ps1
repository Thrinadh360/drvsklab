# ===========================================================================
# CS CONNECT: ULTIMATE ENFORCER v10.0
# Dr. V. S. Krishna Govt. Degree College (Autonomous)
# Developed by M.Thrinadh (https://linkedin.com/in/m3nadh)
# ===========================================================================

# -------------------- 1. CONFIGURATION --------------------
$SystemID    = "CS-21"   # <--- SET THIS INDIVIDUALLY FOR EACH PC
$BACKEND_URL = "https://script.google.com/macros/s/AKfycbzuCEHK3h92DIpPwB89dxQdXnfkGyRTm2oOpT-5p2503vsLylptMdzCJfwpXk6Z7O2U/exec"
$PWA_URL     = "https://thrinadh360.github.io/drvsklab/index.html"

# -------------------- 2. HARDWARE IDENTITY --------------------
$MAC  = (Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | Select-Object -First 1).MacAddress.Replace("-","")
$Sync = @{ Active = $false; LastActionID = "" }

# -------------------- 3. CORE FUNCTIONS --------------------
function Lock-Workstation {
    Write-Host "Securing Station $SystemID..." -ForegroundColor Red
    Stop-Process -Name "explorer" -Force -ErrorAction SilentlyContinue
    Stop-Process -Name "msedge" -Force -ErrorAction SilentlyContinue
    # Launch Kiosk Mode
    Start-Process "msedge.exe" -ArgumentList "--kiosk `"$PWA_URL?sysId=$SystemID&mac=$MAC`" --edge-kiosk-type=fullscreen --no-first-run"
    $Sync.Active = $false
}

function Unlock-Workstation {
    Write-Host "Handshake Verified. Unlocking Desktop..." -ForegroundColor Green
    Stop-Process -Name "msedge" -Force -ErrorAction SilentlyContinue
    Start-Process "explorer.exe"
    $Sync.Active = $true
}

# -------------------- 4. THE ENFORCER LOOP --------------------
Lock-Workstation # Start in locked state

while ($true) {
    try {
        # Fetch the LabControl status from the Google Sheet
        $data = Invoke-RestMethod -Uri "$($BACKEND_URL)?action=lab" -Method Get
        
        # Find the command for THIS specific system
        $myCommand = $data | Where-Object { $_.SystemID -eq $SystemID } | Select-Object -Last 1

        if ($myCommand) {
            $CurrentID = $myCommand.CommandID # Unique ID to prevent re-triggering

            # CASE A: Command is UNLOCK and we are currently LOCKED
            if ($myCommand.Command -eq "UNLOCK" -and !$Sync.Active) {
                Unlock-Workstation
                $Sync.LastActionID = $CurrentID
            }

            # CASE B: Command is LOCK and we are currently UNLOCKED (e.g., 5 PM Reset)
            if ($myCommand.Command -eq "LOCK" -and $Sync.Active -and $CurrentID -ne $Sync.LastActionID) {
                Lock-Workstation
                $Sync.LastActionID = $CurrentID
            }
        }
    } catch {
        Write-Host "Syncing with CS Connect Cloud..." -ForegroundColor Gray
    }

    # High speed poll when locked (1s), slower when working (5s)
    $Wait = if ($Sync.Active) { 5 } else { 1 }
    Start-Sleep -Seconds $Wait
}
