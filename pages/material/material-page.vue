<template>
  <!-- 新增：固定定位开关 -->
  <view
    class="container"
    :class="[
      { 'container--drag-locked': dragScrollLock },
      { 'container--fixed': containerFixed }
    ]"
    :style="{
      top: containerHeightPx ? (containerTopPx + 'px') : '',
      height: containerHeightPx ? (containerHeightPx + 'px') : '',
      transform: headHidePx ? ('translateY(' + (-headHidePx) + 'px)') : ''
    }"
  >
    <view
      class="page"
      :class="{ 'page--drag-locked': dragScrollLock }"
      @touchstart="onEdgeTouchStart"
      @touchmove="onGlobalTouchMove"
      @touchend="onGlobalTouchEnd"
      @touchcancel="onGlobalTouchCancel"
    >
      <view class="main">
        <!-- 左侧分类 -->
        <scroll-view
          class="left"
          :scroll-y="!dragScrollLock"
          enhanced
          :bounces="false"
          @scroll="onLeftScroll"
          :enable-flex="true"
        >
          <view
            v-for="c in categories"
            :key="c.id"
            :class="[
              'cat',
              selectedCategory && selectedCategory.id === c.id
                ? 'cat--active'
                : '',
              isDragging &&
              dragItem &&
              dragItem.__dragType === 'category' &&
              dragItem.id === c.id
                ? 'cat--dragging'
                : ''
            ]"
            @click="selectCategory(c)"
            @longpress="beginDragCategory($event, c)"
          >
            <view
              class="cat-ind"
              v-if="selectedCategory && selectedCategory.id === c.id"
            ></view>
            <text class="cat__txt">{{ c.name }}</text>
          </view>

          <!-- 新增大类按钮 -->
          <view class="cat cat--add" @click="showAddCategoryDialog">
            <view class="dots-container">
              <view class="dot dot-small"></view>
              <view class="dot dot-large"></view>
              <view class="dot dot-small"></view>
            </view>
          </view>

          <!-- 批量下载按钮 -->
          <view
            v-if="nid === 0 || nid === 1 || nid === 3"
            class="cat cat--download"
            @click="handleBatchDownload"
          >
            <text class="cat__txt cat__txt--batch">📥 批量下载</text>
          </view>

          <!-- 批量出库按钮 -->
          <view
            v-if="nid === 2"
            class="cat cat--batch-out"
            @click="showBatchOutboundModal()"
          >
            <text class="cat__txt cat__txt--batch">📦 批量出库</text>
          </view>
        </scroll-view>

        <!-- 右侧材料列表（整块替换） -->
        <view class="right">
          <!-- 标题放在 scroll-view 外：天然吸顶 -->
          <view class="right__title right__title--sticky">
            <text class="right__title__txt">{{
              selectedCategory ? selectedCategory.name : ''
            }}</text>

            <view class="title-buttons">
              <view class="smart-action-btn" @click="handleSmartAction">
                <view class="dots-container">
                  <view class="dot dot-small"></view>
                  <view class="dot dot-large"></view>
                  <view class="dot dot-small"></view>
                </view>
              </view>
            </view>
          </view>

          <!-- 右侧列表使用 scroll-view，标题置于外部实现吸顶；并提供滚动事件供父页隐藏头部 -->
          <scroll-view
            class="right__list"
            :scroll-y="!dragScrollLock"
            enhanced
            :bounces="false"
            :style="rightListHeightPx ? ('height:' + rightListHeightPx + 'px') : ''"
            @scroll="onRightScroll"
            :enable-flex="true"
          >
            <!-- 单分类材料列表（恢复原布局） -->
            <block v-for="(m, idx) in flatMaterials" :key="m.id">
              <view
                :class="[
                  'row',
                  isDragging &&
                  dragItem &&
                  dragItem.__dragType === 'material' &&
                  dragItem.id === m.id
                    ? 'row--dragging'
                    : ''
                ]"
                @longpress="beginDragMaterial($event, m, idx)"
              >
                <view class="row__info">
                  <view class="row__line">
                    <text class="lbl">编码：</text><text class="val">{{ m.code }}</text>
                  </view>
                  <view class="row__line">
                    <text class="lbl">数量：</text>
                    <text
                      class="val"
                      :class="{ 'negative-quantity': nid === 1 && m.quantity < 0 }"
                    >{{ m.quantity }}</text>
                    <view v-if="nid === 1" class="quantity-detail" @click="showCalculationDetail(m)">
                      <view class="qd-bar qd-bar--a"></view>
                      <view class="qd-bar qd-bar--b"></view>
                      <view class="qd-bar qd-bar--c"></view>
                      <view class="qd-bar qd-bar--d"></view>
                    </view>
                  </view>
                  <view class="row__line">
                    <text class="lbl">{{ nid === 2 ? '部门：' : '批次：' }}</text>
                    <text class="val">{{ nid === 2 ? getDepartmentNameByCode(m.department) : m.batch || '-' }}</text>
                  </view>
                  <view class="row__line">
                    <text class="lbl">规格：</text><text class="val">{{ m.spec || '-' }}</text>
                  </view>
                </view>
                <view class="row__ops">
                  <view v-if="nid === 2" class="pill pill--blue" @click="editMaterial(m)">修改</view>
                  <view v-if="nid === 2" class="pill pill--orange" @click="deleteMaterial(m)">删除</view>
                  <view v-if="nid !== 2" class="pill pill--green" @click="openQty('in', m)">+</view>
                  <view v-if="nid !== 2" class="pill pill--red" @click="openQty('out', m)">-</view>
                </view>
              </view>
              <view v-if="idx < flatMaterials.length - 1" class="divider"></view>
            </block>
          </scroll-view>
        </view>
      </view>

      <!-- 拖拽遮罩层：出现后拦截所有触摸，阻止页面滚动 -->
      <view
        v-if="isDragging"
        class="drag-mask"
        catchtouchmove="true"
        @touchmove.stop.prevent="onDragMove"
        @touchend.stop.prevent="onDragEnd"
        @touchcancel.stop.prevent="onDragCancel"
      >
        <!-- 拖拽影子（跟手移动） -->
        <view class="drag-ghost" :style="ghostStyle">
          <text class="ghost-text">{{
            dragItem ? dragItem.code + ' - ' + dragItem.name : ''
          }}</text>
        </view>

        <!-- 智能方向删除区 -->
        <view
          class="drag-delete-zone"
          :class="[
            zoneSide === 'bottom' ? 'from-bottom' : 'from-top',
            zoneVisible ? 'enter' : 'leave',
            isInDeleteZone ? 'drag-zone-active' : ''
          ]"
          :style="zoneStyle"
          id="deleteZone"
        >
          <text class="drag-zone-icon">🗑️</text>
          <text class="drag-zone-text">
            {{
              isInDeleteZone
                ? '松手删除'
                : zoneSide === 'bottom'
                ? '拖到这里删除'
                : '拖到上方删除'
            }}
          </text>
        </view>
      </view>

      <!-- 抽屉遮罩 -->
      <view
        class="drawer-overlay"
        v-if="drawerOpen || drawerDragging"
        @click="closeDrawer"
      ></view>

      <!-- 右侧抽屉（受 right 像素控制） -->
      <view
        class="drawer"
        :class="[
          { 'drawer--open': drawerOpen },
          { 'drawer--dragging': drawerDragging }
        ]"
        :style="{ right: drawerRightPx + 'px' }"
      >
        <view class="drawer-header">
          <text class="drawer-title">功能菜单</text>
        </view>
        <view class="drawer-content">
          <view class="drawer-item" @click="doSearch">
            <text class="drawer-icon">🔍</text>
            <text class="drawer-text">搜索</text>
          </view>
          <view class="drawer-item" @click="goRecords">
            <text class="drawer-icon">📋</text>
            <text class="drawer-text">记录</text>
          </view>
          <view class="drawer-item" @click="closeDrawer">
            <text class="drawer-icon">✕</text>
            <text class="drawer-text">关闭</text>
          </view>
        </view>
        <view class="drawer-footer"> </view>
      </view>

      <!-- 购物车悬浮按钮 -->
      <view v-if="cartList.length" class="fab fab--cart" @click="openCart" :style="{ bottom: fabBottomPx + 'px' }">
        <text class="cart">🛒</text>
        <view class="badge">{{ cartCount }}</view>
      </view>

      <!-- 自定义键盘组件 -->
      <custom-keyboard
        :show="qtyDialog"
        @update:show="(val) => (qtyDialog = val)"
        :materialInfo="opMat"
        :operationType="opType === 'in' ? 'inbound' : 'outbound'"
        v-model="qtyStr"
        @confirm="confirmQty"
        @cancel="closeQty"
      />

      <!-- 购物车面板 -->
      <view v-if="cartOpen" class="mask" @click="closeCart"></view>
      <view v-if="cartOpen" class="cart-panel" :style="{ bottom: cartBottomPx + 'px' }">
        <view class="cart-title">购物车清单</view>
        <scroll-view class="cart-list" :scroll-y="true" :enable-flex="true">
          <view v-for="(it, i) in cartList" :key="it.id" class="cart-item">
            <view class="cart-item-info">
              <text class="ci-name">{{ it.name }}</text>
              <text class="ci-code">{{ it.code }}</text>
              <text class="ci-qty" :class="it.delta > 0 ? 'in' : 'out'">
                {{ it.delta > 0 ? '入库+' + it.delta : '出库' + Math.abs(it.delta) }}
              </text>
              <text v-if="it.meta && it.meta.departmentName" class="ci-code">
                部门：{{ it.meta.departmentName }}
                <text v-if="it.meta.bomName">/ BOM：{{ it.meta.bomName }}</text>
              </text>
            </view>
            <view class="cart-item-action">
              <view class="delete-btn" @click="removeCartItem(it.id)">删除</view>
            </view>
          </view>
        </scroll-view>
        <view class="cart-footer">
          <view class="cart-summary">
            <text class="summary-text">共 {{ cartCount }} 项</text>
          </view>
          <view class="cart-actions">
            <view class="ca-btn ca-clear" @click="clearCart">清空</view>
            <view class="ca-btn ca-checkout" @click="checkout">结算</view>
          </view>
        </view>
      </view>

      <!-- 新增大类模态框 -->
      <view v-if="showAddCategoryModal" class="modal-mask" @click="closeAddCategoryModal"></view>
      <view v-if="showAddCategoryModal" class="add-category-modal" :style="{ transform: 'translate(-50%, -50%) translateY(' + (-modalShiftPx) + 'px)' }">
        <view class="modal-title">新增</view>
        <view class="modal-content">
          <view class="input-row">
            <text class="input-label">名称：</text>
            <input
              class="input-field"
              v-model="newCategoryName"
              placeholder="请输入名称"
              maxlength="20"
            />
          </view>
        </view>
        <view class="modal-actions">
          <view class="modal-btn modal-cancel" @click="closeAddCategoryModal">取消</view>
          <view class="modal-btn modal-confirm" @click="confirmAddCategory">确认</view>
        </view>
      </view>

      <!-- 新增材料模态框 -->
      <view v-if="showAddMaterialModal" class="modal-mask" @click="closeAddMaterialModal"></view>
      <view v-if="showAddMaterialModal" class="add-material-modal" :style="{ transform: 'translate(-50%, -50%) translateY(' + (-modalShiftPx) + 'px)' }">
        <view class="modal-title">新增材料</view>
        <view class="modal-content">
          <view class="input-row">
            <text class="input-label">材料编码：</text>
            <input
              class="input-field"
              v-model="newMaterial.code"
              placeholder="请输入材料编码"
              maxlength="30"
            />
          </view>
          <view class="input-row">
            <text class="input-label">初始数量：</text>
            <input
              class="input-field"
              v-model="newMaterial.quantity"
              placeholder="请输入初始数量"
              type="number"
            />
          </view>
          <view class="input-row">
            <text class="input-label">批次：</text>
            <input
              class="input-field"
              v-model="newMaterial.batch"
              placeholder="请输入批次（如：20250927）"
              maxlength="8"
              type="number"
            />
          </view>
          <view class="input-row">
            <text class="input-label">规格：</text>
            <input
              class="input-field"
              v-model="newMaterial.spec"
              placeholder="请输入规格"
              maxlength="100"
            />
          </view>
        </view>
        <view class="modal-actions">
          <view class="modal-btn modal-cancel" @click="closeAddMaterialModal">取消</view>
          <view class="modal-btn modal-confirm" @click="confirmAddMaterial">确认</view>
        </view>
      </view>

      <!-- 车间仓数量计算详情模态框 -->
      <view v-if="showCalculationModal" class="modal-overlay" @click="closeCalculationModal">
        <view class="calculation-modal" @click.stop>
          <view class="modal-header">
            <text class="modal-title">{{
              (selectedMaterialForCalc ? selectedMaterialForCalc.name : '') + ' 数量计算详情'
            }}</text>
            <view class="modal-close-btn" @click="closeCalculationModal">×</view>
          </view>
          <view class="modal-content">
            <view class="calc-section">
              <text class="calc-title">主材仓出库到生产部门：</text>
              <view
                v-for="record in calculationDetails.outboundRecords"
                :key="record.id"
                class="calc-item"
              >
                <text class="calc-dept">{{ getDepartmentName(record.toDepartment) }}</text>
                <text class="calc-quantity">+{{ record.quantity }}</text>
                <text class="calc-date">{{ record.date }}</text>
              </view>
              <view class="calc-total">
                <text class="calc-label">出库总计：</text>
                <text class="calc-value">{{ calculationDetails.totalOutbound }}</text>
              </view>
            </view>

            <view class="calc-section">
              <text class="calc-title">BOM需求数量：</text>
              <view
                v-for="(req, reqIdx) in calculationDetails.bomRequirements"
                :key="reqIdx"
                class="calc-item"
              >
                <text class="calc-dept">{{ getDepartmentName(req.department) }}</text>
                <text class="calc-quantity negative">-{{ req.requiredQuantity }}</text>
              </view>
              <view class="calc-total">
                <text class="calc-label">需求总计：</text>
                <text class="calc-value negative">-{{ calculationDetails.totalRequired }}</text>
              </view>
            </view>

            <view class="calc-result">
              <text class="result-label">车间仓实际数量：</text>
              <text class="result-value" :class="{ negative: calculationDetails.finalQuantity < 0 }">
                {{ calculationDetails.finalQuantity }}
              </text>
            </view>
          </view>
          <view class="modal-actions">
            <view class="modal-btn modal-confirm" @click="closeCalculationModal">确定</view>
          </view>
        </view>
      </view>

      <!-- 批量出库模态框 -->
      <view v-if="showBatchOutboundDialog" class="modal-overlay" @click="closeBatchOutboundModal">
        <view class="batch-outbound-modal" @click.stop>
          <view class="modal-header">
            <text class="modal-title">批量出库</text>
            <view class="modal-close-btn" @click="closeBatchOutboundModal">×</view>
          </view>
          <view class="modal-content">
            <!-- 部门选择器 -->
            <view class="form-section">
              <text class="section-title">选择部门：</text>
              <view class="dept-selector">
                <view
                  v-for="dept in productionDepartments"
                  :key="dept.code"
                  class="dept-item"
                  :class="{
                    'dept-item--selected':
                      selectedOutboundDepartment && selectedOutboundDepartment.code === dept.code
                  }"
                  @click="selectOutboundDepartment(dept)"
                >
                  <text class="dept-name">{{ dept.name }}</text>
                </view>
              </view>
            </view>

            <!-- 批号选择器 -->
            <view class="form-section" v-if="selectedOutboundDepartment">
              <text class="section-title">选择批号：</text>
              <view class="batch-selector">
                <view
                  v-for="batch in availableBatches"
                  :key="batch.id"
                  class="batch-item"
                  :class="{
                    'batch-item--selected': selectedBatch && selectedBatch.id === batch.id,
                    'batch-item--disabled': batch.used
                  }"
                  @click="selectBatch(batch)"
                >
                  <text class="batch-name">{{ batch.name }}</text>
                  <text class="batch-status" v-if="batch.used">已出库</text>
                </view>
              </view>
            </view>

            <!-- 物料清单预览 -->
            <view class="form-section" v-if="selectedBatch && selectedOutboundDepartment">
              <text class="section-title">出库物料清单：</text>
              <view class="outbound-preview">
                <view
                  v-for="item in outboundPreview"
                  :key="item.materialCode"
                  class="preview-item"
                >
                  <view class="preview-info">
                    <text class="preview-name">{{ item.materialName }}</text>
                    <text class="preview-code">{{ item.materialCode }}</text>
                  </view>
                  <view class="preview-quantity">
                    <text
                      class="preview-workshop"
                      :class="{ insufficient: item.workshopQuantity < item.outboundQuantity }"
                      >车间仓: {{ item.workshopQuantity }}</text
                    >
                    <text class="preview-outbound">出库量: {{ item.outboundQuantity }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view class="modal-actions">
            <view class="modal-btn modal-cancel" @click="closeBatchOutboundModal">取消</view>
            <view
              class="modal-btn modal-confirm"
              :class="{ 'btn-disabled': !canConfirmOutbound }"
              @click="confirmBatchOutbound"
              >确认出库</view
            >
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { uiUtils } from '@/common/util.js'
import OutboundTypePicker from '@/components/outbound-type-picker/OutboundTypePicker.vue';
import { getOutboundTypeLabel } from '@/store/constants.js'

export default {
  name: 'materialPage',
  components: { OutboundTypePicker },
  props: { nid: { type: Number, default: 0 } },
  data() {
    return {
      // 用户交互状态
      _userInteracted: false,
      // 容器高度（像素）
      containerHeightPx: 0,
      // 容器顶部位置（像素）
      containerTopPx: 0,
      // 容器固定定位开关
      containerFixed: false,
      // 右侧列表高度（像素）
      rightListHeightPx: 0,

      // 头部上滑隐藏进度（页内顶出头部）
      headHidePx: 0,        // 当前已隐藏的高度（px）
      _headHideMaxPx: 0,    // 最大可隐藏高度（px），mounted 中计算
      _prevScrollTop: 0,    // 上一次滚动位置（用于判断方向/增量）
      _containerTopBasePx: 0, // 初始容器 top 基线（避免 windowTop 波动）

      // 拖拽状态看门狗
      _dragWatch: null,
      _lastMoveTs: 0,

      // 右侧抽屉
      drawerOpen: false,
      drawerDragging: false,
      drawerWidthPx: 0,
      drawerRightPx: 0,
      swipe: { tracking: false, startX: 0, startY: 0, lastX: 0 },

      // 横向换栏手势
      axisSwipe: { tracking: false, startX: 0, startY: 0, lastX: 0, consumed: false },

      // 选择/拖拽
      selectedCategory: null,
      selectedCategories: [],
      selectedMaterials: [],

      // 拖拽状态（统一版）
      isDragging: false,
      isInDeleteZone: false,
      dragScrollLock: false,
      dragTarget: null, // { type:'category'|'material', id, payload }

      // 新增：完整拖拽功能数据
      dragItem: null,
      dragIndex: -1,
      // 跟手坐标（px）
      dragX: 0,
      dragY: 0,
      // 删除区命中
      deleteZoneRect: null,
      _lastHit: false,

      // 自定义长按判定（可选）
      _lpTimer: null,
      _pressed: false,
      _longpressArmed: false,
      _startCandidate: null,

      // 智能删除区数据
      zoneSide: 'bottom', // 'top' | 'bottom'
      zoneVisible: false, // 控制 enter/leave 动画
      zoneStyle: {}, // 安全区/键盘补偿等可放这里

      _winH: 0,
      _safeTop: 0,
      _safeBottom: 0,

      // 选项卡分类
      tabCategories: {
        0: [
          { id: 1, name: '材料1' }, { id: 2, name: '材料2' },
          { id: 3, name: '材料3' }, { id: 4, name: '材料4' },
          { id: 5, name: '材料5' }
        ],
        1: [
          { id: 1, name: '材料1' }, { id: 2, name: '材料2' },
          { id: 3, name: '材料3' }, { id: 4, name: '材料4' },
          { id: 5, name: '材料5' }
        ],
        2: [
          { id: 1, name: 'DWII01A' }, { id: 2, name: 'DWII02A' },
          { id: 3, name: 'DWII03A' }, { id: 4, name: 'DWII04A' },
          { id: 5, name: 'DWII05A' }
        ],
        3: [
          { id: 1, name: '包装盒' }, { id: 2, name: '防潮袋' }, { id: 3, name: '缓冲材料' },
          { id: 4, name: '标签贴纸' }, { id: 5, name: '说明书' }, { id: 6, name: '合格证' }
        ],
        4: [
          { id: 1, name: '硅碳粉' }, { id: 2, name: '导电剂' }, { id: 3, name: '粘结剂' },
          { id: 4, name: '溶剂' }, { id: 5, name: '添加剂' }, { id: 6, name: '催化剂' }
        ],
        5: [
          { id: 1, name: '待检验' }, { id: 2, name: '待入库' }, { id: 3, name: '待出库' },
          { id: 4, name: '待报废' }, { id: 5, name: '待退货' }, { id: 6, name: '异常处理' }
        ]
      },

      // 材料组（示例数据）
      groups: [
        // 主材仓 (tab 0)
        { scope: 0, title: '材料1', materials: [
          { id: 1001, code: 'ELY-001', name: '材料1', quantity: 520, batch: '20250920', spec: '4.5V' }
        ]},
        { scope: 0, title: '材料2', materials: [
          { id: 1002, code: 'ELY-002', name: '材料2', quantity: 300, batch: '20250921', spec: '-30℃' }
        ]},
        { scope: 0, title: '材料3', materials: [
          { id: 1003, code: 'ELY-003', name: '材料3', quantity: 260, batch: '20250922', spec: '6.0V' }
        ]},
        { scope: 0, title: '材料4', materials: [
          { id: 1004, code: 'ELY-004', name: '材料4', quantity: 180, batch: '20250923', spec: '3.7V' }
        ]},
        { scope: 0, title: '材料5', materials: [
          { id: 1005, code: 'ELY-005', name: '材料5', quantity: 220, batch: '20250924', spec: '5.2V' }
        ]},

        // 车间仓 (tab 1)
        { scope: 1, title: '材料1', materials: [
          { id: 2001, code: 'ELY-001', name: '材料1', quantity: 20, batch: '20250910', spec: '3.7V' }
        ]},
        { scope: 1, title: '材料2', materials: [
          { id: 2002, code: 'ELY-002', name: '材料2', quantity: 5, batch: '20250911', spec: '4.2V' }
        ]},
        { scope: 1, title: '材料3', materials: [
          { id: 2003, code: 'ELY-003', name: '材料3', quantity: -5, batch: '20250912', spec: '6.0V' }
        ]},
        { scope: 1, title: '材料4', materials: [
          { id: 2004, code: 'ELY-004', name: '材料4', quantity: -10, batch: '20250905', spec: '3.7V' }
        ]},
        { scope: 1, title: '材料5', materials: [
          { id: 2005, code: 'ELY-005', name: '材料5', quantity: -5, batch: '20250906', spec: '5.2V' }
        ]},

        // BOM (tab 2)
        { scope: 2, title: 'DWII01A', materials: [
          { id: 3001, code: 'ELY-001', name: '材料1', quantity: 50, department: 'MIXING', spec: '配料用' },
          { id: 3002, code: 'ELY-002', name: '材料2', quantity: 30, department: 'COATING', spec: '制片用' }
        ]},
        { scope: 2, title: 'DWII02A', materials: [
          { id: 3003, code: 'ELY-003', name: '材料3', quantity: 40, department: 'WINDING', spec: '卷绕用' },
          { id: 3004, code: 'ELY-004', name: '材料4', quantity: 25, department: 'PACKAGING', spec: '封装用' }
        ]},
        { scope: 2, title: 'DWII03A', materials: [
          { id: 3005, code: 'ELY-005', name: '材料5', quantity: 35, department: 'FILLING', spec: '注液用' },
          { id: 3006, code: 'ELY-006', name: '材料6', quantity: 20, department: 'PACKING', spec: '包装用' }
        ]},
      ],

      // 购物车
      cartList: [],
      qtyDialog: false,
      opType: 'in',
      qtyStr: '',
      opMat: null,

      // 按BOM批量发料（保留用的话需要这些）
      showBatchIssueDialog: false,
      selectedDepartment: null,
      selectedBom: null,
      batchQuantity: 1,
      issuePreview: [],
      cartOpen: false,
      // 安全区与浮层偏移
      _safeBottom: 0,
      fabBottomPx: 0,
      cartBottomPx: 0,
      // 键盘避让 - 模态上移偏移量
      modalShiftPx: 0,

      // 新增大类/材料
      showAddCategoryModal: false,
      showAddMaterialModal: false,
      newCategoryName: '',
      newMaterial: { code: '', name: '', quantity: 0, batch: '', spec: '' },

      // 生产部门、出入库记录、BOM需求
      productionDepartments: [
        { id: 1, name: '配料', code: 'MIXING' },
        { id: 2, name: '制片', code: 'COATING' },
        { id: 3, name: '卷绕', code: 'WINDING' },
        { id: 4, name: '封装', code: 'PACKAGING' },
        { id: 5, name: '注液', code: 'FILLING' },
        { id: 6, name: '包装', code: 'PACKING' }
      ],
      outboundRecords: [
        { id: 1, materialCode: 'ELY-001', materialName: '材料1', fromWarehouse: 'main', toDepartment: 'MIXING', quantity: 50, date: '2025-09-20' },
        { id: 2, materialCode: 'ELY-001', materialName: '材料1', fromWarehouse: 'main', toDepartment: 'COATING', quantity: 30, date: '2025-09-21' },
        { id: 3, materialCode: 'ELY-002', materialName: '材料2', fromWarehouse: 'main', toDepartment: 'WINDING', quantity: 40, date: '2025-09-22' }
      ],
      bomRequirements: [
        { materialCode: 'ELY-001', materialName: '材料1', requiredQuantity: 60, department: 'MIXING' },
        { materialCode: 'ELY-001', materialName: '材料1', requiredQuantity: 40, department: 'COATING' },
        { materialCode: 'ELY-002', materialName: '材料2', requiredQuantity: 35, department: 'WINDING' }
      ],

      // 计算详情
      showCalculationModal: false,
      selectedMaterialForCalc: null,
      calculationDetails: { outboundRecords: [], bomRequirements: [], totalOutbound: 0, totalRequired: 0, finalQuantity: 0 },

      // 批量出库
      showBatchOutboundDialog: false,
      selectedBatch: null,
      selectedOutboundDepartment: null,
      outboundPreview: [],
      usedBatches: [], // 已出库的批号列表
      outboundType: '', // 出库类别

      bomList: [
        {
          id: 1, name: 'DWII01A', spec: '3.7V 2600mAh', department: 'MIXING',
          materials: [
            { materialCode: 'ELY-001', materialName: '材料1', requiredQuantity: 10 },
            { materialCode: 'ELY-002', materialName: '材料2', requiredQuantity: 5 }
          ]
        },
        {
          id: 2, name: 'DWII02A', spec: '3.7V 3000mAh', department: 'COATING',
          materials: [
            { materialCode: 'ELY-001', materialName: '材料1', requiredQuantity: 8 },
            { materialCode: 'ELY-003', materialName: '材料3', requiredQuantity: 12 }
          ]
        },
        {
          id: 3, name: 'DWII03A', spec: '3.7V 3500mAh', department: 'WINDING',
          materials: [
            { materialCode: 'ELY-002', materialName: '材料2', requiredQuantity: 15 },
            { materialCode: 'ELY-004', materialName: '材料4', requiredQuantity: 7 }
          ]
        }
      ]
    }
  },

  watch: {
    isDragging(v) {
      if (v) {
        this._lastMoveTs = Date.now()
        clearInterval(this._dragWatch)
        this._dragWatch = setInterval(() => {
          if (!this.isDragging) return
          if (Date.now() - this._lastMoveTs > 2000) {
            this.teardownDeleteZone()
            this._resetDrag()
            clearInterval(this._dragWatch)
          }
        }, 500)
      } else {
        clearInterval(this._dragWatch)
        this.dragScrollLock = false
      }
    },
    nid: {
      immediate: true,
      handler(v) {
        const cats = this.tabCategories[v] || this.tabCategories[0]
        this.selectedCategory = cats[0]
        // 确保当前标签下的所有分类分组存在（懒创建）
        this.ensureGroupsForTab(v)
        this.$nextTick(() => this._calcContainerAndListHeights())
      }
    },
    batchQuantity() {
      if (this.selectedBom) this.generateIssuePreview()
    }
  },

  beforeDestroy() {
    clearInterval(this._dragWatch)
    // #ifdef H5
    window.removeEventListener('resize', this._onResize)
    // #endif
  },

  computed: {
    categories() {
      return this.tabCategories[this.nid] || this.tabCategories[0]
    },
    flatMaterials() {
      if (!this.selectedCategory) return []
      const g = this.findGroupByTabAndTitle(this.nid, this.selectedCategory.name)
      if (this.nid === 1 && g) {
        // 车间仓数量 = 主材仓出库总量 - BOM需求总量（允许为负）
        return g.materials.map(material => ({
          ...material,
          quantity: this.calculateWorkshopQuantity(material.code),
          originalQuantity: material.quantity
        }))
      }
      return g ? g.materials : []
    },
    cartCount() {
      return this.cartList.length
    },
    cartAgg() {
      const map = {}
      for (const it of this.cartList) {
        const key = it.code + '|' + it.name
        if (!map[key]) map[key] = { code: it.code, name: it.name, total: 0 }
        map[key].total += it.delta
      }
      return Object.values(map)
    },
    availableBoms() {
      if (!this.selectedDepartment) return []
      return this.bomList.filter(b => b.department === this.selectedDepartment.code)
    },
    canConfirmIssue() {
      return !!(this.selectedDepartment && this.selectedBom && this.batchQuantity > 0 && this.issuePreview.length > 0)
    },
    availableBatches() {
      // 返回所有可用的批号（BOM批号）
      const batches = [
        { id: 1, name: 'DWII01A', used: this.usedBatches.includes('DWII01A') },
        { id: 2, name: 'DWII02A', used: this.usedBatches.includes('DWII02A') },
        { id: 3, name: 'DWII03A', used: this.usedBatches.includes('DWII03A') }
      ]
      return batches
    },
    canConfirmOutbound() {
      return !!(this.selectedBatch && this.selectedOutboundDepartment && this.outboundPreview.length > 0)
    },
    // 智能按钮配置
    smartButtonConfig() {
      if (!this.selectedCategory) return { text: '新增', action: 'add', icon: '➕' }
      // 根据不同栏位配置按钮
      const categoryName = this.selectedCategory.name
      // BOM栏显示"上传"
      if (categoryName === 'BOM' || this.tabCategories[2]?.some(cat => cat && cat.name === categoryName)) {
        return { text: '上传', action: 'upload', icon: '📤' }
      }
      // 其他栏位显示"新增"
      return { text: '新增', action: 'add', icon: '➕' }
    },
    // 拖拽影子样式
    ghostStyle() {
      return `left:${this.dragX}px; top:${this.dragY}px;`
    }
  },

  created() {
    const cats = this.tabCategories[this.nid] || this.tabCategories[0]
    this.selectedCategory = cats[0]
    // 初始化时确保当前标签分组存在
    this.ensureGroupsForTab(this.nid)
    this.loadCartList()
  },

  mounted() {
    this.drawerWidthPx = uni.upx2px(500)
    this.drawerRightPx = -this.drawerWidthPx

    // 监听用户首次交互（仅在H5环境下）
    // #ifdef H5
    const mark = () => { this._userInteracted = true }
    if (typeof document !== 'undefined') {
      document.addEventListener('touchstart', mark, { once: true, passive: true })
      document.addEventListener('mousedown', mark, { once: true })
    }
    // #endif

    // 在小程序环境下，直接标记为已交互
    // #ifndef H5
    this._userInteracted = true
    // #endif

    // 获取系统信息用于智能删除区和计算右侧列表高度
    uni.getSystemInfo({
      success: (info) => {
        this._winH = info.windowHeight || 0
        // H5/APP 一般有 safeAreaInsets；没有则为 0
        this._safeTop = (info.safeAreaInsets && info.safeAreaInsets.top) || 0
        this._safeBottom = (info.safeAreaInsets && info.safeAreaInsets.bottom) || 0

        // 计算购物车入口与弹窗的动态 bottom 偏移
        this._updateFloatingOffsets()

        // 计算最大可隐藏高度：约 88rpx（≈ 44dp）
        this._headHideMaxPx = Math.max(40, uni.upx2px(88))

        // 计算一次初始样式（可选）
        this.zoneStyle = {}

        // 计算容器和右侧列表高度
        this.$nextTick(() => { this._calcContainerAndListHeights() })
      }
    })

    // 旋转/键盘导致窗口高变动时，重算一次
    // #ifdef MP-WEIXIN
    wx.onWindowResize && wx.onWindowResize(() => this.$nextTick(() => this._calcContainerAndListHeights()))
    // #endif

    // #ifdef H5
    this._onResize = () => this.$nextTick(() => { this._calcContainerAndListHeights(); this._updateFloatingOffsets(); this._updateModalShift() })
    window.addEventListener('resize', this._onResize, { passive: true })
    // #endif
  },

  // 页面生命周期 - 页面隐藏时重置拖拽状态
  onHide() {
    if (this.isDragging) {
      console.log('页面隐藏，重置拖拽状态')
      this.resetDragState()
    }
  },
  // 页面生命周期 - 页面卸载时重置拖拽状态
  onUnload() {
    if (this.isDragging) {
      console.log('页面卸载，重置拖拽状态')
      this.resetDragState()
    }
  },

  // 组件销毁前清理资源
  beforeDestroy() {
    clearInterval(this._dragWatch)
    // #ifdef H5
    window.removeEventListener('resize', this._onResize)
    // #endif
  },

  // 页面生命周期 - 页面显示时检查拖拽状态
  onShow() {
    // 如果页面重新显示时发现拖拽状态异常，进行重置
    if (this.isDragging) {
      console.log('页面显示时发现拖拽状态异常，重置状态')
      this.resetDragState()
    }
  },

  methods: {
    // 计算购物车入口与购物车弹窗的底部偏移，避免被底部安全区或系统栏遮挡
    _updateFloatingOffsets() {
      try {
        const info = uni.getSystemInfoSync && uni.getSystemInfoSync()
        let safeBottom = 0
        if (info && info.safeAreaInsets && typeof info.safeAreaInsets.bottom === 'number') {
          safeBottom = info.safeAreaInsets.bottom
        } else if (info && info.safeArea && info.screenHeight) {
          // 兼容不支持 safeAreaInsets 的环境
          safeBottom = Math.max(0, info.screenHeight - (info.safeArea.bottom || info.windowHeight || 0))
        } else {
          safeBottom = this._safeBottom || 0
        }

        // 在 H5/APP 下把 rpx 转为 px，再加上安全区
        const fabExtra = uni.upx2px(180)
        const panelExtra = uni.upx2px(120)
        this.fabBottomPx = safeBottom + fabExtra
        this.cartBottomPx = safeBottom + panelExtra
      } catch (e) {
        // 兜底：无系统信息时使用固定偏移
        this.fabBottomPx = uni.upx2px(180)
        this.cartBottomPx = uni.upx2px(120)
      }
    },

    // 键盘避让：当窗口高度显著缩小（推断键盘弹出），将模态整体上移
    _updateModalShift() {
      try {
        const info = uni.getSystemInfoSync && uni.getSystemInfoSync()
        const baseH = this._winH || (info && info.windowHeight) || 0
        const curH = (info && info.windowHeight) || baseH
        const shrink = Math.max(0, baseH - curH)
        // 视窗高度减少超过 80px 视为键盘弹出，按缩减比例上移但设置最大值
        const extra = shrink > 80 ? Math.min(uni.upx2px(200), shrink - 40) : 0
        this.modalShiftPx = extra
      } catch (e) {
        this.modalShiftPx = 0
      }
    },
    // 按 headHidePx 把容器顶到更上面（实现顶出头部的错觉）
    _applyTopOffset(windowTop, winH) {
      const top = Math.max(0, Math.floor(windowTop || 0))
      const h   = Math.max(0, Math.floor((winH || 0) - top))
      this.containerTopPx    = top
      this.containerHeightPx = h
    },

    // 根据滚动进度更新头部隐藏位移，并重新应用 top/height
    _handleHeadHideProgress(st) {
      const prev = this._prevScrollTop || 0
      const dy = st - prev
      const abs = Math.abs(dy)

      // 过滤极小抖动，减轻不丝滑感觉
      if (abs < 0.5) {
        this._prevScrollTop = st
        return
      }

      if (dy > 0) {
        // 上滑：隐藏头部（增加 headHidePx，加少许阻尼）
        this.headHidePx = Math.min(this._headHideMaxPx, this.headHidePx + dy * 0.92)
      } else if (dy < 0) {
        // 下拉：露出头部（减少 headHidePx），在顶部快速复位稍加强
        const k = (st <= 4) ? 1.3 : 1.0
        this.headHidePx = Math.max(0, this.headHidePx + dy * k)
      }

      // 顶部轻微回弹（幅度小一些）
      if (st <= 2) this.headHidePx = Math.max(0, this.headHidePx - 2)

      // 边界夹取
      if (this.headHidePx > this._headHideMaxPx) this.headHidePx = this._headHideMaxPx
      if (this.headHidePx < 0) this.headHidePx = 0

      this._prevScrollTop = st
      // 注：容器的 top/height 仅由窗口参数决定；真正的“顶出头部”由 transform 完成
    },
    // 计算容器和右侧列表的高度
    _calcContainerAndListHeights() {
      // 每次现取一次 windowHeight，避免旧缓存
      let winH = 0, windowTop = 0
      try {
        const info = uni.getWindowInfo && uni.getWindowInfo()
        if (info) {
          winH = info.windowHeight || 0
          windowTop = info.windowTop || 0 // ← 关键：顶部系统占位
        }
      } catch(e){}
      if (!winH) {
        try {
          winH = (uni.getSystemInfoSync().windowHeight) || 0
        } catch(e){}
      }

      const q = uni.createSelectorQuery().in(this)
      q.select('.container').boundingClientRect()
        .select('.right__title').boundingClientRect()
        .exec((res) => {
          const contRect = res && res[0]
          const titleRect = res && res[1]

          // 设置容器 top/height 基线（与 headHidePx 无关）；顶出效果交给 transform
          this._applyTopOffset(windowTop, winH)
          this.containerFixed = true

          const titleH = Math.max(48, (titleRect?.height ?? 56))
          // 16rpx * 2 → px
          const rightPadV = Math.max(0, uni.upx2px(16) * 2)
          let listH = Math.max(0, this.containerHeightPx - titleH - rightPadV)
          // 极端情况下给个兜底最小值，避免 scroll-view 高度为 0
          if (listH < 80) listH = 80
          this.rightListHeightPx = Math.floor(listH)

          console.log('高度调试:', {
            winH,
            windowTop,
            headHidePx: this.headHidePx,
            containerTopPx: this.containerTopPx,
            containerHeightPx: this.containerHeightPx,
            contTop: contRect?.top,
            contH: this.containerHeightPx,
            titleH,
            rightPadV,
            listH: this.rightListHeightPx
          })
        })
    },

    // 计算右侧scroll-view的固定高度（兼容旧方法）
    _calcRightListHeight() {
      this._calcContainerAndListHeights()
    },

    /* -------- 全局触摸事件转发方法 -------- */
    onGlobalTouchMove(e) {
      // 正在拖拽才阻止；否则别拦，保证 scroll-view 正常滚动
      if (this.isDragging) {
        e.stopPropagation(); e.preventDefault()
        this.onDragMove(e); return
      }
      // 没在拖拽：检查是否是边缘滑动
      const shouldPreventDefault = this.onEdgeTouchMove(e)
      if (shouldPreventDefault) { e.stopPropagation(); e.preventDefault() }
    },
    onGlobalTouchEnd(e) {
      if (this.isDragging) {
        e.stopPropagation(); e.preventDefault()
        this.onDragEnd(e); return
      }
      // 只有在边缘滑动跟踪状态下才阻止默认行为
      if (this.swipe.tracking) { e.stopPropagation(); e.preventDefault() }
      this.onEdgeTouchEnd(e)
    },
    onGlobalTouchCancel(e) {
      if (this.isDragging) {
        e.stopPropagation(); e.preventDefault()
        this.onDragCancel(); return
      }
      // 只有在边缘滑动跟踪状态下才阻止默认行为
      if (this.swipe.tracking) { e.stopPropagation(); e.preventDefault() }
      this.cancelDrawerDrag()
    },

    /* -------- 安全工具方法 -------- */
    // 安全获取数组
    getListSafe(list) { return Array.isArray(list) ? list : [] },
    // 安全获取ID
    getIdSafe(obj) { return obj && typeof obj === 'object' ? obj.id : undefined },

    // ✅ 记录是否发生过真实用户手势（用于某些环境的额外保险）
    ensureUserGestureFlag() { if (!this._userInteracted) this._userInteracted = true },

    // ✅ 只在「当前调用栈确定为用户手势」时调用它（不要包 setTimeout/rAF）
    vibrateNow(ms = 12) {
      try {
        // #ifdef H5
        if (typeof navigator !== 'undefined' && navigator.vibrate && this._userInteracted) {
          navigator.vibrate(ms)
        }
        // #endif
      } catch (e) { /* no-op */ }
    },

    /* -------- 右侧抽屉（右缘左滑触发） -------- */
    onEdgeTouchStart(e) {
      this._axisStart(e) // 新增：启动横向滑动识别（排除右缘30px）
      const t = e.touches && e.touches[0]; if (!t) return
      const x = t.clientX, y = t.clientY
      let screenWidth = 0
      try { screenWidth = uni.getWindowInfo().windowWidth } catch(e){}
      if (!screenWidth) {
        uni.getSystemInfo({
          success: (info) => {
            screenWidth = info.windowWidth || 375
            if (x >= screenWidth - 30 && !this.drawerOpen) {
              this.swipe = { tracking: true, startX: x, startY: y, lastX: x }
              this.drawerDragging = true
            }
          }
        })
        return
      }
      // 改为右侧边缘触发（距离右边缘30px内）
      if (x >= screenWidth - 30 && !this.drawerOpen) {
        this.swipe = { tracking: true, startX: x, startY: y, lastX: x }
        this.drawerDragging = true
      }
    },
    onEdgeTouchMove(e) {
      if (this.isDragging) return false // 拖拽优先，不处理边缘滑动
      // 先尝试识别"横向换栏"
      const consumed = this._axisMove(e)
      if (consumed) { return true }
      // 阻止默认滚动，避免抖动
      if (!this.swipe.tracking) return false // 没有在跟踪滑动，不需要阻止默认行为

      const t = e.touches && e.touches[0]; if (!t) return false
      const x = t.clientX, y = t.clientY
      const dy = Math.abs(y - this.swipe.startY)
      if (dy > 30 && !this.drawerOpen) { this.cancelDrawerDrag(); return false }

      let dx = this.swipe.startX - x // 左滑为正值
      if (!this.drawerOpen) {
        let right = -this.drawerWidthPx + dx
        if (right > 0) right = 0
        if (right < -this.drawerWidthPx) right = -this.drawerWidthPx
        this.drawerRightPx = right
      } else {
        let right = -dx
        if (right > 0) right = 0
        if (right < -this.drawerWidthPx) right = -this.drawerWidthPx
        this.drawerRightPx = right
      }
      this.swipe.lastX = x
      return true // 正在处理边缘滑动，需要阻止默认行为
    },
    onEdgeTouchEnd() {
      if (this.isDragging) return // 结束交给 onGlobalTouchEnd 里的拖拽分支
      this._axisEnd() // 新增：收尾横滑手势
      if (!this.swipe.tracking) return
      const dx = this.swipe.startX - this.swipe.lastX // 左滑为正值
      const threshold = this.drawerWidthPx * 0.35
      if (!this.drawerOpen) {
        if (dx > threshold) this.openDrawer()
        else this.closeDrawer()
      } else {
        if (dx > threshold) this.closeDrawer()
        else this.openDrawer()
      }
      this.cancelDrawerDrag()
    },
    cancelDrawerDrag() {
      this.swipe.tracking = false; this.drawerDragging = false
      this.axisSwipe.tracking = false; this.axisSwipe.consumed = false
    },

    /* -------- 横向换栏手势：启动/移动/结束 -------- */
    _axisStart(e) {
      if (this.isDragging || this.drawerDragging) return
      const t = this._firstTouch(e)
      // 右侧 30px 保留给抽屉，不做换栏手势
      let screenWidth = 0
      try { screenWidth = uni.getWindowInfo().windowWidth } catch(e){ screenWidth = 375 }
      if (t.clientX >= screenWidth - 30) return // 交给抽屉

      this.axisSwipe = {
        tracking: true, startX: t.clientX, startY: t.clientY,
        lastX: t.clientX, consumed: false
      }
    },
    _axisMove(e) {
      if (!this.axisSwipe.tracking || this.drawerDragging || this.isDragging) return false
      const t = this._firstTouch(e)
      const dx = t.clientX - this.axisSwipe.startX
      const dy = t.clientY - this.axisSwipe.startY
      this.axisSwipe.lastX = t.clientX

      // 水平主导且位移足够时，认为要换栏
      const H_THRESH = 60 // 触发阈值
      if (!this.axisSwipe.consumed && Math.abs(dx) > H_THRESH && Math.abs(dx) > Math.abs(dy) * 1.2) {
        // 触发一次换栏事件：向父组件发出 prev/next
        const dir = dx > 0 ? 'prev' : 'next'
        this.$emit('swipe-tab', dir)
        this.axisSwipe.consumed = true
        return true // 告诉上层可以阻止默认行为（避免页面抖动）
      }
      return false
    },
    _axisEnd(/* e */) {
      // 收尾
      this.axisSwipe.tracking = false
      this.axisSwipe.consumed = false
    },

    openDrawer(){ this.drawerOpen = true; this.drawerRightPx = 0 },
    closeDrawer(){ this.drawerOpen = false; this.drawerRightPx = -this.drawerWidthPx },

    /* -------- 列表与分类 -------- */
    onLeftScroll(e) {
      const st = (e && e.detail && typeof e.detail.scrollTop === 'number') ? e.detail.scrollTop : 0;
      // 顶部判断（保留原有事件）
      this.$emit('left-top', st <= 2)
      // 新增：滚动进度，供首页按进度隐藏头部
      this.$emit('scroll-y', st)
      // 驱动头部隐藏位移
      this._handleHeadHideProgress(st)
    },
    selectCategory(c) {
      this.selectedCategory = c
      // 选择分类时确保分组存在
      this.ensureGroup(this.nid, c && c.name ? c.name : '')
      // 切换分类时复位头部隐藏状态，体验更丝滑
      this.headHidePx = 0
      this._prevScrollTop = 0
      // 重新应用容器位置与高度
      try {
        const info = uni.getWindowInfo && uni.getWindowInfo()
        const winH = (info && info.windowHeight) || (uni.getSystemInfoSync().windowHeight) || 0
        const windowTop = (info && info.windowTop) || 0
        this._applyTopOffset(windowTop, winH)
      } catch(e){}
    },

    /* -------- 车间仓数量计算：主材仓出库 - BOM需求 -------- */
    calculateWorkshopQuantity(materialCode) {
      const outboundToProduction = this.outboundRecords
        .filter(r => r.materialCode === materialCode && r.fromWarehouse === 'main' && this.productionDepartments.some(d => d.code === r.toDepartment))
        .reduce((s, r) => s + r.quantity, 0)
      const bomRequired = this.bomRequirements
        .filter(req => req.materialCode === materialCode)
        .reduce((s, req) => s + req.requiredQuantity, 0)
      return outboundToProduction - bomRequired // 可为负
    },
    getMaterialCalculationDetails(materialCode) {
      const outboundRecords = this.outboundRecords
        .filter(r => r.materialCode === materialCode && r.fromWarehouse === 'main' && this.productionDepartments.some(d => d.code === r.toDepartment))
      const bomRequirements = this.bomRequirements.filter(req => req.materialCode === materialCode)
      const totalOutbound = outboundRecords.reduce((s, r) => s + r.quantity, 0)
      const totalRequired = bomRequirements.reduce((s, r) => s + r.requiredQuantity, 0)
      return { outboundRecords, bomRequirements, totalOutbound, totalRequired, finalQuantity: totalOutbound - totalRequired }
    },
    showCalculationDetail(material) {
      this.selectedMaterialForCalc = material
      this.calculationDetails = this.getMaterialCalculationDetails(material.code)
      this.showCalculationModal = true
    },
    closeCalculationModal() {
      this.showCalculationModal = false
      this.selectedMaterialForCalc = null
      this.calculationDetails = { outboundRecords: [], bomRequirements: [], totalOutbound: 0, totalRequired: 0, finalQuantity: 0 }
    },
    getDepartmentName(code) {
      const d = this.productionDepartments.find(x => x.code === code); return d ? d.name : code
    },
    getDepartmentNameByCode(code) {
      const d = this.productionDepartments.find(x => x.code === code); return d ? d.name : code
    },

    /* -------- 批量出库功能 -------- */
    showBatchOutboundModal(){ this.showBatchOutboundDialog = true },
    closeBatchOutboundModal(){
      this.showBatchOutboundDialog = false
      this.selectedBatch = null
      this.selectedOutboundDepartment = null
      this.outboundPreview = []
    },
    selectOutboundDepartment(dept){
      this.selectedOutboundDepartment = dept
      this.outboundPreview = [] // 部门选择后不自动生成预览，等待批号选择
    },
    selectBatch(batch){
      if (batch.used) return // 已出库的批号不能选择
      this.selectedBatch = batch
      this.generateOutboundPreview()
    },
    generateOutboundPreview(){
      if (!this.selectedBatch || !this.selectedOutboundDepartment) return
      // 根据选中的批号和部门，找到对应的BOM材料
      const bomGroup = this.groups.find(g => g.title === this.selectedBatch.name)
      if (!bomGroup) return
      // 筛选出属于选中部门的材料
      const deptMaterials = bomGroup.materials.filter(m => m.department === this.selectedOutboundDepartment.code)
      this.outboundPreview = deptMaterials.map(m => {
        // 获取车间仓对应材料的数量
        const workshopQuantity = this.getWorkshopQuantity(m.code)
        return {
          materialCode: m.code,
          materialName: m.name,
          workshopQuantity: workshopQuantity,
          outboundQuantity: m.quantity // BOM中定义的数量作为出库量
        }
      })
    },
    getWorkshopQuantity(materialCode){ return this.calculateWorkshopQuantity(materialCode) },
    confirmBatchOutbound(){
      if (!this.canConfirmOutbound) return
      // 数据加入购物车，等待签字结算
      this.outboundPreview.forEach(item => {
        this.cartList.push({
          id: Date.now() + Math.random(),
          code: item.materialCode,
          name: item.materialName,
          delta: -item.outboundQuantity,
          type: 'outbound',
          quantity: item.outboundQuantity,
          timestamp: Date.now(),
          meta: {
            batchNumber: this.selectedBatch.name,
            department: this.selectedOutboundDepartment.code,
            departmentName: this.selectedOutboundDepartment.name,
            operationType: 'batch_outbound'
          }
        })
      })
      // 标记批号为已使用
      this.usedBatches.push(this.selectedBatch.name)
      this.saveCartList()
      uiUtils.showSuccess('已加入出库清单🛒')
      this.closeBatchOutboundModal()
      this.openCart()
    },

    // 重置拖拽状态（已被_resetDrag替代，保留兼容性）
    resetDragState() {
      console.log('重置拖拽状态（旧方法）')
      this._resetDrag()
      // 页面切换/复位时把头部弹回
      this.headHidePx = 0
      this._prevScrollTop = 0
    },

    // 删除拖拽的分类
    deleteDraggedCategory() {
      if (!this.dragItem) return
      uni.showModal({
        title: '确认删除',
        content: `确定要删除分类"${this.dragItem.name}"及其所有材料吗？`,
        success: (res) => {
          // 防空检查：用户可能点了取消
          if (!res || !res.confirm) return
          // 检查拖拽项是否有效
          if (!this.dragItem || this.getIdSafe(this.dragItem) == null) return

          const categoryId = this.dragItem.id
          const categoryName = this.dragItem.name

          // 安全删除分类 - 修复：操作源数据而非计算属性
          const list = this.tabCategories[this.nid] || []
          const categoryIndex = list.findIndex(c => c && c.id === categoryId)
          if (categoryIndex !== -1) {
            list.splice(categoryIndex, 1) // 修复：操作源数据
            // 删除对应的materials组
            const groups = this.getListSafe(this.groups)
            const groupIndex = groups.findIndex(g => g && g.title === categoryName)
            if (groupIndex !== -1) { this.groups.splice(groupIndex, 1) }
            // 如果删除的是当前选中的分类，清空选择
            if (this.selectedCategory && this.selectedCategory.id === categoryId) {
              this.selectedCategory = null
            }
            uiUtils.showSuccess('删除成功')
          }
        }
      })
    },

    // 删除拖拽的材料
    deleteDraggedMaterial() {
      if (!this.dragItem || !this.selectedCategory) return
      uni.showModal({
        title: '确认删除',
        content: `确定要删除材料"${this.dragItem.name || this.dragItem.code}"吗？`,
        success: (res) => {
          // 防空检查：用户可能点了取消
          if (!res || !res.confirm) return

          // 检查拖拽项和选中分类是否有效
          if (!this.dragItem || this.getIdSafe(this.dragItem) == null) return
          if (!this.selectedCategory || !this.selectedCategory.name) return

          const materialId = this.dragItem.id
          const categoryName = this.selectedCategory.name

          // 安全查找并删除材料
          const groups = this.getListSafe(this.groups)
          const group = groups.find(g => g && g.title === categoryName)
          if (!group) return
          const materials = this.getListSafe(group.materials)
          const materialIndex = materials.findIndex(m => m && m.id === materialId)
          if (materialIndex !== -1) {
            group.materials.splice(materialIndex, 1)
            uiUtils.showSuccess('删除成功')
          }
        }
      })
    },

    // 删除动作（多选）
    deleteSelectedCategories() {
      const selectedList = this.getListSafe(this.selectedCategories)
      if (selectedList.length === 0) return uiUtils.showToast('请先选择要删除的分类')

      uni.showModal({
        title: '确认删除',
        content: `确定要删除选中的 ${selectedList.length} 个大类及其所有材料吗？`,
        success: (res) => {
          if (!res || !res.confirm) return
          const categories = this.getListSafe(this.categories)
          const groups = this.getListSafe(this.groups)
          selectedList.forEach(categoryId => {
            if (categoryId == null) return
            const category = categories.find(c => c && c.id === categoryId)
            if (!category) return
            // 删除对应的组
            const groupIndex = groups.findIndex(g => g && g.title === category.name)
            if (groupIndex !== -1) { this.groups.splice(groupIndex, 1) }
            // 删除标签页中的分类
            const tabCats = this.getListSafe(this.tabCategories[this.nid] || this.tabCategories[0])
            const categoryIndex = tabCats.findIndex(c => c && c.id === categoryId)
            if (categoryIndex !== -1) { tabCats.splice(categoryIndex, 1) }
          })
          this.selectedCategories = []
          // 重新选择第一个分类
          const remainingCats = this.getListSafe(this.tabCategories[this.nid] || this.tabCategories[0])
          this.selectedCategory = remainingCats[0] || null
          uiUtils.showSuccess('删除成功')
        }
      })
    },

    deleteSelectedMaterials() {
      const selectedList = this.getListSafe(this.selectedMaterials)
      if (selectedList.length === 0) return uiUtils.showToast('请先选择要删除的材料')

      uni.showModal({
        title:'确认删除',
        content: `确定要删除选中的 ${selectedList.length} 个材料吗？`,
        success: (res) => {
          if (!res || !res.confirm) return
          const groups = this.getListSafe(this.groups)
          selectedList.forEach(materialId => {
            if (materialId == null) return
            groups.forEach(group => {
              if (!group || !group.materials) return
              const materials = this.getListSafe(group.materials)
              const materialIndex = materials.findIndex(m => m && m.id === materialId)
              if (materialIndex !== -1) { group.materials.splice(materialIndex, 1) }
            })
          })
          this.selectedMaterials = []
          uiUtils.showSuccess('删除成功')
        }
      })
    },

    /* -------- 入/出库 -> 加入购物车 -------- */
    openQty(type, m) { this.opType = type; this.opMat = m; this.qtyStr = ''; this.qtyDialog = true },
    closeQty() { this.qtyDialog = false; this.qtyStr = '' },
    confirmQty(data) {
      const q = Number(data.quantity)
      if (!q || q <= 0) return uiUtils.showToast('请输入有效数量')
      const delta = this.opType === 'in' ? q : -q
      this.cartList.push({
        id: Date.now(),
        code: this.opMat.code,
        name: this.opMat.name || this.opMat.code,
        delta,
        type: (this.opType === 'in' ? 'inbound' : 'outbound'),
        quantity: q,
        timestamp: Date.now(),
        meta: { outboundType: this.outboundType }
      })
      this.saveCartList(); this.qtyDialog = false; this.qtyStr = ''
      uiUtils.showToast('已加入清单')
    },

    openCart(){ this._updateFloatingOffsets(); this.cartOpen = true },
    closeCart(){ this.cartOpen = false },
    removeCartItem(id){ this.cartList = this.cartList.filter(x => x.id !== id); this.saveCartList(); if (!this.cartList.length) this.cartOpen = false },
    clearCart(){ this.cartList = []; this.saveCartList(); this.cartOpen = false },
    checkout(){
      if (!this.cartList.length) return uiUtils.showToast('清单为空')
      // 这里仅演示：把购物车带到结算页
      const cartData = this.cartList.map(it => ({
        id: it.id, materialCode: it.code, materialName: it.name,
        type: it.type, quantity: it.quantity, timestamp: it.timestamp, meta: it.meta
      }))
      uni.setStorageSync('cartList', cartData)
      this.cartOpen = false
      uni.navigateTo({ url:'/pages/checkout/checkout' })
    },

    editMaterial(m){ uiUtils.showToast('编辑材料: ' + m.code) },
    deleteMaterial(m){
      if (!m || this.getIdSafe(m) == null) { uiUtils.showToast('材料信息无效'); return }
      const materialId = m.id; const materialName = m.name || m.code || '未知材料'
      uni.showModal({
        title: '确认删除',
        content: `确定要删除材料"${materialName}"吗？`,
        success: (res) => {
          if (!res || !res.confirm) return
          const groups = this.getListSafe(this.groups)
          let deleted = false
          for (let group of groups) {
            if (!group || !group.materials) continue
            const materials = this.getListSafe(group.materials)
            const index = materials.findIndex(material => material && material.id === materialId)
            if (index !== -1) {
              group.materials.splice(index, 1)
              uiUtils.showSuccess('材料删除成功')
              deleted = true
              break
            }
          }
          if (!deleted) uiUtils.showToast('未找到要删除的材料')
        }
      })
    },

    loadCartList(){ this.cartList = uni.getStorageSync('cartList') || [] },
    saveCartList(){ uni.setStorageSync('cartList', this.cartList) },

    /* -------- 新增分类/材料 -------- */
    handleAddMaterial(){ this._updateModalShift(); this.showAddMaterialModal = true },
    showAddCategoryDialog(){ this._updateModalShift(); this.showAddCategoryModal = true; this.newCategoryName = '' },
    showAddMaterialDialog(){ this._updateModalShift(); this.showAddMaterialModal = true; this.resetNewMaterial() },
    closeAddCategoryModal(){ this.showAddCategoryModal = false; this.newCategoryName = '' },
    confirmAddCategory(){
      if (!this.newCategoryName.trim()) return uiUtils.showToast('请输入名称')
      if (!this.tabCategories[this.nid]) this.tabCategories[this.nid] = []
      const list = this.tabCategories[this.nid]
      const maxId = Math.max(...list.map(c => c.id), 0)
      const nc = { id: maxId + 1, name: this.newCategoryName.trim() }
      this.tabCategories[this.nid].push(nc)
      this.groups.push({ scope: this.nid, title: nc.name, materials: [] })
      uiUtils.showSuccess('添加成功')
      this.closeAddCategoryModal()
      this.selectedCategory = nc
    },
    closeAddMaterialModal(){ this.showAddMaterialModal = false; this.resetNewMaterial() },
    resetNewMaterial(){ this.newMaterial = { code: '', name: '', quantity: 0, batch: '', spec: '' } },
    confirmAddMaterial(){
      if (!this.newMaterial.code.trim()) return uiUtils.showToast('请填写材料编码')
      const exist = this.groups.find(g => g.materials.some(m => m.code === this.newMaterial.code.trim()))
      if (exist) return uiUtils.showToast('材料编码已存在')

      // 若当前分类对应分组不存在则懒创建
      this.ensureGroup(this.nid, this.selectedCategory ? this.selectedCategory.name : '')
      const group = this.findGroupByTabAndTitle(this.nid, this.selectedCategory ? this.selectedCategory.name : '')
      if (group) {
        const all = this.groups.flatMap(g => g.materials)
        const maxId = Math.max.apply(null, all.map(m => m.id).concat([0]))
        group.materials.push({
          id: maxId + 1,
          code: this.newMaterial.code.trim(),
          name: this.newMaterial.name.trim() || this.newMaterial.code.trim(),
          quantity: parseInt(this.newMaterial.quantity) || 0,
          batch: this.newMaterial.batch.trim() || '-',
          spec: this.newMaterial.spec.trim() || '-'
        })
        uiUtils.showSuccess('材料添加成功')
        this.closeAddMaterialModal()
      }
    },

    // 确保指定 scope+title 的分组存在（懒创建）
    ensureGroup(scope, title) {
      if (!title) return
      const groups = Array.isArray(this.groups) ? this.groups : []
      const exists = groups.some(g => g && g.scope === scope && g.title === title)
      if (!exists) {
        this.groups.push({ scope, title, materials: [] })
      }
    },
    // 确保某个标签页的所有分类分组存在（懒创建）
    ensureGroupsForTab(scope) {
      const cats = this.tabCategories[scope] || []
      cats.forEach(cat => {
        if (cat && cat.name) this.ensureGroup(scope, cat.name)
      })
    },

    /* -------- 智能按钮处理 -------- */
    handleSmartAction(){
      const config = this.smartButtonConfig
      if (config.action === 'upload') this.handleBomUpload()
      else this.showAddMaterialDialog()
    },

    // BOM栏的上传功能
    handleBomUpload(){
      // 检查平台，H5环境使用不同的上传方式
      // #ifdef H5
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.xls,.xlsx,.csv'
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (file) {
          this.uploadBomFile({
            path: window.URL.createObjectURL(file),
            name: file.name,
            size: file.size,
            type: file.type,
            file: file // 保存原始File对象
          })
        }
      }
      input.click()
      // #endif

      // #ifndef H5
      uni.chooseMessageFile({
        count: 1, type: 'file', extension: ['xls', 'xlsx', 'csv'],
        success: (res) => {
          const file = (res.tempFiles && res.tempFiles[0]) || null
          if (file) { this.uploadBomFile(file) }
        },
        fail: () => { uiUtils.showToast('未选择文件') }
      })
      // #endif
    },

    // 上传BOM文件到服务器
    async uploadBomFile(file){
      uni.showLoading({ title: '上传中...' })
      try {
        let uploadResult;
        // #ifdef H5
        const fd = new FormData()
        fd.append('file', file.file) // 原始 File 对象
        fd.append('source', 'bom-import')
        fd.append('category', this.selectedCategory ? this.selectedCategory.name : '')
        const resp = await fetch('https://your-api.example.com/bom/upload', { method: 'POST', body: fd })
        if (!resp.ok) throw new Error('网络错误')
        uploadResult = await resp.json()
        // #endif

        // #ifndef H5
        uploadResult = await new Promise((resolve, reject) => {
          uni.uploadFile({
            url: 'https://your-api.example.com/bom/upload', // 替换为实际的上传地址
            filePath: file.path || file.tempFilePath,
            name: 'file',
            formData: { source: 'bom-import', category: this.selectedCategory ? this.selectedCategory.name : '' },
            success: resolve, fail: reject
          })
        })
        // #endif

        uni.hideLoading()
        uiUtils.showSuccess('BOM文件上传成功')
        this.refreshCurrentCategory()
      } catch (error) {
        uni.hideLoading()
        console.error('上传失败:', error)
        uiUtils.showToast('上传失败，请重试')
      }
    },

    // 刷新当前分类的数据 - 已合并重算高度逻辑
    refreshCurrentCategory(){
      uiUtils.showToast('数据已刷新')
      this.$nextTick(() => { this._calcContainerAndListHeights() })
    },

    // 批量下载功能
    handleBatchDownload(){
      let downloadType = ''
      if (this.nid === 0) downloadType = '主材仓'
      else if (this.nid === 1) downloadType = '车间仓'
      else if (this.nid === 3) downloadType = 'PACK'

      uni.showLoading({ title: '准备下载...' })
      // 准备下载数据
      const downloadData = this.prepareDownloadData()
      setTimeout(() => {
        uni.hideLoading()
        uni.showModal({
          title: '下载成功',
          content: `已成功下载${downloadType}数据，共${downloadData.length}条记录`,
          showCancel: false
        })
      }, 1000)
    },

    // 准备下载数据
    prepareDownloadData(){
      let data = []
      if (this.selectedCategory) {
        const g = this.findGroupByTabAndTitle(this.nid, this.selectedCategory.name)
        if (g && g.materials) {
          data = g.materials.map(m => ({
            code: m.code, name: m.name || '', quantity: m.quantity || 0,
            batch: m.batch || '-', spec: m.spec || '-',
            department: this.nid === 2 ? this.getDepartmentNameByCode(m.department) : ''
          }))
        }
      } else {
        const tabGroups = this.groups.filter((g, i) => {
          const cats = this.tabCategories[this.nid] || []
          return cats.some(c => c.name === g.title)
        })
        data = tabGroups
          .flatMap(g => g.materials || [])
          .map(m => ({
            code: m.code, name: m.name || '', quantity: m.quantity || 0,
            batch: m.batch || '-', spec: m.spec || '-',
            department: this.nid === 2 ? this.getDepartmentNameByCode(m.department) : ''
          }))
      }
      return data
    },

    /* -------- 按BOM批量发料 -> 加入购物车 -------- */
    showBatchIssueModal(){ this.showBatchIssueDialog = true },
    closeBatchIssueModal(){ this.showBatchIssueDialog = false; this.selectedDepartment = null; this.selectedBom = null; this.batchQuantity = 1; this.issuePreview = []; this.outboundType = '' },
    selectDepartment(d){ this.selectedDepartment = d; this.selectedBom = null; this.issuePreview = [] },
    selectBom(b){ this.selectedBom = b; this.generateIssuePreview() },
    findGroupByTabAndTitle(scope, title) { return this.groups.find(g => g && g.scope === scope && g.title === title) || null },
    findMainWarehouseMaterialByCode(code) {
      const mainCatNames = (this.tabCategories[0] || []).map(c => c.name)
      for (const g of this.groups) {
        if (mainCatNames.includes(g.title)) {
          const m = g.materials.find(x => x.code === code); if (m) return m
        }
      }
      return null
    },
    generateIssuePreview(){
      if (!this.selectedBom) return
      this.issuePreview = this.selectedBom.materials.map(bi => {
        const m = this.findMainWarehouseMaterialByCode(bi.materialCode)
        return {
          materialCode: bi.materialCode, materialName: bi.materialName,
          requiredQuantity: (bi.requiredQuantity * (parseInt(this.batchQuantity) || 0)),
          availableQuantity: m ? m.quantity : 0
        }
      })
    },
    confirmBatchIssueToCart(){
      if (!this.canConfirmIssue) return
      const deptName = this.selectedDepartment ? this.selectedDepartment.name : ''
      this.issuePreview.forEach(item => {
        if (item.requiredQuantity > 0) {
          this.cartList.push({
            id: Date.now() + Math.random(),
            code: item.materialCode, name: item.materialName,
            delta: -item.requiredQuantity, type: 'outbound',
            quantity: item.requiredQuantity, timestamp: Date.now(),
            meta: {
              department: this.selectedDepartment ? this.selectedDepartment.code : '',
              departmentName: deptName, bomId: this.selectedBom ? this.selectedBom.id : null,
              bomName: this.selectedBom ? this.selectedBom.name : '', outboundType: this.outboundType
            }
          })
        }
      })
      this.saveCartList()
      uiUtils.showSuccess('已加入🛒')
      this.closeBatchIssueModal(); this.openCart()
    },

    /* -------- 抽屉菜单功能 -------- */
    doSearch(){ uni.navigateTo({ url: '/pages/search/search' }) },
    goRecords(){ uni.navigateTo({ url: '/pages/records/records' }) },

    /* ========== 新增：完整拖拽删除功能 ========== */
    onDragStart(e, item, index){ this._userInteracted = true; this.beginDrag(e, item, index) },
    beginDragCategory(e, category){
      const categoryWithType = Object.assign({}, category, { __dragType: 'category' })
      this.beginDrag(e, categoryWithType)
    },
    beginDragMaterial(e, material, index){
      const materialWithType = Object.assign({}, material, { __dragType: 'material' })
      this.beginDrag(e, materialWithType, index)
    },
    beginDrag(e, item, index){
      const t = this._firstTouch(e)
      this.dragX = t.clientX; this.dragY = t.clientY
      this.dragItem = item; this.dragIndex = index
      this.isDragging = true; this.isInDeleteZone = false
      this.dragScrollLock = true // ✅ 加上滚动锁定
      // 设置拖拽目标类型
      if (item.__dragType) {
        this.dragTarget = { type: item.__dragType, id: item.id, payload: item }
        console.log('设置拖拽目标:', this.dragTarget)
      }
      // 智能删除区准备
      this.prepareDeleteZone(e)
      // 等删除区进场后再量 DOM
      this.$nextTick(() => {
        // 第一次 nextTick 等 v-if 挂载
        this.$nextTick(() => {
          // 第二次 nextTick 等过渡类名生效
          this._measureDeleteZone()
        })
      })
    },
    onDragMove(e){
      if (!this.isDragging) return
      this._lastMoveTs = Date.now() // 更新时间戳
      const t = this._firstTouch(e)
      this.dragX = t.clientX; this.dragY = t.clientY
      this._hitTestDeleteZone(t.clientX, t.clientY)
    },
    onDragEnd(e){
      if (!this.isDragging) return
      if (this.isInDeleteZone && this.dragItem) {
        if (this.dragTarget && this.dragTarget.type === 'category') this.deleteDraggedCategory()
        else this.deleteDraggedMaterial()
        this.vibrateNow(15)
      }
      this.teardownDeleteZone()
      this._resetDrag()
    },
    onDragCancel(){ this.teardownDeleteZone(); this._resetDrag() },
    _resetDrag(){
      this.isDragging = false; this.dragItem = null; this.dragIndex = -1
      this.dragTarget = null; this.isInDeleteZone = false
      this.dragScrollLock = false; this._lastHit = false
    },

    /* ========== DOM & 命中检测 ========== */
    _measureDeleteZone(){
      const q = uni.createSelectorQuery().in(this)
      q.select('#deleteZone').boundingClientRect(rect => {
        if (!rect) {
          // 兜底重试一次
          setTimeout(() => {
            const q2 = uni.createSelectorQuery().in(this)
            q2.select('#deleteZone').boundingClientRect(r2 => {
              this.deleteZoneRect = r2 || null
            }).exec()
          }, 16)
        } else {
          this.deleteZoneRect = rect
        }
      }).exec()
    },
    _hitTestDeleteZone(x, y){
      if (!this.deleteZoneRect) return (this.isInDeleteZone = false)
      const r = this.deleteZoneRect
      const hit = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
      if (hit && !this._lastHit) this.vibrateNow(10)
      this._lastHit = !!hit
      this.isInDeleteZone = !!hit
    },
    _firstTouch(e){
      const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e
      return { clientX: t.clientX != null ? t.clientX : t.pageX, clientY: t.clientY != null ? t.clientY : t.pageY }
    },

    /* ========== 实际删除逻辑（按你的数据结构改） ========== */
    removeMaterialById(id){
      if (id == null) return
      const list = Array.isArray(this.flatMaterials) ? this.flatMaterials : []
      const idx = list.findIndex(x => x && x.id === id)
      if (idx === -1) return
      if (this.selectedCategory) {
        const g = this.findGroupByTabAndTitle(this.nid, this.selectedCategory.name)
        if (g && g.materials) {
          const materialIdx = g.materials.findIndex(x => x && x.id === id)
          if (materialIdx !== -1) { g.materials.splice(materialIdx, 1) }
        }
      }
    },

    /* ========== 智能删除区方法 ========== */
    prepareDeleteZone(e){
      const t = this._firstTouch(e)
      const side = (this._winH && t.clientY <= this._winH / 2) ? 'top' : 'bottom'
      this.zoneSide = side
      this.zoneStyle = {}
      this.$nextTick(() => { this.zoneVisible = true })
    },
    teardownDeleteZone(){
      this.zoneVisible = false; this.deleteZoneRect = null
      setTimeout(() => { /* 动画 180ms 后执行更多清理 */ }, 200)
    },

    // 右侧材料列表滚动：向父层报告滚动进度与是否在顶部，并驱动头部隐藏
    onRightScroll(e){
      const st = (e && e.detail && typeof e.detail.scrollTop === 'number') ? e.detail.scrollTop : 0
      this.$emit('scroll-y', st)
      this.$emit('left-top', st <= 2)
      this._handleHeadHideProgress(st)
    }
  }
}
</script>

