import { ref } from 'vue'
import { getSupervisorPermission } from '@/api/taskFillManager'

let cachedPermission: boolean | null = null
let pendingRequest: Promise<boolean> | null = null

export function useSupervisorPermission() {
  const hasSupervisorPermission = ref(false)
  const permissionChecked = ref(false)

  const checkSupervisorPermission = async (force = false) => {
    if (!force && cachedPermission !== null) {
      hasSupervisorPermission.value = cachedPermission
      permissionChecked.value = true
      return cachedPermission
    }

    if (!force && pendingRequest) {
      const result = await pendingRequest
      hasSupervisorPermission.value = result
      permissionChecked.value = true
      return result
    }

    pendingRequest = getSupervisorPermission()
      .then((res) => Boolean(res))
      .catch(() => false)
      .finally(() => {
        pendingRequest = null
      })

    const result = await pendingRequest
    cachedPermission = result
    hasSupervisorPermission.value = result
    permissionChecked.value = true
    return result
  }

  return {
    hasSupervisorPermission,
    permissionChecked,
    checkSupervisorPermission,
  }
}
