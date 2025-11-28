<template>
  <view class="bom-issue-page">
    <!-- 安全区 -->
    <view class="safe-area" :style="{ height: safeAreaHeight + 'px' }"></view>
    
    <!-- 顶部标题 -->
    <view class="page-header">
      <view class="title">按BOM发料</view>
      <view class="subtitle">参照计划量，灵活调整实发数</view>
    </view>
    
    <!-- 步骤指示器 -->
    <view class="step-indicator">
      <view 
        v-for="(step, index) in steps" 
        :key="index"
        class="step-item"
        :class="{ 'active': currentStep === index, 'completed': currentStep > index }"
      >
        <view class="step-number">{{ index + 1 }}</view>
        <view class="step-name">{{ step }}</view>
      </view>
    </view>
    
    <!-- 主内容区 -->
    <scroll-view scroll-y class="main-content">
      <!-- 步骤1: 选择BOM -->
      <view v-if="currentStep === 0" class="step-content">
        <view class="section-title">选择BOM</view>
        
        <!-- 加载状态 -->
        <skeleton-loader v-if="bomLoading" type="list" :rows="5" />
        
        <!-- BOM列表 -->
        <view v-else-if="bomList.length > 0" class="bom-list">
          <view 
            v-for="bom in bomList" 
            :key="bom._id"
            class="bom-item"
            :class="{ 'selected': selectedBom && selectedBom._id === bom._id }"
            @click="selectBom(bom)"
          >
            <view class="bom-info">
              <view class="bom-name">{{ bom.name }}</view>
              <view class="bom-code">{{ bom.code }}</view>
              <view class="bom-desc">{{ bom.description }}</view>
            </view>
            <view class="bom-badge">
              <text>{{ bom.items_count || 0 }}项</text>
            </view>
          </view>
        </view>
        
        <!-- 空状态 -->
        <empty-state 
          v-else
          icon="📋"
          text="暂无BOM"
          buttonText="创建BOM"
          @click="handleCreateBom"
        />
      </view>
      
      <!-- 步骤2: 选择部门和输入生产数量 -->
      <view v-if="currentStep === 1" class="step-content">
        <view class="section-title">发料信息</view>
        
        <!-- 已选BOM -->
        <view class="selected-bom-info">
          <view class="info-label">已选BOM:</view>
          <view class="info-value">{{ selectedBom.name }}</view>
        </view>
        
        <!-- 选择部门 -->
        <view class="form-item">
          <view class="form-label">发料部门</view>
          <picker 
            mode="selector" 
            :range="departments" 
            range-key="name"
            :value="departmentIndex"
            @change="onDepartmentChange"
          >
            <view class="picker-value">
              {{ selectedDepartment ? selectedDepartment.name : '请选择部门' }}
            </view>
          </picker>
        </view>
        
        <!-- 输入生产数量 -->
        <view class="form-item">
          <view class="form-label">生产数量</view>
          <input 
            type="digit" 
            v-model="productionQuantity"
            placeholder="请输入生产数量"
            @input="onProductionQuantityChange"
          />
        </view>
      </view>
      
      <!-- 步骤3: 查看物料清单并调整实发数量 -->
      <view v-if="currentStep === 2" class="step-content">
        <view class="section-title">物料清单</view>
        
        <!-- 发料信息摘要 -->
        <view class="issue-summary">
          <view class="summary-item">
            <view class="summary-label">BOM:</view>
            <view class="summary-value">{{ selectedBom.name }}</view>
          </view>
          <view class="summary-item">
            <view class="summary-label">部门:</view>
            <view class="summary-value">{{ selectedDepartment.name }}</view>
          </view>
          <view class="summary-item">
            <view class="summary-label">生产数量:</view>
            <view class="summary-value">{{ productionQuantity }}</view>
          </view>
        </view>
        
        <!-- 加载状态 -->
        <skeleton-loader v-if="materialLoading" type="card" :rows="5" />
        
        <!-- 物料清单 -->
        <view v-else-if="materialList.length > 0" class="material-list">
          <view 
            v-for="(item, index) in materialList" 
            :key="index"
            class="material-item"
          >
            <!-- 物料信息 -->
            <view class="material-header">
              <view class="material-info">
                <view class="material-name">{{ item.material_name }}</view>
                <view class="material-code">{{ item.material_code }}</view>
              </view>
            </view>
            
            <!-- 数量信息 -->
            <view class="quantity-section">
              <!-- 计划用量 -->
              <view class="quantity-row">
                <view class="quantity-label">计划用量:</view>
                <view class="quantity-value planned">
                  {{ item.planned_quantity }} {{ item.unit }}
                </view>
              </view>
              
              <!-- 建议发放（考虑车间结存） -->
              <view class="quantity-row">
                <view class="quantity-label">建议发放:</view>
                <view class="quantity-value suggested">
                  {{ item.suggested_quantity }} {{ item.unit }}
                </view>
              </view>
              
              <!-- 车间结存参考 -->
              <view class="quantity-row">
                <view class="quantity-label">车间结存:</view>
                <view 
                  class="quantity-value balance"
                  :class="[item.workshop_balance > 0 ? 'positive' : item.workshop_balance < 0 ? 'negative' : 'zero']"
                >
                  {{ formatBalance(item.workshop_balance) }} {{ item.unit }}
                </view>
              </view>
              
              <!-- 实发数量输入 -->
              <view class="quantity-row input-row">
                <view class="quantity-label">实发数量:</view>
                <view class="quantity-input-wrapper">
                  <input 
                    type="digit" 
                    v-model="item.issued_quantity"
                    placeholder="请输入实发数量"
                    @input="onIssuedQuantityChange(index)"
                  />
                  <text class="unit">{{ item.unit }}</text>
                </view>
              </view>
              
              <!-- 差异 -->
              <view v-if="item.variance !== 0" class="variance-row">
                <view class="variance-label">差异:</view>
                <view 
                  class="variance-value"
                  :class="{ 'positive': item.variance > 0, 'negative': item.variance < 0 }"
                >
                  {{ formatVariance(item.variance) }} {{ item.unit }}
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 步骤4: 确认发料 -->
      <view v-if="currentStep === 3" class="step-content">
        <view class="section-title">确认发料</view>
        
        <!-- 发料摘要 -->
        <view class="confirm-summary">
          <view class="summary-row">
            <view class="summary-label">BOM:</view>
            <view class="summary-value">{{ selectedBom.name }}</view>
          </view>
          <view class="summary-row">
            <view class="summary-label">部门:</view>
            <view class="summary-value">{{ selectedDepartment.name }}</view>
          </view>
          <view class="summary-row">
            <view class="summary-label">生产数量:</view>
            <view class="summary-value">{{ productionQuantity }}</view>
          </view>
          <view class="summary-row">
            <view class="summary-label">物料项数:</view>
            <view class="summary-value">{{ materialList.length }}项</view>
          </view>
        </view>
        
        <!-- 物料汇总 -->
        <view class="material-summary">
          <view class="summary-title">物料汇总</view>
          <view 
            v-for="(item, index) in materialList" 
            :key="index"
            class="summary-item"
          >
            <view class="item-name">{{ item.material_name }}</view>
            <view class="item-quantity">
              <text class="planned">计划: {{ item.planned_quantity }}</text>
              <text class="issued">实发: {{ item.issued_quantity }}</text>
              <text 
                v-if="item.variance !== 0"
                class="variance"
                :class="{ 'positive': item.variance > 0, 'negative': item.variance < 0 }"
              >
                差异: {{ formatVariance(item.variance) }}
              </text>
            </view>
          </view>
        </view>
        
        <!-- 备注 -->
        <view class="form-item">
          <view class="form-label">备注</view>
          <textarea 
            v-model="remark"
            placeholder="请输入备注（可选）"
            maxlength="200"
          />
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部操作按钮 -->
    <view class="bottom-actions">
      <view v-if="currentStep > 0" class="action-btn secondary" @click="prevStep">
        上一步
      </view>
      <view 
        v-if="currentStep < steps.length - 1"
        class="action-btn primary" 
        :class="{ 'disabled': !canNextStep }"
        @click="nextStep"
      >
        下一步
      </view>
      <view 
        v-if="currentStep === steps.length - 1"
        class="action-btn primary" 
        :class="{ 'disabled': isSubmitting }"
        @click="confirmIssue"
      >
        {{ isSubmitting ? '发料中...' : '确认发料' }}
      </view>
    </view>
  </view>
