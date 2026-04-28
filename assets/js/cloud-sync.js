/**
 * CSYNC: SOVEREIGN CLOUD SYNC ENGINE v105.0
 * Institution: Dr. V.S. Krishna Govt. Degree College (Autonomous)
 * Developed by: M. Thrinadh (https://linkedin.com/in/m3nadh)
 * 
 * Logic: Biometric Handshaking, AI Architect Tunnel, and Real-time Polling.
 */

const CloudSync = {
    // --- MASTER BACKEND URL ---
    apiUrl: "https://script.google.com/macros/s/AKfycbyjlfep_eavyIXgzJ4Ezru3f5odjw4M433R6cWqP419693_tFckIqTzUWsfxrp0tZtg/exec",

    // 1. UNIVERSAL POST HANDLER (Sovereign Security)
    async post(payload) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                mode: 'cors', // Required for Google Apps Script Web Apps
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });
            return await response.text();
        } catch (error) {
            console.error("CSync Cloud Failure:", error);
            return "NETWORK_ERROR";
        }
    },

    // 2. SOVEREIGN REGISTRATION (Role-Based: Student/Staff/Alumni/HOD)
    async registerUser(data) {
        return await this.post({
            action: "register",
            role: data.role,
            id: data.id,
            name: data.name,
            major: data.major || "N/A",
            year: data.year || "N/A",
            uuid: data.uuid,
            photo: data.photo, // Base64 Compressed
            fpId: data.fpId,   // WebAuthn Credential ID
            pEmail: data.parentEmail || "N/A"
        });
    },

    // 3. BIOMETRIC ATTENDANCE (Dual-Session Window Validation)
    async markAttendance(userId, role, uuid) {
        const response = await this.post({
            action: "attendance",
            id: userId,
            role: role,
            uuid: uuid
        });
        
        if (response === "SUCCESS") this.triggerHaptic('success');
        if (response === "PORTAL_LOCKED") this.triggerHaptic('error');
        
        return response;
    },

    // 4. LAB PC HANDSHAKE (Hardware Handover)
    async unlockWorkstation(pcId, mac, userId, role, photo) {
        return await this.post({
            action: "lab_unlock",
            sysId: pcId,
            mac: mac,
            id: userId,
            role: role,
            photo: photo // Display face on Lab PC monitor
        });
    },

    // 5. AI ACADEMIC ARCHITECT (Massive Data Generation)
    async generateTeachingPlan(lecturerName, subject, syllabus) {
        const res = await this.post({
            action: "gen_teaching_plan",
            lecturer: lecturerName,
            subject: subject,
            syllabus: syllabus
        });
        return res; // Returns raw AI text for PDF conversion
    },

    async generateExamPapers(sub, syllabus, model, sets) {
        const res = await this.post({
            action: "gen_exam_papers",
            sub: sub,
            syllabus: syllabus,
            model: model,
            sets: sets
        });
        return res;
    },

    // 6. AI COMMAND TERMINAL (Groq Llama 3 70B Tunnel)
    async sendAICommand(query, userProfile) {
        try {
            const res = await fetch(`${this.apiUrl}?action=ai_helpdesk&query=${encodeURIComponent(query)}&id=${userProfile.id}&role=${userProfile.role}`);
            return await res.text();
        } catch (e) {
            return "Sovereign AI is currently offline.";
        }
    },

    // 7. REAL-TIME DATA FETCHERS (GET requests)
    async fetchAnnouncements(roll, year) {
        try {
            const res = await fetch(`${this.apiUrl}?action=getAnn&roll=${roll}&year=${year}`);
            return await res.json();
        } catch (e) { return { id: 0 }; }
    },

    async getNexusDirectory() {
        try {
            const res = await fetch(`${this.apiUrl}?action=getNexus`);
            return await res.json();
        } catch (e) { return []; }
    },

    // 8. NATIVE HARDWARE FEEDBACK
    triggerHaptic(type) {
        if (!("vibrate" in navigator)) return;
        if (type === 'success') navigator.vibrate([50, 30, 50]);
        if (type === 'error') navigator.vibrate([200, 100, 200]);
    }
};

/**
 * Developed by M. Thrinadh
 * Integrity Seal for CSync v1.0
 */
window.CloudSync = CloudSync;
