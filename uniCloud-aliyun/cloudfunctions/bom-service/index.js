/**
 * BOM服务云函数
 * 提供BOM的增删改查、按BOM发料等功能
 */

'use strict';

const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
  const { action, data } = event
  
  const response = {
    code: 200,
    message: 'success',
    data: null
  }
  
  try {
    switch (action) {
      // 获取BOM列表
      case 'list':
        response.data = await getBomList(data)
        break
      
      // 获取BOM详情
      case 'detail':
        response.data = await getBomDetail(data.id)
        break
      
      // 创建BOM
      case 'create':
        response.data = await createBom(data)
        break
      
      // 更新BOM
      case 'update':
        response.data = await updateBom(data.id, data)
        break
      
      // 删除BOM
      case 'delete':
        response.data = await deleteBom(data.id)
        break
      
      // 按BOM发料
      case 'issueMaterials':
        response.data = await issueMaterials(data)
        break
      
      // 按BOM发料（支持差异）
      case 'issueMaterialsWithVariance':
        response.data = await issueMaterialsWithVariance(data)
        break
      
      // 获取BOM计划用量
      case 'getBomPlannedQuantity':
        response.data = await getBomPlannedQuantity(data)
        break
      
      // 更新实发数量
      case 'updateIssuedQuantity':
        response.data = await updateIssuedQuantity(data)
        break
      
      // 批量导入BOM
      case 'import':
        response.data = await importBoms(data)
        break
      
      // 导出BOM
      case 'export':
        response.data = await exportBoms(data)
        break
      
      default:
        response.code = 400
        response.message = `未知操作: ${action}`
    }
  } catch (error) {
    console.error('BOM服务错误:', error)
    response.code = 500
    response.message = error.message || '服务器内部错误'
  }
  
  return response
}

/**
 * 获取BOM列表
 */
async function getBomList(params) {
  const {
    status,
    page = 1,
    pageSize = 20
  } = params
  
  const collection = db.collection('bom_headers')
  let query = collection
  
  if (status) {
    query = query.where({ status })
  }
  
  // 分页查询
  const countResult = await query.count()
  const total = countResult.total
  
  const result = await query
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .orderBy('create_time', 'desc')
    .get()
  
  return {
    list: result.data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  }
}

/**
 * 获取BOM详情（包含明细）
 */
async function getBomDetail(id) {
  // 获取BOM表头
  const headerResult = await db.collection('bom_headers')
    .doc(id)
    .get()
  
  if (headerResult.data.length === 0) {
    throw new Error('BOM不存在')
  }
  
  const header = headerResult.data[0]
  
  // 获取BOM明细
  const itemsResult = await db.collection('bom_items')
    .where({ bom_id: id })
    .orderBy('sort_order', 'asc')
    .get()
  
  header.items = itemsResult.data
  
  return header
}

/**
 * 创建BOM
 */
