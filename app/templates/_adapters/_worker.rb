module Amqp
  module Worker
    extend self
    def hallo(name:)
      {msg: "hello #{name}"}
    end
  end
end
