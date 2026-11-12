# new_wornbench 项目结构总结（DMP 版）

## 1. 项目定位与边界

本项目是业务构建平台的 DMP 前端工程，提供应用创建与管理、表单与流程设计、任务填报与监管、审批待办、报表指标、组织权限、开发者能力、连接器与插件体系等功能。

- **可修改工程**：当前 `frontend/dmp/new_wornbench`。
- **产品原型来源**：共享目录 `03-原型设计`，仅作为产品经理提供的只读需求和交互参考，不属于本项目源码，不应在开发中修改。
- **同源工程**：`frontend/jingguan/dmp/new_wornbench`。两个工程主体结构高度一致，但部署路径和少量业务实现存在差异，修改时不能假设可直接覆盖同步。
- **本版本部署基路径**：`/wornbench/`。

## 2. 技术栈

| 分类 | 选型 |
| --- | --- |
| 前端框架 | Vue 3.5，现有代码混合 Composition API、`<script setup>` 与部分历史写法 |
| 语言 | TypeScript 5.9 为主，保留少量 JavaScript |
| 构建 | Vite 6、`@vitejs/plugin-vue`、legacy 构建（Chrome/Edge 79+） |
| 路由 | Vue Router 4，`createWebHistory('/wornbench/')` |
| 状态管理 | Pinia 3，当前根 store 主要注册系统设置模块 |
| UI | Arco Design Vue 2.57、自定义主题 `@arco-themes/vue-tesa` |
| 请求 | Axios，经 `src/utils/request.ts` 统一封装 |
| 图表 | ECharts 6，构建时拆分为 `chart-vendor` |
| 编辑器 | Monaco Editor、CodeMirror、wangEditor |
| 设计器能力 | grid-layout、拖拽组件、公式解析、JSON Schema/AJV |
| 文件能力 | xlsx、mammoth、签名板、文件预览服务 |
| 测试 | Vitest、Playwright |

工程规模（不含依赖和构建产物）：约 **327 个 Vue 文件、108 个 TypeScript 文件、12 个 JavaScript 文件**。自动化测试目前数量较少。

## 3. 根目录结构

```text
new_wornbench/
├── src/                    # 业务源码
│   ├── api/                # 按业务域封装的接口
│   ├── assets/             # 图片、SVG、iconfont 等源资源
│   ├── components/         # 通用组件和表单控件
│   ├── composables/        # 可复用组合式逻辑
│   ├── data/               # 设计器和业务静态配置
│   ├── router/             # 路由表
│   ├── store/              # Pinia store
│   ├── styles/             # 全局及业务 SCSS
│   ├── types/              # TypeScript 类型
│   ├── utils/              # 请求、权限、表单、文件等工具
│   ├── views/              # 路由页面，按业务模块组织
│   ├── App.vue
│   └── main.ts
├── public/                 # config.js、字体、Font Awesome、模板文件
├── docs/                   # 表单事件与组件事件设计文档
├── scripts/                # 字体切片和 ECharts 迁移脚本
├── tests/e2e/              # Playwright E2E 测试
├── dist/                   # 构建产物，不作为源码修改目标
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── tsconfig*.json
└── deploy_wornbench.sh
```

`node_modules/`、`dist/` 和根目录压缩包属于依赖/产物，不应直接修改或纳入结构性开发。

## 4. 启动与构建链路

入口为 `src/main.ts`：创建 Vue 应用，注册 Pinia、Vue Router、Arco Design 和图标库，并通过 `import.meta.glob` 自动注册 `src/components` 下的一级通用组件。流程设计器的 `nodeWrap`、`addNode` 也在入口显式全局注册。

常用命令：

```bash
npm install
npm run dev              # Vite 开发服务，默认端口 8118
npm run build            # 生产构建
npm run build:analyze    # 构建体积分析
npm run test             # Vitest
npm run test:e2e         # Playwright
npm run test:e2e:headed
npm run slice:font
npm run migrate:echarts
```

开发代理：

- `/api` → `http://172.17.42.1:8080`
- `/preview` → `http://172.17.2.122:9001`

生产访问路径为 `/wornbench/`，该值同时出现在 `vite.config.ts`、`src/router/index.ts` 和登录失效后的返回路径处理逻辑中，调整部署路径时必须同步修改。

## 5. 核心架构

```text
路由视图 views/
    ↓ 调用
业务组件 components/ + composables/
    ↓ 调用
API 模块 api/
    ↓ 统一经过
utils/request.ts（Token、拦截器、错误与登录跳转）
    ↓
后端 /api
```

### 路由

`src/router/index.ts` 使用懒加载路由，主要入口包括：

- `/login`、`/homePage`、`/myApps`
- `/application`、`/designer`、`/form`、`/flowPath`、`/publishApp`
- `/processCenter`、`/toDoCenter`、`/toDoCenterDes`
- `/taskFillCenter`、`/taskManageCenter`、`/taskSuperviseCenter`、`/taskChartCenter`
- `/department`、`/job`、`/role`、`/user`、`/externalUser`、`/dictionaryList`
- `/developer`、`/connector`、`/pluginCenter`、`/pluginDesigner`
- `/report`、`/targets`、`/outputManageCenter`、`/originalData`
- `/website`、`/wechatOfficialConfig`、`/securityCenter`

未知路径由 catch-all 路由统一重定向。

### 状态与配置

