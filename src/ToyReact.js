import { PATCH_TYPES } from './utils/constant.js'
import { isListenerProp, getPropEventName } from './utils/util.js'

/**
 * 从虚拟DOM(树)生成真实DOM(树)
 * @param {Vdom} vdom
 */
function createElement(vdom) {
    // 字符串 || 数字
    if (vdom instanceof String || vdom instanceof Number) {
        const element = document.createTextNode(vdom)
        vdom.el = element
        return element
    }

    const { tag, props, children } = vdom
    const element = document.createElement(tag)
    vdom.el = element // TODO Symbol值不能挂载属性，需要换一种关联vdom和el的方式
    setProps(element, props)
    children.map(createElement).map(element.appendChild.bind(element))

    return element
}

/**
 * 设置DOM元素属性
 * @param {Element} element
 * @param {Props} props
 */
function setProps(element, props) {
    for (let i in props) {
        const isListener = isListenerProp(i)
        // 事件监听函数
        if (isListener) {
            const eventname = getPropEventName(i)
            element.addEventListener(eventname, props[i])

        // className
        } else if (i === 'className') {
            element.setAttribute('class', props[i])

        // style
        } else if (i === 'style') {
            const value = props[i]
            const type = typeof value
            // 样式字符串
            if (type === 'string') {
                element.style = style

            // 样式对象
            } else if (type === 'object') {
                for (let i in value) {
                    element.style[i] = value[i]
                }
            }
        } else {
            element.setAttribute(i, props[i])
        }
    }
}

/**
 * 对比Vdom，生成patch
 * @param {Vdom} oldVdom
 * @param {Vdom} newVdom
 */
function diffVdom(oldVdom, newVdom) {
    // 新增
    if (oldVdom === undefined) {
        return {
            type: PATCH_TYPES.CREATE_NODE,
            newVdom,
        }
    }

    // 删除
    if (newVdom === undefined) {
        return {
            type: PATCH_TYPES.REMOVE_NODE,
            oldVdom,
        }
    }

    // 替换
    const oldType = typeof oldVdom.valueOf()
    const newType = typeof newVdom.valueOf()
    if (oldType !== newType || ((oldType === 'string' || oldType === 'number') && oldVdom.valueOf() !== newVdom.valueOf()) || oldVdom.tag !== newVdom.tag) {
        return {
            type: PATCH_TYPES.REPLACE_NODE,
            oldVdom,
            newVdom,
        }
    }

    // 更新
    if (oldVdom.tag) {
        const propsDiff = diffProps(oldVdom, newVdom)
        const childrenDiff = diffChildren(oldVdom, newVdom)
        const hasChange = propsDiff.length > 0 || childrenDiff.length > 0

        if (hasChange) {
            return {
                type: PATCH_TYPES.UPDATE_NODE,
                oldVdom,
                newVdom,
                props: propsDiff,
                children: childrenDiff,
            }
        }
    }

    // 没有变化
    newVdom.el = oldVdom.el
}

/**
 * 对比Props差异
 * @param {Vdom} oldVdom
 * @param {Vdom} newVdom
 */
function diffProps(oldVdom, newVdom) {
    const patches = []
    const oldProps = oldVdom.props
    const newProps = newVdom.props
    const allProps = {
        ...oldProps,
        ...newProps,
    }

    for (let i in allProps) {
        const oldValue = oldProps[i]
        const newValue = newProps[i]

        // 移除
        if (newValue === undefined) {
            patches.push({
                type: PATCH_TYPES.REMOVE_PROP,
                key: i,
                value: oldValue,
            })

        // 更新
        } else if (oldValue !== newValue) {
            patches.push({
                type: PATCH_TYPES.UPDATE_PROP,
                key: i,
                value: newValue,
            })
        }
    }

    return patches
}

/**
 * 对比子元素差异
 * @param {Vdom} oldVdom
 * @param {Vdom} newVdom
 */
function diffChildren(oldVdom, newVdom) {
    const patches = []
    const oldChildren = oldVdom.children
    const newChildren = newVdom.children
    const length = Math.max(oldChildren.length, newChildren.length)

    for (let i=0; i<length; i++) {
        const patch = diffVdom(oldChildren[i], newChildren[i])

        if (patch) {
            // 记录子元素位置
            patch.index = i
            patches.push(patch)
        }
    }

    return patches
}

