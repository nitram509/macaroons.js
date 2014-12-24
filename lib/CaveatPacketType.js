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
var CaveatPacketType;
(function (CaveatPacketType) {
    CaveatPacketType[CaveatPacketType["location"] = 0] = "location";
    CaveatPacketType[CaveatPacketType["identifier"] = 1] = "identifier";
    CaveatPacketType[CaveatPacketType["signature"] = 2] = "signature";
    CaveatPacketType[CaveatPacketType["cid"] = 3] = "cid";
    CaveatPacketType[CaveatPacketType["vid"] = 4] = "vid";
    CaveatPacketType[CaveatPacketType["cl"] = 5] = "cl";
})(CaveatPacketType || (CaveatPacketType = {}));
module.exports = CaveatPacketType;
