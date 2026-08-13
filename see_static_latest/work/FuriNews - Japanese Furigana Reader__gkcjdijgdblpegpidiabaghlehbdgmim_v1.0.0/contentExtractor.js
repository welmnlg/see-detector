/**
 * Content Extractor
 * 负责从页面中提取正文内容区域
 * 使用 Readability 算法 + DOM 特征兜底
 */
// 日文字符正则
const JAPANESE_REGEX = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;
// 常见新闻网站的正文容器选择器
const ARTICLE_SELECTORS = [
    'article',
    '[role="article"]',
    'main article',
    '.article-body',
    '.article-content',
    '.article__body',
    '.post-content',
    '.entry-content',
    '.news-body',
    '.news-content',
    '.story-body',
    '.content-body',
    '#article-body',
    '#main-content',
    '.main-content'
];
// 应排除的选择器
const EXCLUDE_SELECTORS = [
    'nav',
    'header:not(article header)',
    'footer:not(article footer)',
    'aside',
    '.sidebar',
    '.navigation',
    '.menu',
    '.advertisement',
    '.ad',
    '.ads',
    '.social-share',
    '.related-articles',
    '.recommended',
    '.comments',
    '#comments',
    '.comment-section',
    '.breadcrumb',
    '.pagination'
];
/**
 * 计算文本中日文字符的占比
 */
function calculateJapaneseRatio(text) {
    if (!text || text.length === 0)
        return 0;
    let japaneseCount = 0;
    for (const char of text) {
        if (JAPANESE_REGEX.test(char)) {
            japaneseCount++;
        }
    }
    return japaneseCount / text.length;
}
/**
 * 计算元素的链接密度（链接文本占总文本的比例）
 */
function calculateLinkDensity(element) {
    const textLength = (element.textContent || '').length;
    if (textLength === 0)
        return 1;
    const links = element.querySelectorAll('a');
    let linkTextLength = 0;
    for (const link of links) {
        linkTextLength += (link.textContent || '').length;
    }
    return linkTextLength / textLength;
}
/**
 * 获取元素的纯文本长度（排除子元素中的脚本和样式）
 */
function getCleanTextLength(element) {
    const clone = element.cloneNode(true);
    // 移除脚本和样式
    const scripts = clone.querySelectorAll('script, style, noscript');
    for (const script of scripts) {
        script.remove();
    }
    return (clone.textContent || '').trim().length;
}
/**
 * 计算元素的内容得分
 */
function calculateContentScore(element) {
    const textLength = getCleanTextLength(element);
    const linkDensity = calculateLinkDensity(element);
    const text = element.textContent || '';
    const japaneseRatio = calculateJapaneseRatio(text);
    // 计算段落数量
    const paragraphs = element.querySelectorAll('p');
    let paragraphScore = 0;
    for (const p of paragraphs) {
        const pText = (p.textContent || '').trim();
        if (pText.length > 50) {
            paragraphScore += 1;
        }
    }
    // 基础分数
    let score = 0;
    // 文本长度加分
    score += Math.min(textLength / 100, 20);
    // 段落数量加分
    score += paragraphScore * 3;
    // 链接密度减分（链接过多可能是导航区域）
    score *= (1 - linkDensity);
    // 日文内容加分
    if (japaneseRatio > 0.3) {
        score *= 1.5;
    }
    else if (japaneseRatio > 0.1) {
        score *= 1.2;
    }
    // 特定标签加分
    const tagName = element.tagName.toLowerCase();
    if (tagName === 'article') {
        score *= 1.5;
    }
    else if (tagName === 'main') {
        score *= 1.3;
    }
    else if (tagName === 'section') {
        score *= 1.1;
    }
    // 特定 class/id 加分
    const classAndId = (element.className + ' ' + element.id).toLowerCase();
    if (/article|content|body|main|post|entry|text/.test(classAndId)) {
        score *= 1.3;
    }
    if (/sidebar|nav|menu|footer|header|ad|comment|related/.test(classAndId)) {
        score *= 0.5;
    }
    return {
        element,
        score,
        textLength,
        linkDensity,
        japaneseRatio
    };
}
/**
 * 使用 DOM 特征查找最佳正文容器
 */
