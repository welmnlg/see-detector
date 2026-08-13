window.onload = function () {
  var myOnOffSwitch = document.getElementById('switchBtn');
  myOnOffSwitch.addEventListener('click', function () {
    if (myOnOffSwitch.checked == true) {
      chrome.storage.local.set({ "gamesLiveState": "on" });
    } else {
      chrome.storage.local.set({ "gamesLiveState": "off" });
    };
  });

  chrome.storage.local.get(["gamesLiveState"], function (result) {
    if (result.gamesLiveState === "on" || result.gamesLiveState === undefined) {
      myOnOffSwitch.checked = true;
    } else {
      myOnOffSwitch.checked = false;
    }
  });
}

