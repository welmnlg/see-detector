// 监听插件图标点击事件
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage()
})
