(async function () {
    console.log("💡 [inject.js] 사이버캠퍼스 플레이어 내부로 정상 침투 완료!");
    let url = null;

    // 1순위: JWPlayer API 활용
    try {
        if (typeof jwplayer === 'function') {
            const p = jwplayer();
            if (p && p.getPlaylist) {
                const pl = p.getPlaylist();
                if (pl && pl.length > 0) {
                    url = pl[0].file || null;
                    if (!url && pl[0].sources && pl[0].sources.length > 0) {
                        url = pl[0].sources[0].file;
                    }
                }
            }
        }
    } catch (e) {}

    // 2순위: 전체 소스코드 강제 탐색
    if (!url) {
        const html = document.documentElement.innerHTML;
        const match = html.match(/https?:\/\/[^"']*\.(m3u8|mp4)[^"']*/i);
        if (match) {
            url = match[0].replace(/\\/g, '');
        }
    }

    if (!url) {
        window.postMessage({ type: 'VOD_URL_RESULT', url: null }, '*');
        return;
    }

    console.log("💡 [inject.js] 최종 추출된 URL:", url);

    // ── 1. 영상 이름 정밀 추출 로직 (기본 파일명 세팅) ──
    let defaultFilename = "사이버캠퍼스_강의";
    try {
        const h1El = document.querySelector('#vod_header h1');
        if (h1El) {
            const clone = h1El.cloneNode(true);
            clone.querySelectorAll('span').forEach(s => s.remove());
            const text = clone.textContent.trim();
            if (text) {
                defaultFilename = text;
            }
        }
    } catch (e) {
        console.error("[inject.js] 파일 이름 추출 중 오류:", e);
    }

    let userFilename = defaultFilename.replace(/[\\/:*?"<>|]/g, '_');
    if (!userFilename.toLowerCase().endsWith('.mp4')) {
        userFilename += '.mp4';
    }

    // ── 2. M3U8 다운로드: 폴더 지정 및 실시간 디스크 저장 ──
    if (url.includes('.m3u8')) {
        
        let fileHandle;
        try {
            // ★ 여기서 윈도우의 '다른 이름으로 저장' 창이 강제로 뜹니다.
            fileHandle = await window.showSaveFilePicker({
                suggestedName: userFilename,
                types: [{
                    description: 'MP4 Video',
                    accept: { 'video/mp4': ['.mp4'] }
                }]
            });
        } catch (e) {
            // 사용자가 저장 창에서 '취소'를 누르면 조용히 종료합니다.
            return; 
        }

        // 진행률 UI 생성
        const progressUi = document.createElement('div');
        progressUi.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9); color: #fff; padding: 30px 40px;
            border-radius: 12px; font-size: 16px; font-weight: bold; z-index: 9999999;
            text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            display: flex; flex-direction: column; gap: 15px; width: 320px;
        `;
        const statusText = document.createElement('div');
        statusText.innerText = "영상 구조를 분석하는 중...";
        
        const progressBar = document.createElement('div');
        progressBar.style.cssText = "width: 100%; height: 10px; background: #333; border-radius: 5px; overflow: hidden;";
        const progressFill = document.createElement('div');
        progressFill.style.cssText = "width: 0%; height: 100%; background: #1a8cff; transition: width 0.1s;";
        
        progressBar.appendChild(progressFill);
        progressUi.appendChild(statusText);
        progressUi.appendChild(progressBar);
        document.body.appendChild(progressUi);

        try {
            // 하드디스크에 직접 쓸 수 있는 스트림 열기
            const writable = await fileHandle.createWritable();

            let m3u8Text = await fetch(url).then(r => r.text());
            let baseUrl = url.substring(0, url.lastIndexOf('/') + 1);

            if (m3u8Text.includes('#EXT-X-STREAM-INF')) {
                const lines = m3u8Text.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].includes('.m3u8')) {
                        let subUrl = lines[i].trim();
                        if (!subUrl.startsWith('http')) subUrl = baseUrl + subUrl;
                        url = subUrl;
                        baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
                        m3u8Text = await fetch(url).then(r => r.text());
                        break;
                    }
                }
            }

            const lines = m3u8Text.split('\n');
            const tsUrls = [];
            for (let line of lines) {
                line = line.trim();
                if (line && !line.startsWith('#')) {
                    if (line.startsWith('http')) tsUrls.push(line);
                    else tsUrls.push(baseUrl + line);
                }
            }

            if (tsUrls.length === 0) throw new Error("영상 조각을 찾을 수 없습니다.");

            // 조각을 다운로드하는 즉시 하드디스크로 직행 (램 과부하 없음)
            for (let i = 0; i < tsUrls.length; i++) {
                statusText.innerText = `영상을 다운로드 중... (${i + 1} / ${tsUrls.length})`;
                progressFill.style.width = `${((i + 1) / tsUrls.length) * 100}%`;
                
                const res = await fetch(tsUrls[i]);
                if (!res.ok) throw new Error(`네트워크 오류 (${res.status})`);
                
                const buffer = await res.arrayBuffer();
                await writable.write(buffer); 
            }

            // 파일 쓰기 종료 및 저장 완료
            await writable.close();
            statusText.innerText = "✅ 파일 저장 완료!";
            progressFill.style.background = '#00c853';
            
            setTimeout(() => {
                progressUi.remove();
            }, 2000);

        } catch (error) {
            statusText.innerText = "❌ 다운로드 실패";
            statusText.style.color = "#ff4d4d";
            progressBar.style.display = 'none';
            const errorMsg = document.createElement('div');
            errorMsg.style.fontSize = "13px";
            errorMsg.innerText = "사유: " + error.message;
            progressUi.appendChild(errorMsg);
            setTimeout(() => progressUi.remove(), 4000);
        }
    } else {
        // mp4 일반 비디오는 백그라운드 스크립트를 통해 저장 창 띄우기
        window.postMessage({ type: 'VOD_URL_RESULT', url: url, filename: userFilename }, '*');
    }
})();