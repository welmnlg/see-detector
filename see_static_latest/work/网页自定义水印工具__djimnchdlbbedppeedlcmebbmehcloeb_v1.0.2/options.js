let configs = []
let currentConfigId = null

const defaultConfig = {
  name: '新配置',
  domains: '',
  text: '生产环境',
  color: '#ff0000',
  opacity: 0.15,
  density: 300,
  fontSize: 25,
  enabled: true,
}

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Toast 通知函数
const showToast = (msg) => {
  const toast = document.getElementById('toast')
  toast.textContent = msg
  toast.classList.add('show')
  setTimeout(() => toast.classList.remove('show'), 2500)
}

document.addEventListener('DOMContentLoaded', () => {
  loadConfigs()

  document.getElementById('add-config-btn').onclick = addNewConfig
  document.getElementById('save-btn').onclick = saveCurrentConfig
  document.getElementById('delete-config-btn').onclick = deleteCurrentConfig

  // 新增：复制按钮点击事件
  document.getElementById('copy-config-btn').onclick = copyCurrentConfig

  // 联动更新
  const binders = [
    { id: 'opacity', valId: 'opacity-val' },
    { id: 'density', valId: 'density-val' },
    { id: 'fontsize', valId: 'fontsize-val' },
  ]
  binders.forEach((b) => {
    document.getElementById(b.id).oninput = (e) => {
      document.getElementById(b.valId).textContent = e.target.value
    }
  })

  // 颜色 Hex 实时显示
  document.getElementById('color').oninput = (e) => {
    document.getElementById('color-hex').textContent =
      e.target.value.toUpperCase()
  }
})

const loadConfigs = () => {
  chrome.storage.sync.get({ configs: [] }, (items) => {
    configs = items.configs

    // 关键修正：无论有没有配置，都先执行一次渲染 ---
    // renderConfigList 内部第一行就是 listEl.innerHTML = ''，
    // 如果 configs 为空，它会把左侧列表彻底清空。
    renderConfigList()

    if (configs.length === 0) {
      document.getElementById('editor-view').style.display = 'none'
      document.getElementById('empty-state').style.display = 'block'
    } else {
      document.getElementById('editor-view').style.display = 'block'
      document.getElementById('empty-state').style.display = 'none'
      // 已经渲染过列表了，这里直接加载表单即可
      loadForm(currentConfigId || configs[0].id)
    }
  })
}
const renderConfigList = () => {
  const listEl = document.getElementById('config-list')
  listEl.innerHTML = ''

  configs.forEach((config) => {
    const li = document.createElement('li')
    // 确保 id 存在，防止 dataset 赋值 undefined 字符串
    const configId = config.id || 'temp-id'
    const firstDomain = (config.domains || '').split('\n')[0] || '未设置域名'

    li.innerHTML = `
      <strong>${config.name || '未命名'} ${
      config.enabled
        ? ''
        : '<span style="color:#94a3b8;font-weight:normal">(已禁用)</span>'
    }</strong>
    `
    // 为元素添加 ID 和域名数据属性，方便后续操作
    li.dataset.id = configId
    li.dataset.domain = firstDomain

    if (configId === currentConfigId) li.classList.add('active')

    li.onclick = () => {
      // 切换前先保存当前正在编辑的内容
      // saveCurrentConfig()
      // 点击列表项时，加载对应配置的表单
      loadForm(configId)
    }
    listEl.appendChild(li)
  })
}

const addNewConfig = () => {
  const newConfig = { ...defaultConfig, id: generateId() }
  configs.push(newConfig)
  saveToStorage(() => {
    currentConfigId = newConfig.id
    loadConfigs()
    showToast('已添加新配置')
  })
}

const loadForm = (id) => {
  if (!id) return
  currentConfigId = id

  const config = configs.find((c) => String(c.id) === String(id))
  if (!config) return

  // 更新左侧列表的激活状态样式
  document.querySelectorAll('#config-list li').forEach((el) => {
    el.classList.toggle('active', String(el.dataset.id) === String(id))
  })

  // 表单赋值
  document.getElementById('config-name').value = config.name
  document.getElementById('domains').value = config.domains
  document.getElementById('text').value = config.text
  document.getElementById('color').value = config.color
  document.getElementById('color-hex').textContent = config.color.toUpperCase()
  document.getElementById('opacity').value = config.opacity
  document.getElementById('density').value = config.density
  document.getElementById('fontsize').value = config.fontSize || 20
  document.getElementById('enabled').checked = config.enabled !== false

  // 同步标签文字
  document.getElementById('opacity-val').textContent = config.opacity
  document.getElementById('density-val').textContent = config.density
  document.getElementById('fontsize-val').textContent = config.fontSize || 20
}

const saveCurrentConfig = () => {
  const index = configs.findIndex((c) => c.id === currentConfigId)
  if (index === -1) return

  configs[index] = {
    ...configs[index],
    name: document.getElementById('config-name').value,
    domains: document.getElementById('domains').value,
    text: document.getElementById('text').value,
    color: document.getElementById('color').value,
    opacity: document.getElementById('opacity').value,
    density: document.getElementById('density').value,
    fontSize: parseInt(document.getElementById('fontsize').value),
    enabled: document.getElementById('enabled').checked,
  }

  saveToStorage(() => {
    showToast('保存成功')
    renderConfigList()
  })
}

const deleteCurrentConfig = () => {
  if (!confirm('确定要删除这个配置吗？')) return
  configs = configs.filter((c) => c.id !== currentConfigId)
  currentConfigId = configs.length > 0 ? configs[0].id : null
  saveToStorage(() => {
    loadConfigs()
    showToast('配置已删除')
  })
}

// cb：callback，一个可选的回调函数，当存储操作完成时会被执行
const saveToStorage = (cb) => chrome.storage.sync.set({ configs }, cb)
// 添加复制逻辑函数
const copyCurrentConfig = () => {
  // 1. 找到当前正在编辑的配置源
  const sourceConfig = configs.find(
    (c) => String(c.id) === String(currentConfigId)
  )
  if (!sourceConfig) {
    showToast('无法复制：未找到当前配置')
    return
  }

  // 2. 创建一个深拷贝对象（防止引用污染）
  const newConfig = {
    ...JSON.parse(JSON.stringify(sourceConfig)),
    id: generateId(), // 生成新 ID
    name: sourceConfig.name + ' - 副本', // 自动添加后缀
  }

  // 3. 插入到当前配置的后面
  const index = configs.findIndex((c) => c.id === currentConfigId)
  configs.splice(index + 1, 0, newConfig)

  // 4. 保存并跳转到新配置
  saveToStorage(() => {
    currentConfigId = newConfig.id
    loadConfigs() // 重新加载列表和表单
    showToast('已复制配置')
  })
}
