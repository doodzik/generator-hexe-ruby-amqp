module Amqp
  module Rpc
    extend self
    def hallo(name: 'hexe')
      {msg: "hello #{name}"}
    end
  end
end
