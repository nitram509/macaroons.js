"use strict";
var ThirdPartyPacket = (function () {
    function ThirdPartyPacket(signature, vid_data) {
        this.signature = signature;
        this.vid_data = vid_data;
    }
    return ThirdPartyPacket;
}());
module.exports = ThirdPartyPacket;
