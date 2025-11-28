/**
 * 物料服务层
 * 封装所有物料相关的业务逻辑和API调用
 */

import { materialService, warehouseService, bomService } from '../api/unicloud.js'

/**
 * 物料服务类
 */
class MaterialService {
  /**
   * 获取物料列表
   * @param {Object} params - 查询参数
   * @param {String} params.warehouse_type - 仓库类型：main(主材仓), workshop(车间仓), pack(PACK仓), auxiliary(辅料仓), pending(待处理)
   * @param {String} params.category_id - 类别ID（可选）
   * @param {String} params.department - 部门（车间仓必填）
   * @param {Number} params.page - 页码
   * @param {Number} params.pageSize - 每页数量
   * @returns {Promise}
   */
  async getMaterialList(params) {
    try {
      const result = await materialService.list(params)
      return {
        success: true,
        data: result.data || [],
        total: result.total || 0
      }
    } catch (error) {
      console.error('[MaterialService] getMaterialList error:', error)
      return {
        success: false,
        message: error.message || '获取物料列表失败',
        data: [],
        total: 0
      }
    }
  }
  
  /**
   * 获取物料详情
   * @param {String} materialId - 物料ID
   * @returns {Promise}
   */
  async getMaterialDetail(materialId) {
    try {
      const result = await materialService.detail({ material_id: materialId })
      return {
        success: true,
        data: result.data || null
      }
    } catch (error) {
      console.error('[MaterialService] getMaterialDetail error:', error)
      return {
        success: false,
        message: error.message || '获取物料详情失败',
        data: null
      }
    }
  }
  
  /**
   * 创建物料
   * @param {Object} materialData - 物料数据
   * @returns {Promise}
   */
  async createMaterial(materialData) {
    try {
      const result = await materialService.create(materialData)
      return {
        success: true,
        data: result.data || null,
        message: '创建成功'
      }
    } catch (error) {
      console.error('[MaterialService] createMaterial error:', error)
      return {
        success: false,
        message: error.message || '创建物料失败'
      }
    }
  }
  
  /**
   * 更新物料
   * @param {String} materialId - 物料ID
   * @param {Object} materialData - 物料数据
   * @returns {Promise}
   */
  async updateMaterial(materialId, materialData) {
    try {
      const result = await materialService.update({
        material_id: materialId,
        ...materialData
      })
      return {
        success: true,
        data: result.data || null,
        message: '更新成功'
      }
    } catch (error) {
      console.error('[MaterialService] updateMaterial error:', error)
      return {
        success: false,
        message: error.message || '更新物料失败'
      }
    }
  }
  
  /**
   * 删除物料
   * @param {String} materialId - 物料ID
   * @returns {Promise}
   */
  async deleteMaterial(materialId) {
    try {
      const result = await materialService.delete({ material_id: materialId })
      return {
        success: true,
        message: '删除成功'
      }
    } catch (error) {
      console.error('[MaterialService] deleteMaterial error:', error)
      return {
        success: false,
        message: error.message || '删除物料失败'
      }
    }
  }
  
  /**
   * 搜索物料
   * @param {Object} params - 搜索参数
   * @param {String} params.keyword - 关键词
   * @param {String} params.warehouse_type - 仓库类型
   * @returns {Promise}
   */
  async searchMaterials(params) {
    try {
      const result = await materialService.search(params)
      return {
        success: true,
        data: result.data || []
      }
    } catch (error) {
      console.error('[MaterialService] searchMaterials error:', error)
      return {
        success: false,
        message: error.message || '搜索失败',
        data: []
      }
    }
  }
  
  /**
   * 获取车间仓结存列表
   * @param {String} department - 部门
   * @returns {Promise}
   */
  async getWorkshopBalance(department) {
    try {
      const result = await warehouseService.getDepartmentMaterialBalance({ department })
      return {
        success: true,
        data: result.data || []
      }
    } catch (error) {
      console.error('[MaterialService] getWorkshopBalance error:', error)
      return {
        success: false,
        message: error.message || '获取车间结存失败',
        data: []
      }
    }
  }
  
  /**
   * 获取车间结存参考值
   * @param {String} materialId - 物料ID
   * @param {String} department - 部门
   * @returns {Promise}
   */
  async getWorkshopStockReference(materialId, department) {
    try {
      const result = await warehouseService.getWorkshopStockReference({
        material_id: materialId,
        department
      })
      return {
        success: true,
        data: result.data || null
      }
    } catch (error) {
      console.error('[MaterialService] getWorkshopStockReference error:', error)
      return {
        success: false,
        message: error.message || '获取结存参考失败',
        data: null
      }
    }
  }
}

// 导出单例
export default new MaterialService()
