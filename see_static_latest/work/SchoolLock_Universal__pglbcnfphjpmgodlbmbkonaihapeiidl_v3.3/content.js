let lockInterval = null;
const pressedKeys = new Set(); 

function toHalfWidth(str) {
  return str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
}

// ---------------------------------------------
//  画面ロック表示
// ---------------------------------------------
function showLock() {
  if (document.getElementById('lock-ui-screen')) return;
  
  const overlay = document.createElement('div');
  overlay.id = 'lock-ui-screen';
  
  // 文字位置調整済み（margin-bottom: 50px）
  overlay.innerHTML = `
    <div style="font-size:min(20vw, 100px); margin-bottom: 50px;">🛑</div>
    <h1 style="font-size:min(10vw, 50px); margin:0; font-weight:bold;">停止中</h1>
  `;
  
  Object.assign(overlay.style, {
    position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
    backgroundColor: 'black', color: 'white', zIndex: '2147483647',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'sans-serif', textAlign: 'center', cursor: 'none'
  });
  
  overlay.addEventListener('click', e => e.stopPropagation(), true);
  overlay.addEventListener('keydown', e => e.stopPropagation(), true);
  
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
}

function removeLock() {
  const overlay = document.getElementById('lock-ui-screen');
  if (overlay) {
    overlay.remove();
    document.body.style.overflow = '';
  }
}

// ---------------------------------------------
//  メッセージ受信
// ---------------------------------------------
chrome.runtime.onMessage.addListener((message) => {
  // 「ロック」または「閉じる」なら画面を黒くする
  if (message.status === "ロック" || message.status === "閉じる") {
    showLock();
    if (!lockInterval) lockInterval = setInterval(showLock, 1000);
  } else {
    // 「通常」などが来たら解除
    if (lockInterval) { clearInterval(lockInterval); lockInterval = null; }
    removeLock();
  }
});

// ---------------------------------------------
//  隠しコマンド & 生徒情報設定
// ---------------------------------------------
document.addEventListener('keydown', (e) => {
  pressedKeys.add(e.code);
  const hasShift = pressedKeys.has('ShiftLeft') || pressedKeys.has('ShiftRight');
  const hasSpace = pressedKeys.has('Space');
  const hasS = pressedKeys.has('KeyS');
  const hasEnter = pressedKeys.has('Enter');

  if (hasShift && hasSpace && hasS && hasEnter) {
    if (confirm("管理者用リセット：生徒情報を削除しますか？")) {
      chrome.storage.local.remove(["grade", "studentId"], () => {
        alert("リセットしました。ページを再読み込みして再設定してください。");
        location.reload();
      });
    }
    pressedKeys.clear();
  }
});

document.addEventListener('keyup', (e) => {
  pressedKeys.delete(e.code);
});

chrome.storage.local.get(["grade", "studentId", "lastResetYear"], (data) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const isResetDay = (month === 3 && date >= 30) || (month > 3);

  if (isResetDay && data.lastResetYear !== currentYear) {
    chrome.storage.local.set({ grade: null, studentId: null, lastResetYear: currentYear }, () => {
      location.reload();
    });
    return;
  }

  if (!data.grade || !data.studentId) {
    let g = "", i = "";
    while (true) {
      let inputG = prompt("学年を入力してください (例: 1)");
      if (!inputG) continue;
      g = toHalfWidth(inputG).replace(/[^0-9]/g, "");
      if (g) break;
    }
    while (true) {
      let inputI = prompt("出席番号を入力してください (例: 12)");
      if (!inputI) continue;
      i = toHalfWidth(inputI).replace(/[^0-9]/g, "");
      if (i) break;
    }
    if (g && i) {
      chrome.storage.local.set({ grade: g, studentId: i }, () => {
        alert("設定完了。変更するには先生に連絡してください。");
        location.reload();
      });
    }
  }
});