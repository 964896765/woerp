# 开发文档 (Development Guide)

本文档为 woerp 项目的开发指南，包含开发环境配置、代码规范、开发流程等详细说明。

---

## 📋 目录

- [开发环境配置](#开发环境配置)
- [项目架构](#项目架构)
- [代码规范](#代码规范)
- [开发流程](#开发流程)
- [调试指南](#调试指南)
- [常见问题](#常见问题)

---

## 🔧 开发环境配置

### 必需工具

1. **Node.js** (>= 12.0.0)
   - 下载地址：https://nodejs.org/
   - 推荐使用 LTS 版本

2. **HBuilderX**
   - 下载地址：https://www.dcloud.io/hbuilderx.html
   - 推荐使用最新正式版

3. **微信开发者工具**（开发小程序时需要）
   - 下载地址：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

4. **Git**
   - 下载地址：https://git-scm.com/

### 可选工具

- **Yarn**: 更快的包管理工具
- **VS Code**: 代码编辑器（配合 UniApp 插件）
- **Postman**: API 测试工具

### 环境配置步骤

1. **安装 Node.js 和 Yarn**

```bash
# 验证 Node.js 安装
node -v

# 安装 Yarn（可选）
npm install -g yarn

# 验证 Yarn 安装
yarn -v
```

2. **克隆项目**

```bash
git clone https://github.com/964896765/woerp.git
cd woerp
```

3. **安装依赖**

```bash
yarn install
# 或
npm install
```

4. **配置 HBuilderX**

- 打开 HBuilderX
- 文件 -> 导入 -> 从本地目录导入
- 选择项目目录

5. **配置微信开发者工具**

- 打开微信开发者工具
- 设置 -> 安全设置 -> 开启服务端口

---

## 🏗️ 项目架构

### 技术架构

```
┌─────────────────────────────────────┐
│         UniApp Framework            │
│  (Vue2 + 跨平台编译)                 │
├─────────────────────────────────────┤
│  Presentation Layer (表现层)         │
│  - Pages (页面)                      │
│  - Components (组件)                 │
│  - Styles (样式)                     │
├─────────────────────────────────────┤
│  Business Logic Layer (业务逻辑层)   │
│  - Store (状态管理)                  │
│  - Mixins (混入)                     │
│  - Utils (工具函数)                  │
├─────────────────────────────────────┤
│  Data Layer (数据层)                 │
│  - API (接口调用)                    │
│  - Models (数据模型)                 │
│  - Storage (本地存储)                │
└─────────────────────────────────────┘
```

### 目录职责

| 目录 | 职责 | 说明 |
|------|------|------|
| `pages/` | 页面组件 | 应用的所有页面 |
| `components/` | 公共组件 | 可复用的UI组件 |
| `store/` | 状态管理 | 全局状态和常量 |
| `common/` | 公共资源 | 工具函数、API配置等 |
| `static/` | 静态资源 | 图片、字体等静态文件 |
| `mixins/` | 混入 | 可复用的组件选项 |
| `uni_modules/` | 插件模块 | uni-app 插件 |

### 页面结构

每个页面遵循以下结构：

```vue
<template>
  <!-- 页面模板 -->
  <view class="page-container">
    <!-- 内容 -->
  </view>
</template>

<script>
export default {
  name: 'PageName',
  components: {},
  data() {
    return {}
  },
  computed: {},
  methods: {},
  // 生命周期
  onLoad() {},
  onShow() {},
  onReady() {}
}
</script>

<style lang="scss" scoped>
/* 页面样式 */
.page-container {
  // ...
}
</style>
```

---

## 📝 代码规范

### 命名规范

#### 文件命名

- **页面文件**: kebab-case，如 `material-page.vue`
- **组件文件**: kebab-case，如 `custom-keyboard.vue`
- **JavaScript 文件**: camelCase，如 `constants.js`

#### 变量命名

```javascript
// 常量：UPPER_SNAKE_CASE
const MAX_COUNT = 100
const API_BASE_URL = 'https://api.example.com'

// 变量：camelCase
let userName = 'John'
let isActive = true

// 私有变量：_camelCase
let _privateData = {}

// 组件名：PascalCase
import CustomKeyboard from '@/components/custom-keyboard'
```

#### CSS 类命名

使用 BEM 命名规范：

```scss
// Block（块）
.material-list {}

// Element（元素）
.material-list__item {}
.material-list__title {}

// Modifier（修饰符）
.material-list__item--active {}
.material-list__title--large {}
```

### Vue 组件规范

#### 组件选项顺序

```javascript
export default {
  name: '',           // 组件名称
  components: {},     // 组件依赖
  props: {},          // 属性
  data() {},          // 数据
  computed: {},       // 计算属性
  watch: {},          // 监听器
  // 生命周期钩子（按执行顺序）
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  // UniApp 生命周期
  onLoad() {},
  onShow() {},
  onReady() {},
  onHide() {},
  onUnload() {},
  // 方法
  methods: {}
}
```

#### Props 定义

```javascript
props: {
  // 基础类型检查
  title: String,
  
  // 多种类型
  value: [String, Number],
  
  // 必填且有默认值
  count: {
    type: Number,
    required: true,
    default: 0
  },
  
  // 对象或数组默认值必须从工厂函数返回
  items: {
    type: Array,
    default: () => []
  },
  
  // 自定义验证函数
  status: {
    type: String,
    validator: value => ['success', 'warning', 'error'].includes(value)
  }
}
```

#### 事件命名

```vue
<!-- 使用 kebab-case -->
<custom-keyboard @input-change="handleInputChange" />

<!-- 方法名使用 camelCase -->
<script>
methods: {
  handleInputChange(value) {
    this.$emit('input-change', value)
  }
}
</script>
```

### JavaScript 规范

#### 使用 ES6+ 语法

```javascript
// 使用 const 和 let，避免 var
const API_URL = 'https://api.example.com'
let count = 0

// 使用箭头函数
const add = (a, b) => a + b

// 使用模板字符串
const message = `Hello, ${userName}!`

// 使用解构赋值
const { name, age } = user
const [first, second] = list

// 使用扩展运算符
const newArray = [...oldArray, newItem]
const newObject = { ...oldObject, newKey: newValue }

// 使用 Promise 和 async/await
async function fetchData() {
  try {
    const response = await api.getData()
    return response.data
  } catch (error) {
    console.error(error)
  }
}
```

#### 注释规范

```javascript
/**
 * 函数说明
 * @param {String} name - 参数说明
 * @param {Number} age - 参数说明
 * @returns {Object} 返回值说明
 */
function createUser(name, age) {
  return { name, age }
}

// 单行注释：说明代码逻辑
const result = calculate() // 行尾注释：补充说明

/* 
 * 多行注释
 * 用于复杂逻辑说明
 */
```

### SCSS 规范

```scss
// 使用变量
$primary-color: #2F85FC;
$font-size-base: 28rpx;

// 使用嵌套
.material-list {
  padding: 20rpx;
  
  &__item {
    margin-bottom: 10rpx;
    
    &--active {
      background-color: $primary-color;
    }
  }
  
  &__title {
    font-size: $font-size-base;
  }
}

// 使用 mixin
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  @include flex-center;
}
```

---

## 🔄 开发流程

### Git 工作流

#### 分支管理

```
master          # 主分支，生产环境代码
  └── develop   # 开发分支，开发环境代码
       ├── feature/xxx  # 功能分支
       ├── bugfix/xxx   # 修复分支
       └── hotfix/xxx   # 紧急修复分支
```

#### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 格式
<type>(<scope>): <subject>

# 类型（type）
feat:     新功能
fix:      修复bug
docs:     文档更新
style:    代码格式（不影响代码运行）
refactor: 重构
perf:     性能优化
test:     测试相关
chore:    构建过程或辅助工具的变动

# 示例
feat(material): 添加物料搜索功能
fix(checkout): 修复结算金额计算错误
docs(readme): 更新安装说明
style(login): 调整登录页面布局
refactor(api): 重构API请求模块
```

#### 开发流程

1. **创建功能分支**

```bash
git checkout develop
git pull origin develop
git checkout -b feature/material-export
```

2. **开发功能**

```bash
# 编写代码
# 本地测试
```

3. **提交代码**

```bash
git add .
git commit -m "feat(material): 添加物料导出功能"
```

4. **推送分支**

```bash
git push origin feature/material-export
```

5. **创建 Pull Request**

- 在 GitHub 上创建 PR
- 填写 PR 描述
- 等待代码审查

6. **合并到 develop**

```bash
# 审查通过后合并
git checkout develop
git merge feature/material-export
git push origin develop
```

### 开发步骤

#### 1. 创建新页面

```bash
# 1. 在 pages/ 目录下创建页面文件夹
mkdir pages/new-page

# 2. 创建页面文件
touch pages/new-page/new-page.vue

# 3. 在 pages.json 中注册页面
{
  "pages": [
    {
      "path": "pages/new-page/new-page",
      "style": {
        "navigationBarTitleText": "新页面"
      }
    }
  ]
}
```

#### 2. 创建新组件

```bash
# 1. 在 components/ 目录下创建组件文件夹
mkdir components/new-component

# 2. 创建组件文件
touch components/new-component/new-component.vue

# 3. 在页面中使用组件
import NewComponent from '@/components/new-component/new-component.vue'
```

#### 3. 添加 API 接口

```javascript
// common/api.js
export default {
  // 添加新接口
  getNewData: BASE_URL + '/new-data'
}

// 在页面中调用
import api from '@/common/api.js'

async fetchNewData() {
  try {
    const res = await uni.request({
      url: api.getNewData,
      method: 'GET'
    })
    console.log(res.data)
  } catch (error) {
    console.error(error)
  }
}
```

---

## 🐛 调试指南

### H5 端调试

1. **使用浏览器开发者工具**

```bash
# 运行 H5 端
# 在 HBuilderX 中：运行 -> 运行到浏览器 -> Chrome

# 打开 Chrome 开发者工具
F12 或 Ctrl+Shift+I (Windows)
Cmd+Option+I (Mac)
```

2. **查看控制台日志**

```javascript
// 使用 console.log 输出调试信息
console.log('调试信息', data)
console.error('错误信息', error)
console.warn('警告信息', warning)
```

3. **断点调试**

- 在 Chrome 开发者工具的 Sources 面板设置断点
- 逐步执行代码，查看变量值

### 微信小程序调试

1. **使用微信开发者工具**

```bash
# 运行小程序
# 在 HBuilderX 中：运行 -> 运行到小程序模拟器 -> 微信开发者工具
```

2. **查看调试信息**

- 在微信开发者工具的控制台查看日志
- 使用 Network 面板查看网络请求
- 使用 Storage 面板查看本地存储

3. **真机调试**

- 点击"预览"生成二维码
- 使用微信扫码在真机上测试

### App 端调试

1. **使用真机调试**

```bash
# 连接手机到电脑
# 在 HBuilderX 中：运行 -> 运行到手机或模拟器
```

2. **查看日志**

- 在 HBuilderX 的控制台查看日志输出

3. **使用 vconsole**

```javascript
// 在 main.js 中引入 vconsole（仅开发环境）
if (process.env.NODE_ENV === 'development') {
  const VConsole = require('vconsole')
  new VConsole()
}
```

### 常用调试技巧

#### 1. 网络请求调试

```javascript
// 封装统一的请求方法，添加日志
function request(options) {
  console.log('[Request]', options.url, options.data)
  
  return uni.request(options).then(res => {
    console.log('[Response]', options.url, res.data)
    return res
  }).catch(err => {
    console.error('[Error]', options.url, err)
    throw err
  })
}
```

#### 2. 性能调试

```javascript
// 使用 console.time 测量执行时间
console.time('fetchData')
await fetchData()
console.timeEnd('fetchData')
```

#### 3. 样式调试

```scss
// 使用边框调试布局
* {
  border: 1px solid red; // 临时添加，调试完删除
}
```

---

## ❓ 常见问题

### 1. 依赖安装失败

**问题**: `yarn install` 或 `npm install` 失败

**解决方案**:

```bash
# 清除缓存
yarn cache clean
# 或
npm cache clean --force

# 删除 node_modules 和 lock 文件
rm -rf node_modules
rm yarn.lock
# 或
rm package-lock.json

# 重新安装
yarn install
# 或
npm install
```

### 2. HBuilderX 无法识别项目

**问题**: 导入项目后无法运行

**解决方案**:

1. 确保项目包含 `manifest.json` 和 `pages.json`
2. 重启 HBuilderX
3. 清除 HBuilderX 缓存：工具 -> 清除缓存

### 3. 微信开发者工具无法连接

**问题**: HBuilderX 无法唤起微信开发者工具

**解决方案**:

1. 确保微信开发者工具已安装
2. 在微信开发者工具中：设置 -> 安全设置 -> 开启服务端口
3. 在 HBuilderX 中：工具 -> 设置 -> 运行配置 -> 配置微信开发者工具路径

### 4. 样式不生效

**问题**: 修改样式后页面没有变化

**解决方案**:

1. 检查 `scoped` 属性是否正确
2. 清除浏览器缓存
3. 重新编译项目
4. 检查样式优先级

### 5. 页面跳转失败

**问题**: `uni.navigateTo` 无法跳转

**解决方案**:

1. 检查页面路径是否正确（相对于项目根目录）
2. 检查页面是否在 `pages.json` 中注册
3. TabBar 页面使用 `uni.switchTab`
4. 检查页面栈是否已满（最多10层）

### 6. 数据不更新

**问题**: 修改 data 后页面不更新

**解决方案**:

```javascript
// 错误：直接修改数组/对象
this.list[0] = newValue  // ❌

// 正确：使用 Vue 的响应式方法
this.$set(this.list, 0, newValue)  // ✅
this.list = [...this.list]  // ✅
```

### 7. 真机调试白屏

**问题**: 真机运行时出现白屏

**解决方案**:

1. 检查控制台错误信息
2. 检查 API 权限配置
3. 检查网络请求是否使用 HTTPS
4. 检查图片路径是否正确

---

## 📚 参考资料

- [UniApp 官方文档](https://uniapp.dcloud.io/)
- [Vue2 官方文档](https://v2.vuejs.org/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [ES6 入门教程](https://es6.ruanyifeng.com/)

---

## 🤝 获取帮助

遇到问题时：

1. 查看本文档的常见问题部分
2. 搜索 [UniApp 官方社区](https://ask.dcloud.net.cn/)
3. 在项目 [GitHub Issues](https://github.com/964896765/woerp/issues) 中提问
4. 联系项目维护者

---

**最后更新**: 2025-11-27
