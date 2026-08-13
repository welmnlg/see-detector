const FEATURES = [
  { id: 'entryFHD+', name: 'Entry FHD+', description: '작품 화질 향상' },
  { id: 'euid', name: 'Euid', description: '마스킹 된 아이디를 대체하는 UUID 설정' }
];

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('featuresContainer');
  const applyButton = document.getElementById('applyButton');
  const entrySiteWarning = document.getElementById('entrySiteWarning');
  
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];
  
  // 엔트리 사이트 체크
  if (!currentTab?.url || !currentTab.url.includes('playentry.org')) {
    entrySiteWarning.classList.add('show');
    container.style.display = 'none';
    applyButton.style.display = 'none';
    return;
  }
  
  const initialStates = {};
  const currentStates = {};
  
  for (const feature of FEATURES) {
    const featureItem = document.createElement('div');
    featureItem.className = 'feature-item';
    featureItem.innerHTML = `
      <div class="feature-info">
        <div class="feature-name">${feature.name}</div>
        <div class="feature-desc">${feature.description}</div>
      </div>
      <div class="toggle-switch" data-feature-id="${feature.id}"></div>
    `;
    container.appendChild(featureItem);
    
    const toggleSwitch = featureItem.querySelector('.toggle-switch');
    const result = await chrome.storage.local.get([feature.id]);
    const isEnabled = result[feature.id] !== false;
    
    initialStates[feature.id] = isEnabled;
    currentStates[feature.id] = isEnabled;
    
    if (isEnabled) toggleSwitch.classList.add('active');
    
    toggleSwitch.addEventListener('click', () => {
      const newState = !toggleSwitch.classList.contains('active');
      toggleSwitch.classList.toggle('active', newState);
      currentStates[feature.id] = newState;
      updateApplyButton();
    });
  }
  
  function updateApplyButton() {
    const hasChanges = FEATURES.some(feature => 
      initialStates[feature.id] !== currentStates[feature.id]
    );
    
    applyButton.disabled = !hasChanges;
  }
  
  applyButton.addEventListener('click', async () => {
    if (applyButton.disabled) return;
    
    for (const feature of FEATURES) {
      await chrome.storage.local.set({ 
        [feature.id]: currentStates[feature.id] 
      });
      initialStates[feature.id] = currentStates[feature.id];
    }
    
    const allTabs = await chrome.tabs.query({ url: 'https://playentry.org/*' });
    const messages = FEATURES.map(feature => ({
      action: 'featureToggleChanged',
      feature: feature.id,
      enabled: currentStates[feature.id]
    }));
    
    for (const tab of allTabs) {
      messages.forEach(msg => {
        chrome.tabs.sendMessage(tab.id, msg).catch(() => {});
      });
    }
    
    applyButton.disabled = true;
    
    if (currentTab?.url?.includes('playentry.org') && currentTab?.id) {
      chrome.tabs.reload(currentTab.id);
    }
  });
  
  updateApplyButton();
});
