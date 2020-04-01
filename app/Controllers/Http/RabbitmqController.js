"use strict";
const amqp = require("amqplib");
const amqp = require("amqplib/callback_api");

class RabbitmqController {
  connect() {
    return require("amqplib")
      .connect("amqp://rabbitmq:rabbitmq@rabbitmq:5672")
      .then(conn => conn.createChannel());
  }
  createQueue(expired, channel, queue) {
    return new Promise((resolve, reject) => {
      try {
        if (expired) {
          channel.assertQueue(queue, {
            durable: false,
            autoDelete: true,
            expires: 90000
          });
        } else {
          channel.assertQueue(queue, {
            durable: false,
            autoDelete: true
          });
        }

        resolve(channel);
      } catch (err) {
        reject(err);
      }
    });
  }

  sendToQueue(expired = "true", queue, message) {
    connect()
      .then(channel => createQueue(expired, channel, queue))
      .then(channel =>
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)))
      )
      .catch(err => console.log(err));
  }

  consume(expired = "true", queue, callback) {
    connect()
      .then(channel => createQueue(expired, channel, queue))
      .then(channel => channel.consume(queue, callback, { noAck: true }))
      .catch(err => console.log(err));
  }
}

module.exports = RabbitmqController;
