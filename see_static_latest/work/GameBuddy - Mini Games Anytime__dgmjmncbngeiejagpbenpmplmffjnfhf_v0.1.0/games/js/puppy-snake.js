/*
 * Puppy Snake Game - Alternative Implementation
 * Rewritten with different code structure and algorithms
 * Uses ES6 classes, Canvas API, and requestAnimationFrame for game loop
 */

// Resource path configuration
(function() {
    'use strict';
    
    // Helper function to get the base URL
    function getBaseUrl() {
        // First, try to use __gameResourceBase if it's already set and is absolute
        if (window.__gameResourceBase) {
            if (window.__gameResourceBase.startsWith('chrome-extension://') || 
                window.__gameResourceBase.startsWith('http://') || 
                window.__gameResourceBase.startsWith('https://')) {
                return window.__gameResourceBase;
            }
        }
        
        // Try chrome.runtime.getURL first (most reliable, no hardcoded paths)
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
                const baseUrl = chrome.runtime.getURL('games/');
                if (baseUrl && (baseUrl.startsWith('chrome-extension://') ||
                               baseUrl.startsWith('http://') ||
                               baseUrl.startsWith('https://'))) {
                    if (!baseUrl.endsWith('/')) {
                        return baseUrl + '/';
                    }
                    if (!window.__gameResourceBase) {
                        window.__gameResourceBase = baseUrl;
                    }
                    return baseUrl;
                }
            }
        } catch (e) {
            // chrome.runtime.getURL not available
        }
        
        // Try to get from chrome.runtime.id (fallback, but extract path dynamically)
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
                // Try to extract path from script src first
                try {
                    const scripts = document.getElementsByTagName('script');
                    for (let i = 0; i < scripts.length; i++) {
                        const script = scripts[i];
                        if (script.src && script.src.startsWith('chrome-extension://')) {
                            const urlObj = new URL(script.src);
                            const pathParts = urlObj.pathname.split('/').filter(p => p);
                            const gamesIndex = pathParts.indexOf('games');
                            if (gamesIndex >= 0) {
                                const baseUrl = `${urlObj.origin}/${pathParts.slice(0, gamesIndex + 1).join('/')}/`;
                                if (!window.__gameResourceBase) {
                                    window.__gameResourceBase = baseUrl;
                                }
                                return baseUrl;
                            }
                        }
                    }
                } catch (e) {
                    // Cannot extract from script src
                }
            }
        } catch (e) {
            // chrome.runtime not available
        }
        
        // Try to get from parent window (if accessible)
        try {
            if (window.parent && window.parent !== window) {
                if (window.parent.releasesBaseUrl) {
                    const baseUrl = window.parent.releasesBaseUrl;
                    window.__gameResourceBase = baseUrl;
                    return baseUrl;
                }
                if (window.parent.__gameResourceBase) {
                    const baseUrl = window.parent.__gameResourceBase;
                    if (baseUrl && (baseUrl.startsWith('chrome-extension://') || 
                                   baseUrl.startsWith('http://') || 
                                   baseUrl.startsWith('https://'))) {
                        window.__gameResourceBase = baseUrl;
                        return baseUrl;
                    }
                }
            }
        } catch (e) {
            // Cross-origin or not accessible
        }
        
        // Try to extract from script src URLs
        try {
            const scripts = document.getElementsByTagName('script');
            for (let i = 0; i < scripts.length; i++) {
                const script = scripts[i];
                if (script.src && script.src.startsWith('chrome-extension://')) {
                    const urlObj = new URL(script.src);
                    const pathParts = urlObj.pathname.split('/').filter(p => p);
                    const gamesIndex = pathParts.indexOf('games');
                    if (gamesIndex >= 0) {
                        const baseUrl = `${urlObj.origin}/${pathParts.slice(0, gamesIndex + 1).join('/')}/`;
                        window.__gameResourceBase = baseUrl;
                        return baseUrl;
                    }
                }
            }
        } catch (e) {
            // Cannot access scripts
        }
        
        // Return null if cannot determine
        return null;
    }
    
    if (!window.__gameResourceBase) {
        window.__gameResourceBase = '../';
    }
    
    // Only set up if getGameResource doesn't exist or needs to be fixed
    if (typeof window.getGameResource !== 'function') {
        window.getGameResource = function(relativePath) {
            // If already absolute, return as is
            if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || 
                relativePath.startsWith('chrome-extension://') || relativePath.startsWith('data:') ||
                relativePath.startsWith('blob:')) {
                return relativePath;
            }
            
            // Clean the path
            const cleanPath = relativePath.replace(/^\.\.?\//, '');
            
            // Get base URL
            let base = getBaseUrl();
            
            // If no valid base, try to wait a bit (synchronous wait, max 200ms)
            if (!base || (!base.startsWith('chrome-extension://') && 
                         !base.startsWith('http://') && 
                         !base.startsWith('https://'))) {
                let waited = 0;
                const maxWait = 200;
                while (waited < maxWait) {
                    const start = Date.now();
                    while (Date.now() - start < 50) {
                        // Wait 50ms
                    }
                    waited += 50;
                    base = getBaseUrl();
                    if (base && (base.startsWith('chrome-extension://') || 
                                 base.startsWith('http://') || 
                                 base.startsWith('https://'))) {
                        break;
                    }
                }
            }
            
            // If still no valid base, return relative path
            if (!base || (!base.startsWith('chrome-extension://') && 
                         !base.startsWith('http://') && 
                         !base.startsWith('https://'))) {
                return window.__gameResourceBase ? window.__gameResourceBase + cleanPath : '../' + cleanPath;
            }
            
            // Construct full URL
            return base + cleanPath;
        };
    } else {
        // getGameResource exists, but ensure it returns absolute URLs
        const originalGetGameResource = window.getGameResource;
        window.getGameResource = function(relativePath) {
            const result = originalGetGameResource.call(this, relativePath);
            // If result is still a relative path, try to convert it
            if (result && !result.startsWith('http://') && !result.startsWith('https://') && 
                !result.startsWith('chrome-extension://') && !result.startsWith('data:') &&
                !result.startsWith('blob:')) {
                const base = getBaseUrl();
                if (base && (base.startsWith('chrome-extension://') || 
                            base.startsWith('http://') || 
                            base.startsWith('https://'))) {
                    const cleanPath = result.replace(/^\.\.?\//, '');
                    return base + cleanPath;
                }
            }
            return result;
        };
    }
})();

// Game constants
const CELL_SIZE = 30;
const INITIAL_DELAY = 120;
const MIN_DELAY = 60;

// Game states
const GAME_STATE = {
    INIT: 'init',
    START: 'start',
    PAUSED: 'pause',
    GAME_OVER: 'die'
};

// Direction constants
const DIRECTIONS = {
    LEFT: 'left',
    RIGHT: 'right',
    TOP: 'top',
    BOTTOM: 'bottom'
};

// Score thresholds for speed and points
const SCORE_THRESHOLDS = [
    { score: 0, delay: 140, points: 5 },
    { score: 25, delay: 130, points: 5 },
    { score: 50, delay: 120, points: 10 },
    { score: 100, delay: 110, points: 15 },
    { score: 200, delay: 100, points: 20 },
    { score: 400, delay: 90, points: 30 },
    { score: 800, delay: 80, points: 40 },
    { score: 1600, delay: 70, points: 50 },
    { score: 3200, delay: 60, points: 100 }
];

// Snake Segment Class
class SnakeSegment {
    constructor(x, y, direction, cellSize) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.nextDirection = direction;
        //this.cellSize = cellSize || CELL_SIZE; // Use provided cellSize or fallback to constant
        this.cellSize = cellSize;
    }
    
    // Move segment based on direction
    move() {
        switch (this.direction) {
            case DIRECTIONS.LEFT:
                this.x -= this.cellSize;
                break;
            case DIRECTIONS.RIGHT:
                this.x += this.cellSize;
                break;
            case DIRECTIONS.TOP:
                this.y -= this.cellSize;
                break;
            case DIRECTIONS.BOTTOM:
                this.y += this.cellSize;
                break;
        }
    }
    
    // Check if two directions are opposite
    isOpposite(dir1, dir2) {
        const opposites = {
            [DIRECTIONS.LEFT]: DIRECTIONS.RIGHT,
            [DIRECTIONS.RIGHT]: DIRECTIONS.LEFT,
            [DIRECTIONS.TOP]: DIRECTIONS.BOTTOM,
            [DIRECTIONS.BOTTOM]: DIRECTIONS.TOP
        };
        return opposites[dir1] === dir2;
    }
}

