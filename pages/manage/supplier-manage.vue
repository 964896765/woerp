<template>
  <view class="supplier-manage-page">
    <SafeTop />
    
    <view class="header">
      <view class="header-left" @tap="goBack">
        <text class="icon-back">←</text>
      </view>
      <view class="header-title">供应商管理</view>
      <view class="header-right">
        <text class="btn-text" @tap="showAddDialog">+ 新增</text>
      </view>
    </view>
    
    <scroll-view class="content" scroll-y>
      <view v-if="suppliers.length === 0" class="empty-state">
        <text class="empty-icon">🏢</text>
        <text class="empty-text">暂无供应商</text>
        <view class="btn-add-empty" @tap="showAddDialog">添加供应商</view>
      </view>
      
      <view v-else class="supplier-list">
        <view class="supplier-card" v-for="supplier in suppliers" :key="supplier._id">
          <view class="supplier-header">
            <text class="supplier-name">{{ supplier.name }}</text>
            <view class="supplier-actions">
              <view class="btn-icon" @tap="showEditDialog(supplier)">
                <text class="icon">✏️</text>
              </view>
              <view class="btn-icon" @tap="deleteSupplier(supplier)">
                <text class="icon">🗑️</text>
              </view>
            </view>
          </view>
          <view class="supplier-body">
            <view class="info-row" v-if="supplier.contact">
              <text class="label">联系人：</text>
              <text class="value">{{ supplier.contact }}</text>
            </view>
            <view class="info-row" v-if="supplier.phone">
              <text class="label">电话：</text>
              <text class="value">{{ supplier.phone }}</text>
            </view>
            <view class="info-row" v-if="supplier.address">
              <text class="label">地址：</text>
              <text class="value">{{ supplier.address }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 新增/编辑弹窗 -->
    <view v-if="showDialog" class="dialog-mask" @tap="closeDialog">
      <view class="dialog-content" @tap.stop>
        <view class="dialog-header">
          <text class="dialog-title">{{ isEdit ? '编辑供应商' : '新增供应商' }}</text>
          <text class="dialog-close" @tap="closeDialog">×</text>
        </view>
        <view class="dialog-body">
          <view class="form-item required">
            <text class="form-label">供应商名称</text>
            <input class="form-input" v-model="formData.name" placeholder="请输入供应商名称" />
          </view>
          <view class="form-item">
            <text class="form-label">联系人</text>
            <input class="form-input" v-model="formData.contact" placeholder="请输入联系人" />
          </view>
          <view class="form-item">
            <text class="form-label">联系电话</text>
            <input class="form-input" v-model="formData.phone" placeholder="请输入联系电话" />
          </view>
          <view class="form-item">
            <text class="form-label">地址</text>
            <textarea class="form-textarea" v-model="formData.address" placeholder="请输入地址" />
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
import { db } from '@/common/api/unicloud.js'

export default {
  components: { SafeTop },
  data() {
    return {
      suppliers: [],
      showDialog: false,
      isEdit: false,
      editingId: '',
      formData: { name: '', contact: '', phone: '', address: '' }
    }
  },
  onLoad() {
    this.loadSuppliers()
  },
  methods: {
    async loadSuppliers() {
      try {
        const result = await db.get('suppliers', {})
        if (result.success) {
          this.suppliers = result.data || []
        }
      } catch (error) {
        console.error('加载供应商失败:', error)
      }
    },
    showAddDialog() {
      this.isEdit = false
      this.formData = { name: '', contact: '', phone: '', address: '' }
      this.showDialog = true
    },
    showEditDialog(supplier) {
      this.isEdit = true
      this.editingId = supplier._id
      this.formData = { ...supplier }
      this.showDialog = true
    },
    closeDialog() {
      this.showDialog = false
    },
    async handleSave() {
      if (!this.formData.name) {
        uni.showToast({ title: '请输入供应商名称', icon: 'none' })
        return
      }
      try {
        let result
        if (this.isEdit) {
          result = await db.update('suppliers', this.editingId, this.formData)
        } else {
          result = await db.add('suppliers', this.formData)
        }
        if (result.success) {
          uni.showToast({ title: '保存成功', icon: 'success' })
          this.closeDialog()
          this.loadSuppliers()
        }
      } catch (error) {
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    },
    deleteSupplier(supplier) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除供应商"${supplier.name}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            const result = await db.remove('suppliers', supplier._id)
            if (result.success) {
              uni.showToast({ title: '删除成功', icon: 'success' })
              this.loadSuppliers()
            }
          }
        }
      })
    },
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.supplier-manage-page { width: 100%; height: 100vh; background-color: #f5f5f5; display: flex; flex-direction: column; }
.header { display: flex; align-items: center; justify-content: space-between; height: 88rpx; padding: 0 30rpx; background-color: #fff; border-bottom: 1rpx solid #eee; }
.header-left, .header-right { width: 120rpx; }
.icon-back { font-size: 40rpx; color: #333; }
.header-title { font-size: 32rpx; font-weight: 600; color: #333; }
.btn-text { font-size: 28rpx; color: #FF6B00; }
.content { flex: 1; padding: 20rpx; }
.empty-state { padding: 150rpx 0; text-align: center; }
.empty-icon { font-size: 120rpx; display: block; margin-bottom: 30rpx; }
.empty-text { font-size: 28rpx; color: #999; display: block; margin-bottom: 40rpx; }
.btn-add-empty { display: inline-block; padding: 16rpx 48rpx; background-color: #FF6B00; color: #fff; border-radius: 48rpx; font-size: 28rpx; }
.supplier-list { display: flex; flex-direction: column; gap: 20rpx; }
.supplier-card { background-color: #fff; border-radius: 16rpx; padding: 30rpx; }
.supplier-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20rpx; padding-bottom: 20rpx; border-bottom: 1rpx solid #f5f5f5; }
.supplier-name { font-size: 32rpx; font-weight: 600; color: #333; }
.supplier-actions { display: flex; gap: 16rpx; }
.btn-icon { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; background-color: #f5f5f5; border-radius: 50%; }
.icon { font-size: 28rpx; }
.supplier-body { display: flex; flex-direction: column; gap: 12rpx; }
.info-row { display: flex; font-size: 26rpx; }
.label { color: #999; min-width: 140rpx; }
.value { color: #333; flex: 1; }
.dialog-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.dialog-content { width: 640rpx; background-color: #fff; border-radius: 16rpx; overflow: hidden; }
.dialog-header { display: flex; align-items: center; justify-content: space-between; padding: 30rpx; border-bottom: 1rpx solid #f5f5f5; }
.dialog-title { font-size: 32rpx; font-weight: 600; color: #333; }
.dialog-close { font-size: 48rpx; color: #999; line-height: 1; }
.dialog-body { padding: 30rpx; }
.form-item { margin-bottom: 30rpx; }
.form-item.required .form-label::before { content: '*'; color: #ff4d4f; margin-right: 8rpx; }
.form-label { font-size: 28rpx; color: #333; display: block; margin-bottom: 16rpx; }
.form-input { width: 100%; height: 72rpx; padding: 0 24rpx; background-color: #f5f5f5; border-radius: 8rpx; font-size: 28rpx; }
.form-textarea { width: 100%; min-height: 150rpx; padding: 16rpx 24rpx; background-color: #f5f5f5; border-radius: 8rpx; font-size: 28rpx; }
.dialog-footer { display: flex; gap: 20rpx; padding: 20rpx 30rpx 30rpx; }
.btn { flex: 1; display: flex; align-items: center; justify-content: center; height: 72rpx; border-radius: 8rpx; font-size: 28rpx; }
.btn-cancel { background-color: #f5f5f5; color: #666; }
.btn-primary { background-color: #FF6B00; color: #fff; }
</style>
