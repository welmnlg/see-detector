// Disable autocomplete on all input fields
function disableAutocomplete() {
  // Target all inputs, textareas, and forms
  const inputs = document.querySelectorAll('input, textarea');
  const forms = document.querySelectorAll('form');

  inputs.forEach(input => {
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('spellcheck', 'false');
  });

  forms.forEach(form => {
    form.setAttribute('autocomplete', 'off');
  });
}

// Run on initial load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', disableAutocomplete);
} else {
  disableAutocomplete();
}

// Watch for dynamically added elements
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.matches && (node.matches('input, textarea, form'))) {
          node.setAttribute('autocomplete', 'off');
          if (node.matches('input, textarea')) {
            node.setAttribute('autocorrect', 'off');
            node.setAttribute('autocapitalize', 'off');
            node.setAttribute('spellcheck', 'false');
          }
        }
        // Also check children of added nodes
        const children = node.querySelectorAll && node.querySelectorAll('input, textarea, form');
        if (children) {
          children.forEach(child => {
            child.setAttribute('autocomplete', 'off');
            if (child.matches('input, textarea')) {
              child.setAttribute('autocorrect', 'off');
              child.setAttribute('autocapitalize', 'off');
              child.setAttribute('spellcheck', 'false');
            }
          });
        }
      }
    });
  });
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});
