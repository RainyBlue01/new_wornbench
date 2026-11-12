# 📚 Skills Library Index

快速调用所有可用的技能 - 复制命令直接使用

---

## Available Skills

| Skill Name | Status | Description | Quick Invocation |
|------------|--------|-------------|----------------|
| 💚 **vue** | ✅ **NEW** | Vue 3 官方最佳实践 (Anthony Fu 出品) | `@Skill: vue` |
| **🎨 web-design-guidelines | ✅ Ready | Vercel 官方前端设计指南 | `@Skill: web-design-guidelines` |
| **⚛️ vercel-react-best-practices | ✅ Ready | React / Next.js 最佳实践 | `@Skill: vercel-react-best-practices` |
| **🧩 vercel-composition-patterns | ✅ Ready | React 组件组合模式 | `@Skill: vercel-composition-patterns` |
| **🔧 chrome-compatibility-fixer | ✅ Ready | 修复低版本 Chrome 白屏问题 | `@Skill: chrome-compatibility-fixer` |
| **🚀 deploy-to-vercel | ✅ Ready | Vercel 一键部署 | `@Skill: deploy-to-vercel` |
| arco-design | ✅ Ready | Arco Design React UI 组件库 | `@Skill: arco-design` |
| find-skills | ✅ Ready | 发现和安装技能 | `@Skill: find-skills` |
| frontend-design | ✅ Ready | 高品质前端界面设计 | `@Skill: frontend-design` |
| skill-creator | ✅ Ready | 创建新技能 | `@Skill: skill-creator` |
| tailwind-design-system | ✅ Ready | Tailwind 设计系统 | `@Skill: tailwind-design-system` |
| typescript-advanced-types | ✅ Ready | TypeScript 高级类型 | `@Skill: typescript-advanced-types` |
| vue-best-practices | ✅ Ready | Vue 3 最佳实践 | `@Skill: vue-best-practices` |
| webapp-testing | ✅ Ready | Web 应用测试 | `@Skill: webapp-testing` |

---

## 🚀 How to Use

### Method 1: Quick Command
在对话中直接输入：
```
@Skill: web-design-guidelines
```

### Method 2: Using Tool
```xml
<Skill>
  <name>web-design-guidelines</name>
</Skill>
```

---

## 📋 前端技能包说明

### ✅ **已安装 7 个前端技能**

---

### 💚 vue

**Anthony Fu 出品 (Vue 核心团队成员), 13.5K+ installs**

**包含内容：**
- Vue 3 Composition API 最佳实践
- `<script setup>` 标准写法
- 响应式系统原理与陷阱
- 自定义 Hook 设计原则
- Props / Events / Slots 模式
- Vue Router & Pinia 最佳实践
- 性能优化：watch、computed、v-memo
- VueUse 常用函数指南

---

### 🎨 web-design-guidelines

**Vercel 团队出品，**100K+ installs**

**包含内容：**
- 高品质 UI 设计系统
- 响应式设计原则
- 动画和过渡最佳实践
- 可访问性设计
- 性能优化设计

---

### ⚛️ vercel-react-best-practices

**Vercel 工程团队出品，**185K+ installs**

**包含内容：**
- React 性能优化
- Hooks 最佳实践
- 状态管理模式
- 组件设计原则
- Next.js App Router 最佳实践
- Server Components 指南

---

### 🧩 vercel-composition-patterns

**React 组件组合设计模式**

**包含内容：**
- Compound Components 复合组件模式
- Render Props 模式
- Provider Pattern 提供者模式
- 高阶组件设计
- 自定义 Hook 设计原则

---

### 🚀 deploy-to-vercel

**一键部署到 Vercel**

**包含内容：**
- Vercel 部署配置
- 环境变量管理
- Edge Functions 配置
- 缓存策略
- Preview Deployment 工作流

---

### 🔧 chrome-compatibility-fixer

**本地自定义实战技能**

**What it fixes:**
- Vite/Rolldown 低版本 Chrome 白屏问题
- 无报错但页面空白
- 语法降级和 polyfill 配置

**Fix Coverage:**
- ✅ Chrome 80+ (2020年2月发布)
- ✅ Edge 80+
- ✅ Firefox 80+
- ✅ Safari 14+

---

## 📁 Directory Structure

```
.trae/skills/
├── SKILLS-INDEX.md              # 本文件 - 快速调用索引
├── chrome-compatibility-fixer/    # 自定义本地技能
│   └── SKILL.md
```

**Global Skills（已全局安装）：
- 💚 vue (~/.agents/skills/) - Anthony Fu Vue 核心团队出品
- web-design-guidelines
- vercel-react-best-practices
- vercel-composition-patterns
- deploy-to-vercel
- vercel-react-native-skills
- vercel-cli-with-tokens

---

## ➕ Add More Skills

想要搜索更多技能？
```
@Skill: find-skills
```

搜索特定领域技能：
```bash
npx skills find [关键词]
```

例如：
```bash
npx skills find testing
npx skills find typescript
npx skills find performance
```
