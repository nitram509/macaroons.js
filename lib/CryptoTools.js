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
var crypto = require('crypto');
var nacl = require('ecma-nacl');
var toBuffer = require('typedarray-to-buffer');
var MacaroonsConstants = require('./MacaroonsConstants');
var ThirdPartyPacket = require('./ThirdPartyPacket');
var CryptoTools = (function () {
    function CryptoTools() {
    }
    CryptoTools.generate_derived_key = function (variableKey) {
        var MACAROONS_MAGIC_KEY = "macaroons-key-generator";
        return CryptoTools.macaroon_hmac(new Buffer(MACAROONS_MAGIC_KEY, "utf-8"), new Buffer(variableKey, MacaroonsConstants.IDENTIFIER_CHARSET));
    };
    CryptoTools.macaroon_hmac = function (key, message) {
        if (typeof message === 'undefined')
            throw new Error("Missing second parameter 'message'.");
        var mac = crypto.createHmac('sha256', key);
        if (typeof message === 'string') {
            mac.update(new Buffer(message, MacaroonsConstants.IDENTIFIER_CHARSET));
        }
        else {
            mac.update(message);
        }
        return mac.digest();
    };
    CryptoTools.macaroon_hash2 = function (key, message1, message2) {
        var tmp = new Buffer(2 * MacaroonsConstants.MACAROON_HASH_BYTES);
        CryptoTools.macaroon_hmac(key, message1).copy(tmp, 0, 0, MacaroonsConstants.MACAROON_HASH_BYTES);
        CryptoTools.macaroon_hmac(key, message2).copy(tmp, MacaroonsConstants.MACAROON_HASH_BYTES, 0, MacaroonsConstants.MACAROON_HASH_BYTES);
        return CryptoTools.macaroon_hmac(key, tmp);
    };
    CryptoTools.macaroon_add_third_party_caveat_raw = function (old_sig, key, identifier) {
        var derived_key = CryptoTools.generate_derived_key(key);
        var enc_nonce = new Buffer(MacaroonsConstants.MACAROON_SECRET_NONCE_BYTES);
        enc_nonce.fill(0);
        /* XXX get some random bytes instead */
        var enc_plaintext = new Buffer(MacaroonsConstants.MACAROON_HASH_BYTES);
        enc_plaintext.fill(0);
        /* now encrypt the key to give us vid */
        derived_key.copy(enc_plaintext, 0, 0, MacaroonsConstants.MACAROON_HASH_BYTES);
        var enc_ciphertext = CryptoTools.macaroon_secretbox(old_sig, enc_nonce, enc_plaintext);
        var vid = new Buffer(MacaroonsConstants.VID_NONCE_KEY_SZ);
        vid.fill(0);
        enc_nonce.copy(vid, 0, 0, MacaroonsConstants.MACAROON_SECRET_NONCE_BYTES);
        enc_ciphertext.copy(vid, MacaroonsConstants.MACAROON_SECRET_NONCE_BYTES, 0, MacaroonsConstants.VID_NONCE_KEY_SZ - MacaroonsConstants.MACAROON_SECRET_NONCE_BYTES);
        var new_sig = CryptoTools.macaroon_hash2(old_sig, vid, new Buffer(identifier, MacaroonsConstants.IDENTIFIER_CHARSET));
        return new ThirdPartyPacket(new_sig, vid);
    };
    CryptoTools.macaroon_bind = function (Msig, MPsig) {
        var key = new Buffer(MacaroonsConstants.MACAROON_HASH_BYTES);
        key.fill(0);
        return CryptoTools.macaroon_hash2(key, Msig, MPsig);
    };
    CryptoTools.macaroon_secretbox = function (key, nonce, plaintext) {
        var cipher_bytes = nacl.secret_box.pack(new Uint8Array(plaintext), new Uint8Array(nonce), new Uint8Array(key));
        return toBuffer(cipher_bytes);
    };
    CryptoTools.macaroon_secretbox_open = function (enc_key, enc_nonce, ciphertext) {
        var plain_bytes = nacl.secret_box.open(new Uint8Array(ciphertext), new Uint8Array(enc_nonce), new Uint8Array(enc_key));
        return toBuffer(plain_bytes);
    };
    return CryptoTools;
})();
module.exports = CryptoTools;
