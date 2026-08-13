(async function() {
  'use strict';
  
  const FEATURES = {
    'entryFHD+': { script: 'entryfhd.js', loadInMainWorld: true },
    'euid': { script: 'euid.js', loadInMainWorld: false }
  };
  
  const loadedScripts = new Set();
  
  async function isFeatureEnabled(featureId) {
    try {
      const result = await chrome.storage.local.get([featureId]);
      return result[featureId] !== false;
    } catch {
      return true;
    }
  }
  
  async function loadFeatureScript(featureId, featureConfig) {
    const scriptKey = `${featureId}_${featureConfig.script}`;
    if (loadedScripts.has(scriptKey)) return;
    
    try {
      if (featureConfig.loadInMainWorld) {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL(featureConfig.script);
        script.onload = () => loadedScripts.add(scriptKey);
        script.onerror = () => console.error(`Entry Plus - ${featureId} 스크립트 로드 실패`);
        (document.head || document.documentElement).appendChild(script);
      } else {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL(featureConfig.script);
        script.onload = () => loadedScripts.add(scriptKey);
        script.onerror = () => console.error(`Entry Plus - ${featureId} 스크립트 로드 실패`);
        (document.head || document.documentElement).appendChild(script);
      }
    } catch (error) {
      console.error(`Entry Plus - ${featureId} 로드 오류:`, error);
    }
  }
  
  async function loadFeature(featureId) {
    const featureConfig = FEATURES[featureId];
    if (!featureConfig) return;
    
    if (await isFeatureEnabled(featureId)) {
      await loadFeatureScript(featureId, featureConfig);
    }
  }
  
  async function loadAllFeatures() {
    for (const featureId of Object.keys(FEATURES)) {
      await loadFeature(featureId);
    }
  }
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'featureToggleChanged') {
      if (message.enabled) {
        loadFeature(message.feature);
      }
      sendResponse({ success: true });
    }
    return true;
  });
  
  async function init() {
    await loadAllFeatures();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
