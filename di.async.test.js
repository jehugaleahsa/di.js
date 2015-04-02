(function () {
    
    var assert = chai.assert;

    suite('di.async', function () {
        
        function verify(promise, done) {
            return {
                then: function (resolver) {
                    promise.then(function (result) {
                        try {
                            resolver(result);
                            done();
                        } catch (exception) {
                            done(exception);
                        }
                    }, done);
                }
            };
        }

        test('shouldGetBoundConstant_toConstant', function (done) {
            var name = 'constant';
            var value = 123;
            di.async.bind(name).toConstant(value);
            
            assert.eventually.equal(di.async.get(name), value, 'The constant value was not resolved.')
                .notify(done);
        });
        
        test('shouldCallErrorCallbackIfError', function (done) {
            var name = 'name';
            var message = 'oh, no!';
            di.async.bind(name).to([function () {
                return Promise.reject(message);
            }]);
            
            assert.isRejected(di.async.get(name), 'An error was expected from the promise.')
                .notify(done);
        });
        
        test('shouldRequestEachDependencyOnce', function (done) {
            
            var grandChildName = 'grandchild';
            var gcCount = 0;
            di.async.bind(grandChildName).to([function () {
                ++gcCount;  // track how many times the promise is resolved
                return Promise.resolve(123);
            }]);
            
            var childName = 'child';
            var cCount = 0;
            di.async.bind(childName).to([grandChildName, function (grandChild) {
                ++cCount;  // track how many times the promise is resolved
                return Promise.resolve(grandChild - 23);  // 123 - 23 === 100
            }]);
            
            var parentName = 'parent';
            di.async.bind(parentName).to([grandChildName, childName, function (grandChild, child) {
                return Promise.resolve(grandChild + child + 27);  // 123 + 100 + 27 === 250
            }]);
            
            verify(di.async.get(parentName), done).then(function (value) {
                assert.equal(1, gcCount, 'The grandchild promise was called multiple times.');
                assert.equal(1, cCount, 'The child promise was called multiple times.');
                assert.equal(250, value, 'The values did not add up correctly.');
            });
        });
        
        test('shouldReuseDependencies', function (done) {
            
            var dependencyName = 'dependency';
            var dependency = {};
            di.async.bind(dependencyName).toConstant(dependency);
            
            var parentName = 'parent';
            di.async.bind(parentName).to([dependencyName, dependencyName, function (dependency1, dependency2) {
                return [dependency1, dependency2];
            }]);
            
            verify(di.async.get(parentName), done).then(function (values) {
                assert.strictEqual(dependency, values[0], 'The correct dependency was not returned.');
                assert.strictEqual(values[0], values[1], 'The same dependency was not returned.');
            });
            
        });
        
        test('shouldReuseDependenciesAtDifferentLevels', function (done) {
            
            var dependencyName = 'dependency';
            var count = 0;  // track how many times to factory is called
            var dependency = {};
            di.async.bind(dependencyName).to([function () {
                ++count;
                return dependency;
            }]);
            
            var parentName1 = 'parent1';
            di.async.bind(parentName1).to([dependencyName, function (dependency) {
                return dependency;
            }]);
            
            var parentName2 = 'parent2';
            di.async.bind(parentName2).to([dependencyName, parentName1, function (dependency, parent1) {
                return [dependency, parent1];
            }]);
            
            verify(di.async.get(parentName2), done).then(function (values) {
                assert.equal(1, count, 'The dependency factory method was called too many times.');
                assert.equal(dependency, values[0], 'The correct dependency was not returned.');
                assert.equal(values[0], values[1], 'The same dependency was not returned at multiple levels.');
            });
            
        });
        
        test('shouldCallFactoryFunction_transient_get', function (done) {
            
            var name = 'parent';
            di.async.bind(name).to([function () {
                return {};
            }]).transient();
            
            var promise = Promise.all([di.async.get(name), di.async.get(name)]);
            verify(promise, done).then(function (values) {
                var first = values[0];
                var second = values[1];
                assert.notEqual(first, second, 'Values should not be cached unless explicitly marked as singleton.');
            });
        });
        
        test('shouldCallFactoryFunctionOnce_singleton_get', function (done) {
            
            var name = 'parent';
            var config = di.async.bind(name).to([function () {
                return {};
            }]).singleton();
            
            var promise = Promise.all([di.async.get(name), di.async.get(name)]);
            verify(promise, done).then(function (values) {
                var first = values[0];
                var second = values[1];
                assert.strictEqual(first, second, 'Values should be cached when marked as singleton.');
            });
        });
        
        test('shouldAliasInstances', function(done) {
            
            var name1 = 'parent1';
            var name2 = 'parent2'
            di.async.bind(name1, name2).toConstant({}).singleton();
            
            var promise = Promise.all([di.async.get(name1), di.async.get(name2)]);
            verify(promise, done).then(function (values) {
                var first = values[0];
                var second = values[1];
                assert.strictEqual(first, second, 'Incorrectly treated aliases as two different singleton bindings.');
            });
            
        });
        
        test('shouldRemoveBindings', function (done) {
            
            var name = 'parent';
            di.async.bind(name).toConstant(123).singleton();
            
            // Calling get will cause the factory function result to be cached in the singletons object
            var promise = di.async.get(name).then(function () {
               di.async.unbind(name);
               return di.async.get(name);
            }).then (function (result) {
                assert.isUndefined(result, 'Undefined to should be returned when calling an unbound dependency.');
                // Now we bind the same name to a different factory function.
                // The value cached in the singleton object should no longer be returned.
                di.async.bind(name).toConstant(234).singleton();
                return di.async.get(name);
            }).then(function (result) {
                assert.strictEqual(234, result);
            });
            verify(promise, done).then(function () {});
            
        });
        
        test('shouldReplaceBindings', function (done) {
            
            var name = 'parent';
            di.async.bind(name).toConstant(123).singleton();
            
            // Calling get will cause the factory function result to be cached in the singletons object
            var promise = di.async.get(name).then(function () {
                // Now we bind the same name to a different factory function.
                // The value cached in the singleton object should no longer be returned.
                di.async.bind(name).toConstant(234).singleton();
                return di.async.get(name);
            }).then(function (result) {
                assert.strictEqual(234, result, 'The dependency was not replaced.');
            });
            verify(promise, done).then (function () {});
            
        });
        
        test('shouldRemoveAlias', function (done) {
            
            var name1 = 'parent1';
            var name2 = 'parent2';
            var value = {};
            di.async.bind(name1, name2).toConstant(value).singleton();
            
            // Calling get will cause the factory function result to be cached in the singletons object
            var promise = di.async.get(name1).then(function () {
                di.async.unbind(name1);                
                return di.async.get(name1);
            }).then(function (after) {
                assert.isUndefined(after, 'Undefined to should be returned when calling an unbound dependency.');                
                // Even though the first alias is removed, the second alias should still get the singleton.
                return di.async.get(name2);
            }).then(function (other) { 
                assert.strictEqual(value, other, 'The singleton was not associated with the second alias.');
                
                // Now we bind the same name to a different factory function.
                // The value cached in the singleton object should no longer be returned.
                di.async.bind(name1).toConstant(234).singleton();
                
                return di.async.get(name1);
            }).then(function (rebound) {
                assert.strictEqual(234, rebound);
            });
            verify(promise, done).then(function () {});
        });
        
        test('shouldResolveNonPromise', function (done) {
            
            var name = 'parent1';
            di.async.bind(name).to([function () {
                return 123;
            }]);
            
            assert.eventually.equal(di.async.get(name), 123)
                .notify(done);
        });

    });

})();