function findContentByDomFeatures() {
    // 首先尝试常见选择器
    for (const selector of ARTICLE_SELECTORS) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
            const score = calculateContentScore(element);
            // 基本条件：足够长的日文内容，低链接密度
            if (score.textLength > 500 && score.japaneseRatio > 0.1 && score.linkDensity < 0.5) {
                return element;
            }
        }
    }
    // 如果常见选择器失败，使用启发式方法
    // 找出所有具有足够段落的容器
    const candidates = [];
    const containers = document.querySelectorAll('div, section, article, main');
    for (const container of containers) {
        // 跳过太小的容器
        if (getCleanTextLength(container) < 300) {
            continue;
        }
        // 检查是否是排除区域
        let isExcluded = false;
        for (const excludeSelector of EXCLUDE_SELECTORS) {
            if (container.matches(excludeSelector)) {
                isExcluded = true;
                break;
            }
        }
        if (isExcluded)
            continue;
        const score = calculateContentScore(container);
        // 过滤条件
        if (score.japaneseRatio > 0.05 && score.linkDensity < 0.6) {
            candidates.push(score);
        }
    }
    // 按得分排序
    candidates.sort((a, b) => b.score - a.score);
    // 返回得分最高的
    if (candidates.length > 0) {
        // 确保不选择过大的容器（如 body）
        for (const candidate of candidates) {
            if (candidate.element.tagName !== 'BODY' && candidate.element.tagName !== 'HTML') {
                return candidate.element;
            }
        }
    }
    return null;
}
/**
 * 简化版 Readability 实现
 * 基于 Mozilla Readability 的核心思想
 */
function extractWithReadability() {
    // 创建文档副本进行分析
    const documentClone = document.cloneNode(true);
    // 移除明显的非内容元素
    const removeSelectors = [
        'script', 'style', 'noscript', 'iframe',
        'nav', 'aside', '.sidebar', '.ad', '.advertisement',
        'header:not(article header)', 'footer:not(article footer)'
    ];
    for (const selector of removeSelectors) {
        const elements = documentClone.querySelectorAll(selector);
        for (const el of elements) {
            el.remove();
        }
    }
    // 在原始文档中查找对应的最佳元素
    const bestElement = findContentByDomFeatures();
    return bestElement;
}
/**
 * 主要提取函数：从页面中提取正文内容区域
 * 返回应该处理的 DOM 元素
 */
export function extractArticleContent() {
    console.log('[Furigana] Starting content extraction...');
    // 1. 首先尝试语义化标签
    const article = document.querySelector('article');
    if (article) {
        const score = calculateContentScore(article);
        if (score.textLength > 300 && score.japaneseRatio > 0.05) {
            console.log('[Furigana] Found article tag with good content');
            return article;
        }
    }
    // 2. 尝试 main 标签
    const main = document.querySelector('main');
    if (main) {
        const score = calculateContentScore(main);
        if (score.textLength > 300 && score.japaneseRatio > 0.05) {
            console.log('[Furigana] Found main tag with good content');
            return main;
        }
    }
    // 3. 使用 Readability 风格的提取
    const readabilityResult = extractWithReadability();
    if (readabilityResult) {
        console.log('[Furigana] Found content via Readability-style extraction');
        return readabilityResult;
    }
    // 4. 最后尝试 DOM 特征
    const domResult = findContentByDomFeatures();
    if (domResult) {
        console.log('[Furigana] Found content via DOM features');
        return domResult;
    }
    console.log('[Furigana] Could not find suitable content area');
    return null;
}
/**
 * 检查当前页面是否可能是日文文章页面
 */
export function isJapaneseArticlePage() {
    // 检查页面语言
    const htmlLang = document.documentElement.lang?.toLowerCase() || '';
    const isJapaneseLang = htmlLang.startsWith('ja');
    // 检查页面内容
    const bodyText = document.body.textContent || '';
    const japaneseRatio = calculateJapaneseRatio(bodyText.slice(0, 5000));
    // 检查是否有足够的内容
    const hasEnoughContent = bodyText.length > 1000;
    // 条件：语言标记为日语 或 日文内容占比足够高
    return (isJapaneseLang || japaneseRatio > 0.1) && hasEnoughContent;
}
/**
 * 获取所有应该处理的段落元素
 * 用于更精细的处理控制
 */
export function getArticleParagraphs(rootElement) {
    const paragraphs = [];
    // 查找段落
    const pElements = rootElement.querySelectorAll('p');
    for (const p of pElements) {
        const text = p.textContent || '';
        if (text.trim().length > 20 && calculateJapaneseRatio(text) > 0.05) {
            paragraphs.push(p);
        }
    }
    // 如果没有找到段落，查找其他块级元素
    if (paragraphs.length === 0) {
        const blockElements = rootElement.querySelectorAll('div, span, li');
        for (const el of blockElements) {
            const text = el.textContent || '';
            // 只添加直接包含文本的元素
            if (text.trim().length > 50 &&
                calculateJapaneseRatio(text) > 0.1 &&
                el.children.length < 3) {
                paragraphs.push(el);
            }
        }
    }
    return paragraphs;
}
//# sourceMappingURL=contentExtractor.js.map