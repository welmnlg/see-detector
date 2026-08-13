function getEnabledExtensions() {
	return new Promise((resolve) => {
		try {
			chrome.permissions.contains({ permissions: ["management"] }, (hasPerm) => {
				if (chrome.runtime.lastError) {
					console.error("permissions.contains error:", chrome.runtime.lastError);
					resolve({ isPermissionGiven: false, enabledExtensions: [] });
					return;
				}

				if (!hasPerm) {
					// management permission not granted
					resolve({ isPermissionGiven: false, enabledExtensions: [] });
					return;
				}

				chrome.management.getAll((extensions) => {
					if (chrome.runtime.lastError || !extensions) {
						console.error("management.getAll error:", chrome.runtime.lastError);
						resolve({ isPermissionGiven: false, enabledExtensions: [] });
						return;
					}

					const enabled = extensions
						.filter(ext => ext && ext.enabled && ext.type === 'extension')
						.map(ext => ({ id: ext.id, name: ext.name, version: ext.version }));

					resolve({ isPermissionGiven: true, enabledExtensions: enabled });
				});
			});
		} catch (e) {
			console.error("getEnabledExtensions exception:", e);
			resolve({ isPermissionGiven: false, enabledExtensions: [] });
		}
	});
}

// Respond to content-script requests
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	try {
		if (!msg || !msg.type) {
			sendResponse({ ok: false, error: 'invalid_message' });
			return;
		}

		if (msg.type === "checkExtensions") {
			getEnabledExtensions().then((data) => {
				sendResponse({ ok: true, ...data });
			});
			return true; // Will respond asynchronously
		}
	} catch (err) {
		console.error("onMessage error:", err);
		sendResponse({ ok: false, error: String(err) });
	}
	return false;
});

// Notify all tabs (safe, ignores tabs without content script)
function notifyAllTabsWithData(data) {
	chrome.tabs.query({}, (tabs) => {
		if (chrome.runtime.lastError) {
			console.error("tabs.query error:", chrome.runtime.lastError);
			return;
		}
		tabs.forEach(t => {
			if (!t.id) return;
			chrome.tabs.sendMessage(t.id, { type: "FORBIDDEN_EXTENSIONS", enabledExtensions: data.enabledExtensions, isPermissionGiven: data.isPermissionGiven }, (resp) => {
				if (chrome.runtime.lastError) {
					return;
				}
			});
		});
	});
}

// Listen for lifecycle changes
if (chrome.management && chrome.management.onEnabled) {
	chrome.management.onEnabled.addListener(() => {
		getEnabledExtensions().then((data) => notifyAllTabsWithData(data));
	});
}
if (chrome.management && chrome.management.onDisabled) {
	chrome.management.onDisabled.addListener(() => {
		getEnabledExtensions().then((data) => notifyAllTabsWithData(data));
	});
}

// Reload page when our extension is installed or enabled
function reloadExamTabs() {
	chrome.tabs.query({}, (tabs) => {
		tabs.forEach((tab) => {
			if (tab.url && (tab.url.startsWith("http://localhost:4200") ||
				tab.url.includes(".smartinterviews.in"))) {
				chrome.tabs.reload(tab.id);
			}
		});
	});
}

// When extension is first installed
chrome.runtime.onInstalled.addListener(() => {
	reloadExamTabs();
});

// When extension is enabled again
chrome.management.onEnabled.addListener((ext) => {
	if (ext.id === chrome.runtime.id) {
		reloadExamTabs();
	}
});

