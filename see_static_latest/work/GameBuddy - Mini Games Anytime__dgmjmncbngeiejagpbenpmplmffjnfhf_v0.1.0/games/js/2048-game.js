/*
 * 2048 Game - Alternative Implementation
 * Rewritten with different code structure and algorithms
 * Uses ES6 classes, native JavaScript, and different merge logic
 */

// Resource path configuration
(function() {
    'use strict';
    if (!window.__gameResourceBase) {
        window.__gameResourceBase = '../';
    }
    
    window.getGameResource = function(relativePath) {
        if (relativePath.startsWith('http') || relativePath.startsWith('chrome-extension')) {
            return relativePath;
        }
        const cleanPath = relativePath.replace(/^\.\.\//, '');
        return window.__gameResourceBase + cleanPath;
    };
})();

// Game constants
const GRID_SIZE = 4;
const CELL_SIZE = 95;
const CELL_PADDING = 15;
const ANIMATION_DURATION = 200;
const STORAGE_KEYS = {
    BOARD: '2048-game_v2_board',
    SCORE: '2048-game_v2_score',
    BEST: '2048-game_v2_best'
};

// 2048 Game Class
class Game2048 {
    constructor() {
        // Screen dimensions
        this.screenWidth = window.innerWidth - 80;
        this.screenHeight = window.innerHeight - Math.max(100, Math.floor(window.innerHeight * 0.14));
        this.gameDefaultWidth = 680;
        this.gameDefaultHeight = 490;
        this.gameboxBaseHeight = 440; // Original content height for gamebox sizing
        
        // Calculate adaptive size
        const modSize = (this.screenWidth < 800 || this.screenHeight < 600) ? 10 : 0;
        this.adaptive = Math.min(
            this.screenWidth / (this.gameDefaultWidth + modSize),
            this.screenHeight / (this.gameDefaultHeight + modSize)
        ) || 0.8;
        
        // Cell size and padding based on adaptive scaling
        this.cellSize = Math.floor(CELL_SIZE * this.adaptive);
        this.cellPadding = Math.floor(CELL_PADDING * this.adaptive);
        
        this.grid = this.createEmptyGrid();
        this.score = 0;
        this.bestScore = 0;
        this.mergedCells = new Set(); // Track merged cells in current move
        this.isAnimating = false;
        this.footerHidden = false;
        
        this.init();
    }
    
    // Create empty 4x4 grid
    createEmptyGrid() {
        return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
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
        
        // Recalculate cell size and padding
        this.cellSize = Math.floor(CELL_SIZE * this.adaptive);
        this.cellPadding = Math.floor(CELL_PADDING * this.adaptive);
        
        // Update UI with new sizes
        this.setupUI();
    }
    
    // Initialize game
    init() {
        //if (window.innerWidth < 768) {
            //return;
        //}
        
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        // Hide game over mask initially
        const mask = document.getElementById('mask');
        if (mask) {
            mask.style.display = 'none';
        }
        
        // Load game state (async for chrome.storage, sync for localStorage fallback)
        this.loadGameState();
        
        // Setup event listeners immediately
        this.setupEventListeners();
        
        // Render will be called after loadGameState completes (for chrome.storage)
        // For localStorage fallback, render immediately
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
            this.render();
            if (!this.hasNumbers()) {
                this.addRandomTile();
            }
        }
        // For chrome.storage, render is called in loadGameState callback
        
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
            width: ${Math.floor(150 * ad)}px;
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
            float: left;
            box-sizing: border-box;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.04);
        `;
        
        const text = document.createElement('span');
        text.textContent = 'Move & Merge Tiles';
        text.style.cssText = `
            color: rgba(255, 255, 255, 0.75);
            font-size: ${Math.floor(11 * ad)}px;
            font-weight: 500;
            font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
            letter-spacing: 0.3px;
            line-height: 1.4;
        `;
        
        hint.appendChild(text);
        const header = document.querySelector('.header');
        if (header) {
            header.appendChild(hint);
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
    
    // Setup UI elements
    setupUI() {
        // Match classic-maze gamebox height (total rendered height including padding)
        const classicCellH = Math.floor(30 * this.adaptive);
        const classicPadH = Math.floor(15 * this.adaptive);
        const classicGameboxH = classicCellH * 14 + classicPadH * 2 + 2 + classicCellH;
        const gameboxPad = Math.floor(10 * this.adaptive);
        // Subtract padding so total rendered height (content + 2*padding) = classicGameboxH
        const gameboxContentH = Math.max(Math.floor(this.gameboxBaseHeight * this.adaptive), classicGameboxH - 2 * gameboxPad);
        const gmPad = Math.floor(5 * this.adaptive);
        const gmMarginTop = Math.floor(10 * this.adaptive);
        const gmMarginBottom = Math.floor(5 * this.adaptive);
        
        // Compute gm-content height to fill the gamebox content area
        const gmContentH = gameboxContentH - gmMarginTop - gmMarginBottom - 2 * gmPad;
        
        // Vertical padding inside gm-content to center the grid
        const gridH = this.cellSize * GRID_SIZE;
        const vertPad = Math.max(this.cellPadding, Math.floor((gmContentH - gridH) / 2));
        
        // Update gamebox size
        const gamebox = document.getElementById('gamebox');
        if (gamebox) {
            gamebox.style.width = `${Math.floor(this.gameDefaultWidth * this.adaptive)}px`;
            gamebox.style.height = `${gameboxContentH}px`;
            gamebox.style.fontSize = `${Math.floor(18 * this.adaptive)}px`;
            gamebox.style.padding = `${gameboxPad}px`;
        }
        
        // Update header styles
        const header = document.querySelector('.header');
        if (header) {
            header.style.top = `${Math.floor(10 * this.adaptive)}px`;
            header.style.width = `${Math.floor(150 * this.adaptive)}px`;
            header.style.paddingRight = `${Math.floor(10 * this.adaptive)}px`;
        }
        
        // Update score styles
        const score = document.querySelector('.score');
        if (score) {
            score.style.width = `${Math.floor(150 * this.adaptive)}px`;
            score.style.fontSize = `${Math.floor(25 * this.adaptive)}px`;
        }
        
        // Update score boxes
        const currentScore = document.querySelector('.score .current');
        const bestScore = document.querySelector('.score .best');
        if (currentScore) {
            currentScore.style.width = `${Math.floor(150 * this.adaptive)}px`;
            currentScore.style.fontSize = `${Math.floor(20 * this.adaptive)}px`;
            currentScore.style.margin = `${Math.floor(5 * this.adaptive)}px 0px`;
            currentScore.style.padding = `${Math.floor(5 * this.adaptive)}px`;
            currentScore.style.borderRadius = `${Math.floor(3 * this.adaptive)}px`;
        }
        if (bestScore) {
            bestScore.style.width = `${Math.floor(150 * this.adaptive)}px`;
            bestScore.style.fontSize = `${Math.floor(20 * this.adaptive)}px`;
            bestScore.style.margin = `${Math.floor(5 * this.adaptive)}px 0px`;
            bestScore.style.padding = `${Math.floor(5 * this.adaptive)}px`;
            bestScore.style.borderRadius = `${Math.floor(3 * this.adaptive)}px`;
        }
        
        // Update score labels
        const scoreLabels = document.querySelectorAll('.score label');
        scoreLabels.forEach(label => {
            label.style.fontSize = `${Math.floor(20 * this.adaptive)}px`;
            label.style.lineHeight = `${Math.floor(22 * this.adaptive)}px`;
        });
        
        // Update refresh button
        const refresh = document.querySelector('.refresh');
        if (refresh) {
            refresh.style.width = `${Math.floor(150 * this.adaptive)}px`;
            const refreshSpan = refresh.querySelector('span');
            if (refreshSpan) {
                refreshSpan.style.width = `${Math.floor(150 * this.adaptive)}px`;
                refreshSpan.style.padding = `${Math.floor(5 * this.adaptive)}px`;
                refreshSpan.style.fontSize = `${Math.floor(20 * this.adaptive)}px`;
                refreshSpan.style.borderRadius = `${Math.floor(4 * this.adaptive)}px`;
            }
        }
        
        // Update game content area - expand to fill gamebox
        const gmContent = document.getElementById('gm-content');
        if (gmContent) {
            const contentWidth = this.cellSize * GRID_SIZE + this.cellPadding * 2;
            gmContent.style.width = `${contentWidth}px`;
            gmContent.style.height = `${gmContentH}px`;
            gmContent.style.marginTop = `${gmMarginTop}px`;
            gmContent.style.marginLeft = `${Math.floor(50 * this.adaptive)}px`;
            gmContent.style.marginBottom = `${gmMarginBottom}px`;
            gmContent.style.padding = `${gmPad}px`;
            gmContent.style.borderRadius = `${Math.floor(10 * this.adaptive)}px`;
        }
        
        // Position grid cells - center vertically within expanded gm-content
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const cell = document.getElementById(`blockage-${row}-${col}`);
                if (cell) {
                    cell.style.top = `${vertPad + row * this.cellSize}px`;
                    cell.style.left = `${this.cellPadding + col * this.cellSize}px`;
                    cell.style.width = `${this.cellSize}px`;
                    cell.style.height = `${this.cellSize}px`;
                    cell.style.borderRadius = `${Math.floor(8 * this.adaptive)}px`;
                    cell.style.lineHeight = `${this.cellSize}px`;
                }
            }
        }
        
        // Update mask (game over overlay) - cover the full padding box
        const mask = document.getElementById('mask');
        if (mask) {
            mask.style.width = `${Math.floor(this.gameDefaultWidth * this.adaptive)}px`;
            mask.style.height = `${gameboxContentH + 2 * gameboxPad - 4}px`;
        }
        
        // Update game over wrapper
        const gameoverWrapper = document.getElementById('gameoverwrapper');
        if (gameoverWrapper) {
            gameoverWrapper.style.gap = `${Math.floor(24 * this.adaptive)}px`;
        }
        
        // Update game over text
        const gameoverText = document.getElementById('gameovertext');
        if (gameoverText) {
            gameoverText.style.fontSize = `${Math.floor(42 * this.adaptive)}px`;
        }
        
        // Update restart button
        const restartGame = document.getElementById('restart_game');
        if (restartGame) {
            restartGame.style.padding = `${Math.floor(8 * this.adaptive)}px ${Math.floor(20 * this.adaptive)}px`;
            restartGame.style.margin = `${Math.floor(6 * this.adaptive)}px ${Math.floor(20 * this.adaptive)}px`;
            restartGame.style.fontSize = `${Math.floor(28 * this.adaptive)}px`;
            restartGame.style.borderRadius = `${Math.floor(8 * this.adaptive)}px`;
            restartGame.style.whiteSpace = 'nowrap';
        }
        
        // Update addScore
        const addScore = document.getElementById('addScore');
        if (addScore) {
            addScore.style.top = `${Math.floor(350 * this.adaptive)}px`;
            addScore.style.left = `${Math.floor(40 * this.adaptive)}px`;
            addScore.style.fontSize = `${Math.floor(36 * this.adaptive)}px`;
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Touch/swipe support
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 30) this.move('right');
                else if (deltaX < -30) this.move('left');
            } else {
                if (deltaY > 30) this.move('down');
                else if (deltaY < -30) this.move('up');
            }
            
            touchStartX = 0;
            touchStartY = 0;
        });
        
        // New game button
        const initBtn = document.getElementById('init_game');
        const restartBtn = document.getElementById('restart_game');
        
        if (initBtn) {
            initBtn.addEventListener('click', () => this.newGame());
        }
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.newGame());
        }
    }
    
    // Handle keyboard input
    handleKeyPress(event) {
        this.hideHowToHint();
        if (this.isAnimating) return;
        
        const keyMap = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
        
        const direction = keyMap[event.keyCode];
        if (direction) {
            event.preventDefault();
            this.hideFooter();
            this.move(direction);
        }
    }
    
    // Main move function
    move(direction) {
        if (this.isAnimating) return false;
        
        const previousGrid = this.copyGrid(this.grid);
        let moved = false;
        
        switch (direction) {
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
        }
        
        if (moved) {
            this.isAnimating = true;
            this.mergedCells.clear();
            
            // Add random tile after move
            setTimeout(() => {
                this.addRandomTile();
                this.saveGameState();
                this.isAnimating = false;
                
                // Check game over
                setTimeout(() => {
                    if (!this.hasEmptyCells() && !this.canMove()) {
                        this.gameOver();
                    }
                }, 300);
            }, ANIMATION_DURATION);
            
            return true;
        }
        
        return false;
    }
    
    // Move left - using different algorithm
    moveLeft() {
        let moved = false;
        
        for (let row = 0; row < GRID_SIZE; row++) {
            const line = this.grid[row].filter(val => val !== 0);
            const merged = this.mergeLine(line);
            
            // Pad with zeros
            while (merged.length < GRID_SIZE) {
                merged.push(0);
            }
            
            // Check if changed
            if (!this.arraysEqual(this.grid[row], merged)) {
                moved = true;
                this.grid[row] = merged;
            }
        }
        
        if (moved) {
            this.updateDisplay();
        }
        
        return moved;
    }
    
    // Move right - using different algorithm
    moveRight() {
        let moved = false;
        
        for (let row = 0; row < GRID_SIZE; row++) {
            const line = this.grid[row].filter(val => val !== 0);
            const merged = this.mergeLine(line);
            
            // Pad with zeros at the beginning
            while (merged.length < GRID_SIZE) {
                merged.unshift(0);
            }
            
            // Check if changed
            if (!this.arraysEqual(this.grid[row], merged)) {
                moved = true;
                this.grid[row] = merged;
            }
        }
        
        if (moved) {
            this.updateDisplay();
        }
        
        return moved;
    }
    
    // Move up - using different algorithm
    moveUp() {
        let moved = false;
        
        for (let col = 0; col < GRID_SIZE; col++) {
            const line = [];
            for (let row = 0; row < GRID_SIZE; row++) {
                if (this.grid[row][col] !== 0) {
                    line.push(this.grid[row][col]);
                }
            }
            
            const merged = this.mergeLine(line);
            
            // Update column
            for (let row = 0; row < GRID_SIZE; row++) {
                const oldVal = this.grid[row][col];
                const newVal = row < merged.length ? merged[row] : 0;
                
                if (oldVal !== newVal) {
                    moved = true;
                    this.grid[row][col] = newVal;
                }
            }
        }
        
        if (moved) {
            this.updateDisplay();
        }
        
        return moved;
    }
    
    // Move down - using different algorithm
    moveDown() {
        let moved = false;
        
        for (let col = 0; col < GRID_SIZE; col++) {
            const line = [];
            for (let row = GRID_SIZE - 1; row >= 0; row--) {
                if (this.grid[row][col] !== 0) {
                    line.push(this.grid[row][col]);
                }
            }
            
            const merged = this.mergeLine(line);
            
            // Update column (reverse order)
            for (let row = GRID_SIZE - 1; row >= 0; row--) {
                const index = GRID_SIZE - 1 - row;
                const oldVal = this.grid[row][col];
                const newVal = index < merged.length ? merged[index] : 0;
                
                if (oldVal !== newVal) {
                    moved = true;
                    this.grid[row][col] = newVal;
                }
            }
        }
        
        if (moved) {
            this.updateDisplay();
        }
        
        return moved;
    }
    
    // Merge line - different algorithm using stack-like approach
    mergeLine(line) {
        if (line.length === 0) return [];
        
        const result = [];
        let i = 0;
        
        while (i < line.length) {
            if (i < line.length - 1 && line[i] === line[i + 1]) {
                // Merge two equal tiles
                const merged = line[i] * 2;
                result.push(merged);
                this.score += merged;
                this.showScoreAnimation(merged);
                i += 2; // Skip next tile as it's merged
            } else {
                result.push(line[i]);
                i++;
            }
        }
        
        return result;
    }
    
    // Check if two arrays are equal
    arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }
    
    // Copy grid
    copyGrid(grid) {
        return grid.map(row => [...row]);
    }
    
    // Add random tile
    addRandomTile() {
        const emptyCells = this.getEmptyCells();
        if (emptyCells.length === 0) return false;
        
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const [row, col] = emptyCells[randomIndex];
        
        // 90% chance for 2, 10% chance for 4
        const value = Math.random() < 0.9 ? 2 : 4;
        this.grid[row][col] = value;
        
        this.renderCell(row, col, value, true);
        return true;
    }
    
    // Get all empty cells
    getEmptyCells() {
        const empty = [];
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (this.grid[row][col] === 0) {
                    empty.push([row, col]);
                }
            }
        }
        return empty;
    }
    
    // Check if grid has numbers
    hasNumbers() {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (this.grid[row][col] !== 0) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // Check if has empty cells
    hasEmptyCells() {
        return this.getEmptyCells().length > 0;
    }
    
    // Check if can move
    canMove() {
        // Check horizontal moves
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE - 1; col++) {
                if (this.grid[row][col] === this.grid[row][col + 1]) {
                    return true;
                }
            }
        }
        
        // Check vertical moves
        for (let col = 0; col < GRID_SIZE; col++) {
            for (let row = 0; row < GRID_SIZE - 1; row++) {
                if (this.grid[row][col] === this.grid[row + 1][col]) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // Update display after move
    updateDisplay() {
        this.render();
    }
    
    // Render entire grid
    render() {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const value = this.grid[row][col];
                this.renderCell(row, col, value, false);
            }
        }
        
        this.updateScore();
    }
    
    // Render single cell
    renderCell(row, col, value, isNew) {
        // Update s-border and num-border classes with adaptive values
        const sBorderElements = document.querySelectorAll('.s-border');
        sBorderElements.forEach(element => {
            element.style.width = `${Math.floor(80 * this.adaptive)}px`;
            element.style.height = `${Math.floor(80 * this.adaptive)}px`;
            element.style.borderRadius = `${Math.floor(8 * this.adaptive)}px`;
        });
        
        const numBorderElements = document.querySelectorAll('.num-border');
        numBorderElements.forEach(element => {
            element.style.lineHeight = `${Math.floor(80 * this.adaptive)}px`;
        });
        const cell = document.getElementById(`blockage-${row}-${col}`);
        if (!cell) return;
        
        if (value === 0) {
            cell.textContent = '';
            cell.className = 's-border';
            cell.style.backgroundColor = '#cdc1b4';
            cell.style.fontSize = `${Math.floor(50 * this.adaptive)}px`;
            cell.style.color = '';
        } else {
            cell.textContent = value;
            cell.className = 's-border num-border';
            const styles = this.getCellStyles(value);
            Object.assign(cell.style, styles);
            
            if (isNew) {
                cell.style.opacity = '0';
                setTimeout(() => {
                    cell.style.transition = 'opacity 200ms';
                    cell.style.opacity = '1';
                }, 10);
            }
        }
    }
    
    // Get cell styles based on value
    getCellStyles(value) {
        const styles = {
            2: { backgroundColor: '#eee4de', color: '#776e65', fontSize: `${Math.floor(65 * this.adaptive)}px` },
            4: { backgroundColor: '#ede0c8', color: '#776e65', fontSize: `${Math.floor(65 * this.adaptive)}px` },
            8: { backgroundColor: '#f2b179', color: '#fff', fontSize: `${Math.floor(65 * this.adaptive)}px` },
            16: { backgroundColor: '#f59563', color: '#fff', fontSize: `${Math.floor(65 * this.adaptive)}px` },
            32: { backgroundColor: '#f67c5f', color: '#fff', fontSize: `${Math.floor(65 * this.adaptive)}px` },
            64: { backgroundColor: '#f65e3b', color: '#fff', fontSize: `${Math.floor(65 * this.adaptive)}px` },
            128: { backgroundColor: '#edcf72', color: '#fff', fontSize: `${Math.floor(50 * this.adaptive)}px` },
            256: { backgroundColor: '#edcc61', color: '#fff', fontSize: `${Math.floor(46 * this.adaptive)}px` },
            512: { backgroundColor: '#9c0', color: '#fff', fontSize: `${Math.floor(46 * this.adaptive)}px` },
            1024: { backgroundColor: '#33b5e5', color: '#fff', fontSize: `${Math.floor(36 * this.adaptive)}px` },
            2048: { backgroundColor: '#09c', color: '#fff', fontSize: `${Math.floor(32 * this.adaptive)}px` },
            4096: { backgroundColor: '#a6c', color: '#fff', fontSize: `${Math.floor(32 * this.adaptive)}px` },
            8192: { backgroundColor: '#a6c', color: '#fff', fontSize: `${Math.floor(32 * this.adaptive)}px` }
        };
        
        return styles[value] || { backgroundColor: '#000', color: '#fff', fontSize: `${Math.floor(25 * this.adaptive)}px` };
    }
    
    // Update score display
    updateScore() {
        const scoreEl = document.getElementById('score');
        const bestEl = document.getElementById('bestScore');
        
        if (scoreEl) {
            scoreEl.textContent = this.score;
        }
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            if (bestEl) {
                bestEl.textContent = this.bestScore;
            }
        } else if (bestEl) {
            bestEl.textContent = this.bestScore;
        }
    }
    
    // Show score animation
    showScoreAnimation(points) {
        const addScoreEl = document.getElementById('addScore');
        if (!addScoreEl) return;
        
        addScoreEl.textContent = `+${points}`;
        addScoreEl.style.opacity = '1';
        addScoreEl.style.top = '250px';
        
        setTimeout(() => {
            addScoreEl.style.transition = 'opacity 600ms, top 600ms';
            addScoreEl.style.opacity = '0';
            addScoreEl.style.top = '350px';
        }, 10);
    }
    
    // Save game state
    saveGameState() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({
                    [STORAGE_KEYS.BOARD]: JSON.stringify(this.grid),
                    [STORAGE_KEYS.SCORE]: JSON.stringify(this.score),
                    [STORAGE_KEYS.BEST]: JSON.stringify(this.bestScore)
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.warn('Failed to save game state:', chrome.runtime.lastError);
                    }
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                localStorage.setItem(STORAGE_KEYS.BOARD, JSON.stringify(this.grid));
                localStorage.setItem(STORAGE_KEYS.SCORE, JSON.stringify(this.score));
                localStorage.setItem(STORAGE_KEYS.BEST, JSON.stringify(this.bestScore));
            }
        } catch (e) {
            console.warn('Failed to save game state:', e);
        }
    }
    
    // Load game state
    loadGameState() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get([STORAGE_KEYS.BOARD, STORAGE_KEYS.SCORE, STORAGE_KEYS.BEST], (result) => {
                    if (chrome.runtime.lastError) {
                        this.grid = this.createEmptyGrid();
                        return;
                    }
                    
                    if (result[STORAGE_KEYS.BOARD]) {
                        try {
                            this.grid = JSON.parse(result[STORAGE_KEYS.BOARD]);
                        } catch (e) {
                            this.grid = this.createEmptyGrid();
                        }
                    }
                    
                    if (result[STORAGE_KEYS.SCORE]) {
                        try {
                            this.score = parseInt(JSON.parse(result[STORAGE_KEYS.SCORE]), 10) || 0;
                        } catch (e) {
                            this.score = 0;
                        }
                    }
                    
                    if (result[STORAGE_KEYS.BEST]) {
                        try {
                            this.bestScore = parseInt(JSON.parse(result[STORAGE_KEYS.BEST]), 10) || 0;
                        } catch (e) {
                            this.bestScore = 0;
                        }
                    }
                    
                    // Render and update UI after loading
                    this.render();
                    this.updateScore();
                    
                    if (!this.hasNumbers()) {
                        this.addRandomTile();
                    }
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                const savedBoard = localStorage.getItem(STORAGE_KEYS.BOARD);
                const savedScore = localStorage.getItem(STORAGE_KEYS.SCORE);
                const savedBest = localStorage.getItem(STORAGE_KEYS.BEST);
                
                if (savedBoard) {
                    this.grid = JSON.parse(savedBoard);
                }
                
                if (savedScore) {
                    this.score = parseInt(JSON.parse(savedScore), 10) || 0;
                }
                
                if (savedBest) {
                    this.bestScore = parseInt(JSON.parse(savedBest), 10) || 0;
                }
            }
        } catch (e) {
            this.grid = this.createEmptyGrid();
        }
    }
    
    // New game
    newGame() {
        // Hide game over mask
        const mask = document.getElementById('mask');
        if (mask) {
            mask.style.display = 'none';
        }
        
        // Reset game state
        this.grid = this.createEmptyGrid();
        this.score = 0;
        this.mergedCells.clear();
        this.isAnimating = false;
        this.footerHidden = false;
        
        // Clear saved state
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.remove([STORAGE_KEYS.BOARD, STORAGE_KEYS.SCORE], () => {
                if (chrome.runtime.lastError) {
                    console.warn('Failed to clear game state:', chrome.runtime.lastError);
                }
            });
        } else {
            // Fallback to localStorage if chrome.storage is not available
            localStorage.removeItem(STORAGE_KEYS.BOARD);
            localStorage.removeItem(STORAGE_KEYS.SCORE);
        }
        
        // Clear all cells first
        this.clearAllCells();
        
        // Render and add initial tile
        this.render();
        this.addRandomTile(); // Start with 1 tile
        this.saveGameState();
    }
    
    // Clear all cells
    clearAllCells() {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const cell = document.getElementById(`blockage-${row}-${col}`);
                if (cell) {
                    cell.textContent = '';
                    cell.className = 's-border';
                    cell.style.backgroundColor = '#cdc1b4';
                    cell.style.fontSize = `${Math.floor(50 * this.adaptive)}px`;
                    cell.style.color = '';
                    cell.style.opacity = '1';
                    cell.style.transition = '';
                }
            }
        }
    }
    
    // Game over
    gameOver() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ [STORAGE_KEYS.BEST]: JSON.stringify(this.bestScore) }, () => {
                    if (chrome.runtime.lastError) {
                        console.warn('Failed to save best score:', chrome.runtime.lastError);
                    }
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                localStorage.setItem(STORAGE_KEYS.BEST, JSON.stringify(this.bestScore));
            }
        }
        
        // Clear saved state
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.remove([STORAGE_KEYS.BOARD, STORAGE_KEYS.SCORE], () => {
                if (chrome.runtime.lastError) {
                    console.warn('Failed to clear game state:', chrome.runtime.lastError);
                }
            });
        } else {
            // Fallback to localStorage if chrome.storage is not available
            localStorage.removeItem(STORAGE_KEYS.BOARD);
            localStorage.removeItem(STORAGE_KEYS.SCORE);
        }
        
        const mask = document.getElementById('mask');
        if (mask) {
            mask.style.display = 'flex';
        }
    }
    
    // Hide footer
    hideFooter() {
        if (!this.footerHidden) {
            const footer = document.getElementById('footer');
            if (footer) {
                footer.style.display = 'none';
            }
            this.footerHidden = true;
        }
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Game2048();
    });
} else {
    new Game2048();
}

