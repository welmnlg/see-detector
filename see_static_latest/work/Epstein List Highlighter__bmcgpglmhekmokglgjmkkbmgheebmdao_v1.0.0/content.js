/**
 * Epstein List Highlighter — Content Script
 *
 * Walks the DOM for text nodes, wraps any occurrence of a listed name in a
 * red-bordered clickable span linking to the Wikipedia article section.
 */

(() => {
    "use strict";

    const WIKI_BASE =
        "https://en.wikipedia.org/wiki/List_of_people_named_in_the_Epstein_files#";

    // Tags whose children we should never touch
    const SKIP_TAGS = new Set([
        "SCRIPT", "STYLE", "TEXTAREA", "INPUT", "SELECT",
        "CODE", "PRE", "NOSCRIPT", "IFRAME", "SVG",
    ]);

    // Class applied to highlighted names
    const HL_CLASS = "epstein-highlight";

    /* ── Helpers ────────────────────────────────────────────── */

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    function makePattern(nameList, flags) {
        const sorted = [...nameList].sort(
            (a, b) => b.name.length - a.name.length
        );
        return new RegExp(
            "(" +
            sorted
                .map((e) => escapeRegex(e.name).replace(/ /g, "\\s+"))
                .join("|") +
            ")",
            flags
        );
    }

    /* ── Build regexes ─────────────────────────────────────── */

    // Case-insensitive pattern for the main list
    const mainPattern = makePattern(EPSTEIN_LIST, "gi");

    // Case-sensitive pattern for names that must match exact casing
    // (e.g. "Trump" should not match "trump card")
    const csPattern =
        typeof EPSTEIN_LIST_CASE_SENSITIVE !== "undefined" &&
            EPSTEIN_LIST_CASE_SENSITIVE.length > 0
            ? makePattern(EPSTEIN_LIST_CASE_SENSITIVE, "g")
            : null;

    /* ── Anchor lookup maps ────────────────────────────────── */

    const anchorMapCI = new Map(); // case-insensitive (lowercased keys)
    for (const entry of EPSTEIN_LIST) {
        anchorMapCI.set(entry.name.toLowerCase(), entry.anchor);
    }

    const anchorMapCS = new Map(); // case-sensitive (exact keys)
    if (typeof EPSTEIN_LIST_CASE_SENSITIVE !== "undefined") {
        for (const entry of EPSTEIN_LIST_CASE_SENSITIVE) {
            anchorMapCS.set(entry.name, entry.anchor);
        }
    }

    function lookupAnchor(matchedText, caseSensitive) {
        const normalised = matchedText.replace(/\s+/g, " ").trim();
        if (caseSensitive) {
            return anchorMapCS.get(normalised);
        }
        return anchorMapCI.get(normalised.toLowerCase());
    }

    /* ── Create a highlight span ───────────────────────────── */

    function createHighlight(matchedName, anchor) {
        const url = WIKI_BASE + anchor;

        const span = document.createElement("span");
        span.className = HL_CLASS;
        span.textContent = matchedName;
        span.title = "Named in the Epstein files — click for details";
        span.dataset.epsteinUrl = url;
        span.setAttribute("role", "link");
        span.style.cursor = "pointer";

        span.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(url, "_blank", "noopener,noreferrer");
        });

        return span;
    }

    /* ── Highlight a single text node with one regex ────────── */

    function applyPattern(textNode, regex, caseSensitive) {
        const text = textNode.nodeValue;
        if (!regex.test(text)) return false;
        regex.lastIndex = 0;

        const frag = document.createDocumentFragment();
        let lastIndex = 0;
        let match;
        let didMatch = false;

        while ((match = regex.exec(text)) !== null) {
            const matchedName = match[1];
            const anchor = lookupAnchor(matchedName, caseSensitive);
            if (!anchor) continue;

            didMatch = true;

            if (match.index > lastIndex) {
                frag.appendChild(
                    document.createTextNode(text.slice(lastIndex, match.index))
                );
            }

            frag.appendChild(createHighlight(matchedName, anchor));
            lastIndex = regex.lastIndex;
        }

        if (!didMatch) return false;

        if (lastIndex < text.length) {
            frag.appendChild(document.createTextNode(text.slice(lastIndex)));
        }

        textNode.parentNode.replaceChild(frag, textNode);
        return true;
    }

    /* ── Process a single text node (both patterns) ────────── */

    function highlightTextNode(textNode) {
        // Try main (case-insensitive) pattern first
        const replaced = applyPattern(textNode, mainPattern, false);

        // If the main pattern didn't replace this node, try case-sensitive
        if (!replaced && csPattern) {
            applyPattern(textNode, csPattern, true);
        }
    }

    /* ── Walk & process a subtree ────────────────────────────── */

    function processSubtree(root) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;
                if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
                if (parent.closest("." + HL_CLASS)) return NodeFilter.FILTER_REJECT;
                if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            },
        });

        const textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);

        for (const tn of textNodes) {
            highlightTextNode(tn);
        }
    }

    /* ── Initial scan ────────────────────────────────────────── */

    processSubtree(document.body);

    /* ── Observe dynamic changes (SPA / infinite scroll) ─────── */

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (
                    node.nodeType === Node.ELEMENT_NODE &&
                    !SKIP_TAGS.has(node.tagName) &&
                    !node.classList?.contains(HL_CLASS)
                ) {
                    processSubtree(node);
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
