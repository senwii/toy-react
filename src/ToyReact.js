const ToyReact = {
    createElement(type, attributes, ...children) {
        const Type = Object.prototype.toString.call(type).slice(8, -1)
        let element
        switch(Type) {
            case 'String':
                element = document.createElement(type)
                break
            case 'Function':
                const isClass = ToyReact.Component.isPrototypeOf(type)
                if (isClass) {
                    const instance = new type
                    element = instance.render()
                } else {
                    element = type()
                }
                break
        }
        // console.log(arguments) // TODO
        for (let key in (attributes || {})) {
            element.setAttribute(key, attributes[key])
        }

        children.map(child => {
            if (typeof child === 'string') {
                element.innerHTML += child
            } else {
                element.appendChild(child)
            }
        })

        return element
    },
    Component: function() {
    },
    render(vdom, element) {
        // vdom.mountTo(element)
        element.appendChild(vdom)
    }
}

export default ToyReact
export const Component = ToyReact.Component