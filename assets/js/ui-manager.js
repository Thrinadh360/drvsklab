/**
 * CSYNC: MASTER UI ORCHESTRATOR v116.0
 * Developed by: M. Thrinadh (https://linkedin.com/in/m3nadh)
 * Logic: Universal Lab Access & Disciplinary Timing
 */

const UIManager = {
    user: null,
    isSidebarOpen: false,

    async init() {
        lucide.createIcons();
        this.user = JSON.parse(localStorage.getItem('csync_v1_profile'));

        if (!this.user) {
            this.switchView('view-roles');
        } else {
            this.setupRoleEnvironment();
            this.bootBackgroundServices();
        }
    },

    // --- UNIVERSAL ROLE DISPATCHER ---
    setupRoleEnvironment() {
        this.switchTab('dashboard');
        document.getElementById('nav-bar').classList.remove('hidden-view');
        
        // Identity Mapping
        document.getElementById('u-name').innerText = this.user.name;
        document.getElementById('u-photo').src = this.user.photo;
        document.getElementById('u-photo-top').src = this.user.photo;
        document.getElementById('u-meta').innerText = this.user.role === 'Student' ? 
            `${this.user.year} Year | ${this.user.major}` : this.user.role.toUpperCase();

        // VISIBILITY: Unlock Staff Suite
        if (this.user.role !== 'Student' && this.user.role !== 'Alumni') {
            document.getElementById('staff-menu').classList.remove('hidden');
            document.getElementById('module-staff').classList.remove('hidden-view');
        }

        this.refreshAttendanceState();
    },

    // --- REFRESH LAB & ATTENDANCE STATES ---
    refreshAttendanceState() {
        const isMarked = localStorage.getItem('csync_marked_today') === new Date().toDateString();
        const activePC = localStorage.getItem('csync_active_pc');

        const attCard = document.getElementById('module-attendance');
        const labCard = document.getElementById('module-lab');
        const activeCard = document.getElementById('module-active-pc');

        // Attendance is for Students only
        if (this.user.role === 'Student') {
            attCard.classList.toggle('hidden-view', isMarked);
        } else {
            attCard.classList.add('hidden-view');
        }

        // UNIVERSAL LAB ACCESS: Available for Students, Lecturers, LabAsst, and HOD
        // Staff can use Lab even if they haven't marked "Student Attendance"
        const canUseLab = (this.user.role !== 'Alumni');
        
        if (canUseLab) {
            if (activePC) {
                labCard.classList.add('hidden-view');
                activeCard.classList.remove('hidden-view');
                document.getElementById('active-pc-display').innerText = activePC;
            } else {
                // Students must mark attendance first, Staff can enter directly
                if (this.user.role === 'Student') {
                    labCard.classList.toggle('hidden-view', !isMarked);
                } else {
                    labCard.classList.remove('hidden-view');
                }
            }
        }
    },

    switchView(id) {
        document.querySelectorAll('main > div').forEach(v => v.classList.add('hidden-view'));
        const target = document.getElementById(id);
        if (target) {
            target.classList.remove('hidden-view');
            target.style.pointerEvents = "auto";
        }
        this.closeSidebar();
        lucide.createIcons();
    },

    switchTab(tabId) {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('nav-active'));
        document.getElementById('btn-' + tabId).classList.add('nav-active');
        this.switchView('tab-' + tabId);
    },

    // ... executeAI and other logic ...
};

window.onload = () => UIManager.init();