async function createBom(data) {
  const {
    code,
    name,
    product_id,
    version,
    quantity,
    unit,
    description,
    items
  } = data
  
  // 验证必填字段
  if (!code || !name || !product_id) {
    throw new Error('BOM编码、名称和产品不能为空')
  }
  
  // 检查BOM编码是否已存在
  const existResult = await db.collection('bom_headers')
    .where({ code })
    .count()
  
  if (existResult.total > 0) {
    throw new Error('BOM编码已存在')
  }
  
  // 获取产品名称
  const productResult = await db.collection('materials')
    .doc(product_id)
    .get()
  
  if (productResult.data.length === 0) {
    throw new Error('产品不存在')
  }
  
  const product_name = productResult.data[0].name
  
  // 创建BOM表头
  const headerData = {
    code,
    name,
    product_id,
    product_name,
    version: version || '1.0',
    quantity: quantity || 1,
    unit: unit || productResult.data[0].unit,
    description,
    status: 'draft'
  }
  
  const headerResult = await db.collection('bom_headers').add(headerData)
  const bom_id = headerResult.id
  
  // 创建BOM明细
  if (items && items.length > 0) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      // 获取物料信息
      const materialResult = await db.collection('materials')
        .doc(item.material_id)
        .get()
      
      if (materialResult.data.length === 0) {
        throw new Error(`物料 ${item.material_id} 不存在`)
      }
      
      const material = materialResult.data[0]
      
      // 计算实际用量（含损耗）
      const loss_rate = item.loss_rate || 0
      const actual_quantity = item.quantity * (1 + loss_rate / 100)
      
      const itemData = {
        bom_id,
        material_id: item.material_id,
        material_code: material.code,
        material_name: material.name,
        quantity: item.quantity,
        unit: item.unit || material.unit,
        loss_rate,
        actual_quantity,
        position: item.position,
        sort_order: i + 1,
        description: item.description
      }
      
      await db.collection('bom_items').add(itemData)
    }
  }
  
  return {
    id: bom_id,
    code,
    message: 'BOM创建成功'
  }
}

/**
 * 更新BOM
 */
async function updateBom(id, data) {
  // 检查BOM是否存在
  const existResult = await db.collection('bom_headers')
    .doc(id)
    .get()
  
  if (existResult.data.length === 0) {
    throw new Error('BOM不存在')
  }
  
  const {
    code,
    name,
    product_id,
    version,
    quantity,
    unit,
    description,
    status,
    items
  } = data
  
  // 如果修改了编码，检查新编码是否已被使用
  if (code && code !== existResult.data[0].code) {
    const codeResult = await db.collection('bom_headers')
      .where({
        code,
        _id: dbCmd.neq(id)
      })
      .count()
    
    if (codeResult.total > 0) {
      throw new Error('BOM编码已存在')
    }
  }
  
  // 更新产品名称
  let product_name
  if (product_id) {
    const productResult = await db.collection('materials')
      .doc(product_id)
      .get()
    
    if (productResult.data.length > 0) {
      product_name = productResult.data[0].name
    }
  }
  
  // 更新BOM表头
  const headerData = {
    update_time: Date.now()
  }
  
  if (code) headerData.code = code
  if (name) headerData.name = name
  if (product_id) headerData.product_id = product_id
  if (product_name) headerData.product_name = product_name
  if (version) headerData.version = version
  if (quantity) headerData.quantity = quantity
  if (unit) headerData.unit = unit
  if (description !== undefined) headerData.description = description
  if (status) headerData.status = status
  
  await db.collection('bom_headers')
    .doc(id)
    .update(headerData)
  
  // 更新BOM明细
  if (items) {
    // 删除旧明细
    await db.collection('bom_items')
      .where({ bom_id: id })
      .remove()
    
    // 添加新明细
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      // 获取物料信息
      const materialResult = await db.collection('materials')
        .doc(item.material_id)
        .get()
      
      if (materialResult.data.length === 0) {
        throw new Error(`物料 ${item.material_id} 不存在`)
      }
      
      const material = materialResult.data[0]
      
      // 计算实际用量（含损耗）
      const loss_rate = item.loss_rate || 0
      const actual_quantity = item.quantity * (1 + loss_rate / 100)
      
      const itemData = {
        bom_id: id,
        material_id: item.material_id,
        material_code: material.code,
        material_name: material.name,
        quantity: item.quantity,
        unit: item.unit || material.unit,
        loss_rate,
        actual_quantity,
        position: item.position,
        sort_order: i + 1,
        description: item.description
      }
      
      await db.collection('bom_items').add(itemData)
    }
  }
  
  return { message: 'BOM更新成功' }
}

/**
 * 删除BOM
 */
