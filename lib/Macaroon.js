var MacaroonsSerializer = require('./MacaroonsSerializer');
var Macaroon = (function () {
    function Macaroon(location, identifier, signature) {
        this.identifier = identifier;
        this.location = location;
        this.signature = signature;
        this.signatureBuffer = new Buffer(signature, 'hex');
    }
    Macaroon.prototype.serialize = function () {
        return MacaroonsSerializer.serialize(this);
    };
    return Macaroon;
})();
module.exports = Macaroon;
