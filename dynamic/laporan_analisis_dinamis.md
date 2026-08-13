# Laporan Komprehensif Analisis Dinamis Ekstensi Browser

**Generated:** 2026-07-28T10:57:39.462404

## 1. Ringkasan Global

| Metrik | Nilai |
|--------|-------|
| Total Ekstensi Diuji | 96 |
| Total Sesi Pengujian | 290 |
| SEE Terdeteksi (sesi) | 280 |
| Error/Timeout | 10 |
| Terdeteksi di SEMUA Versi | 89 |
| Terdeteksi di SEBAGIAN Versi | 7 |
| S1 Download Hijack | 0 ekstensi |
| S2 Cookie Theft | 0 ekstensi |
| S3 Traffic Redirect | 30 ekstensi |
| POST ke Domain External | 8 ekstensi |

## 2. Skenario Pengujian

Setiap ekstensi diuji pada **3 versi browser** (Chrome 149, 150, 151) dengan skenario:

| Skenario | Deskripsi | Situs yang Dikunjungi |
|----------|-----------|----------------------|
| S1: Download Hijack | Menguji apakah ekstensi mencegat/mengganti file unduhan | LinkedIn, Facebook, TikTok, Gmail, Chocoffee, Herokuapp |
| S2: Cookie Theft | Menguji apakah ekstensi mencuri cookie/sesi login | LinkedIn, Facebook, TikTok, Gmail, Chocoffee, Herokuapp |
| S3: Traffic Redirect | Menguji apakah ekstensi mengalihkan lalu lintas | LinkedIn, Facebook, TikTok, Gmail, Chocoffee, Herokuapp |

## 3. Domain Eksternal yang Dihubungi Ekstensi

Domain berikut dihubungi secara diam-diam oleh ekstensi (melalui Service Worker/Content Script) dan **bukan** bagian dari situs skenario pengujian:

| # | Domain | Jumlah Ekstensi |
|---|--------|-----------------|
| 1 | `constants.opt-api.com` | 8 |
| 2 | `exchange.exodus.io` | 3 |
| 3 | `api.segment.io` | 3 |
| 4 | `remote-config.exodus.io` | 3 |
| 5 | `contacts.google.com` | 3 |
| 6 | `mcs-va.tiktokv.com` | 3 |
| 7 | `starling-sg.tiktokv.com` | 3 |
| 8 | `mcs-sg.tiktokv.com` | 3 |
| 9 | `assets.terra.dev` | 3 |
| 10 | `lnkd.demdex.net` | 3 |
| 11 | `mon-sg.tiktokv.com` | 3 |
| 12 | `scontent.fkno4-2.fna.fbcdn.net` | 3 |
| 13 | `trkn.us` | 3 |
| 14 | `ogs.google.com` | 3 |
| 15 | `mon.tiktokv.com` | 3 |
| 16 | `p16-common-sign.tiktokcdn.com` | 3 |
| 17 | `scontent.fkno4-1.fna.fbcdn.net` | 3 |
| 18 | `api.blocksi.net` | 3 |
| 19 | `kra18.com` | 3 |
| 20 | `gtmserver.waleads.com.br` | 3 |
| 21 | `list.hijshihij.org` | 3 |
| 22 | `link.linkshilink.org` | 3 |
| 23 | `list.bcdshibcd.org` | 3 |
| 24 | `list.ghishighi.org` | 3 |
| 25 | `list.abcshiabc.org` | 3 |
| 26 | `list.defshidef.org` | 3 |
| 27 | `api.trongrid.io` | 3 |
| 28 | `list.cdeshicde.org` | 3 |
| 29 | `list.fghshifgh.org` | 3 |
| 30 | `list.tronlink.org` | 3 |

## 4. Ekstensi yang Mengirim POST Data ke Server Eksternal

Berikut adalah ekstensi yang **terbukti mengirimkan data (POST)** ke domain di luar skenario pengujian:

