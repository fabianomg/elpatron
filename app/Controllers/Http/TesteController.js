"use strict";

var amqp = require("amqplib/callback_api");
const Axios = require("axios");
const Redis = use("Redis");
const User = use('App/Models/User')
let cont = 0;
class TesteController {
  async getcaptcha() {
    amqp.connect("amqp://rabbitmq:rabbitmq@rabbitmq:5672", function(err, conn) {
      conn.createChannel(function(err, ch) {
        var ex = "captcha";
        var msg = "Hello World!";

        ch.assertExchange(ex, "direct", { durable: true });
        let t = 0;
        let time = setInterval(() => {
          t++;
          ch.publish(ex, "get", new Buffer(msg));
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
  async sendcaptcha() {
    var amqp = require("amqplib/callback_api");

    amqp.connect("amqp://rabbitmq:rabbitmq@rabbitmq:5672", function(err, conn) {
      conn.createChannel(function(err, ch) {
        var q = "getcaptcha";

        ch.assertQueue(q, { durable: false, autoDelete: true });
        ch.prefetch(1);
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
        ch.consume(
          q,
          function(msg) {
            console.log(" [x] Received %s", msg.content.toString());
          },
          { noAck: true }
        );
      });
    });
  }
  async teste({auth,response}) {
    const user = await User.find(1)

   let tokenn = await auth.authenticator('jwt').generate(user)
return response.json(tokenn)


    const token = {
      id: "557",
      redis: false,
      googlekey: "6Ld4hsgUAAAAACpJsfH-QTkIIcs0NAUE1VzDZ8Xq",
      pageurl: "https://amarithcafe.revelup.com",
      site: {
        name: "twocaptcha",
        api: "490024e2bf9bada1a4a07336a886a092"
      }
    };
    await Axios.post(
      `http://captcha:3331/getToken`,
      token,
      { timeout: 90 },
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0",
          Accept: "application/json"
        }
      }
    )
      .then(response => {
        console.log(response.data);
      })
      .catch(err => {
        cont++;
        let e = err.message.indexOf("exceeded");

        if (e != -1 && cont <= 1) {
          this.teste();
          console.log("teste");
        } else {
          console.log(err.message);
        }
      });
  }
}

module.exports = TesteController;
