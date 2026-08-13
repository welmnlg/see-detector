/*
 * Drag Maze Game - Version 2
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
                const parentBase = window.parent.__gameResourceBase;
                if (parentBase && (parentBase.startsWith('chrome-extension://') || 
                    parentBase.startsWith('http://') || parentBase.startsWith('https://'))) {
                    window.__gameResourceBase = parentBase;
                    return parentBase;
                }
            }
        } catch (e) {
            // Cross-origin or not accessible
        }
        
        // Last resort: try to construct from current location (may not work in blob: URLs)
        try {
            const currentUrl = window.location.href;
            if (currentUrl.startsWith('chrome-extension://')) {
                const urlObj = new URL(currentUrl);
                const pathParts = urlObj.pathname.split('/').filter(p => p);
                // Find 'games' directory and use that as base
                const gamesIndex = pathParts.indexOf('games');
                if (gamesIndex >= 0) {
                    const baseUrl = `${urlObj.origin}/${pathParts.slice(0, gamesIndex + 1).join('/')}/`;
                    window.__gameResourceBase = baseUrl;
                    return baseUrl;
                }
            }
        } catch (e) {
            // URL parsing failed (e.g., blob: URL)
        }
        
        // Final fallback: try one more time with chrome.runtime (should always work in extension context)
        // This is the most reliable method and should always be available
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
                // Use chrome.runtime.getURL or extract from script src (no hardcoded path)
                let baseUrl = null;
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
                window.__gameResourceBase = baseUrl;
                return baseUrl;
            }
        } catch (e) {
            // chrome.runtime not available (should not happen in extension context)
        }
        
        // If we still don't have a valid base URL, return null instead of throwing
        // This allows getGameResource to handle it gracefully
        return null;
    }
    
    // Only set up if getGameResource doesn't exist or needs to be fixed
    if (typeof window.getGameResource !== 'function') {
        // Don't call getBaseUrl() immediately - let it be called lazily when needed
        // This allows path-replacement.js time to set __gameResourceBase
        
        window.getGameResource = function(relativePath) {
            // If already absolute, return as is
            if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || 
                relativePath.startsWith('chrome-extension://') || relativePath.startsWith('data:') ||
                relativePath.startsWith('blob:')) {
                return relativePath;
            }
            
            // Clean the path
            const cleanPath = relativePath.replace(/^\.\.?\//, '');
            
            // Helper function to get base URL with retry
            function getBaseUrlWithRetry(maxRetries = 5, delay = 50) {
                let base = getBaseUrl();
                
                // If base is valid, return it
                if (base && (base.startsWith('chrome-extension://') || 
                             base.startsWith('http://') || 
                             base.startsWith('https://'))) {
                    return base;
                }
                
                // Try to get from parent window
                try {
                    if (window.parent && window.parent !== window) {
                        // Try multiple methods to get base URL from parent
                        if (window.parent.releasesBaseUrl) {
                            base = window.parent.releasesBaseUrl;
                            if (base && (base.startsWith('chrome-extension://') || 
                                         base.startsWith('http://') || 
                                         base.startsWith('https://'))) {
                                window.__gameResourceBase = base;
                                return base;
                            }
                        }
                        if (window.parent.__gameResourceBase) {
                            base = window.parent.__gameResourceBase;
                            if (base && (base.startsWith('chrome-extension://') || 
                                         base.startsWith('http://') || 
                                         base.startsWith('https://'))) {
                                window.__gameResourceBase = base;
                                return base;
                            }
                        }
                    }
                } catch (e) {
                    // Cannot access parent
                }
                
                // Try chrome.runtime directly
                try {
                    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
                        // Use chrome.runtime.getURL or extract from script src (no hardcoded path)
                        try {
                            if (chrome.runtime.getURL) {
                                base = chrome.runtime.getURL('games/');
                                if (base && !base.endsWith('/')) {
                                    base += '/';
                                }
                            }
                        } catch (e) {
                            // chrome.runtime.getURL not available
                        }
                        if (!base) {
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
                                            base = `${urlObj.origin}/${pathParts.slice(0, gamesIndex + 1).join('/')}/`;
                                            break;
                                        }
                                    }
                                }
                            } catch (e) {
                                // Cannot extract from script src
                            }
                        }
                        window.__gameResourceBase = base;
                        return base;
                    }
                } catch (e) {
                    // chrome.runtime not available
                }
                
                // If still no base, try to extract from script src
                if (!base) {
                    try {
                        const scripts = document.getElementsByTagName('script');
                        for (let i = 0; i < scripts.length; i++) {
                            const script = scripts[i];
                            if (script.src && script.src.startsWith('chrome-extension://')) {
                                const urlObj = new URL(script.src);
                                const pathParts = urlObj.pathname.split('/').filter(p => p);
                                const gamesIndex = pathParts.indexOf('games');
                                if (gamesIndex >= 0) {
                                    base = `${urlObj.origin}/${pathParts.slice(0, gamesIndex + 1).join('/')}/`;
                                    window.__gameResourceBase = base;
                                    return base;
                                }
                            }
                        }
                    } catch (e) {
                        // Cannot access scripts
                    }
                }
                
                return base;
            }
            
            // Get base URL (with retry logic)
            let base = getBaseUrlWithRetry();
            
            // If still no valid base, wait a bit and try again (synchronous wait for small delays)
            if (!base || (!base.startsWith('chrome-extension://') && 
                         !base.startsWith('http://') && 
                         !base.startsWith('https://'))) {
                // Try waiting a short time (synchronous wait, max 200ms)
                let waited = 0;
                const maxWait = 200;
                while (waited < maxWait) {
                    const start = Date.now();
                    // Synchronous wait (not ideal, but necessary)
                    while (Date.now() - start < 50) {
                        // Wait 50ms
                    }
                    waited += 50;
                    
                    base = getBaseUrlWithRetry();
                    if (base && (base.startsWith('chrome-extension://') || 
                                 base.startsWith('http://') || 
                                 base.startsWith('https://'))) {
                        break;
                    }
                }
            }
            
            // If we still don't have a valid base, return relative path
            // The caller (like loadGameData or loadMapImage) should handle it
            if (!base || (!base.startsWith('chrome-extension://') && 
                         !base.startsWith('http://') && 
                         !base.startsWith('https://'))) {
                return relativePath;
            }
            
            // Construct full URL
            let fullUrl = base + cleanPath;
            
            // Ensure it's a valid absolute URL
            try {
                new URL(fullUrl);
                return fullUrl;
            } catch (e) {
                // If URL construction failed, try to fix it
                // Try one more time with chrome.runtime
                try {
                    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
                        // Use chrome.runtime.getURL (no hardcoded path)
                        try {
                            if (chrome.runtime.getURL) {
                                fullUrl = chrome.runtime.getURL(`games/${cleanPath}`);
                            }
                        } catch (e) {
                            // chrome.runtime.getURL not available
                        }
                        if (!fullUrl) {
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
                                            fullUrl = `${urlObj.origin}/${pathParts.slice(0, gamesIndex + 1).join('/')}/${cleanPath}`;
                                            break;
                                        }
                                    }
                                }
                            } catch (e) {
                                // Cannot extract from script src
                            }
                        }
                        new URL(fullUrl); // Validate
                        return fullUrl;
                    }
                } catch (e2) {
                    // Still failed
                }
                // Return relative path as last resort
                return relativePath;
            }
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
                const cleanPath = result.replace(/^\.\.?\//, '');
                return base + cleanPath;
            }
            return result;
        };
    }
})();

// Game constants
const GAME_DEFAULT_WIDTH = 402;
const GAME_DEFAULT_HEIGHT = 490;
const COLOR_TOLERANCE = 3;
const WIN_COLOR = { r: 247, g: 146, b: 30 }; // Orange
const FAIL_COLOR = { r: 42, g: 171, b: 228 }; // Blue

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

// Drag Maze Game class
class DragMazeGame {
    constructor() {
        // Game state
        this.isGameActive = false;
        this.isDragging = false;
        
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
            // This handles cases where path-replacement.js hasn't executed yet
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
                // Try to get base URL from various sources
                let baseUrl = null;
                
                // First, check if __gameResourceBase is now set
                if (window.__gameResourceBase && 
                    (window.__gameResourceBase.startsWith('chrome-extension://') ||
                     window.__gameResourceBase.startsWith('http://') ||
                     window.__gameResourceBase.startsWith('https://'))) {
                    baseUrl = window.__gameResourceBase;
                } else {
                    // Try to extract extension ID from current location (if it's a chrome-extension URL)
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
                        } else if (currentUrl.startsWith('blob:')) {
                            // For blob URLs, we need to get base URL from parent or use a different method
                            // Try multiple approaches:
                            
                            // 1. Try to get from parent window's global variables or functions
                            try {
                                if (window.parent && window.parent !== window) {
                                    // Try to get from parent's __gameResourceBase (if it exists on parent)
                                    let parentBase = null;
                                    
                                    // Method 1: Check if parent has a way to get the base URL
                                    if (window.parent.__gameResourceBase) {
                                        parentBase = window.parent.__gameResourceBase;
                                    }
                                    
                                    // Method 2: Try to call parent's chrome.runtime.getURL if available
                                    if (!parentBase && typeof window.parent.chrome !== 'undefined' && 
                                        window.parent.chrome.runtime && window.parent.chrome.runtime.getURL) {
                                        try {
                                            parentBase = window.parent.chrome.runtime.getURL('games/');
                                        } catch (e) {
                                            // Cannot call parent's chrome.runtime
                                        }
                                    }
                                    
                                    // Method 3: Try to find the base URL from parent's script execution context
                                    // Look for any global variable that might contain the base URL
                                    if (!parentBase) {
                                        try {
                                            // Try to access parent's releasesBaseUrl if it exists
                                            if (window.parent.releasesBaseUrl) {
                                                parentBase = window.parent.releasesBaseUrl;
                                            }
                                        } catch (e) {
                                            // Cannot access
                                        }
                                    }
                                    
                                    if (parentBase && 
                                        (parentBase.startsWith('chrome-extension://') ||
                                         parentBase.startsWith('http://') ||
                                         parentBase.startsWith('https://'))) {
                                        baseUrl = parentBase;
                                        window.__gameResourceBase = baseUrl; // Cache it
                                    }
                                }
                            } catch (e) {
                                // Cross-origin or cannot access parent
                            }
                            
                            // 2. If parent access failed, try to get from top window
                            if (!baseUrl) {
                                try {
                                    if (window.top && window.top !== window) {
                                        let topBase = null;
                                        if (window.top.__gameResourceBase) {
                                            topBase = window.top.__gameResourceBase;
                                        } else if (typeof window.top.chrome !== 'undefined' && 
                                                   window.top.chrome.runtime && window.top.chrome.runtime.getURL) {
                                            try {
                                                topBase = window.top.chrome.runtime.getURL('games/');
                                            } catch (e) {
                                                // Cannot call
                                            }
                                        }
                                        
                                        if (topBase && 
                                            (topBase.startsWith('chrome-extension://') ||
                                             topBase.startsWith('http://') ||
                                             topBase.startsWith('https://'))) {
                                            baseUrl = topBase;
                                            window.__gameResourceBase = baseUrl; // Cache it
                                        }
                                    }
                                } catch (e) {
                                    // Cross-origin, cannot access top
                                }
                            }
                            
                            // 3. If still no base URL, try to extract from script src URLs
                            if (!baseUrl) {
                                try {
                                    const scripts = document.getElementsByTagName('script');
                                    for (let i = 0; i < scripts.length; i++) {
                                        const script = scripts[i];
                                        if (script.src && script.src.startsWith('chrome-extension://')) {
                                            // Extract base URL from script src
                                            const urlObj = new URL(script.src);
                                            const pathParts = urlObj.pathname.split('/').filter(p => p);
                                            const gamesIndex = pathParts.indexOf('games');
                                            if (gamesIndex >= 0) {
                                                baseUrl = `${urlObj.origin}/${pathParts.slice(0, gamesIndex + 1).join('/')}/`;
                                                window.__gameResourceBase = baseUrl; // Cache it
                                                break;
                                            }
                                        }
                                    }
                                } catch (e) {
                                    // Cannot access scripts
                                }
                            }
                            
                            // 4. Last resort: wait for path-replacement.js to set it
                            if (!baseUrl) {
                                try {
                                    const scripts = document.getElementsByTagName('script');
                                    for (let i = 0; i < scripts.length; i++) {
                                        const script = scripts[i];
                                        if (script.src && script.src.includes('path-replacement.js')) {
                                            // path-replacement.js should set __gameResourceBase
                                            // Wait a bit more for it to execute
                                            await new Promise(resolve => setTimeout(resolve, 200));
                                            if (window.__gameResourceBase && 
                                                (window.__gameResourceBase.startsWith('chrome-extension://') ||
                                                 window.__gameResourceBase.startsWith('http://') ||
                                                 window.__gameResourceBase.startsWith('https://'))) {
                                                baseUrl = window.__gameResourceBase;
                                                break;
                                            }
                                        }
                                    }
                                } catch (e) {
                                    // Cannot access scripts
                                }
                            }
                        }
                    } catch (e) {
                        // URL parsing failed
                    }
                }
                
                if (baseUrl) {
                    const cleanPath = resourceUrl.replace(/^\.\.?\//, '');
                    resourceUrl = baseUrl + cleanPath;
                    // Cache it for future use
                    if (!window.__gameResourceBase || !window.__gameResourceBase.startsWith('chrome-extension://')) {
                        window.__gameResourceBase = baseUrl;
                    }
                } else {
                    // Last resort: try to use a default path structure
                    // This should not happen, but handle it gracefully
                    // Try one more time to wait for __gameResourceBase
                    await new Promise(resolve => setTimeout(resolve, 200));
                    if (window.__gameResourceBase && 
                        (window.__gameResourceBase.startsWith('chrome-extension://') ||
                         window.__gameResourceBase.startsWith('http://') ||
                         window.__gameResourceBase.startsWith('https://'))) {
                        const cleanPath = resourceUrl.replace(/^\.\.?\//, '');
                        resourceUrl = window.__gameResourceBase + cleanPath;
                    } else {
                        throw new Error('Cannot construct absolute URL: base URL not available. Please ensure path-replacement.js is loaded. __gameResourceBase: ' + window.__gameResourceBase);
                    }
                }
            }
            
            // Validate URL before fetching
            try {
                const urlObj = new URL(resourceUrl);
                // Ensure it's a valid protocol
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
            this.currentMapId = this.getRandomInt(1, Math.min(100, this.maps.length - 1));
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
                
                // Try to get base URL from various sources (similar to loadGameData)
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
            const touchText = document.createTextNode('Touch Border');
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
                this.currentMapId = this.getRandomInt(1, Math.min(100, this.maps.length - 1));
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
        new DragMazeGame();
    });
} else {
    new DragMazeGame();
}