### Ekstensi: `aholpfdialjgjfhomihkjbmgjidlcdno` (__MSG_appName__)
- **Browser:** Chrome 149
- **Domain Tujuan:** `api.segment.io`
- **URL:** `https://api.segment.io/v1/track`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"anonymousId":"1c015cf7-a2f2-4392-9c83-eadef9609b67","userId":null,"event":"OnboardingView","properties":{"number_of_assets_enabled":0,"app_platform":"browser","app_version":"26.6.25","app_build":"prod","has_balance":false,"selected_language":"en","app_id":"exodus","os_name":"win","device_model":"x86-64","locale":["en-US","en"],"experiments":[],"asset_exchanged_last_90":false},"timestamp":"Mon, 27 Jul 2026 08:55:42 GMT"}
```

### Ekstensi: `aholpfdialjgjfhomihkjbmgjidlcdno` (__MSG_appName__)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.segment.io`
- **URL:** `https://api.segment.io/v1/track`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"anonymousId":"c383d25a-7ada-4bf9-95f1-045d5a533b5b","userId":null,"event":"OnboardingView","properties":{"number_of_assets_enabled":0,"app_platform":"browser","app_version":"26.6.25","app_build":"prod","has_balance":false,"selected_language":"en","app_id":"exodus","os_name":"win","device_model":"x86-64","locale":["en-US","en"],"experiments":[],"asset_exchanged_last_90":false},"timestamp":"Mon, 27 Jul 2026 08:55:42 GMT"}
```

### Ekstensi: `aholpfdialjgjfhomihkjbmgjidlcdno` (__MSG_appName__)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.segment.io`
- **URL:** `https://api.segment.io/v1/track`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"anonymousId":"e76d38a0-fa1c-474f-af5d-9b2412fdc94f","userId":null,"event":"OnboardingView","properties":{"number_of_assets_enabled":0,"app_platform":"browser","app_version":"26.6.25","app_build":"prod","has_balance":false,"selected_language":"en","app_id":"exodus","os_name":"win","device_model":"x86-64","locale":["en-US","en"],"experiments":[],"asset_exchanged_last_90":false},"timestamp":"Mon, 27 Jul 2026 08:55:42 GMT"}
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `lnkd.demdex.net`
- **URL:** `https://lnkd.demdex.net/event?d_dil_ver=9.4&_ts=1785142564418`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
d_mid=90077121775993806112115099951483039736&d_nsid=0&d_cid_ic=lnkdidsync%01ASpva964bzZE1X-xhNpOO-upwfYn%26v%3D2%011&d_cid_ic=thirdpartyid%01ASpva964bzZE1X-xhNpOO-upwfYn%26v%3D2%011&d_cid_ic=lnkd_member_id%01ASpva964bzZE1X-xhNpOO-upwfYn%26v%3D2%011&d_ld=_ts%3D1785142564418&d_rtbd=json&d_jsonv=1&d_dst=1&c_page_name=%2Ffeed%2F&c_page_key=d_flagship3_feed&h_referer=https%3A%2F%2Fwww.linkedin.com%2Ffeed%2F
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_init","params":"{\"status\":\"FINISH\",\"event_index\":1785143096769}","local_time_ms":1785142598277,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"},{"event":"pns_communication_service_init","params":"{\"status\":\"START\",\"event_index\":1785143096768}","local_time_ms":1785142598275,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"feed_top_cache","params":"{\"time_from_origin\":1515,\"valid\":9,\"event_index\":1785143096767}","local_time_ms":1785142598152,"is_bav":1,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"},{"event":"request_device_score_time","params":"{\"time_from_origin\":1500,\"duration\":1,\"type\":\"total\",\"page_name\":\"homepage_hot\",\"event_index\":1785143096766}","local_time_ms":1785142598152,"is_bav":1,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"},{"event":"arm_render_f
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_execute","params":"{\"status\":\"IN_PROGRESS\",\"stepName\":\"LOAD_DATA_START\",\"event_index\":1785143096772}","local_time_ms":1785142598339,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"},{"event":"pns_communication_service_execute","params":"{\"status\":\"START\",\"event_index\":1785143096771}","local_time_ms":1785142598339,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"},{"event":"predefine_pageview","params":"{\"
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"portrait_hub_init","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":1944,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,7589959
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_execute","params":"{\"status\":\"FINISH\",\"event_index\":1785143096780}","local_time_ms":1785142598678,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"},{"event":"pns_communication_service_execute","params":"{\"status\":\"IN_PROGRESS\",\"stepName\":\"LOAD_DATA_FINISH\",\"event_index\":1785143096779}","local_time_ms":1785142598678,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"}],"user":{"user_unique_id":"76619538356232
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":2183,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_pageview","params":"{\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"url_path\":\"/\",\"time\":1785142598892,\"referrer\":\"https://www.tiktok.com/\",\"$is_first_time\":\"false\",\"event_index\":1785143096785}","local_time_ms":1785142598892,"is_bav":0,"session_id":"7b8c4ac6-d8f9-45f3-9904-254dd4ef0038"}],"user":{"user_unique_id":"7661964440841831944","web_id":"7661964440841831944"},"header":{"app_id":594856,"os_name":"windows","os_versio
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"slardar_perf_ttfb","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":2447,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,7589959
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"first_screen_video","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":2758,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,758995
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"video_play","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":3129,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76030
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=cdn_replace_service_worker`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"ttapplugin_info","type":"event","metrics":{"registerDuration":10,"navigationStartTime":1785142596629,"appParseStart":1297},"categories":{"version":"2.0.0"}},"common":{"bid":"cdn_replace_service_worker","user_id":"cb6e4957-7a1a-4b37-a481-044660c7315d","device_id":"9bde90ea-9794-4e3d-85d3-cd0403e42c73","session_id":"a95d5ad2-5630-40b2-b9f0-adcf8fe3fd68","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":1785
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":3875,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":4000,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"video_receive","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":4357,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"cookie_banner_cdn_load","params":"{\"page_url\":\"https://www.tiktok.com/\",\"host\":\"www.tiktok.com\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"referrer\":\"https://www.tiktok.com/\",\"loader_version\":\"1.0.5\",\"resource_url\":\"https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/pns/tiktok-cookie-banner/1.0.0.285/default.esm.js\",\"event_index\":178514309
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":4658,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=pns_communication_service`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"resource_error","payload":{"type":"script","url":"https://sf16-website-login.neutral.ttwstatic.com/slardar/fe/sdk-web/plugins/common-monitors.1.16.7.js","timing":{"name":"https://sf16-website-login.neutral.ttwstatic.com/slardar/fe/sdk-web/plugins/common-monitors.1.16.7.js","entryType":"resource","startTime":2422.5,"duration":328.0999999999767,"initiatorType":"script","deliveryType":"","nextHopProtocol":"h2","renderBlockingStatus":"non-blocking","contentType
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"onload","params":"{\"app_id\":1992,\"app_name\":\"\",\"sdk_version\":\"5.3.17\",\"sdk_type\":\"npm\",\"sdk_config\":{\"app_id\":1992,\"channel\":\"va\",\"channel_type\":\"tcpy\",\"log\":false,\"disable_auto_pv\":true,\"disable_webid\":true},\"sdk_desc\":\"TOC_OVERSEA\",\"url\":\"https://www.tiktok.com/\",\"is_setting\":false,\"enable_logsetting_params\":false,\"enable_logsetting_header_custom\":false}","local_time_ms":1785142601403}],"user":{"user_unique_id":"76619538356232
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"cookie_banner_load","params":"{\"locale\":\"en\",\"region\":\"ID\",\"js_version\":\"1.0.0.285\",\"tenant_id\":\"paas_tiktok\",\"page_url\":\"https://www.tiktok.com/\",\"host\":\"www.tiktok.com\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"referrer\":\"https://www.tiktok.com/\",\"event_index\":1785142936231}","local_time_ms":1785142601714,"is_bav":0,"session_id":"1698e3b8-4ecc-42ea-9722-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"consent_init_sdk","params":"{\"status\":\"FINISH\",\"event_index\":1785143237357}","local_time_ms":1785142601726,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"},{"event":"consent_init_sdk","params":"{\"status\":\"START\",\"event_index\":1785143237356}","local_time_ms":1785142601725,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header":{"app_id":1988,"os_name":"
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"tt_ticket_guard_web_get_storage","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_platform\":\"web\",\"init_type\":\"pubKey\",\"sign_type\":\"pubKey\",\"params_for_special\":\"tiktok_account_login\",\"key\":\"s_sdk_crypt_sdk,s_sdk_cert_key,s_sdk_sign_data_key/tt_fetch\",\"storage_type\":\"local\",\"duration\":251,\"event_index\":1785143096845}","local_time_ms":1785142601651,"is_bav":0,"session_id":"4d27b5ae-d73a-4b6e-998d-70c2f7abd286"}],"user":{"user_unique
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"web_weekly_screen_time_update_status","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5033,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,758783
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5370,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=cdn_replace_service_worker`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"swRegister","type":"event","metrics":{"count":1},"categories":{"host":"www.tiktok.com"}},"common":{"bid":"cdn_replace_service_worker","user_id":"cb6e4957-7a1a-4b37-a481-044660c7315d","device_id":"9bde90ea-9794-4e3d-85d3-cd0403e42c73","session_id":"a95d5ad2-5630-40b2-b9f0-adcf8fe3fd68","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":1785142601131,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5656,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5815,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":6663,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=ucenter_tiktok_zti_sdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"tt_ticket_guard_sdk_init","type":"event","categories":{"success":"success","region":"va","remote":"false"}},"common":{"bid":"ucenter_tiktok_zti_sdk","user_id":"7661953835623237138","device_id":"05aff4e2-df93-4f91-84cf-b22d572af18b","session_id":"1a5d85b6-ba06-45f6-9095-cbddcfd5cb84","release":"","env":"online","url":"https://www.tiktok.com/","timestamp":1785142601394,"sdk_version":"1.12.4","sdk_name":"SDK_SLARDAR_WEB","pid":"www.t
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp_vmok`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"remote_load_start","type":"event","categories":{"commit_hash":"dynamic"}},"common":{"bid":"tiktok_webapp_vmok","user_id":"2742326d-97fb-4d8f-a15b-fb2fcc05e074","device_id":"c9017e33-2532-44a9-a83b-e25a3f447ec4","session_id":"7e9259df-3997-4186-9e07-3b6b1168c440","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":1785142602916,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"","view_id":"_17851426
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"content":"live_sdk_api_live_feed-TypeError-Cannot read properties of undefined (reading 'data')","type":"log","level":"error"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"76db9f84-f2c8-4200-bd69-0439c1f9f3b0","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142601107,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=pns_cookie_banner_slardar`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"pns_cuj","type":"event","metrics":{"timestamp":5083.800000000047,"duration":0},"categories":{"status":"START","name":"load_cookie_banner","stepName":"FINISH","error":"","detail":"","appId":"1988","appVersion":"1.0.0.285","tenant":"paas_tiktok"}},"common":{"bid":"pns_cookie_banner_slardar","user_id":"410fe6c4-c2ac-4dff-9036-5997e76a42f6","device_id":"b6953e27-0a48-4d8c-bc2f-9f9c2eecb814","session_id":"0ad43a7e-c30d-4e4a-b069-f7d1b3
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_page_alive","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"url_path\":\"/\",\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"duration\":8016,\"is_support_visibility_change\":1,\"startTime\":1785142598133,\"hidden\":\"visible\",\"leave\":true,\"mode\":\"normal\",\"focusState\":true,\"event_index\":1785143096864}","local_time_ms":1785142606149,"is_bav":1,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"}],"use
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_page_close","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"url_path\":\"/\",\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"active_times\":1,\"duration\":8021,\"total_duration\":8021,\"is_support_visibility_change\":1,\"mode\":\"normal\",\"focusState\":true,\"event_index\":1785143096865}","local_time_ms":1785142606154,"is_bav":1,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"}],"user":{"user_unique_id":"7
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"lcp","value":2404,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf","extra":{"element":"div.css-16s6atg-7937d88b--Box.etuqjjj0 > span > picture > img[alt=\"kenapa yak 🥱=>🥺 #jjmykisah😹🤭🤭 #jjelistis #jjwiner🤭 #relateable #jjmykisah #trending #xybca #forreal #fyp #jjluser #jjconfident #foryoupage\"]"}},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-45
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"inp","value":0,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"76db9f84-f2c8-4200-bd69-0439c1f9f3b0","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142606160,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"ho
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"cls","value":0.010673922786006219,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf","extra":{"element":"#one-column-item-0 > div.css-1gp40pd-7937d88b--DivContentFlexLayout.ehcbpkw2 > #media-card-0 > div.css-bfblgq-7937d88b--BasePlayerContainer-7937d88b--DivVideoPlayerContainer.e1gen9l33 > div.css-3rm8q2-7937d88b--DivMediaCardOverlay.e1vama6v0"}},"common":{"bid":"tiktok_webapp","user_id":"766
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"videoplayer_oneplay","params":"{\"local_time\":1785142606166,\"player_sessionid\":\"349eb318-7b13-4b9d-ab15-44616d8f9974\",\"sdk_version\":\"0.4.8\",\"pc\":\"0.4.8\",\"pv\":\"0.4.8\",\"sv\":\"0.4.8\",\"line_app_id\":1988,\"line_user_id\":\"7661953835623237138\",\"app_version\":\"\",\"platform\":\"pc\",\"cpu_core\":12,\"memory_size\":16,\"support\":11100,\"absdkVersion\":\",70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76030701,76035889,76055827,760
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"__bav_beat","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"beat_type\":0,\"page_key\":\"https://www.tiktok.com/\",\"is_html\":1,\"page_title\":\"TikTok - Make Your Day\",\"page_manual_key\":\"\",\"page_viewport_width\":1280,\"page_viewport_height\":720,\"page_total_width\":1280,\"page_total_height\":720,\"scroll_width\":1280,\"scroll_height\":720,\"since_page_start_ms\":9544,\"page_start_ms\":1785142596629,\"event_index\":1785143096871}","local_
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"close_window","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":9541,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,760
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=ucenter_tiktok_zti_sdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"tt_ticket_guard_web_get_storage","type":"event","metrics":{"duration":10},"categories":{"key":"s_sdk_crypt_sdk,s_sdk_cert_key,s_sdk_sign_data_key/tt_fetch","storage_type":"local"}},"common":{"bid":"ucenter_tiktok_zti_sdk","user_id":"7661953835623237138","device_id":"05aff4e2-df93-4f91-84cf-b22d572af18b","session_id":"1a5d85b6-ba06-45f6-9095-cbddcfd5cb84","release":"","env":"online","url":"https://www.tiktok.com/","timestamp":17851
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":9658,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=ucenter_tiktok_zti_sdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"content":"Get Keys Info Success","type":"log","level":"info","metrics":{},"categories":{"signVersion":"0","cookieCrypt":"0","isTopBrowser":"1","webDomain":"3","webClientDomain":"3","server_data":"{\"ts_sign\":\"ts.1.d47de6fff17f7c6f92afeb51f488f60a029ae19cb0a6eaea590b90814afdee560e70b4bda82c13836e5cfa18394d70240f8af1631f165ae960122eeffd4533dd\",\"encrypt_ticket\":\"lYFvXqQtnfSxQsg5r+zIGl5nenneWlX2seLdTuUbqJklmlJ1tnIhedqpf9BJ5rgaDbu/CQ0pC
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=ucenter_tiktok_zti_sdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"tt_ticket_guard_web_sign","type":"event","metrics":{"duration":1},"categories":{"type":"crypto"}},"common":{"bid":"ucenter_tiktok_zti_sdk","user_id":"7661953835623237138","device_id":"05aff4e2-df93-4f91-84cf-b22d572af18b","session_id":"1a5d85b6-ba06-45f6-9095-cbddcfd5cb84","release":"","env":"online","url":"https://www.tiktok.com/","timestamp":1785142606329,"sdk_version":"1.12.4","sdk_name":"SDK_SLARDAR_WEB","pid":"www.tiktok.com"
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=ucenter_tiktok_zti_sdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"content":"sign data success","type":"log","level":"info","metrics":{},"categories":{"signVersion":"0","cookieCrypt":"0","isTopBrowser":"1","webDomain":"3","webClientDomain":"3","content":"{\"ts_sign\":\"ts.1.d47de6fff17f7c6f92afeb51f488f60a029ae19cb0a6eaea590b90814afdee560e70b4bda82c13836e5cfa18394d70240f8af1631f165ae960122eeffd4533dd\",\"req_content\":\"ticket,path,timestamp\",\"req_sign\":\"MEUCIQCeac0M2XuVJXhXzFo1K67othSj2l1KvtMBG9J3c
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=ucenter_tiktok_zti_sdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"content":"set cache data success","type":"log","level":"info","metrics":{},"categories":{"signVersion":"0","cookieCrypt":"0","isTopBrowser":"1","webDomain":"3","webClientDomain":"3","content":"eyJ0c19zaWduIjoidHMuMS5kNDdkZTZmZmYxN2Y3YzZmOTJhZmViNTFmNDg4ZjYwYTAyOWFlMTljYjBhNmVhZWE1OTBiOTA4MTRhZmRlZTU2MGU3MGI0YmRhODJjMTM4MzZlNWNmYTE4Mzk0ZDcwMjQwZjhhZjE2MzFmMTY1YWU5NjAxMjJlZWZmZDQ1MzNkZCIsInJlcV9jb250ZW50IjoidGlja2V0LHBhdGgsdGltZXN0YW1wIiwi
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=ucenter_tiktok_zti_sdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"content":"process request config ","type":"log","level":"info","metrics":{"time":1785142606334},"categories":{"signVersion":"0","cookieCrypt":"0","isTopBrowser":"1","webDomain":"3","webClientDomain":"3","content":"{\"method\":\"GET\",\"url\":\"https://www.tiktok.com/passport/web/account/info/?WebIdLastTime=1783937646&aid=1459&app_language=en&app_name=tiktok_web&browser_language=en-US&browser_name=Mozilla&browser_online=true&browser_platf
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=ucenter_tiktok_zti_sdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"execute_request_sign","type":"event","metrics":{"count":1,"duration":45,"startTime":0,"endTime":0,"loadTime":0},"categories":{"status":"success","login":"1","cache":"0","path":"/passport/web/account/info/","cert":"0","pubKey":"1","isPubKeySign":"1","isPubKeyInit":"1","csr":"0","version":"2","server":"1","crossStatus":"0","initMatch":"0","dataFrom":"1","match_md5_local":"-99","match_md5_iframe":"-99","lost":"0","isNewCert":"0","isC
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"tt_ticket_guard_web_sign","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_platform\":\"web\",\"init_type\":\"pubKey\",\"sign_type\":\"pubKey\",\"params_for_special\":\"tiktok_account_login\",\"type\":\"crypto\",\"duration\":1,\"event_index\":1785143096874}","local_time_ms":1785142606330,"is_bav":0,"session_id":"4d27b5ae-d73a-4b6e-998d-70c2f7abd286"},{"event":"tt_ticket_guard_web_get_storage","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_p
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=ucenter_tiktok_zti_sdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"execute_response_init","type":"event","metrics":{"count":1,"duration":0,"startTime":0,"endTime":0,"loadTime":0},"categories":{"status":"success","login":"1","url":"/passport/web/account/info/","crossStatus":"0","lost":"0","verify":"-99","dataFrom":"1","match_md5_local":"-99","match_md5_iframe":"-99","server":"0","client":"1","isConnection":"-99","retryCount":"-99","initMatch":"0","isNewCert":"0","isPubkeyTssign":"1","isPubKeyInit"
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=ucenter_tiktok_zti_sdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"tt_ticket_guard_web_full_path","type":"event","metrics":{"process_response_duration":0,"process_request_duration":45,"init_pair_key_duration":35,"sign_data_duration":8,"rest_request_duration":2},"categories":{"ticket":"e3c3421e442814e1df756aee4ea7f606db61b5639cf7fc423aade685a8c4045a","ts_sign":"ts.1.d47de6fff17f7c6f92afeb51f488f60a029ae19cb0a6eaea590b90814afdee560e70b4bda82c13836e5cfa18394d70240f8af1631f165ae960122eeffd4533dd","pa
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=ucenter_tiktok_zti_sdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"tt_ticket_guard_web_performance","type":"event","metrics":{"process_request_duration":45,"process_response_duration":0,"sign_data_duration":8,"init_pair_key_duration":35,"rest_request_duration":2},"categories":{"type":"crypto","sign_type":"pubKey","store_type":"local","path":"https://www.tiktok.com/passport/web/account/info/?WebIdLastTime=1783937646&aid=1459&app_language=en&app_name=tiktok_web&browser_language=en-US&browser_name=M
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"tt_ticket_guard_web_performance","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_platform\":\"web\",\"init_type\":\"pubKey\",\"sign_type\":\"pubKey\",\"params_for_special\":\"tiktok_account_login\",\"type\":\"crypto\",\"store_type\":\"local\",\"path\":\"https://www.tiktok.com/passport/web/account/info/?WebIdLastTime=1783937646&aid=1459&app_language=en&app_name=tiktok_web&browser_language=en-US&browser_name=Mozilla&browser_online=true&browser_platform=Win32&
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-YGXDvetpjs7SdCXq3FXMxg' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-YGXDvetpjs7SdCXq3FXMxg' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-pckLCF61rn3AM7eUhyH0bQ' 'unsafe-inline';object-src 'none';base-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-pckLCF61rn3AM7eUhyH0bQ' 'unsafe-inline';object-src 'none';base-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `lnkd.demdex.net`
- **URL:** `https://lnkd.demdex.net/event?d_dil_ver=9.4&_ts=1785142678887`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
d_mid=90077121775993806112115099951483039736&d_nsid=0&d_cid_ic=lnkdidsync%01ASpva964bzZE1X-xhNpOO-upwfYn%26v%3D2%011&d_cid_ic=thirdpartyid%01ASpva964bzZE1X-xhNpOO-upwfYn%26v%3D2%011&d_cid_ic=lnkd_member_id%01ASpva964bzZE1X-xhNpOO-upwfYn%26v%3D2%011&d_ld=_ts%3D1785142678887&d_rtbd=json&d_jsonv=1&d_dst=1&c_page_name=%2Ffeed%2F&c_page_key=d_flagship3_feed&h_referer=https%3A%2F%2Fwww.linkedin.com%2Ffeed%2F
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"__bav_page","params":"{\"is_html\":1,\"url\":\"https://www.tiktok.com/\",\"referrer\":\"\",\"page_key\":\"https://www.tiktok.com/\",\"refer_page_key\":\"\",\"page_title\":\"TikTok - Make Your Day\",\"page_manual_key\":\"\",\"refer_page_manual_key\":\"\",\"refer_page_title\":\"TikTok - Make Your Day\",\"page_path\":\"/\",\"page_host\":\"www.tiktok.com\",\"is_first_time\":\"false\",\"is_back\":0,\"page_total_width\":1280,\"page_total_height\":720,\"refer_page_duration_ms\":80
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_init","params":"{\"status\":\"FINISH\",\"event_index\":1785142729254}","local_time_ms":1785142705090,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"},{"event":"pns_communication_service_init","params":"{\"status\":\"START\",\"event_index\":1785142729253}","local_time_ms":1785142705089,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"feed_top_cache","params":"{\"time_from_origin\":1265,\"valid\":9,\"event_index\":1785142729252}","local_time_ms":1785142705015,"is_bav":1,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"},{"event":"recommend_empty_play_addr_item","params":"{\"time_from_origin\":1263,\"count\":1,\"item_list_key\":\"foryou\",\"page_name\":\"\",\"response_count\":3,\"remain_count\":2,\"event_index\":1785142729251}","local_time_ms":1785142705015,"is_bav":1,"session_id":"b8f5ecd0-6891-4644-ab
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_pageview","params":"{\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"url_path\":\"/\",\"time\":1785142705115,\"referrer\":\"\",\"$is_first_time\":\"false\",\"event_index\":1785142729255}","local_time_ms":1785142705115,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header":{"app_id":1988,"os_name":"windows","os_version":"10","device_model":"W
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_execute","params":"{\"status\":\"IN_PROGRESS\",\"stepName\":\"LOAD_DATA_START\",\"event_index\":1785142729263}","local_time_ms":1785142705259,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"},{"event":"pns_communication_service_execute","params":"{\"status\":\"START\",\"event_index\":1785142729262}","local_time_ms":1785142705259,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"}],"user":{"user_unique_id":"7661953835623237
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"video_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":1709,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,73720540,75843653,76055827,76124481,76146380,76314875,76378881,76
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_execute","params":"{\"status\":\"FINISH\",\"event_index\":1785142729269}","local_time_ms":1785142705513,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"},{"event":"pns_communication_service_execute","params":"{\"status\":\"IN_PROGRESS\",\"stepName\":\"LOAD_DATA_FINISH\",\"event_index\":1785142729268}","local_time_ms":1785142705511,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"}],"user":{"user_unique_id":"76619538356232
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"video_play","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":2279,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,73720540,75843653,76055827,76124481,76146380,76314875,76378881,76388
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":2404,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,73720540,75843653,76055827,76124481,76146380,76314875,76378881,7638
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=cdn_replace_service_worker`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"swRegister","type":"event","metrics":{"count":1},"categories":{"host":"www.tiktok.com"}},"common":{"bid":"cdn_replace_service_worker","user_id":"cb6e4957-7a1a-4b37-a481-044660c7315d","device_id":"9bde90ea-9794-4e3d-85d3-cd0403e42c73","session_id":"5fe67df6-563a-4967-b599-4541caeffb30","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":1785142705445,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"pageview","payload":{"pid":"homepage_hot","source":"init"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"a287582a-7aa3-45a5-bc00-59c6fa546dde","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142704983,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"homepage_hot","view_id":"homepage_hot_1785142705436","context":{"region":"ID
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":4338,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,73720540,75843653,76055827,76124481,76146380,76314875,76378881,7638
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"cookie_banner_cdn_load","params":"{\"page_url\":\"https://www.tiktok.com/\",\"host\":\"www.tiktok.com\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"referrer\":\"https://www.tiktok.com/\",\"loader_version\":\"1.0.5\",\"resource_url\":\"https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/pns/tiktok-cookie-banner/1.0.0.285/default.esm.js\",\"event_index\":178514272
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"cookie_banner_load","params":"{\"locale\":\"en\",\"region\":\"ID\",\"js_version\":\"1.0.0.285\",\"tenant_id\":\"paas_tiktok\",\"page_url\":\"https://www.tiktok.com/\",\"host\":\"www.tiktok.com\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"referrer\":\"https://www.tiktok.com/\",\"event_index\":1785143449811}","local_time_ms":1785142708687,"is_bav":0,"session_id":"1698e3b8-4ecc-42ea-9722-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"consent_init_sdk","params":"{\"status\":\"FINISH\",\"event_index\":1785143651694}","local_time_ms":1785142708704,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"},{"event":"consent_init_sdk","params":"{\"status\":\"START\",\"event_index\":1785143651693}","local_time_ms":1785142708701,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header":{"app_id":1988,"os_name":"
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":4859,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,73720540,75843653,76055827,76124481,76146380,76314875,76378881,7638
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"load_more","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5064,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,73720540,75843653,76055827,76124481,76146380,76314875,76378881,763883
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5602,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,73720540,75843653,76055827,76124481,76146380,76314875,76378881,7638
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"slardar_perf_ttfb","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5733,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,73720540,75843653,76055827,76124481,76146380,76314875,7637888
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5975,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,73720540,75843653,76055827,76124481,76146380,76314875,76378881,7638
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=pns_communication_service`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"resource_error","payload":{"type":"script","url":"https://sf16-website-login.neutral.ttwstatic.com/slardar/fe/sdk-web/plugins/common-monitors.1.16.7.js","timing":{"name":"https://sf16-website-login.neutral.ttwstatic.com/slardar/fe/sdk-web/plugins/common-monitors.1.16.7.js","entryType":"resource","startTime":5695.300000000047,"duration":30.199999999953434,"initiatorType":"script","deliveryType":"cache","nextHopProtocol":"h2","renderBlockingStatus":"non-block
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=pns_cookie_banner_slardar`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"pns_cuj","type":"event","metrics":{"timestamp":4939.900000000023,"duration":0},"categories":{"status":"START","name":"load_cookie_banner","stepName":"FINISH","error":"","detail":"","appId":"1988","appVersion":"1.0.0.285","tenant":"paas_tiktok"}},"common":{"bid":"pns_cookie_banner_slardar","user_id":"410fe6c4-c2ac-4dff-9036-5997e76a42f6","device_id":"b6953e27-0a48-4d8c-bc2f-9f9c2eecb814","session_id":"cd609b08-a37b-4674-9906-671ef8
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"login_notify","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":7548,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,73720540,75843653,76055827,76124481,76146380,76314875,76378881,763
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"fp","value":1416,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"a287582a-7aa3-45a5-bc00-59c6fa546dde","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142709454,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp_vmok`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"remote_load_start","type":"event","categories":{"commit_hash":"dynamic"}},"common":{"bid":"tiktok_webapp_vmok","user_id":"2742326d-97fb-4d8f-a15b-fb2fcc05e074","device_id":"c9017e33-2532-44a9-a83b-e25a3f447ec4","session_id":"e1b206fb-cd75-487a-9e07-49f2c2591371","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":1785142710659,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"","view_id":"_17851427
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"mdl_video_preload","params":"{\"sdk_version\":\"0.4.8\",\"pc\":\"0.4.8\",\"pv\":\"0.4.8\",\"sv\":\"0.4.8\",\"line_app_id\":1988,\"line_user_id\":\"7661953835623237138\",\"app_version\":\"\",\"platform\":\"pc\",\"cpu_core\":12,\"memory_size\":16,\"support\":11100,\"absdkVersion\":\",70508271,73720540,75843653,76055827,76124481,76146380,76314875,76378881,76388334,76403724,76403729,76424652,76432884,76463666,76463851,76484019,76519478,76552286,76557027,76600398,76604746,766124
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"mdl_video_preload","params":"{\"sdk_version\":\"0.4.8\",\"pc\":\"0.4.8\",\"pv\":\"0.4.8\",\"sv\":\"0.4.8\",\"line_app_id\":1988,\"line_user_id\":\"7661953835623237138\",\"app_version\":\"\",\"platform\":\"pc\",\"cpu_core\":12,\"memory_size\":16,\"support\":11100,\"absdkVersion\":\",70508271,73720540,75843653,76055827,76124481,76146380,76314875,76378881,76388334,76403724,76403729,76424652,76432884,76463666,76463851,76484019,76519478,76552286,76557027,76600398,76604746,766124
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"mdl_video_preload","params":"{\"sdk_version\":\"0.4.8\",\"pc\":\"0.4.8\",\"pv\":\"0.4.8\",\"sv\":\"0.4.8\",\"line_app_id\":1988,\"line_user_id\":\"7661953835623237138\",\"app_version\":\"\",\"platform\":\"pc\",\"cpu_core\":12,\"memory_size\":16,\"support\":11100,\"absdkVersion\":\",70508271,73720540,75843653,76055827,76124481,76146380,76314875,76378881,76388334,76403724,76403729,76424652,76432884,76463666,76463851,76484019,76519478,76552286,76557027,76600398,76604746,766124
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"mdl_video_preload","params":"{\"sdk_version\":\"0.4.8\",\"pc\":\"0.4.8\",\"pv\":\"0.4.8\",\"sv\":\"0.4.8\",\"line_app_id\":1988,\"line_user_id\":\"7661953835623237138\",\"app_version\":\"\",\"platform\":\"pc\",\"cpu_core\":12,\"memory_size\":16,\"support\":11100,\"absdkVersion\":\",70508271,73720540,75843653,76055827,76124481,76146380,76314875,76378881,76388334,76403724,76403729,76424652,76432884,76463666,76463851,76484019,76519478,76552286,76557027,76600398,76604746,766124
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_page_alive","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"url_path\":\"/\",\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"duration\":10650,\"is_support_visibility_change\":1,\"startTime\":1785142704999,\"hidden\":\"visible\",\"leave\":true,\"mode\":\"normal\",\"focusState\":true,\"event_index\":1785142729319}","local_time_ms":1785142715650,"is_bav":1,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"}],"us
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_page_close","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"url_path\":\"/\",\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"active_times\":1,\"duration\":10652,\"total_duration\":10652,\"is_support_visibility_change\":1,\"mode\":\"normal\",\"focusState\":true,\"event_index\":1785142729320}","local_time_ms":1785142715651,"is_bav":1,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"}],"user":{"user_unique_id":
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"videoplayer_oneplay","params":"{\"local_time\":1785142715655,\"player_sessionid\":\"554ff82f-d3a9-4583-8ae5-135ac38bcf8b\",\"sdk_version\":\"0.4.8\",\"pc\":\"0.4.8\",\"pv\":\"0.4.8\",\"sv\":\"0.4.8\",\"line_app_id\":1988,\"line_user_id\":\"7661953835623237138\",\"app_version\":\"\",\"platform\":\"pc\",\"cpu_core\":12,\"memory_size\":16,\"support\":11100,\"absdkVersion\":\",70508271,73720540,75843653,76055827,76124481,76146380,76314875,76378881,76388334,76403724,76403729,764
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"lcp","value":1608,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf","extra":{"element":"div.css-1umd7qg-7937d88b--DivContainer.e1sq7r4z0 > div.css-16s6atg-7937d88b--Box.etuqjjj0 > span > picture > img[alt=\"done versi zero sorry g bisa tag 🙏 #ultramanzero#zeroedit#fy#request#ultraman  cr.@Kayken Uzumaki`ft 𝙂𝘾 \"]"}},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"inp","value":0,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"a287582a-7aa3-45a5-bc00-59c6fa546dde","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142715663,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"ho
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"cls","value":0.0009794108072916667,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf","extra":{"element":"#media-card-0 > div.css-bfblgq-7937d88b--BasePlayerContainer-7937d88b--DivVideoPlayerContainer.e1gen9l33 > div.css-3rm8q2-7937d88b--DivMediaCardOverlay.e1vama6v0 > div.css-1nyulp2-7937d88b--DivMediaCardOverlayBottomSection.e1vama6v1"}},"common":{"bid":"tiktok_webapp","user_id":"7661953835
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"__bav_beat","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"beat_type\":0,\"page_key\":\"https://www.tiktok.com/\",\"is_html\":1,\"page_title\":\"TikTok - Make Your Day\",\"page_manual_key\":\"\",\"page_viewport_width\":1280,\"page_viewport_height\":720,\"page_total_width\":1280,\"page_total_height\":720,\"scroll_width\":1280,\"scroll_height\":720,\"since_page_start_ms\":11933,\"page_start_ms\":1785142703745,\"event_index\":1785142729326}","local
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"slardar_perf_lcp","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":11915,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,73720540,75843653,76055827,76124481,76146380,76314875,7637888
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-2HL7Dddm5NYES6ivxkccWg' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"require-trusted-types-for","effective-directive":"require-trusted-types-for","original-policy":"require-trusted-types-for 'script';report-uri /_/OneGoogleWidgetUi/cspreport","disposition":"enforce","blocked-uri":"trusted-types-sink","line-number":1832,"col
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-2HL7Dddm5NYES6ivxkccWg' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-2HL7Dddm5NYES6ivxkccWg' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-RXi5pkMr5RNm99Kz-bl9xw' 'unsafe-inline';object-src 'none';base-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"require-trusted-types-for","effective-directive":"require-trusted-types-for","original-policy":"require-trusted-types-for 'script';report-uri /_/SocialPeopleHoverc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-RXi5pkMr5RNm99Kz-bl9xw' 'unsafe-inline';object-src 'none';base-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-RXi5pkMr5RNm99Kz-bl9xw' 'unsafe-inline';object-src 'none';base-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"__bav_page","params":"{\"is_html\":1,\"url\":\"https://www.tiktok.com/\",\"referrer\":\"\",\"page_key\":\"https://www.tiktok.com/\",\"refer_page_key\":\"\",\"page_title\":\"TikTok - Make Your Day\",\"page_manual_key\":\"\",\"refer_page_manual_key\":\"\",\"refer_page_title\":\"TikTok - Make Your Day\",\"page_path\":\"/\",\"page_host\":\"www.tiktok.com\",\"is_first_time\":\"false\",\"is_back\":0,\"page_total_width\":1280,\"page_total_height\":720,\"refer_page_duration_ms\":10
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_init","params":"{\"status\":\"FINISH\",\"event_index\":1785142792465}","local_time_ms":1785142790896,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"},{"event":"pns_communication_service_init","params":"{\"status\":\"START\",\"event_index\":1785142792464}","local_time_ms":1785142790895,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"feed_top_cache","params":"{\"time_from_origin\":834,\"valid\":9,\"event_index\":1785142792463}","local_time_ms":1785142790840,"is_bav":1,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"},{"event":"request_device_score_time","params":"{\"time_from_origin\":826,\"duration\":1,\"type\":\"total\",\"page_name\":\"homepage_hot\",\"event_index\":1785142792462}","local_time_ms":1785142790839,"is_bav":1,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"},{"event":"arm_render_fin
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_pageview","params":"{\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"url_path\":\"/\",\"time\":1785142790909,\"referrer\":\"\",\"$is_first_time\":\"false\",\"event_index\":1785142792466}","local_time_ms":1785142790909,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header":{"app_id":1988,"os_name":"windows","os_version":"10","device_model":"W
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"portrait_hub_init","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":1055,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,7589959
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_execute","params":"{\"status\":\"IN_PROGRESS\",\"stepName\":\"LOAD_DATA_START\",\"event_index\":1785142792476}","local_time_ms":1785142791063,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"},{"event":"pns_communication_service_execute","params":"{\"status\":\"START\",\"event_index\":1785142792475}","local_time_ms":1785142791061,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"}],"user":{"user_unique_id":"7661953835623237
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_execute","params":"{\"status\":\"FINISH\",\"event_index\":1785142792478}","local_time_ms":1785142791472,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"},{"event":"pns_communication_service_execute","params":"{\"status\":\"IN_PROGRESS\",\"stepName\":\"LOAD_DATA_FINISH\",\"event_index\":1785142792477}","local_time_ms":1785142791472,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"}],"user":{"user_unique_id":"76619538356232
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"first_feed_show_time","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":1723,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,7589
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":1792,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_pageview","params":"{\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"url_path\":\"/\",\"time\":1785142791867,\"referrer\":\"\",\"$is_first_time\":\"false\",\"event_index\":1785142792487}","local_time_ms":1785142791867,"is_bav":0,"session_id":"7b8c4ac6-d8f9-45f3-9904-254dd4ef0038"}],"user":{"user_unique_id":"7661964440841831944","web_id":"7661964440841831944"},"header":{"app_id":594856,"os_name":"windows","os_version":"10","device_model":
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"pageview","payload":{"pid":"homepage_hot","source":"init"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"68727500-cfd1-461c-8067-47f093da68ab","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142790818,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"homepage_hot","view_id":"homepage_hot_1785142791276","context":{"region":"ID
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=cdn_replace_service_worker`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"swRegister","type":"event","metrics":{"count":1},"categories":{"host":"www.tiktok.com"}},"common":{"bid":"cdn_replace_service_worker","user_id":"cb6e4957-7a1a-4b37-a481-044660c7315d","device_id":"9bde90ea-9794-4e3d-85d3-cd0403e42c73","session_id":"39c2c0cc-fab2-4d89-8c76-8cd9239a5ccc","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":1785142791285,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"show_section","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":3560,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,760
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":3824,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":3960,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"cookie_banner_cdn_load","params":"{\"page_url\":\"https://www.tiktok.com/\",\"host\":\"www.tiktok.com\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"referrer\":\"https://www.tiktok.com/\",\"loader_version\":\"1.0.5\",\"resource_url\":\"https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/pns/tiktok-cookie-banner/1.0.0.285/default.esm.js\",\"event_index\":178514279
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"cookie_banner_load","params":"{\"locale\":\"en\",\"region\":\"ID\",\"js_version\":\"1.0.0.285\",\"tenant_id\":\"paas_tiktok\",\"page_url\":\"https://www.tiktok.com/\",\"host\":\"www.tiktok.com\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"referrer\":\"https://www.tiktok.com/\",\"event_index\":1785143044513}","local_time_ms":1785142794579,"is_bav":0,"session_id":"1698e3b8-4ecc-42ea-9722-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"consent_init_sdk","params":"{\"status\":\"FINISH\",\"event_index\":1785143027680}","local_time_ms":1785142794590,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"},{"event":"consent_init_sdk","params":"{\"status\":\"START\",\"event_index\":1785143027679}","local_time_ms":1785142794588,"is_bav":0,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header":{"app_id":1988,"os_name":"
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"onload","params":"{\"app_id\":1992,\"app_name\":\"\",\"sdk_version\":\"5.3.17\",\"sdk_type\":\"npm\",\"sdk_config\":{\"app_id\":1992,\"channel\":\"va\",\"channel_type\":\"tcpy\",\"log\":false,\"disable_auto_pv\":true,\"disable_webid\":true},\"sdk_desc\":\"TOC_OVERSEA\",\"url\":\"https://www.tiktok.com/\",\"is_setting\":false,\"enable_logsetting_params\":false,\"enable_logsetting_header_custom\":false}","local_time_ms":1785142794297}],"user":{"user_unique_id":"76619538356232
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":4810,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"video_receive","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5164,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"tt_ticket_guard_web_get_storage","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_platform\":\"web\",\"init_type\":\"pubKey\",\"sign_type\":\"pubKey\",\"params_for_special\":\"tiktok_account_login\",\"key\":\"s_sdk_crypt_sdk,s_sdk_cert_key,s_sdk_sign_data_key/tt_fetch\",\"storage_type\":\"local\",\"duration\":721,\"event_index\":1785142792536}","local_time_ms":1785142795016,"is_bav":0,"session_id":"4d27b5ae-d73a-4b6e-998d-70c2f7abd286"}],"user":{"user_unique
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"load_more","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5169,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,760307
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"content":"live_sdk_api_live_feed-TypeError-Cannot read properties of undefined (reading 'data')","type":"log","level":"error"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"68727500-cfd1-461c-8067-47f093da68ab","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142794315,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"__bav_beat","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"beat_type\":3,\"page_key\":\"https://www.tiktok.com/\",\"is_html\":1,\"page_title\":\"TikTok - Make Your Day\",\"page_manual_key\":\"\",\"page_viewport_width\":1280,\"page_viewport_height\":720,\"page_total_width\":1280,\"page_total_height\":720,\"scroll_width\":1280,\"scroll_height\":720,\"since_page_start_ms\":5454,\"page_start_ms\":1785142790002,\"event_index\":1785142792545}","local_
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"slardar_perf_ttfb","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5762,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,7589959
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":6116,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=ucenter_tiktok_zti_sdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"tt_ticket_guard_sdk_init","type":"event","categories":{"success":"success","region":"va","remote":"false"}},"common":{"bid":"ucenter_tiktok_zti_sdk","user_id":"7661953835623237138","device_id":"05aff4e2-df93-4f91-84cf-b22d572af18b","session_id":"9d6db2df-a0a1-45a5-95e3-5b9488d205c6","release":"","env":"online","url":"https://www.tiktok.com/","timestamp":1785142794290,"sdk_version":"1.12.4","sdk_name":"SDK_SLARDAR_WEB","pid":"www.t
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":6622,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=pns_communication_service`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"resource_error","payload":{"type":"script","url":"https://sf16-website-login.neutral.ttwstatic.com/slardar/fe/sdk-web/plugins/common-monitors.1.16.7.js"},"common":{"bid":"pns_communication_service","user_id":"107f4cb8-bd96-4623-8e11-b9f386041c71","device_id":"2bece8b4-36e7-435a-bec6-8ec234f79bd2","session_id":"5c55433a-4447-4104-a729-c339aacc45d6","release":"1.0.1","env":"production","url":"https://www.tiktok.com/","timestamp":1785142796020,"sdk_version":"1
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=pns_cookie_banner_slardar`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"pns_cuj","type":"event","metrics":{"timestamp":4576.59999999986,"duration":0},"categories":{"status":"START","name":"load_cookie_banner","stepName":"FINISH","error":"","detail":"","appId":"1988","appVersion":"1.0.0.285","tenant":"paas_tiktok"}},"common":{"bid":"pns_cookie_banner_slardar","user_id":"410fe6c4-c2ac-4dff-9036-5997e76a42f6","device_id":"b6953e27-0a48-4d8c-bc2f-9f9c2eecb814","session_id":"224787ee-e1df-4bcc-88f1-1ed1135
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":7072,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp_vmok`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"remote_load_start","type":"event","categories":{"commit_hash":"dynamic"}},"common":{"bid":"tiktok_webapp_vmok","user_id":"2742326d-97fb-4d8f-a15b-fb2fcc05e074","device_id":"c9017e33-2532-44a9-a83b-e25a3f447ec4","session_id":"58c30e2a-c8b2-442b-bea5-c4acff6908f6","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":1785142796139,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"","view_id":"_17851427
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"pns_cuj","type":"event","metrics":{"timestamp":1785142795557,"duration":829,"status_code":0},"categories":{"status_msg":"","name":"digital_wellbeing_api","method":"get","url":"/tiktok/v1/screen_time/list/","queryOrBody":"{\"count\":1,\"date\":20661}","enter_from":"today_usage"}},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"68727500-cfd1-461c-8067-4
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"mdl_video_preload","params":"{\"sdk_version\":\"0.4.8\",\"pc\":\"0.4.8\",\"pv\":\"0.4.8\",\"sv\":\"0.4.8\",\"line_app_id\":1988,\"line_user_id\":\"7661953835623237138\",\"app_version\":\"\",\"platform\":\"pc\",\"cpu_core\":12,\"memory_size\":16,\"support\":11100,\"absdkVersion\":\",70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76030701,76035889,76055827,76074397,76124481,76146380,76179550,76251108,76314875,76362328,76378881,76388334,76403724,764037
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"mdl_video_preload","params":"{\"sdk_version\":\"0.4.8\",\"pc\":\"0.4.8\",\"pv\":\"0.4.8\",\"sv\":\"0.4.8\",\"line_app_id\":1988,\"line_user_id\":\"7661953835623237138\",\"app_version\":\"\",\"platform\":\"pc\",\"cpu_core\":12,\"memory_size\":16,\"support\":11100,\"absdkVersion\":\",70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76030701,76035889,76055827,76074397,76124481,76146380,76179550,76251108,76314875,76362328,76378881,76388334,76403724,764037
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"mdl_video_preload","params":"{\"sdk_version\":\"0.4.8\",\"pc\":\"0.4.8\",\"pv\":\"0.4.8\",\"sv\":\"0.4.8\",\"line_app_id\":1988,\"line_user_id\":\"7661953835623237138\",\"app_version\":\"\",\"platform\":\"pc\",\"cpu_core\":12,\"memory_size\":16,\"support\":11100,\"absdkVersion\":\",70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76030701,76035889,76055827,76074397,76124481,76146380,76179550,76251108,76314875,76362328,76378881,76388334,76403724,764037
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"video_play_finish","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":8715,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,7589959
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":8901,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"tt_ticket_guard_web_sign","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_platform\":\"web\",\"init_type\":\"pubKey\",\"sign_type\":\"pubKey\",\"params_for_special\":\"tiktok_account_login\",\"type\":\"crypto\",\"duration\":0,\"event_index\":1785142792563}","local_time_ms":1785142798913,"is_bav":0,"session_id":"4d27b5ae-d73a-4b6e-998d-70c2f7abd286"},{"event":"tt_ticket_guard_web_get_storage","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_p
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"tt_ticket_guard_web_performance","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_platform\":\"web\",\"init_type\":\"pubKey\",\"sign_type\":\"pubKey\",\"params_for_special\":\"tiktok_account_login\",\"type\":\"crypto\",\"store_type\":\"local\",\"path\":\"https://www.tiktok.com/passport/web/account/info/?WebIdLastTime=1783937646&aid=1459&app_language=en&app_name=tiktok_web&browser_language=en-US&browser_name=Mozilla&browser_online=true&browser_platform=Win32&
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=ucenter_tiktok_zti_sdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"tt_ticket_guard_web_get_storage","type":"event","metrics":{"duration":2},"categories":{"key":"s_sdk_crypt_sdk,s_sdk_cert_key,s_sdk_sign_data_key/tt_fetch","storage_type":"local"}},"common":{"bid":"ucenter_tiktok_zti_sdk","user_id":"7661953835623237138","device_id":"05aff4e2-df93-4f91-84cf-b22d572af18b","session_id":"9d6db2df-a0a1-45a5-95e3-5b9488d205c6","release":"","env":"online","url":"https://www.tiktok.com/","timestamp":178514
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_page_alive","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"url_path\":\"/\",\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"duration\":10172,\"is_support_visibility_change\":1,\"startTime\":1785142790830,\"hidden\":\"visible\",\"leave\":true,\"mode\":\"normal\",\"focusState\":true,\"event_index\":1785142792568}","local_time_ms":1785142801002,"is_bav":1,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"}],"us
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_page_close","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"url_path\":\"/\",\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"active_times\":1,\"duration\":10173,\"total_duration\":10174,\"is_support_visibility_change\":1,\"mode\":\"normal\",\"focusState\":true,\"event_index\":1785142792569}","local_time_ms":1785142801004,"is_bav":1,"session_id":"b8f5ecd0-6891-4644-ab53-572c3a333b3b"}],"user":{"user_unique_id":
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"videoplayer_oneplay","params":"{\"local_time\":1785142801008,\"player_sessionid\":\"04692cb4-ac9d-4829-8109-aa8c38694b74\",\"sdk_version\":\"0.4.8\",\"pc\":\"0.4.8\",\"pv\":\"0.4.8\",\"sv\":\"0.4.8\",\"line_app_id\":1988,\"line_user_id\":\"7661953835623237138\",\"app_version\":\"\",\"platform\":\"pc\",\"cpu_core\":12,\"memory_size\":16,\"support\":11100,\"absdkVersion\":\",70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76030701,76035889,76055827,760
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"lcp","value":1048,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf","extra":{"element":"div.css-1umd7qg-7937d88b--DivContainer.e1sq7r4z0 > div.css-16s6atg-7937d88b--Box.etuqjjj0 > span > picture > img"}},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"68727500-cfd1-461c-8067-47f093da68ab","release":"1.5.0.6187",
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"inp","value":0,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"68727500-cfd1-461c-8067-47f093da68ab","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142801018,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"ho
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"cls","value":0.005082259001555267,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf","extra":{"element":"#one-column-item-0 > div.css-1gp40pd-7937d88b--DivContentFlexLayout.ehcbpkw2 > #media-card-0 > div.css-bfblgq-7937d88b--BasePlayerContainer-7937d88b--DivVideoPlayerContainer.e1gen9l33 > div.css-3rm8q2-7937d88b--DivMediaCardOverlay.e1vama6v0"}},"common":{"bid":"tiktok_webapp","user_id":"766
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"__bav_beat","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"beat_type\":0,\"page_key\":\"https://www.tiktok.com/\",\"is_html\":1,\"page_title\":\"TikTok - Make Your Day\",\"page_manual_key\":\"\",\"page_viewport_width\":1280,\"page_viewport_height\":720,\"page_total_width\":1280,\"page_total_height\":720,\"scroll_width\":1280,\"scroll_height\":720,\"since_page_start_ms\":11034,\"page_start_ms\":1785142790002,\"event_index\":1785142792575}","local
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"slardar_perf_lcp","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":11012,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,7589959
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-fITuLE9t7Up-k82I-K52wg' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"require-trusted-types-for","effective-directive":"require-trusted-types-for","original-policy":"require-trusted-types-for 'script';report-uri /_/OneGoogleWidgetUi/cspreport","disposition":"enforce","blocked-uri":"trusted-types-sink","line-number":1832,"col
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-fITuLE9t7Up-k82I-K52wg' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-fITuLE9t7Up-k82I-K52wg' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-CoJOeBSZQ6qgkXY8R5379Q' 'unsafe-inline';object-src 'none';base-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"require-trusted-types-for","effective-directive":"require-trusted-types-for","original-policy":"require-trusted-types-for 'script';report-uri /_/SocialPeopleHoverc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-CoJOeBSZQ6qgkXY8R5379Q' 'unsafe-inline';object-src 'none';base-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 150
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-CoJOeBSZQ6qgkXY8R5379Q' 'unsafe-inline';object-src 'none';base-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `lnkd.demdex.net`
- **URL:** `https://lnkd.demdex.net/event?d_dil_ver=9.4&_ts=1785142584273`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
d_mid=90077121775993806112115099951483039736&d_nsid=0&d_cid_ic=lnkdidsync%01ASpva964bzZE1X-xhNpOO-upwfYn%26v%3D2%011&d_cid_ic=thirdpartyid%01ASpva964bzZE1X-xhNpOO-upwfYn%26v%3D2%011&d_cid_ic=lnkd_member_id%01ASpva964bzZE1X-xhNpOO-upwfYn%26v%3D2%011&d_ld=_ts%3D1785142584272&d_rtbd=json&d_jsonv=1&d_dst=1&c_page_name=%2Ffeed%2F&c_page_key=d_flagship3_feed&h_referer=https%3A%2F%2Fwww.linkedin.com%2Ffeed%2F
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"feed_top_cache","params":"{\"time_from_origin\":2706,\"valid\":9,\"event_index\":1785142771155}","local_time_ms":1785142616233,"is_bav":1,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"},{"event":"request_device_score_time","params":"{\"time_from_origin\":2686,\"duration\":1,\"type\":\"total\",\"page_name\":\"homepage_hot\",\"event_index\":1785142771154}","local_time_ms":1785142616232,"is_bav":1,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"},{"event":"arm_render_f
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_pageview","params":"{\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"url_path\":\"/\",\"time\":1785142616394,\"referrer\":\"https://www.tiktok.com/\",\"$is_first_time\":\"false\",\"event_index\":1785142771158}","local_time_ms":1785142616394,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header":{"app_id":1988,"os_name":"windows","os_version"
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_execute","params":"{\"status\":\"IN_PROGRESS\",\"stepName\":\"LOAD_DATA_START\",\"event_index\":1785142771166}","local_time_ms":1785142616672,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"},{"event":"pns_communication_service_execute","params":"{\"status\":\"START\",\"event_index\":1785142771165}","local_time_ms":1785142616672,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"}],"user":{"user_unique_id":"7661953835623237
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"arm_core_content_ready","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":3785,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"page_ready","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":3791,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76030
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_execute","params":"{\"status\":\"FINISH\",\"event_index\":1785142771173}","local_time_ms":1785142617320,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"},{"event":"pns_communication_service_execute","params":"{\"status\":\"IN_PROGRESS\",\"stepName\":\"LOAD_DATA_FINISH\",\"event_index\":1785142771172}","local_time_ms":1785142617320,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"}],"user":{"user_unique_id":"76619538356232
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_pageview","params":"{\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"url_path\":\"/\",\"time\":1785142617337,\"referrer\":\"https://www.tiktok.com/\",\"$is_first_time\":\"false\",\"event_index\":1785142771175}","local_time_ms":1785142617337,"is_bav":0,"session_id":"e3124b9b-4d0e-4f3d-b80b-a3191749310f"}],"user":{"user_unique_id":"7661964440841831944","web_id":"7661964440841831944"},"header":{"app_id":594856,"os_name":"windows","os_versio
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"slardar_perf_ttfb","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":4125,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,7589959
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"video_play","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":4456,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76030
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"inference_trigger","params":"{\"page_name\":\"launcher\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":4518,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"first_frame_video","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":4679,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,7589959
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5867,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":6031,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":6234,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":6976,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"cookie_banner_cdn_load","params":"{\"page_url\":\"https://www.tiktok.com/\",\"host\":\"www.tiktok.com\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"referrer\":\"https://www.tiktok.com/\",\"loader_version\":\"1.0.5\",\"resource_url\":\"https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/pns/tiktok-cookie-banner/1.0.0.285/default.esm.js\",\"event_index\":178514277
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"video_content_show","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":7078,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,758995
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":7917,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":8027,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"cookie_banner_load","params":"{\"locale\":\"en\",\"region\":\"ID\",\"js_version\":\"1.0.0.285\",\"tenant_id\":\"paas_tiktok\",\"page_url\":\"https://www.tiktok.com/\",\"host\":\"www.tiktok.com\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"referrer\":\"https://www.tiktok.com/\",\"event_index\":1785143424284}","local_time_ms":1785142621742,"is_bav":0,"session_id":"0c2327e6-a0e6-4830-b942-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"consent_init_sdk","params":"{\"status\":\"FINISH\",\"event_index\":1785143610511}","local_time_ms":1785142621764,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"},{"event":"consent_init_sdk","params":"{\"status\":\"START\",\"event_index\":1785143610510}","local_time_ms":1785142621759,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header":{"app_id":1988,"os_name":"
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"tt_ticket_guard_web_get_storage","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_platform\":\"web\",\"init_type\":\"pubKey\",\"sign_type\":\"pubKey\",\"params_for_special\":\"tiktok_account_login\",\"key\":\"s_sdk_crypt_sdk,s_sdk_cert_key,s_sdk_sign_data_key/tt_fetch\",\"storage_type\":\"local\",\"duration\":557,\"event_index\":1785142771246}","local_time_ms":1785142621601,"is_bav":0,"session_id":"64039241-1597-4b0e-8021-5bdce7f2d7c7"}],"user":{"user_unique
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":8356,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":8613,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":10293,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,760
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=webmssdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"exLoadStatus","type":"event","metrics":{"count":1},"categories":{"status":"3","page":"https://www.tiktok.com/","scmVersion":"1.0.0.388","sdkVersion":"5.3.1"}},"common":{"bid":"webmssdk","user_id":"e314afc9-3a1b-4f46-8da8-0bfca506b217","device_id":"3ff69dd2-0ad0-4b0d-a5aa-ba1a2ce69306","session_id":"7b1842cb-e182-466c-8009-fa1fce72b70b","release":"1.0.0.388","env":"production","url":"https://www.tiktok.com/","timestamp":17851426218
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":10843,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,760
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"tt_ticket_guard_web_sign","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_platform\":\"web\",\"init_type\":\"pubKey\",\"sign_type\":\"pubKey\",\"params_for_special\":\"tiktok_account_login\",\"type\":\"crypto\",\"duration\":1,\"event_index\":1785142771253}","local_time_ms":1785142624393,"is_bav":0,"session_id":"64039241-1597-4b0e-8021-5bdce7f2d7c7"},{"event":"tt_ticket_guard_web_get_storage","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_p
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"tt_ticket_guard_web_performance","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_platform\":\"web\",\"init_type\":\"pubKey\",\"sign_type\":\"pubKey\",\"params_for_special\":\"tiktok_account_login\",\"type\":\"crypto\",\"store_type\":\"local\",\"path\":\"https://www.tiktok.com/passport/web/account/info/?WebIdLastTime=1783937646&aid=1459&app_language=en&app_name=tiktok_web&browser_language=en-US&browser_name=Mozilla&browser_online=true&browser_platform=Win32&
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=ucenter_tiktok_zti_sdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"tt_ticket_guard_web_get_storage","type":"event","metrics":{"duration":6},"categories":{"key":"s_sdk_crypt_sdk,s_sdk_cert_key,s_sdk_sign_data_key/tt_fetch","storage_type":"local"}},"common":{"bid":"ucenter_tiktok_zti_sdk","user_id":"7661953835623237138","device_id":"05aff4e2-df93-4f91-84cf-b22d572af18b","session_id":"436ac777-a3d7-485f-8894-8623d39f2cd2","release":"","env":"online","url":"https://www.tiktok.com/","timestamp":178514
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"pns_cuj","type":"event","metrics":{"timestamp":1785142623498,"duration":1369,"status_code":0},"categories":{"status_msg":"","name":"digital_wellbeing_api","method":"post","url":"/tiktok/v1/screen_time/upload/","queryOrBody":"{\"upload_timestamp\":1785142622,\"upload_type\":3,\"time_usage\":[{\"upload_date\":20661,\"day_usage\":0,\"night_usage\":0}]}","enter_from":"initial"}},"common":{"bid":"tiktok_webapp","user_id":"7661953835623
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"mdl_video_preload","params":"{\"sdk_version\":\"0.4.8\",\"pc\":\"0.4.8\",\"pv\":\"0.4.8\",\"sv\":\"0.4.8\",\"line_app_id\":1988,\"line_user_id\":\"7661953835623237138\",\"app_version\":\"\",\"platform\":\"pc\",\"cpu_core\":12,\"memory_size\":16,\"support\":11100,\"absdkVersion\":\",70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76030701,76035889,76055827,76074397,76124481,76146380,76179550,76251108,76314875,76362328,76378881,76388334,76403724,764037
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"mdl_video_preload","params":"{\"sdk_version\":\"0.4.8\",\"pc\":\"0.4.8\",\"pv\":\"0.4.8\",\"sv\":\"0.4.8\",\"line_app_id\":1988,\"line_user_id\":\"7661953835623237138\",\"app_version\":\"\",\"platform\":\"pc\",\"cpu_core\":12,\"memory_size\":16,\"support\":11100,\"absdkVersion\":\",70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76030701,76035889,76055827,76074397,76124481,76146380,76179550,76251108,76314875,76362328,76378881,76388334,76403724,764037
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"mdl_video_preload","params":"{\"sdk_version\":\"0.4.8\",\"pc\":\"0.4.8\",\"pv\":\"0.4.8\",\"sv\":\"0.4.8\",\"line_app_id\":1988,\"line_user_id\":\"7661953835623237138\",\"app_version\":\"\",\"platform\":\"pc\",\"cpu_core\":12,\"memory_size\":16,\"support\":11100,\"absdkVersion\":\",70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76030701,76035889,76055827,76074397,76124481,76146380,76179550,76251108,76314875,76362328,76378881,76388334,76403724,764037
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":18070,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,760
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"mdl_video_preload","params":"{\"sdk_version\":\"0.4.8\",\"pc\":\"0.4.8\",\"pv\":\"0.4.8\",\"sv\":\"0.4.8\",\"line_app_id\":1988,\"line_user_id\":\"7661953835623237138\",\"app_version\":\"\",\"platform\":\"pc\",\"cpu_core\":12,\"memory_size\":16,\"support\":11100,\"absdkVersion\":\",70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76030701,76035889,76055827,76074397,76124481,76146380,76179550,76251108,76314875,76362328,76378881,76388334,76403724,764037
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"common_mousemove","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":19459,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,7589959
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"lcp","value":3312,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf","extra":{"element":"div.css-16s6atg-7937d88b--Box.etuqjjj0 > span > picture > img[alt=\"kenapa yak 🥱=>🥺 #jjmykisah😹🤭🤭 #jjelistis #jjwiner🤭 #relateable #jjmykisah #trending #xybca #forreal #fyp #jjluser #jjconfident #foryoupage\"]"}},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-45
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"inp","value":0,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"74077647-e1d2-4638-9088-c5b8d18c8a67","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142633667,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"ho
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"cls","value":0.010825205940277978,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf","extra":{"element":"#one-column-item-0 > div.css-1gp40pd-7937d88b--DivContentFlexLayout.ehcbpkw2 > #media-card-0 > div.css-bfblgq-7937d88b--BasePlayerContainer-7937d88b--DivVideoPlayerContainer.e1gen9l33 > div.css-3rm8q2-7937d88b--DivMediaCardOverlay.e1vama6v0"}},"common":{"bid":"tiktok_webapp","user_id":"766
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"slardar_perf_lcp","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":20147,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,7589959
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_page_alive","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"url_path\":\"/\",\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"duration\":17460,\"is_support_visibility_change\":1,\"startTime\":1785142616211,\"hidden\":\"visible\",\"leave\":true,\"mode\":\"normal\",\"focusState\":true,\"event_index\":1785142771268}","local_time_ms":1785142633671,"is_bav":1,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"}],"us
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_page_close","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"url_path\":\"/\",\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"active_times\":1,\"duration\":17462,\"total_duration\":17462,\"is_support_visibility_change\":1,\"mode\":\"normal\",\"focusState\":true,\"event_index\":1785142771269}","local_time_ms":1785142633673,"is_bav":1,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"}],"user":{"user_unique_id":
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"videoplayer_oneplay","params":"{\"local_time\":1785142633678,\"player_sessionid\":\"21c880f6-6c9f-46a3-b6b8-0bda8f6df925\",\"sdk_version\":\"0.4.8\",\"pc\":\"0.4.8\",\"pv\":\"0.4.8\",\"sv\":\"0.4.8\",\"line_app_id\":1988,\"line_user_id\":\"7661953835623237138\",\"app_version\":\"\",\"platform\":\"pc\",\"cpu_core\":12,\"memory_size\":16,\"support\":11100,\"absdkVersion\":\",70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76030701,76035889,76055827,760
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"__bav_beat","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"beat_type\":0,\"page_key\":\"https://www.tiktok.com/\",\"is_html\":1,\"page_title\":\"TikTok - Make Your Day\",\"page_manual_key\":\"\",\"page_viewport_width\":1280,\"page_viewport_height\":720,\"page_total_width\":1280,\"page_total_height\":720,\"scroll_width\":1280,\"scroll_height\":720,\"since_page_start_ms\":20167,\"page_start_ms\":1785142613518,\"event_index\":1785142771274}","local
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"close_window","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":20164,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"video_play_finish","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":20416,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,758995
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-D5PxDjoRE4sCF7CIBNOBkg' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-D5PxDjoRE4sCF7CIBNOBkg' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-bCsHYUkN2FHEc3MACXuE3Q' 'unsafe-inline';object-src 'none';base-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-bCsHYUkN2FHEc3MACXuE3Q' 'unsafe-inline';object-src 'none';base-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `lnkd.demdex.net`
- **URL:** `https://lnkd.demdex.net/event?d_dil_ver=9.4&_ts=1785142701150`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
d_mid=90077121775993806112115099951483039736&d_nsid=0&d_cid_ic=lnkdidsync%01ASpva964bzZE1X-xhNpOO-upwfYn%26v%3D2%011&d_cid_ic=thirdpartyid%01ASpva964bzZE1X-xhNpOO-upwfYn%26v%3D2%011&d_cid_ic=lnkd_member_id%01ASpva964bzZE1X-xhNpOO-upwfYn%26v%3D2%011&d_ld=_ts%3D1785142701149&d_rtbd=json&d_jsonv=1&d_dst=1&c_page_name=%2Ffeed%2F&c_page_key=d_flagship3_feed&h_referer=https%3A%2F%2Fwww.linkedin.com%2Ffeed%2F
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"__bav_page","params":"{\"is_html\":1,\"url\":\"https://www.tiktok.com/\",\"referrer\":\"\",\"page_key\":\"https://www.tiktok.com/\",\"refer_page_key\":\"\",\"page_title\":\"TikTok - Make Your Day\",\"page_manual_key\":\"\",\"refer_page_manual_key\":\"\",\"refer_page_title\":\"TikTok - Make Your Day\",\"page_path\":\"/\",\"page_host\":\"www.tiktok.com\",\"is_first_time\":\"false\",\"is_back\":0,\"page_total_width\":1280,\"page_total_height\":720,\"refer_page_duration_ms\":17
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_init","params":"{\"status\":\"FINISH\",\"event_index\":1785143433264}","local_time_ms":1785142721715,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"},{"event":"pns_communication_service_init","params":"{\"status\":\"START\",\"event_index\":1785143433263}","local_time_ms":1785142721713,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"feed_top_cache","params":"{\"time_from_origin\":1217,\"valid\":9,\"event_index\":1785143433262}","local_time_ms":1785142721652,"is_bav":1,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"},{"event":"recommend_empty_play_addr_item","params":"{\"time_from_origin\":1215,\"count\":2,\"item_list_key\":\"foryou\",\"page_name\":\"\",\"response_count\":3,\"remain_count\":1,\"event_index\":1785143433261}","local_time_ms":1785142721652,"is_bav":1,"session_id":"c44934b3-ed34-4f1c-a5
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_pageview","params":"{\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"url_path\":\"/\",\"time\":1785142721729,\"referrer\":\"\",\"$is_first_time\":\"false\",\"event_index\":1785143433265}","local_time_ms":1785142721729,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header":{"app_id":1988,"os_name":"windows","os_version":"10","device_model":"W
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"portrait_hub_init","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":1425,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,73720540,75843653,76055827,76124481,76146380,76314875,7637888
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_execute","params":"{\"status\":\"IN_PROGRESS\",\"stepName\":\"LOAD_DATA_START\",\"event_index\":1785143433274}","local_time_ms":1785142721863,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"},{"event":"pns_communication_service_execute","params":"{\"status\":\"START\",\"event_index\":1785143433273}","local_time_ms":1785142721862,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"}],"user":{"user_unique_id":"7661953835623237
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_execute","params":"{\"status\":\"FINISH\",\"event_index\":1785143433276}","local_time_ms":1785142722227,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"},{"event":"pns_communication_service_execute","params":"{\"status\":\"IN_PROGRESS\",\"stepName\":\"LOAD_DATA_FINISH\",\"event_index\":1785143433275}","local_time_ms":1785142722227,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"}],"user":{"user_unique_id":"76619538356232
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"video_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":1842,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,73720540,75843653,76055827,76124481,76146380,76314875,76378881,76
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":2551,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,73720540,75843653,76055827,76124481,76146380,76314875,76378881,7638
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"pageview","payload":{"pid":"homepage_hot","source":"init"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"3f3c7396-854b-4466-88b0-20cc207959f5","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142721626,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"homepage_hot","view_id":"homepage_hot_1785142722245","context":{"region":"ID
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=cdn_replace_service_worker`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"swRegister","type":"event","metrics":{"count":1},"categories":{"host":"www.tiktok.com"}},"common":{"bid":"cdn_replace_service_worker","user_id":"cb6e4957-7a1a-4b37-a481-044660c7315d","device_id":"9bde90ea-9794-4e3d-85d3-cd0403e42c73","session_id":"86a29464-c351-4aef-a72a-46356f3dc9fc","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":1785142722249,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"cookie_banner_cdn_load","params":"{\"page_url\":\"https://www.tiktok.com/\",\"host\":\"www.tiktok.com\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"referrer\":\"https://www.tiktok.com/\",\"loader_version\":\"1.0.5\",\"resource_url\":\"https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/pns/tiktok-cookie-banner/1.0.0.285/default.esm.js\",\"event_index\":178514343
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"video_content_show","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":3990,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,73720540,75843653,76055827,76124481,76146380,76314875,763788
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"cookie_banner_load","params":"{\"locale\":\"en\",\"region\":\"ID\",\"js_version\":\"1.0.0.285\",\"tenant_id\":\"paas_tiktok\",\"page_url\":\"https://www.tiktok.com/\",\"host\":\"www.tiktok.com\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"referrer\":\"https://www.tiktok.com/\",\"event_index\":1785143604950}","local_time_ms":1785142724519,"is_bav":0,"session_id":"0c2327e6-a0e6-4830-b942-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"consent_init_sdk","params":"{\"status\":\"FINISH\",\"event_index\":1785143480338}","local_time_ms":1785142724533,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"},{"event":"consent_init_sdk","params":"{\"status\":\"START\",\"event_index\":1785143480337}","local_time_ms":1785142724531,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header":{"app_id":1988,"os_name":"
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":4491,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,73720540,75843653,76055827,76124481,76146380,76314875,76378881,7638
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"slardar_perf_ttfb","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":4660,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,73720540,75843653,76055827,76124481,76146380,76314875,7637888
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"load_more","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5024,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,73720540,75843653,76055827,76124481,76146380,76314875,76378881,763883
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5278,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,73720540,75843653,76055827,76124481,76146380,76314875,76378881,7638
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5328,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,73720540,75843653,76055827,76124481,76146380,76314875,76378881,7638
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=pns_communication_service`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"resource_error","payload":{"type":"script","url":"https://sf16-website-login.neutral.ttwstatic.com/slardar/fe/sdk-web/plugins/common-monitors.1.16.7.js"},"common":{"bid":"pns_communication_service","user_id":"107f4cb8-bd96-4623-8e11-b9f386041c71","device_id":"2bece8b4-36e7-435a-bec6-8ec234f79bd2","session_id":"1d8060d9-b4d4-4ec4-ad3e-1252019e7c8c","release":"1.0.1","env":"production","url":"https://www.tiktok.com/","timestamp":1785142725096,"sdk_version":"1
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"login_notify","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5675,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,73720540,75843653,76055827,76124481,76146380,76314875,76378881,763
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=pns_cookie_banner_slardar`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"pns_cuj","type":"event","metrics":{"timestamp":4085.600000000093,"duration":0},"categories":{"status":"START","name":"load_cookie_banner","stepName":"FINISH","error":"","detail":"","appId":"1988","appVersion":"1.0.0.285","tenant":"paas_tiktok"}},"common":{"bid":"pns_cookie_banner_slardar","user_id":"410fe6c4-c2ac-4dff-9036-5997e76a42f6","device_id":"b6953e27-0a48-4d8c-bc2f-9f9c2eecb814","session_id":"72e3d6ea-a250-429f-b524-b63fb1
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp_vmok`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"remote_load_start","type":"event","categories":{"commit_hash":"dynamic"}},"common":{"bid":"tiktok_webapp_vmok","user_id":"2742326d-97fb-4d8f-a15b-fb2fcc05e074","device_id":"c9017e33-2532-44a9-a83b-e25a3f447ec4","session_id":"b5b67fdc-d421-41f7-ac3a-08e81e537261","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":1785142725541,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"","view_id":"_17851427
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"pns_cuj","type":"event","metrics":{"timestamp":1785142725045,"duration":326,"status_code":0},"categories":{"status_msg":"","name":"digital_wellbeing_api","method":"get","url":"/tiktok/v1/screen_time/list/","queryOrBody":"{\"count\":1,\"date\":20661}","enter_from":"today_usage"}},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"3f3c7396-854b-4466-88b0-2
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=webmssdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"pageview","payload":{"pid":"/","source":"init"},"common":{"bid":"webmssdk","user_id":"e314afc9-3a1b-4f46-8da8-0bfca506b217","device_id":"3ff69dd2-0ad0-4b0d-a5aa-ba1a2ce69306","session_id":"afc1e87d-3582-498b-8600-d0d07842e682","release":"1.0.0.388","env":"production","url":"https://www.tiktok.com/","timestamp":1785142722950,"sdk_version":"1.16.6","sdk_name":"SDK_SLARDAR_WEB","pid":"/","view_id":"/_1785142722950","context":{},"network_type":"4g","sample_rate
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_page_alive","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"url_path\":\"/\",\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"duration\":8464,\"is_support_visibility_change\":1,\"startTime\":1785142721640,\"hidden\":\"visible\",\"leave\":true,\"mode\":\"normal\",\"focusState\":true,\"event_index\":1785143433319}","local_time_ms":1785142730105,"is_bav":1,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"}],"use
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_page_close","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"url_path\":\"/\",\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"active_times\":1,\"duration\":8466,\"total_duration\":8466,\"is_support_visibility_change\":1,\"mode\":\"normal\",\"focusState\":true,\"event_index\":1785143433320}","local_time_ms":1785142730106,"is_bav":1,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"}],"user":{"user_unique_id":"7
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"lcp","value":1860,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf","extra":{"element":"div.css-1pmjcj0-7937d88b--DivSwiperContainer.extb1211 > div.swiper.swiper-initialized.swiper-horizontal.swiper-pointer-events > div.swiper-wrapper > div.swiper-slide.swiper-slide-prev > img.css-19otcmx-7937d88b--ImgPhotoSlide.extb1212"}},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","dev
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"inp","value":0,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"3f3c7396-854b-4466-88b0-20cc207959f5","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142730112,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"ho
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"cls","value":0.001858619972511574,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf","extra":{"element":"#media-card-0 > div.css-hlkp18-7937d88b--BasePlayerContainer-7937d88b--DivPhotoPlayerContainer.e1gen9l34 > div.css-3rm8q2-7937d88b--DivMediaCardOverlay.e1vama6v0 > div.css-1nyulp2-7937d88b--DivMediaCardOverlayBottomSection.e1vama6v1"}},"common":{"bid":"tiktok_webapp","user_id":"76619538356
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"__bav_beat","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"beat_type\":0,\"page_key\":\"https://www.tiktok.com/\",\"is_html\":1,\"page_title\":\"TikTok - Make Your Day\",\"page_manual_key\":\"\",\"page_viewport_width\":1280,\"page_viewport_height\":720,\"page_total_width\":1280,\"page_total_height\":720,\"scroll_width\":1280,\"scroll_height\":720,\"since_page_start_ms\":9697,\"page_start_ms\":1785142720432,\"event_index\":1785143433323}","local_
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"slardar_perf_lcp","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":9677,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,73720540,75843653,76055827,76124481,76146380,76314875,76378881
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-YsT1cfWSDcHJOvyoQzOYWg' 'unsafe-inline';object-src 'none';base-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"require-trusted-types-for","effective-directive":"require-trusted-types-for","original-policy":"require-trusted-types-for 'script';report-uri /_/SocialPeopleHoverc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-YsT1cfWSDcHJOvyoQzOYWg' 'unsafe-inline';object-src 'none';base-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-YsT1cfWSDcHJOvyoQzOYWg' 'unsafe-inline';object-src 'none';base-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-jp3YmkddGv5Cx2il9piUTQ' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"require-trusted-types-for","effective-directive":"require-trusted-types-for","original-policy":"require-trusted-types-for 'script';report-uri /_/OneGoogleWidgetUi/cspreport","disposition":"enforce","blocked-uri":"trusted-types-sink","line-number":1832,"col
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-jp3YmkddGv5Cx2il9piUTQ' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-jp3YmkddGv5Cx2il9piUTQ' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"__bav_page","params":"{\"is_html\":1,\"url\":\"https://www.tiktok.com/\",\"referrer\":\"\",\"page_key\":\"https://www.tiktok.com/\",\"refer_page_key\":\"\",\"page_title\":\"TikTok - Make Your Day\",\"page_manual_key\":\"\",\"refer_page_manual_key\":\"\",\"refer_page_title\":\"TikTok - Make Your Day\",\"page_path\":\"/\",\"page_host\":\"www.tiktok.com\",\"is_first_time\":\"false\",\"is_back\":0,\"page_total_width\":1280,\"page_total_height\":720,\"refer_page_duration_ms\":84
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?bid=tiktok_pns_web_runtime`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"http","payload":{"api":"xhr","request":{"method":"get","url":"https://cost_time","timestamp":1785142808743,"body":"{\"version\":\"1.0.0.951\",\"runtime_env\":\"out_app\",\"module\":\"loader\",\"__business__\":\"serverless.tiktok.desktop\"}"},"response":{"status":200,"is_custom_error":false,"timestamp":1785142808743},"duration":0,"extra":{"time":"4"}},"common":{"bid":"tiktok_pns_web_runtime","user_id":"66dd6171-a597-42bb-9200-ca9dad7ef48f","release":"1.0.0.9
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_init","params":"{\"status\":\"FINISH\",\"event_index\":1785143466060}","local_time_ms":1785142809366,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"},{"event":"pns_communication_service_init","params":"{\"status\":\"START\",\"event_index\":1785143466059}","local_time_ms":1785142809365,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"feed_top_cache","params":"{\"time_from_origin\":1225,\"valid\":9,\"event_index\":1785143466058}","local_time_ms":1785142809303,"is_bav":1,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"},{"event":"recommend_empty_play_addr_item","params":"{\"time_from_origin\":1224,\"count\":1,\"item_list_key\":\"foryou\",\"page_name\":\"\",\"response_count\":3,\"remain_count\":2,\"event_index\":1785143466057}","local_time_ms":1785142809303,"is_bav":1,"session_id":"c44934b3-ed34-4f1c-a5
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_pageview","params":"{\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"url_path\":\"/\",\"time\":1785142809385,\"referrer\":\"\",\"$is_first_time\":\"false\",\"event_index\":1785143466061}","local_time_ms":1785142809385,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header":{"app_id":1988,"os_name":"windows","os_version":"10","device_model":"W
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_execute","params":"{\"status\":\"IN_PROGRESS\",\"stepName\":\"LOAD_DATA_START\",\"event_index\":1785143466069}","local_time_ms":1785142809523,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"},{"event":"pns_communication_service_execute","params":"{\"status\":\"START\",\"event_index\":1785143466068}","local_time_ms":1785142809523,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"}],"user":{"user_unique_id":"7661953835623237
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"page_ready","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":1553,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76030
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":1692,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_pageview","params":"{\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"url_path\":\"/\",\"time\":1785142809821,\"referrer\":\"\",\"$is_first_time\":\"false\",\"event_index\":1785143466076}","local_time_ms":1785142809821,"is_bav":0,"session_id":"e3124b9b-4d0e-4f3d-b80b-a3191749310f"}],"user":{"user_unique_id":"7661964440841831944","web_id":"7661964440841831944"},"header":{"app_id":594856,"os_name":"windows","os_version":"10","device_model":
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_execute","params":"{\"status\":\"FINISH\",\"event_index\":1785143466078}","local_time_ms":1785142809828,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"},{"event":"pns_communication_service_execute","params":"{\"status\":\"IN_PROGRESS\",\"stepName\":\"LOAD_DATA_FINISH\",\"event_index\":1785143466077}","local_time_ms":1785142809827,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"}],"user":{"user_unique_id":"76619538356232
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"__bav_beat","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"beat_type\":3,\"page_key\":\"https://www.tiktok.com/\",\"is_html\":1,\"page_title\":\"TikTok - Make Your Day\",\"page_manual_key\":\"\",\"page_viewport_width\":1280,\"page_viewport_height\":720,\"page_total_width\":1280,\"page_total_height\":720,\"scroll_width\":1280,\"scroll_height\":720,\"since_page_start_ms\":1766,\"page_start_ms\":1785142808073,\"event_index\":1785143466079}","local_
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"slardar_perf_ttfb","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":1817,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,7589959
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"inference_trigger","params":"{\"page_name\":\"launcher\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":1867,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"first_screen_video","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":2263,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,758995
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"video_play","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":2327,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76030
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=cdn_replace_service_worker`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"ttapplugin_info","type":"event","metrics":{"registerDuration":31,"navigationStartTime":1785142808073,"appParseStart":1100},"categories":{"version":"2.0.0"}},"common":{"bid":"cdn_replace_service_worker","user_id":"cb6e4957-7a1a-4b37-a481-044660c7315d","device_id":"9bde90ea-9794-4e3d-85d3-cd0403e42c73","session_id":"90cf0c3e-9eb2-4af9-a37c-258af1d3f378","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":1785
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"show_footer_view","params":"{\"page_name\":\"https://www.tiktok.com/\",\"enter_from\":\"https://www.tiktok.com/\",\"host\":\"www.tiktok.com\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"referrer\":\"\",\"lang\":\"en\",\"country_code\":\"ID\",\"event_index\":1785143466100}","local_time_ms":1785142810815,"is_bav":1,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"},{"event":"first_frame
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"pageview","payload":{"pid":"homepage_hot","source":"init"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"fa88fcdf-f691-4bbf-90d4-eb16acd90332","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142809274,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"homepage_hot","view_id":"homepage_hot_1785142809274","context":{"region":"ID
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":2819,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":2996,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"cookie_banner_cdn_load","params":"{\"page_url\":\"https://www.tiktok.com/\",\"host\":\"www.tiktok.com\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"referrer\":\"https://www.tiktok.com/\",\"loader_version\":\"1.0.5\",\"resource_url\":\"https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/pns/tiktok-cookie-banner/1.0.0.285/default.esm.js\",\"event_index\":178514346
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=pns_communication_service`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"resource_error","payload":{"type":"script","url":"https://sf16-website-login.neutral.ttwstatic.com/slardar/fe/sdk-web/plugins/common-monitors.1.16.7.js","timing":{"name":"https://sf16-website-login.neutral.ttwstatic.com/slardar/fe/sdk-web/plugins/common-monitors.1.16.7.js","entryType":"resource","startTime":1776.5,"duration":9,"initiatorType":"script","deliveryType":"cache","nextHopProtocol":"h2","renderBlockingStatus":"non-blocking","contentType":"applicat
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":3905,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=webmssdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"pageview","payload":{"pid":"/","source":"init"},"common":{"bid":"webmssdk","user_id":"e314afc9-3a1b-4f46-8da8-0bfca506b217","device_id":"3ff69dd2-0ad0-4b0d-a5aa-ba1a2ce69306","session_id":"05ddf73c-fd15-4962-b04c-6a8dc4c5004d","release":"1.0.0.388","env":"production","url":"https://www.tiktok.com/","timestamp":1785142809744,"sdk_version":"1.16.6","sdk_name":"SDK_SLARDAR_WEB","pid":"/","view_id":"/_1785142809744","context":{},"network_type":"4g","sample_rate
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":4548,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"content":"live_sdk_api_live_feed-TypeError-Cannot read properties of undefined (reading 'data')","type":"log","level":"error"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"fa88fcdf-f691-4bbf-90d4-eb16acd90332","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142811127,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"cookie_banner_load","params":"{\"locale\":\"en\",\"region\":\"ID\",\"js_version\":\"1.0.0.285\",\"tenant_id\":\"paas_tiktok\",\"page_url\":\"https://www.tiktok.com/\",\"host\":\"www.tiktok.com\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"referrer\":\"https://www.tiktok.com/\",\"event_index\":1785143011395}","local_time_ms":1785142812794,"is_bav":0,"session_id":"0c2327e6-a0e6-4830-b942-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"consent_init_sdk","params":"{\"status\":\"FINISH\",\"event_index\":1785143005843}","local_time_ms":1785142812806,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"},{"event":"consent_init_sdk","params":"{\"status\":\"START\",\"event_index\":1785143005842}","local_time_ms":1785142812804,"is_bav":0,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header":{"app_id":1988,"os_name":"
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"onload","params":"{\"app_id\":1992,\"app_name\":\"\",\"sdk_version\":\"5.3.17\",\"sdk_type\":\"npm\",\"sdk_config\":{\"app_id\":1992,\"channel\":\"va\",\"channel_type\":\"tcpy\",\"log\":false,\"disable_auto_pv\":true,\"disable_webid\":true},\"sdk_desc\":\"TOC_OVERSEA\",\"url\":\"https://www.tiktok.com/\",\"is_setting\":false,\"enable_logsetting_params\":false,\"enable_logsetting_header_custom\":false}","local_time_ms":1785142812336}],"user":{"user_unique_id":"76619538356232
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=cdn_replace_service_worker`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"swRegister","type":"event","metrics":{"count":1},"categories":{"host":"www.tiktok.com"}},"common":{"bid":"cdn_replace_service_worker","user_id":"cb6e4957-7a1a-4b37-a481-044660c7315d","device_id":"9bde90ea-9794-4e3d-85d3-cd0403e42c73","session_id":"90cf0c3e-9eb2-4af9-a37c-258af1d3f378","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":1785142811733,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"video_receive","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5133,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"tt_ticket_guard_web_get_storage","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_platform\":\"web\",\"init_type\":\"pubKey\",\"sign_type\":\"pubKey\",\"params_for_special\":\"tiktok_account_login\",\"key\":\"s_sdk_crypt_sdk,s_sdk_cert_key,s_sdk_sign_data_key/tt_fetch\",\"storage_type\":\"local\",\"duration\":753,\"event_index\":1785143466135}","local_time_ms":1785142813086,"is_bav":0,"session_id":"64039241-1597-4b0e-8021-5bdce7f2d7c7"}],"user":{"user_unique
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"load_more","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5138,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,760307
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=webmssdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"exLoadStatus","type":"event","metrics":{"count":1},"categories":{"status":"3","page":"https://www.tiktok.com/","scmVersion":"1.0.0.388","sdkVersion":"5.3.1"}},"common":{"bid":"webmssdk","user_id":"e314afc9-3a1b-4f46-8da8-0bfca506b217","device_id":"3ff69dd2-0ad0-4b0d-a5aa-ba1a2ce69306","session_id":"05ddf73c-fd15-4962-b04c-6a8dc4c5004d","release":"1.0.0.388","env":"production","url":"https://www.tiktok.com/","timestamp":17851428123
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5452,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5984,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"pns_cuj","type":"event","metrics":{"timestamp":1785142813489,"duration":992,"status_code":0},"categories":{"status_msg":"","name":"digital_wellbeing_api","method":"get","url":"/tiktok/v1/screen_time/list/","queryOrBody":"{\"count\":1,\"date\":20661}","enter_from":"today_usage"}},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"fa88fcdf-f691-4bbf-90d4-e
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"lcp","value":1412,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf","extra":{"element":"div.css-1umd7qg-7937d88b--DivContainer.e1sq7r4z0 > div.css-16s6atg-7937d88b--Box.etuqjjj0 > span > picture > img[alt=\"Patah hati sepatah patahnya😭\"]"}},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"fa88fcdf-f691-4bbf-90d4
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"inp","value":0,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"fa88fcdf-f691-4bbf-90d4-eb16acd90332","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142814476,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"ho
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"cls","value":0.009734680740921585,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf","extra":{"element":"#one-column-item-0 > div.css-1gp40pd-7937d88b--DivContentFlexLayout.ehcbpkw2 > #media-card-0 > div.css-bfblgq-7937d88b--BasePlayerContainer-7937d88b--DivVideoPlayerContainer.e1gen9l33 > div.css-3rm8q2-7937d88b--DivMediaCardOverlay.e1vama6v0"}},"common":{"bid":"tiktok_webapp","user_id":"766
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"slardar_perf_lcp","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":6400,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_page_alive","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"url_path\":\"/\",\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"duration\":5239,\"is_support_visibility_change\":1,\"startTime\":1785142809288,\"hidden\":\"visible\",\"leave\":true,\"mode\":\"normal\",\"focusState\":true,\"event_index\":1785143466150}","local_time_ms":1785142814528,"is_bav":1,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"}],"use
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_page_close","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"url_path\":\"/\",\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"active_times\":1,\"duration\":5242,\"total_duration\":5242,\"is_support_visibility_change\":1,\"mode\":\"normal\",\"focusState\":true,\"event_index\":1785143466151}","local_time_ms":1785142814536,"is_bav":1,"session_id":"c44934b3-ed34-4f1c-a58e-1876c5de87aa"}],"user":{"user_unique_id":"7
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"videoplayer_oneplay","params":"{\"local_time\":1785142814564,\"player_sessionid\":\"5b8b44f1-b0f8-4969-a6d6-0144bec8d090\",\"sdk_version\":\"0.4.8\",\"pc\":\"0.4.8\",\"pv\":\"0.4.8\",\"sv\":\"0.4.8\",\"line_app_id\":1988,\"line_user_id\":\"7661953835623237138\",\"app_version\":\"\",\"platform\":\"pc\",\"cpu_core\":12,\"memory_size\":16,\"support\":11100,\"absdkVersion\":\",70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76030701,76035889,76055827,760
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=webmssdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"multiWebMssdkSamePage","type":"event","metrics":{"count":1},"categories":{"versions":"[\"https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/webmssdk/1.0.0.388/webmssdk.js\"]","page":"https://www.tiktok.com/","scmVersion":"1.0.0.388","sdkVersion":"5.3.1"}},"common":{"bid":"webmssdk","user_id":"e314afc9-3a1b-4f46-8da8-0bfca506b217","device_id":"3ff69dd2-0ad0-4b0d-a5aa-ba1a2ce69306","session_id":"05ddf73c-fd
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"__bav_beat","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"beat_type\":0,\"page_key\":\"https://www.tiktok.com/\",\"is_html\":1,\"page_title\":\"TikTok - Make Your Day\",\"page_manual_key\":\"\",\"page_viewport_width\":1280,\"page_viewport_height\":720,\"page_total_width\":1280,\"page_total_height\":720,\"scroll_width\":1280,\"scroll_height\":720,\"since_page_start_ms\":6516,\"page_start_ms\":1785142808073,\"event_index\":1785143466156}","local_
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=ucenter_tiktok_zti_sdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"tt_ticket_guard_sdk_init","type":"event","categories":{"success":"success","region":"va","remote":"false"}},"common":{"bid":"ucenter_tiktok_zti_sdk","user_id":"7661953835623237138","device_id":"05aff4e2-df93-4f91-84cf-b22d572af18b","session_id":"83a9d637-1ec0-4d4d-86d7-77d41f041363","release":"","env":"online","url":"https://www.tiktok.com/","timestamp":1785142812329,"sdk_version":"1.12.4","sdk_name":"SDK_SLARDAR_WEB","pid":"www.t
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=pns_cookie_banner_slardar`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"pns_cuj","type":"event","metrics":{"timestamp":4720.300000000047,"duration":0},"categories":{"status":"START","name":"load_cookie_banner","stepName":"FINISH","error":"","detail":"","appId":"1988","appVersion":"1.0.0.285","tenant":"paas_tiktok"}},"common":{"bid":"pns_cookie_banner_slardar","user_id":"410fe6c4-c2ac-4dff-9036-5997e76a42f6","device_id":"b6953e27-0a48-4d8c-bc2f-9f9c2eecb814","session_id":"b3cb4751-b037-4122-9fbf-c7c1ba
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp_vmok`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"remote_load_start","type":"event","categories":{"commit_hash":"dynamic"}},"common":{"bid":"tiktok_webapp_vmok","user_id":"2742326d-97fb-4d8f-a15b-fb2fcc05e074","device_id":"c9017e33-2532-44a9-a83b-e25a3f447ec4","session_id":"d2140b91-7631-40a9-859f-7939f731ec8b","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":1785142814027,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"","view_id":"_17851428
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp_vmok`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"remote_load_success","type":"event","categories":{"version":"1.0.0.567"}},"common":{"bid":"tiktok_webapp_vmok","user_id":"2742326d-97fb-4d8f-a15b-fb2fcc05e074","device_id":"c9017e33-2532-44a9-a83b-e25a3f447ec4","session_id":"d2140b91-7631-40a9-859f-7939f731ec8b","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":1785142814027,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"","view_id":"_17851428
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp_vmok`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"pageview","payload":{"pid":"@webapp-shared/login-vmok","source":"user_set"},"common":{"bid":"tiktok_webapp_vmok","user_id":"2742326d-97fb-4d8f-a15b-fb2fcc05e074","device_id":"c9017e33-2532-44a9-a83b-e25a3f447ec4","session_id":"d2140b91-7631-40a9-859f-7939f731ec8b","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":1785142814032,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"@webapp-shared/login-vmok","view_id":"@webapp-s
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp_vmok`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"ttapplugin_info","type":"event","metrics":{"registerDuration":13,"navigationStartTime":1785142808073,"appParseStart":1100},"categories":{"version":"2.0.0"}},"common":{"bid":"tiktok_webapp_vmok","user_id":"2742326d-97fb-4d8f-a15b-fb2fcc05e074","device_id":"c9017e33-2532-44a9-a83b-e25a3f447ec4","session_id":"d2140b91-7631-40a9-859f-7939f731ec8b","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":178514281413
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"close_window","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":6497,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,760
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"im_ws_connect","type":"event","metrics":{"count":1,"ws_cost":1119.89990234375},"categories":{"ws_scene":"init","error_code":"0","url":"wss://im-ws-sg.tiktok.com/ws/v2","sdk_version":"1.7.0","sdk_type":"im-web-sdk","build_number":"3035f17:feat/call-trace-plugin","app_id":"1459"}},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"fa88fcdf-f691-4bbf-90d4-e
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"im_init_success","type":"event","metrics":{"count":1,"duration":2374},"categories":{"use_db":"false","sdk_version":"1.7.0","sdk_type":"im-web-sdk","build_number":"3035f17:feat/call-trace-plugin","app_id":"1459"}},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"fa88fcdf-f691-4bbf-90d4-eb16acd90332","release":"1.5.0.6187","env":"production","url":"https
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-QXdfzB7zANf3xm9dQ752AQ' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"require-trusted-types-for","effective-directive":"require-trusted-types-for","original-policy":"require-trusted-types-for 'script';report-uri /_/OneGoogleWidgetUi/cspreport","disposition":"enforce","blocked-uri":"trusted-types-sink","line-number":1832,"col
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-QXdfzB7zANf3xm9dQ752AQ' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 149
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-QXdfzB7zANf3xm9dQ752AQ' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"feed_top_cache","params":"{\"time_from_origin\":2180,\"valid\":9,\"event_index\":1785143014097}","local_time_ms":1785142611701,"is_bav":1,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"},{"event":"request_device_score_time","params":"{\"time_from_origin\":2159,\"duration\":1,\"type\":\"total\",\"page_name\":\"homepage_hot\",\"event_index\":1785143014096}","local_time_ms":1785142611701,"is_bav":1,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"},{"event":"arm_render_f
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_pageview","params":"{\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"url_path\":\"/\",\"time\":1785142611851,\"referrer\":\"https://www.tiktok.com/\",\"$is_first_time\":\"false\",\"event_index\":1785143014100}","local_time_ms":1785142611851,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header":{"app_id":1988,"os_name":"windows","os_version"
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"portrait_hub_init","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":2618,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,7589959
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_execute","params":"{\"status\":\"IN_PROGRESS\",\"stepName\":\"LOAD_DATA_START\",\"event_index\":1785143014108}","local_time_ms":1785142612139,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"},{"event":"pns_communication_service_execute","params":"{\"status\":\"START\",\"event_index\":1785143014107}","local_time_ms":1785142612138,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"}],"user":{"user_unique_id":"7661953835623237
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_execute","params":"{\"status\":\"FINISH\",\"event_index\":1785143014112}","local_time_ms":1785142612411,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"},{"event":"pns_communication_service_execute","params":"{\"status\":\"IN_PROGRESS\",\"stepName\":\"LOAD_DATA_FINISH\",\"event_index\":1785143014111}","local_time_ms":1785142612410,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"}],"user":{"user_unique_id":"76619538356232
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_pageview","params":"{\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"url_path\":\"/\",\"time\":1785142612552,\"referrer\":\"https://www.tiktok.com/\",\"$is_first_time\":\"false\",\"event_index\":1785143014114}","local_time_ms":1785142612552,"is_bav":0,"session_id":"2a81a0b6-8f36-405d-a302-7af41a4b9709"}],"user":{"user_unique_id":"7661964440841831944","web_id":"7661964440841831944"},"header":{"app_id":594856,"os_name":"windows","os_versio
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":3070,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"__bav_beat","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"beat_type\":3,\"page_key\":\"https://www.tiktok.com/\",\"is_html\":1,\"page_title\":\"TikTok - Make Your Day\",\"page_manual_key\":\"\",\"page_viewport_width\":1280,\"page_viewport_height\":720,\"page_total_width\":1280,\"page_total_height\":720,\"scroll_width\":1280,\"scroll_height\":720,\"since_page_start_ms\":3251,\"page_start_ms\":1785142609512,\"event_index\":1785143014118}","local_
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"slardar_perf_ttfb","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":3333,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,7589959
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"first_screen_video","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":3671,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,758995
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"video_play","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":3980,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76030
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"inference_trigger","params":"{\"page_name\":\"launcher\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":4077,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"first_frame_video","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":4202,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,7589959
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=cdn_replace_service_worker`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"ttapplugin_info","type":"event","metrics":{"registerDuration":91,"navigationStartTime":1785142609512,"appParseStart":1894},"categories":{"version":"2.0.0"}},"common":{"bid":"cdn_replace_service_worker","user_id":"cb6e4957-7a1a-4b37-a481-044660c7315d","device_id":"9bde90ea-9794-4e3d-85d3-cd0403e42c73","session_id":"0790f2b1-c2ad-4b2e-aabf-a87b7f6c446c","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":1785
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5860,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"cookie_banner_cdn_load","params":"{\"page_url\":\"https://www.tiktok.com/\",\"host\":\"www.tiktok.com\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"referrer\":\"https://www.tiktok.com/\",\"loader_version\":\"1.0.5\",\"resource_url\":\"https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/pns/tiktok-cookie-banner/1.0.0.285/default.esm.js\",\"event_index\":178514301
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":6966,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":7156,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":7924,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=webmssdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"pageview","payload":{"pid":"/","source":"init"},"common":{"bid":"webmssdk","user_id":"e314afc9-3a1b-4f46-8da8-0bfca506b217","device_id":"3ff69dd2-0ad0-4b0d-a5aa-ba1a2ce69306","session_id":"8634d4a8-3150-4612-b746-6b2a7ebee82e","release":"1.0.0.388","env":"production","url":"https://www.tiktok.com/","timestamp":1785142612536,"sdk_version":"1.16.6","sdk_name":"SDK_SLARDAR_WEB","pid":"/","view_id":"/_1785142612536","context":{},"network_type":"4g","sample_rate
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"cookie_banner_load","params":"{\"locale\":\"en\",\"region\":\"ID\",\"js_version\":\"1.0.0.285\",\"tenant_id\":\"paas_tiktok\",\"page_url\":\"https://www.tiktok.com/\",\"host\":\"www.tiktok.com\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"referrer\":\"https://www.tiktok.com/\",\"event_index\":1785142871896}","local_time_ms":1785142617845,"is_bav":0,"session_id":"953acc14-d5fb-4273-89cc-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"consent_init_sdk","params":"{\"status\":\"FINISH\",\"event_index\":1785142902020}","local_time_ms":1785142617865,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"},{"event":"consent_init_sdk","params":"{\"status\":\"START\",\"event_index\":1785142902019}","local_time_ms":1785142617862,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header":{"app_id":1988,"os_name":"
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":8588,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"onload","params":"{\"app_id\":1992,\"app_name\":\"\",\"sdk_version\":\"5.3.17\",\"sdk_type\":\"npm\",\"sdk_config\":{\"app_id\":1992,\"channel\":\"va\",\"channel_type\":\"tcpy\",\"log\":false,\"disable_auto_pv\":true,\"disable_webid\":true},\"sdk_desc\":\"TOC_OVERSEA\",\"url\":\"https://www.tiktok.com/\",\"is_setting\":false,\"enable_logsetting_params\":false,\"enable_logsetting_header_custom\":false}","local_time_ms":1785142617593}],"user":{"user_unique_id":"76619538356232
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":8964,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"tt_ticket_guard_web_get_storage","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_platform\":\"web\",\"init_type\":\"pubKey\",\"sign_type\":\"pubKey\",\"params_for_special\":\"tiktok_account_login\",\"key\":\"s_sdk_crypt_sdk,s_sdk_cert_key,s_sdk_sign_data_key/tt_fetch\",\"storage_type\":\"local\",\"duration\":1141,\"event_index\":1785143014187}","local_time_ms":1785142618731,"is_bav":0,"session_id":"cac3c5ca-8288-4e2d-8ad9-2d142582c32c"}],"user":{"user_uniqu
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":9234,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"content":"live_sdk_api_live_feed-TypeError-Cannot read properties of undefined (reading 'data')","type":"log","level":"error"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"3b4842fa-c961-47a0-903c-fcc7a150ab12","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142617616,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=webmssdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"exLoadStatus","type":"event","metrics":{"count":1},"categories":{"status":"3","page":"https://www.tiktok.com/","scmVersion":"1.0.0.388","sdkVersion":"5.3.1"}},"common":{"bid":"webmssdk","user_id":"e314afc9-3a1b-4f46-8da8-0bfca506b217","device_id":"3ff69dd2-0ad0-4b0d-a5aa-ba1a2ce69306","session_id":"8634d4a8-3150-4612-b746-6b2a7ebee82e","release":"1.0.0.388","env":"production","url":"https://www.tiktok.com/","timestamp":17851426176
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=ucenter_tiktok_zti_sdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"tt_ticket_guard_sdk_init","type":"event","categories":{"success":"success","region":"va","remote":"false"}},"common":{"bid":"ucenter_tiktok_zti_sdk","user_id":"7661953835623237138","device_id":"05aff4e2-df93-4f91-84cf-b22d572af18b","session_id":"c9bb0ac9-ac5d-40d8-83a2-90f3e009dcec","release":"","env":"online","url":"https://www.tiktok.com/","timestamp":1785142617583,"sdk_version":"1.12.4","sdk_name":"SDK_SLARDAR_WEB","pid":"www.t
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":12962,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,760
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"tt_ticket_guard_web_sign","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_platform\":\"web\",\"init_type\":\"pubKey\",\"sign_type\":\"pubKey\",\"params_for_special\":\"tiktok_account_login\",\"type\":\"crypto\",\"duration\":2,\"event_index\":1785143014193}","local_time_ms":1785142622761,"is_bav":0,"session_id":"cac3c5ca-8288-4e2d-8ad9-2d142582c32c"},{"event":"tt_ticket_guard_web_get_storage","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_p
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"tt_ticket_guard_web_performance","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_platform\":\"web\",\"init_type\":\"pubKey\",\"sign_type\":\"pubKey\",\"params_for_special\":\"tiktok_account_login\",\"type\":\"crypto\",\"store_type\":\"local\",\"path\":\"https://www.tiktok.com/passport/web/account/info/?WebIdLastTime=1783937646&aid=1459&app_language=en&app_name=tiktok_web&browser_language=en-US&browser_name=Mozilla&browser_online=true&browser_platform=Win32&
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=pns_cookie_banner_slardar`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"pns_cuj","type":"event","metrics":{"timestamp":8332,"duration":0},"categories":{"status":"START","name":"load_cookie_banner","stepName":"FINISH","error":"","detail":"","appId":"1988","appVersion":"1.0.0.285","tenant":"paas_tiktok"}},"common":{"bid":"pns_cookie_banner_slardar","user_id":"410fe6c4-c2ac-4dff-9036-5997e76a42f6","device_id":"b6953e27-0a48-4d8c-bc2f-9f9c2eecb814","session_id":"93dd9aa5-2bf2-4833-bbe3-d354e88bef2e","rele
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":13666,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,760
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":13976,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,760
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=webmssdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"multiWebMssdkSamePage","type":"event","metrics":{"count":1},"categories":{"versions":"[\"https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/webmssdk/1.0.0.388/webmssdk.js\"]","page":"https://www.tiktok.com/","scmVersion":"1.0.0.388","sdkVersion":"5.3.1"}},"common":{"bid":"webmssdk","user_id":"e314afc9-3a1b-4f46-8da8-0bfca506b217","device_id":"3ff69dd2-0ad0-4b0d-a5aa-ba1a2ce69306","session_id":"8634d4a8-31
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=ucenter_tiktok_zti_sdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"tt_ticket_guard_web_get_storage","type":"event","metrics":{"duration":472},"categories":{"key":"s_sdk_crypt_sdk,s_sdk_cert_key,s_sdk_sign_data_key/tt_fetch","storage_type":"local"}},"common":{"bid":"ucenter_tiktok_zti_sdk","user_id":"7661953835623237138","device_id":"05aff4e2-df93-4f91-84cf-b22d572af18b","session_id":"c9bb0ac9-ac5d-40d8-83a2-90f3e009dcec","release":"","env":"online","url":"https://www.tiktok.com/","timestamp":1785
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"pns_cuj","type":"event","metrics":{"timestamp":1785142622472,"duration":5140,"status_code":0},"categories":{"status_msg":"","name":"digital_wellbeing_api","method":"post","url":"/tiktok/v1/app_open_times/upload/","queryOrBody":"{\"upload_timestamp\":1785142617,\"upload_type\":1,\"app_open_times\":[{\"upload_date\":20661,\"day_open_times\":1,\"night_open_times\":0}]}","enter_from":"initial"}},"common":{"bid":"tiktok_webapp","user_i
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"mdl_video_preload","params":"{\"sdk_version\":\"0.4.8\",\"pc\":\"0.4.8\",\"pv\":\"0.4.8\",\"sv\":\"0.4.8\",\"line_app_id\":1988,\"line_user_id\":\"7661953835623237138\",\"app_version\":\"\",\"platform\":\"pc\",\"cpu_core\":12,\"memory_size\":16,\"support\":11100,\"absdkVersion\":\",70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76030701,76035889,76055827,76074397,76124481,76146380,76179550,76251108,76314875,76362328,76378881,76388334,76403724,764037
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp_vmok`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"remote_load_start","type":"event","categories":{"commit_hash":"dynamic"}},"common":{"bid":"tiktok_webapp_vmok","user_id":"2742326d-97fb-4d8f-a15b-fb2fcc05e074","device_id":"c9017e33-2532-44a9-a83b-e25a3f447ec4","session_id":"48257e34-75bc-49c2-a097-aee96d39dee0","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":1785142623432,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"","view_id":"_17851426
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"mdl_video_preload","params":"{\"sdk_version\":\"0.4.8\",\"pc\":\"0.4.8\",\"pv\":\"0.4.8\",\"sv\":\"0.4.8\",\"line_app_id\":1988,\"line_user_id\":\"7661953835623237138\",\"app_version\":\"\",\"platform\":\"pc\",\"cpu_core\":12,\"memory_size\":16,\"support\":11100,\"absdkVersion\":\",70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76030701,76035889,76055827,76074397,76124481,76146380,76179550,76251108,76314875,76362328,76378881,76388334,76403724,764037
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"mdl_video_preload","params":"{\"sdk_version\":\"0.4.8\",\"pc\":\"0.4.8\",\"pv\":\"0.4.8\",\"sv\":\"0.4.8\",\"line_app_id\":1988,\"line_user_id\":\"7661953835623237138\",\"app_version\":\"\",\"platform\":\"pc\",\"cpu_core\":12,\"memory_size\":16,\"support\":11100,\"absdkVersion\":\",70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76030701,76035889,76055827,76074397,76124481,76146380,76179550,76251108,76314875,76362328,76378881,76388334,76403724,764037
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"mdl_video_preload","params":"{\"sdk_version\":\"0.4.8\",\"pc\":\"0.4.8\",\"pv\":\"0.4.8\",\"sv\":\"0.4.8\",\"line_app_id\":1988,\"line_user_id\":\"7661953835623237138\",\"app_version\":\"\",\"platform\":\"pc\",\"cpu_core\":12,\"memory_size\":16,\"support\":11100,\"absdkVersion\":\",70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76030701,76035889,76055827,76074397,76124481,76146380,76179550,76251108,76314875,76362328,76378881,76388334,76403724,764037
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":18938,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,760
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"video_play_finish","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":19901,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,758995
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"lcp","value":2784,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf","extra":{"element":"div.css-16s6atg-7937d88b--Box.etuqjjj0 > span > picture > img[alt=\"kenapa yak 🥱=>🥺 #jjmykisah😹🤭🤭 #jjelistis #jjwiner🤭 #relateable #jjmykisah #trending #xybca #forreal #fyp #jjluser #jjconfident #foryoupage\"]"}},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-45
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"inp","value":0,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"3b4842fa-c961-47a0-903c-fcc7a150ab12","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142631380,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"ho
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"cls","value":0.008830073038736978,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf","extra":{"element":"#one-column-item-0 > div.css-1gp40pd-7937d88b--DivContentFlexLayout.ehcbpkw2 > #media-card-0 > div.css-bfblgq-7937d88b--BasePlayerContainer-7937d88b--DivVideoPlayerContainer.e1gen9l33 > div.css-3rm8q2-7937d88b--DivMediaCardOverlay.e1vama6v0"}},"common":{"bid":"tiktok_webapp","user_id":"766
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"slardar_perf_lcp","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":21866,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,7589959
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_page_alive","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"url_path\":\"/\",\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"duration\":19707,\"is_support_visibility_change\":1,\"startTime\":1785142611678,\"hidden\":\"visible\",\"leave\":true,\"mode\":\"normal\",\"focusState\":true,\"event_index\":1785143014210}","local_time_ms":1785142631385,"is_bav":1,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"}],"us
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_page_close","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"url_path\":\"/\",\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"active_times\":1,\"duration\":19709,\"total_duration\":19709,\"is_support_visibility_change\":1,\"mode\":\"normal\",\"focusState\":true,\"event_index\":1785143014211}","local_time_ms":1785142631387,"is_bav":1,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"}],"user":{"user_unique_id":
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"videoplayer_oneplay","params":"{\"local_time\":1785142631393,\"player_sessionid\":\"53c1b01c-ab9a-4ac0-9299-85f0d3165693\",\"sdk_version\":\"0.4.8\",\"pc\":\"0.4.8\",\"pv\":\"0.4.8\",\"sv\":\"0.4.8\",\"line_app_id\":1988,\"line_user_id\":\"7661953835623237138\",\"app_version\":\"\",\"platform\":\"pc\",\"cpu_core\":12,\"memory_size\":16,\"support\":11100,\"absdkVersion\":\",70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76030701,76035889,76055827,760
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"__bav_beat","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"beat_type\":0,\"page_key\":\"https://www.tiktok.com/\",\"is_html\":1,\"page_title\":\"TikTok - Make Your Day\",\"page_manual_key\":\"\",\"page_viewport_width\":1280,\"page_viewport_height\":720,\"page_total_width\":1280,\"page_total_height\":720,\"scroll_width\":1280,\"scroll_height\":720,\"since_page_start_ms\":21893,\"page_start_ms\":1785142609512,\"event_index\":1785143014216}","local
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"close_window","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":21887,\"is_landing_page\":1,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-MktvtOLE0V0LcyeMrD9tDA' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-MktvtOLE0V0LcyeMrD9tDA' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-s08gUI13MThdhHhpDjPFng' 'unsafe-inline';object-src 'none';base-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-s08gUI13MThdhHhpDjPFng' 'unsafe-inline';object-src 'none';base-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `lnkd.demdex.net`
- **URL:** `https://lnkd.demdex.net/event?d_dil_ver=9.4&_ts=1785142697789`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
d_mid=90077121775993806112115099951483039736&d_nsid=0&d_cid_ic=lnkdidsync%01ASpva964bzZE1X-xhNpOO-upwfYn%26v%3D2%011&d_cid_ic=thirdpartyid%01ASpva964bzZE1X-xhNpOO-upwfYn%26v%3D2%011&d_cid_ic=lnkd_member_id%01ASpva964bzZE1X-xhNpOO-upwfYn%26v%3D2%011&d_ld=_ts%3D1785142697789&d_rtbd=json&d_jsonv=1&d_dst=1&c_page_name=%2Ffeed%2F&c_page_key=d_flagship3_feed&h_referer=https%3A%2F%2Fwww.linkedin.com%2Ffeed%2F
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"__bav_page","params":"{\"is_html\":1,\"url\":\"https://www.tiktok.com/\",\"referrer\":\"\",\"page_key\":\"https://www.tiktok.com/\",\"refer_page_key\":\"\",\"page_title\":\"TikTok - Make Your Day\",\"page_manual_key\":\"\",\"refer_page_manual_key\":\"\",\"refer_page_title\":\"TikTok - Make Your Day\",\"page_path\":\"/\",\"page_host\":\"www.tiktok.com\",\"is_first_time\":\"false\",\"is_back\":0,\"page_total_width\":1280,\"page_total_height\":720,\"refer_page_duration_ms\":19
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?bid=tiktok_pns_web_runtime`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"http","payload":{"api":"xhr","request":{"method":"get","url":"https://cost_time","timestamp":1785142719148,"body":"{\"version\":\"1.0.0.951\",\"runtime_env\":\"out_app\",\"module\":\"loader\",\"__business__\":\"serverless.tiktok.desktop\"}"},"response":{"status":200,"is_custom_error":false,"timestamp":1785142719148},"duration":0,"extra":{"time":"5"}},"common":{"bid":"tiktok_pns_web_runtime","user_id":"66dd6171-a597-42bb-9200-ca9dad7ef48f","release":"1.0.0.9
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_init","params":"{\"status\":\"FINISH\",\"event_index\":1785142943408}","local_time_ms":1785142719871,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"},{"event":"pns_communication_service_init","params":"{\"status\":\"START\",\"event_index\":1785142943407}","local_time_ms":1785142719869,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"feed_top_cache","params":"{\"time_from_origin\":1320,\"valid\":9,\"event_index\":1785142943406}","local_time_ms":1785142719818,"is_bav":1,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"},{"event":"recommend_empty_play_addr_item","params":"{\"time_from_origin\":1319,\"count\":2,\"item_list_key\":\"foryou\",\"page_name\":\"\",\"response_count\":3,\"remain_count\":1,\"event_index\":1785142943405}","local_time_ms":1785142719818,"is_bav":1,"session_id":"36cf1a0d-1f13-42cf-be
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_pageview","params":"{\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"url_path\":\"/\",\"time\":1785142719884,\"referrer\":\"\",\"$is_first_time\":\"false\",\"event_index\":1785142943409}","local_time_ms":1785142719884,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header":{"app_id":1988,"os_name":"windows","os_version":"10","device_model":"W
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"portrait_hub_init","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":1528,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,7589959
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_execute","params":"{\"status\":\"IN_PROGRESS\",\"stepName\":\"LOAD_DATA_START\",\"event_index\":1785142943418}","local_time_ms":1785142720026,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"},{"event":"pns_communication_service_execute","params":"{\"status\":\"START\",\"event_index\":1785142943417}","local_time_ms":1785142720026,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"}],"user":{"user_unique_id":"7661953835623237
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"video_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":1791,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_execute","params":"{\"status\":\"FINISH\",\"event_index\":1785142943421}","local_time_ms":1785142720367,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"},{"event":"pns_communication_service_execute","params":"{\"status\":\"IN_PROGRESS\",\"stepName\":\"LOAD_DATA_FINISH\",\"event_index\":1785142943420}","local_time_ms":1785142720366,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"}],"user":{"user_unique_id":"76619538356232
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=cdn_replace_service_worker`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"ttapplugin_info","type":"event","metrics":{"registerDuration":30,"navigationStartTime":1785142718493,"appParseStart":1058},"categories":{"version":"2.0.0"}},"common":{"bid":"cdn_replace_service_worker","user_id":"cb6e4957-7a1a-4b37-a481-044660c7315d","device_id":"9bde90ea-9794-4e3d-85d3-cd0403e42c73","session_id":"bdad5fdf-76b6-48fd-9629-333d3e700884","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":1785
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":2640,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_pageview","params":"{\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"url_path\":\"/\",\"time\":1785142721200,\"referrer\":\"\",\"$is_first_time\":\"false\",\"event_index\":1785142943428}","local_time_ms":1785142721200,"is_bav":0,"session_id":"2a81a0b6-8f36-405d-a302-7af41a4b9709"}],"user":{"user_unique_id":"7661964440841831944","web_id":"7661964440841831944"},"header":{"app_id":594856,"os_name":"windows","os_version":"10","device_model":
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":3882,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":4039,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"pageview","payload":{"pid":"homepage_hot","source":"init"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"cdfa8dde-c931-470a-83d5-37da2701bdba","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142719797,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"homepage_hot","view_id":"homepage_hot_1785142719797","context":{"region":"ID
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":4193,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"cookie_banner_cdn_load","params":"{\"page_url\":\"https://www.tiktok.com/\",\"host\":\"www.tiktok.com\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"referrer\":\"https://www.tiktok.com/\",\"loader_version\":\"1.0.5\",\"resource_url\":\"https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/pns/tiktok-cookie-banner/1.0.0.285/default.esm.js\",\"event_index\":178514294
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"cookie_banner_load","params":"{\"locale\":\"en\",\"region\":\"ID\",\"js_version\":\"1.0.0.285\",\"tenant_id\":\"paas_tiktok\",\"page_url\":\"https://www.tiktok.com/\",\"host\":\"www.tiktok.com\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"referrer\":\"https://www.tiktok.com/\",\"event_index\":1785142781934}","local_time_ms":1785142723205,"is_bav":0,"session_id":"953acc14-d5fb-4273-89cc-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"consent_init_sdk","params":"{\"status\":\"FINISH\",\"event_index\":1785143371675}","local_time_ms":1785142723224,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"},{"event":"consent_init_sdk","params":"{\"status\":\"START\",\"event_index\":1785143371674}","local_time_ms":1785142723221,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header":{"app_id":1988,"os_name":"
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"onload","params":"{\"app_id\":1992,\"app_name\":\"\",\"sdk_version\":\"5.3.17\",\"sdk_type\":\"npm\",\"sdk_config\":{\"app_id\":1992,\"channel\":\"va\",\"channel_type\":\"tcpy\",\"log\":false,\"disable_auto_pv\":true,\"disable_webid\":true},\"sdk_desc\":\"TOC_OVERSEA\",\"url\":\"https://www.tiktok.com/\",\"is_setting\":false,\"enable_logsetting_params\":false,\"enable_logsetting_header_custom\":false}","local_time_ms":1785142722845}],"user":{"user_unique_id":"76619538356232
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=cdn_replace_service_worker`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"swRegister","type":"event","metrics":{"count":1},"categories":{"host":"www.tiktok.com"}},"common":{"bid":"cdn_replace_service_worker","user_id":"cb6e4957-7a1a-4b37-a481-044660c7315d","device_id":"9bde90ea-9794-4e3d-85d3-cd0403e42c73","session_id":"bdad5fdf-76b6-48fd-9629-333d3e700884","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":1785142721857,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":4947,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"tt_ticket_guard_web_get_storage","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_platform\":\"web\",\"init_type\":\"pubKey\",\"sign_type\":\"pubKey\",\"params_for_special\":\"tiktok_account_login\",\"key\":\"s_sdk_crypt_sdk,s_sdk_cert_key,s_sdk_sign_data_key/tt_fetch\",\"storage_type\":\"local\",\"duration\":675,\"event_index\":1785142943471}","local_time_ms":1785142723517,"is_bav":0,"session_id":"cac3c5ca-8288-4e2d-8ad9-2d142582c32c"}],"user":{"user_unique
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5140,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=webmssdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"pageview","payload":{"pid":"/","source":"init"},"common":{"bid":"webmssdk","user_id":"e314afc9-3a1b-4f46-8da8-0bfca506b217","device_id":"3ff69dd2-0ad0-4b0d-a5aa-ba1a2ce69306","session_id":"2d14f151-76b9-46f8-a4e0-a59d69986530","release":"1.0.0.388","env":"production","url":"https://www.tiktok.com/","timestamp":1785142721103,"sdk_version":"1.16.6","sdk_name":"SDK_SLARDAR_WEB","pid":"/","view_id":"/_1785142721102","context":{},"network_type":"4g","sample_rate
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"load_more","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5498,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,760307
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"slardar_perf_ttfb","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5791,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,7589959
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":6108,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":6322,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=ucenter_tiktok_zti_sdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"tt_ticket_guard_sdk_init","type":"event","categories":{"success":"success","region":"va","remote":"false"}},"common":{"bid":"ucenter_tiktok_zti_sdk","user_id":"7661953835623237138","device_id":"05aff4e2-df93-4f91-84cf-b22d572af18b","session_id":"76cdd288-6dcb-4cab-8ba4-19d0248d93cd","release":"","env":"online","url":"https://www.tiktok.com/","timestamp":1785142722834,"sdk_version":"1.12.4","sdk_name":"SDK_SLARDAR_WEB","pid":"www.t
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":6453,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=pns_cookie_banner_slardar`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"pns_cuj","type":"event","metrics":{"timestamp":4710,"duration":0},"categories":{"status":"START","name":"load_cookie_banner","stepName":"FINISH","error":"","detail":"","appId":"1988","appVersion":"1.0.0.285","tenant":"paas_tiktok"}},"common":{"bid":"pns_cookie_banner_slardar","user_id":"410fe6c4-c2ac-4dff-9036-5997e76a42f6","device_id":"b6953e27-0a48-4d8c-bc2f-9f9c2eecb814","session_id":"6239ef22-3bf6-4134-8bfa-a802451c33ae","rele
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp_vmok`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"remote_load_start","type":"event","categories":{"commit_hash":"dynamic"}},"common":{"bid":"tiktok_webapp_vmok","user_id":"2742326d-97fb-4d8f-a15b-fb2fcc05e074","device_id":"c9017e33-2532-44a9-a83b-e25a3f447ec4","session_id":"18c9057a-0909-4d8c-945f-aa6403297682","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":1785142724619,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"","view_id":"_17851427
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"content":"live_sdk_api_live_feed-TypeError-Cannot read properties of undefined (reading 'data')","type":"log","level":"error"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"cdfa8dde-c931-470a-83d5-37da2701bdba","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142723113,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=webmssdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"exLoadStatus","type":"event","metrics":{"count":1},"categories":{"status":"3","page":"https://www.tiktok.com/","scmVersion":"1.0.0.388","sdkVersion":"5.3.1"}},"common":{"bid":"webmssdk","user_id":"e314afc9-3a1b-4f46-8da8-0bfca506b217","device_id":"3ff69dd2-0ad0-4b0d-a5aa-ba1a2ce69306","session_id":"2d14f151-76b9-46f8-a4e0-a59d69986530","release":"1.0.0.388","env":"production","url":"https://www.tiktok.com/","timestamp":17851427239
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":9394,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"tt_ticket_guard_web_sign","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_platform\":\"web\",\"init_type\":\"pubKey\",\"sign_type\":\"pubKey\",\"params_for_special\":\"tiktok_account_login\",\"type\":\"crypto\",\"duration\":1,\"event_index\":1785142943497}","local_time_ms":1785142727907,"is_bav":0,"session_id":"cac3c5ca-8288-4e2d-8ad9-2d142582c32c"},{"event":"tt_ticket_guard_web_get_storage","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_p
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"tt_ticket_guard_web_performance","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_platform\":\"web\",\"init_type\":\"pubKey\",\"sign_type\":\"pubKey\",\"params_for_special\":\"tiktok_account_login\",\"type\":\"crypto\",\"store_type\":\"local\",\"path\":\"https://www.tiktok.com/passport/web/account/info/?WebIdLastTime=1783937646&aid=1459&app_language=en&app_name=tiktok_web&browser_language=en-US&browser_name=Mozilla&browser_online=true&browser_platform=Win32&
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=ucenter_tiktok_zti_sdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"tt_ticket_guard_web_get_storage","type":"event","metrics":{"duration":12},"categories":{"key":"s_sdk_crypt_sdk,s_sdk_cert_key,s_sdk_sign_data_key/tt_fetch","storage_type":"local"}},"common":{"bid":"ucenter_tiktok_zti_sdk","user_id":"7661953835623237138","device_id":"05aff4e2-df93-4f91-84cf-b22d572af18b","session_id":"76cdd288-6dcb-4cab-8ba4-19d0248d93cd","release":"","env":"online","url":"https://www.tiktok.com/","timestamp":17851
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"lcp","value":2528,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf","extra":{"element":"div.swiper-wrapper > div.swiper-slide.swiper-slide-active.swiper-slide-duplicate-next.swiper-slide-duplicate-prev > img.css-19otcmx-7937d88b--ImgPhotoSlide.extb1212"}},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"cdfa8dde-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"inp","value":0,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"cdfa8dde-c931-470a-83d5-37da2701bdba","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142729634,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"ho
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"cls","value":0.00486642305350598,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf","extra":{"element":"#one-column-item-0 > div.css-1gp40pd-7937d88b--DivContentFlexLayout.ehcbpkw2 > #media-card-0 > div.css-hlkp18-7937d88b--BasePlayerContainer-7937d88b--DivPhotoPlayerContainer.e1gen9l34 > div.css-3rm8q2-7937d88b--DivMediaCardOverlay.e1vama6v0"}},"common":{"bid":"tiktok_webapp","user_id":"7661
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"slardar_perf_lcp","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":11138,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,7589959
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_page_alive","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"url_path\":\"/\",\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"duration\":9831,\"is_support_visibility_change\":1,\"startTime\":1785142719807,\"hidden\":\"visible\",\"leave\":true,\"mode\":\"normal\",\"focusState\":true,\"event_index\":1785142943503}","local_time_ms":1785142729638,"is_bav":1,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"}],"use
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_page_close","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"url_path\":\"/\",\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"active_times\":1,\"duration\":9833,\"total_duration\":9833,\"is_support_visibility_change\":1,\"mode\":\"normal\",\"focusState\":true,\"event_index\":1785142943504}","local_time_ms":1785142729640,"is_bav":1,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"}],"user":{"user_unique_id":"7
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"__bav_beat","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"beat_type\":0,\"page_key\":\"https://www.tiktok.com/\",\"is_html\":1,\"page_title\":\"TikTok - Make Your Day\",\"page_manual_key\":\"\",\"page_viewport_width\":1280,\"page_viewport_height\":720,\"page_total_width\":1280,\"page_total_height\":720,\"scroll_width\":1280,\"scroll_height\":720,\"since_page_start_ms\":11175,\"page_start_ms\":1785142718493,\"event_index\":1785142943506}","local
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"close_window","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":11148,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-klvVtP3kklk3hIMlSH-G9Q' 'unsafe-inline';object-src 'none';base-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"require-trusted-types-for","effective-directive":"require-trusted-types-for","original-policy":"require-trusted-types-for 'script';report-uri /_/SocialPeopleHoverc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-klvVtP3kklk3hIMlSH-G9Q' 'unsafe-inline';object-src 'none';base-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-klvVtP3kklk3hIMlSH-G9Q' 'unsafe-inline';object-src 'none';base-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-o85Ph0PF4Wy1te7c9-5pAA' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"require-trusted-types-for","effective-directive":"require-trusted-types-for","original-policy":"require-trusted-types-for 'script';report-uri /_/OneGoogleWidgetUi/cspreport","disposition":"enforce","blocked-uri":"trusted-types-sink","line-number":1832,"col
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-o85Ph0PF4Wy1te7c9-5pAA' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-o85Ph0PF4Wy1te7c9-5pAA' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"__bav_page","params":"{\"is_html\":1,\"url\":\"https://www.tiktok.com/\",\"referrer\":\"\",\"page_key\":\"https://www.tiktok.com/\",\"refer_page_key\":\"\",\"page_title\":\"TikTok - Make Your Day\",\"page_manual_key\":\"\",\"refer_page_manual_key\":\"\",\"refer_page_title\":\"TikTok - Make Your Day\",\"page_path\":\"/\",\"page_host\":\"www.tiktok.com\",\"is_first_time\":\"false\",\"is_back\":0,\"page_total_width\":1280,\"page_total_height\":720,\"refer_page_duration_ms\":98
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?bid=tiktok_pns_web_runtime`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"http","payload":{"api":"xhr","request":{"method":"get","url":"https://cost_time","timestamp":1785142812048,"body":"{\"version\":\"1.0.0.951\",\"runtime_env\":\"out_app\",\"module\":\"loader\",\"__business__\":\"serverless.tiktok.desktop\"}"},"response":{"status":200,"is_custom_error":false,"timestamp":1785142812048},"duration":0,"extra":{"time":"5"}},"common":{"bid":"tiktok_pns_web_runtime","user_id":"66dd6171-a597-42bb-9200-ca9dad7ef48f","release":"1.0.0.9
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_init","params":"{\"status\":\"FINISH\",\"event_index\":1785143238346}","local_time_ms":1785142812411,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"},{"event":"pns_communication_service_init","params":"{\"status\":\"START\",\"event_index\":1785143238345}","local_time_ms":1785142812407,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"feed_top_cache","params":"{\"time_from_origin\":1312,\"valid\":9,\"event_index\":1785143238344}","local_time_ms":1785142812340,"is_bav":1,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"},{"event":"recommend_empty_play_addr_item","params":"{\"time_from_origin\":1310,\"count\":2,\"item_list_key\":\"foryou\",\"page_name\":\"\",\"response_count\":3,\"remain_count\":1,\"event_index\":1785143238343}","local_time_ms":1785142812340,"is_bav":1,"session_id":"36cf1a0d-1f13-42cf-be
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_pageview","params":"{\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"url_path\":\"/\",\"time\":1785142812445,\"referrer\":\"\",\"$is_first_time\":\"false\",\"event_index\":1785143238347}","local_time_ms":1785142812445,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header":{"app_id":1988,"os_name":"windows","os_version":"10","device_model":"W
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"portrait_hub_init","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":1620,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,7589959
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_execute","params":"{\"status\":\"IN_PROGRESS\",\"stepName\":\"LOAD_DATA_START\",\"event_index\":1785143238356}","local_time_ms":1785142812651,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"},{"event":"pns_communication_service_execute","params":"{\"status\":\"START\",\"event_index\":1785143238355}","local_time_ms":1785142812651,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"}],"user":{"user_unique_id":"7661953835623237
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"pns_communication_service_execute","params":"{\"status\":\"FINISH\",\"event_index\":1785143238359}","local_time_ms":1785142813030,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"},{"event":"pns_communication_service_execute","params":"{\"status\":\"IN_PROGRESS\",\"stepName\":\"LOAD_DATA_FINISH\",\"event_index\":1785143238358}","local_time_ms":1785142813030,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"}],"user":{"user_unique_id":"76619538356232
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"video_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":2020,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":2404,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_pageview","params":"{\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"url_path\":\"/\",\"time\":1785142813497,\"referrer\":\"\",\"$is_first_time\":\"false\",\"event_index\":1785143238365}","local_time_ms":1785142813497,"is_bav":0,"session_id":"2a81a0b6-8f36-405d-a302-7af41a4b9709"}],"user":{"user_unique_id":"7661964440841831944","web_id":"7661964440841831944"},"header":{"app_id":594856,"os_name":"windows","os_version":"10","device_model":
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=cdn_replace_service_worker`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"ttapplugin_info","type":"event","metrics":{"registerDuration":60,"navigationStartTime":1785142811023,"appParseStart":1187},"categories":{"version":"2.0.0"}},"common":{"bid":"cdn_replace_service_worker","user_id":"cb6e4957-7a1a-4b37-a481-044660c7315d","device_id":"9bde90ea-9794-4e3d-85d3-cd0403e42c73","session_id":"32a186c0-e4cd-42bd-95a8-6a5dba81cae9","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":1785
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"tns_remove_photosensitive_status","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":3355,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,7
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":3576,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"pageview","payload":{"pid":"homepage_hot","source":"init"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"59c37074-7524-4767-bd26-4a8e6a40dbe1","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142812314,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"homepage_hot","view_id":"homepage_hot_1785142812313","context":{"region":"ID
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"cookie_banner_cdn_load","params":"{\"page_url\":\"https://www.tiktok.com/\",\"host\":\"www.tiktok.com\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"referrer\":\"https://www.tiktok.com/\",\"loader_version\":\"1.0.5\",\"resource_url\":\"https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/pns/tiktok-cookie-banner/1.0.0.285/default.esm.js\",\"event_index\":178514323
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"video_receive","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":3902,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":4335,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"inference_trigger","params":"{\"page_name\":\"launcher\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":4579,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"onload","params":"{\"app_id\":1992,\"app_name\":\"\",\"sdk_version\":\"5.3.17\",\"sdk_type\":\"npm\",\"sdk_config\":{\"app_id\":1992,\"channel\":\"va\",\"channel_type\":\"tcpy\",\"log\":false,\"disable_auto_pv\":true,\"disable_webid\":true},\"sdk_desc\":\"TOC_OVERSEA\",\"url\":\"https://www.tiktok.com/\",\"is_setting\":false,\"enable_logsetting_params\":false,\"enable_logsetting_header_custom\":false}","local_time_ms":1785142815643}],"user":{"user_unique_id":"76619538356232
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"cookie_banner_load","params":"{\"locale\":\"en\",\"region\":\"ID\",\"js_version\":\"1.0.0.285\",\"tenant_id\":\"paas_tiktok\",\"page_url\":\"https://www.tiktok.com/\",\"host\":\"www.tiktok.com\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"referrer\":\"https://www.tiktok.com/\",\"event_index\":1785143449538}","local_time_ms":1785142815911,"is_bav":0,"session_id":"953acc14-d5fb-4273-89cc-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"consent_init_sdk","params":"{\"status\":\"FINISH\",\"event_index\":1785143080346}","local_time_ms":1785142815920,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"},{"event":"consent_init_sdk","params":"{\"status\":\"START\",\"event_index\":1785143080345}","local_time_ms":1785142815919,"is_bav":0,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"}],"user":{"user_unique_id":"7661953835623237138","web_id":"7661953867018798610"},"header":{"app_id":1988,"os_name":"
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"content":"live_sdk_api_live_feed-TypeError-Cannot read properties of undefined (reading 'data')","type":"log","level":"error"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"59c37074-7524-4767-bd26-4a8e6a40dbe1","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142814808,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":4808,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"tt_ticket_guard_web_get_storage","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_platform\":\"web\",\"init_type\":\"pubKey\",\"sign_type\":\"pubKey\",\"params_for_special\":\"tiktok_account_login\",\"key\":\"s_sdk_crypt_sdk,s_sdk_cert_key,s_sdk_sign_data_key/tt_fetch\",\"storage_type\":\"local\",\"duration\":219,\"event_index\":1785143238412}","local_time_ms":1785142815860,"is_bav":0,"session_id":"cac3c5ca-8288-4e2d-8ad9-2d142582c32c"}],"user":{"user_unique
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=cdn_replace_service_worker`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"swRegister","type":"event","metrics":{"count":1},"categories":{"host":"www.tiktok.com"}},"common":{"bid":"cdn_replace_service_worker","user_id":"cb6e4957-7a1a-4b37-a481-044660c7315d","device_id":"9bde90ea-9794-4e3d-85d3-cd0403e42c73","session_id":"32a186c0-e4cd-42bd-95a8-6a5dba81cae9","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":1785142814992,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":4989,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5256,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"load_more","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5699,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,760307
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":5989,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":6040,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=ucenter_tiktok_zti_sdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"tt_ticket_guard_sdk_init","type":"event","categories":{"success":"success","region":"va","remote":"false"}},"common":{"bid":"ucenter_tiktok_zti_sdk","user_id":"7661953835623237138","device_id":"05aff4e2-df93-4f91-84cf-b22d572af18b","session_id":"1291e643-b7c5-4159-913e-499bc512b31d","release":"","env":"online","url":"https://www.tiktok.com/","timestamp":1785142815636,"sdk_version":"1.12.4","sdk_name":"SDK_SLARDAR_WEB","pid":"www.t
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=pns_cookie_banner_slardar`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"pns_cuj","type":"event","metrics":{"timestamp":4888.199999999953,"duration":0},"categories":{"status":"START","name":"load_cookie_banner","stepName":"FINISH","error":"","detail":"","appId":"1988","appVersion":"1.0.0.285","tenant":"paas_tiktok"}},"common":{"bid":"pns_cookie_banner_slardar","user_id":"410fe6c4-c2ac-4dff-9036-5997e76a42f6","device_id":"b6953e27-0a48-4d8c-bc2f-9f9c2eecb814","session_id":"7eeccb3a-9eda-4d65-905a-2aebf5
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp_vmok`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"remote_load_start","type":"event","categories":{"commit_hash":"dynamic"}},"common":{"bid":"tiktok_webapp_vmok","user_id":"2742326d-97fb-4d8f-a15b-fb2fcc05e074","device_id":"c9017e33-2532-44a9-a83b-e25a3f447ec4","session_id":"5e0f65ee-138e-40c7-83ba-eb4845be5887","release":"","env":"production","url":"https://www.tiktok.com/","timestamp":1785142816690,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"","view_id":"_17851428
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"fp","value":1500,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"59c37074-7524-4767-bd26-4a8e6a40dbe1","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142816172,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=webmssdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"pageview","payload":{"pid":"/","source":"init"},"common":{"bid":"webmssdk","user_id":"e314afc9-3a1b-4f46-8da8-0bfca506b217","device_id":"3ff69dd2-0ad0-4b0d-a5aa-ba1a2ce69306","session_id":"18b82a18-f1be-41b7-8825-53a332a52d44","release":"1.0.0.388","env":"production","url":"https://www.tiktok.com/","timestamp":1785142813394,"sdk_version":"1.16.6","sdk_name":"SDK_SLARDAR_WEB","pid":"/","view_id":"/_1785142813393","context":{},"network_type":"4g","sample_rate
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"api_request","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":9399,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,7603
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"tt_ticket_guard_web_sign","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_platform\":\"web\",\"init_type\":\"pubKey\",\"sign_type\":\"pubKey\",\"params_for_special\":\"tiktok_account_login\",\"type\":\"crypto\",\"duration\":0,\"event_index\":1785143238434}","local_time_ms":1785142820426,"is_bav":0,"session_id":"cac3c5ca-8288-4e2d-8ad9-2d142582c32c"},{"event":"tt_ticket_guard_web_get_storage","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_p
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-va.tiktokv.com`
- **URL:** `https://mcs-va.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"tt_ticket_guard_web_performance","params":"{\"_staging_flag\":0,\"sdk_version\":\"0.2.11\",\"self_platform\":\"web\",\"init_type\":\"pubKey\",\"sign_type\":\"pubKey\",\"params_for_special\":\"tiktok_account_login\",\"type\":\"crypto\",\"store_type\":\"local\",\"path\":\"https://www.tiktok.com/passport/web/account/info/?WebIdLastTime=1783937646&aid=1459&app_language=en&app_name=tiktok_web&browser_language=en-US&browser_name=Mozilla&browser_online=true&browser_platform=Win32&
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"lcp","value":2000,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf","extra":{"element":"div.swiper-wrapper > div.swiper-slide.swiper-slide-active.swiper-slide-duplicate-next.swiper-slide-duplicate-prev > img.css-19otcmx-7937d88b--ImgPhotoSlide.extb1212"}},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"59c37074-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"inp","value":0,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf"},"common":{"bid":"tiktok_webapp","user_id":"7661953835623237138","device_id":"21596260-2158-459e-87a3-80ab52b6bb21","session_id":"59c37074-7524-4767-bd26-4a8e6a40dbe1","release":"1.5.0.6187","env":"production","url":"https://www.tiktok.com/","timestamp":1785142821253,"sdk_version":"1.16.7","sdk_name":"SDK_SLARDAR_WEB","pid":"ho
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon-sg.tiktokv.com`
- **URL:** `https://mon-sg.tiktokv.com/monitor_browser/collect/batch/?biz_id=tiktok_webapp`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"performance","payload":{"name":"cls","value":0.010247417167381003,"isSupport":true,"isPolyfill":false,"isBounced":false,"isCustom":false,"type":"perf","extra":{"element":"#one-column-item-0 > div.css-1gp40pd-7937d88b--DivContentFlexLayout.ehcbpkw2 > #media-card-0 > div.css-hlkp18-7937d88b--BasePlayerContainer-7937d88b--DivPhotoPlayerContainer.e1gen9l34 > div.css-3rm8q2-7937d88b--DivMediaCardOverlay.e1vama6v0"}},"common":{"bid":"tiktok_webapp","user_id":"766
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"slardar_perf_lcp","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":10228,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,7589959
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_page_alive","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"url_path\":\"/\",\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"duration\":8930,\"is_support_visibility_change\":1,\"startTime\":1785142812326,\"hidden\":\"visible\",\"leave\":true,\"mode\":\"normal\",\"focusState\":true,\"event_index\":1785143238440}","local_time_ms":1785142821256,"is_bav":1,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"}],"use
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"predefine_page_close","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"url_path\":\"/\",\"title\":\"TikTok - Make Your Day\",\"url\":\"https://www.tiktok.com/\",\"active_times\":1,\"duration\":8931,\"total_duration\":8932,\"is_support_visibility_change\":1,\"mode\":\"normal\",\"focusState\":true,\"event_index\":1785143238441}","local_time_ms":1785142821258,"is_bav":1,"session_id":"36cf1a0d-1f13-42cf-be21-6aced3646b14"}],"user":{"user_unique_id":"7
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mon.tiktokv.com`
- **URL:** `https://mon.tiktokv.com/monitor_browser/collect/batch/?biz_id=ucenter_tiktok_zti_sdk`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"ev_type":"batch","list":[{"ev_type":"custom","payload":{"name":"tt_ticket_guard_web_get_storage","type":"event","metrics":{"duration":1},"categories":{"key":"s_sdk_crypt_sdk,s_sdk_cert_key,s_sdk_sign_data_key/tt_fetch","storage_type":"local"}},"common":{"bid":"ucenter_tiktok_zti_sdk","user_id":"7661953835623237138","device_id":"05aff4e2-df93-4f91-84cf-b22d572af18b","session_id":"1291e643-b7c5-4159-913e-499bc512b31d","release":"","env":"online","url":"https://www.tiktok.com/","timestamp":178514
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"__bav_beat","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"beat_type\":0,\"page_key\":\"https://www.tiktok.com/\",\"is_html\":1,\"page_title\":\"TikTok - Make Your Day\",\"page_manual_key\":\"\",\"page_viewport_width\":1280,\"page_viewport_height\":720,\"page_total_width\":1280,\"page_total_height\":720,\"scroll_width\":1280,\"scroll_height\":720,\"since_page_start_ms\":10255,\"page_start_ms\":1785142811023,\"event_index\":1785143238443}","local
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `mcs-sg.tiktokv.com`
- **URL:** `https://mcs-sg.tiktokv.com/v1/list`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
[{"events":[{"event":"close_window","params":"{\"page_name\":\"homepage_hot\",\"enter_from\":\"homepage_hot\",\"time_from_origin\":10236,\"is_landing_page\":0,\"page_url\":\"https://www.tiktok.com/\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"user_type_alias\":\"user\",\"domain_name\":\"www.tiktok.com\",\"page_path\":\"/\",\"vidab\":\"70508271,72437276,73720540,75360573,75843653,75878361,75899533,75899591,76
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-vy3ews5YsaVte-RN0PAvDQ' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"require-trusted-types-for","effective-directive":"require-trusted-types-for","original-policy":"require-trusted-types-for 'script';report-uri /_/OneGoogleWidgetUi/cspreport","disposition":"enforce","blocked-uri":"trusted-types-sink","line-number":1832,"col
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-vy3ews5YsaVte-RN0PAvDQ' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `ogs.google.com`
- **URL:** `https://ogs.google.com/_/OneGoogleWidgetUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-vy3ews5YsaVte-RN0PAvDQ' 'unsafe-inline';object-src 'none';base-uri 'self';report-uri /_/OneGoogleWidgetUi/cspreport;worker-src 'self'","disposition":"enforc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-oCvsg81K0RwVa2xzHPaMmg' 'unsafe-inline';object-src 'none';base-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"require-trusted-types-for","effective-directive":"require-trusted-types-for","original-policy":"require-trusted-types-for 'script';report-uri /_/SocialPeopleHoverc
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-oCvsg81K0RwVa2xzHPaMmg' 'unsafe-inline';object-src 'none';base-
```

### Ekstensi: `aiifbnbfobpmeekipheeijimdpnlpgpp` (Station Wallet)
- **Browser:** Chrome 151
- **Domain Tujuan:** `contacts.google.com`
- **URL:** `https://contacts.google.com/_/SocialPeopleHovercardUi/cspreport`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"csp-report":{"document-uri":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__","referrer":"https://mail.google.com/","violated-directive":"script-src","effective-directive":"script-src","original-policy":"script-src 'report-sample' 'nonce-oCvsg81K0RwVa2xzHPaMmg' 'unsafe-inline';object-src 'none';base-
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"linkedin.com/feed"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"facebook.com"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"web.facebook.com/?_rdc=1&_rdr"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"tiktok.com"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"mail.google.com/mail/u/0"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"mail.google.com/mail/u/0/#inbox"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"mail.google.com/mail/u/0/#inbox"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__#id=I__HC_94253229&_gfid=I__HC_94253229&parent=https%3A%2F%2Fmail.google.com&pfname=&rpctoken=40514756"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"chocoffee.biz.id"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"chocoffee.biz.id"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"chocoffee.biz.id"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"chocoffee.biz.id/?i=1"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"the-internet.herokuapp.com/login"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__#id=I__HC_94253229&_gfid=I__HC_94253229&parent=https%3A%2F%2Fmail.google.com&pfname=&rpctoken=12110017"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"mail.google.com/mail/u/0"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"mail.google.com/mail/u/0/#inbox"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"about:blank"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"mail.google.com/mail/u/0/#inbox"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"chocoffee.biz.id"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"chocoffee.biz.id"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"chocoffee.biz.id"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"chocoffee.biz.id/?i=1"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"the-internet.herokuapp.com/login"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"linkedin.com/feed"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"facebook.com"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"web.facebook.com/?_rdc=1&_rdr"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"tiktok.com"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 149
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"linkedin.com/feed"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 149
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"facebook.com"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 149
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"web.facebook.com/?_rdc=1&_rdr"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 149
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"tiktok.com"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 149
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"mail.google.com/mail/u/0"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 149
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"chocoffee.biz.id"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 149
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"chocoffee.biz.id"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 149
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"chocoffee.biz.id"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 149
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"chocoffee.biz.id/?i=1"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 149
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"the-internet.herokuapp.com/login"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 149
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"mail.google.com/mail/u/0/#inbox"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 149
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"mail.google.com/mail/u/0/#inbox"}
```

### Ekstensi: `celjchjgliegnlalhjegfcaacphgdkij` (Blocksi AI Web Filter)
- **Browser:** Chrome 149
- **Domain Tujuan:** `api.blocksi.net`
- **URL:** `https://api.blocksi.net/url-classifier-llm/predict_url`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"mail.google.com/mail/u/0/#inbox"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.linkedin.com/feed/","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.linkedin.com/tscp-serving/dtag?z=home&c=1&li_theme=light&pk=d_flagship3_feed&pz=BR&p=1&sz=300x250&ti=1","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.linkedin.com/preload/?_bprMode=vanilla","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://web.facebook.com/?_rdc=1&_rdr","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.fbsbx.com/maw_proxy_page/?__cci=FQAREiIVABn1lQEC5ALSAvoCJC6KAz5ARkhKTE5QVFhcXmBiZGpscnR4eoABggGEAYYBiAGKAYwBjAOUAZwBngGgAaQBuAHOAdoC2gHeAeAB4gHqAewB7gHwAfQB%2FgGAAoYClgKaAqACsAIEggMGCvgCDA4QEhYYHB4gIiYoKiwwMjY4OjyyAkJE6gJmbnB2vgJ8jgGQAZQDwgKSAZYBmAGaAYQD5gKiAcgCugKoAawBrgGwAbIBtAHOAroBvgHWAsABwgHKAsYByAHKAcwBzALQAdQB2AHoAoYD1ALyAvAC5AH8AugB%2BAH6AeAC%2FAGKAsYCjAKOApAC2AKYAqICGAxGYWNlYm9va0hvc3QYA3dlYhgUWENvbWV0SG9tZUNvbnRyb2xsZXIA.AauyibCrNsLTpxsmNEWopIa3H39thq1ZHIsjnOiFhcYQK
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://web.facebook.com/sound_iframe.php?_rdc=1&_rdr","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.tiktok.com/","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.tiktok.com/","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://mail.google.com/mail/u/0/","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__#id=I__HC_94253229&_gfid=I__HC_94253229&parent=https%3A%2F%2Fmail.google.com&pfname=&rpctoken=39578254","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://accounts.google.com/RotateCookiesPage?og_pid=23&rot=3&origin=https%3A%2F%2Fmail.google.com&exp_id=0","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"http://chocoffee.biz.id/","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"http://chocoffee.biz.id/?i=1","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://the-internet.herokuapp.com/login","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.linkedin.com/feed/","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.linkedin.com/tscp-serving/dtag?z=home&c=1&li_theme=light&pk=d_flagship3_feed&pz=BR&p=1&sz=300x250&ti=1","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.linkedin.com/preload/?_bprMode=vanilla","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://web.facebook.com/?_rdc=1&_rdr","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://web.facebook.com/sound_iframe.php?_rdc=1&_rdr","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.tiktok.com/","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://mail.google.com/mail/u/0/","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__#id=I__HC_94253229&_gfid=I__HC_94253229&parent=https%3A%2F%2Fmail.google.com&pfname=&rpctoken=17667773","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"http://chocoffee.biz.id/","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://the-internet.herokuapp.com/login","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.linkedin.com/feed/","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.linkedin.com/tscp-serving/dtag?z=home&c=1&li_theme=light&pk=d_flagship3_feed&pz=BR&p=1&sz=300x250&ti=1","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.linkedin.com/preload/?_bprMode=vanilla","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://web.facebook.com/?_rdc=1&_rdr","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://web.facebook.com/sound_iframe.php?_rdc=1&_rdr","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.tiktok.com/","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://mail.google.com/mail/u/0/","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__#id=I__HC_94253229&_gfid=I__HC_94253229&parent=https%3A%2F%2Fmail.google.com&pfname=&rpctoken=24937584","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"http://chocoffee.biz.id/","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://the-internet.herokuapp.com/login","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://web.facebook.com/?_rdc=1&_rdr","hashdit_uuid":"723a1881-e3b3-4192-81de-6d91292c55be","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://web.facebook.com/sound_iframe.php?_rdc=1&_rdr","hashdit_uuid":"a080ad98-98a4-4530-8f7c-c871c7a19e36","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.fbsbx.com/maw_proxy_page/?__cci=FQAREiIVABn1lQEC5ALSAvoCJC6KAz5ARkhKTE5QVFhcXmBiZGpscnR4eoABggGEAYYBiAGKAYwBjAOUAZwBngGgAaQBuAHOAdoC2gHeAeAB4gHqAewB7gHwAfQB%2FgGAAoYClgKaAqACsAIEggMGCvgCDA4QEhYYHB4gIiYoKiwwMjY4OjyyAkJE6gJmbnB2vgJ8jgGQAZQDwgKSAZYBmAGaAYQD5gKiAcgCugKoAawBrgGwAbIBtAHOAroBvgHWAsABwgHKAsYByAHKAcwBzALQAdQB2AHoAoYD1ALyAvAC5AH8AugB%2BAH6AeAC%2FAGKAsYCjAKOApAC2AKYAqICGAxGYWNlYm9va0hvc3QYA3dlYhgUWENvbWV0SG9tZUNvbnRyb2xsZXIA.AatbkVKZQATn-9sey45YF-4_rDhKKUASviFBdaEcFFSUN
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.tiktok.com/","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.tiktok.com/","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://mail.google.com/mail/u/0/","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://the-internet.herokuapp.com/login","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.linkedin.com/feed/","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.linkedin.com/tscp-serving/dtag?z=home&c=1&li_theme=light&pk=d_flagship3_feed&pz=BR&p=1&sz=300x250&ti=1","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.linkedin.com/preload/?_bprMode=vanilla","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://web.facebook.com/?_rdc=1&_rdr","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.fbsbx.com/maw_proxy_page/?__cci=FQAREiIVABn1lQEC5ALSAvoCJC6KAz5ARkhKTE5QVFhcXmBiZGpscnR4eoABggGEAYYBiAGKAYwBjAOUAZwBngGgAaQBuAHOAdoC2gHeAeAB4gHqAewB7gHwAfQB%2FgGAAoYClgKaAqACsAIEggMGCvgCDA4QEhYYHB4gIiYoKiwwMjY4OjyyAkJE6gJmbnB2vgJ8jgGQAZQDwgKSAZYBmAGaAYQD5gKiAcgCugKoAawBrgGwAbIBtAHOAroBvgHWAsABwgHKAsYByAHKAcwBzALQAdQB2AHoAoYD1ALyAvAC5AH8AugB%2BAH6AeAC%2FAGKAsYCjAKOApAC2AKYAqICGAxGYWNlYm9va0hvc3QYA3dlYhgUWENvbWV0SG9tZUNvbnRyb2xsZXIA.AatbkVKZQATn-9sey45YF-4_rDhKKUASviFBdaEcFFSUN
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://web.facebook.com/sound_iframe.php?_rdc=1&_rdr","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.tiktok.com/","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://mail.google.com/mail/u/0/","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://accounts.google.com/RotateCookiesPage?og_pid=23&rot=3&origin=https%3A%2F%2Fmail.google.com&exp_id=0","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__#id=I__HC_94253229&_gfid=I__HC_94253229&parent=https%3A%2F%2Fmail.google.com&pfname=&rpctoken=28364478","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"http://chocoffee.biz.id/","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"http://chocoffee.biz.id/?i=1","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.google.com/maps/embed?origin=mfe&pb=!1m2!2m1!1sSMAN+1+Lubuk+Pakam","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://the-internet.herokuapp.com/login","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.linkedin.com/feed/","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.linkedin.com/tscp-serving/dtag?z=home&c=1&li_theme=light&pk=d_flagship3_feed&pz=BR&p=1&sz=300x250&ti=1","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.linkedin.com/preload/?_bprMode=vanilla","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://web.facebook.com/?_rdc=1&_rdr","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.fbsbx.com/maw_proxy_page/?__cci=FQAREiIVABn1lQEC5ALSAvoCJC6KAz5ARkhKTE5QVFhcXmBiZGpscnR4eoABggGEAYYBiAGKAYwBjAOUAZwBngGgAaQBuAHOAdoC2gHeAeAB4gHqAewB7gHwAfQB%2FgGAAoYClgKaAqACsAIEggMGCvgCDA4QEhYYHB4gIiYoKiwwMjY4OjyyAkJE6gJmbnB2vgJ8jgGQAZQDwgKSAZYBmAGaAYQD5gKiAcgCugKoAawBrgGwAbIBtAHOAroBvgHWAsABwgHKAsYByAHKAcwBzALQAdQB2AHoAoYD1ALyAvAC5AH8AugB%2BAH6AeAC%2FAGKAsYCjAKOApAC2AKYAqICGAxGYWNlYm9va0hvc3QYA3dlYhgUWENvbWV0SG9tZUNvbnRyb2xsZXIA.AatbkVKZQATn-9sey45YF-4_rDhKKUASviFBdaEcFFSUN
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://web.facebook.com/sound_iframe.php?_rdc=1&_rdr","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://www.tiktok.com/","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://mail.google.com/mail/u/0/","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA7rlC3fm-HZ_TnBGytkyMk8XIw%2Fm%3D__features__#id=I__HC_94253229&_gfid=I__HC_94253229&parent=https%3A%2F%2Fmail.google.com&pfname=&rpctoken=25344374","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"http://chocoffee.biz.id/","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `coegijljhiejhdodjbnlglffjomlbgmi` (HashDit)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.hashdit.io`
- **URL:** `https://api.hashdit.io/security-api/public/app/v1/detect?business=hashdit_extension_tx_api_url_detection`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"url":"https://the-internet.herokuapp.com/login","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}
```

### Ekstensi: `gbofnmhbadjcjmhknjamkagckgnpbdgb` (MiqueCRM PRO)
- **Browser:** Chrome 149
- **Domain Tujuan:** `generativelanguage.googleapis.com`
- **URL:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=`
- **Asal:** Content Script
- **Data yang Dikirim:**
```
{"contents":[{"parts":[{"text":"hello"}]}]}
```

### Ekstensi: `ibnejdfjmmkpcnlpebklmnkoeoihofec` (TronLink)
- **Browser:** Chrome 150
- **Domain Tujuan:** `api.trongrid.io`
- **URL:** `https://api.trongrid.io/wallet/getaccount`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"address":"415704ed4614e824d9a4dc1368ee74a85d567e6c6d"}
```

### Ekstensi: `ibnejdfjmmkpcnlpebklmnkoeoihofec` (TronLink)
- **Browser:** Chrome 151
- **Domain Tujuan:** `api.trongrid.io`
- **URL:** `https://api.trongrid.io/wallet/getaccount`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"address":"415704ed4614e824d9a4dc1368ee74a85d567e6c6d"}
```

### Ekstensi: `ibnejdfjmmkpcnlpebklmnkoeoihofec` (TronLink)
- **Browser:** Chrome 149
- **Domain Tujuan:** `api.trongrid.io`
- **URL:** `https://api.trongrid.io/wallet/getaccount`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"address":"415704ed4614e824d9a4dc1368ee74a85d567e6c6d"}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 151
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/set.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"updates":{"FollowUp":[],"IA":{"activeIA":null,"keyGPT":"","keyGemini":""},"agendamentos":[],"agendamentosNaoDisparados":[],"agrupamentos":[],"autoatendimento":[],"backupAutomatico":{"date":"2026-07-28","items":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 150
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/set.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"updates":{"FollowUp":[],"IA":{"activeIA":null,"keyGPT":"","keyGemini":""},"agendamentos":[],"agendamentosNaoDisparados":[],"agrupamentos":[],"autoatendimento":[],"backupAutomatico":{"date":"2026-07-28","items":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `icchpmlociodmljbjhlojgfamhccbbcd` (HUMANERGY CRM)
- **Browser:** Chrome 149
- **Domain Tujuan:** `crm.humanergy-tools.com`
- **URL:** `https://crm.humanergy-tools.com/api/userSettings/get.php`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","notes","notifications","perfil","userTabs","agrupamentos","relatorio","encomendas","autoatendimento","webhook","IA","status","pinChat","atendimento","backupAutomatico","whatsApi","FollowUp","fluxo"]}
```

### Ekstensi: `inhcgfpbfdjbjogdfjbclgolkmhnooop` (__MSG_extName__)
- **Browser:** Chrome 151
- **Domain Tujuan:** `extensions.aitopia.ai`
- **URL:** `https://extensions.aitopia.ai/extensions/app/get_active_history`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chat_ids":{},"lang":"en","uuid_search":"3Hd0ZLj3Bccjg0BFEfRvWGwq8kTK7uAz5BEswO5Yb2GyoqCeLYtp4H4mwBAZYZhQ","uuid_hopekey":"93693490372573881a88a57010b17ebd","v":"5.8.0","ri":"inhcgfpbfdjbjogdfjbclgolkmhnooop","bt":"partner"}
```

### Ekstensi: `inhcgfpbfdjbjogdfjbclgolkmhnooop` (__MSG_extName__)
- **Browser:** Chrome 151
- **Domain Tujuan:** `extensions.aitopia.ai`
- **URL:** `https://extensions.aitopia.ai/ai/model_settings`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"lang":"en","uuid_search":"3Hd0ZLj3Bccjg0BFEfRvWGwq8kTK7uAz5BEswO5Yb2GyoqCeLYtp4H4mwBAZYZhQ","uuid_hopekey":"93693490372573881a88a57010b17ebd","v":"5.8.0","ri":"inhcgfpbfdjbjogdfjbclgolkmhnooop","bt":"partner"}
```

### Ekstensi: `inhcgfpbfdjbjogdfjbclgolkmhnooop` (__MSG_extName__)
- **Browser:** Chrome 150
- **Domain Tujuan:** `extensions.aitopia.ai`
- **URL:** `https://extensions.aitopia.ai/extensions/app/get_active_history`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chat_ids":{},"lang":"en","uuid_search":"b-_-p_YN1oc4N5MA8ZOXRN8zJc1LRaTB1Z6-_-p_G5BMgKEy7yyyIIvYUXNv-_-t_vFN9qvz0JnA","uuid_hopekey":"c1bf2d7f806e19f8baad767b4927169b","v":"5.8.0","ri":"inhcgfpbfdjbjogdfjbclgolkmhnooop","bt":"partner"}
```

### Ekstensi: `inhcgfpbfdjbjogdfjbclgolkmhnooop` (__MSG_extName__)
- **Browser:** Chrome 150
- **Domain Tujuan:** `extensions.aitopia.ai`
- **URL:** `https://extensions.aitopia.ai/ai/model_settings`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"lang":"en","uuid_search":"b-_-p_YN1oc4N5MA8ZOXRN8zJc1LRaTB1Z6-_-p_G5BMgKEy7yyyIIvYUXNv-_-t_vFN9qvz0JnA","uuid_hopekey":"c1bf2d7f806e19f8baad767b4927169b","v":"5.8.0","ri":"inhcgfpbfdjbjogdfjbclgolkmhnooop","bt":"partner"}
```

### Ekstensi: `inhcgfpbfdjbjogdfjbclgolkmhnooop` (__MSG_extName__)
- **Browser:** Chrome 149
- **Domain Tujuan:** `extensions.aitopia.ai`
- **URL:** `https://extensions.aitopia.ai/extensions/app/get_key`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"ai_mode":"local","lang":"en","model":"GPT-4o Mini","settings":{"switchbar":"chat","color_mode":"auto","ai_mode":"local","ai_key":null,"language":"en","language_name":null,"language_detail":{},"send_cmd":"enter","sidebar_cmd":"ctrl+y","color_mode_cmd":"ctrl+shift+l","fullscreen_cmd":"ctrl+shift+f","sidebar_show_icon":true,"sidebar_position":"right","sidebar_space":"overlay","search":true,"search_ask_mode":"manuel","youtube":true,"youtube_summarize_mode":"always","ai_model":"GPT-4o Mini","web_ac
```

### Ekstensi: `inhcgfpbfdjbjogdfjbclgolkmhnooop` (__MSG_extName__)
- **Browser:** Chrome 149
- **Domain Tujuan:** `extensions.aitopia.ai`
- **URL:** `https://extensions.aitopia.ai/languages/lang/get/lang/en`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"language":"en","lang":"en","v":"5.8.0","ri":"inhcgfpbfdjbjogdfjbclgolkmhnooop","bt":"partner"}
```

### Ekstensi: `inhcgfpbfdjbjogdfjbclgolkmhnooop` (__MSG_extName__)
- **Browser:** Chrome 149
- **Domain Tujuan:** `extensions.aitopia.ai`
- **URL:** `https://extensions.aitopia.ai/extensions/app/get_active_history`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"chat_ids":{},"lang":"en","uuid_search":"xj6G9MbBILrlTamI4vkDGgqEFl189-_-t_HEYFZNuaCmczBPlK55Z6zNsNDRWghWiMY2","uuid_hopekey":"fd54075e00b16d2f86876ec6221e5a34","v":"5.8.0","ri":"inhcgfpbfdjbjogdfjbclgolkmhnooop","bt":"partner"}
```

### Ekstensi: `inhcgfpbfdjbjogdfjbclgolkmhnooop` (__MSG_extName__)
- **Browser:** Chrome 149
- **Domain Tujuan:** `extensions.aitopia.ai`
- **URL:** `https://extensions.aitopia.ai/ai/model_settings`
- **Asal:** Service Worker
- **Data yang Dikirim:**
```
{"lang":"en","uuid_search":"xj6G9MbBILrlTamI4vkDGgqEFl189-_-t_HEYFZNuaCmczBPlK55Z6zNsNDRWghWiMY2","uuid_hopekey":"fd54075e00b16d2f86876ec6221e5a34","v":"5.8.0","ri":"inhcgfpbfdjbjogdfjbclgolkmhnooop","bt":"partner"}
```

## 5. Detail Analisis Per Ekstensi

### 1. `aapbdbdomjkkjkaonfhkkikfgjllcleb`
**Nama:** __MSG_8969005060131950570__

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UReq
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | 🚨 YES |
| Total Outbound Req | 7 | 19 | 19 |
| Extension Requests | 7 | 19 | 19 |
| Duration (sec) | 262.3 | 262.3 | 262.3 |

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 2. `ahofgjkfjljcliehioeefaanagffnffa`
**Nama:** Star Wars Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | 🚨 YES |
| Total Outbound Req | 6 | 6 | 18 |
| Extension Requests | 6 | 6 | 18 |
| Duration (sec) | 378.5 | 359.6 | 362.4 |

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 3. `aholpfdialjgjfhomihkjbmgjidlcdno`
**Nama:** __MSG_appName__

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 59
- **SEE Categories:** FH,HH,UProf,UReq
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | 🚨 YES |
| Total Outbound Req | 60 | 73 | 61 |
| Extension Requests | 22 | 35 | 22 |
| Duration (sec) | 295.8 | 365.4 | 337.2 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Chrome 149:** 7 request ke domain eksternal
- `GET` → `remote-config.exodus.io` [SW]
- `GET` → `exchange.exodus.io` [SW]
- `GET` → `exchange.exodus.io` [SW]
- `GET` → `exchange.exodus.io` [SW]
- `POST` → `api.segment.io` [SW]
  - Data: `{"anonymousId":"1c015cf7-a2f2-4392-9c83-eadef9609b67","userId":null,"event":"OnboardingView","properties":{"number_of_assets_enabled":0,"app_platform":"browser","app_version":"26.6.25","app_build":"pr`
- `GET` → `remote-config.exodus.io` [SW]
- `GET` → `nfts-proxy.exodus.io` [SW]
**Chrome 150:** 7 request ke domain eksternal
- `GET` → `remote-config.exodus.io` [SW]
- `GET` → `exchange.exodus.io` [SW]
- `GET` → `exchange.exodus.io` [SW]
- `GET` → `exchange.exodus.io` [SW]
- `POST` → `api.segment.io` [SW]
  - Data: `{"anonymousId":"e76d38a0-fa1c-474f-af5d-9b2412fdc94f","userId":null,"event":"OnboardingView","properties":{"number_of_assets_enabled":0,"app_platform":"browser","app_version":"26.6.25","app_build":"pr`
- `GET` → `remote-config.exodus.io` [SW]
- `GET` → `remote-config.exodus.io` [SW]
**Chrome 151:** 7 request ke domain eksternal
- `GET` → `remote-config.exodus.io` [SW]
- `GET` → `exchange.exodus.io` [SW]
- `GET` → `exchange.exodus.io` [SW]
- `GET` → `exchange.exodus.io` [SW]
- `POST` → `api.segment.io` [SW]
  - Data: `{"anonymousId":"c383d25a-7ada-4bf9-95f1-045d5a533b5b","userId":null,"event":"OnboardingView","properties":{"number_of_assets_enabled":0,"app_platform":"browser","app_version":"26.6.25","app_build":"pr`
- `GET` → `remote-config.exodus.io` [SW]
- `GET` → `remote-config.exodus.io` [SW]

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 4. `aiifbnbfobpmeekipheeijimdpnlpgpp`
**Nama:** Station Wallet

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,CLE,UReq,FH
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | 🚨 YES |
| Total Outbound Req | 934 | 971 | 943 |
| Extension Requests | 893 | 929 | 897 |
| Duration (sec) | 277.1 | 281.4 | 314.8 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Chrome 149:** 288 request ke domain eksternal
- `GET` → `assets.terra.dev` [CS]
- `POST` → `lnkd.demdex.net` [CS]
  - Data: `d_mid=90077121775993806112115099951483039736&d_nsid=0&d_cid_ic=lnkdidsync%01ASpva964bzZE1X-xhNpOO-upwfYn%26v%3D2%011&d_cid_ic=thirdpartyid%01ASpva964bzZE1X-xhNpOO-upwfYn%26v%3D2%011&d_cid_ic=lnkd_memb`
- `GET` → `trkn.us` [CS]
- `GET` → `trkn.us` [CS]
- `GET` → `trkn.us` [CS]
- `GET` → `trkn.us` [CS]
- `GET` → `trkn.us` [CS]
- `GET` → `trkn.us` [CS]
- `GET` → `scontent.fkno4-2.fna.fbcdn.net` [CS]
- `GET` → `scontent.fkno4-2.fna.fbcdn.net` [CS]
**Chrome 150:** 264 request ke domain eksternal
- `GET` → `assets.terra.dev` [CS]
- `POST` → `lnkd.demdex.net` [CS]
  - Data: `d_mid=90077121775993806112115099951483039736&d_nsid=0&d_cid_ic=lnkdidsync%01ASpva964bzZE1X-xhNpOO-upwfYn%26v%3D2%011&d_cid_ic=thirdpartyid%01ASpva964bzZE1X-xhNpOO-upwfYn%26v%3D2%011&d_cid_ic=lnkd_memb`
- `GET` → `trkn.us` [CS]
- `GET` → `trkn.us` [CS]
- `GET` → `trkn.us` [CS]
- `GET` → `trkn.us` [CS]
- `GET` → `trkn.us` [CS]
- `GET` → `trkn.us` [CS]
- `GET` → `scontent.fkno4-2.fna.fbcdn.net` [CS]
- `GET` → `scontent.fkno4-2.fna.fbcdn.net` [CS]
**Chrome 151:** 274 request ke domain eksternal
- `GET` → `assets.terra.dev` [CS]
- `GET` → `scontent.fkno4-2.fna.fbcdn.net` [CS]
- `GET` → `scontent.fkno4-2.fna.fbcdn.net` [CS]
- `GET` → `scontent.fkno4-2.fna.fbcdn.net` [CS]
- `GET` → `scontent.fkno4-2.fna.fbcdn.net` [CS]
- `GET` → `scontent.fkno4-2.fna.fbcdn.net` [CS]
- `GET` → `scontent.fkno4-2.fna.fbcdn.net` [CS]
- `GET` → `scontent.fkno4-2.fna.fbcdn.net` [CS]
- `GET` → `scontent.fkno4-2.fna.fbcdn.net` [CS]
- `GET` → `scontent.fkno4-2.fna.fbcdn.net` [CS]

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 5. `ajcnllagebcaahcdfbappndlmhmpdhif`
**Nama:** Avengers Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | 🚨 YES |
| Total Outbound Req | 30 | 6 | 30 |
| Extension Requests | 30 | 6 | 30 |
| Duration (sec) | 226.3 | 187.3 | 219.5 |

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 6. `ajfokipknlmjhcioemgnofkpmdnbaldi`
**Nama:** Auto-join for Google Meet

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UReq
- **Obfuscation:** MEDIUM
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | 🚨 YES |
| Total Outbound Req | 18 | 6 | 6 |
| Extension Requests | 18 | 6 | 6 |
| Duration (sec) | 230.8 | 207.3 | 230.0 |

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 7. `amomkbhjghmegifhopipecfioeelecal`
**Nama:** Plants vs. Zombies Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | 🚨 YES |
| Total Outbound Req | 7 | 18 | 6 |
| Extension Requests | 7 | 18 | 6 |
| Duration (sec) | 300.9 | 234.1 | 240.8 |

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 8. `aobjbhiaoljpdpeappmepnhdhklkijjp`
**Nama:** Cat Cursor ♥ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | ✅ NO | ✅ NO | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | 🚨 YES |
| Total Outbound Req | 0 | 0 | 6 |
| Extension Requests | 0 | 0 | 6 |
| Duration (sec) | 0 | 0 | 428.3 |

#### Bukti S3 Traffic Redirect
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

#### Errors
- **Chrome 149:** `TIMEOUT after 480s`
- **Chrome 150:** `TIMEOUT after 480s`

---

### 9. `bjdilcmajpmmjlmnfojgkincnekmhohb`
**Nama:** App Store to iTunes Opener

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq,HH
- **Obfuscation:** LOW
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | 🚨 YES |
| Total Outbound Req | 7 | 95 | 7 |
| Extension Requests | 6 | 94 | 6 |
| Duration (sec) | 426.4 | 472.6 | 488.0 |

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 10. `blibecomdmpcndbgkinclhaokmaheild`
**Nama:** KPop Demon Hunters Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | ✅ NO | 🚨 YES |
| Total Outbound Req | 6 | 116 | 6 |
| Extension Requests | 6 | 116 | 6 |
| Duration (sec) | 354.5 | 440.9 | 434.2 |

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 11. `boolceociingmfoakiaiikpcnbcbajfm`
**Nama:** Blackpink Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | ✅ NO |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | ✅ NO |
| Total Outbound Req | 6 | 18 | 0 |
| Extension Requests | 6 | 18 | 0 |
| Duration (sec) | 348.7 | 424.8 | 0 |

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

#### Errors
- **Chrome 151:** `TIMEOUT after 480s`

---

### 12. `caeneogdipddninidgnoamjaglmmlmoo`
**Nama:** Dandadan Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | ✅ NO |
| Total Outbound Req | 19 | 6 | 6 |
| Extension Requests | 19 | 6 | 6 |
| Duration (sec) | 432.9 | 326.8 | 162.0 |

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 13. `cbgmidgpbbholpniehflilcaacpfipob`
**Nama:** Musicians and Singers Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | 🚨 YES |
| Total Outbound Req | 6 | 31 | 7 |
| Extension Requests | 6 | 31 | 7 |
| Duration (sec) | 297.2 | 409.6 | 404.3 |

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 14. `celjchjgliegnlalhjegfcaacphgdkij`
**Nama:** Blocksi AI Web Filter

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq,HH
- **Obfuscation:** MEDIUM
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | 🚨 YES |
| Total Outbound Req | 31 | 34 | 20 |
| Extension Requests | 31 | 31 | 20 |
| Duration (sec) | 196.9 | 300.2 | 233.2 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Chrome 149:** 13 request ke domain eksternal
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"linkedin.com/feed"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"facebook.com"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"web.facebook.com/?_rdc=1&_rdr"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"tiktok.com"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"mail.google.com/mail/u/0"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"chocoffee.biz.id"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"chocoffee.biz.id"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"chocoffee.biz.id"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"chocoffee.biz.id/?i=1"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"the-internet.herokuapp.com/login"}`
**Chrome 150:** 13 request ke domain eksternal
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"mail.google.com/mail/u/0"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"mail.google.com/mail/u/0/#inbox"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"about:blank"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"mail.google.com/mail/u/0/#inbox"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"chocoffee.biz.id"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"chocoffee.biz.id"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"chocoffee.biz.id"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"chocoffee.biz.id/?i=1"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"the-internet.herokuapp.com/login"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"linkedin.com/feed"}`
**Chrome 151:** 14 request ke domain eksternal
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"linkedin.com/feed"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"facebook.com"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"web.facebook.com/?_rdc=1&_rdr"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"tiktok.com"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"mail.google.com/mail/u/0"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"mail.google.com/mail/u/0/#inbox"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"mail.google.com/mail/u/0/#inbox"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"contacts.google.com/widget/hovercard/v/2?hl=id&origin=https%3A%2F%2Fmail.google.com&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.XzzsS9_StRc.O%2Fd%3D1%2Frs%3DAHpOoo_uA`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"chocoffee.biz.id"}`
- `POST` → `api.blocksi.net` [SW]
  - Data: `{"url":"chocoffee.biz.id"}`

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 15. `cembgjjgklolpjnbjmemmfmlkfmklood`
**Nama:** Lilo & Stitch Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | 🚨 YES |
| Total Outbound Req | 18 | 6 | 18 |
| Extension Requests | 18 | 6 | 18 |
| Duration (sec) | 214.8 | 232.5 | 211.8 |

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 16. `cfolcjmcamelkgoopjddgbnaobjihmcn`
**Nama:** Kirby Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | ✅ NO | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | ✅ NO | 🚨 YES |
| Total Outbound Req | 6 | 0 | 6 |
| Extension Requests | 6 | 0 | 6 |
| Duration (sec) | 236.3 | 0 | 225.0 |

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

#### Errors
- **Chrome 150:** `TIMEOUT after 480s`

---

### 17. `cnmamaachppnkjgnildpdmkaakejnhae`
**Nama:** __MSG_appName__

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 49
- **SEE Categories:** UReq,CE,FH
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | 🚨 YES |
| Total Outbound Req | 45 | 46 | 63 |
| Extension Requests | 6 | 6 | 18 |
| Duration (sec) | 350.7 | 319.9 | 218.8 |

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 18. `coegijljhiejhdodjbnlglffjomlbgmi`
**Nama:** HashDit

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 48
- **SEE Categories:** UProf,FH,UReq,CLE,CE
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | ✅ NO | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | 🚨 YES | 🚨 YES |
| Total Outbound Req | 0 | 126 | 117 |
| Extension Requests | 0 | 52 | 43 |
| Duration (sec) | 0 | 307.1 | 309.7 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Chrome 150:** 34 request ke domain eksternal
- `POST` → `api.hashdit.io` [SW]
  - Data: `{"url":"https://web.facebook.com/?_rdc=1&_rdr","hashdit_uuid":"723a1881-e3b3-4192-81de-6d91292c55be","extension_version":"0.0.13"}`
- `POST` → `api.hashdit.io` [SW]
  - Data: `{"url":"https://web.facebook.com/sound_iframe.php?_rdc=1&_rdr","hashdit_uuid":"a080ad98-98a4-4530-8f7c-c871c7a19e36","extension_version":"0.0.13"}`
- `POST` → `api.hashdit.io` [SW]
  - Data: `{"url":"https://www.fbsbx.com/maw_proxy_page/?__cci=FQAREiIVABn1lQEC5ALSAvoCJC6KAz5ARkhKTE5QVFhcXmBiZGpscnR4eoABggGEAYYBiAGKAYwBjAOUAZwBngGgAaQBuAHOAdoC2gHeAeAB4gHqAewB7gHwAfQB%2FgGAAoYClgKaAqACsAIEgg`
- `POST` → `api.hashdit.io` [SW]
  - Data: `{"url":"https://www.tiktok.com/","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}`
- `POST` → `api.hashdit.io` [SW]
  - Data: `{"url":"https://www.tiktok.com/","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}`
- `POST` → `api.hashdit.io` [SW]
  - Data: `{"url":"https://mail.google.com/mail/u/0/","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}`
- `POST` → `api.hashdit.io` [SW]
  - Data: `{"url":"https://the-internet.herokuapp.com/login","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}`
- `POST` → `api.hashdit.io` [SW]
  - Data: `{"url":"https://www.linkedin.com/feed/","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}`
- `POST` → `api.hashdit.io` [SW]
  - Data: `{"url":"https://www.linkedin.com/tscp-serving/dtag?z=home&c=1&li_theme=light&pk=d_flagship3_feed&pz=BR&p=1&sz=300x250&ti=1","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0`
- `POST` → `api.hashdit.io` [SW]
  - Data: `{"url":"https://www.linkedin.com/preload/?_bprMode=vanilla","hashdit_uuid":"a8e5df97-d12b-4f3d-a9e4-0a87b21a6eb1","extension_version":"0.0.13"}`
**Chrome 151:** 37 request ke domain eksternal
- `POST` → `api.hashdit.io` [SW]
  - Data: `{"url":"https://www.linkedin.com/feed/","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}`
- `POST` → `api.hashdit.io` [SW]
  - Data: `{"url":"https://www.linkedin.com/tscp-serving/dtag?z=home&c=1&li_theme=light&pk=d_flagship3_feed&pz=BR&p=1&sz=300x250&ti=1","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0`
- `POST` → `api.hashdit.io` [SW]
  - Data: `{"url":"https://www.linkedin.com/preload/?_bprMode=vanilla","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}`
- `POST` → `api.hashdit.io` [SW]
  - Data: `{"url":"https://web.facebook.com/?_rdc=1&_rdr","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}`
- `POST` → `api.hashdit.io` [SW]
  - Data: `{"url":"https://www.fbsbx.com/maw_proxy_page/?__cci=FQAREiIVABn1lQEC5ALSAvoCJC6KAz5ARkhKTE5QVFhcXmBiZGpscnR4eoABggGEAYYBiAGKAYwBjAOUAZwBngGgAaQBuAHOAdoC2gHeAeAB4gHqAewB7gHwAfQB%2FgGAAoYClgKaAqACsAIEgg`
- `POST` → `api.hashdit.io` [SW]
  - Data: `{"url":"https://web.facebook.com/sound_iframe.php?_rdc=1&_rdr","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}`
- `POST` → `api.hashdit.io` [SW]
  - Data: `{"url":"https://www.tiktok.com/","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}`
- `POST` → `api.hashdit.io` [SW]
  - Data: `{"url":"https://www.tiktok.com/","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}`
- `POST` → `api.hashdit.io` [SW]
  - Data: `{"url":"https://mail.google.com/mail/u/0/","hashdit_uuid":"b341c832-9d5f-45e6-8b91-0108df4a3ef0","extension_version":"0.0.13"}`
- `POST` → `api.hashdit.io` [SW]
  - Data: `{"url":"https://ogs.google.com/u/0/widget/app?awwd=1&gpa=3&em=2&dpi=70251319&origin=https%3A%2F%2Fmail.google.com&cn=app&pid=23&spid=23&hl=id&xstg=CAMSAA%3D%3D","hashdit_uuid":"b341c832-9d5f-45e6-8b91`

#### Bukti S3 Traffic Redirect
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

#### Errors
- **Chrome 149:** `TIMEOUT after 480s`

---

### 19. `cphhlgmgameodnhkjdmkpanlelnlohao`
**Nama:** NeoLine

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 49
- **SEE Categories:** UProf,FH,UReq,CE,HH
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | 🚨 YES |
| Total Outbound Req | 84 | 83 | 93 |
| Extension Requests | 6 | 6 | 18 |
| Duration (sec) | 250.0 | 209.6 | 222.6 |

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 20. `dbjpighofpljmoogjcbhghlnlnepmmie`
**Nama:** Back to School Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | 🚨 YES |
| Total Outbound Req | 6 | 18 | 19 |
| Extension Requests | 6 | 18 | 19 |
| Duration (sec) | 229.4 | 172.2 | 235.8 |

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 21. `dgfaekieonkobpaklglncjmjibbbpnod`
**Nama:** Anime Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | 🚨 YES |
| Total Outbound Req | 6 | 18 | 6 |
| Extension Requests | 6 | 18 | 6 |
| Duration (sec) | 228.2 | 228.2 | 228.8 |

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 22. `djekgpcemgcnfkjldcclcpcjhemofcib`
**Nama:** __MSG_name__

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,HH
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | 🚨 YES |
| Total Outbound Req | 7 | 6 | 18 |
| Extension Requests | 7 | 6 | 18 |
| Duration (sec) | 273.5 | 314.5 | 237.6 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Chrome 149:** 1 request ke domain eksternal
- `GET` → `getscreeny.com` [SW]

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 23. `dmehhcjdoejcpoffjpfnhfglcacofmdn`
**Nama:** Whats Auto Send

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 54
- **SEE Categories:** CE,FH,UReq
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | 🚨 YES |
| Total Outbound Req | 6 | 6 | 6 |
| Extension Requests | 6 | 6 | 6 |
| Duration (sec) | 274.4 | 210.9 | 260.3 |

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 24. `dngnjfahakikicmhbjmgokapebkejjnb`
**Nama:** __MSG_extName__

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | 🚨 YES |
| Total Outbound Req | 6 | 77 | 18 |
| Extension Requests | 6 | 77 | 18 |
| Duration (sec) | 213.5 | 217.6 | 283.5 |

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 25. `dobjkkoopofegeinkiepblgidnigchoo`
**Nama:** Preppy Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | 🚨 YES |
| Total Outbound Req | 19 | 6 | 18 |
| Extension Requests | 19 | 6 | 18 |
| Duration (sec) | 245.8 | 230.9 | 180.2 |

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 26. `domdcfhmjfdchcegjmnjbioejdphmnio`
**Nama:** Cinnamoroll Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | 🚨 YES | 🚨 YES |
| Total Outbound Req | 6 | 6 | 30 |
| Extension Requests | 6 | 6 | 30 |
| Duration (sec) | 51.8 | 273.7 | 381.4 |

#### Bukti S3 Traffic Redirect
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 27. `dpfofggmkhdbfcciajfdphofclabnogo`
**Nama:** __MSG_name__

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** FH,HH,UReq
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | ✅ NO |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | ✅ NO |
| Total Outbound Req | 8 | 8 | 0 |
| Extension Requests | 6 | 6 | 0 |
| Duration (sec) | 231.8 | 197.0 | 0 |

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

#### Errors
- **Chrome 151:** `TIMEOUT after 480s`

---

### 28. `eenfkghojihnhnninifhndjilpibchki`
**Nama:** Peanuts Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | 🚨 YES |
| Total Outbound Req | 18 | 6 | 19 |
| Extension Requests | 18 | 6 | 19 |
| Duration (sec) | 242.1 | 238.2 | 250.4 |

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 29. `ejcfepkfckglbgocfkanmcdngdijcgld`
**Nama:** ChatGPT search

#### Analisis Statis
- **Risk Level:** MINIMAL
- **Risk Score:** 0
- **SEE Categories:** 
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | 🚨 YES |
| Total Outbound Req | 6 | 18 | 18 |
| Extension Requests | 6 | 18 | 18 |
| Duration (sec) | 235.4 | 246.3 | 240.0 |

#### Bukti S3 Traffic Redirect
- **Chrome 149:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 150:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr
- **Chrome 151:** Redirect detected: https://www.facebook.com/ → https://web.facebook.com/?_rdc=1&_rdr

---

### 30. `elfcaiclmhkioadcpikkonlnanaakmem`
**Nama:** Solo Leveling Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | ✅ NO | 🚨 YES | ✅ NO |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 0 | 21 | 0 |
| Extension Requests | 0 | 21 | 0 |
| Duration (sec) | 0 | 446.8 | 0 |

#### Errors
- **Chrome 149:** `TIMEOUT after 480s`
- **Chrome 151:** `TIMEOUT after 480s`

---

### 31. `eljclcigelmfnomncdefdkbgnbbilnel`
**Nama:** Hello Kitty Cursor ♥ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 20 | 20 | 21 |
| Extension Requests | 20 | 20 | 21 |
| Duration (sec) | 213.6 | 450.1 | 446.7 |

---

### 32. `emedckhdnioeieppmeojgegjfkhdlaeo`
**Nama:** Where is Cookie?

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 22 | 22 | 22 |
| Extension Requests | 22 | 22 | 22 |
| Duration (sec) | 282.5 | 269.0 | 292.1 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Chrome 149:** 2 request ke domain eksternal
- `GET` → `kra18.com` [SW]
- `GET` → `kra18.com` [SW]
**Chrome 150:** 2 request ke domain eksternal
- `GET` → `kra18.com` [SW]
- `GET` → `kra18.com` [SW]
**Chrome 151:** 2 request ke domain eksternal
- `GET` → `kra18.com` [SW]
- `GET` → `kra18.com` [SW]

---

### 33. `enemknlfbkchplbhdflblafnpfmgdpib`
**Nama:** My Hero Academia Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 20 | 20 | 20 |
| Extension Requests | 20 | 20 | 20 |
| Duration (sec) | 277.8 | 212.5 | 203.7 |

---

### 34. `fgmeehhcnbaijfgkjemphaeciiiifhdh`
**Nama:** webtagger

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** FH,UReq,UProf
- **Obfuscation:** MEDIUM
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 20 | 20 | 20 |
| Extension Requests | 20 | 20 | 20 |
| Duration (sec) | 235.0 | 229.4 | 233.5 |

---

### 35. `fipcjgnajmkjnnofhejohblljnifhldi`
**Nama:** WaLeads

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 48
- **SEE Categories:** FH,UReq,HH,UProf
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 22 | 21 | 21 |
| Extension Requests | 22 | 21 | 21 |
| Duration (sec) | 291.8 | 217.7 | 179.4 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Chrome 149:** 1 request ke domain eksternal
- `GET` → `gtmserver.waleads.com.br` [SW]
**Chrome 150:** 1 request ke domain eksternal
- `GET` → `gtmserver.waleads.com.br` [SW]
**Chrome 151:** 1 request ke domain eksternal
- `GET` → `gtmserver.waleads.com.br` [SW]

---

### 36. `fjjlanpalmagenpageablaphkfcchado`
**Nama:** NoSearchBar

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UReq
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 20 | 20 | 20 |
| Extension Requests | 20 | 20 | 20 |
| Duration (sec) | 216.2 | 219.8 | 229.1 |

---

### 37. `fkbjmjplmceabidmaloaffkmanglpfoe`
**Nama:** Soccer Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 20 | 21 | 20 |
| Extension Requests | 20 | 21 | 20 |
| Duration (sec) | 211.2 | 250.7 | 154.3 |

---

### 38. `flpfhaclifodhjecdjjdnefcjfnflcpp`
**Nama:** Harry Potter Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 20 | 21 | 20 |
| Extension Requests | 20 | 21 | 20 |
| Duration (sec) | 216.1 | 206.3 | 244.6 |

---

### 39. `fphiegmeigkjnjcpmdoecllfeanfbbhd`
**Nama:** Squid Game Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 20 | 20 | 20 |
| Extension Requests | 20 | 20 | 20 |
| Duration (sec) | 240.4 | 251.8 | 253.9 |

---

### 40. `gbofnmhbadjcjmhknjamkagckgnpbdgb`
**Nama:** MiqueCRM PRO

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 49
- **SEE Categories:** UProf,FH,CLE,CE,HH
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 65 | 23 | 22 |
| Extension Requests | 28 | 23 | 22 |
| Duration (sec) | 275.4 | 311.3 | 236.2 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Chrome 149:** 5 request ke domain eksternal
- `GET` → `crm.mique.tools` [SW]
- `GET` → `crm.mique.tools` [CS]
- `POST` → `generativelanguage.googleapis.com` [CS]
  - Data: `{"contents":[{"parts":[{"text":"hello"}]}]}`
- `GET` → `crm.mique.tools` [CS]
- `GET` → `crm.mique.tools` [CS]
**Chrome 150:** 1 request ke domain eksternal
- `GET` → `crm.mique.tools` [SW]

---

### 41. `gdnhbhfhnjcfhakagfdeeblhnpjcfjnn`
**Nama:** Winnie The Pooh Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 8 | 20 | 20 |
| Extension Requests | 8 | 20 | 20 |
| Duration (sec) | 298.0 | 289.7 | 299.4 |

---

### 42. `ghkcpcihdonjljjddkmjccibagkjohpi`
**Nama:** Download manager integration checklist

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** MEDIUM
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 27 | 26 | 41 |
| Extension Requests | 27 | 26 | 41 |
| Duration (sec) | 316.2 | 334.2 | 235.2 |

---

### 43. `gkbilebmkjlflcijbecemkmgkhnenakm`
**Nama:** Brawl Stars Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 8 | 8 | 8 |
| Extension Requests | 8 | 8 | 8 |
| Duration (sec) | 255.2 | 218.1 | 258.1 |

---

### 44. `glpjihohaedmlggmhpicpecpjnkdmndp`
**Nama:** HBS CONNECT

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 56
- **SEE Categories:** UProf,CE,LF,FH,UReq,HH,UDown
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 31 | 24 | 22 |
| Extension Requests | 23 | 21 | 22 |
| Duration (sec) | 202.0 | 208.8 | 241.6 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Chrome 149:** 1 request ke domain eksternal
- `GET` → `constants.opt-api.com` [CS]

---

### 45. `gncblcnmhnfgfbbkhlppaagagclgcbng`
**Nama:** Oh Mago CRM para Whatsapp

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 56
- **SEE Categories:** UProf,CE,LF,FH,UReq,HH,UDown
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 33 | 21 | 22 |
| Extension Requests | 25 | 13 | 22 |
| Duration (sec) | 250.2 | 266.0 | 214.6 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Chrome 149:** 1 request ke domain eksternal
- `GET` → `constants.opt-api.com` [CS]
**Chrome 150:** 1 request ke domain eksternal
- `GET` → `constants.opt-api.com` [CS]

---

### 46. `gpacldldkpfobgbdabaollodfoilfela`
**Nama:** Pokemon Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 20 | 8 | 8 |
| Extension Requests | 20 | 8 | 8 |
| Duration (sec) | 177.5 | 222.1 | 215.8 |

---

### 47. `hgmoaheomcjnaheggkfafnjilfcefbmo`
**Nama:** Rabet

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 48
- **SEE Categories:** FH,CE,UReq,UProf
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 70 | 62 | 85 |
| Extension Requests | 8 | 8 | 20 |
| Duration (sec) | 310.4 | 255.1 | 338.5 |

---

### 48. `hkhmodcdjhcidbcncgmnknjppphcpgmh`
**Nama:** Amazon Sticky Notes

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UReq
- **Obfuscation:** LOW
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 8 | 8 | 20 |
| Extension Requests | 8 | 8 | 20 |
| Duration (sec) | 204.9 | 200.9 | 228.8 |

---

### 49. `hoeeojgceocplocgolojeblocambibnn`
**Nama:** Easy Wapi - Api fácil para WhatsApp

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq,FH
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 21 | 9 | 20 |
| Extension Requests | 21 | 9 | 20 |
| Duration (sec) | 223.3 | 225.7 | 219.6 |

---

### 50. `ibnejdfjmmkpcnlpebklmnkoeoihofec`
**Nama:** TronLink

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 54
- **SEE Categories:** FH,CE,UReq,UProf
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 86 | 69 | 80 |
| Extension Requests | 42 | 39 | 38 |
| Duration (sec) | 215.6 | 182.0 | 234.3 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Chrome 149:** 11 request ke domain eksternal
- `POST` → `api.trongrid.io` [SW]
  - Data: `{"address":"415704ed4614e824d9a4dc1368ee74a85d567e6c6d"}`
- `GET` → `list.tronlink.org` [SW]
- `GET` → `link.linkshilink.org` [SW]
- `GET` → `list.abcshiabc.org` [SW]
- `GET` → `list.bcdshibcd.org` [SW]
- `GET` → `list.cdeshicde.org` [SW]
- `GET` → `list.defshidef.org` [SW]
- `GET` → `list.efgshiefg.org` [SW]
- `GET` → `list.fghshifgh.org` [SW]
- `GET` → `list.ghishighi.org` [SW]
**Chrome 150:** 11 request ke domain eksternal
- `POST` → `api.trongrid.io` [SW]
  - Data: `{"address":"415704ed4614e824d9a4dc1368ee74a85d567e6c6d"}`
- `GET` → `list.tronlink.org` [SW]
- `GET` → `link.linkshilink.org` [SW]
- `GET` → `list.abcshiabc.org` [SW]
- `GET` → `list.bcdshibcd.org` [SW]
- `GET` → `list.cdeshicde.org` [SW]
- `GET` → `list.defshidef.org` [SW]
- `GET` → `list.efgshiefg.org` [SW]
- `GET` → `list.fghshifgh.org` [SW]
- `GET` → `list.ghishighi.org` [SW]
**Chrome 151:** 11 request ke domain eksternal
- `POST` → `api.trongrid.io` [SW]
  - Data: `{"address":"415704ed4614e824d9a4dc1368ee74a85d567e6c6d"}`
- `GET` → `link.linkshilink.org` [SW]
- `GET` → `list.tronlink.org` [SW]
- `GET` → `list.abcshiabc.org` [SW]
- `GET` → `list.bcdshibcd.org` [SW]
- `GET` → `list.cdeshicde.org` [SW]
- `GET` → `list.defshidef.org` [SW]
- `GET` → `list.efgshiefg.org` [SW]
- `GET` → `list.fghshifgh.org` [SW]
- `GET` → `list.ghishighi.org` [SW]

---

### 51. `icchpmlociodmljbjhlojgfamhccbbcd`
**Nama:** HUMANERGY CRM

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 57
- **SEE Categories:** UProf,CE,CLE,FH,UReq
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 118 | 80 | 70 |
| Extension Requests | 81 | 78 | 70 |
| Duration (sec) | 222.5 | 223.5 | 200.0 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Chrome 149:** 58 request ke domain eksternal
- `GET` → `crm.humanergy-tools.com` [SW]
- `POST` → `crm.humanergy-tools.com` [SW]
  - Data: `{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","`
- `POST` → `crm.humanergy-tools.com` [SW]
  - Data: `{"updates":{"FollowUp":[],"IA":{"activeIA":null,"keyGPT":"","keyGemini":""},"agendamentos":[],"agendamentosNaoDisparados":[],"agrupamentos":[],"autoatendimento":[],"backupAutomatico":{"date":"2026-07-`
- `OPTIONS` → `crm.humanergy-tools.com` [SW]
- `OPTIONS` → `crm.humanergy-tools.com` [SW]
- `GET` → `crm.humanergy-tools.com` [CS]
- `GET` → `crm.humanergy-tools.com` [CS]
- `GET` → `crm.humanergy-tools.com` [CS]
- `POST` → `crm.humanergy-tools.com` [SW]
  - Data: `{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","`
- `OPTIONS` → `crm.humanergy-tools.com` [SW]
**Chrome 150:** 55 request ke domain eksternal
- `GET` → `crm.humanergy-tools.com` [SW]
- `POST` → `crm.humanergy-tools.com` [SW]
  - Data: `{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","`
- `POST` → `crm.humanergy-tools.com` [SW]
  - Data: `{"updates":{"FollowUp":[],"IA":{"activeIA":null,"keyGPT":"","keyGemini":""},"agendamentos":[],"agendamentosNaoDisparados":[],"agrupamentos":[],"autoatendimento":[],"backupAutomatico":{"date":"2026-07-`
- `OPTIONS` → `crm.humanergy-tools.com` [SW]
- `OPTIONS` → `crm.humanergy-tools.com` [SW]
- `OPTIONS` → `crm.humanergy-tools.com` [SW]
- `POST` → `crm.humanergy-tools.com` [SW]
  - Data: `{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","`
- `POST` → `crm.humanergy-tools.com` [SW]
  - Data: `{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","`
- `OPTIONS` → `crm.humanergy-tools.com` [SW]
- `POST` → `crm.humanergy-tools.com` [SW]
  - Data: `{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","`
**Chrome 151:** 48 request ke domain eksternal
- `POST` → `crm.humanergy-tools.com` [SW]
  - Data: `{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","`
- `OPTIONS` → `crm.humanergy-tools.com` [SW]
- `POST` → `crm.humanergy-tools.com` [SW]
  - Data: `{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","`
- `OPTIONS` → `crm.humanergy-tools.com` [SW]
- `POST` → `crm.humanergy-tools.com` [SW]
  - Data: `{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","`
- `OPTIONS` → `crm.humanergy-tools.com` [SW]
- `POST` → `crm.humanergy-tools.com` [SW]
  - Data: `{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","`
- `OPTIONS` → `crm.humanergy-tools.com` [SW]
- `OPTIONS` → `crm.humanergy-tools.com` [SW]
- `POST` → `crm.humanergy-tools.com` [SW]
  - Data: `{"chromeStoreID":"icchpmlociodmljbjhlojgfamhccbbcd","keys":["respostasRapidas","respostasRapidasAcao","categoria","agendamentos","agendamentosNaoDisparados","sendAfterWhatsAppOpens","crm","contatos","`

---

### 52. `igbodamhgjohafcenbcljfegbipdfjpk`
**Nama:** Keyboard History Recorder

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** LOW
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 8 | 20 | 8 |
| Extension Requests | 8 | 20 | 8 |
| Duration (sec) | 198.8 | 221.4 | 228.2 |

---

### 53. `iglgfjffffiknjajejaleginhanmejec`
**Nama:** Naruto Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 20 | 8 | 8 |
| Extension Requests | 20 | 8 | 8 |
| Duration (sec) | 195.5 | 198.0 | 208.7 |

---

### 54. `ikaghjdimdplapmfhnjnjmepnjnlmpdd`
**Nama:** BC ZAP

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 56
- **SEE Categories:** UProf,FH,UReq,LF,CE,HH,UDown
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 20 | 32 | 22 |
| Extension Requests | 12 | 24 | 22 |
| Duration (sec) | 227.3 | 228.4 | 219.7 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Chrome 149:** 1 request ke domain eksternal
- `GET` → `constants.opt-api.com` [CS]
**Chrome 150:** 1 request ke domain eksternal
- `GET` → `constants.opt-api.com` [CS]

---

### 55. `inhcgfpbfdjbjogdfjbclgolkmhnooop`
**Nama:** __MSG_extName__

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 48
- **SEE Categories:** UProf,CE,LF,CLE,FH,UReq,HH
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 90 | 60 | 59 |
| Extension Requests | 25 | 22 | 23 |
| Duration (sec) | 261.3 | 211.2 | 163.7 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Chrome 149:** 4 request ke domain eksternal
- `POST` → `extensions.aitopia.ai` [SW]
  - Data: `{"ai_mode":"local","lang":"en","model":"GPT-4o Mini","settings":{"switchbar":"chat","color_mode":"auto","ai_mode":"local","ai_key":null,"language":"en","language_name":null,"language_detail":{},"send_`
- `POST` → `extensions.aitopia.ai` [SW]
  - Data: `{"language":"en","lang":"en","v":"5.8.0","ri":"inhcgfpbfdjbjogdfjbclgolkmhnooop","bt":"partner"}`
- `POST` → `extensions.aitopia.ai` [SW]
  - Data: `{"chat_ids":{},"lang":"en","uuid_search":"xj6G9MbBILrlTamI4vkDGgqEFl189-_-t_HEYFZNuaCmczBPlK55Z6zNsNDRWghWiMY2","uuid_hopekey":"fd54075e00b16d2f86876ec6221e5a34","v":"5.8.0","ri":"inhcgfpbfdjbjogdfjbc`
- `POST` → `extensions.aitopia.ai` [SW]
  - Data: `{"lang":"en","uuid_search":"xj6G9MbBILrlTamI4vkDGgqEFl189-_-t_HEYFZNuaCmczBPlK55Z6zNsNDRWghWiMY2","uuid_hopekey":"fd54075e00b16d2f86876ec6221e5a34","v":"5.8.0","ri":"inhcgfpbfdjbjogdfjbclgolkmhnooop",`
**Chrome 150:** 2 request ke domain eksternal
- `POST` → `extensions.aitopia.ai` [SW]
  - Data: `{"chat_ids":{},"lang":"en","uuid_search":"b-_-p_YN1oc4N5MA8ZOXRN8zJc1LRaTB1Z6-_-p_G5BMgKEy7yyyIIvYUXNv-_-t_vFN9qvz0JnA","uuid_hopekey":"c1bf2d7f806e19f8baad767b4927169b","v":"5.8.0","ri":"inhcgfpbfdjb`
- `POST` → `extensions.aitopia.ai` [SW]
  - Data: `{"lang":"en","uuid_search":"b-_-p_YN1oc4N5MA8ZOXRN8zJc1LRaTB1Z6-_-p_G5BMgKEy7yyyIIvYUXNv-_-t_vFN9qvz0JnA","uuid_hopekey":"c1bf2d7f806e19f8baad767b4927169b","v":"5.8.0","ri":"inhcgfpbfdjbjogdfjbclgolkm`
**Chrome 151:** 2 request ke domain eksternal
- `POST` → `extensions.aitopia.ai` [SW]
  - Data: `{"chat_ids":{},"lang":"en","uuid_search":"3Hd0ZLj3Bccjg0BFEfRvWGwq8kTK7uAz5BEswO5Yb2GyoqCeLYtp4H4mwBAZYZhQ","uuid_hopekey":"93693490372573881a88a57010b17ebd","v":"5.8.0","ri":"inhcgfpbfdjbjogdfjbclgol`
- `POST` → `extensions.aitopia.ai` [SW]
  - Data: `{"lang":"en","uuid_search":"3Hd0ZLj3Bccjg0BFEfRvWGwq8kTK7uAz5BEswO5Yb2GyoqCeLYtp4H4mwBAZYZhQ","uuid_hopekey":"93693490372573881a88a57010b17ebd","v":"5.8.0","ri":"inhcgfpbfdjbjogdfjbclgolkmhnooop","bt"`

---

### 56. `jalaoplogcelljfhlodnagfepednmilm`
**Nama:** Dragon Ball Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 20 | 20 | 8 |
| Extension Requests | 20 | 20 | 8 |
| Duration (sec) | 202.6 | 225.6 | 211.7 |

---

### 57. `jancnnilpjlicmdjocnihnmpfiocmnoo`
**Nama:** Lexchatbot

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 56
- **SEE Categories:** UProf,FH,UReq,LF,CE,HH,UDown
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 32 | 10 | 20 |
| Extension Requests | 24 | 10 | 13 |
| Duration (sec) | 209.7 | 206.8 | 216.2 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Chrome 149:** 1 request ke domain eksternal
- `GET` → `constants.opt-api.com` [CS]
**Chrome 151:** 1 request ke domain eksternal
- `GET` → `constants.opt-api.com` [CS]

---

### 58. `jddaakabhmcbgfnbkgcjfeigbnbcdjgn`
**Nama:** BTS Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 20 | 8 | 20 |
| Extension Requests | 20 | 8 | 20 |
| Duration (sec) | 240.6 | 233.6 | 226.0 |

---

### 59. `jddgindpdjdojhenigliipabmmckcofh`
**Nama:** Supercars Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 20 | 20 | 8 |
| Extension Requests | 20 | 20 | 8 |
| Duration (sec) | 196.4 | 201.6 | 211.8 |

---

### 60. `jfliobjbgdclhcjgpgimckaijlcbkmdk`
**Nama:** Haikyuu Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 20 | 20 | 8 |
| Extension Requests | 20 | 20 | 8 |
| Duration (sec) | 202.4 | 213.4 | 192.9 |

---

### 61. `jjdhjfgoadphekgihokkigfghndfmffb`
**Nama:** 抓鱼鸭 - 一个有趣的新标签页

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 47
- **SEE Categories:** UProf,CE,CLE,FH
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Edge 148 | Edge 149 | Edge 150 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | 🚨 YES | 🚨 YES | 🚨 YES |
| Total Outbound Req | 78 | 65 | 72 |
| Extension Requests | 59 | 46 | 54 |
| Duration (sec) | 177.1 | 179.0 | 145.9 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Edge 148:** 41 request ke domain eksternal
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
- `GET` → `dailyhot.zyy.muo.cc` [CS]
- `GET` → `dailyhot.zyy.muo.cc` [CS]
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
**Edge 149:** 40 request ke domain eksternal
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
- `GET` → `dailyhot.zyy.muo.cc` [CS]
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
- `GET` → `dailyhot.zyy.muo.cc` [CS]
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
**Edge 150:** 34 request ke domain eksternal
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
- `GET` → `dailyhot.zyy.muo.cc` [CS]
- `GET` → `dailyhot.zyy.muo.cc` [CS]
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]
- `GET` → `mychat.apiv2.zyy.muo.cc` [CS]

#### Bukti S3 Traffic Redirect
- **Edge 148:** Redirect detected: https://mail.google.com/mail/u/0/ → https://accounts.google.com/v3/signin/accountchooser?continue=https%3A%2F%2Fmail.google.com%2Fmail%2Fu%2F0%2F&dsh=S790931925%3A1785164178007318&emr=1&followup=https%3A%2F%2Fmail.google.com%2Fmail%2Fu%2F0%2F&osid=1&passive=1209600&service=mail&fl
- **Edge 149:** Redirect detected: https://mail.google.com/mail/u/0/ → https://accounts.google.com/v3/signin/accountchooser?continue=https%3A%2F%2Fmail.google.com%2Fmail%2Fu%2F0%2F&dsh=S-1072382517%3A1785164136994963&emr=1&followup=https%3A%2F%2Fmail.google.com%2Fmail%2Fu%2F0%2F&osid=1&passive=1209600&service=mail&
- **Edge 150:** Redirect detected: https://mail.google.com/mail/u/0/ → https://accounts.google.com/v3/signin/accountchooser?continue=https%3A%2F%2Fmail.google.com%2Fmail%2Fu%2F0%2F&dsh=S587600089%3A1785164042496562&emr=1&followup=https%3A%2F%2Fmail.google.com%2Fmail%2Fu%2F0%2F&osid=1&passive=1209600&service=mail&fl

---

### 62. `jojhfeoedkpkglbfimdfabpdfjaoolaf`
**Nama:** Polymesh Wallet

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 49
- **SEE Categories:** UProf,FH,UReq,LF,CE,HH
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 39 | 40 | 40 |
| Extension Requests | 20 | 20 | 20 |
| Duration (sec) | 114.8 | 199.8 | 194.7 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Chrome 149:** 2 request ke domain eksternal
- `GET` → `polkadot.js.org` [SW]
- `GET` → `polkadot.js.org` [SW]
**Chrome 150:** 2 request ke domain eksternal
- `GET` → `polkadot.js.org` [SW]
- `GET` → `polkadot.js.org` [SW]
**Chrome 151:** 2 request ke domain eksternal
- `GET` → `polkadot.js.org` [SW]
- `GET` → `polkadot.js.org` [SW]

---

### 63. `jpifkbikhaakajfklldhhhfpakaflndi`
**Nama:** B2Cor CRM e Funil de Vendas - agencialink.com

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 18 | 18 | 24 |
| Extension Requests | 18 | 18 | 22 |
| Duration (sec) | 196.0 | 190.6 | 153.2 |

---

### 64. `kcdlihaidnmkenhlnofkjfoachidbnif`
**Nama:** __MSG_appName__

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UReq
- **Obfuscation:** MEDIUM
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 18 | 18 | 18 |
| Extension Requests | 18 | 18 | 18 |
| Duration (sec) | 189.6 | 182.4 | 192.2 |

---

### 65. `kcedhobjnadhpeodbfmikooippmcbehb`
**Nama:** Filapay Atende

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 56
- **SEE Categories:** UProf,CE,LF,FH,UReq,HH,UDown
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 21 | 21 | 22 |
| Extension Requests | 18 | 18 | 21 |
| Duration (sec) | 207.2 | 197.5 | 188.4 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Chrome 151:** 1 request ke domain eksternal
- `GET` → `constants.opt-api.com` [CS]

---

### 66. `kdgjiakonpbfmndaacfhamdoangincgp`
**Nama:** DiyTab - 图片下载器

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq,UDown
- **Obfuscation:** LOW
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 18 | 18 | 18 |
| Extension Requests | 18 | 18 | 18 |
| Duration (sec) | 188.5 | 152.6 | 203.3 |

---

### 67. `kkodiihpgodmdankclfibbiphjkfdenh`
**Nama:** __MSG_extension_name__

#### Analisis Statis
- **Risk Level:** HIGH
- **Risk Score:** 65
- **SEE Categories:** UProf,HH
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 18 | 31 | 28 |
| Extension Requests | 18 | 31 | 28 |
| Duration (sec) | 184.4 | 196.3 | 192.1 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Chrome 150:** 13 request ke domain eksternal
- `GET` → `www.parrottalks.com` [SW]
- `GET` → `www.parrottalks.com` [SW]
- `GET` → `www.parrottalks.com` [SW]
- `GET` → `www.parrottalks.com` [SW]
- `GET` → `www.parrottalks.com` [SW]
- `GET` → `www.parrottalks.com` [SW]
- `GET` → `www.parrottalks.com` [SW]
- `GET` → `www.parrottalks.com` [SW]
- `GET` → `www.parrottalks.com` [SW]
- `GET` → `www.parrottalks.com` [SW]
**Chrome 151:** 9 request ke domain eksternal
- `GET` → `www.parrottalks.com` [SW]
- `GET` → `www.parrottalks.com` [SW]
- `GET` → `www.parrottalks.com` [SW]
- `GET` → `www.parrottalks.com` [SW]
- `GET` → `www.parrottalks.com` [SW]
- `GET` → `www.parrottalks.com` [SW]
- `GET` → `www.parrottalks.com` [SW]
- `GET` → `www.parrottalks.com` [SW]
- `GET` → `www.parrottalks.com` [SW]

---

### 68. `kkpllkodjeloidieedojogacfhpaihoh`
**Nama:** Enkrypt: ETH, BTC and Solana Wallet

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 59
- **SEE Categories:** UProf,FH,UReq,CE,HH
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 31 | 37 | 19 |
| Extension Requests | 23 | 23 | 19 |
| Duration (sec) | 232.9 | 211.8 | 210.6 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Chrome 149:** 3 request ke domain eksternal
- `GET` → `partners.mewapi.io` [SW]
- `GET` → `partners.mewapi.io` [CS]
- `GET` → `sr-client-cfg.amplitude.com` [CS]
**Chrome 150:** 3 request ke domain eksternal
- `GET` → `partners.mewapi.io` [SW]
- `GET` → `partners.mewapi.io` [CS]
- `GET` → `sr-client-cfg.amplitude.com` [CS]
**Chrome 151:** 1 request ke domain eksternal
- `GET` → `partners.mewapi.io` [SW]

---

### 69. `knomkjoeecgejmhchcpmpbdpfdphpgpo`
**Nama:** Poppy Playtime Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 94 | 6 | 18 |
| Extension Requests | 94 | 6 | 18 |
| Duration (sec) | 195.7 | 207.4 | 198.4 |

---

### 70. `lcahlhmejfgofgednancmbfmflaoihld`
**Nama:** Jujutsu Kaisen Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 18 | 18 | 18 |
| Extension Requests | 18 | 18 | 18 |
| Duration (sec) | 192.7 | 195.2 | 223.7 |

---

### 71. `ldonikoaoafdiccjpkpcgplphedemnma`
**Nama:** Pochacco Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 6 | 6 | 18 |
| Extension Requests | 6 | 6 | 18 |
| Duration (sec) | 202.3 | 196.3 | 191.5 |

---

### 72. `lfmanjgjccjkajbppaccimngmgfkoplf`
**Nama:** Rhino CRM

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 59
- **SEE Categories:** UProf,FH,UReq,CLE,CE
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 49 | 8 | 12 |
| Extension Requests | 12 | 8 | 11 |
| Duration (sec) | 199.6 | 202.1 | 200.7 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Chrome 149:** 3 request ke domain eksternal
- `GET` → `app2.rhinocrm.com.br` [CS]
- `GET` → `backend-plugin.wascript.com.br` [CS]
- `GET` → `backend-plugin.wascript.com.br` [CS]
**Chrome 151:** 1 request ke domain eksternal
- `GET` → `backend-plugin.wascript.com.br` [CS]

---

### 73. `lmenhcepphonnfnjkaofobpamlfolgfl`
**Nama:** Black Script

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq,FH
- **Obfuscation:** LOW
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 18 | 6 | 18 |
| Extension Requests | 18 | 6 | 18 |
| Duration (sec) | 193.9 | 193.7 | 183.6 |

---

### 74. `lpfcbjknijpeeillifnkikgncikgfhdo`
**Nama:** Nami

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 59
- **SEE Categories:** UProf,CE,LF,FH,UReq,HH
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 19 | 19 | 19 |
| Extension Requests | 18 | 18 | 18 |
| Duration (sec) | 194.8 | 192.1 | 151.9 |

---

### 75. `maookbdaoegaepgklgimmakbcfjdmbhf`
**Nama:** Peppa Pig Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 18 | 18 | 6 |
| Extension Requests | 18 | 18 | 6 |
| Duration (sec) | 199.2 | 178.7 | 195.8 |

---

### 76. `midamgpdhbehjnjchnegghbhnpkcljmd`
**Nama:** Chiikawa Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 19 | 6 | 6 |
| Extension Requests | 19 | 6 | 6 |
| Duration (sec) | 180.7 | 188.0 | 195.2 |

---

### 77. `mifleipondphdoaampgmkndjjkfldmdb`
**Nama:** Super Mario Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 6 | 6 | 6 |
| Extension Requests | 6 | 6 | 6 |
| Duration (sec) | 296.1 | 181.9 | 183.9 |

---

### 78. `mndeiclfmpndlbkklepkbjihkaccfcod`
**Nama:** The Simpsons Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 104 | 6 | 6 |
| Extension Requests | 104 | 6 | 6 |
| Duration (sec) | 322.7 | 334.5 | 295.5 |

---

### 79. `mpidnflfogjjkchbllplcpcdoifgnjjj`
**Nama:** Spy x Family Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 18 | 6 | 6 |
| Extension Requests | 18 | 6 | 6 |
| Duration (sec) | 190.8 | 387.5 | 326.2 |

---

### 80. `ndhmbgnnienbmkefelhnaodahpjgpnnk`
**Nama:** Easy Group Contact Extractor for WhatsApp©

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 46
- **SEE Categories:** UProf,FH,UReq,CLE,LF,CE,HH,UDown
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 6 | 6 | 179 |
| Extension Requests | 6 | 6 | 179 |
| Duration (sec) | 191.7 | 187.5 | 221.9 |

---

### 81. `nichemncnkkplpkgpndnnedokokhoeam`
**Nama:** Pusheen Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 6 | 6 | 18 |
| Extension Requests | 6 | 6 | 18 |
| Duration (sec) | 151.2 | 141.6 | 226.5 |

---

### 82. `nlppklcmgfgaploglaakimdlfgeinajj`
**Nama:** Blue Lock Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 18 | 18 | 18 |
| Extension Requests | 18 | 18 | 18 |
| Duration (sec) | 191.3 | 221.0 | 196.9 |

---

### 83. `nmcamjpjiefpjagnjmkedchjkmedadhc`
**Nama:** Darktheme for google translate

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UReq
- **Obfuscation:** MEDIUM
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 18 | 6 | 19 |
| Extension Requests | 18 | 6 | 19 |
| Duration (sec) | 192.4 | 191.6 | 197.4 |

---

### 84. `nphplpgoakhhjchkkhmiggakijnkhfnd`
**Nama:** TON Wallet

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 48
- **SEE Categories:** UProf,FH,CLE,CE,HH
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 51 | 42 | 41 |
| Extension Requests | 18 | 6 | 6 |
| Duration (sec) | 157.9 | 195.1 | 196.0 |

---

### 85. `oepjogknopbbibcjcojmedaepolkghpb`
**Nama:** __MSG_extName__

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** FH,UReq,HH
- **Obfuscation:** LOW
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 18 | 18 | 6 |
| Extension Requests | 18 | 18 | 6 |
| Duration (sec) | 192.0 | 198.2 | 206.9 |

---

### 86. `ofjldebeoclakifeeoidicojpinkllmc`
**Nama:** Hollow Knight Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 18 | 6 | 18 |
| Extension Requests | 18 | 6 | 18 |
| Duration (sec) | 201.5 | 204.2 | 186.8 |

---

### 87. `ogghnognjclkbpaeoophcgapbgmgdiok`
**Nama:** Tiktok Order Sync by HubFulFill

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 6 | 19 | 6 |
| Extension Requests | 6 | 19 | 6 |
| Duration (sec) | 260.3 | 204.5 | 192.1 |

---

### 88. `ohkakacjaddkccagpciddgcjjbbpcgfl`
**Nama:** Lightiius CRM para WhatsApp

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 49
- **SEE Categories:** UProf,CE,CLE,FH,HH
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 29 | 18 | 21 |
| Extension Requests | 10 | 9 | 21 |
| Duration (sec) | 230.3 | 247.5 | 198.9 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Chrome 149:** 2 request ke domain eksternal
- `GET` → `crm.lightiius.com` [SW]
- `GET` → `crm.lightiius.com` [CS]
**Chrome 150:** 1 request ke domain eksternal
- `GET` → `crm.lightiius.com` [CS]

---

### 89. `okhibkagcfjdiphcbpepgkcgpbeehmlf`
**Nama:** Disparador WhatsApp WL

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,FH,UReq,LF,CE,HH,UDown
- **Obfuscation:** MEDIUM
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 8 | 163 | 182 |
| Extension Requests | 8 | 162 | 182 |
| Duration (sec) | 194.0 | 290.9 | 256.1 |

---

### 90. `ondkeebbobdggpgmdnimdcnopmckcabp`
**Nama:** Five Nights at Freddy's Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 18 | 6 | 18 |
| Extension Requests | 18 | 6 | 18 |
| Duration (sec) | 365.9 | 366.7 | 190.6 |

---

### 91. `oodhphlpepgoccemjgpedagbpfelcpdl`
**Nama:** Hunter x Hunter Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 160 | 186 | 6 |
| Extension Requests | 160 | 186 | 6 |
| Duration (sec) | 337.2 | 339.7 | 337.7 |

---

### 92. `pahlnbfkogncdbkaeaamcmpmhjecicmh`
**Nama:** Capybara Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 6 | 18 | 240 |
| Extension Requests | 6 | 18 | 240 |
| Duration (sec) | 346.9 | 277.9 | 413.4 |

---

### 93. `pegbfjhhaifipofpkfecmilaplcdhopg`
**Nama:** ELIA IA CRM: WhatsApp, Automações e Ferramentas para venda

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 57
- **SEE Categories:** UProf,FH,UReq,CLE,CE
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 9 | 21 | 8 |
| Extension Requests | 9 | 21 | 8 |
| Duration (sec) | 252.9 | 261.1 | 229.7 |

#### Aktivitas Ekstensi ke Domain Non-Skenario

**Chrome 149:** 1 request ke domain eksternal
- `GET` → `wpres.site` [SW]
**Chrome 150:** 1 request ke domain eksternal
- `GET` → `wpres.site` [SW]
**Chrome 151:** 1 request ke domain eksternal
- `GET` → `wpres.site` [SW]

---

### 94. `pjbgfifennfhnbkhoidkdchbflppjncb`
**Nama:** __MSG_extName__

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UReq
- **Obfuscation:** LOW
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 68 | 57 | 54 |
| Extension Requests | 18 | 6 | 6 |
| Duration (sec) | 193.5 | 201.4 | 197.7 |

---

### 95. `pjlcincdocmbnfjhgbklmagilpmdefdo`
**Nama:** WAPremium MultiWeb

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 48
- **SEE Categories:** UProf,UReq,HH,FH
- **Obfuscation:** HIGH
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 19 | 19 | 18 |
| Extension Requests | 19 | 19 | 18 |
| Duration (sec) | 193.1 | 196.6 | 188.5 |

---

### 96. `pmlcfgndjofkkpimdenhpkmdbmnbfend`
**Nama:** Sonic the Hedgehog Cursor ★ Custom Cursor for Chrome™

#### Analisis Statis
- **Risk Level:** MODERATE
- **Risk Score:** 45
- **SEE Categories:** UProf,UReq
- **Obfuscation:** NONE
- **Cookie Exfiltration:** False
- **Credential Harvesting:** False
- **Taint Flow Count:** 0

#### Hasil Dinamis Per Versi Browser

| Metrik | Chrome 149 | Chrome 150 | Chrome 151 |
|--------|-----|-----|-----|
| SEE Detected | 🚨 YES | 🚨 YES | 🚨 YES |
| S1 Download Hijack | ✅ NO | ✅ NO | ✅ NO |
| S2 Cookie Theft | ✅ NO | ✅ NO | ✅ NO |
| S3 Traffic Redirect | ✅ NO | ✅ NO | ✅ NO |
| Total Outbound Req | 18 | 18 | 18 |
| Extension Requests | 18 | 18 | 18 |
| Duration (sec) | 193.6 | 184.2 | 219.7 |

---
