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
        this.state = {
            x: 1,
        }
        this.onClick = (this.props.onClick || (() => {})).bind(this)
    }

    render() {
        return <div name="P" onClick={this.onClick}>
            {this.state.x}
            {this.props.children}
            {this.state.x === 15 && 666}
        </div>
    }
}

class Square extends Component {
    constructor(props) {
        super(props)
        this.state = {
            value: null,
        }
        this.onClick = this.onClick.bind(this)
    }

    onClick() {
        if (!this.props.onClick) {
            return
        }
        if (this.state.value === null) {
            const value = this.props.onClick()
            this.setState({
                value,
            })
        }
    }

    render() {
        return (
            <span
                style={{
                    width: '20px',
                    height: '20px',
                    display: 'inline-block',
                    border: '1px solid',
                    lineHeight: '20px',
                    textAlign: 'center',
                    verticalAlign: 'top',
                }}
                onClick={this.onClick}
            >
                {this.state.value}
            </span>
        )
    }
}

let round = 0
const tags = ['O', 'X']
const getTag = round => tags[round % tags.length]
const a = (
    <div>
        <Square onClick={() => getTag(round ++)} />
        <Square onClick={() => getTag(round ++)} />
        <Square onClick={() => getTag(round ++)} />
        <br />

        <Square onClick={() => getTag(round ++)} />
        <Square onClick={() => getTag(round ++)} />
        <Square onClick={() => getTag(round ++)} />
        <br />

        <Square onClick={() => getTag(round ++)} />
        <Square onClick={() => getTag(round ++)} />
        <Square onClick={() => getTag(round ++)} />
        <br />

        <P id="p" onClick={function() {
            console.log(1)
            this.setState({
                x: this.state.x +1,
            })
        }}>
            <T>p-a</T>
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
