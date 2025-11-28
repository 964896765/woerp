<template>
  <view class="skeleton-loader">
    <view v-if="type === 'list'" class="skeleton-list">
      <view v-for="i in rows" :key="i" class="skeleton-item">
        <view v-if="avatar" class="skeleton-avatar"></view>
        <view class="skeleton-content">
          <view class="skeleton-title" :style="{ width: titleWidth }"></view>
          <view v-if="subtitle" class="skeleton-subtitle" :style="{ width: subtitleWidth }"></view>
        </view>
      </view>
    </view>
    
    <view v-else-if="type === 'card'" class="skeleton-card">
      <view v-for="i in rows" :key="i" class="skeleton-card-item">
        <view class="skeleton-card-header"></view>
        <view class="skeleton-card-body">
          <view class="skeleton-line"></view>
          <view class="skeleton-line"></view>
          <view class="skeleton-line short"></view>
        </view>
      </view>
    </view>
    
    <view v-else-if="type === 'table'" class="skeleton-table">
      <view class="skeleton-table-header">
        <view v-for="i in columns" :key="i" class="skeleton-table-cell"></view>
      </view>
      <view v-for="i in rows" :key="i" class="skeleton-table-row">
        <view v-for="j in columns" :key="j" class="skeleton-table-cell"></view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SkeletonLoader',
  
  props: {
    // 类型：list（列表）、card（卡片）、table（表格）
    type: {
      type: String,
      default: 'list'
    },
    // 行数
    rows: {
      type: Number,
      default: 5
    },
    // 列数（仅table类型）
    columns: {
      type: Number,
      default: 4
    },
    // 是否显示头像（仅list类型）
    avatar: {
      type: Boolean,
      default: false
    },
    // 是否显示副标题（仅list类型）
    subtitle: {
      type: Boolean,
      default: false
    },
    // 标题宽度
    titleWidth: {
      type: String,
      default: '60%'
    },
    // 副标题宽度
    subtitleWidth: {
      type: String,
      default: '40%'
    }
  }
}
</script>

<style scoped>
.skeleton-loader {
  padding: 20rpx;
}

/* 列表骨架屏 */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.skeleton-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #fff;
  border-radius: 10rpx;
}

.skeleton-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 10rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  flex-shrink: 0;
}

.skeleton-content {
  flex: 1;
  margin-left: 20rpx;
}

.skeleton-title {
  height: 40rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 5rpx;
  margin-bottom: 20rpx;
}

.skeleton-subtitle {
  height: 30rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 5rpx;
}

/* 卡片骨架屏 */
.skeleton-card {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.skeleton-card-item {
  background: #fff;
  border-radius: 10rpx;
  overflow: hidden;
}

.skeleton-card-header {
  height: 80rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-card-body {
  padding: 20rpx;
}

.skeleton-line {
  height: 30rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 5rpx;
  margin-bottom: 20rpx;
}

.skeleton-line.short {
  width: 60%;
}

/* 表格骨架屏 */
.skeleton-table {
  background: #fff;
  border-radius: 10rpx;
  overflow: hidden;
}

.skeleton-table-header {
  display: flex;
  background: #f5f7fa;
  padding: 20rpx;
  gap: 20rpx;
}

.skeleton-table-row {
  display: flex;
  padding: 20rpx;
  gap: 20rpx;
  border-top: 1px solid #ebeef5;
}

.skeleton-table-cell {
  flex: 1;
  height: 40rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 5rpx;
}

/* 加载动画 */
@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
