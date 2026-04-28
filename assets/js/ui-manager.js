/**
 * CSYNC: MASTER UI ORCHESTRATOR v102.5
 * Institution: Dr. V. S. Krishna Government Degree College (Autonomous)
 * Developed by: M. Thrinadh (https://linkedin.com/in/m3nadh)
 * 
 * Logic: Role-Based Routing, Disciplinary Gates, and Input Responsiveness.
 */

const UIManager = {
    user: null,
    activeTab: 'dashboard',
    isSidebarOpen: false,

    // 1. INITIALIZE SYSTEM
    async init() {
        this.user = JSON.parse(localStorage.getItem('csync_user_v1'));
        lucide.createIcons();
        
        if (!this.user) {
            this.switchView('view-roles');
        } else {
            this.validateSovereignSession(); // Security check
            this.setupDashboard();
            this.startHeartbeat();
        }
        
        this.setupEventListeners();
    },

    // 2. SECURITY: CLOUD SESSION VALIDATION
    async validateSovereignSession() {
        try {
            const res = await fetch(`${CloudSync.apiUrl}?action=verify_session&id=${this.user.id}&role=${this.user.role}`);
            const status = await res.text();
            if (status === "UNAUTHORIZED") {
                this.forceLogout("Access revoked by Department Office.");
            }
        } catch (e) {
            console.log("Offline mode: Using cached identity node.");
        }
    },

    // 3. NAVIGATION: VIEW SWITCHER
    switchView(viewId) {
        document.querySelectorAll('main > div').forEach(v => v.classList.add('hidden-view'));
        const target = document.getElementById(viewId);
        if (target) {
            target.classList.remove('hidden-view');
            // FIX: Ensure pointer events are active for inputs
            target.style.pointerEvents = "auto";
        }
        this.closeSidebar();
        if ("vibrate" in navigator) navigator.vibrate(10);
    },

    // 4. NAVIGATION: TAB SWITCHER (Inside Dashboard)
    async switchTab(tabId) {
        this.activeTab = tabId;
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('nav-active'));
        const activeNav = document.getElementById('tab-' + tabId);
        if (activeNav) activeNav.classList.add('nav-active');

        // Hide all views first
        const views = ['dashboard', 'nexus', 'discuss', 'architect', 'audit', 'support'];
        views.forEach(v => {
            const el = document.getElementById('view-' + v);
            if (el) el.classList.add('hidden-view');
        });

        // Show target view
        const targetView = document.getElementById('view-' + tabId);
        if (targetView) targetView.classList.remove('hidden-view');

        // Data Loading
        if (tabId === 'nexus') this.loadNexusDirectory();
        if (tabId === 'discuss') this.loadDiscussionHub();
        
        lucide.createIcons();
        if ("vibrate" in navigator) navigator.vibrate(15);
    },

    // 5. ROLE-BASED UI SETUP
    setupDashboard() {
        this.switchView('view-dashboard');
        document.getElementById('nav-bar').classList.remove('hidden-view');
        
        // Populate Personal Profile Node
        document.getElementById('u-name').innerText = this.user.name;
        document.getElementById('u-photo').src = this.user.photo;
        document.getElementById('u-meta').innerText = this.user.role === 'Student' ? 
            `${this.user.year} Year | ${this.user.major}` : this.user.role;

        // Staff Privileges
        if (this.user.role !== 'Student' && this.user.role !== 'Alumni') {
            const staffMenu = document.getElementById('staff-menu');
            if (staffMenu) staffMenu.classList.remove('hidden');
            const staffModule = document.getElementById('module-staff');
            if (staffModule) staffModule.classList.remove('hidden-view');
        }

        this.refreshAttendanceUI();
    },

    // 6. DISCIPLINARY TIME-GATE LOGIC
    updateSystemGates() {
        const now = new Date();
        const hrs = now.getHours();
        const mins = now.getMinutes();
        const time = hrs + (mins / 60);
        
        const pill = document.getElementById('status-pill');
        const attCard = document.getElementById('module-attendance');
        const labCard = document.getElementById('module-lab');
        
        // Timings set by M. Thrinadh
        const fnWindow = (time >= 10 && time <= 13.33); // 10:00 - 1:20 PM
        const anWindow = (time >= 15.5 && time <= 17);  // 3:30 - 5:00 PM
        const labWindow = (time >= 10 && time <= 17);   // 10:00 - 5:00 PM

        if (fnWindow) {
            pill.innerHTML = `<span class="text-cyan-400 animate-pulse">● FN SESSION LIVE</span>`;
        } else if (time > 13.33 && time < 15.5) {
            pill.innerHTML = `<span class="text-orange-400">● LUNCH | LAB ONLY MODE</span>`;
        } else if (anWindow) {
            pill.innerHTML = `<span class="text-cyan-400 animate-pulse">● AN SESSION LIVE</span>`;
        } else {
            pill.innerHTML = `<span class="text-red-500">○ SYSTEMS OFFLINE (5PM-10AM)</span>`;
        }

        // Logic to hide/show specific biometric buttons
        const isMarked = localStorage.getItem('csync_marked_today') === new Date().toDateString();
        if (attCard) attCard.style.display = ((fnWindow || anWindow) && !isMarked) ? "block" : "none";
        if (labCard) labCard.style.display = (labWindow && isMarked) ? "block" : "none";
    },

    // 7. NEXUS & DATA FEEDS
    async loadNexusDirectory() {
        const container = document.getElementById('nexus-container');
        container.innerHTML = '<div class="text-center py-10 opacity-50 text-[10px]">SYNCING NODES...</div>';
        
        const data = await CloudSync.getNexusData();
        container.innerHTML = data.map(s => `
            <div class="glass p-5 rounded-3xl flex items-center gap-4 border-b-2 border-indigo-500/20">
                <img src="${s.PhotoBase64}" class="w-12 h-12 rounded-2xl object-cover border border-indigo-500/30">
                <div class="flex-1">
                    <h4 class="font-black text-xs uppercase">${s.Name}</h4>
                    <p class="text-[8px] text-slate-500 uppercase">${s.Major} | Batch ${s.Year}</p>
                </div>
                <a href="${s.LinkedIn}" target="_blank" class="text-cyan-400"><i data-lucide="linkedin" class="w-4 h-4"></i></a>
            </div>
        `).join('');
        lucide.createIcons();
    },

    // 8. SIDEBAR & UTILS
    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
        const side = document.getElementById('sidebar');
        side.classList.toggle('open', this.isSidebarOpen);
        if ("vibrate" in navigator) navigator.vibrate(5);
    },

    closeSidebar() {
        this.isSidebarOpen = false;
        const side = document.getElementById('sidebar');
        if (side) side.classList.remove('open');
    },

    forceLogout(msg) {
        alert(msg);
        localStorage.clear();
        location.reload();
    },

    startHeartbeat() {
        this.updateSystemGates();
        setInterval(() => this.updateSystemGates(), 60000);
    },

    setupEventListeners() {
        // Handle Sidebar swipe or click outside
        document.addEventListener('click', (e) => {
            if (this.isSidebarOpen && !e.target.closest('#sidebar') && !e.target.closest('header')) {
                this.closeSidebar();
            }
        });
    }
};

/**
 * Institutional Signature
 * Copyright © 2026 | Dept of Computer Science
 * Master Architect: M. Thrinadh
 */
window.onload = () => UIManager.init();
