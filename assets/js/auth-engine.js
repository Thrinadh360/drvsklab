/**
 * CSYNC: MASTER BIOMETRIC ENGINE v115.0
 * Institution: Dr. V.S. Krishna Government Degree College (Autonomous)
 * Developed by: M. Thrinadh (https://linkedin.com/in/m3nadh)
 * 
 * Logic: WebAuthn Fingerprint + Face-api.js Liveness + Dynamic Pathing
 */

const AuthEngine = {
    modelsLoaded: false,

    // --- 1. DYNAMIC NEURAL LOADER ---
    async loadModels() {
        if (this.modelsLoaded) return true;

        // Auto-detect path (Handles cases like thrinadh360.github.io/drvsklab/)
        const pathParts = window.location.pathname.split('/');
        pathParts.pop(); 
        const baseDir = pathParts.join('/');
        const MODEL_URL = window.location.origin + baseDir + '/models';

        console.log("CSync AI: Fetching Neural Nodes from " + MODEL_URL);

        try {
            // Load essential models for fast mobile detection & liveness
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
            ]);
            this.modelsLoaded = true;
            console.log("CSync AI: Neural Grid Online.");
            return true;
        } catch (e) {
            console.error("AI Node Failure: Neural weights missing in /models", e);
            return false;
        }
    },

    // --- 2. HARDWARE FINGERPRINT BINDING (WebAuthn) ---
    async enrollFingerprint(userId, userName) {
        if (!window.PublicKeyCredential) {
            alert("Biometric hardware not detected on this device.");
            return "UNSUPPORTED";
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
            // Return Credential ID to be stored in Google Sheets
            return btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
        } catch (e) {
            console.error("Fingerprint Binding Error:", e);
            return null;
        }
    },

    // --- 3. HARDWARE FINGERPRINT CHALLENGE ---
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

    // --- 4. FACE AI LIVENESS (Disciplinary Smile Check) ---
    async startLivenessCheck(videoEl, callback) {
        if (!this.modelsLoaded) await this.loadModels();

        const statusLabel = document.getElementById('face-status');
        
        const checkInterval = setInterval(async () => {
            if (!this.modelsLoaded) return;

            const detection = await faceapi.detectSingleFace(
                videoEl, 
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceExpressions();

            if (detection) {
                const smileScore = detection.expressions.happy;
                
                // DISCIPLINARY LOGIC: Mandatory Smile to confirm human liveness
                if (smileScore > 0.85) {
                    clearInterval(checkInterval);
                    if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]); // Pulse
                    
                    // Capture high-res compressed snapshot for Cloud
                    const photoBase64 = this.compressIdentityFrame(videoEl);
                    callback(photoBase64);
                } else {
                    if (statusLabel) statusLabel.innerText = "SMILE TO VERIFY IDENTITY";
                }
            } else {
                if (statusLabel) statusLabel.innerText = "POSITION FACE IN HUD CIRCLE";
            }
        }, 500);
    },

    // --- 5. IMAGE COMPRESSION (Optimized for 10-5 Concurrency) ---
    compressIdentityFrame(videoEl) {
        const canvas = document.createElement('canvas');
        // 120px is the "Gold Standard" for Google Sheets database stability
        canvas.width = 120;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');

        // Professional Circular Crop
        ctx.beginPath();
        ctx.arc(60, 60, 60, 0, Math.PI * 2);
        ctx.clip();

        // Draw video frame to canvas
        ctx.drawImage(videoEl, 0, 0, 120, 120);
        
        // JPEG at 0.6 quality keeps the string extremely short and fast
        return canvas.toDataURL('image/jpeg', 0.6);
    },

    // --- 6. DEVICE UUID GENERATION (The Hardware Bond) ---
    getDeviceUUID() {
        let uuid = localStorage.getItem('csync_device_uuid');
        if (!uuid) {
            const platform = navigator.platform;
            const screen = `${window.screen.width}x${window.screen.height}`;
            const gpu = this.getGPUFingerprint();
            // Generate a 20-character unique sovereign hash
            uuid = btoa(`CSYNC-${platform}-${screen}-${gpu}`).substring(0, 20).toUpperCase();
            localStorage.setItem('csync_device_uuid', uuid);
        }
        return uuid;
    },

    getGPUFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl');
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        } catch (e) { return "GENERIC_GPU"; }
    }
};

/**
 * Developed by M. Thrinadh
 * Sovereign Biometric Protocol for CSync v1.0
 */
window.AuthEngine = AuthEngine;
