(function () {
	
    var assert = chai.assert;

    suite('di', function () {

        test('shouldGetBoundConstant_toConstant', function () {

			var name = 'constant';
			var value = 123;
            di.bind(name).toConstant(value);
			
            assert.equal(value, di.get(name), 'The registered constant was not returned.');
        });
		
		test('shouldReuseDependencies', function () {
			
			var dependencyName = 'dependency';
			di.bind(dependencyName).toConstant({});
			
			var parentName = 'parent';
			di.bind(parent).to([dependencyName, dependencyName, function (dependency1, dependency2) {
				assert.strictEqual(dependency1, dependency2, 'The same object was not returned for both dependencies.');
				return {};
			}]);
			
			var result = di.get(parentName);
			assert.isNotNull(result, 'The value was not retrieved.');
			
		});
		
		test('shouldReuseDependenciesAtDifferentLevels', function () {
			
			var dependencyName = 'dependency';
			var count = 0;  // track how many times to factory is called
			di.bind(dependencyName).to([function () {
				++count;
				return {};
			}]);
			
			var parentName1 = 'parent1';
			di.bind(parentName1).to([dependencyName, function (dependency) {
				return {};
			}]);
			
			var parentName2 = 'parent2';
			di.bind(parentName2).to([dependencyName, parentName1, function (dependency, parent1) {
				return {};
			}]);
			
			var result = di.get(parentName2);
			assert.equal(1, count, 'The dependency factory method was called too many times.');
			
		});
		
		test('shouldCallFactoryFunction_transient_get', function () {
			
			var name = 'parent';
			di.bind(name).to([function () {
				return {};
			}]);
			
			var first = di.get(name);
			var second = di.get(name);
			
			assert.notEqual(first, second, 'Values should not be cached unless explicitly marked as singleton.');
		});
		
		test('shouldCallFactoryFunctionOnce_singleton_get', function () {
			
			var name = 'parent';
			var config = di.bind(name).to([function () {
				return {};
			}]).singleton();
			
			var first = di.get(name);
			var second = di.get(name);
			
			assert.strictEqual(first, second, 'The dependency was not treated as a singleton.');
			
			config.transient();
			
			var third = di.get(name);
			
			assert.notEqual(first, third, 'The dependency was still being treated as a singleton.');
		});
		
		test('shouldUseAlternateThisArg_forThis', function () {
			
			var name = 'parent';
			var instance = { count: 0 };
			di.bind(name).to([function () {
				++this.count;
				return this;
			}]).forThis(instance);
			var result = di.get(name);
			assert.strictEqual(instance, result, 'The wrong instance was returned by the factory.');
			assert.equal(1, instance.count, 'The factory method was called the wrong number of times.');
			
		});
		
		test('shouldCreateEmptyContainer_()', function () {
			
			var name = 'parent';
			di.bind(name).toConstant(123);
			
			var container = di();
			assert.isUndefined(container.get(name), 'An empty container was not returned.');
			
		});
		
		test('shouldAliasInstances', function() {
			
			var name1 = 'parent1';
			var name2 = 'parent2'
			di.bind(name1, name2).toConstant({}).singleton();
			
			var first = di.get(name1);
			var second = di.get(name2);
			
			assert.strictEqual(first, second, 'Incorrectly treated aliases as two different singleton bindings.');
			
		});
        
        test('shouldRemoveBindings', function () {
            
            var name = 'parent';
            di.bind(name).to([function () {
                return 123;
            }]).singleton();
            
            // Calling get will cause the factory function result to be cached in the singletons object
            var result = di.get(name);
            
            di.unbind(name);
            
            result = di.get(name);            
            assert.isUndefined(result, 'Undefined to should be returned when calling an unbound dependency.');
            
            // Now we bind the same name to a different factory function.
            // The value cached in the singleton object should no longer be returned.
            di.bind(name).to([function () {
                return 234;
            }]).singleton();
            
            result = di.get(name);
            assert.strictEqual(234, result);
            
        });
        
        test('shouldRemoveAlias', function () {
            
            var name1 = 'parent1';
            var name2 = 'parent2';
            di.bind(name1, name2).to([function () {
                return {};
            }]).singleton();
            
            // Calling get will cause the factory function result to be cached in the singletons object
            var before = di.get(name1);
            
            di.unbind(name1);
            
            var after = di.get(name1);
            assert.isUndefined(after, 'Undefined to should be returned when calling an unbound dependency.');
            
            // Even though the first alias is removed, the second alias should still get the singleton.
            var other = di.get(name2);
            assert.strictEqual(before, other, 'The singleton was not associated with the second alias.');
            
            // Now we bind the same name to a different factory function.
            // The value cached in the singleton object should no longer be returned.
            di.bind(name1).to([function () {
                return 234;
            }]).singleton();
            
            var rebound = di.get(name1);
            assert.strictEqual(234, rebound);
            
        });

    });

})();