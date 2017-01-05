var expect = require('chai').expect;

var kgjs = require('kgjs');

var lib = require('../rdfBridge');

describe('rdfBridge', function() {

    var bridge;

    before(function(done) {
        bridge = lib.create(kgjs.newGraph(kgjs.allAccessors))
            .debugTo(console.log);

        bridge.defaultSetup(done);
    });

    it('should load defaults and process them correctly - currency', function(done) {

        bridge.list('India', 'curRencY', null, function(err, results) {
            expect(results.length).to.equal(1);
            expect(results[0]['label@en']).to.equal('Indian rupee');
            done();
        });
    });

    it('should load defaults and process them correctly - language', function(done) {

        bridge.list('CuBA', 'national Language', null, function(err, results) {
            expect(results.length).to.equal(1);
            expect(results[0]['label@en']).to.equal('Spanish');
            done();
        });
    });

});

