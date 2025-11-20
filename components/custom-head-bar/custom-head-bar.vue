<template>
  <view class="customHead">
    <image class="bgimg" src="/static/image/head-bg.png" mode="aspectFill" />
    <view class="brand">
      
    </view>
    <!-- 原来的样式：简洁文字胶囊 -->
    <view class="logout-btn" @click="logout"><text>退出</text></view>
  </view>
</template>

<script>
export default {
  name: 'custom-head-bar',
  methods: {
    logout(){ try{uni.clearStorageSync()}catch(e){} uni.reLaunch({url:'/pages/login/login'}) }
  }
}
</script>

<style lang="scss" scoped>
.customHead { height: 260rpx; width: 100%; position: relative; overflow: hidden; }
.bgimg { width: 100%; height: 100%; }
.brand { position: absolute; left: 40rpx; bottom: 40rpx; color: #fff; }
.title { font-size: 40rpx; font-weight: 700; }
.subtitle { font-size: 24rpx; margin-top: 8rpx; }

.logout-btn{
  position: absolute; bottom: 30rpx; right: 30rpx;
  padding: 10rpx 26rpx; border-radius: 999rpx;
  background: rgba(0,0,0,.35); color: #fff; font-size: 28rpx;
}
</style>
