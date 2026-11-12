<template>
  <div class="original-page">
    <HomeBanner
      variant="subpage"
      breadcrumb-parent="应用管理"
      :breadcrumb-current="appdes.appName || '原始数据'"
      :back-label="returnLabel"
      :back-to="returnRoute"
      :show-subpage-hero="false"
    />
    <OriginalDataPanel :appdes="routeAppdes" :active="true" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HomeBanner from '@/components/banner/homeBanner.vue'
import OriginalDataPanel from '../components/OriginalDataPanel.vue'
import { getAppReturnLabel, getAppReturnRoute } from '../composables/useAppFormNav'

const route = useRoute()

const routeAppdes = computed(() => ({
  id: route.query.id,
  formId: route.query.formId,
  processId: route.query.processId,
  appName: route.query.appName,
}))

const returnRoute = computed(() => getAppReturnRoute(route))
const returnLabel = computed(() => getAppReturnLabel(route))
</script>

<style lang="scss" scoped>
.original-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f1f5f9;
}
</style>
