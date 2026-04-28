/**
 * CSYNC MASTER BIOMETRIC ENGINE v108.0
 * Institution: Dr. V.S. Krishna Government Degree College (Autonomous)
 * Dept. of Computer Science & Artificial Intelligence
 * 
 * Developed by: M. Thrinadh (https://linkedin.com/in/m3nadh)
 * 
 * Logic: WebAuthn Fingerprint + Face-api.js Liveness + Device UUID Binding
 */

const AuthEngine = {
    modelsLoaded: false,
    isCameraActive: false,

    // 1. DYNAMIC MODEL LOADER (Fixes the "Not Available" / "Syncing" Hang)
    async loadModels() {
        if (this.modelsLoaded) return true;

        // Auto-detect the base path for GitHub Pages (handles subfolders like /drvsklab/)
        const pathParts = window.location.pathname.split('/');
        pathParts.pop(); 
        const baseDir = pathParts.join('/');
        const MODEL_URL = window.location.origin + baseDir + '/models';

        console.log("CSync AI: Fetching Neural Weights from " + MODEL_URL);

        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
            ]);
            this.modelsLoaded = true;
            console.log("CSync AI: Neural Grid Synchronized.");
            return true;
        } catch (e) {
            console.error("AI Model Load Failure:", e);
            return false;
        }
    },

    // 2. HARDWARE FINGERPRINT ENROLLMENT (WebAuthn)
    async enrollFingerprint(userId, userName) {
        if (!window.PublicKeyCredential) {
            alert("Sovereign Error: Hardware biometrics not supported on this device.");
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
            return btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
        } catch (e) {
            console.error("FP Enrollment Denied:", e);
            return null;
        }
    },

    // 3. HARDWARE FINGERPRINT VERIFICATION
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
            console.error("Hardware Auth Failed:", e);
            return false;
        }
    },

    // 4. FACE AI LIVENESS CHALLENGE (Smile-to-Verify)
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
                
                // DISCIPLINARY LOGIC: Mandatory Smile Liveness Check
                if (smileScore > 0.85) {
                    clearInterval(checkInterval);
                    if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]); // Success Haptic
                    
                    // Capture high-res compressed snapshot
                    const photoBase64 = this.captureCompressedPhoto(videoEl);
                    callback(photoBase64);
                } else {
                    if (statusLabel) statusLabel.innerText = "SMILE TO AUTHORIZE NODE";
                }
            } else {
                if (statusLabel) statusLabel.innerText = "POSITION FACE IN GRID";
            }
        }, 500);
    },

    // 5. IMAGE COMPRESSION ENGINE (Optimized for Google Sheets Concurrency)
    captureCompressedPhoto(videoEl) {
        const canvas = document.createElement('canvas');
        canvas.width = 120; // 120px is the industry standard for spreadsheet-based DBs
        canvas.height = 120;
        const ctx = canvas.getContext('2d');

        // Circular Masking for Sovereign HUD Look
        ctx.beginPath();
        ctx.arc(60, 60, 60, 0, Math.PI * 2);
        ctx.clip();

        // Draw centered video frame
        ctx.drawImage(videoEl, 0, 0, 120, 120);
        
        // JPEG 0.6 quality ensures the string is tiny but recognizable
        return canvas.toDataURL('image/jpeg', 0.6);
    },

    // 6. DEVICE UUID GENERATION (The Sovereign Binding)
    getDeviceUUID() {
        let uuid = localStorage.getItem('csync_v1_uuid');
        if (!uuid) {
            const platform = navigator.platform;
            const screenDetails = `${screen.width}x${screen.height}`;
            const randomID = Math.random().toString(36).substring(2, 10).toUpperCase();
            uuid = btoa(`${platform}-${screenDetails}-${randomID}`).substring(0, 20);
            localStorage.setItem('csync_v1_uuid', uuid);
        }
        return uuid;
    }
};

/**
 * Developed by M. Thrinadh
 * Integrity Seal for CSync v1.0
 */
window.AuthEngine = AuthEngine;
