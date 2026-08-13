/*
 * Memory Card Game - Version 2
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
const STORAGE_KEY = 'memory-card_level';
const MIN_IMAGE_NAME = 1;
const MAX_IMAGE_NAME = 26;
const GAMEBOX_WIDTH_MAX = 700;
const GAMEBOX_HEIGHT_MAX = 490;  // Reference height for adaptive calculation
const GAMEBOX_HEIGHT_BASE = 440; // Original content height for gamebox sizing
const GRID_SPACING = 10;
const BORDER_PADDING = 4;
const MATCH_DELAY = 1000;

// Level configurations: [rows, cols]
const LEVEL_CONFIGS = [
    [4, 4], [4, 5], [4, 6], [5, 5], 
    [5, 6], [5, 7], [6, 6], [6, 7], [6, 8]
];

// Game states
const GAME_STATE = {
    INIT: 'init',
    PLAYING: 'playing',
    MATCHING: 'matching',
    GAME_OVER: 'gameOver'
};

// Memory Card Game class
class MemoryCardGame {
    constructor() {
        // Screen dimensions
        this.screenWidth = window.innerWidth - 80;
        this.screenHeight = window.innerHeight - Math.max(100, Math.floor(window.innerHeight * 0.14));
        //this.gameDefaultWidth = 700;
        //this.gameDefaultHeight = 440;

        // Game state
        this.state = GAME_STATE.INIT;
        this.currentLevel = 1;
        this.rows = 4;
        this.cols = 4;
        this.imageSize = 0;
        this.gameboxWidth = 0;
        this.gameboxHeight = 0;

        // Get level configuration
        const levelIndex = this.currentLevel - 1;
        if (levelIndex >= 0 && levelIndex < LEVEL_CONFIGS.length) {
            [this.rows, this.cols] = LEVEL_CONFIGS[levelIndex];
        } else {
            [this.rows, this.cols] = LEVEL_CONFIGS[0];
        }
        
        // Calculate number of image pairs needed
        this.totalPairs = Math.floor(this.rows * this.cols / 2);
        
        // Calculate image size based on available space (use scaled constants)
        //const availableWidth = GAMEBOX_WIDTH_MAX - BORDER_PADDING - (this.cols + 1) * GRID_SPACING;
        //const availableHeight = GAMEBOX_HEIGHT_BASE - BORDER_PADDING - (this.rows + 1) * GRID_SPACING;
        const availableWidth = GAMEBOX_WIDTH_MAX - this.cols * GRID_SPACING;
        const availableHeight = GAMEBOX_HEIGHT_BASE - this.rows * GRID_SPACING;
        
        const imageWidth = Math.floor(availableWidth / this.cols);
        const imageHeight = Math.floor(availableHeight / this.rows);
        
        // Use the smaller dimension to ensure images fit
        this.imageSizeDefault = Math.min(imageWidth, imageHeight);
        
        // Calculate actual gamebox dimensions
        //this.gameDefaultWidth = this.imageSizeDefault * this.cols + (this.cols + 1) * GRID_SPACING + BORDER_PADDING;
        //this.gameDefaultHeight = this.imageSizeDefault * this.rows + (this.rows + 1) * GRID_SPACING + BORDER_PADDING;
        this.gameDefaultWidth = this.imageSizeDefault * this.cols + this.cols * GRID_SPACING;
        this.gameDefaultHeight = this.imageSizeDefault * this.rows + this.rows * GRID_SPACING;
        
        // Calculate adaptive size using GAMEBOX_HEIGHT_MAX (490) as reference to match classic maze
        const modSize = (this.screenWidth < 800 || this.screenHeight < 600) ? 10 : 0;
        this.adaptive = Math.min(
            this.screenWidth / (this.gameDefaultWidth + modSize),
            this.screenHeight / (GAMEBOX_HEIGHT_MAX + modSize)
        ) || 0.8;
        
        // Scaled constants (use BASE for gamebox sizing)
        this.gameboxWidthMax = Math.floor(GAMEBOX_WIDTH_MAX * this.adaptive);
        this.gameboxHeightMax = Math.floor(GAMEBOX_HEIGHT_BASE * this.adaptive);
        this.gridSpacing = Math.floor(GRID_SPACING * this.adaptive);
        this.borderPadding = Math.floor(BORDER_PADDING * this.adaptive);
        
        // Game data
        this.images = [];
        this.shuffledImages = [];
        this.cards = [];
        this.revealedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        
        // DOM elements
        this.gamebox = null;
        this.gameBoard = null;
        this.gameOverElement = null;
        this.tryAgainBtn = null;
        this.nextLevelBtn = null;
        this.resetBtn = null;
        
        // Initialize
        this.init();
    }
    
    // Update adaptive size based on current window size
    updateAdaptiveSize() {
        // Recalculate screen dimensions
        this.screenWidth = window.innerWidth - 80;
        this.screenHeight = window.innerHeight - Math.max(100, Math.floor(window.innerHeight * 0.14));

        // Get level configuration
        const levelIndex = this.currentLevel - 1;
        if (levelIndex >= 0 && levelIndex < LEVEL_CONFIGS.length) {
            [this.rows, this.cols] = LEVEL_CONFIGS[levelIndex];
        } else {
            [this.rows, this.cols] = LEVEL_CONFIGS[0];
        }

        // Calculate number of image pairs needed
        this.totalPairs = Math.floor(this.rows * this.cols / 2);
        
        // Calculate image size based on available space (use scaled constants)
        //const availableWidth = GAMEBOX_WIDTH_MAX - BORDER_PADDING - (this.cols + 1) * GRID_SPACING;
        //const availableHeight = GAMEBOX_HEIGHT_BASE - BORDER_PADDING - (this.rows + 1) * GRID_SPACING;
        const availableWidth = GAMEBOX_WIDTH_MAX - this.cols * GRID_SPACING;
        const availableHeight = GAMEBOX_HEIGHT_BASE - this.rows * GRID_SPACING;
        
        const imageWidth = Math.floor(availableWidth / this.cols);
        const imageHeight = Math.floor(availableHeight / this.rows);
        
        // Use the smaller dimension to ensure images fit
        this.imageSizeDefault = Math.min(imageWidth, imageHeight);
        
        // Calculate actual gamebox dimensions
        //this.gameDefaultWidth = this.imageSizeDefault * this.cols + (this.cols + 1) * GRID_SPACING + BORDER_PADDING;
        //this.gameDefaultHeight = this.imageSizeDefault * this.rows + (this.rows + 1) * GRID_SPACING + BORDER_PADDING;
        this.gameDefaultWidth = this.imageSizeDefault * this.cols + this.cols * GRID_SPACING;
        this.gameDefaultHeight = this.imageSizeDefault * this.rows + this.rows * GRID_SPACING;
        
        // Recalculate adaptive size using GAMEBOX_HEIGHT_MAX (490) as reference
        const modSize = (this.screenWidth < 800 || this.screenHeight < 600) ? 10 : 0;
        this.adaptive = Math.min(
            this.screenWidth / (this.gameDefaultWidth + modSize),
            this.screenHeight / (GAMEBOX_HEIGHT_MAX + modSize)
        ) || 0.8;
        
        // Recalculate scaled constants (use BASE for gamebox sizing)
        this.gameboxWidthMax = Math.floor(GAMEBOX_WIDTH_MAX * this.adaptive);
        this.gameboxHeightMax = Math.floor(GAMEBOX_HEIGHT_BASE * this.adaptive);
        this.gridSpacing = Math.floor(GRID_SPACING * this.adaptive);
        this.borderPadding = Math.floor(BORDER_PADDING * this.adaptive);
    }
    
    // Initialize game
    init() {
        //if (window.innerWidth < 768) {
            //return;
        //}
        
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        // Setup DOM elements
        this.setupDOM();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load level (may be async for chrome.storage)
        // startGame() will be called after level is loaded (in loadLevel() or its callback)
        this.loadLevel();
    }
    
    // Load level from chrome.storage.local or URL
    loadLevel() {
        // Check URL parameter first
        const urlParams = new URLSearchParams(window.location.search);
        const level = urlParams.get('mlv');
        if (level !== null && Number.isInteger(Number(level))) {
            const newLevel = Number(level) + 1;
            this.currentLevel = newLevel;
            this.saveLevel();
            // Ensure level is within valid range
            if (this.currentLevel < 1 || this.currentLevel > LEVEL_CONFIGS.length) {
                this.setDefaultLevel();
            }
            // Calculate dimensions and start game
            this.calculateDimensions();
            if (this.state === GAME_STATE.INIT) {
                this.startGame();
            }
            return;
        }
        
        // Load from chrome.storage.local
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get([STORAGE_KEY], (result) => {
                    if (chrome.runtime.lastError) {
                        this.setDefaultLevel();
                    } else if (result[STORAGE_KEY] !== undefined && result[STORAGE_KEY] !== null) {
                        try {
                            this.currentLevel = typeof result[STORAGE_KEY] === 'number' 
                                ? result[STORAGE_KEY] 
                                : JSON.parse(result[STORAGE_KEY]);
                        } catch (e) {
                            this.setDefaultLevel();
                        }
                    } else {
                        this.setDefaultLevel();
                    }
                    
                    // Ensure level is within valid range
                    if (this.currentLevel < 1 || this.currentLevel > LEVEL_CONFIGS.length) {
                        this.setDefaultLevel();
                    }
                    
                    // Recalculate dimensions and start game if in INIT state
                    this.calculateDimensions();
                    if (this.state === GAME_STATE.INIT) {
                        this.startGame();
                    }
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                const storedLevel = localStorage.getItem(STORAGE_KEY);
                if (storedLevel) {
                    try {
                        this.currentLevel = JSON.parse(storedLevel);
                    } catch (e) {
                        this.setDefaultLevel();
                    }
                } else {
                    this.setDefaultLevel();
                }
                
                // Ensure level is within valid range
                if (this.currentLevel < 1 || this.currentLevel > LEVEL_CONFIGS.length) {
                    this.setDefaultLevel();
                }
                
                // For synchronous localStorage path, calculate dimensions and start game
                this.calculateDimensions();
                if (this.state === GAME_STATE.INIT) {
                    this.startGame();
                }
            }
        } catch (e) {
            this.setDefaultLevel();
            // Even on error, try to start game with default level
            this.calculateDimensions();
            if (this.state === GAME_STATE.INIT) {
                this.startGame();
            }
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
                chrome.storage.local.set({ [STORAGE_KEY]: this.currentLevel }, () => {
                    if (chrome.runtime.lastError) {
                        // Failed to save level
                    }
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentLevel));
            }
        } catch (e) {
            // Failed to save level
        }
    }
    
    // Setup DOM elements
    setupDOM() {
        this.gamebox = document.getElementById('gamebox');
        this.gameBoard = document.getElementById('game-board');
        this.gameOverElement = document.getElementById('gameover');
        this.tryAgainBtn = document.getElementById('tryagainbtn');
        this.nextLevelBtn = document.getElementById('nextlevelbtn');
        this.resetBtn = document.getElementById('resetbtn');
        
        // Hide game over overlay initially
        if (this.gameOverElement) {
            this.gameOverElement.style.display = 'none';
        }
    }
    
    // Calculate game dimensions
    calculateDimensions() {
        // Get level configuration
        const levelIndex = this.currentLevel - 1;
        if (levelIndex >= 0 && levelIndex < LEVEL_CONFIGS.length) {
            [this.rows, this.cols] = LEVEL_CONFIGS[levelIndex];
        } else {
            [this.rows, this.cols] = LEVEL_CONFIGS[0];
        }
        
        // Calculate number of image pairs needed
        this.totalPairs = Math.floor(this.rows * this.cols / 2);
        
        // Calculate image size based on available space (use scaled constants)
        //const availableWidth = this.gameboxWidthMax - this.borderPadding - (this.cols + 1) * this.gridSpacing;
        //const availableHeight = this.gameboxHeightMax - this.borderPadding - (this.rows + 1) * this.gridSpacing;
        const availableWidth = this.gameboxWidthMax - this.cols * this.gridSpacing;
        const availableHeight = this.gameboxHeightMax - this.rows * this.gridSpacing;
        
        const imageWidth = Math.floor(availableWidth / this.cols);
        const imageHeight = Math.floor(availableHeight / this.rows);
        
        // Use the smaller dimension to ensure images fit
        this.imageSize = Math.min(imageWidth, imageHeight);
        
        // Calculate actual gamebox dimensions
        //this.gameboxWidth = this.imageSize * this.cols + (this.cols + 1) * this.gridSpacing + this.borderPadding;
        //this.gameboxHeight = this.imageSize * this.rows + (this.rows + 1) * this.gridSpacing + this.borderPadding;
        this.gameboxWidth = this.imageSize * this.cols + this.cols * this.gridSpacing;
        this.gameboxHeight = this.imageSize * this.rows + this.rows * this.gridSpacing;
    }
    
    // Generate random unique image numbers
    generateRandomImages() {
        const imageNumbers = new Set();
        while (imageNumbers.size < this.totalPairs) {
            const num = Math.floor(Math.random() * (MAX_IMAGE_NAME - MIN_IMAGE_NAME + 1)) + MIN_IMAGE_NAME;
            imageNumbers.add(num);
        }
        
        // Create image array with pairs
        this.images = [];
        const imageArray = Array.from(imageNumbers);
        for (let i = 0; i < imageArray.length; i++) {
            const imageName = `${imageArray[i]}.png`;
            this.images.push(imageName);
            this.images.push(imageName); // Add pair
        }
    }
    
    // Shuffle array using Fisher-Yates algorithm
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // Setup event listeners
    setupEventListeners() {
        if (this.tryAgainBtn) {
            this.tryAgainBtn.addEventListener('click', () => this.tryAgain());
        }
        
        if (this.nextLevelBtn) {
            this.nextLevelBtn.addEventListener('click', () => this.nextLevel());
        }
        
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.reset());
        }
    }
    
    // Start game
    startGame() {
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        // Recalculate dimensions with new adaptive size
        this.calculateDimensions();
        
        // Reset game state
        this.state = GAME_STATE.PLAYING;
        this.matchedPairs = 0;
        this.revealedCards = [];
        this.cards = [];
        
        // Clear game board
        if (this.gameBoard) {
            // Clear content using removeChild instead of innerHTML
            while (this.gameBoard.firstChild) {
                this.gameBoard.removeChild(this.gameBoard.firstChild);
            }
        }
        
        // Set gamebox dimensions (box-sizing: border-box, so add padding)
        const boxPadding = Math.floor(5 * this.adaptive);
        if (this.gamebox) {
            // Match classic-maze gamebox height
            const classicCellH = Math.floor(30 * this.adaptive);
            const classicPadH = Math.floor(15 * this.adaptive);
            const classicGameboxH = classicCellH * 14 + classicPadH * 2 + 2 + classicCellH;
            this.gamebox.style.width = `${this.gameboxWidth + boxPadding * 2}px`;
            this.gamebox.style.height = `${Math.max(this.gameboxHeight + boxPadding * 2, classicGameboxH)}px`;
            this.gamebox.style.padding = `${boxPadding}px`;
        }
        
        // Set grid layout on game board
        if (this.gameBoard) {
            const gap = Math.floor(this.gridSpacing / 2);
            this.gameBoard.style.gridTemplateColumns = `repeat(${this.cols}, ${this.imageSize}px)`;
            this.gameBoard.style.gridTemplateRows = `repeat(${this.rows}, ${this.imageSize}px)`;
            this.gameBoard.style.gap = `${gap * 2}px`;
        }
        
        // Update game over overlay styles
        this.updateGameOverStyles();
        
        // Generate and shuffle images
        this.generateRandomImages();
        this.shuffledImages = this.shuffleArray(this.images);
        
        // Preload images to verify they can be loaded
        this.preloadImages().then(() => {
            // Create cards after images are verified
            this.createCards();
        }).catch((error) => {
            // Create cards anyway
            this.createCards();
        });
        
        // Show how-to hint on first launch only
        if (!this.hintShown) {
            this.hintShown = true;
            this.showHowToHint();
        }
    }
    
    // Show how-to hint
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
        text.textContent = 'Click Cards to Reveal \u2022 Match Identical Pairs';
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
        if (this.gamebox) this.gamebox.appendChild(hint);
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
                if (this.howToHint && this.howToHint.parentNode) this.howToHint.remove();
                this.howToHint = null;
            }, 500);
        }
    }
    
    // Preload images to verify they can be loaded
    async preloadImages() {
        // First, try to get base URL immediately
        let baseUrl = null;
        
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
                    // Try chrome.runtime.getURL first, then extract from script src
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
        
        // If we have a base URL, cache it
        if (baseUrl && (baseUrl.startsWith('chrome-extension://') ||
                       baseUrl.startsWith('http://') ||
                       baseUrl.startsWith('https://'))) {
            window.__gameResourceBase = baseUrl;
        } else {
            // Wait a bit for __gameResourceBase to be set
            let waitCount = 0;
            const maxWait = 10; // Wait up to 500ms (10 * 50ms)
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
        
        const imagePromises = [];
        const uniqueImages = [...new Set(this.shuffledImages)];
        
        for (const imageName of uniqueImages) {
            let imageUrl = window.getGameResource(`images/memory-card/${imageName}`);
            
            // Ensure the URL is absolute
            if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && 
                !imageUrl.startsWith('chrome-extension://') && !imageUrl.startsWith('data:') &&
                !imageUrl.startsWith('blob:')) {
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
                                // Try chrome.runtime.getURL or extract from script src
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
                    const cleanPath = imageUrl.replace(/^\.\.?\//, '').replace(/^\.\.?\//, '');
                    imageUrl = finalBaseUrl + cleanPath;
                    if (!window.__gameResourceBase || !window.__gameResourceBase.startsWith('chrome-extension://')) {
                        window.__gameResourceBase = finalBaseUrl;
                    }
                }
            }
            
            // Preload image
            const promise = new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    resolve(imageUrl);
                };
                img.onerror = () => {
                    // Try to reload with parent's base URL if available
                    if (window.parent && window.parent !== window) {
                        try {
                            const parentBase = window.parent.releasesBaseUrl || window.parent.__gameResourceBase;
                            if (parentBase && (parentBase.startsWith('chrome-extension://') ||
                                              parentBase.startsWith('http://') ||
                                              parentBase.startsWith('https://'))) {
                                const cleanPath = `images/memory-card/${imageName}`;
                                const retryUrl = parentBase + cleanPath;
                                img.src = retryUrl;
                                img.onload = () => {
                                    resolve(retryUrl);
                                };
                                img.onerror = () => {
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
                                            const finalUrl = chromeBaseUrl ? chromeBaseUrl + cleanPath : null;
                                            img.src = finalUrl;
                                            img.onload = () => {
                                                resolve(finalUrl);
                                            };
                                            img.onerror = () => {
                                                reject(new Error(`Failed to load image: ${imageName}`));
                                            };
                                            return;
                                        }
                                    } catch (e) {
                                        // chrome.runtime not available
                                    }
                                    reject(new Error(`Failed to load image: ${imageName}`));
                                };
                                return; // Don't reject yet, wait for retry
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
                            const cleanPath = `images/memory-card/${imageName}`;
                            const finalUrl = chromeBaseUrl + cleanPath;
                            img.src = finalUrl;
                            img.onload = () => {
                                resolve(finalUrl);
                            };
                            img.onerror = () => {
                                reject(new Error(`Failed to load image: ${imageName}`));
                            };
                            return; // Don't reject yet, wait for retry
                        }
                    } catch (e) {
                        // chrome.runtime not available
                    }
                    
                    reject(new Error(`Failed to load image: ${imageName}`));
                };
                img.src = imageUrl;
            });
            
            imagePromises.push(promise);
        }
        
        // Wait for all images to load (or fail)
        await Promise.allSettled(imagePromises);
    }
    
    // Create card elements
    createCards() {
        if (!this.gameBoard) return;
        
        for (let i = 0; i < this.shuffledImages.length; i++) {
            const card = this.createCard(i);
            this.gameBoard.appendChild(card);
            this.cards.push(card);
        }
    }
    
    // Create a single card element
    createCard(index) {
        const card = document.createElement('div');
        card.classList.add('memory-block');
        card.style.width = `${this.imageSize}px`;
        card.style.height = `${this.imageSize}px`;
        
        // Store card data
        card.dataset.index = index;
        let imageUrl = window.getGameResource(`images/memory-card/${this.shuffledImages[index]}`);
        
        // Ensure the URL is absolute
        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && 
            !imageUrl.startsWith('chrome-extension://') && !imageUrl.startsWith('data:') &&
            !imageUrl.startsWith('blob:')) {
            // getGameResource returned a relative path, construct absolute URL
            let baseUrl = null;
            
            // Try to get base URL from various sources
            if (window.__gameResourceBase && 
                (window.__gameResourceBase.startsWith('chrome-extension://') ||
                 window.__gameResourceBase.startsWith('http://') ||
                 window.__gameResourceBase.startsWith('https://'))) {
                baseUrl = window.__gameResourceBase;
            } else if (window.parent && window.parent !== window) {
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
            
            if (!baseUrl) {
                try {
                    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
                        // Try chrome.runtime.getURL first, then extract from script src
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
            
            if (baseUrl && (baseUrl.startsWith('chrome-extension://') ||
                           baseUrl.startsWith('http://') ||
                           baseUrl.startsWith('https://'))) {
                const cleanPath = imageUrl.replace(/^\.\.?\//, '').replace(/^\.\.?\//, '');
                imageUrl = baseUrl + cleanPath;
                if (!window.__gameResourceBase || !window.__gameResourceBase.startsWith('chrome-extension://')) {
                    window.__gameResourceBase = baseUrl;
                }
            }
        }
        
        card.dataset.image = imageUrl;
        card.dataset.revealed = 'false';
        card.dataset.matched = 'false';
        
        // Add click event
        card.addEventListener('click', () => this.handleCardClick(card));
        
        return card;
    }
    
    // Handle card click
    handleCardClick(card) {
        this.hideHowToHint();
        
        // Ignore if game is not playing or card is already revealed/matched
        if (this.state !== GAME_STATE.PLAYING) {
            return;
        }
        
        if (card.dataset.revealed === 'true' || card.dataset.matched === 'true') {
            return;
        }
        
        // Ignore if already have two cards revealed
        if (this.revealedCards.length >= 2) {
            return;
        }
        
        // Ignore if this card is already in revealed cards
        if (this.revealedCards.includes(card)) {
            return;
        }
        
        // Reveal card
        this.revealCard(card);
    }
    
    // Reveal a card
    revealCard(card) {
        let imagePath = card.dataset.image;
        
        // Ensure the URL is absolute (double-check)
        if (!imagePath.startsWith('http://') && !imagePath.startsWith('https://') && 
            !imagePath.startsWith('chrome-extension://') && !imagePath.startsWith('data:') &&
            !imagePath.startsWith('blob:')) {
            // Try to construct absolute URL again
            let baseUrl = null;
            
            if (window.__gameResourceBase && 
                (window.__gameResourceBase.startsWith('chrome-extension://') ||
                 window.__gameResourceBase.startsWith('http://') ||
                 window.__gameResourceBase.startsWith('https://'))) {
                baseUrl = window.__gameResourceBase;
            } else if (window.parent && window.parent !== window) {
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
            
            if (!baseUrl) {
                try {
                    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
                        // Try chrome.runtime.getURL first, then extract from script src
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
            
            if (baseUrl && (baseUrl.startsWith('chrome-extension://') ||
                           baseUrl.startsWith('http://') ||
                           baseUrl.startsWith('https://'))) {
                const cleanPath = imagePath.replace(/^\.\.?\//, '').replace(/^\.\.?\//, '');
                imagePath = baseUrl + cleanPath;
                card.dataset.image = imagePath; // Update stored URL
            }
        }
        
        // Preload image to verify it can be loaded
        const img = new Image();
        img.onload = () => {
            // Image loaded successfully, set background image
            card.style.backgroundImage = `url(${imagePath})`;
            card.style.backgroundRepeat = 'no-repeat';
            card.style.backgroundPosition = 'center center';
            card.style.backgroundSize = `${this.imageSize}px ${this.imageSize}px`;
        };
        img.onerror = () => {
            // Try to reload with parent's base URL if available
            if (window.parent && window.parent !== window) {
                try {
                    const parentBase = window.parent.releasesBaseUrl || window.parent.__gameResourceBase;
                    if (parentBase && (parentBase.startsWith('chrome-extension://') ||
                                      parentBase.startsWith('http://') ||
                                      parentBase.startsWith('https://'))) {
                        const cleanPath = `images/memory-card/${this.shuffledImages[parseInt(card.dataset.index)]}`;
                        const retryUrl = parentBase + cleanPath;
                        img.src = retryUrl;
                        card.dataset.image = retryUrl;
                        // Set up new handlers for retry
                        img.onload = () => {
                            card.style.backgroundImage = `url(${retryUrl})`;
                            card.style.backgroundRepeat = 'no-repeat';
                            card.style.backgroundPosition = 'center center';
                            card.style.backgroundSize = `${this.imageSize}px ${this.imageSize}px`;
                        };
                        img.onerror = () => {
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
                                    const finalUrl = chromeBaseUrl + cleanPath;
                                    card.style.backgroundImage = `url(${finalUrl})`;
                                    card.style.backgroundRepeat = 'no-repeat';
                                    card.style.backgroundPosition = 'center center';
                                    card.style.backgroundSize = `${this.imageSize}px ${this.imageSize}px`;
                                    card.dataset.image = finalUrl;
                                }
                            } catch (e) {
                                // chrome.runtime not available
                            }
                        };
                        return; // Don't continue with original error handling
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
                    const cleanPath = `images/memory-card/${this.shuffledImages[parseInt(card.dataset.index)]}`;
                    const finalUrl = chromeBaseUrl + cleanPath;
                    card.style.backgroundImage = `url(${finalUrl})`;
                    card.style.backgroundRepeat = 'no-repeat';
                    card.style.backgroundPosition = 'center center';
                    card.style.backgroundSize = `${this.imageSize}px ${this.imageSize}px`;
                    card.dataset.image = finalUrl;
                }
            } catch (e) {
                // chrome.runtime not available
            }
        };
        img.src = imagePath;
        
        card.dataset.revealed = 'true';
        this.revealedCards.push(card);
        
        // Check for match if two cards are revealed
        if (this.revealedCards.length === 2) {
            this.state = GAME_STATE.MATCHING;
            setTimeout(() => this.checkMatch(), MATCH_DELAY);
        }
    }
    
    // Check if two revealed cards match
    checkMatch() {
        if (this.revealedCards.length !== 2) {
            this.resetRevealedCards();
            return;
        }
        
        const [card1, card2] = this.revealedCards;
        
        if (card1.dataset.image === card2.dataset.image) {
            // Match found
            this.handleMatch(card1, card2);
        } else {
            // No match - hide cards
            this.hideCards(card1, card2);
        }
        
        // Reset revealed cards
        this.resetRevealedCards();
        
        // Check if game is complete
        if (this.matchedPairs === this.totalPairs) {
            this.gameComplete();
        }
    }
    
    // Handle matched cards
    handleMatch(card1, card2) {
        card1.dataset.matched = 'true';
        card2.dataset.matched = 'true';
        
        // Hide matched cards
        card1.style.visibility = 'hidden';
        card2.style.visibility = 'hidden';
        
        this.matchedPairs++;
    }
    
    // Hide unmatched cards
    hideCards(card1, card2) {
        card1.style.backgroundImage = '';
        card2.style.backgroundImage = '';
    }
    
    // Reset revealed cards
    resetRevealedCards() {
        for (const card of this.revealedCards) {
            if (card.dataset.matched !== 'true') {
                card.dataset.revealed = 'false';
            }
        }
        this.revealedCards = [];
        this.state = GAME_STATE.PLAYING;
    }
    
    // Update game over overlay styles
    updateGameOverStyles() {
        if (this.gameOverElement) {
            const goClassicCellH = Math.floor(30 * this.adaptive);
            const goClassicPadH = Math.floor(15 * this.adaptive);
            const goClassicGameboxH = goClassicCellH * 14 + goClassicPadH * 2 + 2 + goClassicCellH;
            this.gameOverElement.style.width = `${this.gameboxWidth}px`;
            this.gameOverElement.style.height = `${Math.max(this.gameboxHeight, goClassicGameboxH)}px`;
            
            // Update game over text
            const gameOverP = this.gameOverElement.querySelector('p');
            if (gameOverP) {
                gameOverP.style.fontSize = `${Math.floor(28 * this.adaptive)}px`;
                gameOverP.style.paddingTop = `${Math.floor(120 * this.adaptive)}px`;
            }
            
            // Update buttons
            if (this.tryAgainBtn) {
                this.tryAgainBtn.style.fontSize = `${Math.floor(20 * this.adaptive)}px`;
                this.tryAgainBtn.style.marginTop = `${Math.floor(30 * this.adaptive)}px`;
                this.tryAgainBtn.style.marginRight = `${Math.floor(5 * this.adaptive)}px`;
                this.tryAgainBtn.style.borderRadius = `${Math.floor(15 * this.adaptive)}px`;
            }
            if (this.nextLevelBtn) {
                this.nextLevelBtn.style.fontSize = `${Math.floor(20 * this.adaptive)}px`;
                this.nextLevelBtn.style.marginTop = `${Math.floor(30 * this.adaptive)}px`;
                this.nextLevelBtn.style.borderRadius = `${Math.floor(15 * this.adaptive)}px`;
            }
            if (this.resetBtn) {
                this.resetBtn.style.fontSize = `${Math.floor(20 * this.adaptive)}px`;
                this.resetBtn.style.marginTop = `${Math.floor(30 * this.adaptive)}px`;
                this.resetBtn.style.marginLeft = `${Math.floor(5 * this.adaptive)}px`;
                this.resetBtn.style.borderRadius = `${Math.floor(15 * this.adaptive)}px`;
            }
        }
    }
    
    // Game complete
    gameComplete() {
        this.state = GAME_STATE.GAME_OVER;
        
        if (this.gameOverElement) {
            this.gameOverElement.style.display = 'block';
            this.updateGameOverStyles();
        }
        
        // Show/hide next level button based on current level
        if (this.nextLevelBtn) {
            if (this.currentLevel < LEVEL_CONFIGS.length) {
                this.nextLevelBtn.style.display = 'inline-block';
            } else {
                this.nextLevelBtn.style.display = 'none';
            }
        }
    }
    
    // Try again (restart current level)
    tryAgain() {
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        // Hide game over overlay
        if (this.gameOverElement) {
            this.gameOverElement.style.display = 'none';
        }
        
        // Restart game
        this.startGame();
    }
    
    // Next level
    nextLevel() {
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        if (this.currentLevel < LEVEL_CONFIGS.length) {
            this.currentLevel++;
            this.saveLevel();
            
            // Hide game over overlay
            if (this.gameOverElement) {
                this.gameOverElement.style.display = 'none';
            }
            
            // Restart game with new level
            this.calculateDimensions();
            this.startGame();
        }
    }
    
    // Reset to level 1
    reset() {
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        this.currentLevel = 1;
        this.saveLevel();
        
        // Hide game over overlay
        if (this.gameOverElement) {
            this.gameOverElement.style.display = 'none';
        }
        
        // Restart game with level 1
        this.calculateDimensions();
        this.startGame();
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new MemoryCardGame();
    });
} else {
    new MemoryCardGame();
}

