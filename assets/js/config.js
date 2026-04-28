/**
 * CSYNC GLOBAL CONFIGURATION v1.0
 * The Sovereign "Single Source of Truth"
 * 
 * Institution: Dr. V.S. Krishna Govt. Degree College (Autonomous)
 * Dept: Department of Computer Science & AI
 * Master Architect: M. Thrinadh (https://linkedin.com/in/m3nadh)
 */

const CSYNC_CONFIG = {
    // ==========================================================
    // 1. SOVEREIGN CLOUD BRIDGE (Google Apps Script URL)
    // ==========================================================
    // PASTE YOUR DEPLOYED WEB APP URL HERE:
    BACKEND_URL: "https://script.google.com/macros/s/AKfycbwPJVhu3T8NZQScH0MdO1MRWCjjOaHrxGFIuNsyaWAoeROgqlR5xM-eZQ9BSBNRo1c6/exec",

    // ==========================================================
    // 2. INSTITUTIONAL METADATA
    // ==========================================================
    COLLEGE_NAME: "Dr. V. S. Krishna Government Degree College (Autonomous)",
    DEPT_NAME: "Department of Computer Science & AI",
    LOCATION: "Visakhapatnam, Andhra Pradesh",
    
    // ==========================================================
    // 3. DISCIPLINARY TIMING ENGINE (24-Hour Decimal Format)
    // ==========================================================
    TIMINGS: {
        PORTAL_OPEN: 10.0,       // 10:00 AM
        FN_ATTENDANCE_END: 13.33, // 01:20 PM
        LUNCH_BREAK_START: 13.33, // 01:20 PM
        LUNCH_BREAK_END: 14.33,   // 02:20 PM
        AN_ATTENDANCE_START: 15.5, // 03:30 PM (Disciplinary Stay-back)
        PORTAL_CLOSE: 17.0        // 05:00 PM (Hard-Stop Lockdown)
    },

    // ==========================================================
    // 4. DEVELOPER IDENTITY (Hardcoded)
    // ==========================================================
    DEVELOPER: {
        NAME: "M. Thrinadh",
        ROLE: "Lead Architect & Developer",
        LINKEDIN: "https://linkedin.com/in/m3nadh",
        VERSION: "1.0.0 Stable"
    }
};

/**
 * 🛠️ AUTOMATED FOOTER ENGINE
 * This script runs globally to inject M. Thrinadh's developer credits
 * into any page containing a <footer class="dynamic-footer"></footer> tag.
 */
window.addEventListener('DOMContentLoaded', () => {
    const footers = document.querySelectorAll('.dynamic-footer');
    const currentYear = new Date().getFullYear();

    footers.forEach(footer => {
        footer.style.textAlign = 'center';
        footer.innerHTML = `
            <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: #475569; letter-spacing: 1px;">
                <p style="margin-bottom: 4px;">Copyright © ${currentYear} | ${CSYNC_CONFIG.DEPT_NAME}</p>
                <p style="margin-bottom: 8px;">${CSYNC_CONFIG.COLLEGE_NAME}</p>
                <p style="color: #64748b;">
                    Developed by 
                    <a href="${CSYNC_CONFIG.DEVELOPER.LINKEDIN}" 
                       target="_blank" 
                       style="color: #00f2ff; text-decoration: underline; font-weight: 800;">
                       ${CSYNC_CONFIG.DEVELOPER.NAME}
                    </a>
                </p>
            </div>
        `;
    });
});

// Freeze the object to prevent runtime tampering in the browser console
Object.freeze(CSYNC_CONFIG);
