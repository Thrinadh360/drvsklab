/**
 * CSync v1.0 - Dynamic UI & State Manager
 * Dr. V.S. Krishna Govt. Degree College (Autonomous)
 * Developed by: M. Thrinadh (https://linkedin.com/in/m3nadh)
 */

const UIManager = {
    currentUser: null,
    activeTab: 'dashboard',

    // 1. INITIALIZE UI STATE
    async init() {
        this.currentUser = JSON.parse(localStorage.getItem('csync_user_profile'));
        
        if (!this.currentUser) {
            this.switchView('view-roles');
        } else {
            this.setupRoleDashboard();
            this.startGlobalTimers();
        }
        lucide.createIcons();
    },

    // 2. VIEW SWITCHER (Smooth Transitions)
    switchView(viewId) {
        const views = ['view-roles', 'view-register', 'view-dashboard', 'view-discuss', 'view-support'];
        views.forEach(v => {
            const el = document.getElementById(v);
            if (el) el.classList.add('hidden-view');
        });

        const activeView = document.getElementById(viewId);
        if (activeView) {
            activeView.classList.remove('hidden-view');
            // Native-style Haptic on transition
            if ("vibrate" in navigator) navigator.vibrate(10);
        }
        lucide.createIcons();
    },

    // 3. ROLE-BASED DASHBOARD SETUP
    setupRoleDashboard() {
        const role = this.currentUser.role;
        this.switchView('view-dashboard');
        document.getElementById('nav-bar').classList.remove('hidden-view');

        // Populate Identity Card
        document.getElementById('u-name').innerText = this.currentUser.name;
        document.getElementById('u-photo').src = this.currentUser.photo;
        document.getElementById('u-meta').innerText = role === 'Student' ? 
            `${this.currentUser.year} Year | ${this.currentUser.major}` : role;

        // Toggle Visibility of Role-Specific Modules
        const isStudent = (role === 'Student');
        document.getElementById('card-attendance').classList.toggle('hidden-view', !isStudent);
        
        // If Staff, show Management Tools
        const staffTools = document.getElementById('staff-tools');
        if (staffTools) staffTools.classList.toggle('hidden-view', isStudent);
        
        this.refreshAttendanceState();
    },

    // 4. TEMPORAL GATE & SESSION LOGIC
    updateSystemTimeUI() {
        const now = new Date();
        const hrs = now.getHours();
        const mins = now.getMinutes();
        const time = hrs + (mins / 60);
        
        const pill = document.getElementById('status-pill');
        const tip = document.getElementById('ai-tip');

        // Logic Aligned with M. Thrinadh's Disciplinary Windows
        if (time >= 10 && time <= 13.33) {
            pill.innerHTML = `<span class="dot dot-online"></span> FN SESSION LIVE`;
            pill.style.color = "#00f2ff";
        } 
        else if (time > 13.33 && time < 15.5) {
            pill.innerHTML = `<span class="dot dot-offline"></span> LUNCH BREAK | LABS OPEN`;
            pill.style.color = "#f59e0b";
            tip.innerText = "Work on projects; AN Attendance resumes at 3:30 PM.";
        }
        else if (time >= 15.5 && time <= 17) {
            pill.innerHTML = `<span class="dot dot-online"></span> AN SESSION LIVE`;
            pill.style.color = "#00f2ff";
        }
        else {
            pill.innerHTML = `<span class="dot dot-offline"></span> SYSTEM LOCKED (10AM - 5PM)`;
            pill.style.color = "#ef4444";
        }
    },

    // 5. ATTENDANCE STATE PERSISTENCE
    refreshAttendanceState() {
        const isMarked = localStorage.getItem('csync_marked_today') === new Date().toDateString();
        const activePC = localStorage.getItem('active_session_pc');

        const attBtn = document.getElementById('card-attendance');
        const labBtn = document.getElementById('card-lab');
        const activeCard = document.getElementById('card-active-pc');

        if (isMarked) {
            attBtn.classList.add('hidden-view');
            if (activePC) {
                labBtn.classList.add('hidden-view');
                activeCard.classList.remove('hidden-view');
                document.getElementById('active-pc-id').innerText = activePC;
            } else {
                labBtn.classList.remove('hidden-view');
                activeCard.classList.add('hidden-view');
            }
        } else {
            attBtn.classList.remove('hidden-view');
            labBtn.classList.add('hidden-view');
            activeCard.classList.add('hidden-view');
        }
    },

    // 6. BACKGROUND WORKERS
    startGlobalTimers() {
        // Update Time status every minute
        this.updateSystemTimeUI();
        setInterval(() => this.updateSystemTimeUI(), 60000);

        // Poll for HOD Announcements every 30 seconds
        setInterval(() => this.checkAnnouncements(), 30000);
    },

    async checkAnnouncements() {
        if (!this.currentUser) return;
        const roll = this.currentUser.id;
        const year = this.currentUser.year || 0;
        
        const data = await CloudSync.fetchAnnouncements(roll, year);
        if (data.id > (localStorage.getItem('csync_last_ann_id') || 0)) {
            this.showAnnouncement(data);
        }
    },

    showAnnouncement(data) {
        const card = document.getElementById('ann-card');
        const body = document.getElementById('ann-body');
        const sender = document.getElementById('ann-sender');
        
        CloudSync.triggerSuccess(); // Play "Ding" sound
        
        sender.innerText = data.sender.toUpperCase();
        body.innerText = data.body;
        card.classList.remove('hidden-view');
        
        localStorage.setItem('csync_last_ann_id', data.id);
    }
};

/**
 * Developed by M. Thrinadh
 * UI/UX Sovereignty Seal for CSync v1.0
 */
window.UIManager = UIManager;