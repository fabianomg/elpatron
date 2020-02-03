'use strict'

const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', table => {
      table.increments()
      table.string('username', 80).notNullable().unique()
      table.string('fullname', 80).notNullable()
      table.string('password', 60).notNullable()
      table.number('balance', 60).notNullable()
      table.date('start', 60).notNullable()
      table.date('end', 60).notNullable()
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
