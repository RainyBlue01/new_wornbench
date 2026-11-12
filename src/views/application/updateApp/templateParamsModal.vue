<template>
    <a-modal v-model:visible="visible" @cancel="handleCancel" :footer="false" unmount-on-close title="模板参数"
        title-align="start" width="900px" :mask-closable="false">
        <div class="template-params">
            <!-- 标签页 -->
            <a-tabs v-model:activeKey="activeTab" type="line" class="params-tabs">
                <a-tab-pane key="form" title="表单参数">
                    <div class="table-container">
                        <a-table :columns="columns" default-expand-all-rows :data="tableData" :pagination="false"
                            :bordered="{ wrapper: true, cell: true }" row-key="id">
                            <template #serialNumber="{ rowIndex }">
                                {{ rowIndex + 1 }}
                            </template>
                            <template #printField="{ record }">
                                <div class="item" @dblclick="dow(record.label)">
                                    {{ '{' + '{' + record.label + '}' + '}' }}
                                </div>
                            </template>
                            <template #printFieldId="{ record }">
                                <div class="item" @dblclick="dow(record.value)">
                                    {{ '{' + '{' + record.value + '}' + '}' }}
                                </div>
                            </template>
                        </a-table>
                    </div>
                </a-tab-pane>

                <a-tab-pane key="process" title="流程参数" v-if="props.appdes.category == 2">
                    <div class="table-container">
                        <a-table :columns="columns" default-expand-all-rows :data="dataList.flowData"
                            :pagination="false" :bordered="{ wrapper: true, cell: true }" row-key="id">
                            <template #serialNumber="{ rowIndex }">
                                {{ rowIndex + 1 }}
                            </template>
                            <template #printField="{ record }">
                                <div class="item" @dblclick="dow(record.label)">
                                    {{ '{' + '{' + record.label + '}' + '}' }}
                                </div>
                            </template>
                            <template #printFieldId="{ record }">
                                <div class="item" @dblclick="dow(record.value)">
                                    {{ '{' + '{' + record.value + '}' + '}' }}
                                </div>
                            </template>
                        </a-table>
                    </div>
                </a-tab-pane>
                <a-tab-pane key="system" title="系统参数" v-if="props.appdes.category == 2">
                    <div class="table-container">
                        <a-table :columns="columns" default-expand-all-rows :data="dataList.sysData" :pagination="false"
                            :bordered="{ wrapper: true, cell: true }" row-key="id">
                            <template #serialNumber="{ rowIndex }">
                                {{ rowIndex + 1 }}
                            </template>
                            <template #printField="{ record }">
                                <div class="item" @dblclick="dow(record.label)">
                                    {{ '{' + '{' + record.label + '}' + '}' }}
                                </div>
                            </template>
                            <template #printFieldId="{ record }">
                                <div class="item" @dblclick="dow(record.value)">
                                    {{ '{' + '{' + record.value + '}' + '}' }}
                                </div>
                            </template>

                        </a-table>
                    </div>
                </a-tab-pane>
            </a-tabs>

            <!-- 底部提示 -->
            <div class="footer-tips">
                复制打印字段至你制作的 word 模板即可：
                <a-link @click="showExampleTemplate">示例模板</a-link>
            </div>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, defineExpose } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useRoute } from 'vue-router';
import { inject } from 'vue'
import { getFormList } from '@/utils/form';
const props = defineProps<{
    appdes: any;
}>();
// 弹窗可见性
const visible = ref(false);
const route = useRoute()

