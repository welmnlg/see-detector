const INFO_JSON_URL = 'https://raw.githubusercontent.com/kee05077-wq/cyber-campus-ads/main/ads.json'; 

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let showHidden = false; 
let showFuture = false; 

const timeToSec = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
};

function injectUI() {
    if (document.getElementById('cyber-tracker-board')) return;
    
    const board = document.createElement('div');
    board.id = 'cyber-tracker-board';
    board.innerHTML = `
        <div class="header-area">
            <div style="display: flex; align-items: baseline; gap: 10px;">
                <h3 id="tracker-title">⏳ 정보를 불러오는 중...</h3>
                <span id="last-updated-time" style="color: #777; font-size: 13px; font-weight: normal;"></span>
            </div>
            <div>
                <button class="tracker-btn" id="btn-add-manual">➕ 추가</button>
                <button class="tracker-btn" id="btn-refresh">🔄 새로고침</button>
                <button class="tracker-btn" id="btn-toggle-hidden">👁️ 완료항목 보기</button>
                
                <div class="toggle-container">
                    <span class="toggle-label">예정항목</span>
                    <label class="switch">
                        <input type="checkbox" id="toggle-future-checkbox">
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
        </div>
        
        <div id="tracker-progress-container" style="display: none; width: 100%; background-color: #e9ecef; border-radius: 4px; margin-bottom: 15px; overflow: hidden; height: 12px;">
            <div id="tracker-progress-bar" style="width: 0%; height: 100%; background-color: #0055a5; transition: width 0.2s ease;"></div>
        </div>
        <div id="tracker-progress-text" style="display: none; text-align: center; font-size: 12px; color: #555; margin-bottom: 10px; font-weight: bold;">0 / 0 과목 완료</div>

        <div class="tracker-table-wrapper">
            <table id="cyber-tracker-table">
                <thead>
                    <tr>
                        <th width="22%">마감일</th>
                        <th width="24%">과목명</th>
                        <th width="8%">분류</th>
                        <th width="26%">제목</th>
                        <th width="10%">바로가기</th>
                        <th width="10%">완료</th>
                    </tr>
                </thead>
                <tbody id="tracker-list"></tbody>
            </table>
        </div>
        <div id="tracker-ad-banner" style="display: none;"></div>

        <div id="manual-task-modal" class="tracker-modal" style="display: none;">
            <div class="tracker-modal-content">
                <h4>항목 수동 추가</h4>
                <input type="datetime-local" id="manual-date" class="tracker-input">
                <input type="text" id="manual-course" class="tracker-input" placeholder="과목명 (예: 전공기초)">
                <input type="text" id="manual-type" class="tracker-input" placeholder="분류 (예: 실습, 복습)">
                <input type="text" id="manual-title" class="tracker-input" placeholder="제목">
                <textarea id="manual-memo" class="tracker-input" placeholder="메모를 입력하세요..."></textarea>
                <div class="tracker-modal-btns">
                    <button id="btn-save-manual" class="tracker-btn" style="background:#0055a5; color:white;">저장</button>
                    <button id="btn-close-manual" class="tracker-btn">취소</button>
                </div>
            </div>
        </div>
    `;
    
    const target = document.getElementById('region-main') || document.querySelector('#page-content-wrap') || document.body;
    target.prepend(board);

    document.getElementById('btn-refresh').onclick = () => loadTasks(true);
    document.getElementById('btn-toggle-hidden').onclick = toggleHiddenTasks;
    
    document.getElementById('toggle-future-checkbox').onchange = (e) => {
        showFuture = e.target.checked;
        loadTasks(); 
    };
    
    document.getElementById('btn-add-manual').onclick = () => document.getElementById('manual-task-modal').style.display = 'flex';
    document.getElementById('btn-close-manual').onclick = () => document.getElementById('manual-task-modal').style.display = 'none';
    document.getElementById('btn-save-manual').onclick = saveManualTask;
}

