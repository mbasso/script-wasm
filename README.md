# script-wasm

[![Build Status](https://travis-ci.org/mbasso/script-wasm.svg?branch=master)](https://travis-ci.org/mbasso/script-wasm)
[![npm version](https://img.shields.io/npm/v/script-wasm.svg)](https://www.npmjs.com/package/script-wasm)
[![npm downloads](https://img.shields.io/npm/dm/script-wasm.svg?maxAge=2592000)](https://www.npmjs.com/package/script-wasm)
[![MIT](https://img.shields.io/npm/l/script-wasm.svg)](https://github.com/mbasso/script-wasm/blob/master/LICENSE.md)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/BassoMatteo)

> Require WebAssembly modules using script tag

## Installation

You can install script-wasm using [npm](https://www.npmjs.com/package/script-wasm):

```bash
npm install --save script-wasm
```

If you aren't using npm in your project, you can include scriptWasm using UMD build in the dist folder with `importScripts` in the serviceWorker.

## Usage

Once you have installed script-wasm, supposing a CommonJS environment, in yuor serviceWorker you can import and use it in this way:

```js
import fetchWasmScript from 'script-wasm';
// if you prefer, you can import it using a CDN instead
// self.importScripts('https://unpkg.com/script-wasm@0.1.1/dist/script-wasm.min.js')

self.addEventListener('fetch', (event) => {
  const newResponse = fetchWasmScript(event.request);
  // using CND:
  // const newResponse = scriptWasm.default(event.request)

  // returns null if the given request is not a .wasm from a <script> tag
  if (newResponse !== null) {
    event.respondWith(newResponse);
  }
});
```

In your html file:

```html
<!--
  data-import represents the importObject passed to instantiate the module
  check out: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/instantiate
-->
<script src="/example.wasm" data-import="{ imports: { log: console.log } }"></script>
```

`example.wasm` can be a file with an associated `.wat` like the following, it imports `log` and automatically runs the function `$main` after the instantiation, using the `start` instruction:

```wat
(module
  (func $log (import "imports" "log") (param i32))

  (func $main
    (call $log
      (i32.add
        (i32.const 2)
        (i32.const 5)
      )
    )
  )

  (start $main)
)
```


## API

```js
// serviceWorker
fetchWasmScript(request: Request): Response?

// html
<script src="your_wasm_file.wasm" data-import="your_import_object"></script>
```

## Change Log

This project adheres to [Semantic Versioning](http://semver.org/).  
Every release, along with the migration instructions, is documented on the Github [Releases](https://github.com/mbasso/script-wasm/releases) page.

## Authors
**Matteo Basso**
- [github/mbasso](https://github.com/mbasso)
- [@teo_basso](https://twitter.com/teo_basso)

## Copyright and License
Copyright (c) 2019, Matteo Basso.

script-wasm source code is licensed under the [MIT License](https://github.com/mbasso/script-wasm/blob/master/LICENSE.md).
