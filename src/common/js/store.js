/**
 * 说明
 * saveLocalStorage对应的是{id:{key:value}}存入window.localStorage.__user__
 * getLocalStorage对应的是获取window.localStorage.__user__[id][key]
 */
export function saveLocalStorage (id, key, value) {
  let user = window.localStorage.__user__;
  if (!user) {
    user = {};
    user[id] = {};
    user[id][key] = value;
  } else {
    user = JSON.parse(user);
    if (!user[id]) {
      user[id] = {}
    }
    user[id][key] = value;
  }
  window.localStorage.__user__ = JSON.stringify(user);
}

export function getLocalStorage (id, key, df) {
  let user = window.localStorage.__user__;
  if (!user) {
    return df;
  }
  user = JSON.parse(user)[id];
  if (!user) {
    return df;
  }
  user = user[key];
  if (!user) {
    return df;
  }
  return user;
}
