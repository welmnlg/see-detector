/*
 * Drag Maze Pro Game - Version 2
 * Rewritten using ES6 classes and different code structure
 * Different code structure while maintaining same functionality
 */

// Resource path configuration
// Use the getGameResource function from path-replacement.js if available
// Otherwise, set up a fallback implementation
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
const GAME_DEFAULT_WIDTH = 402;
const GAME_DEFAULT_HEIGHT = 490;
const PADDLE_POSITION_STEP = 80; // SIZE / 5
const PADDLE_COUNT_MULTIPLIER = 5;
const COLOR_TOLERANCE = 3;
const WIN_COLOR = { r: 247, g: 146, b: 30 }; // Orange
const FAIL_COLOR = { r: 42, g: 171, b: 228 }; // Blue

// Paddle class
class Paddle {
    constructor(x, y, height, speed, direction) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.speed = speed;
        this.direction = direction; // 1 for down, -1 for up
        this.element = null;
    }
    
    // Create DOM element
    createElement(container) {
        this.element = document.createElement('div');
        this.element.className = 'paddle';
        this.element.style.position = 'absolute';
        this.element.style.width = '10px';
        this.element.style.height = `${this.height}px`;
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.backgroundColor = '#A1662F';
        container.appendChild(this.element);
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
            right: this.x + 10,
            bottom: this.y + this.height
        };
    }
}

