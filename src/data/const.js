/*
 * @Date: 2023-03-29 15:25:37
 * @LastEditors: StavinLi 495727881@qq.com
 * @LastEditTime: 2023-03-29 15:52:38
 * @FilePath: /Workflow-Vue3/src/utils/const.js
 */

export let bgColors = {
  'START': '57, 111, 255',
  'END': '87, 106, 149',
  'INPUT': '255, 148, 62',
  'APPROVE': '50, 150, 250'
}
export let bgColorsFlow = {
  1: '#22c55e', // 已完成
  2: 'rgb(var(--primary-6))', // 进行中
  3: '#cbd5e1', // 待处理
}
export let placeholderList = ["发起人", "审核人", "抄送人"];
export const Components = [
  // {
  //   id: '',
  //   code: '',
  //   "@class": "com.joyou.module.plugin.behavior.PluginNode",
  //   name: "插件节点",
  //   type: "PLUGIN",
  //   pluginId: '',
  //   pluginName: '',
  //   pluginIcon: '',
  //   extensionCode: '',
  //   extensionName: '',
  //   extensionDescription: '',
  //   inputParams: [],
  //   outputParams: [],
  //   inputMappings: {},
  //   outputMappings: {},
  //   inputMappingEnabled: true,
  //   outputMappingEnabled: true,
  //   executionMode: 'sync',
  //   failureAction: 'block',
  //   attribute: [
  //     {
  //       field: 'name',
  //       label: '节点名称',
  //       type: 'input',
  //     },
  //     {
  //       field: 'pluginConfig',
  //       label: '插件配置',
  //       type: 'pluginConfig',
  //     },
  //   ]
  // },
  {
    id: '',
    code: '',
    name: '填写节点',
    type: 'INPUT',
    "@class": "com.joyou.workflow.engine.api.model.definition.impl.InputNode",
    download: true,
    print: true,
    revoke: true,
    processLog: true,
    fieldControl: [],
    extendConfig: {
      messageExtendPlan: []
    },
    "candidate": {
      "deptIds": [

      ],
      "postIds": [

      ],
      "roleIds": [

      ],
      "userIds": [

      ],
      "dynamic": {
        "deptFields": [

        ],
        "userFields": [

        ],
        "roleIds": [

        ],
        "userIds": [

        ],
        "deptLeader": {
          "deptField": "",
          "userField": "",
          "applyUser": true,
          "levels": [

          ]
        },
        "chargeLeader": {
          "deptField": "",
          "userField": "",
          "applyUser": true,
          "levels": [

          ]
        },
        "applyUser": true
      }
    },
    pass: {
      config: true,
      enable: true,
      label: "通过",
      comment: false,
      signature: false,
      seal: false
    },
    delegate: {
      config: true,
      enable: true,
      label: "转交",
      comment: false,
      signature: false,
      seal: false
    },
    attribute: [
      {
        field: 'name',
        label: '节点名称',
        type: 'input',
      },
      {
        field: 'candidate',
        label: '填写人',
        type: 'selectPerson',
      },
      {
        field: 'download',
        label: '可下载（pdf,word）',
        type: 'checkbox',
      },
      {
        field: 'print',
        label: '可打印',
        type: 'checkbox',
      },
      {
        field: 'processLog',
        label: '查看审批日志及流程',
        type: 'checkbox',
      },
      {
        field: 'revoke',
        label: '可撤回',
        type: 'checkbox',
      },
      {
        field: 'inputButton',
        label: '节点操作',
        type: 'inputButton',
      },
      {
        field: 'fieldControl',
        label: '当前节点可见内容',
        type: 'fieldControl',
      },
    ]
  },
  {
    id: '',
    code: '',
    "@class": "com.joyou.workflow.engine.api.model.definition.impl.ApproveNode",
    type: 'APPROVE',
    name: '审批节点',
    download: true,
    print: true,
    processLog: true,
    fieldControl: [
    ],
    approveOption: 0,
    extendConfig: {
      timeoutPlan: [],
      messageExtendPlan: []
    },

    "candidate": {
      "deptIds": [

      ],
      "postIds": [

      ],
      "roleIds": [

      ],
      "userIds": [

      ],
      "dynamic": {
        "deptFields": [

        ],
        "userFields": [

        ],
        "roleIds": [

        ],
        "userIds": [

        ],
        "deptLeader": {
          "deptField": "",
          "userField": "",
          "applyUser": true,
          "levels": [

          ]
        },
        "chargeLeader": {
          "deptField": "",
          "userField": "",
          "applyUser": true,
          "levels": [

          ]
        },
        "applyUser": true
      }
    },
    graduallyCandidate: {
      level: null,
    },
    approveBlank: false,
    approveBlankOption: {
      option: 0,
      userId: [],
      userList: {}
    },
    autoApprove: true,
    "autoApproveOption": {
      "autoOption": 0
    },
    revoke: true,
    rule: {
      "option": 0,
      "ratio": false,
      "symbol": "",
      "rate": ''
    },
    "pass": {
      config: true,
      "enable": true,
      "label": "通过",
      "comment": true,
      "signature": true,
      "seal": true
    },
    "refuse": {
      config: true,
      "enable": true,
      "label": "拒绝",
      "comment": true,
      "signature": true,
      "seal": true
    },
    "delegate": {
      config: true,
      "enable": true,
      "label": "转交",
      "comment": true,
      "signature": true,
      "seal": true
    },
    back: {
      config: true,
      enable: true,
      label: "退回",
      back: 0,
      resubmit: 0
    },
    attribute: [
      {
        field: 'name',
        label: '节点名称',
        type: 'input',
      },
      {
        field: 'approveOption',
        label: '审批规则',
        type: 'select',
        options: [{
          label: '常规审批', value: 0
        }, {
          label: '逐级审批', value: 1
        },]
      },
      {
        field: 'candidate',
        label: '审批人',
        type: 'selectPerson',
      },
      {
        field: 'download',
        label: '可下载（pdf,word）',
        type: 'checkbox',
      },
      {
        field: 'print',
        label: '可打印',
        type: 'checkbox',
      },
      {
        field: 'processLog',
        label: '查看审批日志及流程',
        type: 'checkbox',
      },
      {
        field: 'approveBlank',
        label: '审批人为空时',
        type: 'approveBlank',
      },
      {
        field: 'autoApprove',
        label: '自动审批',
        type: 'autoApprove',
      },
      {
        field: 'revoke',
        label: '可撤回',
        type: 'checkbox',
      },
      {
        field: 'rule',
        label: '审批办法',
        type: 'rule',
      },
      {
        field: 'button',
        label: '审批操作',
        type: 'button',
      },
      {
        field: 'fieldControl',
        label: '当前节点可见内容',
        type: 'fieldControl',
      },
    ]
  },

  {
    id: '',
    code: '',
    "@class": "com.joyou.workflow.engine.api.model.definition.impl.NoticeNode",
    type: 'NOTICE',
    name: '抄送节点',
    download: true,
    print: true,
    processLog: true,
    candidate: {
    },
    fieldControl: [],
    extendConfig: {
      messageExtendPlan: []
    },
    attribute: [
      {
        field: 'name',
        label: '节点名称',
        type: 'input',
      },
      {
        field: 'candidate',
        label: '抄送人',
        type: 'selectPerson',
      },
      {
        field: 'download',
        label: '可下载（pdf,word）',
        type: 'checkbox',
      },
      {
        field: 'print',
        label: '可打印',
        type: 'checkbox',
      },
      {
        field: 'processLog',
        label: '查看审批日志及流程',
        type: 'checkbox',
      },
      {
        field: 'fieldControl',
        label: '当前节点可见内容',
        type: 'fieldControl',
      },
    ]
  },
  {
    id: '',
    code: '',
    "@class": "com.joyou.workflow.engine.api.model.definition.impl.BranchNode",
    type: 'BRANCH',
    name: '业务分支',
    option: 1,
    "rules": [
    ]
  },
  {
    id: '',
    code: '',
    "@class": "com.joyou.module.connector.execution.ConnectorNode",
    name: "业务连接",
    type: "CONNECTOR",
    connectorId: '',
    sceneId: '',
    input: [
    ],
    enableOutput: true,
    output: [
    ],
    attribute: [
      {
        field: 'name',
        label: '节点名称',
        type: 'input',
      },
      {
        field: 'connectorId',
        label: '连接器',
        type: 'connectorId',
      },

    ]
  }
]
const win = window
export const nodeData = {
  id: '',
  code: '',
  "@class": "com.joyou.workflow.engine.api.model.definition.impl.StartNode",
  name: '开始节点',
  type: 'START',
  download: true,
  print: true,
  processLog: true,
  revoke: true,
  fieldControl: [],
  extendConfig: {
    messageExtendPlan: []
  },
  childNode: {
    id: "",
    "code": "",
    "@class": "com.joyou.workflow.engine.api.model.definition.impl.EndNode",
    "name": "结束节点",
    extendConfig: {
      messageExtendPlan: []
    },
    "type": 'END'
  },
  attribute: [
    {
      field: 'name',
      label: '节点名称',
      type: 'input',
    },
    {
      field: 'download',
      label: '可下载（pdf,word）',
      type: 'checkbox',
    },
    {
      field: 'print',
      label: '可打印',
      type: 'checkbox',
    },
    {
      field: 'processLog',
      label: '查看审批日志及流程',
      type: 'checkbox',
    },
    {
      field: 'revoke',
      label: '可撤回',
      type: 'checkbox',
    },
    {
      field: 'fieldControl',
      label: '当前节点可见内容',
      type: 'fieldControl',
    },
  ]
};
export let setTypes = [
  { value: 1, label: '指定成员' },
  { value: 2, label: '主管' },
  { value: 4, label: '发起人自选' },
  { value: 5, label: '发起人自己' },
  { value: 7, label: '连续多级主管' },
]

export let selectModes = [
  { value: 1, label: '选一个人' },
  { value: 2, label: '选多个人' },
]

export let selectRanges = [
  { value: 1, label: '全公司' },
  { value: 2, label: '指定成员' },
  { value: 3, label: '指定角色' },
]

export let optTypes = [
  { value: '1', label: '小于' },
  { value: '2', label: '大于' },
  { value: '3', label: '小于等于' },
  { value: '4', label: '等于' },
  { value: '5', label: '大于等于' },
  { value: '6', label: '介于两个数之间' },
]

export let opt1s = [
  { value: '<', label: '<' },
  { value: '≤', label: '≤' },
]
