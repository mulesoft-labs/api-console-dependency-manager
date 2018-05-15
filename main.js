'use strict';

const {DependendenciesManager} = require('./lib/dependencies.js');
const {DependenciesOptions} = require('./lib/dependencies-options.js');

/**
 * Copyright (C) Mulesoft.
 * Shared under Apache 2.0 license
 *
 * @author Pawel Psztyc <pawel.psztyc@mulesoft.com>
 */

/**
 * Sorthand function to `DependendenciesManager#installDependencies()`.
 *
 * @param {String} workingDir Path to a working directory instance.
 * @param {DependenciesOptions} opts Options passed to the module
 * @param {Winston} logger Logger to use to log debug output
 * @return {Promise} Resolved promise when operation is completed.
 */
module.exports.installDependencies = function(workingDir, opts, logger) {
  const manager = new DependendenciesManager(workingDir, opts, logger);
  return manager.installDependencies();
};
/**
 * A library to install API console dependencies.
 */
module.exports.DependendenciesManager = DependendenciesManager;
/**
 * A library to be used to create manager's options object.
 */
module.exports.DependenciesOptions = DependenciesOptions;
