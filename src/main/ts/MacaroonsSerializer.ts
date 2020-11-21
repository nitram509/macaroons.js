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

import Macaroon = require('./Macaroon');
import CaveatPacket = require('./CaveatPacket');
import CaveatPacketType = require('./CaveatPacketType');
import MacaroonsConstants = require('./MacaroonsConstants');
import Base64Tools = require('./Base64Tools');

export = MacaroonsSerializer;
class MacaroonsSerializer {

  "use strict";

  private static HEX = [0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66];

  public static serialize(macaroon:Macaroon):string {
    var packets:Array<Buffer> = [];
    packets.push(
        MacaroonsSerializer.serialize_packet(CaveatPacketType.location, macaroon.location),
        MacaroonsSerializer.serialize_packet(CaveatPacketType.identifier, macaroon.identifier)
    );
    packets = packets.concat(macaroon.caveatPackets.map(function (caveatPacket) {
      return MacaroonsSerializer.serialize_packet_buf(caveatPacket.type, caveatPacket.rawValue)
    }));
    packets.push(MacaroonsSerializer.serialize_packet_buf(CaveatPacketType.signature, macaroon.signatureBuffer));
    var base64 = MacaroonsSerializer.flattenByteArray(packets).toString("base64");
    return Base64Tools.encodeBase64UrlSafe(base64);
  }

  private static serialize_packet(type:CaveatPacketType, data:string):Buffer {
    return MacaroonsSerializer.serialize_packet_buf(type, Buffer.from(data, MacaroonsConstants.IDENTIFIER_CHARSET));
  }

  private static serialize_packet_buf(type:CaveatPacketType, data:Buffer):Buffer {
    var typname = CaveatPacketType[type];
    var packet_len = MacaroonsConstants.PACKET_PREFIX_LENGTH + typname.length + MacaroonsConstants.KEY_VALUE_SEPARATOR_LEN + data.length + MacaroonsConstants.LINE_SEPARATOR_LEN;
    var packet = Buffer.alloc(packet_len);
    packet.fill(0);
    var offset = 0;

    MacaroonsSerializer.packet_header(packet_len).copy(packet, 0, 0);
    offset += MacaroonsConstants.PACKET_PREFIX_LENGTH;

    Buffer.from(typname, 'ascii').copy(packet, offset, 0);
    offset += typname.length;

    packet[offset] = MacaroonsConstants.KEY_VALUE_SEPARATOR;
    offset += MacaroonsConstants.KEY_VALUE_SEPARATOR_LEN;

    data.copy(packet, offset, 0);
    offset += data.length;

    packet[offset] = MacaroonsConstants.LINE_SEPARATOR;
    return packet;
  }

  private static packet_header(size:number):Buffer {
    // assert.ok(size < 65536, "size < 65536");
    var size = (size & 0xffff);
    var packet = Buffer.alloc(MacaroonsConstants.PACKET_PREFIX_LENGTH);
    packet[0] = MacaroonsSerializer.HEX[(size >> 12) & 15];
    packet[1] = MacaroonsSerializer.HEX[(size >> 8) & 15];
    packet[2] = MacaroonsSerializer.HEX[(size >> 4) & 15];
    packet[3] = MacaroonsSerializer.HEX[(size) & 15];
    return packet;
  }

  private static flattenByteArray(bufs:Buffer[]):Buffer {
    var size = 0;
    for (var i = 0; i < bufs.length; i++) {
      size += bufs[i].length;
    }
    var result = Buffer.alloc(size);
    size = 0;
    for (i = 0; i < bufs.length; i++) {
      bufs[i].copy(result, size, 0);
      size += bufs[i].length;
    }
    return result
  }

}
