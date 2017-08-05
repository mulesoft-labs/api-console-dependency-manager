'use strict';
/**
 * Copyright (C) Mulesoft.
 * Shared under Apache 2.0 license
 *
 * @author Pawel Psztyc <pawel.psztyc@mulesoft.com>
 */
/**
 * Options object for the DependendenciesManager class.
 */
class DependenciesOptions {
  constructor(opts) {
    opts = opts || {};
    /**
     * Prints verbose output while installing dependencies.
     * This is used to build install command for bower which is printing
     * console output by default.
     * @type {Boolean}
     */
    this.verbose = typeof opts.verbose === 'boolean' ? opts.verbose : false;
    /**
     * If set it installs RAML javascript parser with the enhancer.
     * @type {Boolean}
     */
    this.parser = typeof opts.parser === 'boolean' ? opts.parser : false;
    /**
     * If set it installs `app-route` element to support standalone application
     * architecture of the API console.
     * @type {Boolean}
     */
    this.app = typeof opts.app === 'boolean' ? opts.app : false;
  }
}
exports.DependenciesOptions = DependenciesOptions;
