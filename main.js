import ToyReact, { Component } from './src/ToyReact.js'

const T = () => <div>TTT<span>4232<div>dsds</div></span></div>

class P extends Component {
    constructor() {
        super()
    }

    render() {
        return <div name="P">
            a<span>b</span>c<T/>
        </div>
    }
}

const a = (
    <div name="d">
        <span name="s">233
            <div>dccdscs</div>
            <T name="T" />
            <P />
        </span>
    </div>
)

ToyReact.render(a, document.body)