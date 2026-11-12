<template>
  <a-drawer :visible="showDrawer" @cancel="closeDrawer" @close="closeDrawer" title="纠错记录" :width="800"
            :footer="false">
    <div class="fix-record-content table">
      <a-table
          style="flex: 1"
          :columns="columns"
          :data="tableData"
          :pagination="page"
          size="small"
          :bordered="false"
      />
   
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import {fixRecordObjectPage} from "@/api/taskFillCenter";
import {reactive, ref,h} from "vue";

const showDrawer = ref(false)

const tableData = ref<any[]>([])

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    align: 'center',
    width: 80
  },
  {
    title: '纠错人',
    dataIndex: 'username',
    align: 'center',
    width: 150
  },
  {
    title: '纠错时间',
    dataIndex: 'fixTime'
  },
  {
    title: '处理结果',
    align: 'center',
    width: 150,
    render: ({record}) => {
      const stateMap = {
        1: {class: 'green', text: '采用'},
        2: {class: 'red', text: '不采用'},
        default: {class: 'yellow', text: '处理中'}
      };
      const {class: className, text} = stateMap[record.states] || stateMap.default;

      return h('div', {class: className}, text);
    }
  }
]

const page = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const openDrawer = (args: any) => {
  showDrawer.value = true
  getFixRecords(args)
}

const closeDrawer = () => {
  showDrawer.value = false
}

const getFixRecords = (args: any) => {
  const params = {
    current: page.pageNum,
    size: page.pageSize,
    formId: args.formId || null
  }
  fixRecordObjectPage(args.objectId, params).then((res: any[]) => {
    tableData.value = (res?.records || []).map((v, index) => {
      v.index = index + 1
      return v
    })
  })
}

defineExpose({
  openDrawer
})
</script>


<style scoped lang="scss">
@use '@/styles/table_noborder.scss' as table;
.fix-record-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  overflow-y: auto;


}

.bottom {
  padding: 20px 0;
  text-align: right;
}

.green {
  color: #00B42A;
}

.red {
  color: #F53F3F;
}

.yellow {
  color: #FF7D00;
}

</style>
