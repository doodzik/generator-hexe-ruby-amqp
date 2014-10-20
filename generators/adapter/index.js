'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var sys = require('sys')
var spawn = require('child_process').spawn;

var AmqpRubyHexeGenerator = yeoman.generators.Base.extend({
  init: function () {

  },

  createFiles: function () {
    //TODO ask for each module
    var context = {
      service: 'this.service',
      Service: 'this.Service'
    }

    //adapters
    this.template('_rpc.rb', 'adapters/amqp_rpc.rb', context);
    this.template('_worker.rb', 'adapters/amqp_worker.rb', context);

    this.template(
      '_worker_spec.rb',
      'spec/adapters/amqp_worker_spec.rb',
      context
    );
    this.template(
      '_rpc_spec.rb',
      'spec/adapters/amqp_rpc_spec.rb',
      context
    );

  }


});

module.exports = AmqpRubyHexeGenerator;
