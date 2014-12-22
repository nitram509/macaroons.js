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

import MacaroonsBuilder = require('../../main/ts/MacaroonsBuilder');
import CaveatPacketType = require('../../main/ts/CaveatPacketType');
import Macaroon = require('../../main/ts/Macaroon');


describe('MacaroonBuilderCaveatsTest', function () {

  var location = "http://mybank/";
  var identifier = "we used our secret key";
  var secret = "this is our super secret key; only we should know it";


  it("add first party caveat", function () {

    var m = new MacaroonsBuilder(location, secret, identifier)
        .add_first_party_caveat("account = 3735928559")
        .getMacaroon();

    expect(m.location).to.be(location);
    expect(m.identifier).to.be(identifier);
    expect(m.caveatPackets[0].getValueAsText()).to.be("account = 3735928559");
    expect(m.signature).to.be("1efe4763f290dbce0c1d08477367e11f4eee456a64933cf662d79772dbb82128");
  });


  it("modify also copies first party caveats", function () {

    // given
    var m = new MacaroonsBuilder(location, secret, identifier)
        .add_first_party_caveat("account = 3735928559")
        .getMacaroon();

    // when
    m = MacaroonsBuilder.modify(m)
        .getMacaroon();

    expect(m.location).to.be(location);
    expect(m.identifier).to.be(identifier);
    expect(m.caveatPackets[0].getValueAsText()).to.be("account = 3735928559");
    expect(m.signature).to.be("1efe4763f290dbce0c1d08477367e11f4eee456a64933cf662d79772dbb82128");
  });


  it("add first party caveat 3 times", function () {

    // given
    var m = new MacaroonsBuilder(location, secret, identifier)
        .add_first_party_caveat("account = 3735928559")
        .add_first_party_caveat("time < 2015-01-01T00:00")
        .add_first_party_caveat("email = alice@example.org")
        .getMacaroon();

    expect(m.location).to.be(location);
    expect(m.identifier).to.be(identifier);
    expect(m.caveatPackets[0].type).to.be(CaveatPacketType.cid);
    expect(m.caveatPackets[0].getValueAsText()).to.be("account = 3735928559");
    expect(m.caveatPackets[1].type).to.be(CaveatPacketType.cid);
    expect(m.caveatPackets[1].getValueAsText()).to.be("time < 2015-01-01T00:00");
    expect(m.caveatPackets[2].type).to.be(CaveatPacketType.cid);
    expect(m.caveatPackets[2].getValueAsText()).to.be("email = alice@example.org");
    expect(m.signature).to.be("882e6d59496ed5245edb7ab5b8839ecd63e5d504e54839804f164070d8eed952");
  });


  it("add first party caveat German umlauts using UTF8 encoding", function () {

    // given
    var mb = new MacaroonsBuilder(location, secret, identifier);
    mb = mb.add_first_party_caveat("\u00E4");
    mb = mb.add_first_party_caveat("\u00FC");
    mb = mb.add_first_party_caveat("\u00F6");
    var m = mb.getMacaroon();

    expect(m.location).to.be(location);
    expect(m.identifier).to.be(identifier);
    expect(m.caveatPackets[0].type).to.be(CaveatPacketType.cid);
    expect(m.caveatPackets[0].getValueAsText()).to.be("\u00E4");
    expect(m.caveatPackets[1].type).to.be(CaveatPacketType.cid);
    expect(m.caveatPackets[1].getValueAsText()).to.be("\u00FC");
    expect(m.caveatPackets[2].type).to.be(CaveatPacketType.cid);
    expect(m.caveatPackets[2].getValueAsText()).to.be("\u00F6");
    expect(m.signature).to.be("e38cce985a627fbfaea3490ca184fb8c59ec2bd14f0adc3b5035156e94daa111");
  });


  it("add first party caveat null save", function () {

    // given
    var m = new MacaroonsBuilder(location, secret, identifier)
        .add_first_party_caveat(null)
        .getMacaroon();

    expect(m.location).to.be(location);
    expect(m.identifier).to.be(identifier);
    expect(m.signature).to.be("e3d9e02908526c4c0039ae15114115d97fdd68bf2ba379b342aaf0f617d0552f");
  });


  it("add first party caveat inspect", function () {

    // given
    var m = new MacaroonsBuilder(location, secret, identifier)
        .add_first_party_caveat("account = 3735928559")
        .getMacaroon();

    var inspect = m.inspect();

    expect(inspect).to.be(
        "location http://mybank/\n" +
        "identifier we used our secret key\n" +
        "cid account = 3735928559\n" +
        "signature 1efe4763f290dbce0c1d08477367e11f4eee456a64933cf662d79772dbb82128\n"
    );
  });


});
