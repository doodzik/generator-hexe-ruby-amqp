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
    this.pkg = require('../../package.json');

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
  },

  askFor: function() {
    var done = this.async();

    // have Yeoman greet the user
    console.log(this.yeoman);

    var prompts = [{
        name: 'serviceName',
        message: 'What is your service\'s name ?'
    }];

    this.prompt(prompts, function (props) {
        this.service = props.serviceName;
        this.Service = props.serviceName.charAt(0).toUpperCase() + props.serviceName.slice(1);

        done();
    }.bind(this));
  },

  structure: function () {
    this.mkdir('adapters/amqp');
    this.mkdir('adapters/amqp/public');
    this.mkdir('spec/adapters/amqp');
  },

  createFiles: function () {
    //TODO ask for each module
    var context = {
      service: this.service,
      Service: this.Service
    }

    //adapters
    this.template('_adapters/_rpc.rb', 'adapters/amqp/rpc.rb', context);
    this.template('_adapters/_worker.rb', 'adapters/amqp/worker.rb', context);

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

    this.template(
      '_adapters/_worker_spec.rb',
      'spec/adapters/amqp/worker.rb',
      context
    );
    this.template(
      '_adapters/_rpc_spec.rb',
      'spec/adapters/amqp/_rpc_spec.rb',
      context
    );

  }


});

module.exports = AmqpRubyHexeGenerator;
