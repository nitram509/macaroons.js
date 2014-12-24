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
              sourceMap: false,
              declaration: true
            }
          },
          test: {
            src: ['src/test/ts/**/*.ts'],
            dest: 'build/node',
            options: {
              module: 'commonjs',
              target: 'es5',
              basePath: 'src',
              sourceMap: true,
              declaration: true
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
          build: ['build', 'lib/*']
        },

        copy: {
          main: {
            files: [
              {expand: true, cwd: 'build/node/', src: ['*.js'], dest: 'lib/', filter: 'isFile'},
              {expand: true, cwd: 'build/node/', src: ['*.d.ts'], dest: 'lib/', filter: 'isFile'},
              {expand: true, cwd: 'build/node/', src: ['verifier/*.js'], dest: 'lib/', filter: 'isFile'},
              {expand: true, cwd: 'build/node/', src: ['verifier/*.d.ts'], dest: 'lib/', filter: 'isFile'}
            ]
          }
        },

        mochaTest: {
          options: {
            reporter: 'tap',
            quiet: false, // Optionally suppress output to standard out (defaults to false)
            clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
          },
          src: ['build/node/test/ts/**/*.js']
        }

      });

  // Register tasks
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-mocha-test');

  // Default task(s).
  grunt.registerTask('default', ['typescript:main', 'copy']);
  grunt.registerTask('test', ['typescript:test', 'mochaTest']);

};