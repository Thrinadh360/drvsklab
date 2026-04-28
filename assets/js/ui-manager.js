/**
 * CSYNC: MASTER UI ORCHESTRATOR v112.0 (Atomic Boot)
 * Developed by: M. Thrinadh
 */

const UIManager = {
    user: null,

    async init() {
        console.log("CSync: Atomic Boot Sequence Initiated...");
        const pill = document.getElementById('status-pill');
        
        try {
            // 1. Instant UI Release (Prevent Hang)
            lucide.createIcons();
            this.user = JSON.parse(localStorage.getItem('csync_v1_profile'));

            // 2. Route View Immediately
            if (!this.user) {
                pill.innerText = "IDENTITY UNBOUND";
                this.switchView('view-roles');
            } else {
                pill.innerText = "NODE SYNCED";
                this.setupRoleEnvironment();
            }

            // 3. Background Processing (Does not block UI)
            this.loadBackgroundServices();

        } catch (err) {
            console.error("Boot Error:", err);
            pill.innerText = "SYSTEM ERROR: RESET DATA";
            this.switchView('view-roles'); // Fallback to roles
        }
    },

    async loadBackgroundServices() {
        // Load AI Vision in background
        AuthEngine.loadModels().then(() => {
            console.log("CSync: AI Vision Pulse Online.");
        });

        // Start Clock & Time Gates
        this.updatePill();
        setInterval(() => this.updatePill(), 60000);

        // Start Geofencing if student
        if (this.user && this.user.role === 'Student') {
            this.startGeofencing();
        }
    },

    switchView(id) {
        // Explicitly hide all top-level views
        document.querySelectorAll('main > div').forEach(v => v.classList.add('hidden-view'));
        
        const target = document.getElementById(id);
        if(target) {
            target.classList.remove('hidden-view');
            // FIX: Restore Touch Interactivity
            target.style.pointerEvents = "auto";
        }
        lucide.createIcons();
    },

    // ... (Keep existing pickRole, executeAI, and setupRoleEnvironment logic)
};

// Force start on Load
window.addEventListener('load', () => UIManager.init());