function toggleHiddenTasks() {
    showHidden = !showHidden;
    const list = document.getElementById('tracker-list');
    if (!list) return;

    if (showHidden) {
        list.classList.add('show-hidden');
        document.getElementById('btn-toggle-hidden').innerText = '🙈 완료항목 숨기기';
    } else {
        list.classList.remove('show-hidden');
        document.getElementById('btn-toggle-hidden').innerText = '👁️ 완료항목 보기';
    }
}

function saveManualTask() {
    const dVal = document.getElementById('manual-date').value;
    const cVal = document.getElementById('manual-course').value.trim();
    const tVal = document.getElementById('manual-title').value.trim();

    if (!dVal || !cVal || !tVal) return alert("마감일, 과목명, 제목은 필수입니다.");

    const dObj = new Date(dVal);
    const startDateObj = new Date().getTime() - 1000; 

    const newTask = {
        id: "manual_" + Date.now(),
        course: cVal,
        title: tVal,
        type: document.getElementById('manual-type').value.trim() || "기타",
        date: `${dObj.getFullYear()}-${String(dObj.getMonth()+1).padStart(2,'0')}-${String(dObj.getDate()).padStart(2,'0')} ${String(dObj.getHours()).padStart(2,'0')}:${String(dObj.getMinutes()).padStart(2,'0')}:00`,
        startDateObj: startDateObj,
        endDateObj: dObj.getTime(),
        isManual: true, 
        memo: document.getElementById('manual-memo').value.trim()
    };

    chrome.storage.local.get(['manualTasks'], (data) => {
        const mTasks = data.manualTasks || [];
        mTasks.push(newTask);
        chrome.storage.local.set({ manualTasks: mTasks }, () => {
            document.querySelectorAll('.tracker-input').forEach(i => i.value = '');
            document.getElementById('manual-task-modal').style.display = 'none';
            loadTasks(true); 
        });
    });
}

