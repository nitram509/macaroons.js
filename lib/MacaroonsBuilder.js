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
var CaveatPacket = require('./CaveatPacket');
var CaveatPacketType = require('./CaveatPacketType');
var Macaroon = require('./Macaroon');
var MacaroonsConstants = require('./MacaroonsConstants');
var MacaroonsDeSerializer = require('./MacaroonsDeSerializer');
var CryptoTools = require('./CryptoTools');
/**
 * Used to build and modify Macaroons
 */
var MacaroonsBuilder = (function () {
    function MacaroonsBuilder(arg1, secretKey, identifier) {
        this.macaroon = null;
        if (typeof arg1 === 'string') {
            if (typeof secretKey !== 'string' && !(secretKey instanceof Buffer)) {
                throw new Error("The secret key has to be a simple string or an instance of Buffer.");
            }
            this.macaroon = this.computeMacaroon(arg1, secretKey, identifier);
        }
        else {
            this.macaroon = arg1;
        }
    }
    /**
     * @param macaroon macaroon
     * @return {@link MacaroonsBuilder}
     */
    MacaroonsBuilder.modify = function (macaroon) {
        return new MacaroonsBuilder(macaroon);
    };
    /**
     * @return a {@link Macaroon}
     */
    MacaroonsBuilder.prototype.getMacaroon = function () {
        return this.macaroon;
    };
    MacaroonsBuilder.create = function (location, secretKey, identifier) {
        return new MacaroonsBuilder(location, secretKey, identifier).getMacaroon();
    };
    /**
     * @param serializedMacaroon serializedMacaroon
     * @return {@link Macaroon}
     * @throws Error when serialized macaroon is not valid base64, length is to short or contains invalid packet data
     */
    MacaroonsBuilder.deserialize = function (serializedMacaroon) {
        return MacaroonsDeSerializer.deserialize(serializedMacaroon);
    };
    /**
     * @param caveat caveat
     * @return this {@link MacaroonsBuilder}
     * @throws Error if there are more than {@link MacaroonsConstants.MACAROON_MAX_CAVEATS} caveats.
     */
    MacaroonsBuilder.prototype.add_first_party_caveat = function (caveat) {
        if (caveat != null) {
            var caveatBuffer = new Buffer(caveat, MacaroonsConstants.IDENTIFIER_CHARSET);
            //assert caveatBytes.length < MacaroonsConstants.MACAROON_MAX_STRLEN;
            if (this.macaroon.caveatPackets.length + 1 > MacaroonsConstants.MACAROON_MAX_CAVEATS) {
                throw new Error("Too many caveats. There are max. " + MacaroonsConstants.MACAROON_MAX_CAVEATS + " caveats allowed.");
            }
            var signature = CryptoTools.macaroon_hmac(this.macaroon.signatureBuffer, caveatBuffer);
            var caveatsExtended = this.macaroon.caveatPackets.concat(new CaveatPacket(3 /* cid */, caveatBuffer));
            this.macaroon = new Macaroon(this.macaroon.location, this.macaroon.identifier, signature, caveatsExtended);
        }
        return this;
    };
    /**
     * @param location   location
     * @param secret     secret
     * @param identifier identifier
     * @return this {@link MacaroonsBuilder}
     * @throws Error if there are more than {@link MacaroonsConstants#MACAROON_MAX_CAVEATS} caveats.
     */
    MacaroonsBuilder.prototype.add_third_party_caveat = function (location, secret, identifier) {
        //assert location.length() < MACAROON_MAX_STRLEN;
        //assert identifier.length() < MACAROON_MAX_STRLEN;
        if (this.macaroon.caveatPackets.length + 1 > MacaroonsConstants.MACAROON_MAX_CAVEATS) {
            throw new Error("Too many caveats. There are max. " + MacaroonsConstants.MACAROON_MAX_CAVEATS + " caveats allowed.");
        }
        var thirdPartyPacket = CryptoTools.macaroon_add_third_party_caveat_raw(this.macaroon.signatureBuffer, secret, identifier);
        var hash = thirdPartyPacket.signature;
        var caveatsExtended = this.macaroon.caveatPackets.concat(new CaveatPacket(3 /* cid */, identifier), new CaveatPacket(4 /* vid */, thirdPartyPacket.vid_data), new CaveatPacket(5 /* cl */, location));
        this.macaroon = new Macaroon(this.macaroon.location, this.macaroon.identifier, hash, caveatsExtended);
        return this;
    };
    /**
     * @param macaroon macaroon used for preparing a request
     * @return this {@link MacaroonsBuilder}
     * @throws Error
     */
    MacaroonsBuilder.prototype.prepare_for_request = function (macaroon) {
        //assert macaroon.signatureBytes.length > 0;
        //assert getMacaroon().signatureBytes.length > 0;
        var hash = CryptoTools.macaroon_bind(this.getMacaroon().signatureBuffer, macaroon.signatureBuffer);
        this.macaroon = new Macaroon(macaroon.location, macaroon.identifier, hash, macaroon.caveatPackets);
        return this;
    };
    MacaroonsBuilder.prototype.computeMacaroon = function (location, key, identifier) {
        if (typeof key === 'string') {
            key = CryptoTools.generate_derived_key(key);
        }
        var signature = CryptoTools.macaroon_hmac(key, identifier);
        return new Macaroon(location, identifier, signature);
    };
    return MacaroonsBuilder;
})();
module.exports = MacaroonsBuilder;
