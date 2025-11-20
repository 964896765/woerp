<template>
  <view v-if="show">
    <!-- 遮罩，阻止穿透 -->
    <view class="kb-mask" @touchmove.prevent @click="close"></view>
    <!-- 键盘面板 -->
    <view class="kb-wrap" :style="bottomOffsetPx ? ('transform: translateY(-' + bottomOffsetPx + 'px)') : ''">
      <view class="kb-title">
        <text>{{ materialInfo ? (materialInfo.name + '（' + materialInfo.code + '）') : '数量' }}</text>
        <text class="kb-type" :class="operationType === 'inbound' ? 'in' : 'out'">{{ operationType === 'inbound' ? '入库' : '出库' }}</text>
      </view>
      <view class="kb-display">{{ value || 0 }}</view>
      <view class="kb-grid">
        <view class="kb-key" v-for="k in keys" :key="k" @click="tap(k)">{{ k }}</view>
        <view class="kb-key" @click="del">⌫</view>
        <view class="kb-key" @click="tap('0')">0</view>
        <view class="kb-key" @click="tap('.')">.</view>
      </view>
      <view class="kb-actions">
        <button class="kb-btn cancel" @click="close">取消</button>
        <button class="kb-btn ok" @click="ok">确定</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'custom-keyboard',
  props: {
    value: { type: String, default: '' },  // Vue2 v-model
    show: { type: Boolean, default: false },
    materialInfo: { type: Object, default: null },
    operationType: { type: String, default: 'inbound' }
  },
  data() {
    return {
      keys: ['1','2','3','4','5','6','7','8','9'],
      bottomOffsetPx: 0,
      _onResize: null
    }
  },
  watch: {
    show(v) {
      if (v) {
        this.$nextTick(() => this._recalcPanelOffset())
      } else {
        this.bottomOffsetPx = 0
      }
    }
  },
  mounted(){
    // H5 环境下，窗口变化（旋转/软键盘影响）时，重新计算面板避让
    // #ifdef H5
    this._onResize = () => { if (this.show) this.$nextTick(() => this._recalcPanelOffset()) }
    if (typeof window !== 'undefined') window.addEventListener('resize', this._onResize, { passive: true })
    // #endif
  },
  beforeDestroy(){
    // #ifdef H5
    if (this._onResize && typeof window !== 'undefined') window.removeEventListener('resize', this._onResize)
    // #endif
  },
  methods: {
    tap(k) {
      // 只允许一个小数点
      if (k === '.' && String(this.modelValue || '').indexOf('.') !== -1) return
      const next = String(this.value || '') + k
      this.$emit('input', next)
    },
    del() {
      const next = String(this.value || '').slice(0, -1)
      this.$emit('input', next)
    },
    close() {
      this.$emit('update:show', false)
      this.$emit('cancel')
    },
    ok() {
      if (!this.value || isNaN(Number(this.value))) {
        uni.showToast({
          title: '请输入有效数字',
          icon: 'none'
        })
        return
      }
      const quantity = Number(this.value || 0)
      this.$emit('update:show', false)
      this.$emit('confirm', {
        material: this.materialInfo,
        type: this.operationType,
        quantity
      })
    }
    ,
    // 重新计算键盘面板的上移位移，避免遮挡底部按钮或安全区域
    _recalcPanelOffset(){
      // 获取窗口高度与底部安全区
      let winH = 0, safeBottom = 0
      try {
        const info = (uni.getWindowInfo && uni.getWindowInfo()) || uni.getSystemInfoSync()
        winH = info.windowHeight || 0
        safeBottom = (info.safeAreaInsets && info.safeAreaInsets.bottom) || 0
      } catch(e){}

      const q = uni.createSelectorQuery().in(this)
      q.select('.kb-wrap').boundingClientRect(rect => {
        if (!rect || !winH) { this.bottomOffsetPx = 0; return }
        // 计算面板底部是否超出可视高度（考虑安全区与微距离）
        const allowance = Math.max(8, safeBottom)
        const overflow = rect.bottom - (winH - allowance)
        this.bottomOffsetPx = overflow > 0 ? overflow : 0
      }).exec()
    }
  }
}
</script>

<style scoped>
.kb-mask{
  position: fixed; inset: 0;
  background: rgba(0,0,0,.35);
  z-index: 9998;
}

.kb-wrap{
  position: fixed; left: 0; right: 0; bottom: 0;
  background: #fff;
  border-top-left-radius: 16rpx;
  border-top-right-radius: 16rpx;
  padding: 20rpx 24rpx calc(24rpx + env(safe-area-inset-bottom));
  z-index: 9999;
  box-shadow: 0 -10rpx 26rpx rgba(0,0,0,.10);
  will-change: transform;
  transform: translateY(0);
}

.kb-title{ flex-direction: row; justify-content: space-between; align-items: center; font-size: 28rpx; color:#333; margin-bottom: 12rpx; }
.kb-type{ font-weight: 700; }
.kb-type.in{ color:#3bb34a; }
.kb-type.out{ color:#f26363; }

.kb-display{
  height: 72rpx; border: 1px solid #eee; border-radius: 10rpx;
  font-size: 32rpx; align-items: center; justify-content: flex-end;
  padding: 0 16rpx; margin-bottom: 16rpx;
}

.kb-grid{
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  padding: 12rpx 0;
}

.kb-key{
  height: 88rpx;
  background: #f5f7fa;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 500;
  transition: opacity 0.2s;
}

.kb-key:active{
  opacity: 0.7;
}

.kb-actions{
  flex-direction: row;
  gap: 12rpx;
  margin-top: 16rpx;
}

.kb-btn{
  flex: 1;
  height: 72rpx;
  border-radius: 8rpx;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.kb-btn.cancel{
  background: #f5f7fa;
  color: #666;
}

.kb-btn.ok{
  background: #3c9cff;
  color: #fff;
}
</style>
