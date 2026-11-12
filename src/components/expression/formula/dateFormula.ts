import dayjs from "dayjs";
import { Parser } from "expr-eval";
// import { ExpressionFunc } from '../formula';
interface ExpressionFunc {
  label: string;
  value?: string;
  selectable?: boolean;
  desc?: string;
  type?: string;
  children?: Array<ExpressionFunc>;
}

function getDatetime(format = "yyyy-MM-dd HH:mm:ss") {
  const now = dayjs();
  format = format.replace("yyyy", "YYYY").replace("dd", "DD");
  return now.format(format);
}

function getDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTime() {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

type TimeUnit = "ms" | "s" | "min" | "h" | "d" | "w" | "m" | "y";
const unitMap: { [key in TimeUnit]: number } = {
  ms: 1,
  s: 1000,
  min: 1000 * 60,
  h: 1000 * 60 * 60,
  d: 1000 * 60 * 60 * 24,
  w: 1000 * 60 * 60 * 24 * 7,
  m: 1000 * 60 * 60 * 24 * 30,
  y: 1000 * 60 * 60 * 24 * 365,
};

async function getTimeDiff(startDate: any, endDate: any, unit: TimeUnit) {
  const realStartDate = getValidDate(await startDate);
  const realEndDate = getValidDate(await endDate);
  if (!realStartDate || !realEndDate) {
    return "";
  }
  const timestampDiff = Math.abs(
    realEndDate.getTime() - realStartDate.getTime(),
  );
  const result = (timestampDiff / unitMap[unit]) * 1.0;
  const number = Number(result.toFixed(2));
  return number;
}

async function getIntervalTimeDiff(intervalDate: any, unit: TimeUnit) {
  let realIntervalDate = await intervalDate;
  if (!realIntervalDate) {
    return "";
  }

  if (typeof realIntervalDate === "string") {
    realIntervalDate = JSON.parse(realIntervalDate);
  }
  return getTimeDiff(realIntervalDate.start, realIntervalDate.end, unit);
}

/**
 * 计算天数（按半天/一天规则）
 * 规则：
 * 整个区间不超过一分钟返回0；分段不重复应用一分钟门槛。
 * 1. 每日开始时间至中午12点有有效时段 → 算半天（0.5）
 * 2. 中午12点至午夜有有效时段 → 再算半天（0.5），全天合计一天
 * 午夜至配置的每日开始时间不计入，跨天逐日累加，每日最多一天。
 */
async function getDayCalculate(
  startDate: any,
  endDate: any,
  nextDayStartTime: string,
) {
  const realStartDate = getValidDate(await startDate);
  const realEndDate = getValidDate(await endDate);
  if (!realStartDate || !realEndDate) {
    return "";
  }

  if (realEndDate.getTime() - realStartDate.getTime() <= 60 * 1000) {
    return 0;
  }

  const startTime = /^(\d{1,2}):(\d{2})$/.exec(nextDayStartTime);
  if (!startTime) return "";
  const nextDayHour = Number(startTime[1]);
  const nextDayMinute = Number(startTime[2]);
  if (nextDayHour > 23 || nextDayMinute > 59) return "";

  let total = 0;
  const day = new Date(realStartDate);
  day.setHours(0, 0, 0, 0);

  while (day < realEndDate) {
    const dayStart = new Date(day);
    dayStart.setHours(nextDayHour, nextDayMinute, 0, 0);
    const midnight = new Date(day);
    midnight.setDate(midnight.getDate() + 1);
    const noon = new Date(day);
    noon.setHours(12, 0, 0, 0);

    const activeStart = Math.max(realStartDate.getTime(), dayStart.getTime());
    const activeEnd = Math.min(realEndDate.getTime(), midnight.getTime());
    if (Math.min(activeEnd, noon.getTime()) > activeStart) {
      total += 0.5;
    }
    if (activeEnd > Math.max(activeStart, noon.getTime())) {
      total += 0.5;
    }

    day.setDate(day.getDate() + 1);
  }

  return total;
}

/**
 * 根据区间时间计算天数
 */
async function getIntervalDayCalculate(
  intervalDate: any,
  nextDayStartTime: string,
) {
  let realIntervalDate = await intervalDate;
  if (!realIntervalDate) {
    return "";
  }

  if (typeof realIntervalDate === "string") {
    realIntervalDate = JSON.parse(realIntervalDate);
  }
  return getDayCalculate(
    realIntervalDate.start,
    realIntervalDate.end,
    nextDayStartTime,
  );
}

export const dateFunc: ExpressionFunc = {
  label: "日期函数",
  value: "dateFunc",
  selectable: false,
  children: [
    {
      label: "获取当前日期时间",
      value: "getDatetime()",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>获取当前日期时间 </span></div>" +
        "<div class='func-use'> <span class='title'>用法1:</span> <span class='context'>getDatetime()</span> </div>" +
        "<div class='func-use'> <span class='title'>用法2:</span> <span class='context'>getDatetime('格式')</span> </div>" +
        "<div class='func-arg'> <span class='title'>格式:</span> <span class='context'>yyyy-MM-dd HH:mm:ss 年-月-日 时:分:秒、 yyyy-MM-dd HH:mm 年-月-日 时:分、 yyyy-MM-dd 年-月-日、 yyyy-MM 年-月</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>当前操作系统日期时间</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>2002-10-02 17:20:15</span> </div>" +
        "</div>",
    },
    {
      label: "获取当前日期",
      value: "getDate()",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>获取当前日期 </span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>getDate()</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>当前操作系统日期</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>2002-10-02</span> </div>" +
        "</div>",
    },
    {
      label: "获取当前时间",
      value: "getTime()",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>获取当前时间 </span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>getTime()</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>当前操作系统时间</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>17:20:15</span> </div>" +
        "</div>",
    },
    {
      label: "获取时间差",
      value: "getTimeDiff('开始时间','结束时间','差值单位')",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>获取时间差 </span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>getTimeDiff('开始时间','结束时间','单位')</span> </div>" +
        "<div class='func-arg'> <span class='title'>开始时间:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-arg'> <span class='title'>结束时间:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-arg'> <span class='title'>差值单位:</span> " +
        "<span class='context'>ms(毫秒)、s(秒)、min(分钟)、h(小时)、d(天)、w(周)、m(月)、y(年)</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>时间差</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>getTimeDiff('2025-11-10','2025-11-11','单位')</span> </div>" +
        "</div>",
    },
    {
      label: "获取区间时间差",
      value: "getIntervalTimeDiff('区间时间','差值单位')",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>获取区间时间差 </span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>getIntervalTimeDiff('区间范围','单位')</span> </div>" +
        "<div class='func-arg'> <span class='title'>区间范围:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-arg'> <span class='title'>差值单位:</span> " +
        "<span class='context'>ms(毫秒)、s(秒)、min(分钟)、h(小时)、d(天)、w(周)、m(月)、y(年)</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>时间差</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>getIntervalTimeDiff({'start':'2025-11-10','end':'2025-11-11'},'单位')</span> </div>" +
        "</div>",
    },
    {
      label: "计算天数",
      value: "getDayCalculate('开始时间','结束时间','第二天开始时间')",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>整个区间不超过1分钟返回0；超过1分钟时，每日开始时间至中午12点有有效时段计半天(0.5)，中午12点至午夜有有效时段再计半天(0.5)，每日最多一天，午夜至每日开始时间不计入，分段不重复应用一分钟门槛 </span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>getDayCalculate('开始时间','结束时间','第二天开始时间')</span> </div>" +
        "<div class='func-arg'> <span class='title'>开始时间:</span> <span class='context'>固定值或变量，如 '2025-11-10 09:00:00'</span> </div>" +
        "<div class='func-arg'> <span class='title'>结束时间:</span> <span class='context'>固定值或变量，如 '2025-11-10 18:00:00'</span> </div>" +
        "<div class='func-arg'> <span class='title'>第二天开始时间:</span> <span class='context'>时间字符串，如 '08:00' 表示第二天从8点开始</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>天数（number），如 0.5、1、1.5</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>getDayCalculate('2025-11-10 09:00','2025-11-10 18:00','08:00') 返回 1; getDayCalculate('2025-11-10 09:00','2025-11-10 11:00','08:00') 返回 0.5</span> </div>" +
        "</div>",
    },
    {
      label: "计算区间天数",
      value: "getIntervalDayCalculate('区间时间','第二天开始时间')",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>根据区间时间（含start/end）按半天/一天规则计算天数 </span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>getIntervalDayCalculate('区间范围','第二天开始时间')</span> </div>" +
        "<div class='func-arg'> <span class='title'>区间范围:</span> <span class='context'>固定值或变量，如 {'start':'2025-11-10 09:00','end':'2025-11-10 18:00'}</span> </div>" +
        "<div class='func-arg'> <span class='title'>第二天开始时间:</span> <span class='context'>时间字符串，如 '08:00' 表示第二天从8点开始</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>天数（number），如 0.5、1、1.5</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>getIntervalDayCalculate({'start':'2025-11-10 09:00','end':'2025-11-10 18:00'},'08:00') 返回 1</span> </div>" +
        "</div>",
    },
  ],
};

export function register(parser: Parser) {
  parser.functions.getDatetime = getDatetime;
  parser.functions.getDate = getDate;
  parser.functions.getTime = getTime;
  parser.functions.getTimeDiff = getTimeDiff;
  parser.functions.getIntervalTimeDiff = getIntervalTimeDiff;
  parser.functions.getDayCalculate = getDayCalculate;
  parser.functions.getIntervalDayCalculate = getIntervalDayCalculate;
}
// 第一步：统一转换为Date对象（方便精准计算月/年）
const getValidDate = (time: any) => {
  let date;
  if (time instanceof Date) {
    date = new Date(time); // 复制对象避免修改原数据
  } else if (typeof time === "string") {
    // 兼容常见字符串格式：YYYY-MM-DD HH:mm:ss、YYYY-MM-DD、ISO格式
    const timeStr = time.replace("T", " ").replace("Z", "");
    date = new Date(timeStr);
  } else {
    // throw new Error(`不支持的时间类型：${typeof time}，仅支持Date对象和字符串`);
    return "";
  }

  // 校验是否为有效日期
  if (isNaN(date.getTime())) {
    // throw new Error(
    //   `时间解析失败：${time}，请使用 YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss 格式`,
    // );
    return "";
  }
  return date;
};
