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

    /*
    this.on('end', function () {
      if (!this.options['skip-install']) {
        var bundle = spawn("bundle", ["install"]);

        bundle.stdout.on('data', function (data) {
          console.log(data.toString());
        });

        bundle.stderr.on('data', function (data) {
          console.log('stderr: ' + data);
        });
      }
    });
    */
  },

  structure: function () {
    this.mkdir('adapters/amqp');
    this.mkdir('spec/adapters/amqp');
  },

  createFiles: function () {
    //TODO remove context
    var context = {
      service: 'this.service',
      Service: 'this.Service'
    }


    //contracts
    this.template('_contracts/_amqp.rb', 'contracts/amqp.rb', context);

    //tasks
    this.template('_tasks/_amqp.rb', 'tasks/amqp.rb', context);

    //specs
    this.template(
      '_spec/_contracts/_amqp_spec.rb',
      'spec/contracts/amqp_spec.rb', context);
    this.template(
      '_spec/_tasks/_amqp_spec.rb',
      'spec/tasks/amqp_spec.rb', context);

    this.template('_spec/_support_amqp.rb', '_spec/support_amqp.rb', context);
  }


});

module.exports = AmqpRubyHexeGenerator;
