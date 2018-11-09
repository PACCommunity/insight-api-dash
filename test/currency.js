'use strict';

var should = require('should');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var CurrencyController = require('../lib/currency');

describe('Currency', function() {

  var dashCentralData = {
    general: {
      consensus_blockheight: 561311,
      consensus_version: 120058,
      consensus_protocolversion: 70103,
      all_user: 687,
      active_user: 372,
      registered_masternodes: 1583,
      registered_masternodes_verified: 770
    },
    exchange_rates: {
      pac_price: 9.4858840414,
      btc_price: 682.93,
      btc_pac: 0.01388998,
      currency: 'USD'
    }
  };

  it.skip('will make live request to dash central', function(done) {
    var currency = new CurrencyController({});
    var req = {};
    var res = {
      jsonp: function(response) {
        response.status.should.equal(200);
        should.exist(response.data.pac_price);
        (typeof response.data.pac_price).should.equal('number');
        done();
      }
    };
    currency.index(req, res);
  });

  it('will retrieve a fresh value', function(done) {
    var TestCurrencyController = proxyquire('../lib/currency', {
      request: sinon.stub().callsArgWith(1, null, {statusCode: 200}, JSON.stringify(dashCentralData))
    });
    var node = {
      log: {
        error: sinon.stub()
      }
    };
    var currency = new TestCurrencyController({node: node});
    currency.exchange_rates = {
      pac_price: 9.4858840414,
      btc_price: 682.93,
      btc_pac: 0.01388998,
      currency: 'USD'
    };
    currency.timestamp = Date.now() - 51000 * CurrencyController.DEFAULT_CURRENCY_DELAY;
    var req = {
      params: {
        currency: 'USD'    
      }
    };
    var res = {
      jsonp: function(response) {
        response.status.should.equal(200);
        should.exist(response.data.pac_price);
        response.data.pac_price.should.equal(9.4858840414);
        done();
      }
    };
    currency.index(req, res);
  });

  it('will log an error from request', function(done) {
    var TestCurrencyController = proxyquire('../lib/currency', {
      request: sinon.stub().callsArgWith(1, new Error('test'))
    });
    var node = {
      log: {
        error: sinon.stub()
      }
    };
    var currency = new TestCurrencyController({node: node});
    currency.exchange_rates = {
      pac_price: 9.4858840414,
      btc_price: 682.93,
      btc_pac: 0.01388998,
      currency: 'USD'
    };
    currency.timestamp = Date.now() - 65000 * CurrencyController.DEFAULT_CURRENCY_DELAY;
    var req = {
      params: {
        currency: 'USSD'    
      }
    };
    var res = {
      jsonp: function(response) {
        response.status.should.equal(400);
        should.exist(response.data);
        response.data.pac_price.should.equal(0);
        node.log.error.callCount.should.equal(1);
        done();
      }
    };
    currency.index(req, res);
  });

  it('will retrieve a cached value', function(done) {
    var request = sinon.stub();
    var TestCurrencyController = proxyquire('../lib/currency', {
      request: request
    });
    var node = {
      log: {
        error: sinon.stub()
      }
    };
    var currency = new TestCurrencyController({node: node});
    currency.exchange_rates = {
      pac_price: 9.4858840414,
      btc_price: 682.93,
      btc_pac: 0.01388998,
      currency: 'USD'
    };
    currency.timestamp = Date.now();
    var req = {
      params: {
        currency: 'USD'    
      }
    };
    var res = {
      jsonp: function(response) {
        response.status.should.equal(200);
        should.exist(response.data.pac_price);
        response.data.pac_price.should.equal(9.4858840414);
        request.callCount.should.equal(0);
        done();
      }
    };
    currency.index(req, res);
  });

});
