# T-Soft Theme Devtools

Chrome DevTools eklentisi - T-Soft tema altyapısı için geliştirici paneli.

## Özellikler

- 🎨 **Global Değişkenler** - Tema global değişkenlerini görüntüleme
- 🧩 **Blok Değişkenleri** - Sayfa bloklarının değişkenlerini inceleme
- 🌐 **Dil Değişkenleri** - Çeviri anahtarları ve değerlerini görüntüleme
- 🔍 **Akıllı Arama** - Tüm değişkenlerde highlighting ile arama
- 📋 **Kolay Kopyalama** - Seçili metin veya tüm değeri kopyalama
- 🌓 **Dark/Light Tema** - Otomatik tema değiştirme
- 📦 **Accordion Gruplar** - Uzun listeleri katlanabilir gruplar halinde görüntüleme

## Kurulum

### Chrome Web Store'dan (Yayınlandıktan sonra)
1. Chrome Web Store'da eklentiyi arayın
2. "Add to Chrome" butonuna tıklayın

### Manuel Kurulum (Geliştirici Modu)
1. Bu repository'i klonlayın veya indirin
2. Chrome'da `chrome://extensions/` adresine gidin
3. Sağ üstten "Developer mode" (Geliştirici modu) aktif edin
4. "Load unpacked" (Paketlenmemiş yükle) butonuna tıklayın
5. Bu eklentinin klasörünü seçin

## Kullanım

1. Chrome DevTools'u açın (F12 veya Sağ tık > İncele)
2. DevTools'da "Theme Panel" sekmesine tıklayın
3. Değişkenleri görüntüleyin, arayın ve kopyalayın

### Önemli Not
Bu eklenti sadece `TSOFT_DEBUG_MODE` aktif olan sayfalarda çalışır. Mağaza sahipleri yönetici paneline giriş yapmalıdır.

## Teknik Detaylar

- **Manifest Version:** 3
- **Permissions:** clipboardWrite
- **Browser Support:** Chrome, Edge, Brave ve diğer Chromium tabanlı tarayıcılar

## Chrome Web Store'a Yükleme

Bu eklenti Chrome Web Store'a yüklenmeye hazırdır:
- ✅ Manifest v3 uyumlu
- ✅ Güvenlik politikalarına uygun
- ✅ Console warnings giderildi
- ✅ Clipboard API fallback ile destekleniyor

## Geliştirici Notları

### Clipboard API
DevTools context'inde Clipboard API'nin bazı kısıtlamaları vardır. Bu eklenti otomatik olarak fallback mekanizması (`document.execCommand`) kullanır.

### Test Etme
1. Eklentiyi yükleyin
2. `TSOFT_DEBUG_MODE` aktif bir sayfayı açın
3. DevTools > Theme Panel'i test edin

## Lisans

Özel kullanım - T-Soft için geliştirilmiştir.

