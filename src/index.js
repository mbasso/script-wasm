const isWasmScript = request =>
  new URL(request.url).pathname.endsWith('.wasm') &&
  request.destination === 'script';

const fetchWasmScript = (request) => {
  if (!isWasmScript(request)) return null;

  return new Response(`(() => {
    let res = fetch('${request.url}');

    const code = document.currentScript.dataset.import || '{}';
    const importObject = eval('(' + code + ')');

    if (WebAssembly.instantiateStreaming !== undefined) {
      res = WebAssembly.instantiateStreaming(res, importObject);
    } else {
      res = (
        WebAssembly.compileStreaming !== undefined
          ? WebAssembly.compileStreaming(res)
          : res.then(response => response.arrayBuffer())
              .then(buff => WebAssembly.compile(buff))
      )
        .then(module =>
          WebAssembly.instantiate(module, importObject)
            .then(instance => ({ module, instance }))
        );
    }

    return res;
  })()`, {
    headers: {
      'Content-Type': 'application/javascript',
    },
  });
};

export default fetchWasmScript;
