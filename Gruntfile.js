/* global module, console */
module.exports = function(grunt) {
  'use strict';

  var config, file;

  try {
    config = grunt.file.readJSON('build.json');
  } catch (err) {
    console.info('build.json not found - using defaults');
    config = {
      'color'     : '#4183C4',
      'image'     : 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkAgMAAAANjH3HAAAACVBMVEUaGhohISElJSUh9lebAAAB20lEQVRIx4XWuZXDMAwE0C0SAQtggIIYoAAEU+aKOHhYojTrYP2+QfOW/5QIJOih/q8HwF/pb3EX+UPIveYcQGgEHiu9hI+ihEc5Jz5KBIlRRRaJ1JtoSAl5Hw96hLB1/up1tnIXOck5jZQy+3iU2hAOKSH1JvwxHsp+5TLF5MOl1/MQXsVs1miXc+KDbYydyMeUgpPQreZ7fWidbNhkXNJSeAhc6qHmHD8AYovunYyEACWEbyIhNeB9fRrH3hFi0bGPLuEW7xCNaohw1vAlS805nfsrTspclB/hVdoqusg53eH7FWot+wjYpOViX8KbFFKTwlnzvj65P9H/vD0/hibYBGhPwlPO8TmxRsaxsNnrUmUXpNhirlJMPr6Hqq9k5Xn/8iYQHYIuQsWFC6Z87IOxLxHphSY4SpuiU87xJnJr5axfeRd+lnMExXpEWPpuZ1v7qZdNBOjiHzDREHX5fs5Zz9p6X0vVKbKKchlSl5rv+3p//FJ/PYvoKryI8vs+2G9lzRmnEKkh+BU8yDk515jDj/HAswu7CCz6U/Mxb/PnC9N41ndpU4hUU7JGk/C9PmP/M2xZYdvBW2PObyf1IUiIzoHmHW9yTncliYs9A9tVNppdShfgQaTLMf+j3X723tLeHgAAAABJRU5ErkJggg==)',
      'tiled'     : true,
      'attach'    : 'scroll',
      'hidePopup' : true,
      'webkit'    : false
    };
  }

  function getVersion(level) {
    var semver = require('semver');
    var version = require('./package.json').version;
    return semver.inc(version, level);
  }

  function getDate() {
    return (new Date()).toISOString().substring(0, 10);
  }

  // ** set up build options **
  config.sourceFile = 'quora-dark.css';
  // build file name
  config.buildFile = 'quora-dark-' + config.color.replace(/[^\d\w]/g, '') + '.build.min.css';
  // background options
  config.bgOptions = config.tiled ?
    'background-repeat: repeat !important; background-size: auto !important; background-position: left top !important;' :
    'background-repeat: no-repeat !important; background-size: cover !important; background-position: center top !important;';
  config.bgAttachment = config.attach.toLowerCase() === 'scroll' ? 'scroll' : 'fixed';
  config.popup = config.hidePopup ? 'display: none !important;' : '/* */';

  // get @-moz prefix
  file = grunt.file.read('quora-dark.css').match(/(@-moz-document\sdomain\("quora.com"\)\s\{(\n|\r)+)/);
  config.prefix = file && file.length ? file[1].replace(/^\s+|\s+$/g, '') : '';

  // custom build
  config.replacements = [{
    // @-moz-document domain("quora.com") {
    pattern: /(@-moz-document\sdomain\("quora.com"\)\s\{(\n|\r)+)/,
    replacement: ''
  }, {
    pattern: /\/\*\[\[bg-choice\]\]\*\/ url\(.*\)/,
    replacement: config.image
  }, {
    pattern: '/*[[bg-options]]*/',
    replacement: config.bgOptions
  }, {
    pattern: '/*[[bg-attachment]]*/ fixed',
    replacement: config.bgAttachment
  }, {
    pattern: /\/\*\[\[base-color\]\]\*\/ #\w{3,6}/g,
    replacement: config.color
  }, {
    pattern: /\/\*\[\[hide-popup\]\]\*\/\s+display: none \!important;/g,
    replacement: config.popup
  }, {
    // remove closing bracket
    pattern: /\s+\/\* grunt build - remove to end of file(.*(\n|\r))+\}$/m,
    replacement: ''
  }];

  // userstyles.org - remove defaults & leave placeholders
  config.replacements_user = [{
    pattern: /(@-moz-document domain\("quora.com"\)\s\{(\n|\r)+)/,
    replacement: ''
  }, {
    pattern: /\/\*\[\[bg-choice\]\]\*\/ url\(.*\)/,
    replacement: '/*[[bg-choice]]*/'
  }, {
    pattern: '/*[[bg-attachment]]*/ fixed',
    replacement: '/*[[bg-attachment]]*/'
  }, {
    pattern: /\/\*\[\[base-color\]\]\*\/ #\w{3,6}/g,
    replacement: '/*[[base-color]]*/'
  }, {
    pattern: /\/\*\[\[hide-popup\]\]\*\/\s+display: none \!important;/g,
    replacement: '/*[[hide-popup]]*/'
  }, {
    // remove closing bracket
    pattern: /\s+\/\* grunt build - remove to end of file(.*(\n|\r))+\}$/m,
    replacement: ''
  }];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    config: config,

    'string-replace': {
      inline: {
        files: {'<%= config.buildFile %>' : '<%= config.sourceFile %>'},
        options: {replacements: '<%= config.replacements %>'}
      },
      patch: {
        files: {'quora-dark.css': 'quora-dark.css'},
        options: { replacements: [{
            pattern: /v[0-9\.]+ \(.+\)/,
            replacement: 'v' + getVersion('patch') + ' (' + getDate() + ')'
        }]}
      },
      minor: {
        files: {'quora-dark.css': 'quora-dark.css'},
        options: { replacements: [{
            pattern: /v[0-9\.]+ \(.+\)/,
            replacement: 'v' + getVersion('minor') + ' (' + getDate() + ')'
        }]}
      },
      major: {
        files: {'quora-dark.css': 'quora-dark.css'},
        options: { replacements: [{
            pattern: /v[0-9\.]+ \(.+\)/,
            replacement: 'v' + getVersion('major') + ' (' + getDate() + ')'
        }]}
      }
    },
    exec: {
      stylelint: 'npm run stylelint --silent -- quora-dark.css --color',
      authors: 'bash tools/authors',
      perfectionist: 'npm run perfectionist --silent -- quora-dark.css quora-dark.css --indentSize 2 --maxAtRuleLength 250',
      add: 'git add quora-dark.css',
      patch: 'npm version -f patch',
      minor: 'npm version -f minor',
      major: 'npm version -f major'
    },
    cssmin: {
      minify: {
        files: {'<%= config.buildFile %>' : '<%= config.buildFile %>'},
        options: {
          keepSpecialComments: '*',
          advanced: false
        }
      }
    },
    wrap: {
      mozrule: {
        files: {'<%= config.buildFile %>' : '<%= config.buildFile %>'},
        options: {
          wrapper: ['<%= config.prefix %>', '}']
        }
      }
    },
    watch: {
      css: {files: ['quora-dark.css']}
    }
  });

  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-wrap');
  grunt.loadNpmTasks('grunt-exec');

  // build custom Quora-Dark style using build.json settings
  grunt.registerTask('default', 'Building custom style', function() {
    config.buildFile = config.buildFile.replace('.min.css', '.css');
    grunt.task.run(['string-replace:inline']);
    if (!(config.chrome || config.webkit)) {
      grunt.task.run(['wrap']);
    }
  });

  // build custom minified Quora-Dark style
  grunt.registerTask('minify', 'Building custom minified style', function() {
    grunt.task.run(['string-replace:inline', 'cssmin:minify']);
    if (!(config.chrome || config.webkit)) {
      grunt.task.run(['wrap']);
    }
  });

  // build userstyle for pasting into https://userstyles.org/styles/104706/quora-dark
  grunt.registerTask('user', 'building userstyles.org file', function() {
    config.buildFile = 'quora-dark-userstyle.build.css';
    config.replacements = config.replacements_user;
    grunt.task.run([
      'string-replace:inline',
      'wrap'
    ]);
  });
  grunt.registerTask('usermin', 'building userstyles.org file', function() {
    config.buildFile = 'quora-dark-userstyle.build.css';
    config.replacements = config.replacements_user;
    grunt.task.run([
      'string-replace:inline',
      'cssmin:minify',
      'string-replace:afterCleanCss',
      'string-replace:fix',
      'wrap'
    ]);
  });

  grunt.registerTask('clean', 'Perfectionist cleanup', function() {
    grunt.task.run(['exec:perfectionist', 'string-replace:afterPerfectionist']);
  });

  // lint quora-dark.css for errors
  grunt.registerTask('lint', 'Lint CSS for style errors', function() {
    grunt.task.run(['exec:stylelint']);
  });

  // regenerate AUTHORS based on commits
  grunt.registerTask('authors', 'Regenerate AUTHORS', function() {
    grunt.task.run(['exec:authors']);
  });

  // version bump tasks
  grunt.registerTask('patch', 'Bump patch version', function() {
    grunt.task.run(['string-replace:patch', 'exec:add', 'exec:patch', 'user']);
  });
  grunt.registerTask('minor', 'Bump minor version', function() {
    grunt.task.run(['string-replace:minor', 'exec:add', 'exec:minor', 'user']);
  });
  grunt.registerTask('major', 'Bump major version', function() {
    grunt.task.run(['string-replace:major', 'exec:add', 'exec:major', 'user']);
  });

  // watch thingy
  grunt.registerTask('dev', ['watch']);
};
