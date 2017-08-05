# api-console-dependency-manager

https://travis-ci.org/advanced-rest-client/api-console-dependency-manager.svg?branch=master

A npm module to detect and install Mulesoft's API console dependencies.

This module is mainly used in the [api-console-builder](https://github.com/mulesoft-labs/api-console-builder).

## API

Shorthand functions:

-   `installDependencies(workingDir, logger, opts)` -> `new DependendenciesManager#installDependencies(workingDir, logger, opts)`

The module exposes 2 classes:

-   [DependendenciesManager](lib/dependencies.js)
-   [DependenciesOptions](lib/dependencies-options.js)

### Example

```javascript
const consoleDependencies = require('api-console-dependency-manager');

consoleDependencies.installDependencies('./build/', console, {
  verbose: true,
  parser: true,
  app: true
})
.then(() => console.log('Dependencies are now installed'))
.catch(cause => console.error(cause));
```

equivalent to

```javascript
const {DependendenciesManager, DependenciesOptions} = require('api-console-github-resolver');

const options = new DependenciesOptions({
  verbose: true,
  parser: true,
  app: true
});
const workingDir = './build/';
const logger = console; // Winston or other with console like interface
const manager = new DependendenciesManager(workingDir, logger, options);
manager.installDependencies()
.then(() => console.log('Dependencies are now installed'))
.catch(cause => console.error(cause));
```

### DependenciesOptions

| Property | Type | Default | Description |
| -------- | -------- | -------- | -------- |
| `verbose` | `Boolean` | `false` | Prints verbose output while installing dependencies. This is used to build install command for bower which is printing console output by default. |
| `parser` | `Boolean` | `false` | If set it installs RAML javascript parser with the enhancer. |
| `app` | `Boolean` | `false` | If set it installs `app-route` element to support standalone application architecture of the API console. |

### DependendenciesManager

#### Constructor

##### Arguments

| Property | Type | Description |
| -------- | -------- | -------- |
| `workingDir` | `String` | Path to a working directory where the console is processed. Usually it's where the bower.json file is. |
| `logger` | `Object` | Any logger with the interface compatible with platform's `console` object. |
| `options` | `Object` or `DependenciesOptions` | Build options passed to the module. |

#### `installDependencies()`

Installs dependencies in the `workingDir`.

##### Return <Promise>

Resolved promise when operation is completed.
