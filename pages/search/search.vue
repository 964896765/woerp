<template>
  <view class="search-page" @touchstart="onAxisStart" @touchmove="onAxisMove" @touchend="onAxisEnd" @touchcancel="onAxisEnd">
    <!-- 顶部搜索栏 -->
    <view class="search-head">
      <text class="back-btn" @tap="goBack">←</text>
      <view class="search-input">
        <text class="search-icon">🔍</text>
        <input
          class="ipt"
          v-model="kw"
          type="text"
          :placeholder="placeholder"
          confirm-type="search"
          @confirm="doSearch"
          @input="onInput"
        />
        <text v-if="kw" class="clear-icon" @tap="clearKw">×</text>
      </view>
      <text class="btn" @tap="doSearch">搜索</text>
    </view>
    
    <!-- 分类标签栏 -->
    <scroll-view class="tabbar" :scroll-x="true" :show-scrollbar="false" :scroll-into-view="scrollInto" enable-flex>
      <view v-for="(tab, i) in tabList" :key="tab.id" :id="'tab-' + i" class="tab" @tap="switchTab(i)">
        <text :class="['tab-text', i===tabIndex?'active':'']">{{ tab.name }}</text>
      </view>
    </scroll-view>
    
    <!-- 内容区域 - 使用swiper实现横向滑动 -->
    <swiper class="swiper" :current="tabIndex" :duration="300" :disable-touch="swiperDisable" @change="onSwiperChange">
      <swiper-item>
        <scroll-view scroll-y class="search-scroll" :style="{ paddingBottom: bottomPadRpx, height: '100%' }">
          <!-- 搜索中状态 -->
          <view v-if="isSearching" class="search-loading">
            <text class="loading-icon">⏳</text>
            <text class="loading-text">正在搜索中...</text>
          </view>

          <!-- 结果置顶 -->
          <view class="block" v-if="kwSearched">
            <view class="block-title">
              <text>搜索结果</text>
              <text class="result-count" v-if="results.length">({{ results.length }}个结果)</text>
            </view>
            <view v-if="results.length" class="result-list">
              <view class="res-row" v-for="m in results" :key="m.id">
                <text class="list-icon">📋</text>
                <view class="material-info">
                  <text class="name">{{ m.code }} - {{ m.name }}</text>
                  <text class="detail">库存: {{ m.stock }}{{ m.unit }} | {{ m.category }}</text>
                </view>
                <view class="ops">
                  <view class="op-btn op-btn-add" @tap="chooseTypeAndQty(m, 'inbound')">+</view>
                  <view class="op-btn op-btn-minus" @tap="chooseTypeAndQty(m, 'outbound')">-</view>
                </view>
              </view>
            </view>
            <view v-else class="empty">
              <text class="empty-icon">🔍</text>
              <text class="t">没有找到相关材料</text>
              <text class="empty-tip">尝试使用其他关键词搜索</text>
            </view>
          </view>

          <!-- 热门搜索 -->
          <view class="block">
            <view class="block-title">热门搜索</view>
            <view class="chips">
              <view v-for="(h,i) in hotKeys" :key="`hot-${i}`" class="chip" @tap="pickHot(h)">{{ h }}</view>
            </view>
          </view>
        </scroll-view>
      </swiper-item>
      
      <swiper-item>
        <scroll-view scroll-y class="search-scroll" :style="{ paddingBottom: bottomPadRpx, height: '100%' }">
          <!-- 搜索历史 -->
          <view class="block">
            <view class="block-title history-title">
              <text>搜索历史</text>
              <text class="clear-all" v-if="history.length" @tap="clearHistory">清空</text>
            </view>

            <view v-if="history.length" class="history-list">
              <view class="his-row" v-for="(h,i) in history" :key="i">
                <view class="his-left" @tap="pickHistory(h)">
                  <text class="clock-icon">🕐</text>
                  <text class="his-text">{{ h }}</text>
                </view>
                <view class="del" @tap.stop="removeHistory(i)"><text class="del-icon">×</text></view>
              </view>
            </view>
            <view v-else class="empty-small">暂无历史</view>
          </view>
        </scroll-view>
      </swiper-item>
    </swiper>

    <!-- 购物车图标 -->
    <view v-if="cartList.length > 0" class="cart-fab" @click="goToCheckout">
      <text class="cart-icon">🛒</text>
      <view class="cart-badge">{{ cartList.length }}</view>
    </view>

    <!-- 自定义键盘组件 -->
    <custom-keyboard
      :show.sync="showQtyPopup"
      :materialInfo="currentMaterial"
      :operationType="currentType"
      v-model="qtyStr"
      @confirm="confirmQuantity"
      @cancel="cancelQuantity"
    />
  </view>
