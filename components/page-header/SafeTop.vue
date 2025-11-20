
<template>
  <!-- Reserve 35px below the OS status bar to avoid overlap -->
  <view class="safe-top" />
</template>

<script>
export default { name: 'SafeTop' }
</script>

<style scoped>
.safe-top {
  height: 55rpx; /* 增加到55rpx (原45rpx + 10rpx) */
  /* If you prefer actual px: use height: 55px; */
  width: 100%;
  background-color: #0A1F34; /* 使用深蓝色背景 */
}
/* 触发重新构建 */
</style>
