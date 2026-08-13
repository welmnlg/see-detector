import "./_virtual_wxt-html-plugins-Cyikj0JH.js";
var FFMessageType;
(function(FFMessageType2) {
  FFMessageType2["LOAD"] = "LOAD";
  FFMessageType2["EXEC"] = "EXEC";
  FFMessageType2["FFPROBE"] = "FFPROBE";
  FFMessageType2["WRITE_FILE"] = "WRITE_FILE";
  FFMessageType2["READ_FILE"] = "READ_FILE";
  FFMessageType2["DELETE_FILE"] = "DELETE_FILE";
  FFMessageType2["RENAME"] = "RENAME";
  FFMessageType2["CREATE_DIR"] = "CREATE_DIR";
  FFMessageType2["LIST_DIR"] = "LIST_DIR";
  FFMessageType2["DELETE_DIR"] = "DELETE_DIR";
  FFMessageType2["ERROR"] = "ERROR";
  FFMessageType2["DOWNLOAD"] = "DOWNLOAD";
  FFMessageType2["PROGRESS"] = "PROGRESS";
  FFMessageType2["LOG"] = "LOG";
  FFMessageType2["MOUNT"] = "MOUNT";
  FFMessageType2["UNMOUNT"] = "UNMOUNT";
})(FFMessageType || (FFMessageType = {}));
const getMessageID = /* @__PURE__ */ (() => {
  let messageID = 0;
  return () => messageID++;
})();
const ERROR_NOT_LOADED = new Error("ffmpeg is not loaded, call `await ffmpeg.load()` first");
const ERROR_TERMINATED = new Error("called FFmpeg.terminate()");
class FFmpeg {
  #worker = null;
  /**
   * #resolves and #rejects tracks Promise resolves and rejects to
   * be called when we receive message from web worker.
   */
  #resolves = {};
  #rejects = {};
  #logEventCallbacks = [];
  #progressEventCallbacks = [];
  loaded = false;
  /**
   * register worker message event handlers.
   */
  #registerHandlers = () => {
    if (this.#worker) {
      this.#worker.onmessage = ({ data: { id, type, data } }) => {
        switch (type) {
          case FFMessageType.LOAD:
            this.loaded = true;
            this.#resolves[id](data);
            break;
          case FFMessageType.MOUNT:
          case FFMessageType.UNMOUNT:
          case FFMessageType.EXEC:
          case FFMessageType.FFPROBE:
          case FFMessageType.WRITE_FILE:
          case FFMessageType.READ_FILE:
          case FFMessageType.DELETE_FILE:
          case FFMessageType.RENAME:
          case FFMessageType.CREATE_DIR:
          case FFMessageType.LIST_DIR:
          case FFMessageType.DELETE_DIR:
            this.#resolves[id](data);
            break;
          case FFMessageType.LOG:
            this.#logEventCallbacks.forEach((f) => f(data));
            break;
          case FFMessageType.PROGRESS:
            this.#progressEventCallbacks.forEach((f) => f(data));
            break;
          case FFMessageType.ERROR:
            this.#rejects[id](data);
            break;
        }
        delete this.#resolves[id];
        delete this.#rejects[id];
      };
    }
  };
  /**
   * Generic function to send messages to web worker.
   */
  #send = ({ type, data }, trans = [], signal) => {
    if (!this.#worker) {
      return Promise.reject(ERROR_NOT_LOADED);
    }
    return new Promise((resolve, reject) => {
      const id = getMessageID();
      this.#worker && this.#worker.postMessage({ id, type, data }, trans);
      this.#resolves[id] = resolve;
      this.#rejects[id] = reject;
      signal?.addEventListener("abort", () => {
        reject(new DOMException(`Message # ${id} was aborted`, "AbortError"));
      }, { once: true });
    });
  };
  on(event, callback) {
    if (event === "log") {
      this.#logEventCallbacks.push(callback);
    } else if (event === "progress") {
      this.#progressEventCallbacks.push(callback);
    }
  }
  off(event, callback) {
    if (event === "log") {
      this.#logEventCallbacks = this.#logEventCallbacks.filter((f) => f !== callback);
    } else if (event === "progress") {
      this.#progressEventCallbacks = this.#progressEventCallbacks.filter((f) => f !== callback);
    }
  }
  /**
   * Loads ffmpeg-core inside web worker. It is required to call this method first
   * as it initializes WebAssembly and other essential variables.
   *
   * @category FFmpeg
   * @returns `true` if ffmpeg core is loaded for the first time.
   */
  load = ({ classWorkerURL, ...config } = {}, { signal } = {}) => {
    if (!this.#worker) {
      this.#worker = classWorkerURL ? new Worker(new URL(classWorkerURL, self.location.href), {
        type: "module"
      }) : (
        // We need to duplicated the code here to enable webpack
        // to bundle worekr.js here.
        new Worker(new URL("./worker.js", self.location.href), {
          type: "module"
        })
      );
      this.#registerHandlers();
    }
    return this.#send({
      type: FFMessageType.LOAD,
      data: config
    }, void 0, signal);
  };
  /**
   * Execute ffmpeg command.
   *
   * @remarks
   * To avoid common I/O issues, ["-nostdin", "-y"] are prepended to the args
   * by default.
   *
   * @example
   * ```ts
   * const ffmpeg = new FFmpeg();
   * await ffmpeg.load();
   * await ffmpeg.writeFile("video.avi", ...);
   * // ffmpeg -i video.avi video.mp4
   * await ffmpeg.exec(["-i", "video.avi", "video.mp4"]);
   * const data = ffmpeg.readFile("video.mp4");
   * ```
   *
   * @returns `0` if no error, `!= 0` if timeout (1) or error.
   * @category FFmpeg
   */
  exec = (args, timeout = -1, { signal } = {}) => this.#send({
    type: FFMessageType.EXEC,
    data: { args, timeout }
  }, void 0, signal);
  /**
   * Execute ffprobe command.
   *
   * @example
   * ```ts
   * const ffmpeg = new FFmpeg();
   * await ffmpeg.load();
   * await ffmpeg.writeFile("video.avi", ...);
   * // Getting duration of a video in seconds: ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 video.avi -o output.txt
   * await ffmpeg.ffprobe(["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", "video.avi", "-o", "output.txt"]);
   * const data = ffmpeg.readFile("output.txt");
   * ```
   *
   * @returns `0` if no error, `!= 0` if timeout (1) or error.
   * @category FFmpeg
   */
  ffprobe = (args, timeout = -1, { signal } = {}) => this.#send({
    type: FFMessageType.FFPROBE,
    data: { args, timeout }
  }, void 0, signal);
  /**
   * Terminate all ongoing API calls and terminate web worker.
   * `FFmpeg.load()` must be called again before calling any other APIs.
   *
   * @category FFmpeg
   */
  terminate = () => {
    const ids = Object.keys(this.#rejects);
    for (const id of ids) {
      this.#rejects[id](ERROR_TERMINATED);
      delete this.#rejects[id];
      delete this.#resolves[id];
    }
    if (this.#worker) {
      this.#worker.terminate();
      this.#worker = null;
      this.loaded = false;
    }
  };
  /**
   * Write data to ffmpeg.wasm.
   *
   * @example
   * ```ts
   * const ffmpeg = new FFmpeg();
   * await ffmpeg.load();
   * await ffmpeg.writeFile("video.avi", await fetchFile("../video.avi"));
   * await ffmpeg.writeFile("text.txt", "hello world");
   * ```
   *
   * @category File System
   */
  writeFile = (path, data, { signal } = {}) => {
    const trans = [];
    if (data instanceof Uint8Array) {
      trans.push(data.buffer);
    }
    return this.#send({
      type: FFMessageType.WRITE_FILE,
      data: { path, data }
    }, trans, signal);
  };
  mount = (fsType, options, mountPoint) => {
    const trans = [];
    return this.#send({
      type: FFMessageType.MOUNT,
      data: { fsType, options, mountPoint }
    }, trans);
  };
  unmount = (mountPoint) => {
    const trans = [];
    return this.#send({
      type: FFMessageType.UNMOUNT,
      data: { mountPoint }
    }, trans);
  };
  /**
   * Read data from ffmpeg.wasm.
   *
   * @example
   * ```ts
   * const ffmpeg = new FFmpeg();
   * await ffmpeg.load();
   * const data = await ffmpeg.readFile("video.mp4");
   * ```
   *
   * @category File System
   */
  readFile = (path, encoding = "binary", { signal } = {}) => this.#send({
    type: FFMessageType.READ_FILE,
    data: { path, encoding }
  }, void 0, signal);
  /**
   * Delete a file.
   *
   * @category File System
   */
  deleteFile = (path, { signal } = {}) => this.#send({
    type: FFMessageType.DELETE_FILE,
    data: { path }
  }, void 0, signal);
  /**
   * Rename a file or directory.
   *
   * @category File System
   */
  rename = (oldPath, newPath, { signal } = {}) => this.#send({
    type: FFMessageType.RENAME,
    data: { oldPath, newPath }
  }, void 0, signal);
  /**
   * Create a directory.
   *
   * @category File System
   */
  createDir = (path, { signal } = {}) => this.#send({
    type: FFMessageType.CREATE_DIR,
    data: { path }
  }, void 0, signal);
  /**
   * List directory contents.
   *
   * @category File System
   */
  listDir = (path, { signal } = {}) => this.#send({
    type: FFMessageType.LIST_DIR,
    data: { path }
  }, void 0, signal);
  /**
   * Delete an empty directory.
   *
   * @category File System
   */
  deleteDir = (path, { signal } = {}) => this.#send({
    type: FFMessageType.DELETE_DIR,
    data: { path }
  }, void 0, signal);
}
var FFFSType;
(function(FFFSType2) {
  FFFSType2["MEMFS"] = "MEMFS";
  FFFSType2["NODEFS"] = "NODEFS";
  FFFSType2["NODERAWFS"] = "NODERAWFS";
  FFFSType2["IDBFS"] = "IDBFS";
  FFFSType2["WORKERFS"] = "WORKERFS";
  FFFSType2["PROXYFS"] = "PROXYFS";
})(FFFSType || (FFFSType = {}));
const workerUrl = "/assets/worker-D3WqxKMJ.js";
const readFromBlobOrFile = (blob) => new Promise((resolve, reject) => {
  const fileReader = new FileReader();
  fileReader.onload = () => {
    const { result } = fileReader;
    if (result instanceof ArrayBuffer) {
      resolve(new Uint8Array(result));
    } else {
      resolve(new Uint8Array());
    }
  };
  fileReader.onerror = (event) => {
    reject(Error(`File could not be read! Code=${event?.target?.error?.code || -1}`));
  };
  fileReader.readAsArrayBuffer(blob);
});
const fetchFile = async (file) => {
  let data;
  if (typeof file === "string") {
    if (/data:_data\/([a-zA-Z]*);base64,([^"]*)/.test(file)) {
      data = atob(file.split(",")[1]).split("").map((c) => c.charCodeAt(0));
    } else {
      data = await (await fetch(file)).arrayBuffer();
    }
  } else if (file instanceof URL) {
    data = await (await fetch(file)).arrayBuffer();
  } else if (file instanceof File || file instanceof Blob) {
    data = await readFromBlobOrFile(file);
  } else {
    return new Uint8Array();
  }
  return new Uint8Array(data);
};
let ffmpeg = null;
async function getFFmpeg() {
  if (ffmpeg && ffmpeg.loaded) return ffmpeg;
  ffmpeg = new FFmpeg();
  ffmpeg.on("log", ({ message }) => {
  });
  await ffmpeg.load({
    coreURL: chrome.runtime.getURL("/ffmpeg/ffmpeg-core.js"),
    wasmURL: chrome.runtime.getURL("/ffmpeg/ffmpeg-core.wasm"),
    workerURL: chrome.runtime.getURL("/ffmpeg/ffmpeg-core.worker.js"),
    classWorkerURL: new URL(workerUrl, self.location.href).toString()
  });
  return ffmpeg;
}
async function mergeVideoAudio(videoBlob, audioBlob) {
  const ff = await getFFmpeg();
  await ff.writeFile("video.mp4", await fetchFile(videoBlob));
  await ff.writeFile("audio.mp4", await fetchFile(audioBlob));
  await ff.exec([
    "-i",
    "video.mp4",
    "-i",
    "audio.mp4",
    "-c",
    "copy",
    "-movflags",
    "+faststart",
    "output.mp4"
  ]);
  const data = await ff.readFile("output.mp4");
  await ff.deleteFile("video.mp4");
  await ff.deleteFile("audio.mp4");
  await ff.deleteFile("output.mp4");
  return new Blob([data.slice().buffer], { type: "video/mp4" });
}
class DownloadError extends Error {
  stage;
  constructor(stage, message) {
    super(message ?? stage);
    this.name = "DownloadError";
    this.stage = stage;
  }
}
function toDownloadError(err) {
  if (err instanceof DownloadError) return err;
  const message = err instanceof Error ? err.message : void 0;
  return new DownloadError("UNKNOWN", message);
}
const TAG = "[Offscreen]";
function log(...args) {
}
function logError(...args) {
  console.error(TAG, ...args);
}
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  log("Received message:", JSON.stringify(message));
  if (message.target !== "offscreen") {
    return;
  }
  if (message.action === "mergeAndDownload") {
    const startTime = performance.now();
    handleMergeAndDownload(message.payload).then(() => {
      (performance.now() - startTime).toFixed(0);
      sendResponse({ success: true });
    }).catch((err) => {
      const elapsed = (performance.now() - startTime).toFixed(0);
      const e = toDownloadError(err);
      logError(
        `mergeAndDownload failed after ${elapsed}ms [${e.stage}]:`,
        e.message,
        err
      );
      sendResponse({ error: e.message, stage: e.stage });
    });
    return true;
  }
  log("Unknown action:", message.action);
});
async function handleMergeAndDownload(payload) {
  const { videoUrl, audioUrl, filename } = payload;
  log("Payload received:", {
    videoUrl: videoUrl.slice(0, 80) + "...",
    audioUrl: audioUrl ? audioUrl.slice(0, 80) + "..." : null,
    filename
  });
  let blob;
  if (audioUrl) {
    const fetchStart = performance.now();
    const [videoResp, audioResp] = await Promise.all([
      fetch(videoUrl),
      fetch(audioUrl)
    ]);
    log(
      `Fetch responses received: video ${videoResp.status}, audio ${audioResp.status} (${(performance.now() - fetchStart).toFixed(0)}ms)`
    );
    if (!videoResp.ok)
      throw new DownloadError(
        "FETCH_FAILED",
        `Video fetch failed: ${videoResp.status} ${videoResp.statusText}`
      );
    if (!audioResp.ok)
      throw new DownloadError(
        "FETCH_FAILED",
        `Audio fetch failed: ${audioResp.status} ${audioResp.statusText}`
      );
    const blobStart = performance.now();
    const [videoBlob, audioBlob] = await Promise.all([
      videoResp.blob(),
      audioResp.blob()
    ]);
    log(
      `Blobs created: video ${(videoBlob.size / 1024 / 1024).toFixed(2)}MB, audio ${(audioBlob.size / 1024 / 1024).toFixed(2)}MB (${(performance.now() - blobStart).toFixed(0)}ms)`
    );
    const mergeStart = performance.now();
    try {
      blob = await mergeVideoAudio(videoBlob, audioBlob);
    } catch (err) {
      throw new DownloadError(
        "MERGE_FAILED",
        err instanceof Error ? err.message : "FFmpeg merge failed"
      );
    }
    log(
      `FFmpeg merge done: output ${(blob.size / 1024 / 1024).toFixed(2)}MB (${(performance.now() - mergeStart).toFixed(0)}ms)`
    );
  } else {
    const fetchStart = performance.now();
    const resp = await fetch(videoUrl);
    log(
      `Video fetch response: ${resp.status} (${(performance.now() - fetchStart).toFixed(0)}ms)`
    );
    if (!resp.ok)
      throw new DownloadError(
        "FETCH_FAILED",
        `Video fetch failed: ${resp.status} ${resp.statusText}`
      );
    blob = await resp.blob();
    log(`Video blob created: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 3e3);
}
