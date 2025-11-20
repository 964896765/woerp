// 物料数据库 - 包含完整的物料信息
export const materialDatabase = [
  // 锂电池正极材料
  {
    id: 1,
    code: 'NCM-001',
    name: '三元材料 NCM523',
    category: '正极材料',
    unit: 'kg',
    stock: 1250.5,
    location: '主材仓A区-01',
    supplier: '宁波金和锂业',
    spec: 'Ni:Co:Mn=5:2:3',
    pinyin: 'sanyuan cailiao NCM523'
  },
  {
    id: 2,
    code: 'NCM-002',
    name: '三元材料 NCM622',
    category: '正极材料',
    unit: 'kg',
    stock: 890.0,
    location: '主材仓A区-02',
    supplier: '当升科技',
    spec: 'Ni:Co:Mn=6:2:2',
    pinyin: 'sanyuan cailiao NCM622'
  },
  {
    id: 3,
    code: 'NCM-003',
    name: '三元材料 NCM811',
    category: '正极材料',
    unit: 'kg',
    stock: 567.5,
    location: '主材仓A区-03',
    supplier: '厦门钨业',
    spec: 'Ni:Co:Mn=8:1:1',
    pinyin: 'sanyuan cailiao NCM811'
  },
  {
    id: 4,
    code: 'LFP-001',
    name: '磷酸铁锂',
    category: '正极材料',
    unit: 'kg',
    stock: 2100.0,
    location: '主材仓A区-04',
    supplier: '湖南裕能',
    spec: 'LiFePO4 ≥99.5%',
    pinyin: 'linsuan tieli'
  },
  {
    id: 5,
    code: 'LFP-002',
    name: '磷酸铁锂A',
    category: '正极材料',
    unit: 'kg',
    stock: 1850.5,
    location: '主材仓A区-05',
    supplier: '贝特瑞',
    spec: 'LiFePO4 ≥99.0%',
    pinyin: 'linsuan tieli A'
  },
  {
    id: 6,
    code: 'LFP-003',
    name: '磷酸铁锂B',
    category: '正极材料',
    unit: 'kg',
    stock: 1450.0,
    location: '主材仓A区-06',
    supplier: '德方纳米',
    spec: 'LiFePO4 ≥99.2%',
    pinyin: 'linsuan tieli B'
  },

  // 负极材料
  {
    id: 7,
    code: 'GRA-001',
    name: '人造石墨',
    category: '负极材料',
    unit: 'kg',
    stock: 3200.0,
    location: '主材仓B区-01',
    supplier: '上海杉杉',
    spec: '颗粒度 D50: 15-20μm',
    pinyin: 'renzao shimo'
  },
  {
    id: 8,
    code: 'GRA-002',
    name: '天然石墨',
    category: '负极材料',
    unit: 'kg',
    stock: 1800.5,
    location: '主材仓B区-02',
    supplier: '凯金能源',
    spec: '颗粒度 D50: 18-25μm',
    pinyin: 'tianran shimo'
  },
  {
    id: 9,
    code: 'GRA-003',
    name: '石墨',
    category: '负极材料',
    unit: 'kg',
    stock: 2750.0,
    location: '主材仓B区-03',
    supplier: '江西紫宸',
    spec: '高纯鳞片石墨',
    pinyin: 'shimo'
  },
  {
    id: 10,
    code: 'SiO-001',
    name: '硅氧复合材料',
    category: '负极材料',
    unit: 'kg',
    stock: 450.0,
    location: '主材仓B区-04',
    supplier: '贝特瑞',
    spec: 'SiO含量 ≥85%',
    pinyin: 'guiyang fuhe cailiao'
  },

  // 电解液
  {
    id: 11,
    code: 'ELY-001',
    name: '电解液A1',
    category: '电解液',
    unit: 'L',
    stock: 850.0,
    location: '主材仓C区-01',
    supplier: '天赐材料',
    spec: 'LiPF6 1.0M + EC:EMC=3:7',
    pinyin: 'dianjieye A1'
  },
  {
    id: 12,
    code: 'ELY-002',
    name: '电解液B1',
    category: '电解液',
    unit: 'L',
    stock: 720.5,
    location: '主材仓C区-02',
    supplier: '新宙邦',
    spec: 'LiPF6 1.2M + EC:DMC=1:1',
    pinyin: 'dianjieye B1'
  },
  {
    id: 13,
    code: 'ELY-003',
    name: '高浓度电解液',
    category: '电解液',
    unit: 'L',
    stock: 380.0,
    location: '主材仓C区-03',
    supplier: '多氟多',
    spec: 'LiPF6 1.3M + 特殊添加剂',
    pinyin: 'gao nongdu dianjieye'
  },

  // 隔膜
  {
    id: 14,
    code: 'SEP-001',
    name: '隔膜-高强度',
    category: '隔膜',
    unit: 'm²',
    stock: 15000.0,
    location: '主材仓D区-01',
    supplier: '星源材质',
    spec: '厚度: 16μm, 抗拉强度 ≥120MPa',
    pinyin: 'gemo gao qiangdu'
  },
  {
    id: 15,
    code: 'SEP-002',
    name: '隔膜-陶瓷涂层',
    category: '隔膜',
    unit: 'm²',
    stock: 12000.5,
    location: '主材仓D区-02',
    supplier: '沧州明珠',
    spec: '厚度: 20μm, 陶瓷涂层',
    pinyin: 'gemo taoci tureng'
  },
  {
    id: 16,
    code: 'SEP-003',
    name: '湿法隔膜',
    category: '隔膜',
    unit: 'm²',
    stock: 18500.0,
    location: '主材仓D区-03',
    supplier: '恩捷股份',
    spec: '厚度: 12μm, PE材质',
    pinyin: 'shifa gemo'
  },

  // 辅料
  {
    id: 17,
    code: 'AUX-001',
    name: '导电炭黑',
    category: '辅料',
    unit: 'kg',
    stock: 320.5,
    location: '辅料仓A区-01',
    supplier: '卡博特',
    spec: 'Super P',
    pinyin: 'daodian tanhei'
  },
  {
    id: 18,
    code: 'AUX-002',
    name: '粘结剂 PVDF',
    category: '辅料',
    unit: 'kg',
    stock: 180.0,
    location: '辅料仓A区-02',
    supplier: '苏威',
    spec: 'HSV900',
    pinyin: 'zhanjieji PVDF'
  },
  {
    id: 19,
    code: 'AUX-003',
    name: 'NMP溶剂',
    category: '辅料',
    unit: 'kg',
    stock: 950.0,
    location: '辅料仓B区-01',
    supplier: '赢创',
    spec: '电子级 ≥99.9%',
    pinyin: 'NMP rongji'
  },
  {
    id: 20,
    code: 'AUX-004',
    name: '铜箔',
    category: '辅料',
    unit: 'kg',
    stock: 1250.0,
    location: '辅料仓C区-01',
    supplier: '灵宝华鑫',
    spec: '厚度: 8μm',
    pinyin: 'tongbo'
  },
  {
    id: 21,
    code: 'AUX-005',
    name: '铝箔',
    category: '辅料',
    unit: 'kg',
    stock: 890.5,
    location: '辅料仓C区-02',
    supplier: '南山铝业',
    spec: '厚度: 12μm',
    pinyin: 'lvbo'
  }
]

