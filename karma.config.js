module.exports = function(config) {
    config.set({
        browsers: ['PhantomJS'],
        frameworks: ['mocha'],
        files: [
			'./node_modules/chai/chai.js',
            './di.js',
            './*.test.js'
        ],
        singleRun: true,
        client: {
            mocha: {
                reporter: 'dot',
                ui: 'tdd'
            }
        }
    });
};