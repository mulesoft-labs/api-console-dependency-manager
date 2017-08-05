'use strict';

const dependencies = require('../');
const assert = require('chai').assert;
const fs = require('fs-extra');
const path = require('path');

describe('General test', () => {
  const logger = {
    warn: function() {},
    info: function() {},
    log: function() {}
  };
  // const logger = console;
  const workingDir = 'test/playground/dependency-test';

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

    function finishTest(files) {
      var promise = [];
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

    var options;
    beforeEach(function() {
      options = {
        app: false,
        parser: false
      };
      return fs.ensureDir(workingDir)
      .then(() => fs.writeJson(bowerFile, bowerContent));
    });

    afterEach(function() {
      return fs.remove(workingDir);
    });

    it('Should install basic dependencies', function() {
      this.timeout(30000);
      return dependencies.installDependencies(workingDir, logger, options)
      .then(() => {
        return finishTest([
          path.join(workingDir, 'bower_components'),
          path.join(workingDir, 'bower_components', 'arc-polyfills')
        ]);
      })
      .then(() => {
        return fs.pathExists(path.join(workingDir, 'bower_components', 'app-route'));
      })
      .then((result) => {
        assert.isFalse(result);
      });
    });

    it('Should install basic dependencies with app-route', function() {
      this.timeout(30000);
      options.app = true;
      return dependencies.installDependencies(workingDir, logger, options)
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
      return dependencies.installDependencies(workingDir, logger, options)
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
