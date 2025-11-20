<template>
  <view class="page">
    <view class="hd">出入库结算</view>

    <scroll-view scroll-y enable-flex class="list">
      <view class="item" v-for="it in cart" :key="it.id">
        <view class="title">{{ it.materialCode }} - {{ it.materialName }}</view>
        <view class="meta">
          <text class="tag" :class="it.type">{{ it.type==='inbound'?'入库':'出库' }}</text>
          <text>数量：{{ it.quantity }}</text>
          <text>{{ formatTime(it.timestamp) }}</text>
        </view>
      </view>
      <view v-if="!cart.length" class="empty">
        <u-empty mode="list" text="清单为空" />
      </view>
    </scroll-view>

    <!-- 部门选择 -->
    <view class="section-title">选择部门</view>
    <scroll-view scroll-x enable-flex class="h-scroll chips">
      <label v-for="dept in departments" :key="dept" class="chip" :class="{active: dept===selectedDept}">
        <radio :value="dept" :checked="dept===selectedDept" @click="selectedDept=dept" /> {{ dept }}
      </label>
    </scroll-view>

    <!-- 出入库类别选择 -->
    <view class="section-title">出入库类别</view>
    <scroll-view scroll-x enable-flex class="h-scroll chips">
      <label v-for="opt in ioTypes" :key="opt.value" class="chip" :class="{active: opt.value===selectedIo}">
        <radio :value="opt.value" :checked="opt.value===selectedIo" @click="selectedIo=opt.value" /> {{ opt.label }}
      </label>
    </scroll-view>

    <!-- 签字确认区域 -->
    <view class="section-title">签字确认</view>
    <view class="sign-wrap">
      <canvas 
        id="signCanvas" 
        type="2d"
        class="sign-canvas"
        :style="{ width: canvasW + 'px', height: canvasH + 'px' }"
        @touchstart="onStart"
        @touchmove="onMove"
        @touchend="onEnd"
      />
      <view class="sign-tips" v-if="!hasStroke">请在上方区域签名</view>
      <view class="sign-status" v-if="signConfirmed">✓ 签名已确认</view>
    </view>

    <!-- 操作按钮 -->
    <view class="footer">
      <view class="btn-row">
        <view class="action-btn btn-cancel" @click="cancelCheckout">取消</view>
        <view class="action-btn btn-clear" @click="clearSign">清除签名</view>
        <view class="action-btn btn-confirm" @click="confirmSign" :class="!hasStroke ? 'btn-disabled' : ''">确认签名</view>
        <view class="action-btn btn-settle" @click="confirmSettle" :class="!signConfirmed ? 'btn-disabled' : ''">确认结算</view>
      </view>
    </view>
  </view>
</template>

<script>
import { uiUtils } from '@/common/util.js'

