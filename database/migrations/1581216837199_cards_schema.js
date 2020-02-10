'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CardsSchema extends Schema {
  up () {
    this.create('cards', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.string('n', 250)
      table.string('m', 50)
      table.string('a', 10)
      table.string('v', 10)
      table.boolean('is_valid').defaultTo(false)
      table.boolean('is_tested').defaultTo(false)
      table.boolean('is_declined').defaultTo(false)
      table.timestamps()
    })
  }

  down () {
    this.drop('cards')
  }
}

module.exports = CardsSchema
