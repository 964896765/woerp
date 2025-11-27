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
