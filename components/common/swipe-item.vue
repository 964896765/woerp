<template>
  <view class="swipe-item" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd" @touchcancel="onTouchEnd">
    <view class="swipe-content" :style="contentStyle">
      <slot></slot>
    </view>
    <view class="swipe-actions" :style="actionsStyle">
      <view 
        v-for="(action, index) in actions" 
        :key="index"
        class="action-btn"
        :class="action.type"
        :style="{ width: action.width || '150rpx', background: action.background || '#f56c6c' }"
        @click.stop="handleAction(action)"
      >
        <text class="action-text">{{ action.text }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SwipeItem',
  
  props: {
    // 操作按钮配置
    actions: {
      type: Array,
      default: () => [{
        text: '删除',
        type: 'delete',
        background: '#f56c6c',
        width: '150rpx'
      }]
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      startX: 0,
      startY: 0,
      offsetX: 0,
      maxOffset: 0,
      isMoving: false,
      direction: '' // 'horizontal' or 'vertical'
    }
  },
  
  computed: {
    contentStyle() {
      return {
        transform: `translateX(${this.offsetX}px)`,
        transition: this.isMoving ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }
    },
    
    actionsStyle() {
      return {
        right: `${-this.maxOffset}px`,
        width: `${Math.abs(this.maxOffset)}px`
      }
    }
  },
  
  mounted() {
    this.calculateMaxOffset()
  },
  
  methods: {
    calculateMaxOffset() {
      let totalWidth = 0
      this.actions.forEach(action => {
        const width = action.width || '150rpx'
        totalWidth += uni.upx2px(parseInt(width))
      })
      this.maxOffset = -totalWidth
    },
    
    onTouchStart(e) {
      if (this.disabled) return
      
      this.startX = e.touches[0].clientX
      this.startY = e.touches[0].clientY
      this.isMoving = true
      this.direction = ''
    },
    
    onTouchMove(e) {
      if (this.disabled) return
      
      const currentX = e.touches[0].clientX
      const currentY = e.touches[0].clientY
      const deltaX = currentX - this.startX
      const deltaY = currentY - this.startY
      
      // 判断滑动方向
      if (!this.direction) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          this.direction = 'horizontal'
        } else {
          this.direction = 'vertical'
          return
        }
      }
      
      // 只处理水平滑动
      if (this.direction === 'horizontal') {
        // 阻止页面滚动
        e.preventDefault()
        
        // 计算新的偏移量
        let newOffsetX = this.offsetX + deltaX
        
        // 限制滑动范围
        if (newOffsetX > 0) {
          // 右滑超出，添加阻尼效果
          newOffsetX = newOffsetX * 0.3
        } else if (newOffsetX < this.maxOffset) {
          // 左滑超出，添加阻尼效果
          newOffsetX = this.maxOffset + (newOffsetX - this.maxOffset) * 0.3
        }
        
        this.offsetX = newOffsetX
        this.startX = currentX
      }
    },
    
    onTouchEnd(e) {
      if (this.disabled) return
      
      this.isMoving = false
      
      // 判断是否打开或关闭
      if (this.offsetX < this.maxOffset / 2) {
        // 打开
        this.offsetX = this.maxOffset
      } else {
        // 关闭
        this.offsetX = 0
      }
      
      this.direction = ''
    },
    
    handleAction(action) {
      // 关闭滑动
      this.close()
      
      // 触发事件
      this.$emit('action', action)
      
      // 触发特定事件
      if (action.type === 'delete') {
        this.$emit('delete')
      }
    },
    
    // 公开方法：关闭滑动
    close() {
      this.offsetX = 0
    },
    
    // 公开方法：打开滑动
    open() {
      this.offsetX = this.maxOffset
    }
  }
}
</script>

<style scoped>
.swipe-item {
  position: relative;
  overflow: hidden;
  background: #fff;
}

.swipe-content {
  position: relative;
  z-index: 2;
  background: #fff;
  will-change: transform;
}

.swipe-actions {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: stretch;
  z-index: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28rpx;
  flex-shrink: 0;
}

.action-btn.delete {
  background: #f56c6c;
}

.action-btn.edit {
  background: #409eff;
}

.action-btn.archive {
  background: #e6a23c;
}

.action-text {
  color: #fff;
}
</style>
