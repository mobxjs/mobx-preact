# mobx-preact

[![MIT](https://img.shields.io/npm/l/preact.svg?style=flat-square)](https://github.com/developit/preact/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/v/mobx-preact.svg)](http://npm.im/mobx-preact)

<a href="https://preactjs.com">
<img alt="Preact" title="Preact" src="https://cdn.rawgit.com/developit/b4416d5c92b743dbaec1e68bc4c27cda/raw/3235dc508f7eb834ebf48418aea212a05df13db1/preact-logo-trans.svg" width="250">
</a>


This is a fork of [mobx-react](https://github.com/mobxjs/mobx-react) for [Preact](https://preactjs.com/)

This package provides the bindings for [MobX](https://mobxjs.github.io/mobx).

**_It's not really maintained, if someone wants to take over, ping me on github!_**

Consider using [mobx-observer](https://www.npmjs.com/package/mobx-observer) or another library instead.

Exports the `connect`  (or alias `observer`) decorator and some development utilities.

## Installation

```
npm install mobx-preact --save
```

Also install [mobx](https://github.com/mobxjs/mobx) dependency _(required)_ if you don't already have it

```
npm install --save mobx
```

## Example

You can inject props using the following syntax

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

Just make sure that you provided your stores using the `Provider`. Ex:

```javascript
// index.js
import { h, render } from 'preact';
import { Provider } from 'mobx-preact'
import { observable } from 'mobx'
import MyComponent from './MyComponent'

const englishStore = observable({
    title: 'Hello World'
})

const frenchStore = observable({
    title: 'Bonjour tout le monde'
})

render(<Provider englishStore={ englishStore } frenchStore={ frenchStore }>
    <MyComponent/>
</Provider>, document.body)
```
