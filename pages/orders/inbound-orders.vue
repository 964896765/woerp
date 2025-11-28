<template>
  <view class="inbound-orders-page">
    <SafeTop />
    <view class="header">
      <view class="header-left" @tap="goBack">
        <text class="icon-back">←</text>
      </view>
      <view class="header-title">入库单管理</view>
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
    
    <!-- 入库单列表 -->
    <scroll-view class="content" scroll-y @scrolltolower="loadMore">
      <view class="orders-list">
        <view class="order-card" v-for="order in orders" :key="order._id" @tap="viewDetail(order)">
          <view class="order-header">
            <text class="order-no">{{ order.order_no }}</text>
            <view class="order-status" :class="order.status">
              {{ order.status === 'pending' ? '待确认' : '已确认' }}
            </view>
          </view>
          <view class="order-body">
            <view class="order-info">
              <text class="info-label">物料名称：</text>
              <text class="info-value">{{ order.material_name }}</text>
            </view>
            <view class="order-info">
              <text class="info-label">入库数量：</text>
              <text class="info-value primary">{{ order.quantity }} {{ order.unit }}</text>
            </view>
            <view class="order-info">
              <text class="info-label">创建时间：</text>
              <text class="info-value">{{ formatTime(order.created_at) }}</text>
            </view>
          </view>
          <view class="order-footer" v-if="order.status === 'pending'">
            <view class="btn-confirm" @tap.stop="confirmOrder(order)">
              确认入库
            </view>
          </view>
        </view>
      </view>
      
      <view v-if="orders.length === 0" class="empty-state">
        <text class="empty-text">暂无入库单</text>
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
      orders: [],
      page: 1,
      pageSize: 20
    }
  },
  onLoad() {
    this.loadOrders()
  },
  methods: {
    async loadOrders() {
      // 注意：这里需要后端提供获取入库单列表的接口
      // 目前使用库存记录作为示例
      const result = await warehouseService.getRecords({
        type: 'inbound',
        status: this.filterStatus === 'all' ? null : this.filterStatus,
        page: this.page,
        pageSize: this.pageSize
      })
      if (result.success) {
        this.orders = result.data || []
      }
    },
    changeFilter(status) {
      this.filterStatus = status
      this.page = 1
      this.orders = []
      this.loadOrders()
    },
    async confirmOrder(order) {
      uni.showModal({
        title: '确认入库',
        content: '确定要确认该入库单吗？',
        success: async (res) => {
          if (res.confirm) {
            const result = await warehouseService.confirmInbound(order._id)
            if (result.success) {
              uni.showToast({ title: '确认成功', icon: 'success' })
              this.loadOrders()
            }
          }
        }
      })
    },
    viewDetail(order) {
      // 跳转到详情页
      console.log('查看详情', order)
    },
    formatTime(timestamp) {
      if (!timestamp) return '-'
      const date = new Date(timestamp)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    },
    loadMore() {
      this.page++
      this.loadOrders()
    },
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.inbound-orders-page { width: 100%; height: 100vh; background-color: #f5f5f5; display: flex; flex-direction: column; }
.header { display: flex; align-items: center; justify-content: space-between; height: 88rpx; padding: 0 30rpx; background-color: #fff; border-bottom: 1rpx solid #eee; }
.header-left, .header-right { width: 120rpx; }
.icon-back { font-size: 40rpx; color: #333; }
.header-title { font-size: 32rpx; font-weight: 600; color: #333; }
.filter-bar { display: flex; padding: 20rpx; background-color: #fff; border-bottom: 1rpx solid #eee; }
.filter-item { flex: 1; text-align: center; padding: 16rpx 0; font-size: 28rpx; color: #666; }
.filter-item.active { color: #FF6B00; font-weight: 600; border-bottom: 4rpx solid #FF6B00; }
.content { flex: 1; padding: 20rpx; }
.orders-list { display: flex; flex-direction: column; gap: 20rpx; }
.order-card { background-color: #fff; border-radius: 16rpx; padding: 30rpx; }
.order-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20rpx; }
.order-no { font-size: 28rpx; font-weight: 600; color: #333; }
.order-status { padding: 8rpx 20rpx; border-radius: 20rpx; font-size: 24rpx; color: #fff; }
.order-status.pending { background-color: #faad14; }
.order-status.confirmed { background-color: #52c41a; }
.order-body { display: flex; flex-direction: column; gap: 16rpx; }
.order-info { display: flex; align-items: center; font-size: 26rpx; }
.info-label { color: #999; }
.info-value { color: #333; }
.info-value.primary { color: #FF6B00; font-weight: 600; }
.order-footer { margin-top: 20rpx; padding-top: 20rpx; border-top: 1rpx solid #f5f5f5; }
.btn-confirm { text-align: center; padding: 16rpx 0; background-color: #FF6B00; color: #fff; border-radius: 8rpx; font-size: 28rpx; }
.empty-state { padding: 100rpx 0; text-align: center; }
.empty-text { font-size: 28rpx; color: #999; }
</style>
