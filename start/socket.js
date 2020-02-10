'use strict'

const Ws = use('Ws')
const User = use('App/Models/User')
Ws.channel('online', 'ChatController')
Ws.channel('status:*', ({ socket,auth }) => {})
