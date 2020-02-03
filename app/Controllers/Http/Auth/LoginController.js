'use strict'

const User = use('App/Models/User')
const Hash = use('Hash')

class LoginController {
  showLoginForm({ view }) {
    return view.render('auth.login')
  }

  async login({ request, auth, session, response }) {
    // get form data
    const { username, password, remember } = request.all()

    // retrieve user base on the form data
    const user = await User.query()
      .where('username', username)
      .first()
   
    if (user) {
      // verify password
      const passwordVerified = await Hash.verify(password, user.password)

      if (passwordVerified) {
        if (user.level == 1) {
          await auth.remember(!!remember).login(user)
          return response.route('/admin')
        }
        if (user.level == 2) {
          await auth.remember(!!remember).login(user)
          return response.route('/')
        }

      }
    }

    // display error message
    session.flash({
      notification: {
        type: 'danger',
        message: `Não foi possível verificar suas credenciais. Verifique seu username e sua senha.`
      }
    })

    return response.redirect('back')
  }
}

module.exports = LoginController
