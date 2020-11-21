"use strict";
var Macaroon = require("./Macaroon");
var CaveatPacket = require("./CaveatPacket");
var CaveatPacketType = require("./CaveatPacketType");
var MacaroonsConstants = require("./MacaroonsConstants");
var Base64Tools = require("./Base64Tools");
var MacaroonsDeSerializer = (function () {
    function MacaroonsDeSerializer() {
    }
    MacaroonsDeSerializer.deserialize = function (serializedMacaroon) {
        var data = Buffer.from(Base64Tools.transformBase64UrlSafe2Base64(serializedMacaroon), 'base64');
        var minLength = MacaroonsConstants.MACAROON_HASH_BYTES + MacaroonsConstants.KEY_VALUE_SEPARATOR_LEN + MacaroonsConstants.SIGNATURE.length;
        if (data.length < minLength) {
            throw new Error("Couldn't deserialize macaroon. Not enough bytes for signature found. There have to be at least " + minLength + " bytes");
        }
        return MacaroonsDeSerializer.deserializeStream(new StatefulPacketReader(data));
    };
    MacaroonsDeSerializer.deserializeStream = function (packetReader) {
        var location = null;
        var identifier = null;
        var caveats = [];
        var signature = null;
        var s;
        var raw;
        for (var packet; (packet = MacaroonsDeSerializer.readPacket(packetReader)) != null;) {
            if (MacaroonsDeSerializer.bytesStartWith(packet.data, MacaroonsConstants.LOCATION_BYTES)) {
                location = MacaroonsDeSerializer.parsePacket(packet, MacaroonsConstants.LOCATION_BYTES);
            }
            else if (MacaroonsDeSerializer.bytesStartWith(packet.data, MacaroonsConstants.IDENTIFIER_BYTES)) {
                identifier = MacaroonsDeSerializer.parsePacket(packet, MacaroonsConstants.IDENTIFIER_BYTES);
            }
            else if (MacaroonsDeSerializer.bytesStartWith(packet.data, MacaroonsConstants.CID_BYTES)) {
                s = MacaroonsDeSerializer.parsePacket(packet, MacaroonsConstants.CID_BYTES);
                caveats.push(new CaveatPacket(CaveatPacketType.cid, s));
            }
            else if (MacaroonsDeSerializer.bytesStartWith(packet.data, MacaroonsConstants.CL_BYTES)) {
                s = MacaroonsDeSerializer.parsePacket(packet, MacaroonsConstants.CL_BYTES);
                caveats.push(new CaveatPacket(CaveatPacketType.cl, s));
            }
            else if (MacaroonsDeSerializer.bytesStartWith(packet.data, MacaroonsConstants.VID_BYTES)) {
                raw = MacaroonsDeSerializer.parseRawPacket(packet, MacaroonsConstants.VID_BYTES);
                caveats.push(new CaveatPacket(CaveatPacketType.vid, raw));
            }
            else if (MacaroonsDeSerializer.bytesStartWith(packet.data, MacaroonsConstants.SIGNATURE_BYTES)) {
                signature = MacaroonsDeSerializer.parseSignature(packet, MacaroonsConstants.SIGNATURE_BYTES);
            }
        }
        return new Macaroon(location, identifier, signature, caveats);
    };
    MacaroonsDeSerializer.parseSignature = function (packet, signaturePacketData) {
        var headerLen = signaturePacketData.length + MacaroonsConstants.KEY_VALUE_SEPARATOR_LEN;
        var len = Math.min(packet.data.length - headerLen, MacaroonsConstants.MACAROON_HASH_BYTES);
        var signature = Buffer.alloc(len);
        packet.data.copy(signature, 0, headerLen, headerLen + len);
        return signature;
    };
    MacaroonsDeSerializer.parsePacket = function (packet, header) {
        var headerLen = header.length + MacaroonsConstants.KEY_VALUE_SEPARATOR_LEN;
        var len = packet.data.length - headerLen;
        if (packet.data[headerLen + len - 1] == MacaroonsConstants.LINE_SEPARATOR)
            len--;
        return packet.data.toString(MacaroonsConstants.IDENTIFIER_CHARSET, headerLen, headerLen + len);
    };
    MacaroonsDeSerializer.parseRawPacket = function (packet, header) {
        var headerLen = header.length + MacaroonsConstants.KEY_VALUE_SEPARATOR_LEN;
        var len = packet.data.length - headerLen - MacaroonsConstants.LINE_SEPARATOR_LEN;
        var raw = Buffer.alloc(len);
        packet.data.copy(raw, 0, headerLen, headerLen + len);
        return raw;
    };
    MacaroonsDeSerializer.bytesStartWith = function (bytes, startBytes) {
        if (bytes.length < startBytes.length)
            return false;
        for (var i = 0, len = startBytes.length; i < len; i++) {
            if (bytes[i] != startBytes[i])
                return false;
        }
        return true;
    };
    MacaroonsDeSerializer.readPacket = function (stream) {
        if (stream.isEOF())
            return null;
        if (!stream.isPacketHeaderAvailable()) {
            throw new Error("Not enough header bytes available. Needed " + MacaroonsConstants.PACKET_PREFIX_LENGTH + " bytes.");
        }
        var size = stream.readPacketHeader();
        var data = Buffer.alloc(size - MacaroonsConstants.PACKET_PREFIX_LENGTH);
        var read = stream.read(data);
        if (read < 0)
            return null;
        if (read != data.length) {
            throw new Error("Not enough data bytes available. Needed " + data.length + " bytes, but was only " + read);
        }
        return new Packet(size, data);
    };
    return MacaroonsDeSerializer;
}());
var Packet = (function () {
    function Packet(size, data) {
        this.size = size;
        this.data = data;
    }
    return Packet;
}());
var StatefulPacketReader = (function () {
    function StatefulPacketReader(buffer) {
        this.seekIndex = 0;
        this.buffer = buffer;
    }
    StatefulPacketReader.prototype.read = function (data) {
        var len = Math.min(data.length, this.buffer.length - this.seekIndex);
        if (len > 0) {
            this.buffer.copy(data, 0, this.seekIndex, this.seekIndex + len);
            this.seekIndex += len;
            return len;
        }
        return -1;
    };
    StatefulPacketReader.prototype.readPacketHeader = function () {
        return (StatefulPacketReader.HEX_ALPHABET[this.buffer[this.seekIndex++]] << 12)
            | (StatefulPacketReader.HEX_ALPHABET[this.buffer[this.seekIndex++]] << 8)
            | (StatefulPacketReader.HEX_ALPHABET[this.buffer[this.seekIndex++]] << 4)
            | StatefulPacketReader.HEX_ALPHABET[this.buffer[this.seekIndex++]];
    };
    StatefulPacketReader.prototype.isPacketHeaderAvailable = function () {
        return this.seekIndex <= (this.buffer.length - MacaroonsConstants.PACKET_PREFIX_LENGTH);
    };
    StatefulPacketReader.prototype.isEOF = function () {
        return !(this.seekIndex < this.buffer.length);
    };
    StatefulPacketReader.HEX_ALPHABET = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0, 0, 0, 0,
        0, 10, 11, 12, 13, 14, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 10, 11, 12, 13, 14, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];
    return StatefulPacketReader;
}());
module.exports = MacaroonsDeSerializer;
