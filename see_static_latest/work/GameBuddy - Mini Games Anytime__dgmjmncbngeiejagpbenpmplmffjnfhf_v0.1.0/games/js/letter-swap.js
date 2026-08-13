/*
 * Letter Swap Game - Version 2
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
const GRID_SIZE = 6;
const INITIAL_TIME = 60;
const MATCH_SCORE = 3;
const MIN_MATCH_COUNT = 3; // Need at least 3 matching letters

// Cell class
class Cell {
    constructor(row, col, letter) {
        this.row = row;
        this.col = col;
        this.letter = letter;
        this.element = null;
        this.isEmpty = false;
    }
    
    // Create DOM element
    createElement(gridContainer, cellSize, adaptive) {
        this.element = document.createElement('div');
        this.element.className = 'cell';
        this.element.textContent = this.letter;
        this.element.style.width = `${cellSize}px`;
        this.element.style.height = `${cellSize}px`;
        this.element.style.fontSize = `${Math.floor(36 * adaptive)}px`;
        this.element.addEventListener('click', () => {
            if (this.onCellClick) {
                this.onCellClick(this);
            }
        });
        gridContainer.appendChild(this.element);
    }
    
    // Update display
    updateDisplay() {
        if (this.element) {
            if (this.isEmpty) {
                this.element.textContent = ' ';
            } else {
                this.element.textContent = this.letter;
            }
        }
    }
    
    // Set highlight
    setHighlight(highlight) {
        if (this.element) {
            if (highlight) {
                this.element.classList.add('highlighted');
            } else {
                this.element.classList.remove('highlighted');
            }
        }
    }
}

// Letter Swap Game class
class LetterSwapGame {
    constructor() {
        // Screen dimensions
        this.screenWidth = window.innerWidth - 80;
        this.screenHeight = window.innerHeight - Math.max(100, Math.floor(window.innerHeight * 0.14));
        this.gameDefaultWidth = 600;
        this.gameDefaultHeight = 490;
        
        // Calculate adaptive size
        const modSize = (this.screenWidth < 800 || this.screenHeight < 600) ? 10 : 0;
        this.adaptive = Math.min(
            this.screenWidth / (this.gameDefaultWidth + modSize),
            this.screenHeight / (this.gameDefaultHeight + modSize)
        ) || 0.8;
        
        // Cell size and gap based on adaptive scaling
        this.cellSize = Math.floor(56 * this.adaptive);
        this.cellGap = Math.floor(5 * this.adaptive);
        
        // Game state
        this.isGameActive = false;
        this.selectedCell = null;
        this.score = 0;
        this.timeLeft = INITIAL_TIME;
        this.gameInterval = null;
        
        // Grid data
        this.grid = [];
        this.letterCount = {};
        this.size = GRID_SIZE;
        
        // UI elements
        this.gridContainer = null;
        this.timerElement = null;
        this.scoreElement = null;
        this.gameOverElement = null;
        this.restartButton = null;
        this.messageElement = null;
        
        // Available letters
        this.letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        
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
        
        // Recalculate cell size and gap
        this.cellSize = Math.floor(56 * this.adaptive);
        this.cellGap = Math.floor(5 * this.adaptive);
        
        // Update UI with new sizes
        this.setupUI();
    }
    
    // Initialize game
    init() {
        // Check screen width
        //if (window.innerWidth < 768) {
            //return;
        //}
        
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize grid
        this.initializeGrid();
        
        // Start game
        this.startGame();
    }
    
    // Setup UI elements
    setupUI() {
        this.gridContainer = document.getElementById('grid');
        this.timerElement = document.getElementById('timer');
        this.scoreElement = document.getElementById('score');
        this.gameOverElement = document.getElementById('gameover');
        this.restartButton = document.getElementById('restart-button');
        this.messageElement = document.getElementById('msg');
        
        // Update gamebox size
        const gamebox = document.getElementById('gamebox');
        if (gamebox) {
            gamebox.style.width = `${Math.floor(this.gameDefaultWidth * this.adaptive)}px`;
        }
        
        // Update header styles
        const header = document.getElementById('header');
        if (header) {
            header.style.fontSize = `${Math.floor(24 * this.adaptive)}px`;
            header.style.padding = `${Math.floor(10 * this.adaptive)}px`;
        }
        
        // Update grid styles
        if (this.gridContainer) {
            this.gridContainer.style.gridTemplateColumns = `repeat(${GRID_SIZE}, ${this.cellSize}px)`;
            this.gridContainer.style.gap = `${this.cellGap}px`;
            this.gridContainer.style.margin = `${Math.floor(12 * this.adaptive)}px auto`;
            this.gridContainer.style.padding = '0';
            this.gridContainer.style.justifyContent = 'center';
        }
        
        // Update all cell styles
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.style.width = `${this.cellSize}px`;
            cell.style.height = `${this.cellSize}px`;
            cell.style.fontSize = `${Math.floor(36 * this.adaptive)}px`;
        });
        
        // Update game over overlay
        if (this.gameOverElement) {
            this.gameOverElement.style.display = 'none';
        }
        
        // Update game over message
        if (this.messageElement) {
            this.messageElement.style.fontSize = `${Math.floor(30 * this.adaptive)}px`;
            this.messageElement.style.marginBottom = `${Math.floor(30 * this.adaptive)}px`;
        }
        
        // Update restart button
        if (this.restartButton) {
            this.restartButton.style.padding = `${Math.floor(10 * this.adaptive)}px ${Math.floor(20 * this.adaptive)}px`;
            this.restartButton.style.fontSize = `${Math.floor(26 * this.adaptive)}px`;
        }
        
        // Set gamebox height to fit content
        this.setGameboxHeight();
    }
    
    // Set gamebox height to fit content
    setGameboxHeight() {
        const gamebox = document.getElementById('gamebox');
        if (!gamebox) return;
        
        const header = document.getElementById('header');
        const grid = document.getElementById('grid');
        
        if (header && grid) {
            // Get computed styles to get margin values
            const gridStyle = window.getComputedStyle(grid);
            const gridMarginBottom = parseFloat(gridStyle.marginBottom) || 0;
            
            // Use getBoundingClientRect to get actual rendered dimensions
            const headerRect = header.getBoundingClientRect();
            const gridRect = grid.getBoundingClientRect();
            
            // Calculate total height from top of header to bottom of grid (including margin-bottom)
            const totalHeight = gridRect.bottom - headerRect.top + gridMarginBottom;
            
            // Match classic-maze gamebox height
            const classicCellH = Math.floor(30 * this.adaptive);
            const classicPadH = Math.floor(15 * this.adaptive);
            const classicGameboxH = classicCellH * 14 + classicPadH * 2 + 2 + classicCellH;
            const actualGameboxH = Math.max(totalHeight, classicGameboxH);
            gamebox.style.height = `${actualGameboxH}px`;
            
            // If gamebox is taller than content, expand grid to fill and center cells
            if (actualGameboxH > totalHeight && this.gridContainer) {
                const headerH = headerRect.height;
                const gridAvailH = actualGameboxH - headerH;
                this.gridContainer.style.height = `${gridAvailH}px`;
                this.gridContainer.style.margin = '0 auto';
                this.gridContainer.style.alignContent = 'center';
            }
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        if (this.restartButton) {
            this.restartButton.addEventListener('click', () => {
                this.restart();
            });
        }
    }
    
    // Initialize grid
    initializeGrid() {
        // Clear existing grid
        this.clearGrid();
        
        // Reset state
        this.grid = [];
        this.letterCount = {};
        this.selectedCell = null;
        this.score = 0;
        this.timeLeft = INITIAL_TIME;
        
        // Generate letters for grid (matching original logic)
        const totalCells = this.size * this.size;
        const cutoff = Math.floor(totalCells / 3); // Number of letter types
        
        // Shuffle and select letters
        const shuffled = [...this.letters].sort(() => Math.random() - 0.5);
        const selectedLetters = shuffled.slice(0, cutoff);
        const remainingLetters = shuffled.slice(cutoff); // Letters not selected
        
        // Create letter list (each selected letter appears 3 times)
        const letterList = [];
        selectedLetters.forEach(letter => {
            for (let i = 0; i < 3; i++) {
                letterList.push(letter);
            }
        });
        
        // Shuffle the letter list
        const shuffledList = letterList.sort(() => Math.random() - 0.5);
        
        // Create grid cells
        for (let row = 0; row < this.size; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.size; col++) {
                const index = row * this.size + col;
                const letter = shuffledList[index];
                const cell = new Cell(row, col, letter);
                cell.onCellClick = (clickedCell) => this.handleCellClick(clickedCell);
                cell.createElement(this.gridContainer, this.cellSize, this.adaptive);
                this.grid[row][col] = cell;
            }
        }
        
        // Update gamebox height after grid is created
        this.setGameboxHeight();
        
        // Remove initial matches by replacing with selected letters (to maintain count)
        this.removeInitialMatches(selectedLetters);
        
        // Rebalance to ensure each letter appears exactly 3 times
        this.rebalanceLetters(selectedLetters);
        
        // Remove any matches that may have been created during rebalancing
        // But ensure we maintain letter counts by replacing with other selected letters
        this.removeInitialMatchesAndRebalance(selectedLetters);
        
        // Final verification: ensure each letter appears exactly 3 times
        this.ensureExactCounts(selectedLetters);
        
        // Final check: ensure no matches exist before starting game
        this.finalMatchRemoval(selectedLetters);
        
        // After final match removal, ensure exact counts again
        this.ensureExactCounts(selectedLetters);
        
        // Count letters after final balancing and verify
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = this.grid[row][col];
                if (!cell.isEmpty) {
                    const letter = cell.letter;
                    if (!this.letterCount[letter]) {
                        this.letterCount[letter] = 0;
                    }
                    this.letterCount[letter]++;
                }
            }
        }
        
        // Verify and fix: ensure each selected letter appears exactly 3 times
        selectedLetters.forEach(letter => {
            if (!this.letterCount[letter] || this.letterCount[letter] !== 3) {
                // Find cells that need to be changed
                const allCells = [];
                for (let row = 0; row < this.size; row++) {
                    for (let col = 0; col < this.size; col++) {
                        const cell = this.grid[row][col];
                        if (!cell.isEmpty) {
                            allCells.push(cell);
                        }
                    }
                }
                
                // Count current occurrences
                const currentCount = {};
                selectedLetters.forEach(l => {
                    currentCount[l] = 0;
                });
                allCells.forEach(cell => {
                    if (selectedLetters.includes(cell.letter)) {
                        currentCount[cell.letter]++;
                    }
                });
                
                // Fix: if letter has less than 3, find cells with excess letters to replace
                if (!this.letterCount[letter] || this.letterCount[letter] < 3) {
                    const needed = 3 - (this.letterCount[letter] || 0);
                    let fixed = 0;
                    
                    // Find letters with more than 3 occurrences
                    selectedLetters.forEach(otherLetter => {
                        if (fixed < needed && currentCount[otherLetter] > 3) {
                            const excess = currentCount[otherLetter] - 3;
                            let replaced = 0;
                            allCells.forEach(cell => {
                                if (fixed < needed && replaced < excess && cell.letter === otherLetter) {
                                    cell.letter = letter;
                                    cell.updateDisplay();
                                    currentCount[otherLetter]--;
                                    currentCount[letter] = (currentCount[letter] || 0) + 1;
                                    fixed++;
                                    replaced++;
                                }
                            });
                        }
                    });
                    
                    // If still not enough, replace non-selected letters
                    if (fixed < needed) {
                        allCells.forEach(cell => {
                            if (fixed < needed && !selectedLetters.includes(cell.letter)) {
                                cell.letter = letter;
                                cell.updateDisplay();
                                currentCount[letter] = (currentCount[letter] || 0) + 1;
                                fixed++;
                            }
                        });
                    }
                }
                
                // Update letterCount
                this.letterCount[letter] = currentCount[letter] || 0;
            }
        });
        
        // Remove any letters that don't have exactly 3 occurrences from letterCount
        Object.keys(this.letterCount).forEach(letter => {
            if (this.letterCount[letter] !== 3) {
                delete this.letterCount[letter];
            }
        });
        
        // Final verification: ensure all selected letters have exactly 3 occurrences
        selectedLetters.forEach(letter => {
            if (!this.letterCount[letter] || this.letterCount[letter] !== 3) {
                // Letter does not have exactly 3 occurrences
            }
        });
    }
    
    // Final match removal to ensure no matches at game start
    finalMatchRemoval(selectedLetters) {
        let hasMatches = true;
        let iterations = 0;
        const maxIterations = 100; // Prevent infinite loops
        
        while (hasMatches && iterations < maxIterations) {
            const matches = this.findMatches();
            if (matches.length === 0) {
                hasMatches = false;
                break;
            }
            
            // Count current letter occurrences
            const currentCount = {};
            selectedLetters.forEach(letter => {
                currentCount[letter] = 0;
            });
            
            for (let row = 0; row < this.size; row++) {
                for (let col = 0; col < this.size; col++) {
                    const cell = this.grid[row][col];
                    if (!cell.isEmpty && selectedLetters.includes(cell.letter)) {
                        currentCount[cell.letter]++;
                    }
                }
            }
            
            // Replace matched cells with letters that need more occurrences
            matches.forEach(match => {
                match.forEach(cell => {
                    // Find a letter that needs more occurrences (less than 3)
                    const neededLetters = selectedLetters.filter(letter => currentCount[letter] < 3);
                    if (neededLetters.length > 0) {
                        const randomLetter = neededLetters[Math.floor(Math.random() * neededLetters.length)];
                        cell.letter = randomLetter;
                        cell.updateDisplay();
                        currentCount[randomLetter]++;
                    } else {
                        // If all letters have 3+, use random selected letter
                        const randomLetter = selectedLetters[Math.floor(Math.random() * selectedLetters.length)];
                        cell.letter = randomLetter;
                        cell.updateDisplay();
                    }
                });
            });
            
            iterations++;
        }
        
        // If still has matches after max iterations, do a complete rebalance
        if (hasMatches) {
            // Final fallback: rebalance and remove matches one more time
            this.rebalanceLetters(selectedLetters);
            this.removeInitialMatchesAndRebalance(selectedLetters);
            this.ensureExactCounts(selectedLetters);
            
            // One final check
            const finalMatches = this.findMatches();
            if (finalMatches.length > 0) {
                // Last resort: replace all matched cells with random letters
                finalMatches.forEach(match => {
                    match.forEach(cell => {
                        const randomLetter = selectedLetters[Math.floor(Math.random() * selectedLetters.length)];
                        cell.letter = randomLetter;
                        cell.updateDisplay();
                    });
                });
            }
        }
    }
    
    // Clear grid
    clearGrid() {
        if (this.gridContainer) {
            // Clear content using removeChild instead of innerHTML
            while (this.gridContainer.firstChild) {
                this.gridContainer.removeChild(this.gridContainer.firstChild);
            }
        }
        this.grid = [];
    }
    
    // Remove initial matches (replace with letters from selectedLetters to maintain count)
    removeInitialMatches(selectedLetters) {
        if (selectedLetters.length === 0) return; // Safety check
        
        const matches = this.findMatches();
        if (matches.length > 0) {
            matches.forEach(match => {
                match.forEach(cell => {
                    // Replace with random letter from selected letters (to maintain total count)
                    const randomLetter = selectedLetters[Math.floor(Math.random() * selectedLetters.length)];
                    cell.letter = randomLetter;
                    cell.updateDisplay();
                });
            });
            // Recursively check again until no matches
            this.removeInitialMatches(selectedLetters);
        }
    }
    
    // Rebalance letters to ensure each selected letter appears exactly 3 times
    rebalanceLetters(selectedLetters) {
        // Collect all non-empty cells
        const allCells = [];
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = this.grid[row][col];
                if (!cell.isEmpty) {
                    allCells.push(cell);
                }
            }
        }
        
        // Create target letter list: each selected letter appears exactly 3 times
        const targetLetterList = [];
        selectedLetters.forEach(letter => {
            for (let i = 0; i < 3; i++) {
                targetLetterList.push(letter);
            }
        });
        
        // Shuffle target list
        const shuffledTarget = targetLetterList.sort(() => Math.random() - 0.5);
        
        // Assign letters to cells (simple assignment, matches will be removed later)
        allCells.forEach((cell, index) => {
            if (index < shuffledTarget.length) {
                cell.letter = shuffledTarget[index];
                cell.updateDisplay();
            }
        });
    }
    
    // Remove matches and rebalance to maintain exact counts
    removeInitialMatchesAndRebalance(selectedLetters) {
        let hasMatches = true;
        let iterations = 0;
        const maxIterations = 50; // Prevent infinite loops
        
        while (hasMatches && iterations < maxIterations) {
            const matches = this.findMatches();
            if (matches.length === 0) {
                hasMatches = false;
                break;
            }
            
            // Collect all cells that need to be replaced
            const cellsToReplace = [];
            matches.forEach(match => {
                match.forEach(cell => {
                    cellsToReplace.push(cell);
                });
            });
            
            // Count current letter occurrences
            const currentCount = {};
            selectedLetters.forEach(letter => {
                currentCount[letter] = 0;
            });
            
            for (let row = 0; row < this.size; row++) {
                for (let col = 0; col < this.size; col++) {
                    const cell = this.grid[row][col];
                    if (!cell.isEmpty && selectedLetters.includes(cell.letter)) {
                        currentCount[cell.letter]++;
                    }
                }
            }
            
            // Replace matched cells with letters that need more occurrences
            cellsToReplace.forEach(cell => {
                // Find a letter that needs more occurrences (less than 3)
                const neededLetters = selectedLetters.filter(letter => currentCount[letter] < 3);
                if (neededLetters.length > 0) {
                    const randomLetter = neededLetters[Math.floor(Math.random() * neededLetters.length)];
                    cell.letter = randomLetter;
                    cell.updateDisplay();
                    currentCount[randomLetter]++;
                } else {
                    // If all letters have 3+, use random selected letter
                    const randomLetter = selectedLetters[Math.floor(Math.random() * selectedLetters.length)];
                    cell.letter = randomLetter;
                    cell.updateDisplay();
                }
            });
            
            iterations++;
        }
    }
    
    // Ensure each selected letter appears exactly 3 times
    ensureExactCounts(selectedLetters) {
        if (selectedLetters.length === 0) return; // Safety check
        
        // Count current occurrences
        const currentCount = {};
        selectedLetters.forEach(letter => {
            currentCount[letter] = 0;
        });
        
        const allCells = [];
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = this.grid[row][col];
                if (!cell.isEmpty) {
                    allCells.push(cell);
                    if (selectedLetters.includes(cell.letter)) {
                        currentCount[cell.letter]++;
                    }
                }
            }
        }
        
        // Calculate how many cells we need to work with
        const totalCells = allCells.length;
        const expectedTotal = selectedLetters.length * 3;
        
        // If we have more cells than expected, we need to remove some
        // If we have fewer cells than expected, we have a problem (shouldn't happen)
        if (totalCells < expectedTotal) {
            // Only fewer cells available than expected
        }
        
        // Step 1: Collect cells that need to be changed
        const excessCells = []; // Cells with letters that appear more than 3 times
        const deficitLetters = []; // Letters that appear less than 3 times
        
        selectedLetters.forEach(letter => {
            if (currentCount[letter] > 3) {
                // Find excess cells with this letter
                let excess = currentCount[letter] - 3;
                allCells.forEach(cell => {
                    if (excess > 0 && cell.letter === letter) {
                        excessCells.push(cell);
                        excess--;
                    }
                });
            } else if (currentCount[letter] < 3) {
                const needed = 3 - currentCount[letter];
                for (let i = 0; i < needed; i++) {
                    deficitLetters.push(letter);
                }
            }
        });
        
        // Also collect cells with non-selected letters
        allCells.forEach(cell => {
            if (!selectedLetters.includes(cell.letter)) {
                excessCells.push(cell);
            }
        });
        
        // Step 2: Replace excess cells with deficit letters
        let deficitIndex = 0;
        excessCells.forEach(cell => {
            if (deficitIndex < deficitLetters.length) {
                const targetLetter = deficitLetters[deficitIndex];
                cell.letter = targetLetter;
                cell.updateDisplay();
                currentCount[targetLetter] = (currentCount[targetLetter] || 0) + 1;
                // Update count for the old letter if it was a selected letter
                if (selectedLetters.includes(cell.letter)) {
                    // This shouldn't happen since we're replacing, but just in case
                }
                deficitIndex++;
            }
        });
        
        // Step 3: Final verification and adjustment
        const finalCount = {};
        selectedLetters.forEach(letter => {
            finalCount[letter] = 0;
        });
        
        allCells.forEach(cell => {
            if (selectedLetters.includes(cell.letter)) {
                finalCount[cell.letter]++;
            }
        });
        
        // Step 4: Fix any remaining imbalances
        selectedLetters.forEach(letter => {
            if (finalCount[letter] > 3) {
                // Find letters that need more
                const neededLetters = selectedLetters.filter(l => finalCount[l] < 3);
                if (neededLetters.length > 0) {
                    let excess = finalCount[letter] - 3;
                    allCells.forEach(cell => {
                        if (excess > 0 && cell.letter === letter) {
                            const targetLetter = neededLetters.find(l => finalCount[l] < 3);
                            if (targetLetter) {
                                cell.letter = targetLetter;
                                cell.updateDisplay();
                                finalCount[letter]--;
                                finalCount[targetLetter]++;
                                excess--;
                            }
                        }
                    });
                }
            } else if (finalCount[letter] < 3) {
                // Find letters that have excess
                const excessLetters = selectedLetters.filter(l => finalCount[l] > 3);
                if (excessLetters.length > 0) {
                    const needed = 3 - finalCount[letter];
                    let fixed = 0;
                    excessLetters.forEach(excessLetter => {
                        if (fixed < needed && finalCount[excessLetter] > 3) {
                            let excess = finalCount[excessLetter] - 3;
                            allCells.forEach(cell => {
                                if (fixed < needed && excess > 0 && cell.letter === excessLetter) {
                                    cell.letter = letter;
                                    cell.updateDisplay();
                                    finalCount[excessLetter]--;
                                    finalCount[letter]++;
                                    excess--;
                                    fixed++;
                                }
                            });
                        }
                    });
                }
            }
        });
    }
    
    // Check if assigning a letter to a cell would create a match
    wouldCreateMatch(cell, letter) {
        const row = cell.row;
        const col = cell.col;
        let matchCount = 0;
        
        // Check left neighbor
        if (col > 0) {
            const leftCell = this.grid[row][col - 1];
            if (!leftCell.isEmpty && leftCell.letter === letter) {
                matchCount++;
            }
        }
        
        // Check right neighbor
        if (col < this.size - 1) {
            const rightCell = this.grid[row][col + 1];
            if (!rightCell.isEmpty && rightCell.letter === letter) {
                matchCount++;
            }
        }
        
        // Check top neighbor
        if (row > 0) {
            const topCell = this.grid[row - 1][col];
            if (!topCell.isEmpty && topCell.letter === letter) {
                matchCount++;
            }
        }
        
        // Check bottom neighbor
        if (row < this.size - 1) {
            const bottomCell = this.grid[row + 1][col];
            if (!bottomCell.isEmpty && bottomCell.letter === letter) {
                matchCount++;
            }
        }
        
        // If 2 or more neighbors match, it would create a match (3+ total)
        return matchCount >= 2;
    }
    
    // Handle cell click
    handleCellClick(cell) {
        this.hideHowToHint();
        if (!this.isGameActive) return;
        
        if (!this.selectedCell) {
            // Select first cell
            this.selectedCell = cell;
            cell.setHighlight(true);
        } else if (this.selectedCell === cell) {
            // Deselect if same cell clicked
            cell.setHighlight(false);
            this.selectedCell = null;
        } else {
            // Swap letters
            this.swapCells(this.selectedCell, cell);
            this.selectedCell.setHighlight(false);
            this.selectedCell = null;
            
            // Check for matches
            this.checkAndRemoveMatches();
        }
    }
    
    // Swap two cells
    swapCells(cell1, cell2) {
        // Swap letters
        const tempLetter = cell1.letter;
        cell1.letter = cell2.letter;
        cell2.letter = tempLetter;
        
        // Swap isEmpty status
        const tempIsEmpty = cell1.isEmpty;
        cell1.isEmpty = cell2.isEmpty;
        cell2.isEmpty = tempIsEmpty;
        
        // Update displays
        cell1.updateDisplay();
        cell2.updateDisplay();
    }
    
    // Find all matches in the grid (matching original logic: check adjacent cells)
    findMatches() {
        const matches = [];
        const processed = new Set();
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = this.grid[row][col];
                if (cell.isEmpty || processed.has(cell)) continue;
                
                const match = this.findMatchFromCell(row, col);
                if (match.length >= MIN_MATCH_COUNT) {
                    matches.push(match);
                    match.forEach(c => processed.add(c));
                }
            }
        }
        
        return matches;
    }
    
    // Find match starting from a cell (matching original logic: check 4 adjacent cells)
    findMatchFromCell(startRow, startCol) {
        const startCell = this.grid[startRow][startCol];
        if (startCell.isEmpty) return [];
        
        const letter = startCell.letter;
        const match = [startCell];
        const index = startRow * this.size + startCol;
        
        // Check 4 adjacent cells (matching original logic)
        const adjacent = [];
        
        // Left
        if (index % this.size !== 0) {
            const leftCell = this.grid[startRow][startCol - 1];
            if (!leftCell.isEmpty && leftCell.letter === letter) {
                adjacent.push(leftCell);
            }
        }
        
        // Right
        if (index % this.size !== this.size - 1) {
            const rightCell = this.grid[startRow][startCol + 1];
            if (!rightCell.isEmpty && rightCell.letter === letter) {
                adjacent.push(rightCell);
            }
        }
        
        // Top
        if (startRow >= 1) {
            const topCell = this.grid[startRow - 1][startCol];
            if (!topCell.isEmpty && topCell.letter === letter) {
                adjacent.push(topCell);
            }
        }
        
        // Bottom
        if (startRow < this.size - 1) {
            const bottomCell = this.grid[startRow + 1][startCol];
            if (!bottomCell.isEmpty && bottomCell.letter === letter) {
                adjacent.push(bottomCell);
            }
        }
        
        // If we have at least 2 adjacent matches (total 3 including start), it's a match
        if (adjacent.length >= 2) {
            match.push(...adjacent);
        }
        
        return match.length >= MIN_MATCH_COUNT ? match : [];
    }
    
    // Check and remove matches
    checkAndRemoveMatches() {
        const matches = this.findMatches();
        
        if (matches.length > 0) {
            matches.forEach(match => {
                match.forEach(cell => {
                    // Remove letter from count
                    if (this.letterCount[cell.letter]) {
                        this.letterCount[cell.letter]--;
                        if (this.letterCount[cell.letter] <= 0) {
                            delete this.letterCount[cell.letter];
                        }
                    }
                    
                    // Mark cell as empty
                    cell.isEmpty = true;
                    cell.letter = ' ';
                    cell.updateDisplay();
                });
                
                // Update score
                this.score += MATCH_SCORE;
            });
            
            this.updateScore();
            
            // Check win condition
            if (Object.keys(this.letterCount).length === 0) {
                this.endGame(true);
                return;
            }
        }
    }
    
    // Update score display
    updateScore() {
        if (this.scoreElement) {
            this.scoreElement.textContent = this.score;
        }
    }
    
    // Update timer display
    updateTimer() {
        if (this.timerElement) {
            this.timerElement.textContent = this.timeLeft;
        }
    }
    
    // Start game
    startGame() {
        this.isGameActive = true;
        this.updateScore();
        this.updateTimer();
        this.startTimer();
        
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
        // Header: height 40px (CSS) + padding 10*ad top/bottom
        const headerCenter = Math.floor(20 + 10 * ad);
        hint.style.cssText = `
            position: absolute;
            top: ${headerCenter}px;
            left: 50%;
            transform: translateX(-50%) translateY(-50%);
            background: linear-gradient(135deg, rgba(15, 20, 35, 0.85), rgba(20, 28, 50, 0.8));
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-top-color: rgba(255, 255, 255, 0.2);
            border-radius: ${Math.floor(22 * ad)}px;
            padding: ${Math.floor(7 * ad)}px ${Math.floor(18 * ad)}px;
            display: flex;
            align-items: center;
            gap: ${Math.floor(8 * ad)}px;
            z-index: 100;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.06);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        `;
        
        const text = document.createElement('span');
        text.textContent = 'Swap Letters \u2022 Match 3+ in a Row';
        text.style.cssText = `
            color: rgba(255, 255, 255, 0.92);
            font-size: ${Math.floor(12 * ad)}px;
            font-weight: 500;
            font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
            white-space: nowrap;
            letter-spacing: 0.3px;
            line-height: 1;
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
    
    // Start timer
    startTimer() {
        this.gameInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                this.endGame(false);
            }
        }, 1000);
    }
    
    // End game
    endGame(won) {
        this.isGameActive = false;
        
        // Clear timer
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        
        // Show game over overlay
        if (this.gameOverElement) {
            this.gameOverElement.style.display = 'flex';
        }
        
        // Set message
        if (this.messageElement) {
            if (won) {
                this.messageElement.textContent = 'All Found, You win :)';
            } else {
                this.messageElement.textContent = 'Time Out, You loss :(';
            }
        }
    }
    
    // Restart game
    restart() {
        // Update adaptive size based on current window size
        this.updateAdaptiveSize();
        
        // Hide game over overlay
        if (this.gameOverElement) {
            this.gameOverElement.style.display = 'none';
        }
        
        // Clear timer
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        
        // Reset selected cell
        if (this.selectedCell) {
            this.selectedCell.setHighlight(false);
            this.selectedCell = null;
        }
        
        // Reinitialize grid
        this.initializeGrid();
        
        // Start game
        this.startGame();
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new LetterSwapGame();
    });
} else {
    new LetterSwapGame();
}

