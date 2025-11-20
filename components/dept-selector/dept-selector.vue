<template>
  <view class="dept-selector-page">
    <!-- 顶部标题栏 -->
    <page-header title="选择部门"></page-header>

    <!-- 搜索框 -->
    <view class="search-section">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          placeholder="搜索部门名称" 
          v-model="searchKeyword"
          @input="onSearchInput"
        />
        <text v-if="searchKeyword" class="clear-icon" @click="clearSearch">✕</text>
      </view>
    </view>

    <!-- 全选操作 -->
    <view class="select-all-section">
      <view class="select-all-item" @click="toggleSelectAll">
        <view class="checkbox" :class="{ checked: isAllSelected }">
          <text v-if="isAllSelected" class="check-icon">✓</text>
        </view>
        <text class="select-all-text">全选 ({{ selectedDepts.length }}/{{ filteredDepts.length }})</text>
      </view>
      <view class="clear-btn" @click="clearAllSelection">
        <text>清空</text>
      </view>
    </view>

    <!-- 部门列表 -->
    <scroll-view class="dept-list" scroll-y>
      <view v-if="filteredDepts.length === 0" class="empty-state">
        <text class="empty-icon">🏢</text>
        <text class="empty-text">{{ searchKeyword ? '未找到匹配的部门' : '暂无部门数据' }}</text>
      </view>
      
      <view 
        v-for="dept in filteredDepts" 
        :key="dept.id" 
        class="dept-item"
        @click="toggleDept(dept)"
      >
        <view class="dept-info">
          <view class="checkbox" :class="{ checked: isDeptSelected(dept) }">
            <text v-if="isDeptSelected(dept)" class="check-icon">✓</text>
          </view>
          <view class="dept-content">
            <text class="dept-name">{{ dept.name }}</text>
            <text class="dept-desc">{{ dept.description || '暂无描述' }}</text>
          </view>
        </view>
        <view class="dept-count">
          <text class="count-text">{{ dept.memberCount || 0 }}人</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="footer">
      <view class="selected-info">
        <text class="selected-text">已选择 {{ selectedDepts.length }} 个部门</text>
      </view>
      <view class="footer-actions">
        <view class="action-btn cancel-btn" @click="cancelSelection">取消</view>
        <view class="action-btn confirm-btn" @click="confirmSelection">确定</view>
      </view>
    </view>
  </view>
</template>

<script>
import PageHeader from '@/components/page-header/page-header.vue'
import { uiUtils } from '@/common/util.js'

