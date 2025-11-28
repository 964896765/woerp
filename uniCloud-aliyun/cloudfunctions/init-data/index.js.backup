'use strict';

/**
 * 数据初始化云函数
 * 用于初始化示例数据
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
    categories: await initCategories(),
    materials: await initMaterials()
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
      production_type: 'packing',
      description: '包装部门',
      status: 'active'
    },
    {
      code: 'DEPT008',
      name: '技术部',
      type: 'technical',
      production_type: '',
      description: '技术部门',
      status: 'active'
    }
  ]
  
  const collection = db.collection('departments')
  const inserted = []
  
  for (const dept of departments) {
    // 检查是否已存在
    const existing = await collection.where({ code: dept.code }).get()
    if (existing.data.length === 0) {
      const res = await collection.add(dept)
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
 * 初始化类别数据
 */
async function initCategories() {
  const categories = [
    // 主材仓类别
    {
      name: '正极材料',
      warehouse_type: 'main',
      parent_id: null,
      sort_order: 1,
      description: '正极材料类别',
      status: 'active'
    },
    {
      name: '负极材料',
      warehouse_type: 'main',
      parent_id: null,
      sort_order: 2,
      description: '负极材料类别',
      status: 'active'
    },
    {
      name: '电解液',
      warehouse_type: 'main',
      parent_id: null,
      sort_order: 3,
      description: '电解液类别',
      status: 'active'
    },
    {
      name: '隔膜',
      warehouse_type: 'main',
      parent_id: null,
      sort_order: 4,
      description: '隔膜类别',
      status: 'active'
    },
    // PACK仓类别
    {
      name: '电芯',
      warehouse_type: 'pack',
      parent_id: null,
      sort_order: 1,
      description: 'PACK电芯',
      status: 'active'
    },
    {
      name: '保护板',
      warehouse_type: 'pack',
      parent_id: null,
      sort_order: 2,
      description: 'PACK保护板',
      status: 'active'
    },
    // 辅料仓类别
    {
      name: '包装材料',
      warehouse_type: 'auxiliary',
      parent_id: null,
      sort_order: 1,
      description: '包装辅料',
      status: 'active'
    },
    {
      name: '胶带',
      warehouse_type: 'auxiliary',
      parent_id: null,
      sort_order: 2,
      description: '胶带类辅料',
      status: 'active'
    }
  ]
  
  const collection = db.collection('categories')
  const inserted = []
  
  for (const cat of categories) {
    // 检查是否已存在
    const existing = await collection.where({
      name: cat.name,
      warehouse_type: cat.warehouse_type
    }).get()
    
    if (existing.data.length === 0) {
      const res = await collection.add(cat)
      inserted.push(cat.name)
    }
  }
  
  return {
    success: true,
    message: `类别数据初始化完成，新增 ${inserted.length} 个类别`,
    data: inserted
  }
}

/**
 * 初始化物料数据（包含示例数据）
 */
async function initMaterials() {
  // 先获取类别和部门ID
  const categoriesCol = db.collection('categories')
  const departmentsCol = db.collection('departments')
  
  const positiveCategory = await categoriesCol.where({
    name: '正极材料',
    warehouse_type: 'main'
  }).get()
  
  const techDept = await departmentsCol.where({ code: 'DEPT008' }).get()
  const batchingDept = await departmentsCol.where({ code: 'DEPT001' }).get()
  
  if (positiveCategory.data.length === 0) {
    return {
      success: false,
      message: '请先初始化类别数据',
      data: null
    }
  }
  
  const categoryId = positiveCategory.data[0]._id
  
  // 示例物料数据
  const materials = [
    {
      code: 'A01-01-0001',
      name: '三元',
      category_id: categoryId,
      category_name: '正极材料',
      unit: 'kg',
      spec: 'XLCKY',
      batch_no: '20251128',
      warehouse_type: 'main',
      stock_quantity: 800,
      using_departments: ['技术部', '配料'],
      price: 150,
      min_stock: 100,
      description: '三元正极材料示例数据',
      status: 'active'
    },
    {
      code: 'A01-01-0002',
      name: '三元622',
      category_id: categoryId,
      category_name: '正极材料',
      unit: 'kg',
      spec: 'NCM622',
      batch_no: '20251127',
      warehouse_type: 'main',
      stock_quantity: 500,
      using_departments: ['配料'],
      price: 160,
      min_stock: 100,
      description: '三元622正极材料',
      status: 'active'
    },
    {
      code: 'A01-01-0003',
      name: '三元811',
      category_id: categoryId,
      category_name: '正极材料',
      unit: 'kg',
      spec: 'NCM811',
      batch_no: '20251126',
      warehouse_type: 'main',
      stock_quantity: 300,
      using_departments: ['配料'],
      price: 180,
      min_stock: 50,
      description: '三元811正极材料',
      status: 'active'
    }
  ]
  
  const collection = db.collection('materials')
  const inserted = []
  
  for (const material of materials) {
    // 检查是否已存在
    const existing = await collection.where({ code: material.code }).get()
    if (existing.data.length === 0) {
      const res = await collection.add(material)
      inserted.push(material.name)
    }
  }
  
  return {
    success: true,
    message: `物料数据初始化完成，新增 ${inserted.length} 个物料`,
    data: inserted
  }
}
