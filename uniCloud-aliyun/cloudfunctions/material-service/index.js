/**
 * 物料服务云函数
 * 提供物料的增删改查、搜索、导入导出等功能
 */

'use strict';

const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
  const { action, data } = event
  
  // 响应结构
  const response = {
    code: 200,
    message: 'success',
    data: null
  }
  
  try {
    switch (action) {
      // 获取物料列表
      case 'list':
        response.data = await getMaterialList(data)
        break
      
      // 获取物料详情
      case 'detail':
        response.data = await getMaterialDetail(data.id)
        break
      
      // 创建物料
      case 'create':
        response.data = await createMaterial(data)
        break
      
      // 更新物料
      case 'update':
        response.data = await updateMaterial(data.id, data)
        break
      
      // 删除物料
      case 'delete':
        response.data = await deleteMaterial(data.id)
        break
      
      // 搜索物料
      case 'search':
        response.data = await searchMaterial(data)
        break
      
      // 批量导入物料
      case 'import':
        response.data = await importMaterials(data)
        break
      
      // 导出物料
      case 'export':
        response.data = await exportMaterials(data)
        break
      
      // 更新库存
      case 'updateStock':
        response.data = await updateStock(data)
        break
      
      default:
        response.code = 400
        response.message = `未知操作: ${action}`
    }
  } catch (error) {
    console.error('物料服务错误:', error)
    response.code = 500
    response.message = error.message || '服务器内部错误'
  }
  
  return response
}

/**
 * 获取物料列表
 */
