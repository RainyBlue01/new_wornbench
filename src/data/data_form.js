let dataFormText = {
	type: 1,
	default: [{
		type: '==',
		value: 'EQ',
		name: '等于'
	},
	{
		type: '!=',
		value: 'NE',
		name: '不等于'
	},
	{
		type: 'include',
		value: 'IN',
		name: '等于其中之一'
	},
	{
		type: '!include',
		value: 'NOT_IN',
		name: '不等于其中之一'
	},
	{
		type: 'string.contains',
		value: 'LIKE',
		name: '包含'
	},
	{
		type: '!string.contains',
		value: 'NOT_LIKE',
		name: '不包含'
	},
	{
		type: 'isNull',
		value: 'IS_NULL',
		name: '为空'
	}
	]
}
let dataFormTextarea = {
	type: 2,
	default: [
		{
			type: 'string.contains',
			value: 'LIKE',
			name: '包含'
		},
		{
			type: '!string.contains',
			value: 'NOT_LIKE',
			name: '不包含'
		},
		{
			type: 'isNull',
			value: 'IS_NULL',
			name: '为空'
		},
		{
			type: 'isNotNull',
			value: 'NOT_NULL',
			name: '不为空'
		}
	]
}

let dataFormRadio = {
	type: 3,
	default: [
		{
			type: '==',
			value: 'EQ',
			name: '等于'
		},
		{
			type: '!=',
			value: 'NE',
			name: '不等于'
		},
		{
			type: 'include',
			value: 'IN',
			name: '等于其中之一'
		},
		{
			type: '!include',
			value: 'NOT_IN',
			name: '不等于其中之一'
		},
		{
			type: 'isNull',
			value: 'IS_NULL',
			name: '为空'
		}, {
			type: 'isNotNull',
			value: 'NOT_NULL',
			name: '不为空'
		}
	]
}

let dataFormCheckbox = {
	type: 4,
	default: [
		{
			type: 'collect.all',
			value: 'ALL_LIKE',
			name: '全部包含'
		},
		{
			type: 'collect.one',
			value: 'IN',
			name: '包含其中之一'
		},
		{
			type: 'collect.eq',
			value: 'EQ',
			name: '等于'
		},
		{
			type: 'isNull',
			value: 'IS_NULL',
			name: '为空'
		},
		{
			type: 'isNotNull',
			value: 'NOT_NULL',
			name: '不为空'
		}
	]
}

let dataFormSelect = {
	type: 5,
	default: [
		{
			type: '==',
			value: 'EQ',
			name: '等于'
		},
		{
			type: '!=',
			value: 'NE',
			name: '不等于'
		},
		{
			type: 'include',
			value: 'IN',
			name: '等于其中之一'
		},
		{
			type: '!include',
			value: 'NOT_IN',
			name: '不等于其中之一'
		},
		{
			type: 'isNull',
			value: 'IS_NULL',
			name: '为空'
		},
		{
			type: 'isNotNull',
			value: 'NOT_NULL',
			name: '不为空'
		}
	]
}
let dataFormFile = {
	type: 6,
	default: [
		{
			type: 'isNull',
			value: 'IS_NULL',
			name: '为空'
		},
		{
			type: 'isNotNull',
			value: 'NOT_NULL',
			name: '不为空'
		}
	]
}

