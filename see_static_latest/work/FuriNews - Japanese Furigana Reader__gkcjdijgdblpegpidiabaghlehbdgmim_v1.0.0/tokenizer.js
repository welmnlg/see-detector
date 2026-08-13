/**
 * Kuromoji Tokenizer Wrapper
 * 负责日文分词和假名处理
 */
let tokenizerInstance = null;
let initPromise = null;
/**
 * 片假名转平假名
 */
function katakanaToHiragana(str) {
    return str.replace(/[\u30A1-\u30F6]/g, (match) => {
        return String.fromCharCode(match.charCodeAt(0) - 0x60);
    });
}
/**
 * 检查字符串是否只包含平假名
 */
function isOnlyHiragana(str) {
    return /^[\u3040-\u309F]+$/.test(str);
}
/**
 * 检查字符串是否只包含片假名
 */
function isOnlyKatakana(str) {
    return /^[\u30A0-\u30FF]+$/.test(str);
}
/**
 * 检查字符串是否只包含假名（平假名或片假名）
 */
function isOnlyKana(str) {
    return /^[\u3040-\u309F\u30A0-\u30FF]+$/.test(str);
}
/**
 * 检查字符串是否包含汉字
 */
function containsKanji(str) {
    return /[\u4E00-\u9FFF\u3400-\u4DBF]/.test(str);
}
/**
 * 检查字符串是否只包含英文和数字
 */
function isAlphanumeric(str) {
    return /^[a-zA-Z0-9\s]+$/.test(str);
}
/**
 * 检查字符串是否只包含符号
 */
function isOnlySymbols(str) {
    // 常见符号、标点
    return /^[\s\p{P}\p{S}]+$/u.test(str);
}
/**
 * 初始化 kuromoji 分词器
 */
export async function initializeTokenizer(dicPath) {
    if (tokenizerInstance) {
        return tokenizerInstance;
    }
    if (initPromise) {
        return initPromise;
    }
    initPromise = new Promise((resolve, reject) => {
        try {
            kuromoji.builder({ dicPath }).build((err, tokenizer) => {
                if (err) {
                    initPromise = null;
                    reject(err);
                    return;
                }
                tokenizerInstance = tokenizer;
                resolve(tokenizer);
            });
        }
        catch (e) {
            initPromise = null;
            reject(e);
        }
    });
    return initPromise;
}
/**
 * 获取分词器实例
 */
export function getTokenizer() {
    return tokenizerInstance;
}
/**
 * 检查分词器是否已初始化
 */
export function isTokenizerReady() {
    return tokenizerInstance !== null;
}
/**
 * 对文本进行分词并返回带假名标注信息的 token 列表
 */
export function tokenizeForAnnotation(text) {
    if (!tokenizerInstance) {
        throw new Error('Tokenizer not initialized');
    }
    const tokens = tokenizerInstance.tokenize(text);
    const result = [];
    for (const token of tokens) {
        const surface = token.surface_form;
        const reading = token.reading;
        // 判断是否需要标注假名
        let needsRuby = false;
        let hiraganaReading = '';
        if (reading) {
            hiraganaReading = katakanaToHiragana(reading);
        }
        // 需要标注的条件：
        // 1. 包含汉字
        // 2. 不是纯假名
        // 3. 不是英文/数字
        // 4. 不是纯符号
        // 5. 有读音且读音与原文不同
        if (containsKanji(surface) &&
            !isOnlyKana(surface) &&
            !isAlphanumeric(surface) &&
            !isOnlySymbols(surface) &&
            reading &&
            surface !== hiraganaReading) {
            needsRuby = true;
        }
        result.push({
            surface,
            reading: hiraganaReading,
            needsRuby
        });
    }
    return result;
}
/**
 * 快速检查文本是否包含需要标注的日文内容
 */
export function hasAnnotatableContent(text) {
    // 检查是否包含汉字
    return containsKanji(text);
}
//# sourceMappingURL=tokenizer.js.map