import basic from './formComponents/basic.js'
import advanced from './formComponents/advanced/index.js'
import extended from './formComponents/extended.js'
import business from './formComponents/business.js'
import layout from './formComponents/layout.js'
import decoration from './formComponents/decoration.js'

// 表单属性【右面板】
export const formConf = {
    width: 90,
    size: 'medium',
    widthType: 'scale',
    subIp: true,
    subText: '提交表单',
    btnPosition: 2,
    subEnable: true,
    formData: {},
    titleStyle: "vertical",
    draftBox: true,
    "label-col-props": { span: 3, offset: 0 },
    "wrapper-col-props": { span: 21, offset: 0 },
    "label-align": 'right',
    "disabled": false,
    "auto-label-width": false,
    "scroll-to-first-error": false,
    formList: [],
    formLogics: [],
    formEvents: [],
}

// 保留组件分类和顺序，供现有设计器入口使用。
export const inputComponents = [basic, advanced, extended, business, layout, decoration]