async function getMaterialList(params) {
  const {
    warehouse_type,
    category_id,
    status = 'active',
    page = 1,
    pageSize = 20
  } = params
  
  const collection = db.collection('materials')
  let query = collection.where({ status })
  
  // 按仓库类型筛选
  if (warehouse_type) {
    query = query.where({ warehouse_type })
  }
  
  // 按类别筛选
  if (category_id) {
    query = query.where({ category_id })
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
 * 获取物料详情
 */
async function getMaterialDetail(id) {
  const result = await db.collection('materials')
    .doc(id)
    .get()
  
  if (result.data.length === 0) {
    throw new Error('物料不存在')
  }
  
  return result.data[0]
}

/**
 * 创建物料
 */
async function createMaterial(data) {
  // 检查物料编码是否已存在
  const existResult = await db.collection('materials')
    .where({ code: data.code })
    .count()
  
  if (existResult.total > 0) {
    throw new Error('物料编码已存在')
  }
  
  // 获取类别名称
  if (data.category_id) {
    const categoryResult = await db.collection('categories')
      .doc(data.category_id)
      .get()
    
    if (categoryResult.data.length > 0) {
      data.category_name = categoryResult.data[0].name
    }
  }
  
  // 获取供应商名称
  if (data.supplier_id) {
    const supplierResult = await db.collection('suppliers')
      .doc(data.supplier_id)
      .get()
    
    if (supplierResult.data.length > 0) {
      data.supplier_name = supplierResult.data[0].name
    }
  }
  
  // 插入数据
  const result = await db.collection('materials').add(data)
  
  return {
    id: result.id,
    message: '创建成功'
  }
}

/**
 * 更新物料
 */
async function updateMaterial(id, data) {
  // 检查物料是否存在
  const existResult = await db.collection('materials')
    .doc(id)
    .get()
  
  if (existResult.data.length === 0) {
    throw new Error('物料不存在')
  }
  
  // 如果修改了编码，检查新编码是否已被使用
  if (data.code && data.code !== existResult.data[0].code) {
    const codeResult = await db.collection('materials')
      .where({
        code: data.code,
        _id: dbCmd.neq(id)
      })
      .count()
    
    if (codeResult.total > 0) {
      throw new Error('物料编码已存在')
    }
  }
  
  // 更新类别名称
  if (data.category_id) {
    const categoryResult = await db.collection('categories')
      .doc(data.category_id)
      .get()
    
    if (categoryResult.data.length > 0) {
      data.category_name = categoryResult.data[0].name
    }
  }
  
  // 更新供应商名称
  if (data.supplier_id) {
    const supplierResult = await db.collection('suppliers')
      .doc(data.supplier_id)
      .get()
    
    if (supplierResult.data.length > 0) {
      data.supplier_name = supplierResult.data[0].name
    }
  }
  
  // 更新时间
  data.update_time = Date.now()
  
  // 更新数据
  await db.collection('materials')
    .doc(id)
    .update(data)
  
  return { message: '更新成功' }
}

/**
 * 删除物料
 */
async function deleteMaterial(id) {
  // 检查物料是否存在
  const existResult = await db.collection('materials')
    .doc(id)
    .get()
  
  if (existResult.data.length === 0) {
    throw new Error('物料不存在')
  }
  
  // 检查是否有库存
  const material = existResult.data[0]
  if (material.stock_quantity > 0) {
    throw new Error('物料有库存，无法删除')
  }
  
  // 检查是否在BOM中使用
  const bomResult = await db.collection('bom_items')
    .where({ material_id: id })
    .count()
  
  if (bomResult.total > 0) {
    throw new Error('物料已在BOM中使用，无法删除')
  }
  
  // 删除数据
  await db.collection('materials')
    .doc(id)
    .remove()
  
  return { message: '删除成功' }
}

/**
 * 搜索物料
 */
async function searchMaterial(params) {
  const {
    keyword,
    warehouse_type,
    category_id,
    status = 'active',
    page = 1,
    pageSize = 20
  } = params
  
  const collection = db.collection('materials')
  
  // 构建查询条件
  const where = { status }
  
  if (warehouse_type) {
    where.warehouse_type = warehouse_type
  }
  
  if (category_id) {
    where.category_id = category_id
  }
  
  // 关键词搜索（物料编码或名称）
  if (keyword) {
    where.$or = [
      { code: new RegExp(keyword, 'i') },
      { name: new RegExp(keyword, 'i') }
    ]
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
 * 批量导入物料
 */
async function importMaterials(params) {
  const { materials, warehouse_type } = params
  
  if (!Array.isArray(materials) || materials.length === 0) {
    throw new Error('导入数据为空')
  }
  
  const successList = []
  const failList = []
  
  for (const material of materials) {
    try {
      // 检查必填字段
      if (!material.code || !material.name) {
        throw new Error('物料编码和名称不能为空')
      }
      
      // 检查编码是否已存在
      const existResult = await db.collection('materials')
        .where({ code: material.code })
        .get()
      
      if (existResult.data.length > 0) {
        // 更新现有物料
        const existId = existResult.data[0]._id
        await updateMaterial(existId, {
          ...material,
          warehouse_type: warehouse_type || material.warehouse_type
        })
        successList.push({ code: material.code, action: 'update' })
      } else {
        // 创建新物料
        await createMaterial({
          ...material,
          warehouse_type: warehouse_type || material.warehouse_type
        })
        successList.push({ code: material.code, action: 'create' })
      }
    } catch (error) {
      failList.push({
        code: material.code,
        error: error.message
      })
    }
  }
  
  return {
    total: materials.length,
    success: successList.length,
    fail: failList.length,
    successList,
    failList
  }
}

/**
 * 导出物料
 */
async function exportMaterials(params) {
  const {
    warehouse_type,
    category_id,
    status = 'active'
  } = params
  
  const collection = db.collection('materials')
  const where = { status }
  
  if (warehouse_type) {
    where.warehouse_type = warehouse_type
  }
  
  if (category_id) {
    where.category_id = category_id
  }
  
  // 查询所有符合条件的物料
  const result = await collection
    .where(where)
    .orderBy('category_name', 'asc')
    .orderBy('code', 'asc')
    .get()
  
  return {
    list: result.data,
    total: result.data.length
  }
}

/**
 * 更新库存
 */
async function updateStock(params) {
  const { material_id, quantity, type } = params
  
  // 获取物料信息
  const materialResult = await db.collection('materials')
    .doc(material_id)
    .get()
  
  if (materialResult.data.length === 0) {
    throw new Error('物料不存在')
  }
  
  const material = materialResult.data[0]
  const oldQuantity = material.stock_quantity || 0
  
  // 计算新库存
  let newQuantity
  if (type === 'inbound') {
    newQuantity = oldQuantity + quantity
  } else if (type === 'outbound') {
    newQuantity = oldQuantity - quantity
    if (newQuantity < 0) {
      throw new Error('库存不足')
    }
  } else {
    throw new Error('未知的库存操作类型')
  }
  
  // 更新库存
  await db.collection('materials')
    .doc(material_id)
    .update({
      stock_quantity: newQuantity,
      update_time: Date.now()
    })
  
  return {
    material_id,
    old_quantity: oldQuantity,
    new_quantity: newQuantity,
    change_quantity: quantity,
    type
  }
}
