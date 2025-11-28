<template>
  <view class="excel-manager">
    <!-- 安全区 -->
    <view class="safe-area" :style="{ height: safeAreaHeight + 'px' }"></view>
    
    <!-- 顶部标题 -->
    <view class="page-header">
      <view class="title">Excel管理</view>
      <view class="subtitle">导入导出物料和BOM数据</view>
    </view>
    
    <!-- Tab切换 -->
    <view class="tab-bar">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index"
        class="tab-item"
        :class="{ 'active': currentTab === index }"
        @click="switchTab(index)"
      >
        {{ tab.name }}
      </view>
    </view>
    
    <!-- 主内容区 -->
    <scroll-view scroll-y class="main-content">
      <!-- 物料导入导出 -->
      <view v-if="currentTab === 0" class="tab-content">
        <!-- 仓库类型选择 -->
        <view class="section">
          <view class="section-title">选择仓库</view>
          <view class="warehouse-selector">
            <view 
              v-for="warehouse in warehouses" 
              :key="warehouse.value"
              class="warehouse-item"
              :class="{ 'selected': selectedWarehouse === warehouse.value }"
              @click="selectWarehouse(warehouse.value)"
            >
              {{ warehouse.name }}
            </view>
          </view>
        </view>
        
        <!-- 导入操作 -->
        <view class="section">
          <view class="section-title">导入物料</view>
          <view class="action-card">
            <view class="card-icon">📥</view>
            <view class="card-content">
              <view class="card-title">从Excel导入物料数据</view>
              <view class="card-desc">支持批量导入物料信息到{{ getCurrentWarehouseName() }}</view>
            </view>
            <view class="card-actions">
              <view class="action-btn secondary" @click="downloadMaterialTemplate">
                下载模板
              </view>
              <view class="action-btn primary" @click="importMaterials">
                选择文件
              </view>
            </view>
          </view>
        </view>
        
        <!-- 导出操作 -->
        <view class="section">
          <view class="section-title">导出物料</view>
          <view class="action-card">
            <view class="card-icon">📤</view>
            <view class="card-content">
              <view class="card-title">导出物料数据到Excel</view>
              <view class="card-desc">导出{{ getCurrentWarehouseName() }}的所有物料数据</view>
            </view>
            <view class="card-actions">
              <view class="action-btn primary" @click="exportMaterials">
                导出数据
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- BOM导入导出 -->
      <view v-if="currentTab === 1" class="tab-content">
        <!-- 导入操作 -->
        <view class="section">
          <view class="section-title">导入BOM</view>
          <view class="action-card">
            <view class="card-icon">📥</view>
            <view class="card-content">
              <view class="card-title">从Excel导入BOM数据</view>
              <view class="card-desc">支持批量导入BOM表头和明细</view>
            </view>
            <view class="card-actions">
              <view class="action-btn secondary" @click="downloadBomTemplate">
                下载模板
              </view>
              <view class="action-btn primary" @click="importBom">
                选择文件
              </view>
            </view>
          </view>
        </view>
        
        <!-- 导出操作 -->
        <view class="section">
          <view class="section-title">导出BOM</view>
          <view class="action-card">
            <view class="card-icon">📤</view>
            <view class="card-content">
              <view class="card-title">导出BOM数据到Excel</view>
              <view class="card-desc">导出所有BOM表头和明细数据</view>
            </view>
            <view class="card-actions">
              <view class="action-btn primary" @click="exportBom">
                导出数据
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 数据初始化 -->
      <view v-if="currentTab === 2" class="tab-content">
        <!-- 初始化示例数据 -->
        <view class="section">
          <view class="section-title">初始化示例数据</view>
          <view class="action-card warning">
            <view class="card-icon">⚠️</view>
            <view class="card-content">
              <view class="card-title">初始化系统数据</view>
              <view class="card-desc">
                将创建以下数据：<br/>
                • 8个部门（配料、制片、卷绕、封装、注液、化成、包装、技术部）<br/>
                • 示例物料（三元 A01-01-0001, 800kg, 批次20251128）
              </view>
            </view>
            <view class="card-actions">
              <view 
                class="action-btn primary" 
                :class="{ 'disabled': isInitializing }"
                @click="initializeData"
              >
                {{ isInitializing ? '初始化中...' : '开始初始化' }}
              </view>
            </view>
          </view>
        </view>
        
        <!-- 清空数据 -->
        <view class="section">
          <view class="section-title">清空数据</view>
          <view class="action-card danger">
            <view class="card-icon">🗑️</view>
            <view class="card-content">
              <view class="card-title">清空所有数据</view>
              <view class="card-desc">⚠️ 危险操作！将删除所有物料、BOM、出入库记录等数据</view>
            </view>
            <view class="card-actions">
              <view class="action-btn danger" @click="confirmClearData">
                清空数据
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 进度弹窗 -->
    <uni-popup ref="progressPopup" type="center">
      <view class="progress-popup">
        <view class="progress-title">{{ progressTitle }}</view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progress + '%' }"></view>
        </view>
        <view class="progress-text">{{ progressText }}</view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import excelService from '@/common/services/excelService.js'

