<template>
  <view class="bom-detail-page">
    <SafeTop />
    <view class="header">
      <view class="header-left" @tap="goBack">
        <text class="icon-back">←</text>
      </view>
      <view class="header-title">BOM详情</view>
      <view class="header-right">
        <text class="btn-text" @tap="handleEdit">编辑</text>
      </view>
    </view>
    
    <scroll-view class="content" scroll-y>
      <!-- BOM基本信息 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">基本信息</text>
          <view class="status-badge" :class="bom.status">
            {{ bom.status === 'active' ? '正常' : '停用' }}
          </view>
        </view>
        <view class="card-body">
          <view class="info-row">
            <text class="label">BOM编码</text>
            <text class="value">{{ bom.code }}</text>
          </view>
          <view class="info-row">
            <text class="label">BOM名称</text>
            <text class="value">{{ bom.name }}</text>
          </view>
          <view class="info-row">
            <text class="label">版本</text>
            <text class="value">{{ bom.version }}</text>
          </view>
          <view class="info-row">
            <text class="label">产品名称</text>
            <text class="value">{{ bom.product_name }}</text>
          </view>
          <view class="info-row">
            <text class="label">产品规格</text>
            <text class="value">{{ bom.product_spec }}</text>
          </view>
        </view>
      </view>
      
      <!-- 物料明细 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">物料明细（{{ items.length }}）</text>
        </view>
        <view class="card-body">
          <view class="items-list">
            <view class="item-row" v-for="item in items" :key="item._id">
              <view class="item-info">
                <text class="item-name">{{ item.material_name }}</text>
                <text class="item-spec">{{ item.material_spec }}</text>
              </view>
              <view class="item-quantity">
                <text class="quantity">{{ item.quantity }} {{ item.unit }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <view class="bottom-bar">
      <view class="btn btn-delete" @tap="handleDelete">删除</view>
      <view class="btn btn-primary" @tap="handleIssue">发料</view>
    </view>
  </view>
</template>

<script>
import SafeTop from '@/components/page-header/SafeTop.vue'
import bomService from '@/common/services/bomService.js'

export default {
  components: { SafeTop },
  data() {
    return {
      bomId: '',
      bom: {},
      items: []
    }
  },
  onLoad(options) {
    if (options.id) {
      this.bomId = options.id
      this.loadBomDetail()
    }
  },
  methods: {
    async loadBomDetail() {
      const result = await bomService.getBomDetail(this.bomId)
      if (result.success) {
        this.bom = result.data.header || {}
        this.items = result.data.items || []
      }
    },
    handleEdit() {
      uni.navigateTo({
        url: `/pages/bom/bom-edit?id=${this.bomId}`
      })
    },
    handleIssue() {
      uni.navigateTo({
        url: `/pages/bom-issue/bom-issue-page?bom_id=${this.bomId}`
      })
    },
    async handleDelete() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除该BOM吗？',
        success: async (res) => {
          if (res.confirm) {
            const result = await bomService.deleteBom(this.bomId)
            if (result.success) {
              uni.showToast({ title: '删除成功', icon: 'success' })
              setTimeout(() => uni.navigateBack(), 1500)
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
.bom-detail-page { width: 100%; height: 100vh; background-color: #f5f5f5; display: flex; flex-direction: column; }
.header { display: flex; align-items: center; justify-content: space-between; height: 88rpx; padding: 0 30rpx; background-color: #fff; border-bottom: 1rpx solid #eee; }
.header-left, .header-right { width: 120rpx; }
.icon-back { font-size: 40rpx; color: #333; }
.header-title { font-size: 32rpx; font-weight: 600; color: #333; }
.btn-text { font-size: 28rpx; color: #FF6B00; }
.content { flex: 1; padding: 20rpx; }
.card { background-color: #fff; border-radius: 16rpx; margin-bottom: 20rpx; overflow: hidden; }
.card-header { display: flex; align-items: center; justify-content: space-between; padding: 30rpx; border-bottom: 1rpx solid #f5f5f5; }
.card-title { font-size: 32rpx; font-weight: 600; color: #333; }
.status-badge { padding: 8rpx 20rpx; border-radius: 20rpx; font-size: 24rpx; color: #fff; }
.status-badge.active { background-color: #52c41a; }
.card-body { padding: 30rpx; }
.info-row { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 0; border-bottom: 1rpx solid #f5f5f5; }
.label { font-size: 28rpx; color: #999; }
.value { font-size: 28rpx; color: #333; font-weight: 500; }
.items-list { display: flex; flex-direction: column; gap: 20rpx; }
.item-row { display: flex; align-items: center; justify-content: space-between; padding: 20rpx; background-color: #f9f9f9; border-radius: 12rpx; }
.item-info { flex: 1; }
.item-name { font-size: 28rpx; color: #333; font-weight: 500; }
.item-spec { font-size: 24rpx; color: #999; margin-top: 8rpx; }
.item-quantity { text-align: right; }
.quantity { font-size: 28rpx; color: #FF6B00; font-weight: 600; }
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; display: flex; gap: 20rpx; padding: 20rpx; background-color: #fff; border-top: 1rpx solid #eee; }
.btn { flex: 1; display: flex; align-items: center; justify-content: center; height: 88rpx; border-radius: 12rpx; font-size: 28rpx; }
.btn-delete { background-color: #fff; border: 1rpx solid #ff4d4f; color: #ff4d4f; }
.btn-primary { background-color: #FF6B00; color: #fff; }
</style>
