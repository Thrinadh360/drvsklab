/**
 * CSync v1.0 - Sovereign Biometric Engine
 * Developed by: M. Thrinadh (https://linkedin.com/in/m3nadh)
 */

const AuthEngine = {
    modelsLoaded: false,
    localStream: null,

    // 1. INITIALIZE AI MODELS (Self-hosted for speed)
    async loadModels() {
        if (this.modelsLoaded) return;
        const MODEL_URL = './models';
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
            ]);
            this.modelsLoaded = true;
            console.log("CSync AI: Vision Models Loaded.");
        } catch (e) {
            console.error("CSync AI: Model Load Error", e);
        }
    },

    // 2. HARDWARE FINGERPRINT BINDING (WebAuthn)
    async bindHardware() {
        if (!window.PublicKeyCredential) {
            alert("This device does not support hardware biometric binding.");
            return null;
        }

        // Generate a random challenge for the hardware handshake
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const createCredentialOptions = {
            publicKey: {
                challenge,
                rp: { name: "CSync Sovereign", id: window.location.hostname },
                user: {
                    id: Uint8Array.from(localStorage.getItem('csync_user_id') || 'USER', c => c.charCodeAt(0)),
                    name: "CSync_Node",
                    displayName: "CSync Biometric Node"
                },
                pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
                timeout: 60000
            }
        };

        try {
            const credential = await navigator.credentials.create(createCredentialOptions);
            return btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
        } catch (e) {
            console.error("Hardware Binding Failed", e);
            return null;
        }
    },

    // 3. FACE AI LIVENESS DETECTION (Smile/Blink)
    async startLivenessCheck(videoEl, onVerified) {
        if (!this.modelsLoaded) await this.loadModels();

        const canvas = faceapi.createCanvasFromMedia(videoEl);
        const displaySize = { width: videoEl.width, height: videoEl.height };
        faceapi.matchDimensions(canvas, displaySize);

        const interval = setInterval(async () => {
            const detections = await faceapi.detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceExpressions();

            if (detections) {
                const expressions = detections.expressions;
                
                // DISCIPLINARY LOGIC: Student must SMILE (Happiness > 0.8) to verify
                if (expressions.happy > 0.85) {
                    clearInterval(interval);
                    if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]); // Success Haptic
                    
                    const compressedPhoto = this.captureCompressedPhoto(videoEl);
                    onVerified(compressedPhoto);
                }
            }
        }, 600);
    },

    // 4. IMAGE COMPRESSION (For Google Sheets performance)
    captureCompressedPhoto(videoEl) {
        const canvas = document.createElement('canvas');
        canvas.width = 120; // High-res enough for ID, small enough for Sheets
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        
        // Circular Crop Logic
        ctx.beginPath();
        ctx.arc(60, 60, 60, 0, Math.PI * 2);
        ctx.clip();
        
        // Draw centered video frame
        ctx.drawImage(videoEl, 0, 0, 120, 120);
        
        return canvas.toDataURL('image/jpeg', 0.6); // 60% quality is the sweet spot
    },

    // 5. DEVICE UUID GENERATION (The Hardware Lock)
    getDeviceUUID() {
        let uuid = localStorage.getItem('csync_device_uuid');
        if (!uuid) {
            const platform = navigator.platform;
            const screenDetails = `${screen.width}x${screen.height}x${screen.colorDepth}`;
            const randomID = Math.random().toString(36).substring(2, 10).toUpperCase();
            uuid = btoa(`${platform}-${screenDetails}-${randomID}`);
            localStorage.setItem('csync_device_uuid', uuid);
        }
        return uuid;
    }
};

/**
 * Developed by M. Thrinadh
 * Verification Seal for CSync v1.0
 */
window.AuthEngine = AuthEngine;
