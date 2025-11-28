<template>
  <view class="empty-state">
    <image v-if="image" class="empty-icon" :src="image" mode="aspectFit"></image>
    <view v-else class="empty-icon-default">
      <text class="empty-icon-text">📦</text>
    </view>
    
    <text class="empty-text">{{ text || '暂无数据' }}</text>
    
    <text v-if="description" class="empty-description">{{ description }}</text>
    
    <button v-if="showButton" class="empty-btn" @click="handleClick">
      {{ buttonText || '刷新' }}
    </button>
  </view>
</template>

<script>
export default {
  name: 'EmptyState',
  
  props: {
    // 图片地址
    image: {
      type: String,
      default: ''
    },
    // 主文本
    text: {
      type: String,
      default: '暂无数据'
    },
    // 描述文本
    description: {
      type: String,
      default: ''
    },
    // 是否显示按钮
    showButton: {
      type: Boolean,
      default: true
    },
    // 按钮文本
    buttonText: {
      type: String,
      default: '刷新'
    }
  },
  
  methods: {
    handleClick() {
      this.$emit('click')
    }
  }
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
  min-height: 400rpx;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 40rpx;
  opacity: 0.5;
}

.empty-icon-default {
  width: 200rpx;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
  opacity: 0.5;
}

.empty-icon-text {
  font-size: 120rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #909399;
  margin-bottom: 20rpx;
  text-align: center;
}

.empty-description {
  font-size: 24rpx;
  color: #c0c4cc;
  margin-bottom: 40rpx;
  text-align: center;
  line-height: 1.6;
}

.empty-btn {
  width: 200rpx;
  height: 60rpx;
  line-height: 60rpx;
  background: #409eff;
  color: #fff;
  border-radius: 30rpx;
  font-size: 26rpx;
  border: none;
  padding: 0;
}

.empty-btn::after {
  border: none;
}
</style>
