import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getWorkbenchCount } from '@/api/workbench/index'

export function useBannerBell() {
  const router = useRouter()
  const pendingCount = ref(0)

  const fetchPendingCount = () => {
    getWorkbenchCount()
      .then((res) => {
        pendingCount.value = res?.pendingCount ?? 0
      })
      .catch(() => {
        pendingCount.value = 0
      })
  }

  const goToDoCenter = () => {
    localStorage.setItem('activeTab', '0')
    router.push({ name: 'toDoCenter' })
  }

  onMounted(() => {
    fetchPendingCount()
  })

  return {
    pendingCount,
    fetchPendingCount,
    goToDoCenter,
  }
}