// Puppy Snake Game Class
class PuppySnakeGame {
    constructor() {
        // Screen dimensions
        this.screenWidth = window.innerWidth - 80;
        this.screenHeight = window.innerHeight - Math.max(100, Math.floor(window.innerHeight * 0.14));
        this.gameDefaultWidth = 750;
        this.gameDefaultHeight = 490;
        
        // Calculate adaptive size
        const modSize = (this.screenWidth < 800 || this.screenHeight < 600) ? 10 : 0;
        this.adaptive = Math.min(
            this.screenWidth / (this.gameDefaultWidth + modSize),
            this.screenHeight / (this.gameDefaultHeight + modSize)
        ) || 0.8;
        
        // Cell size based on adaptive scaling
        this.cellSize = Math.floor(CELL_SIZE * this.adaptive);
        
        // Calculate initial dimensions based on adaptive size
        const initialWidth = this.gameDefaultWidth * this.adaptive;
        const initialHeight = this.gameDefaultHeight * this.adaptive;
        
        // Calculate cols and rows based on cellSize
        this.cols = Math.floor(initialWidth / this.cellSize);
        this.rows = Math.floor(initialHeight / this.cellSize);
        
        // Calculate actual width and height as multiples of cellSize
        this.width = this.cellSize * this.cols;
        this.height = this.cellSize * this.rows;
        
        // Game state
        this.state = GAME_STATE.INIT;
        this.score = 0;
        this.highScore = 0;
        this.delay = INITIAL_DELAY;
        this.lastMoveTime = 0;
        
        // Snake data
        this.snake = [];
        this.direction = DIRECTIONS.RIGHT;
        this.nextDirection = DIRECTIONS.RIGHT;
        
        // Ball data (will be initialized with grid alignment)
        this.ball = { x: 0, y: 0 };
        this.ballImage = null;
        
        // Snake head images
        this.headImages = {};
        this.loadHeadImages();
        
        // Background image
        this.bgImage = null;
        this.loadBackgroundImage();
        
        // Canvas
        this.canvas = null;
        this.ctx = null;
        this.gameArea = null;
        
        // Animation frame
        this.animationFrame = null;
        
        // DOM elements
        this.scoreDisplay = null;
        this.highScoreDisplay = null;
        this.footer = null;
        
        // Resize handler
        this.resizeHandler = null;
        
        // Initialize
        this.init();
    }
    
    // Update adaptive size based on current window size
    updateAdaptiveSize() {
        // Recalculate screen dimensions
        this.screenWidth = window.innerWidth - 80;
        this.screenHeight = window.innerHeight - Math.max(100, Math.floor(window.innerHeight * 0.14));
        
        // Recalculate adaptive size
        const modSize = (this.screenWidth < 800 || this.screenHeight < 600) ? 10 : 0;
        this.adaptive = Math.min(
            this.screenWidth / (this.gameDefaultWidth + modSize),
            this.screenHeight / (this.gameDefaultHeight + modSize)
        ) || 0.8;
        
        // Recalculate cell size (rounded down)
        this.cellSize = Math.floor(CELL_SIZE * this.adaptive);
        
        // Calculate initial dimensions based on adaptive size
        const initialWidth = this.gameDefaultWidth * this.adaptive;
        const initialHeight = this.gameDefaultHeight * this.adaptive;
        
        // Calculate cols and rows based on cellSize
        this.cols = Math.floor(initialWidth / this.cellSize);
        this.rows = Math.floor(initialHeight / this.cellSize);
        
        // Calculate actual width and height as multiples of cellSize
        this.width = this.cellSize * this.cols;
        this.height = this.cellSize * this.rows;
        
        // Update UI with new sizes
        this.setupUI();
    }
    
    // Initialize game
    init() {
        // Skip on mobile
        //if (window.innerWidth < 768) {
            //return;
        //}
        
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        // Load high score from chrome.storage.local
        this.loadHighScore();
        
        // Setup canvas
        this.setupCanvas();
        
        // Initialize snake
        this.initSnake();
        
        // Initialize ball
        this.initBall();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start game loop
        this.gameLoop();
    }
    
