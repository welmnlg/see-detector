document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.isComposing) {
    const target = e.target;
    if (target.tagName === 'TEXTAREA' ||
        (target.tagName === 'INPUT' && target.type === 'text')) {
      e.stopPropagation();
    }
  }
}, true);
