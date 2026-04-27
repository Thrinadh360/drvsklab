/**
 * CSync v1.0 - Sovereign Cloud Sync Engine
 * Dr. V.S. Krishna Govt. Degree College (Autonomous)
 * Developed by: M. Thrinadh (https://linkedin.com/in/m3nadh)
 */

const CloudSync = {
    // Replace with your Google Apps Script Web App URL after Deployment
    apiUrl: "https://script.google.com/macros/s/AKfycbzuCEHK3h92DIpPwB89dxQdXnfkGyRTm2oOpT-5p2503vsLylptMdzCJfwpXk6Z7O2U/exec",

    // 1. GENERIC POST REQUEST HANDLER (With Timeout Protection)
    async post(payload) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s Timeout

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                mode: 'cors', // Crucial for GAS
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return await response.text();
        } catch (error) {
            console.error("CSync Cloud Error:", error);
            if (error.name === 'AbortError') return "TIMEOUT_ERROR";
            return "NETWORK_FAILURE";
        }
    },

    // 2. SOVEREIGN REGISTRATION (Identity + Device Binding)
    async registerNode(data) {
        return await this.post({
            action: "register",
            role: data.role,
            id: data.id,
            name: data.name,
            major: data.major || "N/A",
            year: data.year || "N/A",
            uuid: data.uuid,
            photo: data.photo // Compressed Base64 from AuthEngine
        });
    },

    // 3. BIOMETRIC ATTENDANCE (Dual-Session Logic)
    async syncAttendance(userId, role, uuid) {
        return await this.post({
            action: "attendance",
            id: userId,
            role: role,
            uuid: uuid,
            timestamp: new Date().toISOString()
        });
    },

    // 4. LAB PC HANDSHAKE (Cloud-to-Hardware Bridge)
    async labHandshake(pcId, mac, userId, role, photo) {
        return await this.post({
            action: "lab_unlock",
            sysId: pcId,
            mac: mac,
            id: userId,
            role: role,
            photo: photo // Sends the registered photo to the Lab PC monitor
        });
    },

    // 5. TARGETED ANNOUNCEMENT POLLING
    async fetchAnnouncements(roll, year) {
        try {
            const res = await fetch(`${this.apiUrl}?action=getAnn&roll=${roll}&year=${year}`);
            return await res.json();
        } catch (e) {
            return { id: 0 };
        }
    },

    // 6. AI SOVEREIGN HELPDESK (Groq AI Integration)
    async askAI(query) {
        try {
            const res = await fetch(`${this.apiUrl}?action=ai_helpdesk&query=${encodeURIComponent(query)}`);
            return await res.text();
        } catch (e) {
            return "The AI Helpdesk is currently syncing. Please try again in a moment.";
        }
    },

    // 7. HAPTIC & NOTIFICATION HELPERS
    triggerSuccess() {
        if ("vibrate" in navigator) navigator.vibrate([50, 30, 50]);
        const audio = document.getElementById('ding');
        if (audio) audio.play().catch(() => console.log("Audio interaction required."));
    }
};

/**
 * Developed by M. Thrinadh
 * Cloud Integrity Seal for CSync v1.0
 */
window.CloudSync = CloudSync;