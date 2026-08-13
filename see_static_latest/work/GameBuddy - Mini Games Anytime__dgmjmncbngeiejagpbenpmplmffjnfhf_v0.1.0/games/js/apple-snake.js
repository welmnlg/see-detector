/*
 * Apple Snake Game - Alternative Implementation
 * Rewritten with different code structure and algorithms
 * Uses ES6 classes, native JavaScript, and different game loop
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
const CELL_SIZE = 25;
const GAME_SPEED = 100; // milliseconds
const SCORE_INCREMENT = 10;
const STORAGE_KEY = 'apple-snake_v2_hs';

// Direction constants
const DIRECTIONS = {
    LEFT: { dx: -CELL_SIZE, dy: 0, index: 0, name: 'left' },
    RIGHT: { dx: CELL_SIZE, dy: 0, index: 1, name: 'right' },
    UP: { dx: 0, dy: -CELL_SIZE, index: 2, name: 'up' },
    DOWN: { dx: 0, dy: CELL_SIZE, index: 3, name: 'down' }
};

// Game states
const GAME_STATE = {
    INIT: 'init',
    RUNNING: 'running',
    GAME_OVER: 'gameOver'
};

// Apple Snake Game Class
class AppleSnakeGame {
    constructor() {
        this.canvas = document.getElementById('canvas');
        if (!this.canvas) {
            return;
        }
        
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
        
        // Initialize directions with dynamic cellSize
        this.DIRECTIONS = {
            LEFT: { dx: -this.cellSize, dy: 0, index: 0, name: 'left' },
            RIGHT: { dx: this.cellSize, dy: 0, index: 1, name: 'right' },
            UP: { dx: 0, dy: -this.cellSize, index: 2, name: 'up' },
            DOWN: { dx: 0, dy: this.cellSize, index: 3, name: 'down' }
        };
        
        this.ctx = this.canvas.getContext('2d');
        
        // Update canvas size immediately with calculated dimensions
        this.setupUI();
        
        // Game state
        this.state = GAME_STATE.INIT;
        this.score = 0;
        this.highScore = 0;
        
        // Snake data structure - using array of positions (will be initialized with grid alignment)
        this.snake = [];
        this.currentDirection = this.DIRECTIONS.RIGHT;
        this.nextDirection = this.DIRECTIONS.RIGHT;
        
        // Food position (will be initialized with grid alignment)
        this.food = { x: 0, y: 0 };
        
        // Game loop
        this.gameLoopId = null;
        this.lastUpdateTime = 0;
        
        // Images
        this.images = {
            head: [],
            apple: null
        };
        this.imagesLoaded = 0;
        this.totalImages = 5;
        
        // Resize handler
        this.resizeHandler = null;
        
        // Hidden score element for external reading (content script can't access JS objects)
        this.scoreElement = document.createElement('span');
        this.scoreElement.id = 'score';
        this.scoreElement.style.display = 'none';
        this.scoreElement.textContent = '0';
        document.body.appendChild(this.scoreElement);
        
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
        
        // Update directions with new cellSize
        this.DIRECTIONS = {
            LEFT: { dx: -this.cellSize, dy: 0, index: 0, name: 'left' },
            RIGHT: { dx: this.cellSize, dy: 0, index: 1, name: 'right' },
            UP: { dx: 0, dy: -this.cellSize, index: 2, name: 'up' },
            DOWN: { dx: 0, dy: this.cellSize, index: 3, name: 'down' }
        };
        
        // Update UI with new sizes
        this.setupUI();
    }
    
    // Setup UI elements with adaptive sizes
    setupUI() {
        // Update canvas size (use calculated width and height that are multiples of cellSize)
        if (this.canvas) {
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        }
        
        // Update gamebox size if it exists (use calculated width)
        const gamebox = document.getElementById('gamebox');
        if (gamebox) {
            gamebox.style.width = `${this.width}px`;
        }
        
        // Update gameover size and text styles if it exists
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
    }
    
    // Initialize game
    init() {
        //if (window.innerWidth < 768) {
            //return;
        //}
        
        // Use setTimeout to ensure window size is accurate after DOM is fully loaded
        setTimeout(() => {
            // Update adaptive size based on current window size
            this.updateAdaptiveSize();
            
            // Initialize snake and food positions with grid alignment
            this.initPositions();
            
            this.loadHighScore();
            this.loadImages();
            this.setupEventListeners();
        }, 0);
    }
    
    // Initialize snake and food positions with grid alignment
    initPositions() {
        // Original positions: snake: { x: 225, y: 175 }, food: { x: 525, y: 175 }
        // Original: 225 = 9 * 25, 175 = 7 * 25, 525 = 21 * 25
        const originalCellSize = 25;
        const snakeGridX = Math.floor(225 / originalCellSize); // 9
        const snakeGridY = Math.floor(175 / originalCellSize); // 7
        const foodGridX = Math.floor(525 / originalCellSize); // 21
        const foodGridY = Math.floor(175 / originalCellSize); // 7
        
        this.snake = [{ x: snakeGridX * this.cellSize, y: snakeGridY * this.cellSize }];
        this.food = { x: foodGridX * this.cellSize, y: foodGridY * this.cellSize };
        this.currentDirection = this.DIRECTIONS.RIGHT;
        this.nextDirection = this.DIRECTIONS.RIGHT;
    }
    
    // Load high score from chrome.storage.local
    loadHighScore() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get([STORAGE_KEY], (result) => {
                    if (chrome.runtime.lastError) {
                        return;
                    }
                    
                    if (result[STORAGE_KEY] !== undefined && result[STORAGE_KEY] !== null) {
                        try {
                            this.highScore = parseInt(result[STORAGE_KEY], 10) || 0;
                        } catch (e) {
                            this.highScore = 0;
                        }
                    }
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved !== null) {
                    this.highScore = parseInt(saved, 10) || 0;
                }
            }
        } catch (e) {
            console.warn('Failed to load high score:', e);
        }
    }
    
    // Save high score to chrome.storage.local
    saveHighScore() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ [STORAGE_KEY]: this.highScore.toString() }, () => {
                    if (chrome.runtime.lastError) {
                        console.warn('Failed to save high score:', chrome.runtime.lastError);
                    }
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                localStorage.setItem(STORAGE_KEY, this.highScore.toString());
            }
        } catch (e) {
            console.warn('Failed to save high score:', e);
        }
    }
    
    // Load game images
    async loadImages() {
        const directions = ['left', 'right', 'up', 'down'];
        
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
        
        // Load head images for each direction
        for (let i = 0; i < 4; i++) {
            let resourceUrl = window.getGameResource(`images/apple-snake/head-${directions[i]}.png`);
            
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
                    // Last resort: log error but still try to use the relative path
                    console.error(`[AppleSnake] Cannot determine base URL for ${directions[i]}. resourceUrl:`, resourceUrl);
                }
            }
            
            this.images.head[i] = new Image();
            this.images.head[i].src = resourceUrl;
            this.images.head[i].onload = () => this.onImageLoad();
            this.images.head[i].onerror = () => {
                // Try to reload with parent's base URL if available
                if (window.parent && window.parent !== window) {
                    try {
                        const parentBase = window.parent.releasesBaseUrl || window.parent.__gameResourceBase;
                        if (parentBase && (parentBase.startsWith('chrome-extension://') ||
                                          parentBase.startsWith('http://') ||
                                          parentBase.startsWith('https://'))) {
                            const cleanPath = `images/apple-snake/head-${directions[i]}.png`;
                            this.images.head[i].src = parentBase + cleanPath;
                            window.__gameResourceBase = parentBase;
                            return; // Don't call onImageLoad yet, wait for retry
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
                        const cleanPath = `images/apple-snake/head-${directions[i]}.png`;
                        this.images.head[i].src = chromeBaseUrl + cleanPath;
                        window.__gameResourceBase = chromeBaseUrl;
                        return; // Don't call onImageLoad yet, wait for retry
                    }
                } catch (e) {
                    // chrome.runtime not available
                }
                
                console.error(`[AppleSnake] Failed to load head image: ${directions[i]}`, resourceUrl);
                this.onImageLoad();
            };
        }
        
        // Load apple image
        let appleUrl = window.getGameResource('images/apple-snake/apple.png');
        
        // Ensure the URL is absolute - use the baseUrl we already found
        if (!appleUrl.startsWith('http://') && !appleUrl.startsWith('https://') && 
            !appleUrl.startsWith('chrome-extension://') && !appleUrl.startsWith('data:') &&
            !appleUrl.startsWith('blob:')) {
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
                const cleanPath = appleUrl.replace(/^\.\.?\//, '').replace(/^\.\.?\//, '');
                appleUrl = finalBaseUrl + cleanPath;
                if (!window.__gameResourceBase || !window.__gameResourceBase.startsWith('chrome-extension://')) {
                    window.__gameResourceBase = finalBaseUrl;
                }
            } else {
                // Last resort: log error but still try to use the relative path
                console.error(`[AppleSnake] Cannot determine base URL for apple image. appleUrl:`, appleUrl);
            }
        }
        
        this.images.apple = new Image();
        this.images.apple.src = appleUrl;
        this.images.apple.onload = () => this.onImageLoad();
        this.images.apple.onerror = () => {
            // Try to reload with parent's base URL if available
            if (window.parent && window.parent !== window) {
                try {
                    const parentBase = window.parent.releasesBaseUrl || window.parent.__gameResourceBase;
                    if (parentBase && (parentBase.startsWith('chrome-extension://') ||
                                      parentBase.startsWith('http://') ||
                                      parentBase.startsWith('https://'))) {
                        this.images.apple.src = parentBase + 'images/apple-snake/apple.png';
                        window.__gameResourceBase = parentBase;
                        return; // Don't call onImageLoad yet, wait for retry
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
                        this.images.apple.src = chromeBaseUrl + 'images/apple-snake/apple.png';
                    }
                    window.__gameResourceBase = chromeBaseUrl;
                    return; // Don't call onImageLoad yet, wait for retry
                }
            } catch (e) {
                // chrome.runtime not available
            }
            
            console.error('[AppleSnake] Failed to load apple image', appleUrl);
            this.onImageLoad();
        };
    }
    
    // Handle image load
    onImageLoad() {
        this.imagesLoaded++;
        if (this.imagesLoaded >= this.totalImages) {
            this.startGameLoop();
        }
    }
    
    // Start game loop
    startGameLoop() {
        // Use requestAnimationFrame for smoother rendering
        const gameLoop = (currentTime) => {
            if (this.state === GAME_STATE.RUNNING) {
                // Update game at fixed intervals
                if (currentTime - this.lastUpdateTime >= GAME_SPEED) {
                    this.update();
                    this.lastUpdateTime = currentTime;
                }
            }
            
            // Always render
            this.render();
            
            this.gameLoopId = requestAnimationFrame(gameLoop);
        };
        
        this.lastUpdateTime = performance.now();
        this.gameLoopId = requestAnimationFrame(gameLoop);
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Add window resize listener
        this.setupResizeListener();
        
        // Touch controls (swipe gestures)
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!touchStartX || !touchStartY) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            const minSwipeDistance = 30;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        this.changeDirection(this.DIRECTIONS.RIGHT);
                    } else {
                        this.changeDirection(this.DIRECTIONS.LEFT);
                    }
                }
            } else {
                // Vertical swipe
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0) {
                        this.changeDirection(this.DIRECTIONS.DOWN);
                    } else {
                        this.changeDirection(this.DIRECTIONS.UP);
                    }
                }
            }
            
            touchStartX = 0;
            touchStartY = 0;
        });
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
    
    // Handle keyboard input
    handleKeyPress(event) {
        const keyMap = {
            'ArrowLeft': this.DIRECTIONS.LEFT,
            'ArrowRight': this.DIRECTIONS.RIGHT,
            'ArrowUp': this.DIRECTIONS.UP,
            'ArrowDown': this.DIRECTIONS.DOWN,
            'a': this.DIRECTIONS.LEFT,
            'A': this.DIRECTIONS.LEFT,
            'd': this.DIRECTIONS.RIGHT,
            'D': this.DIRECTIONS.RIGHT,
            'w': this.DIRECTIONS.UP,
            'W': this.DIRECTIONS.UP,
            's': this.DIRECTIONS.DOWN,
            'S': this.DIRECTIONS.DOWN,
            ' ': null // Space bar
        };
        
        const direction = keyMap[event.key];
        
        if (direction) {
            event.preventDefault();
            this.changeDirection(direction);
        } else if (event.key === ' ') {
            // Space bar to start
            event.preventDefault();
            if (this.state === GAME_STATE.INIT) {
                this.startGame();
            }
        }
        
        // Start game on first arrow key press
        if (direction && this.state === GAME_STATE.INIT) {
            this.startGame();
        }
    }
    
    // Change direction (with validation)
    changeDirection(newDirection) {
        // Prevent reversing into itself
        if (this.currentDirection.dx === -newDirection.dx && 
            this.currentDirection.dy === -newDirection.dy) {
            return;
        }
        
        this.nextDirection = newDirection;
    }
    
    // Start game
    startGame() {
        if (this.state === GAME_STATE.RUNNING) return;
        
        this.state = GAME_STATE.RUNNING;
        this.score = 0;
        if (this.scoreElement) this.scoreElement.textContent = '0';
        // Use grid-aligned initial positions
        this.initPositions();
        // Don't regenerate food - keep initial position
    }
    
    // Update game state
    update() {
        if (this.state !== GAME_STATE.RUNNING) return;
        
        // Update direction
        this.currentDirection = this.nextDirection;
        
        // Calculate new head position
        const head = this.snake[0];
        const newHead = {
            x: head.x + this.currentDirection.dx,
            y: head.y + this.currentDirection.dy
        };
        
        // Check wall collision
        if (this.checkWallCollision(newHead)) {
            this.gameOver();
            return;
        }
        
        // Check self collision
        if (this.checkSelfCollision(newHead)) {
            this.gameOver();
            return;
        }
        
        // Add new head
        this.snake.unshift(newHead);
        
        // Check food collision
        if (this.checkFoodCollision(newHead)) {
            this.eatFood();
        } else {
            // Remove tail
            this.snake.pop();
        }
    }
    
    // Check wall collision
    checkWallCollision(position) {
        return position.x < 0 || 
               position.x >= this.width || 
               position.y < 0 || 
               position.y >= this.height;
    }
    
    // Check self collision
    checkSelfCollision(position) {
        // Check if new head position overlaps with any body segment
        for (let i = 0; i < this.snake.length; i++) {
            if (this.snake[i].x === position.x && this.snake[i].y === position.y) {
                return true;
            }
        }
        return false;
    }
    
    // Check food collision
    checkFoodCollision(position) {
        return position.x === this.food.x && position.y === this.food.y;
    }
    
    // Eat food
    eatFood() {
        this.score += SCORE_INCREMENT;
        if (this.scoreElement) this.scoreElement.textContent = String(this.score);
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        
        // Generate new food
        this.generateFood();
    }
    
    // Generate food at random position
    generateFood() {
        // Calculate grid dimensions
        const gridCols = Math.floor(this.width / this.cellSize) - 2;
        const gridRows = Math.floor(this.height / this.cellSize) - 3;
        
        let newFood;
        let attempts = 0;
        const maxAttempts = 100;
        
        // Try to find a position not occupied by snake
        do {
            const col = Math.floor(Math.random() * gridCols) + 1;
            const row = Math.floor(Math.random() * gridRows) + 2;
            newFood = {
                x: col * this.cellSize,
                y: row * this.cellSize
            };
            attempts++;
        } while (this.isPositionOccupied(newFood) && attempts < maxAttempts);
        
        this.food = newFood;
    }
    
    // Check if position is occupied by snake
    isPositionOccupied(position) {
        for (let i = 0; i < this.snake.length; i++) {
            if (this.snake[i].x === position.x && this.snake[i].y === position.y) {
                return true;
            }
        }
        return false;
    }
    
    // Render game
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background (optional - can add grid or pattern)
        this.drawBackground();
        
        // Draw snake
        this.drawSnake();
        
        // Draw food
        this.drawFood();
        
        // Draw UI
        this.drawUI();
        
        // Draw game over overlay if needed
        if (this.state === GAME_STATE.GAME_OVER) {
            this.drawGameOver();
        }
    }
    
    // Draw background
    drawBackground() {
        // Optional: draw grid or pattern
        // For now, just clear with default background
    }
    
    // Draw snake
    drawSnake() {
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            
            if (i === 0) {
                // Draw head with image
                const headImage = this.images.head[this.currentDirection.index];
                if (headImage && headImage.complete) {
                    this.ctx.drawImage(headImage, segment.x, segment.y, this.cellSize, this.cellSize);
                } else {
                    // Fallback: draw rectangle if image not loaded
                    this.ctx.fillStyle = '#49e726';
                    this.ctx.fillRect(segment.x, segment.y, this.cellSize, this.cellSize);
                }
            } else {
                // Draw body segments
                this.ctx.fillStyle = '#49e726';
                this.ctx.fillRect(segment.x, segment.y, this.cellSize, this.cellSize);
            }
        }
    }
    
    // Draw food
    drawFood() {
        if (this.images.apple && this.images.apple.complete) {
            this.ctx.drawImage(this.images.apple, this.food.x, this.food.y, this.cellSize, this.cellSize);
        } else {
            // Fallback: draw circle if image not loaded
            this.ctx.fillStyle = '#ff0000';
            this.ctx.beginPath();
            this.ctx.arc(
                this.food.x + this.cellSize / 2,
                this.food.y + this.cellSize / 2,
                this.cellSize / 2 - 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }
    }
    
    // Draw UI (score, high score)
    drawUI() {
        // Draw score
        this.ctx.fillStyle = 'white';
        const scoreFontSize = Math.floor(20 * this.adaptive);
        this.ctx.font = `${scoreFontSize}px Arial`;
        this.ctx.fillText(`Score: ${this.score}`, 15 * this.adaptive, 30 * this.adaptive);
        
        // Draw high score
        this.ctx.fillStyle = 'grey';
        const highScoreFontSize = Math.floor(15 * this.adaptive);
        this.ctx.font = `${highScoreFontSize}px Arial`;
        this.ctx.fillText(`Highest Score: ${this.highScore}`, 600 * this.adaptive, 30 * this.adaptive);
        
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
    
    // Draw game over overlay
    drawGameOver() {
        // Game over overlay is handled by HTML/CSS
        // This method is here for potential canvas-based overlay
    }
    
    // Game over (matching number-snake format)
    gameOver() {
        if (this.state === GAME_STATE.GAME_OVER) return;
        
        this.state = GAME_STATE.GAME_OVER;
        
        // Create game over overlay
        const gamebox = document.getElementById('gamebox');
        if (gamebox && !document.getElementById('gameover')) {
            const overlay = document.createElement('div');
            overlay.id = 'gameover';
            overlay.className = 'gameover';
            overlay.style.display = 'block';
            overlay.style.width = `${this.width}px`;
            overlay.style.height = `${this.height}px`;
            
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
            
            overlay.appendChild(contentWrapper);
            gamebox.appendChild(overlay);
            
            // Add restart button event listener
            restartBtn.addEventListener('click', () => this.restart());
        }
    }
    
    // Restart game
    restart() {
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        // Remove game over overlay
        const overlay = document.getElementById('gameover');
        if (overlay) {
            overlay.remove();
        }
        
        // Reset game state
        this.state = GAME_STATE.INIT;
        this.score = 0;
        if (this.scoreElement) this.scoreElement.textContent = '0';
        
        // Initialize positions with grid alignment
        this.initPositions();
        
        // Clear canvas
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.game = new AppleSnakeGame();
    });
} else {
    window.game = new AppleSnakeGame();
}

