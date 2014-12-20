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

/// <reference path="../../typings/node/node.d.ts" />

declare var require; // TODO: bad hack to make TSC compile, possible reason https://github.com/Microsoft/TypeScript/issues/954
var crypto = require('crypto');

import CaveatPacket = require('./CaveatPacket');
import Macaroon = require('./Macaroon');

export = MacaroonsBuilder;
class MacaroonsBuilder {

  private macaroon:Macaroon = null;

  constructor(location:string, secretKey:string, identifier:string) {
    this.macaroon = this.computeMacaroon(location, secretKey, identifier);
  }

  private computeMacaroon(location:string, secretKey:string, identifier:string):Macaroon {
    return this.computeMacaroonX(location, this.generate_derived_key(secretKey), identifier);
  }

  public getMacaroon():Macaroon {
    return this.macaroon;
  }

  private generate_derived_key(variableKey:string):Buffer {
    var MACAROONS_MAGIC_KEY = "macaroons-key-generator";
    return this.macaroon_hmac(new Buffer(MACAROONS_MAGIC_KEY, "utf-8"), variableKey);
  }

  private macaroon_hmac(key:Buffer, message:string):Buffer {
    var mac = crypto.createHmac('sha256', key);
    mac.update(message);
    return mac.digest();
  }

  private computeMacaroonX(location:string, secretKey:Buffer, identifier:string):Macaroon {
    var hmac:Buffer = this.macaroon_hmac(secretKey, identifier);
    var signature:string = hmac.toString('hex');
    return new Macaroon(location, identifier, signature);
  }
}