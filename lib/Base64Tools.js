"use strict";
var Base64Tools = (function () {
    function Base64Tools() {
    }
    Base64Tools.transformBase64UrlSafe2Base64 = function (base64) {
        return base64.replace(/-/g, '+').replace(/_/g, '/') + Base64Tools.BASE64_PADDING.substr(0, 3 - (base64.length % 3));
    };
    Base64Tools.encodeBase64UrlSafe = function (base64) {
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    };
    Base64Tools.BASE64_PADDING = '===';
    return Base64Tools;
}());
module.exports = Base64Tools;
