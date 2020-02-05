'use strict'
const C = require('../../class/GetCaptcha.class');
const ID = require('./VadateCardController');
const User = use('App/Models/User')
class BotController {
    async start({ auth }) {
       
        const validator = new ID()
        const c = new C();
        const resultCaptcha = await c.GetCaptcha(auth.user.id);
        const resultValidator = await validator.GetId(auth.user.id);
        return resultValidator
    }
}

module.exports = BotController
