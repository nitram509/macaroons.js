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
var CaveatPacketType = require('./CaveatPacketType');
var BufferTools = require('./BufferTools');
var CryptoTools = require('./CryptoTools');
/**
 * Used to verify Macaroons
 */
var MacaroonsVerifier = (function () {
    function MacaroonsVerifier(macaroon) {
        this.predicates = [];
        this.boundMacaroons = [];
        this.generalCaveatVerifiers = [];
        this.macaroon = macaroon;
    }
    MacaroonsVerifier.prototype.assertIsValid = function (secret) {
        var secretBuffer = CryptoTools.generate_derived_key(secret);
        var result = this.isValid_verify_raw(this.macaroon, secretBuffer);
        if (result.fail) {
            throw result.failMessage != null ? result.failMessage : "This macaroon isn't valid.";
        }
    };
    /**
     * @param secret secret this secret will be enhanced, in case it's shorter than {@link MacaroonsConstants.MACAROON_SUGGESTED_SECRET_LENGTH}
     * @return true/false if the macaroon is valid
     */
    MacaroonsVerifier.prototype.isValid = function (secret) {
        var secretBuffer = CryptoTools.generate_derived_key(secret);
        return !this.isValid_verify_raw(this.macaroon, secretBuffer).fail;
    };
    /**
     * Caveats like these are called "exact caveats" because there is exactly one way
     * to satisfy them.  Either the given caveat matches, or it doesn't.  At
     * verification time, the verifier will check each caveat in the macaroon against
     * the list of satisfied caveats provided to satisfyExact(String).
     * When it finds a match, it knows that the caveat holds and it can move onto the next caveat in
     * the macaroon.
     *
     * @param caveat caveat
     * @return this {@link MacaroonsVerifier}
     */
    MacaroonsVerifier.prototype.satisfyExact = function (caveat) {
        if (typeof caveat !== 'undefined') {
            this.predicates.push(caveat);
        }
        return this;
    };
    /**
     * Another technique for informing the verifier that a caveat is satisfied
     * allows for expressive caveats. Whereas exact caveats are checked
     * by simple byte-wise equality, general caveats are checked using
     * an application-provided callback that returns true if and only if the caveat
     * is true within the context of the request.
     * There's no limit on the contents of a general caveat,
     * so long as the callback understands how to determine whether it is satisfied.
     * This technique is called "general caveats".
     *
     * @param generalVerifier generalVerifier a function(caveat:string):boolean which does the verification
     * @return this {@link MacaroonsVerifier}
     */
    MacaroonsVerifier.prototype.satisfyGeneral = function (generalVerifier) {
        if (typeof generalVerifier !== undefined) {
            this.generalCaveatVerifiers.push(generalVerifier);
        }
        return this;
    };
    MacaroonsVerifier.prototype.isValid_verify_raw = function (M, secret) {
        var vresult = this.macaroon_verify_inner(M, secret);
        if (!vresult.fail) {
            vresult.fail = !BufferTools.equals(vresult.csig, this.macaroon.signatureBuffer);
            if (vresult.fail) {
                vresult = new VerificationResult("Verification failed. Signature doesn't match. Maybe the key was wrong OR some caveats aren't satisfied.");
            }
        }
        return vresult;
    };
    MacaroonsVerifier.prototype.macaroon_verify_inner = function (M, key) {
        var csig = CryptoTools.macaroon_hmac(key, M.identifier);
        if (M.caveatPackets != null) {
            var caveatPackets = M.caveatPackets;
            for (var i = 0; i < caveatPackets.length; i++) {
                var caveat = caveatPackets[i];
                if (caveat == null)
                    continue;
                if (caveat.type == 5 /* cl */)
                    continue;
                if (!(caveat.type == 3 /* cid */ && caveatPackets[Math.min(i + 1, caveatPackets.length - 1)].type == 4 /* vid */)) {
                    if (MacaroonsVerifier.containsElement(this.predicates, caveat.getValueAsText()) || this.verifiesGeneral(caveat.getValueAsText())) {
                        csig = CryptoTools.macaroon_hmac(csig, caveat.rawValue);
                    }
                }
                else {
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
    };
    MacaroonsVerifier.prototype.findBoundMacaroon = function (identifier) {
        for (var i = 0; i < this.boundMacaroons.length; i++) {
            var boundMacaroon = this.boundMacaroons[i];
            if (identifier === boundMacaroon.identifier) {
                return boundMacaroon;
            }
        }
        return null;
    };
    MacaroonsVerifier.prototype.verifiesGeneral = function (caveat) {
        var found = false;
        for (var i = 0; i < this.generalCaveatVerifiers.length; i++) {
            var verifier = this.generalCaveatVerifiers[i];
            found = found || verifier(caveat);
        }
        return found;
    };
    MacaroonsVerifier.containsElement = function (elements, anElement) {
        if (elements != null) {
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                if (element === anElement)
                    return true;
            }
        }
        return false;
    };
    return MacaroonsVerifier;
})();
var VerificationResult = (function () {
    function VerificationResult(arg) {
        this.csig = null;
        this.fail = false;
        this.failMessage = null;
        if (typeof arg === 'string') {
            this.failMessage = arg;
            this.fail = true;
        }
        else if (typeof arg === 'object') {
            this.csig = arg;
        }
    }
    return VerificationResult;
})();
module.exports = MacaroonsVerifier;
//# sourceMappingURL=MacaroonsVerifier.js.map