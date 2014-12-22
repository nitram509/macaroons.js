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
var MacaroonsContants = require('./MacaroonsConstants');
var CryptoTools = (function () {
    function CryptoTools() {
    }
    CryptoTools.generate_derived_key = function (variableKey) {
        var MACAROONS_MAGIC_KEY = "macaroons-key-generator";
        return CryptoTools.macaroon_hmac(new Buffer(MACAROONS_MAGIC_KEY, "utf-8"), new Buffer(variableKey, MacaroonsContants.IDENTIFIER_CHARSET));
    };
    CryptoTools.macaroon_hmac = function (key, message) {
        if (typeof message === 'undefined')
            throw "Missing second parameter 'message'.";
        var mac = crypto.createHmac('sha256', key);
        if (typeof message === 'string') {
            mac.update(new Buffer(message, MacaroonsContants.IDENTIFIER_CHARSET));
        }
        else {
            mac.update(message);
        }
        return mac.digest();
    };
    CryptoTools.macaroon_hash2 = function (key, message1, message2) {
        var tmp = new Buffer(2 * MacaroonsContants.MACAROON_HASH_BYTES);
        CryptoTools.macaroon_hmac(key, message1).copy(tmp, 0, 0, MacaroonsContants.MACAROON_HASH_BYTES);
        CryptoTools.macaroon_hmac(key, message2).copy(tmp, 0, MacaroonsContants.MACAROON_HASH_BYTES, MacaroonsContants.MACAROON_HASH_BYTES + MacaroonsContants.MACAROON_HASH_BYTES);
        return CryptoTools.macaroon_hmac(key, tmp);
    };
    return CryptoTools;
})();
module.exports = CryptoTools;
