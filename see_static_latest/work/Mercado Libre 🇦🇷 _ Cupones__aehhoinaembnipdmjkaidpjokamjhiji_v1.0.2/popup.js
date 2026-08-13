document.addEventListener('DOMContentLoaded', () => {
    const actionBtn = document.getElementById('action-btn');

    actionBtn.addEventListener('click', () => {
        try {
            chrome.runtime.sendMessage({ action: "APPLY_ALL_COUPONS" }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Error:', chrome.runtime.lastError.message);
                } else {
                    console.log('Mensaje enviado al background script');
                }
            });
        } catch (error) {
            console.error("Error en la extensión:", error);
        }
    });
});
