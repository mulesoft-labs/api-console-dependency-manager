'use strict';

const {DependendenciesManager} = require('../lib/dependencies.js');
const assert = require('chai').assert;
const fs = require('fs-extra');
const path = require('path');

describe('DependencyProcessor - APIC v5', function() {
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
      'arc-definitions': 'advanced-rest-client/arc-definitions#^2.0.0'
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
      isV4: false,
      optionalDependencies: ['advanced-rest-client/bytes-counter#^2.0.0']
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
    .then(() => processor.installDependencies())
    .then(() => {
      return finishTest([
        path.join(workingDir, 'bower_components'),
        path.join(workingDir, 'bower_components', 'arc-definitions')
      ]);
    });
  });

  it('Should install additional dependencies', function() {
    this.timeout(300000);
    return fs.writeJson(bowerFile, bowerContent)
    .then(() => processor.installDependencies())
    .then(() => {
      return finishTest([
        path.join(workingDir, 'bower_components', 'bytes-counter')
      ]);
    });
  });
});
