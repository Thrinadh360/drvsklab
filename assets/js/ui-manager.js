/**
 * CSYNC: MASTER UI ORCHESTRATOR v1.6.2 (Anti-Hang Patch)
 * Developed by: M. Thrinadh
 */

const UIManager = {
    user: null,
    isSidebarOpen: false,

    async init() {
        const pill = document.getElementById('status-pill');
        console.log("CSync: Booting Sovereign UI...");

        try {
            // 1. Clear UI state immediately to prevent "Stuck" look
            pill.innerText = "INITIALIZING CORE...";
            pill.classList.add('shimmer');

            // 2. Critical dependency check
            if (!window.AuthEngine || !window.CloudSync) {
                throw new Error("Core logic files missing. Check script tags.");
            }

            // 3. Load Session from LocalStorage
            const storedData = localStorage.getItem('csync_v1_profile');
            this.user = storedData ? JSON.parse(storedData) : null;

            // 4. Update Disciplinary Timings (From Config.js)
            this.updateSystemGates();

            // 5. ROUTING GATEWAY
            if (!this.user) {
                pill.innerText = "NODE UNBOUND: READY FOR ENROLLMENT";
                this.switchView('view-roles');
            } else {
                pill.innerText = "IDENTITY NODE: SYNCHRONIZED";
                this.setupDashboard();
            }

            // 6. Background Load heavy AI Models (Doesn't block UI anymore)
            AuthEngine.loadModels().then(() => {
                console.log("CSync AI: Neural Grid Online.");
            }).catch(e => {
                pill.innerText = "AI OFFLINE: CHECK PERMISSIONS";
                console.error("AI Load Fail", e);
            });

            lucide.createIcons();

        } catch (err) {
            console.error("Boot Error:", err);
            pill.innerText = "SYSTEM ERROR: RELOAD REQUIRED";
            pill.style.color = "#ef4444";
        }
    },

    switchView(id) {
        // Hide all top-level views
        const views = ['view-roles', 'view-register', 'view-dashboard'];
        views.forEach(v => {
            const el = document.getElementById(v);
            if (el) el.classList.add('hidden-view');
        });

        const target = document.getElementById(id);
        if (target) {
            target.classList.remove('hidden-view');
            // FIX: Restore touch ability for inputs
            target.style.pointerEvents = "auto";
            target.style.zIndex = "10";
        }
        lucide.createIcons();
    },

    openReg(role) {
        localStorage.setItem('temp_reg_role', role);
        this.switchView('view-register');
        document.getElementById('reg-title').innerText = role + " ENROLLMENT";
        document.getElementById('stu-fields').classList.toggle('hidden', role !== 'Student');
        
        // Access Camera immediately
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then(s => { document.getElementById('v-reg').srcObject = s; })
            .catch(e => alert("Camera blocked. Please allow camera access."));
    },

    setupDashboard() {
        this.switchView('view-dashboard');
        document.getElementById('nav-bar').classList.remove('hidden');
        if (this.user.photo) {
            document.getElementById('u-photo-top').src = this.user.photo;
            const dashPhoto = document.getElementById('u-photo');
            if(dashPhoto) dashPhoto.src = this.user.photo;
        }
        document.getElementById('u-name').innerText = this.user.name;
        document.getElementById('u-meta').innerText = this.user.role === 'Student' ? 
            `${this.user.year} Year | ${this.user.major}` : this.user.role;
    },

    updateSystemGates() {
        const now = new Date();
        const time = now.getHours() + (now.getMinutes() / 60);
        const pill = document.getElementById('status-pill');
        // Timing logic from CSYNC_CONFIG...
    },

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
        document.getElementById('sidebar').classList.toggle('open', this.isSidebarOpen);
    }
};

// Force trigger on window load
window.addEventListener('load', () => UIManager.init());
