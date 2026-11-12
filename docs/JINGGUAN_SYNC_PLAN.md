# 警官端代码同步实施方案

> 制定日期：2026-09-09  
> 源工程：`frontend/dmp/new_wornbench`  
> 目标工程：`frontend/jingguan/dmp/new_wornbench`  
> 版本控制：SVN

## 1. 当前状态

今天 DMP 工程共有 36 个源码、测试和文档文件发生修改。警官端已同步以下 3 个文件：

- `views/taskManageCenter/fillDetail.vue`：接入详情组件和画布拖动 composable。
- `views/taskManageCenter/components/FillRecordDetailDialog.vue`：填报详情展示及下载、打印事件出口。
- `views/taskManageCenter/composables/useFlowCanvasPan.ts`：画布拖动、点击抑制和监听器卸载。

警官端相关 SFC 编译、针对性类型检查和生产构建已经通过。其余修改尚未同步。

两端 `package.json` 和 `tsconfig.app.json` 当前一致，但业务代码不能整文件覆盖。警官端 `fillDetail.vue` 已确认存在独立的 `printList`、`getPrint`、`exportData`、`blobDownload`、`openBlobForPrint` 和 `h` 渲染逻辑，这些差异必须保留。

## 2. 同步原则

1. 每一批同步前分别读取两端最新文件，按职责移植，不根据旧行号覆盖代码。
2. 纯工具、静态配置和测试在确认依赖一致后同步；页面入口只接入模块，不复制整个页面。
3. 保留警官端接口地址、请求参数、返回值适配、路由和打印导出行为。
4. 新组件使用明确的 props/emit 契约；状态和请求继续由页面或 composable 持有。
5. 不混入独立缺陷修复。同步中发现的业务差异单独记录、单独验证。
6. 每批形成可独立回退的 SVN 变更集；新增文件必须显式加入 SVN，`dist` 不纳入版本控制。

## 3. 分批实施

### 批次 0：建立警官端基线

执行内容：

- 使用 SVN 客户端记录警官端当前本地修改和未纳管文件。
- 保存当前生产构建、单元测试和完整类型检查结果。
- 核对今天涉及的 36 个文件，建立“直接同步、适配同步、不需要同步”清单。

通过条件：已有修改可追溯；同步失败时可以只回退当前批次。

### 批次 1：表单静态配置拆分

同步范围：

- `src/data/form.js`
- `src/data/formComponents/basic.js`
- `src/data/formComponents/advanced/`
- `src/data/formComponents/extended.js`
- `src/data/formComponents/business.js`
- `src/data/formComponents/layout.js`
- `src/data/formComponents/decoration.js`

实施要求：

- 先比较两端原 `form.js` 的组件数量、顺序、默认值和警官专用组件。
- 警官专用配置放入对应分类模块，不能因使用 DMP 组装入口而丢失。
- 保持 `formConf`、`inputComponents` 等原导出名称和引用关系。

验证：组件总数和类型唯一；分组及面板顺序一致；新增组件、复制栅格和保存回读正常。

### 批次 2：表单工具拆分

同步范围：

- `src/utils/form.ts`
- `src/utils/form/dateFormats.ts`
- `src/utils/form/storage.ts`
- `src/utils/form/fieldLookup.ts`
- `src/utils/form/referenceData.ts`
- `src/utils/form/hydrate.ts`
- `src/utils/form/serialize.ts`
- `src/utils/form/runtime.ts`
- `src/utils/form/expressions.ts`
- `src/utils/form/visibility.ts`
- `src/utils/form/validation.ts`
- `src/utils/form/columns.ts`
- `src/components/expression/formula.ts` 的 storage 引用调整

实施要求：

- 先比较警官端原 `form.ts` 是否有专有函数或不同导出；差异迁移到职责模块。
- 保留旧入口的全部公开导出，内部模块禁止经旧入口反向引用。
- 保留 `setRules` 两参数调用兼容和 `setUpDateData` 可选 `id` 兼容。
- 不改变提交函数原地修改参数、异步顺序、缓存键和日期格式规则。

