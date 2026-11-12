<template>
  <div class="login-page">
    <div class="bg-shape bg-shape-1"></div>
    <div class="bg-shape bg-shape-2"></div>
    <div class="bg-shape bg-shape-3"></div>

    <div class="login-card">
      <div class="logo-area">
        <div class="logo-icon" aria-hidden="true">
          <i class="fas fa-cubes"></i>
        </div>
        <h1 class="logo-title">{{ webSiteStore.getTitle }}</h1>
        <p class="logo-subtitle">Business Builder Platform</p>
      </div>

      <a-form ref="ruleFormRef" :model="ruleForm" layout="vertical" :rules="rules" class="login-form">
        <a-form-item prop="username" class="form-item">
          <label class="input-label">账号</label>
          <div class="input-shell">
            <icon-user class="input-icon" />
            <a-input v-model="ruleForm.username" allow-clear size="large" class="input-control"
              placeholder="请输入账号/手机号/邮箱" />
          </div>
        </a-form-item>

        <a-form-item prop="password" class="form-item">
          <label class="input-label">密码</label>
          <div class="input-shell">
            <icon-lock class="input-icon" />
            <a-input-password v-model="ruleForm.password" allow-clear size="large" class="input-control"
              placeholder="请输入密码" @press-enter="submitForm" />
          </div>
        </a-form-item>
        <div class="options-row">
          <a-checkbox v-model="rememberMe" class="remember-check">记住我</a-checkbox>
          <button type="button" class="text-link" @click="handleForgotPassword">忘记密码?</button>
        </div>

        <a-button size="large" type="primary" class="login-btn" @click="submitForm" :loading="loading" long>
          {{ loading ? "登录中..." : "登 录" }}
        </a-button>

        <div class="divider">
          <span>其他登录方式</span>
        </div>

        <a-button size="large" class="secondary-btn" @click="linkT" long>
          <i class="fas fa-university" style="color: #667eea; font-size: 16px;"></i>
          <span>统一身份认证登录</span>
        </a-button>
      </a-form>

      <div class="footer-text">
        <span>还没有账号?</span>
        <button type="button" class="text-link register-link" @click="handleRegister">立即注册</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { IconUser, IconLock } from "@arco-design/web-vue/es/icon";
import { getUserinfo, login, servicePlatformLogin } from "../../api/login/index";
import { getDeptByUser } from "@/api/common/index";
import { useRouter, useRoute } from "vue-router";
import { Message } from "@arco-design/web-vue";
import { webSiteConfigStore } from "@/store/index";
import { initTaskCenterEventSource } from "@/utils/taskCenterEventSource";

const webSiteStore = webSiteConfigStore();
const ruleForm = reactive({
  username: "",
  password: "",
});
const rememberMe = ref(true);

function base64Encode(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (_match, p1) {
      return String.fromCharCode(parseInt("0x" + p1));
    }),
  );
}

const rules = {
  username: [
    {
      required: true,
      message: "请输入账号",
    },
  ],
  password: [
    {
      required: true,
      message: "请输入密码",
    },
  ],
};

const ruleFormRef = ref();
const loading = ref(false);
const router = useRouter();
const route = useRoute();
const win = window as any;

const getDeptLabel = (deptList: any[]) => {
  return deptList
    .map((item) => item?.deptName || item?.name || item?.label)
    .filter(Boolean)
    .join("、");
};

const enrichUserWithDept = async (userInfo: any) => {
  const userId = userInfo?.id || userInfo?.userId;
  if (!userId) return userInfo;

  try {
    const deptList = await getDeptByUser({
      userId,
      partTime: 0,
      lower: false,
    });
    const departments = Array.isArray(deptList) ? deptList : [];
    const deptName = getDeptLabel(departments);

    return {
      ...userInfo,
      departments,
      deptList: departments,
      deptName: deptName || userInfo?.deptName,
      department: deptName || userInfo?.department,
    };
  } catch {
    return userInfo;
  }
};

