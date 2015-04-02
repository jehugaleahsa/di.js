module.exports = function(config) {
    config.set({
        browsers: ['PhantomJS'],
        frameworks: ['mocha', 'chai', 'chai-as-promised'],
        files: [
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