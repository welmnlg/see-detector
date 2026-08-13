/**
 * FAI NSFW Filter - Image Processor
 * Handles efficient image data extraction and processing
 */

class ImageProcessor {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.initCanvas();
  }

  initCanvas() {
    // Create offscreen canvas for image processing
    // Use 32x32 to match the model's input size
    this.canvas = new OffscreenCanvas(32, 32);
    this.ctx = this.canvas.getContext('2d', {
      willReadFrequently: true,
      alpha: false
    });
  }

  async extractImageData(element) {
    try {
      // Handle different element types
      if (element.tagName === 'IMG') {
        return await this.extractFromImage(element);
      } else if (element.tagName === 'VIDEO') {
        return await this.extractFromVideo(element);
      } else if (element.tagName === 'CANVAS') {
        return await this.extractFromCanvas(element);
      } else if (element.tagName === 'PICTURE') {
        const img = element.querySelector('img');
        if (img) {
          return await this.extractFromImage(img);
        }
      }
      
      return null;
    } catch (error) {
      console.log('FAI NSFW Filter: Error extracting image data:', error);
      return null;
    }
  }

  async extractFromImage(img) {
    return new Promise((resolve) => {
      // Skip if image is not loaded or too small
      if (!img.complete || !img.naturalWidth || !img.naturalHeight) {
        resolve(null);
        return;
      }

      const width = img.naturalWidth;
      const height = img.naturalHeight;

      // Skip very small images to improve performance
      if (width < 50 || height < 50) {
        resolve(null);
        return;
      }

      try {
        // Resize to model input size (32x32)
        this.ctx.clearRect(0, 0, 32, 32);
        this.ctx.drawImage(img, 0, 0, 32, 32);
        
        const imageData = this.ctx.getImageData(0, 0, 32, 32);
        
        resolve({
          data: imageData.data,
          width: 32,
          height: 32,
          originalWidth: width,
          originalHeight: height
        });
      } catch (error) {
        // Handle CORS or other canvas errors
        console.log('FAI NSFW Filter: Canvas extraction failed, trying alternative method');
        this.extractWithFetch(img.src).then(resolve).catch(() => resolve(null));
      }
    });
  }

  async extractFromVideo(video) {
    return new Promise((resolve) => {
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        resolve(null);
        return;
      }

      try {
        const width = video.videoWidth;
        const height = video.videoHeight;

        this.ctx.clearRect(0, 0, 32, 32);
        this.ctx.drawImage(video, 0, 0, 32, 32);
        
        const imageData = this.ctx.getImageData(0, 0, 32, 32);
        
        resolve({
          data: imageData.data,
          width: 32,
          height: 32,
          originalWidth: width,
          originalHeight: height
        });
      } catch (error) {
        resolve(null);
      }
    });
  }

  async extractFromCanvas(canvas) {
    try {
      if (canvas.width === 0 || canvas.height === 0) {
        return null;
      }

      const width = canvas.width;
      const height = canvas.height;

      this.ctx.clearRect(0, 0, 32, 32);
      this.ctx.drawImage(canvas, 0, 0, 32, 32);
      
      const imageData = this.ctx.getImageData(0, 0, 32, 32);
      
      return {
        data: imageData.data,
        width: 32,
        height: 32,
        originalWidth: width,
        originalHeight: height
      };
    } catch (error) {
      return null;
    }
  }

  async extractWithFetch(src) {
    try {
      // Only try to fetch if it's a data URL or same-origin
      if (!src.startsWith('data:') && !this.isSameOrigin(src)) {
        return null;
      }

      const response = await fetch(src);
      const blob = await response.blob();
      
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          try {
            this.ctx.clearRect(0, 0, 32, 32);
            this.ctx.drawImage(img, 0, 0, 32, 32);
            
            const imageData = this.ctx.getImageData(0, 0, 32, 32);
            
            resolve({
              data: imageData.data,
              width: 32,
              height: 32,
              originalWidth: img.naturalWidth,
              originalHeight: img.naturalHeight
            });
          } catch (error) {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = URL.createObjectURL(blob);
      });
    } catch (error) {
      return null;
    }
  }

  isSameOrigin(url) {
    try {
      const urlObj = new URL(url, window.location.href);
      return urlObj.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  // Efficient batch processing
  async extractBatch(elements, maxConcurrent = 3) {
    const results = [];
    const semaphore = new Semaphore(maxConcurrent);
    
    const promises = elements.map(async (element, index) => {
      await semaphore.acquire();
      
      try {
        const imageData = await this.extractImageData(element);
        if (imageData) {
          results.push({
            element,
            imageId: this.generateImageId(element, index),
            imageData: imageData.data,
            width: imageData.width,
            height: imageData.height
          });
        }
      } finally {
        semaphore.release();
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  generateImageId(element, index) {
    // Use the reliable ID from the element if available
    const faiId = element.getAttribute('data-fai-id');
    if (faiId) {
      return faiId;
    }
    
    // Fallback to generating an ID (though this should rarely happen)
    const src = element.src || element.currentSrc || '';
    const rect = element.getBoundingClientRect();
    const timestamp = Date.now();
    return `img_${index}_${rect.width}x${rect.height}_${timestamp}_${src.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`;
  }
}

// Simple semaphore for concurrency control
class Semaphore {
  constructor(max) {
    this.max = max;
    this.count = 0;
    this.waiting = [];
  }

  async acquire() {
    if (this.count < this.max) {
      this.count++;
      return;
    }

    return new Promise(resolve => {
      this.waiting.push(resolve);
    });
  }

  release() {
    this.count--;
    if (this.waiting.length > 0) {
      const next = this.waiting.shift();
      this.count++;
      next();
    }
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ImageProcessor, Semaphore };
} else if (typeof window !== 'undefined') {
  window.ImageProcessor = ImageProcessor;
  window.Semaphore = Semaphore;
}