(function() {
  'use strict';
  
  if (!/^https:\/\/playentry\.org\/(project|iframe|noframe|ws)\//.test(location.href)) return;

  const self_ = self;
  const chrome_ = typeof chrome !== 'undefined' ? chrome : null;
  let entryFHDPlusEnabled = true;
  let lastEntryInstance = null;
  let lastStageInstance = null;
  let initRetryCount = 0;
  const MAX_INIT_RETRIES = 100;
  let isInitialized = false;
  let initTimeoutId = null;

  const getGlobal = () => document.querySelector('iframe.eaizycc0')?.contentWindow || self_;

  async function checkEnabled() {
    try {
      if (chrome_?.storage?.local) {
        const result = await chrome_.storage.local.get(['entryFHD+']);
        entryFHDPlusEnabled = result['entryFHD+'] !== false;
      }
    } catch {
      entryFHDPlusEnabled = true;
    }
    return entryFHDPlusEnabled;
  }

  chrome_?.runtime?.onMessage?.addListener((message, sender, sendResponse) => {
    if (message.action === 'featureToggleChanged' && message.feature === 'entryFHD+') {
      entryFHDPlusEnabled = message.enabled;
      sendResponse({ success: true });
    }
    return true;
  });

  async function waitForEntry() {
    for (let i = 0; i < 50; i++) {
      const Entry = await Promise.resolve(getGlobal()?.Entry).catch(() => null);
      if (Entry?.stage) return true;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return false;
  }

  async function initFeature() {
    const { registerFeature } = window.EntryPlus || {};
    if (registerFeature) {
      if (!isInitialized) {
        registerFeature('entryFHD+', '?EntryFHD+', '1');
        await checkEnabled();
        await waitForEntry();
        startFHDPlusLoop();
        isInitialized = true;
        initRetryCount = 0;
      }
    } else if (initRetryCount < MAX_INIT_RETRIES) {
      initRetryCount++;
      initTimeoutId = setTimeout(initFeature, 100);
    } else {
      initRetryCount = 0;
      watchForEntryPlus();
    }
  }

  function watchForEntryPlus() {
    let checkCount = 0;
    const maxChecks = 25;
    const checkInterval = setInterval(() => {
      checkCount++;
      if ((window.EntryPlus?.registerFeature && !isInitialized) || (checkCount >= maxChecks && !isInitialized)) {
        clearInterval(checkInterval);
        if (checkCount >= maxChecks) initRetryCount = 0;
        initFeature();
      }
    }, 200);
  }

  function handleVisibilityChange() {
    if (document.visibilityState !== 'visible') return;
    
    const needsInit = !isInitialized || !getGlobal()?.Entry?.stage;
    if (needsInit) {
      if (initTimeoutId) clearTimeout(initTimeoutId);
      if (isInitialized) isInitialized = false;
      initRetryCount = 0;
      initFeature();
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  initFeature();

  function startFHDPlusLoop() {
    if (self_.__REQUEST_ANIMATION_FRAME_ID) return;
    
    self_.__REQUEST_ANIMATION_FRAME_ID = requestAnimationFrame(async function frame() {
      self_.__REQUEST_ANIMATION_FRAME_ID = requestAnimationFrame(frame);
      await applyFHDPlus();
    });
  }

  function stopFHDPlusLoop() {
    if (self_.__REQUEST_ANIMATION_FRAME_ID) {
      cancelAnimationFrame(self_.__REQUEST_ANIMATION_FRAME_ID);
      self_.__REQUEST_ANIMATION_FRAME_ID = null;
    }
  }

  function removeEventListeners(target, useWebGL) {
    const remove = useWebGL ? target.removeAllListeners?.bind(target) : target.removeAllEventListeners?.bind(target);
    const events = useWebGL ? ['__pointermove', '__pointerup'] : ['mousedown', 'pressmove'];
    events.forEach(event => remove?.(event));
  }

  function getEventName(useWebGL, event) {
    return useWebGL ? `__pointer${event}` : (event === 'move' ? 'mousedown' : 'pressmove');
  }

  function toCanvasCoords(stageX, stageY, canvas) {
    return {
      x: (stageX - canvas.x) / canvas.scaleX,
      y: (stageY - canvas.y) / canvas.scaleY
    };
  }

  async function applyFHDPlus() {
    if (!(await checkEnabled())) {
      stopFHDPlusLoop();
      return;
    }

    const Entry = await Promise.resolve(getGlobal().Entry).catch(() => {});
    const stage = Entry?.stage;
    if (!stage) return;

    if (lastEntryInstance !== Entry || lastStageInstance !== stage) {
      lastEntryInstance = Entry;
      lastStageInstance = stage;
      stage._entryFHDPlusMessageShown = false;
    }

    const { type, engine, options: { useWebGL } = {} } = Entry || {};
    const canvas = stage?.canvas;
    if (!canvas?.canvas?.offsetWidth) return;
    
    const canvasElement = canvas.canvas;
    const width = Math.round(canvasElement.offsetWidth * devicePixelRatio);
    const height = Math.round(width * 9 / 16);

    if (useWebGL) {
      const findTree = (v) => [v, ...v.children.flatMap(findTree)];
      canvas.children.flatMap(findTree)
        .filter(v => v.resolution)
        .forEach(text => { text.resolution = width / 640; });
    }

    if (canvasElement.width !== width || canvasElement.height !== height) {
      canvasElement.width = width;
      canvasElement.height = height;
      canvas.x = width / 2;
      canvas.y = height / 2;
      canvas.scaleX = width / 480;
      canvas.scaleY = height / 270;

      const { _app } = stage;
      const { screen, renderer } = _app || {};
      if (screen && renderer) {
        screen.width = width;
        screen.height = height;
        renderer.resize(width, height);
        renderer.options.width = width;
        renderer.options.height = height;
      }

      _app?.render?.();
      canvas.update?.();
    }

    try {
      updateInputField(stage, canvas, width, height, useWebGL, Entry);
      patchObjects(Entry, stage, canvas, useWebGL);
      patchVariables(stage, canvas, engine, type, useWebGL);
      updateEventCoordinate(stage, canvas);
    } catch (error) {
      console.error('Entry FHD+ 오류:', error);
      return;
    }

    if (!stage._entryFHDPlusMessageShown) {
      stage._entryFHDPlusMessageShown = true;
      console.log('%c Entry Plus %c Entry FHD+ %c 활성화 됨', 
        'background: black; color: white; border-radius: 5px 0px 0px 5px;', 
        'background: #32D27D; color: white; border-radius: 0px 5px 5px 0px;', '');
    }
  }

  function updateInputField(stage, canvas, width, height, useWebGL, Entry) {
    const inputField = stage.inputField;
    if (!inputField || inputField._isHidden || inputField._padding === width * 13 / 640) return;

    inputField.x(Math.round(width * 3 / 128));
    inputField.y(Math.round(height * 55 / 72));
    inputField.width(Math.max(1, width * 13 / 16));
    inputField.height(Math.max(1, height / 15));
    inputField.padding(width * 13 / 640);
    inputField.borderWidth(width / 320);
    inputField.borderRadius(width / 64);
    inputField.fontSize(width / 32);

    if (useWebGL) {
      const view = inputField.getPixiView();
      view.scale.set(480 / width, 270 / height);
      const coords = toCanvasCoords(inputField._x, inputField._y, canvas);
      view.position.set(coords.x, coords.y);
    }
    
    Entry.requestUpdate = true;
    stage.update();
    Entry.requestUpdate = false;
  }

  function patchObjects(Entry, stage, canvas, useWebGL) {
    if (!Entry?.container?.objects_) return;
    
    Entry.container.objects_.forEach((item, i) => {
      const object = item?.entity?.object;
      if (!object || object._viewportPatched === i) return;
      
      object._viewportPatched = i;
      removeEventListeners(object, useWebGL);
      
      object.on(getEventName(useWebGL, 'move'), ({ stageX, stageY }) => {
        Entry.dispatchEvent('entityClick', object.entity);
        stage.isObjectClick = true;
        if (Entry.type !== 'minimize' && stage.isEntitySelectable()) {
          const coords = toCanvasCoords(stageX, stageY, canvas);
          object.offset = {
            x: -object.parent.x + object.entity.x - coords.x,
            y: -object.parent.y - object.entity.y - coords.y,
          };
          object.cursor = 'move';
          object.entity.initCommand();
          Entry.container.selectObject(object.entity.parent.id);
        }
      });
      
      object.on(getEventName(useWebGL, 'up'), ({ stageX, stageY }) => {
        if (!stage.isEntitySelectable() || object.entity.parent.getLock() || !object.offset) return;
        const coords = toCanvasCoords(stageX, stageY, canvas);
        object.entity.setX(coords.x + object.offset.x);
        object.entity.setY(canvas.y / canvas.scaleY - coords.y - object.offset.y);
        stage.updateObject();
      });
    });
  }

  function patchVariables(stage, canvas, engine, type, useWebGL) {
    if (!stage?.variableContainer?.children) return;
    
    stage.variableContainer.children.forEach((variable, i) => {
      const variableObj = variable?.variable;
      if (!variableObj) return;
      
      const { slideBar_, valueSetter_, resizeHandle_, scrollButton_ } = variableObj;
      patchSlideBar(slideBar_, variableObj, canvas, engine, useWebGL, i);
      patchValueSetter(valueSetter_, variableObj, canvas, engine, useWebGL, i);
      patchResizeHandle(resizeHandle_, variableObj, canvas, useWebGL, i);
      patchScrollButton(scrollButton_, variableObj, canvas, useWebGL, i);
      patchVariable(variable, variableObj, canvas, type, useWebGL, i);
    });
  }

  function patchElement(element, useWebGL, i, handlers) {
    if (!element || element._viewportPatched === i) return;
    element._viewportPatched = i;
    removeEventListeners(element, useWebGL);
    if (handlers.move) element.on(getEventName(useWebGL, 'move'), handlers.move);
    if (handlers.up) element.on(getEventName(useWebGL, 'up'), handlers.up);
  }

  function patchSlideBar(slideBar_, variableObj, canvas, engine, useWebGL, i) {
    patchElement(slideBar_, useWebGL, i, {
      move: ({ stageX }) => {
        if (engine.isState('run')) {
          variableObj.setSlideCommandX(stageX / canvas.scaleX - variableObj.getX() - canvas.x / canvas.scaleX);
        }
      }
    });
  }

  function patchValueSetter(valueSetter_, variableObj, canvas, engine, useWebGL, i) {
    patchElement(valueSetter_, useWebGL, i, {
      move: ({ stageX }) => {
        if (engine.isState('run')) {
          variableObj.isAdjusting = true;
          valueSetter_.offsetX = stageX / canvas.scaleX - valueSetter_.x;
        }
      },
      up: ({ stageX }) => {
        if (engine.isState('run')) {
          variableObj.setSlideCommandX(stageX / canvas.scaleX - valueSetter_.offsetX + 5);
        }
      }
    });
  }

  function patchResizeHandle(resizeHandle_, variableObj, canvas, useWebGL, i) {
    patchElement(resizeHandle_, useWebGL, i, {
      move: ({ stageX, stageY }) => {
        variableObj.isResizing = true;
        resizeHandle_.offset = {
          x: stageX / canvas.scaleX - variableObj.getWidth(),
          y: stageY / canvas.scaleY - variableObj.getHeight(),
        };
        resizeHandle_.parent.cursor = 'nwse-resize';
      },
      up: ({ stageX, stageY }) => {
        variableObj.setWidth(stageX / canvas.scaleX - resizeHandle_.offset.x);
        variableObj.setHeight(stageY / canvas.scaleY - resizeHandle_.offset.y);
        variableObj.updateView();
      }
    });
  }

  function patchScrollButton(scrollButton_, variableObj, canvas, useWebGL, i) {
    patchElement(scrollButton_, useWebGL, i, {
      move: ({ stageY }) => {
        variableObj.isResizing = true;
        scrollButton_.offsetY = stageY - scrollButton_.y * canvas.scaleY;
      },
      up: ({ stageY }) => {
        const t = Math.max(25, Math.min(variableObj.getHeight() - 30, (stageY - scrollButton_.offsetY) / canvas.scaleY));
        scrollButton_.y = t;
        variableObj.updateView();
      }
    });
  }

  function patchVariable(variable, variableObj, canvas, type, useWebGL, i) {
    patchElement(variable, useWebGL, i, {
      move: ({ stageX, stageY }) => {
        if (type === 'workspace') {
          const coords = toCanvasCoords(stageX, stageY, canvas);
          variable.offset = { x: variable.x - coords.x, y: variable.y - coords.y };
        }
      },
      up: ({ stageX, stageY }) => {
        if (type !== 'workspace' && !variableObj.isResizing && !variableObj.isAdjusting && variable.offset) {
          const coords = toCanvasCoords(stageX, stageY, canvas);
          variableObj.setX(coords.x + variable.offset.x);
          variableObj.setY(coords.y + variable.offset.y);
          variableObj.updateView();
        }
      }
    });
  }

  function updateEventCoordinate(stage, canvas) {
    if (stage?.handle && canvas) {
      stage.handle.getEventCoordinate = ({ stageX, stageY }) => toCanvasCoords(stageX, stageY, canvas);
    }
  }
})();
