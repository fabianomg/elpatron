'use strict'


const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .wsServer() // boot the WebSocket serve
  .fireHttpServer()
  .catch(console.error)
