(function () {

    var gulp = require('gulp');
    var karma = require('karma').server;

    gulp.task('runTests', function (done) {
        karma.start({
            configFile: __dirname + '/karma.config.js',
            singleRun: true
        }, done);
    });

    gulp.task('default', ['runTests']);

})();