/**
 * 仓库服务层
 * 封装所有仓库相关的业务逻辑和API调用
 */

import { warehouseService } from '../api/unicloud.js'

/**
 * 仓库服务类
 */
class WarehouseService {
  /**
   * 入库
   * @param {Object} params - 入库参数
   * @param {String} params.material_id - 物料ID
   * @param {Number} params.quantity - 数量
   * @param {String} params.warehouse_type - 仓库类型
   * @param {String} params.department - 部门（可选）
   * @param {String} params.batch_no - 批次号（可选）
   * @param {String} params.remark - 备注（可选）
   * @returns {Promise}
   */
  async inbound(params) {
    try {
      const result = await warehouseService.inbound(params)
      return {
        success: true,
        data: result.data || null,
        message: '入库成功'
      }
    } catch (error) {
      console.error('[WarehouseService] inbound error:', error)
      return {
        success: false,
        message: error.message || '入库失败'
      }
    }
  }
  
  /**
   * 出库
   * @param {Object} params - 出库参数
   * @param {String} params.material_id - 物料ID
   * @param {Number} params.quantity - 数量（可以为负数）
   * @param {String} params.warehouse_type - 仓库类型
   * @param {String} params.department - 部门
   * @param {String} params.batch_no - 批次号（可选）
   * @param {String} params.remark - 备注（可选）
   * @returns {Promise}
   */
  async outbound(params) {
    try {
      const result = await warehouseService.outbound(params)
      return {
        success: true,
        data: result.data || null,
        message: '出库成功'
      }
    } catch (error) {
      console.error('[WarehouseService] outbound error:', error)
      return {
        success: false,
        message: error.message || '出库失败'
      }
    }
  }
  
  /**
   * 批量出库
   * @param {Array} items - 出库项列表
   * @returns {Promise}
   */
  async batchOutbound(items) {
    try {
      const result = await warehouseService.batchOutbound({ items })
      return {
        success: true,
        data: result.data || null,
        message: '批量出库成功'
      }
    } catch (error) {
      console.error('[WarehouseService] batchOutbound error:', error)
      return {
        success: false,
        message: error.message || '批量出库失败'
      }
    }
  }
  
  /**
   * 获取出入库记录
   * @param {Object} params - 查询参数
   * @param {String} params.material_id - 物料ID（可选）
   * @param {String} params.warehouse_type - 仓库类型（可选）
   * @param {String} params.department - 部门（可选）
   * @param {String} params.start_time - 开始时间（可选）
   * @param {String} params.end_time - 结束时间（可选）
   * @param {Number} params.page - 页码
   * @param {Number} params.pageSize - 每页数量
   * @returns {Promise}
   */
  async getRecords(params) {
    try {
      const result = await warehouseService.getRecords(params)
      return {
        success: true,
        data: result.data || [],
        total: result.total || 0
      }
    } catch (error) {
      console.error('[WarehouseService] getRecords error:', error)
      return {
        success: false,
        message: error.message || '获取记录失败',
        data: [],
        total: 0
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
      console.error('[WarehouseService] getWorkshopStockReference error:', error)
      return {
        success: false,
        message: error.message || '获取结存参考失败',
        data: null
      }
    }
  }
  
  /**
   * 计算车间仓结存
   * @param {String} department - 部门
   * @returns {Promise}
   */
  async calculateWorkshopBalance(department) {
    try {
      const result = await warehouseService.calculateWorkshopBalance({ department })
      return {
        success: true,
        data: result.data || []
      }
    } catch (error) {
      console.error('[WarehouseService] calculateWorkshopBalance error:', error)
      return {
        success: false,
        message: error.message || '计算结存失败',
        data: []
      }
    }
  }
  
  /**
   * 获取部门物料结存列表
   * @param {String} department - 部门
   * @returns {Promise}
   */
  async getDepartmentMaterialBalance(department) {
    try {
      const result = await warehouseService.getDepartmentMaterialBalance({ department })
      return {
        success: true,
        data: result.data || []
      }
    } catch (error) {
      console.error('[WarehouseService] getDepartmentMaterialBalance error:', error)
      return {
        success: false,
        message: error.message || '获取部门结存失败',
        data: []
      }
    }
  }
  
  /**
   * 确认入库
   * @param {String} id - 入库单ID
   * @returns {Promise}
   */
  async confirmInbound(id) {
    try {
      const result = await warehouseService.confirmInbound(id)
      return {
        success: true,
        data: result,
        message: '入库确认成功'
      }
    } catch (error) {
      console.error('[WarehouseService] confirmInbound error:', error)
      return {
        success: false,
        message: error.message || '入库确认失败'
      }
    }
  }
  
  /**
   * 确认出库
   * @param {String} id - 出库单ID
   * @returns {Promise}
   */
  async confirmOutbound(id) {
    try {
      const result = await warehouseService.confirmOutbound(id)
      return {
        success: true,
        data: result,
        message: '出库确认成功'
      }
    } catch (error) {
      console.error('[WarehouseService] confirmOutbound error:', error)
      return {
        success: false,
        message: error.message || '出库确认失败'
      }
    }
  }
  
  /**
   * 获取仓库统计
   * @param {String} warehouse_type - 仓库类型
   * @returns {Promise}
   */
  async getWarehouseStats(warehouse_type) {
    try {
      const result = await warehouseService.getWarehouseStats(warehouse_type)
      return {
        success: true,
        data: result
      }
    } catch (error) {
      console.error('[WarehouseService] getWarehouseStats error:', error)
      return {
        success: false,
        message: error.message || '获取仓库统计失败',
        data: null
      }
    }
  }
  
  /**
   * 计算车间仓数量
   * @param {String} material_id - 物料ID
   * @returns {Promise}
   */
  async calculateWorkshopStock(material_id) {
    try {
      const result = await warehouseService.calculateWorkshopStock({ material_id })
      return {
        success: true,
        data: result
      }
    } catch (error) {
      console.error('[WarehouseService] calculateWorkshopStock error:', error)
      return {
        success: false,
        message: error.message || '计算车间仓数量失败',
        data: null
      }
    }
  }
}

// 导出单例
export default new WarehouseService()
