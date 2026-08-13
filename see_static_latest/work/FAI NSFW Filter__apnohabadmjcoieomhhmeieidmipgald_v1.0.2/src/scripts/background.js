/**
 * FAI NSFW Filter Background Script (Service Worker)
 * Handles extension lifecycle, settings, and communication between components
 */

class NSFWFilterBackground {
  constructor() {
    this.init();
  }

  init() {
    // Set up event listeners
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstall(details);
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep the message channel open for async responses
    });

    chrome.action.onClicked.addListener((tab) => {
      this.handleActionClick(tab);
    });

    // Listen for tab updates to inject content script if needed
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
    });
  }

  async handleInstall(details) {
    if (details.reason === 'install') {
      // First-time installation
      await this.setDefaultSettings();
      this.showWelcomeNotification();
    } else if (details.reason === 'update') {
      // Extension update
      this.handleUpdate(details.previousVersion);
    }
  }

  async setDefaultSettings() {
    const defaultSettings = {
      isEnabled: true,
      showNotifications: true,
      stats: {
        totalBlocked: 0,
        totalScanned: 0,
        sessionsCount: 1,
        lastActive: Date.now(),
        installDate: Date.now()
      }
    };

    await chrome.storage.sync.set(defaultSettings);
    console.log('FAI NSFW Filter: Default settings initialized');
  }

  showWelcomeNotification() {
    if (chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'FAI NSFW Filter Installed',
        message: 'Your AI-powered content filter is now active. Click the extension icon to configure settings.'
      });
    }
  }

  handleUpdate(previousVersion) {
    console.log(`FAI NSFW Filter: Updated from version ${previousVersion}`);
    // Handle any migration logic here if needed
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        case 'getSettings':
          const settings = await this.getSettings();
          sendResponse({ success: true, data: settings });
          break;

        case 'updateSettings':
          await this.updateSettings(message.settings);
          await this.notifyContentScripts(message.settings);
          sendResponse({ success: true });
          break;

        case 'getStats':
          const stats = await this.getStats();
          sendResponse({ success: true, data: stats });
          break;

        case 'updateStats':
          await this.updateStats(message.stats);
          sendResponse({ success: true });
          break;

        case 'incrementBlocked':
          await this.incrementTotalBlocked(message.count || 1);
          sendResponse({ success: true });
          break;

        case 'incrementScanned':
          await this.incrementTotalScanned(message.count || 1);
          sendResponse({ success: true });
          break;

        case 'toggleEnabled':
          await this.toggleEnabled();
          const newState = await this.getSettings();
          await this.notifyContentScripts(newState);
          sendResponse({ success: true, data: newState });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('FAI NSFW Filter Background Error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async getSettings() {
    const result = await chrome.storage.sync.get([
      'isEnabled', 'showNotifications', 'stats'
    ]);
    
    return {
      isEnabled: result.isEnabled !== false,
      showNotifications: result.showNotifications !== false,
      stats: result.stats || { 
        totalBlocked: 0, 
        totalScanned: 0, 
        sessionsCount: 1, 
        lastActive: Date.now(),
        installDate: Date.now()
      }
    };
  }

  async updateSettings(newSettings) {
    await chrome.storage.sync.set(newSettings);
    
    // Update badge if enabled state changed
    if ('isEnabled' in newSettings) {
      await this.updateBadge(newSettings.isEnabled);
    }
  }

  async getStats() {
    const result = await chrome.storage.sync.get(['stats']);
    return result.stats || { totalBlocked: 0, sessionsCount: 1, lastActive: Date.now() };
  }

  async updateStats(newStats) {
    const currentStats = await this.getStats();
    const updatedStats = { ...currentStats, ...newStats };
    await chrome.storage.sync.set({ stats: updatedStats });
  }

  async incrementTotalBlocked(count = 1) {
    const currentStats = await this.getStats();
    currentStats.totalBlocked = (currentStats.totalBlocked || 0) + count;
    currentStats.lastActive = Date.now();
    await chrome.storage.sync.set({ stats: currentStats });
    console.log('FAI NSFW Filter: Total blocked updated to:', currentStats.totalBlocked);
  }

  async incrementTotalScanned(count = 1) {
    const currentStats = await this.getStats();
    currentStats.totalScanned = (currentStats.totalScanned || 0) + count;
    currentStats.lastActive = Date.now();
    await chrome.storage.sync.set({ stats: currentStats });
    console.log('FAI NSFW Filter: Total scanned updated to:', currentStats.totalScanned);
  }

  async toggleEnabled() {
    const settings = await this.getSettings();
    const newEnabled = !settings.isEnabled;
    await this.updateSettings({ isEnabled: newEnabled });
    return newEnabled;
  }

  async notifyContentScripts(settings) {
    try {
      // Get all tabs and send update message
      const tabs = await chrome.tabs.query({});
      
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'toggle',
            enabled: settings.isEnabled
          });
        } catch (error) {
          // Tab might not have the content script loaded, ignore
        }
      }
    } catch (error) {
      console.log('FAI NSFW Filter: Could not notify all tabs:', error);
    }
  }

  async updateBadge(isEnabled) {
    try {
      if (isEnabled) {
        await chrome.action.setBadgeText({ text: '' });
        await chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
      } else {
        await chrome.action.setBadgeText({ text: 'OFF' });
        await chrome.action.setBadgeBackgroundColor({ color: '#f44336' });
      }
    } catch (error) {
      console.log('FAI NSFW Filter: Could not update badge:', error);
    }
  }

  handleActionClick(tab) {
    // This will open the popup, but we can add additional logic here if needed
    console.log('FAI NSFW Filter: Extension icon clicked on tab:', tab.url);
  }

  async handleTabUpdate(tabId, changeInfo, tab) {
    // Inject content script into newly loaded pages if needed
    if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
      try {
        const settings = await this.getSettings();
        if (settings.isEnabled) {
          // The content script is already declared in manifest.json,
          // but we can send initial settings
          setTimeout(async () => {
            try {
              await chrome.tabs.sendMessage(tabId, {
                action: 'toggle',
                enabled: settings.isEnabled
              });
            } catch (error) {
              // Content script might not be ready yet, that's okay
            }
          }, 1000);
        }
      } catch (error) {
        console.log('FAI NSFW Filter: Could not initialize tab:', error);
      }
    }
  }
}

// Initialize the background script
new NSFWFilterBackground();