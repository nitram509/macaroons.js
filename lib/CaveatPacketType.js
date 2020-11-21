"use strict";
var CaveatPacketType;
(function (CaveatPacketType) {
    CaveatPacketType[CaveatPacketType["location"] = 0] = "location";
    CaveatPacketType[CaveatPacketType["identifier"] = 1] = "identifier";
    CaveatPacketType[CaveatPacketType["signature"] = 2] = "signature";
    CaveatPacketType[CaveatPacketType["cid"] = 3] = "cid";
    CaveatPacketType[CaveatPacketType["vid"] = 4] = "vid";
    CaveatPacketType[CaveatPacketType["cl"] = 5] = "cl";
})(CaveatPacketType || (CaveatPacketType = {}));
module.exports = CaveatPacketType;
