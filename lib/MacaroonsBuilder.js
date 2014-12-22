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
var MacaroonsDeSerializer = require('./MacaroonsDeSerializer');
var CryptoTools = require('./CryptoTools');
/**
 * Used to build and modify Macaroons
 */
var MacaroonsBuilder = (function () {
    /**
     * @param location   location
     * @param secretKey  secretKey this secret will be enhanced, in case it's shorter than {@link MacaroonsConstants.MACAROON_SUGGESTED_SECRET_LENGTH}
     * @param identifier identifier
     */
    function MacaroonsBuilder(location, secretKey, identifier) {
        this.macaroon = null;
        this.macaroon = this.computeMacaroon_with_keystring(location, secretKey, identifier);
    }
    MacaroonsBuilder.prototype.getMacaroon = function () {
        return this.macaroon;
    };
    /**
     * @param location   location
     * @param secretKey  secretKey
     * @param identifier identifier
     * @return {@link Macaroon}
     */
    MacaroonsBuilder.create = function (location, secretKey, identifier) {
        return new MacaroonsBuilder(location, secretKey, identifier).getMacaroon();
    };
    /**
     * @param serializedMacaroon serializedMacaroon
     * @return {@link Macaroon}
     * @throws Exception when serialized macaroon is not valid base64, length is to short or contains invalid packet data
     */
    MacaroonsBuilder.deserialize = function (serializedMacaroon) {
        return MacaroonsDeSerializer.deserialize(serializedMacaroon);
    };
    MacaroonsBuilder.prototype.computeMacaroon_with_keystring = function (location, secretKey, identifier) {
        return this.computeMacaroon(location, CryptoTools.generate_derived_key(secretKey), identifier);
    };
    MacaroonsBuilder.prototype.computeMacaroon = function (location, secretKey, identifier) {
        var hmac = CryptoTools.macaroon_hmac(secretKey, identifier);
        return new Macaroon(location, identifier, hmac);
    };
    return MacaroonsBuilder;
})();
module.exports = MacaroonsBuilder;
