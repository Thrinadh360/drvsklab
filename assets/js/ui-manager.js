async function executeAI() {
    const input = document.getElementById('ai-input');
    const resp = document.getElementById('ai-response');
    const status = document.getElementById('ai-status');
    const query = input.value.trim();
    
    if(!query) return;

    // UI Feedback
    if ("vibrate" in navigator) navigator.vibrate(20);
    input.disabled = true;
    resp.classList.remove('hidden');
    resp.innerHTML = '<span class="animate-pulse">_consulting_llama_3.1_instant...</span>';
    status.innerText = "Processing Logic Path...";

    try {
        // We route the request through CloudSync which calls your GAS Backend
        // The Backend uses PropertiesService to get the GROQ_API_KEY
        const result = await CloudSync.sendAICommand(query, this.user);
        
        // Output with techy "Typewriter" effect
        resp.innerText = "";
        let i = 0;
        const typeEffect = setInterval(() => {
            if (i < result.length) {
                resp.innerText += result.charAt(i);
                i++;
            } else {
                clearInterval(typeEffect);
                status.innerText = "Logical Sequence Complete.";
            }
        }, 15);

    } catch (e) {
        resp.innerText = "SYSTEM_ERROR: Neural handshake timed out.";
        status.innerText = "Cloud Disconnected.";
    } finally {
        input.disabled = false;
        input.value = "";
    }
}
