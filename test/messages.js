'use strict';

var should = require('should');
var sinon = require('sinon');
var MessagesController = require('../lib/messages');
var bitcore = require('bitcore-lib-pac');
var _ = require('lodash');

describe('Messages', function() {

  var privateKey = bitcore.PrivateKey.fromWIF('cVfhCQxFTKEzR9jNC7pFZqrznfMMvDZHad7F1Gqcx6zKDmw1juUt');
  var address = 'qR7qGwBRKoUvVb5mMHa7VTRsWCaqVebrmT';
  var badAddress = 'qLZggkuxJBnrBxjxwHpEAzFGPmfcF2pnWe';
  var signature = 'H45Xgb5JoNblvCPWpgbFB6YKJgbw4SpxwQFdTzv07XMwUo2UN9ZMJawA+HEny7ZO7IrWTvKiAOez4n4xipHYJiw=';
  var message = 'Quiero tacos y cerveza';

  it('will verify a message (true)', function(done) {

    var controller = new MessagesController({node: {}});

    var req = {
      body: {
        'address': address,
        'signature': signature,
        'message': message
      },
      query: {}
    };
    var res = {
      json: function(data) {
        data.result.should.equal(true);
        done();
      }
    };

    controller.verify(req, res);
  });

  it('will verify a message (false)', function(done) {

    var controller = new MessagesController({node: {}});

    var req = {
      body: {
        'address': address,
        'signature': signature,
        'message': 'wrong message'
      },
      query: {}
    };
    var res = {
      json: function(data) {
        data.result.should.equal(false);
        done();
      }
    };

    controller.verify(req, res);
  });

  it('handle an error from message verification', function(done) {
    var controller = new MessagesController({node: {}});
    var req = {
      body: {
        'address': badAddress,
        'signature': signature,
        'message': message
      },
      query: {}
    };
    var send = sinon.stub();
    var status = sinon.stub().returns({send: send});
    var res = {
      json: function(data) {
        data.result.should.equal(false);
        done();
      }
    };
    controller.verify(req, res);
  });

  it('handle error with missing parameters', function(done) {
    var controller = new MessagesController({node: {}});
    var req = {
      body: {},
      query: {}
    };
    var send = sinon.stub();
    var status = sinon.stub().returns({send: send});
    var res = {
      status: status
    };
    controller.verify(req, res);
    status.args[0][0].should.equal(400);
    send.args[0][0].should.match(/^Missing parameters/);
    done();
  });

});
