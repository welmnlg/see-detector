/*
 * Word Scramble Game - Alternative Implementation
 * Rewritten with different code structure and algorithms
 * Uses ES6 classes and native JavaScript
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
                    window.__gameResourceBase = baseUrl;
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
                
                // Last resort: try chrome.runtime.getURL with 'games/' (should work regardless of path)
                try {
                    if (chrome.runtime.getURL) {
                        const baseUrl = chrome.runtime.getURL('games/');
                        if (baseUrl) {
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
                    // chrome.runtime.getURL failed
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
        
        // If no valid base, try to wait a bit (synchronous wait, max 250ms)
        if (!base || (!base.startsWith('chrome-extension://') && 
                     !base.startsWith('http://') && 
                     !base.startsWith('https://'))) {
            let waited = 0;
            const maxWait = 250;
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
        
        // If still no valid base, try chrome.runtime.getURL one more time
        if (!base || (!base.startsWith('chrome-extension://') && 
                     !base.startsWith('http://') && 
                     !base.startsWith('https://'))) {
            try {
                if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
                    base = chrome.runtime.getURL('games/');
                    if (base && !base.endsWith('/')) {
                        base += '/';
                    }
                    if (base && (base.startsWith('chrome-extension://') ||
                                base.startsWith('http://') ||
                                base.startsWith('https://'))) {
                        window.__gameResourceBase = base;
                    }
                }
            } catch (e) {
                // chrome.runtime.getURL not available
            }
        }
        
        // If we have a valid base, use it
        if (base && (base.startsWith('chrome-extension://') || 
                     base.startsWith('http://') || 
                     base.startsWith('https://'))) {
            return base + cleanPath;
        }
        
        // Last resort: return relative path (will fail, but at least we tried)
        return window.__gameResourceBase + cleanPath;
    };
})();

// Game constants
const MAX_LEVEL = 6;
const INITIAL_TIME = 60; // seconds
const STORAGE_LEVEL_KEY = 'word-scramble_level';
const STORAGE_WORDS_KEY = 'word-scramble_wd';

// Word Scramble Game Class
class WordScrambleGame {
    constructor() {
        // Screen dimensions
        this.screenWidth = window.innerWidth - 80;
        this.screenHeight = window.innerHeight - Math.max(100, Math.floor(window.innerHeight * 0.14));
        this.gameDefaultWidth = 700;
        this.gameDefaultHeight = 490;
        this.gameboxBaseHeight = 440; // Original content height for gamebox sizing
        
        // Calculate adaptive size
        const modSize = (this.screenWidth < 800 || this.screenHeight < 600) ? 10 : 0;
        this.adaptive = Math.min(
            this.screenWidth / (this.gameDefaultWidth + modSize),
            this.screenHeight / (this.gameDefaultHeight + modSize)
        ) || 0.8;
        
        // Grid item size based on adaptive scaling
        this.gridItemSize = Math.floor(60 * this.adaptive);
        
        // Game state
        this.currentLevel = 1;
        this.score = 0;
        this.timeLeft = INITIAL_TIME;
        this.currentWord = '';
        this.words = [];
        this.allWords = null;
        this.isGameOver = false;
        
        // Timer
        this.timerInterval = null;
        
        // DOM elements
        this.gridContainer = null;
        this.wordInput = null;
        this.submitButton = null;
        this.nextButton = null;
        this.viewButton = null;
        this.scoreElement = null;
        this.answerElement = null;
        this.timerElement = null;
        this.gameoverElement = null;
        this.tryAgainButton = null;
        this.nextLevelButton = null;
        this.resetButton = null;
        
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
        
        // Recalculate grid item size
        this.gridItemSize = Math.floor(60 * this.adaptive);
        
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
        
        // Load level from URL or storage
        this.loadLevel();
        
        // Setup UI
        this.setupUI();
        
        // Load level (which will then load words)
        // loadWords() is called from loadLevel() after level is loaded
    }
    
    // Load level from URL or storage
    loadLevel() {
        // Check URL parameter first (this takes precedence)
        const urlParams = new URLSearchParams(window.location.search);
        const level = urlParams.get('mlv');
        if (level !== null && Number.isInteger(Number(level))) {
            const newLevel = Number(level) + 1;
            this.currentLevel = newLevel;
            this.saveLevel();
            return;
        }
        
        // Load from chrome.storage.local
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get([STORAGE_LEVEL_KEY], (result) => {
                    if (chrome.runtime.lastError) {
                        this.setDefaultLevel();
                        return;
                    }
                    
                    if (result[STORAGE_LEVEL_KEY] !== undefined && result[STORAGE_LEVEL_KEY] !== null) {
                        try {
                            const parsedLevel = typeof result[STORAGE_LEVEL_KEY] === 'number' 
                                ? result[STORAGE_LEVEL_KEY] 
                                : JSON.parse(result[STORAGE_LEVEL_KEY]);
                            // Ensure level is valid (1 to MAX_LEVEL)
                            if (parsedLevel >= 1 && parsedLevel <= MAX_LEVEL) {
                                this.currentLevel = parsedLevel;
                            } else {
                                // Invalid level, reset to 1
                                this.setDefaultLevel();
                            }
                        } catch (e) {
                            this.setDefaultLevel();
                        }
                    } else {
                        // No stored level, start at level 1
                        this.setDefaultLevel();
                    }
                    
                    // Load words after level is loaded
                    this.loadWords();
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                const storageCurrentLevel = localStorage.getItem(STORAGE_LEVEL_KEY);
                if (storageCurrentLevel) {
                    try {
                        const parsedLevel = JSON.parse(storageCurrentLevel);
                        // Ensure level is valid (1 to MAX_LEVEL)
                        if (parsedLevel >= 1 && parsedLevel <= MAX_LEVEL) {
                            this.currentLevel = parsedLevel;
                        } else {
                            // Invalid level, reset to 1
                            this.setDefaultLevel();
                        }
                    } catch (e) {
                        this.setDefaultLevel();
                    }
                } else {
                    // No stored level, start at level 1
                    this.setDefaultLevel();
                }
                
                // Load words after level is loaded
                this.loadWords();
            }
        } catch (e) {
            this.setDefaultLevel();
            this.loadWords();
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
                chrome.storage.local.set({ [STORAGE_LEVEL_KEY]: this.currentLevel }, () => {
                    if (chrome.runtime.lastError) {
                        // Failed to save level
                    }
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                localStorage.setItem(STORAGE_LEVEL_KEY, JSON.stringify(this.currentLevel));
            }
        } catch (e) {
            // Failed to save level
        }
    }
    
    // Setup UI elements
    setupUI() {
        this.gridContainer = document.getElementById('grid-container');
        this.wordInput = document.getElementById('word-input');
        this.submitButton = document.getElementById('submit-button');
        this.nextButton = document.getElementById('next-button');
        this.viewButton = document.getElementById('view-button');
        this.scoreElement = document.getElementById('scorev');
        this.answerElement = document.getElementById('answer');
        this.timerElement = document.getElementById('timer');
        this.gameoverElement = document.getElementById('gameover');
        this.tryAgainButton = document.getElementById('tryagainbtn');
        this.nextLevelButton = document.getElementById('nextlevelbtn');
        this.resetButton = document.getElementById('resetbtn');
        
        // Update gamebox size
        const gamebox = document.getElementById('gamebox');
        if (gamebox) {
            gamebox.style.width = `${Math.floor(this.gameDefaultWidth * this.adaptive)}px`;
            // Match classic-maze gamebox height
            const classicCellH = Math.floor(30 * this.adaptive);
            const classicPadH = Math.floor(15 * this.adaptive);
            const classicGameboxH = classicCellH * 14 + classicPadH * 2 + 2 + classicCellH;
            gamebox.style.height = `${Math.max(Math.floor(this.gameboxBaseHeight * this.adaptive), classicGameboxH)}px`;
            gamebox.style.padding = `${Math.floor(5 * this.adaptive)}px`;
        }
        
        // Update header
        const header = document.getElementById('header');
        if (header) {
            header.style.height = `${Math.floor(40 * this.adaptive)}px`;
            header.style.fontSize = `${Math.floor(30 * this.adaptive)}px`;
            header.style.padding = `${Math.floor(20 * this.adaptive)}px`;
        }
        
        // Update score
        const score = document.getElementById('score');
        if (score) {
            score.style.width = `${Math.floor(140 * this.adaptive)}px`;
        }
        
        // Update answer
        if (this.answerElement) {
            this.answerElement.style.width = `${Math.floor(220 * this.adaptive)}px`;
            this.answerElement.style.height = `${Math.floor(43 * this.adaptive)}px`;
            this.answerElement.style.paddingLeft = `${Math.floor(50 * this.adaptive)}px`;
        }
        
        // Update time
        const time = document.getElementById('time');
        if (time) {
            time.style.width = `${Math.floor(180 * this.adaptive)}px`;
        }
        
        // Update game-container
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.width = `${Math.floor(580 * this.adaptive)}px`;
            gameContainer.style.fontSize = `${Math.floor(36 * this.adaptive)}px`;
        }
        
        // Update grid-container
        if (this.gridContainer) {
            this.gridContainer.style.gap = `${Math.floor(10 * this.adaptive)}px`;
            this.gridContainer.style.margin = `${Math.floor(20 * this.adaptive)}px auto`;
            this.gridContainer.style.padding = `0px ${Math.floor(30 * this.adaptive)}px`;
            this.gridContainer.style.height = `${Math.floor(150 * this.adaptive)}px`;
        }
        
        // Update grid items
        const gridItems = this.gridContainer ? this.gridContainer.querySelectorAll('.grid-item') : [];
        gridItems.forEach(item => {
            item.style.width = `${this.gridItemSize}px`;
            item.style.height = `${this.gridItemSize}px`;
            item.style.fontSize = `${Math.floor(40 * this.adaptive)}px`;
            item.style.marginBottom = `${Math.floor(10 * this.adaptive)}px`;
        });
        
        // Update word-input
        if (this.wordInput) {
            this.wordInput.style.padding = `${Math.floor(5 * this.adaptive)}px ${Math.floor(10 * this.adaptive)}px`;
            this.wordInput.style.margin = `${Math.floor(50 * this.adaptive)}px auto ${Math.floor(10 * this.adaptive)}px`;
            this.wordInput.style.height = `${Math.floor(50 * this.adaptive)}px`;
            this.wordInput.style.width = `${Math.floor(280 * this.adaptive)}px`;
            this.wordInput.style.borderRadius = `${Math.floor(8 * this.adaptive)}px`;
            this.wordInput.style.fontSize = `${Math.floor(26 * this.adaptive)}px`;
        }
        
        // Update buttons
        if (this.submitButton) {
            this.submitButton.style.padding = `${Math.floor(5 * this.adaptive)}px ${Math.floor(12 * this.adaptive)}px`;
            this.submitButton.style.fontSize = `${Math.floor(24 * this.adaptive)}px`;
            this.submitButton.style.borderRadius = `${Math.floor(8 * this.adaptive)}px`;
        }
        if (this.nextButton) {
            this.nextButton.style.padding = `${Math.floor(5 * this.adaptive)}px ${Math.floor(12 * this.adaptive)}px`;
            this.nextButton.style.fontSize = `${Math.floor(24 * this.adaptive)}px`;
            this.nextButton.style.borderRadius = `${Math.floor(8 * this.adaptive)}px`;
        }
        if (this.viewButton) {
            this.viewButton.style.padding = `${Math.floor(5 * this.adaptive)}px ${Math.floor(12 * this.adaptive)}px`;
            this.viewButton.style.fontSize = `${Math.floor(24 * this.adaptive)}px`;
            this.viewButton.style.borderRadius = `${Math.floor(8 * this.adaptive)}px`;
        }
        
        // Update gameover overlay
        if (this.gameoverElement) {
            this.gameoverElement.style.width = `${Math.floor(this.gameDefaultWidth * this.adaptive)}px`;
            const goClassicCellH = Math.floor(30 * this.adaptive);
            const goClassicPadH = Math.floor(15 * this.adaptive);
            const goClassicGameboxH = goClassicCellH * 14 + goClassicPadH * 2 + 2 + goClassicCellH;
            this.gameoverElement.style.height = `${Math.max(Math.floor(this.gameboxBaseHeight * this.adaptive), goClassicGameboxH)}px`;
            
            const msg = this.gameoverElement.querySelector('.msg');
            if (msg) {
                msg.style.fontSize = `${Math.floor(40 * this.adaptive)}px`;
                msg.style.marginTop = `${Math.floor(80 * this.adaptive)}px`;
            }
            
            if (this.tryAgainButton) {
                this.tryAgainButton.style.width = `${Math.floor(160 * this.adaptive)}px`;
                this.tryAgainButton.style.padding = `${Math.floor(6 * this.adaptive)}px`;
                this.tryAgainButton.style.fontSize = `${Math.floor(30 * this.adaptive)}px`;
                this.tryAgainButton.style.borderRadius = `${Math.floor(10 * this.adaptive)}px`;
                this.tryAgainButton.style.margin = `${Math.floor(36 * this.adaptive)}px auto ${Math.floor(20 * this.adaptive)}px`;
            }
            if (this.nextLevelButton) {
                this.nextLevelButton.style.width = `${Math.floor(160 * this.adaptive)}px`;
                this.nextLevelButton.style.padding = `${Math.floor(6 * this.adaptive)}px`;
                this.nextLevelButton.style.fontSize = `${Math.floor(30 * this.adaptive)}px`;
                this.nextLevelButton.style.borderRadius = `${Math.floor(10 * this.adaptive)}px`;
                this.nextLevelButton.style.margin = `${Math.floor(20 * this.adaptive)}px auto`;
            }
            if (this.resetButton) {
                this.resetButton.style.width = `${Math.floor(160 * this.adaptive)}px`;
                this.resetButton.style.padding = `${Math.floor(6 * this.adaptive)}px`;
                this.resetButton.style.fontSize = `${Math.floor(30 * this.adaptive)}px`;
                this.resetButton.style.borderRadius = `${Math.floor(10 * this.adaptive)}px`;
                this.resetButton.style.margin = `${Math.floor(20 * this.adaptive)}px auto`;
            }
        }
        
        // Reset game state
        this.isGameOver = false;
        this.score = 0;
        
        // Hide game over overlay
        if (this.gameoverElement) {
            this.gameoverElement.style.display = 'none';
        }
        
        // Enable submit button
        if (this.submitButton) {
            this.submitButton.disabled = false;
        }
        
        // Update score display
        if (this.scoreElement) {
            this.scoreElement.textContent = '0';
        }
        
        // Setup event listeners (only if not already set)
        if (this.submitButton && !this.submitButton.hasAttribute('data-listener')) {
            this.submitButton.setAttribute('data-listener', 'true');
            this.submitButton.addEventListener('click', () => {
                this.handleSubmit();
            });
        }
        
        if (this.nextButton && !this.nextButton.hasAttribute('data-listener')) {
            this.nextButton.setAttribute('data-listener', 'true');
            this.nextButton.addEventListener('click', () => {
                this.nextWord();
            });
        }
        
        if (this.viewButton && !this.viewButton.hasAttribute('data-listener')) {
            this.viewButton.setAttribute('data-listener', 'true');
            this.viewButton.addEventListener('click', () => {
                this.viewAnswer();
            });
        }
        
        // Allow Enter key to submit
        if (this.wordInput && !this.wordInput.hasAttribute('data-listener')) {
            this.wordInput.setAttribute('data-listener', 'true');
            this.wordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSubmit();
                }
            });
        }
    }
    
    // Load words from storage or fetch from JSON
    loadWords() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get([STORAGE_WORDS_KEY], (result) => {
                    if (chrome.runtime.lastError) {
                        this.fetchWords();
                        return;
                    }
                    
                    if (result[STORAGE_WORDS_KEY] !== undefined && result[STORAGE_WORDS_KEY] !== null) {
                        try {
                            this.allWords = typeof result[STORAGE_WORDS_KEY] === 'string' 
                                ? JSON.parse(result[STORAGE_WORDS_KEY]) 
                                : result[STORAGE_WORDS_KEY];
                            this.words = this.allWords[this.currentLevel - 1];
                            this.initGame();
                            this.startTimer();
                        } catch (e) {
                            this.fetchWords();
                        }
                    } else {
                        // No stored words, fetch from JSON
                        this.fetchWords();
                    }
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                const storedWords = localStorage.getItem(STORAGE_WORDS_KEY);
                
                if (storedWords) {
                    try {
                        // Load from storage
                        this.allWords = JSON.parse(storedWords);
                        this.words = this.allWords[this.currentLevel - 1];
                        this.initGame();
                        this.startTimer();
                    } catch (e) {
                        this.fetchWords();
                    }
                } else {
                    // Fetch from JSON
                    this.fetchWords();
                }
            }
        } catch (e) {
            this.fetchWords();
        }
    }
    
    // Fetch words from JSON file
    async fetchWords() {
        // Wait for __gameResourceBase to be set if it's not set yet
        let waitCount = 0;
        const maxWait = 20; // Wait up to 1 second (20 * 50ms)
        while (!window.__gameResourceBase || 
               (!window.__gameResourceBase.startsWith('chrome-extension://') &&
                !window.__gameResourceBase.startsWith('http://') &&
                !window.__gameResourceBase.startsWith('https://'))) {
            if (waitCount >= maxWait) {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 50));
            waitCount++;
        }
        
        // Try multiple methods to get the resource URL
        let resourceUrl = null;
        
        // Method 1: Try window.getGameResource
        try {
            const tempUrl = window.getGameResource('data/word-scramble.json');
            if (tempUrl && (tempUrl.startsWith('chrome-extension://') ||
                           tempUrl.startsWith('http://') ||
                           tempUrl.startsWith('https://'))) {
                resourceUrl = tempUrl;
            }
        } catch (e) {
            // getGameResource failed
        }
        
        // Method 2: Try chrome.runtime.getURL
        if (!resourceUrl) {
            try {
                if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
                    resourceUrl = chrome.runtime.getURL('games/data/word-scramble.json');
                }
            } catch (e) {
                // chrome.runtime.getURL not available
            }
        }
        
        // Method 3: Try chrome.runtime.getURL (no hardcoded path)
        if (!resourceUrl) {
            try {
                if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
                    resourceUrl = chrome.runtime.getURL('games/data/word-scramble.json');
                }
            } catch (e) {
                // chrome.runtime.getURL not available
            }
        }
        
        // Method 4: Try parent window
        if (!resourceUrl) {
            try {
                if (window.parent && window.parent !== window) {
                    const parentBase = window.parent.releasesBaseUrl || window.parent.__gameResourceBase;
                    if (parentBase && (parentBase.startsWith('chrome-extension://') ||
                                      parentBase.startsWith('http://') ||
                                      parentBase.startsWith('https://'))) {
                        resourceUrl = parentBase + 'data/word-scramble.json';
                    }
                }
            } catch (e) {
                // Cannot access parent
            }
        }
        
        // Method 5: Extract from script src (dynamic path extraction)
        if (!resourceUrl) {
            try {
                const scripts = document.getElementsByTagName('script');
                for (let i = 0; i < scripts.length; i++) {
                    const script = scripts[i];
                    if (script.src && script.src.startsWith('chrome-extension://')) {
                        const urlObj = new URL(script.src);
                        const pathParts = urlObj.pathname.split('/').filter(p => p);
                        const gamesIndex = pathParts.indexOf('games');
                        if (gamesIndex >= 0) {
                            // Dynamically construct path based on script location
                            resourceUrl = `${urlObj.origin}/${pathParts.slice(0, gamesIndex + 1).join('/')}/data/word-scramble.json`;
                            break;
                        }
                    }
                }
            } catch (e) {
                // Cannot extract path
            }
        }
        
        // Method 6: Use __gameResourceBase if available
        if (!resourceUrl && window.__gameResourceBase && 
            (window.__gameResourceBase.startsWith('chrome-extension://') ||
             window.__gameResourceBase.startsWith('http://') ||
             window.__gameResourceBase.startsWith('https://'))) {
            resourceUrl = window.__gameResourceBase + 'data/word-scramble.json';
        }
        
        if (!resourceUrl) {
            return;
        }
        
        try {
            const response = await fetch(resourceUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.allWords = data;
            this.words = this.allWords[this.currentLevel - 1];
            this.saveWords();
            this.initGame();
            this.startTimer();
        } catch (err) {
            // Try alternative URL if first attempt failed
            if (resourceUrl.includes('chrome-extension://')) {
                // Try with different path variations (dynamic, no hardcoded paths)
                const urlObj = new URL(resourceUrl);
                const pathParts = urlObj.pathname.split('/').filter(p => p);
                const gamesIndex = pathParts.indexOf('games');
                
                const altUrls = [];
                if (gamesIndex >= 0) {
                    // Try direct games/ path
                    altUrls.push(`${urlObj.origin}/games/data/word-scramble.json`);
                    // Try removing any parent directories before games/
                    if (gamesIndex > 0) {
                        altUrls.push(`${urlObj.origin}/${pathParts.slice(gamesIndex).join('/')}/data/word-scramble.json`);
                    }
                }
                
                // Also try chrome.runtime.getURL
                try {
                    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
                        altUrls.push(chrome.runtime.getURL('games/data/word-scramble.json'));
                    }
                } catch (e) {
                    // chrome.runtime.getURL not available
                }
                
                for (const altUrl of altUrls) {
                    try {
                        const response = await fetch(altUrl, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            }
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            this.allWords = data;
                            this.words = this.allWords[this.currentLevel - 1];
                            this.saveWords();
                            this.initGame();
                            this.startTimer();
                            return;
                        }
                    } catch (e) {
                        // Try next alternative
                    }
                }
            }
        }
    }
    
    // Shuffle array (Fisher-Yates algorithm)
    shuffle(array) {
        const shuffled = [...array];
        let m = shuffled.length;
        let t, i;
        
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = shuffled[m];
            shuffled[m] = shuffled[i];
            shuffled[i] = t;
        }
        
        return shuffled;
    }
    
    // Initialize game grid
    initGame() {
        // Select random word
        this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
        
        // Clear grid
        if (this.gridContainer) {
            // Clear content using removeChild instead of innerHTML
            while (this.gridContainer.firstChild) {
                this.gridContainer.removeChild(this.gridContainer.firstChild);
            }
        }
        
        // Clear answer display
        if (this.answerElement) {
            // Clear content using removeChild instead of innerHTML
            while (this.answerElement.firstChild) {
                this.answerElement.removeChild(this.answerElement.firstChild);
            }
        }
        
        // Reset input field
        if (this.wordInput) {
            this.wordInput.value = '';
        }
        
        // Shuffle word letters
        const wordArr = this.currentWord.split('');
        const shuffledLetters = this.shuffle(wordArr);
        
        // Create grid items
        shuffledLetters.forEach((letter) => {
            const gridItem = document.createElement('div');
            gridItem.classList.add('grid-item');
            gridItem.textContent = letter;
            gridItem.style.width = `${this.gridItemSize}px`;
            gridItem.style.height = `${this.gridItemSize}px`;
            gridItem.style.fontSize = `${Math.floor(40 * this.adaptive)}px`;
            gridItem.style.marginBottom = `${Math.floor(10 * this.adaptive)}px`;
            if (this.gridContainer) {
                this.gridContainer.appendChild(gridItem);
            }
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
        // Header total height = (40 + 40) * ad; center at 40*ad
        const headerCenter = Math.floor(40 * ad);
        
        const hint = document.createElement('div');
        hint.id = 'howToHint';
        hint.style.cssText = `
            position: absolute;
            top: ${headerCenter}px;
            left: 50%;
            transform: translateX(-50%) translateY(-50%);
            background: linear-gradient(135deg, rgba(15, 20, 35, 0.85), rgba(20, 28, 50, 0.8));
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-top-color: rgba(255, 255, 255, 0.2);
            border-radius: ${Math.floor(22 * ad)}px;
            padding: ${Math.floor(7 * ad)}px ${Math.floor(18 * ad)}px;
            display: flex;
            align-items: center;
            gap: ${Math.floor(8 * ad)}px;
            z-index: 100;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.06);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        `;
        
        const text = document.createElement('span');
        text.textContent = 'Unscramble the Letters \u2022 Type & Submit';
        text.style.cssText = `
            color: rgba(255, 255, 255, 0.92);
            font-size: ${Math.floor(12 * ad)}px;
            font-weight: 500;
            font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
            white-space: nowrap;
            letter-spacing: 0.3px;
            line-height: 1;
        `;
        
        hint.appendChild(text);
        const gamebox = document.getElementById('gamebox');
        if (gamebox) {
            gamebox.style.position = 'relative';
            gamebox.appendChild(hint);
        }
        this.howToHint = hint;
        
        // Entrance animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                hint.style.opacity = '1';
            });
        });
        
        // Dismiss on first input interaction
        if (this.wordInput) {
            const dismiss = () => {
                this.hideHowToHint();
                this.wordInput.removeEventListener('focus', dismiss);
            };
            this.wordInput.addEventListener('focus', dismiss);
        }
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
    
    // Check if word is valid
    isValidWord(guessWord) {
        return this.currentWord.toUpperCase() === guessWord.toUpperCase();
    }
    
    // Handle word submission
    handleSubmit() {
        if (this.isGameOver) {
            return;
        }
        
        const submittedWord = this.wordInput ? this.wordInput.value : '';
        
        if (this.isValidWord(submittedWord)) {
            // Correct answer
            this.score += submittedWord.length;
            if (this.scoreElement) {
                this.scoreElement.textContent = this.score;
            }
            this.initGame();
        }
    }
    
    // Next word
    nextWord() {
        if (this.isGameOver) {
            return;
        }
        this.initGame();
    }
    
    // View answer
    viewAnswer() {
        if (this.isGameOver) {
            return;
        }
        if (this.answerElement) {
            // Clear existing content
            while (this.answerElement.firstChild) {
                this.answerElement.removeChild(this.answerElement.firstChild);
            }
            // Create elements using DOM methods instead of innerHTML
            const span = document.createElement('span');
            span.textContent = this.currentWord;
            this.answerElement.appendChild(span);
        }
    }
    
    // Start countdown timer
    startTimer() {
        // Clear existing timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timeLeft = INITIAL_TIME;
        if (this.timerElement) {
            this.timerElement.textContent = `${this.timeLeft}s`;
        }
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            if (this.timerElement) {
                this.timerElement.textContent = `${this.timeLeft}s`;
            }
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.endGame();
            }
        }, 1000);
    }
    
    // End game
    endGame() {
        this.isGameOver = true;
        
        // Show game over overlay
        if (this.gameoverElement) {
            // Ensure overlay completely covers gamebox
            const gamebox = document.getElementById('gamebox');
            if (gamebox) {
                const gameboxRect = gamebox.getBoundingClientRect();
                this.gameoverElement.style.position = 'absolute';
                this.gameoverElement.style.top = '0';
                this.gameoverElement.style.left = '0';
                this.gameoverElement.style.width = '100%';
                this.gameoverElement.style.height = '100%';
                this.gameoverElement.style.zIndex = '1000';
            }
            this.gameoverElement.style.display = 'block';
        }
        
        // Disable submit button
        if (this.submitButton) {
            this.submitButton.disabled = true;
        }
        
        // Setup game over buttons
        this.setupGameOverButtons();
    }
    
    // Setup game over buttons
    setupGameOverButtons() {
        // Try Again button
        if (this.tryAgainButton) {
            // Remove any existing listeners by replacing the button
            const newTryAgain = this.tryAgainButton.cloneNode(true);
            if (this.tryAgainButton.parentNode) {
                this.tryAgainButton.parentNode.replaceChild(newTryAgain, this.tryAgainButton);
            }
            this.tryAgainButton = newTryAgain;
            
            this.tryAgainButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.tryAgain();
            });
        }
        
        // Next Level button
        if (this.nextLevelButton) {
            if (this.currentLevel < MAX_LEVEL) {
                // Remove any existing listeners by replacing the button
                const newNextLevel = this.nextLevelButton.cloneNode(true);
                if (this.nextLevelButton.parentNode) {
                    this.nextLevelButton.parentNode.replaceChild(newNextLevel, this.nextLevelButton);
                }
                this.nextLevelButton = newNextLevel;
                
                this.nextLevelButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.nextLevel();
                });
            } else {
                // Remove button if at max level
                if (this.nextLevelButton.parentNode) {
                    this.nextLevelButton.parentNode.removeChild(this.nextLevelButton);
                }
            }
        }
        
        // Reset button
        if (this.resetButton) {
            // Remove any existing listeners by replacing the button
            const newReset = this.resetButton.cloneNode(true);
            if (this.resetButton.parentNode) {
                this.resetButton.parentNode.replaceChild(newReset, this.resetButton);
            }
            this.resetButton = newReset;
            
            this.resetButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetLevel();
            });
        }
    }
    
    // Restart game (reset game state)
    restartGame() {
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        // Clear timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Reset game state
        this.isGameOver = false;
        this.score = 0;
        this.timeLeft = INITIAL_TIME;
        
        // Hide game over overlay
        if (this.gameoverElement) {
            this.gameoverElement.style.display = 'none';
        }
        
        // Enable submit button
        if (this.submitButton) {
            this.submitButton.disabled = false;
        }
        
        // Update score display
        if (this.scoreElement) {
            this.scoreElement.textContent = '0';
        }
        
            // Ensure words are loaded for current level
            if (this.allWords && this.allWords.length > 0) {
                // Words already loaded, use current level
                if (this.currentLevel >= 1 && this.currentLevel <= this.allWords.length) {
                    this.words = this.allWords[this.currentLevel - 1];
                } else {
                    // Level out of range, reload from storage
                    this.loadLevelFromStorage(() => {
                        if (this.currentLevel >= 1 && this.currentLevel <= this.allWords.length) {
                            this.words = this.allWords[this.currentLevel - 1];
                        } else {
                            // Invalid level, reset to 1
                            this.setDefaultLevel();
                            this.words = this.allWords[0];
                        }
                        // Initialize game and start timer
                        this.initGame();
                        this.startTimer();
                    });
                    return;
                }
                // Initialize game and start timer
                this.initGame();
                this.startTimer();
            } else {
                // Words not loaded yet, reload them
                this.loadWords();
            }
    }
    
    // Load level from storage (helper method)
    loadLevelFromStorage(callback) {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get([STORAGE_LEVEL_KEY], (result) => {
                    if (chrome.runtime.lastError) {
                        this.setDefaultLevel();
                        if (callback) callback();
                        return;
                    }
                    
                    if (result[STORAGE_LEVEL_KEY] !== undefined && result[STORAGE_LEVEL_KEY] !== null) {
                        try {
                            const parsedLevel = typeof result[STORAGE_LEVEL_KEY] === 'number' 
                                ? result[STORAGE_LEVEL_KEY] 
                                : JSON.parse(result[STORAGE_LEVEL_KEY]);
                            if (parsedLevel >= 1 && parsedLevel <= MAX_LEVEL) {
                                this.currentLevel = parsedLevel;
                            } else {
                                this.setDefaultLevel();
                            }
                        } catch (e) {
                            this.setDefaultLevel();
                        }
                    } else {
                        this.setDefaultLevel();
                    }
                    if (callback) callback();
                });
            } else {
                // Fallback to localStorage
                const storageCurrentLevel = localStorage.getItem(STORAGE_LEVEL_KEY);
                if (storageCurrentLevel) {
                    try {
                        const parsedLevel = JSON.parse(storageCurrentLevel);
                        if (parsedLevel >= 1 && parsedLevel <= MAX_LEVEL) {
                            this.currentLevel = parsedLevel;
                        } else {
                            this.setDefaultLevel();
                        }
                    } catch (e) {
                        this.setDefaultLevel();
                    }
                } else {
                    this.setDefaultLevel();
                }
                if (callback) callback();
            }
        } catch (e) {
            this.setDefaultLevel();
            if (callback) callback();
        }
    }
    
    // Try again (restart current level)
    tryAgain() {
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        this.restartGame();
    }
    
    // Next level
    nextLevel() {
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        const nextLevel = this.currentLevel + 1;
        this.currentLevel = nextLevel;
        this.saveLevel();
        this.restartGame();
    }
    
    // Save words to chrome.storage.local
    saveWords() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ [STORAGE_WORDS_KEY]: this.allWords }, () => {
                    if (chrome.runtime.lastError) {
                        // Failed to save words
                    }
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                localStorage.setItem(STORAGE_WORDS_KEY, JSON.stringify(this.allWords));
            }
        } catch (e) {
            // Failed to save words
        }
    }
    
    // Reset to level 1
    resetLevel() {
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        this.currentLevel = 1;
        this.saveLevel();
        this.restartGame();
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new WordScrambleGame();
    });
} else {
    new WordScrambleGame();
}

