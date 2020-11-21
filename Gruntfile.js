module.exports = function (grunt) {

  "use strict";

  grunt.initConfig(
      {
        pkg: grunt.file.readJSON('package.json'),

        ts: {
          main: {
            src: ['src/main/ts/**/*.ts'],
            dest: 'build/node',
            options: {
              module: 'commonjs',
              target: 'es5',
              rootDir : 'src/main/ts/',
              sourceMap: false,
              declaration: true,
              esModuleInterop: true
            }
          },
          test: {
            src: ['src/test/ts/**/*.ts'],
            dest: 'build/node',
            options: {
              module: 'commonjs',
              target: 'es5',
              rootDir : 'src',
              sourceMap: true,
              declaration: true,
              esModuleInterop: true
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

        run: {
          jest: {
            cmd: 'npx',
            args: [
              'jest'
            ]
          }
        }

      });

  // Register tasks
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-ts');

  // Default task(s).
  grunt.registerTask('default', ['ts:main', 'copy']);
  grunt.registerTask('test', ['ts:test', 'run:jest']);
  grunt.registerTask('package', ['clean', 'ts:main', 'ts:test', 'run:jest', 'copy']);

};