- Pinia 入口位于 `src/store/index.ts`，系统配置模块位于 `src/store/modules/settings`。
- 登录凭据、菜单缓存和部分页面偏好使用 `localStorage`/`sessionStorage`，相关逻辑集中在 `utils/auth.ts`、`utils/menuCache.ts` 和各业务模块。
- 运行环境配置从 `public/config.js` 注入，代码通过 `window.api` 读取服务地址。

### API 层

`src/api` 按业务域拆分，如 application、form、designer、processCenter、taskFillCenter、user、department、role、settings、plugin、connector、developer 等。组件应调用对应 API 模块，不应绕过封装直接创建 Axios 实例。

## 6. 业务模块

| 模块 | 主要目录 | 职责 |
| --- | --- | --- |
| 首页与应用广场 | `views/homePage` | 待办概览、应用广场、我的应用、目录与分类 |
| 应用中心 | `views/application` | 应用访问/管理、原始数据、发布任务、应用设置与共享 |
| 表单设计器 | `views/form`、`components/showItem` | 拖拽表单、字段属性、联动、事件、按钮动作、预览 |
| 流程设计器 | `views/flowPath` | 节点编排、分支、候选人、时限、通知、插件节点 |
| 流程与待办 | `views/processCenter`、`views/doCenter*` | 发起/处理流程、详情、审批轨迹和操作栏 |
| 任务体系 | `views/taskFillCenter`、`taskManageCenter`、`taskSuperviseCenter`、`taskChartCenter` | 填报、任务管理、监督整改和统计 |
| 报表与指标 | `views/report`、`views/targets` | 报表布局、指标、条件、分组和公式字段 |
| 组织资源 | `views/department`、`job`、`role`、`user`、`externalUser` | 部门、岗位、角色、人员、领导/兼职和外部用户 |
| 平台管理 | `views/settings`、`securityCenter`、`dictionaryList`、`iconLibrary` | 系统设置、安全菜单、数据字典和图标库 |
| 开发者能力 | `views/developer`、`webhook`、`connector` | 数据写入、Webhook、认证和连接器配置 |
| 插件体系 | `views/pluginCenter`、`pluginDesigner`、表单/流程插件组件 | 插件管理、代码编辑、参数设计、测试调试和业务节点接入 |

## 7. 产品原型与工程映射

共享目录的 HTML 原型只用于说明目标交互，工程中的大致映射如下：

| 产品原型 | 工程模块 |
| --- | --- |
| 工作台、我创建的应用 | `views/homePage`、`views/homePage/myApps` |
| 设计应用 | `views/form`、`components/showItem` |
| 流程设计 | `views/flowPath` |
| 发布应用 | `views/publishApp`、`views/application/publishTask` |
| 表单填写、原始数据 | `views/application` 及其 components/original |
| 审批办理、审批详情 | `views/doCenter`、`views/doCenterDes`、`views/processCenter` |
| 运维中心、填报详情 | 各 task*Center 模块 |
| 基础资源、系统设置 | 组织资源 views、`views/settings`、`securityCenter` |
| 报表设计与查看 | `views/report`、`views/targets` |
| 插件中心、插件设计器 | `views/pluginCenter`、`views/pluginDesigner` |

原型和工程不是文件级一一对应关系；实现时应以当前工程的数据模型、路由、权限和 API 契约为准，再参考原型交互。

## 8. 与经管版的差异

两个工程源码文件集合几乎一致，但当前已确认：

- DMP 版 Vite base、Router history base 及登录返回路径前缀为 `/wornbench/`；经管版为 `/workflow/`。
- 本版本额外包含 `src/api/file/index.ts` 和 `src/utils/attachmentUrl.ts`，用于第三方附件 URL、缓存和预览地址处理；经管版目前没有这两个文件。
- 两边约十余个同路径文件内容不同，涉及上传、时间线、表单工具、访问者页、表单设计器、任务监管、用户页等。同步功能时应逐文件合并，不应整目录覆盖。
- 经管版根目录额外保留 JSON Schema 业务组件方案文档和 `workflow.zip` 构建/交付包；本版本根目录使用 `wornbench.zip`。

## 9. 维护注意事项

1. 保持 API 调用经过 `src/api` 和 `utils/request.ts`，避免组件直接耦合 Axios。
2. 新增 Vue 功能优先使用 Composition API、`<script setup lang=ts>`、明确的 props/emits 和按业务域组织的 composable。
3. 路由级 view 应主要负责页面编排；复杂表格、弹窗和业务状态应拆入组件或 composable。
4. 修改表单控件时同时检查 `components/showItem`、设计器字段配置、预览/填写态和事件文档。
5. 修改流程节点时同时检查节点渲染、右侧配置、候选人、分支、通知及序列化结构。
6. 重型组件（编辑器、图表、签名板）在 Modal/Drawer 中按需挂载，并在卸载时清理实例和监听器。
7. `dist/`、压缩包和 `node_modules/` 不作为源码修改目标。
8. 当前自动化测试覆盖有限，关键功能修改至少执行类型检查、构建和相关 E2E/手工回归。

## 10. 总结

这是一个模块较完整的 Vue 3 低代码业务构建平台前端。`views` 承载业务页面，`components` 和 `composables` 复用交互与逻辑，`api` 与统一请求层对接后端，表单/流程/报表/插件构成核心设计能力，任务/审批/运维承接运行态业务。

共享产品原型只读；实际开发和文档维护范围是两个 `new_wornbench` 工程。DMP 版需始终保留 `/wornbench/` 部署语义，并通过差异合并方式选择性同步经管版能力。
