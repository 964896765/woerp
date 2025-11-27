/**
 * uniCloud 服务封装
 * 提供统一的云函数调用接口
 */

/**
 * 调用云函数
 * @param {String} name - 云函数名称
 * @param {String} action - 操作类型
 * @param {Object} data - 请求数据
 * @param {Object} options - 其他配置
 * @returns {Promise} 请求 Promise
 */
async function callFunction(name, action, data = {}, options = {}) {
  // 显示加载提示
  if (options.showLoading !== false) {
    uni.showLoading({
      title: options.loadingText || '加载中...',
      mask: true
    })
  }
  
  try {
    // 调用云函数
    const result = await uniCloud.callFunction({
      name,
      data: {
        action,
        data
      }
    })
    
    // 隐藏加载提示
    uni.hideLoading()
    
    // 打印日志（开发环境）
    if (process.env.NODE_ENV === 'development' && process.env.VUE_APP_ENABLE_LOG) {
      console.log(`[uniCloud] ${name}.${action}`, data)
      console.log(`[Response]`, result.result)
    }
    
    // 检查响应
    if (result.result.code !== 200) {
      throw new Error(result.result.message || '操作失败')
    }
    
    return result.result.data
  } catch (error) {
    // 隐藏加载提示
    uni.hideLoading()
    
    // 打印错误日志
    console.error(`[uniCloud Error] ${name}.${action}`, error)
    
    // 显示错误提示
    uni.showToast({
      title: error.message || '操作失败',
      icon: 'none',
      duration: 2000
    })
    
    throw error
  }
}

/**
 * 物料服务
 */
export const materialService = {
  /**
   * 获取物料列表
   */
  list(params) {
    return callFunction('material-service', 'list', params)
  },
  
  /**
   * 获取物料详情
   */
  detail(id) {
    return callFunction('material-service', 'detail', { id })
  },
  
  /**
   * 创建物料
   */
  create(data) {
    return callFunction('material-service', 'create', data)
  },
  
  /**
   * 更新物料
   */
  update(id, data) {
    return callFunction('material-service', 'update', { id, ...data })
  },
  
  /**
   * 删除物料
   */
  delete(id) {
    return callFunction('material-service', 'delete', { id })
  },
  
  /**
   * 搜索物料
   */
  search(params) {
    return callFunction('material-service', 'search', params)
  },
  
  /**
   * 批量导入物料
   */
  import(materials, warehouse_type) {
    return callFunction('material-service', 'import', { materials, warehouse_type })
  },
  
  /**
   * 导出物料
   */
  export(params) {
    return callFunction('material-service', 'export', params)
  },
  
  /**
   * 更新库存
   */
  updateStock(material_id, quantity, type) {
    return callFunction('material-service', 'updateStock', { material_id, quantity, type })
  }
}

/**
 * 仓库服务
 */
export const warehouseService = {
  /**
   * 创建入库单
   */
  createInbound(data) {
    return callFunction('warehouse-service', 'createInbound', data)
  },
  
  /**
   * 确认入库
   */
  confirmInbound(id) {
    return callFunction('warehouse-service', 'confirmInbound', { id })
  },
  
  /**
   * 创建出库单
   */
  createOutbound(data) {
    return callFunction('warehouse-service', 'createOutbound', data)
  },
  
  /**
   * 确认出库
   */
  confirmOutbound(id) {
    return callFunction('warehouse-service', 'confirmOutbound', { id })
  },
  
  /**
   * 获取库存记录
   */
  getStockRecords(params) {
    return callFunction('warehouse-service', 'getStockRecords', params)
  },
  
  /**
   * 获取仓库统计
   */
  getWarehouseStats(warehouse_type) {
    return callFunction('warehouse-service', 'getWarehouseStats', { warehouse_type })
  },
  
  /**
   * 计算车间仓数量
   */
  calculateWorkshopStock(material_id) {
    return callFunction('warehouse-service', 'calculateWorkshopStock', { material_id })
  }
}

/**
 * BOM服务
 */
