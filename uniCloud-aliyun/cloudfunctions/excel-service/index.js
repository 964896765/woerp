'use strict';

/**
 * Excel导入导出服务云函数
 * 提供Excel数据导入导出功能
 */

const db = uniCloud.database()

exports.main = async (event, context) => {
  const { action, data } = event
  
  try {
    switch (action) {
      case 'importMaterials':
        return await importMaterials(data)
      case 'importBom':
        return await importBom(data)
      case 'exportMaterials':
        return await exportMaterials(data)
      case 'exportBom':
        return await exportBom(data)
      case 'getBomTemplate':
        return await getBomTemplate()
      case 'getMaterialTemplate':
        return await getMaterialTemplate()
      default:
        return {
          code: 400,
          message: '未知操作',
          data: null
        }
    }
  } catch (error) {
    console.error('Excel服务错误:', error)
    return {
      code: 500,
      message: error.message,
      data: null
    }
  }
}

/**
 * 导入物料数据
 * @param {Object} data - 包含materials数组的对象
 */
async function importMaterials(data) {
  const { materials, warehouse_type } = data
  
  if (!materials || !Array.isArray(materials)) {
    return {
      code: 400,
      message: '物料数据格式错误',
      data: null
    }
  }
  
  const collection = db.collection('materials')
  const results = {
    success: [],
    failed: [],
    updated: []
  }
  
  for (const material of materials) {
    try {
      // 检查必填字段
      if (!material.code || !material.name) {
        results.failed.push({
          material,
          reason: '缺少必填字段（编码或名称）'
        })
        continue
      }
      
      // 检查是否已存在
      const existing = await collection.where({ code: material.code }).get()
      
      if (existing.data.length > 0) {
        // 更新现有物料
        const id = existing.data[0]._id
        await collection.doc(id).update({
          ...material,
          update_time: Date.now()
        })
        results.updated.push(material.code)
      } else {
        // 新增物料
        await collection.add({
          ...material,
          warehouse_type: warehouse_type || material.warehouse_type || 'main',
          stock_quantity: material.stock_quantity || 0,
          status: 'active',
          create_time: Date.now(),
          update_time: Date.now()
        })
        results.success.push(material.code)
      }
    } catch (error) {
      results.failed.push({
        material,
        reason: error.message
      })
    }
  }
  
  return {
    code: 200,
    message: `导入完成：成功${results.success.length}条，更新${results.updated.length}条，失败${results.failed.length}条`,
    data: results
  }
}

/**
 * 导入BOM数据
 * @param {Object} data - 包含BOM数据的对象
 */
async function importBom(data) {
  const { bom_code, bom_name, product_id, version, items } = data
  
  if (!bom_code || !items || !Array.isArray(items)) {
    return {
      code: 400,
      message: 'BOM数据格式错误',
      data: null
    }
  }
  
  const bomHeadersCol = db.collection('bom_headers')
  const bomItemsCol = db.collection('bom_items')
  const materialsCol = db.collection('materials')
  
  try {
    // 检查BOM是否已存在
    const existing = await bomHeadersCol.where({ code: bom_code }).get()
    let bomId
    
    if (existing.data.length > 0) {
      // 更新现有BOM
      bomId = existing.data[0]._id
      await bomHeadersCol.doc(bomId).update({
        name: bom_name,
        version: version || existing.data[0].version,
        update_time: Date.now()
      })
      
      // 删除旧的BOM明细
      await bomItemsCol.where({ bom_id: bomId }).remove()
    } else {
      // 新增BOM表头
      const bomRes = await bomHeadersCol.add({
        code: bom_code,
        name: bom_name || bom_code,
        product_id: product_id || '',
        version: version || '1.0',
        quantity: 1,
        status: 'active',
        create_time: Date.now(),
        update_time: Date.now()
      })
      bomId = bomRes.id
    }
    
    // 添加BOM明细
    const results = {
      success: [],
      failed: []
    }
    
    for (const item of items) {
      try {
        // 根据物料编码查找物料
        const materialRes = await materialsCol.where({
          code: item.material_code
        }).get()
        
        if (materialRes.data.length === 0) {
          results.failed.push({
            item,
            reason: `物料编码 ${item.material_code} 不存在`
          })
          continue
        }
        
        const material = materialRes.data[0]
        
        // 计算实际用量（含损耗）
        const lossRate = item.loss_rate || 0
        const actualQuantity = item.quantity * (1 + lossRate / 100)
        
        await bomItemsCol.add({
          bom_id: bomId,
          material_id: material._id,
          material_code: material.code,
          material_name: material.name,
          quantity: item.quantity, // 计划用量
          issued_quantity: 0, // 实发数量初始为0
          variance: 0, // 差异初始为0
          unit: material.unit,
          loss_rate: lossRate,
          actual_quantity: actualQuantity,
          description: item.description || '',
          create_time: Date.now(),
          update_time: Date.now()
        })
        
        results.success.push(item.material_code)
      } catch (error) {
        results.failed.push({
          item,
          reason: error.message
        })
      }
    }
    
    return {
      code: 200,
      message: `BOM导入完成：成功${results.success.length}条，失败${results.failed.length}条`,
      data: {
        bom_id: bomId,
        ...results
      }
    }
  } catch (error) {
    return {
      code: 500,
      message: `BOM导入失败：${error.message}`,
      data: null
    }
  }
}

