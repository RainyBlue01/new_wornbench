export interface ExpressionMenu {
  label: string;
  showLabel?: string;
  func?: string;
  children?: Array<ExpressionMenu>;
}

export const expressionMenuData: ExpressionMenu[] = [
  {
    label: '当前用户',
    children: [
      { label: 'ID', showLabel: '当前用户 / ID', func: 'getCurrentUser("id")' },
      {
        label: '昵称',
        showLabel: '当前用户 / 昵称',
        func: 'getCurrentUser("nickname")',
      },
      {
        label: '用户名',
        showLabel: '当前用户 / 用户名',
        func: 'getCurrentUser("username")',
      },
      {
        label: '电子邮箱',
        showLabel: '当前用户 / 电子邮箱',
        func: 'getCurrentUser("email")',
      },
      {
        label: '手机号码',
        showLabel: '当前用户 / 手机号码',
        func: 'getCurrentUser("phone")',
      },
      {
        label: '性别',
        showLabel: '当前用户 / 性别',
        func: 'getCurrentUser("sex")',
      },
      {
        label: '状态',
        showLabel: '当前用户 / 状态',
        func: 'getCurrentUser("state")',
      },
      {
        label: '角色',
        children: [
          {
            label: 'ID',
            showLabel: '当前用户 / 角色 / ID',
            func: 'getCurrentUserRole("id")',
          },
          {
            label: '角色编码',
            showLabel: '当前用户 / 角色 / 角色编码',
            func: 'getCurrentUserRole("code")',
          },
          {
            label: '角色名称',
            showLabel: '当前用户 / 角色 / 角色名称',
            func: 'getCurrentUserRole("name")',
          },
        ],
      },
      {
        label: '机构',
        children: [
          {
            label: 'ID',
            showLabel: '当前用户 / 机构 / ID',
            func: 'getCurrentUserDept("id")',
          },
          {
            label: '机构编码',
            showLabel: '当前用户 / 机构 / 机构编码',
            func: 'getCurrentUserDept("code")',
          },
          {
            label: '机构名称',
            showLabel: '当前用户 / 机构 / 机构名称',
            func: 'getCurrentUserDept("name")',
          },
        ],
      },
    ],
  },
  {
    label: '日期函数',
    children: [
      { label: '当前日期时间', func: 'getDatetime()' },
      { label: '当前日期', func: 'getDate()' },
      { label: '当前时间', func: 'getTime()' },
    ],
  },
  {
    label: '常用工具',
    children: [
      { label: '生成uuid', func: 'createUuid()' },
      { label: '生成nanoid', func: 'createNanoid()' },
    ],
  },
];