// 获取应用ID：优先使用注入的 appId，否则从 route.query.id 获取
const getAppId = inject('appId', () => route.query.id) as () => any;
const dataList = ref({
    sysData: [{
        index: 1,
        label: '流程发起时间',
        value: 'flowApplyTime',
    },
    {
        index: 2,
        label: '流程结束时间',
        value: 'flowFinishTime',
    }, {
        index: 3,
        label: '流程耗时',
        value: 'flowDuration',
    }, {
        index: 4,
        label: '流程发起人',
        value: 'flowApplyUser',
        children: [{
            index: 1,
            label: '姓名',
            value: 'nickname',
        },
        {
            index: 2,
            label: '账号',
            value: 'username',
        }, {
            index: 3,
            label: '部门',
            value: 'deptname',
        }]
    }],
    flowData: [{
        label: '节点信息',
        value: 'approveNode',
        children: [{
            index: 1,
            label: '节点名称',
            value: 'nodeName',
        },
        {
            index: 2,
            label: '节点开始时间',
            value: 'nodeStartTime',
        }, {
            index: 3,
            label: '节点结束时间',
            value: 'nodeStopTime',
        }, {
            index: 4,
            label: '节点耗时',
            value: 'nodeDuration',
        }, {
            index: 5,
            label: '节点审批人',
            value: 'nodeApprover',
            children: [{
                index: 1,
                label: '审批人',
                value: 'username',
            },
            {
                index: 2,
                label: '审批意见',
                value: 'reason',
            }, {
                index: 3,
                label: '审批签名',
                titles: '@审批签名',
                value: '@signature',
            },
            {
                index: 4,
                label: '审批状态',
                value: 'state',
            },
            {
                index: 5,
                label: '审批时间',
                value: 'approveTime',
            }
            ]
        }]
    }],
})

// 当前激活的标签页
const activeTab = ref('form');

// 表格列定义
const columns = [
    {
        title: '序号',
        slotName: 'serialNumber',
        width: 80,
        align: 'center',
    },
    {
        title: '字段名称',
        dataIndex: 'label',
    },
    {
        title: '打印字段',
        slotName: 'printField',
    },
    {
        title: '打印字段 ID',
        slotName: 'printFieldId',
    },
];

// 表格数据
const tableData = ref([]);

// 显示弹窗
const showItem = () => {
    visible.value = true;
    activeTab.value = 'form';
    getDataList();
};

// 获取数据列表
const getDataList = () => {
    const appId = getAppId();
    if (appId) {
        tableData.value = getFormList(appId, true)
    }

};

// 取消处理
const handleCancel = () => {
    visible.value = false;
};

// 显示示例模板
const showExampleTemplate = () => {
    const fileUrl = '/wornbench/item.docx';

    // 创建一个隐藏的a标签
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = '示例模板.docx';  // 设置下载文件名

    // 将a标签添加到DOM并触发点击事件
    document.body.appendChild(link);
    link.click();

    // 移除a标签
    document.body.removeChild(link);
};
const dow = (item) => {
    var text = '{{' + item + '}}'; //复制的内容
    /**如果内容是界面的一个元素，可以直接读取元素getElementById()
     这里是因为界面没有input元素，所以自己创建一个元素来作为载体把内容复制到剪贴板
  **/
    var inputEle = document.createElement("input"); //创建一个input元素
    //判断并控制整个HTML文档可编辑
    if (!(document.designMode == "on")) {
        document.designMode = "on";
    }
    inputEle.value = text; //把复制的内容赋给input的内容
    document.body.appendChild(inputEle); //把input元素绑定到document,不然操作不到
    // 判断元素是否能被选中
    if (inputEle && inputEle.select) {
        // 选择文本
        // inputEle.focus();
        inputEle.select(); //或： inputEle.setSelectionRange(0, inputEle.value.length);
        try {
            // 复制文本
            document.execCommand("copy");
        } catch (err) {
            alert("由于浏览器安全设置，不支持复制功能!!！");
        }
        inputEle.blur(); //失去焦点
        inputEle.style.display = "none"; //隐藏元素
        document.body.removeChild(inputEle); //删除元素
        document.designMode = "off"; //文档设为不可编辑,否则界面的其他元素可能被影响
        Message.success("复制成功");
    }
}

// 暴露方法给父组件
defineExpose({
    showItem,
});
</script>

<style lang="scss" scoped>
@use "@/styles/textColor.scss" as textColor;

.template-params {

    .params-tabs {
        margin-bottom: 24px;
    }

    .table-container {
        min-height: 400px;


    }

    .footer-tips {
        font-size: 12px;
        color: #86909c;
        line-height: 20px;
        padding-top: 16px;
        margin-top: 16px;

        .arco-link {
            margin-left: 4px;
        }
    }
}
</style>
