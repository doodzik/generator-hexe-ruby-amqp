require 'rake'
require 'bunny'
require "#{ENV['BASEDIR']}/contracts/amqp.rb"

namespace :amqp do
  multitask serve: ['amqp:serve_worker', 'amqp:serve_rpc']

  task :serve_worker do
    begin
      require "#{ENV['BASEDIR']}/adapters/amqp_worker.rb"
      Amqp.load!(Bunny.new(:automatically_recover => false))
      Amqp.worker('<%= Service %>', Amqp::Worker)
    rescue Interrupt => _
      Amqp.close!
      exit(0)
    end
  end

  task :serve_rpc do
    begin
      require "#{ENV['BASEDIR']}/adapters/amqp_rpc.rb"
      Amqp.load!(Bunny.new(:automatically_recover => false))
      Amqp.rpc('<%= Service %>', Amqp::Rpc)
    rescue Interrupt => _
      Amqp.close!
      exit(0)
    end
  end

  task :require do
    Amqp.load!(Bunny.new(:automatically_recover => false))
  end
end
