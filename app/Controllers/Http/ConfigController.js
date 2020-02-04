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
    let r = request.input('creditos')

    let creditos = r.split(',')
    try {

      for (let index = 0; index < creditos.length; index++) {
        let c = await Config.query()
          .where('creditos', creditos[index])
          .first()
        //console.log(c)
        //return
        if (!c || c == null) {
          const config = await Config.create({
            creditos: creditos[index],

          })
        }


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
    return response.redirect('back')
  }
  async cadCaptcha({ request, session, response }) {
    let c = await Captcha.query()
      .where('name', 'twocaptcha')
      .first()
    let d = await Captcha.query()
      .where('name', 'deathbycaptcha')
      .first()
    let campos = request.all();
    let twocaptcha = campos.twocaptcha;
    let deathbycaptcha = campos.deathbycaptcha;

    try {
      if (!c || c == null && request.input('twocaptcha') != undefined) {

        const captcha = await Captcha.create({
          name: campos.twocaptcha,
          api: campos.apikey,
          active: 1
        })

      }
      if (!d || d == null && request.input('deathbycaptcha') != undefined) {

        const captcha = await Captcha.create({
          name: campos.deathbycaptcha,
          login: campos.userdea,
          password: campos.passworddea,
          active: 1
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
    return response.redirect('back')
  }
  async cadProxy({ request, session, response }) {

    try {
      const p = await Proxy.create({
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
