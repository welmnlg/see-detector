// This variable resets every time the page is reloaded/closed
let sessionApproved = false;
let overlayExists = false;

function checkBlocking() {
    // If user already clicked "Informed" for this specific visit, stop checking
    if (sessionApproved) {
        return;
    }

    const currentHost = window.location.hostname;

    chrome.storage.sync.get(['blockedSites'], function(result) {
        const blockedSites = result.blockedSites || [];
        const isBlocked = blockedSites.some(site => currentHost.includes(site));

        // 2. IF BLOCKED & NO OVERLAY -> SHOW IT
        if (isBlocked && !overlayExists) {
            document.documentElement.style.overflow = "hidden"; 
            document.body.style.overflow = "hidden";
            createDecisionModal();
            overlayExists = true;
        }
        
        // 3. IF NOT BLOCKED (User navigated to a safe site) & OVERLAY EXISTS -> REMOVE IT
        else if (!isBlocked && overlayExists) {
             removeOverlay();
        }
    });
}

// Run immediately + every 1 second (to catch YouTube/Instagram internal clicks)
checkBlocking();
setInterval(checkBlocking, 1000);

function createDecisionModal() {
    if (document.getElementById("mindful-overlay")) return;

    const modal = document.createElement('div');
    modal.id = "mindful-overlay";
    modal.innerHTML = `
        <div class="mindful-container">
            <button id="btn-impulse">Impulse</button>
            <button id="btn-informed">Intentional</button>
        </div>
    `;
    
    if (document.body) {
        document.body.appendChild(modal);
    } else {
        document.addEventListener('DOMContentLoaded', () => document.body.appendChild(modal));
    }

    // IMPULSE CLICK: Leave site
    document.getElementById('btn-impulse').addEventListener('click', () => {
        window.location.href = "https://www.google.com"; 
    });

    // INFORMED CLICK: Approve JUST THIS SESSION
    document.getElementById('btn-informed').addEventListener('click', () => {
        sessionApproved = true; // Mark this visit as allowed
        removeOverlay();
    });
}

function removeOverlay() {
    const modal = document.getElementById("mindful-overlay");
    if (modal) modal.remove();
    document.documentElement.style.overflow = "auto"; 
    document.body.style.overflow = "auto";
    overlayExists = false;
}