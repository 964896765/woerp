/**
 * 类别服务层
 * 封装所有类别相关的业务逻辑和API调用
 */

import { materialService } from '../api/unicloud.js'

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
      const result = await materialService.getCategories(params)
      return {
        success: true,
        data: result.data || []
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
      const result = await materialService.createCategory(categoryData)
      return {
        success: true,
        data: result.data || null,
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
      const result = await materialService.updateCategory({
        category_id: categoryId,
        ...categoryData
      })
      return {
        success: true,
        data: result.data || null,
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
      const result = await materialService.deleteCategory({ category_id: categoryId })
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
