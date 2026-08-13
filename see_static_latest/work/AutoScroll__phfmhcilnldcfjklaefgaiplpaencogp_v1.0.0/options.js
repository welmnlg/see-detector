"use strict";

const defaults = {
  dragThreshold: 10,
  moveThreshold: 10,
  moveSpeed: 10,
  stickyScroll: true,
  innerScroll: true,
  scrollOnLinks: false,
  sameSpeed: false,
  capSpeed: "",
  shouldCap: false,
  ctrlClick: true,
  middleClick: true
}

function restoreOptions() {
  chrome.storage.local.get(defaults, (items) => {
    document.getElementById('stickyScroll').checked = items.stickyScroll;
    document.getElementById('dragThreshold').value = items.dragThreshold;
    document.getElementById('moveThreshold').value = items.moveThreshold;
    document.getElementById('middleClick').checked = items.middleClick;
    document.getElementById('ctrlClick').checked = items.ctrlClick;
    document.getElementById('moveSpeed').value = items.moveSpeed;
    document.getElementById('sameSpeed').checked = items.sameSpeed;
    document.getElementById('shouldCap').checked = items.shouldCap;
    document.getElementById('capSpeed').value = items.capSpeed;
    document.getElementById('innerScroll').checked = items.innerScroll;
    document.getElementById('scrollOnLinks').checked = items.scrollOnLinks;
  });
}

function saveOptions() {
  let capSpeedVal = document.getElementById('capSpeed').value;
  let capSpeed = (capSpeedVal === "") ? "" : Number(capSpeedVal);

  const options = {
    stickyScroll: document.getElementById('stickyScroll').checked,
    dragThreshold: Number(document.getElementById('dragThreshold').value),
    moveThreshold: Number(document.getElementById('moveThreshold').value),
    middleClick: document.getElementById('middleClick').checked,
    ctrlClick: document.getElementById('ctrlClick').checked,
    moveSpeed: Number(document.getElementById('moveSpeed').value),
    sameSpeed: document.getElementById('sameSpeed').checked,
    shouldCap: document.getElementById('shouldCap').checked,
    capSpeed: capSpeed,
    innerScroll: document.getElementById('innerScroll').checked,
    scrollOnLinks: document.getElementById('scrollOnLinks').checked,
  };
  chrome.storage.local.set(options);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.addEventListener('change', saveOptions);
document.addEventListener('input', saveOptions);