# ===========================================================================
# CS CONNECT: ULTIMATE ENFORCER v10.2 (RELIABLE UNLOCK)
# Dr. V. S. Krishna Govt. Degree College (Autonomous)
# Developed by M.Thrinadh (https://linkedin.com/in/m3nadh)
# ===========================================================================

# -------------------- 1. CONFIGURATION --------------------
$SystemID    = "CS-21"  # Set per PC
$BACKEND_URL = "https://script.google.com/macros/s/AKfycbzuCEHK3h92DIpPwB89dxQdXnfkGyRTm2oOpT-5p2503vsLylptMdzCJfwpXk6Z7O2U/exec"
$PWA_URL     = "https://thrinadh360.github.io/drvsklab/index.html"

# -------------------- 2. HARDWARE IDENTITY --------------------
$MAC = (Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | Select-Object -First 1).MacAddress.Replace("-","")
$Sync = @{ Active = $false; LastActionID = ""; LastGlobalID = "" }

# -------------------- 3. CORE FUNCTIONS --------------------

function Send-Status($status) {
    try {
        $payload = @{ action="status"; SystemID=$SystemID; Status=$status } | ConvertTo-Json
        Invoke-RestMethod -Uri $BACKEND_URL -Method POST -Body $payload -ContentType "application/json" -TimeoutSec 2
    } catch {}
}

function Lock-Workstation {
    Write-Host "--- SECURING STATION: $SystemID ---" -ForegroundColor Red
    $Sync.Active = $false
    
    # Kill existing shells
    Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue
    Stop-Process -Name msedge -Force -ErrorAction SilentlyContinue
    
    # Launch Kiosk (Wait a second for processes to clear)
    Start-Sleep -Seconds 1
    Start-Process "msedge.exe" -ArgumentList "--kiosk `"$PWA_URL?sysId=$SystemID&mac=$MAC`" --edge-kiosk-type=fullscreen --no-first-run --no-default-browser-check"
    
    Send-Status "Locked"
}

function Unlock-Workstation {
    Write-Host "--- HANDSHAKE VERIFIED: UNLOCKING ---" -ForegroundColor Green
    
    # Close the Kiosk Browser
    Stop-Process -Name msedge -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    
    # Start Windows Explorer Shell
    # Using 'start explorer.exe' via cmd ensures the taskbar and desktop icons load fully
    Start-Process "explorer.exe"
    
    $Sync.Active = $true
    Send-Status "Active"
}

function Shutdown-System {
    Write-Host "CRITICAL: Remote Shutdown Initiated" -ForegroundColor DarkRed
    Send-Status "Offline"
    Stop-Computer -Force
}

# -------------------- 4. THE MONITORING LOOP --------------------
Write-Host "CS CONNECT v10.2 INITIALIZED. DEVELOPED BY M.THRINADH." -ForegroundColor Cyan
Lock-Workstation

while ($true) {
    try {
        # Fetch status from Cloud
        $data = Invoke-RestMethod -Uri "$($BACKEND_URL)?action=lab" -Method Get -TimeoutSec 5

        # 1. INDIVIDUAL PC COMMAND
        $my = $data | Where-Object { $_.SystemID -eq $SystemID } | Select-Object -Last 1

        # 2. GLOBAL COMMAND (Admin Override)
        $global = $data | Where-Object { $_.SystemID -eq "ALL" } | Select-Object -Last 1

        # Process Global First
        if ($global) {
            $gID = $global.CommandID + $global.Command
            if ($Sync.LastGlobalID -ne $gID) {
                $Sync.LastGlobalID = $gID
                if ($global.Command -match "LOCKALL|LOGOUTALL") { Lock-Workstation }
                if ($global.Command -eq "SHUTDOWNALL") { Shutdown-System }
            }
        }

        # Process Individual
        if ($my) {
            $aID = $my.CommandID + $my.Command
            if ($Sync.LastActionID -ne $aID) {
                $Sync.LastActionID = $aID
                
                switch ($my.Command) {
                    "UNLOCK"   { if (!$Sync.Active) { Unlock-Workstation } }
                    "LOCK"     { if ($Sync.Active) { Lock-Workstation } }
                    "LOGOUT"   { Lock-Workstation }
                    "SHUTDOWN" { Shutdown-System }
                }
            }
        }
    } catch {
        Write-Host "." -NoNewline -ForegroundColor Gray
    }

    # KIOSK RECOVERY: If locked but Edge closed, restart it
    if (!$Sync.Active -and !(Get-Process msedge -ErrorAction SilentlyContinue)) {
        Lock-Workstation
    }

    # Polling Speed: 1s when locked, 4s when active
    $Wait = if ($Sync.Active) { 4 } else { 1 }
    Start-Sleep -Seconds $Wait
}
