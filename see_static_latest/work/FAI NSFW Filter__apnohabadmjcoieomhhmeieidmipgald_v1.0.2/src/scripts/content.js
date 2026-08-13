/**
 * FAI NSFW Filter Content Script
 * AI-powered NSFW detection using ONNX Runtime in background workers
 */

class NSFWFilter {
  constructor() {
    this.isEnabled = true;
    this.blurredElements = new Set();
    this.processedElements = new WeakSet();
    this.elementToIdMap = new WeakMap();
    this.idToElementMap = new Map();
    this.observer = null;
    this.intersectionObserver = null;
    this.aiWorker = null;
    this.imageProcessor = null;
    this.processingQueue = new Set();
    this.batchProcessor = null;
    this.stats = { blocked: 0, processed: 0 };
    this.idCounter = 0;
    this.rescanner = null;
    this.init();
  }

  async init() {
    // Load settings from storage
    await this.loadSettings();
    
    // Initialize AI worker and image processor
    await this.initializeAI();
    
    // Start observing the page for new content
    this.startObserver();
    
    // Start intersection observer for viewport detection
    this.startIntersectionObserver();
    
    // Start periodic rescanning for missed images
    this.startPeriodicRescanner();
    
    // Process existing content with delay to not block page load
    this.scheduleInitialScan();
    
    // Listen for messages from popup/background
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
    });
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['isEnabled']);
      this.isEnabled = result.isEnabled !== false;
    } catch (error) {
      console.log('FAI NSFW Filter: Using default settings');
    }
  }

  async initializeAI() {
    try {
      // Load image processor
      const imageProcessorScript = chrome.runtime.getURL('src/workers/image-processor.js');
      await this.loadScript(imageProcessorScript);
      this.imageProcessor = new window.ImageProcessor();

      // Initialize AI worker
      const workerScript = chrome.runtime.getURL('src/workers/ai-worker.js');
      this.aiWorker = new Worker(workerScript);
      
      // Set up worker message handling
      this.aiWorker.onmessage = (event) => this.handleWorkerMessage(event);
      this.aiWorker.onerror = (error) => console.error('AI Worker Error:', error);

      // Initialize batch processor
      this.batchProcessor = new BatchProcessor(this.aiWorker, this.imageProcessor);
      
      console.log('FAI NSFW Filter: AI system initialized');
    } catch (error) {
      console.error('FAI NSFW Filter: Failed to initialize AI system:', error);
      // Fallback to heuristic detection
      this.aiWorker = null;
    }
  }

  async loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  scheduleInitialScan() {
    // Use requestIdleCallback for non-blocking initial scan
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => this.scanPage(), { timeout: 5000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => this.scanPage(), 100);
    }
  }

  startObserver() {
    this.observer = new MutationObserver((mutations) => {
      // Batch mutations to avoid excessive processing
      const elementsToProcess = new Set();
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check the node itself
            if (this.isMediaElement(node)) {
              elementsToProcess.add(node);
            }
            
            // Check children - no limit to catch all images
            const mediaElements = node.querySelectorAll && 
              node.querySelectorAll('img, video, picture, canvas');
            if (mediaElements) {
              Array.from(mediaElements).forEach(el => {
                elementsToProcess.add(el);
              });
            }
          }
        });
        
        // Also check for attribute changes that might affect image loading
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'src' || mutation.attributeName === 'srcset') &&
            this.isMediaElement(mutation.target)) {
          elementsToProcess.add(mutation.target);
        }
      });

      if (elementsToProcess.size > 0) {
        // Process with slight delay to batch multiple mutations
        this.debounce(() => {
          this.processBatch(Array.from(elementsToProcess));
        }, 50)();
      }
    });

    // Observe document and html elements to catch everything
    const targets = [document.documentElement, document.body].filter(Boolean);
    targets.forEach(target => {
      this.observer.observe(target, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src', 'srcset']
      });
    });
  }

  startIntersectionObserver() {
    if (!window.IntersectionObserver) return;
    
    this.intersectionObserver = new IntersectionObserver((entries) => {
      const visibleElements = entries
        .filter(entry => entry.isIntersecting)
        .map(entry => entry.target)
        .filter(el => this.isMediaElement(el) && !this.processedElements.has(el));
      
      if (visibleElements.length > 0) {
        this.processBatch(visibleElements);
      }
    }, {
      rootMargin: '50px',
      threshold: 0.1
    });
  }

  startPeriodicRescanner() {
    // Periodically rescan for missed images, especially important for lazy-loaded content
    this.rescanner = setInterval(() => {
      if (!this.isEnabled) return;
      
      const allImages = document.querySelectorAll('img, video, picture, canvas');
      const unprocessedImages = Array.from(allImages).filter(img => 
        !this.processedElements.has(img) && 
        !this.shouldSkipElement(img) &&
        this.isElementVisible(img)
      );
      
      if (unprocessedImages.length > 0) {
        console.log(`FAI NSFW Filter: Found ${unprocessedImages.length} unprocessed images, rescanning...`);
        this.processBatch(unprocessedImages.slice(0, 20)); // Process in batches
      }
    }, 3000); // Check every 3 seconds
  }

  scanPage() {
    if (!this.isEnabled) return;
    
    const images = document.querySelectorAll('img, video, picture, canvas');
    const unprocessedImages = Array.from(images).filter(img => 
      !this.processedElements.has(img) && !this.shouldSkipElement(img)
    );

    if (unprocessedImages.length > 0) {
      console.log(`FAI NSFW Filter: Initial scan found ${unprocessedImages.length} images to process`);
      
      // Process all images, but in batches to avoid blocking
      const batchSize = 15;
      for (let i = 0; i < unprocessedImages.length; i += batchSize) {
        const batch = unprocessedImages.slice(i, i + batchSize);
        setTimeout(() => this.processBatch(batch), i * 100); // Stagger processing
      }
    }
  }

  async processBatch(elements) {
    if (!this.isEnabled || !elements.length) return;

    // Filter out elements that are already processed or should be skipped
    const validElements = elements.filter(el => 
      el && el.parentNode && 
      !this.processedElements.has(el) && 
      !this.shouldSkipElement(el)
    );
    
    if (validElements.length === 0) return;

    // Assign unique IDs to elements for reliable tracking
    validElements.forEach(el => this.assignElementId(el));
    
    // Start intersection observation for lazy loading detection
    validElements.forEach(el => {
      if (this.intersectionObserver && !el.hasAttribute('data-fai-observed')) {
        this.intersectionObserver.observe(el);
        el.setAttribute('data-fai-observed', 'true');
      }
    });

    // Use batch processor for efficient AI processing
    if (this.batchProcessor) {
      this.batchProcessor.addToBatch(validElements);
    } else {
      // Fallback to heuristic detection
      validElements.forEach(element => this.analyzeImageHeuristic(element));
    }
  }

  assignElementId(element) {
    if (this.elementToIdMap.has(element)) {
      return this.elementToIdMap.get(element);
    }
    
    const id = `fai-element-${++this.idCounter}`;
    this.elementToIdMap.set(element, id);
    this.idToElementMap.set(id, element);
    element.setAttribute('data-fai-id', id);
    return id;
  }

  isElementVisible(element) {
    if (!element.offsetParent) return false;
    
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 &&
           rect.top < window.innerHeight && rect.bottom > 0 &&
           rect.left < window.innerWidth && rect.right > 0;
  }

  isMediaElement(element) {
    return ['IMG', 'VIDEO', 'PICTURE', 'CANVAS'].includes(element.tagName);
  }

  shouldSkipElement(element) {
    if (this.processedElements.has(element) || this.blurredElements.has(element)) {
      return true;
    }

    // Check if element is being processed
    if (element.hasAttribute('data-fai-processing')) {
      return true;
    }

    const rect = element.getBoundingClientRect();
    const minSize = 30; // Reduced minimum size to catch more images
    
    // Skip if too small
    if (rect.width < minSize || rect.height < minSize) {
      return true;
    }
    
    // Skip if hidden via CSS
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return true;
    }
    
    // Skip if no src and not loaded
    if (element.tagName === 'IMG' && !element.src && !element.srcset && !element.complete) {
      return true;
    }
    
    return false;
  }

  handleWorkerMessage(event) {
    const { type, data } = event.data;
    
    switch (type) {
      case 'imageProcessed':
        this.handleAIResult(data);
        break;
      case 'batchProcessed':
        data.results.forEach(result => this.handleAIResult(result));
        break;
      case 'modelReady':
        if (data.success) {
          console.log('FAI NSFW Filter: AI model ready');
        } else {
          console.error('FAI NSFW Filter: Model loading failed:', data.error);
        }
        break;
      case 'error':
        console.error('FAI NSFW Filter: Worker error:', data);
        break;
    }
  }

  handleAIResult(result) {
    const element = this.findElementById(result.imageId);
    if (!element) return;

    this.processedElements.add(element);
    this.stats.processed++;

    // Report scanned image to background for analytics
    chrome.runtime.sendMessage({ 
      action: 'incrementScanned', 
      count: 1 
    }).catch(() => {
      // Ignore errors if background script is not available
    });

    if (result.error) {
      console.log('FAI NSFW Filter: AI processing error for element:', result.error);
      return;
    }

    // For binary classification, use the model's prediction directly
    if (result.isNSFW) {
      this.blurElement(element, result.confidence);
      this.stats.blocked++;
      
      // Report blocked image to background script for total count
      chrome.runtime.sendMessage({ 
        action: 'incrementBlocked', 
        count: 1 
      }).catch(() => {
        // Ignore errors if background script is not available
      });
    }
  }

  findElementById(imageId) {
    // Use the reliable ID mapping system
    if (this.idToElementMap.has(imageId)) {
      const element = this.idToElementMap.get(imageId);
      // Verify element is still in DOM
      if (element && element.parentNode) {
        return element;
      } else {
        // Clean up stale references
        this.idToElementMap.delete(imageId);
        return null;
      }
    }
    
    // Fallback: try to find by data attribute
    const element = document.querySelector(`[data-fai-id="${imageId}"]`);
    if (element && this.isMediaElement(element)) {
      // Re-add to maps if found
      this.idToElementMap.set(imageId, element);
      this.elementToIdMap.set(element, imageId);
      return element;
    }
    
    return null;
  }

  // Fallback heuristic detection when AI is not available
  async analyzeImageHeuristic(element) {
    if (this.processedElements.has(element)) return;
    this.processedElements.add(element);

    this.stats.processed++;

    // Report scanned image to background for analytics
    chrome.runtime.sendMessage({ 
      action: 'incrementScanned', 
      count: 1 
    }).catch(() => {
      // Ignore errors if background script is not available
    });

    const suspiciousKeywords = ['adult', 'nsfw', 'explicit', 'nude', 'naked', 'sex', 'porn'];
    const altText = (element.alt || '').toLowerCase();
    const src = (element.src || '').toLowerCase();
    const title = (element.title || '').toLowerCase();
    const textToCheck = `${altText} ${src} ${title}`;
    
    const hasKeywords = suspiciousKeywords.some(keyword => textToCheck.includes(keyword));
    
    if (hasKeywords) {
      this.blurElement(element, 0.75);
      this.stats.blocked++;
      
      // Report blocked image to background script for total count
      chrome.runtime.sendMessage({ 
        action: 'incrementBlocked', 
        count: 1 
      }).catch(() => {
        // Ignore errors if background script is not available
      });
    }
  }

  blurElement(element, confidence = 0) {
    if (this.blurredElements.has(element)) return;
    
    element.classList.add('fai-nsfw-blurred');
    this.blurredElements.add(element);
    
    // Add click to reveal functionality
    const wrapper = this.createBlurWrapper(element, confidence);
    element.parentNode.insertBefore(wrapper, element);
    wrapper.appendChild(element);
  }

  createBlurWrapper(element, confidence) {
    const wrapper = document.createElement('div');
    wrapper.className = 'fai-nsfw-wrapper';
    
    const overlay = document.createElement('div');
    overlay.className = 'fai-nsfw-overlay';
    
    const confidenceText = confidence > 0 ? 
      ` (${Math.round(confidence * 100)}% confidence)` : '';
    
    overlay.innerHTML = `
      <div class="fai-nsfw-warning">
        <div class="fai-nsfw-icon"></div>
        <div class="fai-nsfw-text">Content filtered by AI${confidenceText}</div>
        <button class="fai-nsfw-reveal">Click to reveal</button>
      </div>
    `;
    
    overlay.addEventListener('click', (e) => {
      e.stopPropagation();
      wrapper.classList.add('fai-nsfw-revealed');
    });
    
    wrapper.appendChild(overlay);
    return wrapper;
  }

  handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        case 'toggle':
          this.isEnabled = message.enabled;
          this.updatePageFiltering();
          sendResponse({ success: true });
          break;
        case 'getStats':
          const stats = {
            blurredCount: this.blurredElements.size,
            processedCount: this.stats.processed,
            blockedCount: this.stats.blocked,
            isEnabled: this.isEnabled
          };
          console.log('FAI NSFW Filter: Sending comprehensive stats to popup:', stats);
          sendResponse(stats);
          break;
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('FAI NSFW Filter: Error in message handler:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // Keep message channel open
  }

  updatePageFiltering() {
    if (this.isEnabled) {
      // Clear processed elements to allow reprocessing
      this.processedElements = new WeakSet();
      // Clear processing markers
      document.querySelectorAll('[data-fai-processing]').forEach(el => {
        el.removeAttribute('data-fai-processing');
      });
      // Restart periodic rescanner if it was stopped
      if (!this.rescanner) {
        this.startPeriodicRescanner();
      }
      this.scanPage();
    } else {
      this.removeAllBlurring();
      // Stop periodic rescanning
      if (this.rescanner) {
        clearInterval(this.rescanner);
        this.rescanner = null;
      }
    }
  }

  removeAllBlurring() {
    this.blurredElements.forEach(element => {
      element.classList.remove('fai-nsfw-blurred');
      const wrapper = element.closest('.fai-nsfw-wrapper');
      if (wrapper && wrapper.parentNode) {
        wrapper.parentNode.insertBefore(element, wrapper);
        wrapper.remove();
      }
    });
    this.blurredElements.clear();
  }

  rescanPage() {
    this.removeAllBlurring();
    this.processedElements = new WeakSet();
    this.stats = { blocked: 0, processed: 0 };
    
    // Clear ID mappings and processing markers
    this.elementToIdMap = new WeakMap();
    this.idToElementMap = new Map();
    this.idCounter = 0;
    
    document.querySelectorAll('[data-fai-processing], [data-fai-id], [data-fai-observed]').forEach(el => {
      el.removeAttribute('data-fai-processing');
      el.removeAttribute('data-fai-id');
      el.removeAttribute('data-fai-observed');
    });
    
    if (this.isEnabled) {
      this.scheduleInitialScan();
      // Restart periodic rescanning if not already running
      if (!this.rescanner) {
        this.startPeriodicRescanner();
      }
    }
  }

  // Cleanup method for when extension is disabled or page unloads
  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (this.rescanner) {
      clearInterval(this.rescanner);
    }
    if (this.aiWorker) {
      this.aiWorker.terminate();
    }
  }

  // Utility function for debouncing
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Batch Processor for efficient AI processing
class BatchProcessor {
  constructor(worker, imageProcessor) {
    this.worker = worker;
    this.imageProcessor = imageProcessor;
    this.batch = [];
    this.batchSize = 8; // Increased batch size for better performance
    this.processingDelay = 100; // Reduced delay for faster processing
    this.processingTimeout = null;
    this.isProcessing = false;
  }

