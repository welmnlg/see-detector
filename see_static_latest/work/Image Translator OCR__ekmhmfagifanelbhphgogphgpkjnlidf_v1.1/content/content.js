let isSelecting = false;
let startX, startY;
let selectionOverlay = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "START_SELECTION") {
        createOverlay();
    } else if (request.action === "SHOW_RESULT") {
        showResultModal(request.data);
    } else if (request.action === "SHOW_ERROR") {
        showResultModal({ error: request.message });
    }
});

function createOverlay() {
    if (selectionOverlay) return; // Already active

    selectionOverlay = document.createElement('div');
    selectionOverlay.className = 'it-overlay-container';

    // Selection Box
    const selectionBox = document.createElement('div');
    selectionBox.className = 'it-selection-box';
    selectionBox.style.display = 'none'; // Hidden initially
    selectionOverlay.appendChild(selectionBox);

    document.body.appendChild(selectionOverlay);

    // Event Listeners
    selectionOverlay.addEventListener('mousedown', (e) => {
        isSelecting = true;
        startX = e.clientX;
        startY = e.clientY;

        selectionBox.style.left = `${startX}px`;
        selectionBox.style.top = `${startY}px`;
        selectionBox.style.width = '0px';
        selectionBox.style.height = '0px';
        selectionBox.style.display = 'block';
    });

    selectionOverlay.addEventListener('mousemove', (e) => {
        if (!isSelecting) return;

        const currentX = e.clientX;
        const currentY = e.clientY;

        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        const left = Math.min(currentX, startX);
        const top = Math.min(currentY, startY);

        selectionBox.style.width = `${width}px`;
        selectionBox.style.height = `${height}px`;
        selectionBox.style.left = `${left}px`;
        selectionBox.style.top = `${top}px`;
    });

    selectionOverlay.addEventListener('mouseup', (e) => {
        if (!isSelecting) return;
        isSelecting = false;

        const rect = selectionBox.getBoundingClientRect();

        // Remove overlay immediately
        removeOverlay();

        if (rect.width < 5 || rect.height < 5) {
            // Too small selection, ignore
            return;
        }

        // Send coordinates to background
        // We also need window metrics to adjust for device pixel ratio if needed, 
        // but captureVisibleTab usually respects visual viewport. 
        // Let's send basic client rect params.
        chrome.runtime.sendMessage({
            action: "CAPTURE_AND_TRANSLATE",
            area: {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio
            }
        });

        // Show loading state
        showLoadingModal();
    });

    // Cancel on Escape
    document.addEventListener('keydown', handleEsc);
}

function handleEsc(e) {
    if (e.key === 'Escape' && selectionOverlay) {
        removeOverlay();
    }
}

function removeOverlay() {
    if (selectionOverlay) {
        selectionOverlay.remove();
        selectionOverlay = null;
    }
    document.removeEventListener('keydown', handleEsc);
}

let resultModal = null;

function showLoadingModal() {
    if (resultModal) resultModal.remove();

    resultModal = document.createElement('div');
    resultModal.className = 'it-result-modal';
    resultModal.innerHTML = `
        <div class="it-modal-header">
            <span class="it-modal-title">Translating...</span>
            <button class="it-close-btn">✖</button>
        </div>
        <div class="it-modal-content">
            <div class="it-loading">
                <div class="it-spinner"></div>
            </div>
        </div>
    `;

    document.body.appendChild(resultModal);

    resultModal.querySelector('.it-close-btn').addEventListener('click', () => {
        resultModal.remove();
        resultModal = null;
    });
}

function showResultModal(data) {
    if (!resultModal) showLoadingModal(); // Should exist, but safety check

    const headerTitle = resultModal.querySelector('.it-modal-title');
    const contentDiv = resultModal.querySelector('.it-modal-content');

    if (data.error) {
        headerTitle.textContent = "Error";
        headerTitle.style.color = "#EF4444";
        contentDiv.innerHTML = `<div style="color: #EF4444;">${data.error}</div>`;
        return;
    }

    headerTitle.textContent = "Translation Result";
    // We expect data to have { original: "...", translated: "..." }
    contentDiv.innerHTML = `
        <div class="it-original-text">${escapeHtml(data.original || '(No text detected)')}</div>
        <div class="it-translated-container">
            <div class="it-translated-text">${parseMarkdown(data.translated || '')}</div>
            <button class="it-copy-btn" title="Copy translation">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </button>
        </div>
    `;

    // Add Copy Listener
    const copyBtn = contentDiv.querySelector('.it-copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const textToCopy = data.translated || "";
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalIcon = copyBtn.innerHTML;
                copyBtn.innerHTML = `<span style="font-size: 10px; font-weight: bold;">COPIED</span>`;
                copyBtn.classList.add('copied');
                setTimeout(() => {
                    copyBtn.innerHTML = originalIcon;
                    copyBtn.classList.remove('copied');
                }, 1500);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
    }
}

function parseMarkdown(text) {
    if (!text) return '';
    let html = escapeHtml(text);
    // Bold **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic *text*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    return html;
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
