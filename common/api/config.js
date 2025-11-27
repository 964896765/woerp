/**
 * API 配置文件
 * 定义所有API接口地址
 */

// 从环境变量获取API基础地址，如果没有则使用默认值
const BASE_URL = process.env.VUE_APP_API_BASE_URL || '/api/v1'

/**
 * API 接口配置
 */
const API = {
  // ==================== 认证授权 ====================
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,           // 用户登录
    LOGOUT: `${BASE_URL}/auth/logout`,         // 退出登录
    REFRESH: `${BASE_URL}/auth/refresh`,       // 刷新令牌
  },

  // ==================== 用户管理 ====================
  USER: {
    ME: `${BASE_URL}/users/me`,                // 获取当前用户信息
    UPDATE: `${BASE_URL}/users/me`,            // 更新用户信息
    AVATAR: `${BASE_URL}/users/me/avatar`,     // 上传头像
  },

  // ==================== 物料管理 ====================
  MATERIAL: {
    LIST: `${BASE_URL}/materials`,             // 物料列表
    DETAIL: (id) => `${BASE_URL}/materials/${id}`,  // 物料详情
    CREATE: `${BASE_URL}/materials`,           // 创建物料
    UPDATE: (id) => `${BASE_URL}/materials/${id}`,  // 更新物料
    DELETE: (id) => `${BASE_URL}/materials/${id}`,  // 删除物料
    SEARCH: `${BASE_URL}/materials/search`,    // 搜索物料
    EXPORT: `${BASE_URL}/materials/export`,    // 导出物料
    IMPORT: `${BASE_URL}/materials/import`,    // 导入物料
  },

  // ==================== 类别管理 ====================
  CATEGORY: {
    LIST: `${BASE_URL}/categories`,            // 类别列表
    TREE: `${BASE_URL}/categories/tree`,       // 类别树
    CREATE: `${BASE_URL}/categories`,          // 创建类别
    UPDATE: (id) => `${BASE_URL}/categories/${id}`,  // 更新类别
    DELETE: (id) => `${BASE_URL}/categories/${id}`,  // 删除类别
  },

  // ==================== 仓库管理 ====================
  WAREHOUSE: {
    LIST: `${BASE_URL}/warehouses`,            // 仓库列表
    DETAIL: (id) => `${BASE_URL}/warehouses/${id}`,  // 仓库详情
    STATS: (type) => `${BASE_URL}/warehouses/${type}/stats`,  // 仓库统计
  },

  // ==================== 出入库管理 ====================
  INBOUND: {
    LIST: `${BASE_URL}/inbound/orders`,        // 入库单列表
    DETAIL: (id) => `${BASE_URL}/inbound/orders/${id}`,  // 入库单详情
    CREATE: `${BASE_URL}/inbound/orders`,      // 创建入库单
    UPDATE: (id) => `${BASE_URL}/inbound/orders/${id}`,  // 更新入库单
    DELETE: (id) => `${BASE_URL}/inbound/orders/${id}`,  // 删除入库单
    CONFIRM: (id) => `${BASE_URL}/inbound/orders/${id}/confirm`,  // 确认入库
  },

  OUTBOUND: {
    LIST: `${BASE_URL}/outbound/orders`,       // 出库单列表
    DETAIL: (id) => `${BASE_URL}/outbound/orders/${id}`,  // 出库单详情
    CREATE: `${BASE_URL}/outbound/orders`,     // 创建出库单
    UPDATE: (id) => `${BASE_URL}/outbound/orders/${id}`,  // 更新出库单
    DELETE: (id) => `${BASE_URL}/outbound/orders/${id}`,  // 删除出库单
    CONFIRM: (id) => `${BASE_URL}/outbound/orders/${id}/confirm`,  // 确认出库
  },

  RECORDS: {
    LIST: `${BASE_URL}/records`,               // 出入库记录
    DETAIL: (id) => `${BASE_URL}/records/${id}`,  // 记录详情
    EXPORT: `${BASE_URL}/records/export`,      // 导出记录
  },

  // ==================== BOM管理 ====================
  BOM: {
    LIST: `${BASE_URL}/bom`,                   // BOM列表
    DETAIL: (id) => `${BASE_URL}/bom/${id}`,   // BOM详情
    CREATE: `${BASE_URL}/bom`,                 // 创建BOM
    UPDATE: (id) => `${BASE_URL}/bom/${id}`,   // 更新BOM
    DELETE: (id) => `${BASE_URL}/bom/${id}`,   // 删除BOM
    ISSUE: (id) => `${BASE_URL}/bom/${id}/issue`,  // 按BOM发料
    IMPORT: `${BASE_URL}/bom/import`,          // 导入BOM
    EXPORT: `${BASE_URL}/bom/export`,          // 导出BOM
  },

  // ==================== 部门管理 ====================
  DEPARTMENT: {
    LIST: `${BASE_URL}/departments`,           // 部门列表
    TREE: `${BASE_URL}/departments/tree`,      // 部门树
    CREATE: `${BASE_URL}/departments`,         // 创建部门
    UPDATE: (id) => `${BASE_URL}/departments/${id}`,  // 更新部门
    DELETE: (id) => `${BASE_URL}/departments/${id}`,  // 删除部门
  },

  // ==================== 供应商管理 ====================
  SUPPLIER: {
    LIST: `${BASE_URL}/suppliers`,             // 供应商列表
    DETAIL: (id) => `${BASE_URL}/suppliers/${id}`,  // 供应商详情
    CREATE: `${BASE_URL}/suppliers`,           // 创建供应商
    UPDATE: (id) => `${BASE_URL}/suppliers/${id}`,  // 更新供应商
    DELETE: (id) => `${BASE_URL}/suppliers/${id}`,  // 删除供应商
  },

  // ==================== 报表查询 ====================
  REPORT: {
    STOCK: `${BASE_URL}/reports/stock`,        // 库存报表
    TRANSACTIONS: `${BASE_URL}/reports/transactions`,  // 出入库统计
    MATERIAL_FLOW: `${BASE_URL}/reports/material-flow`,  // 物料流水
    DEPARTMENT_USAGE: `${BASE_URL}/reports/department-usage`,  // 部门用料统计
  },

  // ==================== 文件上传 ====================
  UPLOAD: {
    IMAGE: `${BASE_URL}/upload/image`,         // 上传图片
    FILE: `${BASE_URL}/upload/file`,           // 上传文件
    EXCEL: `${BASE_URL}/upload/excel`,         // 上传Excel
  },

  // ==================== 系统配置 ====================
  SYSTEM: {
    CONFIG: `${BASE_URL}/system/config`,       // 系统配置
    DICT: `${BASE_URL}/system/dict`,           // 数据字典
    LOG: `${BASE_URL}/system/log`,             // 操作日志
  },
}

export default API
