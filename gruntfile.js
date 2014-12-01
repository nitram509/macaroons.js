module.exports = function (grunt) {

  "use strict";

  grunt.initConfig(
      {
        pkg: grunt.file.readJSON('package.json'),

        typescript: {
          main: {
            src: ['src/main/ts/**/*.ts'],
            dest: 'build/node',
            options: {
              module: 'commonjs',
              target: 'es5',
              basePath: 'src/main/ts/',
              sourceMap: true,
              declaration: false
            }
          },
          test: {
            src: ['src/test/ts/**/*.ts'],
            dest: 'build/node',
            options: {
              module: 'commonjs',
              target: 'es5',
              basePath: 'src',
              sourceMap: false,
              declaration: false
            }
          }
        },

        watch: {
          src: {
            files: ['src/main/ts/**/*.ts'],
            tasks: ['default']
          }
        },

        clean: {
          build: ['build']
        }

      });

  // Register tasks
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-typescript');

  // Default task(s).
  grunt.registerTask('default', ['typescript']);

};