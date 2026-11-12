import dayjs from 'dayjs';
export default {
    getMolde(rule) {
        if (rule.symbol == '==' || rule.symbol == '=') {
            return rule.extra.config == rule.extra.input
        } else if (rule.symbol == 'string.contains') {
            if (rule.extra.input) {
                if (
                    rule.extra.input.indexOf(rule.extra.config) !== -1 || rule.extra.config.indexOf(rule.extra.input) !== -1
                ) {
                    return true
                } else {
                    return false
                }
            } else {
                return false
            }

        } else if (rule.symbol == '!string.contains') {
            if (rule.extra.input) {
                if (
                    rule.extra.input.indexOf(rule.extra.config) !== -1 || rule.extra.config.indexOf(rule.extra.input) !== -1
                ) {
                    return false
                } else {
                    return true
                }
            } else {
                return false
            }


        } else if (rule.symbol == '>') {
            return rule.extra.input > rule.extra.config
        } else if (rule.symbol == '<') {
            return rule.extra.input < rule.extra.config
        } else if (rule.symbol == '<=') {
            return rule.extra.input <= rule.extra.config
        } else if (rule.symbol == '>=') {
            return rule.extra.input >= rule.extra.config
        } else if (rule.symbol == '!=') {
            return rule.extra.config != rule.extra.input
        } else if (rule.symbol == 'number.rang') {
            if (rule.extra.input !== '') {
                return rule.extra.config[0] <= rule.extra.input && rule.extra.config[1] >= rule.extra.input
            } else {
                return false
            }

        } else if (rule.symbol == 'isNull') {
            if (typeof (rule.extra.input) == 'object') {
                if (rule.extra.input == null) {
                    return true
                } else if (rule.extra.input == 0) {
                    return true
                } else {
                    return false
                }
            } else {
                return rule.extra.input ? false : true
            }

        } else if (rule.symbol == 'isNotNull') {
            console.log(rule.extra.input)
            if (typeof (rule.extra.input) == 'object') {
                if (rule.extra.input == null || rule.extra.input == '') {
                    return false
                } else if (rule.extra.input == 0) {
                    return false
                } else {
                    return true
                }
            } else {
                return rule.extra.input ? true : false
            }

        } else if (rule.symbol == 'in' || rule.symbol == 'include') {
            return IsInArray(rule.extra.config, rule.extra.input)
        } else if (rule.symbol == 'notIn' || rule.symbol == '!include') {
            return !(IsInArray(rule.extra.config, rule.extra.input))
        } else if (rule.symbol == 'like') {
            return rule.extra.config == rule.extra.input
        } else if (rule.symbol == 'notLike') {
            return rule.extra.config != rule.extra.input
        } else if (rule.symbol == 'time.rang') {
            let config1 = dayjs(rule.extra.config[0]).format(rule.extra.format)
            let config2 = dayjs(rule.extra.config[1]).format(rule.extra.format)
            let input = dayjs(rule.extra.input).format(rule.extra.format)
            return checkAuditTime(config1, config2, input)
        } else if (rule.symbol == 'time.eq') {
            if (rule.extra.input) {
                let startDate = new Date(rule.extra.config).getTime()
                return dayjs(startDate).format(rule.extra.format) == dayjs(rule.extra.input).format(rule.extra.format)
            } else {
                return false
            }
        } else if (rule.symbol == 'time.ne') {
            if (rule.extra.input) {
                let startDate = new Date(rule.extra.config).getTime()
                return dayjs(startDate).format(rule.extra.format) !== dayjs(rule.extra.input).format(rule.extra.format)
            } else {
                return false
            }

        } else if (rule.symbol == 'time.le') {
            if (rule.extra.input) {
                let startDate = new Date(rule.extra.config).getTime()
                let endDate = new Date(rule.extra.input).getTime()
                return startDate >= endDate
            } else {
                return false
            }
        } else if (rule.symbol == 'time.ge') {
            if (rule.extra.input) {
                let startDate = new Date(rule.extra.config).getTime()
                let endDate = new Date(rule.extra.input).getTime()
                return endDate >= startDate
            } else {
                return false
            }
        } else if (rule.symbol == 'collect.all') {

            if (rule.extra.input) {
                let item = []
                rule.extra.config.map(v => {
                    item.push(IsInArray(rule.extra.input, v))
                })
                return !(IsInArray(item, false))

            }

        } else if (rule.symbol == 'collect.ne') {
            if (rule.extra.input) {
                let item = []
                rule.extra.config.map(v => {
                    item.push(IsInArray(rule.extra.input, v))
                })
                return (IsInArray(item, false))

            }

        } else if (rule.symbol == 'collect.one') {
            if (rule.extra.input) {
                let item = []
                rule.extra.config.map(v => {
                    item.push(IsInArray(rule.extra.input, v))
                })
                return IsInArray(item, true)

            }
        } else if (rule.symbol == 'collect.eq') {
            if (rule.extra.input) {
                let item = []
                rule.extra.input.map(v => {
                    item.push(IsInArray(rule.extra.config, v))
                })
                return item.length > 0 ? !(IsInArray(item, false)) : false

            }
        } else if (rule.symbol == 'between') {
            if (rule.extra.input) {
                if (rule.extra.config.type == 'DAY') {
                    let a = dayjs().subtract(rule.extra.config.num, 'd').valueOf();
                    let b = dayjs(rule.extra.input).valueOf()
                    let c = dayjs().valueOf()
                    return a <= b && b <= c
                } else if (rule.extra.config.type == 'MONTH') {

                    let a = dayjs().subtract(rule.extra.config.num, 'M').valueOf();
                    let b = dayjs(rule.extra.input).valueOf()
                    let c = dayjs().valueOf()
                    return a <= b && b <= c
                } else if (rule.extra.config.type == 'YEAR') {
                    let a = dayjs().subtract(rule.extra.config.num, 'y').valueOf();
                    let b = dayjs(rule.extra.input).valueOf()
                    let c = dayjs().valueOf()
                    return a <= b && b <= c
                }
            } else {
                return false
            }
        }
    },
}

function IsInArray(arr, val) {
    var testStr = ',' + arr.join(",") + ",";
    return testStr.indexOf("," + val + ",") != -1;
}
function checkAuditTime(startTime, endTime, date) {

    // 获取开始时间、结束时间、现在时间的时间戳
    let startDate = new Date(startTime).getTime()
    let endDate = new Date(endTime).getTime()
    let nowDate = new Date(date).getTime()
    const s = startDate > endDate // 判断开始时间否大于结束时间

    if (s) [startDate, endDate] = [endDate, startDate] // 若开始时间否大于结束时间则交换值

    // 判断现在的时间是否在开始时间和结束时间之间，若s为true则结果取反
    if (nowDate > startDate && nowDate < endDate) {
        return s ? false : true
    } else {
        return s ? true : false
    }
}