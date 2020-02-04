'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProxySchema extends Schema {
  up () {
    this.create('proxies', (table) => {
      table.increments()
      table.string('proxy', 60)
      table.timestamps()
    })
  }

  down () {
    this.drop('proxies')
  }
}

module.exports = ProxySchema
