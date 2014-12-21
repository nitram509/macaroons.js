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
import MacaroonsDeSerializer = require('../../main/ts/MacaroonsDeSerializer');

describe('MacaroonDeSerializerTest', function () {

  var location = "http://mybank/";
  var secret = "this is our super secret key; only we should know it";
  var identifier = "we used our secret key";

  it("a macaroon can be de-serialized", function () {

    var m:Macaroon = new MacaroonsBuilder(location, secret, identifier).getMacaroon();
    var serialized = m.serialize();

    var deserialized:Macaroon = MacaroonsDeSerializer.deserialize(serialized);

    expect(m.identifier).to.be(deserialized.identifier);
    expect(m.location).to.be(deserialized.location);
    expect(m.signature).to.be(deserialized.signature);
  });

});