</template>

<script>
import bomService from '@/common/services/bomService.js'
import warehouseService from '@/common/services/warehouseService.js'
import SkeletonLoader from '@/components/common/skeleton-loader.vue'
import EmptyState from '@/components/common/empty-state.vue'

export default {
  components: {
    SkeletonLoader,
    EmptyState
  },
  
  data() {
    return {
      // 安全区高度
      safeAreaHeight: 30,
      
      // 步骤
      steps: ['选择BOM', '发料信息', '物料清单', '确认发料'],
      currentStep: 0,
      
      // BOM相关
      bomList: [],
      selectedBom: null,
      bomLoading: false,
      
      // 部门相关
      departments: [
        { name: '配料', value: '配料' },
        { name: '制片', value: '制片' },
        { name: '卷绕', value: '卷绕' },
        { name: '封装', value: '封装' },
        { name: '注液', value: '注液' },
        { name: '化成', value: '化成' },
        { name: '包装', value: '包装' }
      ],
      departmentIndex: -1,
      selectedDepartment: null,
      
      // 生产数量
      productionQuantity: '',
      
      // 物料清单
      materialList: [],
      materialLoading: false,
      
      // 备注
      remark: '',
      
      // 提交状态
      isSubmitting: false
    }
  },
  
  computed: {
    canNextStep() {
      if (this.currentStep === 0) {
        return !!this.selectedBom
      } else if (this.currentStep === 1) {
        return !!this.selectedDepartment && this.productionQuantity > 0
      } else if (this.currentStep === 2) {
        // 检查是否所有物料都已输入实发数量
        return this.materialList.every(item => item.issued_quantity > 0)
      }
      return true
    }
  },
  
  onLoad() {
    this.initSafeArea()
    this.loadBomList()
  },
  
  methods: {
    // 初始化安全区
    initSafeArea() {
      const systemInfo = uni.getSystemInfoSync()
      this.safeAreaHeight = systemInfo.statusBarHeight || 30
    },
    
    // 加载BOM列表
    async loadBomList() {
      this.bomLoading = true
      
      const result = await bomService.getBomList({
        page: 1,
        pageSize: 100
      })
      
      this.bomLoading = false
      
      if (result.success) {
        this.bomList = result.data
      } else {
        uni.showToast({
          title: result.message,
          icon: 'none'
        })
      }
    },
    
    // 选择BOM
    selectBom(bom) {
      this.selectedBom = bom
    },
    
    // 选择部门
    onDepartmentChange(e) {
      this.departmentIndex = e.detail.value
      this.selectedDepartment = this.departments[this.departmentIndex]
    },
    
    // 生产数量变化
    onProductionQuantityChange(e) {
      this.productionQuantity = e.detail.value
    },
    
    // 上一步
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },
    
    // 下一步
    async nextStep() {
      if (!this.canNextStep) return
      
      if (this.currentStep === 1) {
        // 从步骤2到步骤3，需要加载物料清单
        await this.loadMaterialList()
      }
      
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++
      }
    },
    
    // 加载物料清单
    async loadMaterialList() {
      if (!this.selectedBom || !this.productionQuantity) return
      
      this.materialLoading = true
      
      // 获取BOM计划用量
      const result = await bomService.getBomPlannedQuantity(
        this.selectedBom._id,
        parseFloat(this.productionQuantity)
      )
      
      if (result.success) {
        this.materialList = result.data.map(item => {
          // 计算建议发放量（考虑车间结存）
          const suggestedQuantity = item.workshop_balance < 0 
            ? item.planned_quantity + Math.abs(item.workshop_balance)
            : item.planned_quantity
          
          return {
            ...item,
            suggested_quantity: suggestedQuantity,
            issued_quantity: suggestedQuantity, // 默认使用建议发放量
            variance: 0
          }
        })
      } else {
        uni.showToast({
          title: result.message,
          icon: 'none'
        })
      }
      
      this.materialLoading = false
    },
    
    // 实发数量变化
    onIssuedQuantityChange(index) {
      const item = this.materialList[index]
      const issued = parseFloat(item.issued_quantity) || 0
      const planned = parseFloat(item.planned_quantity) || 0
      item.variance = issued - planned
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
    
    // 格式化差异
    formatVariance(variance) {
      if (variance > 0) return '+' + variance
      return variance
    },
    
    // 确认发料
    async confirmIssue() {
      if (this.isSubmitting) return
      
      this.isSubmitting = true
      
      const params = {
        bom_id: this.selectedBom._id,
        department: this.selectedDepartment.value,
        production_quantity: parseFloat(this.productionQuantity),
        items: this.materialList.map(item => ({
          material_id: item.material_id,
          planned_quantity: item.planned_quantity,
          issued_quantity: parseFloat(item.issued_quantity),
          variance: item.variance
        })),
        remark: this.remark
      }
      
      const result = await bomService.issueMaterials(params)
      
      this.isSubmitting = false
      
      if (result.success) {
        uni.showToast({
          title: '发料成功',
          icon: 'success'
        })
        
        // 延迟返回
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } else {
        uni.showToast({
          title: result.message,
          icon: 'none'
        })
      }
    },
    
    // 创建BOM
    handleCreateBom() {
      uni.navigateTo({
        url: '/pages/bom/bom-edit'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.bom-issue-page {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  padding-bottom: 120rpx;
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

.step-indicator {
  display: flex;
  padding: 30rpx;
  background: #fff;
  margin-bottom: 20rpx;
  
  .step-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 20rpx;
      left: 50%;
      width: 100%;
      height: 2rpx;
      background: #eee;
      z-index: 0;
    }
    
    &:last-child::after {
      display: none;
    }
    
    .step-number {
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      background: #eee;
      color: #999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      margin-bottom: 12rpx;
      z-index: 1;
    }
    
    .step-name {
      font-size: 22rpx;
      color: #999;
    }
    
    &.active {
      .step-number {
        background: #007aff;
        color: #fff;
      }
      
      .step-name {
        color: #007aff;
        font-weight: bold;
      }
    }
    
    &.completed {
      &::after {
        background: #007aff;
      }
      
      .step-number {
        background: #007aff;
        color: #fff;
      }
      
      .step-name {
        color: #007aff;
      }
    }
  }
}

.main-content {
  flex: 1;
  padding: 20rpx;
}

.step-content {
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
  }
}

.bom-list {
  .bom-item {
    background: #fff;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
    
    &.selected {
      border: 2rpx solid #007aff;
      background: #f0f9ff;
    }
    
    .bom-info {
      flex: 1;
      
      .bom-name {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 8rpx;
      }
      
      .bom-code {
        font-size: 24rpx;
        color: #999;
        margin-bottom: 4rpx;
      }
      
      .bom-desc {
        font-size: 24rpx;
        color: #666;
      }
    }
    
    .bom-badge {
      padding: 8rpx 16rpx;
      background: #f5f5f5;
      border-radius: 20rpx;
      font-size: 22rpx;
      color: #666;
    }
  }
}

.selected-bom-info {
  background: #f0f9ff;
  padding: 20rpx;
  border-radius: 8rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  
  .info-label {
    font-size: 26rpx;
    color: #666;
    margin-right: 12rpx;
  }
  
  .info-value {
    font-size: 28rpx;
    font-weight: bold;
    color: #007aff;
  }
}

.form-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  
  .form-label {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 16rpx;
  }
  
  .picker-value {
    font-size: 28rpx;
    color: #333;
    padding: 20rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
  }
  
  input, textarea {
    font-size: 28rpx;
    color: #333;
    padding: 20rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
    width: 100%;
  }
  
  textarea {
    min-height: 150rpx;
  }
}

.issue-summary {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  
  .summary-item {
    display: flex;
    padding: 12rpx 0;
    border-bottom: 1px solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .summary-label {
      font-size: 26rpx;
      color: #666;
      width: 150rpx;
    }
    
    .summary-value {
      flex: 1;
      font-size: 28rpx;
      color: #333;
      font-weight: bold;
    }
  }
}

.material-list {
  .material-item {
    background: #fff;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
    
    .material-header {
      margin-bottom: 20rpx;
      
      .material-info {
        .material-name {
          font-size: 30rpx;
          font-weight: bold;
          color: #333;
          margin-bottom: 8rpx;
        }
        
        .material-code {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
    
    .quantity-section {
      .quantity-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12rpx 0;
        border-bottom: 1px solid #f5f5f5;
        
        &.input-row {
          border-bottom: 2rpx solid #007aff;
          padding: 16rpx 0;
        }
        
        .quantity-label {
          font-size: 26rpx;
          color: #666;
        }
        
        .quantity-value {
          font-size: 28rpx;
          font-weight: bold;
          
          &.planned {
            color: #1989fa;
          }
          
          &.suggested {
            color: #ff976a;
          }
          
          &.balance {
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
        
        .quantity-input-wrapper {
          display: flex;
          align-items: center;
          
          input {
            width: 200rpx;
            padding: 12rpx 16rpx;
            background: #f5f5f5;
            border-radius: 8rpx;
            font-size: 28rpx;
            font-weight: bold;
            color: #007aff;
            text-align: right;
          }
          
          .unit {
            margin-left: 12rpx;
            font-size: 24rpx;
            color: #999;
          }
        }
      }
      
      .variance-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16rpx 0;
        margin-top: 8rpx;
        border-top: 2rpx dashed #eee;
        
        .variance-label {
          font-size: 26rpx;
          color: #666;
        }
        
        .variance-value {
          font-size: 32rpx;
          font-weight: bold;
          
          &.positive {
            color: #07c160;
          }
          
          &.negative {
            color: #ee0a24;
          }
        }
      }
    }
  }
}

.confirm-summary {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  
  .summary-row {
    display: flex;
    padding: 12rpx 0;
    border-bottom: 1px solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .summary-label {
      font-size: 26rpx;
      color: #666;
      width: 150rpx;
    }
    
    .summary-value {
      flex: 1;
      font-size: 28rpx;
      color: #333;
      font-weight: bold;
    }
  }
}

.material-summary {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  
  .summary-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .summary-item {
    padding: 16rpx 0;
    border-bottom: 1px solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .item-name {
      font-size: 26rpx;
      color: #333;
      margin-bottom: 12rpx;
    }
    
    .item-quantity {
      display: flex;
      gap: 20rpx;
      
      text {
        font-size: 24rpx;
        
        &.planned {
          color: #1989fa;
        }
        
        &.issued {
          color: #ff976a;
        }
        
        &.variance {
          &.positive {
            color: #07c160;
          }
          
          &.negative {
            color: #ee0a24;
          }
        }
      }
    }
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background: #fff;
  border-top: 1px solid #eee;
  display: flex;
  gap: 20rpx;
  z-index: 100;
  
  .action-btn {
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12rpx;
    font-size: 30rpx;
    font-weight: bold;
    
    &.primary {
      background: #007aff;
      color: #fff;
    }
    
    &.secondary {
      background: #f5f5f5;
      color: #666;
    }
    
    &.disabled {
      opacity: 0.5;
    }
  }
}
</style>
