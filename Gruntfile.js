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

		sass: {
			dist: {
				options: {
					sourcemap: 'none'
				},
				files: {
					'assets/css/patchchat-front.css' : 'assets/sass/patchchat-front.scss',
					'assets/css/patchchat-back.css'  : 'assets/sass/patchchat-back.scss',

					'assets/css/admintable.css'      : 'assets/sass/admintable.scss'
				}
			}
		},

		babel: {
			dist: {
				files: {
					'assets/js/patchchat-messenger.js' : 'assets/jsx/patchchat-messenger.jsx',
					'assets/js/patchchat-boxes.js'     : 'assets/jsx/patchchat-boxes.jsx',
					'assets/js/patchchat-initbox.js'   : 'assets/jsx/patchchat-initbox.jsx',
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
					'assets/js/patchchat-initbox.js',
					'assets/js/patchchat-list.js'
				],
				dest: 'assets/js/patchchat.js'
			}
		},

		/* These are extra files that should be removed after concatenated into patchchat.js */
		clean: [
			'assets/js/patchchat-messenger.js',
			'assets/js/patchchat-boxes.js',
			'assets/js/patchchat-initbox.js',
			'assets/js/patchchat-list.js'
		],

		watch: {
			jsx : {
				files : ['assets/jsx/*.jsx'],
				tasks : ['babel', 'concat', 'clean']
			},
			sass: {
				files : ['assets/sass/*.scss'],
				tasks : ['sass']
			}
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

		notify_hooks: {
			options: {
				enabled: true,
				max_jshint_notifications: 5,
				success: true,
				duration: 5
			},
			watch: {
				options: {
					// TODO: Make this cute message appear
					// TODO: Make a sound appear too
					message: "And now his watch is ended."
				}
			}
		}
	} );


	grunt.loadNpmTasks( 'grunt-wp-i18n' );
	grunt.loadNpmTasks( 'grunt-wp-readme-to-markdown' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-contrib-clean' );
	grunt.loadNpmTasks( 'grunt-contrib-sass' );
	grunt.loadNpmTasks( 'grunt-notify' );

	grunt.registerTask( 'i18n', ['addtextdomain', 'makepot'] );
	grunt.registerTask( 'readme', ['wp_readme_to_markdown'] );

	grunt.registerTask( 'default', ['babel', 'concat'] );

	grunt.task.run( 'notify_hooks' );

	grunt.util.linefeed = '\n';

};
