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

import Macaroon = require('./Macaroon');
import CaveatPacket = require('./CaveatPacket');
import CaveatPacketType = require('./CaveatPacketType');
import MacaroonsConstants = require('./MacaroonsConstants');

export = MacaroonsDeSerializer;
class MacaroonsDeSerializer {

  private static BASE64_PADDING:string = '===';

  public static deserialize(serializedMacaroon:string):Macaroon {
    var data = new Buffer(MacaroonsDeSerializer.transformBase64UrlSafe2Base64(serializedMacaroon), 'base64');
    var minLength = MacaroonsConstants.MACAROON_HASH_BYTES + MacaroonsConstants.KEY_VALUE_SEPARATOR_LEN + MacaroonsConstants.SIGNATURE.length;
    if (data.length < minLength) {
      throw "Couldn't deserialize macaroon. Not enough bytes for signature found. There have to be at least " + minLength + " bytes";
    }
    return MacaroonsDeSerializer.deserializeStream(new StatefulPacketReader(data));
  }

  private static transformBase64UrlSafe2Base64(base64:string):string {
    return base64.replace(/-/g, '+').replace(/_/g, '/') + MacaroonsDeSerializer.BASE64_PADDING.substr(0, 3 - (base64.length % 3));
  }

  private static deserializeStream(packetReader:StatefulPacketReader):Macaroon {
    var location:string = null;
    var identifier:string = null;
    var caveats:Array<CaveatPacket> = [];
    var signature:Buffer = null;
    for (var packet:Packet; (packet = MacaroonsDeSerializer.readPacket(packetReader)) != null;) {
      if (MacaroonsDeSerializer.bytesStartWith(packet.data, MacaroonsConstants.LOCATION_BYTES)) {
        location = MacaroonsDeSerializer.parsePacket(packet, MacaroonsConstants.LOCATION_BYTES);
      } else if (MacaroonsDeSerializer.bytesStartWith(packet.data, MacaroonsConstants.IDENTIFIER_BYTES)) {
        identifier = MacaroonsDeSerializer.parsePacket(packet, MacaroonsConstants.IDENTIFIER_BYTES);
      } else if (MacaroonsDeSerializer.bytesStartWith(packet.data, MacaroonsConstants.CID_BYTES)) {
        //String s = parsePacket(packet, MacaroonsConstants.CID_BYTES);
        //caveats.add(new CaveatPacket(Type.cid, s));
      } else if (MacaroonsDeSerializer.bytesStartWith(packet.data, MacaroonsConstants.CL_BYTES)) {
        //String s = parsePacket(packet, MacaroonsConstants.CL_BYTES);
        //caveats.add(new CaveatPacket(Type.cl, s));
      } else if (MacaroonsDeSerializer.bytesStartWith(packet.data, MacaroonsConstants.VID_BYTES)) {
        //byte[] raw = parseRawPacket(packet, MacaroonsConstants.VID_BYTES);
        //caveats.add(new CaveatPacket(Type.vid, raw));
      } else if (MacaroonsDeSerializer.bytesStartWith(packet.data, MacaroonsConstants.SIGNATURE_BYTES)) {
        signature = MacaroonsDeSerializer.parseSignature(packet, MacaroonsConstants.SIGNATURE_BYTES);
      }
    }
    return new Macaroon(location, identifier, signature, caveats);
  }

  private static parseSignature(packet:Packet, signaturePacketData:Buffer):Buffer {
    var headerLen = signaturePacketData.length + MacaroonsConstants.KEY_VALUE_SEPARATOR_LEN;
    var len = Math.min(packet.data.length - headerLen, MacaroonsConstants.MACAROON_HASH_BYTES);
    var signature = new Buffer(len);
    packet.data.copy(signature, 0, headerLen, headerLen + len);
    return signature;
  }

  private static parsePacket(packet:Packet, header:Buffer):string {
    var headerLen = header.length + MacaroonsConstants.KEY_VALUE_SEPARATOR_LEN;
    var len = packet.data.length - headerLen;
    if (packet.data[headerLen + len - 1] == MacaroonsConstants.LINE_SEPARATOR) len--;
    return packet.data.toString(MacaroonsConstants.IDENTIFIER_CHARSET, headerLen, headerLen + len);
  }

  private static parseRawPacket(packet:Packet, header:Buffer):Buffer {
    var headerLen = header.length + MacaroonsConstants.KEY_VALUE_SEPARATOR_LEN;
    var len = packet.data.length - headerLen - MacaroonsConstants.LINE_SEPARATOR_LEN;
    var raw = new Buffer(len);
    packet.data.copy(raw, 0, headerLen, headerLen + len);
    return raw;
  }

  private static bytesStartWith(bytes:Buffer, startBytes:Buffer):boolean {
    if (bytes.length < startBytes.length) return false;
    for (var i = 0, len = startBytes.length; i < len; i++) {
      if (bytes[i] != startBytes[i]) return false;
    }
    return true;
  }

  private static readPacket(stream:StatefulPacketReader):Packet {
    if (stream.isEOF()) return null;
    if (!stream.isPacketHeaderAvailable()) {
      throw "Not enough header bytes available. Needed " + MacaroonsConstants.PACKET_PREFIX_LENGTH + " bytes.";
    }
    var size = stream.readPacketHeader();
    //assert size <= PACKET_MAX_SIZE;

    var data = new Buffer(size - MacaroonsConstants.PACKET_PREFIX_LENGTH);
    var read = stream.read(data);
    if (read < 0) return null;
    if (read != data.length) {
      throw "Not enough data bytes available. Needed " + data.length + " bytes, but was only " + read;
    }
    return new Packet(size, data);
  }

}


class Packet {
  size:number;
  data:Buffer;

  constructor(size:number, data:Buffer) {
    this.size = size;
    this.data = data;
  }
}


class StatefulPacketReader {
  private static HEX_ALPHABET:Array<number> = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0, 0, 0, 0,
    0, 10, 11, 12, 13, 14, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 10, 11, 12, 13, 14, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  private buffer:Buffer;
  private seekIndex:number = 0;

  constructor(buffer:Buffer) {
    this.buffer = buffer;
  }

  public read(data:Buffer):number {
    var len = Math.min(data.length, this.buffer.length - this.seekIndex);
    if (len > 0) {
      this.buffer.copy(data, 0, this.seekIndex, this.seekIndex + len);
      this.seekIndex += len;
      return len;
    }
    return -1;
  }

  public readPacketHeader():number {
    return (StatefulPacketReader.HEX_ALPHABET[this.buffer[this.seekIndex++]] << 12)
        | (StatefulPacketReader.HEX_ALPHABET[this.buffer[this.seekIndex++]] << 8)
        | (StatefulPacketReader.HEX_ALPHABET[this.buffer[this.seekIndex++]] << 4)
        | StatefulPacketReader.HEX_ALPHABET[this.buffer[this.seekIndex++]];
  }

  public isPacketHeaderAvailable():boolean {
    return this.seekIndex <= (this.buffer.length - MacaroonsConstants.PACKET_PREFIX_LENGTH);
  }

  public isEOF():boolean {
    return !(this.seekIndex < this.buffer.length);
  }
}
