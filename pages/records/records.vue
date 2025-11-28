<template>
  <view class="records-page">
    <!-- 顶部标题栏 -->
    <page-header title="出入库记录" :showBack="true"></page-header>

    <!-- 筛选条件 -->
    <view class="filter-section">
      <!-- 日期选择 -->
      <view class="filter-row">
        <text class="filter-label">日期范围</text>
        <view class="date-range">
          <view class="date-item" @click="showStartDatePicker">
            <text class="date-text">{{ startDate || '开始日期' }}</text>
            <text class="icon">📅</text>
          </view>
          <text class="date-separator">至</text>
          <view class="date-item" @click="showEndDatePicker">
            <text class="date-text">{{ endDate || '结束日期' }}</text>
            <text class="icon">📅</text>
          </view>
        </view>
      </view>

      <!-- 部门选择 -->
      <view class="filter-row">
        <text class="filter-label">部门</text>
        <view class="selector" @click="showDeptPicker">
          <text class="selector-text">{{ deptDisplayText }}</text>
          <text class="icon">▼</text>
        </view>
      </view>

      <!-- 批次选择 -->
      <view class="filter-row">
        <text class="filter-label">批次</text>
        <view class="selector" @click="showBatchPicker">
          <text class="selector-text">{{ selectedBatch || '全部批次' }}</text>
          <text class="icon">▼</text>
        </view>
      </view>

      <!-- 出入库类别 -->
      <view class="filter-row">
        <text class="filter-label">类别</text>
        <view class="selector" @click="showTypePicker">
          <text class="selector-text">{{ categoryDisplayText }}</text>
          <text class="icon">▼</text>
        </view>
      </view>

      <!-- 出库类别选择器 -->
      <view class="filter-row">
        <OutboundTypePicker v-model="outboundType" />
      </view>

      <!-- 操作按钮 -->
      <view class="filter-actions">
        <view class="action-btn reset-btn" @click="resetFilters">重置</view>
        <view class="action-btn search-btn" @click="searchRecords">查询</view>
      </view>
    </view>

    <!-- 统计信息 -->
    <view v-if="filteredRecords.length > 0" class="stats-section">
      <view class="stats-header">
        <text class="stats-title">统计信息</text>
        <view class="stats-actions">
          <view class="stats-btn" @click="showStatsDetail = !showStatsDetail">
            <text>{{ showStatsDetail ? '收起' : '展开' }}</text>
            <text class="icon">{{ showStatsDetail ? '▲' : '▼' }}</text>
          </view>
          <view class="export-btn" @click="exportRecords">导出</view>
        </view>
      </view>

      <view v-if="showStatsDetail" class="stats-content">
        <view class="stats-row">
          <text class="stats-label">总记录数：</text>
          <text class="stats-value">{{ filteredRecords.length }}</text>
        </view>
        <view class="stats-row">
          <text class="stats-label">入库总量：</text>
          <text class="stats-value inbound">{{ formatStatValue(getInboundTotal()) }}</text>
        </view>
        <view class="stats-row">
          <text class="stats-label">出库总量：</text>
          <text class="stats-value outbound">{{ formatStatValue(getOutboundTotal()) }}</text>
        </view>
        <view class="stats-row">
          <text class="stats-label">净入库：</text>
          <text class="stats-value" :class="[netTotal >= 0 ? 'inbound' : 'outbound']">
            {{ formatStatValue(getNetTotal()) }}
          </text>
        </view>
      </view>
    </view>

    <!-- 记录列表 -->
    <scroll-view class="records-list" scroll-y>
      <view v-if="filteredRecords.length === 0" class="empty-state">
        <text class="empty-icon">📄</text>
        <text class="empty-text">暂无记录</text>
      </view>
      
      <view v-for="record in filteredRecords" :key="record.id" class="record-item">
        <view class="record-header">
          <view class="record-info">
            <text class="record-code">{{ record.code }}</text>
            <text class="record-name">{{ record.name }}</text>
          </view>
          <view class="record-type" :class="record.type">
            {{ record.type === 'inbound' ? '入库' : '出库' }}
          </view>
        </view>
        
        <view class="record-details">
          <view class="detail-row">
            <text class="detail-label">数量：</text>
            <text class="detail-value">{{ record.quantity }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">部门：</text>
            <text class="detail-value">{{ record.department }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">类别：</text>
            <text class="detail-value">{{ record.ioTypeLabel }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">时间：</text>
            <text class="detail-value">{{ record.time }}</text>
          </view>
          <view class="detail-row" v-if="record.batch">
            <text class="detail-label">批次：</text>
            <text class="detail-value">{{ record.batch }}</text>
          </view>
          <view class="detail-row" v-if="record.meta && record.meta.outboundType">
            <text class="detail-label">出库类别：</text>
            <text class="detail-value">{{ getOutboundTypeLabel(record.meta.outboundType) }}</text>
          </view>
        </view>

        <!-- 签名预览 -->
        <view v-if="record.signImage" class="signature-preview" @click="previewSignature(record.signImage)">
          <view class="signature-icon-wrapper">
            <text class="signature-icon">✍️</text>
          </view>
          <view class="signature-text-wrapper">
            <text class="signature-label">查看签名</text>
            <text class="signature-tip">点击查看完整签名</text>
          </view>
          <view class="signature-arrow">
            <text class="arrow-icon">›</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 签名预览弹窗 -->
    <view v-if="showSignatureModal" class="signature-modal-mask" @click="closeSignatureModal">
      <view class="signature-modal" @click.stop>
        <view class="modal-header">
          <view class="modal-title-wrapper">
            <text class="modal-title">签名预览</text>
            <text class="modal-subtitle">Signature Preview</text>
          </view>
          <view class="close-btn-wrapper" @click="closeSignatureModal">
            <view class="close-btn">
              <text class="close-icon">✕</text>
            </view>
          </view>
        </view>
        <view class="signature-content">
          <view class="signature-frame">
            <image :src="currentSignature" mode="aspectFit" class="signature-image" />
          </view>
          <view class="signature-actions">
            <view class="action-btn secondary" @click="closeSignatureModal">
              <text class="btn-text">关闭</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import PageHeader from '@/components/page-header/page-header.vue'
import OutboundTypePicker from '@/components/outbound-type-picker/OutboundTypePicker.vue';
import { dateUtils, uiUtils } from '@/common/util.js'
import { getOutboundTypeLabel } from '@/store/constants.js'

export default {
  components: {
    PageHeader,
    OutboundTypePicker
  },
  data() {
    return {
      // 筛选条件
      startDate: '',
      endDate: '',
      startDateValue: '',
      endDateValue: '',
      selectedDept: '',
      selectedBatch: '',
      selectedType: '',
      selectedTypeLabel: '',
      outboundType: '', // 出库类别
      
      // 新的选择器数据
      selectedDepts: [],
      selectedCategories: [],
      deptDisplayText: '全部部门',
      categoryDisplayText: '全部类别',
      
      // 选择器数据
      deptColumns: [
        ['全部', '配料', '制片', '卷绕', '封装', '注液', '切边', '包装']
      ],
      batchColumns: [
        ['全部', 'BATCH001', 'BATCH002', 'BATCH003', 'BATCH004', 'BATCH005']
      ],
      typeColumns: [
        [
          { text: '全部', value: '' },
          { text: '采购入库', value: 'inbound_purchase' },
          { text: '采购退货', value: 'return_purchase' },
          { text: '产线退仓', value: 'line_return' },
          { text: '生产领料', value: 'prod_issue' },
          { text: '批次出库', value: 'batch_out' },
          { text: '超领出库', value: 'over_out' },
          { text: '补料出库', value: 'replenish_out' },
          { text: '制料领料', value: 'mix_issue' },
          { text: '辅料出库', value: 'aux_out' }
        ]
      ],
      
      // 记录数据
      allRecords: [],
      filteredRecords: [],
      
      // 签名预览
      showSignatureModal: false,
      currentSignature: '',

      // 统计功能
      showStatsDetail: false
    }
  },
  
  onLoad() {
    this.loadRecords()
    this.initDateRange()
  },
  
  onShow() {
    // 处理从日期选择器返回的数据
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    
    if (currentPage.data && currentPage.data.selectedDate) {
      const { type, date } = currentPage.data.selectedDate
      if (type === 'start') {
        this.startDate = date
      } else if (type === 'end') {
        this.endDate = date
      }
      // 清除临时数据
      delete currentPage.data.selectedDate
    }
    
    // 处理从部门选择器返回的数据
    if (currentPage.data && currentPage.data.selectedDepts) {
      this.selectedDepts = currentPage.data.selectedDepts
      this.updateDeptDisplay()
      // 清除临时数据
      delete currentPage.data.selectedDepts
    }
    
    // 处理从类别选择器返回的数据
    if (currentPage.data && currentPage.data.selectedCategories) {
      this.selectedCategories = currentPage.data.selectedCategories
      this.updateCategoryDisplay()
      // 清除临时数据
      delete currentPage.data.selectedCategories
    }
  },
  
  methods: {
    
    initDateRange() {
      const today = new Date()
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      this.endDate = dateUtils.formatDate(today)
      this.startDate = dateUtils.formatDate(lastWeek)
      this.endDateValue = today.getTime()
      this.startDateValue = lastWeek.getTime()
    },
    
    loadRecords() {
      // 从本地存储加载记录
      const recordsByDate = uni.getStorageSync('recordsByDate') || {}
      const records = []
      
      Object.keys(recordsByDate).forEach(date => {
        recordsByDate[date].forEach(record => {
          records.push({
            ...record,
            date,
            batch: record.batch || 'BATCH001', // 模拟批次数据
            ioTypeLabel: this.getTypeLabel(record.ioType)
          })
        })
      })
      
      this.allRecords = records.sort((a, b) => new Date(b.time) - new Date(a.time))
      this.filteredRecords = [...this.allRecords]
    },
    
    getTypeLabel(type) {
      const typeMap = {
        'inbound_purchase': '采购入库',
        'return_purchase': '采购退货',
        'line_return': '产线退仓',
        'prod_issue': '生产领料',
        'batch_out': '批次出库',
        'over_out': '超领出库',
        'replenish_out': '补料出库',
        'mix_issue': '制料领料',
        'aux_out': '辅料出库'
      }
      return typeMap[type] || type
    },
    
    // 日期选择器方法
    showStartDatePicker() {
      uni.navigateTo({
        url: `/pages/records/date-picker?type=start&current=${this.startDate}`
      })
    },

    showEndDatePicker() {
      uni.navigateTo({
        url: `/pages/records/date-picker?type=end&current=${this.endDate}`
      })
    },
    
    showDeptPicker() {
      const selectedParam = encodeURIComponent(JSON.stringify(this.selectedDepts))
      uni.navigateTo({
        url: `/components/dept-selector/dept-selector?selected=${selectedParam}`
      })
    },

    updateDeptDisplay() {
      if (this.selectedDepts.length === 0) {
        this.deptDisplayText = '全部部门'
        this.selectedDept = ''
      } else if (this.selectedDepts.length === 1) {
        this.deptDisplayText = this.selectedDepts[0].name
        this.selectedDept = this.selectedDepts[0].name
      } else {
        this.deptDisplayText = `已选${this.selectedDepts.length}个部门`
        this.selectedDept = this.selectedDepts.map(dept => dept.name).join(',')
      }
    },
    
    showBatchPicker() {
      uni.showActionSheet({
        itemList: ['全部', 'BATCH001', 'BATCH002', 'BATCH003', 'BATCH004', 'BATCH005'],
        success: (res) => {
          const selected = ['全部', 'BATCH001', 'BATCH002', 'BATCH003', 'BATCH004', 'BATCH005'][res.tapIndex]
          this.selectedBatch = selected === '全部' ? '' : selected
        }
      })
    },
    
    showTypePicker() {
      const selectedParam = encodeURIComponent(JSON.stringify(this.selectedCategories))
      uni.navigateTo({
        url: `/components/category-selector/category-selector?selected=${selectedParam}`
      })
    },

    updateCategoryDisplay() {
      if (this.selectedCategories.length === 0) {
        this.categoryDisplayText = '全部类别'
        this.selectedType = ''
        this.selectedTypeLabel = ''
      } else if (this.selectedCategories.length === 1) {
        this.categoryDisplayText = this.selectedCategories[0].name
        this.selectedType = this.selectedCategories[0].code
        this.selectedTypeLabel = this.selectedCategories[0].name
      } else {
        this.categoryDisplayText = `已选${this.selectedCategories.length}个类别`
        this.selectedType = this.selectedCategories.map(cat => cat.code).join(',')
        this.selectedTypeLabel = this.selectedCategories.map(cat => cat.name).join(',')
      }
    },
    
    // 筛选操作
    resetFilters() {
      this.selectedDept = ''
      this.selectedBatch = ''
      this.selectedType = ''
      this.selectedTypeLabel = ''
      this.outboundType = ''
      this.selectedDepts = []
      this.selectedCategories = []
      this.deptDisplayText = '全部部门'
      this.categoryDisplayText = '全部类别'
      this.initDateRange()
      this.filteredRecords = [...this.allRecords]
    },
    
    searchRecords() {
      let filtered = [...this.allRecords]
      
      // 日期筛选
      if (this.startDate && this.endDate) {
        filtered = filtered.filter(record => {
          const recordDate = new Date(record.time).toISOString().split('T')[0]
          return recordDate >= this.startDate && recordDate <= this.endDate
        })
      }
      
      // 部门筛选 - 支持多选
      if (this.selectedDepts.length > 0) {
        const deptNames = this.selectedDepts.map(dept => dept.name)
        filtered = filtered.filter(record => deptNames.includes(record.department))
      }
      
      // 批次筛选
      if (this.selectedBatch) {
        filtered = filtered.filter(record => record.batch === this.selectedBatch)
      }
      
      // 类别筛选 - 支持多选
      if (this.selectedCategories.length > 0) {
        const categoryCodes = this.selectedCategories.map(cat => cat.code)
        const categoryNames = this.selectedCategories.map(cat => cat.name)
        filtered = filtered.filter(record => 
          categoryCodes.includes(record.ioType) || 
          categoryNames.includes(record.ioTypeLabel)
        )
      }
      
      // 出库类别筛选
      if (this.outboundType) {
        filtered = filtered.filter(record => 
          record.meta && record.meta.outboundType === this.outboundType
        )
      }
      
      this.filteredRecords = filtered
      
      uiUtils.showToast(`找到 ${filtered.length} 条记录`)
    },
    
    // 签名预览
    previewSignature(signImage) {
      this.currentSignature = signImage
      this.showSignatureModal = true
    },
    
    closeSignatureModal() {
      this.showSignatureModal = false
      this.currentSignature = ''
    },

    // 统计功能方法
    getInboundTotal() {
      return this.filteredRecords
        .filter(record => record.type === 'inbound')
        .reduce((total, record) => total + parseFloat(record.quantity || 0), 0)
    },

    getOutboundTotal() {
      return this.filteredRecords
        .filter(record => record.type === 'outbound')
        .reduce((total, record) => total + parseFloat(record.quantity || 0), 0)
    },

    getNetTotal() {
      return this.getInboundTotal() - this.getOutboundTotal()
    },

    // 计算属性用于模板中的:class
    netTotal() {
      return this.getNetTotal()
    },

    formatStatValue(value) {
      const num = parseFloat(value)
      return isNaN(num) ? '0.00' : num.toFixed(2)
    },

    // 获取出库类别标签
    getOutboundTypeLabel(type) {
      return getOutboundTypeLabel(type)
    },

    // 导出功能
    exportRecords() {
      if (this.filteredRecords.length === 0) {
        uiUtils.showToast('没有可导出的记录')
        return
      }

      uni.showActionSheet({
        itemList: ['导出为CSV', '导出为Excel', '分享记录'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.exportToCSV()
              break
            case 1:
              this.exportToExcel()
              break
            case 2:
              this.shareRecords()
              break
          }
        }
      })
    },

    exportToCSV() {
      try {
        const headers = ['物料编码', '物料名称', '类型', '数量', '部门', '类别', '时间', '批次']
        const csvContent = [
          headers.join(','),
          ...this.filteredRecords.map(record => [
            record.code,
            record.name,
            record.type === 'inbound' ? '入库' : '出库',
            record.quantity,
            record.department,
            record.ioTypeLabel,
            record.time,
            record.batch || ''
          ].join(','))
        ].join('\n')

        // 在小程序中，可以使用下载或分享功能
        const fileName = `出入库记录_${this.formatDate(new Date())}.csv`

        uni.showModal({
          title: '导出CSV',
          content: `共导出 ${this.filteredRecords.length} 条记录，是否保存？`,
          success: (res) => {
            if (res.confirm) {
              // #ifdef H5
              this.downloadFile(csvContent, fileName, 'text/csv')
              // #endif

              // #ifdef MP-WEIXIN
              uiUtils.showToast('微信小程序不支持直接下载，请截图保存')
              // #endif

              // #ifdef APP-PLUS
              this.saveToFile(csvContent, fileName)
              // #endif
            }
          }
        })
      } catch (error) {
        uiUtils.showError('导出失败')
      }
    },

    exportToExcel() {
      uiUtils.showToast('Excel导出功能开发中')
    },

    shareRecords() {
      const summary = `出入库记录统计：
总记录数：${this.filteredRecords.length}
入库总量：${this.formatStatValue(this.getInboundTotal())}
出库总量：${this.formatStatValue(this.getOutboundTotal())}
净入库：${this.formatStatValue(this.getNetTotal())}
导出时间：${new Date().toLocaleString()}`

      uni.showModal({
        title: '分享记录',
        content: summary,
        showCancel: false,
        confirmText: '复制到剪贴板',
        success: () => {
          // 复制到剪贴板
          uni.setClipboardData({
            data: summary,
            success: () => {
              uiUtils.showSuccess('已复制到剪贴板')
            }
          })
        }
      })
    },

    // 文件下载（H5端）
    downloadFile(content, fileName, contentType) {
      const blob = new Blob([content], { type: contentType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    },

    // 保存文件（App端）
    saveToFile(content, fileName) {
      const fs = uni.getFileSystemManager()
      const filePath = `${uni.env.USER_DATA_PATH}/${fileName}`

      fs.writeFile({
        filePath: filePath,
        data: content,
        encoding: 'utf8',
        success: () => {
          uiUtils.showSuccess('文件已保存')
        },
        fail: (error) => {
          uiUtils.showError('保存失败')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.records-page {
  min-height: 100vh;
  background: #f5f6fa;
  /* 安全区域适配 */
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  /* 手动设置安全区域 */
  padding-top: 35px;
  padding-bottom: 15px;
  box-sizing: border-box;
}



.filter-section {
  background: #fff;
  margin: 20rpx;
  border-radius: 12rpx;
  padding: 24rpx;
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.filter-label {
  width: 120rpx;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.date-range {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.date-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 20rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  border: 1rpx solid #e5e6eb;
}

.date-text {
  font-size: 26rpx;
  color: #666;
}

.date-separator {
  font-size: 24rpx;
  color: #999;
}

.selector {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 20rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  border: 1rpx solid #e5e6eb;
}

.selector-text {
  font-size: 26rpx;
  color: #666;
}

.filter-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 32rpx;
}

.action-btn {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.reset-btn {
  background: #f5f5f5;
  border: 1rpx solid #d9d9d9;
}

.search-btn {
  background: #1890ff;
  color: #fff;
}

.records-list {
  flex: 1;
  padding: 0 20rpx 20rpx;
  max-height: calc(100vh - 400rpx);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  
  .empty-text {
    margin-top: 24rpx;
    font-size: 28rpx;
    color: #999;
  }
}

.record-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.record-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.record-info {
  flex: 1;
  
  .record-code {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-right: 12rpx;
  }
  
  .record-name {
    font-size: 26rpx;
    color: #666;
  }
}

.record-type {
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 500;
  
  &.inbound {
    background: #f6ffed;
    color: #52c41a;
    border: 1rpx solid #b7eb8f;
  }
  
  &.outbound {
    background: #fff2f0;
    color: #ff4d4f;
    border: 1rpx solid #ffb3b3;
  }
}

.record-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx 32rpx;
}

.detail-row {
  display: flex;
  align-items: center;
  min-width: 45%;
}

.detail-label {
  font-size: 24rpx;
  color: #999;
  margin-right: 8rpx;
}

.detail-value {
  font-size: 24rpx;
  color: #333;
}

.signature-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
  padding: 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.signature-preview::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  pointer-events: none;
}

.signature-preview:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.4);
}

.signature-icon-wrapper {
  width: 64rpx;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10rpx);
}

.signature-icon {
  font-size: 32rpx;
  color: #fff;
}

.signature-text-wrapper {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.signature-label {
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
}

.signature-tip {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.signature-arrow {
  width: 48rpx;
  height: 48rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-icon {
  font-size: 24rpx;
  color: #fff;
  font-weight: bold;
}

.signature-modal {
  width: 90%;
  max-width: 600rpx;
  max-height: 80%;
  background: #fff;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(50rpx);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.modal-title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
}

.modal-subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
}

.close-btn-wrapper {
  padding: 8rpx;
}

.close-btn {
  width: 56rpx;
  height: 56rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10rpx);
}

.close-btn:active {
  transform: scale(0.9);
  background: rgba(255, 255, 255, 0.3);
}

.close-icon {
  font-size: 28rpx;
  color: #fff;
  font-weight: bold;
}

.signature-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 32rpx;
  gap: 24rpx;
}

.signature-frame {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 24rpx;
  border: 2rpx dashed #e9ecef;
  min-height: 400rpx;
}

.signature-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.signature-actions {
  display: flex;
  justify-content: center;
  gap: 16rpx;
}

.action-btn {
  padding: 16rpx 32rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 120rpx;
  text-align: center;
}

.action-btn.secondary {
  background: #f8f9fa;
  color: #6c757d;
  border: 2rpx solid #e9ecef;
}

.action-btn.secondary:active {
  background: #e9ecef;
  transform: scale(0.98);
}

.btn-text {
  font-size: 28rpx;
  font-weight: 600;
}

.signature-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4rpx);
  animation: maskFadeIn 0.3s ease-out;
}

@keyframes maskFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.empty-icon {
  font-size: 96rpx;
  margin-bottom: 24rpx;
}

.icon {
  font-size: 24rpx;
  color: #999;
}

/* 统计信息样式 */
.stats-section {
  background: #fff;
  margin: 20rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: #f8f9fa;
  border-bottom: 1rpx solid #e5e6eb;
}

.stats-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.stats-actions {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.stats-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: #f0f9ff;
  border: 1rpx solid #91d5ff;
  border-radius: 6rpx;
  font-size: 24rpx;
  color: #1890ff;

  &:active {
    background: #e6f7ff;
    opacity: 0.8;
  }
}

.export-btn {
  padding: 8rpx 16rpx;
  background: #52c41a;
  border-radius: 6rpx;
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;

  &:active {
    opacity: 0.8;
  }
}

.stats-content {
  padding: 24rpx;
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f2f2f2;

  &:last-child {
    border-bottom: none;
  }
}

.stats-label {
  font-size: 26rpx;
  color: #666;
}

.stats-value {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;

  &.inbound {
    color: #52c41a;
  }

  &.outbound {
    color: #ff4d4f;
  }
}

/* 移动端响应式样式 */
@media screen and (max-width: 480px) {
  .filter-section {
    margin: 16rpx;
    padding: 20rpx;
  }
  
  .filter-label {
    width: 100rpx;
    font-size: 26rpx;
  }
  
  .date-item, .selector {
    padding: 16rpx;
    font-size: 26rpx;
  }
  
  .records-list {
    margin: 16rpx;
  }
  
  .record-item {
    padding: 20rpx;
  }
  
  .record-header {
    .material-code {
      font-size: 26rpx;
    }
    
    .record-type {
      font-size: 22rpx;
      padding: 6rpx 12rpx;
    }
  }
  
  .material-name {
    font-size: 24rpx;
  }
  
  .record-details {
    .detail-item {
      font-size: 24rpx;
    }
  }
  
  .stats-section {
    margin: 16rpx;
    padding: 20rpx;
  }
  
  .stats-title {
    font-size: 26rpx;
  }
  
  .stats-label, .stats-value {
    font-size: 24rpx;
  }
}

@media screen and (max-width: 375px) {
  .filter-section {
    margin: 12rpx;
    padding: 16rpx;
  }
  
  .filter-label {
    width: 90rpx;
    font-size: 24rpx;
  }
  
  .date-item, .selector {
    padding: 12rpx;
    font-size: 24rpx;
  }
  
  .records-list {
    margin: 12rpx;
  }
  
  .record-item {
    padding: 16rpx;
  }
  
  .record-header {
    .material-code {
      font-size: 24rpx;
    }
    
    .record-type {
      font-size: 20rpx;
      padding: 4rpx 10rpx;
    }
  }
  
  .material-name {
    font-size: 22rpx;
  }
  
  .record-details {
    .detail-item {
      font-size: 22rpx;
    }
  }
  
  .stats-section {
    margin: 12rpx;
    padding: 16rpx;
  }
  
  .stats-title {
    font-size: 24rpx;
  }
  
  .stats-label, .stats-value {
    font-size: 22rpx;
  }
}

/* 横屏适配 */
@media screen and (orientation: landscape) and (max-height: 500px) {
  .records-page {
    padding-top: 20px;
    padding-bottom: 10px;
  }
  
  .filter-section {
    margin: 12rpx;
    padding: 16rpx;
  }
  
  .stats-section {
    margin: 12rpx;
    padding: 16rpx;
  }
}
</style>
