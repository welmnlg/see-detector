/*
 * Color Snake Game - Version 2
 * Rewritten using ES6 classes and Canvas API
 * Different code structure while maintaining same functionality
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

// Game states
const GAME_STATE = {
    INIT: 'init',
    START: 'start',
    GAME_OVER: 'gameOver'
};

// Direction constants
const DIRECTIONS = {
    UP: { dx: 0, dy: -1 },
    DOWN: { dx: 0, dy: 1 },
    LEFT: { dx: -1, dy: 0 },
    RIGHT: { dx: 1, dy: 0 }
};

// Game constants
const CELL_SIZE = 20;
const GAME_DEFAULT_WIDTH = 740;
const GAME_DEFAULT_HEIGHT = 490;
const MOVE_INTERVAL = 100;
const SNAKE_COLOR_CHANGE_MIN = 2; // seconds
const SNAKE_COLOR_CHANGE_MAX = 3; // seconds
const ITEM_COLOR_CHANGE_INTERVAL = 20000; // milliseconds

// Available colors
const COLORS = ['lawngreen', 'red', 'yellow'];

// Snake segment class
class SnakeSegment {
    constructor(x, y, color, cellSize) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.cellSize = cellSize;
    }
    
    // Draw segment on canvas
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.cellSize, this.cellSize);
    }
}

// Color Snake Game class
class ColorSnakeGame {
    constructor() {
        // Screen dimensions
        this.screenWidth = window.innerWidth - 80;
        this.screenHeight = window.innerHeight - Math.max(100, Math.floor(window.innerHeight * 0.14));
        this.gameDefaultWidth = GAME_DEFAULT_WIDTH;
        this.gameDefaultHeight = GAME_DEFAULT_HEIGHT;
        
        // Calculate adaptive size
        const modSize = (this.screenWidth < 800 || this.screenHeight < 600) ? 10 : 0;
        this.adaptive = Math.min(
            this.screenWidth / (this.gameDefaultWidth + modSize),
            this.screenHeight / (this.gameDefaultHeight + modSize)
        ) || 0.8;
        
        // Cell size based on adaptive scaling
        this.cellSize = Math.floor(CELL_SIZE * this.adaptive);
        
        // Game dimensions (will be calculated in updateAdaptiveSize)
        this.width = 0;
        this.height = 0;
        this.cols = 0;
        this.rows = 0;
        
        // Game state
        this.state = GAME_STATE.INIT;
        this.isGameOver = false;
        
        // Score
        this.score = 0;
        this.highScore = 0;
        
        // Game area
        this.gameArea = null;
        this.canvas = null;
        this.ctx = null;
        
        // Snake
        this.snake = [];
        this.currentColor = 'lawngreen';
        this.currentColorIndex = 0;
        this.direction = DIRECTIONS.RIGHT;
        this.nextDirection = DIRECTIONS.RIGHT;
        
        // Item
        this.item = null;
        
        // Timers
        this.animationFrame = null;
        this.snakeColorTimeout = null;
        this.itemColorTimeout = null;
        this.lastMoveTime = 0;
        
        // Scroll prevention
        this.scrollPreventionEnabled = false;
        
        // Resize handler
        this.resizeHandler = null;
        
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
        
        // Update UI with new sizes
        this.setupUI();
    }
    
    // Initialize game
    init() {
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        // Load high score from chrome.storage.local
        this.loadHighScore();
        
        // Setup game area
        this.setupGameArea();
        
        // Initialize snake
        this.initSnake();
        
        // Initialize item
        this.initItem();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Prevent scroll
        this.disableScroll();
        
        // Start game loop
        this.gameLoop();
    }
    
    // Load high score from chrome.storage.local
    loadHighScore() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get(['color-snake_hs'], (result) => {
                    if (chrome.runtime.lastError) {
                        this.updateHighScore();
                        return;
                    }
                    
                    if (result['color-snake_hs'] !== undefined && result['color-snake_hs'] !== null) {
                        try {
                            this.highScore = parseInt(result['color-snake_hs'], 10) || 0;
                        } catch (e) {
                            this.highScore = 0;
                        }
                    }
                    this.updateHighScore();
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                const highScoreVal = localStorage.getItem('color-snake_hs');
                if (highScoreVal != null) {
                    this.highScore = parseInt(highScoreVal, 10);
                }
                this.updateHighScore();
            }
        } catch (e) {
            this.updateHighScore();
        }
    }
    
    // Setup UI elements with adaptive sizes
    setupUI() {
        // Update gameArea size (use calculated width and height that are multiples of cellSize)
        if (this.gameArea) {
            this.gameArea.style.width = `${this.width}px`;
            this.gameArea.style.height = `${this.height}px`;
        }
        
        // Update gamebox size if it exists
        const gamebox = document.getElementById('gamebox');
        if (gamebox) {
            gamebox.style.width = `${this.width}px`;
            gamebox.style.height = `${this.height}px`;
        }
        
        // Update header styles if it exists
        const header = document.querySelector('.header');
        if (header) {
            header.style.top = `${Math.floor(this.adaptive * 30)}px`;
            header.style.width = `${this.width}px`;
            
            // Update header text sizes
            const current = header.querySelector('.current');
            if (current) {
                current.style.fontSize = `${Math.floor(this.adaptive * 30)}px`;
            }
            
            const record = header.querySelector('.record');
            if (record) {
                record.style.fontSize = `${Math.floor(this.adaptive * 16)}px`;
            }
        }
        
        // Update gameover styles if it exists
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
    
    // Setup game area
    setupGameArea() {
        this.gameArea = document.getElementById('gameArea');
        if (!this.gameArea) return;
        
        // Update UI sizes first
        this.setupUI();
        
        // Remove existing canvas if it exists
        const existingCanvas = document.getElementById('colorSnakeCanvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'colorSnakeCanvas';
        this.canvas.style.display = 'block';
        this.gameArea.appendChild(this.canvas);
        
        // Use calculated dimensions (already multiples of cellSize)
        // Set canvas size
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');
    }
    
    // Initialize snake
    initSnake() {
        this.snake = [];
        // Initial position (matching original: x: 100, y: 200)
        // Scale initial position based on adaptive size, but align to grid
        // Original: 100 = 5 * 20, 200 = 10 * 20
        const originalCellSize = 20;
        const gridX = Math.floor(100 / originalCellSize); // 5
        const gridY = Math.floor(200 / originalCellSize); // 10
        const startX = gridX * this.cellSize;
        const startY = gridY * this.cellSize;
        this.currentColor = 'lawngreen';
        this.currentColorIndex = 0;
        
        // Create initial segment
        this.snake.push(new SnakeSegment(startX, startY, this.currentColor, this.cellSize));
        
        this.direction = DIRECTIONS.RIGHT;
        this.nextDirection = DIRECTIONS.RIGHT;
    }
    
    // Initialize item
    initItem() {
        this.spawnItem();
    }
    
    // Spawn new item
    spawnItem() {
        // Remove existing item if any
        if (this.item) {
            // Item is drawn in draw(), no need to remove DOM element
        }
        
        // Calculate valid position (matching original: 4 to width/cellSize - 8)
        const cols = Math.floor(this.width / this.cellSize);
        const rows = Math.floor(this.height / this.cellSize);
        const x = (4 + Math.floor(Math.random() * (cols - 8))) * this.cellSize;
        const y = (4 + Math.floor(Math.random() * (rows - 8))) * this.cellSize;
        
        // Random color
        const itemColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        
        this.item = {
            x: x,
            y: y,
            color: itemColor
        };
    }
    
    // Setup event listeners
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // Restart button
        const restartBtn = document.getElementById('restartgamebutton');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.restart();
            });
        }
        
        // Add window resize listener
        this.setupResizeListener();
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
    
    // Handle key press
    handleKeyPress(e) {
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (this.state === GAME_STATE.START) {
                    this.nextDirection = DIRECTIONS.UP;
                } else if (this.state === GAME_STATE.INIT) {
                    this.startGame();
                }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (this.state === GAME_STATE.START) {
                    this.nextDirection = DIRECTIONS.DOWN;
                } else if (this.state === GAME_STATE.INIT) {
                    this.startGame();
                }
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (this.state === GAME_STATE.START) {
                    this.nextDirection = DIRECTIONS.LEFT;
                } else if (this.state === GAME_STATE.INIT) {
                    this.startGame();
                }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (this.state === GAME_STATE.START) {
                    this.nextDirection = DIRECTIONS.RIGHT;
                } else if (this.state === GAME_STATE.INIT) {
                    this.startGame();
                }
                break;
        }
    }
    
    // Start game
    startGame() {
        this.state = GAME_STATE.START;
        this.lastMoveTime = performance.now();
        
        // Start color change timers
        this.startSnakeColorChange();
        this.startItemColorChange();
    }
    
    // Change snake color randomly
    changeSnakeColor() {
        // Get available color indices (excluding current)
        const availableIndices = [];
        for (let i = 0; i < COLORS.length; i++) {
            if (i !== this.currentColorIndex) {
                availableIndices.push(i);
            }
        }
        
        // Select random color from available
        this.currentColorIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        this.currentColor = COLORS[this.currentColorIndex];
        
        // Update all snake segments
        this.snake.forEach(segment => {
            segment.color = this.currentColor;
        });
    }
    
    // Start snake color change timer
    startSnakeColorChange() {
        const changeColor = () => {
            if (this.state === GAME_STATE.START && !this.isGameOver) {
                this.changeSnakeColor();
                // Schedule next change (2-3 seconds)
                const delay = (SNAKE_COLOR_CHANGE_MIN + Math.floor(Math.random() * (SNAKE_COLOR_CHANGE_MAX - SNAKE_COLOR_CHANGE_MIN + 1))) * 1000;
                this.snakeColorTimeout = setTimeout(changeColor, delay);
            }
        };
        changeColor();
    }
    
    // Change item color randomly
    changeItemColor() {
        if (this.item && this.state === GAME_STATE.START && !this.isGameOver) {
            this.item.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        }
    }
    
    // Start item color change timer
    startItemColorChange() {
        const changeColor = () => {
            if (this.state === GAME_STATE.START && !this.isGameOver) {
                this.changeItemColor();
                this.itemColorTimeout = setTimeout(changeColor, ITEM_COLOR_CHANGE_INTERVAL);
            }
        };
        changeColor();
    }
    
    // Move snake
    moveSnake() {
        if (this.state !== GAME_STATE.START || this.isGameOver) {
            return;
        }
        
        // Update direction
        this.direction = this.nextDirection;
        
        // Calculate next head position
        const head = this.snake[0];
        const nextHead = new SnakeSegment(
            head.x + this.direction.dx * this.cellSize,
            head.y + this.direction.dy * this.cellSize,
            this.currentColor,
            this.cellSize
        );
        
        // Check collision with boundaries
        if (nextHead.x < 0 || nextHead.x >= this.width || 
            nextHead.y < 0 || nextHead.y >= this.height) {
            // Move head out of bounds to trigger game over
            this.snake.unshift(nextHead);
            const tail = this.snake.pop();
            this.gameOver();
            return;
        }
        
        // Check collision with self
        for (let i = 1; i < this.snake.length; i++) {
            if (this.snake[i].x === nextHead.x && this.snake[i].y === nextHead.y) {
                this.gameOver();
                return;
            }
        }
        
        // Check collision with item
        if (nextHead.x === this.item.x && nextHead.y === this.item.y) {
            if (nextHead.color === this.item.color) {
                // Correct color match - grow snake and spawn new item
                this.snake.unshift(nextHead);
                this.score += 10;
                this.updateScore();
                
                // Spawn new item
                this.spawnItem();
            } else {
                // Color mismatch - Game Over
                this.gameOver();
                return;
            }
        } else {
            // Normal move - move head and remove tail
            this.snake.unshift(nextHead);
            const tail = this.snake.pop();
        }
    }
    
    // Game loop using requestAnimationFrame
    gameLoop() {
        const currentTime = performance.now();
        
        if (this.state === GAME_STATE.START && !this.isGameOver) {
            // Check if it's time to move
            if (currentTime - this.lastMoveTime >= MOVE_INTERVAL) {
                this.moveSnake();
                this.lastMoveTime = currentTime;
            }
        }
        
        // Always draw
        this.draw();
        
        if (!this.isGameOver) {
            this.animationFrame = requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    // Draw game
    draw() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw snake
        this.snake.forEach(segment => {
            segment.draw(this.ctx);
        });
        
        // Draw item (circle)
        if (this.item) {
            this.ctx.fillStyle = this.item.color;
            this.ctx.beginPath();
            this.ctx.arc(
                this.item.x + this.cellSize / 2,
                this.item.y + this.cellSize / 2,
                this.cellSize / 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }
        
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
    
    // Update score
    updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            this.updateHighScore();
        }
    }
    
    // Save high score to chrome.storage.local
    saveHighScore() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ 'color-snake_hs': this.highScore }, () => {
                    if (chrome.runtime.lastError) {
                        // Failed to save high score
                    }
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                localStorage.setItem('color-snake_hs', this.highScore);
            }
        } catch (e) {
            // Failed to save high score
        }
    }
    
    // Update high score display
    updateHighScore() {
        const highScoreElement = document.getElementById('highScore');
        if (highScoreElement) {
            highScoreElement.textContent = this.highScore;
        }
    }
    
    // Game over
    gameOver() {
        this.isGameOver = true;
        this.state = GAME_STATE.GAME_OVER;
        
        // Clear timers
        if (this.snakeColorTimeout) {
            clearTimeout(this.snakeColorTimeout);
            this.snakeColorTimeout = null;
        }
        if (this.itemColorTimeout) {
            clearTimeout(this.itemColorTimeout);
            this.itemColorTimeout = null;
        }
        
        // Update adaptive sizes for game over overlay
        this.setupUI();
        
        // Show game over overlay
        const gameOverElement = document.getElementById('gameover');
        if (gameOverElement) {
            gameOverElement.style.display = 'block';
        }
        
        // Enable scroll
        this.enableScroll();
    }
    
    // Restart game
    restart() {
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        // Hide game over overlay
        const gameOverElement = document.getElementById('gameover');
        if (gameOverElement) {
            gameOverElement.style.display = 'none';
        }
        
        // Recalculate game area dimensions with new cell size
        this.setupGameArea();
        
        // Reset game state
        this.state = GAME_STATE.INIT;
        this.isGameOver = false;
        this.score = 0;
        this.updateScore();
        
        // Clear timers
        if (this.snakeColorTimeout) {
            clearTimeout(this.snakeColorTimeout);
            this.snakeColorTimeout = null;
        }
        if (this.itemColorTimeout) {
            clearTimeout(this.itemColorTimeout);
            this.itemColorTimeout = null;
        }
        
        // Reinitialize snake and item
        this.initSnake();
        this.initItem();
        
        // Reset direction
        this.direction = DIRECTIONS.RIGHT;
        this.nextDirection = DIRECTIONS.RIGHT;
        
        // Restart game loop
        this.lastMoveTime = 0;
        this.gameLoop();
    }
    
    // Disable scroll
    disableScroll() {
        if (this.scrollPreventionEnabled) return;
        this.scrollPreventionEnabled = true;
        window.addEventListener('keydown', this.preventScrollKeys, { passive: false });
    }
    
    // Enable scroll
    enableScroll() {
        if (!this.scrollPreventionEnabled) return;
        setTimeout(() => {
            this.scrollPreventionEnabled = false;
            window.removeEventListener('keydown', this.preventScrollKeys);
        }, 500);
    }
    
    // Prevent scroll keys
    preventScrollKeys = (event) => {
        const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D', ' '];
        if (keys.includes(event.key)) {
            event.preventDefault();
        }
    };
}

// Initialize game when DOM is ready
/***
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.innerWidth >= 768) {
            new ColorSnakeGame();
        }
    });
} else {
    if (window.innerWidth >= 768) {
        new ColorSnakeGame();
    }
}
***/
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ColorSnakeGame();
    });
} else {
    new ColorSnakeGame();
}

