'use strict'
const Ws = use('Ws')
const Queue = require('./queue')
const User = use('App/Models/User')
const Database = use('Database')

module.exports = {
    async listentoqueues(id) {
        Queue.consume('atividades', (message) => {
            try {

                let resultado = JSON.parse(message.content.toString())
                console.log(resultado)
                const Topic = Ws.getChannel('users:*').topic('users:' + resultado.id)
                if (Topic) {
                    Topic.broadcastToAll('atividade', resultado.msg)
                }

            } catch (error) {
                console.log(error.message)
            }
        });
    }



}