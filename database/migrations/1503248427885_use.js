'use strict'

const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', table => {
      table.increments()
      table.string('username', 80).notNullable().unique()
      table.string('fullname', 1000).notNullable()
      table.string('password', 60).notNullable()
      table.string('balance', 60).notNullable()
      table.string('start', 60).notNullable()
      table.string('end', 60).notNullable()
     // table.string('confirmation_token')
      table.boolean('level').defaultTo(2)
      table.boolean('active').defaultTo(1)
     
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
