(function () {
	
    var assert = chai.assert;

    suite('di', function () {

        test('shouldGetBoundConstant', function () {

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
		
		test('shouldRecreateValuesUnlessSingleton', function () {
			
			var name = 'parent';
			di.bind(name).to([function () {
				return {};
			}]);
			
			var first = di.get(name);
			var second = di.get(name);
			
			assert.notEqual(first, second, 'Values should not be cached unless explicitly marked as singleton.');
		});
		
		test('shouldOnlyCreateSingleValueWhenSingleton', function () {
			
			var name = 'parent';
			di.bind(name).to([function () {
				return {};
			}]).singleton();
			
			var first = di.get(name);
			var second = di.get(name);
			
			assert.strictEqual(first, second);
			
		});
		
		test('shouldUseAlternateThisArg', function () {
			
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
		
		test('callCreatesEmptyContainer', function () {
			
			var name = 'parent';
			di.bind(name).toConstant(123);
			
			var container = di();
			assert.isUndefined(container.get(name), 'An empty container was not returned.');
			
		});

    });

})();