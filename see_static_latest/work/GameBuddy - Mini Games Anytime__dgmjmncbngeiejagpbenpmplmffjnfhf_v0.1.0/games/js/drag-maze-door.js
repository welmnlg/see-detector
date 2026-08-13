/*
 * Drag Maze Door Game - Version 2
 * Rewritten using ES6 classes and different code structure
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

// Game constants
const MAX_LEVEL = 6;
const GAME_DEFAULT_WIDTH = 402;
const GAME_DEFAULT_HEIGHT = 490;
const PADDLE_POSITION_STEP = 50;
const PADDLE_MIN_HEIGHT = 10;
const RED_POINT_SIZE = 20;
const EXIT_WIDTH = 15;
const EXIT_HEIGHT = 60;

// Paddle pair class (top and bottom paddles)
class PaddlePair {
    constructor(x, speed, gameHeight) {
        this.x = x;
        this.speed = speed;
        this.gameHeight = gameHeight;
        this.topHeight = PADDLE_MIN_HEIGHT;
        this.bottomHeight = PADDLE_MIN_HEIGHT;
        this.direction = 'down'; // 'down' means expanding, 'up' means contracting
        this.topElement = null;
        this.bottomElement = null;
    }
    
    // Create DOM elements
    createElements(gamebox) {
        // Top paddle
        this.topElement = document.createElement('div');
        this.topElement.className = 'paddle';
        this.topElement.style.position = 'absolute';
        this.topElement.style.width = '10px';
        this.topElement.style.left = `${this.x}px`;
        this.topElement.style.top = '0px';
        this.topElement.style.height = `${this.topHeight}px`;
        this.topElement.style.backgroundColor = '#A1662F';
        gamebox.appendChild(this.topElement);
        
        // Bottom paddle
        this.bottomElement = document.createElement('div');
        this.bottomElement.className = 'paddle';
        this.bottomElement.style.position = 'absolute';
        this.bottomElement.style.width = '10px';
        this.bottomElement.style.left = `${this.x}px`;
        this.bottomElement.style.bottom = '0px';
        this.bottomElement.style.height = `${this.bottomHeight}px`;
        this.bottomElement.style.backgroundColor = '#A1662F';
        gamebox.appendChild(this.bottomElement);
    }
    
    // Update paddle heights
    update() {
        if (this.direction === 'down') {
            // Expanding: increase heights
            this.topHeight += this.speed;
            this.bottomHeight += this.speed;
            
            // Check if fully expanded
            if (this.topHeight + this.bottomHeight >= this.gameHeight) {
                this.direction = 'up';
            }
        } else {
            // Contracting: decrease heights
            this.topHeight -= this.speed;
            this.bottomHeight -= this.speed;
            
            // Check if fully contracted
            if (this.topHeight <= PADDLE_MIN_HEIGHT) {
                this.topHeight = PADDLE_MIN_HEIGHT;
                this.bottomHeight = PADDLE_MIN_HEIGHT;
                this.direction = 'down';
            }
        }
        
        // Update DOM elements
        if (this.topElement) {
            this.topElement.style.height = `${this.topHeight}px`;
        }
        if (this.bottomElement) {
            this.bottomElement.style.height = `${this.bottomHeight}px`;
        }
    }
    
    // Get bounding rectangles
    getBounds() {
        return {
            top: {
                left: this.x,
                top: 0,
                right: this.x + 10,
                bottom: this.topHeight
            },
            bottom: {
                left: this.x,
                top: this.gameHeight - this.bottomHeight,
                right: this.x + 10,
                bottom: this.gameHeight
            }
        };
    }
}

// Player class (red point)
class Player {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.element = null;
    }
    
    // Create DOM element
    createElement(gamebox) {
        this.element = document.getElementById('redPoint');
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

// Exit class
class Exit {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.element = null;
    }
    
    // Create DOM element
    createElement(gamebox) {
        this.element = document.getElementById('exit');
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
            right: this.x + this.width,
            bottom: this.y + this.height
        };
    }
}

// Drag Maze Door Game class
class DragMazeDoorGame {
    constructor() {
        // Game state
        this.isGameActive = false;
        this.isDragging = false;
        this.animationFrameId = null;
        
        // Level management
        this.currentLevel = 1;
        this.baseSpeed = 0;
        this.maxLevel = MAX_LEVEL;
        
        // Screen dimensions
        this.screenWidth = 0;
        this.screenHeight = 0;
        this.gameWidth = 0;
        this.gameHeight = 0;
        this.adaptive = 0.8;
        this.modSize = 0;
        
        // Game elements
        this.gamebox = null;
        this.player = null;
        this.exit = null;
        this.paddlePairs = [];
        this.paddlePositions = [];
        
        // UI elements
        this.overlay = null;
        this.message = null;
        this.tryAgainBtn = null;
        this.nextLevelBtn = null;
        this.resetBtn = null;
        
        // Initialize
        this.init();
    }
    
    // Initialize game
    init() {
        // Check screen width
        if (window.innerWidth < 768) {
            return;
        }
        
        // Load level (which will call continueInit() after loading)
        // continueInit() will handle the rest of initialization
        this.loadLevel();
    }
    
    // Load level from chrome.storage.local or URL
    loadLevel() {
        // Check URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const level = urlParams.get('mlv');
        if (level !== null && Number.isInteger(Number(level))) {
            const newLevel = Number(level) + 1;
            this.currentLevel = newLevel;
            this.saveLevel();
            // Set base speed based on level
            this.baseSpeed = Math.min(this.currentLevel - 1, 5);
            return;
        }
        
        // Load from chrome.storage.local
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get(['drag-maze-door_level'], (result) => {
                    if (chrome.runtime.lastError) {
                        this.setDefaultLevel();
                        return;
                    }
                    
                    if (result['drag-maze-door_level'] !== undefined && result['drag-maze-door_level'] !== null) {
                        try {
                            this.currentLevel = typeof result['drag-maze-door_level'] === 'number' 
                                ? result['drag-maze-door_level'] 
                                : JSON.parse(result['drag-maze-door_level']);
                        } catch (e) {
                            this.setDefaultLevel();
                        }
                    } else {
                        this.setDefaultLevel();
                    }
                    
                    // Ensure level is within valid range
                    if (this.currentLevel < 1 || this.currentLevel > MAX_LEVEL) {
                        this.setDefaultLevel();
                    }
                    
                    // Set base speed based on level
                    this.baseSpeed = Math.min(this.currentLevel - 1, 5);
                    
                    // Continue initialization after level is loaded
                    this.continueInit();
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                const storageCurrentLevel = localStorage.getItem('drag-maze-door_level');
                if (storageCurrentLevel) {
                    try {
                        this.currentLevel = JSON.parse(storageCurrentLevel);
                    } catch (e) {
                        this.setDefaultLevel();
                    }
                } else {
                    this.setDefaultLevel();
                }
                
                // Ensure level is within valid range
                if (this.currentLevel < 1 || this.currentLevel > MAX_LEVEL) {
                    this.setDefaultLevel();
                }
                
                // Set base speed based on level
                this.baseSpeed = Math.min(this.currentLevel - 1, 5);
                
                // Continue initialization
                this.continueInit();
            }
        } catch (e) {
            this.setDefaultLevel();
            this.baseSpeed = Math.min(this.currentLevel - 1, 5);
            this.continueInit();
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
                chrome.storage.local.set({ 'drag-maze-door_level': this.currentLevel }, () => {
                    if (chrome.runtime.lastError) {
                        // Failed to save level
                    }
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                localStorage.setItem('drag-maze-door_level', JSON.stringify(this.currentLevel));
            }
        } catch (e) {
            // Failed to save level
        }
    }
    
    // Continue initialization after level is loaded
    continueInit() {
        // Calculate dimensions
        this.calculateDimensions();
        
        // Setup game area
        this.setupGameArea();
        
        // Create game elements
        this.createGameElements();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start game
        this.startGame();
    }
    
    // Update adaptive size based on current window size
    updateAdaptiveSize() {
        // Recalculate dimensions
        this.calculateDimensions();
        
        // Update game area with new sizes
        this.setupGameArea();
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
        
        // Match classic-maze gamebox height
        const classicCellH = Math.floor(30 * this.adaptive);
        const classicPadH = Math.floor(15 * this.adaptive);
        this.classicGameboxH = classicCellH * 14 + classicPadH * 2 + 2 + classicCellH;
    }
    
    // Setup game area
    setupGameArea() {
        this.gamebox = document.getElementById('gamebox');
        if (!this.gamebox) return;
        
        // Set gamebox size to match classic-maze height
        this.gamebox.style.width = `${this.classicGameboxH * 1.5}px`;
        this.gamebox.style.height = `${this.classicGameboxH}px`;
        
        // Get actual dimensions
        this.gameWidth = this.gamebox.clientWidth;
        this.gameHeight = this.gamebox.clientHeight;
        
        // Calculate paddle positions
        this.paddlePositions = [];
        for (let i = 50; i <= this.classicGameboxH * 1.5 - 50; i += PADDLE_POSITION_STEP) {
            this.paddlePositions.push(i);
        }
    }
    
    // Create game elements
    createGameElements() {
        // Create player (red point)
        const redPointElement = document.getElementById('redPoint');
        if (redPointElement) {
            this.player = new Player(0, Math.floor(this.gameHeight / 2 - 15 * this.adaptive), RED_POINT_SIZE);
            this.player.element = redPointElement;
            this.player.updatePosition();
        }
        
        // Create exit
        const exitElement = document.getElementById('exit');
        if (exitElement) {
            this.exit = new Exit(
                this.gameWidth - EXIT_WIDTH,
                Math.floor(this.gameHeight / 2 - 30 * this.adaptive),
                EXIT_WIDTH,
                EXIT_HEIGHT
            );
            this.exit.element = exitElement;
            this.exit.updatePosition();
        }
        
        // Create paddles
        this.createPaddles();
        
        // Setup UI elements
        this.setupUI();
    }
    
    // Create paddles
    createPaddles() {
        // Remove existing paddles
        this.paddlePairs.forEach(pair => {
            if (pair.topElement) {
                pair.topElement.remove();
            }
            if (pair.bottomElement) {
                pair.bottomElement.remove();
            }
        });
        this.paddlePairs = [];
        
        // Create paddle pairs at each position
        this.paddlePositions.forEach(pos => {
            const speed = Math.random() * 5 + 1 + this.baseSpeed;
            const pair = new PaddlePair(pos, speed, this.gameHeight);
            pair.createElements(this.gamebox);
            this.paddlePairs.push(pair);
        });
    }
    
    // Setup UI elements
    setupUI() {
        this.overlay = document.getElementById('overlay');
        this.message = document.getElementById('message');
        this.tryAgainBtn = document.getElementById('tryagainbtn');
        this.nextLevelBtn = document.getElementById('nextlevelbtn');
        this.resetBtn = document.getElementById('resetbtn');
        
        // Hide overlay initially
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
        
        // Hide next level button if at max level
        if (this.nextLevelBtn && this.currentLevel >= this.maxLevel) {
            this.nextLevelBtn.style.display = 'none';
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Player drag events
        if (this.player && this.player.element) {
            this.player.element.addEventListener('mousedown', (e) => {
                this.handleMouseDown(e);
            });
        }
        
        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
        
        document.addEventListener('mouseup', () => {
            this.handleMouseUp();
        });
        
        // Button events
        if (this.tryAgainBtn) {
            this.tryAgainBtn.addEventListener('click', () => {
                this.tryAgain();
            });
        }
        
        if (this.nextLevelBtn) {
            this.nextLevelBtn.addEventListener('click', () => {
                this.nextLevel();
            });
        }
        
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => {
                this.reset();
            });
        }
    }
    
    // Handle mouse down
    handleMouseDown(e) {
        if (!this.isGameActive) return;
        
        // Hide how-to hint on first interaction
        this.hideHowToHint();
        
        this.isDragging = true;
    }
    
    // Handle mouse move
    handleMouseMove(e) {
        if (!this.isDragging || !this.isGameActive) return;
        
        const rect = this.gamebox.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Constrain position (matching original: -5 offset for centering)
        const newX = Math.max(0, Math.min(mouseX - 5, this.gameWidth - RED_POINT_SIZE));
        const newY = Math.max(0, Math.min(mouseY - 5, this.gameHeight - RED_POINT_SIZE));
        
        this.player.x = newX;
        this.player.y = newY;
        this.player.updatePosition();
        
        // Check collisions
        if (this.checkCollision()) {
            this.gameOver('Game Over! You hit a paddle.');
            return;
        }
        
        // Check success
        if (this.checkSuccess()) {
            this.gameWin();
        }
    }
    
    // Handle mouse up
    handleMouseUp() {
        this.isDragging = false;
    }
    
    // Check collision with paddles
    checkCollision() {
        const playerBounds = this.player.getBounds();
        
        for (const pair of this.paddlePairs) {
            const bounds = pair.getBounds();
            if (this.isColliding(playerBounds, bounds.top) || 
                this.isColliding(playerBounds, bounds.bottom)) {
                return true;
            }
        }
        
        return false;
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
    
    // Check success (reached exit)
    checkSuccess() {
        const playerBounds = this.player.getBounds();
        const exitBounds = this.exit.getBounds();
        
        return (
            playerBounds.right > exitBounds.left &&
            playerBounds.left < exitBounds.right &&
            playerBounds.bottom > exitBounds.top &&
            playerBounds.top < exitBounds.bottom
        );
    }
    
    // Move paddles
    movePaddles() {
        if (!this.isGameActive) return;
        
        for (const pair of this.paddlePairs) {
            pair.update();
            
            // Check collision with player
            const playerBounds = this.player.getBounds();
            const bounds = pair.getBounds();
            if (this.isColliding(playerBounds, bounds.top) || 
                this.isColliding(playerBounds, bounds.bottom)) {
                this.gameOver('Game Over! You hit a paddle.');
                return;
            }
        }
        
        this.animationFrameId = requestAnimationFrame(() => {
            this.movePaddles();
        });
    }
    
    // Start game
    startGame() {
        this.isGameActive = true;
        this.movePaddles();
        
        // Show how-to hint on first launch only
        if (!this.hintShown) {
            this.hintShown = true;
            this.showHowToHint();
        }
    }
    
    // Show how-to hint overlay
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
        text.textContent = 'Drag the Red Dot Through the Doors to the Green Exit';
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
        
        if (this.gamebox) {
            this.gamebox.appendChild(hint);
        }
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
                if (this.howToHint && this.howToHint.parentNode) {
                    this.howToHint.remove();
                }
                this.howToHint = null;
            }, 500);
        }
    }
    
    // Game over
    gameOver(message) {
        this.isGameActive = false;
        
        // Stop animations
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Show overlay
        if (this.message) {
            this.message.textContent = message || 'Game Over! You hit a paddle.';
        }
        if (this.overlay) {
            this.overlay.style.display = 'flex';
        }
    }
    
    // Game win
    gameWin() {
        this.isGameActive = false;
        
        // Stop animations
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Hide next level button if at max level
        if (this.nextLevelBtn && this.currentLevel >= this.maxLevel) {
            this.nextLevelBtn.style.display = 'none';
        }
        
        // Show overlay
        if (this.message) {
            this.message.textContent = 'Congratulations! You Win!';
        }
        if (this.overlay) {
            this.overlay.style.display = 'flex';
        }
    }
    
    // Try again (restart current level)
    tryAgain() {
        // Hide overlay
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
        
        // Reset game state (keep current level)
        this.restartGame();
    }
    
    // Next level
    nextLevel() {
        if (this.currentLevel < this.maxLevel) {
            // Update level
            const nextLevel = this.currentLevel + 1;
            this.currentLevel = nextLevel;
            this.saveLevel();
            this.baseSpeed = Math.min(this.currentLevel - 1, 5);
            
            // Hide next level button if reached max level
            if (this.nextLevelBtn && this.currentLevel >= this.maxLevel) {
                this.nextLevelBtn.style.display = 'none';
            }
            
            // Hide overlay
            if (this.overlay) {
                this.overlay.style.display = 'none';
            }
            
            // Restart game with new level
            this.restartGame();
        }
    }
    
    // Reset (restart at level 1)
    reset() {
        // Update level to 1
        this.currentLevel = 1;
        this.saveLevel();
        this.baseSpeed = 0;
        
        // Show next level button (since we're back to level 1)
        if (this.nextLevelBtn) {
            this.nextLevelBtn.style.display = 'block';
        }
        
        // Hide overlay
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
        
        // Restart game
        this.restartGame();
    }
    
    // Restart game (reinitialize without page reload)
    restartGame() {
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        // Stop all animations
        this.isGameActive = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Reset drag state
        this.isDragging = false;
        
        // Remove existing paddles
        this.paddlePairs.forEach(pair => {
            if (pair.topElement) {
                pair.topElement.remove();
            }
            if (pair.bottomElement) {
                pair.bottomElement.remove();
            }
        });
        this.paddlePairs = [];
        
        // Recreate paddles
        this.createPaddles();
        
        // Reset player position
        if (this.player) {
            this.player.x = 0;
            this.player.y = Math.floor(this.gameHeight / 2 - 15 * this.adaptive);
            this.player.updatePosition();
        }
        
        // Update exit position
        if (this.exit) {
            this.exit.x = this.gameWidth - EXIT_WIDTH;
            this.exit.y = Math.floor(this.gameHeight / 2 - 30 * this.adaptive);
            this.exit.updatePosition();
        }
        
        // Start game
        this.startGame();
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DragMazeDoorGame();
    });
} else {
    new DragMazeDoorGame();
}

