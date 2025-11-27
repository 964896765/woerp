# 更新日志 (Changelog)

本文档记录 woerp 项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [Unreleased]

### 计划添加
- [ ] 用户认证系统
- [ ] 权限管理模块
- [ ] Excel导入导出功能
- [ ] 打印功能（凭证打印）
- [ ] 企业微信群通知功能
- [ ] 数据统计分析
- [ ] 报表中心
- [ ] 库存预警功能
- [ ] 离线支持
- [ ] 单元测试框架
- [ ] CI/CD 自动化部署

### 计划改进
- [ ] 优化页面加载性能
- [ ] 增强错误提示体验
- [ ] 完善代码注释
- [ ] 添加更多单元测试
- [ ] 性能优化

---

## [0.2.0] - 2025-11-27

### 新增
- ✨ 完整的 uniCloud 云开发支持
- ✨ 9个核心数据库表结构设计
  - materials（物料表）
  - categories（类别表）
  - departments（部门表）
  - suppliers（供应商表）
  - bom_headers（BOM表头）
  - bom_items（BOM明细）
  - inbound_orders（入库单）
  - outbound_orders（出库单）
  - stock_records（库存记录）
- ✨ 3个云函数服务
  - material-service（物料管理服务）
  - warehouse-service（仓库管理服务）
  - bom-service（BOM管理服务）
- ✨ 前端数据交互封装模块（common/api/unicloud.js）
- ✨ 云存储功能配置
- ✨ uniCloud 使用指南文档（UNICLOUD.md）
- ✨ 公共工具函数库（common/utils/index.js，25+函数）

### 变更
- 🔧 将后端架构从自建API改为uniCloud
- 🔧 优化数据交互方式

### 文档
- 📝 完整的项目文档（README.md）
- 📝 开发指南文档（DEVELOPMENT.md）
- 📝 API接口文档（API.md）
- 📝 更新日志（CHANGELOG.md）
- 📝 贡献指南（CONTRIBUTING.md）
- 📝 环境配置示例（.env.example）

### 配置
- 🔧 Git忽略配置（.gitignore）
- 🔧 编辑器配置（.editorconfig）
- 🔧 修正 manifest.json 中的项目描述
- 🔧 完善 package.json 依赖配置

---

## [0.1.0] - 2024-XX-XX

### 新增
- ✨ 完整的项目文档（README.md）
- ✨ 开发指南文档（DEVELOPMENT.md）
- ✨ API接口文档（API.md）
- ✨ 更新日志（CHANGELOG.md）
- ✨ 环境配置示例（.env.example）
- ✨ Git忽略配置（.gitignore）
- ✨ 编辑器配置（.editorconfig）

### 修改
- 🔧 修正 manifest.json 中的项目描述
- 🔧 完善 package.json 依赖配置
- 📝 更新项目元信息

### 优化
- ⚡ 优化项目结构说明
- 📚 完善开发规范文档
- 🎨 统一代码风格配置

---

## [3.1.0] - 2024-XX-XX

### 新增
- ✨ 多仓库管理功能
  - 主材仓
  - 车间仓
  - BOM仓
  - PACK仓
  - 辅料仓
  - 待处理仓
- ✨ 出入库结算功能
- ✨ 出入库记录查询
- ✨ 物料搜索功能
- ✨ 自定义数字键盘组件
- ✨ 部门选择器组件
- ✨ 类别选择器组件
- ✨ 出库类型选择器组件

### 功能特性
- 🎯 支持左右滑动切换仓库
- 🎯 头部吸顶效果
- 🎯 手势轴向锁定（避免横纵滑动冲突）
- 🎯 安全区适配
- 🎯 自定义导航栏

### 出库类型
- 采购退货
- 产线退仓
- 生产领料
- 批次出库
- 超领出库
- 补料出库
- 制料领料
- 辅料出库

---

## [3.0.0] - 2024-XX-XX

### 新增
- 🎉 项目初始化
- 🎉 基础框架搭建
- 🎉 用户登录功能
- 🎉 基础UI组件

---

## 版本说明

### 版本号格式

版本号格式：`主版本号.次版本号.修订号`

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

### 变更类型

- `新增` (Added): 新功能
- `修改` (Changed): 现有功能的变更
- `弃用` (Deprecated): 即将移除的功能
- `移除` (Removed): 已移除的功能
- `修复` (Fixed): Bug 修复
- `安全` (Security): 安全相关的修复

### 图标说明

- ✨ 新功能
- 🐛 Bug 修复
- 🔧 配置修改
- 📝 文档更新
- 🎨 样式调整
- ⚡ 性能优化
- 🔒 安全修复
- 🎯 功能增强
- 📚 文档完善
- 🚀 部署相关

---

## 贡献指南

在提交 Pull Request 时，请：

1. 在对应版本下添加变更说明
2. 使用正确的变更类型标签
3. 简洁清晰地描述变更内容
4. 如有相关 Issue，请附上 Issue 编号

---

**最后更新**: 2025-11-27
