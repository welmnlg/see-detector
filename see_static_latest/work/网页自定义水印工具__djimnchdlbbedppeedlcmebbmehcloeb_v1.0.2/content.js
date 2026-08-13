const WATERMARK_ID = 'my-custom-watermark-overlay'

const init = () => {
  chrome.storage.sync.get({ configs: [] }, (items) => {
    checkAndRender(items.configs)
  })
}

const checkAndRender = (configs) => {
  const currentDomain = window.location.hostname.toLowerCase()

  // 找出所有匹配成功的配置
  const matches = []

  configs.forEach((config) => {
    if (config.enabled === false) return

    const domainList = config.domains
      .split('\n')
      .map((d) => d.trim().toLowerCase())
      .filter((d) => d)

    domainList.forEach((domain) => {
      // 匹配逻辑：
      // A. 完全相等 (baidu.com === baidu.com)
      // B. 后缀匹配且前面是点 (uat.baidu.com 以 .baidu.com 结尾)
      const isMatch =
        currentDomain === domain || currentDomain.endsWith('.' + domain)

      if (isMatch) {
        matches.push({
          config: config,
          domainLength: domain.length, // 记录匹配字符串的长度，越长代表越精准
        })
      }
    })
  })

  // 2. 如果有多个匹配，按匹配域名的长度从大到小排序（最长匹配优先）
  // 比如：uat.baidu.com (13位) 比 baidu.com (9位) 更精准，排在前面
  matches.sort((a, b) => b.domainLength - a.domainLength)

  // 3. 移除现有的水印
  const existing = document.getElementById(WATERMARK_ID)
  if (existing) existing.remove()

  // 4. 取最精准的一个配置进行绘制
  if (matches.length > 0) {
    drawWatermark(matches[0].config)
  }
}

const drawWatermark = (settings) => {
  // 解构配置参数
  const { text, opacity, density, color, fontSize } = settings
  if (!text) return

  const canvas = document.createElement('canvas')
  const gap = parseInt(density) || 300
  canvas.width = gap
  canvas.height = gap

  const ctx = canvas.getContext('2d')

  // 使用自定义字体大小，默认20px
  const size = fontSize || 20
  ctx.font = `${size}px Microsoft YaHei, sans-serif`

  ctx.fillStyle = color
  ctx.globalAlpha = parseFloat(opacity)

  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((-45 * Math.PI) / 180)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.fillText(text, 0, 0)

  const dataURL = canvas.toDataURL('image/png')

  const overlay = document.createElement('div')
  overlay.id = WATERMARK_ID
  overlay.style.position = 'fixed'
  overlay.style.top = '0'
  overlay.style.left = '0'
  overlay.style.width = '100vw'
  overlay.style.height = '100vh'
  overlay.style.pointerEvents = 'none'
  overlay.style.zIndex = '999999'
  overlay.style.backgroundImage = `url(${dataURL})`
  overlay.style.backgroundRepeat = 'repeat'

  document.body.appendChild(overlay)
}

// 监听存储变化，当用户修改配置时自动重新初始化
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    init()
  }
})

init()