function dateKey(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default {
  data(){
    return {
      cart: [],
      selectedDept: '配料',
      selectedIo: 'inbound_purchase',
      departments: ['配料','制片','卷绕','封装','注液','切边','包装','PACK','技术部'],
      ioTypes: [
        {value:'inbound_purchase',label:'采购入库'},
        {value:'return_purchase',label:'采购退货'},
        {value:'line_return',label:'产线退仓'},
        {value:'prod_issue',label:'生产领料'},
        {value:'batch_out',label:'批次出库'},
        {value:'over_out',label:'超领出库'},
        {value:'replenish_out',label:'补料出库'},
        {value:'mix_issue',label:'制料领料'},
        {value:'aux_out',label:'辅料出库'}
      ],
      
      canvasW: 0,
      canvasH: 0,
      _canvasNode: null,
      ctx: null,
      last: null,
      isDrawing: false,
      hasStroke: false,
      signConfirmed: false,
      signImage: '',
      drawTimer: null,        // 绘制防抖定时器（旧方案保留）
      pendingDraw: false,     // 是否有待绘制的内容（旧方案保留）
      rafId: null,            // requestAnimationFrame ID（避免以 _ 开头影响代理）
      pointQueue: []          // 待绘制的点队列（避免以 _ 开头影响代理）
    }
  },
  onLoad() {
    this.cart = uni.getStorageSync('cartList') || []
  },
  onReady() {
    // 延迟初始化 Canvas，确保页面完全加载
    setTimeout(() => {
      this.initCanvas()
    }, 100)
  },
  methods:{
    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.toLocaleString()
    },

    initCanvas() {
      try {
        const sys = uni.getWindowInfo()
        if (!sys || !sys.windowWidth) {
          console.warn('Failed to get window info')
          return
        }
        
        const w = sys.windowWidth - 32
        // 扩大签字区域高度，从25%增加到35%
        const h = Math.floor(sys.windowHeight * 0.35)
        this.canvasW = w
        this.canvasH = h

      // #ifdef H5
      uni.createSelectorQuery()
        .in(this)
        .select('#signCanvas')
        .fields({ node: true, size: true })
        .exec(res => {
          const canvas = res && res[0] && res[0].node
          if (canvas && canvas.getContext) {
            const dpr = sys.pixelRatio || 1
            canvas.width = w * dpr
            canvas.height = h * dpr
            const ctx = canvas.getContext('2d')
            ctx.scale(dpr, dpr)
            // 优化画笔设置以改善字迹连续性
            ctx.lineWidth = 3              // 稍微减小线宽，提高精度
            ctx.strokeStyle = '#000'       // 使用更深的黑色
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            ctx.globalCompositeOperation = 'source-over'
            // 启用抗锯齿和平滑处理
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'
            this._canvasNode = canvas
            this.ctx = ctx
          } else {
            const c = uni.createCanvasContext('signCanvas', this)
            c.setStrokeStyle('#111')
            c.setLineWidth(3)
            c.setLineCap('round')
            c.setLineJoin('round')
            this.ctx = c
          }
        })
      // #endif

      // #ifdef MP-WEIXIN
      // 微信小程序使用Canvas 2D接口
      uni.createSelectorQuery()
        .in(this)
        .select('#signCanvas')
        .fields({ node: true, size: true })
        .exec(res => {
          const canvas = res && res[0] && res[0].node
          if (canvas && canvas.getContext) {
            // 使用Canvas 2D接口
            const dpr = sys.pixelRatio || 1
            canvas.width = w * dpr
            canvas.height = h * dpr
            const ctx = canvas.getContext('2d')
            ctx.scale(dpr, dpr)
            // 优化画笔设置
            ctx.lineWidth = 3
            ctx.strokeStyle = '#000'
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            ctx.globalCompositeOperation = 'source-over'
            this._canvasNode = canvas
            this.ctx = ctx
          } else {
            // 降级到旧接口
            const c = uni.createCanvasContext('signCanvas', this)
            c.setStrokeStyle('#000')
            c.setLineWidth(3)
            c.setLineCap('round')
            c.setLineJoin('round')
            this.ctx = c
          }
        })
      // #endif
      
      // #ifdef APP-PLUS
      // App端的canvas处理
      const c = uni.createCanvasContext('signCanvas', this)
      c.setStrokeStyle('#000')  // 使用更深的黑色
      c.setLineWidth(3)         // 稍微减小线宽，提高精度
      c.setLineCap('round')
      c.setLineJoin('round')
      // App端也移除 setGlobalCompositeOperation 以保持一致性
      this.ctx = c
      // #endif
      
      } catch (error) {
        console.error('Canvas initialization failed:', error)
        this.ctx = null
      }
    },

    onStart(e) {
      if (!this.ctx) {
        console.warn('Canvas context not initialized')
        return
      }
      
      // 初始化逐帧队列与状态
      if (!Array.isArray(this.pointQueue)) this.pointQueue = []
      this.rafId = null

      this.signConfirmed = false
      const p = e.touches && e.touches[0] ? e.touches[0] : {}
      const x = p.x || p.clientX || 0
      const y = p.y || p.clientY || 0
      this.last = { x, y }
      this.isDrawing = true

      if (this._isH5Ctx()) {
        this.ctx.beginPath()
        this.ctx.moveTo(x, y)
        // 在起始点画一个小点，确保单点也能显示
        this.ctx.arc(x, y, 1, 0, 2 * Math.PI)
        this.ctx.fill()
        this.ctx.beginPath()
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.beginPath()
        this.ctx.moveTo(x, y)
        this.ctx.draw(true)
      }
    },

    onMove(e) {
      if (!this.last || !this.ctx || !this.isDrawing) return
      const p = e.touches && e.touches[0] ? e.touches[0] : {}
      const x = p.x || p.clientX || 0
      const y = p.y || p.clientY || 0

      // 计算距离，降低阈值以提高流畅性
      const dx = x - this.last.x
      const dy = y - this.last.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      // 进一步降低距离阈值，确保连续性，同时避免过密计算
      if (distance < 0.5) return

      // 采用逐帧绘制：收集点，按帧绘制，减少频繁 stroke/beginPath
      if (!Array.isArray(this.pointQueue)) this.pointQueue = []
      this.pointQueue.push({ x, y })
      if (!this.rafId) {
        const raf = (cb) => {
          // H5 优先使用 window.requestAnimationFrame
          if (typeof window !== 'undefined' && window.requestAnimationFrame) return window.requestAnimationFrame(cb)
          // 微信 Canvas 2D 对象可能支持 requestAnimationFrame
          if (this._canvasNode && typeof this._canvasNode.requestAnimationFrame === 'function') return this._canvasNode.requestAnimationFrame(cb)
          // 其他环境降级
          return setTimeout(cb, 16)
        }
        this.rafId = raf(() => {
          this.rafId = null
          // 批量消费队列
          while (this.pointQueue.length) {
            const pt = this.pointQueue.shift()
            const midX = (this.last.x + pt.x) / 2
            const midY = (this.last.y + pt.y) / 2
            if (this._isH5Ctx()) {
              this.ctx.quadraticCurveTo(this.last.x, this.last.y, midX, midY)
              this.ctx.stroke()
              this.ctx.beginPath()
              this.ctx.moveTo(midX, midY)
            } else {
              this.ctx.lineTo(pt.x, pt.y)
              this.ctx.stroke()
            }
            this.last = { x: pt.x, y: pt.y }
          }
          // 小程序端提交一次绘制
          if (!this._isH5Ctx()) {
            this.ctx.draw(true)
          }
        })
      }
      this.hasStroke = true
    },

    onEnd() { 
      this.last = null
      this.isDrawing = false
      
      // 清理防抖定时器
      if (this.drawTimer) {
        clearTimeout(this.drawTimer)
        this.drawTimer = null
      }
      // 清理逐帧队列
      this.pointQueue = []
      this.rafId = null
      
      // 结束绘制时，确保路径完整
      if (this.ctx) {
        if (this._isH5Ctx()) {
          this.ctx.stroke()
        } else {
          // 小程序端确保最后的绘制被提交
          this.ctx.draw(true)
          this.pendingDraw = false
        }
      }
    },

    cancelCheckout() {
      uni.showModal({
        title: '确认取消',
        content: '确定要取消当前结算吗？',
        success: (res) => {
          if (res.confirm) {
            uni.navigateBack()
          }
        }
      })
    },

    clearSign() {
      this.hasStroke = false
      this.signConfirmed = false
      this.signImage = ''
      this.isDrawing = false
      this.last = null
      if (this.ctx) {
        if (this._isH5Ctx()) {
          // Canvas 2D接口
          this.ctx.clearRect(0, 0, this.canvasW, this.canvasH)
        } else {
          // 旧版接口
          this.ctx.clearRect(0, 0, this.canvasW, this.canvasH)
          this.ctx.draw()
        }
      }
    },

    captureSignature() {
      return new Promise((resolve, reject) => {
        // #ifdef H5
        if (this._canvasNode && this._canvasNode.toDataURL) {
          try {
            const dataUrl = this._canvasNode.toDataURL('image/png')
            return resolve(dataUrl)
          } catch (e) {
            return reject(e)
          }
        }
        // #endif

        // #ifdef MP-WEIXIN
        // 微信小程序Canvas 2D接口导出
        if (this._canvasNode && this._canvasNode.toDataURL) {
          try {
            const dataUrl = this._canvasNode.toDataURL('image/png')
            return resolve(dataUrl)
          } catch (e) {
            console.error('Canvas 2D导出失败，降级到旧接口:', e)
          }
        }
        
        // 降级到旧版接口
        uni.canvasToTempFilePath({
          canvasId: 'signCanvas',
          fileType: 'png',
          quality: 1,
          success: res => {
            console.log('微信小程序签名导出成功:', res.tempFilePath)
            resolve(res.tempFilePath)
          },
          fail: err => {
            console.error('微信小程序签名导出失败:', err)
            reject(err)
          }
        }, this)
        // #endif
        
        // #ifdef APP-PLUS
        // App端的canvas导出
        uni.canvasToTempFilePath({
          canvasId: 'signCanvas',
          fileType: 'png',
          quality: 1,
          success: res => resolve(res.tempFilePath),
          fail: err => reject(err)
        }, this)
        // #endif
      })
    },

    async confirmSign() {
      if (!this.hasStroke) {
        uiUtils.showToast('请先签名')
        return
      }
      try {
        const img = await this.captureSignature()
        this.signImage = img
        this.signConfirmed = true
        uiUtils.showSuccess('签名已确认')
      } catch (e) {
        uiUtils.showError('导出签名失败')
      }
    },

    async confirmSettle() {
      if (!this.cart.length) {
        uiUtils.showToast('清单为空')
        return
      }
      if (!this.signConfirmed) {
        uiUtils.showToast('请先确认签名')
        return
      }

      // 双保险：若 signImage 还未生成，再生成一次
      if (!this.signImage) {
        try { 
          this.signImage = await this.captureSignature() 
        } catch(e){}
      }

      const store = uni.getStorageSync('recordsByDate') || {}
      const k = dateKey()
      if (!store[k]) store[k] = []
      const signAt = new Date().toLocaleString()

      this.cart.forEach(i => {
        store[k].unshift({
          id: i.id,
          code: i.materialCode,
          name: i.materialName,
          type: i.type,
          quantity: i.quantity,
          time: this.formatTime(i.timestamp),
          department: this.selectedDept,
          ioType: this.selectedIo,
          signAt,
          signImage: this.signImage
        })
      })
      
      uni.setStorageSync('recordsByDate', store)
      uni.removeStorageSync('cartList')
      
      uiUtils.showSuccess('结算完成')
      
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/material/index' })
      }, 1500)
    },

    importRecords() {
      // 模拟导入记录功能
      uni.showModal({
        title: '导入记录',
        content: '是否要导入历史记录？',
        success: (res) => {
          if (res.confirm) {
            // 这里可以实现实际的导入逻辑
            uiUtils.showSuccess('导入成功')
          }
        }
      })
    },

    _isH5Ctx() {
      // 仅在存在真实 Canvas 2D 节点时返回 true（H5 或小程序 Canvas 2D）
      return !!(this._canvasNode && typeof this._canvasNode.getContext === 'function')
    }
  }
}
</script>