    // Load high score from chrome.storage.local
    loadHighScore() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get(['puppy-snake_hs'], (result) => {
                    if (chrome.runtime.lastError) {
                        this.updateHighScoreDisplay();
                        return;
                    }
                    
                    if (result['puppy-snake_hs'] !== undefined && result['puppy-snake_hs'] !== null) {
                        try {
                            this.highScore = parseInt(result['puppy-snake_hs'], 10) || 0;
                        } catch (e) {
                            this.highScore = 0;
                        }
                    }
                    this.updateHighScoreDisplay();
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                const highScoreVal = localStorage.getItem('puppy-snake_hs');
                if (highScoreVal != null) {
                    this.highScore = parseInt(highScoreVal, 10);
                }
                this.updateHighScoreDisplay();
            }
        } catch (e) {
            this.updateHighScoreDisplay();
        }
    }
    
    // Update high score display
    updateHighScoreDisplay() {
        if (this.highScoreDisplay) {
            this.highScoreDisplay.textContent = this.highScore;
        }
    }
    
    // Load snake head images
    async loadHeadImages() {
        const directions = ['left', 'right', 'top', 'bottom'];
        
        // Try to get base URL immediately without waiting
        let baseUrl = null;
        
        // Quick check: try multiple methods in parallel
        // Method 1: Check if __gameResourceBase is already set
        if (window.__gameResourceBase && 
            (window.__gameResourceBase.startsWith('chrome-extension://') ||
             window.__gameResourceBase.startsWith('http://') ||
             window.__gameResourceBase.startsWith('https://'))) {
            baseUrl = window.__gameResourceBase;
        }
        
        // Method 2: Try parent window (fast check)
        if (!baseUrl && window.parent && window.parent !== window) {
            try {
                if (window.parent.releasesBaseUrl) {
                    baseUrl = window.parent.releasesBaseUrl;
                } else if (window.parent.__gameResourceBase) {
                    baseUrl = window.parent.__gameResourceBase;
                }
            } catch (e) {
                // Cannot access parent
            }
        }
        
        // Method 3: Try chrome.runtime (fast check)
        if (!baseUrl) {
            try {
                if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
                    // Use chrome.runtime.getURL or extract from script src (no hardcoded path)
                    try {
                        if (chrome.runtime.getURL) {
                            baseUrl = chrome.runtime.getURL('games/');
                            if (baseUrl && !baseUrl.endsWith('/')) {
                                baseUrl += '/';
                            }
                        }
                    } catch (e) {
                        // chrome.runtime.getURL not available
                    }
                    if (!baseUrl) {
                        // Extract from script src
                        try {
                            const scripts = document.getElementsByTagName('script');
                            for (let i = 0; i < scripts.length; i++) {
                                const script = scripts[i];
                                if (script.src && script.src.startsWith('chrome-extension://')) {
                                    const urlObj = new URL(script.src);
                                    const pathParts = urlObj.pathname.split('/').filter(p => p);
                                    const gamesIndex = pathParts.indexOf('games');
                                    if (gamesIndex >= 0) {
                                        baseUrl = `${urlObj.origin}/${pathParts.slice(0, gamesIndex + 1).join('/')}/`;
                                        break;
                                    }
                                }
                            }
                        } catch (e) {
                            // Cannot extract from script src
                        }
                    }
                }
            } catch (e) {
                // chrome.runtime not available
            }
        }
        
        // If we have a base URL, cache it and start loading immediately
        if (baseUrl && (baseUrl.startsWith('chrome-extension://') ||
                       baseUrl.startsWith('http://') ||
                       baseUrl.startsWith('https://'))) {
            window.__gameResourceBase = baseUrl;
        } else {
            // Only wait if we don't have base URL yet, but reduce wait time
            let waitCount = 0;
            const maxWait = 5; // Reduced to 250ms (5 * 50ms) instead of 1 second
            while (!baseUrl && waitCount < maxWait) {
                await new Promise(resolve => setTimeout(resolve, 50));
                waitCount++;
                
                // Check again
                if (window.__gameResourceBase && 
                    (window.__gameResourceBase.startsWith('chrome-extension://') ||
                     window.__gameResourceBase.startsWith('http://') ||
                     window.__gameResourceBase.startsWith('https://'))) {
                    baseUrl = window.__gameResourceBase;
                    break;
                }
                
                // Try parent again
                if (window.parent && window.parent !== window) {
                    try {
                        if (window.parent.releasesBaseUrl) {
                            baseUrl = window.parent.releasesBaseUrl;
                            break;
                        } else if (window.parent.__gameResourceBase) {
                            baseUrl = window.parent.__gameResourceBase;
                            break;
                        }
                    } catch (e) {
                        // Cannot access
                    }
                }
            }
            
            if (baseUrl) {
                window.__gameResourceBase = baseUrl;
            }
        }
        
        // Ensure baseUrl is available for all image loading
        // If baseUrl is still null, try one more time to get it
        if (!baseUrl || (!baseUrl.startsWith('chrome-extension://') &&
                         !baseUrl.startsWith('http://') &&
                         !baseUrl.startsWith('https://'))) {
            // Try all methods one more time
            if (window.__gameResourceBase && 
                (window.__gameResourceBase.startsWith('chrome-extension://') ||
                 window.__gameResourceBase.startsWith('http://') ||
                 window.__gameResourceBase.startsWith('https://'))) {
                baseUrl = window.__gameResourceBase;
            } else if (window.parent && window.parent !== window) {
                try {
                    baseUrl = window.parent.releasesBaseUrl || window.parent.__gameResourceBase;
                } catch (e) {
                    // Cannot access
                }
            }
            
            if (!baseUrl) {
                try {
                    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
                        // Use chrome.runtime.getURL or extract from script src (no hardcoded path)
                    try {
                        if (chrome.runtime.getURL) {
                            baseUrl = chrome.runtime.getURL('games/');
                            if (baseUrl && !baseUrl.endsWith('/')) {
                                baseUrl += '/';
                            }
                        }
                    } catch (e) {
                        // chrome.runtime.getURL not available
                    }
                    if (!baseUrl) {
                        // Extract from script src
                        try {
                            const scripts = document.getElementsByTagName('script');
                            for (let i = 0; i < scripts.length; i++) {
                                const script = scripts[i];
                                if (script.src && script.src.startsWith('chrome-extension://')) {
                                    const urlObj = new URL(script.src);
                                    const pathParts = urlObj.pathname.split('/').filter(p => p);
                                    const gamesIndex = pathParts.indexOf('games');
                                    if (gamesIndex >= 0) {
                                        baseUrl = `${urlObj.origin}/${pathParts.slice(0, gamesIndex + 1).join('/')}/`;
                                        break;
                                    }
                                }
                            }
                        } catch (e) {
                            // Cannot extract from script src
                        }
                    }
                    }
                } catch (e) {
                    // chrome.runtime not available
                }
            }
            
            if (baseUrl) {
                window.__gameResourceBase = baseUrl;
            }
        }
        
        for (const dir of directions) {
            let resourceUrl = window.getGameResource(`images/puppy-snake/head-${dir}.png`);
            
            // Ensure the URL is absolute - use the baseUrl we already found
            if (!resourceUrl.startsWith('http://') && !resourceUrl.startsWith('https://') && 
                !resourceUrl.startsWith('chrome-extension://') && !resourceUrl.startsWith('data:') &&
                !resourceUrl.startsWith('blob:')) {
                // Use the baseUrl we found earlier, or try to get it again
                let finalBaseUrl = baseUrl || window.__gameResourceBase;
                
                // If still no valid base URL, try all methods again
                if (!finalBaseUrl || (!finalBaseUrl.startsWith('chrome-extension://') &&
                                     !finalBaseUrl.startsWith('http://') &&
                                     !finalBaseUrl.startsWith('https://'))) {
                    // Method 1: Try parent window
                    if (window.parent && window.parent !== window) {
                        try {
                            if (window.parent.releasesBaseUrl) {
                                finalBaseUrl = window.parent.releasesBaseUrl;
                            } else if (window.parent.__gameResourceBase) {
                                finalBaseUrl = window.parent.__gameResourceBase;
                            }
                        } catch (e) {
                            // Cannot access
                        }
                    }
                    
                    // Method 2: Try chrome.runtime
                    if (!finalBaseUrl || (!finalBaseUrl.startsWith('chrome-extension://') &&
                                         !finalBaseUrl.startsWith('http://') &&
                                         !finalBaseUrl.startsWith('https://'))) {
                        try {
                            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
                                // Use chrome.runtime.getURL or extract from script src (no hardcoded path)
                                try {
                                    if (chrome.runtime.getURL) {
                                        finalBaseUrl = chrome.runtime.getURL('games/');
                                        if (finalBaseUrl && !finalBaseUrl.endsWith('/')) {
                                            finalBaseUrl += '/';
                                        }
                                    }
                                } catch (e) {
                                    // chrome.runtime.getURL not available
                                }
                                if (!finalBaseUrl) {
                                    // Extract from script src
                                    try {
                                        const scripts = document.getElementsByTagName('script');
                                        for (let i = 0; i < scripts.length; i++) {
                                            const script = scripts[i];
                                            if (script.src && script.src.startsWith('chrome-extension://')) {
                                                const urlObj = new URL(script.src);
                                                const pathParts = urlObj.pathname.split('/').filter(p => p);
                                                const gamesIndex = pathParts.indexOf('games');
                                                if (gamesIndex >= 0) {
                                                    finalBaseUrl = `${urlObj.origin}/${pathParts.slice(0, gamesIndex + 1).join('/')}/`;
                                                    break;
                                                }
                                            }
                                        }
                                    } catch (e) {
                                        // Cannot extract from script src
                                    }
                                }
                            }
                        } catch (e) {
                            // chrome.runtime not available
                        }
                    }
                    
                    // Method 3: Try to extract from script src
                    if (!finalBaseUrl || (!finalBaseUrl.startsWith('chrome-extension://') &&
                                         !finalBaseUrl.startsWith('http://') &&
                                         !finalBaseUrl.startsWith('https://'))) {
                        try {
                            const scripts = document.getElementsByTagName('script');
                            for (let j = 0; j < scripts.length; j++) {
                                const script = scripts[j];
                                if (script.src && script.src.startsWith('chrome-extension://')) {
                                    const urlObj = new URL(script.src);
                                    const pathParts = urlObj.pathname.split('/').filter(p => p);
                                    const gamesIndex = pathParts.indexOf('games');
                                    if (gamesIndex >= 0) {
                                        finalBaseUrl = `${urlObj.origin}/${pathParts.slice(0, gamesIndex + 1).join('/')}/`;
                                        break;
                                    }
                                }
                            }
                        } catch (e) {
                            // Cannot access scripts
                        }
                    }
                }
                
                if (finalBaseUrl && (finalBaseUrl.startsWith('chrome-extension://') ||
                                    finalBaseUrl.startsWith('http://') ||
                                    finalBaseUrl.startsWith('https://'))) {
                    // Clean the path - remove leading ../ or ./
                    const cleanPath = resourceUrl.replace(/^\.\.?\//, '').replace(/^\.\.?\//, '');
                    resourceUrl = finalBaseUrl + cleanPath;
                    if (!window.__gameResourceBase || !window.__gameResourceBase.startsWith('chrome-extension://')) {
                        window.__gameResourceBase = finalBaseUrl;
                    }
                } else {
                    // Last resort: still try to use the relative path
                }
            }
            
            const img = new Image();
            img.onload = () => {
                // Image loaded successfully
            };
            img.onerror = () => {
                // Try to reload with parent's base URL if available
                if (window.parent && window.parent !== window) {
                    try {
                        const parentBase = window.parent.releasesBaseUrl || window.parent.__gameResourceBase;
                        if (parentBase && (parentBase.startsWith('chrome-extension://') ||
                                          parentBase.startsWith('http://') ||
                                          parentBase.startsWith('https://'))) {
                            const cleanPath = `images/puppy-snake/head-${dir}.png`;
                            img.src = parentBase + cleanPath;
                            window.__gameResourceBase = parentBase;
                            return; // Don't log error yet, wait for retry
                        }
                    } catch (e) {
                        // Cannot access parent
                    }
                }
                
                // Try chrome.runtime as last resort
                try {
                    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
                        // Use chrome.runtime.getURL (no hardcoded path)
                        let chromeBaseUrl = null;
                        try {
                            if (chrome.runtime.getURL) {
                                chromeBaseUrl = chrome.runtime.getURL('games/');
                                if (chromeBaseUrl && !chromeBaseUrl.endsWith('/')) {
                                    chromeBaseUrl += '/';
                                }
                            }
                        } catch (e) {
                            // chrome.runtime.getURL not available
                        }
                        const cleanPath = `images/puppy-snake/head-${dir}.png`;
                        img.src = chromeBaseUrl + cleanPath;
                        window.__gameResourceBase = chromeBaseUrl;
                        return; // Don't log error yet, wait for retry
                    }
                } catch (e) {
                    // chrome.runtime not available
                }
            };
            img.src = resourceUrl;
            this.headImages[dir] = img;
        }
    }
    
    // Load background image
    async loadBackgroundImage() {
        // Try to get base URL immediately (similar to loadHeadImages)
        let baseUrl = window.__gameResourceBase;
        if (!baseUrl || (!baseUrl.startsWith('chrome-extension://') &&
                         !baseUrl.startsWith('http://') &&
                         !baseUrl.startsWith('https://'))) {
            if (window.parent && window.parent !== window) {
                try {
                    baseUrl = window.parent.releasesBaseUrl || window.parent.__gameResourceBase;
                } catch (e) {
                    // Cannot access
                }
            }
            
            if (!baseUrl) {
                try {
                    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
                        // Use chrome.runtime.getURL or extract from script src (no hardcoded path)
                    try {
                        if (chrome.runtime.getURL) {
                            baseUrl = chrome.runtime.getURL('games/');
                            if (baseUrl && !baseUrl.endsWith('/')) {
                                baseUrl += '/';
                            }
                        }
                    } catch (e) {
                        // chrome.runtime.getURL not available
                    }
                    if (!baseUrl) {
                        // Extract from script src
                        try {
                            const scripts = document.getElementsByTagName('script');
                            for (let i = 0; i < scripts.length; i++) {
                                const script = scripts[i];
                                if (script.src && script.src.startsWith('chrome-extension://')) {
                                    const urlObj = new URL(script.src);
                                    const pathParts = urlObj.pathname.split('/').filter(p => p);
                                    const gamesIndex = pathParts.indexOf('games');
                                    if (gamesIndex >= 0) {
                                        baseUrl = `${urlObj.origin}/${pathParts.slice(0, gamesIndex + 1).join('/')}/`;
                                        break;
                                    }
                                }
                            }
                        } catch (e) {
                            // Cannot extract from script src
                        }
                    }
                    }
                } catch (e) {
                    // chrome.runtime not available
                }
            }
            
            if (baseUrl) {
                window.__gameResourceBase = baseUrl;
            }
        }
        
        let resourceUrl = window.getGameResource('images/puppy-snake/bg.png');
        
        // Ensure the URL is absolute
        if (!resourceUrl.startsWith('http://') && !resourceUrl.startsWith('https://') && 
            !resourceUrl.startsWith('chrome-extension://') && !resourceUrl.startsWith('data:') &&
            !resourceUrl.startsWith('blob:')) {
            // Use the baseUrl we found, or try to get it again
            let finalBaseUrl = baseUrl || window.__gameResourceBase;
            
            // If still no valid base URL, try all methods again
            if (!finalBaseUrl || (!finalBaseUrl.startsWith('chrome-extension://') &&
                                 !finalBaseUrl.startsWith('http://') &&
                                 !finalBaseUrl.startsWith('https://'))) {
                if (window.parent && window.parent !== window) {
                    try {
                        if (window.parent.releasesBaseUrl) {
                            finalBaseUrl = window.parent.releasesBaseUrl;
                        } else if (window.parent.__gameResourceBase) {
                            finalBaseUrl = window.parent.__gameResourceBase;
                        }
                    } catch (e) {
                        // Cannot access
                    }
                }
                
                if (!finalBaseUrl) {
                    try {
                        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
                            // Use chrome.runtime.getURL or extract from script src (no hardcoded path)
                            try {
                                if (chrome.runtime.getURL) {
                                    finalBaseUrl = chrome.runtime.getURL('games/');
                                    if (finalBaseUrl && !finalBaseUrl.endsWith('/')) {
                                        finalBaseUrl += '/';
                                    }
                                }
                            } catch (e) {
                                // chrome.runtime.getURL not available
                            }
                            if (!finalBaseUrl) {
                                // Extract from script src
                                try {
                                    const scripts = document.getElementsByTagName('script');
                                    for (let i = 0; i < scripts.length; i++) {
                                        const script = scripts[i];
                                        if (script.src && script.src.startsWith('chrome-extension://')) {
                                            const urlObj = new URL(script.src);
                                            const pathParts = urlObj.pathname.split('/').filter(p => p);
                                            const gamesIndex = pathParts.indexOf('games');
                                            if (gamesIndex >= 0) {
                                                finalBaseUrl = `${urlObj.origin}/${pathParts.slice(0, gamesIndex + 1).join('/')}/`;
                                                break;
                                            }
                                        }
                                    }
                                } catch (e) {
                                    // Cannot extract from script src
                                }
                            }
                        }
                    } catch (e) {
                        // chrome.runtime not available
                    }
                }
            }
            
            if (finalBaseUrl && (finalBaseUrl.startsWith('chrome-extension://') ||
                               finalBaseUrl.startsWith('http://') ||
                               finalBaseUrl.startsWith('https://'))) {
                const cleanPath = resourceUrl.replace(/^\.\.?\//, '').replace(/^\.\.?\//, '');
                resourceUrl = finalBaseUrl + cleanPath;
                if (!window.__gameResourceBase || !window.__gameResourceBase.startsWith('chrome-extension://')) {
                    window.__gameResourceBase = finalBaseUrl;
                }
            }
        }
        
        this.bgImage = new Image();
        this.bgImage.onload = () => {
            // Background loaded
        };
        this.bgImage.onerror = () => {
            // Try to reload with parent's base URL if available
            if (window.parent && window.parent !== window) {
                try {
                    const parentBase = window.parent.releasesBaseUrl || window.parent.__gameResourceBase;
                    if (parentBase && (parentBase.startsWith('chrome-extension://') ||
                                      parentBase.startsWith('http://') ||
                                      parentBase.startsWith('https://'))) {
                        this.bgImage.src = parentBase + 'images/puppy-snake/bg.png';
                        window.__gameResourceBase = parentBase;
                        return; // Don't log error yet, wait for retry
                    }
                } catch (e) {
                    // Cannot access parent
                }
            }
            
            // Try chrome.runtime as last resort
            try {
                if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
                    // Use chrome.runtime.getURL (no hardcoded path)
                    let chromeBaseUrl = null;
                    try {
                        if (chrome.runtime.getURL) {
                            chromeBaseUrl = chrome.runtime.getURL('games/');
                            if (chromeBaseUrl && !chromeBaseUrl.endsWith('/')) {
                                chromeBaseUrl += '/';
                            }
                        }
                    } catch (e) {
                        // chrome.runtime.getURL not available
                    }
                    if (chromeBaseUrl) {
                        this.bgImage.src = chromeBaseUrl + 'images/puppy-snake/bg.png';
                    }
                    window.__gameResourceBase = chromeBaseUrl;
                    return; // Don't log error yet, wait for retry
                }
            } catch (e) {
                // chrome.runtime not available
            }
        };
        this.bgImage.src = resourceUrl;
    }
    
    // Load ball image
    async loadBallImage() {
        // Try to get base URL immediately (similar to loadHeadImages)
        let baseUrl = window.__gameResourceBase;
        if (!baseUrl || (!baseUrl.startsWith('chrome-extension://') &&
                         !baseUrl.startsWith('http://') &&
                         !baseUrl.startsWith('https://'))) {
            if (window.parent && window.parent !== window) {
                try {
                    baseUrl = window.parent.releasesBaseUrl || window.parent.__gameResourceBase;
                } catch (e) {
                    // Cannot access
                }
            }
            
            if (!baseUrl) {
                try {
                    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
                        // Use chrome.runtime.getURL or extract from script src (no hardcoded path)
                    try {
                        if (chrome.runtime.getURL) {
                            baseUrl = chrome.runtime.getURL('games/');
                            if (baseUrl && !baseUrl.endsWith('/')) {
                                baseUrl += '/';
                            }
                        }
                    } catch (e) {
                        // chrome.runtime.getURL not available
                    }
                    if (!baseUrl) {
                        // Extract from script src
                        try {
                            const scripts = document.getElementsByTagName('script');
                            for (let i = 0; i < scripts.length; i++) {
                                const script = scripts[i];
                                if (script.src && script.src.startsWith('chrome-extension://')) {
                                    const urlObj = new URL(script.src);
                                    const pathParts = urlObj.pathname.split('/').filter(p => p);
                                    const gamesIndex = pathParts.indexOf('games');
                                    if (gamesIndex >= 0) {
                                        baseUrl = `${urlObj.origin}/${pathParts.slice(0, gamesIndex + 1).join('/')}/`;
                                        break;
                                    }
                                }
                            }
                        } catch (e) {
                            // Cannot extract from script src
                        }
                    }
                    }
                } catch (e) {
                    // chrome.runtime not available
                }
            }
            
            if (baseUrl) {
                window.__gameResourceBase = baseUrl;
            }
        }
        
        let resourceUrl = window.getGameResource('images/puppy-snake/ball.png');
        
        // Ensure the URL is absolute
        if (!resourceUrl.startsWith('http://') && !resourceUrl.startsWith('https://') && 
            !resourceUrl.startsWith('chrome-extension://') && !resourceUrl.startsWith('data:') &&
            !resourceUrl.startsWith('blob:')) {
            // Use the baseUrl we found, or try to get it again
            let finalBaseUrl = baseUrl || window.__gameResourceBase;
            
            // If still no valid base URL, try all methods again
            if (!finalBaseUrl || (!finalBaseUrl.startsWith('chrome-extension://') &&
                                 !finalBaseUrl.startsWith('http://') &&
                                 !finalBaseUrl.startsWith('https://'))) {
                if (window.parent && window.parent !== window) {
                    try {
                        if (window.parent.releasesBaseUrl) {
                            finalBaseUrl = window.parent.releasesBaseUrl;
                        } else if (window.parent.__gameResourceBase) {
                            finalBaseUrl = window.parent.__gameResourceBase;
                        }
                    } catch (e) {
                        // Cannot access
                    }
                }
                
                if (!finalBaseUrl) {
                    try {
                        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
                            // Use chrome.runtime.getURL or extract from script src (no hardcoded path)
                            try {
                                if (chrome.runtime.getURL) {
                                    finalBaseUrl = chrome.runtime.getURL('games/');
                                    if (finalBaseUrl && !finalBaseUrl.endsWith('/')) {
                                        finalBaseUrl += '/';
                                    }
                                }
                            } catch (e) {
                                // chrome.runtime.getURL not available
                            }
                            if (!finalBaseUrl) {
                                // Extract from script src
                                try {
                                    const scripts = document.getElementsByTagName('script');
                                    for (let i = 0; i < scripts.length; i++) {
                                        const script = scripts[i];
                                        if (script.src && script.src.startsWith('chrome-extension://')) {
                                            const urlObj = new URL(script.src);
                                            const pathParts = urlObj.pathname.split('/').filter(p => p);
                                            const gamesIndex = pathParts.indexOf('games');
                                            if (gamesIndex >= 0) {
                                                finalBaseUrl = `${urlObj.origin}/${pathParts.slice(0, gamesIndex + 1).join('/')}/`;
                                                break;
                                            }
                                        }
                                    }
                                } catch (e) {
                                    // Cannot extract from script src
                                }
                            }
                        }
                    } catch (e) {
                        // chrome.runtime not available
                    }
                }
            }
            
            if (finalBaseUrl && (finalBaseUrl.startsWith('chrome-extension://') ||
                               finalBaseUrl.startsWith('http://') ||
                               finalBaseUrl.startsWith('https://'))) {
                const cleanPath = resourceUrl.replace(/^\.\.?\//, '').replace(/^\.\.?\//, '');
                resourceUrl = finalBaseUrl + cleanPath;
                if (!window.__gameResourceBase || !window.__gameResourceBase.startsWith('chrome-extension://')) {
                    window.__gameResourceBase = finalBaseUrl;
                }
            }
        }
        
        this.ballImage = new Image();
        this.ballImage.onload = () => {
            // Ball image loaded
        };
        this.ballImage.onerror = () => {
            // Try to reload with parent's base URL if available
            if (window.parent && window.parent !== window) {
                try {
                    const parentBase = window.parent.releasesBaseUrl || window.parent.__gameResourceBase;
                    if (parentBase && (parentBase.startsWith('chrome-extension://') ||
                                      parentBase.startsWith('http://') ||
                                      parentBase.startsWith('https://'))) {
                        this.ballImage.src = parentBase + 'images/puppy-snake/ball.png';
                        window.__gameResourceBase = parentBase;
                        return; // Don't log error yet, wait for retry
                    }
                } catch (e) {
                    // Cannot access parent
                }
            }
            
            // Try chrome.runtime as last resort
            try {
                if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
                    // Use chrome.runtime.getURL (no hardcoded path)
                    let chromeBaseUrl = null;
                    try {
                        if (chrome.runtime.getURL) {
                            chromeBaseUrl = chrome.runtime.getURL('games/');
                            if (chromeBaseUrl && !chromeBaseUrl.endsWith('/')) {
                                chromeBaseUrl += '/';
                            }
                        }
                    } catch (e) {
                        // chrome.runtime.getURL not available
                    }
                    if (chromeBaseUrl) {
                        this.ballImage.src = chromeBaseUrl + 'images/puppy-snake/ball.png';
                    }
                    window.__gameResourceBase = chromeBaseUrl;
                    return; // Don't log error yet, wait for retry
                }
            } catch (e) {
                // chrome.runtime not available
            }
        };
        this.ballImage.src = resourceUrl;
    }
    
    // Setup UI elements
    setupUI() {
        this.scoreDisplay = document.getElementById('score');
        this.highScoreDisplay = document.getElementById('highScore');
        this.footer = document.getElementById('footer');
        this.gameArea = document.getElementById('gamemain');
        
        // Update gameArea size (use calculated width and height that are multiples of cellSize)
        if (this.gameArea) {
            this.gameArea.style.width = `${this.width}px`;
            this.gameArea.style.height = `${this.height}px`;
        }
        
        // Update gamebox size if it exists (use calculated width)
        const gamebox = document.getElementById('gamebox');
        if (gamebox) {
            gamebox.style.width = `${this.width}px`;
            gamebox.style.height = `${this.height}px`;
        }
        
        // Update header size if it exists (use calculated width)
        const header = document.querySelector('.header');
        if (header) {
            header.style.width = `${this.width}px`;
            header.style.top = `${Math.floor(this.adaptive * 30)}px`;
            
            // Update header text sizes
            const current = header.querySelector('.current');
            if (current) {
                current.style.fontSize = `${Math.floor(this.adaptive * 30)}px`;
            }
            
            const record = header.querySelector('.record');
            if (record) {
                record.style.fontSize = `${Math.floor(this.adaptive * 16)}px`;
            }
        }
        
        // Update gameover styles if it exists
        const gameover = document.querySelector('.gameover');
        if (gameover) {
            gameover.style.width = `${this.width}px`;
            gameover.style.height = `${this.height}px`;
            
            const gameOverText = gameover.querySelector('h2');
            if (gameOverText) {
                gameOverText.style.fontSize = `${Math.floor(this.adaptive * 36)}px`;
            }
            
            const restartBtn = document.getElementById('restartgamebutton');
            if (restartBtn) {
                restartBtn.style.padding = `${Math.floor(this.adaptive * 10)}px ${Math.floor(this.adaptive * 20)}px`;
                restartBtn.style.fontSize = `${Math.floor(this.adaptive * 20)}px`;
            }
        }
        
        // Update pause overlay styles if it exists
        const pause = document.getElementById('pause');
        if (pause) {
            const pauseP = pause.querySelector('p');
            if (pauseP) {
                pauseP.style.fontSize = `${Math.floor(this.adaptive * 24)}px`;
                pauseP.style.marginTop = `${Math.floor(this.adaptive * 150)}px`;
            }
            
            // Update continue button styles
            const continueBtn = document.getElementById('continuegamebutton');
            if (continueBtn) {
                continueBtn.style.width = `${Math.floor(120 * this.adaptive)}px`;
                continueBtn.style.padding = `${Math.floor(6 * this.adaptive)}px`;
                continueBtn.style.fontSize = `${Math.floor(24 * this.adaptive)}px`;
                continueBtn.style.margin = `${Math.floor(16 * this.adaptive)}px auto`;
                continueBtn.style.borderRadius = `${Math.floor(10 * this.adaptive)}px`;
            }
        }
        
        // Update high score display
        if (this.highScoreDisplay) {
            this.highScoreDisplay.textContent = this.highScore;
        }
        
        // Update score display
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = '0';
        }
    }
    
    // Setup canvas
    setupCanvas() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.display = 'block';
        this.canvas.style.margin = '0 auto';
        this.canvas.style.position = 'relative';
        this.canvas.style.zIndex = '1';
        
        // Clear gameArea and add canvas
        if (this.gameArea) {
            // Clear content using removeChild instead of innerHTML
            while (this.gameArea.firstChild) {
                this.gameArea.removeChild(this.gameArea.firstChild);
            }
            this.gameArea.appendChild(this.canvas);
        }
        
        this.ctx = this.canvas.getContext('2d');
    }
    
    // Initialize snake
    initSnake() {
        // Snake starts at (210, 210) with direction RIGHT
        // Original: 210 = 7 * 30
        const originalCellSize = 30;
        const headGridX = Math.floor(210 / originalCellSize); // 7
        const headGridY = Math.floor(210 / originalCellSize); // 7
        const headX = headGridX * this.cellSize;
        const headY = headGridY * this.cellSize;
        
        // Create snake segments: [tail, body, head]
        // Head is at (210, 210), body at (180, 210), tail at (150, 210)
        this.snake = [
            new SnakeSegment(headX - this.cellSize * 2, headY, DIRECTIONS.RIGHT, this.cellSize), // tail
            new SnakeSegment(headX - this.cellSize, headY, DIRECTIONS.RIGHT, this.cellSize), // body
            new SnakeSegment(headX, headY, DIRECTIONS.RIGHT, this.cellSize)        // head
        ];
        
        this.direction = DIRECTIONS.RIGHT;
        this.nextDirection = DIRECTIONS.RIGHT;
    }
    
    // Initialize ball
    initBall() {
        // Ball starts at (540, 210)
        // Original: 540 = 18 * 30, 210 = 7 * 30
        const originalCellSize = 30;
        const ballGridX = Math.floor(540 / originalCellSize); // 18
        const ballGridY = Math.floor(210 / originalCellSize); // 7
        this.ball = { x: ballGridX * this.cellSize, y: ballGridY * this.cellSize };
        
        // Load ball image (will be loaded in loadBallImage method)
        this.ballImage = null;
        this.loadBallImage();
    }
    
    // Get random coordinate for ball (matching original logic)
    getRandomCoordinate() {
        const col = this.cols;
        const row = this.rows;
        let left = (1 + Math.floor(Math.random() * (col - 2))) * this.cellSize;
        let top = 0;
        
        // Original: 120 = 4 * 30, 270 = 9 * 30
        const originalCellSize = 30;
        const minLeftGrid = Math.floor(120 / originalCellSize); // 4
        const maxLeftGrid = Math.floor(270 / originalCellSize); // 9
        const minLeft = minLeftGrid * this.cellSize;
        const maxLeft = maxLeftGrid * this.cellSize;
        
        if (left >= minLeft && left <= maxLeft) {
            top = (4 + Math.floor(Math.random() * (row - 2 - 4 + 1))) * this.cellSize;
        } else {
            top = (1 + Math.floor(Math.random() * (row - 2))) * this.cellSize;
        }
        
        return { x: left, y: top };
    }
    
    // Check if ball position is valid (not on snake)
    isBallPositionValid(ballPos) {
        for (const segment of this.snake) {
            if (segment.x === ballPos.x && segment.y === ballPos.y) {
                return false;
            }
        }
        return true;
    }
    
    // Check if snake area is valid (all segments within bounds)
    isSnakeAreaValid() {
        for (const segment of this.snake) {
            if (segment.x < 0 || segment.y < 0) {
                return false;
            }
        }
        
        const head = this.snake[this.snake.length - 1];
        if (head.x >= this.width || head.y >= this.height) {
            return false;
        }
        
        return true;
    }
    
    // Spawn ball at random position
    spawnBall() {
        let ballPos;
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            ballPos = this.getRandomCoordinate();
            attempts++;
        } while (attempts < maxAttempts && !this.isBallPositionValid(ballPos));
        
        if (attempts < maxAttempts) {
            this.ball = ballPos;
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // Add window resize listener
        this.setupResizeListener();
    }
    
    // Setup resize listener
    setupResizeListener() {
        // Remove existing listener if any
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        
        // Create new resize handler
        // Note: Window resize does not update game interface during INIT state
        // Game interface will be updated when restart() or init() is called
        this.resizeHandler = () => {
            // Do nothing - game interface will be updated when game starts/restarts
        };
        
        window.addEventListener('resize', this.resizeHandler);
    }
    
    // Handle key press
    handleKeyPress(e) {
        const keyCode = e.keyCode || e.which;
        const key = e.key;
        
        // Prevent default for arrow keys and WASD
        if ([37, 38, 39, 40, 65, 87, 83, 68].indexOf(keyCode) >= 0) {
            e.preventDefault();
        }
        
        // Handle direction changes
        const head = this.snake[this.snake.length - 1];
        const secondLast = this.snake.length > 1 ? this.snake[this.snake.length - 2] : null;
        
        switch (keyCode) {
            case 37: // Left arrow
            case 65: // A
                if (head.direction !== DIRECTIONS.RIGHT && 
                    (!secondLast || secondLast.direction !== DIRECTIONS.RIGHT) &&
                    this.state !== GAME_STATE.PAUSED) {
                    this.nextDirection = DIRECTIONS.LEFT;
                }
                break;
            case 38: // Up arrow
            case 87: // W
                if (head.direction !== DIRECTIONS.BOTTOM && 
                    (!secondLast || secondLast.direction !== DIRECTIONS.BOTTOM) &&
                    this.state !== GAME_STATE.PAUSED) {
                    this.nextDirection = DIRECTIONS.TOP;
                }
                break;
            case 39: // Right arrow
            case 68: // D
                if (head.direction !== DIRECTIONS.LEFT && 
                    (!secondLast || secondLast.direction !== DIRECTIONS.LEFT) &&
                    this.state !== GAME_STATE.PAUSED) {
                    this.nextDirection = DIRECTIONS.RIGHT;
                }
                break;
            case 40: // Down arrow
            case 83: // S
                if (head.direction !== DIRECTIONS.TOP && 
                    (!secondLast || secondLast.direction !== DIRECTIONS.TOP) &&
                    this.state !== GAME_STATE.PAUSED) {
                    this.nextDirection = DIRECTIONS.BOTTOM;
                }
                break;
            case 32: // Spacebar
                e.preventDefault();
                if (this.state === GAME_STATE.START) {
                    this.pauseGame();
                } else if (this.state === GAME_STATE.PAUSED) {
                    this.continueGame();
                } else if (this.state === GAME_STATE.INIT) {
                    this.startGame();
                } else if (this.state === GAME_STATE.GAME_OVER) {
                    this.restart();
                }
                break;
        }
        
        // Start game on first direction key press
        if ([37, 38, 39, 40, 65, 87, 83, 68].indexOf(keyCode) >= 0 && this.state === GAME_STATE.INIT) {
            this.state = GAME_STATE.START;
            if (this.footer) {
                this.footer.style.display = 'none';
            }
        }
    }
    
    // Start game
    startGame() {
        this.state = GAME_STATE.START;
        if (this.footer) {
            this.footer.style.display = 'none';
        }
    }
    
    // Pause game
    pauseGame() {
        this.state = GAME_STATE.PAUSED;
        this.showPauseOverlay();
    }
    
    // Continue game
    continueGame() {
        this.hidePauseOverlay();
        this.state = GAME_STATE.START;
    }
    
    // Show pause overlay
    showPauseOverlay() {
        if (document.getElementById('pause')) {
            return;
        }
        
        // Get gameArea (refresh reference)
        const gameArea = document.getElementById('gamemain');
        if (!gameArea) {
            return;
        }
        
        const pauseDiv = document.createElement('div');
        pauseDiv.id = 'pause';
        pauseDiv.className = 'pause';
        // Ensure overlay is on top
        pauseDiv.style.position = 'absolute';
        pauseDiv.style.top = '0';
        pauseDiv.style.left = '0';
        pauseDiv.style.width = '100%';
        pauseDiv.style.height = '100%';
        pauseDiv.style.zIndex = '10';
        // Create elements using DOM methods instead of innerHTML
        const pauseP = document.createElement('p');
        pauseP.textContent = 'Game Paused';
        pauseP.style.fontSize = `${Math.floor(this.adaptive * 24)}px`;
        pauseP.style.marginTop = `${Math.floor(this.adaptive * 150)}px`;
        pauseDiv.appendChild(pauseP);
        
        const continueBtn = document.createElement('a');
        continueBtn.id = 'continuegamebutton';
        continueBtn.textContent = 'Continue';
        continueBtn.style.width = `${Math.floor(120 * this.adaptive)}px`;
        continueBtn.style.padding = `${Math.floor(6 * this.adaptive)}px`;
        continueBtn.style.fontSize = `${Math.floor(24 * this.adaptive)}px`;
        continueBtn.style.margin = `${Math.floor(16 * this.adaptive)}px auto`;
        continueBtn.style.borderRadius = `${Math.floor(10 * this.adaptive)}px`;
        pauseDiv.appendChild(continueBtn);
        
        gameArea.appendChild(pauseDiv);
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.continueGame();
            });
        }
    }
    
    // Hide pause overlay
    hidePauseOverlay() {
        const pauseDiv = document.getElementById('pause');
        if (pauseDiv) {
            pauseDiv.remove();
        }
    }
    
    // Move snake
    moveSnake() {
        if (this.state !== GAME_STATE.START) {
            return;
        }
        
        // Update head direction
        const head = this.snake[this.snake.length - 1];
        head.direction = this.nextDirection;
        this.direction = this.nextDirection;
        
        // Move all segments
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            
            // Move segment
            segment.move();
            
            // Propagate direction from next segment
            if (i < this.snake.length - 1) {
                segment.direction = this.snake[i + 1].direction;
            }
        }
        
        // Check game over
        if (this.checkGameOver()) {
            this.gameOver();
            return;
        }
        
        // Check if ball is eaten
        if (this.checkBallEaten()) {
            this.growSnake();
            this.spawnBall();
            this.updateScore();
            this.updateDelay();
        }
    }
    
    // Check game over
    checkGameOver() {
        const head = this.snake[this.snake.length - 1];
        
        // Check boundaries
        if (head.x < 0 || head.x >= this.width || 
            head.y < 0 || head.y >= this.height) {
            return true;
        }
        
        // Check collision with self (excluding head and immediate body)
        for (let i = 0; i < this.snake.length - 2; i++) {
            if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
                return true;
            }
        }
        
        return false;
    }
    
    // Check if ball is eaten
    checkBallEaten() {
        const head = this.snake[this.snake.length - 1];
        return head.x === this.ball.x && head.y === this.ball.y;
    }
    
    // Grow snake
    growSnake() {
        const tail = this.snake[0];
        // Calculate new segment position: behind the tail (opposite direction)
        let newX = tail.x;
        let newY = tail.y;
        
        switch (tail.direction) {
            case DIRECTIONS.LEFT:
                // Tail is moving left, new segment should be to the right
                newX = tail.x + this.cellSize;
                break;
            case DIRECTIONS.RIGHT:
                // Tail is moving right, new segment should be to the left
                newX = tail.x - this.cellSize;
                break;
            case DIRECTIONS.TOP:
                // Tail is moving up, new segment should be below
                newY = tail.y + this.cellSize;
                break;
            case DIRECTIONS.BOTTOM:
                // Tail is moving down, new segment should be above
                newY = tail.y - this.cellSize;
                break;
        }
        
        const newSegment = new SnakeSegment(newX, newY, tail.direction, this.cellSize);
        this.snake.unshift(newSegment);
    }
    
    // Update score
    updateScore() {
        // Calculate points based on score thresholds
        let points = 5;
        for (let i = SCORE_THRESHOLDS.length - 1; i >= 0; i--) {
            if (this.score >= SCORE_THRESHOLDS[i].score) {
                points = SCORE_THRESHOLDS[i].points;
                break;
            }
        }
        
        this.score += points;
        
        // Update score display
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = this.score;
        }
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            if (this.highScoreDisplay) {
                this.highScoreDisplay.textContent = this.highScore;
            }
        }
    }
    
    // Save high score to chrome.storage.local
    saveHighScore() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ 'puppy-snake_hs': this.highScore }, () => {
                    if (chrome.runtime.lastError) {
                        // Failed to save high score
                    }
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                localStorage.setItem('puppy-snake_hs', this.highScore);
            }
        } catch (e) {
            // Failed to save high score
        }
    }
    
    // Update delay based on score
    updateDelay() {
        for (let i = SCORE_THRESHOLDS.length - 1; i >= 0; i--) {
            if (this.score >= SCORE_THRESHOLDS[i].score) {
                this.delay = SCORE_THRESHOLDS[i].delay;
                break;
            }
        }
    }
    
    // Game over
    gameOver() {
        this.state = GAME_STATE.GAME_OVER;
        // Stop game loop from moving
        this.lastMoveTime = 0;
        this.showGameOverOverlay();
    }
    
    // Show game over overlay (matching number-snake format)
    showGameOverOverlay() {
        // Remove existing overlay if any
        const existingOverlay = document.getElementById('gameover');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // Get gameArea (refresh reference in case it changed)
        const gameArea = document.getElementById('gamemain');
        if (!gameArea) {
            return;
        }
        
        const gameOverDiv = document.createElement('div');
        gameOverDiv.id = 'gameover';
        gameOverDiv.className = 'gameover';
        gameOverDiv.style.display = 'block';
        gameOverDiv.style.position = 'absolute';
        gameOverDiv.style.top = '0';
        gameOverDiv.style.left = '0';
        gameOverDiv.style.width = '100%';
        gameOverDiv.style.height = '100%';
        gameOverDiv.style.zIndex = '10';
        
        // Create overlay-content wrapper for centering
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'overlay-content';
        
        // Create game over text (h2, matching number-snake)
        const gameOverText = document.createElement('h2');
        gameOverText.textContent = 'Game Over!';
        gameOverText.style.fontSize = `${Math.floor(this.adaptive * 36)}px`;
        contentWrapper.appendChild(gameOverText);
        
        // Create restart button
        const restartBtn = document.createElement('a');
        restartBtn.id = 'restartgamebutton';
        restartBtn.textContent = 'Restart Game';
        restartBtn.style.padding = `${Math.floor(this.adaptive * 10)}px ${Math.floor(this.adaptive * 20)}px`;
        restartBtn.style.fontSize = `${Math.floor(this.adaptive * 20)}px`;
        contentWrapper.appendChild(restartBtn);
        
        gameOverDiv.appendChild(contentWrapper);
        gameArea.appendChild(gameOverDiv);
        
        // Update high score display
        if (this.highScoreDisplay) {
            this.highScoreDisplay.textContent = this.highScore;
        }
        
        // Add event listener to the restart button
        restartBtn.addEventListener('click', () => {
            this.restart();
        });
    }
    
    // Restart game
    restart() {
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        // Cancel animation frame
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Remove overlays
        const gameOverDiv = document.getElementById('gameover');
        if (gameOverDiv) {
            gameOverDiv.remove();
        }
        this.hidePauseOverlay();
        
        // Reset game state
        this.state = GAME_STATE.INIT;
        this.score = 0;
        this.delay = INITIAL_DELAY;
        this.direction = DIRECTIONS.RIGHT;
        this.nextDirection = DIRECTIONS.RIGHT;
        this.lastMoveTime = 0;
        
        // Update score display
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = '0';
        }
        
        // Recalculate canvas with new dimensions
        this.setupCanvas();
        
        // Clear canvas
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
        
        // Reinitialize snake and ball
        this.initSnake();
        this.initBall();
        
        // Show footer
        if (this.footer) {
            this.footer.style.display = '';
        }
        
        // Restart game loop
        this.gameLoop();
    }
    
    // Draw game
    draw() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background
        if (this.bgImage && this.bgImage.complete) {
            this.ctx.drawImage(this.bgImage, 0, 0, this.width, this.height);
        } else {
            // Fallback background color
            this.ctx.fillStyle = '#161c1c';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
        
        // Draw ball
        if (this.ballImage && this.ballImage.complete) {
            this.ctx.drawImage(this.ballImage, this.ball.x, this.ball.y, this.cellSize, this.cellSize);
        } else {
            // Fallback ball (red circle)
            this.ctx.fillStyle = 'red';
            this.ctx.beginPath();
            this.ctx.arc(
                this.ball.x + this.cellSize / 2,
                this.ball.y + this.cellSize / 2,
                this.cellSize / 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }
        
        // Draw snake
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const isHead = (i === this.snake.length - 1);
            
            if (isHead) {
                // Draw head with image
                const headImg = this.headImages[segment.direction];
                if (headImg && headImg.complete) {
                    this.ctx.drawImage(headImg, segment.x, segment.y, this.cellSize, this.cellSize);
                } else {
                    // Fallback head (green circle)
                    this.ctx.fillStyle = 'green';
                    this.ctx.beginPath();
                    this.ctx.arc(
                        segment.x + this.cellSize / 2,
                        segment.y + this.cellSize / 2,
                        this.cellSize / 2,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.fill();
                }
            } else {
                // Draw body segment (semi-transparent white)
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.fillRect(segment.x, segment.y, this.cellSize, this.cellSize);
            }
        }
        
        // Draw start message if in init state
        if (this.state === GAME_STATE.INIT) {
            this.drawStartMessage();
        }
    }
    
    // Draw professional start message with backdrop and arrow icons
    drawStartMessage() {
        const ctx = this.ctx;
        const ad = this.adaptive;
        const cx = this.width / 2;
        const cy = this.height / 2 + 60 * ad;
        
        // Pulsing opacity animation
        const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 600);
        
        ctx.save();
        ctx.globalAlpha = pulse;
        
        // --- Backdrop pill ---
        const pillW = Math.floor(360 * ad);
        const pillH = Math.floor(52 * ad);
        const pillR = Math.floor(pillH / 2);
        const px = cx - pillW / 2;
        const py = cy - pillH / 2 - 4 * ad;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.beginPath();
        ctx.moveTo(px + pillR, py);
        ctx.lineTo(px + pillW - pillR, py);
        ctx.arc(px + pillW - pillR, py + pillR, pillR, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(px + pillR, py + pillH);
        ctx.arc(px + pillR, py + pillR, pillR, Math.PI / 2, -Math.PI / 2);
        ctx.closePath();
        ctx.fill();
        
        // Subtle border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = Math.max(1, Math.floor(1.5 * ad));
        ctx.stroke();
        
        // --- Arrow icons (4 small triangles in cross pattern) ---
        const arrowSize = Math.floor(6 * ad);
        const arrowGap = Math.floor(12 * ad);
        const arrowCenterX = px + Math.floor(36 * ad);
        const arrowCenterY = cy - 4 * ad;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        
        // Up arrow
        ctx.beginPath();
        ctx.moveTo(arrowCenterX, arrowCenterY - arrowGap - arrowSize);
        ctx.lineTo(arrowCenterX - arrowSize, arrowCenterY - arrowGap + arrowSize * 0.3);
        ctx.lineTo(arrowCenterX + arrowSize, arrowCenterY - arrowGap + arrowSize * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // Down arrow
        ctx.beginPath();
        ctx.moveTo(arrowCenterX, arrowCenterY + arrowGap + arrowSize);
        ctx.lineTo(arrowCenterX - arrowSize, arrowCenterY + arrowGap - arrowSize * 0.3);
        ctx.lineTo(arrowCenterX + arrowSize, arrowCenterY + arrowGap - arrowSize * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // Left arrow
        ctx.beginPath();
        ctx.moveTo(arrowCenterX - arrowGap - arrowSize, arrowCenterY);
        ctx.lineTo(arrowCenterX - arrowGap + arrowSize * 0.3, arrowCenterY - arrowSize);
        ctx.lineTo(arrowCenterX - arrowGap + arrowSize * 0.3, arrowCenterY + arrowSize);
        ctx.closePath();
        ctx.fill();
        
        // Right arrow
        ctx.beginPath();
        ctx.moveTo(arrowCenterX + arrowGap + arrowSize, arrowCenterY);
        ctx.lineTo(arrowCenterX + arrowGap - arrowSize * 0.3, arrowCenterY - arrowSize);
        ctx.lineTo(arrowCenterX + arrowGap - arrowSize * 0.3, arrowCenterY + arrowSize);
        ctx.closePath();
        ctx.fill();
        
        // --- Main text (offset right to avoid arrows) ---
        const textX = cx + Math.floor(22 * ad);
        const fontSize = Math.floor(18 * ad);
        ctx.font = `600 ${fontSize}px "Segoe UI", Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Text shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillText('Press Any Arrow Key to Start', textX + 1 * ad, cy - 3 * ad);
        
        // Main text
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Press Any Arrow Key to Start', textX, cy - 4 * ad);
        
        ctx.restore();
    }
    
    // Game loop
    gameLoop() {
        const now = Date.now();
        
        // Move snake at intervals
        if (this.state === GAME_STATE.START && now - this.lastMoveTime > this.delay) {
            this.lastMoveTime = now;
            this.moveSnake();
        }
        
        // Draw game
        this.draw();
        
        // Continue loop
        this.animationFrame = requestAnimationFrame(() => {
            this.gameLoop();
        });
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PuppySnakeGame();
    });
} else {
    new PuppySnakeGame();
}