// Player class (dot)
class Player {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.element = null;
    }
    
    // Create DOM element
    createElement() {
        this.element = document.getElementById('dot');
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

// Drag Maze Pro Game class
class DragMazeProGame {
    constructor() {
        // Game state
        this.isGameActive = false;
        this.isDragging = false;
        this.animationFrameId = null;
        
        // Screen dimensions
        this.screenWidth = 0;
        this.screenHeight = 0;
        this.gameSize = 0;
        this.adaptive = 0.8;
        this.modSize = 0;
        this.offset = 0;
        
        // Game elements
        this.gamebox = null;
        this.canvas = null;
        this.ctx = null;
        this.player = null;
        this.paddles = [];
        this.paddlePositions = [];
        
        // Game data
        this.gameParams = null;
        this.maps = null;
        this.currentMapId = 0;
        
        // Timer
        this.timer = null;
        this.gameTime = 0;
        
        // UI elements
        this.topbar = null;
        this.timerBox = null;
        this.restartBtn = null;
        this.tryNewBtn = null;
        this.overMsg = null;
        
        // Initialize
        this.init();
    }
    
    // Initialize game
    init() {
        // Check screen width
        if (window.innerWidth < 768) {
            return;
        }
        
        // Calculate dimensions
        this.calculateDimensions();
        
        // Setup game area
        this.setupGameArea();
        
        // Setup UI
        this.setupUI();
        
        // Create player
        this.createPlayer();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load and start game
        this.loadAndStartGame();
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
        } else {
            this.adaptive = 0.8;
        }
        
        this.offset = Math.floor(30 * this.adaptive);
        this.sidebarWidth = Math.floor(85 * this.adaptive) + 40 * this.adaptive;
        
        // Match classic-maze gamebox height: expand gameSize to fill
        const classicCanvasH = Math.floor(30 * this.adaptive) * 14 + Math.floor(15 * this.adaptive) * 2;
        const classicGameboxH = classicCanvasH + 2 + Math.floor(30 * this.adaptive);
        this.gameSize = Math.max(Math.floor(400 * this.adaptive), classicGameboxH - this.offset);
    }
    
    // Setup game area
    setupGameArea() {
        this.gamebox = document.getElementById('gamebox');
        if (!this.gamebox) return;
        
        // Set gamebox size (canvas + sidebar)
        this.gamebox.style.width = `${this.gameSize + this.sidebarWidth + 2}px`;
        this.gamebox.style.height = `${this.gameSize + this.offset}px`;
        
        // Setup canvas
        this.canvas = document.getElementById('canvas');
        if (this.canvas) {
            this.canvas.width = this.gameSize;
            this.canvas.height = this.gameSize;
            this.ctx = this.canvas.getContext('2d', {
                willReadFrequently: true
            });
        }
        
        // Calculate paddle positions
        this.paddlePositions = [];
        const dist = Math.floor(this.gameSize / 5);
        for (let i = dist; i <= this.gameSize - 20; i += dist) {
            this.paddlePositions.push(i);
        }
    }
    
    // Setup UI
    setupUI() {
        this.topbar = document.getElementById('topbar');
        this.timerBox = document.getElementById('timer');
        this.restartBtn = document.getElementById('restart');
        this.tryNewBtn = document.getElementById('trynew');
        this.overMsg = document.getElementById('overmsg');
        
        // Set topbar style - width matches canvas area (excludes sidebar)
        if (this.topbar) {
            this.topbar.style.height = `${Math.floor(30 * this.adaptive)}px`;
            this.topbar.style.fontSize = `${Math.floor(18 * this.adaptive)}px`;
            this.topbar.style.width = `${this.gameSize}px`;
        }
        
        // Set restart button style (now in sidebar, like classic-maze buttons)
        if (this.restartBtn) {
            this.restartBtn.style.width = `${Math.floor(100 * this.adaptive)}px`;
            this.restartBtn.style.height = `${Math.floor(28 * this.adaptive)}px`;
            this.restartBtn.style.fontSize = `${Math.floor(17 * this.adaptive)}px`;
        }
        
        // Setup sidebar
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.style.width = `${this.sidebarWidth}px`;
            sidebar.style.height = `${this.gameSize}px`;
        }
        
        const featTxt = document.getElementById('featTxt');
        if (featTxt) {
            featTxt.style.fontSize = `${Math.floor(13 * this.adaptive)}px`;
        }
        
        // Set try new button style (centered in game area)
        if (this.tryNewBtn) {
            this.tryNewBtn.style.padding = `${Math.floor(8 * this.adaptive)}px ${Math.floor(20 * this.adaptive)}px`;
            this.tryNewBtn.style.fontSize = `${Math.floor(24 * this.adaptive)}px`;
            this.tryNewBtn.style.top = `${Math.floor(this.gameSize / 2 + 80 * this.adaptive)}px`;
            this.tryNewBtn.style.display = 'none';
        }
        
        // Hide overlay message initially and constrain to canvas width
        if (this.overMsg) {
            this.overMsg.style.display = 'none';
            this.overMsg.style.width = `${this.gameSize}px`;
            this.overMsg.className = '';
        }
    }
    
    // Create player
    createPlayer() {
        const dotSize = Math.floor(10 * this.adaptive);
        const dotElement = document.getElementById('dot');
        if (dotElement) {
            dotElement.style.width = `${dotSize}px`;
            dotElement.style.height = `${dotSize}px`;
            this.player = new Player(0, 0, dotSize);
            this.player.element = dotElement;
            // Prevent text selection
            dotElement.onselectstart = () => false;
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Restart button
        if (this.restartBtn) {
            this.restartBtn.addEventListener('click', () => {
                this.restart();
            });
        }
        
        // Try new button
        if (this.tryNewBtn) {
            this.tryNewBtn.addEventListener('click', () => {
                this.loadNewMap();
            });
        }
    }
    
    // Load game data
    async loadGameData() {
        const storedData = localStorage.getItem('drag-maps');
        if (storedData) {
            try {
                return JSON.parse(storedData);
            } catch (e) {
                // If parsing fails, fetch from server
            }
        }
        
        // Fetch from server
        try {
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
            
            let resourceUrl = window.getGameResource('data/drag-maps.json');
            
            // Ensure the URL is absolute
            if (!resourceUrl.startsWith('http://') && !resourceUrl.startsWith('https://') && 
                !resourceUrl.startsWith('chrome-extension://') && !resourceUrl.startsWith('data:') &&
                !resourceUrl.startsWith('blob:')) {
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
                throw new Error(`Failed to fetch game data: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            localStorage.setItem('drag-maps', JSON.stringify(data));
            return data;
        } catch (e) {
            return null;
        }
    }
    
    // Get cookie
    getCookie(name) {
        const cookieArr = document.cookie.split(';');
        for (let i = 0; i < cookieArr.length; i++) {
            const cookiePair = cookieArr[i].trim().split('=');
            if (cookiePair[0] === name) {
                return parseInt(cookiePair[1]);
            }
        }
        return null;
    }
    
    // Set cookie
    setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = `; expires=${date.toUTCString()}`;
        }
        document.cookie = `${name}=${value}${expires}; path=/;`;
    }
    
    // Load and start game
    async loadAndStartGame() {
        this.maps = await this.loadGameData();
        if (!this.maps) {
            return;
        }
        
        // Get map ID from cookie or random
        this.currentMapId = this.getCookie('drag-mapid');
        if (this.currentMapId === null) {
            this.currentMapId = this.getRandomInt(0, Math.min(100, this.maps.length - 1));
        }
        
        this.startGame(true);
    }
    
    // Start game
    startGame(loadNewMap = false, skipAdaptiveUpdate = false) {
        // Update adaptive size based on current window size (unless skipped)
        if (!skipAdaptiveUpdate) {
            this.updateAdaptiveSize();
        }
        
        // Clear previous state
        this.stopGame();
        
        // Hide overlay message
        if (this.overMsg) {
            this.overMsg.style.display = 'none';
            this.overMsg.className = '';
            // Clear content using textContent instead of innerHTML
            this.overMsg.textContent = '';
            // Also remove all child elements
            while (this.overMsg.firstChild) {
                this.overMsg.removeChild(this.overMsg.firstChild);
            }
        }
        
        // Hide try new button
        if (this.tryNewBtn) {
            this.tryNewBtn.style.display = 'none';
        }
        
        // Reset timer
        this.gameTime = 0;
        if (this.timerBox) {
            this.timerBox.textContent = '0s';
        }
        
        // Clear paddles
        this.clearPaddles();
        
        if (loadNewMap) {
            // Load new map
            if (this.maps && this.maps.length > 0) {
                this.gameParams = this.maps[this.currentMapId];
                this.currentMapId = (this.currentMapId + 1) % this.maps.length;
                this.setCookie('drag-mapid', this.currentMapId, 365);
                
                // Load map image
                this.loadMapImage();
            }
        } else {
            // Use existing map
            if (this.gameParams) {
                this.setPlayerPosition();
                this.createPaddles();
                this.startGameLoop();
            }
        }
    }
    
    // Load map image
    async loadMapImage() {
        const img = new Image();
        // No need for crossOrigin when loading from local folder
        img.onload = () => {
            if (this.ctx) {
                this.ctx.drawImage(img, 0, 0, this.gameSize, this.gameSize);
            }
            this.setPlayerPosition();
            this.createPaddles();
            this.startGameLoop();
        };
        img.onerror = () => {
            // Try to reload with a different method
            this.retryLoadMapImage(img);
        };
        
        // Get resource URL with retry logic
        let resourceUrl = window.getGameResource('images/maps/' + this.gameParams['mapsrc']);
        
        // If getGameResource returned a relative path, try to construct absolute URL
        if (!resourceUrl.startsWith('http://') && !resourceUrl.startsWith('https://') && 
            !resourceUrl.startsWith('chrome-extension://') && !resourceUrl.startsWith('data:') &&
            !resourceUrl.startsWith('blob:')) {
            // Wait a bit for __gameResourceBase to be set
            let waitCount = 0;
            const maxWait = 10; // Wait up to 500ms
            while (!window.__gameResourceBase || 
                   (!window.__gameResourceBase.startsWith('chrome-extension://') &&
                    !window.__gameResourceBase.startsWith('http://') &&
                    !window.__gameResourceBase.startsWith('https://'))) {
                if (waitCount >= maxWait) {
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 50));
                waitCount++;
                // Try getGameResource again
                resourceUrl = window.getGameResource('images/maps/' + this.gameParams['mapsrc']);
                if (resourceUrl.startsWith('http://') || resourceUrl.startsWith('https://') || 
                    resourceUrl.startsWith('chrome-extension://')) {
                    break;
                }
            }
            
            // If still relative, try to construct absolute URL
            if (!resourceUrl.startsWith('http://') && !resourceUrl.startsWith('https://') && 
                !resourceUrl.startsWith('chrome-extension://') && !resourceUrl.startsWith('data:') &&
                !resourceUrl.startsWith('blob:')) {
                let baseUrl = null;
                
                // Try to get base URL from various sources (similar to drag-maze.js)
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
                
                if (baseUrl && (baseUrl.startsWith('chrome-extension://') ||
                               baseUrl.startsWith('http://') ||
                               baseUrl.startsWith('https://'))) {
                    const cleanPath = resourceUrl.replace(/^\.\.?\//, '');
                    resourceUrl = baseUrl + cleanPath;
                    // Cache it
                    if (!window.__gameResourceBase) {
                        window.__gameResourceBase = baseUrl;
                    }
                }
            }
        }
        
        // Load from local folder using getGameResource
        img.src = resourceUrl;
    }
    
    // Retry loading map image with alternative method
    retryLoadMapImage(img) {
        // Try to construct URL directly
        const imagePath = 'images/maps/' + this.gameParams['mapsrc'];
        let baseUrl = window.__gameResourceBase;
        
        if (!baseUrl && window.parent && window.parent !== window) {
            try {
                baseUrl = window.parent.releasesBaseUrl || window.parent.__gameResourceBase;
            } catch (e) {
                // Cannot access
            }
        }
        
        if (baseUrl && (baseUrl.startsWith('chrome-extension://') ||
                       baseUrl.startsWith('http://') ||
                       baseUrl.startsWith('https://'))) {
            const cleanPath = imagePath.replace(/^\.\.?\//, '');
            img.src = baseUrl + cleanPath;
        }
    }
    
    // Set player position (scale by gameSize/400 since the maze image is stretched to gameSize)
    setPlayerPosition() {
        if (this.player && this.gameParams) {
            const scale = this.gameSize / 400;
            this.player.x = Math.floor(this.gameParams['initpos'][1] * scale) - this.player.size / 2;
            this.player.y = Math.floor(this.gameParams['initpos'][0] * scale) - this.player.size / 2;
            this.player.updatePosition();
        }
    }
    
    // Create paddles
    createPaddles() {
        this.clearPaddles();
        
        const paddlesContainer = document.getElementById('paddles');
        if (!paddlesContainer) return;
        
        const paddleCount = this.paddlePositions.length * PADDLE_COUNT_MULTIPLIER;
        const gameHeight = this.gameSize;
        
        for (let i = 0; i < paddleCount; i++) {
            const height = Math.floor(Math.random() * 31) + 30;
            const xPos = this.paddlePositions[i % this.paddlePositions.length];
            const yPos = this.getRandomInt(0, gameHeight - height);
            const speed = (Math.random() * 0.8) + 0.8;
            const direction = Math.random() < 0.5 ? 1 : -1;
            
            const paddle = new Paddle(xPos, yPos, height, speed, direction);
            paddle.createElement(paddlesContainer);
            this.paddles.push(paddle);
        }
    }
    
    // Clear paddles
    clearPaddles() {
        this.paddles.forEach(paddle => {
            if (paddle.element) {
                paddle.element.remove();
            }
        });
        this.paddles = [];
        
        const paddlesContainer = document.getElementById('paddles');
        if (paddlesContainer) {
            // Clear content using removeChild instead of innerHTML
            while (paddlesContainer.firstChild) {
                paddlesContainer.removeChild(paddlesContainer.firstChild);
            }
        }
    }
    
    // Start game loop
    startGameLoop() {
        this.isGameActive = true;
        
        // Start timer
        this.timer = setInterval(() => {
            this.gameTime++;
            if (this.timerBox) {
                this.timerBox.textContent = `${this.gameTime}s`;
            }
        }, 1000);
        
        // Start paddle movement
        this.movePaddles();
        
        // Setup drag handlers
        this.setupDragHandlers();
        
    }
    
    // Setup drag handlers
    setupDragHandlers() {
        if (!this.player || !this.player.element) return;
        
        // Mouse down
        document.onmousedown = (e) => {
            if (this.isGameActive && e.button === 0 && e.target === this.player.element) {
                this.isDragging = true;
            }
        };
        
        // Mouse move
        document.onmousemove = (e) => {
            if (this.isDragging && this.isGameActive) {
                const rect = this.gamebox.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                // Constrain position
                let newX = mouseX;
                let newY = mouseY;
                
                if (newX < 0) newX = 0;
                else if (newX > this.gameSize) newX = this.gameSize;
                
                if (newY < this.offset) newY = this.offset;
                else if (newY > this.gameSize + this.offset) newY = this.gameSize + this.offset;
                
                // Update player position (centered)
                this.player.x = newX - this.player.size / 2;
                this.player.y = newY - this.offset - this.player.size / 2;
                this.player.updatePosition();
                
                // Check color at multiple points
                const canvasX = newX;
                const canvasY = newY - this.offset;
                const dotSize = this.player.size;
                
                const centerColor = this.getColorAt(canvasX, canvasY);
                const topColor = this.getColorAt(canvasX, canvasY - dotSize / 2);
                const bottomColor = this.getColorAt(canvasX, canvasY + dotSize / 2);
                const leftColor = this.getColorAt(canvasX - dotSize / 2, canvasY);
                const rightColor = this.getColorAt(canvasX + dotSize / 2, canvasY);
                
                // Check for failure (blue)
                if (this.isFailColor(topColor) || this.isFailColor(bottomColor) || 
                    this.isFailColor(leftColor) || this.isFailColor(rightColor)) {
                    this.gameOver('fail', 0);
                    return;
                }
                
                // Check for success (orange)
                if (this.isWinColor(centerColor)) {
                    this.gameWin();
                    return;
                }
            }
        };
        
        // Mouse up
        document.onmouseup = () => {
            this.isDragging = false;
        };
    }
    
    // Get color at canvas position
    getColorAt(x, y) {
        if (!this.ctx) return null;
        
        try {
            const imageData = this.ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1);
            return {
                r: imageData.data[0],
                g: imageData.data[1],
                b: imageData.data[2]
            };
        } catch (e) {
            return null;
        }
    }
    
    // Check if color matches win color
    isWinColor(color) {
        if (!color) return false;
        return (
            Math.abs(color.r - WIN_COLOR.r) < COLOR_TOLERANCE &&
            Math.abs(color.g - WIN_COLOR.g) < COLOR_TOLERANCE &&
            Math.abs(color.b - WIN_COLOR.b) < COLOR_TOLERANCE
        );
    }
    
    // Check if color matches fail color
    isFailColor(color) {
        if (!color) return false;
        return (
            Math.abs(color.r - FAIL_COLOR.r) < COLOR_TOLERANCE &&
            Math.abs(color.g - FAIL_COLOR.g) < COLOR_TOLERANCE &&
            Math.abs(color.b - FAIL_COLOR.b) < COLOR_TOLERANCE
        );
    }
    
    // Move paddles
    movePaddles() {
        if (!this.isGameActive) return;
        
        const gameHeight = this.gameSize;
        
        for (const paddle of this.paddles) {
            paddle.update(gameHeight);
            
            // Check collision with player
            const playerBounds = this.player.getBounds();
            const paddleBounds = paddle.getBounds();
            if (this.isColliding(playerBounds, paddleBounds)) {
                this.gameOver('fail', 2);
                return;
            }
        }
        
        this.animationFrameId = requestAnimationFrame(() => {
            this.movePaddles();
        });
    }
    
    // Check if two rectangles are colliding
    isColliding(rect1, rect2) {
        return !(
            rect1.top > rect2.bottom ||
            rect1.bottom < rect2.top ||
            rect1.left > rect2.right ||
            rect1.right < rect2.left
        );
    }
    
    // Game over
    gameOver(status, type) {
        this.stopGame();
        this.showMessage(status, type);
    }
    
    // Game win
    gameWin() {
        this.stopGame();
        this.showMessage('success', 0);
    }
    
    // Stop game
    stopGame() {
        this.isGameActive = false;
        this.isDragging = false;
        
        // Clear timer
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Stop animation
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Remove drag handlers
        document.onmousedown = null;
        document.onmousemove = null;
        document.onmouseup = null;
    }
    
    // Show message
    showMessage(status, type) {
        if (!this.overMsg) return;
        
        this.overMsg.style.display = 'block';
        this.overMsg.style.fontSize = `${Math.floor(40 * this.adaptive)}px`;
        this.overMsg.className = status;
        
        // Clear existing content
        while (this.overMsg.firstChild) {
            this.overMsg.removeChild(this.overMsg.firstChild);
        }
        
        // Create message content using DOM methods instead of innerHTML
        const fontSize = Math.floor(28 * this.adaptive);
        
        if (status === 'success') {
            const congratsText = document.createTextNode('Congratulations!');
            this.overMsg.appendChild(congratsText);
            
            const br1 = document.createElement('br');
            this.overMsg.appendChild(br1);
            
            const span = document.createElement('span');
            span.style.fontSize = `${fontSize}px`;
            span.textContent = `Beat in ${this.gameTime}s!`;
            this.overMsg.appendChild(span);
        } else {
            const failMsg = type === 0 ? 'Touch Border' : 'Touch Paddle';
            const touchText = document.createTextNode(failMsg);
            this.overMsg.appendChild(touchText);
            
            const br1 = document.createElement('br');
            this.overMsg.appendChild(br1);
            
            const span = document.createElement('span');
            span.style.fontSize = `${fontSize}px`;
            span.textContent = 'Click Restart Button!';
            this.overMsg.appendChild(span);
        }
        
        this.overMsg.classList.add('full');
        
        // Show try new button
        if (this.tryNewBtn) {
            this.tryNewBtn.style.display = 'flex';
        }
    }
    
    // Restart current map
    restart() {
        if (this.tryNewBtn) {
            this.tryNewBtn.style.display = 'none';
        }
        // Restart game without updating adaptive size (keep current interface size)
        this.startGame(false, true);
    }
    
    // Load new map
    loadNewMap() {
        // Hide try new button
        if (this.tryNewBtn) {
            this.tryNewBtn.style.display = 'none';
        }
        
        // Load and start new map (without page reload)
        if (this.maps && this.maps.length > 0) {
            // Get next map ID
            this.currentMapId = this.getCookie('drag-mapid');
            if (this.currentMapId === null) {
                this.currentMapId = this.getRandomInt(0, Math.min(100, this.maps.length - 1));
            }
            
            // Start game with new map
            this.startGame(true);
        }
    }
    
    // Helper: Get random integer
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DragMazeProGame();
    });
} else {
    new DragMazeProGame();
}

