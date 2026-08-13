/**
 * How-To-Play - Shared help overlay for all games
 * Injected into every game iframe. Shows a ? icon that opens a tutorial popup.
 */
(function() {
    'use strict';

    // Tutorial text for each game (keyed by folder name)
    const TUTORIALS = {
        'level-maze':
            'Use arrow keys to navigate through increasingly difficult mazes. Complete each level before the timer expires.',
        'blocker-maze':
            'Use arrow keys to navigate the maze with randomly distributed obstacles. Clear each level before time runs out.',
        'barcode-maze':
            'Use arrow keys to guide the red square through the maze to the green exit before the timer reaches zero.',
        'drag-maze':
            'Drag to move the red dot through the maze. Touching the borders ends the game. Reach the yellow exit to win.',
        'drag-maze-pro':
            'Drag to move the red dot through the maze with moving paddles. Find the yellow exit to win.',
        'drag-maze-blocker':
            'Drag to move the ball through the maze without touching the blockers. Reach the exit to complete the level.',
        'drag-maze-door':
            'Drag to move the ball through the maze without touching the doors that open and close. Find the path to the exit.',
        'classic-snake':
            'Use arrow keys to control the snake. Eat the red apple to grow and score points. Avoid hitting the borders and your own tail.',
        'apple-snake':
            'Use arrow keys to guide the snake toward the apples. Grow longer with each apple. Don\'t crash into borders or yourself.',
        'puppy-snake':
            'Use arrow keys to guide the snake with a puppy head. Catch the ball to grow longer. Avoid hitting the borders and your own trail.',
        'number-snake':
            'Use arrow keys to move the snake. Eat numbers in ascending order (1, 2, 3...). A wrong number or collision ends the game.',
        'snake-vs-block':
            'Use arrow keys to move the snake. Collect food to grow longer while avoiding collisions with random blocks.',
        'color-snake':
            'Use arrow keys to control the snake. Eat items that match your snake\'s current color. Eating the wrong color ends the game.',
        '2048-game':
            'Use arrow keys to slide all tiles. Matching numbers merge and double. Keep merging to reach the 2048 tile!',
        'letter-swap':
            'Click two letters to swap them. Three identical letters in adjacent cells will be eliminated.',
        'memory-card':
            'Click cards to flip them over. If the two revealed images are identical, their cards will vanish from the board.',
        'mine-finder':
            'Left-click to reveal a cell. Right-click to flag a suspected mine. Numbers show adjacent mine count. Clear all safe cells to win.',
        'word-search':
            'Find the hidden words on the board. Click the first letters to select them — matched letters are highlighted. Find all words to win.',
        'word-scramble':
            'Unscramble the jumbled letters to form the correct word. Type your answer and press Enter before time runs out.'
    };

    // Detect which game is currently loaded
    function detectGame() {
        // Try CSS link first
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for (var i = 0; i < links.length; i++) {
            var href = links[i].getAttribute('href') || '';
            var m = href.match(/css\/([a-z0-9-]+)\.css/);
            if (m && m[1]) return m[1];
        }
        // Try script src
        var scripts = document.querySelectorAll('script[src]');
        for (var j = 0; j < scripts.length; j++) {
            var src = scripts[j].getAttribute('src') || '';
            var m2 = src.match(/js\/([a-z0-9-]+)\.js/);
            if (m2 && m2[1] !== 'path-replacement' && m2[1] !== 'storage-proxy' && m2[1] !== 'how-to-play') {
                return m2[1];
            }
        }
        return null;
    }

    function init() {
        var gameName = detectGame();
        if (!gameName || !TUTORIALS[gameName]) return;

        var tutorialText = TUTORIALS[gameName];

        // Wait for gamebox to exist
        var gamebox = document.getElementById('gamebox');
        if (!gamebox) return;

        // Ensure gamebox has position for absolute children
        var pos = window.getComputedStyle(gamebox).position;
        if (pos === 'static') {
            gamebox.style.position = 'relative';
        }

        // ---- Create the ? icon button ----
        var btn = document.createElement('div');
        btn.id = 'htp-btn';
        btn.setAttribute('title', 'How to Play');
        btn.style.cssText = [
            'position: absolute',
            'bottom: 8px',
            'right: 8px',
            'width: 24px',
            'height: 24px',
            'border-radius: 50%',
            'background: rgba(255,255,255,0.18)',
            'border: 1px solid rgba(255,255,255,0.28)',
            'display: flex',
            'align-items: center',
            'justify-content: center',
            'cursor: pointer',
            'z-index: 50',
            'transition: background 0.2s ease, border-color 0.2s ease',
            'user-select: none',
            'flex-shrink: 0'
        ].join(';');

        var icon = document.createElement('span');
        icon.textContent = '?';
        icon.style.cssText = [
            'color: rgba(255,255,255,0.75)',
            'font-size: 14px',
            'font-weight: 700',
            'font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
            'line-height: 1',
            'pointer-events: none'
        ].join(';');
        btn.appendChild(icon);

        // Hover effect
        btn.addEventListener('mouseenter', function() {
            btn.style.background = 'rgba(255,255,255,0.28)';
            btn.style.borderColor = 'rgba(255,255,255,0.40)';
            icon.style.color = 'rgba(255,255,255,0.95)';
        });
        btn.addEventListener('mouseleave', function() {
            btn.style.background = 'rgba(255,255,255,0.18)';
            btn.style.borderColor = 'rgba(255,255,255,0.28)';
            icon.style.color = 'rgba(255,255,255,0.75)';
        });

        gamebox.appendChild(btn);

        // ---- Create the popup overlay (hidden) ----
        var overlay = document.createElement('div');
        overlay.id = 'htp-overlay';
        overlay.style.cssText = [
            'display: none',
            'position: absolute',
            'top: 0',
            'left: 0',
            'width: 100%',
            'height: 100%',
            'background: rgba(10, 15, 20, 0.85)',
            'backdrop-filter: blur(6px)',
            '-webkit-backdrop-filter: blur(6px)',
            'z-index: 999',
            'cursor: pointer'
        ].join(';');

        var card = document.createElement('div');
        card.style.cssText = [
            'position: absolute',
            'top: 50%',
            'left: 50%',
            'transform: translate(-50%, -50%)',
            'background: linear-gradient(135deg, rgba(25, 32, 45, 0.97), rgba(18, 24, 38, 0.97))',
            'border: 1px solid rgba(255,255,255,0.10)',
            'border-radius: 14px',
            'padding: 28px 34px',
            'max-width: 380px',
            'width: 80%',
            'text-align: center',
            'box-shadow: 0 8px 32px rgba(0,0,0,0.4)',
            'cursor: default'
        ].join(';');

        // Title
        var title = document.createElement('div');
        title.textContent = 'How to Play';
        title.style.cssText = [
            'color: #e2e8f0',
            'font-size: 18px',
            'font-weight: 700',
            'font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
            'margin-bottom: 14px',
            'letter-spacing: 0.3px'
        ].join(';');

        // Tutorial text
        var body = document.createElement('div');
        body.textContent = tutorialText;
        body.style.cssText = [
            'color: rgba(255,255,255,0.75)',
            'font-size: 14px',
            'font-weight: 400',
            'font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
            'line-height: 1.6',
            'margin-bottom: 20px'
        ].join(';');

        // Got it button
        var closeBtn = document.createElement('button');
        closeBtn.textContent = 'Got it';
        closeBtn.style.cssText = [
            'padding: 8px 28px',
            'font-size: 14px',
            'cursor: pointer',
            'background: linear-gradient(135deg, #3b82f6, #2563eb)',
            'color: #fff',
            'border: none',
            'border-radius: 8px',
            'font-weight: 600',
            'font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
            'transition: all 0.2s ease',
            'box-shadow: 0 2px 8px rgba(59,130,246,0.3)'
        ].join(';');
        closeBtn.addEventListener('mouseenter', function() {
            closeBtn.style.background = 'linear-gradient(135deg, #60a5fa, #3b82f6)';
            closeBtn.style.transform = 'translateY(-1px)';
        });
        closeBtn.addEventListener('mouseleave', function() {
            closeBtn.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
            closeBtn.style.transform = 'translateY(0)';
        });

        card.appendChild(title);
        card.appendChild(body);
        card.appendChild(closeBtn);
        overlay.appendChild(card);
        gamebox.appendChild(overlay);

        // ---- Event handling ----
        function showPopup() {
            overlay.style.display = 'block';
        }
        function hidePopup() {
            overlay.style.display = 'none';
        }

        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            showPopup();
        });

        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            hidePopup();
        });

        // Click on overlay backdrop closes
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                hidePopup();
            }
        });

        // Escape key closes
        document.addEventListener('keydown', function(e) {
            if ((e.key === 'Escape' || e.keyCode === 27) && overlay.style.display !== 'none') {
                hidePopup();
            }
        });

        // Stop card clicks from reaching overlay
        card.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // Small delay to ensure game JS has created the gamebox
        setTimeout(init, 100);
    }
})();
