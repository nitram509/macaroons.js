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
var MacaroonsConstants = require('./MacaroonsConstants');
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
        var secretBuffer = (secret instanceof Buffer) ? secret : CryptoTools.generate_derived_key(secret);
        var result = this.isValid_verify_raw(this.macaroon, secretBuffer);
        if (result.fail) {
            var msg = result.failMessage != null ? result.failMessage : "This macaroon isn't valid.";
            throw new Error(msg);
        }
    };
    MacaroonsVerifier.prototype.isValid = function (secret) {
        var secretBuffer = (secret instanceof Buffer) ? secret : CryptoTools.generate_derived_key(secret);
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
        if (caveat) {
            this.predicates.push(caveat);
        }
        return this;
    };
    /**
     * Binds a prepared macaroon.
     *
     * @param preparedMacaroon preparedMacaroon
     * @return this {@link MacaroonsVerifier}
     */
    MacaroonsVerifier.prototype.satisfy3rdParty = function (preparedMacaroon) {
        if (preparedMacaroon) {
            this.boundMacaroons.push(preparedMacaroon);
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
        if (generalVerifier) {
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
                    if (!this.macaroon_verify_inner_3rd(boundMacaroon, caveat_vid, csig)) {
                        var msg = "Couldn't verify 3rd party macaroon, identifier= " + boundMacaroon.identifier;
                        return new VerificationResult(msg);
                    }
                    var data = caveat.rawValue;
                    var vdata = caveat_vid.rawValue;
                    csig = CryptoTools.macaroon_hash2(csig, vdata, data);
                }
            }
        }
        return new VerificationResult(csig);
    };
    MacaroonsVerifier.prototype.macaroon_verify_inner_3rd = function (M, C, sig) {
        if (!M)
            return false;
        var enc_plaintext = new Buffer(MacaroonsConstants.MACAROON_SECRET_TEXT_ZERO_BYTES + MacaroonsConstants.MACAROON_HASH_BYTES);
        var enc_ciphertext = new Buffer(MacaroonsConstants.MACAROON_HASH_BYTES + MacaroonsConstants.SECRET_BOX_OVERHEAD);
        enc_plaintext.fill(0);
        enc_ciphertext.fill(0);
        var vid_data = C.rawValue;
        //assert vid_data.length == VID_NONCE_KEY_SZ;
        /**
         * the nonce is in the first MACAROON_SECRET_NONCE_BYTES
         * of the vid; the ciphertext is in the rest of it.
         */
        var enc_nonce = new Buffer(MacaroonsConstants.MACAROON_SECRET_NONCE_BYTES);
        vid_data.copy(enc_nonce, 0, 0, enc_nonce.length);
        /* fill in the ciphertext */
        vid_data.copy(enc_ciphertext, 0, MacaroonsConstants.MACAROON_SECRET_NONCE_BYTES, MacaroonsConstants.MACAROON_SECRET_NONCE_BYTES + vid_data.length - MacaroonsConstants.MACAROON_SECRET_NONCE_BYTES);
        try {
            var enc_plaintext = CryptoTools.macaroon_secretbox_open(sig, enc_nonce, enc_ciphertext);
        }
        catch (error) {
            if (/Cipher bytes fail verification/.test(error.message)) {
                return false;
            }
            else {
                throw new Error("Error while deciphering 3rd party caveat, msg=" + error);
            }
        }
        var key = new Buffer(MacaroonsConstants.MACAROON_HASH_BYTES);
        key.fill(0);
        enc_plaintext.copy(key, 0, 0, MacaroonsConstants.MACAROON_HASH_BYTES);
        var vresult = this.macaroon_verify_inner(M, key);
        var data = this.macaroon.signatureBuffer;
        var csig = CryptoTools.macaroon_bind(data, vresult.csig);
        return BufferTools.equals(csig, M.signatureBuffer);
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
