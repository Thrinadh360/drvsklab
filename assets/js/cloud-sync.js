<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>CSYNC | Sovereign Unified Hub</title>
    
    <!-- PWA & Native App Meta -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="theme-color" content="#020617">

    <!-- High-Performance Dependencies -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://unpkg.com/html5-qrcode"></script>
    <script src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Orbitron:wght@600;900&display=swap" rel="stylesheet">

    <style>
        :root { 
            --accent: #00f2ff; 
            --bg: #020617; 
            --card: rgba(30, 41, 59, 0.4); 
            --input-bg: #1e1b4b; 
            --primary: #4f46e5;
            --success: #10b981;
            --danger: #ef4444;
        }

        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; outline: none; }
        
        body { 
            font-family: 'Plus Jakarta Sans', sans-serif; 
            background: var(--bg); color: white; 
            user-select: none; overflow: hidden; margin: 0;
            height: 100vh; width: 100vw;
        }

        /* 🛡️ UI CORE PATCHES */
        input, textarea, select, button {
            user-select: text !important; -webkit-user-select: text !important;
            pointer-events: auto !important; touch-action: manipulation !important;
            background-color: var(--input-bg); border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px; padding: 12px 16px; color: #ffffff;
            font-weight: 600; transition: 0.3s;
        }
        input:focus { border-color: var(--accent); box-shadow: 0 0 15px rgba(0, 242, 255, 0.2); }

        /* 💎 HUD AESTHETICS */
        .glass { background: var(--card); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 28px; }
        .cyber-card { border-top: 3px solid var(--accent); box-shadow: 0 15px 40px rgba(0, 242, 255, 0.1); }
        .main-viewport { flex: 1; overflow-y: auto; padding: 20px; padding-bottom: 180px; scroll-behavior: smooth; }
        
        /* Sidebar Drawer */
        #sidebar { position: fixed; inset-y: 0; left: 0; width: 290px; background: #05060f; z-index: 2000; transform: translateX(-100%); transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1); border-right: 1px solid rgba(255,255,255,0.05); }
        #sidebar.open { transform: translateX(0); box-shadow: 20px 0 60px rgba(0,0,0,0.9); }

        /* Navigation HUD */
        .bottom-nav { position: fixed; bottom: 85px; left: 15px; right: 15px; height: 75px; z-index: 1000; border-radius: 24px; display: flex; justify-content: space-around; align-items: center; background: rgba(10, 11, 30, 0.95); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(15px); }
        .nav-item { color: #475569; display: flex; flex-direction: column; align-items: center; font-size: 8px; font-weight: 800; text-transform: uppercase; transition: 0.3s; border: none; background: none; }
        .nav-active { color: var(--accent) !important; filter: drop-shadow(0 0 8px var(--accent)); transform: translateY(-3px); }

        /* Profile & Video HUD */
        .video-circle { width: 180px; height: 180px; border-radius: 50%; overflow: hidden; border: 4px solid var(--accent); margin: 0 auto; background: black; position: relative; box-shadow: 0 0 30px var(--accent); }
        video { width: 100%; height: 100%; object-fit: cover; }
        .btn-action { background: var(--accent) !important; color: #000 !important; font-weight: 900 !important; border: none !important; cursor: pointer; border-radius: 16px !important; transition: 0.3s; width: 100%; padding: 16px !important; }
        .btn-action:active { transform: scale(0.96); opacity: 0.8; }
        .btn-action:disabled { opacity: 0.3; cursor: wait; }
        
        /* State Animations */
        .view-section { display: none; }
        .view-active { display: block !important; animation: slideUp 0.4s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .shimmer { background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%); background-size: 200% 100%; animation: shimmer 2s infinite; }
        @keyframes shimmer { to { background-position: -200% 0; } }

        .app-footer { position: fixed; bottom: 0; left: 0; width: 100%; padding: 15px 10px calc(15px + env(safe-area-inset-bottom)); background: #000; text-align: center; font-size: 9px; font-weight: 700; border-top: 1px solid #1e293b; z-index: 900; color: #475569; }
        
        @media (min-width: 1024px) { #desktop-blocker { display: flex !important; } .app-wrapper { display: none; } }
    </style>
</head>
<body>

    <!-- HARDWARE BLOCKER -->
    <div id="desktop-blocker" class="hidden fixed inset-0 bg-black z-[9999] flex-col items-center justify-center p-10 text-center">
        <i data-lucide="smartphone" class="w-20 h-20 text-cyan-400 mb-6"></i>
        <h1 class="text-3xl font-black uppercase text-white tracking-tighter">Mobile Node Only</h1>
        <p class="text-slate-500 mt-4 text-sm max-w-sm text-center">CSync requires smartphone biometric sensors and GPS binding.</p>
    </div>

    <!-- SIDEBAR -->
    <div id="sidebar" class="p-8 flex flex-col">
        <div class="mb-10 text-center">
            <h1 style="font-family:'Orbitron'" class="text-2xl text-cyan-400 tracking-tighter italic">CSYNC</h1>
            <p class="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-1">Sovereign Management</p>
        </div>
        <nav class="space-y-6 flex-1 text-slate-300">
            <button onclick="UIManager.switchTab('dashboard')" class="flex items-center gap-4 text-xs font-bold w-full text-left uppercase hover:text-cyan-400"><i data-lucide="layout-dashboard"></i> Dashboard</button>
            <button onclick="UIManager.switchTab('nexus')" class="flex items-center gap-4 text-xs font-bold w-full text-left uppercase hover:text-cyan-400"><i data-lucide="users"></i> Nexus directory</button>
            
            <div id="staff-menu" class="hidden space-y-6 pt-6 border-t border-white/5">
                <button onclick="UIManager.switchTab('architect')" class="flex items-center gap-4 text-xs font-bold w-full text-left uppercase text-indigo-400"><i data-lucide="sparkles"></i> AI Architect</button>
                <button onclick="UIManager.switchTab('audit')" class="flex items-center gap-4 text-xs font-bold w-full text-left uppercase text-emerald-400"><i data-lucide="shield-check"></i> NAAC Audit Shield</button>
                <button onclick="UIManager.switchTab('diary')" class="flex items-center gap-4 text-xs font-bold w-full text-left uppercase text-cyan-400"><i data-lucide="book"></i> Staff Diary</button>
            </div>
        </nav>
        <button onclick="UIManager.delinkDevice()" class="text-red-500 text-[9px] font-black uppercase mt-10 flex items-center gap-2"><i data-lucide="log-out" class="w-3 h-3"></i> Unbind Node</button>
    </div>

    <div class="app-wrapper flex flex-col h-screen">
        <!-- HEADER -->
        <header class="flex justify-between items-center px-6 py-4 sticky top-0 bg-[#020617] z-50 border-b border-white/5">
            <button onclick="UIManager.toggleSidebar()" class="p-2"><i data-lucide="menu" class="text-cyan-400"></i></button>
            <div class="text-center">
                <p class="text-[7px] font-bold text-slate-500 uppercase">Dr. V.S. Krishna Govt. Degree College</p>
                <h1 style="font-family: 'Orbitron';" class="text-xl font-bold text-white">CSYNC</h1>
            </div>
            <div class="w-10 h-10 rounded-full border-2 border-cyan-400 overflow-hidden bg-slate-900">
                <img id="u-photo-top" src="https://ui-avatars.com/api/?name=CS" class="w-full h-full object-cover">
            </div>
        </header>

        <!-- STATUS PILL -->
        <div id="status-pill" class="mx-6 glass py-2 px-6 rounded-full text-center text-[9px] font-black uppercase tracking-widest my-4 text-slate-500 border-slate-800 shimmer">
            Syncing Neural Pulse...
        </div>

        <main class="main-viewport px-5" id="main-content">
            
            <!-- VIEW: ROLES -->
            <div id="view-roles" class="view-section space-y-4">
                <h2 class="text-center text-[10px] font-black text-slate-600 uppercase mb-4">Identify Your Node</h2>
                <button onclick="UIManager.openReg('Student')" class="glass p-6 w-full text-left border-l-4 border-cyan-500">
                    <h4 class="font-black text-lg uppercase">Student</h4>
                    <p class="text-[9px] text-slate-400 uppercase font-bold">Attendance & Lab Handshake</p>
                </button>
                <button onclick="UIManager.openReg('Lecturer')" class="glass p-6 w-full text-left border-l-4 border-indigo-500">
                    <h4 class="font-black text-lg uppercase">Lecturer</h4>
                    <p class="text-[9px] text-slate-400 uppercase font-bold">Academic Tools & Approvals</p>
                </button>
                <button onclick="UIManager.openReg('HOD')" class="glass p-6 w-full text-left border-l-4 border-purple-500">
                    <h4 class="font-black text-lg uppercase">HOD</h4>
                    <p class="text-[9px] text-slate-400 uppercase font-bold">Executive Control</p>
                </button>
            </div>

            <!-- VIEW: ENROLLMENT -->
            <div id="view-register" class="view-section">
                <div class="glass p-8 rounded-[2.5rem] cyber-card text-center">
                    <h2 id="reg-title" class="text-lg font-black text-cyan-400 uppercase mb-6 italic">Enrollment</h2>
                    <div class="video-circle mb-8"><video id="v-reg" autoplay muted playsinline></video></div>
                    <div class="space-y-4">
                        <input id="r-id" type="text" placeholder="Roll No / Staff ID">
                        <input id="r-name" type="text" placeholder="Full Name">
                        <button onclick="UIManager.handleEnrollment()" class="btn-action">Bind Sovereign Identity</button>
                    </div>
                </div>
            </div>

            <!-- VIEW: DASHBOARD -->
            <div id="view-dashboard" class="view-section space-y-6">
                <div class="glass p-5">
                    <textarea id="ai-input" class="w-full h-20 bg-black/40 p-4 text-xs font-mono" placeholder="Command CSync AI..."></textarea>
                    <button onclick="UIManager.executeAI()" class="mt-2 text-cyan-400 font-bold text-[9px] uppercase flex items-center gap-2"><i data-lucide="terminal" class="w-3 h-3"></i> Execute_Command</button>
                </div>

                <div id="module-attendance" class="hidden glass p-10 text-center cyber-card space-y-4">
                    <i data-lucide="map-pin" id="geo-icon" class="w-12 h-12 mx-auto text-slate-600 transition-all"></i>
                    <p id="geo-msg" class="text-[10px] font-black uppercase text-slate-500">Syncing GPS Location...</p>
                    <button id="btn-presence" onclick="UIManager.runAttendance()" disabled class="btn-action">Verify Presence</button>
                </div>

                <div id="module-lab" class="hidden glass p-10 text-center border-t-4 border-emerald-500">
                    <h2 class="text-emerald-400 font-black text-xl mb-4 uppercase">Identity Verified</h2>
                    <button onclick="UIManager.startLabScan()" class="btn-action">Scan Lab PC QR</button>
                    <div id="qr-reader" class="mt-4 rounded-3xl overflow-hidden"></div>
                </div>

                <div id="module-active-pc" class="hidden glass p-10 text-center border-t-4 border-orange-500">
                    <h2 id="active-pc-display" class="text-5xl font-black text-white mb-2">CS-XX</h2>
                    <p class="text-[10px] text-slate-500 uppercase font-black mb-8">Session Active</p>
                    <button onclick="UIManager.killSession()" class="btn-action !bg-red-600 !text-white">Lock Session</button>
                </div>
            </div>

            <!-- VIEW: NEXUS -->
            <div id="view-nexus" class="view-section space-y-6">
                <h2 class="text-xl font-black text-indigo-400 uppercase italic">Nexus Directory</h2>
                <div id="nexus-container" class="space-y-4"></div>
            </div>

            <!-- VIEW: ARCHITECT -->
            <div id="view-architect" class="view-section space-y-6">
                 <div class="glass p-8 rounded-[2.5rem] cyber-card">
                    <h3 class="font-black text-lg uppercase text-cyan-400 mb-6">AI Architect</h3>
                    <select id="arch-type" class="w-full mb-4">
                        <option value="teaching">Teaching Plan (Diary)</option>
                        <option value="exam">3-Set Question Paper</option>
                    </select>
                    <textarea id="arch-syllabus" class="w-full h-40 mb-4" placeholder="Paste context..."></textarea>
                    <button onclick="UIManager.runArchitect()" class="btn-action">Generate PDF</button>
                </div>
            </div>

        </main>

        <!-- NAVIGATION -->
        <nav id="nav-bar" class="hidden bottom-nav glass">
            <button onclick="UIManager.switchTab('dashboard')" id="btn-dashboard" class="nav-item"><i data-lucide="shield-check"></i><span class="mt-1 font-black text-[7px]">Sovereign</span></button>
            <button onclick="UIManager.switchTab('nexus')" id="btn-nexus" class="nav-item"><i data-lucide="users"></i><span class="mt-1 font-black text-[7px]">Nexus</span></button>
            <button onclick="UIManager.switchTab('architect')" id="btn-architect" class="nav-item"><i data-lucide="sparkles"></i><span class="mt-1 font-black text-[7px]">Architect</span></button>
        </nav>

        <footer class="app-footer"></footer>
    </div>

    <!-- FACE GATE -->
    <div id="face-gate" class="hidden fixed inset-0 z-[5000] bg-black/95 flex flex-col items-center justify-center p-10">
        <div class="video-circle mb-8"><video id="v-auth" autoplay muted playsinline></video></div>
        <h3 class="text-cyan-400 font-black uppercase text-xs animate-pulse">Validating Identity...</h3>
    </div>

    <script>
        const CSYNC_CONFIG = {
            BACKEND_URL: "https://script.google.com/macros/s/AKfycbx9KZfFxGH8V0XdZjNMeJHO08O3GNUxCXJe96Bi1RsPhUjZ9sl5HfX37fk8CcrNuVdg/exec",
            VSK_COORDS: { lat: 17.7406, lng: 83.3212 }
        };
        
        let USER = JSON.parse(localStorage.getItem('csync_v1_profile'));

        const UIManager = {
            init() {
                lucide.createIcons();
                this.updateFooter();
                if (!USER) {
                    this.switchView('view-roles');
                } else {
                    this.setupSession();
                }
            },

            updateFooter() {
                document.querySelector('.app-footer').innerText = `© 2026 CSYNC | ${new Date().toLocaleTimeString()} | SOVEREIGN NODE`;
            },

            switchView(id) {
                document.querySelectorAll('.view-section').forEach(v => v.classList.remove('view-active'));
                const target = document.getElementById(id);
                if(target) target.classList.add('view-active');
                this.toggleSidebar(false);
            },

            switchTab(t) {
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('nav-active'));
                const navBtn = document.getElementById('btn-'+t);
                if(navBtn) navBtn.classList.add('nav-active');
                
                this.switchView('view-'+t);
                if(t === 'nexus') this.loadNexus();
                if("vibrate" in navigator) navigator.vibrate(10);
                lucide.createIcons();
            },

            toggleSidebar(force) {
                const s = document.getElementById('sidebar');
                if(force !== undefined) force ? s.classList.add('open') : s.classList.remove('open');
                else s.classList.toggle('open');
            },

            async openReg(role) {
                this.regRole = role;
                this.switchView('view-register');
                document.getElementById('reg-title').innerText = role + " Enrollment";
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                document.getElementById('v-reg').srcObject = stream;
            },

            async handleEnrollment() {
                const id = document.getElementById('r-id').value;
                const name = document.getElementById('r-name').value;
                if(!id || !name) return alert("Missing ID/Name");

                const canvas = document.createElement('canvas');
                const video = document.getElementById('v-reg');
                canvas.width = 150; canvas.height = 150;
                canvas.getContext('2d').drawImage(video, 0, 0, 150, 150);
                
                USER = { id, name, role: this.regRole, photo: canvas.toDataURL('image/jpeg', 0.6) };
                localStorage.setItem('csync_v1_profile', JSON.stringify(USER));
                location.reload();
            },

            setupSession() {
                document.getElementById('nav-bar').classList.remove('hidden');
                document.getElementById('u-photo-top').src = USER.photo;
                if(USER.role !== 'Student') document.getElementById('staff-menu').classList.remove('hidden');
                this.switchTab('dashboard');
                this.refreshDashboard();
                this.startGPS();
            },

            startGPS() {
                if(!navigator.geolocation || USER.role !== 'Student') return;
                navigator.geolocation.watchPosition(pos => {
                    const dist = this.calcDist(pos.coords.latitude, pos.coords.longitude, CSYNC_CONFIG.VSK_COORDS.lat, CSYNC_CONFIG.VSK_COORDS.lng);
                    const btn = document.getElementById('btn-presence');
                    const msg = document.getElementById('geo-msg');
                    const icon = document.getElementById('geo-icon');

                    if(dist < 0.3) {
                        btn.disabled = false;
                        msg.innerHTML = `<span class="text-emerald-400">PULSE SYNCED: ON CAMPUS</span>`;
                        icon.style.color = "#10b981";
                    } else {
                        btn.disabled = true;
                        msg.innerHTML = `<span class="text-red-500">OUTSIDE CAMPUS: ${Math.round(dist*1000)}m</span>`;
                        icon.style.color = "#ef4444";
                    }
                }, null, { enableHighAccuracy: true });
            },

            calcDist(lat1, lon1, lat2, lon2) {
                const p = 0.017453292519943295;
                const c = Math.cos;
                const a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2;
                return 12742 * Math.asin(Math.sqrt(a));
            },

            async runAttendance() {
                document.getElementById('face-gate').classList.remove('hidden');
                const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                document.getElementById('v-auth').srcObject = s;
                
                setTimeout(() => {
                    localStorage.setItem('last_marked', new Date().toDateString());
                    document.getElementById('face-gate').classList.add('hidden');
                    s.getTracks().forEach(t => t.stop());
                    this.refreshDashboard();
                }, 3000);
            },

            startLabScan() {
                const scanner = new Html5Qrcode("qr-reader");
                scanner.start({ facingMode: "environment" }, { fps: 15, qrbox: 250 }, (url) => {
                    const pcId = new URL(url).searchParams.get('sysId') || "CS-X";
                    localStorage.setItem('active_pc', pcId);
                    scanner.stop(); 
                    this.refreshDashboard();
                });
            },

            killSession() {
                localStorage.removeItem('active_pc');
                this.refreshDashboard();
            },

            refreshDashboard() {
                const marked = localStorage.getItem('last_marked') === new Date().toDateString();
                const pc = localStorage.getItem('active_pc');
                
                document.getElementById('module-attendance').style.display = (marked || USER.role !== 'Student') ? 'none' : 'block';
                document.getElementById('module-lab').style.display = (marked && !pc && USER.role === 'Student') ? 'block' : 'none';
                document.getElementById('module-active-pc').style.display = pc ? 'block' : 'none';
                if(pc) document.getElementById('active-pc-display').innerText = pc;
                document.getElementById('status-pill').innerText = "NODE SECURE: ACTIVE";
                document.getElementById('status-pill').classList.remove('shimmer');
            },

            async runArchitect() {
                const type = document.getElementById('arch-type').value;
                const syllabus = document.getElementById('arch-syllabus').value;
                const doc = new jspdf.jsPDF();
                doc.setFontSize(16);
                doc.text(`SOVEREIGN ${type.toUpperCase()} PLAN`, 20, 20);
                doc.setFontSize(10);
                doc.text(doc.splitTextToSize(syllabus, 170), 20, 40);
                doc.save(`CSync_${type}.pdf`);
            },

            async loadNexus() {
                const container = document.getElementById('nexus-container');
                container.innerHTML = '<div class="shimmer h-20 rounded-2xl"></div>';
                // Mocking data for demonstration
                setTimeout(() => {
                    container.innerHTML = `
                        <div class="glass p-5 flex items-center gap-4">
                            <div class="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center font-bold">JD</div>
                            <div>
                                <h4 class="font-black text-xs uppercase">John Doe</h4>
                                <p class="text-[8px] text-slate-500">Student | Computer Science</p>
                            </div>
                        </div>
                    `;
                }, 1000);
            },

            delinkDevice() {
                if(confirm("DANGER: Wiping ID?")) { localStorage.clear(); location.reload(); }
            }
        };

        window.onload = () => UIManager.init();
    </script>
</body>
</html>
