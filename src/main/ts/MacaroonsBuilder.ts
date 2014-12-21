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

import CaveatPacket = require('./CaveatPacket');
import Macaroon = require('./Macaroon');
import MacaroonsDeSerializer = require('./MacaroonsDeSerializer');
import CryptoTools = require('./CryptoTools');

export = MacaroonsBuilder;

/**
 * Used to build and modify Macaroons
 */
class MacaroonsBuilder {

  private macaroon:Macaroon = null;

  /**
   * @param location   location
   * @param secretKey  secretKey this secret will be enhanced, in case it's shorter than {@link MacaroonsConstants.MACAROON_SUGGESTED_SECRET_LENGTH}
   * @param identifier identifier
   */
  constructor(location:string, secretKey:string, identifier:string) {
    this.macaroon = this.computeMacaroon_with_keystring(location, secretKey, identifier);
  }

  public getMacaroon():Macaroon {
    return this.macaroon;
  }

  /**
   * @param location   location
   * @param secretKey  secretKey
   * @param identifier identifier
   * @return {@link Macaroon}
   */
  public static create(location:string, secretKey:string, identifier:string):Macaroon {
    return new MacaroonsBuilder(location, secretKey, identifier).getMacaroon();
  }

  /**
   * @param serializedMacaroon serializedMacaroon
   * @return {@link Macaroon}
   * @throws Exception when serialized macaroon is not valid base64, length is to short or contains invalid packet data
   */
  public static deserialize(serializedMacaroon:string):Macaroon {
    return MacaroonsDeSerializer.deserialize(serializedMacaroon);
  }

  private computeMacaroon_with_keystring(location:string, secretKey:string, identifier:string):Macaroon {
    return this.computeMacaroon(location, this.generate_derived_key(secretKey), identifier);
  }

  private computeMacaroon(location:string, secretKey:Buffer, identifier:string):Macaroon {
    var hmac:Buffer = CryptoTools.macaroon_hmac(secretKey, identifier);
    return new Macaroon(location, identifier, hmac);
  }

  private generate_derived_key(variableKey:string):Buffer {
    var MACAROONS_MAGIC_KEY = "macaroons-key-generator";
    return CryptoTools.macaroon_hmac(new Buffer(MACAROONS_MAGIC_KEY, "utf-8"), variableKey);
  }

}