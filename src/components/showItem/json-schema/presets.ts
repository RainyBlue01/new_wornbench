const baseContainerConfig = {
  type: 'inline',
  title: '',
  width: 720,
  triggerMode: 'button',
  triggerText: '打开表单',
  openEvents: ['manual'],
  closeOnSubmit: true,
  destroyOnClose: false,
}

const baseModuleConfig = {
  mode: 'single',
  modules: [],
}

const baseDataBridgeConfig = {
  bridges: [],
}

export const BOOKING_PRESET = {
  schema: {
    type: 'object',
    title: '预约组件',
    required: ['bookingItemId', 'bookingDate', 'contactName', 'contactPhone'],
    properties: {
      bookingItemId: { type: 'string', title: '预约项目' },
      bookingItemName: { type: 'string', title: '预约项目名称' },
      bookingDate: { type: 'string', title: '预约日期', format: 'date' },
      bookingSlot: { type: 'string', title: '预约时段' },
      contactName: { type: 'string', title: '联系人', maxLength: 20 },
      contactPhone: {
        type: 'string',
        title: '联系电话',
        pattern: '^1[3-9]\\d{9}$',
      },
      remark: {
        type: 'string',
        title: '备注',
        format: 'textarea',
        maxLength: 200,
      },
    },
  },
  uiSchema: {
    renderer: 'booking',
    contactName: {
      component: 'input',
      placeholder: '请输入联系人',
    },
    contactPhone: {
      component: 'input',
      placeholder: '请输入联系电话',
    },
    remark: {
      component: 'textarea',
      placeholder: '请输入备注说明',
    },
  },
  validationConfig: {
    enableJsonSchema: true,
    validateOnChange: true,
    validateOnSubmit: true,
    requiredMessage: '请完善预约信息',
    customRules: [],
  },
  logicConfig: {
    rules: [],
  },
  requestConfig: {
    enable: false,
    method: 'post',
    url: '',
    triggerEvents: ['manual'],
    watchFields: [],
    showManualButton: false,
    buttonText: '请求后台',
    params: {},
    headers: {},
    body: {},
    responsePath: '',
    outputMappings: [],
    successMessage: '',
    errorMessage: '请求失败，请检查后台配置',
  },
  businessFunctionConfig: {
    enable: false,
    functions: [],
    bookingConfig: {
      scopeType: 'future',
      scopeDays: 7,
      fixedDate: '',
      advanceDays: 0,
      items: [
        {
          id: 'booking_item_1',
          name: '预约项目1',
          desc: '可步行预约（可多选）',
          img: '',
          bookingType: 'time',
          maxPerSlot: 10,
          timeSlots: ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00'],
        },
        {
          id: 'booking_item_2',
          name: '预约项目2',
          desc: '默认预约项目示例',
          img: '',
          bookingType: 'time',
          maxPerSlot: 10,
          timeSlots: ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00'],
        },
      ],
    },
  },
  containerConfig: baseContainerConfig,
  moduleConfig: baseModuleConfig,
  dataBridgeConfig: baseDataBridgeConfig,
  defaultValue: {
    bookingItemId: '',
    bookingItemName: '',
    bookingDate: '',
    bookingSlot: '',
    contactName: '',
    contactPhone: '',
    remark: '',
  },
}

export const LEAVE_PRESET = {
  schema: {
    type: 'object',
    title: '请假组件',
    required: ['leaveType', 'leaveRange', 'leaveReason'],
    properties: {
      leaveType: {
        type: 'string',
        title: '请假类型',
        enum: ['affair', 'sick', 'other'],
        enumNames: ['事假', '病假', '其他'],
      },
      leaveRange: {
        type: 'array',
        title: '请假时间',
        format: 'dateRange',
        default: [],
      },
      leaveDuration: {
        type: 'number',
        title: '请假天数',
        minimum: 0,
        default: 0,
      },
      leaveReason: {
        type: 'string',
        title: '请假事由',
        format: 'textarea',
        maxLength: 300,
      },
      emergencyContact: {
        type: 'string',
        title: '紧急联系人',
        maxLength: 20,
      },
      emergencyPhone: {
        type: 'string',
        title: '紧急联系电话',
        pattern: '^1[3-9]\\d{9}$',
      },
    },
  },
  uiSchema: {
    renderer: 'leave',
    leaveType: {
      component: 'radio',
    },
    leaveRange: {
      component: 'dateRange',
      placeholder: '请选择请假时间',
    },
    leaveReason: {
      component: 'textarea',
      placeholder: '请输入请假事由',
    },
    emergencyContact: {
      component: 'input',
      placeholder: '请输入紧急联系人',
    },
    emergencyPhone: {
      component: 'input',
      placeholder: '请输入紧急联系电话',
    },
    leaveDuration: {
      component: 'number',
      placeholder: '自动计算请假天数',
    },
  },
  validationConfig: {
    enableJsonSchema: true,
    validateOnChange: true,
    validateOnSubmit: true,
    requiredMessage: '请完善请假信息',
    customRules: [],
  },
  logicConfig: {
    rules: [],
  },
  requestConfig: {
    enable: false,
    method: 'post',
    url: '',
    triggerEvents: ['manual'],
    watchFields: [],
    showManualButton: false,
    buttonText: '请求后台',
    params: {},
    headers: {},
    body: {},
    responsePath: '',
    outputMappings: [],
    successMessage: '',
    errorMessage: '请求失败，请检查后台配置',
  },
  businessFunctionConfig: {
    enable: false,
    functions: [],
    leaveConfig: {
      allowHalfDay: false,
      maxDays: 30,
      noticeText: '请选择请假时间并填写请假事由',
    },
  },
  containerConfig: baseContainerConfig,
  moduleConfig: baseModuleConfig,
  dataBridgeConfig: baseDataBridgeConfig,
  defaultValue: {
    leaveType: 'affair',
    leaveRange: [],
    leaveDuration: 0,
    leaveReason: '',
    emergencyContact: '',
    emergencyPhone: '',
  },
}

export const jsonSchemaPresetRegistry = {
  booking: BOOKING_PRESET,
  leave: LEAVE_PRESET,
}
