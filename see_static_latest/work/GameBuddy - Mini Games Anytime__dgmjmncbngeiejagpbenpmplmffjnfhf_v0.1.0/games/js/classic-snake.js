/*
 * Classic Snake Game - Alternative Implementation
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
const SCORE_INCREMENT_BASE = 10;

// Score thresholds for speed and points
const SCORE_THRESHOLDS = [
    { score: 0, delay: 120, points: 10 },
    { score: 100, delay: 110, points: 15 },
    { score: 200, delay: 100, points: 20 },
    { score: 400, delay: 90, points: 30 },
    { score: 800, delay: 80, points: 40 },
    { score: 1600, delay: 70, points: 50 },
    { score: 3200, delay: 60, points: 100 }
];

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
    
    // Move segment based on direction (matching original: only moves, doesn't update direction)
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
        // Direction is updated externally, not here (matching original)
    }
    
    // Update direction
    setDirection(newDirection) {
        // Prevent reversing direction
        if (this.isOpposite(this.direction, newDirection)) {
            return false;
        }
        this.nextDirection = newDirection;
        return true;
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

// Classic Snake Game Class
class ClassicSnakeGame {
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
        
        // Apple data
        this.apple = { x: 0, y: 0 };
        this.appleImage = null;
        
        // Snake head images
        this.headImages = {};
        this.loadHeadImages();
        
        // Canvas
        this.canvas = null;
        this.ctx = null;
        this.gameArea = null;
        this.width = 0;
        this.height = 0;
        this.cols = 0;
        this.rows = 0;
        
        // Animation frame
        this.animationFrame = null;
        
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
    
    // Setup UI elements with adaptive sizes
    setupUI() {
        // Update gameArea size (use calculated width and height that are multiples of cellSize)
        if (this.gameArea) {
            this.gameArea.style.width = `${this.width}px`;
            this.gameArea.style.height = `${this.height}px`;
        }
        
        // Update gamebox size if it exists (use calculated width)
        const gamebox = document.getElementById('gamebox');
        if (gamebox) {
            gamebox.style.width = `${this.width}px`;
        }
        
        // Update header size if it exists (use calculated width)
        const header = document.querySelector('.header');
        if (header) {
            header.style.top = `${Math.floor(this.adaptive * 30)}px`;
            header.style.width = `${this.width}px`;
            header.style.fontSize = `${Math.floor(this.adaptive * 16)}px`;
            
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
    }
    
    // Initialize game
    init() {
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        // Load high score from chrome.storage.local
        this.loadHighScore();
        
        // Setup game area
        this.setupGameArea();
        
        // Initialize snake
        this.initSnake();
        
        // Initialize apple
        this.initApple();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start game loop
        this.gameLoop();
    }
    
    // Load high score from chrome.storage.local
    loadHighScore() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get(['snake_hs'], (result) => {
                    if (chrome.runtime.lastError) {
                        this.updateHighScore();
                        return;
                    }
                    
                    if (result.snake_hs !== undefined && result.snake_hs !== null) {
                        try {
                            this.highScore = parseInt(result.snake_hs, 10) || 0;
                        } catch (e) {
                            this.highScore = 0;
                        }
                    }
                    this.updateHighScore();
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                const highScoreVal = localStorage.getItem('snake_hs');
                if (highScoreVal != null) {
                    this.highScore = parseInt(highScoreVal, 10);
                }
                this.updateHighScore();
            }
        } catch (e) {
            this.updateHighScore();
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
        
        // Load all images in parallel using Promise.all for faster loading
        const imagePromises = directions.map(async (dir) => {
            let resourceUrl = window.getGameResource(`images/classic-snake/head-${dir}.png`);
            
            // Ensure the URL is absolute - use the baseUrl we already found
            if (!resourceUrl.startsWith('http://') && !resourceUrl.startsWith('https://') && 
                !resourceUrl.startsWith('chrome-extension://') && !resourceUrl.startsWith('data:') &&
                !resourceUrl.startsWith('blob:')) {
                // Use the baseUrl we found earlier, or try to get it again with multiple methods
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
            
            // Create image and load it
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.headImages[dir] = img;
                    resolve(img);
                };
                img.onerror = () => {
                    // Try to reload with parent's base URL if available
                    let retrySuccess = false;
                    if (window.parent && window.parent !== window) {
                        try {
                            const parentBase = window.parent.releasesBaseUrl || window.parent.__gameResourceBase;
                            if (parentBase && (parentBase.startsWith('chrome-extension://') ||
                                              parentBase.startsWith('http://') ||
                                              parentBase.startsWith('https://'))) {
                                const cleanPath = `images/classic-snake/head-${dir}.png`;
                                const retryUrl = parentBase + cleanPath;
                                img.src = retryUrl;
                                window.__gameResourceBase = parentBase;
                                retrySuccess = true;
                                // Set up a new error handler for the retry
                                img.onerror = () => {
                                    this.headImages[dir] = img;
                                    resolve(img);
                                };
                                img.onload = () => {
                                    this.headImages[dir] = img;
                                    resolve(img);
                                };
                                return; // Don't resolve yet, wait for retry result
                            }
                        } catch (e) {
                            // Cannot access parent
                        }
                    }
                    
                    // Try chrome.runtime as last resort
                    if (!retrySuccess) {
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
                                const cleanPath = `images/classic-snake/head-${dir}.png`;
                                const retryUrl = chromeBaseUrl + cleanPath;
                                img.src = retryUrl;
                                window.__gameResourceBase = chromeBaseUrl;
                                retrySuccess = true;
                                // Set up a new error handler for the retry
                                img.onerror = () => {
                                    this.headImages[dir] = img;
                                    resolve(img);
                                };
                                img.onload = () => {
                                    this.headImages[dir] = img;
                                    resolve(img);
                                };
                                return; // Don't resolve yet, wait for retry result
                            }
                        } catch (e) {
                            // chrome.runtime not available
                        }
                    }
                    
                    // Still store the image even if it failed, so game can continue
                    this.headImages[dir] = img;
                    resolve(img); // Resolve anyway to not block other images
                };
                img.src = resourceUrl;
            });
        });
        
        // Wait for all images to load (or fail) in parallel
        await Promise.all(imagePromises);
    }
    
    // Setup game area
    setupGameArea() {
        this.gameArea = document.getElementById('gamemain');
        if (!this.gameArea) return;
        
        // Update UI sizes first
        this.setupUI();
        
        // Remove existing canvas if it exists
        const existingCanvas = document.getElementById('snakeCanvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'snakeCanvas';
        this.canvas.style.display = 'block';
        this.gameArea.appendChild(this.canvas);
        
        // Use calculated dimensions (already multiples of cellSize)
        // Note: width, height, cols, and rows are already calculated in updateAdaptiveSize()
        // and set in setupUI(), so we use those values directly
        
        // Set canvas size
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');
    }
    
    // Initialize snake (matching original: tail, body, head order)
    initSnake() {
        this.snake = [];
        
        // Initial position (matching original: left: 210, top: 210)
        // Scale initial position based on adaptive size, but align to grid
        // Original: 210 = 7 * 30
        const originalCellSize = 30;
        const gridX = Math.floor(210 / originalCellSize); // 7
        const gridY = Math.floor(210 / originalCellSize); // 7
        const startX = gridX * this.cellSize;
        const startY = gridY * this.cellSize;
        const direction = DIRECTIONS.RIGHT;
        
        // Create snake segments (matching original order: tail, body, head)
        // Tail (left: startX - 60, top: startY)
        this.snake.push(new SnakeSegment(startX - this.cellSize * 2, startY, direction, this.cellSize));
        // Body (left: startX - 30, top: startY)
        this.snake.push(new SnakeSegment(startX - this.cellSize, startY, direction, this.cellSize));
        // Head (left: startX, top: startY) - last element
        this.snake.push(new SnakeSegment(startX, startY, direction, this.cellSize));
        
        this.direction = direction;
        this.nextDirection = direction;
    }
    
    // Initialize apple
    initApple() {
        // Initial apple position (matching original: left: 540, top: 210)
        // Scale initial position based on adaptive size, but align to grid
        // Original: 540 = 18 * 30, 210 = 7 * 30
        const originalCellSize = 30;
        const gridX = Math.floor(540 / originalCellSize); // 18
        const gridY = Math.floor(210 / originalCellSize); // 7
        this.apple = { x: gridX * this.cellSize, y: gridY * this.cellSize };
        
        // Ensure apple doesn't overlap with snake
        while (this.isAppleOnSnake()) {
            this.generateApple();
        }
    }
    
    // Generate random apple position
    generateApple() {
        const col = Math.floor(this.width / this.cellSize);
        const row = Math.floor(this.height / this.cellSize);
        
        // Use getCoordinate logic (matching original)
        let left = (1 + Math.floor(Math.random() * (col - 2))) * this.cellSize;
        let top = 0;
        
        // Original: 120 = 4 * 30, 270 = 9 * 30
        const originalCellSize = 30;
        const minLeftGrid = Math.floor(120 / originalCellSize); // 4
        const maxLeftGrid = Math.floor(270 / originalCellSize); // 9
        const minLeft = minLeftGrid * this.cellSize;
        const maxLeft = maxLeftGrid * this.cellSize;
        
        if (left >= minLeft && left <= maxLeft) {
            top = (4 + Math.floor(Math.random() * (row - 2 - 4))) * this.cellSize;
        } else {
            top = (1 + Math.floor(Math.random() * (row - 2))) * this.cellSize;
        }
        
        this.apple = { x: left, y: top };
    }
    
    // Check if apple is on snake
    isAppleOnSnake() {
        return this.snake.some(segment => segment.x === this.apple.x && segment.y === this.apple.y);
    }
    
    // Check if position is valid for snake
    isValidSnakeArea() {
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            if (segment.x < 0 || segment.y < 0) {
                return false;
            }
            if (i === this.snake.length - 1) {
                // Check head boundaries
                if ((segment.direction === DIRECTIONS.LEFT && segment.x === 0) ||
                    (segment.direction === DIRECTIONS.RIGHT && segment.x === this.width - this.cellSize) ||
                    (segment.direction === DIRECTIONS.TOP && segment.y === 0) ||
                    (segment.direction === DIRECTIONS.BOTTOM && segment.y === this.height - this.cellSize)) {
                    return false;
                }
            }
        }
        return true;
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
        const keyCode = e.keyCode;
        
        // Prevent default for arrow keys and WASD
        if ([37, 38, 39, 40, 65, 87, 83, 68].indexOf(keyCode) >= 0) {
            if (e.preventDefault) {
                e.preventDefault();
            }
        }
        
        switch (keyCode) {
            case 37: // Left
            case 65: // A
                if (this.state === GAME_STATE.START) {
                    if (!this.isOppositeDirection(DIRECTIONS.LEFT)) {
                        this.nextDirection = DIRECTIONS.LEFT;
                    }
                } else if (this.state === GAME_STATE.INIT) {
                    this.startGame();
                }
                break;
            case 38: // Up
            case 87: // W
                if (this.state === GAME_STATE.START) {
                    if (!this.isOppositeDirection(DIRECTIONS.TOP)) {
                        this.nextDirection = DIRECTIONS.TOP;
                    }
                } else if (this.state === GAME_STATE.INIT) {
                    this.startGame();
                }
                break;
            case 39: // Right
            case 68: // D
                if (this.state === GAME_STATE.START) {
                    if (!this.isOppositeDirection(DIRECTIONS.RIGHT)) {
                        this.nextDirection = DIRECTIONS.RIGHT;
                    }
                } else if (this.state === GAME_STATE.INIT) {
                    this.startGame();
                }
                break;
            case 40: // Down
            case 83: // S
                if (this.state === GAME_STATE.START) {
                    if (!this.isOppositeDirection(DIRECTIONS.BOTTOM)) {
                        this.nextDirection = DIRECTIONS.BOTTOM;
                    }
                } else if (this.state === GAME_STATE.INIT) {
                    this.startGame();
                }
                break;
            case 32: // Space
                if (e.preventDefault) {
                    e.preventDefault();
                }
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
            case 13: // Enter
                if (e.preventDefault) {
                    e.preventDefault();
                }
                if (this.state === GAME_STATE.GAME_OVER) {
                    this.restart();
                }
                break;
        }
    }
    
    // Check if direction is opposite to current
    isOppositeDirection(newDirection) {
        const opposites = {
            [DIRECTIONS.LEFT]: DIRECTIONS.RIGHT,
            [DIRECTIONS.RIGHT]: DIRECTIONS.LEFT,
            [DIRECTIONS.TOP]: DIRECTIONS.BOTTOM,
            [DIRECTIONS.BOTTOM]: DIRECTIONS.TOP
        };
        return opposites[this.direction] === newDirection;
    }
    
    // Start game
    startGame() {
        // Hide footer if exists
        const footer = document.getElementById('footer');
        if (footer) {
            footer.style.display = 'none';
        }
        
        this.state = GAME_STATE.START;
        this.lastMoveTime = performance.now();
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
        this.lastMoveTime = performance.now();
    }
    
    // Show pause overlay
    showPauseOverlay() {
        // Remove existing pause overlay
        const existingPause = document.getElementById('pause');
        if (existingPause) {
            existingPause.remove();
        }
        
        // Create pause overlay
        const pauseDiv = document.createElement('div');
        pauseDiv.id = 'pause';
        pauseDiv.className = 'pause';
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
        
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.continueGame();
            });
        }
        
        this.gameArea.appendChild(pauseDiv);
    }
    
    // Hide pause overlay
    hidePauseOverlay() {
        const pause = document.getElementById('pause');
        if (pause) {
            pause.remove();
        }
    }
    
    // Game over
    gameOver() {
        this.state = GAME_STATE.GAME_OVER;
        this.showGameOverOverlay();
    }
    
    // Show game over overlay
    showGameOverOverlay() {
        // Remove existing game over overlay
        const existingGameOver = document.getElementById('gameover');
        if (existingGameOver) {
            existingGameOver.remove();
        }
        
        // Create game over overlay (matching number-snake format)
        const gameOverDiv = document.createElement('div');
        gameOverDiv.id = 'gameover';
        gameOverDiv.className = 'gameover';
        gameOverDiv.style.display = 'block';
        
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
        
        // Set dimensions to match game area
        if (this.gameArea) {
            gameOverDiv.style.width = this.gameArea.clientWidth + 'px';
            gameOverDiv.style.height = this.gameArea.clientHeight + 'px';
        }
        
        // Add event listener to the restart button
        restartBtn.addEventListener('click', () => {
            this.restart();
        });
        
        // Add to gamebox to cover game area and header
        const gamebox = document.getElementById('gamebox');
        if (gamebox) {
            gamebox.appendChild(gameOverDiv);
        }
    }
    
    // Restart game
    restart() {
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        // Remove overlays
        const gameOver = document.getElementById('gameover');
        if (gameOver) {
            gameOver.remove();
        }
        this.hidePauseOverlay();
        
        // Reset game state
        this.score = 0;
        this.delay = INITIAL_DELAY;
        this.direction = DIRECTIONS.RIGHT;
        this.nextDirection = DIRECTIONS.RIGHT;
        
        // Update score display directly (don't call updateScore() which adds points)
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
        
        // Recalculate game area dimensions with new cell size
        this.setupGameArea();
        
        // Clear canvas
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
        
        // Reinitialize snake and apple
        this.initSnake();
        this.initApple();
        
        // Reset to INIT state (matching original: requires key press to start)
        this.state = GAME_STATE.INIT;
        this.lastMoveTime = performance.now();
    }
    
    // Game loop using requestAnimationFrame
    gameLoop() {
        const currentTime = performance.now();
        
        if (this.state === GAME_STATE.START) {
            // Check if it's time to move
            if (currentTime - this.lastMoveTime >= this.delay) {
                this.move();
                this.lastMoveTime = currentTime;
            }
        }
        
        // Always draw (even when paused)
        this.draw();
        
        this.animationFrame = requestAnimationFrame(() => this.gameLoop());
    }
    
    // Move snake (matching original logic exactly: move first, then update directions)
    move() {
        // Update head direction first
        this.direction = this.nextDirection;
        const head = this.snake[this.snake.length - 1];
        head.direction = this.direction;
        
        // Move all segments first (using their current directions)
        for (let i = 0; i < this.snake.length; i++) {
            this.snake[i].move();
        }
        
        // Then update directions (matching original: each segment uses next segment's direction after moving)
        for (let i = 0; i < this.snake.length - 1; i++) {
            // Each segment (except head) uses the direction of the next segment
            this.snake[i].direction = this.snake[i + 1].direction;
        }
        
        // Check game over (head is last element)
        if (this.checkGameOver()) {
            this.gameOver();
            return;
        }
        
        // Check if apple is eaten (head is last element)
        if (head.x === this.apple.x && head.y === this.apple.y) {
            this.eatApple();
        }
    }
    
    // Check game over
    checkGameOver() {
        const head = this.snake[this.snake.length - 1];
        
        // Check boundaries
        if (head.x < 0 || head.x >= this.width || head.y < 0 || head.y >= this.height) {
            return true;
        }
        
        // Check collision with body (excluding head and tail)
        for (let i = 0; i < this.snake.length - 2; i++) {
            if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
                return true;
            }
        }
        
        return false;
    }
    
    // Eat apple
    eatApple() {
        // Add new segment
        const tail = this.snake[0];
        const newSegment = new SnakeSegment(tail.x, tail.y, tail.direction, this.cellSize);
        
        // Move tail back to create new segment
        switch (tail.direction) {
            case DIRECTIONS.LEFT:
                newSegment.x += this.cellSize;
                break;
            case DIRECTIONS.RIGHT:
                newSegment.x -= this.cellSize;
                break;
            case DIRECTIONS.TOP:
                newSegment.y += this.cellSize;
                break;
            case DIRECTIONS.BOTTOM:
                newSegment.y -= this.cellSize;
                break;
        }
        
        this.snake.unshift(newSegment);
        
        // Generate new apple
        this.generateApple();
        while (this.isAppleOnSnake()) {
            this.generateApple();
        }
        
        // Update score
        this.updateScore();
        
        // Update delay (speed)
        this.updateDelay();
    }
    
    // Update score
    updateScore() {
        // Calculate score increment based on current score
        let points = SCORE_INCREMENT_BASE;
        for (let i = SCORE_THRESHOLDS.length - 1; i >= 0; i--) {
            if (this.score >= SCORE_THRESHOLDS[i].score) {
                points = SCORE_THRESHOLDS[i].points;
                break;
            }
        }
        
        this.score += points;
        
        // Update score display
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            this.updateHighScore();
        }
    }
    
    // Save high score to chrome.storage.local
    saveHighScore() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ snake_hs: this.highScore }, () => {
                    if (chrome.runtime.lastError) {
                        // Failed to save high score
                    }
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                localStorage.setItem('snake_hs', this.highScore);
            }
        } catch (e) {
            // Failed to save high score
        }
    }
    
    // Update high score display
    updateHighScore() {
        const highScoreElement = document.getElementById('highScore');
        if (highScoreElement) {
            highScoreElement.textContent = this.highScore;
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
    
    // Draw game
    draw() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw apple
        this.drawApple();
        
        // Draw snake
        this.drawSnake();
        
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
    
    // Draw apple
    drawApple() {
        if (!this.ctx) return;
        
        // Draw apple as red circle (matching original style)
        this.ctx.fillStyle = '#ff0000';
        this.ctx.beginPath();
        this.ctx.arc(
            this.apple.x + this.cellSize / 2,
            this.apple.y + this.cellSize / 2,
            this.cellSize / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }
    
    // Draw snake
    drawSnake() {
        if (!this.ctx) return;
        
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            
            if (i === this.snake.length - 1) {
                // Draw head with image
                this.drawSnakeHead(segment);
            } else {
                // Draw body segment
                this.drawSnakeBody(segment);
            }
        }
    }
    
    // Draw snake head
    drawSnakeHead(segment) {
        if (!this.ctx) return;
        
        const headImage = this.headImages[segment.direction];
        if (headImage && headImage.complete && headImage.naturalWidth > 0) {
            // Image is loaded and valid, draw it
            this.ctx.drawImage(headImage, segment.x, segment.y, this.cellSize, this.cellSize);
        } else {
            // Image not loaded yet - don't draw anything
            return;
        }
    }
    
    // Draw snake body
    drawSnakeBody(segment) {
        if (!this.ctx) return;
        
        // Draw body as green square
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(segment.x, segment.y, this.cellSize, this.cellSize);
        
        // Add border for better visibility
        this.ctx.strokeStyle = '#008800';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(segment.x, segment.y, this.cellSize, this.cellSize);
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ClassicSnakeGame();
    });
} else {
    new ClassicSnakeGame();
}

