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
        'arc-polyfills': 'advanced-rest-client/arc-polyfills#latest'
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
      options = {
        app: false,
        parser: false,
        isV4: true
      };
      return fs.ensureDir(workingDir)
      .then(() => fs.writeJson(bowerFile, bowerContent));
    });

    afterEach(function() {
      return fs.remove(workingDir);
    });

    it('Should install basic dependencies', function() {
      this.timeout(30000);
      return dependencies.installDependencies(workingDir, options, logger)
      .then(() => {
        return finishTest([
          path.join(workingDir, 'bower_components'),
          path.join(workingDir, 'bower_components', 'arc-polyfills')
        ]);
      })
      .then(() => {
        return fs.pathExists(
          path.join(workingDir, 'bower_components', 'app-route'));
      })
      .then((result) => {
        assert.isFalse(result);
      });
    });

    it('Should install basic dependencies with app-route', function() {
      this.timeout(30000);
      options.app = true;
      return dependencies.installDependencies(workingDir, options, logger)
      .then(() => {
        return finishTest([
          path.join(workingDir, 'bower_components'),
          path.join(workingDir, 'bower_components', 'arc-polyfills'),
          path.join(workingDir, 'bower_components', 'app-route')
        ]);
      });
    });

    it('Should install basic dependencies with RAML parser', function() {
      this.timeout(30000);
      options.parser = true;
      return dependencies.installDependencies(workingDir, options, logger)
      .then(() => {
        return finishTest([
          path.join(workingDir, 'bower_components'),
          path.join(workingDir, 'bower_components', 'raml-js-parser'),
          path.join(workingDir, 'bower_components', 'raml-json-enhance')
        ]);
      });
    });
  });
});
