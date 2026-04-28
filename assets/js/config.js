/**
 * CSYNC GLOBAL CONFIGURATION v1.0
 * Single Source of Truth for Dr. V.S. Krishna GDC (A)
 * Developed by M. Thrinadh (https://linkedin.com/in/m3nadh)
 */

const CSYNC_CONFIG = {
    // --- MASTER BACKEND URL ---
    BACKEND_URL: "https://script.google.com/macros/s/AKfycbx9KZfFxGH8V0XdZjNMeJHO08O3GNUxCXJe96Bi1RsPhUjZ9sl5HfX37fk8CcrNuVdg/exec",
    
    INSTITUTION: "Dr. V. S. Krishna Government Degree College (Autonomous)",
    DEPARTMENT: "Dept. of Computer Science & Artificial Intelligence",
    DEVELOPER: "M. Thrinadh",
    LINKEDIN: "https://linkedin.com/in/m3nadh",

    // Precision Disciplinary Timings
    TIMINGS: {
        OPEN: 10.0,      // 10:00 AM
        FN_END: 13.33,   // 01:20 PM
        AN_START: 15.5,  // 03:30 PM
        CLOSE: 17.0      // 05:00 PM (Hard-Stop)
    }
};

// Global Footer Auto-Injector
window.addEventListener('DOMContentLoaded', () => {
    const footers = document.querySelectorAll('.dynamic-footer');
    footers.forEach(f => {
        f.innerHTML = `
            <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: #475569; text-align: center; line-height: 1.6;">
                <p>Copyright © ${new Date().getFullYear()} | ${CSYNC_CONFIG.DEPARTMENT}</p>
                <p>${CSYNC_CONFIG.INSTITUTION}</p>
                <p>Developed by <a href="${CSYNC_CONFIG.LINKEDIN}" target="_blank" style="color:#00f2ff; text-decoration:underline;">${CSYNC_CONFIG.DEVELOPER}</a></p>
            </div>
        `;
    });
});
