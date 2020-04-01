"use strict";

const rabbit = require("../../libs/rabbitmq");
var amqp = require("amqplib/callback_api");
class TesteController {
  async rabbit() {
    amqp.connect("amqp://rabbitmq:rabbitmq@rabbitmq:5672", function(err, conn) {
      conn.createChannel(function(err, ch) {
        var ex = "captcha";
        var msg = "Hello World!";

        ch.assertExchange(ex, "direct", { durable: true });
        let t = 0;
        let time = setInterval(() => {
          t++;
          ch.publish(ex, "get", new Buffer(msg ));
          if (t == 500) {
            clearInterval(time);
          }
        }, 2);
      });

      setTimeout(function() {
        conn.close();
        process.exit(0);
      }, 100);
    });
  }
  async getmsg(){
    var amqp = require('amqplib/callback_api');

    amqp.connect('amqp://rabbitmq:rabbitmq@rabbitmq:5672', function (err, conn) {
        conn.createChannel(function (err, ch) {
            var q = 'getcaptcha';
    
            ch.assertQueue(q, { durable: true });
            ch.prefetch(1);
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
            ch.consume(q, function (msg) {
                console.log(" [x] Received %s", msg.content.toString());
            }, { noAck: true });
        });
    });
  }
}

module.exports = TesteController;
