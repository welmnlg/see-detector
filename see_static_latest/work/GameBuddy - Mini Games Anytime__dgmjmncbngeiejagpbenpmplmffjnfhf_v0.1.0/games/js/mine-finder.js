/*
 * Mine Finder Game - Version 2
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
const DIFFICULTY_CONFIGS = [
    { name: 'Beginner', rows: 9, cols: 9, mines: 10 },
    { name: 'Intermediate', rows: 14, cols: 14, mines: 30 },
    { name: 'Advanced', rows: 14, cols: 30, mines: 90 }
];

const NUMBER_CLASSES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

// Cell types
const CELL_TYPE = {
    MINE: 'mine',
    NUMBER: 'number'
};

// Cell states
const CELL_STATE = {
    HIDDEN: 'hidden',
    REVEALED: 'revealed',
    FLAGGED: 'flagged'
};

// Game states
const GAME_STATE = {
    INIT: 'init',
    PLAYING: 'playing',
    WON: 'won',
    LOST: 'lost'
};

// Mine Finder Game class
class MineFinderGame {
    constructor(rows, cols, mines, cellSize = 20, adaptive = 1) {
        // Game configuration
        this.rows = rows;
        this.cols = cols;
        this.totalMines = mines;
        
        // Adaptive scaling
        this.cellSize = cellSize;
        this.adaptive = adaptive;
        
        // Game state
        this.state = GAME_STATE.INIT;
        this.remainingMines = mines;
        this.revealedCount = 0;
        this.totalCells = rows * cols;
        
        // Game data
        this.grid = []; // 2D array of cell data
        this.cells = []; // 2D array of DOM elements
        this.minePositions = []; // Array of [row, col] positions
        
        // DOM elements
        this.gameContent = null;
        this.mineNumDiv = null;
        this.table = null;
        
        // Initialize
        this.init();
    }
    
    // Initialize game
    init() {
        // Disable context menu
        const gameContent = document.querySelector('.gamecontent');
        if (gameContent) {
            gameContent.oncontextmenu = () => false;
        }
        
        // Reset game state
        this.state = GAME_STATE.PLAYING;
        this.remainingMines = this.totalMines;
        this.revealedCount = 0;
        
        // Clear previous game
        this.clearGame();
        
        // Generate mine positions
        this.generateMines();
        
        // Create grid
        this.createGrid();
        
        // Create DOM
        this.createDOM();
        
        // Update mine count display
        this.updateMineCount();
    }
    
    // Clear previous game
    clearGame() {
        this.grid = [];
        this.cells = [];
        this.minePositions = [];
        
        const gameContent = document.querySelector('.gamecontent');
        if (gameContent) {
            // Clear content using removeChild instead of innerHTML
            while (gameContent.firstChild) {
                gameContent.removeChild(gameContent.firstChild);
            }
        }
    }
    
    // Generate random mine positions
    generateMines() {
        const totalCells = this.rows * this.cols;
        const positions = new Set();
        
        // Generate unique random positions
        while (positions.size < this.totalMines) {
            const pos = Math.floor(Math.random() * totalCells);
            positions.add(pos);
        }
        
        // Convert to [row, col] format
        this.minePositions = Array.from(positions).map(pos => {
            const row = Math.floor(pos / this.cols);
            const col = pos % this.cols;
            return [row, col];
        });
    }
    
    // Create grid data structure
    createGrid() {
        // Initialize grid
        for (let i = 0; i < this.rows; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.grid[i][j] = {
                    type: CELL_TYPE.NUMBER,
                    value: 0,
                    state: CELL_STATE.HIDDEN,
                    row: i,
                    col: j
                };
            }
        }
        
        // Place mines
        for (const [row, col] of this.minePositions) {
            this.grid[row][col].type = CELL_TYPE.MINE;
        }
        
        // Calculate numbers
        this.calculateNumbers();
    }
    
    // Calculate numbers for each cell
    calculateNumbers() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.grid[i][j].type === CELL_TYPE.MINE) {
                    continue;
                }
                
                // Count adjacent mines
                const count = this.countAdjacentMines(i, j);
                this.grid[i][j].value = count;
            }
        }
    }
    
    // Count adjacent mines
    countAdjacentMines(row, col) {
        let count = 0;
        const neighbors = this.getNeighbors(row, col);
        
        for (const [r, c] of neighbors) {
            if (this.grid[r][c].type === CELL_TYPE.MINE) {
                count++;
            }
        }
        
        return count;
    }
    
    // Ensure URL is absolute
    ensureAbsoluteUrl(imageUrl, defaultPath) {
        // Ensure the URL is absolute
        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && 
            !imageUrl.startsWith('chrome-extension://') && !imageUrl.startsWith('data:') &&
            !imageUrl.startsWith('blob:')) {
            // Try to construct absolute URL
            let baseUrl = null;
            
            // Method 1: Check if __gameResourceBase is already set
            if (window.__gameResourceBase && 
                (window.__gameResourceBase.startsWith('chrome-extension://') ||
                 window.__gameResourceBase.startsWith('http://') ||
                 window.__gameResourceBase.startsWith('https://'))) {
                baseUrl = window.__gameResourceBase;
            }
            
            // Method 2: Try parent window
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
            
            // Method 3: Try chrome.runtime.getURL first (no hardcoded paths)
            try {
                if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
                    baseUrl = chrome.runtime.getURL('games/');
                    if (baseUrl && !baseUrl.endsWith('/')) {
                        baseUrl += '/';
                    }
                    if (!baseUrl || (!baseUrl.startsWith('chrome-extension://') &&
                                   !baseUrl.startsWith('http://') &&
                                   !baseUrl.startsWith('https://'))) {
                        baseUrl = null;
                    }
                }
            } catch (e) {
                // chrome.runtime.getURL not available
            }
            
            // Method 3b: Try chrome.runtime.getURL as fallback (but fix if it contains 'releases')
            if (!baseUrl || (!baseUrl.startsWith('chrome-extension://') &&
                            !baseUrl.startsWith('http://') &&
                            !baseUrl.startsWith('https://'))) {
                try {
                    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
                        // Use chrome.runtime.getURL to get the correct path
                        baseUrl = chrome.runtime.getURL('games/');
                        if (!baseUrl.endsWith('/')) {
                            baseUrl += '/';
                        }
                        // Verify the URL is correct (should contain 'games' not 'releases')
                        if (baseUrl.includes('/releases/')) {
                            // Fix it: replace /releases/ with games/ (dynamic, no hardcoded path)
                            // Extract extension ID and reconstruct with 'games/'
                            const match = baseUrl.match(/chrome-extension:\/\/([^/]+)/);
                            if (match && match[1]) {
                                baseUrl = `chrome-extension://${match[1]}/games/`;
                            }
                        } else if (!baseUrl.includes('/games/')) {
                            // If URL doesn't contain 'games', try to extract from script src
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
            
            // Final check: if baseUrl contains 'releases', fix it (dynamic, no hardcoded path)
            if (baseUrl && baseUrl.includes('/releases/')) {
                // Extract extension ID and reconstruct with 'games/'
                const match = baseUrl.match(/chrome-extension:\/\/([^/]+)/);
                if (match && match[1]) {
                    baseUrl = `chrome-extension://${match[1]}/games/`;
                }
            }
            
            // Method 4: Try to extract from script src
            if (!baseUrl || (!baseUrl.startsWith('chrome-extension://') &&
                            !baseUrl.startsWith('http://') &&
                            !baseUrl.startsWith('https://'))) {
                try {
                    const scripts = document.getElementsByTagName('script');
                    for (let i = 0; i < scripts.length; i++) {
                        const script = scripts[i];
                        if (script.src && script.src.startsWith('chrome-extension://')) {
                            const urlObj = new URL(script.src);
                            const pathParts = urlObj.pathname.split('/').filter(p => p);
                            const gamesIndex = pathParts.indexOf('games');
                            if (gamesIndex >= 0) {
                                // Dynamically extract path from script location (no hardcoded paths)
                                baseUrl = `${urlObj.origin}/${pathParts.slice(0, gamesIndex + 1).join('/')}/`;
                                break;
                            }
                        }
                    }
                } catch (e) {
                    // Cannot access scripts
                }
            }
            
            if (baseUrl && (baseUrl.startsWith('chrome-extension://') ||
                           baseUrl.startsWith('http://') ||
                           baseUrl.startsWith('https://'))) {
                // Check if baseUrl contains 'releases' and fix it (dynamic, no hardcoded path)
                if (baseUrl.includes('/releases/')) {
                    // Extract extension ID and reconstruct with 'games/'
                    const match = baseUrl.match(/chrome-extension:\/\/([^/]+)/);
                    if (match && match[1]) {
                        baseUrl = `chrome-extension://${match[1]}/games/`;
                    }
                }
                
                // Clean the path - remove leading ../ or ./
                const cleanPath = imageUrl.replace(/^\.\.?\//, '').replace(/^\.\.?\//, '');
                imageUrl = baseUrl + cleanPath;
                
                // Final check: if URL still contains 'releases', fix it (dynamic, no hardcoded path)
                if (imageUrl.includes('/releases/')) {
                    // Extract extension ID and path, reconstruct with 'games/'
                    const match = imageUrl.match(/chrome-extension:\/\/([^/]+)\/releases\/(.+)/);
                    if (match && match[1] && match[2]) {
                        imageUrl = `chrome-extension://${match[1]}/games/${match[2]}`;
                    }
                }
                
                if (!window.__gameResourceBase || !window.__gameResourceBase.startsWith('chrome-extension://')) {
                    window.__gameResourceBase = baseUrl;
                }
            } else {
                // Last resort: use defaultPath to construct URL
                if (defaultPath) {
                    try {
                        if (typeof chrome !== 'undefined' && chrome.runtime) {
                            if (chrome.runtime.getURL) {
                                // Use chrome.runtime.getURL to get the correct path
                                baseUrl = chrome.runtime.getURL('games/');
                                if (!baseUrl.endsWith('/')) {
                                    baseUrl += '/';
                                }
                                // Fix if contains 'releases' (dynamic, no hardcoded path)
                                if (baseUrl.includes('/releases/')) {
                                    const match = baseUrl.match(/chrome-extension:\/\/([^/]+)/);
                                    if (match && match[1]) {
                                        baseUrl = `chrome-extension://${match[1]}/games/`;
                                    }
                                }
                                imageUrl = baseUrl + defaultPath;
                                window.__gameResourceBase = baseUrl;
                            } else if (chrome.runtime.id) {
                                // Try to extract path from script src
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
                                                imageUrl = baseUrl + defaultPath;
                                                window.__gameResourceBase = baseUrl;
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
                        // Error constructing URL
                    }
                }
            }
        }
        return imageUrl;
    }
    
    // Get neighboring cells
    getNeighbors(row, col) {
        const neighbors = [];
        
        for (let i = row - 1; i <= row + 1; i++) {
            for (let j = col - 1; j <= col + 1; j++) {
                // Skip out of bounds
                if (i < 0 || i >= this.rows || j < 0 || j >= this.cols) {
                    continue;
                }
                
                // Skip self
                if (i === row && j === col) {
                    continue;
                }
                
                neighbors.push([i, j]);
            }
        }
        
        return neighbors;
    }
    
    // Create DOM structure
    createDOM() {
        const gameContent = document.querySelector('.gamecontent');
        if (!gameContent) return;
        
        // Create table
        this.table = document.createElement('table');
        this.table.style.borderSpacing = `${Math.max(1, Math.floor(1 * this.adaptive))}px`;
        this.table.style.backgroundColor = '#929196';
        this.table.style.margin = '0 auto';
        this.table.style.borderCollapse = 'separate';
        
        // Create cells array
        this.cells = [];
        
        // Calculate adaptive border width
        const borderWidth = Math.max(1, Math.floor(2 * this.adaptive));
        // Calculate adaptive font size for cells (70% of cell size)
        const cellFontSize = Math.floor(this.cellSize * 0.7);
        
        for (let i = 0; i < this.rows; i++) {
            const tr = document.createElement('tr');
            this.cells[i] = [];
            
            for (let j = 0; j < this.cols; j++) {
                const td = document.createElement('td');
                td.dataset.row = i;
                td.dataset.col = j;
                td.style.width = `${this.cellSize}px`;
                td.style.height = `${this.cellSize}px`;
                td.style.lineHeight = `${this.cellSize}px`;
                td.style.padding = '0';
                td.style.backgroundColor = '#ccc';
                td.style.border = `${borderWidth}px solid`;
                td.style.borderColor = '#fff #a1a1a1 #a1a1a1 #fff';
                td.style.textAlign = 'center';
                td.style.fontWeight = 'bold';
                td.style.fontSize = `${cellFontSize}px`;
                
                // Add click handlers
                td.addEventListener('mousedown', (e) => this.handleCellClick(e, td));
                
                this.cells[i][j] = td;
                tr.appendChild(td);
            }
            
            this.table.appendChild(tr);
        }
        
        gameContent.appendChild(this.table);
    }
    
    // Handle cell click
    handleCellClick(event, cell) {
        if (this.state !== GAME_STATE.PLAYING) {
            return;
        }
        
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const cellData = this.grid[row][col];
        
        // Left click (reveal)
        if (event.button === 0) {
            this.revealCell(row, col);
        }
        // Right click (flag)
        else if (event.button === 2) {
            this.toggleFlag(row, col);
        }
    }
    
    // Reveal a cell
    revealCell(row, col) {
        const cell = this.cells[row][col];
        const cellData = this.grid[row][col];
        
        // Ignore if already revealed or flagged
        if (cellData.state === CELL_STATE.REVEALED || cellData.state === CELL_STATE.FLAGGED) {
            return;
        }
        
        // Check if it's a mine
        if (cellData.type === CELL_TYPE.MINE) {
            this.gameOver(cell);
            return;
        }
        
        // Reveal the cell
        this.revealCellInternal(row, col);
    }
    
    // Internal reveal logic
    revealCellInternal(row, col) {
        const cell = this.cells[row][col];
        const cellData = this.grid[row][col];
        
        // Already revealed
        if (cellData.state === CELL_STATE.REVEALED) {
            return;
        }
        
        // Set state
        cellData.state = CELL_STATE.REVEALED;
        this.revealedCount++;
        
        // Update DOM
        const className = NUMBER_CLASSES[cellData.value];
        cell.className = className;

        // IMPORTANT:
        // We set default cell styles (background/border colors) via inline styles for adaptive sizing.
        // Inline styles override CSS class styles (e.g. td.one/td.two/...),
        // so when a cell is revealed we must clear the conflicting inline styles
        // to let the className visual styles take effect.
        cell.style.backgroundColor = '';
        cell.style.borderColor = '';
        cell.style.background = '';
        cell.style.backgroundSize = '';
        
        if (cellData.value > 0) {
            cell.textContent = cellData.value;
        }
        
        // If value is 0, reveal neighbors recursively
        if (cellData.value === 0) {
            const neighbors = this.getNeighbors(row, col);
            for (const [r, c] of neighbors) {
                const neighborData = this.grid[r][c];
                // Only reveal if not a mine and not already revealed
                if (neighborData.type !== CELL_TYPE.MINE && neighborData.state !== CELL_STATE.REVEALED) {
                    this.revealCellInternal(r, c);
                }
            }
        }
        
        // Check win condition
        this.checkWin();
    }
    
    // Toggle flag
    toggleFlag(row, col) {
        const cell = this.cells[row][col];
        const cellData = this.grid[row][col];
        
        // Can't flag revealed cells
        if (cellData.state === CELL_STATE.REVEALED) {
            return;
        }
        
        // Toggle flag
        if (cellData.state === CELL_STATE.FLAGGED) {
            // Remove flag
            cellData.state = CELL_STATE.HIDDEN;
            cell.className = '';
            cell.style.background = '';
            cell.style.backgroundSize = '';
            this.remainingMines++;
            
            // Check if it was actually a mine
            if (cellData.type === CELL_TYPE.MINE) {
                // Was incorrectly flagged (but we don't track this separately)
            }
        } else {
            // Add flag
            cellData.state = CELL_STATE.FLAGGED;
            cell.className = 'flag';
            let flagImagePath = window.getGameResource('images/mine-finder/flag.png');
            
            // Ensure the URL is absolute
            flagImagePath = this.ensureAbsoluteUrl(flagImagePath, 'images/mine-finder/flag.png');
            
            // Preload image to verify it can be loaded
            const img = new Image();
            img.onload = () => {
            cell.style.background = `#ccc url(${flagImagePath}) no-repeat center`;
                cell.style.backgroundSize = 'cover';
            };
            img.onerror = () => {
                // Try to reload with parent's base URL if available
                if (window.parent && window.parent !== window) {
                    try {
                        const parentBase = window.parent.releasesBaseUrl || window.parent.__gameResourceBase;
                        if (parentBase && (parentBase.startsWith('chrome-extension://') ||
                                          parentBase.startsWith('http://') ||
                                          parentBase.startsWith('https://'))) {
                            const retryUrl = parentBase + 'images/mine-finder/flag.png';
                            img.src = retryUrl;
                            img.onload = () => {
                                cell.style.background = `#ccc url(${retryUrl}) no-repeat center`;
                                cell.style.backgroundSize = 'cover';
                            };
                            img.onerror = () => {
                                // Try chrome.runtime.getURL as last resort (no hardcoded path)
                                try {
                                    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
                                        const finalUrl = chrome.runtime.getURL('games/images/mine-finder/flag.png');
                                        cell.style.background = `#ccc url(${finalUrl}) no-repeat center`;
                                        cell.style.backgroundSize = 'cover';
                                    }
                                } catch (e) {
                                    // chrome.runtime.getURL not available
                                }
                            };
                            return;
                        }
                    } catch (e) {
                        // Cannot access parent
                    }
                }
                
                // Try chrome.runtime.getURL as last resort (no hardcoded path)
                try {
                    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
                        const finalUrl = chrome.runtime.getURL('games/images/mine-finder/flag.png');
                        cell.style.background = `#ccc url(${finalUrl}) no-repeat center`;
                        cell.style.backgroundSize = 'cover';
                    }
                } catch (e) {
                    // chrome.runtime.getURL not available
                }
            };
            img.src = flagImagePath;
            this.remainingMines--;
            
            // Check if it's actually a mine
            if (cellData.type === CELL_TYPE.MINE) {
                // Correctly flagged
            }
        }
        
        this.updateMineCount();
        
        // Check win condition
        this.checkWin();
    }
    
    // Check win condition
    checkWin() {
        // Win if all non-mine cells are revealed
        const nonMineCells = this.totalCells - this.totalMines;
        if (this.revealedCount === nonMineCells) {
            this.win();
        }
        
        // Also check if all mines are correctly flagged
        if (this.remainingMines === 0) {
            // Verify all flagged cells are actually mines
            let allCorrect = true;
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    const cellData = this.grid[i][j];
                    const cell = this.cells[i][j];
                    
                    if (cellData.state === CELL_STATE.FLAGGED) {
                        if (cellData.type !== CELL_TYPE.MINE) {
                            allCorrect = false;
                            break;
                        }
                    }
                }
                if (!allCorrect) break;
            }
            
            if (allCorrect) {
                this.win();
            }
        }
    }
    
    // Win game
    win() {
        this.state = GAME_STATE.WON;
        
        // Disable all cells
        this.disableAllCells();
        
        // Show success message
        this.showMessage('Congratulations! You Win!');
    }
    
    // Game over
    gameOver(clickedCell) {
        this.state = GAME_STATE.LOST;
        
        // Reveal all mines
        let mineImagePath = window.getGameResource('images/mine-finder/mine.png');
        
        // Ensure the URL is absolute
        mineImagePath = this.ensureAbsoluteUrl(mineImagePath, 'images/mine-finder/mine.png');
        
        // Get clicked cell coordinates if available
        let clickedRow = null;
        let clickedCol = null;
        if (clickedCell) {
            clickedRow = parseInt(clickedCell.dataset.row);
            clickedCol = parseInt(clickedCell.dataset.col);
        }
        
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cellData = this.grid[i][j];
                const cell = this.cells[i][j];
                
                if (cellData.type === CELL_TYPE.MINE) {
                    // Check if this is the clicked cell
                    const isClicked = (clickedRow !== null && clickedCol !== null && 
                                      i === clickedRow && j === clickedCol);
                    
                    cell.className = 'mine';
                    // Preload image to verify it can be loaded
                    const img = new Image();
                    let imageLoaded = false;
                    img.onload = () => {
                        imageLoaded = true;
                        // For clicked cell, use red background with mine image
                        if (isClicked) {
                            cell.style.background = `#f00 url(${mineImagePath}) no-repeat center`;
                        } else {
                    cell.style.background = `#d9d9d9 url(${mineImagePath}) no-repeat center`;
                        }
                    cell.style.backgroundSize = 'cover';
                    };
                    img.onerror = () => {
                        // Try chrome.runtime.getURL directly (most reliable, no hardcoded path)
                        try {
                            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
                                const finalUrl = chrome.runtime.getURL('games/images/mine-finder/mine.png');
                                img.src = finalUrl;
                                img.onload = () => {
                                    if (isClicked) {
                                        cell.style.background = `#f00 url(${finalUrl}) no-repeat center`;
                                    } else {
                                        cell.style.background = `#d9d9d9 url(${finalUrl}) no-repeat center`;
                                    }
                                    cell.style.backgroundSize = 'cover';
                                };
                                img.onerror = () => {
                                    // Try to reload with parent's base URL if available (but fix if contains 'releases')
                                    if (window.parent && window.parent !== window) {
                                        try {
                                            let parentBase = window.parent.releasesBaseUrl || window.parent.__gameResourceBase;
                                            // Fix if contains 'releases' (dynamic, no hardcoded path)
                                            if (parentBase && parentBase.includes('/releases/')) {
                                                const match = parentBase.match(/chrome-extension:\/\/([^/]+)/);
                                                if (match && match[1]) {
                                                    parentBase = `chrome-extension://${match[1]}/games/`;
                                                }
                                            }
                                            if (parentBase && (parentBase.startsWith('chrome-extension://') ||
                                                              parentBase.startsWith('http://') ||
                                                              parentBase.startsWith('https://'))) {
                                                const retryUrl = parentBase + 'images/mine-finder/mine.png';
                                                // Final check: if retryUrl contains 'releases', fix it (dynamic)
                                                let fixedRetryUrl = retryUrl;
                                                if (retryUrl.includes('/releases/')) {
                                                    const match = retryUrl.match(/chrome-extension:\/\/([^/]+)\/releases\/(.+)/);
                                                    if (match && match[1] && match[2]) {
                                                        fixedRetryUrl = `chrome-extension://${match[1]}/games/${match[2]}`;
                                                    }
                                                }
                                                img.src = fixedRetryUrl;
                                                img.onload = () => {
                                                    if (isClicked) {
                                                        cell.style.background = `#f00 url(${fixedRetryUrl}) no-repeat center`;
                                                    } else {
                                                        cell.style.background = `#d9d9d9 url(${fixedRetryUrl}) no-repeat center`;
                                                    }
                                                    cell.style.backgroundSize = 'cover';
                                                };
                                                img.onerror = () => {
                                                    // Failed to load mine image after all retries
                                                };
                                                return;
                                            }
                                        } catch (e) {
                                            // Cannot access parent
                                        }
                                    }
                                };
                                return;
                            }
                        } catch (e) {
                            // chrome.runtime not available
                        }
                        
                        // Try to reload with parent's base URL if available (but fix if contains 'releases')
                        if (window.parent && window.parent !== window) {
                            try {
                                let parentBase = window.parent.releasesBaseUrl || window.parent.__gameResourceBase;
                                // Fix if contains 'releases' (dynamic, no hardcoded path)
                                if (parentBase && parentBase.includes('/releases/')) {
                                    const match = parentBase.match(/chrome-extension:\/\/([^/]+)/);
                                    if (match && match[1]) {
                                        parentBase = `chrome-extension://${match[1]}/games/`;
                                    }
                                }
                                if (parentBase && (parentBase.startsWith('chrome-extension://') ||
                                                  parentBase.startsWith('http://') ||
                                                  parentBase.startsWith('https://'))) {
                                    const retryUrl = parentBase + 'images/mine-finder/mine.png';
                                    // Final check: if retryUrl contains 'releases', fix it (dynamic)
                                    let fixedRetryUrl = retryUrl;
                                    if (retryUrl.includes('/releases/')) {
                                        const match = retryUrl.match(/chrome-extension:\/\/([^/]+)\/releases\/(.+)/);
                                        if (match && match[1] && match[2]) {
                                            fixedRetryUrl = `chrome-extension://${match[1]}/games/${match[2]}`;
                                        }
                                    }
                                    img.src = fixedRetryUrl;
                                    img.onload = () => {
                                        if (isClicked) {
                                            cell.style.background = `#f00 url(${fixedRetryUrl}) no-repeat center`;
                                        } else {
                                            cell.style.background = `#d9d9d9 url(${fixedRetryUrl}) no-repeat center`;
                                        }
                                        cell.style.backgroundSize = 'cover';
                                    };
                                    img.onerror = () => {
                                        // Failed to load mine image after parent retry
                                    };
                                    return;
                                }
                            } catch (e) {
                                // Cannot access parent
                            }
                        }
                    };
                    // Ensure mineImagePath doesn't contain 'releases' before setting img.src (dynamic, no hardcoded path)
                    if (mineImagePath.includes('/releases/')) {
                        const match = mineImagePath.match(/chrome-extension:\/\/([^/]+)\/releases\/(.+)/);
                        if (match && match[1] && match[2]) {
                            mineImagePath = `chrome-extension://${match[1]}/games/${match[2]}`;
                        }
                    }
                    img.src = mineImagePath;
                }
            }
        }
        
        // Disable all cells
        this.disableAllCells();
        
        // Show game over message
        this.showMessage('You Lost! Hit a mine');
    }
    
    // Disable all cells
    disableAllCells() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = this.cells[i][j];
                // Remove event listeners by cloning
                const newCell = cell.cloneNode(true);
                cell.parentNode.replaceChild(newCell, cell);
            }
        }
    }
    
    // Update mine count display
    updateMineCount() {
        const mineNumDiv = document.querySelector('.remains');
        if (mineNumDiv) {
            mineNumDiv.textContent = this.remainingMines;
        }
    }
    
    // Show message (replaces alert)
    showMessage(message) {
        // Remove existing message if any
        const existingMessage = document.getElementById('mine-finder-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Get gamebox element
        const gamebox = document.getElementById('gamebox');
        if (!gamebox) {
            return;
        }
        
        // Ensure gamebox has relative positioning
        const gameboxPosition = window.getComputedStyle(gamebox).position;
        if (gameboxPosition === 'static') {
            gamebox.style.position = 'relative';
        }
        
        // Create message overlay with adaptive styles
        const messageDiv = document.createElement('div');
        messageDiv.id = 'mine-finder-message';
        const adaptivePadding = Math.floor(30 * this.adaptive);
        const adaptivePaddingH = Math.floor(50 * this.adaptive);
        const adaptiveBorderRadius = Math.floor(10 * this.adaptive);
        const adaptiveFontSize = Math.floor(24 * this.adaptive);
        const adaptiveBorder = Math.max(1, Math.floor(2 * this.adaptive));
        const adaptiveBoxShadow = Math.floor(4 * this.adaptive);
        const adaptiveBoxShadowBlur = Math.floor(20 * this.adaptive);
        
        // Determine win or loss for styling
        var isWin = message.toLowerCase().indexOf('win') !== -1 || 
                    message.toLowerCase().indexOf('congrat') !== -1;
        var borderColor = isWin ? '#22c55e' : '#ef4444';
        var textColor = isWin ? '#e7ffe8' : '#ffe7e7';
        
        messageDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(22, 28, 28, 0.95);
            color: ${textColor};
            padding: ${adaptivePadding}px ${adaptivePaddingH}px;
            border-radius: ${adaptiveBorderRadius}px;
            font-size: ${adaptiveFontSize}px;
            font-weight: bold;
            z-index: 10000;
            text-align: center;
            box-shadow: 0 ${adaptiveBoxShadow}px ${adaptiveBoxShadowBlur}px rgba(0, 0, 0, 0.5);
            border: ${adaptiveBorder}px solid ${borderColor};
        `;
        messageDiv.textContent = message;
        
        // Add to gamebox
        gamebox.appendChild(messageDiv);
        
        // Message will remain until game restarts (button clicked)
        // No auto-remove - message stays until user clicks a button to restart
    }
}

// Game Manager class
class MineFinderGameManager {
    constructor() {
        // Screen dimensions
        this.screenWidth = window.innerWidth - 80;
        this.screenHeight = window.innerHeight - Math.max(100, Math.floor(window.innerHeight * 0.14));
        this.gameDefaultWidth = 750;
        this.gameDefaultHeight = 490;
        this.gameboxBaseHeight = 440; // Original content height for gamebox sizing
        
        // Calculate adaptive size
        const modSize = (this.screenWidth < 800 || this.screenHeight < 600) ? 10 : 0;
        this.adaptive = Math.min(
            this.screenWidth / (this.gameDefaultWidth + modSize),
            this.screenHeight / (this.gameDefaultHeight + modSize)
        ) || 0.8;
        
        // Cell size based on adaptive scaling
        this.cellSize = Math.floor(20 * this.adaptive);
        
        this.currentGame = null;
        this.currentDifficulty = 1; // Default to Intermediate (index 1)
        this.buttons = [];
        
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
        
        // Recalculate cell size
        this.cellSize = Math.floor(20 * this.adaptive);
        
        // Update UI with new sizes
        this.setupUI();
    }
    
    // Calculate optimal cell size for a given difficulty config
    calculateCellSize(config) {
        const borderWidth = Math.max(1, Math.floor(2 * this.adaptive));
        const spacing = Math.max(1, Math.floor(1 * this.adaptive));
        
        // Available width inside mine container (gamebox width minus mine horizontal padding)
        const minePadSide = Math.floor(20 * this.adaptive);
        const gameboxWidth = Math.floor(this.gameDefaultWidth * this.adaptive);
        const availableWidth = gameboxWidth - 2 * minePadSide;
        
        // Available height inside mine container (gamebox height minus header and padding)
        const minePadTop = Math.floor(10 * this.adaptive);
        const headerRenderedH = Math.floor(50 * this.adaptive) + 2 * Math.floor(5 * this.adaptive);
        const headerMargin = Math.floor(14 * this.adaptive);
        const classicCellH = Math.floor(30 * this.adaptive);
        const classicPadH = Math.floor(15 * this.adaptive);
        const classicGameboxH = classicCellH * 14 + classicPadH * 2 + 2 + classicCellH;
        const gameboxH = Math.max(Math.floor(this.gameboxBaseHeight * this.adaptive), classicGameboxH);
        const bottomBuffer = Math.floor(8 * this.adaptive);
        const availableHeight = gameboxH - minePadTop - headerRenderedH - headerMargin - bottomBuffer;
        
        // Max cell size that fits: grid = cols*(cellSize + 2*border) + (cols+1)*spacing
        const maxCellW = Math.floor((availableWidth - (config.cols + 1) * spacing) / config.cols) - 2 * borderWidth;
        const maxCellH = Math.floor((availableHeight - (config.rows + 1) * spacing) / config.rows) - 2 * borderWidth;
        
        // Use the smaller of width/height constraints, with a minimum floor
        const minCell = Math.floor(14 * this.adaptive);
        return Math.max(minCell, Math.min(maxCellW, maxCellH));
    }
    
    // Setup UI elements with adaptive sizes
    setupUI() {
        // Calculate adaptive border widths
        const gameboxBorder = Math.max(1, Math.floor(2 * this.adaptive));
        const headerBorderBottom = Math.max(1, Math.floor(1 * this.adaptive));
        const cellBorder = Math.max(1, Math.floor(2 * this.adaptive));
        
        // Update gamebox size
        const gamebox = document.getElementById('gamebox');
        if (gamebox) {
            gamebox.style.width = `${Math.floor(this.gameDefaultWidth * this.adaptive)}px`;
            // Match classic-maze gamebox height
            const classicCellH = Math.floor(30 * this.adaptive);
            const classicPadH = Math.floor(15 * this.adaptive);
            const classicGameboxH = classicCellH * 14 + classicPadH * 2 + 2 + classicCellH;
            gamebox.style.height = `${Math.max(Math.floor(this.gameboxBaseHeight * this.adaptive), classicGameboxH)}px`;
            gamebox.style.border = `${gameboxBorder}px solid #313131`;
            gamebox.style.backgroundColor = '#161c1c';
            gamebox.style.position = 'relative';
        }
        
        // Update mine container
        const mine = document.getElementById('mine');
        if (mine) {
            mine.style.padding = `${Math.floor(10 * this.adaptive)}px ${Math.floor(20 * this.adaptive)}px 0px ${Math.floor(20 * this.adaptive)}px`;
            mine.style.marginBottom = `${Math.floor(10 * this.adaptive)}px`;
            mine.style.margin = 'auto';
        }
        
        // Update header
        const header = document.querySelector('.header');
        if (header) {
            header.style.width = '100%';
            header.style.height = `${Math.floor(50 * this.adaptive)}px`;
            header.style.padding = `${Math.floor(5 * this.adaptive)}px 0px`;
            header.style.marginBottom = `${Math.floor(14 * this.adaptive)}px`;
            header.style.borderBottom = `${headerBorderBottom}px solid #333`;
        }
        
        // Update level buttons
        const level = document.querySelector('.level');
        if (level) {
            level.style.textAlign = 'left';
            level.style.fontSize = `${Math.floor(20 * this.adaptive)}px`;
            /*level.style.width = `${Math.floor(500 * this.adaptive)}px`;*/
            level.style.width = `${Math.floor(530 * this.adaptive)}px`;
            level.style.float = 'left';
        }
        
        const levelButtons = document.querySelectorAll('.level button');
        levelButtons.forEach(btn => {
            btn.style.padding = `${Math.floor(5 * this.adaptive)}px ${Math.floor(15 * this.adaptive)}px`;
            btn.style.borderRadius = `${Math.floor(3 * this.adaptive)}px`;
            btn.style.fontSize = `${Math.floor(20 * this.adaptive)}px`;
            btn.style.backgroundColor = btn.classList.contains('active') ? '#00abff' : '#02a4ad';
            btn.style.border = 'none';
            btn.style.color = '#fff';
            btn.style.outline = 'none';
            btn.style.cursor = 'pointer';
        });
        
        // Update info
        const info = document.querySelector('.info');
        if (info) {
            info.style.textAlign = 'right';
            info.style.fontSize = `${Math.floor(20 * this.adaptive)}px`;
            /*info.style.width = `${Math.floor(200 * this.adaptive)}px`;*/
            info.style.width = `${Math.floor(170 * this.adaptive)}px`;
            info.style.color = '#fff';
            info.style.float = 'right';
        }
        
        // Update remains (mine count) text
        const remains = document.querySelector('.remains');
        if (remains) {
            remains.style.fontSize = `${Math.floor(20 * this.adaptive)}px`;
            remains.style.color = '#fff';
            remains.style.fontWeight = 'bold';
        }
        
        // Update table border spacing
        const table = document.querySelector('table');
        if (table) {
            table.style.borderSpacing = `${Math.max(1, Math.floor(1 * this.adaptive))}px`;
            table.style.backgroundColor = '#929196';
            table.style.margin = '0 auto';
            table.style.borderCollapse = 'separate';
        }
        
        // Update all td cells
        const tds = document.querySelectorAll('td');
        const cellFontSize = Math.floor(this.cellSize * 0.7); // Font size relative to cell size
        tds.forEach(td => {
            td.style.width = `${this.cellSize}px`;
            td.style.height = `${this.cellSize}px`;
            td.style.lineHeight = `${this.cellSize}px`;
            td.style.padding = '0';
            td.style.border = `${cellBorder}px solid`;
            td.style.textAlign = 'center';
            td.style.fontWeight = 'bold';
            td.style.fontSize = `${cellFontSize}px`;

            // Only force the "hidden" cell look via inline styles.
            // For revealed cells (zero/one/two/...) we must NOT override class styles.
            const cls = (td.className || '').trim();
            const isNumberCell = NUMBER_CLASSES.includes(cls);
            const isFlagOrMine = cls === 'flag' || cls === 'mine';
            if (!cls) {
                td.style.backgroundColor = '#ccc';
                td.style.borderColor = '#fff #a1a1a1 #a1a1a1 #fff';
            } else if (isNumberCell || isFlagOrMine) {
                td.style.backgroundColor = '';
                td.style.borderColor = '';
            }
        });
        
        // Update tips if exists
        const tips = document.querySelector('.tips');
        if (tips) {
            tips.style.color = 'red';
            tips.style.fontSize = `${Math.floor(16 * this.adaptive)}px`;
        }
    }
    
    // Initialize
    init() {
        //if (window.innerWidth < 768) {
            //return;
        //}
        
        this.setupButtons();
        this.setupUI();
        this.startGame(this.currentDifficulty);
    }
    
    // Setup difficulty buttons
    setupButtons() {
        const element = document.getElementById('mine');
        if (!element) return;
        
        const btns = element.getElementsByTagName('button');
        if (btns.length < 4) return;
        
        // Difficulty buttons
        for (let i = 0; i < 3; i++) {
            const btn = btns[i];
            this.buttons.push(btn);
            
            btn.addEventListener('click', () => {
                this.selectDifficulty(i);
            });
        }
        
        // Restart button
        const restartBtn = btns[3];
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.restart();
            });
        }
        
        // Set default active button
        if (this.buttons[1]) {
            this.buttons[1].classList.add('active');
        }
    }
    
    // Select difficulty
    selectDifficulty(index) {
        if (index < 0 || index >= DIFFICULTY_CONFIGS.length) {
            return;
        }
        
        // Remove mine-finder-message when game restarts (button clicked)
        const mineFinderMessage = document.getElementById('mine-finder-message');
        if (mineFinderMessage) {
            mineFinderMessage.remove();
        }
        
        // Update active button
        for (let i = 0; i < this.buttons.length; i++) {
            if (i === index) {
                this.buttons[i].classList.add('active');
            } else {
                this.buttons[i].classList.remove('active');
            }
        }

        // Update adaptive size/UI AFTER active class is updated,
        // so button background color reflects the latest active state.
        this.updateAdaptiveSize();
        
        this.currentDifficulty = index;
        this.startGame(index);
    }
    
    // Start new game
    startGame(difficultyIndex) {
        const config = DIFFICULTY_CONFIGS[difficultyIndex];
        if (!config) return;
        
        // Calculate optimal cell size for this difficulty
        this.cellSize = this.calculateCellSize(config);
        
        this.currentGame = new MineFinderGame(config.rows, config.cols, config.mines, this.cellSize, this.adaptive);
        
        // Show how-to hint on first launch only
        if (!this.hintShown) {
            this.hintShown = true;
            this.showHowToHint();
        }
    }
    
    // Show how-to hint (positioned on the right side of the game area)
    showHowToHint() {
        if (this.howToHint) return;
        const ad = this.adaptive || 0.8;
        const minePadSide = Math.floor(20 * ad);
        
        const hint = document.createElement('div');
        hint.id = 'howToHint';
        hint.style.cssText = `
            position: absolute;
            right: ${minePadSide}px;
            top: 50%;
            transform: translateY(-50%) translateX(${Math.floor(8 * ad)}px);
            background: linear-gradient(135deg, rgba(15, 20, 35, 0.7), rgba(20, 28, 50, 0.65));
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-top-color: rgba(255, 255, 255, 0.18);
            border-radius: ${Math.floor(10 * ad)}px;
            padding: ${Math.floor(8 * ad)}px ${Math.floor(12 * ad)}px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: ${Math.floor(7 * ad)}px;
            z-index: 100;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.04);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            max-width: ${Math.floor(120 * ad)}px;
        `;
        
        const text = document.createElement('span');
        text.innerHTML = 'Left-Click to Reveal<br>Right-Click to Flag';
        text.style.cssText = `
            color: rgba(255, 255, 255, 0.75);
            font-size: ${Math.floor(11 * ad)}px;
            font-weight: 500;
            font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
            letter-spacing: 0.3px;
            line-height: 1.4;
            text-align: center;
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
                hint.style.transform = 'translateY(-50%) translateX(0)';
            });
        });
        
        // Dismiss on first click on the game content
        const gameContent = document.querySelector('.gamecontent');
        if (gameContent) {
            const dismiss = () => {
                this.hideHowToHint();
                gameContent.removeEventListener('mousedown', dismiss);
            };
            gameContent.addEventListener('mousedown', dismiss);
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
    
    // Restart current game
    restart() {
        // Remove mine-finder-message when game restarts (button clicked)
        const mineFinderMessage = document.getElementById('mine-finder-message');
        if (mineFinderMessage) {
            mineFinderMessage.remove();
        }
        
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        if (this.currentGame) {
            // Recalculate optimal cell size for current difficulty
            const config = DIFFICULTY_CONFIGS[this.currentDifficulty];
            if (config) {
                this.cellSize = this.calculateCellSize(config);
            }
            this.currentGame.cellSize = this.cellSize;
            this.currentGame.adaptive = this.adaptive;
            this.currentGame.init();
        }
    }
}

// Initialize game when DOM is ready
let gameManagerInstance = null;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        gameManagerInstance = new MineFinderGameManager();
        // Expose game manager to window for external access
        window.gameManager = gameManagerInstance;
    });
} else {
    gameManagerInstance = new MineFinderGameManager();
    // Expose game manager to window for external access
    window.gameManager = gameManagerInstance;
}

