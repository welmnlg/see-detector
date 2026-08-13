// 핀터레스트 페이지에서 이미지를 스캔하는 로직
function scanImages() {
  const images = Array.from(document.querySelectorAll('img'));
  const imageUrls = new Set();

  images.forEach(img => {
    let src = img.src;
    if (!src) return;

    // 핀터레스트 고화질 이미지 패턴 매칭 (저화질 주소를 originals 원본 주소로 변환)
    // 예: https://i.pinimg.com/236x/xx/xx/xx.jpg -> https://i.pinimg.com/originals/xx/xx/xx.jpg
    let highRes = src.replace(/\/(236x|474x|736x)\//, '/originals/');
    
    // 핀터레스트 이미지가 맞는지 및 확장자 확인 (XML 등 배제)
    const isImageHost = highRes.includes('pinimg.com');
    // URL에서 쿼리 스트링을 제외한 순수 파일명이 이미지 확장자로 끝나는지 확인
    const pureUrl = highRes.split('?')[0];
    const isImageExt = /\.(jpg|jpeg|png|webp|gif)$/i.test(pureUrl);

    if (isImageHost && isImageExt) {
      imageUrls.add(highRes);
    }
  });

  return Array.from(imageUrls);
}

// 팝업으로부터의 메시지 수신
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scan") {
    const foundImages = scanImages();
    sendResponse({ images: foundImages });
  }
});