let dataFormArea = {
	type: 7,
	default: [
		{
			type: 'collect.eq',
			value: 'EQ',
			name: '属于'
		},
		{
			type: 'collect.ne',
			value: 'NE',
			name: '不属于'
		},
		{
			type: 'isNull',
			value: 'IS_NULL',
			name: '为空'
		},
		{
			type: 'isNotNull',
			value: 'NOT_NULL',
			name: '不为空'
		}
	]
}
let dataFormLocation = {
	type: 16,
	default: [
		{
			type: 'collect.eq',
			value: 'EQ',
			name: '属于'
		},
		{
			type: 'collect.ne',
			value: 'NE',
			name: '不属于'
		},
		{
			type: 'isNull',
			value: 'IS_NULL',
			name: '为空'
		},
		{
			type: 'isNotNull',
			value: 'NOT_NULL',
			name: '不为空'
		}
	]
}
let dataFormNum = {
	type: 8,
	default: [
		{
			type: '==',
			value: 'EQ',
			name: '等于'
		},
		{
			type: '!=',
			value: 'NE',
			name: '不等于'
		},
		{
			type: '>',
			value: 'GT',
			name: '大于'
		},
		{
			type: '>=',
			value: 'GE',
			name: '大于等于'
		},
		{
			type: '<',
			value: 'LT',
			name: '小于'
		},
		{
			type: '<=',
			value: 'LE',
			name: '小于等于'
		},
		{
			type: 'number.rang',
			value: 'BETWEEN',
			name: '范围'
		},
		{
			type: 'isNull',
			value: 'IS_NULL',
			name: '为空'
		},
		{
			type: 'isNotNull',
			value: 'NOT_NULL',
			name: '不为空'
		}
	]
}

let dataFormDate = {
	type: 9,
	default: [
		{
			type: 'time.eq',
			value: 'EQ',
			name: '等于'
		},
		{
			type: 'time.ne',
			value: 'NE',
			name: '不等于'
		},
		{
			type: 'time.ge',
			value: 'GE',
			name: '大于等于'
		},
		{
			type: 'time.le',
			value: 'LE',
			name: '小于等于'
		},
		{
			type: 'isNull',
			value: 'IS_NULL',
			name: '为空'
		},
		{
			type: 'isNotNull',
			value: 'NOT_NULL',
			name: '不为空'
		},
		{
			type: 'time.rang',
			value: 'BETWEEN',
			name: '范围'
		},
		// {
		// 	type: 'between',
		// 	value: 'DYNAMIC_BETWEEN',
		// 	name: '动态范围'
		// }
	]
}
let dataDateYear = {
	type: 9,
	default: [
		{
			type: 'time.eq',
			value: 'EQ',
			name: '等于'
		},
		{
			type: 'time.ne',
			value: 'NE',
			name: '不等于'
		},
		{
			type: 'time.ge',
			value: 'GE',
			name: '大于等于'
		},
		{
			type: 'time.le',
			value: 'LE',
			name: '小于等于'
		},
		{
			type: 'isNull',
			value: 'IS_NULL',
			name: '为空'
		},
		{
			type: 'isNotNull',
			value: 'NOT_NULL',
			name: '不为空'
		},
	]
}
let dataFormTime = {
	type: 15,
	default: [
		{
			type: 'time.eq',
			value: 'EQ',
			name: '等于'
		},
		{
			type: 'time.ne',
			value: 'NE',
			name: '不等于'
		},
		{
			type: 'time.ge',
			value: 'GE',
			name: '大于等于'
		},
		{
			type: 'time.le',
			value: 'LE',
			name: '小于等于'
		},
		{
			type: 'isNull',
			value: 'IS_NULL',
			name: '为空'
		},
		{
			type: 'isNotNull',
			value: 'NOT_NULL',
			name: '不为空'
		},
		{
			type: 'time.rang',
			value: 'BETWEEN',
			name: '范围'
		},
	]
}
let dataFormStartEndDate = {
	type: 10,
	default: [
		{
			type: '=',
			value: 'LIKE',
			name: '包含'
		},
		{
			type: '<>',
			value: 'NOT_LIKE',
			name: '不包含'
		},
		{
			type: '>=',
			value: 'GE',
			name: '大于等于'
		},
		{
			type: '<=',
			value: 'LE',
			name: '小于等于'
		},
		{
			type: 'isNull',
			value: 'IS_NULL',
			name: '为空'
		},
		{
			type: 'notNull',
			value: 'NOT_NULL',
			name: '不为空'
		},
		{
			type: 'between',
			value: 'BETWEEN',
			name: '范围'
		},
		// {
		// 	type: 'between',
		// 	value: 'DYNAMIC_BETWEEN',
		// 	name: '动态范围'
		// }
	]
}
let dataFormSubForm = {
	type: 15,
	default: [
		{
			type: 'isNull',
			value: 'IS_NULL',
			name: '为空'
		},
		{
			type: 'isNotNull',
			value: 'NOT_NULL',
			name: '不为空'
		},
	]
}
let dataFormVarchart = {
	type: 'VARCHAR',
	default: [{
		type: '=',
		value: 'EQ',
		name: '等于'
	},
	{
		type: '<>',
		value: 'NE',
		name: '不等于'
	},
	{
		type: 'in',
		value: 'IN',
		name: '等于其中之一'
	},
	{
		type: 'notIn',
		value: 'NOT_IN',
		name: '不等于其中之一'
	},
	{
		type: 'like',
		value: 'LIKE',
		name: '包含'
	},
	{
		type: 'notLike',
		value: 'NOT_LIKE',
		name: '不包含'
	}
	]
}

