import { nanoid } from 'nanoid';
/**
 * 根据类型生成随机id
 * @param _type 类型
 * @returns 随机id
 */
function generate(_type?: string) {
  const uuid = 'fxxxxxxxxxxxxxx'.replace(/[x]/g, function(c) {
    const r = Math.random() * 10 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});
return uuid;
}

function HashCode(hashLength?: number) {
  const uuid = "a" + Array.from(Array(Number(hashLength) || 15), () => Math.floor(Math.random() * 36).toString(36) ).join("")
return uuid;
}
function flowId(){
  return nanoid(10)
}
 function uuid() {
  return Math.random().toString(36).substr(3, 16)
}
// eslint-disable-next-line import/prefer-default-export
export { generate,HashCode,flowId,uuid };
