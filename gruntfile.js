module.exports = function (grunt) {
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            dist: {
                options: {
                    style: 'expanded',
                    sourcemap: false,
                    noCache: true
                },
                files: {
                    'dist/css/map3.css': 'src/scss/main.scss',
                }
            }
        },

        copy: {
            main: {
                files: [{
                        cwd: './test',
                        src: '**/*',
                        dest: 'dist/test',
                        expand: true
                    }
                ]
            }
        },

        connect: {
            server: {
                options: {
                    hostname: '0.0.0.0',
                    port: 8888,
                    base: "dist",
                    livereload: true
                }
            }
        },

        open: {
            all: {
                path: 'http://localhost:8888/test'
            }
        },

        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                separator: ';\n'
            },
            libs: {
                src: [
                'src/vendors/jquery/dist/jquery.min.js',
                'src/vendors/d3/d3.min.js',
                'src/vendors/d3plus/d3plus.min.js',
                'src/js/map3.js'
                ],
                dest: 'dist/js/map3.full.js'
            }
        },

        uglify: {
            options: {
                mangle: false,
                sourceMap: false
            },
            build: {
                files: {
                    'dist/js/map3.min.js': ['src/js/map3.js']
                }
            }
        },

        watch: {
            main: {
                options: {
                    livereload: true
                },
                files: ['src/**/*', 'test/**/*'],
                tasks: ['default']
            },
            test: {
                options: {
                    livereload: true
                },
                files: ['test/**/*'],
                tasks: ['default', 'copy']
            }
        },
    });

    // Default task.
    grunt.registerTask('default', ['uglify', 'concat', 'sass']);
    grunt.registerTask('serve', ['default', 'copy', "open", 'connect:server', 'watch']);
};
