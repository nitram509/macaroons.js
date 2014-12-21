var CaveatPacketType = require('./CaveatPacketType');
var MacaroonsSerializer = require('./MacaroonsSerializer');
var MacaroonsContants = require('./MacaroonsContants');
/**
 * <p>
 * Macaroons: Cookies with Contextual Caveats for Decentralized Authorization in the Cloud
 * </p>
 * This is an immutable and serializable object.
 * Use {@link MacaroonsBuilder} to modify it.
 * Use {@link MacaroonsVerifier} to verify it.
 *
 * @see <a href="http://research.google.com/pubs/pub41892.html">http://research.google.com/pubs/pub41892.html</a>
 */
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
    Macaroon.prototype.inspect = function () {
        return this.createKeyValuePacket(0 /* location */, this.location) + this.createKeyValuePacket(1 /* identifier */, this.identifier) + this.createCaveatsPackets(this.caveatPackets) + this.createKeyValuePacket(2 /* signature */, this.signature);
    };
    Macaroon.prototype.createKeyValuePacket = function (type, value) {
        return value != null ? CaveatPacketType[type] + MacaroonsContants.KEY_VALUE_SEPARATOR_STR + value + MacaroonsContants.LINE_SEPARATOR_STR : "";
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
})();
module.exports = Macaroon;