/**
 * 应用DOM补丁
 * @param {Node} parent
 * @param {Patch} patchObj
 */
function patchElement(parent, patchObj) {
    if (!patchObj) {
        return
    }

    const { type } = patchObj

    switch(type) {
        case PATCH_TYPES.CREATE_NODE: {
            const { newVdom } = patchObj
            parent.appendChild(createElement(newVdom))
            return
        }
        case PATCH_TYPES.REMOVE_NODE: {
            const { oldVdom } = patchObj
            parent.removeChild(oldVdom.el)
            return
        }
        case PATCH_TYPES.REPLACE_NODE: {
            const { oldVdom, newVdom } = patchObj
            parent.replaceChild(createElement(newVdom), oldVdom.el)
            return
        }
        case PATCH_TYPES.UPDATE_NODE: {
            const { props, children, oldVdom, newVdom } = patchObj
            const element = oldVdom.el
            newVdom.el = element
            // 更新属性
            patchProps(element, props)
            // 更新子元素
            children.map(childPatch => {
                patchElement(element, childPatch)
            })
        }
    }
}

/**
 * 应用Props补丁
 * @param {Node} element
 * @param {Patch[]} propsList
 */
function patchProps(element, propsList) {
    if (!propsList) {
        return
    }

    propsList.map(patchObj => {
        const { type, key, value } = patchObj
        switch(type) {
            case PATCH_TYPES.REMOVE_PROP: {
                const isListener = isListenerProp(key)
                if (isListener) {
                    const eventname = getPropEventName(key)
                    element.removeEventListener(eventname, value)
                } else {
                    element.removeAttribute(key)
                }
                return
            }
            case PATCH_TYPES.UPDATE_PROP: {
                setProps(element, {
                    [key]: value,
                })
                return
            }
        }
    })
}

const ToyReact = {
    createVdom(tag, props, ...children) {
        const isFunction = tag instanceof Function
        const isClassComp = isFunction && Component.isPrototypeOf(tag)
        const isFuncComp = isFunction && !isClassComp

        // 字符串||数字，转成对象
        children = children.reduce(function fn(memo, child) {
            const type = Object.prototype.toString.call(child).slice(8, -1)
            switch (type) {
                case 'String':
                    memo.push(new String(child))
                    break
                case 'Number':
                    memo.push(new Number(child))
                    break
                case 'Array':
                    memo.push(child.reduce(fn, []))
                    break
                case 'Boolean':
                    // memo.push(new String(child))
                    break
                case 'Null':
                    memo.push(new String(''))
                    break
                case 'Undefined':
                    memo.push(new String(''))
                    break
                default:
                    memo.push(child)
                    break
            }
            return memo
        }, [])

        // 函数组件
        if (isFuncComp) {
            const passprops = {
                ...(props || {}),
                children: children.flat().map(i => i),
            }
            return tag(passprops)

        // 类组件
        } else if (isClassComp) {
            const passprops = {
                ...(props || {}),
                children: children.flat().map(i => i),
            }
            return Component.render(new tag(passprops))

        // 普通DOM
        } else {
            return {
                tag,
                props: props || {},
                children: children.flat().map(i => i),
            }
        }
    },
    render(vdom, root) {
        // 从虚拟DOM创建实DOM
        const element = createElement(vdom)
        root.appendChild(element)
    }
}

function Component(props) {
    this.props = props || {}
    this.state = {}

    this.setState = props => {
        this.state = {
            ...this.state,
            ...props,
        }
        Component.update(this)
    }
}
/**
 * 渲染类组件
 * ! 类组件的render方法只能通过 Component.render调用
 */
Component.render = comp => comp.vdom = comp.render()
Component.update = comp => {
    const oldVdom = comp.vdom
    const newVdom = Component.render(comp)
    comp.vdom = newVdom
    const patchObj = diffVdom(oldVdom, newVdom)
    const parent = oldVdom.el.parentNode
    patchElement(parent, patchObj)
}

export default ToyReact
export {
    Component,
}
