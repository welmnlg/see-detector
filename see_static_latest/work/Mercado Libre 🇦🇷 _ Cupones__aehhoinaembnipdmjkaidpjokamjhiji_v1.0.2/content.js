const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 1. Inyectamos el CSS necesario para el pseudo-elemento
const injectStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        .header-title.is-applying::after {
            content: " - Aplicando cupones...";
            color: #00a650; /* Color verde Mercado Libre */
            font-weight: bold;
            font-size: 0.8em;
            margin-left: 10px;
            animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
};

function nextPage() {
    // 4. Quitamos el mensaje antes de cambiar de página
    const title = document.querySelector('.header-title');
    if (title) title.classList.remove('is-applying');

    var nextPageButton = document.querySelector('.andes-pagination__button--next');

    if (nextPageButton.classList.contains("andes-pagination__button--disabled")) {
        chrome.runtime.sendMessage({
            action: "SHOW_NOTIFICATION",
            title: "Mercado Libre | Cupones",
            message: "Ya no hay más cupones por aplicar. ¡Disfruta de tu compra!"
        });
        chrome.runtime.sendMessage({ action: "CLOSE_TAB" });
        return;
    }

    const link = nextPageButton.querySelector('a');
    link.href = link.href + "&autoclick=true";
    link.click();
}

async function clickAllWithDelay() {
    // 2. Activamos el mensaje visual
    const title = document.querySelector('.header-title');
    if (title) title.classList.add('is-applying');

    const timeout = 1000;
    const startTime = Date.now();

    while (document.querySelectorAll('.andes-button--loud').length === 0) {
        if (Date.now() - startTime > timeout) {
            nextPage();
            return;
        }
        await delay(500);
    }

    while (true) {
        const elements = document.querySelectorAll('.andes-button--loud');
        if (elements.length === 0) break;

        for (const el of elements) {
            el.click();
            await delay(50);
        }

        await delay(500);
    }
    nextPage();
}

// 3. Ejecución inicial
injectStyles();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', clickAllWithDelay);
} else {
    clickAllWithDelay();
}