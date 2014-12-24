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
import MacaroonsVerifier = require('../../main/ts/MacaroonsVerifier');
import TimestampCaveatVerifier = require('../../main/ts/verifier/TimestampCaveatVerifier');
import Macaroon = require('../../main/ts/Macaroon');


describe('MacaroonsPrepareRequestAndVerifyTest', function () {

  var identifier;
  var secret;
  var location;
  var caveat_key;
  var publicIdentifier;
  var predicate;
  var M;
  var DP;
  var D;

  function setup() {
    secret = "this is a different super-secret key; never use the same secret twice";
    publicIdentifier = "we used our other secret key";
    location = "http://mybank/";
    M = new MacaroonsBuilder(location, secret, publicIdentifier)
        .add_first_party_caveat("account = 3735928559")
        .getMacaroon();
    expect(M.signature).to.be("1434e674ad84fdfdc9bc1aa00785325c8b6d57341fc7ce200ba4680c80786dda");

    caveat_key = "4; guaranteed random by a fair toss of the dice";
    predicate = "user = Alice";
    identifier = send_to_auth_and_recv_identifier(caveat_key, predicate);

    M = new MacaroonsBuilder(M)
        .add_third_party_caveat("http://auth.mybank/", caveat_key, identifier)
        .getMacaroon();
    expect(M.signature).to.be("d27db2fd1f22760e4c3dae8137e2d8fc1df6c0741c18aed4b97256bf78d1f55c");
  }

  function send_to_auth_and_recv_identifier(caveat_key:string, predicate:string) {
    return "this was how we remind auth of key/pred";
  }

  function preparing_a_macaroon_for_request() {
    setup();

    caveat_key = "4; guaranteed random by a fair toss of the dice";
    identifier = "this was how we remind auth of key/pred";
    D = new MacaroonsBuilder("http://auth.mybank/", caveat_key, identifier)
        .add_first_party_caveat("time < 2015-01-01T00:00")
        .getMacaroon();
    expect(D.signature).to.be("82a80681f9f32d419af12f6a71787a1bac3ab199df934ed950ddf20c25ac8c65");

    DP = new MacaroonsBuilder(M)
        .prepare_for_request(D)
        .getMacaroon();

    expect(DP.signature).to.be("2eb01d0dd2b4475330739140188648cf25dda0425ea9f661f1574ca0a9eac54e");
  }


  it("test#1 preparing a macaroon for request", function() {
    setup();
    preparing_a_macaroon_for_request();
  });


  it("verifying_valid", function() {
    setup();
    preparing_a_macaroon_for_request();

    var valid = new MacaroonsVerifier(M)
        .satisfyExact("account = 3735928559")
        .satisfyGeneral(TimestampCaveatVerifier)
        .satisfy3rdParty(DP)
        .isValid(secret);

    expect(valid).to.be(true);
  });


  it("verifying unprepared macaroon -> has to fail", function() {
    setup();
    preparing_a_macaroon_for_request();

    var valid = new MacaroonsVerifier(M)
        .satisfyExact("account = 3735928559")
        .satisfyGeneral(TimestampCaveatVerifier)
        .satisfy3rdParty(D)
        .isValid(secret);

    expect(valid).to.be(false);
  });


  it("verifying macaroon without satisfying 3rd party -> has to fail", function() {
    setup();
    preparing_a_macaroon_for_request();

    var valid = new MacaroonsVerifier(M)
        .satisfyExact("account = 3735928559")
        .satisfyGeneral(TimestampCaveatVerifier)
        .isValid(secret);

    expect(valid).to.be(false);
  });

});
