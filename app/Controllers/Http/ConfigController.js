'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const Database = use('Database')
const Config = use('App/Models/Config')
const Captcha = use('App/Models/Captcha')
const Proxy = use('App/Models/Proxy')
class ConfigController {
  /**
   * Show a list of all configs.
   * GET configs
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, response, view }) {
  }

  /**
   * Render a form to be used for creating a new config.
   * GET configs/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create({ request, response, view }) {


  }

  /**
   * Create/save a new config.
   * POST configs
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, session, response }) {
    let dias = request.input('dias');
    let diasExpira = request.input('diasexpira');
    let creditos = request.input('creditos');
    let creditosExpira = request.input('creditosexpira');

    if (dias && diasExpira) {

      try {

        let consult;
        (dias == 1) ? consult = dias + " dia expira em " + diasExpira + "h" : consult = dias + " dias expira em " + diasExpira + "h";

        let d = await Config.query()
          .where('dias', consult)
          .first()

        if (!d || d == null) {
          await Config.create({
            dias: consult,

          })
        }
        session.flash({
          notification: {
            type: 'success',
            message: `Cadastro Realizado com sucesso!.`
          }
        })

      } catch (error) {
        session.flash({
          notification: {
            type: 'danger',
            message: `Cadastro não realizado...` + error
          }
        })
      }
    }

    if (creditos && creditosExpira) {

      try {

        let consult = creditos + " creditos expira em " + creditosExpira + " dias"
        let c = await Config.query()
          .where('creditos', consult)
          .first()

        if (!c || c == null) {
          await Config.create({
            creditos: consult,

          })
        }

        session.flash({
          notification: {
            type: 'success',
            message: `Cadastro Realizado com sucesso!.`
          }
        })

      } catch (error) {
        session.flash({
          notification: {
            type: 'danger',
            message: `Cadastro não realizado...` + error
          }
        })
      }
    }
    return response.redirect('back')
  }
  async cadCaptcha({ request, session, response }) {
    let captcha = request.input('captcha');

    let campos = request.all();
    let deathbycaptchaActive = campos.deathbycaptchaActive
    let twocaptchaActive = campos.twocaptchaActive
    if (twocaptchaActive == null && deathbycaptchaActive == null) {
      session.flash({
        notification: {
          type: 'warning',
          message: `Os dados não foram cadastrados, selecione o site que ficará ativo`
        }
      })
      return response.redirect('back')
    }

    try {

      if (captcha == 2 && campos.user && campos.password) {
        let Deathbycaptcha = await Captcha.query()
          .where('name', 'deathbycaptcha')
          .first()
        if (!Deathbycaptcha) {
          await Captcha.create({
            name: 'deathbycaptcha',
            login: campos.user,
            password: campos.password,
            active: 1
          })
          session.flash({
            notification: {
              type: 'success',
              message: `Username e Password do Deathbycaptcha cadastrados com sucesso!.`
            }
          })
        } else {
          session.flash({
            notification: {
              type: 'warning',
              message: `Já existe dados cadastrados para o Deathbycaptcha.`
            }
          })
        }
      }
      console.log(campos.twocaptchaActive)
      if (captcha == 1 && campos.apikey) {
        let twoCaptcha = await Captcha.query()
          .where('name', 'twocaptcha')
          .first()
        if (!twoCaptcha) {
          await Captcha.create({
            name: 'twocaptcha',
            api: campos.apikey,
            active: 1
          })
          session.flash({
            notification: {
              type: 'success',
              message: `API 2captcha cadastrada com sucesso!.`
            }
          })
        } else {
          session.flash({
            notification: {
              type: 'warning',
              message: `Já existe dados cadastrados para o 2captcha.`
            }
          })
        }
      }

    } catch (error) {
      session.flash({
        notification: {
          type: 'danger',
          message: `Cadastro não realizado...` + error
        }
      })
    }


    return response.redirect('back')
  }
  async cadProxy({ request, session, response }) {

    try {
      const p = await Proxy.create({
        user: request.input('user'),
        password: request.input('password'),
        proxy: request.input('proxy'),
      })
      session.flash({
        notification: {
          type: 'success',
          message: `Cadastro Realizado com sucesso!.`
        }
      })

    } catch (error) {
      session.flash({
        notification: {
          type: 'danger',
          message: `Cadastro não realizado...` + error
        }
      })
    }
    return response.redirect('back')
  }


  /**
   * Display a single config.
   * GET configs/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing config.
   * GET configs/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit({ params, request, response, view }) {
  }

  /**
   * Update config details.
   * PUT or PATCH configs/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {
  }

  /**
   * Delete a config with id.
   * DELETE configs/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {
  }
}

module.exports = ConfigController