  addToBatch(elements) {
    // Filter out elements that shouldn't be processed
    const validElements = elements.filter(el => 
      el && el.parentNode && 
      !el.hasAttribute('data-fai-processing') &&
      el.getAttribute('data-fai-id') // Ensure element has reliable ID
    );

    if (validElements.length === 0) return;

    this.batch.push(...validElements);
    
    // Mark elements as being processed to avoid duplicates
    validElements.forEach(el => {
      el.setAttribute('data-fai-processing', 'true');
      console.log(`FAI NSFW Filter: Added ${el.getAttribute('data-fai-id')} to processing batch`);
    });

    // Schedule batch processing
    this.scheduleBatchProcessing();
  }

  scheduleBatchProcessing() {
    if (this.processingTimeout) {
      clearTimeout(this.processingTimeout);
    }

    this.processingTimeout = setTimeout(() => {
      this.processBatch();
    }, this.processingDelay);
  }

  async processBatch() {
    if (this.batch.length === 0 || this.isProcessing) return;

    this.isProcessing = true;
    
    // Take a batch of elements to process
    const elementsToProcess = this.batch.splice(0, this.batchSize);
    
    console.log(`FAI NSFW Filter: Processing batch of ${elementsToProcess.length} images`);
    
    try {
      // Filter out elements that are no longer in DOM
      const validElements = elementsToProcess.filter(el => 
        el && el.parentNode && document.contains(el)
      );
      
      if (validElements.length === 0) {
        console.log('FAI NSFW Filter: No valid elements in batch, skipping');
        return;
      }
      
      // Extract image data from elements
      const imageData = await this.imageProcessor.extractBatch(validElements, 3);
      
      if (imageData.length > 0) {
        console.log(`FAI NSFW Filter: Extracted data from ${imageData.length} images, sending to AI worker`);
        
        // Send to AI worker for processing
        this.worker.postMessage({
          type: 'processBatch',
          data: { images: imageData }
        });
      } else {
        console.log('FAI NSFW Filter: No image data extracted from batch');
        
        // Clean up processing markers if no data was extracted
        validElements.forEach(el => {
          if (el && el.removeAttribute) {
            el.removeAttribute('data-fai-processing');
          }
        });
      }
    } catch (error) {
      console.error('FAI NSFW Filter: Batch processing error:', error);
      
      // Clean up processing markers on error
      elementsToProcess.forEach(el => {
        if (el && el.removeAttribute) {
          el.removeAttribute('data-fai-processing');
        }
      });
    } finally {
      this.isProcessing = false;
      
      // Continue processing if there are more items
      if (this.batch.length > 0) {
        setTimeout(() => this.scheduleBatchProcessing(), 50);
      }
    }
  }
}

// Initialize the filter when the page is ready
let nsfwFilter;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    nsfwFilter = new NSFWFilter();
  });
} else {
  nsfwFilter = new NSFWFilter();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (nsfwFilter) {
    nsfwFilter.cleanup();
  }
});

// Handle page visibility changes (important for Google Images)
document.addEventListener('visibilitychange', () => {
  if (nsfwFilter && !document.hidden) {
    // Page became visible, trigger a rescan to catch any missed images
    setTimeout(() => {
      if (nsfwFilter.isEnabled) {
        console.log('FAI NSFW Filter: Page became visible, triggering rescan');
        nsfwFilter.scanPage();
      }
    }, 500);
  }
});