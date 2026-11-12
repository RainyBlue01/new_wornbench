<template>
  <div class="top-box">
    <div class="top-box-item" @click="toFill">
      <div class="imgMsy">
        <img src="../../assets/icon_renwutianbao.svg" />
      </div>
      <div class="num-box">
        <div class="title">任务填报</div>
        <div class="num">
          {{ workbenchCount.fillCount }}
        </div>
      </div>
    </div>
    <div class="top-box-item" @click="toflow(0)">
      <div class="img">
        <img src="../../assets/icon_wodedaiban@2x.png" />
      </div>
      <div class="num-box">
        <div class="title">我的待办</div>
        <div class="num">
          {{ workbenchCount.pendingCount }}
        </div>
      </div>
    </div>
    <div class="top-box-item" @click="toflow(1)">
      <div class="img">
        <img src="../../assets/icon_wofaqide@2x.png" />
      </div>
      <div class="num-box">
        <div class="title">我发起的</div>
        <div class="num">
          {{ workbenchCount.applyCount }}
        </div>
      </div>
    </div>
    <div class="top-box-item" @click="toflow(2)">
      <div class="img">
        <img src="../../assets/icon_wochulide@2x.png" />
      </div>
      <div class="num-box">
        <div class="title">我处理的</div>
        <div class="num">
          {{ workbenchCount.handledCount }}
        </div>
      </div>
    </div>
    <div class="top-box-item" @click="toflow(3)">
      <div class="imgs">
        <img src="../../assets/icon_chaosong_1@2x.png" />
      </div>
      <div class="num-box">
        <div class="title">抄送我的</div>
        <div class="num">
          {{ workbenchCount.noticeCount }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { getWorkbenchCount as getWorkbenchCountApi } from "@/api/workbench/index";
import { reactive } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const workbenchCount = reactive({
  fillCount: 0,
  applyCount: 0,
  pendingCount: 0,
  handledCount: 0,
  noticeCount: 0,
});
const getWorkbenchCount = () => {
  getWorkbenchCountApi().then((res) => {
    workbenchCount.fillCount = res.fillCount;
    workbenchCount.applyCount = res.applyCount;
    workbenchCount.pendingCount = res.pendingCount;
    workbenchCount.handledCount = res.handledCount;
    workbenchCount.noticeCount = res.noticeCount;
  });
};
getWorkbenchCount();
const toFill = () => {
  router.push({ path: '/taskFillCenter' });
};
const toflow = (val: any) => {
  localStorage.setItem('activeTab', String(val));
  router.push({ path: '/homePage' });
};
// getNumber()
</script>
<style lang="scss" scoped>
@use "../../styles/textColor.scss" as textColor;

.top-box {
  display: flex;
  width: 1200px;
  margin: 20px auto 0;

  @media screen and (max-width: 1200px) {
    width: 100%;
    padding: 0 20px;
  }

  @media screen and (max-width: 768px) {
    flex-wrap: wrap;
    padding: 0 15px;
    gap: 15px;

    .top-box-item {
      width: calc(50% - 10px);
      padding: 20px;

      &:nth-child(4),
      &:nth-child(5) {
        margin-top: 0;
      }
    }
  }

  @media screen and (max-width: 480px) {
    .top-box-item {
      width: 100%;
    }
  }

  .top-box-item+.top-box-item {
    margin-left: 20px;
  }

  &-item {
    width: calc(20% - 15px);
    display: flex;
    background: #ffffff;
    box-shadow: 0px 3px 3px 1px rgba(0, 0, 0, 0.12);
    border-radius: 6px 6px 6px 6px;
    padding: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    animation: fadeInUp 0.6s ease-out forwards;
    opacity: 0;

    &:nth-child(1) {
      animation-delay: 0.1s;
    }

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.3s;
    }

    &:nth-child(4) {
      animation-delay: 0.4s;
    }

    &:nth-child(5) {
      animation-delay: 0.5s;
    }

    &:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);

      .img,
      .imgMsy,
      .imgs {
        transform: scale(1.1) rotate(5deg);
      }

      .num {
        color: textColor.$ThemeTextColor;
        transform: scale(1.05);
      }
    }

    .imgMsy {
      margin-top: 2px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 20px;
      transition: all 0.3s ease;

      img {
        width: 50px;
        transition: all 0.3s ease;
      }
    }

    .imgs {
      margin-top: 2px;
      height: 50px;
      width: 50px;
      border-radius: 50%;
      background-color: #e8faff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20px;
      transition: all 0.3s ease;

      img {
        width: 22px;
        transition: all 0.3s ease;
      }
    }

    .img {
      margin-top: 2px;
      width: 50px;
      height: 50px;
      margin-right: 20px;
      transition: all 0.3s ease;

      img {
        width: 50px;
        height: 50px;
        transition: all 0.3s ease;
      }
    }

    .num-box {
      .title {
        font-size: 14px;
        height: 18px;
        line-height: 18px;
        font-family: "Alibaba PuHuiTi 2.0-55 Regular";
        color: rgba(0, 0, 0, 0.6);
      }

      .num {
        font-family: "Alibaba PuHuiTi 2.0-55 Regular";
        margin-top: 8px;
        height: 27px;
        line-height: 27px;
        font-size: 22px;
        font-weight: 700;
        color: rgba(0, 0, 0, 0.9);
        transition: all 0.3s ease;
      }
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
