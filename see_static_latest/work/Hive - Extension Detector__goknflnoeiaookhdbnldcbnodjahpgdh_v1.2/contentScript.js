(function () {
	console.info("Content script loaded in page:", location.href);

	// Normalized forwarder to Angular
	const forwardToPage = (payload) => {
		// payload: { enabledExtensions: [...], isPermissionGiven: boolean }
		try {
			const targetOrigin =
				window.location.hostname === "localhost"
					? "http://localhost:4200/"
					: window.location.origin + "/";

			window.postMessage({ type: "FORBIDDEN_EXTENSIONS", enabledExtensions: payload.enabledExtensions || [], isPermissionGiven: Boolean(payload.isPermissionGiven) }, targetOrigin);
		} catch (e) {
			console.error("postMessage forward error:", e);
		}
	};

	// Handle page requests (Angular -> content script)
	window.addEventListener("message", (event) => {
		if (event.source !== window) return;
		const d = event.data;
		if (!d || d.type !== "CHECK_EXTENSIONS_REQUEST") return;

		// Ask background
		try {
			chrome.runtime.sendMessage({ type: "checkExtensions" }, (response) => {
				// response may be {  isPermissionGiven: boolean, enabledExtensions: [...] }
				if (chrome.runtime.lastError) {
					console.error("chrome.runtime.sendMessage error:", chrome.runtime.lastError);
					forwardToPage({ enabledExtensions: [], isPermissionGiven: false });
					return;
				}
				forwardToPage(response || { enabledExtensions: [], isPermissionGiven: false });
			});
		} catch (e) {
			console.error("Exception sending message to background:", e);
			forwardToPage({ enabledExtensions: [], isPermissionGiven: false });
		}
	});

	// Receive push updates from background and forward to page
	chrome.runtime.onMessage.addListener((msg) => {
		try {
			if (!msg || msg.type !== "FORBIDDEN_EXTENSIONS") return;
			// msg has enabledExtensions/isPermissionGiven — forward normalized
			forwardToPage({ enabledExtensions: msg.enabledExtensions || [], isPermissionGiven: msg.isPermissionGiven !== false });
		} catch (e) {
			console.error("onMessage forward error:", e);
		}
	});

	// // Optional: perform an initial check proactively
	try {
		chrome.runtime.sendMessage({ type: "checkExtensions" }, (response) => {
			if (chrome.runtime.lastError) {
				console.error("initial sendMessage error:", chrome.runtime.lastError);
				forwardToPage({ enabledExtensions: [], isPermissionGiven: false });
				return;
			}
			forwardToPage(response || { enabledExtensions: [], isPermissionGiven: false });
		});
	} catch (e) {
		console.error("initial check error:", e);
		forwardToPage({ enabledExtensions: [], isPermissionGiven: false });
	}
})();



