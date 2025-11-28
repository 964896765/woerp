<template>
  <view class="material-detail-page">
    <SafeTop />
    
    <!-- 页面头部 -->
    <view class="header">
      <view class="header-left" @tap="goBack">
        <text class="iconfont icon-back">←</text>
      </view>
      <view class="header-title">物料详情</view>
      <view class="header-right">
        <text class="btn-text" @tap="handleEdit">编辑</text>
      </view>
    </view>
    
    <!-- 加载状态 -->
    <skeleton-loader v-if="loading" />
    
    <!-- 物料信息 -->
    <scroll-view v-else class="content" scroll-y>
      <!-- 基本信息卡片 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">基本信息</text>
          <view class="status-badge" :class="material.status">
            {{ material.status === 'active' ? '正常' : '停用' }}
          </view>
        </view>
        <view class="card-body">
          <view class="info-row">
            <text class="label">物料编码</text>
            <text class="value">{{ material.code }}</text>
          </view>
          <view class="info-row">
            <text class="label">物料名称</text>
            <text class="value">{{ material.name }}</text>
          </view>
          <view class="info-row">
            <text class="label">规格型号</text>
            <text class="value">{{ material.spec || '-' }}</text>
          </view>
          <view class="info-row">
            <text class="label">类别</text>
            <text class="value">{{ material.category_name || '-' }}</text>
          </view>
          <view class="info-row">
            <text class="label">单位</text>
            <text class="value">{{ material.unit }}</text>
          </view>
          <view class="info-row">
            <text class="label">仓库类型</text>
            <text class="value">{{ getWarehouseTypeName(material.warehouse_type) }}</text>
          </view>
        </view>
      </view>
      
      <!-- 库存信息卡片 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">库存信息</text>
        </view>
        <view class="card-body">
          <view class="stock-info">
            <view class="stock-item">
              <text class="stock-label">当前库存</text>
              <text class="stock-value" :class="{ 'low-stock': material.stock_quantity < material.min_stock }">
                {{ material.stock_quantity }} {{ material.unit }}
              </text>
            </view>
            <view class="stock-item">
              <text class="stock-label">最低库存</text>
              <text class="stock-value">{{ material.min_stock }} {{ material.unit }}</text>
            </view>
            <view class="stock-item">
              <text class="stock-label">单价</text>
              <text class="stock-value">¥{{ material.price }}</text>
            </view>
            <view class="stock-item">
              <text class="stock-label">库存金额</text>
              <text class="stock-value">¥{{ (material.stock_quantity * material.price).toFixed(2) }}</text>
            </view>
          </view>
          <view class="info-row" v-if="material.batch_no">
            <text class="label">批次号</text>
            <text class="value">{{ material.batch_no }}</text>
          </view>
        </view>
      </view>
      
      <!-- 使用部门卡片 -->
      <view class="card" v-if="material.using_departments && material.using_departments.length > 0">
        <view class="card-header">
          <text class="card-title">使用部门</text>
        </view>
        <view class="card-body">
          <view class="dept-tags">
            <view class="dept-tag" v-for="(dept, index) in material.using_departments" :key="index">
              {{ dept }}
            </view>
          </view>
        </view>
      </view>
      
      <!-- 备注信息卡片 -->
      <view class="card" v-if="material.description">
        <view class="card-header">
          <text class="card-title">备注信息</text>
        </view>
        <view class="card-body">
          <text class="description">{{ material.description }}</text>
        </view>
      </view>
      
      <!-- 出入库历史 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">出入库历史</text>
          <text class="more-text" @tap="viewAllRecords">查看全部 ></text>
        </view>
        <view class="card-body">
          <view v-if="records.length === 0" class="empty-records">
            <text class="empty-text">暂无出入库记录</text>
          </view>
          <view v-else class="records-list">
            <view class="record-item" v-for="record in records" :key="record._id">
              <view class="record-left">
                <view class="record-type" :class="record.type">
                  {{ record.type === 'inbound' ? '入库' : '出库' }}
                </view>
                <view class="record-info">
                  <text class="record-subtype">{{ getSubtypeName(record.subtype) }}</text>
                  <text class="record-time">{{ formatTime(record.created_at) }}</text>
                </view>
              </view>
              <view class="record-right">
                <text class="record-quantity" :class="record.type">
                  {{ record.type === 'inbound' ? '+' : '-' }}{{ record.quantity }} {{ record.unit }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </scroll-view>
    
    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="btn btn-delete" @tap="handleDelete">
        <text class="btn-icon">🗑️</text>
        <text class="btn-text">删除</text>
      </view>
      <view class="btn btn-primary" @tap="handleEdit">
        <text class="btn-icon">✏️</text>
        <text class="btn-text">编辑</text>
      </view>
    </view>
  </view>
</template>

<script>
import SafeTop from '@/components/page-header/SafeTop.vue'
import SkeletonLoader from '@/components/common/skeleton-loader.vue'
import materialService from '@/common/services/materialService.js'
import warehouseService from '@/common/services/warehouseService.js'

export default {
  components: {
    SafeTop,
    SkeletonLoader
  },
  data() {
    return {
      materialId: '',
      material: {},
      records: [],
      loading: true
    }
  },
  onLoad(options) {
    if (options.id) {
      this.materialId = options.id
      this.loadMaterialDetail()
      this.loadRecords()
    }
  },
  methods: {
    async loadMaterialDetail() {
      this.loading = true
      try {
        const result = await materialService.getMaterialDetail(this.materialId)
        if (result.success) {
          this.material = result.data
        } else {
          uni.showToast({
            title: result.message || '加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('加载物料详情失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    async loadRecords() {
      try {
        const result = await warehouseService.getRecords({
          material_id: this.materialId,
          page: 1,
          pageSize: 5
        })
        if (result.success) {
          this.records = result.data || []
        }
      } catch (error) {
        console.error('加载出入库记录失败:', error)
      }
    },
    
    getWarehouseTypeName(type) {
      const map = {
        'main': '主材仓',
        'workshop': '车间仓',
        'bom': 'BOM仓',
        'pack': 'PACK仓',
        'auxiliary': '辅料仓',
        'pending': '待处理'
      }
      return map[type] || type
    },
    
    getSubtypeName(subtype) {
      const map = {
        'purchase': '采购入库',
        'return': '退货入库',
        'transfer_in': '调拨入库',
        'production': '生产出库',
        'sale': '销售出库',
        'transfer_out': '调拨出库',
        'scrap': '报废出库'
      }
      return map[subtype] || subtype
    },
    
    formatTime(timestamp) {
      if (!timestamp) return '-'
      const date = new Date(timestamp)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hour}:${minute}`
    },
    
    viewAllRecords() {
      uni.navigateTo({
        url: `/pages/records/records?material_id=${this.materialId}`
      })
    },
    
    handleEdit() {
      uni.navigateTo({
        url: `/pages/material/material-edit?id=${this.materialId}`
      })
    },
    
    handleDelete() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除该物料吗？删除后无法恢复。',
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await materialService.deleteMaterial(this.materialId)
              if (result.success) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                setTimeout(() => {
                  uni.navigateBack()
                }, 1500)
              } else {
                uni.showToast({
                  title: result.message || '删除失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              console.error('删除物料失败:', error)
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.material-detail-page {
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.header-left, .header-right {
  width: 120rpx;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.icon-back {
  font-size: 40rpx;
  color: #333;
}

.header-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.btn-text {
  font-size: 28rpx;
  color: #FF6B00;
}

.content {
  flex: 1;
  padding: 20rpx;
}

.card {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.status-badge {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #fff;
}

.status-badge.active {
  background-color: #52c41a;
}

.status-badge.inactive {
  background-color: #999;
}

.card-body {
  padding: 30rpx;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-size: 28rpx;
  color: #999;
}

.value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.stock-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30rpx;
  margin-bottom: 20rpx;
}

.stock-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
}

.stock-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.stock-value {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
}

.stock-value.low-stock {
  color: #ff4d4f;
}

.dept-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.dept-tag {
  padding: 10rpx 20rpx;
  background-color: #e6f7ff;
  color: #1890ff;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.description {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.more-text {
  font-size: 24rpx;
  color: #1890ff;
}

.empty-records {
  padding: 60rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
}

.record-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.record-type {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #fff;
}

.record-type.inbound {
  background-color: #52c41a;
}

.record-type.outbound {
  background-color: #ff4d4f;
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.record-subtype {
  font-size: 28rpx;
  color: #333;
}

.record-time {
  font-size: 24rpx;
  color: #999;
}

.record-quantity {
  font-size: 32rpx;
  font-weight: 600;
}

.record-quantity.inbound {
  color: #52c41a;
}

.record-quantity.outbound {
  color: #ff4d4f;
}

.bottom-placeholder {
  height: 120rpx;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  height: 88rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.btn-delete {
  background-color: #fff;
  border: 1rpx solid #ff4d4f;
  color: #ff4d4f;
}

.btn-primary {
  background-color: #FF6B00;
  color: #fff;
}

.btn-icon {
  font-size: 32rpx;
}
</style>
