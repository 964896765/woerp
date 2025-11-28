'use strict';

/**
 * 数据初始化云函数（增强版）
 * 用于初始化完整的测试数据，覆盖所有仓库类型
 */

const db = uniCloud.database()

exports.main = async (event, context) => {
  const { action } = event
  
  try {
    switch (action) {
      case 'initAll':
        return await initAllData()
      case 'initDepartments':
        return await initDepartments()
      case 'initCategories':
        return await initCategories()
      case 'initMaterials':
        return await initMaterials()
      case 'initSuppliers':
        return await initSuppliers()
      case 'initBoms':
        return await initBoms()
      case 'initStockRecords':
        return await initStockRecords()
      default:
        return {
          code: 400,
          message: '未知操作',
          data: null
        }
    }
  } catch (error) {
    console.error('数据初始化失败:', error)
    return {
      code: 500,
      message: error.message,
      data: null
    }
  }
}

/**
 * 初始化所有数据
 */
async function initAllData() {
  const results = {
    departments: await initDepartments(),
    suppliers: await initSuppliers(),
    categories: await initCategories(),
    materials: await initMaterials(),
    boms: await initBoms(),
    stockRecords: await initStockRecords()
  }
  
  return {
    code: 200,
    message: '所有数据初始化成功',
    data: results
  }
}

/**
 * 初始化部门数据
 */
async function initDepartments() {
  const departments = [
    {
      code: 'DEPT001',
      name: '配料',
      type: 'production',
      production_type: 'batching',
      description: '配料部门',
      status: 'active'
    },
    {
      code: 'DEPT002',
      name: '制片',
      type: 'production',
      production_type: 'coating',
      description: '制片部门',
      status: 'active'
    },
    {
      code: 'DEPT003',
      name: '卷绕',
      type: 'production',
      production_type: 'winding',
      description: '卷绕部门',
      status: 'active'
    },
    {
      code: 'DEPT004',
      name: '封装',
      type: 'production',
      production_type: 'packaging',
      description: '封装部门',
      status: 'active'
    },
    {
      code: 'DEPT005',
      name: '注液',
      type: 'production',
      production_type: 'electrolyte',
      description: '注液部门',
      status: 'active'
    },
    {
      code: 'DEPT006',
      name: '化成',
      type: 'production',
      production_type: 'formation',
      description: '化成部门',
      status: 'active'
    },
    {
      code: 'DEPT007',
      name: '包装',
      type: 'production',
      production_type: 'final_packaging',
      description: '包装部门',
      status: 'active'
    },
    {
      code: 'DEPT008',
      name: '技术部',
      type: 'support',
      production_type: null,
      description: '技术支持部门',
      status: 'active'
    }
  ]
  
  const collection = db.collection('departments')
  const inserted = []
  
  for (const dept of departments) {
    const existing = await collection.where({ code: dept.code }).get()
    if (existing.data.length === 0) {
      await collection.add(dept)
      inserted.push(dept.name)
    }
  }
  
  return {
    success: true,
    message: `部门数据初始化完成，新增 ${inserted.length} 个部门`,
    data: inserted
  }
}

/**
 * 初始化供应商数据
 */
async function initSuppliers() {
  const suppliers = [
    {
      code: 'SUP001',
      name: '格林美股份',
      contact_person: '张经理',
      phone: '13800138001',
      address: '湖北省荆门市',
      category: '正极材料',
      status: 'active',
      description: '三元材料供应商'
    },
    {
      code: 'SUP002',
      name: '贝特瑞新材料',
      contact_person: '李经理',
      phone: '13800138002',
      address: '深圳市龙华区',
      category: '负极材料',
      status: 'active',
      description: '石墨负极材料供应商'
    },
    {
      code: 'SUP003',
      name: '天赐材料',
      contact_person: '王经理',
      phone: '13800138003',
      address: '广州市黄埔区',
      category: '电解液',
      status: 'active',
      description: '电解液供应商'
    },
    {
      code: 'SUP004',
      name: '恩捷股份',
      contact_person: '赵经理',
      phone: '13800138004',
      address: '上海市闵行区',
      category: '隔膜',
      status: 'active',
      description: '湿法隔膜供应商'
    }
  ]
  
  const collection = db.collection('suppliers')
  const inserted = []
  
  for (const supplier of suppliers) {
    const existing = await collection.where({ code: supplier.code }).get()
    if (existing.data.length === 0) {
      await collection.add(supplier)
      inserted.push(supplier.name)
    }
  }
  
  return {
    success: true,
    message: `供应商数据初始化完成，新增 ${inserted.length} 个供应商`,
    data: inserted
  }
}

