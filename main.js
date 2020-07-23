import ToyReact, { Component } from './src/ToyReact.js'

const T = (props) => {
    return <div>
        {
            props.children
        }
    </div>
}

class P extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return <div name="P">
            {this.props.children}
        </div>
    }
}

const a = (
    <div>
        <P id="p">
            <T>p-a</T>
            23
        </P>
        <T name="a">
            <span>T</span>
            <span>T</span>
            {
                [1, 2, 3].map(v => v)
            }
        </T>
        <p>1</p>
        <span>222</span>
        <br />
        24232s
        {
            [1, 2, 3].map(v => <span>{v}</span>)
        }
    </div>
)

ToyReact.render(a, document.body)
