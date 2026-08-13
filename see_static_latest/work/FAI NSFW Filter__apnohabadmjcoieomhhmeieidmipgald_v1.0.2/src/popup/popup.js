/**
 * FAI NSFW Filter Popup Script
 * Handles the popup interface interactions and settings management
 */

class PopupController {
  constructor() {
    this.elements = {};
    this.settings = {};
    this.stats = {};
    this.init();
  }

  async init() {
    try {
      console.log('FAI NSFW Filter: Initializing popup...');
      
      this.initElements();
      this.attachEventListeners();
      
      await this.loadSettings();
      console.log('FAI NSFW Filter: Settings loaded:', this.settings);
      
      await this.loadStats();
      this.updateUI();
      
      // Set up periodic stats refresh (every 2 seconds while popup is open)
      this.statsInterval = setInterval(() => {
        this.refreshStats();
      }, 2000);
      
      console.log('FAI NSFW Filter: Popup initialized successfully');
    } catch (error) {
      console.error('FAI NSFW Filter: Error initializing popup:', error);
    }
  }

  initElements() {
    this.elements = {
      enabledToggle: document.getElementById('enabledToggle'),
      statusText: document.getElementById('statusText'),
      blockedCount: document.getElementById('blockedCount'),
      scannedCount: document.getElementById('scannedCount'),
      totalBlocked: document.getElementById('totalBlocked'),
      protectionRate: document.getElementById('protectionRate'),
      helpLink: document.getElementById('helpLink'),
      feedbackLink: document.getElementById('feedbackLink'),
      privacyLink: document.getElementById('privacyLink')
    };
  }

