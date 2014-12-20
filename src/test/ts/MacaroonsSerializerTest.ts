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

/// <reference path="../../typings/tsd.d.ts" />

declare var require; // TODO: bad hack to make TSC compile, possible reason https://github.com/Microsoft/TypeScript/issues/954
var expect = require('expect.js');

import Macaroon = require('../../main/ts/Macaroon');
import MacaroonsBuilder = require('../../main/ts/MacaroonsBuilder');
import MacaroonsSerializer = require('../../main/ts/MacaroonsSerializer');

describe('MacaroonSerializerTest', function () {

  var location = "http://mybank/";
  var secret = "this is our super secret key; only we should know it";
  var identifier = "we used our secret key";

  it("a macaroon can be serialized", function () {

    var m = new MacaroonsBuilder(location, secret, identifier).getMacaroon();

    expect(MacaroonsSerializer.serialize(m)).to.be("MDAxY2xvY2F0aW9uIGh0dHA6Ly9teWJhbmsvCjAwMjZpZGVudGlmaWVyIHdlIHVzZWQgb3VyIHNlY3JldCBrZXkKMDAyZnNpZ25hdHVyZSDj2eApCFJsTAA5rhURQRXZf91ovyujebNCqvD2F9BVLwo");
    expect(MacaroonsSerializer.serialize(m)).to.be(m.serialize());
  });

});
