<template>
  <view class="material-card" :class="{ 'card-selected': selected }">
    <!-- 头部：物料名称和操作按钮 -->
    <view class="card-header">
      <view class="material-info">
        <text class="material-name">{{ material.name }}</text>
        <text class="material-code">{{ material.code }}</text>
      </view>
      <view class="card-actions" @click.stop="handleMore">
        <text class="action-icon">⋮</text>
      </view>
    </view>
    
    <!-- 主体：物料详情 -->
    <view class="card-body">
      <view class="info-row">
        <view class="info-item">
          <text class="info-icon">📦</text>
          <text class="info-label">库存:</text>
          <text class="info-value">{{ material.stock || 0 }} {{ material.unit || 'kg' }}</text>
        </view>
        <view class="info-item" v-if="material.price">
          <text class="info-icon">💰</text>
          <text class="info-label">单价:</text>
          <text class="info-value">¥{{ material.price }}/{{ material.unit || 'kg' }}</text>
        </view>
      </view>
      
      <view class="info-row" v-if="material.batch_no || material.spec">
        <view class="info-item" v-if="material.batch_no">
          <text class="info-icon">📅</text>
          <text class="info-label">批次:</text>
          <text class="info-value">{{ material.batch_no }}</text>
        </view>
        <view class="info-item" v-if="material.spec">
          <text class="info-icon">📏</text>
          <text class="info-label">规格:</text>
          <text class="info-value">{{ material.spec }}</text>
        </view>
      </view>
      
      <view class="info-row" v-if="material.using_departments && material.using_departments.length > 0">
        <view class="info-item full-width">
          <text class="info-icon">🏢</text>
          <text class="info-label">使用:</text>
          <text class="info-value">{{ material.using_departments.join(', ') }}</text>
        </view>
      </view>
      
      <!-- 车间仓特殊显示：结存信息 -->
      <view v-if="showBalance" class="balance-section">
        <view class="balance-row">
          <text class="balance-label">实发:</text>
          <text class="balance-value">{{ material.issued_quantity || 0 }} {{ material.unit || 'kg' }}</text>
        </view>
        <view class="balance-row">
          <text class="balance-label">计划:</text>
          <text class="balance-value">{{ material.planned_quantity || 0 }} {{ material.unit || 'kg' }}</text>
        </view>
        <view class="balance-highlight" :class="balanceClass">
          <text class="balance-label">结存:</text>
          <text class="balance-value">{{ balanceText }} {{ material.unit || 'kg' }}</text>
          <text class="balance-icon">{{ balanceIcon }}</text>
        </view>
        <view v-if="material.last_issue_time" class="last-issue-time">
          <text class="time-label">最后领用:</text>
          <text class="time-value">{{ formatTime(material.last_issue_time) }}</text>
        </view>
      </view>
      
      <!-- BOM特殊显示：差异信息 -->
      <view v-if="showVariance" class="variance-section">
        <view class="variance-row">
          <text class="variance-label">计划用量:</text>
          <text class="variance-value">{{ material.planned_quantity || 0 }} {{ material.unit || 'kg' }}</text>
        </view>
        <view class="variance-row">
          <text class="variance-label">已发数量:</text>
          <text class="variance-value">{{ material.issued_quantity || 0 }} {{ material.unit || 'kg' }}</text>
        </view>
        <view class="variance-highlight" :class="varianceClass">
          <text class="variance-label">差异:</text>
          <text class="variance-value">{{ varianceText }} {{ material.unit || 'kg' }}</text>
          <text class="variance-percent">({{ variancePercent }})</text>
        </view>
      </view>
    </view>
    
    <!-- 底部：操作按钮 -->
    <view class="card-footer">
      <button 
        v-for="(btn, index) in buttons" 
        :key="index"
        class="card-btn" 
        :class="btn.type"
        @click.stop="handleAction(btn.action)"
      >
        <text class="btn-icon">{{ btn.icon }}</text>
        <text class="btn-text">{{ btn.text }}</text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MaterialCard',
  
  props: {
    // 物料数据
    material: {
      type: Object,
      required: true
    },
    // 是否选中
    selected: {
      type: Boolean,
      default: false
    },
    // 是否显示结存（车间仓）
    showBalance: {
      type: Boolean,
      default: false
    },
    // 是否显示差异（BOM）
    showVariance: {
      type: Boolean,
      default: false
    },
    // 操作按钮配置
    buttons: {
      type: Array,
      default: () => [
        { icon: '➕', text: '入库', action: 'inbound', type: 'primary' },
        { icon: '➖', text: '出库', action: 'outbound', type: 'danger' }
      ]
    }
  },
  
  computed: {
    // 结存数值
    balance() {
      return (this.material.issued_quantity || 0) - (this.material.planned_quantity || 0)
    },
    
    // 结存文本
    balanceText() {
      const balance = this.balance
      return balance > 0 ? `+${balance}` : balance.toString()
    },
    
    // 结存样式类
    balanceClass() {
      const balance = this.balance
      if (balance > 0) return 'balance-positive'
      if (balance < 0) return 'balance-negative'
      return 'balance-zero'
    },
    
    // 结存图标
    balanceIcon() {
      const balance = this.balance
      if (balance > 0) return '✅'
      if (balance < 0) return '⚠️'
      return 'ℹ️'
    },
    
    // 差异数值
    variance() {
      return (this.material.issued_quantity || 0) - (this.material.planned_quantity || 0)
    },
    
    // 差异文本
    varianceText() {
      const variance = this.variance
      return variance > 0 ? `+${variance}` : variance.toString()
    },
    
    // 差异百分比
    variancePercent() {
      const planned = this.material.planned_quantity || 0
      if (planned === 0) return '0%'
      const percent = (this.variance / planned * 100).toFixed(1)
      return percent > 0 ? `超发${percent}%` : `少发${Math.abs(percent)}%`
    },
    
    // 差异样式类
    varianceClass() {
      const variance = this.variance
      if (variance > 0) return 'variance-over'
      if (variance < 0) return 'variance-under'
      return 'variance-exact'
    }
  },
  
  methods: {
    handleAction(action) {
      this.$emit('action', { action, material: this.material })
    },
    
    handleMore() {
      this.$emit('more', this.material)
    },
    
    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hour = date.getHours()
      const minute = date.getMinutes()
      return `${month}-${day} ${hour}:${minute.toString().padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.material-card {
  background: #fff;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.material-card.card-selected {
  border: 2rpx solid #409eff;
  box-shadow: 0 2rpx 20rpx rgba(64, 158, 255, 0.2);
}

/* 头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.material-info {
  flex: 1;
}

.material-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #303133;
  display: block;
  margin-bottom: 10rpx;
}

.material-code {
  font-size: 24rpx;
  color: #909399;
  display: block;
}

.card-actions {
  padding: 10rpx;
  margin: -10rpx;
}

.action-icon {
  font-size: 32rpx;
  color: #909399;
}

/* 主体 */
.card-body {
  margin-bottom: 20rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15rpx;
}

.info-item {
  display: flex;
  align-items: center;
  flex: 1;
}

.info-item.full-width {
  flex: none;
  width: 100%;
}

.info-icon {
  font-size: 24rpx;
  margin-right: 10rpx;
}

.info-label {
  font-size: 24rpx;
  color: #909399;
  margin-right: 10rpx;
}

.info-value {
  font-size: 24rpx;
  color: #606266;
  flex: 1;
}

/* 结存区域 */
.balance-section {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1px solid #ebeef5;
}

.balance-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.balance-label {
  font-size: 24rpx;
  color: #606266;
}

.balance-value {
  font-size: 24rpx;
  color: #303133;
  font-weight: bold;
}

.balance-highlight {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15rpx 20rpx;
  border-radius: 8rpx;
  margin: 15rpx 0;
}

.balance-highlight .balance-label {
  font-size: 26rpx;
  font-weight: bold;
}

.balance-highlight .balance-value {
  font-size: 28rpx;
  font-weight: bold;
}

.balance-icon {
  font-size: 28rpx;
  margin-left: 10rpx;
}

.balance-positive {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #2e7d32;
}

.balance-negative {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  color: #c62828;
}

.balance-zero {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1565c0;
}

.last-issue-time {
  display: flex;
  justify-content: space-between;
  margin-top: 10rpx;
}

.time-label {
  font-size: 22rpx;
  color: #909399;
}

.time-value {
  font-size: 22rpx;
  color: #606266;
}

/* 差异区域 */
.variance-section {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1px solid #ebeef5;
}

.variance-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.variance-label {
  font-size: 24rpx;
  color: #606266;
}

.variance-value {
  font-size: 24rpx;
  color: #303133;
  font-weight: bold;
}

.variance-highlight {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15rpx 20rpx;
  border-radius: 8rpx;
  margin: 15rpx 0;
}

.variance-highlight .variance-label {
  font-size: 26rpx;
  font-weight: bold;
}

.variance-highlight .variance-value {
  font-size: 28rpx;
  font-weight: bold;
}

.variance-percent {
  font-size: 22rpx;
  margin-left: 10rpx;
}

.variance-over {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  color: #e65100;
}

.variance-under {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  color: #c62828;
}

.variance-exact {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #2e7d32;
}

/* 底部 */
.card-footer {
  display: flex;
  gap: 20rpx;
}

.card-btn {
  flex: 1;
  height: 60rpx;
  line-height: 60rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
}

.card-btn::after {
  border: none;
}

.card-btn.primary {
  background: #409eff;
  color: #fff;
}

.card-btn.danger {
  background: #f56c6c;
  color: #fff;
}

.card-btn.success {
  background: #67c23a;
  color: #fff;
}

.card-btn.warning {
  background: #e6a23c;
  color: #fff;
}

.card-btn.info {
  background: #909399;
  color: #fff;
}

.btn-icon {
  margin-right: 10rpx;
}

.btn-text {
  /* 文本样式 */
}
</style>
