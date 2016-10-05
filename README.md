# mobx-preact

This is a fork of [mobx-react](https://github.com/mobxjs/mobx-react) for [Preact](https://preactjs.com/)

This package provides the bindings for [MobX](https://mobxjs.github.io/mobx).

Exports the `connect`  (or `observer`) decorator and some development utilities.

## Installation

    npm install mobx-preact --save

## Dependencies

    npm install mobx --save

## API documentation

### connect(stores)(componentClass)

Function (and decorator) that converts a component into a reactive component.

`stores` is an array of strings/names of stores you passed to `Provider`.
These will be passed automatically to all components connected.

The more components you connect, the better Mobx can optimize rendering.
So connect as many components as you want!

See the [mobx](https://mobxjs.github.io/mobx/refguide/observer-component.html) documentation for more details.


```javascript
import { h, Component } from 'preact';
import { Provider, connect } from 'mobx-preact';
import { observable } from 'mobx';

const timeStore = observable({
    text: 'Current time here...'
})

class App extends Component {
    render() {
        return (
        <Provider time={timeStore}>
            <TestComponent/>
        </Provider>
        );
    }
}

@connect(['store'])
class TestComponent extends Component {
    componentDidMount() {
        const {time} = this.props;
        
        setInterval(() => {
            time.text = Date.now();
        }, 1000);
    }

    render({ time }) {
        return <p>Unix timestamp: {time.text}</p>;
    }
}

export default App;
```

```javascript
// If we don't need the stores but still want the component
// reactive, then we can omit the stores array

@connect
class TestComponent extends Component {
    //....
}
```

Alternatively if you prefer not to use decorators:

```javascript
class TestComponent extends Component {
    //...
}

export default connect(['time'])(App);
```

You cannot use decorators on stateless components, so wrap them like this:

```javascript
// With store injection
const TodoView = connect(['store'])(props => {
    return <p>Current time: {props.time.text}</p>
})

// Without injection but still reactive
const TodoView = connect(props => {
    return <p>Some prop we passed on: {props.something}</p>
})
```



It is possible to set a custom `shouldComponentUpdate`, but in general this should be avoided as MobX will by default provide a highly optimized `shouldComponentUpdate` implementation based on `PureRenderMixin`.


For Mobx documentation, see the [mobx](https://mobxjs.github.io/mobx) project.
