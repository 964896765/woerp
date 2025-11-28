<template>
  <view class="material-page">
    <!-- 安全区 -->
    <view class="safe-area" :style="{ height: safeAreaHeight + 'px' }"></view>
    
    <!-- 顶部Tab -->
    <view class="top-tabs" :class="{ 'fixed': isTabFixed }">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index"
        class="tab-item"
        :class="{ 'active': currentTab === index }"
        @click="switchTab(index)"
      >
        {{ tab.name }}
      </view>
    </view>
    
    <!-- 主内容区 -->
    <view class="main-content">
      <!-- 左侧类别列表 -->
      <view class="category-sidebar">
        <scroll-view scroll-y class="category-scroll">
          <!-- 加载状态 -->
          <skeleton-loader v-if="categoryLoading" type="list" :rows="8" />
          
          <!-- 类别列表 -->
          <view 
            v-else
            v-for="category in categories" 
            :key="category._id"
            class="category-item"
            :class="{ 'active': currentCategory?._id === category._id }"
            @click="selectCategory(category)"
          >
            <view class="category-name">{{ category.name }}</view>
            <view class="category-count">{{ category.material_count || 0 }}</view>
          </view>
          
          <!-- 空状态 -->
          <empty-state 
            v-if="!categoryLoading && categories.length === 0"
            icon="📦"
            text="暂无类别"
            buttonText="添加类别"
            @click="handleAddCategory"
          />
        </scroll-view>
        
        <!-- 添加类别按钮 -->
        <view class="add-category-btn" @click="handleAddCategory">
          <text class="icon">+</text>
        </view>
      </view>
      
      <!-- 右侧物料列表 -->
      <view class="material-main">
        <!-- 类别信息头部 -->
        <view v-if="currentCategory" class="category-header">
          <view class="category-title">{{ currentCategory.name }}</view>
          <view class="category-actions">
            <view class="action-btn" @click="handleAddMaterial">
              <text class="icon">+</text>
              <text>添加物料</text>
            </view>
          </view>
        </view>
        
        <!-- 物料列表 -->
        <scroll-view 
          scroll-y 
          class="material-scroll"
          @scroll="onScroll"
          :scroll-top="scrollTop"
        >
          <!-- 加载状态 -->
          <skeleton-loader v-if="materialLoading" type="card" :rows="5" />
          
          <!-- 物料列表 -->
          <view v-else-if="materials.length > 0" class="material-list">
            <swipe-item 
              v-for="material in materials" 
              :key="material._id"
              :options="getSwipeOptions(material)"
              @action="handleSwipeAction"
            >
              <material-card 
                :material="material"
                :type="getMaterialCardType()"
                @click="handleMaterialClick(material)"
                @action="handleMaterialAction"
              />
            </swipe-item>
          </view>
          
          <!-- 空状态 -->
          <empty-state 
            v-else
            icon="📦"
            text="暂无物料"
            buttonText="添加物料"
            @click="handleAddMaterial"
          />
          
          <!-- 加载更多 -->
          <view v-if="hasMore && !materialLoading" class="load-more" @click="loadMoreMaterials">
            加载更多
          </view>
        </scroll-view>
      </view>
    </view>
    
    <!-- 出入库键盘弹窗 -->
    <warehouse-keyboard
      v-if="showKeyboard"
      :visible="showKeyboard"
      :material="currentMaterial"
      :type="keyboardType"
      :workshop-balance="workshopBalance"
      @confirm="handleKeyboardConfirm"
      @cancel="showKeyboard = false"
    />
    
    <!-- 物料详情弹窗 -->
    <material-detail-popup
      v-if="showDetailPopup"
      :visible="showDetailPopup"
      :material="currentMaterial"
      @close="showDetailPopup = false"
      @edit="handleEditMaterial"
      @delete="handleDeleteMaterial"
    />
  </view>
</template>

<script>
import materialService from '@/common/services/materialService.js'
import categoryService from '@/common/services/categoryService.js'
import warehouseService from '@/common/services/warehouseService.js'
import SwipeItem from '@/components/common/swipe-item.vue'
import SkeletonLoader from '@/components/common/skeleton-loader.vue'
import EmptyState from '@/components/common/empty-state.vue'
import MaterialCard from '@/components/business/material-card.vue'

