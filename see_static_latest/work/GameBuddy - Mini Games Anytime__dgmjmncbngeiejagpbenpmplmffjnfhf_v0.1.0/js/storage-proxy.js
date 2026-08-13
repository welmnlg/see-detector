// Storage proxy for iframe games to access chrome.storage via postMessage
// This script is injected into game iframes to provide chrome.storage.local API

(function() {
  'use strict';
  
  // Check if we're in an iframe
  if (window === window.top) {
    return; // Not in iframe, don't inject
  }
  
  // Generate unique message ID for each request
  let messageIdCounter = 0;
  const pendingCallbacks = new Map();
  
  // Listen for responses from parent window
  window.addEventListener('message', function(event) {
    // Security: only accept storage responses (origin check is done in parent)
    const data = event.data;
    if (data._storageResponse && data.messageId) {
      const callback = pendingCallbacks.get(data.messageId);
      if (callback) {
        pendingCallbacks.delete(data.messageId);
        if (data.error) {
          callback(new Error(data.error));
        } else {
          callback(null, data.result);
        }
      }
    }
  });
  
  // Send message to parent window and wait for response
  function sendStorageMessage(action, params) {
    return new Promise((resolve, reject) => {
      const messageId = ++messageIdCounter;
      
      // Store callback
      pendingCallbacks.set(messageId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
      
      // Send message to parent
      window.parent.postMessage({
        _storageRequest: true,
        messageId: messageId,
        action: action,
        params: params
      }, '*');
      
      // Timeout after 5 seconds
      setTimeout(() => {
        if (pendingCallbacks.has(messageId)) {
          pendingCallbacks.delete(messageId);
          reject(new Error('Storage request timeout'));
        }
      }, 5000);
    });
  }
  
  // Create chrome.storage.local proxy
  const storageProxy = {
    get: function(keys, callback) {
      const keysArray = Array.isArray(keys) ? keys : (keys ? [keys] : null);
      sendStorageMessage('get', { keys: keysArray })
        .then(result => {
          if (callback) {
            callback(result);
          }
        })
        .catch(error => {
          if (callback) {
            callback({});
          }
        });
    },
    
    set: function(items, callback) {
      sendStorageMessage('set', { items: items })
        .then(() => {
          if (callback) {
            callback();
          }
        })
        .catch(error => {
          if (callback) {
            if (chrome && chrome.runtime && chrome.runtime.lastError) {
              chrome.runtime.lastError = { message: error.message };
            }
            callback();
          }
        });
    },
    
    remove: function(keys, callback) {
      const keysArray = Array.isArray(keys) ? keys : [keys];
      sendStorageMessage('remove', { keys: keysArray })
        .then(() => {
          if (callback) {
            callback();
          }
        })
        .catch(error => {
          if (callback) {
            if (chrome && chrome.runtime && chrome.runtime.lastError) {
              chrome.runtime.lastError = { message: error.message };
            }
            callback();
          }
        });
    },
    
    clear: function(callback) {
      sendStorageMessage('clear', {})
        .then(() => {
          if (callback) {
            callback();
          }
        })
        .catch(error => {
          if (callback) {
            if (chrome && chrome.runtime && chrome.runtime.lastError) {
              chrome.runtime.lastError = { message: error.message };
            }
            callback();
          }
        });
    }
  };
  
  // Expose chrome.storage.local if chrome is not available
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
    if (typeof chrome === 'undefined') {
      window.chrome = {};
    }
    if (!chrome.storage) {
      chrome.storage = {};
    }
    chrome.storage.local = storageProxy;
    
    // Also set lastError object for compatibility
    chrome.runtime = chrome.runtime || {};
    chrome.runtime.lastError = null;
  } else {
    // If chrome.storage.local exists, wrap it to use postMessage
    // This ensures cross-page sharing
    const originalStorage = chrome.storage.local;
    chrome.storage.local = storageProxy;
  }
})();