async function deleteBom(id) {
  // 检查BOM是否存在
  const existResult = await db.collection('bom_headers')
    .doc(id)
    .get()
  
  if (existResult.data.length === 0) {
    throw new Error('BOM不存在')
  }
  
  // 检查BOM是否已被使用
  const usedResult = await db.collection('outbound_orders')
    .where({ bom_id: id })
    .count()
  
  if (usedResult.total > 0) {
    throw new Error('BOM已被使用，无法删除')
  }
  
  // 删除BOM明细
  await db.collection('bom_items')
    .where({ bom_id: id })
    .remove()
  
  // 删除BOM表头
  await db.collection('bom_headers')
    .doc(id)
    .remove()
  
  return { message: 'BOM删除成功' }
}

/**
 * 按BOM发料（按部门批量出库）
 */
async function issueMaterials(data) {
  const {
    bom_id,
    department_id,
    quantity,
    operator,
    operator_id,
    description
  } = data
  
  // 验证必填字段
  if (!bom_id || !department_id || !quantity) {
    throw new Error('BOM、部门和数量不能为空')
  }
  
  // 获取BOM详情
  const bomDetail = await getBomDetail(bom_id)
  
  if (bomDetail.status !== 'active') {
    throw new Error('BOM未生效，无法发料')
  }
  
  // 获取部门信息
  const deptResult = await db.collection('departments')
    .doc(department_id)
    .get()
  
  if (deptResult.data.length === 0) {
    throw new Error('部门不存在')
  }
  
  const department = deptResult.data[0]
  
  // 计算每个物料的出库数量
  const items = []
  for (const bomItem of bomDetail.items) {
    // 根据BOM基准数量和实际生产数量计算物料用量
    const materialQuantity = (bomItem.actual_quantity / bomDetail.quantity) * quantity
    
    // 获取物料价格
    const materialResult = await db.collection('materials')
      .doc(bomItem.material_id)
      .get()
    
    const price = materialResult.data.length > 0 ? materialResult.data[0].price : 0
    
    items.push({
      material_id: bomItem.material_id,
      material_code: bomItem.material_code,
      material_name: bomItem.material_name,
      quantity: materialQuantity,
      unit: bomItem.unit,
      price,
      amount: materialQuantity * price,
      description: bomItem.description
    })
  }
  
  // 创建出库单
  const outboundData = {
    warehouse_type: 'main',
    outbound_type: 'production_issue',
    department_id,
    department_name: department.name,
    bom_id,
    items,
    operator,
    operator_id,
    description: description || `按BOM ${bomDetail.code} 发料`
  }
  
  // 调用仓库服务创建出库单
  const createResult = await uniCloud.callFunction({
    name: 'warehouse-service',
    data: {
      action: 'createOutbound',
      data: outboundData
    }
  })
  
  if (createResult.result.code !== 200) {
    throw new Error(createResult.result.message)
  }
  
  return {
    order_id: createResult.result.data.id,
    order_no: createResult.result.data.order_no,
    items_count: items.length,
    message: '按BOM发料成功'
  }
}

/**
 * 批量导入BOM
 */
async function importBoms(params) {
  const { boms } = params
  
  if (!Array.isArray(boms) || boms.length === 0) {
    throw new Error('导入数据为空')
  }
  
  const successList = []
  const failList = []
  
  for (const bom of boms) {
    try {
      // 检查必填字段
      if (!bom.code || !bom.name || !bom.product_id) {
        throw new Error('BOM编码、名称和产品不能为空')
      }
      
      // 检查编码是否已存在
      const existResult = await db.collection('bom_headers')
        .where({ code: bom.code })
        .get()
      
      if (existResult.data.length > 0) {
        // 更新现有BOM
        const existId = existResult.data[0]._id
        await updateBom(existId, bom)
        successList.push({ code: bom.code, action: 'update' })
      } else {
        // 创建新BOM
        await createBom(bom)
        successList.push({ code: bom.code, action: 'create' })
      }
    } catch (error) {
      failList.push({
        code: bom.code,
        error: error.message
      })
    }
  }
  
  return {
    total: boms.length,
    success: successList.length,
    fail: failList.length,
    successList,
    failList
  }
}

