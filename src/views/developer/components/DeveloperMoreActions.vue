<script setup lang="ts">
import { computed, ref } from "vue";

interface DeveloperRecord {
  id: string;
  active: number;
}

const props = defineProps<{
  record: DeveloperRecord;
}>();

const emit = defineEmits<{
  edit: [record: DeveloperRecord];
  toggle: [record: DeveloperRecord];
  copy: [record: DeveloperRecord];
  reset: [record: DeveloperRecord];
}>();

const visible = ref(false);

const toggleLabel = computed(() => (props.record.active === 1 ? "禁用" : "启用"));
</script>

<template>
  <a-dropdown v-model:popup-visible="visible" trigger="click" position="bl">
    <button type="button" class="ops-action-btn ops-action-btn--primary">
     <i class="fas fa-ellipsis-h"></i> 更多
    </button>
    <template #content>
      <a-doption @click="emit('edit', props.record)"><i class="fas fa-edit icon"></i>修改</a-doption>
      <a-doption @click="emit('toggle', props.record)"><i class="fas fa-ban icon"></i>{{ toggleLabel }}</a-doption>
      <a-divider style="margin: 4px 0" />
      <a-doption @click="emit('copy', props.record)"><i class="fas fa-copy icon"></i>复制密钥</a-doption>
      <a-doption @click="emit('reset', props.record)"><i class="fas fa-key icon"></i>重置密钥</a-doption>
    </template>
  </a-dropdown>
</template>
