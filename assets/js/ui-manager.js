/**
 * CSYNC: MASTER UI ORCHESTRATOR v111.0
 * Developed by: M. Thrinadh
 */

const UIManager = {
    user: null,

    async init() {
        this.user = JSON.parse(localStorage.getItem('csync_v1_profile'));
        lucide.createIcons();
        
        if (!this.user) {
            this.switchView('view-roles');
        } else {
            this.setupRoleEnvironment();
        }
        this.updatePill();
    },

    // 1. DYNAMIC ROLE DISPATCHER
    setupRoleEnvironment() {
        this.switchTab('dashboard');
        document.getElementById('nav-bar').classList.remove('hidden-view');
        document.getElementById('role-pill').innerText = this.user.role;
        document.getElementById('u-photo-top').src = this.user.photo;

        // Unlock Modules based on Role
        if (this.user.role === 'Student') {
            document.getElementById('mod-student').classList.remove('hidden-view');
            document.getElementById('student-leave-form').classList.remove('hidden-view');
            this.startCampusLock(); // Only students get geofenced
        } 
        else if (this.user.role === 'Lecturer' || this.user.role === 'HOD') {
            document.getElementById('mod-staff').classList.remove('hidden-view');
            document.getElementById('staff-diary').classList.remove('hidden-view');
            document.getElementById('staff-menu').classList.remove('hidden'); // In sidebar
        }
        else if (this.user.role === 'LabAssistant') {
            document.getElementById('mod-assistant').classList.remove('hidden-view');
            document.getElementById('staff-diary').classList.remove('hidden-view');
            this.loadMiniGrid();
        }
    },

    switchView(id) {
        document.querySelectorAll('main > div').forEach(v => v.classList.add('hidden-view'));
        const target = document.getElementById(id);
        if(target) target.classList.remove('hidden-view');
    },

    switchTab(id) {
        document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('tab-active'));
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('nav-active'));
        
        const targetTab = document.getElementById('tab-' + id);
        const targetBtn = document.getElementById('btn-' + id);
        
        if(targetTab) targetTab.classList.add('tab-active');
        if(targetBtn) targetBtn.classList.add('nav-active');
        
        if ("vibrate" in navigator) navigator.vibrate(10);
        lucide.createIcons();
    },

    async executeAI() {
        const input = document.getElementById('ai-input');
        const resBox = document.getElementById('ai-response');
        if(!input.value.trim()) return;
        
        resBox.classList.remove('hidden');
        resBox.innerText = "Consulting Groq Llama 3.3...";
        
        const result = await CloudSync.sendAICommand(input.value, this.user);
        resBox.innerText = result;
        input.value = "";
    },

    updatePill() {
        const hr = new Date().getHours();
        const pill = document.getElementById('status-pill');
        if (hr >= 10 && hr < 17) pill.style.color = "#00f2ff";
        else pill.style.color = "#ef4444";
    }
};

window.onload = () => UIManager.init();
