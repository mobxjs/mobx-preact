# mobx-inferno

[![Join the chat at https://gitter.im/mobxjs/mobx](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/mobxjs/mobx?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![#mobservable channel on reactiflux discord](https://img.shields.io/badge/discord-%23mobx%20%40reactiflux-blue.svg)](https://discord.gg/0ZcbPKXt5bYAa2J1)

This is a fork of [mobx-react](https://github.com/mobxjs/mobx-react) for [Inferno](https://github.com/trueadm/inferno)

<p>&nbsp;</p>
<p align="center"><img src="http://infernojs.org/img/inferno.png" width="150px"></p>
<p>&nbsp;</p>

Package with inferno component wrapper for combining Inferno with mobx.
Exports the `observer` decorator and some development utilities.
For documentation, see the [mobx](https://mobxjs.github.io/mobx) project.
This package supports Inferno.

## Installation

`npm install mobx-inferno --save`

```javascript
import {observer} from 'mobx-inferno';
```

This package provides the bindings for MobX and Inferno.
See the [official documentation](http://mobxjs.github.io/mobx/intro/overview.html) for how to get started.

## API documentation

### observer(componentClass)

Function (and decorator) that converts a Inferno component definition, Inferno component class or stand-alone render function into a reactive component.
See the [mobx](https://mobxjs.github.io/mobx/refguide/observer-component.html) documentation for more details.

```javascript
import Inferno from 'inferno';
import createClass from 'inferno-create-class';
import {observer} from "mobx-inferno";

// ---- ES5 syntax ----

const TodoView = observer(createClass({
    displayName: "TodoView",
    render() {
        return <div>{this.props.todo.title}</div>   
    }
}));

// ---- ES6 syntax ----
import Inferno from 'inferno';
import Component from 'inferno-component';
import {observer} from "mobx-inferno";

@observer 
class TodoView extends Component {
    render() {
        return <div>{this.props.todo.title}</div>   
    }   
}

// ---- or just use a stateless component function: ----
import Inferno from 'inferno';
import {observer} from "mobx-inferno";

const TodoView = observer(props => (
    <div>{props.todo.title}</div>
))
```

It is possible to set a custom `shouldComponentUpdate`, but in general this should be avoid as MobX will by default provide a highly optimized `shouldComponentUpdate` implementation, based on `PureRenderMixin`.
If a custom `shouldComponentUpdate` is provided, it is consulted when the props changes (because the parent passes new props) or the state changes (as a result of calling `setState`), but if an observable used by the rendering is changed, the component will be re-rendered and `shouldComponent` is not consulted. 

### `componentWillReact` (lifecycle hook)

React components usually render on a fresh stack, so that makes it often hard to figure out what _caused_ a component to re-render.
When using `mobx-react` you can define a new life cycle hook, `componentWillReact` (pun intended) that will be triggered when a component will be scheduled to re-render because
data it observes has changed. This makes it easy to trace renders back to the action that caused the rendering.

```javascript
import Inferno from 'inferno';
import Component from 'inferno-component';
import {observer} from "mobx-inferno";

@observer 
class TodoView extends Component {
    componentWillReact() {
        console.log("I will re-render, since the todo has changed!");    
    }

    render() {
        return <div>{this.props.todo.title}</div>   
    }   
}
```

* `componentWillReact` doesn't take arguments
* `componentWillReact` won't fire before the initial render (use `componentWillMount` instead)
* `componentWillReact` won't fire when receiving new props or after `setState` calls (use `componentWillUpdate` instead)


## FAQ

**Should I use `observer` for each component?**

You should use `observer` on every component that displays observable data. 
Even the small ones. `observer` allows components to render independently from their parent and in general this means that
the more you use `observer`, the better the performance become.
The overhead of `observer` itself is neglectable.
See also [Do child components need `@observer`?](https://github.com/mobxjs/mobx/issues/101)