export default {
  components: {
    PageHeader
  },
  
  data() {
    return {
      searchKeyword: '',
      selectedDepts: [],
      allDepts: [
        { id: 1, name: '配料', description: '负责原材料配比和准备', memberCount: 15 },
        { id: 2, name: '制片', description: '负责电池片制造工艺', memberCount: 22 },
        { id: 3, name: '卷绕', description: '负责电池卷绕成型', memberCount: 18 },
        { id: 4, name: '封装', description: '负责电池封装工艺', memberCount: 12 },
        { id: 5, name: '注液', description: '负责电解液注入', memberCount: 8 },
        { id: 6, name: '切边', description: '负责电池切边处理', memberCount: 10 },
        { id: 7, name: '包装', description: '负责产品包装和出库', memberCount: 14 },
        { id: 8, name: '质检', description: '负责产品质量检测', memberCount: 6 },
        { id: 9, name: '仓储', description: '负责物料仓储管理', memberCount: 9 },
        { id: 10, name: '维修', description: '负责设备维护保养', memberCount: 5 }
      ],
      filteredDepts: []
    }
  },

  computed: {
    isAllSelected() {
      return this.filteredDepts.length > 0 && this.selectedDepts.length === this.filteredDepts.length
    }
  },

  onLoad(options) {
    this.filteredDepts = [...this.allDepts]
    
    // 如果有预选的部门，恢复选择状态
    if (options.selected) {
      try {
        const selected = JSON.parse(decodeURIComponent(options.selected))
        this.selectedDepts = selected || []
      } catch (e) {
        console.error('解析预选部门失败:', e)
      }
    }
  },

  methods: {
    onSearchInput() {
      this.filterDepts()
    },

    filterDepts() {
      if (!this.searchKeyword.trim()) {
        this.filteredDepts = [...this.allDepts]
      } else {
        const keyword = this.searchKeyword.toLowerCase()
        this.filteredDepts = this.allDepts.filter(dept => 
          dept.name.toLowerCase().includes(keyword) ||
          (dept.description && dept.description.toLowerCase().includes(keyword))
        )
      }
    },

    clearSearch() {
      this.searchKeyword = ''
      this.filterDepts()
    },

    isDeptSelected(dept) {
      return this.selectedDepts.some(selected => selected.id === dept.id)
    },

    toggleDept(dept) {
      const index = this.selectedDepts.findIndex(selected => selected.id === dept.id)
      if (index > -1) {
        this.selectedDepts.splice(index, 1)
      } else {
        this.selectedDepts.push(dept)
      }
    },

    toggleSelectAll() {
      if (this.isAllSelected) {
        // 取消全选
        this.selectedDepts = this.selectedDepts.filter(selected => 
          !this.filteredDepts.some(filtered => filtered.id === selected.id)
        )
      } else {
        // 全选当前筛选的部门
        this.filteredDepts.forEach(dept => {
          if (!this.isDeptSelected(dept)) {
            this.selectedDepts.push(dept)
          }
        })
      }
    },

    clearAllSelection() {
      this.selectedDepts = []
    },

    cancelSelection() {
      uni.navigateBack()
    },

    confirmSelection() {
      // 获取上一页的实例并设置返回数据
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]

      if (prevPage) {
        if (!prevPage.data) {
          prevPage.data = {}
        }
        prevPage.data.selectedDepts = [...this.selectedDepts]
      }

      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.dept-selector-page {
  min-height: 100vh;
  background: #f5f6fa;
  display: flex;
  flex-direction: column;
}

.search-section {
  padding: 20rpx;
  background: #fff;
  border-bottom: 1rpx solid #e5e6eb;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  border: 1rpx solid #e5e6eb;
}

.search-icon {
  font-size: 28rpx;
  color: #999;
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.clear-icon {
  font-size: 24rpx;
  color: #999;
  padding: 8rpx;
  margin-left: 16rpx;
}

.select-all-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 20rpx;
  background: #fff;
  border-bottom: 1rpx solid #e5e6eb;
}

.select-all-item {
  display: flex;
  align-items: center;
  flex: 1;
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #d9d9d9;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  transition: all 0.3s ease;

  &.checked {
    background: #1890ff;
    border-color: #1890ff;
  }
}

.check-icon {
  font-size: 20rpx;
  color: #fff;
  font-weight: bold;
}

.select-all-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.clear-btn {
  padding: 12rpx 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666;

  &:active {
    background: #e8e8e8;
  }
}

.dept-list {
  flex: 1;
  background: #fff;
  margin: 0 20rpx;
  border-radius: 12rpx;
  max-height: calc(100vh - 300rpx);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
}

.empty-icon {
  font-size: 96rpx;
  margin-bottom: 24rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.dept-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  border-bottom: 1rpx solid #f2f2f2;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #f8f9fa;
  }
}

.dept-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.dept-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.dept-name {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.dept-desc {
  font-size: 24rpx;
  color: #999;
}

.dept-count {
  margin-left: 20rpx;
}

.count-text {
  font-size: 24rpx;
  color: #666;
  background: #f0f0f0;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
}

.footer {
  background: #fff;
  border-top: 1rpx solid #e5e6eb;
  padding: 24rpx 20rpx;
}

.selected-info {
  text-align: center;
  margin-bottom: 16rpx;
}

.selected-text {
  font-size: 26rpx;
  color: #666;
}

.footer-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 600;

  &.cancel-btn {
    background: #f5f5f5;
    color: #666;
    border: 1rpx solid #d9d9d9;
  }

  &.confirm-btn {
    background: #1890ff;
    color: #fff;
  }

  &:active {
    opacity: 0.8;
  }
}
</style>