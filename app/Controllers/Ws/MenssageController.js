'use strict'
const Queue = require('../../libs/queue')
class ChatController {
    /*
    constructor({ socket, request, socket: { channel: { subscriptions } } }) {
        this.socket = socket
        this.request = request
        var iterator1 = (subscriptions.get('online'))
        iterator1.forEach(function (value, key) {
            console.log(value.id)
        })
        this.socket.broadcastToAll('message', 'hello everyone!')
    }*/
    async onMessage({ auth }) {
        Queue.consume(false, auth.user.id + '#' + auth.user.username, async (message) => {


        })
    }
}

module.exports = ChatController
