'use strict'

const User = use('App/Models/User')
const Hash = use('Hash')
const Database = use('Database')
class LoginController {
  async showLoginForm({ auth, view, response }) {


    try {
      let logado = await auth.check()
      if (logado) {

        const user = await User.query()
          .where('username', auth.user.username)
          .first()

        if (user.level == 1) {

          return response.route('/admin')
        }
        if (user.level == 2) {

          return response.route('/')
        }
      }
    } catch (error) {
      return view.render('auth.login')
    }

  }

  async login({ request, auth, session, response }) {


    // get form data
    const { username, password, remember } = request.all()

    // retrieve user base on the form data
    const user = await User.query()
      .where('username', username)
      .first()
    let captcha = await Database
      .table('captchas')
      .select('*')

    if (captcha == '' && user.level == 2) {
      session.flash({
        notification: {
          type: 'warning',
          message: ` Sistema temporariamente indisponível, por favor entre em contato com o administrador.`
        }
      })
      return response.redirect('back')
    }
    if (user) {

      if (!user.active) {
        session.flash({
          notification: {
            type: 'warning',
            message: `${user.username} Você não está ativo ou está sem créditos por favor  entre em contato com o administrador.`
          }
        })
        return response.redirect('back')
      }
    }

    //const safePassword = await Hash.make('123')
    //console.log(safePassword)

    if (user) {
      // verify password
      const passwordVerified = await Hash.verify(password, user.password)

      if (passwordVerified) {
        try {
          await auth.check()
          if (user.level == 1) {
            //await auth.remember(!!remember).login(user)
            return response.route('/admin')
          }

        } catch (error) {
          if (user.level == 1) {
            await auth.remember(!!remember).login(user)
            return response.route('/admin')
          }
        }
        try {
          await auth.check()
          if (user.level == 2) {
            //await auth.remember(!!remember).login(user)
            return response.route('/')
          }

        } catch (error) {
          if (user.level == 2) {
            await auth.remember(!!remember).login(user)
            return response.route('/')
          }
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
