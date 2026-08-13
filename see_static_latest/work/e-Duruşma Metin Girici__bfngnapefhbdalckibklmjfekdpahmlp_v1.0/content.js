// UYAP e-Duruşma Otomatik Metin - Content Script
// Version 1.2 - avukat.uyap.gov.tr
(function() {
  'use strict';

  const METINLER = {
    baskaDurusma: {
      label: 'Başka Duruşmalar',
      metin: 'Aynı gün başka duruşmalarımın olması nedeniyle mahkemeniz duruşmasına e-duruşma sistemi üzerinden katılma talebimin kabulüne, teknik bağlantı sorunu veya herhangi bir sebeple duruşmaya bağlanamamam halinde mazeretli sayılmama karar verilmesini talep ederim.'
    },
    arabuluculuk: {
      label: 'Arabuluculuk',
      metin: 'Arabuluculuk görüşmelerim nedeniyle mahkemeniz duruşmasına e-duruşma sistemi üzerinden katılma talebimin kabulüne, teknik bağlantı sorunu veya herhangi bir sebeple duruşmaya bağlanamamam halinde mazeretli sayılmama karar verilmesini talep ederim.'
    },
    ilDisi: {
      label: 'İl Dışı',
      metin: '{IL}\x27da yerleşik olmam nedeniyle mahkemeniz duruşmasına e-duruşma sistemi üzerinden katılma talebimin kabulüne, teknik bağlantı sorunu veya herhangi bir sebeple duruşmaya bağlanamamam halinde mazeretli sayılmama karar verilmesini talep ederim.'
    },
    saglik: {
      label: 'Sağlık Sebebi',
      metin: 'Sağlık problemlerim nedeniyle mahkemeniz duruşmasına e-duruşma sistemi üzerinden katılma talebimin kabulüne, teknik bağlantı sorunu veya herhangi bir sebeple duruşmaya bağlanamamam halinde mazeretli sayılmama karar verilmesini talep ederim.'
    }
  };

  let cachedCity = null;

  function getCityFromCoords(lat, lon, callback) {
    var url = 'https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lon + '&format=json&accept-language=tr';
    fetch(url)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var addr = data.address || {};
        var city = addr.province || addr.city || addr.town || addr.county || 'Ankara';
        city = city.replace(' Province', '').replace(' İli', '').replace(' Ili', '').trim();
        callback(city);
      })
      .catch(function() { callback('Ankara'); });
  }

  function getCity(callback) {
    if (cachedCity) { callback(cachedCity); return; }
    if (!navigator.geolocation) { callback('Ankara'); return; }
    navigator.geolocation.getCurrentPosition(
      function(pos) {
        getCityFromCoords(pos.coords.latitude, pos.coords.longitude, function(city) {
          cachedCity = city;
          callback(city);
        });
      },
      function() {
        chrome.storage.local.get(['manualCity'], function(result) {
          callback(result.manualCity || 'Ankara');
        });
      },
      { timeout: 5000 }
    );
  }

  function setTextareaValue(value) {
    var textarea = document.querySelector('.e-durusma-text textarea') ||
                   document.querySelector('.e-durusma-text .dx-texteditor-input') ||
                   document.querySelector('.dx-overlay-wrapper.edurusma textarea');
    if (!textarea) return false;
    var nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
    if (nativeSetter && nativeSetter.set) {
      nativeSetter.set.call(textarea, value);
    } else {
      textarea.value = value;
    }
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
    textarea.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    var counter = document.querySelector('.input-subtitle');
    if (counter) {
      counter.textContent = value.length + '/500 karakter girebilirsiniz.';
    }
    return true;
  }

  function createPanel() {
    var panel = document.createElement('div');
    panel.id = 'uyap-ototext-panel';
    panel.innerHTML =
      '<div id="uyap-ototext-header">' +
        '<span>E-Duruşma Metin Girici</span>' +
      '</div>' +
      '<div id="uyap-ototext-body">' +
        '<div class="uyap-field-row">' +
          '<select id="uyap-sebep-select">' +
            '<option value="">Gerekçe Seç</option>' +
            '<option value="baskaDurusma">Başka Duruşmalar</option>' +
            '<option value="arabuluculuk">Arabuluculuk</option>' +
            '<option value="ilDisi">İl Dışı</option>' +
            '<option value="saglik">Sağlık Sebebi</option>' +
          '</select>' +
        '</div>' +
        '<div class="uyap-btn-row">' +
          '<button id="uyap-metin-gir-btn">Metni Gir</button>' +
          '<button id="uyap-temizle-btn">Temizle</button>' +
        '</div>' +
        '<div id="uyap-status"></div>' +
      '</div>';
    return panel;
  }

  function metniYaz(sebepKey) {
    var statusEl = document.getElementById('uyap-status');
    if (!sebepKey || !METINLER[sebepKey]) {
      statusEl.textContent = 'Lütfen bir gerekçe seçin.';
      statusEl.className = 'uyap-status-warn';
      return;
    }
    statusEl.textContent = 'İşleniyor...';
    statusEl.className = '';

    if (sebepKey === 'ilDisi') {
      getCity(function(city) {
        var metin = METINLER.ilDisi.metin.replace('{IL}', city);
        var success = setTextareaValue(metin);
        if (success) {
          statusEl.textContent = 'Metin girildi! (' + city + ')';
          statusEl.className = 'uyap-status-ok';
        } else {
          statusEl.textContent = 'Textarea bulunamadi.';
          statusEl.className = 'uyap-status-err';
        }
      });
    } else {
      var metin = METINLER[sebepKey].metin;
      var success = setTextareaValue(metin);
      if (success) {
        statusEl.textContent = 'Metin girildi!';
        statusEl.className = 'uyap-status-ok';
      } else {
        statusEl.textContent = 'Textarea bulunamadi.';
        statusEl.className = 'uyap-status-err';
      }
    }
  }

  function injectPanel() {
    if (document.getElementById('uyap-ototext-panel')) return;
    var wrapper = document.querySelector('.dx-overlay-wrapper.edurusma');
    if (!wrapper) return;
    if (wrapper.classList.contains('dx-state-invisible')) return;
    var textarea = wrapper.querySelector('.e-durusma-text') || wrapper.querySelector('textarea');
    if (!textarea) return;

    var panel = createPanel();
    var labelRow = wrapper.querySelector('.col-md-12.control-label');
    if (labelRow && labelRow.parentElement) {
      labelRow.parentElement.insertBefore(panel, labelRow);
    } else {
      var popupContent = wrapper.querySelector('.dx-popup-content');
      if (popupContent) popupContent.insertBefore(panel, popupContent.firstChild);
    }

    document.getElementById('uyap-metin-gir-btn').addEventListener('click', function() {
      var select = document.getElementById('uyap-sebep-select');
      metniYaz(select.value);
    });

    document.getElementById('uyap-temizle-btn').addEventListener('click', function() {
      var statusEl = document.getElementById('uyap-status');
      var success = setTextareaValue('');
      if (success) {
        statusEl.textContent = 'Alan temizlendi.';
        statusEl.className = 'uyap-status-warn';
      }
    });
  }

  function removePanel() {
    var panel = document.getElementById('uyap-ototext-panel');
    if (panel) panel.remove();
  }

  function observeModal() {
    var observer = new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var mutation = mutations[i];
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          var target = mutation.target;
          if (target.classList && target.classList.contains('edurusma')) {
            if (!target.classList.contains('dx-state-invisible')) {
              setTimeout(injectPanel, 200);
            } else {
              setTimeout(removePanel, 100);
            }
          }
        }
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) {
              if ((node.classList && node.classList.contains('edurusma')) ||
                  (node.querySelector && node.querySelector('.edurusma'))) {
                setTimeout(injectPanel, 200);
              }
            }
          });
        }
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  }

  observeModal();
  setTimeout(injectPanel, 1000);

})();
