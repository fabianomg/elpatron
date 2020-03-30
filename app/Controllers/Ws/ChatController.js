'use strict'

class ChatController {
  constructor({ socket, request, socket: { channel: { subscriptions } } }) {
    this.socket = socket
    this.request = request
    var iterator1 = (subscriptions.get('users:'))
    iterator1.forEach(function (value, key) {
      console.log(value.id)
    })
    this.socket.broadcastToAll('message', 'hello everyone!')
  }
  async onMessage() {
   
  }
}

module.exports = ChatController
