module.exports = function( grunt ) {


	require("load-grunt-tasks")(grunt); // npm install --save-dev load-grunt-tasks

	'use strict';
	var banner = '/**\n * <%= pkg.homepage %>\n * Copyright (c) <%= grunt.template.today("yyyy") %>\n * This file is generated automatically. Do not edit.\n */\n';
	// Project configuration
	grunt.initConfig( {

		pkg:    grunt.file.readJSON( 'package.json' ),

		meta: {
			banner: banner
		},

		addtextdomain: {
			options: {
				textdomain: 'patchchat',
			},
			target: {
				files: {
					src: [ '*.php', '**/*.php', '!node_modules/**', '!php-tests/**', '!bin/**' ]
				}
			}
		},

		wp_readme_to_markdown: {
			your_target: {
				files: {
					'README.md': 'readme.txt'
				}
			},
		},

		babel: {
			dist: {
				files: {
					'assets/js/patchchat-messenger.js' : 'assets/jsx/patchchat-messenger.jsx',
					'assets/js/patchchat-boxes.js'     : 'assets/jsx/patchchat-boxes.jsx',
					'assets/js/patchchat-list.js'      : 'assets/jsx/patchchat-list.jsx',
					'assets/js/patchchat-front.js'     : 'assets/jsx/patchchat-front.jsx',
					'assets/js/patchchat-back.js'      : 'assets/jsx/patchchat-back.jsx'
				}
			}
		},

		concat: {
			dist: {
				src: [
					'assets/js/patchchat-messenger.js',
					'assets/js/patchchat-boxes.js',
					'assets/js/patchchat-list.js'
				],
				dest: 'assets/js/patchchat.js'
			}
		},

		/* These are extra files that should be removed after concatenated into patchchat.js */
		clean: [
			'assets/js/patchchat-messenger.js',
			'assets/js/patchchat-boxes.js',
			'assets/js/patchchat-list.js'
		],

		watch: {
			files: ['assets/jsx/*.jsx'],
			tasks: ['babel', 'concat', 'clean']
		},

		configFiles: {
			files: [ 'Gruntfile.js' ],
			options: {
				reload: true
			}
		},


		makepot: {
			target: {
				options: {
					domainPath: '/languages',
					mainFile: 'patchchat.php',
					potFilename: 'patchchat.pot',
					potHeaders: {
						poedit: true,
						'x-poedit-keywordslist': true
					},
					type: 'wp-plugin',
					updateTimestamp: true
				}
			}
		},
	} );






	grunt.loadNpmTasks( 'grunt-wp-i18n' );
	grunt.loadNpmTasks( 'grunt-wp-readme-to-markdown' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-contrib-clean' );

	grunt.registerTask( 'i18n', ['addtextdomain', 'makepot'] );
	grunt.registerTask( 'readme', ['wp_readme_to_markdown'] );

	grunt.registerTask( 'default', ['babel', 'concat'] );

	grunt.util.linefeed = '\n';

};
