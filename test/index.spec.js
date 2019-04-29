import fetchMock from 'fetch-mock';
import bytes from './bytes';
import bytesImport from './bytes-import';
import fetchWasmScript from '../src/index';

describe('script-wasm', () => {
  beforeEach(() => {
    fetchMock.mock(/bytes.wasm/, new Response(bytes, {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-type': 'application/wasm',
      },
    }));

    fetchMock.mock(/bytes-import.wasm/, new Response(bytesImport, {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-type': 'application/wasm',
      },
    }));
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it('should return null if an invalid request is given', () => {
    let request = {
      url: 'http://localhost:8080/example.wasm',
      destination: '',
    };

    expect(fetchWasmScript(request)).toEqual(null);

    request = {
      url: 'http://localhost:8080/example.js',
      destination: 'script',
    };

    expect(fetchWasmScript(request)).toEqual(null);

    request = {
      url: 'http://localhost:8080/example.js',
      destination: '',
    };

    expect(fetchWasmScript(request)).toEqual(null);
  });

  it('should return a Response with headers', () => {
    const request = {
      url: 'http://localhost:8080/example.wasm',
      destination: 'script',
    };

    const response = fetchWasmScript(request);

    expect(response instanceof Response).toEqual(true);
    expect([...response.headers.keys()].length).toEqual(1);
    expect(response.headers.get('Content-Type')).toEqual('application/javascript');
  });

  it('should execute wasm code', (done) => {
    const request = {
      url: 'http://localhost:8080/bytes.wasm',
      destination: 'script',
    };

    // mock script
    // eslint-disable-next-line
    const document = {
      currentScript: {
        dataset: {},
      },
    };

    fetchWasmScript(request)
      .text()
      // eslint-disable-next-line
      .then(code => eval(code))
      .then(({ module, instance }) => {
        expect(module instanceof WebAssembly.Module).toEqual(true);
        expect(instance instanceof WebAssembly.Instance).toEqual(true);
        done();
      });
  });

  it('should execute wasm code with imports', (done) => {
    const request = {
      url: 'http://localhost:8080/bytes-import.wasm',
      destination: 'script',
    };

    // mock script
    // eslint-disable-next-line
    const document = {
      currentScript: {
        dataset: {
          import: '{ imports: { log: console.log } }',
        },
      },
    };

    const spy = spyOn(console, 'log');

    fetchWasmScript(request)
      .text()
      // eslint-disable-next-line
      .then(code => eval(code))
      .then(({ module, instance }) => {
        expect(module instanceof WebAssembly.Module).toEqual(true);
        expect(instance instanceof WebAssembly.Instance).toEqual(true);

        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 300);
        });
      })
      .then(() => {
        expect(spy.calls.count()).toEqual(1);
        spy.calls.reset();
        done();
      });
  });

  it('should instantiate module using instantiateStreaming', (done) => {
    const request = {
      url: 'http://localhost:8080/bytes.wasm',
      destination: 'script',
    };

    // mock script
    // eslint-disable-next-line
    const document = {
      currentScript: {
        dataset: {},
      },
    };

    // eslint-disable-next-line
    const _instantiate = WebAssembly.instantiate;
    WebAssembly.instantiate = jasmine.createSpy('instantiate').and.callFake((...params) =>
      _instantiate(...params),
    );
    // eslint-disable-next-line
    const _instantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming =
      jasmine.createSpy('instantiateStreaming').and.callFake((...params) =>
        _instantiateStreaming(...params),
      );

    fetchWasmScript(request)
      .text()
      // eslint-disable-next-line
      .then(code => eval(code))
      .then(({ module, instance }) => {
        expect(module instanceof WebAssembly.Module).toEqual(true);
        expect(instance instanceof WebAssembly.Instance).toEqual(true);

        expect(WebAssembly.instantiateStreaming).toHaveBeenCalled();
        expect(WebAssembly.instantiate).not.toHaveBeenCalled();
        WebAssembly.instantiateStreaming = _instantiateStreaming;
        WebAssembly.instantiate = _instantiate;
      })
      .then(() => {
        done();
      });
  });

  it('should instantiate module using compileStreaming and instantiate', (done) => {
    const request = {
      url: 'http://localhost:8080/bytes.wasm',
      destination: 'script',
    };

    // mock script
    // eslint-disable-next-line
    const document = {
      currentScript: {
        dataset: {},
      },
    };

    // eslint-disable-next-line
    const _instantiate = WebAssembly.instantiate;
    WebAssembly.instantiate = jasmine.createSpy('instantiate').and.callFake((...params) =>
      _instantiate(...params),
    );
    // eslint-disable-next-line
    const _compile = WebAssembly.compile;
    WebAssembly.compile = undefined;
    // eslint-disable-next-line
    const _instantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = undefined;
    // eslint-disable-next-line
    const _compileStreaming = WebAssembly.compileStreaming;
    WebAssembly.compileStreaming = jasmine.createSpy('compileStreaming').and.callFake((...params) =>
      _compileStreaming(...params),
    );

    fetchWasmScript(request)
      .text()
      // eslint-disable-next-line
      .then(code => eval(code))
      .then(({ module, instance }) => {
        expect(module instanceof WebAssembly.Module).toEqual(true);
        expect(instance instanceof WebAssembly.Instance).toEqual(true);

        expect(WebAssembly.compileStreaming).toHaveBeenCalled();
        expect(WebAssembly.instantiate).toHaveBeenCalled();
        WebAssembly.instantiateStreaming = _instantiateStreaming;
        WebAssembly.instantiate = _instantiate;
        WebAssembly.compileStreaming = _compileStreaming;
        WebAssembly.compile = _compile;
      })
      .then(() => {
        done();
      });
  });

  it('should instantiate module using compile and instantiate', (done) => {
    const request = {
      url: 'http://localhost:8080/bytes.wasm',
      destination: 'script',
    };

    // mock script
    // eslint-disable-next-line
    const document = {
      currentScript: {
        dataset: {},
      },
    };

    // eslint-disable-next-line
    const _instantiate = WebAssembly.instantiate;
    WebAssembly.instantiate = jasmine.createSpy('instantiate').and.callFake((...params) =>
      _instantiate(...params),
    );
    // eslint-disable-next-line
    const _compile = WebAssembly.compile;
    WebAssembly.compile = jasmine.createSpy('compile').and.callFake((...params) =>
      _compile(...params),
    );
    // eslint-disable-next-line
    const _instantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = undefined;
    // eslint-disable-next-line
    const _compileStreaming = WebAssembly.compileStreaming;
    WebAssembly.compileStreaming = undefined;

    fetchWasmScript(request)
      .text()
      // eslint-disable-next-line
      .then(code => eval(code))
      .then(({ module, instance }) => {
        expect(module instanceof WebAssembly.Module).toEqual(true);
        expect(instance instanceof WebAssembly.Instance).toEqual(true);

        expect(WebAssembly.compile).toHaveBeenCalled();
        expect(WebAssembly.instantiate).toHaveBeenCalled();
        WebAssembly.instantiateStreaming = _instantiateStreaming;
        WebAssembly.instantiate = _instantiate;
        WebAssembly.compileStreaming = _compileStreaming;
        WebAssembly.compile = _compile;
      })
      .then(() => {
        done();
      });
  });
});
