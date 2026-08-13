/**
 * DOM Annotator
 * 负责将分词结果注入到 DOM 中，使用 ruby/rt 结构
 */
import { tokenizeForAnnotation, hasAnnotatableContent } from './tokenizer.js';
// 标记已处理的属性名
const PROCESSED_ATTR = 'data-furigana-processed';
// 不应处理的标签列表
const SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OBJECT', 'EMBED',
    'RUBY', 'RT', 'RP', 'RB', 'RTC', // 已有 ruby 标注
    'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON',
    'CODE', 'PRE', 'KBD', 'VAR', 'SAMP',
    'SVG', 'MATH', 'CANVAS'
]);
// 内联元素（其内部文本可以处理）
const INLINE_TAGS = new Set([
    'A', 'ABBR', 'B', 'BDI', 'BDO', 'CITE', 'DEL', 'DFN',
    'EM', 'I', 'INS', 'MARK', 'Q', 'S', 'SMALL', 'SPAN',
    'STRONG', 'SUB', 'SUP', 'TIME', 'U'
]);
/**
 * 创建 ruby 元素
 */
function createRubyElement(surface, reading) {
    const ruby = document.createElement('ruby');
    ruby.className = 'furigana-ruby';
    // 添加原文
    ruby.appendChild(document.createTextNode(surface));
    // 添加 rp (fallback 括号)
    const rpOpen = document.createElement('rp');
    rpOpen.textContent = '(';
    ruby.appendChild(rpOpen);
    // 添加 rt (假名)
    const rt = document.createElement('rt');
    rt.textContent = reading;
    ruby.appendChild(rt);
    // 添加 rp (fallback 括号)
    const rpClose = document.createElement('rp');
    rpClose.textContent = ')';
    ruby.appendChild(rpClose);
    return ruby;
}
/**
 * 将 tokens 转换为 DOM 节点数组
 */
function tokensToNodes(tokens) {
    const nodes = [];
    for (const token of tokens) {
        if (token.needsRuby && token.reading) {
            // 需要假名标注
            nodes.push(createRubyElement(token.surface, token.reading));
        }
        else {
            // 不需要标注，保持原文本
            nodes.push(document.createTextNode(token.surface));
        }
    }
    return nodes;
}
/**
 * 处理单个文本节点
 * 返回是否成功处理
 */
function processTextNode(textNode) {
    const text = textNode.textContent;
    // 空文本或无内容跳过
    if (!text || text.trim().length === 0) {
        return false;
    }
    // 快速检查是否有可标注内容
    if (!hasAnnotatableContent(text)) {
        return false;
    }
    // 检查父节点是否有效
    const parent = textNode.parentNode;
    if (!parent) {
        return false;
    }
    // 检查父元素是否应该跳过
    if (parent instanceof Element) {
        if (SKIP_TAGS.has(parent.tagName)) {
            return false;
        }
        // 检查是否已处理
        if (parent.hasAttribute(PROCESSED_ATTR)) {
            return false;
        }
    }
    try {
        // 分词
        const tokens = tokenizeForAnnotation(text);
        // 检查是否有需要标注的内容
        const hasRuby = tokens.some(t => t.needsRuby);
        if (!hasRuby) {
            return false;
        }
        // 转换为 DOM 节点
        const newNodes = tokensToNodes(tokens);
        // 创建 DocumentFragment
        const fragment = document.createDocumentFragment();
        for (const node of newNodes) {
            fragment.appendChild(node);
        }
        // 替换原文本节点
        parent.replaceChild(fragment, textNode);
        return true;
    }
    catch (e) {
        console.error('[Furigana] Error processing text node:', e);
        return false;
    }
}
/**
 * 检查元素是否应该被处理
 */
function shouldProcessElement(element) {
    // 跳过特定标签
    if (SKIP_TAGS.has(element.tagName)) {
        return false;
    }
    // 跳过已处理的元素
    if (element.hasAttribute(PROCESSED_ATTR)) {
        return false;
    }
    // 跳过隐藏元素
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
    }
    return true;
}
/**
 * 使用 TreeWalker 遍历并处理指定区域的文本节点
 */
export function annotateElement(rootElement) {
    if (!shouldProcessElement(rootElement)) {
        return 0;
    }
    let processedCount = 0;
    // 收集所有需要处理的文本节点
    // 注意：必须先收集再处理，因为处理过程会修改 DOM
    const textNodes = [];
    const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
            const parent = node.parentElement;
            // 跳过空白文本
            if (!node.textContent || node.textContent.trim().length === 0) {
                return NodeFilter.FILTER_REJECT;
            }
            // 跳过特定父元素
            if (parent && SKIP_TAGS.has(parent.tagName)) {
                return NodeFilter.FILTER_REJECT;
            }
            // 跳过已处理的父元素
            if (parent && parent.hasAttribute(PROCESSED_ATTR)) {
                return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
        }
    });
    // 收集文本节点
    let node;
    while ((node = walker.nextNode())) {
        textNodes.push(node);
    }
    // 处理收集到的文本节点
    for (const textNode of textNodes) {
        // 再次检查节点是否仍在 DOM 中
        if (textNode.parentNode) {
            if (processTextNode(textNode)) {
                processedCount++;
            }
        }
    }
    // 标记根元素已处理
    rootElement.setAttribute(PROCESSED_ATTR, 'true');
    return processedCount;
}
/**
 * 移除指定区域的假名标注
 */
export function removeAnnotations(rootElement) {
    // 查找所有 ruby 元素
    const rubyElements = rootElement.querySelectorAll('ruby.furigana-ruby');
    for (const ruby of rubyElements) {
        // 获取原文（第一个文本节点）
        const originalText = ruby.childNodes[0]?.textContent || '';
        // 创建文本节点替换
        const textNode = document.createTextNode(originalText);
        // 替换 ruby 元素
        ruby.parentNode?.replaceChild(textNode, ruby);
    }
    // 移除处理标记
    rootElement.removeAttribute(PROCESSED_ATTR);
    const processedElements = rootElement.querySelectorAll(`[${PROCESSED_ATTR}]`);
    for (const el of processedElements) {
        el.removeAttribute(PROCESSED_ATTR);
    }
}
/**
 * 检查元素是否已处理
 */
export function isElementProcessed(element) {
    return element.hasAttribute(PROCESSED_ATTR);
}
//# sourceMappingURL=domAnnotator.js.map