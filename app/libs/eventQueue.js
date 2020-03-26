'use strict'
const Ws = use('Ws')
const Queue = require('./queue')

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
      
    }

}