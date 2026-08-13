// Инициализация скрипта
console.log('Mobbin Plus loaded');

// Добавляет иконку скачивания при наведении на изображения
function addDownloadIcon(img) {
  // Проверяет, не добавлена ли уже иконка
  if (img.parentElement.querySelector('.download-icon-wrapper')) {
    return;
  }

  // Создает контейнер для обеих кнопок
  const container = document.createElement('div');
  container.className = 'download-icon-wrapper';
  container.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1000;
    display: flex;
    gap: 8px;
  `;

  // Создает обертку для иконки скачивания
  const downloadWrapper = document.createElement('div');
  downloadWrapper.style.cssText = `
    cursor: pointer;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
  `;

  downloadWrapper.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3V16M12 16L7 11M12 16L17 11" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M3 17V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V17" stroke="white" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;

  // Создает обертку для иконки копирования
  const copyWrapper = document.createElement('div');
  copyWrapper.style.cssText = `
    cursor: pointer;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
  `;

  copyWrapper.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  // Обработчик hover для кнопки скачивания
  downloadWrapper.addEventListener('mouseenter', () => {
    downloadWrapper.style.background = 'rgba(0, 0, 0, 0.9)';
  });
  downloadWrapper.addEventListener('mouseleave', () => {
    downloadWrapper.style.background = 'rgba(0, 0, 0, 0.7)';
  });

  // Обработчик hover для кнопки копирования
  copyWrapper.addEventListener('mouseenter', () => {
    copyWrapper.style.background = 'rgba(0, 0, 0, 0.9)';
  });
  copyWrapper.addEventListener('mouseleave', () => {
    copyWrapper.style.background = 'rgba(0, 0, 0, 0.7)';
  });

  // Обработчик клика для скачивания изображения
  downloadWrapper.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    const imgSrc = img.getAttribute('src');
    if (imgSrc) {
      // Используем Chrome Downloads API для прямого скачивания
      chrome.runtime.sendMessage({
        action: 'downloadImage',
        url: imgSrc,
        filename: `mobbin-screen-${Date.now()}.jpg`
      });
    }
  });

  // Обработчик клика для копирования изображения в буфер
  copyWrapper.addEventListener('click', async (e) => {
    e.stopPropagation();
    e.preventDefault();
    let imgSrc = img.getAttribute('src');
    if (imgSrc) {
      const originalHTML = copyWrapper.innerHTML;
      
      try {
        // Показываем индикатор загрузки
        copyWrapper.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2" stroke-dasharray="31.4 31.4" stroke-dashoffset="0">
              <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
            </circle>
          </svg>
        `;
        
        // Меняем формат на PNG в URL (если есть параметр f=webp)
        const url = new URL(imgSrc);
        const params = new URLSearchParams(url.search);
        if (params.has('f')) {
          params.set('f', 'png');
          url.search = params.toString();
          imgSrc = url.toString();
        }
        
        // Загружаем изображение
        const response = await fetch(imgSrc);
        const blob = await response.blob();
        
        // Копируем в буфер обмена
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);

        // Показываем галочку успеха
        copyWrapper.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
        copyWrapper.style.background = 'rgba(34, 197, 94, 0.9)';
        
        setTimeout(() => {
          copyWrapper.innerHTML = originalHTML;
          copyWrapper.style.background = 'rgba(0, 0, 0, 0.7)';
        }, 1500);
      } catch (err) {
        console.error('Failed to copy image:', err);
        // Показываем крестик ошибки
        copyWrapper.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
        copyWrapper.style.background = 'rgba(239, 68, 68, 0.9)';
        setTimeout(() => {
          copyWrapper.innerHTML = originalHTML;
          copyWrapper.style.background = 'rgba(0, 0, 0, 0.7)';
        }, 1500);
      }
    }
  });

  // Добавляем кнопки в контейнер
  container.appendChild(copyWrapper);
  container.appendChild(downloadWrapper);

  // Делает родительский элемент изображения позиционированным
  const parent = img.parentElement;
  if (parent && getComputedStyle(parent).position === 'static') {
    parent.style.position = 'relative';
  }

  // Убирает pointer-events-none с родителя, чтобы работали события мыши
  if (parent && parent.classList.contains('pointer-events-none')) {
    parent.classList.remove('pointer-events-none');
    parent.style.pointerEvents = 'auto';
  }

  // Добавляет обработчики наведения
  parent.addEventListener('mouseenter', () => {
    container.style.opacity = '1';
  });

  parent.addEventListener('mouseleave', () => {
    container.style.opacity = '0';
  });

  // Включает pointer-events для container
  container.style.pointerEvents = 'auto';

  // Добавляет иконку в DOM
  parent.appendChild(container);
}