</template>

<script>
import { materialSearch } from '@/common/materialData.js'
import { uiUtils } from '@/common/util.js'
import customKeyboard from '@/components/custom-keyboard/custom-keyboard.vue'

export default {
  components: {
    customKeyboard
  },
  data(){
    return {
      kw:'', placeholder:'输入物料编码/名称',
      hotKeys:[],
      history:[], results:[], kwSearched:false, isSearching:false,
      // 清单
      cartList:[], showCartModal:false,
      // 数量
      showQtyPopup:false, qtyStr:'', currentType:'inbound', currentMaterial:null,
      // 搜索实例
      materialSearch: materialSearch,
      // 底部安全区内边距
      bottomPadRpx: '100rpx', // 默认兜底：至少 100rpx
      // 横向滑动相关
      scrollInto: '',
      tabIndex: 0,
      swiperDisable: false,
      _axisIntent: null,
      _sx: 0,
      _sy: 0,
      tabList: [
        { id: 'tab01', name: '搜索', nid: 0 },
        { id: 'tab02', name: '历史', nid: 1 }
      ]
    }
  },
  computed:{
    validQty(){
      if (!this.qtyStr) return false
      if (!/^\d+(\.\d{0,2})?$/.test(this.qtyStr)) return false
      return parseFloat(this.qtyStr) > 0
    }
  },
  onLoad(){
    this.history = uni.getStorageSync('search_history') || []
    this.hotKeys = this.materialSearch.getHotKeys()
    this.loadCartList()
  },
  mounted() {
    // 计算安全区 bottom（px）→ rpx，再 +100rpx
    uni.getSystemInfo({
      success: (info) => {
        // 安全区：App/H5 有 safeAreaInsets，字节端可能没有
        const insetPx = (info.safeAreaInsets && info.safeAreaInsets.bottom) ? info.safeAreaInsets.bottom : 0
        const rpxPerPx = 750 / info.windowWidth  // px -> rpx
        const insetRpx = Math.round(insetPx * rpxPerPx)
        const totalRpx = insetRpx + 100
        this.bottomPadRpx = `${totalRpx}rpx`
      }
    })
  },
  methods:{
    // 横向滑动相关方法
    switchTab(i) {
      if (i === this.tabIndex) return
      this.tabIndex = i
      this.scrollInto = 'tab-' + i
    },
    onSwiperChange(e) {
      const i = (e && e.detail && typeof e.detail.current === 'number') ? e.detail.current : 0
      this.tabIndex = i
      this.scrollInto = 'tab-' + i
    },
    // 轴向锁：避免横纵冲突
    onAxisStart(e){
      const t = (e.touches && e.touches[0]) || e
      this._sx = t.pageX || t.clientX || 0
      this._sy = t.pageY || t.clientY || 0
      this._axisIntent = null
      this.swiperDisable = false
    },
    onAxisMove(e){
      if (this._axisIntent) return
      const t = (e.touches && e.touches[0]) || e
      const dx = Math.abs((t.pageX||t.clientX||0) - this._sx)
      const dy = Math.abs((t.pageY||t.clientY||0) - this._sy)
      const TH = 12
      if (dy > dx && dy > TH) { // 纵向为主 → 禁止 swiper 接手
        this._axisIntent = 'y'
        this.swiperDisable = true
      } else if (dx > dy && dx > TH) {
        this._axisIntent = 'x'
        this.swiperDisable = false
      }
    },
    onAxisEnd(){ 
      this._axisIntent = null
      this.swiperDisable = false 
    },
    
    goBack(){ uiUtils.goBack() },
    onInput(){ if(!this.kw){ this.kwSearched=false; this.results=[] } },
    clearKw(){ this.kw=''; this.kwSearched=false; this.results=[] },

    doSearch(){
      const k = (this.kw||'').trim()
      if(!k){ uiUtils.showToast('请输入关键词'); return }

      // 显示搜索中状态
      this.isSearching = true
      this.kwSearched = false

      // 写入历史：去重置顶
      const arr = this.history.filter(v=>v!==k)
      arr.unshift(k)
      this.history = arr.slice(0,20)
      uni.setStorageSync('search_history', this.history)

      // 使用新的搜索功能
      setTimeout(() => {
        this.results = this.materialSearch.search(k)
        this.kwSearched = true
        this.isSearching = false

        if (this.results.length === 0) {
          uiUtils.showToast('未找到相关物料')
        }
      }, 300) // 模拟搜索延迟，提升用户体验
    },

    pickHot(h){ this.kw=h; this.doSearch() },
    pickHistory(h){ this.kw=h; this.doSearch() },
    removeHistory(i){ this.history.splice(i,1); uni.setStorageSync('search_history', this.history) },
    clearHistory(){ this.history=[]; uni.removeStorageSync('search_history') },

    // 出/入库
    chooseTypeAndQty(m, t){
      this.currentMaterial = m
      this.currentType = t
      this.qtyStr = ''
      this.showQtyPopup = true
    },

    cancelQuantity() {
      this.showQtyPopup = false
      this.qtyStr = ''
      this.currentMaterial = null
    },

    confirmQuantity(data) {
      if (!data || !data.material) return

      // 添加到购物车逻辑 - 使用与material页面相同的结构
      const cartItem = {
        id: Date.now(),
        materialCode: data.material.code,
        materialName: data.material.name,
        type: data.type,
        quantity: data.quantity,
        timestamp: new Date().getTime(),
        delta: data.type === 'inbound' ? data.quantity : -data.quantity
      }

      // 获取当前购物车列表并添加新项目
      let cartList = uni.getStorageSync('cartList') || []
      cartList.push(cartItem)
      
      // 保存到共享存储
      uni.setStorageSync('cartList', cartList)
      this.cartList = cartList

      this.showQtyPopup = false
      this.qtyStr = ''
      this.currentMaterial = null

      uiUtils.showSuccess('已添加到清单')
    },

    // 跳转到结算页面
    goToCheckout() {
      uni.navigateTo({
        url: '/pages/checkout/checkout'
      })
    },

    // 清单
    loadCartList(){ this.cartList = uni.getStorageSync('cartList') || [] },
    removeCartItem(id){ this.cartList = this.cartList.filter(x=>x.id!==id); uni.setStorageSync('cartList', this.cartList) },
    getTotalQuantity(){
      const t=this.cartList.reduce((s,x)=>s+Number(x.quantity||0),0)
      return Number.isInteger(t)?t:t.toFixed(2)
    },
    showCartDetail(){ this.showCartModal=true },
    closeCartModal(){ this.showCartModal=false; uni.setStorageSync('cartList', this.cartList) },
    noop(){}
  }
}
</script>