/**
 * 导出BOM
 */
async function exportBoms(params) {
  const { status } = params
  
  const collection = db.collection('bom_headers')
  let query = collection
  
  if (status) {
    query = query.where({ status })
  }
  
  // 查询所有符合条件的BOM
  const result = await query
    .orderBy('code', 'asc')
    .get()
  
  // 获取每个BOM的明细
  for (const bom of result.data) {
    const itemsResult = await db.collection('bom_items')
      .where({ bom_id: bom._id })
      .orderBy('sort_order', 'asc')
      .get()
    
    bom.items = itemsResult.data
  }
  
  return {
    list: result.data,
    total: result.data.length
  }
}


/**
 * 按BOM发料（支持差异）
 * 实现参照和应变功能
 * @param {Object} data - 发料数据
 */
async function issueMaterialsWithVariance(data) {
  const {
    bom_id,
    department_id,
    department_name,
    production_quantity, // 生产数量
    items, // 物料明细（包含计划用量和实发数量）
    operator,
    operator_id,
    description
  } = data
  
  if (!bom_id) {
    throw new Error('请提供BOM ID')
  }
  
  if (!department_id && !department_name) {
    throw new Error('请提供部门信息')
  }
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('请提供发料明细')
  }
  
  // 获取BOM信息
  const bomHeadersCol = db.collection('bom_headers')
  const bomRes = await bomHeadersCol.doc(bom_id).get()
  
  if (bomRes.data.length === 0) {
    throw new Error('BOM不存在')
  }
  
  const bom = bomRes.data[0]
  
  // 创建出库单
  const outboundCol = db.collection('outbound_orders')
  const orderNo = generateOrderNo('OUT')
  
  // 准备出库明细
  const outboundItems = []
  const bomItemUpdates = [] // 用于更新BOM明细的实发数量
  
  for (const item of items) {
    const {
      material_id,
      material_code,
      material_name,
      unit,
      planned_quantity, // 计划用量
      issued_quantity, // 实发数量（用户填写）
      bom_item_id
    } = item
    
    // 计算差异
    const variance = issued_quantity - planned_quantity
    
    // 获取车间结存参考值
    let workshopStockReference = 0
    try {
      const warehouseService = uniCloud.importObject('warehouse-service')
      const refResult = await warehouseService.getWorkshopStockReference({
        material_id,
        department_id
      })
      workshopStockReference = refResult.balance || 0
    } catch (error) {
      console.error('获取车间结存失败:', error)
    }
    
    outboundItems.push({
      material_id,
      material_code,
      material_name,
      quantity: issued_quantity, // 实发数量
      planned_quantity, // 计划用量
      workshop_stock_reference: workshopStockReference,
      unit,
      variance, // 差异
      description: variance !== 0 ? `差异: ${variance > 0 ? '+' : ''}${variance}${unit}` : ''
    })
    
    // 记录需要更新的BOM明细
    if (bom_item_id) {
      bomItemUpdates.push({
        id: bom_item_id,
        issued_quantity,
        variance
      })
    }
  }
  
  // 创建出库单
  const outboundOrder = {
    order_no: orderNo,
    warehouse_type: 'main',
    outbound_type: 'production_issue',
    department_id,
    department_name,
    bom_id,
    items: outboundItems,
    total_amount: 0,
    operator,
    operator_id,
    allow_negative: true,
    status: 'confirmed', // 直接确认
    confirm_time: Date.now(),
    description: description || `按BOM ${bom.code} 发料，生产数量: ${production_quantity}`,
    create_time: Date.now(),
    update_time: Date.now()
  }
  
  const outboundRes = await outboundCol.add(outboundOrder)
  
  // 更新物料库存
  const materialsCol = db.collection('materials')
  for (const item of outboundItems) {
    await materialsCol.where({
      _id: item.material_id
    }).update({
      stock_quantity: dbCmd.inc(-item.quantity)
    })
  }
  
  // 更新BOM明细的实发数量和差异
  const bomItemsCol = db.collection('bom_items')
  for (const update of bomItemUpdates) {
    await bomItemsCol.doc(update.id).update({
      issued_quantity: dbCmd.inc(update.issued_quantity),
      variance: dbCmd.inc(update.variance),
      update_time: Date.now()
    })
  }
  
  // 记录库存流水
  const stockRecordsCol = db.collection('stock_records')
  for (const item of outboundItems) {
    await stockRecordsCol.add({
      material_id: item.material_id,
      material_code: item.material_code,
      material_name: item.material_name,
      warehouse_type: 'main',
      record_type: 'outbound',
      quantity: -item.quantity,
      unit: item.unit,
      order_no: orderNo,
      order_id: outboundRes.id,
      department_id,
      department_name,
      operator,
      operator_id,
      description: item.description,
      create_time: Date.now()
    })
  }
  
  return {
    order_id: outboundRes.id,
    order_no: orderNo,
    items: outboundItems,
    message: '按BOM发料成功'
  }
}

