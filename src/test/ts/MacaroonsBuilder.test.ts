/*
 * Copyright 2014 Martin W. Kirst
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import MacaroonsBuilder = require('../../main/ts/MacaroonsBuilder');

describe('MacaroonBuilderTest', function () {

  var location = "http://mybank/";
  var identifier = "we used our secret key";
  var secret = "this is our super secret key; only we should know it";

  it("create a Macaroon and verify signature location and identfier using secret string", function () {

    var m = new MacaroonsBuilder(location, secret, identifier).getMacaroon();

    expect(m.location).toEqual(location);
    expect(m.identifier).toEqual(identifier);
    expect(m.signature).toEqual("e3d9e02908526c4c0039ae15114115d97fdd68bf2ba379b342aaf0f617d0552f");
  });

  it("create a Macaroon and verify signature location and identfier using secret Buffer ", function () {

    var m = new MacaroonsBuilder(location, Buffer.from(secret,'ascii'), identifier).getMacaroon();

    expect(m.location).toEqual(location);
    expect(m.identifier).toEqual(identifier);
    expect(m.signature).toEqual("5c748a4dabfd5ff2a0b5ab56120c8021912b591ac09023b4bffbc6e1b54e664f");
  });

  it("create a Macaroon with static helper function using secret string", function () {

    var m = MacaroonsBuilder.create(location, secret, identifier);

    expect(m.location).toEqual(location);
    expect(m.identifier).toEqual(identifier);
    expect(m.signature).toEqual("e3d9e02908526c4c0039ae15114115d97fdd68bf2ba379b342aaf0f617d0552f");
  });

  it("create a Macaroon with static helper function using secret Buffer", function () {

    var m = MacaroonsBuilder.create(location, Buffer.from(secret,'ascii'), identifier);

    expect(m.location).toEqual(location);
    expect(m.identifier).toEqual(identifier);
    expect(m.signature).toEqual("5c748a4dabfd5ff2a0b5ab56120c8021912b591ac09023b4bffbc6e1b54e664f");
  });

  it("create a Macaroon and inspect", function () {

    var inspect = MacaroonsBuilder.create(location, secret, identifier).inspect();

    expect(inspect).toEqual(
        "location http://mybank/\n" +
        "identifier we used our secret key\n" +
        "signature e3d9e02908526c4c0039ae15114115d97fdd68bf2ba379b342aaf0f617d0552f\n"
    );
  });

  it("different locations doesnt change the signatures", function () {

    var m1 = new MacaroonsBuilder("http://location_ONE", secret, identifier).getMacaroon();
    var m2 = new MacaroonsBuilder("http://location_TWO", secret, identifier).getMacaroon();

    expect(m1.signature).toEqual(m2.signature);
  });


});
