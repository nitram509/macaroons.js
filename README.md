Macaroons are Better Than Cookies!
==================================

This Javascript library (actually, it's written in [Typescript](http://www.typescriptlang.org/))
provides an implementation of macaroons[[1]](http://research.google.com/pubs/pub41892.html),
which are flexible authorization tokens that work great in distributed systems.
Like cookies, macaroons are bearer tokens that enable applications to ascertain whether their
holders' actions are authorized.  But macaroons are better than cookies!

This project started as a port of libmacaroons[[2]](https://github.com/rescrv/libmacaroons) library.
The primary goals are
   * being compatible to libmacaroons (and others)
   * being the reference implementation in the Javascript community ;-)

There is a [playground](http://www.macaroons.io/) (testing environment) available,
where you can build and verify macaroons online. 

## Work in Progress !!!

##### License

[![License: Apache 2.0](https://img.shields.io/:license-Apache%202.0-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)


Build Status
--------------------

[![Build Status](https://travis-ci.org/nitram509/jmacaroons.svg?branch=master)](https://travis-ci.org/nitram509/macaroons.js)
[![Build Status](https://drone.io/github.com/nitram509/macaroons.js/status.png)](https://drone.io/github.com/nitram509/macaroons.js/latest)
[![devDependency Status](https://david-dm.org/nitram509/macaroons.js.png)](https://david-dm.org/nitram509/macaroons.js)
[![devDependency Status](https://david-dm.org/nitram509/macaroons.js/dev-status.png)](https://david-dm.org/nitram509/macaroons.js#info=devDependencies)
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

[![NPM](https://nodei.co/npm/macaroons.js.png)](https://nodei.co/npm/macaroons.js/)

Community & Badges
--------------------

If you like this project, endorse please: [![endorse](https://api.coderwall.com/nitram509/endorsecount.png)](https://coderwall.com/nitram509)


Creating Your First Macaroon
----------------------------------

Lets create a simple macaroon
````Javascript
var MacaroonsBuilder = require('macaroons.js').MacaroonsBuilder;

var location = "http://www.example.org";
var secretKey = "this is our super secret key; only we should know it";
var identifier = "we used our secret key";
var macaroon = MacaroonsBuilder.create(location, secretKey, identifier);
````

Of course, this macaroon can be displayed in a more human-readable form
for easy debugging
````Javascript
sys.puts(macaroon.inspect());

// > location http://www.example.org
// > identifier we used our secret key
// > signature e3d9e02908526c4c0039ae15114115d97fdd68bf2ba379b342aaf0f617d0552f
````


Serializing
----------------------------------

Macaroons are serialized, using Base64 URL safe encoding [RFC 4648](http://www.ietf.org/rfc/rfc4648.txt).
This way you can very easily append it to query string within URIs.

````Javascript
var sys=require('sys');

var serialized = macaroon.serialize();
sys.puts("Serialized: " + serialized);

// > Serialized: MDAyNGxvY2F0aW9uIGh0dHA6Ly93d3cuZXhhbXBsZS5vcmcKMDAyNmlkZW50aWZpZXIgd2UgdXNlZCBvdXIgc2VjcmV0IGtleQowMDJmc2lnbmF0dXJlIOPZ4CkIUmxMADmuFRFBFdl_3Wi_K6N5s0Kq8PYX0FUvCg
````


De-Serializing
----------------------------------

````Javascript
var macaroon = MacaroonsBuilder.deserialize(serialized);
sys.puts(macaroon.inspect());

// > location http://www.example.org
// > identifier we used our secret key
// > signature e3d9e02908526c4c0039ae15114115d97fdd68bf2ba379b342aaf0f617d0552f
````


Verifying Your Macaroon
----------------------------------

A verifier can only ever successfully verify a macaroon
when provided with the macaroon and its corresponding secret - no secret, no authorization.

````Javascript
var MacaroonsVerifier = require('macaroons.js').MacaroonsVerifier;

var verifier = new MacaroonsVerifier(macaroon);
var secret = "this is our super secret key; only we should know it";
var valid = verifier.isValid(secret);

// > True
````