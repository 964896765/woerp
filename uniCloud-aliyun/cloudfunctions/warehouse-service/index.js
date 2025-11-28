/**
 * 仓库服务云函数
 * 提供出入库、库存查询、库存记录等功能
 */

'use strict';

const db = uniCloud.database()
const dbCmd = db.command
const $ = dbCmd.aggregate

exports.main = async (event, context) => {
  const { action, data } = event
  
  const response = {
    code: 200,
    message: 'success',
    data: null
  }
  
  try {
    switch (action) {
      // 创建入库单
      case 'createInbound':
        response.data = await createInbound(data)
        break
      
      // 确认入库
      case 'confirmInbound':
        response.data = await confirmInbound(data.id)
        break
      
      // 创建出库单
      case 'createOutbound':
        response.data = await createOutbound(data)
        break
      
      // 确认出库
      case 'confirmOutbound':
        response.data = await confirmOutbound(data.id)
        break
      
      // 获取库存记录
      case 'getStockRecords':
        response.data = await getStockRecords(data)
        break
      
      // 获取仓库统计
      case 'getWarehouseStats':
        response.data = await getWarehouseStats(data.warehouse_type)
        break
      
      // 计算车间仓数量
      case 'calculateWorkshopStock':
        response.data = await calculateWorkshopStock(data)
        break
      
      // 获取车间结存参考值
      case 'getWorkshopStockReference':
        response.data = await getWorkshopStockReference(data)
        break
      
      // 计算车间仓结存
      case 'calculateWorkshopBalance':
        response.data = await calculateWorkshopBalance(data)
        break
      
      // 获取部门物料结存列表
      case 'getDepartmentMaterialBalance':
        response.data = await getDepartmentMaterialBalance(data)
        break
      
      default:
        response.code = 400
        response.message = `未知操作: ${action}`
    }
  } catch (error) {
    console.error('仓库服务错误:', error)
    response.code = 500
    response.message = error.message || '服务器内部错误'
  }
  
  return response
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

/**
 * 创建入库单
 */
async function createInbound(data) {
  const {
    warehouse_type,
    inbound_type,
    supplier_id,
    items,
    operator,
    operator_id,
    description
  } = data
  
  // 验证必填字段
  if (!warehouse_type || !items || items.length === 0) {
    throw new Error('仓库类型和物料明细不能为空')
  }
  
  // 生成入库单号
  const order_no = generateOrderNo('RK')
  
  // 获取供应商名称
  let supplier_name = ''
  if (supplier_id) {
    const supplierResult = await db.collection('suppliers')
      .doc(supplier_id)
      .get()
    if (supplierResult.data.length > 0) {
      supplier_name = supplierResult.data[0].name
    }
  }
  
  // 计算总金额
  let total_amount = 0
  for (const item of items) {
    item.amount = (item.quantity || 0) * (item.price || 0)
    total_amount += item.amount
  }
  
  // 创建入库单
  const inboundData = {
    order_no,
    warehouse_type,
    inbound_type,
    supplier_id,
    supplier_name,
    items,
    total_amount,
    operator,
    operator_id,
    description,
    status: 'draft'
  }
  
  const result = await db.collection('inbound_orders').add(inboundData)
  
  return {
    id: result.id,
    order_no,
    message: '入库单创建成功'
  }
}

/**
 * 确认入库
 */
async function confirmInbound(id) {
  // 获取入库单
  const inboundResult = await db.collection('inbound_orders')
    .doc(id)
    .get()
  
  if (inboundResult.data.length === 0) {
    throw new Error('入库单不存在')
  }
  
  const inbound = inboundResult.data[0]
  
  if (inbound.status !== 'draft') {
    throw new Error('入库单状态不正确')
  }
  
  // 开始事务处理
  const transaction = await db.startTransaction()
  
  try {
    // 更新物料库存
    for (const item of inbound.items) {
      // 获取物料当前库存
      const materialResult = await transaction.collection('materials')
        .doc(item.material_id)
        .get()
      
      if (materialResult.data.length === 0) {
        throw new Error(`物料 ${item.material_code} 不存在`)
      }
      
      const material = materialResult.data[0]
      const oldQuantity = material.stock_quantity || 0
      const newQuantity = oldQuantity + item.quantity
      
      // 更新库存
      await transaction.collection('materials')
        .doc(item.material_id)
        .update({
          stock_quantity: newQuantity,
          update_time: Date.now()
        })
      
      // 记录库存变动
      await transaction.collection('stock_records').add({
        material_id: item.material_id,
        material_code: item.material_code,
        material_name: item.material_name,
        warehouse_type: inbound.warehouse_type,
        record_type: 'inbound',
        quantity: item.quantity,
        unit: item.unit,
        before_quantity: oldQuantity,
        after_quantity: newQuantity,
        order_id: id,
        order_no: inbound.order_no,
        operator: inbound.operator,
        operator_id: inbound.operator_id,
        description: item.description
      })
    }
    
    // 更新入库单状态
    await transaction.collection('inbound_orders')
      .doc(id)
      .update({
        status: 'confirmed',
        confirm_time: Date.now(),
        update_time: Date.now()
      })
    
    // 提交事务
    await transaction.commit()
    
    return {
      order_no: inbound.order_no,
      message: '入库确认成功'
    }
  } catch (error) {
    // 回滚事务
    await transaction.rollback()
    throw error
  }
}

/**
 * 创建出库单
 */
async function createOutbound(data) {
  const {
    warehouse_type,
    outbound_type,
    department_id,
    bom_id,
    items,
    operator,
    operator_id,
    receiver,
    receiver_id,
    description
  } = data
  
  // 验证必填字段
  if (!warehouse_type || !outbound_type || !items || items.length === 0) {
    throw new Error('仓库类型、出库类型和物料明细不能为空')
  }
  
  // 生成出库单号
  const order_no = generateOrderNo('CK')
  
  // 获取部门名称
  let department_name = ''
  if (department_id) {
    const deptResult = await db.collection('departments')
      .doc(department_id)
      .get()
    if (deptResult.data.length > 0) {
      department_name = deptResult.data[0].name
    }
  }
  
  // 计算总金额
  let total_amount = 0
  for (const item of items) {
    item.amount = (item.quantity || 0) * (item.price || 0)
    total_amount += item.amount
  }
  
  // 创建出库单
  const outboundData = {
    order_no,
    warehouse_type,
    outbound_type,
    department_id,
    department_name,
    bom_id,
    items,
    total_amount,
    operator,
    operator_id,
    receiver,
    receiver_id,
    description,
    status: 'draft'
  }
  
  const result = await db.collection('outbound_orders').add(outboundData)
  
  return {
    id: result.id,
    order_no,
    message: '出库单创建成功'
  }
}

/**
 * 确认出库
 */
async function confirmOutbound(id) {
  // 获取出库单
  const outboundResult = await db.collection('outbound_orders')
    .doc(id)
    .get()
  
  if (outboundResult.data.length === 0) {
    throw new Error('出库单不存在')
  }
  
  const outbound = outboundResult.data[0]
  
  if (outbound.status !== 'draft') {
    throw new Error('出库单状态不正确')
  }
  
  // 开始事务处理
  const transaction = await db.startTransaction()
  
  try {
    // 更新物料库存
    for (const item of outbound.items) {
      // 获取物料当前库存
      const materialResult = await transaction.collection('materials')
        .doc(item.material_id)
        .get()
      
      if (materialResult.data.length === 0) {
        throw new Error(`物料 ${item.material_code} 不存在`)
      }
      
      const material = materialResult.data[0]
      const oldQuantity = material.stock_quantity || 0
      
      // 检查库存是否充足
      if (oldQuantity < item.quantity) {
        throw new Error(`物料 ${item.material_name} 库存不足`)
      }
      
      const newQuantity = oldQuantity - item.quantity
      
      // 更新库存
      await transaction.collection('materials')
        .doc(item.material_id)
        .update({
          stock_quantity: newQuantity,
          update_time: Date.now()
        })
      
      // 记录库存变动
      await transaction.collection('stock_records').add({
        material_id: item.material_id,
        material_code: item.material_code,
        material_name: item.material_name,
        warehouse_type: outbound.warehouse_type,
        record_type: 'outbound',
        quantity: -item.quantity,
        unit: item.unit,
        before_quantity: oldQuantity,
        after_quantity: newQuantity,
        order_id: id,
        order_no: outbound.order_no,
        department_id: outbound.department_id,
        department_name: outbound.department_name,
        operator: outbound.operator,
        operator_id: outbound.operator_id,
        description: item.description
      })
    }
    
    // 更新出库单状态
    await transaction.collection('outbound_orders')
      .doc(id)
      .update({
        status: 'confirmed',
        confirm_time: Date.now(),
        update_time: Date.now()
      })
    
    // 提交事务
    await transaction.commit()
    
    return {
      order_no: outbound.order_no,
      message: '出库确认成功'
    }
  } catch (error) {
    // 回滚事务
    await transaction.rollback()
    throw error
  }
}

/**
 * 获取库存记录
 */
async function getStockRecords(params) {
  const {
    warehouse_type,
    material_id,
    department_id,
    record_type,
    start_time,
    end_time,
    page = 1,
    pageSize = 20
  } = params
  
  const collection = db.collection('stock_records')
  const where = {}
  
  if (warehouse_type) {
    where.warehouse_type = warehouse_type
  }
  
  if (material_id) {
    where.material_id = material_id
  }
  
  if (department_id) {
    where.department_id = department_id
  }
  
  if (record_type) {
    where.record_type = record_type
  }
  
  if (start_time && end_time) {
    where.create_time = dbCmd.and([
      dbCmd.gte(start_time),
      dbCmd.lte(end_time)
    ])
  }
  
  // 查询数据
  const countResult = await collection.where(where).count()
  const total = countResult.total
  
  const result = await collection
    .where(where)
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
 * 获取仓库统计
 */
async function getWarehouseStats(warehouse_type) {
  // 统计物料总数
  const materialCount = await db.collection('materials')
    .where({ warehouse_type, status: 'active' })
    .count()
  
  // 统计总库存价值
  const materials = await db.collection('materials')
    .where({ warehouse_type, status: 'active' })
    .field({ stock_quantity: true, price: true })
    .get()
  
  let totalValue = 0
  let totalQuantity = 0
  let lowStockCount = 0
  
  for (const material of materials.data) {
    const quantity = material.stock_quantity || 0
    const price = material.price || 0
    totalValue += quantity * price
    totalQuantity += quantity
    
    if (material.min_stock && quantity < material.min_stock) {
      lowStockCount++
    }
  }
  
  return {
    warehouse_type,
    material_count: materialCount.total,
    total_quantity: totalQuantity,
    total_value: totalValue,
    low_stock_count: lowStockCount
  }
}

/**
 * 计算车间仓数量
 * 车间仓数量 = 主材仓出库到生产部门的数量 - BOM所需数量
 */
async function calculateWorkshopStock(params) {
  const { material_id } = params
  
  // 获取主材仓出库到生产部门的总数量
  const productionDepts = ['batching', 'sheeting', 'winding', 'packaging', 'injection', 'packing']
  
  const outboundRecords = await db.collection('stock_records')
    .where({
      material_id,
      warehouse_type: 'main',
      record_type: 'outbound'
    })
    .get()
  
  let outboundQuantity = 0
  for (const record of outboundRecords.data) {
    // 检查是否出库到生产部门
    if (record.department_id) {
      const deptResult = await db.collection('departments')
        .doc(record.department_id)
        .get()
      
      if (deptResult.data.length > 0) {
        const dept = deptResult.data[0]
        if (productionDepts.includes(dept.production_type)) {
          outboundQuantity += Math.abs(record.quantity)
        }
      }
    }
  }
  
  // 获取BOM中该物料的总用量
  const bomItems = await db.collection('bom_items')
    .where({ material_id })
    .get()
  
  let bomQuantity = 0
  for (const item of bomItems.data) {
    bomQuantity += item.actual_quantity || item.quantity || 0
  }
  
  // 计算车间仓数量
  const workshopQuantity = outboundQuantity - bomQuantity
  
  return {
    material_id,
    outbound_quantity: outboundQuantity,
    bom_quantity: bomQuantity,
    workshop_quantity: workshopQuantity
  }
}


/**
 * 获取车间结存参考值
 * 用于出库时显示参考
 * @param {Object} data - 包含material_id和department_id
 */
async function getWorkshopStockReference(data) {
  const { material_id, department_id } = data
  
  if (!material_id) {
    throw new Error('请提供物料ID')
  }
  
  // 生产部门列表
  const productionDepts = ['配料', '制片', '卷绕', '封装', '注液', '化成', '包装']
  
  // 获取该物料的所有出库记录（到生产部门）
  const outboundCol = db.collection('outbound_orders')
  const outboundRes = await outboundCol
    .where({
      status: 'confirmed',
      warehouse_type: 'main'
    })
    .get()
  
  // 计算实发总量
  let totalIssued = 0
  for (const order of outboundRes.data) {
    if (productionDepts.includes(order.department_name)) {
      for (const item of order.items) {
        if (item.material_id === material_id) {
          totalIssued += item.quantity
        }
      }
    }
  }
  
  // 获取BOM计划用量
  const bomItemsCol = db.collection('bom_items')
  const bomItemsRes = await bomItemsCol
    .where({ material_id })
    .get()
  
  let totalPlanned = 0
  for (const item of bomItemsRes.data) {
    totalPlanned += item.quantity || 0
  }
  
  // 计算结存
  const balance = totalIssued - totalPlanned
  
  return {
    material_id,
    total_issued: totalIssued, // 实发总量
    total_planned: totalPlanned, // 计划总量
    balance, // 结存（可为负数）
    department_id: department_id || null
  }
}

/**
 * 计算车间仓结存
 * 车间仓结存 = 实发数量 - BOM用量
 * @param {Object} data - 查询条件
 */
async function calculateWorkshopBalance(data) {
  const { department_id, material_id } = data || {}
  
  const productionDepts = ['配料', '制片', '卷绕', '封装', '注液', '化成', '包装']
  
  // 获取所有确认的出库单
  const outboundCol = db.collection('outbound_orders')
  let outboundQuery = outboundCol.where({
    status: 'confirmed',
    warehouse_type: 'main'
  })
  
  const outboundRes = await outboundQuery.get()
  
  // 统计各物料的实发数量
  const issuedMap = {}
  
  for (const order of outboundRes.data) {
    // 只统计生产部门
    if (!productionDepts.includes(order.department_name)) {
      continue
    }
    
    // 如果指定了部门，只统计该部门
    if (department_id && order.department_id !== department_id) {
      continue
    }
    
    for (const item of order.items) {
      const key = `${item.material_id}_${order.department_id}`
      if (!issuedMap[key]) {
        issuedMap[key] = {
          material_id: item.material_id,
          material_code: item.material_code,
          material_name: item.material_name,
          department_id: order.department_id,
          department_name: order.department_name,
          issued_quantity: 0,
          planned_quantity: 0,
          balance: 0
        }
      }
      issuedMap[key].issued_quantity += item.quantity
    }
  }
  
  // 获取BOM计划用量
  const bomItemsCol = db.collection('bom_items')
  let bomQuery = bomItemsCol.where({})
  
  if (material_id) {
    bomQuery = bomQuery.where({ material_id })
  }
  
  const bomItemsRes = await bomQuery.get()
  
  // 统计BOM计划用量（这里简化处理，实际应该关联BOM和部门）
  for (const item of bomItemsRes.data) {
    // 遍历所有部门
    for (const dept of productionDepts) {
      const deptId = dept // 简化处理，实际应该查询部门ID
      const key = `${item.material_id}_${deptId}`
      
      if (issuedMap[key]) {
        issuedMap[key].planned_quantity += item.quantity || 0
      }
    }
  }
  
  // 计算结存
  const balanceList = []
  for (const key in issuedMap) {
    const item = issuedMap[key]
    item.balance = item.issued_quantity - item.planned_quantity
    balanceList.push(item)
  }
  
  // 如果指定了物料ID，只返回该物料
  if (material_id) {
    return balanceList.filter(item => item.material_id === material_id)
  }
  
  return balanceList
}

/**
 * 获取部门物料结存列表
 * 用于车间仓页面显示
 * @param {Object} data - 包含department_id
 */
async function getDepartmentMaterialBalance(data) {
  const { department_id, department_name } = data
  
  if (!department_id && !department_name) {
    throw new Error('请提供部门ID或部门名称')
  }
  
  // 获取该部门的所有出库记录
  const outboundCol = db.collection('outbound_orders')
  let query = outboundCol.where({
    status: 'confirmed',
    warehouse_type: 'main'
  })
  
  if (department_id) {
    query = query.where({ department_id })
  } else if (department_name) {
    query = query.where({ department_name })
  }
  
  const outboundRes = await query.get()
  
  // 统计各物料的实发数量
  const materialMap = {}
  
  for (const order of outboundRes.data) {
    for (const item of order.items) {
      if (!materialMap[item.material_id]) {
        materialMap[item.material_id] = {
          material_id: item.material_id,
          material_code: item.material_code,
          material_name: item.material_name,
          unit: item.unit,
          issued_quantity: 0,
          planned_quantity: 0,
          balance: 0,
          last_issue_time: null
        }
      }
      
      materialMap[item.material_id].issued_quantity += item.quantity
      
      // 更新最后领用时间
      if (!materialMap[item.material_id].last_issue_time || 
          order.confirm_time > materialMap[item.material_id].last_issue_time) {
        materialMap[item.material_id].last_issue_time = order.confirm_time
      }
    }
  }
  
  // 获取BOM计划用量
  const bomItemsCol = db.collection('bom_items')
  const materialIds = Object.keys(materialMap)
  
  if (materialIds.length > 0) {
    const bomItemsRes = await bomItemsCol
      .where({
        material_id: dbCmd.in(materialIds)
      })
      .get()
    
    for (const item of bomItemsRes.data) {
      if (materialMap[item.material_id]) {
        materialMap[item.material_id].planned_quantity += item.quantity || 0
      }
    }
  }
  
  // 计算结存
  const balanceList = []
  for (const materialId in materialMap) {
    const item = materialMap[materialId]
    item.balance = item.issued_quantity - item.planned_quantity
    balanceList.push(item)
  }
  
  // 按物料编码排序
  balanceList.sort((a, b) => {
    if (a.material_code < b.material_code) return -1
    if (a.material_code > b.material_code) return 1
    return 0
  })
  
  return {
    department_id: department_id || null,
    department_name: department_name || null,
    total_materials: balanceList.length,
    materials: balanceList
  }
}