// 搜索功能增强
export class MaterialSearch {
  constructor() {
    this.materials = materialDatabase
  }

  // 拼音转换（简易版）
  pinyinConvert(text) {
    const pinyinMap = {
      '磷酸铁锂': 'linsuan tieli',
      '三元材料': 'sanyuan cailiao',
      '石墨': 'shimo',
      '电解液': 'dianjieye',
      '隔膜': 'gemo',
      '辅料': 'fuliao',
      '正极': 'zhengji',
      '负极': 'fuji',
      '材料': 'cailiao',
      '高强度': 'gao qiangdu',
      '陶瓷涂层': 'taoci tureng',
      '导电炭黑': 'daodian tanhei',
      '粘结剂': 'zhanjieji',
      '溶剂': 'rongji',
      '铜箔': 'tongbo',
      '铝箔': 'lvbo'
    }

    let result = text
    Object.keys(pinyinMap).forEach(key => {
      result = result.replace(new RegExp(key, 'g'), pinyinMap[key])
    })
    return result
  }

  // 智能搜索
  search(keyword) {
    if (!keyword || !keyword.trim()) return []

    const searchTerm = keyword.toLowerCase().trim()
    const results = []

    this.materials.forEach(material => {
      let score = 0
      const name = material.name.toLowerCase()
      const code = material.code.toLowerCase()
      const category = material.category.toLowerCase()
      const pinyin = material.pinyin.toLowerCase()
      const supplier = material.supplier.toLowerCase()
      const spec = material.spec.toLowerCase()

      // 精确匹配编码（最高权重）
      if (code.includes(searchTerm)) {
        score += 100
      }

      // 名称开头匹配（高权重）
      if (name.startsWith(searchTerm)) {
        score += 80
      }

      // 名称包含匹配（中权重）
      if (name.includes(searchTerm)) {
        score += 50
      }

      // 拼音匹配（中权重）
      if (pinyin.includes(searchTerm)) {
        score += 40
      }

      // 类别匹配（低权重）
      if (category.includes(searchTerm)) {
        score += 20
      }

      // 供应商匹配（低权重）
      if (supplier.includes(searchTerm)) {
        score += 15
      }

      // 规格匹配（最低权重）
      if (spec.includes(searchTerm)) {
        score += 10
      }

      if (score > 0) {
        results.push({
          ...material,
          searchScore: score
        })
      }
    })

    // 按匹配度排序
    return results.sort((a, b) => b.searchScore - a.searchScore).slice(0, 50)
  }

  // 获取热门搜索关键词
  getHotKeys() {
    return [
      '磷酸铁锂',
      '三元材料',
      '石墨',
      '电解液',
      '隔膜',
      '导电炭黑',
      'NCM',
      'LFP'
    ]
  }

  // 获取分类统计
  getCategoryStats() {
    const stats = {}
    this.materials.forEach(material => {
      const category = material.category
      if (!stats[category]) {
        stats[category] = {
          count: 0,
          totalStock: 0,
          unit: material.unit
        }
      }
      stats[category].count++
      stats[category].totalStock += material.stock
    })
    return stats
  }

  // 获取库存预警（库存低于阈值）
  getLowStockWarning(threshold = 500) {
    return this.materials.filter(material => material.stock < threshold)
  }
}

// 导出实例
export const materialSearch = new MaterialSearch()
