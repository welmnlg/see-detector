const PROGRESS_BAR_SELECTOR = '#player_layout .pzp-pc-progress-slider';
const BASE_API = 'https://nenekomashiro.com/api/cvh/service/v1';

function showErrorMessage(targetElement, message) {
    removeErrorMessage();
    const oldCanvas = document.getElementById('chzzk-vod-highlighter');
    if (oldCanvas) oldCanvas.remove();

    const errorSpan = document.createElement('span');
    errorSpan.id = 'chzzk-vod-highlighter-error';
    errorSpan.textContent = message;

    Object.assign(errorSpan.style, {
        position: 'absolute',
        bottom: '105%',
        left: '0',
        width: '100%',
        color: '#00ffa3',
        fontSize: '12px',
        fontWeight: 'bold',
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: '10',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
    });

    targetElement.appendChild(errorSpan);
}

function removeErrorMessage() {
    const oldError = document.getElementById('chzzk-vod-highlighter-error');
    if (oldError) oldError.remove();
}

function drawActivityGraph(targetElement, apiData, videoDuration) {
    removeErrorMessage();

    let oldCanvas = document.getElementById('chzzk-vod-highlighter');
    if (oldCanvas) oldCanvas.remove();

    if (!apiData || apiData.length === 0 || !videoDuration || isNaN(videoDuration) || videoDuration <= 0) return;

    const currentPosition = window.getComputedStyle(targetElement).position;
    if (currentPosition === 'static') {
        targetElement.style.position = 'relative';
    }

    const canvas = document.createElement('canvas');
    canvas.id = 'chzzk-vod-highlighter';

    Object.assign(canvas.style, {
        position: 'absolute',
        bottom: '100%',
        left: '0',
        width: '100%',
        height: '40px',
        pointerEvents: 'none',
        zIndex: '10',
    });

    targetElement.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.getBoundingClientRect().width;
    const height = canvas.height = canvas.getBoundingClientRect().height;

    const DONATION_WEIGHT = 20;
    const maxVal = Math.max(...apiData.map(item => Math.max(item.chat, item.donation * DONATION_WEIGHT)));
    if (maxVal === 0) return;

    // chat
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let i = 0; i < apiData.length; i++) {
        const item = apiData[i];
        const safeTime = Math.min(item.time, videoDuration);
        const x = (safeTime / videoDuration) * width;
        const y = height - ((item.chat / maxVal) * height);
        ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // donation
    ctx.fillStyle = 'rgba(0, 255, 163, 0.4)';
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let i = 0; i < apiData.length; i++) {
        const item = apiData[i];
        const safeTime = Math.min(item.time, videoDuration);
        const x = (safeTime / videoDuration) * width;
        const scaledDonation = item.donation * DONATION_WEIGHT;
        const y = height - ((scaledDonation / maxVal) * height);
        ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
}

async function getStreamerIdFromChzzk(videoNo) {
    try {
        const res = await fetch(`https://api.chzzk.naver.com/service/v2/videos/${videoNo}`);
        const data = await res.json();
        return data?.content?.channel?.channelId || null;
    } catch (e) {
        console.error('[ChzzkVodHighlighter] 스트리머 ID 추출 에러:', e);
        return null;
    }
}

async function fetchGraphData(videoNo, container) {
    try {
        const streamerId = await getStreamerIdFromChzzk(videoNo);
        if (!streamerId) { showErrorMessage(container, '영상 정보를 불러올 수 없습니다.'); return null; }

        const streamerRes = await fetch(`${BASE_API}/streamers/${streamerId}`);
        if (streamerRes.status === 404) { showErrorMessage(container, '아직 하이라이트가 지원되지 않는 채널입니다.'); return null; }
        if (!streamerRes.ok) throw new Error('[ChzzkVodHighlighter] 스트리머 조회 에러');

        const statusRes = await fetch(`${BASE_API}/vod/${videoNo}/status`);
        if (statusRes.status === 404) { showErrorMessage(container, '편집 영상이나 오래된 영상은 하이라이트가 제공되지 않습니다.'); return null; }
        if (!statusRes.ok) throw new Error('[ChzzkVodHighlighter] VOD 상태 조회 에러');

        const statusInfo = await statusRes.json();
        if (statusInfo.data.status !== 'COMPLETED') {
            const statusMap = {
                'PENDING': '대기 중',
                'PROCESSING': '분석 진행 중',
                'ERROR': '분석 실패'
            };
            const displayStatus = statusMap[statusInfo.data.status] || '확인 중';
            showErrorMessage(container, `하이라이트를 준비하고 있습니다... (${displayStatus})`);
            return null;
        }

        const graphRes = await fetch(`${BASE_API}/vod/${videoNo}/activitygraph`);
        if (!graphRes.ok) throw new Error('[ChzzkVodHighlighter] 그래프 데이터 조회 에러');
        const graphData = await graphRes.json();

        return (!graphData || graphData.length === 0) ? null : graphData;

    } catch (error) {
        console.error('[ChzzkVodHighlighter] Fetch Error:', error);
        showErrorMessage(container, '데이터를 불러오는 중 오류가 발생했습니다.');
        return null;
    }
}

let appState = {
    videoNo: null,
    data: null,
    isFetching: false,
    checkerInterval: null
};

function initHighlighter(newVideoNo) {
    if (!newVideoNo || appState.videoNo === newVideoNo) return;

    if (appState.checkerInterval) clearInterval(appState.checkerInterval);

    appState = {
        videoNo: newVideoNo,
        data: null,
        isFetching: false,
        checkerInterval: null
    };

    removeErrorMessage();
    const oldCanvas = document.getElementById('chzzk-vod-highlighter');
    if (oldCanvas) oldCanvas.remove();

    appState.checkerInterval = setInterval(async () => {
        const urlMatch = window.location.pathname.match(/\/video\/(\d+)/);
        if (!urlMatch) {
            clearInterval(appState.checkerInterval);
            return;
        }

        if (urlMatch[1] !== appState.videoNo) return;

        const container = document.querySelector(PROGRESS_BAR_SELECTOR);
        const videoElement = document.querySelector('#player_layout video');

        if (!container || !videoElement) return;

        if (document.getElementById('chzzk-vod-highlighter') || document.getElementById('chzzk-vod-highlighter-error')) {
            return;
        }

        if (!appState.data && !appState.isFetching) {
            appState.isFetching = true;
            try {
                appState.data = await fetchGraphData(appState.videoNo, container);
            } finally {
                appState.isFetching = false;
            }
        }

        if (appState.data && videoElement.duration && !isNaN(videoElement.duration)) {
            drawActivityGraph(container, appState.data, videoElement.duration * 1000);
        }
    }, 1000);
}

window.addEventListener('resize', () => {
    if (!appState.data) return;
    const container = document.querySelector(PROGRESS_BAR_SELECTOR);
    const videoElement = document.querySelector('#player_layout video');

    if (container && videoElement && videoElement.duration) {
        drawActivityGraph(container, appState.data, videoElement.duration * 1000);
    }
});

const initialMatch = window.location.pathname.match(/\/video\/(\d+)/);
if (initialMatch) {
    initHighlighter(initialMatch[1]);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'VIDEO_CHANGED' && request.videoNo) {
        initHighlighter(request.videoNo);
    }
});