/**
 * 导出物料数据
 * @param {Object} data - 查询条件
 */
async function exportMaterials(data) {
  const { warehouse_type, category_id } = data || {}
  
  const collection = db.collection('materials')
  let query = collection.where({})
  
  if (warehouse_type) {
    query = query.where({ warehouse_type })
  }
  
  if (category_id) {
    query = query.where({ category_id })
  }
  
  const res = await query.get()
  
  // 转换为Excel格式
  const excelData = res.data.map(item => ({
    '物料编码': item.code,
    '物料名称': item.name,
    '规格': item.spec || '',
    '单位': item.unit,
    '批次号': item.batch_no || '',
    '类别': item.category_name || '',
    '仓库类型': getWarehouseTypeName(item.warehouse_type),
    '库存数量': item.stock_quantity,
    '单价': item.price || 0,
    '使用部门': (item.using_departments || []).join(','),
    '供应商': item.supplier_name || '',
    '最小库存': item.min_stock || 0,
    '描述': item.description || '',
    '状态': item.status === 'active' ? '启用' : '停用'
  }))
  
  return {
    code: 200,
    message: `导出成功，共${excelData.length}条数据`,
    data: excelData
  }
}

/**
 * 导出BOM数据
 * @param {Object} data - BOM ID
 */
async function exportBom(data) {
  const { bom_id } = data
  
  if (!bom_id) {
    return {
      code: 400,
      message: '请提供BOM ID',
      data: null
    }
  }
  
  const bomHeadersCol = db.collection('bom_headers')
  const bomItemsCol = db.collection('bom_items')
  
  // 获取BOM表头
  const headerRes = await bomHeadersCol.doc(bom_id).get()
  if (headerRes.data.length === 0) {
    return {
      code: 404,
      message: 'BOM不存在',
      data: null
    }
  }
  
  const header = headerRes.data[0]
  
  // 获取BOM明细
  const itemsRes = await bomItemsCol.where({ bom_id }).get()
  
  // 转换为Excel格式
  const excelData = itemsRes.data.map((item, index) => ({
    '序号': index + 1,
    '物料编码': item.material_code,
    '物料名称': item.material_name,
    '计划用量': item.quantity,
    '实发数量': item.issued_quantity || 0,
    '差异': item.variance || 0,
    '单位': item.unit,
    '损耗率(%)': item.loss_rate || 0,
    '实际用量': item.actual_quantity,
    '备注': item.description || ''
  }))
  
  return {
    code: 200,
    message: `导出成功，共${excelData.length}条数据`,
    data: {
      header: {
        'BOM编码': header.code,
        'BOM名称': header.name,
        '版本': header.version,
        '基准数量': header.quantity
      },
      items: excelData
    }
  }
}

/**
 * 获取BOM导入模板
 */
async function getBomTemplate() {
  const template = [
    {
      'BOM编码': 'BOM001',
      'BOM名称': '示例BOM',
      '版本': '1.0',
      '物料编码': 'A01-01-0001',
      '物料名称': '三元',
      '计划用量': 100,
      '单位': 'kg',
      '损耗率(%)': 5,
      '备注': '示例数据'
    }
  ]
  
  return {
    code: 200,
    message: 'BOM模板获取成功',
    data: template
  }
}

/**
 * 获取物料导入模板
 */
async function getMaterialTemplate() {
  const template = [
    {
      '物料编码': 'A01-01-0001',
      '物料名称': '三元',
      '规格': 'XLCKY',
      '单位': 'kg',
      '批次号': '20251128',
      '类别': '正极材料',
      '仓库类型': '主材仓',
      '库存数量': 800,
      '单价': 150,
      '使用部门': '技术部,配料',
      '供应商': '',
      '最小库存': 100,
      '描述': '示例数据'
    }
  ]
  
  return {
    code: 200,
    message: '物料模板获取成功',
    data: template
  }
}

/**
 * 获取仓库类型名称
 */
function getWarehouseTypeName(type) {
  const map = {
    'main': '主材仓',
    'workshop': '车间仓',
    'bom': 'BOM仓',
    'pack': 'PACK仓',
    'auxiliary': '辅料仓',
    'pending': '待处理仓'
  }
  return map[type] || type
}
