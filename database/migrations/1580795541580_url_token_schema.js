'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UrlTokenSchema extends Schema {
  up () {
    this.create('url_tokens', (table) => {
      table.increments()
      table.string('url_id', 250)
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.string('token_recaptcha', 3000)
      table.string('state', 5000)
      table.string('generaton', 5000)
      table.string('validaton', 5000)
      table.timestamps()
    })
  }

  down () {
    this.drop('url_tokens')
  }
}

module.exports = UrlTokenSchema
