<template>
  <view class="outbound-orders-page">
    <SafeTop />
    
    <!-- 页面头部 -->
    <view class="header">
      <view class="header-left" @tap="goBack">
        <text class="icon-back">←</text>
      </view>
      <view class="header-title">出库单管理</view>
      <view class="header-right"></view>
    </view>
    
    <!-- 状态筛选 -->
    <view class="filter-bar">
      <view 
        class="filter-item" 
        :class="{ active: filterStatus === 'all' }"
        @tap="changeFilter('all')"
      >
        全部
      </view>
      <view 
        class="filter-item" 
        :class="{ active: filterStatus === 'pending' }"
        @tap="changeFilter('pending')"
      >
        待确认
      </view>
      <view 
        class="filter-item" 
        :class="{ active: filterStatus === 'confirmed' }"
        @tap="changeFilter('confirmed')"
      >
        已确认
      </view>
    </view>
    
    <!-- 出库类型筛选 -->
    <view class="type-filter">
      <scroll-view class="type-scroll" scroll-x>
        <view 
          class="type-item" 
          :class="{ active: filterType === 'all' }"
          @tap="changeType('all')"
        >
          全部类型
        </view>
        <view 
          class="type-item" 
          :class="{ active: filterType === 'production' }"
          @tap="changeType('production')"
        >
          生产出库
        </view>
        <view 
          class="type-item" 
          :class="{ active: filterType === 'sale' }"
          @tap="changeType('sale')"
        >
          销售出库
        </view>
        <view 
          class="type-item" 
          :class="{ active: filterType === 'transfer_out' }"
          @tap="changeType('transfer_out')"
        >
          调拨出库
        </view>
        <view 
          class="type-item" 
          :class="{ active: filterType === 'scrap' }"
          @tap="changeType('scrap')"
        >
          报废出库
        </view>
      </scroll-view>
    </view>
    
    <!-- 出库单列表 -->
    <scroll-view class="content" scroll-y @scrolltolower="loadMore">
      <view class="orders-list">
        <view class="order-card" v-for="order in orders" :key="order._id" @tap="viewDetail(order)">
          <!-- 订单头部 -->
          <view class="order-header">
            <view class="order-no-section">
              <text class="order-no">{{ order.order_no }}</text>
              <view class="order-type-tag" :class="order.subtype">
                {{ getSubtypeName(order.subtype) }}
              </view>
            </view>
            <view class="order-status" :class="order.status">
              {{ order.status === 'pending' ? '待确认' : '已确认' }}
            </view>
          </view>
          
          <!-- 订单内容 -->
          <view class="order-body">
            <view class="order-info">
              <text class="info-label">物料名称：</text>
              <text class="info-value">{{ order.material_name }}</text>
            </view>
            <view class="order-info">
              <text class="info-label">规格型号：</text>
              <text class="info-value">{{ order.material_spec || '-' }}</text>
            </view>
            <view class="order-info">
              <text class="info-label">出库数量：</text>
              <text class="info-value danger">{{ order.quantity }} {{ order.unit }}</text>
            </view>
            <view class="order-info" v-if="order.department">
              <text class="info-label">出库部门：</text>
              <text class="info-value">{{ order.department }}</text>
            </view>
            <view class="order-info" v-if="order.operator">
              <text class="info-label">操作人：</text>
              <text class="info-value">{{ order.operator }}</text>
            </view>
            <view class="order-info">
              <text class="info-label">创建时间：</text>
              <text class="info-value">{{ formatTime(order.created_at) }}</text>
            </view>
            <view class="order-info" v-if="order.remark">
              <text class="info-label">备注：</text>
              <text class="info-value remark">{{ order.remark }}</text>
            </view>
          </view>
          
          <!-- 订单操作 -->
          <view class="order-footer" v-if="order.status === 'pending'">
            <view class="btn-confirm" @tap.stop="confirmOrder(order)">
              确认出库
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-if="orders.length === 0 && !loading" class="empty-state">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无出库单</text>
      </view>
      
      <!-- 加载提示 -->
      <view v-if="loading" class="loading-more">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 没有更多 -->
      <view v-if="!hasMore && orders.length > 0" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import SafeTop from '@/components/page-header/SafeTop.vue'
import warehouseService from '@/common/services/warehouseService.js'

