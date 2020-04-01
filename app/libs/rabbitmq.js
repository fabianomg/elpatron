var amqp = require("amqplib/callback_api");
module.exports = {
  send() {
    return require("amqplib")
      .connect("amqp://rabbitmq:rabbitmq@rabbitmq:5672")
      .then(conn =>
        conn.createChannel(function(err, ch) {
          var ex = "captcha";
          var msg = "Hello World!";

          ch.assertExchange(ex, "direct", { durable: false });
          ch.publish(ex, "", new Buffer(msg));
          console.log(" [x] Sent %s", msg);
        })
      );
  }
};
