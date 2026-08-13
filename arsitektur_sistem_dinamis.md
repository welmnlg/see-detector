# Arsitektur & Metodologi Sistem Analisis Dinamis SEE

Dokumen ini merangkum secara komprehensif bagaimana sistem Analisis Dinamis (Dynamic Analysis) yang kita bangun bekerja. Sistem ini dirancang khusus untuk mendeteksi serangan *Stealth Extension Exfiltration* (SEE) pada ekstensi peramban (Chrome dan Edge) melalui observasi perilaku saat *runtime*.

---

## 1. Pemasangan dan Isolasi Ekstensi (The Sandbox)

Setiap ekstensi diuji di dalam lingkungan *sandbox* browser yang sangat terisolasi. 

**Apa yang terjadi pada ekstensi:**
1. **Unpacked Loading:** Ekstensi dimuat secara *sideload* dari direktori asalnya menggunakan *flag* `--disable-extensions-except=<path>` dan `--load-extension=<path>`.
2. **Isolasi Profil:** Untuk **setiap** pengujian, sistem membuat direktori `UserDataDir` (profil browser) sementara di folder `temp`. Hal ini memastikan bahwa tidak ada riwayat, cache, atau cookie yang terbawa dari pengujian ekstensi sebelumnya (mencegah kontaminasi silang).
3. **Dukungan Multi-Browser & Multi-Versi:** Sistem mengeksekusi ekstensi secara bergantian (atau paralel) pada *executable* peramban yang berbeda-beda. Misalnya, ekstensi akan diuji di Chrome Versi 114, Chrome Versi 126, Edge Versi 120, dll., yang lokasinya telah dikelola oleh `browser_version_manager.py`.

## 2. Pemantauan Trafik Jaringan (Network Interception)

Detak jantung dari sistem ini adalah kemampuannya "menguping" semua komunikasi keluar yang dilakukan oleh ekstensi. 

**Bagaimana kita melihat network traffic-nya?**
Kita menggunakan **Playwright**, sebuah *framework* otomatisasi browser yang berinteraksi langsung dengan *Chrome DevTools Protocol (CDP)*. 
- Sistem mengikat (bind) ke *event listener* `page.on('request')` dan `page.on('response')`.
- Ini memungkinkan kita untuk menangkap **setiap request HTTP/HTTPS**, termasuk URL, Method (GET/POST), Headers, Payload/Body (Post Data), dan tipe resource (fetch, xhr, script).
- **Diferensiasi Trafik:** Sistem melacak dari mana *request* tersebut berasal. Jika *request* berasal dari `chrome-extension://<id>`, atau *frame* eksekusinya adalah background script ekstensi, maka *request* tersebut ditandai sebagai `is_from_extension = True`.

## 3. Skenario & Umpan (Baiting the Malware)

Karena malware SEE biasanya pasif dan menunggu pengguna memasukkan data sensitif, sistem kita (bot) harus secara aktif memancing mereka.

**Apa yang dilakukan sistem di dalam halaman (Scenarios):**
*   **Honeypots (HTTP & HTTPS):** Mengunjungi halaman uji coba dan menanamkan (inject) elemen formulir palsu secara langsung ke dalam DOM (*Document Object Model*).
*   **Form Filling (FH Trigger):** Bot secara otomatis mengetik `username`, `email`, dan `password` spesifik yang disebut **Canary Data** (contoh: `canary_P@ssw0rd_Secret!`). Bot juga menekan tombol *Submit*. 
*   **Cookie Injection (CLE Trigger):** Menanamkan HTTP Cookie palsu (contoh: `session_token=ADMIN_SECRET_123_CANARY`) ke dalam sesi browser sebelum memuat halaman target, untuk memancing ekstensi pencuri cookie.
*   **Clipboard Copy-Paste (CE Trigger):** Memilih teks berisi *password* di layar dan mengeksekusi perintah DOM `document.execCommand('copy')` agar data masuk ke *clipboard*, memancing ekstensi yang mengawasi *clipboard*.
*   **High-Value Targets:** Bot juga mengunjungi situs nyata seperti Gmail, LinkedIn, Binance, dan Wikipedia, lalu melakukan interaksi standar seperti *scrolling* dan mengklik tautan secara acak (untuk memicu ekstensi *Ad Injector* atau *Session Hijacker*).

