/*
 * Word Search Game - Alternative Implementation
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
const GRID_SIZE = 8;
const WORDS_TO_FIND = 4;
const STORAGE_WORDS_KEY = 'word-search_wd';
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Highlight colors
const HIGHLIGHT_COLORS = [
    "highlighted-brown",
    "highlighted-blue",
    "highlighted-green",
    "highlighted-orange"
];

// Cell class
class Cell {
    constructor(row, col, letter, id) {
        this.row = row;
        this.col = col;
        this.letter = letter;
        this.id = id;
        this.element = null;
    }
    
    // Create DOM element
    createElement(container, cellWidth, cellHeight, adaptive) {
        this.element = document.createElement('div');
        this.element.classList.add('cell');
        this.element.id = this.id;
        this.element.setAttribute('data-row', this.row);
        this.element.setAttribute('data-col', this.col);
        this.element.textContent = this.letter;
        this.element.style.width = `${cellWidth}px`;
        this.element.style.height = `${cellHeight}px`;
        //this.element.style.fontSize = `${Math.floor(1.8 * adaptive)}em`;
        this.element.style.fontSize = `${1.8 * adaptive}em`;
        this.element.style.fontWeight = 'bold';
        this.element.style.color = '#fff';
        
        // Set adaptive border width
        const borderWidth = Math.max(1, Math.floor(1 * adaptive));
        
        // Add border classes for grid layout
        if (this.col === 7) {
            this.element.classList.add('rbd');
        } else {
            this.element.style.borderRight = `${borderWidth}px solid #333`;
        }
        if (this.row === 7) {
            this.element.classList.add('bbd');
        } else {
            this.element.style.borderBottom = `${borderWidth}px solid #333`;
        }
        
        container.appendChild(this.element);
    }
    
    // Add highlight
    addHighlight(color) {
        if (this.element) {
            this.element.classList.add(color);
        }
    }
    
    // Remove highlight
    removeHighlight(color) {
        if (this.element) {
            this.element.classList.remove(color);
        }
    }
}

// Word Search Game Class
class WordSearchGame {
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
        this.cellWidth = Math.floor(60 * this.adaptive);
        this.cellHeight = Math.floor(52 * this.adaptive);
        
        // Game state
        this.grid = [];
        this.cells = [];
        this.wordsToFind = [];
        this.foundWords = [];
        this.wordColorList = [...HIGHLIGHT_COLORS];
        this.allWords = null;
        
        // DOM elements
        this.wordSearchGrid = null;
        this.wordList = null;
        this.msg = null;
        
        // Event controller
        this.clickController = null;
        
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
        
        // Recalculate cell size
        this.cellWidth = Math.floor(60 * this.adaptive);
        this.cellHeight = Math.floor(52 * this.adaptive);
        
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
        
        // Load words and start game
        this.loadWords();
    }
    
    // Setup UI elements
    setupUI() {
        this.wordSearchGrid = document.getElementById('wordSearchGrid');
        this.wordList = document.getElementById('wordList');
        this.msg = document.getElementById('msg');
        
        if (!this.wordSearchGrid || !this.wordList) {
            return;
        }
        
        // Update gamebox size
        const gamebox = document.getElementById('gamebox');
        if (gamebox) {
            gamebox.style.width = `${Math.floor(this.gameDefaultWidth * this.adaptive)}px`;
            // Match classic-maze gamebox height
            const classicCellH = Math.floor(30 * this.adaptive);
            const classicPadH = Math.floor(15 * this.adaptive);
            const classicGameboxH = classicCellH * 14 + classicPadH * 2 + 2 + classicCellH;
            gamebox.style.height = `${Math.max(Math.floor(this.gameboxBaseHeight * this.adaptive), classicGameboxH)}px`;
        }
        
        // Update wordSearchContainer
        const wordSearchContainer = document.getElementById('wordSearchContainer');
        if (wordSearchContainer) {
            wordSearchContainer.style.padding = `${Math.floor(10 * this.adaptive)}px`;
        }
        
        // Update wordSearchGrid
        if (this.wordSearchGrid) {
            this.wordSearchGrid.style.gridTemplateColumns = `repeat(${GRID_SIZE}, ${this.cellWidth}px)`;
        }
        
        // Update wordListContainer
        const wordListContainer = document.getElementById('wordListContainer');
        if (wordListContainer) {
            wordListContainer.style.height = `${Math.floor(60 * this.adaptive)}px`;
            wordListContainer.style.padding = `${Math.floor(25 * this.adaptive)}px`;
            wordListContainer.style.width = `${Math.floor(150 * this.adaptive)}px`;
        }
        
        // Update wordList padding
        if (this.wordList) {
            this.wordList.style.padding = '0';
        }
        
        // Update wordList items
        const wordListItems = this.wordList.querySelectorAll('li');
        wordListItems.forEach(item => {
            item.style.width = `${Math.floor(100 * this.adaptive)}px`;
            //item.style.fontSize = `${Math.floor(1.4 * this.adaptive)}em`;
            item.style.fontSize = `${1.4 * this.adaptive}em`;
            item.style.height = `${Math.floor(40 * this.adaptive)}px`;
            item.style.listStyle = 'none';
            item.style.float = 'left';
            // Set font weight and color
            if (!item.classList.contains('label')) {
                item.style.fontWeight = 'bold';
                item.style.color = 'greenyellow';
            } else {
                item.style.color = '#686868';
            }
        });
        
        // Update msg
        if (this.msg) {
            this.msg.style.fontSize = `${Math.floor(36 * this.adaptive)}px`;
            this.msg.style.fontWeight = '900';
            this.msg.style.fontStyle = 'italic';
            this.msg.style.color = 'lightseagreen';
        }
        
        // Update all cells
        const cells = this.wordSearchGrid.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.style.width = `${this.cellWidth}px`;
            cell.style.height = `${this.cellHeight}px`;
            //cell.style.fontSize = `${Math.floor(1.8 * this.adaptive)}em`;
            cell.style.fontSize = `${1.8 * this.adaptive}em`;
            // Set adaptive border width
            const borderWidth = Math.max(1, Math.floor(1 * this.adaptive));
            if (!cell.classList.contains('rbd')) {
                cell.style.borderRight = `${borderWidth}px solid #333`;
            }
            if (!cell.classList.contains('bbd')) {
                cell.style.borderBottom = `${borderWidth}px solid #333`;
            }
        });
    }
    
    // Load words from storage or fetch from JSON
    loadWords() {
        const storedWords = localStorage.getItem(STORAGE_WORDS_KEY);
        
        if (storedWords) {
            // Load from storage
            this.allWords = storedWords.split(',');
            this.startGame();
        } else {
            // Fetch from JSON
            this.fetchWords();
        }
    }
    
    // Fetch words from JSON file
    fetchWords() {
        let resourceUrl = window.getGameResource('data/word-search.json');
        
        // Ensure the URL is absolute - try multiple methods
        if (!resourceUrl.startsWith('http://') && !resourceUrl.startsWith('https://') && 
            !resourceUrl.startsWith('chrome-extension://')) {
            // Method 1: Try chrome.runtime.getURL
            try {
                if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
                    resourceUrl = chrome.runtime.getURL('games/data/word-search.json');
                }
            } catch (e) {
                // chrome.runtime.getURL not available
            }
            
            // Method 2: Try chrome.runtime.getURL (no hardcoded path)
            if (!resourceUrl.startsWith('chrome-extension://')) {
                try {
                    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
                        resourceUrl = chrome.runtime.getURL('games/data/word-search.json');
                    }
                } catch (e) {
                    // chrome.runtime.getURL not available
                }
            }
            
            // Method 3: Try parent window
            if (!resourceUrl.startsWith('chrome-extension://')) {
                try {
                    if (window.parent && window.parent !== window) {
                        const parentBase = window.parent.releasesBaseUrl || window.parent.__gameResourceBase;
                        if (parentBase && (parentBase.startsWith('chrome-extension://') ||
                                          parentBase.startsWith('http://') ||
                                          parentBase.startsWith('https://'))) {
                            resourceUrl = parentBase + 'data/word-search.json';
                        }
                    }
                } catch (e) {
                    // Cannot access parent
                }
            }
        }
        
        // Final check: if still relative, try one more time
        if (!resourceUrl.startsWith('http://') && !resourceUrl.startsWith('https://') && 
            !resourceUrl.startsWith('chrome-extension://')) {
            // Last resort: try chrome.runtime.getURL or extract from script src
            try {
                if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
                    resourceUrl = chrome.runtime.getURL('games/data/word-search.json');
                } else {
                    // Try to extract path from script src
                    const scripts = document.getElementsByTagName('script');
                    for (let i = 0; i < scripts.length; i++) {
                        const script = scripts[i];
                        if (script.src && script.src.startsWith('chrome-extension://')) {
                            const urlObj = new URL(script.src);
                            const pathParts = urlObj.pathname.split('/').filter(p => p);
                            const gamesIndex = pathParts.indexOf('games');
                            if (gamesIndex >= 0) {
                                resourceUrl = `${urlObj.origin}/${pathParts.slice(0, gamesIndex + 1).join('/')}/data/word-search.json`;
                                break;
                            }
                        }
                    }
                }
            } catch (e) {
                // All methods failed to construct absolute URL
            }
        }
        
        // If still relative, fetch will fail, but we'll handle it in catch
        fetch(resourceUrl, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then((response) => {
            if (response.status >= 200 && response.status < 300) {
                return response.json();
            } else {
                const err = new Error(response.statusText);
                err.response = response;
                throw err;
            }
        })
        .then((words) => {
            this.allWords = words;
            localStorage.setItem(STORAGE_WORDS_KEY, words.join(','));
            this.startGame();
        })
        .catch((err) => {
            // Try alternative URL if first attempt failed
            if (!resourceUrl.includes('chrome-extension://')) {
                try {
                    let altUrl = null;
                    // Try chrome.runtime.getURL first
                    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
                        altUrl = chrome.runtime.getURL('games/data/word-search.json');
                    }
                    // Fallback: extract from script src
                    if (!altUrl) {
                        const scripts = document.getElementsByTagName('script');
                        for (let i = 0; i < scripts.length; i++) {
                            const script = scripts[i];
                            if (script.src && script.src.startsWith('chrome-extension://')) {
                                const urlObj = new URL(script.src);
                                const pathParts = urlObj.pathname.split('/').filter(p => p);
                                const gamesIndex = pathParts.indexOf('games');
                                if (gamesIndex >= 0) {
                                    altUrl = `${urlObj.origin}/${pathParts.slice(0, gamesIndex + 1).join('/')}/data/word-search.json`;
                                    break;
                                }
                            }
                        }
                    }
                    if (altUrl) {
                        return fetch(altUrl, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            }
                        }).then((response) => {
                            if (response.status >= 200 && response.status < 300) {
                                return response.json();
                            } else {
                                throw new Error(response.statusText);
                            }
                        }).then((words) => {
                            this.allWords = words;
                            localStorage.setItem(STORAGE_WORDS_KEY, words.join(','));
                            this.startGame();
                        }).catch((e) => {
                            // Retry also failed
                        });
                    }
                } catch (e) {
                    // Retry setup failed
                }
            }
        });
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
    
    // Generate word search grid
    generateGrid(size, words) {
        // Initialize empty grid
        const grid = [];
        for (let i = 0; i < size; i++) {
            const row = [];
            for (let j = 0; j < size; j++) {
                row.push('');
            }
            grid.push(row);
        }
        
        // Place words in grid
        for (const word of words) {
            let placed = false;
            let attempts = 0;
            const maxAttempts = 100;
            
            while (!placed && attempts < maxAttempts) {
                const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                const row = Math.floor(Math.random() * size);
                const col = Math.floor(Math.random() * size);
                
                if (this.canPlaceWord(grid, word, row, col, direction)) {
                    this.placeWord(grid, word, row, col, direction);
                    placed = true;
                }
                attempts++;
            }
        }
        
        // Fill empty cells with random letters
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (grid[i][j] === '') {
                    grid[i][j] = LETTERS[Math.floor(Math.random() * LETTERS.length)];
                }
            }
        }
        
        return grid;
    }
    
    // Check if word can be placed
    canPlaceWord(grid, word, row, col, direction) {
        const wordLength = word.length;
        
        if (direction === 'horizontal') {
            if (col + wordLength > grid[0].length) {
                return false;
            }
            for (let i = 0; i < wordLength; i++) {
                if (grid[row][col + i] !== '') {
                    return false;
                }
            }
            return true;
        } else if (direction === 'vertical') {
            if (row + wordLength > grid.length) {
                return false;
            }
            for (let i = 0; i < wordLength; i++) {
                if (grid[row + i][col] !== '') {
                    return false;
                }
            }
            return true;
        }
        
        return false;
    }
    
    // Place word in grid
    placeWord(grid, word, row, col, direction) {
        const wordLength = word.length;
        
        if (direction === 'horizontal') {
            for (let i = 0; i < wordLength; i++) {
                grid[row][col + i] = word[i];
            }
        } else if (direction === 'vertical') {
            for (let i = 0; i < wordLength; i++) {
                grid[row + i][col] = word[i];
            }
        }
    }
    
    // Display word search grid
    displayGrid(grid) {
        if (!this.wordSearchGrid) return;
        
        // Clear content using removeChild instead of innerHTML
        while (this.wordSearchGrid.firstChild) {
            this.wordSearchGrid.removeChild(this.wordSearchGrid.firstChild);
        }
        this.cells = [];
        let cellId = 0;
        
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                const cell = new Cell(i, j, grid[i][j], cellId);
                cell.createElement(this.wordSearchGrid, this.cellWidth, this.cellHeight, this.adaptive);
                this.cells.push(cell);
                cellId++;
            }
        }
    }
    
    // Display word list
    displayWordList(words) {
        if (!this.wordList) return;
        
        // Clear existing content
        while (this.wordList.firstChild) {
            this.wordList.removeChild(this.wordList.firstChild);
        }
        
        // Create label element using DOM methods instead of innerHTML
        const labelItem = document.createElement('li');
        labelItem.className = 'label';
        labelItem.textContent = 'Words:';
        labelItem.style.width = `${Math.floor(100 * this.adaptive)}px`;
        //labelItem.style.fontSize = `${Math.floor(1.4 * this.adaptive)}em`;
        labelItem.style.fontSize = `${1.4 * this.adaptive}em`;
        labelItem.style.height = `${Math.floor(40 * this.adaptive)}px`;
        labelItem.style.listStyle = 'none';
        labelItem.style.float = 'left';
        labelItem.style.color = '#686868';
        this.wordList.appendChild(labelItem);
        
        words.forEach((word) => {
            const listItem = document.createElement('li');
            listItem.id = word;
            listItem.textContent = word;
            listItem.style.width = `${Math.floor(100 * this.adaptive)}px`;
            //listItem.style.fontSize = `${Math.floor(1.4 * this.adaptive)}em`;
            listItem.style.fontSize = `${1.4 * this.adaptive}em`;
            listItem.style.height = `${Math.floor(40 * this.adaptive)}px`;
            listItem.style.listStyle = 'none';
            listItem.style.float = 'left';
            listItem.style.fontWeight = 'bold';
            listItem.style.color = 'greenyellow';
            this.wordList.appendChild(listItem);
        });
    }
    
    // Mark word as found
    markWordFound(word) {
        const wordElement = document.getElementById(word);
        if (wordElement) {
            wordElement.style.textDecoration = 'line-through red';
            wordElement.style.textDecorationThickness = `${Math.floor(2 * this.adaptive)}px`;
        }
    }
    
    // Check horizontal word match
    checkHorizontal(cellIndex, row, col, word, wordColor) {
        const wordArray = word.split('');
        const wordLength = wordArray.length;
        
        // Check if word fits horizontally
        if (col + wordLength > GRID_SIZE) {
            return false;
        }
        
        // Check if word matches
        let currentCellIndex = cellIndex;
        for (let i = 0; i < wordLength; i++) {
            const cell = this.cells[currentCellIndex];
            if (!cell || cell.letter !== wordArray[i]) {
                // Remove highlights if match fails
                for (let j = 0; j < i; j++) {
                    this.cells[cellIndex + j].removeHighlight(wordColor);
                }
                return false;
            }
            
            // Check if we've moved to next row (shouldn't happen for horizontal)
            if (i > 0 && cell.row !== row) {
                for (let j = 0; j < i; j++) {
                    this.cells[cellIndex + j].removeHighlight(wordColor);
                }
                return false;
            }
            
            cell.addHighlight(wordColor);
            currentCellIndex++;
        }
        
        return true;
    }
    
    // Check vertical word match
    checkVertical(cellIndex, row, col, word, wordColor) {
        const wordArray = word.split('');
        const wordLength = wordArray.length;
        
        // Check if word fits vertically
        if (row + wordLength > GRID_SIZE) {
            return false;
        }
        
        // Check if word matches
        let currentCellIndex = cellIndex;
        for (let i = 0; i < wordLength; i++) {
            const cell = this.cells[currentCellIndex];
            if (!cell || cell.letter !== wordArray[i]) {
                // Remove highlights if match fails
                for (let j = 0; j < i; j++) {
                    this.cells[cellIndex + j * GRID_SIZE].removeHighlight(wordColor);
                }
                return false;
            }
            
            cell.addHighlight(wordColor);
            currentCellIndex += GRID_SIZE;
        }
        
        return true;
    }
    
    // Highlight word if found
    highlightWord(cellIndex, row, col, word) {
        if (this.wordColorList.length === 0) {
            return false;
        }
        
        const wordColor = this.wordColorList[this.wordColorList.length - 1];
        const cell = this.cells[cellIndex];
        
        if (!cell || cell.letter !== word[0]) {
            return false;
        }
        
        // Try horizontal first
        let found = false;
        
        // Check if horizontal is possible
        if (col + word.length <= GRID_SIZE) {
            // Try horizontal
            found = this.checkHorizontal(cellIndex, row, col, word, wordColor);
        }
        
        // If horizontal failed, try vertical
        if (!found && row + word.length <= GRID_SIZE) {
            // Remove any horizontal highlights first
            for (let i = 0; i < word.length && cellIndex + i < this.cells.length; i++) {
                this.cells[cellIndex + i].removeHighlight(wordColor);
            }
            
            found = this.checkVertical(cellIndex, row, col, word, wordColor);
        }
        
        if (found) {
            this.markWordFound(word);
            this.wordColorList.pop();
            return true;
        }
        
        return false;
    }
    
    // Check for words starting with clicked letter
    checkForWords(cellIndex, row, col, clickedLetter) {
        for (const word of this.wordsToFind) {
            if (this.foundWords.includes(word)) {
                continue; // Already found
            }
            
            if (word.startsWith(clickedLetter)) {
                if (this.highlightWord(cellIndex, row, col, word)) {
                    this.foundWords.push(word);
                    
                    // Check if all words found
                    if (this.foundWords.length === this.wordsToFind.length) {
                        this.showMessage();
                        // Reset color list
                        this.wordColorList = [...HIGHLIGHT_COLORS];
                        // Remove click listener
                        if (this.clickController) {
                            this.clickController.abort();
                        }
                        // Restart game after delay
                        setTimeout(() => {
                            this.startGame();
                        }, 2000);
                    }
                    return;
                }
            }
        }
    }
    
    // Show congratulations message
    showMessage() {
        if (this.msg) {
            // Ensure message completely covers gamebox
            const gamebox = document.getElementById('gamebox');
            if (gamebox) {
                this.msg.style.position = 'absolute';
                this.msg.style.top = '0';
                this.msg.style.left = '0';
                this.msg.style.width = '100%';
                this.msg.style.height = '100%';
                this.msg.style.zIndex = '1000';
            }
            
            // Center text both horizontally and vertically
            this.msg.style.display = 'flex';
            this.msg.style.alignItems = 'center';
            this.msg.style.justifyContent = 'center';
            this.msg.style.textAlign = 'center';
            this.msg.style.flexDirection = 'column';
            
            // Set adaptive font size for message
            this.msg.style.fontSize = `${Math.floor(36 * this.adaptive)}px`;
            this.msg.style.fontWeight = '900';
            this.msg.style.fontStyle = 'italic';
            this.msg.style.color = 'lightseagreen';
            
            // Clear existing content
            while (this.msg.firstChild) {
                this.msg.removeChild(this.msg.firstChild);
            }
            // Create message content using DOM methods instead of innerHTML
            const congratsText = document.createTextNode('Congratulations!');
            this.msg.appendChild(congratsText);
            const br = document.createElement('br');
            this.msg.appendChild(br);
            const allWordsText = document.createTextNode('All words found');
            this.msg.appendChild(allWordsText);
            this.msg.classList.add('full');
        }
    }
    
    // Start game
    startGame() {
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        // Reset state
        this.foundWords = [];
        this.wordColorList = [...HIGHLIGHT_COLORS];
        
        // Hide message
        if (this.msg) {
            if (this.msg.style.display !== 'none') {
                // Dispatch restart event if message was showing
                const event = new CustomEvent('restart', { detail: 'Restart Game' });
                document.dispatchEvent(event);
            }
            this.msg.style.display = 'none';
            this.msg.className = '';
        }
        
        // Remove existing click listener
        if (this.clickController) {
            this.clickController.abort();
        }
        
        // Shuffle and select words
        const shuffledWords = this.shuffle(this.allWords);
        this.wordsToFind = shuffledWords.slice(0, WORDS_TO_FIND);
        
        // Generate grid
        this.grid = this.generateGrid(GRID_SIZE, this.wordsToFind);
        
        // Display grid and word list
        this.displayGrid(this.grid);
        this.displayWordList(this.wordsToFind);
        
        // Setup click listener
        this.clickController = new AbortController();
        const { signal } = this.clickController;
        
        if (this.wordSearchGrid) {
            this.wordSearchGrid.addEventListener('click', (event) => {
                this.hideHowToHint();
                const clickedCell = event.target;
                if (clickedCell.classList.contains('cell')) {
                    const cellIndex = parseInt(clickedCell.id);
                    const row = parseInt(clickedCell.dataset.row);
                    const col = parseInt(clickedCell.dataset.col);
                    const clickedLetter = clickedCell.textContent;
                    
                    this.checkForWords(cellIndex, row, col, clickedLetter);
                }
            }, { signal });
        }
        
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
            clear: both;
            margin-top: ${Math.floor(10 * ad)}px;
            padding: ${Math.floor(8 * ad)}px ${Math.floor(10 * ad)}px;
            background: linear-gradient(135deg, rgba(15, 20, 35, 0.7), rgba(20, 28, 50, 0.65));
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-top-color: rgba(255, 255, 255, 0.18);
            border-radius: ${Math.floor(10 * ad)}px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: ${Math.floor(7 * ad)}px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.04);
        `;
        
        const text = document.createElement('span');
        text.textContent = 'Click the 1st Letter of Hidden Words';
        text.style.cssText = `
            color: rgba(255, 255, 255, 0.75);
            font-size: ${Math.floor(11 * ad)}px;
            font-weight: 500;
            font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
            letter-spacing: 0.3px;
            line-height: 1.4;
        `;
        
        hint.appendChild(text);
        const sidebar = document.getElementById('wordListContainer');
        if (sidebar) {
            sidebar.appendChild(hint);
        }
        this.howToHint = hint;
        
        // Entrance animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                hint.style.opacity = '1';
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
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new WordSearchGame();
    });
} else {
    new WordSearchGame();
}

