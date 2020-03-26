'use strict'

class UserController {
  constructor({ socket, request }) {
    this.socket = socket
    this.request = request
  }

  onUsers(id) {

    this.socket.broadcastToAll('message', id)

  }

  onMessage(message) {
    this.socket.broadcastToAll('message', message)
  }
  onClose() {
    // same as: socket.on('close')
  }

  onError() {
    // same as: socket.on('error')
  }
}

module.exports = UserController
