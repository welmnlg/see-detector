"use strict";

const defaults = {
  dragThreshold: 10,
  moveThreshold: 10,
  moveSpeed: 10,
  stickyScroll: true,
  innerScroll: true,
  scrollOnLinks: false,
  sameSpeed: false,
  capSpeed: "",
  shouldCap: false,
  ctrlClick: true,
  middleClick: true
}

// Get the options
chrome.storage.local.get(defaults, (options) => {

  // Update the options when they change
  chrome.storage.onChanged.addListener((o, s) => {
    console.assert(s === "local")
    for (var k in o) {
      var x = o[k]
      if ("newValue" in x) {
        options[k] = x.newValue
      } else if ("oldValue" in x) {
        options[k] = defaults[k]
      }
    }
  })


  const RAD_TO_DEG = Math.PI / 180

  const math = {
    hypot: function (x, y) {
      return Math.sqrt(x * x + y * y)
    },

    max: function (num, cap) {
      var neg = cap * -1
      return (num > cap
               ? cap
               : (num < neg
                   ? neg
                   : num))
    },

    angle: function (x, y) {
      var angle = Math.atan(y / x) / RAD_TO_DEG
      if (x < 0) {
        angle += 180
      } else if (y < 0) {
        angle += 360
      }
      return angle
    }
  }


  function image(o) {
    if (o.width && o.height) {
      return chrome.runtime.getURL("both.svg")
    } else if (o.width) {
      return chrome.runtime.getURL("horizontal.svg")
    } else {
      return chrome.runtime.getURL("vertical.svg")
    }
  }

  function direction(x, y) {
    const angle = math.angle(x, y)
    if (angle < 30 || angle >= 330) {
      return "e-resize"
    } else if (angle < 60) {
      return "se-resize"
    } else if (angle < 120) {
      return "s-resize"
    } else if (angle < 150) {
      return "sw-resize"
    } else if (angle < 210) {
      return "w-resize"
    } else if (angle < 240) {
      return "nw-resize"
    } else if (angle < 300) {
      return "n-resize"
    } else {
      return "ne-resize"
    }
  }


  const state = {
    timeout: null,

    oldX: null,
    oldY: null,

    dirX: 0,
    dirY: 0,

    click: false,
    scrolling: false,

    originWidth: false,
    originHeight: false,
    initialImage: null
  }

  const htmlNamespace = "http://www.w3.org/1999/xhtml"

  const htmlNode = document.documentElement

  // This is needed to support SVG
  const bodyNode = (document.body
                   ? document.body
                   : htmlNode)

  // The timer that does the actual scrolling; must be very fast so that the scrolling is smooth
  function startCycle(elem, scroller, root) {
    // This is needed to support SVG
    let scrollX = (root ? window.scrollX : scroller.scrollLeft)
      , scrollY = (root ? window.scrollY : scroller.scrollTop)

    function loop() {
      state.timeout = requestAnimationFrame(loop)

      var scrollWidth  = scroller.scrollWidth  - elem.clientWidth
        , scrollHeight = scroller.scrollHeight - elem.clientHeight

      scrollX += state.dirX
      scrollY += state.dirY

      if (scrollX < 0) {
        scrollX = 0

      } else if (scrollX > scrollWidth) {
        scrollX = scrollWidth
      }

      if (scrollY < 0) {
        scrollY = 0

      } else if (scrollY > scrollHeight) {
        scrollY = scrollHeight
      }

      // This is needed to support SVG
      if (root) {
        // This triggers a reflow
        window.scroll(scrollX, scrollY);

      } else {
        // This triggers a reflow
        scroller.scrollLeft = scrollX
        scroller.scrollTop  = scrollY
      }
    }

    loop();
  }


  function shouldSticky(x, y) {
    return options["stickyScroll"] && /*state.stickyScroll && */math.hypot(x, y) < options["dragThreshold"]
  }

  function scale(value) {
    return value / options["moveSpeed"]
  }


  // This is needed to make AutoScroll work in SVG documents
  const outer = document.createElementNS(htmlNamespace, "auto-scroll")

  // https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow
  const shadow = outer.attachShadow({ mode: "closed" })

  // This is needed to make AutoScroll work in SVG documents
  const inner = document.createElementNS(htmlNamespace, "div")
  // TODO hack to make it so that Chrome doesn't repaint when scrolling
  inner.style.setProperty("transform", "translateZ(0)")
  inner.style.setProperty("display", "none")
  inner.style.setProperty("position", "fixed")
  inner.style.setProperty("left", "0px")
  inner.style.setProperty("top", "0px")
  inner.style.setProperty("width", "100%")
  inner.style.setProperty("height", "100%")
  inner.style.setProperty("z-index", "2147483647") // 32-bit signed int
  inner.style.setProperty("background-repeat", "no-repeat")

  shadow.appendChild(inner)

  function mousewheel(event) {
    // TODO is this a good idea ?
    stopEvent(event, true)
  }

  function mousemove(event) {
    // TODO is this a good idea ?
    stopEvent(event, true)

    let x = event.clientX - state.oldX
    let y = event.clientY - state.oldY

    if (math.hypot(x, y) > options["moveThreshold"]) {
      //state.stickyScroll = false;

      const dir = direction(x, y)

      let img = state.initialImage
      if (dir === "n-resize" || dir === "s-resize") {
        img = chrome.runtime.getURL("vertical.svg")
      } else if (dir === "e-resize" || dir === "w-resize") {
        img = chrome.runtime.getURL("horizontal.svg")
      } else {
        img = chrome.runtime.getURL("both.svg")
      }
      inner.style.setProperty("cursor", "url(\"" + img + "\") 13 13, auto")

      // 10 = 5
      // 5  = 10
      // 1  = 50
      if (options["sameSpeed"]) {
        x = math.max(x, 1) * 50
        //(Options.get("moveSpeed") * 0.04);
        y = math.max(y, 1) * 50
        //(Options.get("moveSpeed") * 0.04);
      }

      x = scale(x)
      y = scale(y)

      if (options["shouldCap"]) {
        x = math.max(x, options["capSpeed"])
        y = math.max(y, options["capSpeed"])
      }

      state.dirX = x
      state.dirY = y

    } else {
      state.dirX = 0
      state.dirY = 0
      inner.style.setProperty("cursor", "url(\"" + state.initialImage + "\") 13 13, auto")
    }
  }

  function mouseup(event) {
    // TODO is this a good idea ?
    stopEvent(event, true)

    const x = event.clientX - state.oldX
    const y = event.clientY - state.oldY

    if (state.click || !shouldSticky(x, y)) {
      unclick()
    } else {
      state.click = true
    }
  }

  function unclick() {
    cancelAnimationFrame(state.timeout)
    state.timeout = null

    removeEventListener("wheel", mousewheel, { capture: true, passive: false })
    removeEventListener("mousemove", mousemove, true)
    removeEventListener("mouseup", mouseup, true)

    normalCursor()

    inner.style.removeProperty("background-image")
    inner.style.removeProperty("background-position")
    inner.style.setProperty("display", "none")

    state.oldX = null
    state.oldY = null

    state.dirX = 0
    state.dirY = 0

    state.click = false
    state.scrolling = false
  }

  function normalCursor() {
    inner.style.removeProperty("cursor")
  }

  function show(o, x, y) {
    state.scrolling = true
    state.oldX = x
    state.oldY = y
    state.originWidth = o.width
    state.originHeight = o.height
    state.initialImage = image(o)

    startCycle(o.element, o.scroller, o.root)

    addEventListener("wheel", mousewheel, { capture: true, passive: false })
    addEventListener("mousemove", mousemove, true)
    addEventListener("mouseup", mouseup, true)

    inner.style.setProperty("cursor", "url(\"" + state.initialImage + "\") 13 13, auto")

    inner.style.removeProperty("display")
  }


  function isInvalid(elem) {
    return elem.isContentEditable ||
           (elem.localName === "a" && elem.href) ||
           (elem.localName === "area" && elem.href) ||
           (elem.localName === "textarea" && isEditableText(elem)) ||
           (elem.localName === "input" && isEditableText(elem));
  }

  function isEditableText(elem) {
    return !(elem.disabled || elem.readOnly);
  }

  function isValid(elem) {
    if (options["scrollOnLinks"]) {
      return true

    } else {
      while (true) {
        if (elem == null) {
          // TODO is this correct ?
          return false

        } else if (elem === document ||
                   elem === htmlNode ||
                   elem === bodyNode) {
          return true

        // TODO better check for this
        } else if (elem.host) {
          elem = elem.host

        } else if (isInvalid(elem)) {
          return false

        } else {
          elem = elem.parentNode
        }
      }
    }
  }


  function canScroll(style) {
    return style === "auto" || style === "scroll"
  }

  function canScrollTop(html, body) {
    switch (html) {
    case "visible":
      return body !== "hidden";

    case "auto":
    case "scroll":
      return true;

    default:
      return false;
    }
  }


  // TODO this isn't quite correct, but it's close enough
  function findScrollTop(element) {
    const scroller = (document.scrollingElement
                     ? document.scrollingElement
                     : bodyNode)

    const htmlStyle = getComputedStyle(htmlNode)
    const bodyStyle = getComputedStyle(bodyNode)

    const width = canScrollTop(htmlStyle.overflowX, bodyStyle.overflowX) &&
                scroller.scrollWidth > element.clientWidth

    const height = canScrollTop(htmlStyle.overflowY, bodyStyle.overflowY) &&
                 scroller.scrollHeight > element.clientHeight

    if (width || height) {
      return {
        element:  element,
        scroller: scroller,
        width:    width,
        height:   height,
        root:     true
      };

    } else {
      return null;
    }
  }

  function findScrollNormal(elem) {
    const style = getComputedStyle(elem)

    const width = canScroll(style.overflowX) &&
                elem.scrollWidth > elem.clientWidth

    const height = canScroll(style.overflowY) &&
                 elem.scrollHeight > elem.clientHeight

    if (width || height) {
      return {
        element:  elem,
        scroller: elem,
        width:    width,
        height:   height,
        root:     false
      }

    } else {
      return null
    }
  }

  // TODO this should handle the case where <body> has its own scrollbar (separate from the viewport's scrollbar)
  function findScroll(elem) {
    if (options["innerScroll"]) {
      while (elem !== document &&
             elem !== htmlNode &&
             elem !== bodyNode) {
        // TODO is this correct ?
        if (elem == null) {
          return null

        // TODO better check for this
        } else if (elem.host) {
          elem = elem.host

        } else {
          const x = findScrollNormal(elem)

          if (x === null) {
            elem = elem.parentNode

          } else {
            return x
          }
        }
      }
    }

    // TODO hack needed to work around non-spec-compliant versions of Chrome
    //      https://code.google.com/p/chromium/issues/detail?id=157855
    if (document.compatMode === "CSS1Compat") {
      return findScrollTop(htmlNode);

    } else {
      return findScrollTop(bodyNode);
    }
  }

  function stopEvent(e, preventDefault) {
    e.stopImmediatePropagation()
    e.stopPropagation()

    if (preventDefault) {
      e.preventDefault()
    }
  }


  htmlNode.appendChild(outer)

  addEventListener("mousedown", (e) => {
    if (state.scrolling) {
      stopEvent(e, true)

    } else {
      const path = e.composedPath()
      // TODO use e.target instead of null ?
      const target = (path.length === 0 ? null : path[0])

      if (target != null &&
          ((e.button === 1 && options["middleClick"]) ||
           (e.button === 0 && (e.ctrlKey || e.metaKey) && options["ctrlClick"])) &&
          // Make sure the click is not on a scrollbar
          // TODO what about using middle click on the scrollbar of a non-<html> element ?
          e.clientX < htmlNode.clientWidth &&
          e.clientY < htmlNode.clientHeight &&
          isValid(target)) {

        const elem = findScroll(target)

        if (elem !== null) {
          stopEvent(e, true)
          show(elem, e.clientX, e.clientY)
        }
      }
    }
  }, true)
})