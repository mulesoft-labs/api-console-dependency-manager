'use strict';
/**
 * Copyright (C) Mulesoft.
 * Shared under Apache 2.0 license
 *
 * @author Pawel Psztyc
 */
const {DependenciesOptions} = require('./dependencies-options');
const fs = require('fs-extra');
const path = require('path');
const bower = require('bower');
/**
 * A class responsible for installing API Console dependencies.
 *
 * This installs bower in working directory and then installs bower
 * dependencies in the same location.
 *
 * This will do nothing if in the `workingDir` location there's no `bower.json`
 * file. This can be useful if local source files for the API Console contains
 * all the dependencies already and there's no need to install them again.
 */
class DependendenciesManager {
  /**
   * Constructs the processor.
   *
   * @param {String} workingDir Path to a working directory instance.
   * @param {?DependenciesOptions} opts Options passed to the module
   * @param {?Object} logger Logger to use to log debug output
   */
  constructor(workingDir, opts, logger) {
    if (!(opts instanceof DependenciesOptions)) {
      opts = new DependenciesOptions(opts);
    }
    /**
     * @type {DependenciesOptions}
     */
    this.opts = opts;
    /**
     * Looger object to be used to pring verbose or error messages.
     */
    this.logger = this._setupLogger(logger);
    /**
     * A directory where all operations will be performed
     *
     * @type {String}
     */
    this.workingDir = workingDir;
  }
  /**
   * Returns a logger object. Either passed object or `console` is used.
   *
   * @param {?Object} logger A logger object with common logging functions
   * like `info`, `log`, `warn` and `error`
   * @return {Object}
   */
  _setupLogger(logger) {
    if (logger) {
      return logger;
    }
    return console;
  }
  /**
   * Installs bower dependencies if the `bower.json` file exists in `workingDir`
   *
   * @return {Promise} Resolved promise when operation is completed.
   */
  installDependencies() {
    return fs.pathExists(path.join(this.workingDir, 'bower.json'))
    .then((exists) => {
      if (!exists) {
        // no bower file, exit.
        this.logger.info('No bower file. Skipping dependencies.');
        return;
      }
      return this._processDependencies();
    });
  }
  /**
   * Processes dependencies installation.
   * It checks if bower is already installed in local machine and if it is
   * it will use installed version. If not it installs bower locally.
   *
   * Next, it insttalls bower dependencies.
   * For certain types of builds more dependencies are required. If needed
   * it will install additional dependencies that are not set in API console
   * bower file.
   *
   * @return {Promise} A promise resolve itself when all dependencies are
   * installed.
   */
  _processDependencies() {
    this.logger.info('Installing bower dependencies...');
    return new Promise((resolve, reject) => {
      const factory = bower.commands.install([], {}, {
        cwd: this.workingDir,
        quiet: true
      });
      factory.on('end', () => resolve());
      factory.on('error', (e) => reject(e));
    })
    .then(() => {
      this.logger.info('Dependencies installed.');
      return this._installAdditionalDependencies();
    });
  }
  /**
   * If required (for certain types of the console build options) it installs
   * additional bower dependencies like router, parser and enhancer.
   *
   * @return {Promise} Promise resolved when additional dependencies are
   * installed.
   */
  _installAdditionalDependencies() {
    let deps = [];
    if (this.opts.parser) {
      deps[deps.length] = 'advanced-rest-client/raml-js-parser';
      deps[deps.length] = 'advanced-rest-client/raml-json-enhance';
    }
    if (this.opts.app) {
      deps[deps.length] = 'PolymerElements/app-route#^1.0.0';
    }
    if (deps.length) {
      this.logger.info('Installing additional bower dependencies...');
      this.logger.info('Installing: ', deps);
      return new Promise((resolve, reject) => {
        const factory = bower.commands.install(deps, {}, {
          cwd: this.workingDir,
          quiet: true
        });
        factory.on('end', () => resolve());
        factory.on('error', (e) => reject(e));
      });
    }
    return Promise.resolve();
  }
}
exports.DependendenciesManager = DependendenciesManager;
