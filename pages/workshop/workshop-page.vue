<template>
  <view class="workshop-page">
    <!-- 安全区 -->
    <view class="safe-area" :style="{ height: safeAreaHeight + 'px' }"></view>
    
    <!-- 顶部标题 -->
    <view class="page-header">
      <view class="title">车间仓</view>
      <view class="subtitle">实发 - BOM计划 = 结存</view>
    </view>
    
    <!-- 主内容区 -->
    <view class="main-content">
      <!-- 左侧部门列表 -->
      <view class="department-sidebar">
        <scroll-view scroll-y class="department-scroll">
          <view 
            v-for="dept in departments" 
            :key="dept.value"
            class="department-item"
            :class="{ 'active': currentDepartment === dept.value }"
            @click="selectDepartment(dept.value)"
          >
            <view class="dept-name">{{ dept.name }}</view>
            <view class="dept-count">{{ dept.count || 0 }}</view>
          </view>
        </scroll-view>
      </view>
      
      <!-- 右侧物料结存列表 -->
      <view class="balance-main">
        <!-- 部门信息头部 -->
        <view v-if="currentDepartment" class="department-header">
          <view class="dept-title">{{ getCurrentDepartmentName() }}</view>
          <view class="dept-actions">
            <view class="action-btn refresh" @click="refreshBalance">
              <text class="icon">🔄</text>
              <text>刷新</text>
            </view>
          </view>
        </view>
        
        <!-- 物料结存列表 -->
        <scroll-view scroll-y class="balance-scroll">
          <!-- 加载状态 -->
          <skeleton-loader v-if="balanceLoading" type="card" :rows="5" />
          
          <!-- 结存列表 -->
          <view v-else-if="balanceList.length > 0" class="balance-list">
            <swipe-item 
              v-for="item in balanceList" 
              :key="item.material_id"
              :options="getSwipeOptions(item)"
              @action="handleSwipeAction"
            >
              <view class="balance-card" @click="handleBalanceClick(item)">
                <!-- 物料信息 -->
                <view class="material-info">
                  <view class="material-name">{{ item.material_name }}</view>
                  <view class="material-code">{{ item.material_code }}</view>
                  <view v-if="item.specification" class="material-spec">{{ item.specification }}</view>
                </view>
                
                <!-- 数量信息 -->
                <view class="quantity-info">
                  <view class="quantity-row">
                    <view class="label">实发:</view>
                    <view class="value issued">{{ item.issued_quantity || 0 }} {{ item.unit }}</view>
                  </view>
                  <view class="quantity-row">
                    <view class="label">计划:</view>
                    <view class="value planned">{{ item.planned_quantity || 0 }} {{ item.unit }}</view>
                  </view>
                  <view class="quantity-row balance-row">
                    <view class="label">结存:</view>
                    <view 
                      class="value balance" 
                      :class="getBalanceClass(item.balance)"
                    >
                      {{ formatBalance(item.balance) }} {{ item.unit }}
                    </view>
                  </view>
                </view>
                
                <!-- 结存状态标签 -->
                <view class="balance-badge" :class="getBalanceClass(item.balance)">
                  {{ getBalanceText(item.balance) }}
                </view>
              </view>
            </swipe-item>
          </view>
          
          <!-- 空状态 -->
          <empty-state 
            v-else
            icon="📊"
            text="该部门暂无物料结存"
            :showButton="false"
          />
        </scroll-view>
      </view>
    </view>
    
    <!-- 结存详情弹窗 -->
    <balance-detail-popup
      v-if="showDetailPopup"
      :visible="showDetailPopup"
      :balance="currentBalance"
      :department="currentDepartment"
      @close="showDetailPopup = false"
      @return="handleReturnMaterial"
      @supplement="handleSupplementMaterial"
    />
    
    <!-- 退料/补料键盘 -->
    <warehouse-keyboard
      v-if="showKeyboard"
      :visible="showKeyboard"
      :material="currentMaterial"
      :type="keyboardType"
      :department="currentDepartment"
      @confirm="handleKeyboardConfirm"
      @cancel="showKeyboard = false"
    />
  </view>
</template>

<script>
import materialService from '@/common/services/materialService.js'
import warehouseService from '@/common/services/warehouseService.js'
import SwipeItem from '@/components/common/swipe-item.vue'
import SkeletonLoader from '@/components/common/skeleton-loader.vue'
import EmptyState from '@/components/common/empty-state.vue'

