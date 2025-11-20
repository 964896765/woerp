<template>
  <view class="page" @touchstart="onAxisStart" @touchmove.stop.prevent="onAxisMove" @touchend="onAxisEnd" @touchcancel="onAxisEnd">
    <SafeTop />
    <custom-head-bar class="header" :style="{ transform: 'translateY(' + headerOffsetPx + 'px)', opacity: headerOpacity }" />
    <view class="content" :style="{ marginTop: headerOffsetPx + 'px' }">
      <scroll-view class="tabbar" :scroll-x="true" :show-scrollbar="false" :scroll-into-view="scrollInto" enable-flex>
        <view v-for="(tab, i) in tabList" :key="tab.id" :id="'tab-' + i" class="tab" @tap="switchTab(i)">
          <text :class="['tab-text', i===tabIndex?'active':'']">{{ tab.name }}</text>
        </view>
      </scroll-view>
      <swiper class="swiper" :current="tabIndex" :duration="300" :disable-touch="swiperDisable" @change="onSwiperChange">
        <swiper-item v-for="(tab, i) in tabList" :key="tab.id">
          <materialPage class="page-item" :nid="tab.nid" @left-top="onLeftTop" @scroll-y="onScrollY" @swipe-tab="onSwipeTab" />
        </swiper-item>
      </swiper>
    </view>
  </view>
</template>

<script>
import materialPage from './material-page.vue'
import SafeTop from '@/components/page-header/SafeTop.vue';

export default {
  components: { materialPage, SafeTop },
  data() {
    return {
      headerH: 260,
      // 统一使用 px 单位进行位移，避免 rpx 与滚动 px 不一致
      headerHPx: 0,
      headerOffsetPx: 0,
      headerOpacity: 1,
      scrollInto: '',
      tabIndex: 0,
      // 手势轴向锁
      swiperDisable: false,
      _axisIntent: null,
      _sx: 0,
      _sy: 0,
      tabList: [
        { id: 'tab01', name: '主材仓', nid: 0 },
        { id: 'tab02', name: '车间仓', nid: 1 },
        { id: 'tab03', name: 'BOM',   nid: 2 },
        { id: 'tab04', name: 'PACK',  nid: 3 },
        { id: 'tab05', name: '辅料仓', nid: 4 },
        { id: 'tab06', name: '待处理', nid: 5 }
      ]
    }
  },
  created(){
    // 将 rpx 高度转换为 px，确保与 scrollTop 的单位一致
    try {
      this.headerHPx = (uni && typeof uni.upx2px === 'function') ? uni.upx2px(this.headerH) : this.headerH
    } catch(e){ this.headerHPx = this.headerH }
  },
  methods: {
    onLeftTop(isTop) {
      // 顶部状态：直接复位或完全隐藏
      if (isTop) { this.headerOffsetPx = 0; this.headerOpacity = 1; }
      else { this.headerOffsetPx = -this.headerHPx; this.headerOpacity = 0; }
    },
    // 根据滚动进度按比例隐藏头部（平滑过渡）
    onScrollY(st){
      // st 为 px，按头部高度上限进行位移与透明度计算
      const offset = Math.min(this.headerHPx, Math.max(0, st))
      this.headerOffsetPx = -offset
      const op = 1 - (offset / (this.headerHPx || 1))
      this.headerOpacity = Math.max(0, Math.min(1, op))
    },
    switchTab(i) {
      if (i === this.tabIndex) return
      this.tabIndex = i
      this.scrollInto = 'tab-' + i
    },
    onSwiperChange(e) {
      const i = (e && e.detail && typeof e.detail.current === 'number') ? e.detail.current : 0
      this.tabIndex = i
      this.scrollInto = 'tab-' + i
    },
    // —— 轴向锁：避免横纵冲突 ——
    onAxisStart(e){
      const t = (e.touches && e.touches[0]) || e
      this._sx = t.pageX || t.clientX || 0
      this._sy = t.pageY || t.clientY || 0
      this._axisIntent = null
      this.swiperDisable = false
    },
    onAxisMove(e){
      if (this._axisIntent) return
      const t = (e.touches && e.touches[0]) || e
      const dx = Math.abs((t.pageX||t.clientX||0) - this._sx)
      const dy = Math.abs((t.pageY||t.clientY||0) - this._sy)
      const TH = 12
      if (dy > dx && dy > TH) { // 纵向为主 → 禁止 swiper 接手
        this._axisIntent = 'y'
        this.swiperDisable = true
      } else if (dx > dy && dx > TH) {
        this._axisIntent = 'x'
        this.swiperDisable = false
      }
    },
    onAxisEnd(){ this._axisIntent = null; this.swiperDisable = false },
    
    // 处理子组件发出的滑动切换事件
    onSwipeTab(dir){
      const min = 0, max = this.tabList.length - 1
      if(dir === 'next') this.tabIndex = Math.min(max, this.tabIndex + 1)
      else this.tabIndex = Math.max(min, this.tabIndex - 1)
      this.scrollInto = 'tab-' + this.tabIndex
    }
  }
}
</script>

<style>
/* 移动端适配样式 */
.page { 
  flex: 1; 
  background: #f6f7fb;
  height: 100vh;
  /* 安全区域适配 - 先给固定 35px 兜底，再用 env 覆盖 */
  padding-top: 35px;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header { 
  position: relative; 
  z-index: 2; 
  will-change: transform, opacity; 
  transition: transform .2s ease, opacity .2s;
  flex-shrink: 0;
}

.content { 
  flex: 1; 
  position: relative; 
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.tabbar { 
  height: 88rpx; 
  min-height: 44px; /* 移动端最小高度 */
  background: #fff; 
  border-bottom: 1px solid #eef0f4; 
  white-space: nowrap; 
  display: flex; 
  align-items: center;
  flex-shrink: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.tab { 
  display: inline-flex; 
  padding: 0 28rpx; 
  min-width: 120rpx; /* 确保最小宽度 */
  height: 88rpx; 
  align-items: center; 
  justify-content: center;
  flex-shrink: 0;
}

.tab-text { 
  font-size: 32rpx; 
  color: #555; 
  line-height: 88rpx;
  white-space: nowrap;
}

.tab-text.active { 
  color: #ff4d4f; 
  font-weight: 800; 
}

.swiper { 
  flex: 1;
  height: 100%; /* 使用100%高度，让父容器的padding处理安全区域 */
  min-height: 0;
}

.page-item { 
  flex: 1;
  height: 100%;
}

/* 移动端响应式样式 */
@media screen and (max-width: 480px) {
  .tabbar {
    height: 80rpx;
    min-height: 40px;
  }
  .tab {
    padding: 0 24rpx;
    min-width: 100rpx;
    height: 80rpx;
  }
  .tab-text {
    font-size: 30rpx;
    line-height: 80rpx;
  }
  .swiper { height: 100%; }
}

@media screen and (max-width: 375px) {
  .tab {
    padding: 0 20rpx;
    min-width: 90rpx;
  }
  .tab-text { font-size: 28rpx; }
}

/* 横屏适配 */
@media screen and (orientation: landscape) and (max-height: 500px) {
  .swiper { height: 100%; }
}

/* 超小屏幕适配 */
@media screen and (max-width: 320px) {
  .tabbar {
    height: 76rpx;
    min-height: 38px;
  }
  .tab {
    padding: 0 16rpx;
    min-width: 80rpx;
    height: 76rpx;
  }
  .tab-text {
    font-size: 26rpx;
    line-height: 76rpx;
  }
  .swiper { height: 100%; }
}
</style>
