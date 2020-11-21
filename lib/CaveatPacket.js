"use strict";
var CaveatPacketType = require("./CaveatPacketType");
var MacaroonsConstants = require("./MacaroonsConstants");
var Base64Tools = require("./Base64Tools");
var CaveatPacket = (function () {
    function CaveatPacket(type, value) {
        if (typeof value === 'undefined')
            throw new Error("Missing second parameter 'value' from type 'string' or 'Buffer'");
        this.type = type;
        if (typeof value === 'string') {
            this.rawValue = Buffer.from(value, MacaroonsConstants.IDENTIFIER_CHARSET);
        }
        else {
            this.rawValue = value;
        }
    }
    CaveatPacket.prototype.getRawValue = function () {
        return this.rawValue;
    };
    CaveatPacket.prototype.getValueAsText = function () {
        if (this.valueAsText == null) {
            this.valueAsText = (this.type == CaveatPacketType.vid)
                ? Base64Tools.encodeBase64UrlSafe(this.rawValue.toString('base64'))
                : this.rawValue.toString(MacaroonsConstants.IDENTIFIER_CHARSET);
        }
        return this.valueAsText;
    };
    return CaveatPacket;
}());
module.exports = CaveatPacket;
