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
  /**
   * @constructor
   * @param {Object} opts User passed options.
   */
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
     *
     * @deprecated This option is only relevant for the console version 4. It
     * may be removed in future releases.
     * @type {Boolean}
     */
    this.parser = typeof opts.parser === 'boolean' ? opts.parser : false;
    /**
     * If set it installs `app-route` element to support standalone application
     * architecture of the API console.
     *
     * @deprecated This option is only relevant for the console version 4. It
     * may be removed in future releases.
     * @type {Boolean}
     */
    this.app = typeof opts.app === 'boolean' ? opts.app : false;
    /**
     * If true it installs dependencies for API console version 4.
     *
     * Version has different build system and different dependencies.
     * In 5 logic to manage additional dependencies is moved to the
     * builder module. This only installs dependencies.
     *
     * @type {Boolean}
     */
    this.isV4 = typeof opts.isV4 === 'boolean' ? opts.isV4 : false;
    /**
     * List of optional dependencies to install besides the ones installed
     * with bower file. It contains the list to of bower dependencies as it
     * would be defined in bower.json file.
     *
     * This isn relevant for console v5 build process which manages dependencies
     * differently.
     *
     * #### Example
     *
     * ```
     * ["PolymerElements\app-route#^2.0.0"]
     * ```
     * @type {Array<String>}
     */
    this.optionalDependencies = opts.optionalDependencies;
  }
}
exports.DependenciesOptions = DependenciesOptions;
