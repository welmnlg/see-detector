// Function to get a filename from a URL
function getFileName(url, defaultName = 'downloaded-file') {
    try {
        const urlObject = new URL(url);
        const pathname = urlObject.pathname;
        const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
        
        // Clean up filename
        if (filename && filename !== '' && !filename.includes('?')) {
            // Remove query parameters if any
            return filename.split('?')[0];
        }
        
        // Generate filename based on type
        const urlLower = url.toLowerCase();
        let extension = '.media';
        if (urlLower.includes('.gif')) extension = '.gif';
        else if (urlLower.includes('.mp4') || urlLower.includes('video/mp4')) extension = '.mp4';
        else if (urlLower.includes('.webm')) extension = '.webm';
        
        return `${defaultName}-${Date.now()}${extension}`;
    } catch (error) {
        // Generate a filename based on content type
        const urlLower = url.toLowerCase();
        let extension = '.media';
        if (urlLower.includes('.gif')) extension = '.gif';
        else if (urlLower.includes('.mp4') || urlLower.includes('video/mp4')) extension = '.mp4';
        else if (urlLower.includes('.webm')) extension = '.webm';
        
        return `${defaultName}-${Date.now()}${extension}`;
    }
}

// Function to show a notification (with fallback)
function showDownloadNotification(title, message) {
    // Check if notifications API is available
    if (chrome.notifications && chrome.notifications.create) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: title,
            message: message,
            priority: 1
        }, (notificationId) => {
            if (chrome.runtime.lastError) {
                console.warn('Notification failed:', chrome.runtime.lastError);
                // Fallback to console
                console.log(`[Media Saver] ${title}: ${message}`);
            }
        });
    } else {
        // Fallback: log to console
        console.log(`[Media Saver] ${title}: ${message}`);
        // Optional: Update extension badge
        try {
            chrome.action.setBadgeText({ text: "!" });
            chrome.action.setBadgeBackgroundColor({ color: "#007BFF" });
            setTimeout(() => {
                chrome.action.setBadgeText({ text: "" });
            }, 3000);
        } catch (error) {
            console.log('Notification fallback:', title, '-', message);
        }
    }
}

// Function to download a single file
function downloadFile(url, customFilename = null) {
    if (!url || url.trim() === '') {
        showDownloadNotification('Download Failed', 'Invalid URL provided');
        return;
    }
    
    const filename = customFilename || getFileName(url);
    
    console.log('Downloading:', url, 'as', filename);
    
    chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: false
    }, (downloadId) => {
        if (chrome.runtime.lastError) {
            console.error('Download error:', chrome.runtime.lastError);
            showDownloadNotification('Download Failed', `Cannot download: ${chrome.runtime.lastError.message || 'Unknown error'}`);
        } else {
            showDownloadNotification('Download Started', `Downloading: ${filename}`);
        }
    });
}

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'download') {
        console.log('Download request:', request.url);
        
        // Validate URL
        if (!request.url || request.url.trim() === '') {
            showDownloadNotification('Download Failed', 'No valid URL provided');
            sendResponse({success: false, error: 'No URL provided'});
            return true;
        }
        
        // Basic URL validation
        try {
            new URL(request.url);
        } catch (error) {
            showDownloadNotification('Download Failed', 'Invalid URL format');
            sendResponse({success: false, error: 'Invalid URL'});
            return true;
        }
        
        // Download the file
        downloadFile(request.url, request.filename);
        sendResponse({success: true, message: 'Download started'});
        
    } else if (request.action === 'download_all') {
        if (request.items && request.items.length > 0) {
            // Filter to only valid URLs
            const validItems = request.items.filter(item => {
                if (!item.url || item.url.trim() === '') return false;
                try {
                    new URL(item.url);
                    return true;
                } catch {
                    return false;
                }
            });
            
            if (validItems.length > 0) {
                // Show confirmation dialog
                if (confirm(`This will download ${validItems.length} media files. Are you sure?`)) {
                    validItems.forEach(item => {
                        setTimeout(() => {
                            downloadFile(item.url, item.filename);
                        }, 100); // Small delay between downloads
                    });
                    sendResponse({success: true, count: validItems.length});
                } else {
                    sendResponse({success: false, cancelled: true});
                }
            } else {
                showDownloadNotification('No Media', 'No valid media files found to download');
                sendResponse({success: false, error: 'No valid media files'});
            }
        } else {
            sendResponse({success: false, error: 'No items provided'});
        }
        
    } else if (request.action === 'show_notification') {
        showDownloadNotification(request.title || 'Media Saver', request.message || '');
        sendResponse({success: true});
    }
    
    return true; // Keep message channel open for async responses
});

// Create a context menu item
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'download-media',
        title: 'Download Media',
        contexts: ['image', 'video']
    });
});

// Listener for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'download-media') {
        const url = info.srcUrl;
        
        if (!url) {
            showDownloadNotification('Download Failed', 'No media source found');
            return;
        }
        
        const urlLower = url.toLowerCase();
        const blockedDomains = ['youtube.com', 'youtu.be', 'vimeo.com'];
        const isBlocked = blockedDomains.some(domain => urlLower.includes(domain));
        
        if (isBlocked) {
            showDownloadNotification('Blocked', 'Downloading from this site is not supported.');
            return;
        }
        
        // Check if it looks like a supported file
        const isSupported = urlLower.includes('.gif') || 
                           urlLower.includes('.mp4') || 
                           urlLower.includes('.webm') ||
                           urlLower.includes('video/');
        
        if (isSupported) {
            downloadFile(url);
        } else {
            showDownloadNotification('Unsupported Format', 'File type may not be supported');
            // Try anyway in case it's a video with no extension
            downloadFile(url);
        }
    }
});

// Optional: Listen for download completion to show a notification
chrome.downloads.onChanged.addListener((delta) => {
    if (delta.state && delta.state.current === 'complete') {
        chrome.downloads.search({id: delta.id}, (results) => {
            if (results && results.length > 0) {
                showDownloadNotification('Download Complete', `Saved: ${results[0].filename}`);
            }
        });
    }
    
    if (delta.state && delta.state.current === 'interrupted') {
        chrome.downloads.search({id: delta.id}, (results) => {
            if (results && results.length > 0) {
                showDownloadNotification('Download Failed', `Failed to download: ${results[0].filename}`);
            }
        });
    }
});