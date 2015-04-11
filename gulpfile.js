(function () {

    var gulp = require('gulp');
    var mocha = require('gulp-mocha');
    this.di = require('./di.js');
    this.mocha = require('mocha');
    this.chai = require('chai');
    var chaiAsPromised = require('chai-as-promised');
    this.chai.use(chaiAsPromised);
    
    gulp.task('runNodeTests', function () {
        return gulp.src('*.test.js', { read: false })
            .pipe(mocha({ 
                reporter: 'dot', 
                ui: 'tdd'
            }));
    });

    gulp.task('default', ['runNodeTests']);

})();