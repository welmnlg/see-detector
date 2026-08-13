// Function to check if URL is from a blocked domain (like YouTube)
function isBlockedDomain(url) {
    const blockedDomains = [
        'youtube.com',
        'youtu.be',
        'vimeo.com',
        'dailymotion.com',
        'twitch.tv',
        'netflix.com'
    ];
    
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();
        
        return blockedDomains.some(domain => hostname.includes(domain));
    } catch (error) {
        return false;
    }
}

// Function to check if URL is a supported media type
function isSupportedMedia(url) {
    if (!url) return false;
    
    // Check for direct file extensions
    const supportedExtensions = ['.mp4', '.gif', '.webm', '.mov', '.avi'];
    const urlLower = url.toLowerCase();
    
    // Check for file extensions
    const hasExtension = supportedExtensions.some(ext => urlLower.includes(ext));
    
    // Also check for common video URL patterns
    const isVideoURL = urlLower.includes('/video/') || 
                       urlLower.includes('/videos/') || 
                       urlLower.includes('.mp4?') ||
                       urlLower.includes('video/mp4');
    
    return hasExtension || isVideoURL;
}

// Function to get video source from different types of video elements
function getMediaSource(mediaElement) {
    // For images, just return src
    if (mediaElement.tagName === 'IMG') {
        return mediaElement.src;
    }
    
    // For videos, try multiple sources
    if (mediaElement.tagName === 'VIDEO') {
        // Try src attribute first
        if (mediaElement.src && mediaElement.src !== '') {
            return mediaElement.src;
        }
        
        // Try currentSrc (actual loaded source)
        if (mediaElement.currentSrc && mediaElement.currentSrc !== '') {
            return mediaElement.currentSrc;
        }
        
        // Try source elements inside video tag
        const sourceElements = mediaElement.querySelectorAll('source');
        for (const source of sourceElements) {
            if (source.src && source.src !== '') {
                return source.src;
            }
        }
        
        // Try poster image as fallback
        if (mediaElement.poster && mediaElement.poster !== '') {
            return mediaElement.poster;
        }
    }
    
    return null;
}

// Function to add a download button to a media element
function addDownloadButton(mediaElement) {
    const mediaUrl = getMediaSource(mediaElement);
    
    if (!mediaUrl) return;
    
    // Check if media is supported and not from blocked domain
    if (!isSupportedMedia(mediaUrl) || isBlockedDomain(mediaUrl)) {
        return;
    }
    
    // Check if already has button
    if (mediaElement.closest('.media-saver-container')) {
        return;
    }

    const container = document.createElement('div');
    container.classList.add('media-saver-container');

    // Wrap the media element with the container
    mediaElement.parentNode.insertBefore(container, mediaElement);
    container.appendChild(mediaElement);

    const button = document.createElement('button');
    button.innerText = 'Download';
    button.classList.add('media-saver-download-button');
    
    // Add file type indicator
    const urlLower = mediaUrl.toLowerCase();
    let fileType = 'File';
    if (urlLower.includes('.gif')) fileType = 'GIF';
    else if (urlLower.includes('.mp4') || urlLower.includes('video/mp4')) fileType = 'MP4';
    else if (urlLower.includes('.webm')) fileType = 'WebM';
    
    button.title = `Download ${fileType}`;

    button.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        // Validate URL before sending
        if (!mediaUrl || mediaUrl.trim() === '') {
            alert('Cannot download: No valid media source found');
            return;
        }
        
        // Send a message to the background script to download the media
        chrome.runtime.sendMessage({
            action: 'download',
            url: mediaUrl,
            filename: getFileNameFromURL(mediaUrl)
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError);
            }
        });
    });

    container.appendChild(button);
}

// Function to get filename from URL
function getFileNameFromURL(url) {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
        
        // If no filename in URL, create one
        if (!filename || filename === '' || filename.includes('?')) {
            const extension = url.toLowerCase().includes('.gif') ? '.gif' : 
                            url.toLowerCase().includes('.mp4') ? '.mp4' : 
                            url.toLowerCase().includes('.webm') ? '.webm' : '.media';
            return `download${Date.now()}${extension}`;
        }
        
        return filename;
    } catch (error) {
        const extension = url.toLowerCase().includes('.gif') ? '.gif' : 
                         url.toLowerCase().includes('.mp4') ? '.mp4' : 
                         url.toLowerCase().includes('.webm') ? '.webm' : '.media';
        return `downloaded-file${Date.now()}${extension}`;
    }
}

// Function to find and process all media elements on the page
function processMediaElements() {
    const mediaElements = document.querySelectorAll('img, video');
    let supportedCount = 0;
    
    mediaElements.forEach(element => {
        const url = getMediaSource(element);
        if (url && isSupportedMedia(url) && !isBlockedDomain(url)) {
            addDownloadButton(element);
            supportedCount++;
        }
    });
    
    console.log(`Media Saver: Found ${supportedCount} downloadable media files`);
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    
    if (request.action === 'get_media_count') {
        const mediaElements = document.querySelectorAll('img, video');
        let count = 0;
        
        mediaElements.forEach(element => {
            const url = getMediaSource(element);
            if (url && isSupportedMedia(url) && !isBlockedDomain(url)) {
                count++;
            }
        });
        
        sendResponse({count: count});
    }
});

// Initial run with slight delay to ensure page is loaded
setTimeout(processMediaElements, 1000);

// Use a MutationObserver to detect dynamically added media
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
                if (node.matches('img, video')) {
                    const url = getMediaSource(node);
                    if (url && isSupportedMedia(url) && !isBlockedDomain(url)) {
                        setTimeout(() => addDownloadButton(node), 100);
                    }
                }
                const mediaElements = node.querySelectorAll('img, video');
                mediaElements.forEach((element) => {
                    const url = getMediaSource(element);
                    if (url && isSupportedMedia(url) && !isBlockedDomain(url)) {
                        setTimeout(() => addDownloadButton(element), 100);
                    }
                });
            }
        });
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});