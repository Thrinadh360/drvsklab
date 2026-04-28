/**
 * CSYNC: MASTER UI ORCHESTRATOR v110.0
 * Institution: Dr. V. S. Krishna Government Degree College (Autonomous)
 * Developed by: M. Thrinadh (https://linkedin.com/in/m3nadh)
 * 
 * Logic: Multi-Role HUD, 99% Automation, and Disciplinary Gates.
 */

const UIManager = {
    user: null,
    activeTab: 'dashboard',
    isSidebarOpen: false,

    // 1. INITIALIZE SYSTEM
    async init() {
        // Load Sovereign Identity Node from LocalStorage
        this.user = JSON.parse(localStorage.getItem('csync_user_v1'));
        
        lucide.createIcons();
        this.updateSystemGates();
        setInterval(() => this.updateSystemGates(), 60000); // Pulse every minute

        if (!this.user) {
            this.switchView('view-roles');
        } else {
            this.validateCloudSession();
            this.setupDashboard();
            this.pollAnnouncements();
            setInterval(() => this.pollAnnouncements(), 30000);
        }
        
        this.setupTouchProtection();
    },

    // 2. VIEW SWITCHER (Main Application States)
    switchView(viewId) {
        const views = ['view-roles', 'view-register', 'view-dashboard'];
        views.forEach(v => {
            const el = document.getElementById(v);
            if (el) el.classList.add('hidden-view');
        });

        const target = document.getElementById(viewId);
        if (target) {
            target.classList.remove('hidden-view');
            // FIX: Ensure inputs are interactive
            target.style.pointerEvents = "auto";
            target.style.userSelect = "text";
        }
        this.closeSidebar();
        if ("vibrate" in navigator) navigator.vibrate(10);
        lucide.createIcons();
    },

    // 3. TAB SWITCHER (Dashboard Inner Modules)
    async switchTab(tabId) {
        this.activeTab = tabId;
        
        // UI Visual Update
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('nav-active'));
        const activeNav = document.getElementById('tab-' + tabId);
        if (activeNav) activeNav.classList.add('nav-active');

        // View Swapping
        const tabs = ['dashboard', 'nexus', 'discuss', 'architect', 'audit', 'support'];
        tabs.forEach(t => {
            const el = document.getElementById('view-' + t);
            if (el) el.classList.add('hidden-view');
        });

        const target = document.getElementById('view-' + tabId);
        if (target) target.classList.remove('hidden-view');

        // Data Dynamic Loading
        if (tabId === 'nexus') this.loadNexusDirectory();
        if (tabId === 'discuss') this.loadDiscussionHub();
        
        if ("vibrate" in navigator) navigator.vibrate(15);
        lucide.createIcons();
    },

    // 4. DISCIPLINARY TIME-GATE (10 AM - 5 PM)
    updateSystemGates() {
        const now = new Date();
        const hrs = now.getHours();
        const mins = now.getMinutes();
        const time = hrs + (mins / 60);
        
        const pill = document.getElementById('status-pill');
        const attCard = document.getElementById('module-attendance');
        const labCard = document.getElementById('module-lab');
        
        // Defined Windows by M. Thrinadh
        const fnWindow = (time >= 10 && time <= 13.33); // 10:00 - 1:20 PM
        const pauseWindow = (time > 13.33 && time < 15.5); // 1:20 - 3:30 PM (Lunch/Pause)
        const anWindow = (time >= 15.5 && time <= 17);  // 3:30 - 5:00 PM
        const labOpen = (time >= 10 && time <= 17);

        if (fnWindow) {
            pill.innerHTML = `<span class="text-cyan-400 animate-pulse">● FN SESSION LIVE</span>`;
        } else if (pauseWindow) {
            pill.innerHTML = `<span class="text-orange-400">● LUNCH | ATTENDANCE PAUSED</span>`;
        } else if (anWindow) {
            pill.innerHTML = `<span class="text-cyan-400 animate-pulse">● AN SESSION LIVE</span>`;
        } else {
            pill.innerHTML = `<span class="text-red-500">○ PORTAL LOCKED (10AM-5PM)</span>`;
        }

        // Action Logic
        const isMarked = localStorage.getItem('csync_marked_today') === new Date().toDateString();
        if (attCard) attCard.style.display = ((fnWindow || anWindow) && !isMarked) ? "block" : "none";
        if (labCard) labCard.style.display = (labOpen && isMarked) ? "block" : "none";
    },

    // 5. DATA RENDERING (NEXUS & DISCUSSION)
    async loadNexusDirectory() {
        const container = document.getElementById('nexus-container');
        container.innerHTML = '<div class="text-center py-10 opacity-30 text-[10px] tracking-widest">PULSING NEXUS NODES...</div>';
        
        const data = await CloudSync.getNexusDirectory();
        container.innerHTML = data.map(s => `
            <div class="glass p-5 rounded-[2rem] flex items-center gap-4 border-b-2 border-indigo-500/20 active:scale-95 transition">
                <img src="${s.PhotoBase64 || 'https://ui-avatars.com/api/?name='+s.Name}" class="w-14 h-14 rounded-2xl object-cover border border-indigo-500/30">
                <div class="flex-1">
                    <h4 class="font-black text-xs uppercase text-slate-100">${s.Name}</h4>
                    <p class="text-[8px] text-slate-500 uppercase tracking-tighter">${s.Major} | Batch ${s.Year}</p>
                </div>
                <a href="${s.LinkedIn}" target="_blank" class="text-cyan-400 p-2"><i data-lucide="linkedin" class="w-4 h-4"></i></a>
            </div>
        `).join('');
        lucide.createIcons();
    },

    // 6. ROLE-BASED DASHBOARD CONFIG
    setupDashboard() {
        this.switchView('view-dashboard');
        document.getElementById('nav-bar').classList.remove('hidden-view');
        
        document.getElementById('u-name').innerText = this.user.name;
        document.getElementById('u-photo-top').src = this.user.photo;
        document.getElementById('u-meta').innerText = this.user.role === 'Student' ? 
            `${this.user.year} Year | ${this.user.major}` : this.user.role.toUpperCase();

        // Staff Privileges Logic
        if (this.user.role !== 'Student' && this.user.role !== 'Alumni') {
            document.getElementById('staff-menu').classList.remove('hidden');
            document.getElementById('module-staff').classList.remove('hidden-view');
        }
        this.refreshAttendanceState();
    },

    // 7. UTILS & SIDEBAR
    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
        document.getElementById('sidebar').classList.toggle('open', this.isSidebarOpen);
        if ("vibrate" in navigator) navigator.vibrate(5);
    },

    closeSidebar() {
        this.isSidebarOpen = false;
        const s = document.getElementById('sidebar');
        if(s) s.classList.remove('open');
    },

    async validateCloudSession() {
        // Minimal ping to check if user still exists in Google Sheet
        const res = await fetch(`${CloudSync.apiUrl}?action=verify&id=${this.user.id}`);
        if (res.status === 401) this.forceLogout("Session Expired.");
    },

    forceLogout(msg) {
        alert(msg);
        localStorage.clear();
        location.reload();
    },

    setupTouchProtection() {
        // Prevent ghost clicks on navigation
        document.addEventListener('click', (e) => {
            if (this.isSidebarOpen && !e.target.closest('#sidebar') && !e.target.closest('header')) {
                this.closeSidebar();
            }
        });
    }
};

/**
 * Developed by M. Thrinadh
 * Master Logic Synchronizer
 */
window.onload = () => UIManager.init();
