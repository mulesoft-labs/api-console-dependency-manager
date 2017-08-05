'use strict';

const {DependendenciesManager} = require('../lib/dependencies.js');
const assert = require('chai').assert;
const fs = require('fs-extra');
const path = require('path');

describe('DependencyProcessor', () => {
  const logger = {
    warn: function() {},
    info: function() {},
    log: function() {}
  };
  // const logger = console;
  const workingDir = 'test/playground/dependency-test';
  const opts = {
    verbose: true
  };

  describe('checkIsRoot()', () => {
    var processor;
    beforeEach(function() {
      const options = Object.assign({}, opts);
      processor = new DependendenciesManager(workingDir, logger, options);
    });

    it('Returns a boolean value', function() {
      return processor.checkIsRoot()
      .then(result => {
        assert.isBoolean(result);
      });
    });
  });

  describe('_prepareBowerCommand()', () => {
    var processor;
    beforeEach(function() {
      const options = Object.assign({}, opts);
      processor = new DependendenciesManager(workingDir, logger, options);
    });

    it('Should use --allow-root option', function() {
      processor.commandRoot = 'bower';
      processor.runningRoot = true;
      var cmd = processor._prepareBowerCommand('install');
      assert.equal(cmd, 'bower --allow-root install');
    });

    it('Should use --quiet option', function() {
      processor.commandRoot = 'bower';
      processor.opts.verbose = false;
      var cmd = processor._prepareBowerCommand('install');
      assert.equal(cmd, 'bower --quiet install');
    });
  });

  describe('_setBowerCommandRoot()', () => {
    var processor;
    var startDir = process.cwd();
    before(function() {
      return fs.ensureDir(workingDir)
      .then(() => {
        const location = path.resolve(startDir, workingDir);
        process.chdir(location);
      });
    });

    after(function() {
      return fs.remove(workingDir)
      .then(() => {
        process.chdir(startDir);
      });
    });

    beforeEach(function() {
      const options = Object.assign({}, opts);
      processor = new DependendenciesManager(workingDir, logger, options);
    });

    it('Sets a commandRoot variable', function() {
      this.timeout(30000);
      return processor._setBowerCommandRoot()
      .then(() => {
        assert.isString(processor.commandRoot, 'commandRoot is a string');
        assert.isAbove(processor.commandRoot.indexOf('bower'), -1, 'Contains bower');
      });
    });
  });

  describe('hasBower()', () => {
    var processor;
    const bowerFile = path.join('bower.json');

    var startDir = process.cwd();
    before(function() {
      return fs.remove(workingDir)
      .then(() => fs.ensureDir(workingDir))
      .then(() => {
        const location = path.resolve(startDir, workingDir);
        process.chdir(location);
      });
    });

    after(function() {
      process.chdir(startDir);
    });

    beforeEach(function() {
      const options = Object.assign({}, opts);
      processor = new DependendenciesManager('.', logger, options);
      processor.runningRoot = true;
      return fs.ensureDir(workingDir);
    });

    afterEach(function() {
      return fs.remove(workingDir);
    });

    it('Should return false', function() {
      return processor.hasBower()
      .then(result => assert.isFalse(result));
    });

    it('Should return true', function() {
      return fs.writeJson(bowerFile, {name: 'test'})
      .then(() => processor.hasBower())
      .then(result => assert.isTrue(result));
    });
  });

  describe('_processDependencies()', () => {
    var processor;
    const bowerFile = path.join('bower.json');
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

    var startDir = process.cwd();
    before(function() {
      return fs.ensureDir(workingDir)
      .then(() => {
        const location = path.resolve(startDir, workingDir);
        process.chdir(location);
      });
    });

    after(function() {
      process.chdir(startDir);
    });

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

    beforeEach(function() {
      const options = {
        app: false,
        parser: false
      };
      processor = new DependendenciesManager('.', logger, options);
      processor.runningRoot = true;
      return fs.ensureDir(workingDir);
    });

    afterEach(function() {
      return fs.remove(workingDir);
    });

    it('Should install basic dependencies', function() {
      this.timeout(30000);
      return fs.writeJson(bowerFile, bowerContent)
      .then(() => processor._processDependencies())
      .then(() => {
        return finishTest([
          path.join('.', 'bower_components'),
          path.join('.', 'bower_components', 'arc-polyfills')
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
      this.timeout(30000);
      processor.opts.app = true;
      return fs.writeJson(bowerFile, bowerContent)
      .then(() => processor._processDependencies())
      .then(() => {
        return finishTest([
          path.join('.', 'bower_components'),
          path.join('.', 'bower_components', 'arc-polyfills'),
          path.join('.', 'bower_components', 'app-route')
        ]);
      });
    });

    it('Should install basic dependencies with RAML parser', function() {
      this.timeout(30000);
      processor.opts.parser = true;
      processor.opts.app = false;
      return fs.writeJson(bowerFile, bowerContent)
      .then(() => processor._processDependencies())
      .then(() => {
        return finishTest([
          path.join('.', 'bower_components'),
          path.join('.', 'bower_components', 'raml-js-parser'),
          path.join('.', 'bower_components', 'raml-json-enhance')
        ]);
      });
    });
  });
});
