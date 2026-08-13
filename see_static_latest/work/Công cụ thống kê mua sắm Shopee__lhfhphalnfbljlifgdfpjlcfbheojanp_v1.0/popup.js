document.getElementById('startBtn').addEventListener('click', async () => {
  const button = document.getElementById('startBtn');
  const statusDiv = document.getElementById('status');
  const resultDiv = document.getElementById('result');
  
  button.disabled = true;
  button.textContent = 'Đang xử lý...';
  statusDiv.style.display = 'block';
  statusDiv.className = 'loading';
  statusDiv.textContent = '⏳ Đang cuộn trang và thu thập dữ liệu...';
  resultDiv.innerHTML = '';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: scrollAndCollectPrices
    });

    const data = results[0].result;
    
    if (data.error) {
      statusDiv.className = 'error';
      statusDiv.textContent = '❌ ' + data.error;
    } else {
      statusDiv.className = 'success';
      statusDiv.textContent = `✓ Đã tìm thấy ${data.count} đơn hàng`;
      
      // Tính toán thống kê
      const numbers = data.priceNumbers;
      const highest = Math.max(...numbers);
      const lowest = Math.min(...numbers);
      const average = Math.round(data.totalNumber / data.count);
      
      // Hiển thị thống kê
      let html = '<div class="stats-grid">';
      html += '<div class="stat-card highlight">';
      html += '<div class="stat-label">💰 Tổng cộng</div>';
      html += `<div class="stat-value">${data.total}</div>`;
      html += '</div>';
      
      html += '<div class="stat-card">';
      html += '<div class="stat-label">📦 Số đơn hàng</div>';
      html += `<div class="stat-value">${data.count}</div>`;
      html += '</div>';
      
      html += '<div class="stat-card">';
      html += '<div class="stat-label">📊 Trung bình</div>';
      html += `<div class="stat-value">${average.toLocaleString('vi-VN')}₫</div>`;
      html += '</div>';
      
      html += '<div class="stat-card">';
      html += '<div class="stat-label">🔝 Cao nhất</div>';
      html += `<div class="stat-value">${highest.toLocaleString('vi-VN')}₫</div>`;
      html += '</div>';
      
      html += '<div class="stat-card">';
      html += '<div class="stat-label">🔻 Thấp nhất</div>';
      html += `<div class="stat-value">${lowest.toLocaleString('vi-VN')}₫</div>`;
      html += '</div>';
      
      html += '</div>';
      
      // Hiển thị danh sách chi tiết
      html += '<div class="price-list-container">';
      html += '<div class="price-list-header">';
      html += '<span>📋 Chi tiết đơn hàng</span>';
      html += `<span>${data.count} đơn</span>`;
      html += '</div>';
      html += '<div class="price-list">';
      
      data.priceNumbers.forEach((priceNum, index) => {
        const isHighest = priceNum === highest;
        const isLowest = priceNum === lowest;
        const itemClass = isHighest ? 'highest' : (isLowest ? 'lowest' : '');
        
        html += `<div class="price-item ${itemClass}">`;
        html += '<div style="display: flex; align-items: center;">';
        html += `<span class="price-index">${index + 1}</span>`;
        html += `<span class="price-value">${data.prices[index]}</span>`;
        if (isHighest) {
          html += '<span class="price-badge badge-highest">CAO NHẤT</span>';
        }
        if (isLowest) {
          html += '<span class="price-badge badge-lowest">THẤP NHẤT</span>';
        }
        html += '</div>';
        html += '</div>';
      });
      
      html += '</div>';
      html += '</div>';
      
      resultDiv.innerHTML = html;
    }
  } catch (error) {
    statusDiv.className = 'error';
    statusDiv.textContent = '❌ Lỗi: ' + error.message;
  } finally {
    button.disabled = false;
    button.textContent = '🔄 Tính lại';
  }
});

function scrollAndCollectPrices() {
  return new Promise((resolve) => {
    let lastHeight = 0;
    let sameHeightCount = 0;
    const maxSameCount = 3;
    
    function autoScroll() {
      window.scrollTo(0, document.body.scrollHeight);
      
      setTimeout(() => {
        const currentHeight = document.body.scrollHeight;
        
        if (currentHeight === lastHeight) {
          sameHeightCount++;
        } else {
          sameHeightCount = 0;
          lastHeight = currentHeight;
        }
        
        if (sameHeightCount >= maxSameCount) {
          collectData();
        } else {
          autoScroll();
        }
      }, 1000);
    }
    
    function collectData() {
      const elements = document.querySelectorAll('div.t7TQaf[aria-label*="Thành tiền"]');
      
      if (elements.length === 0) {
        resolve({ error: 'Không tìm thấy dữ liệu' });
        return;
      }
      
      const prices = [];
      const priceNumbers = [];
      let total = 0;
      
      elements.forEach(element => {
        const priceText = element.textContent.trim();
        prices.push(priceText);
        
        const numericValue = priceText.replace(/[₫.]/g, '').replace(/,/g, '');
        const price = parseInt(numericValue);
        
        if (!isNaN(price)) {
          priceNumbers.push(price);
          total += price;
        }
      });
      
      const formattedTotal = total.toLocaleString('vi-VN') + '₫';
      
      resolve({
        count: elements.length,
        prices: prices,
        priceNumbers: priceNumbers,
        total: formattedTotal,
        totalNumber: total
      });
    }
    
    autoScroll();
  });
}