<style lang="scss" scoped>
.page { 
  min-height: 100vh; 
  display: flex; 
  flex-direction: column; 
  background: #fff; 
  /* 安全区域适配 */
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  /* 手动设置安全区域 */
  padding-top: 35px;
  padding-bottom: 15px;
  box-sizing: border-box;
}

.hd { 
  font-size: 36rpx; 
  font-weight: 700; 
  padding: 24rpx; 
  text-align: center;
  background: #f8f9fa;
  border-bottom: 1rpx solid #e5e6eb;
}

.list { 
  flex: 1; 
  min-height: 0; 
  padding: 0 24rpx; 
  max-height: 300rpx;
  overflow-y: auto;
}

.item { 
  padding: 20rpx 0; 
  border-bottom: 1rpx solid #f0f0f0; 
}

.title { 
  font-weight: 600; 
  font-size: 30rpx; 
  margin-bottom: 8rpx; 
}

.meta { 
  color: #666; 
  display: flex; 
  align-items: center; 
  gap: 16rpx; 
  flex-wrap: wrap; 
  font-size: 24rpx;
}

.tag { 
  color: #fff; 
  padding: 4rpx 12rpx; 
  border-radius: 16rpx;
  font-size: 22rpx;
  
  &.inbound { background: #52c41a; }
  &.outbound { background: #ff4d4f; }
}

.empty { 
  padding: 80rpx 0; 
}

.section-title { 
  padding: 16rpx 24rpx; 
  font-weight: 600; 
  font-size: 28rpx;
  color: #333;
}

.h-scroll {
  white-space: nowrap;
  padding: 0 24rpx 16rpx;
}

.chips {
  display: flex;
  gap: 12rpx;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 12rpx 20rpx;
  background: #f6f7f9;
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #666;
  white-space: nowrap;
  border: 1rpx solid transparent;
  
  &.active {
    background: #e6f7ff;
    color: #1890ff;
    border-color: #1890ff;
  }
  
  radio {
    margin-right: 8rpx;
  }
}

.sign-wrap { 
  padding: 0 24rpx 12rpx; 
}

.sign-canvas { 
  width: 100%; 
  background: #f7f8fa; 
  border-radius: 12rpx; 
  border: 2rpx dashed #d9d9d9; 
  touch-action: none; 
  -ms-touch-action: none; 
}

.sign-tips {
  text-align: center;
  color: #999;
  font-size: 24rpx;
  margin-top: 12rpx;
}

.sign-status {
  text-align: center;
  color: #52c41a;
  font-size: 26rpx;
  margin-top: 12rpx;
  font-weight: 600;
}

.footer { 
  padding: 12rpx 24rpx 24rpx; 
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
}

.btn-row {
  display: flex;
  gap: 12rpx;
  justify-content: space-between;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
}

.btn-cancel {
  background: #ff4d4f;
}

.btn-clear {
  background: #faad14;
}

.btn-confirm {
  background: #52c41a;
}

.btn-settle {
  background: #1890ff;
}

.btn-disabled {
  background: #d9d9d9 !important;
  color: #999 !important;
}

/* 移动端响应式样式 */
@media screen and (max-width: 480px) {
  .hd {
    font-size: 32rpx;
    padding: 20rpx;
  }
  
  .list {
    padding: 0 20rpx;
    max-height: 250rpx;
  }
  
  .title {
    font-size: 28rpx;
  }
  
  .meta {
    font-size: 24rpx;
  }
  
  .section-title {
    font-size: 28rpx;
    padding: 20rpx;
  }
  
  .chip {
    padding: 12rpx 20rpx;
    font-size: 24rpx;
    margin-right: 16rpx;
  }
  
  .btn-group {
    padding: 20rpx;
    gap: 16rpx;
  }
  
  .btn {
    height: 80rpx;
    font-size: 28rpx;
  }
}

@media screen and (max-width: 375px) {
  .hd {
    font-size: 30rpx;
    padding: 16rpx;
  }
  
  .list {
    padding: 0 16rpx;
    max-height: 200rpx;
  }
  
  .title {
    font-size: 26rpx;
  }
  
  .meta {
    font-size: 22rpx;
  }
  
  .section-title {
    font-size: 26rpx;
    padding: 16rpx;
  }
  
  .chip {
    padding: 10rpx 16rpx;
    font-size: 22rpx;
    margin-right: 12rpx;
  }
  
  .btn-group {
    padding: 16rpx;
    gap: 12rpx;
  }
  
  .btn {
    height: 75rpx;
    font-size: 26rpx;
  }
}

/* 横屏适配 */
@media screen and (orientation: landscape) and (max-height: 500px) {
  .page {
    padding-top: 20px;
    padding-bottom: 10px;
  }
  
  .hd {
    padding: 16rpx;
  }
  
  .list {
    max-height: 150rpx;
  }
  
  .section-title {
    padding: 16rpx;
  }
  
  .btn-group {
    padding: 16rpx;
  }
}
</style>
