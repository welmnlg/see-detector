// content.js
// inject.js 파일을 SOOP 사이트 안방으로 안전하게 불러옵니다.
const script = document.createElement('script');
script.src = chrome.runtime.getURL('inject.js');
script.onload = function() {
    this.remove(); // 배달 완료 후 껍데기 삭제
};
(document.head || document.documentElement).appendChild(script);