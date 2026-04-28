/**
 * CSYNC: MASTER UI ORCHESTRATOR v110.0
 * Institution: Dr. V.S. Krishna Government Degree College (Autonomous)
 * Developed by: M. Thrinadh (https://linkedin.com/in/m3nadh)
 * 
 * Features: Multi-Role HUD, Disciplinary Time-Gates, Geofencing & AI Terminal.
 */

const UIManager = {
    user: null,
    activeTab: 'dashboard',
    regRole: null,
    isSidebarOpen: false,

    // 1. SYSTEM INITIALIZATION
    async init() {
        console.log("CSync: Initializing Sovereign UI...");
        
        // Load identity node from storage
        const storedUser = localStorage.getItem('csync_user_v1');
        this.user = storedUser ? JSON.parse(storedUser) : null;

        lucide.createIcons();
        this.handlePWAInstallation(); // Check for install banner

        if (!this.user) {
            this.switchView('view-roles');
            document.getElementById('status-pill').innerText = "NODE UNBOUND: ENROLLMENT READY";
        } else {
            this.setupUserDashboard();
            this.startDisciplinaryPulse();
        }
    },

    // 2. NAVIGATION: VIEW SWITCHER
    switchView(viewId) {
        // Hide all major views
        ['view-roles', 'view-register', 'view-dashboard', 'view-nexus', 'view-discuss', 'view-architect'].forEach(v => {
            const el = document.getElementById(v);
            if (el) el.classList.add('hidden-view');
        });

        const target = document.getElementById(viewId);
        if (target) {
            target.classList.remove('hidden-view');
            // 🛠️ CRITICAL FIX: Ensure touch events are captured for inputs
            target.style.pointerEvents = "auto";
        }
        if ("vibrate" in navigator) navigator.vibrate(10);
        lucide.createIcons();
    },

    // 3. NAVIGATION: TAB SWITCHER (Bottom Nav)
    switchTab(tabId) {
        this.activeTab = tabId;
        
        // Update Nav Icon States
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('nav-active'));
        const activeNav = document.getElementById('btn-' + tabId);
        if (activeNav) activeNav.classList.add('nav-active');

        // Toggle Content
        this.switchView('view-' + tabId);

        // On-demand Data Loading
        if (tabId === 'nexus') this.loadNexus();
        if (tabId === 'discuss') this.loadFeed();
        
        if ("vibrate" in navigator) navigator.vibrate(15);
    },

    // 4. DISCIPLINARY LOGIC (Time-Gates)
    updateSystemGates() {
        const now = new Date();
        const time = now.getHours() + (now.getMinutes() / 60);
        const pill = document.getElementById('status-pill');
        
        const T = CSYNC_CONFIG.TIMINGS;
        const isMarked = localStorage.getItem('csync_marked_today') === new Date().toDateString();

        if (time < T.FN_START || time >= T.CLOSE_LOCK) {
            pill.innerHTML = `<span class="text-red-500">○ PORTAL LOCKED (5PM-10AM)</span>`;
            this.toggleAttendanceUI(false);
        } else if (time >= T.FN_START && time <= T.FN_END) {
            pill.innerHTML = `<span class="text-cyan-400 pulse">● FN ATTENDANCE LIVE</span>`;
            this.toggleAttendanceUI(!isMarked);
        } else if (time > T.FN_END && time < T.AN_START) {
            pill.innerHTML = `<span class="text-orange-400">● LUNCH | LAB ONLY MODE</span>`;
            this.toggleAttendanceUI(false);
        } else if (time >= T.AN_START && time < T.CLOSE_LOCK) {
            pill.innerHTML = `<span class="text-cyan-400 pulse">● AN ATTENDANCE LIVE</span>`;
            this.toggleAttendanceUI(!isMarked);
        }
    },

    toggleAttendanceUI(show) {
        const card = document.getElementById('module-attendance');
        const lab = document.getElementById('module-lab');
        if (card) card.style.display = show ? "block" : "none";
        // Lab scanner stays open 10-5
        if (lab) lab.style.display = (this.user && !localStorage.getItem('active_pc')) ? "block" : "none";
    },

    // 5. ENROLLMENT FLOW
    openReg(role) {
        this.regRole = role;
        this.switchView('view-register');
        document.getElementById('reg-title').innerText = role.toUpperCase() + " ENROLLMENT";
        
        const idInp = document.getElementById('r-id');
        const stuFields = document.getElementById('stu-fields');
        
        // FIX: Update Placeholders based on Role
        if (role === 'Student' || role === 'Alumni') {
            idInp.placeholder = "Enter Roll Number";
            stuFields.classList.remove('hidden');
        } else {
            idInp.placeholder = "Enter Staff ID";
            stuFields.classList.add('hidden');
        }

        // Start Camera
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then(s => document.getElementById('v-reg').srcObject = s);
    },

    async processRegistration() {
        const id = document.getElementById('r-id').value;
        const name = document.getElementById('r-name').value;
        if(!id || !name) return alert("All fields required.");

        const pill = document.getElementById('status-pill');
        pill.innerText = "BINDING BIOMETRICS...";

        // 1. Capture Photo
        const video = document.getElementById('v-reg');
        const canvas = document.getElementById('c-resize');
        canvas.width = 120; canvas.height = 120;
        canvas.getContext('2d').drawImage(video, 0, 0, 120, 120);
        const photo = canvas.toDataURL('image/jpeg', 0.6);

        // 2. Perform Hardware Handshake (Fingerprint)
        const fpId = await AuthEngine.enrollFingerprint(id, name);
        if(!fpId) return pill.innerText = "FP BINDING FAILED";

        const payload = {
            action: "register",
            role: this.regRole,
            id: id,
            name: name,
            major: document.getElementById('r-major').value || "N/A",
            year: document.getElementById('r-year').value || "0",
            pEmail: document.getElementById('r-pmail').value || "N/A",
            uuid: AuthEngine.getDeviceUUID(),
            photo: photo,
            fpId: fpId
        };

        const res = await CloudSync.registerUser(payload);
        if (res === "REGISTRATION_SUCCESS") {
            localStorage.setItem('csync_user_v1', JSON.stringify(payload));
            location.reload();
        } else {
            alert(res);
            pill.innerText = "SYNC ERROR";
        }
    },

    // 6. DASHBOARD ENGINE
    setupUserDashboard() {
        this.switchView('view-dashboard');
        document.getElementById('nav-bar').classList.remove('hidden-view');
        
        document.getElementById('u-name').innerText = this.user.name;
        document.getElementById('u-photo-top').src = this.user.photo;
        document.getElementById('u-photo').src = this.user.photo;
        document.getElementById('u-meta').innerText = this.user.role === 'Student' ? 
            `${this.user.year} Year | ${this.user.major}` : this.user.role.toUpperCase();

        // Facuty/HOD Privileges
        if (this.user.role !== 'Student' && this.user.role !== 'Alumni') {
            document.getElementById('staff-menu').classList.remove('hidden');
        }
        
        // Start Geofencing
        this.startCampusLock();
    },

    startCampusLock() {
        const status = document.getElementById('geo-msg');
        const btn = document.getElementById('btn-presence');
        const icon = document.getElementById('geo-icon');

        if (!navigator.geolocation) return;

        navigator.geolocation.watchPosition(pos => {
            const lat2 = 17.7441, lon2 = 83.3102; // VSK GDC Coords
            const lat1 = pos.coords.latitude, lon1 = pos.coords.longitude;
            const dist = Math.sqrt(Math.pow(lat1-lat2,2) + Math.pow(lon1-lon2,2)) * 111.32;

            if (dist < 0.35) { // 350 meters
                btn.disabled = false;
                status.innerHTML = `<span class="text-emerald-400">PULSE SYNCED: ON CAMPUS</span>`;
                icon.style.color = "#10b981";
            } else {
                btn.disabled = true;
                status.innerHTML = `<span class="text-red-500">PULSE LOST: OUTSIDE CAMPUS</span>`;
                icon.style.color = "#ef4444";
            }
        }, null, { enableHighAccuracy: true });
    },

    async executeAI() {
        const input = document.getElementById('ai-input');
        const resp = document.getElementById('ai-response');
        if(!input.value.trim()) return;

        resp.classList.remove('hidden');
        resp.innerText = "Consulting Sovereign AI...";
        
        const result = await CloudSync.sendAICommand(input.value, this.user);
        resp.innerText = result;
        input.value = "";
    },

    // 7. PWA INSTALLATION
    handlePWAInstallation() {
        const banner = document.getElementById('install-banner');
        const btn = document.getElementById('btn-install-now');
        const ios = document.getElementById('ios-instruction');

        if (window.matchMedia('(display-mode: standalone)').matches) return;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            window.deferredPrompt = e;
            banner.classList.remove('hidden-view');
        });

        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            banner.classList.remove('hidden-view');
            btn.classList.add('hidden');
            ios.classList.remove('hidden');
        }

        btn.onclick = async () => {
            if (!window.deferredPrompt) return;
            window.deferredPrompt.prompt();
            banner.classList.add('hidden-view');
        };
    },

    startDisciplinaryPulse() {
        this.updateSystemGates();
        setInterval(() => this.updateSystemGates(), 60000);
    },

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
        document.getElementById('sidebar').classList.toggle('open', this.isSidebarOpen);
    },

    forceLogout(msg) {
        alert(msg || "Security Reset Initiated.");
        localStorage.clear();
        location.reload();
    }
};

/**
 * Developed by M. Thrinadh
 * Sovereign Execution Seal
 */
window.UIManager = UIManager;
window.onload = () => UIManager.init();
