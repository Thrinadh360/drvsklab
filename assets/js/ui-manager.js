/**
 * CSYNC: MASTER UI ORCHESTRATOR v110.6
 * Developed by: M. Thrinadh
 */

const UIManager = {
    user: null,

    async init() {
        this.user = JSON.parse(localStorage.getItem('csync_v1_profile'));
        lucide.createIcons();
        
        if (!this.user) {
            this.switchTab('dashboard'); // Default view
            this.switchView('view-roles');
        } else {
            this.setupSession();
        }
    },

    // 1. DYNAMIC REGISTRATION PLACEHOLDERS
    openReg(role) {
        this.regRole = role;
        this.switchView('view-register');
        
        const idInput = document.getElementById('r-id');
        const stuFields = document.getElementById('stu-fields');
        
        // Contextual Placeholders
        if (role === 'Student' || role === 'Alumni') {
            idInput.placeholder = "ID Number (Roll No)";
            stuFields.classList.remove('hidden');
        } else {
            idInput.placeholder = "Employee ID";
            stuFields.classList.add('hidden');
        }
        
        document.getElementById('reg-title').innerText = role + " Enrollment";
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } }).then(s => {
            document.getElementById('v-reg').srcObject = s;
        });
    },

    // 2. ROLE-BASED HUB SETUP
    setupSession() {
        this.switchView('view-dashboard');
        document.getElementById('nav-bar').classList.remove('hidden-view');
        document.getElementById('u-photo-top').src = this.user.photo;
        
        // GATE: Only show "Academic Architect" to Faculty
        if (this.user.role === 'Lecturer' || this.user.role === 'HOD') {
            document.getElementById('btn-architect').classList.remove('hidden');
            document.getElementById('staff-menu').classList.remove('hidden');
        }

        this.switchTab('dashboard');
    },

    // 3. TAB MANAGEMENT
    switchTab(tabId) {
        // Toggle Nav Icons
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('nav-active'));
        const activeNav = document.getElementById('btn-' + tabId);
        if (activeNav) activeNav.classList.add('nav-active');

        // Toggle Content Views
        document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('tab-active'));
        const targetView = document.getElementById('view-' + tabId);
        if (targetView) targetView.classList.add('tab-active');

        // Load Data Nodes
        if (tabId === 'nexus') this.loadNexus();
        if (tabId === 'discuss') this.loadFeed();
        
        if ("vibrate" in navigator) navigator.vibrate(10);
        lucide.createIcons();
    },

    // --- DATA LOADERS (Working Nexus & Feed) ---
    async loadNexus() {
        const container = document.getElementById('nexus-container');
        container.innerHTML = '<p class="text-center animate-pulse text-[10px]">Syncing Nexus...</p>';
        const data = await CloudSync.getNexusDirectory();
        container.innerHTML = data.map(s => `
            <div class="glass p-4 rounded-3xl flex items-center gap-4">
                <img src="${s.PhotoBase64}" class="w-12 h-12 rounded-2xl object-cover border border-cyan-400/30">
                <div class="flex-1">
                    <h4 class="font-black text-xs uppercase">${s.Name}</h4>
                    <p class="text-[8px] text-slate-500 uppercase">${s.Major} | ${s.Year} Year</p>
                </div>
            </div>
        `).join('');
    },

    async loadFeed() {
        const container = document.getElementById('discuss-feed');
        container.innerHTML = '<p class="text-center animate-pulse text-[10px]">Syncing Feed...</p>';
        const res = await fetch(`${CSYNC_CONFIG.BACKEND_URL}?action=getDiscussions`);
        const posts = await res.json();
        container.innerHTML = posts.map(p => `
            <div class="glass p-5 rounded-2xl">
                <p class="text-[9px] font-black text-cyan-400 mb-2 uppercase">${p.User}</p>
                <p class="text-xs text-white">${p.Message}</p>
                <p class="text-[7px] text-slate-600 mt-2">Sentiment: ${p.Sentiment}</p>
            </div>
        `).join('');
    }
};

window.onload = () => UIManager.init();
