/*
 * Blocker Maze Game - Alternative Implementation
 * Rewritten with different code structure and algorithms
 * Uses ES6 classes, native JavaScript, and different maze generation
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
const BASE_GRID_SIZE = 14;
const INITIAL_TIME = 20;
const PAUSE_DURATION = 5;
const PATH_DISPLAY_DURATION = 5;
const OBSTACLE_UPDATE_INTERVAL = 2000; // 2 seconds
const LEVEL_STORAGE_KEY = 'blocker_maze_level'; // Use chrome.storage.local
const WALL_SPACE = 2;
const BOX_SPACE = 2;

// Game states
const GAME_STATE = {
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver',
    WON: 'won'
};

// Blocker Maze Game Class
class BlockerMazeGame {
    constructor() {
        // Screen dimensions
        this.screenWidth = window.innerWidth - 80;
        this.screenHeight = window.innerHeight - Math.max(100, Math.floor(window.innerHeight * 0.14));
        this.gameDefaultWidth = 580;
        this.gameDefaultHeight = 490;
        
        // Calculate adaptive size
        const modSize = (this.screenWidth < 800 || this.screenHeight < 600) ? 10 : 0;
        this.adaptive = Math.min(
            this.screenWidth / (this.gameDefaultWidth + modSize),
            this.screenHeight / (this.gameDefaultHeight + modSize)
        ) || 0.8;
        
        // Game state
        this.state = GAME_STATE.PLAYING;
        this.isGameOver = false;
        this.gameLevel = 0;
        this.remainingTime = INITIAL_TIME;
        this.pauseSeconds = PAUSE_DURATION;
        this.pathSeconds = PATH_DISPLAY_DURATION;
        this.pauseClicked = false;
        
        // Grid dimensions (will be set in startGame)
        this.gridSize = 0;
        this.padding = 12;
        this.cellSize = 0;
        this.blockSize = 0;
        this.canvasSize = 0;
        this.topbarHeight = Math.floor(30 * this.adaptive);
        this.sidebarWidth = Math.floor(85 * this.adaptive) + 40 * this.adaptive;
        
        // Player position
        this.player = { row: 0, col: 0 };
        this.startPos = { row: 0, col: 0 };
        this.endPos = { row: 0, col: 0 };
        
        // Maze data
        this.way = []; // Path connection matrix
        this.bkemp = []; // Edge pairs for way restoration
        this.obstacleLocations = [];
        this.validObstacleLocations = [];
        
        // Path visualization
        this.shortestPath = null;
        this.pathTimer = null;
        
        // Timers
        this.gameTimer = null;
        this.pauseTimer = null;
        this.obstacleTimer = null;
        
        // Canvas context
        this.ctx = null;
        
        // Initialize
        this.init();
    }
    
    // Initialize game
    async init() {
        if (window.innerWidth < 768) {
            return;
        }
        
        // Disable scroll
        this.disableScroll();
        
        // Setup UI
        this.setupUI();
        
        // Load game level (async)
        await this.loadGameLevel();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start game
        this.startGame();
    }
    
    // Disable scroll
    disableScroll() {
        window.addEventListener('keydown', this.preventScrollKeys.bind(this), {
            passive: false
        });
    }
    
    // Enable scroll
    enableScroll() {
        setTimeout(() => {
            window.removeEventListener('keydown', this.preventScrollKeys);
        }, 500);
    }
    
    // Prevent scroll keys
    preventScrollKeys(event) {
        const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D', ' '];
        if (keys.includes(event.key)) {
            event.preventDefault();
        }
    }
    
    // Setup UI elements
    setupUI() {
        const topbar = document.getElementById('topbar');
        if (topbar) {
            topbar.style.height = `${this.topbarHeight}px`;
        }
        
        const levelv = document.getElementById('levelv');
        if (levelv) {
            levelv.style.fontSize = `${Math.floor(this.adaptive * 18)}px`;
        }
        
        const remain = document.getElementById('remain');
        if (remain) {
            remain.style.fontSize = `${Math.floor(this.adaptive * 18)}px`;
        }
        
        const timerbox = document.getElementById('timer');
        if (timerbox) {
            timerbox.style.fontSize = `${Math.floor(this.adaptive * 20)}px`;
        }
        
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
        
        const rsetBtn = document.getElementById('rsetBtn');
        if (rsetBtn) {
            rsetBtn.style.width = `${Math.floor(100 * this.adaptive)}px`;
            rsetBtn.style.height = `${Math.floor(28 * this.adaptive)}px`;
            rsetBtn.style.fontSize = `${Math.floor(17 * this.adaptive)}px`;
        }
        
        const btns = document.getElementById('btns');
        if (btns) {
            btns.style.fontSize = `${Math.floor(28 * this.adaptive)}px`;
        }
        
        const nextbtn = document.getElementById('nextbtn');
        if (nextbtn) {
            nextbtn.style.width = `${Math.floor(200 * this.adaptive)}px`;
            nextbtn.style.height = `${Math.floor(40 * this.adaptive)}px`;
            nextbtn.style.fontSize = `${Math.floor(28 * this.adaptive)}px`;
        }
        
        const resetbtn = document.getElementById('resetbtn');
        if (resetbtn) {
            resetbtn.style.width = `${Math.floor(200 * this.adaptive)}px`;
            resetbtn.style.height = `${Math.floor(40 * this.adaptive)}px`;
            resetbtn.style.fontSize = `${Math.floor(28 * this.adaptive)}px`;
        }
    }
    
    // Load game level from chrome.storage.local or URL
    async loadGameLevel() {
        // Check URL parameter first
        const urlParams = new URLSearchParams(window.location.search);
        const level = urlParams.get('mlv');
        if (level !== null && Number.isInteger(Number(level))) {
            this.gameLevel = parseInt(level, 10);
            this.saveLevel();
            return;
        }
        
        // Load from chrome.storage.local
        const levelVal = await this.getLevelAsync();
        
        if (levelVal !== null && !isNaN(levelVal)) {
            this.gameLevel = levelVal;
        } else {
            this.gameLevel = 0;
        }
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
        
        // Recalculate dimensions based on new adaptive size
        this.topbarHeight = Math.floor(30 * this.adaptive);
        this.sidebarWidth = Math.floor(85 * this.adaptive) + 40 * this.adaptive;
        
        // Update UI with new sizes
        this.setupUI();
    }
    
    // Start game
    startGame(skipAdaptiveUpdate = false) {
        // Update adaptive size based on current window size (unless skipped)
        if (!skipAdaptiveUpdate) {
            this.updateAdaptiveSize();
        }
        
        // Calculate grid size based on level
        this.gridSize = BASE_GRID_SIZE + this.gameLevel;
        
        // Calculate cell size
        const blockSizeMax = Math.min(
            this.screenWidth - this.sidebarWidth - this.padding * 2 - 20,
            this.screenHeight - this.topbarHeight - this.padding * 2 - 20
        );
        this.cellSize = Math.floor(blockSizeMax / this.gridSize);
        this.blockSize = Math.floor(this.cellSize * 0.7);
        this.canvasSize = this.gridSize * this.cellSize + this.padding * 2;
        
        // Update UI dimensions
        this.updateUIDimensions();
        
        // Get canvas context
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.width = this.canvasSize;
            canvas.height = this.canvasSize;
            this.ctx = canvas.getContext('2d');
        }
        
        // Reset game state
        this.isGameOver = false;
        this.state = GAME_STATE.PLAYING;
        this.remainingTime = INITIAL_TIME;
        this.pauseSeconds = PAUSE_DURATION;
        this.player = { line: 0, col: 0 };
        this.startPos = { line: 0, col: 0 };
        this.endPos = { line: this.gridSize - 1, col: this.gridSize - 1 };
        this.shortestPath = null;
        this.obstacleLocations = [];
        
        // Clear canvas
        if (this.ctx) {
            this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        // Generate maze
        this.generateMaze();
        
        // Draw start and end positions
        this.drawStartEnd();
        
        // Start timers
        this.startTimer();
        this.startObstacleRandomization();
        
        // Update level display
        const levelv = document.getElementById('levelv');
        if (levelv) {
            levelv.textContent = `Level ${this.gameLevel + 1}`;
        }
    }
    
    // Update UI dimensions
    updateUIDimensions() {
        const topbar = document.getElementById('topbar');
        if (topbar) {
            topbar.style.paddingLeft = `${this.padding}px`;
            topbar.style.paddingRight = `${this.padding}px`;
            topbar.style.width = `${this.canvasSize}px`;
        }
        
        const mainctn = document.getElementById('mainctn');
        if (mainctn) {
            mainctn.style.height = `${this.canvasSize}px`;
        }
        
        const maze = document.getElementById('maze');
        if (maze) {
            maze.style.height = `${this.canvasSize}px`;
        }
        
        const gamebox = document.getElementById('gamebox');
        if (gamebox) {
            // Match classic-maze gamebox height
            const classicCanvasH = Math.floor(30 * this.adaptive) * 14 + Math.floor(15 * this.adaptive) * 2;
            const classicGameboxH = classicCanvasH + 2 + Math.floor(30 * this.adaptive);
            const contentH = this.canvasSize + 2 + this.topbarHeight;
            gamebox.style.width = `${this.canvasSize + this.sidebarWidth + 2}px`;
            gamebox.style.height = `${Math.max(contentH, classicGameboxH)}px`;
        }
        
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.style.width = `${this.sidebarWidth}px`;
            sidebar.style.height = `${this.canvasSize}px`;
        }
    }
    
    // Generate maze using Union-Find algorithm (matching original exactly)
    generateMaze() {
        if (!this.ctx) return;
        
        // Draw complete grid first
        this.drawGrid();
        
        // Initialize way matrix
        this.way = [];
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            this.way[i] = [];
            for (let j = 0; j < this.gridSize * this.gridSize; j++) {
                this.way[i][j] = -1;
            }
        }
        
        // Initialize bkemp array
        this.bkemp = [];
        
        // Union-Find data structure
        const parent = [];
        for (let j = 0; j < this.gridSize * this.gridSize; j++) {
            parent[j] = j;
        }
        
        // Find function
        const find = (a) => {
            while (a !== parent[a]) {
                a = parent[a];
            }
            return a;
        };
        
        // Union function
        const union = (a, b) => {
            const pa = find(a);
            const pb = find(b);
            parent[pb] = pa;
        };
        
        // Get random neighbor (matching original getNBB exactly)
        const getNBB = (a) => {
            const y = Math.floor(a / this.gridSize);
            const x = a % this.gridSize;
            const myNBB = [];
            
            if (x - 1 >= 0) {
                myNBB.push(y * this.gridSize + x - 1);
            }
            if (x + 1 < this.gridSize) {
                myNBB.push(y * this.gridSize + x + 1);
            }
            if (y + 1 < this.gridSize) {
                myNBB.push((y + 1) * this.gridSize + x);
            }
            if (y - 1 >= 0) {
                myNBB.push((y - 1) * this.gridSize + x);
            }
            
            const ran = Math.floor(Math.random() * myNBB.length);
            return myNBB[ran];
        };
        
        // Location set for obstacle placement
        const locationSet = new Set();
        
        // Drawline function (matching original exactly)
        const drawline = (a, b) => {
            const y1 = Math.floor(a / this.gridSize);
            const x1 = a % this.gridSize;
            const y2 = Math.floor(b / this.gridSize);
            const x2 = b % this.gridSize;
            const x3 = x1 < x2 ? x1 : x2;
            
            if (y1 - y2 === 0) {
                // Horizontal connection (matching original exactly)
                this.ctx.clearRect(
                    this.padding + (x3 + 1) * this.cellSize - 1,
                    this.padding + y2 * this.cellSize + 1,
                    WALL_SPACE,
                    this.cellSize - WALL_SPACE
                );
            } else {
                // Vertical connection (matching original exactly)
                this.ctx.clearRect(
                    this.padding + x1 * this.cellSize + 1,
                    this.padding + ((y1 + y2) / 2 + 0.5) * this.cellSize - 1,
                    this.cellSize - WALL_SPACE,
                    WALL_SPACE
                );
            }
            
            // Track location for obstacle placement
            if (a > b) {
                locationSet.add(a);
            } else {
                locationSet.add(b);
            }
        };
        
        // Generate maze until start and end are connected
        const startIndex = 0;
        const endIndex = this.gridSize * this.gridSize - 1;
        
        while (find(startIndex) !== find(endIndex)) {
            const num = Math.floor(Math.random() * this.gridSize * this.gridSize);
            const neighbour = getNBB(num);
            
            if (find(num) === find(neighbour)) {
                continue;
            } else {
                drawline(num, neighbour);
                union(num, neighbour);
                this.way[num][neighbour] = 1;
                this.way[neighbour][num] = 1;
                this.bkemp.push(num);
                this.bkemp.push(neighbour);
                this.bkemp.push(neighbour);
                this.bkemp.push(num);
            }
        }
        
        // Store valid obstacle locations
        const sortedLocations = Array.from(locationSet).sort((a, b) => a - b);
        sortedLocations.pop(); // Exclude exit
        this.validObstacleLocations = sortedLocations;
        
        // Restore way connections from bkemp
        const empNum = this.bkemp.length / 2;
        for (let k = 0; k < empNum; k++) {
            this.way[this.bkemp[k * 2]][this.bkemp[k * 2 + 1]] = 1;
        }
    }
    
    // Draw complete grid (matching original drawmazeCanvas exactly)
    drawGrid() {
        if (!this.ctx) return;
        
        this.ctx.strokeStyle = '#ccc';
        // Don't set lineWidth, use default (matching original)
        
        for (let i = 0; i < this.gridSize + 1; i++) {
            // Vertical lines (matching original: moveTo then lineTo then stroke)
            this.ctx.moveTo(this.padding + i * this.cellSize, this.padding);
            this.ctx.lineTo(this.padding + i * this.cellSize, this.padding + this.cellSize * this.gridSize);
            this.ctx.stroke();
            
            // Horizontal lines (matching original: moveTo then lineTo then stroke)
            this.ctx.moveTo(this.padding, this.padding + i * this.cellSize);
            this.ctx.lineTo(this.padding + this.cellSize * this.gridSize, this.padding + i * this.cellSize);
            this.ctx.stroke();
        }
    }
    
    // Draw start and end positions
    drawStartEnd() {
        if (!this.ctx) return;
        
        const boxSize = this.cellSize - BOX_SPACE * 2;
        
        // Draw start position (red) - line is x, col is y
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(
            this.startPos.line * this.cellSize + this.padding + BOX_SPACE,
            this.startPos.col * this.cellSize + this.padding + BOX_SPACE,
            boxSize,
            boxSize
        );
        
        // Draw end position (green) - line is x, col is y
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(
            this.endPos.line * this.cellSize + this.padding + BOX_SPACE,
            this.endPos.col * this.cellSize + this.padding + BOX_SPACE,
            boxSize,
            boxSize
        );
        
        this.ctx.fillStyle = 'red';
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Keyboard input
        document.onkeydown = (e) => {
            this.handleKeyPress(e);
        };
        
        // Path button
        const pathBtn = document.getElementById('pathBtn');
        if (pathBtn) {
            pathBtn.addEventListener('click', () => this.showSolution());
        }
        
        // Pause button
        const timePauseBtn = document.getElementById('timePauseBtn');
        if (timePauseBtn) {
            timePauseBtn.addEventListener('click', () => this.togglePause());
        }
        
        // Reset button
        const rsetBtn = document.getElementById('rsetBtn');
        if (rsetBtn) {
            rsetBtn.addEventListener('click', () => this.resetLevel());
        }
        
        // Next button
        const nextbtn = document.getElementById('nextbtn');
        if (nextbtn) {
            nextbtn.addEventListener('click', () => this.nextLevel());
        }
        
        // Reset button (game over)
        const resetbtn = document.getElementById('resetbtn');
        if (resetbtn) {
            resetbtn.addEventListener('click', () => this.resetGame());
        }
    }
    
    // Handle key press
    handleKeyPress(e) {
        if (this.isGameOver) {
            // Handle Enter or Space for next level
            if (e.keyCode === 13 || e.keyCode === 32) {
                const gameover = document.getElementById('gameover');
                if (gameover && gameover.style.display === 'flex') {
                    this.nextLevel();
                }
            }
            return;
        }
        
        const oldLine = this.player.line;
        const oldCol = this.player.col;
        let newLine = oldLine;
        let newCol = oldCol;
        let moved = false;
        
        switch (e.keyCode) {
            case 37: // Left
            case 65: // A
                newLine--;
                if (this.isValidMove(newLine, newCol, oldLine, oldCol)) {
                    moved = true;
                } else {
                    newLine++;
                }
                break;
            case 38: // Up
            case 87: // W
                newCol--;
                if (this.isValidMove(newLine, newCol, oldLine, oldCol)) {
                    moved = true;
                } else {
                    newCol++;
                }
                break;
            case 39: // Right
            case 68: // D
                newLine++;
                if (this.isValidMove(newLine, newCol, oldLine, oldCol)) {
                    moved = true;
                } else {
                    newLine--;
                }
                break;
            case 40: // Down
            case 83: // S
                newCol++;
                if (this.isValidMove(newLine, newCol, oldLine, oldCol)) {
                    moved = true;
                } else {
                    newCol--;
                }
                break;
        }
        
        if (moved) {
            this.movePlayer(newLine, newCol, oldLine, oldCol);
            this.checkWin();
        }
    }
    
    // Check if move is valid (matching original checkWay: oldSeq = tempCol * BKNUM + tempLine)
    isValidMove(newLine, newCol, oldLine, oldCol) {
        // Check bounds
        if (newLine < 0 || newLine >= this.gridSize || newCol < 0 || newCol >= this.gridSize) {
            return false;
        }
        
        // Check if path exists (using way matrix) - matching original: oldSeq = tempCol * BKNUM + tempLine
        const oldSeq = oldCol * this.gridSize + oldLine;
        const newSeq = newCol * this.gridSize + newLine;
        
        if (this.way[oldSeq] && (this.way[oldSeq][newSeq] === 1 || this.way[newSeq][oldSeq] === 1)) {
            // Check if target is blocked by obstacle
            if (this.obstacleLocations.indexOf(newSeq) !== -1) {
                return false;
            }
            return true;
        }
        
        return false;
    }
    
    // Move player (matching original: line is x, col is y)
    movePlayer(newLine, newCol, oldLine, oldCol) {
        if (!this.ctx) return;
        
        const boxSize = this.cellSize - BOX_SPACE * 2;
        
        // Clear old position - line is x, col is y
        this.ctx.clearRect(
            oldLine * this.cellSize + this.padding + BOX_SPACE,
            oldCol * this.cellSize + this.padding + BOX_SPACE,
            boxSize,
            boxSize
        );
        
        // Clear path cell if path is displayed
        if (this.shortestPath && this.shortestPath.length > 0) {
            this.clearPathCell(oldLine, oldCol, newLine, newCol);
        }
        
        // Update position
        this.player.line = newLine;
        this.player.col = newCol;
        
        // Draw new position - line is x, col is y
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(
            newLine * this.cellSize + this.padding + BOX_SPACE,
            newCol * this.cellSize + this.padding + BOX_SPACE,
            boxSize,
            boxSize
        );
    }
    
    // Check win condition
    checkWin() {
        if (this.player.line === this.endPos.line && this.player.col === this.endPos.col) {
            this.win();
        }
    }
    
    // Win game
    win() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        this.isGameOver = true;
        this.state = GAME_STATE.WON;
        
        const overmsg = document.getElementById('overmsg');
        if (overmsg) {
            overmsg.textContent = 'You win!';
            overmsg.style.fontSize = `${Math.floor(36 * this.adaptive)}px`;
        }
        
        const nextbtn = document.getElementById('nextbtn');
        if (nextbtn) {
            nextbtn.textContent = 'Next Level';
        }
        
        const gameover = document.getElementById('gameover');
        if (gameover) {
            gameover.style.display = 'flex';
        }
        
        // Don't increment level here - it will be incremented in nextLevel() when user clicks "Next Level"
        this.enableScroll();
    }
    
    // Start timer (resets time to initial)
    startTimer() {
        this.remainingTime = INITIAL_TIME;
        this.updateTimer();
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        this.gameTimer = setInterval(() => {
            if (this.isGameOver || this.state === GAME_STATE.PAUSED) {
                return;
            }
            
            this.remainingTime--;
            this.updateTimer();
            
            if (this.remainingTime < 0) {
                this.gameOver();
            }
        }, 1000);
    }
    
    // Resume timer (continues from current time)
    resumeTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        this.state = GAME_STATE.PLAYING;
        
        this.gameTimer = setInterval(() => {
            if (this.isGameOver || this.state === GAME_STATE.PAUSED) {
                return;
            }
            
            this.remainingTime--;
            this.updateTimer();
            
            if (this.remainingTime < 0) {
                this.gameOver();
            }
        }, 1000);
    }
    
    // Update timer display
    updateTimer() {
        const timerbox = document.getElementById('timer');
        if (timerbox) {
            timerbox.textContent = `${this.remainingTime}s`;
        }
    }
    
    // Game over
    gameOver() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        this.isGameOver = true;
        this.state = GAME_STATE.GAME_OVER;
        
        const overmsg = document.getElementById('overmsg');
        if (overmsg) {
            overmsg.textContent = 'You loss :(';
            overmsg.style.fontSize = `${Math.floor(36 * this.adaptive)}px`;
        }
        
        const nextbtn = document.getElementById('nextbtn');
        if (nextbtn) {
            nextbtn.textContent = 'Try Again';
        }
        
        const gameover = document.getElementById('gameover');
        if (gameover) {
            gameover.style.display = 'flex';
        }
        
        this.saveLevel();
        this.enableScroll();
    }
    
    // Start obstacle randomization
    startObstacleRandomization() {
        this.randomizeObstacles();
        
        if (this.obstacleTimer) {
            clearInterval(this.obstacleTimer);
        }
        
        this.obstacleTimer = setInterval(() => {
            if (!this.isGameOver) {
                // Continue obstacle randomization even when paused (matching original behavior)
                this.randomizeObstacles();
            }
        }, OBSTACLE_UPDATE_INTERVAL);
    }
    
    // Randomize obstacles
    randomizeObstacles() {
        if (this.remainingTime < 0 || this.isGameOver) {
            return;
        }
        
        if (!this.ctx) return;
        
        // Clear existing obstacles
        for (let i = 0; i < this.obstacleLocations.length; i++) {
            this.clearObstacle(this.obstacleLocations[i]);
        }
        
        // Generate new obstacles
        this.obstacleLocations = [];
        const numObstacles = 5 + this.gameLevel;
        const currentPlayerIndex = this.player.col * this.gridSize + this.player.line; // matching original: currentCol * BKNUM + currentLine
        
        // Filter out player position
        const availableLocations = this.validObstacleLocations.filter(
            loc => loc !== currentPlayerIndex
        );
        
        // Randomly select obstacle locations
        while (this.obstacleLocations.length < numObstacles && availableLocations.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableLocations.length);
            const location = availableLocations[randomIndex];
            
            if (this.obstacleLocations.indexOf(location) === -1) {
                this.obstacleLocations.push(location);
                availableLocations.splice(randomIndex, 1);
            }
        }
        
        // Draw obstacles
        for (let j = 0; j < this.obstacleLocations.length; j++) {
            this.drawObstacle(this.obstacleLocations[j]);
        }
        
        // Restore way connections from bkemp
        const empNum = this.bkemp.length / 2;
        for (let k = 0; k < empNum; k++) {
            this.way[this.bkemp[k * 2]][this.bkemp[k * 2 + 1]] = 1;
        }
    }
    
    // Draw obstacle
    drawObstacle(index) {
        if (!this.ctx) return;
        
        const row = Math.floor(index / this.gridSize);
        const col = index % this.gridSize;
        const bkPad = Math.floor(5 * this.adaptive);
        
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(
            this.padding + col * this.cellSize + bkPad,
            this.padding + row * this.cellSize + bkPad,
            this.blockSize,
            this.blockSize
        );
    }
    
    // Clear obstacle
    clearObstacle(index) {
        if (!this.ctx) return;
        
        const row = Math.floor(index / this.gridSize);
        const col = index % this.gridSize;
        const bkPad = Math.floor(5 * this.adaptive);
        
        // Clear obstacle area
        this.ctx.clearRect(
            this.padding + col * this.cellSize + bkPad,
            this.padding + row * this.cellSize + bkPad,
            this.blockSize,
            this.blockSize
        );
        
        // Redraw path if obstacle was on path
        if (this.shortestPath && this.shortestPath.length > 0) {
            const obstaclePositionIndex = this.shortestPath.indexOf(index);
            if (obstaclePositionIndex !== -1) {
                const pathCellList = [
                    this.shortestPath[obstaclePositionIndex - 1],
                    index,
                    this.shortestPath[obstaclePositionIndex + 1]
                ];
                this.drawPath(pathCellList, 'red');
            }
        }
    }
    
    // Show solution path
    showSolution() {
        if (this.isGameOver) return;
        
        const startPosition = this.player.col * this.gridSize + this.player.line; // matching original: currentCol * BKNUM + currentLine
        const endPosition = this.gridSize * this.gridSize - 1;
        
        // Clear previous path
        if (this.shortestPath) {
            this.clearPath(this.shortestPath);
            if (this.pathTimer) {
                clearTimeout(this.pathTimer);
            }
        }
        
        // Calculate path
        this.shortestPath = this.findShortestPath(startPosition, endPosition);
        
        // Draw path
        if (this.shortestPath.length > 0) {
            this.drawPath(this.shortestPath, 'red');
            
            // Clear path after delay
            this.pathTimer = setTimeout(() => {
                if (!this.isGameOver) {
                    this.clearPath(this.shortestPath);
                    this.shortestPath = null;
                }
            }, this.pathSeconds * 1000);
        }
    }
    
    // BFS pathfinding (matching original logic)
    findShortestPath(start, end) {
        const queue = [];
        const visited = new Array(this.gridSize * this.gridSize).fill(false);
        const prev = new Array(this.gridSize * this.gridSize).fill(-1);
        
        queue.push(start);
        visited[start] = true;
        
        while (queue.length > 0) {
            const node = queue.shift();
            
            if (node === end) {
                break;
            }
            
            const neighbours = this.getNeighbors(node);
            for (let i = 0; i < neighbours.length; i++) {
                const next = neighbours[i];
                if (!visited[next] && this.way[node] && this.way[node][next] === 1) {
                    queue.push(next);
                    visited[next] = true;
                    prev[next] = node;
                }
            }
        }
        
        // Reconstruct path
        const path = [];
        for (let at = end; at !== -1; at = prev[at]) {
            path.push(at);
        }
        path.reverse();
        
        if (path[0] === start) {
            return path;
        }
        
        return [];
    }
    
    // Get neighbors of a node
    getNeighbors(node) {
        const neighbors = [];
        const row = Math.floor(node / this.gridSize);
        const col = node % this.gridSize;
        
        // Check all four possible directions (up, down, left, right)
        if (row > 0) neighbors.push(node - this.gridSize); // Up
        if (row < this.gridSize - 1) neighbors.push(node + this.gridSize); // Down
        if (col > 0) neighbors.push(node - 1); // Left
        if (col < this.gridSize - 1) neighbors.push(node + 1); // Right
        
        return neighbors;
    }
    
    // Draw path
    drawPath(path, color) {
        if (!this.ctx) return;
        
        for (let i = 0; i < path.length - 1; i++) {
            const start = path[i];
            const end = path[i + 1];
            const y1 = Math.floor(start / this.gridSize);
            const x1 = start % this.gridSize;
            const y2 = Math.floor(end / this.gridSize);
            const x2 = end % this.gridSize;
            
            const boxSize = this.cellSize - BOX_SPACE * 2;
            const startX = x1 * this.cellSize + BOX_SPACE + this.padding + boxSize / 2;
            const startY = y1 * this.cellSize + BOX_SPACE + this.padding + boxSize / 2;
            const endX = x2 * this.cellSize + BOX_SPACE + this.padding + boxSize / 2;
            const endY = y2 * this.cellSize + BOX_SPACE + this.padding + boxSize / 2;
            
            this.drawArrow(startX, startY, endX, endY, color);
        }
    }
    
    // Draw arrow
    drawArrow(fromX, fromY, toX, toY, color) {
        if (!this.ctx) return;
        
        const headlen = Math.floor(this.cellSize / 3);
        const angle = Math.atan2(toY - fromY, toX - fromX);
        
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
        this.ctx.lineWidth = 2 * this.adaptive;
        
        // Draw the line
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();
        
        // Draw the arrow head
        this.ctx.beginPath();
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        this.ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        this.ctx.lineTo(toX, toY);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    // Clear path
    clearPath(path) {
        if (!this.ctx) return;
        
        for (let i = 0; i < path.length - 1; i++) {
            const start = path[i];
            const end = path[i + 1];
            const y1 = Math.floor(start / this.gridSize);
            const x1 = start % this.gridSize;
            const y2 = Math.floor(end / this.gridSize);
            const x2 = end % this.gridSize;
            
            const boxSize = this.cellSize - BOX_SPACE * 2;
            const startX = x1 * this.cellSize + BOX_SPACE + this.padding + boxSize / 2;
            const startY = y1 * this.cellSize + BOX_SPACE + this.padding + boxSize / 2;
            const endX = x2 * this.cellSize + BOX_SPACE + this.padding + boxSize / 2;
            const endY = y2 * this.cellSize + BOX_SPACE + this.padding + boxSize / 2;
            
            const headlen = Math.floor(this.cellSize / 3);
            const angle = Math.atan2(endY - startY, endX - startX);
            let valCos = Math.cos(angle);
            let valSin = Math.sin(angle);
            
            if (valCos === -1) {
                valCos = 1;
            }
            if (valSin === -1) {
                valSin = 1;
            }
            
            this.ctx.clearRect(
                startX - headlen * valSin,
                startY - headlen * valCos,
                (endX - startX) * valCos + 2 * headlen * valSin,
                (endY - startY) * valSin + 2 * headlen * valCos
            );
            
            const boxSizeHalf = boxSize / 2;
            this.ctx.clearRect(
                startX - boxSizeHalf,
                startY - boxSizeHalf,
                boxSize,
                boxSize
            );
            
            // Redraw player if at start position - line is x, col is y
            if (this.player.col === y1 && this.player.line === x1) {
                this.ctx.fillStyle = 'red';
                this.ctx.fillRect(
                    this.player.line * this.cellSize + this.padding + BOX_SPACE,
                    this.player.col * this.cellSize + this.padding + BOX_SPACE,
                    boxSize,
                    boxSize
                );
            }
            
            // Redraw end position
            this.ctx.fillStyle = 'green';
            this.ctx.fillRect(
                (this.gridSize - 1) * this.cellSize + this.padding + BOX_SPACE,
                (this.gridSize - 1) * this.cellSize + this.padding + BOX_SPACE,
                boxSize,
                boxSize
            );
        }
    }
    
    // Clear path cell (matching original: line is x, col is y)
    clearPathCell(startLine, startCol, endLine, endCol) {
        if (!this.ctx) return;
        
        const boxSize = this.cellSize - BOX_SPACE * 2;
        const startX = startLine * this.cellSize + BOX_SPACE + this.padding + boxSize / 2;
        const startY = startCol * this.cellSize + BOX_SPACE + this.padding + boxSize / 2;
        const endX = endLine * this.cellSize + BOX_SPACE + this.padding + boxSize / 2;
        const endY = endCol * this.cellSize + BOX_SPACE + this.padding + boxSize / 2;
        
        const headlen = Math.floor(this.cellSize / 3);
        const angle = Math.atan2(endY - startY, endX - startX);
        let valCos = Math.cos(angle);
        let valSin = Math.sin(angle);
        
        if (valCos === -1) {
            valCos = 1;
        }
        if (valSin === -1) {
            valSin = 1;
        }
        
        this.ctx.clearRect(
            startX - headlen * valSin,
            startY - headlen * valCos,
            (endX - startX) * valCos + 2 * headlen * valSin,
            (endY - startY) * valSin + 2 * headlen * valCos
        );
        
        const boxSizeHalf = boxSize / 2;
        this.ctx.clearRect(
            startX - boxSizeHalf,
            startY - boxSizeHalf,
            boxSize,
            boxSize
        );
    }
    
    // Toggle pause
    togglePause() {
        if (this.isGameOver) return;
        
        if (!this.pauseClicked) {
            this.pauseClicked = true;
            this.state = GAME_STATE.PAUSED;
            if (this.gameTimer) {
                clearInterval(this.gameTimer);
            }
            this.pauseCountdown();
            this.pauseTimer = setInterval(() => this.pauseCountdown(), 1000);
        }
    }
    
    // Pause countdown
    pauseCountdown() {
        if (this.isGameOver) return;
        
        const timePauseBtn = document.getElementById('timePauseBtn');
        if (!timePauseBtn) return;
        
        if (this.pauseSeconds >= 0) {
            timePauseBtn.textContent = `Paused (${this.pauseSeconds}s)`;
            timePauseBtn.style.fontSize = `${Math.floor(15 * this.adaptive)}px`;
            timePauseBtn.style.background = 'red';
            this.pauseSeconds--;
        } else {
            timePauseBtn.textContent = 'Pause';
            timePauseBtn.style.fontSize = `${Math.floor(17 * this.adaptive)}px`;
            timePauseBtn.style.background = '#00BB00';
            // Resume timer without resetting time (matching original)
            this.resumeTimer();
            this.pauseClicked = false;
            if (this.pauseTimer) {
                clearInterval(this.pauseTimer);
            }
            this.pauseSeconds = PAUSE_DURATION;
        }
    }
    
    // Reset level
    resetLevel() {
        // Clear all timers
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        if (this.pauseTimer) {
            clearInterval(this.pauseTimer);
        }
        if (this.obstacleTimer) {
            clearInterval(this.obstacleTimer);
        }
        if (this.pathTimer) {
            clearTimeout(this.pathTimer);
        }
        
        // Reset game level
        this.gameLevel = 0;
        this.saveLevel();
        
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
        this.pauseClicked = false;
        this.pauseSeconds = PAUSE_DURATION;
        
        // Restart game without updating adaptive size (keep current interface size)
        this.startGame(true);
    }
    
    // Next level
    nextLevel() {
        // Clear all timers
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        if (this.pauseTimer) {
            clearInterval(this.pauseTimer);
        }
        if (this.obstacleTimer) {
            clearInterval(this.obstacleTimer);
        }
        if (this.pathTimer) {
            clearTimeout(this.pathTimer);
        }
        
        // Check if we won or lost to determine level change
        if (this.state === GAME_STATE.WON) {
            // Success: increase level
            this.gameLevel++;
            this.saveLevel();
        } else if (this.state === GAME_STATE.GAME_OVER) {
            // Failure: keep same level (already saved in gameOver)
            // Level is already set correctly from storage
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
        this.pauseClicked = false;
        this.pauseSeconds = PAUSE_DURATION;
        
        // Restart game with updated level
        this.startGame();
    }
    
    // Reset game
    resetGame() {
        // Clear all timers
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        if (this.pauseTimer) {
            clearInterval(this.pauseTimer);
        }
        if (this.obstacleTimer) {
            clearInterval(this.obstacleTimer);
        }
        if (this.pathTimer) {
            clearTimeout(this.pathTimer);
        }
        
        // Reset game level
        this.gameLevel = 0;
        this.saveLevel();
        
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
        this.pauseClicked = false;
        this.pauseSeconds = PAUSE_DURATION;
        
        // Restart game
        this.startGame();
    }
    
    // Save level to chrome.storage.local
    saveLevel() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ [LEVEL_STORAGE_KEY]: this.gameLevel }, () => {
                    if (chrome.runtime.lastError) {
                        // Fallback to localStorage
                        try {
                            localStorage.setItem(LEVEL_STORAGE_KEY, this.gameLevel.toString());
                        } catch (e) {
                            // Failed to save to localStorage
                        }
                    }
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                try {
                    localStorage.setItem(LEVEL_STORAGE_KEY, this.gameLevel.toString());
                } catch (e) {
                    // Failed to save to localStorage
                }
            }
        } catch (e) {
            // Failed to save level
        }
    }
    
    // Get level from chrome.storage.local (async)
    getLevelAsync() {
        return new Promise((resolve) => {
            try {
                if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                    chrome.storage.local.get([LEVEL_STORAGE_KEY], (result) => {
                        if (chrome.runtime.lastError) {
                            // Fallback to localStorage
                            const stored = this.getLevelFromLocalStorage();
                            resolve(stored);
                            return;
                        }
                        
                        if (result[LEVEL_STORAGE_KEY] !== undefined && result[LEVEL_STORAGE_KEY] !== null) {
                            const value = typeof result[LEVEL_STORAGE_KEY] === 'number' 
                                ? result[LEVEL_STORAGE_KEY] 
                                : parseInt(result[LEVEL_STORAGE_KEY], 10);
                            if (!isNaN(value)) {
                                resolve(value);
                                return;
                            }
                        }
                        
                        // Not found in chrome.storage, try localStorage
                        const stored = this.getLevelFromLocalStorage();
                        resolve(stored);
                    });
                } else {
                    // Fallback to localStorage if chrome.storage is not available
                    const stored = this.getLevelFromLocalStorage();
                    resolve(stored);
                }
            } catch (e) {
                resolve(null);
            }
        });
    }
    
    // Get level from localStorage (synchronous fallback)
    getLevelFromLocalStorage() {
        try {
            const stored = localStorage.getItem(LEVEL_STORAGE_KEY);
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
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new BlockerMazeGame();
    });
} else {
    new BlockerMazeGame();
}

