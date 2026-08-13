/**
 * FAI NSFW Filter - AI Worker
 * Handles ONNX model inference in a separate thread to avoid blocking the main thread
 */

// Import ONNX Runtime
importScripts(chrome.runtime.getURL('lib/onnxruntime-web.min.js'));

class NSFWAIWorker {
  constructor() {
    this.session = null;
    this.isInitialized = false;
    this.modelPath = chrome.runtime.getURL('models/model.onnx');
    this.configPath = chrome.runtime.getURL('models/config.json');
    this.labelsPath = chrome.runtime.getURL('models/labels.json');
    this.config = null;
    this.labels = null;
    this.initPromise = null;
    this.processingQueue = new Map();
    this.init();
  }

  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.loadModel();
    return this.initPromise;
  }

  async loadModel() {
    try {
      // Load model configuration and labels
      await this.loadConfig();
      
      // Set ONNX Runtime to use WASM backend for better performance
      ort.env.wasm.wasmPaths = {
        'ort-wasm.wasm': chrome.runtime.getURL('lib/ort-wasm.wasm'),
        'ort-wasm-simd.wasm': chrome.runtime.getURL('lib/ort-wasm-simd.wasm'),
        'ort-wasm-threaded.wasm': chrome.runtime.getURL('lib/ort-wasm-threaded.wasm')
      };

      // Configure ONNX Runtime
      ort.env.wasm.numThreads = 1; // Use single thread to avoid blocking
      ort.env.wasm.simd = true;
      ort.env.logLevel = 'warning';

      // Load the model
      this.session = await ort.InferenceSession.create(this.modelPath, {
        executionProviders: ['wasm'],
        enableMemPattern: false,
        enableCpuMemArena: false,
        extra: {
          session: {
            intra_op_num_threads: 1,
            inter_op_num_threads: 1
          }
        }
      });

      this.isInitialized = true;
      console.log('FAI NSFW Filter: AI model loaded successfully');
      console.log('Model input size:', this.config.size);
      console.log('Model labels:', this.labels);
      
      // Notify that model is ready
      self.postMessage({
        type: 'modelReady',
        success: true,
        config: this.config,
        labels: this.labels
      });

    } catch (error) {
      console.error('FAI NSFW Filter: Failed to load AI model:', error);
      this.isInitialized = false;
      
      self.postMessage({
        type: 'modelReady',
        success: false,
        error: error.message
      });
    }
  }

  async loadConfig() {
    try {
      // Load model configuration
      const configResponse = await fetch(this.configPath);
      this.config = await configResponse.json();
      
      // Load labels
      const labelsResponse = await fetch(this.labelsPath);
      this.labels = await labelsResponse.json();
      
      console.log('FAI NSFW Filter: Model configuration loaded', this.config);
    } catch (error) {
      console.error('FAI NSFW Filter: Failed to load model config:', error);
      // Use default configuration
      this.config = {
        do_resize: true,
        size: { height: 32, width: 32 },
        do_normalize: true,
        image_mean: [0.5, 0.5, 0.5],
        image_std: [0.5, 0.5, 0.5]
      };
      this.labels = { "0": "normal", "1": "nsfw" };
    }
  }

  async processImage(imageId, imageData, width, height) {
    if (!this.isInitialized) {
      throw new Error('Model not initialized');
    }

    try {
      // Preprocess the image
      const inputTensor = this.preprocessImage(imageData, width, height);
      
      // Run inference
      const feeds = { [this.session.inputNames[0]]: inputTensor };
      const results = await this.session.run(feeds);
      
      // Post-process results
      const output = results[this.session.outputNames[0]];
      const predictions = this.postprocessOutput(output);
      
      return {
        imageId,
        predictions,
        isNSFW: predictions.nsfw > 0.5,
        confidence: predictions.nsfw
      };

    } catch (error) {
      console.error('FAI NSFW Filter: Inference error:', error);
      throw error;
    }
  }

  preprocessImage(imageData, width, height) {
    // Get model input size from configuration
    const modelHeight = this.config.size.height;
    const modelWidth = this.config.size.width;
    
    // Resize image to model input size
    const resizedData = this.resizeImageData(imageData, width, height, modelWidth, modelHeight);
    
    // Convert to RGB and normalize according to model config
    const rgbData = new Float32Array(3 * modelWidth * modelHeight);
    const mean = this.config.image_mean;
    const std = this.config.image_std;
    
    for (let i = 0; i < modelWidth * modelHeight; i++) {
      const pixelIndex = i * 4; // RGBA format
      
      // Convert to RGB and normalize
      const r = resizedData[pixelIndex] / 255.0;
      const g = resizedData[pixelIndex + 1] / 255.0;
      const b = resizedData[pixelIndex + 2] / 255.0;
      
      rgbData[i] = (r - mean[0]) / std[0]; // R
      rgbData[modelWidth * modelHeight + i] = (g - mean[1]) / std[1]; // G
      rgbData[2 * modelWidth * modelHeight + i] = (b - mean[2]) / std[2]; // B
    }
    
    // Create tensor with shape [1, 3, height, width]
    return new ort.Tensor('float32', rgbData, [1, 3, modelHeight, modelWidth]);
  }

  resizeImageData(imageData, srcWidth, srcHeight, dstWidth, dstHeight) {
    const srcData = imageData;
    const dstData = new Uint8ClampedArray(dstWidth * dstHeight * 4);
    
    const xRatio = srcWidth / dstWidth;
    const yRatio = srcHeight / dstHeight;
    
    for (let y = 0; y < dstHeight; y++) {
      for (let x = 0; x < dstWidth; x++) {
        const srcX = Math.floor(x * xRatio);
        const srcY = Math.floor(y * yRatio);
        
        const srcIndex = (srcY * srcWidth + srcX) * 4;
        const dstIndex = (y * dstWidth + x) * 4;
        
        dstData[dstIndex] = srcData[srcIndex];     // R
        dstData[dstIndex + 1] = srcData[srcIndex + 1]; // G
        dstData[dstIndex + 2] = srcData[srcIndex + 2]; // B
        dstData[dstIndex + 3] = 255; // A
      }
    }
    
    return dstData;
  }

  postprocessOutput(outputTensor) {
    const data = outputTensor.data;
    
    // Binary classification model output [normal, nsfw]
    const normalScore = data[0];
    const nsfwScore = data[1];
    
    return {
      normal: normalScore,
      nsfw: nsfwScore,
      safe: normalScore, // Alias for compatibility
      predictions: {
        normal: normalScore,
        nsfw: nsfwScore
      },
      labels: this.labels
    };
  }

  // Batch processing for better performance
  async processBatch(images) {
    const results = [];
    
    for (const { imageId, imageData, width, height } of images) {
      try {
        const result = await this.processImage(imageId, imageData, width, height);
        results.push(result);
      } catch (error) {
        results.push({
          imageId,
          error: error.message,
          isNSFW: false,
          confidence: 0
        });
      }
    }
    
    return results;
  }
}

// Initialize the worker
const aiWorker = new NSFWAIWorker();

// Handle messages from the main thread
self.onmessage = async function(event) {
  const { type, data } = event.data;
  
  try {
    switch (type) {
      case 'processImage':
        if (!aiWorker.isInitialized) {
          await aiWorker.init();
        }
        
        const result = await aiWorker.processImage(
          data.imageId,
          data.imageData,
          data.width,
          data.height
        );
        
        self.postMessage({
          type: 'imageProcessed',
          data: result
        });
        break;
        
      case 'processBatch':
        if (!aiWorker.isInitialized) {
          await aiWorker.init();
        }
        
        const batchResults = await aiWorker.processBatch(data.images);
        
        self.postMessage({
          type: 'batchProcessed',
          data: { results: batchResults }
        });
        break;
        
      case 'checkModelStatus':
        self.postMessage({
          type: 'modelStatus',
          data: { isInitialized: aiWorker.isInitialized }
        });
        break;
        
      default:
        console.warn('Unknown message type:', type);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: {
        message: error.message,
        originalType: type
      }
    });
  }
};