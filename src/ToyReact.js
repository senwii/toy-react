/**
 * 从虚拟DOM(树)生成真实DOM(树)
 * @param {Vdom} vdom
 */
function createElement(vdom) {
    // 字符串 || 数字
    if (typeof vdom === 'string' || typeof vdom === 'number') {
        return document.createTextNode(vdom)
    }

    const { tag, props, children } = vdom
    const element = document.createElement(tag)
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
        element.setAttribute(i, props[i])
    }
}

const ToyReact = {
    createVdom(tag, props, ...children) {
        const isFunction = tag instanceof Function
        const isClassComp = isFunction && Component.isPrototypeOf(tag)
        const isFuncComp = isFunction && !isClassComp

        // 函数组件
        if (isFuncComp) {
            const passprops = {
                ...(props || {}),
                children: (children || []).flat().map(i => i),
            }
            return tag(passprops)

            // 类组件
        } else if (isClassComp) {
            const passprops = {
                ...(props || {}),
                children: (children || []).flat().map(i => i),
            }
            return (new tag(passprops)).render()

            // 普通DOM
        } else {
            return {
                tag,
                props: props || {},
                children: (children || []).flat(),
            }
        }
    },
    render(vdom, root) {
        const element = createElement(vdom)
        root.appendChild(element)
    }
}

function Component(props) {
    this.props = props || {}
}

export default ToyReact
export {
    Component,
}
