<template>
  <view class="settings-page">
    <SafeTop />
    
    <view class="header">
      <view class="header-left" @tap="goBack">
        <text class="icon-back">←</text>
      </view>
      <view class="header-title">系统设置</view>
      <view class="header-right"></view>
    </view>
    
    <scroll-view class="content" scroll-y>
      <!-- 基础设置 -->
      <view class="section">
        <view class="section-title">基础设置</view>
        <view class="setting-list">
          <view class="setting-item">
            <text class="setting-label">系统名称</text>
            <input class="setting-input" v-model="settings.systemName" placeholder="请输入系统名称" />
          </view>
          <view class="setting-item">
            <text class="setting-label">公司名称</text>
            <input class="setting-input" v-model="settings.companyName" placeholder="请输入公司名称" />
          </view>
          <view class="setting-item">
            <text class="setting-label">联系电话</text>
            <input class="setting-input" v-model="settings.phone" placeholder="请输入联系电话" />
          </view>
          <view class="setting-item">
            <text class="setting-label">联系地址</text>
            <input class="setting-input" v-model="settings.address" placeholder="请输入联系地址" />
          </view>
        </view>
      </view>
      
      <!-- 库存设置 -->
      <view class="section">
        <view class="section-title">库存设置</view>
        <view class="setting-list">
          <view class="setting-item">
            <text class="setting-label">低库存预警比例</text>
            <view class="setting-input-group">
              <input class="setting-input-number" type="number" v-model="settings.lowStockRatio" />
              <text class="setting-unit">%</text>
            </view>
          </view>
          <view class="setting-item">
            <text class="setting-label">自动确认入库</text>
            <switch :checked="settings.autoConfirmInbound" @change="onSwitchChange($event, 'autoConfirmInbound')" />
          </view>
          <view class="setting-item">
            <text class="setting-label">自动确认出库</text>
            <switch :checked="settings.autoConfirmOutbound" @change="onSwitchChange($event, 'autoConfirmOutbound')" />
          </view>
          <view class="setting-item">
            <text class="setting-label">允许负库存</text>
            <switch :checked="settings.allowNegativeStock" @change="onSwitchChange($event, 'allowNegativeStock')" />
          </view>
        </view>
      </view>
      
      <!-- 通知设置 -->
      <view class="section">
        <view class="section-title">通知设置</view>
        <view class="setting-list">
          <view class="setting-item">
            <text class="setting-label">低库存通知</text>
            <switch :checked="settings.lowStockNotify" @change="onSwitchChange($event, 'lowStockNotify')" />
          </view>
          <view class="setting-item">
            <text class="setting-label">入库通知</text>
            <switch :checked="settings.inboundNotify" @change="onSwitchChange($event, 'inboundNotify')" />
          </view>
          <view class="setting-item">
            <text class="setting-label">出库通知</text>
            <switch :checked="settings.outboundNotify" @change="onSwitchChange($event, 'outboundNotify')" />
          </view>
        </view>
      </view>
      
      <!-- 数据管理 -->
      <view class="section">
        <view class="section-title">数据管理</view>
        <view class="action-list">
          <view class="action-item" @tap="exportData">
            <text class="action-icon">📤</text>
            <text class="action-label">导出数据</text>
            <text class="action-arrow">›</text>
          </view>
          <view class="action-item" @tap="importData">
            <text class="action-icon">📥</text>
            <text class="action-label">导入数据</text>
            <text class="action-arrow">›</text>
          </view>
          <view class="action-item" @tap="clearCache">
            <text class="action-icon">🗑️</text>
            <text class="action-label">清除缓存</text>
            <text class="action-arrow">›</text>
          </view>
        </view>
      </view>
      
      <!-- 关于 -->
      <view class="section">
        <view class="section-title">关于</view>
        <view class="setting-list">
          <view class="setting-item">
            <text class="setting-label">版本号</text>
            <text class="setting-value">v1.0.0</text>
          </view>
          <view class="setting-item">
            <text class="setting-label">更新时间</text>
            <text class="setting-value">2025-11-28</text>
          </view>
        </view>
      </view>
      
      <!-- 保存按钮 -->
      <view class="save-button" @tap="saveSettings">
        保存设置
      </view>
      
      <view class="bottom-placeholder"></view>
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
      settings: {
        systemName: 'WOERP仓库管理系统',
        companyName: '',
        phone: '',
        address: '',
        lowStockRatio: 20,
        autoConfirmInbound: false,
        autoConfirmOutbound: false,
        allowNegativeStock: false,
        lowStockNotify: true,
        inboundNotify: true,
        outboundNotify: true
      }
    }
  },
  onLoad() {
    this.loadSettings()
  },
  methods: {
    async loadSettings() {
      try {
        const result = await db.get('system_settings', {})
        if (result.success && result.data && result.data.length > 0) {
          this.settings = { ...this.settings, ...result.data[0] }
        }
      } catch (error) {
        console.error('加载设置失败:', error)
      }
    },
    
    onSwitchChange(e, key) {
      this.settings[key] = e.detail.value
    },
    
    async saveSettings() {
      try {
        uni.showLoading({ title: '保存中...' })
        
        // 检查是否已存在设置
        const checkResult = await db.get('system_settings', {})
        let result
        
        if (checkResult.success && checkResult.data && checkResult.data.length > 0) {
          // 更新现有设置
          result = await db.update('system_settings', checkResult.data[0]._id, this.settings)
        } else {
          // 创建新设置
          result = await db.add('system_settings', this.settings)
        }
        
        if (result.success) {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: '保存失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('保存设置失败:', error)
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    exportData() {
      uni.showToast({
        title: '导出功能开发中',
        icon: 'none'
      })
    },
    
    importData() {
      uni.showToast({
        title: '导入功能开发中',
        icon: 'none'
      })
    },
    
    clearCache() {
      uni.showModal({
        title: '确认清除',
        content: '确定要清除所有缓存数据吗？',
        success: (res) => {
          if (res.confirm) {
            uni.clearStorage()
            uni.showToast({
              title: '清除成功',
              icon: 'success'
            })
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
.settings-page {
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

.section {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  color: #999;
  padding: 20rpx 30rpx 16rpx;
}

.setting-list, .action-list {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 28rpx;
  color: #333;
}

.setting-input {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: #666;
  margin-left: 20rpx;
}

.setting-input-group {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.setting-input-number {
  width: 120rpx;
  text-align: right;
  font-size: 28rpx;
  color: #666;
}

.setting-unit {
  font-size: 24rpx;
  color: #999;
}

.setting-value {
  font-size: 28rpx;
  color: #999;
}

.action-list {
  display: flex;
  flex-direction: column;
}

.action-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.action-item:last-child {
  border-bottom: none;
}

.action-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.action-label {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.action-arrow {
  font-size: 40rpx;
  color: #ccc;
  transform: rotate(90deg);
}

.save-button {
  margin: 40rpx 0;
  padding: 28rpx;
  background-color: #FF6B00;
  color: #fff;
  text-align: center;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
}

.bottom-placeholder {
  height: 40rpx;
}
</style>