const enterSystem = async (userInfo: any) => {
  const userWithDept = await enrichUserWithDept(userInfo);

  // Message.success("登录成功");
  localStorage.setItem("isAdmin", "true");
  localStorage.setItem("wornbench_useinfo", JSON.stringify(userWithDept));
  localStorage.setItem("wornbench_userId", userWithDept.id || userWithDept.userId);
  initTaskCenterEventSource(router);

  const redirectUrl = localStorage.getItem("redirect_url");
  if (redirectUrl) {
    localStorage.removeItem("redirect_url");
    router.push(redirectUrl);
  } else {
    router.push("/homepage");
  }
};

const submitForm = () => {
  ruleFormRef.value.validate((error: any) => {
    if (!error) {
      loading.value = true;
      const formData = new URLSearchParams();
      formData.append("username", ruleForm.username);
      formData.append("password", base64Encode(ruleForm.password));
      login(formData)
        .then((res: any) => {
          localStorage.setItem("wornbench_token", res);

          return getUserinfo().then((res1) => {
            return enterSystem(res1);
          });
        })
        .finally(() => {
          loading.value = false;
        });
    }
  });
};

const linkT = () => {
  // console.log('apiURL', win.api.apiURL);
  window.location.href = win.api.apiURL;
  // window.open(win.api.apiURL, "_blank");
};

const handleForgotPassword = () => {
  Message.info("请联系管理员重置密码");
};

