<template>
  <view class="profile-page">
    <SafeTop />
    
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-avatar">
        <text class="avatar-text">{{ userInfo.name ? userInfo.name.charAt(0) : 'U' }}</text>
      </view>
      <view class="user-info">
        <text class="user-name">{{ userInfo.name || '未登录' }}</text>
        <text class="user-role">{{ userInfo.role || '普通用户' }}</text>
      </view>
      <view class="user-edit" @tap="editProfile">
        <text class="edit-icon">✏️</text>
      </view>
    </view>
    
    <!-- 统计数据 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ stats.todayInbound || 0 }}</text>
        <text class="stat-label">今日入库</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.todayOutbound || 0 }}</text>
        <text class="stat-label">今日出库</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.totalOperations || 0 }}</text>
        <text class="stat-label">总操作数</text>
      </view>
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item" @tap="goToPage('/pages/system/settings')">
        <text class="menu-icon">⚙️</text>
        <text class="menu-label">系统设置</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goToPage('/pages/manage/permission-manage')">
        <text class="menu-icon">🔐</text>
        <text class="menu-label">权限管理</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goToPage('/pages/log/operation-log')">
        <text class="menu-icon">📋</text>
        <text class="menu-label">操作日志</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="changePassword">
        <text class="menu-icon">🔑</text>
        <text class="menu-label">修改密码</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
    
    <!-- 关于 -->
    <view class="menu-section">
      <view class="menu-item" @tap="about">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-label">关于我们</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="feedback">
        <text class="menu-icon">💬</text>
        <text class="menu-label">意见反馈</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
    
    <!-- 退出登录 -->
    <view class="logout-button" @tap="logout">
      退出登录
    </view>
    
    <!-- 编辑弹窗 -->
    <view v-if="showEditDialog" class="dialog-mask" @tap="closeEditDialog">
      <view class="dialog-content" @tap.stop>
        <view class="dialog-header">
          <text class="dialog-title">编辑资料</text>
          <text class="dialog-close" @tap="closeEditDialog">×</text>
        </view>
        <view class="dialog-body">
          <view class="form-item">
            <text class="form-label">姓名</text>
            <input class="form-input" v-model="editData.name" placeholder="请输入姓名" />
          </view>
          <view class="form-item">
            <text class="form-label">手机号</text>
            <input class="form-input" v-model="editData.phone" placeholder="请输入手机号" />
          </view>
          <view class="form-item">
            <text class="form-label">邮箱</text>
            <input class="form-input" v-model="editData.email" placeholder="请输入邮箱" />
          </view>
        </view>
        <view class="dialog-footer">
          <view class="btn btn-cancel" @tap="closeEditDialog">取消</view>
          <view class="btn btn-primary" @tap="saveProfile">保存</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import SafeTop from '@/components/page-header/SafeTop.vue'

export default {
  components: { SafeTop },
  data() {
    return {
      userInfo: {
        name: '管理员',
        role: '系统管理员',
        phone: '',
        email: ''
      },
      stats: {
        todayInbound: 0,
        todayOutbound: 0,
        totalOperations: 0
      },
      showEditDialog: false,
      editData: {}
    }
  },
  onLoad() {
    this.loadUserInfo()
    this.loadStats()
  },
  methods: {
    loadUserInfo() {
      // 从本地存储加载用户信息
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.userInfo = userInfo
      }
    },
    
    loadStats() {
      // 模拟统计数据
      this.stats = {
        todayInbound: 15,
        todayOutbound: 23,
        totalOperations: 156
      }
    },
    
    editProfile() {
      this.editData = { ...this.userInfo }
      this.showEditDialog = true
    },
    
    closeEditDialog() {
      this.showEditDialog = false
    },
    
    saveProfile() {
      this.userInfo = { ...this.userInfo, ...this.editData }
      uni.setStorageSync('userInfo', this.userInfo)
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
      this.closeEditDialog()
    },
    
    goToPage(url) {
      uni.navigateTo({ url })
    },
    
    changePassword() {
      uni.showToast({
        title: '修改密码功能开发中',
        icon: 'none'
      })
    },
    
    about() {
      uni.showModal({
        title: '关于我们',
        content: 'WOERP仓库管理系统 v1.0.0\n\n一款专业的仓库管理系统',
        showCancel: false
      })
    },
    
    feedback() {
      uni.showToast({
        title: '意见反馈功能开发中',
        icon: 'none'
      })
    },
    
    logout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.clearStorageSync()
            uni.reLaunch({
              url: '/pages/login/login'
            })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.profile-page {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 60rpx 30rpx;
  background: linear-gradient(135deg, #FF6B00 0%, #FF8C3A 100%);
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
}

.avatar-text {
  font-size: 48rpx;
  color: #fff;
  font-weight: 600;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 36rpx;
  color: #fff;
  font-weight: 600;
  display: block;
  margin-bottom: 12rpx;
}

.user-role {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
}

.user-edit {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-icon {
  font-size: 32rpx;
}

.stats-card {
  display: flex;
  margin: -40rpx 20rpx 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx 0;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 40rpx;
  color: #FF6B00;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background-color: #f0f0f0;
}

.menu-section {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.menu-label {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.menu-arrow {
  font-size: 40rpx;
  color: #ccc;
  transform: rotate(90deg);
}

.logout-button {
  margin: 40rpx 20rpx;
  padding: 28rpx;
  background-color: #fff;
  color: #ff4d4f;
  text-align: center;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
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
