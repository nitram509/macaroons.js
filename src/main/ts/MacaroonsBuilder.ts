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
import CaveatPacketType = require('./CaveatPacketType');
import Macaroon = require('./Macaroon');
import MacaroonsConstants = require('./MacaroonsConstants');
import MacaroonsDeSerializer = require('./MacaroonsDeSerializer');
import CryptoTools = require('./CryptoTools');

export = MacaroonsBuilder;

/**
 * Used to build and modify Macaroons
 */
class MacaroonsBuilder {

  "use strict";

  private macaroon:Macaroon = null;

  /**
   * @param location   location
   * @param secretKey  a string this secret will be enhanced, in case it's shorter than {@link MacaroonsConstants.MACAROON_SUGGESTED_SECRET_LENGTH}
   * @param identifier identifier
   */
  constructor(location:string, secretKey:string, identifier:string);
  /**
   * @param location   location
   * @param secretKey  a Buffer, that will be used, a minimum length of {@link MacaroonsConstants.MACAROON_SUGGESTED_SECRET_LENGTH} is highly recommended
   * @param identifier identifier
   */
  constructor(location:string, secretKey:Buffer, identifier:string);
  /**
   * @param macaroon macaroon to modify
   */
  constructor(macaroon:Macaroon);
  constructor(arg1:any, secretKey?:any, identifier?:string) {
    if (typeof arg1 === 'string') {
      if (typeof secretKey !== 'string' && !(secretKey instanceof Buffer)) {
        throw new Error("The secret key has to be a simple string or an instance of Buffer.");
      }
      this.macaroon = this.computeMacaroon(arg1, secretKey, identifier);
    } else {
      this.macaroon = arg1;
    }
  }

  /**
   * @param macaroon macaroon
   * @return {@link MacaroonsBuilder}
   */
  public static modify(macaroon:Macaroon):MacaroonsBuilder {
    return new MacaroonsBuilder(macaroon);
  }

  /**
   * @return a {@link Macaroon}
   */
  public getMacaroon():Macaroon {
    return this.macaroon;
  }

  /**
   * @param location   location
   * @param secretKey  a secret string
   * @param identifier identifier
   * @return {@link Macaroon}
   */
  public static create(location:string, secretKey:string, identifier:string):Macaroon;
  /**
   * @param location   location
   * @param secretKey  a Buffer containing a secret
   * @param identifier identifier
   * @return {@link Macaroon}
   */
  public static create(location:string, secretKey:Buffer, identifier:string):Macaroon;
  public static create(location:string, secretKey:any, identifier:string):Macaroon {
    return new MacaroonsBuilder(location, secretKey, identifier).getMacaroon();
  }

  /**
   * @param serializedMacaroon serializedMacaroon
   * @return {@link Macaroon}
   * @throws Error when serialized macaroon is not valid base64, length is to short or contains invalid packet data
   */
  public static deserialize(serializedMacaroon:string):Macaroon {
    return MacaroonsDeSerializer.deserialize(serializedMacaroon);
  }

  /**
   * @param caveat caveat
   * @return this {@link MacaroonsBuilder}
   * @throws Error if there are more than {@link MacaroonsConstants.MACAROON_MAX_CAVEATS} caveats.
   */
  public add_first_party_caveat(caveat:string):MacaroonsBuilder {
    if (caveat != null) {
      var caveatBuffer:Buffer = new Buffer(caveat, MacaroonsConstants.IDENTIFIER_CHARSET);
      //assert caveatBytes.length < MacaroonsConstants.MACAROON_MAX_STRLEN;
      if (this.macaroon.caveatPackets.length + 1 > MacaroonsConstants.MACAROON_MAX_CAVEATS) {
        throw new Error("Too many caveats. There are max. " + MacaroonsConstants.MACAROON_MAX_CAVEATS + " caveats allowed.");
      }
      var signature = CryptoTools.macaroon_hmac(this.macaroon.signatureBuffer, caveatBuffer);
      var caveatsExtended = this.macaroon.caveatPackets.concat(new CaveatPacket(CaveatPacketType.cid, caveatBuffer));
      this.macaroon = new Macaroon(this.macaroon.location, this.macaroon.identifier, signature, caveatsExtended);
    }
    return this;
  }


  /**
   * @param location   location
   * @param secret     secret
   * @param identifier identifier
   * @return this {@link MacaroonsBuilder}
   * @throws Error if there are more than {@link MacaroonsConstants#MACAROON_MAX_CAVEATS} caveats.
   */
  public add_third_party_caveat(location:string, secret:string, identifier:string):MacaroonsBuilder {
    //assert location.length() < MACAROON_MAX_STRLEN;
    //assert identifier.length() < MACAROON_MAX_STRLEN;

    if (this.macaroon.caveatPackets.length + 1 > MacaroonsConstants.MACAROON_MAX_CAVEATS) {
      throw new Error("Too many caveats. There are max. " + MacaroonsConstants.MACAROON_MAX_CAVEATS + " caveats allowed.");
    }
    var thirdPartyPacket = CryptoTools.macaroon_add_third_party_caveat_raw(this.macaroon.signatureBuffer, secret, identifier);
    var hash = thirdPartyPacket.signature;
    var caveatsExtended = this.macaroon.caveatPackets.concat(
        new CaveatPacket(CaveatPacketType.cid, identifier),
        new CaveatPacket(CaveatPacketType.vid, thirdPartyPacket.vid_data),
        new CaveatPacket(CaveatPacketType.cl, location)
    );
    this.macaroon = new Macaroon(this.macaroon.location, this.macaroon.identifier, hash, caveatsExtended);
    return this;
  }

  /**
   * @param macaroon macaroon used for preparing a request
   * @return this {@link MacaroonsBuilder}
   * @throws Error
   */
  public prepare_for_request(macaroon:Macaroon):MacaroonsBuilder {
    //assert macaroon.signatureBytes.length > 0;
    //assert getMacaroon().signatureBytes.length > 0;
    var hash = CryptoTools.macaroon_bind(this.getMacaroon().signatureBuffer, macaroon.signatureBuffer);
    this.macaroon = new Macaroon(macaroon.location, macaroon.identifier, hash, macaroon.caveatPackets);
    return this;
  }

  private computeMacaroon(location:string, secretKey:Buffer, identifier:string):Macaroon;
  private computeMacaroon(location:string, secretKey:string, identifier:string):Macaroon;
  private computeMacaroon(location:string, key:any, identifier:string):Macaroon {
    if (typeof key === 'string') {
      key = CryptoTools.generate_derived_key(key);
    }
    var signature:Buffer = CryptoTools.macaroon_hmac(key, identifier);
    return new Macaroon(location, identifier, signature);
  }

}