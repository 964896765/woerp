/**
 * 工具函数集合
 */

/**
 * 格式化日期时间
 * @param {Date|String|Number} date - 日期对象、时间戳或日期字符串
 * @param {String} format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {String} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''

  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 格式化数字（添加千分位分隔符）
 * @param {Number|String} num - 数字
 * @param {Number} decimals - 小数位数，默认2位
 * @returns {String} 格式化后的数字字符串
 */
export function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined || num === '') return ''

  const number = parseFloat(num)
  if (isNaN(number)) return ''

  const fixed = number.toFixed(decimals)
  const parts = fixed.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return parts.join('.')
}

/**
 * 格式化金额
 * @param {Number|String} amount - 金额
 * @param {String} symbol - 货币符号，默认 '¥'
 * @param {Number} decimals - 小数位数，默认2位
 * @returns {String} 格式化后的金额字符串
 */
export function formatMoney(amount, symbol = '¥', decimals = 2) {
  const formatted = formatNumber(amount, decimals)
  return formatted ? `${symbol}${formatted}` : ''
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {Number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, delay = 300) {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {Number} delay - 间隔时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, delay = 300) {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      func.apply(this, args)
    }
  }
}

/**
 * 深拷贝
 * @param {*} obj - 要拷贝的对象
 * @returns {*} 拷贝后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj

  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))

  const clonedObj = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key])
    }
  }

  return clonedObj
}

/**
 * 生成唯一ID
 * @returns {String} 唯一ID
 */
export function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 验证手机号
 * @param {String} phone - 手机号
 * @returns {Boolean} 是否有效
 */
export function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 验证邮箱
 * @param {String} email - 邮箱地址
 * @returns {Boolean} 是否有效
 */
export function validateEmail(email) {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
}

/**
 * 验证身份证号
 * @param {String} idCard - 身份证号
 * @returns {Boolean} 是否有效
 */
export function validateIdCard(idCard) {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard)
}

/**
 * 获取文件扩展名
 * @param {String} filename - 文件名
 * @returns {String} 扩展名（小写）
 */
export function getFileExtension(filename) {
  if (!filename) return ''
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

/**
 * 格式化文件大小
 * @param {Number} bytes - 字节数
 * @returns {String} 格式化后的文件大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * 数组去重
 * @param {Array} arr - 数组
 * @param {String} key - 对象数组时的唯一键
 * @returns {Array} 去重后的数组
 */
export function uniqueArray(arr, key) {
  if (!Array.isArray(arr)) return []

  if (key) {
    const seen = new Set()
    return arr.filter(item => {
      const val = item[key]
      if (seen.has(val)) return false
      seen.add(val)
      return true
    })
  }

  return [...new Set(arr)]
}

/**
 * 数组分组
 * @param {Array} arr - 数组
 * @param {String|Function} key - 分组键或分组函数
 * @returns {Object} 分组后的对象
 */
export function groupBy(arr, key) {
  if (!Array.isArray(arr)) return {}

  return arr.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key]
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {})
}

/**
 * 获取 URL 参数
 * @param {String} name - 参数名
 * @param {String} url - URL，默认为当前页面URL
 * @returns {String|null} 参数值
 */
export function getUrlParam(name, url) {
  if (!url) url = window.location.href
  
  const regex = new RegExp(`[?&]${name}=([^&#]*)`, 'i')
  const match = url.match(regex)
  
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * 对象转 URL 参数
 * @param {Object} obj - 对象
 * @returns {String} URL 参数字符串
 */
export function objectToUrlParams(obj) {
  if (!obj || typeof obj !== 'object') return ''

  return Object.keys(obj)
    .filter(key => obj[key] !== null && obj[key] !== undefined && obj[key] !== '')
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&')
}

/**
 * 存储数据到本地
 * @param {String} key - 键名
 * @param {*} value - 值
 */
export function setStorage(key, value) {
  try {
    uni.setStorageSync(key, JSON.stringify(value))
  } catch (error) {
    console.error('setStorage error:', error)
  }
}

/**
 * 从本地获取数据
 * @param {String} key - 键名
 * @param {*} defaultValue - 默认值
 * @returns {*} 存储的值
 */
export function getStorage(key, defaultValue = null) {
  try {
    const value = uni.getStorageSync(key)
    return value ? JSON.parse(value) : defaultValue
  } catch (error) {
    console.error('getStorage error:', error)
    return defaultValue
  }
}

/**
 * 删除本地存储数据
 * @param {String} key - 键名
 */
export function removeStorage(key) {
  try {
    uni.removeStorageSync(key)
  } catch (error) {
    console.error('removeStorage error:', error)
  }
}

/**
 * 清空本地存储
 */
export function clearStorage() {
  try {
    uni.clearStorageSync()
  } catch (error) {
    console.error('clearStorage error:', error)
  }
}

/**
 * 显示提示信息
 * @param {String} title - 提示内容
 * @param {String} icon - 图标类型：success/error/none
 * @param {Number} duration - 持续时间（毫秒）
 */
export function showToast(title, icon = 'none', duration = 2000) {
  uni.showToast({
    title,
    icon,
    duration,
  })
}

/**
 * 显示确认对话框
 * @param {String} content - 提示内容
 * @param {String} title - 标题
 * @returns {Promise<Boolean>} 用户是否确认
 */
export function showConfirm(content, title = '提示') {
  return new Promise((resolve) => {
    uni.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm)
      },
      fail: () => {
        resolve(false)
      },
    })
  })
}

/**
 * 复制文本到剪贴板
 * @param {String} text - 要复制的文本
 * @returns {Promise<Boolean>} 是否成功
 */
export function copyText(text) {
  return new Promise((resolve) => {
    uni.setClipboardData({
      data: text,
      success: () => {
        showToast('复制成功')
        resolve(true)
      },
      fail: () => {
        showToast('复制失败', 'error')
        resolve(false)
      },
    })
  })
}

/**
 * 拨打电话
 * @param {String} phoneNumber - 电话号码
 */
export function makePhoneCall(phoneNumber) {
  uni.makePhoneCall({
    phoneNumber,
    fail: () => {
      showToast('拨号失败', 'error')
    },
  })
}

/**
 * 扫描二维码
 * @returns {Promise<String>} 扫描结果
 */
export function scanCode() {
  return new Promise((resolve, reject) => {
    uni.scanCode({
      success: (res) => {
        resolve(res.result)
      },
      fail: (error) => {
        reject(error)
      },
    })
  })
}

export default {
  formatDate,
  formatNumber,
  formatMoney,
  debounce,
  throttle,
  deepClone,
  generateId,
  validatePhone,
  validateEmail,
  validateIdCard,
  getFileExtension,
  formatFileSize,
  uniqueArray,
  groupBy,
  getUrlParam,
  objectToUrlParams,
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
  showToast,
  showConfirm,
  copyText,
  makePhoneCall,
  scanCode,
}
