/**
 * Google Voice Image Paste Extension
 * Enables Ctrl+V / Cmd+V image pasting into Google Voice conversations
 */

(function() {
    'use strict';

    // Configuration - selectors for Google Voice elements
    const CONFIG = {
        // The message input textarea
        messageInputSelector: 'textarea.message-input, textarea[placeholder="Type a message"]',
        
        // The file input element used by the upload button
        fileInputSelector: 'input[type="file"]',
        
        // The menu trigger button (usually has an attachment/add icon) - opens the menu containing Upload
        menuTriggerSelector: 'button[mat-icon-button][aria-haspopup="menu"], button.mat-mdc-icon-button[aria-haspopup="menu"], button[mattooltip*="ttach"], button[aria-label*="ttach"], button[aria-label*="more"]',
        
        // The Upload menu item inside the opened menu
        uploadMenuItemSelector: 'button.mat-mdc-menu-item mat-icon.google-symbols, button[mat-menu-item] mat-icon',
        
        // Direct upload button selector (text contains "Upload")
        uploadButtonTextSelector: 'button.mat-mdc-menu-item',
        
        // Container where we might need to dispatch events
        conversationContainerSelector: 'textarea.message-input'
    };
    
    // Store the pending image file while menu opens
    let pendingImageFile = null;
    let fileInputIntercepted = false;

    let isInitialized = false;

    /**
     * Initialize the paste handler
     */
    function initialize() {
        if (isInitialized) return;
        
        console.log('[GV Image Paste] Initializing...');
        
        // Add paste event listener to the document
        document.addEventListener('paste', handlePaste, true);
        
        // Intercept file input clicks to prevent file dialog when we have a pending image
        interceptFileInputClicks();
        
        // Also observe for dynamically loaded content
        observeForMessageInput();
        
        isInitialized = true;
        console.log('[GV Image Paste] Ready - you can now paste images with Ctrl+V / Cmd+V');
    }

    /**
     * Handle paste events
     */
    function handlePaste(event) {
        const clipboardData = event.clipboardData || window.clipboardData;
        
        if (!clipboardData || !clipboardData.items) {
            return;
        }

        // Check if we're in a Google Voice conversation context
        if (!isInConversationContext()) {
            return;
        }

        // Look for image data in clipboard
        const imageItem = findImageInClipboard(clipboardData);
        
        if (!imageItem) {
            return; // No image found, let normal paste proceed
        }

        console.log('[GV Image Paste] Image detected in clipboard');
        
        // Prevent default paste behavior
        event.preventDefault();
        event.stopPropagation();

        // Get the image file from clipboard
        const imageFile = imageItem.getAsFile();
        
        if (!imageFile) {
            console.error('[GV Image Paste] Could not get file from clipboard');
            return;
        }

        // Try to upload the image
        uploadImage(imageFile);
    }

    /**
     * Intercept file input clicks to inject our pasted image instead of opening file dialog
     */
    function interceptFileInputClicks() {
        // Use event capturing to intercept clicks on file inputs
        document.addEventListener('click', function(event) {
            if (!pendingImageFile) return;
            
            const target = event.target;
            const fileInput = target.closest('input[type="file"]') || 
                              (target.tagName === 'INPUT' && target.type === 'file' ? target : null);
            
            if (fileInput) {
                console.log('[GV Image Paste] Intercepting file input click');
                event.preventDefault();
                event.stopPropagation();
                
                // Trigger our upload instead
                setTimeout(() => {
                    triggerFileUpload(fileInput, pendingImageFile);
                    pendingImageFile = null;
                }, 50);
            }
        }, true);
        
        // Also intercept programmatic clicks by overriding the click method on file inputs
        const observer = new MutationObserver((mutations) => {
            const fileInputs = document.querySelectorAll('input[type="file"]:not([data-gv-intercepted])');
            fileInputs.forEach(input => {
                input.setAttribute('data-gv-intercepted', 'true');
                const originalClick = input.click.bind(input);
                input.click = function() {
                    if (pendingImageFile) {
                        console.log('[GV Image Paste] Intercepting programmatic file input click');
                        setTimeout(() => {
                            triggerFileUpload(input, pendingImageFile);
                            pendingImageFile = null;
                        }, 50);
                    } else {
                        originalClick();
                    }
                };
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Check if user is in a conversation context where pasting makes sense
     */
    function isInConversationContext() {
        // Check if message input exists on page
        const messageInput = document.querySelector(CONFIG.messageInputSelector);
        if (messageInput) return true;
        
        // Check for conversation container
        const container = document.querySelector(CONFIG.conversationContainerSelector);
        if (container) return true;
        
        // Check URL pattern
        return window.location.href.includes('/messages') || 
               window.location.href.includes('/conversations') ||
               window.location.pathname.length > 1;
    }

    /**
     * Find an image item in clipboard data
     */
    function findImageInClipboard(clipboardData) {
        for (let i = 0; i < clipboardData.items.length; i++) {
            const item = clipboardData.items[i];
            if (item.type.startsWith('image/')) {
                return item;
            }
        }
        return null;
    }

    /**
     * Upload the image using Google Voice's file input
     */
    function uploadImage(imageFile) {
        console.log('[GV Image Paste] Starting upload process...');
        
        // Method 1: Try to find an existing file input
        let fileInput = document.querySelector(CONFIG.fileInputSelector);
        
        if (fileInput) {
            console.log('[GV Image Paste] Found existing file input');
            triggerFileUpload(fileInput, imageFile);
            return;
        }
        
        // Method 2: Need to open the menu first to access the Upload option
        // Store the image for later use
        pendingImageFile = imageFile;
        
        // Find and click the menu trigger (attachment button)
        const menuTrigger = findMenuTrigger();
        
        if (menuTrigger) {
            console.log('[GV Image Paste] Opening attachment menu...');
            menuTrigger.click();
            
            // Wait for menu to open, then click Upload
            setTimeout(() => {
                clickUploadMenuItem();
            }, 200);
        } else {
            console.error('[GV Image Paste] Could not find menu trigger button');
            showNotification('Could not find attachment button. Try clicking it manually first.', 'error');
        }
    }
    
    /**
     * Find the menu trigger button (attachment/add button)
     */
    function findMenuTrigger() {
        // Look for buttons with menu popup
        const menuButtons = document.querySelectorAll('button[aria-haspopup="menu"]');
        for (const btn of menuButtons) {
            // Check if it's near the message input area
            const parent = btn.closest('gv-message-input, gv-text-thread, [class*="message"], [class*="input"]');
            if (parent) {
                return btn;
            }
        }
        
        // Fallback: find any menu button near the textarea
        const textarea = document.querySelector(CONFIG.messageInputSelector);
        if (textarea) {
            const container = textarea.closest('form, [class*="input"], [class*="compose"]') || textarea.parentElement?.parentElement;
            if (container) {
                const btn = container.querySelector('button[aria-haspopup="menu"]');
                if (btn) return btn;
            }
        }
        
        // Last resort: any menu trigger
        return document.querySelector('button[aria-haspopup="menu"]');
    }
    
    /**
     * Click the Upload menu item once the menu is open
     */
    function clickUploadMenuItem() {
        // Find the Upload menu item - look for menu items containing "upload" text or icon
        const menuItems = document.querySelectorAll('button.mat-mdc-menu-item, button[mat-menu-item]');
        
        for (const item of menuItems) {
            const text = item.textContent?.toLowerCase() || '';
            const hasUploadIcon = item.querySelector('mat-icon')?.textContent?.toLowerCase().includes('upload');
            
            if (text.includes('upload') || hasUploadIcon) {
                console.log('[GV Image Paste] Found Upload menu item, clicking...');
                item.click();
                
                // Wait for file input to be ready, then trigger upload
                setTimeout(() => {
                    const fileInput = document.querySelector(CONFIG.fileInputSelector);
                    if (fileInput && pendingImageFile) {
                        triggerFileUpload(fileInput, pendingImageFile);
                        pendingImageFile = null;
                    } else {
                        // The click might open a file dialog - we need to intercept it
                        interceptFileDialog();
                    }
                }, 300);
                return;
            }
        }
        
        console.error('[GV Image Paste] Could not find Upload menu item');
        showNotification('Could not find Upload option in menu', 'error');
    }
    
    /**
     * Intercept the file dialog and inject our image
     */
    function interceptFileDialog() {
        if (!pendingImageFile) return;
        
        // Watch for file input being added or clicked
        const observer = new MutationObserver((mutations) => {
            const fileInput = document.querySelector(CONFIG.fileInputSelector);
            if (fileInput) {
                observer.disconnect();
                // Give a tiny delay for the input to be fully ready
                setTimeout(() => {
                    triggerFileUpload(fileInput, pendingImageFile);
                    pendingImageFile = null;
                }, 100);
            }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Timeout after 2 seconds
        setTimeout(() => {
            observer.disconnect();
            if (pendingImageFile) {
                showNotification('Upload timed out. Please try again.', 'error');
                pendingImageFile = null;
            }
        }, 2000);
    }

    /**
     * Find any file input that accepts images
     */
    function findAnyFileInput() {
        const inputs = document.querySelectorAll('input[type="file"]');
        for (const input of inputs) {
            const accept = input.getAttribute('accept') || '';
            if (accept.includes('image') || accept === '' || accept === '*/*') {
                return input;
            }
        }
        return inputs[0]; // Return first file input if any exists
    }

    /**
     * Trigger the file upload with the pasted image
     */
    function triggerFileUpload(fileInput, imageFile) {
        // Compress the image before uploading to avoid "file too large" errors
        compressImage(imageFile).then(compressedFile => {
            // Create a DataTransfer to set files on the input
            const dataTransfer = new DataTransfer();
            
            dataTransfer.items.add(compressedFile);
            
            // Set the files on the input
            fileInput.files = dataTransfer.files;
            
            // Dispatch change event to notify Google Voice of the new file
            const changeEvent = new Event('change', { bubbles: true, cancelable: true });
            fileInput.dispatchEvent(changeEvent);
            
            // Also dispatch input event
            const inputEvent = new Event('input', { bubbles: true, cancelable: true });
            fileInput.dispatchEvent(inputEvent);
            
            const sizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2);
            console.log('[GV Image Paste] Image uploaded successfully:', compressedFile.name, `(${sizeMB} MB)`);
            showNotification('Image pasted successfully!', 'success');
        }).catch(err => {
            console.error('[GV Image Paste] Compression failed:', err);
            showNotification('Failed to process image', 'error');
        });
    }

    /**
     * Compress an image file to reduce size (converts to JPEG with quality setting)
     */
    function compressImage(imageFile) {
        return new Promise((resolve, reject) => {
            const maxWidth = 2048;  // Max width in pixels
            const maxHeight = 2048; // Max height in pixels
            const quality = 0.85;   // JPEG quality (0.0 - 1.0)
            const maxSizeMB = 2;    // Target max size in MB

            const img = new Image();
            const url = URL.createObjectURL(imageFile);

            img.onload = () => {
                URL.revokeObjectURL(url);

                let { width, height } = img;
                
                // Calculate new dimensions if image is too large
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                // Create canvas and draw resized image
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to JPEG blob with compression
                canvas.toBlob(blob => {
                    if (!blob) {
                        reject(new Error('Failed to create blob'));
                        return;
                    }

                    const fileName = `pasted-image-${Date.now()}.jpg`;
                    const compressedFile = new File([blob], fileName, { type: 'image/jpeg' });
                    
                    const originalSizeMB = (imageFile.size / (1024 * 1024)).toFixed(2);
                    const compressedSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2);
                    console.log(`[GV Image Paste] Compressed: ${originalSizeMB} MB ? ${compressedSizeMB} MB`);
                    
                    resolve(compressedFile);
                }, 'image/jpeg', quality);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load image'));
            };

            img.src = url;
        });
    }

    /**
     * Show a temporary notification to the user
     */
    function showNotification(message, type = 'info') {
        // Remove any existing notification
        const existing = document.getElementById('gv-paste-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.id = 'gv-paste-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background-color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            border-radius: 8px;
            font-family: 'Google Sans', Roboto, sans-serif;
            font-size: 14px;
            z-index: 999999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: gv-paste-fade-in 0.3s ease;
        `;
        
        // Add animation keyframes if not already added
        if (!document.getElementById('gv-paste-styles')) {
            const style = document.createElement('style');
            style.id = 'gv-paste-styles';
            style.textContent = `
                @keyframes gv-paste-fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            notification.style.transition = 'all 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Observe for dynamically loaded message input
     */
    function observeForMessageInput() {
        const observer = new MutationObserver((mutations) => {
            // Check if we now have a message input available
            const messageInput = document.querySelector(CONFIG.messageInputSelector);
            if (messageInput && !messageInput.hasAttribute('data-gv-paste-ready')) {
                messageInput.setAttribute('data-gv-paste-ready', 'true');
                console.log('[GV Image Paste] Message input detected, paste functionality ready');
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Also reinitialize on navigation (for SPA behavior)
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            console.log('[GV Image Paste] Navigation detected, ensuring paste handler is active');
        }
    }).observe(document, { subtree: true, childList: true });

})();
