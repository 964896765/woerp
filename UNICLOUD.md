# uniCloud 使用指南

本项目使用 **uniCloud 阿里云版本**作为后端服务，提供云数据库、云函数和云存储功能。

---

## 📋 目录

- [项目结构](#项目结构)
- [云数据库](#云数据库)
- [云函数](#云函数)
- [前端调用](#前端调用)
- [云存储](#云存储)
- [部署指南](#部署指南)
- [常见问题](#常见问题)

---

## 🗂️ 项目结构

```
woerp/
├── uniCloud-aliyun/                 # uniCloud 阿里云服务空间
│   ├── cloudfunctions/              # 云函数目录
│   │   ├── material-service/        # 物料管理服务
│   │   │   ├── index.js            # 云函数入口
│   │   │   └── package.json        # 依赖配置
│   │   ├── warehouse-service/       # 仓库管理服务
│   │   │   ├── index.js
│   │   │   └── package.json
│   │   ├── bom-service/             # BOM管理服务
│   │   │   ├── index.js
│   │   │   └── package.json
│   │   └── common/                  # 公共模块
│   └── database/                    # 数据库Schema
│       ├── materials.schema.json    # 物料表
│       ├── categories.schema.json   # 类别表
│       ├── departments.schema.json  # 部门表
│       ├── suppliers.schema.json    # 供应商表
│       ├── bom_headers.schema.json  # BOM表头
│       ├── bom_items.schema.json    # BOM明细
│       ├── inbound_orders.schema.json   # 入库单
│       ├── outbound_orders.schema.json  # 出库单
│       └── stock_records.schema.json    # 库存记录
└── common/
    └── api/
        └── unicloud.js              # uniCloud 服务封装
```

---

## 🗄️ 云数据库

### 数据库表结构

项目包含以下核心数据表：

#### 1. materials（物料表）

存储所有物料信息，包括物料编码、名称、类别、单位、库存等。

**主要字段**：
- `code`: 物料编码（唯一）
- `name`: 物料名称
- `category_id`: 类别ID
- `warehouse_type`: 仓库类型（main/workshop/bom/pack/auxiliary/pending）
- `stock_quantity`: 库存数量
- `unit`: 计量单位
- `price`: 单价
- `supplier_id`: 供应商ID

#### 2. categories（类别表）

物料分类管理，支持多级分类。

**主要字段**：
- `name`: 类别名称
- `warehouse_type`: 所属仓库类型
- `parent_id`: 父类别ID
- `sort_order`: 排序顺序

#### 3. departments（部门表）

组织架构管理，包括生产部门和职能部门。

**主要字段**：
- `code`: 部门编码
- `name`: 部门名称
- `type`: 部门类型（production/technical/logistics等）
- `production_type`: 生产部门类型（batching/sheeting/winding等）

#### 4. suppliers（供应商表）

供应商信息管理。

**主要字段**：
- `code`: 供应商编码
- `name`: 供应商名称
- `contact`: 联系人
- `phone`: 联系电话
- `address`: 地址

#### 5. bom_headers（BOM表头）

BOM清单主表。

**主要字段**：
- `code`: BOM编码
- `name`: BOM名称
- `product_id`: 产品ID
- `version`: 版本号
- `quantity`: 基准数量
- `status`: 状态（draft/active/inactive）

#### 6. bom_items（BOM明细）

BOM清单明细表。

**主要字段**：
- `bom_id`: BOM ID
- `material_id`: 物料ID
- `quantity`: 用量
- `loss_rate`: 损耗率
- `actual_quantity`: 实际用量（含损耗）

#### 7. inbound_orders（入库单）

物料入库记录。

**主要字段**：
- `order_no`: 入库单号
- `warehouse_type`: 入库仓库类型
- `inbound_type`: 入库类型（purchase/production/return等）
- `items`: 入库物料明细（数组）
- `status`: 状态（draft/confirmed/cancelled）

#### 8. outbound_orders（出库单）

物料出库记录。

**主要字段**：
- `order_no`: 出库单号
- `warehouse_type`: 出库仓库类型
- `outbound_type`: 出库类型（production_issue/batch_issue等）
- `department_id`: 领用部门ID
- `items`: 出库物料明细（数组）
- `status`: 状态（draft/confirmed/cancelled）

#### 9. stock_records（库存记录）

库存变动流水，记录所有出入库操作。

**主要字段**：
- `material_id`: 物料ID
- `warehouse_type`: 仓库类型
- `record_type`: 记录类型（inbound/outbound/adjust/transfer）
- `quantity`: 变动数量
- `before_quantity`: 变动前库存
- `after_quantity`: 变动后库存
- `order_id`: 关联单据ID

### 数据库操作示例

```javascript
// 引入数据库操作模块
import { db } from '@/common/api/unicloud.js'

// 查询物料列表
const materials = await db.get('materials', {
  warehouse_type: 'main',
  status: 'active'
}, {
  page: 1,
  pageSize: 20,
  orderBy: { field: 'create_time', order: 'desc' }
})

// 添加物料
const materialId = await db.add('materials', {
  code: 'MAT001',
  name: '正极材料A',
  category_id: 'xxx',
  unit: 'kg',
  warehouse_type: 'main'
})

// 更新物料
await db.update('materials', materialId, {
  stock_quantity: 100
})

// 删除物料
await db.remove('materials', materialId)

// 统计数量
const count = await db.count('materials', {
  warehouse_type: 'main'
})
```

---

## ☁️ 云函数

### 云函数列表

#### 1. material-service（物料服务）

提供物料的增删改查、搜索、导入导出等功能。

**支持的操作**：
- `list`: 获取物料列表
- `detail`: 获取物料详情
- `create`: 创建物料
- `update`: 更新物料
- `delete`: 删除物料
- `search`: 搜索物料
- `import`: 批量导入物料
- `export`: 导出物料
- `updateStock`: 更新库存

#### 2. warehouse-service（仓库服务）

提供出入库、库存查询、库存记录等功能。

**支持的操作**：
- `createInbound`: 创建入库单
- `confirmInbound`: 确认入库
- `createOutbound`: 创建出库单
- `confirmOutbound`: 确认出库
- `getStockRecords`: 获取库存记录
- `getWarehouseStats`: 获取仓库统计
- `calculateWorkshopStock`: 计算车间仓数量

#### 3. bom-service（BOM服务）

提供BOM的增删改查、按BOM发料等功能。

**支持的操作**：
- `list`: 获取BOM列表
- `detail`: 获取BOM详情
- `create`: 创建BOM
- `update`: 更新BOM
- `delete`: 删除BOM
- `issueMaterials`: 按BOM发料
- `import`: 批量导入BOM
- `export`: 导出BOM

### 云函数开发规范

所有云函数遵循统一的请求/响应格式：

**请求格式**：
```javascript
{
  action: 'list',      // 操作类型
  data: {              // 请求数据
    page: 1,
    pageSize: 20
  }
}
```

**响应格式**：
```javascript
{
  code: 200,           // 状态码：200-成功，400-参数错误，500-服务器错误
  message: 'success',  // 消息
  data: {}             // 返回数据
}
```

---

## 🔌 前端调用

### 引入服务模块

```javascript
import {
  materialService,
  warehouseService,
  bomService,
  db,
  storage
} from '@/common/api/unicloud.js'
```

### 物料服务调用示例

```javascript
// 获取物料列表
const result = await materialService.list({
  warehouse_type: 'main',
  category_id: 'xxx',
  page: 1,
  pageSize: 20
})
console.log(result.list)  // 物料列表
console.log(result.total) // 总数

// 搜索物料
const searchResult = await materialService.search({
  keyword: '正极',
  warehouse_type: 'main'
})

// 创建物料
await materialService.create({
  code: 'MAT001',
  name: '正极材料A',
  category_id: 'xxx',
  unit: 'kg',
  warehouse_type: 'main',
  price: 100
})

// 更新物料
await materialService.update('material_id', {
  name: '正极材料A（新）',
  price: 120
})

// 删除物料
await materialService.delete('material_id')

// 批量导入物料
const importResult = await materialService.import([
  { code: 'MAT001', name: '物料1', unit: 'kg' },
  { code: 'MAT002', name: '物料2', unit: 'g' }
], 'main')
console.log(`成功: ${importResult.success}, 失败: ${importResult.fail}`)

// 导出物料
const exportResult = await materialService.export({
  warehouse_type: 'main'
})
console.log(exportResult.list)
```

### 仓库服务调用示例

```javascript
// 创建入库单
const inboundResult = await warehouseService.createInbound({
  warehouse_type: 'main',
  inbound_type: 'purchase',
  supplier_id: 'xxx',
  items: [
    {
      material_id: 'xxx',
      material_code: 'MAT001',
      material_name: '正极材料A',
      quantity: 100,
      unit: 'kg',
      price: 100
    }
  ],
  operator: '张三',
  operator_id: 'user_id'
})
console.log(inboundResult.order_no)  // 入库单号

// 确认入库
await warehouseService.confirmInbound(inboundResult.id)

// 创建出库单
const outboundResult = await warehouseService.createOutbound({
  warehouse_type: 'main',
  outbound_type: 'production_issue',
  department_id: 'dept_id',
  items: [
    {
      material_id: 'xxx',
      material_code: 'MAT001',
      material_name: '正极材料A',
      quantity: 50,
      unit: 'kg',
      price: 100
    }
  ],
  operator: '李四',
  operator_id: 'user_id',
  receiver: '王五',
  receiver_id: 'receiver_id'
})

// 确认出库
await warehouseService.confirmOutbound(outboundResult.id)

// 获取库存记录
const records = await warehouseService.getStockRecords({
  warehouse_type: 'main',
  material_id: 'xxx',
  page: 1,
  pageSize: 20
})

// 获取仓库统计
const stats = await warehouseService.getWarehouseStats('main')
console.log(`物料数: ${stats.material_count}`)
console.log(`总库存: ${stats.total_quantity}`)
console.log(`总价值: ${stats.total_value}`)

// 计算车间仓数量
const workshopStock = await warehouseService.calculateWorkshopStock('material_id')
console.log(`车间仓数量: ${workshopStock.workshop_quantity}`)
```

### BOM服务调用示例

```javascript
// 创建BOM
const bomResult = await bomService.create({
  code: 'BOM001',
  name: '电芯A BOM',
  product_id: 'product_id',
  version: '1.0',
  quantity: 1,
  unit: '个',
  items: [
    {
      material_id: 'material_id_1',
      quantity: 10,
      unit: 'kg',
      loss_rate: 5
    },
    {
      material_id: 'material_id_2',
      quantity: 5,
      unit: 'kg',
      loss_rate: 3
    }
  ]
})

// 获取BOM详情
const bomDetail = await bomService.detail('bom_id')
console.log(bomDetail.items)  // BOM明细

// 按BOM发料
const issueResult = await bomService.issueMaterials({
  bom_id: 'bom_id',
  department_id: 'dept_id',
  quantity: 100,  // 生产数量
  operator: '张三',
  operator_id: 'user_id'
})
console.log(`出库单号: ${issueResult.order_no}`)
```

---

## 📦 云存储

### 上传文件

```javascript
import { storage } from '@/common/api/unicloud.js'

// 选择文件
uni.chooseImage({
  count: 1,
  success: async (res) => {
    const tempFilePath = res.tempFilePaths[0]
    
    // 上传到云存储
    const result = await storage.uploadFile(
      tempFilePath,
      `materials/${Date.now()}.jpg`,
      {
        onProgress: (percent) => {
          console.log(`上传进度: ${percent}%`)
        }
      }
    )
    
    console.log('文件ID:', result.fileID)
    console.log('临时URL:', result.tempFileURL)
  }
})
```

### 删除文件

```javascript
await storage.deleteFile(['fileID1', 'fileID2'])
```

### 获取临时URL

```javascript
const urls = await storage.getTempFileURL(['fileID1', 'fileID2'])
console.log(urls)
```

---

## 🚀 部署指南

### 1. 创建 uniCloud 服务空间

1. 登录 [DCloud 开发者中心](https://dev.dcloud.net.cn/)
2. 进入 uniCloud 控制台
3. 创建新的服务空间，选择**阿里云**
4. 记录服务空间的 SpaceID

### 2. 关联服务空间

在 HBuilderX 中：

1. 右键点击项目根目录
2. 选择"创建 uniCloud 云开发环境"
3. 选择"使用已有服务空间"
4. 选择刚才创建的服务空间

### 3. 初始化数据库

1. 在 HBuilderX 中打开 `uniCloud-aliyun/database/` 目录
2. 右键点击每个 `.schema.json` 文件
3. 选择"上传 DB Schema"
4. 等待上传完成

### 4. 上传云函数

1. 右键点击 `uniCloud-aliyun/cloudfunctions/` 下的云函数目录
2. 选择"上传部署"
3. 等待部署完成

### 5. 配置云函数权限

在 uniCloud Web 控制台中：

1. 进入"云函数"管理
2. 为每个云函数配置访问权限
3. 建议开发阶段设置为"允许所有人访问"
4. 生产环境根据需要配置权限

### 6. 测试云函数

在 HBuilderX 中：

1. 右键点击云函数目录
2. 选择"运行-本地云函数"
3. 在弹出的窗口中输入测试参数
4. 查看运行结果

---

## ❓ 常见问题

### 1. 云函数调用失败

**问题**：调用云函数时提示"云函数不存在"或"权限不足"

**解决方案**：
- 检查云函数是否已上传部署
- 检查云函数名称是否正确
- 检查云函数权限配置
- 查看云函数日志排查错误

### 2. 数据库操作失败

**问题**：数据库操作时提示"表不存在"或"字段不存在"

**解决方案**：
- 检查 DB Schema 是否已上传
- 检查表名和字段名是否正确
- 查看数据库日志排查错误

### 3. 文件上传失败

**问题**：上传文件时提示"上传失败"或"权限不足"

**解决方案**：
- 检查云存储是否已开通
- 检查文件大小是否超过限制
- 检查云存储权限配置

### 4. 本地调试云函数

**方法1**：使用 HBuilderX 本地运行

1. 右键点击云函数
2. 选择"运行-本地云函数"
3. 输入测试参数

**方法2**：使用云端运行

1. 右键点击云函数
2. 选择"运行-云端云函数"
3. 输入测试参数

### 5. 查看云函数日志

在 uniCloud Web 控制台中：

1. 进入"云函数"管理
2. 点击云函数名称
3. 选择"日志"标签
4. 查看最近的调用日志和错误信息

---

## 📚 参考资料

- [uniCloud 官方文档](https://uniapp.dcloud.net.cn/uniCloud/)
- [uniCloud 云数据库](https://uniapp.dcloud.net.cn/uniCloud/cf-database.html)
- [uniCloud 云函数](https://uniapp.dcloud.net.cn/uniCloud/cf-functions.html)
- [uniCloud 云存储](https://uniapp.dcloud.net.cn/uniCloud/storage.html)

---

**最后更新**: 2025-11-27
