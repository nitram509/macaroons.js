"use strict";
var CaveatPacketType = require("./CaveatPacketType");
var MacaroonsSerializer = require("./MacaroonsSerializer");
var MacaroonsConstants = require("./MacaroonsConstants");
var Macaroon = (function () {
    function Macaroon(location, identifier, signature, caveats) {
        this.caveatPackets = [];
        this.identifier = identifier;
        this.location = location;
        this.signature = signature ? signature.toString('hex') : undefined;
        this.signatureBuffer = signature;
        this.caveatPackets = caveats ? caveats : [];
    }
    Macaroon.prototype.serialize = function () {
        return MacaroonsSerializer.serialize(this);
    };
    Macaroon.prototype.inspect = function () {
        return this.createKeyValuePacket(CaveatPacketType.location, this.location)
            + this.createKeyValuePacket(CaveatPacketType.identifier, this.identifier)
            + this.createCaveatsPackets(this.caveatPackets)
            + this.createKeyValuePacket(CaveatPacketType.signature, this.signature);
    };
    Macaroon.prototype.createKeyValuePacket = function (type, value) {
        return value != null ? CaveatPacketType[type] + MacaroonsConstants.KEY_VALUE_SEPARATOR_STR + value + MacaroonsConstants.LINE_SEPARATOR_STR : "";
    };
    Macaroon.prototype.createCaveatsPackets = function (caveats) {
        if (caveats == null)
            return "";
        var text = "";
        for (var i = 0; i < caveats.length; i++) {
            var packet = caveats[i];
            text += this.createKeyValuePacket(packet.type, packet.getValueAsText());
        }
        return text;
    };
    return Macaroon;
}());
module.exports = Macaroon;
