/**
 * Excel服务层
 * 封装所有Excel导入导出相关的业务逻辑和API调用
 */

import { excelService } from '../api/unicloud.js'

/**
 * Excel服务类
 */
class ExcelService {
  /**
   * 导入物料
   * @param {String} fileUrl - 文件URL
   * @param {String} warehouseType - 仓库类型
   * @returns {Promise}
   */
  async importMaterials(fileUrl, warehouseType) {
    try {
      const result = await excelService.importMaterials({
        file_url: fileUrl,
        warehouse_type: warehouseType
      })
      return {
        success: true,
        data: result.data || null,
        message: `成功导入${result.data?.success_count || 0}条，失败${result.data?.fail_count || 0}条`
      }
    } catch (error) {
      console.error('[ExcelService] importMaterials error:', error)
      return {
        success: false,
        message: error.message || '导入失败'
      }
    }
  }
  
  /**
   * 导出物料
   * @param {Object} params - 导出参数
   * @param {String} params.warehouse_type - 仓库类型
   * @param {String} params.category_id - 类别ID（可选）
   * @returns {Promise}
   */
  async exportMaterials(params) {
    try {
      const result = await excelService.exportMaterials(params)
      return {
        success: true,
        data: result.data || null,
        message: '导出成功'
      }
    } catch (error) {
      console.error('[ExcelService] exportMaterials error:', error)
      return {
        success: false,
        message: error.message || '导出失败'
      }
    }
  }
  
  /**
   * 导入BOM
   * @param {String} fileUrl - 文件URL
   * @returns {Promise}
   */
  async importBom(fileUrl) {
    try {
      const result = await excelService.importBom({ file_url: fileUrl })
      return {
        success: true,
        data: result.data || null,
        message: '导入成功'
      }
    } catch (error) {
      console.error('[ExcelService] importBom error:', error)
      return {
        success: false,
        message: error.message || '导入BOM失败'
      }
    }
  }
  
  /**
   * 导出BOM
   * @param {String} bomId - BOM ID（可选，不传则导出所有）
   * @returns {Promise}
   */
  async exportBom(bomId) {
    try {
      const params = bomId ? { bom_id: bomId } : {}
      const result = await excelService.exportBom(params)
      return {
        success: true,
        data: result.data || null,
        message: '导出成功'
      }
    } catch (error) {
      console.error('[ExcelService] exportBom error:', error)
      return {
        success: false,
        message: error.message || '导出BOM失败'
      }
    }
  }
  
  /**
   * 下载模板
   * @param {String} type - 模板类型：material(物料), bom(BOM)
   * @returns {Promise}
   */
  async downloadTemplate(type) {
    try {
      const result = await excelService.downloadTemplate({ type })
      return {
        success: true,
        data: result.data || null,
        message: '下载成功'
      }
    } catch (error) {
      console.error('[ExcelService] downloadTemplate error:', error)
      return {
        success: false,
        message: error.message || '下载模板失败'
      }
    }
  }
  
  /**
   * 上传文件到云存储
   * @param {String} filePath - 本地文件路径
   * @returns {Promise}
   */
  async uploadFile(filePath) {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: '', // uniCloud会自动处理
        filePath: filePath,
        name: 'file',
        success: (res) => {
          if (res.statusCode === 200) {
            const data = JSON.parse(res.data)
            resolve({
              success: true,
              data: data
            })
          } else {
            reject(new Error('上传失败'))
          }
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  }
  
  /**
   * 选择并上传Excel文件
   * @returns {Promise}
   */
  async chooseAndUploadExcel() {
    return new Promise((resolve, reject) => {
      // #ifdef H5
      // H5环境使用input file
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.xlsx,.xls'
      input.onchange = async (e) => {
        const file = e.target.files[0]
        if (!file) {
          reject(new Error('未选择文件'))
          return
        }
        
        try {
          // 上传到云存储
          const uploadResult = await this.uploadFile(file)
          resolve(uploadResult)
        } catch (error) {
          reject(error)
        }
      }
      input.click()
      // #endif
      
      // #ifndef H5
      // App/小程序环境
      uni.chooseFile({
        count: 1,
        extension: ['.xlsx', '.xls'],
        success: async (res) => {
          try {
            const uploadResult = await this.uploadFile(res.tempFilePaths[0])
            resolve(uploadResult)
          } catch (error) {
            reject(error)
          }
        },
        fail: (error) => {
          reject(error)
        }
      })
      // #endif
    })
  }
  
  /**
   * 下载文件
   * @param {String} url - 文件URL
   * @param {String} filename - 文件名
   * @returns {Promise}
   */
  async downloadFile(url, filename) {
    return new Promise((resolve, reject) => {
      // #ifdef H5
      // H5环境直接下载
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      resolve({ success: true })
      // #endif
      
      // #ifndef H5
      // App/小程序环境
      uni.downloadFile({
        url: url,
        success: (res) => {
          if (res.statusCode === 200) {
            uni.saveFile({
              tempFilePath: res.tempFilePath,
              success: (saveRes) => {
                resolve({
                  success: true,
                  savedFilePath: saveRes.savedFilePath
                })
              },
              fail: (error) => {
                reject(error)
              }
            })
          } else {
            reject(new Error('下载失败'))
          }
        },
        fail: (error) => {
          reject(error)
        }
      })
      // #endif
    })
  }
}

// 导出单例
export default new ExcelService()
