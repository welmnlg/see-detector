(function () {
  'use strict';
  
  if (!/^https:\/\/playentry\.org\/(project|iframe|noframe|ws)\//.test(location.href)) return;

  const chrome_ = typeof chrome !== 'undefined' ? chrome : null;
  const featureStates = new Map();
  const registeredFeatures = new Map();

  function getIframe() {
    return document.querySelector('iframe.eaizycc0') || document.querySelector('iframe');
  }

  function getGlobal(iframe) {
    return iframe?.contentWindow || self;
  }

  const VariableModifier = {
    setVariable(iframe, variableName, value) {
      const ed = getGlobal(iframe);
      const variable = ed?.Entry?.variableContainer?.getVariableByName(variableName);
      if (variable) {
        variable.value_ = value;
        return true;
      }
      return false;
    },
    
    setVariableWithRetry(iframe, variableName, value, retryDelay = 100) {
      const ed = getGlobal(iframe);
      if (!ed?.Entry?.variableContainer) {
        setTimeout(() => this.setVariableWithRetry(iframe, variableName, value, retryDelay), retryDelay);
        return;
      }
      
      const variable = ed.Entry.variableContainer.getVariableByName(variableName);
      if (variable) {
        variable.value_ = value;
      } else {
        setTimeout(() => this.setVariableWithRetry(iframe, variableName, value, retryDelay), retryDelay);
      }
    }
  };

  const StageWatcher = {
    callbacks: new Map(),
    frameId: null,

    async getStage() {
      const iframe = getIframe();
      const global = getGlobal(iframe);
      if (!global) return { stage: null, iframe };
      
      const Entry = await Promise.resolve(global.Entry).catch(() => null);
      return { stage: Entry?.stage || null, iframe };
    },

    async checkAndExecute(featureId, callback) {
      const { stage, iframe } = await this.getStage();
      if (stage && !stage[`_${featureId}Set`]) {
        stage[`_${featureId}Set`] = true;
        await callback(iframe);
      }
    },

    register(featureId, callback) {
      this.callbacks.set(featureId, callback);
      this.checkAndExecute(featureId, callback);
      if (!this.frameId) this.start();
    },

    start() {
      const watcher = this;
      const frame = async function() {
        watcher.frameId = requestAnimationFrame(frame);
        const { stage, iframe } = await watcher.getStage();
        if (!stage) return;
        
        const Entry = getGlobal(iframe)?.Entry;
        if (Entry && EntryEventObserver.currentEntry !== Entry && EntryEventObserver.hooked) {
          EntryEventObserver.reset();
          EntryEventObserver.hook();
        }
        
        for (const [featureId, callback] of watcher.callbacks) {
          if (!stage[`_${featureId}Set`]) {
            stage[`_${featureId}Set`] = true;
            await callback(iframe);
          }
        }
      };
      this.frameId = requestAnimationFrame(frame);
    }
  };

  if (chrome_?.runtime?.onMessage) {
    chrome_.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'featureToggleChanged' && featureStates.has(message.feature)) {
        featureStates.set(message.feature, message.enabled);
        sendResponse({ success: true });
      }
      return true;
    });
  }

  const EntryEventObserver = {
    hooked: false,
    registeredFeatures: registeredFeatures,
    originalDispatchEvent: null,
    currentEntry: null,

    reset() {
      if (this.currentEntry && this.originalDispatchEvent) {
        this.currentEntry.dispatchEvent = this.originalDispatchEvent;
      }
      this.hooked = false;
      this.originalDispatchEvent = null;
      this.currentEntry = null;
    },

    async hook() {
      const Entry = getGlobal(getIframe())?.Entry;
      if (!Entry?.dispatchEvent) {
        setTimeout(() => this.hook(), 100);
        return;
      }

      if (this.currentEntry !== Entry) {
        this.reset();
      }

      if (this.hooked && this.currentEntry === Entry) {
        return;
      }

      this.originalDispatchEvent = Entry.dispatchEvent;
      const observer = this;

      Entry.dispatchEvent = function (type, ...args) {
        if (type === 'run') observer.handleRun();
        else if (type === 'stop') observer.handleStop();
        return observer.originalDispatchEvent.call(this, type, ...args);
      };

      this.hooked = true;
      this.currentEntry = Entry;
    },

    async handleRun() {
      const iframe = getIframe();
      for (const [featureId, feature] of this.registeredFeatures) {
        if (await feature.checkEnabled()) {
          if (!VariableModifier.setVariable(iframe, feature.variableName, feature.variableValue)) {
            VariableModifier.setVariableWithRetry(iframe, feature.variableName, feature.variableValue);
          }
        }
      }
    },

    async handleStop() {
      const iframe = getIframe();
      for (const [featureId, feature] of this.registeredFeatures) {
        if (!VariableModifier.setVariable(iframe, feature.variableName, '0')) {
          VariableModifier.setVariableWithRetry(iframe, feature.variableName, '0');
        }
      }
    }
  };

  function registerFeature(featureId, variableName, variableValue) {
    featureStates.set(featureId, true);

    async function checkEnabled() {
      try {
        if (chrome_?.storage?.local) {
          const result = await chrome_.storage.local.get([featureId]);
          featureStates.set(featureId, result[featureId] !== false);
        }
      } catch {
        featureStates.set(featureId, true);
      }
      return featureStates.get(featureId);
    }

    async function setVariable(iframe) {
      if (!(await checkEnabled())) return;
      await VariableModifier.setVariableWithRetry(iframe, variableName, variableValue);
    }

    registeredFeatures.set(featureId, {
      variableName,
      variableValue,
      checkEnabled,
      iframe: null
    });

    EntryEventObserver.hook();
    StageWatcher.register(featureId, setVariable);
    checkEnabled();
    return { checkEnabled, setVariable };
  }

  function resetObserverIfNeeded() {
    if (EntryEventObserver.hooked && registeredFeatures.size > 0) {
      EntryEventObserver.reset();
      EntryEventObserver.hook();
    }
  }

  function scheduleUrlCheck() {
    const schedule = typeof requestIdleCallback !== 'undefined'
      ? (fn) => requestIdleCallback(fn, { timeout: 1000 })
      : (fn) => setTimeout(fn, 1000);
    
    let lastUrl = location.href;
    let lastPathname = location.pathname;
    let idleCallbackId = null;

    function checkUrlChange() {
      if (location.href !== lastUrl || location.pathname !== lastPathname) {
        lastUrl = location.href;
        lastPathname = location.pathname;
        resetObserverIfNeeded();
      }
      idleCallbackId = schedule(checkUrlChange);
    }
    
    idleCallbackId = schedule(checkUrlChange);
  }

  scheduleUrlCheck();

  ['popstate', 'hashchange'].forEach(event => {
    window.addEventListener(event, () => {
      setTimeout(resetObserverIfNeeded, 100);
    });
  });

  if (typeof window !== 'undefined') {
    window.EntryPlus = window.EntryPlus || {};
    Object.assign(window.EntryPlus, {
      VariableModifier,
      StageWatcher,
      registerFeature,
      EntryEventObserver
    });
  }
})();