let dataFormTimeStamp = {
	type: 'TIMESTAMP',
	default: [
		{
			type: '==',
			value: 'EQ',
			name: '等于'
		},
		{
			type: '<>',
			value: 'NE',
			name: '不等于'
		},
		{
			type: '>=',
			value: 'GE',
			name: '大于等于'
		},
		{
			type: '<=',
			value: 'LE',
			name: '小于等于'
		},
		{
			type: 'isNull',
			value: 'IS_NULL',
			name: '为空'
		},
		{
			type: 'notNull',
			value: 'NOT_NULL',
			name: '不为空'
		},
		{
			type: 'between',
			value: 'BETWEEN',
			name: '范围'
		},
		{
			type: 'DYNAMIC_BETWEEN',
			value: 'DYNAMIC_BETWEEN',
			name: '动态范围'
		}
	]
}

let dataFormDoubleOrLong = {
	type: 'DOUBLE',
	default: [
		{
			type: '=',
			value: 'EQ',
			name: '等于'
		},
		{
			type: '<>',
			value: 'NE',
			name: '不等于'
		},
		{
			type: '>',
			value: 'GT',
			name: '大于'
		},
		{
			type: '>=',
			value: 'GE',
			name: '大于等于'
		},
		{
			type: '<',
			value: 'LT',
			name: '小于'
		},
		{
			type: '<=',
			value: 'LE',
			name: '小于等于'
		},
		{
			type: 'isNull',
			value: 'IS_NULL',
			name: '为空'
		},
		{
			type: 'notNull',
			value: 'NOT_NULL',
			name: '不为空'
		},
		{
			type: 'between',
			value: 'BETWEEN',
			name: '范围'
		},
	]
}

