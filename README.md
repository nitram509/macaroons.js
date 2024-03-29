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
   * optimized for Node.js like environment
   * focus on binary serialization format (currently, JSON format isn't supported)
   * being the reference implementation in the Javascript community ;-)

There is a [playground](http://www.macaroons.io/) (testing environment) available,
where you can build and verify macaroons online. 

## Project status: discontinued

This library is no longer actively developed/maintained, but security updates will be made from time to time.
Also, pull requests will be reviewed and if meaningful potentially merged.

##### License

[![License: Apache 2.0](https://img.shields.io/:license-Apache%202.0-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)


Build Status
--------------------

[![Build Status](https://app.travis-ci.com/nitram509/macaroons.js.svg?branch=master)](https://app.travis-ci.com/nitram509/macaroons.js)
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

[![NPM](https://nodei.co/npm/macaroons.js.png)](https://nodei.co/npm/macaroons.js/)

Code Coverage
--------------------

| Statements                | Branches                | Functions                | Lines                |
| ------------------------- | ----------------------- | ------------------------ | -------------------- |
| ![Statements](./coverage/badge-statements.svg) | ![Branches](./coverage/badge-branches.svg) | ![Functions](./coverage/badge-functions.svg) | ![Lines](./coverage/badge-lines.svg) |


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

You may use a Buffer object instead of string to create a macaroon. This yields in better performance.

````Javascript
var secretKey = Buffer.from("39a630867921b61522892779c659934667606426402460f913c9171966e97775", 'hex');
var macaroon = MacaroonsBuilder.create(location, secretKey, identifier);
````


Serializing
----------------------------------

Macaroons are serialized, using 'base64url' encoding, as defined in [RFC 4648](http://www.ietf.org/rfc/rfc4648.txt).
(Hint: this is a special variant that uses URL safe symbols, which regular base64 parser will most likely fail to read.)
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

// > true
````

You may use a Buffer object instead of string to verify the macaroon. This yields in better performance.

````Javascript
var secret = Buffer.from("39a630867921b61522892779c659934667606426402460f913c9171966e97775", 'hex');
var valid = verifier.isValid(secret);
````

Adding Caveats
-----------------------------------

When creating a new macaroon, you can add a caveat to our macaroon that
restricts it to just the account number 3735928559.
````Javascript
var location = "http://www.example.org";
var secretKey = "this is our super secret key; only we should know it";
var identifier = "we used our secret key";
var macaroon = new MacaroonsBuilder(location, secretKey, identifier)
    .add_first_party_caveat("account = 3735928559")
    .getMacaroon();
````

Because macaroon objects are immutable, they have to be modified
via MacaroonsBuilder. Thus, a new macaroon object will be created.
````Javascript
var macaroon = MacaroonsBuilder.modify(macaroon)
    .add_first_party_caveat("account = 3735928559")
    .getMacaroon();
sys.puts(macaroon.inspect());

// > location http://www.example.org
// > identifier we used our secret key
// > cid account = 3735928559
// > signature 1efe4763f290dbce0c1d08477367e11f4eee456a64933cf662d79772dbb82128
````


Verifying Macaroons With Caveats
--------------------------------

The verifier should say that this macaroon is unauthorized because
the verifier cannot prove that the caveat (account = 3735928559) is satisfied.
We can see that it fails just as we would expect.
````Javascript
var location = "http://www.example.org";
var secretKey = "this is our super secret key; only we should know it";
var identifier = "we used our secret key";
var macaroon = new MacaroonsBuilder(location, secretKey, identifier)
    .add_first_party_caveat("account = 3735928559")
    .getMacaroon();
var verifier = new MacaroonsVerifier(macaroon);
sys.puts(verifier.isValid(secretKey));
// > false
````

Caveats like these are called "exact caveats" because there is exactly one way
to satisfy them.  Either the account number is 3735928559, or it isn't.  At
verification time, the verifier will check each caveat in the macaroon against
the list of satisfied caveats provided to "satisfyExact()".  When it finds a
match, it knows that the caveat holds, and it can move onto the next caveat in
the macaroon.
````Javascript
verifier.satisfyExact("account = 3735928559");
sys.puts(verifier.isValid(secretKey));
// > true
````

The verifier can be made more general, and be "future-proofed",
so that it will still function correctly even if somehow the authorization
policy changes; for example, by adding the three following facts,
the verifier will continue to work even if someone decides to
self-attenuate itself macaroons to be only usable from IP address and browser:
````Javascript
verifier.satisfyExact("IP = 127.0.0.1')");
verifier.satisfyExact("browser = Chrome')");
sys.puts(verifier.isValid(secretKey));
// > true
````

There is also a more general way to check caveats, via callbacks.
When providing such a callback to the verifier,
it is able to check if the caveat satisfies special constrains.
````Javascript
var macaroon = new MacaroonsBuilder(location, secretKey, identifier)
    .add_first_party_caveat("time < 2042-01-01T00:00")
    .getMacaroon();
var verifier = new MacaroonsVerifier(macaroon);
sys.puts(verifier.isValid(secretKey));
// > false

var TimestampCaveatVerifier = require('macaroons.js').verifier.TimestampCaveatVerifier;
verifier.satisfyGeneral(TimestampCaveatVerifier);
sys.puts(verifier.isValid(secretKey));
// > true
````


Third Party Caveats
---------------------

Like first-party caveats, third-party caveats restrict the context in which a
macaroon is authorized, but with a different form of restriction.  Where a
first-party caveat is checked directly within the verifier, a third-party caveat
is checked by the third party, who provides a discharge macaroon to prove that
the original third-party caveat is true.  The discharge macaroon is recursively
inspected by the verifier; if it verifies successfully, the discharge macaroon
serves as a proof that the original third-party caveat is satisfied.  Of course,
nothing stops discharge macaroons from containing embedded first- or third-party
caveats for the verifier to consider during verification.

Let's rework the above example to provide Alice with access to her account only
after she authenticates with a service that is separate from the service
processing her banking transactions.

As before, we'll start by constructing a new macaroon with the caveat that is
limited to Alice's bank account.

````Javascript
// create a simple macaroon first
var location = "http://mybank/";
var secret = "this is a different super-secret key; never use the same secret twice";
var publicIdentifier = "we used our other secret key";
var mb = new MacaroonsBuilder(location, secret, publicIdentifier)
    .add_first_party_caveat("account = 3735928559");

// add a 3rd party caveat
// you'll likely want to use a higher entropy source to generate this key
var caveat_key = "4; guaranteed random by a fair toss of the dice";
var predicate = "user = Alice";
// send_to_3rd_party_location_and_do_auth(caveat_key, predicate);
// identifier = recv_from_auth();
var identifier = "this was how we remind auth of key/pred";
var m = mb.add_third_party_caveat("http://auth.mybank/", caveat_key, identifier)
    .getMacaroon();

sys.puts(m.inspect());
// > location http://mybank/
// > identifier we used our other secret key
// > cid account = 3735928559
// > cid this was how we remind auth of key/pred
// > vid AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA027FAuBYhtHwJ58FX6UlVNFtFsGxQHS7uD_w_dedwv4Jjw7UorCREw5rXbRqIKhr
// > cl http://auth.mybank/
// > signature d27db2fd1f22760e4c3dae8137e2d8fc1df6c0741c18aed4b97256bf78d1f55c
````

In a real application, we'd look at these third party caveats, and contact each
location to retrieve the requisite discharge macaroons. We would include the
identifier for the caveat in the request itself, so that the server can recall
the secret used to create the third-party caveat. The server can then generate
and return a new macaroon that discharges the caveat:

````Javascript
Macaroon d = new MacaroonsBuilder("http://auth.mybank/", caveat_key, identifier)
    .add_first_party_caveat("time < 2015-01-01T00:00")
    .getMacaroon();
````

This new macaroon enables the verifier to determine that the third party caveat
is satisfied. Our target service added a time-limiting caveat to this macaroon
that ensures that this discharge macaroon does not last forever.  This ensures
that Alice (or, at least someone authenticated as Alice) cannot use the
discharge macaroon indefinitely and will eventually have to re-authenticate.

Once Alice has both the root macaroon and the discharge macaroon in her
possession, she can make the request to the target service. Making a request
with discharge macaroons is only slightly more complicated than making requests
with a single macaroon. In addition to serializing and transmitting all
involved macaroons, there is preparation step that binds the discharge macaroons
to the root macaroon. This binding step ensures that the discharge macaroon is
useful only when presented alongside the root macaroon. The root macaroon is
used to bind the discharge macaroons like this:

````Javascript
Macaroon dp = MacaroonsBuilder.modify(m)
    .prepare_for_request(d)
    .getMacaroon();
````

If we were to look at the signatures on these prepared discharge macaroons, we
would see that the binding process has irreversibly altered their signature(s).

````Javascript
// > d.signature = 82a80681f9f32d419af12f6a71787a1bac3ab199df934ed950ddf20c25ac8c65
// > dp.signature = 2eb01d0dd2b4475330739140188648cf25dda0425ea9f661f1574ca0a9eac54e
````

The root macaroon 'm' and its discharge macaroons 'dp' are ready for the
request.  Alice can serialize them all and send them to the bank to prove she is
authorized to access her account. The bank can verify them using the same
verifier we built before.  We provide the discharge macaroons as a third
argument to the verify call:

````Javascript
new MacaroonsVerifier(m)
    .satisfyExact("account = 3735928559")
    .satisfyGeneral(new TimestampCaveatVerifier())
    .satisfy3rdParty(dp)
    .assertIsValid(secret);
// > ok.
````

Without the 'prepare_for_request()' call, the verification would fail.


Commonly used verifier, shipped with jmacaroons
--------------------------------------------------

##### Time to live verification

Applying a timestamp in the future to a macaroon will provide time to live semantics.
Given that all machines have synchronized clocks, a general macaroon verifier is able to check
for expiration.

````Javascript
var macaroon = new MacaroonsBuilder(location, secretKey, identifier)
    .add_first_party_caveat("time < 2055-01-01T00:00")
    .getMacaroon();

var TimestampCaveatVerifier = require('macaroons.js').verifier.TimestampCaveatVerifier;
new MacaroonsVerifier(macaroon)
    .satisfyGeneral(TimestampCaveatVerifier)
    .isValid(secretKey);
// > true
````


Choosing Secrets
-------------------

For clarity, we've generated human-readable secrets that we use as the root keys
of all of our macaroons.  In practice, this is terribly insecure and can lead to
macaroons that can easily be forged because the secret is too predictable.  To
avoid this, we recommend generating secrets using a sufficient number of
suitably random bytes.  Because the bytes are a secret key, they should be drawn
from a source with enough entropy to ensure that the key cannot be guessed
before the macaroon falls out of use.

The macaroons.js library exposes a constant that is the ideal number of bytes these
secret keys should contain.  Any shorter is wasting an opportunity for security.

````Javascript
var MACAROON_SUGGESTED_SECRET_LENGTH = require('macaroons.js').MacaroonsConstants.MACAROON_SUGGESTED_SECRET_LENGTH; // == 32
````


Performance
--------------

There's a little micro benchmark, which demonstrates the performance of macaroons.js

Source: https://gist.github.com/nitram509/35b3570edfd9144f37e5

Environment: Windows 8.1 64bit, Node.js v0.10.34 64bit, Intel i7-4790 @3.60GHz

````text
Results
----------
macaroons.js benchmark:
serialize with secret string x 47,210 ops/sec ±1.48% (93 runs sampled)
serialize with secret Buffer x 61,923 ops/sec ±1.29% (94 runs sampled)
de-serialize and verify with secret string x 64,655 ops/sec ±1.29% (93 runs sampled)
de-serialize and verify with secret Buffer x 93,117 ops/sec ±1.34% (94 runs sampled)
````


Known issues
----------------

### incompatibility to Node.js v0.12

Macaroons.js was developed using Node.js v01.12.
All tests run fine, what you can see at Travis-CI build log
[macaroons.js job#53.1](https://travis-ci.org/nitram509/macaroons.js/jobs/61749295).

After one year of no commits, suddenly the same tests fail, see build log
[macaroons.js job#55.1](https://travis-ci.org/nitram509/macaroons.js/jobs/135430053).

Interestingly, on my local machine, using Node.js v0.12.4 (same as failing on Travis)
all tests still run fine.
This leads me to the conclusion that something inside my ```node_modules``` folder
is responsible for successful test results. To verify this thesis, I deleted the projects
```node_modules``` folder and did ```npm install``` again.
After that, my local Node.js v0.12.4 also fails to run the tests (same as on Travis-CI).
But if I use Node.js 4.4+, the test run fine again :-/

*Conclusion*: Some downstream dependencies infer with the installed Node.js version.
Right now I'm too lazy to find the root cause and keep v.0.12.4 compatibility for Macaroons.js.
The simplest "solution" is to use an up-to-date Node.js runtime version ;-)

**Since Sep.2022, macaroon.js is using Github actions and TravisCI history might no more be available.**

## Stargazers over time

[![Stargazers over time](https://starchart.cc/nitram509/macaroons.js.svg)](https://starchart.cc/nitram509/macaroons.js)

