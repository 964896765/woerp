<template>
  <view class="department-manage-page">
    <SafeTop />
    
    <view class="header">
      <view class="header-left" @tap="goBack">
        <text class="icon-back">←</text>
      </view>
      <view class="header-title">部门管理</view>
      <view class="header-right">
        <text class="btn-text" @tap="showAddDialog">+ 新增</text>
      </view>
    </view>
    
    <scroll-view class="content" scroll-y>
      <view v-if="departments.length === 0" class="empty-state">
        <text class="empty-icon">🏭</text>
        <text class="empty-text">暂无部门</text>
        <view class="btn-add-empty" @tap="showAddDialog">添加部门</view>
      </view>
      
      <view v-else class="department-list">
        <view class="department-card" v-for="dept in departments" :key="dept._id">
          <view class="department-header">
            <view class="department-info">
              <text class="department-name">{{ dept.name }}</text>
              <text class="department-type">{{ dept.type }}</text>
            </view>
            <view class="department-actions">
              <view class="btn-icon" @tap="showEditDialog(dept)">
                <text class="icon">✏️</text>
              </view>
              <view class="btn-icon" @tap="deleteDepartment(dept)">
                <text class="icon">🗑️</text>
              </view>
            </view>
          </view>
          <view class="department-body" v-if="dept.description">
            <text class="department-desc">{{ dept.description }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 新增/编辑弹窗 -->
    <view v-if="showDialog" class="dialog-mask" @tap="closeDialog">
      <view class="dialog-content" @tap.stop>
        <view class="dialog-header">
          <text class="dialog-title">{{ isEdit ? '编辑部门' : '新增部门' }}</text>
          <text class="dialog-close" @tap="closeDialog">×</text>
        </view>
        <view class="dialog-body">
          <view class="form-item required">
            <text class="form-label">部门名称</text>
            <input class="form-input" v-model="formData.name" placeholder="请输入部门名称" />
          </view>
          <view class="form-item required">
            <text class="form-label">部门类型</text>
            <input class="form-input" v-model="formData.type" placeholder="如：生产部门、管理部门" />
          </view>
          <view class="form-item">
            <text class="form-label">描述</text>
            <textarea class="form-textarea" v-model="formData.description" placeholder="请输入部门描述" />
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
      departments: [],
      showDialog: false,
      isEdit: false,
      editingId: '',
      formData: { name: '', type: '', description: '' }
    }
  },
  onLoad() {
    this.loadDepartments()
  },
  methods: {
    async loadDepartments() {
      try {
        const result = await db.get('departments', {})
        if (result.success) {
          this.departments = result.data || []
        }
      } catch (error) {
        console.error('加载部门失败:', error)
      }
    },
    showAddDialog() {
      this.isEdit = false
      this.formData = { name: '', type: '', description: '' }
      this.showDialog = true
    },
    showEditDialog(dept) {
      this.isEdit = true
      this.editingId = dept._id
      this.formData = { ...dept }
      this.showDialog = true
    },
    closeDialog() {
      this.showDialog = false
    },
    async handleSave() {
      if (!this.formData.name) {
        uni.showToast({ title: '请输入部门名称', icon: 'none' })
        return
      }
      if (!this.formData.type) {
        uni.showToast({ title: '请输入部门类型', icon: 'none' })
        return
      }
      try {
        let result
        if (this.isEdit) {
          result = await db.update('departments', this.editingId, this.formData)
        } else {
          result = await db.add('departments', this.formData)
        }
        if (result.success) {
          uni.showToast({ title: '保存成功', icon: 'success' })
          this.closeDialog()
          this.loadDepartments()
        }
      } catch (error) {
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    },
    deleteDepartment(dept) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除部门"${dept.name}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            const result = await db.remove('departments', dept._id)
            if (result.success) {
              uni.showToast({ title: '删除成功', icon: 'success' })
              this.loadDepartments()
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
.department-manage-page { width: 100%; height: 100vh; background-color: #f5f5f5; display: flex; flex-direction: column; }
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
.department-list { display: flex; flex-direction: column; gap: 20rpx; }
.department-card { background-color: #fff; border-radius: 16rpx; padding: 30rpx; }
.department-header { display: flex; align-items: flex-start; justify-content: space-between; }
.department-info { flex: 1; }
.department-name { font-size: 32rpx; font-weight: 600; color: #333; display: block; margin-bottom: 12rpx; }
.department-type { display: inline-block; padding: 6rpx 16rpx; background-color: #e6f7ff; color: #1890ff; border-radius: 8rpx; font-size: 22rpx; }
.department-actions { display: flex; gap: 16rpx; }
.btn-icon { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; background-color: #f5f5f5; border-radius: 50%; }
.icon { font-size: 28rpx; }
.department-body { margin-top: 20rpx; padding-top: 20rpx; border-top: 1rpx solid #f5f5f5; }
.department-desc { font-size: 26rpx; color: #666; line-height: 1.5; }
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
