document.addEventListener('DOMContentLoaded', () => {
  const scanBtn = document.getElementById('scan-btn');
  const actionGroup = document.getElementById('action-group');
  const imageList = document.getElementById('image-list');
  const selectAll = document.getElementById('select-all');
  const downloadBtn = document.getElementById('download-btn');
  const statusBar = document.getElementById('status-bar');
  const progressFill = document.getElementById('progress-fill');
  const statusText = document.getElementById('status-text');

  let currentImages = new Set(); // 중복 없는 누적 수집용
  let selectionState = new Map(); // 이미지별 체크 상태 저장용

  // 1. 이미지 스캔 버튼 클릭
  scanBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    statusText.innerText = "이미지 찾는 중...";
    
    chrome.tabs.sendMessage(tab.id, { action: "scan" }, (response) => {
      if (chrome.runtime.lastError) {
        alert("핀터레스트 페이지를 새로고침한 뒤 다시 시도해 주세요!");
        return;
      }
      
      if (response && response.images) {
        // 기존 리스트에 새로운 이미지들을 추가
        response.images.forEach(url => {
          if (!currentImages.has(url)) {
            currentImages.add(url);
            selectionState.set(url, true); // 처음 발견된 이미지는 기본 '체크'
          }
        });
        renderImageList(Array.from(currentImages));
        actionGroup.classList.remove('hidden');
        scanBtn.innerText = "계속해서 추가 스캔하기";
      }
    });
  });

  // 2. 이미지 리스트 렌더링
  function renderImageList(images) {
    imageList.innerHTML = '';
    if (images.length === 0) {
      imageList.innerHTML = '<p class="empty-msg">이미지를 찾지 못했습니다.</p>';
      updateCount();
      return;
    }

    images.forEach((url, index) => {
      // 렌더링 시 필터링을 완화하여 모든 이미지를 시도 (로딩 실패 시 제거됨)
      const item = document.createElement('div');
      item.className = 'img-item';
      
      const img = document.createElement('img');
      img.src = url;
      img.loading = "lazy";
      img.addEventListener('error', () => {
        // 로딩 실패 시 placeholder 대신 아예 칸을 삭제!
        item.remove();
        updateCount();
      });

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'img-check';
      checkbox.dataset.url = url;
      checkbox.checked = selectionState.get(url) ?? true;
      
      checkbox.addEventListener('change', (e) => {
        selectionState.set(url, e.target.checked);
        updateCount();
      });

      item.appendChild(img);
      item.appendChild(checkbox);
      imageList.appendChild(item);
    });
    updateCount();
  }

  // 3. 카운트 업데이트 함수
  function updateCount() {
    const selectedCount = document.querySelectorAll('.img-check:checked').length;
    document.getElementById('selected-count').innerText = selectedCount;
  }

  // 4. 전체 선택 토글
  selectAll.addEventListener('change', (e) => {
    const checks = document.querySelectorAll('.img-check');
    checks.forEach(cb => cb.checked = e.target.checked);
    updateCount();
  });

  // 4. 선택 다운로드 실행
  downloadBtn.addEventListener('click', async () => {
    const selectedCheckboxes = document.querySelectorAll('.img-check:checked');
    const urlsToDownload = Array.from(selectedCheckboxes).map(cb => cb.dataset.url);

    if (urlsToDownload.length === 0) {
      alert("다운로드할 이미지를 선택해주세요!");
      return;
    }

    statusBar.classList.remove('hidden');
    let completed = 0;
    const total = urlsToDownload.length;

    for (const url of urlsToDownload) {
      const filename = url.split('/').pop().split('?')[0] || `image_${Date.now()}.jpg`;
      
      await new Promise(resolve => {
        try {
          chrome.runtime.sendMessage({ action: "download", url, filename }, (response) => {
            if (chrome.runtime.lastError) {
              console.log("Channel closed or error:", chrome.runtime.lastError.message);
            }
            completed++;
            const percent = (completed / total) * 100;
            if (progressFill) progressFill.style.width = `${percent}%`;
            if (statusText) statusText.innerText = `다운로드 중... (${completed}/${total})`;
            resolve();
          });
        } catch (err) {
          console.error("Messaging error:", err);
          resolve();
        }
      });
    }

    statusText.innerText = "다운로드 완료! (PinterDownloader 폴더를 확인하세요)";
    setTimeout(() => {
      statusBar.classList.add('hidden');
      progressFill.style.width = '0%';
    }, 3000);
  });
});
