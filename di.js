;(function (context) {
    "use strict";
    
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = getContainer();
    } else if (typeof define === 'function' && define.amd) {
        define(getContainer);
    } else {
        context.di = getContainer();
    }
    
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
        container.async = getAsyncContainer();
        return container;
    };
    
    var invalidBindingMessage = 'Encountered an invalid binding specification.';
    var lastArgNotFunctionMessage = 'The last argument of the binding specification must be a factory method.'
    
    function getNamedConfiguration(container, names) {
        var configuration = {};
        configuration.to = function (spec) {
            var factory;
            if (isArray(spec)) {
                if (spec.length === 0) {
                    throw new Exception(invalidBindingMessage);
                }
                factory = spec[spec.length - 1];
                if (typeof factory !== 'function') {
                    throw new Exception(lastArgNotFunctionMessage);
                }
            } else if (typeof(spec) === 'function') {
                factory = spec;
                spec = [factory];
            } else {
                throw new Exception(invalidBindingMessage);
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
            scope: null,
            dependencies: dependencies,
            factory: factory
        };
        for (var index = 0; index !== names.length; ++index) {
            var name = names[index];
            unbind(container, name);
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
        var dependencies = getDependencies(container, binding, cache);
        var value = factory.apply(null, dependencies);
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
    
    function getAsyncContainer() {
        var container = {};
        container.singletons = {};
        container.bindings = {};
        container.bind = function () {
            var configuration = getNamedConfiguration(this, arguments);
            configuration.toConstant = function (value) {
                return this.to([function () {
                    return Promise.resolve(value);
                }]);
            };
            return configuration;
        };
        container.get = function (name) {
            return getAsync(this, name, {});
        };
        container.unbind = function (name) {
            unbind(container, name);
        };
        return container;
    };
    
    function getAsync(container, name, cache) {
        var binding = container.bindings[name];
        if (typeof binding === 'undefined') {
            return Promise.reject();
        }
        
        if (binding.scope) {
            if (name in binding.scope) {
                var promise = binding.scope[name];
                updateAsyncCache(cache, binding.names, promise);
                return promise;
            } else {
                var promise = resolveAsync(container, name, binding, cache);
                updateAsyncCache(binding.scope, binding.names, promise);
                return promise;
            }
        } else {
            var promise = resolveAsync(container, name, binding, cache);
            return promise;
        }
    }
    
    function resolveAsync(container, name, binding, cache) {
        var factory = binding.factory;
        var promises = getDependencyPromises(container, binding, cache);
        var promise = Promise.all(promises).then(function (values) {
            if (name in cache) {
                return cache[name];
            }
            var result = factory.apply(null, values);
            if (!(result instanceof Promise)) {
                result = Promise.resolve(result);
            }
            updateAsyncCache(cache, binding.names, result);
            return result;
        });
        return promise;
    }
    
    function getDependencyPromises(container, binding, cache) {
        var promises = [];
        for (var index = 0; index !== binding.dependencies.length; ++index) {
            var dependencyName = binding.dependencies[index];
            var promise = getAsync(container, dependencyName, cache);
            promises.push(promise);
        }
        return promises;
    }
    
    function updateAsyncCache(cache, names, promise) {
        for (var name in names) {
            cache[name] = promise;
        }
    }
    
})(this);