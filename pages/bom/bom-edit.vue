<template>
  <view class="bom-edit-page">
    <SafeTop />
    
    <!-- 页面头部 -->
    <view class="header">
      <view class="header-left" @tap="goBack">
        <text class="icon-back">←</text>
      </view>
      <view class="header-title">{{ isEdit ? '编辑BOM' : '新增BOM' }}</view>
      <view class="header-right">
        <text class="btn-text" @tap="handleSave">保存</text>
      </view>
    </view>
    
    <!-- 表单内容 -->
    <scroll-view class="content" scroll-y>
      <!-- 基本信息 -->
      <view class="form-section">
        <view class="section-title">基本信息</view>
        
        <view class="form-item required">
          <text class="form-label">BOM编码</text>
          <input 
            class="form-input" 
            v-model="formData.code" 
            placeholder="请输入BOM编码"
            :disabled="isEdit"
          />
        </view>
        
        <view class="form-item required">
          <text class="form-label">BOM名称</text>
          <input 
            class="form-input" 
            v-model="formData.name" 
            placeholder="请输入BOM名称"
          />
        </view>
        
        <view class="form-item required">
          <text class="form-label">版本号</text>
          <input 
            class="form-input" 
            v-model="formData.version" 
            placeholder="请输入版本号（如：V1.0）"
          />
        </view>
        
        <view class="form-item required">
          <text class="form-label">产品名称</text>
          <input 
            class="form-input" 
            v-model="formData.product_name" 
            placeholder="请输入产品名称"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">产品规格</text>
          <input 
            class="form-input" 
            v-model="formData.product_spec" 
            placeholder="请输入产品规格"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">状态</text>
          <switch 
            :checked="formData.status === 'active'" 
            @change="onStatusChange"
            color="#FF6B00"
          />
          <text class="status-text">{{ formData.status === 'active' ? '正常' : '停用' }}</text>
        </view>
        
        <view class="form-item">
          <text class="form-label">备注</text>
          <textarea 
            class="form-textarea" 
            v-model="formData.description" 
            placeholder="请输入备注信息"
            maxlength="200"
          />
        </view>
      </view>
      
      <!-- 物料明细 -->
      <view class="form-section">
        <view class="section-header">
          <text class="section-title">物料明细（{{ items.length }}）</text>
          <view class="btn-add" @tap="showMaterialPicker">
            <text class="btn-icon">+</text>
            <text class="btn-text">添加物料</text>
          </view>
        </view>
        
        <view v-if="items.length === 0" class="empty-items">
          <text class="empty-text">暂无物料明细，请点击"添加物料"按钮</text>
        </view>
        
        <view v-else class="items-list">
          <view class="item-card" v-for="(item, index) in items" :key="index">
            <view class="item-header">
              <view class="item-info">
                <text class="item-name">{{ item.material_name }}</text>
                <text class="item-spec">{{ item.material_spec }}</text>
              </view>
              <view class="btn-delete" @tap="deleteItem(index)">
                <text class="delete-icon">×</text>
              </view>
            </view>
            <view class="item-body">
              <view class="quantity-input">
                <text class="quantity-label">用量：</text>
                <input 
                  class="quantity-field" 
                  type="digit"
                  v-model="item.quantity" 
                  placeholder="请输入用量"
                />
                <text class="quantity-unit">{{ item.unit }}</text>
              </view>
              <view class="sort-input">
                <text class="sort-label">排序：</text>
                <input 
                  class="sort-field" 
                  type="number"
                  v-model="item.sort_order" 
                  placeholder="序号"
                />
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </scroll-view>
    
    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="btn btn-cancel" @tap="goBack">
        取消
      </view>
      <view class="btn btn-primary" @tap="handleSave">
        保存
      </view>
    </view>
    
    <!-- 物料选择器弹窗 -->
    <view v-if="showPicker" class="picker-modal" @tap="closePicker">
      <view class="picker-content" @tap.stop>
        <view class="picker-header">
          <text class="picker-title">选择物料</text>
          <text class="picker-close" @tap="closePicker">×</text>
        </view>
        <view class="picker-search">
          <input 
            class="search-input" 
            v-model="searchKeyword" 
            placeholder="搜索物料名称或编码"
            @input="searchMaterials"
          />
        </view>
        <scroll-view class="picker-list" scroll-y>
          <view 
            class="picker-item" 
            v-for="material in filteredMaterials" 
            :key="material._id"
            @tap="selectMaterial(material)"
          >
            <view class="material-info">
              <text class="material-name">{{ material.name }}</text>
              <text class="material-code">{{ material.code }}</text>
            </view>
            <text class="material-spec">{{ material.spec }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import SafeTop from '@/components/page-header/SafeTop.vue'
import bomService from '@/common/services/bomService.js'
import materialService from '@/common/services/materialService.js'

export default {
  components: {
    SafeTop
  },
  data() {
    return {
      isEdit: false,
      bomId: '',
      formData: {
        code: '',
        name: '',
        version: '',
        product_name: '',
        product_spec: '',
        status: 'active',
        description: ''
      },
      items: [],
      showPicker: false,
      allMaterials: [],
      filteredMaterials: [],
      searchKeyword: ''
    }
  },
  onLoad(options) {
    if (options.id) {
      this.isEdit = true
      this.bomId = options.id
      this.loadBomDetail()
    }
    this.loadMaterials()
  },
  methods: {
    async loadBomDetail() {
      try {
        uni.showLoading({ title: '加载中...' })
        const result = await bomService.getBomDetail(this.bomId)
        if (result.success) {
          this.formData = { ...result.data.header }
          this.items = result.data.items || []
        } else {
          uni.showToast({
            title: result.message || '加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('加载BOM详情失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    async loadMaterials() {
      try {
        const result = await materialService.getMaterialList({
          page: 1,
          pageSize: 1000
        })
        if (result.success) {
          this.allMaterials = result.data || []
          this.filteredMaterials = this.allMaterials
        }
      } catch (error) {
        console.error('加载物料列表失败:', error)
      }
    },
    
    onStatusChange(e) {
      this.formData.status = e.detail.value ? 'active' : 'inactive'
    },
    
    showMaterialPicker() {
      this.showPicker = true
      this.searchKeyword = ''
      this.filteredMaterials = this.allMaterials
    },
    
    closePicker() {
      this.showPicker = false
    },
    
    searchMaterials() {
      const keyword = this.searchKeyword.toLowerCase()
      if (!keyword) {
        this.filteredMaterials = this.allMaterials
        return
      }
      this.filteredMaterials = this.allMaterials.filter(m => 
        m.name.toLowerCase().includes(keyword) || 
        m.code.toLowerCase().includes(keyword)
      )
    },
    
    selectMaterial(material) {
      // 检查是否已添加
      const exists = this.items.some(item => item.material_id === material._id)
      if (exists) {
        uni.showToast({
          title: '该物料已添加',
          icon: 'none'
        })
        return
      }
      
      // 添加到明细列表
      this.items.push({
        material_id: material._id,
        material_code: material.code,
        material_name: material.name,
        material_spec: material.spec,
        quantity: 1,
        unit: material.unit,
        sort_order: this.items.length + 1
      })
      
      this.closePicker()
      uni.showToast({
        title: '添加成功',
        icon: 'success'
      })
    },
    
    deleteItem(index) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除该物料吗？',
        success: (res) => {
          if (res.confirm) {
            this.items.splice(index, 1)
            // 重新排序
            this.items.forEach((item, i) => {
              item.sort_order = i + 1
            })
          }
        }
      })
    },
    
    validateForm() {
      if (!this.formData.code) {
        uni.showToast({ title: '请输入BOM编码', icon: 'none' })
        return false
      }
      if (!this.formData.name) {
        uni.showToast({ title: '请输入BOM名称', icon: 'none' })
        return false
      }
      if (!this.formData.version) {
        uni.showToast({ title: '请输入版本号', icon: 'none' })
        return false
      }
      if (!this.formData.product_name) {
        uni.showToast({ title: '请输入产品名称', icon: 'none' })
        return false
      }
      if (this.items.length === 0) {
        uni.showToast({ title: '请至少添加一个物料', icon: 'none' })
        return false
      }
      
      // 验证物料用量
      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i]
        if (!item.quantity || Number(item.quantity) <= 0) {
          uni.showToast({ 
            title: `请输入${item.material_name}的用量`, 
            icon: 'none' 
          })
          return false
        }
      }
      
      return true
    },
    
    async handleSave() {
      if (!this.validateForm()) return
      
      try {
        uni.showLoading({ title: '保存中...' })
        
        const data = {
          ...this.formData,
          items_count: this.items.length,
          items: this.items.map(item => ({
            ...item,
            quantity: Number(item.quantity),
            sort_order: Number(item.sort_order)
          }))
        }
        
        let result
        if (this.isEdit) {
          result = await bomService.updateBom(this.bomId, data)
        } else {
          result = await bomService.createBom(data)
        }
        
        if (result.success) {
          uni.showToast({
            title: this.isEdit ? '保存成功' : '创建成功',
            icon: 'success'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: result.message || '保存失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('保存BOM失败:', error)
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.bom-edit-page {
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

.content {
  flex: 1;
  padding: 20rpx;
}

.form-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 30rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background-color: #FF6B00;
  color: #fff;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.btn-icon {
  font-size: 32rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.form-item:last-child {
  border-bottom: none;
}

.form-item.required .form-label::before {
  content: '*';
  color: #ff4d4f;
  margin-right: 8rpx;
}

.form-label {
  width: 180rpx;
  font-size: 28rpx;
  color: #333;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.status-text {
  margin-left: 20rpx;
  font-size: 28rpx;
  color: #666;
}

.form-textarea {
  flex: 1;
  min-height: 150rpx;
  font-size: 28rpx;
  color: #333;
}

.empty-items {
  padding: 80rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.item-card {
  padding: 24rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 8rpx;
}

.item-spec {
  font-size: 24rpx;
  color: #999;
  display: block;
}

.btn-delete {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ff4d4f;
  color: #fff;
  border-radius: 50%;
}

.delete-icon {
  font-size: 36rpx;
  line-height: 1;
}

.item-body {
  display: flex;
  gap: 20rpx;
}

.quantity-input, .sort-input {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 16rpx;
  background-color: #fff;
  border-radius: 8rpx;
}

.quantity-label, .sort-label {
  font-size: 26rpx;
  color: #666;
  white-space: nowrap;
}

.quantity-field, .sort-field {
  flex: 1;
  font-size: 26rpx;
  color: #333;
  margin: 0 12rpx;
}

.quantity-unit {
  font-size: 24rpx;
  color: #999;
}

.bottom-placeholder {
  height: 120rpx;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.btn-cancel {
  background-color: #fff;
  border: 1rpx solid #d9d9d9;
  color: #666;
}

.btn-primary {
  background-color: #FF6B00;
  color: #fff;
}

/* 物料选择器弹窗 */
.picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.picker-content {
  width: 100%;
  max-height: 80vh;
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  display: flex;
  flex-direction: column;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.picker-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.picker-close {
  font-size: 48rpx;
  color: #999;
  line-height: 1;
}

.picker-search {
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #eee;
}

.search-input {
  width: 100%;
  height: 72rpx;
  padding: 0 24rpx;
  background-color: #f5f5f5;
  border-radius: 36rpx;
  font-size: 28rpx;
}

.picker-list {
  flex: 1;
  padding: 20rpx 30rpx;
}

.picker-item {
  padding: 24rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.material-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.material-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.material-code {
  font-size: 24rpx;
  color: #999;
}

.material-spec {
  font-size: 24rpx;
  color: #666;
}
</style>