export const bomService = {
  /**
   * 获取BOM列表
   */
  list(params) {
    return callFunction('bom-service', 'list', params)
  },
  
  /**
   * 获取BOM详情
   */
  detail(id) {
    return callFunction('bom-service', 'detail', { id })
  },
  
  /**
   * 创建BOM
   */
  create(data) {
    return callFunction('bom-service', 'create', data)
  },
  
  /**
   * 更新BOM
   */
  update(id, data) {
    return callFunction('bom-service', 'update', { id, ...data })
  },
  
  /**
   * 删除BOM
   */
  delete(id) {
    return callFunction('bom-service', 'delete', { id })
  },
  
  /**
   * 按BOM发料
   */
  issueMaterials(data) {
    return callFunction('bom-service', 'issueMaterials', data)
  },
  
  /**
   * 批量导入BOM
   */
  import(boms) {
    return callFunction('bom-service', 'import', { boms })
  },
  
  /**
   * 导出BOM
   */
  export(params) {
    return callFunction('bom-service', 'export', params)
  }
}

/**
 * 云数据库操作
 */
export const db = {
  /**
   * 获取数据库实例
   */
  instance: uniCloud.database(),
  
  /**
   * 获取集合
   */
  collection(name) {
    return this.instance.collection(name)
  },
  
  /**
   * 查询数据
   */
  async get(collectionName, where = {}, options = {}) {
    const {
      field,
      orderBy,
      page = 1,
      pageSize = 20
    } = options
    
    let query = this.collection(collectionName).where(where)
    
    if (field) {
      query = query.field(field)
    }
    
    if (orderBy) {
      query = query.orderBy(orderBy.field, orderBy.order || 'asc')
    }
    
    if (page && pageSize) {
      query = query.skip((page - 1) * pageSize).limit(pageSize)
    }
    
    const result = await query.get()
    return result.data
  },
  
  /**
   * 添加数据
   */
  async add(collectionName, data) {
    const result = await this.collection(collectionName).add(data)
    return result.id
  },
  
  /**
   * 更新数据
   */
  async update(collectionName, id, data) {
    await this.collection(collectionName).doc(id).update(data)
    return true
  },
  
  /**
   * 删除数据
   */
  async remove(collectionName, id) {
    await this.collection(collectionName).doc(id).remove()
    return true
  },
  
  /**
   * 统计数量
   */
  async count(collectionName, where = {}) {
    const result = await this.collection(collectionName).where(where).count()
    return result.total
  }
}

/**
 * 云存储操作
 */
export const storage = {
  /**
   * 上传文件
   */
  async uploadFile(filePath, cloudPath, options = {}) {
    // 显示加载提示
    if (options.showLoading !== false) {
      uni.showLoading({
        title: '上传中...',
        mask: true
      })
    }
    
    try {
      const result = await uniCloud.uploadFile({
        filePath,
        cloudPath,
        onUploadProgress: (progressEvent) => {
          if (options.onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            options.onProgress(percent)
          }
        }
      })
      
      uni.hideLoading()
      
      return {
        fileID: result.fileID,
        tempFileURL: result.tempFileURL
      }
    } catch (error) {
      uni.hideLoading()
      
      uni.showToast({
        title: '上传失败',
        icon: 'none'
      })
      
      throw error
    }
  },
  
  /**
   * 删除文件
   */
  async deleteFile(fileIDs) {
    if (!Array.isArray(fileIDs)) {
      fileIDs = [fileIDs]
    }
    
    const result = await uniCloud.deleteFile({
      fileList: fileIDs
    })
    
    return result.fileList
  },
  
  /**
   * 获取临时文件URL
   */
  async getTempFileURL(fileIDs) {
    if (!Array.isArray(fileIDs)) {
      fileIDs = [fileIDs]
    }
    
    const result = await uniCloud.getTempFileURL({
      fileList: fileIDs
    })
    
    return result.fileList
  }
}

export default {
  materialService,
  warehouseService,
  bomService,
  db,
  storage
}