<style scoped>
/* 容器和页面基础样式 - 移动端适配 */
.container{ height: 100%; overflow: hidden; will-change: transform; }
.container--drag-locked{
  position: fixed; width: 100%; height: 100vh; overflow: hidden; touch-action: none;
}
.container--fixed{
  position: fixed; left: 0; right: 0;
  top: var(--window-top, 0px);
  height: calc(100vh - var(--window-top, 0px));
  z-index: 1;
  will-change: transform;
}
.page{
  display: flex; flex-direction: column; height: 100%;
  background: #f6f7fb; width: 100%; max-width: 100vw; overflow: hidden;
  /* 只允许横向手势向外层（用于 swiper）；纵向在内部滚动 */
  touch-action: pan-x;
}
/* 统一去掉 scroll-view 顶部占位，避免再出现那一截空白 */
.left, .right__list, .right { padding-top: 0 !important; }
.page--drag-locked{ overflow: hidden; touch-action: none; position: relative; }
.main{ display: flex; flex-direction: row; flex: 1; height: 100%; overflow: hidden; min-height: 0; }

.left{
  width: 240rpx; min-width: 120px; max-width: 30vw;
  background: #fff; border-right: 1px solid #eef0f4; flex-shrink: 0; overflow: hidden;
}
.right{
  flex: 1; padding: 16rpx 20rpx; height: 100%;
  min-width: 0; overflow: hidden; display: block;
}

