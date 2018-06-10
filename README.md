# mobx-preact

[![Build Status](https://travis-ci.org/mobxjs/mobx-preact.svg?branch=master)](https://travis-ci.org/mobxjs/mobx-preact)
[![npm](https://img.shields.io/npm/v/mobx-preact.svg)](http://npm.im/mobx-preact)

[MobX](https://mobxjs.github.io/mobx) bindings specifically for [Preact](https://preactjs.com/).

This package provides the bindings for MobX and Preact. It does not require `preact-compat`. The feature set of `mobx-preact` is a slightly slimmed down adaptation of `mobx-react`. The features available are reflected by this document. The features omitted are:

* [Global error handler with onError](https://github.com/mobxjs/mobx-react#global-error-handler-with-onerror)
* [Stuff to do with PropTypes](https://github.com/mobxjs/mobx-react#proptypes)
* [Dev Tools](https://github.com/mobxjs/mobx-react#internal-devtools-api)
* Typescript bindings

If you would like to see any of these features included please create an issue or PR.

## Installation

`npm install mobx-preact --save`

```javascript
import {observer} from 'mobx-preact';
```

### Other versions

Please note that major versions of `mobx-preact` are synced with major versions of `mobx`. Consult the following table
to ensure you install the right version of `mobx-preact` given the `mobx` version you are using:

| `mobx` version  | `mobx-preact` version |
| --------------- | --------------------- |
| 5.x             | 3.x (latest)          |
| 4.x             | 2.x                   |
| 3.x             | 1.x                   |

E.g. If using `mobx` v3:

`npm install mobx-preact@1 --save`

## API documentation

### observer(componentClass)

Function (and decorator) that converts a Preact component class or stand-alone render function into a reactive component, which tracks which observables are used by `render` and automatically re-renders the component when one of these values changes.
See the [MobX](https://mobxjs.github.io/mobx/refguide/observer-component.html) documentation for more details.

```javascript
import {Component} from 'preact';
import {observer} from "mobx-preact";

const TodoView  = observer(class TodoView extends Component {
    render() {
        return <div>{this.props.todo.title}</div>
    }
})

// ---- ESNext syntax with decorators ----

@observer
class TodoView extends Component {
    render() {
        return <div>{this.props.todo.title}</div>
    }
}

// ---- or just use a stateless component function: ----

const TodoView = observer(({todo}) => <div>{todo.title}</div>)
```

### `Observer`

`Observer` is a Preact component, which applies `observer` to an anonymous region in your component.
It takes as children a single, argumentless function which should return exactly one Preact component.
The rendering in the function will be tracked and automatically re-rendered when needed.
This can come in handy when needing to pass render function to external components or if you
dislike the `observer` decorator / function.

Example:

```javascript
class App extends Component {
  render() {
     return (
         <div>
            {this.props.person.name}
            <Observer>
                {() => <div>{this.props.person.name}</div>}
            </Observer>
        </div>
     )
  }
}

const person = observable({ name: "John" })

render(<App person={person} />, document.body)
person.name = "Mike" // will cause the Observer region to re-render
```

### Server Side Rendering with `useStaticRendering`

When using server side rendering, normal lifecycle hooks of Preact components are not fired, as the components are rendered only once.
Since components are never unmounted, `observer` components would in this case leak memory when being rendered server side.
To avoid leaking memory, call `useStaticRendering(true)` when using server side rendering. This makes sure the component won't try to Preact to any future data changes.

### Which components should be marked with `observer`?

The simple rule of thumb is: _all components that render observable data_.
If you don't want to mark a component as observer, for example to reduce the dependencies of a generic component package, make sure you only pass it plain data.

### Enabling decorators (optional)

Decorators are currently a stage-2 ESNext feature. How to enable them is documented [here](https://github.com/mobxjs/mobx#enabling-decorators-optional).

### Should I still use smart and dumb components?

See this [thread](https://www.reddit.com/r/reactjs/comments/4vnxg5/free_eggheadio_course_learn_mobx_react_in_30/d61oh0l).
TL;DR: the conceptual distinction makes a lot of sense when using MobX as well, but use `observer` on all components.

### About `shouldComponentUpdate`

It is possible to set a custom `shouldComponentUpdate`, but in general this should be avoided as MobX will by default provide a highly optimized `shouldComponentUpdate` implementation, based on `PureRenderMixin`.
If a custom `shouldComponentUpdate` is provided, it is consulted when the props changes (because the parent passes new props) or the state changes (as a result of calling `setState`),
but if an observable used by the rendering is changed, the component will be re-rendered and `shouldComponentUpdate` is not consulted.

### `componentWillReact` (lifecycle hook)

When using `mobx-preact` you can define a new life cycle hook, `componentWillReact` (pun intended) that will be triggered when a component is scheduled to be re-rendered because data it observes has changed. This makes it easy to trace renders back to the action that caused the rendering.

```javascript
import {observer} from "mobx-preact";

@observer class TodoView extends Component {
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

### `Provider` and `inject`

`Provider` is a component that can pass stores (or other stuff) using Preact's context mechanism to child components.
This is useful if you have things that you don't want to pass through multiple layers of components explicitly. If
`Provider` has multiple immediate children, they will be wrapped with a `div` element.

`inject` can be used to pick up those stores. It is a higher order component that takes a list of strings and makes those stores available to the wrapped component.

```javascript
@inject("color") @observer
class Button extends Component {
  render({ color }) {
    return (
      <button style={{background: color}}>
        {this.props.children}
      </button>
    );
  }
}

class Message extends Component {
  render({ text }) {
    return (
      <div>
        {text} <Button>Delete</Button>
      </div>
    );
  }
}

class MessageList extends Component {
  render() {
    const children = this.props.messages.map((message) =>
      <Message text={message.text} />
    );
    return <Provider color="red">
      {children}
    </Provider>;
  }
}
```

#### connect

In `mobx-react` (v4) you can inject and observe simultaneously with `observe`, but this is now deprecated for [these reasons](https://github.com/mobxjs/mobx-react/blob/master/CHANGELOG.md#using-observer-to-inject-stores-is-deprecated).

In version 0.x of `mobx-preact` this could be achieved using `connect` and *is* still supported for backwards compatibility:

```javascript
// MyComponent.js
import { h, Component } from 'preact';
import { connect } from 'mobx-preact';

@connect(['englishStore', 'frenchStore'])
class MyComponent extends Component {
    render({ englishStore, frenchStore }) {
        return <div>
            <p>{ englishStore.title }</p>
            <p>{ frenchStore.title }</p>
        </div>
    }
}

export default MyComponent
```

I'm not currently sure if it's worth deprecating `connect` in `mobx-preact` for the same reasons.

In `mobx-preact`, using `observe` to simultaneously inject and observe is not supported. You must use `connect` if you want to do this.

Notes:
* If a component asks for a store and receives a store via a property with the same name, the property takes precedence. Use this to your advantage when testing!
* Values provided through `Provider` should be final, to avoid issues like mentioned in [React #2517](https://github.com/facebook/Preact/issues/2517) and [React #3973](https://github.com/facebook/Preact/pull/3973), where optimizations might stop the propagation of new context. Instead, make sure that if you put things in `context` that might change over time, that they are `@observable` or provide some other means to listen to changes, like callbacks. However, if your stores will change over time, like an observable value of another store, MobX will warn you. To suppress that warning explicitly, you can use `suppressChangedStoreWarning={true}` as a prop at your own risk.
* When using both `@inject` and `@observer`, make sure to apply them in the correct order: `observer` should be the inner decorator, `inject` the outer. There might be additional decorators in between.
* The original component wrapped by `inject` is available as the `wrappedComponent` property of the created higher order component.
* For mounted component instances, the wrapped component instance is available through the `wrappedInstance` property (except for stateless components). *Currently not working*

#### Inject as function

A functional stateless component would look like:

```javascript
var Button = inject("color")(observer(({ color }) => {
    /* ... etc ... */
}))
```

#### Customizing inject

Instead of passing a list of store names, it is also possible to create a custom mapper function and pass it to inject.
The mapper function receives all stores as argument, the properties with which the components are invoked and the context, and should produce a new set of properties,
that are mapped into the original:

`mapperFunction: (allStores, props, context) => additionalProps`

The `mapperFunction` itself is tracked as well, so it is possible to do things like:

```javascript
const NameDisplayer = ({ name }) => <h1>{name}</h1>

const UserNameDisplayer = inject(
    stores => ({
        name: stores.userStore.name
    })
)(NameDisplayer)

const user = observable({
    name: "Noa"
})

const App = () => (
    <Provider userStore={user}>
        <UserNameDisplayer />
    </Provider>
)

render(<App />, document.body)
```

_N.B. note that in this *specific* case neither `NameDisplayer` nor `UserNameDisplayer` needs to be decorated with `observer`, since the observable dereferencing is done in the mapper function_

#### Testing store injection

It is allowed to pass any declared store in directly as a property as well. This makes it easy to set up individual component tests without a provider.

So if you have in your app something like:
```javascript
<Provider profile={profile}>
    <Person age={'30'} />
</Provider>
```

In your test you can easily test the `Person` component by passing the necessary store as prop directly:
```
const profile = new Profile()
const mountedComponent = mount(
   <Person age={'30'} profile={profile} />
)
```

Bear in mind that using shallow rendering won't provide any useful results when testing injected components; only the injector will be rendered. To test with shallow rendering, instantiate the `wrappedComponent` instead: `shallow(<Person.wrappedComponent />)`

## FAQ

**Should I use `observer` for each component?**

You should use `observer` on every component that displays observable data.
Even the small ones. `observer` allows components to render independently from their parent and in general this means that the more you use `observer`, the better the performance become. The overhead of `observer` itself is negligible.
See also [Do child components need `@observer`?](https://github.com/mobxjs/mobx/issues/101)
