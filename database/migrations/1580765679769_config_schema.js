'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ConfigSchema extends Schema {
  up () {
    this.create('configs', (table) => {
      table.increments()
      table.string('creditos', 200)
      table.string('dias', 200)
      table.timestamps()
    })
  }

  down () {
    this.drop('configs')
  }
}

module.exports = ConfigSchema
