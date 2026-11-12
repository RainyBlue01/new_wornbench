// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/:catchAll(.*)",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/login/index.vue"),
  },
  {
    path: "/homePage",
    name: "homePage",
    component: () => import("../views/homePage/index.vue"),
  },
  {
    path: "/myApps",
    name: "myApps",
    component: () => import("../views/homePage/myApps.vue"),
  },
  {
    path: "/processCenter",
    name: "processCenter",
    component: () => import("../views/processCenter/index.vue"),
  },
  {
    path: "/processCenter/detail",
    name: "processCenterDetail",
    component: () => import("../views/processCenter/upDateData.vue"),
  },
  {
    path: "/webHook",
    name: "webHook",
    component: () => import("../views/webHook/index.vue"),
  },
  {
    path: "/application",
    name: "application",
    component: () => import("../views/application/index.vue"),
  },
  {
    path: "/designer",
    name: "designer",
    component: () => import("../views/designer/index.vue"),
  },
  {
    path: "/targets",
    name: "targets",
    component: () => import("../views/targets/index.vue"),
  },
  {
    path: "/form",
    name: "form",
    component: () => import("../views/form/index.vue"),
  },
  {
    path: "/flowPath",
    name: "flowPath",
    component: () => import("../views/flowPath/index.vue"),
  },
  {
    path: "/publishApp",
    name: "publishApp",
    component: () => import("../views/publishApp/index.vue"),
  },
  {
    path: "/department",
    name: "deptManager",
    component: () => import("../views/department/index.vue"),
  },
  {
    path: "/job",
    name: "postManager",
    component: () => import("../views/job/index.vue"),
  },
  {
    path: "/role",
    name: "roleManager",
    component: () => import("../views/role/index.vue"),
  },
  {
    path: "/user",
    name: "userManager",
    component: () => import("../views/user/index.vue"),
  },
  {
    path: "/externalUser",
    name: "externalUserManager",
    component: () => import("../views/externalUser/index.vue"),
  },
  {
    path: "/dictionaryList",
    name: "dictManager",
    component: () => import("../views/dictionaryList/index.vue"),
  },
  {
    path: "/leader",
    redirect: { path: "/user", query: { tab: "leader" } },
  },
  {
    path: "/category",
    name: "appCategory",
    component: () => import("../views/category/index.vue"),
  },
  {
    path: "/visitor",
    name: "visitor",
    component: () => import("../views/application/visitor.vue"),
  },
  {
    path: "/manager",
    name: "manager",
    component: () => import("../views/application/manager.vue"),
  },
  {
    path: "/developer",
    name: "developer",
    component: () => import("../views/developer/index.vue"),
  },
  {
    path: "/iconLibrary",
    name: "iconLibrary",
    component: () => import("../views/iconLibrary/index.vue"),
  },

  {
    path: "/website",
    name: "settings",
    component: () => import("../views/settings/website.vue"),
  },
  {
    path: "/middleLogin",
    name: "middleLogin",
    component: () => import("../views/settings/middleLogin.vue"),
  },
  {
    path: "/wechatOfficialConfig",
    name: "wechatOfficialConfig",
    component: () => import("../views/settings/wechatOfficialConfig.vue"),
  },
  {
    path: "/fillMessageLink",
    name: "fillMessageLink",
    component: () => import("../views/settings/fillMessageLink.vue"),
  },
  {
    path: "/securityCenter",
    name: "securityGroup",
    component: () => import("../views/securityCenter/index.vue"),
  },
  {
    path: "/toDoCenter",
    name: "toDoCenter",
    component: () => import("../views/doCenter/index.vue"),
  },
  {
    path: "/toDoCenterDes",
    name: "toDoCenterDes",
    component: () => import("../views/doCenterDes/index.vue"),
  },
  {
    path: "/taskFillCenter",
    name: "taskFillCenter",
    component: () => import("../views/taskFillCenter/index.vue"),
  },
  {
    path: '/taskSuperviseCenter',
    name: 'taskSuperviseCenter',
    component: () => import('../views/taskSuperviseCenter/index.vue')
  },
  {
    path: '/taskManageCenter',
    name: 'taskManageCenter',
    component: () => import('../views/taskManageCenter/index.vue')
  },
  {
    path: '/taskManageCenter/fillDetail',
    name: 'fillDetail',
    component: () => import('../views/taskManageCenter/fillDetail.vue')
  },
  {
    path: '/taskChartCenter',
    name: 'taskChartCenter',
    component: () => import('../views/taskChartCenter/index.vue')
  },
  {
    path: '/connector',
    name: 'connector',
    component: () => import('../views/connector/index.vue')
  },
  {
    path: '/connectorDes',
    name: 'connectorDes',
    component: () => import('../views/connector/detail.vue')
  },
  {
    path: '/pluginCenter',
    name: 'pluginCenter',
    component: () => import('../views/pluginCenter/index.vue')
  },
  {
    path: '/pluginDesigner',
    name: 'pluginDesigner',
    component: () => import('../views/pluginDesigner/index.vue')
  },
  {
    path: '/outputManageCenter',
    name: 'outputManageCenter',
    component: () => import('../views/outputManageCenter/index.vue')
  },
  {
    path: '/originalData',
    name: 'originalData',
    component: () => import('../views/application/original/index.vue')
  },
  {
    path: '/report',
    name: 'report',
    component: () => import('../views/report/index.vue')
  },
  {
    path: '/test/iframePreview',
    name: 'iframePreview',
    component: () => import('../views/test/iframePreview.vue')
  }
];

const router = createRouter({
  history: createWebHistory("/wornbench/"),
  routes,
});

// 添加路由守卫
router.beforeEach((to, from, next) => {
  // 这里可以添加鉴权逻辑
  next();
});

export default router;
