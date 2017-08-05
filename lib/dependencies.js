'use strict';
/**
 * Copyright (C) Mulesoft.
 * Shared under Apache 2.0 license
 *
 * @author Pawel Psztyc
 */
const {DependenciesOptions} = require('./dependencies-options');
const {exec} = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const platform = process.platform;
const isWin = platform !== 'darwin' && platform.indexOf('win') !== -1;
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
   * @param {Winston} logger Logger to use to log debug output
   * @param {DependenciesOptions} opts Options passed to the module
   */
  constructor(workingDir, logger, opts) {
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
    this.logger = logger;
    /**
     * A directory where all operations will be performed
     *
     * @type {String}
     */
    this.workingDir = workingDir;
    /**
     * A bower command root. It's a path to the bower command and it depends
     * on install location.
     *
     * @type {String}
     */
    this.commandRoot = undefined;
    /**
     * Is updated when `installDependencies()` is called.
     * Alters the command so bower will not fail if current user is root.
     */
    this.runningRoot = false;
  }
  /**
   * Installs bower dependencies if the `bower.json` file exists in `workingDir`
   *
   * @return {Promise} Resolved promise when operation is completed.
   */
  installDependencies() {
    this.__startDir = process.cwd();
    try {
      process.chdir(this.workingDir);
    } catch (err) {
      return Promise.reject(new Error(err));
    }
    return this.checkIsRoot()
    .then(isRoot => {
      this.runningRoot = isRoot;
    })
    .then(() => this.hasBower())
    .then(hasFile => {
      if (!hasFile) {
        // no bower file, exit.
        this.logger.info('No bower file. Skipping dependencies.');
        return;
      }
      return this._processDependencies();
    })
    .then(() => {
      process.chdir(this.__startDir);
    })
    .catch(cause => {
      process.chdir(this.__startDir);
      throw cause;
    });
  }
  /**
   * Checks if bower file exists in `workingDir`.
   *
   * @return {Promise} A promise resolved to boolean value determining if the
   * `bower.json` file exists.
   */
  hasBower() {
    return fs.lstat('bower.json')
    .then(stats => {
      return stats.isFile();
    })
    .catch(() => {
      return false;
    });
  }
  /**
   * Prepares bower command options depending on environment and options.
   *
   * @param {String} command to execute, what is after `$ bower`
   * @return {String} Full comand to execute.
   */
  _prepareBowerCommand(command) {
    let cmd = this.commandRoot;
    if (!this.opts.verbose) {
      cmd += ' --quiet';
    }
    if (this.runningRoot) {
      cmd += ' --allow-root';
    }
    cmd += ' ' + command;
    return cmd;
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
    var promise;
    if (this.commandRoot) {
      promise = Promise.resolve();
    } else {
      promise = this._setBowerCommandRoot();
    }
    return promise.then(() => {
      this.logger.info('Installing bower dependencies...');
      let cmd = this._prepareBowerCommand('install');
      return this.exec(cmd);
    })
    .then(() => {
      this.logger.info('Dependencies installed.');
      return this._installAdditionalDependencies();
    });
  }
  /**
   * Checks if bower is installed and if not it installs it locally.
   * After that it constructs a bower command root depending on the OS.
   *
   * @return {Promise} Resolved promise when command is set and bower is
   * installed.
   */
  _setBowerCommandRoot() {
    const localCommand = path.join('.', 'node_modules', '.bin', 'bower');
    return fs.pathExists(localCommand)
    .then(exists => {
      if (!exists) {
        return this._ensureNpmPackage()
        .then(() => {
          this.logger.info('installing bower in ' + process.cwd());
          return this.exec('npm install bower');
        });
      }
    })
    .then(() => {
      this.commandRoot = localCommand;
    });
  }
  /**
   * Checks if `package.json` file exists in current location and creates it
   * if it doesn't so the `npm install` command install bower in current
   * directory.
   */
  _ensureNpmPackage() {
    return fs.pathExists('package.json')
    .then(exists => {
      if (!exists) {
        this.logger.info('package.json file do not exists. Creating dummy file for npm.');
        return this._createDummyNpmPackage();
      }
    });
  }
  /**
   * Creates a dummy `package.json` file in current directory.
   * TODO: Some way to clean it later.
   */
  _createDummyNpmPackage() {
    const content = {
      name: 'api-console',
      version: '0.0.1',
      description: 'Dummy package. To be removed.',
      license: 'CPAL-1.0'
    };
    return fs.writeJson('package.json', content);
  }
  /**
   * If required (for certain types of the console build options) it installs
   * additional bower dependencies like router, parser and enhancer.
   *
   * @return {Promise} Promise resolved when additional dependencies are
   * installed.
   */
  _installAdditionalDependencies() {
    var deps = [];
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
      let cmd = this._prepareBowerCommand('install ' + deps.join(' '));
      return this.exec(cmd);
    }
    return Promise.resolve();
  }
  /**
   * Executea shell command
   *
   * @param {String} cmd Command to execute
   * @param {?String} dir A directoy where to execute the command.
   * @return {Promise} Promise resolves itself if the command was executed
   * successfully and rejects it there was an error.
   */
  exec(cmd, dir) {
    dir = dir || undefined;
    return new Promise((resolve, reject) => {
      var opts = {};
      if (dir) {
        opts.cwd = dir;
      }

      let log = `Executing command: ${cmd}`;
      if (dir) {
        log += ` in dir: ${dir}`;
      }
      this.logger.info(log);
      exec(cmd, opts, (err, stdout, stderr) => {
        if (err) {
          let currentDir = opts.cwd || process.cwd();
          let message = '  Unable to execute previous command with error: ';
          message += err.message.trim() + '.\n  Was in dir: ' + currentDir + '. stdout: ';
          message += stdout + '. stderr: ' + stderr;
          this.logger.error(message);
          reject(new Error(err.message.trim()));
          return;
        }
        resolve(stdout);
      });
    });
  }
  /**
   * Commands executed as root will fail under linux.
   * This checks if current user is root
   */
  checkIsRoot() {
    if (isWin) {
      return Promise.resolve(false);
    }
    return this.exec('id -u')
    .then((response) => {
      if (!response) {
        return false;
      }
      response = response.trim();
      if (response.indexOf('0') === 0) {
        return true;
      }
      return false;
    })
    .catch(() => false);
  }
}
exports.DependendenciesManager = DependendenciesManager;
