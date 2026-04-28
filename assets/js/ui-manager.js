/**
 * CSYNC: MASTER UI ORCHESTRATOR v115.0 (Sovereign Production)
 * Institution: Dr. V. S. Krishna Government Degree College (Autonomous)
 * Developed by: M. Thrinadh (https://linkedin.com/in/m3nadh)
 * 
 * Logic: Multi-Role Dashboard, Disciplinary Time-Gates, and AI Command Hub.
 */

const UIManager = {
    user: null,
    isSidebarOpen: false,
    regRole: null,

    // --- 1. ATOMIC BOOT SEQUENCE ---
    async init() {
        console.log("CSync: Initializing Sovereign UI...");
        const pill = document.getElementById('status-pill');
        
        try {
            // A. Immediate UI Release
            lucide.createIcons();
            this.user = JSON.parse(localStorage.getItem('csync_v1_profile'));

            // B. Route View
            if (!this.user) {
                pill.innerText = "IDENTITY UNBOUND: ENROLLMENT READY";
                this.switchView('view-roles');
            } else {
                pill.innerText = "NODE SYNCHRONIZED";
                this.setupRoleEnvironment();
            }

            // C. Background Services (Non-Blocking)
            this.bootBackgroundServices();

        } catch (err) {
            console.error("Boot Failure:", err);
            pill.innerText = "SYSTEM ERROR: RESETTING...";
            localStorage.clear();
            this.switchView('view-roles');
        }
    },

    // --- 2. NAVIGATION & VIEW CONTROL ---
    switchView(id) {
        // Hide all major containers
        const views = ['view-roles', 'view-register', 'view-dashboard', 'view-nexus', 'view-discuss', 'view-architect'];
        views.forEach(v => {
            const el = document.getElementById(v);
            if (el) el.classList.add('hidden-view');
        });

        const target = document.getElementById(id);
        if (target) {
            target.classList.remove('hidden-view');
            // FIX: Restore Touch Interactivity
            target.style.pointerEvents = "auto";
            target.style.zIndex = "10";
        }
        this.closeSidebar();
        lucide.createIcons();
    },

    switchTab(tabId) {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('nav-active'));
        const activeNav = document.getElementById('btn-' + tabId);
        if (activeNav) activeNav.classList.add('nav-active');

        this.switchView('view-' + tabId);

        if (tabId === 'nexus') this.loadNexus();
        if (tabId === 'discuss') this.loadFeed();
        
        if ("vibrate" in navigator) navigator.vibrate(10);
    },

    // --- 3. ROLE-BASED DASHBOARD DISPATCHER ---
    setupRoleEnvironment() {
        this.switchTab('dashboard');
        document.getElementById('nav-bar').classList.remove('hidden-view');
        
        // Identity Mapping
        document.getElementById('u-name').innerText = this.user.name;
        document.getElementById('u-photo').src = this.user.photo;
        document.getElementById('u-photo-top').src = this.user.photo;
        document.getElementById('u-meta').innerText = this.user.role === 'Student' ? 
            `${this.user.year} Year | ${this.user.major}` : this.user.role.toUpperCase();

        // Role-Specific Module Visibility
        const isStudent = (this.user.role === 'Student');
        const isAlumni = (this.user.role === 'Alumni');
        const isStaff = (!isStudent && !isAlumni);

        document.getElementById('module-attendance').classList.toggle('hidden-view', !isStudent);
        document.getElementById('module-staff').classList.toggle('hidden-view', !isStaff);
        
        // Show AI Architect tools only to Lecturer and HOD
        if (this.user.role === 'Lecturer' || this.user.role === 'HOD') {
            document.getElementById('staff-menu').classList.remove('hidden');
        }

        this.refreshAttendanceState();
    },

    // --- 4. DISCIPLINARY TIME-GATE & GEOFENCING ---
    updateSystemGates() {
        const now = new Date();
        const time = now.getHours() + (now.getMinutes() / 60);
        const pill = document.getElementById('status-pill');
        
        const fnWindow = (time >= 10 && time <= 13.33); // 10:00 - 1:20 PM
        const pauseWindow = (time > 13.33 && time < 15.5); // 1:20 - 3:30 PM (Break)
        const anWindow = (time >= 15.5 && time <= 17);  // 3:30 - 5:00 PM
        const labOpen = (time >= 10 && time <= 17);

        if (fnWindow) pill.innerHTML = `<span class="text-cyan-400 animate-pulse">● FN SESSION LIVE</span>`;
        else if (pauseWindow) pill.innerHTML = `<span class="text-orange-400">● LUNCH | LAB OPEN</span>`;
        else if (anWindow) pill.innerHTML = `<span class="text-cyan-400 animate-pulse">● AN SESSION LIVE</span>`;
        else pill.innerHTML = `<span class="text-red-500">○ PORTAL LOCKED</span>`;

        // Manage button state based on window
        const isMarked = localStorage.getItem('csync_marked_today') === now.toDateString();
        const attBtn = document.getElementById('btn-presence');
        if (attBtn) attBtn.disabled = (!fnWindow && !anWindow) || isMarked;
    },

    startGeofencing() {
        if (!navigator.geolocation || this.user.role !== 'Student') return;
        
        navigator.geolocation.watchPosition(pos => {
            const lat2 = 17.7441, lon2 = 83.3102; // Dr. VSK GDC Coords
            const dist = Math.sqrt(Math.pow(pos.coords.latitude-lat2,2) + Math.pow(pos.coords.longitude-lon2,2)) * 111.32;
            
            const msg = document.getElementById('geo-msg');
            const icon = document.getElementById('geo-icon');
            const btn = document.getElementById('btn-presence');

            if (dist < 0.4) { // 400 meters
                msg.innerHTML = `<span class="text-emerald-400">PULSE SYNCED: ON CAMPUS</span>`;
                icon.style.color = "#10b981";
                if(!localStorage.getItem('csync_marked_today')) btn.disabled = false;
            } else {
                msg.innerHTML = `<span class="text-red-500">PULSE LOST: OUTSIDE CAMPUS</span>`;
                icon.style.color = "#ef4444";
                btn.disabled = true;
            }
        }, null, { enableHighAccuracy: true });
    },

    // --- 5. ENROLLMENT WORKFLOW ---
    openReg(role) {
        this.regRole = role;
        this.switchView('view-register');
        document.getElementById('reg-title').innerText = role + " Enrollment";
        document.getElementById('stu-fields').classList.toggle('hidden', role !== 'Student');
        
        const rId = document.getElementById('r-id');
        rId.placeholder = (role === 'Student' || role === 'Alumni') ? "Enter Roll Number" : "Enter Staff ID";
        
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then(s => document.getElementById('v-reg').srcObject = s);
    },

    async processRegistration() {
        const id = document.getElementById('r-id').value;
        const name = document.getElementById('r-name').value;
        if(!id || !name) return alert("Sovereign Error: Missing Identity Fields.");

        const canvas = document.getElementById('c-resize');
        const video = document.getElementById('v-reg');
        canvas.width = 120; canvas.height = 120;
        canvas.getContext('2d').drawImage(video, 0, 0, 120, 120);
        const photo = canvas.toDataURL('image/jpeg', 0.6);

        const payload = {
            action: "register", role: this.regRole, id, name, photo, uuid: UUID,
            major: document.getElementById('r-major').value || "N/A",
            year: document.getElementById('r-year').value || "0",
            pEmail: document.getElementById('r-pmail').value || "N/A"
        };

        document.getElementById('status-pill').innerText = "BINDING BIOMETRIC NODE...";
        const res = await fetch(CSYNC_CONFIG.BACKEND_URL, { method: 'POST', body: JSON.stringify(payload) });
        if ((await res.text()) === "REGISTRATION_SUCCESS") {
            localStorage.setItem('csync_v1_profile', JSON.stringify(payload));
            location.reload();
        }
    },

    // --- 6. AI COMMAND TERMINAL ---
    async executeAI() {
        const input = document.getElementById('ai-input');
        const resp = document.getElementById('ai-response');
        if(!input.value.trim()) return;

        resp.classList.remove('hidden');
        resp.innerText = "Consulting Llama 3.1 Neural Cloud...";
        
        const res = await fetch(`${CSYNC_CONFIG.BACKEND_URL}?action=ai_helpdesk&query=${encodeURIComponent(input.value)}&role=${this.user.role}`);
        resp.innerText = await res.text();
        input.value = "";
    },

    // --- 7. UTILS ---
    bootBackgroundServices() {
        this.updateSystemGates();
        setInterval(() => this.updateSystemGates(), 60000);
        if(this.user && this.user.role === 'Student') this.startGeofencing();
        
        // Background load models (Non-blocking)
        AuthEngine.loadModels();
    },

    refreshAttendanceState() {
        const marked = localStorage.getItem('csync_marked_today') === new Date().toDateString();
        const pc = localStorage.getItem('csync_active_pc');
        
        document.getElementById('module-attendance').classList.toggle('hidden-view', marked || this.user.role !== 'Student');
        document.getElementById('module-lab').classList.toggle('hidden-view', !marked || pc || this.user.role !== 'Student');
        document.getElementById('module-active-pc').classList.toggle('hidden-view', !pc);
        if(pc) document.getElementById('active-pc-display').innerText = pc;
    },

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
        document.getElementById('sidebar').classList.toggle('open', this.isSidebarOpen);
    },

    closeSidebar() {
        this.isSidebarOpen = false;
        const s = document.getElementById('sidebar');
        if(s) s.classList.remove('open');
    },

    forceLogout(msg) {
        alert(msg);
        localStorage.clear();
        location.reload();
    }
};

// Initialize when browser is ready
window.addEventListener('load', () => UIManager.init());
