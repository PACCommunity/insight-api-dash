'use strict';

var request = require('request');

function CurrencyController(options) {
  this.node = options.node;
  var refresh = options.currencyRefresh || CurrencyController.DEFAULT_CURRENCY_DELAY;
  this.currencyDelay = refresh * 60000;
  this.exchange_rates = {
    pac_price: 0.00,
    btc_price: 0.00,
    btc_pac: 0.00,
    currency: 'USD'
  };
  this.timestamp = Date.now();
}

CurrencyController.DEFAULT_CURRENCY_DELAY = 10;

CurrencyController.prototype.index = function(req, res) {
  var self = this;
  var currentTime = Date.now();
  req.params.currency = req.params.currency || 'USD';
  if (self.exchange_rates.currency !== req.params.currency || currentTime >= (self.timestamp + self.currencyDelay)) {
    self.exchange_rates.currency = req.params.currency;
    self.timestamp = currentTime;
    var exchange_api_url = 'https://api.coinmarketcap.com/v1';
    var exchange_api_endpoint = '/ticker/paccoin/';
    var bitcoinavg_api_url = 'https://apiv2.bitcoinaverage.com';
    var bitcoinaverage_api_endpoint = '/convert/global?from=BTC&to='+self.exchange_rates.currency+'&amount=1';
    
    request(exchange_api_url+exchange_api_endpoint, function(err, response, body) {
      if (err) {
        self.node.log.error(err);
      }
      if (!err && response.statusCode === 200) {
        var response = JSON.parse(body);
        self.exchange_rates.btc_pac = response[0].price_btc;
        request(bitcoinavg_api_url+bitcoinaverage_api_endpoint, function(err, response, body) {
          if (err) {
            self.node.log.error(err);
          }
          if (!err && response.statusCode === 200) {
            var response = JSON.parse(body);
            self.exchange_rates.btc_price = response.price;
            self.exchange_rates.pac_price = response.price * self.exchange_rates.btc_pac;
            res.jsonp({
              status: 200,
              data: self.exchange_rates
            });
          } else {
            self.exchange_rates = {pac_price: 0.00, btc_price: 0.00, btc_pac: 0.00};
            res.jsonp({
              status: response.statusCode,
              data: self.exchange_rates
            });
          }
        });
      } else {
        self.exchange_rates = {pac_price: 0.00, btc_price: 0.00, btc_pac: 0.00};
        response = response || {};
        response.statusCode = response.statusCode || 400;
        res.jsonp({
          status: response.statusCode,
          data: self.exchange_rates
        });
      }
    });
  } else {
    res.jsonp({
      status: 200,
      data: self.exchange_rates
    });
  }
};

module.exports = CurrencyController;
