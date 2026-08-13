let syncEnabled = false;
let isSyncing = false;
let syncGroupId = null;
let syncMode = 'smart';

// background.js에서 현재 상태 가져오기
chrome.runtime.sendMessage({ type: 'GET_SYNC_STATE' }, (response) => {
  if (response) {
    syncEnabled = response.syncEnabled || false;
    syncMode = response.syncMode || 'smart';
  }
});

function getAllHeadings() {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, [data-testid*="heading"], .confluence-header, .page-title');

  return Array.from(headings)
    .map(heading => {
      const rect = heading.getBoundingClientRect();
      const absoluteTop = rect.top + window.scrollY;
      return {
        element: heading,
        text: heading.textContent.trim(),
        top: absoluteTop,
        tagName: heading.tagName
      };
    })
    .filter(h => h.text.length > 0);
}

function getVisibleHeadings() {
  const headings = getAllHeadings();
  const viewportTop = window.scrollY;
  const viewportBottom = viewportTop + window.innerHeight;
  const viewportCenter = viewportTop + window.innerHeight / 2;

  const visibleHeadings = headings
    .filter(h => h.top >= viewportTop - 500 && h.top <= viewportBottom + 500)
    .map(h => ({
      ...h,
      distanceFromCenter: Math.abs(h.top - viewportCenter)
    }))
    .sort((a, b) => a.distanceFromCenter - b.distanceFromCenter);

  return visibleHeadings;
}

function findSurroundingHeadings() {
  const allHeadings = getAllHeadings();
  const viewportTop = window.scrollY;
  const viewportCenter = viewportTop + window.innerHeight / 2;

  let aboveHeading = null;
  let belowHeading = null;

  for (let i = 0; i < allHeadings.length; i++) {
    const heading = allHeadings[i];

    if (heading.top <= viewportCenter) {
      aboveHeading = heading;
    }

    if (heading.top > viewportCenter && !belowHeading) {
      belowHeading = heading;
      break;
    }
  }

  return { aboveHeading, belowHeading };
}

function findMatchingHeading(targetText) {
  const allHeadings = getAllHeadings();

  for (let heading of allHeadings) {
    const headingText = heading.text;

    if (headingText === targetText) {
      return heading;
    }

    if (headingText.includes(targetText) || targetText.includes(headingText)) {
      if (Math.abs(headingText.length - targetText.length) / Math.max(headingText.length, targetText.length) < 0.5) {
        return heading;
      }
    }
  }

  return null;
}

function calculateInterpolatedPosition(sourceAbove, sourceBelow, sourceViewportCenter, targetAbove, targetBelow) {
  if (!sourceAbove || !targetAbove) {
    return null;
  }

  if (!sourceBelow || !targetBelow) {
    const offsetFromAbove = sourceViewportCenter - sourceAbove.top;
    return targetAbove.top + offsetFromAbove;
  }

  const sourceDistance = sourceBelow.top - sourceAbove.top;
  const targetDistance = targetBelow.top - targetAbove.top;

  if (sourceDistance <= 0) {
    return targetAbove.top;
  }

  const progressBetweenHeadings = (sourceViewportCenter - sourceAbove.top) / sourceDistance;
  const interpolatedPosition = targetAbove.top + (targetDistance * progressBetweenHeadings);

  return interpolatedPosition;
}

function getViewportInfo() {
  const viewportTop = window.scrollY;
  const viewportHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const viewportCenter = viewportTop + viewportHeight / 2;

  const { aboveHeading, belowHeading } = findSurroundingHeadings();

  return {
    scrollPercentage: viewportTop / (documentHeight - viewportHeight),
    viewportTop,
    viewportHeight,
    viewportCenter,
    documentHeight,
    aboveHeading: aboveHeading ? {
      text: aboveHeading.text,
      top: aboveHeading.top,
      tagName: aboveHeading.tagName
    } : null,
    belowHeading: belowHeading ? {
      text: belowHeading.text,
      top: belowHeading.top,
      tagName: belowHeading.tagName
    } : null
  };
}

function smartScroll(targetInfo) {
  if (syncMode !== 'smart') {
    return false;
  }

  const sourceAbove = targetInfo.aboveHeading;
  const sourceBelow = targetInfo.belowHeading;

  if (!sourceAbove) {
    return false;
  }

  const targetAboveMatch = findMatchingHeading(sourceAbove.text);

  if (!targetAboveMatch) {
    return false;
  }

  let targetPosition;

  if (sourceBelow) {
    const targetBelowMatch = findMatchingHeading(sourceBelow.text);

    if (targetBelowMatch) {
      targetPosition = calculateInterpolatedPosition(
        { top: sourceAbove.top },
        { top: sourceBelow.top },
        targetInfo.viewportCenter,
        { top: targetAboveMatch.top },
        { top: targetBelowMatch.top }
      );
    } else {
      const offsetFromAbove = targetInfo.viewportCenter - sourceAbove.top;
      targetPosition = targetAboveMatch.top + offsetFromAbove;
    }
  } else {
    const offsetFromAbove = targetInfo.viewportCenter - sourceAbove.top;
    targetPosition = targetAboveMatch.top + offsetFromAbove;
  }

  if (targetPosition !== null) {
    const targetScrollTop = targetPosition - window.innerHeight / 2;

    window.scrollTo({
      top: Math.max(0, Math.min(targetScrollTop, document.documentElement.scrollHeight - window.innerHeight)),
      behavior: 'instant'
    });

    return true;
  }

  return false;
}

function percentageScroll(scrollPercentage) {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const targetScrollTop = scrollHeight * scrollPercentage;

  window.scrollTo({
    top: targetScrollTop,
    behavior: 'instant'
  });
}

function viewportBasedScroll(targetInfo) {
  const currentDocHeight = document.documentElement.scrollHeight;
  const targetDocHeight = targetInfo.documentHeight;
  const ratio = currentDocHeight / targetDocHeight;

  const estimatedScrollTop = targetInfo.viewportTop * ratio;

  window.scrollTo({
    top: estimatedScrollTop,
    behavior: 'instant'
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SYNC_SCROLL') {
    if (!isSyncing && syncEnabled) {
      isSyncing = true;

      let success = false;

      if (syncMode === 'smart') {
        success = smartScroll(message.viewportInfo);
      }

      if (!success && syncMode === 'viewport') {
        viewportBasedScroll(message.viewportInfo);
      } else if (!success) {
        percentageScroll(message.viewportInfo.scrollPercentage);
      }

      setTimeout(() => {
        isSyncing = false;
      }, 50);
    }
  } else if (message.type === 'SET_SYNC_GROUP') {
    syncGroupId = message.groupId;
  } else if (message.type === 'GET_SYNC_STATUS') {
    sendResponse({ syncEnabled, syncGroupId, syncMode });
  } else if (message.type === 'SYNC_ENABLED_CHANGED') {
    syncEnabled = message.enabled;
  } else if (message.type === 'SYNC_MODE_CHANGED') {
    syncMode = message.mode;
  }

  return true;
});

let scrollTimeout;
window.addEventListener('scroll', () => {
  if (!syncEnabled || isSyncing) return;

  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    const viewportInfo = getViewportInfo();

    chrome.runtime.sendMessage({
      type: 'SCROLL_EVENT',
      viewportInfo: viewportInfo,
      syncGroupId: syncGroupId
    });
  }, 100);
}, { passive: true });
