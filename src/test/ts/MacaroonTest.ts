/// <reference path="../../typings/expect.js/expect.js.d.ts" />
/// <reference path="../../typings/mocha/mocha.d.ts" />

declare var require; // TODO: bad hack to make TSC, possible reason https://github.com/Microsoft/TypeScript/issues/954
var expect = require('expect.js');

import Macaroon = require('../../main/ts/Macaroon');

describe('Minimal Test', function () {

  describe('Macaroon Tests', function () {

    it("identifier should be accessible", function () {

      var m = new Macaroon("location", "identifier", "signature");

      expect(m.identifier).to.be('identifier');
    });

  });

});