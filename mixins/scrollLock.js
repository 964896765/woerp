/**
 * 滚动锁定混入 - 处理横纵滑动冲突
 * 通过检测初始滑动方向来决定锁定哪个轴向
 */
export default {
	data() {
		return {
			// 滑动锁定状态
			scrollLock: {
				startX: 0,
				startY: 0,
				isTracking: false,
				lockedDirection: null, // 'x' | 'y' | null
				threshold: 12 // 判断阈值，可通过props覆盖
			}
		}
	},
	
	methods: {
		/**
		 * 开始触摸跟踪
		 */
		startScrollTracking(e) {
			const touch = e.touches[0] || e.changedTouches[0]
			this.scrollLock.startX = touch.clientX
			this.scrollLock.startY = touch.clientY
			this.scrollLock.isTracking = true
			this.scrollLock.lockedDirection = null
		},
		
		/**
		 * 处理触摸移动，判断滑动方向
		 */
		handleScrollMove(e) {
			if (!this.scrollLock.isTracking) return false
			
			const touch = e.touches[0] || e.changedTouches[0]
			const deltaX = Math.abs(touch.clientX - this.scrollLock.startX)
			const deltaY = Math.abs(touch.clientY - this.scrollLock.startY)
			const threshold = this.lockThreshold || this.scrollLock.threshold
			
			// 如果移动距离小于阈值，不做判断
			if (deltaX < threshold && deltaY < threshold) {
				return false
			}
			
			// 判断主要滑动方向
			if (!this.scrollLock.lockedDirection) {
				if (deltaX > deltaY) {
					this.scrollLock.lockedDirection = 'x'
				} else {
					this.scrollLock.lockedDirection = 'y'
				}
			}
			
			return this.scrollLock.lockedDirection
		},
		
		/**
		 * 结束触摸跟踪
		 */
		endScrollTracking() {
			this.scrollLock.isTracking = false
			this.scrollLock.lockedDirection = null
		},
		
		/**
		 * 重置滚动锁定状态
		 */
		resetScrollLock() {
			this.scrollLock.startX = 0
			this.scrollLock.startY = 0
			this.scrollLock.isTracking = false
			this.scrollLock.lockedDirection = null
		},
		
		/**
		 * 检查是否应该锁定横向滚动
		 */
		shouldLockHorizontal() {
			return this.scrollLock.lockedDirection === 'y'
		},
		
		/**
		 * 检查是否应该锁定纵向滚动
		 */
		shouldLockVertical() {
			return this.scrollLock.lockedDirection === 'x'
		}
	}
}