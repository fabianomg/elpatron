'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProxySchema extends Schema {
  up () {
    this.create('proxies', (table) => {
      table.increments()
      table.string('user', 200)
      table.string('password', 200)
      table.string('proxy', 200)
      table.timestamps()
    })
  }

  down () {
    this.drop('proxies')
  }
}

module.exports = ProxySchema
