/**
 * 材料页面修复方案汇总
 * 
 * 本文件包含了所有需要应用到 material-page.vue 的修复代码片段
 * 请根据注释将对应代码片段复制到相应位置
 */

// ①：给初始 groups 标明 scope
// 在 data() 里把 groups 初始化改成带 scope
const groupsWithScope = `groups: [ 
  // 主材仓 (nid=0) 
  { scope: 0, title: '材料1', materials: [ { id: 1001, code: 'ELY-001', name: '材料1', quantity: 520, batch: '20250920', spec: '4.5V' } ]}, 
  { scope: 0, title: '材料2', materials: [ { id: 1002, code: 'ELY-002', name: '材料2', quantity: 300, batch: '20250921', spec: '-30℃' } ]}, 
  { scope: 0, title: '材料3', materials: [ { id: 1003, code: 'ELY-003', name: '材料3', quantity: 260, batch: '20250922', spec: '6.0V' } ]}, 
  { scope: 0, title: '材料4', materials: [ { id: 1004, code: 'ELY-004', name: '材料4', quantity: 180, batch: '20250923', spec: '3.7V' } ]}, 
  { scope: 0, title: '材料5', materials: [ { id: 1005, code: 'ELY-005', name: '材料5', quantity: 220, batch: '20250924', spec: '5.2V' } ]}, 

  // 车间仓 (nid=1) 
  { scope: 1, title: '材料1', materials: [ { id: 2001, code: 'ELY-001', name: '材料1', quantity: 20, batch: '20250910', spec: '3.7V' } ]}, 
  { scope: 1, title: '材料2', materials: [ { id: 2002, code: 'ELY-002', name: '材料2', quantity: 5, batch: '20250911', spec: '4.2V' } ]}, 
  { scope: 1, title: '材料3', materials: [ { id: 2003, code: 'ELY-003', name: '材料3', quantity: -5, batch: '20250912', spec: '6.0V' } ]}, 
  { scope: 1, title: '材料4', materials: [ { id: 2004, code: 'ELY-004', name: '材料4', quantity: -10, batch: '20250905', spec: '3.7V' } ]}, 
  { scope: 1, title: '材料5', materials: [ { id: 2005, code: 'ELY-005', name: '材料5', quantity: -5, batch: '20250906', spec: '5.2V' } ]}, 

  // BOM (nid=2) 
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
    { id: 3006, code: 'ELY-006', name: '材料6', quantity: 20, department: 'PACKING',  spec: '包装用' } 
  ]} 
],`;

// 在 created() 里加一段"兜底补齐 scope"的规范化
const createdWithScopeNormalization = `created() {
  // 规范化，缺少 scope 的补上 
  const safe = (v) => Number.isInteger(v) ? v : 0
  this.groups = (this.groups || []).map(g => ({ 
    scope: (g && Number.isInteger(g.scope)) ? g.scope : 0, 
    title: (g && g.title) || '', 
    materials: Array.isArray(g && g.materials) ? g.materials : [] 
  }))
  const cats = this.tabCategories[this.nid] || this.tabCategories[0] 
  this.selectedCategory = cats[0] 
  this.loadCartList()
},`;

// ②：重写 findGroupByTabAndTitle（强健 & 回退策略）
const findGroupByTabAndTitle = `findGroupByTabAndTitle(scope, title) {
  if (!title) return null
  // 先按 scope + title 精确匹配
  const g1 = this.groups.find(g => g && g.scope === scope && g.title === title)
  if (g1) return g1
  // 兼容旧数据：没有 scope 时回退仅按 title 匹配（取第一个）
  const g2 = this.groups.find(g => g && g.title === title)
  return g2 || null
},`;

// ③：flatMaterials 用新方法查组；车间仓用"动态数量"覆盖
const flatMaterialsComputed = `flatMaterials() {
  if(!this.selectedCategory) return []
  const g = this.findGroupByTabAndTitle(this.nid, this.selectedCategory.name)
  if(!g) return []
  if(this.nid === 1) {
    // 车间仓数量 = 主材仓出库总量 - BOM需求总量
    return (g.materials || []).map(material => ({
      ...material,
      quantity: this.calculateWorkshopQuantity(material.code),
      originalQuantity: material.quantity
    }))
  }
  return g.materials || []
},`;

