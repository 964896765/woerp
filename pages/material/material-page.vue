<template>
  <view class="material-page">
    <!-- 主内容区 -->
    <view class="main-content">
      <!-- 左侧类别列表 -->
      <view class="category-sidebar">
        <scroll-view scroll-y class="category-scroll">
          <!-- 加载状态 -->
          <view v-if="categoryLoading" class="loading-skeleton">
            <view v-for="i in 8" :key="i" class="skeleton-item"></view>
          </view>
          
          <!-- 类别列表 -->
          <view 
            v-else
            v-for="category in categories" 
            :key="category._id"
            class="category-item"
            :class="{ 'active': currentCategory && currentCategory._id === category._id }"
            @click="selectCategory(category)"
          >
            <view class="category-name">{{ category.name }}</view>
            <view class="category-count">{{ category.material_count || 0 }}</view>
          </view>
          
          <!-- 空状态 -->
          <view v-if="!categoryLoading && categories.length === 0" class="empty-state">
            <text class="empty-icon">📦</text>
            <text class="empty-text">暂无类别</text>
          </view>
        </scroll-view>
      </view>
      
      <!-- 右侧物料列表 -->
      <view class="material-main">
        <!-- 类别信息头部 -->
        <view v-if="currentCategory" class="category-header">
          <view class="category-title">{{ currentCategory.name }}</view>
        </view>
        
        <!-- 物料列表 -->
        <scroll-view 
          scroll-y 
          class="material-scroll"
          @scroll="onScroll"
          @scrolltolower="loadMore"
        >
          <!-- 加载状态 -->
          <view v-if="materialLoading && materials.length === 0" class="loading-skeleton">
            <view v-for="i in 5" :key="i" class="skeleton-card"></view>
          </view>
          
          <!-- 物料列表 -->
          <view v-else-if="materials.length > 0" class="material-list">
            <view 
              v-for="material in materials" 
              :key="material._id"
              class="material-card"
              @click="handleMaterialClick(material)"
            >
              <view class="card-header">
                <view class="material-name">{{ material.name }}</view>
                <view class="material-code">{{ material.code }}</view>
              </view>
              <view class="card-body">
                <view class="info-row">
                  <text class="label">规格：</text>
                  <text class="value">{{ material.specification || '-' }}</text>
                </view>
                <view class="info-row">
                  <text class="label">数量：</text>
                  <text class="value highlight">{{ material.quantity || 0 }} {{ material.unit || 'kg' }}</text>
                </view>
                <view v-if="material.batch_no" class="info-row">
                  <text class="label">批次：</text>
                  <text class="value">{{ material.batch_no }}</text>
                </view>
              </view>
              <view class="card-footer">
                <view class="action-btn" @click.stop="handleInbound(material)">
                  <text class="btn-text">入库</text>
                </view>
                <view class="action-btn primary" @click.stop="handleOutbound(material)">
                  <text class="btn-text">出库</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 空状态 -->
          <view v-else class="empty-state">
            <text class="empty-icon">📦</text>
            <text class="empty-text">暂无物料</text>
          </view>
          
          <!-- 加载更多 -->
          <view v-if="materialLoading && materials.length > 0" class="loading-more">
            <text>加载中...</text>
          </view>
          <view v-else-if="!hasMore && materials.length > 0" class="no-more">
            <text>没有更多了</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import materialService from '@/common/services/materialService.js'
import categoryService from '@/common/services/categoryService.js'
import warehouseService from '@/common/services/warehouseService.js'

