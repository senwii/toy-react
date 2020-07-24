
const regular = /^on(?<eventname>[A-Z]\w+)$/

export function isListenerProp(propName) {
    return propName.match(regular) !== null
}

export function getPropEventName(propName) {
    const { groups } = propName.match(regular) || {}
    let { eventname = '' } = groups || {}
    // TODO：事件名统一转成小写，包含大写字母的事件不支持
    eventname = eventname.toLowerCase()
    return eventname
}
