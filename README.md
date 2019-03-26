# stratum-protocol-client
Stratum protocol client for Node.js

## Install

```bash
$ npm install stratum-protocol-client --save
```

## How to use

```js
const stratum = require("stratum-protocol-client")({
    host: 'scrypt.usa.nicehash.com',
    port: 3333,
    worker: {
        name: '13RrZ98B9dF2CqD4yqhYSkjGLVTPZ1sasx',
        pass: 'x',
        subscribe: 'protocol.tester'
    }
});
stratum.connect()
    .then(() => stratum.subscribe())
    .then(() => stratum.authorize())
    .then(() => stratum.submit())
```

## Run tests

```bash
$ npm run test
```