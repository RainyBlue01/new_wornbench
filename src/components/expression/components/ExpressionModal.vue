<template>

  <a-modal

    v-model:visible="visible"

    title="配置公式"

    :width="1200"

    title-align="start"

    :ok-button-props="{ size: 'small' }"

    :cancel-button-props="{ size: 'small' }"

    @before-ok="handleOk"

  >

    <div class="code-container" v-if="visible">

      <div class="code-container-variable">

        <div class="left-title">变量</div>

        <ExpressionVariableBox @choose="choose" ref="variableBoxRef" />

      </div>

      <div class="code-container-func" style="margin-left: 10px">

        <div class="left-title">函数</div>

        <ExpressionFuncBox @choose="choose" />

      </div>

      <div class="code-container-edit">

        <Codemirror

          class="codemirror"

          :style="{ width: 'calc(100% - 10px)', height: '490px' }"

          :options="cmOptions"

          ref="cmRef"

          :autofocus="true"

          @ready="onReady"

          @change="onChange"

        >

        </Codemirror>

      </div>

    </div>

  </a-modal>

</template>



<script lang="ts">

import type { ExpressionFunc, ExpressionVariable } from "../formula";

import ExpressionVariableBox from "./ExpressionVariableBox.vue";

import ExpressionFuncBox from "./ExpressionFuncBox.vue";

export default {

  name: "ExpressionModal",

};

</script>



<script lang="ts" setup>

import { nextTick, reactive, ref } from "vue";

import "codemirror/mode/javascript/javascript.js";

import Codemirror from "codemirror-editor-vue3";

import type { CmComponentRef } from "codemirror-editor-vue3";



const DELIMITED_NEW = /@#([\s\S]*?)#@/g;

const DELIMITED_LEGACY = /@#([\s\S]*?)@#/g;

