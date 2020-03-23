'use strict'

const Ws = use('Ws')
const User = use('App/Models/User')
Ws.channel('online', 'ChatController')
Ws.channel('user:*', 'MenssageController')
Ws.channel('status:*', ({ socket,auth }) => {})
