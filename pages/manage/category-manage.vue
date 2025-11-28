<template>
  <view class="category-manage-page">
    <SafeTop />
    
    <!-- 页面头部 -->
    <view class="header">
      <view class="header-left" @tap="goBack">
        <text class="icon-back">←</text>
      </view>
      <view class="header-title">类别管理</view>
      <view class="header-right">
        <text class="btn-text" @tap="showAddDialog">+ 新增</text>
      </view>
    </view>
    
    <!-- 仓库类型筛选 -->
    <view class="filter-bar">
      <scroll-view class="filter-scroll" scroll-x>
        <view 
          class="filter-item" 
          :class="{ active: filterType === 'all' }"
          @tap="changeFilter('all')"
        >
          全部
        </view>
        <view 
          class="filter-item" 
          :class="{ active: filterType === type.value }"
          v-for="type in warehouseTypes"
          :key="type.value"
          @tap="changeFilter(type.value)"
        >
          {{ type.label }}
        </view>
      </scroll-view>
    </view>
    
    <!-- 类别列表 -->
    <scroll-view class="content" scroll-y>
      <view v-if="filteredCategories.length === 0" class="empty-state">
        <text class="empty-icon">📂</text>
        <text class="empty-text">暂无类别</text>
        <view class="btn-add-empty" @tap="showAddDialog">
          添加类别
        </view>
      </view>
      
      <view v-else class="category-list">
        <view 
          class="category-card" 
          v-for="category in filteredCategories" 
          :key="category._id"
        >
          <view class="category-header">
            <view class="category-info">
              <text class="category-name">{{ category.name }}</text>
              <text class="category-type">{{ getWarehouseTypeName(category.warehouse_type) }}</text>
            </view>
            <view class="category-actions">
              <view class="btn-icon" @tap="showEditDialog(category)">
                <text class="icon">✏️</text>
              </view>
              <view class="btn-icon" @tap="deleteCategory(category)">
                <text class="icon">🗑️</text>
              </view>
            </view>
          </view>
          <view class="category-body" v-if="category.description">
            <text class="category-desc">{{ category.description }}</text>
          </view>
          <view class="category-footer">
            <text class="category-count">{{ category.material_count || 0 }} 个物料</text>
            <text class="category-time">{{ formatTime(category.created_at) }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 新增/编辑弹窗 -->
    <view v-if="showDialog" class="dialog-mask" @tap="closeDialog">
      <view class="dialog-content" @tap.stop>
        <view class="dialog-header">
          <text class="dialog-title">{{ isEdit ? '编辑类别' : '新增类别' }}</text>
          <text class="dialog-close" @tap="closeDialog">×</text>
        </view>
        <view class="dialog-body">
          <view class="form-item required">
            <text class="form-label">类别名称</text>
            <input 
              class="form-input" 
              v-model="formData.name" 
              placeholder="请输入类别名称"
            />
          </view>
          <view class="form-item required">
            <text class="form-label">仓库类型</text>
            <picker 
              mode="selector" 
              :range="warehouseTypes" 
              :range-key="'label'"
              :value="warehouseTypeIndex"
              @change="onWarehouseTypeChange"
            >
              <view class="form-picker">
                <text :class="formData.warehouse_type ? '' : 'placeholder'">
                  {{ formData.warehouse_type ? getWarehouseTypeName(formData.warehouse_type) : '请选择仓库类型' }}
                </text>
                <text class="arrow">›</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">描述</text>
            <textarea 
              class="form-textarea" 
              v-model="formData.description" 
              placeholder="请输入类别描述"
              maxlength="100"
            />
          </view>
        </view>
        <view class="dialog-footer">
          <view class="btn btn-cancel" @tap="closeDialog">取消</view>
          <view class="btn btn-primary" @tap="handleSave">保存</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import SafeTop from '@/components/page-header/SafeTop.vue'
import categoryService from '@/common/services/categoryService.js'

export default {
  components: { SafeTop },
  data() {
    return {
      filterType: 'all',
      categories: [],
      showDialog: false,
      isEdit: false,
      formData: {
        name: '',
        warehouse_type: '',
        description: ''
      },
      editingId: '',
      warehouseTypes: [
        { value: 'main', label: '主材仓' },
        { value: 'workshop', label: '车间仓' },
        { value: 'bom', label: 'BOM仓' },
        { value: 'pack', label: 'PACK仓' },
        { value: 'auxiliary', label: '辅料仓' },
        { value: 'pending', label: '待处理' }
      ],
      warehouseTypeIndex: -1
    }
  },
  computed: {
    filteredCategories() {
      if (this.filterType === 'all') {
        return this.categories
      }
      return this.categories.filter(c => c.warehouse_type === this.filterType)
    }
  },
  onLoad() {
    this.loadCategories()
  },
  methods: {
    async loadCategories() {
      try {
        const result = await categoryService.getCategoryList({})
        if (result.success) {
          this.categories = result.data || []
        }
      } catch (error) {
        console.error('加载类别失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },
    
    changeFilter(type) {
      this.filterType = type
    },
    
    showAddDialog() {
      this.isEdit = false
      this.formData = {
        name: '',
        warehouse_type: '',
        description: ''
      }
      this.warehouseTypeIndex = -1
      this.showDialog = true
    },
    
    showEditDialog(category) {
      this.isEdit = true
      this.editingId = category._id
      this.formData = {
        name: category.name,
        warehouse_type: category.warehouse_type,
        description: category.description || ''
      }
      this.warehouseTypeIndex = this.warehouseTypes.findIndex(
        t => t.value === category.warehouse_type
      )
      this.showDialog = true
    },
    
    closeDialog() {
      this.showDialog = false
    },
    
    onWarehouseTypeChange(e) {
      const index = e.detail.value
      this.warehouseTypeIndex = index
      this.formData.warehouse_type = this.warehouseTypes[index].value
    },
    
    getWarehouseTypeName(type) {
      const item = this.warehouseTypes.find(t => t.value === type)
      return item ? item.label : type
    },
    
    async handleSave() {
      if (!this.formData.name) {
        uni.showToast({ title: '请输入类别名称', icon: 'none' })
        return
      }
      if (!this.formData.warehouse_type) {
        uni.showToast({ title: '请选择仓库类型', icon: 'none' })
        return
      }
      
      try {
        uni.showLoading({ title: '保存中...' })
        
        let result
        if (this.isEdit) {
          result = await categoryService.updateCategory(this.editingId, this.formData)
        } else {
          result = await categoryService.createCategory(this.formData)
        }
        
        if (result.success) {
          uni.showToast({
            title: this.isEdit ? '保存成功' : '创建成功',
            icon: 'success'
          })
          this.closeDialog()
          this.loadCategories()
        } else {
          uni.showToast({
            title: result.message || '保存失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('保存类别失败:', error)
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    deleteCategory(category) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除类别"${category.name}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({ title: '删除中...' })
              const result = await categoryService.deleteCategory(category._id)
              if (result.success) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                this.loadCategories()
              } else {
                uni.showToast({
                  title: result.message || '删除失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              console.error('删除类别失败:', error)
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            } finally {
              uni.hideLoading()
            }
          }
        }
      })
    },
    
    formatTime(timestamp) {
      if (!timestamp) return '-'
      const date = new Date(timestamp)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    },
    
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.category-manage-page {
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.header-left, .header-right {
  width: 120rpx;
}

.icon-back {
  font-size: 40rpx;
  color: #333;
}

.header-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.btn-text {
  font-size: 28rpx;
  color: #FF6B00;
}

.filter-bar {
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.filter-scroll {
  white-space: nowrap;
  padding: 16rpx 20rpx;
}

.filter-item {
  display: inline-block;
  padding: 12rpx 24rpx;
  margin-right: 16rpx;
  background-color: #f5f5f5;
  color: #666;
  border-radius: 20rpx;
  font-size: 26rpx;
}

.filter-item.active {
  background-color: #FF6B00;
  color: #fff;
}

.content {
  flex: 1;
  padding: 20rpx;
}

.empty-state {
  padding: 150rpx 0;
  text-align: center;
}

.empty-icon {
  font-size: 120rpx;
  display: block;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  display: block;
  margin-bottom: 40rpx;
}

.btn-add-empty {
  display: inline-block;
  padding: 16rpx 48rpx;
  background-color: #FF6B00;
  color: #fff;
  border-radius: 48rpx;
  font-size: 28rpx;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.category-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.category-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.category-type {
  display: inline-block;
  padding: 6rpx 16rpx;
  background-color: #e6f7ff;
  color: #1890ff;
  border-radius: 8rpx;
  font-size: 22rpx;
}

.category-actions {
  display: flex;
  gap: 16rpx;
}

.btn-icon {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 50%;
}

.icon {
  font-size: 28rpx;
}

.category-body {
  padding: 16rpx 0;
  border-top: 1rpx solid #f5f5f5;
  border-bottom: 1rpx solid #f5f5f5;
  margin-bottom: 16rpx;
}

.category-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

.category-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-count {
  font-size: 24rpx;
  color: #FF6B00;
}

.category-time {
  font-size: 22rpx;
  color: #999;
}

.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  width: 640rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.dialog-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.dialog-close {
  font-size: 48rpx;
  color: #999;
  line-height: 1;
}

.dialog-body {
  padding: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-item.required .form-label::before {
  content: '*';
  color: #ff4d4f;
  margin-right: 8rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  height: 72rpx;
  padding: 0 24rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.form-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72rpx;
  padding: 0 24rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.placeholder {
  color: #999;
}

.arrow {
  font-size: 40rpx;
  color: #999;
  transform: rotate(90deg);
}

.form-textarea {
  width: 100%;
  min-height: 150rpx;
  padding: 16rpx 24rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.dialog-footer {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 30rpx 30rpx;
}

.btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 72rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #666;
}

.btn-primary {
  background-color: #FF6B00;
  color: #fff;
}
</style>
