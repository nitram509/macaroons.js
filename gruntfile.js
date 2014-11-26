module.exports = function (grunt) {

  "use strict";

  grunt.initConfig(
      {
        pkg: grunt.file.readJSON('package.json'),

        requirejs: {
          compile: {
            options: {
              baseUrl: 'build/generated',
              mainConfigFile: 'build/generated/build.js',
              name: '../../lib/components/almond/almond',
              out: 'build/generated/<%= pkg.name %>.js',
              optimize: 'none'
            }
          }
        },

        typescript: {
          base: {
            src: ['src/**/*.ts'],
            dest: 'build/generated',
            options: {
              module: 'amd',
              target: 'es5',
              basePath: 'src/',
              sourceMap: false,
              declaration: false
            }
          }
        },

        closurecompiler: {
          minify: {
            options: {
              banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
              language_in: 'ECMASCRIPT5',
              language_out: 'ECMASCRIPT5'
            },
            files: {
              // 'dest' : 'source'
              'build/target/<%= pkg.name %>.min.js': 'build/generated/<%= pkg.name %>.js'
            }
          },
          minify_3rd_party_libs: {
            files: {
              // 'dest' : 'source'
              'build/target/lib/components/keymaster/keymaster.min.js': 'build/target/lib/components/keymaster/keymaster.js',
              'build/target/lib/components/underscore/underscore.min.js': 'build/target/lib/components/underscore/underscore.js'
            }
          }
        },

        cssmin: {
          minify: {
            expand: true,
            src: ['css/*.css', '!css/*.min.css'],
            dest: 'build/target',
            ext: '.css'
          }
        },

        copy: {
          js_to_generated_js: {
            files: [
              {expand: true, cwd: 'src/main/js', src: ['**/*.js'], dest: 'build/generated', filter: 'isFile'}
            ]
          },
          css_files: {
            files: [
              {expand: true, src: ['css/*'], dest: 'build/target', filter: 'isFile'}
            ]
          },
          static_resources: {
            files: [
              {expand: true, src: ['lib/*.js'], dest: 'build/target', filter: 'isFile'},
              {expand: true, src: ['lib/components/**/dist/*.js'], dest: 'build/target', filter: 'isFile'},
              {expand: true, src: ['lib/components/underscore/*.js'], dest: 'build/target', filter: 'isFile'},
              {expand: true, src: ['lib/components/keymaster/*.js'], dest: 'build/target', filter: 'isFile'},
              {expand: true, src: ['img/*'], dest: 'build/target', filter: 'isFile'},
              {expand: true, cwd: 'src/main/html', src: ['*.html'], dest: 'build/target', filter: 'isFile'},
            ]
          },
          js_to_min_js: {
            files: [
              {src: 'build/generated/<%= pkg.name %>.js', dest: 'build/target/<%= pkg.name %>.min.js'},
              {src: 'build/target/lib/components/keymaster/keymaster.js', dest: 'build/target/lib/components/keymaster/keymaster.min.js'},
              {src: 'build/target/lib/components/underscore/underscore.js', dest: 'build/target/lib/components/underscore/underscore.min.js'}
            ]
          }
        },

        watch: {
          src: {
            files: ['src/main/js/**/*.js', 'src/**/*.ts', 'src/main/html/**', 'css/**', 'img/**', 'lib/**'],
            tasks: ['no-uglify']
          }
        },

        clean: {
          build: ['build']
        }

      });

  // Register tasks
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-closurecompiler');

  // Default task(s).
  grunt.registerTask('default', ['typescript', 'copy:js_to_generated_js', 'requirejs', 'closurecompiler:minify', 'copy:static_resources', 'closurecompiler:minify_3rd_party_libs', 'cssmin' ]);
  grunt.registerTask('no-uglify', ['typescript', 'copy:js_to_generated_js', 'requirejs', 'copy:js_to_min_js', 'copy:static_resources', 'copy:css_files']);

};