/**
 * 初始化类别数据（覆盖所有仓库类型）
 */
async function initCategories() {
  const categories = [
    // 主材仓类别
    { name: '正极材料', warehouse_type: 'main', sort_order: 1, description: '正极材料类别', status: 'active' },
    { name: '负极材料', warehouse_type: 'main', sort_order: 2, description: '负极材料类别', status: 'active' },
    { name: '电解液', warehouse_type: 'main', sort_order: 3, description: '电解液类别', status: 'active' },
    { name: '隔膜', warehouse_type: 'main', sort_order: 4, description: '隔膜类别', status: 'active' },
    { name: '导电剂', warehouse_type: 'main', sort_order: 5, description: '导电剂类别', status: 'active' },
    { name: '粘结剂', warehouse_type: 'main', sort_order: 6, description: '粘结剂类别', status: 'active' },
    
    // 车间仓类别（按部门）
    { name: '配料', warehouse_type: 'workshop', sort_order: 1, description: '配料部门物料', status: 'active' },
    { name: '制片', warehouse_type: 'workshop', sort_order: 2, description: '制片部门物料', status: 'active' },
    { name: '卷绕', warehouse_type: 'workshop', sort_order: 3, description: '卷绕部门物料', status: 'active' },
    { name: '封装', warehouse_type: 'workshop', sort_order: 4, description: '封装部门物料', status: 'active' },
    { name: '注液', warehouse_type: 'workshop', sort_order: 5, description: '注液部门物料', status: 'active' },
    { name: '化成', warehouse_type: 'workshop', sort_order: 6, description: '化成部门物料', status: 'active' },
    
    // BOM仓类别
    { name: '电芯BOM', warehouse_type: 'bom', sort_order: 1, description: '电芯BOM物料', status: 'active' },
    { name: '模组BOM', warehouse_type: 'bom', sort_order: 2, description: '模组BOM物料', status: 'active' },
    
    // PACK仓类别
    { name: '电芯', warehouse_type: 'pack', sort_order: 1, description: 'PACK电芯', status: 'active' },
    { name: '保护板', warehouse_type: 'pack', sort_order: 2, description: 'PACK保护板', status: 'active' },
    { name: '连接片', warehouse_type: 'pack', sort_order: 3, description: 'PACK连接片', status: 'active' },
    { name: '外壳', warehouse_type: 'pack', sort_order: 4, description: 'PACK外壳', status: 'active' },
    
    // 辅料仓类别
    { name: '包装材料', warehouse_type: 'auxiliary', sort_order: 1, description: '包装辅料', status: 'active' },
    { name: '胶带', warehouse_type: 'auxiliary', sort_order: 2, description: '胶带类辅料', status: 'active' },
    { name: '标签', warehouse_type: 'auxiliary', sort_order: 3, description: '标签类辅料', status: 'active' },
    { name: '清洁用品', warehouse_type: 'auxiliary', sort_order: 4, description: '清洁用品', status: 'active' },
    
    // 待处理仓类别
    { name: '待检验', warehouse_type: 'pending', sort_order: 1, description: '待检验物料', status: 'active' },
    { name: '待退货', warehouse_type: 'pending', sort_order: 2, description: '待退货物料', status: 'active' }
  ]
  
  const collection = db.collection('categories')
  const inserted = []
  
  for (const cat of categories) {
    const existing = await collection.where({
      name: cat.name,
      warehouse_type: cat.warehouse_type
    }).get()
    
    if (existing.data.length === 0) {
      await collection.add(cat)
      inserted.push(`${cat.warehouse_type}-${cat.name}`)
    }
  }
  
  return {
    success: true,
    message: `类别数据初始化完成，新增 ${inserted.length} 个类别`,
    data: inserted
  }
}

