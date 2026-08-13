/*
 * Number Snake Game - Alternative Implementation
 * Rewritten with different code structure and algorithms
 * Uses ES6 classes, Canvas API, and requestAnimationFrame for game loop
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
const CELL_SIZE = 20;
const MOVE_INTERVAL = 100; // milliseconds
const GAME_DEFAULT_WIDTH = 740;
const GAME_DEFAULT_HEIGHT = 490;

// Game states
const GAME_STATE = {
    INIT: 'init',
    START: 'start',
    GAME_OVER: 'gameOver'
};

// Snake Segment Class
class SnakeSegment {
    constructor(x, y, cellSize) {
        this.x = x;
        this.y = y;
        this.cellSize = cellSize;
    }
}

// Number Class
class NumberItem {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.collected = false;
    }
}

// Number Snake Game Class
class NumberSnakeGame {
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
        
        // Direction constants (created dynamically based on cellSize)
        this.DIRECTIONS = {
            UP: { dx: 0, dy: -this.cellSize },
            DOWN: { dx: 0, dy: this.cellSize },
            LEFT: { dx: -this.cellSize, dy: 0 },
            RIGHT: { dx: this.cellSize, dy: 0 }
        };
        
        // Game state
        this.state = GAME_STATE.INIT;
        this.score = 0;
        this.currentNumber = 1;
        this.isGameOver = false;
        
        // Snake data
        this.snake = [];
        this.direction = this.DIRECTIONS.DOWN;
        this.nextDirection = this.DIRECTIONS.DOWN;
        
        // Numbers data
        this.numbers = [];
        this.numberPositions = []; // Array of position strings for quick lookup
        
        // Timing
        this.lastMoveTime = 0;
        
        // Canvas
        this.canvas = null;
        this.ctx = null;
        this.gameArea = null;
        
        // DOM elements
        this.scoreDisplay = null;
        this.gameOverOverlay = null;
        this.gameStatus = null;
        this.restartButton = null;
        
        // Animation frame
        this.animationFrame = null;
        
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
        
        // Update DIRECTIONS with new cellSize
        this.DIRECTIONS = {
            UP: { dx: 0, dy: -this.cellSize },
            DOWN: { dx: 0, dy: this.cellSize },
            LEFT: { dx: -this.cellSize, dy: 0 },
            RIGHT: { dx: this.cellSize, dy: 0 }
        };
        
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
        // Skip on mobile
        //if (window.innerWidth < 768) {
            //return;
        //}
        
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        // Setup scroll prevention
        this.setupScrollPrevention();
        
        // Setup UI
        this.setupUI();
        
        // Setup canvas
        this.setupCanvas();
        
        // Initialize game
        this.resetGame();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start game loop
        this.gameLoop();
    }
    
    // Setup scroll prevention
    setupScrollPrevention() {
        const preventScrollKeys = (event) => {
            const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D', ' '];
            if (keys.includes(event.key)) {
                event.preventDefault();
            }
        };
        
        window.addEventListener('keydown', preventScrollKeys, { passive: false });
    }
    
    // Setup UI elements
    setupUI() {
        this.gameArea = document.getElementById('gameArea');
        this.scoreDisplay = document.getElementById('score');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.gameStatus = document.getElementById('status');
        this.restartButton = document.getElementById('restartButton');
        
        if (!this.gameArea || !this.scoreDisplay) {
            return;
        }
        
        // Update gameArea size (use calculated width and height that are multiples of cellSize)
        if (this.gameArea) {
            this.gameArea.style.width = `${this.width}px`;
            this.gameArea.style.height = `${this.height}px`;
        }
        
        // Update gamebox size if it exists
        const gamebox = document.getElementById('gamebox');
        if (gamebox) {
            gamebox.style.width = `${this.width}px`;
        }
        
        // Update scoreBoard styles
        const scoreBoard = document.getElementById('scoreBoard');
        if (scoreBoard) {
            scoreBoard.style.fontSize = `${Math.floor(this.adaptive * 24)}px`;
            scoreBoard.style.left = `${Math.floor(this.adaptive * 330)}px`;
            scoreBoard.style.top = `${Math.floor(this.adaptive * 10)}px`;
        }
        
        // Update gameOverOverlay styles
        if (this.gameOverOverlay) {
            this.gameOverOverlay.style.width = `${this.width}px`;
            this.gameOverOverlay.style.height = `${this.height}px`;
        }
        
        // Update gameStatus (h2) styles
        if (this.gameStatus) {
            this.gameStatus.style.fontSize = `${Math.floor(this.adaptive * 36)}px`;
        }
        
        // Update restartButton styles
        if (this.restartButton) {
            this.restartButton.style.padding = `${Math.floor(this.adaptive * 10)}px ${Math.floor(this.adaptive * 20)}px`;
            this.restartButton.style.fontSize = `${Math.floor(this.adaptive * 20)}px`;
            this.restartButton.addEventListener('click', () => {
                this.restart();
            });
        }
    }
    
    // Setup canvas
    setupCanvas() {
        // Remove existing canvas if it exists
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.display = 'block';
        this.canvas.style.margin = '0 auto';
        
        // Clear gameArea and add canvas
        if (this.gameArea) {
            // Clear content using removeChild instead of innerHTML
            while (this.gameArea.firstChild) {
                this.gameArea.removeChild(this.gameArea.firstChild);
            }
            this.gameArea.appendChild(this.canvas);
        }
        
        this.ctx = this.canvas.getContext('2d');
    }
    
    // Reset game
    resetGame() {
        // Reset state
        this.state = GAME_STATE.INIT;
        this.score = 0;
        this.currentNumber = 1;
        this.isGameOver = false;
        this.lastMoveTime = 0;
        
        // Reset direction
        this.direction = this.DIRECTIONS.DOWN;
        this.nextDirection = this.DIRECTIONS.DOWN;
        
        // Initialize snake (head at x: 280, y: 100)
        // Scale initial position based on adaptive size, but align to grid
        // Original: 280 = 14 * 20, 100 = 5 * 20
        const originalCellSize = 20;
        const gridX = Math.floor(280 / originalCellSize); // 14
        const gridY = Math.floor(100 / originalCellSize); // 5
        const startX = gridX * this.cellSize;
        const startY = gridY * this.cellSize;
        
        this.snake = [
            new SnakeSegment(startX, startY, this.cellSize)
        ];
        
        // Spawn numbers
        this.spawnNumbers();
        
        // Update score display
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = '0';
        }
        
        // Hide game over overlay
        if (this.gameOverOverlay) {
            this.gameOverOverlay.style.display = 'none';
        }
    }
    
    // Spawn numbers (1-9) in random positions
    spawnNumbers() {
        this.numbers = [];
        this.numberPositions = [];
        
        // Scale restricted areas based on adaptive size
        // Original: 60 = 3 * 20, 680 = 34 * 20, 380 = 19 * 20
        // Original: 250 = 12.5 * 20, 500 = 25 * 20, 250 = 12.5 * 20
        const originalCellSize = 20;
        const minXGrid = Math.floor(60 / originalCellSize); // 3
        const minYGrid = Math.floor(60 / originalCellSize); // 3
        const maxXGrid = Math.floor(680 / originalCellSize); // 34
        const maxYGrid = Math.floor(380 / originalCellSize); // 19
        const restrictedMinXGrid = Math.floor(250 / originalCellSize); // 12
        const restrictedMaxXGrid = Math.floor(500 / originalCellSize); // 25
        const restrictedMaxYGrid = Math.floor(250 / originalCellSize); // 12
        
        const minX = minXGrid * this.cellSize;
        const minY = minYGrid * this.cellSize;
        const maxX = maxXGrid * this.cellSize;
        const maxY = maxYGrid * this.cellSize;
        const restrictedMinX = restrictedMinXGrid * this.cellSize;
        const restrictedMaxX = restrictedMaxXGrid * this.cellSize;
        const restrictedMaxY = restrictedMaxYGrid * this.cellSize;
        
        for (let i = 1; i <= 9; i++) {
            let x, y;
            let attempts = 0;
            const maxAttempts = 100;
            
            do {
                x = Math.floor(Math.random() * (this.width / this.cellSize)) * this.cellSize;
                y = Math.floor(Math.random() * (this.height / this.cellSize)) * this.cellSize;
                attempts++;
            } while (
                attempts < maxAttempts && (
                    // Don't spawn on snake head
                    (x === this.snake[0].x && y === this.snake[0].y) ||
                    // Don't spawn in restricted areas
                    x < minX || y < minY || x > maxX || y > maxY || 
                    (x > restrictedMinX && x < restrictedMaxX && y < restrictedMaxY) ||
                    // Don't spawn on existing number positions
                    this.numberPositions.includes(`${x}-${y}`)
                )
            );
            
            if (attempts < maxAttempts) {
                const numberItem = new NumberItem(x, y, i);
                this.numbers.push(numberItem);
                this.numberPositions.push(`${x}-${y}`);
            }
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
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
        if (this.isGameOver) {
            // On Enter, restart game
            if (e.keyCode === 13 || e.key === 'Enter') {
                if (this.restartButton) {
                    this.restartButton.click();
                }
            }
            return;
        }
        
        // Handle direction changes
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (this.direction.dy === 0) {
                    this.nextDirection = this.DIRECTIONS.UP;
                }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (this.direction.dy === 0) {
                    this.nextDirection = this.DIRECTIONS.DOWN;
                }
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (this.direction.dx === 0) {
                    this.nextDirection = this.DIRECTIONS.LEFT;
                }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (this.direction.dx === 0) {
                    this.nextDirection = this.DIRECTIONS.RIGHT;
                }
                break;
        }
        
        // Start game on first key press
        if (this.state === GAME_STATE.INIT) {
            this.state = GAME_STATE.START;
        }
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
            head.x + this.direction.dx,
            head.y + this.direction.dy,
            this.cellSize
        );
        
        // Check collision with boundaries
        if (nextHead.x < 0 || nextHead.x >= this.width ||
            nextHead.y < 0 || nextHead.y >= this.height) {
            this.gameOver(false);
            return;
        }
        
        // Check collision with self
        for (let i = 0; i < this.snake.length; i++) {
            if (this.snake[i].x === nextHead.x && this.snake[i].y === nextHead.y) {
                this.gameOver(false);
                return;
            }
        }
        
        // Check collision with numbers
        const positionStr = `${nextHead.x}-${nextHead.y}`;
        const numberIndex = this.numberPositions.indexOf(positionStr);
        
        if (numberIndex >= 0) {
            // Hit a number position
            const numberItem = this.numbers[numberIndex];
            
            if (numberItem && !numberItem.collected && numberItem.value === this.currentNumber) {
                // Correct number - grow snake and update score
                this.score += this.currentNumber;
                this.currentNumber++;
                
                // Mark number as collected
                numberItem.collected = true;
                this.numberPositions[numberIndex] = '';
                
                // Update score display
                if (this.scoreDisplay) {
                    this.scoreDisplay.textContent = `${this.score}`;
                }
                
                // Add new head
                this.snake.unshift(nextHead);
                
                // Check if all numbers collected
                if (this.currentNumber > 9) {
                    this.gameOver(true);
                    return;
                }
            } else {
                // Wrong number - Game Over
                this.gameOver(false);
                return;
            }
        } else {
            // Normal move - move head and remove tail
            this.snake.unshift(nextHead);
            this.snake.pop();
        }
    }
    
    // Game over
    gameOver(won) {
        this.isGameOver = true;
        this.state = GAME_STATE.GAME_OVER;
        
        // Update adaptive sizes for game over overlay
        if (this.gameOverOverlay) {
            this.gameOverOverlay.style.width = `${this.width}px`;
            this.gameOverOverlay.style.height = `${this.height}px`;
            this.gameOverOverlay.style.display = 'flex';
        }
        
        // Update status message with adaptive font size
        if (this.gameStatus) {
            this.gameStatus.textContent = won ? 'You Win!' : 'You Loss :(';
            this.gameStatus.style.fontSize = `${Math.floor(this.adaptive * 36)}px`;
        }
        
        // Update restart button with adaptive styles
        if (this.restartButton) {
            this.restartButton.style.padding = `${Math.floor(this.adaptive * 10)}px ${Math.floor(this.adaptive * 20)}px`;
            this.restartButton.style.fontSize = `${Math.floor(this.adaptive * 20)}px`;
        }
    }
    
    // Restart game
    restart() {
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        // Cancel animation frame
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Recalculate game area dimensions with new cell size
        this.setupCanvas();
        
        // Reset game
        this.resetGame();
        
        // Restart game loop
        this.gameLoop();
    }
    
    // Draw game
    draw() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.fillStyle = '#161c1c';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw numbers
        this.drawNumbers();
        
        // Draw snake
        this.drawSnake();
        
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
    
    // Draw numbers
    drawNumbers() {
        for (const numberItem of this.numbers) {
            if (!numberItem.collected) {
                // Draw number background (red)
                this.ctx.fillStyle = 'red';
                this.ctx.fillRect(numberItem.x, numberItem.y, this.cellSize, this.cellSize);
                
                // Draw number text (white)
                this.ctx.fillStyle = 'white';
                this.ctx.font = `${Math.floor(14 * this.adaptive)}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(
                    numberItem.value.toString(),
                    numberItem.x + this.cellSize / 2,
                    numberItem.y + this.cellSize / 2
                );
            }
        }
    }
    
    // Draw snake
    drawSnake() {
        for (const segment of this.snake) {
            // Draw snake segment (green)
            this.ctx.fillStyle = 'green';
            this.ctx.fillRect(segment.x, segment.y, this.cellSize, this.cellSize);
        }
    }
    
    // Game loop
    gameLoop() {
        const now = Date.now();
        
        // Move snake at intervals
        if (now - this.lastMoveTime > MOVE_INTERVAL) {
            this.lastMoveTime = now;
            this.moveSnake();
        }
        
        // Draw game
        this.draw();
        
        // Continue loop
        this.animationFrame = requestAnimationFrame(() => {
            this.gameLoop();
        });
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new NumberSnakeGame();
    });
} else {
    new NumberSnakeGame();
}

