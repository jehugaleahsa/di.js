'use strict';

var di = (function () {
    
    var isArray = Array.isArray 
        ? Array.isArray
        : (function (arg) { return Object.prototype.toString.call(arg) === '[object Array]'; });

    function getContainer() {
        var container = function () { 
            return getContainer();
        };
        container.singletons = {};
        container.bindings = {};
        container.bind = function () {
            return getNamedConfiguration(this, arguments);
        };
        container.get = function (name) {
            return get(this, name, {});
        };
        container.unbind = function (name) {
            unbind(container, name);
        };
        return container;
    };
    
    function getNamedConfiguration(container, names) {
        var configuration = {};
        configuration.to = function (spec) {
            if (!isArray(spec) || spec.length == 0) {
                throw new Exception('Encountered an invalid binding specification.');
            }
            var factory = spec[spec.length - 1];
            if (typeof factory !== 'function') {
                throw new Exception('The last argument of the binding specification must be a factory method.');
            }
            var dependencies = spec.slice(0, spec.length - 1);
            var binding = addBindings(container, names, factory, dependencies);
            return getBindingConfiguration(container, binding);
        };
        configuration.toConstant = function (value) {
            return this.to([function() {
                return value;
            }]);
        };
        return configuration;
    }
    
    function addBindings(container, names, factory, dependencies) {
        var nameLookup = getNameLookup(names);
        var binding = {
            names: nameLookup,
            thisArg: null,
            scope: null,
            dependencies: dependencies,
            factory: factory
        };
        for (var index = 0; index !== names.length; ++index) {
            var name = names[index];
            container.bindings[name] = binding;
        }
        return binding;
    }
    
    function getNameLookup(names) {
        var result = {};
        for (var index = 0; index !== names.length; ++index) {
            var name = names[index];
            result[name] = null;
        }
        return result;
    }
    
    function getBindingConfiguration(container, binding) {
        return {
            forThis: function (thisArg) {
                binding.thisArg = thisArg;
                return this;
            },
            singleton: function () {
                binding.scope = container.singletons;
                return this;
            },
            transient: function () {
                binding.scope = null;
                return this;
            }
        }
    }
    
    function get(container, name, cache) {
        if (name in cache) {
            return cache[name];
        }
        var binding = container.bindings[name];
        if (typeof binding === 'undefined') {
            return binding;
        }
        
        var value; 
        if (binding.scope) {
            if (name in binding.scope) {
                value = binding.scope[name];
            } else {
                value = resolve(container, binding, cache);
                updateCache(binding.scope, binding.names, value);
            }
        } else {
            value = resolve(container, binding, cache);
        }
        updateCache(cache, binding.names, value);
        return value;
    }
    
    function resolve(container, binding, cache) {
        var factory = binding.factory;
        var thisArg = binding.thisArg;
        var dependencies = getDependencies(container, binding, cache);
        var value = factory.apply(thisArg, dependencies);
        if (typeof value === 'function') {
            value = value.bind(thisArg);
        }
        return value;
    }
    
    function getDependencies(container, binding, cache) {
        var dependencies = [];
        for (var index = 0; index !== binding.dependencies.length; ++index) {
            var dependencyName = binding.dependencies[index];
            var dependency = get(container, dependencyName, cache);
            dependencies.push(dependency);
        }
        return dependencies;
    }
    
    function updateCache(cache, names, value) {
        for (var name in names) {
            cache[name] = value;
        }
    }
    
    function unbind(container, name) {
        var binding = container.bindings[name];
        if (typeof binding === 'undefined') {
            return;
        }
        delete container.bindings[name];
        delete container.singletons[name];
        delete binding.names[name];
    }
    
    return getContainer();
})();