  attachEventListeners() {
    // Main toggle
    if (this.elements.enabledToggle) {
      this.elements.enabledToggle.addEventListener('change', () => {
        this.handleToggleChange();
      });
    }

    // Footer links
    if (this.elements.helpLink) {
      this.elements.helpLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.openHelp();
      });
    }

    if (this.elements.feedbackLink) {
      this.elements.feedbackLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.openFeedback();
      });
    }

    if (this.elements.privacyLink) {
      this.elements.privacyLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.openPrivacy();
      });
    }
  }

  async loadSettings() {
    try {
      const response = await this.sendMessage({ action: 'getSettings' });
      if (response.success) {
        this.settings = response.data;
      } else {
        // Use default settings
        this.settings = {
          isEnabled: true,
          showNotifications: true
        };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      this.settings = {
        isEnabled: true,
        showNotifications: true
      };
    }
  }

  async loadStats() {
    try {
      // Initialize stats object with meaningful analytics
      this.stats = {
        currentPage: {
          blocked: 0,
          scanned: 0,
          detectionRate: 0
        },
        total: { 
          totalBlocked: 0 
        }
      };

      // Get current page stats from active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs[0]) {
        try {
          const response = await chrome.tabs.sendMessage(tabs[0].id, { action: 'getStats' });
          if (response && typeof response === 'object') {
            this.stats.currentPage.blocked = response.blurredCount || 0;
            this.stats.currentPage.scanned = response.processedCount || 0;
            
            // Calculate detection rate for current page
            if (this.stats.currentPage.scanned > 0) {
              this.stats.currentPage.detectionRate = Math.round(
                (this.stats.currentPage.blocked / this.stats.currentPage.scanned) * 100
              );
            }
            
            console.log('FAI NSFW Filter: Current page stats loaded:', response);
          }
        } catch (tabError) {
          console.log('FAI NSFW Filter: Could not get stats from current tab (normal for non-content pages)');
        }
      }

      // Get total stats from storage
      try {
        const response = await this.sendMessage({ action: 'getStats' });
        if (response && response.success && response.data) {
          this.stats.total = response.data;
          console.log('FAI NSFW Filter: Total stats loaded:', response.data);
        }
      } catch (storageError) {
        console.log('FAI NSFW Filter: Could not load total stats from storage');
      }

    } catch (error) {
      console.error('FAI NSFW Filter: Error loading stats:', error);
      this.stats = {
        currentPage: {
          blocked: 0,
          scanned: 0,
          detectionRate: 0
        },
        total: { totalBlocked: 0 }
      };
    }
  }

  updateUI() {
    // Update toggle
    if (this.elements.enabledToggle) {
      this.elements.enabledToggle.checked = this.settings.isEnabled;
    }
    this.updateStatusText();

    // Update stats with meaningful analytics
    if (this.elements.blockedCount) {
      this.elements.blockedCount.textContent = this.stats.currentPage?.blocked || 0;
    }
    if (this.elements.scannedCount) {
      this.elements.scannedCount.textContent = this.stats.currentPage?.scanned || 0;
    }
    if (this.elements.totalBlocked) {
      this.elements.totalBlocked.textContent = this.stats.total?.totalBlocked || 0;
    }
    if (this.elements.protectionRate) {
      this.elements.protectionRate.textContent = `${this.stats.currentPage?.detectionRate || 0}%`;
    }

    console.log('FAI NSFW Filter: UI updated with meaningful analytics:', this.stats);
  }

  // Method to refresh stats periodically
  async refreshStats() {
    await this.loadStats();
    
    // Recalculate detection rate for current page
    if (this.stats.currentPage.scanned > 0) {
      this.stats.currentPage.detectionRate = Math.round(
        (this.stats.currentPage.blocked / this.stats.currentPage.scanned) * 100
      );
    } else {
      this.stats.currentPage.detectionRate = 0;
    }
    
    this.updateUI();
  }

  updateStatusText() {
    const statusElement = this.elements.statusText;
    if (this.settings.isEnabled) {
      statusElement.textContent = 'Active';
      statusElement.className = 'toggle-status active';
    } else {
      statusElement.textContent = 'Disabled';
      statusElement.className = 'toggle-status inactive';
    }
  }



  async handleToggleChange() {
    const isEnabled = this.elements.enabledToggle.checked;
    
    try {
      console.log('FAI NSFW Filter: Toggle changed to:', isEnabled);
      this.showLoading(true);
      
      // Update settings in background script
      const response = await this.updateSettings({ isEnabled });
      console.log('FAI NSFW Filter: Settings update response:', response);
      
      // Update local state
      this.settings.isEnabled = isEnabled;
      
      // Update UI
      this.updateStatusText();
      
      // Refresh stats after a short delay to catch any changes
      setTimeout(() => {
        this.refreshStats();
      }, 500);
      
      // Show feedback
      this.showToast(isEnabled ? 'Filter activated' : 'Filter disabled');
      
    } catch (error) {
      console.error('FAI NSFW Filter: Error toggling filter:', error);
      // Revert toggle
      if (this.elements.enabledToggle) {
        this.elements.enabledToggle.checked = this.settings.isEnabled;
      }
      this.showToast('Error updating settings', 'error');
    } finally {
      this.showLoading(false);
    }
  }



  async updateSettings(newSettings) {
    const response = await this.sendMessage({
      action: 'updateSettings',
      settings: { ...this.settings, ...newSettings }
    });

    if (!response || !response.success) {
      throw new Error(response?.error || 'Failed to update settings');
    }
    
    return response;
  }

  async refreshCurrentPage() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]) {
        await chrome.tabs.reload(tabs[0].id);
        this.showToast('Page refreshed');
        // Close popup after a short delay
        setTimeout(() => window.close(), 1000);
      }
    } catch (error) {
      console.error('Error refreshing page:', error);
      this.showToast('Could not refresh page', 'error');
    }
  }

  openAdvancedSettings() {
    // Show model information
    this.showToast('Binary AI model: Normal/NSFW classification');
  }

  openHelp() {
    chrome.tabs.create({
      url: 'https://falcons.ai/'
    });
  }

  openFeedback() {
    chrome.tabs.create({
      url: 'https://falcons.ai/'
    });
  }

  openPrivacy() {
    chrome.tabs.create({
      url: 'https://falcons.ai/'
    });
  }

  sendMessage(message) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            console.error('FAI NSFW Filter: Runtime error:', chrome.runtime.lastError);
            resolve({ success: false, error: chrome.runtime.lastError.message });
          } else {
            resolve(response || { success: false, error: 'No response' });
          }
        });
      } catch (error) {
        console.error('FAI NSFW Filter: Send message error:', error);
        resolve({ success: false, error: error.message });
      }
    });
  }

  showLoading(show) {
    const container = document.querySelector('.popup-container');
    if (show) {
      container.classList.add('loading');
    } else {
      container.classList.remove('loading');
    }
  }

  showToast(message, type = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add styles
    Object.assign(toast.style, {
      position: 'fixed',
      top: '10px',
      right: '10px',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500',
      zIndex: '10000',
      opacity: '0',
      transform: 'translateY(-10px)',
      transition: 'all 0.3s ease',
      backgroundColor: type === 'error' ? '#fee2e2' : '#d1fae5',
      color: type === 'error' ? '#dc2626' : '#065f46',
      border: `1px solid ${type === 'error' ? '#fecaca' : '#a7f3d0'}`
    });
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Cleanup method
  cleanup() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }
}

// Initialize popup when DOM is loaded
let popupController;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    popupController = new PopupController();
  });
} else {
  popupController = new PopupController();
}

// Cleanup when popup closes
window.addEventListener('beforeunload', () => {
  if (popupController) {
    popupController.cleanup();
  }
});