<style lang="scss" scoped>
.search-page{ 
  height: 100vh; 
  background:#fff; 
  display:flex; 
  flex-direction:column;
  /* 安全区域适配 */
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  /* 手动设置安全区域 */
  padding-top: 35px;
  padding-bottom: 15px;
  box-sizing: border-box;
  overflow: hidden;
}

/* 标签栏样式 */
.tabbar { 
  height: 88rpx; 
  min-height: 44px;
  background: #fff; 
  border-bottom: 1px solid #eef0f4; 
  white-space: nowrap; 
  display: flex; 
  align-items: center;
  flex-shrink: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.tab { 
  display: inline-flex; 
  padding: 0 28rpx; 
  min-width: 120rpx;
  height: 88rpx; 
  align-items: center; 
  justify-content: center;
  flex-shrink: 0;
}

.tab-text { 
  font-size: 32rpx; 
  color: #555; 
  line-height: 88rpx;
  white-space: nowrap;
}

.tab-text.active { 
  color: #ff4d4f; 
  font-weight: 800; 
}
/* Swiper样式 */
.swiper {
  flex: 1;
  height: 0;
  overflow: hidden;
}

.swiper ::v-deep .uni-swiper-wrapper,
.swiper ::v-deep .uni-swiper-slide {
  height: 100%;
  overflow: hidden;
}

.search-scroll {
  height: 100%;
}

.search-head {
  height: 96rpx; display:flex; align-items:center; gap: 16rpx;
  padding: 0 16rpx; border-bottom: 1rpx solid #f2f2f2;
  width: 70%; /* 进一步横向收缩，避开右侧小程序原生按钮 */
  margin-right: auto;
  
  .search-input{
    flex:1; min-width:0; display:flex; align-items:center; gap: 10rpx;
    background:#f6f7f9; border-radius: 999rpx; padding: 10rpx 16rpx;
    .ipt{ flex:1; min-width:0; font-size: 26rpx; }
  }
  .btn{ color:#3c9cff; }
}

.back-btn {
  font-size: 36rpx;
  color: #333;
  padding: 10rpx;
}

.search-icon, .clear-icon, .list-icon, .clock-icon {
  font-size: 24rpx;
  color: #999;
}

.clear-icon {
  font-size: 32rpx;
  color: #ccc;
  padding: 4rpx;
}

.del-icon {
  font-size: 28rpx;
  color: #bbb;
}

.empty-icon {
  font-size: 88rpx;
  margin-bottom: 16rpx;
}
.search-scroll{ flex:1; min-height:0; overflow:auto; padding: 12rpx 16rpx 0; }
.block{ margin-top: 18rpx; }
.block-title{ font-size: 28rpx; font-weight: 700; color:#333; margin: 8rpx 0 14rpx; display:flex; align-items:center; justify-content:space-between; }
.history-title .clear-all{ color:#3c9cff; font-size: 26rpx; padding: 6rpx 8rpx; }

.chips{ display:flex; flex-wrap:wrap; gap: 14rpx; }
.chip{ padding: 10rpx 22rpx; border-radius: 999rpx; background:#f6f7f9; color:#555; }

/* 历史列表 */
.history-list{
  background:#fff;
  .his-row{
    height: 88rpx; display:flex; align-items:center; justify-content:space-between;
    border-bottom:1rpx solid #f2f2f2;
    .his-left{ display:flex; align-items:center; gap: 12rpx; }
    .his-text{ font-size: 28rpx; color:#333; }
    .del{ padding: 18rpx; margin-right: -10rpx; }
  }
}
.empty-small{ height: 120rpx; display:flex; align-items:center; color:#bbb; padding-left: 4rpx; }

/* 结果列表：单条线 */
.result-list{
  background:#fff;
  .res-row{
    min-height: 88rpx; display:flex; align-items:center; gap: 12rpx;
    padding: 12rpx 4rpx; border-top:1rpx solid #e6e6e6;
  }
  .res-row:first-child{ border-top: 0; }
  .name{ flex:1; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ops{ display:inline-flex; gap: 10rpx; }
  .op-btn {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    font-weight: 600;
    color: #fff;
  }
  .op-btn-add {
    background: #52c41a;
  }
  .op-btn-minus {
    background: #ff4d4f;
  }
}

.empty{ height: 200rpx; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#bbb; }
.empty .t{ margin-top: 12rpx; font-size: 26rpx; }
.empty-tip{ margin-top: 8rpx; font-size: 24rpx; color: #999; }

/* 搜索加载状态 */
.search-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  color: #999;
}

.loading-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 28rpx;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 结果统计 */
.result-count {
  font-size: 24rpx;
  color: #666;
  font-weight: normal;
}

/* 物料信息展示优化 */
.material-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.material-info .name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.material-info .detail {
  font-size: 24rpx;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-fab {
  position: fixed;
  right: 30rpx;
  bottom: 30rpx;
  width: 96rpx;
  height: 96rpx;
  background: #4da3ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 26rpx rgba(0,0,0,.16);
  z-index: 100;
}

.cart-icon {
  color: #fff;
  font-size: 42rpx;
}

.cart-badge {
  position: absolute;
  right: -6rpx;
  top: -6rpx;
  background: #ff4d4f;
  color: #fff;
  font-size: 22rpx;
  border-radius: 50%;
  min-width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}

/* 移动端响应式样式 */
@media screen and (max-width: 480px) {
  .search-head {
    height: 88rpx;
    padding: 0 12rpx;
    gap: 12rpx;
    
    .search-input {
      padding: 8rpx 12rpx;
      
      .ipt {
        font-size: 24rpx;
      }
    }
    
    .btn {
      font-size: 26rpx;
    }
  }
  
  .back-btn {
    font-size: 32rpx;
    padding: 8rpx;
  }
  
  .search-scroll {
    padding: 10rpx 12rpx 0;
  }
  
  .block {
    margin-top: 16rpx;
  }
  
  .hd {
    font-size: 26rpx;
    padding: 16rpx 0 12rpx;
  }
  
  .item {
    padding: 16rpx 0;
    
    .name {
      font-size: 26rpx;
    }
    
    .code {
      font-size: 22rpx;
    }
  }
  
  .cart-fab {
    width: 100rpx;
    height: 100rpx;
    bottom: 120rpx;
    right: 30rpx;
  }
  
  .cart-icon {
    font-size: 38rpx;
  }
  
  .cart-badge {
    font-size: 20rpx;
    min-width: 28rpx;
    height: 28rpx;
  }
}

@media screen and (max-width: 375px) {
  .search-head {
    height: 80rpx;
    padding: 0 10rpx;
    gap: 10rpx;
    
    .search-input {
      padding: 6rpx 10rpx;
      
      .ipt {
        font-size: 22rpx;
      }
    }
    
    .btn {
      font-size: 24rpx;
    }
  }
  
  .back-btn {
    font-size: 30rpx;
    padding: 6rpx;
  }
  
  .search-scroll {
    padding: 8rpx 10rpx 0;
  }
  
  .block {
    margin-top: 14rpx;
  }
  
  .hd {
    font-size: 24rpx;
    padding: 14rpx 0 10rpx;
  }
  
  .item {
    padding: 14rpx 0;
    
    .name {
      font-size: 24rpx;
    }
    
    .code {
      font-size: 20rpx;
    }
  }
  
  .cart-fab {
    width: 90rpx;
    height: 90rpx;
    bottom: 100rpx;
    right: 25rpx;
  }
  
  .cart-icon {
    font-size: 34rpx;
  }
  
  .cart-badge {
    font-size: 18rpx;
    min-width: 24rpx;
    height: 24rpx;
  }
}

/* 横屏适配 */
@media screen and (orientation: landscape) and (max-height: 500px) {
  .search-page {
    padding-top: 20px;
    padding-bottom: 10px;
  }
  
  .search-head {
    height: 70rpx;
    padding: 0 10rpx;
  }
  
  .cart-fab {
    bottom: 80rpx;
    right: 20rpx;
  }
}
</style>
