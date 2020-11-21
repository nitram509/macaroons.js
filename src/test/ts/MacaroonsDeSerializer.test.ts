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

import Macaroon = require('../../main/ts/Macaroon');
import MacaroonsBuilder = require('../../main/ts/MacaroonsBuilder');
import MacaroonsDeSerializer = require('../../main/ts/MacaroonsDeSerializer');
import CaveatPacketType = require('../../main/ts/CaveatPacketType');
import Base64Tools = require('../../main/ts/Base64Tools');

describe('MacaroonDeSerializerTest', function () {

  var location = "http://mybank/";
  var secret = "this is our super secret key; only we should know it";
  var identifier = "we used our secret key";

  it("a macaroon can be de-serialized", function () {

    var m:Macaroon = new MacaroonsBuilder(location, secret, identifier).getMacaroon();
    var serialized = m.serialize();

    var deserialized:Macaroon = MacaroonsDeSerializer.deserialize(serialized);

    expect(m.identifier).toEqual(deserialized.identifier);
    expect(m.location).toEqual(deserialized.location);
    expect(m.signature).toEqual(deserialized.signature);
  });

  it("a macaroon with caveats can be de-serialized", function () {

    var m:Macaroon = new MacaroonsBuilder(location, secret, identifier)
      .add_first_party_caveat("test = first_party")
      .add_third_party_caveat("third_party_location", "third_party_key", "test = third_party")
      .getMacaroon();
    var serialized = m.serialize();

    var vidAsBase64 = Buffer.from(Base64Tools.transformBase64UrlSafe2Base64("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANLvrJ16nNUxLJ18zzy+kqCJ3dX2JTjTWl4c/F1aFDVWUgQ5W3Klk3eC7SoOU7acF"), 'base64');

    var deserialized:Macaroon = MacaroonsDeSerializer.deserialize(serialized);

    expect(m.identifier).toEqual(deserialized.identifier);
    expect(m.location).toEqual(deserialized.location);
    expect(m.caveatPackets[0].type).toEqual(CaveatPacketType.cid);
    expect(m.caveatPackets[0].getValueAsText()).toEqual("test = first_party");
    expect(m.caveatPackets[1].type).toEqual(CaveatPacketType.cid);
    expect(m.caveatPackets[1].getValueAsText()).toEqual("test = third_party");
    expect(m.caveatPackets[2].type).toEqual(CaveatPacketType.vid);
    expect(m.caveatPackets[2].getRawValue().toString('base64')).toEqual(vidAsBase64.toString('base64'));
    expect(m.caveatPackets[3].type).toEqual(CaveatPacketType.cl);
    expect(m.caveatPackets[3].getValueAsText()).toEqual('third_party_location');
    expect(m.signature).toEqual(deserialized.signature);
  });

  it("to short base64 throws Error", function () {
    // packet is: "123"
    expect(() => {
      MacaroonsDeSerializer.deserialize("MTIzDQo=")
    }).toThrowError(/.*Not enough bytes for signature found.*/);
  });

  it("invalid packet length throws Error", function () {
    // packet is: "fffflocation http://mybank12345678901234567890.com"
    expect(() => {
      MacaroonsDeSerializer.deserialize("ZmZmZmxvY2F0aW9uIGh0dHA6Ly9teWJhbmsxMjM0NTY3ODkwMTIzNDU2Nzg5MC5jb20=")
    }).toThrowError(/.*Not enough data bytes available.*/);
  });

});
