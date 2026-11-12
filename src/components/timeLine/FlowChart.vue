<template>
  <div class="flow-chart-wrapper">
    <div class="flow-canvas-outer" :style="canvasOuterStyle" ref="flowCanvasRef" @mousedown="onCanvasMouseDown">
      <div class="flow-canvas-inner" :style="canvasStyle">
        <section class="dingflow-design">
          <div class="box-scale-container">
            <div class="box-scale">
              <nodeWraps :formList="formList" :activeNodeIds="activeNodeIds" v-model:nodeConfig="nodeConfig"
                v-model:flowPermission="flowPermission" />
            </div>
          </div>
        </section>
      </div>
    </div>

    <div class="flow-footer">
      <div class="footer-tip">
        <icon-drag-dot-vertical />
        <span>拖动画布查看完整流程</span>
      </div>
      <div class="flow-legend">
        <span class="legend-item legend-success">
          <span class="dot" />已完成
        </span>
        <span class="legend-item legend-processing">
          <span class="dot" />进行中
        </span>
        <span class="legend-item legend-pending">
          <span class="dot" />待处理
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, watch, provide } from 'vue'
import { IconDragDotVertical } from '@arco-design/web-vue/es/icon'
import nodeWraps from './nodeWraps.vue'
import { useReferenceStore } from '@/store/modules/reference'
import { getUsersByIds, getDeptsByIds, getPostList } from '@/api/common/index'
import { collectCandidateReferenceIds } from '@/utils/formatNodeCandidate'

const props = withDefaults(
  defineProps<{
    formList?: any[]
    activeNodeIds?: string[]
    canvasHeight?: string
  }>(),
  {
    formList: () => [],
    activeNodeIds: () => [],
    canvasHeight: 'calc(100vh - 384px)',
  },
)

const nodeConfig = defineModel('nodeConfig')
const flowPermission = defineModel('flowPermission')
const referenceStore = useReferenceStore()
const candidateResolveTick = ref(0)

const prefetchCandidateReferences = async (cfg: any) => {
  if (!cfg?.id) return

  const { userIds, deptIds, postIds } = collectCandidateReferenceIds(cfg)
  const missingUserIds = userIds.filter((id) => !referenceStore.getUser(id))
  const missingDeptIds = deptIds.filter((id) => !referenceStore.getDept(id))
  const missingPostIds = postIds.filter((id) => !referenceStore.getPost(id))
  const tasks: Promise<void>[] = []

  if (missingUserIds.length) {
    tasks.push(
      getUsersByIds(missingUserIds).then((res) => {
        if (Array.isArray(res)) {
          referenceStore.setUsers(res)
        }
      }),
    )
  }

  if (missingDeptIds.length) {
    tasks.push(
      getDeptsByIds(missingDeptIds).then((res) => {
        if (Array.isArray(res)) {
          referenceStore.setDepts(
            res.map((dept: any) => ({
              id: dept.id,
              label: dept.deptName,
              deptName: dept.deptName,
            })),
          )
        }
      }),
    )
  }

  if (missingPostIds.length) {
    tasks.push(
      getPostList().then((res) => {
        if (Array.isArray(res)) referenceStore.setPosts(res)
      }),
    )
  }

  if (tasks.length) {
    await Promise.all(tasks)
    candidateResolveTick.value += 1
  }
}

watch(
  nodeConfig,
  (cfg) => {
    prefetchCandidateReferences(cfg)
  },
  { immediate: true, deep: true },
)

provide('flowChartCandidateResolver', {
  tick: candidateResolveTick,
  getUser: (id: string) => referenceStore.getUser(id),
  getDept: (id: string) => referenceStore.getDept(id),
  getPost: (id: string) => referenceStore.getPost(id),
})

const flowCanvasRef = ref<HTMLElement>()
const canvasOffset = ref({ x: 0, y: 0 })
const isPanning = ref(false)
const panStart = { x: 0, y: 0, offsetX: 0, offsetY: 0 }

const canvasOuterStyle = computed(() => ({
  height: props.canvasHeight,
}))

const canvasStyle = computed(() => ({
  transform: `translate(${canvasOffset.value.x}px, ${canvasOffset.value.y}px)`,
}))

const onCanvasMouseMove = (e: MouseEvent) => {
  if (!isPanning.value) return

  const dx = e.clientX - panStart.x
  const dy = e.clientY - panStart.y

  canvasOffset.value.x = panStart.offsetX + dx
  canvasOffset.value.y = panStart.offsetY + dy
  e.preventDefault()
}

const stopPanning = () => {
  if (!isPanning.value) return
  isPanning.value = false

  const container = flowCanvasRef.value
  if (container) {
    container.style.cursor = 'grab'
  }

  window.removeEventListener('mousemove', onCanvasMouseMove)
  window.removeEventListener('mouseup', stopPanning)

  const inner = container?.querySelector('.flow-canvas-inner') as HTMLElement
  if (inner) {
    inner.style.transition = 'transform 0.15s ease-out'
  }
}

const onCanvasMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return

  const container = flowCanvasRef.value
  if (!container) return

  isPanning.value = true
  panStart.x = e.clientX
  panStart.y = e.clientY
  panStart.offsetX = canvasOffset.value.x
  panStart.offsetY = canvasOffset.value.y

  container.style.cursor = 'grabbing'

  const inner = container.querySelector('.flow-canvas-inner') as HTMLElement
  if (inner) {
    inner.style.transition = 'none'
  }

  window.addEventListener('mousemove', onCanvasMouseMove)
  window.addEventListener('mouseup', stopPanning)
}

onBeforeUnmount(() => {
  stopPanning()
})
</script>

<style lang="scss" scoped>
.flow-chart-wrapper {
  display: flex;
  flex-direction: column;
  position: relative;
  margin: 0 20px;
  overflow: hidden;

  .flow-canvas-outer {
    position: relative;
    overflow: hidden;
    height: calc(100vh - 384px);
    cursor: grab;
    user-select: none;
    background: #eef1f6;
    border-radius: 12px;
    border: 1px solid #e2e8f0;

    &:active {
      cursor: grabbing;
    }

    .flow-canvas-inner {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
  }

  .flow-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: white;
    flex-shrink: 0;

    .footer-tip {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #94a3b8;
      font-size: 12px;

      :deep(svg) {
        width: 16px;
        height: 16px;
      }
    }

    .flow-legend {
      display: flex;
      gap: 20px;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #64748b;

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        &.legend-success .dot {
          background-color: #22c55e;
        }

        &.legend-processing .dot {
          background-color: rgb(var(--primary-6));
        }

        &.legend-pending .dot {
          background-color: #cbd5e1;
        }
      }
    }
  }
}
</style>

<style lang="scss">
@use '@/styles/flow-designer.scss';
@import '../../styles/workflow.css';
</style>
