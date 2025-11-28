<template>
  <view class="material-edit-page">
    <SafeTop />
    
    <!-- 页面头部 -->
    <view class="header">
      <view class="header-left" @tap="goBack">
        <text class="iconfont icon-back">←</text>
      </view>
      <view class="header-title">{{ isEdit ? '编辑物料' : '新增物料' }}</view>
      <view class="header-right">
        <text class="btn-text" @tap="handleSave">保存</text>
      </view>
    </view>
    
    <!-- 表单内容 -->
    <scroll-view class="content" scroll-y>
      <view class="form">
        <!-- 基本信息 -->
        <view class="form-section">
          <view class="section-title">基本信息</view>
          
          <view class="form-item required">
            <text class="form-label">物料编码</text>
            <input 
              class="form-input" 
              v-model="formData.code" 
              placeholder="请输入物料编码"
              :disabled="isEdit"
            />
          </view>
          
          <view class="form-item required">
            <text class="form-label">物料名称</text>
            <input 
              class="form-input" 
              v-model="formData.name" 
              placeholder="请输入物料名称"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">规格型号</text>
            <input 
              class="form-input" 
              v-model="formData.spec" 
              placeholder="请输入规格型号"
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
              :disabled="isEdit"
            >
              <view class="form-picker">
                <text :class="formData.warehouse_type ? '' : 'placeholder'">
                  {{ formData.warehouse_type ? getWarehouseTypeName(formData.warehouse_type) : '请选择仓库类型' }}
                </text>
                <text class="arrow">›</text>
              </view>
            </picker>
          </view>
          
          <view class="form-item required">
            <text class="form-label">物料类别</text>
            <picker 
              mode="selector" 
              :range="categories" 
              :range-key="'name'"
              :value="categoryIndex"
              @change="onCategoryChange"
            >
              <view class="form-picker">
                <text :class="formData.category_id ? '' : 'placeholder'">
                  {{ formData.category_name || '请选择物料类别' }}
                </text>
                <text class="arrow">›</text>
              </view>
            </picker>
          </view>
          
          <view class="form-item required">
            <text class="form-label">单位</text>
            <input 
              class="form-input" 
              v-model="formData.unit" 
              placeholder="请输入单位（如：kg、个、米）"
            />
          </view>
        </view>
        
        <!-- 库存信息 -->
        <view class="form-section">
          <view class="section-title">库存信息</view>
          
          <view class="form-item">
            <text class="form-label">初始库存</text>
            <input 
              class="form-input" 
              type="digit"
              v-model="formData.stock_quantity" 
              placeholder="请输入初始库存"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">最低库存</text>
            <input 
              class="form-input" 
              type="digit"
              v-model="formData.min_stock" 
              placeholder="请输入最低库存预警值"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">单价</text>
            <input 
              class="form-input" 
              type="digit"
              v-model="formData.price" 
              placeholder="请输入单价"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">批次号</text>
            <input 
              class="form-input" 
              v-model="formData.batch_no" 
              placeholder="请输入批次号"
            />
          </view>
        </view>
        
        <!-- 其他信息 -->
        <view class="form-section">
          <view class="section-title">其他信息</view>
          
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
  </view>
</template>

<script>
import SafeTop from '@/components/page-header/SafeTop.vue'
import materialService from '@/common/services/materialService.js'
import categoryService from '@/common/services/categoryService.js'

export default {
  components: {
    SafeTop
  },
  data() {
    return {
      isEdit: false,
      materialId: '',
      formData: {
        code: '',
        name: '',
        spec: '',
        warehouse_type: '',
        category_id: '',
        category_name: '',
        unit: '',
        stock_quantity: 0,
        min_stock: 0,
        price: 0,
        batch_no: '',
        status: 'active',
        description: ''
      },
      warehouseTypes: [
        { value: 'main', label: '主材仓' },
        { value: 'workshop', label: '车间仓' },
        { value: 'bom', label: 'BOM仓' },
        { value: 'pack', label: 'PACK仓' },
        { value: 'auxiliary', label: '辅料仓' },
        { value: 'pending', label: '待处理' }
      ],
      categories: [],
      warehouseTypeIndex: -1,
      categoryIndex: -1
    }
  },
  onLoad(options) {
    if (options.id) {
      this.isEdit = true
      this.materialId = options.id
      this.loadMaterialDetail()
    }
  },
  methods: {
    async loadMaterialDetail() {
      try {
        uni.showLoading({ title: '加载中...' })
        const result = await materialService.getMaterialDetail(this.materialId)
        if (result.success) {
          this.formData = { ...result.data }
          this.updateWarehouseTypeIndex()
          await this.loadCategories()
          this.updateCategoryIndex()
        } else {
          uni.showToast({
            title: result.message || '加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('加载物料详情失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    async loadCategories() {
      if (!this.formData.warehouse_type) return
      
      try {
        const result = await categoryService.getCategoryList({
          warehouse_type: this.formData.warehouse_type
        })
        if (result.success) {
          this.categories = result.data || []
        }
      } catch (error) {
        console.error('加载类别失败:', error)
      }
    },
    
    updateWarehouseTypeIndex() {
      this.warehouseTypeIndex = this.warehouseTypes.findIndex(
        item => item.value === this.formData.warehouse_type
      )
    },
    
    updateCategoryIndex() {
      this.categoryIndex = this.categories.findIndex(
        item => item._id === this.formData.category_id
      )
    },
    
    async onWarehouseTypeChange(e) {
      const index = e.detail.value
      this.warehouseTypeIndex = index
      this.formData.warehouse_type = this.warehouseTypes[index].value
      
      // 重置类别选择
      this.formData.category_id = ''
      this.formData.category_name = ''
      this.categoryIndex = -1
      
      // 加载新的类别列表
      await this.loadCategories()
    },
    
    onCategoryChange(e) {
      const index = e.detail.value
      this.categoryIndex = index
      this.formData.category_id = this.categories[index]._id
      this.formData.category_name = this.categories[index].name
    },
    
    onStatusChange(e) {
      this.formData.status = e.detail.value ? 'active' : 'inactive'
    },
    
    getWarehouseTypeName(type) {
      const item = this.warehouseTypes.find(t => t.value === type)
      return item ? item.label : type
    },
    
    validateForm() {
      if (!this.formData.code) {
        uni.showToast({ title: '请输入物料编码', icon: 'none' })
        return false
      }
      if (!this.formData.name) {
        uni.showToast({ title: '请输入物料名称', icon: 'none' })
        return false
      }
      if (!this.formData.warehouse_type) {
        uni.showToast({ title: '请选择仓库类型', icon: 'none' })
        return false
      }
      if (!this.formData.category_id) {
        uni.showToast({ title: '请选择物料类别', icon: 'none' })
        return false
      }
      if (!this.formData.unit) {
        uni.showToast({ title: '请输入单位', icon: 'none' })
        return false
      }
      return true
    },
    
    async handleSave() {
      if (!this.validateForm()) return
      
      try {
        uni.showLoading({ title: '保存中...' })
        
        const data = {
          ...this.formData,
          stock_quantity: Number(this.formData.stock_quantity) || 0,
          min_stock: Number(this.formData.min_stock) || 0,
          price: Number(this.formData.price) || 0
        }
        
        let result
        if (this.isEdit) {
          result = await materialService.updateMaterial(this.materialId, data)
        } else {
          result = await materialService.createMaterial(data)
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
        console.error('保存物料失败:', error)
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
.material-edit-page {
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

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
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

.form {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.form-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 30rpx;
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

.form-picker {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
</style>
