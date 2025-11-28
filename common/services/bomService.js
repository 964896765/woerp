/**
 * BOM服务层
 * 封装所有BOM相关的业务逻辑和API调用
 */

import { bomService } from '../api/unicloud.js'

/**
 * BOM服务类
 */
class BomService {
  /**
   * 获取BOM列表
   * @param {Object} params - 查询参数
   * @param {Number} params.page - 页码
   * @param {Number} params.pageSize - 每页数量
   * @returns {Promise}
   */
  async getBomList(params = {}) {
    try {
      const result = await bomService.list(params)
      return {
        success: true,
        data: result.data || [],
        total: result.total || 0
      }
    } catch (error) {
      console.error('[BomService] getBomList error:', error)
      return {
        success: false,
        message: error.message || '获取BOM列表失败',
        data: [],
        total: 0
      }
    }
  }
  
  /**
   * 获取BOM详情（含明细）
   * @param {String} bomId - BOM ID
   * @returns {Promise}
   */
  async getBomDetail(bomId) {
    try {
      const result = await bomService.detail({ bom_id: bomId })
      return {
        success: true,
        data: result.data || null
      }
    } catch (error) {
      console.error('[BomService] getBomDetail error:', error)
      return {
        success: false,
        message: error.message || '获取BOM详情失败',
        data: null
      }
    }
  }
  
  /**
   * 创建BOM
   * @param {Object} bomData - BOM数据
   * @param {Array} bomData.items - BOM明细
   * @returns {Promise}
   */
  async createBom(bomData) {
    try {
      const result = await bomService.create(bomData)
      return {
        success: true,
        data: result.data || null,
        message: '创建成功'
      }
    } catch (error) {
      console.error('[BomService] createBom error:', error)
      return {
        success: false,
        message: error.message || '创建BOM失败'
      }
    }
  }
  
  /**
   * 更新BOM
   * @param {String} bomId - BOM ID
   * @param {Object} bomData - BOM数据
   * @returns {Promise}
   */
  async updateBom(bomId, bomData) {
    try {
      const result = await bomService.update({
        bom_id: bomId,
        ...bomData
      })
      return {
        success: true,
        data: result.data || null,
        message: '更新成功'
      }
    } catch (error) {
      console.error('[BomService] updateBom error:', error)
      return {
        success: false,
        message: error.message || '更新BOM失败'
      }
    }
  }
  
  /**
   * 删除BOM
   * @param {String} bomId - BOM ID
   * @returns {Promise}
   */
  async deleteBom(bomId) {
    try {
      const result = await bomService.delete({ bom_id: bomId })
      return {
        success: true,
        message: '删除成功'
      }
    } catch (error) {
      console.error('[BomService] deleteBom error:', error)
      return {
        success: false,
        message: error.message || '删除BOM失败'
      }
    }
  }
  
  /**
   * 按BOM发料（支持差异）
   * @param {Object} params - 发料参数
   * @param {String} params.bom_id - BOM ID
   * @param {String} params.department - 部门
   * @param {Number} params.production_quantity - 生产数量
   * @param {Array} params.items - 物料明细（含实发数量）
   * @returns {Promise}
   */
  async issueMaterials(params) {
    try {
      const result = await bomService.issueMaterialsWithVariance(params)
      return {
        success: true,
        data: result.data || null,
        message: '发料成功'
      }
    } catch (error) {
      console.error('[BomService] issueMaterials error:', error)
      return {
        success: false,
        message: error.message || '发料失败'
      }
    }
  }
  
  /**
   * 获取BOM计划用量
   * @param {String} bomId - BOM ID
   * @param {Number} productionQuantity - 生产数量
   * @returns {Promise}
   */
  async getBomPlannedQuantity(bomId, productionQuantity) {
    try {
      const result = await bomService.getBomPlannedQuantity({
        bom_id: bomId,
        production_quantity: productionQuantity
      })
      return {
        success: true,
        data: result.data || []
      }
    } catch (error) {
      console.error('[BomService] getBomPlannedQuantity error:', error)
      return {
        success: false,
        message: error.message || '获取计划用量失败',
        data: []
      }
    }
  }
  
  /**
   * 更新实发数量
   * @param {String} bomItemId - BOM明细ID
   * @param {Number} issuedQuantity - 实发数量
   * @returns {Promise}
   */
  async updateIssuedQuantity(bomItemId, issuedQuantity) {
    try {
      const result = await bomService.updateIssuedQuantity({
        bom_item_id: bomItemId,
        issued_quantity: issuedQuantity
      })
      return {
        success: true,
        data: result.data || null,
        message: '更新成功'
      }
    } catch (error) {
      console.error('[BomService] updateIssuedQuantity error:', error)
      return {
        success: false,
        message: error.message || '更新实发数量失败'
      }
    }
  }
}

// 导出单例
export default new BomService()
