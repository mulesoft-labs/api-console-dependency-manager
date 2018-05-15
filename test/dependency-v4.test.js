'use strict';

const {DependendenciesManager} = require('../lib/dependencies.js');
const assert = require('chai').assert;
const fs = require('fs-extra');
const path = require('path');

describe('DependencyProcessor - APIC v4', function() {
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
  const workingDir = 'test/dependency-test';
  describe('_processDependencies()', function() {
    let processor;
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
    before(function() {
      return fs.ensureDir(workingDir);
    });

    after(function() {
      fs.remove(workingDir);
    });
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

    beforeEach(function() {
      const options = {
        app: false,
        parser: false,
        isV4: true
      };
      processor = new DependendenciesManager(workingDir, options, logger);
      processor.runningRoot = true;
      return fs.ensureDir(workingDir);
    });

    afterEach(function() {
      return fs.remove(workingDir);
    });

    it('Should install basic dependencies', function() {
      this.timeout(300000);
      return fs.writeJson(bowerFile, bowerContent)
      .then(() => processor._processDependencies())
      .then(() => {
        return finishTest([
          path.join(workingDir, 'bower_components'),
          path.join(workingDir, 'bower_components', 'arc-polyfills')
        ]);
      })
      .then(() => {
        return fs.pathExists(path.join('.', 'bower_components', 'app-route'));
      })
      .then((result) => {
        assert.isFalse(result);
      });
    });

    it('Should install basic dependencies with app-route', function() {
      this.timeout(300000);
      processor.opts.app = true;
      return fs.writeJson(bowerFile, bowerContent)
      .then(() => processor._processDependencies())
      .then(() => {
        return finishTest([
          path.join(workingDir, 'bower_components'),
          path.join(workingDir, 'bower_components', 'arc-polyfills'),
          path.join(workingDir, 'bower_components', 'app-route')
        ]);
      });
    });

    it('Should install basic dependencies with RAML parser', function() {
      this.timeout(300000);
      processor.opts.parser = true;
      processor.opts.app = false;
      return fs.writeJson(bowerFile, bowerContent)
      .then(() => processor._processDependencies())
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
