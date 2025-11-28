<template>
  <view class="permission-page">
    <SafeTop />
    
    <view class="header">
      <view class="header-left" @tap="goBack">
        <text class="icon-back">←</text>
      </view>
      <view class="header-title">权限管理</view>
      <view class="header-right">
        <text class="btn-text" @tap="showAddDialog">+ 新增</text>
      </view>
    </view>
    
    <scroll-view class="content" scroll-y>
      <view v-if="roles.length === 0" class="empty-state">
        <text class="empty-icon">🔐</text>
        <text class="empty-text">暂无角色</text>
        <view class="btn-add-empty" @tap="showAddDialog">添加角色</view>
      </view>
      
      <view v-else class="role-list">
        <view class="role-card" v-for="role in roles" :key="role._id">
          <view class="role-header">
            <view class="role-info">
              <text class="role-name">{{ role.name }}</text>
              <text class="role-desc">{{ role.description }}</text>
            </view>
            <view class="role-actions">
              <view class="btn-icon" @tap="showEditDialog(role)">
                <text class="icon">✏️</text>
              </view>
              <view class="btn-icon" @tap="deleteRole(role)">
                <text class="icon">🗑️</text>
              </view>
            </view>
          </view>
          <view class="role-permissions">
            <text class="permission-title">权限列表：</text>
            <view class="permission-tags">
              <text class="permission-tag" v-for="(perm, index) in role.permissions" :key="index">
                {{ getPermissionName(perm) }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 新增/编辑弹窗 -->
    <view v-if="showDialog" class="dialog-mask" @tap="closeDialog">
      <view class="dialog-content" @tap.stop>
        <view class="dialog-header">
          <text class="dialog-title">{{ isEdit ? '编辑角色' : '新增角色' }}</text>
          <text class="dialog-close" @tap="closeDialog">×</text>
        </view>
        <view class="dialog-body">
          <view class="form-item required">
            <text class="form-label">角色名称</text>
            <input class="form-input" v-model="formData.name" placeholder="请输入角色名称" />
          </view>
          <view class="form-item">
            <text class="form-label">描述</text>
            <textarea class="form-textarea" v-model="formData.description" placeholder="请输入角色描述" />
          </view>
          <view class="form-item">
            <text class="form-label">权限选择</text>
            <view class="permission-checkboxes">
              <label class="checkbox-item" v-for="perm in allPermissions" :key="perm.value">
                <checkbox :value="perm.value" :checked="formData.permissions.includes(perm.value)" @tap="togglePermission(perm.value)" />
                <text class="checkbox-label">{{ perm.label }}</text>
              </label>
            </view>
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
      roles: [],
      showDialog: false,
      isEdit: false,
      editingId: '',
      formData: {
        name: '',
        description: '',
        permissions: []
      },
      allPermissions: [
        { value: 'material:view', label: '查看物料' },
        { value: 'material:edit', label: '编辑物料' },
        { value: 'material:delete', label: '删除物料' },
        { value: 'bom:view', label: '查看BOM' },
        { value: 'bom:edit', label: '编辑BOM' },
        { value: 'warehouse:inbound', label: '入库操作' },
        { value: 'warehouse:outbound', label: '出库操作' },
        { value: 'system:settings', label: '系统设置' },
        { value: 'system:manage', label: '系统管理' }
      ]
    }
  },
  onLoad() {
    this.loadRoles()
  },
  methods: {
    async loadRoles() {
      try {
        const result = await db.get('roles', {})
        if (result.success) {
          this.roles = result.data || []
        }
      } catch (error) {
        console.error('加载角色失败:', error)
      }
    },
    
    showAddDialog() {
      this.isEdit = false
      this.formData = { name: '', description: '', permissions: [] }
      this.showDialog = true
    },
    
    showEditDialog(role) {
      this.isEdit = true
      this.editingId = role._id
      this.formData = { ...role, permissions: [...role.permissions] }
      this.showDialog = true
    },
    
    closeDialog() {
      this.showDialog = false
    },
    
    togglePermission(value) {
      const index = this.formData.permissions.indexOf(value)
      if (index > -1) {
        this.formData.permissions.splice(index, 1)
      } else {
        this.formData.permissions.push(value)
      }
    },
    
    getPermissionName(value) {
      const perm = this.allPermissions.find(p => p.value === value)
      return perm ? perm.label : value
    },
    
    async handleSave() {
      if (!this.formData.name) {
        uni.showToast({ title: '请输入角色名称', icon: 'none' })
        return
      }
      try {
        let result
        if (this.isEdit) {
          result = await db.update('roles', this.editingId, this.formData)
        } else {
          result = await db.add('roles', this.formData)
        }
        if (result.success) {
          uni.showToast({ title: '保存成功', icon: 'success' })
          this.closeDialog()
          this.loadRoles()
        }
      } catch (error) {
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    },
    
    deleteRole(role) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除角色"${role.name}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            const result = await db.remove('roles', role._id)
            if (result.success) {
              uni.showToast({ title: '删除成功', icon: 'success' })
              this.loadRoles()
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
.permission-page { width: 100%; height: 100vh; background-color: #f5f5f5; display: flex; flex-direction: column; }
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
.role-list { display: flex; flex-direction: column; gap: 20rpx; }
.role-card { background-color: #fff; border-radius: 16rpx; padding: 30rpx; }
.role-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20rpx; padding-bottom: 20rpx; border-bottom: 1rpx solid #f5f5f5; }
.role-info { flex: 1; }
.role-name { font-size: 32rpx; font-weight: 600; color: #333; display: block; margin-bottom: 12rpx; }
.role-desc { font-size: 24rpx; color: #999; display: block; }
.role-actions { display: flex; gap: 16rpx; }
.btn-icon { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; background-color: #f5f5f5; border-radius: 50%; }
.icon { font-size: 28rpx; }
.role-permissions { }
.permission-title { font-size: 26rpx; color: #666; display: block; margin-bottom: 16rpx; }
.permission-tags { display: flex; flex-wrap: wrap; gap: 12rpx; }
.permission-tag { padding: 8rpx 16rpx; background-color: #e6f7ff; color: #1890ff; border-radius: 8rpx; font-size: 22rpx; }
.dialog-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.dialog-content { width: 640rpx; max-height: 80vh; background-color: #fff; border-radius: 16rpx; overflow: hidden; display: flex; flex-direction: column; }
.dialog-header { display: flex; align-items: center; justify-content: space-between; padding: 30rpx; border-bottom: 1rpx solid #f5f5f5; }
.dialog-title { font-size: 32rpx; font-weight: 600; color: #333; }
.dialog-close { font-size: 48rpx; color: #999; line-height: 1; }
.dialog-body { flex: 1; overflow-y: auto; padding: 30rpx; }
.form-item { margin-bottom: 30rpx; }
.form-item.required .form-label::before { content: '*'; color: #ff4d4f; margin-right: 8rpx; }
.form-label { font-size: 28rpx; color: #333; display: block; margin-bottom: 16rpx; }
.form-input { width: 100%; height: 72rpx; padding: 0 24rpx; background-color: #f5f5f5; border-radius: 8rpx; font-size: 28rpx; }
.form-textarea { width: 100%; min-height: 150rpx; padding: 16rpx 24rpx; background-color: #f5f5f5; border-radius: 8rpx; font-size: 28rpx; }
.permission-checkboxes { display: flex; flex-direction: column; gap: 20rpx; }
.checkbox-item { display: flex; align-items: center; }
.checkbox-label { margin-left: 16rpx; font-size: 26rpx; color: #333; }
.dialog-footer { display: flex; gap: 20rpx; padding: 20rpx 30rpx 30rpx; border-top: 1rpx solid #f5f5f5; }
.btn { flex: 1; display: flex; align-items: center; justify-content: center; height: 72rpx; border-radius: 8rpx; font-size: 28rpx; }
.btn-cancel { background-color: #f5f5f5; color: #666; }
.btn-primary { background-color: #FF6B00; color: #fff; }
</style>
