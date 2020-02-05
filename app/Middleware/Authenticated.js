'use strict'

class Authenticated {
  async handle ({ request, auth, response }, next) {
    try {
      await auth.check()

      return response.route('/')
    } catch (error) {
      await next()
    }
  }
}

module.exports = Authenticated
