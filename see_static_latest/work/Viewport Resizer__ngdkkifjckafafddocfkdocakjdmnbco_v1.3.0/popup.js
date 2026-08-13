const PRESETS = [
  { label: "Full HD",           w: 1920, h: 1080 },
  { label: "QHD / 2K",         w: 2560, h: 1440 },
  { label: "HD+ (Laptop)",     w: 1366, h: 768  },
  { label: "WXGA+ (Laptop)",   w: 1440, h: 900  },
  { label: "HD+ Scaled",       w: 1536, h: 864  },
  { label: "HD 720p",          w: 1280, h: 720  },
  { label: "SXGA",             w: 1280, h: 800  },
  { label: "WXGA+",            w: 1600, h: 900  },
  { label: "4K / UHD",         w: 3840, h: 2160 },
  { label: "MacBook Pro 14\"", w: 1512, h: 982  },
  { label: "MacBook Pro 16\"", w: 1728, h: 1117 },
];

const presetsEl = document.getElementById("presets");
const currentSizeEl = document.getElementById("current-size");

chrome.windows.getCurrent(function (win) {
  currentSizeEl.textContent = win.width + " × " + win.height;

  PRESETS.forEach(function (preset) {
    const li = document.createElement("li");

    if (win.width === preset.w && win.height === preset.h) {
      li.classList.add("active");
    }

    const label = document.createElement("span");
    label.className = "preset-label";
    label.textContent = preset.label;

    const dims = document.createElement("span");
    dims.className = "preset-dims";
    dims.textContent = preset.w + "×" + preset.h;

    li.appendChild(label);
    li.appendChild(dims);

    li.addEventListener("click", function () {
      chrome.windows.update(win.id, {
        width: preset.w,
        height: preset.h,
        state: "normal",
      }, function () {
        window.close();
      });
    });

    presetsEl.appendChild(li);
  });
});
