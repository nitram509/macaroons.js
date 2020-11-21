"use strict";
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
