"use strict";
var BufferTools = (function () {
    function BufferTools() {
    }
    BufferTools.equals = function (a, b) {
        if (!Buffer.isBuffer(a))
            return undefined;
        if (!Buffer.isBuffer(b))
            return undefined;
        if (typeof a['equals'] === 'function')
            return a['equals'](b);
        if (a.length !== b.length)
            return false;
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i])
                return false;
        }
        return true;
    };
    return BufferTools;
}());
module.exports = BufferTools;
