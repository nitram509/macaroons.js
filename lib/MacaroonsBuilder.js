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
var Macaroon = require('./Macaroon');
var CryptoTools = require('./CryptoTools');
/**
 * Used to build and modify Macaroons
 */
var MacaroonsBuilder = (function () {
    function MacaroonsBuilder(location, secretKey, identifier) {
        this.macaroon = null;
        this.macaroon = this.computeMacaroon_with_keystring(location, secretKey, identifier);
    }
    MacaroonsBuilder.prototype.getMacaroon = function () {
        return this.macaroon;
    };
    MacaroonsBuilder.create = function (location, secretKey, identifier) {
        return new MacaroonsBuilder(location, secretKey, identifier).getMacaroon();
    };
    MacaroonsBuilder.prototype.computeMacaroon_with_keystring = function (location, secretKey, identifier) {
        return this.computeMacaroon(location, this.generate_derived_key(secretKey), identifier);
    };
    MacaroonsBuilder.prototype.computeMacaroon = function (location, secretKey, identifier) {
        var hmac = CryptoTools.macaroon_hmac(secretKey, identifier);
        var signature = hmac.toString('hex');
        return new Macaroon(location, identifier, signature);
    };
    MacaroonsBuilder.prototype.generate_derived_key = function (variableKey) {
        var MACAROONS_MAGIC_KEY = "macaroons-key-generator";
        return CryptoTools.macaroon_hmac(new Buffer(MACAROONS_MAGIC_KEY, "utf-8"), variableKey);
    };
    return MacaroonsBuilder;
})();
module.exports = MacaroonsBuilder;
