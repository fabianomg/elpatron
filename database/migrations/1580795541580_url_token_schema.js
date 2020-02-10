'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UrlTokenSchema extends Schema {
  up () {
    this.create('url_tokens', (table) => {
      table.increments()
      table.string('link_url', 250)
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.string('token_recaptcha', 3000)
      table.string('erro_token', 1000)
      table.boolean('is_restart').defaultTo(false)
     
      table.timestamps()
    })
  }

  down () {
    this.drop('url_tokens')
  }
}

module.exports = UrlTokenSchema
