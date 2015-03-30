# di.js
The simplest dependency injection library that could possibly work.

## Overview
di.js is a simple dependency injection library based on AngularJS dependency injection.

A factory method is associated with a name by calling the `bind` method:

	di.bind('myDependency').to([function () {
		return 123;
	}]);

Notice that the factory function appears within an array.
Once a factory method is bound to a name, you can call it using `get`:

	var dependency = di.get('myDependency');
	
Dependencies are injected by listing the dependencies as a list of names preceding the factory method:

	di.bind('otherDependency').to(['myDependency', function (myDependency) {
		// myDependency === di.get('myDependency');
		return 234;
	}]);
	
If the value being injected is a simple value, you can use `toConstant`:

	di.bind('constant').toConstant(123);
	
This can also be used as a short-hand for factory methods without dependencies:

	di.bind('constantFoo').toConstant(function () {
		return 123;
	});
	
You can specify a binding as a singleton using the `singleton` method:

	di.bind('factory').to([function (){
		return [1, 2, 3];
	}]).singleton();
	
The same array (`[123]`) will be returned every time the binding is resolved.
If needed, you can call `forThis` to specify the `this` arg passed to the factory:

	var counter = { count: 0 };
	di.bind('factory').to([function () {
		++this.count;
		return this;
	}]).forThis(counter);
	
If a factory returns a function, the `forThis` instance will also be applied to the function, as well.

	var counter = { count: 0 };
	di.bind('factory').to([function () {
		return function () {
			++this.count;
			return this;
		};
	}]).forThis(counter);
	
## Suggesting Features
If you would like to use di.js and have a specific need, just let me know.
This library is new and will be part of a growing set of related libraries.
	
## Developing di.js
If you want to make changes to the library, you can setup the development environment with:

    npm install gulp
    npm install karma
    npm install karma-phantomjs-launcher
    npm install mocha
    npm install chai
	
Once your environment is setup, you can run the test suite simply by typing `gulp` at the command line.

## License
If you are looking for a license, you won't find one. The software in this project is free, as in "free as air". Feel free to use my software anyway you like. Use it to build up your evil war machine, swindle old people out of their social security or crush the souls of the innocent.

I love to hear how people are using my code, so drop me a line. Feel free to contribute any enhancements or documentation you may come up with, but don't feel obligated. I just hope this code makes someone's life just a little bit easier.
