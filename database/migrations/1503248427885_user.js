'use strict'

const Schema = use('Schema')

class UserSchema extends Schema {
  up() {
    this.create('users', table => {
      table.increments()
      table.string('username', 80).notNullable().unique()
      table.string('fullname', 100)
      table.string('password', 60)
      table.string('balance', 60)
      table.string('start', 60)
      table.string('end', 60)
      table.boolean('level').defaultTo(2)
      table.boolean('active').defaultTo(1)
      table.timestamps()

    })
  }

  down() {
    this.drop('users')
  }
}

module.exports = UserSchema
