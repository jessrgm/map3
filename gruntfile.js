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
                        cwd: 'src/vendors/bootstrap-sass/assets/fonts',
                        src: '**/*',
                        dest: 'dist/fonts',
                        expand: true
                    }, {
                        cwd: 'src/vendors/fontawesome/fonts',
                        src: '**/*',
                        dest: 'dist/fonts',
                        expand: true
                    }, {
                        cwd: 'src/images',
                        src: '**/*',
                        dest: 'dist/images',
                        expand: true
                    }, {
                        cwd: 'src/',
                        src: '*.html',
                        dest: 'dist/',
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
                path: 'http://localhost:8888'
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
                'src/js/data.js',
                'src/js/map3.js',
                'src/js/app.js',
                ],
                dest: 'dist/js/app.min.js'
            }
        },

        uglify: {
            options: {
                mangle: false,
                sourceMap: false
            },
            build: {
                files: [{
                    expand: true,
                    src: '*.js',
                    dest: 'dist',
                    ext: '.js',
                    extDot: 'last'
                }]
            }
        },

        watch: {
            main: {
                options: {
                    livereload: true
                },
                files: ['src/**/*'],
                tasks: ['default']
            }
        },
    });

    // Default task.
    grunt.registerTask('default', ['concat', 'copy', 'sass']);
    grunt.registerTask('serve', ['default', "open", 'connect:server', 'watch']);
};
