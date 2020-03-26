'use strict'
const Ws = use('Ws')
const Queue = require('./queue')
const User = use('App/Models/User')
const Database = use('Database')

module.exports = {
    async listentoqueues(id) {
        Queue.consume(false, '#' + id + 'total', async (message) => {
            let msg = await JSON.parse(message.content.toString());
            const Topic = await Ws.getChannel('users:*').topic('users:' + id)
            if (Topic) {
                await Topic.broadcastToAll('total', msg)
            }
        })
        Queue.consume(false, '#' + id + 'status', async (message) => {
            let msg = await JSON.parse(message.content.toString());
            const Topic = await Ws.getChannel('users:*').topic('users:' + id)
            if (Topic) {
                await Topic.broadcastToAll('status', msg)
            }
        })
        Queue.consume(false, '#' + id + 'atividade', async (message) => {
            let msg = await JSON.parse(message.content.toString());
            const Topic = await Ws.getChannel('users:*').topic('users:' + id)

            if (Topic) {
                await Topic.broadcastToAll('atividade', msg)
            }
        })
        Queue.consume(false, '#' + id + 'aprovados', async (message) => {
            let msg = await JSON.parse(message.content.toString());
            const Topic = await Ws.getChannel('users:*').topic('users:' + id)

            if (Topic) {
                await Topic.broadcastToAll('aprovados', msg)
            }
            let balance2;
            const credd = await User.find(id)
            let cr = credd.balance.split(' ')
            let h = credd.balance.indexOf('h')
            if (h == -1) {
                let saldo = parseInt(cr[0]) - 1
                balance2 = saldo + ' ' + cr[1] + ' ' + cr[2] + ' ' + cr[3] + ' ' + cr[4] + ' ' + cr[5]

                await Database
                    .table('users')
                    .where('id', id)
                    .update({ balance: balance2 })
            }
            if (Topic) {
                await Topic.broadcastToAll('saldo', balance2 )
            }

        })
        Queue.consume(false, '#' + id + 'testados', async (message) => {
            let msg = await JSON.parse(message.content.toString());
            const Topic = await Ws.getChannel('users:*').topic('users:' + id)

            if (Topic) {
                await Topic.broadcastToAll('testados', msg)
            }
        })
        Queue.consume(false, '#' + id + 'reprovados', async (message) => {
            let msg = await JSON.parse(message.content.toString());
            const Topic = await Ws.getChannel('users:*').topic('users:' + id)

            if (Topic) {
                await Topic.broadcastToAll('reprovados', msg)
            }
        })
        Queue.consume(false, '#' + id + 'carregados', async (message) => {
            let msg = await JSON.parse(message.content.toString());
            const Topic = await Ws.getChannel('users:*').topic('users:' + id)

            if (Topic) {
                await Topic.broadcastToAll('carregados', msg)
            }
        })
        Queue.consume(false, '#' + id + 'duplicados', async (message) => {
            let msg = await JSON.parse(message.content.toString());
            const Topic = await Ws.getChannel('users:*').topic('users:' + id)

            if (Topic) {
                await Topic.broadcastToAll('duplicados', msg)
            }
        })
        Queue.consume(false, '#' + id + 'listaprovados', async (message) => {
            let msg = await JSON.parse(message.content.toString());
            const Topic = await Ws.getChannel('users:*').topic('users:' + id)

            if (Topic) {
                await Topic.broadcastToAll('listaprovados', msg)
            }
        })
        Queue.consume(false, '#' + id + 'listreprovados', async (message) => {
            let msg = await JSON.parse(message.content.toString());
            const Topic = await Ws.getChannel('users:*').topic('users:' + id)

            if (Topic) {
                await Topic.broadcastToAll('listreprovados', msg)
            }
        })

    }

}