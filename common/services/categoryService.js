/**
 * 类别服务层
 * 封装所有类别相关的业务逻辑和API调用
 */

import { db } from '../api/unicloud.js'

/**
 * 类别服务类
 */
class CategoryService {
  /**
   * 获取类别列表
   * @param {Object} params - 查询参数
   * @param {String} params.warehouse_type - 仓库类型
   * @returns {Promise}
   */
  async getCategoryList(params = {}) {
    try {
      const { warehouse_type } = params
      
      // 构建查询条件
      const where = {}
      if (warehouse_type) {
        where.warehouse_type = warehouse_type
      }
      
      // 直接查询categories集合
      const result = await db.get('categories', where, {
        orderBy: { field: 'sort_order', order: 'asc' }
      })
      
      return {
        success: true,
        data: result || []
      }
    } catch (error) {
      console.error('[CategoryService] getCategoryList error:', error)
      return {
        success: false,
        message: error.message || '获取类别列表失败',
        data: []
      }
    }
  }
  
  /**
   * 创建类别
   * @param {Object} categoryData - 类别数据
   * @returns {Promise}
   */
  async createCategory(categoryData) {
    try {
      // 添加创建时间和更新时间
      const now = Date.now()
      const data = {
        ...categoryData,
        created_at: now,
        updated_at: now
      }
      
      const id = await db.add('categories', data)
      
      return {
        success: true,
        data: { _id: id, ...data },
        message: '创建成功'
      }
    } catch (error) {
      console.error('[CategoryService] createCategory error:', error)
      return {
        success: false,
        message: error.message || '创建类别失败'
      }
    }
  }
  
  /**
   * 更新类别
   * @param {String} categoryId - 类别ID
   * @param {Object} categoryData - 类别数据
   * @returns {Promise}
   */
  async updateCategory(categoryId, categoryData) {
    try {
      // 添加更新时间
      const data = {
        ...categoryData,
        updated_at: Date.now()
      }
      
      await db.update('categories', categoryId, data)
      
      return {
        success: true,
        data: { _id: categoryId, ...data },
        message: '更新成功'
      }
    } catch (error) {
      console.error('[CategoryService] updateCategory error:', error)
      return {
        success: false,
        message: error.message || '更新类别失败'
      }
    }
  }
  
  /**
   * 删除类别
   * @param {String} categoryId - 类别ID
   * @returns {Promise}
   */
  async deleteCategory(categoryId) {
    try {
      await db.remove('categories', categoryId)
      
      return {
        success: true,
        message: '删除成功'
      }
    } catch (error) {
      console.error('[CategoryService] deleteCategory error:', error)
      return {
        success: false,
        message: error.message || '删除类别失败'
      }
    }
  }
}

// 导出单例
export default new CategoryService()
