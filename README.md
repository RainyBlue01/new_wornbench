# new_wornbench（DMP 工作台前端）

企业级低代码应用平台前端。提供应用创建与管理、表单设计器、流程设计、任务填报/管理/监督/图表、插件中心、连接器、报表与指标、组织权限管理等一整套可视化配置与业务运行能力，部署路径为 `/wornbench/`。

## 技术栈

| 分类 | 选型 |
| --- | --- |
| 框架 | Vue 3.5 + Composition API + `<script setup>` |
| 语言 | TypeScript 5.9+（ES6+，禁 any 除非必要） |
| 构建 | Vite 6 + @vitejs/plugin-legacy（兼容 Chrome 79+，适配统一认证现场旧浏览器）+ terser（生产清 console） |
| 路由 | Vue Router 4.6，createWebHistory，base `/wornbench/`，query 参数 `menuCode` 驱动 |
| 状态管理 | Pinia 3.0（必须通过 action 修改 state） |
| UI 组件库 | @arco-design/web-vue 2.57 + 自定义主题 @arco-themes/vue-tesa |
| 请求 | Axios 统一封装（`src/utils/request.ts`，统一拦截器 + 错误处理） |
| 图表 | ECharts 6（构建时 manualChunks 拆出 chart-vendor） |
| 编辑器 | Monaco Editor 0.52（@amoayun/monaco-editor-vue3）、CodeMirror、wangEditor 富文本 |
| 其他关键库 | vue-signature-pad 签名板、grid-layout-plus / vue-grid-layout 布局、xlsx / mammoth 文件解析、@formulajs/formulajs + expr-eval 公式、crypto-js、nanoid / uuid、area-data 行政区划 |
| 测试 | Vitest + Vue Test Utils（单元）、Playwright（E2E） |

## 功能模块

- 首页工作台：待办概览（我的待办/我发起的/我处理的/抄送我的）、填报任务倒计时、我的应用
- 应用中心：应用创建、分类管理、访问者/管理员视图、应用发布、原始数据导入导出、共享与访问控制
- 表单设计器：可视化拖拽设计（`src/views/form` + `src/components/showItem` 的 q* 系列控件）、表单事件脚本、JSON Schema 配置
- 流程设计：流程节点配置（nodeWrap/addNode/timeLine）、审批流、流程中心（发起/待办/已办/抄送）、待办中心详情
- 任务体系：任务填报中心（填报/催办/记录）、任务管理（批量详情/修改）、任务监督、任务图表统计
- 插件体系：插件中心 + 插件设计器（代码编辑、参数设计、测试调试）
- 连接器：数据连接器管理（列表/详情）
- 报表与指标：报表中心、指标配置（条件项/分组/公式字段）
- 组织与权限：部门、岗位、角色、用户（含领导、兼职）、外部用户、数据字典、图标库
- 安全中心：菜单/权限树、应用权限收敛（frontendCode + menuCache）
- 系统设置：网站配置、微信公众号配置、统一登录中间页、填报消息链接、Webhook 推送

## 目录结构

```text
src/
├── api/            # 按模块拆分的 API 封装（应用/表单/流程/任务/用户等），禁止组件直接 import axios
├── assets/         # 静态资源（图片、iconfont、字体）
├── components/     # 通用组件（签名板、人员选择、富文本、时间线、表单控件 showItem 等）
├── composables/    # 组合式函数（审批流、表单事件、监督权限、铃铛等）
├── data/           # 静态配置数据（表单/设计器/常量等）
├── router/         # 路由配置（/wornbench/ 为 base）
├── store/          # Pinia（user、settings、reference 等模块）
├── styles/         # 全局样式（SCSS，按业务中心拆分）
├── types/          # TypeScript 类型定义
├── utils/          # 工具（request、auth、menuCache、表单联动、文件处理等）
├── views/          # 页面视图（按业务中心组织）
├── App.vue / main.ts
docs/               # 设计文档（表单事件、组件事件方案等）
scripts/            # 构建辅助脚本（字体切片 font.mjs、echarts 迁移）
public/             # config.js、字体、fontawesome 等静态资源
tests/              # 测试
```

## 开发指南

```bash
npm install        # 安装依赖
npm run dev        # 本地开发（端口 8118）
npm run build      # 生产构建
npm run build:analyze  # 构建产物分析（rollup-plugin-visualizer）
npm run test       # 单元测试（vitest run）
npm run test:e2e   # E2E 测试（playwright）
npm run slice:font # 字体切片
```

开发代理（vite.config.ts）：

- `/api` → `http://172.17.42.1:8080`（后端服务）
- `/preview` → `http://172.17.2.122:9001`（文件预览服务）

生产部署参考根目录 `deploy_wornbench.sh`。

## 规范要点（详见 name.md / 项目规则）

- 组件 PascalCase，变量 camelCase，常量 UPPER_SNAKE_CASE，文件夹 kebab-case/camelCase，事件 emit 用 kebab-case
- 签名板必须 `throttle: 16` + `minDistance: 4` + `scaleToDevicePixelRatio: false`，并用 `v-if` 动态挂载；弹窗 `append-to-body`
- 菜单请求通过 `getCachedMenus(false, getMenus)` + `inflightMenusRequest` 合并并发；权限判断用 `hasMenuFrontendCode(menus, 'createApp' | 'operationsCenter')`
- 重组件（签名板、富文本、图表）在 Modal/Drawer 内必须按需挂载；大数据列表用虚拟滚动/分页（PersonPagination）
- API 统一走 `src/api/` 模块 + 全局拦截器；敏感操作走 FormData + 后端鉴权
- 文档先行：新增模块同步更新 REPOWIKI.md / PROJECT_ANALYSIS.md；提交前通过 `npm run build` + `npx vue-tsc --noEmit`

## 相关文档

- [表单事件编写指南](docs/表单事件编写指南.md)
- [表单事件的设计和上下文提供的能力](docs/表单事件的设计和上下文提供的能力.md)
- [表单设计器组件事件实现方案](docs/表单设计器组件事件实现方案.md)
- [表单设计器组件支持事件清单](docs/表单设计器组件支持事件清单.md)
