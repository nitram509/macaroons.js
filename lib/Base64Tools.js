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
var Base64Tools = (function () {
    function Base64Tools() {
    }
    Base64Tools.transformBase64UrlSafe2Base64 = function (base64) {
        return base64.replace(/-/g, '+').replace(/_/g, '/') + Base64Tools.BASE64_PADDING.substr(0, 3 - (base64.length % 3));
    };
    Base64Tools.encodeBase64UrlSafe = function (base64) {
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    };
    Base64Tools.BASE64_PADDING = '===';
    return Base64Tools;
})();
module.exports = Base64Tools;
