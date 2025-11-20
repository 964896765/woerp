<template>
  <view class="category-selector-page">
    <!-- 顶部标题栏 -->
    <page-header title="选择类别"></page-header>

    <!-- 搜索框 -->
    <view class="search-section">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          placeholder="搜索类别名称" 
          v-model="searchKeyword"
          @input="onSearchInput"
        />
        <text v-if="searchKeyword" class="clear-icon" @click="clearSearch">✕</text>
      </view>
    </view>

    <!-- 分类导航 -->
    <view class="category-nav">
      <scroll-view class="nav-scroll" scroll-x>
        <view class="nav-tabs">
          <view 
            v-for="(category, index) in mainCategories" 
            :key="category.id"
            class="nav-tab"
            :class="{ active: currentCategoryId === category.id }"
            @click="switchCategory(category)"
          >
            <text class="tab-text">{{ category.name }}</text>
            <text class="tab-count">({{ category.children ? category.children.length : 0 }})</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 全选操作 -->
    <view class="select-all-section">
      <view class="select-all-item" @click="toggleSelectAll">
        <view class="checkbox" :class="{ checked: isAllSelected }">
          <text v-if="isAllSelected" class="check-icon">✓</text>
        </view>
        <text class="select-all-text">全选当前分类 ({{ selectedCategories.length }}/{{ filteredSubCategories.length }})</text>
      </view>
      <view class="clear-btn" @click="clearAllSelection">
        <text>清空</text>
      </view>
    </view>

    <!-- 子类别列表 -->
    <scroll-view class="category-list" scroll-y>
      <view v-if="filteredSubCategories.length === 0" class="empty-state">
        <text class="empty-icon">📂</text>
        <text class="empty-text">{{ searchKeyword ? '未找到匹配的类别' : '该分类下暂无子类别' }}</text>
      </view>
      
      <view 
        v-for="subCategory in filteredSubCategories" 
        :key="subCategory.id" 
        class="category-item"
        @click="toggleCategory(subCategory)"
      >
        <view class="category-info">
          <view class="checkbox" :class="{ checked: isCategorySelected(subCategory) }">
            <text v-if="isCategorySelected(subCategory)" class="check-icon">✓</text>
          </view>
          <view class="category-content">
            <text class="category-name">{{ subCategory.name }}</text>
            <text class="category-desc">{{ subCategory.description || '暂无描述' }}</text>
            <view class="category-tags">
              <text class="tag">{{ subCategory.parentName }}</text>
              <text v-if="subCategory.code" class="tag code-tag">{{ subCategory.code }}</text>
            </view>
          </view>
        </view>
        <view class="category-status">
          <text class="status-text" :class="subCategory.status">{{ getStatusText(subCategory.status) }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="footer">
      <view class="selected-info">
        <text class="selected-text">已选择 {{ selectedCategories.length }} 个类别</text>
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

export default {
  components: {
    PageHeader
  },
  
  data() {
    return {
      searchKeyword: '',
      selectedCategories: [],
      currentCategoryId: 1,
      allCategories: [
        {
          id: 1,
          name: '原材料',
          children: [
            { id: 11, name: '正极材料', description: '锂电池正极活性材料', code: 'PM001', status: 'active', parentName: '原材料' },
            { id: 12, name: '负极材料', description: '锂电池负极活性材料', code: 'NM001', status: 'active', parentName: '原材料' },
            { id: 13, name: '电解液', description: '锂电池电解液', code: 'EL001', status: 'active', parentName: '原材料' },
            { id: 14, name: '隔膜', description: '锂电池隔膜材料', code: 'SP001', status: 'active', parentName: '原材料' },
            { id: 15, name: '集流体', description: '铜箔、铝箔等集流体', code: 'CC001', status: 'inactive', parentName: '原材料' }
          ]
        },
        {
          id: 2,
          name: '半成品',
          children: [
            { id: 21, name: '正极片', description: '涂布后的正极片', code: 'PS001', status: 'active', parentName: '半成品' },
            { id: 22, name: '负极片', description: '涂布后的负极片', code: 'NS001', status: 'active', parentName: '半成品' },
            { id: 23, name: '电芯', description: '卷绕后的电芯', code: 'CE001', status: 'active', parentName: '半成品' },
            { id: 24, name: '模组', description: '组装后的电池模组', code: 'MD001', status: 'active', parentName: '半成品' }
          ]
        },
        {
          id: 3,
          name: '成品',
          children: [
            { id: 31, name: '圆柱电池', description: '18650、21700等圆柱电池', code: 'CB001', status: 'active', parentName: '成品' },
            { id: 32, name: '方形电池', description: '方形硬壳电池', code: 'PB001', status: 'active', parentName: '成品' },
            { id: 33, name: '软包电池', description: '软包装电池', code: 'PO001', status: 'active', parentName: '成品' },
            { id: 34, name: '电池包', description: '完整的电池包系统', code: 'BP001', status: 'active', parentName: '成品' }
          ]
        },
        {
          id: 4,
          name: '辅料',
          children: [
            { id: 41, name: '导电剂', description: '提高导电性的添加剂', code: 'CA001', status: 'active', parentName: '辅料' },
            { id: 42, name: '粘结剂', description: '电极材料粘结剂', code: 'BI001', status: 'active', parentName: '辅料' },
            { id: 43, name: '溶剂', description: '浆料制备溶剂', code: 'SO001', status: 'active', parentName: '辅料' },
            { id: 44, name: '添加剂', description: '电解液添加剂', code: 'AD001', status: 'inactive', parentName: '辅料' }
          ]
        },
        {
          id: 5,
          name: '包装材料',
          children: [
            { id: 51, name: '铝塑膜', description: '软包电池外包装', code: 'AF001', status: 'active', parentName: '包装材料' },
            { id: 52, name: '钢壳', description: '圆柱电池钢壳', code: 'SC001', status: 'active', parentName: '包装材料' },
            { id: 53, name: '铝壳', description: '方形电池铝壳', code: 'AC001', status: 'active', parentName: '包装材料' },
            { id: 54, name: '标签', description: '产品标识标签', code: 'LB001', status: 'active', parentName: '包装材料' }
          ]
        }
      ]
    }
  },

  computed: {
    mainCategories() {
      return this.allCategories
    },

    currentCategory() {
      return this.allCategories.find(cat => cat.id === this.currentCategoryId)
    },

    currentSubCategories() {
      return this.currentCategory ? this.currentCategory.children || [] : []
    },

    filteredSubCategories() {
      if (!this.searchKeyword.trim()) {
        return this.currentSubCategories
      }
      
      const keyword = this.searchKeyword.toLowerCase()
      let filtered = []
      
      // 如果有搜索关键词，搜索所有分类
      this.allCategories.forEach(category => {
        if (category.children) {
          const matchedChildren = category.children.filter(child =>
            child.name.toLowerCase().includes(keyword) ||
            (child.description && child.description.toLowerCase().includes(keyword)) ||
            (child.code && child.code.toLowerCase().includes(keyword))
          )
          filtered = filtered.concat(matchedChildren)
        }
      })
      
      return filtered
    },

    isAllSelected() {
      return this.filteredSubCategories.length > 0 && 
             this.filteredSubCategories.every(cat => this.isCategorySelected(cat))
    }
  },

  onLoad(options) {
    // 如果有预选的类别，恢复选择状态
    if (options.selected) {
      try {
        const selected = JSON.parse(decodeURIComponent(options.selected))
        this.selectedCategories = selected || []
      } catch (e) {
        console.error('解析预选类别失败:', e)
      }
    }
  },

  methods: {
    onSearchInput() {
      // 搜索时自动切换到显示所有结果
    },

    clearSearch() {
      this.searchKeyword = ''
    },

    switchCategory(category) {
      this.currentCategoryId = category.id
      this.searchKeyword = '' // 切换分类时清空搜索
    },

    isCategorySelected(category) {
      return this.selectedCategories.some(selected => selected.id === category.id)
    },

    toggleCategory(category) {
      const index = this.selectedCategories.findIndex(selected => selected.id === category.id)
      if (index > -1) {
        this.selectedCategories.splice(index, 1)
      } else {
        this.selectedCategories.push(category)
      }
    },

    toggleSelectAll() {
      if (this.isAllSelected) {
        // 取消全选当前筛选的类别
        this.selectedCategories = this.selectedCategories.filter(selected => 
          !this.filteredSubCategories.some(filtered => filtered.id === selected.id)
        )
      } else {
        // 全选当前筛选的类别
        this.filteredSubCategories.forEach(category => {
          if (!this.isCategorySelected(category)) {
            this.selectedCategories.push(category)
          }
        })
      }
    },

    clearAllSelection() {
      this.selectedCategories = []
    },

    getStatusText(status) {
      return status === 'active' ? '启用' : '停用'
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
        prevPage.data.selectedCategories = [...this.selectedCategories]
      }

      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.category-selector-page {
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

.category-nav {
  background: #fff;
  border-bottom: 1rpx solid #e5e6eb;
}

.nav-scroll {
  white-space: nowrap;
}

.nav-tabs {
  display: flex;
  padding: 0 20rpx;
}

.nav-tab {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  margin-right: 16rpx;
  border-radius: 12rpx;
  background: #f8f9fa;
  border: 1rpx solid #e5e6eb;
  transition: all 0.3s ease;

  &.active {
    background: #1890ff;
    border-color: #1890ff;

    .tab-text, .tab-count {
      color: #fff;
    }
  }
}

.tab-text {
  font-size: 28rpx;
  color: #333;
  margin-right: 8rpx;
}

.tab-count {
  font-size: 24rpx;
  color: #666;
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

.category-list {
  flex: 1;
  background: #fff;
  margin: 0 20rpx;
  border-radius: 12rpx;
  max-height: calc(100vh - 400rpx);
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

.category-item {
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

.category-info {
  display: flex;
  align-items: flex-start;
  flex: 1;
}

.category-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.category-name {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.category-desc {
  font-size: 24rpx;
  color: #999;
}

.category-tags {
  display: flex;
  gap: 12rpx;
  margin-top: 8rpx;
}

.tag {
  font-size: 20rpx;
  color: #666;
  background: #f0f0f0;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;

  &.code-tag {
    background: #e6f7ff;
    color: #1890ff;
  }
}

.category-status {
  margin-left: 20rpx;
}

.status-text {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;

  &.active {
    background: #f6ffed;
    color: #52c41a;
  }

  &.inactive {
    background: #fff2e8;
    color: #fa8c16;
  }
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