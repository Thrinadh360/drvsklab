/**
 * CSync v1.0 - Lab QR Handshake Engine
 * Dr. V.S. Krishna Govt. Degree College (Autonomous)
 * Developed by: M. Thrinadh (https://linkedin.com/in/m3nadh)
 */

const CSyncScanner = {
    scannerInstance: null,
    isScanning: false,

    // 1. INITIALIZE SCANNER (Using html5-qrcode)
    async start(elementId, onSuccess) {
        if (this.isScanning) return;

        this.scannerInstance = new Html5Qrcode(elementId);
        this.isScanning = true;

        const config = { 
            fps: 15, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0 
        };

        try {
            await this.scannerInstance.start(
                { facingMode: "environment" }, 
                config,
                (decodedText) => {
                    this.handleDetection(decodedText, onSuccess);
                },
                (errorMessage) => {
                    // Silent fail for scanning frames
                }
            );
        } catch (err) {
            console.error("Scanner Initialization Failed:", err);
            alert("Camera Access Denied. Please enable permissions in your mobile settings.");
            this.isScanning = false;
        }
    },

    // 2. PARSE SCAN DATA & VALIDATE
    async handleDetection(decodedText, callback) {
        try {
            // The Lab PC QR contains a URL: ...index.html?sysId=CS-01&mac=200B74...
            const url = new URL(decodedText);
            const params = new URLSearchParams(url.search);
            
            const pcData = {
                sysId: params.get('sysId'),
                mac: params.get('mac')
            };

            if (pcData.sysId && pcData.mac) {
                // Stop scanner immediately on successful read
                await this.stop();
                
                // Trigger Haptic Feedback
                if ("vibrate" in navigator) navigator.vibrate([50, 30, 50]);
                
                // Pass data back to UI Manager
                callback(pcData);
            } else {
                console.warn("Invalid CSync QR Code detected.");
            }
        } catch (e) {
            console.error("QR Parsing Error:", e);
        }
    },

    // 3. STOP & CLEANUP
    async stop() {
        if (this.scannerInstance && this.isScanning) {
            try {
                await this.scannerInstance.stop();
                this.scannerInstance = null;
                this.isScanning = false;
                console.log("CSync Scanner: Hardware Released.");
            } catch (e) {
                console.error("Scanner Stop Error:", e);
            }
        }
    },

    /**
     * WORKSTATION HANDSHAKE LOGIC
     * Communicates with CloudSync to update LabControl sheet
     */
    async performHandshake(pcData, user) {
        // Show high-res loading state in UI
        const statusPill = document.getElementById('status-pill');
        statusPill.innerHTML = `<span class="text-yellow-400 animate-pulse">● CONNECTING TO STATION ${pcData.sysId}...</span>`;

        const response = await CloudSync.labHandshake(
            pcData.sysId,
            pcData.mac,
            user.id,
            user.role,
            user.photo // Registered Base64 Face for PC Welcome Screen
        );

        if (response === "UNLOCKED") {
            statusPill.innerHTML = `<span class="text-emerald-400">● STATION ${pcData.sysId} UNLOCKED</span>`;
            localStorage.setItem('active_session_pc', pcData.sysId);
            return true;
        } else {
            statusPill.innerHTML = `<span class="text-red-500">● HANDSHAKE FAILED: ${response}</span>`;
            return false;
        }
    }
};

/**
 * Developed by M. Thrinadh
 * Hardware Integrity Seal for CSync v1.0
 */
window.CSyncScanner = CSyncScanner;