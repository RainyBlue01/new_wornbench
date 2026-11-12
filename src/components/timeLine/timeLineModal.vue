<template>
    <base-modal ref="modalRef">
        <div class="approvedBody">
            <a-timeline v-if="Array.isArray(commentList.comments) && commentList.comments.length > 0">
                <a-timeline-item v-for="(item, index) in commentList.comments" :key="index">
                    <div class="titlebox">
                        {{ item.comment.title }}
                    </div>
                    <template #label>
                        <div class="timeBox">

                            <div class="time">
                                {{ item.recordTime }}
                            </div>
                            <div class="approved">
                                <p class="bgb" v-if="item.comment.extra && item.comment.extra.approveType">{{
                                    item.comment.extra.approveType }}</p>
                                <div v-if="Array.isArray(item.comment.operators) && item.comment.operators.length > 0"
                                    :class="itemsa.operator == 0 ? 'error' : 'success'"
                                    v-for="(itemsa, index) in item.comment.operators" :key="index">
                                    <p class="username" v-if="item.type == 'INPUTTED'">
                                        填写人：{{ itemsa.nickname }}
                                    </p>
                                    <p class="username" v-else>
                                        审批人：{{ itemsa.nickname }}
                                    </p>
                                    <p class="operate">
                                        操作：【{{itemsa.operator == 2 ? '转交 =>' + itemsa.delegator
                                            : itemsa.operator == 0 ? '拒绝'
                                                : itemsa.operator == 1 ? '通过'
                                                    : ('退回')}}】


                                    </p>
                                    <p class="aotoOption" v-if="itemsa.autoOption === 0 || itemsa.autoOption">
                                        {{ itemsa.autoOption == 0 ? '自动审批,与流程发起人一致' : itemsa.autoOption == 1 ?
                                            '自动审批,审批人处理过该流程' : itemsa.autoOption == 2 ? '自动审批,与上一节点审批人一致' : '自动审批' }}
                                    </p>
                                    <div class="reason" v-if="itemsa.reason">
                                        处理意见：{{ itemsa.reason }}
                                    </div>
                                    <div class="signatures" v-show="itemsa.signature">
                                        手写签名：<img
                                            :src="itemsa.signature ? (win.api.dowUrl + itemsa.signature + '&token=' + token) : ''"
                                            alt="">
                                    </div>
                                </div>
                                <div v-if="item.classify == 'APPROVE_EMPTY' && item.comment.assignees && item.comment.assignees.length > 0"
                                    v-for="(itemsa, indexa) in item.comment.assignees" :key="indexa">
                                    {{ item.option == 0 ? '流转下一个节点'
                                        : '转交给' + itemsa }}
                                </div>
                                <div v-if="item.classify == 'APPROVE_COMMENT' && item.comment">
                                    操作：{{ item.comment.comment }}
                                </div>
                                <div v-if="item.classify == 'NOTICE'"
                                    style="color: #00A62C ;font-size:14px;margin-bottom: 6px;">
                                    <icon-check-circle /> 抄送给<span v-for="(val, index1s) in item.comment.assignees"
                                        :key="index1s">
                                        <span v-show="index1s < 3">
                                            {{ index1s == 0 ? '' : ',' }} {{ val }}
                                        </span>
                                    </span>
                                    <span v-show="item.comment.assignees.length > 3">
                                        等{{ item.comment.assignees.length }}人
                                    </span>
                                </div>
                            </div>

                            <p class="reason" v-if="item.comment.nickname">
                                提交人：{{ item.comment.nickname }}</p>
                            <p class="reason" v-if="item.comment.reason">
                                处理意见： {{ item.comment.reason }}</p>
                            <p class="operate" v-show="item.classify == 'REVOKE'">
                                操作：【{{ item.classify == 'REVOKE' ? '撤回' : '' }}】
                            </p>

                        </div>
                    </template>
                </a-timeline-item>
            </a-timeline>

        </div>
    </base-modal>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { executionCandidates } from '@/api/workbench/index'
const commentList = ref({})
const win = window as any
let token = localStorage.getItem("wornbench_token");
const modalRef = ref()
const showItem = (item: any) => {
    modalRef.value.handleClick({
        title: "审批详情",
        showBtn: false,
        width: "500px",
    });
    item.comments.map(v => {

        v.comment = JSON.parse(v.comment)
        console.log(v.comment)

        //  v.comment.operators = JSON.parse(v.comment.operators)

    })
    commentList.value = item
}
const getData = (item: any) => {
    executionCandidates(item.processInstanceId, item.executionId).then(res => {

    })
}
const formSubmit = () => {

}
const handleCancel = () => {

}
defineExpose({
    showItem,
});
</script>
<style lang="scss" scoped>
@use "../../styles/textColor.scss" as textColor;

.approvedBody {
    height: 500px;
    overflow-y: auto;
}

.change {
    width: 220px;

    .des {
        word-wrap: break-word;
    }
}

.signatures {
    width: 100%;
    display: flex;
    margin-top: 6px;
    color: rgba(0, 0, 0, 0.60);
    line-height: 20px;

    img {
        width: calc(100% - 70px);
    }
}

.aotoOption {
    margin-top: 6px;
    display: inline-block;
    padding: 3px 9px 2px;
    background: rgba(64, 158, 255, 0.16);
    color: rgba(64, 158, 255, 0.9);
    border-radius: 3px;
}

.reason {
    width: 100%;
    display: flex;
    margin: 6px 0 0;
    align-items: center;
    color: rgba(0, 0, 0, 0.60);
    line-height: 20px;
}

.operate {
    width: 100%;
    display: flex;
    margin: 6px 0 0;
    align-items: center;
    color: rgba(0, 0, 0, 0.60);
    line-height: 20px;
}

.username {
    width: 100%;
    display: flex;
    margin: 6px 0 0;
    align-items: center;
    color: rgba(0, 0, 0, 0.60);
    line-height: 20px;
}

.reason {
    width: 100%;
    display: flex;
    margin: 6px 0;
    align-items: center;
    color: rgba(0, 0, 0, 0.60);
    line-height: 20px;
}

.titlebox {
    color: rgba(0, 0, 0, 0.9);
    font-size: 16px;

}

.timeBox {


    .time {
        color: rgba(0, 0, 0, 0.6);
        font-size: 12px;
        margin-top: 6px;
        margin-bottom: 8px;
    }
}

.bgb {
    display: inline-block;
    padding: 3px 9px 2px;
    background: rgba(64, 158, 255, 0.16);
    color: rgba(64, 158, 255, 0.9);
    border-radius: 3px;
    margin: 0 0 6px;
}

.error {
    border-left: 3px solid #f26161;
    padding-left: 8px;
}

.success {
    border-left: 3px solid #00a62c;
    padding-left: 8px;
}
</style>