/**
 * 初始化物料数据（覆盖所有仓库类型）
 */
async function initMaterials() {
  // 获取所有类别
  const categoriesCol = db.collection('categories')
  const allCategories = await categoriesCol.get()
  
  if (allCategories.data.length === 0) {
    return {
      success: false,
      message: '请先初始化类别数据',
      data: null
    }
  }
  
  // 创建类别映射
  const categoryMap = {}
  allCategories.data.forEach(cat => {
    const key = `${cat.warehouse_type}-${cat.name}`
    categoryMap[key] = cat._id
  })
  
  const materials = [
    // 主材仓物料
    { code: 'A01-01-0001', name: '三元NCM523', category_key: 'main-正极材料', unit: 'kg', spec: 'NCM523', batch_no: '20251128', warehouse_type: 'main', stock_quantity: 800, price: 150, min_stock: 100, description: '三元523正极材料', status: 'active' },
    { code: 'A01-01-0002', name: '三元NCM622', category_key: 'main-正极材料', unit: 'kg', spec: 'NCM622', batch_no: '20251127', warehouse_type: 'main', stock_quantity: 500, price: 160, min_stock: 100, description: '三元622正极材料', status: 'active' },
    { code: 'A01-01-0003', name: '三元NCM811', category_key: 'main-正极材料', unit: 'kg', spec: 'NCM811', batch_no: '20251126', warehouse_type: 'main', stock_quantity: 300, price: 180, min_stock: 50, description: '三元811正极材料', status: 'active' },
    { code: 'A01-02-0001', name: '人造石墨', category_key: 'main-负极材料', unit: 'kg', spec: 'AG-10', batch_no: '20251128', warehouse_type: 'main', stock_quantity: 600, price: 80, min_stock: 100, description: '人造石墨负极材料', status: 'active' },
    { code: 'A01-02-0002', name: '天然石墨', category_key: 'main-负极材料', unit: 'kg', spec: 'NG-20', batch_no: '20251127', warehouse_type: 'main', stock_quantity: 400, price: 70, min_stock: 80, description: '天然石墨负极材料', status: 'active' },
    { code: 'A01-03-0001', name: 'LiPF6电解液', category_key: 'main-电解液', unit: 'L', spec: '1M-EC/DMC', batch_no: '20251128', warehouse_type: 'main', stock_quantity: 1000, price: 50, min_stock: 200, description: '六氟磷酸锂电解液', status: 'active' },
    { code: 'A01-04-0001', name: 'PP隔膜', category_key: 'main-隔膜', unit: 'm²', spec: '20μm', batch_no: '20251128', warehouse_type: 'main', stock_quantity: 5000, price: 5, min_stock: 1000, description: 'PP湿法隔膜', status: 'active' },
    { code: 'A01-05-0001', name: '导电炭黑', category_key: 'main-导电剂', unit: 'kg', spec: 'SP', batch_no: '20251128', warehouse_type: 'main', stock_quantity: 200, price: 120, min_stock: 50, description: 'Super P导电炭黑', status: 'active' },
    { code: 'A01-06-0001', name: 'PVDF粘结剂', category_key: 'main-粘结剂', unit: 'kg', spec: 'HSV900', batch_no: '20251128', warehouse_type: 'main', stock_quantity: 150, price: 200, min_stock: 30, description: 'PVDF粘结剂', status: 'active' },
    
    // PACK仓物料
    { code: 'P01-01-0001', name: '18650电芯', category_key: 'pack-电芯', unit: '只', spec: '3.7V 2600mAh', batch_no: '20251128', warehouse_type: 'pack', stock_quantity: 10000, price: 8, min_stock: 2000, description: '18650圆柱电芯', status: 'active' },
    { code: 'P01-01-0002', name: '21700电芯', category_key: 'pack-电芯', unit: '只', spec: '3.7V 4800mAh', batch_no: '20251128', warehouse_type: 'pack', stock_quantity: 8000, price: 12, min_stock: 1500, description: '21700圆柱电芯', status: 'active' },
    { code: 'P01-02-0001', name: 'BMS保护板', category_key: 'pack-保护板', unit: '块', spec: '12S 50A', batch_no: '20251128', warehouse_type: 'pack', stock_quantity: 500, price: 50, min_stock: 100, description: '12串50A保护板', status: 'active' },
    { code: 'P01-03-0001', name: '镍片', category_key: 'pack-连接片', unit: 'kg', spec: '0.15mm', batch_no: '20251128', warehouse_type: 'pack', stock_quantity: 100, price: 80, min_stock: 20, description: '镍片连接片', status: 'active' },
    { code: 'P01-04-0001', name: 'ABS外壳', category_key: 'pack-外壳', unit: '个', spec: '12S外壳', batch_no: '20251128', warehouse_type: 'pack', stock_quantity: 300, price: 15, min_stock: 50, description: 'ABS塑料外壳', status: 'active' },
    
    // 辅料仓物料
    { code: 'F01-01-0001', name: '纸箱', category_key: 'auxiliary-包装材料', unit: '个', spec: '60x40x40cm', batch_no: '20251128', warehouse_type: 'auxiliary', stock_quantity: 1000, price: 5, min_stock: 200, description: '五层瓦楞纸箱', status: 'active' },
    { code: 'F01-01-0002', name: '珍珠棉', category_key: 'auxiliary-包装材料', unit: 'm²', spec: '2mm', batch_no: '20251128', warehouse_type: 'auxiliary', stock_quantity: 500, price: 3, min_stock: 100, description: '珍珠棉防护材料', status: 'active' },
    { code: 'F01-02-0001', name: '封箱胶带', category_key: 'auxiliary-胶带', unit: '卷', spec: '48mm x 100m', batch_no: '20251128', warehouse_type: 'auxiliary', stock_quantity: 200, price: 2, min_stock: 50, description: '透明封箱胶带', status: 'active' },
    { code: 'F01-02-0002', name: '警示胶带', category_key: 'auxiliary-胶带', unit: '卷', spec: '48mm x 100m', batch_no: '20251128', warehouse_type: 'auxiliary', stock_quantity: 100, price: 3, min_stock: 30, description: '黄黑警示胶带', status: 'active' },
    { code: 'F01-03-0001', name: '产品标签', category_key: 'auxiliary-标签', unit: '张', spec: '10x5cm', batch_no: '20251128', warehouse_type: 'auxiliary', stock_quantity: 5000, price: 0.1, min_stock: 1000, description: '不干胶产品标签', status: 'active' },
    { code: 'F01-04-0001', name: '无尘布', category_key: 'auxiliary-清洁用品', unit: '包', spec: '100片/包', batch_no: '20251128', warehouse_type: 'auxiliary', stock_quantity: 50, price: 20, min_stock: 10, description: '超细纤维无尘布', status: 'active' }
  ]
  
  const collection = db.collection('materials')
  const inserted = []
  
  for (const material of materials) {
    const categoryId = categoryMap[material.category_key]
    if (!categoryId) {
      console.log(`类别不存在: ${material.category_key}`)
      continue
    }
    
    const existing = await collection.where({ code: material.code }).get()
    if (existing.data.length === 0) {
      const materialData = {
        code: material.code,
        name: material.name,
        category_id: categoryId,
        category_name: material.category_key.split('-')[1],
        unit: material.unit,
        spec: material.spec,
        batch_no: material.batch_no,
        warehouse_type: material.warehouse_type,
        stock_quantity: material.stock_quantity,
        price: material.price,
        min_stock: material.min_stock,
        description: material.description,
        status: material.status
      }
      
      await collection.add(materialData)
      inserted.push(material.name)
    }
  }
  
  return {
    success: true,
    message: `物料数据初始化完成，新增 ${inserted.length} 个物料`,
    data: inserted
  }
}