验证：普通字段、ROW/COL、SUBFORM、人员部门、日期时间和隐藏字段的回填与提交；循环依赖扫描；相关单元测试。

### 批次 3：报表及详情值处理

同步范围：

- `src/utils/reportDetailValue.ts`
- `src/utils/reportDetailValue.test.ts`
- `src/components/basic/details.vue`
- `src/components/basic/table_cup.vue`
- `src/views/report/index.vue`

实施要求：值为 `null`、空字符串或仅包含空格式值的对象时不显示序列化内容；`0`、`false` 和有效文本仍必须显示。对警官端表格列、详情抽屉和报表字段菜单逐处适配。

验证：空值、零、布尔值、人员部门格式对象、普通对象和数组显示。

### 批次 4：审批详情拆分

同步范围：

- `src/views/doCenterDes/index.vue` 的模块接入
- `components/ChangeRecordsPanel.vue`
- `composables/useDetailExport.ts`
- `composables/useDetailFormRuntime.ts`
- `utils/changeRecordFormat.ts`
- `utils/processTree.ts`
- 对应单元测试

实施要求：先记录警官端审批、打印、返回路由和接口参数差异；仅迁移格式化、变更记录、导出状态、流程树和表单运行时职责。禁止使用 DMP 的整页文件替换警官端入口。

验证：详情加载、审批操作、变更记录分页、多模板打印、下载取消和失败路径。

### 批次 5：填报详情剩余拆分

已完成：单条详情组件和流程画布拖动 composable。

待同步范围：

- `composables/useFillDetailExport.ts`
- `utils/fillDetailFormat.ts`
- `fillDetail.vue` 对上述模块的适配接入

实施要求：警官端继续使用自己的打印、导出接口，通过 composable 依赖参数或回调注入差异，不在共享逻辑中硬编码 DMP 接口。

验证：全部/已选导出、单条下载、单条打印、多模板选择、弹窗取消、流程预览拖动。

### 批次 6：报表设计器拆分

同步范围：

- `src/views/designer/types.ts`
- `utils/gridLayout.ts` 及测试
- `composables/useDesignerDatasource.ts`
- `composables/useDesignerPersistence.ts`
- `designer/index.vue` 的适配接入

实施要求：保留警官端数据源接口和返回结构；保持 12 列布局、碰撞处理、栅格复制、保存防抖、重做和卸载清理行为。

验证：添加、拖动、缩放、删除、复制栅格、重命名、筛选、保存回读、重做和预览。

### 批次 7：构建配置与文档

同步范围：

- 评估 `vite.config.ts` 中实际影响构建的改动，确认警官端入口和代理配置后再同步。
- 警官端建立自己的拆分进度记录；DMP 的审查文档不直接复制为警官端结论。

验证：开发启动、生产构建、静态资源路径、代理和部署基础路径。

## 4. 每批验证门槛

每批至少执行：

1. 对新增和接入的 Vue 文件执行 SFC 脚本、模板编译检查。
2. 执行 `npx vue-tsc --noEmit -p tsconfig.app.json`，区分本批新增错误和历史错误。
3. 执行相关单元测试；每个可交付批次执行全量测试。
4. 执行 `npm run build`；已有 `::v-deep` 和大 chunk 警告单独记录，不能当作本批成功证明。
5. 对涉及页面执行真实登录后的关键路径回归。

出现以下任一情况时停止当前批次：

- 警官端专有接口或路由语义无法确认。
- 同步导致公开导出、请求结构、缓存键或异步顺序变化。
- 新增类型错误、单元测试失败或生产构建失败。
- 新增文件未能确认纳入 SVN。

## 5. 推荐执行顺序与交付

推荐顺序为：批次 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7。静态配置和底层工具先稳定，页面拆分随后接入，避免页面同时依赖两套实现。

每批交付记录应包含：变更文件、保留的警官差异、验证命令及结果、未覆盖的业务场景、SVN 新增文件清单。全部批次完成后再统一进行审批、填报、报表、设计器和 2K 页面回归。