const BARE_VARIABLE =

  /(getFormValue\('[^']+','[^']+'\)|getSubFormValue\('[^']+','[^']+','[^']+'\)|getCurrentUser\("[^"]+"\)|getUser\w+\("[^"]+"\))/g;



const visible = ref<boolean>(false);

const pendingRestore = ref(false);



const expressionData = reactive({

  label: "",

  value: "",

});



function show(data: { label: string; value: string; type: string }) {

  pendingRestore.value = true;

  visible.value = true;

  expressionData.label = data.label;

  expressionData.value = data.value || "";

}



function hide() {

  visible.value = false;

}

defineExpose({ show, hide });



const cmRef = ref<CmComponentRef>();

const cmOptions = {

  mode: "text/javascript",

  lineNumbers: false,

  lineWrapping: true,

  tabSize: 4,

  showCursorWhenSelecting: true,

};



const variableBoxRef = ref();



interface VariableToken {

  start: number;

  end: number;

  value: string;

}



function collectVariableTokens(formula: string): VariableToken[] {

  const tokens: VariableToken[] = [];

  const occupied = new Set<number>();



  const addToken = (start: number, end: number, value: string) => {

    for (let i = start; i < end; i++) {

      if (occupied.has(i)) return;

    }

    for (let i = start; i < end; i++) {

      occupied.add(i);

    }

    tokens.push({ start, end, value: value.trim() });

  };



  let match: RegExpExecArray | null;



  DELIMITED_NEW.lastIndex = 0;

  while ((match = DELIMITED_NEW.exec(formula)) !== null) {

    addToken(match.index, match.index + match[0].length, match[1]);

  }



  DELIMITED_LEGACY.lastIndex = 0;

  while ((match = DELIMITED_LEGACY.exec(formula)) !== null) {

    addToken(match.index, match.index + match[0].length, match[1]);

  }



  BARE_VARIABLE.lastIndex = 0;

  while ((match = BARE_VARIABLE.exec(formula)) !== null) {

    addToken(match.index, match.index + match[0].length, match[1]);

  }



  return tokens.sort((a, b) => a.start - b.start);

}



function restoreMarks() {

  const instance = cmRef.value?.cminstance;

  if (!instance) return;

  if (!expressionData.value) {
    instance.setValue("");
    return;
  }

  const formula = expressionData.value;

  instance.setValue("");

  instance.setValue(formula);



  const variableBoxInstance = variableBoxRef.value;

  if (!variableBoxInstance?.findVariable) return;



  const tokens = collectVariableTokens(formula);

  tokens.forEach((token) => {

    const variableObj = variableBoxInstance.findVariable(token.value);

    if (!variableObj) return;



    markVariable({

      start: instance.posFromIndex(token.start),

      end: instance.posFromIndex(token.end),

      value: token.value,

      label: variableObj.showLabel ? variableObj.showLabel : variableObj.label,

    });

  });

}



function onReady() {

  if (!pendingRestore.value) return;

  pendingRestore.value = false;

  nextTick(() => {

    restoreMarks();

  });

}



function choose(data: ExpressionVariable | ExpressionFunc) {

  const instance = cmRef.value?.cminstance;

  instance?.focus();

  const cursor = instance?.getCursor();

  expressionData.label = "函数";

  if (data.type === "variable") {

    if (expressionData.value && expressionData.value.length < 1) {

      expressionData.label = data.label;

    }

    instance?.replaceSelection(`@#${data.value}#@`);

    markVariable({

      start: cursor,

      end: instance?.getCursor(),

      value: data.value + "",

      label: data.label,

    });

  } else {

    markFunc({

      start: cursor,

      end: instance?.getCursor(),

      value: data.value,

      label: data.label,

    });

  }

}



function markVariable(mark: {

  start: any;

  end: any;

  label: string;

  value: string;

}) {

  const instance = cmRef.value?.cminstance;

  const label = mark.label;

  const spanDom = document.createElement("span");

  spanDom.title = label;

  spanDom.innerText = label;

  spanDom.classList.add("exp-variable");

  spanDom.dataset.variable = mark.label;



  instance?.markText(mark.start, mark.end, {

    replacedWith: spanDom,

    atomic: true,

  });

  const cursor = instance?.getCursor();

  instance?.setCursor({ line: cursor?.line, ch: cursor?.ch });

}



function markFunc(mark: any) {

  const instance = cmRef.value?.cminstance;

  instance?.replaceRange(mark.value, mark.start, mark.end);

  const cursor = instance?.getCursor();

  instance?.setCursor({ line: cursor?.line, ch: cursor?.ch - 1 });

}



const onChange = (_val: string, cm: any) => {

  expressionData.value = cm.getValue();

};



const emits = defineEmits(["updateExpression"]);



function handleOk(done: (closed: boolean) => void) {

  done(true);

  visible.value = false;

  if (expressionData.value === "") {

    expressionData.label = "";

  } else if (expressionData.label === "") {

    expressionData.label = "函数";

  }

  emits("updateExpression", expressionData.label, expressionData.value);

}

</script>



<style lang="scss">

.code-container {

  border-radius: 5px;

  display: flex;

  max-height: 500px;

  &-variable,

  &-func {

    width: 200px;

    padding: 8px;



    border: 1px solid oklch(0.92 0.004 286.32);

    overflow-y: auto;



    .left-title {

      margin-bottom: 8px;

    }

    .operator-container-col {

      overflow-y: auto;

    }

    .operator-container-col-tree {

      .arco-tree {

        margin-top: 10px;

        -webkit-user-select: none;

        /* Chrome, Safari, Opera */

        -moz-user-select: none;

        /* Firefox */

        -ms-user-select: none;

        /* Internet Explorer/Edge */

        user-select: none;



        .arco-tree-node-disabled-selectable {

          font-weight: 600;



          span {

            color: #4b4b4b !important;

          }

        }



        .arco-tree-node-is-leaf {

          span {

            color: #4b4b4b !important;

          }

        }



        .arco-tree-node-disabled-selectable .arco-tree-node-title {

          color: var(--color-text-1);

          cursor: pointer;

        }

      }



      .arco-tree-node:hover {

        background-color: var(--color-fill-2);

      }

    }

  }



  &-edit {

    margin-left: 10px;

    width: calc(100% - 420px);

    border: 1px solid oklch(0.92 0.004 286.32);

  }



  .codemirror {

    padding: 5px;

  }



  .CodeMirror {

    font-size: 14px;

    color: #3a3432;

    // background: #f7f7f7;



    .cm-variable,

    .cm-property {

      color: #01a252 !important;

    }



    .cm-number {

      color: #a16a94;

    }



    .exp-variable {

      background: #eaf2fd;

      color: #2f7deb !important;

      display: inline-block;

      font-size: 12px;

      margin: 0 2px;

      padding: 3px 5px;

      border-radius: 5px;

    }

  }



  .CodeMirror-cursor {

    height: auto !important;

  }



  .CodeMirror-gutters {

    display: none;

  }



  .CodeMirror-linebackground {

    background: none;

  }

}

</style>


