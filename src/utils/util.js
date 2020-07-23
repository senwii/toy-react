
const regular = /^on(?<eventname>[A-Z]\w+)$/

export function isListenerProp(propName) {
    return propName.match(regular) !== null
}

export function getPropEventName(propName) {
    const { groups } = propName.match(regular) || {}
    let { eventname = '' } = groups || {}
    eventname = eventname.replace(/^([A-Z])/, char => char.toLowerCase())
    return eventname
}
