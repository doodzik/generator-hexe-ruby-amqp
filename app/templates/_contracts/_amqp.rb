require 'json'

module Amqp
  def self.load!(amqp_instance)
    @amqp_instance = amqp_instance.start
    @channel = @amqp_instance.create_channel
  end

  def self.close!
    @channel.close
    @amqp_instance.close
  end

  #WORKER
  def self.push(service, hash)
    client = @channel.queue("#{service}.worker")
    client.publish(hash.to_json, persistent: true)
  end

  def self.worker(service, callModule)
    methods = callModule.instance_methods
    q = @channel.queue("#{service}.worker")
    x = @channel.default_exchange

    q.subscribe(block: true) do |delivery_info, properties, payload|
      hash = JSON.parse(payload, :symbolize_names => true)
      method = hash[:method]
      hash.delete(:method)

      return_value = if hash.empty?
        callModule.send(method)
      else
        callModule.send(method, hash)
      end
    end
  end

  #RPC
  def self.get(service, hash)
    client = Amqp::RPCServer.new(@channel, "#{service}.rpc")
    client.call(hash.to_json)
  end

  def self.rpc(service, callModule)
    methods = callModule.instance_methods
    q = @channel.queue("#{service}.rpc")
    x = @channel.default_exchange

    q.subscribe(block: true) do |delivery_info, properties, payload|
      hash = JSON.parse(payload, :symbolize_names => true)
      method = hash[:method]
      hash.delete(:method)

      return_value = if hash.empty?
        callModule.send(method)
      else
        callModule.send(method, hash)
      end

      x.publish(return_value.to_json, routing_key: properties.reply_to, correlation_id: properties.correlation_id)
    end
  end

  class RPCServer
    attr_reader :reply_queue
    attr_accessor :response, :call_id
    attr_reader :lock, :condition

    def initialize(ch, server_queue)
      @ch             = ch
      @x              = ch.default_exchange

      @server_queue   = server_queue
      @reply_queue    = ch.queue('', :exclusive => true)


      @lock      = Mutex.new
      @condition = ConditionVariable.new
      that       = self

      @reply_queue.subscribe do |delivery_info, properties, payload|
        if properties[:correlation_id] == that.call_id
          that.response = JSON.parse(payload, :symbolize_names => true)
          that.lock.synchronize{that.condition.signal}
        end
      end
    end

    def call(val)
      self.call_id = self.generate_uuid

      @x.publish(val,
        :routing_key    => @server_queue,
        :correlation_id => call_id,
        :reply_to       => @reply_queue.name)

      lock.synchronize{condition.wait(lock)}
      response
    end

    protected

    def generate_uuid
      # very naive but good enough for code
      # examples
      "#{rand}#{rand}#{rand}"
    end
  end
end
