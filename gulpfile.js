/*jshint globalstrict: true*/
/*global require*/

'use strict'

const gulp = require('gulp')
const jdists = require('gulp-jdists')
const rename = require('gulp-rename')
const linenum = require('gulp-linenum')
const examplejs = require('gulp-examplejs')
const typescript = require('gulp-typescript')
const replace = require('gulp-replace')
const merge2 = require('merge2')
const pkg = require('./package')

function build() {
  let tsResult = gulp
    .src('src/*.ts')
    .pipe(
      linenum({
        prefix: `${pkg.name}/src/index.ts:`,
      })
    )
    .pipe(jdists())
    .pipe(gulp.dest('lib'))
    .pipe(
      typescript({
        target: 'ES5',
        declaration: true,
      })
    )

  return merge2([
    tsResult.dts
      .pipe(replace(/^\s*private\s.*;\s*$/gm, '// $&'))
      .pipe(gulp.dest('lib')),
    tsResult.js
      .pipe(
        replace(
          /(\(function\s*\()(factory\)\s*\{)/,
          '$1root, $2\n    /* istanbul ignore next */'
        )
      )
      .pipe(replace(/var __assign = /, '/* istanbul ignore next */\n$&'))
      .pipe(
        replace(
          /(define\(\["require",\s*"exports"\],\s*factory\);\s*\})/,
          `$1 else { factory(null, root["${pkg.name}"] = {}); }`
        )
      )
      .pipe(
        replace(
          /(\s*\}\s*\)\s*\()(function\s*\(require,\s*exports\)\s*\{)/,
          '$1this, $2'
        )
      )
      .pipe(gulp.dest('lib')),
  ])
}
gulp.task(build)

function example() {
  return gulp
    .src(['src/*.ts'])
    .pipe(
      jdists({
        trigger: 'example',
      })
    )
    .pipe(
      examplejs({
        header: `
const jfetchs = require('../')
      `,
      })
    )
    .pipe(
      rename({
        extname: '.js',
      })
    )
    .pipe(gulp.dest('test'))
}
gulp.task(example)

gulp.task('dist', gulp.parallel(build, example))
