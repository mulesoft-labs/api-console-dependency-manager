'use strict';

const dependencies = require('../');
const assert = require('chai').assert;
const fs = require('fs-extra');
const path = require('path');

describe('General test', () => {
  const logger = {
    warn: function() {
      // console.warn.apply(console, arguments);
    },
    info: function() {
      // console.info.apply(console, arguments);
    },
    log: function() {
      // console.log.apply(console, arguments);
    },
    error: function() {
      // console.error.apply(console, arguments);
    },
    debug: function() {
      // console.log.apply(console, arguments);
    }
  };
  // const logger = console;
  const workingDir = 'test/dependency-test';
  describe('installs dependencies from the shorthand function', () => {
    const bowerFile = path.join(workingDir, 'bower.json');
    const bowerContent = {
      name: 'test',
      description: 'test',
      version: '0.0.1',
      license: 'Apache-2.0 OR CC-BY-4.0',
      authors: [
        'The Advanced REST client authors <arc@mulesoft.com>'
      ],
      dependencies: {
        'polymer': 'Polymer/polymer#^2.0.0',
        'iron-flex-layout': 'PolymerElements/iron-flex-layout#^2.0.0',
        'iron-media-query': 'PolymerElements/iron-media-query#^2.1.0',
        'paper-toast': 'PolymerElements/paper-toast#^2.0.0',
        'app-layout': 'PolymerElements/app-layout#^2.0.0',
        'app-route': 'PolymerElements/app-route#^2.0.0',
        'paper-icon-button': 'PolymerElements/paper-icon-button#^2.0.0',
        'api-navigation': 'advanced-rest-client/api-navigation#^2.0.0',
        'api-documentation': 'advanced-rest-client/api-documentation#^2.0.0',
        'api-request-panel': 'advanced-rest-client/api-request-panel#^2.0.0',
        'oauth-authorization': 'advanced-rest-client/oauth-authorization#^2.0.1',
        'cryptojs-lib': 'advanced-rest-client/cryptojs-lib#^0.1.1',
        'web-animations-js': 'web-animations/web-animations-js#^2.3',
        'arc-polyfills': 'advanced-rest-client/arc-polyfills#^0.1.11',
        'api-console-ext-comm': 'advanced-rest-client/api-console-ext-comm#^2.0.0'
      }
    };
    /**
     * @param {Array<String>} files
     * @return {Promise}
     */
    function finishTest(files) {
      let promise = [];
      if (files instanceof Array) {
        let list = files.map((file) => fs.pathExists(file));
        promise = Promise.all(list);
      } else {
        promise = fs.pathExists(files);
      }
      return promise
      .then((result) => {
        if (result instanceof Array) {
          result = result.some((item) => item === false);
          assert.isFalse(result);
        } else {
          assert.isTrue(result);
        }
      });
    }

    before(function() {
      return fs.remove(workingDir);
    });

    let options;
    beforeEach(function() {
      options = {};
      return fs.ensureDir(workingDir)
      .then(() => fs.writeJson(bowerFile, bowerContent));
    });

    afterEach(function() {
      return fs.remove(workingDir);
    });

    it('Should install basic dependencies', function() {
      this.timeout(30000);
      return dependencies.installDependencies(workingDir, options)
      .then(() => {
        return finishTest([
          path.join(workingDir, 'bower_components'),
          path.join(workingDir, 'bower_components', 'arc-polyfills'),
          path.join(workingDir, 'bower_components', 'iron-flex-layout'),
          path.join(workingDir, 'bower_components', 'iron-media-query'),
          path.join(workingDir, 'bower_components', 'paper-toast'),
          path.join(workingDir, 'bower_components', 'app-layout'),
          path.join(workingDir, 'bower_components', 'app-route'),
          path.join(workingDir, 'bower_components', 'api-navigation'),
          path.join(workingDir, 'bower_components', 'api-documentation'),
          path.join(workingDir, 'bower_components', 'api-request-panel')
        ]);
      });
    });

    it('Installs basic and additional dependencies', function() {
      this.timeout(30000);
      options.optionalDependencies = [
        'advanced-rest-client/oauth-authorization#^2.0.0',
        'advanced-rest-client/cryptojs-lib',
        'advanced-rest-client/arc-polyfills',
        'advanced-rest-client/xhr-simple-request#^2.0.0',
        'web-animations/web-animations-js#^2.3'
      ];
      return dependencies.installDependencies(workingDir, options, logger)
      .then(() => {
        return finishTest([
          path.join(workingDir, 'bower_components'),
          path.join(workingDir, 'bower_components', 'oauth-authorization'),
          path.join(workingDir, 'bower_components', 'cryptojs-lib'),
          path.join(workingDir, 'bower_components', 'arc-polyfills'),
          path.join(workingDir, 'bower_components', 'xhr-simple-request'),
          path.join(workingDir, 'bower_components', 'web-animations-js')
        ]);
      });
    });
  });
});