const handleRegister = () => {
  Message.info("请联系管理员开通账号");
};
if (route.query.ismiddle == "1" || route.query.access_token) {
  if (route.query.access_token && route.query.openid) {
    const accessToken = route.query.access_token;
    const openId = route.query.openid;
    localStorage.setItem("wornbench_info", openId);

    const params1 = { accessToken: accessToken, open_id: openId.toString() };
    servicePlatformLogin(params1).then((res) => {
      if (res) {
        localStorage.setItem("wornbench_token", res);
        getUserinfo().then((res1) => {
          return enterSystem(res1);
        });
      }
    });
  } else {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("wornbench_userId");
    localStorage.removeItem("wornbench_token");
    localStorage.removeItem("wornbench_info");
    localStorage.removeItem("activeName");
    localStorage.removeItem("activeTab");
    localStorage.removeItem("flowList");
    localStorage.removeItem("formList");
    localStorage.removeItem("taskFillCenterAppId");
    linkT();
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  --page-start: #667eea;
  --page-end: #764ba2;
  --card-bg: rgba(255, 255, 255, 0.95);
  --text-main: #1e293b;
  --text-body: #64748b;
  --text-faint: #94a3b8;
  --field-bg: #f8fafc;
  --field-border: #e2e8f0;
  --field-hover: #cbd5e1;

  position: relative;
  min-height: calc(100vh - 64px);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  background: linear-gradient(135deg, var(--page-start) 0%, var(--page-end) 100%);
}

.bg-shape {
  position: absolute;
  border-radius: 999px;
  filter: blur(80px);
  opacity: 0.38;
  pointer-events: none;
}

.bg-shape-1 {
  top: -100px;
  left: -100px;
  width: 400px;
  height: 400px;
  background: #a78bfa;
}

.bg-shape-2 {
  right: -50px;
  bottom: -50px;
  width: 300px;
  height: 300px;
  background: #60a5fa;
}

.bg-shape-3 {
  left: 50%;
  top: 50%;
  width: 220px;
  height: 220px;
  background: #f472b6;
  opacity: 0.2;
  transform: translate(-50%, -50%);
}

.login-card {
  position: relative;
  z-index: 1;
  width: 340px;
  max-width: 100%;
  padding: 48px 40px;
  border-radius: 24px;
  background: var(--card-bg);
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 80px rgba(15, 23, 42, 0.18);
  animation: cardEnter 0.6s ease-out;
}

.logo-area {
  text-align: center;
  margin-bottom: 38px;
}

.logo-icon {
  position: relative;
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: 18px;
  background: linear-gradient(135deg, var(--page-start), var(--page-end));
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.cube {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 2px solid #fff;
  border-radius: 3px;
}

.cube-main {
  left: 17px;
  top: 27px;
}

.cube-top {
  left: 25px;
  top: 17px;
}

.cube-right {
  left: 34px;
  top: 27px;
}

.logo-title {
  margin: 0;
  color: var(--text-main);
  font-size: 24px;
  font-weight: 700;
  line-height: 36px;
  letter-spacing: 0.5px;
}

.logo-subtitle {
  margin: 6px 0 0;
  color: var(--text-faint);
  font-size: 13px;
}

.login-form {
  :deep(.arco-form-item) {
    margin-bottom: 20px;
  }

  :deep(.arco-form-item-content) {
    display: block;
  }
}

.form-item {
  margin-bottom: 0;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
}

.input-shell {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  z-index: 2;
  color: var(--text-faint);
  font-size: 16px;
  transform: translateY(-50%);
  transition: color 0.2s ease;
  pointer-events: none;
}

.input-shell:focus-within .input-icon {
  color: var(--page-start);
}

.input-control {
  width: 100%;
}

.input-control:deep(.arco-input-wrapper),
.input-control:deep(.arco-input-password) {
  min-height: 50px;
  border: 1px solid var(--field-border);
  border-radius: 12px;
  background: var(--field-bg);
  box-shadow: none;
  transition: all 0.25s ease;
}

.input-control:deep(.arco-input-wrapper:hover),
.input-control:deep(.arco-input-password:hover) {
  border-color: var(--field-hover);
  background: #fff;
}

.input-control:deep(.arco-input-wrapper.arco-input-focus),
.input-control:deep(.arco-input-password:focus-within) {
  border-color: var(--page-start);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.input-control:deep(.arco-input),
.input-control:deep(.arco-input-inner) {
  height: 39px;
  padding-left: 44px;
  color: #334155;
  font-size: 14px;
  background: transparent;
}

.input-control:deep(.arco-input::placeholder),
.input-control:deep(.arco-input-inner::placeholder) {
  color: #94a3b8;
}

.input-control:deep(.arco-input-password .arco-icon-hover) {
  color: #94a3b8;
}

.options-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0 28px;
  font-size: 13px;
}

.remember-check {
  color: var(--text-body);
}

.remember-check:deep(.arco-checkbox-label) {
  color: var(--text-body);
  font-size: 13px;
}

.text-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--page-start);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
}

.text-link:hover {
  color: #8453bc;
}

.login-btn {
  height: 50px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--page-start), var(--page-end));
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 4px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(102, 126, 234, 0.38);
}

.divider {
  display: flex;
  align-items: center;
  margin: 28px 0;
  color: #cbd5e1;
  font-size: 12px;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.divider span {
  padding: 0 16px;
}

.secondary-btn {
  height: 44px;
  border: 1px solid #d7deea;
  border-radius: 12px;
  background: #f8fafc;
  color: #475569;
  gap: 8px;
  font-size: 15px;
  transition: all 0.25s ease;
}

.secondary-btn:hover {
  border-color: #c8d1e2;
  background: #fff;
  color: var(--page-start);

  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.12);
}

.secondary-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.footer-text {
  margin-top: 30px;
  text-align: center;
  color: var(--text-faint);
  font-size: 12px;
}

.register-link {
  margin-left: 4px;
  font-size: 12px;
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .login-page {
    padding: 16px;
  }

  .login-card {
    width: 100%;
    padding: 36px 22px 28px;
    border-radius: 20px;
  }

  .logo-title {
    font-size: 22px;
  }

  .options-row {
    gap: 12px;
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
