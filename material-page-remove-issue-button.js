/**
 * 移除发料按钮和相关功能的修改
 * 
 * 需要修改的内容：
 * 
 * 1. 移除右侧标题区域的发料按钮
 * 将以下代码：
 * 
 * <view class="right__title">
 *   <text class="right__title__txt">{{ selectedCategory ? selectedCategory.name : '' }}</text>
 *   <view class="title-buttons">
 *     <view
 *       v-if="nid === 2"
 *       class="batch-issue-btn"
 *       @click="showBatchIssueModal"
 *     >
 *       <text class="batch-issue-text">发料</text>
 *     </view>
 *     <view class="smart-action-btn" @click="handleSmartAction">
 *       <view class="dots-container">
 *         <view class="dot dot-small"></view>
 *         <view class="dot dot-large"></view>
 *         <view class="dot dot-small"></view>
 *       </view>
 *     </view>
 *   </view>
 * </view>
 * 
 * 修改为：
 * 
 * <view class="right__title">
 *   <text class="right__title__txt">{{ selectedCategory ? selectedCategory.name : '' }}</text>
 *   <view class="title-buttons">
 *     <view class="smart-action-btn" @click="handleSmartAction">
 *       <view class="dots-container">
 *         <view class="dot dot-small"></view>
 *         <view class="dot dot-large"></view>
 *         <view class="dot dot-small"></view>
 *       </view>
 *     </view>
 *   </view>
 * </view>
 * 
 * 2. 移除整个批量发料模态框
 * 删除以下整个部分：
 * 
 * <!-- 按BOM批量发料模态框（发料加入🛒） -->
 * <view v-if="showBatchIssueDialog" class="modal-overlay" @click="closeBatchIssueModal">
 *   <view class="batch-issue-modal" @click.stop>
 *     ...整个模态框内容...
 *   </view>
 * </view>
 * 
 * 3. 移除data中的发料相关数据
 * 将：
 * 
 * // 按BOM批量发料
 * showBatchIssueDialog: false,
 * selectedDepartment: null,
 * selectedBom: null,
 * batchQuantity: 1,
 * issuePreview: [],
 * 
 * 修改为：
 * 
 * // 按BOM批量发料功能已移除
 * 
 * 4. 移除所有与发料相关的方法
 * 删除以下方法：
 * - showBatchIssueModal()
 * - closeBatchIssueModal()
 * - selectDepartment()
 * - selectBom()
 * - generateIssuePreview()
 * - confirmBatchIssueToCart()
 * 
 * 5. 移除computed中的发料相关计算属性
 * - availableBoms
 * - canConfirmIssue
 * 
 * 6. 移除CSS中的发料相关样式
 * 删除所有包含batch-issue相关的CSS样式
 */