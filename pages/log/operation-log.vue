<template>
  <view class="log-page">
    <SafeTop />
    
    <view class="header">
      <view class="header-left" @tap="goBack">
        <text class="icon-back">←</text>
      </view>
      <view class="header-title">操作日志</view>
      <view class="header-right"></view>
    </view>
    
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <scroll-view class="filter-scroll" scroll-x>
        <view 
          class="filter-item" 
          :class="{ active: filterType === 'all' }"
          @tap="changeFilter('all')"
        >
          全部
        </view>
        <view 
          class="filter-item" 
          :class="{ active: filterType === type.value }"
          v-for="type in logTypes"
          :key="type.value"
          @tap="changeFilter(type.value)"
        >
          {{ type.label }}
        </view>
      </scroll-view>
    </view>
    
    <scroll-view class="content" scroll-y @scrolltolower="loadMore">
      <view v-if="filteredLogs.length === 0" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无日志</text>
      </view>
      
      <view v-else class="log-list">
        <view class="log-item" v-for="log in filteredLogs" :key="log._id">
          <view class="log-header">
            <view class="log-type" :class="getLogTypeClass(log.type)">
              {{ getLogTypeName(log.type) }}
            </view>
            <text class="log-time">{{ formatTime(log.created_at) }}</text>
          </view>
          <view class="log-content">
            <text class="log-action">{{ log.action }}</text>
            <text class="log-detail" v-if="log.detail">{{ log.detail }}</text>
          </view>
          <view class="log-footer">
            <text class="log-user">{{ log.user_name || '系统' }}</text>
            <text class="log-ip" v-if="log.ip">{{ log.ip }}</text>
          </view>
        </view>
      </view>
      
      <view v-if="hasMore" class="loading-more">
        <text>加载更多...</text>
      </view>
      <view v-else-if="filteredLogs.length > 0" class="no-more">
        <text>没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import SafeTop from '@/components/page-header/SafeTop.vue'
import { db } from '@/common/api/unicloud.js'

export default {
  components: { SafeTop },
  data() {
    return {
      filterType: 'all',
      logs: [],
      page: 1,
      pageSize: 20,
      hasMore: true,
      logTypes: [
        { value: 'material', label: '物料' },
        { value: 'bom', label: 'BOM' },
        { value: 'inbound', label: '入库' },
        { value: 'outbound', label: '出库' },
        { value: 'system', label: '系统' }
      ]
    }
  },
  computed: {
    filteredLogs() {
      if (this.filterType === 'all') {
        return this.logs
      }
      return this.logs.filter(log => log.type === this.filterType)
    }
  },
  onLoad() {
    this.loadLogs()
  },
  methods: {
    async loadLogs() {
      try {
        // 模拟日志数据
        const mockLogs = this.generateMockLogs(20)
        this.logs = [...this.logs, ...mockLogs]
        
        if (mockLogs.length < this.pageSize) {
          this.hasMore = false
        }
      } catch (error) {
        console.error('加载日志失败:', error)
      }
    },
    
    generateMockLogs(count) {
      const logs = []
      const actions = [
        { type: 'material', action: '新增物料', detail: '正极材料 - 磷酸铁锂' },
        { type: 'material', action: '编辑物料', detail: '负极材料 - 石墨' },
        { type: 'material', action: '删除物料', detail: '隔膜 - PP隔膜' },
        { type: 'bom', action: '新增BOM', detail: '18650电芯标准BOM' },
        { type: 'bom', action: '编辑BOM', detail: '21700电芯BOM' },
        { type: 'inbound', action: '确认入库', detail: '入库单号: IN202511280001' },
        { type: 'outbound', action: '确认出库', detail: '出库单号: OUT202511280001' },
        { type: 'system', action: '修改设置', detail: '低库存预警比例: 20%' }
      ]
      
      for (let i = 0; i < count; i++) {
        const action = actions[Math.floor(Math.random() * actions.length)]
        logs.push({
          _id: `log_${Date.now()}_${i}`,
          type: action.type,
          action: action.action,
          detail: action.detail,
          user_name: '管理员',
          ip: '192.168.1.' + (100 + i),
          created_at: Date.now() - i * 3600000
        })
      }
      
      return logs
    },
    
    changeFilter(type) {
      this.filterType = type
    },
    
    loadMore() {
      if (this.hasMore) {
        this.page++
        this.loadLogs()
      }
    },
    
    getLogTypeName(type) {
      const item = this.logTypes.find(t => t.value === type)
      return item ? item.label : type
    },
    
    getLogTypeClass(type) {
      const classMap = {
        'material': 'type-material',
        'bom': 'type-bom',
        'inbound': 'type-inbound',
        'outbound': 'type-outbound',
        'system': 'type-system'
      }
      return classMap[type] || ''
    },
    
    formatTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) {
        return '刚刚'
      } else if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前'
      } else if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前'
      } else {
        return `${date.getMonth() + 1}-${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      }
    },
    
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.log-page { width: 100%; height: 100vh; background-color: #f5f5f5; display: flex; flex-direction: column; }
.header { display: flex; align-items: center; justify-content: space-between; height: 88rpx; padding: 0 30rpx; background-color: #fff; border-bottom: 1rpx solid #eee; }
.header-left, .header-right { width: 120rpx; }
.icon-back { font-size: 40rpx; color: #333; }
.header-title { font-size: 32rpx; font-weight: 600; color: #333; }
.filter-bar { background-color: #fff; border-bottom: 1rpx solid #eee; }
.filter-scroll { white-space: nowrap; padding: 16rpx 20rpx; }
.filter-item { display: inline-block; padding: 12rpx 24rpx; margin-right: 16rpx; background-color: #f5f5f5; color: #666; border-radius: 20rpx; font-size: 26rpx; }
.filter-item.active { background-color: #FF6B00; color: #fff; }
.content { flex: 1; padding: 20rpx; }
.empty-state { padding: 150rpx 0; text-align: center; }
.empty-icon { font-size: 120rpx; display: block; margin-bottom: 30rpx; }
.empty-text { font-size: 28rpx; color: #999; display: block; }
.log-list { display: flex; flex-direction: column; gap: 16rpx; }
.log-item { background-color: #fff; border-radius: 16rpx; padding: 24rpx; }
.log-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16rpx; }
.log-type { padding: 6rpx 16rpx; border-radius: 8rpx; font-size: 22rpx; }
.type-material { background-color: #e6f7ff; color: #1890ff; }
.type-bom { background-color: #f0f5ff; color: #597ef7; }
.type-inbound { background-color: #f6ffed; color: #52c41a; }
.type-outbound { background-color: #fff1f0; color: #ff4d4f; }
.type-system { background-color: #fff7e6; color: #fa8c16; }
.log-time { font-size: 22rpx; color: #999; }
.log-content { margin-bottom: 16rpx; }
.log-action { font-size: 28rpx; color: #333; font-weight: 500; display: block; margin-bottom: 8rpx; }
.log-detail { font-size: 24rpx; color: #666; display: block; }
.log-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 16rpx; border-top: 1rpx solid #f5f5f5; }
.log-user { font-size: 22rpx; color: #999; }
.log-ip { font-size: 22rpx; color: #ccc; }
.loading-more, .no-more { padding: 30rpx; text-align: center; font-size: 24rpx; color: #999; }
</style>