export default {
  components: {
    SwipeItem,
    SkeletonLoader,
    EmptyState,
    MaterialCard
  },
  
  data() {
    return {
      // 安全区高度
      safeAreaHeight: 30,
      
      // Tab相关
      tabs: [
        { name: '主材仓', value: 'main' },
        { name: '辅料仓', value: 'auxiliary' },
        { name: 'PACK', value: 'pack' },
        { name: '待处理', value: 'pending' }
      ],
      currentTab: 0,
      isTabFixed: false,
      
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
      scrollTop: 0,
      scrollTimer: null,
      
      // 弹窗相关
      showKeyboard: false,
      keyboardType: 'inbound', // inbound, outbound
      workshopBalance: null,
      showDetailPopup: false
    }
  },
  
  computed: {
    currentWarehouseType() {
      return this.tabs[this.currentTab].value
    }
  },
  
  onLoad() {
    this.initSafeArea()
    this.loadCategories()
  },
  
  methods: {
    // 初始化安全区
    initSafeArea() {
      const systemInfo = uni.getSystemInfoSync()
      this.safeAreaHeight = systemInfo.statusBarHeight || 30
    },
    
    // 切换Tab
    async switchTab(index) {
      if (this.currentTab === index) return
      
      this.currentTab = index
      this.currentCategory = null
      this.materials = []
      this.page = 1
      this.hasMore = true
      
      await this.loadCategories()
    },
    
    // 加载类别列表
    async loadCategories() {
      this.categoryLoading = true
      
      const result = await categoryService.getCategoryList({
        warehouse_type: this.currentWarehouseType
      })
      
      this.categoryLoading = false
      
      if (result.success) {
        this.categories = result.data
        
        // 自动选中第一个类别
        if (this.categories.length > 0) {
          this.selectCategory(this.categories[0])
        }
      } else {
        uni.showToast({
          title: result.message,
          icon: 'none'
        })
      }
    },
    
    // 选择类别
    async selectCategory(category) {
      if (this.currentCategory?._id === category._id) return
      
      this.currentCategory = category
      this.materials = []
      this.page = 1
      this.hasMore = true
      
      await this.loadMaterials()
    },
    
    // 加载物料列表
    async loadMaterials() {
      if (!this.currentCategory) return
      
      this.materialLoading = true
      
      const result = await materialService.getMaterialList({
        warehouse_type: this.currentWarehouseType,
        category_id: this.currentCategory._id,
        page: this.page,
        pageSize: this.pageSize
      })
      
      this.materialLoading = false
      
      if (result.success) {
        if (this.page === 1) {
          this.materials = result.data
        } else {
          this.materials = [...this.materials, ...result.data]
        }
        
        this.hasMore = result.data.length >= this.pageSize
      } else {
        uni.showToast({
          title: result.message,
          icon: 'none'
        })
      }
    },
    
    // 加载更多
    async loadMoreMaterials() {
      if (!this.hasMore || this.materialLoading) return
      
      this.page++
      await this.loadMaterials()
    },
    
    // 滚动事件（节流）
    onScroll(e) {
      if (this.scrollTimer) return
      
      this.scrollTimer = setTimeout(() => {
        const scrollTop = e.detail.scrollTop
        this.isTabFixed = scrollTop > 100
        this.scrollTimer = null
      }, 16)
    },
    
    // 获取左滑选项
    getSwipeOptions(material) {
      return [
        {
          text: '入库',
          style: 'background: #07c160;',
          action: 'inbound',
          data: material
        },
        {
          text: '出库',
          style: 'background: #ff976a;',
          action: 'outbound',
          data: material
        },
        {
          text: '删除',
          style: 'background: #ee0a24;',
          action: 'delete',
          data: material
        }
      ]
    },
    
    // 处理左滑操作
    async handleSwipeAction({ action, data }) {
      this.currentMaterial = data
      
      if (action === 'inbound') {
        this.keyboardType = 'inbound'
        this.showKeyboard = true
      } else if (action === 'outbound') {
        this.keyboardType = 'outbound'
        // 获取车间结存参考
        await this.loadWorkshopBalance()
        this.showKeyboard = true
      } else if (action === 'delete') {
        this.confirmDelete()
      }
    },
    
    // 获取物料卡片类型
    getMaterialCardType() {
      return 'standard' // standard, workshop, bom
    },
    
    // 点击物料卡片
    handleMaterialClick(material) {
      this.currentMaterial = material
      this.showDetailPopup = true
    },
    
    // 处理物料卡片操作
    async handleMaterialAction({ action, material }) {
      this.currentMaterial = material
      
      if (action === 'inbound') {
        this.keyboardType = 'inbound'
        this.showKeyboard = true
      } else if (action === 'outbound') {
        this.keyboardType = 'outbound'
        await this.loadWorkshopBalance()
        this.showKeyboard = true
      }
    },
    
    // 加载车间结存参考
    async loadWorkshopBalance() {
      if (!this.currentMaterial) return
      
      // 如果是车间仓，需要获取结存参考
      if (this.currentWarehouseType === 'main') {
        const result = await warehouseService.getWorkshopStockReference(
          this.currentMaterial._id,
          '配料' // 默认部门，实际应该让用户选择
        )
        
        if (result.success) {
          this.workshopBalance = result.data
        }
      }
    },
    
    // 处理键盘确认
    async handleKeyboardConfirm({ quantity, remark, department, batchNo }) {
      if (!this.currentMaterial) return
      
      const params = {
        material_id: this.currentMaterial._id,
        quantity: quantity,
        warehouse_type: this.currentWarehouseType,
        department: department,
        batch_no: batchNo,
        remark: remark
      }
      
      let result
      if (this.keyboardType === 'inbound') {
        result = await warehouseService.inbound(params)
      } else {
        result = await warehouseService.outbound(params)
      }
      
      if (result.success) {
        uni.showToast({
          title: result.message,
          icon: 'success'
        })
        
        this.showKeyboard = false
        
        // 刷新物料列表
        await this.loadMaterials()
      } else {
        uni.showToast({
          title: result.message,
          icon: 'none'
        })
      }
    },
    
    // 添加类别
    handleAddCategory() {
      uni.navigateTo({
        url: '/pages/category/category-edit?warehouseType=' + this.currentWarehouseType
      })
    },
    
    // 添加物料
    handleAddMaterial() {
      if (!this.currentCategory) {
        uni.showToast({
          title: '请先选择类别',
          icon: 'none'
        })
        return
      }
      
      uni.navigateTo({
        url: '/pages/material/material-edit?categoryId=' + this.currentCategory._id + '&warehouseType=' + this.currentWarehouseType
      })
    },
    
    // 编辑物料
    handleEditMaterial(material) {
      uni.navigateTo({
        url: '/pages/material/material-edit?id=' + material._id
      })
    },
    
    // 确认删除
    confirmDelete() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除该物料吗？',
        success: async (res) => {
          if (res.confirm) {
            await this.deleteMaterial()
          }
        }
      })
    },
    
    // 删除物料
    async handleDeleteMaterial(material) {
      this.currentMaterial = material
      this.confirmDelete()
    },
    
    async deleteMaterial() {
      if (!this.currentMaterial) return
      
      const result = await materialService.deleteMaterial(this.currentMaterial._id)
      
      if (result.success) {
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })
        
        this.showDetailPopup = false
        
        // 刷新物料列表
        await this.loadMaterials()
      } else {
        uni.showToast({
          title: result.message,
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.material-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.safe-area {
  width: 100%;
  background: transparent;
}

.top-tabs {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #eee;
  z-index: 100;
  
  &.fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
  }
  
  .tab-item {
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #666;
    position: relative;
    
    &.active {
      color: #007aff;
      font-weight: bold;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 4rpx;
        background: #007aff;
        border-radius: 2rpx;
      }
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.category-sidebar {
  width: 200rpx;
  background: #fff;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  
  .category-scroll {
    flex: 1;
    
    .category-item {
      padding: 24rpx 20rpx;
      border-bottom: 1px solid #f5f5f5;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      &.active {
        background: #f0f9ff;
        border-left: 4rpx solid #007aff;
        
        .category-name {
          color: #007aff;
          font-weight: bold;
        }
      }
      
      .category-name {
        font-size: 26rpx;
        color: #333;
        margin-bottom: 8rpx;
      }
      
      .category-count {
        font-size: 22rpx;
        color: #999;
      }
    }
  }
  
  .add-category-btn {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid #eee;
    background: #fff;
    
    .icon {
      font-size: 40rpx;
      color: #007aff;
    }
  }
}

.material-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  
  .category-header {
    padding: 24rpx 30rpx;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    
    .category-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .category-actions {
      .action-btn {
        display: flex;
        align-items: center;
        padding: 12rpx 24rpx;
        background: #007aff;
        border-radius: 8rpx;
        
        .icon {
          font-size: 32rpx;
          color: #fff;
          margin-right: 8rpx;
        }
        
        text {
          font-size: 26rpx;
          color: #fff;
        }
      }
    }
  }
  
  .material-scroll {
    flex: 1;
    
    .material-list {
      padding: 20rpx;
    }
    
    .load-more {
      padding: 30rpx;
      text-align: center;
      font-size: 26rpx;
      color: #999;
    }
  }
}
</style>
