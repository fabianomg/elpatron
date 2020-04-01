"use strict";
const Redis =  use('Redis')
const amqp = require("amqplib/callback_api");
class RabbitmqController {
  async static captcha(msg,ex,key) {
    amqp.connect("amqp://rabbitmq:rabbitmq@rabbitmq:5672", function(err, conn) {
      conn.createChannel((err, ch)=> {
        ch.assertExchange(ex, "direct", { durable: true });
       
          ch.publish(ex, key, new Buffer(msg));
        });

      setTimeout(function() {
        conn.close();
        process.exit(0);
      }, 100);
    });
  }
  async static msg(queue) {
    var amqp = require("amqplib/callback_api");

    amqp.connect("amqp://rabbitmq:rabbitmq@rabbitmq:5672", (err, conn)=> {
      conn.createChannel((err, ch) =>{
        var q = "getcaptcha";

        ch.assertQueue(queue, { durable: false,autoDelete: true });
        ch.prefetch(1);
        ch.consume( queue,(msg) =>{
            Redis.set(msg.content.toString())
            
        },
          { noAck: true }
        );
      });
    });
  }
}

module.exports = RabbitmqController;
