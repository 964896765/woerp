<template>
  <view class="picker-wrap">
    <scroll-view class="chip-scroll" :scroll-x="true" enhanced show-scrollbar="false">
      <view
        v-for="t in types"
        :key="t.value"
        class="chip"
        :class="{ 'chip--active': internalValue === t.value }"
        @tap="select(t.value)"
      >
        <text class="chip-txt">{{ t.label }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: 'OutboundTypePicker',
  props:{
    value: { type: String, default: '' },
    includeAll: { type: Boolean, default: true }
  },
  data(){ return { internalValue: this.value } },
  computed:{
    types(){
      const list = [
        { value: 'purchase_return', label: '采购退货' },
        { value: 'line_return', label: '产线退仓' },
        { value: 'issue_production', label: '生产领料' },
        { value: 'batch_out', label: '批次出库' },
        { value: 'over_issue', label: '超领出库' },
        { value: 'replenish', label: '补料出库' },
        { value: 'prep_issue', label: '制料领料' },
        { value: 'aux_out', label: '辅料出库' }
      ]
      return this.includeAll ? [{ value:'', label:'全部' }, ...list] : list
    }
  },
  watch:{ value(v){ this.internalValue = v } },
  methods:{
    select(v){ this.internalValue = v; this.$emit('input', v); this.$emit('change', v) }
  }
}
</script>

<style scoped>
.picker-wrap{ width:100%; padding: 6px 8px; }
.chip-scroll{ white-space: nowrap; }
.chip{
  display: inline-flex; align-items: center; justify-content: center;
  height: 30px; padding: 0 12px; margin-right: 8px;
  border-radius: 999px; background: #f5f6f7; border: 1px solid #e5e6e7;
}
.chip--active{ background: #ffeded; border-color: #ff4d4f; }
.chip-txt{ font-size: 12px; }
/* 触发重新构建 */
</style>
