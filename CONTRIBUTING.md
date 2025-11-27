# 贡献指南 (Contributing Guide)

感谢您考虑为 woerp 项目做出贡献！本文档提供了参与项目开发的指南。

---

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [问题反馈](#问题反馈)

---

## 🤝 行为准则

参与本项目即表示您同意遵守我们的行为准则。我们致力于为所有人提供友好、安全和包容的环境。

**我们期望的行为**：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

**不可接受的行为**：

- 使用性化的语言或图像
- 人身攻击或政治攻击
- 公开或私下骚扰
- 未经许可发布他人的私人信息
- 其他在专业环境中被认为不适当的行为

---

## 💡 如何贡献

您可以通过以下方式为项目做出贡献：

### 报告 Bug

发现 Bug 时，请在 [GitHub Issues](https://github.com/964896765/woerp/issues) 中创建问题报告，并包含以下信息：

- **清晰的标题**：简洁描述问题
- **详细描述**：说明问题的具体表现
- **复现步骤**：列出重现问题的具体步骤
- **预期行为**：说明您期望的正确行为
- **实际行为**：说明实际发生的情况
- **环境信息**：操作系统、浏览器版本、设备型号等
- **截图或日志**：如有可能，提供相关截图或错误日志

### 建议新功能

如果您有新功能的想法，请：

1. 在 Issues 中搜索是否已有类似建议
2. 如果没有，创建新的 Feature Request
3. 详细描述功能需求和使用场景
4. 说明该功能如何改善用户体验

### 改进文档

文档改进同样重要：

- 修正文档中的错误或不准确之处
- 添加缺失的使用说明
- 改进示例代码
- 翻译文档到其他语言

### 贡献代码

欢迎提交代码贡献！请遵循下面的开发流程和代码规范。

---

## 🔄 开发流程

### 1. Fork 项目

在 GitHub 上 Fork 本项目到您的账户。

### 2. 克隆仓库

```bash
git clone https://github.com/YOUR_USERNAME/woerp.git
cd woerp
```

### 3. 添加上游仓库

```bash
git remote add upstream https://github.com/964896765/woerp.git
```

### 4. 创建分支

从 `develop` 分支创建您的功能分支：

```bash
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

分支命名规范：

- `feature/xxx`：新功能
- `bugfix/xxx`：Bug 修复
- `docs/xxx`：文档更新
- `refactor/xxx`：代码重构
- `test/xxx`：测试相关

### 5. 开发功能

在您的分支上进行开发，确保：

- 代码符合项目规范
- 添加必要的注释
- 编写或更新相关测试
- 更新相关文档

### 6. 提交更改

```bash
git add .
git commit -m "feat(module): add new feature"
```

请遵循[提交规范](#提交规范)。

### 7. 保持同步

定期同步上游仓库的更新：

```bash
git fetch upstream
git rebase upstream/develop
```

### 8. 推送分支

```bash
git push origin feature/your-feature-name
```

### 9. 创建 Pull Request

在 GitHub 上创建 Pull Request，详见 [Pull Request 流程](#pull-request-流程)。

---

## 📝 代码规范

### JavaScript/Vue 规范

遵循项目的 ESLint 配置：

```bash
# 检查代码规范
npm run lint

# 自动修复部分问题
npm run lint:fix
```

**关键规范**：

- 使用 2 空格缩进
- 使用单引号
- 语句末尾不加分号
- 使用 ES6+ 语法
- 避免使用 `var`，使用 `const` 和 `let`
- 组件名使用 PascalCase
- 变量名使用 camelCase
- 常量名使用 UPPER_SNAKE_CASE

### Vue 组件规范

**组件文件结构**：

```vue
<template>
  <!-- 模板 -->
</template>

<script>
// 脚本
export default {
  name: 'ComponentName',
  // ...
}
</script>

<style lang="scss" scoped>
/* 样式 */
</style>
```

**组件选项顺序**：

1. name
2. components
3. props
4. data
5. computed
6. watch
7. 生命周期钩子
8. methods

### CSS/SCSS 规范

- 使用 BEM 命名规范
- 使用 SCSS 变量和 mixin
- 避免使用 `!important`
- 合理使用嵌套（不超过 3 层）

### 注释规范

**函数注释**：

```javascript
/**
 * 计算物料总价
 * @param {Number} quantity - 数量
 * @param {Number} price - 单价
 * @returns {Number} 总价
 */
function calculateTotal(quantity, price) {
  return quantity * price
}
```

**复杂逻辑注释**：

```javascript
// 计算车间仓物料数量
// 公式：主材仓出库数量 - BOM所需数量
const workshopQuantity = mainWarehouseOut - bomRequired
```

---

## 📋 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 提交格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | Bug 修复 |
| docs | 文档更新 |
| style | 代码格式（不影响代码运行） |
| refactor | 重构（既不是新增功能，也不是修复bug） |
| perf | 性能优化 |
| test | 测试相关 |
| build | 构建系统或外部依赖变更 |
| ci | CI 配置文件和脚本变更 |
| chore | 其他不修改 src 或测试文件的变更 |
| revert | 回滚之前的提交 |

### Scope 范围

指明提交影响的范围，例如：

- `material`：物料管理
- `checkout`：出入库结算
- `records`：记录查询
- `login`：登录
- `api`：API 接口
- `docs`：文档

### Subject 主题

- 使用祈使句，现在时态："add" 而不是 "added" 或 "adds"
- 首字母小写
- 结尾不加句号
- 简洁明了，不超过 50 个字符

### Body 正文（可选）

- 详细描述提交的内容
- 解释为什么做这个变更
- 说明变更的影响

### Footer 页脚（可选）

- 关联的 Issue：`Closes #123`
- 破坏性变更：`BREAKING CHANGE: ...`

### 提交示例

**简单提交**：

```
feat(material): 添加物料搜索功能
```

**完整提交**：

```
feat(checkout): 添加批量出库功能

支持一次性选择多个物料进行出库操作，
提高出库效率，减少重复操作。

功能包括：
- 批量选择物料
- 统一设置出库数量
- 一键提交出库单

Closes #45
```

**破坏性变更**：

```
refactor(api)!: 重构 API 请求模块

BREAKING CHANGE: API 请求方法的参数格式发生变化，
需要更新所有调用 API 的代码。

旧格式：api.get(url, params)
新格式：api.get({ url, params })
```

---

## 🔀 Pull Request 流程

### 创建 PR

1. 在 GitHub 上点击 "New Pull Request"
2. 选择 base 分支为 `develop`，compare 分支为您的功能分支
3. 填写 PR 标题和描述

### PR 标题

遵循提交规范，例如：

```
feat(material): 添加物料导出功能
```

### PR 描述模板

```markdown
## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化
- [ ] 其他

## 变更说明
<!-- 详细描述本次变更的内容 -->

## 相关 Issue
<!-- 关联的 Issue 编号，例如：Closes #123 -->

## 测试情况
<!-- 说明如何测试本次变更 -->
- [ ] 本地测试通过
- [ ] H5 端测试通过
- [ ] 小程序端测试通过
- [ ] App 端测试通过

## 截图/录屏
<!-- 如有 UI 变更，请提供截图或录屏 -->

## 检查清单
- [ ] 代码符合项目规范
- [ ] 已添加必要的注释
- [ ] 已更新相关文档
- [ ] 已添加或更新测试
- [ ] 所有测试通过
- [ ] 无新的 lint 警告
```

### 代码审查

PR 提交后，项目维护者会进行代码审查：

- 检查代码质量和规范
- 验证功能实现
- 提出改进建议

请及时响应审查意见，并根据反馈进行修改。

### 合并条件

PR 需要满足以下条件才能合并：

- 通过所有自动化测试
- 至少一位维护者批准
- 解决所有审查意见
- 无冲突

---

## 🐛 问题反馈

### 提交 Issue

在提交 Issue 前，请：

1. 搜索现有 Issue，避免重复
2. 使用清晰的标题
3. 提供详细的描述
4. 添加相关标签

### Issue 模板

**Bug 报告**：

```markdown
## Bug 描述
<!-- 简洁描述 Bug -->

## 复现步骤
1. 进入 xxx 页面
2. 点击 xxx 按钮
3. 输入 xxx
4. 看到错误

## 预期行为
<!-- 描述您期望的正确行为 -->

## 实际行为
<!-- 描述实际发生的情况 -->

## 环境信息
- 设备：<!-- 例如：iPhone 12 -->
- 操作系统：<!-- 例如：iOS 15.0 -->
- 浏览器：<!-- 例如：Safari 15.0 -->
- 应用版本：<!-- 例如：3.1.23 -->

## 截图/日志
<!-- 如有可能，提供截图或错误日志 -->
```

**功能请求**：

```markdown
## 功能描述
<!-- 简洁描述您希望添加的功能 -->

## 使用场景
<!-- 描述该功能的使用场景 -->

## 期望实现
<!-- 描述您期望的实现方式 -->

## 替代方案
<!-- 如有其他实现方案，请说明 -->

## 附加信息
<!-- 其他相关信息 -->
```

---

## 📞 联系方式

如有任何问题，欢迎通过以下方式联系：

- **GitHub Issues**: https://github.com/964896765/woerp/issues
- **GitHub Discussions**: https://github.com/964896765/woerp/discussions

---

## 🙏 致谢

感谢所有为本项目做出贡献的开发者！

您的每一个贡献都让项目变得更好。

---

**最后更新**: 2025-11-27
