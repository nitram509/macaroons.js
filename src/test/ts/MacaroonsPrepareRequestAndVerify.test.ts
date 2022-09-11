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
import MacaroonsVerifier = require('../../main/ts/MacaroonsVerifier');
import TimestampCaveatVerifier = require('../../main/ts/verifier/TimestampCaveatVerifier');

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
    expect(M.signature).toEqual("1434e674ad84fdfdc9bc1aa00785325c8b6d57341fc7ce200ba4680c80786dda");

    caveat_key = "4; guaranteed random by a fair toss of the dice";
    predicate = "user = Alice";
    identifier = send_to_auth_and_recv_identifier(caveat_key, predicate);

    M = new MacaroonsBuilder(M)
        .add_third_party_caveat("http://auth.mybank/", caveat_key, identifier)
        .getMacaroon();
    expect(M.signature).toEqual("d27db2fd1f22760e4c3dae8137e2d8fc1df6c0741c18aed4b97256bf78d1f55c"); // TODO: find out, why this fails from time to time (not always re-producible, see build test results)
  }

  function send_to_auth_and_recv_identifier(caveat_key:string, predicate:string) {
    return "this was how we remind auth of key/pred";
  }

  function preparing_a_macaroon_for_request() {
    setup();

    caveat_key = "4; guaranteed random by a fair toss of the dice";
    identifier = "this was how we remind auth of key/pred";
    D = new MacaroonsBuilder("http://auth.mybank/", caveat_key, identifier)
        .add_first_party_caveat("time < 2025-01-01T00:00")
        .getMacaroon();
    expect(D.signature).toEqual("b338d11fb136c4b95c86efe146f77978cd0947585375ba4d4da4ef68be2b3e8b");

    DP = new MacaroonsBuilder(M)
        .prepare_for_request(D)
        .getMacaroon();

    expect(DP.signature).toEqual("f8718cd3d2cc250344c072ea557c36a4f5a963353a5b664b0faa709e0d65ad9f");
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

    expect(valid).toEqual(true);
  });


  it("verifying with wrong secret -> has to fail, but no exceptions", function() {
    setup();
    preparing_a_macaroon_for_request();

    var valid = new MacaroonsVerifier(M)
        .satisfyExact("account = 3735928559")
        .satisfyGeneral(TimestampCaveatVerifier)
        .satisfy3rdParty(DP)
        .isValid("wrong secret");

    expect(valid).toEqual(false);
  });


  it("verifying unprepared macaroon -> has to fail", function() {
    setup();
    preparing_a_macaroon_for_request();

    var valid = new MacaroonsVerifier(M)
        .satisfyExact("account = 3735928559")
        .satisfyGeneral(TimestampCaveatVerifier)
        .satisfy3rdParty(D)
        .isValid(secret);

    expect(valid).toEqual(false);
  });


  it("verifying macaroon without satisfying 3rd party -> has to fail", function() {
    setup();
    preparing_a_macaroon_for_request();

    var valid = new MacaroonsVerifier(M)
        .satisfyExact("account = 3735928559")
        .satisfyGeneral(TimestampCaveatVerifier)
        .isValid(secret);

    expect(valid).toEqual(false);
  });

});
