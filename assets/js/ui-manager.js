/**
 * CSYNC: MASTER UI ORCHESTRATOR v102.6 (Stability Fix)
 * Developed by: M. Thrinadh
 */

const UIManager = {
    user: null,
    isSidebarOpen: false,

    async init() {
        console.log("CSync: Initializing Sovereign UI...");
        lucide.createIcons();
        
        // 1. Load Session
        this.user = JSON.parse(localStorage.getItem('csync_user_v1'));
        
        // 2. Pre-load AI Models (Wait for it)
        await AuthEngine.loadModels();

        // 3. Routing Logic
        if (!this.user) {
            document.getElementById('status-pill').innerText = "NODE UNBOUND: ENROLLMENT READY";
            this.switchView('view-roles');
        } else {
            document.getElementById('status-pill').innerText = "IDENTITY NODE: SYNCHRONIZED";
            this.setupDashboard();
        }
        
        this.updateTimeGate();
        setInterval(() => this.updateTimeGate(), 60000);
    },

    switchView(id) {
        // Force hide all main views
        ['view-roles', 'view-register', 'view-dashboard'].forEach(v => {
            const el = document.getElementById(v);
            if(el) el.classList.add('hidden-view');
        });
        
        const target = document.getElementById(id);
        if (target) {
            target.classList.remove('hidden-view');
            target.classList.add('view-active');
            // FIX: Restore touch ability
            target.style.pointerEvents = "auto";
        }
    },

    openReg(role) {
        this.regRole = role;
        this.switchView('view-register');
        document.getElementById('reg-title').innerText = role + " ENROLLMENT";
        document.getElementById('stu-fields').classList.toggle('hidden', role !== 'Student');
        
        // Start camera for registration
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then(s => document.getElementById('v-reg').srcObject = s);
    },

    setupDashboard() {
        this.switchView('view-dashboard');
        document.getElementById('nav-bar').classList.remove('hidden-view');
        if (this.user.photo) {
            document.getElementById('u-photo-top').src = this.user.photo;
        }
        // Patch AI Input responsiveness
        const aiInput = document.getElementById('ai-input');
        if (aiInput) aiInput.style.pointerEvents = "auto";
    },

    async executeAI() {
        const input = document.getElementById('ai-input');
        const resp = document.getElementById('ai-response');
        if(!input.value.trim()) return;

        resp.classList.remove('hidden');
        resp.innerText = "Consulting Sovereign Intelligence...";
        
        const result = await CloudSync.sendAICommand(input.value, this.user);
        resp.innerText = result;
        input.value = "";
    },

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
        document.getElementById('sidebar').classList.toggle('open', this.isSidebarOpen);
    },

    updateTimeGate() {
        const hr = new Date().getHours();
        const pill = document.getElementById('status-pill');
        if (hr >= 10 && hr < 17) pill.style.color = "#00f2ff";
        else pill.style.color = "#ef4444";
    },

    forceLogout(msg) {
        if(msg) alert(msg);
        localStorage.clear();
        location.reload();
    }
};

// Start when browser is ready
window.addEventListener('load', () => UIManager.init());