// Изменяет ссылки на изображения, меняя параметр w<80 на w=1920
function updateImageSources() {
  // console.log('Checking and updating image sources...');

  // Получает все теги img на странице
  const images = document.querySelectorAll('img');
  let updatedCount = 0;

  images.forEach(img => {
    const src = img.getAttribute('src');
    if (src) {
      try {
        // Парсит URL и параметры
        const url = new URL(src);
        const params = new URLSearchParams(url.search);
        // Проверяет наличие параметра w со значением меньше 80
        if (params.has('w')) {
          const wValue = parseInt(params.get('w'));
          if (wValue < 80) {
            // Изменяет параметр w на 1920
            params.set('w', '1920');
            // Удаляет параметр image
            params.delete('image');
            params.delete("gravity");
            params.delete("v");
            url.search = params.toString();
            // Обновляет src изображения
            img.setAttribute('src', url.toString());
            updatedCount++;
            // console.log(`Updated image src: ${src} -> ${url.toString()}`);
            // Находит следующий div-элемент после img
            const nextDiv = img.nextElementSibling;
            if (nextDiv && nextDiv.tagName === 'DIV') {
              // Дополнительная обработка найденного div
              nextDiv.remove();
            }

            // Добавляет иконку скачивания к обновленному изображению
            addDownloadIcon(img);
          }
        }
      } catch (e) {
        // Обработка случаев с невалидным URL
        // console.error(`Error processing image URL: ${src ?? ''}`, e);
      }
    }
  });

  // console.log(`Updated ${updatedCount} images: w<80 changed to w=1920 and/or removed image parameter`);
}

// Находит и удаляет элемент aside, содержащий h1 с текстом "Access all"
function removeAccessAllAside() {
  // Находит все теги h1
  const h1Elements = document.querySelectorAll('h1');

  // Перебирает все теги h1, ищет теги содержащие "Access all"
  for (const h1 of h1Elements) {
    if (h1.textContent && h1.textContent.includes('Access all')) {
      // Ищет ближайший тег aside вверх по дереву
      let currentElement = h1;
      while (currentElement && currentElement.tagName !== 'ASIDE') {
        currentElement = currentElement.parentElement;
      }

      // Если найден тег aside, удаляет его безопасно
      if (currentElement && currentElement.tagName === 'ASIDE') {
        try {
          // Проверяем что элемент все еще в DOM перед удалением
          if (currentElement.parentNode && document.body.contains(currentElement)) {
            currentElement.remove();
          }
        } catch (e) {
          // Игнорируем ошибки удаления
        }
      }
    }
  }
}

// Заменяет кнопку "Get Pro" на кнопку с текстом "Cracked"
function replaceGetProButton() {
  // Находит кнопку "Get Pro" по тексту
  const buttons = document.querySelectorAll('button');
  
  for (const button of buttons) {
    const span = button.querySelector('span.whitespace-nowrap');
    if (span && span.textContent === 'Get Pro') {
      try {
        // Проверяем что кнопка все еще в DOM
        if (!button.parentElement || !document.body.contains(button)) {
          continue;
        }

        // Создает новую кнопку
        const crackedButton = document.createElement('div');
        crackedButton.className = button.className;
        crackedButton.style.display = 'inline-flex';
        crackedButton.style.alignItems = 'center';
        crackedButton.style.justifyContent = 'center';
        crackedButton.style.cursor = 'default';
        crackedButton.innerHTML = `
          <span class="flex items-center justify-center gap-x-8">
            <span class="truncate">
              <span class="whitespace-nowrap">Cracked 🔓</span>
            </span>
          </span>
        `;
        
        // Заменяет кнопку безопасно
        if (button.parentElement && document.body.contains(button)) {
          button.parentElement.replaceChild(crackedButton, button);
        }
        break;
      } catch (e) {
        // Игнорируем ошибки замены
      }
    }
  }
}

// Инициализирует функциональность контент-скрипта
function initialize() {
  updateImageSources();
  removeAccessAllAside();
  replaceGetProButton();

  // Отслеживает изменения DOM, обрабатывает динамически загружаемые изображения и новые h1 теги
  const observer = new MutationObserver(mutations => {
    let hasNewImages = false;
    let hasNewElements = false;

    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          // Проверяет, является ли узел элементом
          if (node.nodeType === 1) {
            // Проверяет, является ли новый узел img или содержит img
            if (node.tagName === 'IMG' || node.querySelector('img')) {
              hasNewImages = true;
            }

            // Проверяет, содержит ли новый узел тег h1
            if (node.tagName === 'H1' || node.querySelector('h1')) {
              hasNewElements = true;
            }
          }
        })
      }
    });

    // Если добавлены новые изображения, повторно запускает функцию обновления
    if (hasNewImages) {
      updateImageSources();
    }

    // Если добавлены новые элементы, проверяет и удаляет aside с h1 содержащим Access all
    if (hasNewElements) {
      removeAccessAllAside();
      replaceGetProButton();
    }
  });

  // Настраивает наблюдатель
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Выполняет инициализацию
initialize();