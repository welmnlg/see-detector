document.addEventListener('DOMContentLoaded', () => {
  const inputField = document.getElementById('minRecommend');

  // 기존 설정값 불러오기
  chrome.storage.local.get(['minRecommend'], (result) => {
    if (result.minRecommend !== undefined) {
      inputField.value = result.minRecommend;
    }
  });

  // 현재 탭을 새로고침하는 함수
  const reloadCurrentTab = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.reload(tabs[0].id);
      }
    });
  };

  // [적용하기] 버튼 클릭 시
  document.getElementById('saveBtn').addEventListener('click', () => {
    const min = parseInt(inputField.value) || 0;
    chrome.storage.local.set({ minRecommend: min }, () => {
      reloadCurrentTab(); // 즉시 새로고침
      window.close();     // 팝업창 닫기
    });
  });

  // [필터 해제] 버튼 클릭 시
  document.getElementById('resetBtn').addEventListener('click', () => {
    chrome.storage.local.set({ minRecommend: 0 }, () => {
      inputField.value = 0;
      reloadCurrentTab(); // 즉시 새로고침
      window.close();     // 팝업창 닫기
    });
  });
});