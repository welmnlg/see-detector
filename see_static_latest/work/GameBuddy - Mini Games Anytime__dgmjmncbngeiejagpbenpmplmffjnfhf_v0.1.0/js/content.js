(() => {
  // Top frame only + singleton guard
  if (window.top !== window) return;
  if (globalThis.__GAMES_INJECTED__) return;
  globalThis.__GAMES_INJECTED__ = true;

  if (document.getElementById('games-root-container')) return;

  // Character animation variables (from character-cheerup)
  var valid_gmbdids;
  var main_gmbdid;
  var main_gmbdidx;
  var animid;
  var animidx;
  var sub_gmbdids;
  var main_gmbdsize = 300;
  var sub_gmbdsize = 100;
  var sub_gmbddist = 260;
  var _dancerRevealTimer = null;
  var _dancerRevealed = false;
  
  // Debounced reveal: only show container after positions are stable (initial load only)
  function scheduleDancerReveal() {
    if (_dancerRevealed) return; // Already visible, no need to toggle
    if (_dancerRevealTimer) clearTimeout(_dancerRevealTimer);
    _dancerRevealTimer = setTimeout(() => {
      const container = document.getElementById('gmbdCircleContainer');
      if (container) {
        container.style.visibility = 'visible';
        _dancerRevealed = true;
      }
      _dancerRevealTimer = null;
    }, 300);
  }
  
  // Gap between dancers and gamebox edge
  var dancerGap = 15;
  // Gap between dancers and viewport top/bottom border
  var dancerEdgeGap = 10;
  
  // Get dancer size clamped to fit within viewport given the container height
  function getFittedDancerSize(containerHeight) {
    const base = getDancerSize();
    // Container is vertically centered: need (containerHeight + 2*(dancer + dancerGap + dancerEdgeGap)) <= viewportHeight
    const maxSize = Math.floor((window.innerHeight - containerHeight - 2 * (dancerGap + dancerEdgeGap)) / 2);
    return Math.max(30, Math.min(base, maxSize));
  }
  
  // Responsive dancer size based on screen height
  function getDancerSize() {
    const vh = window.innerHeight;
    // Scale dancer size proportionally: 100px at 900px+ screens, down to 60px at 600px screens
    const size = Math.round(Math.min(100, Math.max(60, (vh - 600) * (40 / 300) + 60)));
    return size;
  }
  
  // Store current character IDs for game state monitoring
  var current_selected_gmbdids = null;
  var current_target_gmbdid = null;
  var gameStateCheckInterval = null;
  var lastGameOverState = false;
  var forceStaticImages = false; // Flag to force static images (e.g., when switching games)
  var saved_animid = null; // Store animid when game restarts to ensure it's used when game ends
  var initial_animid = null; // Store animid when game interface is opened (for first game end)
  // Heart animation variables
  var heartAnimationLeftInterval = null;
  var heartAnimationRightInterval = null;
  var heartAnimationLeftContainer = null;
  var heartAnimationRightContainer = null;
  var heartAnimationParentContainer = null;
  var heartImages = ['heart-1.png', 'heart-2.png', 'heart-3.png', 'heart-4.png', 'heart-5.png', 'heart-6.png', 'heart-7.png'];
  var heartImagesPreloaded = false; // Flag to track if heart images are preloaded
  // Music variables
  var backgroundMusic = null; // Audio object for background music
  var musicLoaded = false; // Flag to track if music is loaded
  var musicShouldPlay = false; // Flag to track if music should be playing (game over state)
  var musicEnabled = true; // Flag to track if music is enabled (user control, default: true)
  var currentMusicFile = null; // Current music file being played
  
  // List of music files in sound folder
  var musicFiles = Array.from({ length: 6 }, (_, i) => `${i + 1}.mp3`);
  
  // Get a random music file
  function getRandomMusicFile() {
    const randomIndex = Math.floor(Math.random() * musicFiles.length);
    console.log('randomIndex:' + randomIndex);
    return musicFiles[randomIndex];
  }
  
  // Preload all heart images
  function preloadHeartImages() {
    if (heartImagesPreloaded) {
      return; // Already preloaded
    }
    
    heartImages.forEach((heartImage) => {
      const img = new Image();
      img.src = chrome.runtime.getURL('images/' + heartImage);
      // Optional: add error handling
      img.onerror = function() {
        // Failed to preload heart image
      };
    });
    
    heartImagesPreloaded = true;
  }
  
  // Initialize background music
  function initBackgroundMusic() {
    // If music is already initialized and loaded, and we want to keep the same music, return
    // Otherwise, select a new random music file
    if (backgroundMusic && musicLoaded && currentMusicFile) {
      return Promise.resolve(); // Already initialized with a music file
    }
    
    // Select a random music file (or reuse current if already playing)
    if (!currentMusicFile) {
      currentMusicFile = getRandomMusicFile();
    }
    
    return new Promise(function(resolve, reject) {
      var settled = false; // Prevent double resolve/reject
      
      try {
        // Reset music state if switching to a new file
        if (backgroundMusic) {
          backgroundMusic.pause();
          backgroundMusic = null;
          musicLoaded = false;
        }
        
        const musicUrl = chrome.runtime.getURL('sound/' + currentMusicFile);
        var audio = new Audio(musicUrl);
        backgroundMusic = audio;
        audio.loop = true; // Enable looping
        audio.volume = 1.0; // Set volume to maximum
        
        // Preload the music
        audio.preload = 'auto';
        
        // Clean up listeners from this audio instance
        function cleanup() {
          audio.removeEventListener('loadeddata', onLoaded);
          audio.removeEventListener('canplaythrough', onLoaded);
          audio.removeEventListener('error', onError);
        }
        
        // Handle successful load
        function onLoaded() {
          if (settled) return;
          settled = true;
          musicLoaded = true;
          cleanup();
          resolve();
        }
        
        // Handle load error
        function onError(e) {
          if (settled) return;
          settled = true;
          musicLoaded = false;
          cleanup();
          backgroundMusic = null;
          reject(new Error('Failed to load music file'));
        }
        
        // Try to load the music
        audio.addEventListener('loadeddata', onLoaded);
        audio.addEventListener('canplaythrough', onLoaded);
        audio.addEventListener('error', onError);
        
        // Start loading
        audio.load();
        
        // Timeout after 5 seconds if not loaded
        setTimeout(function() {
          if (!settled) {
            onError(new Error('Music load timeout'));
          }
        }, 5000);
      } catch (e) {
        // Failed to create audio object
        if (!settled) {
          settled = true;
          musicLoaded = false;
          backgroundMusic = null;
          reject(e);
        }
      }
    });
  }
  
  // Start playing background music
  function startBackgroundMusic() {
    musicShouldPlay = true; // Set flag that music should be playing (even if sound is disabled)
    
    // Always initialize music, even if sound is disabled (so it's ready when user enables sound)
    // If music is already loaded and ready
    if (backgroundMusic && musicLoaded) {
      // Only play if music is enabled
      if (musicEnabled) {
        try {
          backgroundMusic.currentTime = 0;
          const playPromise = backgroundMusic.play();
          if (playPromise !== undefined) {
            playPromise.catch(function(error) {
              // Auto-play was prevented, will retry on user interaction
              // musicShouldPlay flag is already set, so it will play on next interaction
            });
          } else {
            // Play succeeded
            return;
          }
        } catch (e) {
          // Failed to play, try to reinitialize
        }
      } else {
        // Music is loaded but sound is disabled, just return (music is ready for when user enables sound)
        return;
      }
    }
    
    // Initialize and wait for load, then play (only if sound is enabled)
    initBackgroundMusic().then(function() {
      if (backgroundMusic && musicLoaded && musicShouldPlay && musicEnabled) {
        try {
          backgroundMusic.currentTime = 0;
          const playPromise = backgroundMusic.play();
          if (playPromise !== undefined) {
            playPromise.catch(function(error) {
              // Auto-play was prevented, will retry on user interaction
            });
          }
        } catch (e) {
          // Failed to play music
        }
      }
    }).catch(function(error) {
      // Failed to initialize music, retry once with a different file
      if (musicShouldPlay) {
        currentMusicFile = getRandomMusicFile();
        backgroundMusic = null;
        musicLoaded = false;
        initBackgroundMusic().then(function() {
          if (backgroundMusic && musicLoaded && musicShouldPlay && musicEnabled) {
            try {
              backgroundMusic.currentTime = 0;
              var playPromise = backgroundMusic.play();
              if (playPromise !== undefined) {
                playPromise.catch(function(error) {});
              }
            } catch (e) {}
          }
        }).catch(function() {});
      }
    });
  }
  
  // Stop playing background music
  function stopBackgroundMusic() {
    musicShouldPlay = false; // Clear flag that music should be playing
    
    if (backgroundMusic) {
      try {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0; // Reset to beginning
      } catch (e) {
        // Failed to stop music
      }
    }
    
    // Clear current music file so a new random one will be selected next time
    currentMusicFile = null;
  }
  
  // Try to play music on user interaction (for autoplay policy)
  function tryPlayMusicOnInteraction() {
    // Only play if music is enabled
    if (!musicEnabled) {
      return;
    }
    
    if (musicShouldPlay && backgroundMusic && musicLoaded) {
      try {
        if (backgroundMusic.paused) {
          const playPromise = backgroundMusic.play();
          if (playPromise !== undefined) {
            playPromise.catch(function(error) {
              // Still prevented, will try again on next interaction
            });
          }
        }
      } catch (e) {
        // Failed to play
      }
    }
  }
  var formations = {
    'df0': [[-0.866, 0.5], [0.866, 0.5], [-0.866, -0.5], [0.866, -0.5], [0, 1], [0, -1],
      [-1, 0], [1, 0], [-0.5, 0.866], [0.5, 0.866], [-0.5, -0.866], [0.5, -0.866]],
    'df1': [[-1, 0], [1, 0], [-0.5, 0.866], [0.5, 0.866], [-0.5, -0.866], [0.5, -0.866],
      [-0.75, 0.433], [0.75, 0.433], [-0.75, -0.433], [0.75, -0.433], [0, -0.866], [0, 0.866]],
    'df2': [[-0.8, -0.2], [0.8, -0.2], [-0.2, 0.9], [0.2, 0.9], [-1.1, -0.4], [1.1, -0.4],
      [-0.6, 0.9], [0.6, 0.9], [-1.4, -0.6], [1.4, -0.6], [-1, 0.9], [1, 0.9]],
    'df3': [[-0.2, 0.9], [0.2, 0.9], [-0.6, 0.9], [0.6, 0.9], [-1, 0.9], [1, 0.9],
      [-0.2, -0.9], [0.2, -0.9], [-0.6, -0.9], [0.6, -0.9], [-1, -0.9], [1, -0.9]],
    'df4': [[-0.8, -0.3], [0.8, -0.3], [-0.8, 0.3], [0.8, 0.3], [-1.1, -0.5], [1.1, -0.5],
      [-1.1, 0.5], [1.1, 0.5], [-1.4, -0.7], [1.4, -0.7], [-1.4, 0.7], [1.4, 0.7]],
    'df5': [[1.2, -0.3], [-1.2, -0.3], [1.2, 0.3], [-1.2, 0.3], [0.9, -0.5], [-0.9, -0.5],
      [0.9, 0.5], [-0.9, 0.5], [0.6, -0.7], [-0.6, -0.7], [0.6, 0.7], [-0.6, 0.7]],
    'df6': [[0.9, 0.14], [-0.9, 0.14], [0.9, 0.6], [-0.9, 0.6], [0.9, -0.33], [-0.9, -0.33],
      [0.56, 0.8], [-0.56, 0.8], [0.9, -0.8], [-0.9, -0.8], [0.2, 0.9], [-0.2, 0.9]],
    'df7': [[-1.05, 0], [1.05, 0], [-0.8, 0.5], [0.8, 0.5], [-0.3, 0.9], [0.3, 0.9],
      [-1.1, -0.5], [1.1, -0.5], [-0.7, -1.05], [0.7, -1.05], [-0.3, -0.8], [0.3, -0.8]],
    'df8': [[-1.05, 0], [1.05, 0], [-0.8, -0.5], [0.8, -0.5], [-0.3, -0.9], [0.3, -0.9],
      [-1.1, 0.5], [1.1, 0.5], [-0.7, 1.05], [0.7, 1.05], [-0.3, 0.8], [0.3, 0.8]],
    'df9': [[0.75, 0], [-0.75, 0], [1.0, 0.5], [-1.0, 0.5], [1.5, 0.9], [-1.5, 0.9],
      [0.7, -0.5], [-0.7, -0.5], [1.1, -0.72], [-1.1, -0.72], [1.5, -0.8], [-1.5, -0.8]],
    'df10': [[-0.9, 0.3], [0.9, 0.3], [-0.9, -0.3], [0.9, -0.3], [-0.9, 0.9], [0.9, 0.9],
      [-0.9, -0.9], [0.9, -0.9], [-0.3, 0.9], [0.3, 0.9], [-0.3, -0.9], [0.3, -0.9]],
    'df11': [[-0.6, -0.8], [0.6, -0.8], [-0.6, 0.8], [0.6, 0.8], [-1.2, 0.8], [1.2, 0.8],
      [0.0, -0.8], [0.0, 0.8], [-0.804, -0.272], [0.804, -0.272], [-0.996, 0.272], [0.996, 0.272]],
    'df12': [[-0.6, 0.8], [0.6, 0.8], [-0.6, -0.8], [0.6, -0.8], [-1.2, -0.8], [1.2, -0.8],
      [0.0, 0.8], [0.0, -0.8], [-0.804, 0.272], [0.804, 0.272], [-0.996, -0.272], [0.996, -0.272]],
    'df13': [[-1, 0.3], [1.044, 0.3], [-0.762, -0.2], [0.762, -0.2], [-0.381, -0.7], [0.381, -0.7],
      [0.0, -1], [-1.325, 0.8], [1.325, 0.8], [-0.662, 0.8], [0.662, 0.8], [0.0, 0.8]],
    'df14': [[-1.044, -0.3], [1.044, -0.3], [-0.762, 0.2], [0.762, 0.2], [-0.381, 0.7], [0.381, 0.7],
      [0.0, 1], [-1.325, -0.8], [1.325, -0.8], [-0.662, -0.8], [0.662, -0.8], [0.0, -0.8]],
    'df15': [[-0.8, 0], [0.8, 0], [-1.2, 0], [1.2, 0], [-0.8, -0.7], [0.8, -0.7],
      [-1.2, -0.7], [1.2, -0.7], [-0.8, 0.7], [0.8, 0.7], [-1.2, 0.7], [1.2, 0.7]],
    'df16': [[-0.7, -0.4], [0.7, -0.4], [-0.7, 0.4], [0.7, 0.4], [-1.1, -0.4], [1.1, -0.4],
      [-1.1, 0.4], [1.1, 0.4], [-1.5, -0.4], [1.5, -0.4], [-1.5, 0.4], [1.5, 0.4]],
    'df17': [[-0.867, -0.25], [0.867, -0.25], [-0.867, 0.25], [0.867, 0.25], [-1.3, -0.5], [1.3, -0.5],
      [-1.3, 0.5], [1.3, 0.5], [-1.733, -0.25], [1.733, -0.25], [-1.733, 0.25], [1.733, 0.25]],
    'df18': [[-1.3, -0.5], [1.3, -0.5], [-1.3, 0.5], [1.3, 0.5], [-1.011, 0], [1.011, 0],
      [-1.588, 0], [1.588, 0], [-0.723, 0.5], [0.723, -0.5], [-1.877, 0.5], [1.877, -0.5]],
    'df19': [[-1.3, -0.5], [1.3, 0.5], [-1.3, 0.5], [1.3, -0.5], [-1.011, 0], [1.011, 0],
      [-1.588, 0], [1.588, 0], [-0.723, 0.5], [0.723, 0.5], [-1.877, 0.5], [1.877, 0.5]]
  };
  const ANIMATEIDS = [0,1,2,3,4,6,9,10,12,13,15,17,23,26,34,35,36,37,38,39,40];
  var fmids = Object.keys(formations);
  var fmidx = 0;
  var gmbd_animateids = getRandomAnimations();
  var animate_num = gmbd_animateids.length;
  shuffleGmbdIds(gmbd_animateids);

  // Helper functions for character animations
  function getRandomAnimations(count = 1) {
    return [...ANIMATEIDS]
      .sort(() => 0.5 - Math.random())
      .slice(0, count);
  }

  function shuffleGmbdIds(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function buildGmbdGIFLive(gmbd_id, gmbd_type) {
    let gmbd_root = "https://chr.gameanything.com/v2/gifs/";
    let gmbd_dir = Math.ceil(gmbd_id / 100) * 100;
    return gmbd_root + gmbd_dir + '/' + gmbd_type + '/' + gmbd_id + '_' + animid + '.gif';
  }

  function buildGmbdGIF(gmbd_id, gmbd_type) {
    let gmbd_root = "https://chr.gameanything.com/v2/gifs/";
    let gmbd_dir = Math.ceil(gmbd_id / 100) * 100;
    let root_dir = gmbd_root + gmbd_dir + '/' + gmbd_type + '/';
    let animidx_next = (animidx + 1) % gmbd_animateids.length;
    let animid_next = gmbd_animateids[animidx_next];
    if(gmbd_type == 'init'){
      let gmbdidx_next = (main_gmbdidx + 1) % valid_gmbdids.length;
      let gmbdid_next = valid_gmbdids[gmbdidx_next];
      let root_dir_next = gmbd_root + (Math.ceil(gmbdid_next / 100) * 100) + '/' + gmbd_type + '/';
      return [root_dir + gmbd_id + '_' + animid + '.gif',
        root_dir_next + gmbdid_next + '_' + animid_next + '.gif',
        root_dir.replace('init', 'sub') + gmbd_id + '_' + animid_next + '.gif', gmbdid_next];    
    } else {
      return [root_dir + gmbd_id + '_' + animid + '.gif', 
        root_dir + gmbd_id + '_' + animid_next + '.gif'];
    }
  }

  function buildGmbdPNG(gmbd_id) {
    let gmbd_root = "https://chr.gameanything.com/v1/imgs/";
    let gmbd_dir = Math.ceil(gmbd_id / 100) * 100;
    return gmbd_root + gmbd_dir + '/sub/' + gmbd_id + '.png';
  }

  function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  // Live animation button (bottom-right corner)
  const gmbdLive = document.createElement('div');
  gmbdLive.id = 'gmbdLive';
  gmbdLive.style.zIndex = '2147483647'; // Set inline style to ensure highest priority
  var live_gmbdid;
  document.body.appendChild(gmbdLive);
  const gmbdLiveImg = document.createElement('img');
  gmbdLiveImg.setAttribute('draggable', 'false');
  gmbdLive.append(gmbdLiveImg);

  // Overlay container for character animations
  const gmbdOverlay = document.createElement('div');
  gmbdOverlay.id = 'gmbdOverlay';
  gmbdOverlay.style.zIndex = '2147483647'; // Set inline style to ensure highest priority
  document.body.append(gmbdOverlay);
  
  // Exit button
  const gmbdExit = document.createElement('div');
  gmbdExit.id = 'gmbdExit';
  gmbdExit.style.zIndex = '2147483647'; // Set inline style to ensure highest priority
  document.body.append(gmbdExit);
  gmbdExit.textContent = '\u00D7'; // × close icon
  gmbdExit.addEventListener('click', function(e) {
    stopGameStateMonitoring();
    clearExistFormation();
    gmbdOverlay.style.display = 'none';
    gmbdBtn.style.display = 'none';
    gmbdExit.style.display = 'none';
    // Hide sound control button when closing game interface
    const soundControlBtn = shadow.getElementById('games-sound-control');
    if (soundControlBtn) {
      soundControlBtn.style.display = 'none';
    }
    // Try to play music on user interaction (for autoplay policy)
    tryPlayMusicOnInteraction();
    // Keep live_gmbdid and animid unchanged when closing game interface
    // Use main_gmbdid (the static image currently displayed) as live_gmbdid
    // This ensures the dynamic image matches the static image that was displayed
    live_gmbdid = main_gmbdid;
    // Keep animid unchanged - use the current animid (don't update animidx)
    // animid is already set from the previous state
    gmbdLiveImg.src = buildGmbdGIFLive(live_gmbdid, 'sub');
    gmbdLive.style.display = 'block';
    // Completely remove games overlay and clear game state
    if (root && root.parentNode) {
      completeTeardown();
    }
  });
  
  // Static button for updating animations
  const gmbdBtn = document.createElement('div');
  gmbdBtn.id = 'gmbdBtn';
  gmbdBtn.style.zIndex = '2147483647'; // Set inline style to ensure highest priority
  document.body.appendChild(gmbdBtn);
  gmbdBtn.addEventListener('click', function() {
    // Only update character formation, don't reload game
    updateCharacterFormation();
    // Try to play music on user interaction (for autoplay policy)
    tryPlayMusicOnInteraction();
  });

  // Character animation helper functions
  function clearExistFormation() {
    let existing = document.getElementById('gmbdCircleContainer');
    if (existing) {
      existing.querySelectorAll('img').forEach(img => img.parentNode.removeChild(img));
      existing.parentNode.removeChild(existing);
    }
    _dancerRevealed = false;
    if (_dancerRevealTimer) {
      clearTimeout(_dancerRevealTimer);
      _dancerRevealTimer = null;
    }
  }

  // Update only character formation without reloading game
  // Requirements:
  // 1. Update both bottom-right image and dynamic image group on each click
  // 2. Bottom-right image must be included in the dynamic image group
  // 3. Animation (animid) must remain unchanged
  // 4. Show static images when game is not over, dynamic images when game is over
  function updateCharacterFormation() {
    // Keep animid unchanged - don't update it regardless of saved_animid state
    // This ensures the animation remains the same on each click
    // Only update animid if it's undefined or null (shouldn't happen, but safety check)
    if (typeof animid === 'undefined' || animid === null) {
      if (saved_animid !== null) {
        animid = saved_animid;
      } else if (gmbd_animateids && gmbd_animateids.length > 0) {
        animid = gmbd_animateids[animidx];
      }
    }
    
    // Increment main_gmbdidx first to get the next character
    // This ensures each click will change the character (including the first click)
    main_gmbdidx++;
    main_gmbdidx = main_gmbdidx % valid_gmbdids.length;
    
    // Update main_gmbdid to the next character
    main_gmbdid = valid_gmbdids[main_gmbdidx];
    // Update live_gmbdid to match main_gmbdid so Exit button shows correct dynamic image
    live_gmbdid = main_gmbdid;
    sub_gmbdids = [...valid_gmbdids.slice(0, main_gmbdidx), ...valid_gmbdids.slice(main_gmbdidx + 1)];
    
    // Update current_selected_gmbdids and current_target_gmbdid for game state monitoring
    // Ensure main_gmbdid (bottom-right image) is included in selected_gmbdids
    // Create 12 characters: main_gmbdid + 11 from sub_gmbdids
    let updated_selected_gmbdids = [main_gmbdid];
    // Shuffle sub_gmbdids first to randomize
    shuffleGmbdIds(sub_gmbdids);
    // Add 11 characters from sub_gmbdids (or all if less than 11)
    for (let i = 0; i < 11 && i < sub_gmbdids.length; i++) {
      updated_selected_gmbdids.push(sub_gmbdids[i]);
    }
    // If we don't have enough characters, fill with duplicates
    while (updated_selected_gmbdids.length < 12) {
      if (sub_gmbdids.length > 0) {
        updated_selected_gmbdids.push(sub_gmbdids[Math.floor(Math.random() * sub_gmbdids.length)]);
      } else {
        updated_selected_gmbdids.push(main_gmbdid);
      }
    }
    // Shuffle to randomize positions, but main_gmbdid is guaranteed to be in the array
    shuffleGmbdIds(updated_selected_gmbdids);
    // Ensure main_gmbdid is still in the array after shuffling
    let has_main = updated_selected_gmbdids.some(id => id === main_gmbdid);
    if (!has_main && updated_selected_gmbdids.length > 0) {
      updated_selected_gmbdids[0] = main_gmbdid;
    }
    
    current_selected_gmbdids = updated_selected_gmbdids.slice(); // Create a copy
    current_target_gmbdid = live_gmbdid; // This is the same as main_gmbdid
    
    // Update button image (bottom-right image) - ensure it's updated immediately
    // Clear and update gmbdBtn synchronously to ensure it updates before displayCircleFormation
    if (gmbdBtn) {
      gmbdBtn.innerHTML = '';
      const btnImg = document.createElement('img');
      btnImg.src = buildGmbdPNG(main_gmbdid);
      gmbdBtn.appendChild(btnImg);
      // Force a reflow to ensure the update is visible
      void gmbdBtn.offsetHeight;
    }
    
    // Update formation - this will use current_selected_gmbdids which includes main_gmbdid
    // getCircleImgPaths will automatically use static images if game is not over, dynamic images if game is over
    // forceStaticImages should be false when clicking bottom-right image (only true when switching games)
    displayCircleFormation();
    
    // Preload dynamic images when character formation changes (after current_selected_gmbdids is updated)
    // This ensures dynamic images are ready when game ends
    if (current_selected_gmbdids && current_target_gmbdid && typeof animid !== 'undefined' && animid !== null) {
      preloadDynamicImages(current_selected_gmbdids, current_target_gmbdid);
    }
  }

  function displayGmbdOverlay() {
    gmbdLive.style.display = 'none';
    // Hide tooltip when game overlay is opened
    if (gmbdLiveTooltip) {
      gmbdLiveTooltip.style.display = 'none';
    }
    gmbdBtn.style.display = 'block';
    gmbdExit.style.display = 'flex';
    gmbdOverlay.style.display = 'block';
    
    // Preload heart images when game interface is opened
    preloadHeartImages();
    // Initialize background music when game interface is opened
    initBackgroundMusic();
    
    // Keep live_gmbdid and animid unchanged when opening game interface
    // Only switch from dynamic image to static image
    // If live_gmbdid is set and exists in valid_gmbdids, use it as the main character
    if (live_gmbdid !== undefined && live_gmbdid !== null && valid_gmbdids) {
      const liveGmbdIdx = valid_gmbdids.indexOf(live_gmbdid);
      if (liveGmbdIdx !== -1) {
        // Found the live_gmbdid in valid_gmbdids, use it as main_gmbdidx
        main_gmbdidx = liveGmbdIdx;
      }
    }
    
    // Keep animid unchanged (don't update animidx or recalculate animid)
    // animid is already set from the previous state and should remain the same
    // Don't do: animid = gmbd_animateids[animidx]; (this would change the animation)
    // Save the current animid when opening game interface (for first game end)
    if (typeof animid !== 'undefined' && animid !== null) {
      initial_animid = animid;
    } else if (gmbd_animateids && gmbd_animateids.length > 0) {
      // If animid is not set, initialize it from gmbd_animateids
      animidx = typeof animidx !== 'undefined' && animidx >= 0 && animidx < gmbd_animateids.length ? animidx : 0;
      animid = gmbd_animateids[animidx];
      initial_animid = animid;
    } else if (ANIMATEIDS && ANIMATEIDS.length > 0) {
      animid = ANIMATEIDS[0];
      animidx = 0;
      initial_animid = animid;
    }
    main_gmbdid = valid_gmbdids[main_gmbdidx];
    // Keep live_gmbdid unchanged - it should match the clicked dynamic image
    // Don't update live_gmbdid = main_gmbdid here, keep the original live_gmbdid
    sub_gmbdids = [...valid_gmbdids.slice(0, main_gmbdidx), ...valid_gmbdids.slice(main_gmbdidx + 1)];
    gmbdOverlay.style.display = 'block';
    gmbdBtn.style.display = 'block';
    const btnImg = document.createElement('img');
    btnImg.src = buildGmbdPNG(main_gmbdid);
    gmbdBtn.innerHTML = '';
    gmbdBtn.appendChild(btnImg);
    gmbdExit.style.display = 'flex';
    shuffleGmbdIds(sub_gmbdids);
    displayCircleFormation();
    // Don't increment main_gmbdidx and animidx here - keep them unchanged
    // This ensures the same character and animation when closing the game interface
    // Also show games overlay
    if (root && root.parentNode) {
      root.style.display = 'block';
      // Show sound control button when game interface is opened
      const soundControlBtn = shadow.getElementById('games-sound-control');
      if (soundControlBtn) {
        soundControlBtn.style.display = 'flex';
      }
      // Always restart games to ensure fresh state
      currentGame = null;
      // Clear iframe content before restarting
      // Pass skipCharacterUpdate=true to prevent changing live_gmbdid and animid when opening game interface
      if (gameFrame) {
        try {
          gameFrame.src = 'about:blank';
          // Wait a bit before loading new game to ensure iframe is cleared
          setTimeout(() => {
            startGames(true); // Skip character update when opening game interface
          }, 100);
        } catch (e) {
          startGames(true); // Skip character update when opening game interface
        }
      } else {
        startGames(true); // Skip character update when opening game interface
      }
    } else {
      // Root doesn't exist - this shouldn't happen, but if it does, just show character animations
      // The games will be available on next page load
    }
  }

  // Update character formation position based on current game interface size
  function updateFormationPosition() {
    const container = document.getElementById('gmbdCircleContainer');
    if (!container) {
      return;
    }
    
    // Try to get gamebox dimensions
    try {
      const rootContainer = document.getElementById('games-root-container');
      let gameFrame = null;
      if (rootContainer && rootContainer.shadowRoot) {
        gameFrame = rootContainer.shadowRoot.getElementById('games-iframe');
      }
      if (!gameFrame) {
        gameFrame = document.getElementById('games-iframe');
      }
      
      if (gameFrame && gameFrame.contentWindow) {
        const iframeDoc = gameFrame.contentDocument || gameFrame.contentWindow.document;
        if (iframeDoc) {
          const gamebox = iframeDoc.getElementById('gamebox');
          if (gamebox) {
            const gameboxRect = gamebox.getBoundingClientRect();
            if (gameboxRect.height > 0 && gameboxRect.width > 0) {
              // Update container dimensions
              container.style.width = `${gameboxRect.width}px`;
              container.style.height = `${gameboxRect.height}px`;
              main_gmbdsize = gameboxRect.height;
              
              // Use responsive dancer size clamped to fit viewport
              const effectiveSize = getFittedDancerSize(gameboxRect.height);
              
              // Update element positions
              const spacing = 20;
              const totalRowWidth = (effectiveSize * 6) + (spacing * 5);
              const startX = (gameboxRect.width - totalRowWidth) / 2;
              const firstRowY = -effectiveSize - dancerGap;
              const secondRowY = gameboxRect.height + dancerGap;
              
              for (let i = 0; i < 12; i++) {
                const gmbdld = document.getElementById('gmbdld-' + i);
                if (gmbdld) {
                  const row = Math.floor(i / 6);
                  const col = i % 6;
                  const x = startX + col * (effectiveSize + spacing);
                  const y = row === 0 ? firstRowY : secondRowY;
                  gmbdld.style.left = `${x}px`;
                  gmbdld.style.top = `${y}px`;
                  gmbdld.style.width = `${effectiveSize}px`;
                  gmbdld.style.height = `${effectiveSize}px`;
                }
              }
            }
          }
        }
      }
      scheduleDancerReveal();
    } catch (e) {
      // Error accessing gamebox, skip position update
    }
  }

  function displayCircleFormation() {
    if (!live_gmbdid || !valid_gmbdids || valid_gmbdids.length === 0) {
      return;
    }
    clearExistFormation();
    gmbdOverlay.style.background = 'radial-gradient(ellipse, rgba(0, 0, 0, 0.9) 30%, rgba(0, 0, 0, 0.6) 100%)';
    
    // Get gamebox width and height from iframe and set main_gmbdsize dynamically
    let current_main_gmbdsize = main_gmbdsize; // Default to original value
    let gameboxWidth = main_gmbdsize; // Default to main_gmbdsize for width
    let gameboxHeight = main_gmbdsize; // Default to main_gmbdsize for height
    
    // Helper function to update container dimensions when gamebox is found
    function updateContainerDimensions(width, height) {
      // Update global main_gmbdsize with gamebox height
      main_gmbdsize = height;
      const container = document.getElementById('gmbdCircleContainer');
      if (container) {
        container.style.width = `${width}px`;
        container.style.height = `${height}px`;
      }
    }
    
    // Try to get gamebox dimensions with retry mechanism and iframe load listener
    // callback: function to call when dimensions are found
    function tryGetGameboxDimensions(retries = 0, maxRetries = 50, callback = null) {
      try {
        // Try to get iframe from shadow DOM first, then fallback to document
        let gameFrame = null;
        const rootContainer = document.getElementById('games-root-container');
        if (rootContainer && rootContainer.shadowRoot) {
          gameFrame = rootContainer.shadowRoot.getElementById('games-iframe');
        }
        // Fallback to document if not found in shadow DOM
        if (!gameFrame) {
          gameFrame = document.getElementById('games-iframe');
        }
        if (!gameFrame) {
          if (retries < maxRetries) {
            setTimeout(() => {
              tryGetGameboxDimensions(retries + 1, maxRetries, callback);
            }, 200); // Wait 200ms before retrying
          } else {
            console.log('gameFrame not found after', maxRetries, 'retries');
          }
          return null;
        }
        
        // Add load event listener to iframe if not already added
        if (!gameFrame.dataset.listenerAdded) {
          gameFrame.dataset.listenerAdded = 'true';
          gameFrame.addEventListener('load', function() {
            // Try to get dimensions when iframe loads
            setTimeout(() => {
              tryGetGameboxDimensions(0, 10, callback);
            }, 500); // Wait 500ms after iframe loads for game to initialize
          });
        }
        
        if (gameFrame.contentWindow) {
          const iframeDoc = gameFrame.contentDocument || gameFrame.contentWindow.document;
          if (iframeDoc) {
            const gamebox = iframeDoc.getElementById('gamebox');
            if (gamebox) {
              const gameboxRect = gamebox.getBoundingClientRect();
              if (gameboxRect.height > 0 && gameboxRect.width > 0) {
                // Update global main_gmbdsize with gamebox height
                main_gmbdsize = gameboxRect.height;
                updateContainerDimensions(gameboxRect.width, gameboxRect.height);
                const result = { 
                  current_main_gmbdsize: gameboxRect.height, 
                  gameboxWidth: gameboxRect.width, 
                  gameboxHeight: gameboxRect.height 
                };
                // Call callback if provided
                if (callback && typeof callback === 'function') {
                  callback(result);
                }
                return result;
              } else {
                // gamebox exists but dimensions are 0, retry
                if (retries < maxRetries) {
                  setTimeout(() => {
                    tryGetGameboxDimensions(retries + 1, maxRetries, callback);
                  }, 200);
                }
              }
            } else {
              // gamebox not found, retry
              if (retries < maxRetries) {
                setTimeout(() => {
                  tryGetGameboxDimensions(retries + 1, maxRetries, callback);
                }, 200);
              } else if (retries === maxRetries) {
                // Try to list all elements in iframe for debugging
                try {
                  const allElements = iframeDoc.querySelectorAll('*');
                  const elementsWithId = Array.from(allElements).filter(el => el.id);
                } catch (e) {
                  console.log('Cannot list elements:', e);
                }
              }
            }
          } else {
            // Cannot access iframe document, retry
            if (retries < maxRetries) {
              setTimeout(() => {
                tryGetGameboxDimensions(retries + 1, maxRetries, callback);
              }, 200);
            }
          }
        } else {
          // contentWindow is null, retry
          if (retries < maxRetries) {
            setTimeout(() => {
              tryGetGameboxDimensions(retries + 1, maxRetries, callback);
            }, 200);
          }
        }
      } catch (e) {
        // Cross-origin or other error
        if (retries === 0) {
          console.log('Error accessing gamebox:', e);
        }
        if (retries < maxRetries) {
          setTimeout(() => {
            tryGetGameboxDimensions(retries + 1, maxRetries, callback);
          }, 200);
        }
      }
      
      return null; // Return null if not found yet
    }
    
    // Store the current live_gmbdid to ensure we use the correct one
    // Don't modify the global live_gmbdid variable
    let target_gmbdid = live_gmbdid;
    
    // Function to create the formation once we have the correct dimensions
    function createFormationWithDimensions() {
      // Use current_target_gmbdid if available (from game state monitoring or updateCharacterFormation), otherwise use live_gmbdid
      let target_gmbdid = current_target_gmbdid || live_gmbdid;
      
      // If current_selected_gmbdids is already set (e.g., from updateCharacterFormation), use it
      // Otherwise, generate new selected_gmbdids
      let selected_gmbdids;
      if (current_selected_gmbdids && current_selected_gmbdids.length === 12) {
        // Use existing selected_gmbdids from updateCharacterFormation or game state monitoring
        selected_gmbdids = current_selected_gmbdids.slice(); // Create a copy
        // Ensure target_gmbdid is in the array
        let has_target = false;
        for (let i = 0; i < selected_gmbdids.length; i++) {
          if (selected_gmbdids[i] === target_gmbdid) {
            has_target = true;
            break;
          }
        }
        if (!has_target && selected_gmbdids.length > 0) {
          // Replace first element with target_gmbdid
          selected_gmbdids[0] = target_gmbdid;
        }
      } else {
        // Generate new selected_gmbdids
        // If live_gmbdid is not in valid_gmbdids, use the first valid one as target
        // But don't modify the global live_gmbdid - just use it for this formation
        if (!valid_gmbdids.includes(target_gmbdid)) {
          if (valid_gmbdids.length > 0) {
            target_gmbdid = valid_gmbdids[0];
          } else {
            return; // Cannot proceed without valid characters
          }
        }
        
        // Create 12 characters: one same as bottom-right (target_gmbdid), 11 random
        // Start with target_gmbdid to guarantee it's included
        selected_gmbdids = [target_gmbdid];
        let available_gmbdids = valid_gmbdids.filter(id => id !== target_gmbdid);
        shuffleGmbdIds(available_gmbdids);
        
        // Add 11 more random characters from available
        for (let i = 0; i < 11 && i < available_gmbdids.length; i++) {
          selected_gmbdids.push(available_gmbdids[i]);
        }
        
        // If we don't have enough unique characters, fill with random from available or target_gmbdid
        while (selected_gmbdids.length < 12) {
          if (available_gmbdids.length > 0) {
            let randomId = available_gmbdids[Math.floor(Math.random() * available_gmbdids.length)];
            selected_gmbdids.push(randomId);
          } else {
            // If no available characters, use target_gmbdid as duplicate
            selected_gmbdids.push(target_gmbdid);
          }
        }
        
        // Shuffle to randomize positions, but target_gmbdid is guaranteed to be in the array
        shuffleGmbdIds(selected_gmbdids);
        
        // Multiple safety checks to ensure target_gmbdid is in the array
        let target_count = selected_gmbdids.filter(id => id === target_gmbdid).length;
        if (target_count === 0) {
          // If somehow target_gmbdid is missing, replace the first one with it
          selected_gmbdids[0] = target_gmbdid;
        }
        
        // Final verification: use strict comparison
        let has_target = false;
        for (let i = 0; i < selected_gmbdids.length; i++) {
          if (selected_gmbdids[i] === target_gmbdid) {
            has_target = true;
            break;
          }
        }
        if (!has_target) {
          // Last resort: replace a random one with target_gmbdid
          let randomIndex = Math.floor(Math.random() * selected_gmbdids.length);
          selected_gmbdids[randomIndex] = target_gmbdid;
        }
      }
      
      const container = document.createElement('div');
      container.id = 'gmbdCircleContainer';
      container.style.zIndex = '2147483647'; // Set inline style to ensure highest priority
      // Set container width and height to match gamebox
      container.style.width = `${gameboxWidth}px`;
      container.style.height = `${gameboxHeight}px`;
      container.style.position = 'fixed';
      // Hide until positioned to prevent visible jump
      container.style.visibility = 'hidden';
      // Subtle dimming during gameplay; full vivid on game over celebration
      container.style.opacity = '0.35';
      container.style.transition = 'opacity 0.5s ease';

      // Create dancer elements with responsive sizing clamped to fit viewport
      // Layout: 2 rows, 6 images per row
      const effectiveSize = getFittedDancerSize(gameboxHeight);
      
      const spacing = 20;
      const totalRowWidth = (effectiveSize * 6) + (spacing * 5);
      const startX = (gameboxWidth - totalRowWidth) / 2;
      
      const firstRowY = -effectiveSize - dancerGap;
      const secondRowY = gameboxHeight + dancerGap;
      
      for (let i = 0; i < 12; i++) {
        const gmbdld = document.createElement('div');
        gmbdld.className = 'gmbdld-sub';
        gmbdld.id = 'gmbdld-' + i;
        
        const row = Math.floor(i / 6);
        const col = i % 6;
        
        const x = startX + col * (effectiveSize + spacing);
        const y = row === 0 ? firstRowY : secondRowY;
        
        gmbdld.style.left = `${x}px`;
        gmbdld.style.top = `${y}px`;
        gmbdld.style.width = `${effectiveSize}px`;
        gmbdld.style.height = `${effectiveSize}px`;
        gmbdld.style.position = 'absolute';
        
        container.appendChild(gmbdld);
      }
      gmbdOverlay.appendChild(container);
      
      // Final verification: ensure target_gmbdid is in selected_gmbdids before generating paths
      // Use the target_gmbdid we determined at the start of the function
      let has_target_final = false;
      for (let i = 0; i < selected_gmbdids.length; i++) {
        if (selected_gmbdids[i] === target_gmbdid) {
          has_target_final = true;
          break;
        }
      }
      if (!has_target_final) {
        // Force replace the last element with target_gmbdid as final safety measure
        selected_gmbdids[selected_gmbdids.length - 1] = target_gmbdid;
      }
      
      // Store current character IDs for game state monitoring
      current_selected_gmbdids = selected_gmbdids.slice(); // Create a copy
      current_target_gmbdid = target_gmbdid;
      
      // Use forceStaticImages flag if set (e.g., when switching games)
      gmbdPaths = getCircleImgPaths(selected_gmbdids, target_gmbdid, forceStaticImages);
      displayGmbds(gmbdPaths);
      
      // Start monitoring game state if not already monitoring
      startGameStateMonitoring();
    }
    
    // Try to get dimensions immediately (synchronous attempt first)
    // In game interface open state, gamebox should already exist
    let dimensions = null;
    try {
      const rootContainer = document.getElementById('games-root-container');
      let gameFrame = null;
      if (rootContainer && rootContainer.shadowRoot) {
        gameFrame = rootContainer.shadowRoot.getElementById('games-iframe');
      }
      if (!gameFrame) {
        gameFrame = document.getElementById('games-iframe');
      }
      
      if (gameFrame && gameFrame.contentWindow) {
        const iframeDoc = gameFrame.contentDocument || gameFrame.contentWindow.document;
        if (iframeDoc) {
          const gamebox = iframeDoc.getElementById('gamebox');
          if (gamebox) {
            const gameboxRect = gamebox.getBoundingClientRect();
            if (gameboxRect.height > 0 && gameboxRect.width > 0) {
              dimensions = {
                current_main_gmbdsize: gameboxRect.height,
                gameboxWidth: gameboxRect.width,
                gameboxHeight: gameboxRect.height
              };
              main_gmbdsize = gameboxRect.height;
            }
          }
        }
      }
    } catch (e) {
      console.log('Error getting gamebox dimensions synchronously:', e);
    }
    
    // If dimensions found immediately, use them
    if (dimensions) {
      current_main_gmbdsize = dimensions.current_main_gmbdsize;
      gameboxWidth = dimensions.gameboxWidth;
      gameboxHeight = dimensions.gameboxHeight;
      createFormationWithDimensions();
    } else {
      // If not found immediately, use async callback with retry
      const dimensionsAsync = tryGetGameboxDimensions(0, 50, function(dims) {
        // Callback when dimensions are found
        current_main_gmbdsize = dims.current_main_gmbdsize;
        gameboxWidth = dims.gameboxWidth;
        gameboxHeight = dims.gameboxHeight;
        // Only create if container doesn't exist yet
        if (!document.getElementById('gmbdCircleContainer')) {
          createFormationWithDimensions();
        } else {
          // Container exists, just update positions
          const container = document.getElementById('gmbdCircleContainer');
          if (container) {
            container.style.width = `${dims.gameboxWidth}px`;
            container.style.height = `${dims.gameboxHeight}px`;
            const effectiveSize = getFittedDancerSize(dims.gameboxHeight);
            const spacing = 20;
            const totalRowWidth = (effectiveSize * 6) + (spacing * 5);
            const startX = (dims.gameboxWidth - totalRowWidth) / 2;
            const firstRowY = -effectiveSize - dancerGap;
            const secondRowY = dims.gameboxHeight + dancerGap;
            
            for (let i = 0; i < 12; i++) {
              const gmbdld = document.getElementById('gmbdld-' + i);
              if (gmbdld) {
                const row = Math.floor(i / 6);
                const col = i % 6;
                const x = startX + col * (effectiveSize + spacing);
                const y = row === 0 ? firstRowY : secondRowY;
                gmbdld.style.left = `${x}px`;
                gmbdld.style.top = `${y}px`;
                gmbdld.style.width = `${effectiveSize}px`;
                gmbdld.style.height = `${effectiveSize}px`;
              }
            }
          }
        }
        scheduleDancerReveal();
      });
      
      // If dimensions are immediately available from async call, create formation
      if (dimensionsAsync) {
        current_main_gmbdsize = dimensionsAsync.current_main_gmbdsize;
        gameboxWidth = dimensionsAsync.gameboxWidth;
        gameboxHeight = dimensionsAsync.gameboxHeight;
        createFormationWithDimensions();
      } else {
        // Dimensions will be created via callback when found
        // But set a timeout fallback in case callback never fires
        setTimeout(() => {
          // Check if formation was already created
          if (!document.getElementById('gmbdCircleContainer')) {
            createFormationWithDimensions();
          }
        }, 10000); // 10 second fallback
      }
    }
  }

  // Check if the game ended in a loss/failure (returns true only when game is over AND lost)
  // NOTE: This is only called AFTER isGameOver() confirms the game is over.
  //
  // Strategy:
  //   1. Games with explicit win/loss indicators (text, CSS classes, game state):
  //      - Win detected → celebrate (return false)
  //      - Loss detected → no celebrate (return true)
  //   2. Games without explicit win/loss (no clear indicator found):
  //      - Check the final score: score > 0 → celebrate, score = 0 → no celebrate
  //
  function isGameLost() {
    try {
      // Access iframe content
      var rootContainer = document.getElementById('games-root-container');
      var gameFrame = null;
      if (rootContainer && rootContainer.shadowRoot) {
        gameFrame = rootContainer.shadowRoot.getElementById('games-iframe');
      }
      if (!gameFrame) {
        gameFrame = document.getElementById('games-iframe');
      }
      if (!gameFrame || !gameFrame.contentWindow) return false;

      var iframeDoc = null;
      try {
        iframeDoc = gameFrame.contentDocument || gameFrame.contentWindow.document;
      } catch (e) {
        return false;
      }
      if (!iframeDoc) return false;

      // --- Explicit loss/win text detection ---
      // Note: "game over" is intentionally excluded — it just means the game ended,
      // not necessarily a loss (e.g. snake games, 2048 all say "Game Over")
      function hasLossText(text) {
        if (!text) return false;
        var t = text.toLowerCase();
        return t.indexOf('loss') !== -1 || t.indexOf('lose') !== -1 ||
               t.indexOf('lost') !== -1 ||
               t.indexOf('time out') !== -1 || t.indexOf("time's up") !== -1 ||
               t.indexOf('touch border') !== -1 || t.indexOf('hit a paddle') !== -1;
      }

      function hasWinText(text) {
        if (!text) return false;
        var t = text.toLowerCase();
        return t.indexOf('win') !== -1 || t.indexOf('congrat') !== -1 ||
               t.indexOf('success') !== -1 || t.indexOf('complete') !== -1 ||
               t.indexOf('all found') !== -1;
      }

      // 1. Check #overmsg class (drag-maze fail/success)
      try {
        var overmsg = iframeDoc.getElementById('overmsg');
        if (overmsg) {
          if (overmsg.classList && overmsg.classList.contains('fail')) return true;
          if (overmsg.classList && overmsg.classList.contains('success')) return false;
          var oTxt = (overmsg.textContent || '').trim();
          if (oTxt.length > 0) {
            if (hasWinText(oTxt)) return false;
            if (hasLossText(oTxt)) return true;
          }
        }
      } catch (e) {}

      // 2. Check game state objects — only explicit WON/LOST states
      // (GAME_OVER/gameOver/die just mean "game ended", not a loss)
      try {
        var iframeWindow = gameFrame.contentWindow;
        if (iframeWindow) {
          // Check window.game.state (most games)
          if (iframeWindow.game) {
            var gs = iframeWindow.game.state;
            if (gs === 'WON' || gs === 'won') return false;
            if (gs === 'LOST' || gs === 'lost') return true;
          }
          // Check window.gameManager.currentGame.state (mine-finder)
          if (iframeWindow.gameManager && iframeWindow.gameManager.currentGame) {
            var gms = iframeWindow.gameManager.currentGame.state;
            if (gms === 'WON' || gms === 'won') return false;
            if (gms === 'LOST' || gms === 'lost') return true;
          }
        }
      } catch (e) {}

      // 3. Check specific text elements for win/loss keywords
      var selectors = [
        '#gameMessage', '#status', '#gameovertext',
        '.gameover .msg', '.overlay-content h2',
        '#mine-finder-message'
      ];
      for (var i = 0; i < selectors.length; i++) {
        try {
          var el = iframeDoc.querySelector(selectors[i]);
          if (el) {
            var txt = (el.textContent || '').trim();
            if (txt.length > 0) {
              if (hasWinText(txt)) return false;
              if (hasLossText(txt)) return true;
            }
          }
        } catch (e) {}
      }

      // 4. Check broader containers for win/loss keywords
      var containers = ['#gameover', '#gameOverlay', '#overlay', '.gameover', '#mask'];
      for (var j = 0; j < containers.length; j++) {
        try {
          var cEl = iframeDoc.querySelector(containers[j]);
          if (cEl) {
            var cTxt = (cEl.textContent || '').trim();
            if (cTxt.length > 0) {
              if (hasWinText(cTxt)) return false;
              if (hasLossText(cTxt)) return true;
            }
          }
        } catch (e) {}
      }

      // --- No explicit win/loss found — fall back to score check ---
      // Score > 0 means the player achieved something → celebrate
      // Score = 0 means the player achieved nothing → no celebrate
      var score = -1; // -1 means no score element found

      // Try <span id="score"> (used by most games)
      try {
        var scoreEl = iframeDoc.getElementById('score');
        if (scoreEl) {
          var scoreVal = parseInt(scoreEl.textContent.trim(), 10);
          if (!isNaN(scoreVal)) score = scoreVal;
        }
      } catch (e) {}

      // Try <span id="scorev"> (used by word-scramble)
      if (score === -1) {
        try {
          var scorevEl = iframeDoc.getElementById('scorev');
          if (scorevEl) {
            var scoreVal2 = parseInt(scorevEl.textContent.trim(), 10);
            if (!isNaN(scoreVal2)) score = scoreVal2;
          }
        } catch (e) {}
      }

      // Try game.score from JS object (used by apple-snake via window.game)
      if (score === -1) {
        try {
          var iframeWin = gameFrame.contentWindow;
          if (iframeWin && iframeWin.game && typeof iframeWin.game.score === 'number') {
            score = iframeWin.game.score;
          }
        } catch (e) {}
      }

      // If a score was found, use it to determine outcome
      if (score !== -1) {
        return score <= 0; // score > 0 → celebrate (false), score = 0 → loss (true)
      }

    } catch (e) {}
    // Default: no explicit outcome and no score found — celebrate
    return false;
  }

  // Check if current game is over (ended)
  function isGameOver() {
    try {
      const rootContainer = document.getElementById('games-root-container');
      let gameFrame = null;
      if (rootContainer && rootContainer.shadowRoot) {
        gameFrame = rootContainer.shadowRoot.getElementById('games-iframe');
      }
      if (!gameFrame) {
        gameFrame = document.getElementById('games-iframe');
      }
      
      if (!gameFrame) {
        return false;
      }
      
      if (!gameFrame.contentWindow) {
        return false;
      }
      
      const iframeDoc = gameFrame.contentDocument || gameFrame.contentWindow.document;
      if (!iframeDoc) {
        return false;
      }
      
      // Check for gameover element
      const gameover = iframeDoc.getElementById('gameover');
      if (gameover) {
        const display = window.getComputedStyle(gameover).display;
        // If gameover is visible, game is over
        if (display !== 'none' && display !== '') {
          return true;
        }
      }
      
      // Check for gameOverOverlay element (used by number-snake, snake-vs-block, etc.)
      const gameOverOverlay = iframeDoc.getElementById('gameOverOverlay');
      if (gameOverOverlay) {
        const display = window.getComputedStyle(gameOverOverlay).display;
        // If gameOverOverlay is visible, game is over
        if (display !== 'none' && display !== '') {
          return true;
        }
      }
      
      // Check for gameOverlay element (used by drag-maze-blocker)
      // Note: drag-maze-blocker uses visibility instead of display
      const gameOverlay = iframeDoc.getElementById('gameOverlay');
      if (gameOverlay) {
        const visibility = window.getComputedStyle(gameOverlay).visibility;
        // If gameOverlay is visible, game is over
        if (visibility === 'visible') {
          return true;
        }
      }
      
      // Check for overlay element (used by drag-maze-door)
      // Note: drag-maze-door uses display: flex when game is over
      const overlay = iframeDoc.getElementById('overlay');
      if (overlay) {
        const display = window.getComputedStyle(overlay).display;
        // If overlay is visible (not none), game is over
        if (display !== 'none' && display !== '') {
          return true;
        }
      }
      
      // Check for mask element (used by 2048-game)
      // Note: 2048-game uses display: block when game is over
      const mask = iframeDoc.getElementById('mask');
      if (mask) {
        const display = window.getComputedStyle(mask).display;
        // If mask is visible (not none), game is over
        if (display !== 'none' && display !== '') {
          return true;
        }
      }
      
      // Check for msg element (used by word-search, letter-swap, etc.)
      // Note: word-search uses msg as standalone element with display: flex when game is over
      // letter-swap uses msg as a child of gameover, so we should check gameover instead
      const msg = iframeDoc.getElementById('msg');
      if (msg) {
        // Check if msg has a parent gameover element
        const parentGameover = msg.closest('#gameover');
        if (parentGameover) {
          // If msg is inside gameover (like in letter-swap), check gameover's display instead
          const gameoverDisplay = window.getComputedStyle(parentGameover).display;
          if (gameoverDisplay !== 'none' && gameoverDisplay !== '') {
            return true;
          }
        } else {
          // If msg is standalone (like in word-search), check its own display
          const display = window.getComputedStyle(msg).display;
          if (display !== 'none' && display !== '') {
            return true;
          }
        }
      }
      
      // Check for overmsg element (used by drag-maze, drag-maze-pro, etc.)
      // Note: For classic-maze, level-maze, blocker-maze, barcode-maze,
      // overmsg is a child of gameover, so we should check gameover instead.
      // For drag-maze series, overmsg is standalone.
      const overmsg = iframeDoc.getElementById('overmsg');
      if (overmsg) {
        // Check if overmsg has a parent gameover element
        const parentGameover = overmsg.closest('#gameover');
        if (parentGameover) {
          // If overmsg is inside gameover, check gameover's display instead
          const gameoverDisplay = window.getComputedStyle(parentGameover).display;
          if (gameoverDisplay !== 'none' && gameoverDisplay !== '') {
            return true;
          }
        } else {
          // If overmsg is standalone (like in drag-maze), check its own display
          const display = window.getComputedStyle(overmsg).display;
          if (display !== 'none' && display !== '') {
            return true;
          }
        }
      }
      
      // Check for other game over indicators
      const gameOverElement = iframeDoc.querySelector('.gameover');
      if (gameOverElement) {
        const display = window.getComputedStyle(gameOverElement).display;
        if (display !== 'none' && display !== '') {
          return true;
        }
      }
      
      // Check for mine-finder-message element (used by mine-finder game)
      // Note: mine-finder shows a message overlay when game ends
      const mineFinderMessage = iframeDoc.getElementById('mine-finder-message');
      if (mineFinderMessage) {
        // The message is shown temporarily, but we can check if it exists
        // However, it auto-removes after 2 seconds, so this might not be reliable
        // But if it exists, game is likely over
        return true;
      }
      
      // Check game state if accessible
      try {
        const iframeWindow = gameFrame.contentWindow;
        if (iframeWindow) {
          // Check for game state objects
          if (iframeWindow.game) {
            const gameState = iframeWindow.game.state;
            if (iframeWindow.game.isGameOver === true || 
                gameState === 'GAME_OVER' ||
                gameState === 'gameOver' ||
                gameState === 'WON' ||
                gameState === 'LOST' ||
                gameState === 'won' ||
                gameState === 'lost') {
              return true;
            }
          }
          
              // Check for MineFinderGameManager (mine-finder game)
              // Try multiple possible paths to access the game manager
              let gameManager = iframeWindow.gameManager || iframeWindow.__gameManager;
              
              if (!gameManager) {
                // Try to find it by checking all global variables
                let foundKeys = [];
                for (let key in iframeWindow) {
                  foundKeys.push(key);
                  if (key.includes('Manager') || key.includes('manager')) {
                    const obj = iframeWindow[key];
                    if (obj && obj.currentGame && obj.currentGame.state) {
                      gameManager = obj;
                      break;
                    }
                  }
                }
              }
              
              if (gameManager) {
                if (gameManager.currentGame) {
                  const currentGame = gameManager.currentGame;
                  const gameState = currentGame.state;
                  if (gameState === 'won' || gameState === 'lost') {
                    return true;
                  }
                }
              } else {
                // Try to access gameManager directly via eval (last resort)
                try {
                  const managerCheck = iframeWindow.eval('window.gameManager');
                  if (managerCheck) {
                    gameManager = managerCheck;
                    if (gameManager.currentGame) {
                      const currentGame = gameManager.currentGame;
                      const gameState = currentGame.state;
                      if (gameState === 'won' || gameState === 'lost') {
                        return true;
                      }
                    }
                  }
                } catch (e) {
                  // Cannot use eval to access gameManager (CSP restriction)
                }
              }
        }
      } catch (e) {
        // Error checking game state
      }
    } catch (e) {
      // Error checking game state
    }
    return false; // Default to not over
  }

  // Start monitoring game state and update images when game ends
  function startGameStateMonitoring() {
    // Clear existing interval if any
    if (gameStateCheckInterval) {
      clearInterval(gameStateCheckInterval);
      gameStateCheckInterval = null;
    }
    
    // Only monitor if we have character IDs stored
    if (!current_selected_gmbdids || !current_target_gmbdid) {
      return;
    }
    
    // For mine-finder game, set up observer to detect button clicks that restart the game
    // When .level button is clicked, button's active class changes, which triggers position update
    try {
      const rootContainer = document.getElementById('games-root-container');
      let gameFrame = null;
      if (rootContainer && rootContainer.shadowRoot) {
        gameFrame = rootContainer.shadowRoot.getElementById('games-iframe');
      }
      if (!gameFrame) {
        gameFrame = document.getElementById('games-iframe');
      }
      
      if (gameFrame && gameFrame.contentWindow) {
        const iframeDoc = gameFrame.contentDocument || gameFrame.contentWindow.document;
        if (iframeDoc) {
          // Check if this is mine-finder game by looking for .level element
          const levelElement = iframeDoc.querySelector('.level');
          if (levelElement) {
            // This is mine-finder game, observe for button class changes (active state)
            const levelButtons = levelElement.querySelectorAll('button');
            const container = document.getElementById('gmbdCircleContainer');
            
            if (levelButtons.length > 0 && container) {
              // Track previous active button to detect changes
              let previousActiveButton = null;
              let updatePositionTimeout = null;
              
              // Function to update position with retry mechanism
              const schedulePositionUpdate = () => {
                // Clear any pending update
                if (updatePositionTimeout) {
                  clearTimeout(updatePositionTimeout);
                }
                
                // Use multiple attempts to ensure position is updated after gamebox size changes
                const attemptUpdate = (attempt = 0, maxAttempts = 5) => {
                  const container = document.getElementById('gmbdCircleContainer');
                  if (!container) {
                    return;
                  }
                  
                  try {
                    const gamebox = iframeDoc.getElementById('gamebox');
                    if (gamebox) {
                      const gameboxRect = gamebox.getBoundingClientRect();
                      if (gameboxRect.height > 0 && gameboxRect.width > 0) {
                        // Gamebox has valid size, update position
                        updateFormationPosition();
                      } else if (attempt < maxAttempts) {
                        // Gamebox size not ready yet, retry
                        setTimeout(() => attemptUpdate(attempt + 1, maxAttempts), 100);
                      }
                    } else if (attempt < maxAttempts) {
                      // Gamebox not found yet, retry
                      setTimeout(() => attemptUpdate(attempt + 1, maxAttempts), 100);
                    }
                  } catch (e) {
                    // Error accessing gamebox, retry if attempts remain
                    if (attempt < maxAttempts) {
                      setTimeout(() => attemptUpdate(attempt + 1, maxAttempts), 100);
                    }
                  }
                };
                
                // Start update attempts with delays
                attemptUpdate(0);
                setTimeout(() => attemptUpdate(0), 200);
                setTimeout(() => attemptUpdate(0), 400);
                setTimeout(() => attemptUpdate(0), 600);
              };
              
              const buttonClickObserver = new MutationObserver(() => {
                // Find current active button
                let currentActiveButton = null;
                levelButtons.forEach(btn => {
                  if (btn.classList.contains('active')) {
                    currentActiveButton = btn;
                  }
                });
                
                // If active button changed, button was clicked - update position
                if (currentActiveButton !== previousActiveButton) {
                  previousActiveButton = currentActiveButton;
                  
                  // Button clicked, game restarted - update formation position based on current window size
                  schedulePositionUpdate();
                }
              });
              
              // Observe all buttons for class changes (active state)
              levelButtons.forEach(btn => {
                buttonClickObserver.observe(btn, { 
                  attributes: true, 
                  attributeFilter: ['class'] 
                });
              });
              
              // Use ResizeObserver to detect gamebox size changes (more reliable than MutationObserver)
              const gamebox = iframeDoc.getElementById('gamebox');
              if (gamebox && typeof ResizeObserver !== 'undefined') {
                const gameboxResizeObserver = new ResizeObserver(() => {
                  const container = document.getElementById('gmbdCircleContainer');
                  if (container) {
                    // Gamebox size changed, update formation position
                    schedulePositionUpdate();
                  }
                });
                
                // Observe gamebox for size changes
                gameboxResizeObserver.observe(gamebox);
              } else if (gamebox) {
                // Fallback: Use MutationObserver if ResizeObserver is not available
                const gameboxSizeObserver = new MutationObserver(() => {
                  const container = document.getElementById('gmbdCircleContainer');
                  if (container) {
                    // Gamebox size changed, update formation position
                    schedulePositionUpdate();
                  }
                });
                
                // Observe gamebox for style changes (width/height)
                gameboxSizeObserver.observe(gamebox, { 
                  attributes: true, 
                  attributeFilter: ['style'] 
                });
              }
            }
          }
        }
      }
    } catch (e) {
      // Error setting up observer, continue with normal monitoring
    }
    
    // Check game state every 500ms
    gameStateCheckInterval = setInterval(() => {
      const isOver = isGameOver();
      
      // If game state changed from not over to over, update images
      if (isOver && !lastGameOverState) {
        // Check if the game ended in a loss - only celebrate on win or ambiguous outcome
        const gameLost = isGameLost();
        
        if (!gameLost) {
          // Win or ambiguous outcome: start celebration (dance, hearts, music, GIF)
          startHeartAnimation();
          currentMusicFile = getRandomMusicFile();
          if (backgroundMusic) {
            backgroundMusic.pause();
            backgroundMusic = null;
            musicLoaded = false;
          }
          startBackgroundMusic();
          // Update to dynamic images (GIF dance) only on win/ambiguous
          if (current_selected_gmbdids && current_target_gmbdid) {
            // Restore saved animid if it was set when game restarted
            if (saved_animid !== null) {
              animid = saved_animid;
              const saved_animidx = gmbd_animateids.indexOf(saved_animid);
              if (saved_animidx !== -1) {
                animidx = saved_animidx;
              }
              saved_animid = null;
            } else {
              if (initial_animid !== null && typeof initial_animid !== 'undefined') {
                animid = initial_animid;
                const animidxInGmbd = gmbd_animateids.indexOf(initial_animid);
                if (animidxInGmbd !== -1) {
                  animidx = animidxInGmbd;
                } else {
                  const animidxInAnimateids = ANIMATEIDS.indexOf(initial_animid);
                  if (animidxInAnimateids !== -1) {
                    animidx = animidxInAnimateids;
                  }
                }
              } else if (typeof animid !== 'undefined' && animid !== null) {
                if (gmbd_animateids && animidx >= 0 && animidx < gmbd_animateids.length) {
                  animid = gmbd_animateids[animidx];
                }
              } else {
                if (gmbd_animateids && gmbd_animateids.length > 0) {
                  animidx = 0;
                  animid = gmbd_animateids[0];
                } else if (ANIMATEIDS && ANIMATEIDS.length > 0) {
                  animid = ANIMATEIDS[0];
                  animidx = 0;
                }
              }
            }
            
            const gmbdPaths = getCircleImgPaths(current_selected_gmbdids, current_target_gmbdid);
            displayGmbds(gmbdPaths);
          }
        }
        // On loss: no hearts, no music, no GIF dance - characters stay as static PNG
      } else if (!isOver && lastGameOverState) {
        // Game just restarted, stop heart animation
        stopHeartAnimation();
        // Game just restarted, stop background music
        stopBackgroundMusic();
        // Game just restarted, update animation and rearrange formation
        if (current_selected_gmbdids && current_target_gmbdid) {
          // 1. Update animation ID (animid) - increment current animid by 1
          // Keep live_gmbdid unchanged, only change animid
          const currentAnimid = animid;
          
          // Find current animid in ANIMATEIDS array
          const currentIndex = ANIMATEIDS.indexOf(currentAnimid);
          let newAnimid;
          
          if (currentIndex !== -1) {
            // Current animid found in ANIMATEIDS
            // Increment the animid value by 1
            const nextAnimidValue = currentAnimid + 1;
            const maxAnimidValue = ANIMATEIDS[ANIMATEIDS.length - 1];
            
            // If next value exceeds the maximum, wrap around to the first
            if (nextAnimidValue > maxAnimidValue) {
              newAnimid = ANIMATEIDS[0];
            } else {
              // Check if the incremented value exists in ANIMATEIDS
              if (ANIMATEIDS.includes(nextAnimidValue)) {
                newAnimid = nextAnimidValue;
              } else {
                // If incremented value doesn't exist, find the next available value
                const nextIndex = (currentIndex + 1) % ANIMATEIDS.length;
                newAnimid = ANIMATEIDS[nextIndex];
              }
            }
          } else {
            // Current animid not found in ANIMATEIDS, use first one
            newAnimid = ANIMATEIDS[0];
          }
          
          // Update animid and find corresponding animidx
          animid = newAnimid;
          // Find the index in gmbd_animateids (or use ANIMATEIDS index if not found)
          const newAnimidxInGmbd = gmbd_animateids.indexOf(newAnimid);
          if (newAnimidxInGmbd !== -1) {
            animidx = newAnimidxInGmbd;
          } else {
            // If not found in gmbd_animateids, find in ANIMATEIDS and update animidx accordingly
            const newAnimidxInAnimateids = ANIMATEIDS.indexOf(newAnimid);
            animidx = newAnimidxInAnimateids !== -1 ? newAnimidxInAnimateids : 0;
          }
          
          // Store the new animid to ensure it's used when game ends
          // This ensures the dynamic images use the new animation
          saved_animid = animid;
          // Clear initial_animid since we now have saved_animid for this round
          initial_animid = null;
          
          // 2. Update main_gmbdid to match current_target_gmbdid (for consistency)
          // This ensures the static button shows the correct character
          if (valid_gmbdids && valid_gmbdids.includes(current_target_gmbdid)) {
            main_gmbdidx = valid_gmbdids.indexOf(current_target_gmbdid);
            main_gmbdid = current_target_gmbdid;
          }
          
          // 3. Rearrange the positions of images in the formation (shuffle)
          // Keep the same characters but change their positions
          shuffleGmbdIds(current_selected_gmbdids);
          
          // 4. Update the static button image (gmbdBtn) - reflects the new state
          // Note: gmbdBtn shows static image (PNG), but we update it to reflect current state
          const gmbdBtn = document.getElementById('gmbdBtn');
          if (gmbdBtn && gmbdBtn.style.display !== 'none') {
            const btnImg = document.createElement('img');
            btnImg.src = buildGmbdPNG(main_gmbdid);
            gmbdBtn.innerHTML = '';
            gmbdBtn.appendChild(btnImg);
          }
          
          // 5. Update the character formation with new animation and rearranged positions
          // The new animid is stored in saved_animid and will be used when the game ends
          const gmbdPaths = getCircleImgPaths(current_selected_gmbdids, current_target_gmbdid);
          displayGmbds(gmbdPaths);
          
          // 6. Update formation position based on current game interface size
          // This ensures the formation is properly positioned when switching from dynamic to static images
          // For mine-finder game, also update position when button is clicked (game restarts)
          setTimeout(() => {
            updateFormationPosition();
          }, 100); // Small delay to ensure images are loaded
          
          // Additional update for mine-finder after a longer delay to ensure gamebox size is fully updated
          setTimeout(() => {
            updateFormationPosition();
          }, 300); // Longer delay to ensure gamebox size is updated after button click
          
          // Preload dynamic images when animation changes (game restarted)
          // This ensures dynamic images are ready when game ends
          if (current_selected_gmbdids && current_target_gmbdid && typeof animid !== 'undefined' && animid !== null) {
            preloadDynamicImages(current_selected_gmbdids, current_target_gmbdid);
          }
        }
      }
      
      lastGameOverState = isOver;
      
      // Stop monitoring if game overlay is closed
      const rootContainer = document.getElementById('games-root-container');
      if (!rootContainer || rootContainer.style.display === 'none') {
        stopGameStateMonitoring();
      }
    }, 500);
  }

  // Stop monitoring game state
  function stopGameStateMonitoring() {
    if (gameStateCheckInterval) {
      clearInterval(gameStateCheckInterval);
      gameStateCheckInterval = null;
    }
    // Stop heart animation when monitoring stops
    stopHeartAnimation();
    // Stop background music when monitoring stops
    stopBackgroundMusic();
    lastGameOverState = false;
    current_selected_gmbdids = null;
    current_target_gmbdid = null;
    // Don't clear initial_animid and saved_animid here - they should persist
    // initial_animid will be reset when opening game interface again
    // saved_animid will be cleared after being used when game ends
  }

  // Get gamebox position and dimensions relative to viewport
  function getGameboxRect() {
    try {
      const rootContainer = document.getElementById('games-root-container');
      let gameFrame = null;
      if (rootContainer && rootContainer.shadowRoot) {
        gameFrame = rootContainer.shadowRoot.getElementById('games-iframe');
      }
      if (!gameFrame) {
        gameFrame = document.getElementById('games-iframe');
      }
      
      if (!gameFrame || !gameFrame.contentWindow) {
        return null;
      }
      
      const iframeDoc = gameFrame.contentDocument || gameFrame.contentWindow.document;
      if (!iframeDoc) {
        return null;
      }
      
      const gamebox = iframeDoc.getElementById('gamebox');
      if (!gamebox) {
        return null;
      }
      
      // Get gamebox position relative to viewport
      // getBoundingClientRect() returns position relative to the viewport
      const gameboxRect = gamebox.getBoundingClientRect();
      
      return {
        left: gameboxRect.left,
        right: gameboxRect.right,
        top: gameboxRect.top,
        bottom: gameboxRect.bottom,
        width: gameboxRect.width,
        height: gameboxRect.height
      };
    } catch (e) {
      // Cross-origin error or other issues
      return null;
    }
  }

  // Start heart animation on both sides
  function startHeartAnimation() {
    // Stop any existing animation first
    stopHeartAnimation();
    
    // Get gamebox position and dimensions
    const gameboxRect = getGameboxRect();
    if (!gameboxRect) {
      // Retry after a short delay
      setTimeout(() => {
        startHeartAnimation();
      }, 500);
      return;
    }
    
    // Get games-right-game container to get its position
    // games-right-game is inside shadowRoot, so we need to access it through shadowRoot
    const rootContainer = document.getElementById('games-root-container');
    if (!rootContainer) {
      // Retry after a short delay
      setTimeout(() => {
        startHeartAnimation();
      }, 500);
      return;
    }
    
    let rightGame = null;
    if (rootContainer.shadowRoot) {
      rightGame = rootContainer.shadowRoot.getElementById('games-right-game');
    }
    if (!rightGame) {
      rightGame = document.getElementById('games-right-game');
    }
    
    if (!rightGame) {
      // Retry after a short delay
      setTimeout(() => {
        startHeartAnimation();
      }, 500);
      return;
    }
    
    const rightGameRect = rightGame.getBoundingClientRect();
    if (!rightGameRect || rightGameRect.width === 0 || rightGameRect.height === 0) {
      // Retry after a short delay
      setTimeout(() => {
        startHeartAnimation();
      }, 500);
      return;
    }
    
    // Create parent container as overlay (like gmbdOverlay)
    // Add to document.body (not shadowRoot) so it's accessible in page source
    let targetParent = document.body;
    
    // Create parent container - same as gmbdOverlay
    if (!heartAnimationParentContainer) {
      heartAnimationParentContainer = document.createElement('div');
      heartAnimationParentContainer.id = 'heart-animation-parent';
      // Reference gmbdOverlay: only set zIndex in JS, other styles in CSS
      heartAnimationParentContainer.style.zIndex = '2147483647'; // Same as gmbdOverlay
      
      // Append to document.body (same as gmbdOverlay)
      document.body.append(heartAnimationParentContainer);
    }
    
    // Show the container when game ends (same timing as dynamic images)
    heartAnimationParentContainer.style.display = 'block';
    
    // Calculate the gap between left and right containers
    // Gap = gamebox width + 20px
    const gap = gameboxRect.width + 20;
    
    // Each container width (100px for heart animation area)
    const containerWidth = 100;
    
    // Calculate positions based on gap spacer
    // gapSpacer width = gameboxRect.width, positioned at center
    // left container: 10px to the left of gapSpacer
    // right container: 10px to the right of gapSpacer
    const gapSpacerWidth = gameboxRect.width;
    const gapSpacerHeight = gameboxRect.height;
    const centerX = rightGameRect.left + rightGameRect.width / 2;
    const gapSpacerLeft = centerX - gapSpacerWidth / 2;
    const leftContainerLeft = gapSpacerLeft - containerWidth - 10;
    const rightContainerLeft = gapSpacerLeft + gapSpacerWidth + 10;
    
    // Create or update gap spacer - same as gmbdCircleContainer
    let gapSpacer = document.getElementById('heart-gap-spacer');
    if (!gapSpacer) {
      gapSpacer = document.createElement('div');
      gapSpacer.id = 'heart-gap-spacer';
      // Reference gmbdCircleContainer style
      gapSpacer.style.zIndex = '2147483647'; // Same as gmbdCircleContainer
      // Append to heart-animation-parent (same as gmbdCircleContainer is appended to gmbdOverlay)
      heartAnimationParentContainer.appendChild(gapSpacer);
    }
    
    // Update gap spacer position and dimensions - same as gmbdCircleContainer
    // gmbdCircleContainer: width = gameboxWidth, height = gameboxHeight, position = fixed
    gapSpacer.style.width = `${gapSpacerWidth}px`;
    gapSpacer.style.height = `${gapSpacerHeight}px`;
    
    // Position gapSpacer at gamebox center (like gmbdCircleContainer is positioned)
    // gmbdCircleContainer doesn't set left/top in JS, it's positioned via CSS transform
    // But we need to position it at gamebox center for our layout
    const gameboxCenterX = gameboxRect.left + gameboxRect.width / 2;
    const gameboxCenterY = gameboxRect.top + gameboxRect.height / 2;
    
    // Calculate container positions for bottom edge alignment
    // gapSpacer center Y = gameboxCenterY, so gapSpacer bottom = gameboxCenterY + gapSpacerHeight/2
    // For containers: container bottom = container top + gapSpacerHeight
    // We want: container bottom = gapSpacer bottom = gameboxCenterY + gapSpacerHeight/2
    // So: container top = gameboxCenterY + gapSpacerHeight/2 - gapSpacerHeight = gameboxCenterY - gapSpacerHeight/2
    const containerTop = gameboxCenterY - gapSpacerHeight / 2;
    
    // Create left container
    if (!heartAnimationLeftContainer) {
      heartAnimationLeftContainer = document.createElement('div');
      heartAnimationLeftContainer.id = 'heart-animation-left';
      heartAnimationLeftContainer.style.position = 'fixed'; // Fixed positioning like gapSpacer
      heartAnimationLeftContainer.style.pointerEvents = 'none';
      heartAnimationLeftContainer.style.backgroundColor = 'transparent';
      heartAnimationParentContainer.appendChild(heartAnimationLeftContainer);
    }
    // Update left container position and dimensions
    // left: calc(50% + 90px - (heart-gap-spacer 的宽度的一半) - 10px)
    // heart-gap-spacer 的宽度 = gapSpacerWidth = gameboxRect.width
    // So: left = calc(50% + 90px - (gapSpacerWidth / 2) - 10px)
    heartAnimationLeftContainer.style.width = containerWidth + 'px';
    heartAnimationLeftContainer.style.height = gapSpacerHeight + 'px';
    heartAnimationLeftContainer.style.left = `calc(50% + 90px - ${gapSpacerWidth / 2 + containerWidth / 2}px - 5px)`;
    
    // Create right container
    if (!heartAnimationRightContainer) {
      heartAnimationRightContainer = document.createElement('div');
      heartAnimationRightContainer.id = 'heart-animation-right';
      heartAnimationRightContainer.style.position = 'fixed'; // Fixed positioning like gapSpacer
      heartAnimationRightContainer.style.pointerEvents = 'none';
      heartAnimationRightContainer.style.backgroundColor = 'transparent';
      heartAnimationParentContainer.appendChild(heartAnimationRightContainer);
    }
    // Update right container position and dimensions
    // left: calc(50% + 90px + (heart-gap-spacer 的宽度的一半) + 10px)
    // heart-gap-spacer 的宽度 = gapSpacerWidth = gameboxRect.width
    // So: left = calc(50% + 90px + (gapSpacerWidth / 2) + 10px)
    heartAnimationRightContainer.style.width = containerWidth + 'px';
    heartAnimationRightContainer.style.height = gapSpacerHeight + 'px';
    heartAnimationRightContainer.style.left = `calc(50% + 90px + ${gapSpacerWidth / 2 + containerWidth / 2}px + 5px)`;
    
    // Start left side animation
    function createLeftHeart() {
      if (!heartAnimationLeftContainer || !heartAnimationParentContainer) {
        return;
      }
      
      // Get container position relative to viewport
      const containerRect = heartAnimationLeftContainer.getBoundingClientRect();
      
      // 1. 起始位置：图片的下边界与容器的下边界相同
      // 容器的 bottom = containerRect.bottom (相对于 viewport)
      // 图片的 bottom = 图片的 top + 图片的 height
      // 所以：图片的 top = 容器的 bottom - 图片的 height
      // 但图片的 height 是随机的 (40-80px)，所以我们需要在 createHeart 中计算
      // 这里传递容器的 bottom 作为起始位置
      const containerBottom = containerRect.bottom;
      
      // 2. 图片消失位置：图片的上边界大于等于容器的上边界时，图片消失
      // 容器的 top = containerRect.top (相对于 viewport)
      const containerTop = containerRect.top;
      
      // 3. x 坐标限制：在 heart-animation-left 中，使图片的右边界不超过容器的右边界
      // 图片的右边界 = x + size/2，容器的右边界 = containerWidth
      // 所以：x + size/2 <= containerWidth，即 x <= containerWidth - size/2
      // 同时，图片的左边界 = x - size/2 >= 0，即 x >= size/2
      // 由于 size 是随机的 (40-80px)，我们需要在 createHeart 中计算
      // 这里传递容器的宽度，让 createHeart 计算合适的 x 范围
      const maxSize = 80; // 最大图片尺寸
      const minX = 0; // 最小 x 坐标
      const maxX = containerWidth - maxSize / 2; // 最大 x 坐标（确保右边界不超出）
      // 生成一个随机的 x 坐标，但会在 createHeart 中根据实际 size 调整
      const x = minX + Math.random() * (maxX - minX);
      
      createHeart(heartAnimationLeftContainer, x, containerBottom, containerTop, containerWidth);
    }
    
    // Start right side animation
    function createRightHeart() {
      if (!heartAnimationRightContainer || !heartAnimationParentContainer) {
        return;
      }
      
      // Get container position relative to viewport
      const containerRect = heartAnimationRightContainer.getBoundingClientRect();
      
      // 1. 起始位置：图片的下边界与容器的下边界相同
      // 容器的 bottom = containerRect.bottom (相对于 viewport)
      // 图片的 bottom = 图片的 top + 图片的 height
      // 所以：图片的 top = 容器的 bottom - 图片的 height
      // 但图片的 height 是随机的 (40-80px)，所以我们需要在 createHeart 中计算
      // 这里传递容器的 bottom 作为起始位置
      const containerBottom = containerRect.bottom;
      
      // 2. 图片消失位置：图片的上边界大于等于容器的上边界时，图片消失
      // 容器的 top = containerRect.top (相对于 viewport)
      const containerTop = containerRect.top;
      
      // 3. x 坐标限制：在 heart-animation-right 中，使图片的左边界不超过容器的左边界
      // 图片的左边界 = x - size/2，容器的左边界 = 0
      // 所以：x - size/2 >= 0，即 x >= size/2
      // 同时，图片的右边界 = x + size/2 <= containerWidth，即 x <= containerWidth - size/2
      // 由于 size 是随机的 (40-80px)，我们需要在 createHeart 中计算
      // 这里传递容器的宽度，让 createHeart 计算合适的 x 范围
      const maxSize = 80; // 最大图片尺寸
      const minX = maxSize / 2; // 最小 x 坐标（确保左边界不超出）
      const maxX = containerWidth; // 最大 x 坐标
      // 生成一个随机的 x 坐标，但会在 createHeart 中根据实际 size 调整
      const x = minX + Math.random() * (maxX - minX);
      
      createHeart(heartAnimationRightContainer, x, containerBottom, containerTop, containerWidth);
    }
    
    // Schedule heart creation at random intervals
    function scheduleNextLeft() {
      const delay = 500 + Math.random() * 1500; // Random delay between 500ms and 2000ms
      heartAnimationLeftInterval = setTimeout(() => {
        createLeftHeart();
        scheduleNextLeft();
      }, delay);
    }
    
    function scheduleNextRight() {
      const delay = 500 + Math.random() * 1500; // Random delay between 500ms and 2000ms
      heartAnimationRightInterval = setTimeout(() => {
        createRightHeart();
        scheduleNextRight();
      }, delay);
    }
    
    // Start both animations
    scheduleNextLeft();
    scheduleNextRight();
  }

  // Stop heart animation
  function stopHeartAnimation() {
    // Clear intervals
    if (heartAnimationLeftInterval) {
      clearTimeout(heartAnimationLeftInterval);
      heartAnimationLeftInterval = null;
    }
    if (heartAnimationRightInterval) {
      clearTimeout(heartAnimationRightInterval);
      heartAnimationRightInterval = null;
    }
    
    // Hide container when game is not over (same timing as static images)
    if (heartAnimationParentContainer) {
      // Hide the container (same as gmbdOverlay.style.display = 'none')
      heartAnimationParentContainer.style.display = 'none';
      // Clear all heart elements
      if (heartAnimationLeftContainer) {
        heartAnimationLeftContainer.innerHTML = '';
      }
      if (heartAnimationRightContainer) {
        heartAnimationRightContainer.innerHTML = '';
      }
    }
  }

  // Create a single heart element and animate it
  function createHeart(container, startX, containerBottom, containerTop, containerWidth) {
    if (!container) {
      return;
    }
    
    // Random heart image
    const heartImage = heartImages[Math.floor(Math.random() * heartImages.length)];
    // Random size between 40-80px
    const size = 40 + Math.random() * 40;
    
    // Get container position relative to viewport (for relative positioning)
    const containerRect = container.getBoundingClientRect();
    
    // 1. 起始位置：图片的下边界与容器的下边界相同
    // 容器的 bottom = containerBottom (相对于 viewport)
    // 图片的 bottom = 图片的 top + 图片的 height (size)
    // 所以：图片的 top = 容器的 bottom - 图片的 height
    // 但图片是相对于容器定位的，所以需要转换为相对于容器的坐标
    // 容器的 bottom 相对于容器 = containerBottom - containerRect.top
    const containerBottomRelative = containerBottom - containerRect.top;
    const startTop = containerBottomRelative - size; // 图片的 top 相对于容器
    
    // Create heart element
    const heart = document.createElement('img');
    heart.src = chrome.runtime.getURL('images/' + heartImage);
    heart.style.position = 'absolute';
    heart.style.width = size + 'px';
    heart.style.height = size + 'px';
    heart.style.left = (startX - size / 2) + 'px';
    heart.style.top = startTop + 'px'; // 起始位置：图片的下边界与容器的下边界相同
    heart.style.transition = 'none';
    heart.style.opacity = '0.8';
    heart.style.pointerEvents = 'none';
    
    container.appendChild(heart);
    
    // Animate upward
    const speed = 1.5 + Math.random() * 1.0; // Random speed between 1.5 and 2.5 px per frame
    let currentY = startTop; // 相对于容器的 Y 坐标
    let animationId = null;
    
    // 容器的 top 相对于容器 = 0
    const containerTopRelative = 0;
    
    function animate() {
      currentY -= speed;
      heart.style.top = currentY + 'px';
      
      // 2. 图片消失位置：图片的上边界大于等于容器的上边界时，图片消失
      // 图片的 top = currentY (相对于容器)
      // 容器的 top = 0 (相对于容器)
      // 当 currentY <= 0 时，图片的上边界已经到达或超过容器的上边界
      if (currentY <= containerTopRelative) {
        // Heart has reached the top, remove it
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        heart.remove();
        return;
      }
      
      // Continue animation
      animationId = requestAnimationFrame(animate);
    }
    
    // Start animation
    animationId = requestAnimationFrame(animate);
  }

  function getCircleImgPaths(selected_gmbdids, live_gmbdid, forceStatic = false) {
    let gmbd_paths_cur = [];
    let gmbd_paths_next = [];
    
    // Check if game is over - only use GIF if game is over
    // If forceStatic is true, always use static images (PNG)
    const useGIF = forceStatic ? false : isGameOver();
    
    // Generate paths for all 12 characters
    // Use GIF if game is over, PNG otherwise
    let live_gmbdid_found = false;
    for (let i = 0; i < selected_gmbdids.length; i++) {
      let gmbd_id = selected_gmbdids[i];
      if (useGIF) {
        // Use GIF for dynamic images when game is over
        let gmbd_path_cn = buildGmbdGIF(gmbd_id, 'sub');
        gmbd_paths_cur.push(gmbd_path_cn[0]);
        gmbd_paths_next.push(gmbd_path_cn[1]);
      } else {
        // Use PNG for static images when game is not over
        let gmbd_path = buildGmbdPNG(gmbd_id);
        gmbd_paths_cur.push(gmbd_path);
        gmbd_paths_next.push(gmbd_path); // Same for next
      }
      if (String(gmbd_id) === String(live_gmbdid)) {
        live_gmbdid_found = true;
      }
    }
    // If live_gmbdid is not found in the paths, replace the first one
    if (!live_gmbdid_found && live_gmbdid) {
      if (useGIF) {
        let live_gmbd_path_cn = buildGmbdGIF(live_gmbdid, 'sub');
        gmbd_paths_cur[0] = live_gmbd_path_cn[0];
        gmbd_paths_next[0] = live_gmbd_path_cn[1];
      } else {
        let live_gmbd_path = buildGmbdPNG(live_gmbdid);
        gmbd_paths_cur[0] = live_gmbd_path;
        gmbd_paths_next[0] = live_gmbd_path;
      }
    }
    let gmbd_paths = {'cur': gmbd_paths_cur, 'next': gmbd_paths_next};
    return gmbd_paths;
  }

  function displayGmbds(gifPaths) {
    Promise.all(gifPaths['cur'].map(path => loadGif(path)))
      .then(images => {
        let count = 0;
        images.forEach(img => {
          let gmbdld = document.getElementById('gmbdld-' + (count++));
          if (gmbdld) {
            // Remove existing image if present
            const existingImg = gmbdld.querySelector('img');
            if (existingImg) {
              existingImg.remove();
            }
            // Append new image
            gmbdld.appendChild(img);
          }
        });
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            preloadGmbds(gifPaths['next']);
            
            // If currently displaying static images (PNG), preload corresponding dynamic images (GIF)
            // Check if current paths are PNG (static images)
            const isStaticImages = gifPaths['cur'].some(path => path.endsWith('.png'));
            
            // Dim dancers during gameplay, full vivid on game over celebration
            const container = document.getElementById('gmbdCircleContainer');
            if (container) {
              container.style.opacity = isStaticImages ? '0.35' : '1';
            }
            
            if (isStaticImages && current_selected_gmbdids && current_target_gmbdid) {
              // Preload dynamic images for faster switching when game ends
              preloadDynamicImages(current_selected_gmbdids, current_target_gmbdid);
              
              // Update formation position when switching to static images
              // This ensures the formation is properly positioned based on current game interface size
              updateFormationPosition();
            }
            
            // Schedule reveal (debounced — resets on any position update)
            scheduleDancerReveal();
          });
        });
      })
      .catch(error => {
        // Error loading GIFs
      });
  }
  
  // Preload dynamic images (GIF) corresponding to current static images (PNG)
  // This function uses the current global animid to generate GIF paths
  // It should be called whenever:
  // 1. Static images are displayed (so dynamic images are preloaded for game end)
  // 2. Animation changes (animid changes)
  // 3. Character formation changes (selected_gmbdids or live_gmbdid changes)
  function preloadDynamicImages(selected_gmbdids, live_gmbdid) {
    if (!selected_gmbdids || selected_gmbdids.length === 0) {
      return;
    }
    
    // Ensure animid is valid before generating paths
    if (typeof animid === 'undefined' || animid === null) {
      return;
    }
    
    // Generate GIF paths for all characters (same logic as getCircleImgPaths but force GIF)
    // buildGmbdGIF uses the current global animid, so it will use the updated animid
    let dynamic_paths_cur = [];
    let dynamic_paths_next = [];
    let live_gmbdid_found = false;
    
    for (let i = 0; i < selected_gmbdids.length; i++) {
      let gmbd_id = selected_gmbdids[i];
      // Force use GIF for dynamic images
      // buildGmbdGIF uses the current global animid variable
      let gmbd_path_cn = buildGmbdGIF(gmbd_id, 'sub');
      dynamic_paths_cur.push(gmbd_path_cn[0]);
      dynamic_paths_next.push(gmbd_path_cn[1]);
      
      if (String(gmbd_id) === String(live_gmbdid)) {
        live_gmbdid_found = true;
      }
    }
    
    // If live_gmbdid is not found in the paths, replace the first one
    if (!live_gmbdid_found && live_gmbdid) {
      let live_gmbd_path_cn = buildGmbdGIF(live_gmbdid, 'sub');
      dynamic_paths_cur[0] = live_gmbd_path_cn[0];
      dynamic_paths_next[0] = live_gmbd_path_cn[1];
    }
    
    // Preload both current and next dynamic images
    preloadGmbds(dynamic_paths_cur);
    preloadGmbds(dynamic_paths_next);
  }

  function preloadGmbds(imgsrcs) {
    imgsrcs.forEach(imgsrc => {
      const img = new Image();
      img.src = imgsrc;
    });
  }

  function loadGif(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // Mouse drag functionality for gmbdLive button
  var startX, startY;
  var offsetX, offsetY;
  var isDragging = false;
  const onMouseMove = (e) => {
    if (isDragging) {
      gmbdLive.style.left = `${e.clientX - offsetX}px`;
      gmbdLive.style.top = `${e.clientY - offsetY}px`;
    }
  };
  function mouseDownHandler(e) {
    if (e.button === 0) {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      offsetX = e.clientX - gmbdLive.offsetLeft;
      offsetY = e.clientY - gmbdLive.offsetTop;
      document.addEventListener('mousemove', onMouseMove);
    }
  }
  gmbdLive.addEventListener('mousedown', mouseDownHandler);
  function mouseUpHandler(e) {
    if (isDragging) {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      const endX = e.clientX;
      const endY = e.clientY;
      const diffX = Math.abs(endX - startX);
      const diffY = Math.abs(endY - startY);
      if (diffX == 0 && diffY == 0) {
        displayGmbdOverlay();
        // Try to play music on user interaction (for autoplay policy)
        tryPlayMusicOnInteraction();
      }
      gmbdLive.position = 'fixed';
    }
  }
  gmbdLive.addEventListener('mouseup', mouseUpHandler);

  // Tooltip for gmbdLive button
  const gmbdLiveTooltip = document.createElement('div');
  gmbdLiveTooltip.id = 'gmbdLiveTooltip';
  gmbdLiveTooltip.textContent = 'Click, play game';
  gmbdLiveTooltip.style.cssText = `
    position: fixed;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    font-family: Arial, sans-serif;
    pointer-events: none;
    z-index: 2147483648;
    display: none;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  `;
  document.body.appendChild(gmbdLiveTooltip);

  // Show tooltip on mouseenter (only when game overlay is not open)
  gmbdLive.addEventListener('mouseenter', function(e) {
    // Check if game overlay is not open
    if (root && root.style.display === 'none') {
      const rect = gmbdLive.getBoundingClientRect();
      gmbdLiveTooltip.style.display = 'block';
      // Position tooltip above the gmbdLive button
      gmbdLiveTooltip.style.left = `${rect.left + rect.width / 2}px`;
      gmbdLiveTooltip.style.top = `${rect.top - 10}px`;
      gmbdLiveTooltip.style.transform = 'translate(-50%, -100%)';
    }
  });

  // Hide tooltip on mouseleave
  gmbdLive.addEventListener('mouseleave', function(e) {
    gmbdLiveTooltip.style.display = 'none';
  });

  // Listen to storage changes for gamesLiveState
  chrome.storage.onChanged.addListener(function(changes, areaName) {
    if (changes.gamesLiveState) {
      const newValue = changes.gamesLiveState.newValue;
      const oldValue = changes.gamesLiveState.oldValue;
      // Only update if value actually changed
      if (newValue !== oldValue) {
        displayGmbdLive(newValue !== undefined ? newValue : 'on');
      }
    }
  });

  function displayGmbdLive(state) {
    if (state === 'on') {
      gmbdLive.style.display = 'block';
    } else {
      // Hide all character-related elements
      gmbdLive.style.display = 'none';
      gmbdOverlay.style.display = 'none';
      gmbdBtn.style.display = 'none';
      gmbdExit.style.display = 'none';
      clearExistFormation();
      // Also close games overlay if it exists
      if (root) {
        root.style.display = 'none';
        // Call teardown to clean up event listeners
        try {
          if (window.__gamesKeyboardHandler) {
            window.removeEventListener('keydown', window.__gamesKeyboardHandler, true);
            window.__gamesKeyboardHandler = null;
          }
        } catch (e) {
          // Ignore errors
        }
      }
    }
  }

  // Initialize character data
  chrome.storage.local.get(null, function(result) {
    // Initialize gmbdParams if not exists (fallback)
    if (!result.gmbdParams || !result.gmbdParams.gmbdids) {
      const gmbdids = Array.from({ length: 1000 }, (v, k) => k + 1);
      const shuffled = [...gmbdids].sort(() => 0.5 - Math.random());
      const selectedGmbdids = shuffled.slice(0, 12);
      result.gmbdParams = { 'addgmbd': 12, 'gmbdids': selectedGmbdids };
      chrome.storage.local.set({ 'gmbdParams': result.gmbdParams });
    }
    
    if (result.gmbdParams && result.gmbdParams.gmbdids) {
      const gmbdids = Array.from({ length: 1000 }, (v, k) => k + 1);
      const shuffled = [...gmbdids].sort(() => 0.5 - Math.random());
      const selectedGmbdids = shuffled.slice(0, 12);
      result.gmbdParams = { 'addgmbd': 12, 'gmbdids': selectedGmbdids };
      chrome.storage.local.set({ 'gmbdParams': result.gmbdParams });
      valid_gmbdids = result.gmbdParams.gmbdids;
      shuffleGmbdIds(valid_gmbdids);
      live_gmbdid = valid_gmbdids[0];
      main_gmbdidx = 0; animidx = 0;
      main_gmbdid = valid_gmbdids[main_gmbdidx];
      animid = gmbd_animateids[animidx];
      gmbdLiveImg.src = buildGmbdGIFLive(live_gmbdid, 'sub');
      // Always check gamesLiveState, default to 'on' if undefined
      const liveState = result.gamesLiveState !== undefined ? result.gamesLiveState : 'on';
      displayGmbdLive(liveState);
    }
  });

  // Game menu configuration
  const gameMenu = [
    { name: 'Maze', folder: null, isCategory: true },
    { name: 'Level Maze', folder: 'level-maze' },
    { name: 'Blocker Maze', folder: 'blocker-maze' },
    { name: 'Barcode Maze', folder: 'barcode-maze' },
    { name: 'Drag Maze', folder: 'drag-maze' },
    { name: 'Drag Maze Pro', folder: 'drag-maze-pro' },
    { name: 'Drag Maze Block', folder: 'drag-maze-blocker' },
    { name: 'Drag Maze Door', folder: 'drag-maze-door' },
    { name: 'Snake', folder: null, isCategory: true },
    { name: 'Classic Snake', folder: 'classic-snake' },
    { name: 'Apple Snake', folder: 'apple-snake' },
    { name: 'Puppy Snake', folder: 'puppy-snake' },
    { name: 'Number Snake', folder: 'number-snake' },
    { name: 'Snake vs Block', folder: 'snake-vs-block' },
    { name: 'Color Snake', folder: 'color-snake' },
    { name: 'Matching', folder: null, isCategory: true },
    { name: '2048 Game', folder: '2048-game' },
    { name: 'Letter Swap', folder: 'letter-swap' },
    { name: 'Memory Card', folder: 'memory-card' },
    { name: 'Puzzle', folder: null, isCategory: true },
    { name: 'Mine Finder', folder: 'mine-finder' },
    { name: 'Word Search', folder: 'word-search' },
    { name: 'Word Scramble', folder: 'word-scramble' },
  ];

  // ----- Root + Shadow -----
  const root = document.createElement('div');
  root.id = 'games-root-container';
  root.style.display = 'none'; // Initially hidden, shown when clicking gmbdLive
  // Append to body instead of documentElement to be in same stacking context as character animations
  if (!document.body) {
    // Body not ready yet, bail out and let the script re-inject on next navigation
    return;
  }
  document.body.appendChild(root);
  const shadow = root.attachShadow({ mode: 'open' });

  // Load CSS INSIDE the shadow
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('css/content.css');

  // Main container with left menu and right game area
  const container = document.createElement('div');
  container.id = 'games-container';

  // Left menu
  const leftMenu = document.createElement('div');
  leftMenu.id = 'games-left-menu';
  const menuList = document.createElement('ul');
  menuList.id = 'games-menu-list';

  // Helper function to get icon URL for a game
  function getGameIconUrl(folder) {
    if (!folder) return null;
    return chrome.runtime.getURL(`images/icons/${folder}.png`);
  }

  let firstGameItem = null;
  gameMenu.forEach((item, index) => {
    const li = document.createElement('li');
    if (item.isCategory) {
      li.className = 'games-menu-category';
      li.textContent = item.name;
    } else {
      li.className = 'games-menu-item';
      
      // Create icon element
      const iconUrl = getGameIconUrl(item.folder);
      if (iconUrl) {
        const icon = document.createElement('img');
        icon.className = 'games-menu-icon';
        icon.src = iconUrl;
        icon.alt = '';
        li.appendChild(icon);
      }
      
      // Add text content
      const textSpan = document.createElement('span');
      textSpan.textContent = item.name;
      li.appendChild(textSpan);
      
      li.dataset.folder = item.folder;
      li.addEventListener('click', () => selectGame(item.folder, li));
      // Mark first game as active
      if (!firstGameItem) {
        firstGameItem = li;
        li.classList.add('active');
      }
    }
    menuList.appendChild(li);
  });

  leftMenu.appendChild(menuList);

  // Right game area
  const rightGame = document.createElement('div');
  rightGame.id = 'games-right-game';
  rightGame.className = 'container-single';
  rightGame.setAttribute('tabindex', '0'); // Make it focusable
  const gameFrame = document.createElement('iframe');
  gameFrame.id = 'games-iframe';
  // No sandbox needed - games are loaded from extension's own resources (trusted content)
  gameFrame.setAttribute('tabindex', '0'); // Make iframe focusable
  rightGame.appendChild(gameFrame);

  container.appendChild(leftMenu);
  container.appendChild(rightGame);

  // Sound control button (in shadow DOM, top-right corner)
  const soundControlBtn = document.createElement('button');
  soundControlBtn.id = 'games-sound-control';
  soundControlBtn.style.cssText = `
    position: fixed;
    top: 26px;
    right: 80px;
    width: 30px;
    height: 30px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    cursor: pointer;
    padding: 5px;
    z-index: 2147483648;
    pointer-events: auto;
    display: none;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-sizing: border-box;
  `;
  soundControlBtn.setAttribute('aria-label', 'Toggle sound');
  
  const soundControlImg = document.createElement('img');
  soundControlImg.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: brightness(0) invert(1);
    opacity: 0.7;
  `;
  soundControlImg.src = chrome.runtime.getURL('images/unmute.png');
  soundControlImg.alt = 'Sound on';
  soundControlBtn.appendChild(soundControlImg);
  
  // Update sound control icon based on state
  function updateSoundControlIcon() {
    if (soundControlImg) {
      if (musicEnabled) {
        soundControlImg.src = chrome.runtime.getURL('images/unmute.png');
        soundControlImg.alt = 'Sound on';
      } else {
        soundControlImg.src = chrome.runtime.getURL('images/mute.png');
        soundControlImg.alt = 'Sound off';
      }
    }
  }
  
  // Sound control click handler
  soundControlBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    musicEnabled = !musicEnabled;
    updateSoundControlIcon();
    
    if (musicEnabled) {
      // If music should be playing (game over state), start/resume it
      if (musicShouldPlay) {
        // If music is already loaded and ready, try to play immediately
        if (backgroundMusic && musicLoaded) {
          tryPlayMusicOnInteraction();
        } else if (backgroundMusic && !musicLoaded) {
          // Music is initializing but not loaded yet, wait for it to load then play
          // Add a one-time listener for when music loads
          const onMusicLoaded = function() {
            backgroundMusic.removeEventListener('loadeddata', onMusicLoaded);
            backgroundMusic.removeEventListener('canplaythrough', onMusicLoaded);
            if (musicEnabled && musicShouldPlay) {
              tryPlayMusicOnInteraction();
            }
          };
          backgroundMusic.addEventListener('loadeddata', onMusicLoaded);
          backgroundMusic.addEventListener('canplaythrough', onMusicLoaded);
          // Also try to start it (in case it's not loading)
          startBackgroundMusic();
        } else {
          // If music is not initialized yet, start it (will load and play)
          startBackgroundMusic();
        }
      }
    } else {
      // Pause music if playing
      if (backgroundMusic && !backgroundMusic.paused) {
        backgroundMusic.pause();
      }
    }
  });
  
  // Add sound control button to shadow DOM
  shadow.appendChild(soundControlBtn);

  // Loading banner
  let waitBanner = null;
  const ensureBanner = (msg) => {
    if (waitBanner?.isConnected) {
      if (msg) waitBanner.textContent = msg;
      return waitBanner;
    }
    waitBanner = document.createElement('div');
    waitBanner.id = 'games-wait';
    waitBanner.textContent = msg || 'Loading game...';
    shadow.appendChild(waitBanner);
    return waitBanner;
  };
  const hideBanner = () => {
    if (waitBanner?.isConnected) waitBanner.remove();
  };

  // Attach elements
  shadow.append(link, container);

  // Current game state
  let currentGame = null;

  // Load game function
  async function loadGame(folder) {
    if (!folder) return;
    
    ensureBanner('Loading game...');
    
    try {
      const baseUrl = chrome.runtime.getURL(`games/${folder}/`);
      const releasesBaseUrl = chrome.runtime.getURL('games/');
      
      // Try to load the game HTML file (converted from PHP)
      const htmlUrl = chrome.runtime.getURL(`games/${folder}.html`);
      
      const response = await fetch(htmlUrl);
      if (!response.ok) {
        throw new Error(`Game file not found: ${folder}.html`);
      }
      
      let html = await response.text();
      
      // Replace paths to use chrome-extension:// URLs
      // Replace /releases/css/ with games/css/
      html = html.replace(/href="\/releases\/css\//g, `href="${releasesBaseUrl}css/`);
      html = html.replace(/href='\/releases\/css\//g, `href='${releasesBaseUrl}css/`);
      
      // Replace /releases/js/ with games/js/ - but preserve script order
      // We need to ensure path replacement script runs before game scripts
      html = html.replace(/src="\/releases\/js\//g, `src="${releasesBaseUrl}js/`);
      html = html.replace(/src='\/releases\/js\//g, `src='${releasesBaseUrl}js/`);
      
      // Replace /releases/images/ with games/images/
      html = html.replace(/src="\/releases\/images\//g, `src="${releasesBaseUrl}images/`);
      html = html.replace(/src='\/releases\/images\//g, `src='${releasesBaseUrl}images/`);
      
      // Replace /releases/data/ with games/data/
      html = html.replace(/\/releases\/data\//g, `${releasesBaseUrl}data/`);
      
      // Replace /releases/ in CSS url() paths
      html = html.replace(/url\(['"]?\/releases\/([^'")]+)['"]?\)/gi, (match, path) => {
        return `url('${releasesBaseUrl}${path}')`;
      });
      
      // Check if jQuery is needed by checking the game's JS file
      let needsJQuery = false;
      try {
        const jsUrl = chrome.runtime.getURL(`games/js/${folder}.js`);
        const jsResponse = await fetch(jsUrl);
        if (jsResponse.ok) {
          const jsContent = await jsResponse.text();
          // Check if JS file uses jQuery
          needsJQuery = jsContent.includes('jQuery') || 
                        jsContent.includes('(function($)') ||
                        jsContent.match(/\(function\s*\(\$\)/);
        }
      } catch (e) {
        // If can't check JS file, check HTML for jQuery usage
        needsJQuery = html.includes('jQuery') || html.includes('$(') || 
                      html.match(/\(function\s*\(\$\)/);
      }
      
      // Create path replacement script to fix /releases/ paths in JavaScript
      // This must run before any game scripts - use immediate execution
      // Use non-defer, non-async script to ensure synchronous execution
      // CRITICAL: This script must execute IMMEDIATELY and SYNCHRONOUSLY
      // Use external script file to avoid CSP issues with inline scripts
      // Note: baseUrl will be set after script loads via direct window access (in onload handler)
      const pathReplacementScriptUrl = chrome.runtime.getURL('js/path-replacement.js');
      const pathReplacementScript = `<script type="text/javascript" src="${pathReplacementScriptUrl}"></script>`;
      
      // Create storage proxy script to enable chrome.storage access from iframe
      const storageProxyScriptUrl = chrome.runtime.getURL('js/storage-proxy.js');
      const storageProxyScript = `<script type="text/javascript" src="${storageProxyScriptUrl}"></script>`;
      
      // Create how-to-play script for help overlay
      const howToPlayScriptUrl = chrome.runtime.getURL('js/how-to-play.js');
      const howToPlayScript = `<script type="text/javascript" src="${howToPlayScriptUrl}" defer></script>`;
      
      // Alternative: Use inline script (may be blocked by CSP)
      const pathReplacementScriptInline = `<script type="text/javascript">
(function() {
  'use strict';
  try {
    // Execute immediately - no waiting for DOM
    const baseUrl = '${releasesBaseUrl}';
    
    
    // Helper function to replace /releases/ paths and relative paths in URLs
    function replaceReleasesPath(url) {
      if (typeof url === 'string') {
        if (url.startsWith('/releases/')) {
          const newUrl = baseUrl + url.substring('/releases/'.length);
          return newUrl;
        }
        // Also handle relative paths that might be resolved incorrectly
        if (url.startsWith('./releases/')) {
          const newUrl = baseUrl + url.substring('./releases/'.length);
          return newUrl;
        }
        // Handle relative paths starting with ../
        if (url.startsWith('../')) {
          const cleanPath = url.substring('../'.length);
          const newUrl = baseUrl + cleanPath;
          return newUrl;
        }
        // Handle relative paths starting with ./
        if (url.startsWith('./')) {
          const cleanPath = url.substring('./'.length);
          const newUrl = baseUrl + cleanPath;
          return newUrl;
        }
      }
      return url;
    }
    
    // CRITICAL: Set __gameResourceBase FIRST, before any game scripts can check it
    // This must be done synchronously and immediately
    try {
    // Try to define it as non-configurable and non-writable
    Object.defineProperty(window, '__gameResourceBase', {
      value: baseUrl,
      writable: false,
      configurable: false,
      enumerable: true
    });
  } catch (e) {
    // If defineProperty fails (e.g., property already exists), try to override it
    try {
      delete window.__gameResourceBase;
      Object.defineProperty(window, '__gameResourceBase', {
        value: baseUrl,
        writable: false,
        configurable: false,
        enumerable: true
      });
    } catch (e2) {
      // Last resort: direct assignment
      window.__gameResourceBase = baseUrl;
    }
    }
    
    // Override window.getGameResource to return absolute chrome-extension URLs
    // This must be done before any game scripts execute
    // Use a wrapper that will always return the correct URL
    const createGetGameResource = function() {
    return function(relativePath) {
      if (relativePath.startsWith('http') || relativePath.startsWith('chrome-extension')) {
        return relativePath;
      }
      // Remove leading ../ or ./ if present
      const cleanPath = relativePath.replace(/^\.\.?\//, '');
      // Always use baseUrl directly, don't rely on __gameResourceBase
      const fullUrl = baseUrl + cleanPath;
      return fullUrl;
    };
    };
    
    // Try to define it as non-configurable first
    try {
      // Delete existing property if it exists
      if (window.hasOwnProperty('getGameResource')) {
        delete window.getGameResource;
      }
      Object.defineProperty(window, 'getGameResource', {
        value: createGetGameResource(),
        writable: false,
        configurable: false,
        enumerable: true
      });
    } catch (e) {
      // Fallback: direct assignment
      window.getGameResource = createGetGameResource();
    }
    
    // Re-override getGameResource and __gameResourceBase multiple times to catch any game script overrides
    // Use multiple timeouts to ensure we catch it
    [10, 50, 100, 200, 500].forEach(function(delay) {
    setTimeout(function() {
      try {
        // Re-set __gameResourceBase
        if (window.__gameResourceBase !== baseUrl) {
          try {
            delete window.__gameResourceBase;
            Object.defineProperty(window, '__gameResourceBase', {
              value: baseUrl,
              writable: false,
              configurable: false,
              enumerable: true
            });
          } catch (e) {
            window.__gameResourceBase = baseUrl;
          }
        }
        // Re-set getGameResource
        try {
          delete window.getGameResource;
          Object.defineProperty(window, 'getGameResource', {
            value: createGetGameResource(),
            writable: false,
            configurable: false,
            enumerable: true
          });
        } catch (e) {
          window.getGameResource = createGetGameResource();
        }
      } catch (e) {
        // Failed to re-override
      }
    }, delay);
    });
    
    // Also use MutationObserver to catch when scripts are added
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.addedNodes.length > 0) {
            // Check if any script was added
            mutation.addedNodes.forEach(function(node) {
              if (node.tagName === 'SCRIPT') {
                setTimeout(function() {
                  try {
                    if (window.__gameResourceBase !== baseUrl) {
                      window.__gameResourceBase = baseUrl;
                    }
                    window.getGameResource = createGetGameResource();
                  } catch (e) {
                    // Failed to re-override
                  }
                }, 10);
              }
            });
          }
        });
      });
      observer.observe(document.head, { childList: true, subtree: true });
      observer.observe(document.body, { childList: true, subtree: true });
    }
    
    // CRITICAL: Override fetch IMMEDIATELY, before any other scripts can use it
    // Store original fetch before any scripts can override it
    if (!window.__originalFetch) {
      window.__originalFetch = window.fetch;
    }
    const originalFetch = window.__originalFetch;
    
    // Verify fetch is available
    if (typeof originalFetch === 'undefined') {
      return;
    }
    
    // Helper function to convert any URL to absolute chrome-extension URL
    function convertToAbsoluteUrl(url) {
      if (!url || typeof url !== 'string') {
        return url;
      }
      
      // Already absolute URLs (http, https, chrome-extension, data, blob)
      if (url.startsWith('http://') || url.startsWith('https://') || 
          url.startsWith('chrome-extension://') || url.startsWith('data:') || 
          url.startsWith('blob:')) {
        return url;
      }
      
      // Try to parse as URL to check if it's absolute
      try {
        new URL(url);
        // If no error, it's already absolute
        return url;
      } catch (e) {
        // Not absolute, need to convert
      }
      
      // Handle /releases/ paths
      if (url.startsWith('/releases/')) {
        return baseUrl + url.substring('/releases/'.length);
      }
      
      // Handle ./releases/ paths
      if (url.startsWith('./releases/')) {
        return baseUrl + url.substring('./releases/'.length);
      }
      
      // Handle relative paths starting with ../
      if (url.startsWith('../')) {
        // Remove all leading ../ and ./
        let cleanPath = url.replace(/^(\.\.\/)+/, '');
        return baseUrl + cleanPath;
      }
      
      // Handle relative paths starting with ./
      if (url.startsWith('./')) {
        return baseUrl + url.substring('./'.length);
      }
      
      // Handle absolute paths starting with /
      if (url.startsWith('/')) {
        // Remove leading / and use baseUrl
        return baseUrl + url.substring(1);
      }
      
      // Everything else is treated as relative to baseUrl
      return baseUrl + url;
    }
    
    // Create a wrapper function that will always replace paths
    const fetchWrapper = function(input, init) {
      try {
        // Handle string URL
        if (typeof input === 'string') {
          const originalUrl = input;
          let newUrl = convertToAbsoluteUrl(input);
          
          // Validate the final URL
          try {
            const testUrl = new URL(newUrl);
            // Ensure it's a valid protocol
            if (testUrl.protocol === 'chrome-extension:' || 
                testUrl.protocol === 'http:' || 
                testUrl.protocol === 'https:' ||
                testUrl.protocol === 'data:' ||
                testUrl.protocol === 'blob:') {
              return originalFetch.call(this, newUrl, init);
            } else {
              throw new Error('Invalid URL protocol: ' + testUrl.protocol);
            }
          } catch (e) {
            // If URL parsing fails, try one more conversion
            // Remove any remaining relative path indicators
            let cleanPath = originalUrl.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');
            newUrl = baseUrl + cleanPath;
            return originalFetch.call(this, newUrl, init);
          }
        }
        // Handle Request object
        else if (input && typeof input === 'object') {
          // Check if it's a Request object
          if (input instanceof Request || ('url' in input && 'method' in input)) {
            const url = input.url || (input instanceof Request ? input.url : '');
            if (typeof url === 'string') {
              const newUrl = convertToAbsoluteUrl(url);
              if (newUrl !== url) {
                // Create new Request with replaced URL
                try {
                  const newRequest = new Request(newUrl, {
                    method: input.method || 'GET',
                    headers: input.headers,
                    body: input.body,
                    mode: input.mode,
                    credentials: input.credentials,
                    cache: input.cache,
                    redirect: input.redirect,
                    referrer: input.referrer,
                    referrerPolicy: input.referrerPolicy,
                    integrity: input.integrity
                  });
                  return originalFetch.call(this, newRequest, init);
                } catch (reqErr) {
                  // Fallback: just use the new URL as string
                  return originalFetch.call(this, newUrl, init);
                }
              }
            }
            // If URL is already absolute, pass through
            return originalFetch.call(this, input, init);
          }
          // For other objects, pass through
          return originalFetch.call(this, input, init);
        }
        
        // For all other cases, pass through
        return originalFetch.call(this, input, init);
      } catch (error) {
        // Fallback: try to convert input to string and retry
        if (typeof input === 'string') {
          try {
            const fallbackUrl = convertToAbsoluteUrl(input);
            return originalFetch.call(this, fallbackUrl, init);
          } catch (e) {
            // Fallback conversion failed
          }
        }
        // Last resort: use original fetch
        return originalFetch.call(this, input, init);
      }
    };
    
    // Override window.fetch immediately and synchronously
    // Use Object.defineProperty to ensure it can't be easily overridden
    try {
      Object.defineProperty(window, 'fetch', {
        value: fetchWrapper,
        writable: true,  // Allow overwrite but we'll re-override it
        configurable: true,
        enumerable: true
      });
    } catch (e) {
      // Fallback: direct assignment
      window.fetch = fetchWrapper;
    }
    
    // Also ensure it's available on the global scope
    if (typeof globalThis !== 'undefined') {
      globalThis.fetch = fetchWrapper;
    }
    
    // Verify fetch was overridden
    if (window.fetch !== fetchWrapper) {
      // Fetch override failed, but continue anyway
    }
    
    // Re-override fetch multiple times to catch any game script overrides
    [10, 50, 100, 200].forEach(function(delay) {
      setTimeout(function() {
        try {
          if (window.fetch !== fetchWrapper) {
            window.fetch = fetchWrapper;
            if (typeof globalThis !== 'undefined') {
              globalThis.fetch = fetchWrapper;
            }
          }
        } catch (e) {
          // Failed to re-override fetch
        }
      }, delay);
    });
    
    // Also override XMLHttpRequest for compatibility
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      if (typeof url === 'string') {
        url = replaceReleasesPath(url);
      }
      return originalXHROpen.apply(this, [method, url, ...args]);
    };
    
    // Wait for jQuery to load, then override .css() method to handle background-image URLs
    function setupJQueryPathReplacement() {
      if (typeof jQuery !== 'undefined' && jQuery.fn && !jQuery.fn.css._pathReplaced) {
        // Override jQuery's .css() method to replace /releases/ paths in background-image
        const originalCss = jQuery.fn.css;
        jQuery.fn.css = function(prop, value) {
          // If setting background-image with /releases/ path, replace it
          if (typeof prop === 'string' && prop.toLowerCase() === 'background-image' && typeof value === 'string') {
            // Replace url(/releases/...) with correct path - handle both quoted and unquoted
            value = value.replace(/url\(['"]?\/releases\/([^'")]+)['"]?\)/gi, function(match, path) {
              return 'url(' + baseUrl + path + ')';
            });
            return originalCss.call(this, prop, value);
          }
          // If passing an object with background-image
          else if (typeof prop === 'object' && prop !== null && !value) {
            const newProp = {};
            for (const key in prop) {
              if (key.toLowerCase() === 'background-image' && typeof prop[key] === 'string') {
                newProp[key] = prop[key].replace(/url\(['"]?\/releases\/([^'")]+)['"]?\)/gi, function(match, path) {
                  return 'url(' + baseUrl + path + ')';
                });
              } else {
                newProp[key] = prop[key];
              }
            }
            return originalCss.call(this, newProp);
          }
          return originalCss.apply(this, arguments);
        };
        jQuery.fn.css._pathReplaced = true; // Mark as replaced to avoid double replacement
      } else if (typeof jQuery === 'undefined') {
        // jQuery not loaded yet, try again later
        setTimeout(setupJQueryPathReplacement, 50);
      }
    }
    
    // Start trying to setup jQuery path replacement immediately and on DOM ready
    setupJQueryPathReplacement();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupJQueryPathReplacement);
    }
    
    // Also handle direct style manipulation
    const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
    CSSStyleDeclaration.prototype.setProperty = function(property, value, priority) {
      if (property.toLowerCase() === 'background-image' && typeof value === 'string' && value.includes('/releases/')) {
        value = value.replace(/url\(['"]?\/releases\/([^'")]+)['"]?\)/g, function(match, path) {
          return 'url(' + baseUrl + path + ')';
        });
      }
      return originalSetProperty.call(this, property, value, priority);
    };
    
    // Also override style.backgroundImage setter
    const styleDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'style') || 
                            Object.getOwnPropertyDescriptor(Element.prototype, 'style');
    if (styleDescriptor && styleDescriptor.get) {
      const originalStyleGetter = styleDescriptor.get;
      Object.defineProperty(HTMLElement.prototype, 'style', {
        get: function() {
          const style = originalStyleGetter.call(this);
          const originalBackgroundImageSetter = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'backgroundImage').set;
          Object.defineProperty(style, 'backgroundImage', {
            set: function(value) {
              if (typeof value === 'string' && value.includes('/releases/')) {
                value = value.replace(/url\(['"]?\/releases\/([^'")]+)['"]?\)/g, function(match, path) {
                  return 'url(' + baseUrl + path + ')';
                });
              }
              return originalBackgroundImageSetter.call(this, value);
            },
            get: Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'backgroundImage').get,
            configurable: true,
            enumerable: true
          });
          return style;
        },
        configurable: true,
        enumerable: true
      });
    }
  } catch (error) {
    // Re-throw to prevent silent failures
    throw error;
  }
})();
</script>`;

      // Wrap in full HTML document if needed
      if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
        const jqueryScript = needsJQuery 
          ? '<script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"></script>'
          : '';
        
        // Ensure path replacement script is executed before any other scripts
        // Move all <script> tags from body to after path replacement in head
        // Match both inline scripts and external scripts (with or without closing tag)
        const scriptMatches = [];
        const scriptRegex = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
        let match;
        while ((match = scriptRegex.exec(html)) !== null) {
          scriptMatches.push(match[0]);
        }
        // Also match self-closing script tags (though rare)
        const selfClosingScriptRegex = /<script([^>]*)\s*\/>/gi;
        while ((match = selfClosingScriptRegex.exec(html)) !== null) {
          if (!scriptMatches.includes(match[0])) {
            scriptMatches.push(match[0]);
          }
        }
        const htmlWithoutScripts = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<script[^>]*\s*\/>/gi, '');
        
        // Ensure scripts are loaded in correct order with proper attributes
        const processedScripts = scriptMatches.map(script => {
          // Remove async and defer from game scripts to ensure they wait for path replacement
          // Also ensure script tags are properly formatted
          let processed = script
            .replace(/\s+async\s*/gi, ' ')
            .replace(/\s+defer\s*/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          // If it's an external script (has src), ensure it doesn't have async/defer
          if (processed.includes('src=') && !processed.includes('type=')) {
            // Add type if missing to ensure proper execution
            processed = processed.replace(/<script\s+src=/, '<script type="text/javascript" src=');
          }
          return processed;
        });
        
        // CRITICAL: Path replacement script MUST be first, before any other scripts
        // Use document.write to ensure immediate execution if needed, but inline script should work
        html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      overflow: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: transparent;
    }
    #gamebox { 
      margin: auto;
      flex-shrink: 0;
    }
  </style>
  ${pathReplacementScript}
  ${storageProxyScript}
  ${jqueryScript}
  ${processedScripts.join('\n  ')}
  ${howToPlayScript}
</head>
<body>
${htmlWithoutScripts}
</body>
</html>`;
        
      } else {
        // If HTML already has structure, inject path replacement script and jQuery if needed
        // Check if path replacement script is already present
        const hasPathReplacement = html.includes('Path replacement script loaded');
        if (!hasPathReplacement) {
          // Inject path replacement script at the beginning of <head> (before any other scripts)
          if (html.includes('<head>')) {
            html = html.replace('<head>', `<head>\n  ${pathReplacementScript}\n  ${storageProxyScript}`);
          } else if (html.includes('</head>')) {
            html = html.replace('</head>', `  ${pathReplacementScript}\n  ${storageProxyScript}\n</head>`);
          } else {
            // No head tag, prepend to body or beginning
            html = pathReplacementScript + '\n' + storageProxyScript + '\n' + html;
          }
        } else {
          // Path replacement already exists, just add storage proxy after it
          if (html.includes('</head>')) {
            html = html.replace('</head>', `  ${storageProxyScript}\n</head>`);
          } else if (html.includes('<head>')) {
            html = html.replace('<head>', `<head>\n  ${storageProxyScript}`);
          } else {
            html = storageProxyScript + '\n' + html;
          }
        }
        if (needsJQuery && !html.includes('jquery')) {
          const jqueryScript = '<script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"></script>';
          if (html.includes('</head>')) {
            html = html.replace('</head>', `  ${jqueryScript}\n</head>`);
          } else {
            // No head tag, add before first script or at beginning
            const scriptMatch = html.match(/<script/i);
            if (scriptMatch) {
              html = html.replace(/<script/i, jqueryScript + '\n<script');
            } else {
              html = jqueryScript + '\n' + html;
            }
          }
        }
        // Inject how-to-play script at the end of body or HTML
        if (html.includes('</body>')) {
          html = html.replace('</body>', `  ${howToPlayScript}\n</body>`);
        } else if (html.includes('</html>')) {
          html = html.replace('</html>', `  ${howToPlayScript}\n</html>`);
        } else {
          html = html + '\n' + howToPlayScript;
        }
      }
      
      // Create blob URL
      const blob = new Blob([html], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);
      
      gameFrame.src = blobUrl;
      
      // CRITICAL: Set __gameResourceBase as soon as iframe window is accessible
      // This must happen before any game scripts execute
      // Use a MutationObserver or immediate check to set it early
      function setBaseUrlEarly() {
        try {
          const iframeWindow = gameFrame.contentWindow;
          if (iframeWindow) {
            // Always set baseUrl, even if already set (to ensure it's correct)
            try {
              iframeWindow.__gameResourceBase = releasesBaseUrl;
              // Also set a global variable on parent window for easy access
              if (typeof window.releasesBaseUrl === 'undefined') {
                window.releasesBaseUrl = releasesBaseUrl;
              }
            } catch (e) {
              // Cannot set property (may be protected)
            }
            
            // Also ensure getGameResource is set if path-replacement.js hasn't loaded yet
            if (typeof iframeWindow.getGameResource !== 'function') {
              try {
                iframeWindow.getGameResource = function(relativePath) {
                  if (relativePath.startsWith('http') || relativePath.startsWith('chrome-extension')) {
                    return relativePath;
                  }
                  const cleanPath = relativePath.replace(/^\.\.?\//, '');
                  return releasesBaseUrl + cleanPath;
                };
              } catch (e) {
                // Cannot set function
              }
            }
          }
        } catch (e) {
          // Cross-origin or not ready yet, will be set in onload handler
        }
      }
      
      // Store releasesBaseUrl in a global variable for iframe access
      window.releasesBaseUrl = releasesBaseUrl;
      
      // Try to set immediately (may not work if iframe not ready)
      setTimeout(setBaseUrlEarly, 0);
      
      // Also try after a short delay
      setTimeout(setBaseUrlEarly, 10);
      setTimeout(setBaseUrlEarly, 50);
      setTimeout(setBaseUrlEarly, 100);
      setTimeout(setBaseUrlEarly, 200);
      
      // Update character formation position when game loads
      gameFrame.addEventListener('load', function updateFormationOnGameLoad() {
        // Remove the listener after first use to avoid multiple calls
        gameFrame.removeEventListener('load', updateFormationOnGameLoad);
        
        // Function to update formation position with retry mechanism
        function updateFormationPosition(retries = 0, maxRetries = 20) {
          const container = document.getElementById('gmbdCircleContainer');
          if (!container) {
            // Formation doesn't exist yet, no need to update
            return;
          }
          
          try {
            const rootContainer = document.getElementById('games-root-container');
            let gameFrameForUpdate = null;
            if (rootContainer && rootContainer.shadowRoot) {
              gameFrameForUpdate = rootContainer.shadowRoot.getElementById('games-iframe');
            }
            if (!gameFrameForUpdate) {
              gameFrameForUpdate = document.getElementById('games-iframe');
            }
            
            if (gameFrameForUpdate && gameFrameForUpdate.contentWindow) {
              const iframeDoc = gameFrameForUpdate.contentDocument || gameFrameForUpdate.contentWindow.document;
              if (iframeDoc) {
                const gamebox = iframeDoc.getElementById('gamebox');
                if (gamebox) {
                  const gameboxRect = gamebox.getBoundingClientRect();
                  if (gameboxRect.height > 0 && gameboxRect.width > 0) {
                    // Update container dimensions
                    container.style.width = `${gameboxRect.width}px`;
                    container.style.height = `${gameboxRect.height}px`;
                    // Update main_gmbdsize
                    main_gmbdsize = gameboxRect.height;
                    
                    // Update all character positions with viewport-clamped size
                    const effectiveSize = getFittedDancerSize(gameboxRect.height);
                    const spacing = 20;
                    const totalRowWidth = (effectiveSize * 6) + (spacing * 5);
                    const startX = (gameboxRect.width - totalRowWidth) / 2;
                    const firstRowY = -effectiveSize - dancerGap;
                    const secondRowY = gameboxRect.height + dancerGap;
                    
                    for (let i = 0; i < 12; i++) {
                      const gmbdld = document.getElementById('gmbdld-' + i);
                      if (gmbdld) {
                        const row = Math.floor(i / 6);
                        const col = i % 6;
                        const x = startX + col * (effectiveSize + spacing);
                        const y = row === 0 ? firstRowY : secondRowY;
                        gmbdld.style.left = `${x}px`;
                        gmbdld.style.top = `${y}px`;
                        gmbdld.style.width = `${effectiveSize}px`;
                        gmbdld.style.height = `${effectiveSize}px`;
                      }
                    }
                    scheduleDancerReveal();
                    return; // Success, exit
                  }
                }
              }
            }
            
            // If we get here, gamebox not found or dimensions are 0, retry
            if (retries < maxRetries) {
              setTimeout(() => {
                updateFormationPosition(retries + 1, maxRetries);
              }, 200);
            } else {
              console.log('Failed to update formation position after', maxRetries, 'retries');
            }
          } catch (e) {
            // Retry on error
            if (retries < maxRetries) {
              setTimeout(() => {
                updateFormationPosition(retries + 1, maxRetries);
              }, 200);
            }
          }
        }
        
        // Start updating after a delay to allow game to initialize
        setTimeout(() => {
          updateFormationPosition();
        }, 500);
      }, { once: true }); // Use once option to auto-remove listener
      
      // Verify path replacement script execution in iframe
      // Check multiple times because scripts may load asynchronously
      const checkIframeScript = () => {
        try {
          const iframeWindow = gameFrame.contentWindow;
          
          // Try to access iframe document, but handle cross-origin errors gracefully
          let iframeDoc = null;
          try {
            iframeDoc = gameFrame.contentDocument || iframeWindow?.document;
          } catch (e) {
            // Cross-origin iframe - cannot access document
            if (e.name === 'SecurityError' || e.message.includes('cross-origin')) {
              // For cross-origin iframes, we can't verify script execution
              // But we can check if window properties are accessible
              try {
                const hasResourceBase = iframeWindow.__gameResourceBase !== undefined;
                const hasGetGameResource = typeof iframeWindow.getGameResource === 'function';
                if (hasResourceBase || hasGetGameResource) {
                  return true;
                }
              } catch (e2) {
                // Cannot access window properties either
              }
              return false;
            }
            throw e;
          }
          
          if (!iframeWindow || !iframeDoc) {
            return false;
          }
          
          // Check if fetch was overridden (check for any custom fetch implementation)
          const fetchIsOverridden = iframeWindow.fetch && 
            (iframeWindow.fetch !== window.fetch || // Different from main window's fetch
             iframeWindow.fetch.toString().includes('convertToAbsoluteUrl') ||
             iframeWindow.fetch.toString().includes('baseUrl') ||
             iframeWindow.fetch.toString().includes('__gameResourceBase'));
          
          // Check if getGameResource exists
          const hasGetGameResource = typeof iframeWindow.getGameResource === 'function';
          
          // Check __gameResourceBase
          const hasResourceBase = iframeWindow.__gameResourceBase !== undefined;
          
          // Also check if fetch was overridden by checking if it's different from original
          const fetchString = iframeWindow.fetch ? iframeWindow.fetch.toString() : '';
          const hasCustomFetch = fetchString.length > 100 && // Original fetch is usually shorter
                                 (fetchString.includes('PATH REPLACEMENT') || 
                                  fetchString.includes('URL converted') ||
                                  fetchString.includes('__originalFetch'));
          
          if ((fetchIsOverridden || hasCustomFetch) && hasGetGameResource && hasResourceBase) {
            return true;
          } else {
            return false;
          }
        } catch (e) {
          return false;
        }
      };
      
      // Check immediately when iframe starts loading
      const checkInterval = setInterval(() => {
        if (checkIframeScript()) {
          clearInterval(checkInterval);
        }
      }, 50);
      
      // Stop checking after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 5000);
      
      gameFrame.onload = async () => {
        hideBanner();
        
        // CRITICAL: Ensure __gameResourceBase is set immediately
        try {
          const iframeWindow = gameFrame.contentWindow;
          const iframeDoc = gameFrame.contentDocument || iframeWindow?.document;
          
          if (iframeWindow) {
            // Always set baseUrl, even if already set (to ensure it's correct)
            iframeWindow.__gameResourceBase = releasesBaseUrl;
            
            // Ensure getGameResource is set
            if (typeof iframeWindow.getGameResource !== 'function') {
              iframeWindow.getGameResource = function(relativePath) {
                if (relativePath.startsWith('http') || relativePath.startsWith('chrome-extension')) {
                  return relativePath;
                }
                const cleanPath = relativePath.replace(/^\.\.?\//, '');
                return releasesBaseUrl + cleanPath;
              };
            }
          }
          
          if (iframeWindow && iframeDoc) {
            // Check if path replacement script executed
            const scriptExecuted = typeof iframeWindow.getGameResource === 'function' &&
                                   iframeWindow.getGameResource.toString().includes('baseUrl');
            
            if (!scriptExecuted) {
              // Load external script file (bypasses CSP)
              try {
                const scriptUrl = chrome.runtime.getURL('js/path-replacement.js');
                const script = iframeDoc.createElement('script');
                script.src = scriptUrl;
                script.onload = () => {
                  // Set baseUrl after script loads
                  iframeWindow.__gameResourceBase = releasesBaseUrl;
                  // Trigger re-initialization if function exists
                  if (typeof iframeWindow.initPathReplacement === 'function') {
                    iframeWindow.initPathReplacement();
                  }
                };
                script.onerror = () => {
                  // Fallback: set variables directly
                  try {
                    iframeWindow.__gameResourceBase = releasesBaseUrl;
                    iframeWindow.getGameResource = function(relativePath) {
                      if (relativePath.startsWith('http') || relativePath.startsWith('chrome-extension')) {
                        return relativePath;
                      }
                      const cleanPath = relativePath.replace(/^\.\.?\//, '');
                      return releasesBaseUrl + cleanPath;
                    };
                    // Override fetch
                    const originalFetch = iframeWindow.fetch;
                    iframeWindow.fetch = function(input, init) {
                      if (typeof input === 'string') {
                        let url = input;
                        if (url.startsWith('../') || url.startsWith('./')) {
                          url = releasesBaseUrl + url.replace(/^\.\.?\//, '');
                        } else if (!url.startsWith('http') && !url.startsWith('chrome-extension') && !url.startsWith('data') && !url.startsWith('blob') && !url.startsWith('/')) {
                          url = releasesBaseUrl + url;
                        }
                        return originalFetch.call(this, url, init);
                      }
                      return originalFetch.call(this, input, init);
                    };
                  } catch (e2) {
                    // Failed to set variables directly
                  }
                };
                iframeDoc.head.appendChild(script);
              } catch (e) {
                // Fallback: load external script file
                try {
                  const scriptUrl = chrome.runtime.getURL('js/path-replacement.js');
                  const script = iframeDoc.createElement('script');
                  script.src = scriptUrl;
                  script.onload = () => {
                    // Set baseUrl after script loads
                    iframeWindow.__gameResourceBase = releasesBaseUrl;
                  };
                  script.onerror = () => {
                    // Last resort: try to set variables directly
                    try {
                      iframeWindow.__gameResourceBase = releasesBaseUrl;
                      iframeWindow.getGameResource = function(relativePath) {
                        if (relativePath.startsWith('http') || relativePath.startsWith('chrome-extension')) {
                          return relativePath;
                        }
                        const cleanPath = relativePath.replace(/^\.\.?\//, '');
                        return releasesBaseUrl + cleanPath;
                      };
                      // Override fetch
                      const originalFetch = iframeWindow.fetch;
                      iframeWindow.fetch = function(input, init) {
                        if (typeof input === 'string') {
                          let url = input;
                          if (url.startsWith('../') || url.startsWith('./')) {
                            url = releasesBaseUrl + url.replace(/^\.\.?\//, '');
                          } else if (!url.startsWith('http') && !url.startsWith('chrome-extension') && !url.startsWith('data') && !url.startsWith('blob') && !url.startsWith('/')) {
                            url = releasesBaseUrl + url;
                          }
                        return originalFetch.call(this, url, init);
                      }
                      return originalFetch.call(this, input, init);
                    };
                  } catch (e2) {
                    // Failed to set variables directly
                  }
                };
                iframeDoc.head.appendChild(script);
              } catch (e2) {
                // Failed to load external script
              }
              }
            }
          }
        } catch (e) {
          // Failed to inject path replacement script
        }
        
        // Inject centering styles into game iframe
        const injectCenteringStyles = () => {
          try {
            const iframeWindow = gameFrame.contentWindow;
            const iframeDoc = gameFrame.contentDocument || iframeWindow?.document;
            
            if (iframeWindow && iframeDoc) {
              // Check if styles already injected
              if (iframeDoc.getElementById('games-centering-styles')) {
                return;
              }
              
              // Create style element for centering
              const style = iframeDoc.createElement('style');
              style.id = 'games-centering-styles';
              style.textContent = `
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  overflow: auto;
                  background: transparent;
                }
                #gamebox {
                  margin: auto;
                  flex-shrink: 0;
                }
              `;
              
              // Inject into head
              if (iframeDoc.head) {
                iframeDoc.head.appendChild(style);
              } else {
                // If head doesn't exist, wait a bit and try again
                setTimeout(injectCenteringStyles, 100);
              }
            }
          } catch (e) {
            // Failed to inject styles
          }
        };
        
        // Try to inject styles multiple times
        setTimeout(injectCenteringStyles, 100);
        setTimeout(injectCenteringStyles, 300);
        setTimeout(injectCenteringStyles, 500);
        
        // Setup keyboard forwarding
        setupKeyboardForwarding();
        // Focus on the game frame after it loads
        setTimeout(() => {
          focusGame();
        }, 100);
        // Don't revoke immediately, wait a bit for resources to load
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 1000);
      };
      
      gameFrame.onerror = () => {
        hideBanner();
        rightGame.innerHTML = `<div style="padding: 20px; text-align: center; color: #333;">
          <h3>Failed to load game: ${folder}</h3>
          <p>Please make sure the game files are copied to the extension's games directory.</p>
        </div>`;
      };
      
      currentGame = folder;
    } catch (err) {
      hideBanner();
      rightGame.innerHTML = `<div style="padding: 20px; text-align: center; color: #333;">
        <h3>Error loading game: ${folder}</h3>
        <p>${err.message}</p>
        <p>Please check that the game files exist in the games directory.</p>
      </div>`;
    }
  }

  // Forward keyboard events to iframe
  function setupKeyboardForwarding() {
    // Remove old listener if exists
    if (window.__gamesKeyboardHandler) {
      window.removeEventListener('keydown', window.__gamesKeyboardHandler, true);
    }
    
    // Create new keyboard handler
    window.__gamesKeyboardHandler = (e) => {
      // Only forward if game is loaded and iframe is visible
      if (!gameFrame || !gameFrame.contentWindow || currentGame === null) {
        return;
      }
      
      // Only forward arrow keys and space/enter
      const forwardKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter'];
      const forwardKeyCodes = [37, 38, 39, 40, 32, 13]; // Left, Up, Right, Down, Space, Enter
      
      const shouldForward = forwardKeys.includes(e.key) || forwardKeyCodes.includes(e.keyCode);
      if (!shouldForward) {
        return;
      }
      
      try {
        const iframeDoc = gameFrame.contentDocument || gameFrame.contentWindow.document;
        const iframeWindow = gameFrame.contentWindow;
        
        if (iframeDoc && iframeWindow) {
          // Create event object compatible with old code
          const eventObj = {
            key: e.key,
            code: e.code,
            keyCode: e.keyCode || e.which,
            which: e.which || e.keyCode,
            preventDefault: () => e.preventDefault(),
            stopPropagation: () => e.stopPropagation()
          };
          
          // Try to call document.onkeydown directly (for classic-maze.js)
          if (iframeDoc.onkeydown) {
            try {
              // Create a compatible event object
              const fakeEvent = {
                key: e.key,
                keyCode: e.keyCode || e.which,
                which: e.which || e.keyCode,
                preventDefault: () => {},
                stopPropagation: () => {}
              };
              // Add window.event for compatibility
              const originalWindowEvent = iframeWindow.event;
              iframeWindow.event = fakeEvent;
              iframeDoc.onkeydown(fakeEvent);
              iframeWindow.event = originalWindowEvent;
            } catch (err) {
              // Error calling onkeydown
            }
          }
          
          // Also dispatch as a regular event
          try {
            const newEvent = new KeyboardEvent('keydown', {
              key: e.key,
              code: e.code,
              keyCode: e.keyCode || e.which,
              which: e.which || e.keyCode,
              bubbles: true,
              cancelable: true
            });
            iframeDoc.dispatchEvent(newEvent);
          } catch (err) {
            // Ignore if can't create event
          }
          
          // Prevent default on main page to avoid scrolling
          e.preventDefault();
          e.stopPropagation();
        }
      } catch (err) {
        // Cross-origin or other error, ignore
      }
    };
    
    // Add event listener with capture phase to catch events early
    window.addEventListener('keydown', window.__gamesKeyboardHandler, true);
  }

  // Focus game function
  function focusGame() {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      try {
        // First, try to focus the iframe element
        if (gameFrame && gameFrame.contentWindow) {
          gameFrame.focus();
          // Try to focus the content window (may fail due to cross-origin)
          try {
            gameFrame.contentWindow.focus();
            // Also try to focus a focusable element inside iframe
            const iframeDoc = gameFrame.contentDocument || gameFrame.contentWindow.document;
            if (iframeDoc) {
              const focusableElement = iframeDoc.querySelector('canvas, #gamebox, body') || iframeDoc.body;
              if (focusableElement && focusableElement.focus) {
                focusableElement.focus();
              }
              // Also set focus on document
              if (iframeDoc.body) {
                iframeDoc.body.focus();
              }
            }
          } catch (e) {
            // Cross-origin restriction, just focus the iframe element
            gameFrame.focus();
          }
        }
        // Also focus the container as fallback
        if (rightGame && rightGame.focus) {
          rightGame.focus();
        }
      } catch (e) {
        // Could not focus game
      }
    });
  }

  // Update character images and animations when switching games
  function updateCharacterOnGameSwitch() {
    if (!valid_gmbdids || valid_gmbdids.length === 0) {
      return;
    }
    
    // Reset game state monitoring to ensure new game starts with static images
    stopGameStateMonitoring();
    lastGameOverState = false;
    
    // Set flag to force static images when switching games
    forceStaticImages = true;
    
    // 1. Update animation ID (animid) - get a new random animation
    gmbd_animateids = getRandomAnimations();
    shuffleGmbdIds(gmbd_animateids);
    animidx = 0;
    animid = gmbd_animateids[animidx];
    
    // 2. Update live_gmbdid (右下角的图) - randomly select a new character
    shuffleGmbdIds(valid_gmbdids);
    live_gmbdid = valid_gmbdids[0];
    main_gmbdidx = 0;
    main_gmbdid = valid_gmbdids[main_gmbdidx];
    
    // 3. Update the bottom-right corner image (gmbdLive) - only if game overlay is not open
    // If game overlay is open, gmbdLive is hidden, so we don't need to update it
    const rootContainer = document.getElementById('games-root-container');
    if (gmbdLiveImg && (!rootContainer || rootContainer.style.display === 'none')) {
      gmbdLiveImg.src = buildGmbdGIFLive(live_gmbdid, 'sub');
    }
    
    // 4. Update the static button image (gmbdBtn) if game overlay is open
    const gmbdBtn = document.getElementById('gmbdBtn');
    if (gmbdBtn && gmbdBtn.style.display !== 'none') {
      const btnImg = document.createElement('img');
      btnImg.src = buildGmbdPNG(main_gmbdid);
      gmbdBtn.innerHTML = '';
      gmbdBtn.appendChild(btnImg);
    }
    
    // 5. Update the character formation (动图组) if it exists and is displayed
    // Only update if the formation is currently displayed (game overlay is open)
    const gmbdCircleContainer = document.getElementById('gmbdCircleContainer');
    if (gmbdCircleContainer && gmbdOverlay && gmbdOverlay.style.display !== 'none') {
      // Clear existing formation
      clearExistFormation();
      // Regenerate formation with new characters and animation
      // This will ensure live_gmbdid is in the formation and uses the new animid
      // Delay the display to ensure new game is loaded and isGameOver() returns false
      setTimeout(() => {
        displayCircleFormation();
        // Reset the flag after displaying formation
        forceStaticImages = false;
        // Preload dynamic images when switching games (after formation is updated)
        // Wait a bit for current_selected_gmbdids to be set by displayCircleFormation
        setTimeout(() => {
          if (current_selected_gmbdids && current_target_gmbdid && typeof animid !== 'undefined' && animid !== null) {
            preloadDynamicImages(current_selected_gmbdids, current_target_gmbdid);
          }
        }, 100);
      }, 200);
    } else {
      // If formation is not displayed, reset the flag immediately
      forceStaticImages = false;
    }
  }

  // Select game function
  function selectGame(folder, menuItem, skipCharacterUpdate = false) {
    if (!folder) return;
    
    // Update menu active state
    shadow.querySelectorAll('.games-menu-item').forEach(item => {
      item.classList.remove('active');
    });
    menuItem.classList.add('active');
    
    // Update character images and animations when switching games
    // Only update if skipCharacterUpdate is false (i.e., user is actively switching games)
    if (!skipCharacterUpdate) {
      updateCharacterOnGameSwitch();
    }
    
    // Load the game
    loadGame(folder);
    
    // Focus on game after a short delay to ensure it's loading
    setTimeout(() => {
      focusGame();
    }, 100);
  }

  // Start with first game
  function startGames(skipCharacterUpdate = false) {
    const firstGame = gameMenu.find(item => item.folder);
    if (firstGame && firstGameItem) {
      selectGame(firstGame.folder, firstGameItem, skipCharacterUpdate);
      // Focus on game after initialization
      setTimeout(() => {
        focusGame();
      }, 300);
    }
  }

  // Teardown function
  // Complete teardown - clear game state but keep container for reuse
  function completeTeardown() {
    try {
      // Stop game state monitoring
      stopGameStateMonitoring();
      
      // Remove keyboard forwarding
      if (window.__gamesKeyboardHandler) {
        window.removeEventListener('keydown', window.__gamesKeyboardHandler, true);
        window.__gamesKeyboardHandler = null;
      }
      
      // Clear game state
      currentGame = null;
      
      // Clear iframe content completely
      if (gameFrame) {
        try {
          gameFrame.src = 'about:blank';
          // Also try to clear iframe content if accessible
          setTimeout(() => {
            try {
              const iframeDoc = gameFrame.contentDocument || gameFrame.contentWindow?.document;
              if (iframeDoc && iframeDoc.body) {
                iframeDoc.body.innerHTML = '';
              }
            } catch (e) {
              // Cross-origin or other error, ignore
            }
          }, 50);
        } catch (e) {
          // Ignore errors
        }
      }
      
      // Hide root element instead of removing (so it can be shown again quickly)
      if (root) {
        root.style.display = 'none';
        // Hide sound control button when closing game interface
        const soundControlBtn = shadow.getElementById('games-sound-control');
        if (soundControlBtn) {
          soundControlBtn.style.display = 'none';
        }
      }
      
      // Reset active menu item
      if (firstGameItem) {
        shadow.querySelectorAll('.games-menu-item').forEach(item => {
          item.classList.remove('active');
        });
        firstGameItem.classList.add('active');
      }
      
      // Don't reset global flag - we want to keep the script loaded
    } catch (e) {
      // If teardown fails, just hide the root
      if (root) {
        root.style.display = 'none';
      }
    }
  }

  function teardown() {
    try {
      // Remove keyboard forwarding
      if (window.__gamesKeyboardHandler) {
        window.removeEventListener('keydown', window.__gamesKeyboardHandler, true);
        window.__gamesKeyboardHandler = null;
      }
      window.removeEventListener('resize', onResize, true);
      window.removeEventListener('GAMES_TOGGLE', onToggle, true);
      window.removeEventListener('GAMES_SHOW_LOADING', onShowLoading, true);
      window.removeEventListener('GAMES_START', onStart, true);
      
      // Hide root element instead of removing (so it can be shown again)
      if (root) {
        root.style.display = 'none';
      }
      
      // Also hide character overlay elements
      clearExistFormation();
      gmbdOverlay.style.display = 'none';
      gmbdBtn.style.display = 'none';
      gmbdExit.style.display = 'none';
      gmbdLive.style.display = 'block';
      
      // Reset global flag
      globalThis.__GAMES_INJECTED__ = false;
    } catch (e) {
      // If removal fails, try alternative method
      if (root) {
        root.style.display = 'none';
        globalThis.__GAMES_INJECTED__ = false;
      }
    }
  }

  function onResize() {
    // Update dancer layout on screen resize
    updateFormationPosition();
  }

  function onToggle() {
    teardown();
  }

  function onShowLoading(ev) {
    const { show, message } = ev.detail || {};
    if (show) ensureBanner(message || 'Loading games...');
    else hideBanner();
  }

  function onStart() {
    hideBanner();
    startGames();
  }

  // Events
  window.addEventListener('resize', onResize, true);
  window.addEventListener('GAMES_TOGGLE', onToggle, true);
  window.addEventListener('GAMES_SHOW_LOADING', onShowLoading, true);
  window.addEventListener('GAMES_START', onStart, true);
  
  // Handle storage requests from game iframes
  window.addEventListener('message', function(event) {
    // Security: verify message is from our iframe
    const rootContainer = document.getElementById('games-root-container');
    let gameFrame = null;
    if (rootContainer && rootContainer.shadowRoot) {
      gameFrame = rootContainer.shadowRoot.getElementById('games-iframe');
    }
    if (!gameFrame) {
      gameFrame = document.getElementById('games-iframe');
    }
    
    // Only process messages from our game iframe
    if (!gameFrame || event.source !== gameFrame.contentWindow) {
      return;
    }
    
    const data = event.data;
    if (data._storageRequest && data.messageId) {
      const { action, params } = data;
      
      // Handle different storage actions
      switch (action) {
        case 'get':
          chrome.storage.local.get(params.keys || null, function(result) {
            gameFrame.contentWindow.postMessage({
              _storageResponse: true,
              messageId: data.messageId,
              result: result
            }, '*');
          });
          break;
          
        case 'set':
          chrome.storage.local.set(params.items, function() {
            const error = chrome.runtime.lastError ? chrome.runtime.lastError.message : null;
            gameFrame.contentWindow.postMessage({
              _storageResponse: true,
              messageId: data.messageId,
              error: error,
              result: null
            }, '*');
          });
          break;
          
        case 'remove':
          chrome.storage.local.remove(params.keys, function() {
            const error = chrome.runtime.lastError ? chrome.runtime.lastError.message : null;
            gameFrame.contentWindow.postMessage({
              _storageResponse: true,
              messageId: data.messageId,
              error: error,
              result: null
            }, '*');
          });
          break;
          
        case 'clear':
          chrome.storage.local.clear(function() {
            const error = chrome.runtime.lastError ? chrome.runtime.lastError.message : null;
            gameFrame.contentWindow.postMessage({
              _storageResponse: true,
              messageId: data.messageId,
              error: error,
              result: null
            }, '*');
          });
          break;
      }
    }
  });

  // Don't auto-start games - wait for user to click gmbdLive button
  // Games will be started when displayGmbdOverlay() is called
})();