export const typeFlter = [
	{ label: '等于', value: 'EQ', method: 'eqStr' },
	{ label: '不等于', value: 'NE', method: 'neStr' },
	{ label: '等于其中之一', value: 'IN', method: 'includeAny' },
	{ label: '不等于其中之一', value: 'NOT_IN', method: '!includeAny' },
	{ label: '包含', value: 'LIKE', method: 'containStr' },
	{ label: '不包含', value: 'NOT_LIKE', method: 'notContainStr' },
	{ label: '为空', value: 'IS_NULL', method: 'isNull' },
	{ label: '不为空', value: 'NOT_NULL', method: 'isNotNull' },
	{ label: '大于', value: 'GT', method: 'gt' },
	{ label: '大于等于', value: 'GE', method: 'ge' },
	{ label: '小于', value: 'LT', method: 'lt' },
	{ label: '小于等于', value: 'LE', method: 'le' },
	{ label: '范围', value: 'BETWEEN', method: 'between' },
	{ label: '范围', value: 'DYNAMIC_BETWEEN', method: 'dynamicBetween' },
	{ label: '属于', value: 'string.contains', method: 'string.contains' },
	{ label: '不属于', value: '!string.contains', method: '!string.contains' },
]
export const selectTypeFlter = [
	{
		method: 'includeAll',
		value: 'ALL_LIKE',
		name: '全部包含'
	},
	{ label: '不等于其中之一', value: 'NOT_IN', method: '!includeAny' },
	{
		method: 'includeAny',
		value: 'IN',
		name: '包含其中之一'
	},
	{
		method: 'eqArray',
		value: 'EQ',
		name: '等于'
	},
	{
		method: 'isNull',
		value: 'IS_NULL',
		name: '为空'
	},
	{
		method: 'isNotNull',
		value: 'NOT_NULL',
		name: '不为空'
	}

]
export const selectDateFlter = [
	{
		method: 'eqTime',
		value: 'EQ',
		name: '等于'
	},
	{
		method: 'neTime',
		value: 'NE',
		name: '不等于'
	},
	{
		method: 'geTime',
		value: 'GE',
		name: '大于等于'
	},
	{
		method: 'leTime',
		value: 'LE',
		name: '小于等于'
	},
	{
		method: 'isNull',
		value: 'IS_NULL',
		name: '为空'
	},
	{
		method: 'isNotNull',
		value: 'NOT_NULL',
		name: '不为空'
	},
	{
		method: 'intervalTime',
		value: 'BETWEEN',
		name: '范围'
	},
	{
		method: 'intervalTime',
		value: 'BETWEEN',
		name: '范围'
	},
	{
		method: 'dynamicIntervalTime',
		value: 'DYNAMIC_BETWEEN',
		name: '动态范围'
	}
]
export const numTypeFlter = [
	{ label: '等于', value: 'EQ', method: '==' },
	{ label: '不等于', value: 'NE', method: '!=' },
	{ label: '大于', value: 'GT', method: '>' },
	{ label: '大于等于', value: 'GE', method: '>=' },
	{ label: '小于', value: 'LT', method: '<' },
	{ label: '小于等于', value: 'LE', method: '<=' },
	{ label: '范围', value: 'BETWEEN', method: 'intervalNum' },
	{ label: '为空', value: 'IS_NULL', method: 'isNull' },
	{ label: '不为空', value: 'NOT_NULL', method: 'isNotNull' },

]
export const optionsTimes = [
	{
		value: 1,
		label: '1天'
	}, {
		value: 2,
		label: '3天'
	}, {
		value: 3,
		label: '5天'
	}, {
		value: 4,
		label: '7天'
	},
	{
		value: 5,
		label: '15天'
	},
	{
		value: 6,
		label: '1月'
	}, {
		value: 7,
		label: '3月'
	}, {
		value: 8,
		label: '6月'
	},
	{
		value: 9,
		label: '1年'
	}, {
		value: 10,
		label: '2年'
	}, {
		value: 11,
		label: '3年'
	}
]
export function getDataForm(val) {
	if (val == 'INPUT' || val == 'PHONE' || val == 'ID_CARD' || val == 'EMAIL' || val == 'DATE_INTERVAL' || val == 'TIME_INTERVAL' || val == 'URL') {
		return dataFormText
	} else if (val == 'TEXTAREA') {
		return dataFormTextarea
	} else if (val == 'RADIO' || val == 'SWITCH' || val == 'USER' || val == 'DEPT') {
		return dataFormRadio
	} else if (val == 'CHECKBOX' || val == 'USER_MULTIPLE' || val == 'DEPT_MULTIPLE' || val == 'SELECT_MULTIPLE') {
		return dataFormCheckbox
	} else if (val == 'SELECT') {
		return dataFormSelect
	} else if (val == 'ATTACH' || val == 'PICTURE') {
		return dataFormFile
	} else if (val == 'ADDRESS' || val == 16) {
		return dataFormArea
	} else if (val == 'LOCATION') {
		return dataFormLocation
	} else if (val == 'NUMBER' || val == 'RATE' || val == 'MONEY') {
		return dataFormNum
	} else if (val == 'DATE') {
		return dataFormDate
	} else if (val == 'TIME') {
		return dataFormTime
	} else if (val == 'SUBFORM') {
		return dataFormSubForm
	} else if (val == 'yyyy') {
		return dataDateYear
	}


}
export function setDataForm(val, item, formList) {
	if (val == 'expression') {
		item.custom = true
		item.condition = ''
		item.value = ''
	} else {
		item.custom = false
		formList.map((v) => {
			if (v.id == val) {
				item.inputType = v.type
				item.inputName = v.title
				let a = getDataForm(v.format == 'yyyy' ? 'yyyy' : v.type)
				item.condition = ''
				item.value = ''
				if (v.type == 'USER' || v.type == 'USER_MULTIPLE' || v.type == 'DEPT' || v.type == 'DEPT_MULTIPLE') {
					item.condition = ''
					item.value = ''
					item.row = v
				}
				if (v.type == 'RADIO' || v.type == 'CHECKBOX' || v.type == 'SELECT' || v.type == 'SELECT_MULTIPLE' || v.type == 'SWITCH') {
					item.default = v.type == 'SWITCH'
						? [
							{ label: '开启', value: v.props?.['checked-value'] ?? true },
							{ label: '关闭', value: v.props?.['unchecked-value'] ?? false }
						]
						: v.props.options
					item.condition = ''
					item.value = v.type == 'RADIO' || v.type == 'SELECT' || v.type == 'SWITCH' ? '' : []
				}
				if (v.type == 'TIME' || v.type == 'DATE' || v.type == 'DATERANGE') {
					item.format = v.props.format
				}
				if (v.type == 'ADDRESS') {
					item.default = v.props.level
				}

				// 防御性检查：确保 a 和 a.default 存在
				item.rulesOption = (a && a.default) ? a.default : []
				if (v.type == 'LOCATION' && item.rulesOption.length > 0) {
					item.rulesOption.map(v1 => {
						if (v1.name == '属于') {
							v1.value = 'string.contains'
						} else if (v1.name == '不属于') {
							v1.value = '!string.contains'
						}
					})
				}
			}
		})

	}
}
export function setFormValue(items) {
	if (items.inputType && (items.inputType == 'ADDRESS' || items.inputType == 'LOCATION' || items.inputType == 'SELECT_MULTIPLE' || items.inputType == 'CHECKBOX' || ((items.inputType == 'INPUT' || items.inputType == 'SELECT' || items.inputType == 'RADIO') && (items.condition == 'IN' || items.condition == 'NOT_IN')))) {
		items.value = ''
		setTimeout(() => {
			items.value = []
		},)
	} else {
		items.value = ''
	}
}
export function setDataFormList(list, DataFormList) {
	if (Array.isArray(list)) {
		list.map(item => {
			if (item.type !== 'TITLE' && item.type !== 'SUBFORM' && item.type !== 'SPLIT_LINE' && item.type !== 'EDITORS' && item.type !== 'ROW' && item.type !== 'COL' && item.type !== 'BUTTON_CONNECTOR' &&
				item.type !== 'RELATION_DATA' &&
				item.type !== 'RELATION_QUERY' && item.type !== 'BUTTON_CONNECTOR') {
				if (!DataFormList.some(formItem => formItem.id === item.id)) {
					DataFormList.push(item)
				}
			}
			if (item.children && Array.isArray(item.children) && item.type !== 'SUBFORM') {
				setDataFormList(item.children, DataFormList)
			}
		})
	}
}
export function setReportFormList(list, DataFormList) {
	if (Array.isArray(list)) {
		list.map(item => {
			if (item.type !== 'TITLE' && item.type !== 'SPLIT_LINE' && item.type !== 'EDITORS' && item.type !== 'ROW' && item.type !== 'COL' && item.type !== 'RELATION_QUERY' && item.type !== 'BUTTON_CONNECTOR') {
				DataFormList.push(item)
			}
			if (item.children && Array.isArray(item.children) && item.type !== 'SUBFORM') {
				setReportFormList(item.children, DataFormList)
			}
		})
	}
}
export function removeSpecialChars(str) {
	if (!str) return '';
	return str.replace(/[@#\\]/g, '');
}
