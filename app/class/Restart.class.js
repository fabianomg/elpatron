'use strict'
const Ws = use("Ws");
const C = require('./GetCaptcha.class');
const ID = require('../Controllers/Http/VadateCardController');
class Restart {
      restart(user_id) {

        const c = new C();
        const resultCaptcha =  c.GetCaptcha(user_id);

        const validator = new ID()
        const resultValidator =  validator.GetId(user_id);
        return resultValidatorcs

    }

}
module.exports = Restart;