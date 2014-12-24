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
/**
 * <p>
 * A verifier that is able to verify timestamps against current time.
 * Thus, it only supports general caveats i.e. <code>"time&nbsp;&lt;&nbsp;2085-12-31T00:00"</code>.
 * In general, ISO8601 timestamp format with optional parts is allowed.
 * </p>
 *
 * <table>
 * <caption><strong>Supported formats</strong></caption>
 * <tr>
 * <th>Supported pattern</th>
 * <th>Example</th>
 * </tr>
 * <tr>
 * <td><code>yyyy-MM-dd'T'HH:mm:ssZ</code></td>
 * <td>2014-09-23T17:42:35+200 (only precise up to 1 second, the RFC 822 4-digit time zone format is used)</td>
 * </tr>
 * <tr>
 * <td><code>yyyy-MM-dd'T'HH:mm:ss</code></td>
 * <td>2014-09-23T17:42:35 (only precise up to 1 second)</td>
 * </tr>
 * <tr>
 * <td><code>yyyy-MM-dd'T'HH:mm</code></td>
 * <td>2014-09-23T17:42 (only precise up to 1 minute)</td>
 * </tr>
 * <tr>
 * <td><code>yyyy-MM-dd'T'HH</code></td>
 * <td>2014-09-23T17 (only precise up to 1 hour)</td>
 * </tr>
 * <tr>
 * <td><code>yyyy-MM-dd</code></td>
 * <td>2014-09-23 (only precise up to 1 day)</td>
 * </tr>
 * </table>
 * <br>
 * <strong>Applying a time based caveat</strong>
 * <pre>{@code

 * }</pre>
 */
var CAVEAT_PREFIX = /time < .*/;
var CAVEAT_PREFIX_LEN = "time < ".length;
function TimestampCaveatVerifier(caveat) {
    if (CAVEAT_PREFIX.test(caveat)) {
        var parsedTimestamp = new Date(caveat.substr(CAVEAT_PREFIX_LEN).trim());
        var time = parsedTimestamp.getTime();
        return time > 0 && Date.now() < time;
    }
    return false;
}
module.exports = TimestampCaveatVerifier;