/**
 * 初始化BOM数据
 */
async function initBoms() {
  // 获取物料
  const materialsCol = db.collection('materials')
  const materials = await materialsCol.get()
  
  if (materials.data.length === 0) {
    return {
      success: false,
      message: '请先初始化物料数据',
      data: null
    }
  }
  
  // 创建物料映射
  const materialMap = {}
  materials.data.forEach(m => {
    materialMap[m.code] = m
  })
  
  // 创建示例BOM
  const bom = {
    code: 'BOM-001',
    name: '18650电芯标准BOM',
    version: 'V1.0',
    product_name: '18650-2600mAh电芯',
    product_spec: '3.7V 2600mAh',
    status: 'active',
    description: '18650电芯标准配方',
    items_count: 6
  }
  
  const bomHeadersCol = db.collection('bom_headers')
  const existingBom = await bomHeadersCol.where({ code: bom.code }).get()
  
  if (existingBom.data.length > 0) {
    return {
      success: true,
      message: 'BOM已存在',
      data: []
    }
  }
  
  const bomResult = await bomHeadersCol.add(bom)
  const bomId = bomResult.id
  
  // 创建BOM明细
  const bomItems = [
    { material_code: 'A01-01-0001', quantity: 0.5, unit: 'kg', sort_order: 1 },
    { material_code: 'A01-02-0001', quantity: 0.3, unit: 'kg', sort_order: 2 },
    { material_code: 'A01-03-0001', quantity: 0.1, unit: 'L', sort_order: 3 },
    { material_code: 'A01-04-0001', quantity: 2, unit: 'm²', sort_order: 4 },
    { material_code: 'A01-05-0001', quantity: 0.02, unit: 'kg', sort_order: 5 },
    { material_code: 'A01-06-0001', quantity: 0.01, unit: 'kg', sort_order: 6 }
  ]
  
  const bomItemsCol = db.collection('bom_items')
  const insertedItems = []
  
  for (const item of bomItems) {
    const material = materialMap[item.material_code]
    if (!material) continue
    
    const bomItem = {
      bom_id: bomId,
      bom_code: bom.code,
      material_id: material._id,
      material_code: material.code,
      material_name: material.name,
      material_spec: material.spec,
      quantity: item.quantity,
      unit: item.unit,
      sort_order: item.sort_order,
      status: 'active'
    }
    
    await bomItemsCol.add(bomItem)
    insertedItems.push(material.name)
  }
  
  return {
    success: true,
    message: `BOM数据初始化完成，创建1个BOM，包含${insertedItems.length}个物料`,
    data: { bom: bom.name, items: insertedItems }
  }
}

/**
 * 初始化库存记录
 */
async function initStockRecords() {
  // 获取物料
  const materialsCol = db.collection('materials')
  const materials = await materialsCol.limit(5).get()
  
  if (materials.data.length === 0) {
    return {
      success: false,
      message: '请先初始化物料数据',
      data: null
    }
  }
  
  const stockRecordsCol = db.collection('stock_records')
  const inserted = []
  
  // 为每个物料创建一条入库记录
  for (const material of materials.data) {
    const record = {
      material_id: material._id,
      material_code: material.code,
      material_name: material.name,
      material_spec: material.spec,
      warehouse_type: material.warehouse_type,
      type: 'inbound',
      subtype: 'purchase',
      quantity: material.stock_quantity,
      unit: material.unit,
      batch_no: material.batch_no,
      operator: '系统管理员',
      remark: '初始化库存',
      created_at: Date.now()
    }
    
    await stockRecordsCol.add(record)
    inserted.push(material.name)
  }
  
  return {
    success: true,
    message: `库存记录初始化完成，新增 ${inserted.length} 条记录`,
    data: inserted
  }
}
