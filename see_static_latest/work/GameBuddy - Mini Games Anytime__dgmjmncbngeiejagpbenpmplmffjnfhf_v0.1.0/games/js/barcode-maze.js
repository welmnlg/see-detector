/*
 * Barcode Maze Game - Alternative Implementation
 * Rewritten with different code structure and algorithms
 * Uses ES6 classes, native JavaScript, and different pathfinding approach
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
                return window.__gameResourceBase + cleanPath;
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
const GRID_SIZE = 20;
const INITIAL_TIME = 15;
const PAUSE_DURATION = 5;
const PATH_DISPLAY_DURATION = 5;
const STORAGE_KEY = 'barcode-maps';
const MAP_ID_STORAGE_KEY = 'barcode-mapid'; // Use chrome.storage.local

// Game states
const GAME_STATE = {
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver',
    WON: 'won'
};

// Barcode Maze Game Class
class BarcodeMazeGame {
    constructor() {
        // Screen dimensions
        this.screenWidth = window.innerWidth - 80;
        this.screenHeight = window.innerHeight - Math.max(100, Math.floor(window.innerHeight * 0.14));
        this.gameDefaultWidth = 440;
        this.gameDefaultHeight = 490;
        
        // Calculate adaptive size
        const modSize = (this.screenWidth < 800 || this.screenHeight < 600) ? 10 : 0;
        this.adaptive = Math.min(
            this.screenWidth / (this.gameDefaultHeight + modSize),
            this.screenHeight / (this.gameDefaultHeight + modSize)
        ) || 0.8;
        
        // Grid dimensions
        this.gridSize = GRID_SIZE;
        this.padding = 0;
        this.cellSize = Math.floor(22 * this.adaptive);
        this.canvasSize = this.cellSize * this.gridSize + this.padding * 2;
        this.topbarHeight = Math.floor(30 * this.adaptive);
        
        // Game state
        this.state = GAME_STATE.PLAYING;
        this.isGameOver = false;
        this.remainingTime = INITIAL_TIME;
        this.pauseSeconds = PAUSE_DURATION;
        this.pathSeconds = PATH_DISPLAY_DURATION;
        this.pauseClicked = false;
        
        // Player position
        this.player = { row: 0, col: 0 };
        this.startPos = { row: 0, col: 0 };
        this.endPos = { row: this.gridSize - 1, col: this.gridSize - 1 };
        
        // Maze data
        this.maze = [];
        this.blockers = [];
        this.pathGraph = []; // Adjacency list for pathfinding
        
        // Path visualization
        this.shortestPath = null;
        this.pathTimer = null;
        
        // Timers
        this.gameTimer = null;
        this.pauseTimer = null;
        
        // Map data
        this.maps = null;
        this.currentMapId = null; // Will be loaded from cookie in startGame
        
        // Initialize
        this.init();
    }
    
    // Initialize game
    async init() {
        if (window.innerWidth < 768) {
            return;
        }
        
        this.setupUI();
        this.setupEventListeners();
        this.disableScroll();
        
        // Load and start game
        await this.loadGameData();
        this.startGame();
    }
    
    // Update adaptive size based on current window size
    updateAdaptiveSize() {
        // Recalculate screen dimensions
        this.screenWidth = window.innerWidth - 80;
        this.screenHeight = window.innerHeight - Math.max(100, Math.floor(window.innerHeight * 0.14));
        
        // Recalculate adaptive size
        const modSize = (this.screenWidth < 800 || this.screenHeight < 600) ? 10 : 0;
        this.adaptive = Math.min(
            this.screenWidth / (this.gameDefaultHeight + modSize),
            this.screenHeight / (this.gameDefaultHeight + modSize)
        ) || 0.8;
        
        // Recalculate dimensions based on new adaptive size
        this.cellSize = Math.floor(22 * this.adaptive);
        this.canvasSize = this.cellSize * this.gridSize + this.padding * 2;
        this.topbarHeight = Math.floor(30 * this.adaptive);
        
        // Update UI with new sizes
        this.setupUI();
    }
    
    // Setup UI elements
    setupUI() {
        // Topbar
        const topbar = document.getElementById('topbar');
        if (topbar) {
            topbar.style.width = `${this.canvasSize}px`;
            topbar.style.height = `${this.topbarHeight}px`;
        }
        
        const remain = document.getElementById('remain');
        if (remain) {
            remain.style.fontSize = `${Math.floor(this.adaptive * 18)}px`;
        }
        
        const timer = document.getElementById('timer');
        if (timer) {
            timer.style.fontSize = `${Math.floor(this.adaptive * 20)}px`;
            timer.style.width = `${Math.floor(this.adaptive * 35)}px`;
        }
        
        // Main container
        const mainctn = document.getElementById('mainctn');
        if (mainctn) {
            mainctn.style.height = `${this.canvasSize}px`;
        }
        
        const maze = document.getElementById('maze');
        if (maze) {
            maze.style.height = `${this.canvasSize}px`;
        }
        
        // Canvas
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.width = this.canvasSize;
            canvas.height = this.canvasSize;
        }
        
        // Sidebar
        const sidebarWidth = Math.floor(85 * this.adaptive) + 40 * this.adaptive;
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.style.width = `${sidebarWidth}px`;
            sidebar.style.height = `${this.canvasSize}px`;
        }
        
        // Gamebox
        const gamebox = document.getElementById('gamebox');
        if (gamebox) {
            // Match classic-maze gamebox height
            const classicCanvasH = Math.floor(30 * this.adaptive) * 14 + Math.floor(15 * this.adaptive) * 2;
            const classicGameboxH = classicCanvasH + 2 + Math.floor(30 * this.adaptive);
            const contentH = this.canvasSize + 2 + this.topbarHeight;
            gamebox.style.width = `${this.canvasSize + sidebarWidth + 2}px`;
            gamebox.style.height = `${Math.max(contentH, classicGameboxH)}px`;
        }
        
        // Buttons
        const featTxt = document.getElementById('featTxt');
        if (featTxt) {
            featTxt.style.fontSize = `${Math.floor(13 * this.adaptive)}px`;
        }
        
        const pathBtn = document.getElementById('pathBtn');
        if (pathBtn) {
            pathBtn.style.width = `${Math.floor(100 * this.adaptive)}px`;
            pathBtn.style.height = `${Math.floor(28 * this.adaptive)}px`;
            pathBtn.style.fontSize = `${Math.floor(17 * this.adaptive)}px`;
        }
        
        const timePauseBtn = document.getElementById('timePauseBtn');
        if (timePauseBtn) {
            timePauseBtn.style.width = `${Math.floor(100 * this.adaptive)}px`;
            timePauseBtn.style.height = `${Math.floor(28 * this.adaptive)}px`;
            timePauseBtn.style.fontSize = `${Math.floor(17 * this.adaptive)}px`;
        }
        
        const restartbtn = document.getElementById('restartbtn');
        if (restartbtn) {
            restartbtn.style.width = `${Math.floor(180 * this.adaptive)}px`;
            restartbtn.style.height = `${Math.floor(40 * this.adaptive)}px`;
            restartbtn.style.fontSize = `${Math.floor(28 * this.adaptive)}px`;
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Pause button
        const timePauseBtn = document.getElementById('timePauseBtn');
        if (timePauseBtn) {
            timePauseBtn.addEventListener('click', () => this.togglePause());
        }
        
        // Solution button
        const pathBtn = document.getElementById('pathBtn');
        if (pathBtn) {
            pathBtn.addEventListener('click', () => this.showSolution());
        }
        
        // Restart button
        const restartbtn = document.getElementById('restartbtn');
        if (restartbtn) {
            restartbtn.addEventListener('click', () => this.restart());
        }
    }
    
    // Handle keyboard input
    handleKeyPress(event) {
        const keyCode = event.keyCode || event.which;
        
        // Handle Enter or Space for restart when game over
        if ((keyCode === 13 || keyCode === 32) && this.isGameOver) {
            event.preventDefault();
            this.restart();
            return;
        }
        
        // Only block movement when game is over, not when paused
        // Pause only stops the timer, player can still move
        if (this.isGameOver) {
            return;
        }
        
        // Movement keys
        let newRow = this.player.row;
        let newCol = this.player.col;
        let moved = false;
        
        switch (keyCode) {
            case 37: // Left
            case 65: // A
                if (newCol > 0 && this.maze[newRow][newCol - 1] !== 1) {
                    newCol--;
                    moved = true;
                }
                break;
            case 38: // Up
            case 87: // W
                if (newRow > 0 && this.maze[newRow - 1][newCol] !== 1) {
                    newRow--;
                    moved = true;
                }
                break;
            case 39: // Right
            case 68: // D
                if (newCol < this.gridSize - 1 && this.maze[newRow][newCol + 1] !== 1) {
                    newCol++;
                    moved = true;
                }
                break;
            case 40: // Down
            case 83: // S
                if (newRow < this.gridSize - 1 && this.maze[newRow + 1][newCol] !== 1) {
                    newRow++;
                    moved = true;
                }
                break;
        }
        
        if (moved) {
            this.movePlayer(newRow, newCol);
        }
    }
    
    // Move player to new position
    movePlayer(newRow, newCol) {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        // Clear old position
        if (!this.isGameOver) {
            ctx.fillStyle = 'black';
            ctx.fillRect(
                this.player.col * this.cellSize,
                this.player.row * this.cellSize,
                this.cellSize,
                this.cellSize
            );
        }
        
        // Clear path cell if path is displayed
        if (this.shortestPath && this.shortestPath.length > 0) {
            this.clearPathCell(
                this.player.col,
                this.player.row,
                newCol,
                newRow
            );
        }
        
        // Update position
        this.player.row = newRow;
        this.player.col = newCol;
        
        // Draw new position
        ctx.fillStyle = 'red';
        ctx.fillRect(
            this.player.col * this.cellSize,
            this.player.row * this.cellSize,
            this.cellSize,
            this.cellSize
        );
        
        // Check win condition
        if (this.player.row === this.endPos.row && this.player.col === this.endPos.col) {
            this.win();
        }
    }
    
    // Load game data
    async loadGameData() {
        try {
            // Try to load from chrome.storage.local first
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                return new Promise((resolve) => {
                    chrome.storage.local.get([STORAGE_KEY], (result) => {
                        if (chrome.runtime.lastError) {
                            this.fetchAndSaveMaps().then(resolve).catch(() => {
                                this.maps = [];
                                resolve();
                            });
                            return;
                        }
                        
                        if (result[STORAGE_KEY]) {
                            try {
                                this.maps = typeof result[STORAGE_KEY] === 'string' 
                                    ? JSON.parse(result[STORAGE_KEY]) 
                                    : result[STORAGE_KEY];
                                resolve();
                                return;
                            } catch (e) {
                                // Failed to parse cached maps
                            }
                        }
                        
                        // Not in storage, fetch and save
                        this.fetchAndSaveMaps().then(resolve).catch(() => {
                            this.maps = [];
                            resolve();
                        });
                    });
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                const cached = localStorage.getItem(STORAGE_KEY);
                if (cached) {
                    this.maps = JSON.parse(cached);
                    return;
                }
                
                // Fetch from server
                await this.fetchAndSaveMaps();
            }
        } catch (error) {
            // Fallback to empty maps
            this.maps = [];
        }
    }
    
    // Fetch maps from server and save to storage
    async fetchAndSaveMaps() {
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
        
        let resourceUrl = window.getGameResource('data/barcode-maps.json');
        
        // Ensure the URL is absolute
        if (!resourceUrl.startsWith('http://') && !resourceUrl.startsWith('https://') && 
            !resourceUrl.startsWith('chrome-extension://') && !resourceUrl.startsWith('data:') &&
            !resourceUrl.startsWith('blob:')) {
            // getGameResource returned a relative path, construct absolute URL
            let baseUrl = null;
            
            // Try to get base URL from various sources
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
                // Try one more time to wait for __gameResourceBase
                await new Promise(resolve => setTimeout(resolve, 200));
                if (window.__gameResourceBase && 
                    (window.__gameResourceBase.startsWith('chrome-extension://') ||
                     window.__gameResourceBase.startsWith('http://') ||
                     window.__gameResourceBase.startsWith('https://'))) {
                    const cleanPath = resourceUrl.replace(/^\.\.?\//, '');
                    resourceUrl = window.__gameResourceBase + cleanPath;
                } else {
                    throw new Error('Cannot construct absolute URL: base URL not available. Please ensure path-replacement.js is loaded.');
                }
            }
        }
        
        // Validate URL before fetching
        try {
            const urlObj = new URL(resourceUrl);
            if (urlObj.protocol !== 'chrome-extension:' && 
                urlObj.protocol !== 'http:' && 
                urlObj.protocol !== 'https:' &&
                urlObj.protocol !== 'data:' &&
                urlObj.protocol !== 'blob:') {
                throw new Error('Invalid URL protocol: ' + urlObj.protocol);
            }
        } catch (e) {
            throw new Error('Invalid resource URL format: ' + resourceUrl + ' - ' + e.message);
        }
        
        const response = await fetch(resourceUrl);
        if (!response.ok) {
            throw new Error(`Failed to load game data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        this.maps = typeof data === 'string' ? JSON.parse(data) : data;
        
        // Save to chrome.storage.local or localStorage
        this.saveMaps();
    }
    
    // Save maps to storage
    saveMaps() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ [STORAGE_KEY]: this.maps }, () => {
                    if (chrome.runtime.lastError) {
                        // Fallback to localStorage
                        try {
                            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.maps));
                        } catch (e) {
                            // Failed to save to localStorage
                        }
                    }
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.maps));
            }
        } catch (e) {
            // Failed to save maps
        }
    }
    
    // Start game
    async startGame() {
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        if (!this.maps || this.maps.length === 0) {
            return;
        }
        
        // Get current map ID from chrome.storage.local (this should be the next map to use)
        const mapIdToUse = await this.getMapIdAsync();
        
        let validMapId = mapIdToUse;
        if (validMapId === null || isNaN(validMapId)) {
            // First time or not found, start from map 0
            validMapId = 0;
        }
        
        // Ensure mapId is within valid range
        if (validMapId < 0 || validMapId >= this.maps.length) {
            validMapId = 0;
        }
        
        // Draw maze with the map
        this.drawMaze(this.maps[validMapId]);
        
        // Update map ID for next game (prepare next map)
        this.currentMapId = (validMapId + 1) % this.maps.length;
        this.saveMapId(this.currentMapId);
        
        // Start timer
        this.startTimer();
    }
    
    // Draw maze
    drawMaze(map) {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        // Reset game state
        this.isGameOver = false;
        this.state = GAME_STATE.PLAYING;
        this.remainingTime = INITIAL_TIME;
        this.player = { row: 0, col: 0 };
        this.shortestPath = null;
        
        // Clear canvas
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Initialize maze grid
        this.maze = [];
        for (let i = 0; i < this.gridSize; i++) {
            this.maze.push(new Array(this.gridSize).fill(0));
        }
        
        // Set blockers
        this.blockers = map[1] || [];
        for (let i = 0; i < this.blockers.length; i++) {
            const blockerIndex = this.blockers[i];
            const row = Math.floor(blockerIndex / this.gridSize);
            const col = blockerIndex % this.gridSize;
            this.maze[row][col] = 1;
        }
        
        // Draw blockers
        ctx.fillStyle = '#257ae8';
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.maze[row][col] === 1) {
                    ctx.fillRect(
                        col * this.cellSize,
                        row * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
            }
        }
        
        // Draw start position (red)
        ctx.fillStyle = 'red';
        ctx.fillRect(
            this.startPos.col * this.cellSize,
            this.startPos.row * this.cellSize,
            this.cellSize,
            this.cellSize
        );
        
        // Draw end position (green)
        ctx.fillStyle = 'green';
        ctx.fillRect(
            this.endPos.col * this.cellSize,
            this.endPos.row * this.cellSize,
            this.cellSize,
            this.cellSize
        );
        
        // Build path graph for pathfinding
        this.buildPathGraph();
    }
    
    // Build path graph (adjacency list)
    buildPathGraph() {
        // Initialize graph
        this.pathGraph = [];
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            this.pathGraph[i] = [];
        }
        
        // Build connections
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const index = row * this.gridSize + col;
                
                // Skip blockers
                if (this.maze[row][col] === 1) continue;
                
                // Check neighbors
                const neighbors = this.getNeighbors(row, col);
                for (const neighbor of neighbors) {
                    this.pathGraph[index].push(neighbor);
                }
            }
        }
    }
    
    // Get valid neighbors for a cell
    getNeighbors(row, col) {
        const neighbors = [];
        
        // Up
        if (row > 0 && this.maze[row - 1][col] !== 1) {
            neighbors.push((row - 1) * this.gridSize + col);
        }
        // Down
        if (row < this.gridSize - 1 && this.maze[row + 1][col] !== 1) {
            neighbors.push((row + 1) * this.gridSize + col);
        }
        // Left
        if (col > 0 && this.maze[row][col - 1] !== 1) {
            neighbors.push(row * this.gridSize + (col - 1));
        }
        // Right
        if (col < this.gridSize - 1 && this.maze[row][col + 1] !== 1) {
            neighbors.push(row * this.gridSize + (col + 1));
        }
        
        return neighbors;
    }
    
    // BFS pathfinding (different implementation)
    findShortestPath(start, end) {
        const queue = [{ node: start, path: [start] }];
        const visited = new Set([start]);
        
        while (queue.length > 0) {
            const { node, path } = queue.shift();
            
            if (node === end) {
                return path;
            }
            
            const neighbors = this.pathGraph[node] || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push({
                        node: neighbor,
                        path: [...path, neighbor]
                    });
                }
            }
        }
        
        return []; // No path found
    }
    
    // Show solution path
    showSolution() {
        if (this.isGameOver) return;
        
        // Clear previous path
        if (this.shortestPath && this.shortestPath.length > 0) {
            this.clearPath(this.shortestPath);
            if (this.pathTimer) {
                clearTimeout(this.pathTimer);
            }
        }
        
        // Calculate path
        const startIndex = this.player.row * this.gridSize + this.player.col;
        const endIndex = this.endPos.row * this.gridSize + this.endPos.col;
        this.shortestPath = this.findShortestPath(startIndex, endIndex);
        
        // Draw path
        if (this.shortestPath.length > 0) {
            this.drawPath(this.shortestPath, 'red');
            
            // Auto-clear after duration
            this.pathTimer = setTimeout(() => {
                if (!this.isGameOver) {
                    this.clearPath(this.shortestPath);
                    this.shortestPath = null;
                }
            }, this.pathSeconds * 1000);
        }
    }
    
    // Draw path
    drawPath(path, color) {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        for (let i = 0; i < path.length - 1; i++) {
            const start = path[i];
            const end = path[i + 1];
            const startRow = Math.floor(start / this.gridSize);
            const startCol = start % this.gridSize;
            const endRow = Math.floor(end / this.gridSize);
            const endCol = end % this.gridSize;
            
            const startX = startCol * this.cellSize + this.cellSize / 2;
            const startY = startRow * this.cellSize + this.cellSize / 2;
            const endX = endCol * this.cellSize + this.cellSize / 2;
            const endY = endRow * this.cellSize + this.cellSize / 2;
            
            this.drawArrow(startX, startY, endX, endY, color, ctx);
        }
    }
    
    // Draw arrow
    drawArrow(fromX, fromY, toX, toY, color, ctx) {
        const headlen = 7 * this.adaptive;
        const angle = Math.atan2(toY - fromY, toX - fromX);
        
        ctx.save();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2 * this.adaptive;
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
        
        // Draw arrowhead
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
            toX - headlen * Math.cos(angle - Math.PI / 6),
            toY - headlen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            toX - headlen * Math.cos(angle + Math.PI / 6),
            toY - headlen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    // Clear path
    clearPath(path) {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        // Store affected cells to redraw blockers (use array for compatibility)
        const affectedCells = [];
        
        for (let i = 0; i < path.length - 1; i++) {
            const start = path[i];
            const end = path[i + 1];
            const startRow = Math.floor(start / this.gridSize);
            const startCol = start % this.gridSize;
            const endRow = Math.floor(end / this.gridSize);
            const endCol = end % this.gridSize;
            
            const startX = startCol * this.cellSize + this.cellSize / 2;
            const startY = startRow * this.cellSize + this.cellSize / 2;
            const endX = endCol * this.cellSize + this.cellSize / 2;
            const endY = endRow * this.cellSize + this.cellSize / 2;
            
            const headlen = 7 * this.adaptive;
            const angle = Math.atan2(endY - startY, endX - startX);
            const valCos = Math.cos(angle);
            const valSin = Math.sin(angle);
            
            // Handle edge cases for valCos and valSin
            let adjustedCos = valCos;
            let adjustedSin = valSin;
            if (valCos === -1) {
                adjustedCos = 1;
            }
            if (valSin === -1) {
                adjustedSin = 1;
            }
            
            // Clear arrow area (more precise calculation)
            ctx.fillStyle = 'black';
            ctx.fillRect(
                startX - headlen * adjustedSin,
                startY - headlen * adjustedCos,
                (endX - startX) * adjustedCos + 2 * headlen * adjustedSin,
                (endY - startY) * adjustedSin + 2 * headlen * adjustedCos
            );
            
            // Mark affected cells for redraw (avoid duplicates)
            if (affectedCells.indexOf(start) === -1) {
                affectedCells.push(start);
            }
            if (affectedCells.indexOf(end) === -1) {
                affectedCells.push(end);
            }
            
            // Also check adjacent cells that might be affected by arrow clearance
            // Check cells around the arrow line
            const cellsToCheck = [
                { row: startRow, col: startCol },
                { row: endRow, col: endCol }
            ];
            
            // Add adjacent cells that might be affected
            if (startRow > 0) cellsToCheck.push({ row: startRow - 1, col: startCol });
            if (startRow < this.gridSize - 1) cellsToCheck.push({ row: startRow + 1, col: startCol });
            if (startCol > 0) cellsToCheck.push({ row: startRow, col: startCol - 1 });
            if (startCol < this.gridSize - 1) cellsToCheck.push({ row: startRow, col: startCol + 1 });
            
            if (endRow > 0) cellsToCheck.push({ row: endRow - 1, col: endCol });
            if (endRow < this.gridSize - 1) cellsToCheck.push({ row: endRow + 1, col: endCol });
            if (endCol > 0) cellsToCheck.push({ row: endRow, col: endCol - 1 });
            if (endCol < this.gridSize - 1) cellsToCheck.push({ row: endRow, col: endCol + 1 });
            
            // Add to affected cells
            cellsToCheck.forEach(cell => {
                const cellIndex = cell.row * this.gridSize + cell.col;
                if (affectedCells.indexOf(cellIndex) === -1) {
                    affectedCells.push(cellIndex);
                }
            });
        }
        
        // Redraw blockers in affected cells
        ctx.fillStyle = '#257ae8';
        for (let i = 0; i < affectedCells.length; i++) {
            const cellIndex = affectedCells[i];
            const row = Math.floor(cellIndex / this.gridSize);
            const col = cellIndex % this.gridSize;
            if (this.maze[row] && this.maze[row][col] === 1) {
                ctx.fillRect(
                    col * this.cellSize,
                    row * this.cellSize,
                    this.cellSize,
                    this.cellSize
                );
            }
        }
        
        // Redraw player (only if not on a blocker)
        if (this.maze[this.player.row] && this.maze[this.player.row][this.player.col] !== 1) {
            ctx.fillStyle = 'red';
            ctx.fillRect(
                this.player.col * this.cellSize,
                this.player.row * this.cellSize,
                this.cellSize,
                this.cellSize
            );
        }
        
        // Redraw end (only if not on a blocker)
        if (this.maze[this.endPos.row] && this.maze[this.endPos.row][this.endPos.col] !== 1) {
            ctx.fillStyle = 'green';
            ctx.fillRect(
                this.endPos.col * this.cellSize,
                this.endPos.row * this.cellSize,
                this.cellSize,
                this.cellSize
            );
        }
    }
    
    // Clear path cell
    clearPathCell(startCol, startRow, endCol, endRow) {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        const startX = startCol * this.cellSize + this.cellSize / 2;
        const startY = startRow * this.cellSize + this.cellSize / 2;
        const endX = endCol * this.cellSize + this.cellSize / 2;
        const endY = endRow * this.cellSize + this.cellSize / 2;
        
        const headlen = 7 * this.adaptive;
        const angle = Math.atan2(endY - startY, endX - startX);
        const valCos = Math.cos(angle);
        const valSin = Math.sin(angle);
        
        // Clear arrow area
        ctx.fillStyle = 'black';
        ctx.fillRect(
            startX - headlen * Math.abs(valSin),
            startY - headlen * Math.abs(valCos),
            (endX - startX) * valCos + 2 * headlen * Math.abs(valSin),
            (endY - startY) * valSin + 2 * headlen * Math.abs(valCos)
        );
        
        // Redraw blocker if present at start position
        if (this.maze[startRow] && this.maze[startRow][startCol] === 1) {
            ctx.fillStyle = '#257ae8';
            ctx.fillRect(
                startCol * this.cellSize,
                startRow * this.cellSize,
                this.cellSize,
                this.cellSize
            );
        }
        
        // Redraw blocker if present at end position
        if (this.maze[endRow] && this.maze[endRow][endCol] === 1) {
            ctx.fillStyle = '#257ae8';
            ctx.fillRect(
                endCol * this.cellSize,
                endRow * this.cellSize,
                this.cellSize,
                this.cellSize
            );
        }
        
        // Redraw player at new position
        ctx.fillStyle = 'red';
        ctx.fillRect(
            endCol * this.cellSize,
            endRow * this.cellSize,
            this.cellSize,
            this.cellSize
        );
    }
    
    // Toggle pause
    togglePause() {
        if (this.isGameOver) return;
        
        if (!this.pauseClicked) {
            this.pauseClicked = true;
            this.state = GAME_STATE.PAUSED;
            this.clearTimer();
            // Reset pause seconds and immediately show countdown
            this.pauseSeconds = PAUSE_DURATION;
            this.pauseCountdown(); // Call immediately, then set interval
            this.pauseTimer = setInterval(() => {
                this.pauseCountdown();
            }, 1000);
        }
    }
    
    // Pause countdown (called immediately and then every second)
    pauseCountdown() {
        if (this.isGameOver) {
            if (this.pauseTimer) {
                clearInterval(this.pauseTimer);
            }
            return;
        }
        
        const timePauseBtn = document.getElementById('timePauseBtn');
        
        if (this.pauseSeconds >= 0) {
            // Show countdown
            if (timePauseBtn) {
                timePauseBtn.textContent = `Paused (${this.pauseSeconds}s)`;
                timePauseBtn.style.fontSize = `${Math.floor(15 * this.adaptive)}px`;
                timePauseBtn.style.background = 'red';
            }
            this.pauseSeconds--;
        } else {
            // Resume game
            if (timePauseBtn) {
                timePauseBtn.textContent = 'Pause';
                timePauseBtn.style.fontSize = `${Math.floor(17 * this.adaptive)}px`;
                timePauseBtn.style.background = '#00BB00';
            }
            this.pauseClicked = false;
            this.pauseSeconds = PAUSE_DURATION;
            this.state = GAME_STATE.PLAYING;
            if (this.pauseTimer) {
                clearInterval(this.pauseTimer);
                this.pauseTimer = null;
            }
            this.startTimer();
        }
    }
    
    // Start game timer
    startTimer() {
        this.clearTimer();
        
        const timerEl = document.getElementById('timer');
        
        this.gameTimer = setInterval(() => {
            if (this.isGameOver || this.state === GAME_STATE.PAUSED) {
                return;
            }
            
            if (this.remainingTime >= 0) {
                if (timerEl) {
                    timerEl.textContent = `${this.remainingTime}s`;
                }
                this.remainingTime--;
            } else {
                this.gameOver();
            }
        }, 1000);
    }
    
    // Clear timer
    clearTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }
    
    // Win game
    win() {
        this.clearTimer();
        this.isGameOver = true;
        this.state = GAME_STATE.WON;
        this.enableScroll();
        
        const gameover = document.getElementById('gameover');
        const overmsg = document.getElementById('overmsg');
        const restartbtn = document.getElementById('restartbtn');
        
        if (overmsg) {
            overmsg.textContent = 'You win!';
            overmsg.style.fontSize = `${Math.floor(36 * this.adaptive)}px`;
        }
        
        if (gameover) {
            gameover.style.display = 'flex';
        }
    }
    
    // Game over
    gameOver() {
        this.clearTimer();
        this.isGameOver = true;
        this.state = GAME_STATE.GAME_OVER;
        this.enableScroll();
        
        const gameover = document.getElementById('gameover');
        const overmsg = document.getElementById('overmsg');
        
        if (overmsg) {
            overmsg.textContent = 'You loss :(';
            overmsg.style.fontSize = `${Math.floor(36 * this.adaptive)}px`;
        }
        
        if (gameover) {
            gameover.style.display = 'flex';
        }
    }
    
    // Restart game
    async restart() {
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        // Reset state
        this.isGameOver = false;
        this.state = GAME_STATE.PLAYING;
        this.remainingTime = INITIAL_TIME;
        this.pauseSeconds = PAUSE_DURATION;
        this.pauseClicked = false;
        this.player = { row: 0, col: 0 };
        this.shortestPath = null;
        
        // Clear timers
        this.clearTimer();
        if (this.pauseTimer) {
            clearInterval(this.pauseTimer);
            this.pauseTimer = null;
        }
        if (this.pathTimer) {
            clearTimeout(this.pathTimer);
            this.pathTimer = null;
        }
        
        // Hide game over overlay
        const gameover = document.getElementById('gameover');
        if (gameover) {
            gameover.style.display = 'none';
        }
        
        // Reset pause button
        const timePauseBtn = document.getElementById('timePauseBtn');
        if (timePauseBtn) {
            timePauseBtn.textContent = 'Pause';
            timePauseBtn.style.fontSize = `${Math.floor(17 * this.adaptive)}px`;
            timePauseBtn.style.background = '#00BB00';
        }
        
        // Reset timer display
        const timerEl = document.getElementById('timer');
        if (timerEl) {
            timerEl.textContent = `${INITIAL_TIME}s`;
        }
        
        // Reload game data if needed
        if (!this.maps || this.maps.length === 0) {
            await this.loadGameData();
        }
        
        // Get current map ID from chrome.storage.local (this should be the next map to use)
        const mapIdToUse = await this.getMapIdAsync();
        
        let validMapId = mapIdToUse;
        if (validMapId === null || isNaN(validMapId)) {
            // Not found or invalid, start from map 0
            validMapId = 0;
        }
        
        // Ensure mapId is within valid range
        if (validMapId < 0 || validMapId >= this.maps.length) {
            validMapId = 0;
        }
        
        // Redraw maze with the map
        this.drawMaze(this.maps[validMapId]);
        
        // Update map ID for next game (prepare next map)
        this.currentMapId = (validMapId + 1) % this.maps.length;
        this.saveMapId(this.currentMapId);
        
        // Start timer
        this.startTimer();
        
        // Re-enable scroll prevention
        this.disableScroll();
    }
    
    // Save map ID to chrome.storage.local
    saveMapId(mapId) {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ [MAP_ID_STORAGE_KEY]: mapId }, () => {
                    if (chrome.runtime.lastError) {
                        // Fallback to localStorage
                        try {
                            localStorage.setItem(MAP_ID_STORAGE_KEY, mapId.toString());
                        } catch (e) {
                            // Failed to save to localStorage
                        }
                    }
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                try {
                    localStorage.setItem(MAP_ID_STORAGE_KEY, mapId.toString());
                } catch (e) {
                    // Failed to save to localStorage
                }
            }
        } catch (e) {
            // Failed to save map ID
        }
    }
    
    // Get map ID from chrome.storage.local (async)
    getMapIdAsync() {
        return new Promise((resolve) => {
            try {
                if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                    chrome.storage.local.get([MAP_ID_STORAGE_KEY], (result) => {
                        if (chrome.runtime.lastError) {
                            // Fallback to localStorage
                            const stored = this.getMapIdFromLocalStorage();
                            resolve(stored);
                            return;
                        }
                        
                        if (result[MAP_ID_STORAGE_KEY] !== undefined && result[MAP_ID_STORAGE_KEY] !== null) {
                            const value = typeof result[MAP_ID_STORAGE_KEY] === 'number' 
                                ? result[MAP_ID_STORAGE_KEY] 
                                : parseInt(result[MAP_ID_STORAGE_KEY], 10);
                            if (!isNaN(value)) {
                                resolve(value);
                                return;
                            }
                        }
                        
                        // Not found in chrome.storage, try localStorage
                        const stored = this.getMapIdFromLocalStorage();
                        resolve(stored);
                    });
                } else {
                    // Fallback to localStorage if chrome.storage is not available
                    const stored = this.getMapIdFromLocalStorage();
                    resolve(stored);
                }
            } catch (e) {
                resolve(null);
            }
        });
    }
    
    // Get map ID from localStorage (synchronous fallback)
    getMapIdFromLocalStorage() {
        try {
            const stored = localStorage.getItem(MAP_ID_STORAGE_KEY);
            if (stored !== null) {
                const value = parseInt(stored, 10);
                if (!isNaN(value)) {
                    return value;
                }
            }
        } catch (e) {
            // Failed to read from localStorage
        }
        
        return null;
    }
    
    // Scroll management
    disableScroll() {
        this.preventScrollKeysBound = this.preventScrollKeys.bind(this);
        window.addEventListener('keydown', this.preventScrollKeysBound, { passive: false });
    }
    
    enableScroll() {
        setTimeout(() => {
            if (this.preventScrollKeysBound) {
                window.removeEventListener('keydown', this.preventScrollKeysBound);
            }
        }, 500);
    }
    
    preventScrollKeys(event) {
        const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D', ' '];
        if (keys.includes(event.key)) {
            event.preventDefault();
        }
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new BarcodeMazeGame();
    });
} else {
    new BarcodeMazeGame();
}

