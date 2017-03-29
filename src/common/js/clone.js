export function clone (obj) {
  let tmp;
  if (obj instanceof Array) {
    tmp = [];
    let len = obj.length;
    for (let i = 0; i < len; i++) {
      tmp[i] = clone(obj[i]);
    }
    return tmp;
  } else if (obj instanceof Object) {
    tmp = {};
    for (let k in obj) {
      tmp[k] = clone(obj[k]);
    }
    return tmp;
  } else {
    return obj;
  }
}
