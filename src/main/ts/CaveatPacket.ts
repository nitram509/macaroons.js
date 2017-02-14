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

import CaveatPacketType = require('./CaveatPacketType');
import MacaroonsConstants = require('./MacaroonsConstants');
import Base64Tools = require('./Base64Tools');

export = CaveatPacket;
class CaveatPacket {

  public type:CaveatPacketType;
  public rawValue:Buffer;

  private valueAsText:string;

  constructor(type:CaveatPacketType, valueAsText:string);
  constructor(type:CaveatPacketType, valueAsBuffer:Buffer);
  constructor(type:CaveatPacketType, value:any) {
    if (typeof value === 'undefined') throw new Error("Missing second parameter 'value' from type 'string' or 'Buffer'");

    //assert type != null;
    //assert rawValue != null;
    this.type = type;
    if (typeof value === 'string') {
      this.rawValue = new Buffer(value, MacaroonsConstants.IDENTIFIER_CHARSET);
    } else {
      //assert type != Type.vid : "VIDs should be used as raw bytes, because otherwise UTF8 string encoder would break it";
      this.rawValue = value;
    }
  }

  public getRawValue():Buffer {
    return this.rawValue;
  }

  public getValueAsText():string {
    if (this.valueAsText == null) {
      this.valueAsText = (this.type == CaveatPacketType.vid)
          ? Base64Tools.encodeBase64UrlSafe(this.rawValue.toString('base64'))
          : this.rawValue.toString(MacaroonsConstants.IDENTIFIER_CHARSET);
    }
    return this.valueAsText;
  }
}