export default {
  data() {
    return {
      // 安全区高度
      safeAreaHeight: 30,
      
      // Tab
      tabs: [
        { name: '物料', value: 'material' },
        { name: 'BOM', value: 'bom' },
        { name: '数据初始化', value: 'init' }
      ],
      currentTab: 0,
      
      // 仓库类型
      warehouses: [
        { name: '主材仓', value: 'main' },
        { name: '辅料仓', value: 'auxiliary' },
        { name: 'PACK', value: 'pack' },
        { name: '待处理', value: 'pending' }
      ],
      selectedWarehouse: 'main',
      
      // 进度
      progressTitle: '',
      progressText: '',
      progress: 0,
      
      // 初始化状态
      isInitializing: false
    }
  },
  
  onLoad() {
    this.initSafeArea()
  },
  
  methods: {
    // 初始化安全区
    initSafeArea() {
      const systemInfo = uni.getSystemInfoSync()
      this.safeAreaHeight = systemInfo.statusBarHeight || 30
    },
    
    // 切换Tab
    switchTab(index) {
      this.currentTab = index
    },
    
    // 选择仓库
    selectWarehouse(value) {
      this.selectedWarehouse = value
    },
    
    // 获取当前仓库名称
    getCurrentWarehouseName() {
      const warehouse = this.warehouses.find(w => w.value === this.selectedWarehouse)
      return warehouse ? warehouse.name : ''
    },
    
    // 下载物料模板
    async downloadMaterialTemplate() {
      uni.showLoading({ title: '下载中...' })
      
      const result = await excelService.downloadTemplate('material')
      
      uni.hideLoading()
      
      if (result.success) {
        // 下载文件
        await excelService.downloadFile(result.data.url, '物料导入模板.xlsx')
        uni.showToast({
          title: '下载成功',
          icon: 'success'
        })
      } else {
        uni.showToast({
          title: result.message,
          icon: 'none'
        })
      }
    },
    
    // 导入物料
    async importMaterials() {
      try {
        uni.showLoading({ title: '选择文件...' })
        
        // 选择并上传文件
        const uploadResult = await excelService.chooseAndUploadExcel()
        
        uni.hideLoading()
        
        if (!uploadResult.success) {
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          })
          return
        }
        
        // 显示进度弹窗
        this.progressTitle = '导入物料'
        this.progressText = '正在解析Excel...'
        this.progress = 0
        this.$refs.progressPopup.open()
        
        // 导入物料
        const result = await excelService.importMaterials(
          uploadResult.data.url,
          this.selectedWarehouse
        )
        
        this.progress = 100
        this.progressText = result.message
        
        setTimeout(() => {
          this.$refs.progressPopup.close()
          
          if (result.success) {
            uni.showToast({
              title: result.message,
              icon: 'success'
            })
          } else {
            uni.showToast({
              title: result.message,
              icon: 'none'
            })
          }
        }, 1500)
      } catch (error) {
        uni.hideLoading()
        this.$refs.progressPopup.close()
        uni.showToast({
          title: error.message || '导入失败',
          icon: 'none'
        })
      }
    },
    
    // 导出物料
    async exportMaterials() {
      uni.showLoading({ title: '导出中...' })
      
      const result = await excelService.exportMaterials({
        warehouse_type: this.selectedWarehouse
      })
      
      uni.hideLoading()
      
      if (result.success) {
        // 下载文件
        const filename = `${this.getCurrentWarehouseName()}_物料数据_${this.formatDate()}.xlsx`
        await excelService.downloadFile(result.data.url, filename)
        uni.showToast({
          title: '导出成功',
          icon: 'success'
        })
      } else {
        uni.showToast({
          title: result.message,
          icon: 'none'
        })
      }
    },
    
    // 下载BOM模板
    async downloadBomTemplate() {
      uni.showLoading({ title: '下载中...' })
      
      const result = await excelService.downloadTemplate('bom')
      
      uni.hideLoading()
      
      if (result.success) {
        await excelService.downloadFile(result.data.url, 'BOM导入模板.xlsx')
        uni.showToast({
          title: '下载成功',
          icon: 'success'
        })
      } else {
        uni.showToast({
          title: result.message,
          icon: 'none'
        })
      }
    },
    
    // 导入BOM
    async importBom() {
      try {
        uni.showLoading({ title: '选择文件...' })
        
        const uploadResult = await excelService.chooseAndUploadExcel()
        
        uni.hideLoading()
        
        if (!uploadResult.success) {
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          })
          return
        }
        
        this.progressTitle = '导入BOM'
        this.progressText = '正在解析Excel...'
        this.progress = 0
        this.$refs.progressPopup.open()
        
        const result = await excelService.importBom(uploadResult.data.url)
        
        this.progress = 100
        this.progressText = result.message
        
        setTimeout(() => {
          this.$refs.progressPopup.close()
          
          if (result.success) {
            uni.showToast({
              title: result.message,
              icon: 'success'
            })
          } else {
            uni.showToast({
              title: result.message,
              icon: 'none'
            })
          }
        }, 1500)
      } catch (error) {
        uni.hideLoading()
        this.$refs.progressPopup.close()
        uni.showToast({
          title: error.message || '导入失败',
          icon: 'none'
        })
      }
    },
    
    // 导出BOM
    async exportBom() {
      uni.showLoading({ title: '导出中...' })
      
      const result = await excelService.exportBom()
      
      uni.hideLoading()
      
      if (result.success) {
        const filename = `BOM数据_${this.formatDate()}.xlsx`
        await excelService.downloadFile(result.data.url, filename)
        uni.showToast({
          title: '导出成功',
          icon: 'success'
        })
      } else {
        uni.showToast({
          title: result.message,
          icon: 'none'
        })
      }
    },
    
    // 初始化数据
    async initializeData() {
      if (this.isInitializing) return
      
      uni.showModal({
        title: '确认初始化',
        content: '将创建示例数据，是否继续？',
        success: async (res) => {
          if (res.confirm) {
            this.isInitializing = true
            
            try {
              // 调用init-data云函数
              const result = await uniCloud.callFunction({
                name: 'init-data',
                data: {}
              })
              
              this.isInitializing = false
              
              if (result.result.code === 0) {
                uni.showToast({
                  title: '初始化成功',
                  icon: 'success'
                })
              } else {
                uni.showToast({
                  title: result.result.message || '初始化失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              this.isInitializing = false
              uni.showToast({
                title: error.message || '初始化失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    // 确认清空数据
    confirmClearData() {
      uni.showModal({
        title: '危险操作',
        content: '确定要清空所有数据吗？此操作不可恢复！',
        confirmColor: '#ee0a24',
        success: (res) => {
          if (res.confirm) {
            this.clearData()
          }
        }
      })
    },
    
    // 清空数据
    async clearData() {
      uni.showLoading({ title: '清空中...' })
      
      try {
        // 这里需要调用清空数据的云函数
        // 暂时不实现，避免误操作
        
        uni.hideLoading()
        uni.showToast({
          title: '功能暂未开放',
          icon: 'none'
        })
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '清空失败',
          icon: 'none'
        })
      }
    },
    
    // 格式化日期
    formatDate() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return `${year}${month}${day}`
    }
  }
}
</script>

<style lang="scss" scoped>
.excel-manager {
  width: 100%;
  min-height: 100vh;
  background: #f5f5f5;
}

.safe-area {
  width: 100%;
  background: transparent;
}

.page-header {
  padding: 24rpx 30rpx;
  background: #fff;
  border-bottom: 1px solid #eee;
  
  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 8rpx;
  }
  
  .subtitle {
    font-size: 24rpx;
    color: #999;
  }
}

.tab-bar {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #eee;
  
  .tab-item {
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #666;
    position: relative;
    
    &.active {
      color: #007aff;
      font-weight: bold;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 4rpx;
        background: #007aff;
        border-radius: 2rpx;
      }
    }
  }
}

.main-content {
  height: calc(100vh - 200rpx);
  padding: 20rpx;
}

.tab-content {
  .section {
    margin-bottom: 30rpx;
    
    .section-title {
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 20rpx;
      padding-left: 12rpx;
      border-left: 4rpx solid #007aff;
    }
  }
}

.warehouse-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  
  .warehouse-item {
    flex: 0 0 calc(50% - 10rpx);
    padding: 24rpx;
    background: #fff;
    border-radius: 12rpx;
    text-align: center;
    font-size: 28rpx;
    color: #333;
    border: 2rpx solid #eee;
    
    &.selected {
      background: #f0f9ff;
      border-color: #007aff;
      color: #007aff;
      font-weight: bold;
    }
  }
}

.action-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  
  &.warning {
    border-left: 4rpx solid #ff976a;
  }
  
  &.danger {
    border-left: 4rpx solid #ee0a24;
  }
  
  .card-icon {
    font-size: 60rpx;
    text-align: center;
    margin-bottom: 20rpx;
  }
  
  .card-content {
    margin-bottom: 24rpx;
    
    .card-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 12rpx;
    }
    
    .card-desc {
      font-size: 24rpx;
      color: #666;
      line-height: 1.6;
    }
  }
  
  .card-actions {
    display: flex;
    gap: 20rpx;
    
    .action-btn {
      flex: 1;
      height: 72rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8rpx;
      font-size: 28rpx;
      font-weight: bold;
      
      &.primary {
        background: #007aff;
        color: #fff;
      }
      
      &.secondary {
        background: #f5f5f5;
        color: #666;
      }
      
      &.danger {
        background: #ee0a24;
        color: #fff;
      }
      
      &.disabled {
        opacity: 0.5;
      }
    }
  }
}

.progress-popup {
  width: 600rpx;
  padding: 40rpx;
  background: #fff;
  border-radius: 16rpx;
  
  .progress-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
    margin-bottom: 30rpx;
  }
  
  .progress-bar {
    width: 100%;
    height: 16rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
    overflow: hidden;
    margin-bottom: 20rpx;
    
    .progress-fill {
      height: 100%;
      background: #007aff;
      transition: width 0.3s;
    }
  }
  
  .progress-text {
    font-size: 24rpx;
    color: #666;
    text-align: center;
  }
}
</style>
