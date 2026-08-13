const input = document.getElementById('gasUrl');
const saveBtn = document.getElementById('save');
const resetBtn = document.getElementById('resetInfo');
const status = document.getElementById('status');

// パスワード設定
const ADMIN_PASSWORD = "School-Lock";

// 保存済みURLを表示
chrome.storage.local.get("gasUrl", (data) => {
  if (data.gasUrl) input.value = data.gasUrl;
});

// ------------------------------------------------
//  URL保存処理
// ------------------------------------------------
saveBtn.addEventListener('click', async () => {
  const newUrl = input.value.trim();

  // URL形式チェック
  if (!newUrl.startsWith("https://script.google.com/")) {
    showMessage("❌ 正しいURLを入力してください。", "#d93025");
    return;
  }

  // 現在の保存状況を確認
  const currentData = await chrome.storage.local.get("gasUrl");
  const isFirstTime = !currentData.gasUrl; // URLが空なら初回とみなす

  // 初回でなければパスワード確認
  if (!isFirstTime) {
    const password = prompt("設定を変更するにはパスワードを入力してください");
    if (password !== ADMIN_PASSWORD) {
      alert("パスワードが違います。変更できません。");
      return;
    }
  }

  // 保存実行
  await chrome.storage.local.set({ gasUrl: newUrl });
  showMessage("✅ 保存完了。この端末で有効になりました。", "#188038");
});

// ------------------------------------------------
//  生徒情報リセット処理
// ------------------------------------------------
resetBtn.addEventListener('click', async () => {
  // 現在の保存状況を確認
  const currentData = await chrome.storage.local.get(["grade", "studentId"]);
  const hasData = currentData.grade || currentData.studentId;

  // データが何もない場合はリセット不要（または即実行でOK）だが、
  // 「変更時」という要件なので、データがある場合のみパスワードを聞く
  if (hasData) {
    const password = prompt("生徒情報をリセットするにはパスワードを入力してください");
    if (password !== ADMIN_PASSWORD) {
      alert("パスワードが違います。リセットできません。");
      return;
    }
  }

  // 確認ダイアログ（念のため残す）
  if (confirm("本当に生徒情報（学年・出席番号）をリセットしますか？\n次回起動時に再入力画面が表示されます。")) {
    await chrome.storage.local.remove(["grade", "studentId"]);
    showMessage("🗑️ 生徒情報を削除しました。", "#d93025");
  }
});

// メッセージ表示用ユーティリティ
function showMessage(msg, color) {
  status.style.color = color;
  status.innerText = msg;
  setTimeout(() => { status.innerText = ""; }, 3000);
}