function loadTasks(forceRefresh = false) {
    chrome.storage.local.get(['tasksCache', 'tasksCacheTime', 'hiddenTasks', 'manualTasks'], async (data) => {
        const now = Date.now();
        let hiddenTasks = data.hiddenTasks || [];
        const manualTasks = data.manualTasks || [];
        
        if (!forceRefresh && data.tasksCache && (now - data.tasksCacheTime < 30 * 60 * 1000)) {
            renderTasks([...data.tasksCache, ...manualTasks], hiddenTasks);
            updateTimeUI(data.tasksCacheTime);
            return;
        }

        const titleEl = document.getElementById('tracker-title');
        const progressContainer = document.getElementById('tracker-progress-container');
        const progressBar = document.getElementById('tracker-progress-bar');
        const progressText = document.getElementById('tracker-progress-text');

        if (titleEl) titleEl.innerText = '⚡ 데이터를 수집 중입니다...';
        
        if (progressContainer) progressContainer.style.display = 'block';
        if (progressText) progressText.style.display = 'block';

        try {
            const dashHtml = await fetch('/').then(r => r.text());
            const doc = new DOMParser().parseFromString(dashHtml, 'text/html');
            const links = Array.from(doc.querySelectorAll('.my-course-lists .course_link'));
            
            const totalCourses = links.length;
            let completedCourses = 0;

            if (totalCourses > 0 && progressBar) {
                progressBar.style.width = '0%';
                progressText.innerText = `0 / ${totalCourses} 과목 완료`;
            }

            const fetchPromises = links.map(async (link, index) => {
                try {
                    await delay(index * 50); 

                    const courseUrl = link.href || link.querySelector('a')?.href;
                    if (!courseUrl) return [];
                    
                    const courseIdMatch = courseUrl.match(/id=(\d+)/);
                    const courseId = courseIdMatch ? courseIdMatch[1] : null;
                    const courseName = link.querySelector('.course-title h3')?.innerText.trim() || '알 수 없는 과목';
                    
                    const [courseHtml, progHtml] = await Promise.all([
                        fetch(courseUrl).then(r => r.text()),
                        courseId ? fetch(`/report/ubcompletion/progress.php?id=${courseId}`).then(r => r.text()).catch(() => "") : Promise.resolve("")
                    ]);

                    const cDoc = new DOMParser().parseFromString(courseHtml, 'text/html');

                    let progressMap = {};
                    if (progHtml) {
                        try {
                            const pDoc = new DOMParser().parseFromString(progHtml, 'text/html');
                            pDoc.querySelectorAll('.user_progress tbody tr, .user_progress_table tbody tr').forEach(row => {
                                const titleTd = row.querySelector('.text-left');
                                if (titleTd) {
                                    const titleText = titleTd.textContent.trim();
                                    
                                    const reqTimeTd = titleTd.nextElementSibling;
                                    const recTimeTd = reqTimeTd ? reqTimeTd.nextElementSibling : null;
                                    const statusTd = recTimeTd ? recTimeTd.nextElementSibling : null; 
                                    
                                    if (reqTimeTd && recTimeTd) {
                                        const reqTimeStr = reqTimeTd.textContent.trim();
                                        
                                        let recTimeStr = "";
                                        for (let node of recTimeTd.childNodes) {
                                            if (node.nodeType === Node.TEXT_NODE) {
                                                recTimeStr = node.nodeValue.trim();
                                                if (recTimeStr) break;
                                            }
                                        }
                                        
                                        const statusStr = statusTd ? statusTd.textContent.trim() : "";
                                        progressMap[titleText] = { req: reqTimeStr, rec: recTimeStr, status: statusStr };
                                    }
                                }
                            });
                        } catch (e) {}
                    }

                    let courseTasks = [];
                    const activities = Array.from(cDoc.querySelectorAll('.activity.vod, .activity.assign, .activity.quiz'));
                    
                    for (let act of activities) {
                        const titleNode = act.querySelector('.instancename');
                        const dateNode = act.querySelector('.displayoptions');
                        
                        if (titleNode && dateNode) {
                            let cloneNode = titleNode.cloneNode(true);
                            cloneNode.querySelectorAll('.accesshide').forEach(el => el.remove());
                            
                            let rawTitle = cloneNode.textContent.trim();
                            let displayTitle = rawTitle;
                            let dateText = dateNode.innerText.trim();

                            let isAutoCompleted = false;
                            
                            if (act.classList.contains('vod')) {
                                for (let pTitle in progressMap) {
                                    if (pTitle.includes(rawTitle) || rawTitle.includes(pTitle)) {
                                        const pData = progressMap[pTitle];
                                        const reqSec = timeToSec(pData.req);
                                        const recSec = timeToSec(pData.rec);
                                        
                                        if (pData.rec === 'O' || pData.rec === '완료' || pData.status === 'O' || (reqSec > 0 && recSec >= reqSec)) {
                                            isAutoCompleted = true;
                                            displayTitle += ' <span style="color:#0055a5; font-weight:bold; font-size:12px; margin-left:6px;">(시청완료)</span>';
                                        }
                                        break;
                                    }
                                }
                            }

                            if (dateText.includes('~')) {
                                let parts = dateText.split('~');
                                let startDateStr = parts[0].trim().split('(')[0].replace(/-/g, '/');
                                let endDateStr = parts[1].split('(')[0].split(',')[0].trim().replace(/-/g, '/');
                                
                                const startDate = new Date(startDateStr);
                                const endDate = new Date(endDateStr);
                                
                                if (!isNaN(endDate) && endDate > new Date()) {
                                    const taskId = courseName + "_" + rawTitle;
                                    
                                    let type = '영상';
                                    if (act.classList.contains('assign')) type = '과제';
                                    else if (act.classList.contains('quiz') || act.querySelector('img[src*="quiz"]')) type = '퀴즈';

                                    if (type === '과제') {
                                        try {
                                            const assignUrl = act.querySelector('a')?.href;
                                            if (assignUrl) {
                                                const assignRes = await fetch(assignUrl).catch(() => null);
                                                if (assignRes) {
                                                    const assignDoc = new DOMParser().parseFromString(await assignRes.text(), 'text/html');
                                                    const statusLabels = assignDoc.querySelectorAll('.submissionstatustable .csms-chips-status');
                                                    if (statusLabels.length > 0 && statusLabels[0].classList.contains('csms-chips-status-dot-complete')) {
                                                        displayTitle += ' <span style="color:#0055a5; font-weight:bold; font-size:12px; margin-left:6px;">(기제출됨)</span>';
                                                        isAutoCompleted = true; 
                                                    }
                                                }
                                            }
                                        } catch (e) {}
                                    }

                                    if (isAutoCompleted && !hiddenTasks.includes(taskId)) {
                                        hiddenTasks.push(taskId);
                                    }

                                    let isDuplicate = courseTasks.some(t => t.id === taskId);
                                    if (!isDuplicate) {
                                        courseTasks.push({
                                            id: taskId,
                                            course: courseName,
                                            title: displayTitle,
                                            rawTitle: rawTitle,
                                            type: type,
                                            date: endDateStr.replace(/\//g, '-'),
                                            url: act.querySelector('a')?.href || link.href,
                                            courseUrl: link.href,
                                            startDateObj: startDate.getTime(), 
                                            endDateObj: endDate.getTime(),
                                            isManual: false
                                        });
                                    }
                                }
                            }
                        }
                    }
                    return courseTasks;
                } catch (e) {
                    return [];
                } finally {
                    completedCourses++;
                    if (progressBar && progressText) {
                        const percent = Math.round((completedCourses / totalCourses) * 100);
                        progressBar.style.width = `${percent}%`;
                        progressText.innerText = `${completedCourses} / ${totalCourses} 과목 완료`;
                    }
                }
            });

            const resultsArrays = await Promise.all(fetchPromises);
            let allTasks = resultsArrays.flat();

            setTimeout(() => {
                if (progressContainer) progressContainer.style.display = 'none';
                if (progressText) progressText.style.display = 'none';
            }, 600); 

            chrome.storage.local.set({ tasksCache: allTasks, tasksCacheTime: now, hiddenTasks: hiddenTasks }, () => {
                renderTasks([...allTasks, ...manualTasks], hiddenTasks);
                updateTimeUI(now);
            });

        } catch (error) {
            if (titleEl) titleEl.innerText = '❌ 오류 발생 (새로고침 요망)';
        }
    });
}

function renderTasks(tasks, hiddenTasks) {
    const list = document.getElementById('tracker-list');
    if (!list) return;
    list.innerHTML = '';
    
    let visibleCount = 0;
    const nowTime = new Date().getTime();

    const uniqueTasks = Array.from(new Map(tasks.map(item => [item.id, item])).values());

    uniqueTasks.sort((a, b) => a.endDateObj - b.endDateObj).forEach(task => {
        if (!task.endDateObj || task.endDateObj < nowTime) return;

        const isHidden = hiddenTasks.includes(task.id);
        const isFuture = task.startDateObj > nowTime; 

        if (isFuture && !showFuture) return; 

        if (!isHidden) visibleCount++;

        const tr = document.createElement('tr');
        
        tr.className = 'tracker-row';
        if (isHidden) tr.classList.add('hidden-task');
        if (isFuture) tr.classList.add('future-task');

        const btnHtml = task.isManual 
            ? `<button class="btn-shortcut btn-memo" data-id="${task.id}">메모</button>` 
            : `<button class="btn-shortcut btn-move" data-url="${task.courseUrl || task.url}" data-title="${task.rawTitle.replace(/"/g, '&quot;')}">이동</button>`;
        
        tr.innerHTML = `
            <td class="tracker-due-date">${task.date}</td>
            <td>${task.course}</td>
            <td><span class="type-badge type-${task.type}">${task.type}</span></td>
            <td class="tracker-title">${task.title}</td>
            <td>${btnHtml}</td>
            <td><input type="checkbox" class="tracker-checkbox" data-id="${task.id}" ${isHidden ? 'checked' : ''}></td>
        `;
        list.appendChild(tr);
    });

    document.getElementById('tracker-title').innerText = `🔥 남은 학습: ${visibleCount}개`;

    document.querySelectorAll('.btn-memo').forEach(b => b.onclick = (e) => {
        const t = uniqueTasks.find(x => x.id === e.target.dataset.id);
        if(t) alert(`[${t.course}]\n${t.rawTitle}\n\n${t.memo || "메모가 없습니다."}`);
    });
    document.querySelectorAll('.btn-move').forEach(b => b.onclick = (e) => {
        sessionStorage.setItem('cyberAutoScrollTarget', e.target.dataset.title);
        window.location.href = e.target.dataset.url;
    });
    document.querySelectorAll('.tracker-checkbox').forEach(c => c.onchange = (e) => {
        chrome.storage.local.get(['hiddenTasks'], (d) => {
            let hTasks = d.hiddenTasks || [];
            if (e.target.checked) hTasks.push(e.target.dataset.id);
            else hTasks = hTasks.filter(id => id !== e.target.dataset.id);
            chrome.storage.local.set({ hiddenTasks: hTasks }, () => loadTasks());
        });
    });
}

function updateTimeUI(timestamp) {
    const d = new Date(timestamp);
    const timeEl = document.getElementById('last-updated-time');
    if (timeEl) timeEl.innerText = `(마지막 업데이트: ${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')})`;
}

function checkAndAutoScroll() {
    const scrollTarget = sessionStorage.getItem('cyberAutoScrollTarget');
    if (scrollTarget && window.location.href.includes('/course/')) {
        let attempts = 0, found = false;
        
        const targetText = scrollTarget.normalize('NFC').replace(/\s+/g, '').toLowerCase();

        const findAndScroll = setInterval(() => {
            attempts++;
            for (let node of document.querySelectorAll('.instancename')) {
                let clone = node.cloneNode(true);
                clone.querySelectorAll('.accesshide').forEach(el => el.remove());
                
                const nodeText = clone.textContent.normalize('NFC').replace(/\s+/g, '').toLowerCase();

                if (nodeText === targetText) {
                    const activityBox = node.closest('.activity');
                    if (activityBox) {
                        activityBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        activityBox.style.backgroundColor = "#fff3cd"; 
                        setTimeout(() => activityBox.style.backgroundColor = "", 2000);
                        found = true;
                        break; 
                    }
                }
            }
            if (found || attempts >= 50) { 
                clearInterval(findAndScroll); 
                sessionStorage.removeItem('cyberAutoScrollTarget'); 
            }
        }, 130); 
    }
}

async function loadNotice() {
    const adContainer = document.getElementById('tracker-ad-banner');
    if (!adContainer || !window.location.href.includes('cyber.gachon.ac.kr/')) return;
    if (localStorage.getItem('cyberAdHideUntil') > Date.now()) return;

    try {
        const res = await fetch(INFO_JSON_URL).catch(() => null);
        if (!res) return;
        const data = await res.json();
        if (data?.imageUrl) {
            adContainer.innerHTML = `<button id="btn-close-ad" class="ad-close-btn">오늘 안 보기 ✖</button>
                <a href="${data.linkUrl || '#'}" target="_blank"><img src="${data.imageUrl}" style="width: 100%; object-fit: contain;" /></a>`;
            adContainer.style.display = 'block'; 
            document.getElementById('btn-close-ad').onclick = () => {
                localStorage.setItem('cyberAdHideUntil', Date.now() + 86400000);
                adContainer.style.display = 'none';
            };
        }
    } catch(e) {}
}

function initVideoDownloader() {
    const viewerRegex = /\/mod\/vod\/viewer\.php\?id=\d+/;
    if (!viewerRegex.test(window.location.href)) return;

    setTimeout(() => {
        if (document.getElementById('my-cyber-download-btn')) return;

        const header = document.getElementById('vod_header');
        if (!header) return;

        header.style.position = 'relative';
        header.style.overflow  = 'visible';

        const btn = document.createElement('button');
        btn.id = 'my-cyber-download-btn';
        btn.innerHTML = '⬇ 다운로드';
        btn.style.cssText = `
            position: absolute;
            top: 50%;
            right: 130px; /* 💡 도움말 ? 아이콘 왼쪽에 안정적으로 배치되도록 55px에서 130px로 수정 */
            transform: translateY(-50%);
            background: linear-gradient(135deg, #1a8cff 0%, #0055a5 100%);
            color: #fff;
            border: none;
            padding: 6px 18px;
            font-size: 13px;
            font-weight: 700;
            border-radius: 999px;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,85,165,0.5);
            transition: all 0.18s ease;
            white-space: nowrap;
            z-index: 9999;
        `;
        btn.onmouseover = () => {
            btn.style.background = 'linear-gradient(135deg, #0055a5 0%, #003d7a 100%)';
            btn.style.boxShadow = '0 4px 14px rgba(0,85,165,0.7)';
            btn.style.transform = 'translateY(calc(-50% - 1px))';
        };
        btn.onmouseout = () => {
            btn.style.background = 'linear-gradient(135deg, #1a8cff 0%, #0055a5 100%)';
            btn.style.boxShadow = '0 2px 8px rgba(0,85,165,0.5)';
            btn.style.transform = 'translateY(-50%)';
        };
        btn.onclick = startVodDownload;
        header.appendChild(btn);

    }, 1500);
}

function startVodDownload() {
    // 💡 요청하신 오리지널 삼줄 면책조항 적용 복구
    const disclaimer =
        "개발자는 해당 다운로드 기능으로 발생할 수 있는 모든 법적 문제와 무관하며,\n" +
        "사용자께서는 저작권법을 준수하면서 사용하시기 바랍니다.\n" +
        "확인을 누르시면 이에 동의하신 것으로 간주되며 다운로드가 실행됩니다.";
    if (!confirm(disclaimer)) return;

    const old = document.getElementById('_vod_extractor');
    if (old) old.remove();

    const script = document.createElement('script');
    script.id = '_vod_extractor';
    script.src = chrome.runtime.getURL('inject.js');
    
    script.onerror = () => {
        alert("❌ 'inject.js' 파일을 불러오지 못했습니다. 확장 프로그램 관리를 다시 확인하세요.");
    };

    document.body.appendChild(script);

    window.addEventListener('message', function handler(e) {
        if (!e.data || e.data.type !== 'VOD_URL_RESULT') return;
        window.removeEventListener('message', handler);
        
        const extractor = document.getElementById('_vod_extractor');
        if (extractor) extractor.remove();

        const vodUrl = e.data.url;
        if (!vodUrl) {
            alert('❌ 영상 주소를 찾지 못했습니다. 플레이어가 완전히 로드된 후 다시 시도하세요.');
            return;
        }

        // mp4 일반 비디오인 경우에만 백그라운드를 통해 저장 (m3u8은 inject.js 내부에서 자체 완료됨)
        if (!vodUrl.includes('.m3u8')) {
            chrome.runtime.sendMessage({
                type: 'DOWNLOAD_FILE',
                url: vodUrl,
                filename: e.data.filename || '동영상강의.mp4'
            }, (res) => {
                if (chrome.runtime.lastError) {
                    alert("❌ 백그라운드 연결 실패: " + chrome.runtime.lastError.message);
                } else if (res && res.error) {
                    alert("❌ 다운로드 실행 실패: " + res.error);
                }
            });
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    const isViewer = /\/mod\/vod\/viewer\.php/.test(window.location.href);

    if (isViewer) {
        initVideoDownloader();
    } else {
        injectUI();
        loadTasks();
        loadNotice();
        checkAndAutoScroll();
    }
}