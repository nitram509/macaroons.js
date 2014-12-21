var MacaroonsContants = (function () {
    function MacaroonsContants() {
    }
    MacaroonsContants.IDENTIFIER_CHARSET = "utf8";
    MacaroonsContants.PACKET_PREFIX_LENGTH = 4;
    MacaroonsContants.LINE_SEPARATOR_STR = '\n';
    MacaroonsContants.LINE_SEPARATOR = MacaroonsContants.LINE_SEPARATOR_STR.charCodeAt(0);
    MacaroonsContants.LINE_SEPARATOR_LEN = 1;
    MacaroonsContants.KEY_VALUE_SEPARATOR_STR = ' ';
    MacaroonsContants.KEY_VALUE_SEPARATOR = MacaroonsContants.KEY_VALUE_SEPARATOR_STR.charCodeAt(0);
    MacaroonsContants.KEY_VALUE_SEPARATOR_LEN = 1;
    return MacaroonsContants;
})();
module.exports = MacaroonsContants;