/**
 * 获取BOM计划用量
 * @param {Object} data - 包含bom_id
 */
async function getBomPlannedQuantity(data) {
  const { bom_id, production_quantity } = data
  
  if (!bom_id) {
    throw new Error('请提供BOM ID')
  }
  
  // 获取BOM表头
  const bomHeadersCol = db.collection('bom_headers')
  const headerRes = await bomHeadersCol.doc(bom_id).get()
  
  if (headerRes.data.length === 0) {
    throw new Error('BOM不存在')
  }
  
  const header = headerRes.data[0]
  
  // 获取BOM明细
  const bomItemsCol = db.collection('bom_items')
  const itemsRes = await bomItemsCol.where({ bom_id }).get()
  
  // 计算每个物料的计划用量
  const plannedItems = itemsRes.data.map(item => {
    // 计算实际需要的数量
    const ratio = production_quantity / header.quantity
    const plannedQty = item.quantity * ratio
    const actualQty = item.actual_quantity * ratio // 含损耗
    
    return {
      bom_item_id: item._id,
      material_id: item.material_id,
      material_code: item.material_code,
      material_name: item.material_name,
      unit: item.unit,
      planned_quantity: plannedQty, // 计划用量
      issued_quantity: item.issued_quantity || 0, // 已发数量
      variance: item.variance || 0, // 累计差异
      loss_rate: item.loss_rate || 0,
      actual_quantity: actualQty, // 实际用量（含损耗）
      suggested_quantity: actualQty // 建议发放数量
    }
  })
  
  return {
    bom_id,
    bom_code: header.code,
    bom_name: header.name,
    production_quantity,
    base_quantity: header.quantity,
    items: plannedItems
  }
}

/**
 * 更新实发数量
 * @param {Object} data - 包含bom_item_id和issued_quantity
 */
async function updateIssuedQuantity(data) {
  const { bom_item_id, issued_quantity, planned_quantity } = data
  
  if (!bom_item_id) {
    throw new Error('请提供BOM明细ID')
  }
  
  if (issued_quantity === undefined || issued_quantity === null) {
    throw new Error('请提供实发数量')
  }
  
  const bomItemsCol = db.collection('bom_items')
  
  // 计算差异
  const variance = issued_quantity - (planned_quantity || 0)
  
  await bomItemsCol.doc(bom_item_id).update({
    issued_quantity,
    variance,
    update_time: Date.now()
  })
  
  return {
    bom_item_id,
    issued_quantity,
    variance,
    message: '实发数量更新成功'
  }
}

/**
 * 生成单据号
 */
function generateOrderNo(prefix) {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const time = String(date.getTime()).slice(-6)
  return `${prefix}${year}${month}${day}${time}`
}
