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

import CaveatPacket = require('./CaveatPacket');
import CaveatPacketType = require('./CaveatPacketType');
import Macaroon = require('./Macaroon');
import BufferTools = require('./BufferTools');
import MacaroonsDeSerializer = require('./MacaroonsDeSerializer');
import CryptoTools = require('./CryptoTools');
import GeneralCaveatVerifier = require('./GeneralCaveatVerifier');

export = MacaroonsVerifier;

/**
 * Used to verify Macaroons
 */
class MacaroonsVerifier {

  "use strict";

  private predicates:string[] = [];
  private boundMacaroons:Macaroon[] = [];
  private generalCaveatVerifiers:GeneralCaveatVerifier[] = [];
  private macaroon:Macaroon;

  constructor(macaroon:Macaroon) {
    this.macaroon = macaroon;
  }

  public assertIsValid(secret:string):void {
    var secretBuffer = CryptoTools.generate_derived_key(secret);
    var result = this.isValid_verify_raw(this.macaroon, secretBuffer);
    if (result.fail) {
      throw result.failMessage != null ? result.failMessage : "This macaroon isn't valid.";
    }
  }

  /**
   * @param secret secret this secret will be enhanced, in case it's shorter than {@link MacaroonsConstants.MACAROON_SUGGESTED_SECRET_LENGTH}
   * @return true/false if the macaroon is valid
   */
  public isValid(secret:string):boolean {
    var secretBuffer = CryptoTools.generate_derived_key(secret);
    return !this.isValid_verify_raw(this.macaroon, secretBuffer).fail;
  }

  private  isValid_verify_raw(M:Macaroon, secret:Buffer):VerificationResult {
    var vresult = this.macaroon_verify_inner(M, secret);
    if (!vresult.fail) {
      vresult.fail = !BufferTools.equals(vresult.csig, this.macaroon.signatureBuffer);
      if (vresult.fail) {
        vresult = new VerificationResult("Verification failed. Signature doesn't match. Maybe the key was wrong OR some caveats aren't satisfied.");
      }
    }
    return vresult;
  }

  private macaroon_verify_inner(M:Macaroon, key:Buffer):VerificationResult {
    var csig:Buffer = CryptoTools.macaroon_hmac(key, M.identifier);
    if (M.caveatPackets != null) {
      var caveatPackets = M.caveatPackets;
      for (var i = 0; i < caveatPackets.length; i++) {
        var caveat = caveatPackets[i];
        if (caveat == null) continue;
        if (caveat.type == CaveatPacketType.cl) continue;
        if (!(caveat.type == CaveatPacketType.cid && caveatPackets[Math.min(i + 1, caveatPackets.length - 1)].type == CaveatPacketType.vid)) {
          if (MacaroonsVerifier.containsElement(this.predicates, caveat.getValueAsText()) || this.verifiesGeneral(caveat.getValueAsText())) {
            csig = CryptoTools.macaroon_hmac(csig, caveat.rawValue);
          }
        } else {
          i++;
          var caveat_vid = caveatPackets[i];
          var boundMacaroon = this.findBoundMacaroon(caveat.getValueAsText());
          if (boundMacaroon == null) {
            var msg = "Couldn't verify 3rd party macaroon, because no discharged macaroon was provided to the verifier.";
            return new VerificationResult(msg);
          }
          //if (!macaroon_verify_inner_3rd(boundMacaroon, caveat_vid, csig)) {
          //  var msg = "Couldn't verify 3rd party macaroon, identifier= " + boundMacaroon.identifier;
          //  return new VerificationResult(msg);
          //}
          var data = caveat.rawValue;
          var vdata = caveat_vid.rawValue;
          csig = CryptoTools.macaroon_hash2(csig, vdata, data);
        }
      }
    }
    return new VerificationResult(csig);
  }

  private findBoundMacaroon(identifier:string):Macaroon {
    for (var i = 0; i < this.boundMacaroons.length; i++) {
      var boundMacaroon = this.boundMacaroons[i];
      if (identifier === boundMacaroon.identifier) {
        return boundMacaroon;
      }
    }
    return null;
  }

  private verifiesGeneral(caveat:string):boolean {
    var found:boolean = false;
    for (var i = 0; i < this.generalCaveatVerifiers.length; i++) {
      var verifier:GeneralCaveatVerifier = this.generalCaveatVerifiers[i];
      found = found || verifier.verifyCaveat(caveat);
    }
    return found;
  }

  private static containsElement(elements:string[], anElement:string):boolean {
    if (elements != null) {
      for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if (element === anElement) return true;
      }
    }
    return false;
  }

}


class VerificationResult {
  csig:Buffer = null;
  fail:boolean = false;
  failMessage:string = null;

  constructor(csig:Buffer);
  constructor(failMessage:string);
  constructor(arg:any) {
    if (typeof arg === 'string') {
      this.failMessage = arg;
      this.fail = true;
    } else if (typeof arg === 'object') {
      this.csig = arg;
    }
  }

}