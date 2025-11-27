# API 接口文档

本文档描述 woerp 材料管理系统的后端 API 接口规范。

---

## 📋 目录

- [接口规范](#接口规范)
- [认证授权](#认证授权)
- [用户管理](#用户管理)
- [物料管理](#物料管理)
- [仓库管理](#仓库管理)
- [出入库管理](#出入库管理)
- [BOM管理](#bom管理)
- [报表查询](#报表查询)
- [错误码说明](#错误码说明)

---

## 🔧 接口规范

### 基础信息

- **Base URL**: `https://api.yourdomain.com/api/v1`
- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8

### 请求格式

#### 请求头 (Headers)

```http
Content-Type: application/json
Authorization: Bearer {access_token}
Accept: application/json
```

#### 请求示例

```http
POST /api/v1/auth/login HTTP/1.1
Host: api.yourdomain.com
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}
```

### 响应格式

#### 成功响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 响应数据
  },
  "timestamp": 1700000000000
}
```

#### 错误响应

```json
{
  "code": 400,
  "message": "参数错误",
  "error": "username is required",
  "timestamp": 1700000000000
}
```

### 分页参数

```json
{
  "page": 1,        // 页码，从1开始
  "page_size": 20,  // 每页数量，默认20
  "total": 100,     // 总记录数
  "pages": 5        // 总页数
}
```

---

## 🔐 认证授权

### 1. 用户登录

**接口**: `POST /auth/login`

**描述**: 用户登录获取访问令牌

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | String | 是 | 用户名 |
| password | String | 是 | 密码 |

**请求示例**:

```json
{
  "username": "admin",
  "password": "123456"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 7200,
    "user": {
      "id": 1,
      "username": "admin",
      "name": "管理员",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
}
```

### 2. 刷新令牌

**接口**: `POST /auth/refresh`

**描述**: 刷新访问令牌

**请求头**:

```
Authorization: Bearer {access_token}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "刷新成功",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 7200
  }
}
```

### 3. 退出登录

**接口**: `POST /auth/logout`

**描述**: 用户退出登录

**请求头**:

```
Authorization: Bearer {access_token}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "退出成功"
}
```

---

## 👤 用户管理

### 1. 获取当前用户信息

**接口**: `GET /users/me`

**描述**: 获取当前登录用户的详细信息

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "username": "admin",
    "name": "管理员",
    "phone": "13800138000",
    "email": "admin@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "created_at": "2024-01-01 00:00:00"
  }
}
```

### 2. 更新用户信息

**接口**: `PUT /users/me`

**描述**: 更新当前用户信息

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | String | 否 | 姓名 |
| phone | String | 否 | 手机号 |
| email | String | 否 | 邮箱 |
| avatar | String | 否 | 头像URL |

---

## 📦 物料管理

### 1. 获取物料列表

**接口**: `GET /materials`

**描述**: 获取物料列表（支持分页和筛选）

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认1 |
| page_size | Integer | 否 | 每页数量，默认20 |
| category_id | Integer | 否 | 类别ID |
| warehouse_type | String | 否 | 仓库类型：main/workshop/bom/pack/auxiliary |
| keyword | String | 否 | 搜索关键词（物料名称/编码） |

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "code": "MAT001",
        "name": "正极材料A",
        "category_id": 1,
        "category_name": "正极材料",
        "unit": "kg",
        "spec": "规格说明",
        "stock_quantity": 1000.5,
        "warehouse_type": "main",
        "supplier_id": 1,
        "supplier_name": "供应商A",
        "price": 100.00,
        "created_at": "2024-01-01 00:00:00",
        "updated_at": "2024-01-01 00:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### 2. 获取物料详情

**接口**: `GET /materials/{id}`

**描述**: 获取指定物料的详细信息

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Integer | 是 | 物料ID |

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "code": "MAT001",
    "name": "正极材料A",
    "category_id": 1,
    "category_name": "正极材料",
    "unit": "kg",
    "spec": "规格说明",
    "stock_quantity": 1000.5,
    "warehouse_type": "main",
    "supplier_id": 1,
    "supplier_name": "供应商A",
    "price": 100.00,
    "min_stock": 100,
    "max_stock": 5000,
    "description": "物料描述",
    "created_at": "2024-01-01 00:00:00",
    "updated_at": "2024-01-01 00:00:00"
  }
}
```

### 3. 创建物料

**接口**: `POST /materials`

**描述**: 创建新物料

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | String | 是 | 物料编码 |
| name | String | 是 | 物料名称 |
| category_id | Integer | 是 | 类别ID |
| unit | String | 是 | 单位 |
| spec | String | 否 | 规格 |
| warehouse_type | String | 是 | 仓库类型 |
| supplier_id | Integer | 否 | 供应商ID |
| price | Decimal | 否 | 单价 |
| min_stock | Decimal | 否 | 最小库存 |
| max_stock | Decimal | 否 | 最大库存 |
| description | String | 否 | 描述 |

**请求示例**:

```json
{
  "code": "MAT002",
  "name": "负极材料B",
  "category_id": 2,
  "unit": "kg",
  "spec": "规格说明",
  "warehouse_type": "main",
  "supplier_id": 1,
  "price": 80.00,
  "min_stock": 50,
  "max_stock": 3000
}
```

### 4. 更新物料

**接口**: `PUT /materials/{id}`

**描述**: 更新物料信息

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Integer | 是 | 物料ID |

**请求参数**: 同创建物料（所有字段可选）

### 5. 删除物料

**接口**: `DELETE /materials/{id}`

**描述**: 删除物料

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Integer | 是 | 物料ID |

---

## 🏢 仓库管理

### 1. 获取仓库列表

**接口**: `GET /warehouses`

**描述**: 获取所有仓库信息

**响应示例**:

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "type": "main",
      "name": "主材仓",
      "description": "主要原材料仓库",
      "capacity": 10000,
      "used_capacity": 5000,
      "status": "active"
    },
    {
      "id": 2,
      "type": "workshop",
      "name": "车间仓",
      "description": "生产车间仓库",
      "capacity": 5000,
      "used_capacity": 2000,
      "status": "active"
    }
  ]
}
```

### 2. 获取仓库库存统计

**接口**: `GET /warehouses/{type}/stats`

**描述**: 获取指定仓库的库存统计信息

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | String | 是 | 仓库类型：main/workshop/bom/pack/auxiliary |

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "warehouse_type": "main",
    "total_materials": 150,
    "total_categories": 10,
    "total_quantity": 50000.5,
    "total_value": 5000000.00,
    "low_stock_count": 5,
    "out_of_stock_count": 2
  }
}
```

---

## 📤 出入库管理

### 1. 创建出库单

**接口**: `POST /outbound/orders`

**描述**: 创建出库单

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | String | 是 | 出库类型（见出库类型枚举） |
| department_id | Integer | 是 | 部门ID |
| items | Array | 是 | 出库明细 |
| remark | String | 否 | 备注 |

**items 结构**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| material_id | Integer | 是 | 物料ID |
| quantity | Decimal | 是 | 数量 |
| batch_no | String | 否 | 批次号 |

**请求示例**:

```json
{
  "type": "issue_production",
  "department_id": 1,
  "items": [
    {
      "material_id": 1,
      "quantity": 100.5,
      "batch_no": "BATCH001"
    },
    {
      "material_id": 2,
      "quantity": 50.0
    }
  ],
  "remark": "生产领料"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "出库单创建成功",
  "data": {
    "id": 1001,
    "order_no": "OUT202411270001",
    "type": "issue_production",
    "status": "pending",
    "created_at": "2024-11-27 10:00:00"
  }
}
```

### 2. 创建入库单

**接口**: `POST /inbound/orders`

**描述**: 创建入库单

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | String | 是 | 入库类型：purchase/return/other |
| supplier_id | Integer | 否 | 供应商ID（采购入库时必填） |
| items | Array | 是 | 入库明细 |
| remark | String | 否 | 备注 |

**items 结构**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| material_id | Integer | 是 | 物料ID |
| quantity | Decimal | 是 | 数量 |
| batch_no | String | 否 | 批次号 |
| price | Decimal | 否 | 单价 |

**请求示例**:

```json
{
  "type": "purchase",
  "supplier_id": 1,
  "items": [
    {
      "material_id": 1,
      "quantity": 500.0,
      "batch_no": "BATCH002",
      "price": 100.00
    }
  ],
  "remark": "采购入库"
}
```

### 3. 获取出入库记录

**接口**: `GET /records`

**描述**: 获取出入库记录（支持筛选）

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码 |
| page_size | Integer | 否 | 每页数量 |
| type | String | 否 | 类型：inbound/outbound |
| start_date | String | 否 | 开始日期 YYYY-MM-DD |
| end_date | String | 否 | 结束日期 YYYY-MM-DD |
| material_id | Integer | 否 | 物料ID |
| department_id | Integer | 否 | 部门ID |

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "order_no": "OUT202411270001",
        "type": "outbound",
        "outbound_type": "issue_production",
        "outbound_type_name": "生产领料",
        "department_id": 1,
        "department_name": "配料部",
        "material_id": 1,
        "material_code": "MAT001",
        "material_name": "正极材料A",
        "quantity": 100.5,
        "unit": "kg",
        "operator": "张三",
        "created_at": "2024-11-27 10:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### 4. 出库类型枚举

| 值 | 说明 |
|----|------|
| purchase_return | 采购退货 |
| line_return | 产线退仓 |
| issue_production | 生产领料 |
| batch_out | 批次出库 |
| over_issue | 超领出库 |
| replenish | 补料出库 |
| prep_issue | 制料领料 |
| aux_out | 辅料出库 |

---

## 📋 BOM管理

### 1. 获取BOM列表

**接口**: `GET /bom`

**描述**: 获取BOM清单列表

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码 |
| page_size | Integer | 否 | 每页数量 |
| product_code | String | 否 | 产品编码 |

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "bom_no": "BOM001",
        "product_code": "PROD001",
        "product_name": "电芯A型",
        "version": "V1.0",
        "status": "active",
        "created_at": "2024-01-01 00:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

### 2. 获取BOM详情

**接口**: `GET /bom/{id}`

**描述**: 获取BOM清单详情（包含物料明细）

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Integer | 是 | BOM ID |

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "bom_no": "BOM001",
    "product_code": "PROD001",
    "product_name": "电芯A型",
    "version": "V1.0",
    "status": "active",
    "items": [
      {
        "id": 1,
        "material_id": 1,
        "material_code": "MAT001",
        "material_name": "正极材料A",
        "quantity": 10.5,
        "unit": "kg",
        "loss_rate": 0.02
      },
      {
        "id": 2,
        "material_id": 2,
        "material_code": "MAT002",
        "material_name": "负极材料B",
        "quantity": 8.0,
        "unit": "kg",
        "loss_rate": 0.01
      }
    ],
    "created_at": "2024-01-01 00:00:00",
    "updated_at": "2024-01-01 00:00:00"
  }
}
```

### 3. 按BOM批量发料

**接口**: `POST /bom/{id}/issue`

**描述**: 根据BOM清单批量发料到指定部门

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Integer | 是 | BOM ID |

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| department_id | Integer | 是 | 部门ID |
| quantity | Integer | 是 | 生产数量 |
| remark | String | 否 | 备注 |

**请求示例**:

```json
{
  "department_id": 1,
  "quantity": 100,
  "remark": "按BOM批量发料"
}
```

---

## 📊 报表查询

### 1. 库存报表

**接口**: `GET /reports/stock`

**描述**: 获取库存报表

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| warehouse_type | String | 否 | 仓库类型 |
| category_id | Integer | 否 | 类别ID |

**响应示例**:

```json
{
  "code": 200,
  "data": [
    {
      "material_code": "MAT001",
      "material_name": "正极材料A",
      "category_name": "正极材料",
      "unit": "kg",
      "stock_quantity": 1000.5,
      "stock_value": 100050.00,
      "warehouse_type": "main"
    }
  ]
}
```

### 2. 出入库统计

**接口**: `GET /reports/transactions`

**描述**: 获取出入库统计报表

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| start_date | String | 是 | 开始日期 |
| end_date | String | 是 | 结束日期 |
| type | String | 否 | 类型：inbound/outbound |

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "summary": {
      "inbound_count": 50,
      "inbound_quantity": 5000.0,
      "outbound_count": 80,
      "outbound_quantity": 3000.0
    },
    "details": [
      {
        "date": "2024-11-27",
        "inbound_count": 5,
        "inbound_quantity": 500.0,
        "outbound_count": 8,
        "outbound_quantity": 300.0
      }
    ]
  }
}
```

---

## ❌ 错误码说明

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（未登录或令牌过期） |
| 403 | 禁止访问（无权限） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 业务错误码

| 错误码 | 说明 |
|--------|------|
| 1001 | 用户名或密码错误 |
| 1002 | 令牌已过期 |
| 1003 | 令牌无效 |
| 2001 | 物料不存在 |
| 2002 | 物料编码已存在 |
| 2003 | 库存不足 |
| 3001 | 仓库不存在 |
| 4001 | 出库单不存在 |
| 4002 | 入库单不存在 |
| 5001 | BOM不存在 |
| 5002 | BOM版本冲突 |

---

## 📝 更新日志

### v1.0.0 (2024-11-27)

- 初始版本
- 定义基础接口规范
- 实现用户认证、物料管理、出入库管理等核心接口

---

**最后更新**: 2025-11-27