// ④：主材仓库存查询只看 scope===0
const findMainWarehouseMaterialByCode = `findMainWarehouseMaterialByCode(code) {
  // 只查主材仓（scope=0）
  for(const g of this.groups) {
    if (g && g.scope === 0 && Array.isArray(g.materials)) {
      const m = g.materials.find(x => x && x.code === code)
      if (m) return m
    }
  }
  return null
},`;

// ⑤：新增分类/材料时补上 scope
const confirmAddCategory = `confirmAddCategory() {
  if(!this.newCategoryName.trim()) return uiUtils.showToast('请输入名称')
  if (!this.tabCategories[this.nid]) this.tabCategories[this.nid] = []
  const list = this.tabCategories[this.nid]
  const maxId = Math.max(...list.map(c=>c.id), 0)
  const nc = { id:maxId+1, name:this.newCategoryName.trim() }
  this.tabCategories[this.nid].push(nc)
  // 关键：把 scope 写进去
  this.groups.push({ scope: this.nid, title: nc.name, materials: [] })
  uiUtils.showSuccess('添加成功')
  this.closeAddCategoryModal(); this.selectedCategory = nc
},`;

const confirmAddMaterial = `confirmAddMaterial() {
  if(!this.newMaterial.code.trim()) return uiUtils.showToast('请填写材料编码')
  const code = this.newMaterial.code.trim()
  const exist = this.groups.some(g => (g.materials||[]).some(m => m.code === code))
  if(exist) return uiUtils.showToast('材料编码已存在')

  const group = this.findGroupByTabAndTitle(this.nid, this.selectedCategory ? this.selectedCategory.name : '')
  if(group) {
    const all = this.groups.flatMap(g => g.materials||[])
    const maxId = Math.max.apply(null, all.map(m=>m.id).concat([0]))
    group.materials.push({
      id:maxId+1, code,
      name: this.newMaterial.name.trim() || code,
      quantity: parseInt(this.newMaterial.quantity)||0,
      batch: (this.newMaterial.batch||'').trim()||'-',
      spec: (this.newMaterial.spec||'').trim()||'-'
    })
    uiUtils.showSuccess('材料添加成功'); this.closeAddMaterialModal()
  }
},`;

// ⑥：发料/出库预览按 scope 精确拿组
const generateOutboundPreview = `generateOutboundPreview() {
  if(!this.selectedBatch || !this.selectedOutboundDepartment) return
  // 在 BOM 作用域(scope=2)里找
  const bomGroup = this.groups.find(g => g && g.scope === 2 && g.title === this.selectedBatch.name)
  if(!bomGroup) return

  const deptMaterials = (bomGroup.materials||[]).filter(m => m.department === this.selectedOutboundDepartment.code)
  this.outboundPreview = deptMaterials.map(m => {
    const workshopQuantity = this.getWorkshopQuantity(m.code)
    return {
      materialCode: m.code,
      materialName: m.name,
      workshopQuantity,
      outboundQuantity: m.quantity
    }
  })
},`;

// ⑦：smart 按钮的小修
const smartButtonConfig = `smartButtonConfig() {
  if(!this.selectedCategory) return { text: '新增', action: 'add', icon: '➕' }
  if (this.nid === 2) {
    return { text: '上传', action: 'upload', icon: '📤' }
  }
  return { text: '新增', action: 'add', icon: '➕' }
},`;

// 修复拖拽删除区首次测量问题
const measureDeleteZone = `_measureDeleteZone() {
  const el = document.getElementById('deleteZone')
  if (!el) return
  
  uni.createSelectorQuery()
    .select('#deleteZone')
    .boundingClientRect(rect => {
      if (rect) {
        this.deleteZoneRect = rect
      } else {
        // 如果首次测量失败，延迟再次尝试
        setTimeout(this._measureDeleteZone, 50)
      }
    })
    .exec()
},`;

// 修复usedBatches可能重复push的问题
const fixUsedBatches = `_doBatchOutbound() {
  // 添加到已使用批次，避免重复添加
  if (!this.usedBatches.some(b => b.id === this.selectedBatch.id)) {
    this.usedBatches.push(this.selectedBatch)
  }
  
  // 其他出库逻辑保持不变...
  uiUtils.showSuccess('批量出库成功')
  this.closeBatchOutboundModal()
},`;