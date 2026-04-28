/**
 * CSYNC: MASTER BIOMETRIC ENGINE v105.0
 * Institution: Dr. V.S. Krishna Government Degree College (Autonomous)
 * Developed by: M. Thrinadh (https://linkedin.com/in/m3nadh)
 * 
 * Logic: WebAuthn Fingerprint + Face-api.js Liveness + Device UUID Binding
 */

const AuthEngine = {
    modelsLoaded: false,

    // 1. INITIALIZE AI VISION MODELS
    async loadModels() {
        if (this.modelsLoaded) return;
        // Path adjusted for M.Thrinadh's GitHub directory structure
        const MODEL_URL = './models'; 
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
            ]);
            this.modelsLoaded = true;
            console.log("CSync AI: Neural Grid Initialized.");
        } catch (e) {
            console.error("AI Model Load Failure:", e);
            alert("AI Vision Not Available. Check HTTPS connection.");
        }
    },

    // 2. HARDWARE FINGERPRINT ENROLLMENT (WebAuthn)
    async enrollFingerprint(userId, userName) {
        if (!window.PublicKeyCredential) {
            alert("Biometric hardware not detected on this device.");
            return null;
        }

        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const createOptions = {
            publicKey: {
                challenge,
                rp: { name: "CSync Sovereign", id: window.location.hostname },
                user: {
                    id: Uint8Array.from(userId, c => c.charCodeAt(0)),
                    name: userId,
                    displayName: userName
                },
                pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
                timeout: 60000
            }
        };

        try {
            const credential = await navigator.credentials.create(createOptions);
            // Return Credential ID to be stored in 'FP_ID' column in Google Sheets
            return btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
        } catch (e) {
            console.error("FP Enrollment Error:", e);
            return null;
        }
    },

    // 3. HARDWARE FINGERPRINT CHALLENGE (Attendance/Lab)
    async verifyFingerprint(storedFpId) {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const getOptions = {
            publicKey: {
                challenge,
                allowCredentials: [{
                    id: Uint8Array.from(atob(storedFpId), c => c.charCodeAt(0)),
                    type: 'public-key'
                }],
                userVerification: "required"
            }
        };

        try {
            const assertion = await navigator.credentials.get(getOptions);
            return !!assertion;
        } catch (e) {
            console.error("Biometric Mismatch:", e);
            return false;
        }
    },

    // 4. FACE AI LIVENESS DETECTION (Disciplinary Smile Check)
    async startLivenessCheck(videoEl, callback) {
        if (!this.modelsLoaded) await this.loadModels();

        const statusLabel = document.getElementById('face-status');
        
        const checkInterval = setInterval(async () => {
            const detection = await faceapi.detectSingleFace(
                videoEl, 
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceExpressions();

            if (detection) {
                const smileScore = detection.expressions.happy;
                
                // DISCIPLINARY LOGIC: Mandatory Smile Liveness (Prevents static photo proxy)
                if (smileScore > 0.85) {
                    clearInterval(checkInterval);
                    if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
                    
                    // Capture final high-res compressed snapshot for Lab PC/Admin
                    const photoBase64 = this.compressFrame(videoEl);
                    callback(photoBase64);
                } else {
                    if (statusLabel) statusLabel.innerText = "SMILE TO VERIFY IDENTITY";
                }
            } else {
                if (statusLabel) statusLabel.innerText = "POSITION FACE IN CIRCLE";
            }
        }, 500);
    },

    // 5. IMAGE COMPRESSION (Optimal for Google Sheet Cells)
    compressFrame(videoEl) {
        const canvas = document.createElement('canvas');
        // 150px is the "Sweet Spot" for NAAC reports vs Sheet performance
        canvas.width = 150;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');

        // Circular masking for professional HUD look
        ctx.beginPath();
        ctx.arc(75, 75, 75, 0, Math.PI * 2);
        ctx.clip();

        // Center and draw
        ctx.drawImage(videoEl, 0, 0, 150, 150);
        
        // 0.6 Quality keeps the string length under 10k characters
        return canvas.toDataURL('image/jpeg', 0.6);
    },

    // 6. DEVICE UUID GENERATION (Hardware Binding)
    getDeviceUUID() {
        let uuid = localStorage.getItem('csync_device_node');
        if (!uuid) {
            const core = navigator.hardwareConcurrency || 4;
            const ram = navigator.deviceMemory || 4;
            const screen = `${window.screen.width}x${window.screen.height}`;
            const ts = Date.now().toString(36).toUpperCase();
            // Cryptographic-style node ID
            uuid = btoa(`NODE-${core}-${ram}-${screen}-${ts}`).substring(0, 24);
            localStorage.setItem('csync_device_node', uuid);
        }
        return uuid;
    }
};

/**
 * Developed by M. Thrinadh
 * Sovereign Biometric Protocol for CSync v1.0
 */
window.AuthEngine = AuthEngine;