.cat{ position:relative; padding:26rpx 22rpx 26rpx 30rpx }
.cat--active{ background:#fff5f5 }
.cat-ind{ position:absolute; left:0; top:0; bottom:0; width:8rpx; background:#ff4d4f; border-radius:0 6rpx 6rpx 0 }
.cat__txt{ font-size:30rpx; color:#333 }

.right__title{
  position: sticky; top: 0; z-index: 100; background: #f6f7fb;
  font-size:34rpx; font-weight:700; padding:8rpx 4rpx 22rpx; color:#333;
  display:flex; align-items:center; justify-content:space-between; flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.right__title--sticky { background: #f6f7fb; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.container--drag-locked .right__title--sticky { box-shadow: none; }
.container--drag-locked .right { overflow: hidden; }



@media screen and (max-width: 480px) {
  .right__title { padding: 6rpx 2rpx 18rpx; font-size: 32rpx; }
}

.right__list{ box-sizing: border-box; }

.row{ display:flex; flex-direction:row; align-items:center; justify-content:space-between;
  padding:18rpx 6rpx; border-bottom:1px solid #f0f0f0; margin-bottom:12rpx }
.row__info{ flex:1; padding-right:100rpx }
.row__line{ display:flex; flex-direction:row; margin:4rpx 0; align-items:center; position:relative }
.lbl{ color:#666; font-size:26rpx; width:140rpx; flex-shrink:0 }
.val{ color:#333; font-size:26rpx; flex:1 }
.row__ops{ display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12rpx; flex-shrink:0 }

.pill{ width:88rpx; height:52rpx; border-radius:26rpx; display:flex; align-items:center; justify-content:center;
  font-size:24rpx; color:#fff; box-shadow: 0 4rpx 8rpx rgba(0,0,0,.15), inset 0 1rpx 2rpx rgba(255,255,255,.2);
  transition:all .3s cubic-bezier(0.4, 0, 0.2, 1); position:relative; overflow:hidden; }
.pill--green{ background:linear-gradient(135deg, #3bb34a 0%, #2d8f3a 100%) }
.pill--red{ background:linear-gradient(135deg, #f26363 0%, #e04545 100%) }

/* BOM专用材料行按钮 */
.pill--blue{
  background:linear-gradient(135deg, #722ed1 0%, #531dab 100%); border-radius:8rpx; border:1rpx solid rgba(255,255,255,.3);
  box-shadow: 0 4rpx 8rpx rgba(114,46,209,.2), inset 0 1rpx 2rpx rgba(255,255,255,.3);
}
.pill--orange{
  background:linear-gradient(135deg, #fa541c 0%, #d4380d 100%); border-radius:8rpx; border:1rpx solid rgba(255,255,255,.3);
  box-shadow: 0 4rpx 8rpx rgba(250,84,28,.2), inset 0 1rpx 2rpx rgba(255,255,255,.3);
}
.pill:active{ transform:scale(0.96) translateY(1rpx); box-shadow: 0 2rpx 4rpx rgba(0,0,0,.2), inset 0 1rpx 2rpx rgba(255,255,255,.1); }
.pill--blue:active{ transform:scale(0.94) translateY(2rpx); box-shadow: 0 2rpx 4rpx rgba(114,46,209,.3), inset 0 1rpx 2rpx rgba(255,255,255,.2), inset 0 -1rpx 3rpx rgba(0,0,0,.15); }
.pill--orange:active{ transform:scale(0.94) translateY(2rpx); box-shadow: 0 2rpx 4rpx rgba(250,84,28,.3), inset 0 1rpx 2rpx rgba(255,255,255,.2), inset 0 -1rpx 3rpx rgba(0,0,0,.15); }
.pill::before{
  content:''; position:absolute; top:4rpx; left:8rpx; width:30rpx; height:12rpx;
  background:linear-gradient(135deg, rgba(255,255,255,.6), rgba(255,255,255,.2)); border-radius:20rpx; pointer-events:none; z-index:2;
}

.divider{ height:1px; background:#eef0f4; margin:8rpx 0 22rpx }

.fab{ position:fixed; width:96rpx; height:96rpx; border-radius:50%; display:flex; align-items:center; justify-content:center;
  right:28rpx; bottom:calc(env(safe-area-inset-bottom, 0px) + 160rpx); box-shadow:0 10rpx 26rpx rgba(0,0,0,.16); z-index:100 }
.fab--cart{ background:#4da3ff }
.cart{ color:#fff; font-size:42rpx; line-height:42rpx }
.badge{ position:absolute; right:-6rpx; top:-6rpx; background:#ff4d4f; color:#fff; font-size:22rpx; border-radius:999rpx; padding:4rpx 10rpx }

.mask{ position:fixed; inset:0; background:rgba(0,0,0,.35); z-index:999 }
.cart-panel{
  position:fixed; left:0; right:0; bottom:calc(env(safe-area-inset-bottom, 0px) + 80rpx); background:#fff; border-top-left-radius:18rpx; border-top-right-radius:18rpx;
  max-height:70vh; z-index:1000; display:flex; flex-direction:column
}
.cart-title{ font-size:32rpx; font-weight:700; padding:24rpx 24rpx 16rpx; border-bottom:1px solid #eef0f4; text-align:center }
.cart-list{ flex:1; padding:16rpx 24rpx; overflow-y:auto }
.cart-item{ display:flex; flex-direction:row; align-items:center; justify-content:space-between; padding:16rpx 0; border-bottom:1px solid #f5f5f5 }
.cart-item-info{ flex:1; display:flex; flex-direction:row; align-items:center; gap:12rpx; flex-wrap:wrap }
.ci-name{ font-size:28rpx; color:#333; font-weight:600 }
.ci-code{ font-size:24rpx; color:#777 }
.ci-qty{ font-size:26rpx; font-weight:700; margin-top:0 }
.ci-qty.in{ color:#3bb34a }
.ci-qty.out{ color:#f26363 }
.cart-item-action{ flex-shrink:0 }
.delete-btn{ padding:8rpx 16rpx; background:#ff4d4f; color:#fff; border-radius:8rpx; font-size:24rpx }
.cart-footer{ padding:16rpx 24rpx 24rpx; border-top:1px solid #eef0f4; background:#fafafa }
.cart-summary{ text-align:center; margin-bottom:16rpx }
.summary-text{ font-size:28rpx; color:#666 }
.cart-actions{ display:flex; flex-direction:row; gap:16rpx }
.ca-btn{ flex:1; padding:16rpx 0; border-radius:12rpx; font-size:28rpx; text-align:center; font-weight:600 }
.ca-clear{ background:#f3f4f6; color:#666 }
.ca-checkout{ background:#3c9cff; color:#fff }

/* 右侧抽屉与遮罩 */
.drawer-overlay{ position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,.5); z-index:1000 }
.drawer{
  position:fixed; top:0; right:-500rpx; width:500rpx; height:100vh; background:#fff; z-index:1001;
  transition:right .2s ease; box-shadow:-2rpx 0 8rpx rgba(0,0,0,.1); display:flex; flex-direction:column;
}
.drawer--dragging{ transition:none }
.drawer-header{ display:flex; align-items:center; justify-content:center; padding:40rpx 32rpx 32rpx; border-bottom:1rpx solid #f0f0f0; background:#f8f9fa }
.drawer-title{ font-size:32rpx; font-weight:600; color:#333 }
.drawer-content{ padding:32rpx 0; flex:1; }
.drawer-item{ display:flex; align-items:center; padding:32rpx 40rpx; border-bottom:1rpx solid #f5f5f5 }
.drawer-footer{ padding:24rpx; display:flex; align-items:center; border-top:1rpx solid #f0f0f0; }
.drawer-icon{ font-size:36rpx; margin-right:24rpx; width:60rpx; text-align:center }
.drawer-text{ font-size:30rpx; color:#333; font-weight:500 }

/* 拖拽选择与拖动代理 */
.cat--selected{ background:#e6f7ff; border-left:6rpx solid #1890ff }
.cat-checkbox{ position:absolute; top:8rpx; right:8rpx; width:32rpx; height:32rpx; background:#1890ff; color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20rpx; font-weight:bold }
.row--selected{ background:#e6f7ff; border-left:6rpx solid #1890ff }
.material-checkbox{ width:32rpx; height:32rpx; background:#1890ff; color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20rpx; font-weight:bold; margin-right:16rpx; flex-shrink:0 }

/* 车间仓样式 */
.negative-quantity{ color:#ff4d4f !important; font-weight:600 }
.quantity-detail{ position:absolute; right:-36rpx; top:50%; transform:translateY(-50%); width:44rpx; height:52rpx; display:flex; align-items:flex-end; justify-content:center; gap:3rpx; padding:0 }
.qd-bar{ width:8rpx; border-radius:4rpx 4rpx 0 0; box-shadow:0 2rpx 4rpx rgba(0,0,0,.08) }
.qd-bar--a{ height:18rpx; background:linear-gradient(180deg,#a0f0a8 0%, #3bb34a 100%) }
.qd-bar--b{ height:26rpx; background:linear-gradient(180deg,#ff9aa0 0%, #ff4d4f 100%) }
.qd-bar--c{ height:36rpx; background:linear-gradient(180deg,#69c0ff 0%, #1890ff 100%) }
.qd-bar--d{ height:46rpx; background:linear-gradient(180deg,#5cdbd3 0%, #13c2c2 100%) }

/* 计算详情模态框 */
.calculation-modal{ position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); width:750rpx; max-height:80vh; background:#fff; border-radius:16rpx; z-index:1002; overflow:hidden }
.calc-section{ margin-bottom:32rpx; padding:24rpx; background:#f9f9f9; border-radius:12rpx }
.calc-title{ display:block; font-size:28rpx; color:#333; font-weight:600; margin-bottom:16rpx }
.calc-item{ display:flex; justify-content:space-between; align-items:center; padding:12rpx 0; border-bottom:1rpx solid #f0f0f0 }
.calc-dept{ font-size:26rpx; color:#666; flex:1 }
.calc-quantity{ font-size:26rpx; font-weight:600; margin-right:24rpx }
.calc-quantity.negative{ color:#ff4d4f }
.calc-date{ font-size:22rpx; color:#999 }
.calc-total{ display:flex; justify-content:space-between; align-items:center; padding:16rpx 0; margin-top:16rpx; border-top:2rpx solid #e8e8e8 }
.calc-label{ font-size:28rpx; color:#333; font-weight:600 }
.calc-value{ font-size:28rpx; font-weight:600; color:#52c41a }
.calc-value.negative{ color:#ff4d4f }
.calc-result{ display:flex; justify-content:space-between; align-items:center; padding:24rpx; background:linear-gradient(135deg,#f0f8ff,#e6f7ff); border-radius:12rpx; margin-top:24rpx }
.result-label{ font-size:32rpx; color:#333; font-weight:600 }
.result-value{ font-size:36rpx; font-weight:700; color:#52c41a }
.result-value.negative{ color:#ff4d4f }

/* 批量发料模态框 */
.batch-issue-modal{ position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); width:800rpx; max-height:85vh; background:#fff; border-radius:16rpx; z-index:1002; overflow:hidden }
.form-section{ margin-bottom:32rpx }
.section-title{ display:block; font-size:28rpx; color:#333; font-weight:600; margin-bottom:16rpx }
.department-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:16rpx }
.dept-item{ padding:20rpx 16rpx; background:#f9f9f9; border-radius:8rpx; text-align:center; border:2rpx solid transparent; transition:all .3s ease }
.dept-item--selected{ background:#e6f7ff; border-color:#1890ff }
.dept-name{ font-size:26rpx; color:#333; font-weight:500 }
.bom-list{ display:flex; flex-direction:column; gap:12rpx }
.bom-item{ padding:20rpx; background:#f9f9f9; border-radius:8rpx; border:2rpx solid transparent; transition:all .3s ease }
.bom-item--selected{ background:#e6f7ff; border-color:#1890ff }
.bom-name{ display:block; font-size:28rpx; color:#333; font-weight:600; margin-bottom:8rpx }
.bom-spec{ display:block; font-size:24rpx; color:#666 }
.issue-preview{ display:flex; flex-direction:column; gap:12rpx; max-height:300rpx; overflow-y:auto }
.preview-item{ display:flex; justify-content:space-between; align-items:center; padding:16rpx; background:#f9f9f9; border-radius:8rpx }
.preview-info{ flex:1 }
.preview-name{ display:block; font-size:26rpx; color:#333; font-weight:600; margin-bottom:4rpx }
.preview-code{ display:block; font-size:22rpx; color:#666 }
.preview-quantity{ display:flex; flex-direction:column; align-items:flex-end; gap:4rpx }
.preview-need{ font-size:24rpx; color:#333; font-weight:500 }
.preview-available{ font-size:24rpx; color:#52c41a; font-weight:500 }
.preview-available.insufficient{ color:#ff4d4f }
.quantity-input{ display:flex; align-items:center; gap:16rpx }
.quantity-label{ font-size:26rpx; color:#333; font-weight:500 }
.quantity-field{ flex:1; padding:16rpx; border:2rpx solid #d9d9d9; border-radius:8rpx; font-size:26rpx; background:#fff }
.quantity-field:focus{ border-color:#1890ff; outline:none }

/* 通用模态样式 */
.modal-mask{ position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,.5); z-index:1001 }
.modal-title{ text-align:center; font-size:32rpx; font-weight:600; padding:32rpx 24rpx 16rpx; border-bottom:1rpx solid #f0f0f0 }
.modal-content{ padding:24rpx }
.selector-row{ display:flex; align-items:center; margin-bottom:24rpx }
.selector-label{ width:160rpx; font-size:28rpx; color:#333; flex-shrink:0 }
.picker-display{ flex:1; display:flex; align-items:center; justify-content:space-between; padding:16rpx 20rpx; background:#f8f9fa; border-radius:8rpx; border:1rpx solid #e9ecef; font-size:28rpx; color:#333 }
.picker-arrow{ color:#999; font-size:24rpx }
.modal-actions{ display:flex; border-top:1rpx solid #f0f0f0 }
.modal-btn{ flex:1; text-align:center; padding:24rpx 0; font-size:28rpx; font-weight:600 }
.modal-cancel{ color:#666; border-right:1rpx solid #f0f0f0 }
.modal-confirm{ color:#1890ff }
.add-category-modal,.add-material-modal{ position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); width:600rpx; max-height:75vh; overflow:auto; background:#fff; border-radius:16rpx; z-index:1002; will-change:transform }
.input-row{ display:flex; align-items:center; margin-bottom:24rpx }
.input-label{ width:160rpx; font-size:28rpx; color:#333; flex-shrink:0 }
.input-field{ flex:1; padding:16rpx 20rpx; background:#f8f9fa; border-radius:8rpx; border:1rpx solid #e9ecef; font-size:28rpx; color:#333 }
.btn-disabled{ opacity:.5; pointer-events:none }

/* 标题栏按钮 */
.title-buttons{ display:flex; align-items:center; gap:16rpx; margin-right:6rpx }
.batch-issue-btn{
  width:88rpx; height:52rpx; background:linear-gradient(135deg, #1890ff 0%, #096dd9 100%); border-radius:8rpx;
  display:flex; align-items:center; justify-content:center; box-shadow: 0 6rpx 12rpx rgba(24,144,255,.25), inset 0 2rpx 4rpx rgba(255,255,255,.3), inset 0 -2rpx 6rpx rgba(0,0,0,.1);
  transition:all .3s cubic-bezier(0.4, 0, 0.2, 1); position:relative; overflow:hidden; border:2rpx solid rgba(255,255,255,.2);
}
.batch-issue-text{ font-size:24rpx; color:#fff; font-weight:600 }
.batch-issue-btn:active{
  transform:scale(0.95) translateY(2rpx);
  box-shadow: 0 3rpx 6rpx rgba(24,144,255,.4), inset 0 1rpx 2rpx rgba(255,255,255,.2), inset 0 -1rpx 4rpx rgba(0,0,0,.15);
}

/* 通用胶囊按钮样式 */
.add-btn, .cat--add{
  width:88rpx; height:52rpx; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius:26rpx;
  display:flex; align-items:center; justify-content:center; box-shadow: 0 4rpx 8rpx rgba(102,126,234,.3), inset 0 2rpx 4rpx rgba(255,255,255,.2), inset 0 -2rpx 6rpx rgba(0,0,0,.1);
  transition:all .3s cubic-bezier(0.4, 0, 0.2, 1); position:relative; overflow:hidden; border:none; text-align:center;
}

/* 智能按钮专用 - 三个圆点 */
.smart-action-btn{ display:flex; align-items:center; justify-content:center; transition:all .3s ease; position:relative; cursor:pointer; padding:8rpx; transform:translateX(-16rpx); }
.dots-container{ display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6rpx; }
.cat--add .dots-container{ flex-direction:row; gap:8rpx; }
.dot{ border-radius:50%; transition:all .3s ease; position:relative; width:10rpx; height:10rpx; animation:breathe-dot 2s ease-in-out infinite; }
.dot-small:nth-child(1){ background:#1890ff; animation-delay:0s; }
.dot-large{ background:#52c41a; animation-delay:0.3s; }
.dot-small:nth-child(3){ background:#fa8c16; animation-delay:0.6s; }
@keyframes breathe-dot { 0%, 100% { transform:scale(1); opacity:0.9; } 50% { transform:scale(1.3); opacity:1; } }
.smart-action-btn:active .dot{ animation-play-state:paused; transform:scale(0.8); opacity:0.6; }

.cat--add{ margin:16rpx 0 16rpx 22rpx; align-self:flex-start; display:flex; align-items:center; justify-content:center;
  width:88rpx; height:52rpx; background:transparent; border-radius:8rpx; transition:all .3s ease; position:relative; cursor:pointer; padding:8rpx; }
.add-btn::before{
  content:''; position:absolute; top:4rpx; left:8rpx; width:30rpx; height:12rpx;
  background:linear-gradient(135deg, rgba(255,255,255,.6), rgba(255,255,255,.2)); border-radius:20rpx; pointer-events:none; z-index:2;
}
.add-btn::after{
  content:''; position:absolute; bottom:-3rpx; left:50%; transform:translateX(-50%); width:70rpx; height:10rpx;
  background:linear-gradient(90deg, transparent, rgba(102,126,234,.3) 20%, rgba(102,126,234,.3) 80%, transparent); border-radius:50%; pointer-events:none; z-index:-1; filter:blur(2rpx);
}
.add-btn:active{ transform:scale(0.96) translateY(1rpx);
  box-shadow: 0 4rpx 8rpx rgba(102,126,234,.5), inset 0 2rpx 4rpx rgba(255,255,255,.3), inset 0 -2rpx 6rpx rgba(0,0,0,.2);
}

/* 批量出库 UI */
.cat--batch-out{
  background:linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%); border:none; margin-top:16rpx; border-radius:12rpx;
  box-shadow: 0 6rpx 12rpx rgba(255,77,79,.25), inset 0 2rpx 4rpx rgba(255,255,255,.2), inset 0 -2rpx 6rpx rgba(0,0,0,.1);
  transition:all .3s cubic-bezier(0.4, 0, 0.2, 1); position:relative; overflow:hidden;
}
.cat--batch-out:active{ transform:scale(0.98) translateY(1rpx);
  box-shadow: 0 4rpx 8rpx rgba(255,77,79,.35), inset 0 1rpx 2rpx rgba(255,255,255,.1);
}
.cat--batch-out::before{
  content:''; position:absolute; top:4rpx; left:8rpx; width:40rpx; height:14rpx;
  background:linear-gradient(135deg, rgba(255,255,255,.7), rgba(255,255,255,.3)); border-radius:20rpx; pointer-events:none; z-index:2;
}
.cat__txt--batch{ color:#fff; font-weight:700; text-shadow:0 1rpx 2rpx rgba(0,0,0,.3); font-size:28rpx; }

/* 批量下载按钮 */
.cat--download{
  display:flex; justify-content:center; align-items:center; margin-top:20rpx; padding:16rpx;
  background: linear-gradient(135deg, #4a90e2, #3a70c2); border-radius: 8rpx;
  box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.15); position: relative;
}
.cat--download:active{ transform: scale(0.98) translateY(1rpx); box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1); }

/* 批量出库模态框 */
.batch-outbound-modal{
  position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
  width:750rpx; max-height:85vh; background:#fff; border-radius:16rpx; z-index:1002; overflow:hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
}
.modal-header { position: relative; padding: 24rpx 30rpx; border-bottom: 1rpx solid #f0f0f0; }
.modal-title { font-size: 32rpx; font-weight: 600; color: #333; text-align: center; }
.modal-close-btn {
  position: absolute; top: 16rpx; right: 16rpx; width: 70rpx; height: 70rpx; display: flex; align-items: center; justify-content: center;
  font-size: 48rpx; color: #666; border-radius: 50%; background: #f5f5f5; transition: all 0.2s ease;
}
.modal-close-btn:hover { background: #e0e0e0; color: #333; }
.batch-selector,.dept-selector{ display:flex; flex-wrap:wrap; gap:16rpx; margin-top:20rpx }
.batch-item,.dept-item{
  padding:18rpx 26rpx; background:#f6f7f9; border-radius:12rpx; border:2rpx solid transparent; cursor:pointer; transition:all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}
.batch-item--selected,.dept-item--selected{ background:#e6f7ff; border-color:#1890ff; color:#1890ff; box-shadow: 0 2rpx 12rpx rgba(24, 144, 255, 0.15); }
.batch-item--disabled{ opacity:0.5; background:#f0f0f0; color:#999; cursor:not-allowed }
.batch-name,.dept-name{ font-size:28rpx; font-weight:500 }
.batch-status{ font-size:22rpx; color:#999; margin-top:6rpx }
.outbound-preview{ display:flex; flex-direction:column; gap:16rpx; max-height:300rpx; overflow-y:auto; margin-top:20rpx; padding: 10rpx; }
.preview-workshop{ font-size:24rpx; color:#52c41a; font-weight:500 }
.preview-outbound{ font-size:24rpx; color:#fa8c16; font-weight:500 }

/* 拖拽遮罩层与影子 */
.drag-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1500; background: rgba(0, 0, 0, 0.1); pointer-events: auto; touch-action: none; }
.drag-ghost { position: absolute; padding: 16rpx 24rpx; background: rgba(255, 255, 255, 0.95); border: 2rpx solid #1890ff; border-radius: 12rpx; box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.2); transform: translate(-50%, -50%); pointer-events: none; z-index: 1501; }
.ghost-text { font-size: 24rpx; color: #1890ff; font-weight: 500; }

/* 删除区公共外观 */
.drag-delete-zone{
  position: fixed; left: 40rpx; right: 40rpx; height: 120rpx; border-radius: 24rpx;
  background: #f5f5f5; border: 2rpx dashed #ff5a5a; color: #ff5a5a;
  display: flex; align-items: center; justify-content: center; z-index: 10000;
  transition: transform .18s ease, opacity .18s ease; opacity: 0;
}
.from-bottom{ bottom: 40rpx; transform: translateY(30rpx); }
.from-top { top: 40rpx; transform: translateY(-30rpx); }
.enter{ opacity: 1; transform: translateY(0) !important; }
.leave{ opacity: 0; }
.drag-zone-active{ background: #ffefef; border-color: #ff2d2d; transform: translateY(0) scale(1.02) !important; }
.drag-zone-icon{ font-size: 40rpx; margin-right: 12rpx; }
.drag-zone-text{ font-size: 28rpx; }

@supports (padding: max(0px)) {
  .from-bottom{ bottom: calc(40rpx + env(safe-area-inset-bottom)); }
  .from-top { top: calc(40rpx + env(safe-area-inset-top)); }
}

/* 拖拽中的行样式 */
.row--dragging { opacity: 0.5; transform: scale(0.95); transition: all 0.2s ease; }

/* 移动端响应式 */
@media screen and (max-width: 480px) {
  .left { width: 200rpx; min-width: 100px; }
  .right { padding: 12rpx 16rpx; }
  .cat { padding: 20rpx 16rpx 20rpx 24rpx; }
  .cat__txt { font-size: 28rpx; }
  .right__title { font-size: 32rpx; padding: 6rpx 2rpx 18rpx; }
  .row { padding: 16rpx 4rpx; margin-bottom: 10rpx; }
  .lbl { font-size: 24rpx; width: 120rpx; }
  .val { font-size: 24rpx; }
  .pill { width: 80rpx; height: 48rpx; font-size: 22rpx; }
}
@media screen and (max-width: 375px) {
  .left { width: 180rpx; min-width: 90px; }
  .cat { padding: 18rpx 12rpx 18rpx 20rpx; }
  .cat__txt { font-size: 26rpx; }
  .right { padding: 10rpx 12rpx; }
  .right__title { font-size: 30rpx; }
  .lbl { width: 100rpx; font-size: 22rpx; }
  .val { font-size: 22rpx; }
  .pill { width: 72rpx; height: 44rpx; font-size: 20rpx; }
}
@media screen and (orientation: landscape) and (max-height: 500px) {
  .container { padding-top: 20px; padding-bottom: 10px; }
  .page { height: 100%; }
  .cat { padding: 16rpx 20rpx 16rpx 24rpx; }
  .row { padding: 14rpx 4rpx; margin-bottom: 8rpx; }
}
@media screen and (max-width: 320px) {
  .left { width: 160rpx; min-width: 80px; }
  .right { padding: 8rpx 10rpx; }
  .cat__txt { font-size: 24rpx; }
  .right__title { font-size: 28rpx; }
  .pill { width: 68rpx; height: 40rpx; font-size: 18rpx; }
}
.page--drag-locked { overscroll-behavior: contain; }
.container--drag-locked { overscroll-behavior: none; }
.container, .page { overscroll-behavior: contain; }
.right__list, .left { -webkit-overflow-scrolling: touch; overscroll-behavior: contain; touch-action: pan-y; }
.drag-mask { touch-action: none; }
.cat, .row { -webkit-touch-callout: none; user-select: none; }
/* 预览不足标红 */
.preview-workshop.insufficient { color:#ff4d4f; font-weight:700; }
</style>
