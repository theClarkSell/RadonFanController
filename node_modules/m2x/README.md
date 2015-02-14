# AT&T's M2X Node.js Client

[AT&T M2X](http://m2x.att.com) is a cloud-based fully managed time-series data storage service for network connected machine-to-machine (M2M) devices and the Internet of Things (IoT). 

The [AT&T M2X API](https://m2x.att.com/developer/documentation/overview) provides all the needed operations and methods to connect your devices to AT&T's M2X service. This library aims to provide a simple wrapper to interact with the AT&T M2X API for [Node.js](http://nodejs.org/). Refer to the [Glossary of Terms](https://m2x.att.com/developer/documentation/glossary) to understand the nomenclature used throughout this documentation.


Getting Started
==========================
1. Signup for an [M2X Account](https://m2x.att.com/signup).
2. Obtain your _Master Key_ from the Master Keys tab of your [Account Settings](https://m2x.att.com/account) screen.
2. Create your first [Device](https://m2x.att.com/devices) and copy its _Device ID_.
3. Review the [M2X API Documentation](https://m2x.att.com/developer/documentation/overview).


## Installation

m2x-nodejs is available as an npm package. Install the latest version with:

    npm install m2x


## Usage ##

### M2X Class ###

The main object encapsulating all API functionality is the global variable ``M2X``.
In order to create a M2X object you will need an API key, which can be either a Master Key or a key belonging to a specific device (in which case you will only be allowed to read/write to this device).

The following is a short example on how to instantiate an M2X object:

```javascript
var M2X = require("m2x");

var m2x = new M2X("<API-KEY>");
```

The M2X object also provides a simple method for checking the API status (so if you are having connectivity issues, you can check whether the API is currently down):

```javascript
m2x.status(function(status) {
    console.log(status);
});
```

An M2X object provides methods for communicating with the remote API. Methods are organized under the following modules: `keys`, `devices`, `charts` and `distributions`.

- [Distributions](src/distributions.js)
  ```javascript
  m2x.distributions.view("<DISTRIBUTION-ID>", function(response) {
      console.log(response.json);
  });

  m2x.distributions.list(function(response) {
      console.log(response.json);
  });
  ```

- [Devices](src/devices.js)
  ```javascript
  m2x.devices.view("<DEVICE-ID>", function(response) {
      console.log(response.json);
  });

  m2x.devices.list(function(response) {
      console.log(response.json);
  });
  ```

- [Keys](src/keys.js)
  ```javascript
  m2x.keys.view("<KEY-TOKEN>", function(response) {
      console.log(response.json);
  });

  m2x.keys.list(function(response) {
      console.log(response.json);
  });
  ```

Refer to the documentation on each class for further usage instructions.

## Examples ##

```javascript
//
// This is a simple application that requests the list
// of available devices for the provided API Key and then
// prints the details for each of those devices
//

var API_KEY = "<YOUR KEY>",
    M2X = require("m2x"),
    m2xClient = new M2X(API_KEY);

m2xClient.devices.list(function(response) {
    if (response.isSuccess()) {
        response.json.devices.forEach(function(device) {
            console.log(device);
        });
    } else {
        console.log(response.error());
    }
});
```

## Example usage ##

You can find the examples in the [`examples`](examples) directory.

To use them, you should set up your key in [`examples/config.js`](examples/config.js), then execute like: `$ node examples/print-devices.js`.


## Versioning

This library aims to adhere to [Semantic Versioning 2.0.0](http://semver.org/). As a summary, given a version number `MAJOR.MINOR.PATCH`:

1. `MAJOR` will increment when backwards-incompatible changes are introduced to the client.
2. `MINOR` will increment when backwards-compatible functionality is added.
3. `PATCH` will increment with backwards-compatible bug fixes.

Additional labels for pre-release and build metadata are available as extensions to the `MAJOR.MINOR.PATCH` format.

**Note**: the client version does not necessarily reflect the version used in the AT&T M2X API.

## License ##

This library is provided under the MIT license. See [LICENSE](LICENSE) for applicable terms.


## Acknowledgements ##

This client is a direct port of Leandro Lopez' [AT&T M2X client for Ruby](https://github.com/attm2x/m2x-ruby) so all the credit should go to him.
