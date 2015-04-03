(function () {

    var gulp = require('gulp');
    var mocha = require('gulp-mocha');
    var karma = require('karma').server;
    this.di = require('./di.js');
    this.chai = require('chai');
    this.chai.use(require('chai-as-promised'));

    gulp.task('runKarmaTests', function (done) {
        karma.start({
            configFile: __dirname + '/karma.config.js',
            singleRun: true
        }, done);
    });
    
    gulp.task('runNodeTests', function () {
        return gulp.src('*.test.js', { read: false })
            .pipe(mocha({ 
                reporter: 'dot', 
                ui: 'tdd'
            }));
    });

    gulp.task('default', [/*'runKarmaTests', */'runNodeTests']);

})();