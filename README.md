# di.js
The simplest sync and async dependency injection library that could possibly work.

## Overview
di.js is a simple dependency injection library. It allows you to quickly build up an object graph of inter-dependent objects using a simple declarative configuration.

### Simple Configuration
Each dependency is built using a factory function, associated to an arbitrary name. The dependency is configured using the `bind` method:

    di.bind('limit').to(function () {
        return 123;
    });

Once a factory function is bound to a name, you can call it using `get`:

    var limit = di.get('limit');  // limit === 123
    
Whenever a dependency is requested, di.js will lookup the factory function by name and call it. It returns whatever the factory function returns.

### Injecting Dependencies
You can pass dependencies to your factory functions by listing their names before the factory function within an array:

    di.bind('random').to(['limit', function (limit) {
        // limit === di.get('limit');
        return Math.random() * limit;
    }]);
    
The factory function can accept any number of dependencies, even the same dependency multiple times if necessary.
    
### Constants
If the value being injected is a constant value, you can use `toConstant`:

    di.bind('constant').toConstant(123);
    
### Singletons
Every time you request a dependency using `get` the factory function will be called again. If you want to make sure your factory function only gets called one time, use the `singleton` method:

    di.bind('factory').to([function (){
        return [1, 2, 3];
    }]).singleton();
    
You can switch back to normal behavior by calling `transient` instead.

### Spawning New Containers
If you don't want to use the global dependency injection container, you can create a new, empty one:

    var empty = di();  // creates an empty DI container
    
Any configurations on other containers will not appear in the new container. This is useful when you want a different DI configuration for a small section of code.

### Aliases
You can pass multiple names to the `bind` method to create multiple aliases for the same factory function:

    di.bind('add', 'sum').to(function () {
        return function (x, y) { return x + y };
    });
    
If the binding is a singleton, the same result is returned for all aliases.
    
### Async
If you are working in an asynchronous environment, you can use the async version of the library.
Configuring bindings is exactly the same as the synchronous operations, except operations are performed on `di.async` instead:

    di.async.bind('data').to(['ajax', function (ajax) {
        return ajax.get('/path/to/resource');  // async operation returning ES6 promise
    }]);
    
The only real difference is that the factory functions should return a promise instead of an object. The promises need to be compatible for [ES6 promises](http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). Once you have your bindings configured, you can call `get`, which will return a promise, allowing you to work with the object:

    di.async.get('data').then(function (response) {
        // do something with the response
    }, function (error) {
        // handle an error
    });
    
If for whatever reason your factory function returns a non-promise, that object will be automatically wrapped in a promise on your behalf. This is useful when you simply want to return a calculated value that doesn't require hitting an asynchronous service:

    di.async.bind('data-array').to(['data', function (data) {
        return [data];
    }]);
    
This is equivalent to the more verbose code:

    di.async.bind('data-array').to(['data', function (data) {
        return Promise.resolve([data]);
    }]);
    
## Suggesting Features
If you would like to use di.js and have a specific need, just let me know.
This library is new and will be part of a growing set of related libraries.
    
## Developing di.js
If you want to make changes to the library, you can setup the development environment with:

    npm install gulp
    npm install mocha
    npm install chai
    npm install chai-as-promised
    
Once your environment is setup, you can run the test suite simply by typing `gulp` at the command line or viewing the test.html file.

### Future Plans for Test Automation
Currently, I am working on using Karma and PhantomJS to run my browser tests instead of needing to open test.html. Ideally, I would be able to reuse the same test files. I have tried various tools including requirejs and browserify with no luck. There appears PhantomJS does not support standard promises yet, and incorporating them involves a lot of hacking.

## License
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org>
