(function () {
    
    var assert = chai.assert;

    suite('di.async', function () {

        test('shouldGetBoundConstant_toConstant', function (done) {

            var name = 'constant';
            var value = 123;
            di.async.bind(name).toConstant(value);
            
            di.async.get(name, function (result) {
                assert.equal(value, result, 'The registered constant was not returned.');
				done();
            });
        });
		
		test('shouldCallErrorCallbackIfError', function (done) {

            var name = 'name';
			var message1 = 'oh, no!';
			var message2 = 'oh, no2!';
            di.async.bind(name).to([function (success, error) {
				error(message1, message2);
			}]);
            
            di.async.get(name, function (result) {
                assert.fail('The error callback should have been called instead.');
				done();
            }, function (result1, result2) {
				assert.equal(message1, result1, 'The wrong error message1 was returned.');
				assert.equal(message2, result2, 'The wrong error message2 was returned.');
				done();
			});
        });

    });

})();