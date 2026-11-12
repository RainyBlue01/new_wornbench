import { createApp, defineAsyncComponent } from "vue";
import type { Component } from "vue";
import ArcoVue from "@arco-design/web-vue";
import ArcoVueIcon from "@arco-design/web-vue/es/icon";
// import "@arco-design/web-vue/dist/arco.css";
import "@/styles/form-controls.scss";
import "@/styles/person-modal.scss";
import '@arco-themes/vue-tesa/index.less';
import router from "./router";
import App from "./App.vue";
import { applyBrowserCompatibility } from "@/utils/browserCompatibility";
import { installLegacyFixedHeaderText } from "@/utils/legacyFixedHeaderText";
import "@/styles/browser-compatibility.scss";

applyBrowserCompatibility();
const stopLegacyFixedHeaderText = installLegacyFixedHeaderText();
if (import.meta.hot) import.meta.hot.dispose(stopLegacyFixedHeaderText);
const app = createApp(App);

import nodeWrap from "@/views/flowPath/components/nodeWrap.vue";
app.component("nodeWrap", nodeWrap); //初始化组件
import addNode from "@/views/flowPath/components/addNode.vue";
import pinia from "./store";
app.component("addNode", addNode); //初始化组件
type ComponentModule = { default: Component };

// 保留历史全局组件的使用方式，但仅在组件真正渲染时加载对应模块。
const componentLoaders = import.meta.glob<ComponentModule>(
  "./components/**/*.{vue,tsx}",
);
const excludedComponentNames = new Set(["index", "basic", "details"]);

Object.entries(componentLoaders).forEach(([path, loader]) => {
  const componentName = path.split("/").pop()?.replace(/\.\w+$/, "");
  if (componentName && !excludedComponentNames.has(componentName)) {
    app.component(
      componentName,
      defineAsyncComponent(() => loader().then((module) => module.default)),
    );
  }
});
app.use(pinia);
app.use(router);
app.use(ArcoVue);
app.use(ArcoVueIcon);
app.mount("#app");