## 4. Mekanisme Deteksi (S1, S2, S3)

Setelah data jaringan terkumpul, bagaimana kita tahu ekstensi tersebut jahat?

> [!IMPORTANT]
> **Konsep Canary:** Canary adalah nilai string unik dan rahasia yang kita masukkan ke dalam peramban (misal: password palsu, cookie palsu). Jika string ini terdeteksi keluar dari browser menuju server eksternal, kita punya bukti kuat terjadinya eksfiltrasi (pencurian data).

Sistem memetakan deteksi ke dalam 3 skenario taksonomi SEE:

*   **S1 (Download Hijacking & Interception):** 
    - *Apa yang dideteksi:* Mengawasi jika ada unduhan tambahan yang diinisiasi oleh ekstensi secara diam-diam (misalnya, tiba-tiba mengunduh file `.exe` atau `.crx` lain di latar belakang).
*   **S2 (Data Theft - Cookie, Form, Clipboard):**
    - *Apa yang dideteksi:* Setiap parameter URL (GET) dan Body (POST) dari `is_from_extension = True` akan disaring. Jika kita menemukan teks *Canary* (misal string `canary_P@ssw0rd`) di dalam lalu lintas data yang mengarah ke luar, maka S2 **positif**.
*   **S3 (Traffic Redirection & Ad Injection):**
    - *Apa yang dideteksi:* Menganalisis *domain* tujuan *request* yang diprakarsai ekstensi. Jika ekstensi mengirim *request* atau melakukan *redirect* (kode HTTP 301/302) ke domain yang masuk daftar pantau (seperti server C2, analitik mencurigakan, atau domain iklan afiliasi), S3 **positif**.

## 5. Konkurensi & Skalabilitas (Multiprocessing)

Untuk mempercepat proses pengujian puluhan ekstensi di berbagai versi browser:
- Kita mengimplementasikan **ThreadPoolExecutor** dengan *worker* paralel (default: 6 worker).
- Setiap *worker* adalah sebuah proses independen OS (`multiprocessing.Process`) yang menjalankan instansiasi Playwright-nya sendiri, menempati port *debugging* sendiri, dan memiliki profil `UserDataDir` sendiri.
- Hal ini menjamin isolasi total: jika satu browser macet (*hang*) karena *malware*, *worker* lain tidak akan terpengaruh.
- Penulisan ke file rekap CSV dilindungi oleh `multiprocessing.Lock()` untuk mencegah korupsi file saat beberapa *worker* menyimpan hasil secara serentak.

## 6. Ruang Lingkup: Apa yang TIDAK Dilakukan Sistem Ini

Untuk memahami batasan sistem, berikut adalah hal-hal yang **tidak** dilakukan:

1. **Closed Sandbox (Pemutusan Jaringan):** Sistem ini adalah *Open Sandbox*. Ekstensi diizinkan untuk berbicara ke internet nyata (berbeda dengan analisis *offline* di mana semua *request* ke internet diblokir/disimulasikan). Hal ini diperlukan agar server *Command & Control (C2)* milik *malware* dapat merespons dan memerintahkan eksfiltrasi.
2. **Deobfuscation Memori Dinamis:** Jika ekstensi membongkar (*unpack*) kode berbahaya langsung di dalam memori V8 JavaScript Engine menggunakan `eval()`, sistem kita **tidak** mengekstraksi kode JavaScript tersebut. Kita hanya peduli pada *hasil akhir* (apakah data dicuri ke internet), bukan pada kode *runtime*-nya.
3. **Analisis Berjalan Selamanya (Endless Loop):** Beberapa *malware* menggunakan *timer* (tidur selama 3 hari sebelum aktif). Sistem kita menerapkan **Timeout ketat** (default 180 detik). Jika ekstensi sengaja bersembunyi lebih lama dari itu, perilakunya tidak akan tertangkap dalam sesi ini.
4. **Instalasi File Sistem OS:** Kita tidak memantau modifikasi pada level Sistem Operasi (misal jika ekstensi mengeksploitasi *zero-day* Chrome untuk menulis *malware* *ransomware* ke *Drive C:*). Fokus kita murni pada lapisan peramban (*Network, DOM, API*).
