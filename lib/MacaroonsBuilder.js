"use strict";
var CaveatPacket = require("./CaveatPacket");
var CaveatPacketType = require("./CaveatPacketType");
var Macaroon = require("./Macaroon");
var MacaroonsConstants = require("./MacaroonsConstants");
var MacaroonsDeSerializer = require("./MacaroonsDeSerializer");
var CryptoTools = require("./CryptoTools");
var MacaroonsBuilder = (function () {
    function MacaroonsBuilder(arg1, secretKey, identifier) {
        this.macaroon = null;
        if (typeof arg1 === 'string') {
            if (typeof secretKey === 'string' || secretKey instanceof Buffer) {
                this.macaroon = this.computeMacaroon(arg1, secretKey, identifier);
            }
            else {
                throw new Error("The secret key has to be a simple string or an instance of Buffer.");
            }
        }
        else {
            this.macaroon = arg1;
        }
    }
    MacaroonsBuilder.modify = function (macaroon) {
        return new MacaroonsBuilder(macaroon);
    };
    MacaroonsBuilder.prototype.getMacaroon = function () {
        return this.macaroon;
    };
    MacaroonsBuilder.create = function (location, secretKey, identifier) {
        return new MacaroonsBuilder(location, secretKey, identifier).getMacaroon();
    };
    MacaroonsBuilder.deserialize = function (serializedMacaroon) {
        return MacaroonsDeSerializer.deserialize(serializedMacaroon);
    };
    MacaroonsBuilder.prototype.add_first_party_caveat = function (caveat) {
        if (caveat != null) {
            var caveatBuffer = Buffer.from(caveat, MacaroonsConstants.IDENTIFIER_CHARSET);
            if (this.macaroon.caveatPackets.length + 1 > MacaroonsConstants.MACAROON_MAX_CAVEATS) {
                throw new Error("Too many caveats. There are max. " + MacaroonsConstants.MACAROON_MAX_CAVEATS + " caveats allowed.");
            }
            var signature = CryptoTools.macaroon_hmac(this.macaroon.signatureBuffer, caveatBuffer);
            var caveatsExtended = this.macaroon.caveatPackets.concat(new CaveatPacket(CaveatPacketType.cid, caveatBuffer));
            this.macaroon = new Macaroon(this.macaroon.location, this.macaroon.identifier, signature, caveatsExtended);
        }
        return this;
    };
    MacaroonsBuilder.prototype.add_third_party_caveat = function (location, secret, identifier) {
        if (this.macaroon.caveatPackets.length + 1 > MacaroonsConstants.MACAROON_MAX_CAVEATS) {
            throw new Error("Too many caveats. There are max. " + MacaroonsConstants.MACAROON_MAX_CAVEATS + " caveats allowed.");
        }
        var thirdPartyPacket = CryptoTools.macaroon_add_third_party_caveat_raw(this.macaroon.signatureBuffer, secret, identifier);
        var hash = thirdPartyPacket.signature;
        var caveatsExtended = this.macaroon.caveatPackets.concat(new CaveatPacket(CaveatPacketType.cid, identifier), new CaveatPacket(CaveatPacketType.vid, thirdPartyPacket.vid_data), new CaveatPacket(CaveatPacketType.cl, location));
        this.macaroon = new Macaroon(this.macaroon.location, this.macaroon.identifier, hash, caveatsExtended);
        return this;
    };
    MacaroonsBuilder.prototype.prepare_for_request = function (macaroon) {
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
}());
module.exports = MacaroonsBuilder;
