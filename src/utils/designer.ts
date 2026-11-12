import { safeJsonRecord } from '@/utils/safeJson'

export function getDesignerById(id: any) {
    const list = safeJsonRecord(localStorage.getItem('designerList'))
    return list[id] || {}

}
export function clearDesignerById(id: any) {
    const list = safeJsonRecord(localStorage.getItem('designerList'))
    delete list[id]
    localStorage.setItem('designerList', JSON.stringify(list))
}
export function setDesignerById(flowData: any, id: any) {
    const list = safeJsonRecord(localStorage.getItem('designerList'))
    list[id] = flowData
    localStorage.setItem('designerList', JSON.stringify(list))
}
