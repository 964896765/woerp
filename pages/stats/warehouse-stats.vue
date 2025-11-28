<template>
  <view class="warehouse-stats-page">
    <SafeTop />
    
    <!-- 页面头部 -->
    <view class="header">
      <view class="header-left" @tap="goBack">
        <text class="icon-back">←</text>
      </view>
      <view class="header-title">仓库统计</view>
      <view class="header-right"></view>
    </view>
    
    <!-- 内容区域 -->
    <scroll-view class="content" scroll-y>
      <!-- 总览卡片 -->
      <view class="overview-card">
        <view class="overview-title">库存总览</view>
        <view class="overview-grid">
          <view class="overview-item">
            <text class="item-value">{{ stats.total_materials || 0 }}</text>
            <text class="item-label">物料种类</text>
          </view>
          <view class="overview-item">
            <text class="item-value">{{ stats.total_stock || 0 }}</text>
            <text class="item-label">总库存量</text>
          </view>
          <view class="overview-item">
            <text class="item-value">¥{{ (stats.total_value || 0).toFixed(2) }}</text>
            <text class="item-label">库存金额</text>
          </view>
          <view class="overview-item warning">
            <text class="item-value">{{ stats.low_stock_count || 0 }}</text>
            <text class="item-label">低库存预警</text>
          </view>
        </view>
      </view>
      
      <!-- 仓库类型统计 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">各仓库统计</text>
        </view>
        <view class="card-body">
          <view class="warehouse-list">
            <view 
              class="warehouse-item" 
              v-for="(item, index) in warehouseStats" 
              :key="index"
            >
              <view class="warehouse-info">
                <text class="warehouse-name">{{ item.name }}</text>
                <text class="warehouse-count">{{ item.material_count }}种物料</text>
              </view>
              <view class="warehouse-stats">
                <text class="stat-value">{{ item.stock_quantity }}</text>
                <text class="stat-label">库存</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 出入库趋势 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">本月出入库趋势</text>
        </view>
        <view class="card-body">
          <view class="trend-summary">
            <view class="trend-item inbound">
              <text class="trend-icon">↓</text>
              <view class="trend-info">
                <text class="trend-label">入库总量</text>
                <text class="trend-value">{{ monthStats.inbound_total || 0 }}</text>
              </view>
            </view>
            <view class="trend-item outbound">
              <text class="trend-icon">↑</text>
              <view class="trend-info">
                <text class="trend-label">出库总量</text>
                <text class="trend-value">{{ monthStats.outbound_total || 0 }}</text>
              </view>
            </view>
          </view>
          
          <!-- 简化的趋势图 -->
          <view class="trend-chart">
            <view class="chart-bars">
              <view 
                class="bar-group" 
                v-for="(day, index) in trendData" 
                :key="index"
              >
                <view class="bar inbound" :style="{ height: getBarHeight(day.inbound) }"></view>
                <view class="bar outbound" :style="{ height: getBarHeight(day.outbound) }"></view>
                <text class="bar-label">{{ day.date }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 物料分类统计 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">物料分类统计</text>
        </view>
        <view class="card-body">
          <view class="category-list">
            <view 
              class="category-item" 
              v-for="(item, index) in categoryStats" 
              :key="index"
            >
              <view class="category-info">
                <text class="category-name">{{ item.name }}</text>
                <view class="category-bar">
                  <view 
                    class="category-bar-fill" 
                    :style="{ width: getCategoryPercent(item.count) + '%' }"
                  ></view>
                </view>
              </view>
              <text class="category-count">{{ item.count }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 低库存预警 -->
      <view class="card" v-if="lowStockMaterials.length > 0">
        <view class="card-header">
          <text class="card-title">低库存预警</text>
          <text class="warning-badge">{{ lowStockMaterials.length }}</text>
        </view>
        <view class="card-body">
          <view class="warning-list">
            <view 
              class="warning-item" 
              v-for="material in lowStockMaterials" 
              :key="material._id"
              @tap="viewMaterialDetail(material)"
            >
              <view class="warning-info">
                <text class="material-name">{{ material.name }}</text>
                <text class="material-spec">{{ material.spec }}</text>
              </view>
              <view class="warning-stock">
                <text class="stock-value danger">{{ material.stock_quantity }}</text>
                <text class="stock-unit">{{ material.unit }}</text>
                <text class="stock-min">/ {{ material.min_stock }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </scroll-view>
  </view>
</template>

<script>
import SafeTop from '@/components/page-header/SafeTop.vue'
import warehouseService from '@/common/services/warehouseService.js'
import materialService from '@/common/services/materialService.js'

export default {
  components: { SafeTop },
  data() {
    return {
      stats: {},
      warehouseStats: [],
      monthStats: {},
      trendData: [],
      categoryStats: [],
      lowStockMaterials: []
    }
  },
  onLoad() {
    this.loadStats()
  },
  methods: {
    async loadStats() {
      try {
        uni.showLoading({ title: '加载中...' })
        
        // 加载仓库统计
        const statsResult = await warehouseService.getWarehouseStats()
        if (statsResult.success) {
          this.stats = statsResult.data || {}
        }
        
        // 加载各仓库统计
        this.loadWarehouseStats()
        
        // 加载出入库趋势
        this.loadTrendData()
        
        // 加载分类统计
        this.loadCategoryStats()
        
        // 加载低库存物料
        this.loadLowStockMaterials()
        
      } catch (error) {
        console.error('加载统计数据失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    async loadWarehouseStats() {
      // 模拟各仓库统计数据
      this.warehouseStats = [
        { name: '主材仓', material_count: 9, stock_quantity: 1500 },
        { name: '车间仓', material_count: 6, stock_quantity: 800 },
        { name: 'BOM仓', material_count: 1, stock_quantity: 100 },
        { name: 'PACK仓', material_count: 5, stock_quantity: 600 },
        { name: '辅料仓', material_count: 6, stock_quantity: 400 },
        { name: '待处理', material_count: 2, stock_quantity: 50 }
      ]
    },
    
    async loadTrendData() {
      // 模拟最近7天的出入库趋势
      const today = new Date()
      this.trendData = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const day = date.getDate()
        this.trendData.push({
          date: `${day}日`,
          inbound: Math.floor(Math.random() * 100) + 50,
          outbound: Math.floor(Math.random() * 80) + 30
        })
      }
      
      // 计算本月总计
      this.monthStats = {
        inbound_total: this.trendData.reduce((sum, d) => sum + d.inbound, 0),
        outbound_total: this.trendData.reduce((sum, d) => sum + d.outbound, 0)
      }
    },
    
    async loadCategoryStats() {
      // 模拟分类统计
      this.categoryStats = [
        { name: '正极材料', count: 5 },
        { name: '负极材料', count: 4 },
        { name: '电解液', count: 3 },
        { name: '隔膜', count: 2 },
        { name: '其他', count: 6 }
      ]
    },
    
    async loadLowStockMaterials() {
      try {
        const result = await materialService.getMaterialList({
          low_stock: true,
          page: 1,
          pageSize: 10
        })
        if (result.success) {
          this.lowStockMaterials = result.data || []
        }
      } catch (error) {
        console.error('加载低库存物料失败:', error)
      }
    },
    
    getBarHeight(value) {
      const maxValue = Math.max(...this.trendData.map(d => Math.max(d.inbound, d.outbound)))
      const height = (value / maxValue) * 120
      return height + 'rpx'
    },
    
    getCategoryPercent(count) {
      const total = this.categoryStats.reduce((sum, item) => sum + item.count, 0)
      return total > 0 ? (count / total * 100) : 0
    },
    
    viewMaterialDetail(material) {
      uni.navigateTo({
        url: `/pages/material/material-detail?id=${material._id}`
      })
    },
    
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.warehouse-stats-page {
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

.content {
  flex: 1;
  padding: 20rpx;
}

.overview-card {
  background: linear-gradient(135deg, #FF6B00 0%, #FF8C3A 100%);
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 0, 0.3);
}

.overview-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 30rpx;
}

.overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.overview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 12rpx;
}

.overview-item.warning {
  background-color: rgba(255, 77, 79, 0.3);
}

.item-value {
  font-size: 40rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 10rpx;
}

.item-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
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

.warning-badge {
  padding: 6rpx 16rpx;
  background-color: #ff4d4f;
  color: #fff;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.card-body {
  padding: 30rpx;
}

.warehouse-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.warehouse-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
}

.warehouse-info {
  flex: 1;
}

.warehouse-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 8rpx;
}

.warehouse-count {
  font-size: 24rpx;
  color: #999;
  display: block;
}

.warehouse-stats {
  text-align: right;
}

.stat-value {
  font-size: 32rpx;
  color: #FF6B00;
  font-weight: 600;
  display: block;
}

.stat-label {
  font-size: 22rpx;
  color: #999;
  display: block;
}

.trend-summary {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.trend-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  border-radius: 12rpx;
}

.trend-item.inbound {
  background-color: #e6f7ff;
}

.trend-item.outbound {
  background-color: #fff1f0;
}

.trend-icon {
  font-size: 48rpx;
  font-weight: 600;
}

.trend-item.inbound .trend-icon {
  color: #1890ff;
}

.trend-item.outbound .trend-icon {
  color: #ff4d4f;
}

.trend-info {
  flex: 1;
}

.trend-label {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 8rpx;
}

.trend-value {
  font-size: 32rpx;
  font-weight: 600;
  display: block;
}

.trend-item.inbound .trend-value {
  color: #1890ff;
}

.trend-item.outbound .trend-value {
  color: #ff4d4f;
}

.trend-chart {
  padding: 20rpx 0;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 200rpx;
  padding: 20rpx 0;
}

.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.bar {
  width: 16rpx;
  border-radius: 8rpx 8rpx 0 0;
  min-height: 10rpx;
}

.bar.inbound {
  background-color: #1890ff;
}

.bar.outbound {
  background-color: #ff4d4f;
}

.bar-label {
  font-size: 20rpx;
  color: #999;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 26rpx;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.category-bar {
  height: 12rpx;
  background-color: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
}

.category-bar-fill {
  height: 100%;
  background-color: #FF6B00;
  border-radius: 6rpx;
  transition: width 0.3s;
}

.category-count {
  font-size: 28rpx;
  color: #FF6B00;
  font-weight: 600;
  min-width: 60rpx;
  text-align: right;
}

.warning-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.warning-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background-color: #fff1f0;
  border-radius: 12rpx;
  border-left: 4rpx solid #ff4d4f;
}

.warning-info {
  flex: 1;
}

.material-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 8rpx;
}

.material-spec {
  font-size: 24rpx;
  color: #999;
  display: block;
}

.warning-stock {
  text-align: right;
}

.stock-value {
  font-size: 32rpx;
  font-weight: 600;
}

.stock-value.danger {
  color: #ff4d4f;
}

.stock-unit, .stock-min {
  font-size: 22rpx;
  color: #999;
}

.bottom-placeholder {
  height: 40rpx;
}
</style>
