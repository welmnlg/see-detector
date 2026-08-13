/**
 * ChatGPT Deep Research Copier
 * Adds a "Copy Article" button to Deep Research blocks in ChatGPT
 */

(function() {
  'use strict';

  // Track processed articles to avoid duplicate buttons
  const processedArticles = new WeakSet();

  // ============================================
  // ICONS
  // ============================================

  const ICONS = {
    copy: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>`,
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>`
  };

  // ============================================
  // DEEP RESEARCH DETECTION
  // ============================================

  /**
   * Check if an article element is a Deep Research block
   */
  function isDeepResearchBlock(article) {
    // Must be an article element
    if (article.tagName !== 'ARTICLE') return false;

    // Check for Deep Research iframe (newer ChatGPT rendering)
    const iframes = article.querySelectorAll('iframe');
    for (const iframe of iframes) {
      const src = iframe.src || '';
      if (src.includes('web-sandbox.oaiusercontent.com') || src.includes('deep_research')) {
        return true;
      }
    }

    // Look for Sources button - a key indicator of Deep Research (older rendering)
    const buttons = article.querySelectorAll('button');
    let hasSourcesButton = false;
    buttons.forEach(btn => {
      if (btn.textContent && btn.textContent.trim().toLowerCase() === 'sources') {
        hasSourcesButton = true;
      }
    });

    // Look for structured headings (h1, h2, or elements with heading role)
    const hasHeadings = article.querySelectorAll('h1, h2, [role="heading"]').length > 0;

    // Deep Research blocks have both structured content and sources
    // Also check for substantial content length
    const hasSubstantialContent = article.textContent.length > 500;

    return hasSourcesButton && hasHeadings && hasSubstantialContent;
  }

  /**
   * Calculate how deeply nested an element is within an article
   */
  function getDepthFromArticle(element, article) {
    let depth = 0;
    let current = element;
    while (current && current !== article) {
      depth++;
      current = current.parentElement;
    }
    return depth;
  }

  /**
   * Find the button row in an article where we can inject our button
   */
  function findButtonRow(article) {
    // Look for the container that has Copy, Good response, Bad response buttons
    const buttons = article.querySelectorAll('button');
    for (const btn of buttons) {
      // Skip buttons inside code blocks (pre elements)
      if (btn.closest('pre')) continue;

      const text = btn.textContent?.toLowerCase() || '';
      const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';

      // Skip buttons that are specifically "copy code" buttons
      if (text.includes('copy code') || ariaLabel.includes('copy code')) continue;

      if (text.includes('copy') || ariaLabel.includes('copy')) {
        // Found the Copy button, return its parent container
        return btn.parentElement;
      }
    }

    // Fallback: look for a container with multiple buttons at the end of the article
    // Search in reverse order to prefer containers near the end (where action buttons are)
    const containers = Array.from(article.querySelectorAll('div')).reverse();
    for (const container of containers) {
      // Skip containers inside code blocks
      if (container.closest('pre, code, [class*="code"]')) continue;

      // Only consider containers that are near the article root (not deeply nested in content)
      const depth = getDepthFromArticle(container, article);
      if (depth > 4) continue;

      const childButtons = container.querySelectorAll(':scope > button');
      if (childButtons.length >= 2) {
        // Check if these look like action buttons (have SVGs/images)
        const hasIcons = Array.from(childButtons).some(b => b.querySelector('svg, img'));
        if (hasIcons) {
          return container;
        }
      }
    }

    return null;
  }

  // ============================================
  // CONTENT EXTRACTION
  // ============================================

  /**
   * Find the main content container within a Deep Research block
   */
  function findContentContainer(article) {
    // The content is typically in a nested div structure
    // Look for the container that has the headings and paragraphs
    const headings = article.querySelectorAll('h1, h2');
    if (headings.length > 0) {
      // Find the common ancestor of all the content
      let container = headings[0].parentElement;
      while (container && container !== article) {
        // Check if this container has most of the content
        if (container.querySelectorAll('h1, h2, p').length > 2) {
          return container;
        }
        container = container.parentElement;
      }
    }
    return article;
  }

  /**
   * Extract structured content from a DOM element
   */
  function extractContent(element) {
    const content = [];

    function processNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        // Preserve whitespace - normalize multiple spaces but keep single spaces
        const text = node.textContent.replace(/\s+/g, ' ');
        if (text && text !== ' ') {
          // Check if there's leading/trailing whitespace to preserve
          const hasLeadingSpace = /^\s/.test(node.textContent);
          const hasTrailingSpace = /\s$/.test(node.textContent);
          return {
            type: 'text',
            text: text.trim(),
            leadingSpace: hasLeadingSpace,
            trailingSpace: hasTrailingSpace
          };
        } else if (text === ' ') {
          // Pure whitespace node - preserve as space
          return { type: 'text', text: ' ', isSpace: true };
        }
        return null;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return null;

      const tagName = node.tagName.toLowerCase();
      const role = node.getAttribute('role');

      // Skip scripts, styles, svgs
      if (['script', 'style', 'svg'].includes(tagName)) {
        return null;
      }

      // Skip small buttons (action buttons like Copy, Sources refs)
      // but allow large buttons that wrap article content (Deep Research iframe)
      if (tagName === 'button') {
        if (node.textContent.length < 100) {
          return null;
        }
        // Large button wrapping content - process children instead
        const children = processChildren(node);
        if (children.length > 0) {
          return { type: 'container', children };
        }
        return null;
      }

      // Handle headings
      if (tagName === 'h1' || (role === 'heading' && node.getAttribute('aria-level') === '1')) {
        const children = processChildren(node);
        const hasSup = children.some(c => c.type === 'superscript');
        if (hasSup) {
          return { type: 'heading', level: 1, children };
        }
        return { type: 'heading', level: 1, text: node.textContent.trim() };
      }
      if (tagName === 'h2' || (role === 'heading' && node.getAttribute('aria-level') === '2')) {
        const children = processChildren(node);
        const hasSup = children.some(c => c.type === 'superscript');
        if (hasSup) {
          return { type: 'heading', level: 2, children };
        }
        return { type: 'heading', level: 2, text: node.textContent.trim() };
      }
      if (tagName === 'h3' || (role === 'heading')) {
        const children = processChildren(node);
        const hasSup = children.some(c => c.type === 'superscript');
        if (hasSup) {
          return { type: 'heading', level: 3, children };
        }
        return { type: 'heading', level: 3, text: node.textContent.trim() };
      }

      // Handle paragraphs
      if (tagName === 'p') {
        const children = processChildren(node);
        return { type: 'paragraph', children };
      }

      // Handle lists
      if (tagName === 'ul' || tagName === 'ol') {
        const items = [];
        node.querySelectorAll(':scope > li').forEach(li => {
          // Flatten list items - if li contains just a single <p>, extract p's children directly
          let liChildren = processChildren(li);
          // Remove wrapping paragraph structure from list items to avoid double-breaks
          if (liChildren.length === 1 && liChildren[0].type === 'paragraph') {
            liChildren = liChildren[0].children || [];
          }
          items.push({ type: 'listitem', children: liChildren });
        });
        return { type: 'list', ordered: tagName === 'ol', items };
      }

      // Handle blockquotes
      if (tagName === 'blockquote') {
        return { type: 'blockquote', children: processChildren(node) };
      }

      // Handle code blocks
      if (tagName === 'pre' || tagName === 'code') {
        const isBlock = tagName === 'pre' || node.parentElement?.tagName?.toLowerCase() === 'pre';
        const code = node.querySelector('code') || node;
        const language = detectCodeLanguage(node);
        return { type: 'code', block: isBlock, language, text: code.textContent };
      }

      // Helper to check DOM siblings for whitespace context
      function getSpacingContext(el) {
        let needsLeadingSpace = false;
        let needsTrailingSpace = false;

        // Check previous sibling
        const prev = el.previousSibling;
        if (prev) {
          if (prev.nodeType === Node.TEXT_NODE) {
            const prevText = prev.textContent;
            // If prev text doesn't end with whitespace or punctuation that doesn't need space, we need space
            if (prevText.length > 0) {
              const lastChar = prevText[prevText.length - 1];
              // Don't add space after opening brackets/quotes or if already whitespace
              needsLeadingSpace = !/[\s\(\[\{"']$/.test(prevText);
            }
          } else if (prev.nodeType === Node.ELEMENT_NODE) {
            // Previous is an element - need space between elements
            needsLeadingSpace = true;
          }
        }

        // Check next sibling
        const next = el.nextSibling;
        if (next) {
          if (next.nodeType === Node.TEXT_NODE) {
            const nextText = next.textContent;
            // If next text doesn't start with whitespace or punctuation, we need space
            if (nextText.length > 0) {
              const firstChar = nextText[0];
              // Don't add space before closing punctuation, brackets, or if already whitespace
              needsTrailingSpace = !/^[\s\)\]\}.,;:!?'"']/.test(nextText);
            }
          } else if (next.nodeType === Node.ELEMENT_NODE) {
            // Next is an element - need space between elements
            needsTrailingSpace = true;
          }
        }

        return { needsLeadingSpace, needsTrailingSpace };
      }

      // Handle links
      if (tagName === 'a') {
        const href = node.getAttribute('href') || '';
        const spacing = getSpacingContext(node);
        return {
          type: 'link',
          url: href,
          text: node.textContent.trim(),
          needsLeadingSpace: spacing.needsLeadingSpace,
          needsTrailingSpace: spacing.needsTrailingSpace
        };
      }

      // Handle inline formatting - check spacing context
      if (tagName === 'strong' || tagName === 'b') {
        const spacing = getSpacingContext(node);
        return {
          type: 'strong',
          text: node.textContent.trim(),
          needsLeadingSpace: spacing.needsLeadingSpace,
          needsTrailingSpace: spacing.needsTrailingSpace
        };
      }
      if (tagName === 'em' || tagName === 'i') {
        const spacing = getSpacingContext(node);
        return {
          type: 'emphasis',
          text: node.textContent.trim(),
          needsLeadingSpace: spacing.needsLeadingSpace,
          needsTrailingSpace: spacing.needsTrailingSpace
        };
      }

      // Handle superscript (footnote references / citation markers)
      if (tagName === 'sup' || tagName === 'superscript') {
        const citationIndex = parseInt(node.getAttribute('data-citation-index'));
        return {
          type: 'superscript',
          text: node.textContent.trim(),
          citationIndex: isNaN(citationIndex) ? null : citationIndex
        };
      }

      // For other elements, process children
      const children = processChildren(node);
      if (children.length > 0) {
        return { type: 'container', children };
      }

      return null;
    }

    function processChildren(parent) {
      const results = [];
      parent.childNodes.forEach(child => {
        const processed = processNode(child);
        if (processed) {
          results.push(processed);
        }
      });
      return results;
    }

    const container = findContentContainer(element);
    return processChildren(container);
  }

  /**
   * Extract raw HTML with citation links injected (for Rich HTML copy to Notion)
   * Preserves native DOM structure (tables, lists, code blocks) while adding citation links
   */
  function extractRawHTMLWithCitations(article, citations) {
    // Get the content container (same logic as extractContent)
    const container = findContentContainer(article);

    // Clone the container to avoid modifying the live DOM
    const clone = container.cloneNode(true);

    // Build citation lookup map
    const citationsMap = new Map(citations.map(c => [c.number, c]));

    // Find and enhance all sup elements with citation links
    const sups = clone.querySelectorAll('sup[data-citation-index]');
    sups.forEach(sup => {
      const citationIndex = parseInt(sup.getAttribute('data-citation-index'));
      if (isNaN(citationIndex)) return;

      const cite = citationsMap.get(citationIndex);
      if (cite?.url) {
        // Replace sup with bracketed inline link: " [N] "
        const text = sup.textContent.trim();
        const link = document.createElement('a');
        link.href = escapeHtml(cite.url);
        link.textContent = text;

        // Create text nodes for spacing and brackets
        const spaceBefore = document.createTextNode(' [');
        const spaceAfter = document.createTextNode('] ');

        // Replace sup with: " [<a>N</a>] "
        sup.parentNode.insertBefore(spaceBefore, sup);
        sup.parentNode.insertBefore(link, sup);
        sup.parentNode.insertBefore(spaceAfter, sup);
        sup.remove();
      }
    });

    // Append sources section
    if (citations.length > 0) {
      const sourcesSection = document.createElement('div');
      sourcesSection.innerHTML = `
        <hr>
        <h2>Sources</h2>
        <ol>
          ${citations.map(cite => {
            if (cite.url) {
              return `<li><a href="${escapeHtml(cite.url)}">${escapeHtml(cite.text)}</a></li>`;
            }
            return `<li>${escapeHtml(cite.text)}</li>`;
          }).join('')}
        </ol>
      `;
      clone.appendChild(sourcesSection);
    }

    return clone.innerHTML;
  }

  /**
   * Detect code language from element classes or attributes
   */
  function detectCodeLanguage(element) {
    const classes = element.className || '';
    const match = classes.match(/language-(\w+)/);
    if (match) return match[1];

    // Check for language indicator in sibling/parent
    const langEl = element.closest('[class*="language-"]');
    if (langEl) {
      const langMatch = langEl.className.match(/language-(\w+)/);
      if (langMatch) return langMatch[1];
    }

    return '';
  }

  /**
   * Extract citation URLs from React fiber tree via main-world script.
   * Content scripts run in an isolated world and cannot access React fiber properties.
   * The main-world.js script (registered with "world": "MAIN" in manifest.json)
   * listens for 'dr-extract-citations' and responds with 'dr-citations-result'.
   */
  function extractCitationsFromReactFiber(root) {
    return new Promise((resolve) => {
      function onMessage(event) {
        if (event.data?.type === 'DR_CITATIONS_FIBER_RESULT') {
          window.removeEventListener('message', onMessage);
          resolve(event.data.citations || []);
        }
      }
      window.addEventListener('message', onMessage);

      // Send request to parent frame where main-world.js is running
      window.parent.postMessage({ type: 'DR_EXTRACT_CITATIONS_FIBER' }, '*');

      // Safety timeout
      setTimeout(() => {
        window.removeEventListener('message', onMessage);
        resolve([]);
      }, 2000);
    });
  }

  /**
   * Extract citations/sources from the article
   */
  async function extractCitations(article) {
    // Inside iframe: skip footnote heuristics, go straight to React fiber
    if (isInsideDeepResearchIframe()) {
      const fiberCites = await extractCitationsFromReactFiber(article);
      return fiberCites;
    }

    const citations = [];

    // Look for footnotes section
    const footnoteHeading = Array.from(article.querySelectorAll('h2, h3')).find(
      h => h.textContent.toLowerCase().includes('footnote') ||
           h.textContent.toLowerCase().includes('source') ||
           h.textContent.toLowerCase().includes('reference')
    );

    if (footnoteHeading) {
      // Get the list after the footnotes heading
      let sibling = footnoteHeading.nextElementSibling;
      while (sibling) {
        if (sibling.tagName === 'OL' || sibling.tagName === 'UL') {
          sibling.querySelectorAll('li').forEach((li, index) => {
            const link = li.querySelector('a');
            citations.push({
              number: index + 1,
              text: li.textContent.trim(),
              url: link?.href || ''
            });
          });
          break;
        }
        sibling = sibling.nextElementSibling;
      }
    }

    // Also look for inline citation links
    article.querySelectorAll('a').forEach(link => {
      const href = link.href;
      if (href && !href.startsWith('#') && !citations.find(c => c.url === href)) {
        // Check if it's likely a source link (not navigation)
        if (href.includes('http') && !href.includes('chatgpt.com') && !href.includes('openai.com')) {
          citations.push({
            number: citations.length + 1,
            text: link.textContent.trim() || href,
            url: href
          });
        }
      }
    });

    // Fallback: extract from React fiber if no traditional citations found
    // This handles iframe-rendered Deep Research where citations are <sup> elements
    if (citations.length === 0) {
      const fiberCitations = await extractCitationsFromReactFiber(article);
      if (fiberCitations.length > 0) {
        return fiberCitations;
      }
    }

    return citations;
  }

  // ============================================
  // FORMAT CONVERSION
  // ============================================

  /**
   * Convert content tree to Markdown
   */
  function convertToMarkdown(nodes, citations = []) {
    const citationsMap = new Map(citations.map(c => [c.number, c]));
    let md = '';

    function processNode(node, index, siblings) {
      if (!node) return '';

      // Helper to check if we need space before/after inline elements
      function needsSpaceBefore(idx) {
        if (idx === 0) return false;
        const prev = siblings[idx - 1];
        if (!prev) return false;
        // Check if previous node ends with space or is a block element
        if (prev.type === 'text' && prev.trailingSpace) return false;
        if (prev.type === 'text' && prev.isSpace) return false;
        if (['heading', 'paragraph', 'list', 'blockquote'].includes(prev.type)) return false;
        return true;
      }

      function needsSpaceAfter(idx) {
        if (idx >= siblings.length - 1) return false;
        const next = siblings[idx + 1];
        if (!next) return false;
        // Check if next node starts with space or is a block element
        if (next.type === 'text' && next.leadingSpace) return false;
        if (next.type === 'text' && next.isSpace) return false;
        if (['heading', 'paragraph', 'list', 'blockquote'].includes(next.type)) return false;
        return true;
      }

      switch (node.type) {
        case 'text':
          if (node.isSpace) return ' ';
          let text = node.text;
          if (node.leadingSpace) text = ' ' + text;
          if (node.trailingSpace) text = text + ' ';
          return text;

        case 'heading': {
          const headingText = node.children ? processChildren(node.children) : node.text;
          return '#'.repeat(node.level) + ' ' + headingText + '\n\n';
        }

        case 'paragraph':
          return processChildren(node.children) + '\n\n';

        case 'list':
          let listMd = '';
          node.items.forEach((item, i) => {
            const prefix = node.ordered ? `${i + 1}. ` : '- ';
            listMd += prefix + processChildren(item.children).trim() + '\n';
          });
          return listMd + '\n';

        case 'listitem':
          return processChildren(node.children);

        case 'blockquote':
          const quoteText = processChildren(node.children).trim();
          return '> ' + quoteText.replace(/\n/g, '\n> ') + '\n\n';

        case 'code':
          if (node.block) {
            return '```' + (node.language || '') + '\n' + node.text + '\n```\n\n';
          }
          return '`' + node.text + '`';

        case 'link': {
          // Use DOM-detected spacing, fall back to sibling analysis
          const spaceBefore = node.needsLeadingSpace ? ' ' : '';
          const spaceAfter = node.needsTrailingSpace ? ' ' : '';
          return `${spaceBefore}[${node.text}](${node.url})${spaceAfter}`;
        }

        case 'strong': {
          // Use DOM-detected spacing
          const spaceBefore = node.needsLeadingSpace ? ' ' : '';
          const spaceAfter = node.needsTrailingSpace ? ' ' : '';
          return `${spaceBefore}**${node.text}**${spaceAfter}`;
        }

        case 'emphasis': {
          // Use DOM-detected spacing
          const spaceBefore = node.needsLeadingSpace ? ' ' : '';
          const spaceAfter = node.needsTrailingSpace ? ' ' : '';
          return `${spaceBefore}*${node.text}*${spaceAfter}`;
        }

        case 'superscript': {
          const cite = node.citationIndex != null ? citationsMap.get(node.citationIndex) : null;
          if (cite?.url) {
            return ` [${node.text}](${cite.url}) `;
          }
          return ` [^${node.text}] `;
        }

        case 'container':
          return processChildren(node.children);

        default:
          return '';
      }
    }

    function processChildren(children) {
      if (!children) return '';
      return children.map((node, index) => processNode(node, index, children)).join('');
    }

    md = processChildren(nodes);

    // Add citations section
    if (citations.length > 0) {
      md += '\n---\n\n## Sources\n\n';
      citations.forEach((cite, i) => {
        if (cite.url) {
          md += `${i + 1}. [${cite.text}](${cite.url})\n`;
        } else {
          md += `${i + 1}. ${cite.text}\n`;
        }
      });
    }

    return md.trim();
  }

  /**
   * Convert content tree to HTML
   */
  function convertToHTML(nodes, citations = []) {
    const citationsMap = new Map(citations.map(c => [c.number, c]));
    let html = '';

    // Process children, optionally stripping paragraph wrappers (for inside li/blockquote)
    // Also trims leading/trailing whitespace to avoid blank lines
    function processChildrenInline(children) {
      if (!children) return '';
      const result = children.map(node => {
        // If it's a paragraph, just render its contents without <p> wrapper
        if (node.type === 'paragraph') {
          return processChildren(node.children);
        }
        return processNode(node);
      }).join('');
      // Trim leading/trailing whitespace to avoid blank lines in blockquotes/list items
      return result.replace(/^\s+/, '').replace(/\s+$/, '');
    }

    function processNode(node) {
      if (!node) return '';

      switch (node.type) {
        case 'text':
          if (node.isSpace) return ' ';
          let text = escapeHtml(node.text);
          if (node.leadingSpace) text = ' ' + text;
          if (node.trailingSpace) text = text + ' ';
          return text;

        case 'heading': {
          const tag = `h${node.level}`;
          const headingContent = node.children ? processChildren(node.children) : escapeHtml(node.text);
          return `<${tag}>${headingContent}</${tag}>`;
        }

        case 'paragraph':
          return `<p>${processChildren(node.children)}</p>`;

        case 'list':
          const listTag = node.ordered ? 'ol' : 'ul';
          const items = node.items.map(item =>
            `<li>${processChildrenInline(item.children)}</li>`
          ).join('');
          return `<${listTag}>${items}</${listTag}>`;

        case 'blockquote':
          return `<blockquote>${processChildrenInline(node.children)}</blockquote>`;

        case 'code':
          if (node.block) {
            return `<pre><code>${escapeHtml(node.text)}</code></pre>`;
          }
          return `<code>${escapeHtml(node.text)}</code>`;

        case 'link': {
          const before = node.needsLeadingSpace ? ' ' : '';
          const after = node.needsTrailingSpace ? ' ' : '';
          return `${before}<a href="${escapeHtml(node.url)}">${escapeHtml(node.text)}</a>${after}`;
        }

        case 'strong': {
          const before = node.needsLeadingSpace ? ' ' : '';
          const after = node.needsTrailingSpace ? ' ' : '';
          return `${before}<strong>${escapeHtml(node.text)}</strong>${after}`;
        }

        case 'emphasis': {
          const before = node.needsLeadingSpace ? ' ' : '';
          const after = node.needsTrailingSpace ? ' ' : '';
          return `${before}<em>${escapeHtml(node.text)}</em>${after}`;
        }

        case 'superscript': {
          const cite = node.citationIndex != null ? citationsMap.get(node.citationIndex) : null;
          if (cite?.url) {
            return ` <sup><a href="${escapeHtml(cite.url)}">${escapeHtml(node.text)}</a></sup> `;
          }
          return ` <sup>${escapeHtml(node.text)}</sup> `;
        }

        case 'container':
          return processChildren(node.children);

        default:
          return '';
      }
    }

    function processChildren(children) {
      if (!children) return '';
      return children.map(processNode).join('');
    }

    html = processChildren(nodes);

    // Add citations section
    if (citations.length > 0) {
      html += '<hr><h2>Sources</h2><ol>';
      citations.forEach(cite => {
        if (cite.url) {
          html += `<li><a href="${escapeHtml(cite.url)}">${escapeHtml(cite.text)}</a></li>`;
        } else {
          html += `<li>${escapeHtml(cite.text)}</li>`;
        }
      });
      html += '</ol>';
    }

    return html;
  }

  /**
   * Escape HTML special characters
   */
  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Convert content to plain text
   */
  function convertToPlainText(nodes, citations = []) {
    let text = '';

    function processNode(node) {
      if (!node) return '';

      switch (node.type) {
        case 'text':
          if (node.isSpace) return ' ';
          let t = node.text;
          if (node.leadingSpace) t = ' ' + t;
          if (node.trailingSpace) t = t + ' ';
          return t;

        case 'strong':
        case 'emphasis': {
          const before = node.needsLeadingSpace ? ' ' : '';
          const after = node.needsTrailingSpace ? ' ' : '';
          return `${before}${node.text}${after}`;
        }

        case 'superscript':
          return ` [${node.text}] `;

        case 'heading': {
          const headingText = node.children ? processChildren(node.children) : node.text;
          return headingText + '\n\n';
        }

        case 'paragraph':
          return processChildren(node.children) + '\n\n';

        case 'list':
          let listText = '';
          node.items.forEach((item, i) => {
            const prefix = node.ordered ? `${i + 1}. ` : '• ';
            listText += prefix + processChildren(item.children).trim() + '\n';
          });
          return listText + '\n';

        case 'blockquote':
          return '> ' + processChildren(node.children).trim() + '\n\n';

        case 'code':
          return node.text + (node.block ? '\n\n' : '');

        case 'link': {
          const before = node.needsLeadingSpace ? ' ' : '';
          const after = node.needsTrailingSpace ? ' ' : '';
          return `${before}${node.text} (${node.url})${after}`;
        }

        case 'container':
          return processChildren(node.children);

        default:
          return '';
      }
    }

    function processChildren(children) {
      if (!children) return '';
      return children.map(processNode).join('');
    }

    text = processChildren(nodes);

    // Add citations
    if (citations.length > 0) {
      text += '\n---\n\nSources:\n';
      citations.forEach((cite, i) => {
        text += `${i + 1}. ${cite.text}${cite.url ? ' - ' + cite.url : ''}\n`;
      });
    }

    return text.trim();
  }

  // ============================================
  // CLIPBOARD OPERATIONS
  // ============================================

  /**
   * Copy rich text (HTML) to clipboard using a hidden contenteditable element.
   * navigator.clipboard.write() with text/html doesn't work in about:blank iframes,
   * so we fall back to document.execCommand('copy') which works with clipboardWrite permission.
   */
  function copyRichTextViaSelection(html) {
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.opacity = '0';
    document.body.appendChild(container);

    const range = document.createRange();
    range.selectNodeContents(container);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    let success = false;
    try {
      success = document.execCommand('copy');
    } catch (e) {
      // Fall through
    }

    selection.removeAllRanges();
    document.body.removeChild(container);
    return success;
  }

  /**
   * Copy content to clipboard in the specified format
   */
  async function copyToClipboard(format, content, citations, article = null) {
    try {
      switch (format) {
        case 'richtext': {
          const html = convertToHTML(content, citations);
          const plainText = convertToPlainText(content, citations);

          // Try modern Clipboard API first
          try {
            const htmlBlob = new Blob([html], { type: 'text/html' });
            const textBlob = new Blob([plainText], { type: 'text/plain' });
            await navigator.clipboard.write([
              new ClipboardItem({
                'text/html': htmlBlob,
                'text/plain': textBlob
              })
            ]);
          } catch (clipErr) {
            // Fallback for iframes where Clipboard API may not support HTML
            // Clipboard API HTML write failed, using execCommand fallback
            if (!copyRichTextViaSelection(html)) {
              // Last resort: write plain text
              await navigator.clipboard.writeText(plainText);
            }
          }
          break;
        }
        case 'markdown': {
          const md = convertToMarkdown(content, citations);
          await navigator.clipboard.writeText(md);
          break;
        }
        case 'html': {
          const html = convertToHTML(content, citations);
          await navigator.clipboard.writeText(html);
          break;
        }
        case 'richhtml': {
          const html = extractRawHTMLWithCitations(article, citations);
          const plainText = convertToPlainText(content, citations);

          // Try modern Clipboard API first
          try {
            const htmlBlob = new Blob([html], { type: 'text/html' });
            const textBlob = new Blob([plainText], { type: 'text/plain' });
            await navigator.clipboard.write([
              new ClipboardItem({
                'text/html': htmlBlob,
                'text/plain': textBlob
              })
            ]);
          } catch (clipErr) {
            // Fallback for iframes where Clipboard API may not support HTML
            if (!copyRichTextViaSelection(html)) {
              // Last resort: write plain text
              await navigator.clipboard.writeText(plainText);
            }
          }
          break;
        }
      }
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  }

  // ============================================
  // MODAL UI
  // ============================================

  /**
   * Show the format selection modal
   */
  /**
   * Find the Deep Research iframe inside an article, if any
   */
  function findDeepResearchIframe(article) {
    const iframes = article.querySelectorAll('iframe');
    for (const iframe of iframes) {
      const src = iframe.src || '';
      if (src.includes('web-sandbox.oaiusercontent.com') || src.includes('deep_research')) {
        return iframe;
      }
    }
    return null;
  }

  /**
   * Request content extraction from a Deep Research iframe via postMessage
   */
  function extractContentFromIframe(iframe) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        window.removeEventListener('message', handler);
        resolve(null);
      }, 5000);

      function handler(event) {
        if (event.data?.type === 'DR_CONTENT_RESULT') {
          clearTimeout(timeout);
          window.removeEventListener('message', handler);
          resolve({ content: event.data.content, citations: event.data.citations });
        }
      }

      window.addEventListener('message', handler);

      // Send request to all nested frames (the iframe may contain another iframe)
      iframe.contentWindow?.postMessage({ type: 'DR_EXTRACT_CONTENT' }, '*');

      // Also try nested iframes via broadcast
      try {
        const innerFrames = iframe.contentWindow?.frames;
        if (innerFrames) {
          for (let i = 0; i < innerFrames.length; i++) {
            innerFrames[i]?.postMessage({ type: 'DR_EXTRACT_CONTENT' }, '*');
          }
        }
      } catch (e) {
        // Cross-origin access to frames may fail, that's OK
      }
    });
  }

  async function showFormatModal(article) {
    // Remove any existing modal
    const existing = document.querySelector('.dr-modal-overlay');
    if (existing) existing.remove();

    // Check if content is in an iframe
    const drIframe = findDeepResearchIframe(article);
    let content, citations;

    if (drIframe) {
      // Content is in an iframe - show modal immediately, extract on format click
      content = null;
      citations = null;
    } else {
      // Content is in the main DOM
      content = extractContent(article);
      citations = await extractCitations(article);
    }

    // Create modal
    const overlay = document.createElement('div');
    overlay.className = 'dr-modal-overlay';
    overlay.innerHTML = `
      <div class="dr-modal">
        <h3>Copy Article As</h3>
        <div class="dr-format-options">
          <button class="dr-format-btn recommended" data-format="richhtml">
            <span>Rich HTML</span>
            <span class="badge">Recommended for Notion</span>
          </button>
          <button class="dr-format-btn" data-format="richtext">
            <span>Rich Text</span>
          </button>
          <button class="dr-format-btn" data-format="markdown">
            <span>Markdown</span>
          </button>
          <button class="dr-format-btn" data-format="html">
            <span>HTML</span>
          </button>
        </div>
        <p class="dr-hint">Rich HTML preserves tables, lists, and citations for Notion</p>
        <button class="dr-cancel-btn">Cancel</button>
      </div>
    `;

    // Handle format selection
    overlay.querySelectorAll('.dr-format-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const format = btn.dataset.format;

        // If content is in an iframe, extract it now
        let copyContent = content;
        let copyCitations = citations;
        if (!copyContent && drIframe) {
          const result = await extractContentFromIframe(drIframe);
          if (result) {
            copyContent = result.content;
            copyCitations = result.citations;
          } else {
            alert('Could not extract content from the article. Try expanding it first.');
            overlay.remove();
            return;
          }
        }

        // DEBUG: dump content tree structure
        console.log('DR DEBUG: content tree:', JSON.stringify(copyContent?.slice(0, 10), null, 2));
        console.log('DR DEBUG: citations:', JSON.stringify(copyCitations?.slice(0, 5), null, 2));
        // Find all superscript nodes in content tree
        function findSuperscripts(nodes, path) {
          if (!nodes) return;
          nodes.forEach((n, i) => {
            if (n.type === 'superscript') console.log('DR DEBUG: superscript at', path + '[' + i + ']', n);
            if (n.children) findSuperscripts(n.children, path + '[' + i + '].children');
            if (n.items) n.items.forEach((item, j) => { if (item.children) findSuperscripts(item.children, path + '[' + i + '].items[' + j + '].children'); });
          });
        }
        findSuperscripts(copyContent, 'root');

        const success = await copyToClipboard(format, copyContent, copyCitations, article);

        if (success) {
          showSuccess(overlay);
        } else {
          alert('Failed to copy. Please try again.');
          overlay.remove();
        }
      });
    });

    // Handle cancel
    overlay.querySelector('.dr-cancel-btn').addEventListener('click', () => {
      overlay.remove();
    });

    // Handle overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    document.body.appendChild(overlay);
  }

  /**
   * Show success state in modal
   */
  function showSuccess(overlay) {
    const modal = overlay.querySelector('.dr-modal');
    modal.classList.add('success');
    modal.innerHTML = `
      <div class="dr-success-icon">${ICONS.success}</div>
      <h3>Copied!</h3>
    `;

    // Auto-close after delay
    setTimeout(() => {
      overlay.remove();
    }, 800);
  }

  // ============================================
  // BUTTON INJECTION
  // ============================================

  /**
   * Inject the Copy Article button into a Deep Research block
   */
  function injectCopyButton(article) {
    if (processedArticles.has(article)) return;

    // Skip main page button for iframe-based articles - the iframe has its own button
    if (findDeepResearchIframe(article)) {
      // Remove any stale button from a previous extension load
      const staleBtn = article.querySelector('.dr-copy-btn');
      if (staleBtn) staleBtn.remove();
      processedArticles.add(article);
      return;
    }

    const buttonRow = findButtonRow(article);
    if (!buttonRow) {
      console.log('Could not find button row for article');
      return;
    }

    // Check if button already exists
    if (buttonRow.querySelector('.dr-copy-btn')) return;

    // Create button
    const btn = document.createElement('button');
    btn.className = 'dr-copy-btn';
    btn.innerHTML = `${ICONS.copy} Copy Article`;
    btn.title = 'Copy article as Rich Text, Markdown, or HTML';

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showFormatModal(article);
    });

    // Insert at the beginning of the button row
    buttonRow.insertBefore(btn, buttonRow.firstChild);
    processedArticles.add(article);
  }

  /**
   * Find and process all Deep Research blocks in an element
   */
  function findAndProcessDeepResearchBlocks(root) {
    // Check if root itself is an article
    if (root.tagName === 'ARTICLE' && isDeepResearchBlock(root)) {
      injectCopyButton(root);
    }

    // Find all articles within root
    const articles = root.querySelectorAll('article');
    articles.forEach(article => {
      if (isDeepResearchBlock(article)) {
        injectCopyButton(article);
      }
    });
  }

  // ============================================
  // IFRAME DETECTION & MODE
  // ============================================

  /**
   * Check if we're running inside a Deep Research sandboxed iframe
   */
  function isInsideDeepResearchIframe() {
    // Direct match
    if (window.location.hostname.includes('web-sandbox.oaiusercontent.com')) return true;
    // about:blank or blob: child frame of web-sandbox
    if (window !== window.top && (window.location.href === 'about:blank' || window.location.href.startsWith('blob:'))) {
      try {
        if (window.parent.location.hostname.includes('web-sandbox.oaiusercontent.com')) return true;
      } catch (e) {
        // Cross-origin parent - if we got injected here via match_about_blank, we're likely a child of web-sandbox
        return true;
      }
    }
    return false;
  }

  /**
   * Inject the Copy Article button inside the iframe
   */
  function injectIframeCopyButton() {
    if (document.querySelector('.dr-copy-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'dr-copy-btn dr-copy-btn-iframe';
    btn.innerHTML = `${ICONS.copy} Copy Article`;
    btn.title = 'Copy article as Rich Text, Markdown, or HTML';

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showFormatModal(document.body);
    });

    // Insert at the top of the body
    document.body.insertBefore(btn, document.body.firstChild);
  }

  /**
   * Initialize in iframe mode - listen for content extraction requests from parent
   * and inject Copy Article button when content is available
   */
  function initIframeMode() {
    console.log('ChatGPT Deep Research Copier: Running in iframe mode');

    // Listen for content extraction requests from the main page
    window.addEventListener('message', async (event) => {
      if (event.data?.type === 'DR_EXTRACT_CONTENT') {
        const content = extractContent(document.body);
        const citations = await extractCitations(document.body);
        window.parent.postMessage({
          type: 'DR_CONTENT_RESULT',
          content,
          citations
        }, '*');
      }
    });

    // Wait for content to load, then inject button and notify parent
    let attempts = 0;
    const maxAttempts = 30;

    const tryInit = () => {
      attempts++;
      const contentLength = document.body.textContent.length;
      const hasContent = contentLength > 500;

      if (hasContent) {
        injectIframeCopyButton();
        window.parent.postMessage({ type: 'DR_IFRAME_READY' }, '*');
      } else if (attempts < maxAttempts) {
        setTimeout(tryInit, 500);
      }
    };

    tryInit();

    // Also watch for dynamic content loading (expanded view)
    const observer = new MutationObserver(() => {
      const contentLength = document.body.textContent.length;
      if (contentLength > 500 && !document.querySelector('.dr-copy-btn')) {
        injectIframeCopyButton();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  /**
   * Initialize the extension
   */
  function init() {
    // Branch for iframe-rendered Deep Research content
    if (isInsideDeepResearchIframe()) {
      initIframeMode();
      return;
    }

    console.log('ChatGPT Deep Research Copier: Initializing...');

    // Relay postMessage between parent and child iframes for content extraction
    // This handles the case where there are intermediate iframes between the main page and the Deep Research iframe
    if (window !== window.top) {
      window.addEventListener('message', (event) => {
        if (event.data?.type === 'DR_EXTRACT_CONTENT') {
          // Forward to child iframes
          const iframes = document.querySelectorAll('iframe');
          iframes.forEach(iframe => {
            try { iframe.contentWindow?.postMessage(event.data, '*'); } catch (e) {}
          });
        }
        if (event.data?.type === 'DR_CONTENT_RESULT' || event.data?.type === 'DR_IFRAME_READY') {
          // Bubble up to parent
          window.parent.postMessage(event.data, '*');
        }
      });
    }

    // Process existing articles
    findAndProcessDeepResearchBlocks(document.body);

    // Watch for new articles
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Small delay to let ChatGPT finish rendering
            setTimeout(() => {
              findAndProcessDeepResearchBlocks(node);
            }, 100);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Periodically check for new articles (backup for complex DOM updates)
    setInterval(() => {
      findAndProcessDeepResearchBlocks(document.body);
    }, 2000);

    console.log('ChatGPT Deep Research Copier: Ready');
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
