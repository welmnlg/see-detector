/*
 * Drag Maze Blocker Game - Version 2
 * Rewritten using ES6 classes and different code structure
 * Different code structure while maintaining same functionality
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
const MAX_LEVEL = 6;
const BLOCK_ROWS = 5;
const BG_MIN = 0;
const BG_MAX = 9;
const PADDLE_WIDTH = 10;
const PLAYER_SIZE = 20;
const EXIT_WIDTH = 15;
const EXIT_HEIGHT = 60;
const GAME_DEFAULT_WIDTH = 402;
const GAME_DEFAULT_HEIGHT = 490;
const PADDLE_POSITION_STEP = 50;
const PADDLE_COUNT_MULTIPLIER = 5;

// Paddle class
class Paddle {
    constructor(x, y, height, speed, direction, adaptive) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.speed = speed;
        this.direction = direction; // 1 for down, -1 for up
        this.adaptive = adaptive;
        this.element = null;
    }
    
    // Create DOM element
    createElement(gamebox) {
        this.element = document.createElement('div');
        this.element.className = 'paddle';
        this.element.style.position = 'absolute';
        this.element.style.width = `${PADDLE_WIDTH}px`;
        this.element.style.height = `${this.height}px`;
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.backgroundColor = '#f59e0b';
        this.element.style.borderRadius = '3px';
        this.element.style.boxShadow = '0 0 6px rgba(245, 158, 11, 0.4)';
        gamebox.appendChild(this.element);
    }
    
    // Update position
    update(gameHeight) {
        this.y += this.speed * this.direction;
        
        // Bounce at boundaries
        if (this.y <= 0) {
            this.y = 0;
            this.direction = 1;
        } else if (this.y + this.height >= gameHeight) {
            this.y = gameHeight - this.height;
            this.direction = -1;
        }
        
        // Update DOM element
        if (this.element) {
            this.element.style.top = `${this.y}px`;
        }
    }
    
    // Get bounding rectangle
    getBounds() {
        return {
            left: this.x,
            top: this.y,
            right: this.x + PADDLE_WIDTH,
            bottom: this.y + this.height
        };
    }
}

// Player class
class Player {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.element = null;
    }
    
    // Create DOM element
    createElement(gamebox) {
        this.element = document.getElementById('player');
        if (this.element) {
            this.updatePosition();
        }
    }
    
    // Update position
    updatePosition() {
        if (this.element) {
            this.element.style.left = `${this.x}px`;
            this.element.style.top = `${this.y}px`;
        }
    }
    
    // Get bounding rectangle
    getBounds() {
        return {
            left: this.x,
            top: this.y,
            right: this.x + this.size,
            bottom: this.y + this.size
        };
    }
}

// Exit class
class Exit {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.element = null;
    }
    
    // Create DOM element
    createElement(gamebox) {
        this.element = document.getElementById('exit');
        if (this.element) {
            this.updatePosition();
        }
    }
    
    // Update position
    updatePosition() {
        if (this.element) {
            this.element.style.left = `${this.x}px`;
            this.element.style.top = `${this.y}px`;
        }
    }
    
    // Get bounding rectangle
    getBounds() {
        return {
            left: this.x,
            top: this.y,
            right: this.x + this.width,
            bottom: this.y + this.height
        };
    }
}

// Block class for background blocks
class Block {
    constructor(x, y, width, height, bgIndex) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.bgIndex = bgIndex;
        this.element = null;
    }
    
    // Create DOM element
    createElement(container) {
        this.element = document.createElement('div');
        this.element.style.position = 'absolute';
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        
        // Get resource URL
        let resourceUrl = window.getGameResource('images/bg/' + this.bgIndex + '.png');
        
        // Ensure the URL is absolute - try multiple methods
        if (!resourceUrl.startsWith('http://') && !resourceUrl.startsWith('https://') && 
            !resourceUrl.startsWith('chrome-extension://') && !resourceUrl.startsWith('data:') &&
            !resourceUrl.startsWith('blob:')) {
            // getGameResource returned a relative path, try to construct absolute URL
            let baseUrl = null;
            
            // Method 1: Check if __gameResourceBase is already set
            if (window.__gameResourceBase && 
                (window.__gameResourceBase.startsWith('chrome-extension://') ||
                 window.__gameResourceBase.startsWith('http://') ||
                 window.__gameResourceBase.startsWith('https://'))) {
                baseUrl = window.__gameResourceBase;
            }
            
            // Method 2: Try to get from parent window
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
            
            // Method 3: Try to get from top window
            if (!baseUrl && window.top && window.top !== window) {
                try {
                    if (window.top.releasesBaseUrl) {
                        baseUrl = window.top.releasesBaseUrl;
                    } else if (window.top.__gameResourceBase) {
                        baseUrl = window.top.__gameResourceBase;
                    }
                } catch (e) {
                    // Cannot access top
                }
            }
            
            // Method 4: Try to extract from script src URLs
            if (!baseUrl) {
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
                    // Cannot access scripts
                }
            }
            
            // Method 5: Try to use chrome.runtime directly
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
            
            // Method 6: Try to extract from current location (if chrome-extension URL)
            if (!baseUrl) {
                try {
                    const currentUrl = window.location.href;
                    if (currentUrl.startsWith('chrome-extension://')) {
                        const urlObj = new URL(currentUrl);
                        const pathParts = urlObj.pathname.split('/').filter(p => p);
                        const gamesIndex = pathParts.indexOf('games');
                        if (gamesIndex >= 0) {
                            baseUrl = `${urlObj.origin}/${pathParts.slice(0, gamesIndex + 1).join('/')}/`;
                        } else {
                            // If 'games' not found, try to find it in any parent directory
                            // (no hardcoded path, just search for 'games' in path)
                            for (let j = pathParts.length - 1; j >= 0; j--) {
                                if (pathParts[j] === 'games') {
                                    baseUrl = `${urlObj.origin}/${pathParts.slice(0, j + 1).join('/')}/`;
                                    break;
                                }
                            }
                        }
                    }
                } catch (e) {
                    // URL parsing failed
                }
            }
            
            if (baseUrl && (baseUrl.startsWith('chrome-extension://') ||
                           baseUrl.startsWith('http://') ||
                           baseUrl.startsWith('https://'))) {
                const cleanPath = resourceUrl.replace(/^\.\.?\//, '');
                resourceUrl = baseUrl + cleanPath;
                // Cache it
                if (!window.__gameResourceBase || !window.__gameResourceBase.startsWith('chrome-extension://')) {
                    window.__gameResourceBase = baseUrl;
                }
            } else {
                // If still no base URL, continue anyway
            }
        }
        
        this.element.style.backgroundImage = `url('${resourceUrl}')`;
        container.appendChild(this.element);
        
        // Verify image loads - if it fails, try to reload with correct URL
        const img = new Image();
        img.onerror = () => {
            // Try to reload with parent's base URL if available
            if (window.parent && window.parent !== window) {
                try {
                    const parentBase = window.parent.releasesBaseUrl || window.parent.__gameResourceBase;
                    if (parentBase && (parentBase.startsWith('chrome-extension://') ||
                                       parentBase.startsWith('http://') ||
                                       parentBase.startsWith('https://'))) {
                        const cleanPath = 'images/bg/' + this.bgIndex + '.png';
                        const newUrl = parentBase + cleanPath;
                        this.element.style.backgroundImage = `url('${newUrl}')`;
                        window.__gameResourceBase = parentBase;
                    }
                } catch (e) {
                    // Cannot access parent
                }
            }
        };
        img.src = resourceUrl;
    }
}

// Drag Maze Blocker Game class
class DragMazeBlockerGame {
    constructor() {
        // Game state
        this.isGameActive = false;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragInitialX = 0;
        this.dragInitialY = 0;
        this.animationFrameId = null;
        this.paddleAnimationFrameId = null;
        
        // Level management
        this.currentLevel = 1;
        this.baseSpeed = 0;
        this.maxLevel = MAX_LEVEL;
        
        // Screen dimensions
        this.screenWidth = 0;
        this.screenHeight = 0;
        this.gameWidth = 0;
        this.gameHeight = 0;
        this.adaptive = 0.8;
        this.modSize = 0;
        
        // Block dimensions
        this.blockWidth = 60;
        this.blockHeight = 20;
        this.blockCols = 0;
        
        // Game elements
        this.gamebox = null;
        this.player = null;
        this.exit = null;
        this.paddles = [];
        this.paddlePositions = [];
        this.block1 = null;
        this.block2 = null;
        this.block1Bottom = 0; // block1 填充后的下边缘 Y 坐标
        this.block2Top = 0; // block2 填充后的上边缘 Y 坐标
        
        // UI elements
        this.gameOverlay = null;
        this.gameMessage = null;
        this.tryAgainBtn = null;
        this.nextLevelBtn = null;
        this.resetBtn = null;
        
        // Initialize
        this.init();
    }
    
    // Initialize game
    init() {
        // Check screen width
        if (window.innerWidth < 768) {
            return;
        }
        
        // Load level (which will call continueInit() after loading)
        // continueInit() will handle the rest of initialization
        this.loadLevel();
    }
    
    // Load level from chrome.storage.local or URL
    loadLevel() {
        // Check URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const level = urlParams.get('mlv');
        if (level !== null && Number.isInteger(Number(level))) {
            const newLevel = Number(level) + 1;
            this.currentLevel = newLevel;
            this.saveLevel();
            // Set base speed based on level
            this.baseSpeed = Math.min(this.currentLevel - 1, 5);
            return;
        }
        
        // Load from chrome.storage.local
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get(['drag-maze-blocker_level'], (result) => {
                    if (chrome.runtime.lastError) {
                        this.setDefaultLevel();
                        return;
                    }
                    
                    if (result['drag-maze-blocker_level'] !== undefined && result['drag-maze-blocker_level'] !== null) {
                        try {
                            this.currentLevel = typeof result['drag-maze-blocker_level'] === 'number' 
                                ? result['drag-maze-blocker_level'] 
                                : JSON.parse(result['drag-maze-blocker_level']);
                        } catch (e) {
                            this.setDefaultLevel();
                        }
                    } else {
                        this.setDefaultLevel();
                    }
                    
                    // Ensure level is within valid range
                    if (this.currentLevel < 1 || this.currentLevel > MAX_LEVEL) {
                        this.setDefaultLevel();
                    }
                    
                    // Set base speed based on level
                    this.baseSpeed = Math.min(this.currentLevel - 1, 5);
                    
                    // Continue initialization after level is loaded
                    this.continueInit();
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                const storageCurrentLevel = localStorage.getItem('drag-maze-blocker_level');
                if (storageCurrentLevel) {
                    try {
                        this.currentLevel = JSON.parse(storageCurrentLevel);
                    } catch (e) {
                        this.setDefaultLevel();
                    }
                } else {
                    this.setDefaultLevel();
                }
                
                // Ensure level is within valid range
                if (this.currentLevel < 1 || this.currentLevel > MAX_LEVEL) {
                    this.setDefaultLevel();
                }
                
                // Set base speed based on level
                this.baseSpeed = Math.min(this.currentLevel - 1, 5);
                
                // Continue initialization
                this.continueInit();
            }
        } catch (e) {
            this.setDefaultLevel();
            this.baseSpeed = Math.min(this.currentLevel - 1, 5);
            this.continueInit();
        }
    }
    
    // Set default level
    setDefaultLevel() {
        this.currentLevel = 1;
        this.saveLevel();
    }
    
    // Save level to chrome.storage.local
    saveLevel() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ 'drag-maze-blocker_level': this.currentLevel }, () => {
                    if (chrome.runtime.lastError) {
                        // Failed to save level
                    }
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                localStorage.setItem('drag-maze-blocker_level', JSON.stringify(this.currentLevel));
            }
        } catch (e) {
            // Failed to save level
        }
    }
    
    // Continue initialization after level is loaded
    continueInit() {
        // Calculate dimensions
        this.calculateDimensions();
        
        // Setup game area
        this.setupGameArea();
        
        // Create game elements
        this.createGameElements();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start game
        this.startGame();
    }
    
    // Update adaptive size based on current window size
    updateAdaptiveSize() {
        // Recalculate dimensions
        this.calculateDimensions();
        
        // Update game area with new sizes
        this.setupGameArea();
        
        // Update UI with new sizes
        this.setupUI();
    }
    
    // Calculate dimensions
    calculateDimensions() {
        this.screenWidth = window.innerWidth - 80;
        this.screenHeight = window.innerHeight - Math.max(100, Math.floor(window.innerHeight * 0.14));
        
        if (this.screenWidth && this.screenHeight) {
            this.modSize = (this.screenWidth < 800 || this.screenHeight < 600) ? 10 : 0;
            this.adaptive = Math.min(
                this.screenWidth / (GAME_DEFAULT_HEIGHT + this.modSize),
                this.screenHeight / (GAME_DEFAULT_HEIGHT + this.modSize)
            );
            this.blockWidth = 60 * this.adaptive;
            this.blockHeight = 20 * this.adaptive;
        } else {
            this.adaptive = 0.8;
            this.blockWidth = 60;
            this.blockHeight = 20;
        }
        
        // Match classic-maze gamebox height
        const classicCellH = Math.floor(30 * this.adaptive);
        const classicPadH = Math.floor(15 * this.adaptive);
        this.classicGameboxH = classicCellH * 14 + classicPadH * 2 + 2 + classicCellH;
        
        this.blockCols = Math.floor(this.classicGameboxH / 15) + 1;
    }
    
    // Setup game area
    setupGameArea() {
        this.gamebox = document.getElementById('gamebox');
        if (!this.gamebox) return;
        
        // Set gamebox size to match classic-maze height
        this.gamebox.style.width = `${this.classicGameboxH * 1.5}px`;
        this.gamebox.style.height = `${this.classicGameboxH}px`;
        
        // Get actual dimensions
        this.gameWidth = this.gamebox.offsetWidth;
        this.gameHeight = this.gamebox.offsetHeight;
        
        // Setup block heights
        const block1 = document.getElementById('block1');
        const block2 = document.getElementById('block2');
        if (block1) {
            block1.style.height = `${100 * this.adaptive}px`;
            this.block1Bottom = BLOCK_ROWS * this.blockHeight;
        }
        if (block2) {
            const block2Top = this.classicGameboxH - BLOCK_ROWS * this.blockHeight;
            block2.style.top = `${block2Top}px`;
            this.block2Top = block2Top;
        }
        
        // Calculate paddle positions
        this.paddlePositions = [];
        for (let i = 50; i <= this.classicGameboxH * 1.5 - 50; i += PADDLE_POSITION_STEP) {
            this.paddlePositions.push(i);
        }
    }
    
    // Create game elements
    createGameElements() {
        // Create player
        const playerElement = document.getElementById('player');
        if (playerElement) {
            this.player = new Player(0, this.gameHeight / 2 - PLAYER_SIZE / 2, PLAYER_SIZE);
            this.player.element = playerElement;
            this.player.updatePosition();
        }
        
        // Create exit
        const exitElement = document.getElementById('exit');
        if (exitElement) {
            this.exit = new Exit(
                this.gameWidth - EXIT_WIDTH,
                this.gameHeight / 2 - EXIT_HEIGHT / 2,
                EXIT_WIDTH,
                EXIT_HEIGHT
            );
            this.exit.element = exitElement;
            this.exit.updatePosition();
        }
        
        // Create background blocks
        this.createBlocks();
        
        // Create paddles
        this.createPaddles();
        
        // Setup UI elements
        this.setupUI();
    }
    
    // Create background blocks
    createBlocks() {
        const block1 = document.getElementById('block1');
        const block2 = document.getElementById('block2');
        
        if (block1) {
            this.createBlockGrid(block1);
        }
        if (block2) {
            this.createBlockGrid(block2);
        }
    }
    
    // Create block grid
    createBlockGrid(container) {
        // Clear existing blocks
        const existingBlocks = container.querySelectorAll('div');
        existingBlocks.forEach(block => block.remove());
        
        for (let i = 0; i < BLOCK_ROWS; i++) {
            for (let j = 0; j < this.blockCols; j++) {
                const bgIndex = Math.floor(Math.random() * (BG_MAX - BG_MIN + 1)) + BG_MIN;
                const block = new Block(
                    j * this.blockWidth,
                    i * this.blockHeight,
                    this.blockWidth,
                    this.blockHeight,
                    bgIndex
                );
                block.createElement(container);
            }
        }
    }
    
    // Create paddles
    createPaddles() {
        // Remove existing paddles
        this.paddles.forEach(paddle => {
            if (paddle.element) {
                paddle.element.remove();
            }
        });
        this.paddles = [];
        
        const paddleCount = this.paddlePositions.length * PADDLE_COUNT_MULTIPLIER;
        
        for (let i = 0; i < paddleCount; i++) {
            const height = Math.floor(Math.random() * 31 * this.adaptive) + 30 * this.adaptive;
            const xPos = this.paddlePositions[i % this.paddlePositions.length];
            const yPos = this.getRandomInt(0, this.gameHeight - height);
            const speed = (Math.random() * 0.8 * this.adaptive) + 0.8 * this.adaptive + this.baseSpeed * this.adaptive;
            const direction = Math.random() < 0.5 ? 1 : -1;
            
            const paddle = new Paddle(xPos, yPos, height, speed, direction, this.adaptive);
            paddle.createElement(this.gamebox);
            this.paddles.push(paddle);
        }
    }
    
    // Setup UI elements
    setupUI() {
        this.gameOverlay = document.getElementById('gameOverlay');
        this.gameMessage = document.getElementById('gameMessage');
        this.tryAgainBtn = document.getElementById('tryagainbtn');
        this.nextLevelBtn = document.getElementById('nextlevelbtn');
        this.resetBtn = document.getElementById('resetbtn');
        
        // Hide overlay initially
        if (this.gameOverlay) {
            this.gameOverlay.style.visibility = 'hidden';
        }
        
        // Hide next level button if at max level
        if (this.nextLevelBtn && this.currentLevel >= this.maxLevel) {
            this.nextLevelBtn.style.display = 'none';
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Player drag events
        if (this.player && this.player.element) {
            this.player.element.addEventListener('mousedown', (e) => {
                this.handleMouseDown(e);
            });
        }
        
        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
        
        document.addEventListener('mouseup', () => {
            this.handleMouseUp();
        });
        
        // Button events
        if (this.tryAgainBtn) {
            this.tryAgainBtn.addEventListener('click', () => {
                this.tryAgain();
            });
        }
        
        if (this.nextLevelBtn) {
            this.nextLevelBtn.addEventListener('click', () => {
                this.nextLevel();
            });
        }
        
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => {
                this.reset();
            });
        }
    }
    
    // Handle mouse down
    handleMouseDown(e) {
        if (!this.isGameActive) return;
        
        // Hide how-to hint on first interaction
        this.hideHowToHint();
        
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.dragInitialX = this.player.x;
        this.dragInitialY = this.player.y;
        e.preventDefault();
    }
    
    // Handle mouse move
    handleMouseMove(e) {
        if (this.isDragging && this.isGameActive) {
            e.preventDefault();
            if (!this.animationFrameId) {
                this.animationFrameId = requestAnimationFrame(() => {
                    this.updatePlayerPosition(e);
                    this.animationFrameId = null;
                });
            }
        }
    }
    
    // Handle mouse up
    handleMouseUp() {
        this.isDragging = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    // Update player position during drag
    updatePlayerPosition(e) {
        if (!this.isDragging || !this.isGameActive) return;
        
        const dx = e.clientX - this.dragStartX;
        const dy = e.clientY - this.dragStartY;
        let newX = this.dragInitialX + dx;
        let newY = this.dragInitialY + dy;
        
        // Constrain Y position: block1 填充后的下边缘到 block2 填充后的上边缘
        // block1 填充后的下边缘：BLOCK_ROWS * blockHeight（block1 从顶部开始，填充了 BLOCK_ROWS 行）
        // block2 填充后的上边缘：block2 的 top 位置（block2 填充了 BLOCK_ROWS 行，从 top 位置开始）
        // player 不能超出这两个边界（需要考虑 player 的高度）
        const minY = this.block1Bottom; // player 的顶部不能低于 block1 填充后的下边缘
        const maxY = this.block2Top - PLAYER_SIZE; // player 的底部不能高于 block2 填充后的上边缘
        
        if (newY < minY) {
            newY = minY;
        } else if (newY > maxY) {
            newY = maxY;
        }
        
        // Constrain X position
        if (newX >= 0 && newX <= this.gameWidth - PLAYER_SIZE) {
            this.player.x = newX;
        }
        this.player.y = newY;
        this.player.updatePosition();
        
        // Check collisions
        this.checkCollisions();
    }
    
    // Check collisions
    checkCollisions() {
        const playerBounds = this.player.getBounds();
        
        // Check collision with paddles
        for (const paddle of this.paddles) {
            const paddleBounds = paddle.getBounds();
            if (this.isColliding(playerBounds, paddleBounds)) {
                this.gameOver('Game Over! You hit a paddle.');
                return;
            }
        }
        
        // Check collision with exit
        const exitBounds = this.exit.getBounds();
        if (this.isColliding(playerBounds, exitBounds)) {
            this.gameWin();
        }
    }
    
    // Check if two rectangles are colliding
    isColliding(rect1, rect2) {
        return (
            rect1.left < rect2.right &&
            rect1.right > rect2.left &&
            rect1.top < rect2.bottom &&
            rect1.bottom > rect2.top
        );
    }
    
    // Move paddles
    movePaddles() {
        if (!this.isGameActive) return;
        
        for (const paddle of this.paddles) {
            paddle.update(this.gameHeight);
            
            // Check collision with player
            const playerBounds = this.player.getBounds();
            const paddleBounds = paddle.getBounds();
            if (this.isColliding(playerBounds, paddleBounds)) {
                this.gameOver('Game Over! You hit a paddle.');
                return;
            }
        }
        
        this.paddleAnimationFrameId = requestAnimationFrame(() => {
            this.movePaddles();
        });
    }
    
    // Start game
    startGame() {
        this.isGameActive = true;
        this.movePaddles();
        
        // Show how-to hint on first launch only
        if (!this.hintShown) {
            this.hintShown = true;
            this.showHowToHint();
        }
    }
    
    // Show how-to hint overlay
    showHowToHint() {
        if (this.howToHint) return;
        
        const ad = this.adaptive || 0.8;
        
        const hint = document.createElement('div');
        hint.id = 'howToHint';
        hint.style.cssText = `
            position: absolute;
            bottom: ${Math.floor(18 * ad)}px;
            left: 50%;
            transform: translateX(-50%) translateY(${Math.floor(8 * ad)}px);
            background: linear-gradient(135deg, rgba(15, 20, 35, 0.85), rgba(20, 28, 50, 0.8));
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-top-color: rgba(255, 255, 255, 0.2);
            border-radius: ${Math.floor(28 * ad)}px;
            padding: ${Math.floor(10 * ad)}px ${Math.floor(22 * ad)}px;
            display: flex;
            align-items: center;
            gap: ${Math.floor(10 * ad)}px;
            z-index: 100;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        `;
        
        const text = document.createElement('span');
        text.textContent = 'Drag the Red Dot to the Green Exit';
        text.style.cssText = `
            color: rgba(255, 255, 255, 0.92);
            font-size: ${Math.floor(13 * ad)}px;
            font-weight: 500;
            font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
            white-space: nowrap;
            letter-spacing: 0.3px;
            line-height: 1;
        `;
        
        hint.appendChild(text);
        
        if (this.gamebox) {
            this.gamebox.appendChild(hint);
        }
        this.howToHint = hint;
        
        // Entrance animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                hint.style.opacity = '1';
                hint.style.transform = 'translateX(-50%) translateY(0)';
            });
        });
    }
    
    // Hide how-to hint
    hideHowToHint() {
        if (this.howToHint) {
            this.howToHint.style.opacity = '0';
            setTimeout(() => {
                if (this.howToHint && this.howToHint.parentNode) {
                    this.howToHint.remove();
                }
                this.howToHint = null;
            }, 500);
        }
    }
    
    // Game over
    gameOver(message) {
        this.isGameActive = false;
        
        // Stop animations
        if (this.paddleAnimationFrameId) {
            cancelAnimationFrame(this.paddleAnimationFrameId);
            this.paddleAnimationFrameId = null;
        }
        
        // Show overlay
        if (this.gameMessage) {
            this.gameMessage.textContent = message || 'Game Over! You hit a paddle.';
        }
        if (this.gameOverlay) {
            this.gameOverlay.style.visibility = 'visible';
        }
    }
    
    // Game win
    gameWin() {
        this.isGameActive = false;
        
        // Stop animations
        if (this.paddleAnimationFrameId) {
            cancelAnimationFrame(this.paddleAnimationFrameId);
            this.paddleAnimationFrameId = null;
        }
        
        // Hide next level button if at max level
        if (this.nextLevelBtn && this.currentLevel >= this.maxLevel) {
            this.nextLevelBtn.style.display = 'none';
        }
        
        // Show overlay
        if (this.gameMessage) {
            this.gameMessage.textContent = 'Congratulations! You Win!';
        }
        if (this.gameOverlay) {
            this.gameOverlay.style.visibility = 'visible';
        }
    }
    
    // Try again (restart current level)
    tryAgain() {
        // Hide overlay
        if (this.gameOverlay) {
            this.gameOverlay.style.visibility = 'hidden';
        }
        
        // Reset game state (keep current level)
        this.restartGame();
    }
    
    // Next level
    nextLevel() {
        if (this.currentLevel < this.maxLevel) {
            // Update level
            const nextLevel = this.currentLevel + 1;
            this.currentLevel = nextLevel;
            this.saveLevel();
            this.baseSpeed = Math.min(this.currentLevel - 1, 5);
            
            // Hide next level button if reached max level
            if (this.nextLevelBtn && this.currentLevel >= this.maxLevel) {
                this.nextLevelBtn.style.display = 'none';
            }
            
            // Hide overlay
            if (this.gameOverlay) {
                this.gameOverlay.style.visibility = 'hidden';
            }
            
            // Restart game with new level
            this.restartGame();
        }
    }
    
    // Reset (restart at level 1)
    reset() {
        // Update level to 1
        this.currentLevel = 1;
        this.saveLevel();
        this.baseSpeed = 0;
        
        // Show next level button (since we're back to level 1)
        if (this.nextLevelBtn) {
            this.nextLevelBtn.style.display = 'block';
        }
        
        // Hide overlay
        if (this.gameOverlay) {
            this.gameOverlay.style.visibility = 'hidden';
        }
        
        // Restart game
        this.restartGame();
    }
    
    // Restart game (reinitialize without page reload)
    restartGame() {
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        // Stop all animations
        this.isGameActive = false;
        if (this.paddleAnimationFrameId) {
            cancelAnimationFrame(this.paddleAnimationFrameId);
            this.paddleAnimationFrameId = null;
        }
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Reset drag state
        this.isDragging = false;
        
        // Remove existing paddles
        this.paddles.forEach(paddle => {
            if (paddle.element) {
                paddle.element.remove();
            }
        });
        this.paddles = [];
        
        // Recreate game elements
        this.createPaddles();
        
        // Reset player position
        if (this.player) {
            this.player.x = 0;
            this.player.y = this.gameHeight / 2 - PLAYER_SIZE / 2;
            this.player.updatePosition();
        }
        
        // Start game
        this.startGame();
    }
    
    // Helper: Get random integer
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DragMazeBlockerGame();
    });
} else {
    new DragMazeBlockerGame();
}

