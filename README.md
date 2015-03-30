# di.js
The simplest dependency injection library that could possibly work.

## Overview
di.js is a simple dependency injection library. It allows you to quickly build up an object graph of inter-dependent objects using a simple declarative configuration.

### Simple Configuration
Each dependency is built using a factory function, associated to an arbitrary name. The dependency is configured using the `bind` method:

    di.bind('limit').to([function () {
        return 123;
    }]);

Notice that the factory function appears within an array! The array syntax will be explained below.

Once a factory function is bound to a name, you can call it using `get`:

    var limit = di.get('limit');  // limit === 123
	
Whenever a dependency is requested, di.js will lookup the factory function by name and call it. It returns whatever the factory function returns.

### Injecting Dependencies
You can pass dependencies to your factory functions by listing their names before the factory function:

    di.bind('random').to(['limit', function (limit) {
        // limit === di.get('limit');
        return Math.random() * limit;
    }]);
	
### Constants
If the value being injected is a constant value, you can use `toConstant`:

    di.bind('constant').toConstant(123);
	
### Singletons
Every time you request a dependency using `get` the factory function will be called again. If you want to make sure your factory function only gets called one time, use the `singleton` method:

    di.bind('factory').to([function (){
        return [1, 2, 3];
    }]).singleton();
	
You can switch back to normal behavior by calling `transient` instead.

### Factories with State
In some rare circumstances, your factory function needs to track some state. One option is to put that state in the global scope and refer to it within the factory function. If you don't want to dirty the global scope, you can pass an object to the `forThis` method. The factory function will be bound to the object, becoming a factory *method*:

    di.bind('generator').to([function () {
        return ++this.count;
    }]).forThis({ count: 0 });
	
This is a short-hand for the following code:

    (function () {
        var counter = { count: 0 };
        di.bind('generator').to([function () {
            return ++counter.count;
        }]);
    })();
	
If a factory *returns* a function, the `forThis` instance will also be applied to the inner function, as well.

	di.bind('factory').to([function () {
		return function () {
			return ++this.count;
		};
	}]).forThis({ count: 0 });

### Spawning New Containers
If you don't want to use the global dependency injection container, you can create a new one:

    var empty = di();  // creates an empty DI container
    
Any configurations on other containers will not appear in the new container. This is useful when you want a different DI configuration for a small section of code.

### Aliases
You can pass multiple names to the `bind` method to create multiple aliases for the same factory function:

   di.bind('add', 'sum').to([function () {
       return function (x, y) { return x + y };
   }]);
	
## Suggesting Features
If you would like to use di.js and have a specific need, just let me know.
This library is new and will be part of a growing set of related libraries.
	
## Developing di.js
If you want to make changes to the library, you can setup the development environment with:

    npm install gulp
    npm install karma
    npm install karma-phantomjs-launcher
    npm install karma-mocha
    npm install chai
	
Once your environment is setup, you can run the test suite simply by typing `gulp` at the command line.

## License
If you are looking for a license, you won't find one. The software in this project is free, as in "free as air". Feel free to use my software anyway you like. Use it to build up your evil war machine, swindle old people out of their social security or crush the souls of the innocent.

I love to hear how people are using my code, so drop me a line. Feel free to contribute any enhancements or documentation you may come up with, but don't feel obligated. I just hope this code makes someone's life just a little bit easier.