export default {
  props: {
    nid: {
      type: Number,
      default: 0
    }
  },
  
  data() {
    return {
      // 仓库类型映射
      warehouseTypeMap: {
        0: 'main',      // 主材仓
        1: 'workshop',  // 车间仓
        2: 'bom',       // BOM
        3: 'pack',      // PACK
        4: 'auxiliary', // 辅料仓
        5: 'pending'    // 待处理
      },
      
      // 类别相关
      categories: [],
      currentCategory: null,
      categoryLoading: false,
      
      // 物料相关
      materials: [],
      currentMaterial: null,
      materialLoading: false,
      page: 1,
      pageSize: 20,
      hasMore: true,
      
      // 滚动相关
      lastScrollTop: 0
    }
  },
  
  computed: {
    currentWarehouseType() {
      return this.warehouseTypeMap[this.nid] || 'main'
    }
  },
  
  watch: {
    nid: {
      handler(newVal) {
        this.resetData()
        this.loadCategories()
      },
      immediate: true
    }
  },
  
  methods: {
    // 重置数据
    resetData() {
      this.categories = []
      this.currentCategory = null
      this.materials = []
      this.page = 1
      this.hasMore = true
    },
    
    // 加载类别列表
    async loadCategories() {
      // 车间仓和BOM使用不同的逻辑
      if (this.currentWarehouseType === 'workshop') {
        // 车间仓显示部门列表
        await this.loadDepartments()
        return
      }
      
      if (this.currentWarehouseType === 'bom') {
        // BOM显示BOM列表
        await this.loadBomList()
        return
      }
      
      // 其他仓库显示类别列表
      this.categoryLoading = true
      
      try {
        const result = await categoryService.getCategoryList({
          warehouse_type: this.currentWarehouseType
        })
        
        this.categoryLoading = false
        
        if (result.success) {
          this.categories = result.data || []
          
          // 自动选中第一个类别
          if (this.categories.length > 0) {
            this.selectCategory(this.categories[0])
          }
        } else {
          uni.showToast({
            title: result.message || '加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        this.categoryLoading = false
        console.error('加载类别失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },
    
    // 加载部门列表（车间仓）
    async loadDepartments() {
      this.categoryLoading = true
      
      try {
        // 这里应该调用部门服务，暂时使用假数据
        const departments = [
          { _id: 'dept1', name: '配料', material_count: 0 },
          { _id: 'dept2', name: '制片', material_count: 0 },
          { _id: 'dept3', name: '卷绕', material_count: 0 },
          { _id: 'dept4', name: '封装', material_count: 0 },
          { _id: 'dept5', name: '注液', material_count: 0 },
          { _id: 'dept6', name: '化成', material_count: 0 },
          { _id: 'dept7', name: '包装', material_count: 0 },
          { _id: 'dept8', name: '技术部', material_count: 0 }
        ]
        
        this.categories = departments
        this.categoryLoading = false
        
        if (this.categories.length > 0) {
          this.selectCategory(this.categories[0])
        }
      } catch (error) {
        this.categoryLoading = false
        console.error('加载部门失败:', error)
      }
    },
    
    // 加载BOM列表
    async loadBomList() {
      this.categoryLoading = true
      
      try {
        // 这里应该调用BOM服务，暂时使用假数据
        const boms = [
          { _id: 'bom1', name: 'BOM-001', material_count: 0 },
          { _id: 'bom2', name: 'BOM-002', material_count: 0 }
        ]
        
        this.categories = boms
        this.categoryLoading = false
        
        if (this.categories.length > 0) {
          this.selectCategory(this.categories[0])
        }
      } catch (error) {
        this.categoryLoading = false
        console.error('加载BOM失败:', error)
      }
    },
    
    // 选择类别
    async selectCategory(category) {
      if (this.currentCategory && this.currentCategory._id === category._id) return
      
      this.currentCategory = category
      this.materials = []
      this.page = 1
      this.hasMore = true
      
      await this.loadMaterials()
    },
    
    // 加载物料列表
    async loadMaterials() {
      if (this.materialLoading || !this.hasMore) return
      
      this.materialLoading = true
      
      try {
        const params = {
          warehouse_type: this.currentWarehouseType,
          category_id: this.currentCategory ? this.currentCategory._id : null,
          page: this.page,
          pageSize: this.pageSize
        }
        
        // 车间仓使用部门ID
        if (this.currentWarehouseType === 'workshop') {
          params.department_id = this.currentCategory ? this.currentCategory._id : null
          delete params.category_id
        }
        
        const result = await materialService.getMaterialList(params)
        
        this.materialLoading = false
        
        if (result.success) {
          const newMaterials = result.data || []
          
          if (this.page === 1) {
            this.materials = newMaterials
          } else {
            this.materials = [...this.materials, ...newMaterials]
          }
          
          this.hasMore = newMaterials.length >= this.pageSize
        } else {
          uni.showToast({
            title: result.message || '加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        this.materialLoading = false
        console.error('加载物料失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },
    
    // 加载更多
    loadMore() {
      if (this.hasMore && !this.materialLoading) {
        this.page++
        this.loadMaterials()
      }
    },
    
    // 滚动事件
    onScroll(e) {
      const scrollTop = e.detail.scrollTop
      
      // 向父组件发送滚动事件
      this.$emit('scroll-y', scrollTop)
      
      // 判断是否在顶部
      const isTop = scrollTop < 10
      this.$emit('left-top', isTop)
      
      this.lastScrollTop = scrollTop
    },
    
    // 点击物料
    handleMaterialClick(material) {
      this.currentMaterial = material
      // 可以打开详情弹窗
      uni.showToast({
        title: material.name,
        icon: 'none'
      })
    },
    
    // 入库
    handleInbound(material) {
      this.currentMaterial = material
      uni.showToast({
        title: '入库功能开发中',
        icon: 'none'
      })
    },
    
    // 出库
    handleOutbound(material) {
      this.currentMaterial = material
      uni.showToast({
        title: '出库功能开发中',
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped>
.material-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f6f7fb;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧类别列表 */
.category-sidebar {
  width: 200rpx;
  background: #fff;
  border-right: 1px solid #eef0f4;
  display: flex;
  flex-direction: column;
}

.category-scroll {
  flex: 1;
  height: 100%;
}

.category-item {
  padding: 32rpx 24rpx;
  border-bottom: 1px solid #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}

.category-item.active {
  background: #f0f9ff;
  border-left: 4rpx solid #2F85FC;
}

.category-name {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
  text-align: center;
}

.category-item.active .category-name {
  color: #2F85FC;
  font-weight: bold;
}

.category-count {
  font-size: 24rpx;
  color: #999;
}

/* 右侧物料列表 */
.material-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.category-header {
  padding: 24rpx 32rpx;
  background: #fff;
  border-bottom: 1px solid #eef0f4;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.material-scroll {
  flex: 1;
  height: 100%;
}

.material-list {
  padding: 24rpx;
}

.material-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 1px solid #f5f5f5;
}

.material-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.material-code {
  font-size: 24rpx;
  color: #999;
}

.card-body {
  margin-bottom: 16rpx;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
  font-size: 28rpx;
}

.label {
  color: #666;
  margin-right: 16rpx;
}

.value {
  color: #333;
  flex: 1;
}

.value.highlight {
  color: #2F85FC;
  font-weight: bold;
}

.card-footer {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  height: 64rpx;
  border-radius: 8rpx;
  border: 1px solid #2F85FC;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.action-btn.primary {
  background: #2F85FC;
}

.btn-text {
  font-size: 28rpx;
  color: #2F85FC;
}

.action-btn.primary .btn-text {
  color: #fff;
}

/* 加载状态 */
.loading-skeleton {
  padding: 24rpx;
}

.skeleton-item {
  height: 100rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-card {
  height: 300rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 加载更多 */
.loading-more,
.no-more {
  padding: 32rpx;
  text-align: center;
  font-size: 24rpx;
  color: #999;
}
</style>