export default {
  components: {
    SwipeItem,
    SkeletonLoader,
    EmptyState
  },
  
  data() {
    return {
      // 安全区高度
      safeAreaHeight: 30,
      
      // 部门列表（仅生产部门）
      departments: [
        { name: '配料', value: '配料', count: 0 },
        { name: '制片', value: '制片', count: 0 },
        { name: '卷绕', value: '卷绕', count: 0 },
        { name: '封装', value: '封装', count: 0 },
        { name: '注液', value: '注液', count: 0 },
        { name: '化成', value: '化成', count: 0 },
        { name: '包装', value: '包装', count: 0 }
      ],
      currentDepartment: '',
      
      // 结存列表
      balanceList: [],
      currentBalance: null,
      balanceLoading: false,
      
      // 弹窗相关
      showDetailPopup: false,
      showKeyboard: false,
      keyboardType: 'return', // return(退料), supplement(补料)
      currentMaterial: null
    }
  },
  
  onLoad() {
    this.initSafeArea()
    // 默认选中第一个部门
    if (this.departments.length > 0) {
      this.selectDepartment(this.departments[0].value)
    }
  },
  
  methods: {
    // 初始化安全区
    initSafeArea() {
      const systemInfo = uni.getSystemInfoSync()
      this.safeAreaHeight = systemInfo.statusBarHeight || 30
    },
    
    // 选择部门
    async selectDepartment(department) {
      if (this.currentDepartment === department) return
      
      this.currentDepartment = department
      await this.loadBalance()
    },
    
    // 加载结存列表
    async loadBalance() {
      if (!this.currentDepartment) return
      
      this.balanceLoading = true
      
      const result = await warehouseService.getDepartmentMaterialBalance(this.currentDepartment)
      
      this.balanceLoading = false
      
      if (result.success) {
        this.balanceList = result.data
        
        // 更新部门数量
        const dept = this.departments.find(d => d.value === this.currentDepartment)
        if (dept) {
          dept.count = this.balanceList.length
        }
      } else {
        uni.showToast({
          title: result.message,
          icon: 'none'
        })
      }
    },
    
    // 刷新结存
    async refreshBalance() {
      await this.loadBalance()
      uni.showToast({
        title: '刷新成功',
        icon: 'success'
      })
    },
    
    // 获取当前部门名称
    getCurrentDepartmentName() {
      const dept = this.departments.find(d => d.value === this.currentDepartment)
      return dept ? dept.name : ''
    },
    
    // 获取结存样式类
    getBalanceClass(balance) {
      if (balance > 0) return 'positive'
      if (balance < 0) return 'negative'
      return 'zero'
    },
    
    // 格式化结存
    formatBalance(balance) {
      if (balance > 0) return '+' + balance
      return balance
    },
    
    // 获取结存文本
    getBalanceText(balance) {
      if (balance > 0) return '盈余'
      if (balance < 0) return '亏损'
      return '平衡'
    },
    
    // 获取左滑选项
    getSwipeOptions(item) {
      const options = []
      
      // 如果有盈余，可以退料
      if (item.balance > 0) {
        options.push({
          text: '退料',
          style: 'background: #ff976a;',
          action: 'return',
          data: item
        })
      }
      
      // 如果有亏损，可以补料
      if (item.balance < 0) {
        options.push({
          text: '补料',
          style: 'background: #07c160;',
          action: 'supplement',
          data: item
        })
      }
      
      // 查看详情
      options.push({
        text: '详情',
        style: 'background: #1989fa;',
        action: 'detail',
        data: item
      })
      
      return options
    },
    
    // 处理左滑操作
    handleSwipeAction({ action, data }) {
      this.currentBalance = data
      this.currentMaterial = {
        _id: data.material_id,
        name: data.material_name,
        code: data.material_code,
        unit: data.unit
      }
      
      if (action === 'return') {
        this.keyboardType = 'return'
        this.showKeyboard = true
      } else if (action === 'supplement') {
        this.keyboardType = 'supplement'
        this.showKeyboard = true
      } else if (action === 'detail') {
        this.showDetailPopup = true
      }
    },
    
    // 点击结存卡片
    handleBalanceClick(item) {
      this.currentBalance = item
      this.showDetailPopup = true
    },
    
    // 退料
    handleReturnMaterial(balance) {
      this.currentBalance = balance
      this.currentMaterial = {
        _id: balance.material_id,
        name: balance.material_name,
        code: balance.material_code,
        unit: balance.unit
      }
      this.keyboardType = 'return'
      this.showDetailPopup = false
      this.showKeyboard = true
    },
    
    // 补料
    handleSupplementMaterial(balance) {
      this.currentBalance = balance
      this.currentMaterial = {
        _id: balance.material_id,
        name: balance.material_name,
        code: balance.material_code,
        unit: balance.unit
      }
      this.keyboardType = 'supplement'
      this.showDetailPopup = false
      this.showKeyboard = true
    },
    
    // 处理键盘确认
    async handleKeyboardConfirm({ quantity, remark }) {
      if (!this.currentMaterial) return
      
      // 退料是负数出库，补料是正数出库
      const actualQuantity = this.keyboardType === 'return' ? -quantity : quantity
      
      const params = {
        material_id: this.currentMaterial._id,
        quantity: actualQuantity,
        warehouse_type: 'main',
        department: this.currentDepartment,
        remark: remark
      }
      
      const result = await warehouseService.outbound(params)
      
      if (result.success) {
        uni.showToast({
          title: this.keyboardType === 'return' ? '退料成功' : '补料成功',
          icon: 'success'
        })
        
        this.showKeyboard = false
        
        // 刷新结存列表
        await this.loadBalance()
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
.workshop-page {
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

.page-header {
  padding: 24rpx 30rpx;
  background: #fff;
  border-bottom: 1px solid #eee;
  
  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 8rpx;
  }
  
  .subtitle {
    font-size: 24rpx;
    color: #999;
  }
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.department-sidebar {
  width: 160rpx;
  background: #fff;
  border-right: 1px solid #eee;
  
  .department-scroll {
    height: 100%;
    
    .department-item {
      padding: 32rpx 20rpx;
      border-bottom: 1px solid #f5f5f5;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      &.active {
        background: #f0f9ff;
        border-left: 4rpx solid #007aff;
        
        .dept-name {
          color: #007aff;
          font-weight: bold;
        }
      }
      
      .dept-name {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 8rpx;
      }
      
      .dept-count {
        font-size: 22rpx;
        color: #999;
      }
    }
  }
}

.balance-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  
  .department-header {
    padding: 24rpx 30rpx;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    
    .dept-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .dept-actions {
      .action-btn {
        display: flex;
        align-items: center;
        padding: 12rpx 24rpx;
        background: #007aff;
        border-radius: 8rpx;
        
        &.refresh {
          background: #f5f5f5;
          
          .icon {
            color: #666;
          }
          
          text {
            color: #666;
          }
        }
        
        .icon {
          font-size: 28rpx;
          margin-right: 8rpx;
        }
        
        text {
          font-size: 26rpx;
        }
      }
    }
  }
  
  .balance-scroll {
    flex: 1;
    
    .balance-list {
      padding: 20rpx;
    }
  }
}

.balance-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  position: relative;
  
  .material-info {
    margin-bottom: 20rpx;
    
    .material-name {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 8rpx;
    }
    
    .material-code {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 4rpx;
    }
    
    .material-spec {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .quantity-info {
    .quantity-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12rpx 0;
      border-bottom: 1px solid #f5f5f5;
      
      &.balance-row {
        border-bottom: none;
        padding-top: 16rpx;
        margin-top: 8rpx;
        border-top: 2rpx dashed #eee;
      }
      
      .label {
        font-size: 26rpx;
        color: #666;
      }
      
      .value {
        font-size: 28rpx;
        font-weight: bold;
        
        &.issued {
          color: #ff976a;
        }
        
        &.planned {
          color: #1989fa;
        }
        
        &.balance {
          font-size: 32rpx;
          
          &.positive {
            color: #07c160;
          }
          
          &.negative {
            color: #ee0a24;
          }
          
          &.zero {
            color: #1989fa;
          }
        }
      }
    }
  }
  
  .balance-badge {
    position: absolute;
    top: 24rpx;
    right: 24rpx;
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    font-size: 22rpx;
    font-weight: bold;
    
    &.positive {
      background: #e7f7ef;
      color: #07c160;
    }
    
    &.negative {
      background: #fef0f0;
      color: #ee0a24;
    }
    
    &.zero {
      background: #e6f7ff;
      color: #1989fa;
    }
  }
}
</style>
