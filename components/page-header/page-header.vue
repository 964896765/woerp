<template>
  <view class="page-header">
    <text class="back-btn" @click="handleBack" @tap="handleBack">←</text>
    <text class="title">{{ title }}</text>
    <view class="right-slot">
      <slot name="right"></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PageHeader',
  props: {
    title: {
      type: String,
      default: ''
    },
    showBack: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    handleBack() {
      console.log('handleBack called, showBack:', this.showBack)
      if (this.showBack) {
        try {
          // 获取当前页面栈
          const pages = getCurrentPages()
          console.log('Current pages length:', pages.length)
          
          if (pages.length > 1) {
            // 有上一页，可以返回
            uni.navigateBack({
              delta: 1,
              success: () => {
                console.log('navigateBack success')
              },
              fail: (err) => {
                console.error('navigateBack failed:', err)
                // 如果返回失败，跳转到首页
                uni.reLaunch({
                  url: '/pages/material/index'
                })
              }
            })
          } else {
            // 当前是首页或唯一页面，直接跳转到主页
            console.log('At first page, redirecting to home')
            uni.reLaunch({
              url: '/pages/material/index'
            })
          }
        } catch (error) {
          console.error('handleBack error:', error)
          // 发生异常时跳转到首页
          uni.reLaunch({
            url: '/pages/material/index'
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #e5e6eb;
  
  .title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    flex: 1;
    text-align: center;
  }
  
  .back-btn {
    font-size: 36rpx;
    color: #333;
    padding: 10rpx;
    width: 44rpx;
    text-align: center;
  }
  
  .right-slot {
    width: 44rpx;
    display: flex;
    justify-content: center;
  }
}
</style>