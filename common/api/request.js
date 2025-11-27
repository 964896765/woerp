/**
 * HTTP 请求封装
 * 基于 uni.request 封装，提供统一的请求处理
 */

/**
 * 请求配置
 */
const config = {
  // 请求超时时间（毫秒）
  timeout: process.env.VUE_APP_REQUEST_TIMEOUT || 30000,
  // 是否显示加载提示
  showLoading: true,
  // 加载提示文字
  loadingText: '加载中...',
}

/**
 * 请求拦截器
 * @param {Object} options - 请求配置
 * @returns {Object} 处理后的请求配置
 */
function requestInterceptor(options) {
  // 添加认证令牌
  const token = uni.getStorageSync('access_token')
  if (token) {
    options.header = options.header || {}
    options.header['Authorization'] = `Bearer ${token}`
  }

  // 添加通用请求头
  options.header = {
    'Content-Type': 'application/json',
    ...options.header,
  }

  // 显示加载提示
  if (options.showLoading !== false && config.showLoading) {
    uni.showLoading({
      title: options.loadingText || config.loadingText,
      mask: true,
    })
  }

  // 打印请求日志（开发环境）
  if (process.env.NODE_ENV === 'development' && process.env.VUE_APP_ENABLE_LOG) {
    console.log('[Request]', options.method, options.url)
    console.log('[Request Data]', options.data)
  }

  return options
}

/**
 * 响应拦截器
 * @param {Object} response - 响应对象
 * @returns {Promise} 处理后的响应数据
 */
function responseInterceptor(response) {
  // 隐藏加载提示
  uni.hideLoading()

  const { statusCode, data } = response

  // 打印响应日志（开发环境）
  if (process.env.NODE_ENV === 'development' && process.env.VUE_APP_ENABLE_LOG) {
    console.log('[Response]', statusCode, data)
  }

  // HTTP 状态码检查
  if (statusCode !== 200) {
    return handleHttpError(statusCode, response)
  }

  // 业务状态码检查
  if (data.code !== 200) {
    return handleBusinessError(data)
  }

  // 返回数据
  return Promise.resolve(data.data)
}

/**
 * 错误拦截器
 * @param {Object} error - 错误对象
 * @returns {Promise} 拒绝的 Promise
 */
function errorInterceptor(error) {
  // 隐藏加载提示
  uni.hideLoading()

  // 打印错误日志
  console.error('[Request Error]', error)

  // 显示错误提示
  uni.showToast({
    title: error.errMsg || '网络请求失败',
    icon: 'none',
    duration: 2000,
  })

  return Promise.reject(error)
}

/**
 * 处理 HTTP 错误
 * @param {Number} statusCode - HTTP 状态码
 * @param {Object} response - 响应对象
 * @returns {Promise} 拒绝的 Promise
 */
function handleHttpError(statusCode, response) {
  let message = '请求失败'

  switch (statusCode) {
    case 400:
      message = '请求参数错误'
      break
    case 401:
      message = '未授权，请重新登录'
      // 清除令牌并跳转到登录页
      uni.removeStorageSync('access_token')
      uni.reLaunch({
        url: '/pages/login/login',
      })
      break
    case 403:
      message = '拒绝访问'
      break
    case 404:
      message = '请求的资源不存在'
      break
    case 500:
      message = '服务器内部错误'
      break
    case 502:
      message = '网关错误'
      break
    case 503:
      message = '服务不可用'
      break
    case 504:
      message = '网关超时'
      break
    default:
      message = `请求失败 (${statusCode})`
  }

  uni.showToast({
    title: message,
    icon: 'none',
    duration: 2000,
  })

  return Promise.reject({ statusCode, message, response })
}

/**
 * 处理业务错误
 * @param {Object} data - 响应数据
 * @returns {Promise} 拒绝的 Promise
 */
function handleBusinessError(data) {
  const message = data.message || '操作失败'

  uni.showToast({
    title: message,
    icon: 'none',
    duration: 2000,
  })

  return Promise.reject({ code: data.code, message, error: data.error })
}

/**
 * 发起 HTTP 请求
 * @param {Object} options - 请求配置
 * @returns {Promise} 请求 Promise
 */
function request(options) {
  // 请求拦截
  options = requestInterceptor(options)

  // 发起请求
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      timeout: options.timeout || config.timeout,
      success: (response) => {
        responseInterceptor(response)
          .then(resolve)
          .catch(reject)
      },
      fail: (error) => {
        errorInterceptor(error)
          .then(resolve)
          .catch(reject)
      },
    })
  })
}

/**
 * GET 请求
 * @param {String} url - 请求地址
 * @param {Object} params - 请求参数
 * @param {Object} options - 其他配置
 * @returns {Promise} 请求 Promise
 */
export function get(url, params = {}, options = {}) {
  return request({
    url,
    method: 'GET',
    data: params,
    ...options,
  })
}

/**
 * POST 请求
 * @param {String} url - 请求地址
 * @param {Object} data - 请求数据
 * @param {Object} options - 其他配置
 * @returns {Promise} 请求 Promise
 */
export function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options,
  })
}

/**
 * PUT 请求
 * @param {String} url - 请求地址
 * @param {Object} data - 请求数据
 * @param {Object} options - 其他配置
 * @returns {Promise} 请求 Promise
 */
export function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options,
  })
}

/**
 * DELETE 请求
 * @param {String} url - 请求地址
 * @param {Object} params - 请求参数
 * @param {Object} options - 其他配置
 * @returns {Promise} 请求 Promise
 */
export function del(url, params = {}, options = {}) {
  return request({
    url,
    method: 'DELETE',
    data: params,
    ...options,
  })
}

/**
 * 上传文件
 * @param {String} url - 上传地址
 * @param {String} filePath - 文件路径
 * @param {Object} formData - 表单数据
 * @param {Object} options - 其他配置
 * @returns {Promise} 上传 Promise
 */
export function upload(url, filePath, formData = {}, options = {}) {
  // 获取认证令牌
  const token = uni.getStorageSync('access_token')
  const header = {
    'Authorization': token ? `Bearer ${token}` : '',
    ...options.header,
  }

  // 显示加载提示
  if (options.showLoading !== false) {
    uni.showLoading({
      title: '上传中...',
      mask: true,
    })
  }

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url,
      filePath,
      name: options.name || 'file',
      formData,
      header,
      success: (response) => {
        uni.hideLoading()
        
        try {
          const data = JSON.parse(response.data)
          if (data.code === 200) {
            resolve(data.data)
          } else {
            handleBusinessError(data).catch(reject)
          }
        } catch (error) {
          reject(error)
        }
      },
      fail: (error) => {
        uni.hideLoading()
        errorInterceptor(error).catch(reject)
      },
    })
  })
}

/**
 * 下载文件
 * @param {String} url - 下载地址
 * @param {Object} options - 其他配置
 * @returns {Promise} 下载 Promise
 */
export function download(url, options = {}) {
  // 显示加载提示
  if (options.showLoading !== false) {
    uni.showLoading({
      title: '下载中...',
      mask: true,
    })
  }

  return new Promise((resolve, reject) => {
    uni.downloadFile({
      url,
      success: (response) => {
        uni.hideLoading()
        
        if (response.statusCode === 200) {
          resolve(response.tempFilePath)
        } else {
          reject(response)
        }
      },
      fail: (error) => {
        uni.hideLoading()
        errorInterceptor(error).catch(reject)
      },
    })
  })
}

export default {
  get,
  post,
  put,
  delete: del,
  upload,
  download,
}
