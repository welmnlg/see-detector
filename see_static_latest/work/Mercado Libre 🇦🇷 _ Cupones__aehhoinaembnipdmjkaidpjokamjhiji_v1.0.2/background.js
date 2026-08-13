chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "APPLY_ALL_COUPONS") {
        chrome.tabs.create({
            url: "https://www.mercadolibre.com.ar/cupones/filter?all=true&page=1&autoclick=true"
        });
        sendResponse({ status: 'ok' });
    } else if (request.action === "SHOW_NOTIFICATION") {
        chrome.notifications.create({
            type: "basic",
            iconUrl: "img/icon128.png",
            title: request.title,
            message: request.message,
            priority: 2
        });
    } else if (request.action === "CLOSE_TAB") {
        chrome.tabs.remove(sender.tab.id);
    }
});