export default {
  components: { SafeTop },
  data() {
    return {
      filterStatus: 'all',
      filterType: 'all',
      orders: [],
      page: 1,
      pageSize: 20,
      loading: false,
      hasMore: true
    }
  },
  onLoad() {
    this.loadOrders()
  },
  methods: {
    async loadOrders(reset = false) {
      if (this.loading) return
      if (!reset && !this.hasMore) return
      
      this.loading = true
      
      if (reset) {
        this.page = 1
        this.orders = []
        this.hasMore = true
      }
      
      try {
        const result = await warehouseService.getRecords({
          type: 'outbound',
          subtype: this.filterType === 'all' ? null : this.filterType,
          status: this.filterStatus === 'all' ? null : this.filterStatus,
          page: this.page,
          pageSize: this.pageSize
        })
        
        if (result.success) {
          const newOrders = result.data || []
          if (reset) {
            this.orders = newOrders
          } else {
            this.orders = [...this.orders, ...newOrders]
          }
          
          // 判断是否还有更多数据
          this.hasMore = newOrders.length >= this.pageSize
        } else {
          uni.showToast({
            title: result.message || '加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('加载出库单失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    changeFilter(status) {
      if (this.filterStatus === status) return
      this.filterStatus = status
      this.loadOrders(true)
    },
    
    changeType(type) {
      if (this.filterType === type) return
      this.filterType = type
      this.loadOrders(true)
    },
    
    loadMore() {
      if (!this.hasMore || this.loading) return
      this.page++
      this.loadOrders()
    },
    
    async confirmOrder(order) {
      uni.showModal({
        title: '确认出库',
        content: `确定要确认该出库单吗？\n物料：${order.material_name}\n数量：${order.quantity} ${order.unit}`,
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({ title: '处理中...' })
              const result = await warehouseService.confirmOutbound(order._id)
              if (result.success) {
                uni.showToast({ 
                  title: '确认成功', 
                  icon: 'success' 
                })
                // 刷新列表
                this.loadOrders(true)
              } else {
                uni.showToast({
                  title: result.message || '确认失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              console.error('确认出库失败:', error)
              uni.showToast({
                title: '确认失败',
                icon: 'none'
              })
            } finally {
              uni.hideLoading()
            }
          }
        }
      })
    },
    
    viewDetail(order) {
      // 可以跳转到详情页
      console.log('查看详情', order)
    },
    
    getSubtypeName(subtype) {
      const map = {
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
    
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.outbound-orders-page {
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

.icon-back {
  font-size: 40rpx;
  color: #333;
}

.header-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.filter-bar {
  display: flex;
  padding: 20rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.filter-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.filter-item.active {
  color: #FF6B00;
  font-weight: 600;
}

.filter-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background-color: #FF6B00;
  border-radius: 2rpx;
}

.type-filter {
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.type-scroll {
  white-space: nowrap;
  padding: 16rpx 20rpx;
}

.type-item {
  display: inline-block;
  padding: 12rpx 24rpx;
  margin-right: 16rpx;
  background-color: #f5f5f5;
  color: #666;
  border-radius: 20rpx;
  font-size: 26rpx;
}

.type-item.active {
  background-color: #FF6B00;
  color: #fff;
}

.content {
  flex: 1;
  padding: 20rpx;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.order-no-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.order-no {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.order-type-tag {
  display: inline-block;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  color: #fff;
  align-self: flex-start;
}

.order-type-tag.production {
  background-color: #1890ff;
}

.order-type-tag.sale {
  background-color: #52c41a;
}

.order-type-tag.transfer_out {
  background-color: #faad14;
}

.order-type-tag.scrap {
  background-color: #999;
}

.order-status {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #fff;
  white-space: nowrap;
}

.order-status.pending {
  background-color: #faad14;
}

.order-status.confirmed {
  background-color: #52c41a;
}

.order-body {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.order-info {
  display: flex;
  align-items: flex-start;
  font-size: 26rpx;
}

.info-label {
  color: #999;
  white-space: nowrap;
  min-width: 160rpx;
}

.info-value {
  flex: 1;
  color: #333;
  word-break: break-all;
}

.info-value.danger {
  color: #ff4d4f;
  font-weight: 600;
  font-size: 28rpx;
}

.info-value.remark {
  color: #666;
  line-height: 1.5;
}

.order-footer {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f5f5f5;
}

.btn-confirm {
  text-align: center;
  padding: 16rpx 0;
  background-color: #FF6B00;
  color: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.empty-state {
  padding: 150rpx 0;
  text-align: center;
}

.empty-icon {
  font-size: 120rpx;
  display: block;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.loading-more, .no-more {
  padding: 40rpx 0;
  text-align: center;
}

.loading-text, .no-more-text {
  font-size: 26rpx;
  color: #999;
}
</style>
