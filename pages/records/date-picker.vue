<template>
  <view class="date-picker-page">
    <!-- 顶部标题栏 -->
    <page-header :title="isStartDate ? '选择开始日期' : '选择结束日期'"></page-header>

    <!-- 当前选中的日期显示 -->
    <view class="current-date-section">
      <text class="current-label">当前选择：</text>
      <text class="current-date">{{ formatSelectedDate() }}</text>
    </view>

    <!-- 日期选择器 -->
    <view class="picker-section">
      <picker
        mode="date"
        :value="currentDate"
        :start="dateRange.start"
        :end="dateRange.end"
        @change="onDateChange"
      >
        <view class="picker-display">
          <text class="picker-text">{{ formatPickerDate(currentDate) }}</text>
          <text class="picker-icon">▼</text>
        </view>
      </picker>
    </view>

    <!-- 快捷选择 -->
    <view class="quick-select-section">
      <text class="section-title">快捷选择</text>
      <view class="quick-buttons">
        <view
          v-for="option in quickOptions"
          :key="option.key"
          class="quick-btn"
          @click="selectQuickDate(option)"
        >
          {{ option.label }}
        </view>
      </view>
    </view>

    <!-- 确认按钮 -->
    <view class="footer">
      <view class="confirm-btn" @click="confirmSelection">确定</view>
    </view>
  </view>
</template>

<script>
import PageHeader from '@/components/page-header/page-header.vue'
import { dateUtils, uiUtils } from '@/common/util.js'

export default {
  components: {
    PageHeader
  },
  data() {
    const today = new Date()
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
    const oneYearLater = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())

    return {
      // 页面参数
      isStartDate: true,
      currentDate: dateUtils.formatDateForPicker(today),

      // 日期范围限制
      dateRange: {
        start: dateUtils.formatDateForPicker(oneYearAgo),
        end: dateUtils.formatDateForPicker(oneYearLater)
      },

      // 快捷选择选项
      quickOptions: [
        { key: 'today', label: '今天', days: 0 },
        { key: 'yesterday', label: '昨天', days: -1 },
        { key: 'this_week', label: '本周', type: 'week', offset: 0 },
        { key: 'last_week', label: '上周', type: 'week', offset: -1 },
        { key: 'this_month', label: '本月', type: 'month', offset: 0 },
        { key: 'last_month', label: '上月', type: 'month', offset: -1 },
        { key: 'last_7_days', label: '近7天', days: -7 },
        { key: 'last_30_days', label: '近30天', days: -30 },
        { key: 'last_90_days', label: '近90天', days: -90 }
      ],

      // 选中的日期
      selectedDate: null
    }
  },

  onLoad(options) {
    if (options.type) {
      this.isStartDate = options.type === 'start'
    }

    if (options.current) {
      this.selectedDate = options.current
      this.currentDate = options.current
    } else {
      this.selectedDate = dateUtils.formatDate(new Date())
      this.currentDate = dateUtils.formatDateForPicker(new Date())
    }
  },

  methods: {



    formatSelectedDate() {
      if (!this.selectedDate) return '请选择日期'
      return this.selectedDate
    },

    formatPickerDate(dateString) {
      if (!dateString) return '请选择日期'
      const date = new Date(dateString)
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const weekday = weekdays[date.getDay()]

      return `${year}年${month}月${day}日 ${weekday}`
    },

    onDateChange(e) {
      this.currentDate = e.detail.value
      this.selectedDate = dateUtils.formatDate(new Date(e.detail.value))
    },

    selectQuickDate(option) {
      const today = new Date()
      let targetDate

      if (option.days !== undefined) {
        // 简单的天数偏移
        targetDate = new Date(today.getTime() + option.days * 24 * 60 * 60 * 1000)
      } else if (option.type === 'week') {
        // 周范围选择
        const currentDay = today.getDay()
        const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay // 获取本周一
        const monday = new Date(today.getTime() + mondayOffset * 24 * 60 * 60 * 1000)
        targetDate = new Date(monday.getTime() + option.offset * 7 * 24 * 60 * 60 * 1000)
      } else if (option.type === 'month') {
        // 月范围选择
        targetDate = new Date(today.getFullYear(), today.getMonth() + option.offset, 1)
      } else {
        targetDate = today
      }

      this.currentDate = dateUtils.formatDateForPicker(targetDate)
      this.selectedDate = dateUtils.formatDate(targetDate)
    },

    confirmSelection() {
      if (!this.selectedDate) {
        uiUtils.showToast('请选择日期')
        return
      }

      // 日期范围验证
      const selectedTime = new Date(this.selectedDate).getTime()
      const pages = getCurrentPages()
      const recordsPage = pages[pages.length - 2] // 上一页是记录页面

      if (recordsPage) {
        // 验证开始日期不能晚于结束日期
        if (this.isStartDate && recordsPage.endDate) {
          const endTime = new Date(recordsPage.endDate).getTime()
          if (selectedTime > endTime) {
            uiUtils.showToast('开始日期不能晚于结束日期')
            return
          }
        }
        
        // 验证结束日期不能早于开始日期
        if (!this.isStartDate && recordsPage.startDate) {
          const startTime = new Date(recordsPage.startDate).getTime()
          if (selectedTime < startTime) {
            uiUtils.showToast('结束日期不能早于开始日期')
            return
          }
        }

        // 验证日期范围不能超过1年
        if (this.isStartDate && recordsPage.endDate) {
          const endTime = new Date(recordsPage.endDate).getTime()
          const daysDiff = (endTime - selectedTime) / (24 * 60 * 60 * 1000)
          if (daysDiff > 365) {
            uiUtils.showToast('日期范围不能超过1年')
            return
          }
        }
        
        if (!this.isStartDate && recordsPage.startDate) {
          const startTime = new Date(recordsPage.startDate).getTime()
          const daysDiff = (selectedTime - startTime) / (24 * 60 * 60 * 1000)
          if (daysDiff > 365) {
            uiUtils.showToast('日期范围不能超过1年')
            return
          }
        }

        // 设置返回数据
        if (!recordsPage.data) {
          recordsPage.data = {}
        }
        recordsPage.data.selectedDate = {
          type: this.isStartDate ? 'start' : 'end',
          date: this.selectedDate
        }
      }

      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.date-picker-page {
  min-height: 100vh;
  background: #f5f6fa;
  display: flex;
  flex-direction: column;
}



.current-date-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx 24rpx;
  background: #fff;
  margin: 20rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.current-label {
  font-size: 28rpx;
  color: #666;
  margin-right: 16rpx;
}

.current-date {
  font-size: 32rpx;
  font-weight: 600;
  color: #1890ff;
}

.picker-section {
  background: #fff;
  margin: 0 20rpx 20rpx;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.picker-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  border: 2rpx solid #e5e6eb;
  border-radius: 8rpx;
  background: #f8f9fa;
}

.picker-text {
  font-size: 30rpx;
  color: #333;
}

.picker-icon {
  font-size: 24rpx;
  color: #999;
}

.quick-select-section {
  background: #fff;
  margin: 0 20rpx;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
  }
}

.quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.quick-btn {
  padding: 16rpx 24rpx;
  background: #f0f9ff;
  border: 1rpx solid #91d5ff;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #1890ff;
  text-align: center;

  &:active {
    background: #e6f7ff;
    opacity: 0.8;
  }
}

.footer {
  padding: 24rpx 20rpx;
  background: #fff;
  border-top: 1rpx solid #e5e6eb;
}

.confirm-btn {
  height: 88rpx;
  background: #1890ff;
  color: #fff;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 600;

  &:active {
    opacity: 0.8;
  }
}
</style>
