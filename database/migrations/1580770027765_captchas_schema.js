'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CaptchasSchema extends Schema {
  up () {
    this.create('captchas', (table) => {
      table.increments()
      table.string('name', 60)
      table.string('api', 60)
      table.string('login', 60)
      table.string('password', 60)
      table.boolean('active', 60)
      table.timestamps()
    })
  }

  down () {
    this.drop('captchas')
  }
}

module.exports = CaptchasSchema
